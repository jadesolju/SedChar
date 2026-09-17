'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import type { ThaiMasterCharacter, CharacterFlagType } from '@/shared/types';
import { CHARACTER_FLAGS } from '@/shared/types';
import {
  generateRubiiOutput,
  generatePurrpawOutput,
  generateKhuiOutput,
  formatCount,
  characterToFullMarkdown,
} from '@/shared/thaiTagParser';
import { CodeBlock } from '@/components/preview/CodeBlock';
import { CharacterLibraryModal } from '@/components/library/CharacterLibraryModal';
import { useAuth } from '@/context/AuthContext';

interface PlatformPreviewProps {
  character: ThaiMasterCharacter;
  onApplyParsedCharacter?: (char: ThaiMasterCharacter) => void;
  onShowToast?: (msg: string) => void;
}

type TabType = 'purrpaw' | 'rubii' | 'khui' | 'master';
type ExportFormat = 'txt' | 'xml' | 'md' | 'json' | 'pdf';

export function PlatformPreview({ character, onApplyParsedCharacter, onShowToast }: PlatformPreviewProps) {
  const [activeTab, setActiveTab] = useState<TabType>('purrpaw');
  const [copiedAll, setCopiedAll] = useState(false);
  const { openLibraryModal } = useAuth();
  const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const rubiiData = useMemo(() => generateRubiiOutput(character), [character]);
  const purrpawData = useMemo(() => generatePurrpawOutput(character), [character]);
  const khuiData = useMemo(() => generateKhuiOutput(character), [character]);
  const masterMarkdown = useMemo(() => characterToFullMarkdown(character), [character]);

  const flagConfig = CHARACTER_FLAGS[character.flagType] || CHARACTER_FLAGS['none'];

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsExportDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      if (onShowToast) {
        onShowToast(`คัดลอก ${label} เรียบร้อยแล้ว!`);
      }
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      if (onShowToast) {
        onShowToast(`คัดลอก ${label} เรียบร้อยแล้ว!`);
      }
    }
  };

  const handleCopyAll = async () => {
    let textToCopy = '';
    if (activeTab === 'purrpaw') {
      textToCopy =
        `- ชื่อตัวละคร\n${purrpawData.name}\n\n` +
        `- TAGLINE (คำโปรยสั้นๆกระชับ)\n${purrpawData.tagline}\n\n` +
        `- แท็ก (ตัวละคร)\n${purrpawData.tags}\n\n` +
        `- ประวัติ & บุคลิกภาพตัวละคร (System Prompt + Persona Prompt)\n${purrpawData.historyPersonalityPrompt}\n\n` +
        (purrpawData.subCharacters.length > 0
          ? `👥 - ตัวละครเสริม [สร้างได้ Max 5 ตัว] (${purrpawData.subCharacters.length}/5)\n` +
            purrpawData.subCharacters
              .map(
                (s, i) =>
                  `* ชื่อตัวละครเสริม: ${s.name}\n* คำอธิบายตัวละคร (หน้ารายละเอียด):\n${s.shortDesc}\n* บทบาทและตัวตน (System Prompt for subchar):\n${s.systemPrompt}`
              )
              .join('\n\n') +
            '\n\n'
          : '') +
        (purrpawData.locations.length > 0
          ? `📍 - สถานที่ในเรื่อง (Max สุด 10 สถานที่) (${purrpawData.locations.length}/10)\n` +
            purrpawData.locations.map(l => `* ${l.name}\nPrompt: ${l.prompt}`).join('\n') +
            '\n\n'
          : '') +
        (purrpawData.initialRelationship ? `- ความสัมพันธ์แรกเริ่ม\n${purrpawData.initialRelationship}\n\n` : '') +
        `- ข้อความแรกทักทาย (Open Greeting)\n${purrpawData.openGreeting}`;
    } else if (activeTab === 'rubii') {
      textToCopy =
        `ชื่อ (Name)\n${rubiiData.name}\n\n` +
        `คำอธิบายสาธารณะ (Public Description)\n${rubiiData.publicDescription}\n\n` +
        `การตั้งค่าตัวละคร (Persona Prompt + System Prompt)\n${rubiiData.personaSystemPrompt}\n\n` +
        `สร้างโมเมนต์ (Moment Intro)\n${rubiiData.momentIntro}\n\n` +
        `เปิดเรื่อง (Open Greeting)\n${rubiiData.openGreeting}`;
    } else if (activeTab === 'khui') {
      textToCopy =
        `💬 Khui AI Platform Output\n\n` +
        `ชื่อ\n${khuiData.name}\n\n` +
        `คำโปรย\n${khuiData.tagline}\n\n` +
        `System / Prompt\n${khuiData.systemPrompt}\n\n` +
        `หน้าคำอธิบายตัวละคร\n${khuiData.characterDescription}\n\n` +
        `Open Greeting\n${khuiData.openGreeting}\n\n` +
        (khuiData.subCharacters.length > 0
          ? `ตัวละครเสริม (Max 3 ตัว) — ${khuiData.subCharacters.length}/3\n` +
            khuiData.subCharacters.map(s => `${s.name}— ${s.description}`).join('\n\n') +
            '\n\n'
          : '') +
        `ความสัมพันธ์กับ {{user}} : สถานการณ์-เนื้อเรื่องย่อ\n${khuiData.userRelationshipScenario}\n\n` +
        `แท็กตัวละคร\n${khuiData.tags}`;
    } else {
      textToCopy = masterMarkdown;
    }

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopiedAll(true);
      if (onShowToast) onShowToast(`คัดลอกทั้งหมดสำหรับแท็บ ${activeTab.toUpperCase()} สำเร็จ!`);
      setTimeout(() => setCopiedAll(false), 2000);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = textToCopy;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopiedAll(true);
      if (onShowToast) onShowToast(`คัดลอกทั้งหมดสำหรับแท็บ ${activeTab.toUpperCase()} สำเร็จ!`);
      setTimeout(() => setCopiedAll(false), 2000);
    }
  };

  const handleExport = async (format: ExportFormat) => {
    setIsExportDropdownOpen(false);
    setIsExporting(true);
    const charName = (character.fullName || character.nickname || 'character').replace(/\s+/g, '_');
    const filename = `${charName}_${activeTab}_${Date.now()}`;

    try {
      if (format === 'json') {
        let exportObj: any = {};
        if (activeTab === 'purrpaw') exportObj = { platform: 'purrpaw', ...purrpawData, rawCharacter: character };
        else if (activeTab === 'rubii') exportObj = { platform: 'rubii', ...rubiiData, rawCharacter: character };
        else if (activeTab === 'khui') exportObj = { platform: 'khui', ...khuiData, rawCharacter: character };
        else exportObj = character;

        const blob = new Blob([JSON.stringify(exportObj, null, 2)], { type: 'application/json;charset=utf-8' });
        downloadBlob(blob, `${filename}.json`);
      } else if (format === 'xml') {
        const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<character platform="${activeTab}">
  <name>${escapeXml(character.fullName || character.nickname)}</name>
  <nickname>${escapeXml(character.nickname)}</nickname>
  <age>${escapeXml(character.age)}</age>
  <gender>${escapeXml(character.gender)}</gender>
  <mbti>${escapeXml(character.mbti)}</mbti>
  <shortIntro>${escapeXml(character.shortIntro)}</shortIntro>
  <greeting>${escapeXml(character.fullGreeting || character.openGreetingNarrative)}</greeting>
  <rawMarkdown><![CDATA[${masterMarkdown}]]></rawMarkdown>
</character>`;
        const blob = new Blob([xmlContent], { type: 'application/xml;charset=utf-8' });
        downloadBlob(blob, `${filename}.xml`);
      } else if (format === 'md') {
        const blob = new Blob([masterMarkdown], { type: 'text/markdown;charset=utf-8' });
        downloadBlob(blob, `${filename}.md`);
      } else if (format === 'txt') {
        let textToExport = '';
        if (activeTab === 'purrpaw') {
          textToExport =
            `- ชื่อตัวละคร\n${purrpawData.name}\n\n` +
            `- TAGLINE (คำโปรยสั้นๆกระชับ)\n${purrpawData.tagline}\n\n` +
            `- แท็ก (ตัวละคร)\n${purrpawData.tags}\n\n` +
            `- ประวัติ & บุคลิกภาพตัวละคร (System Prompt + Persona Prompt)\n${purrpawData.historyPersonalityPrompt}\n\n` +
            (purrpawData.subCharacters.length > 0
              ? `👥 - ตัวละครเสริม [สร้างได้ Max 5 ตัว] (${purrpawData.subCharacters.length}/5)\n` +
                purrpawData.subCharacters
                  .map(
                    (s, i) =>
                      `* ชื่อตัวละครเสริม: ${s.name}\n* คำอธิบายตัวละคร (หน้ารายละเอียด):\n${s.shortDesc}\n* บทบาทและตัวตน (System Prompt for subchar):\n${s.systemPrompt}`
                  )
                  .join('\n\n') +
                '\n\n'
              : '') +
            (purrpawData.locations.length > 0
              ? `📍 - สถานที่ในเรื่อง (Max สุด 10 สถานที่) (${purrpawData.locations.length}/10)\n` +
                purrpawData.locations.map(l => `* ${l.name}\nPrompt: ${l.prompt}`).join('\n') +
                '\n\n'
              : '') +
            (purrpawData.initialRelationship ? `- ความสัมพันธ์แรกเริ่ม\n${purrpawData.initialRelationship}\n\n` : '') +
            `- ข้อความแรกทักทาย (Open Greeting)\n${purrpawData.openGreeting}`;
        } else if (activeTab === 'rubii') {
          textToExport =
            `ชื่อ (Name)\n${rubiiData.name}\n\n` +
            `คำอธิบายสาธารณะ (Public Description)\n${rubiiData.publicDescription}\n\n` +
            `การตั้งค่าตัวละคร (Persona Prompt + System Prompt)\n${rubiiData.personaSystemPrompt}\n\n` +
            `สร้างโมเมนต์ (Moment Intro)\n${rubiiData.momentIntro}\n\n` +
            `เปิดเรื่อง (Open Greeting)\n${rubiiData.openGreeting}`;
        } else if (activeTab === 'khui') {
          textToExport =
            `💬 Khui AI Platform Output\n\n` +
            `ชื่อ\n${khuiData.name}\n\n` +
            `คำโปรย\n${khuiData.tagline}\n\n` +
            `System / Prompt\n${khuiData.systemPrompt}\n\n` +
            `หน้าคำอธิบายตัวละคร\n${khuiData.characterDescription}\n\n` +
            `Open Greeting\n${khuiData.openGreeting}\n\n` +
            (khuiData.subCharacters.length > 0
              ? `ตัวละครเสริม (Max 3 ตัว) — ${khuiData.subCharacters.length}/3\n` +
                khuiData.subCharacters.map(s => `${s.name}— ${s.description}`).join('\n\n') +
                '\n\n'
              : '') +
            `ความสัมพันธ์กับ {{user}} : สถานการณ์-เนื้อเรื่องย่อ\n${khuiData.userRelationshipScenario}\n\n` +
            `แท็กตัวละคร\n${khuiData.tags}`;
        } else {
          textToExport = masterMarkdown;
        }

        const blob = new Blob([textToExport], { type: 'text/plain;charset=utf-8' });
        downloadBlob(blob, `${filename}.txt`);
      } else if (format === 'pdf') {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(`
            <html>
              <head>
                <title>${escapeXml(character.fullName || character.nickname || 'Character')} - SedChar Export</title>
                <style>
                  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; padding: 28px; color: #111; }
                  h1 { color: #4f46e5; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px; font-size: 20px; }
                  h2 { color: #374151; font-size: 15px; margin-top: 20px; }
                  pre { background: #f3f4f6; padding: 14px; border-radius: 8px; font-size: 12px; white-space: pre-wrap; font-family: monospace; }
                </style>
              </head>
              <body>
                <h1>${escapeXml(character.fullName || character.nickname || 'Character')} — [Platform: ${activeTab.toUpperCase()}]</h1>
                <pre>${escapeXml(masterMarkdown)}</pre>
              </body>
            </html>
          `);
          printWindow.document.close();
          printWindow.focus();
          setTimeout(() => {
            printWindow.print();
            printWindow.close();
          }, 400);
        }
      }

      if (onShowToast) onShowToast(`ส่งออกไฟล์ .${format.toUpperCase()} สำเร็จ!`);
    } catch (err: any) {
      if (onShowToast) onShowToast(`เกิดข้อผิดพลาดในการบันทึก: ${err.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  const downloadBlob = (blob: Blob, name: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const escapeXml = (str: string = '') => {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-background">
      {/* Top Header Bar */}
      <div className="flex-shrink-0 p-3.5 border-b border-border bg-card/60 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {/* Navigation Tabs */}
          <div className="flex items-center bg-muted/60 p-0.5 rounded-xl border border-border">
            <button
              type="button"
              onClick={() => setActiveTab('purrpaw')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'purrpaw'
                  ? 'bg-card text-pink-600 dark:text-pink-400 shadow-sm border border-border'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <span>🐱</span>
              <span>Purrpaw</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('rubii')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'rubii'
                  ? 'bg-card text-violet-600 dark:text-violet-400 shadow-sm border border-border'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <span>🟣</span>
              <span>Rubii</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('khui')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'khui'
                  ? 'bg-card text-amber-600 dark:text-amber-400 shadow-sm border border-border'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <span>💬</span>
              <span>Khui AI</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('master')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'master'
                  ? 'bg-card text-primary shadow-sm border border-border'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <span>📑</span>
              <span>Master MD</span>
            </button>
          </div>
        </div>

        {/* Action Buttons: Flag, Library, Export Dropdown, Copy All */}
        <div className="flex items-center gap-2">
          {/* Flag Indicator */}
          <div
            className={`px-2.5 py-1 rounded-lg text-xs font-medium border flex items-center gap-1.5 ${flagConfig.badgeBg}`}
            title={flagConfig.description}
          >
            <span>{flagConfig.emoji}</span>
            <span className="font-semibold">{flagConfig.label}</span>
          </div>

          {/* Character Library Modal Trigger */}
          <button
            type="button"
            onClick={() => openLibraryModal()}
            className="px-2.5 py-1.5 rounded-lg bg-card hover:bg-muted border border-border text-foreground text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
            title="เปิดคลังเก็บข้อมูลตัวละคร (Character Vault & Sharing)"
          >
            <span>📚</span>
            <span className="hidden sm:inline">คลังตัวละคร</span>
          </button>

          {/* Unified Export Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsExportDropdownOpen(prev => !prev)}
              disabled={isExporting}
              className="px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
              title="เลือกประเภทบันทึก / ส่งออกไฟล์"
            >
              <span>💾</span>
              <span>บันทึกไฟล์</span>
              <span className="text-[10px] opacity-70">▼</span>
            </button>

            {isExportDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-48 rounded-xl bg-card border border-border shadow-xl z-50 py-1 text-xs animate-in fade-in slide-in-from-top-1 duration-150">
                <div className="px-3 py-1.5 text-[10px] font-semibold text-muted-foreground border-b border-border uppercase tracking-wider">
                  เลือกประเภทบันทึก ({activeTab.toUpperCase()})
                </div>
                <button
                  type="button"
                  onClick={() => handleExport('txt')}
                  className="w-full text-left px-3 py-2 hover:bg-muted/60 flex items-center justify-between transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <span>📄</span>
                    <span className="font-medium text-foreground">TXT (ข้อความล้วน)</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">.txt</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleExport('md')}
                  className="w-full text-left px-3 py-2 hover:bg-muted/60 flex items-center justify-between transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <span>📑</span>
                    <span className="font-medium text-foreground">MD (Markdown)</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">.md</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleExport('json')}
                  className="w-full text-left px-3 py-2 hover:bg-muted/60 flex items-center justify-between transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <span>📦</span>
                    <span className="font-medium text-foreground">JSON (โครงสร้างดิบ)</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">.json</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleExport('xml')}
                  className="w-full text-left px-3 py-2 hover:bg-muted/60 flex items-center justify-between transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <span>🏷️</span>
                    <span className="font-medium text-foreground">XML Data</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">.xml</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleExport('pdf')}
                  className="w-full text-left px-3 py-2 hover:bg-muted/60 flex items-center justify-between transition-colors cursor-pointer border-t border-border"
                >
                  <div className="flex items-center gap-2">
                    <span>🖨️</span>
                    <span className="font-medium text-foreground">PDF / สั่งพิมพ์</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">.pdf</span>
                </button>
              </div>
            )}
          </div>

          {/* Copy All Button */}
          <button
            type="button"
            onClick={handleCopyAll}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm ${
              copiedAll
                ? 'bg-emerald-600 text-white'
                : 'bg-gradient-to-r from-pink-600 to-violet-600 text-white hover:opacity-90'
            }`}
          >
            <span>{copiedAll ? '✓' : '📋'}</span>
            <span>{copiedAll ? 'คัดลอกทั้งหมดแล้ว!' : 'คัดลอกทั้งหมด'}</span>
          </button>
        </div>
      </div>

      {/* Main Preview Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* ================= PURRPAW TAB ================= */}
        {activeTab === 'purrpaw' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* - ชื่อตัวละคร */}
            <CodeBlock label="- ชื่อตัวละคร *" content={purrpawData.name} />

            {/* - TAGLINE (คำโปรยสั้นๆกระชับ) */}
            <CodeBlock label="- TAGLINE (คำโปรยสั้นๆกระชับ)" content={purrpawData.tagline} />

            {/* - แท็ก (ตัวละคร) */}
            <CodeBlock label="- แท็ก (ตัวละคร)" content={purrpawData.tags} />

            {/* - ประวัติ & บุคลิกภาพตัวละคร (System Prompt + Persona Prompt) */}
            <CodeBlock
              label="- ประวัติ & บุคลิกภาพตัวละคร (System Prompt + Persona Prompt) *"
              subtitle="(ประวัติ, ลักษณะภายนอก, NSFW, จิตวิทยา 7 มิติ, Logic เด็ดขาด, ความสัมพันธ์)"
              content={purrpawData.historyPersonalityPrompt}
              countLabel={`${formatCount(purrpawData.charCount)} ตัวอักษร / 30,000`}
            />

            {/* 👥 - ตัวละครเสริม [สร้างได้ Max 5 ตัว] */}
            {purrpawData.subCharacters.length > 0 && (
              <div className="space-y-3 pt-2">
                <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <span>👥</span>
                  <span>- ตัวละครเสริม [สร้างได้ Max 5 ตัว] ({purrpawData.subCharacters.length}/5)</span>
                </div>
                <div className="space-y-3">
                  {purrpawData.subCharacters.map((sub, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl border border-border bg-card/60 space-y-2.5">
                      <CodeBlock label={`* ชื่อตัวละครเสริม: ${sub.name}`} content={sub.name} />
                      <CodeBlock
                        label="* คำอธิบายตัวละคร (หน้ารายละเอียด):"
                        content={sub.shortDesc}
                        countLabel={`${sub.shortDesc.length}/500`}
                      />
                      <CodeBlock
                        label="* บทบาทและตัวตน (System Prompt for subchar):"
                        content={sub.systemPrompt}
                        countLabel={`${sub.systemPrompt.length}/750`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 📍 - สถานที่ในเรื่อง (Max สุด 10 สถานที่) */}
            {purrpawData.locations.length > 0 && (
              <div className="space-y-3 pt-2">
                <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <span>📍</span>
                  <span>- สถานที่ในเรื่อง (Max สุด 10 สถานที่) ({purrpawData.locations.length}/10)</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {purrpawData.locations.map((loc, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl border border-border bg-card/60 space-y-2">
                      <CodeBlock label={`* ${loc.name}`} content={loc.name} />
                      <CodeBlock label={`Prompt: ${loc.prompt}`} content={loc.prompt} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* - ความสัมพันธ์แรกเริ่ม */}
            {purrpawData.initialRelationship && (
              <CodeBlock label="- ความสัมพันธ์แรกเริ่ม" content={purrpawData.initialRelationship} />
            )}

            {/* - ข้อความแรกทักทาย (Open Greeting) */}
            <CodeBlock
              label="- ข้อความแรกทักทาย (Open Greeting) *"
              content={purrpawData.openGreeting}
              countLabel={`${formatCount(purrpawData.openGreeting.length)} ตัวอักษร`}
            />
          </div>
        )}

        {/* ================= RUBII TAB ================= */}
        {activeTab === 'rubii' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* ชื่อ (Name) */}
            <CodeBlock label="ชื่อ (Name) *" content={rubiiData.name} />

            {/* คำอธิบายสาธารณะ (Public Description) */}
            <CodeBlock label="คำอธิบายสาธารณะ (Public Description)" content={rubiiData.publicDescription} />

            {/* การตั้งค่าตัวละคร (Persona Prompt + System Prompt) */}
            <CodeBlock
              label="การตั้งค่าตัวละคร (Persona Prompt + System Prompt) *"
              subtitle="(Profile, Appearance, Core Psychology, Boundaries, NSFW & System Constraints)"
              content={rubiiData.personaSystemPrompt}
              countLabel={`≈ ${rubiiData.tokenEstimate} Tokens`}
            />

            {/* สร้างโมเมนต์ (Moment Intro) */}
            <CodeBlock
              label="สร้างโมเมนต์ (Moment Intro) *"
              subtitle="(คำโปรยสั้นๆ)"
              content={rubiiData.momentIntro}
              countLabel={`${rubiiData.momentIntro.length} ตัวอักษร / 100`}
            />

            {/* เปิดเรื่อง (Open Greeting) */}
            <CodeBlock
              label="เปิดเรื่อง (Open Greeting) *"
              subtitle="(บรรยาย Sensory/Vivid สลับบทพูดตาม Expression)"
              content={rubiiData.openGreeting}
              countLabel={`${rubiiData.openGreeting.length} ตัวอักษร`}
            />
          </div>
        )}

        {/* ================= KHUI AI TAB ================= */}
        {activeTab === 'khui' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-base">💬</span>
                <div>
                  <h3 className="text-xs font-bold text-amber-600 dark:text-amber-400">Khui AI Platform Output</h3>
                  <p className="text-[11px] text-muted-foreground">รูปแบบสำหรับ Khui AI (รองรับตัวละครเสริมสูงสุด 3 ตัว)</p>
                </div>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 font-mono font-bold">
                {formatCount(khuiData.charCount)} ตัวอักษร
              </span>
            </div>

            <CodeBlock label="ชื่อ" content={khuiData.name} />
            <CodeBlock label="คำโปรย" content={khuiData.tagline} />
            <CodeBlock label="System / Prompt" content={khuiData.systemPrompt} />
            <CodeBlock label="หน้าคำอธิบายตัวละคร" content={khuiData.characterDescription} />
            <CodeBlock label="Open Greeting" content={khuiData.openGreeting} />

            {khuiData.subCharacters.length > 0 && (
              <div className="space-y-2 pt-1">
                <div className="text-xs font-bold text-foreground">
                  ตัวละครเสริม (Max 3 ตัว) — {khuiData.subCharacters.length}/3
                </div>
                <div className="space-y-2">
                  {khuiData.subCharacters.map((sub, idx) => (
                    <CodeBlock key={idx} label={`${sub.name}— ${sub.description}`} content={`${sub.name}— ${sub.description}`} />
                  ))}
                </div>
              </div>
            )}

            <CodeBlock
              label="ความสัมพันธ์กับ {{user}} : สถานการณ์-เนื้อเรื่องย่อ"
              content={khuiData.userRelationshipScenario}
            />

            <CodeBlock label="แท็กตัวละคร" content={khuiData.tags} />
          </div>
        )}

        {/* ================= MASTER MD TAB ================= */}
        {activeTab === 'master' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <CodeBlock
              label="Master Markdown Specification (Full Archive)"
              content={masterMarkdown}
              countLabel={`${formatCount(masterMarkdown.length)} ตัวอักษร`}
            />
          </div>
        )}
      </div>

      {/* Character Vault & Library Modal */}
      <CharacterLibraryModal
        currentCharacter={character}
        onLoadCharacter={char => {
          if (onApplyParsedCharacter) {
            onApplyParsedCharacter(char);
          }
          if (onShowToast) {
            onShowToast(`โหลดตัวละคร ${char.fullName || char.nickname} จากคลังสำเร็จ!`);
          }
        }}
      />
    </div>
  );
}
