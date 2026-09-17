import { NextRequest, NextResponse } from 'next/server';
import { parseMarkdownToCharacter } from '@/shared/thaiTagParser';
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
            temperature: 0.2,
            topP: 0.9,
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
              content: 'You are an expert AI parser. You MUST respond with ONLY valid JSON strictly matching the requested format. Do not include markdown code block formatting or explanations.'
            },
            { role: 'user', content: prompt }
          ],
          temperature: 0.2,
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
  throw new Error('OpenRouter calls failed');
}

const JSON_SCHEMA_TEMPLATE = `{
  "nickname": "string",
  "fullName": "string",
  "age": "string",
  "gender": "string",
  "status": "string",
  "birthdate": "string",
  "weightHeight": "string",
  "mbti": "string",
  "sexualOrientation": "string",
  "car": "string",
  "perfume": "string",
  "address": "string",
  "wealthStatus": "string",
  "occupation": "string",
  "fashionStyle": "string",
  "appearanceDesc": "string",
  "visualFeatures": "string",
  "visualTags": ["string"],
  "nsfwMaleSize": "string",
  "nsfwFemaleChest": "string",
  "nsfwFemaleVagina": "string",
  "coreTraits": "string",
  "personalityTags": ["string"],
  "likes": ["string"],
  "dislikes": ["string"],
  "generalBehaviors": "string",
  "userExclusiveBehaviors": "string",
  "mindset": "string",
  "coreBelief": "string",
  "perception": "string",
  "expression": "string",
  "behaviorUnderEmotion": "string",
  "emotionalTriggers": "string",
  "flawsWeaknesses": "string",
  "userStoryRole": "string",
  "initialRelationship": "string",
  "userAttitude": "string",
  "relationshipBackstory": "string",
  "absoluteAntiBehaviors": "string",
  "hiddenSoftSide": "string",
  "darkSide": "string",
  "sexualStyle": "string",
  "kinksPreferences": "string",
  "aftercareStyle": "string",
  "dailyRoutine": "string",
  "toneSetting": "string",
  "subCharRules": "string",
  "subCharAllowed": "string",
  "shortIntro": "string",
  "punchline": "string",
  "momentIntro": "string",
  "categoryTags": ["string"],
  "openGreetingNarrative": "string",
  "openGreetingDialogue": "string",
  "fullGreeting": "string",
  "systemRules": ["string"],
  "supportingCharacters": [
    {
      "id": "string",
      "name": "string",
      "gender": "string",
      "age": "string",
      "personality": "string",
      "relationship": "string",
      "mainRole": "string",
      "appearWhen": "string",
      "shortDesc": "string",
      "systemPrompt": "string"
    }
  ],
  "locations": [
    {
      "id": "string",
      "name": "string",
      "prompt": "string"
    }
  ],
  "flagType": "none | white | green | yellow | red | black | watermelon | reverse-watermelon"
}`;

const PARSE_PROMPT_PREFIX = `You are SedChar-Parser v3, an elite Thai Character Extraction & Enrichment Engine for Thai AI roleplay platforms (Rubii, Purrpaw, Khui AI).

## TASK
Extract ALL details faithfully from the raw input and enrich missing fields into the complete JSON schema below:
${JSON_SCHEMA_TEMPLATE}

## CRITICAL RULES
1. NEVER output '-' or '—' or 'N/A' or 'ไม่มี' or 'ไม่ได้ระบุ' as values. If a field is empty or not provided, return "" (empty string) or [] (empty array).
2. NEVER drop, truncate, or summarize user information. Extract EVERY SINGLE DETAIL faithfully.
3. Keep Thai roleplay language natural, authentic, and rich.
4. Return ONLY valid JSON matching the schema keys.

## RAW CHARACTER INPUT:
`;

