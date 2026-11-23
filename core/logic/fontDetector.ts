/**
 * fontDetector.ts - Detecção, Hidratação e Aplicação Robusta de Fontes do Computador & Projeto
 *
 * Resolve de forma definitiva a desformatação de fontes na mesma máquina ao abrir projetos antigos:
 * 1. Normaliza nomes sujos/legados (ex: `"'Playfair Display', serif"` -> `"Playfair Display"`).
 * 2. Nunca marca como "carregada" uma fonte cujo binário ou folha de estilo ainda não foi confirmada.
 * 3. Carrega múltiplos pesos/estilos (Regular, Bold, Italic, SemiBold, Light...) via queryLocalFonts().
 * 4. Em Electron Desktop, lê binários reais de C:\Windows\Fonts / ~/Library/Fonts via readFontFile().
 * 5. Injeta regras @font-face com blob URL + document.fonts.add() para garantir render no Editor e no PDF.
 * 6. Suporta extração, diagnóstico de fontes ausentes (para pedir 1 clique de permissão quando necessário)
 *    e embutimento seguro no .json exportado.
 */
import * as opentype from 'opentype.js';
import type { AgendaConfig, LayoutElement } from '../../types';
import { localStorage } from '../../services/safeStorage';
import { saveFontToDB, getFontFromDB, getAllFontsFromDB, cleanStoredFontName } from './fontStorage';

// Lista abrangente de fontes comuns de sistemas operacionais (Windows, Mac, Linux)
export const CANDIDATE_SYSTEM_FONTS = [
  // Windows essenciais & clássicas
  'Arial', 'Arial Black', 'Bahnschrift', 'Calibri', 'Calibri Light', 'Cambria', 'Candara',
  'Century Gothic', 'Comic Sans MS', 'Consolas', 'Constantia', 'Corbel', 'Courier New',
  'Ebrima', 'Franklin Gothic Medium', 'Gabriola', 'Gadugi', 'Garamond', 'Georgia',
  'Impact', 'Ink Free', 'Javanese Text', 'Leelawadee UI', 'Lucida Console', 'Lucida Sans Unicode',
  'Malgun Gothic', 'Marlett', 'Microsoft Himalaya', 'Microsoft JhengHei', 'Microsoft New Tai Lue',
  'Microsoft PhagsPa', 'Microsoft Sans Serif', 'Microsoft Tai Le', 'Microsoft YaHei', 'Microsoft Yi Baiti',
  'MingLiU-ExtB', 'Mongolian Baiti', 'MS Gothic', 'MS PGothic', 'MS UI Gothic', 'MV Boli', 'Myanmar Text',
  'Nirmala UI', 'Palatino Linotype', 'Segoe Print', 'Segoe Script', 'Segoe UI', 'Segoe UI Historic',
  'Segoe UI Emoji', 'Segoe UI Symbol', 'SimSun', 'Sitka Text', 'Sylfaen', 'Symbol', 'Tahoma',
  'Times New Roman', 'Trebuchet MS', 'Verdana', 'Webdings', 'Wingdings', 'Yu Gothic',

  // Fontes decorativas e de exibição clássicas do Windows/Office
  'Book Antiqua', 'Bookman Old Style', 'Century', 'Century Schoolbook', 'Copperplate Gothic Bold',
  'Elephant', 'Forte', 'Gigi', 'Harrington', 'Jokerman', 'Juice ITC', 'Kristen ITC', 'Lucida Bright',
  'Lucida Calligraphy', 'Lucida Fax', 'Lucida Handwriting', 'Lucida Sans', 'Magneto',
  'Matura MT Script Capitals', 'Mistral', 'Modern No. 20', 'Monotype Corsiva', 'Niagara Engraved',
  'Niagara Solid', 'Old English Text MT', 'Onyx', 'Palace Script MT', 'Papyrus', 'Parchment',
  'Playbill', 'Pristina', 'Ravie', 'Script MT Bold', 'Showcard Gothic', 'Snap ITC', 'Viner Hand ITC',
  'Vivaldi', 'Vladimir Script', 'Wide Latin', 'Bell MT', 'Berlin Sans FB', 'Bernard MT Condensed',
  'Baskerville', 'Gill Sans', 'Futura', 'Optima', 'Chalkboard SE', 'Brush Script MT',

  // macOS essenciais
  'American Typewriter', 'Andale Mono', 'Apple Chancery', 'Apple Color Emoji', 'Apple SD Gothic Neo',
  'Avenir', 'Avenir Next', 'Big Caslon', 'Chalkboard', 'Chalkduster', 'Charter', 'Cochin',
  'Copperplate', 'Didot', 'Geneva', 'Helvetica', 'Helvetica Neue', 'Herculanum', 'Hoefler Text',
  'Lucida Grande', 'Luminari', 'Marker Felt', 'Menlo', 'Monaco', 'Noteworthy', 'Phosphate',
  'Rockwell', 'Savoye LET', 'SignPainter', 'Skia', 'Snell Roundhand', 'Trattatello', 'Zapfino'
];

// Fontes nativamente carregadas via Google Fonts no index.html (não devem ser mascaradas por src: local())
const BUILTIN_WEB_FONTS = new Set([
  'inter', 'playfair display', 'merriweather', 'dancing script', 'lato',
  'montserrat', 'roboto', 'open sans', 'oswald', 'raleway', 'pacifico',
  'caveat', 'lobster', 'comfortaa', 'bebas neue', 'nunito', 'quicksand',
  'poppins', 'cinzel', 'fira code', 'great vibes'
]);

const GENERIC_CSS_FONTS = new Set([
  'inherit', 'initial', 'unset', 'sans-serif', 'serif', 'monospace',
  'cursive', 'fantasy', 'system-ui', '-apple-system', 'blinkmacsystemfont'
]);

// Fontes empacotadas offline em /public/fonts/
const BUNDLED_FONT_URLS: Record<string, string> = {
  'cinzel': '/fonts/cinzel.ttf',
  'fira code': '/fonts/firacode.ttf',
  'firacode': '/fonts/firacode.ttf',
  'great vibes': '/fonts/greatvibes.ttf',
  'greatvibes': '/fonts/greatvibes.ttf',
  'playfair display': '/fonts/playfair.ttf',
  'playfair': '/fonts/playfair.ttf',
};

