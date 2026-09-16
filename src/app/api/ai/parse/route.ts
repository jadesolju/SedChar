import { NextRequest, NextResponse } from 'next/server';
import { parseMarkdownToCharacter } from '@/shared/thaiTagParser';
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
    const { rawText } = await req.json();

    if (!rawText || typeof rawText !== 'string' || !rawText.trim()) {
      return NextResponse.json(
        { error: 'Missing rawText in request body' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // 1. If API Key is configured, use Google Gemini 3.6 Flash
    if (apiKey) {
      try {
        const systemPrompt = `You are an expert Thai Bot Character Analyst and Master Prompt Engineer for Thai roleplay AI platforms (Rubii, Purrpaw, Khui AI).
Your task is to analyze the provided raw character information (unstructured text, notes, JSON, Markdown, YAML, etc.) and generate a rich, complete ThaiMasterCharacter JSON object.

Instructions:
1. Fill in ALL 10 categories thoughtfully in natural, engaging, high-quality Thai.
2. If certain fields (like psychological mindset, core belief, triggers, flaws, bedroom style, subcharacters, locations, or open greeting) are not explicitly given, extrapolate and create creative, immersive details that fit the character's persona and archetype.
3. Return ONLY valid JSON matching the ThaiMasterCharacter schema.`;

        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`;

        const response = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [
                  {
                    text: `${systemPrompt}\n\nHere is the raw character data to parse and enhance:\n"""\n${rawText}\n"""`
                  }
                ]
              }
            ],
            generationConfig: {
              responseMimeType: 'application/json',
              temperature: 0.2,
            }
          })
        });

        if (response.ok) {
          const geminiData = await response.json();
          const candidateText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
          if (candidateText) {
            const parsedJson = safeExtractJson(candidateText);
            const mergedCharacter: ThaiMasterCharacter = {
              ...DEFAULT_CHARACTER,
              ...parsedJson,
              coreTraits: normalizeString(parsedJson.coreTraits),
              appearanceDesc: normalizeString(parsedJson.appearanceDesc),
              visualFeatures: normalizeString(parsedJson.visualFeatures),
              visualTags: normalizeArray(parsedJson.visualTags),
              personalityTags: normalizeArray(parsedJson.personalityTags),
              likes: normalizeArray(parsedJson.likes),
              dislikes: normalizeArray(parsedJson.dislikes),
              systemRules: normalizeArray(parsedJson.systemRules),
              categoryTags: normalizeArray(parsedJson.categoryTags),
              supportingCharacters: Array.isArray(parsedJson.supportingCharacters) ? parsedJson.supportingCharacters : [],
              locations: Array.isArray(parsedJson.locations) ? parsedJson.locations : [],
            };

            return NextResponse.json({
              success: true,
              character: mergedCharacter,
              model: 'gemini-3.6-flash',
            });
          }
        }
      } catch (geminiErr: any) {
        console.warn('Gemini parsing fallback to local parser:', geminiErr.message);
      }
    }

    // 2. Fallback: Local Client/Server Universal Parser
    const fallbackCharacter = parseMarkdownToCharacter(rawText);
    return NextResponse.json({
      success: true,
      character: fallbackCharacter,
      model: 'local-intelligent-parser',
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
