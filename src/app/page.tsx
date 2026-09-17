'use client';
import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { useCharacterData } from '@/hooks/useCharacterData';
import { InputForm } from '@/components/form/InputForm';
import { SingleBoxInput } from '@/components/form/SingleBoxInput';
import { PlatformPreview } from '@/components/preview/PlatformPreview';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { AuthModal } from '@/components/auth/AuthModal';
import { UserMenu } from '@/components/auth/UserMenu';
import { CharacterLibraryModal } from '@/components/library/CharacterLibraryModal';
import type { ThaiMasterCharacter } from '@/shared/types';

function MainWorkspace() {
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
    loadDefaultLocations,
    setFlagType,
    autoDetectFlag,
    loadSample,
    resetCharacter,
    importRawMarkdown,
    applyParsedCharacter,
    syncToMarkdown,
  } = useCharacterData();

  const { user, openAuthModal, openLibraryModal, saveToLibrary } = useAuth();

  // Mobile active screen: 'editor' | 'preview'
  const [mobileTab, setMobileTab] = useState<'editor' | 'preview'>('editor');
  
  // Toast notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sharing Mode state
  const [sharedBanner, setSharedBanner] = useState<{
    title: string;
    mode: 'read-only' | 'edit';
  } | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 4500);
  };

  // Detect Share Link in URL on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const urlParams = new URLSearchParams(window.location.search);
    const shareId = urlParams.get('share');
    const mode = urlParams.get('mode') as 'read-only' | 'edit' || 'read-only';

    if (shareId) {
      try {
        const storedShare = localStorage.getItem(`sedchar_share_${shareId}`);
        if (storedShare) {
          const payload = JSON.parse(storedShare);
          if (payload.character) {
            applyParsedCharacter(payload.character);
            setSharedBanner({
              title: payload.title || payload.nickname || 'ตัวละครที่แชร์',
              mode: payload.permission || mode,
            });
            showToast(`✨ โหลดตัวละครที่แชร์ "${payload.title || 'ตัวละคร'}" เรียบร้อย (สิทธิ์: ${payload.permission === 'edit' ? 'แก้ไขได้' : 'อ่านอย่างเดียว'})`);
          }
        }
      } catch (e) {
        console.warn('Error reading share payload:', e);
      }
    }
  }, [applyParsedCharacter]);

  const handleModeSwitch = (mode: 'structured' | 'single') => {
    if (mode === 'single') {
      syncToMarkdown();
    }
    setInputMode(mode);
  };

  const handleLoadFromLibrary = (loadedChar: ThaiMasterCharacter) => {
    applyParsedCharacter(loadedChar);
    showToast(`✨ โหลดตัวละคร "${loadedChar.fullName || loadedChar.nickname || 'ตัวละคร'}" เข้าสู่ฟอร์มเรียบร้อยแล้ว!`);
  };

  const handleSingleBoxSuccess = (msg: string) => {
    showToast(msg);
  };

  const handleParsedFromSingleBox = (parsedChar: ThaiMasterCharacter) => {
    applyParsedCharacter(parsedChar);
  };

  const handleSaveAsNewCopy = async () => {
    if (!user) {
      openAuthModal('signin');
      return;
    }
    const copyTitle = `${character.fullName || character.nickname || 'ตัวละคร'} (สำเนาของฉัน)`;
    const res = await saveToLibrary(character, copyTitle);
    if (res.success) {
      showToast(`✓ บันทึกเป็นตัวละครใหม่ของคุณเรียบร้อยแล้ว!`);
      setSharedBanner(null);
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-background">
      {/* Toast Notification Container */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 animate-in slide-in-from-bottom-5 fade-in duration-200">
          <div className="px-4 py-2.5 rounded-xl bg-card/95 border border-primary/40 shadow-xl backdrop-blur-md flex items-center gap-2.5 text-xs font-bold text-foreground">
            <span className="text-primary text-base">✨</span>
            <span>{toastMessage}</span>
            <button
              type="button"
              onClick={() => setToastMessage(null)}
              className="ml-2 text-muted-foreground hover:text-foreground cursor-pointer text-xs"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Shared Character Top Banner */}
      {sharedBanner && (
        <div className="flex-shrink-0 px-4 py-2 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-500/15 border-b border-emerald-500/30 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-foreground">
            <span className="text-emerald-500 font-bold">🔗</span>
            <span>
              กำลังเปิดดูตัวละครที่แชร์: <strong className="text-emerald-500">{sharedBanner.title}</strong>{' '}
              <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-semibold text-[10px]">
                {sharedBanner.mode === 'edit' ? '✏️ โหมดแก้ไขได้' : '🔒 โหมดอ่านอย่างเดียว'}
              </span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSaveAsNewCopy}
              className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition-all cursor-pointer shadow-xs"
            >
              + บันทึกเป็นตัวละครใหม่ของฉัน
            </button>
            <button
              type="button"
              onClick={() => setSharedBanner(null)}
              className="text-muted-foreground hover:text-foreground text-xs p-1"
            >
              ✕
            </button>
          </div>
        </div>
      )}

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
              Gemini AI ⚡
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
              <span>📋</span> ช่องแยกตามหัวข้อ (10 หมวดหมู่)
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
              <span>⚡</span> ช่องเดียวรวด (Auto-Parser)
            </button>
          </div>
        </div>

        {/* Right Action Icons & User Profile */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Quick Save to Cloud button */}
          <button
            type="button"
            onClick={openLibraryModal}
            title="บันทึกตัวละครลง Cloud Library"
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border bg-card hover:border-primary/50 text-xs font-semibold text-foreground transition-all cursor-pointer shadow-xs"
          >
            <span>💾</span>
            <span>บันทึกลงคลัง</span>
          </button>

          <UserMenu />
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
                ? 'bg-card text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <span>✏️</span> โหมดแก้ไข (Editor)
          </button>
          <button
            type="button"
            onClick={() => setMobileTab('preview')}
            className={`py-1.5 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-1 ${
              mobileTab === 'preview'
                ? 'bg-primary text-white shadow-xs font-bold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <span>👀</span> ดูผลลัพธ์ (Preview)
          </button>
        </div>

        {mobileTab === 'editor' && (
          <div className="grid grid-cols-2 gap-1 bg-muted p-0.5 rounded-md border border-border">
            <button
              type="button"
              onClick={() => handleModeSwitch('structured')}
              className={`py-1 text-[11px] font-medium rounded transition-all ${
                inputMode === 'structured'
                  ? 'bg-card text-foreground font-bold shadow-xs'
                  : 'text-muted-foreground'
              }`}
            >
              📋 ช่องแยก 10 หัวข้อ
            </button>
            <button
              type="button"
              onClick={() => handleModeSwitch('single')}
              className={`py-1 text-[11px] font-medium rounded transition-all ${
                inputMode === 'single'
                  ? 'bg-card text-foreground font-bold shadow-xs'
                  : 'text-muted-foreground'
              }`}
            >
              ⚡ ช่องเดียวรวด (Auto-Parser)
            </button>
          </div>
        )}
      </div>

      {/* Main Workspace Body */}
      <main className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border">
        {/* Left Column: Form Editor */}
        <div
          className={`h-full overflow-hidden flex flex-col p-2.5 sm:p-3.5 bg-background ${
            mobileTab === 'preview' ? 'hidden md:flex' : 'flex'
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
              onLoadDefaultLocations={loadDefaultLocations}
              onApplyParsedCharacter={applyParsedCharacter}
              onShowToast={showToast}
            />
          ) : (
            <SingleBoxInput
              rawMarkdown={rawMarkdown}
              onChangeRaw={setRawMarkdown}
              onApplyParse={importRawMarkdown}
              onApplyParsedCharacter={handleParsedFromSingleBox}
              onParseSuccess={handleSingleBoxSuccess}
              onLoadSample={loadSample}
              onClear={resetCharacter}
            />
          )}
        </div>

        {/* Right Column: Platform Preview & Smart Export */}
        <div
          className={`h-full overflow-hidden flex flex-col p-2.5 sm:p-3.5 bg-muted/20 ${
            mobileTab === 'editor' ? 'hidden md:flex' : 'flex'
          }`}
        >
          <PlatformPreview character={character} />
        </div>
      </main>

      {/* Modals */}
      <AuthModal />
      <CharacterLibraryModal
        currentCharacter={character}
        onLoadCharacter={handleLoadFromLibrary}
      />
    </div>
  );
}

export default function HomePage() {
  return (
    <AuthProvider>
      <MainWorkspace />
    </AuthProvider>
  );
}
