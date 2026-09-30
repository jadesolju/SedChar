import { NextRequest, NextResponse } from 'next/server';
import { fetchUniverseInteractionsFromR2, saveUniverseInteractionsToR2, type UniverseInteractionData } from '@/lib/r2';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const VALID_REACTIONS = ['love', 'sparkle', 'sakura', 'chill', 'fire', 'idea'] as const;
type ReactionKey = typeof VALID_REACTIONS[number];

// In-memory cache fallback for fast local reactivity
const memoryFallback = new Map<string, UniverseInteractionData>();

function getOrInitData(shareId: string): UniverseInteractionData {
  if (!memoryFallback.has(shareId)) {
    memoryFallback.set(shareId, {
      reactions: { love: 0, sparkle: 0, sakura: 0, chill: 0, fire: 0, idea: 0 },
      comments: [],
    });
  }
  return memoryFallback.get(shareId)!;
}

// GET /api/universe/share/interaction?shareId=...
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const shareId = searchParams.get('shareId')?.trim();

  if (!shareId) {
    return NextResponse.json({ error: 'Missing shareId' }, { status: 400 });
  }

  try {
    const data = await fetchUniverseInteractionsFromR2(shareId);
    if (data) {
      memoryFallback.set(shareId, data);
      return NextResponse.json({ success: true, data });
    }
    return NextResponse.json({ success: true, data: getOrInitData(shareId) });
  } catch (err: any) {
    console.warn('Fallback to memory interactions for shareId:', shareId, err);
    return NextResponse.json({ success: true, data: getOrInitData(shareId) });
  }
}

// POST /api/universe/share/interaction
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { shareId, action } = body;

    if (!shareId || !action) {
      return NextResponse.json({ error: 'Missing shareId or action' }, { status: 400 });
    }

    // 1. Fetch current data
    let currentData: UniverseInteractionData;
    try {
      currentData = await fetchUniverseInteractionsFromR2(shareId);
    } catch {
      currentData = getOrInitData(shareId);
    }

    if (!currentData.reactions) {
      currentData.reactions = { love: 0, sparkle: 0, sakura: 0, chill: 0, fire: 0, idea: 0 };
    }
    if (!Array.isArray(currentData.comments)) {
      currentData.comments = [];
    }

    // 2. Handle Action
    if (action === 'react') {
      const reactionKey = body.reactionKey as ReactionKey;
      if (!VALID_REACTIONS.includes(reactionKey)) {
        return NextResponse.json({ error: 'Invalid reaction key' }, { status: 400 });
      }

      const delta = typeof body.delta === 'number' ? body.delta : 1;
      currentData.reactions[reactionKey] = Math.max(0, (currentData.reactions[reactionKey] || 0) + delta);
    } else if (action === 'comment') {
      const text = (body.text || '').trim();
      if (!text) {
        return NextResponse.json({ error: 'ข้อความต้องไม่เว้นว่าง' }, { status: 400 });
      }
      if (text.length > 800) {
        return NextResponse.json({ error: 'ข้อความยาวเกินกำหนด (สูงสุด 800 ตัวอักษร)' }, { status: 400 });
      }

      const authorName = (body.authorName || '').trim() || 'นักเดินทางนิรนาม';
      const newComment = {
        id: 'c_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        authorName: authorName.substring(0, 40),
        authorEmail: body.authorEmail || undefined,
        authorRole: body.authorRole || 'guest',
        avatarSeed: body.avatarSeed || authorName,
        avatarColor: body.avatarColor || 'bg-purple-500/20 text-purple-400',
        text,
        createdAt: new Date().toISOString(),
        likes: 0,
        badge: body.badge || undefined,
      };

      // Prepend to top of comments list (up to 150 comments per universe)
      currentData.comments = [newComment, ...currentData.comments].slice(0, 150);
    } else if (action === 'like_comment') {
      const commentId = body.commentId;
      if (!commentId) {
        return NextResponse.json({ error: 'Missing commentId' }, { status: 400 });
      }

      currentData.comments = currentData.comments.map((c) => {
        if (c.id === commentId) {
          return { ...c, likes: (c.likes || 0) + 1 };
        }
        return c;
      });
    } else if (action === 'edit_comment') {
      const commentId = body.commentId;
      const newText = (body.text || '').trim();
      if (!commentId || !newText) {
        return NextResponse.json({ error: 'ข้อความต้องไม่เว้นว่าง' }, { status: 400 });
      }
      if (newText.length > 800) {
        return NextResponse.json({ error: 'ข้อความยาวเกินกำหนด (สูงสุด 800 ตัวอักษร)' }, { status: 400 });
      }

      currentData.comments = currentData.comments.map((c) => {
        if (c.id === commentId) {
          return {
            ...c,
            text: newText,
            updatedAt: new Date().toISOString(),
            isEdited: true,
          };
        }
        return c;
      });
    } else if (action === 'delete_comment') {
      const commentId = body.commentId;
      if (!commentId) {
        return NextResponse.json({ error: 'Missing commentId' }, { status: 400 });
      }

      currentData.comments = currentData.comments.filter((c) => c.id !== commentId);
    } else {
      return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }

    // 3. Save to storage & fallback
    memoryFallback.set(shareId, currentData);
    try {
      await saveUniverseInteractionsToR2(shareId, currentData);
    } catch (err) {
      console.warn('Error persisting interaction to storage, updated in memory:', err);
    }

    return NextResponse.json({
      success: true,
      data: currentData,
    });
  } catch (err: any) {
    console.error('Error handling universe interaction:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
