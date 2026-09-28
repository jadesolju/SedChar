// Prompt Library Type Definitions & Logic Helpers for SedChar.AI

export interface PromptLibraryCategory {
  id: string;
  label: string;
  description?: string;
}

export interface PromptLibraryEntry {
  id: string;
  title: string;
  category: string;
  tags: string[];
  modes: Array<'single' | 'multi'>;
  useWhen: string;
  variables?: string[];
  requires?: string[];
  conflictsWith?: string[];
  body: string;
  isCustom?: boolean;
  isPublic?: boolean;
  authorName?: string;
  authorId?: string;
  createdAt?: string;
  likesCount?: number;
  downloadsCount?: number;
}

export interface PromptPreset {
  id: string;
  title: string;
  description?: string;
  mode: 'single' | 'multi' | 'all';
  entryIds: string[];
}

export interface PromptLibraryData {
  schemaVersion: number;
  id?: string;
  title?: string;
  language?: string;
  promptType?: string;
  audience?: string;
  status?: string;
  updatedAt?: string;
  categories: PromptLibraryCategory[];
  entries: PromptLibraryEntry[];
  presets: PromptPreset[];
}

/**
 * Validates the schema and internal integrity of the Prompt Library data.
 */
export function validatePromptLibrary(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Library data must be a valid JSON object'] };
  }

  if (typeof data.schemaVersion !== 'number' || data.schemaVersion < 1) {
    errors.push('Invalid or missing schemaVersion (must be >= 1)');
  }

  if (!Array.isArray(data.categories) || data.categories.length === 0) {
    errors.push('categories must be a non-empty array');
  }

  const entries = data.entries || data.items;
  if (!Array.isArray(entries) || entries.length === 0) {
    errors.push('entries must be a non-empty array');
  }

  const entryMap = new Map<string, PromptLibraryEntry>();
  const categoryIds = new Set<string>((data.categories || []).map((c: any) => c?.id));

  if (Array.isArray(entries)) {
    entries.forEach((item: any, idx: number) => {
      if (!item.id || typeof item.id !== 'string') {
        errors.push(`Entry at index ${idx} missing string 'id'`);
        return;
      }
      if (entryMap.has(item.id)) {
        errors.push(`Duplicate entry id '${item.id}'`);
      }
      entryMap.set(item.id, item);

      if (!item.title) errors.push(`Entry '${item.id}' missing 'title'`);
      if (!item.body) errors.push(`Entry '${item.id}' missing 'body'`);
      if (!item.category || !categoryIds.has(item.category)) {
        errors.push(`Entry '${item.id}' has invalid category '${item.category}'`);
      }
      if (!Array.isArray(item.modes) || item.modes.length === 0) {
        errors.push(`Entry '${item.id}' must specify at least one mode ('single' | 'multi')`);
      }
    });

    // Check requires & conflicts references
    entries.forEach((item: any) => {
      if (Array.isArray(item.requires)) {
        item.requires.forEach((reqId: string) => {
          if (!entryMap.has(reqId)) {
            errors.push(`Entry '${item.id}' requires non-existent entry '${reqId}'`);
          }
          if (reqId === item.id) {
            errors.push(`Entry '${item.id}' cannot require itself`);
          }
        });
      }
      if (Array.isArray(item.conflictsWith)) {
        item.conflictsWith.forEach((confId: string) => {
          if (!entryMap.has(confId)) {
            errors.push(`Entry '${item.id}' conflicts with non-existent entry '${confId}'`);
          }
        });
      }
    });
  }

  if (Array.isArray(data.presets)) {
    data.presets.forEach((preset: any) => {
      if (!preset.id || !preset.title) {
        errors.push(`Preset missing id or title`);
      }
      const pEntries = preset.entryIds || preset.itemIds || [];
      if (Array.isArray(pEntries)) {
        pEntries.forEach((itemId: string) => {
          if (!entryMap.has(itemId)) {
            errors.push(`Preset '${preset.id}' references non-existent entry '${itemId}'`);
          }
        });
      }
    });
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Filter library entries by target mode ('single' | 'multi')
 */
export function getPromptsByMode(entries: PromptLibraryEntry[] = [], mode: 'single' | 'multi'): PromptLibraryEntry[] {
  return entries.filter((item) => item.modes.includes(mode));
}

/**
 * Filter presets by target mode
 */
export function getPresetsByMode(presets: PromptPreset[] = [], mode: 'single' | 'multi'): PromptPreset[] {
  return presets.filter((p) => p.mode === mode || p.mode === 'all');
}

/**
 * Search and filter prompts with query keyword, category filter, and tag filter.
 */
export function searchPrompts(
  entries: PromptLibraryEntry[] = [],
  query: string,
  categoryId: string = 'all',
  tag: string = 'all'
): PromptLibraryEntry[] {
  const q = query.trim().toLowerCase();

  return entries.filter((item) => {
    if (categoryId !== 'all' && item.category !== categoryId) {
      return false;
    }
    if (tag !== 'all' && !item.tags.some((t) => t.toLowerCase() === tag.toLowerCase())) {
      return false;
    }
    if (!q) return true;

    return (
      item.title.toLowerCase().includes(q) ||
      item.body.toLowerCase().includes(q) ||
      (item.useWhen && item.useWhen.toLowerCase().includes(q)) ||
      (Array.isArray(item.tags) && item.tags.some((t) => t.toLowerCase().includes(q)))
    );
  });
}

/**
 * Automatically resolves dependencies for a set of selected prompt IDs.
 */
export function resolveDependencies(
  selectedIds: string[],
  allEntries: PromptLibraryEntry[]
): { resolvedIds: string[]; autoAddedIds: string[] } {
  const entryMap = new Map<string, PromptLibraryEntry>(allEntries.map((i) => [i.id, i]));
  const resultSet = new Set<string>(selectedIds);
  const autoAdded: string[] = [];

  let changed = true;
  let iterations = 0;
  while (changed && iterations < 10) {
    changed = false;
    iterations++;

    for (const id of Array.from(resultSet)) {
      const item = entryMap.get(id);
      if (item && Array.isArray(item.requires)) {
        for (const reqId of item.requires) {
          if (entryMap.has(reqId) && !resultSet.has(reqId)) {
            resultSet.add(reqId);
            autoAdded.push(reqId);
            changed = true;
          }
        }
      }
    }
  }

  return { resolvedIds: Array.from(resultSet), autoAddedIds: autoAdded };
}

/**
 * Detects conflicts between selected prompt IDs.
 */
export function detectConflicts(
  selectedIds: string[],
  allEntries: PromptLibraryEntry[]
): Array<{ itemA: PromptLibraryEntry; itemB: PromptLibraryEntry; conflictId: string }> {
  const entryMap = new Map<string, PromptLibraryEntry>(allEntries.map((i) => [i.id, i]));
  const selectedSet = new Set<string>(selectedIds);
  const conflicts: Array<{ itemA: PromptLibraryEntry; itemB: PromptLibraryEntry; conflictId: string }> = [];

  for (const id of selectedIds) {
    const item = entryMap.get(id);
    if (!item) continue;

    if (Array.isArray(item.conflictsWith)) {
      for (const confId of item.conflictsWith) {
        if (selectedSet.has(confId)) {
          const conflictingItem = entryMap.get(confId);
          if (conflictingItem && id < confId) {
            conflicts.push({
              itemA: item,
              itemB: conflictingItem,
              conflictId: confId,
            });
          }
        }
      }
    }
  }

  return conflicts;
}

/**
 * Finds conflicting entries in a list of selected entries.
 */
export function findConflictingEntries(
  selectedEntries: PromptLibraryEntry[]
): Array<{ itemA: PromptLibraryEntry; itemB: PromptLibraryEntry; conflictId: string }> {
  const selectedIds = selectedEntries.map((e) => e.id);
  return detectConflicts(selectedIds, selectedEntries);
}

/**
 * Finds missing requirements in a list of selected entries.
 */
export function findMissingRequirements(
  selectedEntries: PromptLibraryEntry[]
): Array<{ item: PromptLibraryEntry; missingReqId: string }> {
  const selectedIds = new Set<string>(selectedEntries.map((e) => e.id));
  const missing: Array<{ item: PromptLibraryEntry; missingReqId: string }> = [];

  for (const item of selectedEntries) {
    if (Array.isArray(item.requires)) {
      for (const reqId of item.requires) {
        if (!selectedIds.has(reqId)) {
          missing.push({ item, missingReqId: reqId });
        }
      }
    }
  }

  return missing;
}

/**
 * Loads custom prompts from localStorage
 */
export function loadCustomPrompts(): PromptLibraryEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('sedchar_custom_prompts');
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Saves custom prompts to localStorage
 */
export function saveCustomPrompts(prompts: PromptLibraryEntry[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('sedchar_custom_prompts', JSON.stringify(prompts));
  } catch (err) {
    console.warn('Failed to save custom prompts to localStorage:', err);
  }
}

/**
 * Merges selected prompt bodies into Single-Char systemRules (string[])
 * Performs normalization and deduplication.
 */
export function mergeSystemRules(
  existingRules: string[] = [],
  itemsToAdd: PromptLibraryEntry[]
): { newRules: string[]; addedCount: number; duplicateCount: number } {
  const normalizedExisting = existingRules.map((r) => r.trim());
  const existingSet = new Set<string>(normalizedExisting);

  const newRules = [...normalizedExisting];
  let addedCount = 0;
  let duplicateCount = 0;

  for (const item of itemsToAdd) {
    const body = item.body.trim();
    if (!body) continue;

    if (existingSet.has(body)) {
      duplicateCount++;
    } else {
      existingSet.add(body);
      newRules.push(body);
      addedCount++;
    }
  }

  return { newRules, addedCount, duplicateCount };
}

/**
 * Merges selected prompt bodies into Multi-Char castInteractionRules (string block)
 * Appends formatted Markdown rule sections with title & body.
 */
export function mergeCastRules(
  existingText: string = '',
  itemsToAdd: PromptLibraryEntry[]
): { newText: string; addedCount: number } {
  let text = existingText.trim();
  let addedCount = 0;

  for (const item of itemsToAdd) {
    const headerPattern = `### ${item.title}`;
    if (text.includes(headerPattern) || text.includes(item.body.trim())) {
      continue;
    }

    const block = `### ${item.title}\n${item.body.trim()}`;
    text = text ? `${text}\n\n${block}` : block;
    addedCount++;
  }

  return { newText: text, addedCount };
}

/**
 * Bundles a list of Prompt Library items into a single copyable Markdown string.
 */
export function bundlePromptsToMarkdown(items: PromptLibraryEntry[]): string {
  return items
    .map((item) => `### ${item.title}\n${item.body}`)
    .join('\n\n');
}
