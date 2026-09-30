'use client';
import React, { useState } from 'react';
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
} from 'lucide-react';
import type { MultiCharacterProjectDraft } from '@/shared/multiCharTypes';
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
  const { user } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [shareId, setShareId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [allowCloning, setAllowCloning] = useState(true);
  const [allowCoCreation, setAllowCoCreation] = useState(true);

  if (!isOpen) return null;

  const handleGenerateShareLink = async () => {
    setIsGenerating(true);
    try {
      const authorName =
        user?.user_metadata?.display_name ||
        user?.user_metadata?.full_name ||
        (user?.email ? user.email.split('@')[0] : 'นักสร้างจักรวาล SedChar');

      const res = await fetch('/api/universe/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project,
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
        onShowToast('สร้างลิงก์ Secret Share สำเร็จแล้ว!');
      } else {
        alert(data.error || 'สร้างลิงก์แชร์ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง');
      }
    } catch (e: any) {
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อ: ' + e.message);
    } finally {
      setIsGenerating(false);
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
    if (!confirm('คุณต้องการยกเลิกลิงก์แชร์นี้หรือไม่? ผู้ที่มีลิงก์เดิมจะไม่สามารถเข้าดูได้อีก')) return;

    try {
      await fetch(`/api/universe/share?shareId=${encodeURIComponent(shareId)}`, {
        method: 'DELETE',
      });
      setShareUrl(null);
      setShareId(null);
      onShowToast('ยกเลิกลิงก์แชร์เรียบร้อยแล้ว');
    } catch (e: any) {
      alert('เกิดข้อผิดพลาด: ' + e.message);
    }
  };

  const projectName = project.worldSetting?.projectName || project.title || 'จักรวาลที่ยังไม่ได้ตั้งชื่อ';

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
                <span className="px-2 py-0.5 text-[9px] sm:text-[10px] font-semibold rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 shrink-0">
                  Secret Only
                </span>
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
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Privacy Notice Banner */}
          <div className="p-3.5 rounded-xl bg-muted/40 border border-border flex items-start gap-3 text-xs leading-relaxed text-muted-foreground">
            <Lock className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-foreground">การแชร์แบบส่วนตัว: </span>
              จักรวาลนี้จะไม่ถูกแสดงในหน้าสาธารณะ (No Public Feed) เฉพาะผู้ที่คุณส่งลิงก์ให้เท่านั้นที่จะสามารถเปิดดูและกดคัดลอก (Clone) เข้าคลังของตนเองได้
            </div>
          </div>

          {/* Project Summary */}
          <div className="p-4 rounded-xl bg-card border border-border/80 space-y-2">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              ข้อมูลที่จะถูกรวมในลิงก์แชร์
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
          {!shareUrl && (
            <div className="p-4 rounded-xl bg-card border border-border space-y-3">
              <div className="text-xs font-bold text-foreground flex items-center justify-between">
                <span>การตั้งค่าสิทธิ์และการป้องกัน (Permissions & Protection)</span>
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
            </div>
          )}

          {/* Share Link Result */}
          {shareUrl ? (
            <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
              <label className="text-xs font-bold text-foreground flex items-center justify-between">
                <span>ลิงก์สำหรับส่งต่อให้เพื่อน</span>
                <span className="text-emerald-500 flex items-center gap-1 text-[11px]">
                  <ShieldCheck className="w-3.5 h-3.5" /> ลิงก์พร้อมใช้งาน
                </span>
              </label>

              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    readOnly
                    value={shareUrl}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-muted/50 border border-border text-xs font-mono text-foreground focus:outline-none select-all"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleCopy}
                  className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm ${
                    copied
                      ? 'bg-emerald-600 text-white'
                      : 'bg-primary hover:bg-primary/90 text-primary-foreground'
                  }`}
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'คัดลอกแล้ว' : 'คัดลอก'}</span>
                </button>
              </div>

              <div className="flex items-center justify-between pt-2">
                <a
                  href={shareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                >
                  <span>ทดลองเปิดดูหน้าพรีวิว</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <button
                  type="button"
                  onClick={handleRevoke}
                  className="text-xs font-semibold text-rose-500 hover:text-rose-600 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>ยกเลิกลิงก์แชร์</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="pt-2">
              <button
                type="button"
                onClick={handleGenerateShareLink}
                disabled={isGenerating}
                className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>กำลังสร้างลิงก์และบันทึกข้อมูล...</span>
                  </>
                ) : (
                  <>
                    <LinkIcon className="w-4 h-4" />
                    <span>สร้าง Secret Share Link สำหรับจักรวาลนี้</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
