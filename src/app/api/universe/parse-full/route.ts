import { NextRequest, NextResponse } from 'next/server';
import type { MultiCharacterProjectDraft } from '@/shared/multiCharTypes';
import {
  DEFAULT_MULTI_PROJECT_DRAFT,
  DEFAULT_WORLD_SETTING,
  DEFAULT_LORE_DRAFT,
  DEFAULT_MAIN_CHARACTER_DRAFT,
} from '@/shared/multiCharTypes';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const PRIMARY_GEMINI_MODEL = 'gemini-3.5-flash-lite';
const FALLBACK_OPENROUTER_MODEL = 'google/gemini-3.5-flash-lite';

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

async function callDirectGemini(apiKey: string, prompt: string, model: string = PRIMARY_GEMINI_MODEL): Promise<string> {
  const cleanModel = model.replace(/^google\//, '').replace(/^direct:/, '');
  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${cleanModel}:generateContent?key=${apiKey}`;

  const res = await fetch(geminiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.15,
        topP: 0.85,
      },
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini API error (${res.status}): ${errText}`);
  }

  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

async function callOpenRouter(apiKey: string, prompt: string, model: string = FALLBACK_OPENROUTER_MODEL): Promise<string> {
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://sedchar.vercel.app',
      'X-Title': 'SedChar Universal Universe Parser',
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.15,
      response_format: { type: 'json_object' },
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`OpenRouter API error (${res.status}): ${errText}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { rawText, autoFillMissing = true } = body;

    if (!rawText || !rawText.trim()) {
      return NextResponse.json({ error: 'กรุณากรอกหรือวางเนื้อเรื่องก่อนเริ่มแปลง' }, { status: 400 });
    }

    const geminiKey =
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
      process.env.GOOGLE_API_KEY ||
      '';
    const openRouterKey = process.env.OPENROUTER_API_KEY || '';

    if (!geminiKey && !openRouterKey) {
      return NextResponse.json({ error: 'Server AI Key not configured' }, { status: 500 });
    }

    const systemPrompt = `คุณคือผู้เชี่ยวชาญระดับสูงในการแปลงและสกัดโครงสร้างจักรวาลเนื้อเรื่อง (Universal Story & Multi-Character Parser) สำหรับการสร้างบอทสวมบทบาท (RP / Rubii / Character AI) ภาษาไทย
ให้วิเคราะห์ข้อมูลดิบทั้งหมดที่ผู้ใช้ป้อนเข้ามา แล้วสกัดออกมาเป็นโครงสร้าง JSON ภาษาไทยที่ครบถ้วน สมบูรณ์ และมีมิติ

ข้อกำหนดสำคัญ:
1. World Setting: สกัดชื่อเรื่อง, แนวเรื่อง, ยุคสมัย, ฉากหลัก, กฎของโลก/ระบบพลัง, ฝ่าย/องค์กร, บรรยากาศ
2. Lore & Timeline: สกัดภูมิหลัง, ปมขัดแย้ง, ลำดับเหตุการณ์ประวัติศาสตร์ (อย่างน้อย 1-3 เหตุการณ์), ข้อห้าม
3. Main Characters: **ต้องมีตัวละครหลักอย่างน้อย 1 ตัว** (หากต้นฉบับไม่มีชื่อตัวละครชัดเจน ${autoFillMissing ? 'ให้ช่วยคิดตัวละครเอกที่มีมิติและเข้ากับโลกนั้นให้ 1-2 ตัวทันที' : 'ให้สร้างตัวละครหลักตามบริบท'})
4. Flag Type ให้เลือกจาก: 'green', 'red', 'yellow', 'white', 'black', 'watermelon', 'reverse-watermelon'

ตอบกลับเฉพาะ JSON ตาม Schema นี้เท่านั้น:
{
  "title": "ชื่อโปรเจกต์หรือชื่อเรื่อง",
  "worldSetting": {
    "projectName": "ชื่อเรื่อง",
    "genreTone": "แนวเรื่อง เช่น แฟนตาซี, ไซเบอร์พังก์, ดาร์กโรแมนซ์",
    "eraTimePeriod": "ยุคสมัยและช่วงเวลา",
    "mainLocation": "สถานที่หลักและฉากหลัง",
    "worldRulesOrMagicSystem": "กฎเกณฑ์ของโลก ระบบพลัง หรือข้อจำกัด",
    "factionsOrOrganizations": "ฝ่ายหรือองค์กรสำคัญ",
    "atmosphereTheme": "มู้ดและบรรยากาศโดยรวม"
  },
  "lore": {
    "worldBackstory": "ภูมิหลังและประวัติความเป็นมาของโลก",
    "coreConflict": "ปมความขัดแย้งหลักของเรื่อง",
    "commonKnowledge": "สิ่งที่คนทั่วไปรับรู้",
    "taboosOrMyths": "ข้อห้ามหรือตำนาน",
    "timelineEvents": [
      {
        "id": "evt-1",
        "timeLabel": "ช่วงเวลา เช่น 10 ปีก่อน",
        "eventTitle": "ชื่อเหตุการณ์",
        "description": "รายละเอียดสิ่งที่เกิดขึ้น",
        "isSecret": false
      }
    ]
  },
  "mainCharacters": [
    {
      "id": "char-1",
      "name": "ชื่อตัวละครหลัก",
      "aliasOrTitle": "ฉายาหรือตำแหน่ง",
      "gender": "เพศ",
      "age": "อายุ",
      "storyRole": "บทบาท เช่น ตัวเอก, พระเอก, หัวหน้ากิลด์",
      "corePersonality": "บุคลิกภาพ อุปนิสัย",
      "primaryGoalOrDesire": "เป้าหมายและความปรารถนา",
      "relationshipWithUser": "ความสัมพันธ์และทัศนคติต่อ {{user}}",
      "relationsWithOtherCast": "ความสัมพันธ์กับตัวละครอื่นในเรื่อง",
      "exclusiveSecretOrKnowledge": "ความลับเฉพาะตัว",
      "absoluteRules": "กฎเหล็กที่ไม่ทำเด็ดขาด",
      "speakingStyle": "สไตล์การพูดและคำติดปาก",
      "flagType": "green"
    }
  ],
  "routes": [
    {
      "id": "route-1",
      "routeName": "ชื่อเส้นทางเนื้อเรื่องหลัก",
      "summary": "สรุปทิศทางเรื่อง",
      "involvedCharacterIds": [],
      "entryCondition": "เงื่อนไขเริ่ม",
      "exitOrBranchCondition": "เงื่อนไขจบ/แยกสาย",
      "possibleEndings": "ตอนจบที่เป็นไปได้",
      "relationshipDynamics": "การพัฒนาความสัมพันธ์"
    }
  ],
  "castInteractionRules": "กฎการสลับบทสนทนากลุ่มและฉากที่มีตัวละครหลายตัว"
}`;

    const userPrompt = `ข้อมูลเนื้อเรื่อง / พล็อตดิบ / ไฟล์ที่นำเข้า:\n\n${rawText}`;
    const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;

    let rawOutput = '';
    if (geminiKey) {
      try {
        rawOutput = await callDirectGemini(geminiKey, fullPrompt, PRIMARY_GEMINI_MODEL);
      } catch (geminiErr: any) {
        console.warn('Gemini parse-full failed, trying OpenRouter fallback:', geminiErr.message);
        if (openRouterKey) {
          rawOutput = await callOpenRouter(openRouterKey, fullPrompt, FALLBACK_OPENROUTER_MODEL);
        } else {
          throw geminiErr;
        }
      }
    } else if (openRouterKey) {
      rawOutput = await callOpenRouter(openRouterKey, fullPrompt, FALLBACK_OPENROUTER_MODEL);
    }

    const parsed = safeExtractJson(rawOutput);

    // Ensure valid project structure
    const projectResult: MultiCharacterProjectDraft = {
      ...DEFAULT_MULTI_PROJECT_DRAFT,
      id: 'proj_' + Date.now(),
      title: parsed.title || parsed.worldSetting?.projectName || 'โปรเจกต์จักรวาล',
      worldSetting: {
        ...DEFAULT_WORLD_SETTING,
        ...(parsed.worldSetting || {}),
        projectName: parsed.worldSetting?.projectName || parsed.title || 'จักรวาลและคลังความจำ',
      },
      lore: {
        ...DEFAULT_LORE_DRAFT,
        ...(parsed.lore || {}),
        timelineEvents: Array.isArray(parsed.lore?.timelineEvents) ? parsed.lore.timelineEvents : [],
      },
      mainCharacters: Array.isArray(parsed.mainCharacters) && parsed.mainCharacters.length > 0
        ? parsed.mainCharacters.map((c: any, i: number) => ({
            ...DEFAULT_MAIN_CHARACTER_DRAFT,
            ...c,
            id: c.id || `char-${i + 1}`,
          }))
        : [
            {
              ...DEFAULT_MAIN_CHARACTER_DRAFT,
              id: 'char-1',
              name: 'ตัวละครเอก',
              storyRole: 'ตัวละครหลักในการดำเนินเรื่อง',
              corePersonality: 'มีความมุ่งมั่นและเป้าหมายชัดเจน',
              flagType: 'green',
            },
          ],
      routes: Array.isArray(parsed.routes) ? parsed.routes : [],
      supportingCharacters: [],
      castInteractionRules: parsed.castInteractionRules || DEFAULT_MULTI_PROJECT_DRAFT.castInteractionRules,
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      project: projectResult,
    });
  } catch (err: any) {
    console.error('Universal Multi-Parser error:', err);
    return NextResponse.json({ error: err.message || 'การแปลงเนื้อเรื่องไม่สำเร็จ' }, { status: 500 });
  }
}
