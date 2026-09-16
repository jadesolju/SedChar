'use client';
import { useState, useMemo } from 'react';

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
  const [copied, setCopied] = useState(false);
  const [parseNotice, setParseNotice] = useState(false);

  // Analyze which sections are detected in the pasted text
  const detectedSections = useMemo(() => {
    return [
      { name: 'ข้อมูลพื้นฐาน', detected: /ข้อมูลพื้นฐาน|Character Profile/i.test(rawMarkdown) },
      { name: 'รูปลักษณ์', detected: /ลักษณะภายนอก|Appearance/i.test(rawMarkdown) },
      { name: 'ส่วนลับ NSFW', detected: /ส่วนลับ|NSFW/i.test(rawMarkdown) },
      { name: 'จิตวิทยา & นิสัย', detected: /นิสัยและพฤติกรรม|Psychology/i.test(rawMarkdown) },
      { name: 'โครงสร้างจิตวิทยา 7 ข้อ', detected: /Core Belief|Mindset/i.test(rawMarkdown) },
      { name: 'ความสัมพันธ์ {{user}}', detected: /ตัวตนของ\s*\{\{user\}\}|Story Role/i.test(rawMarkdown) },
      { name: 'ขอบเขต & Logic', detected: /สิ่งที่จะไม่ทำเด็ดขาด|Anti-Behaviors/i.test(rawMarkdown) },
      { name: 'พฤติกรรมทางเพศ', detected: /พฤติกรรมทางเพศ|Sexual Behavior/i.test(rawMarkdown) },
      { name: 'ตัวละครเสริม', detected: /ตัวละครเสริม|Supporting/i.test(rawMarkdown) },
      { name: 'ฉากเปิด Greeting', detected: /ฉากเปิด|Open Greeting/i.test(rawMarkdown) },
    ];
  }, [rawMarkdown]);

  const detectedCount = detectedSections.filter(s => s.detected).length;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(rawMarkdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleParseClick = () => {
    onApplyParse(rawMarkdown);
    setParseNotice(true);
    setTimeout(() => setParseNotice(false), 3000);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-background">
      {/* Action Header */}
      <div className="flex-shrink-0 p-3.5 border-b border-border bg-card/60 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base">📝</span>
            <div>
              <h2 className="text-xs font-bold text-foreground">Input แบบช่องเดียวรวด (Markdown Auto-Parser)</h2>
              <p className="text-[11px] text-muted-foreground">
                วางข้อความ Markdown ทั้งหมด แล้วกดแปลงเพื่อแยกข้อมูลลงแต่ละช่องอัตโนมัติ
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onLoadSample}
              className="text-xs px-2.5 py-1 rounded-md bg-secondary hover:bg-secondary/80 text-secondary-foreground border border-border transition-colors flex items-center gap-1"
            >
              <span>📄</span> โหลดตัวอย่าง
            </button>
            <button
              type="button"
              onClick={handleCopy}
              className="text-xs px-2.5 py-1 rounded-md bg-muted hover:bg-muted/80 text-muted-foreground transition-colors flex items-center gap-1"
            >
              {copied ? <span>✓ คัดลอกแล้ว</span> : <span>📋 คัดลอก</span>}
            </button>
            <button
              type="button"
              onClick={onClear}
              className="text-xs px-2 py-1 rounded-md hover:bg-rose-500/10 text-rose-600 dark:text-rose-400 transition-colors"
              title="ล้างกล่องข้อความ"
            >
              ล้าง
            </button>
          </div>
        </div>

        {/* Section detector badges */}
        <div className="flex flex-wrap items-center gap-1 pt-1">
          <span className="text-[10px] text-muted-foreground font-medium mr-1">
            พบ {detectedCount}/{detectedSections.length} ส่วน:
          </span>
          {detectedSections.map(s => (
            <span
              key={s.name}
              className={`text-[10px] px-1.5 py-0.5 rounded transition-colors ${
                s.detected
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-medium'
                  : 'bg-muted/50 text-muted-foreground/50 border border-border/40'
              }`}
            >
              {s.detected ? '✓ ' : '· '}{s.name}
            </span>
          ))}
        </div>
      </div>

      {/* Text Area */}
      <div className="flex-1 p-3 overflow-hidden flex flex-col">
        <textarea
          value={rawMarkdown}
          onChange={e => onChangeRaw(e.target.value)}
          placeholder={`วาง Markdown ข้อมูลตัวละครตาม Template ที่นี่...

ตัวอย่าง:
## **[ข้อมูลพื้นฐาน - Character Profile (General Info)]**
- **ชื่อเล่น**: คิง
- **ชื่อเต็ม**: คชา รัตนเวคิน
- **อายุ**: 28 ปี
- **เพศ**: ชาย
- **MBTI**: ISTP
...`}
          className="flex-1 w-full p-3.5 text-xs font-mono bg-card text-foreground rounded-lg border border-border focus:border-primary focus:ring-1 focus:ring-primary resize-none overflow-y-auto leading-relaxed outline-none"
        />
      </div>

      {/* Parse & Sync Footer */}
      <div className="flex-shrink-0 p-3 border-t border-border bg-card/60 flex items-center justify-between gap-3">
        <div className="text-[11px] text-muted-foreground flex items-center gap-2">
          <span>{rawMarkdown.length.toLocaleString('th-TH')} ตัวอักษร</span>
          <span>·</span>
          <span>{rawMarkdown.split('\n').length} บรรทัด</span>
          {parseNotice && (
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold animate-fade-in">
              ✓ แยกส่วนข้อมูลเข้าฟอร์มเรียบร้อยแล้ว!
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={handleParseClick}
          className="px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5"
        >
          <span>🚀</span> แปลง & แยกส่วนข้อมูลเข้าฟอร์ม
        </button>
      </div>
    </div>
  );
}