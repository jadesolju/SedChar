import { NextRequest, NextResponse } from 'next/server';
import type { ThaiMasterCharacter } from '@/shared/types';
import { DEFAULT_CHARACTER } from '@/shared/types';
import { verifyServerQuotaAndRateLimit, validateInputPayload } from '@/lib/aiServerGuard';
import { logAITelemetry, estimateTokenCount } from '@/lib/telemetry';

function safeExtractJson(raw: string): any {
  let text = raw.trim();
  text = text.replace(/^\`\`\`json\s*/i, '').replace(/^\`\`\`\s*/i, '').replace(/\s*\`\`\`$/i, '').trim();
  try { return JSON.parse(text); } catch {}
  const s = text.indexOf('{');
  const e = text.lastIndexOf('}');
  if (s !== -1 && e > s) {
    try { return JSON.parse(text.slice(s, e + 1)); } catch {}
  }
  throw new Error('Cannot parse LLM JSON output');
}

function normalizeString(val: any): string {
  if (!val) return '';
  if (Array.isArray(val)) return val.filter(Boolean).join('\n');
  const str = String(val).trim();
  if (
    str === '-' ||
    str === '—' ||
    str === 'N/A' ||
    str === 'n/a' ||
    str === 'ไม่มี' ||
    str === 'ไม่ได้ระบุ' ||
    str === 'null' ||
    str === 'undefined' ||
    str === 'None' ||
    str === 'none' ||
    str === '- ไม่ได้ระบุ'
  ) {
    return '';
  }
  return str;
}

function normalizeArray(val: any): string[] {
  if (!val) return [];
  let arr: string[] = [];
  if (Array.isArray(val)) {
    arr = val.map(String);
  } else if (typeof val === 'string') {
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) arr = parsed.map(String);
      else arr = val.split(/[,\n|;]/);
    } catch {
      arr = val.split(/[,\n|;]/);
    }
  }
  return arr
    .map(s => s.trim().replace(/^[-*•]\s*/, ''))
    .filter(s => {
      const clean = s.trim();
      return (
        clean &&
        clean !== '-' &&
        clean !== '—' &&
        clean !== 'N/A' &&
        clean !== 'n/a' &&
        clean !== 'ไม่มี' &&
        clean !== 'ไม่ได้ระบุ' &&
        clean !== 'null' &&
        clean !== '- ไม่ได้ระบุ'
      );
    });
}

function isEmptyValue(val: any): boolean {
  if (val === undefined || val === null) return true;
  if (typeof val === 'string') {
    const trimmed = val.trim();
    return (
      trimmed === '' ||
      trimmed === '-' ||
      trimmed === '—' ||
      trimmed === 'N/A' ||
      trimmed === 'n/a' ||
      trimmed === 'ไม่มี' ||
      trimmed === 'ไม่ได้ระบุ' ||
      trimmed === 'null' ||
      trimmed === 'undefined' ||
      trimmed === '- ไม่ได้ระบุ'
    );
  }
  if (Array.isArray(val)) return val.length === 0;
  return false;
}

const PRIMARY_GEMINI_MODEL = 'gemini-3.5-flash-lite';
const FALLBACK_OPENROUTER_MODEL = 'google/gemini-3.5-flash-lite';
const SECONDARY_FALLBACK_MODEL = 'openai/gpt-4o-mini';

async function callDirectGeminiSingle(apiKey: string, prompt: string, model: string = PRIMARY_GEMINI_MODEL, timeoutMs: number = 25000): Promise<{ text: string; model: string }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const cleanModel = model.replace(/^google\//, '').replace(/^direct:/, '');
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${cleanModel}:generateContent?key=${apiKey}`;
    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.35,
          topP: 0.92,
          topK: 40,
        },
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini HTTP ${response.status}: ${errText.slice(0, 150)}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('Gemini empty output');
    return { text, model: `direct:${cleanModel}` };
  } finally {
    clearTimeout(timer);
  }
}

