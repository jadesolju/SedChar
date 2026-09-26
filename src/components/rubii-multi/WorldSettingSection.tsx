'use client';
import React from 'react';
import { Globe, Sparkles, Building, Landmark, Compass, ShieldAlert } from 'lucide-react';
import type { WorldSettingDraft } from '@/shared/multiCharTypes';

interface WorldSettingSectionProps {
  worldSetting: WorldSettingDraft;
  onUpdate: <K extends keyof WorldSettingDraft>(key: K, value: WorldSettingDraft[K]) => void;
}

export function WorldSettingSection({ worldSetting, onUpdate }: WorldSettingSectionProps) {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex items-center gap-3 pb-4 border-b border-border">
        <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
          <Globe className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
            <span>1. World Setting & กฎของโลก</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30">
              Shared Project Scope
            </span>
          </h2>
          <p className="text-xs text-muted-foreground">
            กำหนดฉาก ยุคสมัย กฎสากล และบรรยากาศที่ตัวละครทุกคนในโปรเจกต์ต้องยึดถือร่วมกัน
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5 md:col-span-2">
          <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <Landmark className="w-3.5 h-3.5 text-purple-400" />
            <span>ชื่อโปรเจกต์ / ชื่อเรื่อง (Project Title)</span>
          </label>
          <input
            type="text"
            value={worldSetting.projectName}
            onChange={(e) => onUpdate('projectName', e.target.value)}
            placeholder="เช่น มหานครกรงทอง: รอยสักมังกรกับสายสัมพันธ์สีเลือด"
            className="w-full px-3.5 py-2.5 rounded-xl bg-card border border-border focus:border-purple-500/60 focus:ring-2 focus:ring-purple-500/20 text-xs text-foreground transition-all outline-hidden"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>แนวเรื่อง & โทนหลัก (Genre & Tone)</span>
          </label>
          <input
            type="text"
            value={worldSetting.genreTone}
            onChange={(e) => onUpdate('genreTone', e.target.value)}
            placeholder="เช่น ดาร์กโรแมนซ์, มาเฟียคาสิโน, ไซเบอร์พังก์"
            className="w-full px-3.5 py-2.5 rounded-xl bg-card border border-border focus:border-purple-500/60 focus:ring-2 focus:ring-purple-500/20 text-xs text-foreground transition-all outline-hidden"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-blue-400" />
            <span>ยุคสมัย & ช่วงเวลา (Era / Time Period)</span>
          </label>
          <input
            type="text"
            value={worldSetting.eraTimePeriod}
            onChange={(e) => onUpdate('eraTimePeriod', e.target.value)}
            placeholder="เช่น โลกอนาคตปี 2099, ปัจจุบัน ณ มหานครชั้นใน"
            className="w-full px-3.5 py-2.5 rounded-xl bg-card border border-border focus:border-purple-500/60 focus:ring-2 focus:ring-purple-500/20 text-xs text-foreground transition-all outline-hidden"
          />
        </div>

        <div className="space-y-1.5 md:col-span-2">
          <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <Building className="w-3.5 h-3.5 text-emerald-400" />
            <span>สถานที่หลัก & ฉากหลังของเรื่อง (Main Locations & Setting)</span>
          </label>
          <textarea
            rows={3}
            value={worldSetting.mainLocation}
            onChange={(e) => onUpdate('mainLocation', e.target.value)}
            placeholder="เช่น เดอะเวลเว็ทเพนต์เฮาส์ดูเพล็กซ์ลอยฟ้า, คาสิโนใต้ดินมังกรราตรี..."
            className="w-full px-3.5 py-2.5 rounded-xl bg-card border border-border focus:border-purple-500/60 focus:ring-2 focus:ring-purple-500/20 text-xs text-foreground transition-all outline-hidden resize-none"
          />
        </div>

        <div className="space-y-1.5 md:col-span-2">
          <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            <span>กฎของโลก / ระบบพลัง / กฎที่ต้องยึดร่วมกัน (World Rules & Constraints)</span>
          </label>
          <textarea
            rows={4}
            value={worldSetting.worldRulesOrMagicSystem}
            onChange={(e) => onUpdate('worldRulesOrMagicSystem', e.target.value)}
            placeholder="เช่น ทุกการติดต่อสื่อสารจะถูกบันทึกในเซิร์ฟเวอร์กลาง, เงินสดเท่านั้นที่มีอำนาจจริง..."
            className="w-full px-3.5 py-2.5 rounded-xl bg-card border border-border focus:border-purple-500/60 focus:ring-2 focus:ring-purple-500/20 text-xs text-foreground transition-all outline-hidden resize-none"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground">
            🏢 ฝ่าย / ตระกูล / องค์กรสำคัญ (Factions)
          </label>
          <textarea
            rows={3}
            value={worldSetting.factionsOrOrganizations}
            onChange={(e) => onUpdate('factionsOrOrganizations', e.target.value)}
            placeholder="เช่น กลุ่มไตรภาคีเกาลูน, องค์กรพยัคฆ์เงา, สหพันธ์การค้าใต้ดิน..."
            className="w-full px-3.5 py-2.5 rounded-xl bg-card border border-border focus:border-purple-500/60 focus:ring-2 focus:ring-purple-500/20 text-xs text-foreground transition-all outline-hidden resize-none"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground">
            🌌 มู้ดและบรรยากาศโดยรวม (Atmosphere & Aesthetic)
          </label>
          <textarea
            rows={3}
            value={worldSetting.atmosphereTheme}
            onChange={(e) => onUpdate('atmosphereTheme', e.target.value)}
            placeholder="เช่น แสงนีออนสีแดงสะท้อนหมอกควัน, ความหรูหราที่แฝงกลิ่นคาวเลือด..."
            className="w-full px-3.5 py-2.5 rounded-xl bg-card border border-border focus:border-purple-500/60 focus:ring-2 focus:ring-purple-500/20 text-xs text-foreground transition-all outline-hidden resize-none"
          />
        </div>
      </div>
    </div>
  );
}
