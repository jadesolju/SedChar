'use client';
import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Users,
  Check,
  Loader2,
  ShieldCheck,
  Send,
  UserPlus,
  Coins,
} from 'lucide-react';
import type { MainCharacterDraft } from '@/shared/multiCharTypes';
import { CHARACTER_FLAGS, type CharacterFlagType } from '@/shared/types';
import { useAuth } from '@/context/AuthContext';

interface UniverseProposeCharacterModalProps {
  isOpen: boolean;
  onClose: () => void;
  shareId: string;
  projectName: string;
  onSuccess: (char: Partial<MainCharacterDraft>) => void;
  onShowToast: (msg: string) => void;
}

export function UniverseProposeCharacterModal({
  isOpen,
  onClose,
  shareId,
  projectName,
  onSuccess,
  onShowToast,
}: UniverseProposeCharacterModalProps) {
  const { user, userRole, quotaRemaining, quotaMax, openAuthModal } = useAuth();

  const [name, setName] = useState('');
  const [aliasOrTitle, setAliasOrTitle] = useState('');
  const [storyRole, setStoryRole] = useState('');
  const [corePersonality, setCorePersonality] = useState('');
  const [gender, setGender] = useState('');
  const [age, setAge] = useState('');
  const [flagType, setFlagType] = useState<CharacterFlagType>('none');
  const [relationsWithOtherCast, setRelationsWithOtherCast] = useState('');
  const [exclusiveSecretOrKnowledge, setExclusiveSecretOrKnowledge] = useState('');
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleAiAssist = async () => {
    if (!user) {
      openAuthModal('signin');
      return;
    }

    if (userRole !== 'admin' && quotaRemaining <= 0) {
      alert('โควต้า AI ประจำวันของคุณหมดแล้ว (สามารถรอรีเซ็ตวันถัดไปได้ครับ)');
      return;
    }

    setIsAiGenerating(true);
    try {
      const res = await fetch('/api/universe/auto-section', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section: 'characters',
          prompt: `สร้างตัวละคร 1 ตัวที่มีความลึกซึ้ง เหมาะสำหรับเข้าร่วมจักรวาล "${projectName}" ชื่อตัวละครหรือแนวคิดคร่าวๆ: ${name || storyRole || 'ตัวละครสำคัญ'}`,
          context: { projectName },
        }),
      });

      const data = await res.json();
      if (res.ok && data.mainCharacters?.[0]) {
        const generated = data.mainCharacters[0];
        if (generated.name) setName(generated.name);
        if (generated.aliasOrTitle) setAliasOrTitle(generated.aliasOrTitle);
        if (generated.storyRole) setStoryRole(generated.storyRole);
        if (generated.corePersonality) setCorePersonality(generated.corePersonality);
        if (generated.gender) setGender(generated.gender);
        if (generated.age) setAge(generated.age);
        if (generated.flagType) setFlagType(generated.flagType);
        if (generated.relationsWithOtherCast) setRelationsWithOtherCast(generated.relationsWithOtherCast);
        if (generated.exclusiveSecretOrKnowledge) setExclusiveSecretOrKnowledge(generated.exclusiveSecretOrKnowledge);
        onShowToast('AI ช่วยคิดข้อมูลตัวละครสำเร็จ! (ใช้โควต้า AI ของคุณ 1 ครั้ง)');
      } else {
        alert(data.error || 'ไม่สามารถสร้างข้อมูลด้วย AI ได้');
      }
    } catch (e: any) {
      alert('เกิดข้อผิดพลาด: ' + e.message);
    } finally {
      setIsAiGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openAuthModal('signin');
      return;
    }

    const trimmedName = name.trim();
    if (!trimmedName) {
      alert('กรุณากรอกชื่อตัวละคร');
      return;
    }

    setIsSubmitting(true);
    try {
      const newChar: Partial<MainCharacterDraft> = {
        name: trimmedName,
        aliasOrTitle: aliasOrTitle.trim(),
        storyRole: storyRole.trim() || 'ตัวละครผู้ร่วมสร้าง',
        corePersonality: corePersonality.trim(),
        gender: gender.trim(),
        age: age.trim(),
        flagType,
        relationsWithOtherCast: relationsWithOtherCast.trim(),
        exclusiveSecretOrKnowledge: exclusiveSecretOrKnowledge.trim(),
      };

      // Save proposal or character
      onSuccess(newChar);
      onShowToast(`ส่งข้อเสนอตัวละคร "${trimmedName}" เข้าร่วมจักรวาลเรียบร้อย! 🎉`);
      onClose();
    } catch (err: any) {
      alert('เกิดข้อผิดพลาดในการส่งตัวละคร: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="relative z-10 w-full max-w-xl rounded-3xl bg-card border border-border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:px-6 sm:py-4 border-b border-border bg-muted/30">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-foreground">
                ยื่นตัวละครเข้าร่วมจักรวาล (Co-Creation)
              </h3>
              <p className="text-[11px] sm:text-xs text-muted-foreground">
                ร่วมสร้างสรรค์และเพิ่มตัวละครใหม่เข้าสู่ <strong>{projectName}</strong>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quota Banner */}
        <div className="px-6 py-2.5 bg-gradient-to-r from-purple-500/10 via-indigo-500/5 to-transparent border-b border-border flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Coins className="w-3.5 h-3.5 text-purple-500" />
            <span>โควต้า AI ของคุณวันนี้:</span>
            <strong className="text-foreground font-bold">
              {userRole === 'admin' ? '∞ ไม่จำกัด' : `${quotaRemaining}/${quotaMax}`}
            </strong>
          </div>
          <button
            type="button"
            onClick={handleAiAssist}
            disabled={isAiGenerating}
            className="px-2.5 py-1 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/30 text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
          >
            {isAiGenerating ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Sparkles className="w-3 h-3 text-purple-500" />
            )}
            <span>AI ช่วยคิดตัวละคร</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-foreground block">
                ชื่อตัวละคร (Character Name) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="เช่น เอเลน่า วอลคอฟ"
                className="w-full px-3 py-2 rounded-xl bg-muted/50 border border-border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-foreground block">
                ฉายา / ตำแหน่ง (Alias or Title)
              </label>
              <input
                type="text"
                value={aliasOrTitle}
                onChange={(e) => setAliasOrTitle(e.target.value)}
                placeholder="เช่น ผู้พิทักษ์หอคอยทมิฬ"
                className="w-full px-3 py-2 rounded-xl bg-muted/50 border border-border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2 space-y-1">
              <label className="text-[11px] font-bold text-foreground block">
                บทบาทในเรื่อง (Story Role)
              </label>
              <input
                type="text"
                value={storyRole}
                onChange={(e) => setStoryRole(e.target.value)}
                placeholder="เช่น พันธมิตรอันตราย, แม่ทัพเงา"
                className="w-full px-3 py-2 rounded-xl bg-muted/50 border border-border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-foreground block">
                เพศ / อายุ
              </label>
              <input
                type="text"
                value={gender && age ? `${gender} / ${age}` : gender || age}
                onChange={(e) => {
                  const parts = e.target.value.split('/');
                  setGender(parts[0]?.trim() || '');
                  setAge(parts[1]?.trim() || '');
                }}
                placeholder="เช่น หญิง / 24"
                className="w-full px-3 py-2 rounded-xl bg-muted/50 border border-border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-foreground block">
              แก่นบุคลิกภาพ & นิสัย (Core Personality)
            </label>
            <textarea
              rows={2}
              value={corePersonality}
              onChange={(e) => setCorePersonality(e.target.value)}
              placeholder="เช่น เยือกเย็น สุขุม แต่จงรักภักดีอย่างยิ่งยวด..."
              className="w-full px-3 py-2 rounded-xl bg-muted/50 border border-border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-purple-500 leading-relaxed resize-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-foreground block">
              สายสัมพันธ์กับตัวละครอื่นในเรื่อง (Relations with Cast)
            </label>
            <textarea
              rows={2}
              value={relationsWithOtherCast}
              onChange={(e) => setRelationsWithOtherCast(e.target.value)}
              placeholder="เช่น เป็นศิษย์เก่าของอาจารย์ใหญ่ และเคยประลองดาบกับพระเอก..."
              className="w-full px-3 py-2 rounded-xl bg-muted/50 border border-border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-purple-500 leading-relaxed resize-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-foreground block">
              ข้อมูลลับเฉพาะตัว (Exclusive Secret / Motive)
            </label>
            <input
              type="text"
              value={exclusiveSecretOrKnowledge}
              onChange={(e) => setExclusiveSecretOrKnowledge(e.target.value)}
              placeholder="เช่น ครอบครองกุญแจเปิดประตูมิติโบราณ"
              className="w-full px-3 py-2 rounded-xl bg-muted/50 border border-border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-border flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-border text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-all cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              <span>ส่งตัวละครเข้าร่วมจักรวาล</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
