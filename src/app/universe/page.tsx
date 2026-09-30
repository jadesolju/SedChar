import type { Metadata } from 'next';
import { RubiiMultiWorkspace } from '@/components/rubii-multi/RubiiMultiWorkspace';
import { AuthProvider } from '@/context/AuthContext';

const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://sedchar.vercel.app').replace(/\/+$/, '');

export const metadata: Metadata = {
  title: 'Universe & Lorebook Studio | SedChar.AI',
  description: 'คลังจักรวาลและสร้าง Lorebook เนื้อเรื่องหลายตัวละคร (Universe & Multi-Character Studio) สำหรับ Rubii & Chatbot AI',
  openGraph: {
    title: 'Universe & Lorebook Studio — คลังจักรวาล | SedChar.AI',
    description: 'คลังจักรวาลและสร้าง Lorebook เนื้อเรื่องหลายตัวละคร สำหรับ Rubii & Chatbot AI',
    url: `${baseUrl}/universe`,
    siteName: 'SedChar.AI',
    locale: 'th_TH',
    type: 'website',
  },
};

export default function UniverseStudioPage() {
  return (
    <AuthProvider>
      <RubiiMultiWorkspace />
    </AuthProvider>
  );
}
