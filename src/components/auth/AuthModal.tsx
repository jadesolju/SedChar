'use client';
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

export function AuthModal() {
  const {
    isAuthModalOpen,
    closeAuthModal,
    signInWithGoogle,
    signInWithDiscord,
    signInWithEmail,
    signUpWithEmail,
    resetPassword,
  } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup' | 'reset'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (mode === 'signin') {
        const { error } = await signInWithEmail(email, password);
        if (error) {
          setErrorMsg(error.message || 'อีเมลหรือรหัสผ่านไม่ถูกต้อง');
        } else {
          closeAuthModal();
        }
      } else if (mode === 'signup') {
        if (password !== confirmPassword) {
          setErrorMsg('รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน');
          setLoading(false);
          return;
        }
        if (password.length < 6) {
          setErrorMsg('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
          setLoading(false);
          return;
        }
        const { error, data } = await signUpWithEmail(email, password);
        if (error) {
          setErrorMsg(error.message || 'สมัครสมาชิกไม่สำเร็จ กรุณาลองใหม่อีกครั้ง');
        } else {
          if (data.session) {
            setSuccessMsg('สมัครสมาชิกสำเร็จ เข้าสู่ระบบเรียบร้อย!');
            setTimeout(() => closeAuthModal(), 1000);
          } else {
            setSuccessMsg('ส่งอีเมลยืนยันการสมัครแล้ว กรุณาตรวจสอบกล่องข้อความของคุณ');
          }
        }
      } else if (mode === 'reset') {
        const { error } = await resetPassword(email);
        if (error) {
          setErrorMsg(error.message || 'ไม่สามารถส่งอีเมลรีเซ็ตรหัสผ่านได้');
        } else {
          setSuccessMsg('ส่งลิงก์ตั้งรหัสผ่านใหม่ไปยังอีเมลของคุณเรียบร้อยแล้ว');
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider: 'google' | 'discord') => {
    setErrorMsg('');
    setLoading(true);
    try {
      if (provider === 'google') await signInWithGoogle();
      if (provider === 'discord') await signInWithDiscord();
    } catch (err: any) {
      setErrorMsg(err.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ OAuth');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md p-6 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
        {/* Glow accent */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-rose-500/15 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-pink-500/15 rounded-full blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          type="button"
          onClick={closeAuthModal}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Header Badge */}
        <div className="flex items-center gap-2 mb-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-rose-600 to-pink-500 flex items-center justify-center text-white font-bold text-xs shadow-xs">
            S
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-primary">SedChar.AI Member</span>
        </div>

        <h2 className="text-xl font-bold tracking-tight text-foreground">
          {mode === 'signin' && 'เข้าสู่ระบบ'}
          {mode === 'signup' && 'สมัครสมาชิกใหม่'}
          {mode === 'reset' && 'รีเซ็ตรหัสผ่าน'}
        </h2>
        <p className="text-xs text-muted-foreground mt-1 mb-5">
          {mode === 'signin' && 'เข้าสู่ระบบเพื่อใช้งาน Auto-Parser 5 ครั้ง/วัน และจัดเก็บตัวละครลง Cloud Library'}
          {mode === 'signup' && 'สร้างบัญชีเพื่อบันทึกตัวละครและปลดล็อกโควตา AI รายวัน'}
          {mode === 'reset' && 'กรอกอีเมลของคุณเพื่อรับลิงก์สำหรับตั้งรหัสผ่านใหม่'}
        </p>

        {/* OAuth Buttons */}
        {mode !== 'reset' && (
          <div className="grid grid-cols-2 gap-2.5 mb-5">
            <button
              type="button"
              onClick={() => handleOAuth('google')}
              disabled={loading}
              className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-border bg-muted/60 hover:bg-muted text-xs font-semibold transition-all cursor-pointer shadow-xs disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"/>
                <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"/>
                <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.8 0-1.3.2-2.1.4-2.8L1.9 6.3C.7 8.7 0 10.3 0 12s.7 3.3 1.9 5.7l3.7-2.9z"/>
                <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16c1.8 3.7 5.6 7 10.1 7z"/>
              </svg>
              <span>Google</span>
            </button>

            <button
              type="button"
              onClick={() => handleOAuth('discord')}
              disabled={loading}
              className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-border bg-[#5865F2]/10 hover:bg-[#5865F2]/20 text-[#5865F2] text-xs font-semibold transition-all cursor-pointer shadow-xs disabled:opacity-50"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.093.252-.19.372-.287a.075.075 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.194.373.287a.077.077 0 0 1-.007.128 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
              </svg>
              <span>Discord</span>
            </button>
          </div>
        )}

        {mode !== 'reset' && (
          <div className="relative flex items-center justify-center my-4">
            <div className="border-t border-border w-full" />
            <span className="bg-card px-3 text-[11px] uppercase tracking-wider text-muted-foreground absolute font-medium">
              หรือด้วยอีเมล
            </span>
          </div>
        )}

        {/* Error & Success Alerts */}
        {errorMsg && (
          <div className="p-3 mb-4 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-500 text-xs flex items-center gap-2">
            <span>⚠️</span>
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 mb-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-500 text-xs flex items-center gap-2">
            <span>✅</span>
            <span>{successMsg}</span>
          </div>
        )}

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">อีเมล</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full px-3.5 py-2 rounded-xl bg-[#1F1F24] border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>

          {mode !== 'reset' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-foreground">รหัสผ่าน</label>
                {mode === 'signin' && (
                  <button
                    type="button"
                    onClick={() => { setMode('reset'); setErrorMsg(''); setSuccessMsg(''); }}
                    className="text-[11px] text-primary hover:underline cursor-pointer"
                  >
                    ลืมรหัสผ่าน?
                  </button>
                )}
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2 rounded-xl bg-[#1F1F24] border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>
          )}

          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">ยืนยันรหัสผ่าน</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2 rounded-xl bg-[#1F1F24] border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 hover:from-rose-600 hover:to-pink-700 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-[0.99] cursor-pointer disabled:opacity-50"
          >
            {loading ? 'กำลังประมวลผล...' : (
              mode === 'signin' ? 'เข้าสู่ระบบ' :
              mode === 'signup' ? 'สร้างบัญชีผู้ใช้' :
              'ส่งลิงก์รีเซ็ตรหัสผ่าน'
            )}
          </button>
        </form>

        {/* Mode Switch Footer */}
        <div className="mt-5 text-center text-xs text-muted-foreground">
          {mode === 'signin' && (
            <p>
              ยังไม่มีบัญชี?{' '}
              <button
                type="button"
                onClick={() => { setMode('signup'); setErrorMsg(''); setSuccessMsg(''); }}
                className="font-semibold text-primary hover:underline cursor-pointer"
              >
                สมัครสมาชิกฟรี
              </button>
            </p>
          )}
          {mode === 'signup' && (
            <p>
              มีบัญชีอยู่แล้ว?{' '}
              <button
                type="button"
                onClick={() => { setMode('signin'); setErrorMsg(''); setSuccessMsg(''); }}
                className="font-semibold text-primary hover:underline cursor-pointer"
              >
                เข้าสู่ระบบ
              </button>
            </p>
          )}
          {mode === 'reset' && (
            <p>
              จำรหัสผ่านได้แล้ว?{' '}
              <button
                type="button"
                onClick={() => { setMode('signin'); setErrorMsg(''); setSuccessMsg(''); }}
                className="font-semibold text-primary hover:underline cursor-pointer"
              >
                กลับไปหน้าเข้าสู่ระบบ
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
