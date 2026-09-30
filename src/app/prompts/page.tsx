import type { Metadata } from 'next';
import { AuthProvider } from '@/context/AuthContext';
import { PromptLibraryPageClient } from '@/components/prompt-library/PromptLibraryPageClient';

const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://sedchar.online').replace(/\/+$/, '');

export const metadata: Metadata = {
  title: 'Prompt Library | SedChar.AI — คลังคำสั่งและกฎพฤติกรรม AI',
  description: 'คลังคำสั่งและกฎพฤติกรรม AI Roleplay 10 หมวดหมู่กว่า 50+ รายการ พร้อมระบบสร้างคำสั่งส่วนตัว Zero Egress',
  openGraph: {
    title: 'Prompt Library | SedChar.AI — คลังคำสั่งและกฎพฤติกรรม AI',
    description: 'คลังคำสั่งและกฎพฤติกรรม AI Roleplay 10 หมวดหมู่กว่า 50+ รายการ พร้อมระบบสร้างคำสั่งส่วนตัว Zero Egress',
    url: `${baseUrl}/prompts`,
    siteName: 'SedChar.AI',
    locale: 'th_TH',
    type: 'website',
  },
};

export default function PromptLibraryPage() {
  return (
    <AuthProvider>
      <PromptLibraryPageClient />
    </AuthProvider>
  );
}
