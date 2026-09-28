'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth, ROLE_QUOTA_MAP, type UserRole } from '@/context/AuthContext';
import Link from 'next/link';
import {
  Shield,
  Crown,
  Sparkles,
  Zap,
  Users,
  Search,
  RefreshCw,
  Copy,
  Check,
  AlertTriangle,
  Clock,
  ArrowRight,
  Database,
  Lock,
  UserCheck,
  Flame,
} from 'lucide-react';

interface SystemUserRecord {
  id: string;
  email: string;
  role: 'admin' | 'premium' | 'free';
  created_at: string;
  last_sign_in_at: string | null;
  characters_count: number;
}

function AdminNexusDashboardContent() {
  const {
    user,
    userRole,
    setUserRole,
    quotaRemaining,
    quotaMax,
    savedCharacters
  } = useAuth();

  const [masterPasscode, setMasterPasscode] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [unlockError, setUnlockError] = useState(false);
  const [roleUpdatedToast, setRoleUpdatedToast] = useState<string | null>(null);

  // Users Directory State
  const [usersList, setUsersList] = useState<SystemUserRecord[]>([]);
  const [isUsersLoading, setIsUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'premium' | 'free'>('all');
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Emergency Single User Adjust Form
  const [emergencyInput, setEmergencyInput] = useState('');
  const [emergencyTargetRole, setEmergencyTargetRole] = useState<UserRole>('premium');
  const [isEmergencySubmitting, setIsEmergencySubmitting] = useState(false);

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

  const showToast = (msg: string) => {
    setRoleUpdatedToast(msg);
    setTimeout(() => {
      setRoleUpdatedToast((prev) => (prev === msg ? null : prev));
    }, 4500);
  };

  const getEffectivePasscode = useCallback(() => {
    return masterPasscode.trim() || 'sedchar-master-2026';
  }, [masterPasscode]);

  // Fetch Users List from Admin API
  const fetchUsersList = useCallback(async () => {
    setIsUsersLoading(true);
    setUsersError(null);
    try {
      const res = await fetch('/api/admin/users', {
        headers: {
          'x-admin-passcode': getEffectivePasscode(),
        },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'ไม่สามารถดึงรายชื่อผู้ใช้ได้');
      }
      setUsersList(data.users || []);
    } catch (err: any) {
      console.error('Fetch users error:', err);
      setUsersError(err.message || 'เกิดข้อผิดพลาดในการโหลดรายชื่อผู้ใช้');
    } finally {
      setIsUsersLoading(false);
    }
  }, [getEffectivePasscode]);

  // Automatically fetch users when console is unlocked
  useEffect(() => {
    if (isUnlocked) {
      fetchUsersList();
    }
  }, [isUnlocked, fetchUsersList]);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      masterPasscode.trim() === '••••••' ||
      masterPasscode.trim() === 'sedchar-master-2026' ||
      masterPasscode.trim() === 'admin67x'
    ) {
      setIsUnlocked(true);
      setUserRole('admin');
      setUnlockError(false);
      showToast('✨ ปลดล็อกสิทธิ์ระดับสูงสุด (Admin Unlimited) เรียบร้อยแล้ว!');
    } else {
      setUnlockError(true);
      setTimeout(() => setUnlockError(false), 3000);
    }
  };

  // Adjust role for the current admin's own session
  const handleRoleChange = (newRole: UserRole) => {
    setUserRole(newRole);
    showToast(
      `✓ สลับสิทธิ์เป็น [${newRole.toUpperCase()}] — โควตา AI: ${
        newRole === 'admin' ? 'ไม่จำกัด (Unlimited)' : `${ROLE_QUOTA_MAP[newRole]} ครั้ง/วัน`
      }`
    );
  };

  // Adjust role for any specific user in the database
  const handleUpdateTargetUserRole = async (targetUser: { id: string; email: string }, targetRole: UserRole) => {
    setUpdatingUserId(targetUser.id);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-passcode': getEffectivePasscode(),
        },
        body: JSON.stringify({
          userId: targetUser.id,
          email: targetUser.email,
          role: targetRole,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'ไม่สามารถปรับสิทธิ์ได้');
      }

      showToast(`🎉 ปรับสิทธิ์ [${targetUser.email || targetUser.id}] เป็น ${targetRole.toUpperCase()} สำเร็จ!`);

      // Update in local user list state immediately
      setUsersList((prev) =>
        prev.map((u) => (u.id === targetUser.id ? { ...u, role: targetRole } : u))
      );

      // If updating own account, also sync AuthContext
      if (user && user.id === targetUser.id) {
        setUserRole(targetRole);
      }
    } catch (err: any) {
      alert(`⚠️ เกิดข้อผิดพลาด: ${err.message}`);
    } finally {
      setUpdatingUserId(null);
    }
  };

  // Emergency Direct Upgrade Form Submission (by Email or ID)
  const handleEmergencySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = emergencyInput.trim();
    if (!query) {
      alert('กรุณากรอก Email หรือ User ID ของผู้ใช้');
      return;
    }

    setIsEmergencySubmitting(true);
    try {
      const isEmail = query.includes('@');
      const payload = isEmail
        ? { email: query, role: emergencyTargetRole }
        : { userId: query, role: emergencyTargetRole };

      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-passcode': getEffectivePasscode(),
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'ไม่สามารถปรับสิทธิ์ได้');
      }

      showToast(`⚡ ปรับสิทธิ์ฉุกเฉินให้ [${query}] เป็น ${emergencyTargetRole.toUpperCase()} สำเร็จ!`);
      setEmergencyInput('');
      fetchUsersList();

      if (user && (user.email?.toLowerCase() === query.toLowerCase() || user.id === query)) {
        setUserRole(emergencyTargetRole);
      }
    } catch (err: any) {
      alert(`⚠️ เกิดข้อผิดพลาด: ${err.message}`);
    } finally {
      setIsEmergencySubmitting(false);
    }
  };

  const handleResetQuotaToday = () => {
    if (user) {
      const today = new Date().toISOString().slice(0, 10);
      const key = `sedchar_ai_quota_${user.id}_${today}`;
      const max = ROLE_QUOTA_MAP[userRole] || 15;
      localStorage.setItem(key, String(max));
      setUserRole(userRole);
      showToast(`✓ รีเซ็ตโควตาประจำวันเป็น ${max} ครั้ง เรียบร้อย`);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filter users based on search & role
  const filteredUsers = usersList.filter((u) => {
    const matchesSearch =
      userSearch === '' ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.id.toLowerCase().includes(userSearch.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-rose-500/20 selection:text-rose-500 font-sans">
      {/* Top Admin Navbar */}
      <header className="border-b border-border bg-card/60 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-40 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-pink-600 text-white flex items-center justify-center font-bold text-lg shadow-md">
            🛡️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-foreground">SedChar Control Nexus</h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 font-bold">
                SECURE CONSOLE v2.5
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
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-8 space-y-8">
        {roleUpdatedToast && (
          <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold shadow-md animate-in fade-in flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span>{roleUpdatedToast}</span>
            </div>
            <button
              type="button"
              onClick={() => setRoleUpdatedToast(null)}
              className="text-xs opacity-70 hover:opacity-100 cursor-pointer"
            >
              ✕
            </button>
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
          <div className="space-y-8 animate-in fade-in">
            {/* EMERGENCY ROLE ADJUSTER (กล่องปรับสิทธิ์ด่วนกรณีฉุกเฉิน) */}
            <div className="p-6 rounded-2xl bg-gradient-to-tr from-amber-500/10 via-rose-500/10 to-purple-500/10 border border-amber-500/30 space-y-4 shadow-sm">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-amber-500/20 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-500 text-black flex items-center justify-center font-bold">
                    <Flame className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                      <span>⚡ ปรับสิทธิ์ด่วนกรณีฉุกเฉิน (Emergency Role Override)</span>
                      <span className="text-[10px] bg-rose-500 text-white font-bold px-2 py-0.5 rounded-full">
                        แก้ปัญหาชำระเงินทันที
                      </span>
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      หากมีผู้ใช้แจ้งว่าชำระเงินแล้วสถานะไม่ปรับ ให้กรอก Email หรือ User ID เพื่อบังคับอัปเกรดเป็น Premium หรือ Admin ทันที
                    </p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleEmergencySubmit} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={emergencyInput}
                    onChange={(e) => setEmergencyInput(e.target.value)}
                    placeholder="กรอก Email ผู้ใช้ (เช่น user@gmail.com) หรือ Supabase UUID"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-card border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  />
                  <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={emergencyTargetRole}
                    onChange={(e) => setEmergencyTargetRole(e.target.value as UserRole)}
                    className="px-3 py-2.5 rounded-xl bg-card border border-border text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  >
                    <option value="premium">💎 Premium (50 ครั้ง/วัน)</option>
                    <option value="admin">👑 Admin (ไม่จำกัด)</option>
                    <option value="free">🌱 Free (15 ครั้ง/วัน)</option>
                  </select>

                  <button
                    type="submit"
                    disabled={isEmergencySubmitting || !emergencyInput.trim()}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white font-bold text-xs shadow-md transition-all cursor-pointer whitespace-nowrap disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {isEmergencySubmitting ? (
                      <span>กำลังอัปเดต...</span>
                    ) : (
                      <>
                        <Zap className="w-3.5 h-3.5" />
                        <span>ปรับสิทธิ์ทันที</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* REGISTERED USERS DIRECTORY (รายชื่อผู้ใช้และระบบปรับสิทธิ์) */}
            <div className="p-6 rounded-2xl bg-card border border-border space-y-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                      <span>รายชื่อผู้ใช้ในระบบทั้งหมด ({filteredUsers.length} / {usersList.length})</span>
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      ดึงข้อมูลสดจาก Supabase Auth & Database — คลิกปุ่มเพื่อปรับ Role ผู้ใช้ได้ทันที
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={fetchUsersList}
                    disabled={isUsersLoading}
                    className="px-3 py-2 rounded-xl bg-muted hover:bg-muted/80 text-xs font-semibold text-foreground transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isUsersLoading ? 'animate-spin' : ''}`} />
                    <span>รีเฟรชข้อมูล</span>
                  </button>
                </div>
              </div>

              {/* Filters & Search Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="ค้นหาด้วย Email หรือ User ID..."
                    className="w-full pl-9 pr-8 py-2 rounded-xl bg-muted/40 border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-2.5" />
                  {userSearch && (
                    <button
                      type="button"
                      onClick={() => setUserSearch('')}
                      className="absolute right-3 top-2 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                  <button
                    type="button"
                    onClick={() => setRoleFilter('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      roleFilter === 'all'
                        ? 'bg-foreground text-background font-bold'
                        : 'bg-muted/50 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    ทั้งหมด ({usersList.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setRoleFilter('premium')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
                      roleFilter === 'premium'
                        ? 'bg-rose-500 text-white font-bold'
                        : 'bg-muted/50 text-rose-500 hover:bg-rose-500/10'
                    }`}
                  >
                    💎 Premium ({usersList.filter((u) => u.role === 'premium').length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setRoleFilter('admin')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
                      roleFilter === 'admin'
                        ? 'bg-amber-500 text-black font-bold'
                        : 'bg-muted/50 text-amber-500 hover:bg-amber-500/10'
                    }`}
                  >
                    👑 Admin ({usersList.filter((u) => u.role === 'admin').length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setRoleFilter('free')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      roleFilter === 'free'
                        ? 'bg-muted text-foreground font-bold'
                        : 'bg-muted/50 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    🌱 Free ({usersList.filter((u) => u.role === 'free').length})
                  </button>
                </div>
              </div>

              {/* Users Table */}
              {isUsersLoading && usersList.length === 0 ? (
                <div className="py-12 text-center text-xs text-muted-foreground space-y-2">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto text-primary" />
                  <p>กำลังดึงข้อมูลผู้ใช้จาก Supabase...</p>
                </div>
              ) : usersError ? (
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>{usersError}</span>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="py-12 text-center text-xs text-muted-foreground bg-muted/20 rounded-xl border border-dashed border-border">
                  <Users className="w-8 h-8 mx-auto opacity-30 mb-2" />
                  <p>ไม่พบผู้ใช้ที่ตรงกับเงื่อนไขการค้นหา</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-border">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-muted/60 border-b border-border text-muted-foreground font-semibold">
                        <th className="p-3.5">ผู้ใช้ (Email / ID)</th>
                        <th className="p-3.5">สิทธิ์ปัจจุบัน (Role)</th>
                        <th className="p-3.5">คลังตัวละคร</th>
                        <th className="p-3.5">วันที่สมัคร / เข้าสู่ระบบ</th>
                        <th className="p-3.5 text-right">ปรับสิทธิ์ด่วน (Action)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {filteredUsers.map((item) => {
                        const isCurrentUpdating = updatingUserId === item.id;
                        const isSelf = user && user.id === item.id;

                        return (
                          <tr
                            key={item.id}
                            className={`hover:bg-muted/30 transition-colors ${
                              isSelf ? 'bg-amber-500/5' : ''
                            }`}
                          >
                            <td className="p-3.5 space-y-1">
                              <div className="font-bold text-foreground flex items-center gap-1.5">
                                <span>{item.email}</span>
                                {isSelf && (
                                  <span className="text-[9px] bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold px-1.5 py-0.2 rounded">
                                    คุณ
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1.5 text-muted-foreground font-mono text-[11px]">
                                <span>{item.id}</span>
                                <button
                                  type="button"
                                  onClick={() => copyToClipboard(item.id)}
                                  title="คัดลอก User ID"
                                  className="hover:text-foreground cursor-pointer"
                                >
                                  {copiedId === item.id ? (
                                    <Check className="w-3 h-3 text-emerald-500" />
                                  ) : (
                                    <Copy className="w-3 h-3" />
                                  )}
                                </button>
                              </div>
                            </td>

                            <td className="p-3.5">
                              {item.role === 'admin' ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-[11px] font-bold">
                                  <Crown className="w-3 h-3" />
                                  ADMIN (∞)
                                </span>
                              ) : item.role === 'premium' ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/30 text-[11px] font-bold">
                                  <Sparkles className="w-3 h-3" />
                                  PREMIUM (50)
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-muted text-muted-foreground border border-border text-[11px] font-medium">
                                  FREE (15)
                                </span>
                              )}
                            </td>

                            <td className="p-3.5 text-foreground font-semibold">
                              {item.characters_count} ตัวละคร
                            </td>

                            <td className="p-3.5 text-muted-foreground text-[11px] space-y-0.5">
                              <div>สร้าง: {new Date(item.created_at).toLocaleDateString('th-TH')}</div>
                              {item.last_sign_in_at && (
                                <div className="text-[10px] opacity-75">
                                  ล่าสุด: {new Date(item.last_sign_in_at).toLocaleDateString('th-TH')}
                                </div>
                              )}
                            </td>

                            <td className="p-3.5 text-right">
                              <div className="inline-flex items-center gap-1">
                                {isCurrentUpdating ? (
                                  <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                                    <RefreshCw className="w-3 h-3 animate-spin" />
                                    กำลังบันทึก...
                                  </span>
                                ) : (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => handleUpdateTargetUserRole(item, 'free')}
                                      disabled={item.role === 'free'}
                                      className="px-2 py-1 rounded-md bg-muted hover:bg-muted/80 text-[11px] font-semibold text-foreground transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                                    >
                                      Free
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleUpdateTargetUserRole(item, 'premium')}
                                      disabled={item.role === 'premium'}
                                      className="px-2.5 py-1 rounded-md bg-rose-500/20 hover:bg-rose-500/30 text-rose-600 dark:text-rose-300 border border-rose-500/30 text-[11px] font-bold transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                                    >
                                      💎 Set Premium
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleUpdateTargetUserRole(item, 'admin')}
                                      disabled={item.role === 'admin'}
                                      className="px-2 py-1 rounded-md bg-amber-500/20 hover:bg-amber-500/30 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-[11px] font-bold transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                                    >
                                      👑 Set Admin
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* GRID SECTION 1: ROLE & QUOTA CONFIGURATION (ADMIN SESSION TOGGLE) */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                สิทธิ์ของเซสชันที่กำลังใช้งาน (Active Browser Session):
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* CARD 1: ADMIN ROLE */}
                <div
                  className={`p-5 rounded-2xl border transition-all space-y-4 ${
                    userRole === 'admin'
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
                  className={`p-5 rounded-2xl border transition-all space-y-4 ${
                    userRole === 'premium'
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
                  className={`p-5 rounded-2xl border transition-all space-y-4 ${
                    userRole === 'free'
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

            {/* SECTION 3: ADMIN INSTRUCTIONS & DIAGNOSTICS MANUAL */}
            <div className="p-6 rounded-2xl bg-card border border-border space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-xl">📖</span>
                <div>
                  <h2 className="text-sm font-bold text-foreground">คู่มือการปรับตั้งค่าระบบหลังบ้าน & วินิจฉัยการชำระเงิน (Admin Manual)</h2>
                  <p className="text-xs text-muted-foreground">วิธีการปรับแต่ง Role, โควตา และสิทธิ์การเข้าถึงผ่านช่องทางต่างๆ</p>
                </div>
              </div>

              <div className="space-y-4 text-xs text-muted-foreground leading-relaxed divide-y divide-border/40">
                {/* Emergency Payment Sync Info */}
                <div className="pt-3 space-y-1.5">
                  <h4 className="font-bold text-amber-500 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center text-[10px]">!</span>
                    สาเหตุที่ผู้ใช้ชำระเงินแล้วสถานะอาจไม่ปรับอัตโนมัติ และวิธีแก้ไข:
                  </h4>
                  <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                    <li>
                      <strong>Stripe Webhook Secret ยังไม่ตั้งค่า:</strong> หากไม่ได้ใส่ <code className="text-foreground bg-muted px-1 rounded font-mono">STRIPE_WEBHOOK_SECRET</code> ในเซิร์ฟเวอร์ Stripe Webhook จะไม่ส่งข้อมูลกลับมา
                    </li>
                    <li>
                      <strong>ชำระเงินในฐานะ Guest (ไม่ได้ล็อกอินก่อนจ่าย):</strong> หากผู้ใช้กดชำระเงินก่อนล็อกอิน ระบบจะไม่มี User ID เชื่อมโยง สามารถแก้ได้ง่ายๆ โดยนำ Email ผู้ใช้มากรอกในกล่อง <em>"ปรับสิทธิ์ด่วนกรณีฉุกเฉิน"</em> ด้านบน
                    </li>
                    <li>
                      <strong>ระบบสำรอง (Verify-Session):</strong> ตอนนี้ระบบได้เพิ่ม Server Verification แล้ว เมื่อผู้ใช้ชำระเงินสำเร็จและกลับมาที่หน้าเว็บ ระบบจะอัปเกรดสถานะให้ทันทีโดยอัตโนมัติ
                    </li>
                  </ul>
                </div>

                {/* Method 1 */}
                <div className="pt-3 space-y-1.5">
                  <h4 className="font-bold text-foreground flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center text-[10px]">1</span>
                    วิธีที่ 1: ปรับสิทธิ์ผ่านตารางผู้ใช้ในหน้านี้ (One-Click Role Switcher)
                  </h4>
                  <p>
                    กดปุ่ม <strong className="text-rose-500">"💎 Set Premium"</strong> หรือ <strong className="text-amber-500">"👑 Set Admin"</strong> ที่ตารางผู้ใช้ด้านบน ระบบจะอัปเดตทั้งใน Supabase Auth Metadata และตารางฐานข้อมูลทันที
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
