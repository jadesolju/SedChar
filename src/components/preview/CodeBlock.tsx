'use client';
import React, { useState, useEffect } from 'react';
import { Copy, Check, Maximize2, X, Edit3, Eye, Lock } from 'lucide-react';

interface CodeBlockProps {
  label: string;
  subtitle?: string;
  content: string;
  required?: boolean;
  hint?: string;
  isEditable?: boolean;
  isProtected?: boolean;
  onChange?: (val: string) => void;
}

function CopyButton({ text, disabled }: { text: string; disabled?: boolean }) {
  const [copied, setCopied] = useState(false);

  if (disabled) {
    return (
      <span
        title="ไม่อนุญาตให้คัดลอกส่วน System Prompt ในโหมดอ่านอย่างเดียว"
        className="text-[11px] px-2 py-1 rounded bg-muted/60 text-muted-foreground border border-border/50 flex items-center gap-1 font-medium cursor-not-allowed select-none"
      >
        <Lock className="w-3 h-3 text-rose-500" />
        <span>ล็อค</span>
      </span>
    );
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      title="คัดลอกข้อความในช่องนี้"
      className="text-xs px-2.5 py-1 rounded-lg bg-muted hover:bg-muted/80 text-foreground border border-border/60 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
    >
      {copied ? (
        <>
          <Check className="w-3.5 h-3.5 text-emerald-500" />
          <span className="text-emerald-500 font-medium">คัดลอกแล้ว</span>
        </>
      ) : (
        <>
          <Copy className="w-3.5 h-3.5 text-muted-foreground" />
          <span>คัดลอก</span>
        </>
      )}
    </button>
  );
}

