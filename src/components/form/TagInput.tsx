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
}

export function TagInput({
  id,
  field,
  tags,
  placeholder = 'พิมพ์แล้วกด Enter...',
  onAdd,
  onRemove,
  prefixHash = false,
}: TagInputProps) {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const commitTag = useCallback(() => {
    let trimmed = inputValue.trim();
    if (!trimmed) return;
    if (prefixHash && !trimmed.startsWith('#')) {
      trimmed = `#${trimmed}`;
    }
    onAdd(field, trimmed);
    setInputValue('');
    inputRef.current?.focus();
  }, [inputValue, field, onAdd, prefixHash]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        commitTag();
      }
      if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
        onRemove(field, tags.length - 1);
      }
    },
    [commitTag, inputValue, tags.length, field, onRemove]
  );

  return (
    <div className="space-y-2">
      {/* Tags Display */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5" role="list" aria-label="รายการแท็ก">
          {tags.map((tag, i) => (
            <span
              key={`${tag}-${i}`}
              role="listitem"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-muted text-foreground border border-border group transition-all"
            >
              <span className="max-w-[220px] truncate" title={tag}>{tag}</span>
              <button
                type="button"
                onClick={() => onRemove(field, i)}
                aria-label={`ลบ "${tag}"`}
                className="
                  flex-shrink-0 w-3.5 h-3.5 rounded-full
                  flex items-center justify-center
                  text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10
                  transition-colors duration-100 cursor-pointer
                "
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="
        flex items-center gap-2 border border-border rounded-md px-3 py-1.5
        bg-muted/40 focus-within:ring-1 focus-within:ring-primary focus-within:border-primary
        transition-all duration-150
      ">
        <input
          ref={inputRef}
          id={id}
          value={inputValue}
          placeholder={placeholder}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 min-w-[120px] bg-transparent text-xs text-foreground placeholder:text-muted-foreground outline-none"
          aria-label={placeholder}
        />
        <button
          type="button"
          onClick={commitTag}
          disabled={!inputValue.trim()}
          aria-label="เพิ่มแท็ก"
          className="
            flex-shrink-0 text-[11px] text-muted-foreground px-2 py-0.5 rounded border border-border
            hover:border-primary/60 hover:text-foreground
            disabled:opacity-0 transition-all duration-150 cursor-pointer
          "
        >
          + เพิ่ม
        </button>
      </div>
    </div>
  );
}