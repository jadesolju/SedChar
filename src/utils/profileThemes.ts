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
  // 1. 🌸 PASTEL TONES (พาสเทลละมุนตา - อันดับแรก)
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

  // ==========================================
  // 2. ⚪ SOLID & MINIMAL TONES (สีเรียบๆ มินิมอล)
  // ==========================================
  {
    id: 'solid_slate',
    label: 'Clean Slate (สเลทมินิมอล)',
    name: 'Clean Slate',
    subtitle: 'สเลทมินิมอล',
    category: 'solid',
    gradient: 'linear-gradient(135deg, #334155 0%, #1e293b 100%)',
    accentBadge: 'bg-slate-500/30 text-slate-200 border-slate-400/30',
    accentText: 'text-slate-300',
    pattern: 'none',
  },
  {
    id: 'solid_charcoal',
    label: 'Matte Charcoal (ชาร์โคลด้าน)',
    name: 'Matte Charcoal',
    subtitle: 'ชาร์โคลด้าน',
    category: 'solid',
    gradient: 'linear-gradient(135deg, #27272a 0%, #18181b 100%)',
    accentBadge: 'bg-zinc-700/40 text-zinc-200 border-zinc-500/40',
    accentText: 'text-zinc-300',
    pattern: 'none',
  },
  {
    id: 'solid_indigo',
    label: 'Deep Indigo (ครามมินิมอล)',
    name: 'Deep Indigo',
    subtitle: 'ครามมินิมอล',
    category: 'solid',
    gradient: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)',
    accentBadge: 'bg-indigo-700/30 text-indigo-200 border-indigo-500/40',
    accentText: 'text-indigo-300',
    pattern: 'none',
  },
  {
    id: 'solid_sage',
    label: 'Warm Sage (เซจเอิร์ธโทน)',
    name: 'Warm Sage',
    subtitle: 'เซจเอิร์ธโทน',
    category: 'solid',
    gradient: 'linear-gradient(135deg, #2d3b36 0%, #1a2421 100%)',
    accentBadge: 'bg-emerald-700/30 text-emerald-200 border-emerald-500/40',
    accentText: 'text-emerald-300',
    pattern: 'none',
  },
  {
    id: 'solid_espresso',
    label: 'Warm Espresso (เอสเปรสโซ่เรียบ)',
    name: 'Warm Espresso',
    subtitle: 'เอสเปรสโซ่เรียบ',
    category: 'solid',
    gradient: 'linear-gradient(135deg, #2e1d14 0%, #1a120c 100%)',
    accentBadge: 'bg-amber-700/30 text-amber-200 border-amber-600/40',
    accentText: 'text-amber-300',
    pattern: 'none',
  },
  {
    id: 'solid_obsidian',
    label: 'Pitch Black (ดำสนิทคลีน)',
    name: 'Pitch Black',
    subtitle: 'ดำสนิทคลีน',
    category: 'solid',
    gradient: 'linear-gradient(135deg, #09090b 0%, #000000 100%)',
    accentBadge: 'bg-zinc-800 text-zinc-100 border-zinc-700',
    accentText: 'text-zinc-200',
    pattern: 'none',
  },

  // ==========================================
  // 3. 🌑 DARK & LUXURY TONES (ดาร์ก & ลักชูรี่)
  // ==========================================
  {
    id: 'midnight_carbon',
    label: 'Midnight Carbon (คาร์บอนหรูหรา)',
    name: 'Midnight Carbon',
    subtitle: 'คาร์บอนหรูหรา',
    category: 'dark',
    gradient: 'linear-gradient(135deg, #09090b 0%, #18181b 50%, #27272a 100%)',
    accentBadge: 'bg-zinc-700/40 text-zinc-200 border-zinc-500/40',
    accentText: 'text-zinc-300',
    pattern: 'grid',
  },
  {
    id: 'cosmic',
    label: 'Cosmic Nebula (คอสมิกเนบิวลา)',
    name: 'Cosmic Nebula',
    subtitle: 'คอสมิกเนบิวลา',
    category: 'dark',
    gradient: 'linear-gradient(135deg, #1e1035 0%, #2e1065 45%, #0f172a 100%)',
    accentBadge: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    accentText: 'text-purple-400',
    pattern: 'stars',
  },
  {
    id: 'amethyst_velvet',
    label: 'Amethyst Velvet (กำมะหยี่อเมทิสต์)',
    name: 'Amethyst Velvet',
    subtitle: 'กำมะหยี่อเมทิสต์',
    category: 'dark',
    gradient: 'linear-gradient(135deg, #2e1065 0%, #581c87 50%, #3b0764 100%)',
    accentBadge: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    accentText: 'text-purple-400',
    pattern: 'stars',
  },
  {
    id: 'gothic_noir',
    label: 'Gothic Noir (โกธิคโนวาร์)',
    name: 'Gothic Noir',
    subtitle: 'โกธิคโนวาร์',
    category: 'dark',
    gradient: 'linear-gradient(135deg, #1f0814 0%, #350d22 50%, #09090b 100%)',
    accentBadge: 'bg-rose-900/30 text-rose-300 border-rose-700/40',
    accentText: 'text-rose-400',
    pattern: 'stars',
  },
  {
    id: 'abyssal_void',
    label: 'Abyssal Void (ห้วงอเวจีอนันต์)',
    name: 'Abyssal Void',
    subtitle: 'ห้วงอเวจีอนันต์',
    category: 'dark',
    gradient: 'linear-gradient(135deg, #030712 0%, #0b1528 50%, #030712 100%)',
    accentBadge: 'bg-blue-900/30 text-blue-300 border-blue-700/40',
    accentText: 'text-blue-400',
    pattern: 'dots',
  },
  {
    id: 'vintage_espresso',
    label: 'Vintage Espresso (เอสเปรสโซ่คลาสสิก)',
    name: 'Vintage Espresso',
    subtitle: 'เอสเปรสโซ่คลาสสิก',
    category: 'dark',
    gradient: 'linear-gradient(135deg, #291508 0%, #451a03 50%, #1c1917 100%)',
    accentBadge: 'bg-amber-700/30 text-amber-200 border-amber-600/40',
    accentText: 'text-amber-300',
    pattern: 'dots',
  },

  // ==========================================
  // 4. 🌌 VIBRANT & NEON TONES (นีออน & แฟนซี)
  // ==========================================
  {
    id: 'sunset_aurora',
    label: 'Sunset Aurora (แสงเหนือยามเย็น)',
    name: 'Sunset Aurora',
    subtitle: 'แสงเหนือยามเย็น',
    category: 'vibrant',
    gradient: 'linear-gradient(135deg, #4c0519 0%, #7c2d12 45%, #1e1b4b 100%)',
    accentBadge: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    accentText: 'text-rose-400',
    pattern: 'dots',
  },
  {
    id: 'cyber_grid',
    label: 'Cyber Grid (ไซเบอร์กริด)',
    name: 'Cyber Grid',
    subtitle: 'ไซเบอร์กริด',
    category: 'vibrant',
    gradient: 'linear-gradient(135deg, #083344 0%, #164e63 45%, #3b0764 100%)',
    accentBadge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    accentText: 'text-cyan-400',
    pattern: 'grid',
  },
  {
    id: 'emerald_sanctuary',
    label: 'Emerald Sanctuary (พงไพรมรกต)',
    name: 'Emerald Sanctuary',
    subtitle: 'พงไพรมรกต',
    category: 'vibrant',
    gradient: 'linear-gradient(135deg, #022c22 0%, #064e3b 45%, #042f2e 100%)',
    accentBadge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    accentText: 'text-emerald-400',
    pattern: 'dots',
  },
  {
    id: 'sakura_dream',
    label: 'Sakura Dream (กลีบซากุระราตรี)',
    name: 'Sakura Dream',
    subtitle: 'กลีบซากุระราตรี',
    category: 'vibrant',
    gradient: 'linear-gradient(135deg, #500724 0%, #831843 45%, #3b0764 100%)',
    accentBadge: 'bg-pink-500/20 text-pink-300 border-pink-500/40',
    accentText: 'text-pink-400',
    pattern: 'stars',
  },
  {
    id: 'solar_flare',
    label: 'Solar Flare (สุริยะเพลิงกัลป์)',
    name: 'Solar Flare',
    subtitle: 'สุริยะเพลิงกัลป์',
    category: 'vibrant',
    gradient: 'linear-gradient(135deg, #450a0a 0%, #78350f 45%, #18181b 100%)',
    accentBadge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    accentText: 'text-amber-400',
    pattern: 'dots',
  },
  {
    id: 'royal_sapphire',
    label: 'Royal Sapphire (ไพลินหลวง)',
    name: 'Royal Sapphire',
    subtitle: 'ไพลินหลวง',
    category: 'vibrant',
    gradient: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #312e81 100%)',
    accentBadge: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    accentText: 'text-blue-400',
    pattern: 'waves',
  },
  {
    id: 'imperial_gold',
    label: 'Imperial Gold (ราชสำนักทองคำ)',
    name: 'Imperial Gold',
    subtitle: 'ราชสำนักทองคำ',
    category: 'vibrant',
    gradient: 'linear-gradient(135deg, #422006 0%, #713f12 45%, #0f172a 100%)',
    accentBadge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    accentText: 'text-amber-400',
    pattern: 'dots',
  },
  {
    id: 'arctic_glacier',
    label: 'Arctic Glacier (ธารน้ำแข็งขั้วโลก)',
    name: 'Arctic Glacier',
    subtitle: 'ธารน้ำแข็งขั้วโลก',
    category: 'vibrant',
    gradient: 'linear-gradient(135deg, #082f49 0%, #0c4a6e 45%, #172554 100%)',
    accentBadge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    accentText: 'text-cyan-400',
    pattern: 'grid',
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

