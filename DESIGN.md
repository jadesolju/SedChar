# 🎨 SedChar.AI — Design System & UI/UX Guidelines (DESIGN.md)

คู่มือและมาตรฐานการออกแบบ UI/UX สถาปัตยกรรม Pop-up / Modal และระบบ Theming สำหรับ SedChar.AI

---

## 1. 🎯 ปรัชญาการออกแบบ (Design Philosophy)

1. **Mobile-First Single-Column / Single-Grid**:
   - หน้าจอสมาร์ตโฟนต้องเรียบง่าย คมชัด ไม่อัดแน่น และไม่บีบตัวอักษรให้อยู่ในคอลัมน์แคบ
   - หลีกเลี่ยงการวาง Title + Subtitle ยาว ๆ ในแถวแนวนอนเดียวกันกับปุ่ม/แท็บควบคุมบนหน้าจอมือถือ
2. **100% Theme Adaptive (Strict Light / Dark Compliance)**:
   - ระบบรองรับทั้ง **Light Mode** และ **Dark Mode** อย่างสมบูรณ์
   - **ห้าม Hardcode สีตายตัว** เช่น `text-white` บนพื้นหลังที่สามารถเปลี่ยนเป็นสีสว่างได้
3. **Ergonomic Touch Targets**:
   - ปุ่มกดทุกปุ่มบนมือถือต้องมีขนาดพื้นที่สัมผัสอย่างน้อย **44px × 44px** หรือจัดเรียงเป็น Grid เต็มความกว้างเพื่อความสะดวกในการแตะด้วยนิ้วหัวแม่มือ

---

## 2. 🪟 สถาปัตยกรรม Pop-up & Modal บนหน้าจอมือถือ (Modal Layout Rules)

### ❌ ปัญหาที่ห้ามทำ (Anti-Patterns):
- **ห้ามใช้ Single-Row Flex สำหรับ Header บนมือถือ**: การใส่ Icon + Title + Subtitle + Action Tabs + Dropdown + Close Button ใน `flex items-center justify-between` แถวเดียว จะบีบให้ Title หักบรรทัดเป็นคำละ 1 แถว (เช่น "คลังตัว" / "ละคร" / "Cloud")

### ✅ รูปแบบมาตรฐานที่ต้องใช้ (Standard Stacked Header Pattern):

```tsx
{/* Modal Top Header Container */}
<div className="flex-shrink-0 flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:px-6 sm:py-4 border-b border-border bg-muted/30 gap-3 sm:gap-4">
  
  {/* Row 1 on Mobile: Icon, Title & Mobile Close Button */}
  <div className="flex items-start justify-between sm:justify-start gap-3 min-w-0 flex-1">
    <div className="flex items-start gap-2.5 sm:gap-3 min-w-0">
      <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-500 to-pink-600 text-white flex items-center justify-center font-bold text-base shadow-sm flex-shrink-0 mt-0.5 sm:mt-0">
        ✨
      </div>
      <div className="min-w-0">
        <h2 className="text-sm sm:text-base font-bold text-foreground flex items-center gap-2">
          หัวข้อป๊อปอัป (Title)
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
          คำอธิบายฟังก์ชันการทำงานแบบเต็มความกว้าง ไม่โดนเบียด
        </p>
      </div>
    </div>

    {/* Close Button on Mobile (มุมบนขวาของแถวที่ 1) */}
    <button
      type="button"
      onClick={onClose}
      className="sm:hidden w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer flex-shrink-0"
    >
      <X className="w-4 h-4" />
    </button>
  </div>

  {/* Row 2 on Mobile: Tabs / Controls & Desktop Close Button */}
  <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto flex-shrink-0 pt-2 sm:pt-0 border-t border-border/40 sm:border-t-0">
    {/* Full-width Grid Buttons on Mobile */}
    <div className="grid grid-cols-2 sm:flex rounded-lg bg-muted p-0.5 border border-border w-full sm:w-auto">
      {/* Tab Buttons */}
    </div>

    {/* Close Button on Desktop */}
    <button
      type="button"
      onClick={onClose}
      className="hidden sm:flex w-8 h-8 rounded-lg items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
    >
      <X className="w-4 h-4" />
    </button>
  </div>
</div>
```

