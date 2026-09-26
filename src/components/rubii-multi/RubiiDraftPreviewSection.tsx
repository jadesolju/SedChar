'use client';
import React, { useState } from 'react';
import { FileText, Copy, Check, Sparkles, Download, Layers } from 'lucide-react';
import type { MultiCharacterProjectDraft } from '@/shared/multiCharTypes';

interface RubiiDraftPreviewSectionProps {
  project: MultiCharacterProjectDraft;
}

export function compileRubiiProjectMarkdown(p: MultiCharacterProjectDraft): string {
  let md = `# [RUBII MULTI-CHARACTER PROJECT DRAFT] - ${p.worldSetting.projectName || p.title}\n\n`;

  // 1. World Setting
  md += `## 1. World Setting & กฎของโลก\n`;
  if (p.worldSetting.genreTone) md += `- **แนวเรื่อง & โทน:** ${p.worldSetting.genreTone}\n`;
  if (p.worldSetting.eraTimePeriod) md += `- **ยุคสมัย / ช่วงเวลา:** ${p.worldSetting.eraTimePeriod}\n`;
  if (p.worldSetting.mainLocation) md += `- **สถานที่หลัก:** ${p.worldSetting.mainLocation}\n`;
  if (p.worldSetting.worldRulesOrMagicSystem) md += `- **กฎของโลก & ข้อจำกัด:** ${p.worldSetting.worldRulesOrMagicSystem}\n`;
  if (p.worldSetting.factionsOrOrganizations) md += `- **ฝ่าย / องค์กรสำคัญ:** ${p.worldSetting.factionsOrOrganizations}\n`;
  if (p.worldSetting.atmosphereTheme) md += `- **บรรยากาศโดยรวม:** ${p.worldSetting.atmosphereTheme}\n`;
  md += `\n`;

  // 2. Lore & Timeline
  md += `## 2. Lore & ไทม์ไลน์เหตุการณ์\n`;
  if (p.lore.worldBackstory) md += `### ภูมิหลังเรื่องก่อนเริ่ม:\n${p.lore.worldBackstory}\n\n`;
  if (p.lore.coreConflict) md += `### ความขัดแย้งหลัก:\n${p.lore.coreConflict}\n\n`;
  if (p.lore.timelineEvents.length > 0) {
    md += `### ลำดับไทม์ไลน์เหตุการณ์:\n`;
    p.lore.timelineEvents.forEach((ev, idx) => {
      md += `${idx + 1}. [${ev.timeLabel || 'ไม่ระบุช่วงเวลา'}] ${ev.eventTitle} ${ev.isSecret ? '(ความลับ)' : ''}\n   ${ev.description}\n`;
    });
    md += `\n`;
  }
  if (p.lore.commonKnowledge) md += `- **ความรู้สาธารณะ:** ${p.lore.commonKnowledge}\n`;
  if (p.lore.taboosOrMyths) md += `- **ข้อห้ามเด็ดขาด:** ${p.lore.taboosOrMyths}\n`;
  md += `\n`;

  // 3. Routes
  if (p.routes.length > 0) {
    md += `## 3. Route & เส้นทางเนื้อเรื่อง (${p.routes.length} เส้นทาง)\n\n`;
    p.routes.forEach((r, idx) => {
      md += `### Route ${idx + 1}: ${r.routeName}\n`;
      if (r.summary) md += `- **ภาพรวม:** ${r.summary}\n`;
      if (r.entryCondition) md += `- **เงื่อนไขเข้า:** ${r.entryCondition}\n`;
      if (r.exitOrBranchCondition) md += `- **เงื่อนไขแตกแขนง:** ${r.exitOrBranchCondition}\n`;
      if (r.possibleEndings) md += `- **ตอนจบที่เป็นไปได้:** ${r.possibleEndings}\n`;
      md += `\n`;
    });
  }

  // 4. Main Characters
  md += `## 4. ตัวละครหลัก (Main Cast - ${p.mainCharacters.length} ตัว)\n\n`;
  p.mainCharacters.forEach((c, idx) => {
    md += `### [ตัวละครหลัก ${idx + 1}]: ${c.name} ${c.aliasOrTitle ? `(${c.aliasOrTitle})` : ''}\n`;
    md += `- **เพศ / อายุ:** ${c.gender || '-'} | ${c.age || '-'} ${c.mbti ? `| MBTI: ${c.mbti}` : ''}\n`;
    if (c.storyRole) md += `- **บทบาทในเรื่อง:** ${c.storyRole}\n`;
    if (c.corePersonality) md += `- **แก่นบุคลิกภาพ:** ${c.corePersonality}\n`;
    if (c.primaryGoalOrDesire) md += `- **เป้าหมายหลัก:** ${c.primaryGoalOrDesire}\n`;
    if (c.relationshipWithUser) md += `- **ความสัมพันธ์กับ {{user}}:** ${c.relationshipWithUser}\n`;
    if (c.relationsWithOtherCast) md += `- **ความสัมพันธ์กับตัวละครอื่น:** ${c.relationsWithOtherCast}\n`;
    if (c.exclusiveSecretOrKnowledge) md += `- **ข้อมูลลับเฉพาะตัว:** ${c.exclusiveSecretOrKnowledge}\n`;
    if (c.absoluteRules) md += `- **กฎเหล็กที่จะไม่ทำเด็ดขาด:** ${c.absoluteRules}\n`;
    if (c.appearanceBrief) md += `- **รูปลักษณ์ภายนอก:** ${c.appearanceBrief}\n`;
    if (c.speakingStyle) md += `- **สไตล์การพูด:** ${c.speakingStyle}\n`;
    md += `\n`;
  });

  // 5. Supporting Characters (Unlimited)
  if (p.supportingCharacters.length > 0) {
    md += `## 5. ตัวละครเสริม (Supporting Characters - ${p.supportingCharacters.length} ตัว)\n\n`;
    p.supportingCharacters.forEach((s, idx) => {
      md += `[ตัวละครเสริม ${idx + 1}]: ${s.name} | เพศ: ${s.gender || '-'} | บทบาท: ${s.mainRole || '-'} | นิสัย: ${s.personality || '-'} | ปรากฏเมื่อ: ${s.appearWhen || '-'}\n`;
    });
    md += `\n`;
  }

  // 6. Cast Interaction Rules
  if (p.castInteractionRules) {
    md += `## 6. กติกาฉากรวม & Turn-Taking Logic\n${p.castInteractionRules}\n`;
  }

  return md.trim();
}

