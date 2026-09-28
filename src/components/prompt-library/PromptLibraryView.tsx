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

interface PromptLibraryViewProps {
  mode: 'single' | 'multi';
  isReadOnly?: boolean;
  onApplyToProject?: (selectedEntries: PromptLibraryEntry[]) => { success: boolean; message: string; undo?: () => void };
  onClose?: () => void;
}

export function PromptLibraryView({
  mode,
  isReadOnly = false,
  onApplyToProject,
  onClose,
}: PromptLibraryViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [actionNotice, setActionNotice] = useState<{ message: string; undo?: () => void } | null>(null);

  // Filter items by mode
  const modeEntries = useMemo(() => {
    return getPromptsByMode(libraryData.entries, mode);
  }, [mode]);

  const modePresets = useMemo(() => {
    return getPresetsByMode(libraryData.presets, mode);
  }, [mode]);

  // Extract all unique tags
  const allTags = useMemo(() => {
    const set = new Set<string>();
    modeEntries.forEach((item) => {
      if (Array.isArray(item.tags)) {
        item.tags.forEach((t) => set.add(t));
      }
    });
    return Array.from(set);
  }, [modeEntries]);

  // Filtered items based on search/category/tag
  const filteredEntries = useMemo(() => {
    return searchPrompts(modeEntries, searchQuery, selectedCategory, selectedTag);
  }, [modeEntries, searchQuery, selectedCategory, selectedTag]);

  // Selected items objects
  const selectedEntries = useMemo(() => {
    const idSet = new Set(selectedIds);
    return modeEntries.filter((item) => idSet.has(item.id));
  }, [modeEntries, selectedIds]);

  // Dependency Resolution
  const { resolvedIds, autoAddedIds } = useMemo(() => {
    return resolveDependencies(selectedIds, modeEntries);
  }, [selectedIds, modeEntries]);

  // Conflicts Detection
  const conflicts = useMemo(() => {
    return detectConflicts(selectedIds, modeEntries);
  }, [selectedIds, modeEntries]);

  // Toggle item selection
  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  // Toggle expand/collapse of item body
  const handleToggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Apply Preset
  const handleSelectPreset = (preset: PromptPreset) => {
    const availablePresetIds = preset.entryIds.filter((id) =>
      modeEntries.some((item) => item.id === id)
    );
    setSelectedIds(availablePresetIds);
    setActionNotice({ message: `เลือกชุดแม่แบบ "${preset.title}" เรียบร้อย` });
    setTimeout(() => setActionNotice(null), 2500);
  };

  // Select / Deselect All Filtered
  const handleSelectAllFiltered = () => {
    const filteredIdSet = new Set(filteredEntries.map((i) => i.id));
    const allSelected = filteredEntries.every((i) => selectedIds.includes(i.id));

    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !filteredIdSet.has(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...filteredEntries.map((i) => i.id)])));
    }
  };

  // Copy Single Item
  const handleCopyItem = async (item: PromptLibraryEntry) => {
    const text = `### ${item.title}\n${item.body}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {}
  };

  // Copy All Selected Bundle
  const handleCopyBundle = async () => {
    if (selectedEntries.length === 0) return;
    const bundle = bundlePromptsToMarkdown(selectedEntries);
    try {
      await navigator.clipboard.writeText(bundle);
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    } catch {}
  };

  // Apply to Project Handler
  const handleApply = () => {
    if (isReadOnly || selectedEntries.length === 0 || !onApplyToProject) return;
    const res = onApplyToProject(selectedEntries);
    if (res && res.success) {
      setActionNotice({
        message: res.message,
        undo: res.undo,
      });
    }
  };

  return (
    <div className="flex flex-col h-full space-y-4 animate-in fade-in duration-200">
      {/* Top Header Card */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-tr from-purple-500/10 via-rose-500/10 to-amber-500/10 border border-purple-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-foreground">
                Prompt Library (คลังคำสั่งและกฎพฤติกรรม)
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/30 uppercase tracking-wider">
                {mode === 'single' ? 'Single-Char Mode' : 'Multi-Char Studio'}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              คัดเลือกกฎคำสั่งเฉพาะทาง (เช่น ระบบโบ้ง้อ, รักษาความสอดคล้อง, การส่งบท) นำไปปรับใช้เข้าสู่ตัวละครหรือจักรวาลได้ทันที
            </p>
          </div>
        </div>

        {/* Presets Quick Dropdown / Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 custom-scrollbar flex-shrink-0">
          <span className="text-[11px] font-bold text-muted-foreground whitespace-nowrap">
            ชุดแนะนำ:
          </span>
          {modePresets.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => handleSelectPreset(preset)}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-card hover:bg-muted border border-border hover:border-primary/50 text-foreground transition-all cursor-pointer whitespace-nowrap shadow-2xs active:scale-95 flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>{preset.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Action Notification / Undo Toast Banner */}
      {actionNotice && (
        <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 dark:text-emerald-200 text-xs flex items-center justify-between gap-2 shadow-xs animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            <span className="font-semibold">{actionNotice.message}</span>
          </div>
          {actionNotice.undo && (
            <button
              type="button"
              onClick={() => {
                actionNotice.undo?.();
                setActionNotice({ message: 'ย้อนกลับการเปลี่ยนแปลงเรียบร้อย' });
                setTimeout(() => setActionNotice(null), 2000);
              }}
              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] cursor-pointer transition-all flex items-center gap-1 shadow-2xs"
            >
              <RotateCcw className="w-3 h-3" />
              <span>กดย้อนกลับ (Undo)</span>
            </button>
          )}
        </div>
      )}

      {/* Conflicts Warning Banner */}
      {conflicts.length > 0 && (
        <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-800 dark:text-amber-200 text-xs flex items-center gap-2 shadow-xs">
          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
          <div>
            <span className="font-bold">พบกฎที่ขัดแย้งกัน: </span>
            <span>
              {conflicts.map((c) => `"${c.itemA.title}" ขัดแย้งกับ "${c.itemB.title}"`).join(', ')}
            </span>
          </div>
        </div>
      )}

      {/* Auto-resolved Dependencies Notification */}
      {autoAddedIds.length > 0 && (
        <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/25 text-blue-700 dark:text-blue-300 text-xs flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
          <span>
            ระบบเลือกกฎที่จำเป็นต้องใช้ร่วมกันให้อัตโนมัติ: {autoAddedIds.join(', ')}
          </span>
        </div>
      )}

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาคำสั่ง, คำสำคัญ, เช่น ระบบโบ้, กฎความสัมพันธ์..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-muted/50 border border-border text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 custom-scrollbar">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={
              'px-2.5 py-1.5 text-xs font-bold rounded-xl border transition-all cursor-pointer whitespace-nowrap ' +
              (selectedCategory === 'all'
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-card text-muted-foreground border-border hover:bg-muted')
            }
          >
            ทั้งหมด ({modeEntries.length})
          </button>
          {libraryData.categories.map((cat) => {
            const count = modeEntries.filter((i) => i.category === cat.id).length;
            if (count === 0) return null;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={
                  'px-2.5 py-1.5 text-xs font-bold rounded-xl border transition-all cursor-pointer whitespace-nowrap ' +
                  (isSelected
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-card text-muted-foreground border-border hover:bg-muted')
                }
              >
                <span>{cat.label}</span>
                <span className="ml-1 opacity-70">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tag Filter Pills */}
      {allTags.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs custom-scrollbar">
          <span className="text-[11px] font-semibold text-muted-foreground whitespace-nowrap flex items-center gap-1">
            <Tag className="w-3 h-3" />
            <span>แท็ก:</span>
          </span>
          <button
            type="button"
            onClick={() => setSelectedTag('all')}
            className={
              'px-2 py-0.5 rounded-lg text-[11px] font-medium transition-all cursor-pointer whitespace-nowrap ' +
              (selectedTag === 'all' ? 'bg-muted text-foreground font-bold' : 'text-muted-foreground hover:bg-muted/50')
            }
          >
            ทั้งหมด
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setSelectedTag(selectedTag === tag ? 'all' : tag)}
              className={
                'px-2 py-0.5 rounded-lg text-[11px] font-medium transition-all cursor-pointer whitespace-nowrap ' +
                (selectedTag === tag
                  ? 'bg-primary/20 text-primary border border-primary/30 font-bold'
                  : 'bg-muted/40 text-muted-foreground hover:text-foreground')
              }
            >
              #{tag}
            </button>
          ))}
        </div>
      )}

      {/* Select All / Counter Bar */}
      <div className="flex items-center justify-between px-1 text-xs text-muted-foreground border-b border-border/60 pb-2">
        <button
          type="button"
          onClick={handleSelectAllFiltered}
          className="flex items-center gap-1.5 font-semibold text-foreground hover:text-primary transition-colors cursor-pointer"
        >
          {filteredEntries.length > 0 && filteredEntries.every((i) => selectedIds.includes(i.id)) ? (
            <CheckSquare className="w-4 h-4 text-primary" />
          ) : (
            <Square className="w-4 h-4" />
          )}
          <span>เลือกทั้งหมดในหมวดนี้ ({filteredEntries.length})</span>
        </button>

        <span className="font-semibold text-foreground">
          เลือกแล้ว: <strong className="text-primary">{selectedIds.length}</strong> / {modeEntries.length} รายการ
        </span>
      </div>

      {/* Prompt Entries Grid List */}
      <div className="flex-1 overflow-y-auto space-y-2.5 custom-scrollbar min-h-[220px] max-h-[58vh]">
        {filteredEntries.length === 0 ? (
          <div className="p-8 text-center bg-card rounded-2xl border border-dashed border-border text-muted-foreground text-xs space-y-1">
            <p className="font-bold text-foreground">ไม่พบคำสั่งที่ตรงกับเงื่อนไข</p>
            <p>ลองเปลี่ยนคำค้นหา หรือเลือกหมวดหมู่อื่นดูครับ</p>
          </div>
        ) : (
          filteredEntries.map((item) => {
            const isSelected = selectedIds.includes(item.id);
            const isExpanded = expandedIds.has(item.id);
            const categoryLabel =
              libraryData.categories.find((c) => c.id === item.category)?.label || item.category;

            return (
              <div
                key={item.id}
                className={
                  'p-3.5 rounded-2xl border transition-all ' +
                  (isSelected
                    ? 'bg-primary/5 border-primary/50 shadow-xs'
                    : 'bg-card border-border hover:border-border/80')
                }
              >
                <div className="flex items-start justify-between gap-3">
                  {/* Left Checkbox & Title */}
                  <div
                    className="flex items-start gap-2.5 flex-1 min-w-0 cursor-pointer"
                    onClick={() => handleToggleSelect(item.id)}
                  >
                    <div className="mt-0.5 flex-shrink-0">
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-primary" />
                      ) : (
                        <Square className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>

                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="font-bold text-xs text-foreground leading-snug">
                          {item.title}
                        </span>
                        <span className="text-[10px] px-2 py-0.2 rounded-full bg-muted text-muted-foreground font-semibold">
                          {categoryLabel}
                        </span>
                        {item.tags.map((t) => (
                          <span
                            key={t}
                            className="text-[9px] px-1.5 py-0.2 rounded bg-muted/60 text-muted-foreground"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>

                      {item.useWhen && (
                        <p className="text-[11px] text-muted-foreground/80 leading-relaxed">
                          💡 <em>ใช้เมื่อ:</em> {item.useWhen}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right Actions: Copy & Expand */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => handleCopyItem(item)}
                      title="คัดลอกข้อความคำสั่ง"
                      className="p-1.5 rounded-lg border border-border bg-card hover:bg-muted text-foreground transition-all cursor-pointer shadow-2xs"
                    >
                      {copiedId === item.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleToggleExpand(item.id)}
                      title={isExpanded ? 'ย่อเนื้อหา' : 'ดูเนื้อหาคำสั่ง'}
                      className="p-1.5 rounded-lg border border-border bg-card hover:bg-muted text-foreground transition-all cursor-pointer shadow-2xs"
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Expanded Content Box */}
                {isExpanded && (
                  <div className="mt-3 pt-2.5 border-t border-border/60">
                    <div className="p-2.5 rounded-xl bg-muted/40 font-mono text-xs leading-relaxed text-foreground whitespace-pre-wrap select-all">
                      {item.body}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Bottom Sticky Action Footer */}
      <div className="p-3.5 rounded-2xl border border-border bg-card shadow-lg flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs">
          <span className="font-bold text-foreground">
            คำสั่งที่เลือก: {selectedEntries.length} รายการ
          </span>
          {selectedEntries.length > 0 && (
            <span className="text-[11px] text-muted-foreground">
              (~{selectedEntries.reduce((sum, item) => sum + item.body.length, 0)} ตัวอักษร)
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Copy Bundle Button */}
          <button
            type="button"
            onClick={handleCopyBundle}
            disabled={selectedEntries.length === 0}
            className="px-3 py-2 rounded-xl border border-border bg-card hover:bg-muted disabled:opacity-40 text-xs font-bold text-foreground transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
          >
            {copiedAll ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span>คัดลอกชุดคำสั่งแล้ว!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                <span>คัดลอกทั้งหมด ({selectedEntries.length})</span>
              </>
            )}
          </button>

          {/* Apply to Project Button */}
          {onApplyToProject && (
            <button
              type="button"
              onClick={handleApply}
              disabled={isReadOnly || selectedEntries.length === 0}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-primary to-rose-600 hover:from-primary/90 hover:to-rose-700 disabled:opacity-40 text-primary-foreground text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>
                {mode === 'single'
                  ? 'เพิ่มเข้าสู่ System Rules'
                  : 'เพิ่มเข้าสู่ Cast Interaction Rules'}
              </span>
            </button>
          )}

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 rounded-xl border border-border bg-muted hover:bg-muted/80 text-xs font-semibold text-foreground transition-all cursor-pointer"
            >
              ปิด
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
