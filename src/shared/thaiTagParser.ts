// ============================================================
// SedChar.AI v2.0 — Universal Multi-Format Parser Engine
// Supports: Markdown, Plaintext, JSON, YAML, and Freeform Text
// TypeScript strict mode: zero any allowed
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
 * Approximate token count for Gemini / Claude / GPT models with Thai text
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
 * Intelligent Flag Analyzer: Detects relationship flags based on keywords (SKILL_SPECIFICATION.md)
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

  if (
    allText.includes('ธงดำ') ||
    allText.includes('โรคจิต') ||
    allText.includes('คลั่งรักรุนแรง') ||
    allText.includes('อันตรายถึงชีวิต') ||
    allText.includes('กักขัง')
  ) {
    return 'black';
  }

  const isColdOutside = allText.includes('ปากร้าย') || allText.includes('ดุ') || allText.includes('เย็นชา') || allText.includes('ซึน') || allText.includes('ปากแข็ง');
  const isWarmInside = allText.includes('ใจดี') || allText.includes('อบอุ่น') || allText.includes('ห่วงใย') || allText.includes('ปกป้อง') || allText.includes('อ่อนโยน') || allText.includes('แอบชอบ');
  if (
    allText.includes('ซึนเดเระ') ||
    allText.includes('ซึนเดะระ') ||
    allText.includes('ซินเดเระ') ||
    allText.includes('ปากร้ายใจดี') ||
    allText.includes('ธงแตงโมกลับด้าน') ||
    (isColdOutside && isWarmInside)
  ) {
    return 'reverse-watermelon';
  }

  const isSweetOutside = allText.includes('อบอุ่น') || allText.includes('หน้ายิ้ม') || allText.includes('สุภาพ') || allText.includes('อ่อนหวาน') || allText.includes('แสนดี');
  const isManipulativeInside = allText.includes('เจ้าเล่ห์') || allText.includes('บงการ') || allText.includes('พิษสง') || allText.includes('ร้ายลึก') || allText.includes('หน้าเนื้อใจเสือ');
  if (
    allText.includes('ธงแตงโม') ||
    (isSweetOutside && isManipulativeInside)
  ) {
    return 'watermelon';
  }

  if (
    allText.includes('ธงแดง') ||
    allText.includes('toxic') ||
    allText.includes('ครอบงำ') ||
    allText.includes('บงการ') ||
    allText.includes('ควบคุม') ||
    allText.includes('ทำร้าย') ||
    allText.includes('นอกใจ') ||
    allText.includes('เจ้าอารมณ์')
  ) {
    return 'red';
  }

  if (
    allText.includes('ธงเขียว') ||
    allText.includes('ให้เกียรติ') ||
    allText.includes('ปลอดภัย') ||
    allText.includes('แสนดี') ||
    allText.includes('รักเดียวใจเดียว') ||
    allText.includes('ใจเย็น') ||
    allText.includes('ร่าเริง') ||
    (allText.includes('อบอุ่น') && !isManipulativeInside)
  ) {
    return 'green';
  }

  return 'none';
}

/**
 * Universal Ingestion: Parses Markdown, JSON, YAML, or Plaintext into ThaiMasterCharacter
 */
