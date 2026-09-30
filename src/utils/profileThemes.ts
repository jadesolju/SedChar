export interface AvatarBgTheme {
  id: string;
  label: string;
  name: string;
  subtitle: string;
  class: string;
  border: string;
  ring: string;
  previewColor: string;
}

export interface BannerTheme {
  id: string;
  label: string;
  name: string;
  subtitle: string;
  class: string;
  previewGradient: string;
  accentBadge: string;
  accentText: string;
}

export const AVATAR_BG_THEMES: AvatarBgTheme[] = [
  {
    id: 'nebula',
    label: 'Cosmic Nebula (ม่วงอวกาศ)',
    name: 'Cosmic Nebula',
    subtitle: 'ม่วงอวกาศ',
    class: 'bg-gradient-to-tr from-purple-600 via-indigo-600 to-violet-500',
    border: 'border-purple-400/40',
    ring: 'ring-purple-500/40',
    previewColor: '#8b5cf6',
  },
  {
    id: 'sunset',
    label: 'Sunset Aura (อาทิตย์อัสดง)',
    name: 'Sunset Aura',
    subtitle: 'อาทิตย์อัสดง',
    class: 'bg-gradient-to-tr from-rose-500 via-orange-500 to-amber-400',
    border: 'border-rose-400/40',
    ring: 'ring-rose-500/40',
    previewColor: '#f43f5e',
  },
  {
    id: 'cyber',
    label: 'Cyber Neon (ไซเบอร์พังก์)',
    name: 'Cyber Neon',
    subtitle: 'ไซเบอร์พังก์',
    class: 'bg-gradient-to-tr from-cyan-500 via-blue-600 to-fuchsia-500',
    border: 'border-cyan-400/40',
    ring: 'ring-cyan-500/40',
    previewColor: '#06b6d4',
  },
  {
    id: 'emerald',
    label: 'Emerald Mystic (ป่ามรกต)',
    name: 'Emerald Mystic',
    subtitle: 'ป่ามรกต',
    class: 'bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-500',
    border: 'border-emerald-400/40',
    ring: 'ring-emerald-500/40',
    previewColor: '#10b981',
  },
  {
    id: 'gold',
    label: 'Imperial Gold (ทองคำจักรพรรดิ)',
    name: 'Imperial Gold',
    subtitle: 'ทองคำจักรพรรดิ',
    class: 'bg-gradient-to-tr from-amber-600 via-yellow-500 to-amber-300',
    border: 'border-amber-400/40',
    ring: 'ring-amber-500/40',
    previewColor: '#f59e0b',
  },
  {
    id: 'sakura',
    label: 'Sakura Bloom (ซากุระหวาน)',
    name: 'Sakura Bloom',
    subtitle: 'ซากุระหวาน',
    class: 'bg-gradient-to-tr from-pink-500 via-rose-400 to-pink-300',
    border: 'border-pink-400/40',
    ring: 'ring-pink-500/40',
    previewColor: '#ec4899',
  },
  {
    id: 'crimson',
    label: 'Dragon Crimson (เพลิงมังกร)',
    name: 'Dragon Crimson',
    subtitle: 'เพลิงมังกร',
    class: 'bg-gradient-to-tr from-red-600 via-rose-700 to-orange-600',
    border: 'border-red-400/40',
    ring: 'ring-red-500/40',
    previewColor: '#dc2626',
  },
  {
    id: 'obsidian',
    label: 'Obsidian Stealth (ออบซิเดียนมิดไนท์)',
    name: 'Obsidian Stealth',
    subtitle: 'ออบซิเดียนมิดไนท์',
    class: 'bg-gradient-to-tr from-zinc-900 via-zinc-800 to-zinc-700',
    border: 'border-zinc-500/40',
    ring: 'ring-zinc-500/40',
    previewColor: '#27272a',
  },
  {
    id: 'ocean',
    label: 'Ocean Abyss (ห้วงสมุทรลึก)',
    name: 'Ocean Abyss',
    subtitle: 'ห้วงสมุทรลึก',
    class: 'bg-gradient-to-tr from-blue-700 via-indigo-800 to-sky-500',
    border: 'border-blue-400/40',
    ring: 'ring-blue-500/40',
    previewColor: '#2563eb',
  },
  {
    id: 'amethyst',
    label: 'Amethyst Royal (อัญมณีราชวงศ์)',
    name: 'Amethyst Royal',
    subtitle: 'อัญมณีราชวงศ์',
    class: 'bg-gradient-to-tr from-violet-700 via-purple-600 to-fuchsia-600',
    border: 'border-violet-400/40',
    ring: 'ring-violet-500/40',
    previewColor: '#7c3aed',
  },
];

