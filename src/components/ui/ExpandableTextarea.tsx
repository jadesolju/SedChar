'use client';
import React, { useState, useRef, useEffect } from 'react';

interface ExpandableTextareaProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  label?: string;
  hint?: string;
  charLimit?: number;
  className?: string;
  allowFullscreen?: boolean;
}

export function ExpandableTextarea({
  id,
  value,
  onChange,
  placeholder,
  rows = 4,
  label,
  hint,
  charLimit,
  className = '',
  allowFullscreen = true,
}: ExpandableTextareaProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
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

  const handleCopy = async () => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const charCount = value ? value.length : 0;
  const effectiveRows = isExpanded ? Math.max(rows * 2.5, 10) : rows;

  return (
    <div className="relative group w-full space-y-1.5">
      {/* Header with Title and Quick Expand Toolbar */}
      {(label || hint || allowFullscreen) && (
        <div className="flex items-center justify-between gap-2">
          {label ? (
            <label htmlFor={id} className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <span>{label}</span>
              {hint && <span className="text-[11px] font-normal text-muted-foreground">({hint})</span>}
            </label>
          ) : <div />}

          <div className="flex items-center gap-1">
            {/* Char Counter */}
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
              charLimit && charCount > charLimit
                ? 'bg-rose-500/15 text-rose-500 font-bold'
                : 'text-muted-foreground/80'
            }`}>
              {charCount.toLocaleString()}{charLimit ? `/${charLimit.toLocaleString()}` : ''} ตัวอักษร
            </span>

            {/* Expand / Collapse Height Toggle */}
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              title={isExpanded ? 'ย่อความสูงลง' : 'ขยายความสูงช่องกรอก'}
              className={`p-1 rounded-md text-[11px] font-medium transition-all cursor-pointer flex items-center gap-0.5 ${
                isExpanded
                  ? 'bg-primary/15 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {isExpanded ? (
                  <>
                    <polyline points="4 14 12 6 20 14" />
                    <polyline points="4 20 12 12 20 20" />
                  </>
                ) : (
                  <>
                    <polyline points="4 10 12 18 20 10" />
                    <polyline points="4 4 12 12 20 4" />
                  </>
                )}
              </svg>
              <span>{isExpanded ? 'ย่อลง' : 'ขยายช่อง'}</span>
            </button>

            {/* Fullscreen Modal Toggle */}
            {allowFullscreen && (
              <button
                type="button"
                onClick={() => setIsFullscreen(true)}
                title="ขยายเต็มจอ (Fullscreen Focus Mode)"
                className="p-1 px-1.5 rounded-md text-[11px] font-medium text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all cursor-pointer flex items-center gap-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                </svg>
                <span>เต็มจอ</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Textarea Container */}
      <div className="relative w-full">
        <textarea
          ref={textareaRef}
          id={id}
          rows={effectiveRows}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full p-3 rounded-xl bg-muted/50 border border-border text-sm text-foreground placeholder:text-muted-foreground/60 font-sans resize-y focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all leading-relaxed ${
            isExpanded ? 'min-h-[220px]' : 'min-h-[100px]'
          } ${className}`}
        />

        {/* Quick action floating buttons on bottom right */}
        <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity bg-card/90 backdrop-blur-xs p-0.5 rounded-lg border border-border/60 shadow-xs">
          {value && (
            <button
              type="button"
              onClick={handleCopy}
              title="คัดลอกข้อความ"
              className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted text-[10px] cursor-pointer"
            >
              {copied ? '✅' : '📋'}
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsFullscreen(true)}
            title="ขยายเต็มจอเพื่อเขียนยาวๆ"
            className="p-1 rounded text-muted-foreground hover:text-primary hover:bg-muted text-[10px] cursor-pointer flex items-center gap-0.5"
          >
            <span>⛶</span>
          </button>
        </div>
      </div>

      {/* FULLSCREEN FOCUS MODAL */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
          <div className="relative w-full max-w-4xl h-[90vh] flex flex-col bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
            {/* Top Fullscreen Header */}
            <div className="flex-shrink-0 flex items-center justify-between px-5 py-3.5 border-b border-border bg-muted/40">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                  ✏️
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    {label || 'โหมดแก้ไขข้อความเต็มจอ (Fullscreen Focus Mode)'}
                  </h3>
                  {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs px-2.5 py-1 rounded-md bg-muted text-muted-foreground font-mono">
                  {charCount.toLocaleString()}{charLimit ? ` / ${charLimit.toLocaleString()}` : ''} ตัวอักษร
                </span>

                <button
                  type="button"
                  onClick={handleCopy}
                  className="px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 text-foreground text-xs font-semibold transition-all cursor-pointer flex items-center gap-1"
                >
                  <span>{copied ? '✅' : '📋'}</span>
                  <span>{copied ? 'คัดลอกแล้ว' : 'คัดลอก'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsFullscreen(false)}
                  className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <span>✓ เสร็จสิ้น (Esc)</span>
                </button>
              </div>
            </div>

            {/* Large Fullscreen Textarea */}
            <div className="flex-1 p-5 bg-background relative flex flex-col">
              <textarea
                ref={fullscreenTextareaRef}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder || 'เขียนบรรยายรายละเอียดที่นี่...'}
                className="w-full flex-1 p-5 rounded-xl bg-muted/50 border border-border text-base text-foreground placeholder:text-muted-foreground/50 font-sans resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all leading-relaxed shadow-inner"
              />
            </div>

            {/* Bottom Fullscreen Helper Footer */}
            <div className="flex-shrink-0 px-5 py-2.5 border-t border-border bg-muted/20 flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-3">
                <span>💡 <strong>คำแนะนำ:</strong> สามารถกด <code>Esc</code> หรือกดปุ่ม <strong>เสร็จสิ้น</strong> เพื่อบันทึกและกลับสู่หน้าหลัก</span>
              </div>
              <button
                type="button"
                onClick={() => onChange('')}
                className="text-xs text-muted-foreground hover:text-rose-500 transition-colors cursor-pointer"
              >
                🗑️ ล้างข้อความทั้งหมด
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
