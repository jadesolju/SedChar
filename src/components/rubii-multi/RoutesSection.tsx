'use client';
import React from 'react';
import { GitFork, Plus, Trash2, CheckSquare, Square, Target, Award } from 'lucide-react';
import type { RouteDraft, MainCharacterDraft } from '@/shared/multiCharTypes';

interface RoutesSectionProps {
  routes: RouteDraft[];
  mainCharacters: MainCharacterDraft[];
  onAddRoute: (data?: Partial<RouteDraft>) => void;
  onUpdateRoute: (index: number, data: Partial<RouteDraft>) => void;
  onRemoveRoute: (index: number) => void;
}

export function RoutesSection({
  routes,
  mainCharacters,
  onAddRoute,
  onUpdateRoute,
  onRemoveRoute,
}: RoutesSectionProps) {
  const toggleInvolvedCharacter = (routeIndex: number, charId: string) => {
    const route = routes[routeIndex];
    if (!route) return;
    const current = route.involvedCharacterIds || [];
    const next = current.includes(charId)
      ? current.filter(id => id !== charId)
      : [...current, charId];
    onUpdateRoute(routeIndex, { involvedCharacterIds: next });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <GitFork className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
              <span>3. Route & เส้นทางเนื้อเรื่อง</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/30">
                Branching Narrative
              </span>
            </h2>
            <p className="text-xs text-muted-foreground">
              สร้างเส้นทางเรื่อง เงื่อนไขการเข้า/ออก รูทความสัมพันธ์ และตอนจบที่เป็นไปได้
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onAddRoute()}
          className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>เพิ่มเส้นทาง (Route)</span>
        </button>
      </div>

      {routes.length === 0 ? (
        <div className="p-8 rounded-2xl border border-dashed border-border/80 text-center bg-card/30">
          <p className="text-xs text-muted-foreground mb-3">ยังไม่มี Route ในโปรเจกต์</p>
          <button
            type="button"
            onClick={() => onAddRoute()}
            className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-all cursor-pointer"
          >
            + สร้าง Route แรก
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {routes.map((route, idx) => (
            <div
              key={route.id}
              className="p-4 rounded-2xl border border-border bg-card/70 hover:border-blue-500/40 transition-all space-y-3.5"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="w-6 h-6 rounded-lg bg-blue-500/15 text-blue-400 text-xs font-bold flex items-center justify-center flex-shrink-0">
                    {idx + 1}
                  </span>
                  <input
                    type="text"
                    value={route.routeName}
                    onChange={(e) => onUpdateRoute(idx, { routeName: e.target.value })}
                    placeholder="ชื่อ Route เช่น รูทกรงทองซ้อเหมย, รูทพันธมิตรวาเลน..."
                    className="flex-1 px-3 py-1.5 rounded-xl bg-muted/60 border border-border text-xs text-foreground font-bold outline-hidden focus:border-blue-500/60"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => onRemoveRoute(idx)}
                  className="w-7 h-7 rounded-lg hover:bg-rose-500/20 text-muted-foreground hover:text-rose-400 flex items-center justify-center transition-all cursor-pointer"
                  title="ลบ Route"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Involved Characters Checkboxes */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5">
                  <span>ตัวละครหลักที่เกี่ยวข้องใน Route นี้:</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {mainCharacters.map(char => {
                    const isSelected = (route.involvedCharacterIds || []).includes(char.id);
                    return (
                      <button
                        key={char.id}
                        type="button"
                        onClick={() => toggleInvolvedCharacter(idx, char.id)}
                        className={"px-2.5 py-1 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-all cursor-pointer " + (isSelected ? "bg-blue-500/20 border-blue-500/50 text-blue-300 font-bold" : "bg-muted/40 border-border text-muted-foreground hover:text-foreground")}
                      >
                        {isSelected ? <CheckSquare className="w-3 h-3 text-blue-400" /> : <Square className="w-3 h-3 text-muted-foreground" />}
                        <span>{char.name || 'ตัวละครไม่มีชื่อ'}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Route Summary */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-foreground">
                  📖 สรุปเนื้อหาของเส้นทางนี้ (Route Summary)
                </label>
                <textarea
                  rows={2}
                  value={route.summary}
                  onChange={(e) => onUpdateRoute(idx, { summary: e.target.value })}
                  placeholder="ภาพรวมของเรื่องราวและบรรยากาศในเส้นทางนี้..."
                  className="w-full px-3 py-2 rounded-xl bg-background/80 border border-border focus:border-blue-500/60 text-xs text-foreground transition-all outline-hidden resize-none"
                />
              </div>

              {/* Conditions & Endings Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-foreground flex items-center gap-1">
                    <Target className="w-3 h-3 text-emerald-400" />
                    <span>เงื่อนไขการเข้าสู่ Route</span>
                  </label>
                  <textarea
                    rows={2}
                    value={route.entryCondition}
                    onChange={(e) => onUpdateRoute(idx, { entryCondition: e.target.value })}
                    placeholder="เช่น User เลือกช่วยงานซ้อ..."
                    className="w-full px-2.5 py-1.5 rounded-lg bg-background/80 border border-border text-xs text-foreground transition-all outline-hidden resize-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-foreground flex items-center gap-1">
                    <GitFork className="w-3 h-3 text-amber-400" />
                    <span>เงื่อนไขแตกแขนง / ออก</span>
                  </label>
                  <textarea
                    rows={2}
                    value={route.exitOrBranchCondition}
                    onChange={(e) => onUpdateRoute(idx, { exitOrBranchCondition: e.target.value })}
                    placeholder="เช่น แอบขโมยข้อมูลคลังเงิน..."
                    className="w-full px-2.5 py-1.5 rounded-lg bg-background/80 border border-border text-xs text-foreground transition-all outline-hidden resize-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-foreground flex items-center gap-1">
                    <Award className="w-3 h-3 text-purple-400" />
                    <span>ตอนจบที่เป็นไปได้ (Endings)</span>
                  </label>
                  <textarea
                    rows={2}
                    value={route.possibleEndings}
                    onChange={(e) => onUpdateRoute(idx, { possibleEndings: e.target.value })}
                    placeholder="Good End / Bad End..."
                    className="w-full px-2.5 py-1.5 rounded-lg bg-background/80 border border-border text-xs text-foreground transition-all outline-hidden resize-none"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
