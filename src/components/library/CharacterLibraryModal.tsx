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
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isLibraryModalOpen) return null;

  // Handle File Upload from computer
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Read image as Data URL for instant local storage & Cloudflare sync
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
    const title = saveTitle.trim() || currentCharacter.fullName || currentCharacter.nickname || 'ตัวละครใหม่';
    
    const res = await saveToLibrary(currentCharacter, title, imageUrl.trim());
    setIsSaving(false);
    if (res.success) {
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        setActiveTab('list');
      }, 1000);
    }
  };

  const handleLoad = (charData: ThaiMasterCharacter) => {
    onLoadCharacter(charData);
    closeLibraryModal();
  };

  const handleCopyPrompt = async (id: string, charData: ThaiMasterCharacter) => {
    try {
      const prompt = characterToFullMarkdown(charData);
      await navigator.clipboard.writeText(prompt);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {}
  };

  const filteredList = savedCharacters.filter((c) => {
    const q = filterQuery.toLowerCase();
    const matchesSearch =
      c.title.toLowerCase().includes(q) ||
      c.nickname.toLowerCase().includes(q) ||
      c.tagline.toLowerCase().includes(q) ||
      (c.character_data?.mbti && c.character_data.mbti.toLowerCase().includes(q)) ||
      (c.character_data?.occupation && c.character_data.occupation.toLowerCase().includes(q));
    
    if (selectedFlagFilter === 'all') return matchesSearch;
    return matchesSearch && c.flag_type === selectedFlagFilter;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl h-[88vh] max-h-[750px] flex flex-col bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
        {/* Top Modal Header */}
        <div className="flex-shrink-0 flex items-center justify-between px-5 py-4 border-b border-border bg-muted/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-500 to-pink-600 flex items-center justify-center text-white shadow-xs text-base">
              📁
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                คลังข้อมูลตัวละคร Cloud Library
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold border border-primary/25">
                  {savedCharacters.length} ตัวละครที่บันทึก
                </span>
              </h2>
              <p className="text-xs text-muted-foreground">
                เก็บข้อมูลโครงสร้างคำสั่ง (Prompt Data) ทั้ง 10 หมวดหมู่ลงบัญชีอย่างปลอดภัย
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeLibraryModal}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Navigation Tabs & Search Toolbar */}
        <div className="flex-shrink-0 flex flex-col sm:flex-row sm:items-center justify-between px-5 py-2.5 border-b border-border bg-muted/20 gap-2">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setActiveTab('list')}
              className={
                'px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ' +
                (activeTab === 'list'
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted')
              }
            >
              <span>📚</span>
              <span>รายการตัวละครในคลัง ({savedCharacters.length})</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setSaveTitle(currentCharacter.fullName || currentCharacter.nickname || '');
                setActiveTab('save');
              }}
              className={
                'px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ' +
                (activeTab === 'save'
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted')
              }
            >
              <span>💾</span>
              <span>บันทึกตัวละครปัจจุบัน</span>
            </button>
          </div>

          {activeTab === 'list' && (
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="ค้นหาชื่อ, MBTI, อาชีพ..."
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                className="w-48 px-3 py-1 text-xs rounded-lg bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          )}
        </div>

        {/* Modal Main Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {/* TAB 1: LIST OF SAVED CHARACTERS */}
          {activeTab === 'list' && (
            <div>
              {/* Flag Filters */}
              {savedCharacters.length > 0 && (
                <div className="flex items-center gap-1.5 mb-4 overflow-x-auto pb-1 text-xs">
                  <span className="text-muted-foreground text-[11px] font-medium mr-1">ตัวกรอง:</span>
                  <button
                    type="button"
                    onClick={() => setSelectedFlagFilter('all')}
                    className={
                      'px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all border cursor-pointer ' +
                      (selectedFlagFilter === 'all'
                        ? 'bg-foreground text-background border-foreground'
                        : 'bg-muted/40 border-border text-muted-foreground hover:text-foreground')
                    }
                  >
                    ทั้งหมด ({savedCharacters.length})
                  </button>
                  {['green', 'yellow', 'red', 'black', 'watermelon', 'reverse-watermelon'].map((flagKey) => {
                    const flagDef = CHARACTER_FLAGS[flagKey as CharacterFlagType];
                    if (!flagDef) return null;
                    const count = savedCharacters.filter((c) => c.flag_type === flagKey).length;
                    if (count === 0) return null;
                    return (
                      <button
                        key={flagKey}
                        type="button"
                        onClick={() => setSelectedFlagFilter(flagKey)}
                        className={
                          'px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all border cursor-pointer flex items-center gap-1 ' +
                          (selectedFlagFilter === flagKey
                            ? flagDef.badgeBg + ' border-primary/50 shadow-xs'
                            : 'bg-muted/40 border-border text-muted-foreground hover:text-foreground')
                        }
                      >
                        <span>{flagDef.emoji}</span>
                        <span>{flagDef.label.split(' ')[0]} ({count})</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {isLibraryLoading ? (
                <div className="py-24 text-center text-xs text-muted-foreground space-y-2">
                  <div className="inline-block animate-spin text-xl">⏳</div>
                  <p>กำลังโหลดข้อมูลตัวละครจากบัญชี...</p>
                </div>
              ) : filteredList.length === 0 ? (
                <div className="py-20 text-center space-y-3.5">
                  <span className="text-4xl">📭</span>
                  <p className="text-sm font-semibold text-foreground">
                    {filterQuery ? 'ไม่พบตัวละครที่ตรงกับคำค้นหา' : 'ยังไม่มีข้อมูลตัวละครที่บันทึกไว้ในคลัง'}
                  </p>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                    กรอกข้อมูลตัวละครในฟอร์ม แล้วกดแท็บ &quot;บันทึกตัวละครปัจจุบัน&quot; เพื่อเก็บข้อมูลคำสั่งไว้ในบัญชีของคุณ
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSaveTitle(currentCharacter.fullName || currentCharacter.nickname || '');
                      setActiveTab('save');
                    }}
                    className="mt-2 px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-all cursor-pointer shadow-xs"
                  >
                    💾 บันทึกตัวละครปัจจุบันทันที
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {filteredList.map((item) => {
                    const flagKey = (item.flag_type in CHARACTER_FLAGS ? (item.flag_type as keyof typeof CHARACTER_FLAGS) : 'none');
                    const flagInfo = CHARACTER_FLAGS[flagKey];
                    const char = item.character_data;
                    const subCount = char?.supportingCharacters?.length || 0;
                    const locCount = char?.locations?.length || 0;

                    return (
                      <div
                        key={item.id}
                        className="group relative p-4 rounded-xl bg-[#1F1F24]/50 hover:bg-[#1F1F24] border border-border hover:border-primary/40 hover:shadow-md transition-all flex flex-col justify-between gap-3"
                      >
                        <div className="flex items-start gap-3.5">
                          {/* Avatar / Thumbnail (Optional) */}
                          <div className="w-14 h-14 rounded-xl bg-[#18181B] border border-border flex items-center justify-center flex-shrink-0 overflow-hidden relative shadow-inner">
                            {item.image_url ? (
                              <img
                                src={item.image_url}
                                alt={item.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = 'none';
                                }}
                              />
                            ) : (
                              <span className="text-2xl">
                                {flagInfo?.emoji || '👤'}
                              </span>
                            )}
                          </div>

                          {/* Main Character Data */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-sm font-bold text-foreground truncate">{item.title}</h4>
                              {flagInfo && (
                                <span className={'text-[10px] px-1.5 py-0.5 rounded-md font-bold ' + flagInfo.badgeBg}>
                                  {flagInfo.emoji} {flagInfo.label.split(' ')[0]}
                                </span>
                              )}
                            </div>

                            {/* Quick Stats Pill */}
                            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground flex-wrap mt-1">
                              {char?.age && <span>อายุ {char.age}</span>}
                              {char?.gender && <span>• {char.gender}</span>}
                              {char?.mbti && <span className="font-mono font-semibold text-primary/90">• {char.mbti}</span>}
                              {char?.occupation && <span className="truncate max-w-[120px]">• {char.occupation}</span>}
                            </div>

                            {/* Tagline / Punchline */}
                            <p className="text-xs text-foreground/80 line-clamp-2 mt-1.5 leading-relaxed bg-muted/20 p-1.5 rounded-md border border-border/40">
                              {char?.punchline ? `"${char.punchline}"` : (item.tagline || char?.coreTraits?.slice(0, 80) || '-')}
                            </p>

                            {/* Meta Info (Sub-chars, locations, date) */}
                            <div className="flex items-center gap-2 mt-2 text-[10px] text-muted-foreground/70">
                              <span>👥 ตัวละครเสริม: {subCount}</span>
                              <span>• 📍 สถานที่: {locCount}</span>
                              <span>• แก้ไข: {new Date(item.updated_at).toLocaleDateString('th-TH')}</span>
                            </div>
                          </div>
                        </div>

                        {/* Bottom Actions Toolbar */}
                        <div className="mt-auto pt-3 border-t border-border/60 flex items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => handleLoad(item.character_data)}
                            className="flex-1 py-1.5 px-3 rounded-lg bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white text-xs font-semibold transition-all cursor-pointer shadow-xs text-center flex items-center justify-center gap-1.5"
                          >
                            <span>📥</span>
                            <span>โหลดเข้าสู่ Editor</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleCopyPrompt(item.id, item.character_data)}
                            title="คัดลอก Master Prompt ทั้งหมด"
                            className="py-1.5 px-2.5 rounded-lg border border-border bg-muted/60 hover:bg-muted text-xs font-semibold text-foreground transition-all cursor-pointer flex items-center gap-1"
                          >
                            <span>{copiedId === item.id ? '✅' : '📋'}</span>
                            <span className="hidden sm:inline">{copiedId === item.id ? 'คัดลอกแล้ว' : 'คัดลอก'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setInspectingCharacter(item.character_data)}
                            title="ดูข้อมูลทั้งหมดแบบสรุป"
                            className="p-1.5 rounded-lg border border-border bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer"
                          >
                            👁️
                          </button>

                          <button
                            type="button"
                            onClick={() => deleteFromLibrary(item.id)}
                            title="ลบตัวละคร"
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-all cursor-pointer"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
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
            <form onSubmit={handleSaveCurrent} className="max-w-xl mx-auto space-y-4 py-2">
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 text-xs text-foreground flex items-center gap-3">
                <span className="text-2xl">💾</span>
                <div>
                  <div className="font-bold">บันทึกข้อมูลตัวละครปัจจุบันลง Cloud</div>
                  <div className="text-muted-foreground text-[11px]">
                    ข้อมูลคำสั่งและ 9 เสาหลักจะถูกจัดเก็บลงฐานข้อมูล Supabase เพื่อให้คุณนำกลับมาใช้งานได้ตลอดเวลา
                  </div>
                </div>
              </div>

              {saveSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-500 text-xs flex items-center gap-2 font-semibold">
                  <span>✅</span>
                  <span>บันทึกข้อมูลตัวละครลง Cloud Library เรียบร้อยแล้ว!</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  ชื่อบันทึก / ชื่อตัวละคร *
                </label>
                <input
                  type="text"
                  required
                  value={saveTitle}
                  onChange={(e) => setSaveTitle(e.target.value)}
                  placeholder="เช่น คชา รัตนเวคิน (King)"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#1F1F24] border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              {/* Image / Avatar Options: Upload File OR Direct URL */}
              <div className="p-3.5 rounded-xl bg-muted/20 border border-border space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <span>🖼️ รูปภาพหน้าปกตัวละคร (ทางเลือก / ไม่บังคับ)</span>
                  </label>
                  {imageUrl && (
                    <button
                      type="button"
                      onClick={() => setImageUrl('')}
                      className="text-[11px] text-rose-500 hover:underline cursor-pointer"
                    >
                      ลบรูปภาพ
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* Option 1: File Upload */}
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-2.5 px-3 rounded-xl border border-dashed border-border hover:border-primary/60 bg-muted/40 hover:bg-muted text-xs font-semibold text-foreground transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <span>📁</span>
                      <span>เลือกไฟล์รูปจากเครื่อง</span>
                    </button>
                  </div>

                  {/* Option 2: Direct Image URL from any website */}
                  <div>
                    <input
                      type="url"
                      value={imageUrl.startsWith('data:') ? '' : imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="หรือวาง Direct Image URL (จากเว็บใดก็ได้)"
                      className="w-full px-3 py-2 rounded-xl bg-[#1F1F24] border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                </div>

                {imageUrl && (
                  <div className="flex items-center gap-3 pt-1 border-t border-border/40">
                    <img
                      src={imageUrl}
                      alt="Avatar Preview"
                      className="w-12 h-12 rounded-lg object-cover border border-border"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    <div className="text-[11px] text-muted-foreground">
                      {imageUrl.startsWith('data:') ? '✓ อัปโหลดรูปภาพจากเครื่องเรียบร้อย' : '✓ ลิงก์รูปภาพภายนอกพร้อมแสดงผล'}
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Summary of Data to be Saved */}
              <div className="p-3 rounded-xl bg-[#1F1F24]/60 border border-border text-xs space-y-1.5">
                <span className="font-bold text-foreground text-[11px] uppercase tracking-wider text-muted-foreground block">
                  สรุปข้อมูลที่จะบันทึก:
                </span>
                <div className="grid grid-cols-2 gap-1 text-[11px] text-muted-foreground">
                  <div>• ชื่อ: <span className="text-foreground font-semibold">{currentCharacter.fullName || currentCharacter.nickname || '-'}</span></div>
                  <div>• MBTI: <span className="text-foreground font-semibold">{currentCharacter.mbti || '-'}</span></div>
                  <div>• ธงพฤติกรรม: <span className="text-foreground font-semibold">{currentCharacter.flagType}</span></div>
                  <div>• ตัวละครเสริม: <span className="text-foreground font-semibold">{currentCharacter.supportingCharacters?.length || 0} ตัว</span></div>
                  <div>• สถานที่: <span className="text-foreground font-semibold">{currentCharacter.locations?.length || 0} แห่ง</span></div>
                  <div>• บทเปิด: <span className="text-foreground font-semibold">{currentCharacter.fullGreeting ? 'มีข้อมูล' : '-'}</span></div>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 hover:from-rose-600 hover:to-pink-700 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <span>💾</span>
                  <span>{isSaving ? 'กำลังบันทึกข้อมูล...' : 'บันทึกข้อมูลตัวละครลงบัญชี'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('list')}
                  className="px-4 py-2.5 rounded-xl border border-border bg-muted hover:bg-muted/80 text-xs font-semibold text-foreground transition-all cursor-pointer"
                >
                  ยกเลิก
                </button>
              </div>
            </form>
          )}
        </div>

        {/* QUICK DATA INSPECTOR MODAL */}
        {inspectingCharacter && (
          <div className="absolute inset-0 z-20 bg-background/95 backdrop-blur-md p-5 flex flex-col justify-between animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <span>👁️ รายละเอียดข้อมูลตัวละคร:</span>
                  <span className="text-primary">{inspectingCharacter.fullName || inspectingCharacter.nickname}</span>
                </h3>
                <p className="text-xs text-muted-foreground">ดูข้อมูลโครงสร้างที่จัดเก็บไว้ในบัญชี</p>
              </div>
              <button
                type="button"
                onClick={() => setInspectingCharacter(null)}
                className="px-3 py-1 text-xs rounded-lg bg-muted text-foreground hover:bg-muted/80 cursor-pointer font-semibold"
              >
                ปิด (Esc)
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-3 space-y-3 text-xs">
              <div className="p-3 rounded-lg bg-[#1F1F24] border border-border font-mono text-[11px] whitespace-pre-wrap leading-relaxed max-h-[400px] overflow-y-auto text-foreground/90">
                {characterToFullMarkdown(inspectingCharacter)}
              </div>
            </div>

            <div className="pt-3 border-t border-border flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  handleLoad(inspectingCharacter);
                  setInspectingCharacter(null);
                }}
                className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold cursor-pointer shadow-xs"
              >
                📥 โหลดตัวละครนี้เข้าสู่ Editor
              </button>
              <button
                type="button"
                onClick={() => setInspectingCharacter(null)}
                className="px-4 py-2 rounded-xl border border-border bg-muted text-xs font-semibold text-foreground cursor-pointer"
              >
                ย้อนกลับ
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}