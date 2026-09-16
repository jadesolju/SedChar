# 🏛️ Zero-API Next.js & Node.js Intelligent Parser Architecture Guide
> **คู่มือออกแบบสถาปัตยกรรมระบบ Parser อัจฉริยะแบบ Local-First (Zero External API)**
> เน้นการประมวลผลข้อมูลภาษาไทยความเร็วสูง ยืดหยุ่น ปลอดภัย และขยายระบบได้ง่ายด้วย **Strategy / Plugin Pattern**, **Web Worker** และ **Grammar Rules Engine**

---

## 📐 1. ภาพรวมสถาปัตยกรรมระบบ (Architecture Overview)

การสร้างระบบ **Parser อัจฉริยะ** บน Next.js และ Node.js โดย **ไม่พึ่งพา External LLM / API (เช่น OpenAI, Gemini API)** แต่ยังต้องการความฉลาด ความเสถียร และความเร็วสูง สามารถทำได้โดยการใช้ **Deterministically Intelligent Pipeline Architecture**

```text
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                   CLIENT / SERVER INPUT                                 │
│                   (ข้อความตามใจชอบ / Markdown หลวมๆ / แท็กแบบไม่มีฟอร์แมต)                     │
└──────────────────────────────────────────┬──────────────────────────────────────────────┘
                                           │
                                           ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│ 🧵 1. CONCURRENCY & THREADING LAYER (Web Worker / Node Worker Threads)                   │
│   - แยก Thread ประมวลผลออกจาก UI Main Thread (ไม่กระตุก แม้ข้อมูลยาว 50,000+ ตัวอักษร)              │
└──────────────────────────────────────────┬──────────────────────────────────────────────┘
                                           │
                                           ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│ 🔍 2. PIPELINE PARSER ENGINE                                                            │
│   ┌─────────────────────────────────────────────────────────────────────────────────┐   │
│   │ 2.1 Lexer & Tokenizer                                                           │   │
│   │   - สแกนจับ Line, Heading, Bullet, Key-Value Pair, Tags (#tag), Context Anchor  │   │
│   ├─────────────────────────────────────────────────────────────────────────────────┤   │
│   │ 2.2 Extensible Grammar & Heuristic Engine                                       │   │
│   │   - ตรวจจับหัวข้อด้วย Rule-based Keyword Matching & Boundary Detection           │   │
│   │   - ซ่อมคำสะกดผิดด้วย Levenshtein Distance & Fuzzy Match                         │   │
│   ├─────────────────────────────────────────────────────────────────────────────────┤   │
│   │ 2.3 AST (Abstract Syntax Tree) & Intermediate Representation (IR) Construct     │   │
│   │   - แปลงข้อมูลดิบเข้าโครงสร้าง AST มาตรฐานกลาง                                           │   │
│   └─────────────────────────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────┬──────────────────────────────────────────────┘
                                           │
                                           ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│ 🛡️ 3. CUSTOM SCHEMA VALIDATION & AUTO-CORRECTION ENGINE                                  │
│   - ตรวจสอบความถูกต้องตาม Schema Definition (Zod-like / Custom Rule Validator)          │
│   - Auto-Correction & Fallback Engine เติมข้อมูลที่ขาดหายให้อัตโนมัติ (Dynamic Inference)      │
└──────────────────────────────────────────┬──────────────────────────────────────────────┘
                                           │
                                           ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│ 🔌 4. STRATEGY / PLUGIN FORMATTER LAYER (Plug-and-Play)                                  │
│   - [Plugin] Rubii Formatter          ➔  Prompt + Gemini Token Estimator                │
│   - [Plugin] Purrpaw Formatter        ➔  Markdown DB (18K-30K Chars)                     │
│   - [Plugin] Khui AI Formatter        ➔  Structured Prompt                              │
│   - [Plugin] Custom Output Formatter  ➔  (เพิ่ม Formatter ใหม่ได้ง่ายด้วย 1 Interface)   │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🧩 2. การออกแบบตามดีไซน์พัทเทิร์น (Design Patterns Breakdown)

### 2.1 Strategy / Plugin Pattern (Plug-and-Play Extensibility)
หลักการสำคัญคือ **"Open for Extension, Closed for Modification" (Solid - O)**
- **Core Engine** มีหน้าที่สกัดข้อมูลจากข้อความดิบให้เป็น **Canonical AST Data Model** กลาง
- **Output Plugins** ทำหน้าที่รับ AST ไปแปลงฟอร์แมตตามแพลตฟอร์มปลายทาง
- การเพิ่มแพลตฟอร์มใหม่ (เช่น ChatBot X, Character AI) สามารถทำได้โดยสร้างไฟล์ Plugin ใหม่ 1 ไฟล์ โดยไม่ต้องแตะต้อง Core Engine เล็กน้อยเลย

#### TypeScript Interface Specification:
```typescript
// src/core/types/plugin.ts

