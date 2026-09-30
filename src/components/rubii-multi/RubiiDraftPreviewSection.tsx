'use client';
import React, { useState, useRef } from 'react';
import {
  FileText,
  Copy,
  Check,
  Download,
  FileJson,
  Upload,
  ChevronDown,
  Sparkles,
  FileCode2,
  Maximize2,
  Minimize2,
  X,
  Edit3,
  Eye,
} from 'lucide-react';
import type {
  MultiCharacterProjectDraft,
  WorldSettingDraft,
  LoreDraft,
  RouteDraft,
  MainCharacterDraft,
  LoreTimelineItem,
} from '@/shared/multiCharTypes';
import {
  DEFAULT_MULTI_PROJECT_DRAFT,
  DEFAULT_WORLD_SETTING,
  DEFAULT_LORE_DRAFT,
} from '@/shared/multiCharTypes';
import type { SubCharacter } from '@/shared/types';
import { DEFAULT_SUB_CHARACTER } from '@/shared/types';

export interface RubiiDraftPreviewSectionProps {
  project: MultiCharacterProjectDraft;
  onImportJson?: (importedData: MultiCharacterProjectDraft) => void;
  showToast?: (msg: string) => void;
}

function extractKeyValue(text: string | undefined, keyPattern: string): string {
  if (!text) return '';
  const regex = new RegExp('(?:^|\\n)\\s*[-*]?\\s*\\*\\*(?:' + keyPattern + ')[:：]?\\*\\*\\s*(.*)', 'i');
  const match = text.match(regex);
  if (match && match[1]) {
    return match[1].trim();
  }
  const regexFallback = new RegExp('(?:^|\\n)\\s*[-*]?\\s*(?:' + keyPattern + ')[:：]\\s*(.*)', 'i');
  const matchFallback = text.match(regexFallback);
  return matchFallback && matchFallback[1] ? matchFallback[1].trim() : '';
}

/**
 * Parses Multi-Char Markdown or Plain Text draft into a structured MultiCharacterProjectDraft
 */
