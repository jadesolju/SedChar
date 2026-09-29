'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth, ROLE_QUOTA_MAP, type UserRole } from '@/context/AuthContext';
import Link from 'next/link';
import {
  Crown,
  Sparkles,
  Zap,
  Users,
  Search,
  RefreshCw,
  Copy,
  Check,
  Flame,
  Info,
  UserCheck,
  CheckCircle2,
  Shield,
  ArrowRight,
  UserPlus,
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

  const [roleUpdatedToast, setRoleUpdatedToast] = useState<string | null>(null);

  // Users Directory State
  const [usersList, setUsersList] = useState<SystemUserRecord[]>([]);
  const [isUsersLoading, setIsUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [hasServiceRole, setHasServiceRole] = useState<boolean>(true);
  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'premium' | 'free'>('all');
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Emergency Direct UID / Email Role Modifier Form
  const [emergencyInput, setEmergencyInput] = useState('');
  const [emergencyTargetRole, setEmergencyTargetRole] = useState<UserRole>('premium');
  const [isEmergencySubmitting, setIsEmergencySubmitting] = useState(false);
  const [lastAdjustedUser, setLastAdjustedUser] = useState<{ query: string; role: UserRole } | null>(null);

  const showToast = (msg: string) => {
    setRoleUpdatedToast(msg);
    setTimeout(() => {
      setRoleUpdatedToast((prev) => (prev === msg ? null : prev));
    }, 4500);
  };

  // Fetch Users List from Admin API
  const fetchUsersList = useCallback(async () => {
    setIsUsersLoading(true);
    setUsersError(null);
    try {
      const res = await fetch('/api/admin/users', {
        headers: {
          'x-admin-passcode': 'sedchar-master-2026',
        },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'ไม่สามารถดึงรายชื่อผู้ใช้ได้');
      }

      let fetched: SystemUserRecord[] = data.users || [];
      setHasServiceRole(Boolean(data.hasServiceRole));

      // Always include and synchronize current logged-in user in list
      if (user) {
        const foundIndex = fetched.findIndex(
          (u) => u.id === user.id || (user.email && u.email.toLowerCase() === user.email.toLowerCase())
        );

        if (foundIndex !== -1 && fetched[foundIndex]) {
          fetched[foundIndex] = {
            ...fetched[foundIndex],
            email: user.email || fetched[foundIndex].email,
            role: userRole || fetched[foundIndex].role,
            characters_count: Math.max(fetched[foundIndex].characters_count, savedCharacters.length),
          };
        } else {
          fetched = [
            {
              id: user.id,
              email: user.email || 'Current Account',
              role: userRole,
              created_at: user.created_at || new Date().toISOString(),
              last_sign_in_at: user.last_sign_in_at || null,
              characters_count: savedCharacters.length,
            },
            ...fetched,
          ];
        }
      }

      setUsersList(fetched);
    } catch (err: any) {
      console.error('Fetch users error:', err);
      setUsersError(err.message || 'เกิดข้อผิดพลาดในการโหลดรายชื่อผู้ใช้');

      // Fallback: If network/API error, at least show current user
      if (user) {
        setUsersList([
          {
            id: user.id,
            email: user.email || 'Current Account',
            role: userRole,
            created_at: user.created_at || new Date().toISOString(),
            last_sign_in_at: user.last_sign_in_at || null,
            characters_count: savedCharacters.length,
          },
        ]);
      }
    } finally {
      setIsUsersLoading(false);
    }
  }, [user, userRole, savedCharacters.length]);

  // Load users automatically on mount
  useEffect(() => {
    fetchUsersList();
  }, [fetchUsersList]);

  // Adjust role for the current admin's own session
  const handleRoleChange = async (newRole: UserRole) => {
    await setUserRole(newRole);
    setUsersList((prev) =>
      prev.map((u) => (user && u.id === user.id ? { ...u, role: newRole } : u))
    );
    showToast(
      `✓ สลับสิทธิ์ของคุณเป็น [${newRole.toUpperCase()}] — โควตา AI: ${
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
          'x-admin-passcode': 'sedchar-master-2026',
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
      alert('กรุณากรอก Email หรือ User ID (UID) ของผู้ใช้');
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
          'x-admin-passcode': 'sedchar-master-2026',
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'ไม่สามารถปรับสิทธิ์ได้');
      }

      setLastAdjustedUser({ query, role: emergencyTargetRole });
      showToast(`⚡ ปรับสิทธิ์สำเร็จ! [${query}] ได้รับสิทธิ์ ${emergencyTargetRole.toUpperCase()} เรียบร้อย`);
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
                LIVE ADMIN CONSOLE
              </span>
            </div>
            <p className="text-xs text-muted-foreground">ระบบตรวจสอบผู้ใช้, กรอก UID/Email และปรับ Role ทันที</p>
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
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-8 space-y-8 animate-in fade-in">
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

        {/* SECTION 1: EMERGENCY DIRECT ROLE OVERRIDE BY UID / EMAIL */}
        <div className="p-6 rounded-2xl bg-gradient-to-tr from-amber-500/15 via-rose-500/10 to-purple-500/15 border-2 border-amber-500/40 space-y-4 shadow-lg">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-amber-500/20 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500 text-black flex items-center justify-center font-black shadow-sm">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-black text-foreground flex items-center gap-2">
                  <span>⚡ กรอก UID หรือ Email เพื่อปรับ Role ทันที</span>
                  <span className="text-[10px] bg-rose-500 text-white font-bold px-2 py-0.5 rounded-full">
                    แก้ปัญหาด่วน 1-Click
                  </span>
                </h2>
                <p className="text-xs text-muted-foreground">
                  พิมพ์ Email หรือ Supabase User ID (UUID) ของผู้ใช้ แล้วกดปรับ Role เพื่ออัปเกรดสถานะให้ผู้ใช้ได้ทันที
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleEmergencySubmit} className="space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={emergencyInput}
                  onChange={(e) => setEmergencyInput(e.target.value)}
                  placeholder="กรอก Email ผู้ใช้ (เช่น user@gmail.com) หรือ Supabase UID"
                  className="w-full pl-9 pr-4 py-3 rounded-xl bg-card border border-border text-xs sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/50 shadow-inner font-mono"
                />
                <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-3.5" />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={emergencyTargetRole}
                  onChange={(e) => setEmergencyTargetRole(e.target.value as UserRole)}
                  className="px-3 py-3 rounded-xl bg-card border border-border text-xs sm:text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/50 shadow-xs cursor-pointer"
                >
                  <option value="premium">💎 Premium (50 ครั้ง/วัน)</option>
                  <option value="admin">👑 Admin (∞ ไม่จำกัด)</option>
                  <option value="free">🌱 Free (15 ครั้ง/วัน)</option>
                </select>

                <button
                  type="submit"
                  disabled={isEmergencySubmitting || !emergencyInput.trim()}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-rose-500 to-pink-600 hover:from-amber-600 hover:via-rose-600 hover:to-pink-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer whitespace-nowrap disabled:opacity-50 flex items-center justify-center gap-2 active:scale-98"
                >
                  {isEmergencySubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>กำลังบันทึก...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      <span>⚡ ปรับ Role ทันที</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {lastAdjustedUser && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>
                  ล่าสุด: ได้ทำการปรับสิทธิ์ <strong>{lastAdjustedUser.query}</strong> เป็น <strong>[{lastAdjustedUser.role.toUpperCase()}]</strong> เรียบร้อยแล้ว
                </span>
              </div>
            )}
          </form>
        </div>

        {/* SECTION 2: REGISTERED USERS LIVE DIRECTORY (ตารางรายชื่อผู้ใช้ทั้งหมด) */}
        <div className="p-6 rounded-2xl bg-card border border-border space-y-5 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <span>👥 ตารางรายชื่อผู้ใช้ทั้งหมดในระบบ (Live Users Directory)</span>
                  <span className="text-[10px] bg-muted px-2 py-0.5 rounded-full font-mono text-muted-foreground font-bold">
                    {filteredUsers.length} / {usersList.length} ผู้ใช้
                  </span>
                </h2>
                <p className="text-xs text-muted-foreground">
                  ตรวจสอบสถานะ Role ปัจจุบัน และคลิกปุ่มด้านขวาเพื่อสลับสิทธิ์ได้ทันที
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={fetchUsersList}
                disabled={isUsersLoading}
                className="px-4 py-2 rounded-xl bg-muted hover:bg-muted/80 text-xs font-semibold text-foreground transition-colors cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50 w-full sm:w-auto"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isUsersLoading ? 'animate-spin' : ''}`} />
                <span>รีเฟรชรายชื่อ</span>
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
                placeholder="พิมพ์ค้นหาด้วย Email หรือ User ID..."
                className="w-full pl-9 pr-8 py-2.5 rounded-xl bg-muted/40 border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-3" />
              {userSearch && (
                <button
                  type="button"
                  onClick={() => setUserSearch('')}
                  className="absolute right-3 top-2.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              <button
                type="button"
                onClick={() => setRoleFilter('all')}
                className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
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
                className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
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
                className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
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
                className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
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
              <p>กำลังดึงข้อมูลผู้ใช้จากฐานข้อมูล...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="py-12 text-center text-xs text-muted-foreground bg-muted/20 rounded-xl border border-dashed border-border space-y-2">
              <Users className="w-8 h-8 mx-auto opacity-30" />
              <p>ไม่พบรายชื่อผู้ใช้ที่ค้นหา</p>
              <p className="text-[11px] opacity-75">
                คุณสามารถใช้กล่อง <strong>"⚡ กรอก UID หรือ Email เพื่อปรับ Role ทันที"</strong> ด้านบน เพื่อพิมพ์ Email หรือ ID ปรับสิทธิ์ได้ทันที
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-muted/60 border-b border-border text-muted-foreground font-semibold">
                    <th className="p-3.5">ผู้ใช้ (Email / UID)</th>
                    <th className="p-3.5">สิทธิ์ปัจจุบัน (Role)</th>
                    <th className="p-3.5">คลังตัวละคร</th>
                    <th className="p-3.5">วันที่สมัคร / เข้าใช้งาน</th>
                    <th className="p-3.5 text-right">ปรับ Role ทันที (One-Click Action)</th>
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
                          <div className="inline-flex items-center gap-1.5">
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
                                  className="px-2.5 py-1.5 rounded-lg bg-muted hover:bg-muted/80 text-[11px] font-semibold text-foreground transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                  Free
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateTargetUserRole(item, 'premium')}
                                  disabled={item.role === 'premium'}
                                  className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-600 dark:text-rose-300 border border-rose-500/30 text-[11px] font-bold transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed shadow-xs"
                                >
                                  💎 Set Premium
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateTargetUserRole(item, 'admin')}
                                  disabled={item.role === 'admin'}
                                  className="px-2.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-[11px] font-bold transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
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

        {/* SECTION 3: ROLE & QUOTA CONFIGURATION (ADMIN SESSION TOGGLE) */}
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

        {/* SECTION 4: LIVE ACCOUNT & QUOTA MONITOR */}
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
