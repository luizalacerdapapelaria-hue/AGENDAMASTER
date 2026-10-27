import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  X, Upload, FileText, Sparkles, Check,
  ChevronLeft, ChevronRight, Layers, Eye, RefreshCw,
  AlertCircle, ZoomIn, ZoomOut, RotateCcw,
  BookOpen, Calendar, ArrowRightLeft, Palette,
  BookMarked, ShieldCheck, Copy, Plus, ArrowRight,
  ListFilter, CheckSquare, Wand2, Hash, BookCopy
} from 'lucide-react';
import { LayoutElement, ElementType, PdfImportDestination, PdfImportBatchItem } from '../../../types';
export type { PdfImportDestination, PdfImportBatchItem };
import {
  extractPdfObjects,
  getPdfPageCount,
  PdfPageExtractionResult,
  PdfExtractionOptions,
  reapplyDynamicDetectionToElements,
} from '../../../core/logic/pdfExtractor';

export interface PdfImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (
    elements: LayoutElement[],
    destination: PdfImportDestination,
    metadata: {
      pageName?: string;
      widthMm?: number;
      heightMm?: number;
      backgroundImage?: string;
      clearExistingElements?: boolean;
      clearBackground?: boolean;
      applyBackground?: boolean;
      matchPageDimensions?: boolean;
      zeroMargins?: boolean;
      batchPages?: PdfImportBatchItem[];
    }
  ) => void;
  currentPageTitle?: string;
  initialFile?: File | null;
  initialDestination?: PdfImportDestination;
  currentPageDimensions?: {
    widthMm: number;
    heightMm: number;
    pageSize: string;
  };
  currentMargins?: {
    top: number;
    bottom: number;
    inside: number;
    outside: number;
  };
}

interface PageMappingEntry {
  pageNumber: number;
  destination: PdfImportDestination | 'ignore';
  customName?: string;
  isBackgroundOnly?: boolean;
}

