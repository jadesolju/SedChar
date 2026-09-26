'use client';
import React from 'react';
import { Sparkles, Plus, Trash2, Shield, MessageSquare, Info } from 'lucide-react';
import type { SubCharacter } from '@/shared/types';

interface CastRulesSectionProps {
  supportingCharacters: SubCharacter[];
  castInteractionRules: string;
  onAddSubChar: (data?: Partial<SubCharacter>) => void;
  onUpdateSubChar: (index: number, data: Partial<SubCharacter>) => void;
  onRemoveSubChar: (index: number) => void;
  onUpdateRules: (rules: string) => void;
}

export function CastRulesSection({
  supportingCharacters,
  castInteractionRules,
  onAddSubChar,
  onUpdateSubChar,
  onRemoveSubChar,
  onUpdateRules,
}: CastRulesSectionProps) {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-border border-b">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
              <span>5. ตัวละครเสริม & กฎฉากรวม (Cast Rules)</span>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                ✨ ไม่จำกัดจำนวน (Unlimited)
              </span>
            </h2>
            <p className="text-xs text-muted-foreground">
              เพิ่มตัวละครเสริม สัตว์เลี้ยง บอร์ดี้การ์ด และกำหนดลำดับการตอบ (Turn-taking) ในฉากที่มีตัวละครหลายคน
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onAddSubChar()}
          className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>เพิ่มตัวละครเสริม (ไม่จำกัด)</span>
        </button>
      </div>

      {/* Cast Interaction & Turn-Taking Rules */}
      <div className="p-4 rounded-2xl border border-border bg-card/60 space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-foreground flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>กติกาการโต้ตอบและลำดับการตอบในฉากรวม (Turn-Taking & Multi-Cast Logic)</span>
          </label>
        </div>
        <textarea
          rows={3}
          value={castInteractionRules}
          onChange={(e) => onUpdateRules(e.target.value)}
          placeholder="- เมื่อกฎชนกัน ให้เรียงลำดับ: การกระทำของผู้เล่น -> เหตุการณ์ -> ตัวละครที่ถูกพูดถึงตรงๆ ตอบก่อน&#10;- ในฉากรวม: จำกัดการตอบรับหลักครั้งละ 1-2 คน เพื่อป้องกันความสับสน"
          className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border focus:border-emerald-500/60 text-xs text-foreground outline-hidden resize-none"
        />
      </div>

      {/* Supporting Characters List (Unlimited) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <span>รายชื่อตัวละครเสริม ({supportingCharacters.length} ตัว)</span>
            <span className="text-[10px] text-emerald-400 font-semibold">• ไม่หักโควตาตัวละครหลัก</span>
          </h3>
        </div>

        {supportingCharacters.length === 0 ? (
          <div className="p-8 rounded-2xl border border-dashed border-border/80 text-center bg-card/30">
            <p className="text-xs text-muted-foreground mb-3">ยังไม่มีตัวละครเสริม (เช่น สัตว์เลี้ยง, พ่อบ้าน, บอดี้การ์ด)</p>
            <button
              type="button"
              onClick={() => onAddSubChar()}
              className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 transition-all cursor-pointer"
            >
              + เพิ่มตัวละครเสริมตัวแรก
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {supportingCharacters.map((sub, idx) => (
              <div
                key={sub.id}
                className="p-3.5 rounded-2xl border border-border bg-card/70 hover:border-emerald-500/40 transition-all space-y-2.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="w-5 h-5 rounded-md bg-emerald-500/15 text-emerald-400 text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                      {idx + 1}
                    </span>
                    <input
                      type="text"
                      value={sub.name}
                      onChange={(e) => onUpdateSubChar(idx, { name: e.target.value })}
                      placeholder="ชื่อตัวละครเสริม เช่น จิงจิง (แมว)..."
                      className="flex-1 px-2.5 py-1 rounded-lg bg-background border border-border text-xs text-foreground font-bold outline-hidden"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => onRemoveSubChar(idx)}
                    className="w-6 h-6 rounded-md hover:bg-rose-500/20 text-muted-foreground hover:text-rose-400 flex items-center justify-center transition-all cursor-pointer"
                    title="ลบตัวละครเสริม"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={sub.gender || ''}
                    onChange={(e) => onUpdateSubChar(idx, { gender: e.target.value })}
                    placeholder="เพศ / ประเภท"
                    className="px-2.5 py-1 rounded-lg bg-background border border-border text-xs text-foreground outline-hidden"
                  />
                  <input
                    type="text"
                    value={sub.age || ''}
                    onChange={(e) => onUpdateSubChar(idx, { age: e.target.value })}
                    placeholder="อายุ"
                    className="px-2.5 py-1 rounded-lg bg-background border border-border text-xs text-foreground outline-hidden"
                  />
                </div>

                <input
                  type="text"
                  value={sub.personality || ''}
                  onChange={(e) => onUpdateSubChar(idx, { personality: e.target.value })}
                  placeholder="นิสัย / พฤติกรรมเด่น..."
                  className="w-full px-2.5 py-1 rounded-lg bg-background border border-border text-xs text-foreground outline-hidden"
                />

                <input
                  type="text"
                  value={sub.relationship || ''}
                  onChange={(e) => onUpdateSubChar(idx, { relationship: e.target.value })}
                  placeholder="ความสัมพันธ์กับตัวละครหลักหรือ User..."
                  className="w-full px-2.5 py-1 rounded-lg bg-background border border-border text-xs text-foreground outline-hidden"
                />

                <input
                  type="text"
                  value={sub.appearWhen || ''}
                  onChange={(e) => onUpdateSubChar(idx, { appearWhen: e.target.value })}
                  placeholder="ปรากฏตัวเมื่อไหร่ (Trigger / Condition)..."
                  className="w-full px-2.5 py-1 rounded-lg bg-background border border-border text-xs text-foreground outline-hidden"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