export function CodeBlock({
  label,
  subtitle,
  content,
  required = false,
  hint,
  isEditable = true,
  isProtected = false,
  onChange,
}: CodeBlockProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [localValue, setLocalValue] = useState(content);

  useEffect(() => {
    setLocalValue(content);
  }, [content]);

  const handleChange = (val: string) => {
    setLocalValue(val);
    if (onChange) {
      onChange(val);
    }
  };

  const currentLength = localValue.length;

  return (
    <>
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-xs transition-shadow hover:shadow-sm">
        {/* Header Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between px-3.5 py-2.5 bg-muted/40 border-b border-border gap-2.5">
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold text-foreground">
                {label}
              </span>
              {required && (
                <span className="text-rose-500 font-bold text-xs" title="จำเป็นต้องระบุ">*</span>
              )}
              {hint && (
                <span className="text-[11px] text-muted-foreground hidden sm:inline">({hint})</span>
              )}
            </div>
            {subtitle && (
              <span className="text-[10px] text-muted-foreground mt-0.5">
                {subtitle}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 flex-wrap sm:flex-nowrap flex-shrink-0">
            {/* Character counter */}
            {isProtected ? (
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center gap-1 font-semibold">
                <Lock className="w-3 h-3" />
                <span>ล็อค</span>
              </span>
            ) : (
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-muted text-muted-foreground">
                {currentLength.toLocaleString('th-TH')} ตัวอักษร
              </span>
            )}

            {/* Fullscreen Expand Button */}
            {!isProtected && (
              <button
                type="button"
                onClick={() => setIsFullscreen(true)}
                title="ขยายดูแบบเต็มจอ (Fullscreen View)"
                className="p-1.5 rounded-lg border border-border/60 bg-muted hover:bg-muted/80 text-foreground transition-all cursor-pointer"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Edit Toggle Button */}
            {isEditable && !isProtected && (
              <button
                type="button"
                onClick={() => setIsEditing(!isEditing)}
                title={isEditing ? 'สลับไปโหมดดูตัวอย่าง' : 'แก้ไขข้อความในช่องนี้โดยตรง'}
                className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                  isEditing
                    ? 'bg-primary text-white shadow-xs font-bold'
                    : 'bg-muted hover:bg-muted/80 text-foreground border border-border/60'
                }`}
              >
                {isEditing ? (
                  <>
                    <Eye className="w-3.5 h-3.5" />
                    <span>ดูผลลัพธ์</span>
                  </>
                ) : (
                  <>
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>แก้ไข</span>
                  </>
                )}
              </button>
            )}

            {/* Copy Button */}
            <CopyButton text={localValue} disabled={isProtected} />
          </div>
        </div>

        {/* Content View / Edit Mode */}
        <div className="p-3 bg-card/60 relative min-h-[100px]">
          {isProtected ? (
            <div className="relative overflow-hidden rounded-lg min-h-[140px] flex items-center justify-center p-2">
              {/* Blurred Masked Background Text (Simulated to prevent DOM text leak) */}
              <div
                aria-hidden="true"
                className="filter blur-[7px] opacity-30 select-none pointer-events-none font-mono text-[11px] leading-relaxed text-foreground w-full"
              >
                ### [System Prompt & Instructions: LOCKED]
- Persona Directives: [PROTECTED PROMPT STORAGE]
- Behavioral Rules: [ENCRYPTED CONFIGURATION]
- Response Pattern: [REDACTED IN READONLY PREVIEW]
- Knowledge Base & Safety: [REDACTED]
              </div>

              {/* Secure Lock Badge Overlay */}
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-card/75 backdrop-blur-xs p-4 text-center select-none border border-border/40 rounded-lg">
                <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-center justify-center text-rose-500 shadow-xs mb-1.5">
                  <Lock className="w-4.5 h-4.5" />
                </div>
                <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <span>🔒 ซ่อนข้อมูลส่วน System Prompt & Master Prompt</span>
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5 max-w-xs leading-relaxed">
                  สงวนสิทธิ์เฉพาะเจ้าของตัวละคร (ปิดการแสดงผลในโหมดอ่านอย่างเดียว)
                </p>
              </div>
            </div>
          ) : isEditing ? (
            <div className="relative">
              <textarea
                value={localValue}
                onChange={(e) => handleChange(e.target.value)}
                placeholder="แก้ไขข้อความที่นี่..."
                className="w-full min-h-[140px] max-h-[480px] p-3 rounded-lg bg-background border border-primary/40 focus:border-primary focus:ring-2 focus:ring-primary/30 text-xs font-mono text-foreground placeholder:text-muted-foreground/50 resize-y leading-relaxed outline-none transition-all"
              />
              <div className="flex items-center justify-between mt-1 text-[10px] text-muted-foreground">
                <span>กำลังแก้ไขในโหมด Preview — ข้อความที่แก้ไขจะถูกคัดลอกและนำไปใช้ทันที</span>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex items-center gap-1 text-primary hover:underline font-semibold cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>เสร็จสิ้น</span>
                </button>
              </div>
            </div>
          ) : (
            <pre
              onClick={() => isEditable && setIsEditing(true)}
              title={isEditable ? 'คลิกเพื่อแก้ไขข้อความ' : undefined}
              className={`text-xs font-mono text-foreground whitespace-pre-wrap break-words leading-relaxed max-h-[360px] overflow-y-auto selection:bg-primary/20 ${
                isEditable ? 'cursor-text hover:bg-muted/20 p-1 rounded transition-colors' : ''
              }`}
            >
              {localValue || '-'}
            </pre>
          )}
        </div>
      </div>

      {/* Fullscreen Modal View */}
      {isFullscreen && !isProtected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
          <div className="relative w-full max-w-5xl h-[90vh] flex flex-col bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/40 flex-shrink-0">
              <div className="flex flex-col">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <span>{label}</span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-muted text-muted-foreground">
                    {currentLength.toLocaleString('th-TH')} ตัวอักษร
                  </span>
                </h3>
                {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
              </div>

              <div className="flex items-center gap-2">
                <CopyButton text={localValue} />
                <button
                  type="button"
                  onClick={() => setIsFullscreen(false)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-hidden p-6 bg-background flex flex-col">
              <textarea
                value={localValue}
                onChange={(e) => handleChange(e.target.value)}
                placeholder="แก้ไขข้อความ..."
                className="w-full flex-1 p-4 rounded-xl bg-card border border-border focus:border-primary focus:ring-2 focus:ring-primary/30 text-xs font-mono text-foreground resize-none leading-relaxed outline-none"
              />
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 border-t border-border bg-muted/20 flex justify-between items-center flex-shrink-0">
              <span className="text-xs text-muted-foreground">
                โหมดขยายเต็มหน้าจอ (Full Expanded View)
              </span>
              <button
                type="button"
                onClick={() => setIsFullscreen(false)}
                className="px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