/**
 * Remove aspas, listas de fallback legadas (ex: `"'Playfair Display', serif"`) e espaços extras
 */
export function cleanFontFamilyName(raw?: string): string {
  if (!raw || typeof raw !== 'string') return '';
  let candidate = raw.trim();
  if (!candidate) return '';

  // Se veio lista CSS separada por vírgula, pega o primeiro token significativo
  if (candidate.includes(',')) {
    const parts = candidate.split(',').map(p => p.replace(/['"]/g, '').trim()).filter(Boolean);
    const nonGeneric = parts.find(p => !GENERIC_CSS_FONTS.has(p.toLowerCase()));
    candidate = nonGeneric || parts[0] || '';
  }

  return candidate.replace(/['"]/g, '').trim();
}

/**
 * Normaliza o nome da fonte para indexação uniforme
 */
export function normalizeFontKey(name: string): string {
  return cleanFontFamilyName(name).toLowerCase();
}

// Armazena TODOS os pesos/estilos FontData obtidos via queryLocalFonts para cada família/nome
const localFontDataHandles = new Map<string, any[]>();

// Cache de famílias que tiveram fonte REALMENTE carregada/confirmada nesta sessão
const loadedFontFamiliesSet = new Set<string>();

// Promises em andamento para evitar carregamentos duplicados concorrentes
const inFlightFontLoads = new Map<string, Promise<boolean>>();

// Cache em memória dos binários carregados + blob URLs injetadas no DOM
const loadedBinaryCache = new Map<string, { name: string; buffer: ArrayBuffer; blobUrl: string }>();
const injectedFaceSignatures = new Set<string>();

// Lista de fontes do SO retornada pelo IPC Electron (cacheada)
let electronSystemFontsCache: Array<{ name: string; fileName: string; path: string; ext: string }> | null = null;

// Estado da permissão queryLocalFonts() no navegador
export type LocalFontPermissionStatus = 'unknown' | 'granted' | 'prompt_needed' | 'unsupported';
let localFontsPermissionState: LocalFontPermissionStatus = 'unknown';

export function getLocalFontsPermissionState(): LocalFontPermissionStatus {
  if (typeof window === 'undefined') return 'unsupported';
  if (!('queryLocalFonts' in window)) return 'unsupported';
  return localFontsPermissionState;
}

export function clearUnresolvedFontCache(): void {
  // Como só inserimos fontes confirmadas em loadedFontFamiliesSet, nada incorreto precisa ser limpo,
  // mas limpamos eventuais promises antigas e caches de verificação para nova tentativa limpa.
  inFlightFontLoads.clear();
}

function inferWeightAndStyle(styleLabel?: string): { weight: string; style: 'normal' | 'italic' } {
  const s = (styleLabel || '').toLowerCase();
  const fontStyle: 'normal' | 'italic' = (s.includes('italic') || s.includes('oblique')) ? 'italic' : 'normal';
  let weight = '400';

  if (s.includes('thin') || s.includes('hairline')) weight = '100';
  else if (s.includes('extralight') || s.includes('ultralight') || s.includes('extra light')) weight = '200';
  else if (s.includes('light')) weight = '300';
  else if (s.includes('medium')) weight = '500';
  else if (s.includes('semibold') || s.includes('demibold') || s.includes('semi bold')) weight = '600';
  else if (s.includes('extrabold') || s.includes('ultrabold') || s.includes('extra bold')) weight = '800';
  else if (s.includes('black') || s.includes('heavy')) weight = '900';
  else if (s.includes('bold')) weight = '700';

  return { weight, style: fontStyle };
}

function pushHandleForKey(key: string, fd: any): void {
  if (!key) return;
  const arr = localFontDataHandles.get(key) || [];
  const exists = arr.some(
    (item) => item === fd || (item.postscriptName && fd.postscriptName && item.postscriptName === fd.postscriptName)
  );
  if (!exists) {
    arr.push(fd);
    localFontDataHandles.set(key, arr);
  }
}

/**
 * Registra um handle FontData na memória preservando TODOS os pesos/estilos da mesma família
 */
export function registerLocalFontHandle(fd: any): void {
  if (!fd) return;
  if (fd.family) {
    const kFam = normalizeFontKey(fd.family);
    pushHandleForKey(kFam, fd);
    pushHandleForKey(kFam.replace(/[\s_-]+/g, ''), fd);
  }
  if (fd.fullName) {
    const kFull = normalizeFontKey(fd.fullName);
    pushHandleForKey(kFull, fd);
    pushHandleForKey(kFull.replace(/[\s_-]+/g, ''), fd);
  }
  if (fd.postscriptName) {
    const kPs = normalizeFontKey(fd.postscriptName);
    pushHandleForKey(kPs, fd);
  }
}

/**
 * Retorna todos os handles FontData disponíveis para um nome de família
 */
export function getLocalFontHandles(name: string): any[] {
  const k = normalizeFontKey(name);
  if (!k) return [];
  const direct = localFontDataHandles.get(k);
  if (direct && direct.length > 0) return direct;
  const folded = localFontDataHandles.get(k.replace(/[\s_-]+/g, ''));
  if (folded && folded.length > 0) return folded;
  // Tenta sem sufixo legado _xxxxx
  const strippedLegacy = k.replace(/_[a-z0-9]{4,7}$/i, '');
  if (strippedLegacy && strippedLegacy !== k) {
    return localFontDataHandles.get(strippedLegacy) || localFontDataHandles.get(strippedLegacy.replace(/[\s_-]+/g, '')) || [];
  }
  return [];
}

/**
 * Busca o handle principal (Regular) de FontData correspondente ao nome da família
 */
export function getLocalFontHandle(name: string): any {
  const handles = getLocalFontHandles(name);
  if (handles.length === 0) return null;
  const regular = handles.find((fd) => !fd.style || /regular|normal|book|roman/i.test(fd.style));
  return regular || handles[0];
}

function appendBinaryFontCssRule(familyName: string, blobUrl: string, weight: string = 'normal', style: string = 'normal'): void {
  if (typeof document === 'undefined') return;
  const signature = `${familyName.toLowerCase()}|${weight}|${style}`;
  if (injectedFaceSignatures.has(signature)) return;
  injectedFaceSignatures.add(signature);

  let styleEl = document.getElementById('agendamaster-binary-fonts-css') as HTMLStyleElement | null;
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = 'agendamaster-binary-fonts-css';
    document.head.appendChild(styleEl);
  }
  const escapedFamily = familyName.replace(/"/g, '\\"');
  styleEl.textContent = `${styleEl.textContent ? styleEl.textContent + '\n' : ''}@font-face { font-family: "${escapedFamily}"; src: url("${blobUrl}"); font-weight: ${weight}; font-style: ${style}; font-display: swap; }`;
}

/**
 * Registra um binário TTF/OTF/WOFF no document.fonts E em folha <style> para PDF/html2canvas
 */
export async function registerFontBinaryInDocument(
  familyName: string,
  buffer: ArrayBuffer,
  descriptors?: { weight?: string; style?: 'normal' | 'italic' }
): Promise<boolean> {
  if (!familyName || !buffer || buffer.byteLength === 0 || typeof document === 'undefined') return false;
  const clean = cleanFontFamilyName(familyName);
  if (!clean) return false;

  const weight = descriptors?.weight || '400';
  const style = descriptors?.style || 'normal';
  const cacheKey = `${clean.toLowerCase()}|${weight}|${style}`;

  try {
    let cached = loadedBinaryCache.get(cacheKey);
    if (!cached) {
      const blob = new Blob([buffer], { type: 'font/sfnt' });
      const blobUrl = URL.createObjectURL(blob);
      cached = { name: clean, buffer, blobUrl };
      loadedBinaryCache.set(cacheKey, cached);
      // Também guarda pela chave simples da família para exportação
      if (!loadedBinaryCache.has(clean.toLowerCase())) {
        loadedBinaryCache.set(clean.toLowerCase(), cached);
      }
    }

    const fontFace = new FontFace(clean, buffer.slice(0), { weight, style });
    const loadedFace = await fontFace.load();
    (document as any).fonts.add(loadedFace);
    appendBinaryFontCssRule(clean, cached.blobUrl, weight, style);

    loadedFontFamiliesSet.add(normalizeFontKey(clean));
    return true;
  } catch (err) {
    console.warn(`[FontDetector] Falha ao registrar FontFace "${clean}" (${weight}/${style}):`, err);
    return false;
  }
}

/**
 * Retorna uma declaração CSS segura para fontFamily com aspas e fallbacks genéricos adequados
 */
export function getSafeFontFamily(fontFamily?: string): string {
  if (!fontFamily) return 'Inter, sans-serif';
  const clean = cleanFontFamilyName(fontFamily);
  if (!clean) return 'Inter, sans-serif';
  if (GENERIC_CSS_FONTS.has(clean.toLowerCase())) return clean;

  const lower = clean.toLowerCase();
  let genericFallback = 'sans-serif';
  if (/serif|times|georgia|garamond|baskerville|playfair|merriweather|cambria|palatino|cinzel/i.test(lower)) {
    genericFallback = 'serif';
  } else if (/script|brush|cursive|vibes|dancing|caveat|allura|parisienne|calligra|edwardian|vivaldi|sacramento|pinyon/i.test(lower)) {
    genericFallback = 'cursive, sans-serif';
  } else if (/mono|courier|consolas|code/i.test(lower)) {
    genericFallback = 'monospace';
  }
  return `"${clean}", ${genericFallback}`;
}

/**
 * Injeta regras @font-face { src: local(...) } no DOM apenas para fontes que NÃO são web fonts embutidas
 */
export function injectLocalFontFaceStyles(fonts: string[]): void {
  if (typeof document === 'undefined') return;
  let styleEl = document.getElementById('agendamaster-local-fonts-css') as HTMLStyleElement | null;
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = 'agendamaster-local-fonts-css';
    document.head.appendChild(styleEl);
  }

  const existingText = styleEl.textContent || '';
  const rules: string[] = [];

  for (const font of fonts) {
    const clean = cleanFontFamilyName(font);
    if (!clean || clean.length < 2) continue;
    const lower = clean.toLowerCase();
    // Nunca sobrescreve Google Fonts / fontes nativas com src: local() sem pesos
    if (BUILTIN_WEB_FONTS.has(lower) || GENERIC_CSS_FONTS.has(lower)) continue;
    if (existingText.includes(`"${clean}"`)) continue;

    const noSpaces = clean.replace(/\s+/g, '');
    rules.push(
      `@font-face { font-family: "${clean}"; src: local("${clean}"), local("${noSpaces}"); font-display: swap; }`
    );
  }

  if (rules.length > 0) {
    styleEl.textContent = (existingText ? existingText + '\n' : '') + rules.join('\n');
  }
}

/**
 * Injeta dinamicamente stylesheet do Google Fonts e aguarda confirmação real de carregamento
 */
export async function loadGoogleFontFallback(fontFamily: string): Promise<boolean> {
  if (typeof document === 'undefined') return false;
  const clean = cleanFontFamilyName(fontFamily);
  if (!clean || GENERIC_CSS_FONTS.has(clean.toLowerCase())) return false;

  const linkId = `gfont-${clean.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}`;
  const existing = document.getElementById(linkId) as HTMLLinkElement | null;
  if (existing) {
    try {
      await (document as any).fonts.load(`12px "${clean}"`);
      return isFontRegisteredInDocumentFonts(clean);
    } catch (_) {
      return isFontRegisteredInDocumentFonts(clean);
    }
  }

  return new Promise<boolean>((resolve) => {
    const link = document.createElement('link');
    link.id = linkId;
    link.rel = 'stylesheet';
    const encoded = encodeURIComponent(clean).replace(/%20/g, '+');
    link.href = `https://fonts.googleapis.com/css2?family=${encoded}:ital,wght@0,400;0,700;1,400&display=swap`;
    link.crossOrigin = 'anonymous';

    let settled = false;
    const finish = async (ok: boolean) => {
      if (settled) return;
      settled = true;
      if (ok) {
        try {
          await (document as any).fonts.load(`12px "${clean}"`);
          await (document as any).fonts.load(`700 12px "${clean}"`);
        } catch (_) {}
        const verified = isFontRegisteredInDocumentFonts(clean) || isFontInstalledLocally(clean);
        if (verified) {
          loadedFontFamiliesSet.add(normalizeFontKey(clean));
          dispatchFontApplied(clean);
        }
        resolve(verified);
      } else {
        // Fallback simples sem variações de peso (algumas fontes Google Fonts têm apenas peso 400)
        try {
          const simpleLink = document.createElement('link');
          simpleLink.id = `${linkId}-simple`;
          simpleLink.rel = 'stylesheet';
          simpleLink.href = `https://fonts.googleapis.com/css2?family=${encoded}&display=swap`;
          simpleLink.crossOrigin = 'anonymous';
          simpleLink.onload = async () => {
            try { await (document as any).fonts.load(`12px "${clean}"`); } catch (_) {}
            const verified = isFontRegisteredInDocumentFonts(clean);
            if (verified) {
              loadedFontFamiliesSet.add(normalizeFontKey(clean));
              dispatchFontApplied(clean);
            }
            resolve(verified);
          };
          simpleLink.onerror = () => resolve(false);
          document.head.appendChild(simpleLink);
        } catch (_) {
          resolve(false);
        }
      }
    };

    link.onload = () => finish(true);
    link.onerror = () => finish(false);
    setTimeout(() => finish(false), 3500);
    document.head.appendChild(link);
  });
}

function dispatchFontApplied(fontFamily: string): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('font-applied', { detail: { fontFamily } }));
  }
}

function isFontRegisteredInDocumentFonts(cleanFamily: string): boolean {
  if (typeof document === 'undefined' || !(document as any).fonts) return false;
  const target = normalizeFontKey(cleanFamily);
  if (!target) return false;
  try {
    for (const face of Array.from((document as any).fonts) as FontFace[]) {
      const faceFamily = normalizeFontKey(face.family);
      if (faceFamily === target && face.status === 'loaded') {
        return true;
      }
    }
    if ((document as any).fonts.check(`12px "${cleanFamily}"`)) {
      // fonts.check retorna true também para fontes do sistema quando presentes, mas evita falso positivo checando status
      for (const face of Array.from((document as any).fonts) as FontFace[]) {
        if (normalizeFontKey(face.family) === target && face.status !== 'error') {
          return true;
        }
      }
    }
  } catch (_) {}
  return false;
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryStr = atob(base64);
  const len = binaryStr.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryStr.charCodeAt(i);
  }
  return bytes.buffer;
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode(...chunk);
  }
  return btoa(binary);
}

