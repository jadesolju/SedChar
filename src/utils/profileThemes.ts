export interface AvatarBgTheme {
  id: string;
  label: string;
  name: string;
  subtitle: string;
  gradient: string;
  glow: string;
  border: string;
  ring: string;
}

export interface BannerTheme {
  id: string;
  label: string;
  name: string;
  subtitle: string;
  gradient: string;
  accentBadge: string;
  accentText: string;
  category?: 'pastel' | 'solid' | 'dark' | 'vibrant';
  pattern?: 'dots' | 'grid' | 'stars' | 'waves' | 'none';
}

export const AVATAR_BG_THEMES: AvatarBgTheme[] = [
  {
    id: 'nebula',
    label: 'Cosmic Nebula (ม่วงอวกาศ)',
    name: 'Cosmic Nebula',
    subtitle: 'ม่วงอวกาศ',
    gradient: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 50%, #8b5cf6 100%)',
    glow: '0 0 20px rgba(124, 58, 237, 0.45)',
    border: 'border-purple-400/50',
    ring: 'ring-purple-500/50',
  },
  {
    id: 'sunset',
    label: 'Sunset Aura (อาทิตย์อัสดง)',
    name: 'Sunset Aura',
    subtitle: 'อาทิตย์อัสดง',
    gradient: 'linear-gradient(135deg, #f43f5e 0%, #ea580c 50%, #f59e0b 100%)',
    glow: '0 0 20px rgba(244, 63, 94, 0.45)',
    border: 'border-rose-400/50',
    ring: 'ring-rose-500/50',
  },
  {
    id: 'cyber',
    label: 'Cyber Neon (ไซเบอร์พังก์)',
    name: 'Cyber Neon',
    subtitle: 'ไซเบอร์พังก์',
    gradient: 'linear-gradient(135deg, #06b6d4 0%, #2563eb 50%, #c026d3 100%)',
    glow: '0 0 20px rgba(6, 182, 212, 0.45)',
    border: 'border-cyan-400/50',
    ring: 'ring-cyan-500/50',
  },
  {
    id: 'emerald',
    label: 'Emerald Mystic (ป่ามรกต)',
    name: 'Emerald Mystic',
    subtitle: 'ป่ามรกต',
    gradient: 'linear-gradient(135deg, #059669 0%, #0d9488 50%, #06b6d4 100%)',
    glow: '0 0 20px rgba(5, 150, 105, 0.45)',
    border: 'border-emerald-400/50',
    ring: 'ring-emerald-500/50',
  },
  {
    id: 'gold',
    label: 'Imperial Gold (ทองคำจักรพรรดิ)',
    name: 'Imperial Gold',
    subtitle: 'ทองคำจักรพรรดิ',
    gradient: 'linear-gradient(135deg, #d97706 0%, #ca8a04 50%, #eab308 100%)',
    glow: '0 0 20px rgba(217, 119, 6, 0.45)',
    border: 'border-amber-400/50',
    ring: 'ring-amber-500/50',
  },
  {
    id: 'sakura',
    label: 'Sakura Bloom (ซากุระหวาน)',
    name: 'Sakura Bloom',
    subtitle: 'ซากุระหวาน',
    gradient: 'linear-gradient(135deg, #db2777 0%, #e11d48 50%, #f43f5e 100%)',
    glow: '0 0 20px rgba(219, 39, 119, 0.45)',
    border: 'border-pink-400/50',
    ring: 'ring-pink-500/50',
  },
  {
    id: 'crimson',
    label: 'Dragon Crimson (เพลิงมังกร)',
    name: 'Dragon Crimson',
    subtitle: 'เพลิงมังกร',
    gradient: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 50%, #ea580c 100%)',
    glow: '0 0 20px rgba(220, 38, 38, 0.45)',
    border: 'border-red-400/50',
    ring: 'ring-red-500/50',
  },
  {
    id: 'obsidian',
    label: 'Obsidian Stealth (ออบซิเดียนมิดไนท์)',
    name: 'Obsidian Stealth',
    subtitle: 'ออบซิเดียนมิดไนท์',
    gradient: 'linear-gradient(135deg, #18181b 0%, #27272a 50%, #3f3f46 100%)',
    glow: '0 0 20px rgba(39, 39, 42, 0.6)',
    border: 'border-zinc-500/50',
    ring: 'ring-zinc-500/50',
  },
  {
    id: 'ocean',
    label: 'Ocean Abyss (ห้วงสมุทรลึก)',
    name: 'Ocean Abyss',
    subtitle: 'ห้วงสมุทรลึก',
    gradient: 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 50%, #0284c7 100%)',
    glow: '0 0 20px rgba(29, 78, 216, 0.45)',
    border: 'border-blue-400/50',
    ring: 'ring-blue-500/50',
  },
  {
    id: 'amethyst',
    label: 'Amethyst Royal (อัญมณีราชวงศ์)',
    name: 'Amethyst Royal',
    subtitle: 'อัญมณีราชวงศ์',
    gradient: 'linear-gradient(135deg, #6b21a8 0%, #7e22ce 50%, #c026d3 100%)',
    glow: '0 0 20px rgba(107, 33, 168, 0.45)',
    border: 'border-purple-400/50',
    ring: 'ring-purple-500/50',
  },
  {
    id: 'aurora',
    label: 'Northern Lights (แสงเหนือออโรร่า)',
    name: 'Northern Lights',
    subtitle: 'แสงเหนือออโรร่า',
    gradient: 'linear-gradient(135deg, #059669 0%, #0284c7 50%, #6366f1 100%)',
    glow: '0 0 20px rgba(2, 132, 199, 0.45)',
    border: 'border-teal-400/50',
    ring: 'ring-teal-500/50',
  },
  {
    id: 'platinum',
    label: 'Platinum Silver (แพลทินัมเงินยวง)',
    name: 'Platinum Silver',
    subtitle: 'แพลทินัมเงินยวง',
    gradient: 'linear-gradient(135deg, #52525b 0%, #71717a 50%, #a1a1aa 100%)',
    glow: '0 0 20px rgba(113, 113, 122, 0.45)',
    border: 'border-zinc-400/50',
    ring: 'ring-zinc-500/50',
  },
];

