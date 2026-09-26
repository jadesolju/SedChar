import type { Metadata, Viewport } from 'next';
import './globals.css';

const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://sedchar.vercel.app').replace(/\/+$/, '');

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'SedChar.AI — สตูดิโอสร้างและแปลงตัวละคร AI ภาษาไทย',
    template: '%s | SedChar.AI',
  },
  description: 'สตูดิโอสร้าง ออกแบบ และแปลงตัวละคร Tag-Based ภาษาไทย สำหรับ Rubii, Purrpaw และ Khui AI รองรับ 12,000–25,000 ตัวอักษร พร้อม Multi-Char Studio',
  keywords: ['SedChar', 'SedChar.AI', 'character studio', 'roleplay ai', 'thai roleplay', 'rubii', 'purrpaw', 'khui ai', 'multi character', 'ai chatbot'],
  authors: [{ name: 'SedChar.AI', url: baseUrl }],
  creator: 'SedChar.AI',
  publisher: 'SedChar.AI',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
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
  openGraph: {
    type: 'website',
    locale: 'th_TH',
    url: baseUrl,
    siteName: 'SedChar.AI',
    title: 'SedChar.AI — สตูดิโอสร้างและแปลงตัวละคร AI ภาษาไทย',
    description: 'สตูดิโอสร้าง ออกแบบ และแปลงตัวละคร Tag-Based ภาษาไทย สำหรับ Rubii, Purrpaw และ Khui AI รองรับ 12,000–25,000 ตัวอักษร พร้อม Multi-Char Studio',
    images: [
      {
        url: '/shedchar_logo.png',
        width: 1254,
        height: 1254,
        alt: 'SedChar.AI Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SedChar.AI — สตูดิโอสร้างและแปลงตัวละคร AI ภาษาไทย',
    description: 'สตูดิโอสร้าง ออกแบบ และแปลงตัวละคร Tag-Based ภาษาไทย สำหรับ Rubii, Purrpaw และ Khui AI รองรับ 12,000–25,000 ตัวอักษร พร้อม Multi-Char Studio',
    images: ['/shedchar_logo.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
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