async function callOpenRouterSingle(apiKey: string, prompt: string, model: string = FALLBACK_OPENROUTER_MODEL, timeoutMs: number = 25000): Promise<{ text: string; model: string }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://sedchar.vercel.app',
        'X-Title': 'SedChar Studio'
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content: 'You are an elite Thai Character AI Enhancer. You MUST respond with ONLY valid JSON strictly matching the requested format. Do not include markdown code block formatting or explanations.'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.35,
        response_format: { type: 'json_object' }
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`OpenRouter HTTP ${response.status}: ${errText.slice(0, 150)}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content;
    if (!text || !text.trim()) throw new Error('OpenRouter empty output');
    return { text, model: `openrouter:${model}` };
  } finally {
    clearTimeout(timer);
  }
}

const CATEGORY_FIELD_MAP: Record<string, (keyof ThaiMasterCharacter)[]> = {
  basic: ['nickname', 'fullName', 'age', 'gender', 'status', 'birthdate', 'weightHeight', 'mbti', 'sexualOrientation', 'visualTags', 'personalityTags', 'flagType'],
  appearance: ['occupation', 'wealthStatus', 'fashionStyle', 'car', 'perfume', 'address', 'appearanceDesc', 'visualFeatures'],
  personality: ['coreTraits', 'likes', 'dislikes', 'generalBehaviors', 'userExclusiveBehaviors'],
  psychology: ['mindset', 'coreBelief', 'perception', 'expression', 'behaviorUnderEmotion', 'emotionalTriggers', 'flawsWeaknesses'],
  relationship: ['userStoryRole', 'initialRelationship', 'userAttitude', 'relationshipBackstory'],
  gimmicks: ['absoluteAntiBehaviors', 'hiddenSoftSide', 'darkSide'],
  nsfw: ['nsfwMaleSize', 'nsfwFemaleChest', 'nsfwFemaleVagina', 'sexualStyle', 'kinksPreferences', 'aftercareStyle'],
  dialogue: ['openGreetingNarrative', 'openGreetingDialogue', 'fullGreeting', 'plotSummary', 'shortIntro', 'punchline', 'momentIntro', 'dailyRoutine', 'toneSetting'],
  system: ['systemRules', 'subCharRules', 'subCharAllowed', 'categoryTags'],
  subchars: ['supportingCharacters', 'locations'],
};

const JSON_SCHEMA_TEMPLATE = `{
  "nickname": "string (ชื่อเล่น)",
  "fullName": "string (ชื่อจริง / ฉายา)",
  "age": "string (เช่น 22 ปี)",
  "gender": "string (เช่น ชาย, หญิง)",
  "status": "string (สถานะความสัมพันธ์ เช่น โสด)",
  "birthdate": "string (วันเกิดและราศี เช่น 8 สิงหาคม (ราศีสิงห์))",
  "weightHeight": "string (เช่น 195 ซม. / 82 กก.)",
  "mbti": "string (เช่น ISTP-A)",
  "sexualOrientation": "string (เช่น Heterosexual / Pansexual)",
  "car": "string (รถ ยานพาหนะ)",
  "perfume": "string (กลิ่นน้ำหอม กลิ่นตัว หรือกลิ่นเฉพาะตัว)",
  "address": "string (ที่อยู่อาศัย ที่พัก)",
  "wealthStatus": "string (ฐานะทางการเงิน)",
  "occupation": "string (อาชีพ บทบาทหน้าที่)",
  "fashionStyle": "string (สไตล์การแต่งตัว เสื้อผ้าประจำ)",
  "appearanceDesc": "string (รูปลักษณ์ภายนอก หน้าตา ทรงผม ผิวพรรณ)",
  "visualFeatures": "string (จุดเด่นทางกายภาพ เช่น รอยสัก แผลเป็น แววตา)",
  "visualTags": ["string"],
  "nsfwMaleSize": "string (เช่น 56 / 7.5 นิ้ว)",
  "nsfwFemaleChest": "string (เช่น คัพ D 34 นิ้ว)",
  "nsfwFemaleVagina": "string (เช่น ขาวอมชมพู สะอาด มีกลิ่นหอมอ่อนๆ)",
  "coreTraits": "string (บุคลิกหลัก อุปนิสัย)",
  "personalityTags": ["string"],
  "likes": ["string"],
  "dislikes": ["string"],
  "generalBehaviors": "string (พฤติกรรมทั่วไป คำพูดติดปาก)",
  "userExclusiveBehaviors": "string (พฤติกรรมเฉพาะเมื่ออยู่กับ User)",
  "mindset": "string (กรอบความคิด ปรัชญา)",
  "coreBelief": "string (ความเชื่อหลัก)",
  "perception": "string (มุมมองต่อโลกและผู้คน)",
  "expression": "string (การแสดงออกทางสีหน้าและสายตา)",
  "behaviorUnderEmotion": "string (พฤติกรรมเวลาโกรธ เขิน เสียใจ)",
  "emotionalTriggers": "string (จุดกระตุ้นอารมณ์ จุดเดือด)",
  "flawsWeaknesses": "string (จุดอ่อน ปมในใจ ข้อเสีย)",
  "userStoryRole": "string (บทบาทของ User ในความสัมพันธ์)",
  "initialRelationship": "string (ความสัมพันธ์เริ่มต้น)",
  "userAttitude": "string (ทัศนคติที่มีต่อ User)",
  "relationshipBackstory": "string (ปมเบื้องหลังความสัมพันธ์)",
  "absoluteAntiBehaviors": "string (พฤติกรรมที่ไม่มีวันทำเด็ดขาด)",
  "hiddenSoftSide": "string (มุมอ่อนโยนที่ซ่อนไว้)",
  "darkSide": "string (ด้านมืด มุมลับอันตราย)",
  "sexualStyle": "string (สไตล์และแนวทางบนเตียง)",
  "kinksPreferences": "string (รสนิยมจำเพาะ)",
  "aftercareStyle": "string (การดูแลหลังกิจกรรม)",
  "openGreetingNarrative": "string (บทบรรยายฉากเปิด)",
  "openGreetingDialogue": "string (บทสนทนาแรก)",
  "fullGreeting": "string (ฉากเปิดเต็มพร้อมบทบรรยาย)",
  "plotSummary": "string (พล็อตเรื่องย่อ)",
  "shortIntro": "string (คำโปรยสั้น)",
  "punchline": "string (ประโยคเด็ด / คำคม)",
  "momentIntro": "string (ฉากช่วงเวลาสำคัญ)",
  "dailyRoutine": "string (กิจวัตรประจำวัน)",
  "toneSetting": "string (โทนเรื่องและฉากหลัง)",
  "systemRules": ["string"],
  "subCharRules": "string",
  "subCharAllowed": "string",
  "categoryTags": ["string"],
  "supportingCharacters": [
    {
      "id": "string",
      "name": "string",
      "gender": "string",
      "age": "string",
      "personality": "string",
      "relationship": "string",
      "mainRole": "string",
      "appearWhen": "string"
    }
  ],
  "locations": [
    {
      "id": "string",
      "name": "string",
      "prompt": "string"
    }
  ]
}`;

const ENHANCE_SYSTEM_PROMPT = `You are SedChar-Enhancer v3.5, an elite Thai AI Roleplay Character Designer.

