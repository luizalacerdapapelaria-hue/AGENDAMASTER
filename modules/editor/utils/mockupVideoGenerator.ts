import { Muxer, ArrayBufferTarget } from 'mp4-muxer';
import type {
  MockupMode,
  MockupPerspective,
  WireoFinish,
  MockupBackground
} from '../components/MockupStudio';

export type VideoFormatPreset = 'whatsapp_landscape' | 'whatsapp_square' | 'whatsapp_vertical';
export type VideoPagePreset = 'smart_showcase' | 'from_current' | 'all_months' | 'custom_range';

export interface SpreadStep {
  leftPage: number;
  rightPage: number;
  singlePage: number;
  label?: string;
}

export interface MockupVideoRenderOptions {
  width: number;
  height: number;
  pageAspect: number; // PAGE_HEIGHT_MM / PAGE_WIDTH_MM
  mockupMode: MockupMode;
  perspective: MockupPerspective;
  customAngleX: number;
  customAngleY: number;
  customAngleZ: number;
  wireoFinish: WireoFinish;
  backgroundType: MockupBackground;
  showRibbon: boolean;
  ribbonColor: string;
  showPen: boolean;
  showPaperclip: boolean;
  coverThickness: 'thin' | 'medium' | 'thick';
  shadowIntensity: 'soft' | 'medium' | 'hard';
  showPageBadge: boolean;
  agendaTitle?: string;
}

export interface VideoFrameState {
  currentStep: SpreadStep;
  nextStep: SpreadStep | null;
  flipProgress: number; // 0 = static hold, 0..1 = turning leaf animation
  globalProgress: number; // 0..1 across entire video
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function drawRoundedRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  radii: [number, number, number, number] // [tl, tr, br, bl]
) {
  const [tl, tr, br, bl] = radii;
  ctx.beginPath();
  ctx.moveTo(x + tl, y);
  ctx.lineTo(x + w - tr, y);
  if (tr > 0) ctx.quadraticCurveTo(x + w, y, x + w, y + tr);
  ctx.lineTo(x + w, y + h - br);
  if (br > 0) ctx.quadraticCurveTo(x + w, y + h, x + w - br, y + h);
  ctx.lineTo(x + bl, y + h);
  if (bl > 0) ctx.quadraticCurveTo(x, y + h, x, y + h - bl);
  ctx.lineTo(x, y + tl);
  if (tl > 0) ctx.quadraticCurveTo(x, y, x + tl, y);
  ctx.closePath();
}

function getWireoPalette(finish: WireoFinish) {
  switch (finish) {
    case 'gold':
      return {
        highlight: '#fff9d6',
        mid: '#d4af37',
        shadow: '#785208',
        holeBg: '#1e1911'
      };
    case 'silver':
      return {
        highlight: '#ffffff',
        mid: '#cbd5e1',
        shadow: '#334155',
        holeBg: '#0f172a'
      };
    case 'rosegold':
      return {
        highlight: '#fff1f2',
        mid: '#d98894',
        shadow: '#742a36',
        holeBg: '#2a1216'
      };
    case 'black':
      return {
        highlight: '#71717a',
        mid: '#27272a',
        shadow: '#09090b',
        holeBg: '#000000'
      };
    case 'white':
      return {
        highlight: '#ffffff',
        mid: '#f1f5f9',
        shadow: '#94a3b8',
        holeBg: '#334155'
      };
    case 'bronze':
      return {
        highlight: '#ffedd5',
        mid: '#b87333',
        shadow: '#451a03',
        holeBg: '#1f1004'
      };
    default:
      return null;
  }
}

function drawStudioBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  backgroundType: MockupBackground
) {
  ctx.save();
  const cx = width * 0.5;
  const cy = height * 0.42;
  const maxR = Math.hypot(width, height) * 0.75;

  if (backgroundType === 'dark') {
    const grad = ctx.createRadialGradient(cx, cy, maxR * 0.05, cx, height * 0.5, maxR);
    grad.addColorStop(0, '#1e293b');
    grad.addColorStop(0.6, '#0f172a');
    grad.addColorStop(1, '#020617');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  } else if (backgroundType === 'wood') {
    const grad = ctx.createRadialGradient(cx, cy, maxR * 0.05, cx, height * 0.5, maxR);
    grad.addColorStop(0, '#d8b48f');
    grad.addColorStop(0.6, '#b88655');
    grad.addColorStop(1, '#8c5828');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  } else if (backgroundType === 'pastel') {
    const grad = ctx.createRadialGradient(width * 0.4, height * 0.4, maxR * 0.05, cx, height * 0.5, maxR);
    grad.addColorStop(0, '#fef3c7');
    grad.addColorStop(0.5, '#fce7f3');
    grad.addColorStop(1, '#e0e7ff');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  } else if (backgroundType === 'marble') {
    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(0, 0, width, height);
    const g1 = ctx.createRadialGradient(width * 0.15, height * 0.2, 10, width * 0.15, height * 0.2, width * 0.55);
    g1.addColorStop(0, 'rgba(203, 213, 225, 0.55)');
    g1.addColorStop(1, 'rgba(203, 213, 225, 0)');
    ctx.fillStyle = g1;
    ctx.fillRect(0, 0, width, height);

    const g2 = ctx.createRadialGradient(width * 0.85, height * 0.8, 10, width * 0.85, height * 0.8, width * 0.55);
    g2.addColorStop(0, 'rgba(203, 213, 225, 0.5)');
    g2.addColorStop(1, 'rgba(203, 213, 225, 0)');
    ctx.fillStyle = g2;
    ctx.fillRect(0, 0, width, height);
  } else {
    // studio-white or transparent fallback for MP4
    const grad = ctx.createRadialGradient(cx, height * 0.35, maxR * 0.05, cx, height * 0.5, maxR);
    grad.addColorStop(0, '#f8fafc');
    grad.addColorStop(0.55, '#e2e8f0');
    grad.addColorStop(1, '#cbd5e1');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  }
  ctx.restore();
}

