import type { SubCharacter, CharacterFlagType } from './types';

export interface WorldSettingDraft {
  projectName: string;
  genreTone: string;
  eraTimePeriod: string;
  mainLocation: string;
  worldRulesOrMagicSystem: string;
  factionsOrOrganizations: string;
  atmosphereTheme: string;
}

export interface LoreTimelineItem {
  id: string;
  timeLabel: string;
  eventTitle: string;
  description: string;
  knownByCharacters: string[]; // Character IDs who know this event
  isSecret: boolean;
}

export interface LoreDraft {
  worldBackstory: string;
  coreConflict: string;
  timelineEvents: LoreTimelineItem[];
  commonKnowledge: string;
  taboosOrMyths: string;
}

export interface RouteDraft {
  id: string;
  routeName: string;
  summary: string;
  involvedCharacterIds: string[];
  entryCondition: string;
  exitOrBranchCondition: string;
  possibleEndings: string;
  relationshipDynamics: string;
}

export interface MainCharacterDraft {
  id: string;
  name: string;
  aliasOrTitle: string;
  gender: string;
  age: string;
  mbti?: string;
  flagType?: CharacterFlagType;
  storyRole: string;
  corePersonality: string;
  primaryGoalOrDesire: string;
  relationshipWithUser: string;
  relationsWithOtherCast: string;
  exclusiveSecretOrKnowledge: string;
  absoluteRules: string;
  appearanceBrief: string;
  speakingStyle: string;
  nsfwBrief?: string;
}

export interface MultiCharacterProjectDraft {
  id: string;
  schemaVersion: 1;
  platform: 'rubii';
  title: string;
  status: 'draft' | 'ready';
  worldSetting: WorldSettingDraft;
  lore: LoreDraft;
  routes: RouteDraft[];
  mainCharacters: MainCharacterDraft[]; // Free: Maximum 10
  supportingCharacters: SubCharacter[]; // Unlimited
  castInteractionRules: string; // Turn-taking & group scene rules
  updatedAt: string;
}

export const DEFAULT_WORLD_SETTING: WorldSettingDraft = {
  projectName: '',
  genreTone: '',
  eraTimePeriod: '',
  mainLocation: '',
  worldRulesOrMagicSystem: '',
  factionsOrOrganizations: '',
  atmosphereTheme: '',
};

export const DEFAULT_LORE_DRAFT: LoreDraft = {
  worldBackstory: '',
  coreConflict: '',
  timelineEvents: [],
  commonKnowledge: '',
  taboosOrMyths: '',
};

export const DEFAULT_MAIN_CHARACTER_DRAFT: Omit<MainCharacterDraft, 'id'> = {
  name: '',
  aliasOrTitle: '',
  gender: '',
  age: '',
  mbti: '',
  flagType: 'none',
  storyRole: '',
  corePersonality: '',
  primaryGoalOrDesire: '',
  relationshipWithUser: '',
  relationsWithOtherCast: '',
  exclusiveSecretOrKnowledge: '',
  absoluteRules: '',
  appearanceBrief: '',
  speakingStyle: '',
  nsfwBrief: '',
};

export const DEFAULT_MULTI_PROJECT_DRAFT: MultiCharacterProjectDraft = {
  id: 'proj_multi_default',
  schemaVersion: 1,
  platform: 'rubii',
  title: 'โปรเจกต์ Multi-Char ใหม่',
  status: 'draft',
  worldSetting: DEFAULT_WORLD_SETTING,
  lore: DEFAULT_LORE_DRAFT,
  routes: [],
  mainCharacters: [
    {
      id: 'char_mc_1',
      name: 'ตัวละครหลักที่ 1',
      aliasOrTitle: '',
      gender: '',
      age: '',
      mbti: '',
      flagType: 'none',
      storyRole: 'ตัวละครหลัก / คู่ปะทะ',
      corePersonality: '',
      primaryGoalOrDesire: '',
      relationshipWithUser: '',
      relationsWithOtherCast: '',
      exclusiveSecretOrKnowledge: '',
      absoluteRules: '',
      appearanceBrief: '',
      speakingStyle: '',
      nsfwBrief: '',
    },
  ],
  supportingCharacters: [],
  castInteractionRules: `- ลำดับความสำคัญในการตอบ: การกระทำของผู้เล่น (User) → เหตุการณ์ที่เกิดขึ้นแล้ว → ตัวละครที่ถูกทักโดยตรงตอบก่อน\n- ในฉากรวม: จำกัดตัวละครที่มีบทสนทนาหลักครั้งละ 1–2 คน เพื่อไม่ให้ข้อความยาวเกินไป`,
  updatedAt: new Date().toISOString(),
};
