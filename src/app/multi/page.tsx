import type { Metadata } from 'next';
import { RubiiMultiWorkspace } from '@/components/rubii-multi/RubiiMultiWorkspace';

export const metadata: Metadata = {
  title: 'Multi-Char Studio | SedChar.AI',
  description: 'ออกแบบและวางโครงสร้างโปรเจกต์เนื้อเรื่องหลายตัวละคร (Multi-Character Studio)',
};

export default function MultiCharacterStudioPage() {
  return <RubiiMultiWorkspace />;
}
