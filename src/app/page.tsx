import type { Metadata } from 'next';
import { createClient } from '@supabase/supabase-js';
import { decodeCharacterFromShareUrl } from '@/shared/shareUtils';
import { MainWorkspaceClient } from '@/components/workspace/MainWorkspaceClient';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://grcpgzmqrzfdhethqgsa.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_PDYNR2FQUditnuDLGYZAdQ_AadTBRft';

interface PageProps {
  searchParams: {
    share?: string;
    data?: string;
    mode?: string;
  };
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const shareId = searchParams.share;
  const dataParam = searchParams.data;
  // Always use the public production domain so Discord and social bots never get blocked by Vercel deployment login
  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://sedchar.vercel.app').replace(/\/+$/, '');

  // 1. Cloud Share Metadata (via Supabase database)
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
        const charName = data.title || data.nickname || data.character_data?.fullName || data.character_data?.nickname || 'ตัวละคร AI Roleplay';
        const charDesc = data.tagline || data.character_data?.shortIntro || 'ตัวละคร AI Roleplay สร้างจาก SedChar.AI รองรับ Purrpaw, Rubii และ Khui AI';
        // Note: Do NOT append raw base64 data URIs to query string to prevent HTTP 414 URI Too Long.
        // The API route /api/characters/share/og?id=... already queries Supabase internally.
        const ogImageUrl = `${baseUrl}/api/characters/share/og?id=${encodeURIComponent(shareId)}`;
        const shareUrl = `${baseUrl}/?share=${encodeURIComponent(shareId)}${searchParams.mode ? `&mode=${searchParams.mode}` : ''}`;

        return {
          title: `${charName} | SedChar.AI`,
          description: charDesc,
          openGraph: {
            title: `${charName} — ตัวละคร SedChar.AI`,
            description: charDesc,
            url: shareUrl,
            siteName: 'SedChar.AI',
            images: [
              {
                url: ogImageUrl,
                width: 1200,
                height: 630,
                alt: charName,
              },
            ],
            type: 'website',
          },
          twitter: {
            card: 'summary_large_image',
            title: `${charName} — ตัวละคร SedChar.AI`,
            description: charDesc,
            images: [ogImageUrl],
          },
        };
      }
    } catch (e) {
      console.warn('generateMetadata fetch error:', e);
    }
  }

  // 2. Instant URL Share Metadata (via Base64 payload)
  if (dataParam) {
    try {
      const decoded = decodeCharacterFromShareUrl(dataParam);
      if (decoded && decoded.character) {
        const char = decoded.character;
        const charName = decoded.title || char.fullName || char.nickname || 'ตัวละคร AI Roleplay';
        const charDesc = char.shortIntro || 'ตัวละคร AI Roleplay สร้างจาก SedChar.AI';
        const rawImage = decoded.imageUrl || (char as any).imageUrl || (char as any).image || '';
        const httpImage = rawImage.startsWith('http://') || rawImage.startsWith('https://') ? rawImage : '';
        const ogImageUrl = `${baseUrl}/api/characters/share/og?title=${encodeURIComponent(charName)}&nickname=${encodeURIComponent(char.nickname || '')}&tagline=${encodeURIComponent(charDesc)}&flag=${encodeURIComponent(char.flagType || 'none')}${httpImage ? `&image=${encodeURIComponent(httpImage)}` : ''}`;

        return {
          title: `${charName} | SedChar.AI`,
          description: charDesc,
          openGraph: {
            title: `${charName} — ตัวละคร SedChar.AI`,
            description: charDesc,
            siteName: 'SedChar.AI',
            images: [
              {
                url: ogImageUrl,
                width: 1200,
                height: 630,
                alt: charName,
              },
            ],
            type: 'website',
          },
          twitter: {
            card: 'summary_large_image',
            title: `${charName} — ตัวละคร SedChar.AI`,
            description: charDesc,
            images: [ogImageUrl],
          },
        };
      }
    } catch (e) {
      console.warn('generateMetadata instant error:', e);
    }
  }

  // 3. Default Homepage Metadata
  const defaultOgImage = `${baseUrl}/shedchar_logo.png`;
  return {
    title: 'SedChar.AI — Thai Roleplay Character Studio',
    description: 'สตูดิโอสร้าง ออกแบบ และแปลงตัวละคร Tag-Based สำหรับ Rubii, Purrpaw และ Khui AI',
    openGraph: {
      title: 'SedChar.AI — Thai Roleplay Character Studio',
      description: 'สตูดิโอสร้าง ออกแบบ และแปลงตัวละคร Tag-Based สำหรับ Rubii, Purrpaw และ Khui AI',
      siteName: 'SedChar.AI',
      images: [
        {
          url: defaultOgImage,
          width: 512,
          height: 512,
          alt: 'SedChar.AI Logo',
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'SedChar.AI — Thai Roleplay Character Studio',
      description: 'สตูดิโอสร้าง ออกแบบ และแปลงตัวละคร Tag-Based สำหรับ Rubii, Purrpaw และ Khui AI',
      images: [defaultOgImage],
    },
  };
}

export default function HomePage() {
  return <MainWorkspaceClient />;
}
