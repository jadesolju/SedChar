'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  X,
  Check,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Crop,
  Move,
  Sparkles,
  Loader2,
  Grid,
} from 'lucide-react';

export interface AspectRatioOption {
  id: string;
  label: string;
  ratio: number; // width / height
  outputWidth: number;
  outputHeight: number;
  description?: string;
}

export const CROP_ASPECT_RATIOS: AspectRatioOption[] = [
  {
    id: '16_9',
    label: '16:9 มาตรฐาน (แนะนำ)',
    ratio: 16 / 9,
    outputWidth: 1280,
    outputHeight: 720,
    description: 'เหมาะสำหรับแบนเนอร์เต็มการ์ด วอลเปเปอร์ และหน้าจอมือถือ/PC',
  },
  {
    id: '3_1',
    label: '3:1 แบนเนอร์ยาว',
    ratio: 3 / 1,
    outputWidth: 1200,
    outputHeight: 400,
    description: 'เหมาะสำหรับแถบหัวแบนเนอร์แนวยาวแบบคลาสสิก',
  },
  {
    id: '4_3',
    label: '4:3 แนวนอน',
    ratio: 4 / 3,
    outputWidth: 1024,
    outputHeight: 768,
    description: 'สัดส่วนภาพถ่ายและอาร์ตเวิร์กทั่วไป',
  },
  {
    id: '1_1',
    label: '1:1 สี่เหลี่ยม',
    ratio: 1 / 1,
    outputWidth: 800,
    outputHeight: 800,
    description: 'เหมาะสำหรับรูปโปรไฟล์ Avatar',
  },
];

export const DEFAULT_ASPECT_RATIO: AspectRatioOption = CROP_ASPECT_RATIOS[0]!;

interface ImageCropModalProps {
  isOpen: boolean;
  imageSrc: string;
  title?: string;
  subtitle?: string;
  initialRatioId?: string;
  onCrop: (croppedDataUrl: string) => void;
  onClose: () => void;
}

