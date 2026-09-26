'use client';
import React, { useState, useRef, useEffect } from 'react';
import {
  GoogleIcon,
  OpenAIIcon,
  XAIIcon,
  QwenIcon,
  ZaiIcon,
  GemmaIcon,
  OpenRouterIcon,
} from './BrandIcons';

export interface AIModelOption {
  id: string;
  name: string;
  shortName: string;
  provider: 'Google' | 'OpenAI' | 'xAI' | 'Qwen' | 'Z-AI' | 'Gemma' | 'Auto';
  category: 'fast' | 'deep' | 'asia' | 'open';
  tag: string;
  speed: string;
}

export const AI_MODELS_REGISTRY: AIModelOption[] = [
  {
    id: 'auto',
    name: 'Auto Multi-AI (Gemini 3.5 Flash Lite)',
    shortName: 'Auto Cascade',
    provider: 'Auto',
    category: 'fast',
    tag: '⚡ Best',
    speed: '~120ms',
  },
  {
    id: 'google/gemini-3.5-flash-lite',
    name: 'Google Gemini 3.5 Flash Lite',
    shortName: 'Gemini 3.5 Lite',
    provider: 'Google',
    category: 'fast',
    tag: '⚡ Ultra Fast',
    speed: '~110ms',
  },
  {
    id: 'openai/gpt-4.1-mini',
    name: 'OpenAI GPT-4.1 Mini',
    shortName: 'GPT-4.1 Mini',
    provider: 'OpenAI',
    category: 'fast',
    tag: '🧠 Smart',
    speed: '~280ms',
  },
  {
    id: 'openai/gpt-4.1-nano',
    name: 'OpenAI GPT-4.1 Nano',
    shortName: 'GPT-4.1 Nano',
    provider: 'OpenAI',
    category: 'fast',
    tag: '⚡ Fast',
    speed: '~140ms',
  },
  {
    id: 'x-ai/grok-4.3',
    name: 'xAI Grok 4.3 Creative',
    shortName: 'Grok 4.3',
    provider: 'xAI',
    category: 'deep',
    tag: '🎭 Roleplay',
    speed: '~350ms',
  },
  {
    id: 'x-ai/grok-4.20',
    name: 'xAI Grok 4.20 Unfiltered',
    shortName: 'Grok 4.20',
    provider: 'xAI',
    category: 'deep',
    tag: '🔥 Uncensored',
    speed: '~400ms',
  },
  {
    id: 'qwen/qwen3.8-flash',
    name: 'Qwen 3.8 Flash Asia',
    shortName: 'Qwen 3.8 Flash',
    provider: 'Qwen',
    category: 'asia',
    tag: '🇹🇭 Thai Pro',
    speed: '~180ms',
  },
  {
    id: 'qwen/qwen3.7-flash',
    name: 'Qwen 3.7 Flash',
    shortName: 'Qwen 3.7',
    provider: 'Qwen',
    category: 'asia',
    tag: '🇹🇭 Fast',
    speed: '~200ms',
  },
  {
    id: 'google/gemma-4-31b-it',
    name: 'Google Gemma 4 31B IT',
    shortName: 'Gemma 4 31B',
    provider: 'Gemma',
    category: 'open',
    tag: '🔓 Open Weight',
    speed: '~320ms',
  },
  {
    id: 'google/gemma-4-26b-a4b-it',
    name: 'Google Gemma 4 26B-A4B',
    shortName: 'Gemma 4 26B',
    provider: 'Gemma',
    category: 'open',
    tag: '🔓 Fast MoE',
    speed: '~290ms',
  },
  {
    id: 'google/gemma-3-27b-it',
    name: 'Google Gemma 3 27B IT',
    shortName: 'Gemma 3 27B',
    provider: 'Gemma',
    category: 'open',
    tag: '🔓 Stable',
    speed: '~310ms',
  },
  {
    id: 'z-ai/glm-5.3-flash',
    name: 'Z-AI GLM 5.3 Flash',
    shortName: 'GLM 5.3 Flash',
    provider: 'Z-AI',
    category: 'asia',
    tag: '🇹🇭 Deep Context',
    speed: '~260ms',
  },
  {
    id: 'z-ai/glm-4.7-flash',
    name: 'Z-AI GLM 4.7 Flash',
    shortName: 'GLM 4.7 Flash',
    provider: 'Z-AI',
    category: 'asia',
    tag: '🇹🇭 Fast',
    speed: '~240ms',
  },
];

const DEFAULT_MODEL_OPTION: AIModelOption = {
  id: 'auto',
  name: 'Auto Multi-AI (Gemini 3.5 Flash Lite)',
  shortName: 'Auto Cascade',
  provider: 'Auto',
  category: 'fast',
  tag: '⚡ Best',
  speed: '~120ms',
};

