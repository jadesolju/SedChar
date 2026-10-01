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
  {
    id: 'cosmic',
    label: 'Cosmic Nebula (คอสมิกเนบิวลา)',
    name: 'Cosmic Nebula',
    subtitle: 'คอสมิกเนบิวลา',
    gradient: 'linear-gradient(135deg, #1e1035 0%, #2e1065 45%, #0f172a 100%)',
    accentBadge: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    accentText: 'text-purple-400',
    pattern: 'stars',
  },
  {
    id: 'sunset_aurora',
    label: 'Sunset Aurora (แสงเหนือยามเย็น)',
    name: 'Sunset Aurora',
    subtitle: 'แสงเหนือยามเย็น',
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
    gradient: 'linear-gradient(135deg, #022c22 0%, #064e3b 45%, #042f2e 100%)',
    accentBadge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    accentText: 'text-emerald-400',
    pattern: 'dots',
  },
  {
    id: 'midnight_carbon',
    label: 'Midnight Carbon (คาร์บอนหรูหรา)',
    name: 'Midnight Carbon',
    subtitle: 'คาร์บอนหรูหรา',
    gradient: 'linear-gradient(135deg, #09090b 0%, #18181b 50%, #27272a 100%)',
    accentBadge: 'bg-zinc-700/40 text-zinc-200 border-zinc-500/40',
    accentText: 'text-zinc-300',
    pattern: 'grid',
  },
  {
    id: 'sakura_dream',
    label: 'Sakura Dream (กลีบซากุระราตรี)',
    name: 'Sakura Dream',
    subtitle: 'กลีบซากุระราตรี',
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
    gradient: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #312e81 100%)',
    accentBadge: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    accentText: 'text-blue-400',
    pattern: 'waves',
  },
  {
    id: 'amethyst_velvet',
    label: 'Amethyst Velvet (กำมะหยี่อเมทิสต์)',
    name: 'Amethyst Velvet',
    subtitle: 'กำมะหยี่อเมทิสต์',
    gradient: 'linear-gradient(135deg, #2e1065 0%, #581c87 50%, #3b0764 100%)',
    accentBadge: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    accentText: 'text-purple-400',
    pattern: 'stars',
  },
  {
    id: 'imperial_gold',
    label: 'Imperial Gold (ราชสำนักทองคำ)',
    name: 'Imperial Gold',
    subtitle: 'ราชสำนักทองคำ',
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
    gradient: 'linear-gradient(135deg, #082f49 0%, #0c4a6e 45%, #172554 100%)',
    accentBadge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    accentText: 'text-cyan-400',
    pattern: 'grid',
  },
  {
    id: 'vintage_espresso',
    label: 'Vintage Espresso (เอสเปรสโซ่คลาสสิก)',
    name: 'Vintage Espresso',
    subtitle: 'เอสเปรสโซ่คลาสสิก',
    gradient: 'linear-gradient(135deg, #291508 0%, #451a03 50%, #1c1917 100%)',
    accentBadge: 'bg-amber-700/30 text-amber-200 border-amber-600/40',
    accentText: 'text-amber-300',
    pattern: 'dots',
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
  bannerUrl?: string
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
      gradient: `linear-gradient(135deg, ${customColor1} 0%, ${customColor2} 100%)`,
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

