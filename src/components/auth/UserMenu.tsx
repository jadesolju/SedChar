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
} from 'lucide-react';
import Link from 'next/link';

interface UserMenuProps {
  onOpenUpgradeModal?: () => void;
  showLibraryButton?: boolean;
  onOpenCustomLibrary?: () => void;
  customLibraryLabel?: string;
  customLibraryCount?: number;
}

export function UserMenu({
  onOpenUpgradeModal,
  showLibraryButton = true,
  onOpenCustomLibrary,
  customLibraryLabel,
  customLibraryCount,
}: UserMenuProps) {
  const {
    user,
    userRole,
    isLoading,
    quotaRemaining,
    quotaMax,
    openAuthModal,
    openLibraryModal,
    signOut,
    savedCharacters,
  } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (isLoading) {
    return <div className="w-8 h-8 rounded-lg bg-muted animate-pulse" />;
  }

  if (!user) {
    return (
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => openAuthModal('signin')}
          className="
            flex items-center gap-1.5 px-3 py-1.5 rounded-lg
            bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700
            text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95
          "
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">เข้าสู่ระบบ / สมัครสมาชิก</span>
          <span className="sm:hidden">เข้าสู่ระบบ</span>
        </button>
      </div>
    );
  }

  const initial = ((user.email || 'U')[0] ?? 'U').toUpperCase();
  const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture;

  const roleConfig = {
    admin: {
      name: 'Admin',
      badge: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
      icon: <Crown className="w-3.5 h-3.5 text-amber-500" />,
    },
    premium: {
      name: 'Premium',
      badge: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30',
      icon: <Gem className="w-3.5 h-3.5 text-rose-500" />,
    },
    free: {
      name: 'Free',
      badge: 'bg-primary/10 text-primary border-primary/20',
      icon: <UserIcon className="w-3.5 h-3.5 text-primary" />,
    },
  }[userRole] || {
    name: 'Free',
    badge: 'bg-primary/10 text-primary border-primary/20',
    icon: <UserIcon className="w-3.5 h-3.5 text-primary" />,
  };

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
          <span className={`hidden md:inline-flex items-center gap-1.5 text-[11px] font-bold px-2 py-0.5 rounded-md border ${roleConfig.badge}`}>
            {roleConfig.icon}
            <span>{userRole === 'admin' ? 'AI: ∞ ไม่จำกัด' : `AI: ${quotaRemaining}/${quotaMax}`}</span>
          </span>

          {/* Avatar / Initial */}
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-rose-500 to-pink-600 flex items-center justify-center text-white font-bold text-xs overflow-hidden shadow-xs">
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
        <div className="absolute right-0 mt-2 w-64 p-2 bg-card border border-border rounded-2xl shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
          {/* User Info Header */}
          <div className="p-2.5 mb-1.5 rounded-xl bg-muted/50 border border-border">
            <div className="text-[11px] uppercase font-bold tracking-wider mb-0.5 flex items-center justify-between">
              <span className="text-foreground flex items-center gap-1.5">
                {roleConfig.icon}
                <span>{roleConfig.name} Role</span>
              </span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded border font-bold ${roleConfig.badge}`}>
                {userRole.toUpperCase()}
              </span>
            </div>
            <div className="text-xs font-bold text-foreground truncate">{user.email}</div>
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

          {/* Upgrade Promo for Free Tier */}
          {userRole === 'free' && onOpenUpgradeModal && (
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onOpenUpgradeModal();
              }}
              className="w-full flex items-center gap-2.5 p-2 rounded-xl bg-gradient-to-r from-rose-500/10 to-pink-500/10 border border-rose-500/30 hover:border-rose-500/60 transition-all cursor-pointer text-left mb-1.5"
            >
              <Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-bold text-xs flex items-center gap-1.5 text-foreground">
                  <span>อัปเกรด Premium</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-rose-500 text-white font-bold">29.-</span>
                </div>
                <div className="text-[10px] text-muted-foreground truncate">AI 50 ครั้ง/วัน + ชำระด้วยบัตร/PromptPay</div>
              </div>
            </button>
          )}

          {/* Menu Items */}
          <div className="space-y-1 text-xs">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                handleLibraryClick();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-foreground hover:bg-muted transition-all cursor-pointer text-left"
            >
              <FolderOpen className="w-4 h-4 text-primary" />
              <div className="flex-1">
                <div className="font-semibold">
                  {customLibraryLabel ? `คลัง${customLibraryLabel}` : 'คลังตัวละคร Cloud Library'}
                </div>
                <div className="text-[10px] text-muted-foreground">
                  มี {customLibraryCount !== undefined ? customLibraryCount : savedCharacters.length} รายการ
                </div>
              </div>
            </button>

            {/* Secret Control Nexus Link - ONLY FOR ADMIN ROLE */}
            {userRole === 'admin' && (
              <Link
                href="/sys-nexus-mgmt-99"
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-amber-500 hover:bg-amber-500/10 transition-all cursor-pointer text-left font-semibold"
              >
                <ShieldCheck className="w-4 h-4 text-amber-500" />
                <div className="flex-1">
                  <div>Control Nexus Console</div>
                  <div className="text-[10px] text-amber-500/70">จัดการสิทธิ์ & โควต้าผู้ใช้งาน</div>
                </div>
              </Link>
            )}

            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                openAuthModal('reset');
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-foreground hover:bg-muted transition-all cursor-pointer text-left"
            >
              <KeyRound className="w-4 h-4 text-muted-foreground" />
              <span>รีเซ็ต / เปลี่ยนรหัสผ่าน</span>
            </button>

            <div className="border-t border-border my-1" />

            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                signOut();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-500 hover:bg-rose-500/10 transition-all cursor-pointer text-left font-semibold"
            >
              <LogOut className="w-4 h-4 text-rose-500" />
              <span>ออกจากระบบ</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}