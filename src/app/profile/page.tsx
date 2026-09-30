'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User as UserIcon,
  Camera,
  Sparkles,
  Check,
  Loader2,
  ArrowLeft,
  ShieldCheck,
  Coins,
  Crown,
  Coffee,
  Gem,
  Palette,
  Eye,
  Layers,
  Sparkle,
} from 'lucide-react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { UserMenu } from '@/components/auth/UserMenu';
import { AuthModal } from '@/components/auth/AuthModal';
import { compressImageToAvatar } from '@/utils/imageCompressor';
import {
  AVATAR_BG_THEMES,
  BANNER_THEMES,
  getAvatarTheme,
  getBannerTheme,
  getAvatarBgClass,
} from '@/utils/profileThemes';

const AVATAR_PRESETS = [
  { id: 'sakura', label: 'ซากุระ', emoji: '🌸', bg: 'bg-pink-500/20 text-pink-500 border-pink-500/30' },
  { id: 'cat', label: 'เหมียว', emoji: '🐱', bg: 'bg-amber-500/20 text-amber-500 border-amber-500/30' },
  { id: 'fox', label: 'จิ้งจอก', emoji: '🦊', bg: 'bg-orange-500/20 text-orange-500 border-orange-500/30' },
  { id: 'crown', label: 'มงกุฎ', emoji: '👑', bg: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30' },
  { id: 'wand', label: 'เวทมนตร์', emoji: '🪄', bg: 'bg-purple-500/20 text-purple-500 border-purple-500/30' },
  { id: 'coffee', label: 'กาแฟ', emoji: '☕', bg: 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30' },
  { id: 'gaming', label: 'เกมมิ่ง', emoji: '🎮', bg: 'bg-indigo-500/20 text-indigo-500 border-indigo-500/30' },
  { id: 'leaf', label: 'ธรรมชาติ', emoji: '🌿', bg: 'bg-green-500/20 text-green-500 border-green-500/30' },
  { id: 'gem', label: 'คริสตัล', emoji: '💎', bg: 'bg-cyan-500/20 text-cyan-500 border-cyan-500/30' },
  { id: 'moon', label: 'พระจันทร์', emoji: '🌙', bg: 'bg-violet-500/20 text-violet-500 border-violet-500/30' },
  { id: 'dragon', label: 'มังกร', emoji: '🐉', bg: 'bg-rose-500/20 text-rose-500 border-rose-500/30' },
  { id: 'berry', label: 'เบอร์รี่', emoji: '🍓', bg: 'bg-red-500/20 text-red-500 border-red-500/30' },
];

export default function ProfilePage() {
  return (
    <AuthProvider>
      <ProfileContent />
    </AuthProvider>
  );
}

function ProfileContent() {
  const router = useRouter();
  const { user, userRole, quotaRemaining, quotaMax, updateUserProfile, openAuthModal } = useAuth();

  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [avatarBgTheme, setAvatarBgTheme] = useState('nebula');
  const [bannerTheme, setBannerTheme] = useState('cosmic');
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      const meta = user.user_metadata || {};
      const currentName = meta.display_name || meta.full_name || (user.email ? user.email.split('@')[0] : '');
      setDisplayName(currentName);
      setBio(meta.bio || '');
      setAvatarUrl(meta.avatar_url || '');
      setSelectedPreset(meta.avatar_preset || null);
      setAvatarBgTheme(meta.avatar_bg_theme || 'nebula');
      setBannerTheme(meta.banner_theme || 'cosmic');
    }
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md p-8 rounded-3xl bg-card border border-border shadow-xl space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-500 border border-purple-500/20 flex items-center justify-center mx-auto text-xl">
            <UserIcon className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-foreground">กรุณาเข้าสู่ระบบ</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            คุณจำเป็นต้องเข้าสู่ระบบเพื่อจัดการตั้งค่าโปรไฟล์และปรับแต่งธีมของคุณ
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => openAuthModal('signin')}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-foreground text-background hover:bg-foreground/90 text-xs font-bold shadow-xs transition-all cursor-pointer"
            >
              เข้าสู่ระบบ / สมัครสมาชิก
            </button>
            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-muted hover:bg-muted/80 text-foreground text-xs font-bold shadow-xs transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>กลับหน้าหลัก</span>
            </Link>
          </div>
        </div>
        <AuthModal />
      </div>
    );
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // 1. Auto compress and square crop for crisp avatar (~20KB)
      const compressedDataUrl = await compressImageToAvatar(file, 320, 0.85);
      
      // 2. Upload to Cloudflare R2 CDN immediately (returns ~60 char URL)
      const res = await fetch('/api/avatar/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: compressedDataUrl, userId: user?.id }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.url) {
          setAvatarUrl(data.url);
        } else {
          setAvatarUrl(compressedDataUrl);
        }
      } else {
        setAvatarUrl(compressedDataUrl);
      }
      setSelectedPreset(null);
    } catch (err: any) {
      alert(err.message || 'เกิดข้อผิดพลาดในการประมวลผลรูปภาพ');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleChoosePreset = async (preset: typeof AVATAR_PRESETS[0]) => {
    setSelectedPreset(preset.id);
    const svgString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="#18181b"/><text x="50%" y="54%" dominant-baseline="central" text-anchor="middle" font-size="52">${preset.emoji}</text></svg>`;
    const dataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svgString)}`;
    setAvatarUrl(dataUrl);

    try {
      const res = await fetch('/api/avatar/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: dataUrl, userId: user?.id }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.url) {
          setAvatarUrl(data.url);
        }
      }
    } catch {}
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;

    const trimmedName = displayName.trim();
    if (!trimmedName) {
      alert('กรุณากรอกชื่อที่ต้องการแสดง');
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await updateUserProfile({
        displayName: trimmedName,
        avatarUrl: avatarUrl || undefined,
        bio: bio.trim(),
        avatarBgTheme,
        bannerTheme,
      });

      if (error) {
        alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล: ' + (error.message || 'กรุณาลองใหม่อีกครั้ง'));
      } else {
        setSaveSuccess(true);
        setTimeout(() => {
          setSaveSuccess(false);
        }, 2000);
      }
    } catch (err: any) {
      alert('เกิดข้อผิดพลาดในการบันทึก: ' + String(err));
    } finally {
      setIsSaving(false);
    }
  };

  const initial = displayName ? displayName.charAt(0).toUpperCase() : (user.email ? user.email.charAt(0).toUpperCase() : 'U');
  const activeAvatarTheme = getAvatarTheme(avatarBgTheme);
  const activeBannerTheme = getBannerTheme(bannerTheme);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-md px-4 sm:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/multi"
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center gap-1.5 text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Studio</span>
          </Link>
          <div className="h-4 w-px bg-border" />
          <h1 className="text-sm sm:text-base font-bold text-foreground">
            จัดการโปรไฟล์ & ปรับแต่งธีม
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <UserMenu />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-3xl w-full mx-auto p-4 sm:p-8 space-y-6">
        {/* Live Profile Card Preview */}
        <div className="p-1 rounded-3xl bg-gradient-to-b from-border/80 to-border/30 shadow-2xl">
          <div className="rounded-[22px] bg-card border border-border/60 overflow-hidden">
            {/* Banner Header with dynamic selected banner theme */}
            <div className={`relative h-32 sm:h-40 w-full ${activeBannerTheme.class} p-4 sm:p-6 flex flex-col justify-between overflow-hidden transition-all duration-300`}>
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
              <div className="relative z-10 flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md text-white/90 text-[11px] font-semibold border border-white/10 shadow-xs">
                  <Eye className="w-3.5 h-3.5 text-purple-400" />
                  <span>ตัวอย่างโปรไฟล์ของคุณ (Live Preview)</span>
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase ${activeBannerTheme.accentBadge}`}>
                  {userRole}
                </span>
              </div>
            </div>

            {/* Profile Avatar & Details Overlap */}
            <div className="px-6 pb-6 pt-0 relative">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-12 sm:-mt-14 mb-4">
                <div className="flex items-end gap-4">
                  {/* Avatar Preview with Dynamic Background Theme */}
                  <div className={`w-24 h-24 rounded-3xl ${activeAvatarTheme.class} p-1 border-4 border-card shadow-2xl shrink-0 transition-all duration-300 ring-4 ${activeAvatarTheme.ring}`}>
                    <div className="w-full h-full rounded-2xl flex items-center justify-center text-white font-black text-3xl overflow-hidden shadow-inner">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <span>{initial}</span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-0.5 pb-1">
                    <h3 className="text-lg sm:text-xl font-black text-foreground flex items-center gap-2">
                      <span>{displayName || 'ผู้ใช้งานไม่มีชื่อ'}</span>
                      <Sparkle className={`w-4 h-4 ${activeBannerTheme.accentText}`} />
                    </h3>
                    <p className="text-xs text-muted-foreground font-mono">{user.email}</p>
                  </div>
                </div>

                {/* Quota & Role Stats */}
                <div className="flex items-center gap-2 text-xs">
                  <div className="px-3 py-1.5 rounded-xl bg-muted/60 border border-border flex items-center gap-1.5 text-muted-foreground">
                    <Coins className="w-3.5 h-3.5 text-primary" />
                    <span>AI Quota:</span>
                    <strong className="text-foreground">{userRole === 'admin' ? '∞' : `${quotaRemaining}/${quotaMax}`}</strong>
                  </div>
                </div>
              </div>

              {/* Bio Preview */}
              {bio ? (
                <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/80 text-xs text-foreground/90 leading-relaxed italic">
                  "{bio}"
                </div>
              ) : (
                <div className="text-xs text-muted-foreground italic">
                  ยังไม่ได้ใส่คำแนะนำตัว (สามารถพิมพ์เพิ่มได้ที่ช่องด้านล่าง)
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Profile Edit Form Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-card border border-border shadow-xl space-y-8">
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <div className="p-2.5 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
              <Palette className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-foreground">
                ปรับแต่งโปรไฟล์และสีพื้นหลัง
              </h2>
              <p className="text-xs text-muted-foreground">
                เลือกธีมสีแบนเนอร์ สีพื้นหลัง Avatar และรูปถ่ายเพื่อสร้างตัวตนในจักรวาลของคุณ
              </p>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-8">
            {/* Section 1: Profile Banner Themes */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-foreground flex items-center gap-2">
                  <Layers className="w-4 h-4 text-purple-500" />
                  <span>1. ธีมสีพื้นหลังแบนเนอร์ (Profile Banner Theme)</span>
                </label>
                <span className="text-[11px] text-muted-foreground font-medium">
                  {activeBannerTheme.label}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                {BANNER_THEMES.map((theme) => {
                  const isSelected = bannerTheme === theme.id;
                  return (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => setBannerTheme(theme.id)}
                      className={`relative p-3 rounded-2xl border text-left flex flex-col justify-between h-20 transition-all cursor-pointer overflow-hidden ${
                        isSelected
                          ? 'border-purple-500 ring-2 ring-purple-500/40 shadow-md scale-[1.02]'
                          : 'border-border/80 hover:border-foreground/30 hover:scale-[1.01]'
                      } ${theme.class}`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-[11px] font-bold text-white drop-shadow-xs truncate">
                          {theme.name}
                        </span>
                        {isSelected && (
                          <div className="w-4 h-4 rounded-full bg-purple-500 text-white flex items-center justify-center shrink-0">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                        )}
                      </div>
                      <span className="text-[9px] text-white/70 truncate">
                        {theme.subtitle}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section 2: Avatar Background Colors & Aura */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-foreground flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>2. สีพื้นหลัง & ออร่า Avatar (Avatar Background & Aura)</span>
                </label>
                <span className="text-[11px] text-muted-foreground font-medium">
                  {activeAvatarTheme.label}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                {AVATAR_BG_THEMES.map((theme) => {
                  const isSelected = avatarBgTheme === theme.id;
                  return (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => setAvatarBgTheme(theme.id)}
                      className={`p-2.5 rounded-2xl border flex items-center gap-2.5 transition-all cursor-pointer text-left ${
                        isSelected
                          ? 'border-purple-500 ring-2 ring-purple-500/40 bg-purple-500/10 scale-[1.02]'
                          : 'border-border/80 bg-muted/20 hover:border-foreground/30 hover:bg-muted/40'
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-xl ${theme.class} border ${theme.border} shadow-xs shrink-0 flex items-center justify-center text-white`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[11px] font-bold text-foreground truncate">
                          {theme.name}
                        </div>
                        <div className="text-[9px] text-muted-foreground truncate">
                          {theme.subtitle}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section 3: Avatar Upload & Cute Presets */}
            <div className="space-y-4 border-t border-border/80 pt-6">
              <label className="text-xs font-bold text-foreground block">
                3. รูปภาพโปรไฟล์ (Avatar Image)
              </label>

              <div className="flex items-center gap-4">
                <div className="relative group">
                  <div className={`w-20 h-20 rounded-2xl ${activeAvatarTheme.class} border-2 border-border shadow-md flex items-center justify-center text-white font-bold text-2xl overflow-hidden shrink-0`}>
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span>{initial}</span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-black/60 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-semibold gap-1 cursor-pointer"
                  >
                    <Camera className="w-4 h-4" />
                    <span>อัปโหลด</span>
                  </button>
                </div>

                <div className="flex-1 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="px-3.5 py-2 rounded-xl bg-muted hover:bg-muted/80 text-foreground text-xs font-semibold border border-border flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      {isUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
                      <span>อัปโหลดรูปภาพ</span>
                    </button>

                    {avatarUrl && (
                      <button
                        type="button"
                        onClick={() => {
                          setAvatarUrl('');
                          setSelectedPreset(null);
                        }}
                        className="px-3 py-2 rounded-xl hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 text-xs font-medium transition-all cursor-pointer"
                      >
                        ลบรูป
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    รองรับรูปภาพทุกขนาด (ระบบบีบอัดและปรับสัดส่วนจัตุรัสอัตโนมัติ)
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Presets */}
              <div className="space-y-1.5 pt-2">
                <span className="text-[11px] font-semibold text-muted-foreground block">
                  หรือเลือก Emoji Avatar สำเร็จรูป:
                </span>
                <div className="grid grid-cols-6 sm:grid-cols-6 gap-2">
                  {AVATAR_PRESETS.map((preset) => {
                    const isChosen = selectedPreset === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handleChoosePreset(preset)}
                        className={`p-2 rounded-xl border text-base flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer hover:scale-105 ${
                          isChosen
                            ? 'border-purple-500 ring-2 ring-purple-500/30 bg-purple-500/10'
                            : `${preset.bg} hover:border-foreground/30`
                        }`}
                        title={preset.label}
                      >
                        <span>{preset.emoji}</span>
                        <span className="text-[9px] font-medium leading-none truncate max-w-full text-muted-foreground">
                          {preset.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Section 4: Personal Information */}
            <div className="space-y-4 border-t border-border/80 pt-6">
              {/* Display Name Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground flex items-center justify-between">
                  <span>ชื่อที่แสดง (Display Name) *</span>
                  <span className="text-[10px] text-muted-foreground font-mono">{displayName.length}/40</span>
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="เช่น Jessada ✦, จอมเวทกาลเวลา"
                  maxLength={40}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-muted/40 border border-border text-xs sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                />
                <p className="text-[11px] text-muted-foreground">
                  ชื่อนี้จะแสดงบนจักรวาลที่คุณสร้าง ในคอมเมนต์ และหน้าแชร์ทั้งหมด
                </p>
              </div>

              {/* Bio */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground flex items-center justify-between">
                  <span>คำแนะนำตัวสั้นๆ (Bio / Tagline)</span>
                  <span className="text-[10px] text-muted-foreground font-mono">{bio.length}/150</span>
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="เช่น ผู้หลงใหลในโลกดาร์กแฟนตาซี ไซไฟ และเรื่องเล่าลี้ลับ 🌙"
                  rows={3}
                  maxLength={150}
                  className="w-full px-3.5 py-2 rounded-xl bg-muted/40 border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/30 resize-none leading-relaxed"
                />
              </div>
            </div>

            {/* Account Info */}
            <div className="p-4 rounded-2xl bg-muted/30 border border-border flex items-center justify-between text-xs">
              <div className="space-y-0.5">
                <span className="text-[11px] text-muted-foreground block">อีเมลบัญชี</span>
                <span className="font-bold text-foreground">{user.email}</span>
              </div>
              <div className="text-right space-y-0.5">
                <span className="text-[11px] text-muted-foreground block">ระดับสมาชิก</span>
                <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 text-[10px] font-bold inline-block uppercase">
                  {userRole}
                </span>
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="submit"
                disabled={isSaving || !displayName.trim()}
                className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs sm:text-sm font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : saveSuccess ? (
                  <Check className="w-4 h-4 text-emerald-300 stroke-[3]" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                <span>{saveSuccess ? 'บันทึกการเปลี่ยนแปลงแล้ว!' : 'บันทึกโปรไฟล์ & ธีม'}</span>
              </button>
            </div>
          </form>
        </div>
      </main>

      <AuthModal />
    </div>
  );
}
