'use client';
import React, { useState } from 'react';
import {
  FolderOpen,
  Plus,
  Trash2,
  Save,
  Download,
  Search,
  X,
  Check,
  Globe,
  Users,
  Sparkles,
  GitFork,
  FileText,
  FileJson,
  RotateCcw,
} from 'lucide-react';
import type { MultiCharacterProjectDraft } from '@/shared/multiCharTypes';
import type { SavedMultiProjectRecord } from '@/hooks/useMultiCharacterProject';
import { compileRubiiProjectMarkdown } from './RubiiDraftPreviewSection';

interface MultiCharLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProject: MultiCharacterProjectDraft;
  savedProjects: SavedMultiProjectRecord[];
  activeLibraryProjectId: string | null;
  onSaveToLibrary: (title?: string, idToOverwrite?: string) => { success: boolean; id?: string };
  onLoadFromLibrary: (id: string) => boolean;
  onDeleteFromLibrary: (id: string) => void;
  showToast: (msg: string) => void;
}

export function MultiCharLibraryModal({
  isOpen,
  onClose,
  currentProject,
  savedProjects,
  activeLibraryProjectId,
  onSaveToLibrary,
  onLoadFromLibrary,
  onDeleteFromLibrary,
  showToast,
}: MultiCharLibraryModalProps) {
  const [activeTab, setActiveTab] = useState<'list' | 'save'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [saveTitle, setSaveTitle] = useState(
    currentProject.worldSetting.projectName || currentProject.title || ''
  );
  const [saveMode, setSaveMode] = useState<'overwrite' | 'new'>(
    activeLibraryProjectId && savedProjects.some((p) => p.id === activeLibraryProjectId)
      ? 'overwrite'
      : 'new'
  );
  const [targetOverwriteId, setTargetOverwriteId] = useState<string>(
    activeLibraryProjectId || savedProjects[0]?.id || ''
  );
  const [isSuccessFeedback, setIsSuccessFeedback] = useState(false);

  if (!isOpen) return null;

  const filteredProjects = savedProjects.filter(
    (p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const idToOverwrite = saveMode === 'overwrite' ? targetOverwriteId : undefined;
    const res = onSaveToLibrary(saveTitle, idToOverwrite);
    if (res.success) {
      setIsSuccessFeedback(true);
      showToast(
        saveMode === 'overwrite'
          ? `บันทึกทับโปรเจกต์ "${saveTitle || 'Multi-Char'}" เรียบร้อย!`
          : `บันทึกโปรเจกต์ใหม่ "${saveTitle || 'Multi-Char'}" ลงในคลังเรียบร้อย!`
      );
      setTimeout(() => {
        setIsSuccessFeedback(false);
        setActiveTab('list');
      }, 1200);
    }
  };

  const handleLoad = (id: string, title: string) => {
    const success = onLoadFromLibrary(id);
    if (success) {
      showToast(`โหลดโปรเจกต์ "${title}" เข้าสู่พื้นที่ทำงานเรียบร้อย!`);
      onClose();
    }
  };

  const handleDelete = (id: string, title: string) => {
    if (confirm(`คุณต้องการลบโปรเจกต์ "${title}" ออกจากคลังใช่หรือไม่?`)) {
      onDeleteFromLibrary(id);
      showToast(`ลบโปรเจกต์ "${title}" เรียบร้อย`);
    }
  };

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`ดาวน์โหลด ${filename} เรียบร้อย!`);
  };

  const handleDownloadJson = (record: SavedMultiProjectRecord) => {
    const jsonStr = JSON.stringify(record.projectData, null, 2);
    const filename = `${record.title.replace(/\s+/g, '_') || 'multi_char_project'}.json`;
    downloadFile(jsonStr, filename, 'application/json;charset=utf-8');
  };

  const handleDownloadMd = (record: SavedMultiProjectRecord) => {
    const mdStr = compileRubiiProjectMarkdown(record.projectData);
    const filename = `${record.title.replace(/\s+/g, '_') || 'multi_char_project'}.md`;
    downloadFile(mdStr, filename, 'text/markdown;charset=utf-8');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div
        className="fixed inset-0"
        onClick={onClose}
      />

      <div className="relative w-full max-w-2xl bg-card border border-border rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden z-10 animate-in zoom-in-95 duration-150">
        {/* Modal Standard Header (2-Row on Mobile per DESIGN.md) */}
        <div className="flex-shrink-0 flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:px-6 sm:py-4 border-b border-border bg-muted/30 gap-3 sm:gap-4">
          {/* Row 1 on Mobile: Icon, Title & Mobile Close Button */}
          <div className="flex items-start justify-between sm:justify-start gap-3 min-w-0 flex-1">
            <div className="flex items-start gap-2.5 sm:gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold text-base shadow-xs flex-shrink-0 mt-0.5 sm:mt-0">
                <FolderOpen className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm sm:text-base font-bold text-foreground flex items-center gap-2">
                  <span>คลังโปรเจกต์ Multi-Char</span>
                  <span className="text-[10px] px-2 py-0.2 rounded-full bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20 font-bold">
                    {savedProjects.length} โปรเจกต์
                  </span>
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5 leading-snug truncate">
                  บันทึก โหลดสลับเรื่อง และส่งออกโปรเจกต์หลายตัวละคร
                </p>
              </div>
            </div>

            {/* Close Button on Mobile */}
            <button
              type="button"
              onClick={onClose}
              className="sm:hidden w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Row 2 on Mobile: Tabs & Desktop Close Button */}
          <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto flex-shrink-0 pt-2 sm:pt-0 border-t border-border/40 sm:border-t-0">
            <div className="grid grid-cols-2 sm:flex rounded-xl bg-muted p-1 border border-border w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setActiveTab('list')}
                className={
                  'px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ' +
                  (activeTab === 'list'
                    ? 'bg-card text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground')
                }
              >
                <FolderOpen className="w-3.5 h-3.5" />
                <span>รายการ ({savedProjects.length})</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSaveTitle(currentProject.worldSetting.projectName || currentProject.title || '');
                  setActiveTab('save');
                }}
                className={
                  'px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ' +
                  (activeTab === 'save'
                    ? 'bg-card text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground')
                }
              >
                <Save className="w-3.5 h-3.5 text-rose-500" />
                <span>บันทึกโปรเจกต์</span>
              </button>
            </div>

            {/* Close Button on Desktop */}
            <button
              type="button"
              onClick={onClose}
              className="hidden sm:flex w-8 h-8 rounded-lg items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 bg-background">
          {activeTab === 'list' && (
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ค้นหาชื่อโปรเจกต์ หรือแนวเรื่อง..."
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-card border border-border text-xs text-foreground outline-hidden focus:border-rose-500/60"
                />
              </div>

              {/* Project Cards List */}
              {savedProjects.length === 0 ? (
                <div className="p-8 sm:p-12 rounded-2xl border border-dashed border-border text-center bg-card/40 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-muted mx-auto flex items-center justify-center text-muted-foreground">
                    <FolderOpen className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">ยังไม่มีโปรเจกต์ในคลัง</h3>
                    <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                      บันทึกโครงร่างโปรเจกต์ปัจจุบันของคุณเก็บไว้ในคลังเพื่อสลับแก้ไขหรือโหลดใช้งานได้ตลอดเวลา
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('save')}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer inline-flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>บันทึกโปรเจกต์ปัจจุบันลงคลัง</span>
                  </button>
                </div>
              ) : filteredProjects.length === 0 ? (
                <div className="p-8 text-center text-xs text-muted-foreground">
                  ไม่พบโปรเจกต์ที่ตรงกับคำค้นหา "{searchQuery}"
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredProjects.map((rec) => {
                    const isCurrent = activeLibraryProjectId === rec.id;
                    return (
                      <div
                        key={rec.id}
                        className={
                          'p-4 rounded-2xl border transition-all space-y-3 ' +
                          (isCurrent
                            ? 'bg-rose-500/5 border-rose-500/40 shadow-xs'
                            : 'bg-card border-border hover:border-border/80')
                        }
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-bold text-foreground truncate">
                                {rec.title}
                              </h4>
                              {isCurrent && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-rose-500 text-white font-bold">
                                  ใช้งานอยู่
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground truncate mt-0.5">
                              {rec.description || 'ไม่มีคำอธิบาย'}
                            </p>
                          </div>

                          <div className="text-[10px] text-muted-foreground font-mono self-start sm:self-auto">
                            แก้ไขล่าสุด: {new Date(rec.updatedAt).toLocaleDateString('th-TH')}
                          </div>
                        </div>

                        {/* Project Statistics Badges */}
                        <div className="flex flex-wrap gap-2 text-[11px]">
                          <span className="px-2 py-0.5 rounded-lg bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20 font-bold flex items-center gap-1">
                            <Users className="w-3 h-3 text-rose-500" />
                            <span>{rec.mainCharCount} ตัวหลัก</span>
                          </span>
                          <span className="px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 font-bold flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-emerald-500" />
                            <span>{rec.subCharCount} ตัวเสริม</span>
                          </span>
                          <span className="px-2 py-0.5 rounded-lg bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20 font-bold flex items-center gap-1">
                            <GitFork className="w-3 h-3 text-blue-500" />
                            <span>{rec.routeCount} เส้นทาง (Routes)</span>
                          </span>
                        </div>

                        {/* Actions Toolbar */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/60">
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleDownloadJson(rec)}
                              className="px-2.5 py-1 rounded-lg bg-muted hover:bg-muted/80 text-foreground text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer"
                              title="ดาวน์โหลด JSON Schema"
                            >
                              <FileJson className="w-3.5 h-3.5 text-amber-500" />
                              <span>JSON</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDownloadMd(rec)}
                              className="px-2.5 py-1 rounded-lg bg-muted hover:bg-muted/80 text-foreground text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer"
                              title="ดาวน์โหลด Master Markdown"
                            >
                              <FileText className="w-3.5 h-3.5 text-blue-500" />
                              <span>MD</span>
                            </button>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleDelete(rec.id, rec.title)}
                              className="w-7 h-7 rounded-lg hover:bg-rose-500/20 text-muted-foreground hover:text-rose-600 dark:hover:text-rose-400 flex items-center justify-center transition-all cursor-pointer"
                              title="ลบโปรเจกต์"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleLoad(rec.id, rec.title)}
                              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                            >
                              <span>โหลดโปรเจกต์</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'save' && (
            <form onSubmit={handleSave} className="space-y-4">
              {/* Overwrite or New Mode Selector */}
              {savedProjects.length > 0 && (
                <div className="grid grid-cols-2 gap-2 p-1 bg-muted rounded-xl border border-border">
                  <button
                    type="button"
                    onClick={() => setSaveMode('new')}
                    className={
                      'py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ' +
                      (saveMode === 'new'
                        ? 'bg-card text-foreground shadow-xs'
                        : 'text-muted-foreground hover:text-foreground')
                    }
                  >
                    <Plus className="w-3.5 h-3.5 text-emerald-500" />
                    <span>บันทึกเป็นโปรเจกต์ใหม่</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSaveMode('overwrite')}
                    className={
                      'py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ' +
                      (saveMode === 'overwrite'
                        ? 'bg-card text-foreground shadow-xs'
                        : 'text-muted-foreground hover:text-foreground')
                    }
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-amber-500" />
                    <span>บันทึกทับโปรเจกต์เดิม</span>
                  </button>
                </div>
              )}

              {saveMode === 'overwrite' && savedProjects.length > 0 && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    เลือกโปรเจกต์ที่ต้องการบันทึกทับ:
                  </label>
                  <select
                    value={targetOverwriteId}
                    onChange={(e) => {
                      setTargetOverwriteId(e.target.value);
                      const target = savedProjects.find((p) => p.id === e.target.value);
                      if (target) setSaveTitle(target.title);
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-card border border-border text-xs text-foreground font-semibold outline-hidden focus:border-rose-500/60"
                  >
                    {savedProjects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title} ({p.mainCharCount} ตัวหลัก, {p.routeCount} เส้นทาง)
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  ชื่อโปรเจกต์ที่จะบันทึก (Project Title):
                </label>
                <input
                  type="text"
                  required
                  value={saveTitle}
                  onChange={(e) => setSaveTitle(e.target.value)}
                  placeholder="เช่น Aethelgard: เงาอัศวินกับพันธนาการจักรกล..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-card border border-border text-xs text-foreground font-bold outline-hidden focus:border-rose-500/60"
                />
              </div>

              {/* Current Project Snapshot Summary */}
              <div className="p-3.5 rounded-xl bg-card/60 border border-border space-y-2">
                <div className="text-xs font-bold text-foreground">ข้อมูลสรุปที่จะถูกบันทึก:</div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 rounded-lg bg-background border border-border/80">
                    <div className="text-[10px] text-muted-foreground">ตัวละครหลัก</div>
                    <div className="font-bold text-rose-600 dark:text-rose-400">
                      {currentProject.mainCharacters.length} ตัว
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-background border border-border/80">
                    <div className="text-[10px] text-muted-foreground">ตัวละครเสริม</div>
                    <div className="font-bold text-emerald-600 dark:text-emerald-400">
                      {currentProject.supportingCharacters.length} ตัว
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-background border border-border/80">
                    <div className="text-[10px] text-muted-foreground">เส้นทาง (Routes)</div>
                    <div className="font-bold text-blue-600 dark:text-blue-400">
                      {currentProject.routes.length} เส้นทาง
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Save Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSuccessFeedback}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  {isSuccessFeedback ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-300" />
                      <span>บันทึกสำเร็จเรียบร้อย!</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>
                        {saveMode === 'overwrite'
                          ? 'ยืนยันบันทึกทับโปรเจกต์เดิม'
                          : 'ยืนยันบันทึกโปรเจกต์ใหม่'}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
