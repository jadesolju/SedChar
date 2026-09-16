'use client';
import { useState, useCallback } from 'react';

interface CopyButtonProps {
  text: string;
  disabled?: boolean;
  size?: 'sm' | 'md';
}

export function CopyButton({ text, disabled = false, size = 'sm' }: CopyButtonProps) {
  const [status, setStatus] = useState<'idle' | 'copied' | 'error'>('idle');

  const handleCopy = useCallback(async () => {
    if (!text || disabled) return;
    try {
      await navigator.clipboard.writeText(text);
      setStatus('copied');
      setTimeout(() => setStatus('idle'), 2000);
    } catch {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 2000);
    }
  }, [text, disabled]);

  const icons = {
    idle: (
      <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
      </svg>
    ),
    copied: (
      <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 6 9 17l-5-5"/>
      </svg>
    ),
    error: (
      <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>
      </svg>
    ),
  };

  const labels = { idle: 'คัดลอก', copied: 'คัดลอกแล้ว!', error: 'ผิดพลาด' };
  const colorMap = {
    idle: 'bg-primary text-primary-foreground hover:bg-primary/90',
    copied: 'bg-emerald-600 text-white',
    error: 'bg-rose-600 text-white',
  };

  const sizeClasses = size === 'sm' ? 'px-3 py-1.5 text-xs font-semibold' : 'px-4 py-2 text-sm font-medium';

  return (
    <button
      id="copy-output-btn"
      type="button"
      onClick={handleCopy}
      disabled={disabled || !text}
      aria-label={labels[status]}
      className={`
        inline-flex items-center justify-center gap-1.5 rounded-lg whitespace-nowrap flex-shrink-0
        transition-all duration-150 cursor-pointer active:scale-95 shadow-xs
        disabled:opacity-40 disabled:cursor-not-allowed
        ${sizeClasses}
        ${colorMap[status]}
      `}
    >
      <span className="transition-transform duration-150 flex-shrink-0">{icons[status]}</span>
      <span className="whitespace-nowrap">{labels[status]}</span>
    </button>
  );
}
