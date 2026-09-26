'use client';
import React from 'react';
import {
  BookOpen,
  Clock,
  Lock,
  Unlock,
  Plus,
  Trash2,
  AlertCircle,
  Swords,
  Megaphone,
  Sparkles,
} from 'lucide-react';
import type { LoreDraft, LoreTimelineItem, MainCharacterDraft } from '@/shared/multiCharTypes';

interface LoreTimelineSectionProps {
  lore: LoreDraft;
  mainCharacters: MainCharacterDraft[];
  onUpdateLore: <K extends keyof LoreDraft>(key: K, value: LoreDraft[K]) => void;
  onAddEvent: (event?: Partial<LoreTimelineItem>) => void;
  onUpdateEvent: (index: number, event: Partial<LoreTimelineItem>) => void;
  onRemoveEvent: (index: number) => void;
}

export function LoreTimelineSection({
  lore,
  mainCharacters,
  onUpdateLore,
  onAddEvent,
  onUpdateEvent,
  onRemoveEvent,
}: LoreTimelineSectionProps) {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 flex-shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
              <span>2. Lore & Timeline (ภูมิหลังและไทม์ไลน์)</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 font-bold">
                Narrative Backbone
              </span>
            </h2>
            <p className="text-xs text-muted-foreground">
              วางประวัติศาสตร์ ลำดับเหตุการณ์ก่อนหลัง ข้อมูลความลับเฉพาะตัว และข้อห้ามของเรื่อง
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onAddEvent()}
          className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>เพิ่มเหตุการณ์ (Timeline Event)</span>
        </button>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>ภูมิหลังและประวัติศาสตร์ของเรื่อง (World Backstory)</span>
            </label>
            <textarea
              rows={3}
              value={lore.worldBackstory}
              onChange={(e) => onUpdateLore('worldBackstory', e.target.value)}
              placeholder="จุดเริ่มต้นของโลก หรือเหตุการณ์ใหญ่ในอดีตที่ส่งผลถึงปัจจุบัน..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-card border border-border focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20 text-xs text-foreground transition-all outline-hidden resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Swords className="w-3.5 h-3.5 text-rose-500" />
              <span>ความขัดแย้งหลัก (Core Conflict)</span>
            </label>
            <textarea
              rows={3}
              value={lore.coreConflict}
              onChange={(e) => onUpdateLore('coreConflict', e.target.value)}
              placeholder="จุดขัดแย้งหรือเป้าหมายที่ทำให้ตัวละครต้องเข้ามาพัวพันกัน..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-card border border-border focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20 text-xs text-foreground transition-all outline-hidden resize-none"
            />
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <span>ลำดับไทม์ไลน์เหตุการณ์สำคัญ ({lore.timelineEvents.length} เหตุการณ์)</span>
          </h3>

          {lore.timelineEvents.length === 0 ? (
            <div className="p-6 rounded-2xl border border-dashed border-border/80 text-center bg-card/30">
              <p className="text-xs text-muted-foreground mb-3">ยังไม่มีเหตุการณ์ในไทม์ไลน์</p>
              <button
                type="button"
                onClick={() => onAddEvent()}
                className="px-3 py-1.5 rounded-lg bg-muted text-xs font-semibold hover:bg-muted/80 text-foreground transition-all cursor-pointer"
              >
                + สร้างเหตุการณ์แรก
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {lore.timelineEvents.map((event, idx) => (
                <div
                  key={event.id}
                  className="p-3.5 rounded-2xl border border-border bg-card/60 hover:border-amber-500/40 transition-all space-y-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs font-bold flex items-center justify-center flex-shrink-0">
                        {idx + 1}
                      </span>
                      <input
                        type="text"
                        value={event.timeLabel}
                        onChange={(e) => onUpdateEvent(idx, { timeLabel: e.target.value })}
                        placeholder="ช่วงเวลา เช่น 5 ปีก่อน / ปัจจุบัน..."
                        className="w-32 sm:w-44 px-2.5 py-1 rounded-lg bg-muted/60 border border-border text-xs text-foreground outline-hidden font-medium"
                      />
                      <input
                        type="text"
                        value={event.eventTitle}
                        onChange={(e) => onUpdateEvent(idx, { eventTitle: e.target.value })}
                        placeholder="ชื่อเหตุการณ์สำคัญ..."
                        className="flex-1 px-2.5 py-1 rounded-lg bg-muted/60 border border-border text-xs text-foreground outline-hidden font-semibold"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onUpdateEvent(idx, { isSecret: !event.isSecret })}
                        className={"px-2 py-1 rounded-lg text-[10px] font-bold border flex items-center gap-1 transition-all cursor-pointer " + (event.isSecret ? "bg-rose-500/10 border-rose-500/40 text-rose-700 dark:text-rose-300" : "bg-muted border-border text-muted-foreground")}
                        title={event.isSecret ? 'ข้อมูลลับเฉพาะตัวละครที่ระบุ' : 'ข้อมูลที่ทุกคนรู้'}
                      >
                        {event.isSecret ? <Lock className="w-3 h-3 text-rose-500" /> : <Unlock className="w-3 h-3" />}
                        <span>{event.isSecret ? 'ความลับ' : 'ทั่วไป'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onRemoveEvent(idx)}
                        className="w-7 h-7 rounded-lg hover:bg-rose-500/20 text-muted-foreground hover:text-rose-600 dark:hover:text-rose-400 flex items-center justify-center transition-all cursor-pointer"
                        title="ลบเหตุการณ์"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <textarea
                    rows={2}
                    value={event.description}
                    onChange={(e) => onUpdateEvent(idx, { description: e.target.value })}
                    placeholder="รายละเอียดของเหตุการณ์นี้ และผลกระทบต่อเรื่องราว..."
                    className="w-full px-3 py-2 rounded-xl bg-background/80 border border-border/80 focus:border-amber-500/50 text-xs text-foreground transition-all outline-hidden resize-none"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Megaphone className="w-3.5 h-3.5 text-amber-500" />
              <span>สิ่งที่คนทั่วไปในเรื่องรู้ร่วมกัน (Common Knowledge)</span>
            </label>
            <textarea
              rows={2}
              value={lore.commonKnowledge}
              onChange={(e) => onUpdateLore('commonKnowledge', e.target.value)}
              placeholder="ข้อเท็จจริงสาธารณะ เช่น ใครเป็นผู้นำองค์กร..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-card border border-border focus:border-amber-500/60 text-xs text-foreground transition-all outline-hidden resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
              <span>ข้อห้าม / ความเชื่อต้องห้าม (Taboos & Myths)</span>
            </label>
            <textarea
              rows={2}
              value={lore.taboosOrMyths}
              onChange={(e) => onUpdateLore('taboosOrMyths', e.target.value)}
              placeholder="ข้อห้ามเด็ดขาด เช่น ห้ามลักลอบกลั่นผลึกอีเธอร์เรียมดิบ..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-card border border-border focus:border-amber-500/60 text-xs text-foreground transition-all outline-hidden resize-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
