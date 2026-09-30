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
} from 'lucide-react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { UserMenu } from '@/components/auth/UserMenu';
import { AuthModal } from '@/components/auth/AuthModal';
import { compressImageToAvatar } from '@/utils/imageCompressor';

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
            คุณจำเป็นต้องเข้าสู่ระบบเพื่อจัดการตั้งค่าโปรไฟล์และข้อมูลส่วนตัว
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
      // Auto compress and square crop for crisp avatar (~20KB)
      const compressedDataUrl = await compressImageToAvatar(file, 320, 0.85);
      setAvatarUrl(compressedDataUrl);
      setSelectedPreset(null);
    } catch (err: any) {
      alert(err.message || 'เกิดข้อผิดพลาดในการประมวลผลรูปภาพ');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleChoosePreset = (preset: typeof AVATAR_PRESETS[0]) => {
    setSelectedPreset(preset.id);
    const svgString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="#18181b"/><text x="50%" y="54%" dominant-baseline="central" text-anchor="middle" font-size="52">${preset.emoji}</text></svg>`;
    const dataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svgString)}`;
    setAvatarUrl(dataUrl);
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
            จัดการโปรไฟล์ & ข้อมูลส่วนตัว
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <UserMenu />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-2xl w-full mx-auto p-4 sm:p-8 space-y-6">
        <div className="p-6 sm:p-8 rounded-3xl bg-card border border-border shadow-xl space-y-6">
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <div className="p-2.5 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-foreground">
                ตั้งค่าโปรไฟล์ผู้ใช้งาน
              </h2>
              <p className="text-xs text-muted-foreground">
                ชื่อและรูปนี้จะแสดงในจักรวาลที่คุณสร้าง ในคอมเมนต์ และการแชร์ผลงาน
              </p>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            {/* Avatar Section */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-foreground block">
                รูปโปรไฟล์ (Avatar)
              </label>

              <div className="flex items-center gap-4">
                <div className="relative group">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 border-2 border-border shadow-md flex items-center justify-center text-white font-bold text-2xl overflow-hidden shrink-0">
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
                    รองรับรูปภาพทุกขนาด (ระบบบีบอัดความละเอียดสูงอัตโนมัติ)
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
                  หรือเลือก Avatar สำเร็จรูป:
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

            {/* Bio */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground flex items-center justify-between">
                <span>คำแนะนำตัวสั้นๆ (Bio)</span>
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
                className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs sm:text-sm font-bold shadow-sm transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : saveSuccess ? (
                  <Check className="w-4 h-4 text-emerald-300" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                <span>{saveSuccess ? 'บันทึกการเปลี่ยนแปลงแล้ว!' : 'บันทึกโปรไฟล์'}</span>
              </button>
            </div>
          </form>
        </div>
      </main>

      <AuthModal />
    </div>
  );
}
