import { NextRequest, NextResponse } from 'next/server';
import type { ThaiMasterCharacter } from '@/shared/types';
import { DEFAULT_CHARACTER } from '@/shared/types';
import { verifyServerQuotaAndRateLimit, validateInputPayload } from '@/lib/aiServerGuard';
import { logAITelemetry, estimateTokenCount } from '@/lib/telemetry';

function safeExtractJson(raw: string): any {
  let text = raw.trim();
  text = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();
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

const PRIMARY_GEMINI_MODEL = 'gemini-2.5-flash';
const FALLBACK_OPENROUTER_MODEL = 'openai/gpt-4o-mini';

async function callDirectGeminiSingle(apiKey: string, prompt: string, model: string = PRIMARY_GEMINI_MODEL, timeoutMs: number = 12000): Promise<{ text: string; model: string }> {
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
          temperature: 0.3,
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

async function callOpenRouterSingle(apiKey: string, prompt: string, model: string = FALLBACK_OPENROUTER_MODEL, timeoutMs: number = 12000): Promise<{ text: string; model: string }> {
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
        temperature: 0.3,
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

const ENHANCE_SYSTEM_PROMPT = `You are SedChar-Enhancer v3, an elite Thai AI Roleplay Character Designer specializing in immersive character architecture for platforms like Rubii, Purrpaw, and Khui AI.

## TASK
You will receive character profile data to enhance and enrich.
1. PRESERVE every existing non-empty field exactly as written by the user. Do not erase, contradict, or degrade existing details.
2. ENRICH and FLESH OUT every empty, thin, or missing field with rich, nuanced, psychological Thai roleplay details.
3. NEVER return '-' or '—' or 'N/A' or 'ไม่มี' or 'ไม่ได้ระบุ' as values. If a field is empty, enrich it with authentic Thai character content or use "" / [].
4. Output ONLY valid JSON containing the enhanced fields.
`;

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

    if (Array.isArray(activeSubCharIds) && Array.isArray(character.supportingCharacters)) {
      scopedCharacter.supportingCharacters = character.supportingCharacters.filter(
        (sc: any) => activeSubCharIds.includes(sc.id)
      );
    }

    let scopedKeysNotice = '';
    if (Array.isArray(selectedCategories) && selectedCategories.length > 0 && selectedCategories.length < 10) {
      const allowedKeys = new Set<string>();
      selectedCategories.forEach(cat => {
        const fields = CATEGORY_FIELD_MAP[cat];
        if (fields) fields.forEach(f => allowedKeys.add(f));
      });
      ['nickname', 'fullName', 'age', 'gender'].forEach(k => allowedKeys.add(k));

      const filtered: any = {};
      Object.keys(scopedCharacter).forEach(k => {
        if (allowedKeys.has(k)) {
          filtered[k] = scopedCharacter[k];
        }
      });
      scopedCharacter = filtered;
      scopedKeysNotice = `\n\nNOTE: Focus enhancement specifically on the following categories: ${selectedCategories.join(', ')}. Return ONLY the fields belonging to these categories.`;
    }

    const geminiKey = process.env.GEMINI_API_KEY;
    const openRouterKey = process.env.OPENROUTER_API_KEY;

    const prompt = `${ENHANCE_SYSTEM_PROMPT}${scopedKeysNotice}

${instructions ? `## USER SPECIAL INSTRUCTIONS:\n${instructions}\n` : ''}

${onlyEmptyFields ? '## FOCUS: Enrich ONLY the empty/unfilled fields while keeping existing non-empty values.' : ''}

## CURRENT CHARACTER DATA:
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
          } else if (requestedModel !== FALLBACK_OPENROUTER_MODEL) {
            try {
              aiResult = await callOpenRouterSingle(openRouterKey, prompt, FALLBACK_OPENROUTER_MODEL);
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
          console.warn('Primary Gemini enhance failed, attempting 1 fast fallback:', e.message);
          fallbackTriggered = true;
          if (openRouterKey) {
            try {
              aiResult = await callOpenRouterSingle(openRouterKey, prompt, FALLBACK_OPENROUTER_MODEL);
            } catch (fbErr: any) {
              console.warn('Fast fallback OpenRouter enhance failed:', fbErr.message);
            }
          }
        }
      } else if (openRouterKey) {
        try {
          aiResult = await callOpenRouterSingle(openRouterKey, prompt, 'google/gemini-2.5-flash');
        } catch (e: any) {
          console.warn('Primary OpenRouter enhance failed:', e.message);
          fallbackTriggered = true;
          try {
            aiResult = await callOpenRouterSingle(openRouterKey, prompt, FALLBACK_OPENROUTER_MODEL);
          } catch (fbErr: any) {
            console.warn('Fallback OpenRouter enhance failed:', fbErr.message);
          }
        }
      }
    }

    if (!aiResult?.text) {
      return NextResponse.json({ error: 'AI Enhance service is temporarily unavailable.' }, { status: 503 });
    }

    const parsedJson = safeExtractJson(aiResult.text);

    const merged: ThaiMasterCharacter = {
      ...DEFAULT_CHARACTER,
      ...character,
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
      const currentVal = character[key];
      if (isEmptyValue(currentVal)) {
        const enrichedVal = normalizeString(parsedJson[key]);
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
      const currentArr = character[key];
      if (!Array.isArray(currentArr) || currentArr.length === 0) {
        const enrichedArr = normalizeArray(parsedJson[key]);
        if (enrichedArr.length > 0) {
          (merged as any)[key] = enrichedArr;
        }
      } else {
        (merged as any)[key] = normalizeArray(currentArr);
      }
    });

    if (Array.isArray(parsedJson.supportingCharacters) && parsedJson.supportingCharacters.length > 0) {
      if (!Array.isArray(character.supportingCharacters) || character.supportingCharacters.length === 0) {
        merged.supportingCharacters = parsedJson.supportingCharacters;
      }
    }

    if (Array.isArray(parsedJson.locations) && parsedJson.locations.length > 0) {
      if (!Array.isArray(character.locations) || character.locations.length === 0) {
        merged.locations = parsedJson.locations;
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
