import React, { useRef, useState, useEffect } from 'react';
import { AgendaConfig, BackgroundConfig, BackgroundRulesConfig, CategoryBackgroundConfig } from '../../../types';
import {
    Palmtree, Trash2, Upload, Minus, Palette, Layers, Eye, EyeOff, AlertTriangle,
    X, ChevronLeft, ChevronRight, Loader2, FileText, FlipHorizontal, FlipVertical,
    RotateCw, BookOpen, Plus, Sparkles, Copy, CheckCircle2, HelpCircle, ArrowRight,
    Settings, Zap
} from 'lucide-react';
import { compressImage } from '../utils/imageCompressor';
import { ImageManager, useImageSrc } from '../utils/imageManager';
import {
    getRuleBackground,
    updateRuleBackground,
    applyBackgroundToTargets,
    migrateLegacyBackgroundsToRules,
    BackgroundCategoryType
} from '../../../core/logic/backgroundRules';

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

const COLOR_SWATCHES = [
    { name: 'Branco Puríssimo', hex: '#ffffff' },
    { name: 'Bege Floral', hex: '#fdfbf7' },
    { name: 'Creme Suave', hex: '#f7f4eb' },
    { name: 'Rosa Pastel', hex: '#fdf2f4' },
    { name: 'Verde Botânico', hex: '#f0f7f4' },
    { name: 'Azul Céu', hex: '#f0f4f8' },
    { name: 'Lilás Delicado', hex: '#f8f0f8' },
    { name: 'Terracota Suave', hex: '#f9f1ee' },
    { name: 'Cinza Mármore', hex: '#f3f4f6' },
];

interface BackgroundSettingsProps {
    agendaConfig: AgendaConfig;
    onAgendaConfigChange: (updatedConfig: AgendaConfig) => void;
    currentEditorPageNum?: number;
    pushHistory?: () => void;
}