export const BANNER_THEMES: BannerTheme[] = [
  // ==========================================
  // 1. 🌸 PASTEL TONES (พาสเทลละมุนตา สดใส สบายตา)
  // ==========================================
  {
    id: 'pastel_sakura',
    label: 'Sakura Milk (นมชมพูซากุระ)',
    name: 'Sakura Milk',
    subtitle: 'นมชมพูซากุระ',
    category: 'pastel',
    gradient: 'linear-gradient(135deg, #fce7f3 0%, #fbcfe8 45%, #f472b6 100%)',
    accentBadge: 'bg-pink-500/20 text-pink-700 dark:text-pink-300 border-pink-400/40',
    accentText: 'text-pink-600 dark:text-pink-400',
    pattern: 'dots',
  },
  {
    id: 'pastel_lavender',
    label: 'Lavender Mist (หมอกลาเวนเดอร์)',
    name: 'Lavender Mist',
    subtitle: 'หมอกลาเวนเดอร์',
    category: 'pastel',
    gradient: 'linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 45%, #c084fc 100%)',
    accentBadge: 'bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-400/40',
    accentText: 'text-purple-600 dark:text-purple-400',
    pattern: 'stars',
  },
  {
    id: 'pastel_sky',
    label: 'Baby Sky (ฟ้าละมุนปุยเมฆ)',
    name: 'Baby Sky',
    subtitle: 'ฟ้าละมุนปุยเมฆ',
    category: 'pastel',
    gradient: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 45%, #93c5fd 100%)',
    accentBadge: 'bg-sky-500/20 text-sky-700 dark:text-sky-300 border-sky-400/40',
    accentText: 'text-sky-600 dark:text-sky-400',
    pattern: 'dots',
  },
  {
    id: 'pastel_mint',
    label: 'Mint Macaron (มินต์มาการอง)',
    name: 'Mint Macaron',
    subtitle: 'มินต์มาการอง',
    category: 'pastel',
    gradient: 'linear-gradient(135deg, #ccfbf1 0%, #99f6e4 45%, #6ee7b7 100%)',
    accentBadge: 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-400/40',
    accentText: 'text-emerald-600 dark:text-emerald-400',
    pattern: 'dots',
  },
  {
    id: 'pastel_peach',
    label: 'Peach Sorbet (พีชซอร์เบต์)',
    name: 'Peach Sorbet',
    subtitle: 'พีชซอร์เบต์',
    category: 'pastel',
    gradient: 'linear-gradient(135deg, #ffedd5 0%, #fed7aa 45%, #fb923c 100%)',
    accentBadge: 'bg-orange-500/20 text-orange-700 dark:text-orange-300 border-orange-400/40',
    accentText: 'text-orange-600 dark:text-orange-400',
    pattern: 'dots',
  },
  {
    id: 'pastel_butter',
    label: 'Butter Vanilla (วานิลลาเนยสด)',
    name: 'Butter Vanilla',
    subtitle: 'วานิลลาเนยสด',
    category: 'pastel',
    gradient: 'linear-gradient(135deg, #fef9c3 0%, #fef08a 45%, #fde047 100%)',
    accentBadge: 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 border-yellow-400/40',
    accentText: 'text-yellow-600 dark:text-yellow-400',
    pattern: 'stars',
  },
  {
    id: 'pastel_matcha',
    label: 'Matcha Latte (มัทฉะลาเต้)',
    name: 'Matcha Latte',
    subtitle: 'มัทฉะลาเต้',
    category: 'pastel',
    gradient: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 45%, #a7f3d0 100%)',
    accentBadge: 'bg-teal-500/20 text-teal-700 dark:text-teal-300 border-teal-400/40',
    accentText: 'text-teal-600 dark:text-teal-400',
    pattern: 'dots',
  },
  {
    id: 'pastel_cotton',
    label: 'Cotton Candy (ขนมสายไหมหวาน)',
    name: 'Cotton Candy',
    subtitle: 'ขนมสายไหมหวาน',
    category: 'pastel',
    gradient: 'linear-gradient(135deg, #fce7f3 0%, #e0e7ff 50%, #bae6fd 100%)',
    accentBadge: 'bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border-indigo-400/40',
    accentText: 'text-indigo-600 dark:text-indigo-400',
    pattern: 'stars',
  },
  {
    id: 'pastel_sunrise',
    label: 'Sweet Sunrise (อรุโณทัยสดใส)',
    name: 'Sweet Sunrise',
    subtitle: 'อรุโณทัยสดใส',
    category: 'pastel',
    gradient: 'linear-gradient(135deg, #ffedd5 0%, #fce7f3 50%, #e0e7ff 100%)',
    accentBadge: 'bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-400/40',
    accentText: 'text-rose-600 dark:text-rose-400',
    pattern: 'dots',
  },
  {
    id: 'pastel_ocean',
    label: 'Ocean Breeze (สายลมทะเลสดใส)',
    name: 'Ocean Breeze',
    subtitle: 'สายลมทะเลสดใส',
    category: 'pastel',
    gradient: 'linear-gradient(135deg, #e0f2fe 0%, #ccfbf1 50%, #dbeafe 100%)',
    accentBadge: 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border-cyan-400/40',
    accentText: 'text-cyan-600 dark:text-cyan-400',
    pattern: 'dots',
  },

  // ==========================================
  // 2. ⚪ SOLID & MINIMAL TONES (สีเรียบๆ คลีน สว่าง สบายตา)
  // ==========================================
  {
    id: 'solid_ivory',
    label: 'Clean Ivory (งาช้างคลีน)',
    name: 'Clean Ivory',
    subtitle: 'งาช้างคลีน',
    category: 'solid',
    gradient: 'linear-gradient(135deg, #fdfbf7 0%, #f4eee3 100%)',
    accentBadge: 'bg-amber-500/20 text-amber-800 dark:text-amber-200 border-amber-300/40',
    accentText: 'text-amber-700 dark:text-amber-300',
    pattern: 'none',
  },
  {
    id: 'solid_linen',
    label: 'Warm Linen (ลินินอบอุ่น)',
    name: 'Warm Linen',
    subtitle: 'ลินินอบอุ่น',
    category: 'solid',
    gradient: 'linear-gradient(135deg, #f7f4ef 0%, #e8e2d8 100%)',
    accentBadge: 'bg-stone-500/20 text-stone-800 dark:text-stone-200 border-stone-300/40',
    accentText: 'text-stone-700 dark:text-stone-300',
    pattern: 'none',
  },
  {
    id: 'solid_mist',
    label: 'Soft Mist (เทาหมอกคลีน)',
    name: 'Soft Mist',
    subtitle: 'เทาหมอกคลีน',
    category: 'solid',
    gradient: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
    accentBadge: 'bg-slate-500/20 text-slate-800 dark:text-slate-200 border-slate-300/40',
    accentText: 'text-slate-700 dark:text-slate-300',
    pattern: 'none',
  },
  {
    id: 'solid_sage',
    label: 'Clean Sage (เขียวเซจคลีน)',
    name: 'Clean Sage',
    subtitle: 'เขียวเซจคลีน',
    category: 'solid',
    gradient: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
    accentBadge: 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-200 border-emerald-300/40',
    accentText: 'text-emerald-700 dark:text-emerald-300',
    pattern: 'none',
  },
  {
    id: 'solid_sky',
    label: 'Glacier White (ฟ้าไอซ์เบิร์ก)',
    name: 'Glacier White',
    subtitle: 'ฟ้าไอซ์เบิร์ก',
    category: 'solid',
    gradient: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
    accentBadge: 'bg-sky-500/20 text-sky-800 dark:text-sky-200 border-sky-300/40',
    accentText: 'text-sky-700 dark:text-sky-300',
    pattern: 'none',
  },
  {
    id: 'solid_rose',
    label: 'Powder Rose (ครีมชมพูคลีน)',
    name: 'Powder Rose',
    subtitle: 'ครีมชมพูคลีน',
    category: 'solid',
    gradient: 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)',
    accentBadge: 'bg-rose-500/20 text-rose-800 dark:text-rose-200 border-rose-300/40',
    accentText: 'text-rose-700 dark:text-rose-300',
    pattern: 'none',
  },
  {
    id: 'solid_lavender',
    label: 'Lavender Pearl (ลาเวนเดอร์มุก)',
    name: 'Lavender Pearl',
    subtitle: 'ลาเวนเดอร์มุก',
    category: 'solid',
    gradient: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)',
    accentBadge: 'bg-purple-500/20 text-purple-800 dark:text-purple-200 border-purple-300/40',
    accentText: 'text-purple-700 dark:text-purple-300',
    pattern: 'none',
  },
  {
    id: 'solid_champagne',
    label: 'Champagne Cream (แชมเปญครีม)',
    name: 'Champagne Cream',
    subtitle: 'แชมเปญครีม',
    category: 'solid',
    gradient: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
    accentBadge: 'bg-yellow-500/20 text-yellow-800 dark:text-yellow-200 border-yellow-300/40',
    accentText: 'text-yellow-700 dark:text-yellow-300',
    pattern: 'none',
  },

  // ==========================================
  // 3. 🌌 LUMINOUS VIBRANT TONES (สดใส สว่าง สบายตา)
  // ==========================================
  {
    id: 'sunset_aurora',
    label: 'Sunset Horizon (แสงตะวันสดใส)',
    name: 'Sunset Horizon',
    subtitle: 'แสงตะวันสดใส',
    category: 'vibrant',
    gradient: 'linear-gradient(135deg, #fb7185 0%, #f97316 50%, #fbbf24 100%)',
    accentBadge: 'bg-orange-500/20 text-orange-700 dark:text-orange-300 border-orange-400/40',
    accentText: 'text-orange-600 dark:text-orange-400',
    pattern: 'dots',
  },
  {
    id: 'cyber_aurora',
    label: 'Neon Spring (แสงเหนือนีออน)',
    name: 'Neon Spring',
    subtitle: 'แสงเหนือนีออน',
    category: 'vibrant',
    gradient: 'linear-gradient(135deg, #38bdf8 0%, #818cf8 50%, #c084fc 100%)',
    accentBadge: 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border-cyan-400/40',
    accentText: 'text-cyan-600 dark:text-cyan-400',
    pattern: 'grid',
  },
  {
    id: 'emerald_spring',
    label: 'Emerald Blossom (มรกตผลิบาน)',
    name: 'Emerald Blossom',
    subtitle: 'มรกตผลิบาน',
    category: 'vibrant',
    gradient: 'linear-gradient(135deg, #34d399 0%, #2dd4bf 50%, #38bdf8 100%)',
    accentBadge: 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-400/40',
    accentText: 'text-emerald-600 dark:text-emerald-400',
    pattern: 'dots',
  },
  {
    id: 'sakura_dream',
    label: 'Sakura Blossom (ซากุระบานสะพรั่ง)',
    name: 'Sakura Blossom',
    subtitle: 'ซากุระบานสะพรั่ง',
    category: 'vibrant',
    gradient: 'linear-gradient(135deg, #f472b6 0%, #fb7185 50%, #fda4af 100%)',
    accentBadge: 'bg-pink-500/20 text-pink-700 dark:text-pink-300 border-pink-400/40',
    accentText: 'text-pink-600 dark:text-pink-400',
    pattern: 'stars',
  },
  {
    id: 'solar_flare',
    label: 'Coral Glow (ส้มคอรัลเรืองรอง)',
    name: 'Coral Glow',
    subtitle: 'ส้มคอรัลเรืองรอง',
    category: 'vibrant',
    gradient: 'linear-gradient(135deg, #fb923c 0%, #f43f5e 50%, #ec4899 100%)',
    accentBadge: 'bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-400/40',
    accentText: 'text-rose-600 dark:text-rose-400',
    pattern: 'dots',
  },
  {
    id: 'royal_azure',
    label: 'Royal Azure (ไพลินสดใส)',
    name: 'Royal Azure',
    subtitle: 'ไพลินสดใส',
    category: 'vibrant',
    gradient: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 50%, #818cf8 100%)',
    accentBadge: 'bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-400/40',
    accentText: 'text-blue-600 dark:text-blue-400',
    pattern: 'waves',
  },
  {
    id: 'imperial_gold',
    label: 'Golden Radiance (แสงทองประกาย)',
    name: 'Golden Radiance',
    subtitle: 'แสงทองประกาย',
    category: 'vibrant',
    gradient: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #f97316 100%)',
    accentBadge: 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-400/40',
    accentText: 'text-amber-600 dark:text-amber-400',
    pattern: 'dots',
  },
  {
    id: 'arctic_glacier',
    label: 'Crystal Glacier (คริสตัลขั้วโลก)',
    name: 'Crystal Glacier',
    subtitle: 'คริสตัลขั้วโลก',
    category: 'vibrant',
    gradient: 'linear-gradient(135deg, #7dd3fc 0%, #38bdf8 50%, #60a5fa 100%)',
    accentBadge: 'bg-sky-500/20 text-sky-700 dark:text-sky-300 border-sky-400/40',
    accentText: 'text-sky-600 dark:text-sky-400',
    pattern: 'grid',
  },

  // ==========================================
  // 4. 🔮 MODERN LUXURY TONES (สว่างนวล หรูหราสะอาดตา)
  // ==========================================
  {
    id: 'modern_slate',
    label: 'Modern Slate (สเลทโมเดิร์นคลีน)',
    name: 'Modern Slate',
    subtitle: 'สเลทโมเดิร์นคลีน',
    category: 'dark',
    gradient: 'linear-gradient(135deg, #cbd5e1 0%, #94a3b8 50%, #64748b 100%)',
    accentBadge: 'bg-slate-700/30 text-slate-100 border-slate-500/40',
    accentText: 'text-slate-200',
    pattern: 'grid',
  },
  {
    id: 'amethyst_light',
    label: 'Violet Crystal (อเมทิสต์คริสตัล)',
    name: 'Violet Crystal',
    subtitle: 'อเมทิสต์คริสตัล',
    category: 'dark',
    gradient: 'linear-gradient(135deg, #e9d5ff 0%, #c084fc 50%, #a855f7 100%)',
    accentBadge: 'bg-purple-700/30 text-purple-100 border-purple-500/40',
    accentText: 'text-purple-200',
    pattern: 'stars',
  },
  {
    id: 'rose_gold',
    label: 'Rose Gold Luxe (โรสโกลด์หรูหรา)',
    name: 'Rose Gold Luxe',
    subtitle: 'โรสโกลด์หรูหรา',
    category: 'dark',
    gradient: 'linear-gradient(135deg, #ffe4e6 0%, #fda4af 50%, #fb923c 100%)',
    accentBadge: 'bg-rose-700/30 text-rose-100 border-rose-500/40',
    accentText: 'text-rose-200',
    pattern: 'dots',
  },
  {
    id: 'ocean_sapphire',
    label: 'Sapphire Crystal (ไพลินกระจ่าง)',
    name: 'Sapphire Crystal',
    subtitle: 'ไพลินกระจ่าง',
    category: 'dark',
    gradient: 'linear-gradient(135deg, #bae6fd 0%, #60a5fa 50%, #3b82f6 100%)',
    accentBadge: 'bg-blue-700/30 text-blue-100 border-blue-500/40',
    accentText: 'text-blue-200',
    pattern: 'waves',
  },
  {
    id: 'emerald_luxe',
    label: 'Jade Luxury (หยกเขียวประกาย)',
    name: 'Jade Luxury',
    subtitle: 'หยกเขียวประกาย',
    category: 'dark',
    gradient: 'linear-gradient(135deg, #a7f3d0 0%, #34d399 50%, #059669 100%)',
    accentBadge: 'bg-emerald-700/30 text-emerald-100 border-emerald-500/40',
    accentText: 'text-emerald-200',
    pattern: 'dots',
  },
  {
    id: 'warm_amber',
    label: 'Amber Honey (น้ำผึ้งอำพันสว่าง)',
    name: 'Amber Honey',
    subtitle: 'น้ำผึ้งอำพันสว่าง',
    category: 'dark',
    gradient: 'linear-gradient(135deg, #fed7aa 0%, #fbbf24 50%, #f59e0b 100%)',
    accentBadge: 'bg-amber-700/30 text-amber-100 border-amber-500/40',
    accentText: 'text-amber-200',
    pattern: 'stars',
  },
];

