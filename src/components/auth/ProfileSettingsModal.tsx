'use client';
import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  User as UserIcon,
  Camera,
  Sparkles,
  Check,
  Loader2,
  Image as ImageIcon,
  ShieldCheck,
  Coins,
  Crown,
  Coffee,
  Gem,
  Palette,
  Layers,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { compressImageToAvatar } from '@/utils/imageCompressor';
import {
  AVATAR_BG_THEMES,
  BANNER_THEMES,
  getAvatarTheme,
  getBannerTheme,
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

interface ProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileSettingsModal({ isOpen, onClose }: ProfileSettingsModalProps) {
  const { user, userRole, quotaRemaining, quotaMax, updateUserProfile } = useAuth();

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

  // Sync initial state from user metadata
  useEffect(() => {
    if (isOpen && user) {
      const meta = user.user_metadata || {};
      const currentName = meta.display_name || meta.full_name || (user.email ? user.email.split('@')[0] : '');
      setDisplayName(currentName);
      setBio(meta.bio || '');
      setAvatarUrl(meta.avatar_url || '');
      setSelectedPreset(meta.avatar_preset || null);
      setAvatarBgTheme(meta.avatar_bg_theme || 'nebula');
      setBannerTheme(meta.banner_theme || 'cosmic');
      setSaveSuccess(false);
    }
  }, [isOpen, user]);

  if (!isOpen || !user) return null;

  // Handle image upload from local file
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const compressedDataUrl = await compressImageToAvatar(file, 320, 0.85);
      
      const res = await fetch('/api/avatar/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: compressedDataUrl, userId: user?.id }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.url) {
          setAvatarUrl(data.url);
          await updateUserProfile({ avatarUrl: data.url });
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

  // Handle Preset Choice
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
          await updateUserProfile({ avatarUrl: data.url });
        }
      }
    } catch {}
  };

  // Handle Form Submit
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
          onClose();
        }, 1200);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Dark backdrop overlay */}
      <div 
        className="fixed inset-0 bg-black/65 backdrop-blur-xs transition-opacity" 
        onClick={onClose} 
      />

      <div className="relative z-10 w-full max-w-xl p-6 rounded-3xl bg-card border border-border shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/60 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500 border border-purple-500/20">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">
                ตั้งค่าโปรไฟล์ & ปรับแต่งธีม
              </h3>
              <p className="text-xs text-muted-foreground">
                ปรับแต่งชื่อ รูปโปรไฟล์ และธีมสีพื้นหลังของคุณ
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live Mini Preview */}
        <div
          className="p-4 rounded-2xl border flex items-center gap-3.5 transition-all shadow-md overflow-hidden"
          style={{ background: activeBannerTheme.gradient }}
        >
          <div
            className="w-14 h-14 rounded-2xl border-2 border-white/20 p-0.5 shadow-lg shrink-0 flex items-center justify-center text-white font-bold text-xl overflow-hidden"
            style={{ background: activeAvatarTheme.gradient, boxShadow: activeAvatarTheme.glow }}
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span>{initial}</span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-bold text-white truncate flex items-center gap-1.5 drop-shadow-sm">
              <span>{displayName || 'ผู้ใช้งานไม่มีชื่อ'}</span>
              <span className={`px-2 py-0.2 rounded-full text-[9px] font-bold border uppercase ${activeBannerTheme.accentBadge}`}>
                {userRole}
              </span>
            </div>
            <div className="text-[11px] text-white/80 truncate drop-shadow-xs">{user.email}</div>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Banner Theme Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-foreground flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-purple-500" />
                <span>ธีมสีแบนเนอร์ (Banner Theme)</span>
              </span>
              <span className="text-[10px] text-muted-foreground">{activeBannerTheme.name}</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {BANNER_THEMES.map((theme) => {
                const isSelected = bannerTheme === theme.id;
                return (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => setBannerTheme(theme.id)}
                    className={`p-2 rounded-xl border text-left text-xs font-semibold text-white h-14 flex flex-col justify-between transition-all cursor-pointer overflow-hidden ${
                      isSelected
                        ? 'border-purple-500 ring-2 ring-purple-500/40 scale-[1.02]'
                        : 'border-border/80 hover:border-foreground/30'
                    }`}
                    style={{ background: theme.gradient }}
                  >
                    <span className="text-[10px] font-bold truncate drop-shadow-sm">{theme.name}</span>
                    {isSelected && <Check className="w-3 h-3 text-white self-end stroke-[3]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Avatar Background Theme */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-foreground flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>สีพื้นหลัง &amp; ออร่า Avatar</span>
              </span>
              <span className="text-[10px] text-muted-foreground">{activeAvatarTheme.name}</span>
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {AVATAR_BG_THEMES.map((theme) => {
                const isSelected = avatarBgTheme === theme.id;
                return (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => setAvatarBgTheme(theme.id)}
                    className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-purple-500 ring-2 ring-purple-500/40 bg-purple-500/10'
                        : 'border-border/80 bg-muted/20 hover:border-foreground/30'
                    }`}
                    title={theme.label}
                  >
                    <div
                      className="w-6 h-6 rounded-lg flex items-center justify-center text-white"
                      style={{ background: theme.gradient, boxShadow: theme.glow }}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <span className="text-[9px] text-muted-foreground truncate max-w-full font-medium">
                      {theme.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Avatar Image Section */}
          <div className="space-y-3 border-t border-border/60 pt-4">
            <label className="text-xs font-bold text-foreground block">
              รูปโปรไฟล์ (Avatar Image)
            </label>

            <div className="flex items-center gap-4">
              <div className="relative group">
                <div
                  className="w-16 h-16 rounded-2xl border-2 border-border shadow-md flex items-center justify-center text-white font-bold text-xl overflow-hidden shrink-0"
                  style={{ background: activeAvatarTheme.gradient, boxShadow: activeAvatarTheme.glow }}
                >
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
                  title="เปลี่ยนรูปภาพ"
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
                    className="px-3 py-1.5 rounded-xl bg-muted hover:bg-muted/80 text-foreground text-xs font-semibold border border-border flex items-center gap-1.5 transition-all cursor-pointer"
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
                      className="px-2.5 py-1.5 rounded-xl hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 text-xs font-medium transition-all cursor-pointer"
                    >
                      ลบรูป
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground">
                  ระบบบีบอัดความละเอียดสูงอัตโนมัติ
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

            {/* Cute Avatar Presets */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-semibold text-muted-foreground block">
                หรือเลือก Avatar สำเร็จรูป:
              </span>
              <div className="grid grid-cols-6 gap-2">
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

          {/* Display Name Input */}
          <div className="space-y-1.5 border-t border-border/60 pt-4">
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
          </div>

          {/* Bio / Tagline Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground flex items-center justify-between">
              <span>คำแนะนำตัวสั้นๆ (Bio)</span>
              <span className="text-[10px] text-muted-foreground font-mono">{bio.length}/150</span>
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="เช่น ผู้หลงใหลในโลกดาร์กแฟนตาซี ไซไฟ และเรื่องเล่าลี้ลับ 🌙"
              rows={2}
              maxLength={150}
              className="w-full px-3.5 py-2 rounded-xl bg-muted/40 border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/30 resize-none leading-relaxed"
            />
          </div>

          {/* Bottom Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border/60">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-border text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-all cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={isSaving || !displayName.trim()}
              className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : saveSuccess ? (
                <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
              ) : (
                <Check className="w-3.5 h-3.5" />
              )}
              <span>{saveSuccess ? 'บันทึกสำเร็จแล้ว!' : 'บันทึกโปรไฟล์ & ธีม'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
