# 🌸 SedChar.AI — Thai Roleplay Character Studio

<div align="center">

![SedChar Banner](public/icons/icon-512x512.svg)

**สตูดิโอสร้าง ออกแบบ และแปลงข้อมูลตัวละครภาษาไทย Tag-Based สำหรับ Purrpaw, Rubii และ Khui AI**  
*10-Category Rich Architecture • Multi-Platform Auto-Parser • Selective Checkbox Engine • Cloud Vault • PWA Ready*

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38bdf8?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth_%26_DB-3ecf8e?style=flat-square&logo=supabase)](https://supabase.com/)
[![Vitest](https://img.shields.io/badge/Vitest-3.2-6e9f18?style=flat-square&logo=vitest)](https://vitest.dev/)
[![License](https://img.shields.io/badge/License-MIT-rose?style=flat-square)](LICENSE)

[ฟีเจอร์เด่น](#-ฟีเจอร์หลัก) • [10 หมวดหมู่คำสั่ง](#-โครงสร้างคำสั่ง-10-หมวดหมู่หลัก) • [แพลตฟอร์มที่รองรับ](#-แพลตฟอร์มที่รองรับ) • [ความปลอดภัยและการแชร์](#-ความปลอดภัยและระบบ-read-only-sharing) • [การติดตั้ง](#-การติดตั้งและเริ่มใช้งาน)

</div>

---

## ✨ ฟีเจอร์หลัก (Key Features)

### 1. ⚡ Universal Multi-Format Auto-Parser (ระบบอ่านข้อมูลอเนกประสงค์)
- **รองรับทุกรูปแบบอินพุต**: วางข้อความได้ทันทีทั้ง **Plaintext (ข้อความบรรยายทั่วไป), Markdown, JSON และ YAML**
- **Target Platform Selector**: เลือกแพลตฟอร์มปลายทางที่ต้องการแปลง (`🌐 ทุกแพลตฟอร์ม`, `🐾 Purrpaw`, `💎 Rubii`, `💬 Khui AI`) เพื่อโฟกัสการสกัดข้อมูลเฉพาะส่วนที่จำเป็น
- **Hybrid AI Engine**: ประมวลผลร่วมกันระหว่าง Google Gemini AI และ Universal Local Regex Parser ทำงานได้ลื่นไหลแม้ขณะออฟไลน์
- **Two-Way Synchronization**: ซิงค์ข้อมูลระหว่างโหมด *"ช่องแยก 10 หมวดหมู่ (Structured Form)"* และโหมด *"ช่องเดียวรวด (Single Box)"* อย่างแม่นยำ

### 2. 🎯 Checkbox-Driven AI Token Scoping & Zero-Egress Architecture (ระบบควบคุม Token ด้วย Checkbox)
- **AI Payload Scoping**: ในหน้าต่าง **AI Enhance (Co-Creator)** สามารถติ๊กเลือกเฉพาะหมวดหมู่ (1-10 หมวด) และเลือกตัวละครเสริมที่ต้องการส่งให้ AI ช่วยลดขนาด Prompt และ **ประหยัด AI Token ลงได้ถึง 40-70%**
- **Zero Data Loss Guarantee**: ระบบ Smart Merge Engine จะรักษาข้อมูลเดิมที่คุณกรอกไว้ 100% และเติมเต็มเฉพาะช่องที่ยังว่างหรือเลือกไว้เท่านั้น
- **Instant In-Browser Formatter ($0 AI Token)**: การแปลงโครงสร้างคำสั่งของ Purrpaw, Rubii, Khui AI และ Master MD ประมวลผลในเบราว์เซอร์ด้วย JavaScript โดยไม่มีค่าใช้จ่าย Token และมี Checkbox ควบคุมการแสดงผล/ส่งออกแต่ละแท็บ
- **Lean AI Fallback & Server Quota Guard**: จำกัด Fallback สูงสุดเพียง 1 โมเดล พร้อม Timeout 12 วินาที และระบบตรวจสอบความปลอดภัย/Rate Limit ฝั่งเซิร์ฟเวอร์

### 3. 📝 Unified Markdown Persona Engine (โครงสร้าง Markdown มาตรฐาน)
- **Purrpaw & Rubii Standardization**: รวมโครงสร้างคำสั่ง System Prompt & Persona Prompt ของทั้งสองแพลตฟอร์มให้อยู่ในรูปแบบ Markdown คุณภาพสูงตัวเดียวกัน
- **Rich Lore & Storage**: รองรับการส่งต่อตัวละครเสริม (Supporting Characters) ในรูปแบบ Structured Tags และคลังข้อมูลส่วนเกิน (Garage Storage) อย่างครบถ้วน

### 4. 💬 Khui AI Clean Section Separation (การแยกส่วนผลลัพธ์ Khui AI)
- **Scenario & Plot Summary**: แยก Section 6 ออกมาเป็นสถานการณ์/พล็อตเรื่องย่อ ดึงข้อมูลจาก *พล็อตและเรื่องย่อ (Plot Summary)* เท่านั้น
- **User Relationship & Role**: Section 7 แยกความสัมพันธ์และบทบาทกับ {{user}} อย่างชัดเจน
- **Character Tags**: Section 8 สำหรับแท็กหมวดหมู่เนื้อหา

### 5. 🚩 8-Tier Character Flag System (ระบบวิเคราะห์ธงพฤติกรรม 8 ระดับ)
- วิเคราะห์ประเมินระดับความปลอดภัยและจิตวิทยาของตัวละครอัตโนมัติ:
  - `🟢 Green Flag` • `🟡 Yellow Flag` • `🔴 Red Flag` • `⚫ Black Flag`
  - `⚪ White Flag` • `🍉 Watermelon Flag` • `🔄 Reverse-Watermelon Flag` • `🚩 ยังไม่ได้ระบุ`

### 6. 🔒 Enterprise-Grade Read-Only Sharing (ระบบแชร์ที่ปลอดภัยสูงสุด)
- **Strict Read-Only Mode**: ล็อกการแก้ไขทุกจุดเมื่อเปิดดูผ่านลิงก์แชร์แบบอ่านอย่างเดียว ซ่อนปุ่มแก้ไข และล็อกหน้าต่างขยายเต็มจอ
- **No Clone/Modify**: นำปุ่มบันทึกสำเนาออก ป้องกันการคัดลอกหรือดัดแปลงผลงานของผู้สร้าง
- **CSPRNG Security**: สุ่ม Share Token ด้วย `crypto.getRandomValues()` ปลอดภัยต่อการเดารหัส

---

## 🏛️ โครงสร้างคำสั่ง 10 หมวดหมู่หลัก (10-Category Architecture)

| # | หมวดหมู่ | รายละเอียดในคำสั่ง |
|---|---|---|
| 1 | **ข้อมูลพื้นฐาน** | ชื่อเล่น, ชื่อเต็ม, อายุ, เพศ, สถานะ, วันเกิด, น้ำหนัก/ส่วนสูง, MBTI, รสนิยม, รถ, น้ำหอม, ที่อยู่, ฐานะ, อาชีพ, การแต่งกาย |
| 2 | **ลักษณะภายนอก** | รูปลักษณ์, จุดเด่น (Visual Features), Visual Tags |
| 3 | **สรีระส่วนลับ & NSFW** | ขนาดโจ้ย, ขนาดหน้าอก, จิ๊มิ, สไตล์บนเตียง (Sexual Style), Kinks, Aftercare |
| 4 | **จิตวิทยา 7 ข้อ & นิสัย** | ลักษณะเด่น, Personality Tags, Core Belief, Mindset, Perception, Expression, Emotion, Triggers, Flaws |
| 5 | **สิ่งที่ชอบ / สิ่งที่ไม่ชอบ** | รายการสิ่งที่ชอบ (Likes) และสิ่งที่ไม่ชอบ (Dislikes) |
| 6 | **พฤติกรรม & มิติ {{user}}** | พฤติกรรมทั่วไป, พฤติกรรมพิเศษเฉพาะกับ {{user}}, บทบาทของ {{user}}, ทัศนคติที่มีต่อ {{user}}, ภูมิหลังความสัมพันธ์ |
| 7 | **ขอบเขตพฤติกรรม & กฎระบบ** | สิ่งที่ไม่ทำเด็ดขาด (Anti-Behaviors), ด้านอ่อนโยน (Soft Side), ด้านมืด (Dark Side), โทนเรื่อง (Tone & Setting), กฎระบบ |
| 8 | **ตัวละครเสริม (Sub-characters)** | รองรับสูงสุด 8 ตัว (Guest) และ 25 ตัว (Member) พร้อม Accordion UI และ Tag-based System Prompt |
| 9 | **สถานที่ในเรื่อง (Locations)** | สถานที่สำคัญ (สูงสุด 10 สถานที่) พร้อมระบบสร้าง English Visual Prompt อัตโนมัติ |
| 10 | **คำโปรย & ฉากเปิด** | Short Intro, Punchline, เรื่องย่อ (Plot Summary), ข้อมูลสาธารณะ, Moment Intro, ฉากเปิดรวมทั้งหมด (Full Open Greeting) |
| 11 | **คลังข้อมูลส่วนเกิน (Garage Storage)** | ช่องสำหรับเก็บข้อมูลดิบ, Lore เสริม หรือ Prompt อิสระ |

---

## 📱 แพลตฟอร์มที่รองรับ (Target Platforms)

### 🐾 Purrpaw AI
- **รูปแบบ:** Rich Markdown Database
- **ขอบเขต:** ครอบคลุม 10 หมวดหมู่หลัก + ตัวละครเสริม (Max 5) + สถานที่ (Max 10 พร้อม English Visual Prompt) + ฉากเปิด

### 💎 Rubii AI
- **รูปแบบ:** Unified Markdown Persona Prompt
- **ขอบเขต:** Persona Prompt มาตรฐานเดียวกับ Purrpaw + Public Description + Moment Intro + Supporting Characters + Lore Storage

### 💬 Khui AI
- **รูปแบบ:** Structured Thai Keylist & Markdown Profile
- **ขอบเขต:** System Prompt + ข้อมูลเบื้องต้น + แยกพล็อตเรื่องย่อ + แยกความสัมพันธ์กับ {{user}} + ตัวละครเสริม (Max 3)

### 📄 Master Markdown (SedChar Standard)
- **รูปแบบ:** Master Markdown Schema ครบ 11 หมวดหมู่ พร้อมจัดเก็บหรือสำรองข้อมูล

---

## 🛠️ การติดตั้งและเริ่มใช้งาน (Local Development)

```bash
# 1. ติดตั้ง Dependencies
npm install

# 2. ตั้งค่าไฟล์ .env.local
NEXT_PUBLIC_SUPABASE_URL="your-supabase-url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
GEMINI_API_KEY="your-gemini-api-key"

# 3. รัน Development Server
npm run dev

# 4. ทดสอบ Unit Tests (Vitest)
npm test

# 5. Build สำหรับ Production
npm run build
```

---

## 📄 License
MIT License — พัฒนาและออกแบบโดยทีมงาน SedChar.AI
