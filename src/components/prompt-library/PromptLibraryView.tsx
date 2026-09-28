'use client';
import React, { useState, useMemo, useEffect } from 'react';
import {
  BookOpen,
  Sparkles,
  Search,
  Check,
  Copy,
  AlertTriangle,
  RotateCcw,
  Tag,
  Layers,
  ArrowRight,
  Filter,
  CheckSquare,
  Square,
  ChevronDown,
  ChevronUp,
  HeartHandshake,
  Users,
  ShieldAlert,
  Plus,
  Trash2,
  Edit,
  Download,
  Upload,
  Globe,
  Lock,
  Share2,
  FileText,
  Zap,
} from 'lucide-react';
import rawLibraryData from '@/data/promptLibrary.json';
import {
  PromptLibraryData,
  PromptLibraryEntry,
  PromptPreset,
  getPromptsByMode,
  getPresetsByMode,
  searchPrompts,
  resolveDependencies,
  detectConflicts,
  bundlePromptsToMarkdown,
} from '@/shared/promptLibraryTypes';

const libraryData = rawLibraryData as PromptLibraryData;
const CUSTOM_PROMPTS_STORAGE_KEY = 'sedchar_custom_prompts_v1';

interface PromptLibraryViewProps {
  mode?: 'single' | 'multi' | 'all';
  isReadOnly?: boolean;
  isStandalonePage?: boolean;
  onApplyToProject?: (selectedEntries: PromptLibraryEntry[]) => { success: boolean; message: string; undo?: () => void };
  onClose?: () => void;
}

