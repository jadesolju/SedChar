import type { Metadata } from 'next';
import { RubiiMultiWorkspace } from '@/components/rubii-multi/RubiiMultiWorkspace';

export const metadata: Metadata = {
  title: 'Rubii Multi-Char Studio — วางโครงเรื่องหลายตัวละครสำหรับ Rubii',
  description: 'พื้นที่ทำงานสร้างโปรเจกต์หลายตัวละครสำหรับ Rubii โดยเฉพาะ วางโครงสร้าง World Setting, Lore, Routes, Main Characters (10 ตัว) และตัวละครเสริมไม่จำกัด',
};

export default function RubiiMultiPage() {
  return <RubiiMultiWorkspace />;
}
