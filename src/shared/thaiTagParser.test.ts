// ============================================================
// SedChar.AI v2.0 — Unit Test Suite
// ============================================================

import { describe, expect, test } from 'vitest';
import {
  parseMarkdownToCharacter,
  characterToFullMarkdown,
  generateRubiiOutput,
  generatePurrpawOutput,
  generateKhuiOutput,
  analyzeCharacterFlag,
  estimateTokens,
} from './thaiTagParser';
import { SAMPLE_CHARACTER } from './sampleCharacter';
import { DEFAULT_CHARACTER } from './types';

describe('SedChar.AI Parser & Generator Engine', () => {
  test('generates full markdown from sample character', () => {
    const md = characterToFullMarkdown(SAMPLE_CHARACTER);
    expect(md).toContain('คชา รัตนเวคิน');
    expect(md).toContain('ISTP');
    expect(md).toContain('ส่วนลับชาย');
    expect(md).toContain('1. Core Belief');
    expect(md).toContain('เรย์ (Ray)');
  });

  test('parses markdown back into structured character', () => {
    const rawTemplate = `
## **[ข้อมูลพื้นฐาน - Character Profile (General Info)]**
- **ชื่อเล่น**: คิง
- **ชื่อเต็ม**: คชา รัตนเวคิน
- **อายุ**: 28 ปี
- **เพศ**: ชาย
- **MBTI**: ISTP
- **อาชีพ**: นักธุรกิจ

## ลักษณะภายนอก (Appearance)
ชายหนุ่มรูปร่างสูงใหญ่สมส่วน กล้ามแน่น #หนุ่มหล่อ #ตาดุ

## [นิสัยและพฤติกรรม Psychology & Personality]
เย็นชา สุขุม ปากร้ายแต่ใจดี ซึนเดเระ #เย็นชา #ซึนเดะระ

### โครงสร้างจิตวิทยา:
* **1. Core Belief**: โลกนี้ไม่มีความยุติธรรม
* **2. Mindset**: คิดเป็นระบบ
`;
    const parsed = parseMarkdownToCharacter(rawTemplate);
    expect(parsed.nickname).toBe('คิง');
    expect(parsed.fullName).toBe('คชา รัตนเวคิน');
    expect(parsed.age).toBe('28 ปี');
    expect(parsed.gender).toBe('ชาย');
    expect(parsed.mbti).toBe('ISTP');
    expect(parsed.occupation).toBe('นักธุรกิจ');
    expect(parsed.coreBelief).toBe('โลกนี้ไม่มีความยุติธรรม');
    expect(parsed.visualTags).toContain('#หนุ่มหล่อ');
    expect(parsed.personalityTags).toContain('#ซึนเดะระ');
  });

  test('generates Rubii output with proper field splits', () => {
    const rubii = generateRubiiOutput(SAMPLE_CHARACTER);
    expect(rubii.name).toContain('คชา รัตนเวคิน');
    expect(rubii.momentIntro.length).toBeLessThanOrEqual(100);
    expect(rubii.personaSystemPrompt).toContain('ISTP');
    expect(rubii.openGreeting).toContain('เพนต์เฮาส์');
    expect(rubii.tokenEstimate).toBeGreaterThan(0);
  });

  test('generates Purrpaw output with subcharacters, locations and char count', () => {
    const purrpaw = generatePurrpawOutput(SAMPLE_CHARACTER);
    expect(purrpaw.name).toContain('คชา รัตนเวคิน');
    expect(purrpaw.tagline).toBeDefined();
    expect(purrpaw.subCharacters.length).toBeGreaterThanOrEqual(1);
    expect(purrpaw.subCharacters.length).toBeLessThanOrEqual(5);
    expect(purrpaw.locations.length).toBeGreaterThanOrEqual(1);
    expect(purrpaw.locations.length).toBeLessThanOrEqual(10);
    expect(purrpaw.historyPersonalityPrompt).toContain('ประวัติ & บุคลิกภาพตัวละคร');
    expect(purrpaw.charCount).toBeGreaterThan(500);
  });

  test('generates Khui AI output correctly', () => {
    const khui = generateKhuiOutput(SAMPLE_CHARACTER);
    expect(khui.name).toContain('คชา รัตนเวคิน');
    expect(khui.systemPrompt).toContain('Character:');
    expect(khui.subCharacters.length).toBeLessThanOrEqual(3);
    expect(khui.tags).toBeDefined();
  });

  test('analyzes relationship flag accurately', () => {
    const flag = analyzeCharacterFlag(SAMPLE_CHARACTER);
    expect(['reverse-watermelon', 'red', 'black']).toContain(flag);

    const greenChar = {
      ...DEFAULT_CHARACTER,
      coreTraits: 'อบอุ่น แสนดี ให้เกียรติ ปลอดภัย คอยซัพพอร์ต',
    };
    expect(analyzeCharacterFlag(greenChar)).toBe('green');

    const redChar = {
      ...DEFAULT_CHARACTER,
      coreTraits: 'บงการ ครอบงำ toxic ทำร้ายจิตใจ',
    };
    expect(analyzeCharacterFlag(redChar)).toBe('red');
  });

  test('token estimator handles Thai and mixed text', () => {
    const thaiText = 'สวัสดีครับ ยินดีที่ได้รู้จักตัวละครใหม่';
    const tokens = estimateTokens(thaiText);
    expect(tokens).toBeGreaterThan(5);
    expect(estimateTokens('')).toBe(0);
  });
});
