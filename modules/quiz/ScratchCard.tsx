import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Sparkles, Trophy, Gift, CheckCircle2 } from 'lucide-react';

interface ScratchCardProps {
  onReveal: () => void;
  isRevealed: boolean;
}

export const ScratchCard: React.FC<ScratchCardProps> = ({ onReveal, isRevealed }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isScratching, setIsScratching] = useState(false);
  const [scratchPercent, setScratchPercent] = useState(0);
  const [hasTriggeredReveal, setHasTriggeredReveal] = useState(false);

  // Initialize and draw the scratchable surface
  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Rich metallic gold gradient
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#f59e0b');
    gradient.addColorStop(0.25, '#fbbf24');
    gradient.addColorStop(0.5, '#d97706');
    gradient.addColorStop(0.75, '#fef3c7');
    gradient.addColorStop(1, '#b45309');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Decorative starbursts / sparkles pattern
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    for (let i = 0; i < 40; i++) {
      const x = (i * 37) % width;
      const y = (i * 29) % height;
      const r = (i % 4) + 2;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Border
    ctx.strokeStyle = '#fef3c7';
    ctx.lineWidth = 4;
    ctx.strokeRect(6, 6, width - 12, height - 12);

    // Text in the center
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Top icon/sparkle
    ctx.fillStyle = '#78350f';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText('✨ RASPE COM O DEDO OU MOUSE ✨', width / 2, height / 2 - 18);

    ctx.font = '900 19px sans-serif';
    ctx.fillStyle = '#451a03';
    ctx.fillText('DESCUBRA SEU DESCONTO', width / 2, height / 2 + 10);

    ctx.font = 'bold 11px sans-serif';
    ctx.fillStyle = '#78350f';
    ctx.fillText('Passe o dedo para revelar seu prêmio', width / 2, height / 2 + 32);
  }, []);

  // Resize canvas according to container
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      if (!isRevealed && !hasTriggeredReveal) {
        initCanvas();
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [initCanvas, isRevealed, hasTriggeredReveal]);

  // Scratch action logic using destination-out
  const scratch = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 28, 0, Math.PI * 2);
    ctx.fill();

    // Check completion threshold
    checkScratchCompletion();
  };

  const checkScratchCompletion = () => {
    if (hasTriggeredReveal) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    try {
      // Sample 16x16 grid for high performance
      const width = canvas.width;
      const height = canvas.height;
      const imageData = ctx.getImageData(0, 0, width, height);
      const data = imageData.data;
      let transparentPixels = 0;
      const totalPixels = data.length / 4;
      const step = 32; // sampling step for 60fps smoothness

      let sampled = 0;
      for (let i = 3; i < data.length; i += step * 4) {
        sampled++;
        if (data[i] === 0) {
          transparentPixels++;
        }
      }

      const percent = Math.round((transparentPixels / sampled) * 100);
      setScratchPercent(percent);

      if (percent >= 35 && !hasTriggeredReveal) {
        setHasTriggeredReveal(true);
        triggerCompleteReveal();
      }
    } catch {
      // Fallback
    }
  };

  const triggerCompleteReveal = () => {
    setHasTriggeredReveal(true);
    setScratchPercent(100);
    // Smoothly clear canvas
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    onReveal();
  };

  // Mouse handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsScratching(true);
    scratch(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isScratching) return;
    scratch(e.clientX, e.clientY);
  };

  const handleMouseUp = () => {
    setIsScratching(false);
  };

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      setIsScratching(true);
      scratch(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isScratching || e.touches.length === 0) return;
    scratch(e.touches[0].clientX, e.touches[0].clientY);
  };

  const handleTouchEnd = () => {
    setIsScratching(false);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Scratch Box Wrapper */}
      <div 
        ref={containerRef}
        className="relative w-full h-56 sm:h-64 rounded-3xl overflow-hidden border-2 border-amber-500/60 shadow-2xl bg-gradient-to-b from-stone-900 to-stone-950 select-none cursor-crosshair touch-none"
      >
        {/* UNDERLYING PRIZE CONTENT (REVEALED UNDER CANVAS) */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center bg-gradient-to-br from-amber-950/90 via-stone-900 to-orange-950/90">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-[11px] font-extrabold uppercase tracking-wider mb-2 border border-amber-500/30 animate-bounce">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>DESCONTO EXCLUSIVO DESBLOQUEADO</span>
          </div>

          <div className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-orange-400 tracking-tight drop-shadow-md">
            50% OFF
          </div>

          <div className="text-white font-extrabold text-sm sm:text-base mt-1">
            ATENÇÃO: CONDIÇÃO ÚNICA!
          </div>

          <div className="text-xs text-stone-300 mt-1 max-w-xs">
            De <span className="line-through text-stone-400">R$ 299,90</span> por apenas{' '}
            <strong className="text-amber-400 font-bold">12x de R$ 12,49</strong> ou R$ 149,90 à vista
          </div>

          <div className="mt-2.5 inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Economia de R$ 150,00 garantida</span>
          </div>
        </div>

        {/* SCRATCHABLE CANVAS OVERLAY */}
        {(!isRevealed && !hasTriggeredReveal) && (
          <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="absolute inset-0 w-full h-full z-10 transition-opacity duration-500"
          />
        )}
      </div>

      {/* Helper & Fast Reveal Button */}
      <div className="mt-3.5 flex flex-col sm:flex-row items-center justify-between gap-2.5 px-2">
        <span className="text-xs text-stone-400 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>
            {scratchPercent > 0 && scratchPercent < 35 
              ? `Raspado: ${scratchPercent}% (continue raspando...)` 
              : isRevealed || hasTriggeredReveal
                ? 'Prêmio 100% revelado!'
                : 'Raspe com o dedo ou mouse'}
          </span>
        </span>

        {(!isRevealed && !hasTriggeredReveal) && (
          <button
            onClick={triggerCompleteReveal}
            type="button"
            className="text-xs font-bold text-amber-400 hover:text-amber-300 underline underline-offset-4 cursor-pointer hover:scale-105 transition-all py-1 px-2"
          >
            ⚡ Raspar tudo de uma vez
          </button>
        )}
      </div>
    </div>
  );
};