/**
 * Tenta carregar binário da fonte diretamente via IPC Electron (Windows/Mac/Linux Fonts folder)
 */
async function tryLoadFontFromElectronDisk(cleanFamily: string): Promise<boolean> {
  const winAny = typeof window !== 'undefined' ? (window as any) : null;
  if (!winAny?.electronAPI?.isElectron || typeof winAny.electronAPI.getSystemFonts !== 'function') {
    return false;
  }

  try {
    if (!electronSystemFontsCache) {
      const list = await winAny.electronAPI.getSystemFonts();
      if (Array.isArray(list)) {
        electronSystemFontsCache = list;
      }
    }
    if (!electronSystemFontsCache || electronSystemFontsCache.length === 0) return false;

    const targetNorm = normalizeFontKey(cleanFamily);
    const targetFolded = targetNorm.replace(/[\s_-]+/g, '');
    const targetNoHash = targetNorm.replace(/_[a-z0-9]{4,7}$/i, '').replace(/[\s_-]+/g, '');

    const weightTokenSuffixRe = /^[-_\s]*(regular|normal|book|roman|light|lt|medium|md|semibold|demibold|sb|bold|bd|italic|it|i|bolditalic|bi|black|blk|heavy|oblique)?$/i;
    const isMatch = (candidateStr: string) => {
      if (candidateStr === targetFolded || (targetNoHash && candidateStr === targetNoHash)) return true;
      if (targetNoHash && candidateStr.startsWith(targetNoHash)) {
        const rest = candidateStr.slice(targetNoHash.length);
        return weightTokenSuffixRe.test(rest);
      }
      return false;
    };

    const candidates = electronSystemFontsCache.filter((item) => {
      const nameNorm = normalizeFontKey(item.name);
      const fileNoExt = cleanStoredFontName(item.fileName).toLowerCase();
      const nameFolded = nameNorm.replace(/[\s_-]+/g, '');
      const fileFolded = fileNoExt.replace(/[\s_-]+/g, '');
      return (
        nameNorm === targetNorm ||
        fileNoExt === targetNorm ||
        isMatch(nameFolded) ||
        isMatch(fileFolded)
      );
    });

    if (candidates.length === 0 || typeof winAny.electronAPI.readFontFile !== 'function') return false;

    let anyLoaded = false;
    // Lê até 6 arquivos candidatos (Regular, Bold, Italic, etc.)
    for (const item of candidates.slice(0, 6)) {
      try {
        const res = await winAny.electronAPI.readFontFile(item.path);
        if (res?.success && res.data) {
          const buffer = base64ToArrayBuffer(res.data);
          let inferredWeight = '400';
          let inferredStyle: 'normal' | 'italic' = 'normal';
          let parsedFamily = cleanFamily;

          try {
            const parsed = opentype.parse(buffer.slice(0));
            const namesAny = parsed?.names as any;
            const famObj = namesAny?.preferredFamily || parsed?.names?.fontFamily;
            const subObj = namesAny?.preferredSubfamily || parsed?.names?.fontSubfamily;
            const realFamily = famObj ? (famObj.en || famObj.pt || Object.values(famObj)[0]) : undefined;
            const subName = subObj ? (subObj.en || subObj.pt || Object.values(subObj)[0]) : undefined;
            if (typeof subName === 'string') {
              const inf = inferWeightAndStyle(subName);
              inferredWeight = inf.weight;
              inferredStyle = inf.style;
            }
            if (typeof realFamily === 'string' && realFamily.trim()) {
              parsedFamily = realFamily.trim();
            }
          } catch (_) {
            const inf = inferWeightAndStyle(item.fileName);
            inferredWeight = inf.weight;
            inferredStyle = inf.style;
          }

          const ok = await registerFontBinaryInDocument(cleanFamily, buffer, {
            weight: inferredWeight,
            style: inferredStyle,
          });
          if (ok) {
            anyLoaded = true;
            if (parsedFamily && normalizeFontKey(parsedFamily) !== normalizeFontKey(cleanFamily)) {
              await registerFontBinaryInDocument(parsedFamily, buffer, {
                weight: inferredWeight,
                style: inferredStyle,
              });
            }
            if (inferredWeight === '400' && inferredStyle === 'normal') {
              await saveFontToDB(cleanFamily, buffer).catch(() => {});
            }
          }
        }
      } catch (_) {}
    }

    if (anyLoaded) {
      dispatchFontApplied(cleanFamily);
    }
    return anyLoaded;
  } catch (_) {
    return false;
  }
}