import type { MasterCharacterAST } from './ast';

export interface FormattingContext {
  targetLocale?: string;
  maxTokens?: number;
  includeSystemDirectives?: boolean;
}

export interface FormatResult {
  platformId: string;
  outputPayload: Record<string, unknown>;
  formattedText: string;
  charCount: number;
  estimatedTokens: number;
  warnings: string[];
}

/**
 * Strategy Interface สำหรับ Formatter Plugins
 */
export interface PlatformFormatterPlugin {
  readonly id: string;
  readonly name: string;
  readonly version: string;

  /**
   * แปลง Canonical AST ให้เป็นข้อมูลปลายทางตามข้อกำหนดของแพลตฟอร์ม
   */
  format(ast: MasterCharacterAST, context?: FormattingContext): FormatResult;
}
```

#### การลงทะเบียน Plugin (Plugin Registry):
```typescript
// src/core/registry/pluginRegistry.ts

import type { PlatformFormatterPlugin, FormatResult } from '../types/plugin';
import type { MasterCharacterAST } from '../types/ast';

export class FormatterPluginRegistry {
  private static instance: FormatterPluginRegistry;
  private plugins: Map<string, PlatformFormatterPlugin> = new Map();

  private constructor() {}

  public static getInstance(): FormatterPluginRegistry {
    if (!FormatterPluginRegistry.instance) {
      FormatterPluginRegistry.instance = new FormatterPluginRegistry();
    }
    return FormatterPluginRegistry.instance;
  }

  public register(plugin: PlatformFormatterPlugin): void {
    if (this.plugins.has(plugin.id)) {
      console.warn(`[PluginRegistry] Overwriting plugin with id: ${plugin.id}`);
    }
    this.plugins.set(plugin.id, plugin);
  }

  public get(pluginId: string): PlatformFormatterPlugin | undefined {
    return this.plugins.get(pluginId);
  }

  public formatAll(ast: MasterCharacterAST): Record<string, FormatResult> {
    const results: Record<string, FormatResult> = {};
    for (const [id, plugin] of this.plugins.entries()) {
      results[id] = plugin.format(ast);
    }
    return results;
  }
}
```

---

## 🧠 3. Extensible Grammar Engine & Fuzzy Resolution ("พิมพ์ตามใจชอบ")

หนึ่งในความท้าทายที่สุดของระบบที่ไม่พึ่ง AI คือ **"ผู้ใช้อยากพิมพ์อะไรก็พิมพ์ ไม่ตรงฟอร์ม พิมพ์ผิด มีคำสแลง"**

สถาปัตยกรรมนี้แก้ไขด้วย **3-Tier Fuzzy Rule Resolution**:

### Tier 1: Flexible Boundary Matcher (Regex Anchor + Context)
ใช้ Pattern Matching ที่ยืดหยุ่นจับ Keyword ที่คล้ายคลึงกัน
```typescript
// src/core/grammar/rules.ts

export interface GrammarRule {
  fieldKey: string;
  synonyms: RegExp[];
  priority: number;
}

export const CHARACTER_GRAMMAR_RULES: GrammarRule[] = [
  {
    fieldKey: 'name',
    synonyms: [
      /(?:ชื่อเล่น|ชื่อเต็ม|ชื่อตัวละคร|ชื่อ|เรียกว่า|ชื่อคือ|Name)\s*[:=─-]?\s*(.+)/i,
      /(?:ฉันชื่อ|เค้าชื่อ|ตัวละครชื่อ|นามว่า)\s*(.+)/i
    ],
    priority: 10
  },
  {
    fieldKey: 'personality',
    synonyms: [
      /(?:นิสัย|บุคลิก|ลักษณะนิสัย|นิสัยใจคอ|Personality|Traits?)\s*[:=─-]?\s*(.+)/i,
      /(?:เป็นคน|เป็นพวก)\s*(.+)/i
    ],
    priority: 8
  },
  {
    fieldKey: 'appearance',
    synonyms: [
      /(?:รูปลักษณ์|หน้าตา|การแต่งตัว|การแต่งกาย|ลักษณะภายนอก|Appearance|Looks)\s*[:=─-]?\s*(.+)/i,
      /(?:สูง|ผมสี|ตาโต|ใส่เสื้อ|หุ่นดี)\s*(.+)/i
    ],
    priority: 7
  }
];
```

### Tier 2: Levenshtein Distance (Spell Checking)
แก้คำพิมพ์ผิดอัตโนมัติ เช่น `"ซินเดเระ"`, `"ซึนเดเระ"` ➔ `"ซึนเดะระ"`

```typescript
// src/core/grammar/fuzzy.ts

