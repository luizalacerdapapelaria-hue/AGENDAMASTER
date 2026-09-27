import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import * as opentype from 'opentype.js';
import { 
  Upload, Search, Type, Sparkles, RefreshCw, Copy, Check, X, 
  Monitor, Plus, ArrowLeft, Trash2, HelpCircle, CheckCheck,
  ChevronDown, ZoomIn, ZoomOut, AlertCircle, Loader2, Wand2
} from 'lucide-react';
import { saveFontToDB, getAllFontsFromDB, deleteFontFromDB, StoredFont } from '../../../core/logic/fontStorage';
import { detectInstalledFonts, getCachedInstalledFonts, CANDIDATE_SYSTEM_FONTS } from '../../../core/logic/fontDetector';
import { SYSTEM_FONTS, AVAILABLE_FONTS } from '../../../core/constants/elements';

export interface SelectedTextInfo {
  id: string;
  content: string;
  fontFamily: string;
  name?: string;
}

export interface OpenTypeEditorProps {
  user: { name: string; email: string };
  onClose?: () => void;
  systemFonts?: string[];
  localFonts?: string[];
  customFonts?: string[];
  manualFonts?: string[];
  onLoadLocalFonts?: () => Promise<void> | void;
  localFontsLoading?: boolean;
  onAddManualFont?: () => void;
  onRegisterFont?: (fontFamily: string) => void;
  onInsertIntoLayout?: (text: string, fontFamily: string) => void;
  onInsertVectorGlyph?: (svgDataUrl: string, title: string) => void;
  selectedTextElement?: SelectedTextInfo | null;
  onApplyToSelectedText?: (newContent: string, newFontFamily?: string) => void;
  initialFontFamily?: string;
}

export interface ActiveFontItem {
  name: string;
  family: string;
  source: 'preset' | 'uploaded' | 'local';
  font: opentype.Font;
  buffer?: ArrayBuffer;
}

// Convert opentype.Glyph to a standalone SVG data URL and SVG string
export function generateGlyphSVG(glyph: opentype.Glyph, font: opentype.Font, color: string = '#111827'): { svgString: string; dataUrl: string } {
  const unitsPerEm = font.unitsPerEm || 1000;
  const ascender = font.ascender || 800;
  const descender = font.descender || -200;
  
  const hasPathCommands = glyph.path && glyph.path.commands && glyph.path.commands.length > 0;

  if (hasPathCommands) {
    const xMin = glyph.xMin !== undefined ? glyph.xMin : 0;
    const xMax = glyph.xMax !== undefined ? glyph.xMax : (glyph.advanceWidth || unitsPerEm * 0.6);
    const yMin = glyph.yMin !== undefined ? glyph.yMin : descender;
    const yMax = glyph.yMax !== undefined ? glyph.yMax : ascender;

    const width = Math.max(xMax - xMin, glyph.advanceWidth || unitsPerEm * 0.6, 10);
    const height = Math.max(ascender - descender, yMax - yMin, 10);

    const path = glyph.getPath(0, ascender, unitsPerEm);
    path.fill = color;
    const pathSvg = path.toSVG(2);

    const viewBoxWidth = Math.max(glyph.advanceWidth || width, 20);
    const viewBoxHeight = Math.max(height, 20);

    const svgString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${viewBoxWidth} ${viewBoxHeight}" width="${viewBoxWidth}" height="${viewBoxHeight}">${pathSvg}</svg>`;
    const dataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svgString)}`;

    return { svgString, dataUrl };
  }

  const char = glyph.unicode ? String.fromCodePoint(glyph.unicode) : (glyph.name || '');
  const family = (font as any).familyName || font.names?.fontFamily?.en || 'sans-serif';
  const svgString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><text x="50" y="70" font-family="${family}, sans-serif" font-size="64" text-anchor="middle" fill="${color}">${char}</text></svg>`;
  const dataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svgString)}`;
  return { svgString, dataUrl };
}

// Component to render crisp preview thumbnail of any opentype glyph via canvas
const GlyphThumbnail: React.FC<{ glyph: opentype.Glyph; size?: number; color?: string; fontFamily?: string }> = React.memo(({ glyph, size = 44, color = '#ffffff', fontFamily }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !glyph) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, size, size);

    const font = (glyph as any).path?.unitsPerEm ? null : (glyph as any).font;
    const unitsPerEm = font?.unitsPerEm || 1000;
    const ascender = font?.ascender || 800;
    const descender = font?.descender || -200;

    const hasPathCommands = glyph.path && glyph.path.commands && glyph.path.commands.length > 0;

    if (hasPathCommands) {
      const glyphXMin = glyph.xMin !== undefined ? glyph.xMin : 0;
      const glyphXMax = glyph.xMax !== undefined ? glyph.xMax : (glyph.advanceWidth || unitsPerEm * 0.6);
      const glyphYMin = glyph.yMin !== undefined ? glyph.yMin : descender;
      const glyphYMax = glyph.yMax !== undefined ? glyph.yMax : ascender;

      const glyphW = Math.max(glyphXMax - glyphXMin, 1);
      const glyphH = Math.max(glyphYMax - glyphYMin, 1);

      const scale = Math.min((size * 0.72) / glyphW, (size * 0.72) / glyphH, (size * 0.72) / (ascender - descender));
      const fontSize = unitsPerEm * scale;

      const x = (size - glyphW * scale) / 2 - glyphXMin * scale;
      const y = (size + glyphH * scale) / 2 + glyphYMin * scale;

      try {
        const path = glyph.getPath(x, y, fontSize);
        path.fill = color;
        path.draw(ctx);
        return;
      } catch (e) {
        // Fallback to text draw
      }
    }

    const effectiveFamily = fontFamily || font?.familyName || (font as any)?.names?.fontFamily?.en || 'sans-serif';
    const char = glyph.unicode ? String.fromCodePoint(glyph.unicode) : (glyph.name || '?');
    ctx.fillStyle = color;
    ctx.font = `500 ${Math.round(size * 0.58)}px "${effectiveFamily}", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(char.length > 3 ? char.slice(0, 2) : char, size / 2, size / 2 + 1);
  }, [glyph, size, color, fontFamily]);

  return <canvas ref={canvasRef} style={{ width: size, height: size }} className="shrink-0 pointer-events-none" />;
});

