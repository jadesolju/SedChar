'use client';
import React, { useState } from 'react';
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
import { SectionAutoPromptModal } from '@/components/universe/SectionAutoPromptModal';
import { ExpandableTextarea } from '@/components/ui/ExpandableTextarea';

interface LoreTimelineSectionProps {
  lore: LoreDraft;
  mainCharacters: MainCharacterDraft[];
  onUpdateLore: <K extends keyof LoreDraft>(key: K, value: LoreDraft[K]) => void;
  onAddEvent: (event?: Partial<LoreTimelineItem>) => void;
  onUpdateEvent: (index: number, event: Partial<LoreTimelineItem>) => void;
  onRemoveEvent: (index: number) => void;
  onShowToast?: (msg: string) => void;
}

export function LoreTimelineSection({
  lore,
  mainCharacters,
  onUpdateLore,
  onAddEvent,
  onUpdateEvent,
  onRemoveEvent,
  onShowToast,
}: LoreTimelineSectionProps) {
  const [isAutoModalOpen, setIsAutoModalOpen] = useState(false);

  const handleApplyAuto = (data: any) => {
    if (!data) return;
    if (data.worldBackstory !== undefined) onUpdateLore('worldBackstory', data.worldBackstory);
    if (data.coreConflict !== undefined) onUpdateLore('coreConflict', data.coreConflict);
    if (data.commonKnowledge !== undefined) onUpdateLore('commonKnowledge', data.commonKnowledge);
    if (data.taboosOrMyths !== undefined) onUpdateLore('taboosOrMyths', data.taboosOrMyths);
    if (Array.isArray(data.timelineEvents)) {
      data.timelineEvents.forEach((evt: any) => {
        onAddEvent({
          timeLabel: evt.timeLabel || '',
          eventTitle: evt.eventTitle || '',
          description: evt.description || '',
          isSecret: !!evt.isSecret,
          knownByCharacters: evt.knownByCharacters || [],
        });
      });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 flex-shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-foreground flex flex-wrap items-center gap-1.5 sm:gap-2 leading-tight">
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

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setIsAutoModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>AI ช่วยคิด Lore</span>
          </button>

          <button
            type="button"
            onClick={() => onAddEvent()}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>เพิ่มเหตุการณ์</span>
          </button>
        </div>
      </div>

      <SectionAutoPromptModal
        isOpen={isAutoModalOpen}
        onClose={() => setIsAutoModalOpen(false)}
        section="lore"
        context={lore}
        onApply={handleApplyAuto}
        onShowToast={onShowToast || (() => {})}
      />

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <ExpandableTextarea
              id="lore-backstory"
              label="ภูมิหลังและประวัติศาสตร์ของเรื่อง (World Backstory)"
              rows={3}
              value={lore.worldBackstory}
              onChange={(val) => onUpdateLore('worldBackstory', val)}
              placeholder="จุดเริ่มต้นของโลก หรือเหตุการณ์ใหญ่ในอดีตที่ส่งผลถึงปัจจุบัน..."
            />
          </div>

          <div>
            <ExpandableTextarea
              id="lore-conflict"
              label="ความขัดแย้งหลัก (Core Conflict)"
              rows={3}
              value={lore.coreConflict}
              onChange={(val) => onUpdateLore('coreConflict', val)}
              placeholder="จุดขัดแย้งหรือเป้าหมายที่ทำให้ตัวละครต้องเข้ามาพัวพันกัน..."
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
            <div className="space-y-4">
              {lore.timelineEvents.map((event, idx) => (
                <div
                  key={event.id}
                  className="p-4 rounded-2xl border border-border bg-card/60 hover:border-amber-500/40 transition-all space-y-3 shadow-2xs"
                >
                  <div className="flex items-center justify-between gap-2 border-b border-border/50 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <span className="text-xs font-bold text-foreground">
                        เหตุการณ์ที่ {idx + 1}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onUpdateEvent(idx, { isSecret: !event.isSecret })}
                        className={"px-2.5 py-1 rounded-lg text-[10px] font-bold border flex items-center gap-1 transition-all cursor-pointer " + (event.isSecret ? "bg-rose-500/10 border-rose-500/40 text-rose-700 dark:text-rose-300" : "bg-muted border-border text-muted-foreground")}
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

                  {/* Grid for Event Title & Time Period with explicit labels */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2 space-y-1">
                      <label className="text-[11px] font-bold text-foreground block">
                        หัวข้อเหตุการณ์ (Event Title) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={event.eventTitle}
                        onChange={(e) => onUpdateEvent(idx, { eventTitle: e.target.value })}
                        placeholder="เช่น การสถาปนากฎเหล็กกริมสโตน, สงครามผลึกเวทมนตร์..."
                        className="w-full px-3 py-2 rounded-xl bg-muted/50 border border-border text-xs text-foreground outline-hidden font-semibold focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-foreground block">
                        ช่วงเวลา (Time / Era)
                      </label>
                      <input
                        type="text"
                        value={event.timeLabel}
                        onChange={(e) => onUpdateEvent(idx, { timeLabel: e.target.value })}
                        placeholder="เช่น 100 ปีก่อน, ปัจจุบัน..."
                        className="w-full px-3 py-2 rounded-xl bg-muted/50 border border-border text-xs text-foreground outline-hidden font-medium focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-foreground block">
                      รายละเอียดเหตุการณ์ (Event Description)
                    </label>
                    <ExpandableTextarea
                      id={`timeline-event-${event.id}`}
                      rows={2}
                      value={event.description}
                      onChange={(val) => onUpdateEvent(idx, { description: val })}
                      placeholder="รายละเอียดของเหตุการณ์นี้ และผลกระทบต่อเรื่องราว..."
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div>
            <ExpandableTextarea
              id="lore-common-knowledge"
              label="สิ่งที่คนทั่วไปในเรื่องรู้ร่วมกัน (Common Knowledge)"
              rows={2}
              value={lore.commonKnowledge}
              onChange={(val) => onUpdateLore('commonKnowledge', val)}
              placeholder="ข้อเท็จจริงสาธารณะ เช่น ใครเป็นผู้นำองค์กร..."
            />
          </div>

          <div>
            <ExpandableTextarea
              id="lore-taboos"
              label="ข้อห้าม / ความเชื่อต้องห้าม (Taboos & Myths)"
              rows={2}
              value={lore.taboosOrMyths}
              onChange={(val) => onUpdateLore('taboosOrMyths', val)}
              placeholder="ข้อห้ามเด็ดขาด เช่น ห้ามลักลอบกลั่นผลึกอีเธอร์เรียมดิบ..."
            />
          </div>
        </div>
      </div>
    </div>
  );
}
