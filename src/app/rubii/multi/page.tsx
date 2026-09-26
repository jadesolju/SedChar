import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Redirecting to Multi-Char Studio | SedChar.AI',
  robots: {
    index: false,
    follow: true,
  },
};

export default function OldRubiiMultiPage() {
  redirect('/multi');
}