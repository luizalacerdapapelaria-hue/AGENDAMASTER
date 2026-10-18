import React, { useState, useMemo, useEffect } from 'react';
import { 
  X, Sparkles, Check, Copy, Plus, Upload, Trash2, Search, Shuffle, 
  Crown, Heart, Sun, Flame, Lightbulb, Coffee, BookOpen, Layers,
  CheckCircle2, ArrowRight, Star
} from 'lucide-react';
import { 
  QuoteCategory, 
  QUOTE_CATEGORIES_METADATA, 
  QUOTES_BY_CATEGORY, 
  getQuotesByCategory, 
  getRandomQuote,
  searchQuotes
} from '../../../core/constants/quotes';
import { LayoutElement } from '../../../types';

export interface MotivationalQuotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCategory?: QuoteCategory | string;
  initialTab?: QuoteCategory | 'custom';
  onSetProjectCategory: (category: QuoteCategory) => void;
  onInsertQuoteElement: (options: {
    category: QuoteCategory;
    positionPreset?: 'top' | 'bottom' | 'card' | 'custom';
    fixedText?: string;
    stylePreset?: 'minimal' | 'quotation_marks' | 'divider_card';
  }) => void;
  customQuotes: string[];
  onSaveCustomQuotes: (quotes: string[]) => void;
  onClearCustomQuotes: () => void;
}