export function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i]![0] = i;
  for (let j = 0; j <= n; j++) dp[0]![j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a.charAt(i - 1) === b.charAt(j - 1)) {
        dp[i]![j] = dp[i - 1]![j - 1]!;
      } else {
        dp[i]![j] = 1 + Math.min(dp[i - 1]![j - 1]!, dp[i]![j - 1]!, dp[i - 1]![j]!);
      }
    }
  }
  return dp[m]![n]!;
}

export function matchFuzzyTerm(input: string, dictionary: string[], maxDistance = 2): string {
  const cleanInput = input.trim().toLowerCase();
  for (const stdTerm of dictionary) {
    if (levenshteinDistance(cleanInput, stdTerm.toLowerCase()) <= maxDistance) {
      return stdTerm;
    }
  }
  return input;
}
```

---

## 🛡️ 4. Custom Schema Validation & Dynamic Dynamic Inference Engine

เมื่อ Parser สกัดข้อมูลดิบเข้า AST แล้ว ข้อมูลอาจไม่ครบถ้วน (เช่น ผู้ใช้พิมพ์แค่ชื่อกับนิสัย แต่ไม่ยอมใส่สรรพนาม หรือคำสั่งระบบ)

ระบบ **Dynamic Inference Engine** จะทำหน้าที่เป็น AI-like Heuristic ในการสังเคราะห์ข้อมูลที่ขาดไป:

```typescript
// src/core/schema/inferenceEngine.ts

import type { MasterCharacterAST } from '../types/ast';

export function validateAndInferAST(rawAST: Partial<MasterCharacterAST>): MasterCharacterAST {
  const name = rawAST.name?.trim() || 'ตัวละครนิรนาม';
  const traits = rawAST.traits && rawAST.traits.length > 0 ? rawAST.traits : ['ทั่วไป'];

  // สังเคราะห์สรรพนามอัตโนมัติหากไม่ได้ระบุ
  let pronouns = rawAST.pronouns || [];
  if (pronouns.length === 0) {
    if (rawAST.gender?.includes('หญิง') || rawAST.gender?.includes('สาว')) {
      pronouns = ['ฉัน', 'คุณ'];
    } else if (rawAST.gender?.includes('ชาย') || rawAST.gender?.includes('หนุ่ม')) {
      pronouns = ['ผม', 'คุณ'];
    } else {
      pronouns = ['ฉัน', 'คุณ'];
    }
  }

  // สังเคราะห์ System Directives บังคับคุมคาแรคเตอร์
  const systemDirectives = rawAST.systemDirectives || [];
  if (systemDirectives.length === 0) {
    systemDirectives.push(`สวมบทบาทเป็น ${name} อย่างเคร่งครัด`);
    systemDirectives.push(`รักษาเอกลักษณ์นิสัย: ${traits.join(', ')}`);
    systemDirectives.push(`ใช้สรรพนามแทนตัวเองและผู้ใช้: ${pronouns.join(' / ')}`);
  }

  // ตรวจจับ Flag ความสัมพันธ์
  const inferredFlag = rawAST.flagType || detectFlagFromText(traits.join(' ') + ' ' + (rawAST.bio || ''));

  return {
    name,
    gender: rawAST.gender || 'ไม่ระบุ',
    age: rawAST.age || 'ไม่ระบุ',
    pronouns,
    traits,
    appearance: rawAST.appearance || 'ไม่ระบุรายละเอียดภายนอก',
    bio: rawAST.bio || 'ไม่มีประวัติแน่ชัด',
    systemDirectives,
    flagType: inferredFlag,
    customFields: rawAST.customFields || {}
  };
}

function detectFlagFromText(text: string): string {
  if (/ซึนเดะระ|ซึนเดเระ|ปากร้ายใจดี|ดุแต่ใจดี/i.test(text)) return 'reverse-watermelon';
  if (/เจ้าเล่ห์|หน้าเนื้อใจเสือ/i.test(text)) return 'watermelon';
  if (/แสนดี|อบอุ่น|ให้เกียรติ/i.test(text)) return 'green';
  if (/toxic|บงการ|ครอบงำ/i.test(text)) return 'red';
  return 'none';
}
```

---

## 🧵 5. Web Worker Threading Architecture (Next.js / Node.js)

เพื่อป้องกันปัญหา UI ค้าง (Jank / Main Thread Freeze) เมื่อผู้ใช้วางข้อความขนาดใหญ่ (50,000+ ตัวอักษร) เราจะประมวลผล Parser ใน **Web Worker Background Thread**:

### Implementation สำหรับ Next.js Client Side:

```typescript
// src/workers/parser.worker.ts

