'use client';
import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

export function UserMenu() {
  const {
    user,
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
      <button
        type="button"
        onClick={() => openAuthModal('signin')}
        className="
          flex items-center gap-1.5 px-3 py-1.5 rounded-lg
          bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700
          text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95
        "
      >
        <span>✨</span>
        <span className="hidden sm:inline">เข้าสู่ระบบ / สมัครสมาชิก</span>
        <span className="sm:hidden">เข้าสู่ระบบ</span>
      </button>
    );
  }

  const initial = ((user.email || 'U')[0] ?? 'U').toUpperCase();
  const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture;

  return (
    <div className="relative" ref={menuRef}>
      <div className="flex items-center gap-2">
        {/* Library quick button */}
        <button
          type="button"
          onClick={openLibraryModal}
          title="คลังตัวละคร Cloud Library"
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border bg-card hover:bg-muted text-xs font-semibold text-foreground transition-all cursor-pointer shadow-xs"
        >
          <span>📁</span>
          <span>คลัง ({savedCharacters.length})</span>
        </button>

        {/* User profile button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 p-1 pl-2 pr-1.5 rounded-xl border border-border bg-card hover:border-primary/50 transition-all cursor-pointer shadow-xs"
        >
          {/* Daily Quota Pill */}
          <span className="hidden md:inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20">
            <span>⚡</span>
            <span>AI: {quotaRemaining}/{quotaMax}</span>
          </span>

          {/* Avatar / Initial */}
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-rose-500 to-pink-600 flex items-center justify-center text-white font-bold text-xs overflow-hidden shadow-xs">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              initial
            )}
          </div>
        </button>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 p-2 bg-card border border-border rounded-2xl shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
          {/* User Info Header */}
          <div className="p-2.5 mb-1.5 rounded-xl bg-[#1F1F24] border border-border">
            <div className="text-[11px] uppercase font-bold text-primary tracking-wider mb-0.5 flex items-center justify-between">
              <span>SedChar Member</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-primary/20 text-primary">Active</span>
            </div>
            <div className="text-xs font-bold text-foreground truncate">{user.email}</div>
            <div className="mt-2 pt-2 border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground">
              <span>โควตา AI ประจำวัน:</span>
              <span className="font-bold text-primary">{quotaRemaining} / {quotaMax} ครั้ง</span>
            </div>
          </div>

          {/* Menu Items */}
          <div className="space-y-1 text-xs">
            <button
              type="button"
              onClick={() => { setIsOpen(false); openLibraryModal(); }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-foreground hover:bg-muted transition-all cursor-pointer text-left"
            >
              <span>📁</span>
              <div className="flex-1">
                <div className="font-semibold">คลังตัวละคร Cloud Library</div>
                <div className="text-[10px] text-muted-foreground">เก็บไว้ {savedCharacters.length} ตัวละคร</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => { setIsOpen(false); openAuthModal('reset'); }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-foreground hover:bg-muted transition-all cursor-pointer text-left"
            >
              <span>🔑</span>
              <span>รีเซ็ต / เปลี่ยนรหัสผ่าน</span>
            </button>

            <div className="border-t border-border my-1" />

            <button
              type="button"
              onClick={() => { setIsOpen(false); signOut(); }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-500 hover:bg-rose-500/10 transition-all cursor-pointer text-left font-semibold"
            >
              <span>🚪</span>
              <span>ออกจากระบบ</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
