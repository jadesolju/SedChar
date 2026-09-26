'use client';
import { useState, useCallback, useEffect, useRef } from 'react';
import type {
  ThaiMasterCharacter,
  CharacterFlagType,
  SubCharacter,
  LocationItem,
} from '@/shared/types';
import { DEFAULT_CHARACTER, DEFAULT_SUB_CHARACTER, DEFAULT_LOCATION } from '@/shared/types';
import { SAMPLE_CHARACTER } from '@/shared/sampleCharacter';
import {
  parseMarkdownToCharacter,
  characterToFullMarkdown,
  analyzeCharacterFlag,
  DEFAULT_PURRPAW_LOCATIONS,
} from '@/shared/thaiTagParser';

type ArrayField =
  | 'visualTags'
  | 'personalityTags'
  | 'likes'
  | 'dislikes'
  | 'systemRules'
  | 'categoryTags';

const DRAFT_STORAGE_KEY = 'sedchar_active_draft';
const RAW_DRAFT_STORAGE_KEY = 'sedchar_raw_markdown_draft';
const BACKUP_STORAGE_KEY = 'sedchar_backup_user_draft';

export function useCharacterData() {
  const [character, setCharacter] = useState<ThaiMasterCharacter>(() => {
    if (typeof window === 'undefined') return DEFAULT_CHARACTER;
    try {
      const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          return { ...DEFAULT_CHARACTER, ...parsed };
        }
      }
    } catch { }
    return DEFAULT_CHARACTER;
  });

  const [inputMode, setInputMode] = useState<'structured' | 'single'>('single');
  const [rawMarkdown, setRawMarkdown] = useState<string>(() => {
    if (typeof window === 'undefined') return '';
    try {
      const rawSaved = localStorage.getItem(RAW_DRAFT_STORAGE_KEY);
      if (rawSaved && rawSaved.trim()) return rawSaved;

      const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          return characterToFullMarkdown({ ...DEFAULT_CHARACTER, ...parsed });
        }
      }
    } catch { }
    return '';
  });
  const isInitialMount = useRef(true);

  // Auto-save draft on character change (debounced)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    const timer = setTimeout(() => {
      try {
        // Do not overwrite user's main draft if currently viewing in Read-Only mode
        if (typeof window !== 'undefined' && sessionStorage.getItem('sedchar_is_readonly_active') === 'true') {
          return;
        }
        localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(character));
        if (rawMarkdown) {
          localStorage.setItem(RAW_DRAFT_STORAGE_KEY, rawMarkdown);
        }
      } catch { }
    }, 400);
    return () => clearTimeout(timer);
  }, [character, rawMarkdown]);

  // Update a single string field
  const updateField = useCallback(<K extends keyof ThaiMasterCharacter>(
    field: K,
    value: ThaiMasterCharacter[K]
  ) => {
    setCharacter(prev => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  // Tag array operations
  const addTag = useCallback((field: ArrayField, value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    setCharacter(prev => {
      const current = prev[field] as string[];
      if (current.includes(trimmed)) return prev;
      return {
        ...prev,
        [field]: [...current, trimmed],
      };
    });
  }, []);

  const removeTag = useCallback((field: ArrayField, index: number) => {
    setCharacter(prev => {
      const current = prev[field] as string[];
      return {
        ...prev,
        [field]: current.filter((_, i) => i !== index),
      };
    });
  }, []);

  // Sub Characters (Max 5)
  const addSubCharacter = useCallback((initialData?: Partial<SubCharacter>) => {
    setCharacter(prev => {
      if (prev.supportingCharacters.length >= 5) return prev;
      const newSub: SubCharacter = {
        ...DEFAULT_SUB_CHARACTER,
        id: `sub-${Date.now()}`,
        ...initialData,
      };
      return {
        ...prev,
        supportingCharacters: [...prev.supportingCharacters, newSub],
      };
    });
  }, []);

  const updateSubCharacter = useCallback((index: number, data: Partial<SubCharacter>) => {
    setCharacter(prev => {
      const updated = [...prev.supportingCharacters];
      if (updated[index]) {
        updated[index] = { ...updated[index], ...data };
      }
      return { ...prev, supportingCharacters: updated };
    });
  }, []);

  const removeSubCharacter = useCallback((index: number) => {
    setCharacter(prev => ({
      ...prev,
      supportingCharacters: prev.supportingCharacters.filter((_, i) => i !== index),
    }));
  }, []);

  // Locations (Max 10)
  const addLocation = useCallback((initialData?: Partial<LocationItem>) => {
    setCharacter(prev => {
      if (prev.locations.length >= 10) return prev;
      const newLoc: LocationItem = {
        ...DEFAULT_LOCATION,
        id: `loc-${Date.now()}`,
        ...initialData,
      };
      return {
        ...prev,
        locations: [...prev.locations, newLoc],
      };
    });
  }, []);

  const updateLocation = useCallback((index: number, data: Partial<LocationItem>) => {
    setCharacter(prev => {
      const updated = [...prev.locations];
      if (updated[index]) {
        updated[index] = { ...updated[index], ...data };
      }
      return { ...prev, locations: updated };
    });
  }, []);

  const removeLocation = useCallback((index: number) => {
    setCharacter(prev => ({
      ...prev,
      locations: prev.locations.filter((_, i) => i !== index),
    }));
  }, []);

  const loadDefaultLocations = useCallback(() => {
    setCharacter(prev => ({
      ...prev,
      locations: [...DEFAULT_PURRPAW_LOCATIONS],
    }));
  }, []);

  // Flag setter & auto analyzer
  const setFlagType = useCallback((flag: CharacterFlagType) => {
    setCharacter(prev => ({ ...prev, flagType: flag }));
  }, []);

  const autoDetectFlag = useCallback(() => {
    setCharacter(prev => ({
      ...prev,
      flagType: analyzeCharacterFlag(prev),
    }));
  }, []);

  // Load sample character
  const loadSample = useCallback(() => {
    setCharacter(SAMPLE_CHARACTER);
    setRawMarkdown(characterToFullMarkdown(SAMPLE_CHARACTER));
    try {
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(SAMPLE_CHARACTER));
    } catch { }
  }, []);

  // Reset to default empty character
  const resetCharacter = useCallback(() => {
    setCharacter(DEFAULT_CHARACTER);
    setRawMarkdown(characterToFullMarkdown(DEFAULT_CHARACTER));
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch { }
  }, []);

  // Parse raw markdown input
  const importRawMarkdown = useCallback((text: string) => {
    const parsed = parseMarkdownToCharacter(text);
    setCharacter(parsed);
    setRawMarkdown(text);
    try {
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(parsed));
      localStorage.setItem(RAW_DRAFT_STORAGE_KEY, text);
    } catch { }
  }, []);

  // Direct parsed character setter from Gemini AI or Share Link
  const applyParsedCharacter = useCallback((parsedChar: ThaiMasterCharacter, isReadOnly = false) => {
    setCharacter(parsedChar);
    setRawMarkdown(characterToFullMarkdown(parsedChar));
    try {
      if (isReadOnly) {
        sessionStorage.setItem('sedchar_is_readonly_active', 'true');
        // Backup user's existing draft if not already backed up
        const existingDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
        if (existingDraft && !localStorage.getItem(BACKUP_STORAGE_KEY)) {
          localStorage.setItem(BACKUP_STORAGE_KEY, existingDraft);
        }
      } else {
        sessionStorage.removeItem('sedchar_is_readonly_active');
        localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(parsedChar));
      }
    } catch { }
  }, []);

  // Restore user's personal draft or reset after exiting read-only mode
  const restoreBackupDraft = useCallback(() => {
    try {
      sessionStorage.removeItem('sedchar_is_readonly_active');
      const backup = localStorage.getItem(BACKUP_STORAGE_KEY);
      if (backup) {
        const parsed = JSON.parse(backup);
        if (parsed && typeof parsed === 'object') {
          setCharacter(parsed);
          setRawMarkdown(characterToFullMarkdown(parsed));
          localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(parsed));
          localStorage.removeItem(BACKUP_STORAGE_KEY);
          return;
        }
      }
    } catch { }
    // Fallback if no previous draft was stored: return to DEFAULT_CHARACTER
    setCharacter(DEFAULT_CHARACTER);
    setRawMarkdown('');
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch { }
  }, []);

  // Keep rawMarkdown in sync when switching to single mode
  const syncToMarkdown = useCallback(() => {
    const md = characterToFullMarkdown(character);
    setRawMarkdown(md);
    try {
      localStorage.setItem(RAW_DRAFT_STORAGE_KEY, md);
    } catch {}
  }, [character]);

  return {
    character,
    inputMode,
    rawMarkdown,
    setInputMode,
    setRawMarkdown,
    updateField,
    addTag,
    removeTag,
    addSubCharacter,
    updateSubCharacter,
    removeSubCharacter,
    addLocation,
    updateLocation,
    removeLocation,
    loadDefaultLocations,
    setFlagType,
    autoDetectFlag,
    loadSample,
    resetCharacter,
    importRawMarkdown,
    applyParsedCharacter,
    restoreBackupDraft,
    syncToMarkdown,
  };
}
