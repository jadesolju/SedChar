'use client';
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import type { ThaiMasterCharacter } from '@/shared/types';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCharacter: ThaiMasterCharacter;
  onApplyCharacter: (char: ThaiMasterCharacter, notice: string) => void;
}

const AVAILABLE_MODELS = [
  { id: 'auto', name: '⚡ Auto (Google Gemini 3.5 / OpenRouter Smart Cascade)', provider: 'Google / OpenRouter' },
  { id: 'google/gemini-3.5-flash-lite', name: 'Google Gemini 3.5 Flash Lite (เร็วแรง แม่นยำสูง)', provider: 'Google' },
  { id: 'openai/gpt-4.1-mini', name: 'OpenAI GPT-4.1 Mini (ฉลาด กระชับ)', provider: 'OpenAI' },
  { id: 'openai/gpt-4.1-nano', name: 'OpenAI GPT-4.1 Nano (เร็วพิเศษ)', provider: 'OpenAI' },
  { id: 'x-ai/grok-4.3', name: 'xAI Grok 4.3 (คิดนอกกรอบ สไตล์สมจริง)', provider: 'xAI' },
  { id: 'x-ai/grok-4.20', name: 'xAI Grok 4.20 (เน้นบทสนทนาเข้มข้น)', provider: 'xAI' },
  { id: 'qwen/qwen3.8-flash', name: 'Qwen 3.8 Flash (ภาษาเอเชียระดับพรีเมียม)', provider: 'Alibaba Qwen' },
  { id: 'qwen/qwen3.7-flash', name: 'Qwen 3.7 Flash (สไตล์ตัวละครหลากหลาย)', provider: 'Alibaba Qwen' },
  { id: 'google/gemma-4-31b-it', name: 'Google Gemma 4 31B IT (Open Weights ทรงพลัง)', provider: 'Google' },
  { id: 'google/gemma-4-26b-a4b-it', name: 'Google Gemma 4 26B-A4B IT (สถาปัตยกรรมใหม่)', provider: 'Google' },
  { id: 'google/gemma-3-27b-it', name: 'Google Gemma 3 27B IT (เสถียร สมดุล)', provider: 'Google' },
  { id: 'z-ai/glm-5.3-flash', name: 'Z-AI GLM 5.3 Flash (วิเคราะห์โครงสร้างภาษาลึก)', provider: 'Z-AI' },
  { id: 'z-ai/glm-4.7-flash', name: 'Z-AI GLM 4.7 Flash (เร็ว ละเอียด)', provider: 'Z-AI' },
];

