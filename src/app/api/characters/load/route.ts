import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { fetchCharacterPayloadFromR2, uploadCharacterPayloadToR2 } from '@/lib/r2';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://grcpgzmqrzfdhethqgsa.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_PDYNR2FQUditnuDLGYZAdQ_AadTBRft';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const characterId = searchParams.get('id');

  if (!characterId) {
    return NextResponse.json({ error: 'Missing character ID' }, { status: 400 });
  }

  try {
    // 1. Fast Path: Fetch from Cloudflare R2 CDN / S3 Storage (Zero DB Egress)
    const r2Payload = await fetchCharacterPayloadFromR2(characterId);
    if (r2Payload) {
      return NextResponse.json(
        {
          success: true,
          character: r2Payload,
          source: 'r2_cdn',
        },
        {
          headers: {
            'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
          },
        }
      );
    }

    // 2. Fallback Path: Query Supabase Database for legacy records
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { data, error } = await supabase
      .from('characters')
      .select('id, character_data')
      .eq('id', characterId)
      .maybeSingle();

    if (error || !data || !data.character_data) {
      return NextResponse.json({ error: 'Character data not found' }, { status: 404 });
    }

    // 3. Asynchronously upload to Cloudflare R2 so subsequent loads hit R2 CDN with $0 egress
    uploadCharacterPayloadToR2(characterId, data.character_data).catch((e) => {
      console.warn('Background R2 sync error:', e);
    });

    return NextResponse.json(
      {
        success: true,
        character: data.character_data,
        source: 'supabase_fallback',
      },
      {
        headers: {
          'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
        },
      }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