export const BackgroundSettings: React.FC<BackgroundSettingsProps> = ({
    agendaConfig,
    onAgendaConfigChange,
    currentEditorPageNum = 1,
    pushHistory
}) => {
    // Garantir que temos a estrutura de regras sincronizada
    const rules: BackgroundRulesConfig = migrateLegacyBackgroundsToRules(agendaConfig);

    // Estados de navegação no painel
    const [selectedCategory, setSelectedCategory] = useState<'global' | BackgroundCategoryType | 'specific'>('global');
    const [selectedScope, setSelectedScope] = useState<'default' | 'even' | 'odd'>('default');
    const [selectedSpecificPage, setSelectedSpecificPage] = useState<number>(currentEditorPageNum || 37);

    // Modal "Aplicar este fundo a..."
    const [showApplyModal, setShowApplyModal] = useState(false);
    const [applyTargets, setApplyTargets] = useState<string[]>([]);
    const [applySuccessMessage, setApplySuccessMessage] = useState(false);

    // Banner de ajuda da hierarquia
    const [showHelpBanner, setShowHelpBanner] = useState(false);

    // Estados de upload de imagem/PDF
    const fileInputRef = useRef<HTMLInputElement>(null);
    const pdfPreviewCanvasRef = useRef<HTMLCanvasElement>(null);
    const [showPdfModal, setShowPdfModal] = useState(false);
    const [pdfDoc, setPdfDoc] = useState<any>(null);
    const [pdfTotalPages, setPdfTotalPages] = useState(0);
    const [pdfCurrentPage, setPdfCurrentPage] = useState(1);
    const [pdfLoading, setPdfLoading] = useState(false);
    const [pdfRenderScale, setPdfRenderScale] = useState(2.0);

    // Obter a configuração atual selecionada
    const currentBg: BackgroundConfig = getRuleBackground(
        rules,
        selectedCategory,
        selectedCategory === 'specific' ? selectedSpecificPage : selectedScope
    ) || {
        type: 'none',
        opacity: 1
    };

    const bgUrl = useImageSrc(currentBg.image?.url);

    // Atualiza a regra atual
    const updateCurrentBg = (updates: Partial<BackgroundConfig> | null) => {
        if (pushHistory) pushHistory();

        let updatedBg: BackgroundConfig | null = null;
        if (updates !== null) {
            updatedBg = {
                ...currentBg,
                ...updates
            };
        }

        const newRules = updateRuleBackground(
            rules,
            selectedCategory,
            selectedCategory === 'specific' ? selectedSpecificPage : selectedScope,
            updatedBg
        );

        updateAllRules(newRules);
    };

    // Atualiza a estrutura inteira de regras
    const updateAllRules = (newRules: BackgroundRulesConfig) => {
        if (pushHistory) pushHistory();
        onAgendaConfigChange({
            ...agendaConfig,
            backgroundRules: newRules,
            // Sincronizar campo legado de fundo global para compatibilidade sem fantasma
            background: newRules.global && newRules.global.type !== 'none' ? { ...newRules.global } : undefined
        });
    };

    // Handler para confirmação em lote do modal "Aplicar este fundo a..."
    const handleApplyToTargetsConfirm = () => {
        if (applyTargets.length === 0) return;
        const newRules = applyBackgroundToTargets(rules, currentBg, applyTargets, currentEditorPageNum);
        updateAllRules(newRules);
        setShowApplyModal(false);
        setApplySuccessMessage(true);
        setTimeout(() => setApplySuccessMessage(false), 3000);
    };

    // Renderizar prévia da página PDF no modal
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

                await page.render({ canvasContext: context, viewport }).promise;
            } catch (err) {
                console.error('Erro ao renderizar prévia do PDF:', err);
            }
        };

        renderPage();
        return () => { active = false; };
    }, [pdfDoc, pdfCurrentPage, showPdfModal]);

    const handlePdfUpload = (file: File) => {
        setPdfLoading(true);
        setShowPdfModal(true);

        const reader = new FileReader();
        reader.onload = async () => {
            try {
                const pdfjs = await loadPdfJs();
                const arrayBuffer = reader.result as ArrayBuffer;
                const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
                setPdfDoc(pdf);
                setPdfTotalPages(pdf.numPages);
                setPdfCurrentPage(1);
                setPdfLoading(false);
            } catch (error) {
                console.error('Erro ao ler PDF:', error);
                alert('Não foi possível ler este arquivo PDF.');
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
            if (!context) throw new Error('Falha no canvas');

            const viewport = page.getViewport({ scale: pdfRenderScale });
            canvas.width = viewport.width;
            canvas.height = viewport.height;

            await page.render({ canvasContext: context, viewport }).promise;
            const dataUrl = canvas.toDataURL('image/png');
            const registeredUrl = await ImageManager.registerImage(dataUrl);

            updateCurrentBg({
                type: 'image',
                image: {
                    url: registeredUrl,
                    opacity: currentBg.image?.opacity ?? 1,
                    fit: 'fill'
                }
            });

            setShowPdfModal(false);
            setPdfDoc(null);
        } catch (error) {
            console.error('Erro ao converter página do PDF:', error);
            alert('Erro ao converter a página do PDF.');
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

            updateCurrentBg({
                type: 'image',
                image: {
                    url: registeredUrl,
                    opacity: currentBg.image?.opacity ?? 1,
                    fit: currentBg.image?.fit ?? 'cover'
                }
            });
        } catch (error) {
            console.error('Erro ao fazer upload da imagem:', error);
        }
    };

    // Label do alvo ativo para exibição
    const getTargetActiveLabel = () => {
        if (selectedCategory === 'global') return '🌐 Toda a Agenda (Geral)';
        if (selectedCategory === 'specific') return `🔢 Página Específica (#${selectedSpecificPage})`;

        const catNames: Record<string, string> = {
            miolo: '📖 Miolo',
            mensais: '📅 Páginas Mensais',
            divisorias: '📑 Divisórias',
            iniciais: '🚀 Páginas Iniciais'
        };

        const scopeNames: Record<string, string> = {
            default: 'Padrão da Categoria',
            even: 'Páginas Pares (Esquerda)',
            odd: 'Páginas Ímpares (Direita)'
        };

        return `${catNames[selectedCategory]} → ${scopeNames[selectedScope]}`;
    };

    // Extrair lista detalhada de todas as regras ativas de fundo
    const getActiveRulesList = () => {
        const list: Array<{
            key: string;
            label: string;
            category: 'global' | BackgroundCategoryType | 'specific';
            scope: 'default' | 'even' | 'odd' | number;
            bg: BackgroundConfig;
        }> = [];

        if (rules.global && rules.global.type && rules.global.type !== 'none') {
            list.push({ key: 'global', label: '🌐 Toda a Agenda (Geral)', category: 'global', scope: 'default', bg: rules.global });
        }

        const catLabels: Record<BackgroundCategoryType, string> = {
            miolo: '📖 Miolo',
            mensais: '📅 Páginas Mensais',
            divisorias: '📑 Divisórias',
            iniciais: '🚀 Páginas Iniciais'
        };

        const scopeLabels: Record<string, string> = {
            default: 'Padrão da Categoria',
            even: 'Páginas Pares (Esquerda)',
            odd: 'Páginas Ímpares (Direita)'
        };

        (['miolo', 'mensais', 'divisorias', 'iniciais'] as BackgroundCategoryType[]).forEach(cat => {
            const c = rules[cat];
            if (!c) return;
            if (c.default && c.default.type && c.default.type !== 'none') {
                list.push({ key: `${cat}_default`, label: `${catLabels[cat]} → ${scopeLabels.default}`, category: cat, scope: 'default', bg: c.default });
            }
            if (c.even && c.even.type && c.even.type !== 'none') {
                list.push({ key: `${cat}_even`, label: `${catLabels[cat]} → ${scopeLabels.even}`, category: cat, scope: 'even', bg: c.even });
            }
            if (c.odd && c.odd.type && c.odd.type !== 'none') {
                list.push({ key: `${cat}_odd`, label: `${catLabels[cat]} → ${scopeLabels.odd}`, category: cat, scope: 'odd', bg: c.odd });
            }
        });

        if (rules.specificPages) {
            Object.entries(rules.specificPages).forEach(([pNumStr, bg]) => {
                const pNum = parseInt(pNumStr, 10);
                if (bg && bg.type && bg.type !== 'none') {
                    list.push({ key: `page_${pNum}`, label: `⭐ Página Específica nº ${pNum}`, category: 'specific', scope: pNum, bg });
                }
            });
        }

        return list;
    };

    const activeRulesList = getActiveRulesList();
    const hasRuleForCurrentTarget = currentBg && currentBg.type && currentBg.type !== 'none';

    // Toggle de seleção rápida para o modal
    const toggleModalTarget = (key: string) => {
        if (applyTargets.includes(key)) {
            setApplyTargets(applyTargets.filter(k => k !== key));
        } else {
            setApplyTargets([...applyTargets, key]);
        }
    };

    const selectAllModalTargets = () => {
        setApplyTargets([
            'global',
            'miolo_default', 'miolo_even', 'miolo_odd',
            'divisorias_default', 'divisorias_even', 'divisorias_odd',
            'mensais_default', 'mensais_even', 'mensais_odd',
            'iniciais_default', 'iniciais_even', 'iniciais_odd',
            `page_${currentEditorPageNum}`
        ]);
    };

    const deselectAllModalTargets = () => {
        setApplyTargets([]);
    };

    return (
        <div className="space-y-5 text-gray-800">
            {/* CABEÇALHO DO PAINEL */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md">
                        <Palette className="w-4 h-4" />
                    </div>
                    <div>
                        <h3 className="text-xs font-black text-gray-900 uppercase tracking-wide">Personalização de Fundos</h3>
                        <p className="text-[10px] text-gray-500">Sistema hierárquico por seções, paridade e páginas</p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() => setShowHelpBanner(!showHelpBanner)}
                    className="p-1.5 hover:bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                    title="Ver como funciona a prioridade dos fundos"
                >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span className="text-[10px]">Prioridades</span>
                </button>
            </div>

            {/* BANNER INFORMATIVO DE HIERARQUIA */}
            {showHelpBanner && (
                <div className="p-3 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-150 text-xs space-y-2 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between font-bold text-indigo-950 text-[11px]">
                        <span>🏆 Hierarquia de Prioridades</span>
                        <button type="button" onClick={() => setShowHelpBanner(false)} className="text-gray-400 hover:text-gray-600">
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>
                    <ol className="space-y-1 text-[10px] text-gray-700 pl-4 list-decimal font-medium">
                        <li><strong className="text-indigo-900">Página Específica:</strong> Sobrescreve tudo para aquela página única.</li>
                        <li><strong className="text-indigo-900">Par / Ímpar da Categoria:</strong> Aplica às páginas pares ou ímpares daquela seção.</li>
                        <li><strong className="text-indigo-900">Fundo da Categoria:</strong> Aplica a toda a seção (ex: todo o miolo).</li>
                        <li><strong className="text-indigo-900">Fundo Geral:</strong> Fundo padrão da agenda inteira.</li>
                    </ol>
                </div>
            )}

            {/* MENSAGEM DE SUCESSO DE APLICAÇÃO */}
            {applySuccessMessage && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Fundo aplicado aos alvos selecionados com sucesso!</span>
                </div>
            )}

            {/* PASSO 1: APLICAR FUNDO EM (SELEÇÃO DE CATEGORIA) */}
            <div className="p-3 bg-gray-50/80 rounded-2xl border border-gray-200 space-y-2.5">
                <label className="text-[10px] font-black text-gray-700 uppercase tracking-wider flex items-center justify-between">
                    <span>1. Aplicar fundo em:</span>
                </label>

                <div className="grid grid-cols-2 gap-1.5">
                    <button
                        type="button"
                        onClick={() => setSelectedCategory('global')}
                        className={`p-2.5 rounded-xl border text-[11px] font-bold text-left transition-all cursor-pointer flex items-center gap-2 relative ${
                            selectedCategory === 'global'
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md ring-2 ring-indigo-500/20'
                                : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                        {rules.global && rules.global.type && rules.global.type !== 'none' && (
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white" title="Regra de Fundo Ativa" />
                        )}
                        <span className="text-base">🌐</span>
                        <div>
                            <div className="leading-tight">Toda a Agenda</div>
                            <div className={`text-[9px] font-normal leading-tight ${selectedCategory === 'global' ? 'text-indigo-100' : 'text-gray-400'}`}>Geral</div>
                        </div>
                    </button>

                    <button
                        type="button"
                        onClick={() => setSelectedCategory('miolo')}
                        className={`p-2.5 rounded-xl border text-[11px] font-bold text-left transition-all cursor-pointer flex items-center gap-2 relative ${
                            selectedCategory === 'miolo'
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md ring-2 ring-indigo-500/20'
                                : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                        {rules.miolo && (rules.miolo.default || rules.miolo.even || rules.miolo.odd) && (
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white" title="Regra de Fundo Ativa" />
                        )}
                        <span className="text-base">📖</span>
                        <div>
                            <div className="leading-tight">Miolo</div>
                            <div className={`text-[9px] font-normal leading-tight ${selectedCategory === 'miolo' ? 'text-indigo-100' : 'text-gray-400'}`}>Páginas Diárias</div>
                        </div>
                    </button>

                    <button
                        type="button"
                        onClick={() => setSelectedCategory('mensais')}
                        className={`p-2.5 rounded-xl border text-[11px] font-bold text-left transition-all cursor-pointer flex items-center gap-2 relative ${
                            selectedCategory === 'mensais'
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md ring-2 ring-indigo-500/20'
                                : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                        {rules.mensais && (rules.mensais.default || rules.mensais.even || rules.mensais.odd) && (
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white" title="Regra de Fundo Ativa" />
                        )}
                        <span className="text-base">📅</span>
                        <div>
                            <div className="leading-tight">Páginas Mensais</div>
                            <div className={`text-[9px] font-normal leading-tight ${selectedCategory === 'mensais' ? 'text-indigo-100' : 'text-gray-400'}`}>Aberturas Mês</div>
                        </div>
                    </button>

                    <button
                        type="button"
                        onClick={() => setSelectedCategory('divisorias')}
                        className={`p-2.5 rounded-xl border text-[11px] font-bold text-left transition-all cursor-pointer flex items-center gap-2 relative ${
                            selectedCategory === 'divisorias'
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md ring-2 ring-indigo-500/20'
                                : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                        {rules.divisorias && (rules.divisorias.default || rules.divisorias.even || rules.divisorias.odd) && (
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white" title="Regra de Fundo Ativa" />
                        )}
                        <span className="text-base">📑</span>
                        <div>
                            <div className="leading-tight">Divisórias</div>
                            <div className={`text-[9px] font-normal leading-tight ${selectedCategory === 'divisorias' ? 'text-indigo-100' : 'text-gray-400'}`}>Capas Mês</div>
                        </div>
                    </button>

                    <button
                        type="button"
                        onClick={() => setSelectedCategory('iniciais')}
                        className={`p-2.5 rounded-xl border text-[11px] font-bold text-left transition-all cursor-pointer flex items-center gap-2 relative ${
                            selectedCategory === 'iniciais'
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md ring-2 ring-indigo-500/20'
                                : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                        {rules.iniciais && (rules.iniciais.default || rules.iniciais.even || rules.iniciais.odd) && (
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white" title="Regra de Fundo Ativa" />
                        )}
                        <span className="text-base">🚀</span>
                        <div>
                            <div className="leading-tight">Páginas Iniciais</div>
                            <div className={`text-[9px] font-normal leading-tight ${selectedCategory === 'iniciais' ? 'text-indigo-100' : 'text-gray-400'}`}>Dados, Calendários</div>
                        </div>
                    </button>

                    <button
                        type="button"
                        onClick={() => setSelectedCategory('specific')}
                        className={`p-2.5 rounded-xl border text-[11px] font-bold text-left transition-all cursor-pointer flex items-center gap-2 relative ${
                            selectedCategory === 'specific'
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md ring-2 ring-indigo-500/20'
                                : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                        {rules.specificPages && Object.keys(rules.specificPages).length > 0 && (
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white" title="Páginas Exclusivas Ativas" />
                        )}
                        <span className="text-base">⭐</span>
                        <div>
                            <div className="leading-tight">Página Específica</div>
                            <div className={`text-[9px] font-normal leading-tight ${selectedCategory === 'specific' ? 'text-indigo-100' : 'text-gray-400'}`}>Ex: Pág 37</div>
                        </div>
                    </button>
                </div>
            </div>

            {/* PASSO 2: ESCOPO DE PARIDADE OU PÁGINA ESPECÍFICA */}
            {selectedCategory !== 'global' && selectedCategory !== 'specific' && (() => {
                const activeCat = rules[selectedCategory as BackgroundCategoryType];
                const hasDefault = activeCat?.default && activeCat.default.type && activeCat.default.type !== 'none';
                const hasEven = activeCat?.even && activeCat.even.type && activeCat.even.type !== 'none';
                const hasOdd = activeCat?.odd && activeCat.odd.type && activeCat.odd.type !== 'none';

                return (
                    <div className="p-3 bg-indigo-50/60 rounded-2xl border border-indigo-150 space-y-2">
                        <label className="text-[10px] font-black text-indigo-950 uppercase tracking-wider flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                            2. Regra de Paridade da Categoria:
                        </label>

                        <div className="grid grid-cols-3 gap-1.5">
                            <button
                                type="button"
                                onClick={() => setSelectedScope('default')}
                                className={`p-2 rounded-xl border text-[10px] font-bold text-center transition-all cursor-pointer flex items-center justify-center gap-1 relative ${
                                    selectedScope === 'default'
                                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                                        : 'bg-white border-indigo-100 text-gray-700 hover:bg-indigo-50'
                                }`}
                            >
                                <span>Toda a Categoria</span>
                                {hasDefault && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" title="Regra ativa no Padrão da Categoria" />}
                            </button>

                            <button
                                type="button"
                                onClick={() => setSelectedScope('even')}
                                className={`p-2 rounded-xl border text-[10px] font-bold text-center transition-all cursor-pointer flex items-center justify-center gap-1 relative ${
                                    selectedScope === 'even'
                                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                                        : 'bg-white border-indigo-100 text-gray-700 hover:bg-indigo-50'
                                }`}
                            >
                                <span>📘 Par (Esquerda)</span>
                                {hasEven && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" title="Regra ativa para Páginas Pares" />}
                            </button>

                            <button
                                type="button"
                                onClick={() => setSelectedScope('odd')}
                                className={`p-2 rounded-xl border text-[10px] font-bold text-center transition-all cursor-pointer flex items-center justify-center gap-1 relative ${
                                    selectedScope === 'odd'
                                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                                        : 'bg-white border-indigo-100 text-gray-700 hover:bg-indigo-50'
                                }`}
                            >
                                <span>📖 Ímpar (Direita)</span>
                                {hasOdd && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" title="Regra ativa para Páginas Ímpares" />}
                            </button>
                        </div>
                    </div>
                );
            })()}

            {/* SELEÇÃO DE PÁGINA ESPECÍFICA */}
            {selectedCategory === 'specific' && (
                <div className="p-3 bg-amber-50/70 rounded-2xl border border-amber-200 space-y-3">
                    <label className="text-[10px] font-black text-amber-950 uppercase tracking-wider flex items-center justify-between">
                        <span>⭐ Selecionar Número da Página:</span>
                    </label>

                    <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                            <span className="absolute left-3 top-2.5 text-xs text-amber-700 font-bold">Página nº</span>
                            <input
                                type="number"
                                min="1"
                                max="1000"
                                value={selectedSpecificPage}
                                onChange={(e) => setSelectedSpecificPage(Math.max(1, parseInt(e.target.value) || 1))}
                                className="w-full pl-20 pr-3 py-2 text-xs font-black border border-amber-300 rounded-xl bg-white text-amber-950 outline-none focus:ring-2 focus:ring-amber-500"
                            />
                        </div>

                        <button
                            type="button"
                            onClick={() => setSelectedSpecificPage(currentEditorPageNum)}
                            className="px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-bold rounded-xl shadow-xs transition-all flex items-center gap-1 cursor-pointer shrink-0"
                        >
                            <span>Página Atual (#{currentEditorPageNum})</span>
                        </button>
                    </div>

                    {/* Lista de sobreposições de páginas específicas já ativas */}
                    {rules.specificPages && Object.keys(rules.specificPages).length > 0 && (
                        <div className="pt-2 border-t border-amber-200/60 space-y-1.5">
                            <span className="text-[9px] font-bold text-amber-800 uppercase block">Páginas exclusivas personalizadas:</span>
                            <div className="flex flex-wrap gap-1.5">
                                {Object.entries(rules.specificPages).map(([pNumStr, bgObj]) => {
                                    const pNum = parseInt(pNumStr, 10);
                                    if (!bgObj || bgObj.type === 'none') return null;
                                    const isSelected = selectedSpecificPage === pNum;

                                    return (
                                        <div
                                            key={pNum}
                                            onClick={() => setSelectedSpecificPage(pNum)}
                                            className={`px-2.5 py-1 rounded-lg border text-[10px] font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                                                isSelected
                                                    ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                                                    : 'bg-white text-amber-900 border-amber-300 hover:bg-amber-100'
                                            }`}
                                        >
                                            <span>Pág. {pNum}</span>
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    updateAllRules(updateRuleBackground(rules, 'specific', pNum, null));
                                                }}
                                                className="p-0.5 hover:text-red-500 rounded"
                                                title="Remover fundo exclusivo desta página"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* PAINEL DE EDIÇÃO DO FUNDO PARA O ALVO SELECIONADO */}
            <div className="p-4 bg-white rounded-2xl border-2 border-indigo-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                    <div className="text-[11px] font-black text-indigo-950 flex items-center gap-1.5">
                        <Zap className="w-4 h-4 text-indigo-600 shrink-0" />
                        <span>{getTargetActiveLabel()}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                        {hasRuleForCurrentTarget && (
                            <button
                                type="button"
                                onClick={() => {
                                    updateAllRules(updateRuleBackground(rules, selectedCategory, selectedCategory === 'specific' ? selectedSpecificPage : selectedScope, null));
                                }}
                                className="px-2.5 py-1 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                                title="Excluir/remover a regra de fundo desta seção"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Excluir Regra</span>
                            </button>
                        )}
                        {currentBg.type !== 'none' && (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-indigo-100 text-indigo-800">
                                {currentBg.type === 'solid' ? 'Cor Sólida' : currentBg.type === 'gradient' ? 'Gradiente' : 'Imagem'}
                            </span>
                        )}
                    </div>
                </div>

                {/* BOTÕES DE TIPO DE FUNDO */}
                <div className="grid grid-cols-3 gap-2">
                    <button
                        type="button"
                        onClick={() => {
                            updateAllRules(updateRuleBackground(rules, selectedCategory, selectedCategory === 'specific' ? selectedSpecificPage : selectedScope, null));
                        }}
                        className={`p-2.5 rounded-xl border text-[10px] font-bold flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                            currentBg.type === 'none'
                                ? 'bg-gray-100 border-gray-300 text-gray-500'
                                : 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100 hover:border-red-300'
                        }`}
                        title="Remover/excluir o fundo desta seção"
                    >
                        <Trash2 className="w-4 h-4 text-red-500" />
                        <span>Excluir Fundo</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => updateCurrentBg({ type: 'solid', color: currentBg.color || '#fdfbf7' })}
                        className={`p-2.5 rounded-xl border text-[10px] font-bold flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                            currentBg.type === 'solid' || currentBg.type === 'gradient'
                                ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-xs'
                                : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                        }`}
                    >
                        <Palette className="w-4 h-4 text-indigo-600" />
                        <span>Cor / Gradiente</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className={`p-2.5 rounded-xl border text-[10px] font-bold flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                            currentBg.type === 'image'
                                ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-xs'
                                : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                        }`}
                    >
                        <Upload className="w-4 h-4 text-purple-600" />
                        <span>Imagem / PDF</span>
                    </button>
                </div>

                {/* CONTROLES SE TIPO = COR / GRADIENTE */}
                {(currentBg.type === 'solid' || currentBg.type === 'gradient') && (
                    <div className="space-y-3 p-3 bg-gray-50 rounded-xl border border-gray-200 animate-in fade-in">
                        <div className="flex items-center justify-between pb-1">
                            <span className="text-[10px] font-bold text-gray-600 uppercase">Modo de Cor:</span>
                            <div className="flex bg-gray-200 p-0.5 rounded-lg text-[9px] font-bold">
                                <button
                                    type="button"
                                    onClick={() => updateCurrentBg({ type: 'solid', color: currentBg.color || '#fdfbf7' })}
                                    className={`px-2 py-1 rounded-md transition-all cursor-pointer ${currentBg.type === 'solid' ? 'bg-white text-indigo-900 shadow-xs' : 'text-gray-600'}`}
                                >
                                    Cor Sólida
                                </button>
                                <button
                                    type="button"
                                    onClick={() => updateCurrentBg({
                                        type: 'gradient',
                                        gradient: currentBg.gradient || { type: 'linear', colors: ['#ffffff', '#f3f4f6'], direction: 180 }
                                    })}
                                    className={`px-2 py-1 rounded-md transition-all cursor-pointer ${currentBg.type === 'gradient' ? 'bg-white text-indigo-900 shadow-xs' : 'text-gray-600'}`}
                                >
                                    Gradiente
                                </button>
                            </div>
                        </div>

                        {currentBg.type === 'solid' && (
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="color"
                                        value={currentBg.color || '#ffffff'}
                                        onChange={(e) => updateCurrentBg({ color: e.target.value })}
                                        className="w-10 h-10 border-0 rounded-lg cursor-pointer bg-transparent"
                                    />
                                    <input
                                        type="text"
                                        value={currentBg.color || '#ffffff'}
                                        onChange={(e) => updateCurrentBg({ color: e.target.value })}
                                        className="flex-1 text-xs p-2 font-mono uppercase font-bold border border-gray-300 rounded-lg bg-white"
                                    />
                                </div>

                                {/* PALETA DE CORES RÁPIDAS */}
                                <div>
                                    <span className="text-[9px] font-extrabold text-gray-500 uppercase block mb-1">Cores Recomendadas:</span>
                                    <div className="flex flex-wrap gap-1">
                                        {COLOR_SWATCHES.map((swatch) => (
                                            <button
                                                key={swatch.hex}
                                                type="button"
                                                onClick={() => updateCurrentBg({ color: swatch.hex })}
                                                className="w-6 h-6 rounded-md border border-gray-300 shadow-2xs hover:scale-110 transition-transform cursor-pointer"
                                                style={{ backgroundColor: swatch.hex }}
                                                title={swatch.name}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {currentBg.type === 'gradient' && currentBg.gradient && (
                            <div className="space-y-3">
                                <div
                                    className="h-10 w-full rounded-lg border border-gray-300 shadow-inner"
                                    style={{
                                        background: currentBg.gradient.type === 'linear'
                                            ? `linear-gradient(${currentBg.gradient.direction}deg, ${currentBg.gradient.colors[0]}, ${currentBg.gradient.colors[1]})`
                                            : `radial-gradient(circle at center, ${currentBg.gradient.colors[0]}, ${currentBg.gradient.colors[1]})`
                                    }}
                                />

                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div>
                                        <label className="block text-[9px] font-bold text-gray-500 uppercase">Tipo</label>
                                        <select
                                            value={currentBg.gradient.type}
                                            onChange={(e) => updateCurrentBg({ gradient: { ...currentBg.gradient!, type: e.target.value as any } })}
                                            className="w-full text-xs p-1.5 border border-gray-300 rounded-lg bg-white font-bold"
                                        >
                                            <option value="linear">Linear</option>
                                            <option value="radial">Radial</option>
                                        </select>
                                    </div>

                                    {currentBg.gradient.type === 'linear' && (
                                        <div>
                                            <label className="block text-[9px] font-bold text-gray-500 uppercase">Ângulo (°)</label>
                                            <input
                                                type="number"
                                                value={currentBg.gradient.direction}
                                                onChange={(e) => updateCurrentBg({ gradient: { ...currentBg.gradient!, direction: parseInt(e.target.value) || 0 } })}
                                                className="w-full text-xs p-1.5 border border-gray-300 rounded-lg bg-white font-bold"
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="block text-[9px] font-bold text-gray-500 uppercase">Cor Inicial</label>
                                        <input
                                            type="color"
                                            value={currentBg.gradient.colors[0]}
                                            onChange={(e) => updateCurrentBg({ gradient: { ...currentBg.gradient!, colors: [e.target.value, currentBg.gradient!.colors[1]] } })}
                                            className="w-full h-8 border border-gray-300 rounded-lg cursor-pointer"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[9px] font-bold text-gray-500 uppercase">Cor Final</label>
                                        <input
                                            type="color"
                                            value={currentBg.gradient.colors[1]}
                                            onChange={(e) => updateCurrentBg({ gradient: { ...currentBg.gradient!, colors: [currentBg.gradient!.colors[0], e.target.value] } })}
                                            className="w-full h-8 border border-gray-300 rounded-lg cursor-pointer"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* CONTROLES SE TIPO = IMAGEM */}
                {currentBg.type === 'image' && (
                    <div className="space-y-3 p-3 bg-gray-50 rounded-xl border border-gray-200 animate-in fade-in">
                        {bgUrl ? (
                            <div className="flex items-center gap-3">
                                <img src={bgUrl} alt="Prévia do Fundo" className="w-16 h-20 object-cover rounded-lg border border-gray-300 shadow-2xs" />
                                <div className="space-y-1">
                                    <span className="text-xs font-bold text-gray-800 block">Imagem Carregada</span>
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 underline block cursor-pointer"
                                    >
                                        Trocar Imagem ou PDF
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full p-4 border-2 border-dashed border-gray-300 rounded-xl text-center hover:border-indigo-400 hover:bg-indigo-50/50 transition-all cursor-pointer"
                            >
                                <Upload className="w-6 h-6 mx-auto text-gray-400 mb-1" />
                                <span className="text-xs font-bold text-gray-700 block">Clique para escolher imagem ou PDF</span>
                            </button>
                        )}

                        {/* CONTROLES DE IMAGEM */}
                        <div className="space-y-2 pt-2 border-t border-gray-200">
                            <div>
                                <label className="block text-[9px] font-bold text-gray-500 uppercase mb-1">
                                    Opacidade: {Math.round((currentBg.image?.opacity ?? 1) * 100)}%
                                </label>
                                <input
                                    type="range"
                                    min="0.05"
                                    max="1"
                                    step="0.05"
                                    value={currentBg.image?.opacity ?? 1}
                                    onChange={(e) => updateCurrentBg({
                                        image: { ...(currentBg.image || { url: '', fit: 'cover' }), opacity: parseFloat(e.target.value) }
                                    })}
                                    className="w-full"
                                />
                            </div>

                            <div>
                                <label className="block text-[9px] font-bold text-gray-500 uppercase mb-1">Ajuste na Página:</label>
                                <div className="grid grid-cols-3 gap-1">
                                    <button
                                        type="button"
                                        onClick={() => updateCurrentBg({ image: { ...(currentBg.image || { url: '', opacity: 1 }), fit: 'cover' } })}
                                        className={`py-1 text-[10px] font-bold rounded-lg border cursor-pointer ${currentBg.image?.fit === 'cover' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-300'}`}
                                    >
                                        Cobrir
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => updateCurrentBg({ image: { ...(currentBg.image || { url: '', opacity: 1 }), fit: 'contain' } })}
                                        className={`py-1 text-[10px] font-bold rounded-lg border cursor-pointer ${currentBg.image?.fit === 'contain' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-300'}`}
                                    >
                                        Conter
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => updateCurrentBg({ image: { ...(currentBg.image || { url: '', opacity: 1 }), fit: 'fill' } })}
                                        className={`py-1 text-[10px] font-bold rounded-lg border cursor-pointer ${currentBg.image?.fit === 'fill' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-300'}`}
                                    >
                                        Esticar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* BOTÃO "APLICAR ESTE FUNDO A..." */}
                <button
                    type="button"
                    onClick={() => {
                        setApplyTargets([
                            selectedCategory === 'global' ? 'global' :
                            selectedCategory === 'specific' ? `page_${selectedSpecificPage}` :
                            `${selectedCategory}_${selectedScope}`
                        ]);
                        setShowApplyModal(true);
                    }}
                    className="w-full py-2.5 px-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-extrabold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                    <Zap className="w-4 h-4 text-amber-300" />
                    <span>Aplicar este fundo a...</span>
                </button>
            </div>

            {/* INPUT INVISÍVEL DE UPLOAD */}
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*,application/pdf"
                className="hidden"
            />

            {/* GERENCIADOR DE REGRAS ATIVAS DA AGENDA COM BOTÕES DE EXCLUSÃO */}
            <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200 space-y-2.5">
                <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-gray-700 uppercase tracking-wider block">
                        📋 Regras Ativas ({activeRulesList.length})
                    </span>

                    {activeRulesList.length > 0 && (
                        <button
                            type="button"
                            onClick={() => {
                                if (confirm('Tem certeza que deseja apagar todas as regras de fundo da agenda?')) {
                                    updateAllRules({});
                                }
                            }}
                            className="text-[9px] font-bold text-red-600 hover:text-red-800 hover:underline cursor-pointer flex items-center gap-1"
                        >
                            <Trash2 className="w-3 h-3" />
                            <span>Excluir Todas</span>
                        </button>
                    )}
                </div>

                {activeRulesList.length === 0 ? (
                    <div className="p-3 bg-white rounded-xl border border-dashed border-gray-300 text-center text-gray-400 text-xs">
                        Nenhuma regra de fundo personalizada ativa.
                    </div>
                ) : (
                    <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                        {activeRulesList.map((item) => {
                            const isCurrentSelected = selectedCategory === item.category &&
                                (item.category === 'specific' ? selectedSpecificPage === item.scope : selectedScope === item.scope);

                            return (
                                <div
                                    key={item.key}
                                    onClick={() => {
                                        setSelectedCategory(item.category);
                                        if (item.category === 'specific') {
                                            setSelectedSpecificPage(item.scope as number);
                                        } else {
                                            setSelectedScope(item.scope as any);
                                        }
                                    }}
                                    className={`p-2 rounded-xl border text-[11px] font-bold flex items-center justify-between gap-2 cursor-pointer transition-all ${
                                        isCurrentSelected
                                            ? 'bg-indigo-50 border-indigo-400 text-indigo-950 shadow-2xs'
                                            : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-100'
                                    }`}
                                >
                                    <div className="flex items-center gap-2 truncate">
                                        <div
                                            className="w-4 h-4 rounded-full border border-gray-300 shrink-0 shadow-2xs"
                                            style={{
                                                backgroundColor: item.bg.type === 'solid' ? item.bg.color : '#e0e7ff'
                                            }}
                                        />
                                        <span className="truncate">{item.label}</span>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            updateAllRules(updateRuleBackground(rules, item.category, item.scope, null));
                                        }}
                                        className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors shrink-0 cursor-pointer"
                                        title={`Excluir regra: ${item.label}`}
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* MODAL: "APLICAR ESTE FUNDO A..." */}
            {showApplyModal && (
                <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
                    <div className="bg-white rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl border border-gray-200">
                        <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                            <div className="flex items-center gap-2">
                                <Zap className="w-5 h-5 text-indigo-600" />
                                <h3 className="text-sm font-black text-gray-900">Aplicar este fundo a...</h3>
                            </div>
                            <button type="button" onClick={() => setShowApplyModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <p className="text-xs text-gray-600">
                            Marque todas as seções para as quais você quer copiar este fundo atual:
                        </p>

                        <div className="flex justify-between items-center text-[10px] font-bold text-indigo-600">
                            <button type="button" onClick={selectAllModalTargets} className="hover:underline cursor-pointer">
                                ☑️ Selecionar Todos
                            </button>
                            <button type="button" onClick={deselectAllModalTargets} className="hover:underline cursor-pointer">
                                ☐ Desmarcar Todos
                            </button>
                        </div>

                        {/* LISTA DE OPÇÕES COM CHECKBOXES */}
                        <div className="space-y-3 max-h-60 overflow-y-auto pr-1 text-xs font-semibold">
                            {/* GERAL */}
                            <label className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={applyTargets.includes('global')}
                                    onChange={() => toggleModalTarget('global')}
                                    className="rounded text-indigo-600 focus:ring-indigo-500"
                                />
                                <span>🌐 Toda a Agenda (Fundo Geral)</span>
                            </label>

                            {/* MIOLO */}
                            <div className="p-2 bg-indigo-50/50 rounded-xl space-y-1.5 border border-indigo-100">
                                <span className="text-[10px] font-black text-indigo-900 uppercase">📖 Miolo</span>
                                <div className="grid grid-cols-1 gap-1 pl-2">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={applyTargets.includes('miolo_default')}
                                            onChange={() => toggleModalTarget('miolo_default')}
                                        />
                                        <span>Todo o Miolo (Padrão)</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={applyTargets.includes('miolo_even')}
                                            onChange={() => toggleModalTarget('miolo_even')}
                                        />
                                        <span>Todo o Miolo Par (Esquerda)</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={applyTargets.includes('miolo_odd')}
                                            onChange={() => toggleModalTarget('miolo_odd')}
                                        />
                                        <span>Todo o Miolo Ímpar (Direita)</span>
                                    </label>
                                </div>
                            </div>

                            {/* DIVISÓRIAS */}
                            <div className="p-2 bg-purple-50/50 rounded-xl space-y-1.5 border border-purple-100">
                                <span className="text-[10px] font-black text-purple-900 uppercase">📑 Divisórias</span>
                                <div className="grid grid-cols-1 gap-1 pl-2">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={applyTargets.includes('divisorias_default')}
                                            onChange={() => toggleModalTarget('divisorias_default')}
                                        />
                                        <span>Todas as Divisórias (Padrão)</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={applyTargets.includes('divisorias_even')}
                                            onChange={() => toggleModalTarget('divisorias_even')}
                                        />
                                        <span>Todas as Divisórias Pares</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={applyTargets.includes('divisorias_odd')}
                                            onChange={() => toggleModalTarget('divisorias_odd')}
                                        />
                                        <span>Todas as Divisórias Ímpares</span>
                                    </label>
                                </div>
                            </div>

                            {/* MENSAIS */}
                            <div className="p-2 bg-blue-50/50 rounded-xl space-y-1.5 border border-blue-100">
                                <span className="text-[10px] font-black text-blue-900 uppercase">📅 Páginas Mensais</span>
                                <div className="grid grid-cols-1 gap-1 pl-2">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={applyTargets.includes('mensais_default')}
                                            onChange={() => toggleModalTarget('mensais_default')}
                                        />
                                        <span>Todas as Mensais (Padrão)</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={applyTargets.includes('mensais_even')}
                                            onChange={() => toggleModalTarget('mensais_even')}
                                        />
                                        <span>Todas as Mensais Pares</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={applyTargets.includes('mensais_odd')}
                                            onChange={() => toggleModalTarget('mensais_odd')}
                                        />
                                        <span>Todas as Mensais Ímpares</span>
                                    </label>
                                </div>
                            </div>

                            {/* INICIAIS */}
                            <div className="p-2 bg-emerald-50/50 rounded-xl space-y-1.5 border border-emerald-100">
                                <span className="text-[10px] font-black text-emerald-900 uppercase">🚀 Páginas Iniciais</span>
                                <div className="grid grid-cols-1 gap-1 pl-2">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={applyTargets.includes('iniciais_default')}
                                            onChange={() => toggleModalTarget('iniciais_default')}
                                        />
                                        <span>Todas as Iniciais (Padrão)</span>
                                    </label>
                                </div>
                            </div>

                            {/* PÁGINA ESPECÍFICA */}
                            <label className="flex items-center gap-2 p-2 bg-amber-50 rounded-lg border border-amber-200 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={applyTargets.includes(`page_${currentEditorPageNum}`)}
                                    onChange={() => toggleModalTarget(`page_${currentEditorPageNum}`)}
                                />
                                <span>Somente esta página (#{currentEditorPageNum})</span>
                            </label>
                        </div>

                        {/* AÇÕES DO MODAL */}
                        <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={() => setShowApplyModal(false)}
                                className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={handleApplyToTargetsConfirm}
                                disabled={applyTargets.length === 0}
                                className="px-5 py-2 text-xs font-black bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                            >
                                <Zap className="w-3.5 h-3.5 text-amber-300" />
                                <span>Aplicar ({applyTargets.length})</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL DE SELEÇÃO DE PÁGINA PDF */}
            {showPdfModal && (
                <div className="fixed inset-0 z-[9999] bg-black/70 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-2xl">
                        <div className="flex items-center justify-between pb-2 border-b">
                            <h3 className="text-sm font-black text-gray-900">Selecione a Página do PDF</h3>
                            <button type="button" onClick={() => setShowPdfModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="flex flex-col items-center space-y-3">
                            <div className="border rounded-xl p-2 bg-gray-50 max-h-72 overflow-auto flex justify-center w-full">
                                <canvas ref={pdfPreviewCanvasRef} className="max-w-full h-auto shadow-md rounded" />
                            </div>

                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    disabled={pdfCurrentPage <= 1}
                                    onClick={() => setPdfCurrentPage(p => Math.max(1, p - 1))}
                                    className="p-1.5 border rounded-lg hover:bg-gray-100 disabled:opacity-40"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <span className="text-xs font-bold">Página {pdfCurrentPage} de {pdfTotalPages}</span>
                                <button
                                    type="button"
                                    disabled={pdfCurrentPage >= pdfTotalPages}
                                    onClick={() => setPdfCurrentPage(p => Math.min(pdfTotalPages, p + 1))}
                                    className="p-1.5 border rounded-lg hover:bg-gray-100 disabled:opacity-40"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-2 border-t">
                            <button
                                type="button"
                                onClick={() => setShowPdfModal(false)}
                                className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmPdfPage}
                                disabled={pdfLoading}
                                className="px-5 py-2 text-xs font-bold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 flex items-center gap-2"
                            >
                                {pdfLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                                <span>Usar esta Página</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
