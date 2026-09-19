'use client';
import { Wand2, Sparkles, RotateCcw, Trash2, FileUp, Check } from 'lucide-react';
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import type { ThaiMasterCharacter } from '@/shared/types';

export type TargetPlatformType = 'all' | 'purrpaw' | 'rubii' | 'khui';

interface SingleBoxInputProps {
  isReadOnly?: boolean;
  rawMarkdown: string;
  onChangeRaw: (text: string) => void;
  onApplyParse: (text: string) => void;
  onApplyParsedCharacter?: (char: ThaiMasterCharacter) => void;
  onParseSuccess?: (notice: string) => void;
  onLoadSample: () => void;
  onClear: () => void;
}

export function SingleBoxInput({
  isReadOnly = false,
  rawMarkdown,
  onChangeRaw,
  onApplyParse,
  onApplyParsedCharacter,
  onParseSuccess,
  onLoadSample,
  onClear,
}: SingleBoxInputProps) {
  const { user, quotaRemaining, quotaMax, consumeQuota, openAuthModal } = useAuth();

  const [targetPlatform, setTargetPlatform] = useState<TargetPlatformType>('all');

  const [copied, setCopied] = useState(false);
  const [parseNotice, setParseNotice] = useState<string | null>(null);
  const [quotaWarning, setQuotaWarning] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showTagDetails, setShowTagDetails] = useState(false);
  const fullscreenTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Focus fullscreen textarea when opened
  useEffect(() => {
    if (isFullscreen && fullscreenTextareaRef.current) {
      fullscreenTextareaRef.current.focus();
    }
  }, [isFullscreen]);

  // Handle escape key to close fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  // Analyze which sections are detected in ANY format (Plaintext, JSON, YAML, Markdown)
  const detectedSections = useMemo(() => {
    return [
      { name: 'ข้อมูลพื้นฐาน', detected: /(?:ข้อมูลพื้นฐาน|Character Profile|ชื่อ|name|nickname|อายุ|age)/i.test(rawMarkdown) },
      { name: 'รูปลักษณ์', detected: /(?:ลักษณะภายนอก|Appearance|รูปลักษณ์|visual|ผมสี|ตาสี)/i.test(rawMarkdown) },
      { name: 'ส่วนลับ NSFW', detected: /(?:ส่วนลับ|NSFW|โจ้ย|หน้าอก|จิ๊มิ|sex)/i.test(rawMarkdown) },
      { name: 'จิตวิทยา & นิสัย', detected: /(?:นิสัย|Psychology|Personality|traits|ซึน|ยัน|คูล)/i.test(rawMarkdown) },
      { name: 'สิ่งที่ชอบ/เกลียด', detected: /(?:สิ่งที่ชอบ|Likes|Dislikes|เกลียด)/i.test(rawMarkdown) },
      { name: 'ความสัมพันธ์ {{user}}', detected: /(?:ความสัมพันธ์|Relationship|{{user}}|User)/i.test(rawMarkdown) },
      { name: 'กฎระบบ & ข้อห้าม', detected: /(?:กฎระบบ|System Rules|ข้อห้าม|ห้าม|Anti-Behavior)/i.test(rawMarkdown) },
      { name: 'สไตล์บนเตียง', detected: /(?:บนเตียง|Sexual Style|Kinks|Aftercare|ลีลา)/i.test(rawMarkdown) },
      { name: 'ตัวละครเสริม & สถานที่', detected: /(?:ตัวละครเสริม|Sub-character|สถานที่|Location|ฉาก)/i.test(rawMarkdown) },
      { name: 'คำโปรย & ฉากเปิด', detected: /(?:คำโปรย|เรื่องย่อ|Greeting|ฉากเปิด|Punchline)/i.test(rawMarkdown) },
    ];
  }, [rawMarkdown]);

  const detectedCount = detectedSections.filter((s) => s.detected).length;

  const handleCopy = async () => {
    if (!rawMarkdown) return;
    try {
      await navigator.clipboard.writeText(rawMarkdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { }
  };

  const handleApply = async () => {
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

    setIsParsing(true);

    try {
      // 1. Try Google Gemini API Endpoint
      const res = await fetch('/api/ai/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText: rawMarkdown, targetPlatform }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.character) {
          if (onApplyParsedCharacter) {
            onApplyParsedCharacter(data.character);
          } else {
            onApplyParse(rawMarkdown);
          }
          consumeQuota();
          const modelTag = data.model === 'gemini-ai' ? 'Gemini AI ⚡ ⚡' : 'Universal Parser ⚡';
          const msg = '✨ แปลงข้อมูลด้วย ' + modelTag + ' เข้าสู่ 10 หมวดหมู่เรียบร้อยแล้ว!';
          setParseNotice(msg);
          if (onParseSuccess) {
            onParseSuccess(msg);
          }
          if (isFullscreen) setIsFullscreen(false);
          setIsParsing(false);
          return;
        }
      }
    } catch (err) {
      console.warn('API error, falling back to local parse:', err);
    }

    // Fallback: Local Client-Side Parser
    consumeQuota();
    onApplyParse(rawMarkdown);
    const fallbackMsg = '⚡ แปลงข้อมูลด้วย Universal Parser เข้าสู่ 10 หมวดหมู่เรียบร้อยแล้ว!';
    setParseNotice(fallbackMsg);
    if (onParseSuccess) {
      onParseSuccess(fallbackMsg);
    }
    if (isFullscreen) setIsFullscreen(false);
    setIsParsing(false);
  };

  return (
    <div className="flex flex-col h-full bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
      {/* Top Header Toolbar */}
      <div className="flex-shrink-0 flex items-center justify-between px-3.5 py-2 sm:px-4 sm:py-2.5 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2">
          <span className="text-base sm:text-lg">✨</span>
          <div>
            <h2 className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <span>สร้างตัวละครช่องเดียว</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-primary/10 text-primary font-semibold hidden sm:inline">
                AI Auto-Parser
              </span>
            </h2>
          </div>
        </div>

        {/* Quota indicator & Quick Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {user ? (
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-primary/10 text-primary border border-primary/20">
              โควตา AI: <strong>{quotaRemaining}/{quotaMax}</strong>
            </span>
          ) : (
            <button
              type="button"
              onClick={() => openAuthModal('signin')}
              className="text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/25 hover:bg-amber-500/20 transition-all cursor-pointer"
            >
              🔒 เข้าสู่ระบบรับ 15 ครั้ง/วัน
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsFullscreen(true)}
            title="ขยายเต็มจอ"
            className="px-2 py-1 text-xs font-semibold rounded-lg border border-border bg-card hover:border-primary/50 text-foreground transition-all cursor-pointer shadow-2xs flex items-center gap-1"
          >
            <span>⛶</span>
            <span className="hidden sm:inline">เต็มจอ</span>
          </button>

          <button
            type="button"
            onClick={onLoadSample}
            title="โหลดข้อมูลตัวอย่าง"
            className="px-2 py-1 text-xs font-semibold rounded-lg border border-border bg-card hover:bg-muted text-foreground transition-all cursor-pointer shadow-2xs flex items-center gap-1"
          >
            <span>📋</span>
            <span>ตัวอย่าง</span>
          </button>
          <button
            type="button"
            onClick={onClear}
            title="ล้างข้อความ"
            className="px-2 py-1 text-xs font-semibold rounded-lg border border-border bg-card hover:bg-rose-500/10 hover:text-rose-500 text-muted-foreground transition-all cursor-pointer shadow-2xs"
          >
            🗑️
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
              <span className="text-muted-foreground">เข้าสู่ระบบเพื่อใช้งาน Auto-Parser แปลงข้อความอัตโนมัติด้วย (รับโควตาฟรี 15 ครั้ง/วัน)</span>
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
          <span>⚠️ คุณใช้โควตา AI ประจำวันครบ 15 ครั้งแล้ว (ระบบจะรีเซ็ตใหม่อัตโนมัติทุกเที่ยงคืน)</span>
        </div>
      )}

      {/* Main Textarea */}
      <div className="flex-1 relative p-3">
        <textarea
          value={rawMarkdown}
          onChange={(e) => !isReadOnly && onChangeRaw(e.target.value)}
          readOnly={isReadOnly}
          placeholder={`วางข้อความตัวละครรูปแบบใดก็ได้ที่นี่:
1. Markdown: # ชื่อตัวละคร, ## 1. ข้อมูลพื้นฐาน...
2. JSON: { "name": "...", "age": "24", "traits": "..." }
3. YAML: name: "...", gender: "ชาย", personality: "..."
4. Plaintext: ชื่อ: คชา, อายุ: 28, นิสัย: เย็นชาแต่รักเดียวใจเดียว...

กดปุ่ม "แปลงข้อมูลสู่ฟอร์ม" ด้านล่างเพื่อซิงค์ข้อมูลเข้าสู่ 10 หมวดหมู่แบบ 100%`}
          className={`w-full h-full p-4 rounded-xl bg-muted/50 border border-border text-sm text-foreground placeholder:text-muted-foreground/60 font-mono resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all leading-relaxed ${isReadOnly ? "bg-muted/30 cursor-not-allowed select-text" : ""}`}
        />

        {/* Quick expand floating button */}
        <button
          type="button"
          onClick={() => setIsFullscreen(true)}
          title="ขยายช่องเขียนเต็มจอ"
          className="absolute bottom-5 right-5 p-1.5 rounded-lg bg-card/90 backdrop-blur-xs border border-border text-muted-foreground hover:text-primary transition-all text-xs cursor-pointer shadow-sm flex items-center gap-1"
        >
          <span>⛶</span>
          <span className="text-[10px] font-semibold">ขยายเต็มจอ</span>
        </button>
      </div>

      {/* Minimal Detection Tracking & Hero Action Footer */}
      <div className="flex-shrink-0 px-3.5 py-2.5 border-t border-border bg-card space-y-2">
        {isReadOnly && (
          <div className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-semibold flex items-center gap-1.5">
            <span>🔒</span>
            <span>โหมดอ่านอย่างเดียว (Read-Only)</span>
          </div>
        )}

        {/* Minimal Progress/Tracking Bar (~10% height) */}
        <div className="flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={() => setShowTagDetails(!showTagDetails)}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer text-left"
          >
            <span className="text-[11px] font-semibold text-muted-foreground">
              ตรวจพบข้อมูล: <strong className="text-primary font-bold">{detectedCount}/10</strong> หมวดหมู่
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground border border-border">
              {showTagDetails ? 'ซ่อน' : 'ดูรายละเอียด ▾'}
            </span>
          </button>

          <button
            type="button"
            onClick={handleCopy}
            disabled={!rawMarkdown}
            className="text-[11px] font-semibold text-muted-foreground hover:text-foreground transition-all cursor-pointer disabled:opacity-30"
          >
            {copied ? '✅ คัดลอกแล้ว' : '📋 คัดลอก'}
          </button>
        </div>

        {/* Collapsible Tag Pills for Detailed View */}
        {showTagDetails && (
          <div className="flex flex-wrap gap-1 pt-1 pb-1 animate-in fade-in duration-150">
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
        )}

        {/* Hero Action Button */}
        <div className="pt-0.5">
          <button
            type="button"
            onClick={handleApply}
            disabled={!rawMarkdown.trim() || isParsing || isReadOnly}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 hover:from-rose-600 hover:to-pink-700 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-[0.99] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <span className="text-sm">{isParsing ? '⏳' : '✨'}</span>
            <span>{isParsing ? 'กำลังวิเคราะห์ด้วย Gemini AI...' : 'AI ช่วยเติม / แปลงข้อมูลอัตโนมัติ'}</span>
          </button>
        </div>
      </div>

      {/* FULLSCREEN FOCUS MODAL FOR SINGLE BOX */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
          <div className="relative w-full max-w-5xl h-[92vh] flex flex-col bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
            {/* Top Fullscreen Header */}
            <div className="flex-shrink-0 flex items-center justify-between px-5 py-3.5 border-b border-border bg-muted/40">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-rose-500 to-pink-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                  ⚡
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    Auto-Parser โหมดแก้ไขข้อความเต็มจอ (Gemini AI Enhanced)
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    ตรวจพบ {detectedCount}/10 หมวดหมู่ • รองรับ Plaintext / Markdown / JSON / YAML
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs px-2.5 py-1 rounded-md bg-muted text-muted-foreground font-mono">
                  {rawMarkdown.length.toLocaleString()} ตัวอักษร
                </span>

                <button
                  type="button"
                  onClick={handleApply}
                  disabled={!rawMarkdown.trim() || isParsing}
                  className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-40"
                >
                  <span>{isParsing ? '⏳' : '✨'}</span>
                  <span>{isParsing ? 'กำลังวิเคราะห์...' : 'แปลงข้อมูลทันที (Sync & Close)'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsFullscreen(false)}
                  className="px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 text-foreground text-xs font-semibold transition-all cursor-pointer"
                >
                  ปิด (Esc)
                </button>
              </div>
            </div>

            {/* Large Fullscreen Textarea */}
            <div className="flex-1 p-5 bg-background relative flex flex-col">
              <textarea
                ref={fullscreenTextareaRef}
                value={rawMarkdown}
                readOnly={isReadOnly}
                onChange={(e) => !isReadOnly && onChangeRaw(e.target.value)}
                placeholder="วางหรือเขียนเนื้อหาตัวละครแบบอิสระที่นี่..."
                className={`w-full flex-1 p-5 rounded-xl bg-muted/50 border border-border text-base text-foreground placeholder:text-muted-foreground/50 font-mono resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all leading-relaxed shadow-inner ${isReadOnly ? 'bg-muted/30 cursor-not-allowed select-text' : ''}`}
              />
            </div>

            {/* Bottom Fullscreen Helper Footer */}
            <div className="flex-shrink-0 px-5 py-2.5 border-t border-border bg-muted/20 flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                {detectedSections.map((s) => (
                  <span
                    key={s.name}
                    className={`text-[10px] px-2 py-0.5 rounded font-medium ${s.detected ? 'bg-emerald-500/15 text-emerald-500 font-bold' : 'text-muted-foreground/40'
                      }`}
                  >
                    {s.detected ? '✓ ' : '○ '}{s.name}
                  </span>
                ))}
              </div>
              {!isReadOnly && (
                <button
                  type="button"
                  onClick={onClear}
                  className="text-xs text-muted-foreground hover:text-rose-500 transition-colors cursor-pointer"
                >
                  🗑️ ล้างทั้งหมด
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}