'use client';
import React, { useState, useEffect } from 'react';
import {
  X,
  Link as LinkIcon,
  Copy,
  Check,
  Globe,
  Lock,
  Sparkles,
  Share2,
  ExternalLink,
  Trash2,
  Loader2,
  ShieldCheck,
  Layers,
  Cloud,
  CloudOff,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import type { MultiCharacterProjectDraft } from '@/shared/multiCharTypes';
import {
  MULTI_CHAR_LIBRARY_KEY,
  RUBII_MULTI_DRAFT_KEY,
} from '@/hooks/useMultiCharacterProject';
import { useAuth } from '@/context/AuthContext';

interface UniverseShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: MultiCharacterProjectDraft;
  onShowToast: (msg: string) => void;
}

export function UniverseShareModal({
  isOpen,
  onClose,
  project,
  onShowToast,
}: UniverseShareModalProps) {
  const { user, openAuthModal } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [shareId, setShareId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [allowCloning, setAllowCloning] = useState(true);
  const [allowCoCreation, setAllowCoCreation] = useState(true);

  // Auto-detect if this project was already created or shared
  useEffect(() => {
    if (!isOpen) return;

    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const currentTitle =
      project.worldSetting?.projectName?.trim() || project.title?.trim() || '';

    // 1. Check direct project properties
    let detectedShareId =
      project.shareId ||
      ((project.id && project.id.startsWith('uni_')) ? project.id : null);

    // 2. Check local draft in storage
    if (!detectedShareId && typeof window !== 'undefined') {
      try {
        const rawDraft = localStorage.getItem(RUBII_MULTI_DRAFT_KEY);
        if (rawDraft) {
          const parsed = JSON.parse(rawDraft);
          if (parsed?.shareId) {
            detectedShareId = parsed.shareId;
          } else if (parsed?.id && parsed.id.startsWith('uni_')) {
            detectedShareId = parsed.id;
          }
        }
      } catch {}
    }

    // 3. Check Multi-Char Library in LocalStorage
    if (!detectedShareId && typeof window !== 'undefined') {
      try {
        const rawLib = localStorage.getItem(MULTI_CHAR_LIBRARY_KEY);
        if (rawLib) {
          const list = JSON.parse(rawLib);
          if (Array.isArray(list)) {
            const match = list.find(
              (p: any) =>
                (p.id && p.id === project.id && (p.shareId || p.id.startsWith('uni_'))) ||
                (p.shareId && (p.shareId === project.shareId || p.id === project.id)) ||
                (currentTitle &&
                  p.title?.trim().toLowerCase() === currentTitle.toLowerCase() &&
                  (p.shareId || p.id?.startsWith('uni_')))
            );
            if (match) {
              detectedShareId = match.shareId || (match.id?.startsWith('uni_') ? match.id : null);
            }
          }
        }
      } catch {}
    }

    if (detectedShareId) {
      setShareId(detectedShareId);
      setShareUrl(`${origin}/universe/share/${detectedShareId}`);

      // Fetch live metadata to sync permission checkboxes
      fetch(`/api/universe/share?shareId=${encodeURIComponent(detectedShareId)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.metadata) {
            if (typeof data.metadata.allowCloning === 'boolean') {
              setAllowCloning(data.metadata.allowCloning);
            }
            if (typeof data.metadata.allowCoCreation === 'boolean') {
              setAllowCoCreation(data.metadata.allowCoCreation);
            }
          }
        })
        .catch(() => {});
    } else {
      setShareId(null);
      setShareUrl(null);
    }
  }, [isOpen, project]);

  if (!isOpen) return null;

  const handleSaveOrUpdateShare = async (targetShareId?: string) => {
    const isUpdateMode = !!targetShareId;
    if (isUpdateMode) {
      setIsUpdating(true);
    } else {
      setIsGenerating(true);
    }

    try {
      const authorName =
        user?.user_metadata?.display_name ||
        user?.user_metadata?.full_name ||
        (user?.email ? user.email.split('@')[0] : 'นักสร้างจักรวาล SedChar');

      const res = await fetch('/api/universe/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project: {
            ...project,
            shareId: targetShareId || shareId || undefined,
          },
          shareId: targetShareId || shareId || undefined,
          userId: user?.id || 'guest',
          author: authorName,
          allowCloning,
          allowCoCreation,
        }),
      });

      const data = await res.json();
      if (data.success && data.shareId) {
        const origin = typeof window !== 'undefined' ? window.location.origin : '';
        const fullUrl = `${origin}/universe/share/${data.shareId}`;
        setShareUrl(fullUrl);
        setShareId(data.shareId);

        // Auto-sync to local project library and active draft immediately
        try {
          const projectTitle =
            project.worldSetting?.projectName?.trim() || project.title || 'จักรวาลและคลังความจำ';

          // 1. Update active draft
          const rawDraft = localStorage.getItem(RUBII_MULTI_DRAFT_KEY);
          if (rawDraft) {
            const parsed = JSON.parse(rawDraft);
            parsed.shareId = data.shareId;
            parsed.isShared = true;
            localStorage.setItem(RUBII_MULTI_DRAFT_KEY, JSON.stringify(parsed));
          }

          // 2. Update library
          const rawLib = localStorage.getItem(MULTI_CHAR_LIBRARY_KEY);
          let list = rawLib ? JSON.parse(rawLib) : [];
          if (!Array.isArray(list)) list = [];

          const newRecord = {
            id: data.shareId,
            title: projectTitle,
            author: authorName,
            description:
              project.worldSetting?.genreTone ||
              project.worldSetting?.mainLocation ||
              'จักรวาลและคลังความจำ',
            mainCharCount: project.mainCharacters?.length || 0,
            subCharCount: project.supportingCharacters?.length || 0,
            routeCount: project.routes?.length || 0,
            projectData: {
              ...project,
              author: authorName,
              shareId: data.shareId,
              isShared: true,
            },
            shareId: data.shareId,
            shareUrl: fullUrl,
            isShared: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          const filtered = list.filter(
            (p: any) =>
              p.id !== data.shareId &&
              p.id !== project.id &&
              p.shareId !== data.shareId &&
              (projectTitle
                ? p.title?.trim().toLowerCase() !== projectTitle.trim().toLowerCase()
                : true)
          );
          localStorage.setItem(MULTI_CHAR_LIBRARY_KEY, JSON.stringify([newRecord, ...filtered]));
          window.dispatchEvent(new Event('storage'));
        } catch (e) {}

        onShowToast(
          isUpdateMode
            ? 'อัปเดตข้อมูลและสิทธิ์ไปยังลิงก์แชร์ & Cloud สำเร็จแล้ว!'
            : 'บันทึกลง Cloud Library และสร้างลิงก์ Secret Share สำเร็จแล้ว!'
        );
      } else {
        alert(data.error || 'สร้างลิงก์แชร์ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง');
      }
    } catch (e: any) {
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อ: ' + e.message);
    } finally {
      setIsGenerating(false);
      setIsUpdating(false);
    }
  };

  const handleCopy = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    onShowToast('คัดลอกลิงก์แชร์ไปยังคลิปบอร์ดแล้ว');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleRevoke = async () => {
    if (!shareId) return;
    if (
      !confirm(
        'คุณต้องการยกเลิกลิงก์แชร์นี้หรือไม่?\nผู้ที่มีลิงก์เดิมจะไม่สามารถเข้าดูได้อีก และระบบจะลบลิงก์นี้ออกจาก Cloud'
      )
    ) {
      return;
    }

    try {
      await fetch(`/api/universe/share?shareId=${encodeURIComponent(shareId)}`, {
        method: 'DELETE',
      });

      // Clear from local draft and library
      try {
        const rawDraft = localStorage.getItem(RUBII_MULTI_DRAFT_KEY);
        if (rawDraft) {
          const parsed = JSON.parse(rawDraft);
          delete parsed.shareId;
          parsed.isShared = false;
          localStorage.setItem(RUBII_MULTI_DRAFT_KEY, JSON.stringify(parsed));
        }

        const rawLib = localStorage.getItem(MULTI_CHAR_LIBRARY_KEY);
        if (rawLib) {
          const list = JSON.parse(rawLib);
          if (Array.isArray(list)) {
            const updated = list.map((item) => {
              if (item.shareId === shareId || item.id === shareId) {
                const copy = { ...item };
                delete copy.shareId;
                delete copy.shareUrl;
                copy.isShared = false;
                return copy;
              }
              return item;
            });
            localStorage.setItem(MULTI_CHAR_LIBRARY_KEY, JSON.stringify(updated));
            window.dispatchEvent(new Event('storage'));
          }
        }
      } catch {}

      setShareUrl(null);
      setShareId(null);
      onShowToast('ยกเลิกลิงก์แชร์เรียบร้อยแล้ว');
    } catch (e: any) {
      alert('เกิดข้อผิดพลาด: ' + e.message);
    }
  };

  const projectName =
    project.worldSetting?.projectName || project.title || 'จักรวาลที่ยังไม่ได้ตั้งชื่อ';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl bg-card border border-border shadow-2xl overflow-hidden flex flex-col max-h-[92vh] z-10 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex-shrink-0 flex items-start justify-between p-3.5 sm:px-6 sm:py-4 border-b border-border bg-muted/30 gap-2.5">
          <div className="flex items-start gap-2.5 min-w-0 flex-1">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-500 border border-purple-500/20 flex items-center justify-center shrink-0 mt-0.5">
              <Share2 className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <h3 className="text-xs sm:text-base font-bold text-foreground">
                  แชร์จักรวาลแบบ Unlisted Link
                </h3>
                {shareUrl ? (
                  <span className="px-2 py-0.5 text-[9px] sm:text-[10px] font-semibold rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>สร้างแล้ว (Active)</span>
                  </span>
                ) : (
                  <span className="px-2 py-0.5 text-[9px] sm:text-[10px] font-semibold rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 shrink-0">
                    Secret Only
                  </span>
                )}
              </div>
              <p className="text-[11px] sm:text-xs text-muted-foreground line-clamp-1 mt-0.5">
                {projectName}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer shrink-0"
            aria-label="ปิดหน้าต่าง"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 overflow-y-auto">
          {/* Cloud Sync Status Banner */}
          {user ? (
            <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center gap-2.5 text-xs text-purple-700 dark:text-purple-300">
              <Cloud className="w-4 h-4 text-purple-500 shrink-0" />
              <div className="min-w-0 flex-1 leading-snug">
                <span className="font-bold">Cloud Library: </span>
                <span>
                  {shareUrl
                    ? 'จักรวาลนี้เชื่อมต่อและซิงค์กับ Cloud Library บัญชีของคุณเรียบร้อยแล้ว'
                    : 'จักรวาลนี้จะถูกบันทึกและซิงค์ลงใน Cloud Library ของคุณอัตโนมัติเมื่อสร้างลิงก์'}
                </span>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between gap-2 text-xs text-amber-700 dark:text-amber-300">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <CloudOff className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="truncate">ยังไม่ได้เข้าสู่ระบบ — บันทึกลง Cloud ถาวร</span>
              </div>
              <button
                type="button"
                onClick={() => openAuthModal('signin')}
                className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-black font-bold text-[11px] shrink-0 cursor-pointer shadow-xs"
              >
                เข้าสู่ระบบ
              </button>
            </div>
          )}

          {/* Active Share Link Card (Always shown if already created) */}
          {shareUrl && (
            <div className="p-4 rounded-2xl bg-card border border-border/90 shadow-sm space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <LinkIcon className="w-3.5 h-3.5 text-purple-500" />
                  <span>ลิงก์ Secret สำหรับส่งต่อให้เพื่อน</span>
                </label>
                <span className="text-emerald-500 flex items-center gap-1 text-[11px] font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" /> ลิงก์พร้อมใช้งาน
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    readOnly
                    value={shareUrl}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-muted/50 border border-border text-xs font-mono text-foreground focus:outline-none select-all font-semibold"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleCopy}
                  className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm shrink-0 cursor-pointer active:scale-95 ${
                    copied
                      ? 'bg-emerald-600 text-white'
                      : 'bg-primary hover:bg-primary/90 text-primary-foreground'
                  }`}
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'คัดลอกแล้ว' : 'คัดลอก'}</span>
                </button>
              </div>

              <div className="flex items-center justify-between pt-1 text-xs">
                <a
                  href={shareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-primary hover:underline flex items-center gap-1"
                >
                  <span>ทดลองเปิดดูหน้าพรีวิว</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <button
                  type="button"
                  onClick={handleRevoke}
                  className="font-semibold text-rose-500 hover:text-rose-600 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>ยกเลิกลิงก์แชร์</span>
                </button>
              </div>
            </div>
          )}

          {/* Privacy Notice Banner */}
          <div className="p-3.5 rounded-xl bg-muted/40 border border-border flex items-start gap-3 text-xs leading-relaxed text-muted-foreground">
            <Lock className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-foreground">การแชร์แบบส่วนตัว: </span>
              จักรวาลนี้จะไม่ถูกแสดงในหน้าสาธารณะ (No Public Feed) เฉพาะผู้ที่คุณส่งลิงก์ให้เท่านั้นที่จะสามารถเปิดดูและร่วมสนุกได้
            </div>
          </div>

          {/* Project Summary */}
          <div className="p-4 rounded-xl bg-card border border-border/80 space-y-2">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              ข้อมูลที่จะถูกรวมในลิงก์แชร์ &amp; Cloud Library
            </div>
            <div className="grid grid-cols-3 gap-2 text-center pt-1">
              <div className="p-2 rounded-lg bg-muted/30 border border-border/50">
                <div className="text-sm font-bold text-foreground">
                  {project.mainCharacters?.length || 0}
                </div>
                <div className="text-[11px] text-muted-foreground">ตัวละครหลัก</div>
              </div>
              <div className="p-2 rounded-lg bg-muted/30 border border-border/50">
                <div className="text-sm font-bold text-foreground">
                  {project.lore?.timelineEvents?.length || 0}
                </div>
                <div className="text-[11px] text-muted-foreground">เหตุการณ์ใน Lore</div>
              </div>
              <div className="p-2 rounded-lg bg-muted/30 border border-border/50">
                <div className="text-sm font-bold text-foreground">
                  {project.routes?.length || 0}
                </div>
                <div className="text-[11px] text-muted-foreground">เส้นทาง Route</div>
              </div>
            </div>
          </div>

          {/* Permission Settings */}
          <div className="p-4 rounded-xl bg-card border border-border space-y-3">
            <div className="text-xs font-bold text-foreground flex items-center justify-between">
              <span>การตั้งค่าสิทธิ์และการป้องกัน (Permissions &amp; Protection)</span>
              <ShieldCheck className="w-3.5 h-3.5 text-purple-500" />
            </div>

            {/* Allow Cloning Toggle */}
            <label className="flex items-start justify-between gap-3 cursor-pointer group">
              <div className="space-y-0.5 min-w-0 flex-1">
                <div className="text-xs font-semibold text-foreground group-hover:text-purple-500 transition-colors flex items-center gap-1.5">
                  <span>อนุญาตให้คัดลอกเข้า Studio (Allow Cloning)</span>
                  {!allowCloning && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold border border-amber-500/20">
                      ป้องกันการลอก
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground leading-tight">
                  {allowCloning
                    ? 'ผู้ที่มีลิงก์สามารถกดปุ่ม Clone เพื่อคัดลอกจักรวาลนี้ไปแต่งต่อในสตูดิโอส่วนตัวได้'
                    : 'ปิดปุ่ม Clone เพื่อให้อ่านและมีส่วนร่วมได้อย่างเดียว ป้องกันการคัดลอก Schema'}
                </p>
              </div>
              <input
                type="checkbox"
                checked={allowCloning}
                onChange={(e) => setAllowCloning(e.target.checked)}
                className="mt-1 h-4 w-4 rounded text-purple-600 focus:ring-purple-500 border-border cursor-pointer accent-purple-600"
              />
            </label>

            {/* Allow Co-Creation Toggle */}
            <label className="flex items-start justify-between gap-3 cursor-pointer group pt-2 border-t border-border/50">
              <div className="space-y-0.5 min-w-0 flex-1">
                <div className="text-xs font-semibold text-foreground group-hover:text-purple-500 transition-colors flex items-center gap-1.5">
                  <span>เปิดรับตัวละครร่วมสร้าง (Allow Character Proposals)</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">
                    Co-Creation
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-tight">
                  อนุญาตให้เพื่อนหรือนักเขียนท่านอื่นยื่นตัวละครเข้าร่วมจักรวาลนี้ (ใช้โควต้า AI ของตนเอง)
                </p>
              </div>
              <input
                type="checkbox"
                checked={allowCoCreation}
                onChange={(e) => setAllowCoCreation(e.target.checked)}
                className="mt-1 h-4 w-4 rounded text-purple-600 focus:ring-purple-500 border-border cursor-pointer accent-purple-600"
              />
            </label>

            {/* UID Ownership Warning Box */}
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-2.5 text-[11px] text-amber-700 dark:text-amber-300 leading-relaxed pt-2.5 mt-2">
              <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">การควบคุมสิทธิ์ (UID Security): </span>
                เมื่อสร้างลิงก์แชร์แล้ว สิทธิ์ทั้งหมดจะถูกผูกกับบัญชีนี้ (UID ผู้สร้าง) บัญชีอื่นที่ <strong>UID ไม่ตรงกันจะไม่สามารถปรับสิทธิ์หรือยกเลิกลิงก์แชร์ได้</strong>
              </div>
            </div>
          </div>

          {/* Action Buttons: Create or Update */}
          <div className="pt-2">
            {shareUrl ? (
              <button
                type="button"
                onClick={() => handleSaveOrUpdateShare(shareId || undefined)}
                disabled={isUpdating}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer active:scale-98"
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>กำลังอัปเดตข้อมูลล่าสุดไปยัง Cloud...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    <span>บันทึก &amp; อัปเดตข้อมูลลิงก์แชร์ (Sync ข้อมูลล่าสุด)</span>
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleSaveOrUpdateShare()}
                disabled={isGenerating}
                className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer active:scale-98"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>กำลังบันทึกข้อมูลและสร้างลิงก์...</span>
                  </>
                ) : (
                  <>
                    <LinkIcon className="w-4 h-4" />
                    <span>บันทึก &amp; สร้าง Secret Share Link</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


