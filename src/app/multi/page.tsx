import type { Metadata } from 'next';
import { RubiiMultiWorkspace } from '@/components/rubii-multi/RubiiMultiWorkspace';
import { AuthProvider } from '@/context/AuthContext';

const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://sedchar.vercel.app').replace(/\/+$/, '');

export const metadata: Metadata = {
  title: 'Multi-Char Studio | SedChar.AI',
  description: 'ออกแบบและวางโครงสร้างจักรวาลเนื้อเรื่องหลายตัวละคร (Multi-Character Roleplay Studio) สำหรับ Rubii & Chatbot AI',
  openGraph: {
    title: 'Multi-Char Studio — จักรวาลหลายตัวละคร | SedChar.AI',
    description: 'ออกแบบและวางโครงสร้างจักรวาลเนื้อเรื่องหลายตัวละคร (Multi-Character Roleplay Studio) สำหรับ Rubii & Chatbot AI',
    url: `${baseUrl}/multi`,
    siteName: 'SedChar.AI',
    locale: 'th_TH',
    type: 'website',
    images: [
      {
        url: `${baseUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'Multi-Char Studio — SedChar.AI',
      },
      {
        url: `${baseUrl}/shedchar_logo.png`,
        width: 512,
        height: 512,
        alt: 'SedChar.AI Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Multi-Char Studio — จักรวาลหลายตัวละคร | SedChar.AI',
    description: 'ออกแบบและวางโครงสร้างจักรวาลเนื้อเรื่องหลายตัวละคร (Multi-Character Roleplay Studio) สำหรับ Rubii & Chatbot AI',
    images: [`${baseUrl}/og-image.png`],
  },
};

export default function MultiCharacterStudioPage() {
  return (
    <AuthProvider>
      <RubiiMultiWorkspace />
    </AuthProvider>
  );
}