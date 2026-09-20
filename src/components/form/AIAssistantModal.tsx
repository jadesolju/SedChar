'use client';
import { Sparkles, Wand2, Loader2, AlertCircle, X, Check } from 'lucide-react';
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import type { ThaiMasterCharacter } from '@/shared/types';
import { CompactModelLayer } from '@/components/ui/CompactModelLayer';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCharacter: ThaiMasterCharacter;
  onApplyCharacter: (char: ThaiMasterCharacter, notice: string) => void;
}

export function AIAssistantModal({
  isOpen,
  onClose,
  currentCharacter,
  onApplyCharacter,
}: AIAssistantModalProps) {
  const { user, quotaRemaining, quotaMax, consumeQuota, openAuthModal } = useAuth();

  const [activeTab, setActiveTab] = useState<'enhance' | 'parse'>('enhance');
  const [selectedModel, setSelectedModel] = useState('auto');
  const [instructions, setInstructions] = useState('');
  const [pasteText, setPasteText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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

    setIsLoading(true);
    setErrorMsg(null);
    setLoadingStep(`กำลังประมวลผลด้วยโมเดล ${selectedModel === 'auto' ? 'Gemini 3.5 / OpenRouter' : selectedModel}...`);

    try {
      const res = await fetch('/api/ai/enhance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          character: currentCharacter,
          instructions: instructions.trim() || undefined,
          model: selectedModel !== 'auto' ? selectedModel : undefined,
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
        onApplyCharacter(
          data.character,
          `✨ AI (${usedModelName}) เติมเต็มข้อมูล 10 หมวดหมู่ให้คุณเรียบร้อยแล้ว!`
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
    setLoadingStep(`กำลังแยกวิเคราะห์ข้อมูลด้วยโมเดล ${selectedModel === 'auto' ? 'Gemini 3.5 / OpenRouter' : selectedModel}...`);

    try {
      const res = await fetch('/api/ai/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawText: pasteText,
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
          `⚡ AI (${usedModelName}) แยกและนำเข้าข้อมูลสู่ 10 หมวดหมู่เรียบร้อยแล้ว!`
        );
        onClose();
      } else {
        throw new Error('No character returned from AI parser');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'เกิดข้อผิดพลาดในการแยกข้อมูล');
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl shadow-black/80 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header with Compact Model Layer (Responsive Stacked on Mobile) */}
        <div className="p-4 sm:px-6 sm:py-4 border-b border-border bg-muted/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          {/* Row 1 on Mobile: Icon, Title & Mobile Close Button */}
          <div className="flex items-start justify-between sm:justify-start gap-3 min-w-0 flex-1">
            <div className="flex items-start gap-2.5 sm:gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-500/20 to-purple-500/20 border border-rose-500/30 flex items-center justify-center text-rose-500 shadow-inner flex-shrink-0 mt-0.5 sm:mt-0">
                ✨
              </div>
              <div className="min-w-0">
                <h2 className="text-sm sm:text-base font-bold text-foreground flex items-center gap-2">
                  SedChar AI Co-Creator
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
                  ระบบปัญญาประดิษฐ์เติมเต็มและแกะโครงสร้างตัวละครบทบาทสมมุติอัตโนมัติ
                </p>
              </div>
            </div>

            {/* Close Button on Mobile */}
            <button
              onClick={onClose}
              className="sm:hidden text-muted-foreground hover:text-foreground p-1.5 rounded-lg hover:bg-muted transition-colors flex-shrink-0 cursor-pointer"
              title="ปิดหน้าต่าง"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Row 2 on Mobile: Model Selector & Desktop Close Button */}
          <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto flex-shrink-0 pt-2 sm:pt-0 border-t border-border/40 sm:border-t-0">
            <CompactModelLayer
              selectedModelId={selectedModel}
              onSelectModel={setSelectedModel}
            />
            <button
              onClick={onClose}
              className="hidden sm:flex text-muted-foreground hover:text-foreground p-1.5 rounded-lg hover:bg-muted transition-colors cursor-pointer"
              title="ปิดหน้าต่าง"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab & Quota Strip (Responsive 2-Row / Single-Grid on Mobile) */}
        <div className="p-3 sm:px-6 sm:py-2.5 bg-card border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-2 text-xs">
          <div className="grid grid-cols-2 sm:flex gap-1.5 sm:gap-2 w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('enhance')}
              className={`px-2.5 sm:px-3 py-2 sm:py-1.5 rounded-lg font-semibold transition-all text-center flex items-center justify-center gap-1 cursor-pointer text-xs ${
                activeTab === 'enhance'
                  ? 'bg-rose-500 text-white shadow-xs font-bold'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted border border-border/60 sm:border-0'
              }`}
            >
              <span>🪄 เติมเต็มข้อมูล</span>
              <span className="hidden sm:inline">ที่ขาด (Enhance)</span>
            </button>
            <button
              onClick={() => setActiveTab('parse')}
              className={`px-2.5 sm:px-3 py-2 sm:py-1.5 rounded-lg font-semibold transition-all text-center flex items-center justify-center gap-1 cursor-pointer text-xs ${
                activeTab === 'parse'
                  ? 'bg-purple-600 text-white shadow-xs font-bold'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted border border-border/60 sm:border-0'
              }`}
            >
              <span>⚡ วางข้อความดิบ</span>
              <span className="hidden sm:inline">แยกหมวด (Quick Parse)</span>
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
        <div className="p-6 overflow-y-auto flex-1 space-y-4 text-sm">
          {errorMsg && (
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {activeTab === 'enhance' ? (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-2">
                <div className="text-xs font-semibold text-foreground font-semibold flex items-center gap-2">
                  <span>🎯 สิ่งที่ AI จะดำเนินการ:</span>
                </div>
                <ul className="text-xs text-muted-foreground space-y-1.5 list-disc list-inside">
                  <li><strong>คงค่าเดิมที่คุณพิมพ์ไว้ 100%:</strong> ไม่ลบข้อมูลที่คุณตั้งใจเขียนไว้</li>
                  <li><strong>เติมเต็มจุดที่เว้นว่าง:</strong> ทั้งบุคลิกภาพ จิตวิทยา กลิ่นน้ำหอม สไตล์บทสนทนา</li>
                  <li><strong>สร้างความลึก:</strong> จุดอ่อน ปมเบื้องหลัง และกิมมิคพิเศษของตัวละคร</li>
                </ul>
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground font-semibold mb-1.5">
                  คำสั่งพิเศษเพิ่มเติมให้ AI (Optional):
                </label>
                <textarea
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="เช่น เน้นแนว Dark Romance มาเฟียขี้หึง, พูดจาสุภาพแต่เด็ดขาด, ชอบแกล้ง user ตอนอยู่สองต่อสอง..."
                  rows={3}
                  className="w-full bg-background border border-border rounded-xl p-3 text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-rose-500/50 transition-colors"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-2">
                <div className="text-xs font-semibold text-foreground font-semibold flex items-center gap-2">
                  <span>⚡ วิธีใช้นำเข้าด่วน:</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  วางข้อความรายละเอียดตัวละครทั้งหมดที่คุณมี (ไม่ว่าจะเป็นฟอร์แมตไหน ข้อความแชท หรือข้อความยาว) AI จะตรวจจับและแยกใส่ 10 หมวดหมู่ให้โดยอัตโนมัติ
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground font-semibold mb-1.5">
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
              <div className="text-xs text-rose-300 font-medium">
                {loadingStep || 'กำลังประมวลผล...'}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border bg-muted/60 flex items-center justify-between">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50"
          >
            ยกเลิก
          </button>

          {activeTab === 'enhance' ? (
            <button
              onClick={handleEnhance}
              disabled={isLoading}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white text-xs font-bold shadow-lg shadow-rose-600/30 transition-all transform active:scale-95 disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>กำลังวิเคราะห์...</span>
                </>
              ) : (
                <>
                  <span>✨</span>
                  <span>เริ่มเติมเต็มข้อมูลด้วย AI</span>
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleQuickParse}
              disabled={isLoading || !pasteText.trim()}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 transition-all transform active:scale-95 disabled:opacity-50 flex items-center gap-2"
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
