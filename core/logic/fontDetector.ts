/**
 * fontDetector.ts - Detecção automática de fontes instaladas no computador
 * 
 * Identifica silenciosamente as fontes presentes no sistema operacional do usuário
 * (Windows, macOS, Linux) e no ambiente Desktop (Electron), disponibilizando-as 
 * automaticamente para uso nos elementos de texto, capas e agendas.
 */

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

  // 1. Desktop / Electron: Acesso direto e completo ao diretório C:\Windows\Fonts
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
          if (f && f.family) detected.add(f.family);
        });
      }
    } catch (e) {
      // Ignora silenciosamente se o navegador restringir
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
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    // Ignora erro de parse
  }
  return [];
}
