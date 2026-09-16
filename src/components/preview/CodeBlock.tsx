'use client';
import { CopyButton } from '@/components/ui/CopyButton';

interface CodeBlockProps {
  label: string;
  required?: boolean;
  hint?: string;
  content: string;
  countLabel?: string;
  maxConstraint?: string;
  isOverLimit?: boolean;
}

export function CodeBlock({
  label,
  required = false,
  hint,
  content,
  countLabel,
  maxConstraint,
  isOverLimit = false,
}: CodeBlockProps) {
  const displayContent = content || '-';

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden shadow-xs transition-shadow hover:shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-muted/40 border-b border-border">
        <div className="flex items-center gap-2">
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

        <div className="flex items-center gap-2">
          {countLabel && (
            <span className={`text-[11px] font-mono px-2 py-0.5 rounded ${
              isOverLimit
                ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 font-bold'
                : 'bg-muted text-muted-foreground'
            }`}>
              {countLabel}
              {maxConstraint && <span className="opacity-70"> / {maxConstraint}</span>}
            </span>
          )}
          <CopyButton text={content} />
        </div>
      </div>

      {/* Content View */}
      <div className="p-3 bg-card/60">
        <pre className="text-xs font-mono text-foreground whitespace-pre-wrap break-words leading-relaxed max-h-[360px] overflow-y-auto selection:bg-primary/20">
          {displayContent}
        </pre>
      </div>
    </div>
  );
}
