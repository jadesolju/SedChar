'use client';
import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Send,
  Heart,
  Sparkles,
  Coffee,
  Flame,
  Lightbulb,
  Smile,
  User,
  Check,
  Loader2,
  Clock,
  ThumbsUp,
  Pencil,
  Trash2,
  X,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface CommentItem {
  id: string;
  authorName: string;
  authorEmail?: string;
  authorRole?: string;
  avatarSeed?: string;
  avatarColor?: string;
  text: string;
  createdAt: string;
  updatedAt?: string;
  isEdited?: boolean;
  likes: number;
  badge?: string;
}

interface InteractionData {
  reactions: {
    love: number;
    sparkle: number;
    sakura: number;
    chill: number;
    fire: number;
    idea: number;
  };
  comments: CommentItem[];
}

interface FloatingParticle {
  id: number;
  x: number;
  y: number;
  icon: string;
}

interface UniverseDiscussionSectionProps {
  shareId: string;
  projectName?: string;
}

const REACTION_CONFIGS = [
  {
    key: 'love',
    label: 'ใจฟู',
    iconName: 'love',
    emoji: '💖',
    color: 'bg-rose-50/90 hover:bg-rose-100 border-rose-200/90 text-rose-700 dark:bg-rose-950/40 dark:hover:bg-rose-950/60 dark:border-rose-800/60 dark:text-rose-300 shadow-2xs',
    activeColor: 'bg-gradient-to-br from-rose-500 to-pink-600 text-white border-rose-600 shadow-md shadow-rose-500/30 ring-2 ring-rose-400/40',
    iconColor: 'text-rose-500 dark:text-rose-400',
  },
  {
    key: 'sakura',
    label: 'ละมุน',
    iconName: 'sakura',
    emoji: '🌸',
    color: 'bg-pink-50/90 hover:bg-pink-100 border-pink-200/90 text-pink-700 dark:bg-pink-950/40 dark:hover:bg-pink-950/60 dark:border-pink-800/60 dark:text-pink-300 shadow-2xs',
    activeColor: 'bg-gradient-to-br from-pink-500 to-rose-600 text-white border-pink-600 shadow-md shadow-pink-500/30 ring-2 ring-pink-400/40',
    iconColor: 'text-pink-500 dark:text-pink-400',
  },
  {
    key: 'sparkle',
    label: 'ว้าวมาก',
    iconName: 'sparkle',
    emoji: '✨',
    color: 'bg-amber-50/90 hover:bg-amber-100 border-amber-200/90 text-amber-800 dark:bg-amber-950/40 dark:hover:bg-amber-950/60 dark:border-amber-800/60 dark:text-amber-300 shadow-2xs',
    activeColor: 'bg-gradient-to-br from-amber-500 to-orange-500 text-white border-amber-600 shadow-md shadow-amber-500/30 ring-2 ring-amber-400/40',
    iconColor: 'text-amber-500 dark:text-amber-400',
  },
  {
    key: 'chill',
    label: 'ชวนคุย',
    iconName: 'chill',
    emoji: '☕',
    color: 'bg-emerald-50/90 hover:bg-emerald-100 border-emerald-200/90 text-emerald-800 dark:bg-emerald-950/40 dark:hover:bg-emerald-950/60 dark:border-emerald-800/60 dark:text-emerald-300 shadow-2xs',
    activeColor: 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-emerald-600 shadow-md shadow-emerald-500/30 ring-2 ring-emerald-400/40',
    iconColor: 'text-emerald-500 dark:text-emerald-400',
  },
  {
    key: 'fire',
    label: 'สุดยอด',
    iconName: 'fire',
    emoji: '🔥',
    color: 'bg-orange-50/90 hover:bg-orange-100 border-orange-200/90 text-orange-800 dark:bg-orange-950/40 dark:hover:bg-orange-950/60 dark:border-orange-800/60 dark:text-orange-300 shadow-2xs',
    activeColor: 'bg-gradient-to-br from-orange-500 to-red-600 text-white border-orange-600 shadow-md shadow-orange-500/30 ring-2 ring-orange-400/40',
    iconColor: 'text-orange-500 dark:text-orange-400',
  },
  {
    key: 'idea',
    label: 'ได้ไอเดีย',
    iconName: 'idea',
    emoji: '💡',
    color: 'bg-sky-50/90 hover:bg-sky-100 border-sky-200/90 text-sky-800 dark:bg-sky-950/40 dark:hover:bg-sky-950/60 dark:border-sky-800/60 dark:text-sky-300 shadow-2xs',
    activeColor: 'bg-gradient-to-br from-sky-500 to-blue-600 text-white border-sky-600 shadow-md shadow-sky-500/30 ring-2 ring-sky-400/40',
    iconColor: 'text-sky-500 dark:text-sky-400',
  },
] as const;

