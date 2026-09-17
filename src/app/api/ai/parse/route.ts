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
  return String(val).trim();
}

function normalizeArray(val: any): string[] {
  if (!val) return [];
  if (Array.isArray(val)) return val.map(String).map(s => s.trim()).filter(Boolean);
  if (typeof val === 'string') {
    try {
      const arr = JSON.parse(val);
      if (Array.isArray(arr)) return arr.map(String).filter(Boolean);
    } catch {}
    return val.split(/[,\n|;]/).map(s => s.trim()).filter(Boolean);
  }
  return [];
}

async function callGemini(apiKey: string, prompt: string, retries = 2): Promise<any> {
  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`;

  for (let attempt = 0; attempt <= retries; attempt++) {
    if (attempt > 0) {
      await new Promise(r => setTimeout(r, 2000 * attempt));
    }

    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.25,
          topP: 0.9,
          topK: 40,
        },
      }),
    });

    if (response.status === 503 || response.status === 429) {
      if (attempt < retries) continue;
    }

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini ${response.status}: ${errText}`);
    }

    return await response.json();
  }
  throw new Error('Gemini unavailable after retries');
}

const PARSE_PROMPT_PREFIX = `You are SedChar-Parser v3, an elite Thai Character Extraction & Enrichment Engine for Thai AI roleplay platforms (Rubii, Purrpaw, Khui AI).

## TASK
Transform the raw character input below into a complete, richly populated ThaiMasterCharacter JSON object.

## TWO-PHASE PROCESS

### PHASE 1 — FAITHFUL EXTRACTION
Scan the raw input carefully and extract EVERY explicit detail:
- Names: nickname, fullName
- Age, gender, birthdate, height/weight: map exactly as stated
- Occupation, wealth, car, perfume, address: extract if present
- Personality keywords (เย็นชา, ซึนเดเระ, ยันเดเระ, ดอม, ซับ, ร่าเริง, เศร้า, etc.): coreTraits, personalityTags
- Physical appearance: appearanceDesc, visualFeatures, visualTags
- NSFW details if explicitly present: nsfwMaleSize / nsfwFemaleChest / nsfwFemaleVagina
- Likes, hobbies: likes; dislikes: dislikes
- Relationship info: userStoryRole, initialRelationship, relationshipBackstory
- Rules, limits: systemRules, absoluteAntiBehaviors
- Sexual preferences: sexualStyle, kinksPreferences, aftercareStyle
- Side characters: supportingCharacters
- Locations, settings: locations
- Any greeting or opening scene: openGreetingNarrative, openGreetingDialogue, fullGreeting

### PHASE 2 — INTELLIGENT ENRICHMENT
For every field left empty after Phase 1, generate rich, immersive Thai content:

Psychology (จิตวิทยา):
- mindset: 2-3 sentences capturing how they see the world internally. Write as if describing their thoughts when alone.
- coreBelief: One absolute truth they hold — possibly warped or painful
- perception: How they read people — analytical, intuitive, emotionally blind?
- expression: How they show or suppress emotion day-to-day
- behaviorUnderEmotion: What they physically DO when angry, scared, or in love
- emotionalTriggers: 2-4 specific, precise things that break their composure
- flawsWeaknesses: Real, humanizing flaws — avoid generic answers

Relationship to user:
- generalBehaviors: Day-to-day behavior around user — subtle and observational
- userExclusiveBehaviors: What they ONLY do for the user
- hiddenSoftSide: The rare crack in their armor
- darkSide: What surfaces in intense or unguarded moments

Opening Greeting (make it cinematic):
- openGreetingNarrative: Set the scene with sensory detail — time, place, mood, what they are doing
- openGreetingDialogue: ONE perfect opening line in their exact voice. Make it emotionally impactful.
- fullGreeting: Narrative + dialogue merged into one smooth 200-350 Thai character scene

Supporting Cast and World:
- supportingCharacters: Create 1-2 contextually fitting side characters. Each object: { id, name, gender, age, personality, relationship, mainRole, appearWhen, shortDesc, systemPrompt }
- locations: Create 2-3 fitting locations. Each object: { id, name, prompt }

System and Tags:
- systemRules: 4-6 concrete behavioral rules for AI roleplay consistency
- categoryTags: Thai genre tags — เย็นชา, ซึนเดเระ, CEO, หมอ, ทหาร, ดอมซับ, ยันเดเระ, etc.
- flagType: Auto-detect from personality — toxic/controlling/ยันเดเระ = red or black; ซึนเดเระ = yellow; warm/caring = green; submissive/pure = white; unclear = none

## STRICT RULES
1. NEVER contradict what the user explicitly stated
2. Keep Thai content in Thai — never translate to English
3. All array fields must be real JSON arrays of strings
4. supportingCharacters and locations must be arrays of objects as described above
5. flagType must be exactly one of: none, white, green, yellow, red, black, watermelon, reverse-watermelon
6. Return ONLY valid JSON — no markdown, no explanation, no preamble

## RAW CHARACTER INPUT
`;

export async function POST(req: NextRequest) {
  try {
    const { rawText } = await req.json();

    if (!rawText || typeof rawText !== 'string' || !rawText.trim()) {
      return NextResponse.json({ error: 'Missing rawText' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      try {
        const prompt = PARSE_PROMPT_PREFIX + rawText;
        const geminiData = await callGemini(apiKey, prompt);
        const candidateText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;

        if (candidateText) {
          const parsedJson = safeExtractJson(candidateText);
          const result: ThaiMasterCharacter = {
            ...DEFAULT_CHARACTER,
            ...parsedJson,
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
            sexualStyle: normalizeString(parsedJson.sexualStyle),
            kinksPreferences: normalizeString(parsedJson.kinksPreferences),
            aftercareStyle: normalizeString(parsedJson.aftercareStyle),
            openGreetingNarrative: normalizeString(parsedJson.openGreetingNarrative),
            openGreetingDialogue: normalizeString(parsedJson.openGreetingDialogue),
            fullGreeting: normalizeString(parsedJson.fullGreeting),
            plotSummary: normalizeString(parsedJson.plotSummary),
            shortIntro: normalizeString(parsedJson.shortIntro),
            punchline: normalizeString(parsedJson.punchline),
            dailyRoutine: normalizeString(parsedJson.dailyRoutine),
            toneSetting: normalizeString(parsedJson.toneSetting),
            visualTags: normalizeArray(parsedJson.visualTags),
            personalityTags: normalizeArray(parsedJson.personalityTags),
            likes: normalizeArray(parsedJson.likes),
            dislikes: normalizeArray(parsedJson.dislikes),
            systemRules: normalizeArray(parsedJson.systemRules),
            categoryTags: normalizeArray(parsedJson.categoryTags),
            supportingCharacters: Array.isArray(parsedJson.supportingCharacters) ? parsedJson.supportingCharacters : [],
            locations: Array.isArray(parsedJson.locations) ? parsedJson.locations : [],
          };

          return NextResponse.json({ success: true, character: result, model: 'gemini-3.6-flash' });
        }
      } catch (geminiErr: any) {
        console.warn('Gemini parse error, using local parser:', geminiErr.message);
      }
    }

    // Fallback: Local Parser
    const fallbackCharacter = parseMarkdownToCharacter(rawText);
    return NextResponse.json({ success: true, character: fallbackCharacter, model: 'local-parser' });

  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
