import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Sparkles, Trophy, CheckCircle2, RotateCcw, Zap } from 'lucide-react';

interface ScratchCardProps {
  onReveal: () => void;
  isRevealed: boolean;
  onReset?: () => void;
}

export const ScratchCard: React.FC<ScratchCardProps> = ({ onReveal, isRevealed, onReset }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isScratching, setIsScratching] = useState(false);
  const [scratchPercent, setScratchPercent] = useState(0);
  const [hasTriggeredReveal, setHasTriggeredReveal] = useState(false);
  const isRevealedRef = useRef(false);

  // Initialize and draw the scratchable surface with rose gold & gold metallic gradient
  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    const width = Math.max(rect.width || 360, 300);
    const height = Math.max(rect.height || 220, 200);

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    // Reset composite operation to normal draw
    ctx.globalCompositeOperation = 'source-over';
    ctx.clearRect(0, 0, width, height);

    // Rose gold & champagne luxury metallic gradient
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#e5a59c');
    gradient.addColorStop(0.2, '#f6cfbe');
    gradient.addColorStop(0.4, '#d88373');
    gradient.addColorStop(0.65, '#fde6dc');
    gradient.addColorStop(0.85, '#c26658');
    gradient.addColorStop(1, '#a84c42');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Decorative sparkles & polka dots texture
    ctx.fillStyle = 'rgba(255, 255, 255, 0.28)';
    for (let i = 0; i < 48; i++) {
      const x = (i * 47) % width;
      const y = (i * 31) % height;
      const r = (i % 4) + 2.5;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Elegant inner border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
    ctx.lineWidth = 3;
    ctx.strokeRect(8, 8, width - 16, height - 16);

    ctx.strokeStyle = 'rgba(168, 76, 66, 0.35)';
    ctx.lineWidth = 1;
    ctx.strokeRect(12, 12, width - 24, height - 24);

    // Text in center
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Top instruction
    ctx.fillStyle = '#6b201a';
    ctx.font = 'bold 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('✨ RASPE COM O DEDO OU MOUSE ✨', width / 2, height / 2 - 24);

    // Main Title
    ctx.font = '900 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = '#4a120e';
    ctx.fillText('DESCUBRA SEU DESCONTO', width / 2, height / 2 + 6);

    // Subtitle
    ctx.font = 'bold 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = '#7a2d25';
    ctx.fillText('Passe o dedo para revelar seu prêmio exclusivo', width / 2, height / 2 + 30);
  }, []);

  // Initialize canvas on mount or when container is laid out
  useEffect(() => {
    isRevealedRef.current = isRevealed;
    if (isRevealed) {
      setHasTriggeredReveal(true);
      setScratchPercent(100);
      return;
    }

    setHasTriggeredReveal(false);
    setScratchPercent(0);

    const timer = setTimeout(() => {
      initCanvas();
    }, 50);

    // Use ResizeObserver for accurate layout sizing
    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && containerRef.current) {
      ro = new ResizeObserver(() => {
        if (!isRevealedRef.current) {
          initCanvas();
        }
      });
      ro.observe(containerRef.current);
    }

    return () => {
      clearTimeout(timer);
      ro?.disconnect();
    };
  }, [initCanvas, isRevealed]);

  // Scratch action logic using destination-out with proper coordinate scaling
  const scratchAtPoint = (clientX: number, clientY: number) => {
    if (hasTriggeredReveal || isRevealed) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 32 * scaleX, 0, Math.PI * 2);
    ctx.fill();

    // Check completion threshold
    checkScratchCompletion();
  };

  const checkScratchCompletion = () => {
    if (hasTriggeredReveal || isRevealedRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    try {
      const width = canvas.width;
      const height = canvas.height;
      const imageData = ctx.getImageData(0, 0, width, height);
      const data = imageData.data;
      let transparentPixels = 0;
      const step = 32; // sampling step for performance

      let sampled = 0;
      for (let i = 3; i < data.length; i += step * 4) {
        sampled++;
        if (data[i] === 0) {
          transparentPixels++;
        }
      }

      const percent = Math.round((transparentPixels / sampled) * 100);
      setScratchPercent(percent);

      if (percent >= 30 && !hasTriggeredReveal) {
        triggerCompleteReveal();
      }
    } catch {
      // Fallback
    }
  };

  const triggerCompleteReveal = () => {
    if (hasTriggeredReveal) return;
    setHasTriggeredReveal(true);
    isRevealedRef.current = true;
    setScratchPercent(100);

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    onReveal();
  };

  const handleManualReset = () => {
    setHasTriggeredReveal(false);
    isRevealedRef.current = false;
    setScratchPercent(0);
    initCanvas();
    onReset?.();
  };

  // Pointer Event handlers (seamless across Mouse, Pen, Touch on iOS/Android/PC)
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    try {
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    } catch {}
    setIsScratching(true);
    scratchAtPoint(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isScratching) return;
    e.preventDefault();
    scratchAtPoint(e.clientX, e.clientY);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    setIsScratching(false);
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
  };

  return (
    <div className="w-full max-w-md mx-auto select-none">
      {/* Scratch Box Wrapper with Feminine Atelier Styling */}
      <div 
        ref={containerRef}
        className="relative w-full h-56 sm:h-64 rounded-3xl overflow-hidden border-2 border-[#f2deda] shadow-[0_12px_36px_rgba(184,74,86,0.12)] bg-gradient-to-br from-[#fff7f5] via-white to-[#faece8] cursor-crosshair touch-none"
      >
        {/* UNDERLYING PRIZE CONTENT (REVEALED UNDER CANVAS) */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center bg-gradient-to-br from-[#fff5f2] via-[#fffbf9] to-[#faebe6] border border-[#f5ded9]">
          
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#fdeeed] text-[#b84a56] text-[11px] font-extrabold uppercase tracking-wider mb-2 border border-[#f8d4ce] shadow-xs">
            <Trophy className="w-3.5 h-3.5 text-[#b84a56]" />
            <span>DESCONTO EXCLUSIVO DESBLOQUEADO</span>
          </div>

          <div className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#b84a56] via-[#d66d7d] to-[#e08291] tracking-tight drop-shadow-xs">
            50% OFF
          </div>

          <div className="text-[#3a1d22] font-black text-sm sm:text-base mt-1 tracking-tight">
            PARABÉNS! VOCÊ LIBEROU A OFERTA ESPECIAL
          </div>

          <div className="text-xs text-stone-600 mt-1 max-w-xs font-medium">
            De <span className="line-through text-stone-400">R$ 299,90</span> por apenas{' '}
            <strong className="text-[#b84a56] font-bold text-sm">12x de R$ 12,49</strong> ou R$ 149,90 à vista
          </div>

          <div className="mt-2.5 inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Economia imediata de R$ 150,00 garantida</span>
          </div>
        </div>

        {/* SCRATCHABLE CANVAS OVERLAY */}
        {(!isRevealed && !hasTriggeredReveal) && (
          <canvas
            ref={canvasRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className="absolute inset-0 w-full h-full z-10 touch-none select-none transition-opacity duration-300"
            style={{ touchAction: 'none' }}
          />
        )}
      </div>

      {/* Helper & Fast Reveal Controls */}
      <div className="mt-3.5 flex flex-col sm:flex-row items-center justify-between gap-2.5 px-2">
        <span className="text-xs text-[#8c5a61] flex items-center gap-1.5 font-medium">
          <Sparkles className="w-3.5 h-3.5 text-[#b84a56]" />
          <span>
            {scratchPercent > 0 && scratchPercent < 30
              ? `Raspado: ${scratchPercent}% (continue raspando...)` 
              : isRevealed || hasTriggeredReveal
                ? '✨ Prêmio 100% revelado!'
                : 'Raspe com o dedo ou mouse na área acima'}
          </span>
        </span>

        <div className="flex items-center gap-2">
          {(!isRevealed && !hasTriggeredReveal) ? (
            <button
              onClick={triggerCompleteReveal}
              type="button"
              className="inline-flex items-center gap-1 text-xs font-extrabold text-[#b84a56] hover:text-[#973943] bg-[#fdeeed] hover:bg-[#fae1dc] border border-[#f5d0c8] px-3 py-1.5 rounded-xl cursor-pointer transition-all active:scale-95 shadow-2xs"
            >
              <Zap className="w-3.5 h-3.5 text-[#b84a56]" />
              <span>Revelar agora</span>
            </button>
          ) : (
            <button
              onClick={handleManualReset}
              type="button"
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#8c5a61] hover:text-[#b84a56] bg-white border border-[#eedad5] hover:border-[#b84a56]/40 px-2.5 py-1 rounded-lg cursor-pointer transition-all"
              title="Recarregar a raspadinha"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Raspar de novo</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
