export function formatCount(count: number): string {
  return count.toLocaleString('th-TH');
}

// ============================================================
// SedChar.AI v2.0 — Universal Multi-Format Parser & 9-Pillar Generator
// Supports: Plaintext, Markdown, JSON, YAML, and Freeform Text
// Zero-API • 100% In-Browser Local Execution
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
import { DEFAULT_CHARACTER, DEFAULT_SUB_CHARACTER, DEFAULT_LOCATION } from './types';
import { sanitizeTraits } from './intelligentParser';

/**
 * Estimate Token Count (e.g. Gemini / LLM Thai token estimation)
 */
export function estimateTokens(text: string): number {
  if (!text) return 0;
  return Math.ceil(text.length / 3.2);
}

/**
 * Analyze character safety flags (7 dimensions)
 */
export function analyzeCharacterFlag(char: Partial<ThaiMasterCharacter>): CharacterFlagType {
  const text = [
    char.coreTraits,
    char.personalityTags?.join(' '),
    char.generalBehaviors,
    char.userExclusiveBehaviors,
    char.darkSide,
    char.hiddenSoftSide,
    char.userAttitude,
    char.initialRelationship,
  ].filter(Boolean).join(' ').toLowerCase();

  const blackWords = ['ฆ่า', 'ทรมาน', 'วิปริต', 'ฆาตกร', 'โรคจิต', 'ขืนใจ', 'กักขังหน่วงเหนี่ยว', 'ทำลายล้าง', 'ซาดิสม์'];
  const redWords = ['toxic', 'ครอบงำ', 'บงการ', 'ขี้หึงรุนแรง', 'หลอกใช้', 'ทำร้ายจิตใจ', 'ก้าวร้าว', 'หยาบคาย', 'เจ้าอารมณ์'];
  const yellowWords = ['เย็นชา', 'ปากร้าย', 'ซึนเดะระ', 'ซึนเดเระ', 'หยิ่ง', 'ระแวง', 'เข้าถึงยาก', 'ดุ', 'ลับลมคมใน', 'ขี้แกล้ง'];
  const greenWords = ['อบอุ่น', 'ใจดี', 'สุภาพ', 'ให้เกียรติ', 'แสนดี', 'อ่อนโยน', 'ร่าเริง', 'เป็นมิตร', 'ซื่อสัตย์', 'ดูแลเอาใจใส่'];
  const whiteWords = ['บริสุทธิ์', 'ยอมจำนน', 'ไร้เดียงสา', 'ใสซื่อ', 'ให้อภัยเสมอ', 'เชื่อฟัง'];

  const hasBlack = blackWords.some(w => text.includes(w));
  const hasRed = redWords.some(w => text.includes(w));
  const hasYellow = yellowWords.some(w => text.includes(w));
  const hasGreen = greenWords.some(w => text.includes(w));
  const hasWhite = whiteWords.some(w => text.includes(w));

  const hasTsun = text.includes('ซึน') || text.includes('ปากร้ายแต่ใจดี') || (hasYellow && (hasGreen || text.includes('อ่อนโยน')));
  const hasWatermelon = text.includes('หน้าเนื้อใจเสือ') || text.includes('ร้ายลึก') || (hasGreen && (hasRed || hasBlack));

  if (hasBlack) return 'black';
  if (hasWatermelon) return 'watermelon';
  if (hasTsun) return 'reverse-watermelon';
  if (hasRed) return 'red';
  if (hasYellow) return 'yellow';
  if (hasWhite) return 'white';
  if (hasGreen) return 'green';
  return 'none';
}

/**
 * Universal Parser Helper: Clean Value
 */
function cleanVal(v: any): string {
  if (v === null || v === undefined) return '';
  if (typeof v === 'string') {
    const trimmed = v.trim();
    if (trimmed === '-' || trimmed === 'N/A' || trimmed === 'ไม่มี') return '';
    return trimmed;
  }
  if (Array.isArray(v)) return v.map(cleanVal).filter(Boolean).join(', ');
  return String(v).trim();
}

/**
 * 1. JSON Parser
 */
