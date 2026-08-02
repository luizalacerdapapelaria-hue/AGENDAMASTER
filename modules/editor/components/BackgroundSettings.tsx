import React, { useRef, useState, useEffect } from 'react';
import { BackgroundConfig } from '../../../types';
import { Palmtree, Trash2, Upload, Minus, Palette, Layers, Eye, EyeOff, AlertTriangle, X, ChevronLeft, ChevronRight, Loader2, FileText, FlipHorizontal, FlipVertical, RotateCw, BookOpen, Plus, Sparkles } from 'lucide-react';
import { compressImage } from '../utils/imageCompressor';
import { ImageManager, useImageSrc } from '../utils/imageManager';

const loadPdfJs = (): Promise<any> => {
    return new Promise((resolve, reject) => {
        if ((window as any).pdfjsLib) {
            resolve((window as any).pdfjsLib);
            return;
        }

        const existingScript = document.getElementById('pdfjs-script');
        if (existingScript) {
            const checkInterval = setInterval(() => {
                if ((window as any).pdfjsLib) {
                    clearInterval(checkInterval);
                    resolve((window as any).pdfjsLib);
                }
            }, 100);
            return;
        }

        const script = document.createElement('script');
        script.id = 'pdfjs-script';
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js';
        script.onload = () => {
            const pdfjs = (window as any).pdfjsLib;
            if (pdfjs) {
                pdfjs.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';
                resolve(pdfjs);
            } else {
                reject(new Error('PDF.js falhou ao inicializar'));
            }
        };
        script.onerror = () => reject(new Error('Falha ao carregar PDF.js do CDN'));
        document.head.appendChild(script);
    });
};

interface BackgroundSettingsProps {
    config?: BackgroundConfig;
    configs?: BackgroundConfig[];
    onChange: (updates: Partial<BackgroundConfig>) => void;
    onConfigsChange?: (newConfigs: BackgroundConfig[]) => void;
}