## TASK & STRICT ENHANCEMENT RULES:
1. PRESERVE every existing non-empty field exactly as written by the user. NEVER overwrite, erase, or contradict existing user data.
2. ENRICH and populate empty/unfilled fields with vivid, creative, imaginative, in-character Thai prose strictly adhering to the character persona.
3. NEVER return '-' or '—' or 'N/A' or 'ไม่มี' or 'ไม่ได้ระบุ' as values. Always fill them with meaningful roleplay content.
4. The character identity is strictly locked. NEVER invent a new character name (NEVER generate random names like "น้ำเหนือ" or "กวินทร์").
5. Return ONLY valid JSON strictly matching the keys in the schema template below.

## REQUIRED JSON SCHEMA TEMPLATE:
${JSON_SCHEMA_TEMPLATE}
`;

// Helper to get field value with case and alias tolerance
function getFieldVal(json: any, ...keys: string[]): any {
  for (const k of keys) {
    if (json[k] !== undefined && json[k] !== null && json[k] !== '') {
      return json[k];
    }
  }
  return '';
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  let requestedModel = 'auto';

  try {
    const guard = await verifyServerQuotaAndRateLimit(req);
    if (!guard.allowed) {
      return NextResponse.json({ error: guard.error || 'Too many requests' }, { status: guard.statusCode || 429 });
    }

    const { character, instructions, model, selectedCategories, onlyEmptyFields, activeSubCharIds } = await req.json();
    requestedModel = model || 'auto';

    if (!character || typeof character !== 'object') {
      return NextResponse.json({ error: 'Missing character object' }, { status: 400 });
    }

    const sizeCheck = validateInputPayload(character, 25000);
    if (!sizeCheck.valid) {
      return NextResponse.json({ error: sizeCheck.error }, { status: 400 });
    }

    let scopedCharacter: any = { ...character };

    // Filter sub-characters if activeSubCharIds specified
    if (Array.isArray(activeSubCharIds) && Array.isArray(character.supportingCharacters)) {
      scopedCharacter.supportingCharacters = character.supportingCharacters.filter(
        (sc: any) => activeSubCharIds.includes(sc.id)
      );
    }

    // Build strict allowed keys whitelist
    const allowedKeys = new Set<string>();
    const isSelective = Array.isArray(selectedCategories) && selectedCategories.length > 0 && selectedCategories.length < 10;
    
    if (isSelective) {
      selectedCategories.forEach(cat => {
        const fields = CATEGORY_FIELD_MAP[cat];
        if (fields) fields.forEach(f => allowedKeys.add(f));
      });
      // Contextual read-only keys for coherent prompt generation
      ['nickname', 'fullName', 'age', 'gender', 'occupation', 'coreTraits', 'initialRelationship'].forEach(k => allowedKeys.add(k));

      const filtered: any = {};
      Object.keys(scopedCharacter).forEach(k => {
        if (allowedKeys.has(k)) {
          filtered[k] = scopedCharacter[k];
        }
      });
      scopedCharacter = filtered;
    } else {
      // All categories allowed
      Object.values(CATEGORY_FIELD_MAP).flat().forEach(f => allowedKeys.add(f));
    }

    const scopedKeysNotice = isSelective
      ? `\n\nNOTE: The user has ONLY selected these categories to enhance: ${selectedCategories.join(', ')}. Return ONLY the fields for these categories. DO NOT generate or modify fields for unselected categories.`
      : '';

    const charName = character.nickname || character.fullName || 'ตัวละครหลัก';
    const identityAnchor = `
