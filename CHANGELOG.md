# 📜 Changelog — SedChar.AI

บันทึกประวัติการอัปเดตฟีเจอร์ โครงสร้างระบบ และหน้าบ้าน (Client / UI / Engine) ของ SedChar.AI

---

## [v1.0.0] — 2026-09-18 (Official Production Release 🚀)

### 🎯 Selective Platform Checkbox & Token Optimization (ระบบเลือกเปิด/ปิดการแปลงผลเพื่อประหยัด Token)
- **Interactive Platform Checkboxes**: เพิ่ม Checkbox ประจำแต่ละแท็บ (`☑ ✨ Purrpaw`, `☑ 🤖 Rubii`, `☑ 💬 Khui AI`, `☑ 📄 Master MD`) ให้ผู้ใช้เลือกติ๊กเปิด/ปิดการแปลงผลแต่ละแพลตฟอร์มได้อย่างอิสระ
- **Skip & Lazy Processing**: เมื่อ Uncheck แพลตฟอร์มใด ระบบจะข้ามการประมวลผล (Skip Generation) ทันที ช่วยลดภาระการทำงานเบื้องหลัง (CPU & Memory) และประหยัด AI Token อย่างแท้จริง
- **Disabled State UI**: แท็บที่ถูกปิดจะแสดงหน้าจอแจ้งสถานะอย่างชัดเจน พร้อมปุ่มลัดเพื่อเปิดใช้งานได้ในคลิกเดียว

### ⚡ Target Platform Selector in Auto-Parser (ระบบเลือกแพลตฟอร์มเป้าหมายในการแปลง)
- **Multi-Platform Target Bar**: เพิ่มแถบเลือกแพลตฟอร์มเป้าหมายใน SingleBoxInput (`🌐 ทุกแพลตฟอร์ม`, `🐾 Purrpaw`, `💎 Rubii`, `💬 Khui AI`)
- **Adaptive Detection Tags**: สลับและปรับปรุงรายการหมวดหมู่ตรวจจับตามข้อกำหนดเฉพาะของแต่ละแพลตฟอร์มโดยอัตโนมัติ

### 📝 Unified Markdown Prompts for Purrpaw & Rubii (รวมรูปแบบ Markdown มาตรฐาน)
- **Standardized Markdown Engine**: ปรับแต่งให้ `Rubii` ใช้งานโครงสร้างคำสั่ง Markdown System Prompt มาตรฐานตัวเดียวกับ `Purrpaw` (`buildPurrpawSystemPrompt`)
- **Rich Lore & Supporting Appends**: ส่งต่อข้อมูลตัวละครเสริม (Supporting Characters) ในรูปแบบ Structured Tag และ Lore Storage ต่อท้ายอย่างเป็นระเบียบ

### 💬 Khui AI Section Separation (แยกหมวดหมู่ Khui AI อย่างชัดเจน)
- **Independent Scenario / Plot Summary**: แยก Section 6 ออกมาเป็น `สถานการณ์ / พล็อตและเรื่องย่อ (Scenario & Plot Summary)` โดยดึงข้อมูลจาก *พล็อตและเรื่องย่อ (Plot Summary / Short Intro)* เท่านั้น
- **Dedicated User Relationship**: แยก Section 7 เป็น `ความสัมพันธ์และบทบาทกับ {{user}}` ดึงเฉพาะข้อมูลบทบาท, ความสัมพันธ์เริ่มต้น, ภูมิหลัง และทัศนคติที่มีต่อ {{user}}
- **Tags Section**: Section 8 สำหรับแท็กหมวดหมู่เนื้อหา

### 🎭 Form Greeting Simplification (ลดความซ้ำซ้อนของฟอร์มฉากเปิด)
- **Full Open Greeting Only**: ปรับปรุงหมวดที่ 10 ใน `InputForm` ให้เหลือเฉพาะ **`ฉากเปิดรวมทั้งหมด (Full Open Greeting) *`** ตัดช่องแยก Narrative/Dialogue เพื่อความกระชับและรวดเร็วในการกรอก

### 🔒 Enterprise-Grade Read-Only Sharing & Lockdown (ความปลอดภัยระดับสูงสุดของลิงก์แชร์)
- **Read-Only Banner Refinement**: ลบปุ่ม *บันทึกเป็นสำเนาของฉัน* ออกจากแถบ Read-Only ด้านบน 100% ป้องกันการ Clone หรือดัดแปลงไฟล์
- **Full Preview Lock**: ซ่อนปุ่ม `✏️ แก้ไข` ทุกจุดในโหมดอ่านอย่างเดียว ป้องกันการแก้ไขผ่าน CodeBlock และล็อกหน้าต่าง Fullscreen View เป็น Read-Only
- **CSPRNG Share Token Generation**: สุ่มรหัส Share Token ด้วย `crypto.getRandomValues()` ปลอดภัยต่อการคาดเดา
- **Base URL Header Injection**: ป้องกัน Header Injection ใน Share URL Resolver