function parseJSONInput(text: string): ThaiMasterCharacter | null {
  const trimmed = text.trim();
  if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) return null;
  try {
    const data = JSON.parse(trimmed);
    const obj = Array.isArray(data) ? data[0] : data;
    if (!obj || typeof obj !== 'object') return null;

    const result: ThaiMasterCharacter = { ...DEFAULT_CHARACTER };
    result.fullName = cleanVal(obj.fullName || obj.name || obj.ชื่อ || obj['ชื่อ-นามสกุล'] || obj.character_name);
    result.nickname = cleanVal(obj.nickname || obj.ชื่อเล่น || obj.nick_name || (result.fullName ? (result.fullName.split(' ')[0] ?? '') : ''));
    result.age = cleanVal(obj.age || obj.อายุ);
    result.gender = cleanVal(obj.gender || obj.เพศ || obj.sex);
    result.status = cleanVal(obj.status || obj.สถานะ);
    result.birthdate = cleanVal(obj.birthdate || obj.วันเกิด || obj.birthday);
    result.weightHeight = cleanVal(obj.weightHeight || obj.ส่วนสูง || obj.weight_height || obj.สัดส่วน);
    result.mbti = cleanVal(obj.mbti || obj.MBTI);
    result.sexualOrientation = cleanVal(obj.sexualOrientation || obj.รสนิยมทางเพศ || obj.orientation);
    result.car = cleanVal(obj.car || obj.รถ || obj.ยานพาหนะ);
    result.perfume = cleanVal(obj.perfume || obj.น้ำหอม || obj.กลิ่นกาย);
    result.address = cleanVal(obj.address || obj.ที่อยู่ || obj.สัญชาติ);
    result.wealthStatus = cleanVal(obj.wealthStatus || obj.ฐานะ || obj.wealth);
    result.occupation = cleanVal(obj.occupation || obj.อาชีพ || obj.job);
    result.fashionStyle = cleanVal(obj.fashionStyle || obj.การแต่งกาย || obj.สไตล์การแต่งตัว);

    result.appearanceDesc = cleanVal(obj.appearanceDesc || obj.appearance || obj.รูปลักษณ์ || obj.ลักษณะ);
    result.visualFeatures = cleanVal(obj.visualFeatures || obj.จุดเด่น);
    if (Array.isArray(obj.visualTags)) result.visualTags = obj.visualTags.map(cleanVal).filter(Boolean);
    else if (obj.visualTags) result.visualTags = cleanVal(obj.visualTags).split(/[,\\s]+/).filter(Boolean);

    result.nsfwMaleSize = cleanVal(obj.nsfwMaleSize || obj.ขนาดลับชาย || obj.male_size);
    result.nsfwFemaleChest = cleanVal(obj.nsfwFemaleChest || obj.ขนาดหน้าอก || obj.chest_size);
    result.nsfwFemaleVagina = cleanVal(obj.nsfwFemaleVagina || obj.จุดซ่อนเร้น || obj.vagina_desc);

    result.coreTraits = cleanVal(obj.coreTraits || obj.traits || obj.personality || obj.นิสัย || obj.นิสัยหลัก);
    if (result.coreTraits) {
      const traitList = result.coreTraits.split(/[,\s]+/).filter(Boolean);
      const sanitized = sanitizeTraits(traitList);
      result.personalityTags = Array.from(new Set([...(result.personalityTags || []), ...sanitized]));
    }
    if (Array.isArray(obj.personalityTags)) result.personalityTags = Array.from(new Set([...result.personalityTags, ...obj.personalityTags.map(cleanVal)]));

    if (Array.isArray(obj.likes)) result.likes = obj.likes.map(cleanVal).filter(Boolean);
    else if (obj.likes) result.likes = cleanVal(obj.likes).split(/[,\n]+/).map(s => s.trim()).filter(Boolean);

    if (Array.isArray(obj.dislikes)) result.dislikes = obj.dislikes.map(cleanVal).filter(Boolean);
    else if (obj.dislikes) result.dislikes = cleanVal(obj.dislikes).split(/[,\n]+/).map(s => s.trim()).filter(Boolean);

    result.generalBehaviors = cleanVal(obj.generalBehaviors || obj.พฤติกรรม || obj.behaviors);
    result.userExclusiveBehaviors = cleanVal(obj.userExclusiveBehaviors || obj.พฤติกรรมกับผู้ใช้ || obj.with_user);
    result.coreBelief = cleanVal(obj.coreBelief || obj.ความเชื่อหลัก);
    result.mindset = cleanVal(obj.mindset || obj.กรอบความคิด);
    result.perception = cleanVal(obj.perception || obj.การรับรู้);
    result.expression = cleanVal(obj.expression || obj.การแสดงออก || obj.น้ำเสียง);
    result.behaviorUnderEmotion = cleanVal(obj.behaviorUnderEmotion || obj.เมื่อมีอารมณ์);
    result.emotionalTriggers = cleanVal(obj.emotionalTriggers || obj.จุดกระตุ้นอารมณ์);
    result.flawsWeaknesses = cleanVal(obj.flawsWeaknesses || obj.จุดอ่อน || obj.ข้อบกพร่อง);

    result.userStoryRole = cleanVal(obj.userStoryRole || obj.บทบาทต่อผู้ใช้);
    result.initialRelationship = cleanVal(obj.initialRelationship || obj.ความสัมพันธ์แรกเริ่ม || obj.relationship);
    result.relationshipBackstory = cleanVal(obj.relationshipBackstory || obj.ปูมหลังความสัมพันธ์);
    result.userAttitude = cleanVal(obj.userAttitude || obj.ทัศนคติต่อผู้ใช้);

    result.absoluteAntiBehaviors = cleanVal(obj.absoluteAntiBehaviors || obj.ข้อห้ามเด็ดขาด || obj.anti_behaviors);
    result.hiddenSoftSide = cleanVal(obj.hiddenSoftSide || obj.มุมอ่อนโยน || obj.soft_side);
    result.darkSide = cleanVal(obj.darkSide || obj.มุมมืด || obj.dark_side);
    if (Array.isArray(obj.systemRules)) result.systemRules = obj.systemRules.map(cleanVal).filter(Boolean);

    result.sexualStyle = cleanVal(obj.sexualStyle || obj.ลีลาบนเตียง || obj.sex_style);
    result.kinksPreferences = cleanVal(obj.kinksPreferences || obj.รสนิยมพิเศษ || obj.kinks);
    result.aftercareStyle = cleanVal(obj.aftercareStyle || obj.aftercare || obj.การดูแลหลังมีเซ็กส์);
    result.dailyRoutine = cleanVal(obj.dailyRoutine || obj.กิจวัตรประจำวัน);
    result.toneSetting = cleanVal(obj.toneSetting || obj.บรรยากาศ || obj.tone);

    result.shortIntro = cleanVal(obj.shortIntro || obj.คำโปรย || obj.tagline);
    result.punchline = cleanVal(obj.punchline || obj.ประโยคเด็ด);
    result.plotSummary = cleanVal(obj.plotSummary || obj.เนื้อเรื่องย่อ);
    result.publicInfo = cleanVal(obj.publicInfo || obj.ข้อมูลสาธารณะ);
    result.momentIntro = cleanVal(obj.momentIntro || obj.สร้างโมเมนต์);
    result.fullGreeting = cleanVal(obj.fullGreeting || obj.greeting || obj.ฉากเปิด || obj.openGreeting);

    result.flagType = analyzeCharacterFlag(result);
    return result;
  } catch {
    return null;
  }
}

/**
 * 2. YAML / Key-Value Parser
 */
