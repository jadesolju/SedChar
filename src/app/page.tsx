'use client';
import { useState } from 'react';
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

  // Mobile active screen: 'editor' | 'preview'
  const [mobileTab, setMobileTab] = useState<'editor' | 'preview'>('editor');

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
      <header className="flex-shrink-0 h-13 flex items-center justify-between px-3.5 sm:px-5 border-b border-border bg-card/85 backdrop-blur-md z-10">
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Logo mark - Pink */}
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-rose-600 via-pink-500 to-rose-400 flex items-center justify-center flex-shrink-0 shadow-sm text-white">
            <span className="text-base font-black">S</span>
          </div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-bold tracking-tight text-foreground">SedChar.AI</h1>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/25 shadow-xs">
              Demo
            </span>
          </div>

          {/* Desktop Mode Switcher */}
          <div className="ml-3 hidden md:flex items-center p-0.5 rounded-lg bg-muted border border-border">
            <button
              type="button"
              onClick={() => handleModeSwitch('structured')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                inputMode === 'structured'
                  ? 'bg-card text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <span>📋</span> ช่องแยกตามหัวข้อ
            </button>
            <button
              type="button"
              onClick={() => handleModeSwitch('single')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                inputMode === 'single'
                  ? 'bg-card text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <span>📝</span> ช่องเดียวรวด (Markdown)
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </header>

      {/* Mobile Top Navigation (Editor vs Preview & Mode Switcher) */}
      <div className="flex md:hidden flex-col border-b border-border bg-card/95 px-3 py-2 gap-1.5">
        <div className="grid grid-cols-2 gap-1.5 w-full bg-muted/60 p-1 rounded-lg border border-border">
          <button
            type="button"
            onClick={() => setMobileTab('editor')}
            className={`py-1.5 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-1 ${
              mobileTab === 'editor'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'text-muted-foreground'
            }`}
          >
            <span>✍️</span> กรอกข้อมูล
          </button>
          <button
            type="button"
            onClick={() => setMobileTab('preview')}
            className={`py-1.5 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-1 ${
              mobileTab === 'preview'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'text-muted-foreground'
            }`}
          >
            <span>👁️</span> ดูผลลัพธ์
          </button>
        </div>

        {mobileTab === 'editor' && (
          <div className="grid grid-cols-2 gap-1 w-full pt-0.5">
            <button
              type="button"
              onClick={() => handleModeSwitch('structured')}
              className={`py-1 text-[11px] rounded font-medium border ${
                inputMode === 'structured'
                  ? 'bg-card text-foreground border-primary/50'
                  : 'bg-muted/40 text-muted-foreground border-transparent'
              }`}
            >
              📋 ช่องแยก
            </button>
            <button
              type="button"
              onClick={() => handleModeSwitch('single')}
              className={`py-1 text-[11px] rounded font-medium border ${
                inputMode === 'single'
                  ? 'bg-card text-foreground border-primary/50'
                  : 'bg-muted/40 text-muted-foreground border-transparent'
              }`}
            >
              📝 ช่องเดียว (Markdown)
            </button>
          </div>
        )}
      </div>

      {/* Workspace Area: Responsive Split Screen on Desktop / Full view on Mobile */}
      <main className="flex-1 flex overflow-hidden" aria-label="ส่วนหลักของแอปพลิเคชัน">
        {/* Left: Input Panel (Guided Form or Single-box) */}
        <section
          aria-label="Master Input Panel"
          className={`w-full md:w-[48%] md:min-w-[340px] md:max-w-[650px] flex-shrink-0 md:border-r border-border overflow-hidden bg-background flex flex-col ${
            mobileTab === 'editor' ? 'flex' : 'hidden md:flex'
          }`}
        >
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
          className={`flex-1 overflow-hidden bg-background ${
            mobileTab === 'preview' ? 'flex flex-col' : 'hidden md:flex md:flex-col'
          }`}
        >
          <PlatformPreview character={character} />
        </section>
      </main>

      {/* Status Bar */}
      <footer className="flex-shrink-0 h-6 flex items-center justify-between px-3 sm:px-4 border-t border-border bg-card/60">
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-muted-foreground font-mono truncate">
            SedChar.AI v2.0 • PWA Ready for Mobile & Desktop
          </span>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" aria-hidden />
          <span className="text-[10px] text-muted-foreground">Ready</span>
        </div>
      </footer>
    </div>
  );
}
