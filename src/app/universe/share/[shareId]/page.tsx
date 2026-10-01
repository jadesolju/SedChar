'use client';
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Globe,
  BookOpen,
  Users,
  GitFork,
  Sparkles,
  ArrowLeft,
  Copy,
  Check,
  Download,
  Share2,
  Lock,
  Layers,
  Shield,
  Loader2,
  AlertCircle,
  ExternalLink,
  Clock,
  UserPlus,
  Crown,
  Edit3,
} from 'lucide-react';
import type { MultiCharacterProjectDraft } from '@/shared/multiCharTypes';
import { CHARACTER_FLAGS } from '@/shared/types';
import { RUBII_MULTI_DRAFT_KEY, MULTI_CHAR_LIBRARY_KEY } from '@/hooks/useMultiCharacterProject';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { UserMenu } from '@/components/auth/UserMenu';
import { AuthModal } from '@/components/auth/AuthModal';
import { UniverseDiscussionSection } from '@/components/universe/UniverseDiscussionSection';
import { UniverseProposeCharacterModal } from '@/components/universe/UniverseProposeCharacterModal';

export default function UniverseShareViewPage() {
  return (
    <AuthProvider>
      <UniverseShareViewContent />
    </AuthProvider>
  );
}

function UniverseShareViewContent() {
  const params = useParams();
  const router = useRouter();
  const shareId = params?.shareId as string;

  const { user, userRole, openAuthModal } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [project, setProject] = useState<MultiCharacterProjectDraft | null>(null);
  const [metadata, setMetadata] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [isCloning, setIsCloning] = useState(false);
  const [isProposeModalOpen, setIsProposeModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [hasLocalOwnership, setHasLocalOwnership] = useState(false);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleCharacterProposed = (charData: any) => {
    if (!project) return;
    const newMainChar = {
      id: 'prop_' + Date.now(),
      name: charData.name,
      aliasOrTitle: charData.aliasOrTitle || '',
      gender: charData.gender || '',
      age: charData.age || '',
      storyRole: charData.storyRole || 'ตัวละครผู้ร่วมสร้าง',
      corePersonality: charData.corePersonality || '',
      primaryGoalOrDesire: '',
      relationshipWithUser: '',
      relationsWithOtherCast: charData.relationsWithOtherCast || '',
      exclusiveSecretOrKnowledge: charData.exclusiveSecretOrKnowledge || '',
      absoluteRules: '',
      appearanceBrief: '',
      speakingStyle: '',
      flagType: charData.flagType || 'none',
    };

    setProject({
      ...project,
      mainCharacters: [...(project.mainCharacters || []), newMainChar],
    });
  };

  useEffect(() => {
    if (!shareId) return;

    const fetchUniverse = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/universe/share?shareId=${encodeURIComponent(shareId)}`);
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || 'ไม่พบจักรวาลนี้ หรือลิงก์ถูกยกเลิกแล้ว');
        }
        setProject(data.project);
        setMetadata(data.metadata);
      } catch (e: any) {
        setError(e.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUniverse();
  }, [shareId]);

  // Check local storage ownership (saved library & active drafts)
  useEffect(() => {
    if (typeof window === 'undefined' || !shareId) return;
    try {
      // 1. Check active draft
      const rawDraft = localStorage.getItem(RUBII_MULTI_DRAFT_KEY);
      if (rawDraft) {
        const draft = JSON.parse(rawDraft);
        if (
          draft.shareId === shareId ||
          (project && draft.id && project.id && draft.id === project.id)
        ) {
          setHasLocalOwnership(true);
          return;
        }
      }

      // 2. Check saved library records
      const rawLib = localStorage.getItem(MULTI_CHAR_LIBRARY_KEY);
      if (rawLib) {
        const lib = JSON.parse(rawLib);
        if (Array.isArray(lib)) {
          const matched = lib.some(
            (item) =>
              item.shareId === shareId ||
              item.id === shareId ||
              (project && item.id === project.id) ||
              (project && item.projectData?.id === project.id) ||
              (project && item.projectData?.shareId === shareId)
          );
          if (matched) {
            setHasLocalOwnership(true);
            return;
          }
        }
      }
    } catch {}
  }, [shareId, project]);

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCloneToMyStudio = () => {
    if (!project) return;
    setIsCloning(true);

    try {
      // 1. Set as active draft
      localStorage.setItem(RUBII_MULTI_DRAFT_KEY, JSON.stringify(project));

      // 2. Add to saved library
      const libraryRaw = localStorage.getItem(MULTI_CHAR_LIBRARY_KEY);
      let library: any[] = [];
      if (libraryRaw) {
        try {
          library = JSON.parse(libraryRaw);
        } catch { }
      }

      const clonedRecord = {
        id: 'cloned_' + Date.now(),
        title: (project.worldSetting?.projectName || project.title || 'จักรวาลที่คัดลอกมา') + ' (Cloned)',
        description: project.worldSetting?.genreTone || 'คัดลอกมาจาก Secret Share Link',
        mainCharCount: project.mainCharacters?.length || 0,
        subCharCount: project.supportingCharacters?.length || 0,
        routeCount: project.routes?.length || 0,
        projectData: {
          ...project,
          title: (project.worldSetting?.projectName || project.title || 'จักรวาล') + ' (Cloned)',
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const updatedLibrary = [clonedRecord, ...library];
      localStorage.setItem(MULTI_CHAR_LIBRARY_KEY, JSON.stringify(updatedLibrary));

      // 3. Navigate to Multi Workspace
      router.push('/multi');
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการคัดลอก: ' + String(err));
      setIsCloning(false);
    }
  };

  const worldSetting = project?.worldSetting;
  const lore = project?.lore;
  const mainCharacters = project?.mainCharacters;
  const supportingCharacters = project?.supportingCharacters;
  const routes = project?.routes;
  const projectName = worldSetting?.projectName || project?.title || 'จักรวาลและคลังความจำ';

  const currentDisplayName =
    user?.user_metadata?.display_name ||
    user?.user_metadata?.full_name ||
    (user?.email ? user.email.split('@')[0] : '') ||
    '';

  const isOwner = Boolean(
    user &&
      (
        (metadata?.userId &&
          metadata.userId !== 'guest' &&
          metadata.userId !== 'anonymous' &&
          user.id === metadata.userId) ||
        hasLocalOwnership ||
        (currentDisplayName &&
          metadata?.author &&
          metadata.author.trim().toLowerCase() === currentDisplayName.trim().toLowerCase()) ||
        (user.email &&
          metadata?.author &&
          metadata.author.trim().toLowerCase() === (user.email.split('@')[0] || '').trim().toLowerCase()) ||
        userRole === 'admin'
      )
  );

  const authorName = isOwner
    ? currentDisplayName || metadata?.author || 'ผู้สร้าง'
    : metadata?.author || 'ผู้สร้าง';

  const canClone = metadata?.allowCloning !== false || isOwner;
  const allowCoCreation = metadata?.allowCoCreation !== false;

  // Auto-sync & heal Cloud R2 metadata when owner views their universe
  // Ensures author display name is universally up-to-date across all clients
  useEffect(() => {
    if (!isOwner || !user || !shareId || !metadata || !project) return;

    const needsAuthorSync = authorName && metadata.author !== authorName;
    const needsUserSync =
      user.id &&
      (metadata.userId !== user.id || metadata.userId === 'guest' || metadata.userId === 'anonymous');

    if (needsAuthorSync || needsUserSync) {
      fetch('/api/universe/sync-author', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shareId,
          userId: user.id,
          author: authorName,
          projectTitle: projectName,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setMetadata((prev: any) => ({
              ...prev,
              author: authorName,
              userId: user.id,
            }));
          }
        })
        .catch(() => {});
    }
  }, [isOwner, user, shareId, metadata?.author, metadata?.userId, authorName, projectName, project]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6">
        <div className="p-4 rounded-2xl bg-card border border-border shadow-xl flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-xs font-semibold text-muted-foreground">
            กำลังโหลดข้อมูลจักรวาลและ Lorebook
          </p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md p-8 rounded-3xl bg-card border border-border shadow-xl space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center justify-center mx-auto text-xl">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-foreground">ไม่พบข้อมูลจักรวาล</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {error || 'ลิงก์นี้อาจหมดอายุ ถูกเจ้าของยกเลิกการแชร์ หรือ URL ไม่ถูกต้อง'}
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
            {!user && (
              <button
                type="button"
                onClick={() => openAuthModal('signin')}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-foreground text-background hover:bg-foreground/90 text-xs font-bold shadow-xs transition-all cursor-pointer"
              >
                <span>เข้าสู่ระบบ / สมัครสมาชิก</span>
              </button>
            )}
            <Link
              href="/multi"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-muted hover:bg-muted/80 text-foreground text-xs font-bold shadow-xs transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>ไปยัง Studio สร้างจักรวาล</span>
            </Link>
          </div>
        </div>
        <AuthModal />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-card border border-purple-500/40 shadow-2xl text-xs font-bold text-foreground flex items-center gap-2.5 animate-in slide-in-from-bottom-4 duration-200">
          <Sparkles className="w-4 h-4 text-purple-500 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Navbar */}
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-md px-3 sm:px-8 py-2.5 sm:py-3.5 flex items-center justify-between gap-2">
        {/* Left: Studio Link + Title */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          <Link
            href="/multi"
            className="p-1.5 sm:p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center gap-1.5 text-xs font-semibold shrink-0"
            title="กลับไปที่ Studio"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden md:inline">Studio</span>
          </Link>
          <div className="h-4 w-px bg-border hidden sm:block shrink-0" />
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-500 border border-purple-500/20 shrink-0 hidden xs:flex">
              <Globe className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xs sm:text-sm font-bold text-foreground truncate max-w-[130px] xs:max-w-[180px] sm:max-w-xs md:max-w-md">
                {projectName}
              </h1>
              <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] text-muted-foreground truncate">
                <span className="truncate max-w-[90px] sm:max-w-none">สร้างโดย {authorName}</span>
                <span>•</span>
                {isOwner ? (
                  <span className="text-amber-500 font-bold flex items-center gap-0.5 sm:gap-1 shrink-0 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                    <Crown className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-500" />
                    <span>คุณคือเจ้าของจักรวาลนี้ (Owner)</span>
                  </span>
                ) : (
                  <span className="text-purple-500 font-semibold flex items-center gap-0.5 sm:gap-1 shrink-0">
                    <Lock className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                    <span>Unlisted</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleCopyLink}
            className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-muted hover:bg-muted/80 text-foreground text-xs font-semibold border border-border flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
            title="คัดลอกลิงก์แชร์"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden md:inline">{copied ? 'คัดลอกแล้ว' : 'คัดลอกลิงก์'}</span>
          </button>

          {isOwner ? (
            <button
              type="button"
              onClick={() => {
                try {
                  localStorage.setItem(RUBII_MULTI_DRAFT_KEY, JSON.stringify(project));
                  router.push('/multi');
                } catch {
                  router.push('/multi');
                }
              }}
              className="px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
              title="เปิดแก้ไขจักรวาลนี้ใน Studio ของคุณ"
            >
              <Edit3 className="w-3.5 h-3.5 text-amber-300" />
              <span className="hidden sm:inline">เปิดแก้ไขใน Studio</span>
              <span className="sm:hidden text-[11px]">แก้ไข Studio</span>
            </button>
          ) : canClone ? (
            <button
              type="button"
              onClick={handleCloneToMyStudio}
              disabled={isCloning}
              className="px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0"
              title="คัดลอกเข้าคลัง (Clone)"
            >
              {isCloning ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              <span className="hidden sm:inline">คัดลอกเข้าคลัง (Clone)</span>
              <span className="sm:hidden text-[11px]">Clone</span>
            </button>
          ) : (
            <div
              className="px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-muted/60 border border-border text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5 shrink-0"
              title="เจ้าของสงวนสิทธิ์ต้นฉบับ ปิดการคัดลอกเข้าสตูดิโอส่วนตัว"
            >
              <Lock className="w-3 h-3 text-amber-500" />
              <span className="hidden sm:inline">สงวนสิทธิ์ต้นฉบับ</span>
            </div>
          )}

          <ThemeToggle />
          <UserMenu />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-3.5 sm:p-8 space-y-6 sm:space-y-8 pb-16 sm:pb-8">
        {/* Banner Hero */}
        <div className="p-4 sm:p-8 rounded-3xl bg-gradient-to-br from-purple-500/10 via-indigo-500/5 to-transparent border border-purple-500/20 shadow-sm space-y-4">
          {/* Main Title at the very top */}
          <div className="space-y-1.5">
            <h1 className="text-xl sm:text-3xl font-extrabold text-foreground break-words leading-tight tracking-tight">
              {projectName}
            </h1>
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span>
                สร้างโดย <strong className="text-foreground font-semibold">{authorName}</strong>
              </span>
              <span>•</span>
              {isOwner ? (
                <span className="text-amber-500 font-bold inline-flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                  <Crown className="w-3.5 h-3.5 text-amber-500" />
                  <span>คุณคือเจ้าของจักรวาลนี้ (Owner)</span>
                </span>
              ) : (
                <span className="text-purple-500 font-semibold inline-flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  <span>Unlisted</span>
                </span>
              )}
            </div>
          </div>

          {/* Clean Structured Metadata Grid (No overlapping/distorted capsule pills) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-1">
            {worldSetting?.genreTone && (
              <div className="p-3.5 rounded-xl bg-purple-500/5 dark:bg-purple-500/10 border border-purple-500/20 text-xs space-y-1">
                <div className="font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 shrink-0" />
                  <span>แนวเรื่อง (Genre & Tone)</span>
                </div>
                <p className="text-foreground leading-relaxed break-words whitespace-pre-line">
                  {worldSetting.genreTone}
                </p>
              </div>
            )}
            {worldSetting?.eraTimePeriod && (
              <div className="p-3.5 rounded-xl bg-card border border-border text-xs space-y-1">
                <div className="font-bold text-foreground flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>ยุคสมัย (Era)</span>
                </div>
                <p className="text-foreground leading-relaxed break-words whitespace-pre-line">
                  {worldSetting.eraTimePeriod}
                </p>
              </div>
            )}
            {worldSetting?.mainLocation && (
              <div className="p-3.5 rounded-xl bg-card border border-border text-xs space-y-1">
                <div className="font-bold text-foreground flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  <span>ฉากหลัก (Main Location)</span>
                </div>
                <p className="text-foreground leading-relaxed break-words whitespace-pre-line">
                  {worldSetting.mainLocation}
                </p>
              </div>
            )}
          </div>

          {worldSetting?.atmosphereTheme && (
            <p className="text-xs sm:text-sm text-foreground leading-relaxed break-words pt-1">
              {worldSetting.atmosphereTheme}
            </p>
          )}

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 pt-2">
            <div className="p-3 rounded-2xl bg-card border border-border/80 text-center">
              <div className="text-base sm:text-lg font-bold text-foreground">{mainCharacters?.length || 0}</div>
              <div className="text-[10px] sm:text-[11px] text-muted-foreground">ตัวละครหลัก (Main)</div>
            </div>
            <div className="p-3 rounded-2xl bg-card border border-border/80 text-center">
              <div className="text-base sm:text-lg font-bold text-foreground">{supportingCharacters?.length || 0}</div>
              <div className="text-[10px] sm:text-[11px] text-muted-foreground">ตัวละครเสริม (Sub)</div>
            </div>
            <div className="p-3 rounded-2xl bg-card border border-border/80 text-center">
              <div className="text-base sm:text-lg font-bold text-foreground">{lore?.timelineEvents?.length || 0}</div>
              <div className="text-[10px] sm:text-[11px] text-muted-foreground">เหตุการณ์ใน Timeline</div>
            </div>
            <div className="p-3 rounded-2xl bg-card border border-border/80 text-center">
              <div className="text-base sm:text-lg font-bold text-foreground">{routes?.length || 0}</div>
              <div className="text-[10px] sm:text-[11px] text-muted-foreground">เส้นทาง (Routes)</div>
            </div>
          </div>
        </div>

        {/* Section 1: World Rules & Factions */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 border-b border-border pb-2.5">
            <Globe className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <h3 className="text-base font-bold text-foreground">1. World Setting & กฎเกณฑ์โลก</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-card border border-border shadow-2xs space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                กฎเกณฑ์ของโลก / ระบบพลัง
              </h4>
              <p className="text-xs text-foreground font-normal dark:text-slate-200 leading-relaxed whitespace-pre-line">
                {worldSetting?.worldRulesOrMagicSystem || 'ไม่ได้ระบุกฎเกณฑ์'}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-card border border-border shadow-2xs space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                ฝ่าย / องค์กร / กลุ่มอำนาจ
              </h4>
              <p className="text-xs text-foreground font-normal dark:text-slate-200 leading-relaxed whitespace-pre-line">
                {worldSetting?.factionsOrOrganizations || 'ไม่ได้ระบุฝ่าย'}
              </p>
            </div>
          </div>
        </section>

        {/* Section 2: Lore & Timeline Events */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 border-b border-border pb-2.5">
            <BookOpen className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <h3 className="text-base font-bold text-foreground">2. Lorebook & ไทม์ไลน์ประวัติศาสตร์</h3>
          </div>

          <div className="p-5 rounded-2xl bg-card border border-border shadow-2xs space-y-4">
            {lore?.worldBackstory && (
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  ภูมิหลังโลก (Backstory)
                </h4>
                <p className="text-xs text-foreground font-normal dark:text-slate-200 leading-relaxed whitespace-pre-line">
                  {lore.worldBackstory}
                </p>
              </div>
            )}

            {lore?.coreConflict && (
              <div className="space-y-1.5 pt-2 border-t border-border/50">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  ปมความขัดแย้งหลัก (Core Conflict)
                </h4>
                <p className="text-xs text-foreground font-normal dark:text-slate-200 leading-relaxed whitespace-pre-line">
                  {lore.coreConflict}
                </p>
              </div>
            )}

            {/* Clean Timeline Events List (Title & Description only) */}
            {lore?.timelineEvents && lore.timelineEvents.length > 0 && (
              <div className="space-y-3 pt-3 border-t border-border/50">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  <span>ลำดับเหตุการณ์สำคัญในประวัติศาสตร์ (Timeline Events)</span>
                </h4>
                <div className="space-y-2.5">
                  {lore.timelineEvents.map((evt, idx) => (
                    <div
                      key={evt.id || idx}
                      className="p-4 rounded-xl bg-muted/40 border border-border/70 space-y-1.5"
                    >
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <h5 className="text-xs sm:text-sm font-bold text-foreground">
                          {evt.eventTitle || `เหตุการณ์ที่ ${idx + 1}`}
                        </h5>
                        {evt.timeLabel && (
                          <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 shrink-0">
                            {evt.timeLabel}
                          </span>
                        )}
                      </div>
                      {evt.description && (
                        <p className="text-xs text-foreground leading-relaxed whitespace-pre-line">
                          {evt.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Section 3: Main Characters & Relations */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-2.5 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-rose-600 dark:text-rose-400" />
              <h3 className="text-base font-bold text-foreground">3. ตัวละครหลักในจักรวาล (Main Cast)</h3>
            </div>

            {allowCoCreation && (
              <button
                type="button"
                onClick={() => {
                  if (!user) {
                    openAuthModal('signin');
                  } else {
                    setIsProposeModalOpen(true);
                  }
                }}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                title="ยื่นตัวละครเข้าร่วมจักรวาลนี้โดยใช้โควต้า AI ของตนเอง"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ ยื่นตัวละครเข้าร่วม (Co-Create)</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {mainCharacters && mainCharacters.length > 0 ? (
              mainCharacters.map((char, idx) => {
                const flagInfo = char.flagType ? CHARACTER_FLAGS[char.flagType] : null;
                return (
                  <div
                    key={char.id || idx}
                    className="p-5 rounded-2xl bg-card border border-border shadow-2xs space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                            {char.name || `ตัวละครที่ ${idx + 1}`}
                            {char.aliasOrTitle && (
                              <span className="text-xs font-normal text-muted-foreground">
                                ({char.aliasOrTitle})
                              </span>
                            )}
                          </h4>
                          <p className="text-xs font-medium text-purple-600 dark:text-purple-400">
                            {char.storyRole || 'บทบาทในเรื่อง'}
                          </p>
                        </div>
                        {flagInfo && (
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${flagInfo.badgeBg}`}>
                            {flagInfo.emoji} {flagInfo.label}
                          </span>
                        )}
                      </div>

                      {char.corePersonality && (
                        <div className="text-xs text-foreground/85 dark:text-muted-foreground leading-relaxed line-clamp-3">
                          <span className="font-semibold text-foreground">นิสัย: </span>
                          {char.corePersonality}
                        </div>
                      )}

                      {char.relationsWithOtherCast && (
                        <div className="p-2.5 rounded-xl bg-rose-500/5 dark:bg-rose-500/10 border border-rose-500/20 text-[11px] text-foreground/85 dark:text-muted-foreground">
                          <span className="font-semibold text-rose-600 dark:text-rose-400">สายสัมพันธ์กับตัวละครอื่น: </span>
                          {char.relationsWithOtherCast}
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-border/60 text-[10px] text-muted-foreground flex items-center justify-between">
                      <span>เพศ: {char.gender || '-'} | อายุ: {char.age || '-'}</span>
                      {char.mbti && <span className="font-mono font-bold text-foreground">{char.mbti}</span>}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-2 p-8 text-center rounded-2xl border border-dashed border-border text-xs text-muted-foreground">
                ยังไม่มีการบันทึกตัวละครหลักในจักรวาลนี้
              </div>
            )}
          </div>
        </section>

        {/* Section 4: Story Routes */}
        {routes && routes.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center gap-2 border-b border-border pb-2.5">
              <GitFork className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h3 className="text-base font-bold text-foreground">4. เส้นทางเนื้อเรื่อง (Routes & Branches)</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {routes.map((route, idx) => (
                <div key={route.id || idx} className="p-4 rounded-2xl bg-card border border-border shadow-2xs space-y-2">
                  <h4 className="text-xs font-bold text-blue-600 dark:text-blue-400">
                    {route.routeName || `เส้นทางที่ ${idx + 1}`}
                  </h4>
                  <p className="text-xs text-foreground/85 dark:text-muted-foreground leading-relaxed">
                    {route.summary || 'ไม่มีคำอธิบาย'}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Discussion & Cute Reactions Section */}
        <UniverseDiscussionSection shareId={shareId} projectName={projectName} />

        {/* Bottom CTA to Clone or Co-Create or Owner Actions */}
        <div className="p-6 rounded-3xl bg-muted/40 border border-border text-center space-y-3">
          <h4 className="text-sm font-bold text-foreground">
            {isOwner
              ? '👑 คุณคือเจ้าของจักรวาลนี้ (Owner)'
              : canClone
              ? 'ชอบจักรวาลนี้และอยากนำไปต่อยอดไหม?'
              : 'ร่วมเป็นส่วนหนึ่งในการขยายจักรวาลนี้'}
          </h4>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            {isOwner
              ? 'จักรวาลนี้ถูกบันทึกและซิงค์อยู่ใน Cloud Library ของคุณเรียบร้อยแล้ว คุณสามารถกลับไปแก้ไขใน Studio หรือส่งลิงก์นี้ให้เพื่อนๆ ได้ตลอดเวลา'
              : canClone
              ? 'คุณสามารถกดปุ่มด้านล่างเพื่อคัดลอกข้อมูลทั้งหมดเข้า Studio ส่วนตัวของคุณเพื่อแก้ไขและแปลงเป็น Prompt สำหรับเล่นได้ทันที'
              : 'จักรวาลนี้เปิดให้ร่วมสร้างสรรค์ คุณสามารถยื่นตัวละครของคุณเข้าร่วมเพื่อขยายเรื่องราวไปพร้อมกับผู้สร้างคนอื่นๆ'}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
            {isOwner ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    try {
                      localStorage.setItem(RUBII_MULTI_DRAFT_KEY, JSON.stringify(project));
                      router.push('/multi');
                    } catch {
                      router.push('/multi');
                    }
                  }}
                  className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-sm transition-all inline-flex items-center gap-2 cursor-pointer"
                >
                  <Edit3 className="w-4 h-4 text-amber-300" />
                  <span>เปิดแก้ไขจักรวาลนี้ใน Studio</span>
                </button>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-5 py-2.5 rounded-xl bg-muted hover:bg-muted/80 text-foreground border border-border text-xs font-bold shadow-xs transition-all inline-flex items-center gap-2 cursor-pointer"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'คัดลอกแล้ว' : 'คัดลอกลิงก์แชร์'}</span>
                </button>
              </>
            ) : (
              <>
                {canClone && (
                  <button
                    type="button"
                    onClick={handleCloneToMyStudio}
                    disabled={isCloning}
                    className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-sm transition-all inline-flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isCloning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                    <span>คัดลอกจักรวาลนี้ไปแต่งต่อใน Studio</span>
                  </button>
                )}
                {allowCoCreation && (
                  <button
                    type="button"
                    onClick={() => {
                      if (!user) {
                        openAuthModal('signin');
                      } else {
                        setIsProposeModalOpen(true);
                      }
                    }}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold shadow-sm transition-all inline-flex items-center gap-2 cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>ยื่นตัวละครเข้าร่วมจักรวาลนี้</span>
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      <UniverseProposeCharacterModal
        isOpen={isProposeModalOpen}
        onClose={() => setIsProposeModalOpen(false)}
        shareId={shareId}
        projectName={projectName}
        onSuccess={handleCharacterProposed}
        onShowToast={showToast}
      />

      <AuthModal />
    </div>
  );
}
