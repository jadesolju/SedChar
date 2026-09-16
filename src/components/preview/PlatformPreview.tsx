'use client';
import { useState, useMemo } from 'react';
import type { ThaiMasterCharacter, Platform } from '@/shared/types';
import {
  generateRubiiOutput,
  generatePurrpawOutput,
  generateKhuiOutput,
  characterToFullMarkdown,
  formatCount,
} from '@/shared/thaiTagParser';
import { CodeBlock } from './CodeBlock';
import { CopyButton } from '@/components/ui/CopyButton';

interface PlatformPreviewProps {
  character: ThaiMasterCharacter;
}

type TabType = 'rubii' | 'purrpaw' | 'khui' | 'master';

export function PlatformPreview({ character }: PlatformPreviewProps) {
  const [activeTab, setActiveTab] = useState<TabType>('purrpaw');

  const rubiiData = useMemo(() => generateRubiiOutput(character), [character]);
  const purrpawData = useMemo(() => generatePurrpawOutput(character), [character]);
  const khuiData = useMemo(() => generateKhuiOutput(character), [character]);
  const masterMarkdown = useMemo(() => characterToFullMarkdown(character), [character]);

  // Download export files
  const downloadFile = (format: 'txt' | 'md') => {
    let textToExport = '';
    const charName = character.fullName || character.nickname || 'character';

    if (activeTab === 'rubii') {
      textToExport = `=== [Rubii Export: ${rubiiData.name}] ===\n\n` +
        `[ชื่อตัวละคร]\n${rubiiData.name}\n\n` +
        `[คำอธิบายสาธารณะ]\n${rubiiData.publicDescription}\n\n` +
        `[การตั้งค่าตัวละคร (Persona Prompt + System Prompt)]\n${rubiiData.personaSystemPrompt}\n\n` +
        `[สร้างโมเมนต์]\n${rubiiData.momentIntro}\n\n` +
        `[เปิดเรื่อง (Open Greeting)]\n${rubiiData.openGreeting}`;
    } else if (activeTab === 'purrpaw') {
      textToExport = `=== [Purrpaw Export: ${purrpawData.name}] ===\n\n` +
        `[ชื่อตัวละคร]\n${purrpawData.name}\n\n` +
        `[TAGLINE]\n${purrpawData.tagline}\n\n` +
        `[แท็ก]\n${purrpawData.tags}\n\n` +
        `[ประวัติ & บุคลิกภาพตัวละคร]\n${purrpawData.historyPersonalityPrompt}\n\n` +
        `[ตัวละครเสริม]\n` + purrpawData.subCharacters.map((s, i) => `* ตัวละครเสริม #${i+1}: ${s.name}\nคำอธิบาย: ${s.shortDesc}\nบทบาท: ${s.systemPrompt}`).join('\n\n') + '\n\n' +
        `[สถานที่ในเรื่อง]\n` + purrpawData.locations.map(l => `* ${l.name}: ${l.prompt}`).join('\n') + '\n\n' +
        `[ความสัมพันธ์แรกเริ่ม]\n${purrpawData.initialRelationship}\n\n` +
        `[ข้อความแรกทักทาย]\n${purrpawData.openGreeting}`;
    } else if (activeTab === 'khui') {
      textToExport = `=== [Khui AI Export: ${khuiData.name}] ===\n\n` +
        `[ชื่อ]\n${khuiData.name}\n\n` +
        `[คำโปรย]\n${khuiData.tagline}\n\n` +
        `[System / Prompt]\n${khuiData.systemPrompt}\n\n` +
        `[หน้าคำอธิบายตัวละคร]\n${khuiData.characterDescription}\n\n` +
        `[Open Greeting]\n${khuiData.openGreeting}\n\n` +
        `[ตัวละครเสริม]\n` + khuiData.subCharacters.map(s => `* ${s.name}: ${s.description}`).join('\n') + '\n\n' +
        `[ความสัมพันธ์กับ {{user}} : สถานะการณ์-เนื้อเรื่องย่อ]\n${khuiData.userRelationshipScenario}\n\n` +
        `[แท็กตัวละคร]\n${khuiData.tags}`;
    } else {
      textToExport = masterMarkdown;
    }

    const blob = new Blob([textToExport], { type: format === 'md' ? 'text/markdown;charset=utf-8' : 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${charName}_${activeTab}.${format}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Get full current tab text for Copy All
  const currentTabFullText = useMemo(() => {
    if (activeTab === 'rubii') {
      return `[ชื่อตัวละคร]\n${rubiiData.name}\n\n[คำอธิบายสาธารณะ]\n${rubiiData.publicDescription}\n\n[การตั้งค่าตัวละคร]\n${rubiiData.personaSystemPrompt}\n\n[สร้างโมเมนต์]\n${rubiiData.momentIntro}\n\n[เปิดเรื่อง]\n${rubiiData.openGreeting}`;
    }
    if (activeTab === 'purrpaw') {
      return `[ชื่อตัวละคร]\n${purrpawData.name}\n\n[TAGLINE]\n${purrpawData.tagline}\n\n[แท็ก]\n${purrpawData.tags}\n\n[ประวัติ & บุคลิกภาพตัวละคร]\n${purrpawData.historyPersonalityPrompt}\n\n[ความสัมพันธ์แรกเริ่ม]\n${purrpawData.initialRelationship}\n\n[ข้อความแรกทักทาย]\n${purrpawData.openGreeting}`;
    }
    if (activeTab === 'khui') {
      return `[ชื่อ]\n${khuiData.name}\n\n[คำโปรย]\n${khuiData.tagline}\n\n[System Prompt]\n${khuiData.systemPrompt}\n\n[หน้าคำอธิบาย]\n${khuiData.characterDescription}\n\n[Open Greeting]\n${khuiData.openGreeting}\n\n[แท็ก]\n${khuiData.tags}`;
    }
    return masterMarkdown;
  }, [activeTab, rubiiData, purrpawData, khuiData, masterMarkdown]);

  return (
    <div className="flex flex-col h-full overflow-hidden bg-background">
      {/* Platform Tabs & Export Header */}
      <div className="flex-shrink-0 border-b border-border bg-card/70 px-4 py-2.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
          <button
            type="button"
            onClick={() => setActiveTab('purrpaw')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'purrpaw'
                ? 'bg-pink-500/15 text-pink-600 dark:text-pink-400 border border-pink-500/30 shadow-xs'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
            }`}
          >
            <span>🐱</span>
            <span>Purrpaw</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('rubii')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'rubii'
                ? 'bg-violet-500/15 text-violet-600 dark:text-violet-400 border border-violet-500/30 shadow-xs'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
            }`}
          >
            <span>🟣</span>
            <span>Rubii</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('khui')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'khui'
                ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 shadow-xs'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
            }`}
          >
            <span>💬</span>
            <span>Khui AI</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('master')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'master'
                ? 'bg-primary/15 text-primary border border-primary/30 shadow-xs'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
            }`}
          >
            <span>📄</span>
            <span>Full Markdown</span>
          </button>
        </div>

        {/* Export & Copy Menu */}
        <div className="flex items-center gap-1.5">
          <CopyButton text={currentTabFullText} />
          <button
            type="button"
            onClick={() => downloadFile('md')}
            className="text-xs px-2.5 py-1 rounded-md bg-secondary hover:bg-secondary/80 text-secondary-foreground border border-border transition-colors flex items-center gap-1 cursor-pointer"
            title="Download as Markdown (.md)"
          >
            <span>📥</span> .md
          </button>
          <button
            type="button"
            onClick={() => downloadFile('txt')}
            className="text-xs px-2.5 py-1 rounded-md bg-secondary hover:bg-secondary/80 text-secondary-foreground border border-border transition-colors flex items-center gap-1 cursor-pointer"
            title="Download as Text (.txt)"
          >
            <span>📥</span> .txt
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* ============================================================ */}
        {/* RUBII TAB */}
        {/* ============================================================ */}
        {activeTab === 'rubii' && (
          <div className="space-y-3.5">
            {/* Rubii Stat Banner */}
            <div className="p-3 rounded-xl border border-violet-500/20 bg-violet-500/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-base">🟣</span>
                <div>
                  <h3 className="text-xs font-bold text-violet-700 dark:text-violet-300">
                    Rubii Platform Output
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    แยก 5 ช่องสำหรับ Rubii พร้อมระบบนับ Token ของโมเดล Gemini
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2.5 py-1 rounded-full bg-violet-500/10 text-violet-700 dark:text-violet-300 font-mono font-semibold border border-violet-500/20">
                  ≈ {formatCount(rubiiData.tokenEstimate)} Tokens (Gemini)
                </span>
              </div>
            </div>

            <CodeBlock
              label="ขชื่อ (Name)"
              required={true}
              content={rubiiData.name}
            />

            <CodeBlock
              label="ขคำอธิบายสาธารณะ (Public Description)"
              content={rubiiData.publicDescription}
            />

            <CodeBlock
              label="ขการตั้งค่าตัวละคร (Persona Prompt + System Prompt)"
              required={true}
              hint="Profile, Appearance, Core Psychology, Boundaries, NSFW & System Constraints"
              content={rubiiData.personaSystemPrompt}
              countLabel={`≈ ${formatCount(rubiiData.tokenEstimate)} Tokens`}
            />

            <CodeBlock
              label="ขสร้างโมเมนต์ (Moment Intro)"
              required={true}
              hint="คำโปรยสั้นๆ"
              content={rubiiData.momentIntro}
              countLabel={`${rubiiData.momentIntro.length} ตัวอักษร`}
              maxConstraint="100"
              isOverLimit={rubiiData.momentIntro.length > 100}
            />

            <CodeBlock
              label="ขเปิดเรื่อง (Open Greeting)"
              required={true}
              hint="บรรยาย Sensory/Vivid สลับบทพูดตาม Expression"
              content={rubiiData.openGreeting}
              countLabel={`${formatCount(rubiiData.openGreeting.length)} ตัวอักษร`}
            />
          </div>
        )}

        {/* ============================================================ */}
        {/* PURRPAW TAB */}
        {/* ============================================================ */}
        {activeTab === 'purrpaw' && (
          <div className="space-y-3.5">
            {/* Purrpaw Stat & Progress Bar */}
            <div className="p-3 rounded-xl border border-pink-500/20 bg-pink-500/5 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-base">🐱</span>
                  <div>
                    <h3 className="text-xs font-bold text-pink-700 dark:text-pink-300">
                      Purrpaw Platform Output
                    </h3>
                    <p className="text-[11px] text-muted-foreground">
                      เป้าหมายแนะนำ 18,000 - 20,000 ตัวอักษร (สูงสุดไม่เกิน 30,000)
                    </p>
                  </div>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-mono font-bold border ${
                  purrpawData.charCount > 30000
                    ? 'bg-rose-500/15 text-rose-600 border-rose-500/30'
                    : purrpawData.charCount >= 18000 && purrpawData.charCount <= 25000
                    ? 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30'
                    : 'bg-amber-500/15 text-amber-600 border-amber-500/30'
                }`}>
                  {formatCount(purrpawData.charCount)} / 30,000 ตัวอักษร
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    purrpawData.charCount > 30000
                      ? 'bg-rose-500'
                      : purrpawData.charCount >= 18000
                      ? 'bg-emerald-500'
                      : 'bg-amber-500'
                  }`}
                  style={{ width: `${Math.min(100, (purrpawData.charCount / 30000) * 100)}%` }}
                />
              </div>
            </div>

            <CodeBlock
              label="- ชื่อตัวละคร"
              required={true}
              content={purrpawData.name}
            />

            <CodeBlock
              label="- TAGLINE (คำโปรยสั้นๆกระชับ)"
              content={purrpawData.tagline}
            />

            <CodeBlock
              label="- แท็ก (ตัวละคร)"
              content={purrpawData.tags}
            />

            <CodeBlock
              label="- ประวัติ & บุคลิกภาพตัวละคร (System Prompt + Persona Prompt)"
              required={true}
              hint="ประวัติ, ลักษณะภายนอก, NSFW, จิตวิทยา 7 มิติ, Logic เด็ดขาด, ความสัมพันธ์"
              content={purrpawData.historyPersonalityPrompt}
              countLabel={`${formatCount(purrpawData.historyPersonalityPrompt.length)} ตัวอักษร`}
              maxConstraint="30,000"
              isOverLimit={purrpawData.historyPersonalityPrompt.length > 30000}
            />

            {/* Sub Characters Cards */}
            <div className="rounded-xl border border-border bg-card p-3.5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <span>👥</span> - ตัวละครเสริม [สร้างได้ Max 5 ตัว] ({purrpawData.subCharacters.length}/5)
                </span>
              </div>

              {purrpawData.subCharacters.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">ไม่มีตัวละครเสริมที่ระบุ</p>
              ) : (
                <div className="space-y-3">
                  {purrpawData.subCharacters.map((sub, idx) => (
                    <div key={idx} className="p-3 rounded-lg border border-border/80 bg-muted/20 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-foreground">
                          * ชื่อตัวละครเสริม: <span className="text-primary">{sub.name || '-'}</span>
                        </span>
                        <CopyButton text={`[ตัวละครเสริม: ${sub.name}]\nคำอธิบาย: ${sub.shortDesc}\nบทบาท: ${sub.systemPrompt}`} />
                      </div>

                      <div className="text-xs space-y-1">
                        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                          <span>* คำอธิบายตัวละคร (หน้ารายละเอียด):</span>
                          <span>{sub.shortDesc.length}/500</span>
                        </div>
                        <p className="font-mono bg-card p-2 rounded border border-border text-foreground">
                          {sub.shortDesc || '-'}
                        </p>
                      </div>

                      <div className="text-xs space-y-1">
                        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                          <span>* บทบาทและตัวตน (System Prompt for subchar):</span>
                          <span>{sub.systemPrompt.length}/750</span>
                        </div>
                        <p className="font-mono bg-card p-2 rounded border border-border text-foreground">
                          {sub.systemPrompt || '-'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Locations Cards */}
            <div className="rounded-xl border border-border bg-card p-3.5 space-y-3">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <span>📍</span> - สถานที่ในเรื่อง (Max สุด 10 สถานที่) ({purrpawData.locations.length}/10)
              </span>

              {purrpawData.locations.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">ไม่มีสถานที่ที่ระบุ</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {purrpawData.locations.map((loc, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg border border-border bg-muted/20 space-y-1">
                      <div className="text-xs font-semibold text-foreground">
                        * {loc.name}
                      </div>
                      <div className="text-[11px] font-mono text-muted-foreground">
                        Prompt: {loc.prompt || '-'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <CodeBlock
              label="- ความสัมพันธ์แรกเริ่ม"
              content={purrpawData.initialRelationship}
            />

            <CodeBlock
              label="- ข้อความแรกทักทาย (Open Greeting)"
              required={true}
              content={purrpawData.openGreeting}
              countLabel={`${formatCount(purrpawData.openGreeting.length)} ตัวอักษร`}
            />
          </div>
        )}

        {/* ============================================================ */}
        {/* KHUI AI TAB */}
        {/* ============================================================ */}
        {activeTab === 'khui' && (
          <div className="space-y-3.5">
            <div className="p-3 rounded-xl border border-amber-500/20 bg-amber-500/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-base">💬</span>
                <div>
                  <h3 className="text-xs font-bold text-amber-700 dark:text-amber-300">
                    Khui AI Platform Output
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    รูปแบบสำหรับ Khui AI (รองรับตัวละครเสริมสูงสุด 3 ตัว)
                  </p>
                </div>
              </div>
              <span className="text-xs font-mono font-semibold text-amber-700 dark:text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                {formatCount(khuiData.charCount)} ตัวอักษร
              </span>
            </div>

            <CodeBlock label="ชื่อ" content={khuiData.name} />
            <CodeBlock label="คำโปรย" content={khuiData.tagline} />
            <CodeBlock label="System / Prompt" content={khuiData.systemPrompt} />
            <CodeBlock label="หน้าคำอธิบายตัวละคร" content={khuiData.characterDescription} />
            <CodeBlock label="Open Greeting" content={khuiData.openGreeting} />

            {/* Khui Sub Characters (Max 3) */}
            <div className="rounded-xl border border-border bg-card p-3.5 space-y-2">
              <span className="text-xs font-bold text-foreground">
                ตัวละครเสริม (Max 3 ตัว) — {khuiData.subCharacters.length}/3
              </span>
              {khuiData.subCharacters.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">ไม่มีตัวละครเสริม</p>
              ) : (
                <div className="space-y-2">
                  {khuiData.subCharacters.map((sub, idx) => (
                    <div key={idx} className="p-2 rounded bg-muted/30 border border-border text-xs flex justify-between items-center">
                      <div>
                        <span className="font-semibold">{sub.name}</span>
                        <span className="text-muted-foreground ml-2">— {sub.description}</span>
                      </div>
                      <CopyButton text={`${sub.name}: ${sub.description}`} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <CodeBlock
              label="ความสัมพันธ์กับ {{user}} : สถานการณ์-เนื้อเรื่องย่อ"
              content={khuiData.userRelationshipScenario}
            />

            <CodeBlock label="แท็กตัวละคร" content={khuiData.tags} />
          </div>
        )}

        {/* ============================================================ */}
        {/* MASTER MARKDOWN TAB */}
        {/* ============================================================ */}
        {activeTab === 'master' && (
          <div className="space-y-3">
            <div className="p-3 rounded-xl border border-primary/20 bg-primary/5 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-primary">Master Character Markdown</h3>
                <p className="text-[11px] text-muted-foreground">
                  เอกสาร Markdown ฉบับสมบูรณ์ตาม Template พร้อมโครงสร้างครบทุกหัวข้อ
                </p>
              </div>
              <span className="text-xs font-mono font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20">
                {formatCount(masterMarkdown.length)} ตัวอักษร
              </span>
            </div>

            <div className="rounded-xl border border-border bg-card p-4">
              <pre className="text-xs font-mono text-foreground whitespace-pre-wrap break-words leading-relaxed overflow-y-auto max-h-[700px]">
                {masterMarkdown}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
