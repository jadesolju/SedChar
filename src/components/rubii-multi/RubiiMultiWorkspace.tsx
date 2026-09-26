'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import {
  Globe,
  BookOpen,
  GitFork,
  Users,
  Sparkles,
  FileText,
  Menu,
  X,
  ArrowLeft,
  RotateCcw,
  Shield,
  Layers,
  Sparkle,
  FolderOpen,
  Save,
  Download,
} from 'lucide-react';
import { useMultiCharacterProject } from '@/hooks/useMultiCharacterProject';
import { WorldSettingSection } from './WorldSettingSection';
import { LoreTimelineSection } from './LoreTimelineSection';
import { RoutesSection } from './RoutesSection';
import { MainCharactersSection } from './MainCharactersSection';
import { CastRulesSection } from './CastRulesSection';
import { RubiiDraftPreviewSection } from './RubiiDraftPreviewSection';
import { MultiCharLibraryModal } from './MultiCharLibraryModal';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { UserMenu } from '@/components/auth/UserMenu';
import { AuthModal } from '@/components/auth/AuthModal';
import { UpgradeModal } from '@/components/ui/UpgradeModal';
import { useAuth } from '@/context/AuthContext';

type TabId = 'world' | 'lore' | 'routes' | 'mainChars' | 'castRules' | 'preview';

const TABS = [
  { id: 'world', label: '1. World Setting', desc: 'กฎของโลก, ฉาก, ยุคสมัย', icon: Globe, color: 'text-purple-600 dark:text-purple-400' },
  { id: 'lore', label: '2. Lore & Timeline', desc: 'ไทม์ไลน์, ภูมิหลัง, ความลับ', icon: BookOpen, color: 'text-amber-600 dark:text-amber-400' },
  { id: 'routes', label: '3. Routes & Branches', desc: 'เส้นทางเรื่อง, เงื่อนไข', icon: GitFork, color: 'text-blue-600 dark:text-blue-400' },
  { id: 'mainChars', label: '4. Main Characters', desc: 'ตัวละครหลัก (10 ตัวใน Free)', icon: Users, color: 'text-rose-600 dark:text-rose-400' },
  { id: 'castRules', label: '5. Cast & Sub-Chars', desc: 'ตัวละครเสริมไม่จำกัด + กฎหลากรวม', icon: Sparkles, color: 'text-emerald-600 dark:text-emerald-400' },
  { id: 'preview', label: '6. Master Draft Export', desc: 'สรุปรวมร่าง & ดาวน์โหลด', icon: FileText, color: 'text-pink-600 dark:text-pink-400' },
];

