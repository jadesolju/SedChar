import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SedChar.AI (Demo) — Thai Character Parser',
  description: 'แปลงข้อมูลตัวละครภาษาไทย Tag-Based สำหรับ Rubii, Purrpaw, Khui AI รองรับ 12,000–25,000 ตัวอักษร',
  keywords: ['character', 'roleplay', 'thai', 'rubii', 'purrpaw', 'khui', 'AI', 'chatbot', 'pwa'],
  authors: [{ name: 'SedChar.AI' }],
  manifest: '/manifest.json',
  icons: {
    icon: '/shedchar_logo.png',
    shortcut: '/shedchar_logo.png',
    apple: '/shedchar_logo.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'SedChar.AI',
  },
  applicationName: 'SedChar.AI',
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F43F5E' },
    { media: '(prefers-color-scheme: dark)', color: '#09090B' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({ children }: { readonly children: React.ReactNode }) {
  return (
    <html lang="th" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/shedchar_logo.png" type="image/png" />
        <link rel="apple-touch-icon" href="/shedchar_logo.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <script src="/scripts/theme-init.js" />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