export async function POST(req: NextRequest) {
  try {
    const { rawText, model } = await req.json();

    if (!rawText || typeof rawText !== 'string' || !rawText.trim()) {
      return NextResponse.json({ error: 'Missing rawText' }, { status: 400 });
    }

    const geminiKey = process.env.GEMINI_API_KEY;
    const openRouterKey = process.env.OPENROUTER_API_KEY;
    const prompt = PARSE_PROMPT_PREFIX + rawText;

    let aiResult: { text: string; model: string } | null = null;

    // 1. If explicit OpenRouter model is selected or OpenRouter key is available:
    if (model && model.includes('/')) {
      if (openRouterKey) {
        try {
          aiResult = await callOpenRouter(openRouterKey, prompt, model);
        } catch (e: any) {
          console.warn(`OpenRouter explicit model ${model} failed, attempting fallbacks:`, e.message);
        }
      }
    }

    // 2. Direct Gemini Key if available
    if (!aiResult && geminiKey) {
      try {
        aiResult = await callDirectGemini(geminiKey, prompt, model);
      } catch (e: any) {
        console.warn('Direct Gemini call failed:', e.message);
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

    if (aiResult?.text) {
      try {
        const parsedJson = safeExtractJson(aiResult.text);
        const result: ThaiMasterCharacter = {
          ...DEFAULT_CHARACTER,
          ...parsedJson,
          nickname: normalizeString(parsedJson.nickname),
          fullName: normalizeString(parsedJson.fullName),
          age: normalizeString(parsedJson.age),
          gender: normalizeString(parsedJson.gender),
          status: normalizeString(parsedJson.status),
          birthdate: normalizeString(parsedJson.birthdate),
          weightHeight: normalizeString(parsedJson.weightHeight),
          mbti: normalizeString(parsedJson.mbti),
          sexualOrientation: normalizeString(parsedJson.sexualOrientation),
          car: normalizeString(parsedJson.car),
          perfume: normalizeString(parsedJson.perfume),
          address: normalizeString(parsedJson.address),
          wealthStatus: normalizeString(parsedJson.wealthStatus),
          occupation: normalizeString(parsedJson.occupation),
          fashionStyle: normalizeString(parsedJson.fashionStyle),
          coreTraits: normalizeString(parsedJson.coreTraits),
          appearanceDesc: normalizeString(parsedJson.appearanceDesc),
          visualFeatures: normalizeString(parsedJson.visualFeatures),
          mindset: normalizeString(parsedJson.mindset),
          coreBelief: normalizeString(parsedJson.coreBelief),
          perception: normalizeString(parsedJson.perception),
          expression: normalizeString(parsedJson.expression),
          behaviorUnderEmotion: normalizeString(parsedJson.behaviorUnderEmotion),
          emotionalTriggers: normalizeString(parsedJson.emotionalTriggers),
          flawsWeaknesses: normalizeString(parsedJson.flawsWeaknesses),
          generalBehaviors: normalizeString(parsedJson.generalBehaviors),
          userExclusiveBehaviors: normalizeString(parsedJson.userExclusiveBehaviors),
          hiddenSoftSide: normalizeString(parsedJson.hiddenSoftSide),
          darkSide: normalizeString(parsedJson.darkSide),
          absoluteAntiBehaviors: normalizeString(parsedJson.absoluteAntiBehaviors),
          userAttitude: normalizeString(parsedJson.userAttitude),
          userStoryRole: normalizeString(parsedJson.userStoryRole),
          initialRelationship: normalizeString(parsedJson.initialRelationship),
          relationshipBackstory: normalizeString(parsedJson.relationshipBackstory),
          nsfwMaleSize: normalizeString(parsedJson.nsfwMaleSize),
          nsfwFemaleChest: normalizeString(parsedJson.nsfwFemaleChest),
          nsfwFemaleVagina: normalizeString(parsedJson.nsfwFemaleVagina),
          sexualStyle: normalizeString(parsedJson.sexualStyle),
          kinksPreferences: normalizeString(parsedJson.kinksPreferences),
          aftercareStyle: normalizeString(parsedJson.aftercareStyle),
          openGreetingNarrative: normalizeString(parsedJson.openGreetingNarrative),
          openGreetingDialogue: normalizeString(parsedJson.openGreetingDialogue),
          fullGreeting: normalizeString(parsedJson.fullGreeting),
          plotSummary: normalizeString(parsedJson.plotSummary),
          shortIntro: normalizeString(parsedJson.shortIntro),
          punchline: normalizeString(parsedJson.punchline),
          momentIntro: normalizeString(parsedJson.momentIntro),
          dailyRoutine: normalizeString(parsedJson.dailyRoutine),
          toneSetting: normalizeString(parsedJson.toneSetting),
          subCharRules: normalizeString(parsedJson.subCharRules),
          subCharAllowed: normalizeString(parsedJson.subCharAllowed),
          visualTags: normalizeArray(parsedJson.visualTags),
          personalityTags: normalizeArray(parsedJson.personalityTags),
          likes: normalizeArray(parsedJson.likes),
          dislikes: normalizeArray(parsedJson.dislikes),
          systemRules: normalizeArray(parsedJson.systemRules),
          categoryTags: normalizeArray(parsedJson.categoryTags),
          supportingCharacters: Array.isArray(parsedJson.supportingCharacters) ? parsedJson.supportingCharacters : [],
          locations: Array.isArray(parsedJson.locations) ? parsedJson.locations : [],
        };

        return NextResponse.json({ success: true, character: result, model: aiResult.model });
      } catch (jsonErr: any) {
        console.warn('JSON parsing from AI failed, falling back to regex parser:', jsonErr.message);
      }
    }

    // 4. Ultimate Fallback: Local Regex & Rule-Based Parser
    const fallbackCharacter = parseMarkdownToCharacter(rawText);
    return NextResponse.json({ success: true, character: fallbackCharacter, model: 'local-regex-parser' });

  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
