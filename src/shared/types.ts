// ============================================================
// SedChar.AI v2.0 — Core Type Definitions
// TypeScript strict mode: zero `any` allowed
// ============================================================

export type Platform = 'rubii' | 'purrpaw' | 'khui';

export type CharacterFlagType =
  | 'none'
  | 'white'
  | 'green'
  | 'yellow'
  | 'red'
  | 'black'
  | 'watermelon'
  | 'reverse-watermelon';

export interface CharacterFlagInfo {
  type: CharacterFlagType;
  label: string;
  emoji: string;
  colorClass: string;
  badgeBg: string;
  description: string;
}

export const CHARACTER_FLAGS: Record<CharacterFlagType, CharacterFlagInfo> = {
  none: {
    type: 'none',
    label: 'ยังไม่ได้ระบุ',
    emoji: '🏳️',
    colorClass: 'text-gray-400',
    badgeBg: 'bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-zinc-700',
    description: 'ไม่ได้กำหนดธงความสัมพันธ์',
  },
  white: {
    type: 'white',
    label: 'ธงขาว',
    emoji: '🏳️',
    colorClass: 'text-zinc-600 dark:text-zinc-200',
    badgeBg: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border-zinc-300 dark:border-zinc-700',
    description: 'ความรักที่บริสุทธิ์และยอมจำนน แสนดี ยอมทุกอย่าง ยอมให้อภัยเสมอแม้ตัวเองจะเจ็บปวด',
  },
  green: {
    type: 'green',
    label: 'ธงเขียว',
    emoji: '🟢',
    colorClass: 'text-emerald-600 dark:text-emerald-400',
    badgeBg: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
    description: 'ความสัมพันธ์ที่ปลอดภัยและสบายใจ เป็นคนดี อบอุ่น ให้เกียรติ และคอยซัพพอร์ตกัน',
  },
  yellow: {
    type: 'yellow',
    label: 'ธงเหลือง',
    emoji: '🟡',
    colorClass: 'text-amber-600 dark:text-amber-400',
    badgeBg: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800',
    description: 'สัญญาณเตือนให้ระวัง มีพฤติกรรมบางอย่างที่น่าสงสัย ต้องใช้เวลาศึกษาและประเมินกันต่อไป',
  },
  red: {
    type: 'red',
    label: 'ธงแดง',
    emoji: '🔴',
    colorClass: 'text-rose-600 dark:text-rose-400',
    badgeBg: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800',
    description: 'สัญญาณอันตรายขั้นวิกฤต เป็นพิษ (Toxic) ควบคุม บงการ หรือทำร้ายจิตใจ ควรพิจารณาถอยออกมา',
  },
  black: {
    type: 'black',
    label: 'ธงดำ',
    emoji: '⚫',
    colorClass: 'text-zinc-900 dark:text-zinc-100',
    badgeBg: 'bg-neutral-100 text-neutral-900 border-neutral-300 dark:bg-neutral-900 dark:text-neutral-100 dark:border-neutral-700',
    description: 'ระดับอันตรายสูงสุด ร้ายกาจ เป็นพิษแบบรุนแรง ทำร้ายร่างกายหรือจิตใจแบบดิ่งลึก ไร้ความเห็นใจ',
  },
  watermelon: {
    type: 'watermelon',
    label: 'ธงแตงโม (เขียวนอก แดงใน)',
    emoji: '🍉',
    colorClass: 'text-rose-600 dark:text-rose-400',
    badgeBg: 'bg-gradient-to-r from-emerald-100 to-rose-100 dark:from-emerald-950/40 dark:to-rose-950/40 text-rose-800 dark:text-rose-300 border-emerald-400 dark:border-emerald-700',
    description: 'ภายนอกดูเป็นคนดี น่ารัก อบอุ่น (ธงเขียว) แต่เนื้อในซ่อนความเจ้าเล่ห์ มีพิษสง หรือนิสัยแย่ๆ (ธงแดง)',
  },
  'reverse-watermelon': {
    type: 'reverse-watermelon',
    label: 'ธงแตงโมกลับด้าน (แดงนอก เขียวใน)',
    emoji: '🍓',
    colorClass: 'text-emerald-600 dark:text-emerald-400',
    badgeBg: 'bg-gradient-to-r from-rose-100 to-emerald-100 dark:from-rose-950/40 dark:to-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-rose-400 dark:border-rose-700',
    description: 'ภายนอกดูดุ แข็งกระด้าง หรือเหมือนคนนิสัยไม่ดี (ธงแดง) แต่เนื้อแท้ข้างในกลับเป็นคนแสนดี อ่อนโยน (ธงเขียว)',
  },
};

