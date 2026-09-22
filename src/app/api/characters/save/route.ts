import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { uploadCharacterPayloadToR2, uploadSharePayloadToR2, deleteCharacterPayloadFromR2 } from '@/lib/r2';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://grcpgzmqrzfdhethqgsa.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_PDYNR2FQUditnuDLGYZAdQ_AadTBRft';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      id,
      character,
      title,
      nickname,
      tagline,
      flag_type,
      image_url,
      gallery_urls,
      share_permission = 'read-only',
      is_shared = false,
      share_id,
      user_id = 'guest',
    } = body;

    if (!id || !character) {
      return NextResponse.json({ error: 'Missing character ID or payload' }, { status: 400 });
    }

    // 1. Upload Full Character JSON to Cloudflare R2 ($0 Bandwidth Egress)
    let r2Url = '';
    try {
      r2Url = await uploadCharacterPayloadToR2(id, character);
    } catch (r2Err) {
      console.warn('R2 Character upload note:', r2Err);
    }

    // 2. If shared, also upload Public Share Payload to R2 for instant edge CDN serving
    let finalShareId = share_id;
    if (is_shared && !finalShareId) {
      const randomBuffer = new Uint8Array(4);
      crypto.getRandomValues(randomBuffer);
      const randomHex = Array.from(randomBuffer, (byte) => byte.toString(16).padStart(2, '0')).join('');
      finalShareId = `sh_${Date.now().toString(36)}_${randomHex}`;
    }

    if (is_shared && finalShareId) {
      try {
        const sharePayload = {
          success: true,
          shareId: finalShareId,
          permission: share_permission,
          character,
          title: title || character.fullName || character.nickname || 'ตัวละครที่แชร์',
          nickname: nickname || character.nickname,
          imageUrl: image_url || character.imageUrl || '',
          createdAt: new Date().toISOString(),
        };
        await uploadSharePayloadToR2(finalShareId, sharePayload);
      } catch (r2ShareErr) {
        console.warn('R2 Share payload upload note:', r2ShareErr);
      }
    }

    // 3. Upsert Metadata Record to Supabase (Lightweight metadata row)
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const charTitle = title || character.fullName || character.nickname || 'ตัวละคร';
    const charNickname = nickname || character.nickname || character.fullName || 'ตัวละคร';
    const charTagline = tagline || character.punchline || character.shortIntro || character.occupation || '';
    const charFlag = flag_type || character.flagType || 'none';

    const dbRecord: any = {
      id,
      user_id,
      title: charTitle,
      nickname: charNickname,
      tagline: charTagline,
      flag_type: charFlag,
      image_url: image_url || '',
      gallery_urls: gallery_urls || (image_url ? [image_url] : []),
      share_id: finalShareId || null,
      share_permission: share_permission,
      is_shared: !!is_shared,
      updated_at: new Date().toISOString(),
    };

    if (user_id && user_id !== 'guest') {
      const { error: dbError } = await supabase.from('characters').upsert(dbRecord);
      if (dbError) {
        console.warn('Supabase metadata upsert note:', dbError.message);
      }
    }

    const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://sedchar.vercel.app').replace(/\/+$/, '');
    const shareUrl = finalShareId ? `${baseUrl}/?share=${finalShareId}&mode=${share_permission}` : '';

    return NextResponse.json({
      success: true,
      id,
      r2Url,
      shareId: finalShareId,
      shareUrl,
    });
  } catch (err: any) {
    console.error('Save Character API Error:', err);
    return NextResponse.json({ error: err.message || 'Failed to save character' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const characterId = searchParams.get('id');

    if (!characterId) {
      return NextResponse.json({ error: 'Missing character ID' }, { status: 400 });
    }

    // 1. Delete payload from Cloudflare R2
    await deleteCharacterPayloadFromR2(characterId);

    // 2. Delete row from Supabase
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    await supabase.from('characters').delete().eq('id', characterId);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Delete Character API Error:', err);
    return NextResponse.json({ error: err.message || 'Failed to delete character' }, { status: 500 });
  }
}
