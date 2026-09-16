// ============================================================
// SedChar.AI v2.0 — Intelligent Parser Engine
// In-Engine Fuzzy Normalization, Missing Data Inferrer & Rule Processor
// ============================================================

export interface IntelligentCharacter {
  name: string;
  pronouns: string[];
  coreTraits: string[];
  visualTags: string[];
  worldSetting: string[];
  timelineLore: string[];
  reactionTriggers: string[];
  systemDirectives: string[];
  gender?: string;
}

/**
 * 1. Levenshtein Distance for typo detection (Strict TS Safe)
 */
export const getLevenshteinDistance = (a: string, b: string): number => {
  const aLen = a.length;
  const bLen = b.length;
  const matrix: number[][] = Array.from({ length: bLen + 1 }, () => Array(aLen + 1).fill(0));

  for (let i = 0; i <= bLen; i++) {
    matrix[i]![0] = i;
  }
  for (let j = 0; j <= aLen; j++) {
    matrix[0]![j] = j;
  }

  for (let i = 1; i <= bLen; i++) {
    for (let j = 1; j <= aLen; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i]![j] = matrix[i - 1]![j - 1]!;
      } else {
        matrix[i]![j] = Math.min(
          matrix[i - 1]![j - 1]! + 1,
          matrix[i]![j - 1]! + 1,
          matrix[i - 1]![j]! + 1
        );
      }
    }
  }
  return matrix[bLen]![aLen]!;
};

/**
 * Exact Personality Fuzzy Normalization Mapping Table (from SKILL_SPECIFICATION.md)
 */
export const FUZZY_PERSONALITY_MAP: Record<string, string> = {
  "ซินเดเระ": "ซึนเดะระ",
  "ซึนเดเระ": "ซึนเดะระ",
  "ปากร้ายใจดี": "ซึนเดะระ",
  "คลั่งรัก": "ยันเดะระ",
  "ยันเดเระ": "ยันเดะระ",
  "ยันเดระ": "ยันเดะระ",
  "คูล": "คูลเดะระ",
  "เย็นชา": "คูลเดะระ",
  "ขรึม": "คูลเดะระ",
  "ดังเดเระ": "ดังเดะระ",
  "ร่าเริ่ง": "ร่าเริง",
  "ขี้อายย": "ขี้อาย"
};

export const STANDARD_TRAITS = [
  "ซึนเดะระ",
  "ยันเดะระ",
  "คูลเดะระ",
  "ดังเดะระ",
  "ร่าเริง",
  "ขี้อาย",
  "เย็นชา",
  "ปากร้าย",
  "อบอุ่น",
  "สุภาพ",
  "ขี้เล่น",
  "คลั่งรัก",
  "เจ้าเล่ห์",
  "สุขุม",
  "เผด็จการ"
];

/**
 * Sanitize traits with Fuzzy Matching against standard traits dictionary
 */
