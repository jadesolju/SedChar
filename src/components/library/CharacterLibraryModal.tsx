'use client';
import React, { useState, useRef } from 'react';
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
} from 'lucide-react';

interface CharacterLibraryModalProps {
  currentCharacter: ThaiMasterCharacter;
  onLoadCharacter: (char: ThaiMasterCharacter) => void;
}

export function CharacterLibraryModal({ currentCharacter, onLoadCharacter }: CharacterLibraryModalProps) {
  const {
    isLibraryModalOpen,
    closeLibraryModal,
    savedCharacters,
    saveToLibrary,
    deleteFromLibrary,
    isLibraryLoading,
    shareCharacter,
  } = useAuth();

  const [saveTitle, setSaveTitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'list' | 'save'>('list');
  const [filterQuery, setFilterQuery] = useState('');
  const [selectedFlagFilter, setSelectedFlagFilter] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [inspectingCharacter, setInspectingCharacter] = useState<ThaiMasterCharacter | null>(null);

  // Sharing Dialog state
  const [sharingCharacterId, setSharingCharacterId] = useState<string | null>(null);
  const [sharePermission, setSharePermission] = useState<'read-only' | 'edit'>('read-only');
  const [generatedShareUrl, setGeneratedShareUrl] = useState<string | null>(null);
  const [generatedInstantUrl, setGeneratedInstantUrl] = useState<string | null>(null);
  const [shareCopiedCloud, setShareCopiedCloud] = useState(false);
  const [shareCopiedInstant, setShareCopiedInstant] = useState(false);
  const [isSharingLoading, setIsSharingLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isLibraryModalOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setImageUrl(event.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveCurrent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const title = saveTitle.trim() || currentCharacter.fullName || currentCharacter.nickname || 'ตัวละครของฉัน';
    const res = await saveToLibrary(currentCharacter, title, imageUrl);
    setIsSaving(false);
    if (res.success) {
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        setActiveTab('list');
      }, 1200);
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
    const char = savedCharacters.find(c => c.id === id);
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
              <h2 className="text-base font-bold text-foreground">
                คลังตัวละคร Cloud Library
              </h2>
              <p className="text-xs text-muted-foreground">
                บันทึก, จัดการ, แชร์ลิงก์ และนำกลับมาแก้ไขได้ทันที
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
                  <span className="text-[11px] font-semibold text-muted-foreground whitespace-nowrap">ธง:</span>
                  {['all', 'white', 'green', 'yellow', 'red', 'black'].map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setSelectedFlagFilter(f)}
                      className={`text-[11px] px-2.5 py-1 rounded-md transition-all cursor-pointer whitespace-nowrap font-medium ${
                        selectedFlagFilter === f
                          ? 'bg-primary/20 text-primary font-bold border border-primary/30'
                          : 'bg-muted text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {f === 'all' ? 'ทั้งหมด' : CHARACTER_FLAGS[f as CharacterFlagType]?.label || f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Character Cards Grid */}
              {isLibraryLoading ? (
                <div className="py-20 text-center text-muted-foreground space-y-2">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                  <div className="text-xs">กำลังโหลดคลังตัวละครจาก Cloud...</div>
                </div>
              ) : filteredCharacters.length === 0 ? (
                <div className="py-20 text-center border-2 border-dashed border-border rounded-2xl space-y-3">
                  <FolderOpen className="w-12 h-12 mx-auto text-muted-foreground/50" />
                  <div className="text-sm font-bold text-foreground">ยังไม่มีตัวละครในคลัง</div>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                    คุณสามารถบันทึกตัวละครที่สร้างไว้ลงคลัง เพื่อเปิดใช้งานภายหลัง หรือแชร์ให้เพื่อนๆ ได้
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('save')}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 text-white font-bold text-xs shadow-xs hover:from-rose-600 hover:to-pink-700 transition-all cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <FolderPlus className="w-3.5 h-3.5" />
                    <span>บันทึกตัวละครปัจจุบัน</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredCharacters.map((charRecord) => {
                    const flag = CHARACTER_FLAGS[charRecord.flag_type as CharacterFlagType] || CHARACTER_FLAGS.none;
                    return (
                      <div
                        key={charRecord.id}
                        className="p-4 rounded-xl border border-border bg-card/60 hover:border-primary/40 transition-all shadow-xs flex flex-col justify-between gap-3 group"
                      >
                        <div className="flex items-start gap-3">
                          {/* Avatar */}
                          <div className="w-12 h-12 rounded-xl bg-muted border border-border flex items-center justify-center flex-shrink-0 overflow-hidden relative">
                            {charRecord.image_url ? (
                              <img src={charRecord.image_url} alt={charRecord.title} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-base font-bold text-muted-foreground">
                                {(charRecord.nickname || charRecord.title || 'C')[0]?.toUpperCase()}
                              </span>
                            )}
                            {charRecord.is_shared && (
                              <span className="absolute bottom-0 right-0 text-[9px] bg-primary text-white px-1 rounded-tl font-bold" title="แชร์แล้ว">
                                SHARED
                              </span>
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <h3 className="text-xs font-bold text-foreground truncate">
                                {charRecord.title}
                              </h3>
                              <span className={`text-[10px] px-1.5 py-0.2 rounded border font-medium ${flag.badgeBg}`}>
                                {flag.label}
                              </span>
                            </div>

                            <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                              {charRecord.tagline || charRecord.nickname || '-'}
                            </p>

                            <div className="text-[10px] text-muted-foreground/80 mt-1 flex items-center gap-2">
                              <span>บันทึกเมื่อ: {new Date(charRecord.created_at).toLocaleDateString('th-TH')}</span>
                              {charRecord.is_shared && (
                                <span className="text-emerald-500 font-semibold">
                                  • สิทธิ์: {charRecord.share_permission === 'edit' ? 'แก้ไขได้' : 'อ่านอย่างเดียว'}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Card Actions Toolbar */}
                        <div className="pt-2 border-t border-border flex items-center justify-between gap-1 text-xs">
                          <button
                            type="button"
                            onClick={() => {
                              onLoadCharacter(charRecord.character_data);
                              closeLibraryModal();
                            }}
                            className="px-2.5 py-1 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-[11px] transition-all cursor-pointer flex items-center gap-1 shadow-xs"
                          >
                            <FileEdit className="w-3 h-3" />
                            <span>โหลดใช้งาน</span>
                          </button>

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
                              onClick={() => handleExportSingleJson(charRecord.character_data, charRecord.title)}
                              className="p-1.5 rounded-lg border border-border bg-card hover:bg-muted text-foreground text-[11px] transition-all cursor-pointer"
                              title="ดาวน์โหลด JSON สำรอง"
                            >
                              <Download className="w-3.5 h-3.5 text-amber-500" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleCopyMarkdown(charRecord.character_data, charRecord.id)}
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
                              onClick={() => deleteFromLibrary(charRecord.id)}
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
            <form onSubmit={handleSaveCurrent} className="max-w-xl mx-auto space-y-4 py-4">
              <div className="p-4 rounded-xl border border-border bg-muted/30 space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <h3 className="text-xs font-bold text-foreground">
                    บันทึกตัวละครปัจจุบันลงใน Cloud Library
                  </h3>
                </div>
                <p className="text-xs text-muted-foreground">
                  ข้อมูลทั้งหมดใน 10 หมวดหมู่จะถูกจัดเก็บลงฐานข้อมูล พร้อมให้คุณดึงกลับมาแก้ไข หรือแชร์ต่อได้ทันที
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">
                  ชื่อบันทึก / หัวข้อตัวละคร (Title)
                </label>
                <input
                  type="text"
                  value={saveTitle}
                  onChange={(e) => setSaveTitle(e.target.value)}
                  placeholder={currentCharacter.fullName || currentCharacter.nickname || 'เช่น มณีพราย (Ver.ไสยเวท)'}
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
                    {saveTitle || currentCharacter.fullName || currentCharacter.nickname || 'ตัวละครไม่มีชื่อ'}
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
                  className="px-5 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>กำลังบันทึก...</span>
                    </>
                  ) : saveSuccess ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-white" />
                      <span>บันทึกสำเร็จ!</span>
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
                    <h3 className="text-sm font-bold text-foreground">แชร์ตัวละคร (Share Character)</h3>
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
                      <span>อ่านอย่างเดียว (Read-only)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleChangePermission('edit')}
                      className={`p-2.5 rounded-xl border text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        sharePermission === 'edit'
                          ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400 shadow-xs'
                          : 'bg-muted/50 border-border text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <Unlock className="w-3.5 h-3.5" />
                      <span>อนุญาตให้แก้ไขได้ (Editable)</span>
                    </button>
                  </div>
                </div>

                {/* Link Option 1: Permanent Cloud Link */}
                <div className="space-y-1.5 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-primary" />
                      ลิงก์คลาวด์ถาวร (Cloud Share Link):
                    </span>
                    <span className="text-[10px] text-muted-foreground">เปิดดูได้ทุกอุปกรณ์</span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={generatedShareUrl || 'กำลังสร้างลิงก์...'}
                      className="flex-1 px-3 py-2 text-xs rounded-xl bg-muted/60 border border-border text-foreground font-mono select-all focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleCopyCloudUrl}
                      disabled={!generatedShareUrl}
                      className="px-3.5 py-2 rounded-xl bg-primary text-primary-foreground font-bold text-xs hover:bg-primary/90 transition-all cursor-pointer flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                    >
                      {shareCopiedCloud ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-white" />
                          <span>คัดลอกแล้ว</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-white" />
                          <span>คัดลอก</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Link Option 2: Universal Instant Compressed Link */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-amber-500" />
                      ลิงก์ด่วนแชร์ได้ทันที (Instant Compressed Link):
                    </span>
                    <span className="text-[10px] text-muted-foreground">บรรจุข้อมูลครบในลิงก์</span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={generatedInstantUrl || 'กำลังสร้างลิงก์...'}
                      className="flex-1 px-3 py-2 text-xs rounded-xl bg-muted/60 border border-border text-foreground font-mono select-all focus:outline-none truncate"
                    />
                    <button
                      type="button"
                      onClick={handleCopyInstantUrl}
                      disabled={!generatedInstantUrl}
                      className="px-3.5 py-2 rounded-xl bg-amber-600 text-white font-bold text-xs hover:bg-amber-700 transition-all cursor-pointer flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                    >
                      {shareCopiedInstant ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-white" />
                          <span>คัดลอกแล้ว</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-white" />
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
                    className="px-4 py-2 rounded-xl bg-muted hover:bg-muted/80 text-foreground text-xs font-medium cursor-pointer"
                  >
                    ปิดหน้าต่าง
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
