import { describe, it, expect } from 'vitest';
import {
  parseMarkdownToCharacter,
  characterToFullMarkdown,
  generateRubiiOutput,
  generatePurrpawOutput,
  generateKhuiOutput,
  generateEnglishLocationPrompt,
  autoDetectCharacterFlag,
  estimateTokens,
} from './thaiTagParser';
import { SAMPLE_CHARACTER } from './sampleCharacter';

describe('Universal Multi-Format Parser & Generator Engine', () => {
  it('1. should parse standard Markdown document back into structured character', () => {
    const markdown = characterToFullMarkdown(SAMPLE_CHARACTER);
    const parsed = parseMarkdownToCharacter(markdown);

    expect(parsed.nickname).toBe(SAMPLE_CHARACTER.nickname);
    expect(parsed.fullName).toBe(SAMPLE_CHARACTER.fullName);
    expect(parsed.age).toBe(SAMPLE_CHARACTER.age);
    expect(parsed.mbti).toBe(SAMPLE_CHARACTER.mbti);
    expect(parsed.visualTags.length).toBeGreaterThan(0);
    expect(parsed.supportingCharacters.length).toBe(SAMPLE_CHARACTER.supportingCharacters.length);
  });

  it('2. should parse JSON format input directly into structured character', () => {
    const jsonInput = JSON.stringify({
      name: "อลิซ สโนว์",
      nickname: "อลิซ",
      age: "19 ปี",
      gender: "หญิง",
      mbti: "INFP",
      status: "โสด",
      personality: "ขี้อาย ซึนเดเระ",
      likes: ["แมว", "ชาเขียว", "หนังสือ"],
      dislikes: ["แมลงสาบ", "คนโกหก"],
      greeting: "ฮึ! ใครใช้ให้นายมาทักฉันกันล่ะยะ..."
    });

    const parsed = parseMarkdownToCharacter(jsonInput);
    expect(parsed.fullName).toBe("อลิซ สโนว์");
    expect(parsed.nickname).toBe("อลิซ");
    expect(parsed.age).toBe("19 ปี");
    expect(parsed.gender).toBe("หญิง");
    expect(parsed.mbti).toBe("INFP");
    expect(parsed.likes).toContain("แมว");
    expect(parsed.dislikes).toContain("คนโกหก");
    expect(parsed.fullGreeting).toBe("ฮึ! ใครใช้ให้นายมาทักฉันกันล่ะยะ...");
  });

  it('3. should parse YAML / key-value format input into structured character', () => {
    const yamlInput = `name: คิน รัตนเดช
nickname: คิน
age: 26 ปี
gender: ชาย
mbti: INTJ
occupation: นักสืบเอกชน
status: โสด
coreTraits: สุขุม เย็นชา ปากร้ายแต่ใจดี
habits: แอบมองเวลาคนอื่นเผลอ
greeting: "มาหาฉัน... มีคดีอะไรให้ช่วยงั้นเหรอ?"`;

    const parsed = parseMarkdownToCharacter(yamlInput);
    expect(parsed.fullName).toBe("คิน รัตนเดช");
    expect(parsed.nickname).toBe("คิน");
    expect(parsed.age).toBe("26 ปี");
    expect(parsed.gender).toBe("ชาย");
    expect(parsed.mbti).toBe("INTJ");
    expect(parsed.occupation).toBe("นักสืบเอกชน");
    expect(parsed.fullGreeting).toBe("มาหาฉัน... มีคดีอะไรให้ช่วยงั้นเหรอ?");
  });

  it('4. should parse freeform unstructured plaintext into structured character', () => {
    const plainInput = `ชื่อเล่น: นาวิน
อายุ: 24 ปี
เพศ: ชาย
MBTI: ENTP
อาชีพ: สตรีมเมอร์
ที่อยู่: คอนโดย่านอารีย์
นิสัย: ร่าเริง ขี้เล่น แสนดี และให้เกียรติคนอื่น`;

    const parsed = parseMarkdownToCharacter(plainInput);
    expect(parsed.nickname).toBe("นาวิน");
    expect(parsed.age).toBe("24 ปี");
    expect(parsed.gender).toBe("ชาย");
    expect(parsed.mbti).toBe("ENTP");
    expect(parsed.occupation).toBe("สตรีมเมอร์");
  });

  it('5. should generate Rubii, Purrpaw, and Khui outputs accurately according to platform rules', () => {
    const rubii = generateRubiiOutput(SAMPLE_CHARACTER);
    expect(rubii.name).toBe(SAMPLE_CHARACTER.fullName);
    expect(rubii.personaSystemPrompt).toContain('ข้อมูลพื้นฐาน - Character Profile');
    expect(rubii.personaSystemPrompt).not.toContain(SAMPLE_CHARACTER.fullGreeting);

    const purrpaw = generatePurrpawOutput(SAMPLE_CHARACTER);
    expect(purrpaw.name).toBe(SAMPLE_CHARACTER.fullName);
    expect(purrpaw.historyPersonalityPrompt).toContain('ข้อมูลพื้นฐาน - Character Profile');
    expect(purrpaw.locations.length).toBeGreaterThan(0);
    // Purrpaw location prompt should be in English
    expect(purrpaw.locations[0]?.prompt).toMatch(/[a-zA-Z]/);

    const khui = generateKhuiOutput(SAMPLE_CHARACTER);
    expect(khui.name).toBe(SAMPLE_CHARACTER.fullName);
    expect(khui.systemPrompt).toContain('PROMPT PERSONA & BEHAVIOR RULES (KHUI AI)');
  });

  it('6. token estimator handles Thai and mixed text correctly', () => {
    const thaiText = 'สวัสดีครับ ยินดีที่ได้รู้จักตัวละครใหม่';
    const tokens = estimateTokens(thaiText);
    expect(tokens).toBeGreaterThan(5);
    expect(estimateTokens('')).toBe(0);
  });

  describe('7. generateEnglishLocationPrompt text transformations', () => {
    it('returns trimmed English description if already pure English (> 10 chars)', () => {
      const pureEn = 'luxurious futuristic cyber cafe with neon ambient lighting';
      expect(generateEnglishLocationPrompt('Cyber Cafe', `  ${pureEn}  `)).toBe(pureEn);
    });

    it('transforms University & Academic keywords correctly', () => {
      expect(generateEnglishLocationPrompt('ตึกคณะศิลปกรรม', 'ห้องเรียนในมหาวิทยาลัย')).toContain('university art faculty building interior');
      expect(generateEnglishLocationPrompt('Campus Studio', 'ห้องพักนักศึกษา')).toContain('university art faculty building interior');
    });

    it('transforms Bar, Club & Nightlife keywords correctly', () => {
      expect(generateEnglishLocationPrompt('บาร์ลับทองหล่อ', 'ค็อกเทลเลานจ์ยามค่ำคืน')).toContain('stylish upscale nightlife cocktail bar');
      expect(generateEnglishLocationPrompt('VIP Nightclub', 'สถานที่ปาร์ตี้กลางคืน')).toContain('stylish upscale nightlife cocktail bar');
    });

    it('transforms Condo, Penthouse & Luxury Bedroom keywords correctly', () => {
      expect(generateEnglishLocationPrompt('ห้องนอนเพนต์เฮาส์', 'คอนโดหรูชั้นสูง')).toContain('cinematic luxury high-rise condo master bedroom in Bangkok');
      expect(generateEnglishLocationPrompt('Luxury Apartment', 'ห้องนอนอารีย์')).toContain('cinematic luxury high-rise condo master bedroom in Bangkok');
    });

    it('transforms Safehouse & Warehouse keywords correctly', () => {
      expect(generateEnglishLocationPrompt('โกดังเซฟเฮาส์', 'ห้องลับริมน้ำ')).toContain('underground secret waterfront safehouse warehouse');
    });

    it('transforms Shooting Range & Tactical keywords correctly', () => {
      expect(generateEnglishLocationPrompt('สนามฝึกยิงปืน', 'คลังอาวุธ')).toContain('private underground tactical firing range');
    });

    it('transforms Hospital & Clinic keywords correctly', () => {
      expect(generateEnglishLocationPrompt('ห้องตรวจคลินิก', 'โรงพยาบาลเอกชน')).toContain('modern clean private hospital luxury suite interior');
    });

    it('transforms Mansion & House keywords correctly', () => {
      expect(generateEnglishLocationPrompt('คฤหาสน์หรู', 'บ้านพักวิลล่า')).toContain('luxurious contemporary private mansion interior');
    });

    it('transforms Beach & Resort keywords correctly', () => {
      expect(generateEnglishLocationPrompt('รีสอร์ทริมชายหาด', 'ทะเลเกาะส่วนตัว')).toContain('exclusive tropical beachfront luxury villa resort');
    });

    it('transforms Office & Workplace keywords correctly', () => {
      expect(generateEnglishLocationPrompt('ห้องทำงานผู้บริหาร', 'ออฟฟิศใจกลางเมือง')).toContain('luxurious modern executive office interior');
    });

    it('transforms Cafe & Coffee Shop keywords correctly', () => {
      expect(generateEnglishLocationPrompt('คาเฟ่สไตล์โมเดิร์น', 'ร้านกาแฟอบอุ่น')).toContain('aesthetic modern specialty coffee shop cafe interior');
    });

    it('transforms Garden & Nature keywords correctly', () => {
      expect(generateEnglishLocationPrompt('สวนเซนญี่ปุ่น', 'ธรรมชาติร่มรื่น')).toContain('serene lush Japanese botanical garden');
    });

    it('provides high-quality cinematic fallback for unmatched custom locations', () => {
      const result = generateEnglishLocationPrompt('หอสมุดเวทมนตร์โบราณ', 'แท่นบูชาศิลาลึกลับ');
      expect(result).toContain('cinematic interior of หอสมุดเวทมนตร์โบราณ');
      expect(result).toContain('photorealistic, 8k resolution');
    });

    it('handles empty inputs gracefully with fallback', () => {
      const result = generateEnglishLocationPrompt('', '');
      expect(result).toContain('cinematic interior of atmospheric setting');
    });
  });
});