export const PdfImportModal: React.FC<PdfImportModalProps> = ({
  isOpen,
  onClose,
  onImport,
  currentPageTitle = 'Página Atual',
  initialFile = null,
  initialDestination = 'miolo_default',
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [totalPages, setTotalPages] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [batchProgress, setBatchProgress] = useState<{ current: number; total: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Modo de Importação: Página Específica vs Mapeamento em Lote de Múltiplas Páginas
  const [importMode, setImportMode] = useState<'single' | 'batch'>('single');

  // Destino da importação da página atual
  const [chosenDestination, setChosenDestination] = useState<PdfImportDestination>(initialDestination || 'miolo_default');
  const [customPageName, setCustomPageName] = useState<string>('Layout Importado');

  // Mapeamento de Múltiplas Páginas do PDF
  const [pageMappings, setPageMappings] = useState<PageMappingEntry[]>([]);

  // Ajustes essenciais
  const [matchPageDimensions, setMatchPageDimensions] = useState<boolean>(true);
  const [autoDetectDynamic, setAutoDetectDynamic] = useState<boolean>(true);

  // Resultado da extração da página em prévia
  const [extractionResult, setExtractionResult] = useState<PdfPageExtractionResult | null>(null);
  const [elements, setElements] = useState<LayoutElement[]>([]);
  const [isBackgroundOnly, setIsBackgroundOnly] = useState<boolean>(false);

  // Zoom da prévia
  const [canvasZoom, setCanvasZoom] = useState<number>(0.85);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Extração de página individual para prévia
  const runExtraction = useCallback(async (
    targetFile: File,
    pageNum: number,
    detectDynamic: boolean = true
  ) => {
    try {
      setLoading(true);
      setError(null);

      const options: PdfExtractionOptions = {
        pageNumber: pageNum,
        groupTextLines: true,
        extractImages: true,
        extractShapes: true,
        renderBackgroundCanvas: true,
        textColorDefault: '#1f2937',
        autoDetectDynamicVariables: detectDynamic,
      };

      const result = await extractPdfObjects(targetFile, options);
      setExtractionResult(result);
      setElements(result.elements);
    } catch (err: any) {
      console.error('[PdfImportModal] Erro ao extrair PDF:', err);
      const msg = err?.message || '';
      if (msg.includes('password') || msg.includes('senha')) {
        setError('Este PDF é protegido por senha. Remova a senha antes de importar.');
      } else {
        setError('Não foi possível ler este arquivo PDF. Verifique se o arquivo não está corrompido ou tente exportar novamente do Canva/Corel/Illustrator.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Inicializa mapa de páginas quando o arquivo é carregado
  const initializePageMappings = (numPages: number, defaultDest: PdfImportDestination) => {
    const mappings: PageMappingEntry[] = [];
    for (let p = 1; p <= numPages; p++) {
      let dest: PdfImportDestination | 'ignore' = 'ignore';
      let name = `Página ${p}`;

      if (numPages === 1) {
        dest = defaultDest;
      } else if (p === 1) {
        dest = defaultDest;
        name = 'Capa Frente ou Página 1';
      } else if (p === 2 && (defaultDest === 'miolo_default' || defaultDest === 'miolo_right')) {
        dest = 'miolo_left';
        name = 'Miolo Verso';
      } else if (p === numPages && numPages > 3) {
        dest = 'cover_back';
        name = 'Contracapa';
      } else {
        dest = 'new_intro';
        name = `Página Inicial ${p}`;
      }

      mappings.push({
        pageNumber: p,
        destination: dest,
        customName: name,
        isBackgroundOnly: false
      });
    }
    setPageMappings(mappings);
  };

  // Seleção de arquivo
  const handleFileSelect = async (selectedFile: File) => {
    if (!selectedFile) return;
    if (selectedFile.type !== 'application/pdf' && !selectedFile.name.toLowerCase().endsWith('.pdf')) {
      setError('Por favor, selecione um arquivo no formato PDF válido.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setFile(selectedFile);
      setFileName(selectedFile.name);

      const numPages = await getPdfPageCount(selectedFile);
      const validTotal = numPages || 1;
      setTotalPages(validTotal);
      setCurrentPage(1);

      initializePageMappings(validTotal, chosenDestination);

      await runExtraction(selectedFile, 1, autoDetectDynamic);
    } catch (err: any) {
      console.error('[PdfImportModal] Erro na leitura do PDF:', err);
      setError('Erro ao abrir o PDF. Verifique se o arquivo é um PDF válido e acessível.');
    } finally {
      setLoading(false);
    }
  };

  // Carregar arquivo inicial se fornecido
  useEffect(() => {
    if (initialFile && isOpen) {
      handleFileSelect(initialFile);
    }
  }, [initialFile, isOpen]);

  // Atualiza destino padrão se fornecido
  useEffect(() => {
    if (initialDestination) {
      setChosenDestination(initialDestination);
    }
  }, [initialDestination]);

  // Navegação de páginas da prévia
  const handlePageChange = async (newPage: number) => {
    if (!file || newPage < 1 || newPage > totalPages || newPage === currentPage) return;
    setCurrentPage(newPage);
    await runExtraction(file, newPage, autoDetectDynamic);
  };

  // Alterna detecção dinâmica
  const handleToggleAutoDetectDynamic = (enabled: boolean) => {
    setAutoDetectDynamic(enabled);
    setElements(prev => reapplyDynamicDetectionToElements(prev, enabled));
  };

  // Atualiza o destino de uma página específica no mapa em lote
  const handleUpdatePageMapping = (pageNum: number, newDest: PdfImportDestination | 'ignore') => {
    setPageMappings(prev => prev.map(m => m.pageNumber === pageNum ? { ...m, destination: newDest } : m));
  };

  // Presets rápidos para mapeamento em lote
  const applyPreset = (presetType: 'cover_and_miolo' | 'spread' | 'all_intros' | 'all_daily') => {
    setPageMappings(prev => prev.map(m => {
      const p = m.pageNumber;
      if (presetType === 'cover_and_miolo') {
        if (p === 1) return { ...m, destination: 'cover_front', customName: 'Capa Frente' };
        if (p === 2) return { ...m, destination: 'endsheet_front', customName: 'Guarda Dianteira' };
        if (p === 3) return { ...m, destination: 'miolo_default', customName: 'Miolo Frente' };
        if (p === 4) return { ...m, destination: 'miolo_left', customName: 'Miolo Verso' };
        if (p === totalPages && totalPages > 4) return { ...m, destination: 'cover_back', customName: 'Contracapa' };
        return { ...m, destination: 'new_intro', customName: `Página Inicial ${p}` };
      }
      if (presetType === 'spread') {
        if (p % 2 === 1) return { ...m, destination: 'miolo_right', customName: `Miolo Frente (Pág ${p})` };
        return { ...m, destination: 'miolo_left', customName: `Miolo Verso (Pág ${p})` };
      }
      if (presetType === 'all_intros') {
        return { ...m, destination: 'new_intro', customName: `Página Inicial ${p}` };
      }
      if (presetType === 'all_daily') {
        return { ...m, destination: 'miolo_default', customName: `Miolo Diário ${p}` };
      }
      return m;
    }));
  };

  // Importar página individual confirmada
  const handleConfirmSingleImport = () => {
    if (!file || !extractionResult) return;

    const finalElements = isBackgroundOnly ? [] : elements;
    const finalDest = chosenDestination;

    onImport(
      finalElements,
      finalDest,
      {
        pageName: customPageName || `Página ${currentPage} Importada`,
        widthMm: extractionResult.viewport.widthMm,
        heightMm: extractionResult.viewport.heightMm,
        matchPageDimensions,
        zeroMargins: true,
        backgroundImage: isBackgroundOnly ? extractionResult.backgroundDataUrl : undefined,
        clearExistingElements: true,
        clearBackground: !isBackgroundOnly,
        applyBackground: isBackgroundOnly,
      }
    );

    onClose();
  };

  // Importar múltiplas páginas mapeadas em lote
  const handleConfirmBatchImport = async () => {
    if (!file) return;

    const activeMappings = pageMappings.filter(m => m.destination !== 'ignore');
    if (activeMappings.length === 0) {
      setError('Por favor, selecione pelo menos uma página com um destino válido para importar.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const batchPages: PdfImportBatchItem[] = [];

      for (let i = 0; i < activeMappings.length; i++) {
        const mapping = activeMappings[i];
        setBatchProgress({ current: i + 1, total: activeMappings.length });

        const extraction = await extractPdfObjects(file, {
          pageNumber: mapping.pageNumber,
          groupTextLines: true,
          extractImages: true,
          extractShapes: true,
          renderBackgroundCanvas: true,
          autoDetectDynamicVariables: autoDetectDynamic,
        });

        batchPages.push({
          pageNumber: mapping.pageNumber,
          pageName: mapping.customName || `Página ${mapping.pageNumber}`,
          elements: mapping.isBackgroundOnly ? [] : extraction.elements,
          backgroundImage: extraction.backgroundDataUrl,
          destination: mapping.destination as PdfImportDestination,
          isDividerVerso: mapping.destination === 'divider_verso'
        });
      }

      onImport(
        batchPages[0]?.elements || [],
        'full_agenda',
        {
          pageName: 'Importação em Lote PDF',
          matchPageDimensions,
          zeroMargins: true,
          batchPages
        }
      );

      onClose();
    } catch (err: any) {
      console.error('[PdfImportModal] Erro no lote:', err);
      setError('Ocorreu um erro ao extrair todas as páginas mapeadas.');
    } finally {
      setLoading(false);
      setBatchProgress(null);
    }
  };

  const getDestinationName = (dest: PdfImportDestination | 'ignore') => {
    switch (dest) {
      case 'cover_front': return 'Capa Frente (Studio de Capas)';
      case 'cover_back': return 'Contracapa (Verso da Capa)';
      case 'endsheet_front': return 'Guarda Dianteira';
      case 'endsheet_back': return 'Guarda Traseira';
      case 'miolo_default': return 'Miolo Diário (Principal / Frente)';
      case 'miolo_left': return 'Miolo Verso (Página Esquerda)';
      case 'miolo_right': return 'Miolo Frente (Página Direita)';
      case 'new_intro': return 'Nova Página Inicial (Dados/Metas)';
      case 'new_monthly_intro': return 'Nova Abertura Mensal';
      case 'divider': return 'Divisória Mensal (Frente / Capa)';
      case 'divider_verso': return 'Divisória Mensal (Verso)';
      case 'replace': return 'Substituir Página Atual da Tela';
      case 'append': return 'Adicionar Elementos à Página Atual';
      case 'ignore': return 'Ignorar (Não Importar)';
      default: return dest;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-150 font-sans">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-[1140px] max-w-[98vw] h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header Superior Limpo & Moderno */}
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="bg-[#b84a56] p-2 rounded-xl text-white shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-900 tracking-tight">Importar Layout de PDF</h2>
              <p className="text-[11px] text-slate-500 font-medium">
                Defina com precisão qual página do seu PDF quer importar e onde ela deve ser inserida na agenda
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded-xl transition-colors cursor-pointer"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dropzone Inicial se nenhum arquivo foi carregado */}
        {!file ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50/50">
            <div
              onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  handleFileSelect(e.dataTransfer.files[0]);
                }
              }}
              onClick={() => fileInputRef.current?.click()}
              className="w-full max-w-md border-2 border-dashed border-[#eedad5] hover:border-[#b84a56] rounded-2xl p-8 sm:p-10 flex flex-col items-center justify-center text-center bg-white hover:bg-[#fff9f8] transition-all cursor-pointer shadow-xs group"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileSelect(e.target.files[0]);
                  }
                }}
                accept=".pdf,application/pdf"
                className="hidden"
              />
              <div className="w-14 h-14 bg-[#fdeeed] group-hover:bg-[#f9ded8] text-[#b84a56] rounded-2xl flex items-center justify-center mb-3 transition-colors">
                <Upload className="w-7 h-7" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">
                Clique para selecionar seu arquivo PDF
              </h3>
              <p className="text-xs text-slate-500 max-w-xs mb-4 leading-relaxed">
                Suporta PDFs de 1 ou múltiplas páginas do Canva, CorelDraw, Illustrator, Photoshop ou InDesign.
              </p>
              <span className="text-xs font-bold text-[#b84a56] bg-[#fdeeed] px-3.5 py-1.5 rounded-xl hover:bg-[#f5ded9] transition-colors">
                Escolher Arquivo PDF
              </span>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2 max-w-md w-full">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{error}</span>
              </div>
            )}
          </div>
        ) : (
          /* Visualizador e Importador Completo */
          <div className="flex-1 flex overflow-hidden">
            
            {/* Lado Esquerdo: Área de Pré-visualização do PDF */}
            <div className="flex-1 flex flex-col bg-slate-100/70 overflow-hidden border-r border-slate-200 min-w-0">
              
              {/* Barra de Ferramentas Superior da Prévia */}
              <div className="px-3.5 py-2 bg-white border-b border-slate-200 flex items-center justify-between gap-2 text-xs shrink-0 flex-wrap">
                
                {/* Nome do Arquivo + Trocar */}
                <div className="flex items-center gap-2 min-w-0">
                  <div className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-lg text-slate-700 font-medium max-w-[200px] sm:max-w-[240px]">
                    <FileText className="w-3.5 h-3.5 text-[#b84a56] shrink-0" />
                    <span className="truncate text-xs font-bold" title={fileName}>{fileName}</span>
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-[11px] font-bold text-[#b84a56] hover:underline cursor-pointer shrink-0"
                  >
                    Trocar
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileSelect(e.target.files[0]);
                      }
                    }}
                    accept=".pdf,application/pdf"
                    className="hidden"
                  />
                </div>

                {/* Seletor Claro: Qual página do PDF quer visualizar e importar */}
                <div className="flex items-center gap-1 bg-[#fdeeed] p-1 rounded-xl border border-[#eedad5]">
                  <span className="text-[10px] font-black uppercase text-[#b84a56] px-1.5">
                    Página do PDF:
                  </span>
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage <= 1 || loading}
                    className="p-1 bg-white hover:bg-slate-50 text-slate-700 rounded-lg shadow-2xs disabled:opacity-30 cursor-pointer"
                    title="Página Anterior"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  
                  {/* Seletor dropdown ou input direto para pular para qualquer página */}
                  <select
                    value={currentPage}
                    onChange={(e) => handlePageChange(parseInt(e.target.value) || 1)}
                    className="bg-white border border-[#eedad5] font-black text-slate-800 text-xs rounded-lg px-2 py-0.5 shadow-2xs cursor-pointer focus:ring-1 focus:ring-[#b84a56]"
                  >
                    {Array.from({ length: totalPages }).map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        Página {i + 1} de {totalPages}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages || loading}
                    className="p-1 bg-white hover:bg-slate-50 text-slate-700 rounded-lg shadow-2xs disabled:opacity-30 cursor-pointer"
                    title="Próxima Página"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Controles de Zoom */}
                <div className="flex items-center gap-1 bg-slate-100 px-1.5 py-0.5 rounded-lg text-slate-600">
                  <button
                    onClick={() => setCanvasZoom(z => Math.max(0.4, Number((z - 0.1).toFixed(2))))}
                    className="p-1 hover:text-[#b84a56] cursor-pointer"
                    title="Diminuir Zoom"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[10px] font-bold font-mono px-1">
                    {Math.round(canvasZoom * 100)}%
                  </span>
                  <button
                    onClick={() => setCanvasZoom(z => Math.min(2.0, Number((z + 0.1).toFixed(2))))}
                    className="p-1 hover:text-[#b84a56] cursor-pointer"
                    title="Aumentar Zoom"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setCanvasZoom(0.85)}
                    className="p-1 hover:text-[#b84a56] cursor-pointer text-[10px]"
                    title="Redefinir Zoom"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Faixa de Atalho para Páginas (quando tem várias páginas) */}
              {totalPages > 1 && (
                <div className="px-3 py-1.5 bg-slate-50 border-b border-slate-200 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider shrink-0 mr-1">
                    Pular para Página:
                  </span>
                  {Array.from({ length: totalPages }).map((_, i) => {
                    const p = i + 1;
                    const isSelected = p === currentPage;
                    return (
                      <button
                        key={p}
                        onClick={() => handlePageChange(p)}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all shrink-0 cursor-pointer ${
                          isSelected
                            ? 'bg-[#b84a56] text-white shadow-2xs scale-105'
                            : 'bg-white hover:bg-slate-200 text-slate-700 border border-slate-300'
                        }`}
                      >
                        Pág. {p}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Área do Canvas: Prévia Limpa */}
              <div className="flex-1 overflow-auto p-4 sm:p-6 flex items-center justify-center relative select-none">
                {loading ? (
                  <div className="flex flex-col items-center justify-center gap-2.5 bg-white p-5 rounded-2xl shadow-lg border border-slate-200">
                    <div className="w-7 h-7 border-3 border-[#b84a56] border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-xs font-bold text-slate-700">
                      {batchProgress ? `Processando página ${batchProgress.current} de ${batchProgress.total}...` : `Carregando Página ${currentPage}...`}
                    </span>
                  </div>
                ) : error ? (
                  <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2 max-w-md">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                    <span>{error}</span>
                  </div>
                ) : (
                  <div
                    style={{
                      transform: `scale(${canvasZoom})`,
                      transformOrigin: 'center center',
                      transition: 'transform 0.1s ease-out'
                    }}
                    className="relative bg-white shadow-xl rounded-sm border border-slate-300"
                  >
                    <div
                      style={{
                        width: `${extractionResult?.viewport.width || 595}px`,
                        height: `${extractionResult?.viewport.height || 842}px`,
                        position: 'relative',
                        overflow: 'hidden',
                        backgroundColor: '#ffffff'
                      }}
                    >
                      {/* Fundo original se modo fundo estiver ativo */}
                      {isBackgroundOnly && extractionResult?.backgroundDataUrl && (
                        <img
                          src={extractionResult.backgroundDataUrl}
                          alt="Fundo original"
                          className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                        />
                      )}

                      {/* Elementos Editáveis renderizados com fidelidade */}
                      {!isBackgroundOnly && elements.map((el) => {
                        const widthPt = extractionResult?.viewport.width || 595;
                        const heightPt = extractionResult?.viewport.height || 842;
                        const leftPx = (el.x / 100) * widthPt;
                        const topPx = (el.y / 100) * heightPt;
                        const widthPx = (el.w / 100) * widthPt;
                        const heightPx = (el.h / 100) * heightPt;

                        return (
                          <div
                            key={el.id}
                            style={{
                              position: 'absolute',
                              left: `${leftPx}px`,
                              top: `${topPx}px`,
                              width: `${widthPx}px`,
                              height: `${heightPx}px`,
                              zIndex: el.zIndex,
                              backgroundColor: el.type === 'text' || el.type === 'lines' ? 'transparent' : (el.style.backgroundColor || 'transparent'),
                              border: el.type === 'lines' ? undefined : (el.style.borderWidth ? `${el.style.borderWidth}px ${el.style.borderStyle || 'solid'} ${el.style.borderColor || 'transparent'}` : undefined),
                              borderRadius: el.style.borderRadius ? `${el.style.borderRadius}px` : undefined,
                              opacity: el.style.opacity ?? 1,
                              pointerEvents: 'none'
                            }}
                          >
                            {el.type === 'text' || el.type.includes('day') || el.type.includes('month') || el.type.includes('year') || el.type === 'date_placeholder' ? (
                              <div
                                style={{
                                  fontFamily: el.style.fontFamily || 'sans-serif',
                                  fontSize: `${el.style.fontSize || 12}px`,
                                  fontWeight: el.style.fontWeight || 'normal',
                                  color: el.style.color || '#1f2937',
                                  whiteSpace: 'nowrap',
                                  justifyContent: el.style.textAlign === 'center' ? 'center' : (el.style.textAlign === 'right' ? 'flex-end' : 'flex-start')
                                }}
                                className="w-full h-full flex items-center px-0.5"
                              >
                                {el.content || el.style.originalPdfText || el.name}
                              </div>
                            ) : el.type === 'lines' ? (
                              <div className="w-full h-full flex items-center justify-center">
                                <svg className="w-full h-full overflow-visible">
                                  <line
                                    x1={el.w < el.h ? "50%" : "0"}
                                    y1={el.w < el.h ? "0" : "50%"}
                                    x2={el.w < el.h ? "50%" : "100%"}
                                    y2={el.w < el.h ? "100%" : "50%"}
                                    stroke={el.style.color || el.style.borderColor || '#374151'}
                                    strokeWidth={Math.max(1, el.style.borderWidth || 1)}
                                  />
                                </svg>
                              </div>
                            ) : el.type === 'image' && el.style.imageUrl ? (
                              <img
                                src={el.style.imageUrl}
                                alt="Imagem extraída"
                                className="w-full h-full object-contain"
                              />
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Rodapé da Prévia: Dimensões */}
              <div className="px-4 py-2 bg-white border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
                <span className="font-medium text-[11px]">
                  Página {currentPage} de {totalPages} • {elements.length} elementos identificados
                </span>
                {extractionResult?.viewport && (
                  <span className="font-mono text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                    Dimensão: {Math.round(extractionResult.viewport.widthMm)} × {Math.round(extractionResult.viewport.heightMm)} mm
                  </span>
                )}
              </div>
            </div>

            {/* Lado Direito: Opções Detalhadas de "QUAL PÁGINA IMPORTAR COMO O QUE" */}
            <div className="w-[370px] sm:w-[410px] bg-white flex flex-col h-full border-l border-slate-200 shrink-0 overflow-hidden">
              
              {/* Abas Superiores: Importar Página Específica vs Mapear Múltiplas Páginas */}
              {totalPages > 1 && (
                <div className="flex border-b border-slate-200 bg-slate-50 p-1.5 gap-1 shrink-0">
                  <button
                    onClick={() => setImportMode('single')}
                    className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      importMode === 'single'
                        ? 'bg-white text-[#b84a56] shadow-xs ring-1 ring-slate-200'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Página {currentPage}</span>
                  </button>
                  <button
                    onClick={() => setImportMode('batch')}
                    className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      importMode === 'batch'
                        ? 'bg-white text-[#b84a56] shadow-xs ring-1 ring-slate-200'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <BookCopy className="w-3.5 h-3.5" />
                    <span>Mapear Todas ({totalPages} Págs)</span>
                  </button>
                </div>
              )}

              {/* CONTEÚDO 1: IMPORTAR PÁGINA ESPECÍFICA */}
              {importMode === 'single' ? (
                <div className="flex-1 flex flex-col p-4 space-y-3.5 overflow-y-auto">
                  
                  {/* Badge de Destaque da Página Escolhida */}
                  <div className="bg-[#fdeeed] p-3 rounded-xl border border-[#eedad5] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-[#b84a56] block">
                        Página Selecionada do PDF
                      </span>
                      <span className="text-sm font-black text-slate-900">
                        Página {currentPage} de {totalPages}
                      </span>
                    </div>
                    {totalPages > 1 && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage <= 1 || loading}
                          className="p-1.5 bg-white hover:bg-slate-50 text-slate-700 rounded-lg shadow-2xs disabled:opacity-30 cursor-pointer"
                          title="Página Anterior"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage >= totalPages || loading}
                          className="p-1.5 bg-white hover:bg-slate-50 text-slate-700 rounded-lg shadow-2xs disabled:opacity-30 cursor-pointer"
                          title="Próxima Página"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-2">
                      Importar esta página ({currentPage}) como o quê na agenda?
                    </label>

                    {/* Lista Completa e Categorizada de Destinos */}
                    <div className="space-y-1.5">
                      
                      {/* 1. Capa Frente */}
                      <div
                        onClick={() => {
                          setChosenDestination('cover_front');
                          setIsBackgroundOnly(false);
                          setCustomPageName('Capa Frente');
                        }}
                        className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all flex items-center gap-2.5 ${
                          chosenDestination === 'cover_front' && !isBackgroundOnly
                            ? 'border-[#b84a56] bg-[#fdeeed]/60 ring-1 ring-[#b84a56]'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className={`p-1.5 rounded-lg shrink-0 ${chosenDestination === 'cover_front' && !isBackgroundOnly ? 'bg-[#b84a56] text-white' : 'bg-slate-100 text-slate-600'}`}>
                          <BookMarked className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-bold text-slate-900 block truncate">Capa Frente (Studio de Capas)</span>
                          <span className="text-[10px] text-slate-500 block truncate">Capa principal com gabarito de cartonagem</span>
                        </div>
                      </div>

                      {/* 2. Contracapa / Verso */}
                      <div
                        onClick={() => {
                          setChosenDestination('cover_back');
                          setIsBackgroundOnly(false);
                          setCustomPageName('Contracapa');
                        }}
                        className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all flex items-center gap-2.5 ${
                          chosenDestination === 'cover_back' && !isBackgroundOnly
                            ? 'border-[#b84a56] bg-[#fdeeed]/60 ring-1 ring-[#b84a56]'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className={`p-1.5 rounded-lg shrink-0 ${chosenDestination === 'cover_back' && !isBackgroundOnly ? 'bg-[#b84a56] text-white' : 'bg-slate-100 text-slate-600'}`}>
                          <BookMarked className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-bold text-slate-900 block truncate">Contracapa / Verso da Capa</span>
                          <span className="text-[10px] text-slate-500 block truncate">Parte traseira da encadernação</span>
                        </div>
                      </div>

                      {/* 3. Guarda Dianteira */}
                      <div
                        onClick={() => {
                          setChosenDestination('endsheet_front');
                          setIsBackgroundOnly(false);
                          setCustomPageName('Guarda Dianteira');
                        }}
                        className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all flex items-center gap-2.5 ${
                          chosenDestination === 'endsheet_front' && !isBackgroundOnly
                            ? 'border-[#b84a56] bg-[#fdeeed]/60 ring-1 ring-[#b84a56]'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className={`p-1.5 rounded-lg shrink-0 ${chosenDestination === 'endsheet_front' && !isBackgroundOnly ? 'bg-[#b84a56] text-white' : 'bg-slate-100 text-slate-600'}`}>
                          <ShieldCheck className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-bold text-slate-900 block truncate">Guarda Dianteira (Endsheet)</span>
                          <span className="text-[10px] text-slate-500 block truncate">Página interna colada no verso da capa</span>
                        </div>
                      </div>

                      {/* 4. Miolo Diário Principal (Frente) */}
                      <div
                        onClick={() => {
                          setChosenDestination('miolo_default');
                          setIsBackgroundOnly(false);
                          setCustomPageName('Layout de Miolo Diário');
                        }}
                        className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all flex items-center gap-2.5 ${
                          chosenDestination === 'miolo_default' && !isBackgroundOnly
                            ? 'border-[#b84a56] bg-[#fdeeed]/60 ring-1 ring-[#b84a56]'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className={`p-1.5 rounded-lg shrink-0 ${chosenDestination === 'miolo_default' && !isBackgroundOnly ? 'bg-[#b84a56] text-white' : 'bg-slate-100 text-slate-600'}`}>
                          <BookOpen className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-bold text-slate-900 block truncate">Miolo Diário (Principal / Frente)</span>
                          <span className="text-[10px] text-slate-500 block truncate">Modelo para os dias da agenda</span>
                        </div>
                      </div>

                      {/* 5. Miolo Verso (Página Par) */}
                      <div
                        onClick={() => {
                          setChosenDestination('miolo_left');
                          setIsBackgroundOnly(false);
                          setCustomPageName('Layout Miolo Verso');
                        }}
                        className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all flex items-center gap-2.5 ${
                          chosenDestination === 'miolo_left' && !isBackgroundOnly
                            ? 'border-[#b84a56] bg-[#fdeeed]/60 ring-1 ring-[#b84a56]'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className={`p-1.5 rounded-lg shrink-0 ${chosenDestination === 'miolo_left' && !isBackgroundOnly ? 'bg-[#b84a56] text-white' : 'bg-slate-100 text-slate-600'}`}>
                          <ArrowRightLeft className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-bold text-slate-900 block truncate">Miolo Verso (Página Esquerda / Par)</span>
                          <span className="text-[10px] text-slate-500 block truncate">Layout diferenciado para o verso do dia</span>
                        </div>
                      </div>

                      {/* 6. Nova Página Inicial */}
                      <div
                        onClick={() => {
                          setChosenDestination('new_intro');
                          setIsBackgroundOnly(false);
                          setCustomPageName(`Página Inicial ${currentPage}`);
                        }}
                        className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all flex items-center gap-2.5 ${
                          chosenDestination === 'new_intro' && !isBackgroundOnly
                            ? 'border-[#b84a56] bg-[#fdeeed]/60 ring-1 ring-[#b84a56]'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className={`p-1.5 rounded-lg shrink-0 ${chosenDestination === 'new_intro' && !isBackgroundOnly ? 'bg-[#b84a56] text-white' : 'bg-slate-100 text-slate-600'}`}>
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-bold text-slate-900 block truncate">Nova Página Inicial</span>
                          <span className="text-[10px] text-slate-500 block truncate">Dados pessoais, metas, calendários</span>
                        </div>
                      </div>

                      {/* 7. Divisória Mensal */}
                      <div
                        onClick={() => {
                          setChosenDestination('divider');
                          setIsBackgroundOnly(false);
                          setCustomPageName('Divisória Mensal');
                        }}
                        className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all flex items-center gap-2.5 ${
                          chosenDestination === 'divider' && !isBackgroundOnly
                            ? 'border-[#b84a56] bg-[#fdeeed]/60 ring-1 ring-[#b84a56]'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className={`p-1.5 rounded-lg shrink-0 ${chosenDestination === 'divider' && !isBackgroundOnly ? 'bg-[#b84a56] text-white' : 'bg-slate-100 text-slate-600'}`}>
                          <Layers className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-bold text-slate-900 block truncate">Divisória Mensal (Capa)</span>
                          <span className="text-[10px] text-slate-500 block truncate">Capa de abertura dos meses</span>
                        </div>
                      </div>

                      {/* 8. Apenas Plano de Fundo */}
                      <div
                        onClick={() => {
                          setChosenDestination('replace');
                          setIsBackgroundOnly(true);
                          setCustomPageName('Plano de Fundo');
                        }}
                        className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all flex items-center gap-2.5 ${
                          isBackgroundOnly
                            ? 'border-[#b84a56] bg-[#fdeeed]/60 ring-1 ring-[#b84a56]'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className={`p-1.5 rounded-lg shrink-0 ${isBackgroundOnly ? 'bg-[#b84a56] text-white' : 'bg-slate-100 text-slate-600'}`}>
                          <Palette className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-bold text-slate-900 block truncate">Usar como Plano de Fundo</span>
                          <span className="text-[10px] text-slate-500 block truncate">Apenas a imagem de fundo estática</span>
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Ajustes Úteis */}
                  <div className="pt-2 border-t border-slate-100 space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                      Ajustes Automáticos:
                    </label>

                    <div className="space-y-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs">
                      <label className="flex items-center justify-between cursor-pointer">
                        <span className="font-bold text-slate-800 text-[11px]">
                          Ajustar página ao tamanho do PDF
                        </span>
                        <input
                          type="checkbox"
                          checked={matchPageDimensions}
                          onChange={(e) => setMatchPageDimensions(e.target.checked)}
                          className="accent-[#b84a56] w-4 h-4 cursor-pointer"
                        />
                      </label>

                      <label className="flex items-center justify-between cursor-pointer pt-1.5 border-t border-slate-200/60">
                        <div className="leading-tight">
                          <span className="font-bold text-slate-800 text-[11px] block">
                            Converter datas automaticamente
                          </span>
                          <span className="text-[9px] text-slate-500">
                            Dias e meses mudam sozinhos na agenda
                          </span>
                        </div>
                        <input
                          type="checkbox"
                          checked={autoDetectDynamic}
                          onChange={(e) => handleToggleAutoDetectDynamic(e.target.checked)}
                          className="accent-[#b84a56] w-4 h-4 cursor-pointer"
                        />
                      </label>
                    </div>
                  </div>

                  {/* Espaço flexível */}
                  <div className="flex-1" />

                  {/* Botões de Ação */}
                  <div className="pt-3 border-t border-slate-200 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-3 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                    >
                      Cancelar
                    </button>

                    <button
                      type="button"
                      onClick={handleConfirmSingleImport}
                      disabled={loading || !extractionResult}
                      className="flex-1 px-4 py-2.5 text-xs font-black text-white bg-[#b84a56] hover:bg-[#a23d48] rounded-xl transition-all shadow-md shadow-[#b84a56]/20 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed active:scale-98"
                    >
                      <Sparkles className="w-4 h-4 shrink-0" />
                      <span className="truncate">Importar Página {currentPage}</span>
                    </button>
                  </div>

                </div>
              ) : (
                /* CONTEÚDO 2: MAPEAMENTO EM LOTE DE TODAS AS PÁGINAS */
                <div className="flex-1 flex flex-col p-4 space-y-3 overflow-hidden">
                  
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#b84a56] block">
                      Mapeador Inteligente do PDF
                    </span>
                    <h3 className="text-xs font-black text-slate-900">
                      Defina o que cada página do PDF vai ser:
                    </h3>
                  </div>

                  {/* Presets Rápidos com 1 clique */}
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">
                      Configurações Rápidas:
                    </span>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        onClick={() => applyPreset('cover_and_miolo')}
                        className="p-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-800 transition-colors text-left flex items-center gap-1 cursor-pointer"
                        title="Pág 1: Capa, Pág 2: Guarda, Pág 3: Miolo Frente, Pág 4: Miolo Verso"
                      >
                        <Wand2 className="w-3 h-3 text-[#b84a56] shrink-0" />
                        <span className="truncate">Capa + Miolo</span>
                      </button>
                      <button
                        onClick={() => applyPreset('spread')}
                        className="p-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-800 transition-colors text-left flex items-center gap-1 cursor-pointer"
                        title="Alterna Frente e Verso do Miolo"
                      >
                        <ArrowRightLeft className="w-3 h-3 text-indigo-600 shrink-0" />
                        <span className="truncate">Frente e Verso</span>
                      </button>
                      <button
                        onClick={() => applyPreset('all_intros')}
                        className="p-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-800 transition-colors text-left flex items-center gap-1 cursor-pointer"
                        title="Todas as páginas viram Páginas Iniciais"
                      >
                        <FileText className="w-3 h-3 text-amber-600 shrink-0" />
                        <span className="truncate">Todas Iniciais</span>
                      </button>
                      <button
                        onClick={() => applyPreset('all_daily')}
                        className="p-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-800 transition-colors text-left flex items-center gap-1 cursor-pointer"
                        title="Todas como miolo principal"
                      >
                        <BookOpen className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span className="truncate">Todas Miolo</span>
                      </button>
                    </div>
                  </div>

                  {/* Tabela de Mapeamento com Scroll */}
                  <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 border border-slate-200 rounded-xl p-2 bg-slate-50/50">
                    {pageMappings.map((entry) => (
                      <div
                        key={entry.pageNumber}
                        className={`p-2 rounded-lg border transition-all flex items-center gap-2 ${
                          entry.pageNumber === currentPage
                            ? 'bg-[#fdeeed]/60 border-[#b84a56]'
                            : 'bg-white border-slate-200'
                        }`}
                      >
                        <button
                          onClick={() => handlePageChange(entry.pageNumber)}
                          className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 text-[10px] font-black shrink-0 cursor-pointer"
                          title="Clique para ver a prévia desta página"
                        >
                          Pág. {entry.pageNumber}
                        </button>

                        <div className="flex-1 min-w-0">
                          <select
                            value={entry.destination}
                            onChange={(e) => handleUpdatePageMapping(entry.pageNumber, e.target.value as any)}
                            className="w-full text-xs font-bold text-slate-800 bg-white border border-slate-300 rounded-md px-1.5 py-1 focus:ring-1 focus:ring-[#b84a56] cursor-pointer truncate"
                          >
                            <option value="ignore">❌ Ignorar (Não Importar)</option>
                            <option value="cover_front">📕 Capa Frente (Studio de Capas)</option>
                            <option value="cover_back">📘 Contracapa / Verso (Studio de Capas)</option>
                            <option value="endsheet_front">📑 Guarda Dianteira</option>
                            <option value="endsheet_back">📑 Guarda Traseira</option>
                            <option value="miolo_default">📖 Miolo Diário (Principal / Frente)</option>
                            <option value="miolo_left">📄 Miolo Verso (Página Esquerda)</option>
                            <option value="new_intro">📋 Nova Página Inicial (Dados/Metas)</option>
                            <option value="new_monthly_intro">📅 Nova Abertura Mensal</option>
                            <option value="divider">🗂️ Divisória Mensal (Frente)</option>
                            <option value="divider_verso">🗂️ Divisória Mensal (Verso)</option>
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Botões de Ação para o Lote */}
                  <div className="pt-2 border-t border-slate-200 flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-3 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                    >
                      Cancelar
                    </button>

                    <button
                      type="button"
                      onClick={handleConfirmBatchImport}
                      disabled={loading}
                      className="flex-1 px-4 py-2.5 text-xs font-black text-white bg-[#b84a56] hover:bg-[#a23d48] rounded-xl transition-all shadow-md shadow-[#b84a56]/20 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed active:scale-98"
                    >
                      <Sparkles className="w-4 h-4 shrink-0" />
                      <span className="truncate">
                        Importar Todas ({pageMappings.filter(m => m.destination !== 'ignore').length} páginas)
                      </span>
                    </button>
                  </div>

                </div>
              )}

            </div>
          </div>
        )}

      </div>
    </div>
  );
};