export function RubiiDraftPreviewSection({ project }: RubiiDraftPreviewSectionProps) {
  const [copied, setCopied] = useState(false);
  const markdownText = compileRubiiProjectMarkdown(project);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(markdownText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-400">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
              <span>6. Rubii Draft Project Preview & Export</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-500/15 text-pink-300 border border-pink-500/30">
                Draft Specification
              </span>
            </h2>
            <p className="text-xs text-muted-foreground">
              สรุปรวมโครงร่างโปรเจกต์ Rubii Multi-Char ทั้งหมดพร้อมสำหรับการส่งออกหรือคัดลอก
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white text-xs font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
          <span>{copied ? 'คัดลอกโครงร่างแล้ว!' : 'คัดลอก Master Draft'}</span>
        </button>
      </div>

      {/* Overview Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-xl bg-card border border-border flex flex-col">
          <span className="text-[10px] text-muted-foreground font-bold uppercase">ตัวละครหลัก (Free)</span>
          <span className="text-base font-bold text-rose-400 mt-0.5">{project.mainCharacters.length} / 10 ตัว</span>
        </div>

        <div className="p-3 rounded-xl bg-card border border-border flex flex-col">
          <span className="text-[10px] text-muted-foreground font-bold uppercase">ตัวละครเสริม (ไม่จำกัด)</span>
          <span className="text-base font-bold text-emerald-400 mt-0.5">{project.supportingCharacters.length} ตัว</span>
        </div>

        <div className="p-3 rounded-xl bg-card border border-border flex flex-col">
          <span className="text-[10px] text-muted-foreground font-bold uppercase">เส้นทางเนื้อเรื่อง (Routes)</span>
          <span className="text-base font-bold text-blue-400 mt-0.5">{project.routes.length} เส้นทาง</span>
        </div>

        <div className="p-3 rounded-xl bg-card border border-border flex flex-col">
          <span className="text-[10px] text-muted-foreground font-bold uppercase">ความยาวตัวอักษร</span>
          <span className="text-base font-bold text-purple-400 mt-0.5 font-mono">{markdownText.length.toLocaleString()} อักษร</span>
        </div>
      </div>

      {/* Code / Markdown View Area */}
      <div className="rounded-2xl border border-border bg-neutral-950 overflow-hidden shadow-2xl">
        <div className="px-4 py-2.5 bg-neutral-900/90 border-b border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
          <span className="font-mono text-[11px] font-semibold text-rose-300">rubii_multi_project_draft.md</span>
          <span className="text-[10px] text-neutral-500">Rubii Engine v1</span>
        </div>

        <div className="p-4 max-h-[550px] overflow-y-auto custom-scrollbar">
          <pre className="font-mono text-xs text-neutral-200 whitespace-pre-wrap leading-relaxed">
            {markdownText}
          </pre>
        </div>
      </div>
    </div>
  );
}
