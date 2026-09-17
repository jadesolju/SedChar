import type {
  ThaiMasterCharacter,
  RubiiOutput,
  PurrpawOutput,
  KhuiOutput,
  CharacterFlagType,
  SubCharacter,
  LocationItem
} from './types';
import { DEFAULT_CHARACTER } from './types';

// ==========================================
// 1. DICTIONARIES & KEYWORD MAPPINGS (THAI)
// ==========================================

export const KNOWN_TRAITS = [
  'เย็นชา', 'ปากร้าย', 'ใจดี', 'ขี้เล่น', 'ฉลาด', 'เจ้าเล่ห์', 'ขี้หวง', 'คลั่งรัก',
  'ซึนเดเระ', 'ยันเดเระ', 'คูลเดเระ', 'ดอม', 'ซับ', 'อบอุ่น', 'ลึกลับ', 'อ่อนโยน',
  'มั่นใจในตัวเอง', 'เจ้าอารมณ์', 'ซื่อสัตย์', 'ขี้อาย', 'เจ้าชู้', 'สุภาพ', 'โหดเหี้ยม',
  'ขี้อ้อน', 'ขี้เซา', 'เผด็จการ', 'ขี้ระแวง', 'มองโลกในแง่ดี', 'มองโลกในแง่ร้าย',
  'เงียบขรึม', 'ตรงไปตรงมา', 'เพอร์เฟกต์ชันนิสต์', 'รักอิสระ', 'ปากไม่ตรงกับใจ'
];

export const KNOWN_GENRES = [
  'มาเฟีย', 'CEO / ธุรกิจ', 'แฟนตาซี', 'ไซไฟ / โลกอนาคต', 'รักวัยเรียน', 'ย้อนยุค / พีเรียด',
  'สยองขวัญ / ลึกลับ', 'ดราม่าเข้มข้น', 'โรแมนติกคอมเมดี้', 'BL / Yaoi', 'GL / Yuri',
  'มืดมน / Dark', 'ชีวิตประจำวัน', 'ฮาเร็ม', 'สืบสวนสอบสวน', 'ต่างโลก (Isekai)'
];

const TRAIT_SYNONYMS: Record<string, string> = {
  'tsundere': 'ซึนเดเระ',
  'ปากแข็ง': 'ซึนเดเระ',
  'ปากไม่ตรงกับใจ': 'ซึนเดเระ',
  'yandere': 'ยันเดเระ',
  'คลั่งรักรุนแรง': 'ยันเดเระ',
  'รักจนบ้า': 'ยันเดเระ',
  'kuudere': 'คูลเดเระ',
  'นิ่งขรึม': 'เย็นชา',
  'เงียบ': 'เย็นชา',
  'dom': 'ดอม',
  'dominant': 'ดอม',
  'sub': 'ซับ',
  'submissive': 'ซับ',
  'หึงแรง': 'ขี้หวง',
  'หวง': 'ขี้หวง',
  'ขี้แกล้ง': 'ขี้เล่น',
  'กวน': 'ขี้เล่น',
  'สุภาพบุรุษ': 'สุภาพ',
  'ใจร้าย': 'โหดเหี้ยม',
};

export function formatCount(count: number, max?: number): string {
  const formatted = (count || 0).toLocaleString();
  if (max !== undefined) {
    return `${formatted} / ${max.toLocaleString()}`;
  }
  return formatted;
}

