'use client';
import React from 'react';
import { X, BookOpen } from 'lucide-react';
import { PromptLibraryView } from './PromptLibraryView';
import { PromptLibraryEntry } from '@/shared/promptLibraryTypes';

interface PromptLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: 'single' | 'multi';
  isReadOnly?: boolean;
  onApplyToProject?: (selectedEntries: PromptLibraryEntry[]) => { success: boolean; message: string; undo?: () => void };
}

export function PromptLibraryModal({
  isOpen,
  onClose,
  mode = 'single',
  isReadOnly = false,
  onApplyToProject,
}: PromptLibraryModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-4xl bg-card border border-border rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col h-[92vh] max-h-[880px] overflow-hidden z-10 animate-in zoom-in-95 duration-150">
        {/* Modal Top Header */}
        <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 sm:px-6 sm:py-3.5 border-b border-border bg-muted/40">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-600 dark:text-purple-400 flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-foreground truncate">
                Prompt Library (คลังคำสั่งและกฎพฤติกรรม)
              </h2>
              <p className="text-[11px] text-muted-foreground hidden sm:block">
                เลือกและเพิ่มชุดคำสั่งมาตรฐานสำหรับ Purrpaw, Rubii และ Khui AI
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="ปิดหน้าต่าง Prompt Library"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body Container */}
        <div className="flex-1 p-3 sm:p-5 overflow-y-auto custom-scrollbar">
          <PromptLibraryView
            mode={mode}
            isReadOnly={isReadOnly}
            onApplyToProject={onApplyToProject}
            onClose={onClose}
          />
        </div>
      </div>
    </div>
  );
}