export function parseMarkdownToCharacter(rawInput: string): ThaiMasterCharacter {
  if (!rawInput || !rawInput.trim()) {
    return { ...DEFAULT_CHARACTER };
  }

  const trimmed = rawInput.trim();

  // 1. JSON Ingestion
  if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
    try {
      const obj = JSON.parse(trimmed);
      if (typeof obj === 'object' && obj !== null && !Array.isArray(obj)) {
        return parseJsonObjectToCharacter(obj as Record<string, unknown>);
      }
    } catch (_) {}
  }

  // 2. Multi-Format Text / Markdown / YAML Parsing
  const result: ThaiMasterCharacter = { ...DEFAULT_CHARACTER };
  const lines = rawInput.split(/\r?\n/);

  const cleanVal = (v: string): string => {
    return v.replace(/^[*_~`"'\s]+|[*_~`"'\s]+$/g, '').trim();
  };

  const extractValue = (pattern: string): string => {
    const lineRegex = new RegExp('^(?:[\\*\\-#•>\\s]*)(?:\\*\\*)?(?:' + pattern + ')(?:\\*\\*)?\\s*[:=]\\s*(.+)$', 'im');
    for (const line of lines) {
      const match = line.match(lineRegex);
      if (match && match[1]) {
        return cleanVal(match[1]);
      }
    }
    const freeRegex = new RegExp('(?:' + pattern + ')\\s*[:=]?\\s*([^\\n\\r,;|]+)', 'i');
    const freeMatch = rawInput.match(freeRegex);
    if (freeMatch && freeMatch[1]) {
      const val = cleanVal(freeMatch[1]);
      if (val && !val.startsWith('#')) return val;
    }
    return '';
  };

  // Profile
  result.nickname = extractValue('ชื่อเล่น|ชื่อย่อ|nickname');
  result.fullName = extractValue('ชื่อเต็ม|ชื่อ-นามสกุล|ชื่อจริง|ชื่อตัวละคร|ชื่อ|fullname|name');
  if (!result.fullName && result.nickname) result.fullName = result.nickname;
  if (!result.nickname && result.fullName) result.nickname = result.fullName.split(' ')[0] || result.fullName;

  result.age = extractValue('อายุ|age');
  result.gender = extractValue('เพศ|gender|sex');
  result.status = extractValue('สถานะความสัมพันธ์|สถานะ|status');
  result.birthdate = extractValue('วันเดือนปีเกิด|วันเกิด|ราศี|birthdate|birthday');
  result.weightHeight = extractValue('น้ำหนัก\\s*\\/?\\s*ส่วนสูง|ส่วนสูง\\s*\\/?\\s*น้ำหนัก|น้ำหนัก|ส่วนสูง|height|weight');
  result.mbti = extractValue('MBTI');
  if (!result.mbti) {
    const mbtiMatch = rawInput.match(/\b(INTJ|INTP|ENTJ|ENTP|INFJ|INFP|ENFJ|ENFP|ISTJ|ISFJ|ESTJ|ESFJ|ISTP|ISFP|ESTP|ESFP)\b/i);
    if (mbtiMatch && mbtiMatch[1]) result.mbti = mbtiMatch[1].toUpperCase();
  }

  result.sexualOrientation = extractValue('รสนิยมทางเพศ|รสนิยม|orientation|sexuality');
  result.occupation = extractValue('อาชีพ|ตำแหน่ง|หน้าที่|occupation|job');
  result.wealthStatus = extractValue('ฐานะทางการเงิน|ฐานะ|wealth');
  result.car = extractValue('รถที่ใช้|ยานพาหนะ|รถยนต์|car|vehicle');
  result.perfume = extractValue('กลิ่นน้ำหอมประจำตัว|กลิ่นน้ำหอม|น้ำหอม|perfume|scent');
  result.address = extractValue('ที่อยู่\\s*\\/?\\s*ฐานที่มั่น|ที่อยู่|ฐานที่มั่น|address|residence');
  result.fashionStyle = extractValue('สไตล์การแต่งตัว|การแต่งกาย|เครื่องแต่งกาย|fashion|outfit');

  // NSFW
  result.nsfwMaleSize = extractValue('ขนาดโจ้ย|ส่วนลับชาย|ขนาดอวัยวะเพศชาย|penis_size|male_size');
  result.nsfwFemaleChest = extractValue('ขนาดหน้าอก|รอบอก|cup_size|breast_size|chest');
  result.nsfwFemaleVagina = extractValue('จิ๊มิ|ส่วนลับหญิง|vagina_desc');

  // Section Slicing
  const extractSection = (startPatterns: string[], endPatterns: string[]): string => {
    let startIdx = -1;
    let endIdx = lines.length;
    const startReg = new RegExp('(?:#{1,4}\\s*|[\\[(])?(?:' + startPatterns.join('|') + ')', 'i');
    const endReg = new RegExp('(?:#{1,4}\\s*|[\\[(])?(?:' + endPatterns.join('|') + ')', 'i');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i] || '';
      if (startIdx === -1 && startReg.test(line)) {
        startIdx = i + 1;
      } else if (startIdx !== -1 && endPatterns.length > 0 && endReg.test(line)) {
        endIdx = i;
        break;
      }
    }
    if (startIdx !== -1 && startIdx < endIdx) {
      return lines.slice(startIdx, endIdx).join('\n').trim();
    }
    return '';
  };

  const appearanceSec = extractSection(
    ['ลักษณะภายนอก', 'Appearance', 'Visual', 'รูปลักษณ์'],
    ['ส่วนลับ', 'นิสัย', 'Psychology', 'บุคลิก', 'Personality']
  );
  if (appearanceSec) {
    result.appearanceDesc = appearanceSec.replace(/^[-*•]\s+/gm, '').trim();
  }

  const extractTags = (text: string): string[] => {
    const tags = text.match(/#[\w\u0E00-\u0E7F_-]+/g);
    if (!tags) return [];
    return Array.from(new Set(tags));
  };

  const allVisualTags = extractTags(appearanceSec || rawInput);
  if (allVisualTags.length > 0) {
    result.visualTags = allVisualTags;
  }

  // Psychology & Personality
  const personalitySec = extractSection(
    ['นิสัยและพฤติกรรม', 'Psychology', 'Personality', 'บุคลิกภาพ'],
    ['สิ่งที่ชอบ', 'พฤติกรรม', 'ความสัมพันธ์', 'กฎ', 'System']
  );
  result.coreTraits = extractValue('แก่นแท้บุคลิกภาพ|นิสัยหลัก|บุคลิกเด่น|ลักษณะนิสัย|นิสัย|coreTraits|personality') || (personalitySec ? personalitySec.slice(0, 200).trim() : '');
  const pTags = extractTags(personalitySec || rawInput);
  if (pTags.length > 0) {
    result.personalityTags = sanitizeTraits(pTags);
  }
  result.coreBelief = extractValue('ความเชื่อหลัก|coreBelief');
  result.mindset = extractValue('กรอบความคิด|mindset');
  result.perception = extractValue('การรับรู้|perception');
  result.expression = extractValue('น้ำเสียงและจังหวะการพูด|การแสดงออก|expression|speakingTone');
  result.behaviorUnderEmotion = extractValue('พฤติกรรมเมื่ออารมณ์เปลี่ยน|behaviorUnderEmotion');
  result.emotionalTriggers = extractValue('จุดเร้าประสาทสัมผัส|สิ่งที่กระตุ้นอารมณ์|emotionalTriggers|sensoryTriggers');
  result.flawsWeaknesses = extractValue('จุดอ่อนและข้อบกพร่อง|จุดอ่อน|flawsWeaknesses');
  result.darkSide = extractValue('จุดดาร์ก|มุมมืด|darkSide|dark_side');
  result.hiddenSoftSide = extractValue('มุมอ่อนโยน|จุดอ่อนโยนที่ซ่อนไว้|hiddenSoftSide|soft_side');

  const likesVal = extractValue('สิ่งที่ชอบ|ชอบ|likes');
  if (likesVal) result.likes = likesVal.split(/[,+]/).map(cleanVal).filter(Boolean);
  const dislikesVal = extractValue('สิ่งที่ไม่ชอบ|เกลียด|dislikes');
  if (dislikesVal) result.dislikes = dislikesVal.split(/[,+]/).map(cleanVal).filter(Boolean);

  // Behaviors
  result.generalBehaviors = extractValue('พฤติกรรมทั่วไป|generalBehaviors') || extractSection(['พฤติกรรมทั่วไป'], ['พฤติกรรมเฉพาะ', 'พฤติกรรมต้องห้าม']);
  result.userExclusiveBehaviors = extractValue('พฤติกรรมเฉพาะเมื่ออยู่กับ|userExclusiveBehaviors') || extractSection(['พฤติกรรมเฉพาะ'], ['พฤติกรรมต้องห้าม', 'ทัศนคติ']);
  result.absoluteAntiBehaviors = extractValue('พฤติกรรมต้องห้าม|สิ่งที่ตัวละครจะไม่ทำเด็ดขาด|absoluteAntiBehaviors');
  result.userAttitude = extractValue('ทัศนคติต่อ|userAttitude');
  result.initialRelationship = extractValue('ความสัมพันธ์แรกเริ่ม|initialRelationship');
  result.relationshipBackstory = extractValue('ภูมิหลังความสัมพันธ์|relationshipBackstory');
  result.userStoryRole = extractValue('บทบาทของผู้ใช้|userStoryRole');

  // Sexual Style
  result.sexualStyle = extractValue('สไตล์บนเตียง|sexualStyle');
  result.kinksPreferences = extractValue('ความชอบเฉพาะ|kinksPreferences');
  result.aftercareStyle = extractValue('การดูแลหลังกิจกรรม|aftercareStyle');
  result.dailyRoutine = extractValue('กิจวัตรประจำวัน|dailyRoutine');
  result.toneSetting = extractValue('บรรยากาศหลัก|toneSetting');

  // Rules
  const rulesSec = extractSection(['กฎเหล็ก', 'System Rules', 'กฎของระบบ'], ['ตัวละครเสริม', 'สถานที่', 'คำโปรย']);
  if (rulesSec) {
    result.systemRules = rulesSec.split('\n').map(l => l.replace(/^[-*•\d.]+\s*/, '').trim()).filter(Boolean);
  }

  // Sub Characters (Max 5)
  const subSection = extractSection(['ตัวละครเสริม', 'Supporting Characters'], ['สถานที่', 'คำโปรย', 'ฉากเปิด']);
  const subMatches = (subSection || rawInput).match(/###\s*ตัวละครเสริม\s*#?\d*[:\s]*([^\n]+)/gi);
  if (subMatches && subMatches.length > 0) {
    const subs: SubCharacter[] = [];
    for (let i = 0; i < Math.min(subMatches.length, 5); i++) {
      const titleLine = subMatches[i] || '';
      const name = titleLine.replace(/^###\s*ตัวละครเสริม\s*#?\d*[:\s]*/i, '').trim();
      subs.push({
        ...DEFAULT_SUB_CHARACTER,
        id: 'sub-' + (i + 1),
        name,
        shortDesc: 'ตัวละครเสริม: ' + name,
        systemPrompt: 'บทบาทของ ' + name + ' ในเรื่อง'
      });
    }
    result.supportingCharacters = subs;
  }

  // Locations (Max 10)
  const locSection = extractSection(['สถานที่ในเรื่อง', 'Locations'], ['คำโปรย', 'ฉากเปิด']);
  const locMatches = (locSection || rawInput).match(/[-*•]\s*\*\*สถานที่\s*#?\d*\*\*[:\s]*([^\n(]+)/gi);
  if (locMatches && locMatches.length > 0) {
    const locs: LocationItem[] = [];
    for (let i = 0; i < Math.min(locMatches.length, 10); i++) {
      const line = locMatches[i] || '';
      const name = line.replace(/^[-*•\s]*(\*\*)?สถานที่\s*#?\d*(\*\*)?[:\s]*/i, '').replace(/\(.*\)/, '').trim();
      locs.push({
        ...DEFAULT_LOCATION,
        id: 'loc-' + (i + 1),
        name,
        prompt: 'ฉาก: ' + name
      });
    }
    result.locations = locs;
  }

  // Intro & Greeting
  result.shortIntro = extractValue('คำโปรยสั้นๆ|คำโปรย|shortIntro|intro');
  result.punchline = extractValue('ประโยคเด็ด|punchline');
  result.momentIntro = extractValue('สร้างโมเมนต์|โมเมนต์|momentIntro|moment');
  if (result.momentIntro.length > 100) result.momentIntro = result.momentIntro.slice(0, 100);
  const catTags = extractTags(extractValue('หมวดหมู่|แท็กสำหรับจัดหมวดหมู่|categoryTags|tags') || rawInput);
  if (catTags.length > 0) result.categoryTags = catTags;

  const greetingSec = extractSection(
    ['ฉากเปิด', 'Open Greeting', 'Greeting', 'ข้อความแรกทักทาย', 'ข้อความเปิดเรื่อง'],
    []
  );
  result.fullGreeting = greetingSec || extractValue('ฉากเปิด|Open Greeting|greeting');
  if (!result.fullGreeting) {
    const quoteMatch = rawInput.match(/"([^"\n]{30,})"/);
    if (quoteMatch && quoteMatch[1]) result.fullGreeting = cleanVal(quoteMatch[1]);
  }

  result.flagType = analyzeCharacterFlag(result);
  return result;
}

function parseJsonObjectToCharacter(obj: Record<string, unknown>): ThaiMasterCharacter {
  const char: ThaiMasterCharacter = { ...DEFAULT_CHARACTER };
  const getStr = (keys: string[]): string => {
    for (const k of keys) {
      if (typeof obj[k] === 'string') return (obj[k] as string).trim();
      if (typeof obj[k] === 'number') return String(obj[k]);
    }
    return '';
  };
  const getArr = (keys: string[]): string[] => {
    for (const k of keys) {
      if (Array.isArray(obj[k])) return (obj[k] as unknown[]).map(String);
      if (typeof obj[k] === 'string') return (obj[k] as string).split(/[,+]/).map(s => s.trim()).filter(Boolean);
    }
    return [];
  };

  char.nickname = getStr(['nickname', 'ชื่อเล่น', 'nick']);
  char.fullName = getStr(['fullName', 'name', 'ชื่อเต็ม', 'ชื่อจริง', 'ชื่อ']);
  if (!char.fullName && char.nickname) char.fullName = char.nickname;
  if (!char.nickname && char.fullName) char.nickname = char.fullName.split(' ')[0] || char.fullName;

  char.age = getStr(['age', 'อายุ']);
  char.gender = getStr(['gender', 'sex', 'เพศ']);
  char.status = getStr(['status', 'สถานะ']);
  char.birthdate = getStr(['birthdate', 'birthday', 'วันเกิด']);
  char.weightHeight = getStr(['weightHeight', 'height', 'weight', 'ส่วนสูง', 'น้ำหนัก']);
  char.mbti = getStr(['mbti', 'MBTI']);
  char.sexualOrientation = getStr(['sexualOrientation', 'sexuality', 'รสนิยม']);
  char.occupation = getStr(['occupation', 'job', 'อาชีพ']);
  char.wealthStatus = getStr(['wealthStatus', 'wealth', 'ฐานะ']);
  char.car = getStr(['car', 'รถที่ใช้']);
  char.perfume = getStr(['perfume', 'น้ำหอม']);
  char.address = getStr(['address', 'ที่อยู่']);
  char.fashionStyle = getStr(['fashionStyle', 'fashion', 'การแต่งตัว']);

  char.appearanceDesc = getStr(['appearanceDesc', 'appearance', 'visual', 'ลักษณะภายนอก']);
  char.visualTags = getArr(['visualTags', 'visuals', 'tags']);
  char.coreTraits = getStr(['coreTraits', 'traits', 'personality', 'นิสัย']);
  
  const rawPTags = getArr(['personalityTags', 'personality', 'traits']);
  const splitPTags = rawPTags.flatMap(t => t.split(/[,+\s]+/)).filter(Boolean);
  char.personalityTags = sanitizeTraits(splitPTags);
  if (splitPTags.length > 0 && !char.coreTraits) {
    char.coreTraits = char.personalityTags.join(', ');
  }

  char.likes = getArr(['likes', 'ชอบ']);
  char.dislikes = getArr(['dislikes', 'เกลียด']);
  char.coreBelief = getStr(['coreBelief', 'ความเชื่อหลัก']);
  char.mindset = getStr(['mindset', 'กรอบความคิด']);
  char.expression = getStr(['expression', 'speakingTone', 'น้ำเสียง', 'การแสดงออก']);
  char.emotionalTriggers = getStr(['emotionalTriggers', 'sensoryTriggers', 'จุดเร้าประสาท']);
  char.darkSide = getStr(['darkSide', 'มุมมืด']);
  char.hiddenSoftSide = getStr(['hiddenSoftSide', 'มุมอ่อนโยน']);

  char.generalBehaviors = getStr(['generalBehaviors', 'พฤติกรรมทั่วไป']);
  char.userExclusiveBehaviors = getStr(['userExclusiveBehaviors', 'พฤติกรรมเฉพาะ']);
  char.absoluteAntiBehaviors = getStr(['absoluteAntiBehaviors', 'พฤติกรรมต้องห้าม']);
  char.userAttitude = getStr(['userAttitude', 'ทัศนคติ']);
  char.initialRelationship = getStr(['initialRelationship', 'ความสัมพันธ์แรกเริ่ม']);

  char.systemRules = getArr(['systemRules', 'กฎ']);
  char.shortIntro = getStr(['shortIntro', 'intro', 'คำโปรย']);
  char.punchline = getStr(['punchline', 'ประโยคเด็ด']);
  char.momentIntro = getStr(['momentIntro', 'moment', 'โมเมนต์']).slice(0, 100);
  char.categoryTags = getArr(['categoryTags', 'categories', 'หมวดหมู่']);
  char.fullGreeting = getStr(['fullGreeting', 'greeting', 'openGreeting', 'ฉากเปิด']);

  char.flagType = analyzeCharacterFlag(char);
  return char;
}

export function characterToFullMarkdown(char: ThaiMasterCharacter): string {
  const sections: string[] = [];
  sections.push('# 📋 ข้อมูลตัวละคร: ' + (char.fullName || char.nickname || 'ตัวละครใหม่'));
  sections.push('');
  sections.push('## **[1. ข้อมูลพื้นฐาน - Character Profile]**');
  sections.push('- **ชื่อเล่น**: ' + (char.nickname || '-'));
  sections.push('- **ชื่อเต็ม**: ' + (char.fullName || '-'));
  sections.push('- **อายุ**: ' + (char.age || '-'));
  sections.push('- **เพศ**: ' + (char.gender || '-'));
  sections.push('- **สถานะ**: ' + (char.status || '-'));
  sections.push('- **วันเดือนปีเกิด**: ' + (char.birthdate || '-'));
  sections.push('- **น้ำหนัก / ส่วนสูง**: ' + (char.weightHeight || '-'));
  sections.push('- **MBTI**: ' + (char.mbti || '-'));
  sections.push('- **รสนิยมทางเพศ**: ' + (char.sexualOrientation || '-'));
  sections.push('- **อาชีพ**: ' + (char.occupation || '-'));
  sections.push('- **ฐานะ**: ' + (char.wealthStatus || '-'));
  sections.push('- **รถที่ใช้**: ' + (char.car || '-'));
  sections.push('- **กลิ่นน้ำหอม**: ' + (char.perfume || '-'));
  sections.push('- **ที่อยู่**: ' + (char.address || '-'));
  sections.push('- **สไตล์การแต่งตัว**: ' + (char.fashionStyle || '-'));
  sections.push('');

  sections.push('## **[2. ลักษณะภายนอก & NSFW - Appearance]**');
  sections.push('- **คำบรรยายรูปลักษณ์**: ' + (char.appearanceDesc || '-'));
  if (char.visualTags.length > 0) sections.push('- **Visual Tags**: ' + char.visualTags.join(' '));
  if (char.nsfwMaleSize) sections.push('- **ขนาดส่วนลับชาย**: ' + char.nsfwMaleSize);
  if (char.nsfwFemaleChest) sections.push('- **ขนาดหน้าอก**: ' + char.nsfwFemaleChest);
  if (char.nsfwFemaleVagina) sections.push('- **ส่วนลับหญิง**: ' + char.nsfwFemaleVagina);
  sections.push('');

  sections.push('## **[3. นิสัยและบุคลิกภาพ - Psychology]**');
  sections.push('- **แก่นแท้บุคลิกภาพ**: ' + (char.coreTraits || '-'));
  if (char.personalityTags.length > 0) sections.push('- **Personality Tags**: ' + char.personalityTags.join(' '));
  if (char.likes.length > 0) sections.push('- **สิ่งที่ชอบ**: ' + char.likes.join(', '));
  if (char.dislikes.length > 0) sections.push('- **สิ่งที่ไม่ชอบ**: ' + char.dislikes.join(', '));
  if (char.darkSide) sections.push('- **จุดดาร์ก**: ' + char.darkSide);
  if (char.hiddenSoftSide) sections.push('- **มุมอ่อนโยน**: ' + char.hiddenSoftSide);
  sections.push('');

  sections.push('## **[4. พฤติกรรม & ความสัมพันธ์กับ {{user}}]**');
  sections.push('- **พฤติกรรมทั่วไป**: ' + (char.generalBehaviors || '-'));
  sections.push('- **พฤติกรรมเฉพาะเมื่ออยู่กับ {{user}}**: ' + (char.userExclusiveBehaviors || '-'));
  sections.push('- **พฤติกรรมต้องห้าม**: ' + (char.absoluteAntiBehaviors || '-'));
  sections.push('- **ทัศนคติต่อ {{user}}**: ' + (char.userAttitude || '-'));
  sections.push('- **ความสัมพันธ์แรกเริ่ม**: ' + (char.initialRelationship || '-'));
  sections.push('');

  sections.push('## **[5. น้ำเสียง, บทสนทนา & กฎระบบ]**');
  sections.push('- **จุดเร้าประสาทสัมผัส**: ' + (char.emotionalTriggers || '-'));
  sections.push('- **น้ำเสียงและจังหวะการพูด**: ' + (char.expression || '-'));
  if (char.systemRules.length > 0) {
    sections.push('### กฎเหล็กของระบบ');
    char.systemRules.forEach(r => sections.push('- ' + r));
  }
  sections.push('');

  if (char.supportingCharacters.length > 0) {
    sections.push('## **[6. ตัวละครเสริม - Supporting Characters]**');
    char.supportingCharacters.forEach((sub, i) => {
      sections.push('### ตัวละครเสริม #' + (i + 1) + ': ' + sub.name);
      sections.push('- **คำอธิบาย**: ' + sub.shortDesc);
      sections.push('- **บทบาท**: ' + sub.systemPrompt);
    });
    sections.push('');
  }

  if (char.locations.length > 0) {
    sections.push('## **[7. สถานที่ในเรื่อง - Locations]**');
    char.locations.forEach((loc, i) => {
      sections.push('- **สถานที่ #' + (i + 1) + '**: ' + loc.name + ' (' + loc.prompt + ')');
    });
    sections.push('');
  }

  sections.push('## **[8. คำโปรย & ฉากเปิดเรื่อง]**');
  if (char.shortIntro) sections.push('- **คำโปรยสั้นๆ**: ' + char.shortIntro);
  if (char.punchline) sections.push('- **ประโยคเด็ด**: ' + char.punchline);
  if (char.momentIntro) sections.push('- **สร้างโมเมนต์**: ' + char.momentIntro);
  if (char.categoryTags.length > 0) sections.push('- **หมวดหมู่**: ' + char.categoryTags.join(' '));
  sections.push('');
  sections.push('### ฉากเปิด (Open Greeting)');
  sections.push(char.fullGreeting || '...');
  return sections.join('\n');
}

export function generateRubiiOutput(char: ThaiMasterCharacter): RubiiOutput {
  const name = char.fullName || char.nickname || 'ตัวละครใหม่';
  const desc = char.shortIntro || char.coreTraits || 'คำอธิบายสาธารณะ';
  const moment = char.momentIntro || char.punchline || 'คำโปรยสั้นๆ';
  const greeting = char.fullGreeting || 'ฉากเปิดเริ่มต้น...';
  const personaLines = [
    '[Character("' + name + '")]',
    '{',
    '  สรรพนาม("ฉัน" + "คุณ")',
    char.coreTraits ? '  นิสัยหลัก("' + char.coreTraits + '")' : '',
    char.appearanceDesc ? '  ลักษณะ("' + char.appearanceDesc + '")' : '',
    char.generalBehaviors ? '  พฤติกรรม("' + char.generalBehaviors + '")' : '',
    char.userExclusiveBehaviors ? '  กับผู้ใช้("' + char.userExclusiveBehaviors + '")' : '',
    char.darkSide ? '  มุมมืด("' + char.darkSide + '")' : '',
    char.hiddenSoftSide ? '  มุมอ่อนโยน("' + char.hiddenSoftSide + '")' : '',
    char.expression ? '  น้ำเสียง("' + char.expression + '")' : '',
    '}'
  ].filter(Boolean).join('\n');

  return {
    name,
    publicDescription: desc,
    personaSystemPrompt: personaLines,
    momentIntro: moment,
    openGreeting: greeting,
    tokenEstimate: estimateTokens(personaLines),
  };
}

export function generatePurrpawOutput(char: ThaiMasterCharacter): PurrpawOutput {
  const name = char.fullName || char.nickname || 'ตัวละครใหม่';
  const tagline = char.shortIntro || char.punchline || 'คำโปรยกระชับ';
  const tags = char.categoryTags.join(', ') || '#drama, #romantic';
  const historyPersonality = [
    '# SYSTEM PROMPT FOR ' + name.toUpperCase(),
    'โรลเพลย์เป็น ' + name + ' อย่างเคร่งครัดตามข้อมูลที่กำหนด',
    '',
    '## 1. ประวัติและตัวตน',
    '- อายุ: ' + (char.age || '-'),
    '- เพศ: ' + (char.gender || '-'),
    '- อาชีพ/ฐานะ: ' + (char.occupation || '-') + ' / ' + (char.wealthStatus || '-'),
    '- MBTI: ' + (char.mbti || '-'),
    '',
    '## 2. ลักษณะนิสัยและแก่นแท้',
    char.coreTraits,
    char.personalityTags.length > 0 ? 'แท็กนิสัย: ' + char.personalityTags.join(', ') : '',
    '',
    '## 3. พฤติกรรมเมื่ออยู่กับ {{user}}',
    char.userExclusiveBehaviors || char.generalBehaviors,
    char.darkSide ? 'มุมมืด: ' + char.darkSide : '',
    char.hiddenSoftSide ? 'มุมอ่อนโยน: ' + char.hiddenSoftSide : '',
    '',
    '## 4. กฎเหล็กของตัวละคร',
    char.absoluteAntiBehaviors ? '- ห้ามทำเด็ดขาด: ' + char.absoluteAntiBehaviors : '',
    ...(char.systemRules.map(r => '- ' + r))
  ].filter(Boolean).join('\n');
  const greeting = char.fullGreeting || 'ข้อความแรกทักทาย...';

  return {
    name,
    tagline,
    tags,
    historyPersonalityPrompt: historyPersonality,
    subCharacters: char.supportingCharacters,
    locations: char.locations,
    initialRelationship: char.initialRelationship || 'คนแปลกหน้าที่เพิ่งพบกัน',
    openGreeting: greeting,
    charCount: (name + tagline + tags + historyPersonality + greeting).length,
  };
}

export function generateKhuiOutput(char: ThaiMasterCharacter): KhuiOutput {
  const name = char.fullName || char.nickname || 'ตัวละครใหม่';
  const tagline = char.shortIntro || char.punchline || 'คำโปรย';
  const desc = char.appearanceDesc || char.coreTraits || 'หน้าคำอธิบายตัวละคร';
  const greeting = char.fullGreeting || 'Open Greeting...';
  const systemPrompt = [
    '[SYSTEM DIRECTIVE]',
    'คุณคือ ' + name,
    'บุคลิก: ' + (char.coreTraits || '-'),
    'น้ำเสียง: ' + (char.expression || '-'),
    'การปฏิบัติต่อ {{user}}: ' + (char.userExclusiveBehaviors || '-')
  ].join('\n');
  const subChars = char.supportingCharacters.slice(0, 3).map(s => ({
    name: s.name,
    description: s.shortDesc
  }));
  const relScenario = [
    'ความสัมพันธ์: ' + (char.initialRelationship || '-'),
    'ทัศนคติ: ' + (char.userAttitude || '-')
  ].join(' | ');
  const tags = char.categoryTags.join(', ') || '#general';

  return {
    name,
    tagline,
    systemPrompt,
    characterDescription: desc,
    openGreeting: greeting,
    subCharacters: subChars,
    userRelationshipScenario: relScenario,
    tags,
    charCount: (name + tagline + systemPrompt + desc + greeting + relScenario + tags).length,
  };
}