function parseYamlOrKvInput(text: string): ThaiMasterCharacter | null {
  const lines = text.split('\n');
  const kvMap: Record<string, string> = {};
  let kvPairsCount = 0;

  for (const line of lines) {
    const match = line.match(/^\s*([A-Za-z0-9_\u0E00-\u0E7F\s-]+)\s*[:=]\s*(.*)$/);
    if (match && match[1] !== undefined && match[2] !== undefined) {
      const key = match[1].trim().toLowerCase();
      const val = match[2].trim().replace(/^["']|["']$/g, '');
      kvMap[key] = val;
      kvPairsCount++;
    }
  }

  if (kvPairsCount < 3) return null;

  const result: ThaiMasterCharacter = { ...DEFAULT_CHARACTER };
  result.fullName = kvMap['name'] || kvMap['fullname'] || kvMap['ชื่อ'] || kvMap['ชื่อ-นามสกุล'] || kvMap['ชื่อเต็ม'] || '';
  result.nickname = kvMap['nickname'] || kvMap['ชื่อเล่น'] || (result.fullName ? (result.fullName.split(' ')[0] ?? '') : '');
  result.age = kvMap['age'] || kvMap['อายุ'] || '';
  result.gender = kvMap['gender'] || kvMap['เพศ'] || '';
  result.status = kvMap['status'] || kvMap['สถานะ'] || '';
  result.occupation = kvMap['occupation'] || kvMap['job'] || kvMap['อาชีพ'] || '';
  result.mbti = (kvMap['mbti'] || kvMap['บุคลิกภาพ'] || '').toUpperCase();
  result.address = kvMap['address'] || kvMap['ที่อยู่'] || '';
  result.perfume = kvMap['perfume'] || kvMap['กลิ่น'] || kvMap['น้ำหอม'] || '';
  result.car = kvMap['car'] || kvMap['รถ'] || '';
  result.wealthStatus = kvMap['wealth'] || kvMap['ฐานะ'] || '';
  result.fashionStyle = kvMap['fashion'] || kvMap['การแต่งกาย'] || kvMap['สไตล์'] || '';

  result.appearanceDesc = kvMap['appearance'] || kvMap['รูปลักษณ์'] || kvMap['ลักษณะภายนอก'] || '';
  result.coreTraits = kvMap['coretraits'] || kvMap['traits'] || kvMap['personality'] || kvMap['นิสัย'] || kvMap['นิสัยหลัก'] || '';
  if (result.coreTraits) {
    const traitList = result.coreTraits.split(/[,\s]+/).filter(Boolean);
    result.personalityTags = sanitizeTraits(traitList);
  }

  const likesStr = kvMap['likes'] || kvMap['ชอบ'] || kvMap['สิ่งที่ชอบ'] || '';
  if (likesStr) result.likes = likesStr.split(/[,\s]+/).filter(Boolean);
  const dislikesStr = kvMap['dislikes'] || kvMap['เกลียด'] || kvMap['สิ่งที่ไม่ชอบ'] || '';
  if (dislikesStr) result.dislikes = dislikesStr.split(/[,\s]+/).filter(Boolean);

  result.generalBehaviors = kvMap['generalbehaviors'] || kvMap['behaviors'] || kvMap['habits'] || kvMap['พฤติกรรม'] || '';
  result.userExclusiveBehaviors = kvMap['userexclusivebehaviors'] || kvMap['withuser'] || kvMap['พฤติกรรมกับผู้ใช้'] || '';
  result.initialRelationship = kvMap['relationship'] || kvMap['ความสัมพันธ์'] || '';
  result.userAttitude = kvMap['attitude'] || kvMap['ทัศนคติ'] || '';
  result.fullGreeting = kvMap['greeting'] || kvMap['opengreeting'] || kvMap['ฉากเปิด'] || kvMap['คำทักทาย'] || '';
  result.shortIntro = kvMap['tagline'] || kvMap['intro'] || kvMap['คำโปรย'] || '';
  result.punchline = kvMap['punchline'] || kvMap['ประโยคเด็ด'] || '';

  result.flagType = analyzeCharacterFlag(result);
  return result;
}

/**
 * 3. Freeform Plaintext Parser
 */
function parseFreeformPlaintext(text: string): ThaiMasterCharacter {
  const result: ThaiMasterCharacter = { ...DEFAULT_CHARACTER };

  const extract = (pattern: RegExp): string => {
    const match = text.match(pattern);
    return match && match[1] ? match[1].trim() : '';
  };

  result.fullName = extract(/(?:ชื่อเต็ม|ชื่อ-นามสกุล|ชื่อจริง|Full Name)\s*[:=]?\s*([^\n]+)/i);
  result.nickname = extract(/(?:ชื่อเล่น|ชื่อย่อ|เรียกสั้นๆ ว่า|Nickname)\s*[:=]?\s*([^\n]+)/i);
  result.age = extract(/(?:อายุ|วัย|Age)\s*[:=]?\s*([^\n]+)/i);
  result.gender = extract(/(?:เพศ|Gender|Sex)\s*[:=]?\s*([^\n]+)/i);
  result.status = extract(/(?:สถานะ|บทบาท|Status)\s*[:=]?\s*([^\n]+)/i);
  result.occupation = extract(/(?:อาชีพ|ทำงานเป็น|Occupation|Job)\s*[:=]?\s*([^\n]+)/i);
  result.mbti = (extract(/(?:MBTI|ไทป์|Personality Type)\s*[:=]?\s*([A-Za-z]{4})/i) ?? '').toUpperCase();
  result.wealthStatus = extract(/(?:ฐานะ|ความมั่งคั่ง|Wealth)\s*[:=]?\s*([^\n]+)/i);
  result.address = extract(/(?:ที่อยู่|สัญชาติ|อาศัยอยู่ที่|Address)\s*[:=]?\s*([^\n]+)/i);
  result.perfume = extract(/(?:กลิ่นกาย|น้ำหอม|กลิ่นประจำตัว|Perfume|Scent)\s*[:=]?\s*([^\n]+)/i);
  result.appearanceDesc = extract(/(?:รูปลักษณ์|ลักษณะภายนอก|หน้าตา|สรีระ|Appearance)\s*[:=]?\s*([^\n]+)/i);
  result.coreTraits = extract(/(?:นิสัย|บุคลิก|นิสัยหลัก|ลักษณะนิสัย|Personality|Traits)\s*[:=]?\s*([^\n]+)/i);

  if (result.coreTraits) {
    const traitList = result.coreTraits.split(/[,\s]+/).filter(Boolean);
    result.personalityTags = sanitizeTraits(traitList);
  }

  if (!result.fullName && !result.nickname) {
    const firstLine = (text.trim().split('\n')[0] ?? '').replace(/^#+\s*/, '').trim();
    if (firstLine.length < 30) {
      result.nickname = firstLine;
    }
  }

  result.flagType = analyzeCharacterFlag(result);
  return result;
}

/**
 * 4. Standard Tag-Based Markdown Parser (Main Entry)
 */
export function parseMarkdownToCharacter(rawMarkdown: string): ThaiMasterCharacter {
  // 1. JSON input
  const jsonChar = parseJSONInput(rawMarkdown);
  if (jsonChar) return jsonChar;

  // 2. If it's structured Markdown (has headings or bold labels), parse with standard Markdown parser below
  const isMarkdown = rawMarkdown.includes('##') || rawMarkdown.includes('**');

  // 3. If not markdown, try YAML / Key-Value or Plaintext
  if (!isMarkdown) {
    const yamlChar = parseYamlOrKvInput(rawMarkdown);
    if (yamlChar) return yamlChar;

    const plainChar = parseFreeformPlaintext(rawMarkdown);
    if (plainChar.nickname || plainChar.fullName) return plainChar;
  }

  // Parse Standard Tag-Based Markdown format
  const result: ThaiMasterCharacter = { ...DEFAULT_CHARACTER };

  const getField = (pattern: RegExp): string => {
    const match = rawMarkdown.match(pattern);
    if (!match || !match[1]) return '';
    const val = match[1].trim();
    return val === '-' || val === 'N/A' || val === 'ไม่มี' ? '' : val;
  };

  result.nickname = getField(/[-*]\s+\*\*ชื่อเล่น\*\*:\s*([^\n]+)/);
  result.fullName = getField(/[-*]\s+\*\*ชื่อเต็ม\*\*:\s*([^\n]+)/) || getField(/[-*]\s+\*\*ชื่อ-นามสกุล\*\*:\s*([^\n]+)/);
  result.age = getField(/[-*]\s+\*\*อายุ\*\*:\s*([^\n]+)/);
  result.gender = getField(/[-*]\s+\*\*เพศ\*\*:\s*([^\n]+)/);
  result.status = getField(/[-*]\s+\*\*สถานะ(?:\/บทบาท)?\*\*:\s*([^\n]+)/);
  result.birthdate = getField(/[-*]\s+\*\*(?:วันเดือนปีเกิด|วันเกิด\/ราศี)\*\*:\s*([^\n]+)/);
  result.weightHeight = getField(/[-*]\s+\*\*(?:น้ำหนัก \/ ส่วนสูง|ส่วนสูง\/น้ำหนัก)\*\*:\s*([^\n]+)/);
  result.mbti = getField(/[-*]\s+\*\*MBTI\*\*:\s*([^\n]+)/);
  result.sexualOrientation = getField(/[-*]\s+\*\*รสนิยมทางเพศ\*\*:\s*([^\n]+)/);
  result.car = getField(/[-*]\s+\*\*(?:รถที่ใช้|รถยนต์\/ยานพาหนะ)\*\*:\s*([^\n]+)/);
  result.perfume = getField(/[-*]\s+\*\*(?:กลิ่นน้ำหอม|กลิ่นกาย\/น้ำหอม)\*\*:\s*([^\n]+)/);
  result.address = getField(/[-*]\s+\*\*(?:ที่อยู่|ที่อยู่\/สัญชาติ)\*\*:\s*([^\n]+)/);
  result.wealthStatus = getField(/[-*]\s+\*\*ฐานะ\*\*:\s*([^\n]+)/);
  result.occupation = getField(/[-*]\s+\*\*อาชีพ\*\*:\s*([^\n]+)/);
  result.fashionStyle = getField(/[-*]\s+\*\*สไตล์การแต่งตัว\*\*:\s*([^\n]+)/);

  // Appearance
  const appMatch = rawMarkdown.match(/## ลักษณะภายนอก \(Appearance\)\s*\n\n([\s\S]*?)(?=\n(?:จุดเด่น|แท็กรูปลักษณ์|### ส่วนลับ|##))/);
  if (appMatch && appMatch[1]) result.appearanceDesc = appMatch[1].trim().replace(/^-$/, '');

  result.visualFeatures = getField(/(?:จุดเด่น|จุดเด่นทางกายภาพ):\s*([^\n]+)/);
  const visualTagsStr = getField(/(?:แท็กรูปลักษณ์|แท็กลักษณะ):\s*([^\n]+)/);
  if (visualTagsStr) result.visualTags = visualTagsStr.split(/[\s,]+/).filter(Boolean);

  result.nsfwMaleSize = getField(/ขนาด(?:โจ้ย|สรีระส่วนลับ \(ชาย\)):\s*([^\n]+)/);
  result.nsfwFemaleChest = getField(/ขนาดหน้าอก(?: \(หญิง\))?:\s*([^\n]+)/);
  result.nsfwFemaleVagina = getField(/(?:จิ๊มิ|จุดซ่อนเร้น\/สรีระ \(หญิง\)|สรีระส่วนสงวน \(หญิง\)):\s*([^\n]+)/);

  // Psychology & Personality
  const coreTraitsMatch = rawMarkdown.match(/## \[?นิสัยและพฤติกรรม(?: Psychology & Personality)?\]?\s*\n\n([\s\S]*?)(?=\n(?:แท็กนิสัย|###))/);
  if (coreTraitsMatch && coreTraitsMatch[1]) result.coreTraits = coreTraitsMatch[1].trim().replace(/^-$/, '');

  const pTagsStr = getField(/แท็กนิสัย:\s*([^\n]+)/);
  if (pTagsStr) result.personalityTags = pTagsStr.split(/[\s,]+/).filter(Boolean);

  // Likes & Dislikes
  const likesMatch = rawMarkdown.match(/\*\*สิ่งที่ชอบ(?:มาก)?\:\*\*\s*\n([\s\S]*?)(?=\n\*\*สิ่งที่ไม่ชอบ|$)/);
  const likesText = likesMatch ? likesMatch[1] : undefined;
  if (likesText) {
    result.likes = likesText.split('\n').map(l => l.replace(/^[-*]\s*/, '').trim()).filter(l => l && l !== '- ไม่ได้ระบุ' && l !== '-');
  }
  const dislikesMatch = rawMarkdown.match(/\*\*สิ่งที่ไม่ชอบ(?:และกลัว)?\:\*\*\s*\n([\s\S]*?)(?=\n###|$)/);
  const dislikesText = dislikesMatch ? dislikesMatch[1] : undefined;
  if (dislikesText) {
    result.dislikes = dislikesText.split('\n').map(l => l.replace(/^[-*]\s*/, '').trim()).filter(l => l && l !== '- ไม่ได้ระบุ' && l !== '-');
  }

  // Psychology 7 items
  result.coreBelief = getField(/Core Belief\*?:\s*([^\n]+)/);
  result.mindset = getField(/Mindset\*?:\s*([^\n]+)/);
  result.perception = getField(/Perception\*?:\s*([^\n]+)/);
  result.expression = getField(/Expression\*?:\s*([^\n]+)/);
  result.behaviorUnderEmotion = getField(/(?:Behavior under Emotion|Behavior)\*?:\s*([^\n]+)/);
  result.emotionalTriggers = getField(/Emotional Triggers\*?:\s*([^\n]+)/);
  result.flawsWeaknesses = getField(/Flaws & Weaknesses\*?:\s*([^\n]+)/);

  // Relationship with {{user}}
  result.userStoryRole = getField(/บทบาท(?:ในเนื้อเรื่อง|ในชีวิตของ \{\{user\}\})\s*(?:\(Story Role\))?:\s*([^\n]+)/);
  result.initialRelationship = getField(/ความสัมพันธ์(?:เริ่มต้นของ \{\{user\}\}|แรกเริ่ม):\s*([^\n]+)/);
  result.userAttitude = getField(/ทัศนคติต่อ \{\{user\}\}:\s*([^\n]+)/);

  const backstoryMatch = rawMarkdown.match(/### \[?ภูมิหลังความสัมพันธ์(?: \(Backstory & Lore\))?\]?\s*\n([\s\S]*?)(?=\n### \[?ขอบเขต|##|$)/);
  if (backstoryMatch && backstoryMatch[1]) result.relationshipBackstory = backstoryMatch[1].trim().replace(/^-$/, '');

  result.absoluteAntiBehaviors = getField(/1\.\s*\*\*สิ่งที่จะไม่ทำเด็ดขาด\s*(?:\(Absolute Anti-Behaviors\))?\*\*\s*\n([\s\S]*?)(?=\n2\.|\n###|$)/);
  result.hiddenSoftSide = getField(/2\.\s*\*\*ด้านน่ารัก หรือ มุมอ่อนโยนที่ซ่อนอยู่\s*(?:\(Hidden Soft Side\))?\*\*\s*\n([\s\S]*?)(?=\n3\.|\n###|$)/);
  result.darkSide = getField(/3\.\s*\*\*ด้านมืด\s*(?:\(The Dark Side\))?\*\*\s*\n([\s\S]*?)(?=\n###|##|$)/);

  // Sub characters
  const subCharBlocks = rawMarkdown.split(/### ตัวละครเสริม #\d+:\s*/).slice(1);
  if (subCharBlocks.length > 0) {
    result.supportingCharacters = subCharBlocks.map((blk, idx) => {
      const name = (blk.match(/^([^\n]+)/) || [])[1]?.trim() || `ตัวละครเสริม #${idx + 1}`;
      const rel = (blk.match(/[-*]\s+ความสัมพันธ์:\s*([^\n]+)/) || [])[1]?.trim() || '';
      const personality = (blk.match(/[-*]\s+บุคลิก:\s*([^\n]+)/) || [])[1]?.trim() || '';
      const mainRole = (blk.match(/[-*]\s+บทบาท:\s*([^\n]+)/) || [])[1]?.trim() || '';
      const shortDesc = (blk.match(/[-*]\s+คำอธิบาย:\s*([^\n]+)/) || [])[1]?.trim() || '';
      const systemPrompt = (blk.match(/[-*]\s+(?:บทบาท\/คำสั่ง|คำสั่งเฉพาะ):\s*([^\n]+)/) || [])[1]?.trim() || '';
      return {
        id: `sub-${idx + 1}`,
        name,
        gender: '',
        age: '',
        personality,
        relationship: rel,
        mainRole,
        appearWhen: '',
        shortDesc,
        systemPrompt,
      };
    });
  }

  // Locations
  const locSectionMatch = rawMarkdown.match(/## (?:9\. )?(?:สถานที่และบรรยากาศ|ฉากหลัง & สถานที่)[\s\S]*?(?=\n##|$)/);
  if (locSectionMatch) {
    const locLines = locSectionMatch[0].match(/[-*]\s+\*\*([^*]+)\*\*:\s*([^\n]+)/g);
    if (locLines) {
      result.locations = locLines.map((l, i) => {
        const m = l.match(/[-*]\s+\*\*([^*]+)\*\*:\s*([^\n]+)/);
        return {
          id: `loc-${i + 1}`,
          name: (m && m[1]) ? m[1].trim() : `สถานที่ #${i + 1}`,
          prompt: (m && m[2]) ? m[2].trim() : '',
        };
      });
    }
  }

  // Open greeting
  const greetingMatch = rawMarkdown.match(/### ฉากเปิด \((?:ช่วง )?Open Greeting\)\s*\n([\s\S]*)$/);
  if (greetingMatch && greetingMatch[1]) result.fullGreeting = greetingMatch[1].trim().replace(/^-$/, '');

  result.flagType = analyzeCharacterFlag(result);
  return result;
}

/**
 * Format Full Master Markdown (25,000 Chars High-Density Schema)
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

## [พฤติกรรมทางเพศ - Intimate Behaviors]
- **สไตล์บนเตียง:** ${char.sexualStyle || '-'}
- **รสนิยม:** ${char.kinksPreferences || '-'}
- **การดูแลหลังกิจกรรม (Aftercare):** ${char.aftercareStyle || '-'}

## [Lifestyle]
${char.dailyRoutine || '-'}

## [ฉากหลัง & สถานที่ (World Setting & Locations)]
- **โทนเรื่อง:** ${char.toneSetting || '-'}
${char.locations.length > 0 ? char.locations.map(l => `- **${l.name}**: ${l.prompt}`).join('\n') : '- ไม่ได้ระบุ'}

## [ตัวละครเสริม (Supporting Characters)]
- **กฎการแทรกบท:** ${char.subCharRules || '-'}
- **เงื่อนไขที่อนุญาต:** ${char.subCharAllowed || '-'}
${char.supportingCharacters.length > 0 ? char.supportingCharacters.map((sub, i) => `### ตัวละครเสริม #${i + 1}: ${sub.name}
- ความสัมพันธ์: ${sub.relationship}
- บุคลิก: ${sub.personality}
- บทบาท: ${sub.mainRole}
- คำอธิบาย: ${sub.shortDesc}
- คำสั่งเฉพาะ: ${sub.systemPrompt}`).join('\n\n') : ''}

## [คำโปรย & ช่องทางการโปรโมต (Promotions)]
- **คำโปรยสั้น:** ${char.shortIntro || '-'}
- **ประโยคเด็ด:** ${char.punchline || '-'}
- **สร้างโมเมนต์:** ${char.momentIntro || '-'}
- **หมวดหมู่:** ${catTagsStr || '-'}

### ฉากเปิด (ช่วง Open Greeting)
${char.fullGreeting || '-'}`;
}

/**
 * Generator for [Rubii] Platform (Full 9-Pillar High-Density Persona + System Prompt)
 */
export function generateRubiiOutput(char: ThaiMasterCharacter): RubiiOutput {
  const displayName = char.fullName || char.nickname || 'ตัวละคร';
  const publicDesc = [
    char.publicInfo || char.shortIntro,
    char.categoryTags.length > 0 ? `\nหมวดหมู่: ${char.categoryTags.join(' ')}` : '',
  ].filter(Boolean).join('\n');

  const moment = (char.momentIntro || char.punchline || char.shortIntro || '').slice(0, 100);

  const defaultRules = [
    `Never break character. Always speak and act authentically as ${displayName}.`,
    `Do not narrate, think, or dictate thoughts, words, or actions for {{user}}.`,
    `Maintain realistic Thai conversational pronouns and tonality based on relationship dynamics.`,
  ];
  const rulesList = char.systemRules.length > 0 ? char.systemRules : defaultRules;

  const lines: string[] = [
    `[Character("${displayName}")]`,
    `{`,
    `  // 1. ข้อมูลพื้นฐาน (Basic Profile)`,
    char.nickname ? `  ชื่อเล่น("${char.nickname}")` : '',
    char.fullName ? `  ชื่อเต็ม("${char.fullName}")` : '',
    char.age ? `  อายุ("${char.age}")` : '',
    char.gender ? `  เพศ("${char.gender}")` : '',
    char.status ? `  สถานะ("${char.status}")` : '',
    char.occupation ? `  อาชีพ("${char.occupation}")` : '',
    char.wealthStatus ? `  ฐานะ("${char.wealthStatus}")` : '',
    char.birthdate ? `  วันเกิด("${char.birthdate}")` : '',
    char.weightHeight ? `  สัดส่วน("${char.weightHeight}")` : '',
    char.mbti ? `  MBTI("${char.mbti}")` : '',
    char.sexualOrientation ? `  รสนิยมทางเพศ("${char.sexualOrientation}")` : '',
    char.address ? `  ที่อยู่("${char.address}")` : '',
    char.perfume ? `  กลิ่นกาย("${char.perfume}")` : '',
    char.car ? `  ยานพาหนะ("${char.car}")` : '',
    char.fashionStyle ? `  การแต่งกาย("${char.fashionStyle}")` : '',
    '',
    `  // 2. รูปลักษณ์ (Appearance)`,
    char.appearanceDesc ? `  รูปลักษณ์("${char.appearanceDesc.replace(/\n/g, ' ')}")` : '',
    char.visualFeatures ? `  จุดเด่นทางกายภาพ("${char.visualFeatures.replace(/\n/g, ' ')}")` : '',
    char.visualTags.length > 0 ? `  แท็กลักษณะ("${char.visualTags.join(', ')}")` : '',
    '',
    `  // 3. ส่วนลับ NSFW (Intimate & Sexual Dynamics)`,
    char.nsfwMaleSize ? `  ขนาดลับชาย("${char.nsfwMaleSize}")` : '',
    char.nsfwFemaleChest ? `  ขนาดหน้าอกหญิง("${char.nsfwFemaleChest}")` : '',
    char.nsfwFemaleVagina ? `  สรีระลับหญิง("${char.nsfwFemaleVagina}")` : '',
    char.sexualStyle ? `  พฤติกรรมบนเตียง("${char.sexualStyle.replace(/\n/g, ' ')}")` : '',
    char.kinksPreferences ? `  รสนิยมพิเศษ("${char.kinksPreferences.replace(/\n/g, ' ')}")` : '',
    char.aftercareStyle ? `  การดูแลหลังเซ็กส์("${char.aftercareStyle.replace(/\n/g, ' ')}")` : '',
    '',
    `  // 4. จิตวิทยาและนิสัย (Psychology & Personality)`,
    char.coreTraits ? `  นิสัยหลัก("${char.coreTraits.replace(/\n/g, ' ')}")` : '',
    char.personalityTags.length > 0 ? `  แท็กนิสัย("${char.personalityTags.join(', ')}")` : '',
    char.coreBelief ? `  ปมในใจและความเชื่อ("${char.coreBelief.replace(/\n/g, ' ')}")` : '',
    char.mindset ? `  กรอบความคิด("${char.mindset.replace(/\n/g, ' ')}")` : '',
    char.perception ? `  มุมมองต่อโลก("${char.perception.replace(/\n/g, ' ')}")` : '',
    char.expression ? `  น้ำเสียงและการพูด("${char.expression.replace(/\n/g, ' ')}")` : '',
    char.behaviorUnderEmotion ? `  พฤติกรรมยามอารมณ์แปรปรวน("${char.behaviorUnderEmotion.replace(/\n/g, ' ')}")` : '',
    char.emotionalTriggers ? `  จุดกระตุ้นอารมณ์("${char.emotionalTriggers.replace(/\n/g, ' ')}")` : '',
    char.flawsWeaknesses ? `  จุดอ่อนและข้อบกพร่อง("${char.flawsWeaknesses.replace(/\n/g, ' ')}")` : '',
    char.darkSide ? `  ด้านมืด("${char.darkSide.replace(/\n/g, ' ')}")` : '',
    char.hiddenSoftSide ? `  มุมอ่อนโยนที่ซ่อนไว้("${char.hiddenSoftSide.replace(/\n/g, ' ')}")` : '',
    char.generalBehaviors ? `  พฤติกรรมทั่วไป("${char.generalBehaviors.replace(/\n/g, ' ')}")` : '',
    char.dailyRoutine ? `  กิจวัตรประจำวัน("${char.dailyRoutine.replace(/\n/g, ' ')}")` : '',
    '',
    `  // 5. สิ่งที่ชอบ & เกลียด (Likes & Dislikes)`,
    char.likes.length > 0 ? `  สิ่งที่ชอบมาก("${char.likes.join(', ')}")` : '',
    char.dislikes.length > 0 ? `  สิ่งที่เกลียดและกลัว("${char.dislikes.join(', ')}")` : '',
    '',
    `  // 6. ความสัมพันธ์กับ {{user}} (Relationship Dynamics)`,
    char.userStoryRole ? `  บทบาทต่อผู้ใช้("${char.userStoryRole.replace(/\n/g, ' ')}")` : '',
    char.initialRelationship ? `  ความสัมพันธ์แรกเริ่ม("${char.initialRelationship}")` : '',
    char.relationshipBackstory ? `  ปูมหลังความสัมพันธ์("${char.relationshipBackstory.replace(/\n/g, ' ')}")` : '',
    char.userAttitude ? `  ทัศนคติต่อผู้ใช้("${char.userAttitude.replace(/\n/g, ' ')}")` : '',
    char.userExclusiveBehaviors ? `  พฤติกรรมเมื่ออยู่กับผู้ใช้("${char.userExclusiveBehaviors.replace(/\n/g, ' ')}")` : '',
    '',
    `  // 7. กฎระบบและข้อห้ามเด็ดขาด (System Directives & Constraints)`,
    `  กฎระบบ("ห้ามสวมบทบาท คิด หรือกระทำการใดๆ แทน {{user}} เด็ดขาด + คงบุคลิกและน้ำเสียงอย่างสม่ำเสมอ")`,
    char.absoluteAntiBehaviors ? `  ข้อห้ามเด็ดขาด("${char.absoluteAntiBehaviors.replace(/\n/g, ' ')}")` : '',
    ...rulesList.map(r => `  กฎเหล็ก("${r}")`),
  ];

  if (char.supportingCharacters && char.supportingCharacters.length > 0) {
    lines.push('');
    lines.push('  // 8. ตัวละครเสริมในเรื่อง (Supporting Characters)');
    if (char.subCharRules) lines.push(`  กฎการแทรกบท("${char.subCharRules}")`);
    char.supportingCharacters.forEach((sub, i) => {
      const subInfo = [
        sub.name ? 'ชื่อ: ' + sub.name : '',
        sub.relationship ? 'ความสัมพันธ์: ' + sub.relationship : '',
        sub.personality ? 'นิสัย: ' + sub.personality : '',
        sub.shortDesc ? 'คำอธิบาย: ' + sub.shortDesc : '',
        sub.systemPrompt ? 'บทบาท: ' + sub.systemPrompt : '',
      ].filter(Boolean).join(' | ');
      lines.push(`  ตัวละครเสริม_${i + 1}("${subInfo.replace(/\n/g, ' ')}")`);
    });
  }

  if (char.toneSetting || (char.locations && char.locations.length > 0)) {
    lines.push('');
    lines.push('  // 9. บรรยากาศและสถานที่ในเรื่อง (Locations & World Setting)');
    if (char.toneSetting) lines.push(`  โทนบรรยากาศ("${char.toneSetting.replace(/\n/g, ' ')}")`);
    char.locations.forEach((loc, i) => {
      if (loc.name || loc.prompt) {
        lines.push(`  สถานที่_${i + 1}("${loc.name}: ${loc.prompt.replace(/\n/g, ' ')}")`);
      }
    });
  }

  lines.push('}');
  const personaPrompt = lines.filter(Boolean).join('\n');

  return {
    name: displayName,
    publicDescription: publicDesc,
    personaSystemPrompt: personaPrompt,
    momentIntro: moment,
    openGreeting: char.fullGreeting || char.openGreetingNarrative || '',
    tokenEstimate: estimateTokens(personaPrompt),
  };
}

/**
 * Generator for [Purrpaw] Platform (High-Density Target: 18,000–30,000 Characters)
 */
export function generatePurrpawOutput(char: ThaiMasterCharacter): PurrpawOutput {
  const displayName = char.fullName || char.nickname || 'ตัวละคร';
  const tagline = char.punchline || char.shortIntro || '-';
  const tags = char.categoryTags.join(', ') || '#general';

  const defaultRules = [
    `ห้ามพิมพ์บทสนทนา คิด หรือตัดสินใจกระทำการใดๆ แทน {{user}} โดยเด็ดขาด`,
    `ยึดมั่นในบุคลิกภาพ น้ำเสียง และทัศนคติของ ${displayName} อย่างสม่ำเสมอ`,
    `สื่อสารด้วยสรรพนามภาษาไทยที่เป็นธรรมชาติ สอดคล้องกับระดับความสัมพันธ์และสถานการณ์`,
  ];
  const rulesList = char.systemRules.length > 0 ? char.systemRules : defaultRules;

  const historySections: string[] = [
    `# SYSTEM PROMPT: ${displayName.toUpperCase()} (PURRPAW HIGH-DENSITY PROFILE)`,
    `คุณต้องสวมบทบาทเป็น ${displayName} อย่างสมจริงและเคร่งครัดตามโครงสร้างข้อมูลทั้งหมดต่อไปนี้`,
    '',
    `## 1. ข้อมูลพื้นฐานและประวัติส่วนตัว (Basic Identity)`,
    `- ชื่อ-นามสกุล: ${char.fullName || '-'}`,
    `- ชื่อเล่น: ${char.nickname || '-'}`,
    `- อายุ: ${char.age || '-'}`,
    `- เพศ: ${char.gender || '-'}`,
    `- สถานะ/บทบาท: ${char.status || '-'}`,
    `- อาชีพ: ${char.occupation || '-'}`,
    `- ฐานะทางสังคม: ${char.wealthStatus || '-'}`,
    `- วันเกิด/ราศี: ${char.birthdate || '-'}`,
    `- สัดส่วน/น้ำหนัก/ส่วนสูง: ${char.weightHeight || '-'}`,
    `- MBTI: ${char.mbti || '-'}`,
    `- รสนิยมทางเพศ: ${char.sexualOrientation || '-'}`,
    `- ที่อยู่/สัญชาติ: ${char.address || '-'}`,
    `- กลิ่นกาย/น้ำหอม: ${char.perfume || '-'}`,
    `- รถยนต์/ยานพาหนะ: ${char.car || '-'}`,
    `- สไตล์การแต่งตัว: ${char.fashionStyle || '-'}`,
    '',
    `## 2. รูปลักษณ์ภายนอกและลักษณะเด่น (Physical Appearance)`,
    char.appearanceDesc || '-',
    char.visualFeatures ? `- จุดเด่นทางกายภาพ: ${char.visualFeatures}` : '',
    char.visualTags.length > 0 ? `- แท็กลักษณะ: ${char.visualTags.join(', ')}` : '',
    '',
    `## 3. มิติทางเพศและส่วนลับ NSFW (Intimate & Sexual Dynamics)`,
    char.nsfwMaleSize ? `- ขนาดสรีระส่วนลับ (ชาย): ${char.nsfwMaleSize}` : '',
    char.nsfwFemaleChest ? `- ขนาดหน้าอก (หญิง): ${char.nsfwFemaleChest}` : '',
    char.nsfwFemaleVagina ? `- สรีระส่วนสงวน (หญิง): ${char.nsfwFemaleVagina}` : '',
    char.sexualStyle ? `### ลีลาและพฤติกรรมบนเตียง\n${char.sexualStyle}` : '',
    char.kinksPreferences ? `### รสนิยมและความชอบเฉพาะ (Kinks)\n${char.kinksPreferences}` : '',
    char.aftercareStyle ? `### การดูแลหลังร่วมรัก (Aftercare)\n${char.aftercareStyle}` : '',
    '',
    `## 4. โครงสร้างจิตวิทยาและบุคลิกภาพ (Psychology & Core Personality)`,
    `### นิสัยหลักและแก่นแท้\n${char.coreTraits || '-'}`,
    char.personalityTags.length > 0 ? `- แท็กนิสัย: ${char.personalityTags.join(', ')}` : '',
    `### ปมในอดีตและความเชื่อหลัก (Core Belief)\n${char.coreBelief || '-'}`,
    `### กรอบความคิด (Mindset)\n${char.mindset || '-'}`,
    `### การรับรู้ต่อสิ่งรอบข้าง (Perception)\n${char.perception || '-'}`,
    `### การแสดงออกและน้ำเสียง (Expression)\n${char.expression || '-'}`,
    `### พฤติกรรมเมื่อเผชิญอารมณ์ (Behavior Under Emotion)\n${char.behaviorUnderEmotion || '-'}`,
    `### จุดกระตุ้นอารมณ์ (Emotional Triggers)\n${char.emotionalTriggers || '-'}`,
    `### ข้อบกพร่องและความเปราะบาง (Flaws & Weaknesses)\n${char.flawsWeaknesses || '-'}`,
    char.darkSide ? `### ด้านมืดที่ซ่อนอยู่ (Dark Side)\n${char.darkSide}` : '',
    char.hiddenSoftSide ? `### มุมอ่อนโยนที่เผยเฉพาะคนสำคัญ (Hidden Soft Side)\n${char.hiddenSoftSide}` : '',
    char.generalBehaviors ? `### พฤติกรรมทั่วไปในชีวิตประจำวัน\n${char.generalBehaviors}` : '',
    char.dailyRoutine ? `### กิจวัตรประจำวัน\n${char.dailyRoutine}` : '',
    '',
    `## 5. สิ่งที่ชอบและสิ่งที่เกลียด (Likes & Dislikes)`,
    char.likes.length > 0 ? `- สิ่งที่ชอบมาก: ${char.likes.join(', ')}` : '',
    char.dislikes.length > 0 ? `- สิ่งที่ไม่ชอบ/เกลียด/กลัว: ${char.dislikes.join(', ')}` : '',
    '',
    `## 6. ความสัมพันธ์และพลวัตกับ {{user}} (Relationship with {{user}})`,
    `- บทบาทในชีวิตของ {{user}}: ${char.userStoryRole || '-'}`,
    `- ความสัมพันธ์แรกเริ่ม: ${char.initialRelationship || '-'}`,
    char.relationshipBackstory ? `### ปูมหลังความผูกพัน\n${char.relationshipBackstory}` : '',
    char.userAttitude ? `### ทัศนคติที่มีต่อ {{user}}\n${char.userAttitude}` : '',
    char.userExclusiveBehaviors ? `### พฤติกรรมเฉพาะตัวเมื่ออยู่กับ {{user}}\n${char.userExclusiveBehaviors}` : '',
    '',
    `## 7. กฎเหล็กของระบบและข้อห้ามเด็ดขาด (System Directives & Strict Rules)`,
    `- [STRICT] ห้ามพิมพ์บทสนทนา คิด หรือตัดสินใจกระทำการใดๆ แทน {{user}} โดยเด็ดขาด`,
    `- [ROLEPLAY] สวมบทบาทเป็น ${displayName} อย่างต่อเนื่อง มีมิติอารมณ์ และไม่หลุดคาแรกเตอร์`,
    `- [LANGUAGE] ใช้สรรพนามและสำนวนภาษาไทยที่สมจริงตามความสนิทสนม`,
    char.absoluteAntiBehaviors ? `- [ข้อห้ามเด็ดขาด]: ${char.absoluteAntiBehaviors}` : '',
    ...rulesList.map(r => `- ${r}`),
  ];

  if (char.supportingCharacters && char.supportingCharacters.length > 0) {
    historySections.push('');
    historySections.push('## 8. บุคคลรอบข้างและตัวละครเสริม (Supporting Characters Context)');
    if (char.subCharRules) historySections.push(`- กฎการแทรกบท: ${char.subCharRules}`);
    char.supportingCharacters.forEach((sub, i) => {
      historySections.push(`- **${sub.name || 'ตัวละครเสริม #' + (i + 1)}**: ${sub.relationship || ''} — ${sub.shortDesc || sub.personality || '-'}`);
    });
  }

  if (char.toneSetting || (char.locations && char.locations.length > 0)) {
    historySections.push('');
    historySections.push('## 9. สถานที่สำคัญและบรรยากาศ (Locations & World Setting)');
    if (char.toneSetting) historySections.push(`### โทนบรรยากาศ\n${char.toneSetting}`);
    char.locations.forEach(loc => {
      if (loc.name || loc.prompt) {
        historySections.push(`- **${loc.name}**: ${loc.prompt}`);
      }
    });
  }

  const finalHistoryPrompt = historySections.filter(Boolean).join('\n');

  return {
    name: displayName,
    tagline,
    tags,
    historyPersonalityPrompt: finalHistoryPrompt,
    subCharacters: char.supportingCharacters.map(s => ({
      name: s.name,
      shortDesc: (s.shortDesc || s.personality || '').slice(0, 500),
      systemPrompt: (s.systemPrompt || s.mainRole || '').slice(0, 750),
    })),
    locations: char.locations.map(l => ({
      name: l.name,
      prompt: l.prompt,
    })),
    initialRelationship: char.initialRelationship || '-',
    openGreeting: char.fullGreeting || char.openGreetingNarrative || '',
    charCount: (displayName + tagline + tags + finalHistoryPrompt + (char.fullGreeting || '')).length,
  };
}

/**
 * Generator for [Khui AI] Platform (Structured Format covering 9 Pillars)
 */
export function generateKhuiOutput(char: ThaiMasterCharacter): KhuiOutput {
  const displayName = char.fullName || char.nickname || 'ตัวละคร';
  const tagline = char.shortIntro || char.punchline || '-';

  const defaultRules = [
    `ห้ามพิมพ์คำพูดหรือบรรยายการกระทำแทน {{user}} เด็ดขาด`,
    `คงบุคลิกภาพ น้ำเสียง และทัศนคติตามที่กำหนดไว้เสมอ`,
  ];
  const rulesList = char.systemRules.length > 0 ? char.systemRules : defaultRules;

  const promptParts: string[] = [
    `[SYSTEM DIRECTIVE] (Character: ${displayName})`,
    `โรลเพลย์เป็น ${displayName} อย่างสมจริง ไม่สวมบทแทน {{user}}`,
    '',
    '=== 1. ข้อมูลพื้นฐาน & รูปลักษณ์ ===',
    `- อายุ/เพศ: ${char.age || '-'} / ${char.gender || '-'}`,
    `- อาชีพ/ฐานะ: ${char.occupation || '-'} / ${char.wealthStatus || '-'}`,
    `- MBTI/สัดส่วน: ${char.mbti || '-'} / ${char.weightHeight || '-'}`,
    `- กลิ่นกาย/การแต่งกาย: ${char.perfume || '-'} / ${char.fashionStyle || '-'}`,
    char.appearanceDesc ? `- รูปลักษณ์: ${char.appearanceDesc}` : '',
    char.visualFeatures ? `- จุดเด่น: ${char.visualFeatures}` : '',
    '',
    '=== 2. จิตวิทยา & บุคลิกภาพ ===',
    char.coreTraits ? `- นิสัยหลัก: ${char.coreTraits}` : '',
    char.coreBelief ? `- ปมในใจ: ${char.coreBelief}` : '',
    char.expression ? `- การแสดงออก/น้ำเสียง: ${char.expression}` : '',
    char.behaviorUnderEmotion ? `- เมื่อมีอารมณ์: ${char.behaviorUnderEmotion}` : '',
    char.darkSide ? `- ด้านมืด: ${char.darkSide}` : '',
    char.hiddenSoftSide ? `- ด้านอ่อนโยน: ${char.hiddenSoftSide}` : '',
    '',
    '=== 3. NSFW & ความชอบ ===',
    (char.nsfwMaleSize || char.nsfwFemaleChest) ? `- สรีระส่วนลับ: ${char.nsfwMaleSize || char.nsfwFemaleChest}` : '',
    char.sexualStyle ? `- ลีลาบนเตียง: ${char.sexualStyle}` : '',
    char.kinksPreferences ? `- รสนิยม: ${char.kinksPreferences}` : '',
    char.aftercareStyle ? `- Aftercare: ${char.aftercareStyle}` : '',
    char.likes.length > 0 ? `- สิ่งที่ชอบ: ${char.likes.join(', ')}` : '',
    char.dislikes.length > 0 ? `- สิ่งที่ไม่ชอบ: ${char.dislikes.join(', ')}` : '',
    '',
    '=== 4. ความสัมพันธ์กับ {{user}} & กฎเหล็ก ===',
    char.userStoryRole ? `- บทบาทต่อ {{user}}: ${char.userStoryRole}` : '',
    char.initialRelationship ? `- ความสัมพันธ์: ${char.initialRelationship}` : '',
    char.userAttitude ? `- ทัศนคติ: ${char.userAttitude}` : '',
    char.userExclusiveBehaviors ? `- พฤติกรรมเมื่ออยู่กับ {{user}}: ${char.userExclusiveBehaviors}` : '',
    char.absoluteAntiBehaviors ? `- ข้อห้ามเด็ดขาด: ${char.absoluteAntiBehaviors}` : '',
    ...rulesList.map(r => `- ${r}`),
  ];

  if (char.toneSetting || (char.locations && char.locations.length > 0)) {
    promptParts.push('');
    promptParts.push('=== 5. บรรยากาศและสถานที่ในเรื่อง ===');
    if (char.toneSetting) promptParts.push(`บรรยากาศ: ${char.toneSetting}`);
    char.locations.forEach(l => {
      if (l.name || l.prompt) promptParts.push(`- ${l.name}: ${l.prompt}`);
    });
  }

  const systemPrompt = promptParts.filter(Boolean).join('\n');

  // Character Description page
  const descParts: string[] = [
    char.shortIntro ? char.shortIntro : '',
    char.appearanceDesc ? `【รูปลักษณ์】\n${char.appearanceDesc}` : '',
    char.coreTraits ? `【บุคลิกภาพ】\n${char.coreTraits}` : '',
    char.generalBehaviors ? `【พฤติกรรม】\n${char.generalBehaviors}` : '',
    char.toneSetting ? `【บรรยากาศในเรื่อง】\n${char.toneSetting}` : '',
  ].filter(Boolean);

  const characterDescription = descParts.join('\n\n') || (char.appearanceDesc || char.coreTraits || 'หน้าคำอธิบายตัวละคร');

  // Supporting characters (Max 3 for Khui AI)
  const subChars = (char.supportingCharacters || []).slice(0, 3).map(s => ({
    name: s.name || 'ตัวละครเสริม',
    description: [
      s.relationship ? `[${s.relationship}]` : '',
      s.shortDesc || s.personality || s.systemPrompt || '',
    ].filter(Boolean).join(' ') || '-',
  }));

  const relScenario = [
    `ความสัมพันธ์: ${char.initialRelationship || '-'}`,
    char.relationshipBackstory ? `ปูมหลัง: ${char.relationshipBackstory}` : '',
    `ทัศนคติ: ${char.userAttitude || '-'}`
  ].filter(Boolean).join('\n');

  const tags = char.categoryTags.join(', ') || '#general, #roleplay';

  return {
    name: displayName,
    tagline,
    systemPrompt,
    characterDescription,
    openGreeting: char.fullGreeting || char.openGreetingNarrative || '',
    subCharacters: subChars,
    userRelationshipScenario: relScenario,
    tags,
    charCount: (displayName + tagline + systemPrompt + characterDescription + (char.fullGreeting || '') + relScenario + tags).length,
  };
}
