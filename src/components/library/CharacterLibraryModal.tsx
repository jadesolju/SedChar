'use client';
import React, { useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import type { ThaiMasterCharacter, CharacterFlagType } from '@/shared/types';
import { CHARACTER_FLAGS } from '@/shared/types';
import { characterToFullMarkdown } from '@/shared/thaiTagParser';

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
  const [shareCopied, setShareCopied] = useState(false);

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

  const handleOpenShare = (id: string) => {
    const char = savedCharacters.find(c => c.id === id);
    setSharingCharacterId(id);
    const defaultPerm = char?.share_permission || 'read-only';
    setSharePermission(defaultPerm);
    const { shareUrl } = shareCharacter(id, defaultPerm);
    setGeneratedShareUrl(shareUrl);
    setShareCopied(false);
  };

  const handleChangePermission = (perm: 'read-only' | 'edit') => {
    setSharePermission(perm);
    if (sharingCharacterId) {
      const { shareUrl } = shareCharacter(sharingCharacterId, perm);
      setGeneratedShareUrl(shareUrl);
      setShareCopied(false);
    }
  };

  const handleCopyShareUrl = async () => {
    if (!generatedShareUrl) return;
    try {
      await navigator.clipboard.writeText(generatedShareUrl);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    } catch {}
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
              📚
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">
                คลังตัวละครของฉัน (Character Library)
              </h2>
              <p className="text-xs text-muted-foreground">
                บันทึก, จัดการ, แชร์ลิงก์ (Read-only / Edit) และนำกลับมาใช้งานได้ทันที
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex rounded-lg bg-muted p-0.5 border border-border">
              <button
                type="button"
                onClick={() => setActiveTab('list')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'list'
                    ? 'bg-card text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                รายการตัวละคร ({savedCharacters.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('save')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'save'
                    ? 'bg-card text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                + บันทึกตัวละครปัจจุบัน
              </button>
            </div>

            <button
              type="button"
              onClick={closeLibraryModal}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              ✕
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
                  <span className="absolute left-3 top-2.5 text-xs text-muted-foreground">🔍</span>
                  <input
                    type="text"
                    value={filterQuery}
                    onChange={(e) => setFilterQuery(e.target.value)}
                    placeholder="ค้นหาชื่อตัวละคร, ฉายา, หรือรายละเอียด..."
                    className="w-full pl-8 pr-3 py-2 text-xs rounded-xl bg-[#1F1F24] border border-border text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                  <span className="text-[11px] font-semibold text-muted-foreground whitespace-nowrap">ธง:</span>
                  {['all', 'white', 'green', 'yellow', 'red', 'black'].map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setSelectedFlagFilter(f)}
                      className={`text-[11px] px-2 py-1 rounded-md transition-all cursor-pointer whitespace-nowrap ${
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
                  <div className="text-3xl animate-spin">⏳</div>
                  <div className="text-xs">กำลังโหลดคลังตัวละคร...</div>
                </div>
              ) : filteredCharacters.length === 0 ? (
                <div className="py-20 text-center border-2 border-dashed border-border rounded-2xl space-y-3">
                  <div className="text-4xl">📁</div>
                  <div className="text-sm font-bold text-foreground">ยังไม่มีตัวละครในคลัง</div>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                    คุณสามารถบันทึกตัวละครที่สร้างไว้ลงคลัง เพื่อเปิดใช้งานภายหลัง หรือแชร์ให้เพื่อนๆ ได้
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('save')}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 text-white font-bold text-xs shadow-xs hover:from-rose-600 hover:to-pink-700 transition-all cursor-pointer"
                  >
                    + บันทึกตัวละครปัจจุบัน
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredCharacters.map((charRecord) => {
                    const charData = charRecord.character_data;
                    const flagInfo = CHARACTER_FLAGS[charRecord.flag_type as CharacterFlagType] || CHARACTER_FLAGS.none;

                    return (
                      <div
                        key={charRecord.id}
                        className="group flex flex-col justify-between p-4 rounded-xl bg-card border border-border hover:border-primary/50 shadow-xs hover:shadow-md transition-all space-y-3"
                      >
                        <div className="flex items-start gap-3">
                          {/* Avatar */}
                          <div className="w-14 h-14 rounded-xl overflow-hidden bg-muted flex-shrink-0 border border-border flex items-center justify-center relative">
                            {charRecord.image_url ? (
                              <img
                                src={charRecord.image_url}
                                alt={charRecord.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-2xl">👤</span>
                            )}
                            {charRecord.is_shared && (
                              <span className="absolute bottom-0 right-0 text-[10px] bg-primary text-white px-1 rounded-tl font-bold" title="แชร์แล้ว">
                                🔗
                              </span>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <h3 className="text-sm font-bold text-foreground truncate">
                                {charRecord.title}
                              </h3>
                              <span
                                className={`text-[10px] px-1.5 py-0.5 rounded font-bold border ${flagInfo.badgeBg}`}
                                title={flagInfo.description}
                              >
                                {flagInfo.emoji} {flagInfo.label}
                              </span>
                            </div>

                            <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                              {charRecord.tagline || charData.occupation || charData.appearanceDesc || 'ไม่มีคำโปรย'}
                            </p>

                            <div className="text-[10px] text-muted-foreground/70 mt-1 flex items-center gap-2">
                              <span>📅 {new Date(charRecord.updated_at).toLocaleDateString('th-TH')}</span>
                              {charRecord.is_shared && (
                                <span className="text-emerald-500 font-semibold">
                                  • สิทธิ์: {charRecord.share_permission === 'edit' ? '✏️ Edit' : '🔒 Read-only'}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="pt-2 border-t border-border flex items-center justify-between gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              onLoadCharacter(charData);
                              closeLibraryModal();
                            }}
                            className="flex-1 py-1.5 px-3 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary font-bold text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <span>📥</span> โหลดเข้าฟอร์ม
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenShare(charRecord.id)}
                            className="py-1.5 px-2.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 font-semibold text-xs transition-colors flex items-center gap-1 cursor-pointer"
                            title="แชร์ตัวละครนี้ (เลือก Read-only หรือ Edit)"
                          >
                            <span>🔗</span> แชร์
                          </button>

                          <button
                            type="button"
                            onClick={() => handleCopyMarkdown(charData, charRecord.id)}
                            className="py-1.5 px-2 rounded-lg bg-muted hover:bg-muted/80 text-foreground text-xs transition-colors cursor-pointer"
                            title="คัดลอก Master Markdown"
                          >
                            {copiedId === charRecord.id ? '✓' : '📋'}
                          </button>

                          <button
                            type="button"
                            onClick={() => setInspectingCharacter(charData)}
                            className="py-1.5 px-2 rounded-lg bg-muted hover:bg-muted/80 text-foreground text-xs transition-colors cursor-pointer"
                            title="ดูรายละเอียดฉบับเต็ม"
                          >
                            👁️
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`คุณต้องการลบ "${charRecord.title}" ออกจากคลังใช่หรือไม่?`)) {
                                deleteFromLibrary(charRecord.id);
                              }
                            }}
                            className="py-1.5 px-2 rounded-lg hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 text-xs transition-colors cursor-pointer"
                            title="ลบตัวละคร"
                          >
                            🗑️
                          </button>
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
            <form onSubmit={handleSaveCurrent} className="max-w-xl mx-auto space-y-5">
              <div className="p-4 rounded-xl bg-muted/30 border border-border space-y-2">
                <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <span>💾</span> บันทึกตัวละครปัจจุบันลงในคลังของคุณ
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  ข้อมูลทั้งหมดใน 10 หมวดหมู่จะถูกจัดเก็บลงฐานข้อมูล พร้อมให้คุณดึงกลับมาแก้ไข หรือแชร์ต่อได้ทันที
                </p>
              </div>

              {/* Character Snapshot */}
              <div className="p-3.5 rounded-xl bg-card border border-border flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-muted border border-border flex items-center justify-center flex-shrink-0 text-xl overflow-hidden">
                  {imageUrl ? <img src={imageUrl} alt="preview" className="w-full h-full object-cover" /> : '👤'}
                </div>
                <div>
                  <div className="text-xs font-bold text-foreground">
                    {currentCharacter.fullName || currentCharacter.nickname || 'ตัวละครใหม่'}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    {currentCharacter.occupation || 'ไม่ได้ระบุอาชีพ'} • อายุ {currentCharacter.age || '-'}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">
                  ชื่อบันทึกในคลัง (Title):
                </label>
                <input
                  type="text"
                  required
                  value={saveTitle}
                  onChange={(e) => setSaveTitle(e.target.value)}
                  placeholder="เช่น: ฮิคารุ (CEO ซึนเดเระ ver.1)"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#1F1F24] border border-border text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              {/* Image URL or File Upload */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-foreground">
                  รูปภาพตัวละคร (Image URL หรือ อัปโหลด):
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://... หรือวาง Data URL"
                    className="flex-1 px-3.5 py-2 text-xs rounded-xl bg-[#1F1F24] border border-border text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-2 rounded-xl bg-muted hover:bg-muted/80 text-foreground text-xs font-medium border border-border transition-colors cursor-pointer whitespace-nowrap"
                  >
                    📁 อัปโหลดรูป
                  </button>
                </div>
              </div>

              {saveSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-500 text-xs font-bold text-center">
                  ✓ บันทึกลงคลังเรียบร้อยแล้ว!
                </div>
              )}

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('list')}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-bold text-xs shadow-md transition-all active:scale-98 cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  <span>{isSaving ? '⏳' : '💾'}</span>
                  <span>{isSaving ? 'กำลังบันทึก...' : 'บันทึกเข้าคลัง (Save)'}</span>
                </button>
              </div>
            </form>
          )}

          {/* POPUP: SHARING MODAL WITH PERMISSION DROPDOWN */}
          {sharingCharacterId && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
              <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl p-5 space-y-4 animate-in zoom-in-95">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🔗</span>
                    <h3 className="text-sm font-bold text-foreground">แชร์ตัวละคร (Share Character)</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSharingCharacterId(null)}
                    className="text-xs text-muted-foreground hover:text-foreground p-1 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  {/* Permission Dropdown Selector */}
                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1">
                      เลือกระดับสิทธิ์การเข้าถึง (Access Permission):
                    </label>
                    <select
                      value={sharePermission}
                      onChange={(e) => handleChangePermission(e.target.value as 'read-only' | 'edit')}
                      className="w-full p-2.5 rounded-xl bg-[#1F1F24] border border-border text-foreground font-medium text-xs focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
                    >
                      <option value="read-only">🔒 Read-only — ดู, คัดลอก และ Export ได้อย่างเดียว (ห้ามแก้ไข)</option>
                      <option value="edit">✏️ Edit — อนุญาตให้ผู้รับแก้ไขและบันทึกข้อมูลได้</option>
                    </select>
                  </div>

                  <div className="p-3 rounded-xl bg-muted/40 border border-border text-[11px] text-muted-foreground">
                    {sharePermission === 'read-only' ? (
                      <p>
                        💡 <strong>โหมดอ่านอย่างเดียว:</strong> ผู้รับลิงก์สามารถดูรายละเอียด สลับแท็บแพลตฟอร์ม และคัดลอกไปเป็นตัวละครใหม่ของตนเองได้ แต่จะไม่สามารถเขียนทับข้อมูลของคุณ
                      </p>
                    ) : (
                      <p>
                        ⚠️ <strong>โหมดแก้ไข:</strong> ผู้รับลิงก์สามารถแก้ไขข้อมูลฟอร์ม และบันทึกซิงค์กลับเข้าสู่ระบบได้
                      </p>
                    )}
                  </div>

                  {/* Share URL Box */}
                  <div>
                    <label className="block text-[11px] font-bold text-muted-foreground mb-1">
                      ลิงก์แชร์ตัวละคร (Shareable URL):
                    </label>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        readOnly
                        value={generatedShareUrl || ''}
                        className="flex-1 px-3 py-2 text-xs rounded-xl bg-[#1F1F24] border border-border text-foreground font-mono focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleCopyShareUrl}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer whitespace-nowrap"
                      >
                        {shareCopied ? '✓ คัดลอกแล้ว' : '📋 คัดลอก'}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setSharingCharacterId(null)}
                    className="px-4 py-1.5 rounded-xl bg-muted text-foreground text-xs font-semibold hover:bg-muted/80 transition-colors cursor-pointer"
                  >
                    ปิด
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* POPUP: INSPECT CHARACTER MODAL */}
          {inspectingCharacter && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
              <div className="w-full max-w-2xl max-h-[85vh] bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-muted/40">
                  <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <span>👁️</span> ดูข้อมูลตัวละคร: {inspectingCharacter.fullName || inspectingCharacter.nickname}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setInspectingCharacter(null)}
                    className="text-xs text-muted-foreground hover:text-foreground p-1 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-5">
                  <pre className="text-xs font-mono whitespace-pre-wrap leading-relaxed bg-[#1F1F24] p-4 rounded-xl border border-border text-foreground">
                    {characterToFullMarkdown(inspectingCharacter)}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
