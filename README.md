# 🌸 SedChar.AI (Demo) — Thai Bot Character Studio

<div align="center">

![SedChar Banner](public/icons/icon-512x512.svg)

**สตูดิโอสร้างและแปลงข้อมูลตัวละครภาษาไทย Tag-Based สำหรับ Purrpaw, Rubii และ Khui AI**  
*9-Pillar Rich Prompts • Supabase Auth • 5 Calls/Day Quota • Cloud Library & Album • PWA Mobile Ready*

[![Next.js](https://img.shields.io/badge/Next.js-15.3-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38bdf8?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth_%26_DB-3ecf8e?style=flat-square&logo=supabase)](https://supabase.com/)
[![Vitest](https://img.shields.io/badge/Vitest-3.2-6e9f18?style=flat-square&logo=vitest)](https://vitest.dev/)
[![License](https://img.shields.io/badge/License-MIT-rose?style=flat-square)](LICENSE)

[ฟีเจอร์เด่น](#-ฟีเจอร์หลัก) • [9 เสาหลักคำสั่ง](#-โครงสร้างคำสั่ง-9-เสาหลัก) • [ระบบสมาชิกและคลัง](#-ระบบสมาชิกและ-cloud-library) • [แพลตฟอร์มที่รองรับ](#-แพลตฟอร์มที่รองรับ) • [การติดตั้ง](#-การติดตั้งและเริ่มใช้งาน)

</div>

---

## ✨ ฟีเจอร์หลัก (Key Features)

### 1. ⚡ Universal Multi-Format Parser (ระบบอ่านข้อมูลอเนกประสงค์)
- **รองรับทุกรูปแบบอินพุต**: วางข้อมูลได้ทันทีทั้ง **Plaintext (ข้อความบรรยายทั่วไป), Markdown, JSON และ YAML**
- **100% Two-Way Form Sync**: ข้อมูลเชื่อมโยงระหว่างโหมด *"ช่องแยกตามหัวข้อ (Structured Form)"* และโหมด *"ช่องเดียวรวด (Single Box)"* อย่างราบรื่น
- **Fuzzy Matching & Intelligent Inferrer**: ตรวจแก้คำสะกดผิดอัตโนมัติและแยกแยะหมวดหมู่เนื้อหาอย่างแม่นยำ
- **Smart Safety Flag Auto-Detection**: ประเมินธงพฤติกรรมตัวละคร (Green / Yellow / Red / Black / Watermelon Flag) พร้อมแสดง Badge และคำอธิบาย

### 2. 🔐 Supabase Auth & 5-Call Daily AI Quota (ระบบสมาชิกและโควตา)
- **Multi-Provider Login**: รองรับ **Google OAuth, Discord OAuth** และ Email/Password พร้อมระบบรีเซ็ตรหัสผ่าน
- **Access Gate**: สมาชิกที่เข้าสู่ระบบสามารถใช้งาน Auto-Parser วิเคราะห์แปลงข้อมูลได้ฟรี 5 ครั้ง/วัน (ระบบนับโควตาข้ามอุปกรณ์และรีเฟรชไม่หาย)
- **Zero-Data Leakage**: การสร้างและแสดงผล Prompt ทำงานในเครื่อง (Client-Side) 100%

### 3. 📁 Cloud Library & Album Gallery (คลังตัวละครและอัลบั้มชุดรูปภาพ)
- **Supabase Cloud Sync**: สำรองและกู้คืนตัวละครที่สร้างไว้กลับสู่ Editor ได้ในคลิกเดียว
- **Cloudflare Images / R2 Integration**: รองรับการระบุลิงก์รูปภาพหลัก (Avatar) และชุดรูปภาพสีหน้า/อารมณ์ (Gallery Set) ผ่าน Cloudflare Delivery CDN
- **Expression Album**: แท็บเปิดดูและคัดลอกชุดรูปภาพสีหน้าของตัวละครได้ตลอดเวลา

---

## 🏛️ โครงสร้างคำสั่ง 9 เสาหลัก (9-Pillar Architecture)

ระบบสร้าง Persona และ System Prompt ครอบคลุมลึกถึง 9 เสาหลัก เพื่อการสวมบทบาทที่สมจริงที่สุด:

| # | เสาหลัก | รายละเอียดในคำสั่ง |
|---|---|---|
| 1 | **ข้อมูลพื้นฐาน** | ชื่อ, อายุ, เพศ, MBTI, ฐานะ, รถยนต์, น้ำหอม, อาชีพ, สไตล์การแต่งตัว |
| 2 | **รูปลักษณ์ภายนอก** | สรีระ, จุดเด่น, รอยสัก, ทรงผม, แววตา |
| 3 | **สรีระส่วนลับ & NSFW** | ขนาด/สัดส่วน, รสนิยมบนเตียง (Kinks), สไตล์ Aftercare |
| 4 | **จิตวิทยา & นิสัย** | นิสัยหลัก, จิตวิทยา 7 ชั้น (Mindset, Triggers, Flaws) |
| 5 | **สิ่งที่ชอบ / สิ่งที่เกลียด** | รายการสิ่งที่โปรดปราน และสิ่งที่เกลียด/แพ้ทาง |
| 6 | **ความสัมพันธ์กับ {{user}}** | สถานะเริ่มต้น, ปูมหลังความสัมพันธ์, ทัศนคติที่มีต่อ {{user}} |
| 7 | **กฎระบบ & ข้อห้ามเด็ดขาด** | กฎเหล็กห้ามสวมบทบาทหรือแย่งพูดแทน {{user}}, พฤติกรรมที่ห้ามทำ |
| 8 | **ตัวละครเสริม (Sub-characters)** | รายชื่อตัวละครเสริม, บทบาท, จังหวะที่ปรากฏตัว, กฎการควบคุมบท |
| 9 | **สถานที่ & บรรยากาศ** | โทนของเรื่อง และสถานที่หลัก (Locations) กระชับแบบ Keyword |

---

## 📱 แพลตฟอร์มที่รองรับ (Target Platforms)

### 🐱 Purrpaw
- รูปแบบ: **Markdown Database**
- ความยาวเป้าหมาย: **18,000 – 30,000 ตัวอักษร**
- ระบบแยกตัวละครเสริมและสถานที่อย่างเป็นระเบียบ

### 💎 Rubii
- รูปแบบ: **Persona & System Prompt**
- รองรับ Gemini Token Estimation
- จัดโครงสร้างตามรูปแบบ `[Character(...)]` ครบทั้ง 9 เสาหลัก

### 💬 Khui AI
- รูปแบบ: **Structured System Directive**
- รองรับตัวละครเสริมสูงสุด 3 ตัว
- จัดระเบียบบทสนทนาและขอบเขตพฤติกรรม

---

## 🛠️ การติดตั้งและเริ่มใช้งาน (Local Development)

```bash
# 1. ติดตั้ง Dependencies
npm install

# 2. ตั้งค่าไฟล์ .env.local
NEXT_PUBLIC_SUPABASE_URL="your-supabase-url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"

# 3. รัน Dev Server
npm run dev

# 4. ทดสอบ Unit Tests
npm test
```

---

## 📄 License
MIT License — พัฒนาและออกแบบโดยทีมงาน SedChar.AI
