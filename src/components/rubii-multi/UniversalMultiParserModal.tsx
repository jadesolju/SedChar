'use client';
import React, { useState, useMemo, useRef } from 'react';
import {
  X,
  Sparkles,
  Loader2,
  FileText,
  Upload,
  Globe,
  BookOpen,
  Users,
  CheckCircle2,
  AlertCircle,
  Zap,
  Lock,
  RotateCcw,
  Check,
  ShieldCheck,
  Crown,
  FileCode,
} from 'lucide-react';
import type { MultiCharacterProjectDraft } from '@/shared/multiCharTypes';
import { useAuth } from '@/context/AuthContext';

interface UniversalMultiParserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyProject: (project: MultiCharacterProjectDraft) => void;
  onShowToast: (msg: string) => void;
  onOpenUpgradeModal: () => void;
}

const TRIAL_STORAGE_KEY = 'sedchar_multi_parser_trial_used_v1';
const MAX_FREE_TRIAL = 3;

const SAMPLE_UNIVERSE_TEXT = `โปรเจกต์: Aethelgard (มหานครเงาอัศวิน)
แนวเรื่อง: สตรีมพังก์ ผสมแฟนตาซีเวทมนตร์มืด ยุคศตวรรษที่ 19
ฉากหลัก: นครลอยฟ้าแอริออน และสลัมชั้นล่างใต้หมอกควันพิษ
กฎของโลก: ศิลาเวทอีเธอร์เรียมเป็นแหล่งพลังงานขับเคลื่อนจักรกล แต่หากสูดดมมากเกินไปร่างกายจะกลายเป็นผลึกแก้ว
องค์กร: สภาสูง 3 ตระกูลใหญ่ผู้ผูกขาดเหมืองแร่ และกองกำลังกบฏปีกทมิฬ

ภูมิหลังโลก:
เมื่อ 100 ปีก่อน เกิดมหาภัยพิบัติแกนโลกแตก ดินแดนลอยขึ้นฟ้า เกิดการแบ่งชนชั้นอย่างเด็ดขาด
ปมความขัดแย้ง: พลังงานศิลาอีเธอร์กำลังหมดลง สภาสูงเตรียมทิ้งสลัมชั้นล่างเพื่อรักษานครลอยฟ้า

เหตุการณ์สำคัญ:
- 10 ปีก่อน: เหตุระเบิดโรงงานกลางเมือง ทำให้ผู้บริสุทธิ์กลายเป็นผลึกแก้ว (เป็นความลับที่สภาสูงสั่งปิดข่าว)
- 1 ปีก่อน: ผู้นำกบฏถูกลอบสังหาร ทำให้กลุ่มแตกเป็นสองฝ่าย

ตัวละครหลัก:
1. คาลอส วาลเลนไทน์ (Carlos Valentine)
- เพศ: ชาย, อายุ: 28 ปี
- บทบาท: อดีตอัศวินผู้พิทักษ์ที่แปรพักตร์มาช่วยคนในสลัม
- นิสัย: สุขุม เด็ดเดี่ยว ปากแข็งแต่ใจอ่อน ยึดมั่นในความยุติธรรม
- ความสัมพันธ์กับ {{user}}: รู้จักกันตั้งแต่สมัยเด็ก แต่ต้องปิดบังฐานะแท้จริง
- Flag Type: Green Flag ปนความลับ

2. เฮเลน่า วอน แบล็กวูด (Helena von Blackwood)
- เพศ: หญิง, อายุ: 26 ปี
- บทบาท: บุตรสาวคนโตของตระกูลสภาสูง ผู้ควบคุมกรมตำรวจลับ
- นิสัย: เย่อหยิ่ง ฉลาดเป็นกรด เจ้าเล่ห์และซ่อนแผนการซ้อนแผน
- ความสัมพันธ์กับตัวละครอื่น: เป็นศัตรูคู่อาฆาตกับคาลอส แต่ลึกๆ มีผลประโยชน์ร่วมกัน
- Flag Type: Watermelon Flag (ภายนอกดูสง่า แต่ข้างในซ่อนพิษสง)`;

