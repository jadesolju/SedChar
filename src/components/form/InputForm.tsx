'use client';
import {
  User,
  Eye,
  Brain,
  HeartHandshake,
  ShieldAlert,
  Flame,
  Coffee,
  MapPin,
  Users,
  MessageSquareQuote,
  RotateCcw,
  BookOpen,
  Sparkles,
  Archive,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Lock,
  Compass,
} from 'lucide-react';
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import type {
  ThaiMasterCharacter,
  CharacterFlagType,
  SubCharacter,
  LocationItem,
} from '@/shared/types';
import { FormSection, FieldRow } from './FormSection';
import { TagInput } from './TagInput';
import { FlagSelector } from '@/components/ui/FlagSelector';
import { ExpandableTextarea } from '@/components/ui/ExpandableTextarea';
import { AIAssistantModal } from './AIAssistantModal';

type ArrayField =
  | 'visualTags'
  | 'personalityTags'
  | 'likes'
  | 'dislikes'
  | 'systemRules'
  | 'categoryTags';

interface InputFormProps {
  isReadOnly?: boolean;
  onApplyParsedCharacter?: (char: ThaiMasterCharacter) => void;
  onShowToast?: (msg: string) => void;
  character: ThaiMasterCharacter;
  onUpdateField: <K extends keyof ThaiMasterCharacter>(field: K, value: ThaiMasterCharacter[K]) => void;
  onAddTag: (field: ArrayField, value: string) => void;
  onRemoveTag: (field: ArrayField, index: number) => void;
  onAddSubCharacter: (initialData?: Partial<SubCharacter>) => void;
  onUpdateSubCharacter: (index: number, data: Partial<SubCharacter>) => void;
  onRemoveSubCharacter: (index: number) => void;
  onAddLocation: (initialData?: Partial<LocationItem>) => void;
  onUpdateLocation: (index: number, data: Partial<LocationItem>) => void;
  onRemoveLocation: (index: number) => void;
  onSelectFlag: (flag: CharacterFlagType) => void;
  onAutoDetectFlag: () => void;
  onLoadSample: () => void;
  onReset: () => void;
  onLoadDefaultLocations?: () => void;
}

