import React from 'react';

export type TextStrokeJoinType = 'miter' | 'round';

export interface TextStrokeStyleInput {
  textStrokeWidth?: number;
  textStrokeColor?: string;
  textFillTransparent?: boolean;
  textStrokeJoin?: TextStrokeJoinType;
  color?: string;
  textShadow?: string;
}

/**
 * Builds concentric circular `text-shadow` rings around each glyph, producing a
 * mathematically true Euclidean disk dilation (equivalent to `stroke-linejoin: round`
 * and `stroke-linecap: round`) with zero miter spikes on acute or cursive letters.
 */
export function buildRoundedTextShadow(
  radius: number,
  strokeColor: string,
  existingShadow?: string
): string {
  if (!Number.isFinite(radius) || radius <= 0) {
    return existingShadow && existingShadow !== 'none' ? existingShadow : 'none';
  }

  const stepCount = Math.min(12, Math.max(1, Math.ceil(radius / 0.7)));
  const shadows: string[] = [];

  for (let s = 1; s <= stepCount; s++) {
    const r = (radius * s) / stepCount;
    const angles = Math.min(36, Math.max(16, Math.ceil((2 * Math.PI * r) / 0.75)));
    for (let i = 0; i < angles; i++) {
      const theta = (2 * Math.PI * i) / angles;
      const dx = (Math.cos(theta) * r).toFixed(2);
      const dy = (Math.sin(theta) * r).toFixed(2);
      shadows.push(`${dx}px ${dy}px 0px ${strokeColor}`);
    }
  }

  if (existingShadow && existingShadow !== 'none') {
    shadows.push(existingShadow);
  }

  return shadows.join(', ');
}

