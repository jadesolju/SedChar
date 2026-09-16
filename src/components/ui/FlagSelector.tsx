'use client';
import { type CharacterFlagType, CHARACTER_FLAGS } from '@/shared/types';

interface FlagSelectorProps {
  currentFlag: CharacterFlagType;
  onSelectFlag: (flag: CharacterFlagType) => void;
  onAutoDetect: () => void;
}

export function FlagSelector({ currentFlag, onSelectFlag, onAutoDetect }: FlagSelectorProps) {
  const flags = Object.values(CHARACTER_FLAGS).filter(f => f.type !== 'none');
  const selectedInfo = CHARACTER_FLAGS[currentFlag] || CHARACTER_FLAGS.none;

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground flex items-center gap-1.5">
            <span>🚩</span> ระบบวิเคราะห์ธงตัวละคร (Character Flag)
          </span>
          <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full border font-medium ${selectedInfo.badgeBg}`}>
            <span>{selectedInfo.emoji}</span>
            <span>{selectedInfo.label}</span>
          </span>
        </div>
        <button
          type="button"
          onClick={onAutoDetect}
          className="text-xs text-primary hover:text-primary/80 font-medium px-2.5 py-1 rounded-md border border-primary/20 hover:bg-primary/5 transition-colors"
        >
          ✨ วิเคราะห์อัตโนมัติ
        </button>
      </div>

      {/* Flag Buttons Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {flags.map(f => {
          const isSelected = currentFlag === f.type;
          return (
            <button
              key={f.type}
              type="button"
              onClick={() => onSelectFlag(f.type)}
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all text-left ${
                isSelected
                  ? `${f.badgeBg} ring-2 ring-primary ring-offset-1 dark:ring-offset-zinc-900 font-semibold shadow-sm`
                  : 'bg-background hover:bg-muted text-muted-foreground border-border'
              }`}
            >
              <span className="text-base flex-shrink-0">{f.emoji}</span>
              <span className="truncate">{f.label.replace(/\(.*\)/, '').trim()}</span>
            </button>
          );
        })}
      </div>

      {/* Selected Flag Details */}
      {selectedInfo.type !== 'none' && (
        <div className={`p-2.5 rounded-lg text-xs border ${selectedInfo.badgeBg}`}>
          <div className="font-semibold mb-0.5 flex items-center gap-1.5">
            <span>{selectedInfo.emoji}</span>
            <span>{selectedInfo.label}</span>
          </div>
          <p className="opacity-90 leading-relaxed">{selectedInfo.description}</p>
        </div>
      )}
    </div>
  );
}