### 👥 Sub-Character Hierarchy & UI Accordion (ระบบตัวละครเสริมความจุสูง)
- **Capacity Limits**: กำหนดขีดจำกัด Guest สูงสุด 8 ตัว และสมาชิกเข้าสู่ระบบสูงสุด 25 ตัว
- **Accordion Management**: จัดการตัวละครเสริมแบบพับเก็บได้ (Collapsible Accordion) ทำงานลื่นไหลแม้มีตัวละครจำนวนมาก
- **Structured Tag Generator**: ฟอร์แมตคำสั่งตัวละครเสริมเป็น Structured Tag `[ชื่อ]: ... | [เพศ]: ... | [อายุ]: ... | [บุคลิก]: ...`

---

## [v0.4.2] — 2026-09-17

### ⚡ Hybrid AI Provider (Next.js Server & Client Sync) & Auto-Fill Form
- **Instant Two-Way Form Auto-Fill**: ปรับปรุงระบบ Auto-Parser ให้ซิงค์และสลับหน้าจอเข้าสู่ **ช่องแยก 10 หมวดหมู่ (Structured Form)** ทันทีเมื่อแปลงข้อมูลสำเร็จ
- **AI Form Assistant Modal**: เพิ่มปุ่ม AI Assistant บนแถบเครื่องมือของ InputForm เลือก Auto-Fill เติมเต็มช่องว่าง หรือ Quick Parse ข้อความดิบ
- **Next.js & Node.js AI Server Architecture**: พัฒนา Backend Route `/api/ai/parse` และ `/api/ai/enhance` เชื่อมต่อ Google Gemini พร้อม Normalization และระบบ Local Universal Parser สำรองอัตโนมัติ

---

## [v0.4.1] — 2026-09-17

### ⚡ Google Gemini AI Auto-Parser & Quota Expansion
- **Google Gemini Engine**: เชื่อมต่อ Google Gemini API เข้ากับระบบ Auto-Parser ช่วยสกัดและวิเคราะห์โครงสร้างตัวละครภาษาไทยระดับลึก
- **15 Calls/Day AI Quota**: เพิ่มโควตาการใช้งาน AI รายวันเป็น **15 ครั้งต่อวัน** สำหรับสมาชิกที่เข้าสู่ระบบ
- **Hybrid Fallback Architecture**: หากอยู่ในสถานะออฟไลน์หรือไม่มีการเชื่อมต่อ API ระบบจะสลับไปใช้ Universal Local Parser ในเครื่องโดยอัตโนมัติ 100%

---

## [v0.4.0] — 2026-09-17

### 🧠 9-Pillar High-Density Prompts (โครงสร้างคำสั่งระดับลึก)
- **Rubii & Purrpaw Full-Density Expansion**: ยกระดับ System & Persona Prompt ให้ครอบคลุมครบทุกมิติ
- **Strict Anti-User-Impersonation Logic**: กฎเหล็กป้องกัน AI สวมบทบาทหรือแย่งพูดแทน {{user}} ในทุกแพลตฟอร์ม
- **Multi-Provider Authentication**: เข้าสู่ระบบผ่าน Google OAuth, Discord OAuth หรืออีเมล/รหัสผ่าน
- **Cloud Library & Album Gallery**: บันทึกและซิงค์ตัวละครทั้งหมดลงฐานข้อมูล ค้นหาและโหลดกลับเข้าสู่ Editor ได้ทันที

---

## [v0.3.0] — 2026-09-17

### 🎨 Visual & UI Polish
- **Luxe Rose Pink Theme**: ปรับชุดสีหลักของระบบเป็นโทนชมพูพรีเมียม (`#F43F5E`)
- **Matte Charcoal Form Fields**: ปรับพื้นหลังช่องกรอกข้อมูลทั้งหมดเป็นสีเทานุ่มตา (`#1F1F24`)
- **Smart Safety Flag Auto-Detection**: ระบบประเมินธงพฤติกรรมตัวละคร (8 ระดับ) จากเนื้อหาที่กรอกโดยอัตโนมัติ
- **Progressive Web App (PWA)**: ติดตั้งเว็บแอปบนหน้าจอมือถือได้ รองรับการทำงานออฟไลน์ผ่าน Service Worker

---

## [v0.2.0] — 2026-09-16
- เปิดตัวระบบ Zero-API Local Parser สำหรับตัวละครบอทไทย
- รองรับการสร้างและจัดการข้อมูลตัวละครเสริม (Sub-characters) และสถานที่ (Locations)
- เพิ่มระบบ Real-time Character Counter ตามขีดจำกัดของแต่ละแพลตฟอร์ม

---

## [v0.1.0] — 2026-09-15
- โครงสร้างเริ่มต้นระบบแปลงฟอร์มตัวละครภาษาไทย Tag-Based
