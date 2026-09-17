import { NextRequest, NextResponse } from 'next/server';
import type { ThaiMasterCharacter } from '@/shared/types';
import { DEFAULT_CHARACTER } from '@/shared/types';

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

const DIRECT_GEMINI_MODELS = [
  'gemini-3.5-flash-lite',
  'gemini-flash-lite-latest',
  'gemini-3.5-flash',
  'gemini-flash-latest',
  'gemini-2.5-flash'
];

const DEFAULT_OPENROUTER_FALLBACKS = [
  'google/gemini-3.5-flash-lite',
  'openai/gpt-4.1-mini',
  'openai/gpt-4.1-nano',
  'x-ai/grok-4.3',
  'x-ai/grok-4.20',
  'qwen/qwen3.8-flash',
  'qwen/qwen3.7-flash',
  'google/gemma-4-31b-it',
  'google/gemma-4-26b-a4b-it',
  'google/gemma-3-27b-it',
  'z-ai/glm-5.3-flash',
  'z-ai/glm-4.7-flash',
  'google/gemini-2.5-flash',
  'openai/gpt-4o-mini',
  'qwen/qwen-2.5-72b-instruct',
  'meta-llama/llama-3.3-70b-instruct'
];

async function callDirectGemini(apiKey: string, prompt: string, requestedModel?: string): Promise<{ text: string; model: string }> {
  const models = requestedModel && DIRECT_GEMINI_MODELS.includes(requestedModel)
    ? [requestedModel, ...DIRECT_GEMINI_MODELS.filter(m => m !== requestedModel)]
    : DIRECT_GEMINI_MODELS;

  for (const model of models) {
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    try {
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
      });

      if (response.ok) {
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return { text, model: `direct:${model}` };
      }
    } catch (err: any) {
      console.warn(`Direct Gemini ${model} failed:`, err.message);
    }
  }
  throw new Error('Direct Gemini call failed');
}

async function callOpenRouter(apiKey: string, prompt: string, requestedModel?: string): Promise<{ text: string; model: string }> {
  const modelsToTry = requestedModel && requestedModel !== 'auto'
    ? [requestedModel, ...DEFAULT_OPENROUTER_FALLBACKS.filter(m => m !== requestedModel)]
    : DEFAULT_OPENROUTER_FALLBACKS;

  for (const model of modelsToTry) {
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
      });

      if (response.ok) {
        const data = await response.json();
        const text = data.choices?.[0]?.message?.content;
        if (text && text.trim()) {
          return { text, model: `openrouter:${model}` };
        }
      }
    } catch (err: any) {
      console.warn(`OpenRouter model ${model} error:`, err.message);
    }
  }
  throw new Error('OpenRouter enhance calls failed');
}

const ENHANCE_SYSTEM_PROMPT = `You are SedChar-Enhancer v3, an elite Thai AI Roleplay Character Designer specializing in immersive character architecture for platforms like Rubii, Purrpaw, and Khui AI.

## TASK
You will receive a character profile that has partial or unpolished fields.
1. PRESERVE every existing non-empty field exactly as written by the user. Do not erase, contradict, or degrade existing details.
2. ENRICH and FLESH OUT every empty, thin, or missing field with rich, nuanced, psychological Thai roleplay details.
3. NEVER return '-' or '—' or 'N/A' or 'ไม่มี' or 'ไม่ได้ระบุ' as values. If a field is empty, enrich it with authentic Thai character content or use "" / [].
4. Output ONLY valid JSON matching the full ThaiMasterCharacter schema.
`;

export async function POST(req: NextRequest) {
  try {
    const { character, instructions, model } = await req.json();

    if (!character || typeof character !== 'object') {
      return NextResponse.json({ error: 'Missing character object' }, { status: 400 });
    }

    const geminiKey = process.env.GEMINI_API_KEY;
    const openRouterKey = process.env.OPENROUTER_API_KEY;

    const prompt = `${ENHANCE_SYSTEM_PROMPT}

${instructions ? `## USER SPECIAL INSTRUCTIONS:\n${instructions}\n` : ''}

## CURRENT CHARACTER DATA:
${JSON.stringify(character, null, 2)}
`;

    let aiResult: { text: string; model: string } | null = null;

    // 1. If explicit OpenRouter model is selected
    if (model && model.includes('/')) {
      if (openRouterKey) {
        try {
          aiResult = await callOpenRouter(openRouterKey, prompt, model);
        } catch (e: any) {
          console.warn(`OpenRouter enhance model ${model} failed, attempting fallbacks:`, e.message);
        }
      }
    }

    // 2. Direct Gemini Key if available
    if (!aiResult && geminiKey) {
      try {
        aiResult = await callDirectGemini(geminiKey, prompt, model);
      } catch (e: any) {
        console.warn('Direct Gemini enhance failed:', e.message);
      }
    }

    // 3. OpenRouter fallback cascade
    if (!aiResult && openRouterKey) {
      try {
        aiResult = await callOpenRouter(openRouterKey, prompt, model);
      } catch (e: any) {
        console.warn('OpenRouter fallback cascade failed:', e.message);
      }
    }

    if (!aiResult?.text) {
      return NextResponse.json({ error: 'AI Enhance service is temporarily unavailable.' }, { status: 503 });
    }

    const parsedJson = safeExtractJson(aiResult.text);

    // Merge: Preserve existing non-empty user fields, enrich empty ones
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

    if (!Array.isArray(merged.supportingCharacters) || merged.supportingCharacters.length === 0) {
      if (Array.isArray(parsedJson.supportingCharacters) && parsedJson.supportingCharacters.length > 0) {
        merged.supportingCharacters = parsedJson.supportingCharacters;
      }
    }

    if (!Array.isArray(merged.locations) || merged.locations.length === 0) {
      if (Array.isArray(parsedJson.locations) && parsedJson.locations.length > 0) {
        merged.locations = parsedJson.locations;
      }
    }

    return NextResponse.json({ success: true, character: merged, model: aiResult.model });

  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
