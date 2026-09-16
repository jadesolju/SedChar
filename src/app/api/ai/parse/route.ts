import { NextRequest, NextResponse } from 'next/server';
import { parseMarkdownToCharacter } from '@/shared/thaiTagParser';
import type { ThaiMasterCharacter } from '@/shared/types';
import { DEFAULT_CHARACTER } from '@/shared/types';

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

    // If API Key is configured, use Google Gemini (gemini-3.6-flash)
    if (apiKey) {
      try {
        const systemPrompt =
          'You are an expert Thai Bot Character Analyst and Prompt Engineer for AI roleplay platforms (Rubii, Purrpaw, Khui AI).\n' +
          'Your task is to analyze the provided raw character information and extract/organize it into a structured ThaiMasterCharacter JSON object.\n' +
          'Fill in all fields thoughtfully in natural, engaging Thai.\n' +
          'Extract basic info, appearance, NSFW details, psychology 7 layers, likes/dislikes, user relationship, anti-behaviors, bedroom behavior, locations, subcharacters, and open greeting.\n' +
          'Return ONLY valid JSON matching the ThaiMasterCharacter schema.';

        const geminiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=' + apiKey;

        const response = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [
                  {
                    text:
                      systemPrompt +
                      '\n\nHere is the raw character data to parse:\n"""\n' +
                      rawText +
                      '\n"""',
                  },
                ],
              },
            ],
            generationConfig: {
              responseMimeType: 'application/json',
              temperature: 0.2,
            },
          }),
        });

        if (response.ok) {
          const geminiData = await response.json();
          const candidateText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
          if (candidateText) {
            const parsedJson = JSON.parse(candidateText);
            const mergedCharacter: ThaiMasterCharacter = {
              ...DEFAULT_CHARACTER,
              ...parsedJson,
              supportingCharacters: Array.isArray(parsedJson.supportingCharacters) ? parsedJson.supportingCharacters : [],
              locations: Array.isArray(parsedJson.locations) ? parsedJson.locations : [],
              visualTags: Array.isArray(parsedJson.visualTags) ? parsedJson.visualTags : [],
              personalityTags: Array.isArray(parsedJson.personalityTags) ? parsedJson.personalityTags : [],
              likes: Array.isArray(parsedJson.likes) ? parsedJson.likes : [],
              dislikes: Array.isArray(parsedJson.dislikes) ? parsedJson.dislikes : [],
              systemRules: Array.isArray(parsedJson.systemRules) ? parsedJson.systemRules : [],
              categoryTags: Array.isArray(parsedJson.categoryTags) ? parsedJson.categoryTags : [],
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

    // Fallback: Local Client/Server Universal Parser
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