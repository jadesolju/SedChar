'use client';
import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  Sparkles,
  Crown,
  LogOut,
  FolderOpen,
  KeyRound,
  ShieldCheck,
  Coins,
  ChevronDown,
  User as UserIcon,
  Gem,
  Coffee,
  BookOpen,
  Settings,
  Globe,
  Palette,
} from 'lucide-react';
import Link from 'next/link';
import { ProfileSettingsModal } from './ProfileSettingsModal';
import { getAvatarTheme } from '@/utils/profileThemes';

interface UserMenuProps {
  onOpenUpgradeModal?: () => void;
  showLibraryButton?: boolean;
  onOpenCustomLibrary?: () => void;
  customLibraryLabel?: string;
  customLibraryCount?: number;
  onOpenPromptLibrary?: () => void;
}

export function UserMenu({
  onOpenUpgradeModal,
  showLibraryButton = false,
  onOpenCustomLibrary,
  customLibraryLabel,
  customLibraryCount,
  onOpenPromptLibrary,
}: UserMenuProps) {
  const {
    user,
    userRole,
    quotaRemaining,
    quotaMax,
    signOut,
    openAuthModal,
    openLibraryModal,
    savedCharacters,
    isProfileModalOpen,
    openProfileModal,
    closeProfileModal,
  } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [multiCount, setMultiCount] = useState<number>(0);
  const menuRef = useRef<HTMLDivElement>(null);

  // Sync multi-char projects count dynamically
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const updateMultiCount = () => {
      try {
        const raw = localStorage.getItem('sedchar_multi_projects_library_v1');
        if (raw) {
          const list = JSON.parse(raw);
          if (Array.isArray(list)) {
            setMultiCount(list.length);
          }
        }
      } catch {}
    };
    updateMultiCount();
    window.addEventListener('storage', updateMultiCount);
    return () => window.removeEventListener('storage', updateMultiCount);
  }, []);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) {
    return (
      <div className="flex items-center gap-1.5 sm:gap-2">
        <button
          type="button"
          onClick={() => openAuthModal('signin')}
          className="px-2.5 py-1.5 rounded-lg border border-border bg-card hover:bg-muted text-xs font-semibold text-foreground transition-all cursor-pointer shadow-xs"
        >
          เข้าสู่ระบบ
        </button>
        <button
          type="button"
          onClick={() => openAuthModal('signup')}
          className="px-2.5 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold transition-all shadow-xs cursor-pointer"
        >
          สมัครสมาชิก
        </button>
      </div>
    );
  }

  const initial = user.email ? user.email.charAt(0).toUpperCase() : 'U';
  const avatarUrl = user.user_metadata?.avatar_url;

  const fallbackRoleInfo = {
    name: 'Free',
    badge: 'bg-primary/10 text-primary border-primary/20',
    icon: <UserIcon className="w-3.5 h-3.5 text-primary" />,
  };

  const roleConfig: Record<string, { name: string; badge: string; icon: React.ReactNode }> = {
    admin: {
      name: 'Admin',
      badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
      icon: <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />,
    },
    premium_plus: {
      name: 'Premium Plus',
      badge: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30',
      icon: <Gem className="w-3.5 h-3.5 text-purple-500" />,
    },
    premium: {
      name: 'Universe Pro',
      badge: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30',
      icon: <Crown className="w-3.5 h-3.5 text-purple-500" />,
    },
    supporter: {
      name: 'Supporter (29.-)',
      badge: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30',
      icon: <Coffee className="w-3.5 h-3.5 text-rose-500" />,
    },
    free: fallbackRoleInfo,
  };

  const currentRoleInfo = (roleConfig[userRole] || fallbackRoleInfo)!;

  const handleLibraryClick = () => {
    if (onOpenCustomLibrary) {
      onOpenCustomLibrary();
    } else {
      openLibraryModal();
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <div className="flex items-center gap-2">
        {/* Quick Library button (shown only on pages where desired, e.g. Single-Char) */}
        {showLibraryButton && (
          <button
            type="button"
            onClick={handleLibraryClick}
            title={customLibraryLabel || 'คลังตัวละคร Cloud Library'}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border bg-card hover:bg-muted text-xs font-semibold text-foreground transition-all cursor-pointer shadow-xs"
          >
            <FolderOpen className="w-3.5 h-3.5 text-primary" />
            <span>
              {customLibraryLabel
                ? `${customLibraryLabel} (${customLibraryCount ?? 0})`
                : `คลัง (${savedCharacters.length})`}
            </span>
          </button>
        )}

        {/* User profile button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 p-1 pl-2 pr-1.5 rounded-xl border border-border bg-card hover:border-primary/50 transition-all cursor-pointer shadow-xs"
        >
          {/* Daily Quota Pill */}
          <span className={`hidden md:inline-flex items-center gap-1.5 text-[11px] font-bold px-2 py-0.5 rounded-md border ${currentRoleInfo.badge}`}>
            {currentRoleInfo.icon}
            <span>{userRole === 'admin' ? 'AI: ∞ ไม่จำกัด' : `AI: ${quotaRemaining}/${quotaMax}`}</span>
          </span>

          {/* Avatar / Initial */}
          <div
            className="w-7 h-7 rounded-lg border border-white/20 flex items-center justify-center text-white font-bold text-xs overflow-hidden shadow-xs"
            style={{
              background: getAvatarTheme(
                user.user_metadata?.avatar_bg_theme,
                user.user_metadata?.custom_avatar_bg
              ).gradient,
            }}
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              initial
            )}
          </div>
          <ChevronDown className="w-3 h-3 text-muted-foreground" />
        </button>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 p-2 bg-card border border-border rounded-2xl shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
          {/* User Info Header */}
          <div className="p-2.5 mb-2 rounded-xl bg-muted/50 border border-border">
            <div className="text-[11px] uppercase font-bold tracking-wider mb-0.5 flex items-center justify-between">
              <span className="text-foreground flex items-center gap-1.5">
                {currentRoleInfo.icon}
                <span>{currentRoleInfo.name} Role</span>
              </span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded border font-bold ${currentRoleInfo.badge}`}>
                {userRole.toUpperCase()}
              </span>
            </div>
            <div className="text-xs font-bold text-foreground truncate">
              {user.user_metadata?.display_name || user.user_metadata?.full_name || user.email}
            </div>
            {user.user_metadata?.display_name && (
              <div className="text-[10px] text-muted-foreground font-mono truncate">{user.email}</div>
            )}
            <div className="mt-2 pt-2 border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <Coins className="w-3 h-3 text-primary" />
                โควต้า AI วันนี้:
              </span>
              <span className="font-bold text-primary">
                {userRole === 'admin' ? '∞ ไม่จำกัด' : `${quotaRemaining} / ${quotaMax} ครั้ง`}
              </span>
            </div>
          </div>

          {/* Upgrade / Donate Promo for Free Tier */}
          {userRole === 'free' && onOpenUpgradeModal && (
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onOpenUpgradeModal();
              }}
              className="w-full flex items-center gap-2.5 p-2 rounded-xl bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-pink-500/10 border border-amber-500/30 hover:border-amber-500/60 transition-all cursor-pointer text-left mb-2"
            >
              <Coffee className="w-4 h-4 text-amber-500 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-bold text-xs flex items-center gap-1.5 text-foreground">
                  <span>เลี้ยงกาแฟ / ปลดล็อค Premium</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500 text-zinc-950 font-bold">29.-</span>
                </div>
                <div className="text-[10px] text-muted-foreground truncate">AI 50 ครั้ง/วัน + Multi-Char 10 ตัว + PromptPay</div>
              </div>
            </button>
          )}

          {/* SECTION 1: Studios & Libraries */}
          <div className="space-y-0.5">
            <div className="px-2.5 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
              <span>คลัง &amp; สตูดิโอสร้างสรรค์</span>
              <span className="text-[9px] font-mono text-muted-foreground/70">STUDIOS</span>
            </div>

            {/* 1.1 Single Character Library */}
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                openLibraryModal();
              }}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-foreground hover:bg-muted transition-all cursor-pointer text-left group"
            >
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <UserIcon className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-xs text-foreground flex items-center justify-between">
                  <span>คลังตัวละครเดี่ยว (Single-Char)</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
                    {savedCharacters?.length || 0} ตัว
                  </span>
                </div>
                <div className="text-[10px] text-muted-foreground truncate">
                  บอทตัวละครเดี่ยว &bull; Prompt Studio
                </div>
              </div>
            </button>

            {/* 1.2 Multi-Char & Universes */}
            {onOpenCustomLibrary ? (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onOpenCustomLibrary();
                }}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-foreground hover:bg-muted transition-all cursor-pointer text-left group"
              >
                <div className="w-7 h-7 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Globe className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-xs text-foreground flex items-center justify-between">
                    <span>คลัง Multi-Char &amp; จักรวาล</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold">
                      {customLibraryCount !== undefined ? customLibraryCount : multiCount} เรื่อง
                    </span>
                  </div>
                  <div className="text-[10px] text-muted-foreground truncate">
                    Lorebook &bull; หลายตัวละคร &bull; ฉาก &amp; เส้นทาง
                  </div>
                </div>
              </button>
            ) : (
              <Link
                href="/multi"
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-foreground hover:bg-muted transition-all cursor-pointer text-left group"
              >
                <div className="w-7 h-7 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Globe className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-xs text-foreground flex items-center justify-between">
                    <span>คลัง Multi-Char &amp; จักรวาล</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold">
                      {multiCount} เรื่อง
                    </span>
                  </div>
                  <div className="text-[10px] text-muted-foreground truncate">
                    Multi Studio &bull; โครงเรื่อง &amp; ตัวละครรวม
                  </div>
                </div>
              </Link>
            )}

            {/* 1.3 Prompt Library */}
            {onOpenPromptLibrary ? (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onOpenPromptLibrary();
                }}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-foreground hover:bg-muted transition-all cursor-pointer text-left group"
              >
                <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <BookOpen className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-xs text-foreground flex items-center justify-between">
                    <span>คลังคำสั่ง &amp; กฎ (Prompt Library)</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-500/20">
                      ใหม่
                    </span>
                  </div>
                  <div className="text-[10px] text-muted-foreground truncate">
                    10 หมวดหมู่ + สร้างคำสั่งส่วนตัว
                  </div>
                </div>
              </button>
            ) : (
              <Link
                href="/prompts"
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-foreground hover:bg-muted transition-all cursor-pointer text-left group"
              >
                <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <BookOpen className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-xs text-foreground flex items-center justify-between">
                    <span>คลังคำสั่ง &amp; กฎ (Prompt Library)</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-500/20">
                      ใหม่
                    </span>
                  </div>
                  <div className="text-[10px] text-muted-foreground truncate">
                    10 หมวดหมู่ + สร้างคำสั่งส่วนตัว
                  </div>
                </div>
              </Link>
            )}
          </div>

          {/* Divider */}
          <div className="h-px bg-border/70 my-2" />

          {/* SECTION 2: Account & Settings */}
          <div className="space-y-0.5">
            <div className="px-2.5 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
              <span>บัญชี &amp; การตั้งค่า</span>
              <span className="text-[9px] font-mono text-muted-foreground/70">ACCOUNT</span>
            </div>

            {/* 2.1 Profile Hub */}
            <Link
              href="/profile"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-foreground hover:bg-muted transition-all cursor-pointer text-left group"
            >
              <div className="w-7 h-7 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Palette className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-xs text-foreground">ศูนย์กลางโปรไฟล์ &amp; ธีม (Profile Hub)</div>
                <div className="text-[10px] text-muted-foreground truncate">
                  ปรับแต่ง Avatar, แบนเนอร์, จักรวาล &amp; ห้องแชร์
                </div>
              </div>
            </Link>

            {/* 2.2 Admin Nexus */}
            {userRole === 'admin' && (
              <Link
                href="/sys-nexus-mgmt-99"
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 transition-all cursor-pointer text-left group font-semibold"
              >
                <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs">Control Nexus Console</div>
                  <div className="text-[10px] text-amber-600/70 dark:text-amber-400/70">จัดการสิทธิ์ &amp; โควต้าผู้ใช้งาน</div>
                </div>
              </Link>
            )}

            {/* 2.3 Password Reset */}
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                openAuthModal('reset');
              }}
              className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-foreground hover:bg-muted transition-all cursor-pointer text-left text-xs"
            >
              <KeyRound className="w-4 h-4 text-muted-foreground shrink-0 ml-1.5" />
              <span>รีเซ็ต / เปลี่ยนรหัสผ่าน</span>
            </button>

            {/* 2.4 Sign Out */}
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                signOut();
              }}
              className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-rose-500 hover:bg-rose-500/10 transition-all cursor-pointer text-left text-xs font-semibold"
            >
              <LogOut className="w-4 h-4 text-rose-500 shrink-0 ml-1.5" />
              <span>ออกจากระบบ</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
