# 📜 Changelog — SedChar.AI (Demo)

บันทึกการอัปเดตฟีเจอร์และหน้าบ้าน (Client / UI) ของระบบ SedChar.AI

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