import { FormatterPluginRegistry } from '../core/registry/pluginRegistry';
import { parseUnstructuredTextToAST } from '../core/parser/pipeline';
import { validateAndInferAST } from '../core/schema/inferenceEngine';

// Event Listener สำหรับรับงานจาก Main Thread
self.addEventListener('message', (event: MessageEvent<{ rawText: string }>) => {
  const { rawText } = event.data;

  try {
    // 1. Pipeline Parsing
    const rawAST = parseUnstructuredTextToAST(rawText);

    // 2. Schema Validation & Auto-Inference
    const finalAST = validateAndInferAST(rawAST);

    // 3. Format across registered plugins
    const formattedOutputs = FormatterPluginRegistry.getInstance().formatAll(finalAST);

    // 4. Return results to Main Thread
    self.postMessage({
      success: true,
      ast: finalAST,
      outputs: formattedOutputs
    });
  } catch (error) {
    self.postMessage({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown Parsing Error'
    });
  }
});
```

### React Custom Hook สำหรับ Next.js Component:

```typescript
// src/hooks/useWorkerParser.ts

import { useEffect, useRef, useState } from 'react';

export function useWorkerParser() {
  const workerRef = useRef<Worker | null>(null);
  const [parsing, setParsing] = useState(false);
  const [result, setResult] = useState<unknown>(null);

  useEffect(() => {
    // Instantiate Web Worker
    workerRef.current = new Worker(new URL('../workers/parser.worker.ts', import.meta.url));

    workerRef.current.onmessage = (event) => {
      setParsing(false);
      if (event.data.success) {
        setResult(event.data);
      }
    };

    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  const parseText = (rawText: string) => {
    if (!workerRef.current) return;
    setParsing(true);
    workerRef.current.postMessage({ rawText });
  };

  return { parseText, parsing, result };
}
```

---

## 🧪 6. ตัวอย่างการทดสอบอินพุตอิสระ ("พิมพ์ตามใจชอบ")

### กรณีศึกษาที่ 1: อินพุตหลวมๆ ไม่ตรงตามมาร์กดาวน์ฟอร์แมต
**ข้อความอินพุตจากผู้ใช้:**
> เค้าชื่อ โซล น้าา อายุ 22 เป็นคนเงียบๆ ปากแข็ง แต่จริงๆ ใจดีมากๆ สเปกคือชอบคนใส่ใจ
> หน้าตา: ผมสีเงิน ตาเทา ชอบใส่เสื้อโค้ทสีดำ สูง 185
> เรียกว่า ฉัน/นาย

**ผลลัพธ์ AST ที่ Parser สกัดได้ (ไร้ API):**
```json
{
  "name": "โซล",
  "age": "22",
  "gender": "ไม่ระบุ",
  "pronouns": ["ฉัน", "นาย"],
  "traits": ["เงียบขรึม", "ปากแข็ง", "ใจดี"],
  "appearance": "ผมสีเงิน ตาเทา ชอบใส่เสื้อโค้ทสีดำ สูง 185",
  "flagType": "reverse-watermelon",
  "systemDirectives": [
    "สวมบทบาทเป็น โซล อย่างเคร่งครัด",
    "รักษาเอกลักษณ์นิสัย: เงียบขรึม, ปากแข็ง, ใจดี",
    "ใช้สรรพนามแทนตัวเองและผู้ใช้: ฉัน / นาย"
  ]
}
```

---

## 🚀 7. สรุปจุดเด่นของสถาปัตยกรรมนี้

1. **Zero External API Dependency**: ไม่เสียค่า API, ไม่เสี่ยงเน็ตหลุด, ทำงานในเบราว์เซอร์ 100%
2. **Sub-millisecond Performance**: ใช้ Web Worker แยก Thread รัน Parser จบภายใน 2-5ms
3. **Flexible & Intelligent**: รองรับภาษาไทยหลวมๆ, คำสะกดผิด, คำสแลง ด้วย Levenshtein & Rules Engine
4. **Plug-and-Play Extensibility**: เพิ่มแพลตฟอร์มปลายทางใหม่ได้สะดวกด้วย Strategy / Plugin Pattern