function buildRoundedHollowSvgFilter(width: number, strokeColor: string): string {
  const blurStd = Math.min(1.4, Math.max(0.4, width * 0.38)).toFixed(2);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg"><filter id="r" x="-25%" y="-25%" width="150%" height="150%" color-interpolation-filters="sRGB"><feGaussianBlur in="SourceAlpha" stdDeviation="${blurStd}" result="b"/><feComponentTransfer in="b" result="a"><feFuncA type="linear" slope="4.5" intercept="-1.6"/></feComponentTransfer><feFlood flood-color="${strokeColor}" result="c"/><feComposite in="c" in2="a" operator="in"/></filter></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}#r")`;
}

/**
 * Generates CSS properties for an individual per-character / per-letter outline
 * (never a box/frame border).
 *
 * - When `textStrokeJoin === 'round'`:
 *   - Filled letters use concentric circular `text-shadow` dilation so every corner and
 *     cursive loop is smoothly rounded without miter spikes across browsers & exports.
 *   - Hollow ("Vazado") letters pair `-webkit-text-stroke` with an alpha-rounding SVG filter.
 * - When `textStrokeJoin` is `'miter'` (default sharp outline):
 *   - Uses `-webkit-text-stroke` paired with `paint-order: stroke fill` and doubled stroke
 *     width so the inner half stays behind the glyph fill.
 */
export function getTextStrokeCss(
  style?: TextStrokeStyleInput | null,
  fallbackFillColor?: string
): React.CSSProperties {
  const w = Number(style?.textStrokeWidth || 0);
  if (!style || !Number.isFinite(w) || w <= 0) {
    return {};
  }

  const strokeColor = style.textStrokeColor || '#000000';
  const isRound = style.textStrokeJoin === 'round';

  if (style.textFillTransparent) {
    return {
      WebkitTextStroke: `${w}px ${strokeColor}`,
      color: 'transparent',
      WebkitTextFillColor: 'transparent',
      paintOrder: 'stroke fill',
      strokeLinejoin: isRound ? 'round' : 'miter',
      ...(isRound ? { filter: buildRoundedHollowSvgFilter(w, strokeColor) } : {}),
    } as React.CSSProperties;
  }

  const fillColor = style.color || fallbackFillColor || '#111827';

  if (isRound) {
    return {
      WebkitTextStroke: '0px transparent',
      WebkitTextFillColor: fillColor,
      textShadow: buildRoundedTextShadow(w, strokeColor, style.textShadow),
    } as React.CSSProperties;
  }

  return {
    WebkitTextStroke: `${w * 2}px ${strokeColor}`,
    WebkitTextFillColor: fillColor,
    paintOrder: 'stroke fill',
    strokeLinejoin: 'miter',
  } as React.CSSProperties;
}

/**
 * Extra pixel clearance needed around glyph edges so outer strokes are not clipped.
 */
export function getTextStrokePaddingPx(
  style?: { textStrokeWidth?: number } | null
): number {
  const w = Number(style?.textStrokeWidth || 0);
  if (!Number.isFinite(w) || w <= 0) return 0;
  return Math.ceil(w + 1);
}

/**
 * Converts `paint-order: stroke fill` + `-webkit-text-stroke` into concentric
 * multi-angle `text-shadow` rings inside an `html2canvas` cloned document, because
 * `html2canvas` ignores `paint-order: stroke fill` and would otherwise paint the
 * stroke inward over the glyph fill.
 *
 * Elements using `textStrokeJoin === 'round'` already emit `textShadow` directly,
 * so `html2canvas` renders them natively with rounded contours.
 */
export function applyHtml2CanvasTextStrokeFallback(clonedDoc: Document): void {
  if (!clonedDoc?.body) return;
  const win = clonedDoc.defaultView;
  const elements = clonedDoc.body.querySelectorAll<HTMLElement>('*');

  elements.forEach((el) => {
    const inlineStroke =
      el.style.webkitTextStroke ||
      el.style.getPropertyValue('-webkit-text-stroke') ||
      el.style.webkitTextStrokeWidth ||
      el.style.getPropertyValue('-webkit-text-stroke-width');

    if (
      !inlineStroke ||
      inlineStroke === 'inherit' ||
      inlineStroke === 'none' ||
      inlineStroke.startsWith('0px')
    ) {
      return;
    }

    const computed = win ? win.getComputedStyle(el) : null;
    const fillColor =
      el.style.webkitTextFillColor ||
      el.style.getPropertyValue('-webkit-text-fill-color') ||
      computed?.getPropertyValue('-webkit-text-fill-color') ||
      '';

    // Hollow ("Vazado") mode has transparent fill, so native stroke works as intended
    if (fillColor === 'transparent' || el.style.color === 'transparent') {
      return;
    }

    const rawWidthStr =
      el.style.webkitTextStrokeWidth ||
      el.style.getPropertyValue('-webkit-text-stroke-width') ||
      computed?.getPropertyValue('-webkit-text-stroke-width') ||
      '0';
    const rawWidth = parseFloat(rawWidthStr);
    if (!Number.isFinite(rawWidth) || rawWidth <= 0) return;

    // DOM uses `w * 2` for `paint-order: stroke fill`; actual outer radius is half
    const radius = rawWidth / 2;
    const strokeColor =
      el.style.webkitTextStrokeColor ||
      el.style.getPropertyValue('-webkit-text-stroke-color') ||
      computed?.getPropertyValue('-webkit-text-stroke-color') ||
      '#000000';

    el.style.webkitTextStroke = '0px transparent';
    el.style.setProperty('-webkit-text-stroke', '0px transparent');
    el.style.textShadow = buildRoundedTextShadow(radius, strokeColor, el.style.textShadow);
  });
}

/**
 * Bulletproof polyfill for HTML5 CanvasGradient and CanvasRenderingContext2D.
 * Prevents html2canvas from throwing:
 * "TypeError: Failed to execute 'addColorStop' on 'CanvasGradient': The provided double value is non-finite."
 * when parsing CSS linear/radial gradients on elements with 0 width/height, subpixel angles, or NaN stops.
 */
export function installSafeCanvasPolyfill(targetWin?: Window | null): void {
  const win = targetWin || (typeof window !== 'undefined' ? window : null);
  if (!win) return;

  try {
    // 1. Safe addColorStop on CanvasGradient
    const gradProto = (win as any).CanvasGradient?.prototype;
    if (gradProto && !gradProto.__safeAddColorStopInstalled) {
      const origAddColorStop = gradProto.addColorStop;
      gradProto.addColorStop = function (offset: number, color: string) {
        let safeOffset = Number(offset);
        if (!Number.isFinite(safeOffset) || isNaN(safeOffset)) {
          safeOffset = 0;
        } else if (safeOffset < 0) {
          safeOffset = 0;
        } else if (safeOffset > 1) {
          safeOffset = 1;
        }
        try {
          return origAddColorStop.call(this, safeOffset, color || '#000000');
        } catch (_) {
          try {
            return origAddColorStop.call(this, 0, '#000000');
          } catch (__) {
            // Silently absorb unparseable color strings
          }
        }
      };
      gradProto.__safeAddColorStopInstalled = true;
    }

    // 2. Safe createLinearGradient & createRadialGradient on CanvasRenderingContext2D
    const ctxProto = (win as any).CanvasRenderingContext2D?.prototype;
    if (ctxProto && !ctxProto.__safeGradientsInstalled) {
      const origCreateLinear = ctxProto.createLinearGradient;
      ctxProto.createLinearGradient = function (x0: number, y0: number, x1: number, y1: number) {
        const sX0 = Number.isFinite(x0) ? x0 : 0;
        const sY0 = Number.isFinite(y0) ? y0 : 0;
        const sX1 = Number.isFinite(x1) ? x1 : 1;
        const sY1 = Number.isFinite(y1) ? y1 : 1;
        return origCreateLinear.call(this, sX0, sY0, sX1, sY1);
      };

      const origCreateRadial = ctxProto.createRadialGradient;
      ctxProto.createRadialGradient = function (x0: number, y0: number, r0: number, x1: number, y1: number, r1: number) {
        const sX0 = Number.isFinite(x0) ? x0 : 0;
        const sY0 = Number.isFinite(y0) ? y0 : 0;
        const sR0 = Math.max(0, Number.isFinite(r0) ? r0 : 0);
        const sX1 = Number.isFinite(x1) ? x1 : 0;
        const sY1 = Number.isFinite(y1) ? y1 : 0;
        const sR1 = Math.max(0.1, Number.isFinite(r1) ? r1 : 1);
        return origCreateRadial.call(this, sX0, sY0, sR0, sX1, sY1, sR1);
      };

      ctxProto.__safeGradientsInstalled = true;
    }
  } catch (_) {}
}

// Auto-install immediately on the main window
installSafeCanvasPolyfill();

/**
 * Prepares a cloned document for html2canvas capture:
 * - Installs the CanvasGradient & 2D Context polyfill on both the cloned window and the main window.
 * - Applies the text-stroke to text-shadow conversion.
 * - Disables broken Google Fonts links that cause net::ERR_FAILED 400.
 * - Cleans up zero-width / zero-height elements with CSS gradients so html2canvas doesn't produce NaN.
 */
export function prepareClonedDocForHtml2Canvas(clonedDoc: Document): void {
  if (!clonedDoc) return;
  const win = clonedDoc.defaultView;
  installSafeCanvasPolyfill(win);
  installSafeCanvasPolyfill(typeof window !== 'undefined' ? window : null);

  // Apply text stroke shadow polyfill
  applyHtml2CanvasTextStrokeFallback(clonedDoc);

  // Disable cross-origin link stylesheets that trigger CORS/400 errors during html2canvas parsing
  try {
    const links = clonedDoc.querySelectorAll('link[rel="stylesheet"]');
    links.forEach((l: any) => {
      const href = l.getAttribute('href') || '';
      if (href.includes('fonts.googleapis.com') && (href.includes('wght@0,300..900') || href.includes(':ital,wght@'))) {
        l.remove();
      }
    });
  } catch (_) {}

  // Sanitize elements with zero-dimensions and CSS gradients to prevent division-by-zero
  try {
    const allEls = clonedDoc.querySelectorAll<HTMLElement>('*');
    allEls.forEach((el) => {
      const bg = el.style.backgroundImage || el.style.background || '';
      if (bg.includes('gradient')) {
        const rect = el.getBoundingClientRect();
        if (rect.width <= 0 || rect.height <= 0 || el.offsetWidth <= 0 || el.offsetHeight <= 0) {
          el.style.backgroundImage = 'none';
          el.style.background = 'transparent';
        }
      }
    });
  } catch (_) {}
}
