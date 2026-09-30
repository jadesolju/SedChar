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
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

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
  const [customUrlInput, setCustomUrlInput] = useState('');
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
      setCustomUrlInput(meta.avatar_url && !meta.avatar_url.startsWith('data:') ? meta.avatar_url : '');
      setSelectedPreset(meta.avatar_preset || null);
      setSaveSuccess(false);
    }
  }, [isOpen, user]);

  if (!isOpen || !user) return null;

  // Handle image upload from local file
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('รูปภาพมีขนาดใหญ่เกินไป กรุณาใช้รูปภาพขนาดไม่เกิน 2MB');
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        setAvatarUrl(base64);
        setSelectedPreset(null);
      }
      setIsUploading(false);
    };
    reader.onerror = () => {
      alert('เกิดข้อผิดพลาดในการอ่านไฟล์รูปภาพ');
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  // Handle Preset Choice
  const handleChoosePreset = (preset: typeof AVATAR_PRESETS[0]) => {
    setSelectedPreset(preset.id);
    // Create an SVG data URL for preset emoji
    const svgString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="#18181b"/><text x="50%" y="54%" dominant-baseline="central" text-anchor="middle" font-size="52">${preset.emoji}</text></svg>`;
    const dataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svgString)}`;
    setAvatarUrl(dataUrl);
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Dark backdrop overlay to prevent background text bleed-through */}
      <div 
        className="fixed inset-0 bg-black/65 backdrop-blur-xs transition-opacity" 
        onClick={onClose} 
      />

      <div className="relative z-10 w-full max-w-lg p-6 rounded-3xl bg-card border border-border shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/60 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500 border border-purple-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">
                ตั้งค่าโปรไฟล์ & ข้อมูลผู้ใช้
              </h3>
              <p className="text-xs text-muted-foreground">
                ปรับแต่งชื่อ รูปโปรไฟล์ และข้อมูลส่วนตัวของคุณ
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

        <form onSubmit={handleSave} className="space-y-6">
          {/* Avatar Section */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-foreground block">
              รูปโปรไฟล์ (Avatar)
            </label>

            <div className="flex items-center gap-4">
              {/* Current Avatar Circle */}
              <div className="relative group">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 border-2 border-border shadow-md flex items-center justify-center text-white font-bold text-xl overflow-hidden shrink-0">
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
                        setCustomUrlInput('');
                      }}
                      className="px-2.5 py-1.5 rounded-xl hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 text-xs font-medium transition-all cursor-pointer"
                    >
                      ลบรูป
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground">
                  รองรับ PNG, JPG, GIF ขนาดไม่เกิน 2MB
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
            <div className="space-y-1.5 pt-2">
              <span className="text-[11px] font-semibold text-muted-foreground block">
                หรือเลือก Avatar สไตล์น่ารักสำเร็จรูป:
              </span>
              <div className="grid grid-cols-6 gap-2">
                {AVATAR_PRESETS.map((preset) => {
                  const isChosen = selectedPreset === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleChoosePreset(preset)}
                      className={`p-2 rounded-xl border text-base flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer hover:scale-110 ${
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
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground flex items-center justify-between">
              <span>ชื่อที่แสดง (Display Name)</span>
              <span className="text-[10px] text-muted-foreground font-mono">{displayName.length}/40</span>
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="เช่น Jessada ✦, นักเล่าเรื่อง"
              maxLength={40}
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-muted/40 border border-border text-xs sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/30"
            />
            <p className="text-[11px] text-muted-foreground">
              ชื่อนี้จะแสดงบนจักรวาลที่คุณสร้าง ในคอมเมนต์ และหน้าแชร์ทั้งหมด
            </p>
          </div>

          {/* Bio / Tagline Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground flex items-center justify-between">
              <span>คำแนะนำตัวสั้นๆ (Bio - ไม่บังคับ)</span>
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

          {/* Account Status Info */}
          <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/80 flex items-center justify-between text-xs">
            <div className="space-y-0.5">
              <span className="text-[11px] text-muted-foreground block">อีเมลบัญชี</span>
              <span className="font-bold text-foreground">{user.email}</span>
            </div>
            <div className="text-right space-y-0.5">
              <span className="text-[11px] text-muted-foreground block">สถานะสิทธิ์</span>
              <span className="px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 text-[10px] font-bold inline-block uppercase">
                {userRole}
              </span>
            </div>
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
                <Check className="w-3.5 h-3.5 text-white" />
              ) : (
                <Check className="w-3.5 h-3.5" />
              )}
              <span>{saveSuccess ? 'บันทึกสำเร็จแล้ว!' : 'บันทึกการเปลี่ยนแปลง'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
