'use client';
import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Loader2,
  Wand2,
  Globe,
  BookOpen,
  Users,
  Check,
  AlertCircle,
} from 'lucide-react';

interface SectionAutoPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  section: 'world' | 'lore' | 'characters';
  context?: any;
  onApply: (data: any) => void;
  onShowToast: (msg: string) => void;
}

const SECTION_META = {
  world: {
    title: 'AI ช่วยสร้าง World Setting & กฎเกณฑ์โลก',
    desc: 'พิมพ์ไอเดียหรือแนวเรื่องย่อ เพื่อให้ AI ช่วยแตกเป็น กฎโลก, ยุคสมัย, ฝ่าย/องค์กร และบรรยากาศ',
    icon: Globe,
    placeholder: 'เช่น โลกยุคไซเบอร์พังก์ผสมเวทมนตร์โบราณ มี 3 ตระกูลใหญ่คุมพลังงานไฟฟ้าเวทมนตร์...',
    color: 'text-purple-500',
    bg: 'bg-purple-500/10 border-purple-500/20',
  },
  lore: {
    title: 'AI ช่วยสร้าง Lorebook & ไทม์ไลน์ประวัติศาสตร์',
    desc: 'พิมพ์ปมความขัดแย้งหรือความลับ เพื่อให้ AI ช่วยสร้าง ไทม์ไลน์เหตุการณ์สำคัญ, ภูมิหลัง และข้อห้าม',
    icon: BookOpen,
    placeholder: 'เช่น สงครามเมื่อ 10 ปีก่อนทำให้เมืองหลวงถูกแยกเป็นสองฝั่ง มีความลับเรื่องสายเลือดต้องห้าม...',
    color: 'text-amber-500',
    bg: 'bg-amber-500/10 border-amber-500/20',
  },
  characters: {
    title: 'AI ช่วยออกแบบตัวละครหลัก & สายสัมพันธ์ (Cast)',
    desc: 'พิมพ์รายชื่อหรือบทบาทตัวละคร เพื่อให้ AI ช่วยออกแบบ นิสัย, ธงความสัมพันธ์, และสายสัมพันธ์ข้ามตัวละคร',
    icon: Users,
    placeholder: 'เช่น ตัวเอกเป็นอัศวินแปรพักตร์, มีเพื่อนสนิทธงแตงโมที่คอยหักหลัง, และมีหัวหน้าองค์กรลึกลับ...',
    color: 'text-rose-500',
    bg: 'bg-rose-500/10 border-rose-500/20',
  },
};

export function SectionAutoPromptModal({
  isOpen,
  onClose,
  section,
  context,
  onApply,
  onShowToast,
}: SectionAutoPromptModalProps) {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const meta = SECTION_META[section];
  const IconComponent = meta.icon;

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('กรุณาพิมพ์ข้อมูลหรือไอเดียคร่าวๆ ก่อนกดสร้าง');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/universe/auto-section', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section,
          prompt: prompt.trim(),
          context,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'AI generation failed');
      }

      onApply(json.data);
      onShowToast(`เติมข้อมูล ${section} อัตโนมัติเรียบร้อยแล้ว!`);
      onClose();
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดในการประมวลผล');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl bg-card border border-border shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/30">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl border ${meta.bg} ${meta.color}`}>
              <IconComponent className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                {meta.title}
              </h3>
              <p className="text-xs text-muted-foreground">
                ประมวลผลเฉพาะส่วนด้วย AI ความเร็วสูง
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 overflow-y-auto">
          <p className="text-xs text-muted-foreground leading-relaxed">
            {meta.desc}
          </p>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">
              ไอเดีย / คีย์เวิร์ด / เรื่องย่อ
            </label>
            <textarea
              rows={5}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={meta.placeholder}
              className="w-full px-3.5 py-2.5 rounded-xl bg-muted/40 border border-border text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40 leading-relaxed resize-none"
            />
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-border bg-muted/20 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
          >
            ยกเลิก
          </button>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isLoading || !prompt.trim()}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>กำลังวิเคราะห์...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>เริ่มสร้างข้อมูล</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
