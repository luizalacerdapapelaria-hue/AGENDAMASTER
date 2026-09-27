import React, { useState, useEffect } from 'react';
import {
  Palette,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Plus,
  Trash2,
  Check,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Link2,
  Unlink,
  MousePointerClick,
  RotateCcw,
  X,
  ArrowUpToLine,
  AlignCenterVertical,
  ArrowDownToLine,
  Italic,
  Columns,
} from 'lucide-react';
import {
  AgendaConfig,
  CharacterStylePreset,
  ColorStylePreset,
  LayoutElement,
  ParagraphStylePreset,
  ProjectStylesConfig,
} from '../../../types';
import {
  applyCharacterStyleToElement,
  applyColorStyleToElement,
  applyParagraphStyleToElement,
  countStyleUsageInConfig,
  getProjectStyles,
  linkElementsByMatchingHexInConfig,
  propagateStylesAcrossConfig,
} from '../../../core/logic/styleSystem';

export type StyleTabType = 'color' | 'character' | 'paragraph';

interface StylesManagerPanelProps {
  config: AgendaConfig;
  selectedElements: LayoutElement[];
  activePageElements: LayoutElement[];
  availableFonts: string[];
  systemFonts: string[];
  customFonts: string[];
  initialTab?: StyleTabType;
  onUpdateConfig: (updater: (prev: AgendaConfig) => AgendaConfig) => void;
  onUpdateSelectedElements: (updater: (el: LayoutElement) => LayoutElement) => void;
  onSelectElementIds: (ids: string[]) => void;
  onClose: () => void;
  onToast?: (msg: string) => void;
  onHeaderPointerDown?: (e: React.PointerEvent) => void;
}