export interface SubCharacter {
  id: string;
  name: string;
  gender: string;
  age: string;
  personality: string;
  relationship: string;
  mainRole: string;
  appearWhen: string;
  shortDesc: string; // 0/500 characters
  systemPrompt: string; // 0/750 characters
  isSelected?: boolean; // Whether active/selected for export
}

export interface LocationItem {
  id: string;
  name: string;
  prompt: string; // สั้นๆ กระชับ ไม่เป็นประโยค ไม่พรรณา
}

export interface ThaiMasterCharacter {
  // 1. ข้อมูลพื้นฐาน (General Info)
  nickname: string;
  fullName: string;
  age: string;
  gender: string;
  status: string;
  birthdate: string;
  weightHeight: string;
  mbti: string;
  sexualOrientation: string;
  car: string;
  perfume: string;
  address: string;
  wealthStatus: string;
  occupation: string;
  fashionStyle: string;

  // 2. รูปลักษณ์ (Appearance & NSFW)
  appearanceDesc: string;
  visualFeatures: string;
  visualTags: string[];
  nsfwMaleSize: string;
  nsfwFemaleChest: string;
  nsfwFemaleVagina: string;

  // 3. นิสัยและพฤติกรรม (Psychology & Personality)
  coreTraits: string;
  personalityTags: string[];
  likes: string[];
  dislikes: string[];
  generalBehaviors: string;
  userExclusiveBehaviors: string;

  // โครงสร้างจิตวิทยา 7 ข้อ
  coreBelief: string;
  mindset: string;
  perception: string;
  expression: string;
  behaviorUnderEmotion: string;
  emotionalTriggers: string;
  flawsWeaknesses: string;

  // 4. ความสัมพันธ์กับ {{user}}
  userStoryRole: string;
  initialRelationship: string;
  relationshipBackstory: string;
  userAttitude: string;

  // 5. ขอบเขตและ Logic ขั้นเด็ดขาด
  absoluteAntiBehaviors: string;
  hiddenSoftSide: string;
  darkSide: string;
  systemRules: string[];

  // 6. พฤติกรรมทางเพศและบนเตียง
  sexualStyle: string;
  kinksPreferences: string;
  aftercareStyle: string;

  // 7. Lifestyle
  dailyRoutine: string;

  // 8. ฉากหลัง & สถานที่ (Tone & Locations - Max 10)
  toneSetting: string;
  locations: LocationItem[];

  // 9. ตัวละครเสริม (Supporting Characters - Max 5)
  supportingCharacters: SubCharacter[];
  subCharRules: string;
  subCharAllowed: string;

  // Garage Storage (คลังเก็บข้อมูลส่วนเกิน)
  garageStorage: string;

  // 10. คำโปรย & บทนำ
  shortIntro: string; // 0/500
  punchline: string; // 1 ประโยคเด็ด
  plotSummary: string;
  publicInfo: string;
  categoryTags: string[];
  momentIntro: string; // Max 100

  // 11. ฉากเปิด (Open Greeting)
  openGreetingNarrative: string;
  openGreetingDialogue: string;
  fullGreeting: string;

  // Flag Analysis
  flagType: CharacterFlagType;
}

export interface RubiiOutput {
  name: string;
  publicDescription: string;
  personaSystemPrompt: string;
  momentIntro: string;
  openGreeting: string;
  tokenEstimate: number;
}

export interface PurrpawOutput {
  name: string;
  tagline: string;
  tags: string;
  historyPersonalityPrompt: string;
  subCharacters: Array<{
    name: string;
    shortDesc: string;
    systemPrompt: string;
  }>;
  locations: Array<{
    name: string;
    prompt: string;
  }>;
  initialRelationship: string;
  openGreeting: string;
  charCount: number;
}