export function createSystemFontItem(familyName: string): ActiveFontItem {
  const glyphs: opentype.Glyph[] = [];

  // .notdef
  glyphs.push(new opentype.Glyph({
    name: '.notdef',
    unicode: 0,
    advanceWidth: 650,
    path: new opentype.Path()
  }));

  // A-Z
  for (let c = 65; c <= 90; c++) {
    const ch = String.fromCharCode(c);
    glyphs.push(new opentype.Glyph({
      name: ch,
      unicode: c,
      unicodes: [c],
      advanceWidth: 650,
      path: new opentype.Path()
    }));
  }

  // a-z
  for (let c = 97; c <= 122; c++) {
    const ch = String.fromCharCode(c);
    glyphs.push(new opentype.Glyph({
      name: ch,
      unicode: c,
      unicodes: [c],
      advanceWidth: 550,
      path: new opentype.Path()
    }));
  }

  // 0-9
  for (let c = 48; c <= 57; c++) {
    const ch = String.fromCharCode(c);
    glyphs.push(new opentype.Glyph({
      name: ch,
      unicode: c,
      unicodes: [c],
      advanceWidth: 550,
      path: new opentype.Path()
    }));
  }

  // Common Punctuation & Symbols
  const punctuation = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`"\'°ºª©®™€$£';
  for (let i = 0; i < punctuation.length; i++) {
    const ch = punctuation[i];
    const code = ch.codePointAt(0)!;
    glyphs.push(new opentype.Glyph({
      name: ch,
      unicode: code,
      unicodes: [code],
      advanceWidth: 400,
      path: new opentype.Path()
    }));
  }

  // Accented Latin characters
  const accented = 'ÁÀÃÂÉÊÍÓÕÔÚÇáàãâéêíóõôúç';
  for (let i = 0; i < accented.length; i++) {
    const ch = accented[i];
    const code = ch.codePointAt(0)!;
    glyphs.push(new opentype.Glyph({
      name: ch,
      unicode: code,
      unicodes: [code],
      advanceWidth: 550,
      path: new opentype.Path()
    }));
  }

  const font = new opentype.Font({
    familyName,
    styleName: 'Regular',
    unitsPerEm: 1000,
    ascender: 800,
    descender: -200,
    glyphs
  });

  return {
    name: familyName,
    family: familyName,
    source: 'local',
    font
  };
}

export const OpenTypeEditor: React.FC<OpenTypeEditorProps> = ({
  user,
  onClose,
  systemFonts = [],
  localFonts = [],
  customFonts = [],
  manualFonts = [],
  onLoadLocalFonts,
  localFontsLoading,
  onAddManualFont,
  onRegisterFont,
  onInsertIntoLayout,
  onInsertVectorGlyph,
  selectedTextElement,
  onApplyToSelectedText,
  initialFontFamily
}) => {
  // Fonts State
  const [fonts, setFonts] = useState<ActiveFontItem[]>([]);
  const [activeFontIndex, setActiveFontIndex] = useState<number>(0);
  const [loadingFont, setLoadingFont] = useState<boolean>(true);
  const [fontError, setFontError] = useState<string | null>(null);

  // User's working text
  const [composerText, setComposerText] = useState<string>(() => {
    if (selectedTextElement && selectedTextElement.content) {
      return selectedTextElement.content;
    }
    return 'Agenda 2026';
  });

  const [applyFontToSelected, setApplyFontToSelected] = useState<boolean>(true);
  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);
  const [appliedNotification, setAppliedNotification] = useState<boolean>(false);
  const [showGuide, setShowGuide] = useState<boolean>(false);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'swashes' | 'letters' | 'numbers' | 'symbols'>('all');
  const [gridSize, setGridSize] = useState<'sm' | 'md' | 'lg'>('md');

  // Selected Glyph for detail inspection / bottom actions
  const [selectedGlyph, setSelectedGlyph] = useState<opentype.Glyph | null>(null);

  // Text Input Ref for selection / insertion tracking
  const textInputRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const presetFontsList = useMemo(() => [
    {
      name: 'Great Vibes (Caligrafia & Swashes)',
      family: 'Great Vibes',
      url: '/fonts/greatvibes.ttf'
    },
    {
      name: 'Cinzel Decorative (Capitulares & Títulos)',
      family: 'Cinzel Decorative',
      url: '/fonts/cinzel.ttf'
    },
    {
      name: 'Playfair Display (Serifada Elegante)',
      family: 'Playfair Display',
      url: '/fonts/playfair.ttf'
    }
  ], []);

  // Update text when selectedTextElement changes externally
  useEffect(() => {
    if (selectedTextElement && selectedTextElement.content !== undefined) {
      setComposerText(selectedTextElement.content);
    }
  }, [selectedTextElement]);

  const showToast = (msg: string) => {
    setCopiedNotification(msg);
    setTimeout(() => setCopiedNotification(null), 3000);
  };

  // Helper to register FontFace in the document
  const registerFontFace = async (family: string, buffer: ArrayBuffer) => {
    try {
      const fontFace = new FontFace(family, buffer);
      const loadedFace = await fontFace.load();
      document.fonts.add(loadedFace);
    } catch (e) {
      console.warn(`Could not register FontFace for ${family}:`, e);
    }
  };

  // Parse font buffer with graceful fallback
  const parseAndAddFont = async (
    name: string, 
    family: string, 
    source: 'preset' | 'uploaded' | 'local', 
    buffer: ArrayBuffer
  ): Promise<ActiveFontItem | null> => {
    try {
      const bufferCopy = buffer.slice(0);
      const font = opentype.parse(bufferCopy);
      
      for (let i = 0; i < font.glyphs.length; i++) {
        const g = font.glyphs.get(i);
        if (g) (g as any).font = font;
      }

      await registerFontFace(family, buffer);

      return { name, family, source, font, buffer };
    } catch (e: any) {
      console.warn(`[OpenType] Aviso ao decodificar buffer da fonte "${name}":`, e?.message || e);
      // Fallback gracioso para item sintético de sistema sem travar a interface
      try {
        const fallback = createSystemFontItem(family);
        return { ...fallback, name, source };
      } catch (fallbackErr) {
        return null;
      }
    }
  };

  // Load all initial fonts (Presets + IndexedDB)
  useEffect(() => {
    let isMounted = true;

    const loadAllFonts = async () => {
      setLoadingFont(true);
      setFontError(null);
      const loaded: ActiveFontItem[] = [];

      // 1. Presets
      for (const preset of presetFontsList) {
        try {
          const res = await fetch(preset.url);
          if (res.ok) {
            const ab = await res.arrayBuffer();
            const parsed = await parseAndAddFont(preset.name, preset.family, 'preset', ab);
            if (parsed) loaded.push(parsed);
          }
        } catch (e: any) {
          console.warn(`[OpenType] Não foi possível carregar preset ${preset.name}:`, e?.message || e);
        }
      }

      // 2. Custom fonts from IndexedDB
      try {
        const storedList = await getAllFontsFromDB();
        for (const stored of storedList) {
          if (stored.buffer && stored.buffer.byteLength > 0) {
            const familyName = stored.name.replace(/\.[^/.]+$/, '').trim() || 'CustomFont';
            const parsed = await parseAndAddFont(stored.name, familyName, 'uploaded', stored.buffer);
            if (parsed && !loaded.some(f => f.family === parsed.family)) {
              loaded.push(parsed);
            }
          }
        }
      } catch (e: any) {
        console.warn('[OpenType] Erro ao carregar fontes salvas:', e?.message || e);
      }

      if (isMounted) {
        if (loaded.length === 0) {
          loaded.push(createSystemFontItem('Playfair Display'));
          loaded.push(createSystemFontItem('Inter'));
        }
        setFonts(loaded);
        setLoadingFont(false);

        // Preselect font matching initialFontFamily if possible
        if (initialFontFamily && loaded.length > 0) {
          const matchingIdx = loaded.findIndex(
            f => f.family.toLowerCase() === initialFontFamily.toLowerCase() ||
                 f.name.toLowerCase().includes(initialFontFamily.toLowerCase())
          );
          if (matchingIdx >= 0) {
            setActiveFontIndex(matchingIdx);
          }
        }
      }
    };

    loadAllFonts();
    return () => { isMounted = false; };
  }, [presetFontsList, initialFontFamily]);

  const activeFont = useMemo(() => {
    if (activeFontIndex >= 0 && activeFontIndex < fonts.length) {
      return fonts[activeFontIndex];
    }
    return null;
  }, [fonts, activeFontIndex]);

  // Handle Custom Font File Upload (.ttf, .otf, .woff)
  const handleFontUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setLoadingFont(true);
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const buffer = await file.arrayBuffer();
        const rawFamily = file.name.replace(/\.[^/.]+$/, '').trim();
        const family = rawFamily;
        
        const parsed = await parseAndAddFont(file.name, family, 'uploaded', buffer);
        if (parsed) {
          await saveFontToDB(file.name, buffer);
          setFonts(prev => [parsed, ...prev]);
          setActiveFontIndex(0);
          if (onRegisterFont) onRegisterFont(family);
          showToast(`Fonte "${file.name}" carregada! (${parsed.font.glyphs.length} glifos)`);
        }
      } catch (err: any) {
        showToast(`Erro ao carregar fonte: ${err.message}`);
      }
    }
    setLoadingFont(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Helper to extract character string from opentype Glyph
  const getGlyphCharacter = useCallback((glyph: opentype.Glyph): string => {
    if (glyph.unicode !== undefined && glyph.unicode !== null && glyph.unicode > 0) {
      try { return String.fromCodePoint(glyph.unicode); } catch (e) {}
    }
    if (glyph.unicodes && glyph.unicodes.length > 0) {
      const validCode = glyph.unicodes.find(u => u && u > 0);
      if (validCode) {
        try { return String.fromCodePoint(validCode); } catch (e) {}
      }
    }
    if (glyph.name) {
      const uniMatch = glyph.name.match(/^(?:uni|u|u\+)([0-9a-fA-F]{4,6})$/i);
      if (uniMatch) {
        const code = parseInt(uniMatch[1], 16);
        if (code > 0) {
          try { return String.fromCodePoint(code); } catch (e) {}
        }
      }
      const baseCharMatch = glyph.name.match(/^([a-zA-Z0-9])/);
      if (baseCharMatch) return baseCharMatch[1];
    }
    return '';
  }, []);

  // Determine if a glyph is a special swash / alternate
  const isGlyphSwash = useCallback((glyph: opentype.Glyph): boolean => {
    const name = (glyph.name || '').toLowerCase();
    const unicode = glyph.unicode || (glyph.unicodes && glyph.unicodes[0]);
    if (unicode && unicode >= 0xE000 && unicode <= 0xF8FF) return true; // Private Use Area (PUA)
    if (name.includes('swsh') || name.includes('swash') || name.includes('alt') || 
        name.includes('ss0') || name.includes('ss1') || name.includes('fina') || 
        name.includes('init') || name.includes('medi') || name.includes('ornm') ||
        name.includes('heart') || name.includes('flower') || name.includes('curl') ||
        name.includes('tail') || name.includes('flourish') || name.includes('loop')) {
      return true;
    }
    return false;
  }, []);

  // Determine glyph category
  const getGlyphType = useCallback((glyph: opentype.Glyph): 'swashes' | 'letters' | 'numbers' | 'symbols' => {
    const name = (glyph.name || '').toLowerCase();
    const unicode = glyph.unicode || (glyph.unicodes && glyph.unicodes[0]);

    if (isGlyphSwash(glyph)) return 'swashes';

    if (unicode) {
      if (unicode >= 48 && unicode <= 57) return 'numbers';
      if ((unicode >= 65 && unicode <= 90) || (unicode >= 97 && unicode <= 122) || (unicode >= 192 && unicode <= 382)) {
        return 'letters';
      }
    }
    return 'symbols';
  }, [isGlyphSwash]);

  // All extracted glyphs for the active font
  const glyphItems = useMemo(() => {
    if (!activeFont) return [];
    const font = activeFont.font;
    const items: Array<{
      index: number;
      name: string;
      unicode: number | null;
      glyph: opentype.Glyph;
      charStr: string;
      isSwash: boolean;
      type: 'swashes' | 'letters' | 'numbers' | 'symbols';
    }> = [];

    for (let i = 0; i < font.glyphs.length; i++) {
      const g = font.glyphs.get(i);
      if (!g) continue;

      let unicode: number | null = null;
      if (g.unicode !== undefined && g.unicode !== null && g.unicode > 0) {
        unicode = g.unicode;
      } else if (g.unicodes && g.unicodes.length > 0 && g.unicodes[0] > 0) {
        unicode = g.unicodes[0];
      }

      const charStr = getGlyphCharacter(g);
      const isSwash = isGlyphSwash(g);
      const type = getGlyphType(g);

      items.push({
        index: i,
        name: g.name || `glifo-${i}`,
        unicode,
        glyph: g,
        charStr,
        isSwash,
        type
      });
    }

    return items;
  }, [activeFont, getGlyphCharacter, isGlyphSwash, getGlyphType]);

  // Filtered glyphs based on category & search
  const filteredGlyphs = useMemo(() => {
    let list = glyphItems;

    if (categoryFilter !== 'all') {
      list = list.filter(item => item.type === categoryFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(item => {
        if (item.name.toLowerCase().includes(q)) return true;
        if (item.charStr && item.charStr.toLowerCase().includes(q)) return true;
        if (item.unicode && `u+${item.unicode.toString(16)}`.includes(q)) return true;
        return false;
      });
    }

    return list;
  }, [glyphItems, categoryFilter, searchQuery]);

  // Count swashes / special characters
  const swashesCount = useMemo(() => {
    return glyphItems.filter(g => g.type === 'swashes').length;
  }, [glyphItems]);

  // Insert a glyph character into the composer input
  const insertGlyphIntoComposer = (glyph: opentype.Glyph) => {
    setSelectedGlyph(glyph);
    const charStr = getGlyphCharacter(glyph);
    if (!charStr) {
      showToast('Este glifo é um ornamento vetorial especial.');
      return;
    }

    const input = textInputRef.current;
    if (!input) {
      setComposerText(prev => prev + charStr);
      return;
    }

    const start = input.selectionStart ?? composerText.length;
    const end = input.selectionEnd ?? composerText.length;
    const newText = composerText.substring(0, start) + charStr + composerText.substring(end);
    setComposerText(newText);

    // Restore focus and place cursor right after inserted character
    setTimeout(() => {
      input.focus();
      const newPos = start + charStr.length;
      input.setSelectionRange(newPos, newPos);
    }, 10);
  };

  // 1-Click: Apply directly to selected text in Dashboard
  const handleApplyToSelected = () => {
    if (!onApplyToSelectedText || !selectedTextElement) {
      // If no text element selected, insert as new text
      if (onInsertIntoLayout && activeFont) {
        onInsertIntoLayout(composerText, activeFont.family);
        showToast('Texto inserido no miolo da agenda!');
        if (onClose) onClose();
      }
      return;
    }

    const targetFont = applyFontToSelected && activeFont ? activeFont.family : undefined;
    onApplyToSelectedText(composerText, targetFont);
    setAppliedNotification(true);
    showToast('✨ Texto atualizado com sucesso no seu miolo!');
    setTimeout(() => setAppliedNotification(false), 2500);
  };

  // Double click on a glyph: immediate insertion / apply
  const handleGlyphDoubleClick = (glyph: opentype.Glyph) => {
    insertGlyphIntoComposer(glyph);
    const charStr = getGlyphCharacter(glyph);

    if (charStr && selectedTextElement && onApplyToSelectedText) {
      // Apply immediately with active font
      const input = textInputRef.current;
      const start = input?.selectionStart ?? composerText.length;
      const end = input?.selectionEnd ?? composerText.length;
      const updatedText = composerText.substring(0, start) + charStr + composerText.substring(end);
      
      const targetFont = applyFontToSelected && activeFont ? activeFont.family : undefined;
      onApplyToSelectedText(updatedText, targetFont);
      showToast(`Glifo inserido diretamente no texto!`);
    } else if (!charStr && activeFont && onInsertVectorGlyph) {
      // Insert as decorative vector element
      const { dataUrl } = generateGlyphSVG(glyph, activeFont.font, '#1e293b');
      onInsertVectorGlyph(dataUrl, glyph.name || 'Glifo Decorativo');
      showToast('Enfeite vetorial adicionado ao miolo!');
    }
  };

  // Copy individual glyph to clipboard
  const handleCopyGlyph = async (glyph: opentype.Glyph) => {
    const charStr = getGlyphCharacter(glyph);
    if (!charStr) {
      showToast('Este glifo é uma arte vetorial interna da fonte.');
      return;
    }
    try {
      await navigator.clipboard.writeText(charStr);
      showToast(`Caractere "${charStr}" copiado para a área de transferência!`);
    } catch (e) {
      showToast('Erro ao copiar caractere.');
    }
  };

  // Copy full composer text to clipboard
  const handleCopyComposerText = async () => {
    if (!composerText) return;
    try {
      await navigator.clipboard.writeText(composerText);
      showToast('Texto completo copiado com sucesso!');
    } catch (e) {
      showToast('Erro ao copiar texto.');
    }
  };

  // Insert as new text element
  const handleInsertAsNewText = () => {
    if (onInsertIntoLayout && activeFont && composerText) {
      onInsertIntoLayout(composerText, activeFont.family);
      showToast('Novo texto adicionado ao miolo!');
      if (onClose) onClose();
    }
  };

  // Insert glyph as vector element
  const handleInsertAsVector = (glyph: opentype.Glyph) => {
    if (!activeFont || !onInsertVectorGlyph) return;
    const { dataUrl } = generateGlyphSVG(glyph, activeFont.font, '#1e293b');
    onInsertVectorGlyph(dataUrl, glyph.name || 'Glifo Decorativo');
    showToast('Enfeite adicionado à página!');
    if (onClose) onClose();
  };

  // Local state for directly queried PC fonts (A-Z) and cached FontData handles
  const [extraPcFonts, setExtraPcFonts] = useState<string[]>([]);
  const [scanningPcFonts, setScanningPcFonts] = useState<boolean>(false);
  const localFontDataMapRef = useRef<Map<string, any>>(new Map());

  // Unified, deduplicated A-Z list of all computer fonts
  const allAvailablePcFonts = useMemo(() => {
    const combined = new Set<string>([
      ...(systemFonts || []),
      ...(localFonts || []),
      ...(customFonts || []),
      ...(manualFonts || []),
      ...extraPcFonts
    ]);
    return Array.from(combined)
      .map(f => f.trim())
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b, 'pt-BR', { sensitivity: 'base' }));
  }, [systemFonts, localFonts, customFonts, manualFonts, extraPcFonts]);

  // Scan all PC fonts (A-Z) and cache FontData objects for binary OpenType glyph extraction
  const handleScanAllPcFonts = async () => {
    setScanningPcFonts(true);
    try {
      if (onLoadLocalFonts) {
        await onLoadLocalFonts();
      }
      const winAny = typeof window !== 'undefined' ? (window as any) : null;
      if (winAny && typeof winAny.queryLocalFonts === 'function') {
        try {
          const fontDataList = await winAny.queryLocalFonts();
          if (Array.isArray(fontDataList) && fontDataList.length > 0) {
            const families: string[] = [];
            fontDataList.forEach((fd: any) => {
              if (fd && fd.family) {
                families.push(fd.family);
                const key = fd.family.toLowerCase();
                // Prefer Regular style when multiple weights exist for the same family
                const existing = localFontDataMapRef.current.get(key);
                if (!existing || (fd.style && /regular|normal|book|roman/i.test(fd.style))) {
                  localFontDataMapRef.current.set(key, fd);
                }
              }
            });
            setExtraPcFonts(Array.from(new Set(families)));
            const totalUnique = new Set([...allAvailablePcFonts, ...families]).size;
            showToast(`✨ ${totalUnique} fontes do computador carregadas (de A a Z)!`);
            setScanningPcFonts(false);
            return;
          }
        } catch (err) {
          console.warn('[OpenType] Permissão ou leitura de queryLocalFonts:', err);
        }
      }
      const detected = await detectInstalledFonts();
      if (detected && detected.length > 0) {
        setExtraPcFonts(detected);
        showToast(`✨ ${detected.length} fontes do computador carregadas (de A a Z)!`);
      } else {
        showToast('Fontes do computador atualizadas!');
      }
    } catch (e) {
      showToast('Erro ao buscar fontes do computador.');
    } finally {
      setScanningPcFonts(false);
    }
  };

  // Select and decode a PC font by family name (loads real TTF/OTF buffer when available for full swashes/glyphs)
  const handleSelectFontByName = async (familyName: string) => {
    const existingIdx = fonts.findIndex(f => f.family.toLowerCase() === familyName.toLowerCase());
    if (existingIdx >= 0) {
      setActiveFontIndex(existingIdx);
      setSelectedGlyph(null);
      return;
    }

    setLoadingFont(true);
    try {
      let parsedItem: ActiveFontItem | null = null;
      const key = familyName.toLowerCase();
      let fontHandle = localFontDataMapRef.current.get(key);

      // If not cached yet, query local fonts once to grab the binary FontData handle
      const winAny = typeof window !== 'undefined' ? (window as any) : null;
      if (!fontHandle && winAny && typeof winAny.queryLocalFonts === 'function') {
        try {
          const allHandles = await winAny.queryLocalFonts();
          if (Array.isArray(allHandles)) {
            allHandles.forEach((fd: any) => {
              if (fd && fd.family) {
                const k = fd.family.toLowerCase();
                const ex = localFontDataMapRef.current.get(k);
                if (!ex || (fd.style && /regular|normal|book|roman/i.test(fd.style))) {
                  localFontDataMapRef.current.set(k, fd);
                }
              }
            });
            fontHandle = localFontDataMapRef.current.get(key);
          }
        } catch (_) {}
      }

      if (fontHandle && typeof fontHandle.blob === 'function') {
        const blob: Blob = await fontHandle.blob();
        const buffer = await blob.arrayBuffer();
        parsedItem = await parseAndAddFont(familyName, familyName, 'local', buffer);
      }

      if (!parsedItem) {
        parsedItem = createSystemFontItem(familyName);
      }

      setFonts(prev => {
        const alreadyIdx = prev.findIndex(f => f.family.toLowerCase() === familyName.toLowerCase());
        if (alreadyIdx >= 0) {
          const updated = [...prev];
          updated[alreadyIdx] = parsedItem!;
          setActiveFontIndex(alreadyIdx);
          return updated;
        }
        const next = [...prev, parsedItem!];
        setActiveFontIndex(next.length - 1);
        return next;
      });

      setSelectedGlyph(null);
      if (onRegisterFont) onRegisterFont(familyName);
      showToast(`Fonte "${familyName}" selecionada! (${parsedItem.font.glyphs.length} glifos)`);
    } catch (e) {
      const sysItem = createSystemFontItem(familyName);
      setFonts(prev => {
        const next = [...prev, sysItem];
        setActiveFontIndex(next.length - 1);
        return next;
      });
      setSelectedGlyph(null);
      if (onRegisterFont) onRegisterFont(familyName);
    } finally {
      setLoadingFont(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-900 text-slate-100 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl select-none">
      
      {/* 1. TOP HEADER */}
      <div className="px-5 py-3.5 bg-slate-950/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-tight">Catálogo de Glifos & Letras Especiais</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Fácil & Rápido
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Escolha a fonte, clique nas letras decorativas e aplique diretamente no seu texto.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Help Button */}
          <button
            onClick={() => setShowGuide(!showGuide)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-lg border border-slate-700/60 transition-all cursor-pointer"
            title="Dicas de como usar"
          >
            <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Como Usar?</span>
          </button>

          {/* Close & Return Button */}
          {onClose && (
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 active:scale-95 rounded-lg shadow-sm transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar ao Miolo</span>
            </button>
          )}
        </div>
      </div>

      {/* HOW TO USE GUIDE ACCORDION */}
      {showGuide && (
        <div className="px-5 py-3 bg-indigo-950/40 border-b border-indigo-800/40 text-xs text-indigo-200 flex items-center justify-between gap-4 animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
            <div className="space-y-0.5">
              <p className="font-semibold text-white">Como aplicar letras especiais no seu miolo:</p>
              <p className="text-[11px] text-indigo-200/80">
                1. Selecione a fonte desejada no campo abaixo. &bull; 2. No campo de texto, selecione a letra que quer embelezar. &bull; 3. Clique no glifo/swash desejado e clique em <b>"Salvar no Texto Selecionado"</b>!
              </p>
            </div>
          </div>
          <button 
            onClick={() => setShowGuide(false)}
            className="p-1 text-indigo-300 hover:text-white rounded-md hover:bg-indigo-900/50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 2. FONT SELECTION & LIVE TEXT BUILDER BANNER */}
      <div className="p-4 md:p-5 bg-slate-900/90 border-b border-slate-800 space-y-3.5 shrink-0">
        
        {/* Row 1: Font Selector & Upload Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-[280px]">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider shrink-0 flex items-center gap-1">
              <Type className="w-3.5 h-3.5 text-indigo-400" />
              Fonte:
            </label>
            <div className="relative flex-1 max-w-md">
              <select
                value={String(activeFontIndex)}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val.startsWith('sys:')) {
                    const sysFontName = val.slice(4);
                    handleSelectFontByName(sysFontName);
                  } else {
                    const idx = parseInt(val, 10);
                    if (!isNaN(idx)) {
                      setActiveFontIndex(idx);
                      setSelectedGlyph(null);
                    }
                  }
                }}
                className="w-full pl-3 pr-8 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none appearance-none cursor-pointer"
              >
                <optgroup label="✨ Fontes Carregadas / Com Swashes">
                  {fonts.map((f, i) => (
                    <option key={`font-${i}`} value={String(i)}>
                      {f.name} {f.source === 'uploaded' ? '(Enviada)' : f.source === 'local' ? '(Do PC)' : ''}
                    </option>
                  ))}
                </optgroup>
                {allAvailablePcFonts.length > 0 && (
                  <optgroup label={`💻 Fontes do Computador (${allAvailablePcFonts.length} fontes de A a Z)`}>
                    {allAvailablePcFonts.map(sysFont => (
                      <option key={`sys-${sysFont}`} value={`sys:${sysFont}`}>
                        {sysFont}
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
            </div>

            {/* Hidden Font File Input */}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFontUpload} 
              accept=".ttf,.otf,.woff" 
              className="hidden" 
            />

            {/* Upload TTF/OTF Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={loadingFont}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-indigo-300 bg-indigo-950/60 hover:bg-indigo-900/80 border border-indigo-800/80 rounded-xl transition-all cursor-pointer shadow-xs disabled:opacity-50 shrink-0"
              title="Subir arquivo de fonte (.ttf, .otf, .woff) do seu computador"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>+ Subir Fonte</span>
            </button>

            {/* Load PC Fonts Button */}
            <button
              type="button"
              onClick={handleScanAllPcFonts}
              disabled={localFontsLoading || scanningPcFonts}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 rounded-xl transition-all cursor-pointer shrink-0 disabled:opacity-50"
              title="Carregar todas as fontes instaladas no seu computador (A a Z)"
            >
              {(localFontsLoading || scanningPcFonts) ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
              ) : (
                <Monitor className="w-3.5 h-3.5 text-indigo-400" />
              )}
              <span className="hidden lg:inline">Buscar Fontes do PC</span>
            </button>
          </div>

          {/* Quick info tag */}
          {activeFont && (
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700/70 font-mono text-[11px] text-slate-300">
                {glyphItems.length} glifos detectados
              </span>
              {swashesCount > 0 && (
                <span className="px-2.5 py-1 rounded-lg bg-purple-950/60 border border-purple-800/60 text-purple-300 font-bold text-[11px] flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-purple-400" />
                  {swashesCount} swashes decorativos
                </span>
              )}
            </div>
          )}
        </div>

        {/* Row 2: Selected Text / Composer Bar (THE STAR FEATURE) */}
        <div className={`p-3.5 rounded-xl border transition-all ${
          selectedTextElement 
            ? 'bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border-indigo-500/40 shadow-lg' 
            : 'bg-slate-800/60 border-slate-700/70'
        }`}>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                {selectedTextElement ? `Texto Selecionado no Miolo (${selectedTextElement.name || 'Texto'})` : 'Montar Texto com Glifos'}
              </span>
              {selectedTextElement && activeFont && (
                <span className="text-[11px] text-slate-400 font-normal">
                  (Fonte original: <b className="text-slate-200">{selectedTextElement.fontFamily}</b>)
                </span>
              )}
            </div>

            {selectedTextElement && activeFont && (
              <label className="flex items-center gap-2 text-xs text-indigo-300 cursor-pointer hover:text-white">
                <input
                  type="checkbox"
                  checked={applyFontToSelected}
                  onChange={(e) => setApplyFontToSelected(e.target.checked)}
                  className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500"
                />
                <span>Mudar fonte do texto para <b>{activeFont.family}</b></span>
              </label>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            {/* The Live Interactive Text Input */}
            <div className="relative flex-1">
              <input
                ref={textInputRef}
                type="text"
                value={composerText}
                onChange={(e) => setComposerText(e.target.value)}
                placeholder="Clique nos glifos abaixo para inserir letras decorativas..."
                style={{ fontFamily: activeFont ? activeFont.family : undefined }}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-lg text-white font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none shadow-inner"
              />
              <span className="absolute right-3 top-3 text-[10px] text-slate-500 pointer-events-none hidden md:inline">
                {composerText.length} caracteres
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 shrink-0">
              {/* PRIMARY: Apply to selected text in Dashboard */}
              {selectedTextElement && (
                <button
                  type="button"
                  onClick={handleApplyToSelected}
                  className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-extrabold rounded-xl shadow-md transition-all cursor-pointer ${
                    appliedNotification
                      ? 'bg-emerald-600 text-white scale-105'
                      : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white active:scale-95'
                  }`}
                  title="Aplica o texto modificado diretamente na caixa selecionada do miolo"
                >
                  {appliedNotification ? (
                    <CheckCheck className="w-4 h-4 text-white" />
                  ) : (
                    <Wand2 className="w-4 h-4 text-white" />
                  )}
                  <span>{appliedNotification ? 'Aplicado no Miolo!' : 'Salvar no Texto Selecionado'}</span>
                </button>
              )}

              {/* Insert as New Text on Layout */}
              {(!selectedTextElement || onInsertIntoLayout) && (
                <button
                  type="button"
                  onClick={handleInsertAsNewText}
                  className="flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md transition-all cursor-pointer active:scale-95"
                  title="Insere este texto como um novo elemento na página"
                >
                  <Plus className="w-4 h-4" />
                  <span>Novo Texto na Página</span>
                </button>
              )}

              {/* Copy Full Text */}
              <button
                type="button"
                onClick={handleCopyComposerText}
                className="p-2.5 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-all cursor-pointer"
                title="Copiar texto para área de transferência"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
            <span className="text-amber-400 font-bold">💡 Dica:</span> 
            Selecione uma letra no campo acima e clique em qualquer glifo abaixo para substituí-la pelo modelo decorativo!
          </p>
        </div>

      </div>

      {/* 3. FILTER BAR & GRID CONTROLS */}
      <div className="px-5 py-2.5 bg-slate-950/60 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
        
        {/* Category Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto py-0.5 custom-scrollbar">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
              categoryFilter === 'all'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            ✨ Todos ({glyphItems.length})
          </button>
          <button
            onClick={() => setCategoryFilter('swashes')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1 ${
              categoryFilter === 'swashes'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-purple-300 hover:text-white hover:bg-purple-950/40'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Swashes & Decorativas ({swashesCount})</span>
          </button>
          <button
            onClick={() => setCategoryFilter('letters')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
              categoryFilter === 'letters'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            🔤 Letras (A-Z)
          </button>
          <button
            onClick={() => setCategoryFilter('numbers')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
              categoryFilter === 'numbers'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            🔢 Números (0-9)
          </button>
          <button
            onClick={() => setCategoryFilter('symbols')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
              categoryFilter === 'symbols'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            ⭐ Símbolos & Enfeites
          </button>
        </div>

        {/* Search & Size Switcher */}
        <div className="flex items-center gap-3">
          {/* Quick Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar letra..."
              className="pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:ring-1 focus:ring-indigo-500 outline-none w-32 md:w-44"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Grid Size Toggle */}
          <div className="flex items-center bg-slate-900 p-1 rounded-lg border border-slate-700/80">
            <button
              onClick={() => setGridSize('sm')}
              className={`px-2 py-1 text-[11px] font-bold rounded ${gridSize === 'sm' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
              title="Miniaturas Pequenas"
            >
              P
            </button>
            <button
              onClick={() => setGridSize('md')}
              className={`px-2 py-1 text-[11px] font-bold rounded ${gridSize === 'md' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
              title="Miniaturas Médias"
            >
              M
            </button>
            <button
              onClick={() => setGridSize('lg')}
              className={`px-2 py-1 text-[11px] font-bold rounded ${gridSize === 'lg' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
              title="Miniaturas Grandes"
            >
              G
            </button>
          </div>
        </div>

      </div>

      {/* 4. GLYPHS TILES GRID */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar bg-slate-950/40">
        {loadingFont ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            <p className="text-sm font-medium">Carregando fontes e decodificando glifos...</p>
          </div>
        ) : filteredGlyphs.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-2 p-8 text-center">
            <AlertCircle className="w-10 h-10 text-slate-600" />
            <p className="text-sm font-semibold text-slate-300">Nenhum glifo encontrado para este filtro.</p>
            <p className="text-xs text-slate-500">Tente buscar por outra letra ou selecionar "Todos".</p>
          </div>
        ) : (
          <div className={`grid gap-2.5 ${
            gridSize === 'sm'
              ? 'grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 xl:grid-cols-14'
              : gridSize === 'md'
              ? 'grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12'
              : 'grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10'
          }`}>
            {filteredGlyphs.map((item) => {
              const isSelected = selectedGlyph?.index === item.index;
              const thumbnailSize = gridSize === 'sm' ? 36 : gridSize === 'md' ? 52 : 72;

              return (
                <div
                  key={`glyph-${item.index}`}
                  onClick={() => insertGlyphIntoComposer(item.glyph)}
                  onDoubleClick={() => handleGlyphDoubleClick(item.glyph)}
                  className={`group relative flex flex-col items-center justify-center p-2 rounded-xl transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-indigo-600/30 border-indigo-400 shadow-md ring-2 ring-indigo-500/50 scale-105 z-10'
                      : item.isSwash
                      ? 'bg-purple-950/20 hover:bg-purple-900/30 border-purple-800/40 hover:border-purple-600'
                      : 'bg-slate-900/80 hover:bg-slate-800/90 border-slate-800 hover:border-slate-700'
                  }`}
                  title={`${item.name} ${item.charStr ? `("${item.charStr}")` : ''} - Clique para inserir, duplo clique para aplicar`}
                >
                  {/* Swash badge */}
                  {item.isSwash && (
                    <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-purple-400 ring-2 ring-slate-900"></span>
                  )}

                  {/* Crisp Canvas Glyph Render */}
                  <div className="flex items-center justify-center pointer-events-none py-1">
                    <GlyphThumbnail 
                      glyph={item.glyph} 
                      size={thumbnailSize} 
                      color={isSelected ? '#a5b4fc' : item.isSwash ? '#f472b6' : '#f8fafc'}
                      fontFamily={activeFont?.family}
                    />
                  </div>

                  {/* Subtle label */}
                  <span className="text-[10px] font-mono text-slate-400 group-hover:text-slate-200 truncate max-w-full px-1">
                    {item.charStr || item.name}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. BOTTOM ACTION BAR FOR SELECTED GLYPH */}
      {selectedGlyph && activeFont && (
        <div className="px-5 py-3 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4 shrink-0 shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center shadow-inner">
              <GlyphThumbnail glyph={selectedGlyph} size={40} color="#38bdf8" fontFamily={activeFont.family} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">
                  {getGlyphCharacter(selectedGlyph) ? `Glifo: "${getGlyphCharacter(selectedGlyph)}"` : (selectedGlyph.name || 'Glifo Decorativo')}
                </span>
                {isGlyphSwash(selectedGlyph) && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-900/60 text-purple-300 border border-purple-700/50">
                    Swash / Alternativo
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Fonte ativa: <b className="text-slate-200">{activeFont.name}</b>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Insert into composer / selected text */}
            <button
              onClick={() => insertGlyphIntoComposer(selectedGlyph)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-sm transition-all cursor-pointer active:scale-95"
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>Inserir no Texto</span>
            </button>

            {/* Copy Glyph Character */}
            {getGlyphCharacter(selectedGlyph) && (
              <button
                onClick={() => handleCopyGlyph(selectedGlyph)}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-all cursor-pointer"
                title="Copiar caractere para colar em qualquer lugar"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar</span>
              </button>
            )}

            {/* If Vector/Non-Unicode */}
            {onInsertVectorGlyph && (
              <button
                onClick={() => handleInsertAsVector(selectedGlyph)}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-purple-200 hover:text-white bg-purple-950/60 hover:bg-purple-900/80 border border-purple-800/80 rounded-xl transition-all cursor-pointer"
                title="Insere este desenho vetorial independente no miolo"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-300" />
                <span>Inserir como Desenho (Vetor)</span>
              </button>
            )}

            {/* Dismiss Bar */}
            <button
              onClick={() => setSelectedGlyph(null)}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              title="Fechar detalhes"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* FLOATING TOAST NOTIFICATION */}
      {copiedNotification && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 bg-slate-900 text-white border border-indigo-500/50 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-bold animate-in fade-in slide-in-from-bottom-3 duration-200">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{copiedNotification}</span>
        </div>
      )}

    </div>
  );
};
