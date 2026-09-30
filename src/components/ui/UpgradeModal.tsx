'use client';
import React, { useState } from 'react';
import {
  Sparkles,
  Check,
  CreditCard,
  QrCode,
  ShieldCheck,
  Zap,
  X,
  Lock,
  ArrowRight,
  Loader2,
  FolderOpen,
  Crown,
  Coffee,
  Users,
  Globe,
  FileCode,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultPlan?: 'supporter_29' | 'universe_pro_99';
}

export function UpgradeModal({ isOpen, onClose, defaultPlan = 'universe_pro_99' }: UpgradeModalProps) {
  const { user, userRole } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<'supporter_29' | 'universe_pro_99'>(defaultPlan);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCheckout = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id || null,
          userEmail: user?.email || null,
          plan: selectedPlan,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error || 'ไม่สามารถเริ่มการชำระเงินได้');
      }
      // Redirect to Stripe Hosted Checkout
      window.location.href = data.url;
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ Stripe');
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-xl bg-card border border-border rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden z-10 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex-shrink-0 flex items-start justify-between p-4 sm:px-6 sm:py-4 border-b border-border bg-muted/30">
          <div className="flex items-start gap-2.5 sm:gap-3 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold text-base shadow-xs flex-shrink-0 mt-0.5">
              <Crown className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-bold text-foreground flex items-center gap-2">
                <span>เลือกแพ็กเกจขยายสิทธิ์ SedChar.AI</span>
                <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-muted text-foreground border border-border">
                  LIFETIME UNLOCK
                </span>
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                จ่ายครั้งเดียว ปลดล็อคฟีเจอร์พรีเมียมถาวรโดยไม่มีข้อผูกมัดรายเดือน
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto custom-scrollbar">
          {/* Plan Selector Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Plan 1: Supporter Coffee 29.- */}
            <div
              onClick={() => setSelectedPlan('supporter_29')}
              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                selectedPlan === 'supporter_29'
                  ? 'bg-amber-500/5 border-amber-500 shadow-sm ring-1 ring-amber-500/20'
                  : 'bg-card border-border hover:border-border/80'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 text-[10px] font-bold border border-amber-500/25">
                    <Coffee className="w-3 h-3" />
                    Supporter Pass
                  </span>
                  <span className="text-base font-black text-foreground">29.-</span>
                </div>
                <h4 className="text-sm font-bold text-foreground">เลี้ยงกาแฟ & Premium</h4>
                <ul className="text-[11px] text-muted-foreground space-y-1.5 pt-1">
                  <li className="flex items-start gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>AI Quota 50 ครั้ง / วัน</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Multi-Char Studio สูงสุด 10 ตัว</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>คลังโปรเจกต์ไม่จำกัด</span>
                  </li>
                </ul>
              </div>
              <div className="text-[10px] font-bold text-amber-600 dark:text-amber-400">
                จ่ายครั้งเดียว • 29 บาท
              </div>
            </div>

            {/* Plan 2: Universe Studio Pro 99.- (Featured) */}
            <div
              onClick={() => setSelectedPlan('universe_pro_99')}
              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between space-y-3 relative overflow-hidden ${
                selectedPlan === 'universe_pro_99'
                  ? 'bg-purple-500/5 border-purple-500 shadow-sm ring-1 ring-purple-500/20'
                  : 'bg-card border-border hover:border-border/80'
              }`}
            >
              <div className="absolute top-0 right-0 px-2.5 py-0.5 rounded-bl-xl bg-purple-600 text-[9px] font-bold text-white uppercase tracking-wider">
                แนะนำคุ้มสุด
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/15 text-purple-700 dark:text-purple-300 text-[10px] font-bold border border-purple-500/25">
                    <Crown className="w-3 h-3 text-amber-400" />
                    Universe Pro
                  </span>
                  <span className="text-base font-black text-foreground">99.-</span>
                </div>
                <h4 className="text-sm font-bold text-foreground">Universe Studio ตลอดชีพ</h4>
                <ul className="text-[11px] text-muted-foreground space-y-1.5 pt-1">
                  <li className="flex items-start gap-1.5 text-foreground font-semibold">
                    <Sparkles className="w-3.5 h-3.5 text-purple-500 shrink-0 mt-0.5" />
                    <span>Universal Multi-Parser ไม่จำกัด</span>
                  </li>
                  <li className="flex items-start gap-1.5 text-foreground font-semibold">
                    <Globe className="w-3.5 h-3.5 text-purple-500 shrink-0 mt-0.5" />
                    <span>AI ช่วยเติมส่วนที่ขาด World/Lore/Cast</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>AI Quota 100 ครั้ง / วัน</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>ปลดล็อคคลังจักรวาลตลอดชีพ</span>
                  </li>
                </ul>
              </div>
              <div className="text-[10px] font-bold text-purple-600 dark:text-purple-400">
                จ่ายครั้งเดียวตลอดชีพ • 99 บาท
              </div>
            </div>
          </div>

          {/* Payment Methods Supported Badges */}
          <div className="p-3 rounded-xl bg-muted/40 border border-border space-y-2">
            <div className="text-[11px] font-bold text-muted-foreground flex items-center justify-between">
              <span>ช่องทางชำระเงินที่รองรับ:</span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <Lock className="w-3 h-3" />
                <span>ความปลอดภัยระดับ Stripe 256-bit</span>
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded-lg bg-card border border-border flex items-center gap-2 font-medium text-foreground">
                <QrCode className="w-4 h-4 text-purple-500" />
                <span>สแกน QR พร้อมเพย์ (PromptPay)</span>
              </div>
              <div className="p-2 rounded-lg bg-card border border-border flex items-center gap-2 font-medium text-foreground">
                <CreditCard className="w-4 h-4 text-blue-500" />
                <span>บัตรเครดิต / เดบิต</span>
              </div>
            </div>
          </div>

          {/* Error Message if any */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs leading-relaxed">
              {errorMsg}
            </div>
          )}

          {/* Checkout Button — Minimal + Aesthetic Solid */}
          <button
            type="button"
            onClick={handleCheckout}
            disabled={isLoading || userRole === 'admin'}
            className="w-full py-3.5 rounded-xl bg-foreground hover:bg-foreground/90 text-background font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>กำลังเชื่อมต่อไปยัง Stripe...</span>
              </>
            ) : userRole === 'admin' ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>คุณมีสิทธิ์ Admin สูงสุดอยู่แล้ว</span>
              </>
            ) : (
              <>
                <span>
                  ชำระเงิน {selectedPlan === 'universe_pro_99' ? '99 บาท (Universe Pro)' : '29 บาท (Supporter)'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Discord Community & Support Box */}
          <div className="p-3 sm:p-3.5 rounded-xl bg-[#5865F2]/10 border border-[#5865F2]/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-[#5865F2] text-white flex items-center justify-center shrink-0 shadow-xs">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <span>มีข้อสงสัยหรือต้องการสอบถาม?</span>
                </div>
                <div className="text-[11px] text-muted-foreground">
                  พูดคุย สอบถามปัญหา หรือแจ้งการชำระเงินได้ที่ Discord
                </div>
              </div>
            </div>
            <a
              href="https://discord.gg/XRgKZ8kWzv"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-3 py-1.5 rounded-lg bg-[#5865F2] hover:bg-[#4752C4] text-white text-xs font-bold transition-colors shrink-0 flex items-center justify-center gap-1.5 shadow-xs"
            >
              <span>เข้าร่วม Discord</span>
              <ArrowRight className="w-3 h-3" />
            </a>
          </div>

          <p className="text-[10px] text-center text-muted-foreground">
            ชำระครั้งเดียว ปลดล็อคสิทธิ์ทันทีโดยไม่มีข้อผูกมัดรายเดือน ขอบคุณทุกการสนับสนุนครับ ❤️
          </p>
        </div>
      </div>
    </div>
  );
}
