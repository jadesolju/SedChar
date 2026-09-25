import { NextRequest, NextResponse } from 'next/server';
import { parseMarkdownToCharacter } from '@/shared/thaiTagParser';
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
          temperature: 0.2,
          topP: 0.9,
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
            content: 'You are an expert AI parser. You MUST respond with ONLY valid JSON strictly matching the requested format. Do not include markdown code block formatting or explanations.'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.2,
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
  "openGreetingNarrative": "string",
  "openGreetingDialogue": "string",
  "fullGreeting": "string",
  "plotSummary": "string",
  "shortIntro": "string",
  "punchline": "string",
  "momentIntro": "string",
  "dailyRoutine": "string",
  "toneSetting": "string",
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
  const startTime = Date.now();
  let requestedModel = 'auto';

  try {
    const guard = await verifyServerQuotaAndRateLimit(req);
    if (!guard.allowed) {
      return NextResponse.json({ error: guard.error || 'Too many requests' }, { status: guard.statusCode || 429 });
    }

    const { rawText, model, targetPlatform } = await req.json();
    requestedModel = model || 'auto';

    if (!rawText || typeof rawText !== 'string' || !rawText.trim()) {
      return NextResponse.json({ error: 'Missing rawText' }, { status: 400 });
    }

    const sizeCheck = validateInputPayload(rawText, 15000);
    if (!sizeCheck.valid) {
      return NextResponse.json({ error: sizeCheck.error }, { status: 400 });
    }

    const geminiKey = process.env.GEMINI_API_KEY;
    const openRouterKey = process.env.OPENROUTER_API_KEY;

    let platformGuidance = '';
    if (targetPlatform === 'purrpaw') {
      platformGuidance = '\n\nNOTE: Target platform is Purrpaw AI. Ensure rich 10-category profile, locations, subcharacters, and full greeting are faithfully structured.';
    } else if (targetPlatform === 'rubii') {
      platformGuidance = '\n\nNOTE: Target platform is Rubii AI. Ensure complete Markdown persona prompt, moment intro, and public description are faithfully structured.';
    } else if (targetPlatform === 'khui') {
      platformGuidance = '\n\nNOTE: Target platform is Khui AI. Ensure concise system prompt, character profile, scenario plot summary, and user relationship are separated cleanly.';
    }

    const prompt = PARSE_PROMPT_PREFIX + platformGuidance + '\n\n' + rawText;
    let aiResult: { text: string; model: string } | null = null;
    let fallbackTriggered = false;

    if (requestedModel && requestedModel !== 'auto' && requestedModel.includes('/')) {
      if (openRouterKey) {
        try {
          aiResult = await callOpenRouterSingle(openRouterKey, prompt, requestedModel);
        } catch (e: any) {
          console.warn(`Primary model ${requestedModel} failed, fallback triggered:`, e.message);
          fallbackTriggered = true;
          if (geminiKey) {
            try {
              aiResult = await callDirectGeminiSingle(geminiKey, prompt, PRIMARY_GEMINI_MODEL);
            } catch (fbErr: any) {
              console.warn('Fallback Gemini call failed:', fbErr.message);
            }
          } else if (requestedModel !== FALLBACK_OPENROUTER_MODEL) {
            try {
              aiResult = await callOpenRouterSingle(openRouterKey, prompt, FALLBACK_OPENROUTER_MODEL);
            } catch (fbErr: any) {
              console.warn('Fallback OpenRouter call failed:', fbErr.message);
            }
          }
        }
      }
    } else {
      if (geminiKey) {
        try {
          aiResult = await callDirectGeminiSingle(geminiKey, prompt, PRIMARY_GEMINI_MODEL);
        } catch (e: any) {
          console.warn('Primary Gemini call failed, attempting 1 fast fallback:', e.message);
          fallbackTriggered = true;
          if (openRouterKey) {
            try {
              aiResult = await callOpenRouterSingle(openRouterKey, prompt, FALLBACK_OPENROUTER_MODEL);
            } catch (fbErr: any) {
              console.warn('Fast fallback OpenRouter call failed:', fbErr.message);
            }
          }
        }
      } else if (openRouterKey) {
        try {
          aiResult = await callOpenRouterSingle(openRouterKey, prompt, 'google/gemini-2.5-flash');
        } catch (e: any) {
          console.warn('Primary OpenRouter call failed:', e.message);
          fallbackTriggered = true;
          try {
            aiResult = await callOpenRouterSingle(openRouterKey, prompt, FALLBACK_OPENROUTER_MODEL);
          } catch (fbErr: any) {
            console.warn('Fallback OpenRouter call failed:', fbErr.message);
          }
        }
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

        const duration = Date.now() - startTime;
        logAITelemetry({
          operation: 'parse',
          modelRequested: requestedModel,
          modelUsed: aiResult.model,
          fallbackTriggered,
          promptTokensEst: estimateTokenCount(prompt),
          completionTokensEst: estimateTokenCount(aiResult.text),
          durationMs: duration,
          inputLength: rawText.length,
          outputLength: JSON.stringify(result).length,
          success: true,
        });

        return NextResponse.json({ success: true, character: result, model: aiResult.model });
      } catch (jsonErr: any) {
        console.warn('JSON parsing from AI failed, falling back to local regex parser:', jsonErr.message);
      }
    }

    const fallbackCharacter = parseMarkdownToCharacter(rawText);
    const duration = Date.now() - startTime;
    logAITelemetry({
      operation: 'local_parse',
      modelRequested: requestedModel,
      modelUsed: 'local-regex-parser',
      fallbackTriggered: true,
      promptTokensEst: 0,
      completionTokensEst: 0,
      durationMs: duration,
      inputLength: rawText.length,
      outputLength: JSON.stringify(fallbackCharacter).length,
      success: true,
    });

    return NextResponse.json({ success: true, character: fallbackCharacter, model: 'local-regex-parser' });

  } catch (err: any) {
    const duration = Date.now() - startTime;
    logAITelemetry({
      operation: 'parse',
      modelRequested: requestedModel,
      fallbackTriggered: false,
      durationMs: duration,
      success: false,
      error: err.message,
    });
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
