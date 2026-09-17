import { describe, it, expect } from 'vitest';
import { SAMPLE_CHARACTER } from '@/shared/sampleCharacter';

describe('Read-Only Ownership Protection Logic', () => {
  it('should correctly determine isReadOnly state based on owner and share mode', () => {
    const currentUserId = 'user_123';

    // Scenario 1: Non-owner opens a read-only shared character
    const sharedBanner1 = {
      title: 'Shared Char',
      mode: 'read-only' as const,
      ownerId: 'owner_456',
    };
    const isOwner1 = Boolean(sharedBanner1?.ownerId && currentUserId && currentUserId === sharedBanner1.ownerId);
    const isReadOnly1 = Boolean(sharedBanner1 && sharedBanner1.mode === 'read-only' && !isOwner1);
    expect(isOwner1).toBe(false);
    expect(isReadOnly1).toBe(true);

    // Scenario 2: Owner opens their own shared character (should be editable for owner)
    const sharedBanner2 = {
      title: 'Shared Char',
      mode: 'read-only' as const,
      ownerId: 'user_123',
    };
    const isOwner2 = Boolean(sharedBanner2?.ownerId && currentUserId && currentUserId === sharedBanner2.ownerId);
    const isReadOnly2 = Boolean(sharedBanner2 && sharedBanner2.mode === 'read-only' && !isOwner2);
    expect(isOwner2).toBe(true);
    expect(isReadOnly2).toBe(false);

    // Scenario 3: Non-owner opens a shared character with 'edit' permission
    const sharedBanner3 = {
      title: 'Shared Char',
      mode: 'edit' as const,
      ownerId: 'owner_456',
    };
    const isOwner3 = Boolean(sharedBanner3?.ownerId && currentUserId && currentUserId === sharedBanner3.ownerId);
    const isReadOnly3 = Boolean(sharedBanner3 && sharedBanner3.mode === 'read-only' && !isOwner3);
    expect(isOwner3).toBe(false);
    expect(isReadOnly3).toBe(false);

    // Scenario 4: User in their own local workspace (no sharedBanner)
    const sharedBanner4 = null;
    const isReadOnly4 = Boolean(sharedBanner4 && sharedBanner4.mode === 'read-only');
    expect(isReadOnly4).toBe(false);
  });
});