export function InputForm({
  isReadOnly = false,
  onApplyParsedCharacter,
  onShowToast,
  character,
  onUpdateField,
  onAddTag,
  onRemoveTag,
  onAddSubCharacter,
  onUpdateSubCharacter,
  onRemoveSubCharacter,
  onAddLocation,
  onUpdateLocation,
  onRemoveLocation,
  onSelectFlag,
  onAutoDetectFlag,
  onLoadSample,
  onReset,
  onLoadDefaultLocations,
}: InputFormProps) {
    const { user, openAuthModal } = useAuth();
  const maxSubCharacters = user ? 25 : 8;
  const [expandedSubChars, setExpandedSubChars] = useState<Record<number, boolean>>({});

  const toggleSubCharExpand = (idx: number) => {
    setExpandedSubChars(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleAddSubCharWithLimit = () => {
    if (!user && character.supportingCharacters.length >= 8) {
      if (confirm('🔒 โหมด Guest จำกัดตัวละครเสริมสูงสุด 8 ตัว\nเข้าสู่ระบบเพื่อปลดล็อคสูงสุด 25 ตัวละครทันที ต้องการเข้าสู่ระบบหรือไม่?')) {
        openAuthModal('signin');
      }
      return;
    }
    if (character.supportingCharacters.length >= maxSubCharacters) {
      alert(`คุณเพิ่มตัวละครเสริมครบจำนวนสูงสุดแล้ว (${maxSubCharacters} ตัว)`);
      return;
    }
    onAddSubCharacter();
    setExpandedSubChars(prev => ({ ...prev, [character.supportingCharacters.length]: true }));
  };

const [isAIModalOpen, setIsAIModalOpen] = React.useState(false);

  const handleAIApply = (enhancedChar: ThaiMasterCharacter, notice: string) => {
    if (onApplyParsedCharacter) {
      onApplyParsedCharacter(enhancedChar);
    }
    if (onShowToast) {
      onShowToast(notice);
    }
  };
  return (
    <div className="flex flex-col h-full overflow-hidden bg-background">
      {/* Top Controls Bar */}
      <div className="flex-shrink-0 p-3.5 border-b border-border bg-card/60 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-base">📋</span>
          <div>
            <h2 className="text-xs font-bold text-foreground">ฟอร์มแยกส่วน (Guided Template Form)</h2>
            <p className="text-[11px] text-muted-foreground">กรอกข้อมูล 10 หมวดหมู่ พร้อมปุ่มขยายช่อง/เต็มจออิสระ</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {isReadOnly ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-semibold shadow-xs">
              <span>🔒</span>
              <span>โหมดอ่านอย่างเดียว (Read-Only)</span>
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setIsAIModalOpen(true)}
                className="text-xs px-3 py-1.5 rounded-lg bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-[0.98]"
              >
                <span>✨</span>
                <span>AI ช่วยเติมเต็มฟอร์ม</span>
              </button>
              <button
                type="button"
                onClick={onLoadSample}
                className="text-xs px-2.5 py-1 rounded-md bg-secondary hover:bg-secondary/80 text-secondary-foreground border border-border transition-colors flex items-center gap-1 cursor-pointer shadow-xs"
              >
                <span>📄</span> โหลดตัวอย่าง
              </button>
              <button
                type="button"
                onClick={onReset}
                className="text-xs px-2.5 py-1 rounded-md hover:bg-rose-500/10 text-rose-600 dark:text-rose-400 transition-colors cursor-pointer"
              >
                ล้างฟอร์ม
              </button>
            </>
          )}
        </div>
      </div>

      {/* Form Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Flag Selector Banner */}
        <FlagSelector
          currentFlag={character.flagType}
          onSelectFlag={onSelectFlag}
          onAutoDetect={onAutoDetectFlag}
          readOnly={isReadOnly}
        />

        {/* 1. ข้อมูลพื้นฐาน */}
        <FormSection
          id="sec-profile"
          title="1. ข้อมูลพื้นฐาน (Character Profile)"
          icon={<User className="w-4 h-4 text-rose-500" />}
          description="ชื่อ, อายุ, เพศ, MBTI, ฐานะ, อาชีพ, สไตล์การแต่งตัว"
          defaultOpen={true}
        >
          <div className="grid grid-cols-2 gap-3">
            <FieldRow label="ชื่อเล่น *" htmlFor="nickname" hint="เช่น คิง, เลโอ">
              <input
                id="nickname"
                type="text"
                value={character.nickname}
                onChange={e => onUpdateField('nickname', e.target.value)}
                placeholder="ชื่อเล่นตัวละคร"
                className={`form-input ${isReadOnly ? 'bg-muted/30 cursor-not-allowed select-text' : ''}`} readOnly={isReadOnly}
              />
            </FieldRow>

            <FieldRow label="ชื่อเต็ม *" htmlFor="fullName" hint="ชื่อ-นามสกุล">
              <input
                id="fullName"
                type="text"
                value={character.fullName}
                onChange={e => onUpdateField('fullName', e.target.value)}
                placeholder="คชา รัตนเวคิน"
                className={`form-input font-medium ${isReadOnly ? 'bg-muted/30 cursor-not-allowed select-text' : ''}`} readOnly={isReadOnly}
              />
            </FieldRow>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            <FieldRow label="อายุ" htmlFor="age" hint="เช่น 28 ปี">
              <input
                id="age"
                type="text"
                value={character.age}
                onChange={e => onUpdateField('age', e.target.value)}
                placeholder="28 ปี"
                className={`form-input ${isReadOnly ? 'bg-muted/30 cursor-not-allowed select-text' : ''}`} readOnly={isReadOnly}
              />
            </FieldRow>

            <FieldRow label="เพศ" htmlFor="gender">
              <input
                id="gender"
                type="text"
                value={character.gender}
                onChange={e => onUpdateField('gender', e.target.value)}
                placeholder="ชาย / หญิง / LGBTQ+"
                className={`form-input ${isReadOnly ? 'bg-muted/30 cursor-not-allowed select-text' : ''}`} readOnly={isReadOnly}
              />
            </FieldRow>

            <FieldRow label="MBTI" htmlFor="mbti" hint="เช่น ISTP, INTJ">
              <input
                id="mbti"
                type="text"
                value={character.mbti}
                onChange={e => onUpdateField('mbti', e.target.value)}
                placeholder="ISTP"
                className={`form-input ${isReadOnly ? 'bg-muted/30 cursor-not-allowed select-text' : ''}`} readOnly={isReadOnly}
              />
            </FieldRow>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FieldRow label="สถานะ" htmlFor="status" hint="เช่น โสด, หัวหน้าองค์กร">
              <input
                id="status"
                type="text"
                value={character.status}
                onChange={e => onUpdateField('status', e.target.value)}
                placeholder="โสด / หัวหน้าแก๊ง"
                className={`form-input ${isReadOnly ? 'bg-muted/30 cursor-not-allowed select-text' : ''}`} readOnly={isReadOnly}
              />
            </FieldRow>

            <FieldRow label="วันเกิด / ราศี" htmlFor="birthdate">
              <input
                id="birthdate"
                type="text"
                value={character.birthdate}
                onChange={e => onUpdateField('birthdate', e.target.value)}
                placeholder="14 พฤศจิกายน (พิจิก)"
                className={`form-input ${isReadOnly ? 'bg-muted/30 cursor-not-allowed select-text' : ''}`} readOnly={isReadOnly}
              />
            </FieldRow>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FieldRow label="น้ำหนัก / ส่วนสูง" htmlFor="weightHeight" hint="เช่น 188 ซม. / 82 กก.">
              <input
                id="weightHeight"
                type="text"
                value={character.weightHeight}
                onChange={e => onUpdateField('weightHeight', e.target.value)}
                placeholder="188 ซม. / 82 กก."
                className={`form-input ${isReadOnly ? 'bg-muted/30 cursor-not-allowed select-text' : ''}`} readOnly={isReadOnly}
              />
            </FieldRow>

            <FieldRow label="รสนิยมทางเพศ" htmlFor="sexualOrientation">
              <input
                id="sexualOrientation"
                type="text"
                value={character.sexualOrientation}
                onChange={e => onUpdateField('sexualOrientation', e.target.value)}
                placeholder="Heterosexual / Pansexual"
                className={`form-input ${isReadOnly ? 'bg-muted/30 cursor-not-allowed select-text' : ''}`} readOnly={isReadOnly}
              />
            </FieldRow>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FieldRow label="ฐานะทางการเงิน" htmlFor="wealthStatus">
              <input
                id="wealthStatus"
                type="text"
                value={character.wealthStatus}
                onChange={e => onUpdateField('wealthStatus', e.target.value)}
                placeholder="มหาเศรษฐีพันล้าน / เจ้าของกิจการ"
                className={`form-input ${isReadOnly ? 'bg-muted/30 cursor-not-allowed select-text' : ''}`} readOnly={isReadOnly}
              />
            </FieldRow>

            <FieldRow label="อาชีพ / ตำแหน่ง" htmlFor="occupation">
              <input
                id="occupation"
                type="text"
                value={character.occupation}
                onChange={e => onUpdateField('occupation', e.target.value)}
                placeholder="ประธานกลุ่มบริษัทยักษ์ใหญ่"
                className={`form-input ${isReadOnly ? 'bg-muted/30 cursor-not-allowed select-text' : ''}`} readOnly={isReadOnly}
              />
            </FieldRow>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FieldRow label="รถยนต์ประจำตำแหน่ง" htmlFor="car">
              <input
                id="car"
                type="text"
                value={character.car}
                onChange={e => onUpdateField('car', e.target.value)}
                placeholder="Porsche 911 GT3 RS สีดำด้าน"
                className={`form-input ${isReadOnly ? 'bg-muted/30 cursor-not-allowed select-text' : ''}`} readOnly={isReadOnly}
              />
            </FieldRow>

            <FieldRow label="กลิ่นน้ำหอมประจำตัว" htmlFor="perfume">
              <input
                id="perfume"
                type="text"
                value={character.perfume}
                onChange={e => onUpdateField('perfume', e.target.value)}
                placeholder="Tom Ford Tobacco Vanille"
                className={`form-input ${isReadOnly ? 'bg-muted/30 cursor-not-allowed select-text' : ''}`} readOnly={isReadOnly}
              />
            </FieldRow>
          </div>

          <ExpandableTextarea readOnly={isReadOnly}
            id="address"
            label="ที่อยู่ / ฐานที่มั่น"
            rows={2}
            value={character.address}
            onChange={v => onUpdateField('address', v)}
            placeholder="Penthouse ชั้น 52 ใจกลางกรุงเทพฯ"
          />

          <ExpandableTextarea readOnly={isReadOnly}
            id="fashionStyle"
            label="สไตล์การแต่งตัว"
            rows={2}
            value={character.fashionStyle}
            onChange={v => onUpdateField('fashionStyle', v)}
            placeholder="เสื้อเชิ้ตดำพับแขน นาฬิกาหรู ปลดกระดุม 2 เม็ด"
          />
        </FormSection>

        {/* 2. ลักษณะภายนอก & NSFW */}
        <FormSection
          id="sec-appearance"
          title="2. ลักษณะภายนอก & NSFW (Appearance)"
          icon={<Eye className="w-4 h-4 text-pink-500" />}
          description="การบรรยายสรีระ, จุดเด่น, แท็ก และข้อมูลส่วนลับ"
          defaultOpen={false}
          badge={character.visualTags.length}
        >
          <ExpandableTextarea readOnly={isReadOnly}
            id="appearanceDesc"
            label="คำบรรยายลักษณะภายนอกโดยละเอียด *"
            hint="กดปุ่มขยายช่องหรือเต็มจอเพื่อเขียนบรรยายยาวๆ"
            rows={5}
            value={character.appearanceDesc}
            onChange={v => onUpdateField('appearanceDesc', v)}
            placeholder="ชายหนุ่มรูปร่างสูงใหญ่ กล้ามเนื้อแน่นชัดเจน ใบหน้าคมคายดุดัน นัยน์ตาสีดำสนิทเย็นชา สันกรามคมชัด ผิวสีแทนสุขภาพดี..."
          />

          <ExpandableTextarea readOnly={isReadOnly}
            id="visualFeatures"
            label="จุดเด่นบนร่างกาย / รอยสัก / แผลเป็น"
            rows={2}
            value={character.visualFeatures}
            onChange={v => onUpdateField('visualFeatures', v)}
            placeholder="รอยสักมังกรพาดผ่านแผ่นหลัง, รอยแผลเป็นที่หางคิ้วซ้าย"
          />

          <FieldRow label="แท็กคีย์เวิร์ดรูปลักษณ์ (#)" htmlFor="visualTags" hint="พิมพ์แล้วกด Enter">
            <TagInput readOnly={isReadOnly}
              id="visualTags"
              field="visualTags"
              tags={character.visualTags}
              placeholder="เพิ่มแท็ก เช่น #หนุ่มหล่อคมเข้ม #สูง188 #รอยสัก..."
              onAdd={onAddTag}
              onRemove={onRemoveTag}
              prefixHash={true}
            />
          </FieldRow>

          {/* NSFW Box */}
          <div className="p-3.5 rounded-xl border border-border/80 bg-muted/30 space-y-3">
            <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <span>🔞</span> ข้อมูลส่วนลับ (NSFW Info)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <FieldRow label="ส่วนลับชาย (ขนาดน้องชาย/ขน)" htmlFor="nsfwMaleSize">
                <input
                  id="nsfwMaleSize"
                  type="text"
                  value={character.nsfwMaleSize}
                  onChange={e => onUpdateField('nsfwMaleSize', e.target.value)}
                  placeholder="ขนาด 8 นิ้ว, ไร้ขน"
                  className={`form-input text-xs ${isReadOnly ? 'bg-muted/30 cursor-not-allowed select-text' : ''}`}
                  readOnly={isReadOnly}
                />
              </FieldRow>
              <FieldRow label="ส่วนลับหญิง (ขนาดหน้าอก)" htmlFor="nsfwFemaleChest">
                <input
                  id="nsfwFemaleChest"
                  type="text"
                  value={character.nsfwFemaleChest}
                  onChange={e => onUpdateField('nsfwFemaleChest', e.target.value)}
                  placeholder="คัพ D, 36 นิ้ว"
                  className={`form-input text-xs ${isReadOnly ? 'bg-muted/30 cursor-not-allowed select-text' : ''}`}
                  readOnly={isReadOnly}
                />
              </FieldRow>
              <FieldRow label="ส่วนลับหญิง (จิ๊มิ/สี/ขน)" htmlFor="nsfwFemaleVagina">
                <input
                  id="nsfwFemaleVagina"
                  type="text"
                  value={character.nsfwFemaleVagina}
                  onChange={e => onUpdateField('nsfwFemaleVagina', e.target.value)}
                  placeholder="กลีบชมพู, ไร้ขน"
                  className={`form-input text-xs ${isReadOnly ? 'bg-muted/30 cursor-not-allowed select-text' : ''}`}
                  readOnly={isReadOnly}
                />
              </FieldRow>
            </div>
          </div>
        </FormSection>

        {/* 3. นิสัยและพฤติกรรม */}
        <FormSection
          id="sec-personality"
          title="3. นิสัยและพฤติกรรม (Psychology & Personality)"
          icon={<Brain className="w-4 h-4 text-purple-500" />}
          description="Core Traits, แท็กนิสัย, ชอบ/ไม่ชอบ, พฤติกรรมทั่วไป & กับ User"
          defaultOpen={false}
          badge={character.personalityTags.length}
        >
          <ExpandableTextarea readOnly={isReadOnly}
            id="coreTraits"
            label="Core Traits (บรรยายละเอียด) *"
            hint="กดปุ่มขยายช่องเพื่อเขียนมิติอารมณ์และนิสัย"
            rows={5}
            value={character.coreTraits}
            onChange={v => onUpdateField('coreTraits', v)}
            placeholder="เย็นชา สุขุม พูดน้อยต่อยหนัก ไม่เคยไว้ใจใครง่ายๆ ไร้ความปรานีต่อศัตรู แต่ซ่อนความอ่อนโยนไว้กับ {{user}}..."
          />

          <FieldRow label="แท็กนิสัยและค้นหา (# อย่างน้อย 5-10 อย่าง)" htmlFor="personalityTags">
            <TagInput readOnly={isReadOnly}
              id="personalityTags"
              field="personalityTags"
              tags={character.personalityTags}
              placeholder="เพิ่มแท็ก เช่น #ISTP #เย็นชา #ปากร้าย #ซึนเดเระ #ปกป้องรุนแรง..."
              onAdd={onAddTag}
              onRemove={onRemoveTag}
              prefixHash={true}
            />
          </FieldRow>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FieldRow label="สิ่งที่ชอบ (Likes)" htmlFor="likes">
              <TagInput readOnly={isReadOnly}
                id="likes"
                field="likes"
                tags={character.likes}
                placeholder="สิ่งที่ชอบ เช่น กาแฟดำ, กลิ่นของ User..."
                onAdd={onAddTag}
                onRemove={onRemoveTag}
              />
            </FieldRow>

            <FieldRow label="สิ่งที่เกลียด (Dislikes)" htmlFor="dislikes">
              <TagInput readOnly={isReadOnly}
                id="dislikes"
                field="dislikes"
                tags={character.dislikes}
                placeholder="สิ่งที่เกลียด เช่น คนโกหก, กลิ่นควัน..."
                onAdd={onAddTag}
                onRemove={onRemoveTag}
              />
            </FieldRow>
          </div>

          <ExpandableTextarea readOnly={isReadOnly}
            id="generalBehaviors"
            label="พฤติกรรมทั่วไป (กับคนอื่นในสังคม)"
            rows={4}
            value={character.generalBehaviors}
            onChange={v => onUpdateField('generalBehaviors', v)}
            placeholder="เว้นระยะห่างกับทุกคน สบตาด้วยสายตากดดัน ไม่ชอบการสัมผัสตัวกับคนแปลกหน้า..."
          />

          <ExpandableTextarea readOnly={isReadOnly}
            id="userExclusiveBehaviors"
            label="พฤติกรรมพิเศษเฉพาะกับ {{user}}"
            rows={4}
            value={character.userExclusiveBehaviors}
            onChange={v => onUpdateField('userExclusiveBehaviors', v)}
            placeholder="ชอบแอบมอง ยอมให้แตะเนื้อต้องตัว แม้จะปากแข็งแต่คอยดูแลและตามใจทุกเรื่อง..."
          />

          {/* Psychological 7-Layer Structure */}
          <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-3.5">
            <div className="flex items-center gap-2">
              <span className="text-base">🧬</span>
              <div>
                <h4 className="text-xs font-bold text-foreground">โครงสร้างจิตวิทยาเชิงลึก 7 ชั้น (Psychological Layers)</h4>
                <p className="text-[11px] text-muted-foreground">ช่วยให้ AI แสดงบุคลิกภาพที่ซับซ้อนและมีมิติสมจริงที่สุด</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <ExpandableTextarea readOnly={isReadOnly}
                id="coreBelief"
                label="1. ความเชื่อฝังใจ (Core Belief)"
                rows={3}
                value={character.coreBelief}
                onChange={v => onUpdateField('coreBelief', v)}
                placeholder="ความแข็งแกร่งเท่านั้นที่ปกป้องสิ่งสำคัญได้"
              />

              <ExpandableTextarea readOnly={isReadOnly}
                id="mindset"
                label="2. กระบวนการคิด (Mindset)"
                rows={3}
                value={character.mindset}
                onChange={v => onUpdateField('mindset', v)}
                placeholder="วิเคราะห์สถานการณ์ด้วยเหตุผล ไม่ใช้อารมณ์ตัดสิน"
              />

              <ExpandableTextarea readOnly={isReadOnly}
                id="perception"
                label="3. มุมมองต่อโลกและผู้คน"
                rows={3}
                value={character.perception}
                onChange={v => onUpdateField('perception', v)}
                placeholder="โลกนี้โหดร้าย ทุกคนมีเจตนาแอบแฝง"
              />

              <ExpandableTextarea readOnly={isReadOnly}
                id="expression"
                label="4. วิธีแสดงออก (Expression)"
                rows={3}
                value={character.expression}
                onChange={v => onUpdateField('expression', v)}
                placeholder="นิ่งสงบ ไม่แสดงความกลัวหรือความอ่อนแอออกมา"
              />

              <ExpandableTextarea readOnly={isReadOnly}
                id="behaviorUnderEmotion"
                label="5. พฤติกรรมเมื่อเกิดอารมณ์รุนแรง"
                rows={3}
                value={character.behaviorUnderEmotion}
                onChange={v => onUpdateField('behaviorUnderEmotion', v)}
                placeholder="ยิ่งโกรธจะยิ่งเงียบและสุขุม แต่สายตาจะดุดันน่ากลัว"
              />

              <ExpandableTextarea readOnly={isReadOnly}
                id="emotionalTriggers"
                label="6. จุดเปราะบางทางอารมณ์ (Triggers)"
                rows={3}
                value={character.emotionalTriggers}
                onChange={v => onUpdateField('emotionalTriggers', v)}
                placeholder="เมื่อ {{user}} ตกอยู่ในอันตราย หรือถูกทำร้าย"
              />
            </div>

            <ExpandableTextarea readOnly={isReadOnly}
              id="flawsWeaknesses"
              label="7. ข้อเสียและจุดอ่อน (Flaws & Weaknesses)"
              rows={3}
              value={character.flawsWeaknesses}
              onChange={v => onUpdateField('flawsWeaknesses', v)}
              placeholder="หึงหวงรุนแรง ควบคุมอารมณ์ยากเมื่อเกี่ยวกับ {{user}} ไม่ยอมรับความช่วยเหลือจากใครง่ายๆ"
            />
          </div>
        </FormSection>

        {/* 4. ความสัมพันธ์กับ {{user}} */}
        <FormSection
          id="sec-relationship"
          title="4. ความสัมพันธ์กับ {{user}} (Relationship)"
          icon={<HeartHandshake className="w-4 h-4 text-red-500" />}
          description="บทบาทในเรื่อง, ปูมหลัง, สถานะเริ่มต้น และทัศนคติที่มีต่อ {{user}}"
          defaultOpen={false}
        >
          <ExpandableTextarea readOnly={isReadOnly}
            id="userStoryRole"
            label="บทบาทของ {{user}} ในสายตาตัวละคร"
            rows={3}
            value={character.userStoryRole}
            onChange={v => onUpdateField('userStoryRole', v)}
            placeholder="เป็นลูกหนี้ที่ต้องชดใช้ด้วยร่างกาย / เป็นแฟนเก่าที่กลับมาเจอกัน / เป็นเลขาคนโปรด"
          />

          <FieldRow label="สถานะความสัมพันธ์เริ่มต้น" htmlFor="initialRelationship">
            <input
              id="initialRelationship"
              type="text"
              value={character.initialRelationship}
              onChange={e => onUpdateField('initialRelationship', e.target.value)}
              placeholder="เจ้าหนี้กับลูกหนี้ / คนแปลกหน้าที่ต้องแต่งงานกัน"
              className={`form-input ${isReadOnly ? 'bg-muted/30 cursor-not-allowed select-text' : ''}`} readOnly={isReadOnly}
            />
          </FieldRow>

          <ExpandableTextarea readOnly={isReadOnly}
            id="relationshipBackstory"
            label="ปูมหลังความสัมพันธ์ (Backstory)"
            hint="เล่าเหตุการณ์ในอดีตที่ผูกพันกัน"
            rows={5}
            value={character.relationshipBackstory}
            onChange={v => onUpdateField('relationshipBackstory', v)}
            placeholder="ทั้งสองเคยรู้จักกันในวัยเด็ก ก่อนที่ฝ่ายชายจะหายตัวไปและกลับมาในฐานะหัวหน้าแก๊ง..."
          />

          <ExpandableTextarea readOnly={isReadOnly}
            id="userAttitude"
            label="ทัศนคติที่มีต่อ {{user}} (Attitude)"
            rows={4}
            value={character.userAttitude}
            onChange={v => onUpdateField('userAttitude', v)}
            placeholder="มองว่า {{user}} เป็นคนดื้อรั้นแต่น่ารัก อยากปกป้องและอยากครอบครองไว้คนเดียว"
          />
        </FormSection>

        {/* 5. ขอบเขตและ Logic ขั้นเด็ดขาด */}
        <FormSection
          id="sec-rules"
          title="5. ขอบเขตและ Logic ขั้นเด็ดขาด (Rules & Logic)"
          icon={<ShieldAlert className="w-4 h-4 text-amber-500" />}
          description="พฤติกรรมที่ห้ามทำเด็ดขาด, มุมอ่อนโยน, ด้านมืด และกฎระบบ"
          defaultOpen={false}
          badge={character.systemRules.length}
        >
          <ExpandableTextarea readOnly={isReadOnly}
            id="absoluteAntiBehaviors"
            label="พฤติกรรมที่ห้ามทำเด็ดขาด (Anti-Behaviors) *"
            hint="เช่น ห้ามทำร้าย {{user}}, ห้ามร้องไห้ต่อหน้าศัตรู"
            rows={4}
            value={character.absoluteAntiBehaviors}
            onChange={v => onUpdateField('absoluteAntiBehaviors', v)}
            placeholder="ห้ามทำร้ายร่างกาย {{user}} โดยเด็ดขาด, ห้ามยอมก้มหัวให้ใคร, ห้ามยอมแพ้ต่อแรงกดดัน"
          />

          <ExpandableTextarea readOnly={isReadOnly}
            id="hiddenSoftSide"
            label="มุมอ่อนโยนที่ซ่อนไว้ (Hidden Soft Side)"
            rows={4}
            value={character.hiddenSoftSide}
            onChange={v => onUpdateField('hiddenSoftSide', v)}
            placeholder="เมื่ออยู่กับ {{user}} สองต่อสองจะชอบนอนหนุนตัก ลูบผมเบาๆ และพูดด้วยน้ำเสียงนุ่มนวล"
          />

          <ExpandableTextarea readOnly={isReadOnly}
            id="darkSide"
            label="ด้านมืด / ความดิบเถื่อน (Dark Side)"
            rows={4}
            value={character.darkSide}
            onChange={v => onUpdateField('darkSide', v)}
            placeholder="พร้อมที่จะทำลายทุกคนที่คิดจะแตะต้องหรือพราก {{user}} ไปจากเขา"
          />

          <FieldRow label="กฎระบบ & ข้อห้ามสำหรับ AI" htmlFor="systemRules" hint="พิมพ์แล้วกด Enter">
            <TagInput readOnly={isReadOnly}
              id="systemRules"
              field="systemRules"
              tags={character.systemRules}
              placeholder="เช่น #ห้ามพูดแทนUser #เน้นบทสนทนาโต้ตอบ #ใช้ภาษาไทยสุภาพผสมดิบ..."
              onAdd={onAddTag}
              onRemove={onRemoveTag}
            />
          </FieldRow>
        </FormSection>

        {/* 6. พฤติกรรมทางเพศและบนเตียง */}
        <FormSection
          id="sec-nsfw-bed"
          title="6. พฤติกรรมทางเพศและบนเตียง (Bedroom & NSFW)"
          icon={<Flame className="w-4 h-4 text-orange-500" />}
          description="ลีลา, Kinks, Aftercare และบทสนทนาบนเตียง"
          defaultOpen={false}
        >
          <ExpandableTextarea readOnly={isReadOnly}
            id="sexualStyle"
            label="ลีลาและบทบาทบนเตียง (Sexual Style)"
            rows={4}
            value={character.sexualStyle}
            onChange={v => onUpdateField('sexualStyle', v)}
            placeholder="ดุดัน เผด็จการ ชอบควบคุมจังหวะทั้งหมด แต่คอยมองสีหน้าและฟังเสียงครางของ {{user}} ตลอดเวลา"
          />

          <ExpandableTextarea readOnly={isReadOnly}
            id="kinksPreferences"
            label="รสนิยมเฉพาะตัว / Kinks & Fetishes"
            rows={4}
            value={character.kinksPreferences}
            onChange={v => onUpdateField('kinksPreferences', v)}
            placeholder="ชอบกัดต้นคอทำรอย, ชอบจับข้อมือล็อกไว้เหนือหัว, Dirty Talk ด้วยเสียงกระซิบต่ำ"
          />

          <ExpandableTextarea readOnly={isReadOnly}
            id="aftercareStyle"
            label="การดูแลหลังเสร็จกิจ (Aftercare Style)"
            rows={4}
            value={character.aftercareStyle}
            onChange={v => onUpdateField('aftercareStyle', v)}
            placeholder="ดึงตัว {{user}} เข้ามากอดแนบอก เช็ดเหงื่อ จูบซับหน้าผาก และเตรียมน้ำดื่มให้"
          />
        </FormSection>

        {/* 7. Lifestyle */}
        <FormSection
          id="sec-lifestyle"
          title="7. Lifestyle & กิจวัตรประจำวัน"
          icon={<Coffee className="w-4 h-4 text-emerald-500" />}
          description="ตารางชีวิต, งานอดิเรก และกิจกรรมยามว่าง"
          defaultOpen={false}
        >
          <ExpandableTextarea readOnly={isReadOnly}
            id="dailyRoutine"
            label="กิจวัตรประจำวัน (Daily Routine)"
            rows={4}
            value={character.dailyRoutine}
            onChange={v => onUpdateField('dailyRoutine', v)}
            placeholder="ตื่นเช้า 05:30 ออกกำลังกาย / ดื่มกาแฟดำ / ทำงานในห้องทำงานลับ / กลับ Penthouse ตอนค่ำ"
          />
        </FormSection>

        {/* 8. ฉากหลัง & สถานที่ */}
        <FormSection
          id="sec-locations"
          title="8. ฉากหลัง & สถานที่ (Tone & Locations)"
          icon={<MapPin className="w-4 h-4 text-blue-500" />}
          description="บรรยากาศของเรื่อง และสถานที่สำคัญ (สูงสุด 10 สถานที่)"
          defaultOpen={false}
          badge={character.locations.length}
        >
          <ExpandableTextarea readOnly={isReadOnly}
            id="toneSetting"
            label="โทนเรื่องและบรรยากาศ (Tone & Setting)"
            rows={3}
            value={character.toneSetting}
            onChange={v => onUpdateField('toneSetting', v)}
            placeholder="มาเฟียโรแมนติก ดาร์ก ดราม่า ตึงเครียด สลับกับความหวานซ่อนเปรี้ยว"
          />

          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground">
                สถานที่ในเรื่อง ({character.locations.length}/10)
              </span>
              {!isReadOnly && character.locations.length < 10 && (
                <div className="flex items-center gap-2">
                {onLoadDefaultLocations && (
                  <button
                    type="button"
                    onClick={onLoadDefaultLocations}
                    className="px-2.5 py-1 rounded-lg bg-pink-500/10 hover:bg-pink-500/20 text-pink-600 dark:text-pink-400 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
                    title="โหลด Template 10 สถานที่มาตรฐานสำหรับ Purrpaw"
                  >
                    <span>🐱</span> โหลด Template 10 สถานที่ Purrpaw
                  </button>
                )}
                {character.locations.length < 10 && (
                  <button
                    type="button"
                    onClick={() => onAddLocation()}
                    className="px-2.5 py-1 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-xs font-semibold transition-colors cursor-pointer"
                  >
                    + เพิ่มสถานที่ ({character.locations.length}/10)
                  </button>
                )}
              </div>
              )}
            </div>

            {character.locations.map((loc, idx) => (
              <div key={loc.id || idx} className="p-3 rounded-xl border border-border bg-muted/20 space-y-2 relative">
                {!isReadOnly && (
                  <button
                    type="button"
                    onClick={() => onRemoveLocation(idx)}
                    className="absolute top-2.5 right-2.5 text-xs text-muted-foreground hover:text-rose-500 cursor-pointer"
                  >
                    ✕
                  </button>
                )}
                <div className={`grid grid-cols-1 sm:grid-cols-2 gap-2 ${isReadOnly ? '' : 'pr-6'}`}>
                  <FieldRow label={'ชื่อสถานที่ #' + (idx + 1)} htmlFor={'loc-name-' + idx}>
                    <input
                      id={'loc-name-' + idx}
                      type="text"
                      value={loc.name}
                      onChange={e => onUpdateLocation(idx, { name: e.target.value })}
                      placeholder="เช่น Penthouse หรู"
                      className={`form-input text-xs ${isReadOnly ? 'bg-muted/30 cursor-not-allowed select-text' : ''}`}
                      readOnly={isReadOnly}
                    />
                  </FieldRow>
                  <FieldRow label="Prompt บรรยายสถานที่ (สั้น กระชับ)" htmlFor={'loc-prompt-' + idx}>
                    <input
                      id={'loc-prompt-' + idx}
                      type="text"
                      value={loc.prompt}
                      onChange={e => onUpdateLocation(idx, { prompt: e.target.value })}
                      placeholder="ห้องกว้าง วิวเมืองกระจกบานใหญ่ เฟอร์นิเจอร์สีดำ แสงสลัว"
                      className={`form-input text-xs ${isReadOnly ? 'bg-muted/30 cursor-not-allowed select-text' : ''}`}
                      readOnly={isReadOnly}
                    />
                  </FieldRow>
                </div>
              </div>
            ))}
          </div>
        </FormSection>

        {/* 9. ตัวละครเสริม */}
        <FormSection
          id="sec-subchars"
          title="9. ตัวละครเสริม (Supporting Characters)"
          icon={<Users className="w-4 h-4 text-indigo-500" />}
          description="จัดการตัวละครเสริมในเรื่อง (สูงสุด 5 ตัว)"
          defaultOpen={false}
          badge={character.supportingCharacters.length}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <ExpandableTextarea readOnly={isReadOnly}
              id="subCharRules"
              label="กฎการควบคุมตัวละครเสริม (Sub-char Rules)"
              rows={3}
              value={character.subCharRules}
              onChange={v => onUpdateField('subCharRules', v)}
              placeholder="ห้ามแย่งซีนตัวหลัก, เปลี่ยนบุคลิกกะทันหัน..."
            />
            <ExpandableTextarea readOnly={isReadOnly}
              id="subCharAllowed"
              label="สิ่งที่ตัวละครเสริมทำได้ (Allowed Actions)"
              rows={3}
              value={character.subCharAllowed}
              onChange={v => onUpdateField('subCharAllowed', v)}
              placeholder="อยู่ในบทสนทนาหลักได้, ช่วยดำเนินเรื่องเมื่อถึงจุดตัน..."
            />
          </div>

          <div className="space-y-3 pt-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground">
                รายชื่อตัวละครเสริม ({character.supportingCharacters.length}/5)
              </span>
              {character.supportingCharacters.length < 5 && (
                <button
                  type="button"
                  onClick={handleAddSubCharWithLimit}
                  className="px-2.5 py-1 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-xs font-semibold transition-colors cursor-pointer"
                >
                  + เพิ่มตัวละครเสริม
                </button>
              )}
            </div>

            {character.supportingCharacters.map((sub, idx) => {
              const isExpanded = expandedSubChars[idx] ?? (idx === 0 || idx === character.supportingCharacters.length - 1);
              return (
                <div key={sub.id || idx} className="rounded-xl border border-border bg-muted/20 overflow-hidden transition-all">
                  {/* Accordion Header */}
                  <div className="p-3 bg-muted/40 border-b border-border/60 flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <label className="flex items-center gap-1.5 text-xs font-semibold text-foreground cursor-pointer flex-shrink-0">
                        <input
                          type="checkbox"
                          disabled={isReadOnly}
                          checked={sub.isSelected !== false}
                          onChange={(e) => onUpdateSubCharacter(idx, { isSelected: e.target.checked })}
                          className="w-3.5 h-3.5 rounded border-border text-primary focus:ring-primary/50 cursor-pointer disabled:opacity-50"
                        />
                        <span className="text-[11px] text-muted-foreground">ส่งออก Prompt</span>
                      </label>
                      <span className="text-xs font-bold text-foreground truncate">
                        ตัวที่ {idx + 1}: {sub.name || 'ตัวละครไม่มีชื่อ'} {sub.relationship ? `(${sub.relationship})` : ''}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => toggleSubCharExpand(idx)}
                        className="px-2 py-1 rounded-md text-[11px] font-semibold text-muted-foreground hover:text-foreground bg-card border border-border/60 cursor-pointer flex items-center gap-1"
                      >
                        {isExpanded ? (
                          <>
                            <span>ย่อ</span>
                            <ChevronUp className="w-3 h-3" />
                          </>
                        ) : (
                          <>
                            <span>แก้ไข</span>
                            <ChevronDown className="w-3 h-3" />
                          </>
                        )}
                      </button>

                      {!isReadOnly && (
                        <button
                          type="button"
                          onClick={() => onRemoveSubCharacter(idx)}
                          title="ลบตัวละครเสริมนี้"
                          className="p-1 rounded-md text-xs text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Accordion Body */}
                  {isExpanded && (
                    <div className="p-3.5 space-y-3">
                      <div className="grid grid-cols-3 gap-2">
                        <FieldRow label="ชื่อ" htmlFor={'sub-name-' + idx}>
                          <input
                            readOnly={isReadOnly}
                            id={'sub-name-' + idx}
                            type="text"
                            value={sub.name}
                            onChange={e => onUpdateSubCharacter(idx, { name: e.target.value })}
                            placeholder="เช่น ธันวา"
                            className="form-input text-xs"
                          />
                        </FieldRow>
                        <FieldRow label="เพศ" htmlFor={'sub-gender-' + idx}>
                          <input
                            readOnly={isReadOnly}
                            id={'sub-gender-' + idx}
                            type="text"
                            value={sub.gender}
                            onChange={e => onUpdateSubCharacter(idx, { gender: e.target.value })}
                            placeholder="ชาย"
                            className="form-input text-xs"
                          />
                        </FieldRow>
                        <FieldRow label="อายุ" htmlFor={'sub-age-' + idx}>
                          <input
                            readOnly={isReadOnly}
                            id={'sub-age-' + idx}
                            type="text"
                            value={sub.age}
                            onChange={e => onUpdateSubCharacter(idx, { age: e.target.value })}
                            placeholder="30 ปี"
                            className="form-input text-xs"
                          />
                        </FieldRow>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <FieldRow label="ความสัมพันธ์กับตัวหลัก" htmlFor={'sub-rel-' + idx}>
                          <input
                            readOnly={isReadOnly}
                            id={'sub-rel-' + idx}
                            type="text"
                            value={sub.relationship}
                            onChange={e => onUpdateSubCharacter(idx, { relationship: e.target.value })}
                            placeholder="มือขวา, เพื่อนสนิท, ศัตรู..."
                            className="form-input text-xs"
                          />
                        </FieldRow>
                        <FieldRow label="หน้าที่หลักในเรื่อง" htmlFor={'sub-role-' + idx}>
                          <input
                            readOnly={isReadOnly}
                            id={'sub-role-' + idx}
                            type="text"
                            value={sub.mainRole}
                            onChange={e => onUpdateSubCharacter(idx, { mainRole: e.target.value })}
                            placeholder="สนับสนุนข้อมูล, สร้างความขัดแย้ง..."
                            className="form-input text-xs"
                          />
                        </FieldRow>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <FieldRow label="บุคลิก/นิสัย" htmlFor={'sub-pers-' + idx}>
                          <input
                            readOnly={isReadOnly}
                            id={'sub-pers-' + idx}
                            type="text"
                            value={sub.personality}
                            onChange={e => onUpdateSubCharacter(idx, { personality: e.target.value })}
                            placeholder="ใจเย็น ฉลาด กวนประสาท..."
                            className="form-input text-xs"
                          />
                        </FieldRow>
                        <FieldRow label="เงื่อนไขการปรากฏตัว" htmlFor={'sub-appear-' + idx}>
                          <input
                            readOnly={isReadOnly}
                            id={'sub-appear-' + idx}
                            type="text"
                            value={sub.appearWhen}
                            onChange={e => onUpdateSubCharacter(idx, { appearWhen: e.target.value })}
                            placeholder="เมื่อมีภารกิจฉุกเฉิน, อยู่ในบาร์..."
                            className="form-input text-xs"
                          />
                        </FieldRow>
                      </div>

                      <ExpandableTextarea readOnly={isReadOnly}
                        id={'sub-desc-' + idx}
                        label="คำอธิบายสั้น (Short Desc / Purrpaw / Khui)"
                        rows={2}
                        value={sub.shortDesc}
                        onChange={v => onUpdateSubCharacter(idx, { shortDesc: v })}
                        placeholder="คำอธิบายตัวละครแบบย่อ..."
                      />

                      <ExpandableTextarea readOnly={isReadOnly}
                        id={'sub-prompt-' + idx}
                        label="กฎเฉพาะ หรือ คำสั่งเพิ่มเติมสำหรับตัวละครนี้ (Custom Role Directive)"
                        rows={2}
                        value={sub.systemPrompt}
                        onChange={v => onUpdateSubCharacter(idx, { systemPrompt: v })}
                        placeholder="กฎการควบคุมตัวตนเพิ่มเติม (ระบบจะจัดโครงสร้าง Tag ให้อัตโนมัติ)..."
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </FormSection>

        {/* 10. คำโปรย & บทนำ */}
        <FormSection
          id="sec-pitches"
          title="10. คำโปรย & บทนำ / ฉากเปิด (Greeting & Pitch)"
          icon={<MessageSquareQuote className="w-4 h-4 text-cyan-500" />}
          description="Short Intro, Punchline, เรื่องย่อ และบทนำฉากเปิดตัวละคร"
          defaultOpen={false}
          badge={character.categoryTags.length}
        >
          <ExpandableTextarea readOnly={isReadOnly}
            id="shortIntro"
            label="คำโปรยสั้น (Short Intro)"
            rows={3}
            value={character.shortIntro}
            onChange={v => onUpdateField('shortIntro', v)}
            placeholder="เมื่อลูกหนี้ตัวน้อยต้องมาชดใช้หนี้ด้วยการเป็นเลขาข้างกายมาเฟียหนุ่มสุดเย็นชา..."
          />

          <ExpandableTextarea readOnly={isReadOnly}
            id="punchline"
            label="ประโยคเด็ดประจำตัว (Punchline - 1 ประโยคเด็ด)"
            rows={2}
            value={character.punchline}
            onChange={v => onUpdateField('punchline', v)}
            placeholder={"'หนี้ของคุณ... ต้องจ่ายด้วยทั้งตัวและหัวใจเท่านั้น'"}
          />

          <ExpandableTextarea readOnly={isReadOnly}
            id="plotSummary"
            label="พล็อตและเรื่องย่อ (Plot Summary)"
            rows={5}
            value={character.plotSummary}
            onChange={v => onUpdateField('plotSummary', v)}
            placeholder="การพบกันอีกครั้งระหว่างสองคนในสถานการณ์ที่บีบคั้น นำพาไปสู่ความสัมพันธ์อันซับซ้อน..."
          />

          <ExpandableTextarea readOnly={isReadOnly}
            id="publicInfo"
            label="ข้อมูลสาธารณะ (Public Info)"
            rows={4}
            value={character.publicInfo}
            onChange={v => onUpdateField('publicInfo', v)}
            placeholder="ประธานบริษัท คชา กรุ๊ป บุคคลผู้ทรงอิทธิพลที่สุดในวงการธุรกิจ"
          />

          <FieldRow label="แท็กหมวดหมู่เนื้อหา" htmlFor="categoryTags">
            <TagInput readOnly={isReadOnly}
              id="categoryTags"
              field="categoryTags"
              tags={character.categoryTags}
              placeholder="เพิ่มแท็ก เช่น #มาเฟีย #โรแมนติก #ดราม่า..."
              onAdd={onAddTag}
              onRemove={onRemoveTag}
            />
          </FieldRow>

          <ExpandableTextarea readOnly={isReadOnly}
            id="momentIntro"
            label="คำแนะนำตัวสั้น / สร้างโมเมนต์ (Moment Intro)"
            rows={2}
            value={character.momentIntro}
            onChange={v => onUpdateField('momentIntro', v)}
            placeholder={"คชา - 'อย่าคิดจะหนีไปจากฉัน... เพราะเธอไม่มีวันทำสำเร็จ'"}
          />

          {/* Open Greetings */}
          <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-3.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <span>🎭</span> ฉากเปิดตัวละคร (Open Greeting)
              </h4>
              <span className="text-[10px] text-muted-foreground">ใช้สำหรับข้อความแรกเมื่อเริ่มคุย</span>
            </div>

            {/* Primary Full Greeting Input */}
            <ExpandableTextarea readOnly={isReadOnly}
              id="fullGreeting"
              label="ฉากเปิดรวมทั้งหมด (Full Open Greeting) *"
              hint="กรอกบทบรรยายพร้อมบทพูดเปิดตัวได้ทันทีในช่องเดียว เพื่อความรวดเร็วและลดความซ้ำซ้อน"
              rows={6}
              value={character.fullGreeting}
              onChange={v => onUpdateField('fullGreeting', v)}
              placeholder={"ร่างสูงนั่งเอนหลังพิงเก้าอี้หนังสีดำในห้องทำงานชั้นบนสุด ดวงตาคมกริบจ้องมองมาที่คุณ... 'มาตรงเวลาดีนี่... เข้ามาใกล้ๆ สิ ฉันมีงานสำคัญให้เธอทำ'"}
            />

            
          </div>
        </FormSection>

        {/* SECTION 11: คลังเก็บข้อมูลส่วนเกิน (Garage Storage) */}
        <FormSection
          id="section-garage"
          title="11. คลังเก็บข้อมูลส่วนเกิน (Garage Storage)"
          icon={<Archive className="w-4 h-4 text-amber-500" />}
          description="ช่องสำหรับเก็บข้อมูลดิบ, กฎเพิ่มเติม, หรือ Prompt อิสระที่ไม่อยู่ใน 10 หมวดหมู่หลัก (ระบบจะส่งออกไปยัง Rubii, Purrpaw, Khui AI อัตโนมัติ)"
          badge={character.garageStorage ? character.garageStorage.length : undefined}
        >
          <ExpandableTextarea readOnly={isReadOnly}
            id="garageStorage"
            label="คลังเก็บข้อมูลส่วนเกิน / ข้อมูลเพิ่มเติม (Garage Storage)"
            hint="บันทึกข้อความอิสระ, Lore พิเศษ, หรือเงื่อนไขเพิ่มเติมที่ต้องการให้ AI จดจำ"
            rows={5}
            value={character.garageStorage || ''}
            onChange={v => onUpdateField('garageStorage', v)}
            placeholder="ใส่ข้อมูลดิบ, รายละเอียดฉาก, ประวัติลับ หรือข้อความ Prompt เสริมที่ต้องการส่งต่อไปยัง AI..."
          />
        </FormSection>
      </div>
    
      {/* AI Assistant Modal */}
      <AIAssistantModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        currentCharacter={character}
        onApplyCharacter={handleAIApply}
      />
    </div>
  );
}
