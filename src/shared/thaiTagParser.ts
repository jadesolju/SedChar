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
  'สยองขวัญ / ลึกลับ', 'ดราม่าเข้มข้น', 'โรแมนติกคอมเมดี้', 'BL / Yaoi', 'GL / Yuri'
];

export const DEFAULT_PURRPAW_LOCATIONS: LocationItem[] = [
  { id: 'loc_1', name: 'ห้องทำงานส่วนตัว', prompt: 'ห้องทำงานสไตล์โมเดิร์นลักชัวรี่ บรรยากาศเงียบสงบ มีโต๊ะไม้โอ๊คสีเข้มและกระจกบานใหญ่ชมวิวเมือง' },
  { id: 'loc_2', name: 'ห้องนอนเพนต์เฮาส์', prompt: 'ห้องนอนหรูหรา บรรยากาศสลัว แสงไฟวอร์มไลท์ เตียงคิงไซส์สีดำ มีกลิ่นน้ำหอมเฉพาะตัว' },
  { id: 'loc_3', name: 'บาร์ลับใต้ดิน', prompt: 'บาร์ค็อกเทลส่วนตัว บรรยากาศสลัว เสียงดนตรีแจ๊สคลอเบาๆ แสงนีออนสีแดงสะท้อนแก้ววิสกี้' },
  { id: 'loc_4', name: 'ระเบียงชมวิวแม่น้ำ', prompt: 'ระเบียงกว้างวิวพาโนรามา ลมเย็นยามค่ำคืน มองเห็นแสงไฟระยิบระยับของสะพานข้ามแม่น้ำ' },
  { id: 'loc_5', name: 'ห้องฝึกซ้อมยิงปืน', prompt: 'ห้องฝึกซ้อมเก็บเสียงใต้คฤหาสน์ มีเป้าซ้อมและคลังอาวุธเก็บอย่างเป็นระเบียบ' },
  { id: 'loc_6', name: 'ห้องครัวคอนโดหรู', prompt: 'เคาน์เตอร์หินอ่อนสีดำ อุปกรณ์ทำอาหารระดับพรีเมียม บรรยากาศตอนเช้ามีแสงแดดอ่อนๆ' },
  { id: 'loc_7', name: 'ที่จอดรถซูเปอร์คาร์', prompt: 'ที่จอดรถส่วนตัวใต้ดิน ปูพื้นอีพ็อกซีเงาวับ เรียงรายด้วยซูเปอร์คาร์หรูหรา' },
  { id: 'loc_8', name: 'สวนหย่อมสไตล์เซน', prompt: 'สวนหินญี่ปุ่นและต้นไผ่ เสียงน้ำไหลจากกระบอกไม้ไผ่ บรรยากาศร่มรื่นเงียบสงบ' },
  { id: 'loc_9', name: 'ห้องนั่งเล่นโซฟาหนัง', prompt: 'โซฟาหนังแท้สีเบอร์กันดี พรมเปอร์เซียหนานุ่ม มีเตาผิงไฟฟ้าและจอทีวีขนาดยักษ์' },
  { id: 'loc_10', name: 'ดาดฟ้าชมดาวยามค่ำคืน', prompt: 'ดาดฟ้าเปิดโล่งมองเห็นท้องฟ้าและดวงดาว มีเก้าอี้เดย์เบดและแก้วไวน์วางเคียงข้าง' }
];

// Helper to clean raw strings
function cleanString(val: any): string {
  if (!val) return '';
  if (Array.isArray(val)) return val.filter(Boolean).join('\n');
  const str = String(val).trim();
  if (
    str === '-' ||
    str === '—' ||
    str === 'N/A' ||
    str === 'n/a' ||
    str === 'ไม่มี' ||
    str === 'ไม่ได้ระบุ' ||
    str === 'null' ||
    str === 'undefined' ||
    str === 'None' ||
    str === 'none' ||
    str === '- ไม่ได้ระบุ'
  ) {
    return '';
  }
  return str;
}

function cleanArray(val: any): string[] {
  if (!val) return [];
  let arr: string[] = [];
  if (Array.isArray(val)) {
    arr = val.map(String);
  } else if (typeof val === 'string') {
    arr = val.split(/[,\n|;]/);
  }
  return arr
    .map(s => s.trim().replace(/^[-*•]\s*/, ''))
    .filter(s => {
      const clean = cleanString(s);
      return Boolean(clean);
    });
}

export function formatCount(val: string | number | undefined | null): string {
  if (typeof val === 'number') return val.toLocaleString('th-TH');
  if (typeof val === 'string') return val.length.toLocaleString('th-TH');
  return '0';
}

export function autoDetectCharacterFlag(char: ThaiMasterCharacter): CharacterFlagType {
  const text = [
    char.coreTraits,
    char.darkSide,
    char.userExclusiveBehaviors,
    char.absoluteAntiBehaviors,
    ...char.personalityTags,
  ].join(' ').toLowerCase();

  if (text.includes('ฆ่า') || text.includes('ทรมาน') || text.includes('มนต์ดำ') || text.includes('กักขัง') || text.includes('เหี้ยม')) {
    return 'black';
  }
  if (text.includes('ขี้หึง') || text.includes('รุนแรง') || text.includes('บังคับ') || text.includes('ครอบงำ')) {
    return 'red';
  }
  if (text.includes('ซึนเดเระ') || text.includes('ปากร้าย') || text.includes('เจ้าเล่ห์')) {
    return 'yellow';
  }
  if (text.includes('อบอุ่น') || text.includes('ใจดี') || text.includes('สุภาพ') || text.includes('ปกป้อง')) {
    return 'green';
  }
  return 'none';
}