export function ImageCropModal({
  isOpen,
  imageSrc,
  title = 'ปรับแต่ง & ครอบตัดรูปภาพ (Crop & Zoom)',
  subtitle = 'ลากรูปภาพเพื่อเลื่อนตำแหน่ง และซูมเข้า-ออกได้ตามต้องการเหมือน Facebook / IG',
  initialRatioId = '16_9',
  onCrop,
  onClose,
}: ImageCropModalProps) {
  const [selectedRatioId, setSelectedRatioId] = useState(initialRatioId);
  const [zoom, setZoom] = useState(1.0);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [showGrid, setShowGrid] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  // Natural dimensions of loaded image
  const [imgNaturalSize, setImgNaturalSize] = useState({ width: 1, height: 1 });

  // Viewport DOM elements
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Dragging state tracking
  const isDraggingRef = useRef(false);
  const dragStartPosRef = useRef({ x: 0, y: 0 });
  const panStartRef = useRef({ x: 0, y: 0 });

  // Touch pinch tracking
  const touchDistanceRef = useRef<number | null>(null);
  const initialZoomRef = useRef(1.0);

  const activeRatio: AspectRatioOption =
    CROP_ASPECT_RATIOS.find((r) => r.id === selectedRatioId) || DEFAULT_ASPECT_RATIO;

  // Reset parameters when a new image or ratio is opened
  useEffect(() => {
    if (isOpen) {
      setZoom(1.0);
      setPan({ x: 0, y: 0 });
      setSelectedRatioId(initialRatioId);
      setIsProcessing(false);
    }
  }, [isOpen, initialRatioId, imageSrc]);

  // Load natural image dimensions
  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setImgNaturalSize({
      width: img.naturalWidth || 800,
      height: img.naturalHeight || 600,
    });
    setImgLoaded(true);
  };

  // Calculate clamp boundaries so photo fills crop box
  const getClampedPan = useCallback(
    (targetPanX: number, targetPanY: number, targetZoom: number) => {
      if (!containerRef.current) return { x: targetPanX, y: targetPanY };
      const container = containerRef.current;
      const cw = container.clientWidth;
      const ch = container.clientHeight;

      const imgAspect = imgNaturalSize.width / imgNaturalSize.height;
      const cropAspect = activeRatio.ratio;

      let baseW: number;
      let baseH: number;

      if (imgAspect > cropAspect) {
        baseH = ch;
        baseW = ch * imgAspect;
      } else {
        baseW = cw;
        baseH = cw / imgAspect;
      }

      const renderedW = baseW * targetZoom;
      const renderedH = baseH * targetZoom;

      const maxPanX = Math.max(0, (renderedW - cw) / 2);
      const maxPanY = Math.max(0, (renderedH - ch) / 2);

      const clampedX = Math.max(-maxPanX, Math.min(maxPanX, targetPanX));
      const clampedY = Math.max(-maxPanY, Math.min(maxPanY, targetPanY));

      return { x: clampedX, y: clampedY };
    },
    [imgNaturalSize, activeRatio.ratio]
  );

  // Mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    isDraggingRef.current = true;
    dragStartPosRef.current = { x: e.clientX, y: e.clientY };
    panStartRef.current = { ...pan };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - dragStartPosRef.current.x;
    const deltaY = e.clientY - dragStartPosRef.current.y;
    const newPan = getClampedPan(
      panStartRef.current.x + deltaX,
      panStartRef.current.y + deltaY,
      zoom
    );
    setPan(newPan);
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  // Wheel zoom handler
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomDelta = -e.deltaY * 0.0015;
    const newZoom = Math.max(1.0, Math.min(3.5, zoom + zoomDelta));
    setZoom(newZoom);
    setPan((prev) => getClampedPan(prev.x, prev.y, newZoom));
  };

  // Touch drag & pinch-to-zoom handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && e.touches[0]) {
      isDraggingRef.current = true;
      const t = e.touches[0];
      dragStartPosRef.current = { x: t.clientX, y: t.clientY };
      panStartRef.current = { ...pan };
    } else if (e.touches.length === 2 && e.touches[0] && e.touches[1]) {
      isDraggingRef.current = false;
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      touchDistanceRef.current = dist;
      initialZoomRef.current = zoom;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && isDraggingRef.current && e.touches[0]) {
      const t = e.touches[0];
      const deltaX = t.clientX - dragStartPosRef.current.x;
      const deltaY = t.clientY - dragStartPosRef.current.y;
      const newPan = getClampedPan(
        panStartRef.current.x + deltaX,
        panStartRef.current.y + deltaY,
        zoom
      );
      setPan(newPan);
    } else if (
      e.touches.length === 2 &&
      touchDistanceRef.current !== null &&
      e.touches[0] &&
      e.touches[1]
    ) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      const scaleFactor = dist / touchDistanceRef.current;
      const newZoom = Math.max(1.0, Math.min(3.5, initialZoomRef.current * scaleFactor));
      setZoom(newZoom);
      setPan((prev) => getClampedPan(prev.x, prev.y, newZoom));
    }
  };

  const handleTouchEnd = () => {
    isDraggingRef.current = false;
    touchDistanceRef.current = null;
  };

  // Change Zoom with slider
  const handleZoomChange = (newZoom: number) => {
    const clampedZoom = Math.max(1.0, Math.min(3.5, newZoom));
    setZoom(clampedZoom);
    setPan((prev) => getClampedPan(prev.x, prev.y, clampedZoom));
  };

  // Reset to original center & 1.0x
  const handleReset = () => {
    setZoom(1.0);
    setPan({ x: 0, y: 0 });
  };

  // Render cropped canvas and export WebP
  const handleApplyCrop = async () => {
    if (!containerRef.current || !imageRef.current) return;
    setIsProcessing(true);

    try {
      const container = containerRef.current;
      const cw = container.clientWidth;
      const ch = container.clientHeight;

      const img = imageRef.current;
      const naturalW = img.naturalWidth;
      const naturalH = img.naturalHeight;

      const imgAspect = naturalW / naturalH;
      const cropAspect = activeRatio.ratio;

      let baseW: number;
      let baseH: number;

      if (imgAspect > cropAspect) {
        baseH = ch;
        baseW = ch * imgAspect;
      } else {
        baseW = cw;
        baseH = cw / imgAspect;
      }

      const renderedW = baseW * zoom;
      const renderedH = baseH * zoom;

      // Coordinate calculations in rendered space
      const imgLeft = cw / 2 + pan.x - renderedW / 2;
      const imgTop = ch / 2 + pan.y - renderedH / 2;

      const visibleLeft = 0 - imgLeft;
      const visibleTop = 0 - imgTop;
      const visibleWidth = cw;
      const visibleHeight = ch;

      // Mapping to source natural image space
      const sourceScale = naturalW / renderedW;
      const srcX = Math.max(0, visibleLeft * sourceScale);
      const srcY = Math.max(0, visibleTop * sourceScale);
      const srcW = Math.min(naturalW - srcX, visibleWidth * sourceScale);
      const srcH = Math.min(naturalH - srcY, visibleHeight * sourceScale);

      // Create target output canvas
      const canvas = document.createElement('canvas');
      canvas.width = activeRatio.outputWidth;
      canvas.height = activeRatio.outputHeight;

      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas 2D context not supported');

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Draw cropped slice onto destination canvas
      ctx.drawImage(
        img,
        srcX,
        srcY,
        srcW,
        srcH,
        0,
        0,
        activeRatio.outputWidth,
        activeRatio.outputHeight
      );

      // Export as modern high-quality WebP
      let dataUrl = canvas.toDataURL('image/webp', 0.88);
      if (!dataUrl.startsWith('data:image/webp')) {
        dataUrl = canvas.toDataURL('image/jpeg', 0.88);
      }

      onCrop(dataUrl);
    } catch (err: any) {
      alert(err.message || 'เกิดข้อผิดพลาดในการครอบตัดรูปภาพ');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      onMouseUp={handleMouseUp}
    >
      <div className="relative w-full max-w-2xl bg-zinc-950/95 border border-white/20 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-zinc-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
              <Crop className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-1.5">
                <span>{title}</span>
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              </h3>
              <p className="text-[11px] text-zinc-400 truncate max-w-xs sm:max-w-md">
                {subtitle}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/15 text-zinc-300 hover:text-white flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Aspect Ratio Selector Pills */}
        <div className="px-5 py-2.5 bg-zinc-900/40 border-b border-white/5 flex items-center justify-between gap-2 overflow-x-auto">
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[10.5px] font-semibold text-zinc-400 mr-1">สัดส่วน:</span>
            {CROP_ASPECT_RATIOS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setSelectedRatioId(item.id);
                  setPan({ x: 0, y: 0 });
                }}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 border ${
                  selectedRatioId === item.id
                    ? 'bg-purple-600 text-white border-purple-500 shadow-xs'
                    : 'bg-white/5 text-zinc-400 border-white/10 hover:text-white hover:bg-white/10'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setShowGrid(!showGrid)}
            title="เปิด/ปิด เส้นตารางเก้าช่อง (Rule of Thirds Grid)"
            className={`px-2.5 py-1 rounded-xl text-[11px] font-medium border flex items-center gap-1 transition-all cursor-pointer shrink-0 ${
              showGrid
                ? 'bg-white/15 text-white border-white/20'
                : 'bg-white/5 text-zinc-400 border-white/5 hover:text-white'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">เส้นตาราง</span>
          </button>
        </div>

        {/* Interactive Viewport Canvas */}
        <div className="relative flex-1 bg-black flex items-center justify-center p-4 overflow-hidden min-h-[260px] sm:min-h-[340px] select-none">
          {/* Outer Crop Box Viewfinder Container */}
          <div
            ref={containerRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onWheel={handleWheel}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="relative overflow-hidden cursor-grab active:cursor-grabbing border-2 border-purple-500/80 rounded-2xl shadow-[0_0_30px_rgba(168,85,247,0.35)] flex items-center justify-center bg-zinc-900"
            style={{
              width: '100%',
              maxWidth: activeRatio.ratio >= 2 ? '560px' : '460px',
              aspectRatio: `${activeRatio.ratio}`,
            }}
          >
            {/* Hidden Source Image */}
            <img
              ref={imageRef}
              src={imageSrc}
              alt="Source for cropping"
              onLoad={onImageLoad}
              draggable={false}
              className="absolute pointer-events-none transition-transform duration-75 max-w-none"
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transformOrigin: 'center center',
                opacity: imgLoaded ? 1 : 0,
                // Ensure initial cover fit
                width:
                  imgNaturalSize.width / imgNaturalSize.height > activeRatio.ratio
                    ? 'auto'
                    : '100%',
                height:
                  imgNaturalSize.width / imgNaturalSize.height > activeRatio.ratio
                    ? '100%'
                    : 'auto',
              }}
            />

            {/* Rule of Thirds Grid Guidelines */}
            {showGrid && (
              <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none z-10 opacity-40">
                <div className="border-r border-b border-white/40" />
                <div className="border-r border-b border-white/40" />
                <div className="border-b border-white/40" />
                <div className="border-r border-b border-white/40" />
                <div className="border-r border-b border-white/40" />
                <div className="border-b border-white/40" />
                <div className="border-r border-white/40" />
                <div className="border-r border-white/40" />
                <div />
              </div>
            )}

            {/* Viewport Corner Brackets */}
            <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-white pointer-events-none z-10" />
            <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-white pointer-events-none z-10" />
            <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-white pointer-events-none z-10" />
            <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-white pointer-events-none z-10" />

            {/* Drag Hint Overlay Pill */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/75 backdrop-blur-md text-white text-[10.5px] font-medium border border-white/20 shadow-lg">
                <Move className="w-3 h-3 text-purple-400" />
                <span>คลิกแล้วลากเพื่อจัดตำแหน่ง (Pan)</span>
              </span>
            </div>
          </div>
        </div>

        {/* Zoom & Adjustment Controls Bar */}
        <div className="p-4 sm:p-5 bg-zinc-900/80 border-t border-white/10 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-zinc-300">
              <button
                type="button"
                onClick={() => handleZoomChange(zoom - 0.2)}
                className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/15 text-zinc-300 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                title="ย่อขนาดรูปภาพ"
              >
                <ZoomOut className="w-4 h-4" />
              </button>

              <div className="flex-1 min-w-[140px] sm:min-w-[220px]">
                <input
                  type="range"
                  min="1"
                  max="3.5"
                  step="0.01"
                  value={zoom}
                  onChange={(e) => handleZoomChange(Number(e.target.value))}
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer outline-hidden accent-purple-500 bg-zinc-800"
                />
              </div>

              <button
                type="button"
                onClick={() => handleZoomChange(zoom + 0.2)}
                className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/15 text-zinc-300 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                title="ขยายขนาดรูปภาพ"
              >
                <ZoomIn className="w-4 h-4" />
              </button>

              <span className="text-xs font-mono text-purple-300 font-bold px-2 py-1 rounded-lg bg-purple-950/60 border border-purple-500/30">
                {Math.round(zoom * 100)}%
              </span>
            </div>

            {/* Reset Button */}
            <button
              type="button"
              onClick={handleReset}
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-zinc-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 border border-white/10 transition-all cursor-pointer"
              title="รีเซ็ตตำแหน่งและขนาดกลับค่าเริ่มต้น"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">รีเซ็ต</span>
            </button>
          </div>

          {/* Ratio Description */}
          {activeRatio.description && (
            <p className="text-[11px] text-zinc-400 italic">
              💡 {activeRatio.description}
            </p>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 text-xs font-bold transition-all cursor-pointer border border-white/10"
            >
              ยกเลิก
            </button>
            <button
              type="button"
              onClick={handleApplyCrop}
              disabled={isProcessing}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>กำลังประมวลผล...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>ยืนยันและใช้รูปนี้ (Crop &amp; Apply)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
