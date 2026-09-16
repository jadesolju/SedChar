'use client';
import React, { useState, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';

interface SingleBoxInputProps {
  rawMarkdown: string;
  onChangeRaw: (text: string) => void;
  onApplyParse: (text: string) => void;
  onLoadSample: () => void;
  onClear: () => void;
}

export function SingleBoxInput({
  rawMarkdown,
  onChangeRaw,
  onApplyParse,
  onLoadSample,
  onClear,
}: SingleBoxInputProps) {
  const { user, quotaRemaining, quotaMax, consumeQuota, openAuthModal } = useAuth();

  const [copied, setCopied] = useState(false);
  const [parseNotice, setParseNotice] = useState<string | null>(null);
  const [quotaWarning, setQuotaWarning] = useState(false);

  // Analyze which sections are detected in ANY format (Plaintext, JSON, YAML, Markdown)
  const detectedSections = useMemo(() => {
    return [
      { name: 'ข้อมูลพื้นฐาน', detected: /(?:ข้อมูลพื้นฐาน|Character Profile|ชื่อ|name|nickname|อายุ|age)/i.test(rawMarkdown) },
      { name: 'รูปลักษณ์', detected: /(?:ลักษณะภายนอก|Appearance|รูปลักษณ์|visual|ผมสี|ตาสี)/i.test(rawMarkdown) },
      { name: 'ส่วนลับ NSFW', detected: /(?:ส่วนลับ|NSFW|โจ้ย|หน้าอก|จิ๊มิ|sex)/i.test(rawMarkdown) },
      { name: 'จิตวิทยา & นิสัย', detected: /(?:นิสัย|Psychology|Personality|traits|ซึน|ยัน|คูล)/i.test(rawMarkdown) },
      { name: 'สิ่งที่ชอบ/เกลียด', detected: /(?:สิ่งที่ชอบ|Likes|Dislikes|เกลียด)/i.test(rawMarkdown) },
      { name: 'ความสัมพันธ์ {{user}}', detected: /(?:ความสัมพันธ์|Relationship|{{user}})/i.test(rawMarkdown) },
      { name: 'กฎระบบ & ข้อห้าม', detected: /(?:กฎระบบ|Directives|ขอบเขต|ข้อห้าม)/i.test(rawMarkdown) },
      { name: 'ตัวละครเสริม', detected: /(?:ตัวละครเสริม|Supporting Characters|คนรอบข้าง)/i.test(rawMarkdown) },
      { name: 'สถานที่ในเรื่อง', detected: /(?:สถานที่|Locations|ฉากหลัง|บรรยากาศ)/i.test(rawMarkdown) },
      { name: 'ฉากเปิด (Greeting)', detected: /(?:ฉากเปิด|Open Greeting|คำทักทาย|greeting)/i.test(rawMarkdown) },
    ];
  }, [rawMarkdown]);

  const detectedCount = detectedSections.filter((s) => s.detected).length;

  const handleCopy = async () => {
    if (!rawMarkdown) return;
    try {
      await navigator.clipboard.writeText(rawMarkdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const handleApply = () => {
    if (!rawMarkdown.trim()) return;

    if (!user) {
      openAuthModal('signin');
      return;
    }

    if (quotaRemaining <= 0) {
      setQuotaWarning(true);
      setTimeout(() => setQuotaWarning(false), 4000);
      return;
    }

    const ok = consumeQuota();
    if (ok) {
      onApplyParse(rawMarkdown);
      setParseNotice(`⚡ ซิงค์ข้อมูลเข้า Form สำเร็จ! (ใช้สิทธิ์ AI สำเร็จ เหลือ ${quotaRemaining - 1}/${quotaMax} ครั้งวันนี้)`);
      setTimeout(() => setParseNotice(null), 3500);
    }
  };

  return (
    <div className="flex flex-col h-full bg-card rounded-xl border border-border overflow-hidden">
      {/* Top Header Toolbar */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-2.5 border-b border-border bg-muted/40">
        <div className="flex items-center gap-2">
          <span className="text-sm">⚡</span>
          <h2 className="text-xs font-bold uppercase tracking-wider text-foreground">
            Auto-Parser ช่องเดียวรวด
          </h2>
          <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 font-bold border border-emerald-500/20">
            Plaintext / MD / JSON / YAML
          </span>
        </div>

        {/* Quota indicator */}
        <div className="flex items-center gap-2">
          {user ? (
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/25">
              โควตา AI วันนี้: <strong>{quotaRemaining}/{quotaMax}</strong>
            </span>
          ) : (
            <button
              type="button"
              onClick={() => openAuthModal('signin')}
              className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/25 hover:bg-amber-500/20 transition-all cursor-pointer"
            >
              🔒 เข้าสู่ระบบเพื่อรับโควตา 5 ครั้ง/วัน
            </button>
          )}

          <button
            type="button"
            onClick={onLoadSample}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-border bg-card hover:bg-muted text-foreground transition-all cursor-pointer shadow-xs"
          >
            📋 โหลดตัวอย่าง
          </button>
          <button
            type="button"
            onClick={onClear}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-border bg-card hover:bg-rose-500/10 hover:text-rose-500 text-muted-foreground transition-all cursor-pointer shadow-xs"
          >
            🗑️ ล้าง
          </button>
        </div>
      </div>

      {/* Guest Lock Banner */}
      {!user && (
        <div className="flex-shrink-0 px-4 py-3 bg-gradient-to-r from-rose-500/10 via-pink-500/10 to-amber-500/10 border-b border-primary/20 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-xs text-foreground">
            <span className="text-base">🔒</span>
            <div>
              <span className="font-bold text-primary">ฟีเจอร์สำหรับสมาชิก: </span>
              <span className="text-muted-foreground">เข้าสู่ระบบเพื่อใช้งาน Auto-Parser แปลงข้อความอัตโนมัติ (รับโควตาฟรี 5 ครั้ง/วัน)</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => openAuthModal('signin')}
            className="flex-shrink-0 px-3 py-1.5 rounded-lg bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
          >
            เข้าสู่ระบบทันที
          </button>
        </div>
      )}

      {/* Notification Toast */}
      {parseNotice && (
        <div className="flex-shrink-0 px-4 py-2 bg-emerald-500/15 border-b border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center justify-between animate-in fade-in">
          <span>{parseNotice}</span>
        </div>
      )}

      {quotaWarning && (
        <div className="flex-shrink-0 px-4 py-2 bg-amber-500/15 border-b border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-semibold flex items-center justify-between animate-in fade-in">
          <span>⚠️ คุณใช้โควตา AI ประจำวันครบ 5 ครั้งแล้ว (ระบบจะรีเซ็ตใหม่อัตโนมัติทุกเที่ยงคืน)</span>
        </div>
      )}

      {/* Main Textarea */}
      <div className="flex-1 relative p-3">
        <textarea
          value={rawMarkdown}
          onChange={(e) => onChangeRaw(e.target.value)}
          placeholder={`วางข้อความตัวละครรูปแบบใดก็ได้ที่นี่:
1. Markdown: # ชื่อตัวละคร, ## 1. ข้อมูลพื้นฐาน...
2. JSON: { "name": "...", "age": "24", "traits": "..." }
3. YAML: name: "...", gender: "ชาย", personality: "..."
4. Plaintext: ชื่อ: คชา, อายุ: 28, นิสัย: เย็นชาแต่รักเดียวใจเดียว...

กดปุ่ม "แปลงข้อมูลสู่ฟอร์ม" ด้านล่างเพื่อซิงค์ข้อมูลเข้าสู่ 10 หมวดหมู่แบบ 100%`}
          className="w-full h-full p-4 rounded-xl bg-[#1F1F24] border border-border text-sm text-foreground placeholder:text-muted-foreground/60 font-mono resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all leading-relaxed"
        />
      </div>

      {/* Detection Pills & Action Footer */}
      <div className="flex-shrink-0 px-4 py-3 border-t border-border bg-muted/30 space-y-2.5">
        {/* Detection Status */}
        <div className="flex items-center justify-between">
          <div className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5">
            <span>ตรวจพบข้อมูลแล้ว:</span>
            <span className="font-bold text-foreground">{detectedCount} / 10 หมวดหมู่</span>
          </div>
          <button
            type="button"
            onClick={handleCopy}
            disabled={!rawMarkdown}
            className="text-[11px] text-muted-foreground hover:text-foreground transition-all cursor-pointer disabled:opacity-30"
          >
            {copied ? '✅ คัดลอกแล้ว' : '📋 คัดลอกข้อความทั้งหมด'}
          </button>
        </div>

        {/* Section Tags */}
        <div className="flex flex-wrap gap-1">
          {detectedSections.map((s) => (
            <span
              key={s.name}
              className={`text-[10px] px-2 py-0.5 rounded-md font-medium transition-all ${
                s.detected
                  ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/25'
                  : 'bg-muted/60 text-muted-foreground/50 border border-border/40'
              }`}
            >
              {s.detected ? '✓ ' : '○ '}
              {s.name}
            </span>
          ))}
        </div>

        {/* Big Action Buttons */}
        <div className="pt-1 flex items-center gap-2">
          <button
            type="button"
            onClick={handleApply}
            disabled={!rawMarkdown.trim()}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 hover:from-rose-600 hover:to-pink-700 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-[0.99] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <span>✨</span>
            <span>แปลงข้อมูลสู่ฟอร์ม (Auto-Parse & Sync)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
