'use client';
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import type { ThaiMasterCharacter, CharacterFlagType } from '@/shared/types';
import { CHARACTER_FLAGS } from '@/shared/types';

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
  const [galleryInput, setGalleryInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'list' | 'save' | 'album'>('list');
  const [filterQuery, setFilterQuery] = useState('');
  const [selectedCharacterForAlbum, setSelectedCharacterForAlbum] = useState<string | null>(null);

  if (!isLibraryModalOpen) return null;

  const handleSaveCurrent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const title = saveTitle.trim() || currentCharacter.fullName || currentCharacter.nickname || 'ตัวละครใหม่';
    
    // Parse gallery URLs (split by comma or newline)
    const extraUrls = galleryInput
      .split(/[\n,]+/)
      .map((u: string) => u.trim())
      .filter((u: string) => u.length > 0 && u.startsWith('http'));
    
    const allGalleryUrls = imageUrl.trim() 
      ? [imageUrl.trim(), ...extraUrls.filter((u: string) => u !== imageUrl.trim())]
      : extraUrls;

    const res = await saveToLibrary(currentCharacter, title, imageUrl.trim(), allGalleryUrls);
    setIsSaving(false);
    if (res.success) {
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        setActiveTab('list');
      }, 1200);
    }
  };

  const handleLoad = (charData: ThaiMasterCharacter) => {
    onLoadCharacter(charData);
    closeLibraryModal();
  };

  const filteredList = savedCharacters.filter((c) => {
    const q = filterQuery.toLowerCase();
    return (
      c.title.toLowerCase().includes(q) ||
      c.nickname.toLowerCase().includes(q) ||
      c.tagline.toLowerCase().includes(q)
    );
  });

  const viewingCharacter = savedCharacters.find((c) => c.id === selectedCharacterForAlbum) || savedCharacters[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl h-[85vh] max-h-[700px] flex flex-col bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between px-5 py-4 border-b border-border bg-muted/40">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-rose-500 to-pink-600 flex items-center justify-center text-white shadow-xs">
              📁
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                คลังตัวละคร Cloud Library & Album
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold border border-primary/25">
                  {savedCharacters.length} ตัวละคร
                </span>
              </h2>
              <p className="text-xs text-muted-foreground">
                บันทึกและจัดการตัวละครในบัญชี Supabase พร้อมเชื่อมชุดภาพ Cloudflare CDN
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

        {/* Navigation Tabs */}
        <div className="flex-shrink-0 flex items-center justify-between px-5 py-2.5 border-b border-border bg-muted/20">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setActiveTab('list')}
              className={
                'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ' +
                (activeTab === 'list'
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted')
              }
            >
              📚 รายชื่อตัวละคร ({savedCharacters.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('album')}
              className={
                'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ' +
                (activeTab === 'album'
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted')
              }
            >
              🖼️ แกลเลอรี / ชุดภาพ (Album)
            </button>
            <button
              type="button"
              onClick={() => {
                setSaveTitle(currentCharacter.fullName || currentCharacter.nickname || '');
                setActiveTab('save');
              }}
              className={
                'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ' +
                (activeTab === 'save'
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted')
              }
            >
              ➕ บันทึกตัวละครปัจจุบัน
            </button>
          </div>

          {activeTab === 'list' && (
            <input
              type="text"
              placeholder="ค้นหาตัวละคร..."
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              className="w-44 px-3 py-1 text-xs rounded-lg bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          )}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {/* TAB 1: LIST */}
          {activeTab === 'list' && (
            <div>
              {isLibraryLoading ? (
                <div className="py-20 text-center text-xs text-muted-foreground">
                  กำลังโหลดข้อมูลจาก Cloud...
                </div>
              ) : filteredList.length === 0 ? (
                <div className="py-16 text-center space-y-3">
                  <span className="text-4xl">📭</span>
                  <p className="text-sm font-semibold text-foreground">ยังไม่มีตัวละครที่บันทึกไว้ในคลัง</p>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                    กรอกข้อมูลตัวละครในฟอร์ม แล้วกดแท็บ &quot;บันทึกตัวละครปัจจุบัน&quot; เพื่อเก็บไว้ในบัญชีของคุณ
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSaveTitle(currentCharacter.fullName || currentCharacter.nickname || '');
                      setActiveTab('save');
                    }}
                    className="mt-2 px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-all cursor-pointer shadow-xs"
                  >
                    ➕ บันทึกตัวละครปัจจุบันทันที
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {filteredList.map((item) => {
                    const flagKey = (item.flag_type in CHARACTER_FLAGS ? (item.flag_type as keyof typeof CHARACTER_FLAGS) : "none");
                    const flagInfo = CHARACTER_FLAGS[flagKey];
                    const galleryCount = item.gallery_urls ? item.gallery_urls.length : (item.image_url ? 1 : 0);

                    return (
                      <div
                        key={item.id}
                        className="group relative p-3.5 rounded-xl bg-muted/30 border border-border hover:border-primary/40 hover:shadow-md transition-all flex flex-col justify-between gap-3"
                      >
                        <div className="flex items-start gap-3">
                          {/* Avatar / Cloudflare Image */}
                          <div className="w-13 h-13 rounded-lg bg-[#1F1F24] border border-border flex items-center justify-center flex-shrink-0 overflow-hidden relative">
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
                              <span className="text-xl">
                                {item.flag_type === 'black' ? '⚫' :
                                 item.flag_type === 'red' ? '🔴' :
                                 item.flag_type === 'green' ? '🟢' : '🎭'}
                              </span>
                            )}
                            {galleryCount > 1 && (
                              <span className="absolute bottom-0 right-0 bg-black/75 text-[9px] text-white px-1 rounded-tl-sm font-bold">
                                +{galleryCount}
                              </span>
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h4 className="text-sm font-bold text-foreground truncate">{item.title}</h4>
                              <span className={'text-[10px] px-1.5 py-0.5 rounded-md font-bold ' + flagInfo.badgeBg}>
                                {flagInfo.emoji} {flagInfo.label}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground truncate mt-0.5">
                              {item.tagline || item.nickname || '-'}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] text-muted-foreground/70">
                                แก้ไขล่าสุด: {new Date(item.updated_at).toLocaleDateString('th-TH')}
                              </span>
                              {galleryCount > 0 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedCharacterForAlbum(item.id);
                                    setActiveTab('album');
                                  }}
                                  className="text-[10px] text-primary hover:underline font-semibold cursor-pointer"
                                >
                                  🖼️ ดูชุดรูป ({galleryCount})
                                </button>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="mt-auto pt-3 border-t border-border/60 flex items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => handleLoad(item.character_data)}
                            className="flex-1 py-1.5 px-3 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-all cursor-pointer shadow-xs text-center"
                          >
                            📥 โหลดเข้าสู่ Editor
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

          {/* TAB 2: ALBUM GALLERY */}
          {activeTab === 'album' && (
            <div className="space-y-4">
              {savedCharacters.length === 0 ? (
                <div className="py-16 text-center space-y-2">
                  <span className="text-4xl">🖼️</span>
                  <p className="text-sm font-semibold text-foreground">ยังไม่มีชุดภาพตัวละคร</p>
                  <p className="text-xs text-muted-foreground">บันทึกตัวละครพร้อมลิงก์ Cloudflare Images เพื่อเปิดดูแกลเลอรี</p>
                </div>
              ) : (
                <>
                  {/* Character Selector */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {savedCharacters.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setSelectedCharacterForAlbum(c.id)}
                        className={
                          'px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border cursor-pointer ' +
                          (viewingCharacter?.id === c.id
                            ? 'bg-primary text-white border-primary shadow-xs'
                            : 'bg-muted/40 border-border text-foreground hover:bg-muted')
                        }
                      >
                        {c.title}
                      </button>
                    ))}
                  </div>

                  {/* Album View */}
                  {viewingCharacter && (
                    <div className="p-4 rounded-xl bg-muted/20 border border-border space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                            <span>🖼️ แกลเลอรีชุดภาพ: {viewingCharacter.title}</span>
                          </h3>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            ชุดภาพสำหรับแสดงสีหน้า/อารมณ์/เครื่องแต่งกาย เก็บและส่งผ่าน Cloudflare Delivery CDN
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleLoad(viewingCharacter.character_data)}
                          className="px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-all cursor-pointer shadow-xs"
                        >
                          📥 โหลดตัวละครนี้
                        </button>
                      </div>

                      {/* Image Grid */}
                      {(!viewingCharacter.gallery_urls || viewingCharacter.gallery_urls.length === 0) && !viewingCharacter.image_url ? (
                        <div className="py-10 text-center text-xs text-muted-foreground border border-dashed border-border rounded-xl">
                          ยังไม่ได้ใส่ลิงก์รูปภาพ Cloudflare สำหรับตัวละครนี้
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                          {(viewingCharacter.gallery_urls || [viewingCharacter.image_url]).filter(Boolean).map((imgUrl, idx) => (
                            <div key={idx} className="group relative rounded-xl bg-[#1F1F24] border border-border overflow-hidden aspect-square flex items-center justify-center">
                              <img
                                src={imgUrl}
                                alt={viewingCharacter.title + ' #' + (idx + 1)}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = 'none';
                                }}
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-2">
                                <span className="text-[10px] text-white font-semibold">
                                  {idx === 0 ? 'รูปหลัก (Avatar)' : 'ชุดภาพ #' + (idx + 1)}
                                </span>
                                <a
                                  href={imgUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[10px] text-primary bg-white/90 px-1.5 py-0.5 rounded font-bold"
                                >
                                  ดูภาพเต็ม
                                </a>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* TAB 3: SAVE CURRENT */}
          {activeTab === 'save' && (
            <form onSubmit={handleSaveCurrent} className="max-w-lg mx-auto space-y-4 py-2">
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 text-xs text-foreground flex items-center gap-3">
                <span className="text-2xl">💾</span>
                <div>
                  <div className="font-bold">บันทึกข้อมูลตัวละครปัจจุบัน</div>
                  <div className="text-muted-foreground text-[11px]">
                    ข้อมูลคำสั่งและ 9 แกนหลักจะถูกสำรองลงบัญชี Supabase พร้อมชุดภาพ Cloudflare
                  </div>
                </div>
              </div>

              {saveSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-500 text-xs flex items-center gap-2 font-semibold">
                  <span>✅</span>
                  <span>บันทึกตัวละครและชุดรูปภาพลง Cloud Library เรียบร้อยแล้ว!</span>
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
                  placeholder="เช่น คชา รัตนเวคิน"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#1F1F24] border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Cloudflare Main Avatar URL (ลิงก์รูปหลัก)
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://imagedelivery.net/... หรือ https://r2.yourdomain.com/avatar.png"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#1F1F24] border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <span className="text-[11px] text-muted-foreground mt-1 block">
                  รองรับ Cloudflare Images Delivery / Cloudflare R2 Bucket หรือ Direct Image URL
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Cloudflare Gallery / ชุดภาพอารมณ์เสริม (ใส่ทีละบรรทัดหรือคั่นด้วยจุลภาค)
                </label>
                <textarea
                  rows={3}
                  value={galleryInput}
                  onChange={(e) => setGalleryInput(e.target.value)}
                  placeholder="https://imagedelivery.net/.../happy.png&#10;https://imagedelivery.net/.../shy.png&#10;https://imagedelivery.net/.../nsfw_secret.png"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#1F1F24] border border-border text-xs text-foreground placeholder:text-muted-foreground/60 font-mono resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <span className="text-[11px] text-muted-foreground mt-0.5 block">
                  ระบบจะสร้างอัลบั้มชุดรูปภาพให้คุณเปิดดูและคัดลอกได้ตลอดเวลา
                </span>
              </div>

              {imageUrl && (
                <div className="p-3 rounded-xl bg-muted/40 border border-border flex items-center gap-3">
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="w-14 h-14 rounded-lg object-cover border border-border"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <div className="text-xs text-muted-foreground">
                    ตัวอย่างรูปหลักที่จะแสดงในการ์ดตัวละคร
                  </div>
                </div>
              )}

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 hover:from-rose-600 hover:to-pink-700 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? 'กำลังบันทึก...' : 'บันทึกเข้าสู่ Cloud Library & Album'}
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
      </div>
    </div>
  );
}