export function cleanVal(str: any): string {
  if (!str) return '';
  const trimmed = String(str).trim().replace(/^[-*•]\s*/, '').replace(/^["']|["']$/g, '');
  if (
    trimmed === '-' ||
    trimmed === '—' ||
    trimmed === 'N/A' ||
    trimmed === 'n/a' ||
    trimmed === 'ไม่มี' ||
    trimmed === 'ไม่ได้ระบุ' ||
    trimmed === 'null' ||
    trimmed === 'undefined' ||
    trimmed === 'None' ||
    trimmed === 'none' ||
    trimmed === '- ไม่ได้ระบุ'
  ) {
    return '';
  }
  return trimmed;
}

export function cleanArray(val: any): string[] {
  if (!val) return [];
  let arr: string[] = [];
  if (Array.isArray(val)) {
    arr = val.map(String);
  } else if (typeof val === 'string') {
    if (val.includes('#')) {
      arr = val.match(/#[^\s#]+/g) || [];
    } else {
      arr = val.split(/[,\n|;]/);
    }
  }
  return arr
    .map(s => cleanVal(s))
    .filter(Boolean);
}

export function sanitizeTraits(traits: string[]): string[] {
  const result: string[] = [];
  for (const t of traits) {
    const clean = t.trim().toLowerCase().replace(/^[-*•]\s*/, '');
    if (!clean || clean === '-' || clean === '—' || clean === 'n/a' || clean === 'ไม่มี' || clean === 'ไม่ได้ระบุ') continue;
    if (TRAIT_SYNONYMS[clean]) {
      result.push(TRAIT_SYNONYMS[clean]);
    } else {
      result.push(t.trim().replace(/^[-*•]\s*/, ''));
    }
  }
  return Array.from(new Set(result.filter(Boolean)));
}

export function analyzeCharacterFlag(char: Partial<ThaiMasterCharacter>): CharacterFlagType {
  const combinedText = [
    char.coreTraits,
    char.darkSide,
    char.personalityTags?.join(' '),
    char.absoluteAntiBehaviors,
    char.userAttitude,
    char.mindset,
    char.categoryTags?.join(' ')
  ].filter(Boolean).join(' ').toLowerCase();

  if (/(?:ยันเดเระ|กักขัง|ทำร้าย|ครอบงำ|บังคับ|โรคจิต|มาเฟียโหด|บังคับขืนใจ|black flag)/i.test(combinedText)) {
    return 'black';
  }
  if (/(?:หึงโหด|หวงแรง|เจ้าอารมณ์|\btoxic\b|red flag|ชอบควบคุม|ดุดัน|ดอมสายโหด)/i.test(combinedText)) {
    return 'red';
  }
  if (/(?:ซึนเดเระ|ปากร้ายใจดี|ปากแข็ง|ปากไม่ตรงกับใจ|ขี้หวงแต่ปากหนัก)/i.test(combinedText)) {
    return 'reverse-watermelon';
  }
  if (/(?:เจ้าเล่ห์|หน้าไหว้หลังหลอก|มือถือสากปากถือศีล|หลอกใช้)/i.test(combinedText)) {
    return 'watermelon';
  }
  if (/(?:ใจดี|อ่อนโยน|อบอุ่น|แสนดี|สุภาพบุรุษ|มองโลกในแง่ดี|green flag)/i.test(combinedText)) {
    return 'green';
  }
  if (/(?:บริสุทธิ์|ไร้เดียงสา|ไม่ประสีประสา|ใสซื่อ|white flag)/i.test(combinedText)) {
    return 'white';
  }
  if (/(?:ขี้เล่น|กวน|เจ้าชู้|รักอิสระ|ไม่ผูกมัด|yellow flag)/i.test(combinedText)) {
    return 'yellow';
  }
  return 'none';
}

// 10 Purrpaw Default Location Presets
export const DEFAULT_PURRPAW_LOCATIONS: LocationItem[] = [
  { id: 'loc-1', name: 'Penthouse ชั้น 52', prompt: 'ห้องกระจกพาโนรามา หรูหรา มืดสลัว มองเห็นวิวไฟกรุงเทพฯ ยามราตรี' },
  { id: 'loc-2', name: 'Safehouse โกดังร้างริมน้ำ', prompt: 'โกดังเก็บสินค้าลับ คอนกรีตดิบ บรรยากาศอับชื้น อุปกรณ์สอดแนมครบครัน' },
  { id: 'loc-3', name: 'สนามยิงปืนส่วนตัวใต้ดิน', prompt: 'ห้องเก็บเสียง ปลอกกระสุนเกลื่อนกลาด เป้าซ้อมยิงรูปมนุษย์' },
  { id: 'loc-4', name: 'The Velvet Club VIP Lounge', prompt: 'เลานจ์หรูหรา โซฟากำมะหยี่สีแดง เพลงแจ๊สแผ่วเบา ควันซิการ์' },
  { id: 'loc-5', name: 'ห้องนอนใหญ่ (Master Bedroom)', prompt: 'เตียงคิงไซส์ผ้าปูสีเข้ม หน้าต่างกระจกสูงวิวเส้นขอบฟ้าเมือง แสงไฟสลัว บรรยากาศเงียบสงบและเป็นส่วนตัว' },
  { id: 'loc-6', name: 'ห้องน้ำกระจกหรู (Glass Bathroom)', prompt: 'อ่างอาบน้ำกระจกใส ฝักบัวเรนชาวเวอร์ กระจกบานใหญ่พร้อมไอน้ำอุ่นลอยฟุ้ง' },
  { id: 'loc-7', name: 'เคาน์เตอร์บาร์ในห้อง (Private Bar)', prompt: 'เคาน์เตอร์หินอ่อนสีดำ ตู้เก็บไวน์และวิสกี้ราคาแพง เครื่องแก้วคริสตัล' },
  { id: 'loc-8', name: 'ระเบียงชมวิวเมือง (Sky Balcony)', prompt: 'ระเบียงกว้างชั้นบนสุด ลมพัดแรง วิวตึกระฟ้าและถนนใหญ่' },
  { id: 'loc-9', name: 'ลานจอดรถส่วนตัว (Private Garage)', prompt: 'ลานจอดซูเปอร์คาร์ส่วนตัว แสงไฟนีออนสลัว บรรยากาศปลอดภัยและมิดชิด' },
  { id: 'loc-10', name: 'ห้องทำงานส่วนตัว (Private Office)', prompt: 'โต๊ะทำงานไม้สักขนาดใหญ่ จอมอนิเตอร์ตรวจจับกล้องวงจรปิด และตู้เซฟลับ' },
];

// ==========================================
// 2. COMPREHENSIVE TEXT & MARKDOWN PARSER
// ==========================================

export function parseMarkdownToCharacter(rawText: string): ThaiMasterCharacter {
  if (!rawText || !rawText.trim()) return { ...DEFAULT_CHARACTER };

  const text = rawText.trim();
  const char: ThaiMasterCharacter = { ...DEFAULT_CHARACTER };

  const matchFirst = (regex: RegExp, src: string = text): string => {
    const m = src.match(regex);
    return m && m[1] ? cleanVal(m[1]) : '';
  };

  const lines = text.split('\n');
  const basicInfoLines = lines.slice(0, 35).join('\n');

  // 1. Basic Profile (Restricted to top section so sub-characters don't overwrite)
  char.nickname = matchFirst(/(?:ชื่อเล่น|Nickname):\s*([^\n|]+)/i, basicInfoLines);
  char.fullName = matchFirst(/(?:ชื่อเต็ม|ชื่อ-นามสกุล|ชื่อจริง|Full Name):\s*([^\n|]+)/i, basicInfoLines);
  if (!char.fullName && !char.nickname) {
    char.fullName = matchFirst(/(?:^|\n)(?:ชื่อ|Name):\s*([^\n|]+)/i, basicInfoLines);
  }
  if (!char.nickname && char.fullName) {
    char.nickname = char.fullName.split(' ')[0] || '';
  }

  char.age = matchFirst(/(?:อายุ|Age):\s*([^\n|]+)/i, basicInfoLines);
  char.gender = matchFirst(/(?:เพศ|Gender):\s*([^\n|]+)/i, basicInfoLines);
  char.status = matchFirst(/(?:สถานะ(?:\/บทบาท)?|Status):\s*([^\n]+)/i, basicInfoLines);
  char.mbti = matchFirst(/(?:MBTI|บุคลิกภาพ):\s*([A-Za-z]{4})/i, basicInfoLines).toUpperCase();
  char.sexualOrientation = matchFirst(/(?:รสนิยมทางเพศ|Sexual Orientation):\s*([^\n]+)/i, basicInfoLines);
  char.car = matchFirst(/(?:รถที่ใช้|รถยนต์\/ยานพาหนะ|Car):\s*([^\n]+)/i, basicInfoLines);
  char.perfume = matchFirst(/(?:กลิ่นน้ำหอม|กลิ่นกาย\/น้ำหอม|กลิ่นตัว|Perfume):\s*([^\n]+)/i, basicInfoLines);
  char.address = matchFirst(/(?:ที่อยู่|ที่พัก|คอนโด|Address):\s*([^\n]+)/i, basicInfoLines);
  char.wealthStatus = matchFirst(/(?:ฐานะ|ความมั่งคั่ง|Wealth):\s*([^\n]+)/i, basicInfoLines);
  char.occupation = matchFirst(/(?:อาชีพ|การศึกษา|Occupation):\s*([^\n]+)/i, basicInfoLines);
  char.fashionStyle = matchFirst(/(?:สไตล์การแต่งตัว|การแต่งกาย|Fashion):\s*([^\n]+)/i, basicInfoLines);

  // Birthdate & Weight/Height
  const bdayMatch = text.match(/(?:วันเดือนปีเกิด|วันเกิด|Birthday):\s*([^\n|]+?)(?=\s*(?:น้ำหนัก|\n|$))/i);
  if (bdayMatch && bdayMatch[1]) char.birthdate = cleanVal(bdayMatch[1]);

  const whMatch = text.match(/(?:น้ำหนัก\s*\/\s*ส่วนสูง|ส่วนสูง\s*\/\s*น้ำหนัก|สัดส่วน|ส่วนสูง|น้ำหนัก):\s*([^\n]+)/i);
  if (whMatch && whMatch[1]) char.weightHeight = cleanVal(whMatch[1]);

  // 2. Appearance & Visual Tags
  const appMatch = text.match(/(?:ลักษณะภายนอก|Appearance)[\s\S]*?\n\n([\s\S]*?)(?=\n(?:แท็ก\s*#|ส่วนลับ|\[|\n##|$))/i);
  if (appMatch && appMatch[1]) char.appearanceDesc = cleanVal(appMatch[1]);

  const vTagMatch = text.match(/(?:แท็กรูปลักษณ์|แท็ก\s*(?:#.+))([\s\S]*?)(?=\n(?:ส่วนลับ|\[|##|$))/i);
  if (vTagMatch) {
    const rawTags = (vTagMatch[0].match(/#[^\s#]+/g) || []);
    char.visualTags = rawTags.map(t => cleanVal(t)).filter(Boolean);
  }

  // 3. NSFW Info
  const nsfwMatch = text.match(/(?:ส่วนลับ|NSFW Info|สรีระส่วนลับ)[\s\S]*?\n([\s\S]*?)(?=\n\[|\n##|$)/i);
  if (nsfwMatch && nsfwMatch[1]) {
    const nsfwText = nsfwMatch[1];
    const chest = nsfwText.match(/(?:ขนาดหน้าอก|หน้าอก|คัพ)\s*:\s*([^\n]+?)(?=\s*(?:จิ๊มิ|หัวนม|$))/i) || nsfwText.match(/(?:ขนาดหน้าอก|หน้าอก)\s*:\s*([^\n]+)/i);
    if (chest && chest[1]) char.nsfwFemaleChest = cleanVal(chest[1]);
    const vagina = nsfwText.match(/(?:จิ๊มิ|จุดซ่อนเร้น|ช่องคลอด|อวัยวะเพศหญิง)\s*:\s*([^\n]+)/i);
    if (vagina && vagina[1]) char.nsfwFemaleVagina = cleanVal(vagina[1]);
    const maleSize = nsfwText.match(/(?:ขนาดโจ้ย|ขนาดอวัยวะเพศชาย|ส่วนลับชาย)\s*:\s*([^\n]+)/i);
    if (maleSize && maleSize[1]) char.nsfwMaleSize = cleanVal(maleSize[1]);
    if (!char.nsfwFemaleChest && !char.nsfwFemaleVagina && !char.nsfwMaleSize) {
      char.nsfwFemaleChest = cleanVal(nsfwText);
    }
  }

  // 4. Psychology & Personality
  const psychMatch = text.match(/\[?(?:นิสัยและพฤติกรรม|Psychology & Personality)\]?[\s\S]*?\n\n([\s\S]*?)(?=\n(?:แท็ก\s*#|\[|\n##|$))/i);
  if (psychMatch && psychMatch[1]) char.coreTraits = cleanVal(psychMatch[1]);

  const pTagsMatch = text.match(/แท็ก\s*(#[^\n]+)/g);
  if (pTagsMatch) {
    const allTags = pTagsMatch.flatMap(pt => pt.match(/#[^\s#]+/g) || []);
    char.personalityTags = allTags.map(t => cleanVal(t)).filter(Boolean);
  }

  // 5. Likes & Dislikes
  const likesSectionMatch = text.match(/\[?(?:สิ่งที่ชอบ \/ สิ่งที่ไม่ชอบ|Likes & Dislikes)[\s\S]*?\]?([\s\S]*?)(?=\n\[|\n##|---\n|$)/i);
  if (likesSectionMatch && likesSectionMatch[1]) {
    const sec = likesSectionMatch[1];
    const likesPart = sec.match(/(?:สิ่งที่ชอบ|Likes)\s*:\s*([\s\S]*?)(?=\n(?:สิ่งที่ไม่ชอบ|Dislikes|พฤติกรรม)|$)/i) || sec.match(/สิ่งที่ชอบ([\s\S]*?)(?=\nสิ่งที่ไม่ชอบ|\nพฤติกรรม|$)/i);
    if (likesPart && likesPart[1]) {
      char.likes = likesPart[1].split(/\n+/).map(s => cleanVal(s)).filter(Boolean);
    }
    const dislikesPart = sec.match(/(?:สิ่งที่ไม่ชอบ|Dislikes)\s*:\s*([\s\S]*?)(?=\n(?:พฤติกรรม|\[)|$)/i) || sec.match(/สิ่งที่ไม่ชอบ([\s\S]*?)(?=\nพฤติกรรม|\n\[|$)/i);
    if (dislikesPart && dislikesPart[1]) {
      char.dislikes = dislikesPart[1].split(/\n+/).map(s => cleanVal(s)).filter(Boolean);
    }

    const genBehav = sec.match(/พฤติกรรมทั่วไป\s*([^\n]+(?:\n[^\n\[]+)*)/i);
    if (genBehav && genBehav[1]) char.generalBehaviors = cleanVal(genBehav[1]);

    const userBehav = sec.match(/พฤติกรรมพิเศษเฉพาะกับ\s*\{\{user\}\}\s*([^\n]+(?:\n[^\n\[]+)*)/i);
    if (userBehav && userBehav[1]) char.userExclusiveBehaviors = cleanVal(userBehav[1]);
  }

  // 6. Psychology 7 Items
  char.coreBelief = matchFirst(/(?:Core Belief|ความเชื่อหลัก)\s*(?:ความเชื่อหลัก)?:\s*([^\n]+)/i);
  char.mindset = matchFirst(/(?:Mindset|กระบวนการคิด)\s*(?:กระบวนการคิด)?:\s*([^\n]+)/i);
  char.perception = matchFirst(/(?:Perception|การตีความ)\s*(?:การตีความ)?:\s*([^\n]+)/i);
  char.expression = matchFirst(/(?:Expression|การแสดงออก)\s*(?:การแสดงออก)?:\s*([^\n]+)/i);
  char.behaviorUnderEmotion = matchFirst(/(?:Behavior under Emotion|Behavior|พฤติกรรมประจำ)\s*(?:พฤติกรรมประจำ)?:\s*([^\n]+)/i);
  char.emotionalTriggers = matchFirst(/(?:Emotional Triggers|Triggers|จุดกระตุ้นอารมณ์)\s*(?:Triggers)?:\s*([^\n]+)/i);
  char.flawsWeaknesses = matchFirst(/(?:Flaws & Weaknesses|จุดอ่อน|ข้อบกพร่อง)\s*(?:จุดอ่อน)?:\s*([^\n]+)/i);

  // 7. Speech Style
  const speechMatch = text.match(/\[?(?:วิธีการพูด|Speech Style)\]?([\s\S]*?)(?=\n\[|\n##|---\n|$)/i);
  if (speechMatch && speechMatch[1]) {
    const spText = cleanVal(speechMatch[1]);
    if (char.expression) {
      char.expression += '\n' + spText;
    } else {
      char.expression = spText;
    }
  }

  // 8. Relationship & {{user}}
  const userRoleMatch = text.match(/\[?(?:ตัวตนของ \{\{user\}\} ในสายตา \{\{char\}\}|ความสัมพันธ์กับ \{\{user\}\})\]?([\s\S]*?)(?=\n\[|\n##|$)/i);
  if (userRoleMatch && userRoleMatch[1]) {
    const urText = userRoleMatch[1];
    const role = urText.match(/บทบาทในเนื้อเรื่อง\s*\n([\s\S]*?)(?=\nบทบาทในอดีต|\n\[|$)/i);
    if (role && role[1]) char.userStoryRole = cleanVal(role[1]);
    const pastPresent = urText.match(/บทบาทในอดีต-ปัจจุบัน\s*\n([\s\S]*?)(?=\n\[|$)/i);
    if (pastPresent && pastPresent[1]) char.initialRelationship = cleanVal(pastPresent[1]);
  }

  const loreMatch = text.match(/\[?(?:ภูมิหลังความสัมพันธ์|Backstory & Lore)\]?\s*\n([\s\S]*?)(?=\n\[|\n##|$)/i);
  if (loreMatch && loreMatch[1]) char.relationshipBackstory = cleanVal(loreMatch[1]);

  // 9. Absolute Rules, Hidden soft side, Dark side
  const logicMatch = text.match(/\[?(?:ขอบเขตพฤติกรรมและ Logic ขั้นเด็ดขาด|ขอบเขตพฤติกรรม)[\s\S]*?\]?([\s\S]*?)(?=\n\[|\n##|$)/i);
  if (logicMatch && logicMatch[1]) {
    const lgText = logicMatch[1];
    const anti = lgText.match(/สิ่งที่จะไม่ทำเด็ดขาด:\s*\n([\s\S]*?)(?=\nด้านน่ารัก|\nด้านมืด|\n\[|$)/i);
    if (anti && anti[1]) char.absoluteAntiBehaviors = cleanVal(anti[1]);
    const soft = lgText.match(/ด้านน่ารัก หรือ มุมอ่อนโยนที่ซ่อนอยู่\s*\n([\s\S]*?)(?=\nด้านมืด|\n\[|$)/i);
    if (soft && soft[1]) char.hiddenSoftSide = cleanVal(soft[1]);
    const dark = lgText.match(/ด้านมืด\s*\n([\s\S]*?)(?=\n\[|\n##|$)/i);
    if (dark && dark[1]) char.darkSide = cleanVal(dark[1]);
  }

  // 10. Sexual Behavior
  const sexMatch = text.match(/\[?(?:พฤติกรรมทางเพศและบนเตียง|Sexual Behavior)\]?([\s\S]*?)(?=\n\[|\n##|$)/i);
  if (sexMatch && sexMatch[1]) {
    const sxText = sexMatch[1];
    const style = sxText.match(/สไตล์และแนวทาง:\s*\n([\s\S]*?)(?=\nรสนิยมจำเพาะ|\nการดูแลหลังกิจกรรม|\nโทนเรื่อง|$)/i);
    if (style && style[1]) char.sexualStyle = cleanVal(style[1]);
    const kinks = sxText.match(/รสนิยมจำเพาะ\s*\n([\s\S]*?)(?=\nการดูแลหลังกิจกรรม|\nโทนเรื่อง|$)/i);
    if (kinks && kinks[1]) char.kinksPreferences = cleanVal(kinks[1]);
    const aftercare = sxText.match(/การดูแลหลังกิจกรรม\s*\n([\s\S]*?)(?=\nโทนเรื่อง|\n\[|$)/i);
    if (aftercare && aftercare[1]) char.aftercareStyle = cleanVal(aftercare[1]);
    const tone = sxText.match(/โทนเรื่องและฉากหลัง\s*\n([\s\S]*?)(?=\n\[|\n##|$)/i);
    if (tone && tone[1]) char.toneSetting = cleanVal(tone[1]);
  }

  // 11. Sub-Characters (Pipe format: ชื่อ: ... | เพศ: ... | ...)
  const subCharSection = text.match(/\[?(?:ตัวละครเสริม|Supporting Characters)\]?([\s\S]*?)(?=\n(?:คำโปรย|เนื้อเรื่องย่อ|ข้อมูลสาธารณะ|<h2>|$))/i);
  if (subCharSection && subCharSection[1]) {
    const subText = subCharSection[1];
    const subLines = subText.split('\n').filter(l => l.trim().startsWith('ชื่อ:') || l.trim().startsWith('- ชื่อ:') || l.trim().startsWith('* ชื่อ'));
    subLines.forEach((sLine, idx) => {
      const parts = sLine.split('|').map(p => p.trim());
      const subObj: SubCharacter = {
        id: String(idx + 1),
        name: '',
        gender: '',
        age: '',
        personality: '',
        relationship: '',
        mainRole: '',
        appearWhen: '',
        shortDesc: '',
        systemPrompt: ''
      };
      parts.forEach(part => {
        const [k, ...vArr] = part.split(':');
        const key = (k || '').trim().replace(/^[-*•]\s*/, '').toLowerCase();
        const val = cleanVal(vArr.join(':'));
        if (key.includes('ชื่อ')) subObj.name = val;
        else if (key.includes('เพศ')) subObj.gender = val;
        else if (key.includes('อายุ')) subObj.age = val;
        else if (key.includes('บุคลิก')) subObj.personality = val;
        else if (key.includes('ความสัมพันธ์')) subObj.relationship = val;
        else if (key.includes('หน้าที่') || key.includes('บทบาท')) subObj.mainRole = val;
        else if (key.includes('ปรากฎ') || key.includes('โผล่')) subObj.appearWhen = val;
      });
      if (subObj.name) {
        subObj.shortDesc = [subObj.personality, subObj.relationship].filter(Boolean).join(' | ');
        subObj.systemPrompt = [subObj.mainRole, subObj.appearWhen ? `ปรากฏเมื่อ: ${subObj.appearWhen}` : ''].filter(Boolean).join('\n');
        char.supportingCharacters.push(subObj);
      }
    });

    const subRules = subText.match(/กฎข้อห้ามสำหรับตัวละครเสริม:\s*([^\n]+)/i);
    if (subRules && subRules[1]) char.subCharRules = cleanVal(subRules[1]);

    const subAllow = subText.match(/สิ่งที่ทำได้:\s*([^\n]+)/i);
    if (subAllow && subAllow[1]) char.subCharAllowed = cleanVal(subAllow[1]);
  }

  // 12. Short Intro & Punchlines
  const introMatch = text.match(/คำโปรยสั้นๆ?\s*\n([\s\S]*?)(?=\n(?:เนื้อเรื่องย่อ|ข้อมูลสาธารณะ|<h2>|###|$))/i);
  if (introMatch && introMatch[1]) char.shortIntro = cleanVal(introMatch[1]);

  const plotMatch = text.match(/เนื้อเรื่องย่อ\s*\n([\s\S]*?)(?=\n(?:ข้อมูลสาธารณะ|<h2>|###|$))/i);
  if (plotMatch && plotMatch[1]) char.plotSummary = cleanVal(plotMatch[1]);

  // Tags & Greeting
  const catMatch = text.match(/ข้อมูลสาธารณะและแท็กหมวดหมู่\s*\n([\s\S]*?)(?=\n(?:<h2>|###|$))/i);
  if (catMatch && catMatch[1]) {
    const rawTags = catMatch[1].match(/#[^\s#]+/g) || [];
    char.categoryTags = rawTags.map(t => cleanVal(t)).filter(Boolean);
  }

  const greetingHtmlMatch = text.match(/(?:<h2><b>ที่มาและเรื่องย่อ<\/b><\/h2>|### ฉากเปิด)[\s\S]*?\n([\s\S]*?)$/i);
  if (greetingHtmlMatch && greetingHtmlMatch[1]) {
    char.fullGreeting = cleanVal(greetingHtmlMatch[1].replace(/<[^>]+>/g, ''));
  }

  char.flagType = analyzeCharacterFlag(char);
  return char;
}

// ==========================================
// 3. PLATFORM GENERATORS
// ==========================================

export function generateRubiiOutput(char: ThaiMasterCharacter): RubiiOutput {
  const displayName = char.fullName || char.nickname || 'ตัวละคร';
  const tagline = char.shortIntro || char.punchline || '';

  const personaSections: string[] = [
    `[Character("${displayName}")]`,
    `{`,
    `  สรรพนาม("ฉัน" + "คุณ")`,
    char.coreTraits ? `  นิสัยหลัก("${char.coreTraits}")` : '',
    char.appearanceDesc ? `  ลักษณะ("${char.appearanceDesc}${char.visualFeatures ? ' ' + char.visualFeatures : ''}")` : '',
    char.generalBehaviors ? `  พฤติกรรม("${char.generalBehaviors}")` : '',
    char.userExclusiveBehaviors ? `  กับผู้ใช้("${char.userExclusiveBehaviors}")` : '',
    char.darkSide ? `  มุมมืด("${char.darkSide}")` : '',
    char.hiddenSoftSide ? `  มุมอ่อนโยน("${char.hiddenSoftSide}")` : '',
    char.expression ? `  น้ำเสียง("${char.expression}")` : '',
    `}`
  ].filter(Boolean);

  const personaSystemPrompt = personaSections.join('\n');

  return {
    name: displayName,
    publicDescription: char.shortIntro || char.punchline || char.appearanceDesc || '',
    personaSystemPrompt,
    momentIntro: char.momentIntro || (char.shortIntro ? char.shortIntro.slice(0, 100) : ''),
    openGreeting: char.fullGreeting || char.openGreetingNarrative || '',
    tokenEstimate: Math.round(personaSystemPrompt.length / 2.5),
  };
}

export function generatePurrpawOutput(char: ThaiMasterCharacter): PurrpawOutput {
  const displayName = char.fullName || char.nickname || 'ตัวละคร';
  const tagline = char.shortIntro || char.punchline || '';
  const tags = char.categoryTags.length > 0 ? char.categoryTags.join(', ') : '#DarkRomance, #Mafia, #Possessive, #ISTP';

  const defaultRules = [
    `ห้ามทำเด็ดขาด: 1. จะไม่มีวันทำร้ายร่างกายหรือบังคับขืนใจ {{user}} เด็ดขาด\n2. จะไม่ยอมให้ใครหน้าไหนมาแตะต้อง {{user}} แม้แต่ปลายเล็บ\n3. จะไม่ทรยศหักหลัง {{user}} ไม่ว่าจะเกิดอะไรขึ้น`,
    `ห้ามหลุดคาแรคเตอร์ความสุขุมและเย็นชา (Stay in character: ISTP Dark Romance)`,
    `ห้ามบรรยายความรู้สึกหรือการกระทำแทน {{user}} เด็ดขาด`,
    `ตอบสนองต่อการกระทำของ {{user}} อย่างสมเหตุสมผลตามตรรกะจิตวิทยาที่ระบุไว้`,
    `คงระดับความเข้มข้นของอารมณ์และบทสนทนาให้คมคาย กระชับ ทรงพลัง`,
  ];
  const rulesList = char.systemRules.length > 0 ? char.systemRules : defaultRules;

  // Purrpaw Prompt format: English Header Structure as specified
  const historySections: string[] = [
    `# SYSTEM PROMPT FOR ${displayName.toUpperCase()}`,
    `โรลเพลย์เป็น ${displayName} อย่างเคร่งครัดตามข้อมูลที่กำหนด`,
    '## 1. ประวัติและตัวตน',
    char.age ? `- อายุ: ${char.age}` : '',
    char.gender ? `- เพศ: ${char.gender}` : '',
    (char.occupation || char.wealthStatus) ? `- อาชีพ/ฐานะ: ${[char.occupation, char.wealthStatus].filter(Boolean).join(' / ')}` : '',
    char.mbti ? `- MBTI: ${char.mbti}` : '',
    '## 2. ลักษณะนิสัยและแก่นแท้',
    char.coreTraits ? char.coreTraits : '',
    char.personalityTags.length > 0 ? `แท็กนิสัย: ${char.personalityTags.join(', ')}` : '',
    char.appearanceDesc ? `\n### รูปลักษณ์ภายนอก:\n${char.appearanceDesc}` : '',
    (char.nsfwMaleSize || char.nsfwFemaleChest || char.nsfwFemaleVagina) ? [
      `### สรีระส่วนลับ (NSFW Spec):`,
      char.nsfwMaleSize ? `- ขนาดโจ้ย: ${char.nsfwMaleSize}` : '',
      char.nsfwFemaleChest ? `- ขนาดหน้าอก: ${char.nsfwFemaleChest}` : '',
      char.nsfwFemaleVagina ? `- สรีระสงวน: ${char.nsfwFemaleVagina}` : '',
    ].filter(Boolean).join('\n') : '',
    '## 3. พฤติกรรมเมื่ออยู่กับ {{user}}',
    char.userExclusiveBehaviors ? char.userExclusiveBehaviors : '',
    char.darkSide ? `มุมมืด: ${char.darkSide}` : '',
    char.hiddenSoftSide ? `มุมอ่อนโยน: ${char.hiddenSoftSide}` : '',
    '## 4. กฎเหล็กของตัวละคร',
    char.absoluteAntiBehaviors ? `- ห้ามทำเด็ดขาด: ${char.absoluteAntiBehaviors}` : '',
    ...rulesList.map(r => r.startsWith('-') ? r : `- ${r}`),
  ];

  const locationsList = (char.locations && char.locations.length > 0)
    ? char.locations
    : DEFAULT_PURRPAW_LOCATIONS.slice(0, 4);

  const finalHistoryPrompt = historySections.filter(Boolean).join('\n');
  const greeting = char.fullGreeting || char.openGreetingNarrative || '';

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
    locations: locationsList.map(l => ({
      name: l.name,
      prompt: l.prompt,
    })),
    initialRelationship: char.initialRelationship || '',
    openGreeting: greeting,
    charCount: finalHistoryPrompt.length,
  };
}

export function generateKhuiOutput(char: ThaiMasterCharacter): KhuiOutput {
  const displayName = char.fullName || char.nickname || 'ตัวละคร';
  const tagline = char.shortIntro || char.punchline || '';

  const promptParts: string[] = [
    `[SYSTEM DIRECTIVE]`,
    `คุณคือ ${displayName}`,
    char.coreTraits ? `บุคลิก: ${char.coreTraits}` : '',
    char.expression ? `น้ำเสียง: ${char.expression}` : '',
    char.userExclusiveBehaviors ? `การปฏิบัติต่อ {{user}}: ${char.userExclusiveBehaviors}` : '',
    char.absoluteAntiBehaviors ? `ข้อห้ามเด็ดขาด: ${char.absoluteAntiBehaviors}` : '',
  ];

  const systemPrompt = promptParts.filter(Boolean).join('\n');
  const characterDescription = char.appearanceDesc || char.coreTraits || 'หน้าคำอธิบายตัวละคร';

  const subChars = (char.supportingCharacters || []).slice(0, 3).map(s => ({
    name: s.name || 'ตัวละครเสริม',
    description: [
      s.relationship ? `${s.name}— ${s.relationship}` : s.name,
      s.shortDesc || s.personality || s.systemPrompt || '',
    ].filter(Boolean).join(' ') || '',
  }));

  const relScenario = [
    char.initialRelationship ? `ความสัมพันธ์: ${char.initialRelationship}` : '',
    char.userAttitude ? `ทัศนคติ: ${char.userAttitude}` : ''
  ].filter(Boolean).join(' | ');

  const tags = char.categoryTags.join(', ') || '#DarkRomance, #Mafia, #Possessive, #Protective, #Action, #Drama, #ISTP';
  const greeting = char.fullGreeting || char.openGreetingNarrative || '';

  return {
    name: displayName,
    tagline,
    systemPrompt,
    characterDescription,
    openGreeting: greeting,
    subCharacters: subChars,
    userRelationshipScenario: relScenario,
    tags,
    charCount: (displayName + tagline + systemPrompt + characterDescription + greeting + relScenario + tags).length,
  };
}

export const generateKhuiAIOutput = generateKhuiOutput;

export function characterToFullMarkdown(char: ThaiMasterCharacter): string {
  const visualTagsStr = char.visualTags && char.visualTags.length > 0 ? char.visualTags.join(' ') : '';
  const pTagsStr = char.personalityTags && char.personalityTags.length > 0 ? char.personalityTags.join(' ') : '';
  const catTagsStr = char.categoryTags && char.categoryTags.length > 0 ? char.categoryTags.join(' ') : '';

  return `## **[ข้อมูลพื้นฐาน - Character Profile (General Info)]**

- **ชื่อเล่น**: ${char.nickname || ''}
- **ชื่อเต็ม**: ${char.fullName || ''}
- **อายุ**: ${char.age || ''}
- **เพศ**: ${char.gender || ''}
- **สถานะ**: ${char.status || ''}
- **วันเดือนปีเกิด**: ${char.birthdate || ''}
- **น้ำหนัก / ส่วนสูง**: ${char.weightHeight || ''}
- **MBTI**: ${char.mbti || ''}
- **รสนิยมทางเพศ**: ${char.sexualOrientation || ''}
- **รถที่ใช้**: ${char.car || ''}
- **กลิ่นน้ำหอม**: ${char.perfume || ''}
- **ที่อยู่**: ${char.address || ''}
- **ฐานะ**: ${char.wealthStatus || ''}
- **อาชีพ**: ${char.occupation || ''}
- **สไตล์การแต่งตัว**: ${char.fashionStyle || ''}

## ลักษณะภายนอก (Appearance)

${char.appearanceDesc || ''}
${char.visualFeatures ? `\nจุดเด่น: ${char.visualFeatures}` : ''}
${visualTagsStr ? `\nแท็กรูปลักษณ์: ${visualTagsStr}` : ''}

### ส่วนลับ(NSFW Info)
* **ส่วนลับชาย:**
  * ขนาดโจ้ย: ${char.nsfwMaleSize || ''}
* **ส่วนลับหญิง:**
  * ขนาดหน้าอก: ${char.nsfwFemaleChest || ''}
  * จิ๊มิ: ${char.nsfwFemaleVagina || ''}

## [นิสัยและพฤติกรรม Psychology & Personality]

${char.coreTraits || ''}
${pTagsStr ? `\nแท็กนิสัย: ${pTagsStr}` : ''}

### [สิ่งที่ชอบ / สิ่งที่ไม่ชอบ และปฏิกิริยา (Likes & Dislikes Logic)]
**สิ่งที่ชอบ:**
${char.likes && char.likes.length > 0 ? char.likes.map(l => `- ${l}`).join('\n') : ''}

**สิ่งที่ไม่ชอบ:**
${char.dislikes && char.dislikes.length > 0 ? char.dislikes.map(d => `- ${d}`).join('\n') : ''}

### พฤติกรรมทั่วไป (General Behaviors)
${char.generalBehaviors || ''}

### พฤติกรรมพิเศษเฉพาะกับ {{user}} (Exclusive Behaviors for User Only)
${char.userExclusiveBehaviors || ''}

### [โครงสร้างจิตวิทยา:]
* **1. Core Belief**: ${char.coreBelief || ''}
* **2. Mindset**: ${char.mindset || ''}
* **3. Perception**: ${char.perception || ''}
* **4. Expression**: ${char.expression || ''}
* **5. Behavior**: ${char.behaviorUnderEmotion || ''}
* **6. Emotional Triggers**: ${char.emotionalTriggers || ''}
* **7. Flaws & Weaknesses**: ${char.flawsWeaknesses || ''}

### **ตัวตนของ {{user}} ในสายตา {{char}}/ ทัศนคติที่เขามีต่อ{{user}}**
- บทบาทในเนื้อเรื่อง (Story Role): ${char.userStoryRole || ''}
- ความสัมพันธ์เริ่มต้นของ {{user}}: ${char.initialRelationship || ''}
- ทัศนคติต่อ {{user}}: ${char.userAttitude || ''}

### [ภูมิหลังความสัมพันธ์ (Backstory & Lore)]
${char.relationshipBackstory || ''}

### [ขอบเขตพฤติกรรมและ Logic ขั้นเด็ดขาดของ {{char}}]
1. **สิ่งที่จะไม่ทำเด็ดขาด (Absolute Anti-Behaviors)**
${char.absoluteAntiBehaviors || ''}

2. **ด้านน่ารัก หรือ มุมอ่อนโยนที่ซ่อนอยู่ (Hidden Soft Side)**
${char.hiddenSoftSide || ''}

3. **ด้านมืด (The Dark Side)**
${char.darkSide || ''}

### [พฤติกรรมทางเพศและบนเตียง (Sexual Behavior)]
#### 1. สไตล์และแนวทาง (Sexual Style)
${char.sexualStyle || ''}

#### 2. รสนิยมจำเพาะ (Kinks / Preferences)
${char.kinksPreferences || ''}

#### 3. การดูแลหลังกิจกรรม (Aftercare Style)
${char.aftercareStyle || ''}

### [Lifestyle & กิจวัตรประจำวัน (Daily Routine & Lifestyle)]
${char.dailyRoutine || ''}

### [Core Concept, Setting & Supporting Cast]
### 1. โทนเรื่องและฉากหลัง (Tone & Setting)
${char.toneSetting || ''}

### 2. สถานที่ในเรื่อง (Locations 10 ช่อง)
${char.locations && char.locations.length > 0 ? char.locations.map((loc, i) => `${i + 1}. ${loc.name}: ${loc.prompt}`).join('\n') : ''}

### 3. ตัวละครเสริมที่มีบทบาทสำคัญ (Supporting Characters)
${char.supportingCharacters && char.supportingCharacters.length > 0 ? char.supportingCharacters.map(sc => `- [ชื่อ]: ${sc.name} | [เพศ]: ${sc.gender} | [อายุ]: ${sc.age} | [บุคลิก]: ${sc.personality} | [ความสัมพันธ์]: ${sc.relationship} | [หน้าที่หลักในเรื่อง]: ${sc.mainRole} | [ปรากฎเมื่อ]: ${sc.appearWhen}`).join('\n') : ''}

🔸กฎข้อห้ามสำหรับตัวละครเสริม: ${char.subCharRules || ''}
🔸สิ่งที่ทำได้: ${char.subCharAllowed || ''}

## คำโปรยสั้นๆ (Short Intro)
${char.shortIntro || ''}
${char.punchline ? `\nประโยคเด็ด: ${char.punchline}` : ''}

### เนื้อเรื่องย่อ
${char.plotSummary || ''}

### ข้อมูลสาธารณะ
${char.publicInfo || ''}

### การใส่แท็กสำหรับจัดหมวดหมู่เรื่องนี้
${catTagsStr || ''}

### ฉากเปิด (ช่วง Open Greeting)
${char.fullGreeting || char.openGreetingNarrative || ''}`;
}
