import React, { useState, useRef, useEffect } from 'react';
import { 
  BookMarked, Layers, Eye, EyeOff, Sparkles, Scissors, 
  Ruler, Settings2, Download, Printer, Plus, Trash2,
  Check, Palette, FileText, ChevronDown, ChevronRight, Sliders, Box, Upload, Image as ImageIcon,
  ArrowLeftRight, AlertTriangle
} from 'lucide-react';
import { 
  CoverProjectConfig, 
  CoverPage, 
  LayoutElement,
  PageSize,
  BackgroundConfig
} from '../../../../types';
import { 
  CARDBOARD_PRESETS, 
  calculateSpineWidthMm, 
  COVER_MONOGRAM_PRESETS,
  FOIL_GRADIENTS,
  findMatchingCardboardPreset,
  formatMmLabel,
  formatCmLabel
} from './coverGabaritoData';
import { compressImage } from '../../utils/imageCompressor';

interface CoverToolsPanelProps {
  coverConfig: CoverProjectConfig;
  onChangeCoverConfig: (newConfig: CoverProjectConfig) => void;
  onAddElementToActivePage: (element: LayoutElement) => void;
  onOpenMockupStudio: () => void;
  onExportCoverPdf: (mode: 'color' | 'mask_k100', options?: { includeGuides?: boolean }) => void;
  mioloWidthMm?: number;
  mioloHeightMm?: number;
}

const formatDimInput = (valMm: number, unit: 'mm' | 'cm'): string => {
  if (unit === 'cm') {
    const cm = Math.round((valMm / 10) * 100) / 100;
    return String(cm).replace('.', ',');
  }
  const mm = Math.round(valMm * 10) / 10;
  return String(mm).replace('.', ',');
};

const parseDimInputToMm = (raw: string, unit: 'mm' | 'cm'): number | null => {
  const normalized = raw.replace(',', '.').trim();
  if (!normalized) return null;
  const num = parseFloat(normalized);
  if (!Number.isFinite(num)) return null;
  return unit === 'cm' ? Math.round(num * 100) / 10 : Math.round(num * 10) / 10;
};

