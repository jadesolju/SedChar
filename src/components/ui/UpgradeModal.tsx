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
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UpgradeModal({ isOpen, onClose }: UpgradeModalProps) {
  const { user, userRole } = useAuth();
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

      <div className="relative w-full max-w-lg bg-card border border-border rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden z-10 animate-in zoom-in-95 duration-150">
        {/* Header (2-Row on Mobile per DESIGN.md) */}
        <div className="flex-shrink-0 flex items-start justify-between p-4 sm:px-6 sm:py-3.5 border-b border-border bg-muted/30">
          <div className="flex items-start gap-2.5 sm:gap-3 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-500 to-pink-600 text-white flex items-center justify-center font-bold text-base shadow-xs flex-shrink-0 mt-0.5">
              <Crown className="w-4 h-4 text-amber-300" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-bold text-foreground flex items-center gap-2">
                <span>SedChar Creator Premium</span>
                <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-rose-500 text-white">
                  PROMO 29.-
                </span>
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                ปลดล็อกขีดจำกัดการสร้างและบริหารคาแรคเตอร์ AI ระดับมืออาชีพ
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
          {/* Cute Hero Visual with Mascot Image */}
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-tr from-rose-500/20 via-pink-500/10 to-purple-500/20 border border-rose-500/30 p-4 sm:p-5 flex items-center justify-between gap-3 shadow-inner">
            <div className="flex-1 min-w-0 z-10">
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-bold shadow-xs">
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span>SPECIAL PROMOTION</span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-foreground mt-1.5 leading-tight">
                ปลดล็อกพลังเต็มขั้น <br />
                <span className="bg-gradient-to-r from-rose-500 via-pink-600 to-purple-600 bg-clip-text text-transparent">
                  SedChar Premium
                </span>
              </h3>
              <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                สร้างคาแรคเตอร์ได้ไม่สะดุด พร้อมระบบประมวลผลความเร็วสูง
              </p>
            </div>

            {/* Mascot Image */}
            <div className="relative w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 flex items-center justify-center">
              <img
                src="/premium-mascot.png"
                alt="SedChar Premium Mascot"
                className="w-full h-full object-contain drop-shadow-xl hover:scale-105 transition-transform duration-300"
              />
            </div>
          </div>

          {/* Price Box */}
          <div className="p-3.5 rounded-2xl bg-card border border-border flex items-center justify-between">
            <div>
              <div className="text-[10px] font-bold text-rose-700 dark:text-rose-300 uppercase tracking-wider">
                ราคาโปรโมชั่นพิเศษ (ชำระครั้งเดียว)
              </div>
              <div className="text-2xl sm:text-3xl font-black text-foreground mt-0.5 flex items-baseline gap-1.5">
                <span className="text-rose-600 dark:text-rose-400">฿29</span>
                <span className="text-xs font-normal text-muted-foreground line-through">฿199</span>
                <span className="text-xs font-medium text-muted-foreground">/ ตลอดชีพ</span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] px-2 py-1 rounded-lg bg-rose-500/10 text-rose-700 dark:text-rose-300 font-bold border border-rose-500/20 inline-block">
                ประหยัด 85%
              </span>
            </div>
          </div>

          {/* Features Comparison List */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-foreground uppercase tracking-wider">
              สิทธิพิเศษที่คุณจะได้รับทันที:
            </div>

            <div className="space-y-2 text-xs text-foreground">
              <div className="flex items-start gap-2.5 p-2 rounded-xl bg-card border border-border">
                <Zap className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">AI Auto-Enhance 50 ครั้ง/วัน</span>
                  <span className="text-muted-foreground text-[11px] block">
                    (จากเดิม 15 ครั้ง/วัน ในแผน Free) ให้คุณปรับแต่งและเจนเนอเรทบอทได้ต่อเนื่อง
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2 rounded-xl bg-card border border-border">
                <FolderOpen className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">คลังโปรเจกต์ & บอทไม่จำกัด</span>
                  <span className="text-muted-foreground text-[11px] block">
                    บันทึกและสลับโปรเจกต์ Multi-Char และ Single-Char ในคลังได้ไม่จำกัดจำนวน
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2 rounded-xl bg-card border border-border">
                <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">สถานะ Premium Badge & ประมวลผลความเร็วสูง</span>
                  <span className="text-muted-foreground text-[11px] block">
                    เข้าถึงคิวเซิร์ฟเวอร์ลำดับความสำคัญสูง ประมวลผลรวดเร็วและแม่นยำ
                  </span>
                </div>
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
                <CreditCard className="w-4 h-4 text-blue-500" />
                <span>บัตรเครดิต / เดบิต</span>
              </div>
              <div className="p-2 rounded-lg bg-card border border-border flex items-center gap-2 font-medium text-foreground">
                <QrCode className="w-4 h-4 text-purple-500" />
                <span>สแกน QR พร้อมเพย์</span>
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
            disabled={isLoading || userRole === 'premium' || userRole === 'admin'}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>กำลังเชื่อมต่อไปยัง Stripe...</span>
              </>
            ) : userRole === 'premium' || userRole === 'admin' ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span>คุณมีสถานะ Premium / Admin อยู่แล้ว</span>
              </>
            ) : (
              <>
                <span>ชำระเงิน 29 บาท (บัตร หรือ PromptPay)</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <p className="text-[10px] text-center text-muted-foreground">
            ชำระครั้งเดียว ปลดล็อกสิทธิ์ทันทีโดยไม่มีข้อผูกมัดรายเดือน
          </p>
        </div>
      </div>
    </div>
  );
}
