# 🛠️ Parser Engine SKILL.md & Advanced Architectural Recommendations
> **แนวทางการออกแบบข้อกำหนดทักษะตัววิเคราะห์ (SKILL.md) และเทคโนโลยีสถาปัตยกรรมขั้นสูง**
> สำหรับระบบ **Next.js & Node.js Intelligent Parser Engine (Zero-API / Local-First)**

---

## 📜 1. ข้อกำหนดและสเปกการสร้าง `SKILL.md` (Parser Skill Specification)

แนวคิดการสร้าง **`SKILL.md`** คือการนิยาม "กฎความฉลาดและความเชี่ยวชาญของ Parser" ให้อยู่ในรูปแบบ **Declarative Specification** เพื่อให้วิศวกรหรือนักพัฒนาสามารถเพิ่ม ทบทวน หรือแก้ไขพฤติกรรมการวิเคราะห์ข้อความภาษาไทยได้ โดยไม่ต้องแก้โค้ดภาษา TypeScript หลัก

### โครงสร้างของไฟล์ `SKILL.md`
```markdown
---
name: thai-character-parser-skill
version: 1.0.0
description: ทักษะวิเคราะห์และสกัดข้อมูลตัวละครภาษาไทย พร้อมปรับปรุงคำสะกดผิดและเติมบริบทอัตโนมัติ
locale: th-TH
---

# 🧠 Intent & Boundary Recognition Rules

## 1. Intent Anchors (หัวข้อและเจตนา)
- **name_intent**:
  - RegEx: `(?:ชื่อเล่น|ชื่อเต็ม|ชื่อตัวละคร|ชื่อ|เรียกว่า|ชื่อคือ|Name)`
  - Examples: "ชื่อเล่น: โซล", "ฉันชื่อโซล", "เรียกว่า น้องเอ๋ย"
- **personality_intent**:
  - RegEx: `(?:นิสัย|บุคลิก|ลักษณะนิสัย|นิสัยใจคอ|Personality)`
  - Examples: "นิสัย: ซึนเดเระ ปากแข็ง", "เป็นคนร่าเริง แจ่มใส"

---

# 🪄 Dynamic Transformation & Fuzzy Dictionary

## 1. Personality Fuzzy Normalization Map
| Input Pattern (พิมพ์เพี้ยน/คำสแลง) | Standard Normalized Output | Priority |
| :-------------------------------- | :------------------------- | :------- |
| `ซินเดเระ`, `ซึนเดเระ`, `ปากร้ายใจดี`   | `ซึนเดะระ`                  | High     |
| `คลั่งรัก`, `ยันเดเระ`, `ยันเดระ`       | `ยันเดะระ`                  | High     |
| `คูล`, `เย็นชา`, `ขรึม`             | `คูลเดะระ`                  | Medium   |

## 2. Dynamic Slot Inferrer (การเติมช่องข้อมูลอัตโนมัติ)
- **If gender == "หญิง" AND pronouns is empty**:
  - Auto-fill pronouns: `["ฉัน", "คุณ"]`
- **If personality contains "ซึนเดะระ" AND reactionTriggers is empty**:
  - Auto-fill triggers: `["เมื่อโดนชม: หน้าแดง + ปฏิเสธว่า 'ไม่ได้อยากให้ชมซักหน่อย!'"]`

---

# 🚩 Character Relationship Flag Rules

- **Reverse Watermelon Flag (🍓 ธงแตงโมกลับด้าน)**:
  - Matcher: `(ปากร้าย|ดุ|เย็นชา) AND (ใจดี|อบอุ่น|ห่วงใย)`
- **Watermelon Flag (🍉 ธงแตงโม)**:
  - Matcher: `(อบอุ่น|หน้ายิ้ม) AND (เจ้าเล่ห์|บงการ|พิษสง)`
- **Green Flag (🟢 ธงเขียว)**:
  - Matcher: `อบอุ่น OR ให้เกียรติ OR ปลอดภัย OR แสนดี`
- **Red Flag (🔴 ธงแดง)**:
  - Matcher: `toxic OR ครอบงำ OR บงการ OR ควบคุม`
```

---

## 🏗️ 2. สถาปัตยกรรมเทคโนโลยีขั้นสูงเพิ่มเติม (Advanced Architecture Extensions)

