'use client';
import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import type { ThaiMasterCharacter, CharacterFlagType } from '@/shared/types';
import { CHARACTER_FLAGS } from '@/shared/types';
import { characterToFullMarkdown } from '@/shared/thaiTagParser';
import { exportCharacterJson } from '@/shared/shareUtils';
import {
  FolderOpen,
  FolderPlus,
  Search,
  Share2,
  Trash2,
  Copy,
  Check,
  Download,
  Sparkles,
  Save,
  X,
  Lock,
  Unlock,
  Globe,
  FileJson,
  Zap,
  Loader2,
  FileEdit,
  Eye,
  ExternalLink,
  RefreshCw,
  Layers,
  ArrowRight,
} from 'lucide-react';

interface CharacterLibraryModalProps {
  currentCharacter: ThaiMasterCharacter;
  onLoadCharacter: (char: ThaiMasterCharacter, id?: string, title?: string) => void;
  activeLibraryId?: string | null;
  setActiveLibraryId?: (id: string | null) => void;
}

export function CharacterLibraryModal({
  currentCharacter,
  onLoadCharacter,
  activeLibraryId,
  setActiveLibraryId,
}: CharacterLibraryModalProps) {
  const {
    isLibraryModalOpen,
    closeLibraryModal,
    savedCharacters,
    saveToLibrary,
    overwriteCharacterInLibrary,
    deleteFromLibrary,
    shareCharacter,
    activeLoadedCharacterId,
    setActiveLoadedCharacterId,
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'list' | 'save'>('list');
  const [filterQuery, setFilterQuery] = useState('');
  const [selectedFlagFilter, setSelectedFlagFilter] = useState<string>('all');

  // Save / Overwrite Form State
  const effectiveActiveId = activeLibraryId || activeLoadedCharacterId;
  const [saveMode, setSaveMode] = useState<'overwrite' | 'new'>(
    effectiveActiveId && savedCharacters.some((c) => c.id === effectiveActiveId)
      ? 'overwrite'
      : 'new'
  );
  const [targetOverwriteId, setTargetOverwriteId] = useState<string>(
    effectiveActiveId || (savedCharacters[0]?.id ?? '')
  );
  const [saveTitle, setSaveTitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Quick Overwrite State on Card List
  const [quickOverwritingId, setQuickOverwritingId] = useState<string | null>(null);
  const [quickOverwriteSuccessId, setQuickOverwriteSuccessId] = useState<string | null>(null);

  // Sharing State
  const [sharingCharacterId, setSharingCharacterId] = useState<string | null>(null);
  const [sharePermission, setSharePermission] = useState<'read-only' | 'edit'>('read-only');
  const [generatedShareUrl, setGeneratedShareUrl] = useState('');
  const [generatedInstantUrl, setGeneratedInstantUrl] = useState('');
  const [isSharingLoading, setIsSharingLoading] = useState(false);
  const [shareCopiedCloud, setShareCopiedCloud] = useState(false);
  const [shareCopiedInstant, setShareCopiedInstant] = useState(false);

  // Copy Feedback
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // File Upload Ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isLibraryModalOpen) {
      const currentActive = activeLibraryId || activeLoadedCharacterId;
      if (currentActive && savedCharacters.some((c) => c.id === currentActive)) {
        setSaveMode('overwrite');
        setTargetOverwriteId(currentActive);
        const match = savedCharacters.find((c) => c.id === currentActive);
        if (match) {
          setSaveTitle(match.title || currentCharacter.fullName || currentCharacter.nickname || '');
          setImageUrl(match.image_url || '');
        }
      } else {
        setSaveMode('new');
        setSaveTitle(currentCharacter.fullName || currentCharacter.nickname || '');
        if (savedCharacters.length > 0) {
          if (savedCharacters[0]?.id) setTargetOverwriteId(savedCharacters[0].id);
        }
      }
    }
  }, [isLibraryModalOpen, activeLibraryId, activeLoadedCharacterId, savedCharacters, currentCharacter]);

  if (!isLibraryModalOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('ขนาดไฟล์รูปภาพเกิน 2MB กรุณาใช้รูปภาพขนาดเล็กกว่านี้ หรือใส่ URL');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setImageUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveCurrent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const title =
      saveTitle.trim() || currentCharacter.fullName || currentCharacter.nickname || 'ตัวละครของฉัน';

    let res: { success: boolean; error?: string };

    if (saveMode === 'overwrite' && targetOverwriteId) {
      res = await overwriteCharacterInLibrary(targetOverwriteId, currentCharacter, title, imageUrl);
      if (setActiveLibraryId) setActiveLibraryId(targetOverwriteId);
      setActiveLoadedCharacterId(targetOverwriteId);
    } else {
      res = await saveToLibrary(currentCharacter, title, imageUrl);
    }

    setIsSaving(false);
    if (res.success) {
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        setActiveTab('list');
      }, 1000);
    } else {
      alert(res.error || 'เกิดข้อผิดพลาดในการบันทึก');
    }
  };

  const handleQuickOverwriteCard = async (targetId: string, targetTitle: string) => {
    if (
      !window.confirm(
        `ต้องการบันทึกทับตัวละคร "${targetTitle}" ด้วยข้อมูลปัจจุบันในตัวแก้ไขหรือไม่?\n(ข้อมูลเดิมจะถูกอัปเดตเป็นตัวปัจจุบัน)`
      )
    ) {
      return;
    }

    setQuickOverwritingId(targetId);
    const res = await overwriteCharacterInLibrary(targetId, currentCharacter);
    setQuickOverwritingId(null);

    if (res.success) {
      if (setActiveLibraryId) setActiveLibraryId(targetId);
      setActiveLoadedCharacterId(targetId);
      setQuickOverwriteSuccessId(targetId);
      setTimeout(() => {
        setQuickOverwriteSuccessId(null);
      }, 2000);
    } else {
      alert(res.error || 'บันทึกทับไม่สำเร็จ');
    }
  };

  const handleCopyMarkdown = async (char: ThaiMasterCharacter, id: string) => {
    const md = characterToFullMarkdown(char);
    try {
      await navigator.clipboard.writeText(md);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {}
  };

  const handleOpenShare = async (id: string) => {
    const char = savedCharacters.find((c) => c.id === id);
    setSharingCharacterId(id);
    const defaultPerm = char?.share_permission || 'read-only';
    setSharePermission(defaultPerm);
    setIsSharingLoading(true);
    try {
      const res = await shareCharacter(id, defaultPerm);
      setGeneratedShareUrl(res.shareUrl);
      setGeneratedInstantUrl(res.instantUrl);
    } finally {
      setIsSharingLoading(false);
      setShareCopiedCloud(false);
      setShareCopiedInstant(false);
    }
  };

  const handleChangePermission = async (perm: 'read-only' | 'edit') => {
    setSharePermission(perm);
    if (sharingCharacterId) {
      setIsSharingLoading(true);
      try {
        const res = await shareCharacter(sharingCharacterId, perm);
        setGeneratedShareUrl(res.shareUrl);
        setGeneratedInstantUrl(res.instantUrl);
      } finally {
        setIsSharingLoading(false);
        setShareCopiedCloud(false);
        setShareCopiedInstant(false);
      }
    }
  };

  const handleCopyCloudUrl = async () => {
    if (!generatedShareUrl) return;
    try {
      await navigator.clipboard.writeText(generatedShareUrl);
      setShareCopiedCloud(true);
      setTimeout(() => setShareCopiedCloud(false), 2000);
    } catch {}
  };

  const handleCopyInstantUrl = async () => {
    if (!generatedInstantUrl) return;
    try {
      await navigator.clipboard.writeText(generatedInstantUrl);
      setShareCopiedInstant(true);
      setTimeout(() => setShareCopiedInstant(false), 2000);
    } catch {}
  };

  const handleExportSingleJson = (char: ThaiMasterCharacter, title: string) => {
    exportCharacterJson(char, title);
  };

  const filteredCharacters = savedCharacters.filter((c) => {
    const matchesQuery =
      c.title.toLowerCase().includes(filterQuery.toLowerCase()) ||
      c.nickname.toLowerCase().includes(filterQuery.toLowerCase()) ||
      c.tagline.toLowerCase().includes(filterQuery.toLowerCase());
    const matchesFlag = selectedFlagFilter === 'all' || c.flag_type === selectedFlagFilter;
    return matchesQuery && matchesFlag;
  });

  const activeLoadedRecord = savedCharacters.find(
    (c) => c.id === (activeLibraryId || activeLoadedCharacterId)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl h-[90vh] flex flex-col bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
        {/* Top Header */}
        <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-500 to-pink-600 text-white flex items-center justify-center font-bold text-base shadow-sm">
              <FolderOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-foreground">
                  คลังตัวละคร Cloud Library
                </h2>
                {activeLoadedRecord && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    เชื่อมกับ: {activeLoadedRecord.title}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                บันทึกทับตัวเดิม, สร้างตัวใหม่, จัดการแชร์ และนำกลับมาแก้ไขได้ทันที
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex rounded-lg bg-muted p-0.5 border border-border">
              <button
                type="button"
                onClick={() => setActiveTab('list')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'list'
                    ? 'bg-card text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <FolderOpen className="w-3.5 h-3.5 text-primary" />
                <span>รายการตัวละคร ({savedCharacters.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('save')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'save'
                    ? 'bg-card text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <FolderPlus className="w-3.5 h-3.5 text-emerald-500" />
                <span>บันทึกตัวละครปัจจุบัน</span>
              </button>
            </div>

            <button
              type="button"
              onClick={closeLibraryModal}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-background relative">
          {/* TAB 1: LIST CHARACTERS */}
          {activeTab === 'list' && (
            <div className="space-y-4">
              {/* Search & Filter Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-muted-foreground" />
                  <input
                    type="text"
                    value={filterQuery}
                    onChange={(e) => setFilterQuery(e.target.value)}
                    placeholder="ค้นหาชื่อตัวละคร, ฉายา, หรือรายละเอียด..."
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-muted/50 border border-border text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                  <span className="text-[11px] font-semibold text-muted-foreground whitespace-nowrap">
                    ธง:
                  </span>
                  {['all', 'white', 'green', 'yellow', 'red', 'black'].map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setSelectedFlagFilter(f)}
                      className={`px-2 py-1 rounded-lg text-[11px] font-semibold capitalize transition-all cursor-pointer ${
                        selectedFlagFilter === f
                          ? 'bg-primary text-primary-foreground shadow-xs'
                          : 'bg-muted/60 text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      {f === 'all' ? 'ทั้งหมด' : f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Character List Grid */}
              {filteredCharacters.length === 0 ? (
                <div className="text-center py-16 px-4 rounded-2xl border border-dashed border-border bg-muted/20">
                  <FolderOpen className="w-12 h-12 mx-auto text-muted-foreground/40 mb-3" />
                  <p className="text-sm font-semibold text-foreground">ยังไม่มีตัวละครในคลัง</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    เริ่มบันทึกตัวละครของคุณเพื่อนำมาแก้ไข หรือแชร์ลิงก์ได้ทันที
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('save')}
                    className="mt-4 px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold transition-all shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <FolderPlus className="w-4 h-4" />
                    <span>บันทึกตัวละครนี้ลงคลัง</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {filteredCharacters.map((charRecord) => {
                    const flagKey = (charRecord.flag_type || 'none') as CharacterFlagType;
                    const flag = CHARACTER_FLAGS[flagKey] || CHARACTER_FLAGS.none;
                    const isCurrentlyActive =
                      charRecord.id === (activeLibraryId || activeLoadedCharacterId);

                    return (
                      <div
                        key={charRecord.id}
                        className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 relative overflow-hidden group ${
                          isCurrentlyActive
                            ? 'bg-card border-primary/60 shadow-md ring-1 ring-primary/30'
                            : 'bg-card/70 border-border hover:border-primary/40 hover:shadow-sm'
                        }`}
                      >
                        {isCurrentlyActive && (
                          <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[9px] font-bold px-2.5 py-0.5 rounded-bl-lg flex items-center gap-1">
                            <span className="w-1 h-1 rounded-full bg-white animate-ping" />
                            ตัวที่กำลังแก้ไขอยู่
                          </div>
                        )}

                        <div className="flex items-start gap-3">
                          {/* Avatar Thumbnail */}
                          <div className="w-12 h-12 rounded-xl bg-muted border border-border flex items-center justify-center overflow-hidden flex-shrink-0">
                            {charRecord.image_url ? (
                              <img
                                src={charRecord.image_url}
                                alt={charRecord.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-base font-bold text-muted-foreground">
                                {(charRecord.title || charRecord.nickname || 'C')[0]?.toUpperCase()}
                              </span>
                            )}
                          </div>

                          {/* Character Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-xs font-bold text-foreground truncate">
                                {charRecord.title}
                              </h3>
                              <span
                                className={`text-[10px] px-1.5 py-0.2 rounded border font-medium ${flag.badgeBg}`}
                              >
                                {flag.label}
                              </span>
                            </div>

                            <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                              {charRecord.tagline || charRecord.nickname || '-'}
                            </p>

                            <div className="text-[10px] text-muted-foreground/80 mt-1 flex items-center gap-2">
                              <span>
                                อัปเดตเมื่อ: {new Date(charRecord.updated_at || charRecord.created_at).toLocaleDateString('th-TH')}
                              </span>
                              {charRecord.is_shared && (
                                <span className="text-emerald-500 font-semibold">
                                  • สิทธิ์: {charRecord.share_permission === 'edit' ? 'แก้ไขได้' : 'อ่านอย่างเดียว'}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Card Actions Toolbar */}
                        <div className="pt-2 border-t border-border flex items-center justify-between gap-1 text-xs flex-wrap">
                          <div className="flex items-center gap-1.5">
                            {/* Load into Editor Button */}
                            <button
                              type="button"
                              onClick={() => {
                                onLoadCharacter(
                                  charRecord.character_data,
                                  charRecord.id,
                                  charRecord.title
                                );
                                if (setActiveLibraryId) setActiveLibraryId(charRecord.id);
                                setActiveLoadedCharacterId(charRecord.id);
                                closeLibraryModal();
                              }}
                              className="px-2.5 py-1 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-[11px] transition-all cursor-pointer flex items-center gap-1 shadow-xs"
                            >
                              <FileEdit className="w-3 h-3" />
                              <span>โหลดใช้งาน</span>
                            </button>

                            {/* Direct Quick Overwrite Button */}
                            <button
                              type="button"
                              onClick={() =>
                                handleQuickOverwriteCard(charRecord.id, charRecord.title)
                              }
                              disabled={quickOverwritingId === charRecord.id}
                              title="บันทึกทับตัวละครนี้ด้วยข้อมูลที่กำลังแก้อยู่ในหน้าหลัก"
                              className={`px-2 py-1 rounded-lg border text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                                quickOverwriteSuccessId === charRecord.id
                                  ? 'bg-emerald-500 text-white border-emerald-500'
                                  : 'border-border bg-card hover:bg-muted text-foreground hover:border-primary/50'
                              }`}
                            >
                              {quickOverwritingId === charRecord.id ? (
                                <Loader2 className="w-3 h-3 animate-spin text-primary" />
                              ) : quickOverwriteSuccessId === charRecord.id ? (
                                <>
                                  <Check className="w-3 h-3 text-white" />
                                  <span>บันทึกทับแล้ว!</span>
                                </>
                              ) : (
                                <>
                                  <Save className="w-3 h-3 text-amber-500" />
                                  <span>บันทึกทับตัวนี้</span>
                                </>
                              )}
                            </button>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleOpenShare(charRecord.id)}
                              className="p-1.5 rounded-lg border border-border bg-card hover:bg-muted text-foreground text-[11px] transition-all cursor-pointer flex items-center gap-1"
                              title="แชร์ตัวละครนี้"
                            >
                              <Share2 className="w-3.5 h-3.5 text-primary" />
                              <span className="hidden sm:inline">แชร์</span>
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleExportSingleJson(charRecord.character_data, charRecord.title)
                              }
                              className="p-1.5 rounded-lg border border-border bg-card hover:bg-muted text-foreground text-[11px] transition-all cursor-pointer"
                              title="ดาวน์โหลด JSON สำรอง"
                            >
                              <Download className="w-3.5 h-3.5 text-amber-500" />
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleCopyMarkdown(charRecord.character_data, charRecord.id)
                              }
                              className="p-1.5 rounded-lg border border-border bg-card hover:bg-muted text-foreground text-[11px] transition-all cursor-pointer"
                              title="คัดลอก Master Markdown"
                            >
                              {copiedId === charRecord.id ? (
                                <Check className="w-3.5 h-3.5 text-emerald-500" />
                              ) : (
                                <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                if (
                                  window.confirm(
                                    `คุณต้องการลบตัวละคร "${charRecord.title}" ออกจากคลังใช่หรือไม่?`
                                  )
                                ) {
                                  deleteFromLibrary(charRecord.id);
                                }
                              }}
                              className="p-1.5 rounded-lg hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 text-[11px] transition-all cursor-pointer"
                              title="ลบตัวละครนี้ออกจากคลัง"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SAVE CURRENT CHARACTER */}
          {activeTab === 'save' && (
            <form onSubmit={handleSaveCurrent} className="max-w-xl mx-auto space-y-4 py-3">
              {/* Save Mode Selector */}
              {savedCharacters.length > 0 && (
                <div className="p-1 rounded-xl bg-muted/80 border border-border grid grid-cols-2 gap-1">
                  <button
                    type="button"
                    onClick={() => setSaveMode('overwrite')}
                    className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      saveMode === 'overwrite'
                        ? 'bg-card text-foreground shadow-xs border border-border/80'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-amber-500" />
                    <span>บันทึกทับตัวเดิม (อัปเดต)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSaveMode('new')}
                    className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      saveMode === 'new'
                        ? 'bg-card text-foreground shadow-xs border border-border/80'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <FolderPlus className="w-3.5 h-3.5 text-emerald-500" />
                    <span>บันทึกเป็นตัวใหม่ (สร้างสำเนา)</span>
                  </button>
                </div>
              )}

              {saveMode === 'overwrite' && savedCharacters.length > 0 ? (
                <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 space-y-3">
                  <div className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 text-amber-500" />
                    <h3 className="text-xs font-bold text-foreground">
                      เลือกตัวละครที่ต้องการบันทึกทับ (Overwrite Target)
                    </h3>
                  </div>
                  <select
                    value={targetOverwriteId}
                    onChange={(e) => {
                      setTargetOverwriteId(e.target.value);
                      const match = savedCharacters.find((c) => c.id === e.target.value);
                      if (match) {
                        setSaveTitle(match.title);
                        setImageUrl(match.image_url || '');
                      }
                    }}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-card border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  >
                    {savedCharacters.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title} ({c.nickname || 'ตัวละคร'}) — อัปเดตล่าสุด:{' '}
                        {new Date(c.updated_at || c.created_at).toLocaleDateString('th-TH')}
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-muted-foreground">
                    💡 ข้อมูลทั้งหมดของตัวละครที่เลือกจะถูกอัปเดตเป็นข้อมูลล่าสุดจากตัวแก้ไขทันที ไม่ต้องลบตัวเก่าทิ้ง
                  </p>
                </div>
              ) : (
                <div className="p-4 rounded-xl border border-border bg-muted/30 space-y-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <h3 className="text-xs font-bold text-foreground">
                      บันทึกเป็นตัวละครใหม่ใน Cloud Library
                    </h3>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    ข้อมูลทั้งหมดใน 10 หมวดหมู่ + Garage Storage จะถูกจัดเก็บลงฐานข้อมูล เป็นตัวละครใหม่
                  </p>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">
                  ชื่อบันทึก / หัวข้อตัวละคร (Title)
                </label>
                <input
                  type="text"
                  value={saveTitle}
                  onChange={(e) => setSaveTitle(e.target.value)}
                  placeholder={
                    currentCharacter.fullName ||
                    currentCharacter.nickname ||
                    'เช่น มณีพราย (Ver.ไสยเวท)'
                  }
                  className="w-full px-3 py-2 text-xs rounded-xl bg-muted/50 border border-border text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">
                  รูปโปรไฟล์ตัวละคร (Image URL หรืออัปโหลด)
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://example.com/avatar.jpg"
                    className="flex-1 px-3 py-2 text-xs rounded-xl bg-muted/50 border border-border text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-2 text-xs rounded-xl border border-border bg-muted hover:bg-muted/80 text-foreground font-semibold cursor-pointer whitespace-nowrap flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>เลือกรูป</span>
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
              </div>

              {/* Preview Box */}
              <div className="p-3 rounded-xl border border-border bg-card flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-muted border border-border flex items-center justify-center overflow-hidden flex-shrink-0">
                  {imageUrl ? (
                    <img src={imageUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-base font-bold text-muted-foreground">
                      {(saveTitle || currentCharacter.nickname || 'C')[0]?.toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-foreground truncate">
                    {saveTitle ||
                      currentCharacter.fullName ||
                      currentCharacter.nickname ||
                      'ตัวละครไม่มีชื่อ'}
                  </div>
                  <div className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                    {currentCharacter.punchline || currentCharacter.shortIntro || '-'}
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('list')}
                  className="px-4 py-2 rounded-xl border border-border bg-card hover:bg-muted text-foreground text-xs font-medium cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className={`px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5 disabled:opacity-50 ${
                    saveMode === 'overwrite'
                      ? 'bg-amber-500 hover:bg-amber-600 text-white'
                      : 'bg-primary hover:bg-primary/90 text-primary-foreground'
                  }`}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>กำลังบันทึก...</span>
                    </>
                  ) : saveSuccess ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-white" />
                      <span>
                        {saveMode === 'overwrite' ? 'บันทึกทับสำเร็จ!' : 'บันทึกสำเร็จ!'}
                      </span>
                    </>
                  ) : saveMode === 'overwrite' ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>บันทึกทับตัวละครเดิม</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>บันทึกตัวละครลงคลัง</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* =========================================================================
              SHARING MODAL DIALOG (Cloud Link + Instant Link + JSON)
          ========================================================================= */}
          {sharingCharacterId && (
            <div className="absolute inset-0 z-20 bg-background/95 backdrop-blur-md p-6 flex flex-col justify-center max-w-xl mx-auto animate-in fade-in zoom-in-95 duration-150">
              <div className="p-5 rounded-2xl border border-border bg-card shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-border">
                  <div className="flex items-center gap-2">
                    <Share2 className="w-4 h-4 text-primary" />
                    <h3 className="text-sm font-bold text-foreground">
                      แชร์ตัวละคร (Share Character)
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSharingCharacterId(null)}
                    className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Permission Toggle */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">
                    กำหนดสิทธิ์สำหรับผู้ที่เปิดลิงก์:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleChangePermission('read-only')}
                      className={`p-2.5 rounded-xl border text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        sharePermission === 'read-only'
                          ? 'bg-primary/10 border-primary text-primary shadow-xs'
                          : 'bg-muted/50 border-border text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>อ่านอย่างเดียว (Read-Only)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleChangePermission('edit')}
                      className={`p-2.5 rounded-xl border text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        sharePermission === 'edit'
                          ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500 shadow-xs'
                          : 'bg-muted/50 border-border text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <Unlock className="w-3.5 h-3.5" />
                      <span>อนุญาตให้แก้ไข (Can Edit)</span>
                    </button>
                  </div>
                </div>

                {/* Option A: Cloud URL */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-primary" />
                      <span>1. Cloud Share URL (ลิงก์สั้น)</span>
                    </span>
                    <span className="text-[10px] text-muted-foreground">แนะนำ</span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={generatedShareUrl}
                      className="flex-1 px-3 py-2 text-xs rounded-xl bg-muted/70 border border-border text-foreground font-mono truncate focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleCopyCloudUrl}
                      className="px-3.5 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 shadow-xs whitespace-nowrap"
                    >
                      {shareCopiedCloud ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>คัดลอกแล้ว</span>
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

                {/* Option B: Instant URL */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-amber-500" />
                      <span>2. Instant Share URL (ลิงก์ออฟไลน์)</span>
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={generatedInstantUrl}
                      className="flex-1 px-3 py-2 text-xs rounded-xl bg-muted/70 border border-border text-foreground font-mono truncate focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleCopyInstantUrl}
                      className="px-3.5 py-2 rounded-xl border border-border bg-card hover:bg-muted text-foreground text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 whitespace-nowrap"
                    >
                      {shareCopiedInstant ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          <span>คัดลอกแล้ว</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                          <span>คัดลอก</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setSharingCharacterId(null)}
                    className="px-4 py-2 rounded-xl border border-border bg-card hover:bg-muted text-foreground text-xs font-semibold cursor-pointer"
                  >
                    ปิดหน้าต่างแชร์
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
