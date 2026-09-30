import { NextRequest, NextResponse } from 'next/server';

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
        temperature: 0.2,
        topP: 0.9,
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
      'X-Title': 'SedChar Universe AI',
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
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
    const { section, prompt: userPrompt, context } = body;

    if (!userPrompt || !section) {
      return NextResponse.json({ error: 'Missing section or prompt' }, { status: 400 });
    }

    const geminiKey =
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
      process.env.GOOGLE_API_KEY ||
      '';
    const openRouterKey = process.env.OPENROUTER_API_KEY || '';

    if (!geminiKey && !openRouterKey) {
      return NextResponse.json({ error: 'No AI API Key configured on server' }, { status: 500 });
    }

    let systemInstruction = '';
    let jsonSchemaExample = '';

    if (section === 'world') {
      systemInstruction = `คุณคือผู้เชี่ยวชาญการสร้าง World Building และจักรวาลสำหรับนิยายและการสวมบทบาท (RP) ภาษาไทย
ให้สร้างข้อมูล World Setting ที่มีเอกลักษณ์ มีกฎเกณฑ์ชัดเจน และดึงดูด น่าติดตามจากข้อมูลที่ผู้ใช้ให้มา
ตอบเป็น JSON ภาษาไทยตามโครงสร้างนี้เท่านั้น:`;
      jsonSchemaExample = `{
  "projectName": "ชื่อจักรวาลหรือโปรเจกต์ที่น่าสนใจ",
  "genreTone": "แนวเรื่องและโทนบรรยากาศ เช่น ดาร์กแฟนตาซี, ไซเบอร์พังก์สืบสวน, โรงเรียนเวทมนตร์",
  "eraTimePeriod": "ยุคสมัยและช่วงเวลา เช่น ยุคกลางหลังสงครามเวทมนตร์, โลกอนาคตปี 2180",
  "mainLocation": "สถานที่หลักในการดำเนินเรื่อง เช่น มหานครลอยฟ้าเนโอ-บางกอก, สถาบันเวทมนตร์เอเทลการ์ด",
  "worldRulesOrMagicSystem": "กฎเกณฑ์ของโลก ระบบพลัง หรือระบบเวทมนตร์อย่างละเอียด",
  "factionsOrOrganizations": "ฝ่าย องค์กร กลุ่มอำนาจ หรือตระกูลที่มีบทบาทสำคัญ",
  "atmosphereTheme": "ธีมหลักและบรรยากาศโดยรวมของเรื่อง"
}`;
    } else if (section === 'lore') {
      systemInstruction = `คุณคือผู้เชี่ยวชาญการสร้าง Lorebook, ปูมหลังประวัติศาสตร์ และ Timeline เหตุการณ์สำคัญสำหรับจักรวาล RP
ให้สร้างประวัติศาสตร์ ความลับ และเหตุการณ์สำคัญจากข้อมูลที่ผู้ใช้ให้มา
ตอบเป็น JSON ภาษาไทยตามโครงสร้างนี้เท่านั้น:`;
      jsonSchemaExample = `{
  "worldBackstory": "ภูมิหลังและประวัติความเป็นมาของโลกอย่างละเอียด",
  "coreConflict": "ปมความขัดแย้งหลักของเรื่องที่ขับเคลื่อนตัวละคร",
  "commonKnowledge": "สิ่งที่คนทั่วไปในโลกนี้รับรู้และเข้าใจตรงกัน",
  "taboosOrMyths": "ข้อห้าม ตำนานปรัมปรา หรือสิ่งที่ถูกสั่งห้ามในโลกนี้",
  "timelineEvents": [
    {
      "id": "evt-1",
      "timeLabel": "100 ปีก่อน",
      "eventTitle": "ชื่อเหตุการณ์ประวัติศาสตร์ที่ 1",
      "description": "รายละเอียดสิ่งที่เกิดขึ้นและผลกระทบ",
      "isSecret": false
    },
    {
      "id": "evt-2",
      "timeLabel": "5 ปีก่อน",
      "eventTitle": "ชื่อเหตุการณ์จุดเปลี่ยนสำคัญ",
      "description": "รายละเอียดความลับหรือโศกนาฏกรรมที่ซ่อนอยู่",
      "isSecret": true
    }
  ]
}`;
    } else if (section === 'characters') {
      systemInstruction = `คุณคือผู้เชี่ยวชาญการออกแบบตัวละครหลายตัว (Multi-Characters Cast) และสายสัมพันธ์ที่ซับซ้อนน่าติดตาม (Relationship Dynamics)
ให้สร้างรายชื่อตัวละครหลักที่มีมิติ ความต้องการ ความลับ และความสัมพันธ์โยงข้ามตัวละครอย่างชัดเจน
ตอบเป็น JSON ภาษาไทยตามโครงสร้างนี้เท่านั้น:`;
      jsonSchemaExample = `{
  "mainCharacters": [
    {
      "name": "ชื่อตัวละครที่ 1",
      "aliasOrTitle": "ฉายาหรือตำแหน่ง",
      "gender": "เพศ",
      "age": "อายุ",
      "storyRole": "บทบาทในเรื่อง เช่น พระเอก, คู่ปรับ, ผู้พิทักษ์",
      "corePersonality": "บุคลิกภาพ อุปนิสัย และจุดเด่น",
      "primaryGoalOrDesire": "เป้าหมายสูงสุดหรือความปรารถนาที่ซ่อนอยู่",
      "relationshipWithUser": "ความสัมพันธ์และทัศนคติต่อ {{user}}",
      "relationsWithOtherCast": "ความสัมพันธ์กับตัวละครอื่นในเรื่อง เช่น เป็นศัตรูกับคนนั้น แต่แอบชอบคนนี้",
      "exclusiveSecretOrKnowledge": "ความลับเฉพาะตัวหรือข้อมูลที่คนอื่นไม่รู้",
      "absoluteRules": "กฎเหล็กหรือสิ่งที่ไม่ทำเด็ดขาด",
      "speakingStyle": "สไตล์การพูด น้ำเสียง และคำติดปาก",
      "flagType": "green | red | white | black | watermelon | reverse-watermelon"
    },
    {
      "name": "ชื่อตัวละครที่ 2",
      "aliasOrTitle": "ฉายาหรือตำแหน่ง",
      "gender": "เพศ",
      "age": "อายุ",
      "storyRole": "บทบาทในเรื่อง",
      "corePersonality": "บุคลิกภาพ อุปนิสัย",
      "primaryGoalOrDesire": "เป้าหมายสูงสุด",
      "relationshipWithUser": "ความสัมพันธ์ต่อ {{user}}",
      "relationsWithOtherCast": "ความสัมพันธ์กับตัวละครอื่น",
      "exclusiveSecretOrKnowledge": "ความลับ",
      "absoluteRules": "กฎเหล็ก",
      "speakingStyle": "สไตล์การพูด",
      "flagType": "yellow"
    }
  ]
}`;
    }

    const fullPrompt = `${systemInstruction}
${context ? `บริบทจักรวาลที่มีอยู่เดิม:\n${typeof context === 'string' ? context : JSON.stringify(context, null, 2)}\n\n` : ''}
ข้อมูลหรือไอเดียจากผู้ใช้:
${userPrompt}

โครงสร้าง JSON ที่ต้องส่งคืน:
${jsonSchemaExample}`;

    let rawOutput = '';
    if (geminiKey) {
      try {
        rawOutput = await callDirectGemini(geminiKey, fullPrompt, PRIMARY_GEMINI_MODEL);
      } catch (geminiErr: any) {
        console.warn('Gemini auto-section error, trying OpenRouter:', geminiErr.message);
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
    return NextResponse.json({ success: true, section, data: parsed });
  } catch (err: any) {
    console.error('Auto section parse error:', err);
    return NextResponse.json({ error: err.message || 'AI generation failed' }, { status: 500 });
  }
}