export const BANNER_THEMES: BannerTheme[] = [
  {
    id: 'cosmic',
    label: 'Cosmic Nebula (คอสมิกเนบิวลา)',
    name: 'Cosmic Nebula',
    subtitle: 'คอสมิกเนบิวลา',
    class: 'bg-gradient-to-r from-purple-950 via-indigo-950 to-slate-900 border-purple-500/30',
    previewGradient: 'from-purple-900 via-indigo-900 to-slate-900',
    accentBadge: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    accentText: 'text-purple-400',
  },
  {
    id: 'sunset_aurora',
    label: 'Sunset Aurora (แสงเหนือยามเย็น)',
    name: 'Sunset Aurora',
    subtitle: 'แสงเหนือยามเย็น',
    class: 'bg-gradient-to-r from-rose-950 via-amber-950 to-slate-900 border-rose-500/30',
    previewGradient: 'from-rose-900 via-amber-900 to-slate-900',
    accentBadge: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    accentText: 'text-rose-400',
  },
  {
    id: 'cyber_grid',
    label: 'Cyber Grid (ไซเบอร์กริด)',
    name: 'Cyber Grid',
    subtitle: 'ไซเบอร์กริด',
    class: 'bg-gradient-to-r from-cyan-950 via-blue-950 to-zinc-900 border-cyan-500/30',
    previewGradient: 'from-cyan-950 via-blue-950 to-zinc-900',
    accentBadge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    accentText: 'text-cyan-400',
  },
  {
    id: 'emerald_sanctuary',
    label: 'Emerald Sanctuary (พงไพรมรกต)',
    name: 'Emerald Sanctuary',
    subtitle: 'พงไพรมรกต',
    class: 'bg-gradient-to-r from-emerald-950 via-teal-950 to-zinc-900 border-emerald-500/30',
    previewGradient: 'from-emerald-950 via-teal-950 to-zinc-900',
    accentBadge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    accentText: 'text-emerald-400',
  },
  {
    id: 'midnight_carbon',
    label: 'Midnight Carbon (คาร์บอนหรูหรา)',
    name: 'Midnight Carbon',
    subtitle: 'คาร์บอนหรูหรา',
    class: 'bg-gradient-to-r from-zinc-950 via-zinc-900 to-black border-zinc-700/40',
    previewGradient: 'from-zinc-950 via-zinc-900 to-black',
    accentBadge: 'bg-zinc-700/30 text-zinc-300 border-zinc-600/40',
    accentText: 'text-zinc-400',
  },
  {
    id: 'sakura_dream',
    label: 'Sakura Dream (กลีบซากุระราตรี)',
    name: 'Sakura Dream',
    subtitle: 'กลีบซากุระราตรี',
    class: 'bg-gradient-to-r from-pink-950 via-rose-950 to-purple-950 border-pink-500/30',
    previewGradient: 'from-pink-950 via-rose-950 to-purple-950',
    accentBadge: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
    accentText: 'text-pink-400',
  },
  {
    id: 'solar_flare',
    label: 'Solar Flare (สุริยะเพลิงกัลป์)',
    name: 'Solar Flare',
    subtitle: 'สุริยะเพลิงกัลป์',
    class: 'bg-gradient-to-r from-red-950 via-amber-950 to-zinc-950 border-amber-500/30',
    previewGradient: 'from-red-950 via-amber-950 to-zinc-950',
    accentBadge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    accentText: 'text-amber-400',
  },
];

export function getAvatarTheme(themeId?: string): AvatarBgTheme {
  const found = AVATAR_BG_THEMES.find((t) => t.id === themeId);
  return found || AVATAR_BG_THEMES[0]!;
}

export function getAvatarBgClass(themeId?: string): string {
  return getAvatarTheme(themeId).class;
}

export function getBannerTheme(themeId?: string): BannerTheme {
  const found = BANNER_THEMES.find((t) => t.id === themeId);
  return found || BANNER_THEMES[0]!;
}