const QUICK_EMOJIS = ['💖', '🌸', '✨', '🌟', '☕', '🎮', '📖', '🪄', '🔥', '🐱', '🍵', '🌿', '💡', '🫧'];

const AVATAR_COLORS = [
  'bg-pink-500/15 text-pink-500 dark:text-pink-400 border-pink-500/30',
  'bg-purple-500/15 text-purple-500 dark:text-purple-400 border-purple-500/30',
  'bg-indigo-500/15 text-indigo-500 dark:text-indigo-400 border-indigo-500/30',
  'bg-sky-500/15 text-sky-500 dark:text-sky-400 border-sky-500/30',
  'bg-emerald-500/15 text-emerald-500 dark:text-emerald-400 border-emerald-500/30',
  'bg-amber-500/15 text-amber-500 dark:text-amber-400 border-amber-500/30',
  'bg-rose-500/15 text-rose-500 dark:text-rose-400 border-rose-500/30',
];

// Cute Sakura Flower SVG
function CuteSakuraIcon({ className = 'w-4 h-4', isActive = false }: { className?: string; isActive?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 3C11.3 5 9.5 6.8 7.5 7.5C5.5 8.2 3 7.5 3 8.7C3 9.9 4.8 11.2 5.5 13C6.2 14.8 5.5 17.5 6.7 18.2C7.9 18.9 10.2 17.6 12 18.5C13.8 17.6 16.1 18.9 17.3 18.2C18.5 17.5 17.8 14.8 18.5 13C19.2 11.2 21 9.9 21 8.7C21 7.5 18.5 8.2 16.5 7.5C14.5 6.8 12.7 5 12 3Z" opacity={isActive ? 1 : 0.9} />
      <circle cx="12" cy="12" r="2.5" fill={isActive ? '#ffe4e6' : '#fff'} opacity={0.9} />
    </svg>
  );
}

function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSec < 45) return 'เมื่อสักครู่';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)} นาทีที่แล้ว`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} ชั่วโมงที่แล้ว`;
    if (diffSec < 604800) return `${Math.floor(diffSec / 86400)} วันที่แล้ว`;
    return date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' });
  } catch {
    return 'เมื่อไม่นานมานี้';
  }
}