/**
 * GARANTIA ABSOLUTA DE APLICAÇÃO DE FONTE:
 * Carrega fisicamente todos os pesos/estilos disponíveis via queryLocalFonts, IndexedDB, Electron ou /public/fonts.
 * NUNCA marca como carregada uma fonte cujo carregamento falhou silenciosamente.
 */
export async function ensureFontLoaded(fontFamily: string): Promise<boolean> {
  if (!fontFamily || typeof document === 'undefined') return false;
  const cleanFamily = cleanFontFamilyName(fontFamily);
  if (!cleanFamily) return false;
  const key = normalizeFontKey(cleanFamily);

  if (GENERIC_CSS_FONTS.has(key) || key === 'inter') {
    loadedFontFamiliesSet.add(key);
    return true;
  }

  // Se já foi confirmada nesta sessão
  if (loadedFontFamiliesSet.has(key)) {
    return true;
  }

  // Deduplica chamadas concorrentes para a mesma família
  const activePromise = inFlightFontLoads.get(key);
  if (activePromise) {
    return activePromise;
  }

  const task = (async (): Promise<boolean> => {
    try {
      // 0. Verifica se já está registrada e carregada no document.fonts (ex: Google Font do index.html)
      if (BUILTIN_WEB_FONTS.has(key)) {
        try {
          await Promise.race([
            (document as any).fonts.load(`12px "${cleanFamily}"`),
            new Promise(res => setTimeout(res, 1500))
          ]);
        } catch (_) {}
        if (isFontRegisteredInDocumentFonts(cleanFamily)) {
          loadedFontFamiliesSet.add(key);
          return true;
        }
      }

      // 1. Fontes empacotadas offline em /public/fonts/
      const bundledUrl = BUNDLED_FONT_URLS[key];
      if (bundledUrl) {
        try {
          const resp = await fetch(bundledUrl);
          if (resp.ok) {
            const buffer = await resp.arrayBuffer();
            const ok = await registerFontBinaryInDocument(cleanFamily, buffer, { weight: '400', style: 'normal' });
            if (ok) {
              dispatchFontApplied(cleanFamily);
              return true;
            }
          }
        } catch (_) {}
      }

      // 2. IndexedDB local (rápido, offline, sem permissão) - com busca tolerante a extensão e sufixo legado
      try {
        const stored = await getFontFromDB(cleanFamily);
        if (stored && stored.buffer) {
          const ok = await registerFontBinaryInDocument(cleanFamily, stored.buffer, { weight: '400', style: 'normal' });
          if (ok) {
            dispatchFontApplied(cleanFamily);
            return true;
          }
        }
      } catch (_) {}

      // 3. Chromium Local Font Access (queryLocalFonts) — carrega TODOS os pesos/estilos da família
      let handles = getLocalFontHandles(cleanFamily);
      const winAny = typeof window !== 'undefined' ? (window as any) : null;
      if (handles.length === 0 && winAny && typeof winAny.queryLocalFonts === 'function') {
        try {
          const allHandles = await winAny.queryLocalFonts();
          if (Array.isArray(allHandles) && allHandles.length > 0) {
            localFontsPermissionState = 'granted';
            for (const fd of allHandles) {
              registerLocalFontHandle(fd);
            }
            handles = getLocalFontHandles(cleanFamily);
          }
        } catch (err: any) {
          // Sem gesto do usuário ou permissão pendente -> não marcar como carregada!
          if (localFontsPermissionState !== 'granted') {
            localFontsPermissionState = 'prompt_needed';
          }
        }
      }

      if (handles.length > 0) {
        // Prioriza Regular/Normal primeiro, depois carrega os demais pesos/itálicos (até 8 variantes)
        const sortedHandles = [...handles].sort((a, b) => {
          const aReg = !a.style || /regular|normal|book|roman/i.test(a.style) ? 0 : 1;
          const bReg = !b.style || /regular|normal|book|roman/i.test(b.style) ? 0 : 1;
          return aReg - bReg;
        });

        let loadedAnyHandle = false;
        let savedPrimaryToDb = false;

        for (const handle of sortedHandles.slice(0, 8)) {
          if (!handle || typeof handle.blob !== 'function') continue;
          try {
            const blob: Blob = await handle.blob();
            const buffer = await blob.arrayBuffer();
            const { weight, style } = inferWeightAndStyle(handle.style);

            const ok = await registerFontBinaryInDocument(cleanFamily, buffer, { weight, style });
            if (ok) {
              loadedAnyHandle = true;
              if (handle.postscriptName && normalizeFontKey(handle.postscriptName) !== key) {
                await registerFontBinaryInDocument(handle.postscriptName, buffer, { weight, style }).catch(() => {});
              }
              if (!savedPrimaryToDb && weight === '400' && style === 'normal') {
                savedPrimaryToDb = true;
                await saveFontToDB(cleanFamily, buffer).catch(() => {});
              }
            }
          } catch (err) {
            console.warn(`[FontDetector] Falha ao extrair blob da fonte local "${cleanFamily}":`, err);
          }
        }

        if (loadedAnyHandle) {
          if (!savedPrimaryToDb && sortedHandles[0]?.blob) {
            try {
              const b = await sortedHandles[0].blob();
              await saveFontToDB(cleanFamily, await b.arrayBuffer());
            } catch (_) {}
          }
          dispatchFontApplied(cleanFamily);
          return true;
        }
      }

      // 4. Electron Desktop: lê arquivo .ttf/.otf diretamente da pasta de fontes do sistema
      const loadedElectron = await tryLoadFontFromElectronDisk(cleanFamily);
      if (loadedElectron) {
        return true;
      }

      // 5. Fallback de métrica de sistema já instalada nativamente (ex: Arial, Times New Roman, Georgia)
      if (isFontInstalledLocally(cleanFamily)) {
        injectLocalFontFaceStyles([cleanFamily]);
        loadedFontFamiliesSet.add(key);
        return true;
      }

      // 6. Tenta Google Fonts apenas se for uma web font ou não estiver claramente com sufixo legado customizado
      const looksLikeUploadedLegacy = /_[a-z0-9]{4,7}$/i.test(cleanFamily);
      if (!looksLikeUploadedLegacy) {
        const gOk = await loadGoogleFontFallback(cleanFamily);
        if (gOk) {
          return true;
        }
      }

      // NÃO adiciona em loadedFontFamiliesSet se falhou! Assim, se a usuária liberar permissão
      // ou subir o arquivo depois, o sistema tentará novamente e aplicará na hora.
      return false;
    } finally {
      inFlightFontLoads.delete(key);
    }
  })();

  inFlightFontLoads.set(key, task);
  return task;
}