## CRITICAL CHARACTER IDENTITY (LOCKED CONTEXT):
- Locked Character Name: ${character.nickname || '-'} (Full Name: ${character.fullName || '-'})
- Gender: ${character.gender || '-'} | Age: ${character.age || '-'}
- Occupation: ${character.occupation || '-'}
- Core Traits: ${character.coreTraits || '-'}
- Initial Relationship: ${character.initialRelationship || '-'}

RULE: The character identity is strictly "${charName}". NEVER invent or change the character name (NEVER generate random names like "น้ำเหนือ" or "กวินทร์"). All enhanced fields MUST be 100% consistent with this persona.
`;

    const geminiKey = process.env.GEMINI_API_KEY;
    const openRouterKey = process.env.OPENROUTER_API_KEY;

    const prompt = `${ENHANCE_SYSTEM_PROMPT}
${identityAnchor}${scopedKeysNotice}

${instructions ? `## USER SPECIAL INSTRUCTIONS:\n${instructions}\n` : ''}

${onlyEmptyFields ? '## FOCUS: Enrich and fill ALL empty/unfilled fields with rich details while keeping existing non-empty values.' : ''}

## CURRENT CHARACTER DATA (FILL ALL EMPTY/UNFILLED FIELDS):
${JSON.stringify(scopedCharacter, null, 2)}
`;

    let aiResult: { text: string; model: string } | null = null;
    let fallbackTriggered = false;

    if (requestedModel && requestedModel !== 'auto' && requestedModel.includes('/')) {
      if (openRouterKey) {
        try {
          aiResult = await callOpenRouterSingle(openRouterKey, prompt, requestedModel);
        } catch (e: any) {
          console.warn(`Primary enhance model ${requestedModel} failed, fallback triggered:`, e.message);
          fallbackTriggered = true;
          if (geminiKey) {
            try {
              aiResult = await callDirectGeminiSingle(geminiKey, prompt, PRIMARY_GEMINI_MODEL);
            } catch (fbErr: any) {
              console.warn('Fallback Gemini enhance failed:', fbErr.message);
            }
          } else if (requestedModel !== SECONDARY_FALLBACK_MODEL) {
            try {
              aiResult = await callOpenRouterSingle(openRouterKey, prompt, SECONDARY_FALLBACK_MODEL);
            } catch (fbErr: any) {
              console.warn('Fallback OpenRouter enhance failed:', fbErr.message);
            }
          }
        }
      }
    } else {
      if (geminiKey) {
        try {
          aiResult = await callDirectGeminiSingle(geminiKey, prompt, PRIMARY_GEMINI_MODEL);
        } catch (e: any) {
          console.warn('Primary Gemini 3.5 Flash Lite failed, attempting fallback:', e.message);
          fallbackTriggered = true;
          if (openRouterKey) {
            try {
              aiResult = await callOpenRouterSingle(openRouterKey, prompt, FALLBACK_OPENROUTER_MODEL);
            } catch (fbErr: any) {
              console.warn('Fallback OpenRouter enhance failed:', fbErr.message);
              try {
                aiResult = await callOpenRouterSingle(openRouterKey, prompt, SECONDARY_FALLBACK_MODEL);
              } catch (secErr: any) {
                console.warn('Secondary fallback OpenRouter enhance failed:', secErr.message);
              }
            }
          }
        }
      } else if (openRouterKey) {
        try {
          aiResult = await callOpenRouterSingle(openRouterKey, prompt, FALLBACK_OPENROUTER_MODEL);
        } catch (e: any) {
          console.warn('Primary OpenRouter enhance failed:', e.message);
          fallbackTriggered = true;
          try {
            aiResult = await callOpenRouterSingle(openRouterKey, prompt, SECONDARY_FALLBACK_MODEL);
          } catch (fbErr: any) {
            console.warn('Secondary Fallback OpenRouter enhance failed:', fbErr.message);
          }
        }
      }
    }

    if (!aiResult?.text) {
      return NextResponse.json({ error: 'AI Enhance service is temporarily unavailable.' }, { status: 503 });
    }

    const parsedJson = safeExtractJson(aiResult.text);

    // Strict Selective Merge with robust aliases
    const merged: ThaiMasterCharacter = {
      ...DEFAULT_CHARACTER,
      ...character,
    };

    const fieldMap: Record<keyof ThaiMasterCharacter, string[]> = {
      nickname: ['nickname', 'name', 'nick_name'],
      fullName: ['fullName', 'full_name', 'realName', 'name'],
      age: ['age'],
      gender: ['gender', 'sex'],
      status: ['status', 'relationshipStatus', 'relationship_status'],
      birthdate: ['birthdate', 'birthDate', 'birthday', 'birth_date'],
      weightHeight: ['weightHeight', 'weight_height', 'heightWeight', 'height_weight'],
      mbti: ['mbti'],
      sexualOrientation: ['sexualOrientation', 'sexual_orientation', 'orientation'],
      car: ['car', 'vehicle'],
      perfume: ['perfume', 'scent', 'bodyScent'],
      address: ['address', 'residence', 'livingPlace'],
      wealthStatus: ['wealthStatus', 'wealth_status', 'wealth'],
      occupation: ['occupation', 'job', 'role'],
      fashionStyle: ['fashionStyle', 'fashion_style', 'outfit', 'clothes'],
      appearanceDesc: ['appearanceDesc', 'appearance_desc', 'appearance', 'looks'],
      visualFeatures: ['visualFeatures', 'visual_features', 'features', 'distinctFeatures'],
      visualTags: ['visualTags', 'visual_tags', 'vTags'],
      nsfwMaleSize: ['nsfwMaleSize', 'nsfw_male_size', 'maleSize', 'penisSize'],
      nsfwFemaleChest: ['nsfwFemaleChest', 'nsfw_female_chest', 'femaleChest', 'bustSize'],
      nsfwFemaleVagina: ['nsfwFemaleVagina', 'nsfw_female_vagina', 'femaleVagina'],
      coreTraits: ['coreTraits', 'core_traits', 'personality', 'traits', 'personalityTraits'],
      personalityTags: ['personalityTags', 'personality_tags', 'pTags'],
      likes: ['likes'],
      dislikes: ['dislikes'],
      generalBehaviors: ['generalBehaviors', 'general_behaviors', 'behaviors'],
      userExclusiveBehaviors: ['userExclusiveBehaviors', 'user_exclusive_behaviors', 'exclusiveBehaviors'],
      mindset: ['mindset', 'philosophy'],
      coreBelief: ['coreBelief', 'core_belief', 'belief'],
      perception: ['perception', 'worldview'],
      expression: ['expression', 'facialExpression'],
      behaviorUnderEmotion: ['behaviorUnderEmotion', 'behavior_under_emotion', 'emotionalBehavior'],
      emotionalTriggers: ['emotionalTriggers', 'emotional_triggers', 'triggers'],
      flawsWeaknesses: ['flawsWeaknesses', 'flaws_weaknesses', 'flaws', 'weaknesses'],
      userStoryRole: ['userStoryRole', 'user_story_role', 'storyRole'],
      initialRelationship: ['initialRelationship', 'initial_relationship', 'relationship'],
      userAttitude: ['userAttitude', 'user_attitude', 'attitude'],
      relationshipBackstory: ['relationshipBackstory', 'relationship_backstory', 'backstory'],
      absoluteAntiBehaviors: ['absoluteAntiBehaviors', 'absolute_anti_behaviors', 'antiBehaviors'],
      hiddenSoftSide: ['hiddenSoftSide', 'hidden_soft_side', 'softSide', 'gentleSide'],
      darkSide: ['darkSide', 'dark_side'],
      sexualStyle: ['sexualStyle', 'sexual_style'],
      kinksPreferences: ['kinksPreferences', 'kinks_preferences', 'kinks'],
      aftercareStyle: ['aftercareStyle', 'aftercare_style', 'aftercare'],
      openGreetingNarrative: ['openGreetingNarrative', 'open_greeting_narrative', 'greetingNarrative'],
      openGreetingDialogue: ['openGreetingDialogue', 'open_greeting_dialogue', 'greetingDialogue'],
      fullGreeting: ['fullGreeting', 'full_greeting', 'greeting'],
      plotSummary: ['plotSummary', 'plot_summary', 'plot'],
      shortIntro: ['shortIntro', 'short_intro', 'intro'],
      punchline: ['punchline', 'hook', 'tagline'],
      momentIntro: ['momentIntro', 'moment_intro'],
      dailyRoutine: ['dailyRoutine', 'daily_routine', 'routine'],
      toneSetting: ['toneSetting', 'tone_setting', 'setting', 'tone'],
      systemRules: ['systemRules', 'system_rules', 'rules'],
      subCharRules: ['subCharRules', 'sub_char_rules'],
      subCharAllowed: ['subCharAllowed', 'sub_char_allowed'],
      categoryTags: ['categoryTags', 'category_tags', 'tags'],
      flagType: ['flagType', 'flag_type', 'flag'],
      supportingCharacters: ['supportingCharacters', 'supporting_characters', 'subChars'],
      locations: ['locations', 'places'],
      garageStorage: ['garageStorage', 'garage_storage'],
      publicInfo: ['publicInfo', 'public_info'],
    };

    const stringKeys: (keyof ThaiMasterCharacter)[] = [
      'nickname', 'fullName', 'age', 'gender', 'status', 'birthdate', 'weightHeight',
      'mbti', 'sexualOrientation', 'car', 'perfume', 'address', 'wealthStatus', 'occupation',
      'fashionStyle', 'appearanceDesc', 'visualFeatures', 'nsfwMaleSize', 'nsfwFemaleChest',
      'nsfwFemaleVagina', 'coreTraits', 'generalBehaviors', 'userExclusiveBehaviors',
      'mindset', 'coreBelief', 'perception', 'expression', 'behaviorUnderEmotion',
      'emotionalTriggers', 'flawsWeaknesses', 'userStoryRole', 'initialRelationship',
      'userAttitude', 'relationshipBackstory', 'absoluteAntiBehaviors', 'hiddenSoftSide',
      'darkSide', 'sexualStyle', 'kinksPreferences', 'aftercareStyle', 'openGreetingNarrative',
      'openGreetingDialogue', 'fullGreeting', 'plotSummary', 'shortIntro', 'punchline',
      'momentIntro', 'dailyRoutine', 'toneSetting', 'subCharRules', 'subCharAllowed',
    ];

    stringKeys.forEach(key => {
      // If selective categories active, do NOT touch keys that were NOT checked!
      if (isSelective && !allowedKeys.has(key)) {
        (merged as any)[key] = character[key] ? normalizeString(character[key]) : '';
        return;
      }

      const currentVal = character[key];
      if (isEmptyValue(currentVal)) {
        const aliases = fieldMap[key] || [key];
        const enrichedVal = normalizeString(getFieldVal(parsedJson, ...aliases));
        if (enrichedVal) {
          (merged as any)[key] = enrichedVal;
        }
      } else {
        (merged as any)[key] = normalizeString(currentVal);
      }
    });

    const arrayKeys: (keyof ThaiMasterCharacter)[] = [
      'visualTags', 'personalityTags', 'likes', 'dislikes', 'systemRules', 'categoryTags',
    ];

    arrayKeys.forEach(key => {
      if (isSelective && !allowedKeys.has(key)) {
        (merged as any)[key] = Array.isArray(character[key]) ? normalizeArray(character[key]) : [];
        return;
      }

      const currentArr = character[key];
      if (!Array.isArray(currentArr) || currentArr.length === 0) {
        const aliases = fieldMap[key] || [key];
        const rawArr = getFieldVal(parsedJson, ...aliases);
        const enrichedArr = normalizeArray(rawArr);
        if (enrichedArr.length > 0) {
          (merged as any)[key] = enrichedArr;
        }
      } else {
        (merged as any)[key] = normalizeArray(currentArr);
      }
    });

    if (!isSelective || allowedKeys.has('supportingCharacters')) {
      const rawSub = getFieldVal(parsedJson, 'supportingCharacters', 'supporting_characters', 'subChars');
      if (Array.isArray(rawSub) && rawSub.length > 0) {
        if (!Array.isArray(character.supportingCharacters) || character.supportingCharacters.length === 0) {
          merged.supportingCharacters = rawSub;
        }
      }
    }

    if (!isSelective || allowedKeys.has('locations')) {
      const rawLoc = getFieldVal(parsedJson, 'locations', 'places');
      if (Array.isArray(rawLoc) && rawLoc.length > 0) {
        if (!Array.isArray(character.locations) || character.locations.length === 0) {
          merged.locations = rawLoc;
        }
      }
    }

    const duration = Date.now() - startTime;
    logAITelemetry({
      operation: 'enhance',
      modelRequested: requestedModel,
      modelUsed: aiResult.model,
      fallbackTriggered,
      promptTokensEst: estimateTokenCount(prompt),
      completionTokensEst: estimateTokenCount(aiResult.text),
      durationMs: duration,
      inputLength: JSON.stringify(scopedCharacter).length,
      outputLength: JSON.stringify(merged).length,
      success: true,
    });

    return NextResponse.json({ success: true, character: merged, model: aiResult.model });

  } catch (err: any) {
    const duration = Date.now() - startTime;
    logAITelemetry({
      operation: 'enhance',
      modelRequested: requestedModel,
      fallbackTriggered: false,
      durationMs: duration,
      success: false,
      error: err.message,
    });
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
