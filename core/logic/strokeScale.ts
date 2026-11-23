export const CSS_PX_PER_MM = 96 / 25.4; // Exact CSS pixel density: ~3.7795275590551185 px/mm
export const PT_PER_MM = 72 / 25.4; // Exact typographic points per mm: ~2.834645669291339 pt/mm
export const EDITOR_BASE_WIDTH_PX = 400;

/**
 * Converts a stored stroke thickness value (defined on the 400px editor base width)
 * into real printed millimeters for the given page width in mm.
 */
export function unitToMm(unitVal: number, pageWidthMm: number): number {
  const safeVal = Number(unitVal);
  const safePageW = Math.max(1, Number(pageWidthMm) || 148);
  if (!Number.isFinite(safeVal) || safeVal <= 0) return 0;
  return (safeVal / EDITOR_BASE_WIDTH_PX) * safePageW;
}

/**
 * Converts a stored stroke thickness value (defined on the 400px editor base width)
 * into real typographic points (pt) for the given page width in mm.
 */
export function unitToPt(unitVal: number, pageWidthMm: number): number {
  return unitToMm(unitVal, pageWidthMm) * PT_PER_MM;
}

/**
 * Converts a desired printed thickness in typographic points (pt)
 * into the stored 400px-base unit value for the given page width in mm.
 */
export function ptToUnit(ptVal: number, pageWidthMm: number): number {
  const safePt = Number(ptVal);
  const safePageW = Math.max(1, Number(pageWidthMm) || 148);
  if (!Number.isFinite(safePt) || safePt <= 0) return 0;
  const mm = safePt / PT_PER_MM;
  const unit = (mm / safePageW) * EDITOR_BASE_WIDTH_PX;
  return Math.round(unit * 1000) / 1000;
}

/**
 * Converts a desired printed thickness in millimeters (mm)
 * into the stored 400px-base unit value for the given page width in mm.
 */
export function mmToUnit(mmVal: number, pageWidthMm: number): number {
  const safeMm = Number(mmVal);
  const safePageW = Math.max(1, Number(pageWidthMm) || 148);
  if (!Number.isFinite(safeMm) || safeMm <= 0) return 0;
  const unit = (safeMm / safePageW) * EDITOR_BASE_WIDTH_PX;
  return Math.round(unit * 1000) / 1000;
}

/**
 * Formats a compact physical readout (mm and pt) for UI thickness controls.
 */
export function formatStrokeReadout(unitVal: number, pageWidthMm: number): string {
  const safeVal = Number(unitVal);
  if (!Number.isFinite(safeVal) || safeVal <= 0) return '0 mm (sem traço)';
  const mm = unitToMm(safeVal, pageWidthMm);
  const pt = mm * PT_PER_MM;
  return `${mm.toFixed(2)}mm · ${pt.toFixed(2)}pt`;
}

/**
 * Standard print-shop hairline & stroke presets in typographic points (pt).
 */
export const STROKE_PT_PRESETS: { label: string; pt: number }[] = [
  { label: '0.25pt', pt: 0.25 },
  { label: '0.5pt', pt: 0.5 },
  { label: '0.75pt', pt: 0.75 },
  { label: '1pt', pt: 1.0 },
  { label: '1.5pt', pt: 1.5 },
  { label: '2pt', pt: 2.0 },
];

/**
 * Returns a proportional SVG strokeDasharray scaled to CSS pixels and page scaleFactor,
 * ensuring dashed and dotted lines match identically across Editor, Preview, and PDF.
 */
export function getDashArray(
  borderStyle: string | undefined,
  strokeWidthPx: number,
  scaleFactor: number = 1
): string | undefined {
  if (!borderStyle || borderStyle === 'solid' || borderStyle === 'none' || borderStyle === 'double') {
    return undefined;
  }
  const safeW = Math.max(0.1, Number(strokeWidthPx) || 0.5);
  const safeScale = Math.max(0.1, Number(scaleFactor) || 1);

  if (borderStyle === 'dashed') {
    const dash = Math.max(2.2 * safeScale, safeW * 3.8);
    const gap = Math.max(1.6 * safeScale, safeW * 2.4);
    return `${dash.toFixed(2)},${gap.toFixed(2)}`;
  }

  if (borderStyle === 'dotted') {
    const dot = Math.max(0.35 * safeScale, safeW);
    const gap = Math.max(1.2 * safeScale, safeW * 2.1);
    return `${dot.toFixed(2)},${gap.toFixed(2)}`;
  }

  return undefined;
}

const fmtNum = (n: number): string => {
  const rounded = Math.round(n * 1000) / 1000;
  return Object.is(rounded, -0) ? '0' : String(rounded);
};

/**
 * Transforms an arbitrary SVG path `d` from its local bounding box into exact CSS pixel
 * coordinates [insetPx .. targetW - insetPx, insetPx .. targetH - insetPx].
 * Eliminates the need for `preserveAspectRatio="none"` + `vectorEffect="non-scaling-stroke"`,
 * so CSS transforms (`scale(...)` in preview/editor) scale strokes identically to PDF output.
 */
