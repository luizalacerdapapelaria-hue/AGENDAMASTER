import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as opentype from 'opentype.js';
import { 
  Upload, Search, Type, Sliders, ChevronRight, Settings, 
  HelpCircle, Eye, EyeOff, Sparkles, RefreshCw, ZoomIn, 
  ZoomOut, Copy, Download, Trash2, ArrowRight, Check, CheckSquare, Square,
  Moon, Sun, Info, Play, Palette, FileText, X, Monitor, Layers, AlertCircle
} from 'lucide-react';
import { saveFontToDB, getAllFontsFromDB, deleteFontFromDB, StoredFont as DBStoredFont } from '../../../core/logic/fontStorage';

interface OpenTypeEditorProps {
  user: { name: string; email: string };
  onClose?: () => void;
  onRegisterFont?: (fontFamily: string) => void;
  onInsertIntoLayout?: (text: string, fontFamily: string) => void;
  onInsertVectorGlyph?: (svgDataUrl: string, title: string) => void;
}

interface ActiveFontItem {
  name: string;
  family: string;
  source: 'preset' | 'uploaded' | 'local';
  font: opentype.Font;
  buffer: ArrayBuffer;
}

interface GlyphCategory {
  name: string;
  label: string;
}

// Convert opentype.Glyph to a standalone SVG data URL and SVG string
export function generateGlyphSVG(glyph: opentype.Glyph, font: opentype.Font, color: string = '#111827'): { svgString: string; dataUrl: string } {
  const unitsPerEm = font.unitsPerEm || 1000;
  const ascender = font.ascender || 800;
  const descender = font.descender || -200;
  
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

// Component to render crisp preview thumbnail of any opentype glyph via canvas
const GlyphThumbnail: React.FC<{ glyph: opentype.Glyph; size?: number; color?: string }> = React.memo(({ glyph, size = 32, color }) => {
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
      path.fill = color || '#3b82f6';
      path.draw(ctx);
    } catch (e) {
      // Fallback
      ctx.fillStyle = color || '#3b82f6';
      ctx.font = `${size * 0.5}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(glyph.name || '?', size / 2, size / 2);
    }
  }, [glyph, size, color]);

  return <canvas ref={canvasRef} style={{ width: size, height: size }} className="shrink-0 pointer-events-none" />;
});

export const OpenTypeEditor: React.FC<OpenTypeEditorProps> = ({ 
  user, 
  onClose, 
  onRegisterFont, 
  onInsertIntoLayout, 
  onInsertVectorGlyph 
}) => {
  // Theme state
  const [workspaceTheme, setWorkspaceTheme] = useState<'light' | 'dark'>('light');

  // Sidebar Visibility
  const [showLeftSidebar, setShowLeftSidebar] = useState<boolean>(() => {
    return typeof window !== 'undefined' ? window.innerWidth >= 1024 : true;
  });
  const [showRightSidebar, setShowRightSidebar] = useState<boolean>(() => {
    return typeof window !== 'undefined' ? window.innerWidth >= 1280 : true;
  });
  const [showTutorial, setShowTutorial] = useState<boolean>(true);

  // System local fonts modal state
  const [showSystemFontsModal, setShowSystemFontsModal] = useState<boolean>(false);
  const [systemFontsList, setSystemFontsList] = useState<any[]>([]);
  const [systemFontSearch, setSystemFontSearch] = useState<string>('');

  // Font states
  const [fonts, setFonts] = useState<ActiveFontItem[]>([]);
  const [activeFontIndex, setActiveFontIndex] = useState<number>(-1);
  const [loadingFont, setLoadingFont] = useState<boolean>(false);
  const [fontError, setFontError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Editor configuration
  const [editorText, setEditorText] = useState<string>(
    "Elegância & Arte com Tipografia OpenType.\nSelecione qualquer letra para ver glifos alternativos!"
  );
  const [fontSize, setFontSize] = useState<number>(30);
  const [lineHeight, setLineHeight] = useState<number>(1.4);
  const [letterSpacing, setLetterSpacing] = useState<number>(0);

  // Active OpenType Feature Settings
  const [features, setFeatures] = useState({
    liga: true,  // Standard Ligatures
    dlig: false, // Discretionary Ligatures
    salt: false, // Stylistic Alternates
    swsh: false, // Swashes
    calt: true,  // Contextual Alternates
    smcp: false, // Small Caps
    frac: false, // Fractions
    onum: false, // Oldstyle Figures
    tnum: false, // Tabular Figures
  });

  // Stylistic sets ss01 - ss10
  const [stylisticSets, setStylisticSets] = useState<Record<string, boolean>>({
    ss01: false, ss02: false, ss03: false, ss04: false, ss05: false,
    ss06: false, ss07: false, ss08: false, ss09: false, ss10: false,
  });

  // Sidebar search & filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const glyphsPerPage = 120;

  // Detail View of Selected Glyph
  const [selectedGlyphIndex, setSelectedGlyphIndex] = useState<number | null>(null);

  // Floating Alternates state
  const [alternates, setAlternates] = useState<opentype.Glyph[]>([]);
  const [alternatesPosition, setAlternatesPosition] = useState<{ x: number; y: number } | null>(null);
  const [selectedCharRange, setSelectedCharRange] = useState<{ start: number; end: number; text: string } | null>(null);

  // Refs
  const editorRef = useRef<HTMLDivElement | null>(null);
  const savedRangeRef = useRef<Range | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const showNotification = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Preset fonts definitions
  const presetFontsList = useMemo(() => [
    {
      name: 'Great Vibes (Caligrafia & Swashes)',
      family: 'Great-Vibes',
      url: '/fonts/greatvibes.ttf'
    },
    {
      name: 'Cinzel Decorative (Letras & Capitulares)',
      family: 'Cinzel-Decorative',
      url: '/fonts/cinzel.ttf'
    },
    {
      name: 'Playfair Display (Serifada Elegante)',
      family: 'Playfair-Display',
      url: '/fonts/playfair.ttf'
    }
  ], []);

  // Register font in the browser's Document FontFaceSet
  const registerFontFace = async (family: string, buffer: ArrayBuffer) => {
    try {
      const fontFace = new FontFace(family, buffer);
      const loadedFace = await fontFace.load();
      document.fonts.add(loadedFace);
    } catch (e) {
      console.warn(`Could not register FontFace for ${family}:`, e);
    }
  };

  // Helper to load and parse a font buffer
  const parseAndAddFont = async (
    name: string, 
    family: string, 
    source: 'preset' | 'uploaded' | 'local', 
    buffer: ArrayBuffer
  ): Promise<ActiveFontItem | null> => {
    try {
      // Must clone buffer before passing to opentype to avoid detached ArrayBuffers
      const bufferCopy = buffer.slice(0);
      const font = opentype.parse(bufferCopy);
      
      // Inject font reference into glyphs for accurate metrics drawing
      for (let i = 0; i < font.glyphs.length; i++) {
        const g = font.glyphs.get(i);
        if (g) (g as any).font = font;
      }

      await registerFontFace(family, buffer);

      return {
        name,
        family,
        source,
        font,
        buffer
      };
    } catch (e: any) {
      console.error(`Failed to parse font ${name}:`, e);
      return null;
    }
  };

  // Load all initial fonts (Presets + IndexedDB saved fonts)
  useEffect(() => {
    let isMounted = true;

    const loadAllFonts = async () => {
      setLoadingFont(true);
      setFontError(null);
      const loaded: ActiveFontItem[] = [];

      // 1. Load Presets
      for (const preset of presetFontsList) {
        try {
          const res = await fetch(preset.url);
          if (res.ok) {
            const ab = await res.arrayBuffer();
            const parsed = await parseAndAddFont(preset.name, preset.family, 'preset', ab);
            if (parsed) loaded.push(parsed);
          }
        } catch (e) {
          console.warn(`Failed to load preset font ${preset.name}:`, e);
        }
      }

      // 2. Load Stored Custom Fonts from IndexedDB (AgendaFontsDB)
      try {
        const storedList = await getAllFontsFromDB();
        for (const stored of storedList) {
          if (stored.buffer && stored.buffer.byteLength > 0) {
            const familyName = stored.name.replace(/\.[^/.]+$/, '').trim() || 'CustomFont';
            const parsed = await parseAndAddFont(stored.name, familyName, 'uploaded', stored.buffer);
            if (parsed) {
              // Avoid duplicates
              if (!loaded.some(f => f.family === parsed.family)) {
                loaded.push(parsed);
              }
            }
          }
        }
      } catch (e) {
        console.warn('Failed to load custom fonts from IndexedDB:', e);
      }

      if (isMounted) {
        setFonts(loaded);
        if (loaded.length > 0) {
          setActiveFontIndex(0);
        } else {
          setFontError('Nenhuma fonte disponível no momento. Envie uma fonte TTF ou OTF.');
        }
        setLoadingFont(false);
      }
    };

    loadAllFonts();

    return () => {
      isMounted = false;
    };
  }, [presetFontsList]);

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
    setFontError(null);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const buffer = await file.arrayBuffer();
        const rawFamily = file.name.replace(/\.[^/.]+$/, '').trim();
        const family = `Custom-${rawFamily.replace(/\s+/g, '-')}-${Date.now()}`;
        
        const parsed = await parseAndAddFont(file.name, family, 'uploaded', buffer);
        if (parsed) {
          // Persist to unified IndexedDB
          await saveFontToDB(file.name, buffer);

          setFonts(prev => [parsed, ...prev]);
          setActiveFontIndex(0);
          setSelectedGlyphIndex(null);

          if (onRegisterFont) {
            onRegisterFont(family);
          }

          showNotification(`Fonte "${file.name}" carregada com sucesso! (${parsed.font.glyphs.length} glifos detectados)`);
        } else {
          setFontError(`Não foi possível decodificar o arquivo de fonte "${file.name}".`);
        }
      } catch (err: any) {
        setFontError(`Erro ao carregar fonte: ${err.message}`);
      }
    }

    setLoadingFont(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Remove a custom uploaded font
  const handleDeleteFont = async (index: number) => {
    const fontToDelete = fonts[index];
    if (!fontToDelete || fontToDelete.source === 'preset') return;

    try {
      await deleteFontFromDB(fontToDelete.name);
      const updated = fonts.filter((_, idx) => idx !== index);
      setFonts(updated);
      if (activeFontIndex >= updated.length) {
        setActiveFontIndex(Math.max(0, updated.length - 1));
      }
      showNotification(`Fonte "${fontToDelete.name}" removida.`, 'info');
    } catch (e) {
      console.error('Error deleting font:', e);
    }
  };

  // Open Local System Fonts Picker (if supported by browser)
  const handleQueryLocalFonts = async () => {
    if ('queryLocalFonts' in window) {
      try {
        setLoadingFont(true);
        const localFonts = await (window as any).queryLocalFonts();
        setSystemFontsList(localFonts);
        setShowSystemFontsModal(true);
      } catch (e: any) {
        alert('Permissão para acessar fontes locais não concedida ou cancelada.');
      } finally {
        setLoadingFont(false);
      }
    } else {
      alert('A API de Fontes Locais não é suportada diretamente no seu navegador. Por favor, utilize o botão "Enviar Fonte (TTF/OTF)".');
    }
  };

  const handleSelectSystemFont = async (fontMetadata: any) => {
    try {
      setShowSystemFontsModal(false);
      setLoadingFont(true);
      const blob = await fontMetadata.blob();
      const buffer = await blob.arrayBuffer();
      const family = fontMetadata.family || 'LocalFont';
      
      const parsed = await parseAndAddFont(fontMetadata.fullName || family, family, 'uploaded', buffer);
      if (parsed) {
        await saveFontToDB(fontMetadata.fullName || family, buffer);
        setFonts(prev => [parsed, ...prev]);
        setActiveFontIndex(0);
        if (onRegisterFont) onRegisterFont(family);
        showNotification(`Fonte do computador "${fontMetadata.fullName || family}" importada com sucesso!`);
      }
    } catch (e: any) {
      alert(`Falha ao ler dados da fonte local: ${e.message}`);
    } finally {
      setLoadingFont(false);
    }
  };

  // Category detection for every glyph
  const getGlyphCategory = (g: opentype.Glyph, unicode: number | null): string => {
    const name = (g.name || '').toLowerCase();
    if (unicode !== null && unicode > 0) {
      if (unicode >= 48 && unicode <= 57) return 'number';
      if ((unicode >= 65 && unicode <= 90) || (unicode >= 97 && unicode <= 122) || (unicode >= 192 && unicode <= 382)) return 'letter';
      if ((unicode >= 33 && unicode <= 47) || (unicode >= 58 && unicode <= 64) || (unicode >= 91 && unicode <= 96) || (unicode >= 123 && unicode <= 126)) return 'punctuation';
      if (unicode >= 8704 && unicode <= 8959) return 'math';
      if (unicode >= 0xE000 && unicode <= 0xF8FF) return 'alternate';
    }
    if (name.includes('liga') || name.includes('_') || name.startsWith('f_')) return 'ligature';
    if (name.includes('swsh') || name.includes('swash')) return 'swash';
    if (name.includes('alt') || name.includes('ss') || name.includes('init') || name.includes('fina') || name.includes('medi')) return 'alternate';
    if (name.includes('ornm') || name.includes('ornament') || name.includes('bullet') || name.includes('star') || name.includes('heart') || name.includes('flower')) return 'ornament';
    return 'other';
  };

  // Categories definitions
  const categories: GlyphCategory[] = [
    { name: 'all', label: 'Todos os Glifos' },
    { name: 'letter', label: 'Letras e Alfabeto' },
    { name: 'swash', label: 'Swashes e Florais (swsh)' },
    { name: 'alternate', label: 'Alternativas Estilísticas (salt/ss)' },
    { name: 'ligature', label: 'Ligaduras (liga/dlig)' },
    { name: 'ornament', label: 'Ornamentos e Ícones' },
    { name: 'number', label: 'Algarismos' },
    { name: 'punctuation', label: 'Pontuação e Símbolos' },
    { name: 'other', label: 'Outros Caracteres' },
  ];

  // All parsed glyph items for the active font
  const glyphItems = useMemo(() => {
    if (!activeFont) return [];
    const items: Array<{
      index: number;
      name: string;
      unicode: number | null;
      glyph: opentype.Glyph;
      category: string;
      isMapped: boolean;
    }> = [];

    const font = activeFont.font;
    for (let i = 0; i < font.glyphs.length; i++) {
      const g = font.glyphs.get(i);
      if (!g) continue;

      let unicode: number | null = null;
      if (g.unicode !== undefined && g.unicode !== null && g.unicode > 0) {
        unicode = g.unicode;
      } else if (g.unicodes && g.unicodes.length > 0 && g.unicodes[0] > 0) {
        unicode = g.unicodes[0];
      }

      const category = getGlyphCategory(g, unicode);
      items.push({
        index: i,
        name: g.name || `glyph-${i}`,
        unicode,
        glyph: g,
        category,
        isMapped: unicode !== null
      });
    }

    return items;
  }, [activeFont]);

  // Filtered glyph items based on search and category
  const filteredGlyphs = useMemo(() => {
    let result = glyphItems;

    if (selectedCategory !== 'all') {
      result = result.filter(item => item.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(item => {
        const nameMatch = item.name.toLowerCase().includes(q);
        const indexMatch = item.index.toString() === q;
        const hexMatch = item.unicode ? `u+${item.unicode.toString(16)}`.includes(q) : false;
        let charMatch = false;
        if (item.unicode) {
          try {
            charMatch = String.fromCodePoint(item.unicode).toLowerCase().includes(q);
          } catch (e) {}
        }
        return nameMatch || indexMatch || hexMatch || charMatch;
      });
    }

    return result;
  }, [glyphItems, selectedCategory, searchQuery]);

  // Paginated glyph items
  const paginatedGlyphs = useMemo(() => {
    const start = (currentPage - 1) * glyphsPerPage;
    return filteredGlyphs.slice(start, start + glyphsPerPage);
  }, [filteredGlyphs, currentPage, glyphsPerPage]);

  const totalPages = Math.ceil(filteredGlyphs.length / glyphsPerPage) || 1;

  // Reset pagination on filter or font change
  useEffect(() => {
    setCurrentPage(1);
    setSelectedGlyphIndex(null);
  }, [activeFontIndex, selectedCategory, searchQuery]);

  // CSS Font-Feature-Settings string
  const computedFontFeatures = useMemo(() => {
    const list: string[] = [];
    Object.entries(features).forEach(([feat, active]) => {
      if (active) list.push(`"${feat}" 1`);
    });
    Object.entries(stylisticSets).forEach(([set, active]) => {
      if (active) list.push(`"${set}" 1`);
    });
    return list.join(', ');
  }, [features, stylisticSets]);

  // Helper to extract a character string from an opentype Glyph
  const getGlyphCharacter = (glyph: opentype.Glyph): string => {
    if (glyph.unicode !== undefined && glyph.unicode !== null && glyph.unicode > 0) {
      try {
        return String.fromCodePoint(glyph.unicode);
      } catch (e) {}
    }

    if (glyph.unicodes && glyph.unicodes.length > 0) {
      const validCode = glyph.unicodes.find(u => u && u > 0);
      if (validCode) {
        try {
          return String.fromCodePoint(validCode);
        } catch (e) {}
      }
    }

    if (glyph.name) {
      const uniMatch = glyph.name.match(/^(?:uni|u|u\+)([0-9a-fA-F]{4,6})$/i);
      if (uniMatch) {
        const code = parseInt(uniMatch[1], 16);
        if (code > 0) {
          try {
            return String.fromCodePoint(code);
          } catch (e) {}
        }
      }
      const baseCharMatch = glyph.name.match(/^([a-zA-Z0-9])/);
      if (baseCharMatch) {
        return baseCharMatch[1];
      }
    }

    return '';
  };

  // Insert Glyph into Text Editor
  const insertGlyph = (glyph: opentype.Glyph): string => {
    if (!editorRef.current) return editorText;

    let selection = window.getSelection();
    let range: Range | null = null;

    if (selection && selection.rangeCount > 0) {
      const currentRange = selection.getRangeAt(0);
      if (editorRef.current.contains(currentRange.startContainer)) {
        range = currentRange;
      }
    }

    if (!range && savedRangeRef.current) {
      range = savedRangeRef.current;
    }

    if (!range) {
      editorRef.current.focus();
      selection = window.getSelection();
      range = document.createRange();
      range.selectNodeContents(editorRef.current);
      range.collapse(false);
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }

    try {
      range.deleteContents();
    } catch (e) {}

    const charStr = getGlyphCharacter(glyph) || ' ';
    const textNode = document.createTextNode(charStr);
    range.insertNode(textNode);
    range.setStartAfter(textNode);
    range.collapse(true);

    if (selection) {
      selection.removeAllRanges();
      selection.addRange(range);
    }

    const updatedText = editorRef.current.innerText || editorRef.current.textContent || '';
    setEditorText(updatedText);

    savedRangeRef.current = null;
    setAlternates([]);
    setAlternatesPosition(null);

    return updatedText;
  };

  // Double Click on Glyph: sends directly to Layout as Vector HD or Text!
  const handleGlyphDoubleClick = (glyph: opentype.Glyph) => {
    setSelectedGlyphIndex(glyph.index);
    if (!activeFont) return;

    const isDirectUnicode = glyph.unicode !== undefined && glyph.unicode !== null && glyph.unicode > 0;
    const charStr = getGlyphCharacter(glyph);

    if (isDirectUnicode && charStr) {
      const updated = insertGlyph(glyph);
      if (onInsertIntoLayout) {
        onInsertIntoLayout(updated || charStr, activeFont.family);
      }
      showNotification(`Texto enviado ao layout!`);
    } else {
      // Send as Crisp Vector HD Graphic
      const { dataUrl } = generateGlyphSVG(glyph, activeFont.font, '#111827');
      if (onInsertVectorGlyph) {
        onInsertVectorGlyph(dataUrl, glyph.name || `Glifo ${glyph.index}`);
        showNotification(`Glifo vetorial enviado diretamente ao layout!`);
      } else if (onInsertIntoLayout && charStr) {
        onInsertIntoLayout(charStr, activeFont.family);
      }
    }
  };

  // Sync ContentEditable content
  const handleEditorInput = () => {
    if (editorRef.current) {
      setEditorText(editorRef.current.innerText);
    }
  };

  // Find glyph alternates for selected character
  const detectAlternatesForSelection = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || !activeFont || !editorRef.current) {
      setAlternates([]);
      setAlternatesPosition(null);
      return;
    }

    const range = selection.getRangeAt(0);
    if (!editorRef.current.contains(range.startContainer)) return;

    savedRangeRef.current = range.cloneRange();
    const selectedText = range.toString();

    if (selectedText.length !== 1) {
      setAlternates([]);
      setAlternatesPosition(null);
      return;
    }

    const char = selectedText;
    const font = activeFont.font;
    const baseGlyphIndex = font.charToGlyphIndex(char);
    if (baseGlyphIndex === 0) return;

    const baseGlyph = font.glyphs.get(baseGlyphIndex);
    const baseName = baseGlyph.name || '';
    const foundAlts: opentype.Glyph[] = [];
    const addedIndices = new Set<number>([baseGlyphIndex]);

    // 1. Prefix Pattern-based Alternates Finder (e.g. a.alt, a.swsh, a.ss01)
    if (baseName) {
      const prefix = baseName + '.';
      for (let i = 0; i < font.glyphs.length; i++) {
        const g = font.glyphs.get(i);
        if (g && g.name && g.name.startsWith(prefix) && !addedIndices.has(i)) {
          foundAlts.push(g);
          addedIndices.add(i);
        }
      }
    }

    // 2. OpenType GSUB Lookup Engine parser
    const gsub = font.tables.gsub;
    if (gsub && gsub.lookups) {
      gsub.lookups.forEach((lookup: any) => {
        if (lookup.subtables) {
          lookup.subtables.forEach((subtable: any) => {
            if (subtable.coverage && subtable.coverage.glyphs) {
              const idxInCoverage = subtable.coverage.glyphs.indexOf(baseGlyphIndex);
              if (idxInCoverage !== -1) {
                if (subtable.alternateGlyphs && subtable.alternateGlyphs[idxInCoverage]) {
                  subtable.alternateGlyphs[idxInCoverage].forEach((altIdx: number) => {
                    if (!addedIndices.has(altIdx)) {
                      const g = font.glyphs.get(altIdx);
                      if (g) {
                        foundAlts.push(g);
                        addedIndices.add(altIdx);
                      }
                    }
                  });
                } else if (subtable.substitute && subtable.substitute[idxInCoverage]) {
                  const altIdx = subtable.substitute[idxInCoverage];
                  if (!addedIndices.has(altIdx)) {
                    const g = font.glyphs.get(altIdx);
                    if (g) {
                      foundAlts.push(g);
                      addedIndices.add(altIdx);
                    }
                  }
                } else if (subtable.deltaGlyphId) {
                  const altIdx = baseGlyphIndex + subtable.deltaGlyphId;
                  if (!addedIndices.has(altIdx)) {
                    const g = font.glyphs.get(altIdx);
                    if (g) {
                      foundAlts.push(g);
                      addedIndices.add(altIdx);
                    }
                  }
                }
              }
            }
          });
        }
      });
    }

    if (foundAlts.length > 0) {
      const rect = range.getBoundingClientRect();
      const parentRect = editorRef.current.getBoundingClientRect();
      
      setAlternates(foundAlts);
      setAlternatesPosition({
        x: rect.left - parentRect.left + (rect.width / 2),
        y: rect.top - parentRect.top - 70
      });

      setSelectedCharRange({
        start: range.startOffset,
        end: range.endOffset,
        text: selectedText
      });
    } else {
      setAlternates([]);
      setAlternatesPosition(null);
    }
  };

  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.alternates-popover') && !target.closest('.workspace-textarea')) {
        setAlternates([]);
        setAlternatesPosition(null);
      }
    };

    window.addEventListener('mousedown', handleGlobalClick);
    return () => {
      window.removeEventListener('mousedown', handleGlobalClick);
    };
  }, []);

  // Selected Glyph Data Details
  const selectedGlyphData = useMemo(() => {
    if (selectedGlyphIndex === null || !activeFont) return null;
    const g = activeFont.font.glyphs.get(selectedGlyphIndex);
    if (!g) return null;

    let unicode: number | null = null;
    if (g.unicode !== undefined && g.unicode !== null && g.unicode > 0) {
      unicode = g.unicode;
    } else if (g.unicodes && g.unicodes.length > 0 && g.unicodes[0] > 0) {
      unicode = g.unicodes[0];
    }

    const hexUnicode = unicode ? `U+${unicode.toString(16).toUpperCase().padStart(4, '0')}` : 'Alternativa / Vetorial';
    const metrics = g.getMetrics();
    const { svgString, dataUrl } = generateGlyphSVG(g, activeFont.font, '#111827');

    return {
      index: selectedGlyphIndex,
      name: g.name || `glyph-${selectedGlyphIndex}`,
      unicode: hexUnicode,
      advanceWidth: g.advanceWidth || 'N/A',
      metrics,
      glyph: g,
      svgString,
      dataUrl,
      isDirectUnicode: unicode !== null
    };
  }, [selectedGlyphIndex, activeFont]);

  // Download glyph as standalone SVG File
  const handleDownloadGlyphSVG = () => {
    if (!selectedGlyphData) return;
    const { svgString, name } = selectedGlyphData;
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${name || 'glifo'}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showNotification(`Arquivo SVG baixado com sucesso!`);
  };

  // Copy SVG markup to clipboard
  const handleCopySVG = () => {
    if (!selectedGlyphData) return;
    navigator.clipboard.writeText(selectedGlyphData.svgString);
    showNotification(`Código SVG copiado para a área de transferência!`);
  };

  return (
    <div className={`flex flex-col h-full rounded-2xl overflow-hidden border transition-colors duration-300 ${
      workspaceTheme === 'dark' 
        ? 'bg-slate-950 border-slate-800 text-slate-100' 
        : 'bg-slate-50 border-slate-200 text-slate-900'
    }`}>
      
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className={`px-4 py-2.5 rounded-xl shadow-xl border flex items-center gap-2.5 text-xs font-bold ${
            notification.type === 'success' 
              ? 'bg-emerald-600 text-white border-emerald-500 shadow-emerald-500/20' 
              : notification.type === 'error'
              ? 'bg-red-600 text-white border-red-500 shadow-red-500/20'
              : 'bg-indigo-600 text-white border-indigo-500 shadow-indigo-500/20'
          }`}>
            <Sparkles className="w-4 h-4" />
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFontUpload} 
        accept=".ttf,.otf,.woff" 
        multiple 
        className="hidden" 
      />

      {/* Upper Navigation & Action Toolbar */}
      <div className={`flex flex-wrap items-center justify-between p-4 gap-4 border-b ${
        workspaceTheme === 'dark' ? 'bg-slate-900/65 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-indigo-200 dark:shadow-none">
            <Type className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-base font-bold leading-tight flex items-center gap-2">
              <span>Editor de Glifos OpenType</span>
              <span className="bg-indigo-100 text-indigo-700 text-[10px] font-extrabold px-2 py-0.5 rounded-full dark:bg-indigo-900/40 dark:text-indigo-300">
                PRO ENGINE
              </span>
            </h2>
            <p className="text-[11px] opacity-60">Visualização de glifos, swashes florais, ligaduras e alternativas em tempo real.</p>
          </div>
        </div>

        {/* Global Toolbar Options */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Panel Visibility Toggles */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-lg gap-1 border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setShowLeftSidebar(!showLeftSidebar)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md flex items-center gap-1 transition-all ${
                showLeftSidebar
                  ? 'bg-white dark:bg-slate-900 shadow-xs text-indigo-600 dark:text-indigo-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
              title={showLeftSidebar ? "Ocultar Catálogo de Glifos" : "Mostrar Catálogo de Glifos"}
            >
              <FileText className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Glifos (Esq.)</span>
            </button>
            <button
              onClick={() => setShowRightSidebar(!showRightSidebar)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md flex items-center gap-1 transition-all ${
                showRightSidebar
                  ? 'bg-white dark:bg-slate-900 shadow-xs text-indigo-600 dark:text-indigo-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
              title={showRightSidebar ? "Ocultar Painel de Recursos" : "Mostrar Painel de Recursos"}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Recursos (Dir.)</span>
            </button>
            <button
              onClick={() => setShowTutorial(!showTutorial)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md flex items-center gap-1 transition-all ${
                showTutorial
                  ? 'bg-white dark:bg-slate-900 shadow-xs text-indigo-600 dark:text-indigo-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
              title={showTutorial ? "Ocultar Guia Rápido" : "Mostrar Guia Rápido"}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Como Usar?</span>
            </button>
          </div>

          {/* Theme switcher */}
          <button
            onClick={() => setWorkspaceTheme(workspaceTheme === 'light' ? 'dark' : 'light')}
            className={`p-2 rounded-lg border transition-all ${
              workspaceTheme === 'dark'
                ? 'bg-slate-800 border-slate-700 text-yellow-400 hover:bg-slate-700'
                : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
            }`}
            title="Alternar modo claro/escuro"
          >
            {workspaceTheme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>

          {/* Close/Return */}
          {onClose && (
            <button
              onClick={onClose}
              className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-all"
            >
              <span>Voltar ao AgendaMaster</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Left Panel (Sidebar - Fonts & Glyphs) + Center (Canvas) + Right (Properties) */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        
        {/* LEFT SIDEBAR: Font Select & Glyph Directory */}
        {showLeftSidebar && (
        <div className={`w-full md:w-64 lg:w-72 flex flex-col border-r shrink-0 overflow-hidden absolute md:relative inset-y-0 left-0 z-30 shadow-2xl md:shadow-none ${
          workspaceTheme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          {/* Active Font / Font Upload Area */}
          <div className={`p-4 border-b ${workspaceTheme === 'dark' ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-indigo-500">
                Fontes Disponíveis ({fonts.length})
              </span>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 hover:underline cursor-pointer"
              >
                <Upload className="w-3 h-3" />
                <span>+ Enviar Fonte</span>
              </button>
            </div>
            
            {/* Horizontal Scroll list of available parsed fonts */}
            <div className="space-y-1.5 max-h-36 overflow-y-auto mb-3 pr-1">
              {fonts.map((f, i) => {
                const isActive = activeFontIndex === i;
                return (
                  <div
                    key={`${f.family}-${i}`}
                    className={`w-full flex items-center justify-between p-2 rounded-lg border text-left text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-500/50 text-indigo-600 dark:text-indigo-400 font-bold shadow-xs'
                        : 'border-transparent hover:bg-slate-100 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <button
                      onClick={() => {
                        setActiveFontIndex(i);
                        setSelectedGlyphIndex(null);
                      }}
                      className="flex-1 text-left min-w-0 pr-2 cursor-pointer"
                    >
                      <p className="truncate">{f.name}</p>
                      <span className="text-[9px] opacity-60 font-mono block">
                        {f.source === 'uploaded' ? 'Fonte Enviada' : 'Padrão Profissional'} • {f.font.glyphs.length} glifos
                      </span>
                    </button>
                    
                    {f.source === 'uploaded' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteFont(i);
                        }}
                        className="p-1 text-slate-400 hover:text-red-500 rounded transition-colors"
                        title="Remover fonte enviada"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Quick Upload Button */}
            <div className="flex gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 py-1.5 px-2.5 rounded-lg border border-dashed border-indigo-400/50 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload TTF/OTF</span>
              </button>
              
              {'queryLocalFonts' in window && (
                <button
                  onClick={handleQueryLocalFonts}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs transition-all"
                  title="Buscar fontes instaladas no seu computador"
                >
                  <Monitor className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Glyph Search and Category Filter Toolbar */}
          <div className="p-3 space-y-2 border-b dark:border-slate-800">
            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Pesquisar glifo (ex: ampersand, A, u+0041)"
                className={`w-full pl-8 pr-3 py-1.5 rounded-lg text-xs border transition-all ${
                  workspaceTheme === 'dark'
                    ? 'bg-slate-950 border-slate-700 text-slate-100 focus:border-indigo-500 focus:outline-none'
                    : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500 focus:outline-none'
                }`}
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>

            {/* Category Select Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className={`w-full p-1.5 rounded-lg text-xs border transition-all cursor-pointer ${
                workspaceTheme === 'dark'
                  ? 'bg-slate-950 border-slate-700 text-slate-100 focus:border-indigo-500 focus:outline-none'
                  : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500 focus:outline-none'
              }`}
            >
              {categories.map(cat => (
                <option key={cat.name} value={cat.name}>{cat.label}</option>
              ))}
            </select>
          </div>

          {/* Glyph Grid Explorer */}
          <div className="flex-1 overflow-y-auto p-3 min-h-0">
            {loadingFont ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <RefreshCw className="w-8 h-8 animate-spin text-indigo-500 mb-3" />
                <p className="text-xs">Lendo arquivo e mapeando glifos...</p>
              </div>
            ) : fontError && fonts.length === 0 ? (
              <div className="p-4 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-xl text-center text-xs border border-red-100 dark:border-red-900/50">
                <p className="font-bold mb-1">Aviso de Fonte</p>
                <p className="opacity-80">{fontError}</p>
              </div>
            ) : filteredGlyphs.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <Info className="w-6 h-6 mx-auto mb-2 text-slate-350" />
                <p className="text-xs">Nenhum glifo corresponde à pesquisa.</p>
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-1.5">
                {paginatedGlyphs.map((item) => {
                  const isSelected = selectedGlyphIndex === item.index;
                  return (
                    <button
                      key={item.index}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        setSelectedGlyphIndex(item.index);
                        insertGlyph(item.glyph);
                      }}
                      onDoubleClick={() => {
                        handleGlyphDoubleClick(item.glyph);
                      }}
                      className={`group p-1.5 rounded-lg border flex flex-col items-center justify-center transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-500 border-indigo-500 text-white shadow-md'
                          : workspaceTheme === 'dark'
                            ? 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-850'
                            : 'bg-slate-50 border-slate-200 text-slate-800 hover:border-indigo-300 hover:bg-indigo-50/20'
                      }`}
                      title={`Clique para aplicar / Duplo clique para enviar ao layout\n${item.name} (${item.unicode ? `U+${item.unicode.toString(16).toUpperCase().padStart(4, '0')}` : 'Alternativa Vetorial'})`}
                    >
                      <GlyphThumbnail glyph={item.glyph} size={28} color={isSelected ? '#ffffff' : (workspaceTheme === 'dark' ? '#cbd5e1' : '#1e293b')} />
                      <span className={`text-[8px] font-mono truncate w-full text-center mt-1 ${
                        isSelected ? 'text-indigo-100' : 'text-slate-400'
                      }`}>
                        {item.unicode ? `U+${item.unicode.toString(16).toUpperCase().padStart(4, '0')}` : `#${item.index}`}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Grid Pagination Footer */}
          {filteredGlyphs.length > glyphsPerPage && (
            <div className={`p-3 border-t flex items-center justify-between text-[11px] ${
              workspaceTheme === 'dark' ? 'border-slate-800' : 'border-slate-100'
            }`}>
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className="px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
              >
                Anterior
              </button>
              <span className="opacity-60 font-mono">
                {currentPage} / {totalPages} ({filteredGlyphs.length} glifos)
              </span>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                className="px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
              >
                Próxima
              </button>
            </div>
          )}
        </div>
        )}

        {/* CENTER STAGE: Typographic Worksheet & Real-time Visualizer */}
        <div className="flex-1 flex flex-col min-w-0 bg-transparent overflow-hidden">
          
          {/* Typographic Controls Toolbar */}
          <div className={`p-3 border-b flex flex-wrap items-center justify-between gap-3 ${
            workspaceTheme === 'dark' ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-100/70 border-slate-200'
          }`}>
            <div className="flex flex-wrap items-center gap-3">
              {/* Font size control */}
              <div className="flex items-center gap-1.5 text-[11px]">
                <span className="font-bold text-slate-500 uppercase tracking-wider">Tamanho</span>
                <input
                  type="range"
                  min="16"
                  max="90"
                  value={fontSize}
                  onChange={(e) => setFontSize(parseInt(e.target.value, 10))}
                  className="w-20 accent-indigo-600 h-1 bg-slate-200 rounded-lg cursor-pointer"
                />
                <span className="font-mono font-bold text-slate-700 dark:text-slate-300 w-8">{fontSize}px</span>
              </div>

              {/* Line height */}
              <div className="flex items-center gap-1.5 text-[11px]">
                <span className="font-bold text-slate-500 uppercase tracking-wider">Altura</span>
                <input
                  type="range"
                  min="1"
                  max="2.5"
                  step="0.1"
                  value={lineHeight}
                  onChange={(e) => setLineHeight(parseFloat(e.target.value))}
                  className="w-16 accent-indigo-600 h-1 bg-slate-200 rounded-lg cursor-pointer"
                />
                <span className="font-mono font-bold text-slate-700 dark:text-slate-300 w-6">{lineHeight}</span>
              </div>

              {/* Letter spacing */}
              <div className="flex items-center gap-1.5 text-[11px]">
                <span className="font-bold text-slate-500 uppercase tracking-wider">Espaçamento</span>
                <input
                  type="range"
                  min="-2"
                  max="10"
                  value={letterSpacing}
                  onChange={(e) => setLetterSpacing(parseInt(e.target.value, 10))}
                  className="w-16 accent-indigo-600 h-1 bg-slate-200 rounded-lg cursor-pointer"
                />
                <span className="font-mono font-bold text-slate-700 dark:text-slate-300 w-9">{letterSpacing}px</span>
              </div>
            </div>

            {/* Quick action buttons */}
            <div className="flex items-center gap-2">
              {onInsertIntoLayout && (
                <button
                  onClick={() => {
                    if (editorText.trim() && activeFont) {
                      onInsertIntoLayout(editorText, activeFont.family);
                      showNotification(`Texto estilizado enviado para a sua página!`);
                    }
                  }}
                  disabled={!editorText.trim() || !activeFont}
                  className="p-1.5 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-100 dark:shadow-none transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                  title="Inserir este texto com fonte estilizada diretamente no Layout da Agenda"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
                  <span>Aplicar no Layout</span>
                </button>
              )}

              <button
                onClick={() => {
                  if (editorRef.current) {
                    editorRef.current.innerText = "";
                    setEditorText("");
                  }
                }}
                className={`p-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  workspaceTheme === 'dark'
                    ? 'border-slate-800 hover:bg-slate-900 text-slate-400 hover:text-red-400'
                    : 'border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-red-500'
                }`}
                title="Limpar texto"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Limpar</span>
              </button>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(editorText);
                  showNotification('Texto copiado!');
                }}
                className={`p-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  workspaceTheme === 'dark'
                    ? 'border-slate-800 hover:bg-slate-900 text-slate-400 hover:text-emerald-400'
                    : 'border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-emerald-600'
                }`}
                title="Copiar texto"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar</span>
              </button>
            </div>
          </div>

          {/* Quick instructions / tutorial guide */}
          {showTutorial && (
            <div className={`mx-6 mt-6 p-4 rounded-xl border relative transition-all animate-in fade-in slide-in-from-top-4 duration-300 ${
              workspaceTheme === 'dark' 
                ? 'bg-slate-900/60 border-indigo-500/25 text-slate-200' 
                : 'bg-indigo-50/40 border-indigo-100 text-slate-800'
            }`}>
              <button 
                onClick={() => setShowTutorial(false)}
                className="absolute top-3 right-3 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 p-1 cursor-pointer"
                title="Fechar guia"
              >
                <X className="w-4 h-4" />
              </button>
              
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-indigo-500 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <h4 className="text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-2">
                    Guia: Como usar o Editor e aplicar glifos artísticos na Agenda
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-xs leading-relaxed">
                    <div>
                      <p className="font-extrabold text-indigo-600 dark:text-indigo-400 mb-0.5">1. Digite seu Texto</p>
                      <p className="opacity-80">Escreva o título, frase ou nome na grande área de edição central.</p>
                    </div>
                    <div>
                      <p className="font-extrabold text-indigo-600 dark:text-indigo-400 mb-0.5">2. Selecione uma Letra</p>
                      <p className="opacity-80">Selecione uma única letra com o mouse para ver as alternativas flutuantes.</p>
                    </div>
                    <div>
                      <p className="font-extrabold text-indigo-600 dark:text-indigo-400 mb-0.5">3. Catálogo de Glifos</p>
                      <p className="opacity-80">Clique no catálogo para aplicar ao texto ou duplo clique para enviar diretamente ao layout!</p>
                    </div>
                    <div>
                      <p className="font-extrabold text-indigo-600 dark:text-indigo-400 mb-0.5">4. Recursos OpenType</p>
                      <p className="opacity-80">Ative swashes, ligaduras ou conjuntos estilísticos (ss01 a ss10) no painel direito.</p>
                    </div>
                    <div>
                      <p className="font-extrabold text-indigo-600 dark:text-indigo-400 mb-0.5">5. Enviar ao Layout</p>
                      <p className="opacity-80">Clique em "Aplicar no Layout" ou "Inserir Glifo HD" para colocar na página!</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TYPOGRAPHIC WORKSHEET AREA: Rich Editable area with font face active */}
          <div 
            className="flex-1 p-8 overflow-y-auto flex flex-col items-center justify-center relative select-text"
          >
            {/* The canvas/container wrapper */}
            <div className="w-full max-w-3xl relative">
              
              {/* Floating Alternates Popover */}
              {alternates.length > 0 && alternatesPosition && (
                <div 
                  className="absolute z-50 bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 shadow-2xl rounded-2xl p-2.5 flex items-center gap-2 animate-in fade-in duration-200 pointer-events-auto alternates-popover"
                  style={{
                    left: `${alternatesPosition.x}px`,
                    top: `${alternatesPosition.y}px`,
                    transform: 'translateX(-50%)'
                  }}
                >
                  <div className="text-[10px] font-black uppercase tracking-wider text-indigo-500 border-r border-slate-200 dark:border-slate-800 pr-2 mr-1">
                    Alternativas
                  </div>
                  <div className="flex items-center gap-1.5 overflow-x-auto max-w-sm">
                    {alternates.map((alt) => (
                      <button
                        key={alt.index}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => insertGlyph(alt)}
                        onDoubleClick={() => handleGlyphDoubleClick(alt)}
                        className="p-1.5 rounded-lg border border-slate-200 hover:border-indigo-500 dark:border-slate-800 dark:hover:border-indigo-500 bg-slate-50 dark:bg-slate-950 flex shrink-0 items-center justify-center transition-all hover:scale-110 cursor-pointer"
                        title={`${alt.name || `glyph-${alt.index}`} (Duplo clique para enviar ao layout)`}
                      >
                        <GlyphThumbnail glyph={alt} size={24} color={workspaceTheme === 'dark' ? '#e2e8f0' : '#1e293b'} />
                      </button>
                    ))}
                  </div>
                  <div className="w-1.5 h-1.5 bg-white dark:bg-slate-900 border-b border-r border-slate-200 dark:border-slate-700 absolute -bottom-1 left-1/2 -translate-x-1/2 rotate-45" />
                </div>
              )}

              {/* Interactive rich text editor using contenteditable */}
              <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                onInput={handleEditorInput}
                onSelect={detectAlternatesForSelection}
                onMouseUp={detectAlternatesForSelection}
                onKeyUp={detectAlternatesForSelection}
                className="w-full min-h-[300px] outline-none border-none bg-transparent whitespace-pre-wrap workspace-textarea break-words text-center selection:bg-indigo-500/30 font-sans"
                style={{
                  fontFamily: activeFont ? `"${activeFont.family}", sans-serif` : 'sans-serif',
                  fontSize: `${fontSize}px`,
                  lineHeight: lineHeight,
                  letterSpacing: `${letterSpacing}px`,
                  fontFeatureSettings: computedFontFeatures,
                  color: workspaceTheme === 'dark' ? '#f3f4f6' : '#111827',
                }}
              >
                Elegância & Arte com Tipografia OpenType.
Selecione qualquer letra para ver glifos alternativos!
              </div>
            </div>

            {/* Micro tooltip explaining alternates trigger */}
            <div className={`absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[10px] font-bold shadow-sm border ${
              workspaceTheme === 'dark' 
                ? 'bg-slate-900/90 border-slate-800 text-slate-400' 
                : 'bg-white/90 border-slate-200 text-slate-500'
            }`}>
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>DICA: Selecione qualquer letra no texto acima para ver opções de swashes e florais alternativos!</span>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: OpenType Properties and Details Viewer */}
        {showRightSidebar && (
        <div className={`w-full md:w-64 lg:w-72 flex flex-col border-l shrink-0 overflow-y-auto absolute md:relative inset-y-0 right-0 z-30 shadow-2xl md:shadow-none ${
          workspaceTheme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          {/* Section: OpenType Features Switchboard */}
          <div className="p-4 border-b dark:border-slate-800">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-indigo-500" />
              <span>Recursos OpenType</span>
            </h3>

            <div className="space-y-2 text-xs">
              {[
                { key: 'swsh', label: 'Swashes / Florituras (swsh)', desc: 'Adiciona caudas decorativas e floreios artísticos nas pontas' },
                { key: 'salt', label: 'Alternativas Estilísticas (salt)', desc: 'Substitui glifos padrão por variações estilizadas' },
                { key: 'liga', label: 'Ligaduras Padrão (liga)', desc: 'Combina caracteres como fi, fl, ffi em glifos únicos' },
                { key: 'dlig', label: 'Ligaduras Decorativas (dlig)', desc: 'Ligaduras caligráficas raras para elegância' },
                { key: 'calt', label: 'Alternativas Contextuais (calt)', desc: 'Ajusta glifos dinamicamente baseando-se em letras vizinhas' },
                { key: 'smcp', label: 'Small Caps / Versalete (smcp)', desc: 'Transforma letras minúsculas em maiúsculas reduzidas' },
                { key: 'frac', label: 'Frações Automáticas (frac)', desc: 'Converte 1/2, 3/4 em frações profissionais' },
                { key: 'onum', label: 'Números Antigos (onum)', desc: 'Números tradicionais com alturas dinâmicas' },
                { key: 'tnum', label: 'Números Tabulares (tnum)', desc: 'Números com largura idêntica, ideal para tabelas' },
              ].map(({ key, label, desc }) => {
                const isActive = (features as any)[key];
                return (
                  <button
                    key={key}
                    onClick={() => setFeatures(prev => ({ ...prev, [key]: !isActive }))}
                    className={`w-full flex items-start gap-2.5 p-2 rounded-lg text-left transition-all border cursor-pointer ${
                      isActive 
                        ? 'bg-indigo-500/10 border-indigo-500/30' 
                        : 'border-transparent hover:bg-slate-100 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="mt-0.5 text-indigo-600 dark:text-indigo-400">
                      {isActive ? <CheckSquare className="w-4 h-4 shrink-0" /> : <Square className="w-4 h-4 shrink-0 text-slate-300 dark:text-slate-700" />}
                    </div>
                    <div>
                      <p className="font-bold text-[11px] leading-tight">{label}</p>
                      <p className="text-[9px] opacity-60 leading-normal mt-0.5">{desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Stylistic Sets Switchbox (ss01 - ss10) */}
          <div className="p-4 border-b dark:border-slate-800">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <span>Conjuntos Estilísticos</span>
            </h3>
            
            <div className="grid grid-cols-2 gap-2 text-xs">
              {Object.keys(stylisticSets).map((set) => {
                const isActive = stylisticSets[set];
                return (
                  <button
                    key={set}
                    onClick={() => setStylisticSets(prev => ({ ...prev, [set]: !isActive }))}
                    className={`flex items-center gap-1.5 p-1.5 rounded-lg border text-xs font-semibold uppercase transition-all cursor-pointer ${
                      isActive
                        ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-600 dark:text-indigo-400'
                        : 'border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700 bg-slate-50 dark:bg-slate-950/40 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {isActive ? <CheckSquare className="w-3.5 h-3.5 shrink-0" /> : <Square className="w-3.5 h-3.5 shrink-0" />}
                    <span className="font-mono">{set}</span>
                  </button>
                );
              })}
            </div>
            <p className="text-[9px] opacity-50 mt-2">Ative variações estilísticas organizadas da fonte atual.</p>
          </div>

          {/* Selected Glyph Inspector Detail View */}
          <div className="p-4 flex-1">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-indigo-500" />
              <span>Metadados do Glifo</span>
            </h3>

            {selectedGlyphData ? (
              <div className="space-y-4">
                {/* Visualizer Frame */}
                <div className={`aspect-square rounded-2xl border flex items-center justify-center p-6 relative group overflow-hidden ${
                  workspaceTheme === 'dark' ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="scale-125 transition-transform duration-300 group-hover:scale-150">
                    <GlyphThumbnail 
                      glyph={selectedGlyphData.glyph} 
                      size={96} 
                      color={workspaceTheme === 'dark' ? '#f8fafc' : '#0f172a'} 
                    />
                  </div>
                  <div className="absolute top-2 right-2 flex items-center gap-1 text-[8px] font-mono opacity-40">
                    <span>Index: {selectedGlyphData.index}</span>
                  </div>
                </div>

                {/* Metadata details list */}
                <div className={`p-3 rounded-xl space-y-2 text-[11px] font-semibold border ${
                  workspaceTheme === 'dark' ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-50 border-slate-100'
                }`}>
                  <div className="flex justify-between border-b dark:border-slate-800 pb-1.5">
                    <span className="text-slate-400">Nome:</span>
                    <span className="font-mono text-indigo-500 truncate max-w-[140px]" title={selectedGlyphData.name}>
                      {selectedGlyphData.name}
                    </span>
                  </div>
                  <div className="flex justify-between border-b dark:border-slate-800 pb-1.5">
                    <span className="text-slate-400">Unicode:</span>
                    <span className="font-mono text-slate-500">{selectedGlyphData.unicode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Avanço:</span>
                    <span className="font-mono text-slate-500">{selectedGlyphData.advanceWidth} UEm</span>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="space-y-2">
                  {onInsertVectorGlyph && (
                    <button
                      onClick={() => {
                        onInsertVectorGlyph(selectedGlyphData.dataUrl, selectedGlyphData.name);
                        showNotification(`Glifo vetorial inserido no layout da página!`);
                      }}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-200 dark:shadow-none transition-all cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 text-indigo-200" />
                      <span>Inserir Glifo no Layout (Vetor HD)</span>
                    </button>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => insertGlyph(selectedGlyphData.glyph)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      <span>No Texto</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={handleCopySVG}
                      className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-all cursor-pointer"
                      title="Copiar código SVG"
                    >
                      <Copy className="w-4 h-4" />
                    </button>

                    <button
                      onClick={handleDownloadGlyphSVG}
                      className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-all cursor-pointer"
                      title="Baixar Glifo como arquivo SVG"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className={`p-6 text-center border border-dashed rounded-2xl flex flex-col items-center justify-center text-slate-400 ${
                workspaceTheme === 'dark' ? 'border-slate-800' : 'border-slate-250'
              }`}>
                <Info className="w-6 h-6 mb-2 text-slate-350" />
                <p className="text-xs">Selecione qualquer glifo no catálogo para ver metadados ou enviar como vetor para a página.</p>
              </div>
            )}
          </div>
        </div>
        )}

      </div>

      {/* Modal: System Local Fonts Explorer */}
      {showSystemFontsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className={`w-full max-w-lg max-h-[80vh] flex flex-col rounded-2xl shadow-2xl border ${
            workspaceTheme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <div className="p-4 border-b dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Monitor className="w-5 h-5 text-indigo-500" />
                <div>
                  <h3 className="font-bold text-sm">Fontes Instaladas no Computador</h3>
                  <p className="text-[10px] opacity-60">Selecione uma fonte do PC para inspecionar seus glifos OpenType</p>
                </div>
              </div>
              <button 
                onClick={() => setShowSystemFontsModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 border-b dark:border-slate-800">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Pesquisar fonte no seu computador..."
                  value={systemFontSearch}
                  onChange={(e) => setSystemFontSearch(e.target.value)}
                  className={`w-full pl-9 pr-3 py-1.5 rounded-lg text-xs outline-none border ${
                    workspaceTheme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                />
              </div>
            </div>

            <div className="p-3 overflow-y-auto flex-1 space-y-1 max-h-[50vh]">
              {systemFontsList
                .filter(f => {
                  const search = systemFontSearch.toLowerCase();
                  return (f.family && f.family.toLowerCase().includes(search)) ||
                         (f.fullName && f.fullName.toLowerCase().includes(search));
                })
                .slice(0, 100)
                .map((f, idx) => (
                  <button
                    key={`${f.family}-${f.fullName}-${idx}`}
                    onClick={() => handleSelectSystemFont(f)}
                    className={`w-full text-left p-2.5 rounded-xl border text-xs flex items-center justify-between transition-all cursor-pointer ${
                      workspaceTheme === 'dark' 
                        ? 'border-slate-800 hover:border-indigo-500 hover:bg-slate-800/80 text-slate-200' 
                        : 'border-slate-100 hover:border-indigo-500 hover:bg-indigo-50/50 text-slate-700'
                    }`}
                  >
                    <div>
                      <p className="font-bold">{f.fullName || f.family}</p>
                      <span className="text-[10px] opacity-60 font-mono">Família: {f.family} • Estilo: {f.style || 'Regular'}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>
                ))}
            </div>

            <div className="p-3 border-t dark:border-slate-800 text-center">
              <p className="text-[10px] opacity-50">Clique em qualquer fonte para carregar todos os glifos no editor OpenType.</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
