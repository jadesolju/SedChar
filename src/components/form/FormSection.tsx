'use client';
import { type ReactNode, useState } from 'react';

interface FormSectionProps {
  id: string;
  title: string;
  icon: ReactNode;
  description?: string;
  children: ReactNode;
  defaultOpen?: boolean;
  badge?: number;
}

export function FormSection({
  id,
  title,
  icon,
  description,
  children,
  defaultOpen = true,
  badge,
}: FormSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <section
      id={id}
      className="border border-border rounded-lg overflow-hidden bg-card transition-shadow duration-200 hover:shadow-sm"
    >
      {/* Header */}
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        aria-expanded={isOpen}
        aria-controls={`${id}-content`}
        className="
          w-full flex items-center justify-between gap-3 px-4 py-3
          text-left bg-card hover:bg-muted/50
          transition-colors duration-150 cursor-pointer
          focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50
        "
      >
        <div className="flex items-center gap-2.5">
          <span className="text-primary opacity-80" aria-hidden>{icon}</span>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-foreground">{title}</span>
              {badge !== undefined && badge > 0 && (
                <span className="
                  inline-flex items-center justify-center min-w-[18px] h-[18px] px-1
                  rounded-full bg-primary/15 text-primary text-[10px] font-bold
                ">
                  {badge}
                </span>
              )}
            </div>
            {description && (
              <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
            )}
          </div>
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16" height="16" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round"
          className={`text-muted-foreground flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          aria-hidden
        >
          <path d="m6 9 6 6 6-6"/>
        </svg>
      </button>

      {/* Content */}
      <div
        id={`${id}-content`}
        className={`transition-all duration-200 overflow-hidden ${isOpen ? 'max-h-[9999px] opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <div className="px-4 pb-4 pt-2 space-y-4 border-t border-border">
          {children}
        </div>
      </div>
    </section>
  );
}

interface FieldRowProps {
  label: string;
  htmlFor: string;
  hint?: string;
  children: ReactNode;
}

export function FieldRow({ label, htmlFor, hint, children }: FieldRowProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between">
        <label htmlFor={htmlFor} className="text-xs font-medium text-foreground">
          {label}
        </label>
        {hint && <span className="text-[11px] text-muted-foreground">{hint}</span>}
      </div>
      {children}
    </div>
  );
}
