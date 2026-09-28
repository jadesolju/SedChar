'use client';
import React from 'react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-5xl bg-card border border-border rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col h-[94vh] max-h-[920px] overflow-hidden z-10 animate-in zoom-in-95 duration-150">
        <PromptLibraryView
          mode={mode}
          isReadOnly={isReadOnly}
          onApplyToProject={onApplyToProject}
          onClose={onClose}
          isStandalonePage={false}
        />
      </div>
    </div>
  );
}
