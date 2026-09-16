# 📜 Changelog — SedChar.AI (Demo)

บันทึกการอัปเดตฟีเจอร์และหน้าบ้าน (Client / UI) ของระบบ SedChar.AI

---

## [v0.4.1] — 2026-09-17

### ⚡ Google Gemini 3.6 Flash AI Auto-Parser & Quota Expansion
- **Google Gemini 3.6 Flash Engine**: เชื่อมต่อ Google Gemini API เข้ากับระบบ Auto-Parser ช่วยสกัดและวิเคราะห์โครงสร้างตัวละครภาษาไทยระดับลึก
- **15 Calls/Day AI Quota**: เพิ่มโควตาการใช้งาน AI รายวันเป็น **15 ครั้งต่อวัน** สำหรับสมาชิกที่เข้าสู่ระบบ
- **Hybrid Fallback Architecture**: หากอยู่ในสถานะออฟไลน์หรือไม่มีการเชื่อมต่อ API ระบบจะสลับไปใช้ Universal Local Parser ในเครื่องโดยอัตโนมัติ 100%

---

## [v0.4.0] — 2026-09-17

### 🧠 9-Pillar High-Density Prompts (โครงสร้างคำสั่งระดับลึก 9 เสาหลัก)
- **Rubii & Purrpaw Full-Density Expansion**: ยกระดับ System & Persona Prompt ให้ครอบคลุมครบ 9 เสาหลัก:
  1. ✓ ข้อมูลพื้นฐาน (Basic Info, Status, Wealth, Car, Perfume)
  2. ✓ รูปลักษณ์ภายนอกและลักษณะเด่น (Visual Features & Appearance)
  3. ✓ สรีระส่วนลับและพฤติกรรม NSFW (Intimate details, Kinks, Aftercare)
  4. ✓ โครงสร้างจิตวิทยา & นิสัย (Psychology, Mindset, Emotional Triggers)
  5. ✓ สิ่งที่ชอบ / สิ่งที่เกลียด (Likes & Dislikes)
  6. ✓ มิติความสัมพันธ์กับ {{user}} (User Dynamics & Attitude)
  7. ✓ กฎระบบและข้อห้ามเด็ดขาด (Strict System Directives & Logic Constraints)
  8. ✓ ตัวละครเสริมในเรื่อง (Supporting Characters & Sub-character Rules)
  9. ✓ สถานที่และบรรยากาศ (Tone & Ambient Locations)
- **Strict Anti-User-Impersonation Logic**: กฎเหล็กป้องกัน AI สวมบทบาทหรือแย่งพูดแทน {{user}} ในทุกแพลตฟอร์ม

### 🔐 Supabase Auth & Member Access Gate (ระบบสมาชิกและสิทธิ์การใช้งาน)
- **Multi-Provider Authentication**: เข้าสู่ระบบผ่าน **Google OAuth, Discord OAuth** หรือใช้อีเมล/รหัสผ่าน พร้อมระบบลืมรหัสผ่าน (Password Reset)
- **Auto-Parser Login Gate**: สงวนสิทธิ์การใช้งาน Auto-Parser (ระบบวิเคราะห์แปลงข้อมูลอัจฉริยะ) สำหรับสมาชิกที่เข้าสู่ระบบ
- **5 Calls/Day Persistent AI Quota**: โควตา AI แปลงข้อมูลฟรี 5 ครั้งต่อวัน บันทึกข้ามอุปกรณ์และรีเฟรชหน้าเว็บไม่หาย

### 📁 Cloud Library & Album Gallery (คลังตัวละครและอัลบั้มชุดรูปภาพ)
- **Cloud Character Storage**: บันทึกและซิงค์ตัวละครทั้งหมดลงฐานข้อมูล Supabase เรียกใช้งานและโหลดกลับเข้าสู่ Editor ได้ทันที
- **Cloudflare Images & Gallery Support**: รองรับการเชื่อมต่อลิงก์รูปภาพจาก Cloudflare Images Delivery และ Cloudflare R2 พร้อมระบบอัลบั้มแสดงชุดภาพสีหน้า/อารมณ์/เครื่องแต่งกาย
- **Quick-Save & Search**: ค้นหาตัวละครในคลังได้อย่างรวดเร็วและบันทึกข้อมูลตัวละครปัจจุบันได้ในคลิกเดียว

