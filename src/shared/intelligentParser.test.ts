import { describe, it, expect } from 'vitest';
import {
  sanitizeTraits,
  enforceInferenceAndFallback,
  generateIntelligentPrompt,
} from './intelligentParser';

describe('Intelligent Parser & Dynamic Fuzzy Slot Inferrer (PR Specs)', () => {
  it('1. should perform exact fuzzy normalization for Thai bot archetypes', () => {
    const raw = ['ซินเดเระ', 'ซึนเดเระ', 'ปากร้ายใจดี', 'คลั่งรัก', 'ยันเดเระ', 'คูล', 'ขี้อายย'];
    const sanitized = sanitizeTraits(raw);
    
    expect(sanitized).toEqual([
      'ซึนเดะระ',
      'ซึนเดะระ',
      'ซึนเดะระ',
      'ยันเดะระ',
      'ยันเดะระ',
      'คูลเดะระ',
      'ขี้อาย'
    ]);
  });

  it('2. should preserve hashtag prefix when normalizing traits', () => {
    const raw = ['#ซินเดเระ', '#ยันเดเระ', '#ขี้อายย'];
    const sanitized = sanitizeTraits(raw);
    
    expect(sanitized).toEqual([
      '#ซึนเดะระ',
      '#ยันเดะระ',
      '#ขี้อาย'
    ]);
  });

  it('3. should auto-infer female pronouns when empty', () => {
    const output = enforceInferenceAndFallback({
      name: 'น้องเอ๋ย',
      gender: 'หญิง',
      coreTraits: ['ร่าเริง']
    });

    expect(output.pronouns).toEqual(['ฉัน', 'คุณ']);
  });

  it('4. should auto-infer male pronouns when empty', () => {
    const output = enforceInferenceAndFallback({
      name: 'คชา',
      gender: 'ชาย',
      coreTraits: ['สุขุม']
    });

    expect(output.pronouns).toEqual(['ผม', 'คุณ']);
  });

  it('5. should auto-infer ancient pronouns when setting contains martial arts / wuxia keywords', () => {
    const output = enforceInferenceAndFallback({
      name: 'หลี่ไป๋',
      timelineLore: ['ศิษย์เอกแห่งสำนักกระบี่สายฟ้า'],
      coreTraits: ['สุขุม']
    });

    expect(output.pronouns).toEqual(['ข้า', 'เจ้า']);
  });

  it('6. should auto-infer reaction triggers for Tsundere (ซึนเดะระ) characters', () => {
    const output = enforceInferenceAndFallback({
      name: 'เรนะ',
      coreTraits: ['ซึนเดเระ']
    });

    expect(output.coreTraits).toContain('ซึนเดะระ');
    expect(output.reactionTriggers.length).toBeGreaterThan(0);
    expect(output.reactionTriggers[0]).toContain('ไม่ได้อยากให้ชม');
  });

  it('7. should auto-infer reaction triggers for Yandere (ยันเดะระ) characters', () => {
    const output = enforceInferenceAndFallback({
      name: 'ยูกิ',
      coreTraits: ['ยันเดเระ']
    });

    expect(output.coreTraits).toContain('ยันเดะระ');
    expect(output.reactionTriggers[0]).toContain('แววตาไร้ประกาย');
  });

  it('8. should generate valid prompts across all platforms (Rubii, Purrpaw, Khui)', () => {
    const rubiiPrompt = generateIntelligentPrompt('rubii', {
      name: 'คิง',
      coreTraits: ['#ซินเดเระ', 'สุขุม']
    });
    expect(rubiiPrompt).toContain('[Character("คิง")]');
    expect(rubiiPrompt).toContain('ซึนเดะระ');

    const purrpawPrompt = generateIntelligentPrompt('purrpaw', {
      name: 'คิง',
      coreTraits: ['ซึนเดเระ']
    });
    expect(purrpawPrompt).toContain('# SYSTEM PROMPT');
    expect(purrpawPrompt).toContain('ซึนเดะระ');

    const khuiPrompt = generateIntelligentPrompt('khui', {
      name: 'คิง',
      coreTraits: ['สุขุม']
    });
    expect(khuiPrompt).toContain('[SYSTEM:');
  });
});
