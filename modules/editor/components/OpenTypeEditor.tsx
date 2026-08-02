import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as opentype from 'opentype.js';
import { 
  Upload, Search, Type, Sliders, ChevronRight, Settings, 
  HelpCircle, Eye, EyeOff, Sparkles, RefreshCw, ZoomIn, 
  ZoomOut, Copy, Download, Trash2, ArrowRight, Check, CheckSquare, Square,
  Moon, Sun, Info, Play, Palette, FileText, X, Monitor
} from 'lucide-react';

interface OpenTypeEditorProps {
  user: { name: string; email: string };
  onClose?: () => void;
  onRegisterFont?: (fontFamily: string) => void;
  onInsertIntoLayout?: (text: string, fontFamily: string) => void;
}

interface StoredFont {
  name: string;
  family: string;
  source: 'local' | 'uploaded' | 'preset';
  font: opentype.Font;
  buffer: ArrayBuffer;
  objectUrl?: string;
}

interface GlyphCategory {
  name: string;
  label: string;
}

// IndexedDB Persistence for uploaded fonts
const DB_NAME = 'OpenTypeFontsDB';
const DB_VERSION = 1;
const STORE_NAME = 'fonts';

interface SavedFontRecord {
  id: string;
  name: string;
  family: string;
  buffer: ArrayBuffer;
  uploadedAt: number;
}

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported on this platform.'));
      return;
    }
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
};

const saveFontToDB = async (record: SavedFontRecord): Promise<void> => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.put(record);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (e) {
    console.error('Failed to save font to IndexedDB:', e);
  }
};

const getFontsFromDB = async (): Promise<SavedFontRecord[]> => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  } catch (e) {
    console.error('Failed to get fonts from IndexedDB:', e);
    return [];
  }
};

const deleteFontFromDB = async (id: string): Promise<void> => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (e) {
    console.error('Failed to delete font from IndexedDB:', e);
  }
};