export function PromptLibraryView({
  mode = 'all',
  isReadOnly = false,
  isStandalonePage = false,
  onApplyToProject,
  onClose,
}: PromptLibraryViewProps) {
  const [activeMode, setActiveMode] = useState<'all' | 'single' | 'multi'>(mode);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [actionNotice, setActionNotice] = useState<{ message: string; undo?: () => void } | null>(null);

  // Custom User Prompts state (Stored in localStorage - Zero Egress)
  const [customEntries, setCustomEntries] = useState<PromptLibraryEntry[]>([]);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [editingCustomId, setEditingCustomId] = useState<string | null>(null);
  const [customForm, setCustomForm] = useState<{
    title: string;
    category: string;
    modes: ('single' | 'multi')[];
    tags: string;
    useWhen: string;
    body: string;
    visibility: 'private' | 'public';
  }>({
    title: '',
    category: 'core',
    modes: ['single', 'multi'],
    tags: '',
    useWhen: '',
    body: '',
    visibility: 'private',
  });

  // Load custom prompts from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(CUSTOM_PROMPTS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setCustomEntries(parsed);
        }
      }
    } catch {
      // Ignore parse error
    }
  }, []);

  // Save custom prompts to localStorage
  const saveCustomEntries = (updated: PromptLibraryEntry[]) => {
    setCustomEntries(updated);
    try {
      localStorage.setItem(CUSTOM_PROMPTS_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save custom prompts to localStorage', e);
    }
  };

  // Combine official entries with custom entries
  const allEntries = useMemo(() => {
    return [...libraryData.entries, ...customEntries];
  }, [customEntries]);

  // Filter items by active mode
  const modeEntries = useMemo(() => {
    if (activeMode === 'all') return allEntries;
    return allEntries.filter((item) => item.modes.includes(activeMode));
  }, [allEntries, activeMode]);

  const modePresets = useMemo(() => {
    if (activeMode === 'all') return libraryData.presets;
    return getPresetsByMode(libraryData.presets, activeMode);
  }, [activeMode]);

  // Extract all unique tags
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    modeEntries.forEach((item) => {
      item.tags?.forEach((t) => tags.add(t));
    });
    return Array.from(tags).sort();
  }, [modeEntries]);

  // Filtered entries by query, category, and tag
  const filteredEntries = useMemo(() => {
    return searchPrompts(modeEntries, searchQuery, selectedCategory, selectedTag);
  }, [modeEntries, searchQuery, selectedCategory, selectedTag]);

  // Check conflicts among currently selected items
  const activeConflicts = useMemo(() => {
    return detectConflicts(selectedIds, allEntries);
  }, [selectedIds, allEntries]);

  // Toggle single item selection
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((i) => i !== id);
      }
      // Check dependencies
      const { resolvedIds } = resolveDependencies([...prev, id], allEntries);
      return resolvedIds;
    });
  };

  // Select/Deselect all visible
  const handleSelectAllVisible = () => {
    const visibleIds = filteredEntries.map((e) => e.id);
    const allSelected = visibleIds.every((id) => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !visibleIds.includes(id)));
    } else {
      const combined = Array.from(new Set([...selectedIds, ...visibleIds]));
      const { resolvedIds } = resolveDependencies(combined, allEntries);
      setSelectedIds(resolvedIds);
    }
  };

  // Apply Preset
  const handleApplyPreset = (preset: PromptPreset) => {
    const { resolvedIds, autoAddedIds } = resolveDependencies(preset.entryIds, allEntries);
    setSelectedIds(resolvedIds);

    let msg = `ใช้งานชุดคำสั่ง: "${preset.title}" (${resolvedIds.length} กฎ)`;
    if (autoAddedIds.length > 0) {
      msg += ` [รวมคำสั่งเชื่อมโยงอัตโนมัติ ${autoAddedIds.length} ข้อ]`;
    }
    setActionNotice({ message: msg });
    setTimeout(() => setActionNotice(null), 4000);
  };

  // Toggle item expanded body
  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Copy single item
  const handleCopySingle = (entry: PromptLibraryEntry, e?: React.MouseEvent) => {
    e?.stopPropagation();
    navigator.clipboard.writeText(entry.body);
    setCopiedId(entry.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Copy all selected as bundled Markdown
  const handleCopySelectedMarkdown = () => {
    const selectedList = allEntries.filter((e) => selectedIds.includes(e.id));
    if (selectedList.length === 0) return;
    const bundleMd = bundlePromptsToMarkdown(selectedList);
    navigator.clipboard.writeText(bundleMd);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  // Export all custom & selected as JSON
  const handleExportJSON = () => {
    const exportData = {
      exportedAt: new Date().toISOString(),
      customPrompts: customEntries,
      selectedPrompts: allEntries.filter((e) => selectedIds.includes(e.id)),
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sedchar_prompts_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import JSON prompts
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const text = ev.target?.result as string;
        const data = JSON.parse(text);
        const imported = data.customPrompts || data.entries || (Array.isArray(data) ? data : []);
        if (Array.isArray(imported) && imported.length > 0) {
          const validated = imported.map((item: any, idx: number) => ({
            id: item.id || `custom-import-${Date.now()}-${idx}`,
            title: item.title || 'คำสั่งนำเข้า',
            category: item.category || 'core',
            tags: Array.isArray(item.tags) ? item.tags : ['นำเข้า'],
            modes: Array.isArray(item.modes) ? item.modes : ['single', 'multi'],
            useWhen: item.useWhen || 'คำสั่งที่นำเข้าจากภายนอก',
            body: item.body || item.content || '',
            isCustom: true,
          }));
          saveCustomEntries([...customEntries, ...validated]);
          setActionNotice({ message: `นำเข้าคำสั่งสำเร็จ ${validated.length} รายการ!` });
          setTimeout(() => setActionNotice(null), 3000);
        }
      } catch (err) {
        alert('ไฟล์ JSON ไม่ถูกต้อง');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Add / Edit Custom Prompt
  const handleSaveCustomPrompt = () => {
    if (!customForm.title.trim() || !customForm.body.trim()) {
      alert('กรุณาระบุชื่อคำสั่งและเนื้อหาคำสั่ง');
      return;
    }

    const tagArray = customForm.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    if (editingCustomId) {
      // Update existing
      const updated = customEntries.map((e) => {
        if (e.id === editingCustomId) {
          return {
            ...e,
            title: customForm.title.trim(),
            category: customForm.category,
            modes: customForm.modes,
            tags: tagArray.length > 0 ? tagArray : ['ส่วนตัว'],
            useWhen: customForm.useWhen.trim() || 'คำสั่งกำหนดเอง',
            body: customForm.body.trim(),
          };
        }
        return e;
      });
      saveCustomEntries(updated);
    } else {
      // Create new
      const newEntry: PromptLibraryEntry = {
        id: `custom-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        title: customForm.title.trim(),
        category: customForm.category,
        modes: customForm.modes,
        tags: tagArray.length > 0 ? tagArray : ['ส่วนตัว'],
        useWhen: customForm.useWhen.trim() || 'คำสั่งกำหนดเองของผู้ใช้',
        body: customForm.body.trim(),
      };
      saveCustomEntries([newEntry, ...customEntries]);
    }

    setIsCustomModalOpen(false);
    setEditingCustomId(null);
    setCustomForm({
      title: '',
      category: 'core',
      modes: ['single', 'multi'],
      tags: '',
      useWhen: '',
      body: '',
      visibility: 'private',
    });
  };

  // Open Edit Custom Prompt
  const handleEditCustom = (entry: PromptLibraryEntry, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingCustomId(entry.id);
    setCustomForm({
      title: entry.title,
      category: entry.category,
      modes: entry.modes,
      tags: entry.tags.join(', '),
      useWhen: entry.useWhen,
      body: entry.body,
      visibility: 'private',
    });
    setIsCustomModalOpen(true);
  };

  // Delete Custom Prompt
  const handleDeleteCustom = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('ยืนยันลบคำสั่งกำหนดเองนี้?')) {
      const updated = customEntries.filter((e) => e.id !== id);
      saveCustomEntries(updated);
      setSelectedIds((prev) => prev.filter((i) => i !== id));
    }
  };

  // Apply to project
  const handleApply = () => {
    if (!onApplyToProject) return;
    const selectedList = allEntries.filter((e) => selectedIds.includes(e.id));
    const res = onApplyToProject(selectedList);
    setActionNotice({ message: res.message, undo: res.undo });
  };

  return (
    <div className="flex flex-col h-full bg-card overflow-hidden">
      {/* Action Notice Bar */}
      {actionNotice && (
        <div className="bg-primary text-primary-foreground px-4 py-2 text-xs font-semibold flex items-center justify-between shadow-md animate-in slide-in-from-top duration-200">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>{actionNotice.message}</span>
          </div>
          {actionNotice.undo && (
            <button
              type="button"
              onClick={actionNotice.undo}
              className="flex items-center gap-1 bg-black/20 hover:bg-black/30 px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer transition-all"
            >
              <RotateCcw className="w-3 h-3" />
              <span>ย้อนกลับ (Undo)</span>
            </button>
          )}
        </div>
      )}

      {/* Main Header / Control Toolbar */}
      <div className="p-3.5 sm:p-4 border-b border-border bg-card/60 backdrop-blur-sm flex flex-col gap-3">
        {/* Row 1: Title, Mode Toggles, and Top Actions */}
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                <span>คลังคำสั่งและกฎพฤติกรรม (Prompt Library)</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted border border-border text-muted-foreground font-semibold">
                  {allEntries.length} คำสั่ง
                </span>
              </h2>
            </div>
          </div>

          {/* Mode Switcher Buttons */}
          <div className="flex items-center gap-1 p-0.5 rounded-lg bg-muted border border-border text-xs">
            <button
              type="button"
              onClick={() => setActiveMode('all')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                activeMode === 'all'
                  ? 'bg-card text-foreground shadow-xs font-bold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              ทั้งหมด
            </button>
            <button
              type="button"
              onClick={() => setActiveMode('single')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                activeMode === 'single'
                  ? 'bg-card text-foreground shadow-xs font-bold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Zap className="w-3 h-3 text-amber-500" />
              <span>Single-Char</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveMode('multi')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                activeMode === 'multi'
                  ? 'bg-card text-foreground shadow-xs font-bold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Layers className="w-3 h-3 text-rose-500" />
              <span>Multi-Char</span>
            </button>
          </div>

          {/* Top Actions: Add Custom, Import, Export */}
          <div className="flex items-center gap-1.5 ml-auto">
            <button
              type="button"
              onClick={() => {
                setEditingCustomId(null);
                setCustomForm({
                  title: '',
                  category: 'core',
                  modes: ['single', 'multi'],
                  tags: '',
                  useWhen: '',
                  body: '',
                  visibility: 'private',
                });
                setIsCustomModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
              title="เพิ่มคำสั่งกำหนดเอง (เก็บในเครื่อง $0 Egress)"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>สร้างคำสั่งใหม่</span>
            </button>

            <label
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border bg-card hover:bg-muted text-xs font-medium text-foreground transition-all cursor-pointer shadow-xs"
              title="นำเข้าคำสั่งจากไฟล์ JSON"
            >
              <Upload className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="hidden sm:inline">นำเข้า JSON</span>
              <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
            </label>

            <button
              type="button"
              onClick={handleExportJSON}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border bg-card hover:bg-muted text-xs font-medium text-foreground transition-all cursor-pointer shadow-xs"
              title="ส่งออกคำสั่งเป็นไฟล์ JSON"
            >
              <Download className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="hidden sm:inline">ส่งออก JSON</span>
            </button>
          </div>
        </div>

        {/* Row 2: Search, Category Pills, and Preset Shortcuts */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาชื่อคำสั่ง, เนื้อหา, หรือแท็ก (เช่น นินนินเมร่า, นับรอบ 8, Taming, Slow-burn)..."
              className="w-full !pl-9 pr-3 py-1.5 text-xs rounded-xl bg-muted/50 border border-border text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            )}
          </div>

          {/* Category Dropdown */}
          <div className="flex items-center gap-1.5">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl bg-muted/60 border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer"
            >
              <option value="all">📁 ทุกหมวดหมู่ ({allEntries.length})</option>
              {libraryData.categories.map((cat) => {
                const count = allEntries.filter((e) => e.category === cat.id).length;
                return (
                  <option key={cat.id} value={cat.id}>
                    {cat.label} ({count})
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {/* Presets Chips */}
        {modePresets.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none text-[11px]">
            <span className="text-muted-foreground font-semibold flex items-center gap-1 shrink-0">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>ชุดสำเร็จ:</span>
            </span>
            {modePresets.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleApplyPreset(preset)}
                className="px-2.5 py-0.5 rounded-full bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 font-medium whitespace-nowrap transition-all cursor-pointer shadow-2xs"
                title={preset.description}
              >
                {preset.title}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Conflict Warning Box */}
      {activeConflicts.length > 0 && (
        <div className="bg-rose-500/10 border-b border-rose-500/30 p-2.5 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold">ตรวจพบคำสั่งที่อาจขัดแย้งกัน ({activeConflicts.length} จุด):</span>
            <ul className="list-disc pl-4 mt-1 space-y-0.5 text-[11px]">
              {activeConflicts.map((c, i) => (
                <li key={i}>{c.itemA.title} ขัดแย้งกับ {c.itemB.title}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Entries List Area */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2.5">
        {filteredEntries.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <BookOpen className="w-10 h-10 mx-auto text-muted-foreground/40 mb-2" />
            <p className="text-sm font-semibold">ไม่พบคำสั่งที่ตรงกับเงื่อนไขการค้นหา</p>
            <p className="text-xs mt-1 text-muted-foreground/70">ลองเปลี่ยนคำค้นหา หรือสร้างคำสั่งใหม่ด้วยปุ่มด้านบน</p>
          </div>
        ) : (
          filteredEntries.map((entry) => {
            const isSelected = selectedIds.includes(entry.id);
            const isExpanded = expandedIds.has(entry.id);
            const isCustom = 'isCustom' in entry && Boolean((entry as any).isCustom);

            return (
              <div
                key={entry.id}
                onClick={() => toggleSelect(entry.id)}
                className={`group p-3 sm:p-3.5 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-primary/5 border-primary/40 shadow-xs ring-1 ring-primary/20'
                    : 'bg-card border-border/80 hover:border-primary/30 hover:bg-muted/30'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5 flex-1 min-w-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSelect(entry.id);
                      }}
                      className="mt-0.5 text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                    >
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-primary" />
                      ) : (
                        <Square className="w-4 h-4 text-muted-foreground/60" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5 mb-1">
                        <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                          {entry.title}
                        </span>

                        {isCustom && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/25 font-semibold">
                            Custom
                          </span>
                        )}

                        {entry.tags?.map((tag) => (
                          <span
                            key={tag}
                            className="text-[9px] px-1.5 py-0.2 rounded bg-muted text-muted-foreground border border-border"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>

                      <p className="text-[11px] text-muted-foreground line-clamp-2">
                        {entry.useWhen}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => handleCopySingle(entry, e)}
                      className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer"
                      title="คัดลอกคำสั่ง"
                    >
                      {copiedId === entry.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>

                    {isCustom && (
                      <>
                        <button
                          type="button"
                          onClick={(e) => handleEditCustom(entry, e)}
                          className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-primary transition-all cursor-pointer"
                          title="แก้ไขคำสั่ง"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteCustom(entry.id, e)}
                          className="p-1.5 rounded-lg hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 transition-all cursor-pointer"
                          title="ลบคำสั่ง"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleExpand(entry.id);
                      }}
                      className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer"
                      title={isExpanded ? 'ย่อเนื้อหา' : 'ดูเนื้อหาเต็ม'}
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Expanded Prompt Body */}
                {isExpanded && (
                  <div className="mt-2.5 pt-2.5 border-t border-border/60">
                    <pre className="text-[11px] font-mono bg-muted/70 p-2.5 rounded-lg text-foreground whitespace-pre-wrap leading-relaxed overflow-x-auto border border-border/80">
                      {entry.body}
                    </pre>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer / Selection Action Bar */}
      <div className="p-3 sm:p-4 border-t border-border bg-card/90 backdrop-blur-md flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSelectAllVisible}
            className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            {filteredEntries.every((e) => selectedIds.includes(e.id))
              ? 'ยกเลิกเลือกทั้งหมด'
              : `เลือกทั้งหมด (${filteredEntries.length})`}
          </button>

          <span className="text-border">|</span>

          <span className="text-xs font-bold text-foreground">
            เลือกไว้ {selectedIds.length} ข้อ
          </span>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          {selectedIds.length > 0 && (
            <>
              <button
                type="button"
                onClick={handleCopySelectedMarkdown}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-card hover:bg-muted text-xs font-semibold text-foreground transition-all cursor-pointer shadow-xs active:scale-95"
                title="คัดลอกคำสั่งที่เลือกทั้งหมดเป็น Markdown"
              >
                {copiedAll ? (
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-primary" />
                )}
                <span>คัดลอกเป็นชุด ({selectedIds.length})</span>
              </button>

              {onApplyToProject && !isReadOnly && (
                <button
                  type="button"
                  onClick={handleApply}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>นำเข้าโปรเจกต์</span>
                </button>
              )}
            </>
          )}

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl border border-border bg-muted hover:bg-muted/80 text-xs font-semibold text-foreground transition-all cursor-pointer"
            >
              ปิดหน้าต่าง
            </button>
          )}
        </div>
      </div>

      {/* Modal: Create / Edit Custom Prompt */}
      {isCustomModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-4 py-3 border-b border-border flex items-center justify-between bg-muted/40">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Plus className="w-4 h-4 text-primary" />
                <span>{editingCustomId ? 'แก้ไขคำสั่งกำหนดเอง' : 'สร้างคำสั่งใหม่ (Custom Prompt)'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsCustomModalOpen(false)}
                className="text-muted-foreground hover:text-foreground text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Modal Form */}
            <div className="p-4 space-y-3 overflow-y-auto flex-1 text-xs">
              <div>
                <label className="block font-bold text-foreground mb-1">ชื่อคำสั่ง (Title) *</label>
                <input
                  type="text"
                  value={customForm.title}
                  onChange={(e) => setCustomForm({ ...customForm, title: e.target.value })}
                  placeholder="เช่น กฎควบคุมอารมณ์, ห้ามใช้เวทมนตร์เกินขอบเขต"
                  className="w-full px-3 py-1.5 rounded-xl bg-muted/50 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-foreground mb-1">หมวดหมู่ (Category)</label>
                  <select
                    value={customForm.category}
                    onChange={(e) => setCustomForm({ ...customForm, category: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-xl bg-muted/50 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                  >
                    {libraryData.categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-foreground mb-1">แท็ก (คั่นด้วยจุลภาค)</label>
                  <input
                    type="text"
                    value={customForm.tags}
                    onChange={(e) => setCustomForm({ ...customForm, tags: e.target.value })}
                    placeholder="เช่น ดราม่า, สู้รบ, ลับ"
                    className="w-full px-3 py-1.5 rounded-xl bg-muted/50 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-foreground mb-1">เหมาะสำหรับใช้เมื่อไหร่ (Use When)</label>
                <input
                  type="text"
                  value={customForm.useWhen}
                  onChange={(e) => setCustomForm({ ...customForm, useWhen: e.target.value })}
                  placeholder="อธิบายสั้นๆ ว่ากฎนี้ช่วยแก้ปัญหาอะไร"
                  className="w-full px-3 py-1.5 rounded-xl bg-muted/50 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div>
                <label className="block font-bold text-foreground mb-1">เนื้อหาคำสั่ง / Prompt Body *</label>
                <textarea
                  rows={6}
                  value={customForm.body}
                  onChange={(e) => setCustomForm({ ...customForm, body: e.target.value })}
                  placeholder="เขียนคำสั่ง AI ตรงนี้ เช่น [System Prompt: ...] หรือกฎเหล็ก..."
                  className="w-full px-3 py-2 rounded-xl bg-muted/50 border border-border text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-primary/40 leading-relaxed"
                />
              </div>

              {/* Zero Egress info notice */}
              <div className="p-2.5 rounded-xl bg-muted/60 border border-border text-[11px] text-muted-foreground flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-primary shrink-0" />
                <span>คำสั่งส่วนตัวจะถูกจัดเก็บในเครื่องของคุณ</span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-4 py-3 border-t border-border flex items-center justify-end gap-2 bg-muted/30">
              <button
                type="button"
                onClick={() => setIsCustomModalOpen(false)}
                className="px-3 py-1.5 rounded-xl border border-border bg-card hover:bg-muted text-xs font-semibold text-foreground transition-all cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleSaveCustomPrompt}
                className="px-4 py-1.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
              >
                บันทึกคำสั่ง
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
