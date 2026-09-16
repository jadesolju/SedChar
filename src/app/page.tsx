'use client';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { InputForm } from '@/components/form/InputForm';
import { SingleBoxInput } from '@/components/form/SingleBoxInput';
import { PlatformPreview } from '@/components/preview/PlatformPreview';
import { useCharacterData } from '@/hooks/useCharacterData';
import { CHARACTER_FLAGS } from '@/shared/types';

export default function HomePage() {
  const {
    character,
    inputMode,
    rawMarkdown,
    setInputMode,
    setRawMarkdown,
    updateField,
    addTag,
    removeTag,
    addSubCharacter,
    updateSubCharacter,
    removeSubCharacter,
    addLocation,
    updateLocation,
    removeLocation,
    setFlagType,
    autoDetectFlag,
    loadSample,
    resetCharacter,
    importRawMarkdown,
    syncToMarkdown,
  } = useCharacterData();

  const currentFlagInfo = CHARACTER_FLAGS[character.flagType] || CHARACTER_FLAGS.none;

  const handleModeSwitch = (mode: 'structured' | 'single') => {
    if (mode === 'single') {
      syncToMarkdown();
    }
    setInputMode(mode);
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      {/* Global Navbar */}
      <header className="flex-shrink-0 h-13 flex items-center justify-between px-5 border-b border-border bg-card/80 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          {/* Logo mark */}
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0 shadow-xs">
            <span className="text-white text-base font-bold">S</span>
          </div>
          <div className="flex items-baseline gap-2">
            <h1 className="text-sm font-bold tracking-tight text-foreground">SedChar.AI</h1>
            <span className="hidden sm:inline text-xs text-muted-foreground font-normal"></span>
          </div>

          {/* Mode Switcher */}
          <div className="ml-3 hidden md:flex items-center p-0.5 rounded-lg bg-muted border border-border">
            <button
              type="button"
              onClick={() => handleModeSwitch('structured')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${inputMode === 'structured'
                  ? 'bg-card text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              <span>📋</span> ช่องแยกตามหัวข้อ
            </button>
            <button
              type="button"
              onClick={() => handleModeSwitch('single')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${inputMode === 'single'
                  ? 'bg-card text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              <span>📝</span> ช่องเดียวรวด (Markdown)
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Active Flag Badge in Navbar */}
          {character.flagType !== 'none' && (
            <span className={`hidden sm:inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full border font-medium ${currentFlagInfo.badgeBg}`}>
              <span>{currentFlagInfo.emoji}</span>
              <span>{currentFlagInfo.label.replace(/\(.*\)/, '').trim()}</span>
            </span>
          )}

          {character.fullName && (
            <span className="hidden lg:inline text-xs font-medium text-foreground bg-muted px-2.5 py-1 rounded-full border border-border">
              {character.fullName}
            </span>
          )}

          <ThemeToggle />
        </div>
      </header>

      {/* Split Screen Workspace */}
      <main className="flex-1 flex overflow-hidden" aria-label="ส่วนหลักของแอปพลิเคชัน">
        {/* Left: Input Panel (Guided Form or Single-box) */}
        <section
          aria-label="Master Input Panel"
          className="w-[48%] min-w-[340px] max-w-[650px] flex-shrink-0 border-r border-border overflow-hidden bg-background flex flex-col"
        >
          {/* Mobile mode switch toggle */}
          <div className="flex md:hidden p-2 border-b border-border bg-card">
            <div className="grid grid-cols-2 gap-1 w-full">
              <button
                type="button"
                onClick={() => handleModeSwitch('structured')}
                className={`py-1 text-xs rounded font-medium ${inputMode === 'structured' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
              >
                ช่องแยก
              </button>
              <button
                type="button"
                onClick={() => handleModeSwitch('single')}
                className={`py-1 text-xs rounded font-medium ${inputMode === 'single' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
              >
                ช่องเดียว
              </button>
            </div>
          </div>

          {inputMode === 'structured' ? (
            <InputForm
              character={character}
              onUpdateField={updateField}
              onAddTag={addTag}
              onRemoveTag={removeTag}
              onAddSubCharacter={addSubCharacter}
              onUpdateSubCharacter={updateSubCharacter}
              onRemoveSubCharacter={removeSubCharacter}
              onAddLocation={addLocation}
              onUpdateLocation={updateLocation}
              onRemoveLocation={removeLocation}
              onSelectFlag={setFlagType}
              onAutoDetectFlag={autoDetectFlag}
              onLoadSample={loadSample}
              onReset={resetCharacter}
            />
          ) : (
            <SingleBoxInput
              rawMarkdown={rawMarkdown}
              onChangeRaw={setRawMarkdown}
              onApplyParse={importRawMarkdown}
              onLoadSample={loadSample}
              onClear={resetCharacter}
            />
          )}
        </section>

        {/* Right: Platform Preview Panel */}
        <section
          aria-label="Platform Output Preview"
          className="flex-1 overflow-hidden bg-background"
        >
          <PlatformPreview character={character} />
        </section>
      </main>

      {/* Status Bar */}
      <footer className="flex-shrink-0 h-6 flex items-center justify-between px-4 border-t border-border bg-card/60">
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-muted-foreground font-mono">
            SedChar.AI v2.0 • Thai Character Parser Engine for Rubii / Purrpaw / Khui AI
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" aria-hidden />
          <span className="text-[10px] text-muted-foreground">Ready & Synchronized</span>
        </div>
      </footer>
    </div>
  );
}