export function AIAssistantModal({
  isOpen,
  onClose,
  currentCharacter,
  onApplyCharacter,
}: AIAssistantModalProps) {
  const { user, quotaRemaining, quotaMax, consumeQuota, openAuthModal } = useAuth();

  const [activeTab, setActiveTab] = useState<'enhance' | 'parse'>('enhance');
  const [selectedModel, setSelectedModel] = useState('auto');
  const [instructions, setInstructions] = useState('');
  const [pasteText, setPasteText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleEnhance = async () => {
    if (!user) {
      openAuthModal('signin');
      return;
    }

    if (quotaRemaining <= 0) {
      setErrorMsg(`โควตา AI ของคุณหมดแล้ว (${quotaMax}/${quotaMax} ครั้ง) กรุณาอัปเกรดเป็น Premium หรือติดต่อแอดมิน`);
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setLoadingStep(`กำลังประมวลผลด้วยโมเดล ${selectedModel === 'auto' ? 'Gemini 3.5 / OpenRouter' : selectedModel}...`);

    try {
      const res = await fetch('/api/ai/enhance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          character: currentCharacter,
          instructions: instructions.trim() || undefined,
          model: selectedModel !== 'auto' ? selectedModel : undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to enhance character');
      }

      const data = await res.json();
      if (data.success && data.character) {
        consumeQuota();
        const usedModelName = data.model || selectedModel;
        onApplyCharacter(
          data.character,
          `✨ AI (${usedModelName}) เติมเต็มข้อมูล 10 หมวดหมู่ให้คุณเรียบร้อยแล้ว!`
        );
        onClose();
      } else {
        throw new Error('No character returned from AI');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อกับ AI');
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  const handleQuickParse = async () => {
    if (!pasteText.trim()) return;

    if (!user) {
      openAuthModal('signin');
      return;
    }

    if (quotaRemaining <= 0) {
      setErrorMsg(`โควตา AI ของคุณหมดแล้ว (${quotaMax}/${quotaMax} ครั้ง) กรุณาอัปเกรดเป็น Premium หรือติดต่อแอดมิน`);
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setLoadingStep(`กำลังแยกวิเคราะห์ข้อมูลด้วยโมเดล ${selectedModel === 'auto' ? 'Gemini 3.5 / OpenRouter' : selectedModel}...`);

    try {
      const res = await fetch('/api/ai/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawText: pasteText,
          model: selectedModel !== 'auto' ? selectedModel : undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to parse text');
      }

      const data = await res.json();
      if (data.success && data.character) {
        consumeQuota();
        const usedModelName = data.model || selectedModel;
        onApplyCharacter(
          data.character,
          `⚡ AI (${usedModelName}) แยกและนำเข้าข้อมูลสู่ 10 หมวดหมู่เรียบร้อยแล้ว!`
        );
        onClose();
      } else {
        throw new Error('No character returned from AI parser');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'เกิดข้อผิดพลาดในการแยกข้อมูล');
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-neutral-900 border border-neutral-700/80 rounded-2xl shadow-2xl shadow-black/80 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-800 bg-neutral-950/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-500/20 to-purple-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 shadow-inner">
              ✨
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                SedChar AI Co-Creator
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 font-semibold tracking-wider uppercase">
                  Gemini & OpenRouter Multi-Model
                </span>
              </h2>
              <p className="text-xs text-neutral-400">
                ระบบปัญญาประดิษฐ์เติมเต็มและแกะโครงสร้างตัวละครบทบาทสมมุติอัตโนมัติ
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white p-1.5 rounded-lg hover:bg-neutral-800 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Tab & Quota Strip */}
        <div className="px-6 py-2.5 bg-neutral-900 border-b border-neutral-800/80 flex items-center justify-between text-xs">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('enhance')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === 'enhance'
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
              }`}
            >
              🪄 เติมเต็มข้อมูลที่ขาด (Enhance)
            </button>
            <button
              onClick={() => setActiveTab('parse')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === 'parse'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
              }`}
            >
              ⚡ วางข้อความดิบแยกหมวด (Quick Parse)
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-neutral-400">โควตาวันนี้:</span>
            <span className={`px-2 py-0.5 rounded-md font-mono font-bold ${
              quotaRemaining > 3 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
            }`}>
              {quotaRemaining} / {quotaMax} ครั้ง
            </span>
          </div>
        </div>

        {/* Model Selector Strip */}
        <div className="px-6 py-3 bg-neutral-950/40 border-b border-neutral-800/60 flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="ai-model-select" className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
              <span>🤖 เลือก AI Engine & Model:</span>
            </label>
            <span className="text-[11px] text-neutral-500">Google Gemini & OpenRouter Active</span>
          </div>
          <select
            id="ai-model-select"
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="w-full bg-neutral-900 border border-neutral-700/80 rounded-xl px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-rose-500 transition-colors"
          >
            {AVAILABLE_MODELS.map((m) => (
              <option key={m.id} value={m.id} className="bg-neutral-900 text-neutral-200">
                {m.name} ({m.provider})
              </option>
            ))}
          </select>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4 text-sm">
          {errorMsg && (
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-center gap-2">
              <span>⚠️</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {activeTab === 'enhance' ? (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-neutral-950/50 border border-neutral-800/80 space-y-2">
                <div className="text-xs font-semibold text-neutral-300 flex items-center gap-2">
                  <span>🎯 สิ่งที่ AI จะดำเนินการ:</span>
                </div>
                <ul className="text-xs text-neutral-400 space-y-1.5 list-disc list-inside">
                  <li><strong>คงค่าเดิมที่คุณพิมพ์ไว้ 100%:</strong> ไม่ลบข้อมูลที่คุณตั้งใจเขียนไว้</li>
                  <li><strong>เติมเต็มจุดที่เว้นว่าง:</strong> ทั้งบุคลิกภาพ จิตวิทยา กลิ่นน้ำหอม สไตล์บทสนทนา</li>
                  <li><strong>สร้างความลึก:</strong> จุดอ่อน ปมเบื้องหลัง และกิมมิคพิเศษของตัวละคร</li>
                </ul>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  คำสั่งพิเศษเพิ่มเติมให้ AI (Optional):
                </label>
                <textarea
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="เช่น เน้นแนว Dark Romance มาเฟียขี้หึง, พูดจาสุภาพแต่เด็ดขาด, ชอบแกล้ง user ตอนอยู่สองต่อสอง..."
                  rows={3}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-rose-500/50 transition-colors"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-neutral-950/50 border border-neutral-800/80 space-y-2">
                <div className="text-xs font-semibold text-neutral-300 flex items-center gap-2">
                  <span>⚡ วิธีใช้นำเข้าด่วน:</span>
                </div>
                <p className="text-xs text-neutral-400">
                  วางข้อความรายละเอียดตัวละครทั้งหมดที่คุณมี (ไม่ว่าจะเป็นฟอร์แมตไหน ข้อความแชท หรือข้อความยาว) AI จะตรวจจับและแยกใส่ 10 หมวดหมู่ให้โดยอัตโนมัติ
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  วางข้อความดิบที่นี่:
                </label>
                <textarea
                  value={pasteText}
                  onChange={(e) => setPasteText(e.target.value)}
                  placeholder="วางรายละเอียดตัวละคร เช่น ชื่อ: ส้มจิ๊ด, อายุ: 21, เพศ: หญิง, นิสัย: ปากร้ายใจดี..."
                  rows={6}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-purple-500/50 transition-colors font-mono"
                />
              </div>
            </div>
          )}

          {isLoading && (
            <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/20 flex items-center gap-3 animate-pulse">
              <div className="w-5 h-5 border-2 border-rose-500 border-t-transparent rounded-full animate-spin flex-shrink-0" />
              <div className="text-xs text-rose-300 font-medium">
                {loadingStep || 'กำลังประมวลผล...'}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-neutral-800 bg-neutral-950/80 flex items-center justify-between">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 rounded-xl text-xs font-medium text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors disabled:opacity-50"
          >
            ยกเลิก
          </button>

          {activeTab === 'enhance' ? (
            <button
              onClick={handleEnhance}
              disabled={isLoading}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white text-xs font-bold shadow-lg shadow-rose-600/30 transition-all transform active:scale-95 disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>กำลังวิเคราะห์...</span>
                </>
              ) : (
                <>
                  <span>✨</span>
                  <span>เริ่มเติมเต็มข้อมูลด้วย AI</span>
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleQuickParse}
              disabled={isLoading || !pasteText.trim()}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 transition-all transform active:scale-95 disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>กำลังแยกข้อมูล...</span>
                </>
              ) : (
                <>
                  <span>⚡</span>
                  <span>แยกข้อมูลและนำเข้าฟอร์ม</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