export function parseMultiCharMarkdownOrText(content: string): MultiCharacterProjectDraft {
  if (!content || !content.trim()) {
    return { ...DEFAULT_MULTI_PROJECT_DRAFT, id: 'proj_' + Math.random().toString(36).substring(2, 9) };
  }

  const cleanText = content.replace(/\r\n/g, '\n').trim();

  // Extract Project Title
  let title = 'โปรเจกต์ Multi-Char นำเข้า';
  const titleMatch = cleanText.match(/^#\s*(?:\[Multi-Char Project Draft\]:)?\s*(.*)/m);
  if (titleMatch && titleMatch[1]) {
    title = titleMatch[1].trim();
  }

  // Section Slicing by "## "
  const section1Match = cleanText.match(/##\s*1\.\s*World Setting[^\n]*\n([\s\S]*?)(?=(?:##\s*\d|\Z))/i);
  const section2Match = cleanText.match(/##\s*2\.\s*Lore[^\n]*\n([\s\S]*?)(?=(?:##\s*\d|\Z))/i);
  const section3Match = cleanText.match(/##\s*3\.\s*Route[^\n]*\n([\s\S]*?)(?=(?:##\s*\d|\Z))/i);
  const section4Match = cleanText.match(/##\s*4\.\s*(?:ตัวละครหลัก|Main Cast)[^\n]*\n([\s\S]*?)(?=(?:##\s*\d|\Z))/i);
  const section5Match = cleanText.match(/##\s*5\.\s*(?:ตัวละครเสริม|Supporting Characters)[^\n]*\n([\s\S]*?)(?=(?:##\s*\d|\Z))/i);
  const section6Match = cleanText.match(/##\s*6\.\s*(?:กติกาฉากรวม|Turn-Taking)[^\n]*\n([\s\S]*?)(?=(?:##\s*\d|\Z))/i);

  // If no standard markdown headers found, treat as loose plain text
  if (!section1Match && !section2Match && !section3Match && !section4Match && !section5Match && !section6Match) {
    const lines = cleanText.split('\n').filter((l) => l.trim().length > 0);
    const firstLine = lines[0] || 'โปรเจกต์ Plain Text';
    return {
      ...DEFAULT_MULTI_PROJECT_DRAFT,
      id: 'proj_' + Math.random().toString(36).substring(2, 9),
      title: firstLine.substring(0, 50),
      worldSetting: {
        ...DEFAULT_WORLD_SETTING,
        projectName: firstLine.substring(0, 50),
      },
      lore: {
        ...DEFAULT_LORE_DRAFT,
        worldBackstory: cleanText,
      },
      castInteractionRules: '',
      updatedAt: new Date().toISOString(),
    };
  }

  // 1. World Setting Parsing
  const sec1Text = section1Match && section1Match[1] ? section1Match[1] : '';
  const worldSetting: WorldSettingDraft = {
    projectName: title,
    genreTone: extractKeyValue(sec1Text, 'แนวเรื่อง & โทนหลัก|แนวเรื่อง|โทนหลัก|Genre'),
    eraTimePeriod: extractKeyValue(sec1Text, 'ยุคสมัย / เวลา|ยุคสมัย|เวลา|Era'),
    mainLocation: extractKeyValue(sec1Text, 'สถานที่หลัก|สถานที่|Location'),
    worldRulesOrMagicSystem: extractKeyValue(sec1Text, 'กฎของโลก / ระบบพลัง|กฎของโลก|ระบบพลัง|Magic System|World Rules'),
    factionsOrOrganizations: extractKeyValue(sec1Text, 'ฝ่าย / องค์กรสำคัญ|ฝ่าย|องค์กร|Factions'),
    atmosphereTheme: extractKeyValue(sec1Text, 'บรรยากาศโดยรวม|บรรยากาศ|Atmosphere|Theme'),
  };

  // 2. Lore & Timeline Parsing
  const sec2Text = section2Match && section2Match[1] ? section2Match[1] : '';
  const timelineEvents: LoreTimelineItem[] = [];
  
  // Extract timeline events
  const timelineBlockMatch = sec2Text.match(/###\s*ลำดับไทม์ไลน์เหตุการณ์:?([\s\S]*?)(?=(?:[-*]\s*\*\*|\n\n##|\Z))/i);
  if (timelineBlockMatch && timelineBlockMatch[1]) {
    const rawTimeline = timelineBlockMatch[1];
    const eventRegex = /(?:^|\n)\s*(\d+)\.\s*\[(.*?)\]\s*([^\n(]+)(?:\((ความลับ|Secret)\))?\s*\n\s*([^\n]+)/gi;
    let match: RegExpExecArray | null;
    while ((match = eventRegex.exec(rawTimeline)) !== null) {
      timelineEvents.push({
        id: 'ev_' + Math.random().toString(36).substring(2, 9),
        timeLabel: (match[2] || '').trim(),
        eventTitle: (match[3] || '').trim(),
        description: (match[5] || '').trim(),
        knownByCharacters: [],
        isSecret: Boolean(match[4]),
      });
    }
  }

  const lore: LoreDraft = {
    worldBackstory: extractKeyValue(sec2Text, 'ภูมิหลังของโลก|ภูมิหลัง|Backstory'),
    coreConflict: extractKeyValue(sec2Text, 'ความขัดแย้งหลัก|ความขัดแย้ง|Core Conflict'),
    timelineEvents,
    commonKnowledge: extractKeyValue(sec2Text, 'ความรู้สาธารณะ|Common Knowledge'),
    taboosOrMyths: extractKeyValue(sec2Text, 'ข้อห้ามเด็ดขาด|ข้อห้าม|Taboos'),
  };

  // 3. Routes Parsing
  const sec3Text = section3Match && section3Match[1] ? section3Match[1] : '';
  const routes: RouteDraft[] = [];
  if (sec3Text) {
    const routeChunks = sec3Text.split(/(?=###\s*Route\s*\d+:?)/i).filter((c) => c.trim().length > 0);
    for (const chunk of routeChunks) {
      const nameMatch = chunk.match(/###\s*Route\s*\d+:?\s*([^\n]+)/i);
      if (nameMatch && nameMatch[1]) {
        routes.push({
          id: 'rt_' + Math.random().toString(36).substring(2, 9),
          routeName: nameMatch[1].trim(),
          summary: extractKeyValue(chunk, 'ภาพรวม|Summary'),
          involvedCharacterIds: [],
          entryCondition: extractKeyValue(chunk, 'เงื่อนไขเข้า|Entry Condition'),
          exitOrBranchCondition: extractKeyValue(chunk, 'เงื่อนไขแตกแขนง|Branch Condition'),
          possibleEndings: extractKeyValue(chunk, 'ตอนจบที่เป็นไปได้|Possible Endings|Endings'),
          relationshipDynamics: '',
        });
      }
    }
  }

  // 4. Main Characters Parsing
  const sec4Text = section4Match && section4Match[1] ? section4Match[1] : '';
  const mainCharacters: MainCharacterDraft[] = [];
  if (sec4Text) {
    const charChunks = sec4Text.split(/(?=###\s*\[?ตัวละครหลัก\s*\d+\]?:?)/i).filter((c) => c.trim().length > 0);
    for (const chunk of charChunks) {
      const headerMatch = chunk.match(/###\s*\[?ตัวละครหลัก\s*\d+\]?:?\s*([^(\n]+)(?:\(([^)]+)\))?/i);
      if (headerMatch && headerMatch[1]) {
        const rawName = headerMatch[1].trim();
        const alias = headerMatch[2] ? headerMatch[2].trim() : '';

        const genderAgeLine = extractKeyValue(chunk, 'เพศ / อายุ|เพศ|อายุ|Gender / Age');
        let gender = '';
        let age = '';
        let mbti = '';
        if (genderAgeLine) {
          const parts = genderAgeLine.split('|').map((p) => p.trim());
          if (parts[0]) gender = parts[0];
          if (parts[1]) age = parts[1];
          if (parts[2]) {
            const mbtiMatch = parts[2].match(/MBTI:\s*([A-Za-z]+)/i);
            if (mbtiMatch && mbtiMatch[1]) mbti = mbtiMatch[1];
          }
        }

        mainCharacters.push({
          id: 'mc_' + Math.random().toString(36).substring(2, 9),
          name: rawName || 'ตัวละครหลัก',
          aliasOrTitle: alias,
          gender,
          age,
          mbti,
          flagType: 'none',
          storyRole: extractKeyValue(chunk, 'บทบาทในเรื่อง|บทบาท|Story Role'),
          corePersonality: extractKeyValue(chunk, 'แก่นบุคลิกภาพ|บุคลิกภาพ|Core Personality'),
          primaryGoalOrDesire: extractKeyValue(chunk, 'เป้าหมายหลัก|เป้าหมาย|Primary Goal'),
          relationshipWithUser: extractKeyValue(chunk, 'ความสัมพันธ์กับ \\{\\{user\\}\\}|ความสัมพันธ์กับผู้ใช้|Relationship with User'),
          relationsWithOtherCast: extractKeyValue(chunk, 'ความสัมพันธ์กับตัวละครอื่น|Relationship with Cast'),
          exclusiveSecretOrKnowledge: extractKeyValue(chunk, 'ข้อมูลลับเฉพาะตัว|ความลับ|Exclusive Secret'),
          absoluteRules: extractKeyValue(chunk, 'กฎเหล็กที่จะไม่ทำเด็ดขาด|กฎเหล็ก|Absolute Rules'),
          appearanceBrief: extractKeyValue(chunk, 'รูปลักษณ์ภายนอก|รูปลักษณ์|Appearance'),
          speakingStyle: extractKeyValue(chunk, 'สไตล์การพูด|Speaking Style'),
          nsfwBrief: '',
        });
      }
    }
  }

  // 5. Supporting Characters Parsing
  const sec5Text = section5Match && section5Match[1] ? section5Match[1] : '';
  const supportingCharacters: SubCharacter[] = [];
  if (sec5Text) {
    const lines = sec5Text.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      const subMatch = trimmed.match(/(?:\[ตัวละครเสริม\s*\d+\]:?|[-*])\s*([^|]+)\s*\|\s*เพศ:\s*([^|]+)\s*\|\s*บทบาท:\s*([^|]+)\s*\|\s*นิสัย:\s*([^|]+)\s*\|\s*ปรากฏเมื่อ:\s*(.+)/i);
      if (subMatch) {
        supportingCharacters.push({
          ...DEFAULT_SUB_CHARACTER,
          id: 'sc_' + Math.random().toString(36).substring(2, 9),
          name: (subMatch[1] || '').trim(),
          gender: (subMatch[2] || '').trim(),
          mainRole: (subMatch[3] || '').trim(),
          personality: (subMatch[4] || '').trim(),
          appearWhen: (subMatch[5] || '').trim(),
        });
      } else if (trimmed.includes('|')) {
        const parts = trimmed.split('|').map((s) => s.trim().replace(/^\[.*?\]:?/, ''));
        supportingCharacters.push({
          ...DEFAULT_SUB_CHARACTER,
          id: 'sc_' + Math.random().toString(36).substring(2, 9),
          name: parts[0] || 'ตัวละครเสริม',
          gender: parts[1] || '',
          mainRole: parts[2] || '',
          personality: parts[3] || '',
          appearWhen: parts[4] || '',
        });
      }
    }
  }

  // 6. Cast Interaction Rules Parsing
  const sec6Text = section6Match && section6Match[1] ? section6Match[1].trim() : '';

  return {
    id: 'proj_' + Math.random().toString(36).substring(2, 9),
    schemaVersion: 1,
    platform: 'rubii',
    title: worldSetting.projectName || title || 'โปรเจกต์ Multi-Char นำเข้า',
    status: 'draft',
    worldSetting,
    lore,
    routes: routes.length > 0 ? routes : DEFAULT_MULTI_PROJECT_DRAFT.routes,
    mainCharacters: mainCharacters.length > 0 ? mainCharacters : DEFAULT_MULTI_PROJECT_DRAFT.mainCharacters,
    supportingCharacters,
    castInteractionRules: sec6Text,
    updatedAt: new Date().toISOString(),
  };
}

export function compileRubiiProjectMarkdown(p: MultiCharacterProjectDraft): string {
  let md = `# [Multi-Char Project Draft]: ${p.worldSetting.projectName || p.title}\n\n`;

  // 1. World Setting
  md += `## 1. World Setting & กฎของโลก\n`;
  if (p.worldSetting.genreTone) md += `- **แนวเรื่อง & โทนหลัก:** ${p.worldSetting.genreTone}\n`;
  if (p.worldSetting.eraTimePeriod) md += `- **ยุคสมัย / เวลา:** ${p.worldSetting.eraTimePeriod}\n`;
  if (p.worldSetting.mainLocation) md += `- **สถานที่หลัก:** ${p.worldSetting.mainLocation}\n`;
  if (p.worldSetting.worldRulesOrMagicSystem) md += `- **กฎของโลก / ระบบพลัง:** ${p.worldSetting.worldRulesOrMagicSystem}\n`;
  if (p.worldSetting.factionsOrOrganizations) md += `- **ฝ่าย / องค์กรสำคัญ:** ${p.worldSetting.factionsOrOrganizations}\n`;
  if (p.worldSetting.atmosphereTheme) md += `- **บรรยากาศโดยรวม:** ${p.worldSetting.atmosphereTheme}\n`;
  md += `\n`;

  // 2. Lore & Timeline
  md += `## 2. Lore & ประวัติศาสตร์ของเรื่อง\n`;
  if (p.lore.worldBackstory) md += `- **ภูมิหลังของโลก:** ${p.lore.worldBackstory}\n`;
  if (p.lore.coreConflict) md += `- **ความขัดแย้งหลัก:** ${p.lore.coreConflict}\n`;
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

export function RubiiDraftPreviewSection({
  project,
  onImportJson,
  showToast = () => {},
}: RubiiDraftPreviewSectionProps) {
  const [copiedMd, setCopiedMd] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [customMarkdown, setCustomMarkdown] = useState<string | null>(null);
  const [currentImportAccept, setCurrentImportAccept] = useState<string>('.json,.md,.txt');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const compiledMarkdown = compileRubiiProjectMarkdown(project);
  const markdownText = customMarkdown !== null ? customMarkdown : compiledMarkdown;

  // Handle ESC key to close fullscreen
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  // Sync custom markdown when project updates
  React.useEffect(() => {
    setCustomMarkdown(null);
  }, [project]);
  const jsonText = JSON.stringify(project, null, 2);
  const baseFilename = (project.worldSetting.projectName || project.title || 'multi_char_project')
    .replace(/[\\/:*?"<>|]/g, '_')
    .trim() || 'multi_char_project';

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`ดาวน์โหลดไฟล์ ${filename} เรียบร้อย!`);
    setIsDownloadOpen(false);
  };

  const handleDownloadMd = () => {
    const blob = new Blob([markdownText], { type: 'text/markdown;charset=utf-8' });
    downloadBlob(blob, `${baseFilename}.md`);
  };

  const handleDownloadJson = () => {
    const blob = new Blob([jsonText], { type: 'application/json;charset=utf-8' });
    downloadBlob(blob, `${baseFilename}.json`);
  };

  const handleDownloadTxt = () => {
    const blob = new Blob([markdownText], { type: 'text/plain;charset=utf-8' });
    downloadBlob(blob, `${baseFilename}.txt`);
  };

  const handleCopyMd = async () => {
    try {
      await navigator.clipboard.writeText(markdownText);
      setCopiedMd(true);
      showToast('คัดลอก Master Markdown เรียบร้อย!');
      setTimeout(() => setCopiedMd(false), 2000);
    } catch {}
  };

  const handleCopyJson = async () => {
    try {
      await navigator.clipboard.writeText(jsonText);
      setCopiedJson(true);
      showToast('คัดลอก JSON Data เรียบร้อย!');
      setTimeout(() => setCopiedJson(false), 2000);
    } catch {}
  };

  const triggerImportPicker = (acceptType: string) => {
    setCurrentImportAccept(acceptType);
    setIsImportOpen(false);
    setTimeout(() => {
      fileInputRef.current?.click();
    }, 50);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isJsonFile = file.name.endsWith('.json') || file.type === 'application/json';
    const isMdFile = file.name.endsWith('.md') || file.name.endsWith('.markdown');
    const isTxtFile = file.name.endsWith('.txt');

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        if (!text || !text.trim()) {
          alert('ไฟล์ที่เลือกไม่มีข้อมูล');
          return;
        }

        if (isJsonFile || text.trim().startsWith('{')) {
          try {
            const parsed = JSON.parse(text);
            if (onImportJson) {
              onImportJson(parsed);
              showToast(`นำเข้าโปรเจกต์ JSON "${parsed.worldSetting?.projectName || parsed.title || 'Multi-Char'}" เรียบร้อย!`);
            }
            return;
          } catch (jsonErr: any) {
            if (isJsonFile) {
              alert('เกิดข้อผิดพลาดในการอ่านไฟล์ JSON: ' + (jsonErr.message || 'รูปแบบไม่ถูกต้อง'));
              return;
            }
          }
        }

        // Parse as Markdown / Plain Text
        const parsedProject = parseMultiCharMarkdownOrText(text);
        if (onImportJson) {
          onImportJson(parsedProject);
          const formatLabel = isMdFile ? 'Markdown (.md)' : isTxtFile ? 'Plain Text (.txt)' : 'ข้อความ';
          showToast(`นำเข้าข้อมูลจาก ${formatLabel} "${parsedProject.worldSetting?.projectName || parsedProject.title || 'Multi-Char'}" สำเร็จ!`);
        }
      } catch (err: any) {
        alert('เกิดข้อผิดพลาดในการนำเข้าไฟล์: ' + (err.message || 'ไม่สามารถแปลงข้อมูลได้'));
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Hidden File Input for Import */}
      <input
        ref={fileInputRef}
        type="file"
        accept={currentImportAccept}
        className="hidden"
        onChange={handleFileUpload}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-600 dark:text-pink-400 flex-shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-foreground flex flex-wrap items-center gap-1.5 sm:gap-2 leading-tight">
              <span>6. Master Draft Preview & Suite</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-500/10 text-pink-700 dark:text-pink-300 border border-pink-500/20 font-bold">
                Export & Import Suite
              </span>
            </h2>
            <p className="text-xs text-muted-foreground">
              นำเข้า, ส่งออก, ดาวน์โหลด หรือคัดลอกโครงร่างโปรเจกต์เป็นไฟล์ JSON, Markdown หรือ Plain Text
            </p>
          </div>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          {/* Import Dropdown */}
          {onImportJson && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsImportOpen(!isImportOpen)}
                className="px-3 py-2 rounded-xl border border-border bg-card hover:bg-muted text-foreground text-xs font-semibold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                title="นำเข้าไฟล์โปรเจกต์ (.json, .md, .txt)"
              >
                <Upload className="w-3.5 h-3.5 text-blue-500" />
                <span>นำเข้าไฟล์</span>
                <ChevronDown className="w-3 h-3 opacity-60" />
              </button>

              {isImportOpen && (
                <>
                  <div
                    className="fixed inset-0 z-20"
                    onClick={() => setIsImportOpen(false)}
                  />
                  <div className="absolute left-0 sm:right-0 sm:left-auto top-full mt-1.5 w-56 p-1.5 rounded-2xl bg-card border border-border shadow-2xl z-30 flex flex-col gap-1 animate-in fade-in zoom-in-95 duration-100">
                    <button
                      type="button"
                      onClick={() => triggerImportPicker('.json,application/json')}
                      className="p-2 rounded-xl hover:bg-muted text-foreground text-left text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer"
                    >
                      <FileJson className="w-4 h-4 text-amber-500 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="font-bold">JSON Data (.json)</div>
                        <div className="text-[10px] text-muted-foreground">นำเข้า Schema เต็มรูปแบบ 100%</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => triggerImportPicker('.md,.markdown,text/markdown')}
                      className="p-2 rounded-xl hover:bg-muted text-foreground text-left text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer"
                    >
                      <FileText className="w-4 h-4 text-blue-500 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="font-bold">Markdown (.md)</div>
                        <div className="text-[10px] text-muted-foreground">แปลงหัวข้อ Draft / Obsidian / Note</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => triggerImportPicker('.txt,text/plain')}
                      className="p-2 rounded-xl hover:bg-muted text-foreground text-left text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer"
                    >
                      <FileCode2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="font-bold">Plain Text (.txt)</div>
                        <div className="text-[10px] text-muted-foreground">ข้อความล้วนแปลงเข้าสตูดิโอ</div>
                      </div>
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Copy Markdown */}
          <button
            type="button"
            onClick={handleCopyMd}
            className="px-3 py-2 rounded-xl border border-border bg-card hover:bg-muted text-foreground text-xs font-semibold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            title="คัดลอก Master Markdown"
          >
            {copiedMd ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedMd ? 'คัดลอก MD แล้ว' : 'คัดลอก MD'}</span>
          </button>

          {/* Copy JSON */}
          <button
            type="button"
            onClick={handleCopyJson}
            className="px-3 py-2 rounded-xl border border-border bg-card hover:bg-muted text-foreground text-xs font-semibold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            title="คัดลอก JSON Schema Data"
          >
            {copiedJson ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <FileJson className="w-3.5 h-3.5 text-amber-500" />}
            <span>{copiedJson ? 'คัดลอก JSON แล้ว' : 'คัดลอก JSON'}</span>
          </button>

          {/* Download Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsDownloadOpen(!isDownloadOpen)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>ดาวน์โหลดไฟล์</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {isDownloadOpen && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setIsDownloadOpen(false)}
                />
                <div className="absolute right-0 top-full mt-1.5 w-52 p-1.5 rounded-2xl bg-card border border-border shadow-2xl z-30 flex flex-col gap-1 animate-in fade-in zoom-in-95 duration-100">
                  <button
                    type="button"
                    onClick={handleDownloadMd}
                    className="p-2 rounded-xl hover:bg-muted text-foreground text-left text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-blue-500" />
                    <div className="min-w-0 flex-1">
                      <div className="font-bold">Markdown (.md)</div>
                      <div className="text-[10px] text-muted-foreground">โครงร่างสมบูรณ์สำหรับ AI Bot</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadJson}
                    className="p-2 rounded-xl hover:bg-muted text-foreground text-left text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer"
                  >
                    <FileJson className="w-4 h-4 text-amber-500" />
                    <div className="min-w-0 flex-1">
                      <div className="font-bold">JSON Data (.json)</div>
                      <div className="text-[10px] text-muted-foreground">บันทึก Schema สำรอง/แชร์</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadTxt}
                    className="p-2 rounded-xl hover:bg-muted text-foreground text-left text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-emerald-500" />
                    <div className="min-w-0 flex-1">
                      <div className="font-bold">Plain Text (.txt)</div>
                      <div className="text-[10px] text-muted-foreground">ข้อความล้วนอ่านง่าย</div>
                    </div>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Overview Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-xl bg-card border border-border flex flex-col">
          <span className="text-[10px] text-muted-foreground font-bold uppercase">ตัวละครหลัก (Free)</span>
          <span className="text-base font-bold text-rose-600 dark:text-rose-400 mt-0.5">{project.mainCharacters.length} / 10 ตัว</span>
        </div>

        <div className="p-3 rounded-xl bg-card border border-border flex flex-col">
          <span className="text-[10px] text-muted-foreground font-bold uppercase">ตัวละครเสริม (ไม่จำกัด)</span>
          <span className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{project.supportingCharacters.length} ตัว</span>
        </div>

        <div className="p-3 rounded-xl bg-card border border-border flex flex-col">
          <span className="text-[10px] text-muted-foreground font-bold uppercase">เส้นทางเนื้อเรื่อง (Routes)</span>
          <span className="text-base font-bold text-blue-600 dark:text-blue-400 mt-0.5">{project.routes.length} เส้นทาง</span>
        </div>

        <div className="p-3 rounded-xl bg-card border border-border flex flex-col">
          <span className="text-[10px] text-muted-foreground font-bold uppercase">ความยาวตัวอักษร</span>
          <span className="text-base font-bold text-purple-600 dark:text-purple-400 mt-0.5 font-mono">{markdownText.length.toLocaleString()} อักษร</span>
        </div>
      </div>

      {/* Code / Markdown View Area */}
      <div className="rounded-2xl border border-border bg-neutral-950 overflow-hidden shadow-2xl">
        <div className="px-4 py-2.5 bg-neutral-900/90 border-b border-neutral-800 flex flex-wrap items-center justify-between gap-2 text-xs text-neutral-400">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] font-semibold text-rose-300">multi_character_project_draft.md</span>
            <span className="text-[10px] text-neutral-500 hidden sm:inline">Multi-Char Studio</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-neutral-800 text-neutral-300">
              {markdownText.length.toLocaleString('th-TH')} ตัวอักษร
            </span>

            {/* Fullscreen Expand Button */}
            <button
              type="button"
              onClick={() => setIsFullscreen(true)}
              title="ขยายดูแบบเต็มจอ (Fullscreen View)"
              className="p-1.5 rounded-lg border border-neutral-700 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-all cursor-pointer"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>

            {/* Edit / View Toggle */}
            <button
              type="button"
              onClick={() => setIsEditing(!isEditing)}
              title={isEditing ? 'สลับไปโหมดดูตัวอย่าง' : 'แก้ไขข้อความในช่องนี้โดยตรง'}
              className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                isEditing
                  ? 'bg-rose-600 text-white font-bold'
                  : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700'
              }`}
            >
              {isEditing ? (
                <>
                  <Eye className="w-3.5 h-3.5" />
                  <span>ดูผลลัพธ์</span>
                </>
              ) : (
                <>
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>แก้ไข</span>
                </>
              )}
            </button>

            {/* Quick Copy Button */}
            <button
              type="button"
              onClick={handleCopyMd}
              className="text-xs px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              {copiedMd ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-medium">คัดลอกแล้ว</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>คัดลอก</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="p-4 max-h-[550px] overflow-y-auto custom-scrollbar">
          {isEditing ? (
            <textarea
              value={markdownText}
              onChange={(e) => setCustomMarkdown(e.target.value)}
              placeholder="แก้ไขข้อความร่าง Master Draft..."
              className="w-full min-h-[300px] p-3 rounded-lg bg-neutral-900 border border-neutral-700 focus:border-rose-500 text-xs font-mono text-neutral-100 placeholder:text-neutral-500 resize-y leading-relaxed outline-none"
            />
          ) : (
            <pre
              onClick={() => setIsEditing(true)}
              title="คลิกเพื่อแก้ไขข้อความ"
              className="font-mono text-xs text-neutral-200 whitespace-pre-wrap leading-relaxed cursor-text hover:bg-neutral-900/40 p-1 rounded transition-colors"
            >
              {markdownText}
            </pre>
          )}
        </div>
      </div>

      {/* Fullscreen Modal View (Matching Single Studio Focus View) */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
          <div className="relative w-full max-w-5xl h-[90vh] flex flex-col bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:px-6 sm:py-4 border-b border-border bg-muted/40 gap-3 sm:gap-4 flex-shrink-0">
              <div className="flex items-start justify-between sm:justify-start gap-3 min-w-0 flex-1">
                <div className="flex flex-col min-w-0">
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2 flex-wrap">
                    <span>Master Draft (Full Expanded View)</span>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-muted text-muted-foreground">
                      {markdownText.length.toLocaleString('th-TH')} ตัวอักษร
                    </span>
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
                    โครงร่างรวมทุกหมวดหมู่ของโปรเจกต์ Multi-Character Studio
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsFullscreen(false)}
                  className="sm:hidden w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer flex-shrink-0"
                  title="ปิดหน้าต่าง"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center justify-end gap-2 w-full sm:w-auto flex-shrink-0 pt-1.5 sm:pt-0 border-t border-border/40 sm:border-t-0">
                <button
                  type="button"
                  onClick={handleCopyMd}
                  className="text-xs px-3 py-1.5 rounded-lg bg-card hover:bg-muted text-foreground border border-border transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-xs"
                >
                  {copiedMd ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
                  <span>{copiedMd ? 'คัดลอกแล้ว' : 'คัดลอก MD'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsFullscreen(false)}
                  className="hidden sm:flex w-8 h-8 rounded-lg items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                  title="ปิดหน้าต่าง"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-hidden p-4 sm:p-6 bg-background flex flex-col">
              <textarea
                value={markdownText}
                onChange={(e) => setCustomMarkdown(e.target.value)}
                placeholder="แก้ไข Master Draft..."
                className="w-full flex-1 p-4 rounded-xl bg-card border border-border focus:border-rose-500 focus:ring-2 focus:ring-rose-500/30 text-xs font-mono text-foreground resize-none leading-relaxed outline-none"
              />
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 border-t border-border bg-muted/20 flex justify-between items-center flex-shrink-0">
              <span className="text-xs text-muted-foreground">
                โหมดขยายเต็มหน้าจอ (กด Esc หรือคลิกปิดเพื่อย้อนกลับ)
              </span>
              <button
                type="button"
                onClick={() => setIsFullscreen(false)}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}