/**
 * Detecta se uma fonte específica está fisicamente instalada no computador
 * comparando as métricas de renderização em um canvas off-screen contra 3 fontes padrão.
 */
export function isFontInstalledLocally(fontName: string): boolean {
  if (typeof window === 'undefined' || typeof document === 'undefined') return false;
  const clean = cleanFontFamilyName(fontName);
  if (!clean) return false;

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) return false;

  const testString = 'mmmmmmmmmmlli!@#$%^&*()_+-=~`[]{}|;:,.<>?0123456789WwQq';
  const baselineFonts = ['monospace', 'sans-serif', 'serif'];

  const baselineWidths: Record<string, number> = {};
  for (const base of baselineFonts) {
    context.font = `72px ${base}`;
    baselineWidths[base] = context.measureText(testString).width;
  }

  for (const base of baselineFonts) {
    context.font = `72px "${clean}", ${base}`;
    const measuredWidth = context.measureText(testString).width;
    if (measuredWidth !== baselineWidths[base]) {
      return true;
    }
  }

  return false;
}

/**
 * Verifica se a fonte já está efetivamente disponível para renderização fiel no navegador atual
 */
export function isFontAvailableForRender(fontFamily: string): boolean {
  const clean = cleanFontFamilyName(fontFamily);
  if (!clean) return true;
  const key = normalizeFontKey(clean);
  if (GENERIC_CSS_FONTS.has(key) || key === 'inter') return true;
  if (loadedFontFamiliesSet.has(key)) return true;
  if (isFontRegisteredInDocumentFonts(clean)) {
    loadedFontFamiliesSet.add(key);
    return true;
  }
  if (isFontInstalledLocally(clean)) {
    loadedFontFamiliesSet.add(key);
    return true;
  }
  return false;
}