export function transformSvgPathToBox(
  d: string,
  bounds: { x: number; y: number; width: number; height: number },
  targetW: number,
  targetH: number,
  insetPx: number = 0
): string {
  if (!d) return '';
  const safeW = Math.max(0.5, targetW - insetPx * 2);
  const safeH = Math.max(0.5, targetH - insetPx * 2);
  const bW = Math.max(0.0001, bounds.width);
  const bH = Math.max(0.0001, bounds.height);
  const sx = safeW / bW;
  const sy = safeH / bH;

  const tx = (x: number) => fmtNum(insetPx + (x - bounds.x) * sx);
  const ty = (y: number) => fmtNum(insetPx + (y - bounds.y) * sy);

  const tokens = d.match(/([a-zA-Z])|([-+]?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?)/g) || [];
  const out: string[] = [];

  let i = 0;
  let cmd = '';
  let curX = 0;
  let curY = 0;
  let subStartX = 0;
  let subStartY = 0;

  while (i < tokens.length) {
    const token = tokens[i];
    if (/^[a-zA-Z]$/.test(token)) {
      cmd = token;
      i++;
      if (cmd === 'z' || cmd === 'Z') {
        out.push('Z');
        curX = subStartX;
        curY = subStartY;
      }
      continue;
    }

    const isRel = cmd === cmd.toLowerCase();
    const upper = cmd.toUpperCase();

    if (upper === 'M') {
      const rawX = parseFloat(tokens[i++]);
      const rawY = parseFloat(tokens[i++]);
      if (Number.isNaN(rawX) || Number.isNaN(rawY)) break;
      const nx = isRel ? curX + rawX : rawX;
      const ny = isRel ? curY + rawY : rawY;
      curX = nx;
      curY = ny;
      subStartX = nx;
      subStartY = ny;
      out.push(`M ${tx(nx)} ${ty(ny)}`);
      // Subsequent coordinate pairs after M/m are treated as implicit L/l in SVG spec
      cmd = isRel ? 'l' : 'L';
    } else if (upper === 'L' || upper === 'T') {
      const rawX = parseFloat(tokens[i++]);
      const rawY = parseFloat(tokens[i++]);
      if (Number.isNaN(rawX) || Number.isNaN(rawY)) break;
      const nx = isRel ? curX + rawX : rawX;
      const ny = isRel ? curY + rawY : rawY;
      curX = nx;
      curY = ny;
      out.push(`${upper} ${tx(nx)} ${ty(ny)}`);
    } else if (upper === 'H') {
      const rawX = parseFloat(tokens[i++]);
      if (Number.isNaN(rawX)) break;
      const nx = isRel ? curX + rawX : rawX;
      curX = nx;
      out.push(`L ${tx(curX)} ${ty(curY)}`);
    } else if (upper === 'V') {
      const rawY = parseFloat(tokens[i++]);
      if (Number.isNaN(rawY)) break;
      const ny = isRel ? curY + rawY : rawY;
      curY = ny;
      out.push(`L ${tx(curX)} ${ty(curY)}`);
    } else if (upper === 'C') {
      const rX1 = parseFloat(tokens[i++]);
      const rY1 = parseFloat(tokens[i++]);
      const rX2 = parseFloat(tokens[i++]);
      const rY2 = parseFloat(tokens[i++]);
      const rX = parseFloat(tokens[i++]);
      const rY = parseFloat(tokens[i++]);
      if (Number.isNaN(rX) || Number.isNaN(rY)) break;
      const x1 = isRel ? curX + rX1 : rX1;
      const y1 = isRel ? curY + rY1 : rY1;
      const x2 = isRel ? curX + rX2 : rX2;
      const y2 = isRel ? curY + rY2 : rY2;
      const x = isRel ? curX + rX : rX;
      const y = isRel ? curY + rY : rY;
      curX = x;
      curY = y;
      out.push(`C ${tx(x1)} ${ty(y1)} ${tx(x2)} ${ty(y2)} ${tx(x)} ${ty(y)}`);
    } else if (upper === 'S' || upper === 'Q') {
      const rX1 = parseFloat(tokens[i++]);
      const rY1 = parseFloat(tokens[i++]);
      const rX = parseFloat(tokens[i++]);
      const rY = parseFloat(tokens[i++]);
      if (Number.isNaN(rX) || Number.isNaN(rY)) break;
      const x1 = isRel ? curX + rX1 : rX1;
      const y1 = isRel ? curY + rY1 : rY1;
      const x = isRel ? curX + rX : rX;
      const y = isRel ? curY + rY : rY;
      curX = x;
      curY = y;
      out.push(`${upper} ${tx(x1)} ${ty(y1)} ${tx(x)} ${ty(y)}`);
    } else if (upper === 'A') {
      const rx = parseFloat(tokens[i++]);
      const ry = parseFloat(tokens[i++]);
      const rot = parseFloat(tokens[i++]);
      const largeArc = parseFloat(tokens[i++]);
      const sweep = parseFloat(tokens[i++]);
      const rX = parseFloat(tokens[i++]);
      const rY = parseFloat(tokens[i++]);
      if (Number.isNaN(rX) || Number.isNaN(rY)) break;
      const x = isRel ? curX + rX : rX;
      const y = isRel ? curY + rY : rY;
      curX = x;
      curY = y;
      out.push(
        `A ${fmtNum(Math.abs(rx) * sx)} ${fmtNum(Math.abs(ry) * sy)} ${fmtNum(rot)} ${largeArc ? 1 : 0} ${sweep ? 1 : 0} ${tx(x)} ${ty(y)}`
      );
    } else {
      i++;
    }
  }

  return out.join(' ');
}
