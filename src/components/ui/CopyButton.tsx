'use client';
import { useState, useCallback } from 'react';

interface CopyButtonProps {
  text: string;
  disabled?: boolean;
}

export function CopyButton({ text, disabled = false }: CopyButtonProps) {
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
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
      </svg>
    ),
    copied: (
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 6 9 17l-5-5"/>
      </svg>
    ),
    error: (
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>
      </svg>
    ),
  };

  const labels = { idle: 'คัดลอก', copied: 'คัดลอกแล้ว!', error: 'ผิดพลาด' };
  const colorMap = {
    idle: 'bg-primary text-primary-foreground hover:bg-primary/90',
    copied: 'bg-green-500 text-white',
    error: 'bg-red-500 text-white',
  };

  return (
    <button
      id="copy-output-btn"
      onClick={handleCopy}
      disabled={disabled || !text}
      aria-label={labels[status]}
      className={`
        inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium
        transition-all duration-200 cursor-pointer active:scale-95
        disabled:opacity-40 disabled:cursor-not-allowed
        ${colorMap[status]}
      `}
    >
      <span className="transition-transform duration-150">{icons[status]}</span>
      {labels[status]}
    </button>
  );
}
