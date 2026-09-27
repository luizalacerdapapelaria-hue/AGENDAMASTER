import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  X, Upload, FileText, Sparkles, Check, 
  ChevronLeft, ChevronRight, Layers, Eye, RefreshCw, 
  Trash2, AlertCircle, CheckSquare, Square, ZoomIn, ZoomOut, Type, Minus,
  Palette, Sliders, CheckCircle2, Layout, Maximize2, BookOpen, Calendar, ArrowRightLeft, BookmarkPlus
} from 'lucide-react';
import { LayoutElement, PdfImportDestination, PdfImportBatchItem } from '../../../types';
export type { PdfImportDestination, PdfImportBatchItem };
import { extractPdfObjects, getPdfPageCount, PdfPageExtractionResult, PdfExtractionOptions } from '../../../core/logic/pdfExtractor';

export interface PdfPageBatchConfig {
  pageNumber: number;
  selected: boolean;
  customName: string;
  dividerRole: 'front' | 'verso';
  mioloRole: 'front' | 'verso';
}

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

export const PdfImportModal: React.FC<PdfImportModalProps> = ({
  isOpen,
  onClose,
  onImport,
  currentPageTitle = 'Página Atual',
  initialFile = null,
  initialDestination = 'miolo_default',
  currentPageDimensions,
  currentMargins,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [totalPages, setTotalPages] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Destino da importação
  const [destination, setDestination] = useState<PdfImportDestination>(initialDestination || 'miolo_default');
  const [destinationCategory, setDestinationCategory] = useState<'miolo' | 'divider' | 'pages' | 'current' | 'library'>('miolo');
  const [customPageName, setCustomPageName] = useState<string>('Layout de Miolo Diário (PDF)');

  // Configurações de importação em lote de páginas do PDF
  const [pageConfigs, setPageConfigs] = useState<PdfPageBatchConfig[]>([]);
  const [batchProcessing, setBatchProcessing] = useState<{ current: number; total: number; message: string } | null>(null);

  // Ajustes de Proporção e Margens
  const [matchPageDimensions, setMatchPageDimensions] = useState<boolean>(true);
  const [zeroMargins, setZeroMargins] = useState<boolean>(true);

  // Resultado da extração
  const [extractionResult, setExtractionResult] = useState<PdfPageExtractionResult | null>(null);
  const [elements, setElements] = useState<LayoutElement[]>([]);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Modo de Aplicação:
  // pure_vector: Fundo limpo, caixas e textos nativos (recomendado para Miolo e Páginas 100% editáveis)
  // art_whiteout: Mantém a arte decorativa de fundo do PDF e aplica máscara de whiteout nos textos editáveis
  // bg_only: Converte em apenas imagem de plano de fundo sem extrair elementos
  const [importMode, setImportMode] = useState<'pure_vector' | 'art_whiteout' | 'bg_only'>('pure_vector');

  // Visualização e Zoom
  const [canvasZoom, setCanvasZoom] = useState<number>(1);
  const [isEditingText, setIsEditingText] = useState<string | null>(null);

  // Referências
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Executa extração de alta precisão
  const runExtraction = useCallback(async (
    targetFile: File,
    pageNum: number,
    mode: 'pure_vector' | 'art_whiteout' | 'bg_only' = 'pure_vector'
  ) => {
    try {
      setLoading(true);
      setError(null);

      const isArtMode = mode === 'art_whiteout' || mode === 'bg_only';
      const options: PdfExtractionOptions = {
        pageNumber: pageNum,
        groupTextLines: true,
        extractImages: true,
        extractShapes: true,
        renderBackgroundCanvas: isArtMode,
        applyTextWhiteout: mode === 'art_whiteout',
        textColorDefault: '#1f2937'
      };

      const result = await extractPdfObjects(targetFile, options);
      setExtractionResult(result);
      setElements(result.elements);

      // Por padrão, seleciona TODOS os elementos editáveis extraídos
      setSelectedIds(new Set(result.elements.map(e => e.id)));
      if (result.elements.length > 0) {
        setSelectedElementId(result.elements[0].id);
      }
    } catch (err: any) {
      console.error('[PdfImportModal] Erro ao extrair PDF:', err);
      setError(err?.message || 'Falha ao processar o arquivo PDF. Verifique se o arquivo não está protegido por senha.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Alterna o modo de arquitetura
  const handleModeChange = (newMode: 'pure_vector' | 'art_whiteout' | 'bg_only') => {
    setImportMode(newMode);
    if (file) {
      runExtraction(file, currentPage, newMode);
    }
  };

  // Atualiza destino e ajusta categoria e nome sugerido automaticamente
  const handleDestinationSelect = (newDest: PdfImportDestination) => {
    setDestination(newDest);
    let cat: 'miolo' | 'divider' | 'pages' | 'current' | 'library' = 'current';
    if (newDest.startsWith('miolo')) {
      cat = 'miolo';
      setDestinationCategory('miolo');
      if (newDest === 'miolo_default') setCustomPageName('Miolo Diário Principal (PDF)');
      else if (newDest === 'miolo_left') setCustomPageName('Miolo Verso - Esquerda (PDF)');
      else if (newDest === 'miolo_right') setCustomPageName('Miolo Frente - Direita (PDF)');
    } else if (newDest === 'divider' || newDest === 'divider_verso') {
      cat = 'divider';
      setDestinationCategory('divider');
      if (newDest === 'divider') setCustomPageName('Capa da Divisória Mensal (PDF)');
      else setCustomPageName('Verso da Divisória Mensal (PDF)');
    } else if (newDest === 'new_intro') {
      cat = 'pages';
      setDestinationCategory('pages');
      setCustomPageName('Nova Página Inicial (PDF)');
    } else if (newDest === 'new_monthly_intro') {
      cat = 'pages';
      setDestinationCategory('pages');
      setCustomPageName('Abertura Mensal (PDF)');
    } else if (newDest === 'save_template') {
      cat = 'library';
      setDestinationCategory('library');
      setCustomPageName('Modelo de Layout Personalizado');
    } else {
      setDestinationCategory('current');
    }

    // Atualiza nomes e papéis de lote das páginas para refletir o novo destino
    setPageConfigs(prev => prev.map((cfg) => {
      const pNum = cfg.pageNumber;
      const isEven = pNum % 2 === 0;
      let newName = cfg.customName;
      let newDivRole = cfg.dividerRole;
      let newMioloRole = cfg.mioloRole;

      if (cat === 'divider') {
        newDivRole = (pNum === 2 || (newDest === 'divider_verso' && pNum === 1)) ? 'verso' : 'front';
        newName = newDivRole === 'verso' ? 'Verso da Divisória' : 'Capa da Divisória (Frente)';
      } else if (cat === 'miolo') {
        newMioloRole = isEven ? 'verso' : 'front';
        newName = isEven ? 'Miolo Verso (Pares / Esquerda)' : 'Miolo Frente (Ímpares / Direita)';
      } else if (newDest === 'new_intro') {
        newName = `Página Inicial ${pNum}`;
      } else if (newDest === 'new_monthly_intro') {
        newName = `Abertura Mensal ${pNum}`;
      } else if (cat === 'library') {
        newName = `Modelo PDF Pág ${pNum}`;
      }

      return {
        ...cfg,
        customName: newName,
        dividerRole: newDivRole,
        mioloRole: newMioloRole
      };
    }));
  };

  // Ao selecionar arquivo
  const handleFileSelect = async (selectedFile: File) => {
    if (!selectedFile || (selectedFile.type !== 'application/pdf' && !selectedFile.name.toLowerCase().endsWith('.pdf'))) {
      setError('Por favor, selecione um arquivo em formato PDF válido.');
      return;
    }

    setFile(selectedFile);
    setFileName(selectedFile.name);
    setCustomPageName(selectedFile.name.replace(/\.[^/.]+$/, ''));
    setCurrentPage(1);

    try {
      setLoading(true);
      const pages = await getPdfPageCount(selectedFile);
      setTotalPages(pages || 1);

      // Inicializa configurações de lote para todas as páginas do PDF
      const initialConfigs: PdfPageBatchConfig[] = Array.from({ length: pages || 1 }, (_, i) => {
        const pNum = i + 1;
        const isEven = pNum % 2 === 0;
        const divRole: 'front' | 'verso' = (pNum === 2 || (destination === 'divider_verso' && pNum === 1)) ? 'verso' : 'front';
        const mioloR: 'front' | 'verso' = isEven ? 'verso' : 'front';

        let name = `${selectedFile.name.replace(/\.[^/.]+$/, '')} - Pág ${pNum}`;
        if (destinationCategory === 'divider' || destination === 'divider' || destination === 'divider_verso') {
          name = divRole === 'verso' ? 'Verso da Divisória' : 'Capa da Divisória (Frente)';
        } else if (destinationCategory === 'miolo' || destination.startsWith('miolo')) {
          name = mioloR === 'verso' ? 'Miolo Verso (Pares / Esquerda)' : 'Miolo Frente (Ímpares / Direita)';
        } else if (destination === 'new_intro') {
          name = `Página Inicial ${pNum}`;
        } else if (destination === 'new_monthly_intro') {
          name = `Abertura Mensal ${pNum}`;
        }

        return {
          pageNumber: pNum,
          selected: true,
          customName: name,
          dividerRole: divRole,
          mioloRole: mioloR
        };
      });
      setPageConfigs(initialConfigs);

      await runExtraction(selectedFile, 1, importMode);
    } catch (err: any) {
      console.error('[PdfImportModal] Erro na leitura do PDF:', err);
      setError('Não foi possível ler o arquivo PDF.');
      setLoading(false);
    }
  };

  // Efeito para carregar arquivo inicial e destino inicial
  useEffect(() => {
    if (isOpen && initialFile && !file) {
      handleFileSelect(initialFile);
    }
  }, [isOpen, initialFile]);

  useEffect(() => {
    if (isOpen && initialDestination) {
      handleDestinationSelect(initialDestination);
    }
  }, [isOpen, initialDestination]);

  // Mudar página
  const handlePageChange = async (newPage: number) => {
    if (!file || newPage < 1 || newPage > totalPages || newPage === currentPage) return;
    setCurrentPage(newPage);
    await runExtraction(file, newPage, importMode);
  };

  // Ações de seleção de páginas em lote
  const togglePageSelection = (pageNumber: number) => {
    setPageConfigs(prev => prev.map(p => p.pageNumber === pageNumber ? { ...p, selected: !p.selected } : p));
  };

  const selectAllPages = (selectAll: boolean) => {
    setPageConfigs(prev => prev.map(p => ({ ...p, selected: selectAll })));
  };

  const selectOnlyCurrentPage = () => {
    setPageConfigs(prev => prev.map(p => ({ ...p, selected: p.pageNumber === currentPage })));
  };

  const setPageRole = (pageNumber: number, role: 'front' | 'verso') => {
    setPageConfigs(prev => prev.map(p => {
      if (p.pageNumber !== pageNumber) return p;
      if (destinationCategory === 'divider') {
        return { 
          ...p, 
          dividerRole: role, 
          customName: role === 'verso' ? 'Verso da Divisória' : 'Capa da Divisória (Frente)' 
        };
      } else {
        return { 
          ...p, 
          mioloRole: role, 
          customName: role === 'verso' ? 'Miolo Verso (Pares / Esquerda)' : 'Miolo Frente (Ímpares / Direita)' 
        };
      }
    }));
  };

  const setPageCustomName = (pageNumber: number, name: string) => {
    setPageConfigs(prev => prev.map(p => p.pageNumber === pageNumber ? { ...p, customName: name } : p));
  };

  // Alternar inclusão de elemento
  const toggleElementSelection = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === elements.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(elements.map(e => e.id)));
    }
  };

  // Atualizar elemento
  const updateElement = (id: string, updates: Partial<LayoutElement>) => {
    setElements(prev => prev.map(el => {
      if (el.id === id) {
        return {
          ...el,
          ...updates,
          style: {
            ...el.style,
            ...(updates.style || {})
          }
        };
      }
      return el;
    }));
  };

  // Remover elemento
  const removeElement = (id: string) => {
    setElements(prev => prev.filter(e => e.id !== id));
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    if (selectedElementId === id) {
      setSelectedElementId(null);
    }
  };

  // Finalizar importação (Individual ou em Lote)
  const handleFinalImport = async () => {
    if (!file) return;

    const activePages = pageConfigs.filter(p => p.selected);
    if (activePages.length === 0) {
      alert('Selecione ao menos 1 página do PDF para importar.');
      return;
    }

    const isBgOnly = importMode === 'bg_only';
    const isArtMode = importMode === 'art_whiteout' || importMode === 'bg_only';

    // Caso 1: Apenas 1 página selecionada
    if (activePages.length === 1) {
      const targetPage = activePages[0];
      let result = extractionResult;
      
      // Se a página selecionada não for a que está atualmente carregada, extraímos ela
      if (!result || result.pageNumber !== targetPage.pageNumber) {
        setLoading(true);
        try {
          result = await extractPdfObjects(file, {
            pageNumber: targetPage.pageNumber,
            groupTextLines: true,
            extractImages: true,
            extractShapes: true,
            renderBackgroundCanvas: isArtMode,
            applyTextWhiteout: importMode === 'art_whiteout',
            textColorDefault: '#1f2937'
          });
        } catch (err: any) {
          setLoading(false);
          alert('Erro ao extrair página: ' + (err?.message || 'Falha no PDF'));
          return;
        }
        setLoading(false);
      }

      const finalElements = isBgOnly ? [] : (result.pageNumber === currentPage ? elements.filter(el => selectedIds.has(el.id)) : result.elements);

      if (!isBgOnly && finalElements.length === 0) {
        alert('Nenhum elemento selecionado para importação de layout.');
        return;
      }

      const hasBg = (importMode === 'art_whiteout' || importMode === 'bg_only') && !!result.backgroundDataUrl;

      let finalDest = destination;
      if (destinationCategory === 'divider') {
        finalDest = targetPage.dividerRole === 'verso' ? 'divider_verso' : 'divider';
      } else if (destinationCategory === 'miolo' && destination !== 'miolo_default') {
        finalDest = targetPage.mioloRole === 'verso' ? 'miolo_left' : 'miolo_right';
      }

      onImport(
        finalElements,
        finalDest,
        {
          pageName: targetPage.customName || customPageName,
          widthMm: result.viewport.widthMm,
          heightMm: result.viewport.heightMm,
          matchPageDimensions,
          zeroMargins,
          // No modo pure_vector: Fundo limpo sem imagem (zero duplicação, 100% nativo)
          backgroundImage: hasBg ? result.backgroundDataUrl : undefined,
          clearExistingElements: finalDest === 'replace' || finalDest === 'miolo_default' || finalDest === 'miolo_left' || finalDest === 'miolo_right' || finalDest === 'divider' || finalDest === 'divider_verso',
          clearBackground: importMode === 'pure_vector',
          applyBackground: hasBg
        }
      );
      onClose();
      return;
    }

    // Caso 2: Importação em Lote de Múltiplas Páginas
    setBatchProcessing({
      current: 1,
      total: activePages.length,
      message: `Iniciando importação de ${activePages.length} páginas...`
    });

    try {
      const batchItems: PdfImportBatchItem[] = [];
      let firstViewport = extractionResult?.viewport;

      for (let i = 0; i < activePages.length; i++) {
        const pConfig = activePages[i];
        setBatchProcessing({
          current: i + 1,
          total: activePages.length,
          message: `Processando página ${pConfig.pageNumber} (${i + 1} de ${activePages.length})... Convertendo vetores e textos`
        });

        // Pausa breve para a renderização visual do progresso
        await new Promise(r => setTimeout(r, 20));

        let res: PdfPageExtractionResult;
        if (extractionResult && extractionResult.pageNumber === pConfig.pageNumber) {
          res = extractionResult;
        } else {
          res = await extractPdfObjects(file, {
            pageNumber: pConfig.pageNumber,
            groupTextLines: true,
            extractImages: true,
            extractShapes: true,
            renderBackgroundCanvas: isArtMode,
            applyTextWhiteout: importMode === 'art_whiteout',
            textColorDefault: '#1f2937'
          });
        }

        if (!firstViewport) firstViewport = res.viewport;

        const pageHasBg = (importMode === 'art_whiteout' || importMode === 'bg_only') && !!res.backgroundDataUrl;
        const pageElements = isBgOnly ? [] : (res.pageNumber === currentPage ? elements.filter(el => selectedIds.has(el.id)) : res.elements);

        let itemDest = destination;
        if (destinationCategory === 'divider') {
          itemDest = pConfig.dividerRole === 'verso' ? 'divider_verso' : 'divider';
        } else if (destinationCategory === 'miolo') {
          itemDest = pConfig.mioloRole === 'verso' ? 'miolo_left' : 'miolo_right';
        }

        batchItems.push({
          pageNumber: pConfig.pageNumber,
          pageName: pConfig.customName,
          elements: pageElements,
          backgroundImage: pageHasBg ? res.backgroundDataUrl : undefined,
          destination: itemDest,
          isDividerVerso: destinationCategory === 'divider' ? (pConfig.dividerRole === 'verso') : (pConfig.mioloRole === 'verso')
        });
      }

      setBatchProcessing({
        current: activePages.length,
        total: activePages.length,
        message: 'Aplicando layouts e organizando estrutura no projeto...'
      });
      await new Promise(r => setTimeout(r, 40));

      const primaryDest = destinationCategory === 'divider' 
        ? (activePages[0].dividerRole === 'verso' ? 'divider_verso' : 'divider')
        : destination;

      onImport(
        batchItems[0].elements,
        primaryDest,
        {
          pageName: customPageName,
          widthMm: firstViewport?.widthMm,
          heightMm: firstViewport?.heightMm,
          matchPageDimensions,
          zeroMargins,
          backgroundImage: batchItems[0].backgroundImage,
          clearExistingElements: true,
          clearBackground: importMode === 'pure_vector',
          applyBackground: isArtMode,
          batchPages: batchItems
        }
      );

      onClose();
    } catch (err: any) {
      console.error('[PdfImportModal] Erro na extração em lote:', err);
      alert('Erro ao extrair lote de páginas do PDF: ' + (err?.message || 'Falha no processamento'));
    } finally {
      setBatchProcessing(null);
    }
  };

  // Estatísticas de elementos
  const textCount = elements.filter(e => e.type === 'text').length;
  const lineCount = elements.filter(e => e.type === 'lines').length;
  const shapeCount = elements.filter(e => ['box', 'circle'].includes(e.type)).length;
  const imageCount = elements.filter(e => e.type === 'image').length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-[1260px] max-w-[98vw] h-[93vh] flex flex-col overflow-hidden">
        
        {/* Header Superior */}
        <div className="px-6 py-3.5 border-b border-gray-100 flex items-center justify-between bg-gray-50/80">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-indigo-600 to-indigo-500 p-2 rounded-xl text-white shadow-sm shadow-indigo-200">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-gray-900">Importar Layout Editável do PDF</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wider">
                  Objetos Nativos Editáveis • Sem Fundo Duplicado
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Converte retângulos, cores de preenchimento, contornos, textos e linhas do PDF em elementos 100% editáveis no Agenda Master.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-xl transition-colors cursor-pointer"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo do Modal */}
        {!file ? (
          /* Dropzone Inicial */
          <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gray-50/40">
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
              className="w-full max-w-xl border-2 border-dashed border-indigo-200 hover:border-indigo-500 rounded-2xl p-12 flex flex-col items-center justify-center text-center bg-white hover:bg-indigo-50/20 transition-all cursor-pointer shadow-sm hover:shadow-md group"
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
              <div className="w-16 h-16 bg-indigo-50 group-hover:bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-4 transition-colors">
                <Upload className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-1">
                Selecione o PDF do CorelDraw, Canva, Illustrator ou InDesign
              </h3>
              <p className="text-xs text-gray-500 max-w-md mb-4 leading-relaxed">
                Cada retângulo preenchido se torna uma caixa com cor e contorno editáveis. Cada texto se torna um bloco de texto nativo com alinhamento e posição exatos.
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <span className="inline-flex items-center text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                  ✓ Cores de Preenchimento & Contorno Editáveis
                </span>
                <span className="inline-flex items-center text-[11px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-lg">
                  ✓ Textos Unificados (Sem Espaços Duplos)
                </span>
                <span className="inline-flex items-center text-[11px] font-semibold text-gray-700 bg-gray-100 border border-gray-200 px-2.5 py-1 rounded-lg">
                  ✓ Sem Fundo Estático Duplicado
                </span>
              </div>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2 max-w-xl w-full">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{error}</span>
              </div>
            )}
          </div>
        ) : (
          /* Visualizador Interativo */
          <div className="flex-1 flex overflow-hidden">
            
            {/* Painel Esquerdo: Canvas com os Elementos Nativos Extraídos */}
            <div className="flex-1 flex flex-col bg-neutral-200/50 overflow-hidden border-r border-gray-200">
              
              {/* Barra de Controle de Visualização */}
              <div className="px-4 py-2 bg-white border-b border-gray-200 flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 bg-gray-100 px-2.5 py-1 rounded-lg">
                    <FileText className="w-3.5 h-3.5 text-indigo-600" />
                    <span className="font-semibold text-gray-700 truncate max-w-[200px]" title={fileName}>
                      {fileName}
                    </span>
                  </div>

                  {totalPages > 1 && (
                    <div className="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded-lg">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage <= 1 || loading}
                        className="p-1 text-gray-600 hover:text-indigo-600 disabled:opacity-30 cursor-pointer"
                        title="Página Anterior"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>
                      <span className="font-semibold text-gray-700 text-[11px] px-1">
                        Pág. {currentPage} de {totalPages}
                      </span>
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage >= totalPages || loading}
                        className="p-1 text-gray-600 hover:text-indigo-600 disabled:opacity-30 cursor-pointer"
                        title="Próxima Página"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {extractionResult && (
                    <span className="text-[11px] font-mono text-gray-500 bg-gray-50 px-2 py-0.5 rounded border border-gray-200">
                      {extractionResult.viewport.widthMm} × {extractionResult.viewport.heightMm} mm
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-medium ${
                    importMode === 'pure_vector'
                      ? 'text-emerald-800 bg-emerald-50 border-emerald-200'
                      : 'text-indigo-800 bg-indigo-50 border-indigo-200'
                  }`}>
                    {importMode === 'pure_vector' ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Fundo Limpo • Objetos 100% Nativos</span>
                      </>
                    ) : (
                      <>
                        <Layers className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Arte de Fundo • Máscara Whiteout Ativa</span>
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-1 bg-gray-100 px-1 py-0.5 rounded-lg">
                    <button
                      onClick={() => setCanvasZoom(z => Math.max(0.4, z - 0.1))}
                      className="p-1 text-gray-600 hover:text-indigo-600 cursor-pointer"
                      title="Diminuir Zoom"
                    >
                      <ZoomOut className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[10px] font-mono text-gray-600 w-9 text-center font-bold">
                      {Math.round(canvasZoom * 100)}%
                    </span>
                    <button
                      onClick={() => setCanvasZoom(z => Math.min(1.5, z + 0.1))}
                      className="p-1 text-gray-600 hover:text-indigo-600 cursor-pointer"
                      title="Aumentar Zoom"
                    >
                      <ZoomIn className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      setFile(null);
                      setExtractionResult(null);
                      setElements([]);
                      setPageConfigs([]);
                    }}
                    className="text-gray-500 hover:text-red-600 px-2 py-1 rounded hover:bg-red-50 text-[11px] font-medium transition-colors cursor-pointer"
                  >
                    Trocar PDF
                  </button>
                </div>
              </div>

              {/* Barra de Seleção e Mapeamento de Páginas do PDF (Importação em Lote / Seleção Múltipla) */}
              {totalPages > 1 && (
                <div className="bg-indigo-50/70 border-b border-indigo-100 px-4 py-2 shrink-0 flex flex-col gap-1.5 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-gray-800">
                        <Layers className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Páginas para Importar ({pageConfigs.filter(p => p.selected).length} de {totalPages} selecionadas)</span>
                      </div>
                      <span className="text-[10px] text-gray-500 hidden sm:inline">
                        • Marque as páginas que deseja importar de uma única vez
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => selectAllPages(true)}
                        className="text-[10px] font-bold text-indigo-700 hover:text-indigo-900 bg-white hover:bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded transition-colors cursor-pointer shadow-2xs"
                        title="Marcar todas as páginas para importação"
                      >
                        ✓ Selecionar Todas
                      </button>
                      <button
                        type="button"
                        onClick={() => selectOnlyCurrentPage()}
                        className="text-[10px] font-bold text-gray-700 hover:text-gray-900 bg-white hover:bg-gray-50 border border-gray-200 px-2 py-0.5 rounded transition-colors cursor-pointer shadow-2xs"
                        title="Marcar apenas a página visualizada atualmente"
                      >
                        Apenas Pág. {currentPage}
                      </button>
                      <button
                        type="button"
                        onClick={() => selectAllPages(false)}
                        className="text-[10px] font-medium text-gray-400 hover:text-red-600 bg-white hover:bg-red-50 border border-gray-200 px-2 py-0.5 rounded transition-colors cursor-pointer shadow-2xs"
                        title="Desmarcar todas"
                      >
                        Limpar
                      </button>
                    </div>
                  </div>

                  {/* Chips horizontais de páginas com checkboxes e seletores de papel */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5 custom-scrollbar">
                    {pageConfigs.map((cfg) => {
                      const isCurrent = cfg.pageNumber === currentPage;
                      return (
                        <div
                          key={cfg.pageNumber}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs shrink-0 transition-all ${
                            isCurrent
                              ? 'bg-white border-indigo-500 ring-2 ring-indigo-500/20 shadow-xs'
                              : cfg.selected
                                ? 'bg-white border-indigo-200/80 text-gray-800 shadow-2xs'
                                : 'bg-gray-100/70 border-gray-200 text-gray-400 opacity-60 hover:opacity-100'
                          }`}
                        >
                          {/* Checkbox de Inclusão no Lote */}
                          <button
                            type="button"
                            onClick={() => togglePageSelection(cfg.pageNumber)}
                            className="text-gray-400 hover:text-indigo-600 cursor-pointer"
                            title={cfg.selected ? "Desmarcar esta página do lote de importação" : "Incluir esta página no lote de importação"}
                          >
                            {cfg.selected ? (
                              <CheckSquare className="w-4 h-4 text-indigo-600" />
                            ) : (
                              <Square className="w-4 h-4 text-gray-300" />
                            )}
                          </button>

                          {/* Botão de Ver no Canvas */}
                          <button
                            type="button"
                            onClick={() => handlePageChange(cfg.pageNumber)}
                            className={`font-bold text-[11px] cursor-pointer hover:text-indigo-600 flex items-center gap-1 ${
                              isCurrent ? 'text-indigo-700 font-extrabold' : 'text-gray-700'
                            }`}
                            title="Clique para visualizar esta página no canvas"
                          >
                            <span>Pág. {cfg.pageNumber}</span>
                            {isCurrent && <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse"></span>}
                          </button>

                          {/* Seletor de Papel / Função para Divisórias */}
                          {destinationCategory === 'divider' && cfg.selected && (
                            <button
                              type="button"
                              onClick={() => setPageRole(cfg.pageNumber, cfg.dividerRole === 'front' ? 'verso' : 'front')}
                              className={`text-[9px] font-bold px-1.5 py-0.5 rounded cursor-pointer transition-all flex items-center gap-1 shadow-2xs ${
                                cfg.dividerRole === 'verso'
                                  ? 'bg-purple-100 text-purple-800 border border-purple-300 hover:bg-purple-200'
                                  : 'bg-indigo-100 text-indigo-800 border border-indigo-300 hover:bg-indigo-200'
                              }`}
                              title="Clique para alternar entre Capa (Frente) e Verso da Divisória"
                            >
                              {cfg.dividerRole === 'verso' ? '📄 Verso' : '📑 Frente'}
                            </button>
                          )}

                          {/* Seletor de Papel / Função para Miolo */}
                          {destinationCategory === 'miolo' && cfg.selected && (
                            <button
                              type="button"
                              onClick={() => setPageRole(cfg.pageNumber, cfg.mioloRole === 'front' ? 'verso' : 'front')}
                              className={`text-[9px] font-bold px-1.5 py-0.5 rounded cursor-pointer transition-all flex items-center gap-1 shadow-2xs ${
                                cfg.mioloRole === 'verso'
                                  ? 'bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200'
                                  : 'bg-indigo-100 text-indigo-800 border border-indigo-300 hover:bg-indigo-200'
                              }`}
                              title="Clique para alternar entre Frente (Ímpar) e Verso (Par)"
                            >
                              {cfg.mioloRole === 'verso' ? '📖 Verso (Par)' : '📖 Frente (Ímpar)'}
                            </button>
                          )}

                          {/* Nome da Página para Páginas Iniciais / Mensais */}
                          {destinationCategory === 'pages' && cfg.selected && (
                            <input
                              type="text"
                              value={cfg.customName}
                              onChange={(e) => setPageCustomName(cfg.pageNumber, e.target.value)}
                              className="text-[10px] px-1.5 py-0.5 bg-gray-50 border border-gray-200 rounded max-w-[120px] focus:bg-white focus:ring-1 focus:ring-indigo-500 outline-none"
                              placeholder="Nome da página..."
                              title="Nome com que esta página será criada"
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Área do Canvas: Mostra os Elementos Editáveis Exatamente como vão para o Editor */}
              <div 
                ref={containerRef}
                className="flex-1 overflow-auto p-6 flex items-center justify-center relative select-none"
              >
                {loading ? (
                  <div className="flex flex-col items-center justify-center gap-3 bg-white p-6 rounded-2xl shadow-xl border border-gray-200">
                    <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-xs font-semibold text-gray-700">
                      Convertendo vetores e textos em elementos editáveis...
                    </span>
                  </div>
                ) : error ? (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2 max-w-md">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                    <span>{error}</span>
                  </div>
                ) : (
                  <div 
                    style={{
                      transform: `scale(${canvasZoom})`,
                      transformOrigin: 'center center',
                      transition: 'transform 0.12s ease'
                    }}
                    className="relative bg-white shadow-2xl rounded-sm border border-gray-300"
                  >
                    {/* Viewport da Página */}
                    <div
                      style={{
                        width: `${extractionResult?.viewport.width || 595}px`,
                        height: `${extractionResult?.viewport.height || 842}px`,
                        position: 'relative',
                        overflow: 'hidden',
                        backgroundColor: '#ffffff'
                      }}
                      onClick={() => setSelectedElementId(null)}
                    >
                      {/* Fundo decorativo renderizado apenas quando o usuário escolher 'Arte + Whiteout' */}
                      {importMode === 'art_whiteout' && extractionResult?.backgroundDataUrl && (
                        <img
                          src={extractionResult.backgroundDataUrl}
                          alt="Fundo decorativo original"
                          className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none opacity-95"
                        />
                      )}

                      {/* Renderização de todos os elementos editáveis nas posições exatas */}
                      {elements.map((el) => {
                        const isSelected = selectedElementId === el.id;
                        const isIncluded = selectedIds.has(el.id);

                        const widthPt = extractionResult?.viewport.width || 595;
                        const heightPt = extractionResult?.viewport.height || 842;
                        const leftPx = (el.x / 100) * widthPt;
                        const topPx = (el.y / 100) * heightPt;
                        const widthPx = (el.w / 100) * widthPt;
                        const heightPx = (el.h / 100) * heightPt;

                        if (!isIncluded) return null;

                        return (
                          <div
                            key={el.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedElementId(el.id);
                            }}
                            onDoubleClick={(e) => {
                              e.stopPropagation();
                              if (el.type === 'text') {
                                setIsEditingText(el.id);
                              }
                            }}
                            style={{
                              position: 'absolute',
                              left: `${leftPx}px`,
                              top: `${topPx}px`,
                              width: `${widthPx}px`,
                              height: `${heightPx}px`,
                              zIndex: isSelected ? 999 : el.zIndex,
                              backgroundColor: el.type === 'text' || el.type === 'lines'
                                ? 'transparent'
                                : (el.style.backgroundColor || 'transparent'),
                              border: el.type === 'lines'
                                ? undefined
                                : (el.style.borderWidth && el.style.borderWidth > 0
                                    ? `${el.style.borderWidth}px ${el.style.borderStyle || 'solid'} ${el.style.borderColor || '#000000'}`
                                    : undefined),
                              borderRadius: el.style.borderRadius
                                ? `${el.style.borderRadius}px`
                                : (el.type === 'circle' ? '9999px' : undefined),
                              opacity: el.style.opacity ?? 1,
                            }}
                            className={`group cursor-pointer transition-shadow ${
                              isSelected
                                ? 'ring-2 ring-indigo-600 shadow-md'
                                : 'hover:ring-1 hover:ring-indigo-300'
                            }`}
                          >
                            {el.type === 'text' ? (
                              isEditingText === el.id ? (
                                <input
                                  type="text"
                                  autoFocus
                                  defaultValue={el.content || ''}
                                  onBlur={(e) => {
                                    updateElement(el.id, { content: e.target.value });
                                    setIsEditingText(null);
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      updateElement(el.id, { content: (e.target as HTMLInputElement).value });
                                      setIsEditingText(null);
                                    }
                                  }}
                                  className="w-full h-full p-0.5 text-xs bg-white border border-indigo-500 rounded outline-none"
                                />
                              ) : (
                                <div
                                  style={{
                                    fontFamily: el.style.fontFamily || 'Inter',
                                    fontSize: `${el.style.fontSize || 12}px`,
                                    fontWeight: el.style.fontWeight || 'normal',
                                    fontStyle: el.style.fontStyle || 'normal',
                                    color: el.style.color || '#1f2937',
                                    lineHeight: 1.22,
                                    whiteSpace: 'nowrap',
                                  }}
                                  className="w-full h-full flex items-center px-0.5 pointer-events-none"
                                >
                                  {el.content}
                                </div>
                              )
                            ) : el.type === 'lines' ? (
                              <div className="w-full h-full flex items-center justify-center pointer-events-none">
                                <svg className="w-full h-full overflow-visible">
                                  <line
                                    x1={el.w < el.h ? "50%" : "0"}
                                    y1={el.w < el.h ? "0" : "50%"}
                                    x2={el.w < el.h ? "50%" : "100%"}
                                    y2={el.w < el.h ? "100%" : "50%"}
                                    stroke={el.style.color || el.style.borderColor || '#374151'}
                                    strokeWidth={Math.max(1, (el.style.borderWidth || 1) * canvasZoom)}
                                    shapeRendering="crispEdges"
                                    strokeDasharray={
                                      el.style.borderStyle === 'dashed'
                                        ? '5,5'
                                        : el.style.borderStyle === 'dotted'
                                        ? '2,2'
                                        : 'none'
                                    }
                                  />
                                </svg>
                              </div>
                            ) : el.type === 'image' ? (
                              <img
                                src={el.style.imageUrl}
                                alt={el.name || 'Imagem'}
                                className="w-full h-full object-contain pointer-events-none"
                              />
                            ) : (
                              <div className="w-full h-full pointer-events-none" />
                            )}

                            {isSelected && (
                              <div className="absolute -top-5 left-0 bg-indigo-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow flex items-center gap-1 whitespace-nowrap pointer-events-none z-50">
                                {el.type === 'text' ? <Type className="w-2.5 h-2.5" /> : el.type === 'lines' ? <Minus className="w-2.5 h-2.5" /> : <Square className="w-2.5 h-2.5" />}
                                <span>{el.name}</span>
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

            {/* Painel Direito: Lista de Camadas e Ajustes */}
            <div className="w-[390px] bg-white flex flex-col h-full border-l border-gray-200">
              
              {/* Header do Painel */}
              <div className="p-3.5 border-b border-gray-100 flex items-center justify-between bg-gray-50/60">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                    Elementos Editáveis
                  </h3>
                </div>
                <div className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                  <span>{selectedIds.size} / {elements.length} ativos</span>
                </div>
              </div>

              {/* Resumo de Elementos Encontrados */}
              <div className="p-3 bg-indigo-50/40 border-b border-indigo-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3 text-gray-600 text-[11px]">
                  <span>📝 <strong>{textCount}</strong> textos</span>
                  {lineCount > 0 && <span>📏 <strong>{lineCount}</strong> linhas</span>}
                  <span>🎨 <strong>{shapeCount}</strong> formas</span>
                  {imageCount > 0 && <span>🖼️ <strong>{imageCount}</strong> imagens</span>}
                </div>
                <button
                  type="button"
                  onClick={toggleSelectAll}
                  className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                >
                  {selectedIds.size === elements.length ? 'Desmarcar' : 'Marcar Todos'}
                </button>
              </div>

              {/* Lista com Rolagem */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                
                {/* 1. Modo de Aplicação no AgendaMaster */}
                <div className="space-y-2 p-3 bg-gray-50/80 rounded-xl border border-gray-200">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-gray-800 uppercase tracking-wider block">
                      Como usar este PDF?
                    </label>
                    <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">
                      {importMode === 'pure_vector' ? '100% Editável' : (importMode === 'art_whiteout' ? 'Editável + Arte' : 'Apenas Fundo')}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-1.5">
                    {/* Opção 1: Pure Vector (Layout Nativo) */}
                    <button
                      type="button"
                      onClick={() => handleModeChange('pure_vector')}
                      className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                        importMode === 'pure_vector'
                          ? 'border-indigo-600 bg-white ring-2 ring-indigo-500/20 text-gray-900 shadow-sm'
                          : 'border-gray-200 hover:border-gray-300 bg-white/60 text-gray-600'
                      }`}
                    >
                      <div className={`mt-0.5 p-1 rounded shrink-0 ${importMode === 'pure_vector' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                        <Sparkles className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="text-[11px] font-bold flex items-center gap-1.5">
                          <span>Layout 100% Nativo & Editável</span>
                          <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-semibold">Recomendado</span>
                        </div>
                        <p className="text-[10px] text-gray-500 mt-0.5 leading-relaxed">
                          Fundo limpo. Caixas, molduras e textos convertidos em elementos nativos e editáveis do AgendaMaster. Zero duplicação.
                        </p>
                      </div>
                    </button>

                    {/* Opção 2: Layout + Arte */}
                    <button
                      type="button"
                      onClick={() => handleModeChange('art_whiteout')}
                      className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                        importMode === 'art_whiteout'
                          ? 'border-indigo-600 bg-white ring-2 ring-indigo-500/20 text-gray-900 shadow-sm'
                          : 'border-gray-200 hover:border-gray-300 bg-white/60 text-gray-600'
                      }`}
                    >
                      <div className={`mt-0.5 p-1 rounded shrink-0 ${importMode === 'art_whiteout' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                        <Layers className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="text-[11px] font-bold flex items-center gap-1.5">
                          <span>Layout Editável + Arte de Fundo</span>
                        </div>
                        <p className="text-[10px] text-gray-500 mt-0.5 leading-relaxed">
                          Elementos nativos editáveis sobrepostos à imagem de fundo original do PDF.
                        </p>
                      </div>
                    </button>

                    {/* Opção 3: Apenas Fundo Estático */}
                    <button
                      type="button"
                      onClick={() => handleModeChange('bg_only')}
                      className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                        importMode === 'bg_only'
                          ? 'border-indigo-600 bg-white ring-2 ring-indigo-500/20 text-gray-900 shadow-sm'
                          : 'border-gray-200 hover:border-gray-300 bg-white/60 text-gray-600'
                      }`}
                    >
                      <div className={`mt-0.5 p-1 rounded shrink-0 ${importMode === 'bg_only' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                        <Palette className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="text-[11px] font-bold flex items-center gap-1.5">
                          <span>Apenas Plano de Fundo Estático</span>
                        </div>
                        <p className="text-[10px] text-gray-500 mt-0.5 leading-relaxed">
                          Aplica a página inteira como imagem de fundo sem extrair elementos individuais.
                        </p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* 2. Destino do Layout no Projeto */}
                <div className="space-y-2.5 p-3 bg-white rounded-xl border border-gray-200 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-gray-800 uppercase tracking-wider block">
                      Destino do Layout no Projeto
                    </label>
                  </div>

                  {/* Abas de Categorias de Destino */}
                  <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg text-[11px] font-medium">
                    <button
                      type="button"
                      onClick={() => {
                        setDestinationCategory('miolo');
                        if (!destination.startsWith('miolo')) handleDestinationSelect('miolo_default');
                      }}
                      className={`flex-1 py-1.5 px-1.5 rounded-md flex items-center justify-center gap-1 transition-all cursor-pointer ${
                        destinationCategory === 'miolo'
                          ? 'bg-white text-indigo-700 font-bold shadow-xs'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <BookOpen className="w-3 h-3" />
                      <span>Miolo</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDestinationCategory('divider');
                        if (destination !== 'divider' && destination !== 'divider_verso') handleDestinationSelect('divider');
                      }}
                      className={`flex-1 py-1.5 px-1.5 rounded-md flex items-center justify-center gap-1 transition-all cursor-pointer ${
                        destinationCategory === 'divider'
                          ? 'bg-white text-indigo-700 font-bold shadow-xs'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <Layers className="w-3 h-3" />
                      <span>Divisórias</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDestinationCategory('pages');
                        if (destination !== 'new_intro' && destination !== 'new_monthly_intro') handleDestinationSelect('new_intro');
                      }}
                      className={`flex-1 py-1.5 px-1.5 rounded-md flex items-center justify-center gap-1 transition-all cursor-pointer ${
                        destinationCategory === 'pages'
                          ? 'bg-white text-indigo-700 font-bold shadow-xs'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <FileText className="w-3 h-3" />
                      <span>Páginas</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDestinationCategory('current');
                        if (destination !== 'replace' && destination !== 'append') handleDestinationSelect('replace');
                      }}
                      className={`flex-1 py-1.5 px-1.5 rounded-md flex items-center justify-center gap-1 transition-all cursor-pointer ${
                        destinationCategory === 'current'
                          ? 'bg-white text-indigo-700 font-bold shadow-xs'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Atual</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDestinationCategory('library');
                        handleDestinationSelect('save_template');
                      }}
                      className={`flex-1 py-1.5 px-1.5 rounded-md flex items-center justify-center gap-1 transition-all cursor-pointer ${
                        destinationCategory === 'library'
                          ? 'bg-white text-amber-700 font-bold shadow-xs'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <BookmarkPlus className="w-3 h-3" />
                      <span>Modelos</span>
                    </button>
                  </div>

                  {/* Opções da Categoria Miolo */}
                  {destinationCategory === 'miolo' && (
                    <div className="space-y-1.5 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          handleDestinationSelect('miolo_default');
                          setPageRole(currentPage, 'front');
                        }}
                        className={`w-full p-2 rounded-lg border text-left transition-all cursor-pointer flex items-start justify-between gap-2 ${
                          destination === 'miolo_default'
                            ? 'border-indigo-600 bg-indigo-50/70 ring-1 ring-indigo-600 text-indigo-950 font-semibold'
                            : 'border-gray-200 hover:border-gray-300 text-gray-700 bg-white'
                        }`}
                      >
                        <div>
                          <div className="text-[11px] font-bold flex items-center gap-1.5">
                            <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                            <span>Miolo Diário Principal</span>
                          </div>
                          <p className="text-[10px] text-gray-500 mt-0.5">
                            Aplica este layout a todos os dias da agenda.
                          </p>
                        </div>
                        {destination === 'miolo_default' && <Check className="w-4 h-4 text-indigo-600 shrink-0" />}
                      </button>

                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            handleDestinationSelect('miolo_left');
                            setPageRole(currentPage, 'verso');
                          }}
                          className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${
                            destination === 'miolo_left'
                              ? 'border-indigo-600 bg-indigo-50/70 ring-1 ring-indigo-600 text-indigo-950 font-semibold'
                              : 'border-gray-200 hover:border-gray-300 text-gray-700 bg-white'
                          }`}
                        >
                          <div className="text-[11px] font-bold flex items-center gap-1">
                            <ArrowRightLeft className="w-3 h-3 text-indigo-600" />
                            <span>Verso / Esquerda</span>
                          </div>
                          <p className="text-[9px] text-gray-500 mt-0.5">
                            Páginas pares / semana esquerda
                          </p>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            handleDestinationSelect('miolo_right');
                            setPageRole(currentPage, 'front');
                          }}
                          className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${
                            destination === 'miolo_right'
                              ? 'border-indigo-600 bg-indigo-50/70 ring-1 ring-indigo-600 text-indigo-950 font-semibold'
                              : 'border-gray-200 hover:border-gray-300 text-gray-700 bg-white'
                          }`}
                        >
                          <div className="text-[11px] font-bold flex items-center gap-1">
                            <ArrowRightLeft className="w-3 h-3 text-indigo-600" />
                            <span>Frente / Direita</span>
                          </div>
                          <p className="text-[9px] text-gray-500 mt-0.5">
                            Páginas ímpares / semana direita
                          </p>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Opções da Categoria Divisórias */}
                  {destinationCategory === 'divider' && (
                    <div className="space-y-1.5 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          handleDestinationSelect('divider');
                          setPageRole(currentPage, 'front');
                        }}
                        className={`w-full p-2.5 rounded-lg border text-left transition-all cursor-pointer flex items-start justify-between gap-2 ${
                          destination === 'divider'
                            ? 'border-indigo-600 bg-indigo-50/70 ring-1 ring-indigo-600 text-indigo-950 font-semibold'
                            : 'border-gray-200 hover:border-gray-300 text-gray-700 bg-white'
                        }`}
                      >
                        <div>
                          <div className="text-[11px] font-bold flex items-center gap-1.5">
                            <Layers className="w-3.5 h-3.5 text-indigo-600" />
                            <span>Capa da Divisória Mensal (Frente / Ímpar)</span>
                          </div>
                          <p className="text-[10px] text-gray-500 mt-0.5">
                            Aplica este layout à capa frontal que abre cada mês da agenda.
                          </p>
                        </div>
                        {destination === 'divider' && <Check className="w-4 h-4 text-indigo-600 shrink-0" />}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          handleDestinationSelect('divider_verso');
                          setPageRole(currentPage, 'verso');
                        }}
                        className={`w-full p-2.5 rounded-lg border text-left transition-all cursor-pointer flex items-start justify-between gap-2 ${
                          destination === 'divider_verso'
                            ? 'border-purple-600 bg-purple-50/70 ring-1 ring-purple-600 text-purple-950 font-semibold'
                            : 'border-gray-200 hover:border-gray-300 text-gray-700 bg-white'
                        }`}
                      >
                        <div>
                          <div className="text-[11px] font-bold flex items-center gap-1.5 text-purple-900">
                            <ArrowRightLeft className="w-3.5 h-3.5 text-purple-600" />
                            <span>Verso da Divisória Mensal (Costas / Par)</span>
                          </div>
                          <p className="text-[10px] text-gray-500 mt-0.5">
                            Aplica este layout ao verso impresso atrás da divisória de cada mês.
                          </p>
                        </div>
                        {destination === 'divider_verso' && <Check className="w-4 h-4 text-purple-600 shrink-0" />}
                      </button>
                    </div>
                  )}

                  {/* Opções da Categoria Páginas */}
                  {destinationCategory === 'pages' && (
                    <div className="space-y-1.5 pt-1">
                      <button
                        type="button"
                        onClick={() => handleDestinationSelect('new_intro')}
                        className={`w-full p-2.5 rounded-lg border text-left transition-all cursor-pointer flex items-start justify-between gap-2 ${
                          destination === 'new_intro'
                            ? 'border-indigo-600 bg-indigo-50/70 ring-1 ring-indigo-600 text-indigo-950 font-semibold'
                            : 'border-gray-200 hover:border-gray-300 text-gray-700 bg-white'
                        }`}
                      >
                        <div>
                          <div className="text-[11px] font-bold flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5 text-indigo-600" />
                            <span>Nova Página Inicial (Intro)</span>
                          </div>
                          <p className="text-[10px] text-gray-500 mt-0.5">
                            Cria uma nova página em Páginas Iniciais (dados pessoais, metas, etc.).
                          </p>
                        </div>
                        {destination === 'new_intro' && <Check className="w-4 h-4 text-indigo-600 shrink-0" />}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDestinationSelect('new_monthly_intro')}
                        className={`w-full p-2.5 rounded-lg border text-left transition-all cursor-pointer flex items-start justify-between gap-2 ${
                          destination === 'new_monthly_intro'
                            ? 'border-indigo-600 bg-indigo-50/70 ring-1 ring-indigo-600 text-indigo-950 font-semibold'
                            : 'border-gray-200 hover:border-gray-300 text-gray-700 bg-white'
                        }`}
                      >
                        <div>
                          <div className="text-[11px] font-bold flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                            <span>Nova Abertura Mensal</span>
                          </div>
                          <p className="text-[10px] text-gray-500 mt-0.5">
                            Cria uma página introdutória mensal que antecede os dias de cada mês.
                          </p>
                        </div>
                        {destination === 'new_monthly_intro' && <Check className="w-4 h-4 text-indigo-600 shrink-0" />}
                      </button>
                    </div>
                  )}

                  {/* Opções da Categoria Atual */}
                  {destinationCategory === 'current' && (
                    <div className="space-y-1.5 pt-1">
                      <button
                        type="button"
                        onClick={() => handleDestinationSelect('replace')}
                        className={`w-full p-2.5 rounded-lg border text-left transition-all cursor-pointer flex items-start justify-between gap-2 ${
                          destination === 'replace'
                            ? 'border-indigo-600 bg-indigo-50/70 ring-1 ring-indigo-600 text-indigo-950 font-semibold'
                            : 'border-gray-200 hover:border-gray-300 text-gray-700 bg-white'
                        }`}
                      >
                        <div>
                          <div className="text-[11px] font-bold flex items-center gap-1.5">
                            <RefreshCw className="w-3.5 h-3.5 text-indigo-600" />
                            <span>Substituir Página Atual</span>
                          </div>
                          <p className="text-[10px] text-gray-500 mt-0.5 truncate max-w-[280px]">
                            Aplica diretamente na página aberta: <strong>{currentPageTitle}</strong>
                          </p>
                        </div>
                        {destination === 'replace' && <Check className="w-4 h-4 text-indigo-600 shrink-0" />}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDestinationSelect('append')}
                        className={`w-full p-2.5 rounded-lg border text-left transition-all cursor-pointer flex items-start justify-between gap-2 ${
                          destination === 'append'
                            ? 'border-indigo-600 bg-indigo-50/70 ring-1 ring-indigo-600 text-indigo-950 font-semibold'
                            : 'border-gray-200 hover:border-gray-300 text-gray-700 bg-white'
                        }`}
                      >
                        <div>
                          <div className="text-[11px] font-bold flex items-center gap-1.5">
                            <Layout className="w-3.5 h-3.5 text-indigo-600" />
                            <span>Adicionar à Página Atual</span>
                          </div>
                          <p className="text-[10px] text-gray-500 mt-0.5">
                            Insere os novos elementos sem apagar o conteúdo existente.
                          </p>
                        </div>
                        {destination === 'append' && <Check className="w-4 h-4 text-indigo-600 shrink-0" />}
                      </button>
                    </div>
                  )}

                  {/* Opções da Categoria Modelos */}
                  {destinationCategory === 'library' && (
                    <div className="space-y-1.5 pt-1">
                      <button
                        type="button"
                        onClick={() => handleDestinationSelect('save_template')}
                        className={`w-full p-2.5 rounded-lg border text-left transition-all cursor-pointer flex items-start justify-between gap-2 ${
                          destination === 'save_template'
                            ? 'border-amber-500 bg-amber-50/70 ring-1 ring-amber-500 text-amber-950 font-semibold'
                            : 'border-gray-200 hover:border-gray-300 text-gray-700 bg-white'
                        }`}
                      >
                        <div>
                          <div className="text-[11px] font-bold flex items-center gap-1.5 text-amber-900">
                            <BookmarkPlus className="w-3.5 h-3.5 text-amber-600" />
                            <span>Salvar na Biblioteca de Modelos ⭐</span>
                          </div>
                          <p className="text-[10px] text-gray-500 mt-0.5">
                            Guarda em "Meus Modelos" para aplicar no Miolo ou em qualquer página quando quiser.
                          </p>
                        </div>
                        {destination === 'save_template' && <Check className="w-4 h-4 text-amber-600 shrink-0" />}
                      </button>
                    </div>
                  )}

                  {/* Papel da Página Atual no Projeto (Divisórias ou Miolo) */}
                  {destinationCategory === 'divider' && (
                    <div className="p-2.5 bg-indigo-50/60 border border-indigo-150 rounded-xl space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-bold text-gray-800 uppercase tracking-wider">
                          Papel da Página Atual (Pág. {currentPage})
                        </label>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                          pageConfigs.find(p => p.pageNumber === currentPage)?.dividerRole === 'verso'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-indigo-100 text-indigo-700'
                        }`}>
                          {pageConfigs.find(p => p.pageNumber === currentPage)?.dividerRole === 'verso' ? 'Verso da Divisória' : 'Capa (Frente)'}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setPageRole(currentPage, 'front');
                            handleDestinationSelect('divider');
                          }}
                          className={`py-1.5 px-2 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                            pageConfigs.find(p => p.pageNumber === currentPage)?.dividerRole === 'front'
                              ? 'bg-indigo-600 text-white shadow-xs'
                              : 'bg-white text-gray-700 border border-gray-250 hover:bg-gray-50'
                          }`}
                        >
                          <Layers className="w-3 h-3" />
                          <span>📑 Frente (Capa)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setPageRole(currentPage, 'verso');
                            handleDestinationSelect('divider_verso');
                          }}
                          className={`py-1.5 px-2 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                            pageConfigs.find(p => p.pageNumber === currentPage)?.dividerRole === 'verso'
                              ? 'bg-purple-600 text-white shadow-xs'
                              : 'bg-white text-gray-700 border border-gray-250 hover:bg-gray-50'
                          }`}
                        >
                          <ArrowRightLeft className="w-3 h-3" />
                          <span>📄 Verso da Divisória</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {destinationCategory === 'miolo' && (
                    <div className="p-2.5 bg-indigo-50/60 border border-indigo-150 rounded-xl space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-bold text-gray-800 uppercase tracking-wider">
                          Papel da Página Atual no Miolo (Pág. {currentPage})
                        </label>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                          pageConfigs.find(p => p.pageNumber === currentPage)?.mioloRole === 'verso'
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-indigo-100 text-indigo-700'
                        }`}>
                          {pageConfigs.find(p => p.pageNumber === currentPage)?.mioloRole === 'verso' ? 'Verso (Par)' : 'Frente (Ímpar)'}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setPageRole(currentPage, 'front');
                            handleDestinationSelect('miolo_right');
                          }}
                          className={`py-1.5 px-2 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                            pageConfigs.find(p => p.pageNumber === currentPage)?.mioloRole === 'front'
                              ? 'bg-indigo-600 text-white shadow-xs'
                              : 'bg-white text-gray-700 border border-gray-250 hover:bg-gray-50'
                          }`}
                        >
                          <ArrowRightLeft className="w-3 h-3" />
                          <span>📖 Frente (Ímpar)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setPageRole(currentPage, 'verso');
                            handleDestinationSelect('miolo_left');
                          }}
                          className={`py-1.5 px-2 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                            pageConfigs.find(p => p.pageNumber === currentPage)?.mioloRole === 'verso'
                              ? 'bg-amber-600 text-white shadow-xs'
                              : 'bg-white text-gray-700 border border-gray-250 hover:bg-gray-50'
                          }`}
                        >
                          <ArrowRightLeft className="w-3 h-3" />
                          <span>📖 Verso (Par)</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Card Resumo do Lote de Páginas Selecionadas */}
                  {pageConfigs.filter(p => p.selected).length > 1 && (
                    <div className="p-3 bg-indigo-50/80 border border-indigo-200 rounded-xl space-y-2 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-950">
                          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Importação em Lote ({pageConfigs.filter(p => p.selected).length} Páginas)</span>
                        </div>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-indigo-200/80 text-indigo-900 uppercase">
                          Lote Ativo
                        </span>
                      </div>
                      
                      <p className="text-[10px] text-indigo-900/80 leading-tight">
                        {destinationCategory === 'divider'
                          ? 'As páginas marcadas alimentarão a Capa (Frente) e o Verso das Divisórias Mensais simultaneamente.'
                          : destinationCategory === 'miolo'
                            ? 'As páginas marcadas alimentarão as duas faces do Miolo Diário (Frente e Verso/Par).'
                            : destinationCategory === 'pages'
                              ? `Cada página selecionada será criada como uma nova página em ${destination === 'new_intro' ? 'Páginas Iniciais' : 'Abertura Mensal'}.`
                              : 'Cada página selecionada será salva na sua Biblioteca de Modelos.'}
                      </p>

                      <div className="space-y-1 max-h-32 overflow-y-auto pr-1 custom-scrollbar text-[11px]">
                        {pageConfigs.filter(p => p.selected).map(p => (
                          <div key={p.pageNumber} className="flex items-center justify-between bg-white px-2 py-1 rounded border border-indigo-100 text-gray-700">
                            <span className="font-semibold text-gray-800">Pág. {p.pageNumber}</span>
                            <span className="text-[10px] font-medium text-indigo-700 truncate max-w-[170px]">
                              {destinationCategory === 'divider'
                                ? (p.dividerRole === 'verso' ? '📄 Verso da Divisória' : '📑 Capa (Frente)')
                                : destinationCategory === 'miolo'
                                  ? (p.mioloRole === 'verso' ? '📖 Verso (Par)' : '📖 Frente (Ímpar)')
                                  : p.customName}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Nome da Página / Modelo */}
                  <div className="pt-2 border-t border-gray-100">
                    <label className="text-[10px] font-bold text-gray-700 block mb-1">
                      {destination === 'save_template' ? 'Nome do Modelo:' : 'Identificação / Nome:'}
                    </label>
                    <input
                      type="text"
                      value={customPageName}
                      onChange={(e) => setCustomPageName(e.target.value)}
                      placeholder="Ex: Layout Miolo 2026, Dados Pessoais..."
                      className="w-full text-xs px-2.5 py-1.5 bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:ring-1 focus:ring-indigo-500 outline-none"
                    />
                  </div>

                  {/* Dimensões e Margens do Layout (Escala 1:1 Fiel ao PDF) */}
                  <div className="pt-2 border-t border-gray-100 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-bold text-gray-700 flex items-center gap-1">
                        <Sliders className="w-3 h-3 text-indigo-600" />
                        <span>Dimensões e Proporção Fiel (1:1)</span>
                      </label>
                      {extractionResult?.viewport && (
                        <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 rounded font-mono">
                          PDF: {Math.round(extractionResult.viewport.widthMm)} × {Math.round(extractionResult.viewport.heightMm)} mm
                        </span>
                      )}
                    </div>

                    <div className="bg-indigo-50/50 border border-indigo-100 rounded-lg p-2.5 space-y-2">
                      <label className="flex items-start gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={matchPageDimensions}
                          onChange={(e) => setMatchPageDimensions(e.target.checked)}
                          className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5 cursor-pointer"
                        />
                        <div className="text-[10px] text-gray-700 leading-tight">
                          <span className="font-bold text-gray-900 block">
                            Ajustar tamanho da página para o PDF ({Math.round(extractionResult?.viewport.widthMm || 148)} × {Math.round(extractionResult?.viewport.heightMm || 210)} mm)
                          </span>
                          <span className="text-gray-500 text-[9px] mt-0.5 block">
                            Define o formato exato da página (A5, A4 ou Personalizado) para evitar qualquer estiramento ou distorção de proporção.
                          </span>
                        </div>
                      </label>

                      <label className="flex items-start gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={zeroMargins}
                          onChange={(e) => setZeroMargins(e.target.checked)}
                          className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5 cursor-pointer"
                        />
                        <div className="text-[10px] text-gray-700 leading-tight">
                          <span className="font-bold text-gray-900 block">
                            Escala 1:1 Fiel ao PDF (Zerar margens adicionais)
                          </span>
                          <span className="text-gray-500 text-[9px] mt-0.5 block">
                            O PDF original já possui seus próprios respiros. O sistema mantém fidelidade 1:1 e preserva suas margens de encadernação iniciais para cálculo inteligente ao espelhar páginas pares no verso.
                          </span>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* 2. Inspetor do Elemento Selecionado */}
                {selectedElementId && (
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-2.5 text-xs">
                    <div className="flex items-center justify-between font-bold text-gray-900 text-[11px]">
                      <span>Editar Elemento Selecionado</span>
                      <span className="text-[10px] text-indigo-600 font-mono bg-white px-1.5 py-0.5 rounded border border-gray-200">
                        {elements.find(e => e.id === selectedElementId)?.type}
                      </span>
                    </div>

                    {elements.find(e => e.id === selectedElementId)?.type === 'text' && (
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-gray-600 block">Texto:</label>
                        <input
                          type="text"
                          value={elements.find(e => e.id === selectedElementId)?.content || ''}
                          onChange={(e) => updateElement(selectedElementId, { content: e.target.value })}
                          className="w-full text-xs px-2 py-1 bg-white border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 outline-none"
                        />
                        <div className="flex items-center gap-2 pt-1">
                          <label className="text-[10px] text-gray-600">Tam (pt):</label>
                          <input
                            type="number"
                            value={elements.find(e => e.id === selectedElementId)?.style.fontSize || 12}
                            onChange={(e) => updateElement(selectedElementId, { style: { fontSize: Number(e.target.value) } })}
                            className="w-14 text-xs px-1.5 py-0.5 bg-white border border-gray-300 rounded text-center"
                          />
                          <label className="text-[10px] text-gray-600 ml-1">Cor:</label>
                          <input
                            type="color"
                            value={elements.find(e => e.id === selectedElementId)?.style.color || '#1f2937'}
                            onChange={(e) => updateElement(selectedElementId, { style: { color: e.target.value } })}
                            className="w-6 h-6 p-0 border border-gray-300 rounded cursor-pointer"
                          />
                        </div>
                        <div className="flex items-center justify-between pt-1 border-t border-gray-200/60">
                          <span className="text-[10px] text-gray-600">Máscara Whiteout:</span>
                          <button
                            type="button"
                            onClick={() => {
                              const currBg = elements.find(e => e.id === selectedElementId)?.style.backgroundColor;
                              const isWhite = currBg === '#ffffff' || currBg === 'rgb(255, 255, 255)';
                              updateElement(selectedElementId, {
                                style: {
                                  backgroundColor: isWhite ? 'transparent' : '#ffffff',
                                  padding: isWhite ? 0 : 1,
                                  borderRadius: isWhite ? 0 : 2
                                }
                              });
                            }}
                            className={`text-[10px] px-2 py-0.5 rounded border transition-colors cursor-pointer font-medium ${
                              elements.find(e => e.id === selectedElementId)?.style.backgroundColor === '#ffffff'
                                ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-bold'
                                : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                            }`}
                          >
                            {elements.find(e => e.id === selectedElementId)?.style.backgroundColor === '#ffffff' ? 'Ativada (Cobre Fundo)' : 'Transparente'}
                          </button>
                        </div>
                      </div>
                    )}

                    {['box', 'circle'].includes(elements.find(e => e.id === selectedElementId)?.type || '') && (
                      <div className="space-y-2">
                        <div>
                          <label className="text-[10px] text-gray-600 block mb-0.5">Nome do Bloco:</label>
                          <input
                            type="text"
                            value={elements.find(e => e.id === selectedElementId)?.name || ''}
                            onChange={(e) => updateElement(selectedElementId, { name: e.target.value })}
                            className="w-full text-xs px-2 py-1 bg-white border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 outline-none"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] text-gray-600 block mb-0.5">Cor de Preenchimento:</label>
                            <div className="flex items-center gap-1.5 bg-white border border-gray-300 rounded p-1">
                              <input
                                type="color"
                                value={
                                  elements.find(e => e.id === selectedElementId)?.style.backgroundColor?.startsWith('#')
                                    ? elements.find(e => e.id === selectedElementId)?.style.backgroundColor
                                    : '#f3f4f6'
                                }
                                onChange={(e) => updateElement(selectedElementId, { style: { backgroundColor: e.target.value } })}
                                className="w-5 h-5 border-none cursor-pointer rounded"
                              />
                              <button
                                type="button"
                                onClick={() => updateElement(selectedElementId, { style: { backgroundColor: 'transparent' } })}
                                className="text-[9px] text-gray-500 hover:text-gray-900 underline"
                              >
                                Transparente
                              </button>
                            </div>
                          </div>

                          <div>
                            <label className="text-[10px] text-gray-600 block mb-0.5">Cor do Contorno:</label>
                            <div className="flex items-center gap-1.5 bg-white border border-gray-300 rounded p-1">
                              <input
                                type="color"
                                value={
                                  elements.find(e => e.id === selectedElementId)?.style.borderColor?.startsWith('#')
                                    ? elements.find(e => e.id === selectedElementId)?.style.borderColor
                                    : '#9ca3af'
                                }
                                onChange={(e) => updateElement(selectedElementId, { style: { borderColor: e.target.value, borderWidth: 1 } })}
                                className="w-5 h-5 border-none cursor-pointer rounded"
                              />
                              <button
                                type="button"
                                onClick={() => updateElement(selectedElementId, { style: { borderWidth: 0, borderColor: 'transparent' } })}
                                className="text-[9px] text-gray-500 hover:text-gray-900 underline"
                              >
                                Sem Borda
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {elements.find(e => e.id === selectedElementId)?.type === 'lines' && (
                      <div className="space-y-2">
                        <div>
                          <label className="text-[10px] text-gray-600 block mb-0.5">Nome da Linha:</label>
                          <input
                            type="text"
                            value={elements.find(e => e.id === selectedElementId)?.name || ''}
                            onChange={(e) => updateElement(selectedElementId, { name: e.target.value })}
                            className="w-full text-xs px-2 py-1 bg-white border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 outline-none"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] text-gray-600 block mb-0.5">Cor da Linha:</label>
                            <div className="flex items-center gap-1.5 bg-white border border-gray-300 rounded p-1">
                              <input
                                type="color"
                                value={
                                  elements.find(e => e.id === selectedElementId)?.style.color?.startsWith('#')
                                    ? elements.find(e => e.id === selectedElementId)?.style.color
                                    : (elements.find(e => e.id === selectedElementId)?.style.borderColor?.startsWith('#')
                                      ? elements.find(e => e.id === selectedElementId)?.style.borderColor
                                      : '#374151')
                                }
                                onChange={(e) =>
                                  updateElement(selectedElementId, {
                                    style: { color: e.target.value, borderColor: e.target.value }
                                  })
                                }
                                className="w-5 h-5 border-none cursor-pointer rounded"
                              />
                              <span className="text-[10px] text-gray-600 font-mono truncate">
                                {elements.find(e => e.id === selectedElementId)?.style.color || elements.find(e => e.id === selectedElementId)?.style.borderColor || '#374151'}
                              </span>
                            </div>
                          </div>

                          <div>
                            <label className="text-[10px] text-gray-600 block mb-0.5">Espessura (pt):</label>
                            <input
                              type="number"
                              step="0.25"
                              min="0.25"
                              max="10"
                              value={elements.find(e => e.id === selectedElementId)?.style.borderWidth || 1}
                              onChange={(e) =>
                                updateElement(selectedElementId, {
                                  style: { borderWidth: Number(e.target.value) }
                                })
                              }
                              className="w-full text-xs px-2 py-1 bg-white border border-gray-300 rounded text-center"
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-gray-200/60">
                          <span className="text-[10px] text-gray-600">Estilo:</span>
                          <div className="flex items-center gap-1">
                            {(['solid', 'dashed', 'dotted'] as const).map(style => (
                              <button
                                key={style}
                                type="button"
                                onClick={() => updateElement(selectedElementId, { style: { borderStyle: style } })}
                                className={`text-[9px] px-2 py-0.5 rounded border transition-colors cursor-pointer capitalize ${
                                  (elements.find(e => e.id === selectedElementId)?.style.borderStyle || 'solid') === style
                                    ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-bold'
                                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                                }`}
                              >
                                {style === 'solid' ? 'Contínua' : style === 'dashed' ? 'Tracejada' : 'Pontilhada'}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 3. Lista de Todos os Elementos da Página */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wider block">
                    Lista de Camadas Extraídas
                  </label>

                  <div className="border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100 max-h-[260px] overflow-y-auto bg-white">
                    {elements.length === 0 ? (
                      <div className="p-4 text-center text-xs text-gray-400">
                        Nenhum elemento encontrado nesta página.
                      </div>
                    ) : (
                      elements.map((el) => {
                        const isSelected = selectedElementId === el.id;
                        const isIncluded = selectedIds.has(el.id);

                        return (
                          <div
                            key={el.id}
                            onClick={() => setSelectedElementId(el.id)}
                            className={`px-3 py-2 text-xs flex items-center justify-between gap-2 cursor-pointer transition-colors ${
                              isSelected
                                ? 'bg-indigo-50 text-indigo-950 font-medium'
                                : 'hover:bg-gray-50 text-gray-700'
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleElementSelection(el.id);
                                }}
                                className="text-gray-400 hover:text-indigo-600 cursor-pointer"
                              >
                                {isIncluded ? (
                                  <CheckSquare className="w-3.5 h-3.5 text-indigo-600" />
                                ) : (
                                  <Square className="w-3.5 h-3.5 text-gray-300" />
                                )}
                              </button>

                              {el.type === 'text' ? (
                                <Type className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                              ) : el.type === 'lines' ? (
                                <Minus className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                              ) : el.type === 'image' ? (
                                <Palette className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                              ) : (
                                <div
                                  className="w-3.5 h-3.5 rounded-xs border shrink-0"
                                  style={{
                                    backgroundColor: el.style.backgroundColor && el.style.backgroundColor !== 'transparent' ? el.style.backgroundColor : '#f3f4f6',
                                    borderColor: el.style.borderColor && el.style.borderColor !== 'transparent' ? el.style.borderColor : '#d1d5db',
                                  }}
                                />
                              )}

                              <span className="truncate text-[11px]" title={el.content || el.name}>
                                {el.content || el.name}
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeElement(el.id);
                              }}
                              className="text-gray-300 hover:text-red-500 p-0.5 rounded transition-colors cursor-pointer"
                              title="Remover este elemento"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

              </div>

              {/* Botões de Ação do Rodapé */}
              <div className="p-3.5 border-t border-gray-100 bg-gray-50/80 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-2 text-xs font-semibold text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={handleFinalImport}
                  disabled={pageConfigs.filter(p => p.selected).length === 0}
                  className="flex-1 px-4 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-md shadow-indigo-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>
                    {importMode === 'bg_only'
                      ? `Aplicar como Fundo (${pageConfigs.filter(p => p.selected).length > 1 ? `${pageConfigs.filter(p => p.selected).length} Páginas em Lote` : (destination === 'miolo_default' ? 'Miolo Diário' : (destination === 'divider' ? 'Capa da Divisória' : (destination === 'divider_verso' ? 'Verso da Divisória' : 'Página')))})`
                      : pageConfigs.filter(p => p.selected).length > 1
                        ? `Importar ${pageConfigs.filter(p => p.selected).length} Páginas Selecionadas em Lote (${destinationCategory === 'divider' ? 'Divisória Frente + Verso' : (destinationCategory === 'miolo' ? 'Miolo Frente + Verso' : (destination === 'new_intro' ? 'Páginas Iniciais' : (destination === 'new_monthly_intro' ? 'Abertura Mensal' : 'Modelos')))}) 🚀`
                        : `Importar como Layout (${destination === 'miolo_default' ? 'Miolo Diário' : (destination === 'miolo_left' ? 'Miolo Verso' : (destination === 'miolo_right' ? 'Miolo Frente' : (destination === 'divider' ? 'Capa Divisória' : (destination === 'divider_verso' ? 'Verso Divisória' : (destination === 'new_intro' ? 'Pág. Inicial' : (destination === 'new_monthly_intro' ? 'Abertura Mensal' : (destination === 'save_template' ? 'Meus Modelos' : 'Pág. Atual')))))))})`}
                  </span>
                </button>
              </div>

            </div>
          </div>
        )}

        {/* Modal de Progresso da Importação em Lote */}
        {batchProcessing && (
          <div className="absolute inset-0 z-50 bg-black/70 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-white text-center animate-in fade-in duration-200">
            <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8 max-w-md w-full shadow-2xl flex flex-col items-center">
              <div className="w-12 h-12 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin mb-4"></div>
              <h3 className="text-base font-bold text-white mb-1">Processando Páginas do PDF</h3>
              <p className="text-xs text-gray-300 mb-5 leading-relaxed">{batchProcessing.message}</p>
              
              {/* Barra de Progresso */}
              <div className="w-full bg-gray-800 rounded-full h-2.5 overflow-hidden mb-2 border border-gray-700">
                <div 
                  className="bg-indigo-500 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${Math.round((batchProcessing.current / batchProcessing.total) * 100)}%` }}
                ></div>
              </div>
              <span className="text-[11px] font-mono text-indigo-400 font-semibold">
                Página {batchProcessing.current} de {batchProcessing.total} ({Math.round((batchProcessing.current / batchProcessing.total) * 100)}%)
              </span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