export const CoverToolsPanel: React.FC<CoverToolsPanelProps> = ({
  coverConfig,
  onChangeCoverConfig,
  onAddElementToActivePage,
  onOpenMockupStudio,
  onExportCoverPdf,
  mioloWidthMm,
  mioloHeightMm
}) => {
  const [activeSection, setActiveSection] = useState<'pages' | 'cardboard' | 'guides' | 'monograms' | 'spine' | 'export'>('cardboard');
  const [dimensionUnit, setDimensionUnit] = useState<'mm' | 'cm'>('mm');
  const [widthInput, setWidthInput] = useState<string>(() => formatDimInput(coverConfig.cardboardSize.width, 'mm'));
  const [heightInput, setHeightInput] = useState<string>(() => formatDimInput(coverConfig.cardboardSize.height, 'mm'));
  const [bleedInput, setBleedInput] = useState<string>(() => formatDimInput(coverConfig.bleedMm, 'mm'));
  const [editingField, setEditingField] = useState<'w' | 'h' | 'bleed' | null>(null);
  const [exportWithGuides, setExportWithGuides] = useState<boolean>(false);
  const bgFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingField !== 'w') {
      setWidthInput(formatDimInput(coverConfig.cardboardSize.width, dimensionUnit));
    }
    if (editingField !== 'h') {
      setHeightInput(formatDimInput(coverConfig.cardboardSize.height, dimensionUnit));
    }
  }, [coverConfig.cardboardSize.width, coverConfig.cardboardSize.height, dimensionUnit, editingField]);

  useEffect(() => {
    if (editingField !== 'bleed') {
      setBleedInput(formatDimInput(coverConfig.bleedMm, 'mm'));
    }
  }, [coverConfig.bleedMm, editingField]);

  const activePage = coverConfig.pages.find(p => p.id === coverConfig.activeCoverPageId) || coverConfig.pages[0];

  const updateActivePageBackground = (bgUpdates: Partial<BackgroundConfig>) => {
    onChangeCoverConfig({
      ...coverConfig,
      pages: coverConfig.pages.map(p => {
        if (p.id !== activePage.id) return p;
        const prevBg: BackgroundConfig = p.background || { type: 'solid', color: '#ffffff' };
        return {
          ...p,
          background: {
            ...prevBg,
            ...bgUpdates
          }
        };
      })
    });
  };

  const handleUploadCoverBackground = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressedUrl = await compressImage(file, 1600, 1600, 0.85);
      if (compressedUrl) {
        updateActivePageBackground({
          type: 'image',
          color: activePage.background?.color || '#ffffff',
          image: {
            url: compressedUrl,
            opacity: 1,
            fit: 'cover'
          }
        });
      }
    } finally {
      e.target.value = '';
    }
  };

  const applyCustomCardboardSize = (rawWidthMm: number, rawHeightMm: number) => {
    const clampedW = Math.min(600, Math.max(40, Math.round(rawWidthMm * 10) / 10));
    const clampedH = Math.min(600, Math.max(40, Math.round(rawHeightMm * 10) / 10));
    const matched = findMatchingCardboardPreset(clampedW, clampedH);
    onChangeCoverConfig({
      ...coverConfig,
      formatPreset: matched ? matched.id : 'custom',
      cardboardSize: { width: clampedW, height: clampedH }
    });
  };

  const handleWidthInputChange = (raw: string) => {
    setWidthInput(raw);
    const parsedMm = parseDimInputToMm(raw, dimensionUnit);
    if (parsedMm !== null && parsedMm >= 40 && parsedMm <= 600) {
      applyCustomCardboardSize(parsedMm, coverConfig.cardboardSize.height);
    }
  };

  const handleHeightInputChange = (raw: string) => {
    setHeightInput(raw);
    const parsedMm = parseDimInputToMm(raw, dimensionUnit);
    if (parsedMm !== null && parsedMm >= 40 && parsedMm <= 600) {
      applyCustomCardboardSize(coverConfig.cardboardSize.width, parsedMm);
    }
  };

  const commitDimensionInputs = () => {
    const parsedW = parseDimInputToMm(widthInput, dimensionUnit);
    const parsedH = parseDimInputToMm(heightInput, dimensionUnit);
    const nextW = parsedW !== null ? Math.min(600, Math.max(40, parsedW)) : coverConfig.cardboardSize.width;
    const nextH = parsedH !== null ? Math.min(600, Math.max(40, parsedH)) : coverConfig.cardboardSize.height;
    applyCustomCardboardSize(nextW, nextH);
    setEditingField(null);
    setWidthInput(formatDimInput(nextW, dimensionUnit));
    setHeightInput(formatDimInput(nextH, dimensionUnit));
  };

  const handleSwapCardboardOrientation = () => {
    const swappedW = coverConfig.cardboardSize.height;
    const swappedH = coverConfig.cardboardSize.width;
    applyCustomCardboardSize(swappedW, swappedH);
    setWidthInput(formatDimInput(swappedW, dimensionUnit));
    setHeightInput(formatDimInput(swappedH, dimensionUnit));
  };

  const updateCardboardPreset = (presetId: string) => {
    const preset = CARDBOARD_PRESETS.find(p => p.id === presetId);
    if (!preset) return;
    onChangeCoverConfig({
      ...coverConfig,
      formatPreset: presetId,
      cardboardSize: { ...preset.size },
      bleedMm: preset.standardWrapMm
    });
    setWidthInput(formatDimInput(preset.size.width, dimensionUnit));
    setHeightInput(formatDimInput(preset.size.height, dimensionUnit));
    setBleedInput(formatDimInput(preset.standardWrapMm, 'mm'));
  };

  const updateBleedMm = (bleed: number) => {
    const safeBleed = Math.min(50, Math.max(5, Math.round(bleed * 10) / 10));
    onChangeCoverConfig({
      ...coverConfig,
      bleedMm: safeBleed
    });
    setBleedInput(formatDimInput(safeBleed, 'mm'));
  };

  const toggleGuide = (key: keyof CoverProjectConfig['guides']) => {
    onChangeCoverConfig({
      ...coverConfig,
      guides: {
        ...coverConfig.guides,
        [key]: !coverConfig.guides[key]
      }
    });
  };

  const handleSelectPage = (pageId: string) => {
    onChangeCoverConfig({
      ...coverConfig,
      activeCoverPageId: pageId
    });
  };

  const handleSpineChange = (field: string, value: number | boolean) => {
    const updatedSpine = {
      ...coverConfig.spine,
      [field]: value
    };

    if (field === 'pageCount' || field === 'paperWeightGsm' || field === 'cardboardThicknessMm' || field === 'hingeGapMm') {
      const calc = calculateSpineWidthMm(
        Number(updatedSpine.pageCount),
        Number(updatedSpine.paperWeightGsm),
        Number(updatedSpine.cardboardThicknessMm),
        Number(updatedSpine.hingeGapMm)
      );
      updatedSpine.calculatedSpineWidthMm = calc.spineWidth;
    }

    onChangeCoverConfig({
      ...coverConfig,
      spine: updatedSpine
    });
  };

  const handleInsertMonogram = (presetId: string) => {
    const preset = COVER_MONOGRAM_PRESETS.find(p => p.id === presetId);
    if (!preset) return;

    const baseZ = activePage.elements.length + 1;

    // 1. Moldura / Brasão Vetorial
    const crestElement: LayoutElement = {
      id: 'crest_' + Math.random().toString(36).substring(2, 9),
      type: 'circle',
      name: `Brasão ${preset.name}`,
      x: 35,
      y: 28,
      w: 30,
      h: 22,
      zIndex: baseZ,
      style: {
        borderWidth: 1.5,
        borderColor: '#b38728',
        backgroundColor: 'transparent',
        borderRadius: 999
      }
    };

    // 2. Inicial / Letra Central
    const initialElement: LayoutElement = {
      id: 'init_' + Math.random().toString(36).substring(2, 9),
      type: 'text',
      name: 'Inicial do Monograma',
      content: 'M',
      x: 35,
      y: 32,
      w: 30,
      h: 12,
      zIndex: baseZ + 1,
      style: {
        fontSize: 38,
        fontFamily: 'Playfair Display',
        fontWeight: 'bold',
        color: '#b38728',
        textAlign: 'center'
      }
    };

    // 3. Título
    const titleElement: LayoutElement = {
      id: 'title_' + Math.random().toString(36).substring(2, 9),
      type: 'text',
      name: 'Título da Capa',
      content: preset.defaultTitle,
      x: 15,
      y: 53,
      w: 70,
      h: 6,
      zIndex: baseZ + 2,
      style: {
        fontSize: 20,
        fontFamily: 'Playfair Display',
        fontWeight: 'bold',
        color: '#1e293b',
        textAlign: 'center',
        letterSpacing: 2
      }
    };

    // 4. Nome
    const nameElement: LayoutElement = {
      id: 'name_' + Math.random().toString(36).substring(2, 9),
      type: 'text',
      name: 'Nome do Cliente',
      content: preset.defaultSubtitle,
      x: 10,
      y: 60,
      w: 80,
      h: 5,
      zIndex: baseZ + 3,
      style: {
        fontSize: 13,
        fontFamily: 'Inter',
        fontWeight: 'medium',
        color: '#64748b',
        textAlign: 'center',
        letterSpacing: 3,
        textTransform: 'uppercase'
      }
    };

    // 5. Ano
    const yearElement: LayoutElement = {
      id: 'year_' + Math.random().toString(36).substring(2, 9),
      type: 'text',
      name: 'Ano da Capa',
      content: preset.defaultYear,
      x: 35,
      y: 67,
      w: 30,
      h: 5,
      zIndex: baseZ + 4,
      style: {
        fontSize: 14,
        fontFamily: 'Inter',
        fontWeight: 'bold',
        color: '#b84a56',
        textAlign: 'center',
        letterSpacing: 4
      }
    };

    onAddElementToActivePage(crestElement);
    setTimeout(() => onAddElementToActivePage(initialElement), 30);
    setTimeout(() => onAddElementToActivePage(titleElement), 60);
    setTimeout(() => onAddElementToActivePage(nameElement), 90);
    setTimeout(() => onAddElementToActivePage(yearElement), 120);
  };

  const handleInsertSimpleName = () => {
    const el: LayoutElement = {
      id: 'name_' + Math.random().toString(36).substring(2, 9),
      type: 'text',
      name: 'Nome do Cliente',
      content: 'Mariana Silveira',
      x: 15,
      y: 45,
      w: 70,
      h: 8,
      zIndex: activePage.elements.length + 1,
      style: {
        fontSize: 28,
        fontFamily: 'Great Vibes',
        color: '#1e293b',
        textAlign: 'center'
      }
    };
    onAddElementToActivePage(el);
  };

  const handleInsertFrame = () => {
    const el: LayoutElement = {
      id: 'frame_' + Math.random().toString(36).substring(2, 9),
      type: 'box',
      name: 'Moldura de Borda Fina',
      x: 8,
      y: 6,
      w: 84,
      h: 88,
      zIndex: 1,
      style: {
        borderWidth: 1.2,
        borderColor: '#b38728',
        backgroundColor: 'transparent',
        borderRadius: 4
      }
    };
    onAddElementToActivePage(el);
  };

  return (
    <div className="w-full bg-white flex flex-col text-slate-800 select-none">
      {/* Header do Studio de Capas */}
      <div className="p-2.5 bg-gradient-to-r from-[#faf5f3] to-[#fffbf9] border-b border-[#eedad5] flex items-center justify-between gap-1">
        <div className="flex items-center gap-1.5 min-w-0">
          <div className="w-7 h-7 rounded-xl bg-[#b84a56] text-white flex items-center justify-center shrink-0 shadow-xs">
            <BookMarked className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <h2 className="text-xs font-black text-slate-900 tracking-tight truncate">Studio de Capas</h2>
            <p className="text-[9px] text-slate-500 font-medium truncate">Gabaritos de Cartonagem & Vira</p>
          </div>
        </div>

        <button
          onClick={onOpenMockupStudio}
          className="flex items-center gap-1 px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-[10px] font-bold transition-all cursor-pointer shadow-2xs shrink-0"
          title="Abrir Visualizador 3D Realista da Capa Montada"
        >
          <Box className="w-3 h-3 text-amber-600" />
          <span>Mockup 3D</span>
        </button>
      </div>

      {/* Seletor de Páginas da Capa (Abas Superiores) */}
      <div className="p-2 border-b border-[#eedad5] bg-slate-50/70">
        <label className="text-[9px] font-black uppercase text-slate-500 tracking-wider block mb-1.5 px-1">
          Página da Capa Selecionada:
        </label>
        <div className="grid grid-cols-2 gap-1">
          {coverConfig.pages.map(page => (
            <button
              key={page.id}
              onClick={() => handleSelectPage(page.id)}
              className={`px-2 py-1.5 text-[10px] font-bold rounded-lg transition-all text-left truncate flex items-center gap-1.5 cursor-pointer ${
                coverConfig.activeCoverPageId === page.id
                  ? 'bg-[#b84a56] text-white shadow-xs'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${coverConfig.activeCoverPageId === page.id ? 'bg-amber-300' : 'bg-slate-400'}`} />
              <span className="truncate">{page.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Navegação de Seções */}
      <div className="flex border-b border-[#eedad5] bg-[#faf6f4] px-1 pt-1 gap-1 text-[10px] font-bold">
        <button
          onClick={() => setActiveSection('cardboard')}
          className={`flex-1 py-1.5 text-center rounded-t-lg transition-all cursor-pointer ${
            activeSection === 'cardboard'
              ? 'bg-white text-[#b84a56] border-t border-x border-[#eedad5] shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Gabarito
        </button>
        <button
          onClick={() => setActiveSection('guides')}
          className={`flex-1 py-1.5 text-center rounded-t-lg transition-all cursor-pointer ${
            activeSection === 'guides'
              ? 'bg-white text-[#b84a56] border-t border-x border-[#eedad5] shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Guias
        </button>
        <button
          onClick={() => setActiveSection('monograms')}
          className={`flex-1 py-1.5 text-center rounded-t-lg transition-all cursor-pointer ${
            activeSection === 'monograms'
              ? 'bg-white text-[#b84a56] border-t border-x border-[#eedad5] shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Brasões
        </button>
        <button
          onClick={() => setActiveSection('spine')}
          className={`flex-1 py-1.5 text-center rounded-t-lg transition-all cursor-pointer ${
            activeSection === 'spine'
              ? 'bg-white text-[#b84a56] border-t border-x border-[#eedad5] shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Lombada
        </button>
        <button
          onClick={() => setActiveSection('export')}
          className={`flex-1 py-1.5 text-center rounded-t-lg transition-all cursor-pointer ${
            activeSection === 'export'
              ? 'bg-white text-[#b84a56] border-t border-x border-[#eedad5] shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Exportar
        </button>
      </div>

      {/* Conteúdo da Seção Ativa */}
      <div className="p-3 space-y-3.5">
        {/* 1. SEÇÃO GABARITO & TAMANHO DO PAPELÃO */}
        {activeSection === 'cardboard' && (
          <div className="space-y-3">
            {/* MEDIDA EXATA / PERSONALIZADA DO PAPELÃO */}
            <div className="p-3 bg-gradient-to-b from-[#fffaf9] to-white rounded-xl border border-[#eedad5] shadow-2xs space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <Ruler className="w-3.5 h-3.5 text-[#b84a56] shrink-0" />
                  <span className="text-[10px] font-black uppercase text-slate-800 tracking-wider truncate">
                    Medida do Papelão (Holler)
                  </span>
                </div>
                <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 shrink-0">
                  {(['mm', 'cm'] as const).map(unit => (
                    <button
                      key={unit}
                      type="button"
                      onClick={() => setDimensionUnit(unit)}
                      className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase transition-all cursor-pointer ${
                        dimensionUnit === unit
                          ? 'bg-[#b84a56] text-white shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {unit}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-end gap-1.5">
                <div className="flex-1 min-w-0">
                  <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">
                    Largura ({dimensionUnit})
                  </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={widthInput}
                    onFocus={() => setEditingField('w')}
                    onChange={(e) => handleWidthInputChange(e.target.value)}
                    onBlur={commitDimensionInputs}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        (e.target as HTMLInputElement).blur();
                      }
                    }}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 focus:border-[#b84a56] focus:ring-1 focus:ring-[#b84a56] outline-none rounded-lg text-xs font-black text-slate-900 text-center tabular-nums transition-all"
                    placeholder={dimensionUnit === 'cm' ? '15,5' : '155'}
                  />
                </div>

                <button
                  type="button"
                  onClick={handleSwapCardboardOrientation}
                  className="mb-0.5 p-1.5 rounded-lg bg-slate-100 hover:bg-[#fdeeed] text-slate-600 hover:text-[#b84a56] border border-slate-200 transition-colors cursor-pointer shrink-0"
                  title="Inverter Largura × Altura (Retrato / Paisagem)"
                >
                  <ArrowLeftRight className="w-3.5 h-3.5" />
                </button>

                <div className="flex-1 min-w-0">
                  <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">
                    Altura ({dimensionUnit})
                  </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={heightInput}
                    onFocus={() => setEditingField('h')}
                    onChange={(e) => handleHeightInputChange(e.target.value)}
                    onBlur={commitDimensionInputs}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        (e.target as HTMLInputElement).blur();
                      }
                    }}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 focus:border-[#b84a56] focus:ring-1 focus:ring-[#b84a56] outline-none rounded-lg text-xs font-black text-slate-900 text-center tabular-nums transition-all"
                    placeholder={dimensionUnit === 'cm' ? '21,5' : '215'}
                  />
                </div>
              </div>

              {/* Resumo de Conversão + Relação Proporcional com o Miolo */}
              <div className="pt-1.5 border-t border-[#f2e4e0] space-y-1.5">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-slate-600 font-semibold tabular-nums">
                    {formatMmLabel(coverConfig.cardboardSize.width)} × {formatMmLabel(coverConfig.cardboardSize.height)} mm
                    <span className="text-slate-400 font-normal"> ({formatCmLabel(coverConfig.cardboardSize.width)} × {formatCmLabel(coverConfig.cardboardSize.height)} cm)</span>
                  </span>
                  <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded ${
                    coverConfig.formatPreset === 'custom'
                      ? 'bg-indigo-100 text-indigo-800'
                      : 'bg-[#fdeeed] text-[#b84a56]'
                  }`}>
                    {coverConfig.formatPreset === 'custom'
                      ? 'Personalizado'
                      : (CARDBOARD_PRESETS.find(p => p.id === coverConfig.formatPreset)?.shortLabel || coverConfig.formatPreset)}
                  </span>
                </div>

                {mioloWidthMm && mioloHeightMm && (() => {
                  const diffW = Math.round((coverConfig.cardboardSize.width - mioloWidthMm) * 10) / 10;
                  const diffH = Math.round((coverConfig.cardboardSize.height - mioloHeightMm) * 10) / 10;
                  const eachVert = Math.round((diffH / 2) * 10) / 10;
                  const isSmallerThanMiolo = diffW < 0 || diffH < 0;

                  return (
                    <div className="space-y-1.5">
                      {isSmallerThanMiolo ? (
                        <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 flex items-start gap-1.5 text-[9px] text-amber-900 leading-tight">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                          <span>
                            Papelão menor que o miolo atual (<strong>{formatMmLabel(mioloWidthMm)} × {formatMmLabel(mioloHeightMm)} mm</strong>). Ajuste abaixo ou digite sua medida.
                          </span>
                        </div>
                      ) : (
                        <div className="text-[9px] text-slate-500 flex items-center justify-between gap-1 bg-slate-50 px-2 py-1 rounded-md border border-slate-200/70 tabular-nums">
                          <span>Miolo: <strong>{formatMmLabel(mioloWidthMm)}×{formatMmLabel(mioloHeightMm)}mm</strong></span>
                          <span className="text-emerald-700 font-bold">
                            Beiral: +{formatMmLabel(diffW)}mm larg. • +{formatMmLabel(eachVert)}mm sup/inf
                          </span>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          type="button"
                          onClick={() => applyCustomCardboardSize(mioloWidthMm + 7, mioloHeightMm + 5)}
                          className="py-1 px-2 rounded-lg bg-white hover:bg-[#fdeeed]/70 border border-slate-200 hover:border-[#b84a56]/40 text-[9px] font-bold text-slate-700 transition-colors cursor-pointer truncate"
                          title={`Definir papelão com folga padrão (+7mm larg. e +5mm alt.) sobre o miolo de ${formatMmLabel(mioloWidthMm)}×${formatMmLabel(mioloHeightMm)}mm`}
                        >
                          Miolo + Padrão ({formatMmLabel(mioloWidthMm + 7)}×{formatMmLabel(mioloHeightMm + 5)})
                        </button>
                        <button
                          type="button"
                          onClick={() => applyCustomCardboardSize(mioloWidthMm + 12, mioloHeightMm + 10)}
                          className="py-1 px-2 rounded-lg bg-white hover:bg-[#fdeeed]/70 border border-slate-200 hover:border-[#b84a56]/40 text-[9px] font-bold text-slate-700 transition-colors cursor-pointer truncate"
                          title={`Definir papelão estendido para abas divisórias (+12mm larg. e +10mm alt.)`}
                        >
                          Miolo + Abas ({formatMmLabel(mioloWidthMm + 12)}×{formatMmLabel(mioloHeightMm + 10)})
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* FORMATOS RÁPIDOS DE REFERÊNCIA */}
            <div>
              <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider block mb-1.5">
                Tamanhos Prontos de Referência:
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {CARDBOARD_PRESETS.map(preset => {
                  const isSelected =
                    coverConfig.formatPreset === preset.id ||
                    (Math.abs(coverConfig.cardboardSize.width - preset.size.width) < 0.05 &&
                      Math.abs(coverConfig.cardboardSize.height - preset.size.height) < 0.05);
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => updateCardboardPreset(preset.id)}
                      className={`p-2 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-0.5 min-w-0 ${
                        isSelected
                          ? 'border-[#b84a56] bg-[#fdeeed]/60 shadow-xs ring-1 ring-[#b84a56]'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                      title={`${preset.name} — ${preset.recommendedMiolo}`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[11px] font-bold text-slate-900 truncate">{preset.shortLabel}</span>
                        {isSelected && <Check className="w-3 h-3 text-[#b84a56] shrink-0" />}
                      </div>
                      <span className="text-[9px] text-slate-500 font-mono tabular-nums truncate">
                        {formatCmLabel(preset.size.width)} × {formatCmLabel(preset.size.height)} cm
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Vira da Capa Dura */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <label className="text-[10px] font-bold uppercase text-slate-700">
                  Vira da Capa Dura (Wrap):
                </label>
                <span className="text-xs font-black text-[#b84a56] tabular-nums">{formatMmLabel(coverConfig.bleedMm)} mm</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5 mb-2">
                {[15, 18, 20].map(v => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => updateBleedMm(v)}
                    className={`py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      Math.abs(coverConfig.bleedMm - v) < 0.05
                        ? 'bg-[#b84a56] text-white shadow-2xs'
                        : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    {v} mm
                  </button>
                ))}
                <input
                  type="text"
                  inputMode="decimal"
                  value={bleedInput}
                  onFocus={() => setEditingField('bleed')}
                  onChange={(e) => {
                    setBleedInput(e.target.value);
                    const parsed = parseDimInputToMm(e.target.value, 'mm');
                    if (parsed !== null && parsed >= 5 && parsed <= 50) {
                      onChangeCoverConfig({ ...coverConfig, bleedMm: parsed });
                    }
                  }}
                  onBlur={() => {
                    const parsed = parseDimInputToMm(bleedInput, 'mm');
                    const nextBleed = parsed !== null ? Math.min(50, Math.max(5, parsed)) : coverConfig.bleedMm;
                    updateBleedMm(nextBleed);
                    setEditingField(null);
                  }}
                  className="py-1 px-1.5 rounded-lg text-xs font-bold bg-white border border-slate-300 focus:border-[#b84a56] outline-none text-center tabular-nums"
                  title="Medida personalizada da vira em mm"
                />
              </div>
              <div className="flex items-center justify-between text-[9px] text-slate-600 bg-white px-2 py-1 rounded border border-slate-200/80 mb-1.5 tabular-nums">
                <span>Arte Impressa c/ Vira:</span>
                <strong className="text-slate-900">
                  {formatMmLabel(coverConfig.cardboardSize.width + coverConfig.bleedMm * 2)} × {formatMmLabel(coverConfig.cardboardSize.height + coverConfig.bleedMm * 2)} mm
                </strong>
              </div>
              <p className="text-[9px] text-slate-500 leading-tight">
                * 15mm é a medida padrão para réguas de encadernação fio de cabelo.
              </p>
            </div>

            {/* Cor e Arte de Fundo da Página Selecionada */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold uppercase text-slate-700 truncate">
                  Fundo • {activePage.name}
                </label>
                <span className="text-[10px] font-mono text-slate-500 tabular-nums">
                  {activePage.background?.color || '#ffffff'}
                </span>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                <input
                  type="color"
                  value={activePage.background?.color || '#ffffff'}
                  onChange={(e) => updateActivePageBackground({
                    type: activePage.background?.image?.url ? 'image' : 'solid',
                    color: e.target.value
                  })}
                  className="w-7 h-7 p-0 border border-slate-300 rounded-lg cursor-pointer bg-white shrink-0"
                  title="Escolher cor personalizada"
                />
                {[
                  { hex: '#ffffff', label: 'Branco' },
                  { hex: '#faf7f2', label: 'Off-White' },
                  { hex: '#f8e6e8', label: 'Rosé Suave' },
                  { hex: '#e8c5c8', label: 'Rosé Antigo' },
                  { hex: '#9e3f4d', label: 'Marsala' },
                  { hex: '#dbe4dc', label: 'Verde Sálvia' },
                  { hex: '#1e293b', label: 'Azul Noite' },
                  { hex: '#18181b', label: 'Preto Luxo' }
                ].map(sw => (
                  <button
                    key={sw.hex}
                    type="button"
                    onClick={() => updateActivePageBackground({
                      type: activePage.background?.image?.url ? 'image' : 'solid',
                      color: sw.hex
                    })}
                    className={`w-6 h-6 rounded-full border transition-transform hover:scale-110 cursor-pointer ${
                      (activePage.background?.color || '#ffffff').toLowerCase() === sw.hex
                        ? 'ring-2 ring-[#b84a56] border-white'
                        : 'border-slate-300'
                    }`}
                    style={{ backgroundColor: sw.hex }}
                    title={sw.label}
                  />
                ))}
              </div>

              <div className="flex items-center gap-1.5 pt-0.5">
                <input
                  ref={bgFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleUploadCoverBackground}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => bgFileInputRef.current?.click()}
                  className="flex-1 py-1.5 px-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Upload className="w-3 h-3 text-[#b84a56]" />
                  <span>{activePage.background?.image?.url ? 'Trocar Estampa de Fundo' : 'Enviar Estampa / Papel Digital'}</span>
                </button>
                {activePage.background?.image?.url && (
                  <button
                    type="button"
                    onClick={() => updateActivePageBackground({ type: 'solid', image: undefined })}
                    className="p-1.5 bg-white hover:bg-red-50 text-red-600 border border-red-200 rounded-lg cursor-pointer transition-colors"
                    title="Remover estampa de fundo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Inserções Rápidas de Elementos */}
            <div className="pt-2 border-t border-slate-100">
              <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider block mb-2">
                Elementos Rápidos para a Capa:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleInsertSimpleName}
                  className="p-2.5 rounded-xl border border-indigo-200 bg-indigo-50/50 hover:bg-indigo-100 text-indigo-900 text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer shadow-2xs"
                >
                  <span className="font-serif italic text-base">Nome</span>
                  <span className="text-[9px] font-medium text-indigo-600">Inserir Nome Caligráfico</span>
                </button>
                <button
                  onClick={handleInsertFrame}
                  className="p-2.5 rounded-xl border border-amber-200 bg-amber-50/50 hover:bg-amber-100 text-amber-900 text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer shadow-2xs"
                >
                  <span className="text-base">🔲</span>
                  <span className="text-[9px] font-medium text-amber-700">Moldura Clássica</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 2. SEÇÃO DE GUIAS TÉCNICAS DE CARTONAGEM */}
        {activeSection === 'guides' && (
          <div className="space-y-3">
            <p className="text-[10px] text-slate-600 leading-relaxed bg-blue-50 p-2.5 rounded-xl border border-blue-100">
              Ative ou desative as guias de corte, papelão, furação e elástico. Para margens de alinhamento personalizadas, puxe linhas a partir das réguas no topo e na lateral.
            </p>

            <div className="space-y-2">
              <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-900">Linha da Vira / Sangria</span>
                  <span className="text-[9px] text-slate-500">Área externa onde o papel adesivo será cortado</span>
                </div>
                <input
                  type="checkbox"
                  checked={coverConfig.guides.showBleedLine}
                  onChange={() => toggleGuide('showBleedLine')}
                  className="w-4 h-4 accent-[#b84a56] cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-900">Linha do Papelão Cinza</span>
                  <span className="text-[9px] text-slate-500">Posicionamento exato do papelão holler</span>
                </div>
                <input
                  type="checkbox"
                  checked={coverConfig.guides.showCardboardLine}
                  onChange={() => toggleGuide('showCardboardLine')}
                  className="w-4 h-4 accent-[#b84a56] cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-900">Marcas de Canto (Fio de Cabelo)</span>
                  <span className="text-[9px] text-slate-500">Guias a 45º para corte preciso nos 4 cantos</span>
                </div>
                <input
                  type="checkbox"
                  checked={coverConfig.guides.showCornerMarks}
                  onChange={() => toggleGuide('showCornerMarks')}
                  className="w-4 h-4 accent-[#b84a56] cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-900">Simulador de Furação Wire-o</span>
                  <span className="text-[9px] text-slate-500">Centralizado no 1º cm a partir da borda do papelão</span>
                </div>
                <input
                  type="checkbox"
                  checked={coverConfig.guides.showWireOGuide}
                  onChange={() => toggleGuide('showWireOGuide')}
                  className="w-4 h-4 accent-[#b84a56] cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-900">Simulador de Elástico & Ilhós</span>
                  <span className="text-[9px] text-slate-500">Exibe a passagem do elástico chato e furos</span>
                </div>
                <input
                  type="checkbox"
                  checked={coverConfig.guides.showElasticGuide}
                  onChange={() => toggleGuide('showElasticGuide')}
                  className="w-4 h-4 accent-[#b84a56] cursor-pointer"
                />
              </label>
            </div>

            {/* Ajustes Milimétricos medidos da Borda do Papelão */}
            <div className="pt-2 border-t border-slate-200 space-y-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between gap-1">
                  <div>
                    <span className="text-[10px] font-black uppercase text-slate-700 tracking-wider block">
                      Wire-o (da borda do papelão)
                    </span>
                    <span className="text-[9px] text-slate-500 block">
                      Padrão: 5 mm (centro do 1º cm)
                    </span>
                  </div>
                  <span className="text-xs font-black text-[#b84a56] tabular-nums shrink-0">{coverConfig.wireO.marginMm} mm</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="3"
                    max="15"
                    step="0.5"
                    value={coverConfig.wireO.marginMm}
                    onChange={(e) => {
                      onChangeCoverConfig({
                        ...coverConfig,
                        wireO: {
                          ...coverConfig.wireO,
                          marginMm: parseFloat(e.target.value) || 5
                        }
                      });
                    }}
                    className="flex-1 accent-[#b84a56] cursor-pointer"
                  />
                  <input
                    type="number"
                    min="3"
                    max="20"
                    step="0.5"
                    value={coverConfig.wireO.marginMm}
                    onChange={(e) => {
                      onChangeCoverConfig({
                        ...coverConfig,
                        wireO: {
                          ...coverConfig.wireO,
                          marginMm: parseFloat(e.target.value) || 5
                        }
                      });
                    }}
                    className="w-14 px-1.5 py-0.5 text-xs font-bold bg-white border border-slate-300 rounded text-center tabular-nums"
                  />
                </div>
                {coverConfig.wireO.marginMm !== 5 && (
                  <button
                    type="button"
                    onClick={() => onChangeCoverConfig({
                      ...coverConfig,
                      wireO: { ...coverConfig.wireO, marginMm: 5 }
                    })}
                    className="w-full py-1 px-2 bg-white hover:bg-[#fdeeed] text-[#b84a56] border border-[#eedad5] rounded-lg text-[10px] font-bold cursor-pointer transition-colors"
                  >
                    Centralizar no 1º cm (5 mm)
                  </button>
                )}
                <div className="flex items-center gap-1.5 pt-1">
                  <span className="text-[9px] text-slate-500 font-medium">Passo:</span>
                  <button
                    type="button"
                    onClick={() => onChangeCoverConfig({ ...coverConfig, wireO: { ...coverConfig.wireO, pitch: '2:1' } })}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${coverConfig.wireO.pitch === '2:1' ? 'bg-[#b84a56] text-white' : 'bg-white border text-slate-700'}`}
                  >
                    2:1 (Grande)
                  </button>
                  <button
                    type="button"
                    onClick={() => onChangeCoverConfig({ ...coverConfig, wireO: { ...coverConfig.wireO, pitch: '3:1' } })}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${coverConfig.wireO.pitch === '3:1' ? 'bg-[#b84a56] text-white' : 'bg-white border text-slate-700'}`}
                  >
                    3:1 (Pequeno)
                  </button>
                </div>
                <div className="flex items-center justify-between gap-1 pt-1 border-t border-slate-200/70">
                  <span className="text-[9px] text-slate-500 font-medium">Cor no Mockup:</span>
                  <div className="flex items-center gap-1">
                    {([
                      { id: 'gold', hex: '#d4af37', label: 'Dourado' },
                      { id: 'silver', hex: '#cbd5e1', label: 'Prata' },
                      { id: 'rosegold', hex: '#d98894', label: 'Rosé Gold' },
                      { id: 'bronze', hex: '#b87333', label: 'Bronze' },
                      { id: 'black', hex: '#27272a', label: 'Preto' },
                      { id: 'white', hex: '#ffffff', label: 'Branco' }
                    ] as const).map(wc => (
                      <button
                        key={wc.id}
                        type="button"
                        onClick={() => onChangeCoverConfig({ ...coverConfig, wireO: { ...coverConfig.wireO, wireColor: wc.id } })}
                        className={`w-5 h-5 rounded-full border transition-transform hover:scale-110 cursor-pointer ${
                          coverConfig.wireO.wireColor === wc.id ? 'ring-2 ring-[#b84a56] border-white' : 'border-slate-300'
                        }`}
                        style={{ backgroundColor: wc.hex }}
                        title={`Wire-o ${wc.label}`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-slate-700 tracking-wider">
                    Elástico (da borda do papelão)
                  </span>
                  <span className="text-xs font-black text-[#b84a56] tabular-nums">{coverConfig.elastic.positionMm} mm</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="8"
                    max="35"
                    step="1"
                    value={coverConfig.elastic.positionMm}
                    onChange={(e) => {
                      onChangeCoverConfig({
                        ...coverConfig,
                        elastic: {
                          ...coverConfig.elastic,
                          positionMm: parseInt(e.target.value) || 16
                        }
                      });
                    }}
                    className="flex-1 accent-[#b84a56] cursor-pointer"
                  />
                  <input
                    type="number"
                    min="5"
                    max="45"
                    step="1"
                    value={coverConfig.elastic.positionMm}
                    onChange={(e) => {
                      onChangeCoverConfig({
                        ...coverConfig,
                        elastic: {
                          ...coverConfig.elastic,
                          positionMm: parseInt(e.target.value) || 16
                        }
                      });
                    }}
                    className="w-14 px-1.5 py-0.5 text-xs font-bold bg-white border border-slate-300 rounded text-center tabular-nums"
                  />
                </div>
                <div className="flex items-center gap-1.5 pt-1">
                  <span className="text-[9px] text-slate-500 font-medium">Largura:</span>
                  {[7, 10, 15].map(w => (
                    <button
                      key={w}
                      type="button"
                      onClick={() => onChangeCoverConfig({ ...coverConfig, elastic: { ...coverConfig.elastic, widthMm: w } })}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${coverConfig.elastic.widthMm === w ? 'bg-[#b84a56] text-white' : 'bg-white border text-slate-700'}`}
                    >
                      {w}mm
                    </button>
                  ))}
                </div>
                <div className="flex items-center justify-between gap-1.5 pt-1 border-t border-slate-200/70">
                  <span className="text-[9px] text-slate-500 font-medium">Cor do Elástico:</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="color"
                      value={coverConfig.elastic.color || '#b84a56'}
                      onChange={(e) => onChangeCoverConfig({ ...coverConfig, elastic: { ...coverConfig.elastic, color: e.target.value } })}
                      className="w-5 h-5 p-0 border border-slate-300 rounded cursor-pointer bg-white"
                      title="Cor personalizada do elástico"
                    />
                    {['#b84a56', '#e2959e', '#d6bfa9', '#c59b27', '#5f6f52', '#1e293b'].map(ec => (
                      <button
                        key={ec}
                        type="button"
                        onClick={() => onChangeCoverConfig({ ...coverConfig, elastic: { ...coverConfig.elastic, color: ec } })}
                        className={`w-4.5 h-4.5 rounded-full border transition-transform hover:scale-110 cursor-pointer ${
                          (coverConfig.elastic.color || '#b84a56').toLowerCase() === ec ? 'ring-2 ring-[#b84a56] border-white' : 'border-slate-300'
                        }`}
                        style={{ backgroundColor: ec }}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-200/70">
                  <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!coverConfig.elastic.showClasp}
                      onChange={(e) => onChangeCoverConfig({
                        ...coverConfig,
                        elastic: { ...coverConfig.elastic, showClasp: e.target.checked }
                      })}
                      className="w-3.5 h-3.5 accent-[#b84a56] cursor-pointer"
                    />
                    <span>Passador Decorativo</span>
                  </label>
                  {coverConfig.elastic.showClasp && (
                    <input
                      type="text"
                      maxLength={3}
                      value={coverConfig.elastic.claspText || 'A'}
                      onChange={(e) => onChangeCoverConfig({
                        ...coverConfig,
                        elastic: { ...coverConfig.elastic, claspText: e.target.value }
                      })}
                      placeholder="A"
                      className="w-12 px-1.5 py-0.5 text-[10px] font-bold bg-white border border-slate-300 rounded text-center"
                      title="Inicial ou símbolo no passador"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. SEÇÃO DE BRASÕES & MONOGRAMAS */}
        {activeSection === 'monograms' && (
          <div className="space-y-3">
            <p className="text-[10px] text-slate-600 leading-relaxed bg-amber-50 p-2.5 rounded-xl border border-amber-200">
              Insira com 1 clique um monograma profissional completo (brasão, inicial, título e ano) e edite os textos diretamente na tela.
            </p>

            <div className="space-y-2">
              {COVER_MONOGRAM_PRESETS.map(preset => (
                <div
                  key={preset.id}
                  className="p-3 rounded-xl border border-slate-200 bg-white hover:border-[#b84a56] transition-all flex items-center justify-between shadow-2xs"
                >
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">{preset.name}</span>
                    <span className="text-[10px] text-amber-700 font-medium">Estilo {preset.category}</span>
                  </div>
                  <button
                    onClick={() => handleInsertMonogram(preset.id)}
                    className="px-3 py-1.5 bg-[#b84a56] hover:bg-[#a23d48] text-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow-2xs active:scale-95 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Inserir</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. SEÇÃO CALCULADORA DE LOMBADA */}
        {activeSection === 'spine' && (
          <div className="space-y-3">
            <div className="p-3 bg-gradient-to-r from-rose-50 to-orange-50 rounded-xl border border-rose-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black text-rose-900 uppercase">Capa Inteira com Lombada</span>
                <input
                  type="checkbox"
                  checked={coverConfig.spine.enabled}
                  onChange={(e) => handleSpineChange('enabled', e.target.checked)}
                  className="w-4 h-4 accent-rose-600 cursor-pointer"
                />
              </div>
              <p className="text-[10px] text-rose-800 leading-tight">
                Gera a capa panorâmica (Frente + Lombada + Verso) em uma única folha para encadernação brochura ou capa dura inteiriça.
              </p>
            </div>

            {coverConfig.spine.enabled && (
              <div className="space-y-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <label className="text-[10px] font-bold text-slate-700 block mb-1">
                    Quantidade de Páginas do Miolo:
                  </label>
                  <input
                    type="number"
                    value={coverConfig.spine.pageCount}
                    onChange={(e) => handleSpineChange('pageCount', Math.max(10, parseInt(e.target.value) || 10))}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold"
                  />
                  <span className="text-[9px] text-slate-500 mt-0.5 block">
                    {Math.ceil(coverConfig.spine.pageCount / 2)} folhas impressas frente e verso
                  </span>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-700 block mb-1">
                    Gramatura do Papel do Miolo:
                  </label>
                  <select
                    value={coverConfig.spine.paperWeightGsm}
                    onChange={(e) => handleSpineChange('paperWeightGsm', parseInt(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold"
                  >
                    <option value={75}>Sulfite 75g (Tradicional)</option>
                    <option value={90}>Offset 90g (Padrão Agenda/Planner)</option>
                    <option value={120}>Offset 120g (Grosso / Premium)</option>
                    <option value={150}>Offset 150g (Ilustrações / Álbum)</option>
                    <option value={180}>Offset 180g (Scrapbook / Cartão)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-700 block mb-1">
                    Espessura do Papelão Cinza:
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[1.5, 1.9, 2.2, 2.5].map(th => (
                      <button
                        key={th}
                        type="button"
                        onClick={() => handleSpineChange('cardboardThicknessMm', th)}
                        className={`py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                          Math.abs((coverConfig.spine.cardboardThicknessMm || 1.9) - th) < 0.05
                            ? 'bg-rose-600 text-white shadow-2xs'
                            : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        {String(th).replace('.', ',')}mm
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-white rounded-lg border border-rose-200 text-center">
                  <span className="text-[10px] font-bold uppercase text-slate-500 block">Lombada Calculada:</span>
                  <span className="text-xl font-black text-rose-600">{coverConfig.spine.calculatedSpineWidthMm} mm</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 5. SEÇÃO DE EXPORTAÇÃO PROFISSIONAL */}
        {activeSection === 'export' && (
          <div className="space-y-3">
            {/* Informações de Dimensão Real do Arquivo */}
            {(() => {
              const isEndsheet = activePage.type === 'endsheet_front' || activePage.type === 'endsheet_back' || (activePage as any).type === 'guard' || activePage.id?.includes('guard') || activePage.id?.includes('endsheet');
              const effectiveBleed = isEndsheet ? 0 : coverConfig.bleedMm;
              const isSpread = !isEndsheet && (activePage.type === 'spread' || coverConfig.spine.enabled);
              const totalW_MM = isSpread
                ? (coverConfig.cardboardSize.width * 2) + coverConfig.spine.calculatedSpineWidthMm + (coverConfig.spine.hingeGapMm * 2) + (effectiveBleed * 2)
                : coverConfig.cardboardSize.width + (effectiveBleed * 2);
              const totalH_MM = coverConfig.cardboardSize.height + (effectiveBleed * 2);

              return (
                <div className="p-3 bg-slate-900 text-white rounded-xl space-y-1.5 shadow-sm border border-slate-800">
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <span className="text-amber-300 uppercase tracking-wide">Dimensão Final do PDF</span>
                    <span className="text-emerald-400 font-mono text-xs font-black">{Math.round(totalW_MM)} × {Math.round(totalH_MM)} mm</span>
                  </div>
                  <p className="text-[10px] text-slate-300 leading-tight">
                    {isEndsheet ? (
                      <>Página de <strong>Guarda</strong>: exatamente o tamanho do papelão ({coverConfig.cardboardSize.width} × {coverConfig.cardboardSize.height} mm), sem viras.</>
                    ) : (
                      <>Capa / Contracapa: <strong>Papelão {coverConfig.cardboardSize.width} × {coverConfig.cardboardSize.height} mm</strong> + <strong>Vira de {coverConfig.bleedMm}mm</strong> em toda a volta para empastamento.</>
                    )}
                  </p>
                </div>
              );
            })()}

            {/* Opção: Arte Limpa (Sem guias) vs Gabarito Técnico */}
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 space-y-2">
              <label className="text-[10px] font-bold text-slate-800 uppercase tracking-wider block">
                Conteúdo do PDF Exportado
              </label>

              <div className="space-y-1.5">
                <label className="flex items-start gap-2 p-2 rounded-lg bg-white border border-slate-200 cursor-pointer hover:border-emerald-500 transition-colors">
                  <input
                    type="radio"
                    name="cover_export_guide_choice"
                    checked={!exportWithGuides}
                    onChange={() => setExportWithGuides(false)}
                    className="mt-0.5 accent-emerald-600"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Arte Limpa para Impressão (Recomendado)</span>
                    <span className="text-[9px] text-slate-500 block leading-tight">
                      Apenas a arte, fundos e textos. Sem marcas de elástico, sem furação de wire-o e sem linhas de guia sobrepostas.
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-2 p-2 rounded-lg bg-white border border-slate-200 cursor-pointer hover:border-indigo-500 transition-colors">
                  <input
                    type="radio"
                    name="cover_export_guide_choice"
                    checked={exportWithGuides}
                    onChange={() => setExportWithGuides(true)}
                    className="mt-0.5 accent-indigo-600"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Gabarito Técnico para Conferência</span>
                    <span className="text-[9px] text-slate-500 block leading-tight">
                      Inclui linhas de papelão, vira, marcas de corte a 45º e simulação de wire-o/elástico para conferir antes de produzir.
                    </span>
                  </div>
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => onExportCoverPdf('color', { includeGuides: exportWithGuides })}
                className="w-full p-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-98 flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <Printer className="w-4 h-4 text-emerald-200" />
                  <div className="text-left">
                    <span className="block font-black">
                      {exportWithGuides ? 'Exportar Capa com Gabarito (PDF)' : 'Exportar Capa Impressa Limpa (PDF)'}
                    </span>
                    <span className="text-[9px] text-emerald-100 font-normal">
                      {exportWithGuides ? 'PDF técnico com linhas de corte e furos' : 'PDF 300 DPI perfeito para impressão sem marcas técnicas'}
                    </span>
                  </div>
                </div>
                <Download className="w-4 h-4" />
              </button>

              <button
                onClick={() => onExportCoverPdf('mask_k100', { includeGuides: false })}
                className="w-full p-3 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-98 flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <div className="text-left">
                    <span className="block font-black">Máscara K100 (Hot Stamping)</span>
                    <span className="text-[9px] text-slate-300 font-normal">PDF Preto Puro para Foil e Verniz UV (sempre limpo)</span>
                  </div>
                </div>
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Rodapé do Painel com Botão de Mockup */}
      <div className="p-2.5 border-t border-[#eedad5] bg-[#faf5f3] flex items-center justify-between gap-1">
        <span className="text-[9px] text-slate-500 font-medium truncate">Gabarito Milimétrico Ativo</span>
        <button
          onClick={onOpenMockupStudio}
          className="px-2.5 py-1 bg-[#b84a56] hover:bg-[#a23d48] text-white rounded-xl text-[11px] font-bold transition-all cursor-pointer shadow-xs active:scale-95 flex items-center gap-1 shrink-0"
        >
          <Box className="w-3.5 h-3.5" />
          <span>Ver Mockup 3D</span>
        </button>
      </div>
    </div>
  );
};
