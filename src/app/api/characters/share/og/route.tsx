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

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const shareId = searchParams.get('id');

    const baseUrl = (
      process.env.NEXT_PUBLIC_APP_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://sedchar.vercel.app')
    ).replace(/\/+$/, '');

    let title = searchParams.get('title') || 'ตัวละคร AI Roleplay';
    let nickname = searchParams.get('nickname') || '';
    let tagline = searchParams.get('tagline') || 'โมเดลและโครงสร้างบทบาทสำหรับ Purrpaw, Rubii และ Khui AI';
    let flagType = searchParams.get('flag') || 'none';
    let imageUrl = searchParams.get('image') || searchParams.get('imageUrl') || searchParams.get('img') || '';

    // If shareId is provided, attempt to fetch from Supabase
    if (shareId) {
      try {
        const supabase = createClient(supabaseUrl, supabaseAnonKey);
        const { data } = await supabase
          .from('characters')
          .select('title, nickname, tagline, image_url, flag_type, character_data')
          .or(`share_id.eq.${shareId},id.eq.${shareId}`)
          .limit(1)
          .single();

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
    const isCustomImage = Boolean(
      imageUrl &&
      (imageUrl.startsWith('http://') || imageUrl.startsWith('https://') || imageUrl.startsWith('data:image/'))
    );
    const finalArtworkUrl = isCustomImage ? imageUrl : `${baseUrl}/shedchar_logo.png`;

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

          {/* Right Column: Character Artwork Layer or Logo Layer */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '440px',
              height: '520px',
              borderRadius: '24px',
              overflow: 'hidden',
              border: '2px solid rgba(255, 255, 255, 0.15)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
              backgroundColor: 'rgba(24, 24, 27, 0.7)',
              marginLeft: '30px',
              padding: isCustomImage ? '0px' : '30px',
            }}
          >
            <img
              src={finalArtworkUrl}
              alt={title}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
              }}
            />
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