/**
 * Solicita explicitamente permissão ao navegador via gesto do usuário (clique) para acessar TODAS
 * as fontes instaladas no computador via Chromium queryLocalFonts().
 */
export async function requestLocalFontsPermission(): Promise<{ granted: boolean; families: string[] }> {
  const winAny = typeof window !== 'undefined' ? (window as any) : null;
  if (!winAny || typeof winAny.queryLocalFonts !== 'function') {
    localFontsPermissionState = 'unsupported';
    return { granted: false, families: [] };
  }

  try {
    const localFonts = await winAny.queryLocalFonts();
    if (Array.isArray(localFonts)) {
      localFontsPermissionState = 'granted';
      clearUnresolvedFontCache();
      const famSet = new Set<string>();
      localFonts.forEach((fd: any) => {
        if (fd && fd.family) {
          famSet.add(fd.family);
          registerLocalFontHandle(fd);
        }
      });
      const families = Array.from(famSet).sort((a, b) => a.localeCompare(b));
      injectLocalFontFaceStyles(families);
      try {
        localStorage.setItem('agendamaster_auto_detected_fonts', JSON.stringify(families));
      } catch (_) {}
      return { granted: true, families };
    }
    return { granted: false, families: [] };
  } catch (err) {
    localFontsPermissionState = 'prompt_needed';
    return { granted: false, families: [] };
  }
}

/**
 * Identifica automaticamente todas as fontes instaladas no computador
 * combinando o canal nativo Desktop (Electron), a API queryLocalFonts (quando permitida)
 * e a verificação instantânea por métricas de Canvas.
 */