export interface KhuiOutput {
  name: string;
  tagline: string;
  systemPrompt: string;
  characterDescription: string;
  openGreeting: string;
  subCharacters: Array<{
    name: string;
    description: string;
  }>;
  scenarioPlotSummary: string;
  userRelationshipScenario: string;
  tags: string;
  charCount: number;
}

export interface PlatformConfig {
  id: Platform;
  label: string;
  description: string;
  minTarget: number;
  maxTarget: number;
  accentClass: string;
}

export const PLATFORM_CONFIGS: Readonly<Record<Platform, PlatformConfig>> = {
  rubii: {
    id: 'rubii',
    label: 'Rubii',
    description: 'Persona + System Prompt (Gemini Token Counting)',
    minTarget: 8000,
    maxTarget: 25000,
    accentClass: 'text-violet-500',
  },
  purrpaw: {
    id: 'purrpaw',
    label: 'Purrpaw',
    description: 'Markdown DB — สูงสุด 30,000 ตัวอักษร (แนะนำ 18K-20K)',
    minTarget: 18000,
    maxTarget: 30000,
    accentClass: 'text-pink-500',
  },
  khui: {
    id: 'khui',
    label: 'Khui AI',
    description: 'Structured Prompt — สูงสุด 3 ตัวละครเสริม',
    minTarget: 0,
    maxTarget: 8000,
    accentClass: 'text-amber-500',
  },
} as const;

export const DEFAULT_SUB_CHARACTER: SubCharacter = {
  id: 'sub-1',
  name: '',
  gender: '',
  age: '',
  personality: '',
  relationship: '',
  mainRole: '',
  appearWhen: '',
  shortDesc: '',
  systemPrompt: '',
  isSelected: true,
};

export const DEFAULT_LOCATION: LocationItem = {
  id: 'loc-1',
  name: '',
  prompt: '',
};

export const DEFAULT_CHARACTER: ThaiMasterCharacter = {
  nickname: '',
  fullName: '',
  age: '',
  gender: '',
  status: '',
  birthdate: '',
  weightHeight: '',
  mbti: '',
  sexualOrientation: '',
  car: '',
  perfume: '',
  address: '',
  wealthStatus: '',
  occupation: '',
  fashionStyle: '',
  appearanceDesc: '',
  visualFeatures: '',
  visualTags: [],
  nsfwMaleSize: '',
  nsfwFemaleChest: '',
  nsfwFemaleVagina: '',
  coreTraits: '',
  personalityTags: [],
  likes: [],
  dislikes: [],
  generalBehaviors: '',
  userExclusiveBehaviors: '',
  coreBelief: '',
  mindset: '',
  perception: '',
  expression: '',
  behaviorUnderEmotion: '',
  emotionalTriggers: '',
  flawsWeaknesses: '',
  userStoryRole: '',
  initialRelationship: '',
  relationshipBackstory: '',
  userAttitude: '',
  absoluteAntiBehaviors: '',
  hiddenSoftSide: '',
  darkSide: '',
  systemRules: [],
  sexualStyle: '',
  kinksPreferences: '',
  aftercareStyle: '',
  dailyRoutine: '',
  toneSetting: '',
  locations: [],
  supportingCharacters: [],
  subCharRules: 'แย่งซีนตัวหลัก, เปลี่ยนบุคลิกกะทันหัน, รู้ข้อมูลที่ตัวหลักยังไม่รู้, ตายหรือหายแล้วกลับมามีบท',
  subCharAllowed: 'อยู่ในบทสนทนาหลักได้, ทำให้เนื้อเรื่องดำเนินเมื่อถึงจุดตัน',
  garageStorage: '',
  shortIntro: '',
  punchline: '',
  plotSummary: '',
  publicInfo: '',
  categoryTags: [],
  momentIntro: '',
  openGreetingNarrative: '',
  openGreetingDialogue: '',
  fullGreeting: '',
  flagType: 'none',
};