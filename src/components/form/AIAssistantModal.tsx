'use client';
import { Sparkles, Wand2, Loader2, AlertCircle, X, Check, CheckSquare, Square, ShieldCheck, Zap } from 'lucide-react';
import React, { useState, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import type { ThaiMasterCharacter } from '@/shared/types';
import { CompactModelLayer } from '@/components/ui/CompactModelLayer';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCharacter: ThaiMasterCharacter;
  onApplyCharacter: (char: ThaiMasterCharacter, notice: string) => void;
}

const CATEGORY_OPTIONS = [
  { id: 'basic', label: '1. ข้อมูลพื้นฐาน', desc: 'ชื่อ, อายุ, เพศ, MBTI, สัดส่วน', icon: '👤' },
  { id: 'appearance', label: '2. ฐานะ & อาชีพ', desc: 'อาชีพ, รถ, น้ำหอม, ที่อยู่, แฟชั่น', icon: '👔' },
  { id: 'personality', label: '3. อุปนิสัยหลัก', desc: 'นิสัย, ชอบ, ไม่ชอบ, พฤติกรรม', icon: '🧠' },
  { id: 'psychology', label: '4. จิตวิทยา & Mindset', desc: 'ความคิด, ความเชื่อ, จุดอ่อน, จุดกระตุ้น', icon: '🔮' },
  { id: 'relationship', label: '5. ความสัมพันธ์กับ User', desc: 'บทบาท, ทัศนคติ, ปมเบื้องหลัง', icon: '🤝' },
  { id: 'gimmicks', label: '6. มุมลับ & พฤติกรรมพิเศษ', desc: 'มุมอ่อนโยน, ด้านมืด, กฎข้อห้ามเด็ดขาด', icon: '🎭' },
  { id: 'nsfw', label: '7. รสนิยม 18+ / NSFW', desc: 'ขนาด, สไตล์, Kinks, Aftercare', icon: '🔞' },
  { id: 'dialogue', label: '8. คำโปรย & ฉากเปิด', desc: 'Greeting, บทสนทนา, พล็อต, เรื่องย่อ', icon: '💬' },
  { id: 'system', label: '9. กฎระบบ (System Rules)', desc: 'กฎบังคับการตอบ, โทนการพูด', icon: '⚙️' },
  { id: 'subchars', label: '10. ตัวละครเสริม & ฉาก', desc: 'ตัวละครย่อย, สถานที่ประจำ', icon: '👥' },
];

