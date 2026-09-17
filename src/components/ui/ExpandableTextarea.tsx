'use client';
import React, { useState, useRef, useEffect } from 'react';
import { Maximize2, Minimize2, Copy, Check, Lock } from 'lucide-react';

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
  readOnly?: boolean;
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
  readOnly = false,
}: ExpandableTextareaProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fullscreenTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Focus when entering fullscreen
  useEffect(() => {
    if (isFullscreen && fullscreenTextareaRef.current) {
      fullscreenTextareaRef.current.focus();
    }
  }, [isFullscreen]);

  // Handle Esc key to close fullscreen
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
  const isOverLimit = charLimit ? charCount > charLimit : false;

  return (
    <div className={`relative flex flex-col gap-1 w-full ${className}`}>
      {/* Optional Top Label / Character counter */}
      {(label || charLimit) && (
        <div className="flex items-center justify-between text-xs">
          {label && (
            <label htmlFor={id} className="font-semibold text-foreground/90 flex items-center gap-1.5">
              <span>{label}</span>
              {readOnly && (
                <span className="text-[10px] text-amber-500 font-normal flex items-center gap-0.5">
                  <Lock className="w-2.5 h-2.5" /> อ่านอย่างเดียว
                </span>
              )}
            </label>
          )}
          <div className="flex items-center gap-2 ml-auto">
            {charLimit && (
              <span
                className={`font-mono text-[11px] ${
                  isOverLimit ? 'text-destructive font-bold' : 'text-muted-foreground'
                }`}
              >
                {charCount.toLocaleString()} / {charLimit.toLocaleString()}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Main Textarea Container */}
      <div className="relative group">
        <textarea
          id={id}
          ref={textareaRef}
          value={value}
          onChange={(e) => !readOnly && onChange(e.target.value)}
          placeholder={placeholder}
          rows={isExpanded ? Math.max(rows * 2, 8) : rows}
          readOnly={readOnly}
          className={`w-full p-2.5 rounded-lg border border-border text-xs text-foreground placeholder:text-muted-foreground/60 font-mono transition-all leading-relaxed focus:outline-none ${
            readOnly
              ? 'bg-muted/30 cursor-not-allowed select-text'
              : 'bg-muted/50 focus:ring-2 focus:ring-primary/40 focus:border-primary/50 resize-y'
          }`}
        />

        {/* Floating Quick Actions (Copy & Fullscreen) */}
        <div className="absolute top-2 right-2 flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
          {value && (
            <button
              type="button"
              onClick={handleCopy}
              title="คัดลอกข้อความ"
              className="p-1 rounded bg-card/80 backdrop-blur-xs border border-border text-muted-foreground hover:text-foreground transition-all text-xs cursor-pointer shadow-xs"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
            </button>
          )}

          {allowFullscreen && (
            <button
              type="button"
              onClick={() => setIsFullscreen(true)}
              title="ขยายเต็มหน้าจอ"
              className="p-1 rounded bg-card/80 backdrop-blur-xs border border-border text-muted-foreground hover:text-foreground transition-all text-xs cursor-pointer shadow-xs"
            >
              <Maximize2 className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {hint && <p className="text-[11px] text-muted-foreground/80 leading-normal">{hint}</p>}

      {/* Fullscreen Modal Focus View */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="relative w-full max-w-4xl h-[85vh] flex flex-col bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex-shrink-0 flex items-center justify-between px-5 py-3 border-b border-border bg-muted/40">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-foreground">
                  {label || 'โหมดเขียนข้อความแบบเต็มจอ (Focus Mode)'}
                </h3>
                {readOnly && (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/15 text-amber-500 font-semibold border border-amber-500/30">
                    อ่านอย่างเดียว
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {charLimit && (
                  <span
                    className={`font-mono text-xs px-2.5 py-1 rounded bg-muted ${
                      isOverLimit ? 'text-destructive font-bold' : 'text-muted-foreground'
                    }`}
                  >
                    {charCount.toLocaleString()} / {charLimit.toLocaleString()} ตัวอักษร
                  </span>
                )}

                <button
                  type="button"
                  onClick={handleCopy}
                  className="px-2.5 py-1 rounded-lg border border-border bg-card hover:bg-muted text-xs font-semibold text-foreground transition-all cursor-pointer flex items-center gap-1"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'คัดลอกแล้ว' : 'คัดลอก'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsFullscreen(false)}
                  className="p-1.5 rounded-lg bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-all cursor-pointer"
                  title="ปิดโหมดเต็มจอ (Esc)"
                >
                  <Minimize2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Body / Full Textarea */}
            <div className="flex-1 p-4 bg-background relative flex flex-col">
              <textarea
                ref={fullscreenTextareaRef}
                value={value}
                onChange={(e) => !readOnly && onChange(e.target.value)}
                placeholder={placeholder}
                readOnly={readOnly}
                className={`w-full flex-1 p-4 rounded-xl border border-border text-sm text-foreground placeholder:text-muted-foreground/60 font-mono resize-none leading-relaxed focus:outline-none ${
                  readOnly
                    ? 'bg-muted/30 cursor-not-allowed select-text'
                    : 'bg-muted/40 focus:ring-2 focus:ring-primary/40'
                }`}
              />
            </div>

            {/* Modal Footer */}
            <div className="flex-shrink-0 px-5 py-2.5 border-t border-border bg-muted/20 flex items-center justify-between text-xs text-muted-foreground">
              <span>{hint || 'กดปุ่ม Esc หรือคลิกปิดที่มุมบนขวาเพื่อย้อนกลับ'}</span>
              <button
                type="button"
                onClick={() => setIsFullscreen(false)}
                className="px-3 py-1 rounded bg-primary text-white font-semibold text-xs cursor-pointer hover:bg-primary/90 transition-all"
              >
                เสร็จสิ้น
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
