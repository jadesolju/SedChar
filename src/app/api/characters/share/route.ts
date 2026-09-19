import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://grcpgzmqrzfdhethqgsa.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_PDYNR2FQUditnuDLGYZAdQ_AadTBRft";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const shareId = searchParams.get('id');

  if (!shareId) {
    return NextResponse.json({ error: 'Missing share ID' }, { status: 400 });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    // 1. Direct query
    let { data, error } = await supabase
      .from('characters')
      .select('id, title, nickname, tagline, flag_type, image_url, character_data, share_id, share_permission, is_shared, created_at')
      .or(`share_id.eq.${shareId},id.eq.${shareId}`)
      .limit(1)
      .maybeSingle();

    // 2. Fallback prefix lookup (e.g. sh_<baseId>_<suffix>)
    if (!data) {
      const parts = shareId.split('_');
      if (parts.length >= 3 && parts[0] === 'sh') {
        const baseId = parts[1];
        const res = await supabase
          .from('characters')
          .select('id, title, nickname, tagline, flag_type, image_url, character_data, share_id, share_permission, is_shared, created_at')
          .ilike('share_id', `sh_${baseId}_%`)
          .limit(1)
          .maybeSingle();
        if (res.data) {
          data = res.data;
          error = null;
        }
      }
    }

    if (error || !data) {
      return NextResponse.json({ error: 'Shared character not found or link expired' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      character: data.character_data,
      title: data.title || data.nickname || 'ตัวละครที่แชร์',
      nickname: data.nickname,
      imageUrl: data.image_url,
      permission: data.share_permission || 'read-only',
      createdAt: data.created_at,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, character, permission = 'read-only', title } = body;

    if (!character) {
      return NextResponse.json({ error: 'Missing character payload' }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    let shareId = '';

    if (id) {
      // Check if character already has an existing share_id to keep URLs stable
      const { data: existing } = await supabase
        .from('characters')
        .select('share_id')
        .eq('id', id)
        .limit(1)
        .single();

      if (existing?.share_id) {
        shareId = existing.share_id;
      }
    }

    if (!shareId) {
      // Cryptographically secure RNG (PR #6)
      const randomBuffer = new Uint8Array(4);
      crypto.getRandomValues(randomBuffer);
      const randomHex = Array.from(randomBuffer, (byte) => byte.toString(16).padStart(2, '0')).join('');
      shareId = `sh_${Date.now().toString(36)}_${randomHex}`;
    }

    if (id) {
      await supabase
        .from('characters')
        .update({
          is_shared: true,
          share_id: shareId,
          share_permission: permission,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);
    }

    // Always use public production domain
    const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://sedchar.vercel.app').replace(/\/+$/, '');
    const shareUrl = `${baseUrl}/?share=${shareId}&mode=${permission}`;

    return NextResponse.json({
      success: true,
      shareId,
      shareUrl,
      permission,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to generate share' }, { status: 500 });
  }
}