นอกจาก **Strategy Pattern**, **Rules Engine** และ **Web Worker** แล้ว นี่คือ 4 สถาปัตยกรรมระดับสูงที่ช่วยยกระดับ Parser ของคุณให้ทำงานได้เหมือน AI ระดับโปรดักชัน:

```text
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                          ADVANCED LOCAL PARSER EXTENSIONS                               │
├───────────────────────────────────┬─────────────────────────────────────────────────────┤
│ ⚡ 1. WASM High-Speed Engine      │ High-performance Tokenization (Tree-sitter / Rust)  │
├───────────────────────────────────┼─────────────────────────────────────────────────────┤
│ 📐 2. Context-Free Grammar (CFG)  │ Formal AST Syntactic Parsing (Nearley.js / Chevrotain│
├───────────────────────────────────┼─────────────────────────────────────────────────────┤
│ ⚡ 3. Incremental Parsing        │ Real-time Delta/Diff AST Updates (Live Preview)     │
├───────────────────────────────────┼─────────────────────────────────────────────────────┤
│ 🔍 4. In-Browser Local Vector RAG │ Semantic Fuzzy Search with Micro Embeddings (Orama) │
└───────────────────────────────────┴─────────────────────────────────────────────────────┘
```

### 2.1 WebAssembly (WASM) High-Speed Tokenizer Engine
หากต้องการประมวลผลข้อความนิยายขนาดใหญ่มาก (100,000+ ตัวอักษร) การตัดคำภาษาไทยบน JS Native อาจมีข้อจำกัดเรื่องความเร็ว
- **แนวทาง**: ใช้ **Rust** Compile ลงเป็น **WASM (WebAssembly)** สำหรับทำ Thai Dictionary-based Word Segmentation (เช่น ใช้ `PyThaiNLP/dict` Port ลง Rust WASM)
- **ผลลัพธ์**: ประมวลผลเร็วกว่า JS Native ถึง 5 - 10 เท่า และรันบน Browser / Node.js ได้สม่ำเสมอ

### 2.2 Context-Free Grammar (CFG) & Parser Combinators
เปลี่ยนจาก Regex แปะติดชั่วคราว เป็น **Earley Parser** หรือ **PEG (Parsing Expression Grammar)** โดยใช้ Library เช่น `Nearley.js` หรือ `Chevrotain`
- **แนวทาง**: กำหนด Grammar Structure ชัดเจน (เช่น Definition = Header + KeyValuePairs + FreeText)
- **ประโยชน์**: ช่วยแก้ปัญหา Nested Data (โครงสร้างซ้อนกันหลายชั้น เช่น ข้อมูลตัวละครเสริมภายใต้สถานที่) ได้อย่างถูกต้อง 100% โดยไม่เกิด Regex backtracking bug

### 2.3 Incremental Real-time Parsing (Diff & Patch AST)
เวลาผู้ใช้พิมพ์แก้ข้อความในกล่อง Input ระบบไม่จำเป็นต้องเริ่มสแกนใหม่ตั้งแต่ตัวอักษรแรกจนถึงตัวสุดท้าย (Re-parse whole document)
- **แนวทาง**: ใช้ **Incremental AST Patching** ตรวจสอบเฉพาะบรรทัดที่มีการเปลี่ยนแปลง (Delta Diffing)
- **ผลลัพธ์**: Instant Live Preview อัปเดตการแสดงผลฝั่ง Output ได้ทันทีแบบ 0ms Latency

### 2.4 In-Browser Micro Vector Index (Local Semantic RAG)
หากคำในภาษาไทยเป็นคำสแลงหรือภาษาพูดอิสระที่ Levenshtein Distance จับไม่ได้
- **แนวทาง**: ใช้ **Orama Index / MiniSearch** หรือ Embeddings ขนาดเล็ก (TF-IDF / BM25 In-Browser Vector Store)
- **ประโยชน์**: สามารถจับความหมายระดับ Semantic (เช่น "เป็นพวกไม่สนใคร" ➔ จับเข้ากลุ่ม "คูลเดะระ / เย็นชา") ได้อย่างแม่นยำ 100% Local โดยไม่ต้องพึ่ง OpenAI API
