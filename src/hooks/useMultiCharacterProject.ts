'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import type {
  MultiCharacterProjectDraft,
  WorldSettingDraft,
  LoreDraft,
  RouteDraft,
  MainCharacterDraft,
  LoreTimelineItem
} from '@/shared/multiCharTypes';
import {
  DEFAULT_MULTI_PROJECT_DRAFT,
  DEFAULT_MAIN_CHARACTER_DRAFT
} from '@/shared/multiCharTypes';
import type { SubCharacter } from '@/shared/types';
import { DEFAULT_SUB_CHARACTER } from '@/shared/types';

export const RUBII_MULTI_DRAFT_KEY = 'sedchar_rubii_multi_draft_v1';
export const MAX_FREE_MAIN_CHARACTERS = 10;

export function useMultiCharacterProject() {
  const [project, setProject] = useState<MultiCharacterProjectDraft>(() => {
    if (typeof window === 'undefined') return DEFAULT_MULTI_PROJECT_DRAFT;
    try {
      const saved = localStorage.getItem(RUBII_MULTI_DRAFT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          return {
            ...DEFAULT_MULTI_PROJECT_DRAFT,
            ...parsed,
            worldSetting: { ...DEFAULT_MULTI_PROJECT_DRAFT.worldSetting, ...(parsed.worldSetting || {}) },
            lore: { ...DEFAULT_MULTI_PROJECT_DRAFT.lore, ...(parsed.lore || {}) },
            routes: Array.isArray(parsed.routes) ? parsed.routes : [],
            mainCharacters: Array.isArray(parsed.mainCharacters) && parsed.mainCharacters.length > 0
              ? parsed.mainCharacters
              : DEFAULT_MULTI_PROJECT_DRAFT.mainCharacters,
            supportingCharacters: Array.isArray(parsed.supportingCharacters) ? parsed.supportingCharacters : [],
          };
        }
      }
    } catch {}
    return DEFAULT_MULTI_PROJECT_DRAFT;
  });

  const isInitialMount = useRef(true);

  // Auto-save draft on project change (debounced 400ms)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(RUBII_MULTI_DRAFT_KEY, JSON.stringify(project));
      } catch {}
    }, 400);
    return () => clearTimeout(timer);
  }, [project]);

  // Project title updater
  const updateProjectTitle = useCallback((title: string) => {
    setProject(prev => ({
      ...prev,
      title,
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  // World Setting updater
  const updateWorldSetting = useCallback(<K extends keyof WorldSettingDraft>(
    key: K,
    value: WorldSettingDraft[K]
  ) => {
    setProject(prev => ({
      ...prev,
      worldSetting: {
        ...prev.worldSetting,
        [key]: value,
      },
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  // Lore updater
  const updateLore = useCallback(<K extends keyof LoreDraft>(
    key: K,
    value: LoreDraft[K]
  ) => {
    setProject(prev => ({
      ...prev,
      lore: {
        ...prev.lore,
        [key]: value,
      },
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  // Timeline Event management
  const addTimelineEvent = useCallback((initialData?: Partial<LoreTimelineItem>) => {
    setProject(prev => {
      const newEvent: LoreTimelineItem = {
        id: `event_${Date.now()}`,
        timeLabel: '',
        eventTitle: '',
        description: '',
        knownByCharacters: [],
        isSecret: false,
        ...initialData,
      };
      return {
        ...prev,
        lore: {
          ...prev.lore,
          timelineEvents: [...prev.lore.timelineEvents, newEvent],
        },
        updatedAt: new Date().toISOString(),
      };
    });
  }, []);

  const updateTimelineEvent = useCallback((index: number, data: Partial<LoreTimelineItem>) => {
    setProject(prev => {
      const updated = [...prev.lore.timelineEvents];
      if (updated[index]) {
        updated[index] = { ...updated[index], ...data };
      }
      return {
        ...prev,
        lore: {
          ...prev.lore,
          timelineEvents: updated,
        },
        updatedAt: new Date().toISOString(),
      };
    });
  }, []);

  const removeTimelineEvent = useCallback((index: number) => {
    setProject(prev => ({
      ...prev,
      lore: {
        ...prev.lore,
        timelineEvents: prev.lore.timelineEvents.filter((_, i) => i !== index),
      },
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  // Routes management
  const addRoute = useCallback((initialData?: Partial<RouteDraft>) => {
    setProject(prev => {
      const newRoute: RouteDraft = {
        id: `route_${Date.now()}`,
        routeName: `เส้นทางที่ ${prev.routes.length + 1}`,
        summary: '',
        involvedCharacterIds: [],
        entryCondition: '',
        exitOrBranchCondition: '',
        possibleEndings: '',
        relationshipDynamics: '',
        ...initialData,
      };
      return {
        ...prev,
        routes: [...prev.routes, newRoute],
        updatedAt: new Date().toISOString(),
      };
    });
  }, []);

  const updateRoute = useCallback((index: number, data: Partial<RouteDraft>) => {
    setProject(prev => {
      const updated = [...prev.routes];
      if (updated[index]) {
        updated[index] = { ...updated[index], ...data };
      }
      return {
        ...prev,
        routes: updated,
        updatedAt: new Date().toISOString(),
      };
    });
  }, []);

  const removeRoute = useCallback((index: number) => {
    setProject(prev => ({
      ...prev,
      routes: prev.routes.filter((_, i) => i !== index),
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  // Main Characters management (Free: Max 10)
  const addMainCharacter = useCallback((initialData?: Partial<MainCharacterDraft>): boolean => {
    let success = false;
    setProject(prev => {
      if (prev.mainCharacters.length >= MAX_FREE_MAIN_CHARACTERS) {
        return prev;
      }
      success = true;
      const newChar: MainCharacterDraft = {
        ...DEFAULT_MAIN_CHARACTER_DRAFT,
        id: `mc_${Date.now()}`,
        name: `ตัวละครหลักที่ ${prev.mainCharacters.length + 1}`,
        ...initialData,
      };
      return {
        ...prev,
        mainCharacters: [...prev.mainCharacters, newChar],
        updatedAt: new Date().toISOString(),
      };
    });
    return success;
  }, []);

  const updateMainCharacter = useCallback((id: string, data: Partial<MainCharacterDraft>) => {
    setProject(prev => ({
      ...prev,
      mainCharacters: prev.mainCharacters.map(c => c.id === id ? { ...c, ...data } : c),
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  const removeMainCharacter = useCallback((id: string) => {
    setProject(prev => {
      if (prev.mainCharacters.length <= 1) return prev; // keep at least 1
      return {
        ...prev,
        mainCharacters: prev.mainCharacters.filter(c => c.id !== id),
        updatedAt: new Date().toISOString(),
      };
    });
  }, []);

  // Supporting Characters (UNLIMITED)
  const addSupportingCharacter = useCallback((initialData?: Partial<SubCharacter>) => {
    setProject(prev => {
      const newSub: SubCharacter = {
        ...DEFAULT_SUB_CHARACTER,
        id: `sub_${Date.now()}`,
        name: `ตัวละครเสริมที่ ${prev.supportingCharacters.length + 1}`,
        ...initialData,
      };
      return {
        ...prev,
        supportingCharacters: [...prev.supportingCharacters, newSub],
        updatedAt: new Date().toISOString(),
      };
    });
  }, []);

  const updateSupportingCharacter = useCallback((index: number, data: Partial<SubCharacter>) => {
    setProject(prev => {
      const updated = [...prev.supportingCharacters];
      if (updated[index]) {
        updated[index] = { ...updated[index], ...data };
      }
      return {
        ...prev,
        supportingCharacters: updated,
        updatedAt: new Date().toISOString(),
      };
    });
  }, []);

  const removeSupportingCharacter = useCallback((index: number) => {
    setProject(prev => ({
      ...prev,
      supportingCharacters: prev.supportingCharacters.filter((_, i) => i !== index),
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  // Cast Rules updater
  const updateCastInteractionRules = useCallback((rules: string) => {
    setProject(prev => ({
      ...prev,
      castInteractionRules: rules,
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  // Reset project
  const resetProject = useCallback(() => {
    setProject(DEFAULT_MULTI_PROJECT_DRAFT);
    try {
      localStorage.removeItem(RUBII_MULTI_DRAFT_KEY);
    } catch {}
  }, []);

  // Load sample multi project
  const loadSampleProject = useCallback(() => {
    const sample: MultiCharacterProjectDraft = {
      id: 'proj_sample_triad_palace',
      schemaVersion: 1,
      platform: 'rubii',
      title: 'มหานครกรงทอง: รอยสักมังกรกับสายสัมพันธ์สีเลือด',
      status: 'draft',
      worldSetting: {
        projectName: 'มหานครกรงทอง: รอยสักมังกรกับสายสัมพันธ์สีเลือด',
        genreTone: 'โรแมนติก ดาร์กมาเฟีย ไซเบอร์พังก์/นีโอ-โอเรียนทัล',
        eraTimePeriod: 'โลกอนาคต 2099 นครรัฐเกาลูนใหม่',
        mainLocation: 'เดอะเวลเว็ทเพนต์เฮาส์ และคาสิโนใต้ดินมังกรราตรี',
        worldRulesOrMagicSystem: 'เทคโนโลยีนาโนดัดแปลงพันธุกรรม และระบบฟอกเงินผ่านเงินดิจิทัลไร้ศูนย์กลาง',
        factionsOrOrganizations: 'กลุ่มไตรภาคีเกาลูน, องค์กรพยัคฆ์เงา, หน่วยปราบปรามพิเศษ',
        atmosphereTheme: 'แสงนีออนสีแดงสะท้อนหมอกควัน ความหรูหราที่แฝงความตาย และเสน่ห์อันตราย',
      },
      lore: {
        worldBackstory: 'นครรัฐที่ถูกควบคุมด้วย 3 ตระกูลใหญ่ ทรัพย์สินและอำนาจกำหนดทุกสิ่งในชีวิต',
        coreConflict: 'การแย่งชิงสิทธิ์กุมบังเหียนคลังการเงินใต้ดิน และการปกป้อง {{user}} จากขั้วอำนาจอื่น',
        timelineEvents: [
          {
            id: 'ev_1',
            timeLabel: '3 ปีก่อน',
            eventTitle: '{{user}} ช่วยแมวจิงจิงที่หลงทาง',
            description: 'ซ้อเหมยประทับใจความบริสุทธิ์ใจของ {{user}} ตั้งแต่แรกพบ',
            knownByCharacters: ['char_mc_1'],
            isSecret: false,
          },
          {
            id: 'ev_2',
            timeLabel: '1 สัปดาห์ก่อน',
            eventTitle: 'การรวมตัวของ 3 ขั้วอำนาจเพื่อตามหา {{user}}',
            description: 'ซ้อเหมย วาเลน และเซลีน ตกลงร่วมกันกักขัง {{user}} ไว้ในเพนต์เฮาส์',
            knownByCharacters: ['char_mc_1', 'char_mc_2'],
            isSecret: true,
          }
        ],
        commonKnowledge: 'ซ้อเหมยคุมคาสิโนและคลังการเงิน ส่วนวาเลนคุมกำลังรบ',
        taboosOrMyths: 'ห้ามแตะต้องตัว {{user}} โดยไม่ได้รับอนุญาต และห้ามแทงข้างหลังเครือข่าย',
      },
      routes: [
        {
          id: 'route_1',
          routeName: 'รูทกรงทองซ้อเหมย (The Golden Velvet)',
          summary: 'เส้นทางความสัมพันธ์กับซ้อเหมย ถูกปรนเปรอด้วยเงินทอง ความเย้ายวน และมารยาหวานเคลือบยาพิษ',
          involvedCharacterIds: ['char_mc_1'],
          entryCondition: 'ยอมจำนนและยอมเป็นคนโปรด คอยดูแลแมวจิงจิงให้ซ้อ',
          exitOrBranchCondition: 'พยายามแอบหนี หรือยอมรับข้อเสนออำนาจของวาเลน',
          possibleEndings: 'Good End: กลายเป็นคู่ชีวิตที่คุมคลังเงินร่วมกับซ้อ / Bad End: โดนกักบริเวณบนเตียงตลอดกาล',
          relationshipDynamics: 'ซ้อเหมยชอบแกล้ง เปย์ไม่อั้น และหวงเหมือนสมบัติล้ำค่า',
        },
      ],
      mainCharacters: [
        {
          id: 'char_mc_1',
          name: 'ซ้อเหมย',
          aliasOrTitle: 'หลิน เหมยฮวา / นายหญิงคลังเงิน',
          gender: 'หญิง',
          age: '29 ปี',
          mbti: 'ENFJ',
          flagType: 'red',
          storyRole: 'ผู้กุมอำนาจการเงิน / ตัวละครเอกหญิงสายเปย์',
          corePersonality: 'ปากหวานก้นเปรี้ยว มารยาหญิงแพรวพราว ปากร้ายใจเย็น แต่หลงแมวและสายเปย์ตัวแม่',
          primaryGoalOrDesire: 'ผูกมัดหัวใจของ {{user}} ไว้ด้วยความหรูหราและความรักจนดิ้นไม่หลุด',
          relationshipWithUser: 'มองเป็นสมบัติล้ำค่ายิ่งกว่าทองคำ ยอมเปย์ทุกอย่างแลกกับการได้กอด',
          relationsWithOtherCast: 'เป็นพันธมิตรร่วมมือกับวาเลน แต่แอบชิงความเด่นเหนือ {{user}}',
          exclusiveSecretOrKnowledge: 'รู้รหัสผ่านคลังเซฟใต้ดิน และรู้ความลับการเคลื่อนไหวของทุกฝ่าย',
          absoluteRules: 'ไม่ทำร้ายร่างกาย {{user}} และไม่ยอมให้คนนอกมาแตะต้องเด็ดขาด',
          appearanceBrief: 'สวยหยาดเยิ้ม กี่เพ้าดำขลิบทองแหวกอกลึก รอยสักหงส์มังกรที่เนินอก สูง 170 ซม. อกคัพ F',
          speakingStyle: 'น้ำเสียงหวานหยาดเยิ้ม ลงท้ายคะขา จ๊ะจ๋า คำติดปาก: เป็นเด็กดีของซ้อนะจ๊ะ',
          nsfwBrief: 'Sensual & Teasing, Edging, Body Worship, Silk & Scent Play',
        },
        {
          id: 'char_mc_2',
          name: 'วาเลน',
          aliasOrTitle: 'ผู้บัญชาการพยัคฆ์ทมิฬ',
          gender: 'ชาย',
          age: '31 ปี',
          mbti: 'ENTJ',
          flagType: 'black',
          storyRole: 'ผู้กุมกำลังรบ / พันธมิตรขั้วตรงข้าม',
          corePersonality: 'เผด็จการ เย็นชา ตรงไปตรงมา แต่ยอมอ่อนข้อให้เฉพาะ {{user}}',
          primaryGoalOrDesire: 'ปกป้อง {{user}} ด้วยกำลังอาวุธและอำนาจเบ็ดเสร็จ',
          relationshipWithUser: 'มองเป็นจุดอ่อนเดียวในชีวิตที่ไม่ยอมให้ใครแตะ',
          relationsWithOtherCast: 'เกรงใจการเงินของซ้อเหมย แต่พร้อมปะทะถ้าซ้อข้ามเส้น',
          exclusiveSecretOrKnowledge: 'ควบคุมกองกำลังรักษาความปลอดภัยรอบเพนต์เฮาส์',
          absoluteRules: 'ห้ามใครพกอาวุธเข้าใกล้ห้องนอนของ {{user}}',
          appearanceBrief: 'ร่างสูงกำยำ 190 ซม. สูทดำมีเสื้อเกราะด้านใน แววตาดุร้ายมีแผลเป็นที่หางคิ้ว',
          speakingStyle: 'พูดห้วน สั้น มีอำนาจสั่งการ ไม่ชอบพูดประจบ',
        }
      ],
      supportingCharacters: [
        {
          id: 'sub_1',
          name: 'จิงจิง (แมวเปอร์เซียสีขาวตา 2 สี)',
          gender: 'ผู้',
          age: '3 ขวบ',
          personality: 'ขี้อ้อน เอาแต่ใจ ชอบนอนพุงหงายให้ {{user}} เกาพุง',
          relationship: 'แมวสุดรักสุดหวงของซ้อเหมย และเป็นสะพานเชื่อมให้ซ้อตามหา {{user}}',
          mainRole: 'ตัวเชื่อมความสัมพันธ์และตัวละลายพฤติกรรมในฉาก',
          appearWhen: 'ทุกครั้งที่อยู่ในห้องนั่งเล่นหรือห้องนอนของซ้อเหมย',
          shortDesc: '',
          systemPrompt: '',
        }
      ],
      castInteractionRules: `- เมื่อซ้อเหมยและวาเลนอยู่พร้อมกัน: ซ้อเหมยจะใช้คำพูดเหน็บแนม ส่วนวาเลนจะข่มด้วยท่าทาง\n- ในฉากที่มีการขัดแย้ง: ให้ User เป็นผู้เลือกตัดสินใจ และปฏิกิริยาของทั้งคู่จะเปลี่ยนตามการเลือก`,
      updatedAt: new Date().toISOString(),
    };
    setProject(sample);
    try {
      localStorage.setItem(RUBII_MULTI_DRAFT_KEY, JSON.stringify(sample));
    } catch {}
  }, []);

  return {
    project,
    updateProjectTitle,
    updateWorldSetting,
    updateLore,
    addTimelineEvent,
    updateTimelineEvent,
    removeTimelineEvent,
    addRoute,
    updateRoute,
    removeRoute,
    addMainCharacter,
    updateMainCharacter,
    removeMainCharacter,
    addSupportingCharacter,
    updateSupportingCharacter,
    removeSupportingCharacter,
    updateCastInteractionRules,
    resetProject,
    loadSampleProject,
    mainCharCount: project.mainCharacters.length,
    maxMainChars: MAX_FREE_MAIN_CHARACTERS,
  };
}
