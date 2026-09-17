'use client';
import { useState, useCallback, useRef, type KeyboardEvent } from 'react';

type ArrayField =
  | 'visualTags'
  | 'personalityTags'
  | 'likes'
  | 'dislikes'
  | 'systemRules'
  | 'categoryTags';

interface TagInputProps {
  id: string;
  field: ArrayField;
  tags: string[];
  placeholder?: string;
  onAdd: (field: ArrayField, value: string) => void;
  onRemove: (field: ArrayField, index: number) => void;
  prefixHash?: boolean;
  readOnly?: boolean;
}

export function TagInput({
  id,
  field,
  tags,
  placeholder = 'พิมพ์แล้วกด Enter...',
  onAdd,
  onRemove,
  prefixHash = false,
  readOnly = false,
}: TagInputProps) {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleAdd = useCallback(() => {
    if (readOnly) return;
    const trimmed = inputValue.trim();
    if (!trimmed) return;

    // Support comma-separated batch input
    const newTags = trimmed
      .split(/[,،]+/)
      .map(t => t.trim())
      .filter(t => t.length > 0);

    newTags.forEach(tag => {
      let finalTag = tag;
      if (prefixHash && !finalTag.startsWith('#')) {
        finalTag = `#${finalTag}`;
      }
      onAdd(field, finalTag);
    });

    setInputValue('');
  }, [inputValue, field, onAdd, prefixHash, readOnly]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (readOnly) return;
      if (e.key === 'Enter' || e.key === ',') {
        e.preventDefault();
        handleAdd();
      } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
        onRemove(field, tags.length - 1);
      }
    },
    [handleAdd, inputValue, tags.length, field, onRemove, readOnly]
  );

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <div
        className={`flex flex-wrap items-center gap-1.5 p-2 rounded-lg border border-border min-h-[38px] transition-all ${
          readOnly ? 'bg-muted/30 cursor-not-allowed' : 'bg-muted/50 focus-within:ring-2 focus-within:ring-primary/40 focus-within:border-primary/50'
        }`}
        onClick={() => !readOnly && inputRef.current?.focus()}
      >
        {tags.map((tag, index) => (
          <span
            key={`${tag}-${index}`}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-primary/10 text-primary border border-primary/20 animate-in fade-in duration-100"
          >
            <span>{tag}</span>
            {!readOnly && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(field, index);
                }}
                className="text-primary/70 hover:text-primary transition-colors cursor-pointer text-xs font-bold leading-none p-0.5"
                title="ลบแท็ก"
              >
                ✕
              </button>
            )}
          </span>
        ))}

        {!readOnly && (
          <input
            ref={inputRef}
            id={id}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleAdd}
            placeholder={tags.length === 0 ? placeholder : ''}
            className="flex-1 min-w-[120px] bg-transparent text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
          />
        )}

        {readOnly && tags.length === 0 && (
          <span className="text-xs text-muted-foreground/50 italic px-1">ไม่มีข้อมูลแท็ก</span>
        )}
      </div>
    </div>
  );
}