export const BackgroundSettings: React.FC<BackgroundSettingsProps> = ({ config, configs, onChange, onConfigsChange }) => {
    const defaultBg: BackgroundConfig = {
        id: 'bg-default',
        name: 'Fundo Padrão',
        type: 'none',
        opacity: 1,
        showOnIntroPages: true,
        showOnDailyPages: true,
        pageFilter: 'all',
        targetType: 'all'
    };

    const isMultiMode = Boolean(onConfigsChange);
    const bgList = (configs && configs.length > 0) ? configs : [config || defaultBg];
    const [activeIndex, setActiveIndex] = useState(0);

    const safeIndex = activeIndex < bgList.length ? activeIndex : 0;
    const current = bgList[safeIndex] || defaultBg;

    const handleCurrentUpdate = (updates: Partial<BackgroundConfig>) => {
        if (isMultiMode && onConfigsChange && configs) {
            const nextList = [...bgList];
            nextList[safeIndex] = {
                ...nextList[safeIndex],
                ...updates
            };
            onConfigsChange(nextList);
        } else {
            onChange(updates);
        }
    };

    const addNewBgSlot = () => {
        if (!onConfigsChange || !configs) return;
        const newBg: BackgroundConfig = {
            id: 'bg-' + Date.now(),
            name: `Fundo ${configs.length + 1}`,
            type: 'none',
            opacity: 1,
            showOnIntroPages: true,
            showOnDailyPages: true,
            pageFilter: 'all',
            targetType: 'all'
        };
        const nextList = [...configs, newBg];
        onConfigsChange(nextList);
        setActiveIndex(nextList.length - 1);
    };

    const removeBgSlot = (indexToRemove: number) => {
        if (!onConfigsChange || !configs || configs.length <= 1) return;
        const nextList = configs.filter((_, idx) => idx !== indexToRemove);
        onConfigsChange(nextList);
        if (safeIndex >= nextList.length) {
            setActiveIndex(Math.max(0, nextList.length - 1));
        }
    };

    const applyEvenOddPreset = () => {
        if (!onConfigsChange) return;
        const oddBg: BackgroundConfig = {
            id: 'bg-odd-' + Date.now(),
            name: 'Fundo Páginas Ímpares (Direita)',
            type: current.type !== 'none' ? current.type : 'solid',
            color: current.color || '#ffffff',
            gradient: current.gradient,
            image: current.image ? { ...current.image } : undefined,
            opacity: current.opacity ?? 1,
            showOnIntroPages: true,
            showOnDailyPages: true,
            pageFilter: 'odd',
            targetType: 'odd'
        };
        const evenBg: BackgroundConfig = {
            id: 'bg-even-' + Date.now(),
            name: 'Fundo Páginas Pares (Esquerda)',
            type: current.type !== 'none' ? current.type : 'solid',
            color: current.color || '#f9fafb',
            gradient: current.gradient,
            image: current.image ? { ...current.image } : undefined,
            opacity: current.opacity ?? 1,
            showOnIntroPages: true,
            showOnDailyPages: true,
            pageFilter: 'even',
            targetType: 'even'
        };
        onConfigsChange([oddBg, evenBg]);
        setActiveIndex(0);
    };

    const applyIntroDailyPreset = () => {
        if (!onConfigsChange) return;
        const introBg: BackgroundConfig = {
            id: 'bg-intro-' + Date.now(),
            name: 'Fundo Páginas Iniciais',
            type: current.type !== 'none' ? current.type : 'solid',
            color: current.color || '#ffffff',
            gradient: current.gradient,
            image: current.image ? { ...current.image } : undefined,
            opacity: current.opacity ?? 1,
            showOnIntroPages: true,
            showOnDailyPages: false,
            pageFilter: 'all',
            targetType: 'intro'
        };
        const dailyBg: BackgroundConfig = {
            id: 'bg-daily-' + Date.now(),
            name: 'Fundo Páginas Diárias (Miolo)',
            type: current.type !== 'none' ? current.type : 'solid',
            color: current.color || '#ffffff',
            gradient: current.gradient,
            image: current.image ? { ...current.image } : undefined,
            opacity: current.opacity ?? 1,
            showOnIntroPages: false,
            showOnDailyPages: true,
            pageFilter: 'all',
            targetType: 'daily'
        };
        onConfigsChange([introBg, dailyBg]);
        setActiveIndex(0);
    };

    const getTargetLabel = (bg: BackgroundConfig) => {
        if (bg.customPages && bg.customPages.trim() !== '') {
            return `Páginas: ${bg.customPages}`;
        }
        const filter = bg.targetType || bg.pageFilter || 'all';
        if (filter === 'even') return 'Páginas Pares (Esquerda)';
        if (filter === 'odd') return 'Páginas Ímpares (Direita)';
        if (filter === 'intro' || (bg.showOnIntroPages && !bg.showOnDailyPages)) return 'Páginas Iniciais';
        if (filter === 'daily' || (bg.showOnDailyPages && !bg.showOnIntroPages)) return 'Páginas do Miolo';
        return 'Todas as Páginas';
    };

    const bgUrl = useImageSrc(current.image?.url);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const pdfPreviewCanvasRef = useRef<HTMLCanvasElement>(null);

    const [showWarning, setShowWarning] = useState(false);
    const [dontShowAgain, setDontShowAgain] = useState(false);

    // PDF upload states
    const [showPdfModal, setShowPdfModal] = useState(false);
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [pdfDoc, setPdfDoc] = useState<any>(null);
    const [pdfTotalPages, setPdfTotalPages] = useState(0);
    const [pdfCurrentPage, setPdfCurrentPage] = useState(1);
    const [pdfLoading, setPdfLoading] = useState(false);
    const [pdfRenderScale, setPdfRenderScale] = useState(2.0); // Default high resolution

    // Render PDF page preview
    useEffect(() => {
        if (!pdfDoc || !showPdfModal) return;

        let active = true;
        const renderPage = async () => {
            try {
                const page = await pdfDoc.getPage(pdfCurrentPage);
                if (!active) return;

                const canvas = pdfPreviewCanvasRef.current;
                if (!canvas) return;

                const context = canvas.getContext('2d');
                if (!context) return;

                const viewport = page.getViewport({ scale: 1.0 });
                canvas.width = viewport.width;
                canvas.height = viewport.height;

                const renderContext = {
                    canvasContext: context,
                    viewport: viewport,
                };
                await page.render(renderContext).promise;
            } catch (error) {
                console.error('Erro ao renderizar prévia do PDF:', error);
            }
        };

        renderPage();
        return () => {
            active = false;
        };
    }, [pdfDoc, pdfCurrentPage, showPdfModal]);

    const triggerImageUpload = () => {
        const isDismissed = localStorage.getItem('agendamaster_dismissed_image_warning') === 'true';
        if (isDismissed) {
            fileInputRef.current?.click();
        } else {
            setShowWarning(true);
        }
    };

    const handleConfirmUpload = () => {
        if (dontShowAgain) {
            localStorage.setItem('agendamaster_dismissed_image_warning', 'true');
        }
        setShowWarning(false);
        setTimeout(() => {
            fileInputRef.current?.click();
        }, 100);
    };

    const handlePdfUpload = (file: File) => {
        setPdfFile(file);
        setPdfLoading(true);
        setShowPdfModal(true);

        const reader = new FileReader();
        reader.onload = async () => {
            try {
                const pdfjs = await loadPdfJs();
                const arrayBuffer = reader.result as ArrayBuffer;
                const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
                const pdf = await loadingTask.promise;
                setPdfDoc(pdf);
                setPdfTotalPages(pdf.numPages);
                setPdfCurrentPage(1);
                setPdfLoading(false);
            } catch (error) {
                console.error('Erro ao processar PDF:', error);
                alert('Não foi possível ler este arquivo PDF. Certifique-se de que é um PDF válido.');
                setPdfLoading(false);
                setShowPdfModal(false);
            }
        };
        reader.readAsArrayBuffer(file);
    };

    const handleConfirmPdfPage = async () => {
        if (!pdfDoc) return;
        try {
            setPdfLoading(true);
            const page = await pdfDoc.getPage(pdfCurrentPage);
            
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            if (!context) throw new Error('Não foi possível obter contexto do canvas.');

            const viewport = page.getViewport({ scale: pdfRenderScale });
            canvas.width = viewport.width;
            canvas.height = viewport.height;

            const renderContext = {
                canvasContext: context,
                viewport: viewport,
            };
            await page.render(renderContext).promise;

            const dataUrl = canvas.toDataURL('image/png');
            const registeredUrl = await ImageManager.registerImage(dataUrl);
            
            handleCurrentUpdate({ 
                type: 'image', 
                image: { 
                    url: registeredUrl, 
                    opacity: current.image?.opacity ?? 1, 
                    fit: 'fill'
                } 
            });
            
            setShowPdfModal(false);
            setPdfDoc(null);
            setPdfFile(null);
        } catch (error) {
            console.error('Erro ao converter PDF:', error);
            alert('Erro ao converter a página do PDF. Tente usar uma resolução menor (ex: 1.5x).');
        } finally {
            setPdfLoading(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
            handlePdfUpload(file);
            return;
        }

        try {
            const rawDataUrl = await compressImage(file);
            if (!rawDataUrl) return;
            const registeredUrl = await ImageManager.registerImage(rawDataUrl);
            
            handleCurrentUpdate({ 
                type: 'image', 
                image: { 
                    url: registeredUrl, 
                    opacity: current.image?.opacity ?? 1, 
                    fit: current.image?.fit ?? 'cover' 
                } 
            });
        } catch (error) {
            console.error('Erro ao comprimir imagem:', error);
        }
    };

    return (
        <div className="space-y-6">
            {/* Gerenciador de Múltiplos Planos de Fundo */}
            {isMultiMode && configs && (
                <div className="space-y-3 p-3.5 bg-indigo-50/70 rounded-2xl border border-indigo-150 shadow-2xs">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-indigo-900 uppercase tracking-wider flex items-center gap-1.5">
                            <Layers className="w-3.5 h-3.5 text-indigo-600" />
                            Planos de Fundo ({configs.length})
                        </span>
                        <button
                            type="button"
                            onClick={addNewBgSlot}
                            className="text-[10px] font-bold px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-2xs transition-all flex items-center gap-1 cursor-pointer"
                        >
                            <Plus className="w-3 h-3" />
                            <span>Adicionar Fundo</span>
                        </button>
                    </div>

                    {/* Presets Rápidos */}
                    <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                        <button
                            type="button"
                            onClick={applyEvenOddPreset}
                            className="py-1.5 px-2 bg-white hover:bg-indigo-50 border border-indigo-200 text-indigo-800 rounded-lg text-[9px] font-bold transition-all flex items-center justify-center gap-1 shadow-2xs cursor-pointer"
                            title="Cria automaticamente 1 fundo para páginas ímpares e 1 para páginas pares"
                        >
                            <Sparkles className="w-3 h-3 text-indigo-500" />
                            <span>Pares vs. Ímpares</span>
                        </button>
                        <button
                            type="button"
                            onClick={applyIntroDailyPreset}
                            className="py-1.5 px-2 bg-white hover:bg-indigo-50 border border-indigo-200 text-indigo-800 rounded-lg text-[9px] font-bold transition-all flex items-center justify-center gap-1 shadow-2xs cursor-pointer"
                            title="Cria automaticamente 1 fundo para páginas iniciais e 1 para o miolo diário"
                        >
                            <Sparkles className="w-3 h-3 text-indigo-500" />
                            <span>Iniciais vs. Miolo</span>
                        </button>
                    </div>

                    {/* Lista de Fundos Configurados */}
                    <div className="space-y-1.5 pt-1">
                        {configs.map((bgItem, idx) => (
                            <div
                                key={bgItem.id || idx}
                                onClick={() => setActiveIndex(idx)}
                                className={`p-2 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                                    safeIndex === idx
                                        ? 'bg-white border-indigo-500 ring-2 ring-indigo-500/20 shadow-xs'
                                        : 'bg-white/70 hover:bg-white border-gray-200 text-gray-600'
                                }`}
                            >
                                <div className="flex items-center gap-2 overflow-hidden">
                                    <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${bgItem.type === 'none' ? 'bg-gray-300' : 'bg-indigo-500'}`} />
                                    <div className="truncate">
                                        <span className="font-bold text-[11px] block text-gray-800 truncate">
                                            {bgItem.name || `Fundo ${idx + 1}`}
                                        </span>
                                        <span className="text-[9px] text-gray-500 block truncate font-medium">
                                            {getTargetLabel(bgItem)}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-1 flex-shrink-0">
                                    {configs.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                removeBgSlot(idx);
                                            }}
                                            className="p-1 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-md transition-colors"
                                            title="Excluir este fundo"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Configuração do Fundo Selecionado */}
            {isMultiMode && (
                <div className="space-y-2.5 p-3 bg-gray-50/80 rounded-xl border border-gray-200">
                    <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                            Nome do Fundo ({safeIndex + 1}/{bgList.length})
                        </label>
                        <input
                            type="text"
                            value={current.name || `Fundo ${safeIndex + 1}`}
                            onChange={(e) => handleCurrentUpdate({ name: e.target.value })}
                            className="w-full text-xs p-2 border border-gray-200 rounded-lg font-bold text-gray-800 bg-white outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="Ex: Fundo Páginas Ímpares"
                        />
                    </div>

                    <div className="space-y-1.5 pt-1">
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                            Onde este fundo será exibido?
                        </label>
                        <div className="grid grid-cols-2 gap-1.5">
                            <button
                                type="button"
                                onClick={() => handleCurrentUpdate({ targetType: 'all', pageFilter: 'all', showOnIntroPages: true, showOnDailyPages: true })}
                                className={`p-2 rounded-lg border text-[10px] font-bold text-left transition-all cursor-pointer ${
                                    (!current.targetType || current.targetType === 'all') && (!current.pageFilter || current.pageFilter === 'all') && current.showOnIntroPages !== false && current.showOnDailyPages !== false
                                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                                🌐 Todas as Páginas
                            </button>

                            <button
                                type="button"
                                onClick={() => handleCurrentUpdate({ targetType: 'odd', pageFilter: 'odd', showOnIntroPages: true, showOnDailyPages: true })}
                                className={`p-2 rounded-lg border text-[10px] font-bold text-left transition-all cursor-pointer ${
                                    current.targetType === 'odd' || current.pageFilter === 'odd'
                                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                                📘 Páginas Ímpares (Direita)
                            </button>

                            <button
                                type="button"
                                onClick={() => handleCurrentUpdate({ targetType: 'even', pageFilter: 'even', showOnIntroPages: true, showOnDailyPages: true })}
                                className={`p-2 rounded-lg border text-[10px] font-bold text-left transition-all cursor-pointer ${
                                    current.targetType === 'even' || current.pageFilter === 'even'
                                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                                📖 Páginas Pares (Esquerda)
                            </button>

                            <button
                                type="button"
                                onClick={() => handleCurrentUpdate({ targetType: 'intro', showOnIntroPages: true, showOnDailyPages: false, pageFilter: 'all' })}
                                className={`p-2 rounded-lg border text-[10px] font-bold text-left transition-all cursor-pointer ${
                                    current.targetType === 'intro' || (current.showOnIntroPages && !current.showOnDailyPages)
                                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                                📑 Páginas Iniciais
                            </button>

                            <button
                                type="button"
                                onClick={() => handleCurrentUpdate({ targetType: 'daily', showOnIntroPages: false, showOnDailyPages: true, pageFilter: 'all' })}
                                className={`p-2 rounded-lg border text-[10px] font-bold text-left transition-all cursor-pointer ${
                                    current.targetType === 'daily' || (current.showOnDailyPages && !current.showOnIntroPages)
                                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                                📅 Páginas do Miolo
                            </button>

                            <button
                                type="button"
                                onClick={() => handleCurrentUpdate({ targetType: 'custom' })}
                                className={`p-2 rounded-lg border text-[10px] font-bold text-left transition-all cursor-pointer ${
                                    current.targetType === 'custom' || (current.customPages && current.customPages.trim() !== '')
                                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                                🔢 Páginas Específicas
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="space-y-3">
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Tipo de Fundo</label>
                <div className="grid grid-cols-2 gap-2">
                    <button 
                        onClick={() => handleCurrentUpdate({ type: 'none' })}
                        className={`flex flex-col items-center justify-center p-2 rounded-lg border text-[10px] font-medium transition-all cursor-pointer ${current.type === 'none' ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-sm' : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'}`}
                    >
                        <Minus className="w-4 h-4 mb-1" />
                        Nenhum
                    </button>
                    <button 
                        onClick={() => handleCurrentUpdate({ type: 'solid', color: current.color || '#ffffff' })}
                        className={`flex flex-col items-center justify-center p-2 rounded-lg border text-[10px] font-medium transition-all cursor-pointer ${current.type === 'solid' ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-sm' : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'}`}
                    >
                        <Palette className="w-4 h-4 mb-1" />
                        Cor Sólida
                    </button>
                    <button 
                        onClick={() => handleCurrentUpdate({ 
                            type: 'gradient', 
                            gradient: current.gradient || { type: 'linear', colors: ['#ffffff', '#f3f4f6'], direction: 180 } 
                        })}
                        className={`flex flex-col items-center justify-center p-2 rounded-lg border text-[10px] font-medium transition-all cursor-pointer ${current.type === 'gradient' ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-sm' : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'}`}
                    >
                        <Layers className="w-4 h-4 mb-1" />
                        Gradiente
                    </button>
                    <button 
                        onClick={triggerImageUpload}
                        className={`flex flex-col items-center justify-center p-2 rounded-lg border text-[10px] font-medium transition-all cursor-pointer ${current.type === 'image' ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-sm' : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'}`}
                    >
                        <Upload className="w-4 h-4 mb-1" />
                        Imagem / PDF
                    </button>
                </div>
            </div>

            {current.type === 'solid' && (
                <div className="space-y-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase">Cor do Fundo</label>
                    <div className="flex h-10 border border-gray-200 rounded-lg overflow-hidden bg-white">
                        <input 
                            type="color" 
                            value={current.color || '#ffffff'} 
                            onChange={(e) => handleCurrentUpdate({ color: e.target.value })} 
                            className="w-12 h-full p-0 border-0 cursor-pointer" 
                        />
                        <input 
                            type="text" 
                            value={current.color || '#ffffff'} 
                            onChange={(e) => handleCurrentUpdate({ color: e.target.value })} 
                            className="flex-1 text-xs uppercase px-3 font-mono" 
                        />
                    </div>
                </div>
            )}

            {current.type === 'gradient' && current.gradient && (
                <div className="space-y-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="space-y-2">
                        <label className="block text-[10px] font-bold text-gray-500 uppercase text-center">Visualização</label>
                        <div 
                            className="h-12 w-full rounded-md border border-gray-200 shadow-inner"
                            style={{ 
                                background: current.gradient.type === 'linear' 
                                    ? `linear-gradient(${current.gradient.direction}deg, ${current.gradient.colors[0]}, ${current.gradient.colors[1]})`
                                    : `radial-gradient(circle at center, ${current.gradient.colors[0]}, ${current.gradient.colors[1]})`
                            }}
                        />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <label className="block text-[10px] font-bold text-gray-500 uppercase">Tipo</label>
                            <select 
                                value={current.gradient.type}
                                onChange={(e) => handleCurrentUpdate({ gradient: { ...current.gradient!, type: e.target.value as any } })}
                                className="w-full text-xs p-2 border border-gray-200 rounded-md bg-white select-none"
                            >
                                <option value="linear">Linear</option>
                                <option value="radial">Radial</option>
                            </select>
                        </div>
                        {current.gradient.type === 'linear' && (
                            <div className="space-y-2">
                                <label className="block text-[10px] font-bold text-gray-500 uppercase">Ângulo</label>
                                <input 
                                    type="number" 
                                    value={current.gradient.direction}
                                    onChange={(e) => handleCurrentUpdate({ gradient: { ...current.gradient!, direction: parseInt(e.target.value) || 0 } })}
                                    className="w-full text-xs p-2 border border-gray-200 rounded-md bg-white"
                                />
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                        <div className="space-y-2">
                            <label className="block text-[10px] font-bold text-gray-400 uppercase">Cor 1</label>
                            <div className="flex h-8 border border-gray-200 rounded overflow-hidden">
                                <input 
                                    type="color" 
                                    value={current.gradient.colors[0]} 
                                    onChange={(e) => handleCurrentUpdate({ gradient: { ...current.gradient!, colors: [e.target.value, current.gradient!.colors[1]] } })} 
                                    className="w-full h-full p-0 border-0 cursor-pointer" 
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="block text-[10px] font-bold text-gray-400 uppercase">Cor 2</label>
                            <div className="flex h-8 border border-gray-200 rounded overflow-hidden">
                                <input 
                                    type="color" 
                                    value={current.gradient.colors[1]} 
                                    onChange={(e) => handleCurrentUpdate({ gradient: { ...current.gradient!, colors: [current.gradient!.colors[0], e.target.value] } })} 
                                    className="w-full h-full p-0 border-0 cursor-pointer" 
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {current.type === 'image' && current.image && (
                <div className="space-y-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="relative group aspect-[3/4] max-h-48 overflow-hidden rounded-md border border-gray-200 bg-gray-100 flex items-center justify-center">
                        <img 
                            src={bgUrl} 
                            alt="Background" 
                            className="w-full h-full object-contain transition-transform duration-200"
                            style={{
                                transform: [
                                    current.image.rotation ? `rotate(${current.image.rotation}deg)` : '',
                                    current.image.flipHorizontal ? 'scaleX(-1)' : '',
                                    current.image.flipVertical ? 'scaleY(-1)' : '',
                                ].filter(Boolean).join(' ') || undefined
                            }}
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <button 
                                onClick={triggerImageUpload}
                                className="p-2 bg-white rounded-full hover:bg-gray-100 text-gray-700 shadow-lg cursor-pointer"
                                title="Alterar Imagem"
                            >
                                <Upload className="w-5 h-5" />
                            </button>
                            <button 
                                onClick={() => handleCurrentUpdate({ type: 'none' })}
                                className="p-2 bg-red-500 rounded-full hover:bg-red-600 text-white shadow-lg cursor-pointer"
                                title="Remover"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-[10px] font-bold text-gray-500 uppercase">Ajuste da Imagem</label>
                        <select 
                            value={current.image.fit}
                            onChange={(e) => handleCurrentUpdate({ image: { ...current.image!, fit: e.target.value as any } })}
                            className="w-full text-xs p-2 border border-gray-200 rounded-md bg-white select-none"
                        >
                            <option value="cover">Cobrir Totalmente (Crop)</option>
                            <option value="contain">Conter Inteira (Bordas)</option>
                            <option value="fill">Esticar para Preencher</option>
                        </select>
                    </div>

                    {/* Orientação e Sentido (Inverter/Espelhar) */}
                    <div className="space-y-3 pt-3 border-t border-gray-200">
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                            Inverter e Espelhar Fundo
                        </label>

                        <div className="grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                onClick={() => handleCurrentUpdate({
                                    image: {
                                        ...current.image!,
                                        flipHorizontal: !current.image?.flipHorizontal
                                    }
                                })}
                                className={`flex items-center justify-center gap-1.5 p-2 rounded-lg border text-[10px] font-bold transition-all cursor-pointer ${
                                    current.image.flipHorizontal 
                                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' 
                                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                                }`}
                                title="Espelhar Horizontalmente (Esquerda/Direita)"
                            >
                                <FlipHorizontal className="w-3.5 h-3.5" />
                                <span>Inverter H (Espelhar)</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => handleCurrentUpdate({
                                    image: {
                                        ...current.image!,
                                        flipVertical: !current.image?.flipVertical
                                    }
                                })}
                                className={`flex items-center justify-center gap-1.5 p-2 rounded-lg border text-[10px] font-bold transition-all cursor-pointer ${
                                    current.image.flipVertical 
                                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' 
                                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                                }`}
                                title="Espelhar Verticalmente (Ponta-cabeça)"
                            >
                                <FlipVertical className="w-3.5 h-3.5" />
                                <span>Inverter V</span>
                            </button>
                        </div>

                        {/* Alternar em Páginas Pares (Simetria do Miolo) */}
                        <button
                            type="button"
                            onClick={() => handleCurrentUpdate({
                                image: {
                                    ...current.image!,
                                    flipOnEvenPages: !current.image?.flipOnEvenPages
                                }
                            })}
                            className={`w-full flex items-center justify-between p-2.5 rounded-lg border text-[10px] font-medium transition-all text-left cursor-pointer ${
                                current.image.flipOnEvenPages 
                                    ? 'bg-indigo-50 border-indigo-300 text-indigo-800' 
                                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                            <div className="flex items-center gap-2">
                                <BookOpen className={`w-4 h-4 flex-shrink-0 ${current.image.flipOnEvenPages ? 'text-indigo-600' : 'text-gray-400'}`} />
                                <div>
                                    <p className="font-bold leading-tight">Alternar em Páginas Pares</p>
                                    <p className="text-[9px] opacity-75 font-normal leading-tight">Inverte o sentido nas páginas da esquerda (miolo duplex)</p>
                                </div>
                            </div>
                            <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${current.image.flipOnEvenPages ? 'bg-indigo-600' : 'bg-gray-300'}`} />
                        </button>

                        {/* Rotação e Seleção de Páginas Pares / Ímpares */}
                        <div className="space-y-2 pt-2 border-t border-gray-200/60">
                            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                                Páginas de Exibição (Pares / Ímpares)
                            </label>
                            <div className="grid grid-cols-3 gap-1.5">
                                <button
                                    type="button"
                                    onClick={() => handleCurrentUpdate({ pageFilter: 'all', targetType: 'all' })}
                                    className={`py-2 px-1 rounded-lg border text-[10px] font-bold transition-all text-center cursor-pointer flex flex-col items-center justify-center gap-1 ${
                                        (!current.pageFilter || current.pageFilter === 'all')
                                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                                            : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                                    }`}
                                >
                                    <BookOpen className="w-3.5 h-3.5" />
                                    <span>Todas</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => handleCurrentUpdate({ pageFilter: 'even', targetType: 'even' })}
                                    className={`py-2 px-1 rounded-lg border text-[10px] font-bold transition-all text-center cursor-pointer flex flex-col items-center justify-center gap-1 ${
                                        current.pageFilter === 'even' || current.targetType === 'even'
                                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                                            : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                                    }`}
                                    title="Apenas Páginas Pares (2, 4, 6... Lado Esquerdo)"
                                >
                                    <FileText className="w-3.5 h-3.5" />
                                    <span>Páginas Pares</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => handleCurrentUpdate({ pageFilter: 'odd', targetType: 'odd' })}
                                    className={`py-2 px-1 rounded-lg border text-[10px] font-bold transition-all text-center cursor-pointer flex flex-col items-center justify-center gap-1 ${
                                        current.pageFilter === 'odd' || current.targetType === 'odd'
                                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                                            : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                                    }`}
                                    title="Apenas Páginas Ímpares (1, 3, 5... Lado Direito)"
                                >
                                    <FileText className="w-3.5 h-3.5" />
                                    <span>Páginas Ímpares</span>
                                </button>
                            </div>
                        </div>

                        {/* Rotation selector */}
                        <div className="space-y-1.5 pt-1">
                            <div className="flex items-center justify-between">
                                <label className="block text-[9px] font-bold text-gray-400 uppercase">Girar Imagem (Rotação)</label>
                                <span className="text-[9px] font-bold text-indigo-600">{current.image?.rotation || 0}°</span>
                            </div>
                            <div className="grid grid-cols-4 gap-1.5">
                                {[0, 90, 180, 270].map((deg) => (
                                    <button
                                        key={deg}
                                        type="button"
                                        onClick={() => handleCurrentUpdate({
                                            image: {
                                                ...current.image!,
                                                rotation: deg
                                            }
                                        })}
                                        className={`py-1.5 px-1 rounded text-[10px] font-bold border transition-all text-center cursor-pointer ${
                                            (current.image?.rotation || 0) === deg 
                                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' 
                                                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                                        }`}
                                    >
                                        {deg}°
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="space-y-3 pt-3 border-t border-gray-100">
                <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Opacidade do Fundo ({Math.round((current.opacity ?? 1) * 100)}%)</label>
                </div>
                <input 
                    type="range" 
                    min="0" 
                    max="1" 
                    step="0.05" 
                    value={current.opacity ?? 1} 
                    onChange={(e) => handleCurrentUpdate({ opacity: parseFloat(e.target.value) })} 
                    className="w-full" 
                />
            </div>

            <div className="space-y-3 pt-3 border-t border-gray-100">
                <label className="block text-[10px] font-bold text-gray-500 uppercase">Visibilidade e Páginas</label>
                <div className="space-y-2">
                    <button 
                        onClick={() => handleCurrentUpdate({ showOnIntroPages: !current.showOnIntroPages })}
                        className={`w-full flex items-center justify-between p-2 rounded-md border text-[10px] font-medium transition-all ${current.showOnIntroPages ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-gray-100 text-gray-400'}`}
                    >
                        <span className="flex items-center">
                            {current.showOnIntroPages ? <Eye className="w-3.5 h-3.5 mr-2" /> : <EyeOff className="w-3.5 h-3.5 mr-2" />}
                            Exibir em Páginas Iniciais
                        </span>
                        <div className={`w-2 h-2 rounded-full ${current.showOnIntroPages ? 'bg-indigo-500' : 'bg-gray-300'}`} />
                    </button>
                    <button 
                        onClick={() => handleCurrentUpdate({ showOnDailyPages: !current.showOnDailyPages })}
                        className={`w-full flex items-center justify-between p-2 rounded-md border text-[10px] font-medium transition-all ${current.showOnDailyPages ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-gray-100 text-gray-400'}`}
                    >
                        <span className="flex items-center">
                            {current.showOnDailyPages ? <Eye className="w-3.5 h-3.5 mr-2" /> : <EyeOff className="w-3.5 h-3.5 mr-2" />}
                            Exibir em Páginas Diárias/Miolo
                        </span>
                        <div className={`w-2 h-2 rounded-full ${current.showOnDailyPages ? 'bg-indigo-500' : 'bg-gray-300'}`} />
                    </button>
                </div>

                <div className="space-y-1.5 pt-2">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase">
                        Filtrar por Paridade de Página
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                        <button
                            type="button"
                            onClick={() => handleCurrentUpdate({ pageFilter: 'all', targetType: 'all' })}
                            className={`py-1.5 px-2 rounded-lg border text-[10px] font-bold transition-all text-center cursor-pointer ${
                                (!current.pageFilter || current.pageFilter === 'all')
                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                            Todas
                        </button>
                        <button
                            type="button"
                            onClick={() => handleCurrentUpdate({ pageFilter: 'even', targetType: 'even' })}
                            className={`py-1.5 px-2 rounded-lg border text-[10px] font-bold transition-all text-center cursor-pointer ${
                                current.pageFilter === 'even' || current.targetType === 'even'
                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                            Páginas Pares
                        </button>
                        <button
                            type="button"
                            onClick={() => handleCurrentUpdate({ pageFilter: 'odd', targetType: 'odd' })}
                            className={`py-1.5 px-2 rounded-lg border text-[10px] font-bold transition-all text-center cursor-pointer ${
                                current.pageFilter === 'odd' || current.targetType === 'odd'
                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                            Páginas Ímpares
                        </button>
                    </div>
                </div>
            </div>

            <div className="space-y-3 pt-3 border-t border-gray-100">
                <label className="block text-[10px] font-bold text-gray-500 uppercase">Páginas Específicas (Opcional)</label>
                <div className="space-y-1">
                    <input 
                        type="text"
                        placeholder="Ex: 1, 3, 5-10"
                        value={current.customPages || ''}
                        onChange={(e) => handleCurrentUpdate({ customPages: e.target.value, targetType: e.target.value.trim() !== '' ? 'custom' : 'all' })}
                        className="w-full text-xs p-2.5 border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
                    />
                    <p className="text-[9px] text-gray-400 italic px-1">Se preenchido, ignora as opções acima e exibe apenas nestas páginas.</p>
                </div>
            </div>

            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageUpload} 
                accept="image/*,application/pdf" 
                className="hidden" 
            />

            {showWarning && (
                <div className="fixed inset-0 z-[20000] bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 flex flex-col text-gray-800 animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-2 text-amber-600">
                                <AlertTriangle className="w-5 h-5 flex-shrink-0 animate-bounce" />
                                <h3 className="text-base font-black text-gray-950">Aviso: Upload de Fotos</h3>
                            </div>
                            <button 
                                onClick={() => setShowWarning(false)}
                                className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="space-y-4 text-xs text-gray-600 leading-relaxed text-left">
                            <p>
                                Para garantir que o system funcione com rapidez e para evitar erros de salvamento, siga as recomendações abaixo:
                            </p>

                            <div className="p-3 bg-amber-50/50 border border-amber-200 rounded-xl space-y-2">
                                <p className="font-bold text-amber-950 flex items-center gap-1">
                                    📏 Limite de Tamanho (Máx 1.5MB)
                                </p>
                                <p className="text-[11px] text-amber-900 leading-normal">
                                    Fotos originais tiradas pelo celular são muito pesadas (5MB a 12MB). Se você enviar uma foto muito grande, ela pode esgotar a memória do navegador, travando o editor e fazendo você perder as suas alterações.
                                </p>
                            </div>

                            <div className="p-3 bg-emerald-50/50 border border-emerald-200 rounded-xl space-y-2">
                                <p className="font-bold text-emerald-950 flex items-center gap-1">
                                    ⚙️ Como Otimizar Facilmente
                                </p>
                                <ol className="list-decimal list-inside text-[11px] text-emerald-900 space-y-1 leading-normal">
                                    <li><strong>Tire um Print Screen (captura de tela)</strong> da foto no seu celular ou computador e envie o print. Ele mantém ótima qualidade e é super leve!</li>
                                    <li>Ou <strong>envie a foto para si mesma no WhatsApp</strong> e faça o download de lá. O WhatsApp comprime o tamanho de forma automática.</li>
                                </ol>
                            </div>

                            <div className="p-3 bg-indigo-50/50 border border-indigo-200 rounded-xl space-y-2">
                                <p className="font-bold text-indigo-950 flex items-center gap-1">
                                    🌐 Navegador Recomendado
                                </p>
                                <p className="text-[11px] text-indigo-900 leading-normal">
                                    Sempre use o <strong>Google Chrome</strong> ou <strong>Safari</strong>. Nunca use os navegadores internos do Instagram, Facebook ou WhatsApp, pois eles limitam o tamanho de arquivos e travam constantemente.
                                </p>
                            </div>

                            <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                                <input 
                                    type="checkbox" 
                                    id="dont-show-again-bg" 
                                    checked={dontShowAgain}
                                    onChange={(e) => setDontShowAgain(e.target.checked)}
                                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 cursor-pointer"
                                />
                                <label htmlFor="dont-show-again-bg" className="text-[11px] font-bold text-gray-500 cursor-pointer select-none">
                                    Não mostrar este aviso novamente
                                </label>
                            </div>
                        </div>

                        <div className="flex gap-2 justify-end mt-5 pt-3 border-t border-gray-100">
                            <button 
                                onClick={() => setShowWarning(false)}
                                className="px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-xl text-xs font-bold transition-all cursor-pointer"
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={handleConfirmUpload}
                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-750 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer"
                            >
                                Entendi, Escolher Foto
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showPdfModal && (
                <div className="fixed inset-0 z-[20000] bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 flex flex-col text-gray-800 animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-2 text-indigo-600">
                                <FileText className="w-5 h-5 flex-shrink-0" />
                                <h3 className="text-base font-black text-gray-950">Selecionar Página do PDF</h3>
                            </div>
                            <button 
                                onClick={() => {
                                    setShowPdfModal(false);
                                    setPdfDoc(null);
                                    setPdfFile(null);
                                }}
                                className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <p className="text-xs text-gray-500 font-medium text-left">
                                Arquivo: <span className="font-bold text-gray-700">{pdfFile?.name}</span>
                            </p>

                            {/* Preview Area */}
                            <div className="relative aspect-[3/4] max-h-[320px] bg-gray-50 border border-gray-200 rounded-xl overflow-hidden shadow-inner flex items-center justify-center p-2">
                                {pdfLoading && !pdfDoc ? (
                                    <div className="flex flex-col items-center justify-center gap-3 text-indigo-600">
                                        <Loader2 className="w-8 h-8 animate-spin" />
                                        <p className="text-xs font-bold uppercase tracking-wider animate-pulse">Lendo PDF...</p>
                                    </div>
                                ) : (
                                    <canvas 
                                        ref={pdfPreviewCanvasRef} 
                                        className="max-w-full max-h-full border border-gray-200 rounded-lg shadow-md bg-white object-contain"
                                    />
                                )}
                            </div>

                            {!pdfLoading && pdfTotalPages > 0 && (
                                <div className="space-y-3 text-left">
                                    {/* Pagination Controls */}
                                    <div className="flex items-center justify-between bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                                        <button
                                            type="button"
                                            disabled={pdfCurrentPage <= 1}
                                            onClick={() => setPdfCurrentPage(prev => Math.max(1, prev - 1))}
                                            className="p-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                        >
                                            <ChevronLeft className="w-4 h-4" />
                                        </button>
                                        <span className="text-xs font-bold text-gray-700">
                                            Página {pdfCurrentPage} de {pdfTotalPages}
                                        </span>
                                        <button
                                            type="button"
                                            disabled={pdfCurrentPage >= pdfTotalPages}
                                            onClick={() => setPdfCurrentPage(prev => Math.min(pdfTotalPages, prev + 1))}
                                            className="p-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                        >
                                            <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </div>

                                    {/* Resolution Controls */}
                                    <div className="space-y-1.5 bg-indigo-50/50 p-3 rounded-xl border border-indigo-100">
                                        <label className="block text-[10px] font-bold text-indigo-900 uppercase">Qualidade da Importação (Resolução)</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setPdfRenderScale(1.5)}
                                                className={`py-1.5 px-2 rounded-lg text-[10px] font-bold border transition-all ${pdfRenderScale === 1.5 ? 'bg-indigo-600 text-white border-transparent shadow-sm' : 'bg-white border-indigo-200 text-indigo-700 hover:bg-indigo-50'}`}
                                            >
                                                Média (1.5x)
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setPdfRenderScale(2.0)}
                                                className={`py-1.5 px-2 rounded-lg text-[10px] font-bold border transition-all ${pdfRenderScale === 2.0 ? 'bg-indigo-600 text-white border-transparent shadow-sm' : 'bg-white border-indigo-200 text-indigo-700 hover:bg-indigo-50'}`}
                                            >
                                                Alta (2.0x)
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setPdfRenderScale(3.0)}
                                                className={`py-1.5 px-2 rounded-lg text-[10px] font-bold border transition-all ${pdfRenderScale === 3.0 ? 'bg-indigo-600 text-white border-transparent shadow-sm' : 'bg-white border-indigo-200 text-indigo-700 hover:bg-indigo-50'}`}
                                            >
                                                Ultra (3.0x)
                                            </button>
                                        </div>
                                        <p className="text-[9px] text-indigo-900 opacity-70 leading-normal mt-1">
                                            * Resolução Ultra (3.0x) garante máxima nitidez para impressão, mas exige mais do computador. Recomendamos 2.0x para a maioria dos computadores.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-2 justify-end mt-5 pt-3 border-t border-gray-100">
                            <button 
                                onClick={() => {
                                    setShowPdfModal(false);
                                    setPdfDoc(null);
                                    setPdfFile(null);
                                }}
                                className="px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-xl text-xs font-bold transition-all cursor-pointer"
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={handleConfirmPdfPage}
                                disabled={pdfLoading || !pdfDoc}
                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                            >
                                {pdfLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                                Aplicar como Layout de Fundo
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
