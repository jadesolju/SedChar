import { NextRequest, NextResponse } from 'next/server';
import {
  saveUserUniverseToR2,
  fetchUserUniversesFromR2,
  saveUserUniverseIndexToR2,
  fetchUniversePayloadFromR2,
} from '@/lib/r2';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    let userId = searchParams.get('userId');

    if (!userId || userId === 'guest') {
      try {
        const cookieStore = cookies();
        const supabase = createClient(cookieStore);
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.id) userId = user.id;
      } catch {}
    }

    if (!userId || userId === 'guest') {
      return NextResponse.json({ success: true, projects: [] });
    }

    const projects = await fetchUserUniversesFromR2(userId);
    return NextResponse.json({ success: true, projects });
  } catch (error: any) {
    console.error('Fetch user universes error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { record, userId: rawUserId } = body;
    let userId = rawUserId;

    if (!userId || userId === 'guest') {
      try {
        const cookieStore = cookies();
        const supabase = createClient(cookieStore);
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.id) userId = user.id;
      } catch {}
    }

    if (!record || !record.id) {
      return NextResponse.json({ error: 'Missing project record or ID' }, { status: 400 });
    }

    if (userId && userId !== 'guest') {
      // 1. Save full project payload to R2
      await saveUserUniverseToR2(userId, record.id, record);

      // 2. Update user's index in R2
      const existing = await fetchUserUniversesFromR2(userId);
      const filtered = existing.filter((p) => p.id !== record.id);
      const updated = [record, ...filtered];
      await saveUserUniverseIndexToR2(userId, updated);
    }

    return NextResponse.json({ success: true, id: record.id });
  } catch (error: any) {
    console.error('Save user universe error:', error);
    return NextResponse.json({ error: error.message || 'Failed to save' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('id');
    let userId = searchParams.get('userId');

    if (!projectId) {
      return NextResponse.json({ error: 'Missing project ID' }, { status: 400 });
    }

    if (!userId || userId === 'guest') {
      try {
        const cookieStore = cookies();
        const supabase = createClient(cookieStore);
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.id) userId = user.id;
      } catch {}
    }

    if (userId && userId !== 'guest') {
      const existing = await fetchUserUniversesFromR2(userId);
      const updated = existing.filter((p) => p.id !== projectId);
      await saveUserUniverseIndexToR2(userId, updated);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete user universe error:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete' }, { status: 500 });
  }
}