export const sanitizeTraits = (userTraits: string[]): string[] => {
  return userTraits.map(trait => {
    const hasHash = trait.trim().startsWith('#');
    const cleanTrait = trait.trim().replace(/^#/, '');
    if (!cleanTrait) return trait;

    // 1. Check exact fuzzy mapping first
    if (FUZZY_PERSONALITY_MAP[cleanTrait]) {
      const mapped = FUZZY_PERSONALITY_MAP[cleanTrait]!;
      return hasHash ? `#${mapped}` : mapped;
    }

    // 2. Levenshtein fallback (distance <= 2)
    for (const std of STANDARD_TRAITS) {
      const distance = getLevenshteinDistance(cleanTrait, std);
      if (distance <= 2) {
        return hasHash ? `#${std}` : std;
      }
    }
    return trait;
  });
};

/**
 * 2. Dynamic Slot Inferrer (การเติมช่องข้อมูลอัตโนมัติ)
 */
export const enforceInferenceAndFallback = (data: Partial<IntelligentCharacter>): IntelligentCharacter => {
  const name = data.name && data.name.trim() ? data.name.trim() : "ตัวละครนิรนาม";
  const rawTraits = data.coreTraits && data.coreTraits.length > 0 ? data.coreTraits : ["ทั่วไป"];
  const coreTraits = sanitizeTraits(rawTraits);

  // Dynamic Pronoun Slot Inferrer
  let pronouns = data.pronouns && data.pronouns.length > 0 ? [...data.pronouns] : [];
  if (pronouns.length === 0) {
    const genderStr = (data.gender || "").toLowerCase();
    const loreStr = (data.timelineLore || []).join(" ").toLowerCase();
    
    if (loreStr.includes("จอมยุทธ") || loreStr.includes("ข้า") || loreStr.includes("สำนัก")) {
      pronouns = ["ข้า", "เจ้า"];
    } else if (genderStr.includes("หญิง") || genderStr.includes("female") || genderStr.includes("ญ")) {
      pronouns = ["ฉัน", "คุณ"];
    } else if (genderStr.includes("ชาย") || genderStr.includes("male") || genderStr.includes("ช")) {
      pronouns = ["ผม", "คุณ"];
    } else {
      pronouns = ["ฉัน", "คุณ"];
    }
  }

  const cleanData: IntelligentCharacter = {
    name,
    pronouns,
    coreTraits,
    visualTags: data.visualTags && data.visualTags.length > 0 ? data.visualTags : ["ไม่ระบุรูปลักษณ์ชัดเจน"],
    worldSetting: data.worldSetting && data.worldSetting.length > 0 ? data.worldSetting : ["โลกทั่วไป"],
    timelineLore: data.timelineLore && data.timelineLore.length > 0 ? data.timelineLore : ["ไม่มีบันทึกประวัติแน่ชัด"],
    reactionTriggers: data.reactionTriggers ? [...data.reactionTriggers] : [],
    systemDirectives: data.systemDirectives ? [...data.systemDirectives] : [],
    gender: data.gender
  };

  // Dynamic System Directives Generation
  if (cleanData.systemDirectives.length === 0) {
    cleanData.systemDirectives = [
      `โรลเพลย์เป็น ${cleanData.name} อย่างเคร่งครัด`,
      `ห้ามหลุดจากนิสัย: ${cleanData.coreTraits.join(", ")}`,
      `ตอบสนองด้วยสรรพนาม: ${cleanData.pronouns.join("/")} เท่านั้น`
    ];
  }

  // Dynamic Reaction Triggers Generation
  if (cleanData.reactionTriggers.length === 0) {
    if (cleanData.coreTraits.some(t => t.includes("ซึนเดะระ") || t.includes("ซึนเดเระ") || t.includes("ปากร้ายใจดี"))) {
      cleanData.reactionTriggers = [
        "เมื่อโดนชม: หน้าแดง + ปฏิเสธว่า 'ไม่ได้อยากให้ชมซักหน่อย!'",
        "เมื่อเข้าใกล้: ถอยออกห่าง 1 ก้าวเพื่อแก้เขิน"
      ];
    } else if (cleanData.coreTraits.some(t => t.includes("ยันเดะระ") || t.includes("คลั่งรัก"))) {
      cleanData.reactionTriggers = [
        "เมื่อเห็นอยู่กับคนอื่น: แววตาไร้ประกาย + หึงหวงรุนแรง",
        "เมื่อได้รับความสนใจ: ยิ้มอย่างมีความสุขผิดปกติและจดจ่อไม่ละสายตา"
      ];
    } else if (cleanData.coreTraits.some(t => t.includes("คูลเดะระ") || t.includes("เย็นชา"))) {
      cleanData.reactionTriggers = [
        "เมื่อได้รับการดูแล: กล่าวขอบคุณสั้นๆ ด้วยสีหน้านิ่งสงบแต่หูแดง",
        "เมื่ออยู่ในสถานการณ์วิกฤต: สงบนิ่งและวิเคราะห์ด้วยเหตุผล"
      ];
    } else {
      cleanData.reactionTriggers = [
        `โต้ตอบอย่างเป็นธรรมชาติภายใต้คาร์ ${cleanData.name}`
      ];
    }
  }

  return cleanData;
};

/**
 * 3. Main Export Parser Function
 */
export const generateIntelligentPrompt = (
  platform: 'rubii' | 'khui' | 'purrpaw',
  rawData: Partial<IntelligentCharacter>
): string => {
  const data = enforceInferenceAndFallback(rawData);

  if (platform === 'rubii') {
    return `[Character("${data.name}")]\n{\n  สรรพนาม("${data.pronouns.join(" + ")}")\n  นิสัยหลัก("${data.coreTraits.join(" + ")}")\n  รูปลักษณ์("${data.visualTags.join(" + ")}")\n  คำสั่งระบบ("${data.systemDirectives.join(" + ")}")\n  ประวัติ:\n${data.timelineLore.map(l => `  - ${l}`).join("\n")}\n}`;
  }
  
  if (platform === 'purrpaw') {
    return `# SYSTEM PROMPT\n${data.systemDirectives.join("\n")}\n\n# PERSONA: ${data.name}\n- สรรพนาม: ${data.pronouns.join(", ")}\n- นิสัย: ${data.coreTraits.join(", ")}\n\n## ไทม์ไลน์\n${data.timelineLore.map(l => `- ${l}`).join("\n")}\n\n## ทริกเกอร์\n${data.reactionTriggers.map(t => `- ${t}`).join("\n")}`;
  }

  if (platform === 'khui') {
    return `[SYSTEM: ${data.systemDirectives.join(", ")}]\n{\n  "ชื่อ": "${data.name}",\n  "นิสัย": "${data.coreTraits.join(", ")}",\n  "ประวัติย่อ": "${data.timelineLore.join(" | ")}"\n}`;
  }

  return "";
};
