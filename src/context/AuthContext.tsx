'use client';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/client';
import type { ThaiMasterCharacter } from '@/shared/types';
import { encodeCharacterToShareUrl } from '@/shared/shareUtils';

export type UserRole = 'admin' | 'premium' | 'free';

export const ROLE_QUOTA_MAP: Record<UserRole, number> = {
  admin: 999999, // Unlimited / ไม่จำกัด
  premium: 50,   // 50 ครั้งต่อวัน
  free: 15,      // 15 ครั้งต่อวัน
};

export interface SavedCharacterRecord {
  id: string;
  user_id: string;
  title: string;
  nickname: string;
  tagline: string;
  flag_type: string;
  image_url?: string;
  gallery_urls?: string[];
  character_data: ThaiMasterCharacter;
  created_at: string;
  updated_at: string;
  share_id?: string;
  share_permission?: 'read-only' | 'edit';
  is_shared?: boolean;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userRole: UserRole;
  isLoading: boolean;
  quotaRemaining: number;
  quotaMax: number;
  isUnlimitedQuota: boolean;
  savedCharacters: SavedCharacterRecord[];
  isLibraryLoading: boolean;
  isAuthModalOpen: boolean;
  isLibraryModalOpen: boolean;
  authModalMode: 'signin' | 'signup' | 'reset';
  openAuthModal: (mode?: 'signin' | 'signup' | 'reset') => void;
  closeAuthModal: () => void;
  openLibraryModal: () => void;
  closeLibraryModal: () => void;
  setUserRole: (role: UserRole) => void;
  signInWithGoogle: () => Promise<{ error: any }>;
  signInWithDiscord: () => Promise<{ error: any }>;
  signInWithEmail: (email: string, pass: string) => Promise<{ error: any }>;
  signUpWithEmail: (email: string, pass: string) => Promise<{ error: any; data?: any }>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  updatePassword: (newPass: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  consumeQuota: () => boolean;
  activeLoadedCharacterId: string | null;
  setActiveLoadedCharacterId: (id: string | null) => void;
  saveToLibrary: (
    char: ThaiMasterCharacter,
    title?: string,
    imageUrl?: string,
    galleryUrls?: string[],
    targetId?: string
  ) => Promise<{ success: boolean; error?: string }>;
  overwriteCharacterInLibrary: (
    id: string,
    char: ThaiMasterCharacter,
    title?: string,
    imageUrl?: string,
    galleryUrls?: string[]
  ) => Promise<{ success: boolean; error?: string }>;
  deleteFromLibrary: (id: string) => Promise<boolean>;
  loadLibrary: () => Promise<void>;
  shareCharacter: (
    id: string,
    permission: 'read-only' | 'edit'
  ) => Promise<{ shareUrl: string; instantUrl: string; shareId: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function getStorageKey(userId?: string | null): string {
  return userId ? `sedchar_library_${userId}` : 'sedchar_library_guest';
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [supabase] = useState(() => createClient());
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRoleState] = useState<UserRole>('free');
  const [isLoading, setIsLoading] = useState(true);

  // Daily AI Quota state
  const [quotaRemaining, setQuotaRemaining] = useState<number>(15);
  const [quotaMax, setQuotaMax] = useState<number>(15);

  // Character Library state
  const [savedCharacters, setSavedCharacters] = useState<SavedCharacterRecord[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const guestKey = getStorageKey(null);
      const cached = localStorage.getItem(guestKey);
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [isLibraryLoading, setIsLibraryLoading] = useState(false);
  const [activeLoadedCharacterId, setActiveLoadedCharacterId] = useState<string | null>(null);

  // Modals state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup' | 'reset'>('signin');
  const [isLibraryModalOpen, setIsLibraryModalOpen] = useState(false);

  const getTodayKey = useCallback((userId: string) => {
    const today = new Date().toISOString().slice(0, 10);
    return `sedchar_ai_quota_${userId}_${today}`;
  }, []);

  // Sync and calculate quota when user or role changes
  const syncQuota = useCallback((currentUser: User | null, role: UserRole) => {
    if (!currentUser) {
      setQuotaRemaining(ROLE_QUOTA_MAP.free);
      setQuotaMax(ROLE_QUOTA_MAP.free);
      return;
    }

    const max = ROLE_QUOTA_MAP[role] || ROLE_QUOTA_MAP.free;
    setQuotaMax(max);

    if (role === 'admin') {
      setQuotaRemaining(999999);
      return;
    }

    const key = getTodayKey(currentUser.id);
    const stored = localStorage.getItem(key);
    if (stored !== null) {
      const parsed = parseInt(stored, 10);
      setQuotaRemaining(isNaN(parsed) ? max : Math.min(parsed, max));
    } else {
      localStorage.setItem(key, String(max));
      setQuotaRemaining(max);
    }
  }, [getTodayKey]);

  // Set User Role & Persist
  const setUserRole = useCallback((role: UserRole) => {
    setUserRoleState(role);
    if (user) {
      try {
        localStorage.setItem(`sedchar_user_role_${user.id}`, role);
      } catch {}
    } else {
      try {
        localStorage.setItem('sedchar_guest_role', role);
      } catch {}
    }
    syncQuota(user, role);
  }, [user, syncQuota]);

  // Load Saved Characters Library (Local First + Cloud Sync + Robust Merge)
  const loadLibrary = useCallback(async () => {
    const key = getStorageKey(user?.id);
    setIsLibraryLoading(true);

    // 1. Immediately load from LocalStorage so UI is instantaneous and never empty
    let localList: SavedCharacterRecord[] = [];
    try {
      const local = localStorage.getItem(key);
      if (local) {
        localList = JSON.parse(local);
        if (Array.isArray(localList)) {
          setSavedCharacters(localList);
        }
      }
    } catch (e) {
      console.warn('Error reading local library cache:', e);
    }

    // If not logged in, stop here (guest uses local storage)
    if (!user) {
      setIsLibraryLoading(false);
      return;
    }

    // 2. If logged in, check for any un-migrated guest characters
    try {
      const guestKey = getStorageKey(null);
      const guestRaw = localStorage.getItem(guestKey);
      if (guestRaw) {
        const guestItems: SavedCharacterRecord[] = JSON.parse(guestRaw);
        if (Array.isArray(guestItems) && guestItems.length > 0) {
          const migrated = guestItems.map(item => ({ ...item, user_id: user.id }));
          const existingIds = new Set(localList.map(c => c.id));
          migrated.forEach(m => {
            if (!existingIds.has(m.id)) {
              localList.unshift(m);
            }
          });
          localStorage.setItem(key, JSON.stringify(localList));
          localStorage.removeItem(guestKey);
          setSavedCharacters([...localList]);
        }
      }
    } catch {}

    // 3. Sync with Supabase Database
    try {
      const { data, error } = await supabase
        .from('characters')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(data)) {
        const map = new Map<string, SavedCharacterRecord>();

        // Cloud items
        data.forEach((item) => {
          map.set(item.id, item as SavedCharacterRecord);
        });

        // Add local items that might not have reached cloud yet
        localList.forEach((localItem) => {
          if (!map.has(localItem.id)) {
            map.set(localItem.id, localItem);
            // Background sync unsynced item to Supabase
            if (user) { supabase.from('characters').upsert({ ...localItem, user_id: user.id }).then(() => {}, () => {}); }
          }
        });

        const merged = Array.from(map.values()).sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

        setSavedCharacters(merged);
        try {
          localStorage.setItem(key, JSON.stringify(merged));
        } catch {}
      }
    } catch (err) {
      console.warn('Supabase fetch note:', err);
    } finally {
      setIsLibraryLoading(false);
    }
  }, [user, supabase]);

  // Initialize Auth & Session
  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        setSession(initialSession);
        const currentUser = initialSession?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
          const storedRole = (localStorage.getItem(`sedchar_user_role_${currentUser.id}`) as UserRole) || 'free';
          setUserRoleState(storedRole);
          syncQuota(currentUser, storedRole);
        } else {
          const guestRole = (localStorage.getItem('sedchar_guest_role') as UserRole) || 'free';
          setUserRoleState(guestRole);
          syncQuota(null, guestRole);
        }
      } catch (e) {
        console.error('Error initializing auth:', e);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      const currentUser = newSession?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        const storedRole = (localStorage.getItem(`sedchar_user_role_${currentUser.id}`) as UserRole) || 'free';
        setUserRoleState(storedRole);
        syncQuota(currentUser, storedRole);
      } else {
        const guestRole = (localStorage.getItem('sedchar_guest_role') as UserRole) || 'free';
        setUserRoleState(guestRole);
        syncQuota(null, guestRole);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, syncQuota]);

  // Load library when user changes or on initial mount
  useEffect(() => {
    loadLibrary();
  }, [user, loadLibrary]);

  const openAuthModal = useCallback((mode: 'signin' | 'signup' | 'reset' = 'signin') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => setIsAuthModalOpen(false), []);
  const openLibraryModal = useCallback(() => setIsLibraryModalOpen(true), []);
  const closeLibraryModal = useCallback(() => setIsLibraryModalOpen(false), []);

  const signInWithGoogle = async () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${origin}/auth/callback` },
    });
    return { error };
  };

  const signInWithDiscord = async () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'discord',
      options: { redirectTo: `${origin}/auth/callback` },
    });
    return { error };
  };

  const signInWithEmail = async (email: string, pass: string) => {
    const res = await supabase.auth.signInWithPassword({
      email,
      password: pass,
    });
    if (!res.error && res.data.user) {
      closeAuthModal();
    }
    return { error: res.error };
  };

  const signUpWithEmail = async (email: string, pass: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const res = await supabase.auth.signUp({
      email,
      password: pass,
      options: { emailRedirectTo: `${origin}/auth/callback` },
    });
    return { error: res.error, data: res.data };
  };

  const resetPassword = async (email: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const res = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/auth/callback?next=/reset-password`,
    });
    return { error: res.error };
  };

  const updatePassword = async (newPass: string) => {
    const res = await supabase.auth.updateUser({ password: newPass });
    return { error: res.error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setUserRoleState('free');
    setQuotaRemaining(ROLE_QUOTA_MAP.free);
    const guestKey = getStorageKey(null);
    try {
      const guestRaw = localStorage.getItem(guestKey);
      setSavedCharacters(guestRaw ? JSON.parse(guestRaw) : []);
    } catch {
      setSavedCharacters([]);
    }
  };

  const consumeQuota = useCallback((): boolean => {
    if (userRole === 'admin') {
      return true; // Admin has infinite quota
    }
    if (quotaRemaining <= 0) {
      return false;
    }
    const nextVal = quotaRemaining - 1;
    setQuotaRemaining(nextVal);
    try {
      const key = getTodayKey(user?.id || 'guest');
      localStorage.setItem(key, String(nextVal));
    } catch {}
    return true;
  }, [user, userRole, quotaRemaining, getTodayKey]);

  const overwriteCharacterInLibrary = async (
    id: string,
    char: ThaiMasterCharacter,
    title?: string,
    imageUrl?: string,
    galleryUrls?: string[]
  ): Promise<{ success: boolean; error?: string }> => {
    const charTitle = title?.trim() || char.fullName || char.nickname || 'ตัวละครไม่มีชื่อ';
    const key = getStorageKey(user?.id);
    const currentList = [...savedCharacters];
    const targetIdx = currentList.findIndex(c => c.id === id);

    if (targetIdx === -1) {
      return saveToLibrary(char, title, imageUrl, galleryUrls);
    }

    const existing = currentList[targetIdx];
    if (!existing) {
      return saveToLibrary(char, title, imageUrl, galleryUrls);
    }

    const updatedRecord: SavedCharacterRecord = {
      ...existing,
      id: existing.id || id,
      user_id: existing.user_id || user?.id || 'guest',
      title: charTitle,
      nickname: char.nickname || char.fullName || existing.nickname,
      tagline: char.punchline || char.shortIntro || char.occupation || existing.tagline,
      flag_type: char.flagType,
      image_url: imageUrl !== undefined ? imageUrl : (existing.image_url || ''),
      gallery_urls: galleryUrls && galleryUrls.length > 0 ? galleryUrls : (imageUrl ? [imageUrl] : (existing.gallery_urls || [])),
      character_data: char,
      created_at: existing.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    currentList[targetIdx] = updatedRecord;
    setSavedCharacters(currentList);
    try {
      localStorage.setItem(key, JSON.stringify(currentList));
    } catch (storageErr) {
      console.warn('LocalStorage save error:', storageErr);
    }

    if (user) {
      supabase
        .from('characters')
        .upsert(updatedRecord)
        .then(({ error }) => {
          if (error) console.warn('Supabase DB update note:', error.message);
        }, (e) => console.warn('Supabase DB update error:', e));
    }

    setActiveLoadedCharacterId(id);
    return { success: true };
  };

  const saveToLibrary = async (
    char: ThaiMasterCharacter,
    title?: string,
    imageUrl?: string,
    galleryUrls?: string[],
    targetId?: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (targetId) {
      return overwriteCharacterInLibrary(targetId, char, title, imageUrl, galleryUrls);
    }

    const effectiveUserId = user?.id || 'guest';
    const charTitle = title?.trim() || char.fullName || char.nickname || 'ตัวละครไม่มีชื่อ';
    
    // Cryptographically secure RNG (PR #6)
    const randomBuffer = new Uint8Array(4);
    crypto.getRandomValues(randomBuffer);
    const randomHex = Array.from(randomBuffer, (byte) => byte.toString(16).padStart(2, '0')).join('');

    const newRecord: SavedCharacterRecord = {
      id: `char-${Date.now().toString(36)}-${randomHex}`,
      user_id: effectiveUserId,
      title: charTitle,
      nickname: char.nickname || char.fullName || 'ตัวละคร',
      tagline: char.punchline || char.shortIntro || char.occupation || '',
      flag_type: char.flagType,
      image_url: imageUrl || '',
      gallery_urls: galleryUrls && galleryUrls.length > 0 ? galleryUrls : (imageUrl ? [imageUrl] : []),
      character_data: char,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      share_permission: 'read-only',
      is_shared: false,
    };

    try {
      const key = getStorageKey(user?.id);
      const currentList = [newRecord, ...savedCharacters];
      setSavedCharacters(currentList);
      try {
        localStorage.setItem(key, JSON.stringify(currentList));
      } catch (storageErr) {
        console.warn('LocalStorage quota or write error:', storageErr);
      }

      if (user) {
        supabase
          .from('characters')
          .upsert(newRecord)
          .then(({ error }) => {
            if (error) console.warn('Supabase DB save note:', error.message);
          }, (e) => console.warn('Supabase DB save error:', e));
      }

      setActiveLoadedCharacterId(newRecord.id);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'บันทึกไม่สำเร็จ' };
    }
  };

  const deleteFromLibrary = async (id: string): Promise<boolean> => {
    const key = getStorageKey(user?.id);
    const updated = savedCharacters.filter(c => c.id !== id);
    setSavedCharacters(updated);
    try {
      localStorage.setItem(key, JSON.stringify(updated));
    } catch {}

    if (user) {
      try {
        await supabase.from('characters').delete().eq('id', id).eq('user_id', user.id);
      } catch (e) {
        console.warn('Supabase delete note:', e);
      }
    }
    return true;
  };

  const shareCharacter = useCallback(async (
    id: string,
    permission: 'read-only' | 'edit'
  ): Promise<{ shareUrl: string; instantUrl: string; shareId: string }> => {
    const charRecord = savedCharacters.find(c => c.id === id);
    const shareId = charRecord?.share_id || `sh_${id.replace(/[^a-zA-Z0-9]/g, '')}_${Date.now().toString(36)}`;
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    
    // 1. Generate Instant Compressed URL (Zero-dependency, works anywhere)
    const instantUrl = charRecord
      ? encodeCharacterToShareUrl(charRecord.character_data, charRecord.title, permission)
      : `${origin}/?share=${encodeURIComponent(shareId)}&mode=${permission}`;

    // 2. Generate Cloud Database Share URL
    const shareUrl = `${origin}/?share=${encodeURIComponent(shareId)}&mode=${permission}`;

    // 3. Update Supabase Database if logged in
    if (charRecord && user) {
      try {
        await supabase
          .from('characters')
          .update({
            is_shared: true,
            share_id: shareId,
            share_permission: permission,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id)
          .eq('user_id', user.id);
      } catch (e) {
        console.warn('Supabase share update note:', e);
      }
    }

    // Save share metadata locally for instant lookup
    if (charRecord) {
      const sharePayload = {
        shareId,
        permission,
        character: charRecord.character_data,
        title: charRecord.title,
        nickname: charRecord.nickname,
        imageUrl: charRecord.image_url,
        createdAt: new Date().toISOString(),
      };
      try {
        localStorage.setItem(`sedchar_share_${shareId}`, JSON.stringify(sharePayload));
      } catch {}

      const updatedList = savedCharacters.map(c => {
        if (c.id === id) {
          return { ...c, share_id: shareId, share_permission: permission, is_shared: true };
        }
        return c;
      });
      setSavedCharacters(updatedList);
      try {
        localStorage.setItem(getStorageKey(user?.id), JSON.stringify(updatedList));
      } catch {}
    }

    return { shareUrl, instantUrl, shareId };
  }, [savedCharacters, user, supabase]);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        userRole,
        isLoading,
        quotaRemaining,
        quotaMax,
        isUnlimitedQuota: userRole === 'admin',
        savedCharacters,
        isLibraryLoading,
        isAuthModalOpen,
        isLibraryModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
        openLibraryModal,
        closeLibraryModal,
        setUserRole,
        signInWithGoogle,
        signInWithDiscord,
        signInWithEmail,
        signUpWithEmail,
        resetPassword,
        updatePassword,
        signOut,
        consumeQuota,
        activeLoadedCharacterId,
        setActiveLoadedCharacterId,
        saveToLibrary,
        overwriteCharacterInLibrary,
        deleteFromLibrary,
        loadLibrary,
        shareCharacter,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