export const analyzeCharacterFlag = autoDetectCharacterFlag;

export function parseMarkdownToCharacter(raw: string): ThaiMasterCharacter {
  if (!raw || !raw.trim()) {
    return { ...DEFAULT_CHARACTER };
  }

  const char: ThaiMasterCharacter = { ...DEFAULT_CHARACTER };

  const matchFirst = (patterns: RegExp[]): string => {
    for (const p of patterns) {
      const m = raw.match(p);
      if (m && m[1]) {
        const cleaned = cleanString(m[1]);
        if (cleaned) return cleaned;
      }
    }
    return '';
  };

  // 1. General Profile
  char.nickname = matchFirst([
    /(?:ชื่อเล่น|Nickname)\s*[:：=]\s*([^\n\r]+)/i,
    /\[(?:CHARACTER|ชื่อตัวละคร)\]\s*[:：=]\s*([^\n\r(]+)/i,
  ]);
  char.fullName = matchFirst([
    /(?:ชื่อเต็ม|Full\s*Name|ชื่อจริง)\s*[:：=]\s*([^\n\r]+)/i,
    /\[(?:CHARACTER)\]\s*[:：=]\s*([^\n\r]+)/i,
  ]);
  if (!char.nickname && char.fullName) {
    char.nickname = char.fullName.split(/[\s(]/)[0] || '';
  }
  if (!char.fullName && char.nickname) {
    char.fullName = char.nickname;
  }

  char.age = matchFirst([
    /(?:อายุ|Age)\s*[:：=]\s*([^\n\r]+)/i,
    /\[(?:AGE|อายุ)\]\s*[:：=]\s*([^\n\r]+)/i,
  ]);

  char.gender = matchFirst([
    /(?:เพศ|Gender)\s*[:：=]\s*([^\n\r]+)/i,
    /\[(?:GENDER|เพศ)\]\s*[:：=]\s*([^\n\r]+)/i,
  ]);

  char.status = matchFirst([
    /(?:สถานะ|Relationship\s*Status|Status)\s*[:：=]\s*([^\n\r]+)/i,
  ]);

  char.birthdate = matchFirst([
    /(?:วันเดือนปีเกิด|วันเกิด|Birthdate|Birthday)\s*[:：=]\s*([^\n\r]+)/i,
  ]);

  char.weightHeight = matchFirst([
    /(?:น้ำหนัก\s*[\/และ]\s*ส่วนสูง|น้ำหนัก\s*ส่วนสูง|Weight\s*Height)\s*[:：=]\s*([^\n\r]+)/i,
    /(?:ส่วนสูง\s*น้ำหนัก|Height\s*Weight)\s*[:：=]\s*([^\n\r]+)/i,
  ]);

  char.mbti = matchFirst([
    /(?:MBTI)\s*[:：=]\s*([A-Za-z]{4}[^\n\r]*)/i,
    /\[(?:MBTI)\]\s*[:：=]\s*([A-Za-z]{4}[^\n\r]*)/i,
    /#(INFP|INFJ|INTP|INTJ|ISFP|ISFJ|ISTP|ISTJ|ENFP|ENFJ|ENTP|ENTJ|ESFP|ESFJ|ESTP|ESTJ)\b/i,
  ]);

  char.sexualOrientation = matchFirst([
    /(?:รสนิยมทางเพศ|Sexual\s*Orientation)\s*[:：=]\s*([^\n\r]+)/i,
  ]);

  char.car = matchFirst([
    /(?:รถที่ใช้|ยานพาหนะ|Car|Vehicle)\s*[:：=]\s*([^\n\r]+)/i,
  ]);

  char.perfume = matchFirst([
    /(?:กลิ่นน้ำหอม|กลิ่นตัว|กลิ่นกาย|Perfume|Scent)\s*[:：=]\s*([^\n\r]+)/i,
  ]);

  char.address = matchFirst([
    /(?:ที่อยู่|ที่พัก|ที่อยู่อาศัย|Address|Residence)\s*[:：=]\s*([^\n\r]+)/i,
  ]);

  char.wealthStatus = matchFirst([
    /(?:ฐานะ|ความมั่งคั่ง|Wealth\s*Status|Financial)\s*[:：=]\s*([^\n\r]+)/i,
  ]);

  char.occupation = matchFirst([
    /(?:อาชีพ|Role|Occupation|Job)\s*[:：=]\s*([^\n\r]+)/i,
    /\[(?:ROLE|บทบาท|อาชีพ)\]\s*[:：=]\s*([^\n\r]+)/i,
  ]);

  char.fashionStyle = matchFirst([
    /(?:สไตล์การแต่งตัว|การแต่งกาย|Fashion\s*Style|Outfit)\s*[:：=]\s*([^\n\r]+)/i,
  ]);

  // 2. Appearance & Visual Tags
  const appMatch = raw.match(/(?:ลักษณะภายนอก|Appearance|รูปลักษณ์)(?:\s*\([^)]*\))?\s*[:：\n]\s*([\s\S]*?)(?=\n\s*(?:#|\[|\d+\.|\bสิ่งที่ชอบ|\bนิสัย|\bCore))/i);
  if (appMatch && appMatch[1]) {
    char.appearanceDesc = cleanString(appMatch[1].replace(/#[^\n\r]+/g, '').trim());
  }

  // Extract visual hashtags
  const visualTagsMatch = raw.match(/#([^\n\r]+)/g);
  if (visualTagsMatch) {
    const extractedTags: string[] = [];
    visualTagsMatch.forEach(tagLine => {
      const parts = tagLine.split(/[\s,]+/);
      parts.forEach(p => {
        const t = p.replace(/^#/, '').trim();
        if (t && !extractedTags.includes(t)) {
          extractedTags.push(t);
        }
      });
    });
    char.visualTags = extractedTags.slice(0, 10);
  }

    // 3. Psychology & Core Traits
  const psychoMatch = raw.match(/(?:\[นิสัยและพฤติกรรม[^\]]*\]|\[CORE PERSONALITY[^\]]*\]|นิสัยและบุคลิกภาพ|นิสัยและพฤติกรรม)\s*[:：\n]\s*([\s\S]*?)(?=\n\s*(?:\[|\d+\.|\bสิ่งที่ชอบ|\bพฤติกรรมทั่วไป))/i);
  if (psychoMatch && psychoMatch[1]) {
    const rawPsycho = psychoMatch[1];
    char.coreTraits = cleanString(rawPsycho.replace(/#[^\n\r]+/g, '').trim());
    
    // Extract hashtags from psycho section specifically
    const pTags = rawPsycho.match(/#([^\s,]+)/g);
    if (pTags) {
      char.personalityTags = pTags.map(t => t.replace(/^#/, '').trim()).filter(Boolean);
    }
  }

  // 4. Likes & Dislikes Logic
  const likesSection = raw.match(/(?:สิ่งที่ชอบ|Likes)\s*[:：\n]\s*([\s\S]*?)(?=\n\s*(?:สิ่งที่ไม่ชอบ|Dislikes|พฤติกรรมทั่วไป|\[|\d+\.))/i);
  if (likesSection && likesSection[1]) {
    const lines = likesSection[1].split('\n').map(l => l.trim().replace(/^[-*•]\s*/, '')).filter(Boolean);
    char.likes = lines.map(cleanString).filter(Boolean);
  }

  const dislikesSection = raw.match(/(?:สิ่งที่ไม่ชอบ|Dislikes)\s*[:：\n]\s*([\s\S]*?)(?=\n\s*(?:พฤติกรรมทั่วไป|พฤติกรรมพิเศษ|\[|\d+\.|ตัวตนของ))/i);
  if (dislikesSection && dislikesSection[1]) {
    const lines = dislikesSection[1].split('\n').map(l => l.trim().replace(/^[-*•]\s*/, '')).filter(Boolean);
    char.dislikes = lines.map(cleanString).filter(Boolean);
  }

  // 5. Behaviors
  const genBeh = raw.match(/(?:พฤติกรรมทั่วไป|General\s*Behaviors)(?:\s*\([^)]*\))?\s*[:：\n]\s*([\s\S]*?)(?=\n\s*(?:พฤติกรรมพิเศษ|Exclusive|\[|\d+\.|ตัวตนของ))/i);
  if (genBeh && genBeh[1]) {
    char.generalBehaviors = cleanString(genBeh[1].trim());
  }

  const excBeh = raw.match(/(?:พฤติกรรมพิเศษเฉพาะกับ\s*\{\{user\}\}|Exclusive\s*Behaviors)(?:\s*\([^)]*\))?\s*[:：\n]\s*([\s\S]*?)(?=\n\s*(?:\[|\d+\.|ตัวตนของ|บทบาทในเนื้อเรื่อง))/i);
  if (excBeh && excBeh[1]) {
    char.userExclusiveBehaviors = cleanString(excBeh[1].trim());
  }

  // 6. 7 Core Psychology
  char.coreBelief = matchFirst([
    /(?:1\.\s*Core\s*Belief|Core\s*Belief)\s*[:：=]\s*(?:")?([^"\n\r]+)(?:")?/i,
  ]);
  char.mindset = matchFirst([
    /(?:2\.\s*Mindset|Mindset)\s*[:：=]\s*(?:")?([^"\n\r]+)(?:")?/i,
  ]);
  char.perception = matchFirst([
    /(?:3\.\s*Perception|Perception)\s*[:：=]\s*(?:")?([^"\n\r]+)(?:")?/i,
  ]);
  char.expression = matchFirst([
    /(?:4\.\s*Expression|Expression\s*Style|Speech\s*Style)\s*[:：=]\s*([\s\S]*?)(?=\n\s*(?:5\.\s*Behavior|Behavior\s*Under\s*Emotion|\d+\.))/i,
  ]);
  char.behaviorUnderEmotion = matchFirst([
    /(?:5\.\s*Behavior|Behavior\s*Under\s*Emotion)\s*[:：=]\s*([^\n\r]+)/i,
  ]);
  char.emotionalTriggers = matchFirst([
    /(?:6\.\s*Emotional\s*Triggers|Emotional\s*Triggers)\s*[:：=]\s*([^\n\r]+)/i,
  ]);
  char.flawsWeaknesses = matchFirst([
    /(?:7\.\s*Flaws\s*&\s*Weaknesses|Flaws\s*&\s*Weaknesses|Flaws)\s*[:：=]\s*([^\n\r]+)/i,
  ]);

  // 7. Relationship Dynamic & Story Role
  char.userStoryRole = matchFirst([
    /(?:บทบาทในเนื้อเรื่อง|Story\s*Role)\s*[:：=]\s*(?:")?([^"\n\r]+)(?:")?/i,
  ]);
  char.userAttitude = matchFirst([
    /(?:ทัศนคติที่มีต่อ\s*\{\{user\}\}|ทัศนคติที่เขามีต่อ|User\s*Attitude)\s*[:：=]\s*([\s\S]*?)(?=\n\s*(?:\[|\d+\.|สิ่งที่จะไม่ทำ|ภูมิหลังความสัมพันธ์))/i,
  ]);

  const backstoryMatch = raw.match(/(?:\[ภูมิหลังความสัมพันธ์[^\]]*\]|\[Backstory[^\]]*\]|ภูมิหลังความสัมพันธ์)\s*[:：\n]\s*([\s\S]*?)(?=\n\s*(?:\[|\d+\.|สิ่งที่จะไม่ทำ|พฤติกรรมทางเพศ))/i);
  if (backstoryMatch && backstoryMatch[1]) {
    char.relationshipBackstory = cleanString(backstoryMatch[1].trim());
  }

  // 8. Strict Boundaries
  const antiMatch = raw.match(/(?:สิ่งที่จะไม่ทำเด็ดขาด|Absolute\s*Anti-Behaviors|STRICT\s*CONSTRAINTS)\s*[:：\n]\s*([\s\S]*?)(?=\n\s*(?:ด้านน่ารัก|ด้านมืด|พฤติกรรมทางเพศ|\[|\d+\.))/i);
  if (antiMatch && antiMatch[1]) {
    char.absoluteAntiBehaviors = cleanString(antiMatch[1].trim());
  }

  const softMatch = raw.match(/(?:ด้านน่ารัก\s*หรือ\s*มุมอ่อนโยนที่ซ่อนอยู่|Hidden\s*Soft\s*Side)\s*[:：\n]\s*([\s\S]*?)(?=\n\s*(?:ด้านมืด|The\s*Dark\s*Side|พฤติกรรมทางเพศ|\[|\d+\.))/i);
  if (softMatch && softMatch[1]) {
    char.hiddenSoftSide = cleanString(softMatch[1].trim());
  }

  const darkMatch = raw.match(/(?:ด้านมืด|The\s*Dark\s*Side)\s*[:：\n]\s*([\s\S]*?)(?=\n\s*(?:พฤติกรรมทางเพศ|Sexual\s*Behavior|\[|\d+\.))/i);
  if (darkMatch && darkMatch[1]) {
    char.darkSide = cleanString(darkMatch[1].trim());
  }

  // 9. Sexual Behavior
  char.sexualStyle = matchFirst([
    /(?:สไตล์และแนวทาง|Sexual\s*Style)\s*[:：=]\s*([^\n\r]+)/i,
  ]);
  char.kinksPreferences = matchFirst([
    /(?:รสนิยมจำเพาะ|Kinks\s*[\/และ]\s*Preferences|Kinks)\s*[:：=]\s*([^\n\r]+)/i,
  ]);
  char.aftercareStyle = matchFirst([
    /(?:การดูแลหลังกิจกรรม|Aftercare\s*Style|Aftercare)\s*[:：=]\s*([^\n\r]+)/i,
  ]);

  // 10. Setting & Supporting Characters
  const toneMatch = raw.match(/(?:โทนเรื่องและฉากหลัง|Tone\s*&\s*Setting)\s*[:：\n]\s*([\s\S]*?)(?=\n\s*(?:ตัวละครเสริม|Supporting\s*Characters|\[|\d+\.))/i);
  if (toneMatch && toneMatch[1]) {
    char.toneSetting = cleanString(toneMatch[1].trim());
  }

  // Supporting Characters Parser
  const subChars: SubCharacter[] = [];
  const subRegex = /\[ตัวละครเสริม\s*\d+\]\s*[:：\n]\s*([\s\S]*?)(?=\n\s*\[ตัวละครเสริม|\n\s*คำโปรย|\n\s*เนื้อเรื่องย่อ|\n\s*ฉากเปิด|$)/gi;
  let subMatch;
  let scId = 1;
  while ((subMatch = subRegex.exec(raw)) !== null) {
    const block = subMatch[1] || '';
    const name = (block.match(/(?:\[ชื่อ\]|ชื่อ)\s*[:：=]\s*([^|\n\r]+)/i)?.[1] || '').trim();
    const gender = (block.match(/(?:\[เพศ\]|เพศ)\s*[:：=]\s*([^|\n\r]+)/i)?.[1] || '').trim();
    const age = (block.match(/(?:\[อายุ\]|อายุ)\s*[:：=]\s*([^|\n\r]+)/i)?.[1] || '').trim();
    const personality = (block.match(/(?:\[บุคลิก\]|บุคลิก)\s*[:：=]\s*([^|\n\r]+)/i)?.[1] || '').trim();
    const relationship = (block.match(/(?:\[ความสัมพันธ์\]|ความสัมพันธ์)\s*[:：=]\s*([^|\n\r]+)/i)?.[1] || '').trim();
    const mainRole = (block.match(/(?:\[หน้าที่หลักในเรื่อง\]|หน้าที่หลัก)\s*[:：=]\s*([^|\n\r]+)/i)?.[1] || '').trim();
    const appearWhen = (block.match(/(?:\[ปรากฎเมื่อ\]|ปรากฎเมื่อ)\s*[:：=]\s*([^|\n\r]+)/i)?.[1] || '').trim();

    if (name) {
      subChars.push({
        id: 'sub_' + scId++,
        name,
        gender,
        age,
        personality,
        relationship,
        mainRole,
        appearWhen,
        shortDesc: personality || relationship,
        systemPrompt: `${name} (${gender}, ${age}) - ${relationship}. หน้าที่: ${mainRole}. บุคลิก: ${personality}`,
      });
    }
  }
  if (subChars.length > 0) {
    char.supportingCharacters = subChars;
  }

  // 11. Short Intro, Plot Summary, Open Greeting
  char.shortIntro = matchFirst([
    /(?:คำโปรยสั้นๆ|Short\s*Intro)\s*[:：\n]\s*([\s\S]*?)(?=\n\s*(?:เนื้อเรื่องย่อ|ข้อมูลสาธารณะ|ฉากเปิด|\[))/i,
  ]);

  char.plotSummary = matchFirst([
    /(?:เนื้อเรื่องย่อ|Plot\s*Summary)\s*[:：\n]\s*([\s\S]*?)(?=\n\s*(?:ข้อมูลสาธารณะ|ฉากเปิด|\[))/i,
  ]);

  // Open Greeting
  const greetingMatch = raw.match(/(?:ฉากเปิด|Open\s*Greeting)\s*(?:\([^)]*\))?\s*[:：\n]\s*([\s\S]*?)(?=\n\s*(?:วิเคราะห์เนื้อหา|\[CHARACTER|\n\s*---|\n\s*#|$))/i);
  if (greetingMatch && greetingMatch[1]) {
    const fullGreetingText = greetingMatch[1].trim();
    char.fullGreeting = fullGreetingText;

    const dialogues = fullGreetingText.match(/"([^"]+)"/g);
    if (dialogues && dialogues.length > 0) {
      char.openGreetingDialogue = dialogues.join('\n');
    }
    char.openGreetingNarrative = fullGreetingText.replace(/>\s*/g, '').trim();
  }

  return char;
}

export function generatePurrpawOutput(char: ThaiMasterCharacter): PurrpawOutput {
  const displayName = char.fullName || char.nickname || 'ตัวละคร';
  const tagline = char.shortIntro || char.punchline || '';
  const tags = char.categoryTags.length > 0 ? char.categoryTags.join(', ') : '#DarkRomance, #Mystery, #Supernatural, #ENTJ';

  // Standardized Clean Markdown System Prompt
  const sections: string[] = [
    `# SYSTEM PROMPT FOR ${displayName.toUpperCase()}`,
    `โรลเพลย์เป็น ${displayName} อย่างเคร่งครัดตามข้อมูลที่กำหนด`,
    '',
    '## 1. ข้อมูลพื้นฐานและตัวตน (CHARACTER PROFILE)',
    char.fullName ? `- **ชื่อเต็ม:** ${char.fullName}` : '',
    char.nickname ? `- **ชื่อเล่น:** ${char.nickname}` : '',
    char.age ? `- **อายุ:** ${char.age}` : '',
    char.gender ? `- **เพศ:** ${char.gender}` : '',
    char.status ? `- **สถานะ:** ${char.status}` : '',
    char.mbti ? `- **MBTI:** ${char.mbti}` : '',
    (char.occupation || char.wealthStatus) ? `- **อาชีพ/ฐานะ:** ${[char.occupation, char.wealthStatus].filter(Boolean).join(' / ')}` : '',
    char.fashionStyle ? `- **สไตล์การแต่งตัว:** ${char.fashionStyle}` : '',
    char.perfume ? `- **กลิ่นกาย/น้ำหอม:** ${char.perfume}` : '',
    char.address ? `- **ที่อยู่/สถานที่พำนัก:** ${char.address}` : '',
    char.appearanceDesc ? `\n### รูปลักษณ์ภายนอก:\n${char.appearanceDesc}` : '',
    '',
    '## 2. โครงสร้างจิตวิทยาและบุคลิกภาพ (PSYCHOLOGY & MINDSET)',
    char.coreTraits ? `- **นิสัยหลัก:** ${char.coreTraits}` : '',
    char.coreBelief ? `- **ความเชื่อแก่นแท้ (Core Belief):** ${char.coreBelief}` : '',
    char.mindset ? `- **กรอบความคิด (Mindset):** ${char.mindset}` : '',
    char.perception ? `- **มุมมองต่อ {{user}} (Perception):** ${char.perception}` : '',
    char.expression ? `- **สไตล์การสื่อสาร (Expression):** ${char.expression}` : '',
    char.behaviorUnderEmotion ? `- **พฤติกรรมยามมีอารมณ์:** ${char.behaviorUnderEmotion}` : '',
    char.emotionalTriggers ? `- **จุดเร้าอารมณ์:** ${char.emotionalTriggers}` : '',
    char.flawsWeaknesses ? `- **จุดอ่อน/ปมในใจ:** ${char.flawsWeaknesses}` : '',
  ];

  if (char.likes.length > 0 || char.dislikes.length > 0) {
    sections.push('', '## 3. สิ่งที่ชอบและสิ่งที่ไม่ชอบ (LIKES & DISLIKES)');
    if (char.likes.length > 0) {
      sections.push('### สิ่งที่ชอบ:');
      char.likes.forEach(l => sections.push(`- ${l}`));
    }
    if (char.dislikes.length > 0) {
      sections.push('### สิ่งที่ไม่ชอบ:');
      char.dislikes.forEach(d => sections.push(`- ${d}`));
    }
  }

  sections.push(
    '',
    '## 4. ความสัมพันธ์และพฤติกรรมกับ {{user}} (RELATIONSHIP DYNAMICS)',
    char.userStoryRole ? `- **บทบาทของ {{user}}:** ${char.userStoryRole}` : '',
    char.userAttitude ? `- **ทัศนคติ:** ${char.userAttitude}` : '',
    char.generalBehaviors ? `- **พฤติกรรมทั่วไป:** ${char.generalBehaviors}` : '',
    char.userExclusiveBehaviors ? `- **พฤติกรรมพิเศษเฉพาะกับ {{user}}:** ${char.userExclusiveBehaviors}` : '',
    char.relationshipBackstory ? `- **ภูมิหลังความสัมพันธ์:** ${char.relationshipBackstory}` : '',
    '',
    '## 5. กฎเหล็กและขอบเขตพฤติกรรมเด็ดขาด (STRICT BOUNDARIES)',
    char.absoluteAntiBehaviors ? `- **สิ่งที่ไม่ทำเด็ดขาด:** ${char.absoluteAntiBehaviors}` : '',
    char.hiddenSoftSide ? `- **มุมที่ซ่อนอยู่:** ${char.hiddenSoftSide}` : '',
    char.darkSide ? `- **ด้านมืด:** ${char.darkSide}` : '',
    '- ห้ามหลุดคาแรกเตอร์เด็ดขาด',
    '- ห้ามบรรยายการกระทำ ความคิด หรือคำพูดแทน {{user}} เด็ดขาด'
  );

  const finalHistoryPrompt = sections.filter(Boolean).join('\n');

  const locationsList = (char.locations && char.locations.length > 0)
    ? char.locations
    : DEFAULT_PURRPAW_LOCATIONS.slice(0, 10);

  return {
    name: displayName,
    tagline,
    tags,
    historyPersonalityPrompt: finalHistoryPrompt,
    subCharacters: char.supportingCharacters.slice(0, 5).map(s => ({
      name: s.name,
      shortDesc: s.shortDesc || s.relationship || s.personality,
      systemPrompt: s.systemPrompt || `${s.name} (${s.relationship}) ${s.personality}`,
    })),
    locations: locationsList.slice(0, 10).map((l, i) => ({
      name: l.name || `สถานที่ ${i + 1}`,
      prompt: l.prompt || '',
    })),
    initialRelationship: char.initialRelationship || char.userStoryRole || '',
    openGreeting: char.fullGreeting || char.openGreetingNarrative || '',
    charCount: finalHistoryPrompt.length,
  };
}

export function generateRubiiOutput(char: ThaiMasterCharacter): RubiiOutput {
  const nick = char.nickname || char.fullName || 'ตัวละคร';
  const name = char.fullName || char.nickname || 'ตัวละคร';

  const sections: string[] = [
    `# SYSTEM PROMPT FOR ${name.toUpperCase()}`,
    `[Character("${name}")]`,
    `[Nickname("${nick}")]`,
    char.gender ? `[Gender("${char.gender}")]` : '',
    char.age ? `[Age("${char.age}")]` : '',
    char.mbti ? `[MBTI("${char.mbti}")]` : '',
    char.occupation ? `[Role("${char.occupation}")]` : '',
    char.appearanceDesc ? `[Appearance("${char.appearanceDesc.replace(/\n/g, ' ')}")]` : '',
    char.coreTraits ? `[Mind("${char.coreTraits.replace(/\n/g, ' ')}")]` : '',
    char.personalityTags.length > 0 ? `[Personality("${char.personalityTags.join(', ')}")]` : '',
    char.likes.length > 0 ? `[Likes("${char.likes.join(', ')}")]` : '',
    char.dislikes.length > 0 ? `[Dislikes("${char.dislikes.join(', ')}")]` : '',
    char.userExclusiveBehaviors ? `[InteractionWithUser("${char.userExclusiveBehaviors.replace(/\n/g, ' ')}")]` : '',
    char.absoluteAntiBehaviors ? `[StrictRules("ห้ามทำเด็ดขาด: ${char.absoluteAntiBehaviors.replace(/\n/g, ' ')}")]` : '',
  ];

  const personaSystemPrompt = sections.filter(Boolean).join('\n');

  return {
    name,
    publicDescription: char.plotSummary || char.shortIntro || '',
    personaSystemPrompt,
    momentIntro: char.shortIntro || char.momentIntro || '',
    openGreeting: char.fullGreeting || char.openGreetingNarrative || '',
    tokenEstimate: Math.ceil(personaSystemPrompt.length / 3),
  };
}

export function generateKhuiOutput(char: ThaiMasterCharacter): KhuiOutput {
  const displayName = char.fullName || char.nickname || 'ตัวละคร';
  const purrpaw = generatePurrpawOutput(char);
  const sysPrompt = purrpaw.historyPersonalityPrompt;
  const tagsStr = char.categoryTags.length > 0 
    ? char.categoryTags.map(t => t.startsWith('#') ? t : '#' + t).join(', ')
    : char.personalityTags.map(t => t.startsWith('#') ? t : '#' + t).join(', ');

  const totalCharCount = (displayName + (char.shortIntro || '') + sysPrompt + (char.appearanceDesc || '') + (char.fullGreeting || '')).length;

  return {
    name: displayName,
    tagline: char.shortIntro || char.punchline || '',
    systemPrompt: sysPrompt,
    characterDescription: char.appearanceDesc || char.coreTraits || '',
    openGreeting: char.fullGreeting || char.openGreetingNarrative || '',
    subCharacters: char.supportingCharacters.slice(0, 3).map(s => ({
      name: s.name,
      description: s.shortDesc || [s.relationship, s.personality, s.mainRole].filter(Boolean).join(' | '),
    })),
    userRelationshipScenario: char.relationshipBackstory || char.plotSummary || '',
    tags: tagsStr,
    charCount: totalCharCount,
  };
}

export function characterToFullMarkdown(char: ThaiMasterCharacter): string {
  const visualTagsStr = char.visualTags.length > 0 ? char.visualTags.map(t => t.startsWith('#') ? t : '#' + t).join(' ') : '';
  const pTagsStr = char.personalityTags.length > 0 ? char.personalityTags.map(t => t.startsWith('#') ? t : '#' + t).join(' ') : '';
  const catTagsStr = char.categoryTags.length > 0 ? char.categoryTags.map(t => t.startsWith('#') ? t : '#' + t).join(' ') : '';

  let md = `## **[ข้อมูลพื้นฐาน - Character Profile (General Info)]**\n\n`;
  if (char.nickname) md += `- **ชื่อเล่น**: ${char.nickname}\n`;
  if (char.fullName) md += `- **ชื่อเต็ม**: ${char.fullName}\n`;
  if (char.age) md += `- **อายุ**: ${char.age}\n`;
  if (char.gender) md += `- **เพศ**: ${char.gender}\n`;
  if (char.status) md += `- **สถานะ**: ${char.status}\n`;
  if (char.birthdate) md += `- **วันเดือนปีเกิด**: ${char.birthdate}\n`;
  if (char.weightHeight) md += `- **น้ำหนัก / ส่วนสูง**: ${char.weightHeight}\n`;
  if (char.mbti) md += `- **MBTI**: ${char.mbti}\n`;
  if (char.sexualOrientation) md += `- **รสนิยมทางเพศ**: ${char.sexualOrientation}\n`;
  if (char.car) md += `- **รถที่ใช้**: ${char.car}\n`;
  if (char.perfume) md += `- **กลิ่นน้ำหอม**: ${char.perfume}\n`;
  if (char.address) md += `- **ที่อยู่**: ${char.address}\n`;
  if (char.wealthStatus) md += `- **ฐานะ**: ${char.wealthStatus}\n`;
  if (char.occupation) md += `- **อาชีพ**: ${char.occupation}\n`;
  if (char.fashionStyle) md += `- **สไตล์การแต่งตัว**: ${char.fashionStyle}\n`;

  md += `\n## ลักษณะภายนอก (Appearance)\n\n`;
  if (char.appearanceDesc) md += `${char.appearanceDesc}\n`;
  if (char.visualFeatures) md += `\nจุดเด่น: ${char.visualFeatures}\n`;
  if (visualTagsStr) md += `\n${visualTagsStr}\n`;

  if (char.nsfwMaleSize || char.nsfwFemaleChest || char.nsfwFemaleVagina) {
    md += `\n### ส่วนลับ (NSFW Info)\n`;
    if (char.nsfwMaleSize) md += `- **ขนาดโจ้ย:** ${char.nsfwMaleSize}\n`;
    if (char.nsfwFemaleChest) md += `- **ขนาดหน้าอก:** ${char.nsfwFemaleChest}\n`;
    if (char.nsfwFemaleVagina) md += `- **จิ๊มิ:** ${char.nsfwFemaleVagina}\n`;
  }

  md += `\n## [นิสัยและพฤติกรรม Psychology & Personality]\n\n`;
  if (char.coreTraits) md += `${char.coreTraits}\n`;
  if (pTagsStr) md += `\n${pTagsStr}\n`;

  if (char.likes.length > 0 || char.dislikes.length > 0) {
    md += `\n## [สิ่งที่ชอบ / สิ่งที่ไม่ชอบ และปฏิกิริยา (Likes & Dislikes Logic)]\n\n`;
    if (char.likes.length > 0) {
      md += `สิ่งที่ชอบ:\n`;
      char.likes.forEach(l => { md += `- ${l}\n`; });
    }
    if (char.dislikes.length > 0) {
      md += `\nสิ่งที่ไม่ชอบ:\n`;
      char.dislikes.forEach(d => { md += `- ${d}\n`; });
    }
  }

  if (char.generalBehaviors || char.userExclusiveBehaviors) {
    md += `\n## พฤติกรรม (Behaviors)\n\n`;
    if (char.generalBehaviors) md += `### พฤติกรรมทั่วไป (General Behaviors)\n${char.generalBehaviors}\n\n`;
    if (char.userExclusiveBehaviors) md += `### พฤติกรรมพิเศษเฉพาะกับ {{user}} (Exclusive Behaviors)\n${char.userExclusiveBehaviors}\n\n`;
  }

  if (char.coreBelief || char.mindset || char.perception || char.expression || char.behaviorUnderEmotion || char.emotionalTriggers || char.flawsWeaknesses) {
    md += `## [โครงสร้างจิตวิทยา 7 ข้อ]\n\n`;
    if (char.coreBelief) md += `1. Core Belief: "${char.coreBelief}"\n`;
    if (char.mindset) md += `2. Mindset: "${char.mindset}"\n`;
    if (char.perception) md += `3. Perception: "${char.perception}"\n`;
    if (char.expression) md += `4. Expression: ${char.expression}\n`;
    if (char.behaviorUnderEmotion) md += `5. Behavior: ${char.behaviorUnderEmotion}\n`;
    if (char.emotionalTriggers) md += `6. Emotional Triggers: ${char.emotionalTriggers}\n`;
    if (char.flawsWeaknesses) md += `7. Flaws & Weaknesses: ${char.flawsWeaknesses}\n\n`;
  }

  if (char.userStoryRole || char.userAttitude) {
    md += `## ตัวตนของ {{user}} ในสายตา {{char}}\n\n`;
    if (char.userStoryRole) md += `- **บทบาทในเนื้อเรื่อง (Story Role):** ${char.userStoryRole}\n`;
    if (char.userAttitude) md += `- **ทัศนคติที่มีต่อ {{user}}:** ${char.userAttitude}\n\n`;
  }

  if (char.relationshipBackstory) {
    md += `## [ภูมิหลังความสัมพันธ์ (Backstory & Lore)]\n\n${char.relationshipBackstory}\n\n`;
  }

  if (char.absoluteAntiBehaviors || char.hiddenSoftSide || char.darkSide) {
    md += `## [ขอบเขตพฤติกรรมและ Logic ขั้นเด็ดขาดของ {{char}}]\n\n`;
    if (char.absoluteAntiBehaviors) md += `### สิ่งที่จะไม่ทำเด็ดขาด (Absolute Anti-Behaviors)\n${char.absoluteAntiBehaviors}\n\n`;
    if (char.hiddenSoftSide) md += `### ด้านน่ารัก หรือ มุมอ่อนโยนที่ซ่อนอยู่ (Hidden Soft Side)\n${char.hiddenSoftSide}\n\n`;
    if (char.darkSide) md += `### ด้านมืด (The Dark Side)\n${char.darkSide}\n\n`;
  }

  if (char.sexualStyle || char.kinksPreferences || char.aftercareStyle) {
    md += `## [พฤติกรรมทางเพศและบนเตียง (Sexual Behavior)]\n\n`;
    if (char.sexualStyle) md += `- **สไตล์และแนวทาง (Sexual Style):** ${char.sexualStyle}\n`;
    if (char.kinksPreferences) md += `- **รสนิยมจำเพาะ (Kinks / Preferences):** ${char.kinksPreferences}\n`;
    if (char.aftercareStyle) md += `- **การดูแลหลังกิจกรรม (Aftercare Style):** ${char.aftercareStyle}\n\n`;
  }

  if (char.toneSetting || (char.supportingCharacters && char.supportingCharacters.length > 0)) {
    md += `## [Core Concept, Setting & Supporting Cast]\n\n`;
    if (char.toneSetting) md += `### โทนเรื่องและฉากหลัง (Tone & Setting)\\n${char.toneSetting}\n\n`;
    if (char.supportingCharacters && char.supportingCharacters.length > 0) {
      md += `### ตัวละครเสริมที่มีบทบาทสำคัญ (Supporting Characters)\n`;
      char.supportingCharacters.forEach((sc, i) => {
        md += `[ตัวละครเสริม ${i + 1}]:\n[ชื่อ]: ${sc.name} | [เพศ]: ${sc.gender || '-'} | [อายุ]: ${sc.age || '-'} | [บุคลิก]: ${sc.personality || '-'} | [ความสัมพันธ์]: ${sc.relationship || '-'} | [หน้าที่หลักในเรื่อง]: ${sc.mainRole || '-'} | [ปรากฎเมื่อ]: ${sc.appearWhen || '-'}\n\n`;
      });
    }
  }

  if (char.shortIntro) md += `## คำโปรยสั้นๆ (Short Intro)\n\n${char.shortIntro}\n\n`;
  if (char.plotSummary) md += `## เนื้อเรื่องย่อ\n\n${char.plotSummary}\n\n`;
  if (catTagsStr) md += `## การใส่แท็กสำหรับจัดหมวดหมู่เรื่องนี้\n\n${catTagsStr}\n\n`;
  if (char.fullGreeting || char.openGreetingNarrative) {
    md += `## ฉากเปิด (Open Greeting)\n\n${char.fullGreeting || char.openGreetingNarrative}\n\n`;
  }

  return md.trim();
}