---

## [v0.3.0] — 2026-09-17

### 🎨 Visual & UI Polish (การปรับแต่งหน้าตาและธีม)
- **Luxe Rose Pink Theme**: ปรับชุดสีหลักของระบบเป็นโทนชมพูพรีเมียม (`#F43F5E`) พร้อมตกแต่ง Badge **Demo** ที่ Header
- **Matte Charcoal Form Fields**: ปรับพื้นหลังช่องกรอกข้อมูลทั้งหมดเป็นสีเทานุ่มตา (`#1F1F24`) สอดรับกับทั้ง Dark / Light Mode โดยไม่ใช้การ Hardcode สี
- **Header & Navbar Cleanup**: ลดความซ้ำซ้อนของ Header จัดการปุ่มสลับโหมดและปุ่มสลับธีมให้สะอาดตา ใช้งานง่าย
- **SSR Hydration Fix**: ปรับปรุงกลไกการโหลดปุ่ม Theme ให้ปลอดภัยจาก React Hydration Mismatch โหลดได้เสถียร 100%

### ⚡ Universal Multi-Format Parser (ระบบอ่านข้อมูลอัจฉริยะ)
- **Multi-Format Input Support**: รองรับการวางและแปลงข้อมูลตัวละครจากทุกรูปแบบ ทั้ง **Plaintext, Markdown, JSON และ YAML**
- **100% Two-Way Form Sync**: ระบบเชื่อมโยงข้อมูลระหว่างโหมด "ช่องแยกตามหัวข้อ (Structured)" และโหมด "ช่องเดียวรวด (Single Box)" อย่างสมบูรณ์แบบ
- **Smart Safety Flag Auto-Detection**: ปรับระบบประเมินธงพฤติกรรมตัวละคร (Green / Yellow / Red / Black Flag) จากเนื้อหาที่กรอกโดยอัตโนมัติ

### 📦 Platform Preview & Smart Export (การแสดงผลและส่งออกข้อมูล)
- **Unified Export Dropdown**: ปรับปุ่มส่งออกให้เป็นเมนู Dropdown เลือกดาวน์โหลดเป็นไฟล์ `.md`, `.txt` หรือ `.json` ได้ทันที
- **Multi-Platform Real-time Preview**: พรีวิวรูปแบบคำสั่งและตัวนับจำนวนตัวอักษรสำหรับ **Purrpaw, Rubii, Khui AI** และ **Master Markdown**
- **One-Click Clipboard**: คัดลอกผลลัพธ์แยกตามแต่ละแพลตฟอร์มได้อย่างรวดเร็ว

### 📱 PWA & Mobile Usability (การรองรับบนสมาร์ตโฟน)
- **Progressive Web App (PWA)**: ติดตั้งเว็บแอปบนหน้าจอมือถือ (Home Screen) ได้ รองรับการทำงานออฟไลน์ผ่าน Service Worker
- **Adaptive Mobile Layout**: เพิ่มแท็บสลับมุมมองระหว่างโหมด "แก้ไขฟอร์ม (Editor)" และ "ดูผลลัพธ์ (Preview)" บนหน้าจอมือถือ

---

## [v0.2.0] — 2026-09-16
- เปิดตัวระบบ Zero-API Local Parser สำหรับตัวละครบอทไทย
- รองรับการสร้างและจัดการข้อมูลตัวละครเสริม (Sub-characters) และสถานที่ (Locations)
- เพิ่มระบบ Real-time Character Counter ตามขีดจำกัดของแต่ละแพลตฟอร์ม

---

## [v0.1.0] — 2026-09-15
- โครงสร้างเริ่มต้นระบบแปลงฟอร์มตัวละครภาษาไทย Tag-Based
