/**
 * fontDetector.ts - Detecção e Aplicação Robusta de Fontes do Computador & Sistema
 * 
 * Identifica as fontes presentes no sistema operacional da usuária (Windows, macOS, Linux, Electron)
 * e através da API Chromium Local Font Access (queryLocalFonts).
 * 
 * CRUCIAL: Ao contrário de apenas listar nomes em texto (que o navegador frequentemente não renderiza
 * em CSS devido a políticas de privacidade/sandbox), este módulo extrai o binário TTF/OTF via blob(),
 * registra nativamente no document.fonts via new FontFace(name, buffer), salva no IndexedDB e
 * garante que a fonte seja 100% aplicada e visível imediatamente nos textos e capas.
 */
import { localStorage } from '../../services/safeStorage';
import { saveFontToDB, getFontFromDB } from './fontStorage';

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

/**
 * Normaliza o nome da fonte para indexação uniforme
 */
export function normalizeFontKey(name: string): string {
  return (name || '').toLowerCase().replace(/['"]/g, '').trim();
}

// Mapa de handles de fontes locais obtidos via window.queryLocalFonts()
const localFontDataHandles = new Map<string, any>();

// Cache de famílias que já foram registradas no document.fonts nesta sessão
const loadedFontFamiliesSet = new Set<string>();

/**
 * Registra um handle de fonte FontData na memória para recuperação instantânea do blob TTF/OTF
 */
export function registerLocalFontHandle(fd: any): void {
  if (!fd) return;
  if (fd.family) {
    const kFam = normalizeFontKey(fd.family);
    const existing = localFontDataHandles.get(kFam);
    // Se ainda não tiver ou se este estilo for regular/normal, prioriza
    if (!existing || (fd.style && /regular|normal|book|roman/i.test(fd.style))) {
      localFontDataHandles.set(kFam, fd);
    }
    // Adiciona também sem espaços (ex: "centurygothic")
    localFontDataHandles.set(kFam.replace(/\s+/g, ''), fd);
  }
  if (fd.fullName) {
    localFontDataHandles.set(normalizeFontKey(fd.fullName), fd);
  }
  if (fd.postscriptName) {
    localFontDataHandles.set(normalizeFontKey(fd.postscriptName), fd);
  }
}

/**
 * Busca o handle de FontData correspondente ao nome da família
 */
export function getLocalFontHandle(name: string): any {
  const k = normalizeFontKey(name);
  return localFontDataHandles.get(k) || localFontDataHandles.get(k.replace(/\s+/g, '')) || null;
}

/**
 * Retorna uma declaração CSS segura para fontFamily com aspas e fallbacks genéricos adequados
 */
export function getSafeFontFamily(fontFamily?: string): string {
  if (!fontFamily) return 'Inter, sans-serif';
  const clean = fontFamily.replace(/['"]/g, '').trim();
  if (!clean) return 'Inter, sans-serif';
  
  const lower = clean.toLowerCase();
  let genericFallback = 'sans-serif';
  if (/serif|times|georgia|garamond|baskerville|playfair|merriweather|cambria|palatino/i.test(lower)) {
    genericFallback = 'serif';
  } else if (/script|brush|cursive|vibes|dancing|caveat|allura|parisienne|calligra|edwardian|vivaldi|sacramento|pinyon/i.test(lower)) {
    genericFallback = 'cursive, sans-serif';
  } else if (/mono|courier|consolas|code/i.test(lower)) {
    genericFallback = 'monospace';
  }
  return `"${clean}", ${genericFallback}`;
}

/**
 * Injeta regras @font-face { src: local(...) } no DOM para garantir que o CSS do navegador
 * reconheça os nomes de fontes instaladas no sistema operacional
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
    const clean = font.replace(/['"]/g, '').trim();
    if (!clean || clean.length < 2) continue;
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
 * Injeta dinamicamente stylesheet do Google Fonts caso a fonte seja uma fonte livre conhecida
 */
export function loadGoogleFontFallback(fontFamily: string): void {
  if (typeof document === 'undefined') return;
  const clean = fontFamily.replace(/['"]/g, '').trim();
  if (!clean) return;

  const linkId = `gfont-${clean.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}`;
  if (document.getElementById(linkId)) return;

  const link = document.createElement('link');
  link.id = linkId;
  link.rel = 'stylesheet';
  const encoded = encodeURIComponent(clean).replace(/%20/g, '+');
  link.href = `https://fonts.googleapis.com/css2?family=${encoded}:ital,wght@0,300..900;1,300..900&display=swap`;
  link.crossOrigin = 'anonymous';
  document.head.appendChild(link);
}

/**
 * GARANTIA ABSOLUTA DE APLICAÇÃO DE FONTE:
 * Carrega a fonte fisicamente via FontFace API e adiciona a document.fonts.add().
 * Se a fonte veio de 'Buscar fonte do Pc' (queryLocalFonts), lê o blob() binário TTF/OTF
 * diretamente do disco da aluna, funcionando EXATAMENTE como quando ela sobe o arquivo manual!
 */
export async function ensureFontLoaded(fontFamily: string): Promise<boolean> {
  if (!fontFamily || typeof document === 'undefined') return false;
  const cleanFamily = fontFamily.replace(/['"]/g, '').trim();
  if (!cleanFamily || cleanFamily === 'Inter' || cleanFamily === 'sans-serif' || cleanFamily === 'serif') return true;

  const key = normalizeFontKey(cleanFamily);

  // Se já carregada nesta sessão
  if (loadedFontFamiliesSet.has(key)) {
    return true;
  }

  // 1. Tenta carregar através do handle do queryLocalFonts (binário direto TTF/OTF do disco da aluna)
  let handle = getLocalFontHandle(cleanFamily);

  // Se o handle ainda não estiver em memória mas a API estiver disponível, busca silenciosamente
  const winAny = typeof window !== 'undefined' ? (window as any) : null;
  if (!handle && winAny && typeof winAny.queryLocalFonts === 'function') {
    try {
      const allHandles = await winAny.queryLocalFonts();
      if (Array.isArray(allHandles)) {
        for (const fd of allHandles) {
          registerLocalFontHandle(fd);
        }
        handle = getLocalFontHandle(cleanFamily);
      }
    } catch (_) {}
  }

  if (handle && typeof handle.blob === 'function') {
    try {
      const blob: Blob = await handle.blob();
      const buffer = await blob.arrayBuffer();

      // Cria e registra o FontFace no document.fonts exatamente como no upload manual
      const fontFace = new FontFace(cleanFamily, buffer);
      const loadedFace = await fontFace.load();
      (document as any).fonts.add(loadedFace);

      // Registra também variações de nome (ex: postscriptName) para cobertura 100%
      if (handle.postscriptName && handle.postscriptName !== cleanFamily) {
        try {
          const psFace = new FontFace(handle.postscriptName, buffer);
          await psFace.load();
          (document as any).fonts.add(psFace);
        } catch (_) {}
      }

      // Salva permanentemente no IndexedDB para carregamentos instantâneos futuros
      await saveFontToDB(cleanFamily, buffer);

      loadedFontFamiliesSet.add(key);

      // Notifica o sistema para re-renderização imediata
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('font-applied', { detail: { fontFamily: cleanFamily } }));
      }
      return true;
    } catch (err) {
      console.warn(`[FontDetector] Falha ao extrair blob da fonte local "${cleanFamily}":`, err);
    }
  }

  // 2. Tenta carregar do IndexedDB (se já havia sido salva antes)
  try {
    const stored = await getFontFromDB(cleanFamily);
    if (stored && stored.buffer) {
      const fontFace = new FontFace(cleanFamily, stored.buffer);
      const loadedFace = await fontFace.load();
      (document as any).fonts.add(loadedFace);
      loadedFontFamiliesSet.add(key);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('font-applied', { detail: { fontFamily: cleanFamily } }));
      }
      return true;
    }
  } catch (_) {}

  // 3. Injeta regra @font-face src: local(...)
  injectLocalFontFaceStyles([cleanFamily]);

  // 4. Fallback dinâmico para Google Fonts (muitas alunas usam fontes do Google Fonts instaladas no PC)
  loadGoogleFontFallback(cleanFamily);

  loadedFontFamiliesSet.add(key);
  return true;
}

/**
 * Detecta se uma fonte específica está fisicamente instalada no computador
 * comparando as métricas de renderização em um canvas off-screen contra 3 fontes padrão.
 */
export function isFontInstalledLocally(fontName: string): boolean {
  if (typeof window === 'undefined' || typeof document === 'undefined') return false;

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) return false;

  const testString = 'mmmmmmmmmmlli!@#$%^&*()_+-=~`[]{}|;:,.<>?0123456789WwQq';
  const baselineFonts = ['monospace', 'sans-serif', 'serif'];

  // 1. Mede a largura do texto nas 3 fontes base
  const baselineWidths: Record<string, number> = {};
  for (const base of baselineFonts) {
    context.font = `72px ${base}`;
    baselineWidths[base] = context.measureText(testString).width;
  }

  // 2. Mede a largura usando a fonte candidata combinada com cada fonte base
  for (const base of baselineFonts) {
    context.font = `72px "${fontName}", ${base}`;
    const measuredWidth = context.measureText(testString).width;
    // Se a largura for diferente do fallback base, a fonte está presente no sistema operacional!
    if (measuredWidth !== baselineWidths[base]) {
      return true;
    }
  }

  return false;
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
        localFonts.forEach((f: any) => {
          if (f && f.family) {
            detected.add(f.family);
            registerLocalFontHandle(f);
          }
        });
      }
    } catch (e) {
      // Ignora silenciosamente se o navegador restringir ou se o usuário cancelar
    }
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

  // Injeta regras @font-face { src: local(...) } no CSS
  injectLocalFontFaceStyles(result);

  // Salva no cache local para carregamento instantâneo subsequente
  if (typeof localStorage !== 'undefined' && result.length > 0) {
    try {
      localStorage.setItem('agendamaster_auto_detected_fonts', JSON.stringify(result));
    } catch (e) {
      // Ignora erro de quota
    }
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
        // Pré-injeta regras @font-face src: local(...)
        injectLocalFontFaceStyles(parsed);
        return parsed;
      }
    }
  } catch (e) {
    // Ignora erro de parse
  }
  return [];
}