export function renderMockupVideoFrame(
  ctx: CanvasRenderingContext2D,
  options: MockupVideoRenderOptions,
  state: VideoFrameState,
  pageTextures: Map<number, HTMLCanvasElement>
) {
  const {
    width,
    height,
    pageAspect,
    mockupMode,
    customAngleX,
    customAngleY,
    customAngleZ,
    wireoFinish,
    backgroundType,
    showRibbon,
    ribbonColor,
    showPen,
    showPaperclip,
    coverThickness,
    shadowIntensity,
    showPageBadge
  } = options;

  // 1. Draw Background
  drawStudioBackground(ctx, width, height, backgroundType);

  // 2. Compute optimal book dimensions inside video canvas
  const marginFactor = showPen ? 0.76 : 0.82;
  let pageW: number;
  let pageH: number;

  if (mockupMode === 'spread') {
    // Spread total width = 2 * pageW, height = pageH
    const maxSpreadW = width * marginFactor;
    const maxSpreadH = height * (showPageBadge ? 0.78 : 0.84);
    pageW = Math.min(maxSpreadW / 2, maxSpreadH / pageAspect);
    pageH = pageW * pageAspect;
  } else {
    const maxSingleW = width * marginFactor;
    const maxSingleH = height * (showPageBadge ? 0.78 : 0.84);
    pageW = Math.min(maxSingleW, maxSingleH / pageAspect);
    pageH = pageW * pageAspect;
  }

  // 3. Apply 3D Camera Perspective & Gentle Floating Motion
  ctx.save();
  const centerX = width * 0.5 - (showPen ? pageW * 0.04 : 0);
  const centerY = height * (showPageBadge ? 0.47 : 0.5);
  ctx.translate(centerX, centerY);

  const radX = (customAngleX * Math.PI) / 180;
  const radY = (customAngleY * Math.PI) / 180;
  const radZ = (customAngleZ * Math.PI) / 180;

  // Subtle breathing motion during showcase
  const breatheZ = Math.sin(state.globalProgress * Math.PI * 2) * 0.008;
  const scaleY = Math.max(0.86, Math.cos(radX * 0.55));
  const skewX = Math.sin(radY * 0.38) * 0.11;
  const rotZ = radZ * 0.55 + breatheZ;

  ctx.rotate(rotZ);
  ctx.transform(1, 0, skewX, scaleY, 0, 0);

  const cornerR = Math.max(6, pageW * 0.032);
  const stackCount = coverThickness === 'thick' ? 6 : coverThickness === 'medium' ? 4 : 2;
  const shadowAlpha = shadowIntensity === 'hard' ? 0.46 : shadowIntensity === 'soft' ? 0.20 : 0.32;

  if (mockupMode === 'spread') {
    // --- A. SPREAD MODE (OPEN AGENDA) ---
    // Ambient Drop Shadow under spread
    ctx.save();
    ctx.shadowColor = `rgba(0, 0, 0, ${shadowAlpha})`;
    ctx.shadowBlur = Math.max(24, pageW * 0.14);
    ctx.shadowOffsetX = -customAngleY * 0.6;
    ctx.shadowOffsetY = Math.max(12, pageH * 0.045);
    ctx.fillStyle = 'rgba(15, 23, 42, 0.08)';
    drawRoundedRectPath(ctx, -pageW, -pageH / 2, pageW * 2, pageH, [cornerR, cornerR, cornerR, cornerR]);
    ctx.fill();
    ctx.restore();

    // Stacked Pages Thickness (Left & Right)
    for (let i = stackCount; i >= 1; i--) {
      const offset = i * (pageW * 0.0055);
      const yOff = i * (pageH * 0.003);
      ctx.save();
      ctx.fillStyle = i % 2 === 0 ? '#f5f5f4' : '#e7e5e4';
      ctx.strokeStyle = '#d6d3d1';
      ctx.lineWidth = 1;
      // Left stack
      drawRoundedRectPath(ctx, -pageW - offset, -pageH / 2 + yOff, pageW, pageH, [cornerR, 0, 0, cornerR]);
      ctx.fill();
      ctx.stroke();
      // Right stack
      drawRoundedRectPath(ctx, offset, -pageH / 2 + yOff, pageW, pageH, [0, cornerR, cornerR, 0]);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    const isFlipping = state.flipProgress > 0 && state.nextStep !== null;
    const easedFlip = isFlipping ? easeInOutCubic(state.flipProgress) : 0;

    const underLeftPageNum = state.currentStep.leftPage;
    const underRightPageNum = isFlipping && state.nextStep ? state.nextStep.rightPage : state.currentStep.rightPage;

    // --- DRAW STATIC LEFT PAGE ---
    ctx.save();
    drawRoundedRectPath(ctx, -pageW, -pageH / 2, pageW, pageH, [cornerR, 0, 0, cornerR]);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.clip();

    const leftTex = pageTextures.get(underLeftPageNum);
    if (leftTex) {
      ctx.drawImage(leftTex, -pageW, -pageH / 2, pageW, pageH);
    }

    // Spine curvature shadow on right edge of left page
    const leftSpineGrad = ctx.createLinearGradient(-pageW * 0.16, 0, 0, 0);
    leftSpineGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
    leftSpineGrad.addColorStop(0.6, 'rgba(0, 0, 0, 0.04)');
    leftSpineGrad.addColorStop(1, 'rgba(0, 0, 0, 0.18)');
    ctx.fillStyle = leftSpineGrad;
    ctx.fillRect(-pageW * 0.16, -pageH / 2, pageW * 0.16, pageH);

    // Cast shadow on left page when turning leaf is landing on left (easedFlip > 0.35)
    if (isFlipping && easedFlip > 0.35) {
      const landFactor = (easedFlip - 0.35) / 0.65; // 0..1
      const shadowReach = pageW * Math.min(1, landFactor * 1.15);
      const shadowOpacity = Math.sin(landFactor * Math.PI) * 0.32;
      const landGrad = ctx.createLinearGradient(0, 0, -shadowReach, 0);
      landGrad.addColorStop(0, `rgba(0, 0, 0, ${shadowOpacity * 1.2})`);
      landGrad.addColorStop(0.65, `rgba(0, 0, 0, ${shadowOpacity * 0.55})`);
      landGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = landGrad;
      ctx.fillRect(-shadowReach, -pageH / 2, shadowReach, pageH);
    }
    ctx.restore();

    // --- DRAW STATIC RIGHT PAGE ---
    ctx.save();
    drawRoundedRectPath(ctx, 0, -pageH / 2, pageW, pageH, [0, cornerR, cornerR, 0]);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.clip();

    const rightTex = pageTextures.get(underRightPageNum);
    if (rightTex) {
      ctx.drawImage(rightTex, 0, -pageH / 2, pageW, pageH);
    }

    // Spine curvature shadow on left edge of right page
    const rightSpineGrad = ctx.createLinearGradient(0, 0, pageW * 0.16, 0);
    rightSpineGrad.addColorStop(0, 'rgba(0, 0, 0, 0.18)');
    rightSpineGrad.addColorStop(0.4, 'rgba(0, 0, 0, 0.04)');
    rightSpineGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = rightSpineGrad;
    ctx.fillRect(0, -pageH / 2, pageW * 0.16, pageH);

    // Cast shadow on right page when turning leaf lifts off right page (easedFlip < 0.65)
    if (isFlipping && easedFlip < 0.65) {
      const liftFactor = 1 - easedFlip / 0.65; // 1..0
      const shadowReach = pageW * Math.max(0.15, liftFactor * 1.05);
      const shadowOpacity = Math.sin(liftFactor * Math.PI) * 0.34;
      const liftGrad = ctx.createLinearGradient(0, 0, shadowReach, 0);
      liftGrad.addColorStop(0, `rgba(0, 0, 0, ${shadowOpacity * 1.25})`);
      liftGrad.addColorStop(0.6, `rgba(0, 0, 0, ${shadowOpacity * 0.6})`);
      liftGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = liftGrad;
      ctx.fillRect(0, -pageH / 2, shadowReach, pageH);
    }

    // Silk Ribbon Bookmark on Right Page
    if (showRibbon) {
      ctx.save();
      const ribW = Math.max(12, pageW * 0.055);
      const ribH = pageH * 0.84;
      const ribX = pageW * 0.78;
      const ribY = -pageH / 2;
      ctx.translate(ribX, ribY);
      ctx.rotate((-3.5 * Math.PI) / 180);
      ctx.shadowColor = 'rgba(0, 0, 0, 0.28)';
      ctx.shadowBlur = 6;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 3;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(ribW, 0);
      ctx.lineTo(ribW, ribH);
      ctx.lineTo(ribW * 0.5, ribH * 0.92);
      ctx.lineTo(0, ribH);
      ctx.closePath();
      ctx.fillStyle = ribbonColor || '#c59b27';
      ctx.fill();
      ctx.restore();
    }
    ctx.restore();

    // Gold Paperclip on Top Right Edge
    if (showPaperclip) {
      ctx.save();
      const clipX = pageW * 0.85;
      const clipY = -pageH / 2 - pageH * 0.02;
      ctx.translate(clipX, clipY);
      ctx.rotate((8 * Math.PI) / 180);
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = Math.max(2, pageW * 0.008);
      drawRoundedRectPath(ctx, 0, 0, pageW * 0.035, pageH * 0.09, [6, 6, 6, 6]);
      ctx.stroke();
      ctx.restore();
    }

    // --- DRAW 3D TURNING PAGE LEAF (WITH ARCHED CURVATURE & STRIP PERSPECTIVE) ---
    if (isFlipping && state.nextStep) {
      const theta = easedFlip * Math.PI; // 0 -> PI
      const isFrontFace = easedFlip < 0.5;
      const leafPageNum = isFrontFace ? state.currentStep.rightPage : state.nextStep.leftPage;
      const leafTex = pageTextures.get(leafPageNum);

      const strips = 28;
      const cosTheta = Math.cos(theta);
      const sinTheta = Math.sin(theta);

      ctx.save();
      // Drop shadow directly under the lifted turning leaf
      ctx.shadowColor = `rgba(0, 0, 0, ${0.22 * sinTheta})`;
      ctx.shadowBlur = 18 * sinTheta + 2;
      ctx.shadowOffsetX = isFrontFace ? -8 * sinTheta : 8 * sinTheta;
      ctx.shadowOffsetY = 10 * sinTheta;

      for (let s = 0; s < strips; s++) {
        const u0 = s / strips;
        const u1 = (s + 1) / strips;
        const uMid = (u0 + u1) * 0.5;

        // Slight natural paper bend lag at outer edge
        const bendAngle0 = theta - Math.sin(theta) * (1 - u0) * 0.14;
        const bendAngle1 = theta - Math.sin(theta) * (1 - u1) * 0.14;

        const x0 = u0 * pageW * Math.cos(bendAngle0);
        const x1 = u1 * pageW * Math.cos(bendAngle1);

        // Vertical arch & perspective lift
        const arch0 = Math.sin(u0 * Math.PI * 0.88) * sinTheta * (pageH * 0.055) + u0 * sinTheta * (pageH * 0.05);
        const arch1 = Math.sin(u1 * Math.PI * 0.88) * sinTheta * (pageH * 0.055) + u1 * sinTheta * (pageH * 0.05);
        const yMidOffset = -(arch0 + arch1) * 0.5;
        const stripH = pageH * (1 + sinTheta * uMid * 0.038);
        const stripTop = -stripH / 2 + yMidOffset;

        const dstLeft = Math.min(x0, x1);
        const dstWidth = Math.max(1.2, Math.abs(x1 - x0) + 0.7);

        ctx.save();
        ctx.beginPath();
        ctx.rect(dstLeft, stripTop, dstWidth, stripH);
        ctx.clip();

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(dstLeft, stripTop, dstWidth, stripH);

        if (leafTex) {
          const texW = leafTex.width;
          const texH = leafTex.height;
          if (isFrontFace) {
            // Front face: spine is at left of texture (u=0 -> srcX=0, u=1 -> srcX=texW)
            const srcX = u0 * texW;
            const srcW = Math.max(1, (u1 - u0) * texW);
            ctx.drawImage(leafTex, srcX, 0, srcW, texH, dstLeft, stripTop, dstWidth, stripH);
          } else {
            // Back face: lands on left page, so spine (u=0) is right edge of texture (texW) and outer tip (u=1) is left edge (0)
            const srcX = (1 - u1) * texW;
            const srcW = Math.max(1, (u1 - u0) * texW);
            ctx.drawImage(leafTex, srcX, 0, srcW, texH, dstLeft, stripTop, dstWidth, stripH);
          }
        }

        // Paper curvature lighting & specular highlight per strip
        const crestDist = Math.abs(uMid - 0.38);
        const specular = Math.max(0, 1 - crestDist * 2.8) * sinTheta * 0.34;
        const spineShade = (1 - uMid) * 0.16 * (0.4 + 0.6 * sinTheta);
        const edgeShade = uMid * 0.12 * sinTheta;

        if (specular > spineShade + edgeShade) {
          ctx.fillStyle = `rgba(255, 255, 255, ${specular})`;
          ctx.fillRect(dstLeft, stripTop, dstWidth, stripH);
        } else {
          ctx.fillStyle = `rgba(0, 0, 0, ${spineShade + edgeShade})`;
          ctx.fillRect(dstLeft, stripTop, dstWidth, stripH);
        }

        ctx.restore();
      }
      ctx.restore();
    }

    // --- DRAW CENTRAL WIRE-O METALLIC RINGS OR SEWN SPINE ---
    const wirePalette = getWireoPalette(wireoFinish);
    if (wireoFinish !== 'none' && wirePalette) {
      const ringsCount = 18;
      const pairSpacing = (pageH - pageH * 0.08) / ringsCount;
      const startY = -pageH / 2 + pageH * 0.04;
      const holeOffset = pageW * 0.045;
      const holeSize = Math.max(3.5, pageW * 0.015);

      // Central gutter line
      ctx.save();
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, -pageH / 2);
      ctx.lineTo(0, pageH / 2);
      ctx.stroke();

      for (let idx = 0; idx < ringsCount; idx++) {
        const pairCenterY = startY + idx * pairSpacing + pairSpacing * 0.5;
        const loopOffsets = [-pairSpacing * 0.16, pairSpacing * 0.16];

        for (const dy of loopOffsets) {
          const y = pairCenterY + dy;

          // Punched square holes on left and right pages
          ctx.fillStyle = wirePalette.holeBg;
          ctx.fillRect(-holeOffset - holeSize / 2, y - holeSize / 2, holeSize, holeSize);
          ctx.fillRect(holeOffset - holeSize / 2, y - holeSize / 2, holeSize, holeSize);

          // Soft cast shadow of wire arc on paper
          ctx.beginPath();
          ctx.moveTo(-holeOffset, y + 1.2);
          ctx.bezierCurveTo(-holeOffset * 0.4, y + 3.2, holeOffset * 0.4, y + 3.2, holeOffset, y + 1.2);
          ctx.strokeStyle = 'rgba(0, 0, 0, 0.22)';
          ctx.lineWidth = Math.max(1.5, pageW * 0.0055);
          ctx.lineCap = 'round';
          ctx.stroke();

          // Metallic Wire Arc
          const wireGrad = ctx.createLinearGradient(-holeOffset, y - 3, holeOffset, y + 2);
          wireGrad.addColorStop(0, wirePalette.shadow);
          wireGrad.addColorStop(0.3, wirePalette.highlight);
          wireGrad.addColorStop(0.55, wirePalette.mid);
          wireGrad.addColorStop(0.8, wirePalette.highlight);
          wireGrad.addColorStop(1, wirePalette.shadow);

          ctx.beginPath();
          ctx.moveTo(-holeOffset, y);
          ctx.bezierCurveTo(-holeOffset * 0.45, y - 3.2, holeOffset * 0.45, y - 3.2, holeOffset, y);
          ctx.strokeStyle = wireGrad;
          ctx.lineWidth = Math.max(1.8, pageW * 0.0065);
          ctx.lineCap = 'round';
          ctx.stroke();

          // Specular Glint on top crest
          ctx.beginPath();
          ctx.moveTo(-holeOffset * 0.55, y - 1.8);
          ctx.bezierCurveTo(-holeOffset * 0.2, y - 2.6, holeOffset * 0.2, y - 2.6, holeOffset * 0.55, y - 1.8);
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.82)';
          ctx.lineWidth = Math.max(0.7, pageW * 0.0022);
          ctx.stroke();
        }
      }
      ctx.restore();
    } else {
      // Sewn Spine Crease
      ctx.save();
      const creaseGrad = ctx.createLinearGradient(-6, 0, 6, 0);
      creaseGrad.addColorStop(0, 'rgba(0, 0, 0, 0.22)');
      creaseGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.18)');
      creaseGrad.addColorStop(1, 'rgba(0, 0, 0, 0.22)');
      ctx.fillStyle = creaseGrad;
      ctx.fillRect(-6, -pageH / 2, 12, pageH);
      ctx.restore();
    }
  } else {
    // --- B. SINGLE PAGE MODE ---
    ctx.save();
    ctx.shadowColor = `rgba(0, 0, 0, ${shadowAlpha})`;
    ctx.shadowBlur = Math.max(24, pageW * 0.14);
    ctx.shadowOffsetX = 4;
    ctx.shadowOffsetY = Math.max(12, pageH * 0.045);
    ctx.fillStyle = 'rgba(15, 23, 42, 0.08)';
    drawRoundedRectPath(ctx, -pageW / 2, -pageH / 2, pageW, pageH, [cornerR, cornerR, cornerR, cornerR]);
    ctx.fill();
    ctx.restore();

    for (let i = stackCount; i >= 1; i--) {
      const offset = i * (pageW * 0.006);
      ctx.save();
      ctx.fillStyle = i % 2 === 0 ? '#f5f5f4' : '#e7e5e4';
      ctx.strokeStyle = '#d6d3d1';
      ctx.lineWidth = 1;
      drawRoundedRectPath(ctx, -pageW / 2 + offset, -pageH / 2 + offset * 0.8, pageW, pageH, [cornerR, cornerR, cornerR, cornerR]);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    const isFlipping = state.flipProgress > 0 && state.nextStep !== null;
    const easedFlip = isFlipping ? easeInOutCubic(state.flipProgress) : 0;
    const baseSinglePage = isFlipping && state.nextStep ? state.nextStep.singlePage : state.currentStep.singlePage;

    ctx.save();
    drawRoundedRectPath(ctx, -pageW / 2, -pageH / 2, pageW, pageH, [cornerR, cornerR, cornerR, cornerR]);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.clip();

    const baseTex = pageTextures.get(baseSinglePage);
    if (baseTex) {
      ctx.drawImage(baseTex, -pageW / 2, -pageH / 2, pageW, pageH);
    }
    ctx.restore();

    if (isFlipping) {
      const leafTex = pageTextures.get(state.currentStep.singlePage);
      const remainFactor = Math.max(0.02, Math.cos(easedFlip * Math.PI * 0.5));
      const leafW = pageW * remainFactor;
      const liftY = -Math.sin(easedFlip * Math.PI) * (pageH * 0.04);

      ctx.save();
      ctx.globalAlpha = Math.max(0, 1 - Math.pow(easedFlip, 2.2));
      ctx.shadowColor = 'rgba(0, 0, 0, 0.28)';
      ctx.shadowBlur = 20;
      ctx.shadowOffsetX = 12;
      ctx.shadowOffsetY = 8;
      drawRoundedRectPath(ctx, -pageW / 2, -pageH / 2 + liftY, leafW, pageH, [cornerR, cornerR, cornerR, cornerR]);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.clip();
      if (leafTex) {
        ctx.drawImage(leafTex, -pageW / 2, -pageH / 2 + liftY, leafW, pageH);
      }
      ctx.restore();
    }
  }

  // --- LUXURY PEN BESIDE BOOK ---
  if (showPen) {
    ctx.save();
    const bookRightEdge = mockupMode === 'spread' ? pageW : pageW / 2;
    const penX = bookRightEdge + pageW * 0.16;
    const penY = -pageH * 0.04;
    const penW = Math.max(8, pageW * 0.032);
    const penH = pageH * 0.68;

    ctx.translate(penX, penY);
    ctx.rotate((-11 * Math.PI) / 180);

    // Pen Shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.36)';
    ctx.shadowBlur = 16;
    ctx.shadowOffsetX = 8;
    ctx.shadowOffsetY = 12;

    const penGrad = ctx.createLinearGradient(-penW / 2, 0, penW / 2, 0);
    penGrad.addColorStop(0, '#1e293b');
    penGrad.addColorStop(0.4, '#475569');
    penGrad.addColorStop(0.75, '#0f172a');
    penGrad.addColorStop(1, '#334155');

    drawRoundedRectPath(ctx, -penW / 2, -penH / 2, penW, penH, [penW / 2, penW / 2, penW / 2, penW / 2]);
    ctx.fillStyle = penGrad;
    ctx.fill();

    // Gold accents on pen
    ctx.shadowColor = 'transparent';
    ctx.fillStyle = '#d4af37';
    drawRoundedRectPath(ctx, -penW / 2, -penH / 2, penW, penH * 0.08, [penW / 2, penW / 2, 0, 0]);
    ctx.fill();
    drawRoundedRectPath(ctx, -penW / 2, penH / 2 - penH * 0.07, penW, penH * 0.07, [0, 0, penW / 2, penW / 2]);
    ctx.fill();
    ctx.fillRect(-penW * 0.35, -penH / 2 + penH * 0.09, penW * 0.24, penH * 0.18);
    ctx.restore();
  }

  ctx.restore(); // Restore 3D camera transform

  // --- OPTIONAL SUBTLE PAGE / SECTION BADGE AT BOTTOM ---
  if (showPageBadge) {
    ctx.save();
    const activeStep = state.flipProgress > 0.55 && state.nextStep ? state.nextStep : state.currentStep;
    const pageText =
      mockupMode === 'spread'
        ? `Páginas ${activeStep.leftPage} e ${activeStep.rightPage}`
        : `Página ${activeStep.singlePage}`;
    const fullBadgeText = activeStep.label ? `${activeStep.label}  •  ${pageText}` : pageText;

    const fontSize = Math.max(13, Math.round(height * 0.02));
    ctx.font = `600 ${fontSize}px Inter, system-ui, -apple-system, sans-serif`;
    const metrics = ctx.measureText(fullBadgeText);
    const padX = fontSize * 1.1;
    const padY = fontSize * 0.55;
    const pillW = metrics.width + padX * 2;
    const pillH = fontSize + padY * 2;
    const pillX = (width - pillW) / 2;
    const pillY = height - pillH - Math.max(16, height * 0.032);

    ctx.fillStyle = 'rgba(15, 23, 42, 0.72)';
    drawRoundedRectPath(ctx, pillX, pillY, pillW, pillH, [pillH / 2, pillH / 2, pillH / 2, pillH / 2]);
    ctx.fill();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = '#f8fafc';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(fullBadgeText, width / 2, pillY + pillH / 2 + 1);
    ctx.restore();
  }
}

