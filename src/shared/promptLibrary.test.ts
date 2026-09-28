import { describe, it, expect } from 'vitest';
import rawData from '../data/promptLibrary.json';
import {
  validatePromptLibrary,
  getPromptsByMode,
  getPresetsByMode,
  searchPrompts,
  resolveDependencies,
  detectConflicts,
  mergeSystemRules,
  mergeCastRules,
  bundlePromptsToMarkdown,
  PromptLibraryData,
  PromptLibraryEntry,
} from './promptLibraryTypes';

const data = rawData as PromptLibraryData;

describe('Prompt Library Validation & Data Integrity', () => {
  it('validates official library.json with 0 schema errors', () => {
    const res = validatePromptLibrary(data);
    expect(res.errors).toEqual([]);
    expect(res.valid).toBe(true);
  });

  it('detects invalid schema with missing items or bad category', () => {
    const invalid = { schemaVersion: 1, categories: [], entries: [] };
    const res = validatePromptLibrary(invalid);
    expect(res.valid).toBe(false);
    expect(res.errors.length).toBeGreaterThan(0);
  });

  it('filters items correctly by mode (single / multi)', () => {
    const singleItems = getPromptsByMode(data.entries, 'single');
    const multiItems = getPromptsByMode(data.entries, 'multi');

    expect(singleItems.length).toBeGreaterThan(0);
    expect(multiItems.length).toBeGreaterThan(0);
    singleItems.forEach((item) => expect(item.modes).toContain('single'));
    multiItems.forEach((item) => expect(item.modes).toContain('multi'));
  });

  it('filters presets correctly by mode', () => {
    const singlePresets = getPresetsByMode(data.presets, 'single');
    expect(singlePresets.length).toBeGreaterThan(0);
  });

  it('searches prompts by keyword, category, and tag', () => {
    const foundByKeyword = searchPrompts(data.entries, 'โบ้');
    expect(foundByKeyword.length).toBeGreaterThan(0);

    const foundByCategory = searchPrompts(data.entries, '', 'core');
    expect(foundByCategory.length).toBeGreaterThan(0);
    foundByCategory.forEach((i) => expect(i.category).toBe('core'));
  });
});

describe('Dependency & Conflict Resolution', () => {
  it('resolves requires dependencies automatically', () => {
    // relationship-slow-development requires core-player-agency
    const item = data.entries.find((i) => i.id === 'relationship-slow-development');
    if (item && item.requires && item.requires.length > 0) {
      const { resolvedIds, autoAddedIds } = resolveDependencies([item.id], data.entries);
      expect(resolvedIds).toContain('core-player-agency');
      expect(autoAddedIds).toContain('core-player-agency');
    }
  });

  it('detects conflicting rules', () => {
    const mockItems: PromptLibraryEntry[] = [
      {
        id: 'rule-a',
        title: 'Rule A',
        category: 'core',
        tags: [],
        modes: ['single'],
        useWhen: '',
        conflictsWith: ['rule-b'],
        body: 'Body A',
      },
      {
        id: 'rule-b',
        title: 'Rule B',
        category: 'core',
        tags: [],
        modes: ['single'],
        useWhen: '',
        conflictsWith: ['rule-a'],
        body: 'Body B',
      },
    ];

    const conflicts = detectConflicts(['rule-a', 'rule-b'], mockItems);
    expect(conflicts.length).toBe(1);
    expect(conflicts[0].itemA.id).toBe('rule-a');
    expect(conflicts[0].itemB.id).toBe('rule-b');
  });
});

describe('Rules Merging & Markdown Bundling', () => {
  it('merges systemRules with deduplication', () => {
    const existing = ['Existing Rule 1', 'Existing Rule 2'];
    const toAdd = [data.entries[0], data.entries[0]]; // duplicate

    const { newRules, addedCount, duplicateCount } = mergeSystemRules(existing, toAdd);
    expect(addedCount).toBe(1);
    expect(duplicateCount).toBe(1);
    expect(newRules).toContain('Existing Rule 1');
    expect(newRules).toContain(data.entries[0].body.trim());
  });

  it('merges castRules into markdown block', () => {
    const existing = '### World Note\nSome setting';
    const toAdd = [data.entries[0]];

    const { newText, addedCount } = mergeCastRules(existing, toAdd);
    expect(addedCount).toBe(1);
    expect(newText).toContain(`### ${data.entries[0].title}`);
    expect(newText).toContain(data.entries[0].body.trim());
  });

  it('bundles prompts to markdown properly', () => {
    const md = bundlePromptsToMarkdown([data.entries[0], data.entries[1]]);
    expect(md).toContain(`### ${data.entries[0].title}`);
    expect(md).toContain(`### ${data.entries[1].title}`);
  });
});
