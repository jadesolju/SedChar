'use client';
import { useState, useCallback, useEffect } from 'react';
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
} from '@/shared/thaiTagParser';

type ArrayField =
  | 'visualTags'
  | 'personalityTags'
  | 'likes'
  | 'dislikes'
  | 'systemRules'
  | 'categoryTags';

export function useCharacterData() {
  const [character, setCharacter] = useState<ThaiMasterCharacter>(SAMPLE_CHARACTER);
  const [inputMode, setInputMode] = useState<'structured' | 'single'>('structured');
  const [rawMarkdown, setRawMarkdown] = useState<string>(() => characterToFullMarkdown(SAMPLE_CHARACTER));

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
  }, []);

  // Reset to default empty character
  const resetCharacter = useCallback(() => {
    setCharacter(DEFAULT_CHARACTER);
    setRawMarkdown(characterToFullMarkdown(DEFAULT_CHARACTER));
  }, []);

  // Parse raw markdown input
  const importRawMarkdown = useCallback((text: string) => {
    const parsed = parseMarkdownToCharacter(text);
    setCharacter(parsed);
    setRawMarkdown(text);
  }, []);

  // Direct parsed character setter from Gemini AI
  const applyParsedCharacter = useCallback((parsedChar: ThaiMasterCharacter) => {
    setCharacter(parsedChar);
    setRawMarkdown(characterToFullMarkdown(parsedChar));
  }, []);

  // Keep rawMarkdown in sync when switching to single mode
  const syncToMarkdown = useCallback(() => {
    setRawMarkdown(characterToFullMarkdown(character));
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
    setFlagType,
    autoDetectFlag,
    loadSample,
    resetCharacter,
    importRawMarkdown,
    applyParsedCharacter,
    syncToMarkdown,
  };
}