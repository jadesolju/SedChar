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
  Sparkle
} from 'lucide-react';
import { useMultiCharacterProject } from '@/hooks/useMultiCharacterProject';
import { WorldSettingSection } from './WorldSettingSection';
import { LoreTimelineSection } from './LoreTimelineSection';
import { RoutesSection } from './RoutesSection';
import { MainCharactersSection } from './MainCharactersSection';
import { CastRulesSection } from './CastRulesSection';
import { RubiiDraftPreviewSection } from './RubiiDraftPreviewSection';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

type TabId = 'world' | 'lore' | 'routes' | 'mainChars' | 'castRules' | 'preview';

const TABS = [
  { id: 'world', label: '1. World Setting', desc: 'กฎของโลก, ฉาก, ยุคสมัย', icon: Globe, color: 'text-purple-600 dark:text-purple-400' },
  { id: 'lore', label: '2. Lore & Timeline', desc: 'ไทม์ไลน์, ภูมิหลัง, ความลับ', icon: BookOpen, color: 'text-amber-600 dark:text-amber-400' },
  { id: 'routes', label: '3. Routes & Branches', desc: 'เส้นทางเรื่อง, เงื่อนไข', icon: GitFork, color: 'text-blue-600 dark:text-blue-400' },
  { id: 'mainChars', label: '4. Main Characters', desc: 'ตัวละครหลัก (10 ตัวใน Free)', icon: Users, color: 'text-rose-600 dark:text-rose-400' },
  { id: 'castRules', label: '5. Cast & Sub-Chars', desc: 'ตัวละครเสริมไม่จำกัด + กฎฉากรวม', icon: Sparkles, color: 'text-emerald-600 dark:text-emerald-400' },
  { id: 'preview', label: '6. Master Draft Export', desc: 'สรุปรวมร่างโปรเจกต์', icon: FileText, color: 'text-pink-600 dark:text-pink-400' },
];

export function RubiiMultiWorkspace() {
  const {
    project,
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
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleLoadSample = () => {
    loadSampleProject();
    showToast('โหลดตัวอย่างจักรวาล "Aethelgard: มหานครเวทจักรกล" เรียบร้อย!');
  };

  const handleReset = () => {
    if (confirm('คุณต้องการรีเซ็ตโปรเจกต์ Multi-Char ทั้งหมดกลับเป็นค่าเริ่มต้นหรือไม่?')) {
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
          {/* Load Sample Universe */}
          <button
            type="button"
            onClick={handleLoadSample}
            className="px-3 py-1.5 rounded-xl border border-border bg-card hover:bg-muted text-xs font-bold text-foreground transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="โหลดตัวอย่างโครงสร้าง Multi-Character Universe"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden sm:inline">ตัวอย่าง Multi-Char</span>
          </button>

          {/* Reset */}
          <button
            type="button"
            onClick={handleReset}
            className="w-8 h-8 rounded-xl border border-border bg-card hover:bg-rose-500/20 text-muted-foreground hover:text-rose-600 dark:hover:text-rose-400 transition-all flex items-center justify-center cursor-pointer shadow-xs"
            title="ล้างโปรเจกต์ทั้งหมด"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <ThemeToggle />

          {/* Mobile Drawer Button */}
          <button
            type="button"
            onClick={() => setIsMobileDrawerOpen(!isMobileDrawerOpen)}
            className="md:hidden w-8 h-8 rounded-xl border border-border bg-card flex items-center justify-center text-foreground cursor-pointer"
          >
            {isMobileDrawerOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main Workspace Body */}
      <div className="flex-1 overflow-hidden flex relative">
        {/* Left Vertical Navigation Sidebar (Desktop) */}
        <aside className="hidden md:flex flex-col w-64 lg:w-72 border-r border-border bg-card/40 p-3 space-y-1.5 flex-shrink-0 overflow-y-auto custom-scrollbar">
          <div className="px-2 py-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
            <span>โครงสร้างโปรเจกต์</span>
            <span className="text-[10px] text-rose-700 dark:text-rose-300 font-bold font-mono bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20">
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
                className={"w-full p-2.5 rounded-2xl border text-left transition-all flex items-center gap-3 cursor-pointer " + (isActive ? "bg-card border-rose-500/50 shadow-md ring-1 ring-rose-500/20" : "bg-transparent border-transparent hover:bg-muted/40 hover:border-border/60 text-muted-foreground hover:text-foreground")}
              >
                <div className={"w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 " + (isActive ? "bg-rose-500/15 border border-rose-500/30" : "bg-muted/60")}>
                  <Icon className={"w-4 h-4 " + (isActive ? "text-rose-600 dark:text-rose-400" : tab.color)} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className={"text-xs font-bold truncate " + (isActive ? "text-foreground" : "text-foreground/90")}>
                    {tab.label}
                  </div>
                  <div className="text-[10px] text-muted-foreground truncate">
                    {tab.desc}
                  </div>
                </div>
              </button>
            );
          })}

          <div className="mt-auto pt-4 border-t border-border px-2">
            <div className="p-3 rounded-xl bg-muted/40 border border-border text-[11px] text-muted-foreground space-y-1">
              <div className="font-bold text-foreground flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-rose-500" />
                <span>Multi-Char Draft Isolation</span>
              </div>
              <p className="text-[10px] leading-relaxed">
                บันทึก Draft อัตโนมัติแยกคีย์ ปลอดภัย ไม่ทับ Single-Char
              </p>
            </div>
          </div>
        </aside>

        {/* Mobile Drawer (When Open) */}
        {isMobileDrawerOpen && (
          <div className="fixed inset-0 z-40 md:hidden bg-black/60 backdrop-blur-xs animate-in fade-in flex flex-col">
            <div className="p-4 bg-card border-b border-border flex items-center justify-between">
              <span className="font-bold text-sm text-foreground">เลือกแท็บแก้ไข</span>
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
                    className={"w-full p-3 rounded-2xl border text-left flex items-center gap-3 cursor-pointer " + (isActive ? "bg-rose-500/10 border-rose-500/50" : "bg-card border-border")}
                  >
                    <Icon className={"w-5 h-5 " + tab.color} />
                    <div>
                      <div className="text-xs font-bold text-foreground">{tab.label}</div>
                      <div className="text-[10px] text-muted-foreground">{tab.desc}</div>
                    </div>
                  </button>
                );
              })}
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
              <RubiiDraftPreviewSection project={project} />
            )}
          </div>
        </main>
      </div>

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
