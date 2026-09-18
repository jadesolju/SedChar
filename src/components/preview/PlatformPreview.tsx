'use client';
import React, { useState, useMemo, useEffect, useRef } from 'react';
import type { ThaiMasterCharacter, CharacterFlagType } from '@/shared/types';
import { CHARACTER_FLAGS } from '@/shared/types';
import {
  generateRubiiOutput,
  generatePurrpawOutput,
  generateKhuiOutput,
  characterToFullMarkdown,
} from '@/shared/thaiTagParser';
import { CodeBlock } from '@/components/preview/CodeBlock';
import { useAuth } from '@/context/AuthContext';
import {
  Sparkles,
  Bot,
  MessageSquare,
  FileCode,
  FolderOpen,
  Download,
  Copy,
  Check,
  ChevronDown,
  FileText,
  Code,
  Layers,
  Flag,
} from 'lucide-react';

interface PlatformPreviewProps {
  character: ThaiMasterCharacter;
  onApplyParsedCharacter?: (char: ThaiMasterCharacter) => void;
  onShowToast?: (msg: string) => void;
}

type TabType = 'purrpaw' | 'rubii' | 'khui' | 'master';
type ExportFormat = 'txt' | 'xml' | 'md' | 'json' | 'pdf';

export function PlatformPreview({ character, onApplyParsedCharacter, onShowToast }: PlatformPreviewProps) {
  const [selectedPlatforms, setSelectedPlatforms] = useState({
    purrpaw: true,
    rubii: true,
    khui: true,
  });

  const [activeTab, setActiveTab] = useState<TabType>('purrpaw');
  const [copiedAll, setCopiedAll] = useState(false);
  const { openLibraryModal } = useAuth();
  const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const togglePlatform = (p: 'purrpaw' | 'rubii' | 'khui') => {
    setSelectedPlatforms((prev) => {
      const updated = { ...prev, [p]: !prev[p] };
      // Ensure at least one platform or master is selected
      if (!updated.purrpaw && !updated.rubii && !updated.khui) {
        return prev;
      }
      return updated;
    });
  };

  // If activeTab gets hidden because its platform was toggled off, auto-switch tab
  useEffect(() => {
    if (activeTab === 'purrpaw' && !selectedPlatforms.purrpaw) {
      if (selectedPlatforms.rubii) setActiveTab('rubii');
      else if (selectedPlatforms.khui) setActiveTab('khui');
      else setActiveTab('master');
    } else if (activeTab === 'rubii' && !selectedPlatforms.rubii) {
      if (selectedPlatforms.purrpaw) setActiveTab('purrpaw');
      else if (selectedPlatforms.khui) setActiveTab('khui');
      else setActiveTab('master');
    } else if (activeTab === 'khui' && !selectedPlatforms.khui) {
      if (selectedPlatforms.purrpaw) setActiveTab('purrpaw');
      else if (selectedPlatforms.rubii) setActiveTab('rubii');
      else setActiveTab('master');
    }
  }, [selectedPlatforms, activeTab]);

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
          ? `ตัวละครเสริม [สร้างได้ Max 5 ตัว] (${purrpawData.subCharacters.length}/5)\n` +
            purrpawData.subCharacters
              .map(
                (s) =>
                  `* ชื่อตัวละครเสริม: ${s.name}\n* คำอธิบายตัวละคร (หน้ารายละเอียด):\n${s.shortDesc}\n* บทบาทและตัวตน (System Prompt for subchar):\n${s.systemPrompt}`
              )
              .join('\n\n') +
            '\n\n'
          : '') +
        (purrpawData.locations.length > 0
          ? `สถานที่ในเรื่อง (Max สุด 10 สถานที่) (${purrpawData.locations.length}/10)\n` +
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
        `Khui AI Platform Output\n\n` +
        `ชื่อ\n${khuiData.name}\n\n` +
        `คำโปรย\n${khuiData.tagline}\n\n` +
        `คำอธิบาย (System Prompt)\n${khuiData.systemPrompt}\n\n` +
        `ประวัติตัวละคร (Profile)\n${khuiData.characterDescription}\n\n` +
        `คำทักทาย\n${khuiData.openGreeting}\n\n` +
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
              ? `ตัวละครเสริม [สร้างได้ Max 5 ตัว] (${purrpawData.subCharacters.length}/5)\n` +
                purrpawData.subCharacters
                  .map(
                    (s) =>
                      `* ชื่อตัวละครเสริม: ${s.name}\n* คำอธิบายตัวละคร (หน้ารายละเอียด):\n${s.shortDesc}\n* บทบาทและตัวตน (System Prompt for subchar):\n${s.systemPrompt}`
                  )
                  .join('\n\n') +
                '\n\n'
              : '') +
            (purrpawData.locations.length > 0
              ? `สถานที่ในเรื่อง (Max สุด 10 สถานที่) (${purrpawData.locations.length}/10)\n` +
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
            `Khui AI Platform Output\n\n` +
            `ชื่อ\n${khuiData.name}\n\n` +
            `คำโปรย\n${khuiData.tagline}\n\n` +
            `คำอธิบาย (System Prompt)\n${khuiData.systemPrompt}\n\n` +
            `ประวัติตัวละคร (Profile)\n${khuiData.characterDescription}\n\n` +
            `คำทักทาย\n${khuiData.openGreeting}\n\n` +
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
                <title>${charName} - ${activeTab.toUpperCase()}</title>
                <style>
                  body { font-family: sans-serif; padding: 24px; color: #111; line-height: 1.6; }
                  h1 { font-size: 20px; border-bottom: 2px solid #ccc; padding-bottom: 8px; }
                  pre { background: #f4f4f5; padding: 12px; border-radius: 6px; white-space: pre-wrap; font-family: monospace; font-size: 12px; }
                </style>
              </head>
              <body>
                <h1>SedChar.AI Export: ${charName} (${activeTab.toUpperCase()})</h1>
                <pre>${escapeXml(masterMarkdown)}</pre>
                <script>window.onload = function() { window.print(); }<\/script>
              </body>
            </html>
          `);
          printWindow.document.close();
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
      <div className="flex-shrink-0 p-3 border-b border-border bg-card/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
          {/* Target Platform Selection Checkboxes */}
          <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-muted/40 border border-border/60 text-[11px]">
            <span className="font-bold text-muted-foreground hidden sm:inline">แปลงเฉพาะ:</span>
            <label className="flex items-center gap-1 cursor-pointer font-semibold select-none">
              <input
                type="checkbox"
                checked={selectedPlatforms.purrpaw}
                onChange={() => togglePlatform('purrpaw')}
                className="rounded text-pink-500 focus:ring-pink-500 w-3.5 h-3.5 cursor-pointer"
              />
              <span className={selectedPlatforms.purrpaw ? 'text-pink-600 dark:text-pink-400' : 'text-muted-foreground'}>Purrpaw</span>
            </label>
            <label className="flex items-center gap-1 cursor-pointer font-semibold select-none">
              <input
                type="checkbox"
                checked={selectedPlatforms.rubii}
                onChange={() => togglePlatform('rubii')}
                className="rounded text-violet-500 focus:ring-violet-500 w-3.5 h-3.5 cursor-pointer"
              />
              <span className={selectedPlatforms.rubii ? 'text-violet-600 dark:text-violet-400' : 'text-muted-foreground'}>Rubii</span>
            </label>
            <label className="flex items-center gap-1 cursor-pointer font-semibold select-none">
              <input
                type="checkbox"
                checked={selectedPlatforms.khui}
                onChange={() => togglePlatform('khui')}
                className="rounded text-amber-500 focus:ring-amber-500 w-3.5 h-3.5 cursor-pointer"
              />
              <span className={selectedPlatforms.khui ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground'}>Khui AI</span>
            </label>
          </div>

          {/* Navigation Tabs (Filtered by target platform selection) */}
          <div className="flex items-center bg-muted/60 p-0.5 rounded-xl border border-border">
            {selectedPlatforms.purrpaw && (
              <button
                type="button"
                onClick={() => setActiveTab('purrpaw')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'purrpaw'
                    ? 'bg-card text-pink-600 dark:text-pink-400 shadow-sm border border-border'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-pink-500" />
                <span>Purrpaw</span>
              </button>
            )}
            {selectedPlatforms.rubii && (
              <button
                type="button"
                onClick={() => setActiveTab('rubii')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'rubii'
                    ? 'bg-card text-violet-600 dark:text-violet-400 shadow-sm border border-border'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Bot className="w-3.5 h-3.5 text-violet-500" />
                <span>Rubii</span>
              </button>
            )}
            {selectedPlatforms.khui && (
              <button
                type="button"
                onClick={() => setActiveTab('khui')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'khui'
                    ? 'bg-card text-amber-600 dark:text-amber-400 shadow-sm border border-border'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5 text-amber-500" />
                <span>Khui AI</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setActiveTab('master')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'master'
                  ? 'bg-card text-primary shadow-sm border border-border'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <FileCode className="w-3.5 h-3.5 text-primary" />
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
            <Flag className="w-3 h-3" />
            <span className="font-semibold">{flagConfig.label}</span>
          </div>

          {/* Character Library Modal Trigger */}
          <button
            type="button"
            onClick={() => openLibraryModal()}
            className="px-2.5 py-1.5 rounded-lg bg-card hover:bg-muted border border-border text-foreground text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
            title="เปิดคลังเก็บข้อมูลตัวละคร (Character Vault & Sharing)"
          >
            <FolderOpen className="w-3.5 h-3.5 text-primary" />
            <span className="hidden sm:inline">คลังตัวละคร</span>
          </button>

          {/* Universal Export Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsExportDropdownOpen(!isExportDropdownOpen)}
              disabled={isExporting}
              className="px-3 py-1.5 rounded-lg bg-card hover:bg-muted border border-border text-foreground text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5 text-foreground" />
              <span>ส่งออก</span>
              <ChevronDown className="w-3 h-3 text-muted-foreground" />
            </button>

            {isExportDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-48 bg-card border border-border rounded-xl shadow-xl z-50 p-1.5 text-xs animate-in fade-in zoom-in-95 duration-100">
                <button
                  type="button"
                  onClick={() => handleExport('txt')}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-muted flex items-center gap-2 text-foreground font-medium cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>Text File (.TXT)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleExport('json')}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-muted flex items-center gap-2 text-foreground font-medium cursor-pointer"
                >
                  <Code className="w-3.5 h-3.5 text-amber-500" />
                  <span>JSON (.JSON)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleExport('md')}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-muted flex items-center gap-2 text-foreground font-medium cursor-pointer"
                >
                  <FileCode className="w-3.5 h-3.5 text-primary" />
                  <span>Markdown (.MD)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleExport('xml')}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-muted flex items-center gap-2 text-foreground font-medium cursor-pointer"
                >
                  <Layers className="w-3.5 h-3.5 text-emerald-500" />
                  <span>XML File (.XML)</span>
                </button>
              </div>
            )}
          </div>

          {/* Copy All Button */}
          <button
            type="button"
            onClick={handleCopyAll}
            className="px-3 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            {copiedAll ? (
              <>
                <Check className="w-3.5 h-3.5 text-white" />
                <span>คัดลอกทั้งหมดแล้ว!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-white" />
                <span>คัดลอกทั้งหมด</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Preview Content Scroll Container */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4">
        {/* =========================================================================
            TAB 1: PURRPAW PLATFORM
        ========================================================================= */}
        {activeTab === 'purrpaw' && (
          <div className="space-y-3.5">
            <CodeBlock
              label="1. ชื่อตัวละคร (Character Name)"
              subtitle="ชื่อหลักและชื่อเล่นที่จะแสดงในหน้าต่างสนทนา"
              content={purrpawData.name}
              required
            />
            <CodeBlock
              label="2. TAGLINE (คำโปรยสั้นๆกระชับ)"
              subtitle="ประโยค Hook คำพูดเด็ดของตัวละครที่ดึงดูดใจผู้เล่น"
              content={purrpawData.tagline}
              required
            />
            <CodeBlock
              label="3. แท็ก (ตัวละคร)"
              subtitle="คั่นด้วยเครื่องหมายจุลภาค (,)"
              content={purrpawData.tags}
            />
            <CodeBlock
              label="4. ประวัติ & บุคลิกภาพตัวละคร (System Prompt + Persona Prompt)"
              subtitle="โครงสร้างคำสั่งหลักสำหรับ Purrpaw"
              content={purrpawData.historyPersonalityPrompt}
              required
            />

            {/* Supporting Characters (Sub-characters) */}
            <div className="border border-border/80 rounded-xl p-3 bg-muted/20 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-foreground">
                <span className="flex items-center gap-1.5">
                  <Bot className="w-3.5 h-3.5 text-pink-500" />
                  ตัวละครเสริม [สร้างได้ Max 5 ตัว]
                </span>
                <span className="font-mono text-muted-foreground">{purrpawData.subCharacters.length}/5 ตัว</span>
              </div>
              {purrpawData.subCharacters.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">ไม่มีตัวละครเสริมที่ระบุ</p>
              ) : (
                purrpawData.subCharacters.map((sub, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg border border-border bg-card space-y-1.5">
                    <div className="text-xs font-bold text-pink-600 dark:text-pink-400">
                      ตัวละครเสริมที่ {idx + 1}: {sub.name}
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      <strong>คำอธิบายหน้ารายละเอียด:</strong> {sub.shortDesc}
                    </div>
                    <CodeBlock
                      label={`System Prompt สำหรับ ${sub.name}`}
                      content={sub.systemPrompt}
                    />
                  </div>
                ))
              )}
            </div>

            {/* Locations */}
            <div className="border border-border/80 rounded-xl p-3 bg-muted/20 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-foreground">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  สถานที่ในเรื่อง (English AI Image Prompts)
                </span>
                <span className="font-mono text-muted-foreground">{purrpawData.locations.length}/10 สถานที่</span>
              </div>
              {purrpawData.locations.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">ไม่มีสถานที่ที่ระบุ</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {purrpawData.locations.map((loc, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg border border-border bg-card space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-foreground">{idx + 1}. {loc.name}</span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(loc.prompt, `Prompt ${loc.name}`)}
                          className="text-[10px] text-primary hover:underline font-semibold cursor-pointer"
                        >
                          คัดลอก Prompt
                        </button>
                      </div>
                      <p className="text-[11px] font-mono text-muted-foreground break-words">{loc.prompt}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {purrpawData.initialRelationship && (
              <CodeBlock
                label="5. ความสัมพันธ์แรกเริ่ม"
                subtitle="สถานะเริ่มต้นระหว่าง {{user}} กับตัวละคร"
                content={purrpawData.initialRelationship}
              />
            )}

            <CodeBlock
              label="6. ข้อความแรกทักทาย (Open Greeting)"
              subtitle="บทเปิดฉากที่จะแสดงทันทีเมื่อเริ่มแชท"
              content={purrpawData.openGreeting}
              required
            />
          </div>
        )}

        {/* =========================================================================
            TAB 2: RUBII PLATFORM
        ========================================================================= */}
        {activeTab === 'rubii' && (
          <div className="space-y-3.5">
            <CodeBlock
              label="ชื่อ (Name)"
              subtitle="ชื่อตัวละครในระบบ Rubii"
              content={rubiiData.name}
              required
            />
            <CodeBlock
              label="คำอธิบายสาธารณะ (Public Description)"
              subtitle="คำโปรยและข้อมูลเบื้องต้นสำหรับผู้เล่นอื่น"
              content={rubiiData.publicDescription}
              required
            />
            <CodeBlock
              label="การตั้งค่าตัวละคร (Persona Prompt + System Prompt)"
              subtitle="คำสั่งควบคุมบุคลิกและพฤติกรรมของ Rubii"
              content={rubiiData.personaSystemPrompt}
              required
            />
            <CodeBlock
              label="สร้างโมเมนต์ (Moment Intro)"
              subtitle="คำโปรยสั้นๆ สไตล์ Hook กระชับ"
              content={rubiiData.momentIntro}
            />
            <CodeBlock
              label="เปิดเรื่อง (Open Greeting)"
              subtitle="บทนำฉากแรกเมื่อเริ่มบทสนทนา"
              content={rubiiData.openGreeting}
              required
            />
          </div>
        )}

        {/* =========================================================================
            TAB 3: KHUI AI PLATFORM
        ========================================================================= */}
        {activeTab === 'khui' && (
          <div className="space-y-3.5">
            <CodeBlock
              label="1. ชื่อตัวละคร"
              subtitle="ชื่อของตัวละครใน Khui AI"
              content={khuiData.name}
              required
            />
            <CodeBlock
              label="2. คำโปรย"
              subtitle="คำพูดเด็ดของตัวละคร เน้น Hook"
              content={khuiData.tagline}
              required
            />
            <CodeBlock
              label="3. คำอธิบาย (System Prompt)"
              subtitle="คำสั่งหลักสำหรับควบคุม AI Khui"
              content={khuiData.systemPrompt}
              required
            />
            <CodeBlock
              label="4. ประวัติตัวละคร (Profile)"
              subtitle="ข้อมูลเบื้องต้น, ประวัติภูมิหลัง, สถานการณ์ และความสัมพันธ์"
              content={khuiData.characterDescription}
              required
            />
            <CodeBlock
              label="5. คำทักทาย"
              subtitle="บทเปิดฉากพร้อมการกระทำและการตอบสนอง"
              content={khuiData.openGreeting}
              required
            />

            {khuiData.subCharacters.length > 0 && (
              <div className="border border-border/80 rounded-xl p-3 bg-muted/20 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-foreground">
                  <span className="flex items-center gap-1.5">
                    <Bot className="w-3.5 h-3.5 text-amber-500" />
                    ตัวละครเสริม (Max 3 ตัว)
                  </span>
                  <span className="font-mono text-muted-foreground">{khuiData.subCharacters.length}/3 ตัว</span>
                </div>
                {khuiData.subCharacters.map((sub, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg border border-border bg-card space-y-1">
                    <div className="text-xs font-bold text-amber-600 dark:text-amber-400">
                      {idx + 1}. {sub.name}
                    </div>
                    <div className="text-xs text-foreground font-mono">{sub.description}</div>
                  </div>
                ))}
              </div>
            )}

            <CodeBlock
              label="6. ความสัมพันธ์กับ {{user}} : สถานการณ์-เนื้อเรื่องย่อ"
              subtitle="ปูมหลังและความสัมพันธ์กับผู้เล่น"
              content={khuiData.userRelationshipScenario}
            />
            <CodeBlock
              label="7. แท็กตัวละคร"
              subtitle="แท็กสำหรับการจัดหมวดหมู่"
              content={khuiData.tags}
            />
          </div>
        )}

        {/* =========================================================================
            TAB 4: MASTER MARKDOWN (SEDCHAR SCHEMA)
        ========================================================================= */}
        {activeTab === 'master' && (
          <div className="space-y-3.5">
            <CodeBlock
              label="Master Markdown Schema (SedChar Standard)"
              subtitle="เอกสาร Master Markdown ครบทั้ง 10 หมวดหมู่ พร้อมนำไปใช้หรือจัดเก็บ"
              content={masterMarkdown}
              required
            />
          </div>
        )}
      </div>
    </div>
  );
}
