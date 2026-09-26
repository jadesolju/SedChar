'use client';
import { useState, useEffect, useCallback } from 'react';
import type {
  MultiCharacterProjectDraft,
  WorldSettingDraft,
  LoreDraft,
  RouteDraft,
  MainCharacterDraft,
  LoreTimelineItem,
} from '@/shared/multiCharTypes';
import {
  DEFAULT_MULTI_PROJECT_DRAFT,
  DEFAULT_MAIN_CHARACTER_DRAFT,
} from '@/shared/multiCharTypes';
import type { SubCharacter } from '@/shared/types';

export const RUBII_MULTI_DRAFT_KEY = 'sedchar_rubii_multi_draft_v1';
export const MULTI_CHAR_LIBRARY_KEY = 'sedchar_multi_projects_library_v1';
export const MAX_FREE_MAIN_CHARACTERS = 10;

export interface SavedMultiProjectRecord {
  id: string;
  title: string;
  description: string;
  mainCharCount: number;
  subCharCount: number;
  routeCount: number;
  projectData: MultiCharacterProjectDraft;
  createdAt: string;
  updatedAt: string;
}

export function useMultiCharacterProject() {
  const [project, setProject] = useState<MultiCharacterProjectDraft>(() => {
    if (typeof window === 'undefined') return DEFAULT_MULTI_PROJECT_DRAFT;
    try {
      const stored = localStorage.getItem(RUBII_MULTI_DRAFT_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.schemaVersion === 1) {
          return parsed;
        }
      }
    } catch {}
    return DEFAULT_MULTI_PROJECT_DRAFT;
  });

  const [activeLibraryProjectId, setActiveLibraryProjectId] = useState<string | null>(null);

  // Saved Projects Library State
  const [savedProjects, setSavedProjects] = useState<SavedMultiProjectRecord[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(MULTI_CHAR_LIBRARY_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch {}
    return [];
  });

  // Auto-save active draft to LocalStorage whenever project changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(RUBII_MULTI_DRAFT_KEY, JSON.stringify(project));
    } catch (e) {
      console.error('Failed to auto-save multi-character project draft', e);
    }
  }, [project]);

  // Persist Saved Projects Library
  const persistLibrary = (records: SavedMultiProjectRecord[]) => {
    setSavedProjects(records);
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(MULTI_CHAR_LIBRARY_KEY, JSON.stringify(records));
    } catch (e) {
      console.error('Failed to persist multi-char project library', e);
    }
  };

  // Save / Overwrite in Project Library
  const saveProjectToLibrary = useCallback(
    (title?: string, idToOverwrite?: string) => {
      const now = new Date().toISOString();
      const projectTitle = title?.trim() || project.worldSetting.projectName?.trim() || project.title || 'โปรเจกต์ Multi-Char';
      const summaryDesc = project.worldSetting.genreTone || project.worldSetting.mainLocation || 'โปรเจกต์หลายตัวละคร';

      if (idToOverwrite) {
        // Overwrite existing record
        const next = savedProjects.map((rec) => {
          if (rec.id === idToOverwrite) {
            return {
              ...rec,
              title: projectTitle,
              description: summaryDesc,
              mainCharCount: project.mainCharacters.length,
              subCharCount: project.supportingCharacters.length,
              routeCount: project.routes.length,
              projectData: {
                ...project,
                title: projectTitle,
                updatedAt: now,
              },
              updatedAt: now,
            };
          }
          return rec;
        });
        persistLibrary(next);
        setActiveLibraryProjectId(idToOverwrite);
        return { success: true, id: idToOverwrite };
      } else {
        // Create new record
        const newId = 'proj_lib_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
        const newRecord: SavedMultiProjectRecord = {
          id: newId,
          title: projectTitle,
          description: summaryDesc,
          mainCharCount: project.mainCharacters.length,
          subCharCount: project.supportingCharacters.length,
          routeCount: project.routes.length,
          projectData: {
            ...project,
            id: newId,
            title: projectTitle,
            updatedAt: now,
          },
          createdAt: now,
          updatedAt: now,
        };
        persistLibrary([newRecord, ...savedProjects]);
        setActiveLibraryProjectId(newId);
        return { success: true, id: newId };
      }
    },
    [project, savedProjects]
  );

  // Load project from library
  const loadProjectFromLibrary = useCallback(
    (id: string) => {
      const record = savedProjects.find((p) => p.id === id);
      if (!record || !record.projectData) return false;
      setProject(record.projectData);
      setActiveLibraryProjectId(id);
      try {
        localStorage.setItem(RUBII_MULTI_DRAFT_KEY, JSON.stringify(record.projectData));
      } catch {}
      return true;
    },
    [savedProjects]
  );

  // Delete project from library
  const deleteProjectFromLibrary = useCallback(
    (id: string) => {
      const next = savedProjects.filter((p) => p.id !== id);
      persistLibrary(next);
      if (activeLibraryProjectId === id) {
        setActiveLibraryProjectId(null);
      }
    },
    [savedProjects, activeLibraryProjectId]
  );

  // Import JSON Project
  const importProjectJson = useCallback((imported: MultiCharacterProjectDraft) => {
    if (!imported || imported.schemaVersion !== 1) {
      throw new Error('รูปแบบไฟล์ JSON ไม่ตรงตาม Multi-Character Schema Version 1');
    }
    const cleanProject: MultiCharacterProjectDraft = {
      ...DEFAULT_MULTI_PROJECT_DRAFT,
      ...imported,
      worldSetting: { ...DEFAULT_MULTI_PROJECT_DRAFT.worldSetting, ...(imported.worldSetting || {}) },
      lore: {
        ...DEFAULT_MULTI_PROJECT_DRAFT.lore,
        ...(imported.lore || {}),
        timelineEvents: Array.isArray(imported.lore?.timelineEvents) ? imported.lore.timelineEvents : [],
      },
      routes: Array.isArray(imported.routes) ? imported.routes : [],
      mainCharacters: Array.isArray(imported.mainCharacters) && imported.mainCharacters.length > 0
        ? imported.mainCharacters
        : DEFAULT_MULTI_PROJECT_DRAFT.mainCharacters,
      supportingCharacters: Array.isArray(imported.supportingCharacters) ? imported.supportingCharacters : [],
      castInteractionRules: imported.castInteractionRules || DEFAULT_MULTI_PROJECT_DRAFT.castInteractionRules,
      updatedAt: new Date().toISOString(),
    };
    setProject(cleanProject);
    setActiveLibraryProjectId(null);
    try {
      localStorage.setItem(RUBII_MULTI_DRAFT_KEY, JSON.stringify(cleanProject));
    } catch {}
    return true;
  }, []);

  // Project Title
  const updateProjectTitle = useCallback((title: string) => {
    setProject((prev) => ({
      ...prev,
      title,
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  // 1. World Setting
  const updateWorldSetting = useCallback(
    <K extends keyof WorldSettingDraft>(key: K, value: WorldSettingDraft[K]) => {
      setProject((prev) => ({
        ...prev,
        worldSetting: {
          ...prev.worldSetting,
          [key]: value,
        },
        updatedAt: new Date().toISOString(),
      }));
    },
    []
  );

  // 2. Lore & Timeline
  const updateLore = useCallback(
    <K extends keyof LoreDraft>(key: K, value: LoreDraft[K]) => {
      setProject((prev) => ({
        ...prev,
        lore: {
          ...prev.lore,
          [key]: value,
        },
        updatedAt: new Date().toISOString(),
      }));
    },
    []
  );

  const addTimelineEvent = useCallback((event?: Partial<LoreTimelineItem>) => {
    setProject((prev) => {
      const newEvent: LoreTimelineItem = {
        id: 'event_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        timeLabel: event?.timeLabel || '',
        eventTitle: event?.eventTitle || 'เหตุการณ์สำคัญใหม่',
        description: event?.description || '',
        knownByCharacters: event?.knownByCharacters || [],
        isSecret: event?.isSecret ?? false,
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

  const updateTimelineEvent = useCallback((index: number, eventUpdate: Partial<LoreTimelineItem>) => {
    setProject((prev) => {
      const nextEvents = [...prev.lore.timelineEvents];
      if (!nextEvents[index]) return prev;
      nextEvents[index] = { ...nextEvents[index], ...eventUpdate };
      return {
        ...prev,
        lore: {
          ...prev.lore,
          timelineEvents: nextEvents,
        },
        updatedAt: new Date().toISOString(),
      };
    });
  }, []);

  const removeTimelineEvent = useCallback((index: number) => {
    setProject((prev) => {
      const nextEvents = prev.lore.timelineEvents.filter((_, i) => i !== index);
      return {
        ...prev,
        lore: {
          ...prev.lore,
          timelineEvents: nextEvents,
        },
        updatedAt: new Date().toISOString(),
      };
    });
  }, []);

  // 3. Routes & Branches
  const addRoute = useCallback((route?: Partial<RouteDraft>) => {
    setProject((prev) => {
      const newRoute: RouteDraft = {
        id: 'route_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        routeName: route?.routeName || `Route ${prev.routes.length + 1}`,
        summary: route?.summary || '',
        involvedCharacterIds: route?.involvedCharacterIds || [],
        entryCondition: route?.entryCondition || '',
        exitOrBranchCondition: route?.exitOrBranchCondition || '',
        possibleEndings: route?.possibleEndings || '',
        relationshipDynamics: route?.relationshipDynamics || '',
      };
      return {
        ...prev,
        routes: [...prev.routes, newRoute],
        updatedAt: new Date().toISOString(),
      };
    });
  }, []);

  const updateRoute = useCallback((index: number, routeUpdate: Partial<RouteDraft>) => {
    setProject((prev) => {
      const nextRoutes = [...prev.routes];
      if (!nextRoutes[index]) return prev;
      nextRoutes[index] = { ...nextRoutes[index], ...routeUpdate };
      return {
        ...prev,
        routes: nextRoutes,
        updatedAt: new Date().toISOString(),
      };
    });
  }, []);

  const removeRoute = useCallback((index: number) => {
    setProject((prev) => {
      const nextRoutes = prev.routes.filter((_, i) => i !== index);
      return {
        ...prev,
        routes: nextRoutes,
        updatedAt: new Date().toISOString(),
      };
    });
  }, []);

  // 4. Main Characters (Quota: Max 10 in Free Tier)
  const addMainCharacter = useCallback((char?: Partial<MainCharacterDraft>) => {
    let success = false;
    setProject((prev) => {
      if (prev.mainCharacters.length >= MAX_FREE_MAIN_CHARACTERS) {
        return prev;
      }
      success = true;
      const newChar: MainCharacterDraft = {
        id: 'char_mc_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        ...DEFAULT_MAIN_CHARACTER_DRAFT,
        name: char?.name || `ตัวละครหลักที่ ${prev.mainCharacters.length + 1}`,
        ...char,
      };
      return {
        ...prev,
        mainCharacters: [...prev.mainCharacters, newChar],
        updatedAt: new Date().toISOString(),
      };
    });
    return success;
  }, []);

  const updateMainCharacter = useCallback((id: string, charUpdate: Partial<MainCharacterDraft>) => {
    setProject((prev) => {
      const nextChars = prev.mainCharacters.map((c) => (c.id === id ? { ...c, ...charUpdate } : c));
      return {
        ...prev,
        mainCharacters: nextChars,
        updatedAt: new Date().toISOString(),
      };
    });
  }, []);

  const removeMainCharacter = useCallback((id: string) => {
    setProject((prev) => {
      // Must keep at least 1 main character
      if (prev.mainCharacters.length <= 1) return prev;
      const nextChars = prev.mainCharacters.filter((c) => c.id !== id);
      return {
        ...prev,
        mainCharacters: nextChars,
        updatedAt: new Date().toISOString(),
      };
    });
  }, []);

  // 5. Supporting Characters (Unlimited)
  const addSupportingCharacter = useCallback((sub?: Partial<SubCharacter>) => {
    setProject((prev) => {
      const newSub: SubCharacter = {
        id: 'sub_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        name: sub?.name || `ตัวละครเสริม ${prev.supportingCharacters.length + 1}`,
        gender: sub?.gender || '',
        age: sub?.age || '',
        personality: sub?.personality || '',
        relationship: sub?.relationship || '',
        mainRole: sub?.mainRole || '',
        appearWhen: sub?.appearWhen || '',
        shortDesc: sub?.shortDesc || '',
        systemPrompt: sub?.systemPrompt || '',
      };
      return {
        ...prev,
        supportingCharacters: [...prev.supportingCharacters, newSub],
        updatedAt: new Date().toISOString(),
      };
    });
  }, []);

  const updateSupportingCharacter = useCallback((index: number, subUpdate: Partial<SubCharacter>) => {
    setProject((prev) => {
      const nextSubs = [...prev.supportingCharacters];
      if (!nextSubs[index]) return prev;
      nextSubs[index] = { ...nextSubs[index], ...subUpdate };
      return {
        ...prev,
        supportingCharacters: nextSubs,
        updatedAt: new Date().toISOString(),
      };
    });
  }, []);

  const removeSupportingCharacter = useCallback((index: number) => {
    setProject((prev) => {
      const nextSubs = prev.supportingCharacters.filter((_, i) => i !== index);
      return {
        ...prev,
        supportingCharacters: nextSubs,
        updatedAt: new Date().toISOString(),
      };
    });
  }, []);

  // 6. Cast Interaction Rules
  const updateCastInteractionRules = useCallback((rules: string) => {
    setProject((prev) => ({
      ...prev,
      castInteractionRules: rules,
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  // Reset Project
  const resetProject = useCallback(() => {
    setProject(DEFAULT_MULTI_PROJECT_DRAFT);
    setActiveLibraryProjectId(null);
    try {
      localStorage.removeItem(RUBII_MULTI_DRAFT_KEY);
    } catch {}
  }, []);

  // Load Generic High-Quality Sample Multi-Character Universe (Aethelgard)
  const loadSampleProject = useCallback(() => {
    const sample: MultiCharacterProjectDraft = {
      id: 'proj_sample_aethelgard',
      schemaVersion: 1,
      platform: 'rubii',
      title: 'Aethelgard: มหานครเวทจักรกลกับแกนศิลาบรรพกาล',
      status: 'ready',
      worldSetting: {
        projectName: 'Aethelgard: เงาอัศวินกับพันธนาการจักรกล',
        genreTone: 'Fantasy Steampunk & High Magic (แฟนตาซีเวทมนตร์ ผสมผสานจักรกลไอน้ำ)',
        eraTimePeriod: 'ศตวรรษที่ 19 แห่งยุคการปฏิวัติเวทจักรกล (The Arcane Revolution)',
        mainLocation: 'นครลอยฟ้าแอริออน (Arion Skyport), สถาบันวิจัยศิลานิรันดร์, สลัมเขตชั้นล่างใต้หมอกควัน',
        worldRulesOrMagicSystem: 'ศิลาเวทมนตร์ "อีเธอร์เรียม" เป็นแหล่งพลังงานเดียว หากใช้เกินขีดจำกัดจะเกิดสภาวะผลึกกัดกินร่างกาย (Crystallization)',
        factionsOrOrganizations: 'สภาสูงแห่งจักรวรรดิ (High Council), กิลด์วิศวกรเงา (Shadow Forge), ขบวนการปลดแอกเขตลอยฟ้า',
        atmosphereTheme: 'กลิ่นไอน้ำผสมไอเวทมนตร์ แสงโคมไฟนีออนโบราณ ความหรูหราของชนชั้นสูงตัดกับความดิบเถื่อนของเขตใต้ดิน',
      },
      lore: {
        worldBackstory: 'จักรวรรดิเอเธลการ์ดยึดครองน่านฟ้าด้วยเรือเหาะพลังงานอีเธอร์เรียม ทว่าพลังงานบริสุทธิ์เริ่มเหือดแห้ง และเกิดโรคผลึกเวทระบาด',
        coreConflict: 'การค้นพบ "แกนศิลาบรรพกาล" ชิ้นสุดท้าย ที่สามารถพลิกชะตานครลอยฟ้า หรือระเบิดทำลายทุกสิ่งให้สูญสิ้น',
        timelineEvents: [
          {
            id: 'ev_1',
            timeLabel: '5 ปีก่อน',
            eventTitle: 'สนธิสัญญานครลอยฟ้า',
            description: 'สภาสูงเข้ายึดเหมืองอีเธอร์เรียมและกำหนดมาตรการควบคุมพลังงานเบ็ดเสร็จ',
            knownByCharacters: ['char_mc_1', 'char_mc_2'],
            isSecret: false,
          },
          {
            id: 'ev_2',
            timeLabel: '1 ปีก่อน',
            eventTitle: 'การล่มสลายของแล็บหมายเลข 7',
            description: 'เกิดอุบัติเหตุทดลองสกัดผลึกเวทมนตร์บริสุทธิ์ ทำให้พื้นที่ชั้นล่างปนเปื้อนพิษผลึก',
            knownByCharacters: ['char_mc_1', 'char_mc_2'],
            isSecret: true,
          },
          {
            id: 'ev_3',
            timeLabel: 'ปัจจุบัน',
            eventTitle: 'การปรากฏตัวของ {{user}}',
            description: '{{user}} ตื่นขึ้นมาพร้อมกุญแจโบราณที่สามารถเปิดผนึกแกนศิลาบรรพกาล',
            knownByCharacters: ['char_mc_1', 'char_mc_2'],
            isSecret: true,
          },
        ],
        commonKnowledge: 'สภาสูงควบคุมกฎหมายและเส้นทางเรือเหาะทั้งหมด ใครละเมิดจะถูกเนรเทศลงสู่พื้นดินด้านล่าง',
        taboosOrMyths: 'ห้ามลักลอบกลั่นผลึกอีเธอร์เรียมดิบเด็ดขาด และห้ามพูดถึงตำนาน "สัตว์ร้ายใต้หมอก"',
      },
      routes: [
        {
          id: 'route_1',
          routeName: 'เส้นทางพันธมิตรสภาสูง (The Iron Crown)',
          summary: 'ร่วมมือกับอัศวินหญิงแห่งสภาสูง ฟื้นฟูกฎระเบียบและไขปริศนาความมั่นคงของนครลอยฟ้า',
          involvedCharacterIds: ['char_mc_1'],
          entryCondition: 'เลือกเข้าพบผู้บัญชาการอัศวิน และส่งมอบข้อมูลผลึกให้สภา',
          exitOrBranchCondition: 'ปฏิเสธคำสั่งกวาดล้างสลัม หรือค้นพบว่าสภาอยู่เบื้องหลังการล่มสลายของแล็บ',
          possibleEndings: 'Good End: ปฏิรูปสภาและกอบกู้นครลอยฟ้า / Bad End: กลายเป็นเบี้ยในกระดานการเมือง',
          relationshipDynamics: 'เริ่มต้นด้วยความระแวงตามระเบียบ แต่พัฒนาสู่ความไว้วางใจและคู่หูร่วมเป็นร่วมตาย',
        },
        {
          id: 'route_2',
          routeName: 'เส้นทางกิลด์วิศวกรเงา (The Shadow Forge)',
          summary: 'ร่วมมือกับนักประดิษฐ์อัจฉริยะ ลักลอบสร้างอาวุธและปลดแอกเขตชั้นล่าง',
          involvedCharacterIds: ['char_mc_2'],
          entryCondition: 'หนีการจับกุมของสภา และตกลงร่วมมือกับกิลด์วิศวกร',
          exitOrBranchCondition: 'ถูกอัศวินสภาสูงจับกุม หรือเลือกหักหลังกิลด์เพื่อผลประโยชน์ส่วนตัว',
          possibleEndings: 'Good End: ปลดปล่อยอิสรภาพแก่นครลอยฟ้า / Bad End: เครื่องจักรพลังเวทคุ้มคลั่งทำลายเมือง',
          relationshipDynamics: 'เต็มไปด้วยความตื่นเต้น การร่วมมือประดิษฐ์สิ่งใหม่ และการหยอกล้ออย่างสนิทสนม',
        },
      ],
      mainCharacters: [
        {
          id: 'char_mc_1',
          name: 'ออเรเลีย (Aurelia)',
          aliasOrTitle: 'ผู้บัญชาการอัศวินกุหลาบเงิน',
          gender: 'หญิง',
          age: '26 ปี',
          mbti: 'ISTJ',
          flagType: 'green',
          storyRole: 'ตัวละครหลักฝ่ายระเบียบ / ผู้พิทักษ์และคู่พันธสัญญา',
          corePersonality: 'สุขุม เคร่งครัดในหน้าที่ ปากแข็งแต่จิตใจอ่อนโยน รักษาคำพูดอย่างยิ่งยวด',
          primaryGoalOrDesire: 'ปกป้องความสงบสุขของพลเมือง และค้นหาความจริงเบื้องหลังโรคผลึกเวท',
          relationshipWithUser: 'มองว่า {{user}} เป็นกุญแจสำคัญที่ต้องคุ้มครอง แต่ค่อยๆ เปิดใจและหวั่นไหวกับความจริงใจ',
          relationsWithOtherCast: 'ไม่ไว้ใจกิลด์วิศวกรเงา แต่ยอมร่วมมือชั่วคราวเมื่อสถานการณ์คับขัน',
          exclusiveSecretOrKnowledge: 'แอบเก็บตัวอย่างผลึกเวทจากแล็บ 7 ไว้เพื่อสืบหาคนทรยศในสภาสูง',
          absoluteRules: 'ไม่ยอมหักหลังหน้าที่ และไม่ลงมือทำร้ายผู้บริสุทธิ์เด็ดขาด',
          appearanceBrief: 'ชุดเกราะเงินประดับผ้าคลุมสีน้ำเงินกรมท่า ผมสีบลอนด์เงินมัดรวบ แววตาสีอำพันคมกริบ สูง 172 ซม.',
          speakingStyle: 'สุภาพ ทางการ หนักแน่น ลงท้ายด้วยความเคารพแต่แฝงความเด็ดขาด',
        },
        {
          id: 'char_mc_2',
          name: 'ซีเรียน (Cyrian)',
          aliasOrTitle: 'นักประดิษฐ์วิศวกรเงา',
          gender: 'ชาย',
          age: '28 ปี',
          mbti: 'ENTP',
          flagType: 'yellow',
          storyRole: 'ตัวละครหลักฝ่ายกบฏ / จอมวางแผนและผู้ให้ความช่วยเหลือ',
          corePersonality: 'ขี้เล่น เจ้าเล่ห์ ชอบท้าทายกฎเกณฑ์ มีไหวพริบยอดเยี่ยมและรักอิสระ',
          primaryGoalOrDesire: 'พิสูจน์สิ่งประดิษฐ์ของตนเอง และเปิดโปงความฉ้อฉลของชนชั้นสูง',
          relationshipWithUser: 'เห็น {{user}} เป็นคู่หูคนโปรด ชอบหยอกล้อและคอยปกป้องในเงามืด',
          relationsWithOtherCast: 'ชอบกวนประสาทออเรเลีย แต่ลึกๆ เคารพในฝีมือดาบของเธอ',
          exclusiveSecretOrKnowledge: 'รู้วิธีปลดล็อกระบบระบายพลังงานของแกนศิลาบรรพกาล',
          absoluteRules: 'ไม่ยอมให้ใครนำผลึกเวทไปสร้างเป็นอาวุธทำลายล้างมวลชน',
          appearanceBrief: 'เสื้อโค้ตหนังสีน้ำตาลเข้ม แว่นขยายจักรกลคาดบนศีรษะ รอยยิ้มมุมปาก สูง 182 ซม.',
          speakingStyle: 'เป็นกันเอง น้ำเสียงสบายๆ ปนประชดประชัน คำติดปาก: "เชื่อมือฉันเถอะน่า"',
        },
      ],
      supportingCharacters: [
        {
          id: 'sub_1',
          name: 'นกฮูกจักรกล "สปาร์กี้" (Sparky)',
          gender: 'จักรกล',
          age: '1 ปี',
          personality: 'ช่างสอดแนม ชอบส่งเสียงเตือนเมื่อมีภัย และชอบเกาะไหล่ {{user}}',
          relationship: 'สิ่งประดิษฐ์คู่หูของซีเรียน คอยบินส่งข้อความลับ',
          mainRole: 'อุปกรณ์สอดแนมและตัวช่วยส่งสารในฉาก',
          appearWhen: 'ปรากฏตัวเมื่ออยู่นอกเขตตรวจจับของสภา หรือเวลาส่งสัญญาณลับ',
          shortDesc: '',
          systemPrompt: '',
        },
        {
          id: 'sub_2',
          name: 'ป้าเกรทต้า (Greta)',
          gender: 'หญิง',
          age: '55 ปี',
          personality: 'ใจดี ขี้บ่น มือหนัก เจ้าของโรงเตี๊ยมใต้หมอก',
          relationship: 'ผู้คอยให้ที่หลบภัยแก่กลุ่มตัวเอก',
          mainRole: 'แหล่งข่าวและพื้นที่ปลอดภัยสำหรับพักฟื้น',
          appearWhen: 'เมื่อตัวละครเข้าสู่เขตสลัมชั้นล่าง',
          shortDesc: '',
          systemPrompt: '',
        },
      ],
      castInteractionRules: `- เมื่อออเรเลียและซีเรียนอยู่ด้วยกัน: ออเรเลียจะเน้นเหตุผลและความปลอดภัย ส่วนซีเรียนจะเสนอแผนการแหกคอกและแกล้งแหย่\n- ในสถานการณ์วิกฤต: ให้ {{user}} เป็นผู้ตัดสินใจเลือกเส้นทาง และทั้งสองจะสนับสนุนตามหน้าที่ของตน`,
      updatedAt: new Date().toISOString(),
    };
    setProject(sample);
    setActiveLibraryProjectId(null);
    try {
      localStorage.setItem(RUBII_MULTI_DRAFT_KEY, JSON.stringify(sample));
    } catch {}
  }, []);

  return {
    project,
    activeLibraryProjectId,
    savedProjects,
    saveProjectToLibrary,
    loadProjectFromLibrary,
    deleteProjectFromLibrary,
    importProjectJson,
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
