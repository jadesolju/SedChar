'use client';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/client';
import type { ThaiMasterCharacter } from '@/shared/types';
import { encodeCharacterToShareUrl } from '@/shared/shareUtils';

export type UserRole = 'admin' | 'premium' | 'supporter' | 'free';

export const ROLE_QUOTA_MAP: Record<UserRole, number> = {
  admin: 999999, // Unlimited / ไม่จำกัด
  premium: 100,  // Universe Pro (99.-) 100 ครั้งต่อวัน
  supporter: 50, // Supporter (29.-) 50 ครั้งต่อวัน
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
  isProfileModalOpen: boolean;
  authModalMode: 'signin' | 'signup' | 'reset';
  openAuthModal: (mode?: 'signin' | 'signup' | 'reset') => void;
  closeAuthModal: () => void;
  openLibraryModal: () => void;
  closeLibraryModal: () => void;
  openProfileModal: () => void;
  closeProfileModal: () => void;
  updateUserProfile: (data: {
    displayName?: string;
    avatarUrl?: string;
    bio?: string;
    avatarBgTheme?: string;
    customAvatarBg?: string;
    customAvatarBg2?: string;
    avatarGradientAngle?: number;
    bannerTheme?: string;
    bannerUrl?: string;
    bannerPosY?: number;
    bannerFullCard?: boolean;
    customBannerColor1?: string;
    customBannerColor2?: string;
    bannerPattern?: string;
  }) => Promise<{ error: any; data?: any }>;
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
  const [activeLoadedCharacterId, setActiveLoadedCharacterIdState] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      return localStorage.getItem('sedchar_active_character_id');
    } catch {
      return null;
    }
  });

  const setActiveLoadedCharacterId = useCallback((id: string | null) => {
    setActiveLoadedCharacterIdState(id);
    if (typeof window === 'undefined') return;
    try {
      if (id) {
        localStorage.setItem('sedchar_active_character_id', id);
      } else {
        localStorage.removeItem('sedchar_active_character_id');
      }
    } catch {}
  }, []);

  // Modals state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup' | 'reset'>('signin');
  const [isLibraryModalOpen, setIsLibraryModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const openProfileModal = useCallback(() => {
    setIsProfileModalOpen(true);
  }, []);

  const closeProfileModal = useCallback(() => {
    setIsProfileModalOpen(false);
  }, []);

  const updateUserProfile = useCallback(
    async (data: {
      displayName?: string;
      avatarUrl?: string;
      bio?: string;
      avatarBgTheme?: string;
      customAvatarBg?: string;
      customAvatarBg2?: string;
      avatarGradientAngle?: number;
      bannerTheme?: string;
      bannerUrl?: string;
      bannerPosY?: number;
      bannerFullCard?: boolean;
      customBannerColor1?: string;
      customBannerColor2?: string;
      bannerPattern?: string;
    }) => {
      if (!user) return { error: new Error('User not authenticated') };

      let finalAvatarUrl = data.avatarUrl;
      // Auto-upload base64 avatar to Cloud Storage to prevent Cookie bloat
      if (finalAvatarUrl && finalAvatarUrl.startsWith('data:')) {
        try {
          const res = await fetch('/api/avatar/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: finalAvatarUrl, userId: user.id }),
          });
          if (res.ok) {
            const upData = await res.json();
            if (upData.url) {
              finalAvatarUrl = upData.url;
            }
          }
        } catch (uploadErr) {
          console.warn('Avatar auto-upload warning:', uploadErr);
        }
      }

      let finalBannerUrl = data.bannerUrl;
      // Auto-upload base64 banner to Cloud Storage
      if (finalBannerUrl && finalBannerUrl.startsWith('data:')) {
        try {
          const res = await fetch('/api/avatar/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: finalBannerUrl, userId: user.id }),
          });
          if (res.ok) {
            const upData = await res.json();
            if (upData.url) {
              finalBannerUrl = upData.url;
            }
          }
        } catch (bannerErr) {
          console.warn('Banner auto-upload warning:', bannerErr);
        }
      }

      const currentMetadata = user.user_metadata || {};
      const updatedMetadata = {
        ...currentMetadata,
        ...(data.displayName !== undefined
          ? { display_name: data.displayName, full_name: data.displayName }
          : {}),
        ...(finalAvatarUrl !== undefined ? { avatar_url: finalAvatarUrl } : {}),
        ...(data.bio !== undefined ? { bio: data.bio } : {}),
        ...(data.avatarBgTheme !== undefined ? { avatar_bg_theme: data.avatarBgTheme } : {}),
        ...(data.customAvatarBg !== undefined ? { custom_avatar_bg: data.customAvatarBg } : {}),
        ...(data.customAvatarBg2 !== undefined ? { custom_avatar_bg2: data.customAvatarBg2 } : {}),
        ...(data.avatarGradientAngle !== undefined ? { avatar_gradient_angle: data.avatarGradientAngle } : {}),
        ...(data.bannerTheme !== undefined ? { banner_theme: data.bannerTheme } : {}),
        ...(finalBannerUrl !== undefined ? { banner_url: finalBannerUrl } : {}),
        ...(data.bannerPosY !== undefined ? { banner_pos_y: data.bannerPosY } : {}),
        ...(data.bannerFullCard !== undefined ? { banner_full_card: data.bannerFullCard } : {}),
        ...(data.customBannerColor1 !== undefined ? { custom_banner_color1: data.customBannerColor1 } : {}),
        ...(data.customBannerColor2 !== undefined ? { custom_banner_color2: data.customBannerColor2 } : {}),
        ...(data.bannerPattern !== undefined ? { banner_pattern: data.bannerPattern } : {}),
      };

      try {
        const { data: updateData, error } = await supabase.auth.updateUser({
          data: updatedMetadata,
        });

        if (error) throw error;

        if (updateData?.user) {
          setUser(updateData.user);

          // If displayName was updated, dynamically synchronize across local library, drafts, and Cloud R2
          if (data.displayName && typeof data.displayName === 'string' && data.displayName.trim()) {
            const newName = data.displayName.trim();
            if (typeof window !== 'undefined') {
              try {
                // 1. Update active draft
                const draftRaw = localStorage.getItem('sedchar_rubii_multi_draft_v1');
                if (draftRaw) {
                  const draft = JSON.parse(draftRaw);
                  if (draft.worldSetting) {
                    draft.worldSetting.author = newName;
                  }
                  draft.author = newName;
                  localStorage.setItem('sedchar_rubii_multi_draft_v1', JSON.stringify(draft));
                }

                // 2. Update local library projects
                const libRaw = localStorage.getItem('sedchar_multi_projects_library_v1');
                if (libRaw) {
                  const lib = JSON.parse(libRaw);
                  if (Array.isArray(lib)) {
                    const updatedLib = lib.map((item) => {
                      if (!item) return item;
                      const nextItem = { ...item, author: newName };
                      if (nextItem.projectData) {
                        nextItem.projectData = {
                          ...nextItem.projectData,
                          author: newName,
                          worldSetting: nextItem.projectData.worldSetting
                            ? { ...nextItem.projectData.worldSetting, author: newName }
                            : undefined,
                        };
                      }
                      return nextItem;
                    });
                    localStorage.setItem('sedchar_multi_projects_library_v1', JSON.stringify(updatedLib));
                  }
                }

                window.dispatchEvent(new Event('storage'));
              } catch (localSyncErr) {
                console.warn('Local author sync error:', localSyncErr);
              }

              // 3. Trigger Cloud R2 Author Sync in background
              fetch('/api/universe/sync-author', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  userId: updateData.user.id,
                  author: newName,
                  updateAllUserProjects: true,
                }),
              }).catch(() => {});
            }
          }
        }
        return { error: null, data: updateData };
      } catch (err: any) {
        console.warn('Profile update error:', err);
        return { error: err };
      }
    },
    [user, supabase]
  );

  const getTodayKey = useCallback((userId: string) => {
    const today = new Date().toISOString().slice(0, 10);
    return `sedchar_ai_quota_${userId}_${today}`;
  }, []);

  const getTodayUsedKey = useCallback((userId: string) => {
    const today = new Date().toISOString().slice(0, 10);
    return `sedchar_ai_used_${userId}_${today}`;
  }, []);

  // Sync and calculate quota when user or role changes
  const syncQuota = useCallback((currentUser: User | null, role: UserRole) => {
    const max = ROLE_QUOTA_MAP[role] || ROLE_QUOTA_MAP.free;
    setQuotaMax(max);

    if (role === 'admin') {
      setQuotaRemaining(999999);
      return;
    }

    const effectiveId = currentUser?.id || 'guest';
    const usedKey = getTodayUsedKey(effectiveId);
    const storedUsed = localStorage.getItem(usedKey);

    if (storedUsed !== null) {
      const parsedUsed = parseInt(storedUsed, 10);
      const safeUsed = isNaN(parsedUsed) ? 0 : Math.max(0, parsedUsed);
      setQuotaRemaining(Math.max(0, max - safeUsed));
    } else {
      const oldKey = getTodayKey(effectiveId);
      const oldStored = localStorage.getItem(oldKey);
      if (oldStored !== null) {
        const oldParsed = parseInt(oldStored, 10);
        const estimatedUsed = isNaN(oldParsed) ? 0 : Math.max(0, 15 - oldParsed);
        localStorage.setItem(usedKey, String(estimatedUsed));
        setQuotaRemaining(Math.max(0, max - estimatedUsed));
      } else {
        localStorage.setItem(usedKey, '0');
        setQuotaRemaining(max);
      }
    }
  }, [getTodayKey, getTodayUsedKey]);

  // Set User Role & Persist directly in Supabase Auth
  const setUserRole = useCallback(async (role: UserRole) => {
    setUserRoleState(role);
    if (user) {
      try {
        const { data: updateRes, error: updateErr } = await supabase.auth.updateUser({
          data: { role },
        });
        if (!updateErr && updateRes?.user) {
          setUser(updateRes.user);
          const confirmedRole = (updateRes.user.user_metadata?.role || updateRes.user.app_metadata?.role || role) as UserRole;
          setUserRoleState(confirmedRole);
          syncQuota(updateRes.user, confirmedRole);
          return;
        }

        const { data: freshData } = await supabase.auth.getUser();
        if (freshData?.user) {
          setUser(freshData.user);
          const confirmedRole = (freshData.user.user_metadata?.role || freshData.user.app_metadata?.role || role) as UserRole;
          setUserRoleState(confirmedRole);
          syncQuota(freshData.user, confirmedRole);
          return;
        }
      } catch (e) {
        console.warn('Error updating Supabase user role:', e);
      }
    }
    syncQuota(user, role);
  }, [user, syncQuota, supabase]);

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
        .select('id, user_id, title, nickname, tagline, flag_type, image_url, gallery_urls, share_id, share_permission, is_shared, created_at, updated_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(data)) {
        const map = new Map<string, SavedCharacterRecord>();

        // Cloud items
        data.forEach((item) => {
          const existingLocal = localList.find((l) => l.id === item.id);
          map.set(item.id, {
            ...item,
            character_data: existingLocal?.character_data || (item as any).character_data,
          } as SavedCharacterRecord);
        });

        // Add local items that might not have reached cloud yet
        localList.forEach((localItem) => {
          if (!map.has(localItem.id)) {
            map.set(localItem.id, localItem);
            // Background sync unsynced item to Cloudflare R2 and Supabase
            if (user) {
              const { character_data, ...metadataRow } = localItem as any;
              supabase.from('characters').upsert({ ...metadataRow, user_id: user.id }).then(() => {}, () => {});
              fetch('/api/characters/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  id: localItem.id,
                  character: localItem.character_data,
                  title: localItem.title,
                  nickname: localItem.nickname,
                  tagline: localItem.tagline,
                  flag_type: localItem.flag_type,
                  image_url: localItem.image_url,
                  gallery_urls: localItem.gallery_urls,
                  share_permission: localItem.share_permission,
                  is_shared: localItem.is_shared,
                  share_id: localItem.share_id,
                  user_id: user.id,
                }),
              }).catch(() => {});
            }
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

  // Initialize Auth & Session — Strictly and Authoritatively from Supabase Auth Server
  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        setSession(initialSession);
        let currentUser = initialSession?.user ?? null;

        if (currentUser) {
          // Fetch fresh user data directly from Supabase Auth server
          try {
            const { data: freshUserData, error: freshErr } = await supabase.auth.getUser();
            if (!freshErr && freshUserData?.user) {
              currentUser = freshUserData.user;
            }
          } catch {}

          // Auto-healing: If user_metadata has a huge base64 avatar_url causing cookie bloat, migrate it to R2 CDN
          if (currentUser.user_metadata?.avatar_url?.startsWith('data:')) {
            const rawAvatar = currentUser.user_metadata.avatar_url;
            fetch('/api/avatar/upload', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ image: rawAvatar, userId: currentUser.id }),
            })
              .then((res) => res.json())
              .then((upData) => {
                if (upData.url) {
                  supabase.auth.updateUser({
                    data: { avatar_url: upData.url },
                  });
                }
              })
              .catch(() => {});
          }
          const rawRole = (currentUser.user_metadata?.role || currentUser.app_metadata?.role || 'free') as UserRole;
          const authRole: UserRole = ['admin', 'premium', 'supporter', 'free'].includes(rawRole) ? rawRole : 'free';
          setUser(currentUser);
          setUserRoleState(authRole);
          syncQuota(currentUser, authRole);
        } else {
          setUser(null);
          setUserRoleState('free');
          syncQuota(null, 'free');
        }
      } catch (e) {
        console.error('Error initializing auth:', e);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession);
      let currentUser = newSession?.user ?? null;

      if (currentUser) {
        try {
          const { data: freshUserData, error: freshErr } = await supabase.auth.getUser();
          if (!freshErr && freshUserData?.user) {
            currentUser = freshUserData.user;
          }
        } catch {}

        setUser(currentUser);

        const rawRole = (currentUser.user_metadata?.role || currentUser.app_metadata?.role || 'free') as UserRole;
        const authRole: UserRole = ['admin', 'premium', 'supporter', 'free'].includes(rawRole) ? rawRole : 'free';
        setUserRoleState(authRole);
        syncQuota(currentUser, authRole);
      } else {
        setUser(null);
        setUserRoleState('free');
        syncQuota(null, 'free');
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
    const origin = (typeof window !== 'undefined' && window.location.origin)
      ? window.location.origin
      : (process.env.NEXT_PUBLIC_APP_URL || 'https://sedchar.online');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${origin}/auth/callback` },
    });
    return { error };
  };

  const signInWithDiscord = async () => {
    const origin = (typeof window !== 'undefined' && window.location.origin)
      ? window.location.origin
      : (process.env.NEXT_PUBLIC_APP_URL || 'https://sedchar.online');
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
    const max = ROLE_QUOTA_MAP[userRole] || ROLE_QUOTA_MAP.free;
    const effectiveId = user?.id || 'guest';
    const usedKey = getTodayUsedKey(effectiveId);
    let currentUsed = 0;
    try {
      const stored = localStorage.getItem(usedKey);
      currentUsed = stored ? parseInt(stored, 10) || 0 : 0;
    } catch {}

    const nextUsed = currentUsed + 1;
    const nextRemaining = Math.max(0, max - nextUsed);
    setQuotaRemaining(nextRemaining);
    try {
      localStorage.setItem(usedKey, String(nextUsed));
    } catch {}
    return true;
  }, [user, userRole, quotaRemaining, getTodayUsedKey]);

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

    // Asynchronously save to Cloudflare R2 + Supabase metadata
    fetch('/api/characters/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id,
        character: char,
        title: charTitle,
        nickname: updatedRecord.nickname,
        tagline: updatedRecord.tagline,
        flag_type: updatedRecord.flag_type,
        image_url: updatedRecord.image_url,
        gallery_urls: updatedRecord.gallery_urls,
        share_permission: updatedRecord.share_permission,
        is_shared: updatedRecord.is_shared,
        share_id: updatedRecord.share_id,
        user_id: user?.id || 'guest',
      }),
    }).catch((e) => console.warn('Cloud save error:', e));

    if (user) {
      const { character_data, ...metadataRow } = updatedRecord as any;
      supabase
        .from('characters')
        .upsert(metadataRow)
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

      // Asynchronously save to Cloudflare R2 + Supabase metadata
      fetch('/api/characters/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: newRecord.id,
          character: char,
          title: charTitle,
          nickname: newRecord.nickname,
          tagline: newRecord.tagline,
          flag_type: newRecord.flag_type,
          image_url: newRecord.image_url,
          gallery_urls: newRecord.gallery_urls,
          share_permission: newRecord.share_permission,
          is_shared: newRecord.is_shared,
          share_id: newRecord.share_id,
          user_id: effectiveUserId,
        }),
      }).catch((e) => console.warn('Cloud save error:', e));

      if (user) {
        const { character_data, ...metadataRow } = newRecord as any;
        supabase
          .from('characters')
          .upsert(metadataRow)
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
    if (typeof window !== 'undefined' && sessionStorage.getItem('sedchar_is_readonly_active') === 'true') {
      console.warn('Blocked delete attempt in Read-Only mode');
      return false;
    }
    const key = getStorageKey(user?.id);
    const updated = savedCharacters.filter(c => c.id !== id);
    setSavedCharacters(updated);
    try {
      localStorage.setItem(key, JSON.stringify(updated));
    } catch {}

    fetch('/api/characters/save?id=' + encodeURIComponent(id), { method: 'DELETE' }).catch(() => {});
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

    // 3. Persist Share to Cloudflare R2 and Supabase
    if (charRecord) {
      fetch('/api/characters/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          character: charRecord.character_data,
          permission,
          title: charRecord.title,
        }),
      }).catch((e) => console.warn('Cloud share sync note:', e));
    }

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
        isProfileModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
        openLibraryModal,
        closeLibraryModal,
        openProfileModal,
        closeProfileModal,
        updateUserProfile,
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
