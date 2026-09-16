# 🌸 SedChar.AI (Demo) — Thai Bot Character Studio

<div align="center">

![SedChar Banner](public/icons/icon-512x512.svg)

**สตูดิโอสร้างและแปลงข้อมูลตัวละครภาษาไทย Tag-Based สำหรับ Purrpaw, Rubii และ Khui AI**  
*Zero-API • 100% Client-Side Privacy • Multi-Format Universal Parser • PWA Mobile Ready*

[![Next.js](https://img.shields.io/badge/Next.js-15.3-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38bdf8?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Vitest-3.2-6e9f18?style=flat-square&logo=vitest)](https://vitest.dev/)
[![License](https://img.shields.io/badge/License-MIT-rose?style=flat-square)](LICENSE)

[ฟีเจอร์เด่น](#-ฟีเจอร์หลัก) • [แพลตฟอร์มที่รองรับ](#-แพลตฟอร์มที่รองรับ) • [การติดตั้งและใช้งาน](#-การติดตั้งและเริ่มใช้งาน) • [โครงสร้างโปรเจกต์](#-โครงสร้างโปรเจกต์)

</div>

---

## ✨ ฟีเจอร์หลัก (Key Features)

### 1. ⚡ Universal Multi-Format Parser (ระบบอ่านข้อมูลอเนกประสงค์)
- **รองรับทุกรูปแบบอินพุต**: วางข้อมูลได้ทันทีทั้ง **Plaintext (ข้อความบรรยายทั่วไป), Markdown, JSON และ YAML**
- **100% Two-Way Form Sync**: ข้อมูลเชื่อมโยงระหว่างโหมด *"ช่องแยกตามหัวข้อ (Structured Form)"* และโหมด *"ช่องเดียวรวด (Single Box)"* อย่างราบรื่น
- **Fuzzy Matching & Intelligent Inferrer**: ตรวจแก้คำสะกดผิดอัตโนมัติ (เช่น `"ซินเดเระ"` ➔ `"ซึนเดะระ"`) และช่วยจัดหมวดหมู่ข้อมูลอัตโนมัติ

### 2. 🎨 Luxe Rose Pink & Ergonomic UI (หน้าตาสวยงาม ทันสมัย)
- **Luxe Rose Pink Theme**: โทนสีชมพูพรีเมียม (`#F43F5E`) พร้อมตกแต่ง Badge **Demo** สวยหรู
- **Matte Charcoal Form Fields**: ช่องกรอกข้อมูลสีเทานุ่มตา (`#1F1F24`) ถนอมสายตา ไม่แสบตา และสลับ Dark / Light Mode ได้อย่างสมบูรณ์แบบ
- **SSR Hydration Safe**: ปราศจากปัญหา React Hydration Error โหลดหน้าเว็บได้เสถียรและรวดเร็ว

### 3. 🚩 Character Safety Flag Analysis (ระบบวิเคราะห์ธงตัวละคร 7 มิติ)
วิเคราะห์และประเมินระดับความสัมพันธ์/พฤติกรรมของตัวละครโดยอัตโนมัติ:
- 🏳️ **ธงขาว**: บริสุทธิ์ ยอมจำนน แสนดี ให้อภัยเสมอ
- 🟢 **ธงเขียว**: ปลอดภัย สบายใจ อบอุ่น ให้เกียรติ
- 🟡 **ธงเหลือง**: สัญญาณเตือน น่าสงสัย ต้องใช้เวลาประเมิน
- 🔴 **ธงแดง**: สัญญาณอันตราย เป็นพิษ (Toxic) ครอบงำ บงการ
- ⚫ **ธงดำ**: อันตรายสูงสุด ร้ายกาจ เป็นพิษรุนแรง ไร้ความเห็นใจ
- 🍉 **ธงแตงโม (เขียวนอก แดงใน)**: ภายนอกดูอบอุ่น แต่เนื้อในซ่อนความเจ้าเล่ห์ มีพิษสง
- 🍓 **ธงแตงโมกลับด้าน (แดงนอก เขียวใน)**: ภายนอกดูดุ เย็นชา แต่เนื้อแท้ข้างในแสนดี อ่อนโยน

### 4. 📦 Unified Smart Export & One-Click Copy
- **Dropdown Export Menu**: ดาวน์โหลดไฟล์สรุปตัวละครได้ในคลิกเดียวทั้ง **`.md` (Markdown)**, **`.txt` (Plaintext)** และ **`.json` (Structured Data)**
- **One-Click Copy**: คัดลอกแยกช่องตามแพลตฟอร์ม หรือคัดลอกรวมทั้งหมดได้ทันที

### 5. 📱 PWA & Mobile Optimization (รองรับมือถือเต็มรูปแบบ)
- **Progressive Web App**: ติดตั้งลงหน้าจอหลักสมาร์ตโฟน (Add to Home Screen) รองรับ Service Worker แคชออฟไลน์
- **Mobile Responsive Layout**: มีแท็บสลับมุมมองระหว่างโหมด **แก้ไขข้อมูล (Editor)** และ **ดูผลลัพธ์ (Preview)** ใช้งานง่ายบนมือถือ

---

## 🎯 แพลตฟอร์มที่รองรับ (Target Platforms)

| แพลตฟอร์ม | ขีดจำกัด / จุดเด่น | ฟิลด์ข้อมูลที่สร้างให้อัตโนมัติ |
| :--- | :--- | :--- |
| **🐱 Purrpaw** | เป้าหมาย 18,000–20,000 อักษร (Max 30,000) | ชื่อ, TAGLINE, แท็กตัวละคร, ประวัติ & บุคลิกภาพ, ตัวละครเสริม (5 ตัว), สถานที่ (10 จุด), ความสัมพันธ์แรกเริ่ม, Open Greeting |
| **🟣 Rubii** | คำนวณ Gemini Tokens พร้อม Progress Bar | ชื่อ, คำอธิบายสาธารณะ, Persona & System Prompt, สร้างโมเมนต์ (Max 100 อักษร), เปิดเรื่อง |
| **💬 Khui AI** | โครงสร้าง Tag-Based & Sub-Characters | ชื่อ, คำโปรย, System Prompt, หน้าคำอธิบายตัวละคร, Open Greeting, ตัวละครเสริม (3 ตัว), แท็กตัวละคร |
| **📜 Master Markdown** | มาตรฐานกลาง 25,000 ตัวอักษร | รวมทุกหัวข้อโครงสร้าง Tag-Based ภาษาไทย พร้อมนำไปประยุกต์ใช้ต่อได้ทุกระบบ |

---

## 🛠️ การติดตั้งและเริ่มใช้งาน (Getting Started)

### ความต้องการของระบบ (Prerequisites)
- [Node.js](https://nodejs.org/) version 18.17 หรือใหม่กว่า

### ขั้นตอนการรัน (Setup)

1. **Clone repository:**
   ```bash
   git clone https://github.com/jadesolju/SedChar.git
   cd SedChar
   ```

2. **ติดตั้ง Dependencies:**
   ```bash
   npm install
   ```

3. **รัน Development Server:**
   ```bash
   npm run dev
   ```
   เปิดเบราว์เซอร์ไปที่ [http://localhost:3000](http://localhost:3000)

4. **รัน Unit Tests (Vitest):**
   ```bash
   npm test
   ```

5. **ตรวจสอบ Type (TypeScript Check):**
   ```bash
   npm run typecheck # หรือ npx tsc --noEmit
   ```

---

## 📁 โครงสร้างโปรเจกต์ (Project Structure)

```text
SedChar/
├── src/
│   ├── app/
│   │   ├── globals.css              # Design Tokens & Theme Variables (Luxe Pink & Dark Mode)
│   │   ├── layout.tsx               # Root Layout, PWA Manifest & Hydration Protection
│   │   └── page.tsx                 # Split-screen Workspace & Mode Switcher
│   ├── components/
│   │   ├── form/
│   │   │   ├── FormSection.tsx      # Accordion Form Section component
│   │   │   ├── InputForm.tsx        # 10-section Structured Form
│   │   │   ├── SingleBoxInput.tsx   # Universal 1-Box Multi-Format Auto-Parser
│   │   │   └── TagInput.tsx         # Tag input chip component
│   │   ├── preview/
│   │   │   ├── CodeBlock.tsx        # Field card with individual copy & char counter
│   │   │   └── PlatformPreview.tsx  # Multi-platform preview tabs & unified export dropdown
│   │   └── ui/
│   │       ├── CharacterCounter.tsx # Visual character limit bar
│   │       ├── CopyButton.tsx       # Animated copy button
│   │       ├── FlagSelector.tsx     # 7-flag visual selector & auto analyzer
│   │       └── ThemeToggle.tsx      # SSR-safe Light/Dark mode switcher
│   ├── hooks/
│   │   ├── useCharacterData.ts      # State management, universal parser & 2-way sync
│   │   └── useTheme.ts              # Theme management & persistence
│   └── shared/
│       ├── intelligentParser.ts     # Levenshtein distance & fuzzy inference engine
│       ├── sampleCharacter.ts       # Rich Thai character preset
│       ├── thaiTagParser.ts         # Multi-format parser (Plaintext, MD, JSON, YAML) & platform generators
│       └── types.ts                 # TypeScript interfaces & safety flags
├── public/
│   ├── icons/                       # PWA Icons (192x192, 512x512, Apple Touch)
│   ├── manifest.json                # PWA Manifest configuration
│   └── sw.js                        # Offline Service Worker
├── CHANGELOG.md                     # บันทึกการอัปเดตระบบ
├── package.json
├── tailwind.config.js
└── README.md
```

---

## 🔒 Security & Privacy

โปรเจกต์นี้ทำงานแบบ **Zero-API & 100% In-Browser Local Execution**:
- ไม่มีการส่งข้อมูลตัวละครออกไปยังเซิร์ฟเวอร์ภายนอก ข้อมูลทุกอย่างประมวลผลบนเบราว์เซอร์ของผู้ใช้
- ไร้ความเสี่ยงเรื่องข้อมูลหรือไอเดียตัวละครรั่วไหล
- ใช้งานได้ทุกที่ แม้ไม่มีอินเทอร์เน็ต (ผ่าน PWA Offline Cache)

---

## 📄 License

MIT License © 2026 [jadesolju](https://github.com/jadesolju)
