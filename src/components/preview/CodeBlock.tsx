'use client';
import React, { useState, useEffect } from 'react';
import { CopyButton } from '@/components/ui/CopyButton';
import { Edit3, Eye, Check } from 'lucide-react';

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
          {/* Character counter (shows total count) */}
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-muted text-muted-foreground">
            {currentLength.toLocaleString('th-TH')} ตัวอักษร
          </span>

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

          {/* Copy Button (Copies the latest value) */}
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
  );
}
