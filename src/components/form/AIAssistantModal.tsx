'use client';
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import type { ThaiMasterCharacter } from '@/shared/types';

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
      setErrorMsg('โควตา AI วันนี้ของคุณหมดแล้ว (15/15 ครั้ง) กรุณารอรีเซ็ตวันถัดไป');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setLoadingStep('กำลังส่งข้อมูลให้ Google Gemini 3.6 Flash วิเคราะห์...');

    try {
      setTimeout(() => {
        setLoadingStep('กำลังสร้างจิตวิทยา, บุคลิกเชิงลึก และสไตล์บทบาท...');
      }, 1200);

      setTimeout(() => {
        setLoadingStep('กำลังแมปข้อมูลเข้าสู่ 10 หมวดหมู่และสร้างบทสนทนาเปิดฉาก...');
      }, 2500);

      const res = await fetch('/api/ai/enhance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          character: currentCharacter,
          instructions: instructions.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to enhance character');
      }

      const data = await res.json();
      if (data.success && data.character) {
        consumeQuota();
        onApplyCharacter(
          data.character,
          '✨ Gemini AI เติมเต็มข้อมูล 10 หมวดหมู่ให้คุณเรียบร้อยแล้ว!'
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
      setErrorMsg('โควตา AI วันนี้ของคุณหมดแล้ว (15/15 ครั้ง) กรุณารอรีเซ็ตวันถัดไป');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setLoadingStep('กำลังวิเคราะห์โครงสร้างข้อความด้วย Gemini 3.6 Flash...');

    try {
      const res = await fetch('/api/ai/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText: pasteText }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to parse text');
      }

      const data = await res.json();
      if (data.success && data.character) {
        consumeQuota();
        onApplyCharacter(
          data.character,
          '⚡ Gemini AI แยกและนำเข้าข้อมูลสู่ 10 หมวดหมู่เรียบร้อยแล้ว!'
        );
        onClose();
      } else {
        throw new Error('Parsing failed');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'เกิดข้อผิดพลาดในการประมวลผลข้อความ');
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex-shrink-0 px-5 py-4 border-b border-border bg-gradient-to-r from-rose-500/10 via-pink-500/10 to-transparent flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-500 to-pink-500 text-white flex items-center justify-center font-bold text-lg shadow-sm">
              ✨
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-foreground">
                  AI Character Assistant & Auto-Fill
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 font-bold border border-emerald-500/20">
                  Gemini 3.6 Flash
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                ระบบผู้ช่วย AI อัจฉริยะเติมเต็ม 10 หมวดหมู่สำหรับ Thai Roleplay
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Quota & Mode Tabs */}
        <div className="flex-shrink-0 px-5 pt-3 pb-2 border-b border-border bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-1.5 p-1 bg-muted rounded-xl border border-border">
            <button
              type="button"
              onClick={() => setActiveTab('enhance')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'enhance'
                  ? 'bg-card text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <span>✨</span> เติมเต็มช่องว่างในฟอร์ม
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('parse')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'parse'
                  ? 'bg-card text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <span>⚡</span> วางข้อความดิบให้ AI แยก
            </button>
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-muted-foreground">โควตาวันนี้:</span>
            <span className="font-bold text-foreground px-2 py-0.5 rounded-md bg-muted border border-border">
              {quotaRemaining} / {quotaMax} ครั้ง
            </span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-500 text-xs flex items-center gap-2">
              <span>⚠️</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {activeTab === 'enhance' ? (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-muted/40 border border-border/60 text-xs text-muted-foreground space-y-1.5">
                <div className="font-semibold text-foreground flex items-center gap-1.5">
                  <span>💡</span> การทำงานของระบบเติมเต็มฟอร์ม (Auto-Fill):
                </div>
                <ul className="list-disc list-inside space-y-1 text-[11px] leading-relaxed">
                  <li>รักษาข้อมูลเดิมที่คุณกรอกไว้ทั้งหมด ไม่ลบข้อความที่มีอยู่</li>
                  <li>วิเคราะห์และสร้างข้อมูลในช่องที่ยังว่าง (จิตวิทยา, นิสัย, NSFW, บนเตียง, กฎ, ฉากเปิด)</li>
                  <li>คำนวณและสร้างตัวละครเสริม (Sub-characters) และสถานที่ (Locations) ให้กลมกลืน</li>
                </ul>
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">
                  คำแนะนำเพิ่มเติมให้ AI (Optional):
                </label>
                <textarea
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="เช่น: ขอแนวยันเดเระ หวงแรงมาก, บนเตียงชอบควบคุมแต่จบด้วยความอ่อนโยน, มีฉากเปิดในห้องทำงานดึกๆ..."
                  rows={3}
                  className="w-full p-3 rounded-xl bg-[#1F1F24] border border-border text-xs text-foreground placeholder:text-muted-foreground/50 resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all leading-relaxed font-sans"
                />
              </div>

              {/* Character Snapshot Summary */}
              <div className="p-3 rounded-xl bg-muted/20 border border-border text-[11px] space-y-1">
                <span className="text-muted-foreground">ตัวละครปัจจุบัน:</span>{' '}
                <strong className="text-foreground">{currentCharacter.nickname || currentCharacter.fullName || 'ยังไม่มีชื่อ'}</strong>
                {currentCharacter.age ? ` (อายุ ${currentCharacter.age})` : ''}
                {currentCharacter.occupation ? ` • ${currentCharacter.occupation}` : ''}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-muted/40 border border-border/60 text-xs text-muted-foreground space-y-1.5">
                <div className="font-semibold text-foreground flex items-center gap-1.5">
                  <span>⚡</span> การทำงานของระบบ Quick Auto-Parser:
                </div>
                <p className="text-[11px] leading-relaxed">
                  วางข้อความประวัติตัวละคร ข้อมูลดิบ โน้ต หรือ Markdown/JSON จากที่ไหนก็ได้ AI จะสกัดและแยกเข้าสู่ 10 หมวดหมู่ทันที
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">
                  วางข้อความตัวละครของคุณที่นี่:
                </label>
                <textarea
                  value={pasteText}
                  onChange={(e) => setPasteText(e.target.value)}
                  placeholder="วางเนื้อหา เช่น: ชื่อ: ฮิคารุ, อายุ: 22, นิสัย: ร่าเริง ขี้อ้อน แต่มีความลับซ่อนอยู่..."
                  rows={6}
                  className="w-full p-3 rounded-xl bg-[#1F1F24] border border-border text-xs text-foreground placeholder:text-muted-foreground/50 resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all leading-relaxed font-mono"
                />
              </div>
            </div>
          )}

          {/* Loading Animation */}
          {isLoading && (
            <div className="p-4 rounded-xl bg-primary/10 border border-primary/25 space-y-2.5 animate-in fade-in">
              <div className="flex items-center gap-2.5 text-xs font-bold text-primary">
                <span className="animate-spin text-base">⏳</span>
                <span>{loadingStep || 'กำลังประมวลผลด้วย AI...'}</span>
              </div>
              <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-rose-500 to-pink-500 animate-pulse w-3/4 rounded-full" />
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex-shrink-0 px-5 py-3.5 border-t border-border bg-muted/30 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-all cursor-pointer"
          >
            ยกเลิก
          </button>

          {activeTab === 'enhance' ? (
            <button
              type="button"
              onClick={handleEnhance}
              disabled={isLoading}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 hover:from-rose-600 hover:to-pink-700 text-white font-bold text-xs shadow-md transition-all active:scale-[0.99] cursor-pointer disabled:opacity-50 flex items-center gap-2"
            >
              <span>{isLoading ? '⏳' : '✨'}</span>
              <span>{isLoading ? 'กำลังประมวลผล...' : 'เริ่มเติมเต็มฟอร์ม (AI Auto-Fill)'}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleQuickParse}
              disabled={!pasteText.trim() || isLoading}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 hover:from-rose-600 hover:to-pink-700 text-white font-bold text-xs shadow-md transition-all active:scale-[0.99] cursor-pointer disabled:opacity-50 flex items-center gap-2"
            >
              <span>{isLoading ? '⏳' : '⚡'}</span>
              <span>{isLoading ? 'กำลังวิเคราะห์...' : 'แยกข้อมูลเข้าฟอร์ม (Auto-Parse & Sync)'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
