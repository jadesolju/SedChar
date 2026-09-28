'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  Check,
  Copy,
  Plus,
  Trash2,
  Edit3,
  Download,
  Upload,
  AlertTriangle,
  Info,
  Layers,
  Sparkles,
  Lock,
  Globe,
  Tag,
  CheckSquare,
  Square,
  RotateCcw,
  BookOpen,
  Filter,
  Share2,
  Users,
  Heart,
  RefreshCw,
  UserCheck,
  User as UserIcon,
  LogIn,
} from 'lucide-react';
import type { PromptLibraryCategory, PromptLibraryEntry, PromptPreset } from '@/shared/promptLibraryTypes';
import {
  findConflictingEntries,
  findMissingRequirements,
  loadCustomPrompts,
  saveCustomPrompts,
} from '@/shared/promptLibraryTypes';
import defaultLibraryJson from '@/data/promptLibrary.json';
import { useAuth } from '@/context/AuthContext';

interface PromptLibraryViewProps {
  mode?: 'single' | 'multi' | 'all';
  isReadOnly?: boolean;
  onApplyToProject?: (selectedEntries: PromptLibraryEntry[]) => void;
  onClose?: () => void;
  isStandalonePage?: boolean;
}

export function PromptLibraryView({
  mode = 'all',
  isReadOnly = false,
  onApplyToProject,
  onClose,
  isStandalonePage = false,
}: PromptLibraryViewProps) {
  const { user, openAuthModal } = useAuth();

  // 1. Data States
  const officialCategories: PromptLibraryCategory[] = defaultLibraryJson.categories as PromptLibraryCategory[];
  const officialEntries: PromptLibraryEntry[] = defaultLibraryJson.entries as PromptLibraryEntry[];
  const presets: PromptPreset[] = (defaultLibraryJson.presets || []) as PromptPreset[];

  const [customPrompts, setCustomPrompts] = useState<PromptLibraryEntry[]>([]);
  const [communityPrompts, setCommunityPrompts] = useState<PromptLibraryEntry[]>([]);
  const [isFetchingCommunity, setIsFetchingCommunity] = useState(false);

  // 2. Selection & Filter States
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [activeSource, setActiveSource] = useState<'all' | 'official' | 'community' | 'custom' | 'mine'>('all');
  const [activeModeFilter, setActiveModeFilter] = useState<'all' | 'single' | 'multi'>('all');

  // 3. UI Action States
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [previewEntry, setPreviewEntry] = useState<PromptLibraryEntry | null>(null);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [editingCustomId, setEditingCustomId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // User Display Name Helper
  const userDisplayName = useMemo(() => {
    if (!user) return 'ผู้ใช้งานทั่วไป';
    const meta = user.user_metadata;
    return meta?.full_name || meta?.name || meta?.user_name || (user.email ? user.email.split('@')[0] : 'สมาชิก SedChar');
  }, [user]);

  // Custom Prompt Form State
  const [customForm, setCustomForm] = useState({
    title: '',
    category: 'character',
    modes: ['single', 'multi'] as Array<'single' | 'multi'>,
    tags: '',
    useWhen: '',
    body: '',
    isPublic: false,
    authorName: '',
  });

  // Load custom prompts from localStorage on mount
  useEffect(() => {
    setCustomPrompts(loadCustomPrompts());
  }, []);

  // Fetch community prompts from API
  const fetchCommunityPrompts = async () => {
    setIsFetchingCommunity(true);
    try {
      const res = await fetch('/api/prompts/community');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.prompts)) {
          setCommunityPrompts(data.prompts);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch community prompts:', err);
    } finally {
      setIsFetchingCommunity(false);
    }
  };

  useEffect(() => {
    fetchCommunityPrompts();
  }, []);

  // Update default author name when user state changes
  useEffect(() => {
    if (user && !customForm.authorName) {
      setCustomForm((prev) => ({ ...prev, authorName: userDisplayName }));
    }
  }, [user, userDisplayName]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Combine all entries
  const allAvailableEntries: PromptLibraryEntry[] = useMemo(() => {
    const customMarked = customPrompts.map((p) => ({ ...p, isCustom: true }));
    const communityMap = new Map<string, PromptLibraryEntry>();

    communityPrompts.forEach((cp) => {
      communityMap.set(cp.id, { ...cp, isPublic: true, isCustom: true });
    });

    const combined = [...officialEntries, ...customMarked];
    communityMap.forEach((cp) => {
      if (!combined.some((c) => c.id === cp.id)) {
        combined.push(cp);
      }
    });

    return combined;
  }, [officialEntries, customPrompts, communityPrompts]);

  // Filtered entries
  const filteredEntries = useMemo(() => {
    return allAvailableEntries.filter((entry) => {
      // Source filter
      if (activeSource === 'official' && entry.isCustom) return false;
      if (activeSource === 'community' && (!entry.isPublic || !entry.isCustom)) return false;
      if (activeSource === 'custom' && (!entry.isCustom || entry.isPublic)) return false;
      if (activeSource === 'mine') {
        const isMine =
          (user && entry.authorId === user.id) ||
          (entry.authorName && entry.authorName.toLowerCase() === userDisplayName.toLowerCase());
        if (!isMine) return false;
      }

      // Category filter
      if (activeCategory !== 'all' && entry.category !== activeCategory) return false;

      // Mode filter
      if (activeModeFilter !== 'all' && !entry.modes.includes(activeModeFilter)) return false;
      if (mode !== 'all' && !entry.modes.includes(mode)) return false;

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchTitle = entry.title.toLowerCase().includes(query);
        const matchBody = entry.body.toLowerCase().includes(query);
        const matchUseWhen = entry.useWhen.toLowerCase().includes(query);
        const matchAuthor = entry.authorName?.toLowerCase().includes(query) || false;
        const matchTag = entry.tags?.some((t) => t.toLowerCase().includes(query)) || false;
        if (!matchTitle && !matchBody && !matchUseWhen && !matchTag && !matchAuthor) return false;
      }

      return true;
    });
  }, [allAvailableEntries, activeSource, activeCategory, activeModeFilter, mode, searchQuery, user, userDisplayName]);

  // Selected entries array
  const selectedEntries = useMemo(() => {
    return allAvailableEntries.filter((e) => selectedIds.has(e.id));
  }, [allAvailableEntries, selectedIds]);

  // Conflict Check
  const activeConflicts = useMemo(() => {
    return findConflictingEntries(selectedEntries);
  }, [selectedEntries]);

  // Toggle selection
  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Select all filtered / Deselect all
  const handleSelectAllFiltered = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      filteredEntries.forEach((e) => next.add(e.id));
      return next;
    });
  };

  const handleClearSelection = () => {
    setSelectedIds(new Set());
  };

  // Apply Preset
  const handleApplyPreset = (preset: PromptPreset) => {
    const next = new Set<string>();
    preset.entryIds.forEach((id) => next.add(id));
    setSelectedIds(next);
    showToast(`🎯 โหลดชุดเทมเพลต "${preset.title}" เรียบร้อย (${preset.entryIds.length} รายการ)`);
  };

  // Copy single prompt
  const handleCopySingle = (entry: PromptLibraryEntry, e?: React.MouseEvent) => {
    e?.stopPropagation();
    navigator.clipboard.writeText(entry.body);
    setCopiedId(entry.id);
    showToast(`📋 คัดลอกคำสั่ง "${entry.title}" แล้ว!`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Copy selected combined prompt
  const handleCopySelectedCombined = () => {
    if (selectedEntries.length === 0) return;
    const combinedText = selectedEntries.map((e) => `### ${e.title}\n${e.body}`).join('\n\n');
    navigator.clipboard.writeText(combinedText);
    setCopiedAll(true);
    showToast(`📋 คัดลอกคำสั่งที่เลือกทั้งหมด ${selectedEntries.length} รายการแล้ว!`);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  // Share Prompt Link
  const handleSharePrompt = (entry: PromptLibraryEntry, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const shareText = `[SedChar.AI Prompt Library]\n📌 ${entry.title}\n${entry.useWhen}\n\n${entry.body}`;
    navigator.clipboard.writeText(shareText);
    showToast(`🔗 คัดลอกข้อความแชร์สำหรับ "${entry.title}" แล้ว!`);
  };

  // Apply to project workspace
  const handleApply = () => {
    if (onApplyToProject) {
      onApplyToProject(selectedEntries);
      showToast(`✨ นำคำสั่ง ${selectedEntries.length} รายการเข้าสู่โปรเจกต์เรียบร้อย!`);
      if (onClose) onClose();
    }
  };

  // Save Custom Prompt (Local or Public Share)
  const handleSaveCustomPrompt = async () => {
    if (!customForm.title.trim() || !customForm.body.trim()) {
      alert('กรุณากรอกชื่อคำสั่งและเนื้อหาคำสั่ง');
      return;
    }

    const tagsArr = customForm.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const author = customForm.authorName.trim() || userDisplayName || 'นักสร้างบอท SedChar';
    const promptId = editingCustomId || `custom_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newPrompt: PromptLibraryEntry = {
      id: promptId,
      title: customForm.title.trim(),
      category: customForm.category,
      modes: customForm.modes.length > 0 ? customForm.modes : ['single', 'multi'],
      tags: tagsArr.length > 0 ? tagsArr : ['กำหนดเอง'],
      useWhen: customForm.useWhen.trim() || 'คำสั่งที่สร้างขึ้นเอง',
      body: customForm.body.trim(),
      isCustom: true,
      isPublic: customForm.isPublic,
      authorName: author,
      authorId: user?.id || undefined,
      createdAt: new Date().toISOString(),
      likesCount: 1,
    };

    // If marked public, publish to Community API
    if (customForm.isPublic) {
      try {
        const pubRes = await fetch('/api/prompts/community', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: newPrompt.title,
            category: newPrompt.category,
            tags: newPrompt.tags,
            modes: newPrompt.modes,
            useWhen: newPrompt.useWhen,
            promptBody: newPrompt.body,
            authorName: newPrompt.authorName,
            authorId: user?.id,
          }),
        });
        if (pubRes.ok) {
          fetchCommunityPrompts();
        }
      } catch (err) {
        console.warn('Failed to publish to community API:', err);
      }
    }

    let updatedList: PromptLibraryEntry[];
    if (editingCustomId) {
      updatedList = customPrompts.map((p) => (p.id === editingCustomId ? newPrompt : p));
      showToast(customForm.isPublic ? '🌐 แก้ไขและแชร์สู่คลังสาธารณะแล้ว!' : '💾 แก้ไขคำสั่งส่วนตัวแล้ว');
    } else {
      updatedList = [newPrompt, ...customPrompts];
      showToast(customForm.isPublic ? '🎉 แชร์คำสั่งสู่คลังสาธารณะชุมชนแล้ว!' : '💾 บันทึกคำสั่งส่วนตัวแล้ว');
    }

    setCustomPrompts(updatedList);
    saveCustomPrompts(updatedList);
    setIsCustomModalOpen(false);
    setEditingCustomId(null);
    setCustomForm({
      title: '',
      category: 'character',
      modes: ['single', 'multi'],
      tags: '',
      useWhen: '',
      body: '',
      isPublic: false,
      authorName: userDisplayName,
    });
  };

  // Open Edit Custom Prompt
  const handleOpenEdit = (entry: PromptLibraryEntry, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setEditingCustomId(entry.id);
    setCustomForm({
      title: entry.title,
      category: entry.category,
      modes: entry.modes,
      tags: entry.tags.join(', '),
      useWhen: entry.useWhen,
      body: entry.body,
      isPublic: entry.isPublic || false,
      authorName: entry.authorName || userDisplayName,
    });
    setIsCustomModalOpen(true);
  };

  // Delete Custom / Community Prompt
  const handleDeletePrompt = async (entry: PromptLibraryEntry, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!confirm(`ต้องการลบคำสั่ง "${entry.title}" ใช่หรือไม่?`)) return;

    // 1. If public in community, call DELETE API
    if (entry.isPublic) {
      try {
        await fetch(`/api/prompts/community?id=${entry.id}&authorId=${user?.id || ''}`, {
          method: 'DELETE',
        });
        setCommunityPrompts((prev) => prev.filter((p) => p.id !== entry.id));
      } catch (err) {
        console.warn('Failed to delete community prompt:', err);
      }
    }

    // 2. Remove from local custom list if present
    const updatedList = customPrompts.filter((p) => p.id !== entry.id);
    setCustomPrompts(updatedList);
    saveCustomPrompts(updatedList);

    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(entry.id);
      return next;
    });

    showToast('🗑️ ลบคำสั่งเรียบร้อยแล้ว');
  };

  // Export Custom Prompts JSON
  const handleExportCustom = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(customPrompts, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `sedchar_custom_prompts_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('📥 ส่งออกไฟล์คำสั่ง JSON สำเร็จ');
  };

  // Import Custom Prompts JSON
  const handleImportCustom = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (Array.isArray(imported)) {
          const merged = [...imported, ...customPrompts];
          const uniqueMap = new Map<string, PromptLibraryEntry>();
          merged.forEach((item) => {
            if (item.id && item.title && item.body) {
              uniqueMap.set(item.id, { ...item, isCustom: true });
            }
          });
          const finalList = Array.from(uniqueMap.values());
          setCustomPrompts(finalList);
          saveCustomPrompts(finalList);
          showToast(`📤 นำเข้าสำเร็จ ${imported.length} รายการ!`);
        } else {
          alert('รูปแบบไฟล์ JSON ไม่ถูกต้อง (ต้องเป็น Array ของ Prompt)');
        }
      } catch (err) {
        alert('เกิดข้อผิดพลาดในการอ่านไฟล์ JSON');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="flex flex-col h-full bg-card text-foreground overflow-hidden">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-2xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 text-xs font-bold shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header & Search Bar */}
      <div className="p-3.5 sm:p-4 border-b border-border bg-muted/20 flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 flex items-center justify-center font-bold shadow-xs">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-foreground flex items-center gap-2">
                <span>คลังคำสั่งและกฎพฤติกรรม (Prompt Library)</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/25">
                  10 หมวดหมู่ + ชุมชน
                </span>
              </h2>
              {/* Account Status Subtitle */}
              <div className="flex items-center gap-2 mt-0.5">
                {user ? (
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                    <UserCheck className="w-3 h-3" />
                    <span>เข้าสู่ระบบในชื่อ: <strong>{userDisplayName}</strong></span>
                  </span>
                ) : (
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <UserIcon className="w-3 h-3" />
                    <span>โหมดทั่วไป (Guest)</span>
                    <button
                      type="button"
                      onClick={() => openAuthModal('signin')}
                      className="text-primary hover:underline font-bold flex items-center gap-0.5 cursor-pointer"
                    >
                      <LogIn className="w-3 h-3" />
                      <span>เข้าสู่ระบบ</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons: Add Custom / Export / Import / Refresh */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={fetchCommunityPrompts}
              title="ดึงข้อมูลคำสั่งจากชุมชนล่าสุด"
              className="px-2.5 py-1.5 rounded-xl border border-border bg-card hover:bg-muted text-xs font-semibold text-foreground transition-all cursor-pointer shadow-2xs flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-indigo-500 ${isFetchingCommunity ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">รีเฟรช</span>
            </button>

            <label
              title="นำเข้าคำสั่ง JSON"
              className="px-2.5 py-1.5 rounded-xl border border-border bg-card hover:bg-muted text-xs font-semibold text-foreground transition-all cursor-pointer shadow-2xs flex items-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="hidden sm:inline">นำเข้า JSON</span>
              <input type="file" accept=".json" onChange={handleImportCustom} className="hidden" />
            </label>

            {customPrompts.length > 0 && (
              <button
                type="button"
                onClick={handleExportCustom}
                title="ส่งออกคำสั่งของฉันเป็น JSON"
                className="px-2.5 py-1.5 rounded-xl border border-border bg-card hover:bg-muted text-xs font-semibold text-foreground transition-all cursor-pointer shadow-2xs flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="hidden sm:inline">ส่งออก</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setEditingCustomId(null);
                setCustomForm({
                  title: '',
                  category: 'character',
                  modes: ['single', 'multi'],
                  tags: '',
                  useWhen: '',
                  body: '',
                  isPublic: false,
                  authorName: userDisplayName,
                });
                setIsCustomModalOpen(true);
              }}
              className="px-3 py-1.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold transition-all cursor-pointer shadow-xs flex items-center gap-1.5 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>สร้างคำสั่งใหม่</span>
            </button>
          </div>
        </div>

        {/* Source Tabs: All | Official | Community | Mine | Custom */}
        <div className="flex items-center gap-1.5 border-b border-border/60 pb-2 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveSource('all')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeSource === 'all'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            <span>🌟 ทั้งหมด ({allAvailableEntries.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSource('official')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeSource === 'official'
                ? 'bg-rose-500 text-white shadow-xs'
                : 'bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            <span>🏛️ ทางการ ({officialEntries.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSource('community')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeSource === 'community'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>คลังสาธารณะชุมชน ({communityPrompts.length})</span>
          </button>

          {user && (
            <button
              type="button"
              onClick={() => setActiveSource('mine')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeSource === 'mine'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>ผลงานของฉัน</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setActiveSource('custom')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeSource === 'custom'
                ? 'bg-amber-500 text-zinc-950 shadow-xs'
                : 'bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>คำสั่งในเครื่อง ({customPrompts.length})</span>
          </button>
        </div>

        {/* Search Input & Quick Presets */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาชื่อคำสั่ง, เนื้อหา, กฎ, นามปากกาผู้สร้าง, หรือแท็ก..."
              className="w-full pl-9 pr-8 py-2 rounded-xl bg-card border border-border text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Quick Presets Bar */}
          {presets.length > 0 && (
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-none pb-1 sm:pb-0">
              <span className="text-[11px] font-bold text-muted-foreground flex items-center gap-1 flex-shrink-0">
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>พรีเซ็ต:</span>
              </span>
              {presets.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleApplyPreset(preset)}
                  title={preset.description}
                  className="px-2 py-1 rounded-lg text-[11px] font-semibold bg-muted/60 hover:bg-muted hover:text-primary text-foreground border border-border/80 transition-all whitespace-nowrap cursor-pointer shadow-2xs"
                >
                  {preset.title}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Categories Horizontal Scroll */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          <button
            type="button"
            onClick={() => setActiveCategory('all')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeCategory === 'all'
                ? 'bg-foreground text-background shadow-xs font-bold'
                : 'bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            หมวดทั้งหมด
          </button>
          {officialCategories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-foreground text-background shadow-xs font-bold'
                  : 'bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Warning & Conflict Banners */}
      {activeConflicts.length > 0 && (
        <div className="px-4 py-2 bg-rose-500/10 border-b border-rose-500/20 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
          <div>
            <span className="font-bold">ตรวจพบคำสั่งที่อาจขัดแย้งกัน: </span>
            <ul className="list-disc pl-4 mt-1 space-y-0.5 text-[11px]">
              {activeConflicts.map((c, i) => (
                <li key={i}>{c.itemA.title} ขัดแย้งกับ {c.itemB.title}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Main Grid Content */}
      <div className="flex-1 overflow-y-auto p-3.5 sm:p-5">
        {filteredEntries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
            <div className="w-12 h-12 rounded-2xl bg-muted/60 flex items-center justify-center mb-3 text-muted-foreground/60">
              <Search className="w-6 h-6" />
            </div>
            <p className="font-bold text-sm text-foreground">ไม่พบคำสั่งที่ตรงกับเงื่อนไข</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm">
              ลองเปลี่ยนคำค้นหา หรือกดปุ่ม "สร้างคำสั่งใหม่" เพื่อเพิ่มคำสั่งที่คุณต้องการ
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredEntries.map((entry) => {
              const isSelected = selectedIds.has(entry.id);
              const isOfficial = !entry.isCustom;
              const isPublicCommunity = entry.isPublic;
              const isMine =
                (user && entry.authorId === user.id) ||
                (entry.authorName && entry.authorName.toLowerCase() === userDisplayName.toLowerCase());

              return (
                <div
                  key={entry.id}
                  onClick={() => handleToggleSelect(entry.id)}
                  className={`group relative p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-primary/5 border-primary shadow-sm ring-1 ring-primary/40'
                      : 'bg-card border-border hover:border-primary/40 hover:shadow-xs'
                  }`}
                >
                  <div>
                    {/* Card Header */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleSelect(entry.id);
                          }}
                          className={`w-4 h-4 rounded flex items-center justify-center transition-colors flex-shrink-0 ${
                            isSelected
                              ? 'bg-primary text-primary-foreground'
                              : 'border border-border text-transparent hover:border-primary'
                          }`}
                        >
                          <Check className="w-3 h-3 stroke-[3]" />
                        </button>
                        <h3 className="font-bold text-xs sm:text-sm text-foreground truncate group-hover:text-primary transition-colors">
                          {entry.title}
                        </h3>
                      </div>

                      {/* Source & Privacy Badges */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {isOfficial ? (
                          <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20">
                            Official
                          </span>
                        ) : isPublicCommunity ? (
                          <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20 flex items-center gap-1">
                            <Globe className="w-2.5 h-2.5" />
                            Community
                          </span>
                        ) : (
                          <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 flex items-center gap-1">
                            <Lock className="w-2.5 h-2.5" />
                            Private
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Use When Description */}
                    <p className="text-[11px] text-muted-foreground line-clamp-2 mb-2.5 leading-relaxed">
                      {entry.useWhen}
                    </p>

                    {/* Author Info */}
                    {entry.authorName && (
                      <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium flex items-center gap-1 mb-2">
                        <Users className="w-3 h-3" />
                        <span>สร้างโดย: <strong>{entry.authorName}</strong></span>
                        {isMine && (
                          <span className="text-[9px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-1 py-0.2 rounded border border-emerald-500/20 font-bold ml-1">
                            (ผลงานของคุณ)
                          </span>
                        )}
                        {entry.likesCount ? (
                          <span className="text-muted-foreground ml-auto flex items-center gap-0.5">
                            <Heart className="w-2.5 h-2.5 text-rose-500 fill-rose-500" />
                            {entry.likesCount}
                          </span>
                        ) : null}
                      </div>
                    )}

                    {/* Tags */}
                    {entry.tags && entry.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2.5">
                        {entry.tags.slice(0, 3).map((tag, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] px-1.5 py-0.2 rounded bg-muted/60 text-muted-foreground border border-border/60"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Card Footer Actions */}
                  <div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs mt-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewEntry(entry);
                      }}
                      className="text-[11px] font-semibold text-muted-foreground hover:text-foreground transition-colors"
                    >
                      ดูตัวอย่าง
                    </button>

                    <div className="flex items-center gap-1">
                      {/* Share Button */}
                      <button
                        type="button"
                        onClick={(e) => handleSharePrompt(entry, e)}
                        title="แชร์ข้อความคำสั่งนี้"
                        className="p-1 rounded-md text-muted-foreground hover:text-indigo-500 hover:bg-indigo-500/10 transition-colors cursor-pointer"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Prompt Edit & Delete (for custom or own community prompt) */}
                      {(entry.isCustom || isMine) && (
                        <>
                          <button
                            type="button"
                            onClick={(e) => handleOpenEdit(entry, e)}
                            title="แก้ไขคำสั่ง"
                            className="p-1 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleDeletePrompt(entry, e)}
                            title="ลบคำสั่ง"
                            className="p-1 rounded-md text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}

                      {/* Copy Single Button */}
                      <button
                        type="button"
                        onClick={(e) => handleCopySingle(entry, e)}
                        title="คัดลอกคำสั่ง"
                        className="p-1.5 rounded-lg border border-border bg-card hover:bg-muted text-foreground transition-colors cursor-pointer"
                      >
                        {copiedId === entry.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom Sticky Action Bar */}
      <div className="p-3 sm:p-4 border-t border-border bg-muted/40 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={selectedIds.size === filteredEntries.length ? handleClearSelection : handleSelectAllFiltered}
            className="px-2.5 py-1.5 rounded-xl border border-border bg-card hover:bg-muted text-xs font-semibold text-foreground transition-all cursor-pointer shadow-2xs flex items-center gap-1.5"
          >
            {selectedIds.size === filteredEntries.length && filteredEntries.length > 0 ? (
              <>
                <Square className="w-3.5 h-3.5 text-muted-foreground" />
                <span>ยกเลิกการเลือกทั้งหมด</span>
              </>
            ) : (
              <>
                <CheckSquare className="w-3.5 h-3.5 text-primary" />
                <span>เลือกทั้งหมดในหมวดนี้ ({filteredEntries.length})</span>
              </>
            )}
          </button>

          {selectedIds.size > 0 && (
            <span className="text-xs font-bold text-foreground">
              เลือกแล้ว: <strong className="text-primary">{selectedIds.size}</strong> รายการ
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Copy Combined Prompt Button */}
          {selectedIds.size > 0 && (
            <button
              type="button"
              onClick={handleCopySelectedCombined}
              className="px-3 py-1.5 rounded-xl border border-border bg-card hover:bg-muted text-xs font-bold text-foreground transition-all cursor-pointer shadow-2xs flex items-center gap-1.5"
            >
              {copiedAll ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-primary" />}
              <span>คัดลอกที่เลือก ({selectedIds.size})</span>
            </button>
          )}

          {/* Apply to Workspace Button */}
          {onApplyToProject && (
            <button
              type="button"
              disabled={selectedIds.size === 0}
              onClick={handleApply}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95 ${
                selectedIds.size > 0
                  ? 'bg-primary hover:bg-primary/90 text-primary-foreground'
                  : 'bg-muted text-muted-foreground cursor-not-allowed opacity-50'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>นำเข้าสู่โปรเจกต์ ({selectedIds.size})</span>
            </button>
          )}

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl border border-border bg-card hover:bg-muted text-xs font-semibold text-foreground transition-all cursor-pointer"
            >
              ปิด
            </button>
          )}
        </div>
      </div>

      {/* Preview Single Prompt Modal */}
      {previewEntry && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
          <div className="w-full max-w-2xl bg-card border border-border rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between bg-muted/30">
              <div>
                <h3 className="font-bold text-sm sm:text-base text-foreground flex items-center gap-2">
                  <span>{previewEntry.title}</span>
                  {previewEntry.authorName && (
                    <span className="text-xs font-normal text-muted-foreground">
                      (โดย {previewEntry.authorName})
                    </span>
                  )}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">{previewEntry.useWhen}</p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewEntry(null)}
                className="w-7 h-7 rounded-lg border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>

            <div className="p-5 overflow-y-auto flex-1 font-mono text-xs leading-relaxed bg-muted/20 text-foreground whitespace-pre-wrap">
              {previewEntry.body}
            </div>

            <div className="px-5 py-3.5 border-t border-border flex items-center justify-between bg-muted/40">
              <div className="flex items-center gap-1.5">
                {previewEntry.tags.map((t, idx) => (
                  <span key={idx} className="text-[10px] px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
                    #{t}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCopySingle(previewEntry)}
                  className="px-3 py-1.5 rounded-xl border border-border bg-card hover:bg-muted text-xs font-semibold text-foreground flex items-center gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5 text-primary" />
                  <span>คัดลอกคำสั่ง</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleToggleSelect(previewEntry.id);
                    setPreviewEntry(null);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{selectedIds.has(previewEntry.id) ? 'ยกเลิกเลือก' : 'เลือกคำสั่งนี้'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Custom Prompt Modal */}
      {isCustomModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-card border border-border rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between bg-muted/30">
              <h3 className="font-bold text-sm sm:text-base text-foreground flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span>{editingCustomId ? 'แก้ไขคำสั่ง' : 'สร้างคำสั่งใหม่'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsCustomModalOpen(false)}
                className="w-7 h-7 rounded-lg border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>

            <div className="p-4 sm:p-5 overflow-y-auto space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-foreground mb-1">ชื่อคำสั่ง / Rule Title *</label>
                <input
                  type="text"
                  value={customForm.title}
                  onChange={(e) => setCustomForm({ ...customForm, title: e.target.value })}
                  placeholder="เช่น กฎการใช้สรรพนามโบราณ, กฎการต่อสู้กระชับ"
                  className="w-full px-3 py-2 rounded-xl bg-muted/50 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-foreground mb-1">หมวดหมู่</label>
                  <select
                    value={customForm.category}
                    onChange={(e) => setCustomForm({ ...customForm, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-muted/50 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                  >
                    {officialCategories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-foreground mb-1">แท็ก (คั่นด้วยจุลภาค ,)</label>
                  <input
                    type="text"
                    value={customForm.tags}
                    onChange={(e) => setCustomForm({ ...customForm, tags: e.target.value })}
                    placeholder="เช่น กำหนดเอง, บทสนทนา"
                    className="w-full px-3 py-2 rounded-xl bg-muted/50 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-foreground mb-1">สถานะการแชร์ / Privacy</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCustomForm({ ...customForm, isPublic: false })}
                    className={`p-2.5 rounded-xl border text-left flex items-start gap-2 transition-all cursor-pointer ${
                      !customForm.isPublic
                        ? 'bg-primary/10 border-primary text-foreground font-bold'
                        : 'bg-muted/40 border-border text-muted-foreground'
                    }`}
                  >
                    <Lock className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs">ส่วนตัว (Private)</div>
                      <div className="text-[10px] font-normal text-muted-foreground">เก็บในเครื่องของคุณเท่านั้น</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCustomForm({ ...customForm, isPublic: true })}
                    className={`p-2.5 rounded-xl border text-left flex items-start gap-2 transition-all cursor-pointer ${
                      customForm.isPublic
                        ? 'bg-indigo-500/10 border-indigo-500 text-foreground font-bold'
                        : 'bg-muted/40 border-border text-muted-foreground'
                    }`}
                  >
                    <Globe className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs">สาธารณะ (Public)</div>
                      <div className="text-[10px] font-normal text-muted-foreground">แชร์สู่คลังชุมชนให้ทุกคนใช้ได้</div>
                    </div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-foreground mb-1">
                  ชื่อผู้สร้าง / นามปากกา (Author Name)
                  {user ? <span className="text-emerald-500 text-[10px] ml-1.5 font-normal">(อิงจากบัญชีปัจจุบัน)</span> : null}
                </label>
                <input
                  type="text"
                  value={customForm.authorName}
                  onChange={(e) => setCustomForm({ ...customForm, authorName: e.target.value })}
                  placeholder="เช่น นามปากกาของคุณ หรือ ชื่อเล่น"
                  className="w-full px-3 py-2 rounded-xl bg-muted/50 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div>
                <label className="block font-bold text-foreground mb-1">คำอธิบายการใช้งาน / Use When</label>
                <input
                  type="text"
                  value={customForm.useWhen}
                  onChange={(e) => setCustomForm({ ...customForm, useWhen: e.target.value })}
                  placeholder="ใช้เมื่อใด เช่น เหมาะสำหรับแนวโรแมนติกคอมเมดี้..."
                  className="w-full px-3 py-2 rounded-xl bg-muted/50 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
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
            </div>

            <div className="px-5 py-3 border-t border-border flex items-center justify-end gap-2 bg-muted/30">
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
                className="px-4 py-1.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95"
              >
                {customForm.isPublic ? '🌐 บันทึก & แชร์สาธารณะ' : '💾 บันทึกคำสั่ง'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