export async function detectInstalledFonts(): Promise<string[]> {
  const detected = new Set<string>();

  // 1. Desktop / Electron: Acesso direto e completo ao diretório de fontes do sistema
  const winAny = typeof window !== 'undefined' ? (window as any) : null;
  if (winAny?.electronAPI?.isElectron && typeof winAny.electronAPI.getSystemFonts === 'function') {
    try {
      const sysFonts = await winAny.electronAPI.getSystemFonts();
      if (Array.isArray(sysFonts)) {
        electronSystemFontsCache = sysFonts;
        sysFonts.forEach((f: any) => {
          if (f && f.name) detected.add(f.name);
        });
      }
    } catch (e) {
      console.warn('Erro ao ler fontes do sistema via Electron:', e);
    }
  }

  // 2. Chromium queryLocalFonts (quando disponível e com permissão)
  if (winAny && 'queryLocalFonts' in winAny) {
    try {
      const localFonts = await winAny.queryLocalFonts();
      if (Array.isArray(localFonts)) {
        localFontsPermissionState = 'granted';
        localFonts.forEach((f: any) => {
          if (f && f.family) {
            detected.add(f.family);
            registerLocalFontHandle(f);
          }
        });
      }
    } catch (e) {
      if (localFontsPermissionState !== 'granted') {
        localFontsPermissionState = 'prompt_needed';
      }
    }
  } else {
    localFontsPermissionState = 'unsupported';
  }

  // 3. Verificação instantânea por métricas de Canvas (100% compatível, zero permissões necessárias)
  try {
    for (const fontName of CANDIDATE_SYSTEM_FONTS) {
      if (isFontInstalledLocally(fontName)) {
        detected.add(fontName);
      }
    }
  } catch (e) {
    console.warn('Erro na detecção de fontes por canvas:', e);
  }

  const result = Array.from(detected).sort((a, b) => a.localeCompare(b));

  // Injeta regras @font-face { src: local(...) } no CSS (pulando web fonts built-in)
  injectLocalFontFaceStyles(result);

  if (typeof localStorage !== 'undefined' && result.length > 0) {
    try {
      localStorage.setItem('agendamaster_auto_detected_fonts', JSON.stringify(result));
    } catch (_) {}
  }

  return result;
}

/**
 * Recupera fontes do cache local síncrono para render imediato
 */
export function getCachedInstalledFonts(): string[] {
  if (typeof localStorage === 'undefined') return [];
  try {
    const cached = localStorage.getItem('agendamaster_auto_detected_fonts');
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        injectLocalFontFaceStyles(parsed);
        return parsed;
      }
    }
  } catch (_) {}
  return [];
}

/**
 * Extrai TODAS as famílias de fontes referenciadas em qualquer lugar do projeto (miolo, semanais, divisórias, capa, tabelas, calendários, estilos)
 */
export function extractProjectFontFamilies(config?: Partial<AgendaConfig> | null): string[] {
  if (!config || typeof config !== 'object') return [];
  const found = new Map<string, string>(); // normalizedKey -> displayCleanName

  const addFont = (raw?: string) => {
    const clean = cleanFontFamilyName(raw);
    if (!clean) return;
    const key = normalizeFontKey(clean);
    if (!key || GENERIC_CSS_FONTS.has(key)) return;
    if (!found.has(key)) {
      found.set(key, clean);
    }
  };

  const scanElement = (el?: LayoutElement) => {
    if (!el?.style) return;
    const st = el.style;
    addFont(st.fontFamily);

    if (st.plannerDayBox) {
      addFont(st.plannerDayBox.fontFamily);
      addFont(st.plannerDayBox.headerFontFamily);
      addFont(st.plannerDayBox.holidayFontFamily);
    }

    if (st.fullCalendar) {
      addFont(st.fullCalendar.title?.fontFamily);
      addFont(st.fullCalendar.weekDays?.fontFamily);
      addFont(st.fullCalendar.days?.fontFamily);
      addFont(st.fullCalendar.specialDays?.style?.fontFamily);
    }

    if (st.table) {
      addFont(st.table.textStyle?.fontFamily);
      if (st.table.rowStyles) {
        Object.values(st.table.rowStyles).forEach((rs: any) => addFont(rs?.fontFamily));
      }
      if (st.table.colStyles) {
        Object.values(st.table.colStyles).forEach((cs: any) => addFont(cs?.fontFamily));
      }
      if (st.table.cellStyles) {
        Object.values(st.table.cellStyles).forEach((cs: any) => addFont(cs?.fontFamily));
      }
    }
  };

  const scanList = (list?: LayoutElement[]) => {
    if (Array.isArray(list)) list.forEach(scanElement);
  };

  scanList(config.elements);
  scanList(config.elementsVerso);
  scanList(config.elementsSaturday);
  scanList(config.elementsSunday);
  scanList(config.elementsWeekendTransition);
  scanList(config.fillerPageElements);
  scanList(config.elementsTop);
  scanList(config.elementsBottom);
  scanList(config.elementsWeeklyLeft);
  scanList(config.elementsWeeklyRight);
  scanList(config.elementsWeeklyVersoLeft);
  scanList(config.elementsWeeklyVersoRight);

  config.introPages?.forEach(p => scanList(p.elements));
  config.monthlyIntroPages?.forEach(p => scanList(p.elements));
  scanList(config.monthlyDividerStyle?.elements);
  scanList(config.monthlyDividerStyle?.versoElements);
  config.cover?.pages?.forEach(p => scanList(p.elements));
  config.styles?.characterStyles?.forEach(cs => addFont(cs.fontFamily));

  if (config.embeddedFonts && typeof config.embeddedFonts === 'object') {
    Object.values(config.embeddedFonts).forEach(ef => addFont(ef?.name));
  }

  return Array.from(found.values());
}

export interface ProjectFontHydrationResult {
  allFonts: string[];
  loadedFonts: string[];
  missingFonts: string[];
  needsLocalPermission: boolean;
}

/**
 * Hidrata e verifica TODAS as fontes de um projeto ao abrir/importar/exportar PDF:
 * - Restaura fontes embutidas (`config.embeddedFonts`) caso existam no .json
 * - Registra fontes do IndexedDB com nomes normalizados
 * - Dispara ensureFontLoaded para todas as fontes usadas no projeto
 * - Retorna exatamente quais fontes ainda não puderam ser carregadas (ex: faltando permissão queryLocalFonts ou arquivo TTF)
 */
