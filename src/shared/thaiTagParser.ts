// ============================================================
// SedChar.AI v2.0 — Thai Tag & Markdown Parser Engine
// TypeScript strict mode: zero `any` allowed
// ============================================================

import type {
  ThaiMasterCharacter,
  RubiiOutput,
  PurrpawOutput,
  KhuiOutput,
  CharacterFlagType,
  SubCharacter,
  LocationItem,
} from './types';
import { DEFAULT_CHARACTER } from './types';
import { sanitizeTraits } from './intelligentParser';

/**
 * Approximate token count for Gemini / Claude / GPT models with Thai text
 * Typically Thai averages ~2.8 - 3.8 characters per token in modern BPE tokenizers
 */
export function estimateTokens(text: string): number {
  if (!text) return 0;
  const thaiCharCount = (text.match(/[\u0E00-\u0E7F]/g) || []).length;
  const nonThaiCharCount = text.length - thaiCharCount;
  return Math.ceil((thaiCharCount / 2.8) + (nonThaiCharCount / 4.0));
}

export function formatCount(count: number): string {
  return new Intl.NumberFormat('th-TH').format(count);
}

/**
 * Intelligent Flag Analyzer: Detects relationship flags based on keywords
 */
export function analyzeCharacterFlag(char: ThaiMasterCharacter): CharacterFlagType {
  const allText = [
    char.coreTraits,
    char.personalityTags.join(' '),
    char.generalBehaviors,
    char.userExclusiveBehaviors,
    char.absoluteAntiBehaviors,
    char.darkSide,
    char.hiddenSoftSide,
    char.userAttitude,
    char.initialRelationship,
  ].join(' ').toLowerCase();

  if (char.flagType && char.flagType !== 'none') {
    return char.flagType;
  }

  // Reverse watermelon: Tsundere / Dark outside, soft inside
  if (
    allText.includes('ซึนเดเระ') ||
    allText.includes('ซึนเดะระ') ||
    allText.includes('ซินเดเระ') ||
    allText.includes('ปากร้ายใจดี') ||
    allText.includes('ปากร้ายแต่ใจดี') ||
    allText.includes('ดุแต่ใจดี') ||
    allText.includes('ธงแตงโมกลับด้าน') ||
    (allText.includes('เย็นชา') && (allText.includes('อ่อนโยน') || allText.includes('ห่วงใย') || allText.includes('ปกป้อง')))
  ) {
    return 'reverse-watermelon';
  }

  // Watermelon: Sweet outside, toxic inside
  if (
    allText.includes('เจ้าเล่ห์') ||
    allText.includes('หน้าเนื้อใจเสือ') ||
    allText.includes('ธงแตงโม') ||
    (allText.includes('อบอุ่น') && (allText.includes('บงการ') || allText.includes('พิษสง')))
  ) {
    return 'watermelon';
  }

  // Black flag: pure evil / extreme toxic
  if (
    allText.includes('ธงดำ') ||
    allText.includes('โรคจิต') ||
    allText.includes('ฆาตกร') ||
    allText.includes('ทำร้ายร่างกาย') ||
    allText.includes('ไร้ความปรานี')
  ) {
    return 'black';
  }

  // Red flag: toxic / possessive / aggressive
  if (
    allText.includes('ธงแดง') ||
    allText.includes('toxic') ||
    allText.includes('บงการ') ||
    allText.includes('ครอบงำ') ||
    allText.includes('คลั่งรักแบบดาร์ก')
  ) {
    return 'red';
  }

  // Green flag: safe / wholesome
  if (
    allText.includes('ธงเขียว') ||
    allText.includes('อบอุ่น') ||
    allText.includes('แสนดี') ||
    allText.includes('ให้เกียรติ') ||
    allText.includes('ปลอดภัย')
  ) {
    return 'green';
  }

  // White flag: submissive / pure forgiveness
  if (
    allText.includes('ธงขาว') ||
    allText.includes('ยอมจำนน') ||
    allText.includes('ยอมทุกอย่าง') ||
    allText.includes('บริสุทธิ์')
  ) {
    return 'white';
  }

  // Yellow flag: suspicious / warning
  if (allText.includes('ธงเหลือง') || allText.includes('ระแวง') || allText.includes('น่าสงสัย')) {
    return 'yellow';
  }

  return 'none';
}

/**
 * Smart Regex Parser: Takes raw Markdown text from the template and parses into ThaiMasterCharacter
 */