export function UniverseDiscussionSection({ shareId, projectName }: UniverseDiscussionSectionProps) {
  const { user, userRole, openAuthModal } = useAuth();
  const [data, setData] = useState<InteractionData>({
    reactions: { love: 0, sparkle: 0, sakura: 0, chill: 0, fire: 0, idea: 0 },
    comments: [],
  });
  const [userReactions, setUserReactions] = useState<Record<string, boolean>>({});
  const [likedCommentIds, setLikedCommentIds] = useState<Record<string, boolean>>({});
  const [particles, setParticles] = useState<FloatingParticle[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Edit Comment State
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [isEditingSaving, setIsEditingSaving] = useState(false);

  // Load interactions on mount
  useEffect(() => {
    if (!shareId) return;

    // Load local reactions state
    try {
      const storedReactions = localStorage.getItem(`reactions_${shareId}`);
      if (storedReactions) setUserReactions(JSON.parse(storedReactions));
      const storedLikes = localStorage.getItem(`liked_comments_${shareId}`);
      if (storedLikes) setLikedCommentIds(JSON.parse(storedLikes));
    } catch {}

    const fetchData = async () => {
      try {
        const res = await fetch(`/api/universe/share/interaction?shareId=${encodeURIComponent(shareId)}`);
        const result = await res.json();
        if (result.success && result.data) {
          setData({
            reactions: result.data.reactions || { love: 0, sparkle: 0, sakura: 0, chill: 0, fire: 0, idea: 0 },
            comments: Array.isArray(result.data.comments) ? result.data.comments : [],
          });
        }
      } catch (e) {
        console.warn('Error loading interactions:', e);
      }
    };

    fetchData();
  }, [shareId]);

  // Handle reaction click
  const handleReactionClick = async (reactionKey: keyof typeof data.reactions, emoji: string, e: React.MouseEvent) => {
    const isCurrentlyActive = !!userReactions[reactionKey];
    const delta = isCurrentlyActive ? -1 : 1;

    // 1. Particle effect
    const rect = e.currentTarget.getBoundingClientRect();
    const newParticle: FloatingParticle = {
      id: Date.now() + Math.random(),
      x: rect.left + rect.width / 2,
      y: rect.top,
      icon: emoji,
    };
    setParticles((prev) => [...prev, newParticle]);
    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => p.id !== newParticle.id));
    }, 1000);

    // 2. Optimistic UI update
    const updatedReactions = {
      ...data.reactions,
      [reactionKey]: Math.max(0, (data.reactions[reactionKey] || 0) + delta),
    };
    setData((prev) => ({ ...prev, reactions: updatedReactions }));

    const nextUserReactions = { ...userReactions, [reactionKey]: !isCurrentlyActive };
    setUserReactions(nextUserReactions);
    try {
      localStorage.setItem(`reactions_${shareId}`, JSON.stringify(nextUserReactions));
    } catch {}

    // 3. Sync with API
    try {
      await fetch('/api/universe/share/interaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shareId,
          action: 'react',
          reactionKey,
          delta,
        }),
      });
    } catch (err) {
      console.warn('Failed to sync reaction:', err);
    }
  };

  // User display metadata
  const userDisplayName: string = (user?.email ? user.email.split('@')[0] : '') || 'สมาชิก';
  const userRoleBadge =
    userRole === 'admin'
      ? 'Admin 👑'
      : userRole === 'premium'
      ? 'Universe Pro 💎'
      : userRole === 'supporter'
      ? 'Supporter ⭐'
      : 'Member 🌿';

  const colorIdx = Math.abs(
    userDisplayName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  ) % AVATAR_COLORS.length;
  const userColor = AVATAR_COLORS[colorIdx];
  const userInitial = userDisplayName.charAt(0).toUpperCase();

  // Handle Send Comment
  const handleSendComment = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!user) {
      openAuthModal('signin');
      return;
    }

    const trimmed = inputText.trim();
    if (!trimmed || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/universe/share/interaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shareId,
          action: 'comment',
          authorName: userDisplayName,
          authorEmail: user.email || undefined,
          authorRole: userRole,
          badge: userRoleBadge,
          avatarColor: userColor,
          text: trimmed,
        }),
      });

      const result = await res.json();
      if (result.success && result.data) {
        setData(result.data);
        setInputText('');
        setSubmitSuccess(true);
        setTimeout(() => setSubmitSuccess(false), 2000);
      }
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการส่งข้อความ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Start Edit
  const handleStartEdit = (comment: CommentItem) => {
    setEditingCommentId(comment.id);
    setEditingText(comment.text);
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditingText('');
  };

  // Handle Save Edit
  const handleSaveEdit = async (commentId: string) => {
    const trimmed = editingText.trim();
    if (!trimmed || isEditingSaving) return;

    setIsEditingSaving(true);

    // Optimistic UI update
    setData((prev) => ({
      ...prev,
      comments: prev.comments.map((c) =>
        c.id === commentId ? { ...c, text: trimmed, isEdited: true, updatedAt: new Date().toISOString() } : c
      ),
    }));

    try {
      const res = await fetch('/api/universe/share/interaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shareId,
          action: 'edit_comment',
          commentId,
          text: trimmed,
        }),
      });
      const result = await res.json();
      if (result.success && result.data) {
        setData(result.data);
      }
      setEditingCommentId(null);
      setEditingText('');
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการแก้ไขข้อความ');
    } finally {
      setIsEditingSaving(false);
    }
  };

  // Handle Delete Comment
  const handleDeleteComment = async (commentId: string) => {
    const confirmDelete = window.confirm('คุณต้องการลบความคิดเห็นนี้ใช่หรือไม่?');
    if (!confirmDelete) return;

    // Optimistic UI update
    setData((prev) => ({
      ...prev,
      comments: prev.comments.filter((c) => c.id !== commentId),
    }));

    try {
      const res = await fetch('/api/universe/share/interaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shareId,
          action: 'delete_comment',
          commentId,
        }),
      });
      const result = await res.json();
      if (result.success && result.data) {
        setData(result.data);
      }
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการลบข้อความ');
    }
  };

  // Handle Comment Like
  const handleLikeComment = async (commentId: string) => {
    if (likedCommentIds[commentId]) return; // prevent duplicate likes locally

    const nextLiked = { ...likedCommentIds, [commentId]: true };
    setLikedCommentIds(nextLiked);
    try {
      localStorage.setItem(`liked_comments_${shareId}`, JSON.stringify(nextLiked));
    } catch {}

    // Optimistic UI
    setData((prev) => ({
      ...prev,
      comments: prev.comments.map((c) => (c.id === commentId ? { ...c, likes: (c.likes || 0) + 1 } : c)),
    }));

    try {
      await fetch('/api/universe/share/interaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shareId,
          action: 'like_comment',
          commentId,
        }),
      });
    } catch (err) {
      console.warn('Failed to like comment:', err);
    }
  };

  const handleInsertEmoji = (emoji: string) => {
    setInputText((prev) => prev + emoji);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  return (
    <div className="space-y-6 pt-4 border-t border-border/70">
      {/* Floating Particles Container */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute text-2xl animate-ping opacity-90 transition-all duration-700"
            style={{
              left: `${p.x}px`,
              top: `${p.y - 20}px`,
              transform: 'translate(-50%, -50%) scale(1.4)',
            }}
          >
            {p.icon}
          </div>
        ))}
      </div>

      {/* 🌸 Cute Reactions Section */}
      <div className="p-5 sm:p-6 rounded-3xl bg-card border border-border shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-pink-500/10 text-pink-500 border border-pink-500/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">
                รู้สึกอย่างไรกับจักรวาลนี้?
              </h3>
              <p className="text-[11px] text-muted-foreground">
                กดส่งความรู้สึกให้อบอุ่นใจด้วยอีโมจิน่ารัก ๆ ได้เลยนะ
              </p>
            </div>
          </div>
        </div>

        {/* Reaction Pill Buttons */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 pt-1">
          {REACTION_CONFIGS.map((cfg) => {
            const count = data.reactions[cfg.key as keyof typeof data.reactions] || 0;
            const isActive = !!userReactions[cfg.key];

            return (
              <button
                key={cfg.key}
                type="button"
                onClick={(e) => handleReactionClick(cfg.key as keyof typeof data.reactions, cfg.emoji, e)}
                className={`group relative py-2.5 px-3 rounded-2xl border transition-all duration-200 flex flex-col items-center justify-center gap-1 cursor-pointer active:scale-95 ${
                  isActive ? cfg.activeColor : cfg.color
                }`}
                title={cfg.label}
              >
                <div className="flex items-center gap-1.5 text-base sm:text-lg transition-transform group-hover:scale-125">
                  {cfg.iconName === 'sakura' ? (
                    <CuteSakuraIcon
                      isActive={isActive}
                      className={`w-5 h-5 transition-transform group-hover:rotate-12 ${
                        isActive ? 'text-white fill-white' : cfg.iconColor
                      }`}
                    />
                  ) : cfg.iconName === 'love' ? (
                    <Heart
                      className={`w-4 h-4 transition-transform ${
                        isActive ? 'text-white fill-white' : `${cfg.iconColor} fill-current`
                      }`}
                    />
                  ) : cfg.iconName === 'sparkle' ? (
                    <Sparkles
                      className={`w-4 h-4 transition-transform ${
                        isActive ? 'text-white fill-white' : cfg.iconColor
                      }`}
                    />
                  ) : cfg.iconName === 'chill' ? (
                    <Coffee
                      className={`w-4 h-4 transition-transform ${
                        isActive ? 'text-white' : cfg.iconColor
                      }`}
                    />
                  ) : cfg.iconName === 'fire' ? (
                    <Flame
                      className={`w-4 h-4 transition-transform ${
                        isActive ? 'text-white fill-white' : `${cfg.iconColor} fill-current`
                      }`}
                    />
                  ) : (
                    <Lightbulb
                      className={`w-4 h-4 transition-transform ${
                        isActive ? 'text-white fill-white' : cfg.iconColor
                      }`}
                    />
                  )}
                  <span className={`text-xs font-bold leading-none ${isActive ? 'text-white' : 'text-foreground'}`}>
                    {count}
                  </span>
                </div>
                <span
                  className={`text-[10px] font-semibold leading-none ${
                    isActive ? 'text-white' : 'text-foreground/80 group-hover:text-foreground'
                  }`}
                >
                  {cfg.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 💬 Discussion & Comments Section */}
      <div className="p-5 sm:p-7 rounded-3xl bg-card border border-border shadow-xs space-y-6">
        {/* Section Header */}
        <div className="flex items-center justify-between border-b border-border/60 pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500 border border-purple-500/20">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-foreground flex items-center gap-2">
                <span>แลกเปลี่ยนมุมมอง & พูดคุย</span>
                <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-xs font-semibold">
                  {data.comments.length}
                </span>
              </h3>
              <p className="text-[11px] text-muted-foreground">
                ชวนคุย ติชมเนื้อเรื่อง หรือตั้งคำถามเกี่ยวกับ Lore ของจักรวาลนี้
              </p>
            </div>
          </div>
        </div>

        {/* Comment Form or Login Prompt */}
        {!user ? (
          <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 via-pink-500/5 to-transparent border border-purple-500/20 text-center space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-500 border border-purple-500/20 flex items-center justify-center mx-auto text-base">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs sm:text-sm font-bold text-foreground">
                เข้าสู่ระบบเพื่อร่วมพูดคุยและแสดงความคิดเห็น 🌸
              </h4>
              <p className="text-[11px] text-muted-foreground max-w-md mx-auto">
                เข้าสู่ระบบด้วย Google, Discord หรือ Email ใน 1 คลิก เพื่อร่วมแลกเปลี่ยนไอเดียและให้กำลังใจผู้สร้าง
              </p>
            </div>
            <button
              type="button"
              onClick={() => openAuthModal('signin')}
              className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs transition-all inline-flex items-center gap-2 cursor-pointer"
            >
              <User className="w-3.5 h-3.5" />
              <span>เข้าสู่ระบบ / สมัครสมาชิก</span>
            </button>
          </div>
        ) : (
          <form onSubmit={handleSendComment} className="space-y-3">
            {/* Logged in User Bar */}
            <div className="flex items-center gap-2">
              <div
                className={`w-6 h-6 rounded-lg border flex items-center justify-center text-[10px] font-bold shrink-0 ${userColor}`}
              >
                {userInitial}
              </div>
              <span className="text-xs font-bold text-foreground">{userDisplayName}</span>
              <span className="px-1.5 py-0.2 rounded-md bg-muted border border-border text-[9px] font-semibold text-muted-foreground">
                {userRoleBadge}
              </span>
            </div>

            {/* Textarea Box */}
            <div className="relative rounded-2xl bg-muted/30 border border-border/80 focus-within:border-purple-500/60 focus-within:ring-2 focus-within:ring-purple-500/20 transition-all p-3 space-y-2">
              <textarea
                ref={textareaRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                    e.preventDefault();
                    handleSendComment();
                  }
                }}
                placeholder={`พิมพ์ข้อความชวนคุยเกี่ยวกับ "${projectName || 'จักรวาลนี้'}" (Ctrl+Enter เพื่อส่ง)...`}
                rows={3}
                maxLength={800}
                className="w-full bg-transparent text-xs sm:text-sm text-foreground placeholder:text-muted-foreground/70 resize-none focus:outline-none leading-relaxed"
              />

              {/* Bottom Toolbar inside textarea box */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/40">
                {/* Quick Emojis Ribbon */}
                <div className="flex items-center gap-1 overflow-x-auto py-0.5 max-w-full">
                  <span className="text-[10px] text-muted-foreground mr-1 hidden sm:inline">อิโมจิ:</span>
                  {QUICK_EMOJIS.map((em) => (
                    <button
                      key={em}
                      type="button"
                      onClick={() => handleInsertEmoji(em)}
                      className="p-1 rounded-lg hover:bg-muted text-xs hover:scale-125 transition-transform cursor-pointer"
                      title={`ใส่อิโมจิ ${em}`}
                    >
                      {em}
                    </button>
                  ))}
                </div>

                {/* Action Buttons & Counter */}
                <div className="flex items-center gap-2 ml-auto">
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {inputText.length}/800
                  </span>

                  <button
                    type="submit"
                    disabled={!inputText.trim() || isSubmitting}
                    className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : submitSuccess ? (
                      <Check className="w-3.5 h-3.5 text-white" />
                    ) : (
                      <Send className="w-3.5 h-3.5" />
                    )}
                    <span>{submitSuccess ? 'ส่งแล้ว!' : 'ส่งข้อความ'}</span>
                  </button>
                </div>
              </div>
            </div>
          </form>
        )}

        {/* Comments Feed */}
        <div className="space-y-3 pt-2">
          {data.comments.length === 0 ? (
            <div className="p-8 text-center rounded-2xl border border-dashed border-border/80 space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center mx-auto text-lg">
                🌸
              </div>
              <h4 className="text-xs font-bold text-foreground">ยังไม่มีใครเปิดประเด็นคุย</h4>
              <p className="text-[11px] text-muted-foreground max-w-sm mx-auto">
                มาร่วมแสดงความคิดเห็น หรือส่งกำลังใจให้ผู้สร้างคนแรกกันเลย!
              </p>
            </div>
          ) : (
            data.comments.map((comment) => {
              const isLiked = !!likedCommentIds[comment.id];
              const avatarColor = comment.avatarColor || 'bg-purple-500/15 text-purple-400 border-purple-500/30';
              const initial = (comment.authorName || 'U').charAt(0).toUpperCase();

              // Check ownership or admin
              const isAuthor = Boolean(
                user &&
                  ((comment.authorEmail && user.email && comment.authorEmail === user.email) ||
                    comment.authorName === userDisplayName)
              );
              const isAdmin = userRole === 'admin';
              const canModify = isAuthor || isAdmin;
              const isEditingThis = editingCommentId === comment.id;

              return (
                <div
                  key={comment.id}
                  className="p-4 rounded-2xl bg-muted/30 border border-border/70 hover:border-border transition-colors space-y-2.5"
                >
                  {/* Author Header */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      {/* Avatar Circle */}
                      <div
                        className={`w-7 h-7 rounded-xl border flex items-center justify-center text-xs font-bold shrink-0 ${avatarColor}`}
                      >
                        {initial}
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                        <span className="text-xs font-bold text-foreground truncate max-w-[140px] sm:max-w-none">
                          {comment.authorName}
                        </span>

                        {comment.badge && (
                          <span className="px-1.5 py-0.2 rounded-md bg-muted border border-border text-[9px] font-semibold text-muted-foreground shrink-0">
                            {comment.badge}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Timestamp, Modification Controls & Like */}
                    <div className="flex items-center gap-2 sm:gap-2.5 ml-auto shrink-0">
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1 whitespace-nowrap shrink-0">
                        <Clock className="w-3 h-3" />
                        <span>{formatRelativeTime(comment.createdAt)}</span>
                        {comment.isEdited && (
                          <span className="text-[9px] text-muted-foreground/70">(แก้ไขแล้ว)</span>
                        )}
                      </span>

                      {/* Edit / Delete Actions */}
                      {canModify && !isEditingThis && (
                        <div className="flex items-center gap-0.5 border-l border-border/50 pl-1.5 sm:pl-2">
                          <button
                            type="button"
                            onClick={() => handleStartEdit(comment)}
                            className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                            title="แก้ไขข้อความ"
                          >
                            <Pencil className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteComment(comment.id)}
                            className="p-1 rounded-lg text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                            title="ลบข้อความนี้"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}

                      {/* Like Button */}
                      <button
                        type="button"
                        onClick={() => handleLikeComment(comment.id)}
                        className={`px-2 py-1 rounded-lg border text-[11px] font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                          isLiked
                            ? 'bg-rose-500/15 text-rose-500 border-rose-500/30'
                            : 'bg-card text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 border-border'
                        }`}
                        title="กดถูกใจความคิดเห็นนี้"
                      >
                        <Heart className={`w-3 h-3 ${isLiked ? 'fill-current text-rose-500' : ''}`} />
                        <span>{comment.likes || 0}</span>
                      </button>
                    </div>
                  </div>

                  {/* Comment Body or Inline Edit Mode */}
                  {isEditingThis ? (
                    <div className="space-y-2 pt-1 pl-0 sm:pl-9">
                      <textarea
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        onKeyDown={(e) => {
                          if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                            e.preventDefault();
                            handleSaveEdit(comment.id);
                          }
                        }}
                        rows={2}
                        maxLength={800}
                        className="w-full p-2.5 rounded-xl bg-card border border-purple-500/60 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/20 resize-none leading-relaxed"
                        autoFocus
                      />
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        {/* Quick emojis for edit */}
                        <div className="flex items-center gap-1 overflow-x-auto py-0.5">
                          {QUICK_EMOJIS.slice(0, 6).map((em) => (
                            <button
                              key={em}
                              type="button"
                              onClick={() => setEditingText((prev) => prev + em)}
                              className="p-1 rounded-md hover:bg-muted text-xs cursor-pointer"
                            >
                              {em}
                            </button>
                          ))}
                        </div>

                        <div className="flex items-center gap-1.5 ml-auto">
                          <button
                            type="button"
                            onClick={handleCancelEdit}
                            className="px-2.5 py-1 rounded-lg border border-border text-[11px] font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
                          >
                            ยกเลิก
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveEdit(comment.id)}
                            disabled={!editingText.trim() || isEditingSaving}
                            className="px-3 py-1 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-[11px] font-bold shadow-xs flex items-center gap-1 cursor-pointer disabled:opacity-40"
                          >
                            {isEditingSaving ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Check className="w-3 h-3" />
                            )}
                            <span>บันทึก</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-foreground/90 leading-relaxed whitespace-pre-wrap pl-0 sm:pl-9 break-words">
                      {comment.text}
                    </p>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

