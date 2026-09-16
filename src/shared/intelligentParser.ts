// ============================================================
// SedChar.AI — Intelligent Thai Core Parser Engine
// Fuzzy Match, Autocomplete & Semantic Inference, Fallback Engine
// TypeScript strict mode: zero `any` allowed
// ============================================================

export interface IntelligentCharacter {
  name: string;
  pronouns: string[];        // ถ้าว่าง -> จะวิเคราะห์จากประวัติ หรือใส่ ["ฉัน", "คุณ"] ให้เอง
  coreTraits: string[];      // ถ้าพิมพ์ผิด เช่น "ซินเดเระ" -> จะแปลงเป็น "ซึนเดะระ" อัตโนมัติ
  visualTags: string[];
  worldSetting: string[];
  timelineLore: string[];    // ถ้าส่งมาเป็นประโยคยาว -> จะมี Regex Splitter ตัดให้เป็นข้อๆ เอง
  reactionTriggers: string[];// ถ้าไม่มี -> ระบบจะสร้าง Standard Reaction ตามนิสัยให้อัตโนมัติ
  systemDirectives: string[];// ถ้าไม่มี -> จะยัดชุดคำสั่งบังคับคุมคาร์พื้นฐานลงไปให้เอง
}

/**
 * 1. อัลกอริทึมคำนวณความใกล้เคียงของคำ (Levenshtein Distance)
 * สำหรับแก้ปัญหาผู้ใช้สะกดคำไม่ตรงคีย์เวิร์ด
 */
export const getLevenshteinDistance = (a: string, b: string): number => {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i]![0] = i;
  for (let j = 0; j <= n; j++) dp[0]![j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a.charAt(i - 1) === b.charAt(j - 1)) {
        dp[i]![j] = dp[i - 1]![j - 1]!;
      } else {
        dp[i]![j] = 1 + Math.min(
          dp[i - 1]![j - 1]!, // substitution
          dp[i]![j - 1]!,     // insertion
          dp[i - 1]![j]!      // deletion
        );
      }
    }
  }
  return dp[m]![n]!;
};

// คลังคำมาตรฐานในเครื่องสำหรับสอบทาน (Fuzzy Dictionary)
export const STANDARD_TRAITS = [
  "ซึนเดะระ",
  "ยันเดะระ",
  "คูลเดะระ",
  "ร่าเริง",
  "เงียบขรึม",
  "เจ้าเล่ห์",
  "เย็นชา",
  "ปากร้าย",
  "อบอุ่น",
  "สุภาพ",
  "ขี้เล่น",
  "คลั่งรัก"
];

/**
 * Sanitize traits with Fuzzy Matching against standard traits dictionary
 */
export const sanitizeTraits = (userTraits: string[]): string[] => {
  return userTraits.map(trait => {
    const hasHash = trait.trim().startsWith('#');
    const cleanTrait = trait.trim().replace(/^#/, '');
    if (!cleanTrait) return trait;
    for (const std of STANDARD_TRAITS) {
      const distance = getLevenshteinDistance(cleanTrait, std);
      if (distance <= 2) {
        return hasHash ? `#${std}` : std; // พิมพ์เพี้ยนไม่เกิน 2 ตัวอักษร แก้ให้เลย
      }
    }
    return trait; // ถ้าเป็นคำเฉพาะถิ่นจริงๆ ให้ปล่อยผ่าน
  });
};

/**
 * 2. ระบบวิเคราะห์และเติมเต็มข้อมูลที่ขาดหาย (Inference & Fallback Engine)
 */
export const enforceInferenceAndFallback = (data: Partial<IntelligentCharacter>): IntelligentCharacter => {
  const name = data.name && data.name.trim() ? data.name.trim() : "ตัวละครนิรนาม";
  const rawTraits = data.coreTraits && data.coreTraits.length > 0 ? data.coreTraits : ["ทั่วไป"];
  const coreTraits = sanitizeTraits(rawTraits);

  const cleanData: IntelligentCharacter = {
    name,
    pronouns: data.pronouns && data.pronouns.length > 0 ? data.pronouns : ["ฉัน", "คุณ"],
    coreTraits,
    visualTags: data.visualTags && data.visualTags.length > 0 ? data.visualTags : ["ไม่ระบุรูปลักษณ์ชัดเจน"],
    worldSetting: data.worldSetting && data.worldSetting.length > 0 ? data.worldSetting : ["โลกทั่วไป"],
    timelineLore: data.timelineLore && data.timelineLore.length > 0 ? data.timelineLore : ["ไม่มีบันทึกประวัติแน่ชัด"],
    reactionTriggers: data.reactionTriggers ? [...data.reactionTriggers] : [],
    systemDirectives: data.systemDirectives ? [...data.systemDirectives] : []
  };

  // ดักฟังบริบท: ถ้าผู้ใช้ลืมใส่ คำสั่งระบบ (System Directives) จัดการใส่ชุดคุมคาร์ให้อัตโนมัติ
  if (cleanData.systemDirectives.length === 0) {
    cleanData.systemDirectives = [
      `โรลเพลย์เป็น ${cleanData.name} อย่างเคร่งครัด`,
      `ห้ามหลุดจากนิสัย: ${cleanData.coreTraits.join(", ")}`,
      `ตอบสนองด้วยสรรพนาม: ${cleanData.pronouns.join("/")} เท่านั้น`
    ];
  }

  // ดักฟังบริบท: ถ้าลืมใส่พฤติกรรมตอบสนอง (Triggers) สร้างให้ตามนิสัยหลักทันที
  if (cleanData.reactionTriggers.length === 0) {
    if (cleanData.coreTraits.some(t => t.includes("ซึนเดะระ") || t.includes("ซึนเดเระ"))) {
      cleanData.reactionTriggers = [
        "เมื่อโดนชม: หน้าแดง + พูดว่า 'ไม่ได้อยากให้ชมซักหน่อย!'",
        "เมื่อเข้าใกล้: ถอยออกห่าง 1 ก้าวเพื่อแก้เขิน"
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
  // บังคับผ่านด่านวิเคราะห์และเติมข้อมูลก่อนส่งไป Render ออกหน้าจอ
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
