// ============================================================
// SedChar.AI — Intelligent Core Robustness Test Suite
// ============================================================

import { describe, expect, test } from 'vitest';
import {
  generateIntelligentPrompt,
  getLevenshteinDistance,
  sanitizeTraits,
  enforceInferenceAndFallback,
} from './intelligentParser';

describe('SedChar.AI Intelligent Core Robustness Test', () => {
  test('พิมพ์คำว่า ซินเดเระ ผิด ระบบต้อง Fuzzy Match เปลี่ยนเป็น ซึนเดะระ ให้เอง', () => {
    const rawInput = {
      name: 'มิลค์',
      coreTraits: ['ซินเดเระ'], // พิมพ์ผิดสะกดด้วย สระอิ และ สระเอ
    };

    const output = generateIntelligentPrompt('rubii', rawInput);
    expect(output).toContain('นิสัยหลัก("ซึนเดะระ")'); // ต้องถูกตรวจสอบและแก้ไขให้ถูกโครงสร้าง
  });

  test('หากส่งข้อมูลมาว่างเปล่า (ข้อมูลขาด) ระบบต้องเติมค่า Default และชุดคำสั่งระบบให้สมบูรณ์ ไม่ปล่อยให้แหว่ง', () => {
    const emptyInput = { name: 'เทสเตอร์' }; // ข้อมูลอื่นหายหมด

    const output = generateIntelligentPrompt('purrpaw', emptyInput);

    // ตรวจสอบว่าระบบกู้ชีพใส่คำสั่งคุมคาร์ และสรรพนามทดแทนอัตโนมัติสำเร็จ
    expect(output).toContain('# SYSTEM PROMPT');
    expect(output).toContain('โรลเพลย์เป็น เทสเตอร์ อย่างเคร่งครัด');
    expect(output).toContain('- สรรพนาม: ฉัน, คุณ');
  });

  test('คำนวณ Levenshtein Distance ได้ถูกต้องสำหรับภาษาไทย', () => {
    expect(getLevenshteinDistance('ซินเดเระ', 'ซึนเดะระ')).toBeLessThanOrEqual(2);
    expect(getLevenshteinDistance('ยันเดเระ', 'ยันเดะระ')).toBeLessThanOrEqual(2);
    expect(getLevenshteinDistance('แมว', 'แมว')).toBe(0);
  });

  test('สร้างโครงสร้าง Khui AI พร้อม System Directives อัตโนมัติ', () => {
    const output = generateIntelligentPrompt('khui', { name: 'อากิระ' });
    expect(output).toContain('[SYSTEM:');
    expect(output).toContain('"ชื่อ": "อากิระ"');
  });
});
