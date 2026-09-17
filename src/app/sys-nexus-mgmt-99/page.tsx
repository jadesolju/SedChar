'use client';
import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth, ROLE_QUOTA_MAP, type UserRole } from '@/context/AuthContext';
import Link from 'next/link';

function AdminNexusDashboardContent() {
  const {
    user,
    userRole,
    setUserRole,
    quotaRemaining,
    quotaMax,
    isUnlimitedQuota,
    savedCharacters
  } = useAuth();

  const [masterPasscode, setMasterPasscode] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [unlockError, setUnlockError] = useState(false);
  const [customQuotaInput, setCustomQuotaInput] = useState<number>(50);
  const [roleUpdatedToast, setRoleUpdatedToast] = useState<string | null>(null);

  // Auto unlock if user is already admin
  useEffect(() => {
    if (userRole === 'admin') {
      setIsUnlocked(true);
    }
  }, [userRole]);

  // Auto-unlock if authenticated as admin
  useEffect(() => {
    if (user && userRole === 'admin') {
      setIsUnlocked(true);
    }
  }, [user, userRole]);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (masterPasscode.trim() === 'admin67x' || masterPasscode.trim() === 'sedchar-master-2026' || masterPasscode.trim() === 'admin') {
      setIsUnlocked(true);
      setUserRole('admin');
      setUnlockError(false);
      setRoleUpdatedToast('✨ ปลดล็อกสิทธิ์ระดับสูงสุด (Admin Unlimited) เรียบร้อยแล้ว!');
      setTimeout(() => setRoleUpdatedToast(null), 3000);
    } else {
      setUnlockError(true);
      setTimeout(() => setUnlockError(false), 3000);
    }
  };

  const handleRoleChange = (newRole: UserRole) => {
    setUserRole(newRole);
    setRoleUpdatedToast(`✓ สลับสิทธิ์เป็น [${newRole.toUpperCase()}] — โควตา AI: ${newRole === 'admin' ? 'ไม่จำกัด (Unlimited)' : `${ROLE_QUOTA_MAP[newRole]} ครั้ง/วัน`}`);
    setTimeout(() => setRoleUpdatedToast(null), 3000);
  };

  const handleResetQuotaToday = () => {
    if (user) {
      const today = new Date().toISOString().slice(0, 10);
      const key = `sedchar_ai_quota_${user.id}_${today}`;
      const max = ROLE_QUOTA_MAP[userRole] || 15;
      localStorage.setItem(key, String(max));
      setUserRole(userRole); // Trigger sync
      setRoleUpdatedToast(`✓ รีเซ็ตโควตาประจำวันเป็น ${max} ครั้ง เรียบร้อย`);
      setTimeout(() => setRoleUpdatedToast(null), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-rose-500/20 selection:text-rose-500 font-sans">
      {/* Top Admin Navbar */}
      <header className="border-b border-border bg-card/60 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-pink-600 text-white flex items-center justify-center font-bold text-lg shadow-md">
            🛡️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-foreground">SedChar Control Nexus</h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 font-bold">
                SECURE CONSOLE v2.0
              </span>
            </div>
            <p className="text-xs text-muted-foreground">ระบบจัดการหลังบ้าน, สิทธิ์ผู้ใช้ (Roles & Permissions) และสถิติระบบ</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="px-4 py-2 rounded-xl bg-muted hover:bg-muted/80 text-foreground text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <span>←</span> กลับสู่หน้าแอปหลัก
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-8 space-y-6">
        {roleUpdatedToast && (
          <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 text-xs font-bold shadow-md animate-in fade-in flex items-center gap-2">
            <span>✨</span>
            <span>{roleUpdatedToast}</span>
          </div>
        )}

        {/* SECURITY LOCK / GATE */}
        {!isUnlocked ? (
          <div className="max-w-md mx-auto my-12 p-8 rounded-2xl bg-card border border-border shadow-2xl text-center space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-500 mx-auto flex items-center justify-center text-3xl">
              🔒
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">เข้าสู่ระบบควบคุมหลังบ้าน (Nexus Console)</h2>
              <p className="text-xs text-muted-foreground mt-1">
                กรุณาระบุรหัสผ่าน Master Passcode หรือล็อกอินด้วยบัญชีแอดมินเพื่อเข้าใช้งาน
              </p>
            </div>

            <form onSubmit={handleUnlock} className="space-y-3">
              <input
                type="password"
                value={masterPasscode}
                onChange={(e) => setMasterPasscode(e.target.value)}
                placeholder="ใส่ Master Passcode"
                className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border text-xs text-foreground text-center font-mono focus:outline-none focus:ring-2 focus:ring-primary/50"
              />

              {unlockError && (
                <div className="text-[11px] text-rose-500 font-semibold">
                  ⚠️ รหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                ปลดล็อก Nexus Console 🔓
              </button>
            </form>

            
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in">
            {/* GRID SECTION 1: ROLE & QUOTA CONFIGURATION */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* CARD 1: ADMIN ROLE */}
              <div
                className={`p-5 rounded-2xl border transition-all space-y-4 ${userRole === 'admin'
                    ? 'bg-amber-500/10 border-amber-500/40 shadow-lg ring-2 ring-amber-500/30'
                    : 'bg-card border-border hover:border-border/80'
                  }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">👑</span>
                    <h3 className="text-sm font-bold text-foreground">Admin Role</h3>
                  </div>
                  {userRole === 'admin' && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-black">
                      ACTIVE
                    </span>
                  )}
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-black text-amber-500">∞ ไม่จำกัด</div>
                  <div className="text-xs text-muted-foreground">Unlimited AI Calls / Day</div>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  สิทธิ์ผู้ดูแลระบบสูงสุด ไม่จำกัดโควตา สามารถเข้าถึงคอนโซลและฟังก์ชันพิเศษทั้งหมด
                </p>
                <button
                  type="button"
                  onClick={() => handleRoleChange('admin')}
                  disabled={userRole === 'admin'}
                  className="w-full py-2 rounded-xl text-xs font-bold transition-all cursor-pointer bg-amber-500 hover:bg-amber-600 text-black disabled:opacity-40"
                >
                  {userRole === 'admin' ? 'กำลังใช้งานสิทธิ์นี้' : 'สลับเป็น Admin'}
                </button>
              </div>

              {/* CARD 2: PREMIUM ROLE */}
              <div
                className={`p-5 rounded-2xl border transition-all space-y-4 ${userRole === 'premium'
                    ? 'bg-rose-500/10 border-rose-500/40 shadow-lg ring-2 ring-rose-500/30'
                    : 'bg-card border-border hover:border-border/80'
                  }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">💎</span>
                    <h3 className="text-sm font-bold text-foreground">Premium Role</h3>
                  </div>
                  {userRole === 'premium' && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500 text-white">
                      ACTIVE
                    </span>
                  )}
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-black text-rose-500">50 ครั้ง / วัน</div>
                  <div className="text-xs text-muted-foreground">High Quota AI Role</div>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  สำหรับสมาชิกระดับพรีเมียม โควตา 50 ครั้งต่อวัน รองรับการสร้างตัวละครจำนวนมาก
                </p>
                <button
                  type="button"
                  onClick={() => handleRoleChange('premium')}
                  disabled={userRole === 'premium'}
                  className="w-full py-2 rounded-xl text-xs font-bold transition-all cursor-pointer bg-rose-500 hover:bg-rose-600 text-white disabled:opacity-40"
                >
                  {userRole === 'premium' ? 'กำลังใช้งานสิทธิ์นี้' : 'สลับเป็น Premium'}
                </button>
              </div>

              {/* CARD 3: FREE ROLE */}
              <div
                className={`p-5 rounded-2xl border transition-all space-y-4 ${userRole === 'free'
                    ? 'bg-primary/10 border-primary/40 shadow-lg ring-2 ring-primary/30'
                    : 'bg-card border-border hover:border-border/80'
                  }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🌱</span>
                    <h3 className="text-sm font-bold text-foreground">Free (Standard)</h3>
                  </div>
                  {userRole === 'free' && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary text-white">
                      ACTIVE
                    </span>
                  )}
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-black text-foreground">15 ครั้ง / วัน</div>
                  <div className="text-xs text-muted-foreground">Default Standard Quota</div>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  สิทธิ์ผู้ใช้ทั่วไปเริ่มต้น โควตา 15 ครั้งต่อวัน รีเซ็ตใหม่ทุกเที่ยงคืน
                </p>
                <button
                  type="button"
                  onClick={() => handleRoleChange('free')}
                  disabled={userRole === 'free'}
                  className="w-full py-2 rounded-xl text-xs font-bold transition-all cursor-pointer bg-muted hover:bg-muted/80 text-foreground disabled:opacity-40"
                >
                  {userRole === 'free' ? 'กำลังใช้งานสิทธิ์นี้' : 'สลับเป็น Free'}
                </button>
              </div>
            </div>

            {/* SECTION 2: LIVE ACCOUNT & QUOTA MONITOR */}
            <div className="p-6 rounded-2xl bg-card border border-border space-y-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-border pb-4">
                <div>
                  <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <span>📊</span> สถานะบัญชีปัจจุบัน & การควบคุมโควตา
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    ผู้ใช้: <strong className="text-foreground">{user?.email || 'Guest / Local Admin'}</strong> • ID: <code className="text-[11px] bg-muted px-1 rounded">{user?.id || 'local-admin-nexus'}</code>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleResetQuotaToday}
                    className="px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 text-xs font-semibold text-foreground transition-colors cursor-pointer"
                  >
                    🔄 รีเซ็ตโควตาวันนี้
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-3.5 rounded-xl bg-muted/40 border border-border">
                  <div className="text-[11px] text-muted-foreground">ระดับสิทธิ์ (Role)</div>
                  <div className="text-base font-bold text-amber-500 uppercase mt-0.5">{userRole}</div>
                </div>
                <div className="p-3.5 rounded-xl bg-muted/40 border border-border">
                  <div className="text-[11px] text-muted-foreground">โควตาคงเหลือวันนี้</div>
                  <div className="text-base font-bold text-foreground mt-0.5">
                    {userRole === 'admin' ? '∞ ไม่จำกัด' : `${quotaRemaining} / ${quotaMax}`}
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-muted/40 border border-border">
                  <div className="text-[11px] text-muted-foreground">จำนวนในคลัง (Saved)</div>
                  <div className="text-base font-bold text-foreground mt-0.5">{savedCharacters.length} ตัวละคร</div>
                </div>
                <div className="p-3.5 rounded-xl bg-muted/40 border border-border">
                  <div className="text-[11px] text-muted-foreground">AI Engine ความเร็วสูง</div>
                  <div className="text-base font-bold text-emerald-500 mt-0.5">&lt; 1 วินาที ⚡</div>
                </div>
              </div>
            </div>

            {/* SECTION 3: ADMIN INSTRUCTIONS MANUAL (สอนวิธีปรับระบบ) */}
            <div className="p-6 rounded-2xl bg-card border border-border space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-xl">📖</span>
                <div>
                  <h2 className="text-sm font-bold text-foreground">คู่มือการปรับตั้งค่าระบบหลังบ้าน (Admin Manual)</h2>
                  <p className="text-xs text-muted-foreground">วิธีการปรับแต่ง Role, โควตา และสิทธิ์การเข้าถึงผ่านช่องทางต่างๆ</p>
                </div>
              </div>

              <div className="space-y-4 text-xs text-muted-foreground leading-relaxed divide-y divide-border/40">
                {/* Method 1 */}
                <div className="pt-3 space-y-1.5">
                  <h4 className="font-bold text-foreground flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center text-[10px]">1</span>
                    วิธีที่ 1: ปรับสิทธิ์ผ่านคอนโซลหลังบ้านนี้ (Live UI Switcher)
                  </h4>
                  <p>
                    กดปุ่ม <strong className="text-foreground">"สลับเป็น Admin"</strong> หรือ <strong className="text-foreground">"สลับเป็น Premium"</strong> ที่การ์ดด้านบน ระบบจะบันทึกสิทธิ์ลงใน Local User State และซิงค์โควตาทันทีโดยไม่ต้องแก้โค้ด
                  </p>
                </div>

                {/* Method 2 */}
                <div className="pt-3 space-y-1.5">
                  <h4 className="font-bold text-foreground flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-500 flex items-center justify-center text-[10px]">2</span>
                    วิธีที่ 2: ปรับสิทธิ์ผ่าน Supabase SQL Database
                  </h4>
                  <p>
                    หากต้องการกำหนดสิทธิ์ถาวรให้บัญชีผู้ใช้ใน Supabase สามารถรันคำสั่ง SQL ใน Supabase SQL Editor:
                  </p>
                  <pre className="p-3 rounded-xl bg-muted/50 border border-border text-foreground font-mono text-[11px] overflow-x-auto">
                    {`-- กำหนดสิทธิ์ให้ผู้ใช้เป็น Admin (ไม่จำกัดโควตา)
UPDATE auth.users 
SET raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'::jsonb 
WHERE email = 'your_email@example.com';

-- กำหนดสิทธิ์ให้ผู้ใช้เป็น Premium (50 ครั้ง/วัน)
UPDATE auth.users 
SET raw_user_meta_data = raw_user_meta_data || '{"role": "premium"}'::jsonb 
WHERE email = 'premium_user@example.com';`}
                  </pre>
                </div>

                {/* Method 3 */}
                <div className="pt-3 space-y-1.5">
                  <h4 className="font-bold text-foreground flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-pink-500/20 text-pink-500 flex items-center justify-center text-[10px]">3</span>
                    วิธีที่ 3: ปรับแต่งตัวเลขโควตาใน Source Code
                  </h4>
                  <p>
                    หากต้องการเปลี่ยนตัวเลขโควตาของแต่ละ Role สามารถแก้ไขได้ที่ไฟล์ <code className="text-foreground bg-muted px-1.5 py-0.5 rounded font-mono">src/context/AuthContext.tsx</code>:
                  </p>
                  <pre className="p-3 rounded-xl bg-muted/50 border border-border text-foreground font-mono text-[11px] overflow-x-auto">
                    {`export const ROLE_QUOTA_MAP: Record<UserRole, number> = {
  admin: 999999, // Unlimited / ไม่จำกัด
  premium: 50,   // เปลี่ยนตัวเลขตรงนี้ เช่น 100
  free: 15,      // เปลี่ยนตัวเลขตรงนี้ เช่น 20
};`}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}


export default function AdminNexusDashboardPage() {
  return (
    <AuthProvider>
      <AdminNexusDashboardContent />
    </AuthProvider>
  );
}
