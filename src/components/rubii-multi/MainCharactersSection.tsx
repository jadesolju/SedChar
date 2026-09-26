'use client';
import React, { useState } from 'react';
import {
  Users,
  Plus,
  Trash2,
  Heart,
  Key,
  Ban,
  Sparkles,
  User,
  AlertTriangle,
  Target,
  MessageSquare,
  Shield,
} from 'lucide-react';
import type { MainCharacterDraft } from '@/shared/multiCharTypes';
import { MAX_FREE_MAIN_CHARACTERS } from '@/hooks/useMultiCharacterProject';

interface MainCharactersSectionProps {
  mainCharacters: MainCharacterDraft[];
  onAddCharacter: () => boolean;
  onUpdateCharacter: (id: string, data: Partial<MainCharacterDraft>) => void;
  onRemoveCharacter: (id: string) => void;
}

export function MainCharactersSection({
  mainCharacters,
  onAddCharacter,
  onUpdateCharacter,
  onRemoveCharacter,
}: MainCharactersSectionProps) {
  const [selectedCharId, setSelectedCharId] = useState<string>(() => mainCharacters[0]?.id || '');
  const activeChar = mainCharacters.find((c) => c.id === selectedCharId) || mainCharacters[0];
  const isFull = mainCharacters.length >= MAX_FREE_MAIN_CHARACTERS;

  const handleAdd = () => {
    const success = onAddCharacter();
    if (!success) {
      alert(`แผน Free เพิ่มตัวละครหลักได้สูงสุด ${MAX_FREE_MAIN_CHARACTERS} ตัว`);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-600 dark:text-rose-400 flex-shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
              <span>4. Main Characters (ตัวละครหลัก)</span>
              <span
                className={
                  'text-[10px] px-2.5 py-0.5 rounded-full font-bold border ' +
                  (isFull
                    ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30'
                    : 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20')
                }
              >
                {mainCharacters.length}/{MAX_FREE_MAIN_CHARACTERS} ตัว (Free Tier)
              </span>
            </h2>
            <p className="text-xs text-muted-foreground">
              Draft Profile สั้นสำหรับวางโครงตัวละครหลักแต่ละคน เป้าหมาย ความสัมพันธ์ และกฎเฉพาะตัว
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          disabled={isFull}
          className={
            'px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 self-start sm:self-auto ' +
            (isFull
              ? 'bg-muted text-muted-foreground opacity-50 cursor-not-allowed'
              : 'bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white cursor-pointer')
          }
        >
          <Plus className="w-4 h-4" />
          <span>เพิ่มตัวละครหลัก</span>
        </button>
      </div>

      {/* Main Layout: Character Tabs on Left/Top + Editor on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Character List Column */}
        <div className="lg:col-span-4 space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between px-1">
            <span>รายชื่อตัวละคร ({mainCharacters.length})</span>
            {isFull && (
              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                <span>ครบโควตา 10 ตัว</span>
              </span>
            )}
          </div>

          <div className="space-y-1.5 max-h-[550px] overflow-y-auto custom-scrollbar pr-1">
            {mainCharacters.map((char, index) => {
              const isSelected = char.id === activeChar?.id;
              return (
                <div
                  key={char.id}
                  onClick={() => setSelectedCharId(char.id)}
                  className={
                    'p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 ' +
                    (isSelected
                      ? 'bg-rose-500/10 border-rose-500/50 shadow-xs'
                      : 'bg-card/70 border-border hover:bg-muted/40 hover:border-border/80')
                  }
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={
                        'w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ' +
                        (isSelected ? 'bg-rose-500 text-white' : 'bg-muted text-muted-foreground')
                      }
                    >
                      {index + 1}
                    </div>
                    <div className="min-w-0">
                      <div
                        className={
                          'text-xs font-bold truncate ' +
                          (isSelected ? 'text-rose-600 dark:text-rose-300' : 'text-foreground')
                        }
                      >
                        {char.name || `ตัวละครหลักที่ ${index + 1}`}
                      </div>
                      <div className="text-[10px] text-muted-foreground truncate">
                        {char.storyRole || 'ยังไม่ระบุบทบาท'} • {char.gender || '-'}
                      </div>
                    </div>
                  </div>

                  {mainCharacters.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveCharacter(char.id);
                      }}
                      className="w-7 h-7 rounded-lg hover:bg-rose-500/20 text-muted-foreground hover:text-rose-600 dark:hover:text-rose-400 flex items-center justify-center transition-all cursor-pointer"
                      title="ลบตัวละคร"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Character Editor Form Column */}
        {activeChar && (
          <div className="lg:col-span-8 p-4 sm:p-5 rounded-2xl border border-border bg-card/60 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-rose-500" />
                <span className="text-xs font-bold text-foreground">
                  แก้ไขข้อมูลตัวละคร: <span className="text-rose-600 dark:text-rose-400">{activeChar.name || 'ไม่มีชื่อ'}</span>
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-foreground">
                  ชื่อตัวละคร (Character Name)
                </label>
                <input
                  type="text"
                  value={activeChar.name}
                  onChange={(e) => onUpdateCharacter(activeChar.id, { name: e.target.value })}
                  placeholder="เช่น ออเรเลีย..."
                  className="w-full px-3 py-1.5 rounded-xl bg-background border border-border focus:border-rose-500/60 text-xs text-foreground font-bold outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-foreground">
                  ฉายา / ตำแหน่ง (Alias & Title)
                </label>
                <input
                  type="text"
                  value={activeChar.aliasOrTitle}
                  onChange={(e) => onUpdateCharacter(activeChar.id, { aliasOrTitle: e.target.value })}
                  placeholder="เช่น ผู้บัญชาการอัศวินกุหลาบเงิน..."
                  className="w-full px-3 py-1.5 rounded-xl bg-background border border-border focus:border-rose-500/60 text-xs text-foreground outline-hidden"
                />
              </div>

              <div className="grid grid-cols-3 gap-2 sm:col-span-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-foreground">เพศ</label>
                  <input
                    type="text"
                    value={activeChar.gender}
                    onChange={(e) => onUpdateCharacter(activeChar.id, { gender: e.target.value })}
                    placeholder="เช่น หญิง / ชาย"
                    className="w-full px-2.5 py-1.5 rounded-xl bg-background border border-border text-xs text-foreground outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-foreground">อายุ</label>
                  <input
                    type="text"
                    value={activeChar.age}
                    onChange={(e) => onUpdateCharacter(activeChar.id, { age: e.target.value })}
                    placeholder="เช่น 26 ปี"
                    className="w-full px-2.5 py-1.5 rounded-xl bg-background border border-border text-xs text-foreground outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-foreground">MBTI (ถ้ามี)</label>
                  <input
                    type="text"
                    value={activeChar.mbti || ''}
                    onChange={(e) => onUpdateCharacter(activeChar.id, { mbti: e.target.value })}
                    placeholder="เช่น ISTJ, ENTP"
                    className="w-full px-2.5 py-1.5 rounded-xl bg-background border border-border text-xs text-foreground outline-hidden"
                  />
                </div>
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-[11px] font-semibold text-foreground">
                  บทบาทในเรื่องราว (Story Role)
                </label>
                <input
                  type="text"
                  value={activeChar.storyRole}
                  onChange={(e) => onUpdateCharacter(activeChar.id, { storyRole: e.target.value })}
                  placeholder="เช่น ผู้พิทักษ์และคู่พันธสัญญา / ฝ่ายกบฏจอมวางแผน..."
                  className="w-full px-3 py-1.5 rounded-xl bg-background border border-border focus:border-rose-500/60 text-xs text-foreground outline-hidden"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-[11px] font-semibold text-foreground flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-rose-500" />
                  <span>แก่นบุคลิกภาพ & จุดเด่นนิสัย (Core Personality Brief)</span>
                </label>
                <textarea
                  rows={2}
                  value={activeChar.corePersonality}
                  onChange={(e) => onUpdateCharacter(activeChar.id, { corePersonality: e.target.value })}
                  placeholder="เช่น สุขุม เคร่งครัดในหน้าที่ ปากแข็งแต่จิตใจอ่อนโยน รักษาคำพูดอย่างยิ่งยวด..."
                  className="w-full px-3 py-2 rounded-xl bg-background border border-border focus:border-rose-500/60 text-xs text-foreground outline-hidden resize-none"
                />
              </div>

              {/* Primary Goal & User Relationship */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-foreground flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-amber-500" />
                  <span>เป้าหมายหรือความปรารถนาหลัก (Primary Goal)</span>
                </label>
                <textarea
                  rows={2}
                  value={activeChar.primaryGoalOrDesire}
                  onChange={(e) => onUpdateCharacter(activeChar.id, { primaryGoalOrDesire: e.target.value })}
                  placeholder="เช่น ปกป้องความสงบสุขของพลเมือง และค้นหาความจริง..."
                  className="w-full px-3 py-1.5 rounded-xl bg-background border border-border text-xs text-foreground outline-hidden resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-foreground flex items-center gap-1">
                  <Heart className="w-3.5 h-3.5 text-pink-500" />
                  <span>ความสัมพันธ์กับ {'{{user}}'} (Relationship with User)</span>
                </label>
                <textarea
                  rows={2}
                  value={activeChar.relationshipWithUser}
                  onChange={(e) => onUpdateCharacter(activeChar.id, { relationshipWithUser: e.target.value })}
                  placeholder="เช่น มองเป็นบุคคลสำคัญที่ต้องคุ้มครอง แต่ค่อยๆ เปิดใจ..."
                  className="w-full px-3 py-1.5 rounded-xl bg-background border border-border text-xs text-foreground outline-hidden resize-none"
                />
              </div>

              {/* Relations with other cast */}
              <div className="space-y-1 sm:col-span-2">
                <label className="text-[11px] font-semibold text-foreground flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-blue-500" />
                  <span>ความสัมพันธ์กับตัวละครอื่นในเรื่อง (Relations with other Cast)</span>
                </label>
                <textarea
                  rows={2}
                  value={activeChar.relationsWithOtherCast}
                  onChange={(e) => onUpdateCharacter(activeChar.id, { relationsWithOtherCast: e.target.value })}
                  placeholder="เช่น ไม่ไว้ใจกิลด์วิศวกรเงา แต่ยอมร่วมมือชั่วคราวเมื่อสถานการณ์คับขัน..."
                  className="w-full px-3 py-1.5 rounded-xl bg-background border border-border text-xs text-foreground outline-hidden resize-none"
                />
              </div>

              {/* Secrets & Absolute Rules */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-foreground flex items-center gap-1">
                  <Key className="w-3.5 h-3.5 text-amber-500" />
                  <span>ข้อมูลลับ / สิ่งที่รู้เฉพาะตัว (Exclusive Secret / Knowledge)</span>
                </label>
                <textarea
                  rows={2}
                  value={activeChar.exclusiveSecretOrKnowledge}
                  onChange={(e) => onUpdateCharacter(activeChar.id, { exclusiveSecretOrKnowledge: e.target.value })}
                  placeholder="เช่น แอบเก็บตัวอย่างผลึกเวทจากแล็บ 7 ไว้เพื่อสืบหาคนทรยศ..."
                  className="w-full px-3 py-1.5 rounded-xl bg-background border border-border text-xs text-foreground outline-hidden resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-foreground flex items-center gap-1">
                  <Ban className="w-3.5 h-3.5 text-rose-500" />
                  <span>กฎเหล็ก / สิ่งที่จะไม่ทำเด็ดขาด (Absolute Rules)</span>
                </label>
                <textarea
                  rows={2}
                  value={activeChar.absoluteRules}
                  onChange={(e) => onUpdateCharacter(activeChar.id, { absoluteRules: e.target.value })}
                  placeholder="เช่น ไม่ยอมหักหลังหน้าที่ และไม่ทำร้ายผู้บริสุทธิ์เด็ดขาด..."
                  className="w-full px-3 py-1.5 rounded-xl bg-background border border-border text-xs text-foreground outline-hidden resize-none"
                />
              </div>

              {/* Appearance & Speaking Style */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-foreground flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                  <span>รูปลักษณ์ภายนอกย่อ (Appearance Brief)</span>
                </label>
                <textarea
                  rows={2}
                  value={activeChar.appearanceBrief}
                  onChange={(e) => onUpdateCharacter(activeChar.id, { appearanceBrief: e.target.value })}
                  placeholder="เช่น ชุดเกราะเงินประดับผ้าคลุมสีน้ำเงินกรมท่า ผมสีบลอนด์เงิน สูง 172 ซม...."
                  className="w-full px-3 py-1.5 rounded-xl bg-background border border-border text-xs text-foreground outline-hidden resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-foreground flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-blue-500" />
                  <span>สไตล์การพูด & คำติดปาก (Speaking Style & Catchphrase)</span>
                </label>
                <textarea
                  rows={2}
                  value={activeChar.speakingStyle}
                  onChange={(e) => onUpdateCharacter(activeChar.id, { speakingStyle: e.target.value })}
                  placeholder="เช่น สุภาพ ทางการ หนักแน่น ลงท้ายด้วยความเคารพแต่แฝงความเด็ดขาด..."
                  className="w-full px-3 py-1.5 rounded-xl bg-background border border-border text-xs text-foreground outline-hidden resize-none"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