export function getAvatarTheme(themeId?: string, customColor?: string): AvatarBgTheme {
  if (customColor) {
    return {
      id: 'custom',
      label: 'กำหนดสีเอง (Custom)',
      name: 'Custom Aura',
      subtitle: customColor,
      gradient: `linear-gradient(135deg, ${customColor} 0%, #18181b 100%)`,
      glow: `0 0 20px ${customColor}80`,
      border: 'border-white/40',
      ring: 'ring-white/40',
    };
  }
  const found = AVATAR_BG_THEMES.find((t) => t.id === themeId);
  return found || AVATAR_BG_THEMES[0]!;
}

export function getBannerTheme(
  themeId?: string,
  customColor1?: string,
  customColor2?: string,
  bannerUrl?: string,
  gradientAngle: number = 135
): BannerTheme {
  if (bannerUrl) {
    return {
      id: 'custom_image',
      label: 'รูปภาพกำหนดเอง (Custom Image)',
      name: 'Custom Banner',
      subtitle: 'รูปภาพกำหนดเอง',
      gradient: `url("${bannerUrl}") center/cover no-repeat`,
      accentBadge: 'bg-black/50 text-white border-white/20 backdrop-blur-md',
      accentText: 'text-white',
      pattern: 'none',
    };
  }

  if (customColor1 && customColor2) {
    return {
      id: 'custom_gradient',
      label: 'ไล่เฉดสีกำหนดเอง (Custom Gradient)',
      name: 'Custom Gradient',
      subtitle: `${customColor1} → ${customColor2}`,
      gradient: `linear-gradient(${gradientAngle}deg, ${customColor1} 0%, ${customColor2} 100%)`,
      accentBadge: 'bg-black/40 text-white border-white/20 backdrop-blur-md',
      accentText: 'text-white',
      pattern: 'dots',
    };
  }

  const found = BANNER_THEMES.find((t) => t.id === themeId);
  return found || BANNER_THEMES[0]!;
}

export function getAvatarBgClass(themeId?: string): string {
  const found = AVATAR_BG_THEMES.find((t) => t.id === themeId);
  return found ? 'border border-white/20' : 'bg-purple-600';
}

