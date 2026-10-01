'use client';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User as UserIcon,
  Camera,
  Sparkles,
  Check,
  Loader2,
  ArrowLeft,
  ShieldCheck,
  Coins,
  Crown,
  Coffee,
  Gem,
  Palette,
  Eye,
  Layers,
  Sparkle,
  Image as ImageIcon,
  Sliders,
  Trash2,
  UploadCloud,
  Grid,
  CircleDot,
  FolderOpen,
  Plus,
  Share2,
  FileText,
  FileJson,
  ExternalLink,
  MessageSquare,
  Globe,
  Lock,
  Search,
  Copy,
  Users,
  KeyRound,
  LogOut,
  MoveVertical,
  Hand,
} from 'lucide-react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { UserMenu } from '@/components/auth/UserMenu';
import { AuthModal } from '@/components/auth/AuthModal';
import { UpgradeModal } from '@/components/ui/UpgradeModal';
import { compressImageToAvatar, compressImageToBanner } from '@/utils/imageCompressor';
import {
  AVATAR_BG_THEMES,
  BANNER_THEMES,
  getAvatarTheme,
  getBannerTheme,
} from '@/utils/profileThemes';
import {
  SavedMultiProjectRecord,
  loadLocalMultiProjects,
  deduplicateProjectRecords,
  RUBII_MULTI_DRAFT_KEY,
  MULTI_CHAR_LIBRARY_KEY,
  ACTIVE_MULTI_PROJECT_ID_KEY,
} from '@/hooks/useMultiCharacterProject';
import { compileRubiiProjectMarkdown } from '@/components/rubii-multi/RubiiDraftPreviewSection';
import { UniverseShareModal } from '@/components/universe/UniverseShareModal';
import type { MultiCharacterProjectDraft } from '@/shared/multiCharTypes';
import type { SavedCharacterRecord } from '@/context/AuthContext';
import { characterToFullMarkdown } from '@/shared/thaiTagParser';
import { exportCharacterJson } from '@/shared/shareUtils';
import { CHARACTER_FLAGS } from '@/shared/types';

