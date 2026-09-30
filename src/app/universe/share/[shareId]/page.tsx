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
} from 'lucide-react';
import type { MultiCharacterProjectDraft } from '@/shared/multiCharTypes';
import { CHARACTER_FLAGS } from '@/shared/types';
import { RUBII_MULTI_DRAFT_KEY, MULTI_CHAR_LIBRARY_KEY } from '@/hooks/useMultiCharacterProject';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export default function UniverseShareViewPage() {
  const params = useParams();
  const router = useRouter();
  const shareId = params?.shareId as string;

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [project, setProject] = useState<MultiCharacterProjectDraft | null>(null);
  const [metadata, setMetadata] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [isCloning, setIsCloning] = useState(false);

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
        } catch {}
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6">
        <div className="p-4 rounded-2xl bg-card border border-border shadow-xl flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-xs font-semibold text-muted-foreground">
            กำลังโหลดข้อมูลจักรวาลและ Lorebook จาก Cloudflare R2...
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
          <div className="pt-2">
            <Link
              href="/multi"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold shadow-sm transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>ไปยัง Studio สร้างจักรวาล</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { worldSetting, lore, mainCharacters, supportingCharacters, routes } = project;
  const projectName = worldSetting?.projectName || project.title || 'จักรวาลและคลังความจำ';

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/multi"
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center gap-1.5 text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">ไปยัง Studio</span>
          </Link>
          <div className="h-4 w-px bg-border hidden sm:block" />
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-500 border border-purple-500/20">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-foreground line-clamp-1">
                {projectName}
              </h1>
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                <span>สร้างโดย {metadata?.author || 'ผู้สร้าง SedChar'}</span>
                <span>•</span>
                <span className="text-purple-500 font-semibold flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Unlisted Share Link
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleCopyLink}
            className="px-3 py-1.5 rounded-xl bg-muted hover:bg-muted/80 text-foreground text-xs font-semibold border border-border flex items-center gap-1.5 transition-all"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copied ? 'คัดลอกแล้ว' : 'คัดลอกลิงก์'}</span>
          </button>

          <button
            type="button"
            onClick={handleCloneToMyStudio}
            disabled={isCloning}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {isCloning ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            <span>คัดลอกเข้าคลังของฉัน (1-Click Clone)</span>
          </button>

          <ThemeToggle />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-8 space-y-8">
        {/* Banner Hero */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-purple-500/10 via-indigo-500/5 to-transparent border border-purple-500/20 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 text-xs font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              {worldSetting?.genreTone || 'แนวเรื่องยังไม่ได้ระบุ'}
            </span>
            {worldSetting?.eraTimePeriod && (
              <span className="px-2.5 py-1 rounded-full bg-muted text-muted-foreground border border-border text-xs font-medium">
                ยุค: {worldSetting.eraTimePeriod}
              </span>
            )}
            {worldSetting?.mainLocation && (
              <span className="px-2.5 py-1 rounded-full bg-muted text-muted-foreground border border-border text-xs font-medium">
                ฉากหลัก: {worldSetting.mainLocation}
              </span>
            )}
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground">
            {projectName}
          </h2>

          {worldSetting?.atmosphereTheme && (
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {worldSetting.atmosphereTheme}
            </p>
          )}

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3 rounded-2xl bg-card border border-border/80 text-center">
              <div className="text-lg font-bold text-foreground">{mainCharacters?.length || 0}</div>
              <div className="text-[11px] text-muted-foreground">ตัวละครหลัก (Main Cast)</div>
            </div>
            <div className="p-3 rounded-2xl bg-card border border-border/80 text-center">
              <div className="text-lg font-bold text-foreground">{supportingCharacters?.length || 0}</div>
              <div className="text-[11px] text-muted-foreground">ตัวละครเสริม (Sub-Cast)</div>
            </div>
            <div className="p-3 rounded-2xl bg-card border border-border/80 text-center">
              <div className="text-lg font-bold text-foreground">{lore?.timelineEvents?.length || 0}</div>
              <div className="text-[11px] text-muted-foreground">เหตุการณ์ใน Lorebook</div>
            </div>
            <div className="p-3 rounded-2xl bg-card border border-border/80 text-center">
              <div className="text-lg font-bold text-foreground">{routes?.length || 0}</div>
              <div className="text-[11px] text-muted-foreground">เส้นทางเนื้อเรื่อง (Routes)</div>
            </div>
          </div>
        </div>

        {/* Section 1: World Rules & Factions */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 border-b border-border pb-2.5">
            <Globe className="w-5 h-5 text-purple-500" />
            <h3 className="text-base font-bold text-foreground">1. World Setting & กฎเกณฑ์โลก</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-card border border-border space-y-2">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider text-purple-500">
                กฎเกณฑ์ของโลก / ระบบพลัง
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">
                {worldSetting?.worldRulesOrMagicSystem || 'ไม่ได้ระบุกฎเกณฑ์'}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-card border border-border space-y-2">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider text-purple-500">
                ฝ่าย / องค์กร / กลุ่มอำนาจ
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">
                {worldSetting?.factionsOrOrganizations || 'ไม่ได้ระบุฝ่าย'}
              </p>
            </div>
          </div>
        </section>

        {/* Section 2: Lore & Timeline */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 border-b border-border pb-2.5">
            <BookOpen className="w-5 h-5 text-amber-500" />
            <h3 className="text-base font-bold text-foreground">2. Lorebook & ไทม์ไลน์ประวัติศาสตร์</h3>
          </div>

          <div className="p-5 rounded-2xl bg-card border border-border space-y-4">
            {lore?.worldBackstory && (
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider text-amber-500">
                  ภูมิหลังโลก (Backstory)
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">
                  {lore.worldBackstory}
                </p>
              </div>
            )}

            {lore?.coreConflict && (
              <div className="space-y-1.5 pt-2 border-t border-border/50">
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider text-amber-500">
                  ปมความขัดแย้งหลัก (Core Conflict)
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">
                  {lore.coreConflict}
                </p>
              </div>
            )}

            {lore?.timelineEvents && lore.timelineEvents.length > 0 && (
              <div className="space-y-3 pt-3 border-t border-border/50">
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider text-amber-500">
                  ไทม์ไลน์ลำดับเหตุการณ์สำคัญ
                </h4>
                <div className="space-y-2.5">
                  {lore.timelineEvents.map((evt, idx) => (
                    <div
                      key={evt.id || idx}
                      className="p-3.5 rounded-xl bg-muted/40 border border-border/60 flex items-start gap-3"
                    >
                      <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[11px] font-bold shrink-0">
                        {evt.timeLabel || 'ไม่ระบุเวลา'}
                      </span>
                      <div className="space-y-1">
                        <div className="text-xs font-bold text-foreground flex items-center gap-2">
                          <span>{evt.eventTitle}</span>
                          {evt.isSecret && (
                            <span className="px-1.5 py-0.2 text-[9px] font-bold rounded bg-rose-500/10 text-rose-500 border border-rose-500/20">
                              ความลับ
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                          {evt.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Section 3: Main Characters & Relations */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 border-b border-border pb-2.5">
            <Users className="w-5 h-5 text-rose-500" />
            <h3 className="text-base font-bold text-foreground">3. ตัวละครหลักในจักรวาล (Main Cast)</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {mainCharacters && mainCharacters.length > 0 ? (
              mainCharacters.map((char, idx) => {
                const flagInfo = char.flagType ? CHARACTER_FLAGS[char.flagType] : null;
                return (
                  <div
                    key={char.id || idx}
                    className="p-5 rounded-2xl bg-card border border-border shadow-sm space-y-3 flex flex-col justify-between"
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
                          <p className="text-xs text-muted-foreground">
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
                        <div className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                          <span className="font-semibold text-foreground">นิสัย: </span>
                          {char.corePersonality}
                        </div>
                      )}

                      {char.relationsWithOtherCast && (
                        <div className="p-2.5 rounded-xl bg-muted/40 border border-border/50 text-[11px] text-muted-foreground">
                          <span className="font-semibold text-rose-500">สายสัมพันธ์กับตัวละครอื่น: </span>
                          {char.relationsWithOtherCast}
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-border/50 text-[10px] text-muted-foreground flex items-center justify-between">
                      <span>เพศ: {char.gender || '-'} | อายุ: {char.age || '-'}</span>
                      {char.mbti && <span className="font-mono">{char.mbti}</span>}
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
              <GitFork className="w-5 h-5 text-blue-500" />
              <h3 className="text-base font-bold text-foreground">4. เส้นทางเนื้อเรื่อง (Routes & Branches)</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {routes.map((route, idx) => (
                <div key={route.id || idx} className="p-4 rounded-2xl bg-card border border-border space-y-2">
                  <h4 className="text-xs font-bold text-foreground text-blue-500">
                    {route.routeName || `เส้นทางที่ ${idx + 1}`}
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {route.summary || 'ไม่มีคำอธิบาย'}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Bottom CTA to Clone */}
        <div className="p-6 rounded-3xl bg-muted/40 border border-border text-center space-y-3">
          <h4 className="text-sm font-bold text-foreground">
            ชอบจักรวาลนี้และอยากนำไปต่อยอดไหม?
          </h4>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            คุณสามารถกดปุ่มด้านล่างเพื่อคัดลอกข้อมูลทั้งหมดเข้า Studio ส่วนตัวของคุณเพื่อแก้ไขและแปลงเป็น Prompt สำหรับเล่นได้ทันที
          </p>
          <button
            type="button"
            onClick={handleCloneToMyStudio}
            disabled={isCloning}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all inline-flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isCloning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            <span>คัดลอกจักรวาลนี้ไปแต่งต่อใน Studio</span>
          </button>
        </div>
      </main>
    </div>
  );
}