export const OpenTypeEditor: React.FC<OpenTypeEditorProps> = ({ user, onClose, onRegisterFont, onInsertIntoLayout }) => {
  // Theme state
  const [workspaceTheme, setWorkspaceTheme] = useState<'light' | 'dark'>('light');

  // Sidebar Visibility - collapse on screens under 1280px by default to avoid crowding
  const [showLeftSidebar, setShowLeftSidebar] = useState<boolean>(() => {
    return typeof window !== 'undefined' ? window.innerWidth >= 1280 : true;
  });
  const [showRightSidebar, setShowRightSidebar] = useState<boolean>(() => {
    return typeof window !== 'undefined' ? window.innerWidth >= 1280 : true;
  });
  const [showTutorial, setShowTutorial] = useState<boolean>(true);

  // Auto-collapse sidebars on small screens when mounting
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 1280) {
      setShowLeftSidebar(false);
      setShowRightSidebar(false);
    }
  }, []);

  // System local fonts modal state
  const [showSystemFontsModal, setShowSystemFontsModal] = useState<boolean>(false);
  const [systemFontsList, setSystemFontsList] = useState<any[]>([]);
  const [systemFontSearch, setSystemFontSearch] = useState<string>('');

  // Font states
  const [fonts, setFonts] = useState<StoredFont[]>([]);
  const [activeFontIndex, setActiveFontIndex] = useState<number>(-1);
  const [loadingFont, setLoadingFont] = useState<boolean>(false);
  const [fontError, setFontError] = useState<string | null>(null);

  // Editor configuration
  const [editorText, setEditorText] = useState<string>(
    "Elegância & Sofisticação em Tipografia OpenType.\nSelecione qualquer letra para ver glifos alternativos!"
  );
  const [fontSize, setFontSize] = useState<number>(30);
  const [lineHeight, setLineHeight] = useState<number>(1.4);
  const [letterSpacing, setLetterSpacing] = useState<number>(0);
  const [editorBgColor, setEditorBgColor] = useState<string>('#ffffff');
  const [editorTextColor, setEditorTextColor] = useState<string>('#111827');

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
  const glyphsPerPage = 120; // Paginate for ultra performance

  // Detail View of Sidebar
  const [selectedGlyphIndex, setSelectedGlyphIndex] = useState<number | null>(null);

  // Floating Alternates state
  const [alternates, setAlternates] = useState<opentype.Glyph[]>([]);
  const [alternatesPosition, setAlternatesPosition] = useState<{ x: number; y: number } | null>(null);
  const [selectedCharRange, setSelectedCharRange] = useState<{ start: number; end: number; text: string } | null>(null);

  const editorRef = useRef<HTMLDivElement>(null);
  const lastClickRef = useRef<{ time: number; index: number | null }>({ time: 0, index: null });

  const activeFont = useMemo(() => {
    if (activeFontIndex >= 0 && activeFontIndex < fonts.length) {
      return fonts[activeFontIndex];
    }
    return null;
  }, [fonts, activeFontIndex]);

  // Load Preset and Saved Fonts on Mount
  useEffect(() => {
    const loadPresetAndSavedFonts = async () => {
      setLoadingFont(true);
      setFontError(null);
      
      const presets = [
        {
          name: 'Playfair Display Variable',
          family: 'Playfair Display',
          url: '/fonts/playfair.woff'
        },
        {
          name: 'Cinzel Decorative Bold',
          family: 'Cinzel Decorative',
          url: '/fonts/cinzel.woff'
        },
        {
          name: 'Fira Code Regular',
          family: 'Fira Code',
          url: '/fonts/firacode.woff'
        }
      ];

      const loaded: StoredFont[] = [];

      // 1. Load Presets
      for (const preset of presets) {
        try {
          const res = await fetch(preset.url);
          if (!res.ok) throw new Error(`Failed to load local font: ${res.statusText}`);
          
          const buffer = await res.arrayBuffer();
          const parsedFont = opentype.parse(buffer);
          
          // Inject FontFace dynamically to render in rich text area
          const fontFamilyId = `preset-${preset.family.replace(/\s+/g, '-')}`;
          const fontFace = new FontFace(fontFamilyId, buffer);
          await fontFace.load();
          document.fonts.add(fontFace);

          loaded.push({
            name: preset.name,
            family: fontFamilyId,
            source: 'preset',
            font: parsedFont,
            buffer,
          });
        } catch (e) {
          console.warn("Nao foi possivel carregar a fonte de preset: ", preset.name, e);
        }
      }

      // 2. Load Custom Saved Fonts from IndexedDB
      try {
        const savedRecords = await getFontsFromDB();
        for (const record of savedRecords) {
          try {
            const parsedFont = opentype.parse(record.buffer);
            const fontFace = new FontFace(record.family, record.buffer);
            await fontFace.load();
            document.fonts.add(fontFace);

            loaded.push({
              name: record.name,
              family: record.family,
              source: 'uploaded',
              font: parsedFont,
              buffer: record.buffer,
            });

            if (onRegisterFont) {
              onRegisterFont(record.family);
            }
          } catch (recordErr) {
            console.warn("Failed to load saved font from IndexedDB:", record.name, recordErr);
            await deleteFontFromDB(record.id);
          }
        }
      } catch (dbErr) {
        console.warn("Failed to load custom fonts from IndexedDB:", dbErr);
      }

      if (loaded.length > 0) {
        setFonts(loaded);
        // Default to the first uploaded font if available, else first preset
        const firstUploadedIndex = loaded.findIndex(f => f.source === 'uploaded');
        setActiveFontIndex(firstUploadedIndex >= 0 ? firstUploadedIndex : 0);
      } else {
        setFontError("Nenhum preset carregado. Faça upload de sua própria fonte OTF ou TTF!");
      }
      setLoadingFont(false);
    };

    loadPresetAndSavedFonts();
  }, [onRegisterFont]);

  // Handle Font File Upload
  const handleFontUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoadingFont(true);
    setFontError(null);

    try {
      const buffer = await file.arrayBuffer();
      const parsedFont = opentype.parse(buffer);

      // Create a unique font family name
      const cleanFileName = file.name.replace(/\.[^/.]+$/, "").replace(/\s+/g, '-');
      const fontFamilyId = `uploaded-${cleanFileName}-${Date.now()}`;
      
      // Load into browser document fonts
      const fontFace = new FontFace(fontFamilyId, buffer);
      await fontFace.load();
      document.fonts.add(fontFace);

      // Save to IndexedDB for persistent caching
      const fontId = `id-${fontFamilyId}`;
      await saveFontToDB({
        id: fontId,
        name: file.name,
        family: fontFamilyId,
        buffer,
        uploadedAt: Date.now()
      });

      const newFont: StoredFont = {
        name: file.name,
        family: fontFamilyId,
        source: 'uploaded',
        font: parsedFont,
        buffer,
      };

      setFonts(prev => [newFont, ...prev]);
      setActiveFontIndex(0);
      setCurrentPage(1);
      if (onRegisterFont) {
        onRegisterFont(fontFamilyId);
      }
    } catch (err: any) {
      console.error(err);
      setFontError(`Erro ao processar fonte: ${err.message || 'Formato inválido'}`);
    } finally {
      setLoadingFont(false);
    }
  };

  // Open System Local Fonts Modal
  const handleOpenSystemFontsModal = async () => {
    if (!('queryLocalFonts' in window)) {
      alert(
        "⚠️ Leitura automática de fontes locais não suportada neste navegador.\n\n" +
        "Para extrair os glifos de uma fonte do seu PC, clique no botão 'Enviar .OTF/.TTF' e selecione o arquivo da fonte (na pasta C:\\Windows\\Fonts no Windows ou Font Book no Mac)!"
      );
      return;
    }
    setLoadingFont(true);
    try {
      const localFonts = await (window as any).queryLocalFonts();
      if (!localFonts || localFonts.length === 0) {
        alert("Nenhuma fonte encontrada no computador.");
        return;
      }
      setSystemFontsList(localFonts);
      setShowSystemFontsModal(true);
    } catch (err: any) {
      console.error('Erro ao acessar fontes locais:', err);
      if (err.name === 'SecurityError' || err.message?.includes('iframe') || err.message?.includes('frame')) {
        alert(
          "⚠️ Restrição de Privacidade do Navegador (Iframe)!\n\n" +
          "Quando o aplicativo roda dentro do painel do AI Studio, o navegador bloqueia a busca automática de arquivos do disco por privacidade.\n\n" +
          "Como carregar a fonte do seu PC no Editor de Glifos:\n" +
          "1. Clique no botão 'Enviar .OTF/.TTF' e selecione o arquivo da fonte no seu PC (pasta C:\\Windows\\Fonts ou Font Book no Mac).\n" +
          "2. Ou abra o aplicativo em uma nova aba usando o botão de visualização!"
        );
      } else {
        alert("Erro ao buscar fontes do PC: " + err.message);
      }
    } finally {
      setLoadingFont(false);
    }
  };

  // Select System Font and Parse Binary
  const handleSelectSystemFont = async (fontData: any) => {
    setLoadingFont(true);
    setFontError(null);
    try {
      const blob = await fontData.blob();
      const buffer = await blob.arrayBuffer();
      const parsedFont = opentype.parse(buffer);

      const familyName = fontData.family || fontData.fullName;
      const cleanName = familyName.replace(/\s+/g, '-');
      const fontFamilyId = `local-${cleanName}-${Date.now()}`;

      const fontFace = new FontFace(fontFamilyId, buffer);
      await fontFace.load();
      document.fonts.add(fontFace);

      const fontId = `id-${fontFamilyId}`;
      await saveFontToDB({
        id: fontId,
        name: `${familyName} (${fontData.style || 'PC'})`,
        family: fontFamilyId,
        buffer,
        uploadedAt: Date.now()
      });

      const newFont: StoredFont = {
        name: `${familyName} (${fontData.style || 'PC'})`,
        family: fontFamilyId,
        source: 'uploaded',
        font: parsedFont,
        buffer,
      };

      setFonts(prev => [newFont, ...prev]);
      setActiveFontIndex(0);
      setCurrentPage(1);
      if (onRegisterFont) {
        onRegisterFont(fontFamilyId);
      }
      setShowSystemFontsModal(false);
    } catch (err: any) {
      console.error(err);
      setFontError(`Erro ao processar fonte do PC: ${err.message || 'Formato inválido'}`);
    } finally {
      setLoadingFont(false);
    }
  };

  // Delete uploaded font
  const deleteFont = async (family: string, index: number) => {
    try {
      const fontId = `id-${family}`;
      await deleteFontFromDB(fontId);
      
      setFonts(prev => {
        const next = prev.filter((_, i) => i !== index);
        // Adjust active index safely
        if (activeFontIndex === index) {
          setActiveFontIndex(0);
        } else if (activeFontIndex > index) {
          setActiveFontIndex(activeFontIndex - 1);
        }
        return next;
      });
    } catch (e) {
      console.error("Failed to delete font:", e);
    }
  };

  // Extract Glyph Categories
  const glyphsList = useMemo(() => {
    if (!activeFont) return [];
    
    const list: { index: number; glyph: opentype.Glyph; unicode: number | null; name: string; category: string }[] = [];
    const font = activeFont.font;

    for (let i = 0; i < font.glyphs.length; i++) {
      const g = font.glyphs.get(i);
      const unicode = g.unicode !== undefined ? g.unicode : null;
      const name = g.name || `glyph-${i}`;
      
      let category = 'other';
      if (unicode !== null) {
        if (unicode >= 48 && unicode <= 57) category = 'number';
        else if ((unicode >= 65 && unicode <= 90) || (unicode >= 97 && unicode <= 122) || (unicode >= 192 && unicode <= 382)) category = 'letter';
        else if ((unicode >= 33 && unicode <= 47) || (unicode >= 58 && unicode <= 64) || (unicode >= 91 && unicode <= 96) || (unicode >= 123 && unicode <= 126)) category = 'punctuation';
        else if (unicode >= 8704 && unicode <= 8959) category = 'math';
      } else if (name.includes('liga') || name.includes('_') || name.startsWith('f_')) {
        category = 'ligature';
      } else if (name.includes('alt') || name.includes('ss') || name.includes('swsh') || name.includes('init') || name.includes('fina')) {
        category = 'alternate';
      } else if (name.includes('ornament') || name.includes('bullet') || name.includes('star')) {
        category = 'ornament';
      }

      list.push({
        index: i,
        glyph: g,
        unicode,
        name,
        category
      });
    }

    return list;
  }, [activeFont]);

  // Filter & Search Glyphs
  const filteredGlyphs = useMemo(() => {
    return glyphsList.filter(item => {
      // 1. Filter Category
      if (selectedCategory !== 'all') {
        if (item.category !== selectedCategory) return false;
      }

      // 2. Search Query
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const hexUnicode = item.unicode ? `u+${item.unicode.toString(16).padStart(4, '0')}` : '';
        const nameMatch = item.name.toLowerCase().includes(query);
        const indexMatch = String(item.index) === query;
        const unicodeMatch = hexUnicode.includes(query);
        return nameMatch || indexMatch || unicodeMatch;
      }

      return true;
    });
  }, [glyphsList, selectedCategory, searchQuery]);

  // Pagination bounds
  const totalPages = Math.ceil(filteredGlyphs.length / glyphsPerPage) || 1;
  const paginatedGlyphs = useMemo(() => {
    const start = (currentPage - 1) * glyphsPerPage;
    return filteredGlyphs.slice(start, start + glyphsPerPage);
  }, [filteredGlyphs, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery, activeFontIndex]);

  // Draw glyph in sidebar thumbnail canvas
  const drawGlyphOnCanvas = (
    canvas: HTMLCanvasElement | null, 
    glyph: opentype.Glyph, 
    size: number = 32
  ) => {
    if (!canvas || !activeFont) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const font = activeFont.font;
    const fontHeight = (font.ascender - font.descender) || font.unitsPerEm || 1000;
    const maxBoxSize = Math.min(canvas.width, canvas.height) * 0.78;
    const standardScale = maxBoxSize / fontHeight;

    // Get exact glyph bounding box bounds
    const xMin = glyph.xMin !== undefined ? glyph.xMin : 0;
    const xMax = glyph.xMax !== undefined ? glyph.xMax : (glyph.advanceWidth || font.unitsPerEm * 0.6);
    const yMin = glyph.yMin !== undefined ? glyph.yMin : 0;
    const yMax = glyph.yMax !== undefined ? glyph.yMax : 0;

    let glyphWidth = xMax - xMin;
    let glyphHeight = yMax - yMin;

    if (glyphWidth <= 0) glyphWidth = glyph.advanceWidth || font.unitsPerEm * 0.6;
    if (glyphHeight <= 0) glyphHeight = fontHeight * 0.8;

    const scaleX = maxBoxSize / glyphWidth;
    const scaleY = maxBoxSize / glyphHeight;
    
    // Scale to fit nicely inside the grid cell
    let scale = Math.min(scaleX, scaleY);
    
    // Prevent tiny characters (like dots, accents, punctuation) from becoming massive
    const maxScale = standardScale * 1.8;
    if (scale > maxScale) {
      scale = maxScale;
    }

    // Center horizontally: align middle of glyph's width to middle of canvas
    const x = canvas.width / 2 - (xMin + glyphWidth / 2) * scale;

    // Center vertically: if glyph has height, align middle of glyph's ink height to middle of canvas
    let y = canvas.height / 2;
    if (yMax !== 0 || yMin !== 0) {
      y = canvas.height / 2 + ((yMin + yMax) / 2) * scale;
    } else {
      const fontCenter = ((font.ascender || 800) + (font.descender || -200)) / 2;
      y = canvas.height / 2 + fontCenter * scale;
    }

    // Set styling based on Workspace Theme
    ctx.fillStyle = workspaceTheme === 'dark' ? '#f3f4f6' : '#111827';
    
    // In opentype.js, path.draw relies on the fontSize parameter to set the path scale.
    const fontSize = scale * font.unitsPerEm;
    const path = glyph.getPath(x, y, fontSize);
    path.draw(ctx);
  };

  // Helper component for Canvas render
  const GlyphThumbnail: React.FC<{ glyph: opentype.Glyph; size?: number }> = ({ glyph, size = 32 }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
      drawGlyphOnCanvas(canvasRef.current, glyph, size);
    }, [glyph, size, activeFont, workspaceTheme]);

    return (
      <canvas 
        ref={canvasRef} 
        width={48} 
        height={48} 
        className="w-12 h-12 object-contain block transition-transform duration-100 group-hover:scale-110"
      />
    );
  };

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

  // Insert Glyph at cursor position
  const insertGlyph = (glyph: opentype.Glyph) => {
    if (!editorRef.current) return;

    let selection = window.getSelection();
    let range: Range | null = null;

    // Check if there is an active selection range inside the editor
    if (selection && selection.rangeCount > 0) {
      const currentRange = selection.getRangeAt(0);
      if (editorRef.current.contains(currentRange.startContainer)) {
        range = currentRange;
      }
    }

    // If no active range inside the editor, focus the editor and put the cursor at the end
    if (!range) {
      editorRef.current.focus();
      selection = window.getSelection();
      range = document.createRange();
      range.selectNodeContents(editorRef.current);
      range.collapse(false); // Collapse to end of content
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }

    // Safely delete whatever is selected in the range
    try {
      range.deleteContents();
    } catch (e) {
      console.warn("Failed to delete contents inside selection:", e);
    }

    if (glyph.unicode !== undefined && glyph.unicode !== null) {
      // Native unicode character insertion (using fromCodePoint to support all unicode planes!)
      const textNode = document.createTextNode(String.fromCodePoint(glyph.unicode));
      range.insertNode(textNode);
      range.setStartAfter(textNode);
      range.collapse(true);
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(range);
      }
    } else {
      // Alternate Glyph or Ornament with no direct Unicode.
      // Render as premium scalable inline SVG to maintain absolute fidelity!
      const unitsPerEm = activeFont ? activeFont.font.unitsPerEm : 1000;
      const advanceWidth = glyph.advanceWidth || unitsPerEm * 0.6;
      const ascender = activeFont ? activeFont.font.ascender : 800;
      const descender = activeFont ? activeFont.font.descender : -200;
      
      const widthEm = advanceWidth / unitsPerEm;
      
      const svgContainer = document.createElement('span');
      svgContainer.className = "inline-block align-baseline select-none select-all mx-[0.05em]";
      svgContainer.setAttribute('data-glyph-index', String(glyph.index));
      svgContainer.setAttribute('contenteditable', 'false');
      svgContainer.style.width = `${widthEm}em`;
      svgContainer.style.height = `1em`;
      svgContainer.style.verticalAlign = `middle`;
      svgContainer.style.transform = `translateY(${descender / unitsPerEm * 0.2}em)`;

      // Draw SVG interior
      svgContainer.innerHTML = `
        <svg viewBox="0 0 ${advanceWidth} ${ascender - descender}" class="w-full h-full block" fill="currentColor">
          <g transform="scale(1, -1) translate(0, -${ascender})">
            ${glyph.getPath(0, 0, unitsPerEm).toSVG(2)}
          </g>
        </svg>
      `;

      range.insertNode(svgContainer);
      
      // Append zero-width space (\u200B) text node right after contenteditable="false" container
      // to keep the browser selection/caret inside a healthy text block.
      const zwsp = document.createTextNode('\u200B');
      range.setStartAfter(svgContainer);
      range.insertNode(zwsp);
      range.setStartAfter(zwsp);
      range.collapse(true);
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }

    // Trigger update of editor state
    handleEditorInput();
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
    const selectedText = range.toString();

    // Only process a single letter/character selection for alternates
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
                // Type 3 Alternate Subtitution Table mapping
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
                }
                // Type 1 Single Substitution Table mapping
                else if (subtable.substitute && subtable.substitute[idxInCoverage]) {
                  const altIdx = subtable.substitute[idxInCoverage];
                  if (!addedIndices.has(altIdx)) {
                    const g = font.glyphs.get(altIdx);
                    if (g) {
                      foundAlts.push(g);
                      addedIndices.add(altIdx);
                    }
                  }
                }
                // Delta Substitution formatting
                else if (subtable.deltaGlyphId) {
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
      // Calculate floating position above selection
      const rect = range.getBoundingClientRect();
      const parentRect = editorRef.current.getBoundingClientRect();
      
      setAlternates(foundAlts);
      setAlternatesPosition({
        x: rect.left - parentRect.left + (rect.width / 2),
        y: rect.top - parentRect.top - 70 // Floating 70px above character
      });

      // Save range details for insertion
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

  // Replace selection with chosen alternate glyph
  const applyAlternate = (alternate: opentype.Glyph) => {
    const selection = window.getSelection();
    if (!selection || !selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    range.deleteContents();

    if (alternate.unicode !== undefined && alternate.unicode !== null) {
      const textNode = document.createTextNode(String.fromCharCode(alternate.unicode));
      range.insertNode(textNode);
      range.setStartAfter(textNode);
    } else {
      // Alternates without unicodes render as precise embedded inline SVGs
      const unitsPerEm = activeFont ? activeFont.font.unitsPerEm : 1000;
      const advanceWidth = alternate.advanceWidth || unitsPerEm * 0.6;
      const ascender = activeFont ? activeFont.font.ascender : 800;
      const descender = activeFont ? activeFont.font.descender : -200;
      const widthEm = advanceWidth / unitsPerEm;

      const svgContainer = document.createElement('span');
      svgContainer.className = "inline-block align-baseline select-none mx-[0.05em]";
      svgContainer.setAttribute('data-glyph-index', String(alternate.index));
      svgContainer.setAttribute('contenteditable', 'false');
      svgContainer.style.width = `${widthEm}em`;
      svgContainer.style.height = `1em`;
      svgContainer.style.verticalAlign = `middle`;
      svgContainer.style.transform = `translateY(${descender / unitsPerEm * 0.2}em)`;

      svgContainer.innerHTML = `
        <svg viewBox="0 0 ${advanceWidth} ${ascender - descender}" class="w-full h-full block" fill="currentColor">
          <g transform="scale(1, -1) translate(0, -${ascender})">
            ${alternate.getPath(0, 0, unitsPerEm).toSVG(2)}
          </g>
        </svg>
      `;

      range.insertNode(svgContainer);
      range.setStartAfter(svgContainer);
    }

    // Clear state
    setAlternates([]);
    setAlternatesPosition(null);
    setSelectedCharRange(null);

    // Trigger input synchronization
    handleEditorInput();
  };

  // Keyboard navigation & closing floating popover
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      // If click outside selection popover, close it
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

  // Set preset font active index
  const selectFont = (index: number) => {
    setActiveFontIndex(index);
    setSelectedGlyphIndex(null);
  };

  // Helper categories definitions
  const categories: GlyphCategory[] = [
    { name: 'all', label: 'Todos os Glifos' },
    { name: 'letter', label: 'Letras / Alfabeto' },
    { name: 'number', label: 'Algarismos' },
    { name: 'punctuation', label: 'Pontuação' },
    { name: 'math', label: 'Símbolos Matemáticos' },
    { name: 'ligature', label: 'Ligaduras (liga/dlig)' },
    { name: 'alternate', label: 'Alternativas (salt/swsh)' },
    { name: 'ornament', label: 'Ornamentos / Ícones' },
    { name: 'other', label: 'Outros' },
  ];

  // Selected Glyph Details
  const selectedGlyphData = useMemo(() => {
    if (selectedGlyphIndex === null || !activeFont) return null;
    const g = activeFont.font.glyphs.get(selectedGlyphIndex);
    const unicode = g.unicode !== undefined ? g.unicode : null;
    const hexUnicode = unicode ? `U+${unicode.toString(16).toUpperCase().padStart(4, '0')}` : 'N/A (Ligadura/Alternativa)';
    return {
      index: selectedGlyphIndex,
      name: g.name || `glyph-${selectedGlyphIndex}`,
      unicode: hexUnicode,
      advanceWidth: g.advanceWidth || 'N/A',
      metrics: g.getMetrics(),
      glyph: g
    };
  }, [selectedGlyphIndex, activeFont]);

  // Download glyph as standalone SVG File
  const handleDownloadGlyphSVG = () => {
    if (!selectedGlyphData || !activeFont) return;
    const { glyph, name } = selectedGlyphData;
    
    const font = activeFont.font;
    const unitsPerEm = font.unitsPerEm;
    const advanceWidth = glyph.advanceWidth || unitsPerEm * 0.6;
    const ascender = font.ascender;
    const descender = font.descender;
    const pathData = glyph.getPath(0, ascender, unitsPerEm).toSVG(2);

    const svgString = `<?xml version="1.0" encoding="utf-8"?>
<svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${advanceWidth} ${ascender - descender}" width="${advanceWidth}" height="${ascender - descender}">
  <g transform="scale(1, -1) translate(0, -${ascender})">
    ${glyph.getPath(0, 0, unitsPerEm).toSVG(2)}
  </g>
</svg>`;

    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${name || 'glifo'}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Drag-and-drop handles for glyph insertion into editor
  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', `__glyph_idx:${index}`);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const data = e.dataTransfer.getData('text/plain');
    if (data && data.startsWith('__glyph_idx:') && activeFont) {
      const idx = parseInt(data.split(':')[1], 10);
      const glyph = activeFont.font.glyphs.get(idx);
      if (glyph) {
        insertGlyph(glyph);
      }
    }
  };

  return (
    <div className={`flex flex-col h-full rounded-2xl overflow-hidden border transition-colors duration-300 ${
      workspaceTheme === 'dark' 
        ? 'bg-slate-950 border-slate-800 text-slate-100' 
        : 'bg-slate-50 border-slate-200 text-slate-900'
    }`}>
      
      {/* Upper Navigation & Action Toolbar */}
      <div className={`flex flex-wrap items-center justify-between p-4 gap-4 border-b ${
        workspaceTheme === 'dark' ? 'bg-slate-900/65 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-indigo-100">
            <Type className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-base font-bold leading-tight flex items-center gap-2">
              <span>Editor de Glifos OpenType</span>
              <span className="bg-indigo-100 text-indigo-700 text-[10px] font-extrabold px-2 py-0.5 rounded-full dark:bg-indigo-900/40 dark:text-indigo-300">
                PRO ENGINE
              </span>
            </h2>
            <p className="text-[11px] opacity-60">Visualização de glifos, ligaduras e alternativas estilísticas em tempo real.</p>
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
              title={showLeftSidebar ? "Ocultar Catálogo de Glifos (Esquerda)" : "Mostrar Catálogo de Glifos (Esquerda)"}
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
              title={showRightSidebar ? "Ocultar Painel de Recursos (Direita)" : "Mostrar Painel de Recursos (Direita)"}
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
            title="Alterar tema"
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
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-indigo-500 block mb-2">
              Fontes Ativas ({fonts.length})
            </span>
            
            {/* Horizontal Scroll list of available parsed fonts */}
            <div className="space-y-1.5 max-h-36 overflow-y-auto mb-3 pr-1">
              {fonts.map((f, i) => {
                const isActive = activeFontIndex === i;
                return (
                  <div
                    key={f.family}
                    className={`w-full flex items-center justify-between p-2 rounded-lg border text-left text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-indigo-50/55 dark:bg-indigo-950/20 border-indigo-500/30 text-indigo-600 dark:text-indigo-400'
                        : 'border-transparent hover:bg-slate-100 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <button
                      onClick={() => selectFont(i)}
                      className="flex-1 text-left min-w-0 pr-2 cursor-pointer"
                    >
                      <p className="font-bold truncate">{f.name}</p>
                      <span className="text-[9px] opacity-60 font-mono block">Origem: {f.source === 'uploaded' ? 'Enviada' : 'Padrão'}</span>
                    </button>
                    
                    <div className="flex items-center gap-1 shrink-0">
                      {f.source === 'uploaded' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteFont(f.family, i);
                          }}
                          className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded transition-colors cursor-pointer"
                          title="Remover fonte"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {isActive && <Check className="w-3.5 h-3.5 text-indigo-500 shrink-0" />}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Custom File Upload & System Font Load Inputs */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleOpenSystemFontsModal}
                className={`flex flex-col items-center justify-center p-2 rounded-xl border border-dashed transition-all cursor-pointer ${
                  workspaceTheme === 'dark'
                    ? 'border-slate-700 hover:border-indigo-500 hover:bg-slate-800'
                    : 'border-slate-300 hover:border-indigo-500 hover:bg-indigo-50/30'
                }`}
                title="Puxar fontes instaladas no seu computador"
              >
                <Monitor className="w-4 h-4 text-indigo-500 mb-1" />
                <span className="text-[10px] font-bold text-center leading-tight">Puxar do PC</span>
              </button>

              <label className={`flex flex-col items-center justify-center p-2 rounded-xl border border-dashed cursor-pointer transition-all ${
                workspaceTheme === 'dark' 
                  ? 'border-slate-700 hover:border-indigo-500 hover:bg-slate-800' 
                  : 'border-slate-300 hover:border-indigo-500 hover:bg-indigo-50/30'
              }`}>
                <Upload className="w-4 h-4 text-indigo-500 mb-1 shrink-0" />
                <span className="text-[10px] font-bold text-center leading-tight">Enviar .OTF/.TTF</span>
                <input 
                  type="file" 
                  accept=".ttf,.otf" 
                  onChange={handleFontUpload} 
                  className="hidden" 
                />
              </label>
            </div>
          </div>

          {/* Search and Category Filtering */}
          <div className="p-3 space-y-2 border-b dark:border-slate-800">
            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Pesquisar glifo (ex: ampersand, u+0041)"
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
            ) : (fontError && fonts.length === 0) ? (
              <div className="p-4 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-xl text-center text-xs border border-red-100 dark:border-red-900/50">
                <p className="font-bold mb-1">Erro de Carregamento</p>
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
                      draggable
                      onDragStart={(e) => handleDragStart(e, item.index)}
                      className={`group p-1.5 rounded-lg border flex flex-col items-center justify-center transition-all ${
                        isSelected
                          ? 'bg-indigo-500 border-indigo-500 text-white shadow-md'
                          : workspaceTheme === 'dark'
                            ? 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-850'
                            : 'bg-slate-50 border-slate-200 text-slate-800 hover:border-indigo-300 hover:bg-indigo-50/10'
                      }`}
                      title={`${item.name} (${item.unicode ? `U+${item.unicode.toString(16).toUpperCase().padStart(4, '0')}` : 'Alternativa'})`}
                    >
                      <GlyphThumbnail glyph={item.glyph} size={28} />
                      <span className={`text-[8px] font-mono truncate w-full text-center mt-1 ${
                        isSelected ? 'text-indigo-100' : 'text-slate-500'
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
              <span className="font-semibold text-slate-500">
                {currentPage} / {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                className="px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
              >
                Próxima
              </button>
            </div>
          )}
        </div>
        )}

        {/* MIDDLE SECTION: Interactive Text Editor workspace with real-time typography styling */}
        <div className="flex-1 flex flex-col min-w-0 bg-transparent relative">
          
          {/* Editor Header controls: Size, spacing, colors */}
          <div className={`py-2 px-4 border-b flex flex-col md:flex-row md:items-center md:justify-between gap-3 ${
            workspaceTheme === 'dark' ? 'bg-slate-950/35 border-slate-800' : 'bg-slate-50/80 border-slate-200'
          }`}>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
              {/* Font Size slider */}
              <div className="flex items-center gap-1.5 text-[11px]">
                <span className="font-bold text-slate-500 uppercase tracking-wider">Tamanho</span>
                <input
                  type="range"
                  min="16"
                  max="120"
                  value={fontSize}
                  onChange={(e) => setFontSize(parseInt(e.target.value, 10))}
                  className="w-20 sm:w-24 accent-indigo-600 h-1 bg-slate-200 rounded-lg cursor-pointer"
                />
                <span className="font-mono font-bold text-slate-700 dark:text-slate-300 w-8">{fontSize}px</span>
              </div>

              {/* Line height slider */}
              <div className="flex items-center gap-1.5 text-[11px]">
                <span className="font-bold text-slate-500 uppercase tracking-wider">Altura Linha</span>
                <input
                  type="range"
                  min="1"
                  max="2.5"
                  step="0.1"
                  value={lineHeight}
                  onChange={(e) => setLineHeight(parseFloat(e.target.value))}
                  className="w-16 sm:w-20 accent-indigo-600 h-1 bg-slate-200 rounded-lg cursor-pointer"
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
                  className="w-16 sm:w-20 accent-indigo-600 h-1 bg-slate-200 rounded-lg cursor-pointer"
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
                    }
                  }}
                  disabled={!editorText.trim() || !activeFont}
                  className="p-1.5 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-100 dark:shadow-none transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                  title="Inserir este texto com fonte estilizada diretamente no Layout da Agenda"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-200 animate-pulse" />
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
                className={`p-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all ${
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
                }}
                className={`p-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  workspaceTheme === 'dark'
                    ? 'border-slate-800 hover:bg-slate-900 text-slate-400 hover:text-emerald-400'
                    : 'border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-emerald-600'
                }`}
                title="Copiar texto simples"
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
                className="absolute top-3 right-3 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 p-1"
                title="Fechar guia"
              >
                <X className="w-4 h-4" />
              </button>
              
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-indigo-500 mt-0.5 shrink-0 animate-pulse" />
                <div className="flex-1">
                  <h4 className="text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-2">
                    Guia de Uso: Como usar o Editor e aplicar glifos artísticos
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-xs leading-relaxed">
                    <div>
                      <p className="font-extrabold text-indigo-655 dark:text-indigo-400 mb-0.5">1. Digite o seu Texto</p>
                      <p className="opacity-80">Escreva, apague ou cole qualquer frase na grande área de edição central.</p>
                    </div>
                    <div>
                      <p className="font-extrabold text-indigo-655 dark:text-indigo-400 mb-0.5">2. Selecione uma Letra</p>
                      <p className="opacity-80">Selecione uma única letra com o mouse para abrir as alternativas artísticas.</p>
                    </div>
                    <div>
                      <p className="font-extrabold text-indigo-655 dark:text-indigo-400 mb-0.5">3. Catálogo de Glifos</p>
                      <p className="opacity-80">Clique em qualquer caractere do catálogo esquerdo para adicioná-lo na hora.</p>
                    </div>
                    <div>
                      <p className="font-extrabold text-indigo-655 dark:text-indigo-400 mb-0.5">4. Ative Recursos</p>
                      <p className="opacity-80">Marque as ligaduras ou conjuntos estilísticos (ss01 a ss10) na direita.</p>
                    </div>
                    <div>
                      <p className="font-extrabold text-indigo-655 dark:text-indigo-400 mb-0.5">5. Aplicar no Layout</p>
                      <p className="opacity-80">Clique no banner ou no botão "Aplicar no Layout" para enviar sua arte à Agenda!</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TYPOGRAPHIC WORKSHEET AREA: Rich Editable area with font face active */}
          <div 
            className="flex-1 p-8 overflow-y-auto flex flex-col items-center justify-center relative select-text"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
          >
            {onInsertIntoLayout && (
              <div className="mb-6 w-full max-w-2xl bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shrink-0 shadow-sm animate-bounce">
                    <Sparkles className="w-4 h-4 text-indigo-250" />
                  </div>
                  <div>
                    <p className="font-bold text-indigo-600 dark:text-indigo-400">Pronto para aplicar sua arte na Agenda?</p>
                    <p className="opacity-75 text-[11px]">Insira o texto e clique no botão para criar uma caixa estilizada no seu layout.</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (editorText.trim() && activeFont) {
                      onInsertIntoLayout(editorText, activeFont.family);
                    }
                  }}
                  disabled={!editorText.trim() || !activeFont}
                  className="w-full sm:w-auto p-2 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 dark:shadow-none transition-all hover:scale-105 active:scale-95 disabled:opacity-45 disabled:pointer-events-none"
                >
                  <Sparkles className="w-4 h-4 text-indigo-200" />
                  <span>Aplicar no Layout</span>
                </button>
              </div>
            )}

            {/* The canvas/container wrapper */}
            <div className="w-full max-w-3xl relative">
              
              {/* Floating Alternates Popover (Adobe Illustrator/InDesign Style) */}
              {alternates.length > 0 && alternatesPosition && (
                <div 
                  className="absolute z-[9999] bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 shadow-2xl rounded-2xl p-2.5 flex items-center gap-2 animate-fade-in pointer-events-auto alternates-popover"
                  style={{
                    left: `${alternatesPosition.x}px`,
                    top: `${alternatesPosition.y}px`,
                    transform: 'translateX(-50%)'
                  }}
                >
                  <div className="text-[10px] font-black uppercase tracking-wider text-indigo-500 border-r border-slate-150 dark:border-slate-800 pr-2 mr-1">
                    Alternativas
                  </div>
                  <div className="flex items-center gap-1.5 overflow-x-auto max-w-sm scrollbar-thin">
                    {alternates.map((alt) => (
                      <button
                        key={alt.index}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => applyAlternate(alt)}
                        className="p-1.5 rounded-lg border border-slate-150 hover:border-indigo-500 dark:border-slate-800 dark:hover:border-indigo-500 bg-slate-50 dark:bg-slate-950 flex flex-shrink-0 items-center justify-center transition-all hover:scale-110"
                        title={alt.name || `glyph-${alt.index}`}
                      >
                        <GlyphThumbnail glyph={alt} size={24} />
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
                className="w-full min-h-[300px] outline-none border-none bg-transparent whitespace-pre-wrap workspace-textarea break-all text-center selection:bg-indigo-500/30 font-sans"
                style={{
                  fontFamily: activeFont ? `"${activeFont.family}", sans-serif` : 'sans-serif',
                  fontSize: `${fontSize}px`,
                  lineHeight: lineHeight,
                  letterSpacing: `${letterSpacing}px`,
                  fontFeatureSettings: computedFontFeatures,
                  color: workspaceTheme === 'dark' ? '#f3f4f6' : '#111827',
                }}
              >
                Elegância & Sofisticação em Tipografia OpenType.
Selecione qualquer letra para ver glifos alternativos!
              </div>
            </div>

            {/* Micro tooltip explaining alternates trigger */}
            <div className={`absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold shadow-sm border ${
              workspaceTheme === 'dark' 
                ? 'bg-slate-900/90 border-slate-800 text-slate-400' 
                : 'bg-white/90 border-slate-200 text-slate-500'
            }`}>
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>DICA: Selecione uma única letra do texto para descobrir glifos alternativos e ligaduras decorativas!</span>
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
              {/* Feature checkboxes list */}
              {[
                { key: 'liga', label: 'Ligaduras Padrão (liga)', desc: 'Combina caracteres como fi, fl, ffi em glifos únicos' },
                { key: 'dlig', label: 'Ligaduras Decorativas (dlig)', desc: 'Ligaduras raras artísticas para caligrafia elegante' },
                { key: 'calt', label: 'Alternativas Contextuais (calt)', desc: 'Ajusta glifos dinamicamente baseando-se em letras adjacentes' },
                { key: 'salt', label: 'Alternativas Estilísticas (salt)', desc: 'Substitui glifos padrão por variações estilizadas' },
                { key: 'swsh', label: 'Swashes / Florituras (swsh)', desc: 'Adiciona caudas decorativas e floreios nas pontas' },
                { key: 'smcp', label: 'Small Caps / Versalete (smcp)', desc: 'Transforma letras minúsculas em maiúsculas reduzidas' },
                { key: 'frac', label: 'Frações Automáticas (frac)', desc: 'Converte 1/2, 3/4 em frações profissionais' },
                { key: 'onum', label: 'Números Antigos (onum)', desc: 'Números com proporções tradicionais flutuantes' },
                { key: 'tnum', label: 'Números Tabulares (tnum)', desc: 'Números com largura idêntica, ideal para tabelas' },
              ].map(({ key, label, desc }) => {
                const isActive = (features as any)[key];
                return (
                  <button
                    key={key}
                    onClick={() => setFeatures(prev => ({ ...prev, [key]: !isActive }))}
                    className={`w-full flex items-start gap-2.5 p-2 rounded-lg text-left transition-all border ${
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
                    className={`flex items-center gap-1.5 p-1.5 rounded-lg border text-xs font-semibold uppercase transition-all ${
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
            <p className="text-[9px] opacity-50 mt-2">Ative conjuntos estilísticos individuais para fontes que fornecem estilos alternativos organizados.</p>
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
                    <GlyphThumbnail glyph={selectedGlyphData.glyph} size={96} />
                  </div>
                  <div className="absolute top-2 right-2 flex items-center gap-1 text-[8px] font-mono opacity-40">
                    <span>Index: {selectedGlyphData.index}</span>
                  </div>
                </div>

                {/* Metadata details list */}
                <div className={`p-3 rounded-xl space-y-2.5 text-[11px] font-semibold border ${
                  workspaceTheme === 'dark' ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-50 border-slate-100'
                }`}>
                  <div className="flex justify-between border-b dark:border-slate-800 pb-1.5">
                    <span className="text-slate-400">Nome Interno:</span>
                    <span className="font-mono text-indigo-500 truncate max-w-[140px]" title={selectedGlyphData.name}>
                      {selectedGlyphData.name}
                    </span>
                  </div>
                  <div className="flex justify-between border-b dark:border-slate-800 pb-1.5">
                    <span className="text-slate-400">Código Unicode:</span>
                    <span className="font-mono text-slate-500">{selectedGlyphData.unicode}</span>
                  </div>
                  <div className="flex justify-between border-b dark:border-slate-800 pb-1.5">
                    <span className="text-slate-400">Largura de Avanço:</span>
                    <span className="font-mono text-slate-500">{selectedGlyphData.advanceWidth} UEm</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Dimensões BoundingBox:</span>
                    <span className="font-mono text-slate-500 text-[10px]">
                      {selectedGlyphData.metrics.xMax - selectedGlyphData.metrics.xMin}x{selectedGlyphData.metrics.yMax - selectedGlyphData.metrics.yMin}
                    </span>
                  </div>
                </div>

                {/* Download and Insert action buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => insertGlyph(selectedGlyphData.glyph)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-100 dark:shadow-none transition-all"
                  >
                    <span>Inserir</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={handleDownloadGlyphSVG}
                    className={`p-2 rounded-xl border flex items-center justify-center transition-all ${
                      workspaceTheme === 'dark'
                        ? 'border-slate-800 hover:bg-slate-900 text-slate-300'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                    title="Baixar Glifo como arquivo SVG"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className={`p-6 text-center border border-dashed rounded-2xl flex flex-col items-center justify-center text-slate-400 ${
                workspaceTheme === 'dark' ? 'border-slate-800' : 'border-slate-250'
              }`}>
                <Info className="w-6 h-6 mb-2 text-slate-350" />
                <p className="text-xs">Selecione qualquer glifo no catálogo para inspecionar seus metadados ou exportar como vetor.</p>
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
                  <p className="text-[10px] opacity-60">Selecione uma fonte do PC para extrair e inspecionar seus glifos OpenType</p>
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
              <p className="text-[10px] opacity-50">Clique em qualquer fonte para carregar a tabela completa de glifos no editor OpenType.</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