export function UniversalMultiParserModal({
  isOpen,
  onClose,
  onApplyProject,
  onShowToast,
  onOpenUpgradeModal,
}: UniversalMultiParserModalProps) {
  const { user, userRole, consumeQuota, quotaRemaining } = useAuth();
  const [rawText, setRawText] = useState('');
  const [autoFillMissing, setAutoFillMissing] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Free trial counter from LocalStorage
  const [trialUsed, setTrialUsed] = useState<number>(() => {
    if (typeof window === 'undefined') return 0;
    try {
      const stored = localStorage.getItem(TRIAL_STORAGE_KEY);
      return stored ? parseInt(stored, 10) || 0 : 0;
    } catch {
      return 0;
    }
  });

  const isUnlimitedTier = userRole === 'admin' || userRole === 'premium';
  const freeTrialRemaining = Math.max(0, MAX_FREE_TRIAL - trialUsed);
  const isTrialExhausted = !isUnlimitedTier && freeTrialRemaining <= 0;

  // Realtime Live Section Detector
  const detectedSections = useMemo(() => {
    const hasWorld = /(?:World|Setting|โลก|กฎ|ฉาก|ยุค|องค์กร|ฝ่าย|สภา|เมือง)/i.test(rawText);
    const hasLore = /(?:Lore|Timeline|ภูมิหลัง|ประวัติ|ปม|ความขัดแย้ง|ปีก่อน|เหตุการณ์)/i.test(rawText);
    const hasChars = /(?:ตัวละคร|Character|ชื่อ|นิสัย|เพศ|อายุ|บทบาท|พระเอก|นางเอก|Carlos|Helena)/i.test(rawText);
    return { hasWorld, hasLore, hasChars };
  }, [rawText]);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setRawText(content);
        onShowToast(`นำเข้าไฟล์ "${file.name}" เรียบร้อยแล้ว`);
      }
    };
    reader.onerror = () => {
      setError('ไม่สามารถอ่านไฟล์ได้ กรุณาลองใหม่อีกครั้ง');
    };

    if (file.name.endsWith('.json')) {
      reader.readAsText(file);
    } else {
      reader.readAsText(file, 'UTF-8');
    }
    // reset input
    e.target.value = '';
  };

  const handleLoadSample = () => {
    setRawText(SAMPLE_UNIVERSE_TEXT);
    onShowToast('โหลดตัวอย่างโครงเรื่องจักรวาล Aethelgard แล้ว');
  };

  const handleStartParse = async () => {
    if (!rawText.trim()) {
      setError('กรุณาวางเนื้อเรื่อง หรือนำเข้าไฟล์ก่อนเริ่มแปลง');
      return;
    }

    if (isTrialExhausted) {
      onOpenUpgradeModal();
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/universe/parse-full', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawText: rawText.trim(),
          autoFillMissing,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success || !data.project) {
        throw new Error(data.error || 'การแปลงโครงเรื่องไม่สำเร็จ');
      }

      // Decrement quota and trial counter
      if (!isUnlimitedTier) {
        const nextUsed = trialUsed + 1;
        setTrialUsed(nextUsed);
        try {
          localStorage.setItem(TRIAL_STORAGE_KEY, String(nextUsed));
        } catch {}
      }
      consumeQuota();

      onApplyProject(data.project);
      onShowToast(`สกัดโครงสร้างจักรวาล "${data.project.title}" เรียบร้อยแล้ว!`);
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'เกิดข้อผิดพลาดในการประมวลผล');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-2xl rounded-2xl sm:rounded-3xl bg-card border border-border shadow-2xl overflow-hidden flex flex-col max-h-[94vh] sm:max-h-[90vh] z-10 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex-shrink-0 flex items-start justify-between p-3.5 sm:px-6 sm:py-4 border-b border-border bg-muted/30 gap-2.5">
          <div className="flex items-start gap-2.5 sm:gap-3 min-w-0 flex-1">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-purple-500/20 to-indigo-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/30 flex items-center justify-center shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <h3 className="text-xs sm:text-base font-bold text-foreground">
                  Universal Multi-Parser
                </h3>
                {isUnlimitedTier ? (
                  <span className="px-2 py-0.5 text-[9px] sm:text-[10px] font-bold rounded-full bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30 inline-flex items-center gap-1 shrink-0">
                    <Crown className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-500" />
                    Pro Suite Unlocked
                  </span>
                ) : (
                  <span className="px-2 py-0.5 text-[9px] sm:text-[10px] font-bold rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 shrink-0">
                    ทดลองฟรี: เหลือ {freeTrialRemaining}/{MAX_FREE_TRIAL} ครั้ง
                  </span>
                )}
              </div>
              <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5 leading-snug">
                วางเรื่องย่อ / พล็อตนิยาย / หรือนำเข้าไฟล์ เพื่อให้ AI สกัด World + Lore + Characters พร้อมกัน
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer shrink-0"
            aria-label="ปิดหน้าต่าง"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-3.5 sm:p-6 space-y-3 sm:space-y-4 overflow-y-auto custom-scrollbar flex-1">
          {/* Quick Action Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-1.5 sm:gap-2">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.md,.json"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-2.5 sm:px-3 py-1.5 rounded-xl border border-border bg-muted/60 hover:bg-muted text-[11px] sm:text-xs font-semibold text-foreground flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
              >
                <Upload className="w-3.5 h-3.5 text-primary" />
                <span>นำเข้าไฟล์ (.txt, .md, .json)</span>
              </button>

              <button
                type="button"
                onClick={handleLoadSample}
                className="px-2.5 sm:px-3 py-1.5 rounded-xl border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 text-[11px] sm:text-xs font-semibold text-purple-600 dark:text-purple-400 flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
              >
                <FileText className="w-3.5 h-3.5 text-purple-500" />
                <span>โหลดตัวอย่างพล็อต</span>
              </button>
            </div>

            {rawText && (
              <button
                type="button"
                onClick={() => setRawText('')}
                className="text-[11px] sm:text-xs text-muted-foreground hover:text-rose-500 transition-colors py-1 cursor-pointer"
              >
                ล้างข้อความ
              </button>
            )}
          </div>

          {/* Large Text Input */}
          <div className="space-y-1">
            <textarea
              rows={5}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="วางพล็อตเรื่องย่อ, ปูมหลังโลก, กฎเกณฑ์, ไทม์ไลน์ หรือประวัติตัวละครทั้งหมดที่นี่..."
              className="w-full min-h-[140px] max-h-[400px] px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-xl sm:rounded-2xl bg-muted/40 border border-border text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-purple-500/40 leading-relaxed font-sans resize-y"
            />
          </div>

          {/* Live Section Requirements Detector */}
          <div className="p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-card border border-border/80 space-y-1.5 sm:space-y-2">
            <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
              <span>การตรวจจับองค์ประกอบหลัก (Requirements)</span>
              <span className="text-[10px] text-muted-foreground lowercase">
                {rawText ? `${rawText.length} ตัวอักษร` : 'ยังไม่มีข้อมูล'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 sm:gap-2 pt-0.5">
              <div
                className={`p-2 sm:p-2.5 rounded-xl border flex items-center gap-2 text-[11px] sm:text-xs font-semibold transition-all ${
                  detectedSections.hasWorld
                    ? 'bg-purple-500/10 border-purple-500/30 text-purple-600 dark:text-purple-400'
                    : 'bg-muted/30 border-border/50 text-muted-foreground'
                }`}
              >
                <Globe className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">1. World Setting</span>
                {detectedSections.hasWorld && <Check className="w-3.5 h-3.5 ml-auto text-emerald-500 shrink-0" />}
              </div>

              <div
                className={`p-2 sm:p-2.5 rounded-xl border flex items-center gap-2 text-[11px] sm:text-xs font-semibold transition-all ${
                  detectedSections.hasLore
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400'
                    : 'bg-muted/30 border-border/50 text-muted-foreground'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">2. Lore & Timeline</span>
                {detectedSections.hasLore && <Check className="w-3.5 h-3.5 ml-auto text-emerald-500 shrink-0" />}
              </div>

              <div
                className={`p-2 sm:p-2.5 rounded-xl border flex items-center gap-2 text-[11px] sm:text-xs font-semibold transition-all ${
                  detectedSections.hasChars
                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'
                    : 'bg-muted/30 border-border/50 text-muted-foreground'
                }`}
              >
                <Users className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">3. Main Characters (≥1)</span>
                {detectedSections.hasChars && <Check className="w-3.5 h-3.5 ml-auto text-emerald-500 shrink-0" />}
              </div>
            </div>
          </div>

          {/* Auto-Fill Missing Switch */}
          <label className="p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-muted/40 border border-border flex items-start gap-2.5 sm:gap-3 cursor-pointer hover:bg-muted/60 transition-colors">
            <input
              type="checkbox"
              checked={autoFillMissing}
              onChange={(e) => setAutoFillMissing(e.target.checked)}
              className="mt-0.5 rounded text-purple-600 focus:ring-purple-500 w-4 h-4 cursor-pointer shrink-0"
            />
            <div className="text-xs space-y-0.5 min-w-0 flex-1">
              <span className="font-bold text-foreground flex items-center gap-1.5 flex-wrap">
                <Sparkles className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                <span>ให้ AI ช่วยคิดเติมองค์ประกอบส่วนที่ขาดให้ครบสมบูรณ์</span>
              </span>
              <p className="text-muted-foreground leading-relaxed text-[10px] sm:text-[11px]">
                หากข้อความของคุณมีเพียงฉากหรือ Lore แต่ยังไม่มีตัวละคร AI จะออกแบบตัวละครเอกและสายสัมพันธ์ที่เข้ากับโลกให้โดยอัตโนมัติ
              </p>
            </div>
          </label>

          {/* Error Message */}
          {error && (
            <div className="p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 p-3.5 sm:px-6 sm:py-4 border-t border-border bg-muted/20 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          <div className="flex items-center justify-between sm:justify-start gap-2 text-[11px] sm:text-xs text-muted-foreground">
            {!isUnlimitedTier && (
              <span>
                {isTrialExhausted
                  ? '⚠️ ใช้สิทธิ์ทดลองครบแล้ว'
                  : `สิทธิ์ทดลองเหลือ ${freeTrialRemaining} ครั้ง`}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer text-center"
            >
              ยกเลิก
            </button>

            {isTrialExhausted ? (
              <button
                type="button"
                onClick={onOpenUpgradeModal}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-600 hover:to-rose-700 text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
              >
                <Crown className="w-4 h-4 shrink-0" />
                <span>ปลดล็อค Pro (99.-)</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleStartParse}
                disabled={isLoading || !rawText.trim()}
                className="flex-1 sm:flex-none px-4 sm:px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-95"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                    <span className="truncate">กำลังสกัดโครงสร้าง...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 shrink-0" />
                    <span className="truncate">สกัดและนำเข้าสู่ Studio</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

