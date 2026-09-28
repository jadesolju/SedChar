'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { PromptLibraryView } from '@/components/prompt-library/PromptLibraryView';
import { ArrowLeft, BookOpen, Layers, Coffee, Zap } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { UserMenu } from '@/components/auth/UserMenu';
import { useAuth } from '@/context/AuthContext';
import { UpgradeModal } from '@/components/ui/UpgradeModal';

export function PromptLibraryPageClient() {
  const { userRole } = useAuth();
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Top Navbar */}
      <header className="h-14 border-b border-border bg-card/80 backdrop-blur-md px-3 sm:px-6 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border bg-muted/50 hover:bg-muted text-xs font-semibold text-foreground transition-all"
            title="กลับไปยังสตูดิโอ"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-primary" />
            <span className="hidden sm:inline">สตูดิโอ</span>
          </Link>

          <div className="h-4 w-px bg-border hidden sm:block" />

          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-600/30 flex items-center justify-center border border-indigo-500/30 text-indigo-500 shadow-xs">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                <span>Prompt Library</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/25">
                  Official + Custom
                </span>
              </h1>
            </div>
          </div>
        </div>

        {/* Quick Studio Links & User Actions */}
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border bg-card hover:bg-muted text-xs font-medium text-muted-foreground hover:text-foreground transition-all"
          >
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>Single-Char</span>
          </Link>
          <Link
            href="/multi"
            className="hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border bg-card hover:bg-muted text-xs font-medium text-muted-foreground hover:text-foreground transition-all"
          >
            <Layers className="w-3.5 h-3.5 text-rose-500" />
            <span>Multi-Char</span>
          </Link>

          {userRole === 'free' && (
            <button
              type="button"
              onClick={() => setIsUpgradeModalOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/15 via-rose-500/15 to-pink-500/15 border border-amber-500/30 hover:border-amber-500 text-amber-700 dark:text-amber-300 text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
              title="เลี้ยงกาแฟผู้พัฒนา 29 บาท พร้อมรับสิทธิ์ Premium"
            >
              <Coffee className="w-3.5 h-3.5 text-amber-500" />
              <span>เลี้ยงกาแฟ ☕</span>
            </button>
          )}

          <UserMenu onOpenUpgradeModal={() => setIsUpgradeModalOpen(true)} showLibraryButton={false} />
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 flex flex-col">
        <div className="bg-card border border-border rounded-2xl shadow-sm flex-1 flex flex-col overflow-hidden min-h-[650px]">
          <PromptLibraryView
            mode="all"
            isStandalonePage={true}
          />
        </div>
      </main>

      <UpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
      />
    </div>
  );
}