function hslToHex(h: number, s: number, l: number): string {
  const normL = Math.max(0, Math.min(100, l)) / 100;
  const a = (Math.max(0, Math.min(100, s)) * Math.min(normL, 1 - normL)) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = normL - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function hexToHsl(hex: string): [number, number, number] {
  let c = (hex || '').replace('#', '').trim();
  if (c.length === 3) c = c.split('').map((x) => x + x).join('');
  if (c.length !== 6) return [260, 70, 45];
  const num = parseInt(c, 16);
  if (isNaN(num)) return [260, 70, 45];
  const r = ((num >> 16) & 255) / 255;
  const g = ((num >> 8) & 255) / 255;
  const b = (num & 255) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

const AVATAR_PRESETS = [
  { id: 'sakura', label: 'ซากุระ', emoji: '🌸', bg: 'bg-pink-500/20 text-pink-500 border-pink-500/30' },
  { id: 'cat', label: 'เหมียว', emoji: '🐱', bg: 'bg-amber-500/20 text-amber-500 border-amber-500/30' },
  { id: 'fox', label: 'จิ้งจอก', emoji: '🦊', bg: 'bg-orange-500/20 text-orange-500 border-orange-500/30' },
  { id: 'crown', label: 'มงกุฎ', emoji: '👑', bg: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30' },
  { id: 'wand', label: 'เวทมนตร์', emoji: '🪄', bg: 'bg-purple-500/20 text-purple-500 border-purple-500/30' },
  { id: 'coffee', label: 'กาแฟ', emoji: '☕', bg: 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30' },
  { id: 'gaming', label: 'เกมมิ่ง', emoji: '🎮', bg: 'bg-indigo-500/20 text-indigo-500 border-indigo-500/30' },
  { id: 'leaf', label: 'ธรรมชาติ', emoji: '🌿', bg: 'bg-green-500/20 text-green-500 border-green-500/30' },
  { id: 'gem', label: 'คริสตัล', emoji: '💎', bg: 'bg-cyan-500/20 text-cyan-500 border-cyan-500/30' },
  { id: 'moon', label: 'พระจันทร์', emoji: '🌙', bg: 'bg-violet-500/20 text-violet-500 border-violet-500/30' },
  { id: 'dragon', label: 'มังกร', emoji: '🐉', bg: 'bg-rose-500/20 text-rose-500 border-rose-500/30' },
  { id: 'berry', label: 'เบอร์รี่', emoji: '🍓', bg: 'bg-red-500/20 text-red-500 border-red-500/30' },
];

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ProfileErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[Profile Error Boundary caught error]:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-md p-8 rounded-3xl bg-card border border-border shadow-2xl space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center justify-center mx-auto text-2xl">
              ⚠️
            </div>
            <h2 className="text-lg font-bold text-foreground">
              ระบบเกิดข้อผิดพลาดชั่วคราว
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              เราตรวจพบข้อผิดพลาดในหน้านี้ ระบบได้ป้องกันและบันทึกข้อมูลของคุณอย่างปลอดภัยแล้ว
            </p>
            {this.state.error?.message && (
              <div className="p-3 rounded-xl bg-muted/60 border border-border text-[11px] font-mono text-rose-500/90 text-left overflow-x-auto max-h-32">
                {this.state.error.message}
              </div>
            )}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => this.setState({ hasError: false, error: null })}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
              >
                ลองใหม่อีกครั้ง
              </button>
              <Link
                href="/multi"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-muted hover:bg-muted/80 text-foreground text-xs font-bold shadow-xs transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>กลับสู่ Multi Studio</span>
              </Link>
              <Link
                href="/"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-muted hover:bg-muted/80 text-foreground text-xs font-bold shadow-xs transition-all"
              >
                <span>หน้าหลัก</span>
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function ProfilePage() {
  return (
    <AuthProvider>
      <ProfileErrorBoundary>
        <ProfileContent />
      </ProfileErrorBoundary>
    </AuthProvider>
  );
}

function ProfileContent() {
  const router = useRouter();
  const {
    user,
    userRole,
    quotaRemaining,
    quotaMax,
    updateUserProfile,
    openAuthModal,
    signOut,
    savedCharacters,
    deleteFromLibrary,
    setActiveLoadedCharacterId,
    isLoading,
  } = useAuth();

  // Active Main Tab on Profile Page
  const [activeTab, setActiveTab] = useState<
    'themes' | 'single_characters' | 'my_universes' | 'commu_hub' | 'account'
  >('themes');

  // Single Characters Search State
  const [singleCharSearch, setSingleCharSearch] = useState('');

  // Profile Form States
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

  // Avatar Aura State
  const [avatarBgTheme, setAvatarBgTheme] = useState('nebula');
  const [avatarMode, setAvatarMode] = useState<'preset' | 'custom_gradient' | 'custom'>('preset');
  const [customAvatarBg, setCustomAvatarBg] = useState('#8b5cf6');
  const [customAvatarBg2, setCustomAvatarBg2] = useState('#ec4899');
  const [avatarGradientAngle, setAvatarGradientAngle] = useState(135);

  // Avatar Aura Interactive HSL Slider States
  const [a1Hue, setA1Hue] = useState(() => hexToHsl('#8b5cf6')[0]);
  const [a1Sat, setA1Sat] = useState(() => hexToHsl('#8b5cf6')[1]);
  const [a1Light, setA1Light] = useState(() => hexToHsl('#8b5cf6')[2]);

  const [a2Hue, setA2Hue] = useState(() => hexToHsl('#ec4899')[0]);
  const [a2Sat, setA2Sat] = useState(() => hexToHsl('#ec4899')[1]);
  const [a2Light, setA2Light] = useState(() => hexToHsl('#ec4899')[2]);

  const updateAvatarColor1 = (h: number, s: number, l: number) => {
    const clampedH = (h + 360) % 360;
    const clampedS = Math.max(0, Math.min(100, s));
    const clampedL = Math.max(5, Math.min(95, l));
    setA1Hue(clampedH);
    setA1Sat(clampedS);
    setA1Light(clampedL);
    setCustomAvatarBg(hslToHex(clampedH, clampedS, clampedL));
  };

  const updateAvatarColor2 = (h: number, s: number, l: number) => {
    const clampedH = (h + 360) % 360;
    const clampedS = Math.max(0, Math.min(100, s));
    const clampedL = Math.max(5, Math.min(95, l));
    setA2Hue(clampedH);
    setA2Sat(clampedS);
    setA2Light(clampedL);
    setCustomAvatarBg2(hslToHex(clampedH, clampedS, clampedL));
  };

  // Banner State
  const [bannerMode, setBannerMode] = useState<'preset' | 'custom_gradient' | 'custom_image'>('preset');
  const [bannerTheme, setBannerTheme] = useState('pastel_sakura');
  const [bannerUrl, setBannerUrl] = useState('');
  const [bannerPosY, setBannerPosY] = useState(50);
  const [bannerFullCard, setBannerFullCard] = useState(true);
  const [customColor1, setCustomColor1] = useState('#fbcfe8');
  const [customColor2, setCustomColor2] = useState('#93c5fd');
  const [bannerPattern, setBannerPattern] = useState<'stars' | 'grid' | 'dots' | 'none'>('dots');

  // Interactive Dragging on Banner
  const [isDraggingBanner, setIsDraggingBanner] = useState(false);
  const dragStartRef = useRef<{ startY: number; initialPosY: number } | null>(null);
  const bannerContainerRef = useRef<HTMLDivElement>(null);

  const handleBannerMouseDown = (e: React.MouseEvent) => {
    if (bannerMode !== 'custom_image' && !bannerUrl) return;
    dragStartRef.current = { startY: e.clientY, initialPosY: bannerPosY };
    setIsDraggingBanner(true);
  };

  const handleBannerMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingBanner || !dragStartRef.current || !bannerContainerRef.current) return;
    const rect = bannerContainerRef.current.getBoundingClientRect();
    const deltaY = e.clientY - dragStartRef.current.startY;
    const deltaPercent = (deltaY / rect.height) * 100;
    const newPos = Math.max(0, Math.min(100, Math.round(dragStartRef.current.initialPosY - deltaPercent)));
    setBannerPosY(newPos);
  };

  const handleBannerMouseUp = () => {
    if (isDraggingBanner) {
      setIsDraggingBanner(false);
      dragStartRef.current = null;
    }
  };

  const handleBannerTouchStart = (e: React.TouchEvent) => {
    if (bannerMode !== 'custom_image' && !bannerUrl) return;
    const touch = e.touches[0];
    if (!touch) return;
    dragStartRef.current = { startY: touch.clientY, initialPosY: bannerPosY };
    setIsDraggingBanner(true);
  };

  const handleBannerTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingBanner || !dragStartRef.current || !bannerContainerRef.current) return;
    const touch = e.touches[0];
    if (!touch) return;
    const rect = bannerContainerRef.current.getBoundingClientRect();
    const deltaY = touch.clientY - dragStartRef.current.startY;
    const deltaPercent = (deltaY / rect.height) * 100;
    const newPos = Math.max(0, Math.min(100, Math.round(dragStartRef.current.initialPosY - deltaPercent)));
    setBannerPosY(newPos);
  };

  const handleBannerTouchEnd = () => {
    if (isDraggingBanner) {
      setIsDraggingBanner(false);
      dragStartRef.current = null;
    }
  };

  // Interactive Gradient Slider States (HSL)
  const [c1Hue, setC1Hue] = useState(() => hexToHsl('#fbcfe8')[0]);
  const [c1Sat, setC1Sat] = useState(() => hexToHsl('#fbcfe8')[1]);
  const [c1Light, setC1Light] = useState(() => hexToHsl('#fbcfe8')[2]);

  const [c2Hue, setC2Hue] = useState(() => hexToHsl('#93c5fd')[0]);
  const [c2Sat, setC2Sat] = useState(() => hexToHsl('#93c5fd')[1]);
  const [c2Light, setC2Light] = useState(() => hexToHsl('#93c5fd')[2]);

  const [gradientAngle, setGradientAngle] = useState(135);
  const [bannerCategoryFilter, setBannerCategoryFilter] = useState<'all' | 'pastel' | 'solid' | 'dark' | 'vibrant'>('all');

  const updateColor1 = (h: number, s: number, l: number) => {
    const clampedH = (h + 360) % 360;
    const clampedS = Math.max(0, Math.min(100, s));
    const clampedL = Math.max(5, Math.min(95, l));
    setC1Hue(clampedH);
    setC1Sat(clampedS);
    setC1Light(clampedL);
    setCustomColor1(hslToHex(clampedH, clampedS, clampedL));
  };

  const updateColor2 = (h: number, s: number, l: number) => {
    const clampedH = (h + 360) % 360;
    const clampedS = Math.max(0, Math.min(100, s));
    const clampedL = Math.max(5, Math.min(95, l));
    setC2Hue(clampedH);
    setC2Sat(clampedS);
    setC2Light(clampedL);
    setCustomColor2(hslToHex(clampedH, clampedS, clampedL));
  };

  // Async & Feedback States
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  // Project Library States for Tab 3 & Tab 4
  const [savedProjects, setSavedProjects] = useState<SavedMultiProjectRecord[]>([]);
  const [projectSearch, setProjectSearch] = useState('');
  const [shareTargetProject, setShareTargetProject] = useState<MultiCharacterProjectDraft | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const bannerFileInputRef = useRef<HTMLInputElement>(null);

  // Trigger Toast Notification
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Sync User Metadata on Load
  useEffect(() => {
    if (user) {
      const meta = user.user_metadata || {};
      const currentName = meta.display_name || meta.full_name || (user.email ? user.email.split('@')[0] : '');
      setDisplayName(currentName);
      setBio(meta.bio || '');
      setAvatarUrl(meta.avatar_url || '');
      setSelectedPreset(meta.avatar_preset || null);

      // Restore avatar aura
      if (meta.custom_avatar_bg && meta.custom_avatar_bg2) {
        setAvatarMode('custom_gradient');
        setCustomAvatarBg(meta.custom_avatar_bg);
        setCustomAvatarBg2(meta.custom_avatar_bg2);
        setAvatarGradientAngle(meta.avatar_gradient_angle || 135);
        const [h1, s1, l1] = hexToHsl(meta.custom_avatar_bg);
        const [h2, s2, l2] = hexToHsl(meta.custom_avatar_bg2);
        setA1Hue(h1);
        setA1Sat(s1);
        setA1Light(l1);
        setA2Hue(h2);
        setA2Sat(s2);
        setA2Light(l2);
      } else if (meta.custom_avatar_bg) {
        setAvatarMode('custom');
        setCustomAvatarBg(meta.custom_avatar_bg);
        const [h1, s1, l1] = hexToHsl(meta.custom_avatar_bg);
        setA1Hue(h1);
        setA1Sat(s1);
        setA1Light(l1);
      } else {
        setAvatarMode('preset');
        setAvatarBgTheme(meta.avatar_bg_theme || 'nebula');
      }

      // Restore banner
      if (meta.banner_url) {
        setBannerMode('custom_image');
        setBannerUrl(meta.banner_url);
      } else if (meta.custom_banner_color1 && meta.custom_banner_color2) {
        setBannerMode('custom_gradient');
        setCustomColor1(meta.custom_banner_color1);
        setCustomColor2(meta.custom_banner_color2);
        const [h1, s1, l1] = hexToHsl(meta.custom_banner_color1);
        const [h2, s2, l2] = hexToHsl(meta.custom_banner_color2);
        setC1Hue(h1);
        setC1Sat(s1);
        setC1Light(l1);
        setC2Hue(h2);
        setC2Sat(s2);
        setC2Light(l2);
      } else {
        setBannerMode('preset');
        setBannerTheme(meta.banner_theme || 'pastel_sakura');
      }

      if (meta.banner_pos_y !== undefined) {
        setBannerPosY(Number(meta.banner_pos_y));
      }
      if (meta.banner_full_card !== undefined) {
        setBannerFullCard(Boolean(meta.banner_full_card));
      }

      if (meta.banner_pattern) {
        setBannerPattern(meta.banner_pattern);
      }
    }
  }, [user]);

  // Load and Deduplicate Projects from Local Storage & Cloud
  const refreshProjects = React.useCallback(() => {
    const localRecords = loadLocalMultiProjects();
    setSavedProjects(localRecords);

    // Also fetch latest from cloud
    fetch('/api/universe/library')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.projects)) {
          const merged = deduplicateProjectRecords([...localRecords, ...data.projects]);
          setSavedProjects(merged);
          try {
            localStorage.setItem(MULTI_CHAR_LIBRARY_KEY, JSON.stringify(merged));
          } catch {}
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    refreshProjects();
  }, [refreshProjects]);

  // Filtered Single Characters for Tab 2
  const filteredSingleChars = useMemo(() => {
    if (!savedCharacters || !Array.isArray(savedCharacters)) return [];
    if (!singleCharSearch.trim()) return savedCharacters;
    const q = singleCharSearch.toLowerCase().trim();
    return savedCharacters.filter((c) => {
      if (!c) return false;
      const name = (c.title || c.nickname || '').toLowerCase();
      const tagline = (c.tagline || '').toLowerCase();
      return name.includes(q) || tagline.includes(q);
    });
  }, [savedCharacters, singleCharSearch]);

  // Categorize Projects for Tabs
  const myCreatedProjects = useMemo(() => {
    if (!Array.isArray(savedProjects)) return [];
    return savedProjects.filter(
      (p) =>
        p &&
        !(typeof p.id === 'string' && p.id.startsWith('cloned_')) &&
        !(p.title || '').includes('(Cloned)') &&
        !(p.projectData as any)?.isCloned
    );
  }, [savedProjects]);

  // Shared & Commu Projects - Deduplicate so owned universes never have duplicate cloned cards
  const sharedAndCommuProjects = useMemo(() => {
    if (!Array.isArray(savedProjects)) return [];
    const seen = new Set<string>();
    const list: SavedMultiProjectRecord[] = [];

    savedProjects.forEach((p) => {
      if (!p || !p.id) return;
      const isOwnerShared = Boolean(p.isShared || p.shareId || (typeof p.id === 'string' && p.id.startsWith('uni_')));
      const isCloned = (typeof p.id === 'string' && p.id.startsWith('cloned_')) || (p.title || '').includes('(Cloned)') || Boolean((p.projectData as any)?.isCloned);
      
      if (isOwnerShared || isCloned) {
        const cleanTitle = (p.title || '')
          .replace(/\s*\(\s*cloned\s*\)/gi, '')
          .replace(/\s*\(\s*โคลน\s*\)/gi, '')
          .replace(/\s*\(\s*co-created\s*\)/gi, '')
          .replace(/\s*\(\s*ร่วมสร้าง\s*\)/gi, '')
          .trim()
          .toLowerCase();
        
        const dedupeKey = cleanTitle || p.shareId || p.id;
        if (!seen.has(dedupeKey)) {
          seen.add(dedupeKey);
          list.push(p);
        }
      }
    });

    return list;
  }, [savedProjects]);

  const filteredMyProjects = useMemo(() => {
    if (!Array.isArray(myCreatedProjects)) return [];
    const q = (projectSearch || '').toLowerCase().trim();
    if (!q) return myCreatedProjects;
    return myCreatedProjects.filter(
      (p) =>
        p &&
        ((p.title || '').toLowerCase().includes(q) ||
          (p.description || '').toLowerCase().includes(q))
    );
  }, [myCreatedProjects, projectSearch]);

  const initial = displayName
    ? displayName.charAt(0).toUpperCase()
    : user?.email
    ? user.email.charAt(0).toUpperCase()
    : 'U';

  const activeAvatarTheme = getAvatarTheme(
    avatarMode === 'preset' ? avatarBgTheme : undefined,
    avatarMode === 'custom'
      ? customAvatarBg
      : avatarMode === 'custom_gradient'
      ? customAvatarBg
      : undefined,
    avatarMode === 'custom_gradient' ? customAvatarBg2 : undefined,
    avatarGradientAngle
  );

  const activeBannerTheme = getBannerTheme(
    bannerMode === 'preset' ? bannerTheme : undefined,
    bannerMode === 'custom_gradient' ? customColor1 : undefined,
    bannerMode === 'custom_gradient' ? customColor2 : undefined,
    bannerMode === 'custom_image' ? bannerUrl : undefined,
    gradientAngle,
    bannerPosY
  );

  // Handle Avatar Upload
  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingAvatar(true);
    try {
      const compressedDataUrl = await compressImageToAvatar(file, 320, 0.85);
      const res = await fetch('/api/avatar/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: compressedDataUrl, userId: user?.id }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.url) {
          setAvatarUrl(data.url);
          await updateUserProfile({ avatarUrl: data.url });
        } else {
          setAvatarUrl(compressedDataUrl);
        }
      } else {
        setAvatarUrl(compressedDataUrl);
      }
      setSelectedPreset(null);
      showToast('อัปเดตรูปโปรไฟล์ Avatar สำเร็จแล้ว!');
    } catch (err: any) {
      alert(err.message || 'เกิดข้อผิดพลาดในการประมวลผลรูปภาพ Avatar');
    } finally {
      setIsUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Handle Banner Upload
  const handleBannerFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingBanner(true);
    try {
      const compressedBanner = await compressImageToBanner(file, 1400, 900, 0.85);
      const res = await fetch('/api/avatar/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: compressedBanner, userId: user?.id }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.url) {
          setBannerUrl(data.url);
          setBannerMode('custom_image');
          await updateUserProfile({ bannerUrl: data.url });
        } else {
          setBannerUrl(compressedBanner);
          setBannerMode('custom_image');
        }
      } else {
        setBannerUrl(compressedBanner);
        setBannerMode('custom_image');
      }
      showToast('อัปโหลดแบนเนอร์สำเร็จแล้ว!');
    } catch (err: any) {
      alert(err.message || 'เกิดข้อผิดพลาดในการอัปโหลดรูปภาพแบนเนอร์');
    } finally {
      setIsUploadingBanner(false);
      if (bannerFileInputRef.current) bannerFileInputRef.current.value = '';
    }
  };

  const handleChoosePreset = async (preset: typeof AVATAR_PRESETS[0]) => {
    setSelectedPreset(preset.id);
    const svgString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="#18181b"/><text x="50%" y="54%" dominant-baseline="central" text-anchor="middle" font-size="52">${preset.emoji}</text></svg>`;
    const dataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svgString)}`;
    setAvatarUrl(dataUrl);

    try {
      const res = await fetch('/api/avatar/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: dataUrl, userId: user?.id }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.url) {
          setAvatarUrl(data.url);
          await updateUserProfile({ avatarUrl: data.url });
        }
      }
      showToast(`เลือกไอคอน ${preset.label} เรียบร้อย!`);
    } catch {}
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;

    const trimmedName = displayName.trim();
    if (!trimmedName) {
      alert('กรุณากรอกชื่อที่ต้องการแสดง');
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await updateUserProfile({
        displayName: trimmedName,
        avatarUrl: avatarUrl || undefined,
        bio: bio.trim(),
        avatarBgTheme: avatarMode === 'preset' ? avatarBgTheme : undefined,
        customAvatarBg:
          avatarMode === 'custom'
            ? customAvatarBg
            : avatarMode === 'custom_gradient'
            ? customAvatarBg
            : undefined,
        customAvatarBg2: avatarMode === 'custom_gradient' ? customAvatarBg2 : undefined,
        avatarGradientAngle: avatarMode === 'custom_gradient' ? avatarGradientAngle : undefined,
        bannerTheme: bannerMode === 'preset' ? bannerTheme : undefined,
        bannerUrl: bannerMode === 'custom_image' ? bannerUrl : '',
        bannerPosY,
        bannerFullCard,
        customBannerColor1: bannerMode === 'custom_gradient' ? customColor1 : undefined,
        customBannerColor2: bannerMode === 'custom_gradient' ? customColor2 : undefined,
        bannerPattern,
      });

      if (error) {
        alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล: ' + (error.message || 'กรุณาลองใหม่อีกครั้ง'));
      } else {
        setSaveSuccess(true);
        showToast('บันทึกการตั้งค่าโปรไฟล์ & ธีมเรียบร้อยแล้ว!');
        setTimeout(() => {
          setSaveSuccess(false);
        }, 2500);
      }
    } catch (err: any) {
      alert('เกิดข้อผิดพลาดในการบันทึก: ' + String(err));
    } finally {
      setIsSaving(false);
    }
  };

  // Open Single Character in Studio
  const handleOpenSingleCharInStudio = (charRecord: SavedCharacterRecord) => {
    try {
      if (charRecord.character_data) {
        localStorage.setItem('sedchar_active_draft', JSON.stringify(charRecord.character_data));
        localStorage.setItem('sedchar_active_character_id', charRecord.id);
        localStorage.removeItem('sedchar_raw_markdown_draft');
      }
      router.push('/');
    } catch (e) {
      router.push('/');
    }
  };

  // Copy Single Character Prompt
  const handleCopySingleCharPrompt = (charRecord: SavedCharacterRecord) => {
    try {
      const md = characterToFullMarkdown(charRecord.character_data);
      navigator.clipboard.writeText(md);
      showToast(`คัดลอก Prompt ของ "${charRecord.title || charRecord.nickname}" แล้ว!`);
    } catch {
      showToast('เกิดข้อผิดพลาดในการคัดลอก Prompt');
    }
  };

  // Download Single Character as Markdown
  const handleDownloadSingleCharMd = (charRecord: SavedCharacterRecord) => {
    try {
      const md = characterToFullMarkdown(charRecord.character_data);
      const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${(charRecord.title || charRecord.nickname || 'character').replace(/[^a-zA-Z0-9_\u0E00-\u0E7F-]/g, '_')}_prompt.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('ดาวน์โหลดไฟล์ Markdown เรียบร้อย');
    } catch {
      showToast('เกิดข้อผิดพลาดในการดาวน์โหลด');
    }
  };

  // Download Single Character as JSON
  const handleDownloadSingleCharJson = (charRecord: SavedCharacterRecord) => {
    try {
      exportCharacterJson(charRecord.character_data, charRecord.title || charRecord.nickname);
      showToast('ดาวน์โหลดไฟล์ JSON เรียบร้อย');
    } catch {
      showToast('เกิดข้อผิดพลาดในการดาวน์โหลด');
    }
  };

  // Delete Single Character
  const handleDeleteSingleChar = async (id: string, name: string) => {
    if (!confirm(`คุณต้องการลบตัวละคร "${name}" ออกจากคลังใช่หรือไม่?`)) return;
    const ok = await deleteFromLibrary(id);
    if (ok) {
      showToast(`ลบตัวละคร "${name}" เรียบร้อย`);
    } else {
      showToast('เกิดข้อผิดพลาดในการลบ');
    }
  };

  // Open Project in Studio
  const handleOpenInStudio = (record: SavedMultiProjectRecord) => {
    try {
      if (record.projectData) {
        localStorage.setItem(RUBII_MULTI_DRAFT_KEY, JSON.stringify(record.projectData));
        localStorage.setItem(ACTIVE_MULTI_PROJECT_ID_KEY, record.id);
      }
      router.push('/multi');
    } catch (e) {
      router.push('/multi');
    }
  };

  // Delete Project from Local & Cloud
  const handleDeleteProject = async (id: string, title: string) => {
    if (!confirm(`คุณต้องการลบโปรเจกต์ "${title}" ออกจากคลังใช่หรือไม่?`)) return;

    const next = savedProjects.filter((p) => p.id !== id);
    setSavedProjects(next);
    try {
      localStorage.setItem(MULTI_CHAR_LIBRARY_KEY, JSON.stringify(next));
    } catch {}

    // Cloud Delete
    fetch(`/api/universe/library?id=${encodeURIComponent(id)}`, { method: 'DELETE' }).catch(() => {});
    showToast(`ลบโปรเจกต์ "${title}" เรียบร้อยแล้ว`);
  };

  // Download Handlers
  const handleDownloadMd = (record: SavedMultiProjectRecord) => {
    const mdStr = compileRubiiProjectMarkdown(record.projectData);
    const filename = `${record.title.replace(/\s+/g, '_') || 'universe_project'}.md`;
    const blob = new Blob([mdStr], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`ดาวน์โหลด ${filename} สำเร็จแล้ว!`);
  };

  const handleDownloadJson = (record: SavedMultiProjectRecord) => {
    const jsonStr = JSON.stringify(record.projectData, null, 2);
    const filename = `${record.title.replace(/\s+/g, '_') || 'universe_project'}.json`;
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`ดาวน์โหลด ${filename} สำเร็จแล้ว!`);
  };

  // Copy Share Link
  const handleCopyShareLink = (shareIdOrUrl: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const fullUrl = shareIdOrUrl.startsWith('http') ? shareIdOrUrl : `${origin}/universe/share/${shareIdOrUrl}`;
    navigator.clipboard.writeText(fullUrl);
    showToast('คัดลอกลิงก์แชร์ไปยังคลิปบอร์ดแล้ว!');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 text-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
          <p className="text-xs text-muted-foreground font-medium">กำลังโหลดข้อมูลโปรไฟล์...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md p-8 rounded-3xl bg-card border border-border shadow-xl space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-500 border border-purple-500/20 flex items-center justify-center mx-auto text-xl">
            <UserIcon className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-foreground">กรุณาเข้าสู่ระบบ</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            คุณจำเป็นต้องเข้าสู่ระบบเพื่อจัดการตั้งค่าโปรไฟล์ คลังจักรวาล และชุมชนของคุณ
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => openAuthModal('signin')}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-foreground text-background hover:bg-foreground/90 text-xs font-bold shadow-xs transition-all cursor-pointer"
            >
              เข้าสู่ระบบ / สมัครสมาชิก
            </button>
            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-muted hover:bg-muted/80 text-foreground text-xs font-bold shadow-xs transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>กลับหน้าหลัก</span>
            </Link>
          </div>
        </div>
        <AuthModal />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-2xl bg-foreground text-background font-bold text-xs shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-200 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-md px-4 sm:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/multi"
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Studio</span>
          </Link>
          <div className="h-4 w-px bg-border" />
          <h1 className="text-sm sm:text-base font-bold text-foreground">
            ศูนย์กลางโปรไฟล์ &amp; คลังจักรวาล (Profile &amp; Universes Hub)
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <UserMenu />
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-3.5 sm:p-8 space-y-6">
        {/* ======================================================== */}
        {/* Live Profile Card & Banner Showcase Header               */}
        {/* ======================================================== */}
        <div
          ref={bannerContainerRef}
          onMouseDown={handleBannerMouseDown}
          onMouseMove={handleBannerMouseMove}
          onMouseUp={handleBannerMouseUp}
          onMouseLeave={handleBannerMouseUp}
          onTouchStart={handleBannerTouchStart}
          onTouchMove={handleBannerTouchMove}
          onTouchEnd={handleBannerTouchEnd}
          className={`relative rounded-3xl border border-border/80 shadow-2xl overflow-hidden transition-all duration-300 select-none ${
            bannerMode === 'custom_image' && bannerUrl
              ? isDraggingBanner
                ? 'cursor-grabbing ring-2 ring-purple-500'
                : 'cursor-grab hover:ring-2 hover:ring-purple-500/50'
              : ''
          } ${
            bannerFullCard
              ? 'min-h-[380px] sm:min-h-[440px] flex flex-col justify-between p-4 sm:p-7'
              : 'bg-card'
          }`}
          style={
            bannerFullCard
              ? {
                  background: activeBannerTheme.gradient,
                  backgroundPosition: `center ${bannerPosY}%`,
                  backgroundSize: 'cover',
                  backgroundRepeat: 'no-repeat',
                }
              : undefined
          }
        >
          {/* Pattern Overlays (Full Card Mode) */}
          {bannerFullCard && (
            <>
              {bannerPattern === 'stars' && (
                <div className="absolute inset-0 opacity-30 bg-[radial-gradient(#fff_1.5px,transparent_1.5px)] [background-size:24px_24px] pointer-events-none" />
              )}
              {bannerPattern === 'grid' && (
                <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
              )}
              {bannerPattern === 'dots' && (
                <div className="absolute inset-0 opacity-25 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:12px_12px] pointer-events-none" />
              )}
              {/* Scrim Overlay for Contrast & Glass Depth */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/25 pointer-events-none" />
            </>
          )}

          {/* Top Floating Glass Bar */}
          <div className={`relative z-10 flex items-center justify-between gap-2 ${!bannerFullCard ? 'p-4 sm:p-6 pb-0' : ''}`}>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black/60 backdrop-blur-xl text-white text-[11px] font-semibold border border-white/20 shadow-lg">
                <Eye className="w-3.5 h-3.5 text-purple-300" />
                <span>ตัวอย่างโปรไฟล์ (Live Preview)</span>
              </span>

              {bannerMode === 'custom_image' && bannerUrl && (
                <span className="hidden sm:inline-flex items-center gap-1 px-3 py-1 rounded-full bg-purple-900/70 backdrop-blur-xl text-purple-200 text-[10px] font-bold border border-purple-400/30 animate-pulse">
                  <MoveVertical className="w-3 h-3" />
                  <span>ลากขึ้น-ลงเพื่อปรับตำแหน่ง ({bannerPosY}%)</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Display Mode Quick Toggle */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setBannerFullCard(!bannerFullCard);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-xl text-white text-[10.5px] font-semibold border border-white/20 transition-all cursor-pointer shadow-md"
                title="สลับโหมดการแสดงผลเต็มการ์ด / แบนเนอร์หัว"
              >
                <Layers className="w-3 h-3 text-amber-300" />
                <span>{bannerFullCard ? 'โหมดเต็มการ์ด' : 'โหมดแบนเนอร์บน'}</span>
              </button>

              <span
                className={`px-3 py-1 rounded-full text-[10px] font-extrabold border uppercase tracking-wider backdrop-blur-xl shadow-md ${activeBannerTheme.accentBadge}`}
              >
                {userRole}
              </span>
            </div>
          </div>

          {bannerFullCard ? (
            /* ======================================================== */
            /* FULL-BLEED IMMERSIVE GLASSMORPHISM CARD CONTENT          */
            /* ======================================================== */
            <div className="relative z-10 mt-6 sm:mt-10 p-4 sm:p-6 rounded-3xl bg-black/45 dark:bg-black/60 backdrop-blur-2xl border border-white/25 dark:border-white/15 shadow-2xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  {/* Avatar Preview with Dynamic Glow & Aura */}
                  <div
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl p-1 border-2 border-white/40 shadow-2xl shrink-0 transition-all duration-300"
                    style={{
                      background: activeAvatarTheme.gradient,
                      boxShadow: activeAvatarTheme.glow,
                    }}
                  >
                    <div className="w-full h-full rounded-2xl flex items-center justify-center text-white font-black text-2xl sm:text-3xl overflow-hidden bg-black/30 backdrop-blur-xs">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <span>{initial}</span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1 min-w-0">
                    <h3
                      className="text-lg sm:text-2xl font-black text-white flex items-center gap-2 truncate tracking-wide"
                      style={{
                        textShadow: '0 2px 4px rgba(0, 0, 0, 0.95), 0 0 16px rgba(0, 0, 0, 0.6)',
                      }}
                    >
                      <span>{displayName || 'ผู้ใช้งานไม่มีชื่อ'}</span>
                      <Sparkle className={`w-4 h-4 shrink-0 ${activeBannerTheme.accentText}`} />
                    </h3>
                    <p
                      className="text-xs text-white/80 font-mono truncate"
                      style={{ textShadow: '0 1px 3px rgba(0, 0, 0, 0.9)' }}
                    >
                      {user.email}
                    </p>
                  </div>
                </div>

                {/* Quota & Role Stats in Glass Badge */}
                <div className="flex items-center gap-2 text-xs shrink-0">
                  <div className="px-3.5 py-1.5 rounded-2xl bg-white/10 dark:bg-white/5 backdrop-blur-xl border border-white/20 flex items-center gap-1.5 text-white shadow-md">
                    <Coins className="w-3.5 h-3.5 text-amber-300" />
                    <span className="text-white/80">โควต้า AI:</span>
                    <strong className="text-white font-black font-mono">
                      {userRole === 'admin' ? '∞' : `${quotaRemaining}/${quotaMax}`}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Bio Preview with Glass Box */}
              {bio ? (
                <div
                  className="p-3.5 rounded-2xl bg-white/10 dark:bg-white/5 backdrop-blur-xl border border-white/15 text-xs text-white/95 leading-relaxed italic"
                  style={{ textShadow: '0 1px 2px rgba(0, 0, 0, 0.8)' }}
                >
                  &ldquo;{bio}&rdquo;
                </div>
              ) : (
                <div className="text-xs text-white/60 italic">
                  ยังไม่ได้ใส่คำแนะนำตัว (สามารถพิมพ์เพิ่มได้ที่แท็บตั้งค่าโปรไฟล์)
                </div>
              )}
            </div>
          ) : (
            /* ======================================================== */
            /* CLASSIC HEADER BANNER STYLE                              */
            /* ======================================================== */
            <>
              <div
                className="relative h-36 sm:h-48 w-full p-4 sm:p-6 flex flex-col justify-between overflow-hidden transition-all duration-500"
                style={{
                  background: activeBannerTheme.gradient,
                  backgroundPosition: `center ${bannerPosY}%`,
                  backgroundSize: 'cover',
                }}
              >
                {/* Pattern Overlays */}
                {bannerPattern === 'stars' && (
                  <div className="absolute inset-0 opacity-30 bg-[radial-gradient(#fff_1.5px,transparent_1.5px)] [background-size:24px_24px] pointer-events-none" />
                )}
                {bannerPattern === 'grid' && (
                  <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
                )}
                {bannerPattern === 'dots' && (
                  <div className="absolute inset-0 opacity-25 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:12px_12px] pointer-events-none" />
                )}
              </div>

              <div className="px-6 pb-6 pt-0 relative bg-card">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-12 sm:-mt-16 mb-4">
                  <div className="flex items-end gap-4">
                    <div
                      className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl p-1 border-4 border-card shadow-2xl shrink-0 transition-all duration-300"
                      style={{
                        background: activeAvatarTheme.gradient,
                        boxShadow: activeAvatarTheme.glow,
                      }}
                    >
                      <div className="w-full h-full rounded-2xl flex items-center justify-center text-white font-black text-3xl sm:text-4xl overflow-hidden bg-black/20 backdrop-blur-xs">
                        {avatarUrl ? (
                          <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <span>{initial}</span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-0.5 pb-1 min-w-0">
                      <h3 className="text-lg sm:text-2xl font-black text-foreground flex items-center gap-2 truncate">
                        <span>{displayName || 'ผู้ใช้งานไม่มีชื่อ'}</span>
                        <Sparkle className={`w-4 h-4 shrink-0 ${activeBannerTheme.accentText}`} />
                      </h3>
                      <p className="text-xs text-muted-foreground font-mono truncate">{user.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <div className="px-3.5 py-1.5 rounded-xl bg-muted/60 border border-border flex items-center gap-1.5 text-muted-foreground">
                      <Coins className="w-3.5 h-3.5 text-rose-500" />
                      <span>โควต้า AI:</span>
                      <strong className="text-foreground">
                        {userRole === 'admin' ? '∞' : `${quotaRemaining}/${quotaMax}`}
                      </strong>
                    </div>
                  </div>
                </div>

                {bio ? (
                  <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/80 text-xs text-foreground leading-relaxed italic">
                    &ldquo;{bio}&rdquo;
                  </div>
                ) : (
                  <div className="text-xs text-muted-foreground italic">
                    ยังไม่ได้ใส่คำแนะนำตัว (สามารถพิมพ์เพิ่มได้ที่แท็บตั้งค่าโปรไฟล์)
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* ======================================================== */}
        {/* Navigation Tabs (Responsive Grid) */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 p-1 rounded-2xl bg-muted border border-border">
          <button
            type="button"
            onClick={() => setActiveTab('themes')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'themes'
                ? 'bg-card text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Palette className="w-4 h-4 text-purple-500" />
            <span className="truncate">โปรไฟล์ &amp; ธีม</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('single_characters')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'single_characters'
                ? 'bg-card text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <UserIcon className="w-4 h-4 text-emerald-500" />
            <span className="truncate">ตัวละครเดี่ยว ({savedCharacters.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('my_universes')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'my_universes'
                ? 'bg-card text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <FolderOpen className="w-4 h-4 text-rose-500" />
            <span className="truncate">จักรวาล ({myCreatedProjects.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('commu_hub')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'commu_hub'
                ? 'bg-card text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-indigo-500" />
            <span className="truncate">ห้องสนทนา ({sharedAndCommuProjects.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('account')}
            className={`col-span-2 sm:col-span-1 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'account'
                ? 'bg-card text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-amber-500" />
            <span className="truncate">บัญชี &amp; สิทธิ์</span>
          </button>
        </div>

        {/* ======================================================== */}
        {/* TAB 1: Profile & Themes Customization Form               */}
        {/* ======================================================== */}
        {activeTab === 'themes' && (
          <div className="p-6 sm:p-8 rounded-3xl bg-card border border-border shadow-xl space-y-8 animate-in fade-in duration-200">
            <div className="flex items-center gap-3 border-b border-border pb-4">
              <div className="p-2.5 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                <Palette className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-foreground">
                  ปรับแต่งโปรไฟล์ แบนเนอร์ และสีออร่า
                </h2>
                <p className="text-xs text-muted-foreground">
                  เลือกธีมสีสำเร็จรูป หรือออกแบบโทนสีและอัปโหลดรูปภาพแบนเนอร์ของตนเอง
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-8">
              {/* Section 1: Profile Banner Customization */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="text-xs font-bold text-foreground flex items-center gap-2">
                    <Layers className="w-4 h-4 text-purple-500" />
                    <span>1. ธีมสี &amp; รูปภาพแบนเนอร์ (Profile Banner)</span>
                  </label>

                  {/* Mode Selector Tabs */}
                  <div className="grid grid-cols-3 rounded-xl bg-muted p-1 border border-border text-xs font-semibold w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => setBannerMode('preset')}
                      className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer text-center ${
                        bannerMode === 'preset'
                          ? 'bg-card text-foreground shadow-xs font-bold'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      ธีมสำเร็จรูป
                    </button>
                    <button
                      type="button"
                      onClick={() => setBannerMode('custom_gradient')}
                      className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer text-center ${
                        bannerMode === 'custom_gradient'
                          ? 'bg-card text-foreground shadow-xs font-bold'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      ไล่เฉดสีเอง
                    </button>
                    <button
                      type="button"
                      onClick={() => setBannerMode('custom_image')}
                      className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer text-center ${
                        bannerMode === 'custom_image'
                          ? 'bg-card text-foreground shadow-xs font-bold'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      อัปโหลดรูปภาพ
                    </button>
                  </div>
                </div>

                {/* Banner Presets Grid */}
                {bannerMode === 'preset' && (
                  <div className="space-y-3 animate-in fade-in duration-200">
                    {/* Category Filter Pills */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                      {[
                        { id: 'all', label: 'ทั้งหมด' },
                        { id: 'pastel', label: '🌸 พาสเทล (Pastel)' },
                        { id: 'solid', label: '⚪ สีเรียบคลีน (Solid Clean)' },
                        { id: 'vibrant', label: '🌌 สดใสไล่เฉด (Luminous)' },
                        { id: 'dark', label: '🔮 โมเดิร์นหรูหรา (Modern Luxe)' },
                      ].map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setBannerCategoryFilter(cat.id as any)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 border ${
                            bannerCategoryFilter === cat.id
                              ? 'bg-purple-600 text-white border-purple-500 shadow-xs'
                              : 'bg-muted/60 text-muted-foreground border-border hover:text-foreground'
                          }`}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                      {BANNER_THEMES.filter(
                        (t) => bannerCategoryFilter === 'all' || t.category === bannerCategoryFilter
                      ).map((theme) => {
                        const isSelected = bannerTheme === theme.id;
                        return (
                          <button
                            key={theme.id}
                            type="button"
                            onClick={() => setBannerTheme(theme.id)}
                            className={`relative p-3 rounded-2xl border text-left flex flex-col justify-between h-20 transition-all cursor-pointer overflow-hidden shadow-xs ${
                              isSelected
                                ? 'border-purple-500 ring-2 ring-purple-500/50 scale-[1.02]'
                                : 'border-border/80 hover:border-foreground/40 hover:scale-[1.01]'
                            }`}
                            style={{ background: theme.gradient }}
                          >
                            {/* Scrim overlay for crisp text shadow & contrast */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-black/20 pointer-events-none rounded-2xl" />

                            <div className="flex items-center justify-between w-full relative z-10">
                              <span
                                className="text-[11.5px] font-extrabold text-white tracking-wide truncate"
                                style={{
                                  textShadow:
                                    '0 1px 3px rgba(0, 0, 0, 0.95), 0 2px 6px rgba(0, 0, 0, 0.8), 0 0 12px rgba(0, 0, 0, 0.5)',
                                }}
                              >
                                {theme.name}
                              </span>
                              {isSelected && (
                                <div className="w-4 h-4 rounded-full bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-xs ring-1 ring-white/50">
                                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                                </div>
                              )}
                            </div>
                            <span
                              className="text-[10px] font-semibold text-white/95 truncate relative z-10"
                              style={{
                                textShadow:
                                  '0 1px 2px rgba(0, 0, 0, 0.95), 0 2px 4px rgba(0, 0, 0, 0.8)',
                              }}
                            >
                              {theme.subtitle}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Custom Gradient Builder with Interactive Sliders */}
                {bannerMode === 'custom_gradient' && (
                  <div className="p-4 sm:p-5 rounded-3xl bg-muted/30 border border-border space-y-5 animate-in fade-in duration-200">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
                      <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                        <Sliders className="w-4 h-4 text-purple-500" />
                        <span>ปรับแต่งการไล่เฉดสีด้วยสไลเดอร์ (Interactive Gradient Studio)</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        เลื่อนปรับระดับเฉดสี ความสว่าง และทิศทางได้ตามใจชอบ
                      </span>
                    </div>

                    {/* Quick Mood Chips */}
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-semibold text-muted-foreground block">
                        ✨ โทนสีแนะนำแบบแตะครั้งเดียว (Quick Tone Presets):
                      </span>
                      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                        {[
                          {
                            label: '🌸 พาสเทลหวาน',
                            apply: () => {
                              updateColor1(330, 80, 82);
                              updateColor2(210, 85, 85);
                            },
                          },
                          {
                            label: '🌸 นมชมพูซากุระ',
                            apply: () => {
                              updateColor1(340, 85, 88);
                              updateColor2(280, 80, 85);
                            },
                          },
                          {
                            label: '🌿 มินต์ & ท้องฟ้า',
                            apply: () => {
                              updateColor1(160, 75, 80);
                              updateColor2(195, 85, 82);
                            },
                          },
                          {
                            label: '🌅 อาทิตย์อัสดง',
                            apply: () => {
                              updateColor1(20, 90, 60);
                              updateColor2(340, 85, 55);
                            },
                          },
                          {
                            label: '🌌 ไซเบอร์นีออน',
                            apply: () => {
                              updateColor1(185, 95, 50);
                              updateColor2(290, 90, 55);
                            },
                          },
                          {
                            label: '🌑 มิดไนท์ดาร์ก',
                            apply: () => {
                              updateColor1(260, 45, 18);
                              updateColor2(220, 50, 14);
                            },
                          },
                          {
                            label: '⚪ มินิมอลสเลท',
                            apply: () => {
                              updateColor1(215, 20, 25);
                              updateColor2(220, 25, 15);
                            },
                          },
                        ].map((m, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={m.apply}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-card hover:bg-muted border border-border text-foreground transition-all cursor-pointer shrink-0 shadow-2xs hover:scale-105"
                          >
                            {m.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Dual Color Sliders Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Color 1: Start Color */}
                      <div className="p-3.5 rounded-2xl bg-card border border-border space-y-3 shadow-xs">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-5 h-5 rounded-lg border border-border shadow-xs shrink-0"
                              style={{ backgroundColor: customColor1 }}
                            />
                            <span className="text-xs font-bold text-foreground">
                              สีเริ่มต้น (Start Color)
                            </span>
                          </div>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-muted text-muted-foreground font-semibold">
                            {c1Light >= 65 ? '🌸 พาสเทล' : c1Light <= 35 ? '🌑 ดาร์ก' : '✨ สดใส'}
                          </span>
                        </div>

                        {/* Hue Slider */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                            <span>เฉดสี (Hue)</span>
                            <span className="font-mono">{c1Hue}°</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="360"
                            value={c1Hue}
                            onChange={(e) => updateColor1(Number(e.target.value), c1Sat, c1Light)}
                            className="w-full h-3 rounded-lg appearance-none cursor-pointer outline-hidden accent-white"
                            style={{
                              background:
                                'linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)',
                            }}
                          />
                        </div>

                        {/* Lightness / Tone Slider */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                            <span>ความสว่าง (Pastel ↔ Dark)</span>
                            <span className="font-mono">{c1Light}%</span>
                          </div>
                          <input
                            type="range"
                            min="10"
                            max="90"
                            value={c1Light}
                            onChange={(e) => updateColor1(c1Hue, c1Sat, Number(e.target.value))}
                            className="w-full h-3 rounded-lg appearance-none cursor-pointer outline-hidden accent-white"
                            style={{
                              background: `linear-gradient(to right, hsl(${c1Hue}, ${c1Sat}%, 15%), hsl(${c1Hue}, ${c1Sat}%, 50%), hsl(${c1Hue}, ${c1Sat}%, 85%))`,
                            }}
                          />
                        </div>

                        {/* Saturation Slider */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                            <span>ความสดของสี (Vibrancy)</span>
                            <span className="font-mono">{c1Sat}%</span>
                          </div>
                          <input
                            type="range"
                            min="10"
                            max="100"
                            value={c1Sat}
                            onChange={(e) => updateColor1(c1Hue, Number(e.target.value), c1Light)}
                            className="w-full h-3 rounded-lg appearance-none cursor-pointer outline-hidden accent-white"
                            style={{
                              background: `linear-gradient(to right, hsl(${c1Hue}, 10%, ${c1Light}%), hsl(${c1Hue}, 100%, ${c1Light}%))`,
                            }}
                          />
                        </div>
                      </div>

                      {/* Color 2: End Color */}
                      <div className="p-3.5 rounded-2xl bg-card border border-border space-y-3 shadow-xs">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-5 h-5 rounded-lg border border-border shadow-xs shrink-0"
                              style={{ backgroundColor: customColor2 }}
                            />
                            <span className="text-xs font-bold text-foreground">
                              สีปลายทาง (End Color)
                            </span>
                          </div>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-muted text-muted-foreground font-semibold">
                            {c2Light >= 65 ? '🌸 พาสเทล' : c2Light <= 35 ? '🌑 ดาร์ก' : '✨ สดใส'}
                          </span>
                        </div>

                        {/* Hue Slider */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                            <span>เฉดสี (Hue)</span>
                            <span className="font-mono">{c2Hue}°</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="360"
                            value={c2Hue}
                            onChange={(e) => updateColor2(Number(e.target.value), c2Sat, c2Light)}
                            className="w-full h-3 rounded-lg appearance-none cursor-pointer outline-hidden accent-white"
                            style={{
                              background:
                                'linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)',
                            }}
                          />
                        </div>

                        {/* Lightness / Tone Slider */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                            <span>ความสว่าง (Pastel ↔ Dark)</span>
                            <span className="font-mono">{c2Light}%</span>
                          </div>
                          <input
                            type="range"
                            min="10"
                            max="90"
                            value={c2Light}
                            onChange={(e) => updateColor2(c2Hue, c2Sat, Number(e.target.value))}
                            className="w-full h-3 rounded-lg appearance-none cursor-pointer outline-hidden accent-white"
                            style={{
                              background: `linear-gradient(to right, hsl(${c2Hue}, ${c2Sat}%, 15%), hsl(${c2Hue}, ${c2Sat}%, 50%), hsl(${c2Hue}, ${c2Sat}%, 85%))`,
                            }}
                          />
                        </div>

                        {/* Saturation Slider */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                            <span>ความสดของสี (Vibrancy)</span>
                            <span className="font-mono">{c2Sat}%</span>
                          </div>
                          <input
                            type="range"
                            min="10"
                            max="100"
                            value={c2Sat}
                            onChange={(e) => updateColor2(c2Hue, Number(e.target.value), c2Light)}
                            className="w-full h-3 rounded-lg appearance-none cursor-pointer outline-hidden accent-white"
                            style={{
                              background: `linear-gradient(to right, hsl(${c2Hue}, 10%, ${c2Light}%), hsl(${c2Hue}, 100%, ${c2Light}%))`,
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Gradient Direction / Angle */}
                    <div className="p-3.5 rounded-2xl bg-card border border-border space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-foreground">
                          ทิศทางการไล่เฉดสี (Gradient Angle)
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-muted text-muted-foreground font-semibold">
                          {gradientAngle}°
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        {[
                          { label: '↗ ทแยงขวาบน (45°)', val: 45 },
                          { label: '→ แนวนอน (90°)', val: 90 },
                          { label: '↘ ทแยงขวาล่าง (135°)', val: 135 },
                          { label: '↓ แนวตั้ง (180°)', val: 180 },
                          { label: '← แนวนอนกลับด้าน (270°)', val: 270 },
                        ].map((ang) => (
                          <button
                            key={ang.val}
                            type="button"
                            onClick={() => setGradientAngle(ang.val)}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all cursor-pointer border ${
                              gradientAngle === ang.val
                                ? 'bg-purple-600 text-white border-purple-500 shadow-2xs font-bold'
                                : 'bg-muted/50 text-muted-foreground border-border hover:text-foreground'
                            }`}
                          >
                            {ang.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Live Preview Bar */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground">
                        <span>ตัวอย่างแถบเฉดสี (Live Color Bar):</span>
                        <span className="font-mono text-[10px]">{customColor1} → {customColor2}</span>
                      </div>
                      <div
                        className="h-12 rounded-2xl border border-border shadow-inner transition-all duration-200"
                        style={{ background: `linear-gradient(${gradientAngle}deg, ${customColor1} 0%, ${customColor2} 100%)` }}
                      />
                    </div>
                  </div>
                )}

                {/* Custom Image Upload Mode */}
                {bannerMode === 'custom_image' && (
                  <div className="p-4 sm:p-5 rounded-3xl bg-muted/30 border border-border space-y-4 animate-in fade-in duration-200">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
                      <div className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                        <UploadCloud className="w-4 h-4 text-purple-500" />
                        <span>อัปโหลดรูปภาพแบนเนอร์ &amp; ปรับแต่งตำแหน่ง (Image Studio)</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        รองรับไฟล์ JPG, PNG, WebP (บีบอัดอัตโนมัติพร้อมรักษาคุณภาพสูง)
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                      <button
                        type="button"
                        onClick={() => bannerFileInputRef.current?.click()}
                        disabled={isUploadingBanner}
                        className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-all"
                      >
                        {isUploadingBanner ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <ImageIcon className="w-4 h-4" />
                        )}
                        <span>{isUploadingBanner ? 'กำลังประมวลผลรูป...' : 'เลือกรูปภาพแบนเนอร์'}</span>
                      </button>

                      {bannerUrl && (
                        <button
                          type="button"
                          onClick={() => {
                            setBannerUrl('');
                            setBannerMode('preset');
                          }}
                          className="px-3 py-2.5 rounded-xl border border-rose-500/30 hover:bg-rose-500/10 text-rose-500 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>ลบรูปแบนเนอร์</span>
                        </button>
                      )}

                      <input
                        ref={bannerFileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleBannerFileChange}
                        className="hidden"
                      />
                    </div>

                    {bannerUrl && (
                      <div className="space-y-4 pt-2 border-t border-border/60">
                        {/* Vertical Position Slider & Presets */}
                        <div className="p-3.5 rounded-2xl bg-card border border-border space-y-3 shadow-xs">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <MoveVertical className="w-4 h-4 text-purple-500" />
                              <span className="text-xs font-bold text-foreground">
                                ตำแหน่งภาพแนวตั้ง (Vertical Position Y)
                              </span>
                            </div>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-muted text-foreground font-bold">
                              {bannerPosY}%
                            </span>
                          </div>

                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={bannerPosY}
                            onChange={(e) => setBannerPosY(Number(e.target.value))}
                            className="w-full h-3 rounded-lg appearance-none cursor-pointer outline-hidden accent-purple-600 bg-muted"
                          />

                          <div className="flex items-center gap-2">
                            {[
                              { label: '🔝 บนสุด (0%)', val: 0 },
                              { label: '🎯 กึ่งกลาง (50%)', val: 50 },
                              { label: '🔻 ล่างสุด (100%)', val: 100 },
                            ].map((preset) => (
                              <button
                                key={preset.val}
                                type="button"
                                onClick={() => setBannerPosY(preset.val)}
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all cursor-pointer border ${
                                  bannerPosY === preset.val
                                    ? 'bg-purple-600 text-white border-purple-500 shadow-2xs font-bold'
                                    : 'bg-muted/50 text-muted-foreground border-border hover:text-foreground'
                                }`}
                              >
                                {preset.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Display Mode Selection (Full Cover vs Classic Header) */}
                        <div className="p-3.5 rounded-2xl bg-card border border-border space-y-2 shadow-xs">
                          <span className="text-xs font-bold text-foreground block">
                            รูปแบบการจัดวาง (Layout Display Mode):
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => setBannerFullCard(true)}
                              className={`p-2.5 rounded-xl border flex items-center gap-2.5 transition-all cursor-pointer text-left ${
                                bannerFullCard
                                  ? 'border-purple-500 ring-2 ring-purple-500/40 bg-purple-500/10 font-bold'
                                  : 'border-border bg-muted/20 hover:bg-muted/40'
                              }`}
                            >
                              <Layers className="w-4 h-4 text-purple-500 shrink-0" />
                              <div className="min-w-0 flex-1">
                                <div className="text-xs font-bold text-foreground">
                                  เต็มการ์ดกลาสมอร์ฟิซึม (Full Immersive)
                                </div>
                                <div className="text-[10px] text-muted-foreground">
                                  ภาพเต็มแผ่นหลัง พร้อมแผงกระจกฝ้า Glassmorphism
                                </div>
                              </div>
                            </button>

                            <button
                              type="button"
                              onClick={() => setBannerFullCard(false)}
                              className={`p-2.5 rounded-xl border flex items-center gap-2.5 transition-all cursor-pointer text-left ${
                                !bannerFullCard
                                  ? 'border-purple-500 ring-2 ring-purple-500/40 bg-purple-500/10 font-bold'
                                  : 'border-border bg-muted/20 hover:bg-muted/40'
                              }`}
                            >
                              <ImageIcon className="w-4 h-4 text-amber-500 shrink-0" />
                              <div className="min-w-0 flex-1">
                                <div className="text-xs font-bold text-foreground">
                                  แบนเนอร์หัวการ์ด (Classic Header)
                                </div>
                                <div className="text-[10px] text-muted-foreground">
                                  แถบภาพแนวนอนด้านบน และรายละเอียดด้านล่าง
                                </div>
                              </div>
                            </button>
                          </div>
                        </div>

                        {/* Interactive Dragging Tip */}
                        <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-700 dark:text-purple-300 flex items-center gap-2">
                          <Hand className="w-4 h-4 shrink-0 animate-bounce" />
                          <span>
                            <strong>เคล็ดลับ:</strong> คุณสามารถคลิกหรือแตะค้างที่รูปแบนเนอร์ตัวอย่างด้านบน แล้วลากขึ้น-ลง เพื่อเลื่อนปรับตำแหน่งภาพได้ทันที!
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Pattern Overlay Selector */}
                <div className="flex items-center gap-2 overflow-x-auto pt-1 pb-1">
                  <span className="text-[11px] font-semibold text-muted-foreground shrink-0">
                    ลวดลายพื้นหลัง (Pattern):
                  </span>
                  {[
                    { id: 'stars', label: 'ดวงดาว (Stars)', icon: Sparkle },
                    { id: 'grid', label: 'ตาราง (Grid)', icon: Grid },
                    { id: 'dots', label: 'จุดประ (Dots)', icon: CircleDot },
                    { id: 'none', label: 'เรียบเนียน (None)', icon: Layers },
                  ].map((pat) => (
                    <button
                      key={pat.id}
                      type="button"
                      onClick={() => setBannerPattern(pat.id as any)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border flex items-center gap-1 transition-all cursor-pointer shrink-0 ${
                        bannerPattern === pat.id
                          ? 'bg-foreground text-background border-foreground font-bold shadow-xs'
                          : 'bg-card text-muted-foreground border-border hover:text-foreground'
                      }`}
                    >
                      <pat.icon className="w-3 h-3" />
                      <span>{pat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Section 2: Avatar Background Colors & Aura */}
              <div className="space-y-4 border-t border-border/80 pt-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="text-xs font-bold text-foreground flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>2. สีพื้นหลัง &amp; ออร่าเรืองแสง Avatar (Avatar Aura)</span>
                  </label>

                  {/* Mode Selector Tabs */}
                  <div className="grid grid-cols-3 rounded-xl bg-muted p-1 border border-border text-xs font-semibold w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => setAvatarMode('preset')}
                      className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer text-center ${
                        avatarMode === 'preset'
                          ? 'bg-card text-foreground shadow-xs font-bold'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      เฉดสีสำเร็จรูป
                    </button>
                    <button
                      type="button"
                      onClick={() => setAvatarMode('custom_gradient')}
                      className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer text-center ${
                        avatarMode === 'custom_gradient'
                          ? 'bg-card text-foreground shadow-xs font-bold'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      ไล่เฉดสีเอง
                    </button>
                    <button
                      type="button"
                      onClick={() => setAvatarMode('custom')}
                      className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer text-center ${
                        avatarMode === 'custom'
                          ? 'bg-card text-foreground shadow-xs font-bold'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      สีเดี่ยว (Hex)
                    </button>
                  </div>
                </div>

                {/* Mode 1: Presets */}
                {avatarMode === 'preset' && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 animate-in fade-in duration-200">
                    {AVATAR_BG_THEMES.map((theme) => {
                      const isSelected = avatarBgTheme === theme.id;
                      return (
                        <button
                          key={theme.id}
                          type="button"
                          onClick={() => setAvatarBgTheme(theme.id)}
                          className={`p-2.5 rounded-2xl border flex items-center gap-2.5 transition-all cursor-pointer text-left ${
                            isSelected
                              ? 'border-purple-500 ring-2 ring-purple-500/40 bg-purple-500/10 scale-[1.02]'
                              : 'border-border/80 bg-muted/20 hover:border-foreground/30 hover:bg-muted/40'
                          }`}
                        >
                          <div
                            className="w-7 h-7 rounded-xl shadow-xs shrink-0 flex items-center justify-center text-white"
                            style={{ background: theme.gradient, boxShadow: theme.glow }}
                          >
                            {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-[11px] font-bold text-foreground truncate">
                              {theme.name}
                            </div>
                            <div className="text-[9px] text-muted-foreground truncate">
                              {theme.subtitle}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Mode 2: Custom Gradient with Interactive Sliders */}
                {avatarMode === 'custom_gradient' && (
                  <div className="p-4 sm:p-5 rounded-3xl bg-muted/30 border border-border space-y-5 animate-in fade-in duration-200">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
                      <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                        <Sliders className="w-4 h-4 text-purple-500" />
                        <span>ปรับแต่งแสงออร่า Avatar ไล่เฉดสี (Interactive Aura Studio)</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        เลื่อนปรับระดับเฉดสี ความสว่าง และทิศทางการเรืองแสงได้ตามใจชอบ
                      </span>
                    </div>

                    {/* Quick Mood Chips for Aura */}
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-semibold text-muted-foreground block">
                        ✨ โทนสีออร่ายอดนิยม (Quick Aura Presets):
                      </span>
                      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                        {[
                          {
                            label: '🌸 ซากุระพาสเทล',
                            apply: () => {
                              updateAvatarColor1(330, 85, 75);
                              updateAvatarColor2(280, 80, 78);
                            },
                          },
                          {
                            label: '💜 คอสมิกเนบิวลา',
                            apply: () => {
                              updateAvatarColor1(270, 85, 60);
                              updateAvatarColor2(225, 80, 58);
                            },
                          },
                          {
                            label: '🌿 ป่ามรกตเรืองแสง',
                            apply: () => {
                              updateAvatarColor1(155, 80, 48);
                              updateAvatarColor2(185, 90, 45);
                            },
                          },
                          {
                            label: '🌅 อาทิตย์อัสดง',
                            apply: () => {
                              updateAvatarColor1(345, 90, 60);
                              updateAvatarColor2(30, 95, 52);
                            },
                          },
                          {
                            label: '🌌 ไซเบอร์พังก์',
                            apply: () => {
                              updateAvatarColor1(190, 95, 48);
                              updateAvatarColor2(305, 85, 55);
                            },
                          },
                          {
                            label: '💎 คริสตัลโอเชียน',
                            apply: () => {
                              updateAvatarColor1(215, 90, 55);
                              updateAvatarColor2(175, 85, 50);
                            },
                          },
                          {
                            label: '👑 ทองคำเรืองรอง',
                            apply: () => {
                              updateAvatarColor1(38, 95, 52);
                              updateAvatarColor2(48, 95, 48);
                            },
                          },
                          {
                            label: '🌑 มิดไนท์โกลว์',
                            apply: () => {
                              updateAvatarColor1(255, 50, 20);
                              updateAvatarColor2(220, 55, 15);
                            },
                          },
                        ].map((m, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={m.apply}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-card hover:bg-muted border border-border text-foreground transition-all cursor-pointer shrink-0 shadow-2xs hover:scale-105"
                          >
                            {m.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Dual Color Sliders Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Color 1: Start Color */}
                      <div className="p-3.5 rounded-2xl bg-card border border-border space-y-3 shadow-xs">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-5 h-5 rounded-lg border border-border shadow-xs shrink-0"
                              style={{ backgroundColor: customAvatarBg }}
                            />
                            <span className="text-xs font-bold text-foreground">
                              สีออร่าเริ่มต้น (Start Color)
                            </span>
                          </div>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-muted text-muted-foreground font-semibold">
                            {a1Light >= 65 ? '🌸 พาสเทล' : a1Light <= 35 ? '🌑 ดาร์ก' : '✨ สดใส'}
                          </span>
                        </div>

                        {/* Hue Slider */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                            <span>เฉดสี (Hue)</span>
                            <span className="font-mono">{a1Hue}°</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="360"
                            value={a1Hue}
                            onChange={(e) => updateAvatarColor1(Number(e.target.value), a1Sat, a1Light)}
                            className="w-full h-3 rounded-lg appearance-none cursor-pointer outline-hidden accent-white"
                            style={{
                              background:
                                'linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)',
                            }}
                          />
                        </div>

                        {/* Lightness Slider */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                            <span>ความสว่าง (Pastel ↔ Dark)</span>
                            <span className="font-mono">{a1Light}%</span>
                          </div>
                          <input
                            type="range"
                            min="10"
                            max="90"
                            value={a1Light}
                            onChange={(e) => updateAvatarColor1(a1Hue, a1Sat, Number(e.target.value))}
                            className="w-full h-3 rounded-lg appearance-none cursor-pointer outline-hidden accent-white"
                            style={{
                              background: `linear-gradient(to right, hsl(${a1Hue}, ${a1Sat}%, 15%), hsl(${a1Hue}, ${a1Sat}%, 50%), hsl(${a1Hue}, ${a1Sat}%, 85%))`,
                            }}
                          />
                        </div>

                        {/* Saturation Slider */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                            <span>ความสดของสี (Vibrancy)</span>
                            <span className="font-mono">{a1Sat}%</span>
                          </div>
                          <input
                            type="range"
                            min="10"
                            max="100"
                            value={a1Sat}
                            onChange={(e) => updateAvatarColor1(a1Hue, Number(e.target.value), a1Light)}
                            className="w-full h-3 rounded-lg appearance-none cursor-pointer outline-hidden accent-white"
                            style={{
                              background: `linear-gradient(to right, hsl(${a1Hue}, 10%, ${a1Light}%), hsl(${a1Hue}, 100%, ${a1Light}%))`,
                            }}
                          />
                        </div>
                      </div>

                      {/* Color 2: End Color */}
                      <div className="p-3.5 rounded-2xl bg-card border border-border space-y-3 shadow-xs">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-5 h-5 rounded-lg border border-border shadow-xs shrink-0"
                              style={{ backgroundColor: customAvatarBg2 }}
                            />
                            <span className="text-xs font-bold text-foreground">
                              สีออร่าปลายทาง (End Color)
                            </span>
                          </div>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-muted text-muted-foreground font-semibold">
                            {a2Light >= 65 ? '🌸 พาสเทล' : a2Light <= 35 ? '🌑 ดาร์ก' : '✨ สดใส'}
                          </span>
                        </div>

                        {/* Hue Slider */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                            <span>เฉดสี (Hue)</span>
                            <span className="font-mono">{a2Hue}°</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="360"
                            value={a2Hue}
                            onChange={(e) => updateAvatarColor2(Number(e.target.value), a2Sat, a2Light)}
                            className="w-full h-3 rounded-lg appearance-none cursor-pointer outline-hidden accent-white"
                            style={{
                              background:
                                'linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)',
                            }}
                          />
                        </div>

                        {/* Lightness Slider */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                            <span>ความสว่าง (Pastel ↔ Dark)</span>
                            <span className="font-mono">{a2Light}%</span>
                          </div>
                          <input
                            type="range"
                            min="10"
                            max="90"
                            value={a2Light}
                            onChange={(e) => updateAvatarColor2(a2Hue, a2Sat, Number(e.target.value))}
                            className="w-full h-3 rounded-lg appearance-none cursor-pointer outline-hidden accent-white"
                            style={{
                              background: `linear-gradient(to right, hsl(${a2Hue}, ${a2Sat}%, 15%), hsl(${a2Hue}, ${a2Sat}%, 50%), hsl(${a2Hue}, ${a2Sat}%, 85%))`,
                            }}
                          />
                        </div>

                        {/* Saturation Slider */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                            <span>ความสดของสี (Vibrancy)</span>
                            <span className="font-mono">{a2Sat}%</span>
                          </div>
                          <input
                            type="range"
                            min="10"
                            max="100"
                            value={a2Sat}
                            onChange={(e) => updateAvatarColor2(a2Hue, Number(e.target.value), a2Light)}
                            className="w-full h-3 rounded-lg appearance-none cursor-pointer outline-hidden accent-white"
                            style={{
                              background: `linear-gradient(to right, hsl(${a2Hue}, 10%, ${a2Light}%), hsl(${a2Hue}, 100%, ${a2Light}%))`,
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Gradient Angle */}
                    <div className="p-3.5 rounded-2xl bg-card border border-border space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-foreground">
                          ทิศทางการไล่เฉดออร่า (Aura Gradient Angle)
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-muted text-muted-foreground font-semibold">
                          {avatarGradientAngle}°
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        {[
                          { label: '↗ ทแยงขวาบน (45°)', val: 45 },
                          { label: '→ แนวนอน (90°)', val: 90 },
                          { label: '↘ ทแยงขวาล่าง (135°)', val: 135 },
                          { label: '↓ แนวตั้ง (180°)', val: 180 },
                          { label: '← แนวนอนกลับด้าน (270°)', val: 270 },
                        ].map((ang) => (
                          <button
                            key={ang.val}
                            type="button"
                            onClick={() => setAvatarGradientAngle(ang.val)}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all cursor-pointer border ${
                              avatarGradientAngle === ang.val
                                ? 'bg-purple-600 text-white border-purple-500 shadow-2xs font-bold'
                                : 'bg-muted/50 text-muted-foreground border-border hover:text-foreground'
                            }`}
                          >
                            {ang.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Live Glowing Aura Preview */}
                    <div className="p-4 rounded-2xl bg-card border border-border flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-3.5">
                        <div
                          className="w-14 h-14 rounded-2xl border-2 border-white/40 shadow-2xl flex items-center justify-center text-white font-bold text-xl overflow-hidden transition-all duration-300"
                          style={{
                            background: `linear-gradient(${avatarGradientAngle}deg, ${customAvatarBg} 0%, ${customAvatarBg2} 100%)`,
                            boxShadow: `0 0 24px ${customAvatarBg}90, 0 0 45px ${customAvatarBg2}60`,
                          }}
                        >
                          {avatarUrl ? (
                            <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                          ) : (
                            <span>{initial}</span>
                          )}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-foreground">ตัวอย่างแสงออร่ารอบ Avatar</div>
                          <div className="text-[10px] font-mono text-muted-foreground">
                            {customAvatarBg} → {customAvatarBg2}
                          </div>
                        </div>
                      </div>
                      <div className="text-[11px] text-muted-foreground text-center sm:text-right">
                        แสงเรืองรองจะแสดงผลรอบกรอบ Avatar บนแถบโปรไฟล์ของคุณ
                      </div>
                    </div>
                  </div>
                )}

                {/* Mode 3: Single Color Hex */}
                {avatarMode === 'custom' && (
                  <div className="p-4 rounded-2xl bg-muted/30 border border-border space-y-3 animate-in fade-in duration-200">
                    <span className="text-[11px] font-semibold text-muted-foreground block">
                      เลือกสีออร่า Avatar แบบสีเดี่ยว (Solid Color):
                    </span>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={customAvatarBg}
                        onChange={(e) => setCustomAvatarBg(e.target.value)}
                        className="w-12 h-12 rounded-2xl cursor-pointer border border-border p-1 bg-card shadow-md"
                      />
                      <div className="flex-1 space-y-1">
                        <input
                          type="text"
                          value={customAvatarBg}
                          onChange={(e) => setCustomAvatarBg(e.target.value)}
                          placeholder="#8b5cf6"
                          className="w-full max-w-xs px-3.5 py-2 rounded-xl bg-card border border-border text-xs font-mono font-bold text-foreground"
                        />
                        <p className="text-[10px] text-muted-foreground">
                          สีนี้จะสร้างแสงเรืองรอง (Aura Glow) รอบ Avatar ของคุณ
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Section 3: Avatar Image & Presets */}
              <div className="space-y-4 border-t border-border/80 pt-6">
                <label className="text-xs font-bold text-foreground block">
                  3. รูปภาพโปรไฟล์ (Avatar Image)
                </label>

                <div className="flex items-center gap-4">
                  <div className="relative group">
                    <div
                      className="w-20 h-20 rounded-2xl border-2 border-border shadow-md flex items-center justify-center text-white font-bold text-2xl overflow-hidden shrink-0"
                      style={{ background: activeAvatarTheme.gradient, boxShadow: activeAvatarTheme.glow }}
                    >
                      {avatarUrl ? (
                        <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <span>{initial}</span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute inset-0 bg-black/60 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-semibold gap-1 cursor-pointer"
                    >
                      <Camera className="w-4 h-4" />
                      <span>อัปโหลด</span>
                    </button>
                  </div>

                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploadingAvatar}
                        className="px-3.5 py-2 rounded-xl bg-muted hover:bg-muted/80 text-foreground text-xs font-semibold border border-border flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        {isUploadingAvatar ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Camera className="w-3.5 h-3.5" />
                        )}
                        <span>อัปโหลดรูปภาพ</span>
                      </button>

                      {avatarUrl && (
                        <button
                          type="button"
                          onClick={() => {
                            setAvatarUrl('');
                            setSelectedPreset(null);
                          }}
                          className="px-3 py-2 rounded-xl hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 text-xs font-medium transition-all cursor-pointer"
                        >
                          ลบรูป
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      รองรับรูปภาพทุกขนาด (ระบบบีบอัดและปรับสัดส่วนจัตุรัสอัตโนมัติ)
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarFileChange}
                      className="hidden"
                    />
                  </div>
                </div>

                {/* Presets */}
                <div className="space-y-1.5 pt-2">
                  <span className="text-[11px] font-semibold text-muted-foreground block">
                    หรือเลือก Emoji Avatar สำเร็จรูป:
                  </span>
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                    {AVATAR_PRESETS.map((preset) => {
                      const isChosen = selectedPreset === preset.id;
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => handleChoosePreset(preset)}
                          className={`p-2 rounded-xl border text-base flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer hover:scale-105 ${
                            isChosen
                              ? 'border-purple-500 ring-2 ring-purple-500/30 bg-purple-500/10'
                              : `${preset.bg} hover:border-foreground/30`
                          }`}
                          title={preset.label}
                        >
                          <span>{preset.emoji}</span>
                          <span className="text-[9px] font-medium leading-none truncate max-w-full text-muted-foreground">
                            {preset.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Section 4: Personal Information */}
              <div className="space-y-4 border-t border-border/80 pt-6">
                {/* Display Name Input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground flex items-center justify-between">
                    <span>ชื่อที่แสดง (Display Name) *</span>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {displayName.length}/40
                    </span>
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="เช่น Jessada ✦, จอมเวทกาลเวลา"
                    maxLength={40}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-muted/40 border border-border text-xs sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    ชื่อนี้จะแสดงบนจักรวาลที่คุณสร้าง ในคอมเมนต์ และหน้าแชร์ทั้งหมด
                  </p>
                </div>

                {/* Bio */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground flex items-center justify-between">
                    <span>คำแนะนำตัวสั้นๆ (Bio / Tagline)</span>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {bio.length}/150
                    </span>
                  </label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="เช่น ผู้หลงใหลในโลกดาร์กแฟนตาซี ไซไฟ และเรื่องเล่าลี้ลับ 🌙"
                    rows={3}
                    maxLength={150}
                    className="w-full px-3.5 py-2 rounded-xl bg-muted/40 border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/30 resize-none leading-relaxed"
                  />
                </div>
              </div>

              {/* Save Button */}
              <div className="pt-2 flex items-center justify-end gap-3 border-t border-border/80">
                <button
                  type="submit"
                  disabled={isSaving || !displayName.trim()}
                  className="px-6 py-2.5 rounded-xl bg-foreground text-background hover:bg-foreground/90 text-xs sm:text-sm font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 active:scale-98"
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : saveSuccess ? (
                    <Check className="w-4 h-4 text-emerald-300 stroke-[3]" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  <span>{saveSuccess ? 'บันทึกการเปลี่ยนแปลงแล้ว!' : 'บันทึกโปรไฟล์ & ธีม'}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: Single Characters Library (คลังตัวละครเดี่ยว)     */}
        {/* ======================================================== */}
        {activeTab === 'single_characters' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Header & Controls */}
            <div className="p-6 rounded-3xl bg-card border border-border shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
                    <UserIcon className="w-5 h-5 text-emerald-500" />
                    <span>คลังตัวละครเดี่ยวของฉัน</span>
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold">
                      {savedCharacters.length} ตัว
                    </span>
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    บอทตัวละครเดี่ยวสำหรับเล่นแชท &amp; บทสนทนา จัดการ คัดลอก Prompt หรือเปิดใน Single Studio
                  </p>
                </div>

                <Link
                  href="/"
                  className="px-4 py-2 rounded-xl bg-foreground text-background hover:bg-foreground/90 text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>สร้างตัวละครใหม่ใน Studio</span>
                </Link>
              </div>

              {/* Search input */}
              <div className="relative">
                <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={singleCharSearch}
                  onChange={(e) => setSingleCharSearch(e.target.value)}
                  placeholder="ค้นหาตามชื่อตัวละคร ฉายา หรือคำบรรยาย..."
                  className="w-full !pl-10 pr-4 py-2.5 rounded-xl bg-muted/50 border border-border text-xs text-foreground placeholder:text-muted-foreground outline-hidden focus:border-emerald-500/60"
                />
              </div>
            </div>

            {/* Characters Cards List */}
            {filteredSingleChars.length === 0 ? (
              <div className="p-12 text-center rounded-3xl bg-card border border-dashed border-border flex flex-col items-center justify-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground">
                  <UserIcon className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-sm font-bold text-foreground">
                    {singleCharSearch ? 'ไม่พบตัวละครที่ตรงกับการค้นหา' : 'ยังไม่มีตัวละครเดี่ยวที่บันทึกไว้'}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 max-w-sm">
                    เริ่มสร้างสรรค์ตัวละครแรกของคุณด้วยระบบวิเคราะห์อัตลักษณ์และสร้าง Prompt อัจฉริยะ
                  </div>
                </div>
                <Link
                  href="/"
                  className="mt-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>เปิด Single Character Studio</span>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {filteredSingleChars.map((charRec) => {
                  if (!charRec || !charRec.id) return null;
                  const name = charRec.title || charRec.nickname || 'ตัวละครไม่มีชื่อ';
                  const flagKey = (charRec.flag_type || 'none') as keyof typeof CHARACTER_FLAGS;
                  const flag = CHARACTER_FLAGS[flagKey] || CHARACTER_FLAGS.none;
                  const avatar = charRec.image_url || (charRec.character_data as any)?.avatarUrl || (charRec.character_data as any)?.imageUrl;
                  const initialChar = (name || 'U').charAt(0).toUpperCase();

                  return (
                    <div
                      key={charRec.id}
                      className="p-5 rounded-3xl bg-card border border-border hover:border-emerald-500/40 shadow-md transition-all flex flex-col justify-between gap-4 group"
                    >
                      <div className="flex items-start gap-3.5">
                        {/* Avatar */}
                        <div className="w-14 h-14 rounded-2xl border border-border bg-muted/60 overflow-hidden shrink-0 flex items-center justify-center shadow-xs">
                          {avatar ? (
                            <img src={avatar} alt={name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-xl flex items-center justify-center">
                              {initialChar}
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center justify-between gap-2">
                            <h3 className="font-bold text-sm sm:text-base text-foreground truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                              {name}
                            </h3>
                            {flag && flag.type !== 'none' && (
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded-full border font-bold shrink-0 ${flag.badgeBg}`}
                              >
                                {flag.emoji} {flag.label}
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {charRec.tagline || charRec.character_data?.coreTraits || (charRec.character_data as any)?.personality_traits?.core_concept || 'ไม่มีคำโปรย'}
                          </p>

                          <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-mono pt-1">
                            <span>
                              {new Date(charRec.updated_at || charRec.created_at).toLocaleDateString('th-TH', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action Toolbar */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-border/60">
                        {/* Secondary Export & Delete buttons */}
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleCopySingleCharPrompt(charRec)}
                            className="px-2.5 py-1.5 rounded-lg border border-border hover:bg-muted text-xs font-semibold text-foreground flex items-center gap-1 transition-all cursor-pointer"
                            title="คัดลอก Prompt ทั้งหมด"
                          >
                            <Copy className="w-3.5 h-3.5 text-purple-500" />
                            <span>Copy</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDownloadSingleCharMd(charRec)}
                            className="px-2 py-1.5 rounded-lg border border-border hover:bg-muted text-xs font-semibold text-foreground flex items-center gap-1 transition-all cursor-pointer"
                            title="ดาวน์โหลด Markdown (.md)"
                          >
                            <FileText className="w-3.5 h-3.5 text-blue-500" />
                            <span>MD</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDownloadSingleCharJson(charRec)}
                            className="px-2 py-1.5 rounded-lg border border-border hover:bg-muted text-xs font-semibold text-foreground flex items-center gap-1 transition-all cursor-pointer"
                            title="ดาวน์โหลด JSON (.json)"
                          >
                            <FileJson className="w-3.5 h-3.5 text-amber-500" />
                            <span>JSON</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteSingleChar(charRec.id, name)}
                            className="w-8 h-8 rounded-lg hover:bg-rose-500/20 text-muted-foreground hover:text-rose-600 dark:hover:text-rose-400 flex items-center justify-center transition-all cursor-pointer"
                            title="ลบตัวละคร"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Primary Open Studio */}
                        <button
                          type="button"
                          onClick={() => handleOpenSingleCharInStudio(charRec)}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 ml-auto"
                        >
                          <span>เปิดใน Studio</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: My Universes & Projects (คลังจักรวาลของฉัน)      */}
        {/* ======================================================== */}
        {activeTab === 'my_universes' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Header & Controls */}
            <div className="p-6 rounded-3xl bg-card border border-border shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
                    <FolderOpen className="w-5 h-5 text-rose-500" />
                    <span>จักรวาลและโครงเรื่องของฉัน</span>
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 font-bold">
                      {myCreatedProjects.length} เรื่อง
                    </span>
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    จัดการ โหลดเข้า Studio แชร์ลิงก์สาธารณะ หรือดาวน์โหลดสำรองข้อมูล
                  </p>
                </div>

                <Link
                  href="/multi"
                  className="px-4 py-2 rounded-xl bg-foreground text-background hover:bg-foreground/90 text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>สร้างจักรวาลใหม่ใน Studio</span>
                </Link>
              </div>

              {/* Search input */}
              <div className="relative">
                <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={projectSearch}
                  onChange={(e) => setProjectSearch(e.target.value)}
                  placeholder="ค้นหาตามชื่อจักรวาลหรือแนวเรื่อง..."
                  className="w-full !pl-10 pr-4 py-2.5 rounded-xl bg-muted/50 border border-border text-xs text-foreground placeholder:text-muted-foreground outline-hidden focus:border-rose-500/60"
                />
              </div>
            </div>

            {/* Universes Cards List */}
            {filteredMyProjects.length === 0 ? (
              <div className="p-12 text-center rounded-3xl bg-card border border-dashed border-border flex flex-col items-center justify-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground">
                  <FolderOpen className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-sm font-bold text-foreground">
                    {projectSearch ? 'ไม่พบจักรวาลที่ตรงกับการค้นหา' : 'ยังไม่มีจักรวาลที่บันทึกไว้'}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 max-w-sm">
                    เริ่มสร้างเรื่องราว โลก และตัวละครหลายตัวพร้อมกันใน Multi-Char Studio
                  </div>
                </div>
                <Link
                  href="/multi"
                  className="mt-2 px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>เปิด Multi-Char Studio</span>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3.5">
                {filteredMyProjects.map((rec) => {
                  if (!rec || !rec.id) return null;
                  const isShared = Boolean(rec.isShared || rec.shareId || (typeof rec.id === 'string' && rec.id.startsWith('uni_')));
                  const shareId = rec.shareId || (typeof rec.id === 'string' && rec.id.startsWith('uni_') ? rec.id : undefined);

                  return (
                    <div
                      key={rec.id}
                      className="p-5 rounded-3xl bg-card border border-border hover:border-border/80 shadow-md transition-all flex flex-col justify-between gap-4"
                    >
                      <div className="space-y-2 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                              <span>{rec.title}</span>
                              {isShared ? (
                                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 font-bold flex items-center gap-1">
                                  <Globe className="w-3 h-3" />
                                  แชร์แล้ว
                                </span>
                              ) : (
                                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground border border-border font-medium flex items-center gap-1">
                                  <Lock className="w-3 h-3" />
                                  ส่วนตัว
                                </span>
                              )}
                            </h3>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {rec.description || 'ไม่มีคำอธิบายแนวเรื่อง'}
                            </p>
                          </div>

                          <span className="text-[10px] text-muted-foreground shrink-0 font-mono">
                            {new Date(rec.updatedAt || rec.createdAt).toLocaleDateString('th-TH', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        </div>

                        {/* Character Badges */}
                        <div className="flex items-center gap-2 flex-wrap text-xs text-muted-foreground pt-1">
                          <span className="px-2.5 py-0.5 rounded-lg bg-muted border border-border font-medium flex items-center gap-1">
                            <Users className="w-3 h-3 text-rose-500" />
                            <span>{rec.mainCharCount} ตัวหลัก</span>
                          </span>
                          {rec.subCharCount > 0 && (
                            <span className="px-2.5 py-0.5 rounded-lg bg-muted border border-border font-medium flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-amber-500" />
                              <span>{rec.subCharCount} ตัวเสริม</span>
                            </span>
                          )}
                          <span className="px-2.5 py-0.5 rounded-lg bg-muted border border-border font-medium">
                            🔀 {rec.routeCount} เส้นทาง
                          </span>
                        </div>
                      </div>

                      {/* Action Toolbar */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-border/60">
                        {/* Secondary Export & Delete buttons */}
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleDownloadMd(rec)}
                            className="px-2.5 py-1.5 rounded-lg border border-border hover:bg-muted text-xs font-semibold text-foreground flex items-center gap-1 transition-all cursor-pointer"
                            title="ดาวน์โหลดเป็น Markdown (.md)"
                          >
                            <FileText className="w-3.5 h-3.5 text-blue-500" />
                            <span>MD</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDownloadJson(rec)}
                            className="px-2.5 py-1.5 rounded-lg border border-border hover:bg-muted text-xs font-semibold text-foreground flex items-center gap-1 transition-all cursor-pointer"
                            title="ดาวน์โหลดเป็น JSON (.json)"
                          >
                            <FileJson className="w-3.5 h-3.5 text-amber-500" />
                            <span>JSON</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteProject(rec.id, rec.title)}
                            className="w-8 h-8 rounded-lg hover:bg-rose-500/20 text-muted-foreground hover:text-rose-600 dark:hover:text-rose-400 flex items-center justify-center transition-all cursor-pointer"
                            title="ลบโปรเจกต์"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Primary Load & Share Actions */}
                        <div className="flex items-center gap-2">
                          {isShared && shareId ? (
                            <>
                              <button
                                type="button"
                                onClick={() => handleCopyShareLink(shareId)}
                                className="px-3 py-1.5 rounded-xl border border-purple-500/30 hover:bg-purple-500/10 text-xs font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1.5 transition-all cursor-pointer"
                              >
                                <Copy className="w-3.5 h-3.5" />
                                <span>คัดลอกลิงก์</span>
                              </button>
                              <Link
                                href={`/universe/share/${shareId}`}
                                className="px-3 py-1.5 rounded-xl border border-border bg-muted/60 hover:bg-muted text-xs font-bold text-foreground flex items-center gap-1.5 transition-all"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                                <span>ดูหน้าแชร์</span>
                              </Link>
                            </>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setShareTargetProject(rec.projectData)}
                              className="px-3 py-1.5 rounded-xl border border-purple-500/40 hover:bg-purple-500/10 text-xs font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1.5 transition-all cursor-pointer"
                            >
                              <Share2 className="w-3.5 h-3.5" />
                              <span>แชร์จักรวาล</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleOpenInStudio(rec)}
                            className="px-4 py-1.5 rounded-xl bg-foreground text-background hover:bg-foreground/90 text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                          >
                            <span>เปิดใน Studio</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: Shared Universes & Commu Hub (ห้องสนทนา & ชุมชน)   */}
        {/* ======================================================== */}
        {activeTab === 'commu_hub' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="p-6 rounded-3xl bg-card border border-border shadow-xl space-y-2">
              <h2 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-indigo-500" />
                <span>จักรวาลที่เปิดแชร์ &amp; ห้องสนทนาชุมชน Commu</span>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 font-bold">
                  {sharedAndCommuProjects.length} ห้อง
                </span>
              </h2>
              <p className="text-xs text-muted-foreground">
                จักรวาลที่มีลิงก์แชร์และเปิดรับความคิดเห็น การแลกเปลี่ยนไอเดีย และการร่วมสร้าง Co-Creation จากนักเขียนท่านอื่น
              </p>
            </div>

            {sharedAndCommuProjects.length === 0 ? (
              <div className="p-12 text-center rounded-3xl bg-card border border-dashed border-border flex flex-col items-center justify-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-sm font-bold text-foreground">ยังไม่มีจักรวาลที่เปิดแชร์หรือเข้าร่วมสนทนา</div>
                  <div className="text-xs text-muted-foreground mt-1 max-w-sm">
                    คุณสามารถกด &quot;แชร์จักรวาล&quot; ในโปรเจกต์ของคุณเพื่อสร้างลิงก์และเปิดห้องสนทนา Commu ได้ทันที
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3.5">
                {sharedAndCommuProjects.map((rec) => {
                  if (!rec || !rec.id) return null;
                  const shareId = rec.shareId || (typeof rec.id === 'string' && rec.id.startsWith('uni_') ? rec.id : undefined);
                  const isCloned = (typeof rec.id === 'string' && rec.id.startsWith('cloned_')) || (rec.title || '').includes('(Cloned)');

                  return (
                    <div
                      key={rec.id}
                      className="p-5 rounded-3xl bg-card border border-border hover:border-border/80 shadow-md transition-all flex flex-col justify-between gap-4"
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                              <span>{rec.title}</span>
                              {isCloned ? (
                                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold">
                                  🤝 ร่วมสร้าง (Co-Created)
                                </span>
                              ) : (
                                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 font-bold">
                                  👑 จักรวาลของฉัน (เจ้าของ)
                                </span>
                              )}
                            </h3>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {rec.description || 'ไม่มีคำอธิบาย'}
                            </p>
                          </div>
                        </div>

                        {/* Interactive Features Strip */}
                        <div className="p-3 rounded-2xl bg-muted/40 border border-border/70 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-3 text-muted-foreground">
                            <span className="flex items-center gap-1 text-rose-500 font-semibold">
                              <span>💖 รีแอคชันชุมชน</span>
                            </span>
                            <span className="flex items-center gap-1 text-indigo-500 font-semibold">
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>ห้องสนทนาพร้อมใช้งาน</span>
                            </span>
                          </div>

                          <span className="text-[11px] font-mono text-muted-foreground">
                            ID: {shareId || rec.id}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between gap-2 pt-3 border-t border-border/60">
                        {shareId && (
                          <button
                            type="button"
                            onClick={() => handleCopyShareLink(shareId)}
                            className="px-3 py-1.5 rounded-xl border border-border hover:bg-muted text-xs font-semibold text-foreground flex items-center gap-1.5 transition-all cursor-pointer"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            <span>คัดลอกลิงก์</span>
                          </button>
                        )}

                        <div className="flex items-center gap-2 ml-auto">
                          {shareId && (
                            <Link
                              href={`/universe/share/${shareId}#discussion`}
                              className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>เข้าสู่ห้องสนทนา Commu</span>
                            </Link>
                          )}
                          <button
                            type="button"
                            onClick={() => handleOpenInStudio(rec)}
                            className="px-3.5 py-1.5 rounded-xl bg-foreground text-background hover:bg-foreground/90 text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                          >
                            <span>เปิดใน Studio</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 4: Account Details & Quota Security                  */}
        {/* ======================================================== */}
        {activeTab === 'account' && (
          <div className="p-6 sm:p-8 rounded-3xl bg-card border border-border shadow-xl space-y-6 animate-in fade-in duration-200">
            <div className="flex items-center gap-3 border-b border-border pb-4">
              <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-foreground">
                  ข้อมูลบัญชี &amp; สิทธิ์การใช้งาน
                </h2>
                <p className="text-xs text-muted-foreground">
                  ตรวจสอบโควต้า AI สถานะแพ็กเกจ และการรักษาความปลอดภัยของบัญชี
                </p>
              </div>
            </div>

            {/* Quota Progress Card */}
            <div className="p-5 rounded-2xl bg-muted/40 border border-border space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-foreground flex items-center gap-1.5">
                  <Coins className="w-4 h-4 text-rose-500" />
                  <span>โควต้าการใช้งาน AI รายวัน (Daily Quota)</span>
                </span>
                <span className="font-mono font-bold text-foreground">
                  {userRole === 'admin' ? 'ไม่จำกัด (Unlimited)' : `${quotaRemaining} / ${quotaMax} ครั้ง`}
                </span>
              </div>

              {userRole !== 'admin' && (
                <div className="w-full h-2.5 rounded-full bg-muted overflow-hidden border border-border">
                  <div
                    className="h-full bg-gradient-to-r from-rose-500 to-purple-600 transition-all duration-500"
                    style={{
                      width: `${Math.min(100, Math.max(0, (quotaRemaining / Math.max(1, quotaMax)) * 100))}%`,
                    }}
                  />
                </div>
              )}

              <p className="text-[11px] text-muted-foreground">
                โควต้า AI จะรีเซ็ตอัตโนมัติทุกเที่ยงคืนเวลาประเทศไทย (UTC+7)
              </p>
            </div>

            {/* Account Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
              <div className="p-4 rounded-2xl bg-muted/30 border border-border space-y-1">
                <span className="text-[11px] text-muted-foreground block">อีเมลบัญชี (Email):</span>
                <span className="font-bold text-foreground font-mono">{user.email}</span>
              </div>

              <div className="p-4 rounded-2xl bg-muted/30 border border-border space-y-1">
                <span className="text-[11px] text-muted-foreground block">User ID (UID):</span>
                <span className="font-mono text-muted-foreground text-[11px] select-all truncate block">
                  {user.id}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-muted/30 border border-border space-y-1">
                <span className="text-[11px] text-muted-foreground block">ระดับสมาชิก (Role):</span>
                <span className="font-bold text-foreground uppercase">{userRole}</span>
              </div>

              <div className="p-4 rounded-2xl bg-muted/30 border border-border space-y-1">
                <span className="text-[11px] text-muted-foreground block">วันที่สร้างบัญชี:</span>
                <span className="font-medium text-foreground">
                  {user.created_at
                    ? new Date(user.created_at).toLocaleDateString('th-TH', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })
                    : '-'}
                </span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="pt-4 border-t border-border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              {userRole === 'free' && (
                <button
                  type="button"
                  onClick={() => setIsUpgradeModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500/20 via-rose-500/20 to-pink-500/20 border border-amber-500/40 hover:border-amber-500 text-foreground text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <Coffee className="w-4 h-4 text-amber-500" />
                  <span>เลี้ยงกาแฟ 29.- / ปลดล็อคความสามารถ</span>
                </button>
              )}

              <div className="flex items-center gap-2 ml-auto">
                <button
                  type="button"
                  onClick={() => openAuthModal('reset')}
                  className="px-3.5 py-2.5 rounded-xl border border-border hover:bg-muted text-xs font-semibold text-foreground flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <KeyRound className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>เปลี่ยนรหัสผ่าน</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    signOut();
                    router.push('/');
                  }}
                  className="px-3.5 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>ออกจากระบบ</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Share Modal Triggered from Profile */}
      {shareTargetProject && (
        <UniverseShareModal
          isOpen={!!shareTargetProject}
          onClose={() => {
            setShareTargetProject(null);
            refreshProjects();
          }}
          project={shareTargetProject}
          onShowToast={showToast}
        />
      )}

      <AuthModal />
      <UpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
      />
    </div>
  );
}
