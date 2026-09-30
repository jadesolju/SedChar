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
        <div className="flex-shrink-0 flex items-start justify-between p-4 sm:px-6 sm:py-3.5 border-b border-border bg-muted/30">
          <div className="flex items-start gap-2.5 sm:gap-3 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center font-bold text-base shadow-xs flex-shrink-0 mt-0.5">
              <Crown className="w-4 h-4 text-amber-300" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-bold text-foreground flex items-center gap-2">
                <span>เลือกแพ็กเกจขยายสิทธิ์ SedChar.AI</span>
                <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/30">
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
                  ? 'bg-amber-500/10 border-amber-500 shadow-md'
                  : 'bg-card border-border hover:border-border/80'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 text-[10px] font-bold">
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
                  ? 'bg-purple-500/10 border-purple-500 shadow-lg ring-2 ring-purple-500/20'
                  : 'bg-card border-border hover:border-border/80'
              }`}
            >
              <div className="absolute top-0 right-0 px-2 py-0.5 rounded-bl-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-[9px] font-bold text-white uppercase tracking-wider">
                แนะนำคุ้มสุด
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-700 dark:text-purple-300 text-[10px] font-bold">
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

          {/* Checkout Button */}
          <button
            type="button"
            onClick={handleCheckout}
            disabled={isLoading || userRole === 'admin'}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-rose-600 hover:from-purple-500 hover:via-indigo-500 hover:to-rose-500 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>กำลังเชื่อมต่อไปยัง Stripe...</span>
              </>
            ) : userRole === 'admin' ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
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

          <p className="text-[10px] text-center text-muted-foreground">
            ชำระครั้งเดียว ปลดล็อคสิทธิ์ทันทีโดยไม่มีข้อผูกมัดรายเดือน ขอบคุณทุกการสนับสนุนครับ ❤️
          </p>
        </div>
      </div>
    </div>
  );
}