export function parseMarkdownToCharacter(rawMarkdown: string): ThaiMasterCharacter {
  if (!rawMarkdown || rawMarkdown.trim() === '') {
    return { ...DEFAULT_CHARACTER };
  }

  const result: ThaiMasterCharacter = { ...DEFAULT_CHARACTER };
  const lines = rawMarkdown.split('\n');

  // Helper to extract value from any bullet / header / text line:
  const extractFieldValue = (keyPattern: string): string => {
    const regex = new RegExp(`(?:^[\\*\\-#\\s]+)(?:\\*\\*)?(?:${keyPattern})(?:\\*\\*)?\\s*[:=]\\s*(.+)`, 'i');
    for (const line of lines) {
      const match = line.match(regex);
      if (match && match[1]) {
        return match[1].replace(/^[*_~`]+|[*_~`]+$/g, '').trim();
      }
    }
    return '';
  };

  // 1. General Profile
  result.nickname = extractFieldValue('ชื่อเล่น');
  result.fullName = extractFieldValue('ชื่อเต็ม');
  if (!result.fullName && !result.nickname) {
    const nameMatch = rawMarkdown.match(/(?:ชื่อตัวละคร|ชื่อ)\s*[:=*]\s*([^\n\r]+)/i);
    if (nameMatch && nameMatch[1]) {
      result.fullName = nameMatch[1].replace(/[*_~`]/g, '').trim();
    }
  }

  result.age = extractFieldValue('อายุ');
  result.gender = extractFieldValue('เพศ');
  result.status = extractFieldValue('สถานะ');
  result.birthdate = extractFieldValue('วันเดือนปีเกิด|วันเกิด');
  result.weightHeight = extractFieldValue('น้ำหนัก\\s*\\/?\\s*ส่วนสูง|ส่วนสูง\\s*\\/?\\s*น้ำหนัก');
  result.mbti = extractFieldValue('MBTI');
  result.sexualOrientation = extractFieldValue('รสนิยมทางเพศ');
  result.car = extractFieldValue('รถที่ใช้');
  result.perfume = extractFieldValue('กลิ่นน้ำหอม|น้ำหอม');
  result.address = extractFieldValue('ที่อยู่');
  result.wealthStatus = extractFieldValue('ฐานะ');
  result.occupation = extractFieldValue('อาชีพ');
  result.fashionStyle = extractFieldValue('สไตล์การแต่งตัว');

  // 2. Appearance & NSFW
  result.nsfwMaleSize = extractFieldValue('ขนาดโจ้ย|ส่วนลับชาย');
  result.nsfwFemaleChest = extractFieldValue('ขนาดหน้าอก');
  result.nsfwFemaleVagina = extractFieldValue('จิ๊มิ|ส่วนลับหญิง');

  // 3. Section Slicing Helper
  const extractSection = (startHeaderRegex: RegExp, endHeaderRegex?: RegExp): string => {
    let startIndex = -1;
    let endIndex = lines.length;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i] || '';
      if (startIndex === -1 && startHeaderRegex.test(line)) {
        startIndex = i + 1;
      } else if (startIndex !== -1 && endHeaderRegex && endHeaderRegex.test(line)) {
        endIndex = i;
        break;
      }
    }

    if (startIndex !== -1) {
      return lines.slice(startIndex, endIndex).join('\n').trim();
    }
    return '';
  };

  // Appearance Section
  const appearanceSec = extractSection(
    /#{1,3}\s*(?:ลักษณะภายนอก|Appearance)/i,
    /#{1,3}\s*(?:ส่วนลับ|นิสัยและพฤติกรรม|Psychology)/i
  );
  if (appearanceSec) {
    result.appearanceDesc = appearanceSec.replace(/^[-*]\s+/gm, '').trim();
  }

  // Tags extractor helper
  const extractTags = (text: string): string[] => {
    const tags = text.match(/#[\w\u0E00-\u0E7F_-]+/g);
    if (!tags) return [];
    return Array.from(new Set(tags));
  };

  // Extract visual tags
  if (appearanceSec) {
    const visualTags = extractTags(appearanceSec);
    if (visualTags.length > 0) {
      result.visualTags = visualTags;
    }
  }

  // Psychology & Core Traits
  const personalitySec = extractSection(
    /#{1,3}\s*(?:\[?นิสัยและพฤติกรรม|Psychology)/i,
    /#{1,3}\s*(?:\[?สิ่งที่ชอบ|พฤติกรรมทั่วไป|โครงสร้างจิตวิทยา)/i
  );
  if (personalitySec) {
    result.coreTraits = personalitySec.replace(/^[-*]\s+/gm, '').trim();
    const pTags = extractTags(personalitySec);
    if (pTags.length > 0) {
      // Apply intelligent fuzzy sanitation on personality tags
      result.personalityTags = sanitizeTraits(pTags);
    }
  }

  // Likes / Dislikes
  const likesMatch = rawMarkdown.match(/สิ่งที่ชอบ\s*[:=-]([\s\S]*?)(?:สิ่งที่ไม่ชอบ|$)/i);
  if (likesMatch && likesMatch[1]) {
    result.likes = likesMatch[1]
      .split('\n')
      .map(s => s.replace(/^[-*•\d.]+\s*/, '').trim())
      .filter(s => s.length > 0 && !s.includes('สิ่งที่ไม่ชอบ'));
  }

  const dislikesMatch = rawMarkdown.match(/สิ่งที่ไม่ชอบ\s*[:=-]([\s\S]*?)(?:###|##|$)/i);
  if (dislikesMatch && dislikesMatch[1]) {
    result.dislikes = dislikesMatch[1]
      .split('\n')
      .map(s => s.replace(/^[-*•\d.]+\s*/, '').trim())
      .filter(s => s.length > 0 && !s.startsWith('#'));
  }

  // General & User Behaviors
  const genBehaviors = extractSection(
    /#{2,4}\s*พฤติกรรมทั่วไป/i,
    /#{2,4}\s*(?:พฤติกรรมพิเศษ|โครงสร้างจิตวิทยา)/i
  );
  if (genBehaviors) result.generalBehaviors = genBehaviors.trim();

  const userBehaviors = extractSection(
    /#{2,4}\s*พฤติกรรมพิเศษเฉพาะกับ\s*\{\{user\}\}/i,
    /#{2,4}\s*โครงสร้างจิตวิทยา/i
  );
  if (userBehaviors) result.userExclusiveBehaviors = userBehaviors.trim();

  // Psychology 7 items
  result.coreBelief = extractFieldValue('1\\.\\s*Core Belief|ความเชื่อหลัก|Core Belief');
  result.mindset = extractFieldValue('2\\.\\s*Mindset|กระบวนการคิด|Mindset');
  result.perception = extractFieldValue('3\\.\\s*Perception|การตีความ|Perception');
  result.expression = extractFieldValue('4\\.\\s*Expression|การแสดงออก|Expression');
  result.behaviorUnderEmotion = extractFieldValue('5\\.\\s*Behavior|พฤติกรรมประจำ|พฤติกรรมตามสภาวะอารมณ์');
  result.emotionalTriggers = extractFieldValue('6\\.\\s*Emotional Triggers|Triggers|สิ่งที่กระตุ้นอารมณ์');
  result.flawsWeaknesses = extractFieldValue('7\\.\\s*Flaws & Weaknesses|จุดอ่อน|Flaws');

  // Relationship & Story Role
  result.userStoryRole = extractFieldValue('บทบาทในเนื้อเรื่อง|Story Role');
  result.initialRelationship = extractFieldValue('ความสัมพันธ์เริ่มต้น|ความสัมพันธ์แรกเริ่ม');
  result.userAttitude = extractFieldValue('ทัศนคติที่เขามีต่อ|ตัวตนของ');

  const backstory = extractSection(
    /#{2,4}\s*(?:\[?ภูมิหลังความสัมพันธ์|Backstory)/i,
    /#{2,4}\s*(?:\[?ขอบเขตพฤติกรรม|พฤติกรรมทางเพศ)/i
  );
  if (backstory) result.relationshipBackstory = backstory.trim();

  // Boundaries & Logic
  result.absoluteAntiBehaviors = extractSection(
    /(?:สิ่งที่จะไม่ทำเด็ดขาด|Absolute Anti-Behaviors)/i,
    /(?:ด้านน่ารัก|Hidden Soft Side|ด้านมืด)/i
  );
  result.hiddenSoftSide = extractSection(
    /(?:ด้านน่ารัก|Hidden Soft Side)/i,
    /(?:ด้านมืด|The Dark Side|พฤติกรรมทางเพศ)/i
  );
  result.darkSide = extractSection(
    /(?:ด้านมืด|The Dark Side)/i,
    /#{2,4}\s*(?:พฤติกรรมทางเพศ|Sexual Behavior|Lifestyle)/i
  );

  // Sexual Behavior
  result.sexualStyle = extractFieldValue('1\\.\\s*สไตล์และแนวทาง|Sexual Style');
  result.kinksPreferences = extractFieldValue('2\\.\\s*รสนิยมจำเพาะ|Kinks|Preferences');
  result.aftercareStyle = extractFieldValue('3\\.\\s*การดูแลหลังกิจกรรม|Aftercare');

  // Tone & Setting
  const toneSec = extractSection(
    /#{2,4}\s*(?:1\\.\\s*โทนเรื่องและฉากหลัง|Tone & Setting)/i,
    /#{2,4}\s*(?:2\\.\\s*ตัวละครเสริม|Supporting Characters|คำโปรย)/i
  );
  if (toneSec) result.toneSetting = toneSec.trim();

  // Parse Locations
  const locationLines = lines.filter(l => l.includes('สถานที่ในเรื่อง') || l.includes('ชื่อสถานที่') || l.includes('Prompt สถานที่'));
  if (locationLines.length > 0) {
    const locs: LocationItem[] = [];
    const locRegex = /[-*]\s*\[?(?:สถานที่|ชื่อ)\]?\s*[:=]\s*([^|]+)(?:\|\s*\[?Prompt\]?\s*[:=]\s*(.+))?/i;
    for (const l of lines) {
      const m = l.match(locRegex);
      if (m && m[1] && locs.length < 10) {
        locs.push({
          id: `loc-${locs.length + 1}`,
          name: m[1].trim(),
          prompt: m[2] ? m[2].trim() : '',
        });
      }
    }
    if (locs.length > 0) result.locations = locs;
  }

  // Parse Sub Characters (Supporting Cast)
  const subCharRegex = /\[ชื่อ\]\s*:\s*([^|]+)\|\s*\[เพศ\]\s*:\s*([^|]+)\|\s*\[อายุ\]\s*:\s*([^|]+)\|\s*\[บุคลิก\]\s*:\s*([^|]+)\|\s*\[ความสัมพันธ์\]\s*:\s*([^|]+)\|\s*\[หน้าที่หลักในเรื่อง\]\s*:\s*([^|]+)(?:\|\s*\[ปรากฎเมื่อ\]\s*:\s*([^|]+))?/i;
  const foundSubs: SubCharacter[] = [];
  for (const l of lines) {
    const sm = l.match(subCharRegex);
    if (sm && sm[1] && foundSubs.length < 5) {
      foundSubs.push({
        id: `sub-${foundSubs.length + 1}`,
        name: sm[1].trim(),
        gender: sm[2] ? sm[2].trim() : '',
        age: sm[3] ? sm[3].trim() : '',
        personality: sm[4] ? sm[4].trim() : '',
        relationship: sm[5] ? sm[5].trim() : '',
        mainRole: sm[6] ? sm[6].trim() : '',
        appearWhen: sm[7] ? sm[7].trim() : '',
        shortDesc: `${sm[4] || ''} | ${sm[5] || ''}`,
        systemPrompt: `บทบาท: ${sm[6] || ''} ปรากฏ: ${sm[7] || ''}`,
      });
    }
  }
  if (foundSubs.length > 0) {
    result.supportingCharacters = foundSubs;
  }

  // Short Intro & Punchline
  result.shortIntro = extractFieldValue('คำโปรยสั้นๆ|Short Intro|TAGLINE');
  result.punchline = extractFieldValue('ประโยคเด็ด|คำคม|Punchline');
  result.plotSummary = extractSection(
    /#{2,4}\s*เนื้อเรื่องย่อ/i,
    /#{2,4}\s*(?:ข้อมูลสาธารณะ|การใส่แท็ก|ฉากเปิด)/i
  );
  result.publicInfo = extractSection(
    /#{2,4}\s*ข้อมูลสาธารณะ/i,
    /#{2,4}\s*(?:การใส่แท็ก|ฉากเปิด)/i
  );

  // Category tags
  const catTags = rawMarkdown.match(/#[\w\u0E00-\u0E7F_-]+/g);
  if (catTags) {
    result.categoryTags = Array.from(new Set(catTags));
  }

  // Open Greeting
  const greetingSec = extractSection(
    /#{2,4}\s*(?:ฉากเปิด|Open Greeting|\*\*ช่วง Open Greeting:\*\*)/i
  );
  if (greetingSec) {
    result.fullGreeting = greetingSec.replace(/\[(?:การบรรยาย|บทพูด)\]\s*[:=]?\s*/g, '').trim();
    result.openGreetingNarrative = greetingSec;
  }

  // Flag detection
  result.flagType = analyzeCharacterFlag(result);

  return result;
}

/**
 * Generates the full master markdown document based on the standard template
 */
export function characterToFullMarkdown(char: ThaiMasterCharacter): string {
  const visualTagsStr = char.visualTags.length > 0 ? char.visualTags.join(' ') : '';
  const pTagsStr = char.personalityTags.length > 0 ? char.personalityTags.join(' ') : '';
  const catTagsStr = char.categoryTags.length > 0 ? char.categoryTags.join(' ') : '';

  return `## **[ข้อมูลพื้นฐาน - Character Profile (General Info)]**

- **ชื่อเล่น**: ${char.nickname || '-'}
- **ชื่อเต็ม**: ${char.fullName || '-'}
- **อายุ**: ${char.age || '-'}
- **เพศ**: ${char.gender || '-'}
- **สถานะ**: ${char.status || '-'}
- **วันเดือนปีเกิด**: ${char.birthdate || '-'}
- **น้ำหนัก / ส่วนสูง**: ${char.weightHeight || '-'}
- **MBTI**: ${char.mbti || '-'}
- **รสนิยมทางเพศ**: ${char.sexualOrientation || '-'}
- **รถที่ใช้**: ${char.car || '-'}
- **กลิ่นน้ำหอม**: ${char.perfume || '-'}
- **ที่อยู่**: ${char.address || '-'}
- **ฐานะ**: ${char.wealthStatus || '-'}
- **อาชีพ**: ${char.occupation || '-'}
- **สไตล์การแต่งตัว**: ${char.fashionStyle || '-'}

## ลักษณะภายนอก (Appearance)

${char.appearanceDesc || '-'}
${char.visualFeatures ? `\nจุดเด่น: ${char.visualFeatures}` : ''}
${visualTagsStr ? `\nแท็กรูปลักษณ์: ${visualTagsStr}` : ''}

### ส่วนลับ(NSFW Info)
* **ส่วนลับชาย:**
  * ขนาดโจ้ย: ${char.nsfwMaleSize || '-'}
* **ส่วนลับหญิง:**
  * ขนาดหน้าอก: ${char.nsfwFemaleChest || '-'}
  * จิ๊มิ: ${char.nsfwFemaleVagina || '-'}

## [นิสัยและพฤติกรรม Psychology & Personality]

${char.coreTraits || '-'}
${pTagsStr ? `\nแท็กนิสัย: ${pTagsStr}` : ''}

### [สิ่งที่ชอบ / สิ่งที่ไม่ชอบ และปฏิกิริยา (Likes & Dislikes Logic)]
**สิ่งที่ชอบ:**
${char.likes.length > 0 ? char.likes.map(l => `- ${l}`).join('\n') : '- ไม่ได้ระบุ'}

**สิ่งที่ไม่ชอบ:**
${char.dislikes.length > 0 ? char.dislikes.map(d => `- ${d}`).join('\n') : '- ไม่ได้ระบุ'}

### พฤติกรรมทั่วไป (General Behaviors)
${char.generalBehaviors || '-'}

### พฤติกรรมพิเศษเฉพาะกับ {{user}} (Exclusive Behaviors for User Only)
${char.userExclusiveBehaviors || '-'}

### [โครงสร้างจิตวิทยา:]
* **1. Core Belief**: ${char.coreBelief || '-'}
* **2. Mindset**: ${char.mindset || '-'}
* **3. Perception**: ${char.perception || '-'}
* **4. Expression**: ${char.expression || '-'}
* **5. Behavior**: ${char.behaviorUnderEmotion || '-'}
* **6. Emotional Triggers**: ${char.emotionalTriggers || '-'}
* **7. Flaws & Weaknesses**: ${char.flawsWeaknesses || '-'}

### **ตัวตนของ {{user}} ในสายตา {{char}}/ ทัศนคติที่เขามีต่อ{{user}}**
- บทบาทในเนื้อเรื่อง (Story Role): ${char.userStoryRole || '-'}
- ความสัมพันธ์เริ่มต้นของ {{user}}: ${char.initialRelationship || '-'}
- ทัศนคติต่อ {{user}}: ${char.userAttitude || '-'}

### [ภูมิหลังความสัมพันธ์ (Backstory & Lore)]
${char.relationshipBackstory || '-'}

### [ขอบเขตพฤติกรรมและ Logic ขั้นเด็ดขาดของ {{char}}]
1. **สิ่งที่จะไม่ทำเด็ดขาด (Absolute Anti-Behaviors)**
${char.absoluteAntiBehaviors || '-'}

2. **ด้านน่ารัก หรือ มุมอ่อนโยนที่ซ่อนอยู่ (Hidden Soft Side)**
${char.hiddenSoftSide || '-'}

3. **ด้านมืด (The Dark Side)**
${char.darkSide || '-'}

### [พฤติกรรมทางเพศและบนเตียง (Sexual Behavior)]
#### 1. สไตล์และแนวทาง (Sexual Style)
${char.sexualStyle || '-'}

#### 2. รสนิยมจำเพาะ (Kinks / Preferences)
${char.kinksPreferences || '-'}

#### 3. การดูแลหลังกิจกรรม (Aftercare Style)
${char.aftercareStyle || '-'}

### [Lifestyle & กิจวัตรประจำวัน (Daily Routine & Lifestyle)]
${char.dailyRoutine || '-'}

### [Core Concept, Setting & Supporting Cast]
### 1. โทนเรื่องและฉากหลัง (Tone & Setting)
${char.toneSetting || '-'}

### 2. ตัวละครเสริมที่มีบทบาทสำคัญ (Supporting Characters)
${char.supportingCharacters.length > 0 ? char.supportingCharacters.map(sc => `- [ชื่อ]: ${sc.name} | [เพศ]: ${sc.gender} | [อายุ]: ${sc.age} | [บุคลิก]: ${sc.personality} | [ความสัมพันธ์]: ${sc.relationship} | [หน้าที่หลักในเรื่อง]: ${sc.mainRole} | [ปรากฎเมื่อ]: ${sc.appearWhen}`).join('\n') : '- ไม่มีตัวละครเสริม'}

🔸กฎข้อห้ามสำหรับตัวละครเสริม: ${char.subCharRules}
🔸สิ่งที่ทำได้: ${char.subCharAllowed}

## คำโปรยสั้นๆ (Short Intro)
${char.shortIntro || '-'}
${char.punchline ? `\nประโยคเด็ด: ${char.punchline}` : ''}

### เนื้อเรื่องย่อ
${char.plotSummary || '-'}

### ข้อมูลสาธารณะ
${char.publicInfo || '-'}

### การใส่แท็กสำหรับจัดหมวดหมู่เรื่องนี้
${catTagsStr || '-'}

### ฉากเปิด (ช่วง Open Greeting)
${char.fullGreeting || char.openGreetingNarrative || '-'}`;
}

/**
 * Generator for [Rubii] Platform
 */
export function generateRubiiOutput(char: ThaiMasterCharacter): RubiiOutput {
  const displayName = char.fullName || char.nickname || 'ตัวละคร';
  const publicDesc = [
    char.publicInfo || char.shortIntro,
    char.categoryTags.length > 0 ? `\nหมวดหมู่: ${char.categoryTags.join(' ')}` : '',
  ].filter(Boolean).join('\n');

  const moment = (char.momentIntro || char.punchline || char.shortIntro || '').slice(0, 100);

  // Fallback system rules if empty
  const defaultRules = [
    `Never break character. Always speak and act authentically as ${displayName}.`,
    `Do not narrate or dictate thoughts, words, or actions for {{user}}.`,
  ];
  const rulesList = char.systemRules.length > 0 ? char.systemRules : defaultRules;

  // Rubii Persona + System Prompt
  const personaLines = [
    `# [CHARACTER PROFILE: ${displayName}]`,
    `[Nickname: ${char.nickname || '-'}] [Age: ${char.age || '-'}] [Gender: ${char.gender || '-'}] [MBTI: ${char.mbti || '-'}]`,
    `[Status: ${char.status || '-'}] [Occupation: ${char.occupation || '-'}]`,
    '',
    `## [APPEARANCE & VISUALS]`,
    char.appearanceDesc || '-',
    char.visualFeatures ? `Features: ${char.visualFeatures}` : '',
    char.visualTags.length > 0 ? `Tags: ${char.visualTags.join(' ')}` : '',
    (char.nsfwMaleSize || char.nsfwFemaleChest) ? `\n### [NSFW DETAILS]\n${char.nsfwMaleSize ? `- Male Size: ${char.nsfwMaleSize}` : ''}\n${char.nsfwFemaleChest ? `- Chest: ${char.nsfwFemaleChest}` : ''}\n${char.nsfwFemaleVagina ? `- Vagina: ${char.nsfwFemaleVagina}` : ''}` : '',
    '',
    `## [CORE PERSONALITY & PSYCHOLOGY]`,
    char.coreTraits || '-',
    char.personalityTags.length > 0 ? `Personality Tags: ${char.personalityTags.join(' ')}` : '',
    '',
    `### [PSYCHOLOGICAL FRAMEWORK]`,
    `- Core Belief: ${char.coreBelief || '-'}`,
    `- Mindset: ${char.mindset || '-'}`,
    `- Perception: ${char.perception || '-'}`,
    `- Expression & Tone: ${char.expression || '-'}`,
    `- Emotional Reactions: ${char.behaviorUnderEmotion || '-'}`,
    `- Emotional Triggers: ${char.emotionalTriggers || '-'}`,
    `- Flaws & Vulnerabilities: ${char.flawsWeaknesses || '-'}`,
    '',
    `## [RELATIONSHIP WITH {{user}}]`,
    `- Role of {{user}}: ${char.userStoryRole || '-'}`,
    `- Initial Dynamic: ${char.initialRelationship || '-'}`,
    `- Attitude: ${char.userAttitude || '-'}`,
    `- Backstory & Lore: ${char.relationshipBackstory || '-'}`,
    '',
    `## [BEHAVIORAL LOGIC & BOUNDARIES]`,
    `### Absolute Anti-Behaviors:`,
    char.absoluteAntiBehaviors || '-',
    `### Soft Side:`,
    char.hiddenSoftSide || '-',
    `### Dark Side:`,
    char.darkSide || '-',
    '',
    (char.sexualStyle || char.kinksPreferences) ? `## [INTIMATE & SEXUAL BEHAVIOR]\n- Style: ${char.sexualStyle || '-'}\n- Kinks: ${char.kinksPreferences || '-'}\n- Aftercare: ${char.aftercareStyle || '-'}\n` : '',
    `## [SYSTEM INSTRUCTIONS & CONSTRAINTS]`,
    ...rulesList.map(r => `- ${r}`),
  ].filter(line => line !== undefined).join('\n');

  const greeting = char.fullGreeting || [char.openGreetingNarrative, char.openGreetingDialogue].filter(Boolean).join('\n\n');

  return {
    name: displayName,
    publicDescription: publicDesc,
    personaSystemPrompt: personaLines,
    momentIntro: moment,
    openGreeting: greeting,
    tokenEstimate: estimateTokens(personaLines),
  };
}

/**
 * Generator for [Purrpaw] Platform
 * Max limit: 30,000 chars (target 18,000 - 20,000 chars)
 */
export function generatePurrpawOutput(char: ThaiMasterCharacter): PurrpawOutput {
  const displayName = char.fullName || char.nickname || 'ตัวละคร';
  const tagline = char.punchline || char.shortIntro || `${displayName} — ${char.occupation || ''}`;
  const allTags = Array.from(new Set([...char.personalityTags, ...char.categoryTags, ...char.visualTags])).join(' ');

  // Supporting Characters formatted for Purrpaw (Max 5)
  const subChars = char.supportingCharacters.slice(0, 5).map(sc => ({
    name: sc.name,
    shortDesc: (sc.shortDesc || `${sc.gender} ${sc.age} | ${sc.relationship} | ${sc.personality}`).slice(0, 500),
    systemPrompt: (sc.systemPrompt || `บทบาท: ${sc.mainRole} | ปรากฏ: ${sc.appearWhen} | บุคลิก: ${sc.personality}`).slice(0, 750),
  }));

  // Locations (Max 10)
  const locations = char.locations.slice(0, 10).map(loc => ({
    name: loc.name,
    prompt: loc.prompt,
  }));

  const systemRulesList = char.systemRules.length > 0
    ? char.systemRules
    : [`โรลเพลย์เป็น ${displayName} อย่างเคร่งครัด`, `ห้ามหลุดคาแรคเตอร์`, `ห้ามพรรณนาแทน {{user}}`];

  // Purrpaw History & Personality Prompt (Comprehensive Markdown DB)
  const historyPrompt = `## **[ประวัติ & บุคลิกภาพตัวละคร - ${displayName}]**

### ข้อมูลเบื้องต้น
- **ชื่อ-นามสกุล:** ${char.fullName || displayName} (${char.nickname || '-'})
- **อายุ:** ${char.age || '-'} | **เพศ:** ${char.gender || '-'} | **MBTI:** ${char.mbti || '-'}
- **สถานะ:** ${char.status || '-'} | **อาชีพ:** ${char.occupation || '-'}
- **ที่อยู่:** ${char.address || '-'} | **ฐานะ:** ${char.wealthStatus || '-'}
- **ยานพาหนะ:** ${char.car || '-'} | **กลิ่นประจำตัว:** ${char.perfume || '-'}
- **สไตล์การแต่งตัว:** ${char.fashionStyle || '-'}

---

### รูปลักษณ์ภายนอก (Appearance)
${char.appearanceDesc || '-'}
${char.visualFeatures ? `\n**จุดเด่นเฉพาะตัว:** ${char.visualFeatures}` : ''}

${char.nsfwMaleSize || char.nsfwFemaleChest ? `### รายละเอียดสรีระเฉพาะ (NSFW Information)
${char.nsfwMaleSize ? `- **ส่วนลับชาย:** ${char.nsfwMaleSize}` : ''}
${char.nsfwFemaleChest ? `- **ขนาดหน้าอก:** ${char.nsfwFemaleChest}` : ''}
${char.nsfwFemaleVagina ? `- **ส่วนลับหญิง:** ${char.nsfwFemaleVagina}` : ''}
` : ''}
---

### นิสัยและจิตวิทยาเชิงลึก (Psychology & Personality)
${char.coreTraits || '-'}

#### สิ่งที่ชอบและสิ่งที่ไม่ชอบ
- **สิ่งที่ชอบ:** ${char.likes.join(', ') || '-'}
- **สิ่งที่ไม่ชอบ:** ${char.dislikes.join(', ') || '-'}

#### พฤติกรรมตามปกติ
${char.generalBehaviors || '-'}

#### พฤติกรรมพิเศษเฉพาะกับ {{user}}
${char.userExclusiveBehaviors || '-'}

---

### โครงสร้างจิตวิทยา 7 มิติ
1. **Core Belief (ความเชื่อรากฐาน):** ${char.coreBelief || '-'}
2. **Mindset (ตรรกะและกระบวนการคิด):** ${char.mindset || '-'}
3. **Perception (การตีความสถานการณ์):** ${char.perception || '-'}
4. **Expression (เอกลักษณ์การสื่อสาร):** ${char.expression || '-'}
5. **Behavior under Emotion (ภาษากายตามอารมณ์):** ${char.behaviorUnderEmotion || '-'}
6. **Emotional Triggers (ตัวกระตุ้นอารมณ์รุนแรง):** ${char.emotionalTriggers || '-'}
7. **Flaws & Weaknesses (จุดอ่อนและปมในใจ):** ${char.flawsWeaknesses || '-'}

---

### ความสัมพันธ์และบทบาทกับ {{user}}
- **บทบาทของ {{user}}:** ${char.userStoryRole || '-'}
- **ความสัมพันธ์แรกเริ่ม:** ${char.initialRelationship || '-'}
- **ทัศนคติที่มีต่อ {{user}}:** ${char.userAttitude || '-'}
- **ภูมิหลังความผูกพัน (Backstory & Lore):**
${char.relationshipBackstory || '-'}

---

### กฎเกณฑ์และขอบเขตพฤติกรรมขั้นเด็ดขาด (Rules & Boundaries)
- **สิ่งที่จะไม่ทำเด็ดขาด:** ${char.absoluteAntiBehaviors || '-'}
- **มุมอ่อนโยนที่ซ่อนไว้:** ${char.hiddenSoftSide || '-'}
- **ด้านมืด/จุดอันตราย:** ${char.darkSide || '-'}

---

${char.sexualStyle ? `### พฤติกรรมทางเพศ (Intimate Behaviors)
- **แนวทางและสไตล์:** ${char.sexualStyle}
- **รสนิยมจำเพาะ:** ${char.kinksPreferences}
- **การดูแลหลังกิจกรรม (Aftercare):** ${char.aftercareStyle}
---
` : ''}

### กฎข้อบังคับระบบ (System Directives)
${systemRulesList.map(r => `- ${r}`).join('\n')}
- ดำรงคาแรคเตอร์อย่างสมจริง ไม่หลุดบทบาท ไม่พรรณนาแทน {{user}}`;

  const greeting = char.fullGreeting || [char.openGreetingNarrative, char.openGreetingDialogue].filter(Boolean).join('\n\n');

  return {
    name: displayName,
    tagline,
    tags: allTags,
    historyPersonalityPrompt: historyPrompt,
    subCharacters: subChars,
    locations,
    initialRelationship: char.initialRelationship || 'คนรู้จัก',
    openGreeting: greeting,
    charCount: historyPrompt.length,
  };
}

/**
 * Generator for [Khui AI] Platform
 */
export function generateKhuiOutput(char: ThaiMasterCharacter): KhuiOutput {
  const displayName = char.fullName || char.nickname || 'ตัวละคร';
  const tagline = char.shortIntro || char.punchline || `${displayName} (${char.occupation || ''})`;
  const allTags = Array.from(new Set([...char.personalityTags, ...char.categoryTags])).join(', ');

  const systemPrompt = `[Character: ${displayName}]
[Traits: ${char.coreTraits || '-'}]
[MBTI: ${char.mbti || '-'}] [Tone: ${char.expression || '-'}]
[Belief: ${char.coreBelief || '-'}]
[Rules: ${char.absoluteAntiBehaviors || '-'}]
[Do not act or speak for {{user}}]`;

  const charDesc = [
    char.publicInfo || char.appearanceDesc,
    char.plotSummary ? `\nเนื้อเรื่องย่อ: ${char.plotSummary}` : '',
  ].filter(Boolean).join('\n');

  const subChars = char.supportingCharacters.slice(0, 3).map(sc => ({
    name: sc.name,
    description: `${sc.gender} ${sc.age} | ${sc.personality} | บทบาท: ${sc.mainRole}`,
  }));

  const greeting = char.fullGreeting || [char.openGreetingNarrative, char.openGreetingDialogue].filter(Boolean).join('\n\n');
  const userRel = `${char.userStoryRole || '-'}\nความสัมพันธ์: ${char.initialRelationship || '-'}\nสถานการณ์: ${char.plotSummary || '-'}`;

  return {
    name: displayName,
    tagline,
    systemPrompt,
    characterDescription: charDesc,
    openGreeting: greeting,
    subCharacters: subChars,
    userRelationshipScenario: userRel,
    tags: allTags,
    charCount: systemPrompt.length + charDesc.length,
  };
}
