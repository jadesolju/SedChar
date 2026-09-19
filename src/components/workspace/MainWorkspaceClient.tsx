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
import { decodeCharacterFromShareUrl } from '@/shared/shareUtils';
import {
  Layers,
  Copy,
  Zap,
  Bookmark,
  RefreshCw,
  Share2,
  FileEdit,
  Eye,
  Check,
  X,
  Lock,
  Unlock,
  Save,
  Globe,
  Sparkles,
  RotateCcw,
} from 'lucide-react';

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
    restoreBackupDraft,
    syncToMarkdown,
  } = useCharacterData();

  const { user, openAuthModal, openLibraryModal, saveToLibrary, overwriteCharacterInLibrary, activeLoadedCharacterId, setActiveLoadedCharacterId, savedCharacters } = useAuth();
  const activeRecord = activeLoadedCharacterId ? savedCharacters.find(c => c.id === activeLoadedCharacterId) : null;



  // Mobile active screen: 'editor' | 'preview'
  const [mobileTab, setMobileTab] = useState<'editor' | 'preview'>('editor');

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sharing Mode state
  const [sharedBanner, setSharedBanner] = useState<{
    title: string;
    mode: 'read-only' | 'edit';
  } | null>(null);
  const isReadOnly = sharedBanner?.mode === 'read-only';

    const handleExitReadOnly = () => {
    if (typeof window !== 'undefined') {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    setSharedBanner(null);
    restoreBackupDraft();
    showToast('ออกจากโหมดอ่านแล้ว รีเซ็ตกลับสู่พื้นที่ทำงานหลักเรียบร้อย');
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 4500);
  };

  // Detect Share Link in URL / Hash on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const urlParams = new URLSearchParams(window.location.search);
    let dataParam = urlParams.get('data');
    let mode = (urlParams.get('mode') as 'read-only' | 'edit') || 'read-only';

    // Support Hash-based Instant URL (#data=...&mode=...) to bypass HTTP 414 URL length limits
    if (!dataParam && window.location.hash) {
      const hashClean = window.location.hash.replace(/^#/, '');
      const hashParams = new URLSearchParams(hashClean);
      dataParam = hashParams.get('data');
      if (hashParams.get('mode')) {
        mode = hashParams.get('mode') as 'read-only' | 'edit';
      }
    }

    const shareId = urlParams.get('share');

    // 1. Check Instant URL Payload
    if (dataParam) {
      const decoded = decodeCharacterFromShareUrl(dataParam);
      if (decoded && decoded.character) {
        const effectiveMode = (decoded.mode as 'read-only' | 'edit') || mode;
        applyParsedCharacter(decoded.character, effectiveMode === 'read-only');
        setSharedBanner({
          title: decoded.title || 'ตัวละครที่แชร์',
          mode: effectiveMode,
        });
        showToast(`โหลดตัวละคร "${decoded.title || 'ตัวละคร'}" เรียบร้อย (สิทธิ์: ${effectiveMode === 'edit' ? 'แก้ไขได้' : 'อ่านอย่างเดียว'})`);
        return;
      }
    }

    // 2. Check Cloud Database Share ID
    if (shareId) {
      fetch(`/api/characters/share?id=${encodeURIComponent(shareId)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.character) {
            const effectiveMode = (data.permission as 'read-only' | 'edit') || mode;
            applyParsedCharacter(data.character, effectiveMode === 'read-only');
            setSharedBanner({
              title: data.title || data.nickname || 'ตัวละครที่แชร์',
              mode: effectiveMode,
            });
            showToast(`โหลดตัวละคร "${data.title || 'ตัวละคร'}" เรียบร้อย (สิทธิ์: ${effectiveMode === 'edit' ? 'แก้ไขได้' : 'อ่านอย่างเดียว'})`);
          } else {
            // Fallback to local cache if offline
            const storedShare = localStorage.getItem(`sedchar_share_${shareId}`);
            if (storedShare) {
              const payload = JSON.parse(storedShare);
              if (payload.character) {
                const effectiveMode = (payload.permission as 'read-only' | 'edit') || mode;
                applyParsedCharacter(payload.character, effectiveMode === 'read-only');
                setSharedBanner({
                  title: payload.title || payload.nickname || 'ตัวละครที่แชร์',
                  mode: effectiveMode,
                });
                showToast(`โหลดตัวละคร "${payload.title || 'ตัวละคร'}" เรียบร้อย (สิทธิ์: ${effectiveMode === 'edit' ? 'แก้ไขได้' : 'อ่านอย่างเดียว'})`);
              }
            }
          }
        })
        .catch(() => {
          const storedShare = localStorage.getItem(`sedchar_share_${shareId}`);
          if (storedShare) {
            try {
              const payload = JSON.parse(storedShare);
              if (payload.character) {
                const effectiveMode = (payload.permission as 'read-only' | 'edit') || mode;
                applyParsedCharacter(payload.character, effectiveMode === 'read-only');
                setSharedBanner({
                  title: payload.title || payload.nickname || 'ตัวละครที่แชร์',
                  mode: effectiveMode,
                });
              }
            } catch {}
          }
        });
    }
  }, [applyParsedCharacter]);

  // Synchronize Markdown when toggling between tabs
  const handleModeSwitch = (mode: 'structured' | 'single') => {
    if (mode === 'single') {
      syncToMarkdown();
    }
    setInputMode(mode);
  };

  const handleParsedFromSingleBox = (parsedChar: ThaiMasterCharacter) => {
    applyParsedCharacter(parsedChar);
  };

  const handleSingleBoxSuccess = () => {
    showToast('แปลงข้อมูลสำเร็จ! ข้อมูลถูกนำไปจัดโครงสร้างใน 10 หมวดหมู่แล้ว');
  };

  const handleLoadFromLibrary = (char: ThaiMasterCharacter) => {
    applyParsedCharacter(char);
    setSharedBanner(null);
    showToast(`โหลดตัวละคร "${char.fullName || char.nickname || 'ตัวละคร'}" เรียบร้อย`);
  };

  const handleSaveAsNewCopy = async () => {
    if (!user) {
      openAuthModal('signin');
      return;
    }
    const res = await saveToLibrary(character, `${character.fullName || character.nickname || 'ตัวละคร'} (สำเนา)`);
    if (res.success) {
      setSharedBanner(null);
      showToast('บันทึกตัวละครลงในคลังของคุณเรียบร้อยแล้ว!');
    }
  };

  // Keyboard shortcut (Ctrl+S / Cmd+S) - save or open library
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        if (isReadOnly) {
          handleSaveAsNewCopy();
        } else {
          openLibraryModal();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReadOnly]);

  return (
    <div className="h-screen w-screen flex flex-col bg-background text-foreground overflow-hidden font-sans antialiased">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 animate-in fade-in slide-in-from-top-3 duration-200">
          <div className="px-4 py-2.5 rounded-xl bg-card border border-primary/40 text-foreground text-xs font-semibold shadow-2xl flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Shared Character Top Banner */}
      {sharedBanner && (
        <div className="flex-shrink-0 bg-primary/10 border-b border-primary/25 px-4 py-2 flex items-center justify-between text-xs z-20 shadow-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <Globe className="w-4 h-4 text-primary animate-pulse flex-shrink-0" />
            <span>
              กำลังเปิดดูตัวละครที่แชร์: <strong className="text-primary font-bold">{sharedBanner.title}</strong>{' '}
              <span className="text-muted-foreground font-medium">
                ({sharedBanner.mode === 'edit' ? 'โหมดแก้ไขได้' : 'โหมดอ่านอย่างเดียว'})
              </span>
            </span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {sharedBanner.mode === 'read-only' ? (
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] px-2 py-0.5 rounded bg-muted text-foreground border border-border flex items-center gap-1 font-semibold">
                  <Lock className="w-3 h-3 text-rose-500" />
                  <span>อ่านอย่างเดียว</span>
                </span>
                <button
                  type="button"
                  onClick={handleExitReadOnly}
                  className="touch-target px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/30 text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                  title="ออกจากโหมดอ่าน และคืนค่าตัวละครร่างเดิมของคุณ"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>ออกโหมดอ่าน</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setSharedBanner(null)}
                className="text-muted-foreground hover:text-foreground p-1 rounded cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Global Navbar */}
      <header className="flex-shrink-0 h-13 flex items-center justify-between px-3.5 sm:px-5 border-b border-border bg-card/85 backdrop-blur-md z-10">
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Logo */}
          <div className="relative w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0 shadow-sm border border-border/40">
            <img
              src="/shedchar_logo.png"
              alt="SedChar Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-bold tracking-tight text-foreground">SedChar.AI</h1>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/25 shadow-xs">
              Beta
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
              <Layers className="w-3.5 h-3.5 text-primary" />
              <span>ช่องแยกตามหัวข้อ (10 หมวดหมู่)</span>
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
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>ช่องเดียวรวด (Auto-Parser)</span>
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
            <Bookmark className="w-3.5 h-3.5 text-primary" />
            <span>บันทึกลงคลัง</span>
          </button>

          <UserMenu />
          <ThemeToggle />
        </div>
      </header>

      {/* Mobile Top Navigation (Clean & Minimal) */}
      <div className="flex md:hidden items-center justify-between border-b border-border bg-card/95 px-3 py-2 gap-2">
        {/* Tab Switcher: Editor vs Preview */}
        <div className="flex items-center p-1 bg-muted/60 rounded-xl border border-border/80 flex-1">
          <button
            type="button"
            onClick={() => setMobileTab('editor')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              mobileTab === 'editor'
                ? 'bg-card text-foreground shadow-xs font-bold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <FileEdit className="w-3.5 h-3.5 text-primary" />
            <span>สร้าง/แก้ไข</span>
          </button>
          <button
            type="button"
            onClick={() => setMobileTab('preview')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              mobileTab === 'preview'
                ? 'bg-primary text-white shadow-xs font-bold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>ดูผลลัพธ์</span>
          </button>
        </div>

        {/* Advanced Mode Toggle for Mobile */}
        {mobileTab === 'editor' && (
          <button
            type="button"
            onClick={() => handleModeSwitch(inputMode === 'single' ? 'structured' : 'single')}
            className={`px-2.5 py-2 rounded-xl text-[11px] font-semibold border transition-all flex items-center gap-1 cursor-pointer flex-shrink-0 ${
              inputMode === 'structured'
                ? 'bg-primary/10 border-primary/40 text-primary'
                : 'bg-card border-border/70 text-muted-foreground hover:text-foreground'
            }`}
            title="สลับระหว่างโหมดกรอกรวดเดียว และโหมดแยก 10 หัวข้อ"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{inputMode === 'single' ? 'โหมดขั้นสูง' : 'โหมดปกติ'}</span>
          </button>
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
              isReadOnly={isReadOnly}
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
              isReadOnly={isReadOnly}
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
          <PlatformPreview character={character} isReadOnly={isReadOnly} />
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

export function MainWorkspaceClient() {
  return (
    <AuthProvider>
      <MainWorkspace />
    </AuthProvider>
  );
}
