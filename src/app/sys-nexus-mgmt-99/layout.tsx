import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Nexus Management | SedChar.AI',
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

export default function AdminLayout({ children }: { readonly children: React.ReactNode }) {
  return <>{children}</>;
}