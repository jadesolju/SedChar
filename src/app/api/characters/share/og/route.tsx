import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://grcpgzmqrzfdhethqgsa.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_PDYNR2FQUditnuDLGYZAdQ_AadTBRft';

interface FlagEntry {
  label: string;
  color: string;
  emoji: string;
}

const flagLabels: Record<string, FlagEntry> = {
  green: { label: 'ธงเขียว (ปลอดภัย)', color: '#10b981', emoji: '🟢' },
  yellow: { label: 'ธงเหลือง (เฝ้าระวัง)', color: '#f59e0b', emoji: '🟡' },
  red: { label: 'ธงแดง (อันตราย)', color: '#ef4444', emoji: '🔴' },
  black: { label: 'ธงดำ (วิกฤต/มืดมน)', color: '#71717a', emoji: '⚫' },
  watermelon: { label: 'แตงโม (เขียวนอกแดงใน)', color: '#f43f5e', emoji: '🍉' },
  'reverse-watermelon': { label: 'แตงโมกลับด้าน (แดงนอกเขียวใน)', color: '#10b981', emoji: '🍉' },
};

const defaultFlag: FlagEntry = { label: 'ตัวละครบทบาท', color: '#f43f5e', emoji: '🎭' };

/**
 * Pre-fetches an external image with a strict timeout (1.8s) and converts to Base64 Data URI.
 * Satori / resvg only supports PNG, JPEG, GIF, and SVG formats.
 * If fetching fails, times out, or format is unsupported (e.g. WebP/AVIF), returns null to fall back to the built-in Logo Layer.
 */