export async function hydrateProjectFonts(config?: Partial<AgendaConfig> | null): Promise<ProjectFontHydrationResult> {
  if (typeof document === 'undefined' || !config) {
    return { allFonts: [], loadedFonts: [], missingFonts: [], needsLocalPermission: false };
  }

  // 1. Restaura eventuais fontes embutidas diretamente no .json do projeto
  if (config.embeddedFonts && typeof config.embeddedFonts === 'object') {
    for (const [keyName, entry] of Object.entries(config.embeddedFonts)) {
      if (!entry || !entry.base64) continue;
      const targetName = cleanFontFamilyName(entry.name || keyName);
      if (!targetName) continue;
      try {
        const buffer = base64ToArrayBuffer(entry.base64);
        await registerFontBinaryInDocument(targetName, buffer, { weight: '400', style: 'normal' });
        await saveFontToDB(targetName, buffer).catch(() => {});
      } catch (err) {
        console.warn(`[FontDetector] Erro ao restaurar fonte embutida "${targetName}":`, err);
      }
    }
  }

  // 2. Garante que todas as fontes do IndexedDB estejam carregadas tanto pelo nome salvo quanto pelo nome limpo (sem .ttf)
  try {
    const stored = await getAllFontsFromDB();
    for (const font of stored) {
      if (!font?.buffer || font.buffer.byteLength === 0) continue;
      const cleanName = cleanStoredFontName(font.name);
      if (cleanName) {
        await registerFontBinaryInDocument(cleanName, font.buffer, { weight: '400', style: 'normal' });
      }
      if (font.name && font.name !== cleanName) {
        await registerFontBinaryInDocument(font.name, font.buffer, { weight: '400', style: 'normal' });
      }
    }
  } catch (_) {}

  // 3. Carrega todas as fontes referenciadas no projeto
  const allFonts = extractProjectFontFamilies(config);
  await Promise.all(allFonts.map(font => ensureFontLoaded(font)));

  try {
    await (document as any).fonts?.ready;
  } catch (_) {}

  const loadedFonts: string[] = [];
  const missingFonts: string[] = [];

  for (const font of allFonts) {
    if (isFontAvailableForRender(font)) {
      loadedFonts.push(font);
    } else {
      missingFonts.push(font);
    }
  }

  const needsLocalPermission =
    missingFonts.length > 0 &&
    getLocalFontsPermissionState() === 'prompt_needed';

  return {
    allFonts,
    loadedFonts,
    missingFonts,
    needsLocalPermission,
  };
}

/**
 * Ao salvar um projeto novo em .json, embute apenas as fontes customizadas/locais usadas nele
 * (com limite seguro de 10 MB no total) para que nunca mais desformate em atualizações futuras.
 */
export async function prepareFontsForProjectExport(config: AgendaConfig): Promise<AgendaConfig> {
  const usedFonts = extractProjectFontFamilies(config);
  const embedded: Record<string, { name: string; base64: string; mimeType?: string }> = {
    ...(config.embeddedFonts || {}),
  };

  let totalBytes = Object.values(embedded).reduce((sum, item) => sum + (item?.base64?.length || 0), 0);
  const MAX_TOTAL_BASE64_BYTES = 10 * 1024 * 1024;
  const MAX_SINGLE_FONT_BYTES = 3 * 1024 * 1024;

  for (const fontName of usedFonts) {
    const key = normalizeFontKey(fontName);
    if (!key || BUILTIN_WEB_FONTS.has(key) || GENERIC_CSS_FONTS.has(key)) continue;
    if (embedded[fontName]?.base64) continue;

    // Fontes clássicas padrão do Windows/macOS geralmente não precisam ir no JSON a menos que tenhamos carregado seu binário customizado
    let buffer: ArrayBuffer | null = null;
    const cached = loadedBinaryCache.get(key) || loadedBinaryCache.get(`${key}|400|normal`);
    if (cached?.buffer) {
      buffer = cached.buffer;
    } else {
      const stored = await getFontFromDB(fontName);
      if (stored?.buffer) {
        buffer = stored.buffer;
      }
    }

    if (!buffer || buffer.byteLength === 0 || buffer.byteLength > MAX_SINGLE_FONT_BYTES) continue;
    const base64 = arrayBufferToBase64(buffer);
    if (totalBytes + base64.length > MAX_TOTAL_BASE64_BYTES) break;

    embedded[fontName] = {
      name: fontName,
      base64,
      mimeType: 'font/sfnt',
    };
    totalBytes += base64.length;
  }

  if (Object.keys(embedded).length === 0) {
    return config;
  }

  return {
    ...config,
    embeddedFonts: embedded,
  };
}

/**
 * Vincula um arquivo de fonte (.ttf/.otf/.woff) enviado pela aluna tanto ao seu nome limpo
 * quanto a eventuais nomes ausentes de projetos antigos (para recuperação imediata sem precisar editar elemento por elemento).
 */
export async function bindUploadedFontFile(
  file: File,
  bindAliases: string[] = []
): Promise<{ primaryName: string; buffer: ArrayBuffer }> {
  const buffer = await file.arrayBuffer();
  let primaryName = cleanStoredFontName(file.name) || 'CustomFont';
  let weight = '400';
  let style: 'normal' | 'italic' = 'normal';

  try {
    const parsed = opentype.parse(buffer.slice(0));
    const namesAny = parsed?.names as any;
    const famObj = namesAny?.preferredFamily || parsed?.names?.fontFamily;
    const subObj = namesAny?.preferredSubfamily || parsed?.names?.fontSubfamily;
    const realFamily = famObj ? (famObj.en || famObj.pt || Object.values(famObj)[0]) : undefined;
    const subName = subObj ? (subObj.en || subObj.pt || Object.values(subObj)[0]) : undefined;
    if (typeof realFamily === 'string' && realFamily.trim()) {
      primaryName = cleanFontFamilyName(realFamily);
    }
    if (typeof subName === 'string') {
      const inf = inferWeightAndStyle(subName);
      weight = inf.weight;
      style = inf.style;
    }
  } catch (_) {}

  await registerFontBinaryInDocument(primaryName, buffer, { weight, style });
  await saveFontToDB(primaryName, buffer).catch(() => {});

  const fileClean = cleanStoredFontName(file.name);
  if (fileClean && normalizeFontKey(fileClean) !== normalizeFontKey(primaryName)) {
    await registerFontBinaryInDocument(fileClean, buffer, { weight, style });
  }

  for (const alias of bindAliases) {
    const cleanAlias = cleanFontFamilyName(alias);
    if (cleanAlias && normalizeFontKey(cleanAlias) !== normalizeFontKey(primaryName)) {
      await registerFontBinaryInDocument(cleanAlias, buffer, { weight, style });
      await saveFontToDB(cleanAlias, buffer).catch(() => {});
    }
  }

  dispatchFontApplied(primaryName);
  return { primaryName, buffer };
}