export const StylesManagerPanel: React.FC<StylesManagerPanelProps> = ({
  config,
  selectedElements,
  activePageElements,
  availableFonts,
  systemFonts,
  customFonts,
  initialTab = 'color',
  onUpdateConfig,
  onUpdateSelectedElements,
  onSelectElementIds,
  onClose,
  onToast,
  onHeaderPointerDown,
}) => {
  const [activeTab, setActiveTab] = useState<StyleTabType>(initialTab);
  const [expandedCharId, setExpandedCharId] = useState<string | null>(null);
  const [expandedParaId, setExpandedParaId] = useState<string | null>(null);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const projectStyles = getProjectStyles(config);
  const { colorCounts, characterCounts, paragraphCounts } = countStyleUsageInConfig(config);
  const primarySelected = selectedElements[0] || null;

  const updateStylesAndPropagate = (nextStyles: ProjectStylesConfig) => {
    onUpdateConfig(prev => propagateStylesAcrossConfig(prev, nextStyles));
  };

  // ==================== COLOR STYLES HANDLERS ====================
  const handleColorChange = (id: string, newHex: string) => {
    const nextColors = projectStyles.colorStyles.map(c =>
      c.id === id ? { ...c, color: newHex } : c
    );
    updateStylesAndPropagate({
      ...projectStyles,
      colorStyles: nextColors,
    });
  };

  const handleColorNameChange = (id: string, newName: string) => {
    const nextColors = projectStyles.colorStyles.map(c =>
      c.id === id ? { ...c, name: newName } : c
    );
    onUpdateConfig(prev => ({
      ...prev,
      styles: {
        ...projectStyles,
        colorStyles: nextColors,
      },
    }));
  };

  const handleAddColorStyle = (fromSelection = false) => {
    const baseHex = fromSelection && primarySelected
      ? (primarySelected.style.color || primarySelected.style.backgroundColor || primarySelected.style.borderColor || '#4f46e5')
      : '#6366f1';
    const newStyle: ColorStylePreset = {
      id: 'col_' + Math.random().toString(36).substring(2, 9),
      name: fromSelection && primarySelected
        ? `Cor de ${primarySelected.name || primarySelected.type}`
        : `Cor ${projectStyles.colorStyles.length + 1}`,
      color: baseHex,
    };

    const nextStyles: ProjectStylesConfig = {
      ...projectStyles,
      colorStyles: [...projectStyles.colorStyles, newStyle],
    };

    onUpdateConfig(prev => ({
      ...prev,
      styles: nextStyles,
    }));

    if (fromSelection && selectedElements.length > 0) {
      onUpdateSelectedElements(el => applyColorStyleToElement(el, newStyle, 'color'));
      onToast?.(`Estilo "${newStyle.name}" criado e vinculado à seleção!`);
    }
  };

  const handleDeleteColorStyle = (id: string) => {
    const nextStyles: ProjectStylesConfig = {
      ...projectStyles,
      colorStyles: projectStyles.colorStyles.filter(c => c.id !== id),
      characterStyles: projectStyles.characterStyles.map(ch =>
        ch.colorStyleId === id ? { ...ch, colorStyleId: undefined } : ch
      ),
    };
    onUpdateConfig(prev => ({
      ...prev,
      styles: nextStyles,
    }));
  };

  const handleApplyColorStyle = (colorStyle: ColorStylePreset, role: 'color' | 'fill' | 'border') => {
    if (selectedElements.length === 0) {
      onToast?.('Selecione um ou mais elementos na página para aplicar este estilo de cor.');
      return;
    }
    onUpdateSelectedElements(el => applyColorStyleToElement(el, colorStyle, role));
    const roleLabel = role === 'color' ? 'Texto / Principal' : role === 'fill' ? 'Fundo' : 'Borda / Linha';
    onToast?.(`Estilo "${colorStyle.name}" aplicado (${roleLabel}) em ${selectedElements.length} elemento(s)!`);
  };

  const handleLinkSameHexAcrossProject = (colorStyle: ColorStylePreset) => {
    onUpdateConfig(prev => {
      const { updatedConfig, linkedCount } = linkElementsByMatchingHexInConfig(
        prev,
        colorStyle.color,
        colorStyle
      );
      setTimeout(() => {
        onToast?.(
          linkedCount > 0
            ? `${linkedCount} elemento(s) com a cor ${colorStyle.color.toUpperCase()} foram vinculados ao estilo "${colorStyle.name}"!`
            : `Nenhum elemento encontrado com a cor exata ${colorStyle.color.toUpperCase()}.`
        );
      }, 10);
      return updatedConfig;
    });
  };

  const handleSelectLinkedOnPage = (
    type: 'color' | 'character' | 'paragraph',
    styleId: string
  ) => {
    const matchingIds = activePageElements
      .filter(el => {
        if (type === 'color') {
          return (
            el.style.colorStyleId === styleId ||
            el.style.fillColorStyleId === styleId ||
            el.style.borderColorStyleId === styleId
          );
        }
        if (type === 'character') return el.style.characterStyleId === styleId;
        if (type === 'paragraph') return el.style.paragraphStyleId === styleId;
        return false;
      })
      .map(el => el.id);

    if (matchingIds.length > 0) {
      onSelectElementIds(matchingIds);
      onToast?.(`${matchingIds.length} elemento(s) selecionado(s) nesta página.`);
    } else {
      onToast?.('Nenhum elemento nesta página atual está usando este estilo.');
    }
  };

  // ==================== CHARACTER STYLES HANDLERS ====================
  const handleUpdateCharacterStyle = (id: string, updates: Partial<CharacterStylePreset>) => {
    const nextChars = projectStyles.characterStyles.map(ch =>
      ch.id === id ? { ...ch, ...updates } : ch
    );
    updateStylesAndPropagate({
      ...projectStyles,
      characterStyles: nextChars,
    });
  };

  const handleAddCharacterStyle = (fromSelection = false) => {
    const s = primarySelected?.style || {};
    const tStyle = s.table?.textStyle || {};
    const newChar: CharacterStylePreset = {
      id: 'ch_' + Math.random().toString(36).substring(2, 9),
      name: fromSelection && primarySelected
        ? `Caractere - ${primarySelected.name || primarySelected.type}`
        : `Estilo de Caractere ${projectStyles.characterStyles.length + 1}`,
      fontFamily: s.fontFamily || tStyle.fontFamily || 'Inter',
      fontSize: s.fontSize || tStyle.fontSize || 12,
      fontWeight: s.fontWeight || tStyle.fontWeight || 'normal',
      fontStyle: s.fontStyle || tStyle.fontStyle || 'normal',
      letterSpacing: s.letterSpacing ?? tStyle.letterSpacing ?? 0,
      textTransform: s.textTransform || tStyle.textTransform || 'none',
      colorStyleId: s.colorStyleId,
      color: s.colorStyleId ? undefined : (s.color || tStyle.color || '#1f2937'),
    };

    const nextStyles: ProjectStylesConfig = {
      ...projectStyles,
      characterStyles: [...projectStyles.characterStyles, newChar],
    };

    onUpdateConfig(prev => ({
      ...prev,
      styles: nextStyles,
    }));
    setExpandedCharId(newChar.id);

    if (fromSelection && selectedElements.length > 0) {
      onUpdateSelectedElements(el =>
        applyCharacterStyleToElement(el, newChar, nextStyles.colorStyles)
      );
      onToast?.(`Estilo de caractere "${newChar.name}" criado e vinculado!`);
    }
  };

  const handleRedefineCharFromSelection = (charStyle: CharacterStylePreset) => {
    if (!primarySelected) return;
    const s = primarySelected.style;
    const tStyle = s.table?.textStyle || {};
    handleUpdateCharacterStyle(charStyle.id, {
      fontFamily: s.fontFamily || tStyle.fontFamily || charStyle.fontFamily,
      fontSize: s.fontSize || tStyle.fontSize || charStyle.fontSize,
      fontWeight: s.fontWeight || tStyle.fontWeight || charStyle.fontWeight,
      fontStyle: s.fontStyle || tStyle.fontStyle || charStyle.fontStyle,
      letterSpacing: s.letterSpacing ?? tStyle.letterSpacing ?? charStyle.letterSpacing,
      textTransform: s.textTransform || tStyle.textTransform || charStyle.textTransform,
      colorStyleId: s.colorStyleId,
      color: s.colorStyleId ? undefined : (s.color || tStyle.color || charStyle.color),
    });
    onToast?.(`Estilo "${charStyle.name}" atualizado com a formatação da seleção!`);
  };

  const handleDeleteCharacterStyle = (id: string) => {
    const nextStyles: ProjectStylesConfig = {
      ...projectStyles,
      characterStyles: projectStyles.characterStyles.filter(c => c.id !== id),
      paragraphStyles: projectStyles.paragraphStyles.map(p =>
        p.characterStyleId === id ? { ...p, characterStyleId: undefined } : p
      ),
    };
    onUpdateConfig(prev => ({
      ...prev,
      styles: nextStyles,
    }));
  };

  const handleApplyCharacterStyle = (charStyle: CharacterStylePreset) => {
    if (selectedElements.length === 0) {
      onToast?.('Selecione um ou mais elementos para aplicar o estilo de caractere.');
      return;
    }
    onUpdateSelectedElements(el =>
      applyCharacterStyleToElement(el, charStyle, projectStyles.colorStyles)
    );
    onToast?.(`Estilo de caractere "${charStyle.name}" aplicado a ${selectedElements.length} elemento(s)!`);
  };

  // ==================== PARAGRAPH STYLES HANDLERS ====================
  const handleUpdateParagraphStyle = (id: string, updates: Partial<ParagraphStylePreset>) => {
    const nextParas = projectStyles.paragraphStyles.map(p =>
      p.id === id ? { ...p, ...updates } : p
    );
    updateStylesAndPropagate({
      ...projectStyles,
      paragraphStyles: nextParas,
    });
  };

  const handleAddParagraphStyle = (fromSelection = false) => {
    const s = primarySelected?.style || {};
    const tStyle = s.table?.textStyle || {};
    const newPara: ParagraphStylePreset = {
      id: 'para_' + Math.random().toString(36).substring(2, 9),
      name: fromSelection && primarySelected
        ? `Parágrafo - ${primarySelected.name || primarySelected.type}`
        : `Estilo de Parágrafo ${projectStyles.paragraphStyles.length + 1}`,
      textAlign: s.textAlign || tStyle.textAlign || 'left',
      verticalAlign: s.verticalAlign || tStyle.verticalAlign || 'top',
      lineHeight: s.lineHeight || tStyle.lineHeight || 1.4,
      textWrap: tStyle.textWrap || 'wrap',
      cellPadding: s.cellPadding ?? tStyle.cellPadding ?? 4,
      columnCount: s.columnCount || 1,
      columnGap: typeof s.columnGap === 'number' ? s.columnGap : 24,
      characterStyleId: s.characterStyleId,
    };

    const nextStyles: ProjectStylesConfig = {
      ...projectStyles,
      paragraphStyles: [...projectStyles.paragraphStyles, newPara],
    };

    onUpdateConfig(prev => ({
      ...prev,
      styles: nextStyles,
    }));
    setExpandedParaId(newPara.id);

    if (fromSelection && selectedElements.length > 0) {
      onUpdateSelectedElements(el =>
        applyParagraphStyleToElement(
          el,
          newPara,
          nextStyles.characterStyles,
          nextStyles.colorStyles
        )
      );
      onToast?.(`Estilo de parágrafo "${newPara.name}" criado e vinculado!`);
    }
  };

  const handleRedefineParaFromSelection = (paraStyle: ParagraphStylePreset) => {
    if (!primarySelected) return;
    const s = primarySelected.style;
    const tStyle = s.table?.textStyle || {};
    handleUpdateParagraphStyle(paraStyle.id, {
      textAlign: s.textAlign || tStyle.textAlign || paraStyle.textAlign,
      verticalAlign: s.verticalAlign || tStyle.verticalAlign || paraStyle.verticalAlign,
      lineHeight: s.lineHeight || tStyle.lineHeight || paraStyle.lineHeight,
      textWrap: tStyle.textWrap || paraStyle.textWrap,
      cellPadding: s.cellPadding ?? tStyle.cellPadding ?? paraStyle.cellPadding,
      columnCount: s.columnCount ?? paraStyle.columnCount,
      columnGap: typeof s.columnGap === 'number' ? s.columnGap : paraStyle.columnGap,
      characterStyleId: s.characterStyleId ?? paraStyle.characterStyleId,
    });
    onToast?.(`Estilo "${paraStyle.name}" atualizado com o parágrafo da seleção!`);
  };

  const handleDeleteParagraphStyle = (id: string) => {
    const nextStyles: ProjectStylesConfig = {
      ...projectStyles,
      paragraphStyles: projectStyles.paragraphStyles.filter(p => p.id !== id),
    };
    onUpdateConfig(prev => ({
      ...prev,
      styles: nextStyles,
    }));
  };

  const handleApplyParagraphStyle = (paraStyle: ParagraphStylePreset) => {
    if (selectedElements.length === 0) {
      onToast?.('Selecione um ou mais elementos para aplicar o estilo de parágrafo.');
      return;
    }
    onUpdateSelectedElements(el =>
      applyParagraphStyleToElement(
        el,
        paraStyle,
        projectStyles.characterStyles,
        projectStyles.colorStyles
      )
    );
    onToast?.(`Estilo de parágrafo "${paraStyle.name}" aplicado a ${selectedElements.length} elemento(s)!`);
  };

  return (
    <div className="flex flex-col h-full bg-white text-gray-800 select-none">
      {/* Header */}
      <div
        onPointerDown={onHeaderPointerDown}
        title={onHeaderPointerDown ? 'Arraste pelo cabeçalho para mover a janela' : undefined}
        className={`flex items-center justify-between px-3.5 py-2.5 border-b border-gray-100 bg-gradient-to-r from-indigo-50/80 via-purple-50/50 to-white shrink-0 ${
          onHeaderPointerDown ? 'cursor-move touch-none' : ''
        }`}
      >
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-600 text-white shadow-2xs">
            <Palette className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-indigo-950 leading-none">
              Estilos Globais
            </h3>
            <p className="text-[9px] text-indigo-600 font-semibold mt-0.5">
              Edite uma vez, atualize todo o projeto
            </p>
          </div>
        </div>
        <button
          type="button"
          onPointerDown={e => e.stopPropagation()}
          onClick={onClose}
          className="p-1 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
          title="Fechar Painel de Estilos"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Category Tabs */}
      <div className="grid grid-cols-3 gap-1 p-1.5 bg-gray-100/80 border-b border-gray-200 shrink-0">
        <button
          type="button"
          onClick={() => setActiveTab('color')}
          className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-[10px] font-black uppercase tracking-tight transition-all cursor-pointer ${
            activeTab === 'color'
              ? 'bg-white text-indigo-700 shadow-xs ring-1 ring-indigo-100'
              : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
          }`}
        >
          <Palette className="w-3.5 h-3.5 text-indigo-600" />
          <span>Cores ({projectStyles.colorStyles.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('character')}
          className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-[10px] font-black uppercase tracking-tight transition-all cursor-pointer ${
            activeTab === 'character'
              ? 'bg-white text-indigo-700 shadow-xs ring-1 ring-indigo-100'
              : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
          }`}
        >
          <Type className="w-3.5 h-3.5 text-purple-600" />
          <span>Caractere ({projectStyles.characterStyles.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('paragraph')}
          className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-[10px] font-black uppercase tracking-tight transition-all cursor-pointer ${
            activeTab === 'paragraph'
              ? 'bg-white text-indigo-700 shadow-xs ring-1 ring-indigo-100'
              : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
          }`}
        >
          <AlignLeft className="w-3.5 h-3.5 text-emerald-600" />
          <span>Parágrafo ({projectStyles.paragraphStyles.length})</span>
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
        {/* ==================== TAB 1: CORES ==================== */}
        {activeTab === 'color' && (
          <div className="space-y-3">
            <div className="p-2.5 bg-indigo-50/60 border border-indigo-100 rounded-xl text-[10px] text-indigo-950 leading-relaxed">
              <strong>Como funciona:</strong> Aplique um estilo de cor ao{' '}
              <span className="underline decoration-indigo-400 font-bold">Texto/Cor</span>,{' '}
              <span className="underline decoration-indigo-400 font-bold">Fundo</span> ou{' '}
              <span className="underline decoration-indigo-400 font-bold">Borda</span> de qualquer
              objeto. Quando você trocar a cor aqui, todos os elementos vinculados mudam juntos!
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleAddColorStyle(false)}
                className="flex-1 py-1.5 px-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 shadow-2xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nova Cor</span>
              </button>
              {primarySelected && (
                <button
                  type="button"
                  onClick={() => handleAddColorStyle(true)}
                  className="flex-1 py-1.5 px-2.5 bg-white hover:bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 shadow-2xs transition-colors cursor-pointer"
                  title="Cria um novo estilo de cor com a cor do elemento selecionado e já o vincula"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Da Seleção</span>
                </button>
              )}
            </div>

            <div className="space-y-2">
              {projectStyles.colorStyles.map(cStyle => {
                const count = colorCounts[cStyle.id] || 0;
                const isSelectedColor = primarySelected?.style?.colorStyleId === cStyle.id;
                const isSelectedFill = primarySelected?.style?.fillColorStyleId === cStyle.id;
                const isSelectedBorder = primarySelected?.style?.borderColorStyleId === cStyle.id;

                return (
                  <div
                    key={cStyle.id}
                    className={`p-2.5 rounded-xl border transition-all ${
                      isSelectedColor || isSelectedFill || isSelectedBorder
                        ? 'bg-indigo-50/40 border-indigo-300 ring-1 ring-indigo-200'
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <label
                        className="relative w-8 h-8 rounded-lg border-2 border-white shadow-sm ring-1 ring-gray-300 overflow-hidden shrink-0 cursor-pointer group"
                        title="Clique para trocar esta cor em todo o projeto"
                      >
                        <input
                          type="color"
                          value={cStyle.color.startsWith('#') ? cStyle.color : '#4f46e5'}
                          onChange={e => handleColorChange(cStyle.id, e.target.value)}
                          className="absolute inset-0 w-12 h-12 -top-2 -left-2 cursor-pointer opacity-0"
                        />
                        <div
                          className="w-full h-full"
                          style={{ backgroundColor: cStyle.color }}
                        />
                      </label>

                      <div className="flex-1 min-w-0">
                        <input
                          type="text"
                          value={cStyle.name}
                          onChange={e => handleColorNameChange(cStyle.id, e.target.value)}
                          className="w-full text-xs font-bold text-gray-900 bg-transparent border-b border-transparent hover:border-gray-200 focus:border-indigo-500 focus:bg-white px-1 py-0.5 rounded outline-none truncate"
                          placeholder="Nome da cor..."
                        />
                        <div className="flex items-center gap-2 mt-0.5 px-1">
                          <input
                            type="text"
                            value={cStyle.color}
                            onChange={e => handleColorChange(cStyle.id, e.target.value)}
                            className="w-16 text-[10px] font-mono text-gray-500 uppercase bg-gray-50 border border-gray-200 rounded px-1 py-0.2"
                          />
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                              count > 0
                                ? 'bg-indigo-100 text-indigo-800'
                                : 'bg-gray-100 text-gray-400'
                            }`}
                          >
                            {count} {count === 1 ? ' vínculo' : ' vínculos'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-0.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleLinkSameHexAcrossProject(cStyle)}
                          className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                          title="Vincular automaticamente todos os elementos do projeto que já possuem esta mesma cor hexadecimal"
                        >
                          <Link2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSelectLinkedOnPage('color', cStyle.id)}
                          className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                          title="Selecionar elementos nesta página que usam esta cor"
                        >
                          <MousePointerClick className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteColorStyle(cStyle.id)}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Excluir estilo de cor"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Quick apply buttons */}
                    <div className="grid grid-cols-3 gap-1 mt-2 pt-2 border-t border-gray-100">
                      <button
                        type="button"
                        onClick={() => handleApplyColorStyle(cStyle, 'color')}
                        className={`py-1 px-1.5 rounded text-[9.5px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                          isSelectedColor
                            ? 'bg-indigo-600 text-white shadow-2xs'
                            : 'bg-gray-50 hover:bg-indigo-50 text-gray-700 hover:text-indigo-700 border border-gray-200/80'
                        }`}
                        title="Aplicar e vincular à Cor do Texto / Linhas / Ícone do elemento selecionado"
                      >
                        {isSelectedColor && <Check className="w-2.5 h-2.5" />}
                        <span>Texto / Cor</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApplyColorStyle(cStyle, 'fill')}
                        className={`py-1 px-1.5 rounded text-[9.5px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                          isSelectedFill
                            ? 'bg-indigo-600 text-white shadow-2xs'
                            : 'bg-gray-50 hover:bg-indigo-50 text-gray-700 hover:text-indigo-700 border border-gray-200/80'
                        }`}
                        title="Aplicar e vincular ao Fundo / Preenchimento do elemento selecionado"
                      >
                        {isSelectedFill && <Check className="w-2.5 h-2.5" />}
                        <span>Fundo</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApplyColorStyle(cStyle, 'border')}
                        className={`py-1 px-1.5 rounded text-[9.5px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                          isSelectedBorder
                            ? 'bg-indigo-600 text-white shadow-2xs'
                            : 'bg-gray-50 hover:bg-indigo-50 text-gray-700 hover:text-indigo-700 border border-gray-200/80'
                        }`}
                        title="Aplicar e vincular à Borda / Grade do elemento selecionado"
                      >
                        {isSelectedBorder && <Check className="w-2.5 h-2.5" />}
                        <span>Borda</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ==================== TAB 2: CARACTERE ==================== */}
        {activeTab === 'character' && (
          <div className="space-y-3">
            <div className="p-2.5 bg-purple-50/60 border border-purple-100 rounded-xl text-[10px] text-purple-950 leading-relaxed">
              <strong>Estilos de Caractere:</strong> Padronize família de fonte, tamanho, peso,
              itálico, espaçamento entre letras e cor. Ao alterar o estilo, todos os textos
              vinculados são atualizados!
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleAddCharacterStyle(false)}
                className="flex-1 py-1.5 px-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 shadow-2xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Novo Caractere</span>
              </button>
              {primarySelected && (
                <button
                  type="button"
                  onClick={() => handleAddCharacterStyle(true)}
                  className="flex-1 py-1.5 px-2.5 bg-white hover:bg-purple-50 text-purple-700 border border-purple-200 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 shadow-2xs transition-colors cursor-pointer"
                  title="Cria um estilo de caractere a partir da formatação do elemento selecionado"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Da Seleção</span>
                </button>
              )}
            </div>

            <div className="space-y-2">
              {projectStyles.characterStyles.map(chStyle => {
                const count = characterCounts[chStyle.id] || 0;
                const isApplied = primarySelected?.style?.characterStyleId === chStyle.id;
                const isExpanded = expandedCharId === chStyle.id;
                const linkedColorObj = chStyle.colorStyleId
                  ? projectStyles.colorStyles.find(c => c.id === chStyle.colorStyleId)
                  : undefined;
                const previewColor = linkedColorObj?.color || chStyle.color || '#1f2937';

                return (
                  <div
                    key={chStyle.id}
                    className={`rounded-xl border transition-all overflow-hidden ${
                      isApplied
                        ? 'bg-purple-50/30 border-purple-300 ring-1 ring-purple-200'
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="p-2.5 flex items-center justify-between gap-2">
                      <div
                        className="flex-1 min-w-0 cursor-pointer"
                        onClick={() => setExpandedCharId(isExpanded ? null : chStyle.id)}
                      >
                        <div className="flex items-center gap-1.5">
                          <span
                            className="text-xs truncate block"
                            style={{
                              fontFamily: chStyle.fontFamily || 'Inter',
                              fontWeight: (chStyle.fontWeight as any) || 'normal',
                              fontStyle: chStyle.fontStyle || 'normal',
                              textTransform: (chStyle.textTransform as any) || 'none',
                              color: previewColor,
                            }}
                          >
                            {chStyle.name}
                          </span>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full shrink-0 ${
                              count > 0
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-gray-100 text-gray-400'
                            }`}
                          >
                            {count}
                          </span>
                        </div>
                        <div className="text-[9.5px] text-gray-500 truncate mt-0.5">
                          {chStyle.fontFamily || 'Inter'} • {chStyle.fontSize || 12}pt •{' '}
                          {chStyle.fontWeight === 'bold'
                            ? 'Bold'
                            : chStyle.fontWeight === '300'
                            ? 'Light'
                            : chStyle.fontWeight === '900'
                            ? 'Black'
                            : 'Regular'}
                          {chStyle.fontStyle === 'italic' ? ' • Itálico' : ''}
                          {linkedColorObj ? ` • 🎨 ${linkedColorObj.name}` : ''}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleApplyCharacterStyle(chStyle)}
                          className={`py-1 px-2.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                            isApplied
                              ? 'bg-purple-600 text-white shadow-2xs'
                              : 'bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200'
                          }`}
                        >
                          {isApplied && <Check className="w-3 h-3" />}
                          <span>{isApplied ? 'Aplicado' : 'Aplicar'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setExpandedCharId(isExpanded ? null : chStyle.id)}
                          className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg cursor-pointer"
                          title="Editar propriedades deste Estilo de Caractere"
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="p-3 bg-gray-50/80 border-t border-gray-100 space-y-2.5 text-xs">
                        <div>
                          <label className="block text-[9.5px] font-bold text-gray-500 uppercase mb-1">
                            Nome do Estilo
                          </label>
                          <input
                            type="text"
                            value={chStyle.name}
                            onChange={e =>
                              handleUpdateCharacterStyle(chStyle.id, { name: e.target.value })
                            }
                            className="w-full text-xs p-1.5 bg-white border border-gray-200 rounded-lg font-bold"
                          />
                        </div>

                        <div>
                          <label className="block text-[9.5px] font-bold text-gray-500 uppercase mb-1">
                            Fonte
                          </label>
                          <select
                            value={chStyle.fontFamily || 'Inter'}
                            onChange={e =>
                              handleUpdateCharacterStyle(chStyle.id, { fontFamily: e.target.value })
                            }
                            className="w-full text-xs p-1.5 bg-white border border-gray-200 rounded-lg"
                          >
                            <optgroup label="Fontes Padrão">
                              {availableFonts.map(f => (
                                <option key={f} value={f} style={{ fontFamily: f }}>
                                  {f}
                                </option>
                              ))}
                            </optgroup>
                            {systemFonts.length > 0 && (
                              <optgroup label="Fontes do Computador">
                                {systemFonts.map(f => (
                                  <option key={f} value={f} style={{ fontFamily: f }}>
                                    {f}
                                  </option>
                                ))}
                              </optgroup>
                            )}
                            {customFonts.length > 0 && (
                              <optgroup label="Minhas Fontes">
                                {customFonts.map(f => (
                                  <option key={f} value={f} style={{ fontFamily: f }}>
                                    {f}
                                  </option>
                                ))}
                              </optgroup>
                            )}
                          </select>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <label className="block text-[9.5px] font-bold text-gray-500 uppercase mb-1">
                              Tamanho
                            </label>
                            <input
                              type="number"
                              step="0.5"
                              min="3"
                              max="120"
                              value={chStyle.fontSize || 12}
                              onChange={e =>
                                handleUpdateCharacterStyle(chStyle.id, {
                                  fontSize: parseFloat(e.target.value) || 12,
                                })
                              }
                              className="w-full text-xs p-1.5 bg-white border border-gray-200 rounded-lg font-bold text-center"
                            />
                          </div>
                          <div>
                            <label className="block text-[9.5px] font-bold text-gray-500 uppercase mb-1">
                              Peso
                            </label>
                            <select
                              value={chStyle.fontWeight || 'normal'}
                              onChange={e =>
                                handleUpdateCharacterStyle(chStyle.id, {
                                  fontWeight: e.target.value,
                                })
                              }
                              className="w-full text-xs p-1.5 bg-white border border-gray-200 rounded-lg"
                            >
                              <option value="normal">Normal</option>
                              <option value="bold">Bold</option>
                              <option value="300">Light</option>
                              <option value="900">Black</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[9.5px] font-bold text-gray-500 uppercase mb-1">
                              Tracking
                            </label>
                            <input
                              type="number"
                              step="0.5"
                              value={chStyle.letterSpacing ?? 0}
                              onChange={e =>
                                handleUpdateCharacterStyle(chStyle.id, {
                                  letterSpacing: parseFloat(e.target.value) || 0,
                                })
                              }
                              className="w-full text-xs p-1.5 bg-white border border-gray-200 rounded-lg text-center"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[9.5px] font-bold text-gray-500 uppercase mb-1">
                              Estilo / Itálico
                            </label>
                            <button
                              type="button"
                              onClick={() =>
                                handleUpdateCharacterStyle(chStyle.id, {
                                  fontStyle: chStyle.fontStyle === 'italic' ? 'normal' : 'italic',
                                })
                              }
                              className={`w-full py-1.5 px-2 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer ${
                                chStyle.fontStyle === 'italic'
                                  ? 'bg-purple-600 text-white border-purple-600'
                                  : 'bg-white text-gray-700 border-gray-200'
                              }`}
                            >
                              <Italic className="w-3.5 h-3.5" />
                              <span>{chStyle.fontStyle === 'italic' ? 'Itálico Ativo' : 'Normal'}</span>
                            </button>
                          </div>

                          <div>
                            <label className="block text-[9.5px] font-bold text-gray-500 uppercase mb-1">
                              Caixa (Maiúsc./Minúsc.)
                            </label>
                            <select
                              value={chStyle.textTransform || 'none'}
                              onChange={e =>
                                handleUpdateCharacterStyle(chStyle.id, {
                                  textTransform: e.target.value as any,
                                })
                              }
                              className="w-full text-xs p-1.5 bg-white border border-gray-200 rounded-lg"
                            >
                              <option value="none">Normal (Original)</option>
                              <option value="uppercase">MAIÚSCULAS</option>
                              <option value="lowercase">minúsculas</option>
                              <option value="capitalize">Iniciais Maiúsculas</option>
                              <option value="sentence">Primeira da frase</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[9.5px] font-bold text-gray-500 uppercase mb-1">
                            Cor do Caractere (Vinculada ou Fixa)
                          </label>
                          <div className="flex items-center gap-1.5">
                            <select
                              value={chStyle.colorStyleId || '__custom__'}
                              onChange={e => {
                                const val = e.target.value;
                                if (val === '__custom__') {
                                  handleUpdateCharacterStyle(chStyle.id, {
                                    colorStyleId: undefined,
                                    color: previewColor,
                                  });
                                } else if (val === '__none__') {
                                  handleUpdateCharacterStyle(chStyle.id, {
                                    colorStyleId: undefined,
                                    color: undefined,
                                  });
                                } else {
                                  handleUpdateCharacterStyle(chStyle.id, {
                                    colorStyleId: val,
                                  });
                                }
                              }}
                              className="flex-1 text-xs p-1.5 bg-white border border-gray-200 rounded-lg"
                            >
                              <option value="__none__">Não alterar cor do elemento</option>
                              <option value="__custom__">Cor personalizada fixa</option>
                              <optgroup label="Estilos de Cor do Projeto">
                                {projectStyles.colorStyles.map(cs => (
                                  <option key={cs.id} value={cs.id}>
                                    🎨 {cs.name} ({cs.color})
                                  </option>
                                ))}
                              </optgroup>
                            </select>
                            {!chStyle.colorStyleId && chStyle.color && (
                              <input
                                type="color"
                                value={chStyle.color.startsWith('#') ? chStyle.color : '#1f2937'}
                                onChange={e =>
                                  handleUpdateCharacterStyle(chStyle.id, {
                                    color: e.target.value,
                                  })
                                }
                                className="w-8 h-8 p-0.5 bg-white border border-gray-200 rounded-lg cursor-pointer shrink-0"
                              />
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-gray-200/80 gap-1.5">
                          {primarySelected && (
                            <button
                              type="button"
                              onClick={() => handleRedefineCharFromSelection(chStyle)}
                              className="flex-1 py-1.5 px-2 bg-white hover:bg-purple-50 text-purple-700 border border-purple-200 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 cursor-pointer"
                              title="Atualiza este estilo com os dados do elemento selecionado atualmente"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>Redefinir c/ Seleção</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleSelectLinkedOnPage('character', chStyle.id)}
                            className="py-1.5 px-2 bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 cursor-pointer"
                            title="Selecionar todos os elementos com este estilo nesta página"
                          >
                            <MousePointerClick className="w-3 h-3" />
                            <span>Selecionar</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCharacterStyle(chStyle.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg border border-transparent hover:border-red-200 cursor-pointer"
                            title="Excluir estilo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ==================== TAB 3: PARÁGRAFO ==================== */}
        {activeTab === 'paragraph' && (
          <div className="space-y-3">
            <div className="p-2.5 bg-emerald-50/60 border border-emerald-100 rounded-xl text-[10px] text-emerald-950 leading-relaxed">
              <strong>Estilos de Parágrafo:</strong> Controle alinhamento horizontal/vertical,
              entrelinha, margens internas, colunas e vincule opcionalmente um Estilo de Caractere.
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleAddParagraphStyle(false)}
                className="flex-1 py-1.5 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 shadow-2xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Novo Parágrafo</span>
              </button>
              {primarySelected && (
                <button
                  type="button"
                  onClick={() => handleAddParagraphStyle(true)}
                  className="flex-1 py-1.5 px-2.5 bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 shadow-2xs transition-colors cursor-pointer"
                  title="Cria um estilo de parágrafo a partir do elemento selecionado"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Da Seleção</span>
                </button>
              )}
            </div>

            <div className="space-y-2">
              {projectStyles.paragraphStyles.map(pStyle => {
                const count = paragraphCounts[pStyle.id] || 0;
                const isApplied = primarySelected?.style?.paragraphStyleId === pStyle.id;
                const isExpanded = expandedParaId === pStyle.id;
                const linkedChar = pStyle.characterStyleId
                  ? projectStyles.characterStyles.find(c => c.id === pStyle.characterStyleId)
                  : undefined;

                const alignLabel =
                  pStyle.textAlign === 'center'
                    ? 'Centro'
                    : pStyle.textAlign === 'right'
                    ? 'Direita'
                    : pStyle.textAlign === 'justify'
                    ? 'Justificado'
                    : 'Esquerda';

                return (
                  <div
                    key={pStyle.id}
                    className={`rounded-xl border transition-all overflow-hidden ${
                      isApplied
                        ? 'bg-emerald-50/30 border-emerald-300 ring-1 ring-emerald-200'
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="p-2.5 flex items-center justify-between gap-2">
                      <div
                        className="flex-1 min-w-0 cursor-pointer"
                        onClick={() => setExpandedParaId(isExpanded ? null : pStyle.id)}
                      >
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-gray-900 truncate block">
                            {pStyle.name}
                          </span>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full shrink-0 ${
                              count > 0
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-gray-100 text-gray-400'
                            }`}
                          >
                            {count}
                          </span>
                        </div>
                        <div className="text-[9.5px] text-gray-500 truncate mt-0.5">
                          {alignLabel} • Entrelinha {pStyle.lineHeight || 1.4}
                          {(pStyle.columnCount || 1) > 1 ? ` • ${pStyle.columnCount} Colunas` : ''}
                          {linkedChar ? ` • 🔤 ${linkedChar.name}` : ''}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleApplyParagraphStyle(pStyle)}
                          className={`py-1 px-2.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                            isApplied
                              ? 'bg-emerald-600 text-white shadow-2xs'
                              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          {isApplied && <Check className="w-3 h-3" />}
                          <span>{isApplied ? 'Aplicado' : 'Aplicar'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setExpandedParaId(isExpanded ? null : pStyle.id)}
                          className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg cursor-pointer"
                          title="Editar propriedades deste Estilo de Parágrafo"
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="p-3 bg-gray-50/80 border-t border-gray-100 space-y-2.5 text-xs">
                        <div>
                          <label className="block text-[9.5px] font-bold text-gray-500 uppercase mb-1">
                            Nome do Estilo de Parágrafo
                          </label>
                          <input
                            type="text"
                            value={pStyle.name}
                            onChange={e =>
                              handleUpdateParagraphStyle(pStyle.id, { name: e.target.value })
                            }
                            className="w-full text-xs p-1.5 bg-white border border-gray-200 rounded-lg font-bold"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[9.5px] font-bold text-gray-500 uppercase mb-1">
                              Alinhamento Horiz.
                            </label>
                            <div className="flex bg-white border border-gray-200 rounded-lg overflow-hidden divide-x divide-gray-100">
                              {(
                                [
                                  { id: 'left', icon: AlignLeft, title: 'Esquerda' },
                                  { id: 'center', icon: AlignCenter, title: 'Centro' },
                                  { id: 'right', icon: AlignRight, title: 'Direita' },
                                  { id: 'justify', icon: AlignJustify, title: 'Justificado' },
                                ] as const
                              ).map(item => {
                                const Icon = item.icon;
                                return (
                                  <button
                                    key={item.id}
                                    type="button"
                                    onClick={() =>
                                      handleUpdateParagraphStyle(pStyle.id, { textAlign: item.id })
                                    }
                                    className={`flex-1 p-1.5 cursor-pointer ${
                                      (pStyle.textAlign || 'left') === item.id
                                        ? 'bg-emerald-50 text-emerald-700 font-bold'
                                        : 'text-gray-500 hover:bg-gray-50'
                                    }`}
                                    title={item.title}
                                  >
                                    <Icon className="w-3.5 h-3.5 mx-auto" />
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          <div>
                            <label className="block text-[9.5px] font-bold text-gray-500 uppercase mb-1">
                              Alinhamento Vert.
                            </label>
                            <div className="flex bg-white border border-gray-200 rounded-lg overflow-hidden divide-x divide-gray-100">
                              {(
                                [
                                  { id: 'top', icon: ArrowUpToLine, title: 'Topo' },
                                  { id: 'middle', icon: AlignCenterVertical, title: 'Meio' },
                                  { id: 'bottom', icon: ArrowDownToLine, title: 'Base' },
                                ] as const
                              ).map(item => {
                                const Icon = item.icon;
                                return (
                                  <button
                                    key={item.id}
                                    type="button"
                                    onClick={() =>
                                      handleUpdateParagraphStyle(pStyle.id, {
                                        verticalAlign: item.id,
                                      })
                                    }
                                    className={`flex-1 p-1.5 cursor-pointer ${
                                      (pStyle.verticalAlign || 'top') === item.id
                                        ? 'bg-emerald-50 text-emerald-700 font-bold'
                                        : 'text-gray-500 hover:bg-gray-50'
                                    }`}
                                    title={item.title}
                                  >
                                    <Icon className="w-3.5 h-3.5 mx-auto" />
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <label className="block text-[9.5px] font-bold text-gray-500 uppercase mb-1">
                              Entrelinha
                            </label>
                            <input
                              type="number"
                              step="0.05"
                              min="0.6"
                              max="4"
                              value={pStyle.lineHeight ?? 1.4}
                              onChange={e =>
                                handleUpdateParagraphStyle(pStyle.id, {
                                  lineHeight: parseFloat(e.target.value) || 1.4,
                                })
                              }
                              className="w-full text-xs p-1.5 bg-white border border-gray-200 rounded-lg text-center font-bold"
                            />
                          </div>
                          <div>
                            <label className="block text-[9.5px] font-bold text-gray-500 uppercase mb-1">
                              Recuo (px)
                            </label>
                            <input
                              type="number"
                              step="1"
                              min="0"
                              max="40"
                              value={pStyle.cellPadding ?? 4}
                              onChange={e =>
                                handleUpdateParagraphStyle(pStyle.id, {
                                  cellPadding: parseInt(e.target.value) || 0,
                                })
                              }
                              className="w-full text-xs p-1.5 bg-white border border-gray-200 rounded-lg text-center"
                            />
                          </div>
                          <div>
                            <label className="block text-[9.5px] font-bold text-gray-500 uppercase mb-1">
                              Colunas
                            </label>
                            <select
                              value={pStyle.columnCount || 1}
                              onChange={e =>
                                handleUpdateParagraphStyle(pStyle.id, {
                                  columnCount: parseInt(e.target.value) || 1,
                                })
                              }
                              className="w-full text-xs p-1.5 bg-white border border-gray-200 rounded-lg"
                            >
                              <option value={1}>1 Col</option>
                              <option value={2}>2 Cols</option>
                              <option value={3}>3 Cols</option>
                              <option value={4}>4 Cols</option>
                            </select>
                          </div>
                        </div>

                        {(pStyle.columnCount || 1) > 1 && (
                          <div className="flex items-center justify-between bg-white p-2 rounded-lg border border-gray-200">
                            <span className="text-[10px] font-bold text-gray-600 flex items-center gap-1">
                              <Columns className="w-3 h-3 text-emerald-600" /> Espaço entre Colunas (px)
                            </span>
                            <input
                              type="number"
                              min="4"
                              max="100"
                              value={pStyle.columnGap ?? 24}
                              onChange={e =>
                                handleUpdateParagraphStyle(pStyle.id, {
                                  columnGap: parseInt(e.target.value) || 24,
                                })
                              }
                              className="w-16 text-xs p-1 border border-gray-200 rounded text-center font-bold"
                            />
                          </div>
                        )}

                        <div>
                          <label className="block text-[9.5px] font-bold text-gray-500 uppercase mb-1">
                            Estilo de Caractere Vinculado (Opcional)
                          </label>
                          <select
                            value={pStyle.characterStyleId || ''}
                            onChange={e =>
                              handleUpdateParagraphStyle(pStyle.id, {
                                characterStyleId: e.target.value || undefined,
                              })
                            }
                            className="w-full text-xs p-1.5 bg-white border border-gray-200 rounded-lg"
                          >
                            <option value="">Nenhum (Apenas formatação de parágrafo)</option>
                            {projectStyles.characterStyles.map(cs => (
                              <option key={cs.id} value={cs.id}>
                                🔤 {cs.name} ({cs.fontFamily}, {cs.fontSize}pt)
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-gray-200/80 gap-1.5">
                          {primarySelected && (
                            <button
                              type="button"
                              onClick={() => handleRedefineParaFromSelection(pStyle)}
                              className="flex-1 py-1.5 px-2 bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 cursor-pointer"
                              title="Atualiza este estilo de parágrafo com os dados do elemento selecionado"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>Redefinir c/ Seleção</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleSelectLinkedOnPage('paragraph', pStyle.id)}
                            className="py-1.5 px-2 bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 cursor-pointer"
                            title="Selecionar elementos com este estilo nesta página"
                          >
                            <MousePointerClick className="w-3 h-3" />
                            <span>Selecionar</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteParagraphStyle(pStyle.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg border border-transparent hover:border-red-200 cursor-pointer"
                            title="Excluir estilo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// COMPACT QUICK STYLES BAR FOR RIGHT PROPERTIES SIDEBAR ("AJUSTES")
// ============================================================================
interface ElementQuickStylesBarProps {
  config: AgendaConfig;
  selectedElement: LayoutElement;
  onApplyStyle: (updater: (el: LayoutElement) => LayoutElement) => void;
  onOpenStylesPanel: (tab: StyleTabType) => void;
}

export const ElementQuickStylesBar: React.FC<ElementQuickStylesBarProps> = ({
  config,
  selectedElement,
  onApplyStyle,
  onOpenStylesPanel,
}) => {
  const projectStyles = getProjectStyles(config);
  const s = selectedElement.style;

  const isTextCapable = [
    'text',
    'date_placeholder',
    'day_number',
    'day_name',
    'month_name',
    'month_number',
    'year',
    'quote',
    'verse',
    'holiday',
    'holiday_list',
    'table',
    'lines',
    'mini_calendar',
    'full_calendar',
    'planner_day_box',
    'permanent_day_header',
  ].includes(selectedElement.type);

  return (
    <div className="p-2.5 bg-gradient-to-br from-indigo-50/70 via-purple-50/40 to-white rounded-xl border border-indigo-200/80 space-y-2.5 shadow-2xs">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-black text-indigo-950 uppercase tracking-wider flex items-center gap-1.5">
          <Palette className="w-3.5 h-3.5 text-indigo-600" />
          Estilos Vinculados
        </span>
        <button
          type="button"
          onClick={() => onOpenStylesPanel('color')}
          className="text-[9px] font-bold text-indigo-600 hover:text-indigo-800 bg-white px-2 py-0.5 rounded-md border border-indigo-200 hover:bg-indigo-50 transition-colors cursor-pointer shadow-2xs"
        >
          Gerenciar Estilos
        </button>
      </div>

      {/* Color Swatches Row */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-bold text-gray-500 uppercase">
            Cor Principal / Texto
          </span>
          {s.colorStyleId && (
            <button
              type="button"
              onClick={() =>
                onApplyStyle(el => ({
                  ...el,
                  style: { ...el.style, colorStyleId: undefined },
                }))
              }
              className="text-[8.5px] text-gray-400 hover:text-red-500 flex items-center gap-0.5 cursor-pointer"
              title="Desvincular estilo de cor"
            >
              <Unlink className="w-2.5 h-2.5" /> Desvincular
            </button>
          )}
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {projectStyles.colorStyles.map(cs => {
            const active = s.colorStyleId === cs.id;
            return (
              <button
                key={cs.id}
                type="button"
                onClick={() => onApplyStyle(el => applyColorStyleToElement(el, cs, 'color'))}
                className={`group flex items-center gap-1 px-1.5 py-0.5 rounded-md border text-[9px] font-bold transition-all cursor-pointer ${
                  active
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs ring-1 ring-indigo-300'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-indigo-300'
                }`}
                title={`Vincular cor "${cs.name}" (${cs.color})`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full border border-black/15 shrink-0"
                  style={{ backgroundColor: cs.color }}
                />
                <span className="truncate max-w-[72px]">{cs.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Fill & Border Color Style Selectors */}
      <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-indigo-100/70">
        <div>
          <label className="block text-[8.5px] font-bold text-gray-500 uppercase mb-0.5">
            Estilo Cor de Fundo
          </label>
          <select
            value={s.fillColorStyleId || ''}
            onChange={e => {
              const id = e.target.value;
              if (!id) {
                onApplyStyle(el => ({
                  ...el,
                  style: { ...el.style, fillColorStyleId: undefined },
                }));
                return;
              }
              const cs = projectStyles.colorStyles.find(c => c.id === id);
              if (cs) onApplyStyle(el => applyColorStyleToElement(el, cs, 'fill'));
            }}
            className="w-full text-[10px] p-1 bg-white border border-gray-200 rounded-md font-medium"
          >
            <option value="">Sem vínculo</option>
            {projectStyles.colorStyles.map(cs => (
              <option key={cs.id} value={cs.id}>
                🎨 {cs.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[8.5px] font-bold text-gray-500 uppercase mb-0.5">
            Estilo Cor de Borda
          </label>
          <select
            value={s.borderColorStyleId || ''}
            onChange={e => {
              const id = e.target.value;
              if (!id) {
                onApplyStyle(el => ({
                  ...el,
                  style: { ...el.style, borderColorStyleId: undefined },
                }));
                return;
              }
              const cs = projectStyles.colorStyles.find(c => c.id === id);
              if (cs) onApplyStyle(el => applyColorStyleToElement(el, cs, 'border'));
            }}
            className="w-full text-[10px] p-1 bg-white border border-gray-200 rounded-md font-medium"
          >
            <option value="">Sem vínculo</option>
            {projectStyles.colorStyles.map(cs => (
              <option key={cs.id} value={cs.id}>
                🎨 {cs.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Character & Paragraph Style Selectors */}
      {isTextCapable && (
        <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-indigo-100/70">
          <div>
            <div className="flex items-center justify-between mb-0.5">
              <label className="text-[8.5px] font-bold text-purple-800 uppercase">
                Estilo Caractere
              </label>
              <button
                type="button"
                onClick={() => onOpenStylesPanel('character')}
                className="text-[8px] text-purple-600 hover:underline cursor-pointer font-bold"
              >
                Editar
              </button>
            </div>
            <select
              value={s.characterStyleId || ''}
              onChange={e => {
                const id = e.target.value;
                if (!id) {
                  onApplyStyle(el => ({
                    ...el,
                    style: { ...el.style, characterStyleId: undefined },
                  }));
                  return;
                }
                const ch = projectStyles.characterStyles.find(c => c.id === id);
                if (ch) {
                  onApplyStyle(el =>
                    applyCharacterStyleToElement(el, ch, projectStyles.colorStyles)
                  );
                }
              }}
              className="w-full text-[10px] p-1 bg-white border border-purple-200 rounded-md font-medium text-gray-800"
            >
              <option value="">Nenhum (Manual)</option>
              {projectStyles.characterStyles.map(ch => (
                <option key={ch.id} value={ch.id}>
                  🔤 {ch.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-0.5">
              <label className="text-[8.5px] font-bold text-emerald-800 uppercase">
                Estilo Parágrafo
              </label>
              <button
                type="button"
                onClick={() => onOpenStylesPanel('paragraph')}
                className="text-[8px] text-emerald-600 hover:underline cursor-pointer font-bold"
              >
                Editar
              </button>
            </div>
            <select
              value={s.paragraphStyleId || ''}
              onChange={e => {
                const id = e.target.value;
                if (!id) {
                  onApplyStyle(el => ({
                    ...el,
                    style: { ...el.style, paragraphStyleId: undefined },
                  }));
                  return;
                }
                const pa = projectStyles.paragraphStyles.find(p => p.id === id);
                if (pa) {
                  onApplyStyle(el =>
                    applyParagraphStyleToElement(
                      el,
                      pa,
                      projectStyles.characterStyles,
                      projectStyles.colorStyles
                    )
                  );
                }
              }}
              className="w-full text-[10px] p-1 bg-white border border-emerald-200 rounded-md font-medium text-gray-800"
            >
              <option value="">Nenhum (Manual)</option>
              {projectStyles.paragraphStyles.map(pa => (
                <option key={pa.id} value={pa.id}>
                  ¶ {pa.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
};