async function fetchImageWithTimeout(url: string, timeoutMs = 1800): Promise<string | null> {
  if (!url || typeof url !== 'string') return null;
  
  const lower = url.toLowerCase();
  if (lower.startsWith('data:image/png') || lower.startsWith('data:image/jpeg') || lower.startsWith('data:image/jpg') || lower.startsWith('data:image/svg+xml')) {
    return url;
  }
  if (lower.startsWith('data:image/webp') || lower.startsWith('data:image/avif')) {
    // Satori resvg cannot rasterize WebP data URIs
    return null;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SedCharBot/1.0; +https://sedchar.vercel.app)',
        'Accept': 'image/png,image/jpeg,image/*;q=0.8',
      },
    });

    clearTimeout(timeoutId);

    if (!res.ok) return null;

    const contentType = (res.headers.get('content-type') || '').toLowerCase();
    // Only PNG, JPEG, and SVG are natively supported by Satori / resvg
    const isSupported = contentType.includes('png') || contentType.includes('jpeg') || contentType.includes('jpg') || contentType.includes('gif') || contentType.includes('svg');
    if (!isSupported) {
      console.warn('[OG] Unsupported image format for Satori:', contentType, url);
      return null;
    }

    const arrayBuffer = await res.arrayBuffer();
    if (!arrayBuffer || arrayBuffer.byteLength === 0) return null;

    // Convert to Base64 Data URI so Satori decodes cleanly without network requests
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    const mime = contentType.split(';')[0] || 'image/png';
    return `data:${mime};base64,${base64}`;
  } catch (err: any) {
    console.warn(`[OG] Image fetch error: ${err.message}`);
    return null;
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const shareId = searchParams.get('id');

    let title = searchParams.get('title') || 'ตัวละคร AI Roleplay';
    let nickname = searchParams.get('nickname') || '';
    let tagline = searchParams.get('tagline') || 'โมเดลและโครงสร้างบทบาทสำหรับ Purrpaw, Rubii และ Khui AI';
    let flagType = searchParams.get('flag') || 'none';
    let imageUrl = searchParams.get('image') || searchParams.get('imageUrl') || searchParams.get('img') || '';

    // If shareId is provided, attempt to fetch from Supabase
    if (shareId) {
      try {
        const supabase = createClient(supabaseUrl, supabaseAnonKey);
        let { data } = await supabase
          .from('characters')
          .select('title, nickname, tagline, image_url, flag_type, character_data')
          .or(`share_id.eq.${shareId},id.eq.${shareId}`)
          .limit(1)
          .maybeSingle();

        if (!data) {
          const parts = shareId.split('_');
          if (parts.length >= 3 && parts[0] === 'sh') {
            const baseId = parts[1];
            const res = await supabase
              .from('characters')
              .select('title, nickname, tagline, image_url, flag_type, character_data')
              .ilike('share_id', `sh_${baseId}_%`)
              .limit(1)
              .maybeSingle();
            if (res.data) {
              data = res.data;
            }
          }
        }

        if (data) {
          title = data.title || data.nickname || data.character_data?.fullName || data.character_data?.nickname || title;
          nickname = data.nickname || data.character_data?.nickname || nickname;
          tagline = data.tagline || data.character_data?.shortIntro || tagline;
          if (data.image_url) {
            imageUrl = data.image_url;
          } else if (data.character_data?.imageUrl) {
            imageUrl = data.character_data.imageUrl;
          } else if (data.character_data?.image) {
            imageUrl = data.character_data.image;
          }
          if (data.flag_type || data.character_data?.flagType) {
            flagType = data.flag_type || data.character_data?.flagType || 'none';
          }
        }
      } catch (e) {
        console.warn('OG image fetch character error:', e);
      }
    }

    const flagInfo: FlagEntry = flagLabels[flagType] || defaultFlag;

    // Attempt to load character image with strict 1.8s timeout and format validation
    const loadedImageDataUri = imageUrl ? await fetchImageWithTimeout(imageUrl, 1800) : null;
    const hasValidImage = Boolean(loadedImageDataUri);

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#09090b',
            backgroundImage: 'radial-gradient(circle at 25px 25px, #27272a 2%, transparent 0%), radial-gradient(circle at 75px 75px, #18181b 2%, transparent 0%)',
            backgroundSize: '100px 100px',
            padding: '50px 60px',
            fontFamily: 'sans-serif',
            color: '#fafafa',
          }}
        >
          {/* Left Info Column */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              height: '100%',
              maxWidth: '620px',
              flex: 1,
            }}
          >
            {/* Header / Brand */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(244, 63, 94, 0.15)',
                  border: '1.5px solid rgba(244, 63, 94, 0.4)',
                  color: '#f43f5e',
                  fontSize: '22px',
                }}
              >
                🎭
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '20px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.5px' }}>
                  SedChar.AI
                </span>
                <span style={{ fontSize: '13px', color: '#a1a1aa', fontWeight: 500 }}>
                  Thai Roleplay Character Studio
                </span>
              </div>

              {/* Flag Badge */}
              <div
                style={{
                  marginLeft: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  borderRadius: '20px',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  border: `1.5px solid ${flagInfo.color}60`,
                  fontSize: '13px',
                  fontWeight: 700,
                  color: flagInfo.color,
                }}
              >
                <span>{flagInfo.emoji}</span>
                <span>{flagInfo.label}</span>
              </div>
            </div>

            {/* Character Title & Tagline */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', margin: '20px 0' }}>
              <h1
                style={{
                  fontSize: title.length > 25 ? '38px' : '48px',
                  fontWeight: 900,
                  color: '#ffffff',
                  lineHeight: 1.15,
                  letterSpacing: '-1px',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  margin: 0,
                  textShadow: '0 2px 10px rgba(0,0,0,0.5)',
                }}
              >
                {title}
              </h1>

              {nickname && nickname !== title && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '18px', color: '#f43f5e', fontWeight: 700 }}>
                    ชื่อเล่น: {nickname}
                  </span>
                </div>
              )}

              <p
                style={{
                  fontSize: '18px',
                  color: '#d4d4d8',
                  lineHeight: 1.5,
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  margin: 0,
                  maxWidth: '580px',
                }}
              >
                {tagline}
              </p>
            </div>

            {/* Footer Features */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(244, 63, 94, 0.12)',
                  border: '1px solid rgba(244, 63, 94, 0.3)',
                  color: '#f43f5e',
                  fontSize: '13px',
                  fontWeight: 700,
                }}
              >
                🐾 Purrpaw
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(168, 85, 247, 0.12)',
                  border: '1px solid rgba(168, 85, 247, 0.3)',
                  color: '#c084fc',
                  fontSize: '13px',
                  fontWeight: 700,
                }}
              >
                💎 Rubii AI
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(245, 158, 11, 0.12)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  color: '#fbbf24',
                  fontSize: '13px',
                  fontWeight: 700,
                }}
              >
                💬 Khui AI
              </div>
            </div>
          </div>

          {/* Right Column: Character Artwork Layer OR Brand Logo Fallback Layer */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '440px',
              height: '520px',
              borderRadius: '24px',
              overflow: 'hidden',
              border: hasValidImage
                ? '2px solid rgba(255, 255, 255, 0.15)'
                : '2px solid rgba(244, 63, 94, 0.35)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
              backgroundColor: 'rgba(24, 24, 27, 0.85)',
              marginLeft: '30px',
              position: 'relative',
            }}
          >
            {hasValidImage ? (
              <img
                src={loadedImageDataUri!}
                alt={title}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                }}
              />
            ) : (
              /* High-impact Brand Logo & Mascot Layer (Zero Network Latency, 100% Reliability) */
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100%',
                  height: '100%',
                  padding: '40px 24px',
                  background: 'linear-gradient(145deg, rgba(39, 39, 42, 0.9), rgba(9, 9, 11, 0.95))',
                  textAlign: 'center',
                }}
              >
                {/* Glowing Mask Crest */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '130px',
                    height: '130px',
                    borderRadius: '32px',
                    backgroundColor: 'rgba(244, 63, 94, 0.15)',
                    border: '2px solid rgba(244, 63, 94, 0.5)',
                    boxShadow: '0 0 40px rgba(244, 63, 94, 0.3)',
                    fontSize: '64px',
                    marginBottom: '24px',
                  }}
                >
                  🎭
                </div>

                <div
                  style={{
                    fontSize: '32px',
                    fontWeight: 900,
                    color: '#ffffff',
                    letterSpacing: '-0.5px',
                    marginBottom: '8px',
                  }}
                >
                  SedChar.AI
                </div>

                <div
                  style={{
                    fontSize: '15px',
                    fontWeight: 600,
                    color: '#f43f5e',
                    marginBottom: '20px',
                    letterSpacing: '0.5px',
                  }}
                >
                  THAI ROLEPLAY STUDIO
                </div>

                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 20px',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <span style={{ fontSize: '13px', color: '#d4d4d8', fontWeight: 500 }}>
                    ✨ Model & Persona Design
                  </span>
                  <span style={{ fontSize: '12px', color: '#a1a1aa' }}>
                    Purrpaw • Rubii • Khui AI
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (err: any) {
    console.error('OG Image Generation Error:', err);
    return new Response('Failed to generate image', { status: 500 });
  }
}
