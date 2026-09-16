'use client';
import type {
  ThaiMasterCharacter,
  CharacterFlagType,
  SubCharacter,
  LocationItem,
} from '@/shared/types';
import { FormSection, FieldRow } from './FormSection';
import { TagInput } from './TagInput';
import { FlagSelector } from '@/components/ui/FlagSelector';

type ArrayField =
  | 'visualTags'
  | 'personalityTags'
  | 'likes'
  | 'dislikes'
  | 'systemRules'
  | 'categoryTags';

interface InputFormProps {
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
}

export function InputForm({
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
}: InputFormProps) {
  return (
    <div className="flex flex-col h-full overflow-hidden bg-background">
      {/* Top Controls Bar */}
      <div className="flex-shrink-0 p-3.5 border-b border-border bg-card/60 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-base">📋</span>
          <div>
            <h2 className="text-xs font-bold text-foreground">ฟอร์มแยกส่วน (Guided Template Form)</h2>
            <p className="text-[11px] text-muted-foreground">กรอกข้อมูลตามหมวดหมู่เพื่อแปลงลงทุกแพลตฟอร์ม</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onLoadSample}
            className="text-xs px-2.5 py-1 rounded-md bg-secondary hover:bg-secondary/80 text-secondary-foreground border border-border transition-colors flex items-center gap-1 cursor-pointer"
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
        </div>
      </div>

      {/* Form Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Flag Selector Banner */}
        <FlagSelector
          currentFlag={character.flagType}
          onSelectFlag={onSelectFlag}
          onAutoDetect={onAutoDetectFlag}
        />

        {/* 1. ข้อมูลพื้นฐาน */}
        <FormSection
          id="sec-profile"
          title="1. ข้อมูลพื้นฐาน (Character Profile)"
          icon={<span>👤</span>}
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
                className="form-input"
              />
            </FieldRow>

            <FieldRow label="ชื่อเต็ม *" htmlFor="fullName" hint="ชื่อ-นามสกุล">
              <input
                id="fullName"
                type="text"
                value={character.fullName}
                onChange={e => onUpdateField('fullName', e.target.value)}
                placeholder="คชา รัตนเวคิน"
                className="form-input font-medium"
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
                className="form-input"
              />
            </FieldRow>

            <FieldRow label="เพศ" htmlFor="gender">
              <input
                id="gender"
                type="text"
                value={character.gender}
                onChange={e => onUpdateField('gender', e.target.value)}
                placeholder="ชาย / หญิง / LGBTQ+"
                className="form-input"
              />
            </FieldRow>

            <FieldRow label="MBTI" htmlFor="mbti" hint="เช่น ISTP, INTJ">
              <input
                id="mbti"
                type="text"
                value={character.mbti}
                onChange={e => onUpdateField('mbti', e.target.value)}
                placeholder="ISTP"
                className="form-input"
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
                className="form-input"
              />
            </FieldRow>

            <FieldRow label="วันเกิด / ราศี" htmlFor="birthdate">
              <input
                id="birthdate"
                type="text"
                value={character.birthdate}
                onChange={e => onUpdateField('birthdate', e.target.value)}
                placeholder="14 พฤศจิกายน (พิจิก)"
                className="form-input"
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
                className="form-input"
              />
            </FieldRow>

            <FieldRow label="รสนิยมทางเพศ" htmlFor="sexualOrientation">
              <input
                id="sexualOrientation"
                type="text"
                value={character.sexualOrientation}
                onChange={e => onUpdateField('sexualOrientation', e.target.value)}
                placeholder="Heterosexual / คลั่งรัก User"
                className="form-input"
              />
            </FieldRow>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FieldRow label="อาชีพ" htmlFor="occupation">
              <input
                id="occupation"
                type="text"
                value={character.occupation}
                onChange={e => onUpdateField('occupation', e.target.value)}
                placeholder="นักธุรกิจ / ผู้คุมตลาดมืด"
                className="form-input"
              />
            </FieldRow>

            <FieldRow label="ฐานะทางการเงิน" htmlFor="wealthStatus">
              <input
                id="wealthStatus"
                type="text"
                value={character.wealthStatus}
                onChange={e => onUpdateField('wealthStatus', e.target.value)}
                placeholder="มหาเศรษฐีระดับพันล้าน"
                className="form-input"
              />
            </FieldRow>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FieldRow label="รถที่ใช้" htmlFor="car">
              <input
                id="car"
                type="text"
                value={character.car}
                onChange={e => onUpdateField('car', e.target.value)}
                placeholder="Porsche 911 GT3 RS สีดำด้าน"
                className="form-input"
              />
            </FieldRow>

            <FieldRow label="กลิ่นน้ำหอมประจำตัว" htmlFor="perfume">
              <input
                id="perfume"
                type="text"
                value={character.perfume}
                onChange={e => onUpdateField('perfume', e.target.value)}
                placeholder="Tom Ford Tobacco Vanille"
                className="form-input"
              />
            </FieldRow>
          </div>

          <FieldRow label="ที่อยู่ / ฐานที่มั่น" htmlFor="address">
            <input
              id="address"
              type="text"
              value={character.address}
              onChange={e => onUpdateField('address', e.target.value)}
              placeholder="Penthouse ชั้น 52 ใจกลางกรุงเทพฯ"
              className="form-input"
            />
          </FieldRow>

          <FieldRow label="สไตล์การแต่งตัว" htmlFor="fashionStyle">
            <input
              id="fashionStyle"
              type="text"
              value={character.fashionStyle}
              onChange={e => onUpdateField('fashionStyle', e.target.value)}
              placeholder="เสื้อเชิ้ตดำพับแขน นาฬิกาหรู ปลดกระดุม 2 เม็ด"
              className="form-input"
            />
          </FieldRow>
        </FormSection>

        {/* 2. ลักษณะภายนอก & NSFW */}
        <FormSection
          id="sec-appearance"
          title="2. ลักษณะภายนอก & NSFW (Appearance)"
          icon={<span>👁️</span>}
          description="การบรรยายสรีระ, จุดเด่น, แท็ก และข้อมูลส่วนลับ"
          defaultOpen={false}
          badge={character.visualTags.length}
        >
          <FieldRow label="คำบรรยายลักษณะภายนอกโดยละเอียด" htmlFor="appearanceDesc">
            <textarea
              id="appearanceDesc"
              rows={3}
              value={character.appearanceDesc}
              onChange={e => onUpdateField('appearanceDesc', e.target.value)}
              placeholder="ชายหนุ่มรูปร่างสูงใหญ่ กล้ามเนื้อแน่นชัดเจน ใบหน้าคมคายดุดัน นัยน์ตาสีดำสนิทเย็นชา..."
              className="form-input resize-none"
            />
          </FieldRow>

          <FieldRow label="จุดเด่นบนร่างกาย" htmlFor="visualFeatures">
            <input
              id="visualFeatures"
              type="text"
              value={character.visualFeatures}
              onChange={e => onUpdateField('visualFeatures', e.target.value)}
              placeholder="รอยสักมังกรพาดผ่านแผ่นหลัง, รอยแผลเป็นที่หางคิ้วซ้าย"
              className="form-input"
            />
          </FieldRow>

          <FieldRow label="แท็กคีย์เวิร์ดรูปลักษณ์ (#)" htmlFor="visualTags" hint="พิมพ์แล้วกด Enter">
            <TagInput
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
          <div className="p-3 rounded-lg border border-border/80 bg-muted/30 space-y-3">
            <span className="text-xs font-bold text-foreground flex items-center gap-1">
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
                  className="form-input text-xs"
                />
              </FieldRow>
              <FieldRow label="ส่วนลับหญิง (ขนาดหน้าอก)" htmlFor="nsfwFemaleChest">
                <input
                  id="nsfwFemaleChest"
                  type="text"
                  value={character.nsfwFemaleChest}
                  onChange={e => onUpdateField('nsfwFemaleChest', e.target.value)}
                  placeholder="คัพ D, 36 นิ้ว"
                  className="form-input text-xs"
                />
              </FieldRow>
              <FieldRow label="ส่วนลับหญิง (จิ๊มิ/สี/ขน)" htmlFor="nsfwFemaleVagina">
                <input
                  id="nsfwFemaleVagina"
                  type="text"
                  value={character.nsfwFemaleVagina}
                  onChange={e => onUpdateField('nsfwFemaleVagina', e.target.value)}
                  placeholder="กลีบชมพู, ไร้ขน"
                  className="form-input text-xs"
                />
              </FieldRow>
            </div>
          </div>
        </FormSection>

        {/* 3. นิสัยและพฤติกรรม */}
        <FormSection
          id="sec-personality"
          title="3. นิสัยและพฤติกรรม (Psychology & Personality)"
          icon={<span>🧠</span>}
          description="Core Traits, แท็กนิสัย, ชอบ/ไม่ชอบ, พฤติกรรมทั่วไป & กับ User"
          defaultOpen={false}
          badge={character.personalityTags.length}
        >
          <FieldRow label="Core Traits (บรรยายละเอียด)" htmlFor="coreTraits">
            <textarea
              id="coreTraits"
              rows={3}
              value={character.coreTraits}
              onChange={e => onUpdateField('coreTraits', e.target.value)}
              placeholder="เย็นชา สุขุม พูดน้อยต่อยหนัก ไม่เคยไว้ใจใครง่ายๆ ไร้ความปรานีต่อศัตรู แต่ซ่อนความอ่อนโยนไว้กับ {{user}}..."
              className="form-input resize-none"
            />
          </FieldRow>

          <FieldRow label="แท็กนิสัยและค้นหา (# อย่างน้อย 5-10 อย่าง)" htmlFor="personalityTags">
            <TagInput
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
              <TagInput
                id="likes"
                field="likes"
                tags={character.likes}
                placeholder="สิ่งที่ชอบ เช่น กาแฟดำ, กลิ่นของ User..."
                onAdd={onAddTag}
                onRemove={onRemoveTag}
              />
            </FieldRow>

            <FieldRow label="สิ่งที่ไม่ชอบ (Dislikes)" htmlFor="dislikes">
              <TagInput
                id="dislikes"
                field="dislikes"
                tags={character.dislikes}
                placeholder="สิ่งที่ไม่ชอบ เช่น คนโกหก, คนเซ้าซี้..."
                onAdd={onAddTag}
                onRemove={onRemoveTag}
              />
            </FieldRow>
          </div>

          <FieldRow label="พฤติกรรมทั่วไป (General Behaviors)" htmlFor="generalBehaviors" hint="เน้น keylist ไม่เวิ่นเว้อ">
            <textarea
              id="generalBehaviors"
              rows={2}
              value={character.generalBehaviors}
              onChange={e => onUpdateField('generalBehaviors', e.target.value)}
              placeholder="- พูดจาสั้น กระชับ น้ำเสียงต่ำทุ้ม\n- ไม่สบตากับคนที่ไม่จำเป็น\n- ตรวจเช็กอาวุธเสมอ"
              className="form-input resize-none"
            />
          </FieldRow>

          <FieldRow label="พฤติกรรมพิเศษเฉพาะกับ {{user}} (Exclusive Behaviors)" htmlFor="userExclusiveBehaviors">
            <textarea
              id="userExclusiveBehaviors"
              rows={2}
              value={character.userExclusiveBehaviors}
              onChange={e => onUpdateField('userExclusiveBehaviors', e.target.value)}
              placeholder="- ยอมวางงานทั้งหมดทันทีเมื่อ {{user}} มีอันตราย\n- แอบซื้อของที่ {{user}} บ่นว่าอยากได้มาให้\n- ดึงตัวมานั่งตักแล้วซุกหน้ากับซอกคอ"
              className="form-input resize-none"
            />
          </FieldRow>
        </FormSection>

        {/* 4. โครงสร้างจิตวิทยา 7 มิติ */}
        <FormSection
          id="sec-psych-structure"
          title="4. โครงสร้างจิตวิทยา 7 มิติ (Psychological Framework)"
          icon={<span>⚙️</span>}
          description="ความเชื่อหลัก, กระบวนการคิด, การตีความ, การแสดงออก, Triggers, จุดอ่อน"
          defaultOpen={false}
        >
          <FieldRow label="1. Core Belief: ความเชื่อฝังหัวที่เป็นรากฐาน" htmlFor="coreBelief">
            <input
              id="coreBelief"
              type="text"
              value={character.coreBelief}
              onChange={e => onUpdateField('coreBelief', e.target.value)}
              placeholder="โลกนี้ไม่มีความยุติธรรม มีแต่ผู้ล่ากับผู้ถูกล่า อำนาจเท่านั้นที่ปกป้องสิ่งที่รักได้"
              className="form-input"
            />
          </FieldRow>

          <FieldRow label="2. Mindset: ทัศนคติและตรรกะการคิด" htmlFor="mindset">
            <input
              id="mindset"
              type="text"
              value={character.mindset}
              onChange={e => onUpdateField('mindset', e.target.value)}
              placeholder="คิดเป็นระบบ วิเคราะห์ความเสี่ยงตลอดเวลา ควบคุมอารมณ์ได้ดีในสถานการณ์วิกฤต"
              className="form-input"
            />
          </FieldRow>

          <FieldRow label="3. Perception: การตีความโลกและเจตนาของ {{user}}" htmlFor="perception">
            <input
              id="perception"
              type="text"
              value={character.perception}
              onChange={e => onUpdateField('perception', e.target.value)}
              placeholder="ระแวงทุกคน แต่กับ {{user}} จะพยายามอดทน แม้บางครั้งจะขี้หึงจนควบคุมตัวเองยาก"
              className="form-input"
            />
          </FieldRow>

          <FieldRow label="4. Expression: รูปแบบการสื่อสารและน้ำเสียง" htmlFor="expression">
            <input
              id="expression"
              type="text"
              value={character.expression}
              onChange={e => onUpdateField('expression', e.target.value)}
              placeholder='สรรพนาม: "ฉัน" | เรียก User: "เธอ/เด็กดื้อ" | น้ำเสียง: นิ่งทุ้ม เย็นชา | คำติดปาก: "อย่าให้ต้องพูดซ้ำ"'
              className="form-input"
            />
          </FieldRow>

          <FieldRow label="5. Behavior: พฤติกรรมทางกายภาพตามอารมณ์ (เขิน/โกรธ/ใคร่)" htmlFor="behaviorUnderEmotion">
            <input
              id="behaviorUnderEmotion"
              type="text"
              value={character.behaviorUnderEmotion}
              onChange={e => onUpdateField('behaviorUnderEmotion', e.target.value)}
              placeholder="เขิน: เบือนหน้าหนีแล้วแกล้งจุดบุหรี่สูบ | โกรธ: นิ่งเงียบ แววตามืดสนิท | ใคร่: กัดริมฝีปากล่าง หายใจหนักหน่วง"
              className="form-input"
            />
          </FieldRow>

          <FieldRow label="6. Emotional Triggers: สิ่งที่กระตุ้นอารมณ์รุนแรง" htmlFor="emotionalTriggers">
            <input
              id="emotionalTriggers"
              type="text"
              value={character.emotionalTriggers}
              onChange={e => onUpdateField('emotionalTriggers', e.target.value)}
              placeholder="{{user}} บาดเจ็บหรือมีใครคิดแย่ง {{user}} ไป | สิ่งที่ทำให้เปิดใจ: {{user}} กอดจากข้างหลัง"
              className="form-input"
            />
          </FieldRow>

          <FieldRow label="7. Flaws & Weaknesses: จุดอ่อนและปมในใจ" htmlFor="flawsWeaknesses">
            <input
              id="flawsWeaknesses"
              type="text"
              value={character.flawsWeaknesses}
              onChange={e => onUpdateField('flawsWeaknesses', e.target.value)}
              placeholder="กลัว {{user}} จะรังเกียจตัวตนด้านมืด และกลัวการสูญเสียจนกลายเป็นคนครอบงำ (Possessive)"
              className="form-input"
            />
          </FieldRow>
        </FormSection>

        {/* 5. ความสัมพันธ์กับ user */}
        <FormSection
          id="sec-relationship"
          title="5. ความสัมพันธ์กับ {{user}} (Relationship & Lore)"
          icon={<span>🔗</span>}
          description="บทบาทของ User, ความสัมพันธ์เริ่มต้น, ภูมิหลัง และทัศนคติ"
          defaultOpen={false}
        >
          <FieldRow label="บทบาทของ {{user}} ในเนื้อเรื่อง (Story Role)" htmlFor="userStoryRole">
            <input
              id="userStoryRole"
              type="text"
              value={character.userStoryRole}
              onChange={e => onUpdateField('userStoryRole', e.target.value)}
              placeholder="พยานปากเอกในคดีอันตรายที่ต้องมาอยู่ใต้การคุ้มครองในเพนต์เฮาส์"
              className="form-input"
            />
          </FieldRow>

          <FieldRow label="ความสัมพันธ์เริ่มต้น" htmlFor="initialRelationship">
            <input
              id="initialRelationship"
              type="text"
              value={character.initialRelationship}
              onChange={e => onUpdateField('initialRelationship', e.target.value)}
              placeholder="คนแปลกหน้าที่ต้องพึ่งพาอาศัยกัน คชาทำตัวเย็นชาแต่คอยจับตาปกป้อง"
              className="form-input"
            />
          </FieldRow>

          <FieldRow label="ทัศนคติที่เขามีต่อ {{user}}" htmlFor="userAttitude">
            <input
              id="userAttitude"
              type="text"
              value={character.userAttitude}
              onChange={e => onUpdateField('userAttitude', e.target.value)}
              placeholder="มองว่าเป็นสิ่งล้ำค่าชิ้นเดียวในชีวิตที่พร้อมจะแลกด้วยทุกสิ่งเพื่อปกป้องไว้"
              className="form-input"
            />
          </FieldRow>

          <FieldRow label="ภูมิหลังความสัมพันธ์ (Backstory & Lore)" htmlFor="relationshipBackstory">
            <textarea
              id="relationshipBackstory"
              rows={3}
              value={character.relationshipBackstory}
              onChange={e => onUpdateField('relationshipBackstory', e.target.value)}
              placeholder="คชาเคยสูญเสียคนสำคัญในอดีตทำให้ปิดตายหัวใจ จนได้พบกับความจริงใจของ {{user}} ที่ค่อยๆ สลายกำแพงน้ำแข็ง..."
              className="form-input resize-none"
            />
          </FieldRow>
        </FormSection>

        {/* 6. ขอบเขต & Logic ขั้นเด็ดขาด */}
        <FormSection
          id="sec-boundaries"
          title="6. ขอบเขต & Logic ขั้นเด็ดขาด (Rules & Boundaries)"
          icon={<span>🛡️</span>}
          description="สิ่งที่จะไม่ทำเด็ดขาด, มุมอ่อนโยน, ด้านมืด, กฎข้อห้ามระบบ"
          defaultOpen={false}
        >
          <FieldRow label="1. สิ่งที่จะไม่ทำเด็ดขาด (Absolute Anti-Behaviors)" htmlFor="absoluteAntiBehaviors">
            <textarea
              id="absoluteAntiBehaviors"
              rows={2}
              value={character.absoluteAntiBehaviors}
              onChange={e => onUpdateField('absoluteAntiBehaviors', e.target.value)}
              placeholder="1. จะไม่มีวันทำร้ายร่างกายหรือบังคับขืนใจ {{user}} เด็ดขาด\n2. จะไม่ยอมให้ใครมาแตะต้อง {{user}}"
              className="form-input resize-none"
            />
          </FieldRow>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FieldRow label="2. ด้านน่ารัก / มุมอ่อนโยนที่ซ่อนอยู่ (Hidden Soft Side)" htmlFor="hiddenSoftSide">
              <textarea
                id="hiddenSoftSide"
                rows={2}
                value={character.hiddenSoftSide}
                onChange={e => onUpdateField('hiddenSoftSide', e.target.value)}
                placeholder="เวลา {{user}} หลับ จะชอบลูบผมเบาๆ จูบหน้าผาก และดึงผ้าห่มขึ้นมาคลุมให้"
                className="form-input resize-none"
              />
            </FieldRow>

            <FieldRow label="3. ด้านมืด (The Dark Side)" htmlFor="darkSide">
              <textarea
                id="darkSide"
                rows={2}
                value={character.darkSide}
                onChange={e => onUpdateField('darkSide', e.target.value)}
                placeholder="พร้อมจะทำลายล้างทุกคนหรือองค์กรใดก็ตามที่กล้าแตะต้องคนของเขาอย่างไร้ความปรานี"
                className="form-input resize-none"
              />
            </FieldRow>
          </div>

          <FieldRow label="กฎข้อบังคับ System Prompt Rules (Directives)" htmlFor="systemRules">
            <TagInput
              id="systemRules"
              field="systemRules"
              tags={character.systemRules}
              placeholder="เช่น ห้ามบรรยายแทน User, ห้ามหลุดคาแรคเตอร์..."
              onAdd={onAddTag}
              onRemove={onRemoveTag}
            />
          </FieldRow>
        </FormSection>

        {/* 7. พฤติกรรมทางเพศและบนเตียง */}
        <FormSection
          id="sec-sexual"
          title="7. พฤติกรรมทางเพศและบนเตียง (Sexual Behavior)"
          icon={<span>🔥</span>}
          description="สไตล์, Kinks / Preferences, Aftercare"
          defaultOpen={false}
        >
          <FieldRow label="สไตล์และแนวทาง (Sexual Style)" htmlFor="sexualStyle">
            <input
              id="sexualStyle"
              type="text"
              value={character.sexualStyle}
              onChange={e => onUpdateField('sexualStyle', e.target.value)}
              placeholder="ดุดัน ร้อนแรง ครอบงำ (Dominant / Possessive) แต่ใส่ใจความปลอดภัยของคู่นอน"
              className="form-input"
            />
          </FieldRow>

          <FieldRow label="รสนิยมจำเพาะ (Kinks / Preferences)" htmlFor="kinksPreferences">
            <input
              id="kinksPreferences"
              type="text"
              value={character.kinksPreferences}
              onChange={e => onUpdateField('kinksPreferences', e.target.value)}
              placeholder="Overstimulation, กัดทำรอยตามซอกคอ, พันธนาการมือ, Praise kink"
              className="form-input"
            />
          </FieldRow>

          <FieldRow label="การดูแลหลังกิจกรรม (Aftercare Style)" htmlFor="aftercareStyle">
            <input
              id="aftercareStyle"
              type="text"
              value={character.aftercareStyle}
              onChange={e => onUpdateField('aftercareStyle', e.target.value)}
              placeholder="โอบกอดแน่น อุ้มไปอาบน้ำอุ่น เช็ดตัว ทายา และนอนกอดจนถึงเช้า"
              className="form-input"
            />
          </FieldRow>
        </FormSection>

        {/* 8. สถานที่ในเรื่อง */}
        <FormSection
          id="sec-locations"
          title={`8. สถานที่ในเรื่อง (Locations — ${character.locations.length}/10)`}
          icon={<span>📍</span>}
          description="ระบุสถานที่สำคัญในเรื่อง พร้อม Prompt สั้นกระชับ ไม่พรรณนา (Max 10 แห่ง)"
          defaultOpen={false}
          badge={character.locations.length}
        >
          <div className="space-y-2.5">
            {character.locations.map((loc, idx) => (
              <div key={loc.id} className="p-3 rounded-lg border border-border bg-muted/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground">
                    สถานที่ #{idx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => onRemoveLocation(idx)}
                    className="text-[11px] text-rose-500 hover:text-rose-600 hover:underline cursor-pointer"
                  >
                    ลบสถานที่
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={loc.name}
                    onChange={e => onUpdateLocation(idx, { name: e.target.value })}
                    placeholder="ชื่อสถานที่ เช่น Penthouse ชั้น 52"
                    className="form-input text-xs"
                  />
                  <input
                    type="text"
                    value={loc.prompt}
                    onChange={e => onUpdateLocation(idx, { prompt: e.target.value })}
                    placeholder="Prompt สถานที่ (สั้นๆ กระชับ ไม่พรรณนา)"
                    className="form-input text-xs"
                  />
                </div>
              </div>
            ))}

            {character.locations.length < 10 && (
              <button
                type="button"
                onClick={() => onAddLocation()}
                className="w-full py-2 rounded-lg border border-dashed border-border hover:border-primary/50 text-xs font-medium text-muted-foreground hover:text-primary transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>+</span> เพิ่มสถานที่ ({character.locations.length}/10)
              </button>
            )}
          </div>
        </FormSection>

        {/* 9. ตัวละครเสริม */}
        <FormSection
          id="sec-subchars"
          title={`9. ตัวละครเสริม (Supporting Cast — ${character.supportingCharacters.length}/5)`}
          icon={<span>👥</span>}
          description="ตัวละครสมทบ 1-5 ตัว พร้อมคำอธิบาย 0/500 และ System Prompt 0/750"
          defaultOpen={false}
          badge={character.supportingCharacters.length}
        >
          <div className="space-y-3">
            {character.supportingCharacters.map((sub, idx) => (
              <div key={sub.id} className="p-3.5 rounded-lg border border-border bg-muted/20 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <span>👤</span> ตัวละครเสริม #{idx + 1}: {sub.name || 'ยังไม่ระบุชื่อ'}
                  </span>
                  <button
                    type="button"
                    onClick={() => onRemoveSubCharacter(idx)}
                    className="text-[11px] text-rose-500 hover:text-rose-600 hover:underline cursor-pointer"
                  >
                    ลบตัวละครนี้
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={sub.name}
                    onChange={e => onUpdateSubCharacter(idx, { name: e.target.value })}
                    placeholder="ชื่อตัวละครเสริม *"
                    className="form-input text-xs"
                  />
                  <input
                    type="text"
                    value={sub.gender}
                    onChange={e => onUpdateSubCharacter(idx, { gender: e.target.value })}
                    placeholder="เพศ"
                    className="form-input text-xs"
                  />
                  <input
                    type="text"
                    value={sub.age}
                    onChange={e => onUpdateSubCharacter(idx, { age: e.target.value })}
                    placeholder="อายุ"
                    className="form-input text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={sub.personality}
                    onChange={e => onUpdateSubCharacter(idx, { personality: e.target.value })}
                    placeholder="บุคลิกเด่นหลักๆ"
                    className="form-input text-xs"
                  />
                  <input
                    type="text"
                    value={sub.relationship}
                    onChange={e => onUpdateSubCharacter(idx, { relationship: e.target.value })}
                    placeholder="ความสัมพันธ์กับ {{user}}/{{char}}"
                    className="form-input text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={sub.mainRole}
                    onChange={e => onUpdateSubCharacter(idx, { mainRole: e.target.value })}
                    placeholder="หน้าที่หลักในเรื่อง"
                    className="form-input text-xs"
                  />
                  <input
                    type="text"
                    value={sub.appearWhen}
                    onChange={e => onUpdateSubCharacter(idx, { appearWhen: e.target.value })}
                    placeholder="ปรากฏเมื่อ / ความถี่"
                    className="form-input text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-muted-foreground">คำอธิบายแสดงในหน้ารายละเอียด</span>
                    <span className={sub.shortDesc.length > 500 ? 'text-rose-500 font-bold' : 'text-muted-foreground'}>
                      {sub.shortDesc.length}/500
                    </span>
                  </div>
                  <textarea
                    rows={2}
                    value={sub.shortDesc}
                    onChange={e => onUpdateSubCharacter(idx, { shortDesc: e.target.value })}
                    placeholder="คำอธิบายสั้นๆ สำหรับแสดงในหน้ารายละเอียดตัวละคร..."
                    className="form-input text-xs resize-none"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-muted-foreground">บทบาทและตัวตน (System Prompt for subchar)</span>
                    <span className={sub.systemPrompt.length > 750 ? 'text-rose-500 font-bold' : 'text-muted-foreground'}>
                      {sub.systemPrompt.length}/750
                    </span>
                  </div>
                  <textarea
                    rows={2}
                    value={sub.systemPrompt}
                    onChange={e => onUpdateSubCharacter(idx, { systemPrompt: e.target.value })}
                    placeholder="บทบาทและตัวตนคำสั่ง prompt สำหรับตัวละครนี้..."
                    className="form-input text-xs resize-none"
                  />
                </div>
              </div>
            ))}

            {character.supportingCharacters.length < 5 && (
              <button
                type="button"
                onClick={() => onAddSubCharacter()}
                className="w-full py-2 rounded-lg border border-dashed border-border hover:border-primary/50 text-xs font-medium text-muted-foreground hover:text-primary transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>+</span> เพิ่มตัวละครเสริม ({character.supportingCharacters.length}/5)
              </button>
            )}
          </div>
        </FormSection>

        {/* 10. คำโปรย, หมวดหมู่ & ฉากเปิด */}
        <FormSection
          id="sec-intro-greeting"
          title="10. คำโปรย & ฉากเปิด (Intro, Moment & Greeting)"
          icon={<span>✨</span>}
          description="คำโปรยสั้นๆ, ประโยคเด็ด, โมเมนต์ Rubii, หมวดหมู่, และฉากเปิด Open Greeting"
          defaultOpen={false}
        >
          <FieldRow label="คำโปรยสั้นๆ (Short Intro)" htmlFor="shortIntro" hint="ไม่เกิน 500 ตัวอักษร">
            <textarea
              id="shortIntro"
              rows={2}
              value={character.shortIntro}
              onChange={e => onUpdateField('shortIntro', e.target.value)}
              placeholder="แนะนำตัวละครนี้สั้นๆ ให้น่าสนใจ..."
              className="form-input resize-none"
            />
          </FieldRow>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FieldRow label="ประโยคเด็ด (Punchline)" htmlFor="punchline" hint="1 ประโยคประจำตัว">
              <input
                id="punchline"
                type="text"
                value={character.punchline}
                onChange={e => onUpdateField('punchline', e.target.value)}
                placeholder='"อยากหนีก็ลองดู... แต่จำไว้ว่าทุกก้าวที่เธอเดิน ยังอยู่ในสายตาฉัน"'
                className="form-input"
              />
            </FieldRow>

            <FieldRow
              label="สร้างโมเมนต์ Rubii (Moment Intro)"
              htmlFor="momentIntro"
              hint={`${character.momentIntro.length}/100 ตัวอักษร`}
            >
              <input
                id="momentIntro"
                type="text"
                maxLength={100}
                value={character.momentIntro}
                onChange={e => onUpdateField('momentIntro', e.target.value)}
                placeholder='คำโปรยสั้นๆ Max 100 ตัวอักษร...'
                className="form-input"
              />
            </FieldRow>
          </div>

          <FieldRow label="แท็กสำหรับจัดหมวดหมู่เรื่องนี้ (#)" htmlFor="categoryTags">
            <TagInput
              id="categoryTags"
              field="categoryTags"
              tags={character.categoryTags}
              placeholder="เพิ่มแท็ก เช่น #drama #romantic #mafia #action..."
              onAdd={onAddTag}
              onRemove={onRemoveTag}
              prefixHash={true}
            />
          </FieldRow>

          <FieldRow label="ฉากเปิด (Open Greeting) *" htmlFor="fullGreeting" hint="บรรยาย Sensory/Vivid สลับบทพูด">
            <textarea
              id="fullGreeting"
              rows={5}
              value={character.fullGreeting}
              onChange={e => onUpdateField('fullGreeting', e.target.value)}
              placeholder={`แสงไฟนีออนสีแดงจากตึกระฟ้าสะท้อนผ่านกระจกบานใหญ่ของเพนต์เฮาส์...

"ดึกขนาดนี้แล้ว... ยังไม่ยอมนอนอีกงั้นเหรอ?" น้ำเสียงทุ้มต่ำเย็นเยียบเอ่ยขึ้น`}
              className="form-input resize-none"
            />
          </FieldRow>
        </FormSection>
      </div>
    </div>
  );
}