export function AIAssistantModal({
  isOpen,
  onClose,
  currentCharacter,
  onApplyCharacter,
}: AIAssistantModalProps) {
  const { user, session, quotaRemaining, quotaMax, consumeQuota, openAuthModal } = useAuth();

  const [activeTab, setActiveTab] = useState<'enhance' | 'parse'>('enhance');
  const [selectedModel, setSelectedModel] = useState('auto');
  const [instructions, setInstructions] = useState('');
  const [pasteText, setPasteText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Selective Checkbox Scoping State
  const [selectedCategories, setSelectedCategories] = useState<string[]>(CATEGORY_OPTIONS.map(c => c.id));
  const [onlyEmptyFields, setOnlyEmptyFields] = useState<boolean>(true);
  const [activeSubCharIds, setActiveSubCharIds] = useState<string[]>(() => 
    Array.isArray(currentCharacter?.supportingCharacters) 
      ? currentCharacter.supportingCharacters.map(sc => sc.id) 
      : []
  );

  const isAllCategoriesSelected = selectedCategories.length === CATEGORY_OPTIONS.length;
  const isSelectiveActive = selectedCategories.length > 0 && selectedCategories.length < CATEGORY_OPTIONS.length;

  const toggleCategory = (id: string) => {
    setSelectedCategories(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const handleSelectAllCategories = () => {
    setSelectedCategories(CATEGORY_OPTIONS.map(c => c.id));
  };

  const handleClearCategories = () => {
    setSelectedCategories(['basic']); // keep at least basic for coherent profile
  };

  const toggleSubChar = (id: string) => {
    setActiveSubCharIds(prev =>
      prev.includes(id) ? prev.filter(scId => scId !== id) : [...prev, id]
    );
  };

  if (!isOpen) return null;

  const handleEnhance = async () => {
    if (!user) {
      openAuthModal('signin');
      return;
    }

    if (quotaRemaining <= 0) {
      setErrorMsg(`โควตา AI ของคุณหมดแล้ว (${quotaMax}/${quotaMax} ครั้ง) กรุณาอัปเกรดเป็น Premium หรือติดต่อแอดมิน`);
      return;
    }

    if (selectedCategories.length === 0) {
      setErrorMsg('กรุณาเลือกอย่างน้อย 1 หมวดหมู่ที่ต้องการให้ AI เติมเต็ม');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setLoadingStep(`กำลังประมวลผลด้วยโมเดล ${selectedModel === 'auto' ? 'Gemini 3.5 Flash Lite' : selectedModel} (ขอบเขต: ${selectedCategories.length}/10 หมวดหมู่)...`);

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const res = await fetch('/api/ai/enhance', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          character: currentCharacter,
          instructions: instructions.trim() || undefined,
          model: selectedModel !== 'auto' ? selectedModel : undefined,
          selectedCategories,
          onlyEmptyFields,
          activeSubCharIds,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to enhance character');
      }

      const data = await res.json();
      if (data.success && data.character) {
        consumeQuota();
        const usedModelName = data.model || selectedModel;
        const scopeNotice = isSelectiveActive
          ? `เฉพาะ ${selectedCategories.length} หมวดที่เลือก`
          : 'ครบ 10 หมวดหมู่';
        onApplyCharacter(
          data.character,
          `✨ AI (${usedModelName}) เติมเต็มข้อมูล ${scopeNotice} ให้คุณเรียบร้อยแล้ว!`
        );
        onClose();
      } else {
        throw new Error('No character returned from AI');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อกับ AI');
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  const handleQuickParse = async () => {
    if (!pasteText.trim()) return;

    if (!user) {
      openAuthModal('signin');
      return;
    }

    if (quotaRemaining <= 0) {
      setErrorMsg(`โควตา AI ของคุณหมดแล้ว (${quotaMax}/${quotaMax} ครั้ง) กรุณาอัปเกรดเป็น Premium หรือติดต่อแอดมิน`);
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setLoadingStep(`กำลังแยกวิเคราะห์ข้อมูลด้วยโมเดล ${selectedModel === 'auto' ? 'Gemini 3.5 Flash Lite' : selectedModel}...`);

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const res = await fetch('/api/ai/parse', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          rawText: pasteText.trim(),
          model: selectedModel !== 'auto' ? selectedModel : undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to parse text');
      }

      const data = await res.json();
      if (data.success && data.character) {
        consumeQuota();
        const usedModelName = data.model || selectedModel;
        onApplyCharacter(
          data.character,
          `⚡ AI (${usedModelName}) แยกวิเคราะห์ข้อมูลลง 10 หมวดหมู่ให้คุณเรียบร้อยแล้ว!`
        );
        onClose();
      } else {
        throw new Error('No character returned from AI');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'เกิดข้อผิดพลาดในการวิเคราะห์ข้อความ');
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-card border border-border rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex-shrink-0 px-4 py-3 sm:px-6 sm:py-3.5 border-b border-border bg-muted/40">
          <div className="flex items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-500 flex-shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm sm:text-base font-bold text-foreground truncate flex items-center gap-2">
                  <span>SedChar AI Co-Creator</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-semibold hidden sm:inline">
                    Token Scoped
                  </span>
                </h3>
                <p className="text-[11px] sm:text-xs text-muted-foreground truncate">
                  ผู้ช่วยปัญญาประดิษฐ์เติมเต็มและวิเคราะห์ข้อมูลตัวละครแบบประหยัด Token
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              disabled={isLoading}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50 flex-shrink-0 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="pt-1">
            <CompactModelLayer
              selectedModelId={selectedModel}
              onSelectModel={setSelectedModel}
            />
          </div>
        </div>

        {/* Tab Selector & Quota Display */}
        <div className="px-4 py-2 sm:px-6 sm:py-2.5 bg-muted/20 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 p-1 bg-background/80 rounded-xl border border-border/60 self-start">
            <button
              type="button"
              onClick={() => { setActiveTab('enhance'); setErrorMsg(null); }}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'enhance'
                  ? 'bg-rose-500 text-white font-bold shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>เติมเต็มข้อมูล (AI Enhance)</span>
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('parse'); setErrorMsg(null); }}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'parse'
                  ? 'bg-purple-600 text-white font-bold shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>แยกหมวด (Quick Parse)</span>
            </button>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto pt-1.5 sm:pt-0 border-t border-border/40 sm:border-t-0">
            <span className="text-muted-foreground">โควตาวันนี้:</span>
            <span className={`px-2 py-0.5 rounded-md font-mono font-bold ${
              quotaRemaining > 3 ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30'
            }`}>
              {quotaRemaining} / {quotaMax} ครั้ง
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4 text-sm">
          {errorMsg && (
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {activeTab === 'enhance' ? (
            <div className="space-y-4">
              {/* Checkbox-driven Category Scoper */}
              <div className="p-3.5 sm:p-4 rounded-xl bg-muted/40 border border-border space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-foreground">🎯 เลือกหมวดหมู่ที่ต้องการส่งให้ AI:</span>
                    {isSelectiveActive && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-semibold">
                        ⚡ ประหยัด Token ~{Math.round((1 - selectedCategories.length / 10) * 70)}%
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[11px]">
                    <button
                      type="button"
                      onClick={handleSelectAllCategories}
                      className="text-primary hover:underline font-semibold cursor-pointer"
                    >
                      เลือกทั้งหมด
                    </button>
                    <span className="text-muted-foreground/40">|</span>
                    <button
                      type="button"
                      onClick={handleClearCategories}
                      className="text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      รีเซ็ต
                    </button>
                  </div>
                </div>

                {/* 10 Category Checkboxes Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {CATEGORY_OPTIONS.map(cat => {
                    const isChecked = selectedCategories.includes(cat.id);
                    return (
                      <label
                        key={cat.id}
                        className={`flex items-start gap-2 p-2 rounded-lg border transition-all cursor-pointer select-none ${
                          isChecked
                            ? 'bg-card border-primary/40 text-foreground shadow-2xs'
                            : 'bg-muted/20 border-transparent text-muted-foreground opacity-60 hover:opacity-100'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleCategory(cat.id)}
                          className="sr-only"
                        />
                        <div className="mt-0.5">
                          {isChecked ? (
                            <CheckSquare className="w-4 h-4 text-primary flex-shrink-0" />
                          ) : (
                            <Square className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold flex items-center gap-1 text-[11px] sm:text-xs">
                            <span>{cat.icon}</span>
                            <span>{cat.label}</span>
                          </div>
                          <p className="text-[10px] text-muted-foreground truncate">{cat.desc}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>

                {/* Supporting Characters Filter if exist */}
                {Array.isArray(currentCharacter?.supportingCharacters) && currentCharacter.supportingCharacters.length > 0 && (
                  <div className="pt-2 border-t border-border/60">
                    <span className="text-[11px] font-semibold text-foreground block mb-1.5">
                      👥 เลือกตัวละครเสริมที่จะรวมใน Prompt:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {currentCharacter.supportingCharacters.map(sc => {
                        const isIncluded = activeSubCharIds.includes(sc.id);
                        return (
                          <button
                            key={sc.id}
                            type="button"
                            onClick={() => toggleSubChar(sc.id)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-all cursor-pointer ${
                              isIncluded
                                ? 'bg-primary/10 border-primary/40 text-primary font-bold'
                                : 'bg-muted/30 border-border text-muted-foreground opacity-60'
                            }`}
                          >
                            {isIncluded ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                            <span>{sc.name || 'ตัวละครเสริมไม่มีชื่อ'}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Toggle: Only Enrich Empty Fields */}
                <div className="pt-2 border-t border-border/60 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <div>
                      <span className="text-xs font-semibold text-foreground block">
                        คงค่าเดิมที่คุณพิมพ์ไว้ 100%
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        AI จะเติมเต็มเฉพาะช่องที่ยังว่างหรือขาดรายละเอียดเท่านั้น
                      </span>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={onlyEmptyFields}
                      onChange={(e) => setOnlyEmptyFields(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  คำสั่งพิเศษเพิ่มเติมให้ AI (Optional):
                </label>
                <textarea
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="เช่น เน้นแนว Dark Romance มาเฟียขี้หึง, พูดจาสุภาพแต่เด็ดขาด, ชอบแกล้ง user ตอนอยู่สองต่อสอง..."
                  rows={2}
                  className="w-full bg-background border border-border rounded-xl p-3 text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-rose-500/50 transition-colors"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-2">
                <div className="text-xs font-semibold text-foreground flex items-center gap-2">
                  <span>⚡ วิธีใช้นำเข้าด่วน:</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  วางข้อความรายละเอียดตัวละครทั้งหมดที่คุณมี (ไม่ว่าจะเป็นฟอร์แมตไหน ข้อความแชท หรือข้อความยาว) AI จะตรวจจับและแยกใส่ 10 หมวดหมู่ให้โดยอัตโนมัติ
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  วางข้อความดิบที่นี่:
                </label>
                <textarea
                  value={pasteText}
                  onChange={(e) => setPasteText(e.target.value)}
                  placeholder="วางรายละเอียดตัวละคร เช่น ชื่อ: ส้มจิ๊ด, อายุ: 21, เพศ: หญิง, นิสัย: ปากร้ายใจดี..."
                  rows={6}
                  className="w-full bg-background border border-border rounded-xl p-3 text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-purple-500/50 transition-colors font-mono"
                />
              </div>
            </div>
          )}

          {isLoading && (
            <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/20 flex items-center gap-3 animate-pulse">
              <div className="w-5 h-5 border-2 border-rose-500 border-t-transparent rounded-full animate-spin flex-shrink-0" />
              <div className="text-xs text-rose-400 font-medium">
                {loadingStep || 'กำลังประมวลผล...'}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 sm:px-6 sm:py-4 border-t border-border bg-muted/60 flex items-center justify-between">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50 cursor-pointer"
          >
            ยกเลิก
          </button>

          {activeTab === 'enhance' ? (
            <button
              onClick={handleEnhance}
              disabled={isLoading || selectedCategories.length === 0}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white text-xs font-bold shadow-lg shadow-rose-600/30 transition-all transform active:scale-95 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>กำลังประมวลผล...</span>
                </>
              ) : (
                <>
                  <span>✨</span>
                  <span>เติมเต็ม {selectedCategories.length === 10 ? 'ทุกหมวด' : `${selectedCategories.length} หมวดที่เลือก`}</span>
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleQuickParse}
              disabled={isLoading || !pasteText.trim()}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 transition-all transform active:scale-95 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>กำลังแยกข้อมูล...</span>
                </>
              ) : (
                <>
                  <span>⚡</span>
                  <span>แยกข้อมูลและนำเข้าฟอร์ม</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