---

## 3. 🎨 ระบบ Semantic Color Tokens (Theming Matrix)

| Token Class | ความหมาย & การใช้งาน | Light Theme | Dark Theme |
| :--- | :--- | :--- | :--- |
| `text-foreground` | ข้อความหลัก / Title / Heading | สีดำเข้ม (`#09090b`) | สีขาวนวล (`#fafafa`) |
| `text-muted-foreground` | ข้อความรอง / Subtitle / คำใบ้ | สีเทากลาง (`#71717a`) | สีเทาอ่อน (`#a1a1aa`) |
| `bg-background` | พื้นหลังหลักของหน้าเว็บ | สีขาว (`#ffffff`) | สีดำเข้ม (`#09090b`) |
| `bg-card` | พื้นหลังของการ์ดและ Modal | สีขาว/เทาอ่อนมาก | สีเทาเข้ม (`#18181b`) |
| `bg-muted` | พื้นหลังปุ่มรอง / Toolbar / Tabs | สีเทาอ่อน (`#f4f4f5`) | สีเทาเข้ม (`#27272a`) |
| `border-border` | เส้นขอบมาตรฐาน | สีเทาจาง (`#e4e4e7`) | สีเทาเข้ม (`#27272a`) |
| `text-primary` / `bg-primary` | สีแบรนด์หลัก (Rose Pink) | `#f43f5e` | `#f43f5e` |

> **กฎเหล็กเรื่องสี (Color Rule):**
> ห้ามใช้ `text-white` ยกเว้นกรณีเดียวคือตัวอักษรที่อยู่บนปุ่ม Solid Brand สีเข้ม เช่น `bg-primary text-white` หรือ `bg-rose-500 text-white` เท่านั้น หากเป็น Heading ทั่วไปต้องใช้ **`text-foreground`** เสมอ

---

## 4. 📱 สรุปการปรับใช้ในคอมโพเนนต์หลัก (Component Checklist)

### 1. `AIAssistantModal.tsx` (SedChar AI Co-Creator)
- [x] แก้ไข Heading จาก `text-white` เป็น **`text-foreground`** (อ่านออก 100% ใน Light Theme)
- [x] ปรับ Header เป็น 2-Row Layout บนมือถือ (Row 1: Title + Subtitle + Close X, Row 2: Model Dropdown)
- [x] ปรับ Tab & Quota Strip ให้เป็น `grid grid-cols-2` เต็มความกว้างบนมือถือ

### 2. `CharacterLibraryModal.tsx` (Cloud Library)
- [x] ปรับ Header เป็น 2-Row Layout บนมือถือ ไม่บีบชื่อคลังตัวละคร
- [x] แท็บสลับ "รายการตัวละคร" และ "บันทึกตัวละครปัจจุบัน" ขยายเต็มความกว้างบนมือถือ

### 3. `CodeBlock.tsx` (Preview Panel & Fullscreen Modal)
- [x] การ์ด Preview แยก 2 แถวบนมือถือ (แถวบน: Field Name, แถวล่าง: Counter + Action Buttons)
- [x] Fullscreen Modal Header แยก 2 แถวบนมือถือ พร้อมปุ่มคัดลอกและปิดเต็มขนาด

### 4. `SingleBoxInput.tsx` (Auto-Parser Workspace)
- [x] ปุ่มควบคุมด้านบน (เต็มจอ / ตัวอย่าง / ล้าง) แสดงข้อความชัดเจนบนมือถือ
- [x] แถบเลือกโมเดล/แพลตฟอร์มเป้าหมายปรับเป็น 1 แถวเลื่อนหรือ Grid เรียบร้อย

---

*เอกสารฉบับนี้จัดทำเพื่อเป็นคู่มือมาตรฐาน UI/UX สำหรับ SedChar.AI*