'use client';
import React, { useState, useEffect } from 'react';
import { CopyButton } from '@/components/ui/CopyButton';
import { Edit3, Eye, Check, Maximize2, Minimize2, X } from 'lucide-react';

interface CodeBlockProps {
  label: string;
  subtitle?: string;
  required?: boolean;
  hint?: string;
  content: string;
  onChange?: (newVal: string) => void;
  countLabel?: string;
  maxConstraint?: string;
  isOverLimit?: boolean;
  isEditable?: boolean;
}

export function CodeBlock({
  label,
  subtitle,
  required = false,
  hint,
  content,
  onChange,
  countLabel,
  maxConstraint,
  isOverLimit = false,
  isEditable = true,
}: CodeBlockProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [localValue, setLocalValue] = useState(content || '');

  // Keep in sync when external content changes (unless actively typing)
  useEffect(() => {
    setLocalValue(content || '');
  }, [content]);

  const handleChange = (newVal: string) => {
    setLocalValue(newVal);
    if (onChange) {
      onChange(newVal);
    }
  };

  const currentLength = localValue.length;

  return (
    <>
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-xs transition-shadow hover:shadow-sm">
        {/* Header Toolbar */}
        <div className="flex items-center justify-between px-3.5 py-2.5 bg-muted/40 border-b border-border gap-2">
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

          <div className="flex items-center gap-1.5 flex-shrink-0">
            {/* Character counter */}
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-muted text-muted-foreground">
              {currentLength.toLocaleString('th-TH')} ตัวอักษร
            </span>

            {/* Fullscreen Expand Button */}
            <button
              type="button"
              onClick={() => setIsFullscreen(true)}
              title="ขยายดูแบบเต็มจอ (Fullscreen View)"
              className="p-1.5 rounded-lg border border-border/60 bg-muted hover:bg-muted/80 text-foreground transition-all cursor-pointer"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>

            {/* Edit Toggle Button */}
            {isEditable && (
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
            <CopyButton text={localValue} />
          </div>
        </div>

        {/* Content View / Edit Mode */}
        <div className="p-3 bg-card/60 relative">
          {isEditing ? (
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
      {isFullscreen && (
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