export const MotivationalQuotesModal: React.FC<MotivationalQuotesModalProps> = ({
  isOpen,
  onClose,
  currentCategory = 'all',
  initialTab,
  onSetProjectCategory,
  onInsertQuoteElement,
  customQuotes,
  onSaveCustomQuotes,
  onClearCustomQuotes
}) => {
  const [activeTab, setActiveTab] = useState<QuoteCategory | 'custom'>(
    initialTab || (currentCategory as QuoteCategory) || 'feminine_strength'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedQuote, setCopiedQuote] = useState<string | null>(null);
  const [insertedQuote, setInsertedQuote] = useState<string | null>(null);
  const [pastedText, setPastedText] = useState('');
  const [randomPreviewQuote, setRandomPreviewQuote] = useState<string>(() => getRandomQuote('feminine_strength'));

  useEffect(() => {
    if (isOpen) {
      if (initialTab) {
        setActiveTab(initialTab);
      } else if (currentCategory) {
        setActiveTab((currentCategory as QuoteCategory) || 'feminine_strength');
      }
    }
  }, [isOpen, initialTab, currentCategory]);

  const displayedQuotes = useMemo(() => {
    if (activeTab === 'custom') return customQuotes;
    return searchQuotes(searchQuery, activeTab);
  }, [activeTab, searchQuery, customQuotes]);

  if (!isOpen) return null;

  const activeCategoryMeta = QUOTE_CATEGORIES_METADATA.find(c => c.id === activeTab);

  const handleCopyQuote = (text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedQuote(text);
    setTimeout(() => setCopiedQuote(null), 2000);
  };

  const handleInsert = (positionPreset: 'top' | 'bottom' | 'card', fixedText?: string) => {
    const categoryToUse = (activeTab === 'custom' ? 'all' : activeTab) as QuoteCategory;
    onInsertQuoteElement({
      category: categoryToUse,
      positionPreset,
      fixedText,
      stylePreset: positionPreset === 'card' ? 'divider_card' : 'quotation_marks'
    });
    setInsertedQuote(fixedText || 'Elemento adicionado!');
    setTimeout(() => {
      setInsertedQuote(null);
      onClose();
    }, 600);
  };

  const handleShufflePreview = () => {
    const quote = getRandomQuote(activeTab === 'custom' ? 'all' : activeTab);
    setRandomPreviewQuote(quote);
  };

  const handleSavePasted = () => {
    if (!pastedText.trim()) return;
    const lines = pastedText
      .split(/\r?\n/)
      .map(l => l.trim())
      .filter(l => l.length > 3);
    if (lines.length > 0) {
      onSaveCustomQuotes(lines);
      setPastedText('');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        let phrases: string[] = [];
        if (file.name.endsWith('.json')) {
          const parsed = JSON.parse(text);
          if (Array.isArray(parsed)) phrases = parsed.map(String).map(s => s.trim()).filter(Boolean);
        } else {
          phrases = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 3);
        }
        if (phrases.length > 0) {
          onSaveCustomQuotes(phrases);
        }
      } catch (err) {
        console.error('Erro ao importar frases:', err);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200 select-none">
      <div 
        className="bg-white rounded-3xl shadow-[0_25px_70px_rgba(184,74,86,0.2)] border border-[#eedad5] w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#eedad5] bg-gradient-to-r from-[#fff5f5] via-white to-[#fdeeed] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#b84a56] to-[#d98b95] text-white flex items-center justify-center shadow-md shadow-[#b84a56]/20">
              <Sparkles className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                  Frases Motivacionais Diárias
                </h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-[#fdeeed] text-[#9f3d4a] border border-[#eedad5]">
                  Páginas do Miolo
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Escolha temas inspiradores por categoria, insira no topo ou rodapé do dia, ou personalize suas próprias mensagens.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('custom')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs ${
                activeTab === 'custom'
                  ? 'bg-emerald-600 text-white shadow-emerald-600/20'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-300'
              }`}
              title="Importar frases personalizadas de planilha ou arquivo"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Subir Frases Próprias</span>
              {customQuotes.length > 0 && (
                <span className="text-[10px] bg-emerald-200 text-emerald-900 px-1.5 py-0.2 rounded-full font-bold">
                  {customQuotes.length}
                </span>
              )}
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-[#fff5f5] flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              title="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Subheader Toolbar: Category Pills */}
        <div className="px-6 py-2.5 border-b border-[#eedad5] bg-[#faf6f4] flex items-center gap-1.5 overflow-x-auto custom-scrollbar shrink-0">
          {QUOTE_CATEGORIES_METADATA.map(cat => {
            const isSelected = activeTab === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveTab(cat.id);
                  setSearchQuery('');
                  setRandomPreviewQuote(getRandomQuote(cat.id));
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 shadow-2xs ${
                  isSelected
                    ? 'bg-[#b84a56] text-white shadow-xs scale-102'
                    : 'bg-white text-slate-700 hover:bg-[#fff5f5] hover:text-[#9f3d4a] border border-[#eedad5]'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.shortName}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  isSelected ? 'bg-white/25 text-white' : 'bg-[#fdeeed] text-[#9f3d4a]'
                }`}>
                  {QUOTES_BY_CATEGORY[cat.id]?.length || 0}
                </span>
              </button>
            );
          })}

          <div className="h-6 w-px bg-[#eedad5] mx-1 shrink-0" />

          {/* Minhas Frases / Importar */}
          <button
            onClick={() => setActiveTab('custom')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 shadow-2xs ${
              activeTab === 'custom'
                ? 'bg-emerald-700 text-white shadow-xs scale-102 ring-2 ring-emerald-300'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-300'
            }`}
          >
            <span>📝</span>
            <span>Minhas Frases (Excel/Arquivo)</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
              activeTab === 'custom' ? 'bg-white/25 text-white font-black' : 'bg-emerald-200 text-emerald-900 font-bold'
            }`}>
              {customQuotes.length}
            </span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-white">
          
          {activeTab !== 'custom' ? (
            <>
              {/* Category Showcase Banner */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#fff5f5] via-[#fffbf9] to-[#fdeeed] border border-[#eedad5] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-2xs">
                <div className="space-y-1.5 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{activeCategoryMeta?.icon}</span>
                    <h3 className="text-base font-black text-slate-900">
                      {activeCategoryMeta?.name}
                    </h3>
                    <span 
                      className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border shadow-2xs"
                      style={{ 
                        backgroundColor: activeCategoryMeta?.badgeBg, 
                        color: activeCategoryMeta?.badgeText,
                        borderColor: activeCategoryMeta?.badgeBorder
                      }}
                    >
                      {activeCategoryMeta?.tag}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed font-normal">
                    {activeCategoryMeta?.description}
                  </p>
                </div>

                <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      onSetProjectCategory(activeTab as QuoteCategory);
                      setInsertedQuote('Categoria padrão salva!');
                      setTimeout(() => setInsertedQuote(null), 1800);
                    }}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs ${
                      currentCategory === activeTab
                        ? 'bg-emerald-600 text-white'
                        : 'bg-white text-slate-700 hover:text-[#9f3d4a] hover:bg-[#fff5f5] border border-[#eedad5]'
                    }`}
                    title="Faz com que todas as páginas diárias alternem frases desta categoria"
                  >
                    {currentCategory === activeTab ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Tema Ativo na Agenda</span>
                      </>
                    ) : (
                      <>
                        <Star className="w-3.5 h-3.5 text-amber-500" />
                        <span>Usar como Padrão do Ano</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleInsert('bottom')}
                    className="px-4 py-2 bg-[#b84a56] hover:bg-[#9f3d4a] text-white rounded-xl text-xs font-bold shadow-md shadow-[#b84a56]/20 transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
                    title="Adiciona um elemento de frase no rodapé da página"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Inserir na Página</span>
                  </button>
                </div>
              </div>

              {/* Quick Insertion Presets Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#b84a56]" />
                    <span>Inserir Elemento na Página Diária (com 1 Clique):</span>
                  </label>
                  <span className="text-[10px] text-slate-400 font-medium">Posição calculada para o miolo</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Preset 1: Rodapé */}
                  <button
                    type="button"
                    onClick={() => handleInsert('bottom')}
                    className="p-3.5 rounded-2xl border border-[#eedad5] bg-[#fffbf9] hover:bg-white hover:border-[#b84a56] hover:shadow-md transition-all text-left flex items-start gap-3 group cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-xl bg-[#fdeeed] text-[#b84a56] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <span className="text-sm font-bold">⬇</span>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 group-hover:text-[#b84a56] transition-colors">
                        Rodapé da Página
                      </h4>
                      <p className="text-[11px] text-slate-500 leading-snug mt-0.5">
                        Posiciona uma frase sutil e delicada ao final do dia.
                      </p>
                    </div>
                  </button>

                  {/* Preset 2: Topo */}
                  <button
                    type="button"
                    onClick={() => handleInsert('top')}
                    className="p-3.5 rounded-2xl border border-[#eedad5] bg-[#fffbf9] hover:bg-white hover:border-[#b84a56] hover:shadow-md transition-all text-left flex items-start gap-3 group cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-xl bg-[#fdeeed] text-[#b84a56] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <span className="text-sm font-bold">⬆</span>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 group-hover:text-[#b84a56] transition-colors">
                        Topo do Dia (Inspiração)
                      </h4>
                      <p className="text-[11px] text-slate-500 leading-snug mt-0.5">
                        Logo abaixo do cabeçalho da data para começar bem o dia.
                      </p>
                    </div>
                  </button>

                  {/* Preset 3: Card Destaque */}
                  <button
                    type="button"
                    onClick={() => handleInsert('card')}
                    className="p-3.5 rounded-2xl border border-[#eedad5] bg-[#fffbf9] hover:bg-white hover:border-[#b84a56] hover:shadow-md transition-all text-left flex items-start gap-3 group cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-xl bg-[#fdeeed] text-[#b84a56] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <span className="text-sm font-bold">✦</span>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 group-hover:text-[#b84a56] transition-colors">
                        Cartão Destaque com Moldura
                      </h4>
                      <p className="text-[11px] text-slate-500 leading-snug mt-0.5">
                        Box decorado com borda e fundo atelier para valorizar o layout.
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Search & Quotes Catalog */}
              <div className="space-y-3 pt-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-[#b84a56]" />
                      <span>Catálogo de Frases ({displayedQuotes.length})</span>
                    </h4>
                    <span className="text-[10px] text-slate-400">
                      Rotação automática de 365 dias
                    </span>
                  </div>

                  <div className="relative w-full sm:w-64">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400 pointer-events-none" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder="Buscar palavra ou tema..."
                      className="w-full text-xs pl-8 pr-3 py-1.5 rounded-xl border border-[#eedad5] bg-white focus:ring-1 focus:ring-[#b84a56] outline-none text-slate-800 placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {displayedQuotes.map((quoteText, idx) => {
                    const isCopied = copiedQuote === quoteText;
                    return (
                      <div
                        key={idx}
                        className="p-3 rounded-2xl border border-[#eedad5] bg-[#fffbf9] hover:bg-white hover:border-[#b84a56]/50 hover:shadow-xs transition-all flex items-start justify-between gap-3 group"
                      >
                        <div className="flex items-start gap-2.5 min-w-0 flex-1">
                          <span className="text-xs font-mono font-bold text-slate-400 mt-0.5 shrink-0">
                            {(idx + 1).toString().padStart(2, '0')}
                          </span>
                          <p className="text-xs text-slate-800 leading-relaxed font-serif italic selection:bg-[#fdeeed]">
                            “{quoteText}”
                          </p>
                        </div>

                        <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={() => handleCopyQuote(quoteText)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-[#fff5f5] transition-colors cursor-pointer"
                            title="Copiar Frase"
                          >
                            {isCopied ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleInsert('bottom', quoteText)}
                            className="px-2 py-1 bg-[#fff5f5] hover:bg-[#b84a56] text-[#9f3d4a] hover:text-white border border-[#eedad5] rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
                            title="Inserir esta frase exata como elemento fixo na página"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Fixar</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            /* TAB: MINHAS FRASES (IMPORTAR / COLAR DO EXCEL) - IDÊNTICO AO MODAL DE VERSÍCULOS */
            <div className="space-y-5">
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 leading-relaxed space-y-1.5">
                <p className="font-bold flex items-center gap-1.5 text-amber-950 text-sm">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-300 shrink-0" />
                  <span>Quer usar suas próprias Frases ou Mensagens na sua agenda?</span>
                </p>
                <p className="text-amber-800 text-xs leading-relaxed">
                  Agora você pode substituir todas as frases dos dias por uma lista personalizada do seu ateliê! É super simples trazer do seu <strong>Excel</strong> ou <strong>Google Sheets</strong>: basta colar as linhas na caixa de texto ou fazer upload de um arquivo.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-left">
                {/* Coluna Esquerda: Instruções, Arquivo & Estado Atual */}
                <div className="space-y-4">
                  <div className="space-y-2 p-4 rounded-2xl bg-[#fffbf9] border border-[#eedad5]">
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                      <Upload className="w-4 h-4 text-[#b84a56]" />
                      <span>Opção 1: Upload de Arquivo</span>
                    </h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Selecione um arquivo de texto (<code className="bg-white px-1.5 py-0.5 rounded border border-[#eedad5] font-mono text-[#9f3d4a] font-bold">.txt</code> ou <code className="bg-white px-1.5 py-0.5 rounded border border-[#eedad5] font-mono text-[#9f3d4a] font-bold">.csv</code>) contendo uma frase por linha, ou uma lista em <code className="bg-white px-1.5 py-0.5 rounded border border-[#eedad5] font-mono text-[#9f3d4a] font-bold">.json</code>.
                    </p>
                    
                    <div className="pt-1">
                      <label className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-[#eedad5] hover:border-[#b84a56] hover:bg-[#fff5f5] text-slate-700 hover:text-[#b84a56] rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs">
                        <Upload className="w-4 h-4 text-[#b84a56]" />
                        <span>Escolher Arquivo (.txt, .csv, .json)</span>
                        <input
                          type="file"
                          accept=".txt,.csv,.json"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  <div className="space-y-2 p-4 rounded-2xl bg-[#fffbf9] border border-[#eedad5]">
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 text-[#b84a56]" />
                      <span>Opção 2: Como colar do Excel</span>
                    </h4>
                    <ol className="list-decimal list-inside text-[11px] text-slate-600 space-y-1 leading-relaxed">
                      <li>Abra sua planilha (Excel ou Google Sheets).</li>
                      <li>Selecione e <strong>Copie (Ctrl+C)</strong> a coluna de frases.</li>
                      <li>Insira os dados na caixa ao lado e clique em salvar.</li>
                    </ol>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#faf6f4] border border-[#eedad5] space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-700">Estado atual:</span>
                      {customQuotes.length > 0 ? (
                        <span className="bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full text-[10px] border border-emerald-300">
                          Ativo (Frases Próprias)
                        </span>
                      ) : (
                        <span className="bg-slate-200 text-slate-700 font-bold px-2.5 py-0.5 rounded-full text-[10px]">
                          Ativo (Frases Padrão do Sistema)
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      {customQuotes.length > 0 
                        ? `Você tem ${customQuotes.length} frases motivacionais cadastradas. Elas serão exibidas em ordem rotativa para cada dia do ano na sua agenda.` 
                        : `O sistema conta com 370 frases exclusivas em cada categoria selecionada para inspirar cada dia do ano.`}
                    </p>
                    {customQuotes.length > 0 && (
                      <button 
                        type="button"
                        onClick={onClearCustomQuotes}
                        className="text-[11px] font-bold text-red-600 hover:text-red-800 hover:bg-red-50 px-2.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer mt-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Voltar às frases originais do sistema</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Coluna Direita: Caixa de Texto para Colar */}
                <div className="flex flex-col gap-3 text-left">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">
                      Colar diretamente
                    </h4>
                    {customQuotes.length > 0 && (
                      <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        Dica: Cole para atualizar
                      </span>
                    )}
                  </div>
                  
                  <textarea
                    value={pastedText}
                    onChange={e => setPastedText(e.target.value)}
                    placeholder={"Cole suas frases motivacionais aqui (uma por linha)&#10;Exemplo:&#10;A persistência é o caminho do êxito.&#10;Grandes jornadas começam com o primeiro passo.&#10;Foque no progresso diário, não na perfeição."}
                    className="w-full h-56 p-3 text-xs border border-[#eedad5] rounded-2xl focus:ring-2 focus:ring-[#b84a56] outline-none resize-none font-mono text-slate-800 bg-[#fffbf9]"
                  />

                  <button
                    type="button"
                    onClick={handleSavePasted}
                    disabled={!pastedText.trim()}
                    className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-700/20 transition-all uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <Check className="w-4 h-4" />
                    <span>Salvar Frases Coladas</span>
                  </button>
                </div>
              </div>

              {/* Preview dos Primeiros 5 e Ações */}
              {customQuotes.length > 0 && (
                <div className="pt-4 border-t border-[#eedad5] text-left space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">
                      Visualização rápida (Primeiras frases salvas - Total: {customQuotes.length})
                    </h4>
                    <span className="text-[11px] font-bold text-emerald-700">
                      ✓ Pronto para usar nas páginas
                    </span>
                  </div>

                  <div className="bg-[#fffbf9] rounded-2xl p-3 border border-[#eedad5] space-y-1.5 max-h-40 overflow-y-auto custom-scrollbar">
                    {customQuotes.slice(0, 5).map((quote, idx) => (
                      <div key={idx} className="text-xs text-slate-700 border-b border-[#eedad5]/50 last:border-0 pb-1 last:pb-0 flex items-start gap-2">
                        <span className="font-mono text-slate-400 font-bold bg-slate-200/60 px-1.5 py-0.5 rounded text-[10px] shrink-0">
                          {idx + 1}
                        </span>
                        <span className="truncate italic">“{quote}”</span>
                      </div>
                    ))}
                    {customQuotes.length > 5 && (
                      <div className="text-[10px] text-slate-400 italic text-center pt-1">
                        ... e mais {customQuotes.length - 5} frases cadastradas para o ano todo.
                      </div>
                    )}
                  </div>

                  {/* Ações de inserção rápida */}
                  <div className="p-3 bg-gradient-to-r from-[#fff5f5] to-[#fdeeed] rounded-2xl border border-[#eedad5] flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-bold text-[#85313d]">
                      Inserir este elemento na página atual:
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleInsert('top')}
                        className="px-3 py-1.5 bg-white hover:bg-[#fff5f5] text-[#b84a56] border border-[#eedad5] rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs"
                      >
                        Topo da Página
                      </button>
                      <button
                        type="button"
                        onClick={() => handleInsert('bottom')}
                        className="px-3 py-1.5 bg-[#b84a56] hover:bg-[#9f3d4a] text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
                      >
                        Rodapé da Página
                      </button>
                      <button
                        type="button"
                        onClick={() => handleInsert('card')}
                        className="px-3 py-1.5 bg-white hover:bg-[#fff5f5] text-slate-700 border border-[#eedad5] rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs"
                      >
                        Cartão Destaque
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Rodapé Informativo */}
        <div className="px-6 py-3.5 border-t border-[#eedad5] bg-[#faf6f4] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <span>💡 <strong>Dica de Papelaria:</strong></span>
            <span>Você pode editar o texto de qualquer frase dando duplo clique diretamente sobre ela na página.</span>
          </div>

          <div className="flex items-center gap-2">
            {insertedQuote && (
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-xl animate-in fade-in">
                ✓ {insertedQuote}
              </span>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 text-xs font-bold text-[#9f3d4a] hover:text-[#7e2d38] bg-white hover:bg-[#fff5f5] border border-[#eedad5] rounded-xl transition-all cursor-pointer shadow-xs"
            >
              Concluir
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