export function RubiiMultiWorkspace() {
  const { userRole } = useAuth();
  const {
    project,
    activeLibraryProjectId,
    savedProjects,
    saveProjectToLibrary,
    loadProjectFromLibrary,
    deleteProjectFromLibrary,
    importProjectJson,
    updateProjectTitle,
    updateWorldSetting,
    updateLore,
    addTimelineEvent,
    updateTimelineEvent,
    removeTimelineEvent,
    addRoute,
    updateRoute,
    removeRoute,
    addMainCharacter,
    updateMainCharacter,
    removeMainCharacter,
    addSupportingCharacter,
    updateSupportingCharacter,
    removeSupportingCharacter,
    updateCastInteractionRules,
    resetProject,
    loadSampleProject,
    mainCharCount,
    maxMainChars,
  } = useMultiCharacterProject();

  const [activeTab, setActiveTab] = useState<TabId>('world');
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isLibraryModalOpen, setIsLibraryModalOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleLoadSample = () => {
    loadSampleProject();
    showToast('โหลดตัวอย่างจักรวาล "Aethelgard: เงาอัศวินกับพันธนาการจักรกล" เรียบร้อย!');
  };

  const handleReset = () => {
    if (confirm('คุณต้องการรีเซ็ตโปรเจกต์ Multi-Char กลับเป็นค่าเริ่มต้นหรือไม่?')) {
      resetProject();
      showToast('รีเซ็ตโปรเจกต์เรียบร้อย');
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background text-foreground font-sans">
      {/* Top Navigation Bar */}
      <header className="flex-shrink-0 h-14 border-b border-border bg-card/80 backdrop-blur-md px-3 sm:px-5 flex items-center justify-between z-30">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {/* Back to Single Char Studio */}
          <Link
            href="/"
            className="px-2.5 py-1.5 rounded-xl border border-border bg-muted/50 hover:bg-muted text-xs font-semibold text-foreground transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="กลับสู่ SedChar Single-Char Studio"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">หน้าหลัก</span>
          </Link>

          {/* Project Logo & Title */}
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-600 dark:text-rose-400 flex-shrink-0">
              <Users className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-bold text-foreground truncate">
                  Multi-Char Studio
                </span>
                <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20">
                  Preview
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons Right */}
        <div className="flex items-center gap-2">
          {/* Project Library Button */}
          <button
            type="button"
            onClick={() => setIsLibraryModalOpen(true)}
            className="px-3 py-1.5 rounded-xl border border-border bg-card hover:bg-muted text-xs font-bold text-foreground transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="เปิดคลังโปรเจกต์ Multi-Char / บันทึกโปรเจกต์"
          >
            <FolderOpen className="w-3.5 h-3.5 text-rose-500" />
            <span className="hidden sm:inline">คลังโปรเจกต์</span>
            {savedProjects.length > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-500 text-white font-mono font-bold">
                {savedProjects.length}
              </span>
            )}
          </button>

          {/* Load Sample Universe */}
          <button
            type="button"
            onClick={handleLoadSample}
            className="hidden sm:flex px-3 py-1.5 rounded-xl border border-border bg-card hover:bg-muted text-xs font-bold text-foreground transition-all items-center gap-1.5 cursor-pointer shadow-xs"
            title="โหลดตัวอย่างโครงสร้าง Multi-Character Universe"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>ตัวอย่าง Universe</span>
          </button>

          {/* Reset */}
          <button
            type="button"
            onClick={handleReset}
            className="w-8 h-8 rounded-xl border border-border bg-card hover:bg-rose-500/20 text-muted-foreground hover:text-rose-600 dark:hover:text-rose-400 transition-all flex items-center justify-center cursor-pointer shadow-xs"
            title="ล้างโปรเจกต์"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Promotion Button for Free Tier */}
          {userRole === 'free' && (
            <button
              type="button"
              onClick={() => setIsUpgradeModalOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-rose-500/15 to-pink-500/15 border border-rose-500/30 hover:border-rose-500 text-rose-700 dark:text-rose-300 text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
              title="อัปเกรดเป็น Premium เพียง 29 บาท (ชำระด้วยบัตร หรือ PromptPay QR)"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>โปร 29.-</span>
            </button>
          )}

          {/* User Menu without duplicate character library button */}
          <UserMenu
            onOpenUpgradeModal={() => setIsUpgradeModalOpen(true)}
            showLibraryButton={false}
            onOpenCustomLibrary={() => setIsLibraryModalOpen(true)}
            customLibraryLabel="โปรเจกต์ Multi-Char"
            customLibraryCount={savedProjects.length}
          />
          <ThemeToggle />
        </div>
      </header>

      {/* Main Container: Sidebar + Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Category Sidebar (Desktop) */}
        <aside className="hidden md:flex w-64 flex-col border-r border-border bg-card/50 backdrop-blur-xs p-3 space-y-1.5 overflow-y-auto custom-scrollbar flex-shrink-0">
          <div className="px-3 py-2 text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
            <span>โครงสร้างโปรเจกต์</span>
            <span className="text-[11px] font-mono font-normal text-rose-700 dark:text-rose-300 px-1.5 py-0.5 rounded bg-rose-500/10 border border-rose-500/20">
              {mainCharCount}/{maxMainChars} ตัวหลัก
            </span>
          </div>

          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as TabId)}
                className={
                  'w-full p-2.5 rounded-xl text-left flex items-center gap-3 transition-all cursor-pointer group ' +
                  (isActive
                    ? 'bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 shadow-xs'
                    : 'hover:bg-muted/70 text-muted-foreground hover:text-foreground border border-transparent')
                }
              >
                <div
                  className={
                    'w-8 h-8 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110 flex-shrink-0 ' +
                    (isActive
                      ? 'bg-rose-500/20 text-rose-700 dark:text-rose-300'
                      : 'bg-muted/80')
                  }
                >
                  <Icon className={'w-4 h-4 ' + (isActive ? 'text-rose-600 dark:text-rose-400' : tab.color)} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className={'text-xs font-bold truncate ' + (isActive ? 'text-foreground' : 'text-foreground/90')}>
                    {tab.label}
                  </div>
                  <div className="text-[10px] text-muted-foreground truncate">
                    {tab.desc}
                  </div>
                </div>
              </button>
            );
          })}

          <div className="mt-auto pt-4 border-t border-border px-2 space-y-2">
            {/* Quick Save to Library Card */}
            <button
              type="button"
              onClick={() => setIsLibraryModalOpen(true)}
              className="w-full p-2.5 rounded-xl bg-gradient-to-r from-rose-500/10 to-pink-500/10 border border-rose-500/30 hover:border-rose-500/60 text-foreground flex items-center justify-between gap-2 transition-all cursor-pointer group text-left"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Save className="w-4 h-4 text-rose-500 flex-shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs font-bold truncate">บันทึกโปรเจกต์</div>
                  <div className="text-[10px] text-muted-foreground truncate">เข้าคลังส่วนตัว</div>
                </div>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-700 dark:text-rose-300 font-bold">
                Save
              </span>
            </button>

            <div className="p-3 rounded-xl bg-muted/40 border border-border text-[11px] text-muted-foreground space-y-1">
              <div className="font-bold text-foreground flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-rose-500" />
                <span>Multi-Char Draft Isolation</span>
              </div>
              <p className="text-[10px] leading-relaxed">
                บันทึก Draft อัตโนมัติแยกมิติ ปลอดภัย ไม่ทับ Single-Char
              </p>
            </div>
          </div>
        </aside>

        {/* Mobile Drawer (When Open) */}
        {isMobileDrawerOpen && (
          <div className="fixed inset-0 z-40 md:hidden bg-black/60 backdrop-blur-xs animate-in fade-in flex flex-col">
            <div className="p-4 bg-card border-b border-border flex items-center justify-between">
              <span className="font-bold text-sm text-foreground">เลือกหมวดหมู่</span>
              <button
                type="button"
                onClick={() => setIsMobileDrawerOpen(false)}
                className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-foreground cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 p-4 space-y-2 overflow-y-auto bg-background">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setActiveTab(tab.id as TabId);
                      setIsMobileDrawerOpen(false);
                    }}
                    className={'w-full p-3 rounded-2xl border text-left flex items-center gap-3 cursor-pointer ' + (isActive ? 'bg-rose-500/10 border-rose-500/50' : 'bg-card border-border')}
                  >
                    <Icon className={'w-5 h-5 ' + tab.color} />
                    <div>
                      <div className="text-xs font-bold text-foreground">{tab.label}</div>
                      <div className="text-[10px] text-muted-foreground">{tab.desc}</div>
                    </div>
                  </button>
                );
              })}

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileDrawerOpen(false);
                    setIsLibraryModalOpen(true);
                  }}
                  className="w-full p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-foreground flex items-center gap-3 font-bold text-xs"
                >
                  <FolderOpen className="w-5 h-5 text-rose-500" />
                  <span>เปิดคลังโปรเจกต์ ({savedProjects.length})</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Right Content View Area */}
        <main className="flex-1 overflow-y-auto custom-scrollbar p-3.5 sm:p-6 bg-background">
          <div className="max-w-5xl mx-auto pb-16">
            {activeTab === 'world' && (
              <WorldSettingSection
                worldSetting={project.worldSetting}
                onUpdate={updateWorldSetting}
              />
            )}

            {activeTab === 'lore' && (
              <LoreTimelineSection
                lore={project.lore}
                mainCharacters={project.mainCharacters}
                onUpdateLore={updateLore}
                onAddEvent={addTimelineEvent}
                onUpdateEvent={updateTimelineEvent}
                onRemoveEvent={removeTimelineEvent}
              />
            )}

            {activeTab === 'routes' && (
              <RoutesSection
                routes={project.routes}
                mainCharacters={project.mainCharacters}
                onAddRoute={addRoute}
                onUpdateRoute={updateRoute}
                onRemoveRoute={removeRoute}
              />
            )}

            {activeTab === 'mainChars' && (
              <MainCharactersSection
                mainCharacters={project.mainCharacters}
                onAddCharacter={addMainCharacter}
                onUpdateCharacter={updateMainCharacter}
                onRemoveCharacter={removeMainCharacter}
              />
            )}

            {activeTab === 'castRules' && (
              <CastRulesSection
                supportingCharacters={project.supportingCharacters}
                castInteractionRules={project.castInteractionRules}
                onAddSubChar={addSupportingCharacter}
                onUpdateSubChar={updateSupportingCharacter}
                onRemoveSubChar={removeSupportingCharacter}
                onUpdateRules={updateCastInteractionRules}
              />
            )}

            {activeTab === 'preview' && (
              <RubiiDraftPreviewSection
                project={project}
                onImportJson={importProjectJson}
                showToast={showToast}
              />
            )}
          </div>
        </main>
      </div>

      {/* Multi-Char Project Library Modal */}
      <MultiCharLibraryModal
        isOpen={isLibraryModalOpen}
        onClose={() => setIsLibraryModalOpen(false)}
        currentProject={project}
        savedProjects={savedProjects}
        activeLibraryProjectId={activeLibraryProjectId}
        onSaveToLibrary={saveProjectToLibrary}
        onLoadFromLibrary={loadProjectFromLibrary}
        onDeleteFromLibrary={deleteProjectFromLibrary}
        showToast={showToast}
      />

      {/* Auth Modal & Upgrade Modal */}
      <AuthModal />
      <UpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
      />

      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-4 right-4 z-50 px-4 py-2.5 rounded-xl bg-card border border-rose-500/40 text-foreground text-xs font-bold shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <Sparkle className="w-4 h-4 text-amber-500" />
          <span>{toastMsg}</span>
        </div>
      )}
    </div>
  );
}