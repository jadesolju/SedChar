import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SedChar.AI — Thai Character Parser',
  description: 'แปลงข้อมูลตัวละครภาษาไทย Tag-Based สำหรับ Rubii, Purrpaw, Khui AI รองรับ 12,000–25,000 ตัวอักษร',
  keywords: ['character', 'roleplay', 'thai', 'rubii', 'purrpaw', 'khui', 'AI', 'chatbot'],
  authors: [{ name: 'SedChar.AI' }],
};

export default function RootLayout({ children }: { readonly children: React.ReactNode }) {
  return (
    <html lang="th" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const stored = localStorage.getItem('sedchar-theme');
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                if (stored === 'dark' || (!stored && prefersDark)) {
                  document.documentElement.classList.add('dark');
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