export function getProviderIcon(provider: AIModelOption['provider'], size = 14) {
  switch (provider) {
    case 'Google':
      return <GoogleIcon size={size} />;
    case 'OpenAI':
      return <OpenAIIcon size={size} className="text-emerald-400" />;
    case 'xAI':
      return <XAIIcon size={size} className="text-white" />;
    case 'Qwen':
      return <QwenIcon size={size} className="text-indigo-400" />;
    case 'Z-AI':
      return <ZaiIcon size={size} className="text-cyan-400" />;
    case 'Gemma':
      return <GemmaIcon size={size} className="text-teal-400" />;
    default:
      return <OpenRouterIcon size={size} className="text-rose-400" />;
  }
}

interface CompactModelLayerProps {
  selectedModelId: string;
  onSelectModel: (modelId: string) => void;
  className?: string;
  showDetails?: boolean;
}

export function CompactModelLayer({
  selectedModelId,
  onSelectModel,
  className = '',
}: CompactModelLayerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<'all' | 'fast' | 'deep' | 'asia' | 'open'>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const current: AIModelOption = AI_MODELS_REGISTRY.find(m => m.id === selectedModelId) || DEFAULT_MODEL_OPTION;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredModels = AI_MODELS_REGISTRY.filter(m => {
    if (activeCategory === 'all') return true;
    return m.category === activeCategory;
  });

  return (
    <div className={`relative inline-block text-xs font-sans ${className}`} ref={dropdownRef}>
      {/* Compact Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-900/90 hover:bg-neutral-800/90 border border-neutral-700/70 hover:border-rose-500/50 text-neutral-200 transition-all shadow-sm hover:shadow-rose-500/10 active:scale-95 group cursor-pointer"
        title={`Active AI Model Layer: ${current.name}`}
      >
        <span className="flex-shrink-0 flex items-center justify-center w-4 h-4">
          {getProviderIcon(current.provider, 13)}
        </span>
        <span className="font-medium text-neutral-300 group-hover:text-white truncate max-w-[140px]">
          {current.shortName}
        </span>
        <span className="px-1.5 py-0.2 text-[9px] font-semibold rounded bg-rose-500/15 text-rose-300 border border-rose-500/30">
          {current.tag.split(' ')[0]}
        </span>
        <span className="text-[10px] text-neutral-400 group-hover:text-rose-400 transition-transform duration-200" style={{ transform: isOpen ? 'rotate(180deg)' : 'none' }}>
          ▾
        </span>
      </button>

      {/* Micro-Dropdown Menu: Left-aligned, high Z-index, responsive max-width to prevent clipping */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-1.5 w-80 max-w-[calc(100vw-2.5rem)] max-h-84 bg-neutral-950/98 backdrop-blur-2xl border border-neutral-800/90 rounded-2xl shadow-2xl shadow-black/95 p-2.5 z-[9999] flex flex-col gap-1.5 animate-in fade-in zoom-in-95 duration-150 ring-1 ring-border/50">
          {/* Header & Category Filters */}
          <div className="flex items-center justify-between px-1.5 pb-1.5 border-b border-neutral-800/80">
            <span className="text-[11px] font-bold tracking-wide text-neutral-300 flex items-center gap-1.5">
              <span>⚡ AI Model Engine</span>
            </span>
            <span className="text-[10px] text-emerald-400 font-mono font-medium">Gemini 3.5 Lite Ready</span>
          </div>

          {/* Quick Filter Tabs */}
          <div className="flex gap-1 overflow-x-auto pb-1 text-[10px]">
            {[
              { id: 'all', label: 'All' },
              { id: 'fast', label: '⚡ Fast' },
              { id: 'deep', label: '🧠 Deep' },
              { id: 'asia', label: '🇹🇭 Thai' },
              { id: 'open', label: '🔓 Open' },
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveCategory(tab.id as any)}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                  activeCategory === tab.id
                    ? 'bg-rose-500 text-white shadow-xs'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* List of Models */}
          <div className="overflow-y-auto max-h-60 space-y-1 pr-1 custom-scrollbar">
            {filteredModels.map(model => {
              const isSelected = model.id === selectedModelId;
              return (
                <button
                  key={model.id}
                  type="button"
                  onClick={() => {
                    onSelectModel(model.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-r from-rose-500/25 to-purple-500/25 border border-rose-500/50 text-white shadow-xs'
                      : 'hover:bg-neutral-900/90 border border-transparent text-neutral-300 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
                      {getProviderIcon(model.provider, 15)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-semibold truncate">{model.name}</div>
                      <div className="text-[10px] text-neutral-400 flex items-center gap-1.5">
                        <span>{model.provider}</span>
                        <span>•</span>
                        <span className="font-mono text-neutral-400">{model.speed}</span>
                      </div>
                    </div>
                  </div>
                  <span className={`text-[9px] px-2 py-0.5 rounded-md font-bold flex-shrink-0 ml-1.5 ${
                    isSelected ? 'bg-rose-500 text-white' : 'bg-neutral-900 text-neutral-400 border border-neutral-800'
                  }`}>
                    {model.tag}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
