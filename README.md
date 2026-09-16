# 🤖 SedChar.AI — Intelligent Thai Character Parser Engine

> **โปรแกรมวิเคราะห์ แปลง และแยกส่วนข้อมูลตัวละครภาษาไทยอัจฉริยะ**  
> รองรับการจัดรูปแบบและสร้าง Prompt คุณภาพสูงสำหรับแพลตฟอร์ม **Rubii**, **Purrpaw**, และ **Khui AI**

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Vitest-Passing-green?style=flat&logo=vitest)](https://vitest.dev/)
[![License](https://img.shields.io/badge/License-MIT-purple.svg)](LICENSE)

---

## ✨ คุณสมบัติเด่น (Features)

### 1. 🔄 Dual Input Modes (2 โหมดการกรอก)
- **โหมดช่องเดียวรวด (Single-Box Markdown Auto-Parser)**: วางข้อมูล Markdown ทั้งชุด แล้วกดปุ่ม *"แปลง & แยกส่วนข้อมูลเข้าฟอร์มอัตโนมัติ"* ระบบจะตรวจจับหัวข้อ (Profile, Appearance, NSFW, Psychology, Sub-characters, Greeting ฯลฯ) และแยกส่วนลงฟอร์มทันที
- **โหมดช่องแยกตามหัวข้อ (Guided Template Form)**: ฟอร์ม 10 หมวดหมู่แบบ Accordion พร้อมคำใบ้และตัวอย่าง Placeholder ครบถ้วน รวมถึงปุ่ม *"โหลดตัวอย่าง Template"* สำหรับผู้ที่นึกไม่ออก

### 2. 🧠 Intelligent Thai Core Layer (ระบบประมวลผลภาษาไทยอัจฉริยะ)
- **Fuzzy Match Engine**: คำนวณความคล้ายคลึงของคำด้วย Levenshtein Distance ตรวจแก้คำสะกดผิดอัตโนมัติ (เช่น `"ซินเดเระ"` ➔ `"ซึนเดะระ"`)
- **Autocomplete & Semantic Inferrer**: สังเคราะห์สรรพนาม, ชุดคำสั่งควบคุมบทบาท (System Directives) และทริกเกอร์การตอบสนอง (Reaction Triggers) ตามนิสัยตัวละครให้อัตโนมัติ
- **Fallback Blueprint**: ป้องกันข้อมูลแหว่งหรือไม่สมบูรณ์ด้วย Default Preset มาตรฐาน

### 3. 🚩 Character Flag Analysis (ระบบวิเคราะห์ธงตัวละคร 7 มิติ)
วิเคราะห์และประเมินระดับความสัมพันธ์/อันตรายของตัวละคร พร้อม Badge สีสวยงาม:
- 🏳️ **ธงขาว**: บริสุทธิ์ ยอมจำนน แสนดี ให้อภัยเสมอ
- 🟢 **ธงเขียว**: ปลอดภัย สบายใจ อบอุ่น ให้เกียรติ
- 🟡 **ธงเหลือง**: สัญญาณเตือน น่าสงสัย ต้องใช้เวลาประเมิน
- 🔴 **ธงแดง**: สัญญาณอันตราย เป็นพิษ (Toxic) ครอบงำ บงการ
- ⚫ **ธงดำ**: อันตรายสูงสุด ร้ายกาจ เป็นพิษรุนแรง ไร้ความเห็นใจ
- 🍉 **ธงแตงโม (เขียวนอก แดงใน)**: ภายนอกดูอบอุ่น แต่เนื้อในซ่อนความเจ้าเล่ห์ มีพิษสง
- 🍓 **ธงแตงโมกลับด้าน (แดงนอก เขียวใน)**: ภายนอกดูดุ เย็นชา แต่เนื้อแท้ข้างในแสนดี อ่อนโยน

### 4. 🎯 แยกช่องผลลัพธ์ตามแต่ละแพลตฟอร์ม (Platform Outputs)
- **🟣 [Rubii]**:
  - `ขชื่อ*`
  - `ขคำอธิบายสาธารณะ`
  - `ขการตั้งค่าตัวละคร (Persona Prompt + System Prompt)*` พร้อมระบบคำนวณ Token ของ **Gemini** (`≈ Tokens`)
  - `ขสร้างโมเมนต์*` (จำกัด Max 100 ตัวอักษร)
  - `ขเปิดเรื่อง*` (Open Greeting)
- **🐱 [Purrpaw]**:
  - `- ชื่อตัวละคร*`
  - `- TAGLINE`
  - `- แท็ก (ตัวละคร)`
  - `- ประวัติ & บุคลิกภาพตัวละคร (System Prompt + Persona Prompt)` (เป้าหมายแนะนำ 18,000 - 20,000 ตัวอักษร, สูงสุด 30,000 ตัวอักษร พร้อม Progress Bar แจ้งเตือนสี)
  - `- ตัวละครเสริม` (สูงสุด 5 ตัว: ชื่อ, คำอธิบาย 0/500, บทบาท 0/750)
  - `- สถานที่ในเรื่อง` (สูงสุด 10 สถานที่: ชื่อ + Prompt สั้นกระชับ)
  - `- ความสัมพันธ์แรกเริ่ม`
  - `- ข้อความแรกทักทาย (Open Greeting)`
- **💬 [Khui AI]**:
  - `ชื่อ` / `คำโปรย` / `System Prompt` / `หน้าคำอธิบาย` / `Open Greeting`
  - `ตัวละครเสริม` (สูงสุด 3 ตัว) / `ความสัมพันธ์กับ {{user}}` / `แท็กตัวละคร`

### 5. 💾 Export & One-Click Copy
- คัดลอกแยกช่อง (Individual Field Copy)
- คัดลอกรวมทั้งหน้า (Copy All)
- Export ไฟล์เป็น **`.md`** และ **`.txt`**

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

2. **ติดตั้ง dependencies:**
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

---

## 📁 โครงสร้างโปรเจกต์ (Project Structure)

```text
SedChar/
├── src/
│   ├── app/
│   │   ├── globals.css              # Design Tokens & Light/Dark Theme Variables
│   │   ├── layout.tsx               # Root Layout
│   │   └── page.tsx                 # Split-screen Workspace & Mode Switcher
│   ├── components/
│   │   ├── form/
│   │   │   ├── FormSection.tsx      # Accordion Form Section component
│   │   │   ├── InputForm.tsx        # 10-section Guided Template Form
│   │   │   ├── SingleBoxInput.tsx   # 1-box Markdown Auto-Parser
│   │   │   └── TagInput.tsx         # Tag input chip component
│   │   ├── preview/
│   │   │   ├── CodeBlock.tsx        # Field card with individual copy & char counter
│   │   │   └── PlatformPreview.tsx  # Tabs for Rubii, Purrpaw, Khui & Full Markdown
│   │   └── ui/
│   │       ├── CharacterCounter.tsx # Visual character limit bar
│   │       ├── CopyButton.tsx       # Animated copy button
│   │       ├── FlagSelector.tsx     # 7-flag visual selector & auto analyzer
│   │       └── ThemeToggle.tsx      # Light/Dark mode switcher
│   ├── hooks/
│   │   ├── useCharacterData.ts      # State management, parser & sync hook
│   │   └── useTheme.ts              # Theme management
│   └── shared/
│       ├── intelligentParser.ts     # Levenshtein distance & fuzzy inference engine
│       ├── intelligentParser.test.ts # Intelligence layer test suite
│       ├── sampleCharacter.ts       # Rich Thai character template preset
│       ├── thaiTagParser.ts         # Regex parser, flag analyzer & platform generators
│       ├── thaiTagParser.test.ts    # Comprehensive test suite
│       └── types.ts                 # Strict TypeScript definitions (zero any)
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── README.md
```

---

## 🔒 Security & Privacy

โปรเจกต์นี้ทำงานแบบ **Client-Side / Local In-Browser 100%**:
- ไม่มีการส่งข้อมูลตัวละครออกไปยังเซิร์ฟเวอร์ภายนอก
- ไม่มีการเก็บหรือบันทึก API Key หรือ Environment Variables ใดๆ
- ปลอดภัย ไร้กังวลเรื่องข้อมูลรั่วไหล

---

## 📄 License

MIT License © 2026 [jadesolju](https://github.com/jadesolju)
