import { NextRequest, NextResponse } from 'next/server';
import type { ThaiMasterCharacter } from '@/shared/types';
import { DEFAULT_CHARACTER } from '@/shared/types';

// Helper to reliably extract and parse JSON from LLM output
function safeExtractJson(raw: string): any {
  let text = raw.trim();
  
  if (text.startsWith('```json')) {
    text = text.slice(7);
  } else if (text.startsWith('```')) {
    text = text.slice(3);
  }
  if (text.endsWith('```')) {
    text = text.slice(0, -3);
  }
  text = text.trim();

  try {
    return JSON.parse(text);
  } catch {}

  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    try {
      const sub = text.slice(firstBrace, lastBrace + 1);
      return JSON.parse(sub);
    } catch {}
  }

  throw new Error('Could not parse JSON response from LLM');
}

// Normalizer for arrays/strings
function normalizeString(val: any): string {
  if (!val) return '';
  if (Array.isArray(val)) return val.join(', ');
  return String(val);
}

function normalizeArray(val: any): string[] {
  if (!val) return [];
  if (Array.isArray(val)) return val.map(String).filter(Boolean);
  if (typeof val === 'string') {
    return val.split(/[,\n]/).map(s => s.trim()).filter(Boolean);
  }
  return [];
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { character, instructions } = body as {
      character: Partial<ThaiMasterCharacter>;
      instructions?: string;
    };

    if (!character) {
      return NextResponse.json(
        { error: 'Missing character object in request body' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Gemini API key is not configured' },
        { status: 500 }
      );
    }

    const systemPrompt = `You are an expert Thai Bot Character Analyst and Master Prompt Engineer for Thai roleplay AI platforms (Rubii, Purrpaw, Khui AI).
Your task is to take the user's current character draft (which may have partial fields filled) and intelligently ENHANCE and COMPLETE all missing/empty fields across all 10 pillars.

Rules:
1. PRESERVE all existing non-empty fields provided by the user. Do not overwrite or contradict what the user has already specified unless explicitly requested in the instructions.
2. For all empty/sparse fields, creatively generate rich, immersive, psychological, and high-quality Thai content matching the character archetype and tone.
3. If instructions are provided, incorporate them seamlessly into the character's personality, backstory, kinks, sub-characters, and opening greeting dialogue.
4. Ensure all 10 pillars are filled:
   - 1. ข้อมูลพื้นฐาน (nickname, fullName, age, gender, occupation, mbti, wealthStatus, fashionStyle, car, perfume, address, birthdate, weightHeight)
   - 2. รูปลักษณ์ (appearanceDesc, visualFeatures, visualTags)
   - 3. ส่วนลับ NSFW (nsfwMaleSize, nsfwFemaleChest, nsfwFemaleVagina)
   - 4. จิตวิทยา & นิสัย (coreTraits, personalityTags, mindset, perception, expression, behaviorUnderEmotion, emotionalTriggers, flawsWeaknesses, coreBelief)
   - 5. สิ่งที่ชอบ & เกลียด (likes, dislikes)
   - 6. ความสัมพันธ์ {{user}} (userStoryRole, initialRelationship, relationshipBackstory, userAttitude, generalBehaviors, userExclusiveBehaviors, hiddenSoftSide, darkSide)
   - 7. กฎระบบ & ข้อห้าม (systemRules, absoluteAntiBehaviors)
   - 8. สไตล์บนเตียง (sexualStyle, kinksPreferences, aftercareStyle)
   - 9. ตัวละครเสริม & สถานที่ (supportingCharacters, subCharRules, subCharAllowed, locations, dailyRoutine, toneSetting)
   - 10. คำโปรย & ฉากเปิด (shortIntro, punchline, plotSummary, publicInfo, categoryTags, momentIntro, openGreetingNarrative, openGreetingDialogue, fullGreeting, flagType)
5. Return ONLY a valid JSON object matching the full ThaiMasterCharacter schema.`;

    const userPrompt = `Current Character Draft:
${JSON.stringify(character, null, 2)}

User Additional Instructions/Preferences:
${instructions || 'Complete all empty fields with high-quality Thai roleplay depth.'}

Return the complete JSON object now.`;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`;

    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: systemPrompt + '\n\n' + userPrompt }],
          },
        ],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.3,
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API Error (${response.status}): ${errText}`);
    }

    const geminiData = await response.json();
    const candidateText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidateText) {
      throw new Error('Empty response received from Gemini');
    }

    const parsedJson = safeExtractJson(candidateText);

    // Merge carefully, preserving non-empty existing fields if new parsed is empty
    const enhancedCharacter: ThaiMasterCharacter = {
      ...DEFAULT_CHARACTER,
      ...parsedJson,
      coreTraits: normalizeString(parsedJson.coreTraits || character.coreTraits),
      appearanceDesc: normalizeString(parsedJson.appearanceDesc || character.appearanceDesc),
      visualFeatures: normalizeString(parsedJson.visualFeatures || character.visualFeatures),
      visualTags: normalizeArray(parsedJson.visualTags && parsedJson.visualTags.length ? parsedJson.visualTags : character.visualTags),
      personalityTags: normalizeArray(parsedJson.personalityTags && parsedJson.personalityTags.length ? parsedJson.personalityTags : character.personalityTags),
      likes: normalizeArray(parsedJson.likes && parsedJson.likes.length ? parsedJson.likes : character.likes),
      dislikes: normalizeArray(parsedJson.dislikes && parsedJson.dislikes.length ? parsedJson.dislikes : character.dislikes),
      systemRules: normalizeArray(parsedJson.systemRules && parsedJson.systemRules.length ? parsedJson.systemRules : character.systemRules),
      categoryTags: normalizeArray(parsedJson.categoryTags && parsedJson.categoryTags.length ? parsedJson.categoryTags : character.categoryTags),
      supportingCharacters: Array.isArray(parsedJson.supportingCharacters) && parsedJson.supportingCharacters.length > 0
        ? parsedJson.supportingCharacters
        : (character.supportingCharacters || []),
      locations: Array.isArray(parsedJson.locations) && parsedJson.locations.length > 0
        ? parsedJson.locations
        : (character.locations || []),
    };

    return NextResponse.json({
      success: true,
      character: enhancedCharacter,
      model: 'gemini-3.6-flash',
    });
  } catch (err: any) {
    console.error('Error in /api/ai/enhance:', err);
    return NextResponse.json(
      { error: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