export interface EncodeMockupVideoParams {
  steps: SpreadStep[];
  renderOptions: MockupVideoRenderOptions;
  pageTextures: Map<number, HTMLCanvasElement>;
  holdDurationMs: number;
  flipDurationMs: number;
  fps?: number;
  onProgress?: (percent: number, statusText: string) => void;
  shouldCancel?: () => boolean;
}

export async function encodeMockupVideoMP4(params: EncodeMockupVideoParams): Promise<{
  blob: Blob;
  mimeType: string;
  extension: 'mp4' | 'webm';
}> {
  const {
    steps,
    renderOptions,
    pageTextures,
    holdDurationMs,
    flipDurationMs,
    fps = 30,
    onProgress,
    shouldCancel
  } = params;

  // Ensure even dimensions for H.264 compatibility
  const width = Math.floor(renderOptions.width / 2) * 2;
  const height = Math.floor(renderOptions.height / 2) * 2;
  const normalizedOptions = { ...renderOptions, width, height };

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) {
    throw new Error('Não foi possível inicializar o canvas de vídeo 2D.');
  }

  // Build frame timeline
  const holdFrames = Math.max(12, Math.round((holdDurationMs / 1000) * fps));
  const flipFrames = Math.max(15, Math.round((flipDurationMs / 1000) * fps));

  const timeline: { currentIdx: number; nextIdx: number | null; flipProgress: number }[] = [];

  for (let i = 0; i < steps.length; i++) {
    const hasNext = i < steps.length - 1;
    // Hold phase on current spread/page
    for (let f = 0; f < holdFrames; f++) {
      timeline.push({ currentIdx: i, nextIdx: hasNext ? i + 1 : null, flipProgress: 0 });
    }
    // Flip transition phase to next spread/page
    if (hasNext) {
      for (let f = 1; f <= flipFrames; f++) {
        timeline.push({
          currentIdx: i,
          nextIdx: i + 1,
          flipProgress: f / flipFrames
        });
      }
    }
  }

  const totalFrames = Math.max(1, timeline.length);

  // Check if WebCodecs VideoEncoder + H.264 is supported (Produces 100% native WhatsApp MP4)
  let supportedAvcCodec: string | null = null;
  if (typeof window !== 'undefined' && 'VideoEncoder' in window && 'VideoFrame' in window) {
    const candidateCodecs = [
      'avc1.42001f', // H.264 Baseline Profile Level 3.1 (Maximum WhatsApp compatibility)
      'avc1.42E01F', // H.264 Constrained Baseline
      'avc1.4d001f', // H.264 Main Profile Level 3.1
      'avc1.4d0028', // H.264 Main Profile Level 4.0
      'avc1.640028'  // H.264 High Profile Level 4.0
    ];

    for (const codec of candidateCodecs) {
      try {
        const support = await VideoEncoder.isConfigSupported({
          codec,
          width,
          height,
          bitrate: 4_000_000,
          framerate: fps
        });
        if (support.supported) {
          supportedAvcCodec = codec;
          break;
        }
      } catch (_) {}
    }
  }

  if (supportedAvcCodec) {
    try {
      const target = new ArrayBufferTarget();
      const muxer = new Muxer({
        target,
        video: {
          codec: 'avc',
          width,
          height,
          frameRate: fps
        },
        fastStart: 'in-memory'
      });

      let encoderError: Error | null = null;
      const encoder = new VideoEncoder({
        output: (chunk, meta) => {
          muxer.addVideoChunk(chunk, meta);
        },
        error: (err) => {
          encoderError = err instanceof Error ? err : new Error(String(err));
        }
      });

      encoder.configure({
        codec: supportedAvcCodec,
        width,
        height,
        bitrate: 4_000_000,
        framerate: fps
      });

      const frameDurationUs = Math.round(1_000_000 / fps);

      for (let frameIdx = 0; frameIdx < totalFrames; frameIdx++) {
        if (shouldCancel?.()) {
          try { encoder.close(); } catch (_) {}
          throw new Error('CANCELLED');
        }
        if (encoderError) {
          throw encoderError;
        }

        const item = timeline[frameIdx];
        const frameState: VideoFrameState = {
          currentStep: steps[item.currentIdx],
          nextStep: item.nextIdx !== null ? steps[item.nextIdx] : null,
          flipProgress: item.flipProgress,
          globalProgress: frameIdx / totalFrames
        };

        renderMockupVideoFrame(ctx, normalizedOptions, frameState, pageTextures);

        const videoFrame = new VideoFrame(canvas, {
          timestamp: frameIdx * frameDurationUs,
          duration: frameDurationUs
        });

        encoder.encode(videoFrame, { keyFrame: frameIdx % fps === 0 });
        videoFrame.close();

        if (frameIdx % 4 === 0 || frameIdx === totalFrames - 1) {
          const pct = Math.round(35 + ((frameIdx + 1) / totalFrames) * 60);
          onProgress?.(pct, `Renderizando animação 3D em MP4 (${ Math.round(((frameIdx + 1) / totalFrames) * 100) }%)...`);
          // Yield to keep UI responsive and prevent encoder queue overflow
          if (encoder.encodeQueueSize > 10) {
            await encoder.flush();
          } else {
            await new Promise(r => setTimeout(r, 0));
          }
        }
      }

      onProgress?.(96, 'Finalizando arquivo MP4 para WhatsApp...');
      await encoder.flush();
      encoder.close();
      muxer.finalize();

      const mp4Blob = new Blob([target.buffer], { type: 'video/mp4' });
      onProgress?.(100, 'Vídeo MP4 pronto!');
      return {
        blob: mp4Blob,
        mimeType: 'video/mp4',
        extension: 'mp4'
      };
    } catch (err: any) {
      if (err?.message === 'CANCELLED') throw err;
      console.warn('[MockupVideo] WebCodecs falhou, usando fallback MediaRecorder:', err);
    }
  }

  // Fallback Engine: Canvas captureStream + MediaRecorder
  const stream = (canvas as any).captureStream ? (canvas as any).captureStream(fps) : null;
  if (!stream || typeof MediaRecorder === 'undefined') {
    throw new Error('Seu navegador não suporta gravação de vídeo em Canvas.');
  }

  const mimeCandidates = [
    'video/mp4;codecs=avc1.42E01E',
    'video/mp4;codecs=avc1',
    'video/mp4;codecs=h264',
    'video/mp4',
    'video/webm;codecs=h264',
    'video/webm;codecs=vp9',
    'video/webm'
  ];

  const chosenMime = mimeCandidates.find(m => {
    try {
      return MediaRecorder.isTypeSupported(m);
    } catch (_) {
      return false;
    }
  }) || '';

  const chunks: BlobPart[] = [];
  const recorder = new MediaRecorder(
    stream,
    chosenMime ? { mimeType: chosenMime, videoBitsPerSecond: 4_000_000 } : { videoBitsPerSecond: 4_000_000 }
  );

  recorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) chunks.push(e.data);
  };

  const stoppedPromise = new Promise<Blob>((resolve, reject) => {
    recorder.onstop = () => {
      const finalType = chosenMime.includes('mp4') ? 'video/mp4' : (chosenMime || 'video/mp4');
      resolve(new Blob(chunks, { type: finalType }));
    };
    recorder.onerror = (e) => reject(e);
  });

  recorder.start(100);
  const frameIntervalMs = 1000 / fps;

  for (let frameIdx = 0; frameIdx < totalFrames; frameIdx++) {
    if (shouldCancel?.()) {
      try { recorder.stop(); } catch (_) {}
      throw new Error('CANCELLED');
    }

    const item = timeline[frameIdx];
    const frameState: VideoFrameState = {
      currentStep: steps[item.currentIdx],
      nextStep: item.nextIdx !== null ? steps[item.nextIdx] : null,
      flipProgress: item.flipProgress,
      globalProgress: frameIdx / totalFrames
    };

    renderMockupVideoFrame(ctx, normalizedOptions, frameState, pageTextures);

    if (frameIdx % 4 === 0 || frameIdx === totalFrames - 1) {
      const pct = Math.round(35 + ((frameIdx + 1) / totalFrames) * 60);
      onProgress?.(pct, `Gravando animação 3D (${ Math.round(((frameIdx + 1) / totalFrames) * 100) }%)...`);
    }

    await new Promise(r => setTimeout(r, frameIntervalMs));
  }

  onProgress?.(97, 'Finalizando vídeo...');
  recorder.stop();
  const finalBlob = await stoppedPromise;
  stream.getTracks().forEach((t: any) => t.stop());

  const isMp4 = chosenMime.includes('mp4') || finalBlob.type.includes('mp4');
  onProgress?.(100, 'Vídeo pronto!');
  return {
    blob: finalBlob,
    mimeType: isMp4 ? 'video/mp4' : finalBlob.type,
    extension: isMp4 ? 'mp4' : 'mp4' // Named .mp4 for direct WhatsApp attachment
  };
}
