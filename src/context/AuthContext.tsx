'use client';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/client';
import type { ThaiMasterCharacter } from '@/shared/types';

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
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  quotaRemaining: number;
  quotaMax: number;
  savedCharacters: SavedCharacterRecord[];
  isLibraryLoading: boolean;
  isAuthModalOpen: boolean;
  isLibraryModalOpen: boolean;
  openAuthModal: (mode?: 'signin' | 'signup' | 'reset') => void;
  closeAuthModal: () => void;
  openLibraryModal: () => void;
  closeLibraryModal: () => void;
  signInWithGoogle: () => Promise<{ error: any }>;
  signInWithDiscord: () => Promise<{ error: any }>;
  signInWithEmail: (email: string, pass: string) => Promise<{ error: any }>;
  signUpWithEmail: (email: string, pass: string) => Promise<{ error: any; data: any }>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  updatePassword: (newPass: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  consumeQuota: () => boolean;
  saveToLibrary: (char: ThaiMasterCharacter, title?: string, imageUrl?: string, galleryUrls?: string[]) => Promise<{ success: boolean; error?: string }>;
  deleteFromLibrary: (id: string) => Promise<boolean>;
  loadLibrary: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DAILY_QUOTA_MAX = 15;

export function AuthProvider({ children }: { readonly children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quotaRemaining, setQuotaRemaining] = useState<number>(DAILY_QUOTA_MAX);
  const [savedCharacters, setSavedCharacters] = useState<SavedCharacterRecord[]>([]);
  const [isLibraryLoading, setIsLibraryLoading] = useState(false);

  // Modals state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isLibraryModalOpen, setIsLibraryModalOpen] = useState(false);

  const supabase = createClient();

  const getTodayKey = useCallback((userId: string) => {
    const today = new Date().toISOString().slice(0, 10);
    return `sedchar_quota_${userId}_${today}`;
  }, []);

  // Update Quota for user
  const syncQuota = useCallback((currentUser: User | null) => {
    if (!currentUser) {
      setQuotaRemaining(0);
      return;
    }
    try {
      const key = getTodayKey(currentUser.id);
      const stored = localStorage.getItem(key);
      if (stored !== null) {
        setQuotaRemaining(Math.max(0, parseInt(stored, 10)));
      } else {
        localStorage.setItem(key, String(DAILY_QUOTA_MAX));
        setQuotaRemaining(DAILY_QUOTA_MAX);
      }
    } catch {
      setQuotaRemaining(DAILY_QUOTA_MAX);
    }
  }, [getTodayKey]);

  // Load Library from Supabase and fallback to user local cloud storage
  const loadLibrary = useCallback(async () => {
    if (!user) {
      setSavedCharacters([]);
      return;
    }
    setIsLibraryLoading(true);
    try {
      // 1. Try fetching from Supabase table 'characters'
      const { data, error } = await supabase
        .from('characters')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (!error && Array.isArray(data)) {
        setSavedCharacters(data as SavedCharacterRecord[]);
      } else {
        // Fallback to local storage persistent library for this user
        const localKey = `sedchar_library_${user.id}`;
        const localData = localStorage.getItem(localKey);
        if (localData) {
          setSavedCharacters(JSON.parse(localData));
        } else {
          setSavedCharacters([]);
        }
      }
    } catch {
      const localKey = `sedchar_library_${user.id}`;
      try {
        const localData = localStorage.getItem(localKey);
        if (localData) setSavedCharacters(JSON.parse(localData));
      } catch {}
    } finally {
      setIsLibraryLoading(false);
    }
  }, [user, supabase]);

  // Auth state listener
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        syncQuota(currentSession?.user ?? null);
      } catch (err) {
        console.error('Session check error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      syncQuota(newSession?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, syncQuota]);

  // When user changes, load their library
  useEffect(() => {
    if (user) {
      loadLibrary();
    } else {
      setSavedCharacters([]);
    }
  }, [user, loadLibrary]);

  const openAuthModal = useCallback(() => setIsAuthModalOpen(true), []);
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
    setSavedCharacters([]);
    setQuotaRemaining(0);
  };

  const consumeQuota = useCallback((): boolean => {
    if (!user) {
      openAuthModal();
      return false;
    }
    if (quotaRemaining <= 0) {
      return false;
    }
    const nextVal = quotaRemaining - 1;
    setQuotaRemaining(nextVal);
    try {
      const key = getTodayKey(user.id);
      localStorage.setItem(key, String(nextVal));
    } catch {}
    return true;
  }, [user, quotaRemaining, getTodayKey, openAuthModal]);

  const saveToLibrary = async (
    char: ThaiMasterCharacter,
    title?: string,
    imageUrl?: string,
    galleryUrls?: string[]
  ): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      openAuthModal();
      return { success: false, error: 'กรุณาเข้าสู่ระบบก่อนบันทึกตัวละคร' };
    }

    const charTitle = title || char.fullName || char.nickname || 'ตัวละครไม่มีชื่อ';
    const newRecord: SavedCharacterRecord = {
      id: `char-${Date.now()}`,
      user_id: user.id,
      title: charTitle,
      nickname: char.nickname || char.fullName || 'ตัวละคร',
      tagline: char.punchline || char.shortIntro || char.occupation || '',
      flag_type: char.flagType,
      image_url: imageUrl || '',
      gallery_urls: galleryUrls && galleryUrls.length > 0 ? galleryUrls : (imageUrl ? [imageUrl] : []),
      character_data: char,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    try {
      // 1. Try save to Supabase
      const { data, error } = await supabase
        .from('characters')
        .upsert(newRecord)
        .select();

      if (error) {
        console.warn('Supabase DB save fallback to local cloud sync:', error.message);
      }

      // 2. Always persist to local user library storage for instant sync
      const localKey = `sedchar_library_${user.id}`;
      const currentList = [...savedCharacters];
      const existingIdx = currentList.findIndex(c => c.title === charTitle || c.nickname === char.nickname);
      if (existingIdx !== -1) {
        currentList[existingIdx] = { ...newRecord, id: currentList[existingIdx]?.id ?? newRecord.id };
      } else {
        currentList.unshift(newRecord);
      }
      localStorage.setItem(localKey, JSON.stringify(currentList));
      setSavedCharacters(currentList);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'บันทึกไม่สำเร็จ' };
    }
  };

  const deleteFromLibrary = async (id: string): Promise<boolean> => {
    if (!user) return false;
    try {
      await supabase.from('characters').delete().eq('id', id).eq('user_id', user.id);
    } catch {}

    const localKey = `sedchar_library_${user.id}`;
    const updated = savedCharacters.filter(c => c.id !== id);
    setSavedCharacters(updated);
    try {
      localStorage.setItem(localKey, JSON.stringify(updated));
    } catch {}
    return true;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        quotaRemaining,
        quotaMax: DAILY_QUOTA_MAX,
        savedCharacters,
        isLibraryLoading,
        isAuthModalOpen,
        isLibraryModalOpen,
        openAuthModal,
        closeAuthModal,
        openLibraryModal,
        closeLibraryModal,
        signInWithGoogle,
        signInWithDiscord,
        signInWithEmail,
        signUpWithEmail,
        resetPassword,
        updatePassword,
        signOut,
        consumeQuota,
        saveToLibrary,
        deleteFromLibrary,
        loadLibrary,
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
