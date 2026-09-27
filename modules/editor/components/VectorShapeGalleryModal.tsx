import React, { useState, useMemo } from 'react';
import { 
    X, 
    Search, 
    Sparkles, 
    Square, 
    Maximize2, 
    Minus, 
    Flower2, 
    Shield, 
    Split, 
    Feather, 
    Crown, 
    FlipHorizontal, 
    FlipVertical, 
    Palette, 
    CheckCircle2, 
    SlidersHorizontal, 
    Layers, 
    Wrench, 
    Plus, 
    Check,
    Compass
} from 'lucide-react';
import { 
    VECTOR_SHAPES, 
    STATIONERY_COLOR_PRESETS,
    VectorShapeDefinition
} from './elements/vectorShapesData';
import { 
    ORNAMENT_CATEGORIES, 
    ORNAMENT_VISUAL_FAMILIES, 
    ORNAMENT_ITEMS, 
    MODULAR_FRAME_PRESETS,
    OrnamentCategory, 
    OrnamentVisualFamily, 
    OrnamentItemDefinition, 
    ModularFramePreset,
    getCompatibleOrnaments,
    getOrnamentById
} from './elements/ornamentLibraryData';

export interface VectorShapeGalleryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectShape: (
        shape: VectorShapeDefinition | OrnamentItemDefinition, 
        colorOverride?: { fill: string; stroke: string },
        options?: { flipX?: boolean; flipY?: boolean }
    ) => void;
    onInsertModularFrame?: (
        preset: ModularFramePreset,
        colorOverride?: { fill: string; stroke: string }
    ) => void;
    onBuildCustomModularFrame?: (config: {
        family: OrnamentVisualFamily;
        cornerId: string;
        borderId?: string;
        centerTopId?: string;
        includeInnerLine?: boolean;
        colorOverride?: { fill: string; stroke: string };
    }) => void;
    currentShapeId?: string;
    isUpdatingExisting?: boolean;
}

export const VectorShapeGalleryModal: React.FC<VectorShapeGalleryModalProps> = ({
    isOpen,
    onClose,
    onSelectShape,
    onInsertModularFrame,
    onBuildCustomModularFrame,
    currentShapeId,
    isUpdatingExisting = false,
}) => {
    // Primary Tab: 'components' (Peças Individuais), 'modular_frames' (Molduras Pré-Montadas), 'frame_builder' (Construtor)
    const [activeTab, setActiveTab] = useState<'components' | 'modular_frames' | 'frame_builder'>('components');

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<'all' | OrnamentCategory>('all');
    const [selectedFamily, setSelectedFamily] = useState<'all' | OrnamentVisualFamily>('all');

    // Color Palette
    const [selectedColorPreset, setSelectedColorPreset] = useState<string | null>(null);
    const [customStroke, setCustomStroke] = useState<string>('#18181b');
    const [customFill, setCustomFill] = useState<string>('transparent');
    const [useCustomColor, setUseCustomColor] = useState<boolean>(false);

    // Orientation preview
    const [previewFlipX, setPreviewFlipX] = useState<boolean>(false);
    const [previewFlipY, setPreviewFlipY] = useState<boolean>(false);

    // Interactive Frame Builder State
    const [builderFamily, setBuilderFamily] = useState<OrnamentVisualFamily>('botanical');
    const [builderCornerId, setBuilderCornerId] = useState<string>('corner_botanical_olive');
    const [builderBorderId, setBuilderBorderId] = useState<string>('border_classic_double');
    const [builderCenterTopId, setBuilderCenterTopId] = useState<string>('centerpiece_classic_crown');
    const [builderIncludeInnerLine, setBuilderIncludeInnerLine] = useState<boolean>(true);

    // Unified List of Components (Ornament Items + Legacy Vector Shapes categorized)
    const allAvailableComponents = useMemo(() => {
        // Map legacy shapes to appropriate ornament categories and families
        const legacyMapped: OrnamentItemDefinition[] = VECTOR_SHAPES.map(s => {
            let cat: OrnamentCategory = 'fillers';
            if (s.category === 'frames') cat = 'frames';
            else if (s.category === 'corners') cat = 'corners';
            else if (s.category === 'dividers') cat = 'dividers';
            else if (s.category === 'ornaments') cat = 'arabesques';
            else if (s.category === 'labels' || s.category === 'ribbons') cat = 'medallions';
            else if (s.category === 'geometric') cat = 'fillers';
            else if (s.category === 'botanicals') cat = 'fillers';

            let fam: OrnamentVisualFamily = 'modern';
            if (s.aesthetic === 'minimalist') fam = 'minimalist';
            else if (s.aesthetic === 'vintage' || s.aesthetic === 'luxury') fam = 'classic';
            else if (s.aesthetic === 'organic') fam = 'botanical';
            else if (s.aesthetic === 'editorial' || s.aesthetic === 'elegant') fam = 'neoclassic';

            return {
                id: s.id,
                name: s.name,
                category: cat,
                family: fam,
                description: s.description,
                path: s.path,
                viewBox: s.viewBox || "0 0 100 100",
                fillRule: s.fillRule || 'nonzero',
                defaultRatio: s.defaultRatio || 1,
                defaultW_MM: s.defaultW_MM || 30,
                defaultH_MM: s.defaultH_MM || 30,
                defaultFill: s.defaultFill || 'transparent',
                defaultStroke: s.defaultStroke || '#18181b',
                defaultBorderWidth: s.defaultBorderWidth || 1.2,
                repeatable: s.category === 'dividers' || s.name.toLowerCase().includes('borda') || s.name.toLowerCase().includes('linha'),
                tags: s.tags
            };
        });

        // Unique by id, prioritizing ORNAMENT_ITEMS
        const map = new Map<string, OrnamentItemDefinition>();
        ORNAMENT_ITEMS.forEach(item => map.set(item.id, item));
        legacyMapped.forEach(item => {
            if (!map.has(item.id)) map.set(item.id, item);
        });

        return Array.from(map.values());
    }, []);

    // Active color scheme
    const activeColor = useMemo(() => {
        if (useCustomColor) {
            return { fill: customFill, stroke: customStroke, name: 'Personalizada' };
        }
        if (!selectedColorPreset) return null;
        return STATIONERY_COLOR_PRESETS.find(p => p.id === selectedColorPreset) || null;
    }, [selectedColorPreset, useCustomColor, customFill, customStroke]);

    // Filtered components
    const filteredComponents = useMemo(() => {
        return allAvailableComponents.filter(item => {
            if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
            if (selectedFamily !== 'all' && item.family !== selectedFamily) return false;

            if (!searchQuery.trim()) return true;
            const q = searchQuery.toLowerCase().trim();
            const matchesName = item.name.toLowerCase().includes(q);
            const matchesDesc = item.description.toLowerCase().includes(q);
            const matchesTags = item.tags?.some(t => t.toLowerCase().includes(q));
            const matchesFam = item.family.toLowerCase().includes(q);

            return matchesName || matchesDesc || matchesTags || matchesFam;
        });
    }, [allAvailableComponents, selectedCategory, selectedFamily, searchQuery]);

    // Filtered modular presets
    const filteredPresets = useMemo(() => {
        return MODULAR_FRAME_PRESETS.filter(preset => {
            if (selectedFamily !== 'all' && preset.family !== selectedFamily) return false;
            if (!searchQuery.trim()) return true;
            const q = searchQuery.toLowerCase().trim();
            return preset.title.toLowerCase().includes(q) || preset.description.toLowerCase().includes(q);
        });
    }, [selectedFamily, searchQuery]);

    // Category counts within current family
    const categoryCounts = useMemo(() => {
        const counts: Record<string, number> = { all: 0 };
        ORNAMENT_CATEGORIES.forEach(c => counts[c.id] = 0);
        allAvailableComponents.forEach(item => {
            if (selectedFamily === 'all' || item.family === selectedFamily) {
                counts.all++;
                if (counts[item.category] !== undefined) {
                    counts[item.category]++;
                }
            }
        });
        return counts;
    }, [allAvailableComponents, selectedFamily]);

    // Family counts within current category
    const familyCounts = useMemo(() => {
        const counts: Record<string, number> = { all: 0 };
        ORNAMENT_VISUAL_FAMILIES.forEach(f => counts[f.id] = 0);
        allAvailableComponents.forEach(item => {
            if (selectedCategory === 'all' || item.category === selectedCategory) {
                counts.all++;
                if (counts[item.family] !== undefined) {
                    counts[item.family]++;
                }
            }
        });
        return counts;
    }, [allAvailableComponents, selectedCategory]);

    // Frame builder available options for chosen family
    const familyCorners = useMemo(() => {
        const direct = ORNAMENT_ITEMS.filter(o => o.category === 'corners' && o.family === builderFamily);
        return direct.length > 0 ? direct : ORNAMENT_ITEMS.filter(o => o.category === 'corners');
    }, [builderFamily]);
    const familyBorders = useMemo(() => {
        const direct = ORNAMENT_ITEMS.filter(o => o.category === 'borders' && o.family === builderFamily);
        return direct.length > 0 ? direct : ORNAMENT_ITEMS.filter(o => o.category === 'borders');
    }, [builderFamily]);
    const familyCenterpieces = useMemo(() => {
        const direct = ORNAMENT_ITEMS.filter(o => (o.category === 'centerpieces' || o.category === 'medallions') && o.family === builderFamily);
        return direct.length > 0 ? direct : ORNAMENT_ITEMS.filter(o => (o.category === 'centerpieces' || o.category === 'medallions'));
    }, [builderFamily]);

    if (!isOpen) return null;

    const selectedCornerObj = getOrnamentById(builderCornerId) || familyCorners[0];
    const selectedBorderObj = getOrnamentById(builderBorderId);
    const selectedCenterObj = getOrnamentById(builderCenterTopId);

    const renderCategoryIcon = (iconName: string) => {
        const className = "w-4 h-4 shrink-0";
        switch (iconName) {
            case 'Square': return <Square className={className} />;
            case 'Maximize2': return <Maximize2 className={className} />;
            case 'Sparkles': return <Sparkles className={className} />;
            case 'Minus': return <Minus className={className} />;
            case 'Shield': return <Shield className={className} />;
            case 'Split': return <Split className={className} />;
            case 'Feather': return <Feather className={className} />;
            case 'Crown': return <Crown className={className} />;
            case 'Flower2': return <Flower2 className={className} />;
            default: return <Sparkles className={className} />;
        }
    };

    const handleSelectComponent = (item: OrnamentItemDefinition) => {
        const colorOverride = activeColor ? { fill: activeColor.fill, stroke: activeColor.stroke } : undefined;
        onSelectShape(item, colorOverride, { flipX: previewFlipX, flipY: previewFlipY });
    };

    const handleSelectPreset = (preset: ModularFramePreset) => {
        if (onInsertModularFrame) {
            const colorOverride = activeColor ? { fill: activeColor.fill, stroke: activeColor.stroke } : undefined;
            onInsertModularFrame(preset, colorOverride);
        } else {
            // Fallback: pick first corner
            const first = preset.components[0];
            const item = getOrnamentById(first.shapeId);
            if (item) handleSelectComponent(item);
        }
    };

    const handleExecuteCustomBuilder = () => {
        if (onBuildCustomModularFrame) {
            const colorOverride = activeColor ? { fill: activeColor.fill, stroke: activeColor.stroke } : undefined;
            onBuildCustomModularFrame({
                family: builderFamily,
                cornerId: builderCornerId,
                borderId: builderBorderId !== 'none' ? builderBorderId : undefined,
                centerTopId: builderCenterTopId !== 'none' ? builderCenterTopId : undefined,
                includeInnerLine: builderIncludeInnerLine,
                colorOverride
            });
        }
    };

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-2 sm:p-4 md:p-6 no-print animate-in fade-in duration-200"
            onClick={onClose}
        >
            <div 
                className="bg-white rounded-2xl shadow-2xl border border-stone-200 w-full max-w-6xl max-h-[95vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-5 py-3.5 border-b border-stone-200 bg-linear-to-r from-stone-50 via-amber-50/40 to-stone-50 flex items-start justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-amber-100/90 text-amber-900 border border-amber-200">
                                <Sparkles className="w-3 h-3 text-amber-600" />
                                Sistema de Construção Modular
                            </span>
                            {isUpdatingExisting && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-800 border border-indigo-200">
                                    <CheckCircle2 className="w-3 h-3 text-indigo-600" />
                                    Substituir Peça Selecionada
                                </span>
                            )}
                        </div>
                        <h2 className="text-xl md:text-2xl font-serif font-bold text-stone-900 tracking-tight flex items-center gap-2">
                            Biblioteca Visual de Ornamentos Vetoriais
                        </h2>
                        <p className="text-xs text-stone-500 mt-0.5 font-normal max-w-2xl">
                            Componentes independentes, editáveis e combináveis: cantoneiras espelháveis, bordas repetíveis, divisores e molduras modulares.
                        </p>
                    </div>

                    <button 
                        onClick={onClose}
                        className="text-stone-400 hover:text-stone-700 p-2 rounded-full hover:bg-stone-100 transition-colors cursor-pointer"
                        title="Fechar biblioteca"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Primary Mode Tabs (Componentes vs Molduras Modulares vs Construtor) */}
                <div className="px-4 py-2 border-b border-stone-200 bg-stone-100/70 flex items-center justify-between gap-2 overflow-x-auto">
                    <div className="flex items-center gap-1.5 min-w-max">
                        <button
                            onClick={() => setActiveTab('components')}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                                activeTab === 'components'
                                    ? 'bg-stone-900 text-white shadow-xs'
                                    : 'bg-white text-stone-600 hover:bg-stone-50 border border-stone-200'
                            }`}
                        >
                            <Flower2 className="w-3.5 h-3.5" />
                            <span>Peças Individuais</span>
                            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${activeTab === 'components' ? 'bg-white/20' : 'bg-stone-100 text-stone-500'}`}>
                                {filteredComponents.length}
                            </span>
                        </button>

                        <button
                            onClick={() => setActiveTab('modular_frames')}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                                activeTab === 'modular_frames'
                                    ? 'bg-amber-800 text-white shadow-xs'
                                    : 'bg-white text-stone-600 hover:bg-stone-50 border border-stone-200'
                            }`}
                        >
                            <Layers className="w-3.5 h-3.5 text-amber-500" />
                            <span>Molduras Pré-Montadas</span>
                            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${activeTab === 'modular_frames' ? 'bg-white/20' : 'bg-stone-100 text-stone-500'}`}>
                                {MODULAR_FRAME_PRESETS.length}
                            </span>
                        </button>

                        <button
                            onClick={() => setActiveTab('frame_builder')}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                                activeTab === 'frame_builder'
                                    ? 'bg-indigo-700 text-white shadow-xs'
                                    : 'bg-white text-stone-600 hover:bg-stone-50 border border-stone-200'
                            }`}
                        >
                            <Compass className="w-3.5 h-3.5 text-indigo-400" />
                            <span>Construtor de Moldura</span>
                            <span className="text-[9px] uppercase px-1 py-0.2 rounded bg-amber-100 text-amber-900 font-bold">
                                Interativo
                            </span>
                        </button>
                    </div>

                    {/* Quick Palette Selector in top header */}
                    <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-stone-200 shadow-2xs shrink-0">
                        <span className="text-[10px] font-semibold text-stone-500 pl-1.5 pr-0.5 flex items-center gap-1">
                            <Palette className="w-3 h-3 text-amber-600" />
                            <span className="hidden sm:inline">Cor:</span>
                        </span>
                        <button
                            onClick={() => {
                                setSelectedColorPreset(null);
                                setUseCustomColor(false);
                            }}
                            className={`px-2 py-0.5 text-[10px] rounded-lg font-medium transition-all cursor-pointer ${
                                !selectedColorPreset && !useCustomColor 
                                    ? 'bg-stone-800 text-white shadow-2xs' 
                                    : 'text-stone-600 hover:bg-stone-100'
                            }`}
                        >
                            Padrão
                        </button>
                        {STATIONERY_COLOR_PRESETS.slice(0, 6).map(preset => (
                            <button
                                key={preset.id}
                                onClick={() => {
                                    setSelectedColorPreset(preset.id);
                                    setUseCustomColor(false);
                                }}
                                className={`w-4 h-4 rounded-full border transition-transform cursor-pointer ${
                                    selectedColorPreset === preset.id && !useCustomColor 
                                        ? 'ring-2 ring-stone-900 scale-110 shadow-xs' 
                                        : 'hover:scale-105'
                                }`}
                                style={{ backgroundColor: preset.fill === 'transparent' ? '#ffffff' : preset.fill, borderColor: preset.stroke }}
                                title={preset.name}
                            />
                        ))}
                    </div>
                </div>

                {/* Sub-navigation & Filters (shown for components & modular frames) */}
                {activeTab !== 'frame_builder' && (
                    <>
                        {/* Visual Families Row (Clássico, Neoclássico, Escandinavo, Moderno, Botânico, Art Déco, Minimalista) */}
                        <div className="px-4 py-2 border-b border-stone-200 bg-white flex items-center gap-2 overflow-x-auto scrollbar-thin">
                            <div className="flex items-center gap-1 shrink-0 text-[10px] font-bold uppercase tracking-wider text-stone-400 pr-1">
                                <SlidersHorizontal className="w-3 h-3 text-stone-400" />
                                <span>Família:</span>
                            </div>

                            <div className="flex items-center gap-1 min-w-max">
                                {ORNAMENT_VISUAL_FAMILIES.map(fam => {
                                    const isSelected = selectedFamily === fam.id;
                                    const count = familyCounts[fam.id] || 0;
                                    if (count === 0 && fam.id !== 'all') return null;

                                    return (
                                        <button
                                            key={fam.id}
                                            onClick={() => setSelectedFamily(fam.id)}
                                            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                                                isSelected
                                                    ? 'bg-stone-900 text-white font-semibold shadow-2xs'
                                                    : 'bg-stone-100/90 text-stone-600 hover:bg-stone-200/80 hover:text-stone-900'
                                            }`}
                                            title={`${fam.subtitle}: ${fam.description}`}
                                        >
                                            <span>{fam.label}</span>
                                            <span className={`text-[9px] px-1 py-0.2 rounded-full font-mono ${
                                                isSelected ? 'bg-white/25 text-white' : 'bg-stone-200/60 text-stone-500'
                                            }`}>
                                                {count}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Categories Bar (Molduras, Cantoneiras, Arabescos, Bordas, Medalhões, Divisores, Floreios, Centrais, Preenchimento) */}
                        {activeTab === 'components' && (
                            <div className="px-4 py-2 border-b border-stone-200 bg-stone-50/70 overflow-x-auto scrollbar-thin">
                                <div className="flex items-center gap-1.5 min-w-max">
                                    {ORNAMENT_CATEGORIES.map(cat => {
                                        const isSelected = selectedCategory === cat.id;
                                        const count = categoryCounts[cat.id] || 0;
                                        if (count === 0 && cat.id !== 'all') return null;

                                        return (
                                            <button
                                                key={cat.id}
                                                onClick={() => setSelectedCategory(cat.id)}
                                                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
                                                    isSelected 
                                                        ? 'bg-amber-900 text-white shadow-2xs ring-1 ring-amber-900/20' 
                                                        : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100 hover:text-stone-900'
                                                }`}
                                                title={cat.description}
                                            >
                                                {renderCategoryIcon(cat.icon)}
                                                <span>{cat.label}</span>
                                                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                                                    isSelected ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-500'
                                                }`}>
                                                    {count}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Search and Mirror Toolbar */}
                        <div className="px-4 py-2.5 border-b border-stone-200 bg-white/60 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                            <div className="relative flex-1">
                                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    placeholder="Buscar elemento (ex: acanto, meandro, louro, coroa, oliveira, filete, leque...)"
                                    className="w-full pl-9 pr-8 py-1.5 text-xs bg-white border border-stone-200 rounded-xl focus:outline-hidden focus:border-stone-500 focus:ring-2 focus:ring-stone-200 transition-all font-sans"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery('')}
                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-0.5 rounded-full"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>

                            {/* Mirror Controls for previewing before inserting */}
                            <div className="flex items-center gap-1.5 shrink-0 justify-end">
                                <div className="flex items-center bg-stone-100 p-1 rounded-xl border border-stone-200/80 gap-1">
                                    <span className="text-[10px] font-semibold text-stone-500 px-1">Espelhar:</span>
                                    <button
                                        onClick={() => setPreviewFlipX(!previewFlipX)}
                                        className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                                            previewFlipX ? 'bg-stone-900 text-white' : 'bg-white text-stone-600 hover:bg-stone-50'
                                        }`}
                                        title="Espelhar Horizontalmente (Flip H)"
                                    >
                                        <FlipHorizontal className="w-3 h-3" />
                                        <span>Flip H {previewFlipX ? '✓' : ''}</span>
                                    </button>
                                    <button
                                        onClick={() => setPreviewFlipY(!previewFlipY)}
                                        className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                                            previewFlipY ? 'bg-stone-900 text-white' : 'bg-white text-stone-600 hover:bg-stone-50'
                                        }`}
                                        title="Espelhar Verticalmente (Flip V)"
                                    >
                                        <FlipVertical className="w-3 h-3" />
                                        <span>Flip V {previewFlipY ? '✓' : ''}</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* Content Body */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-stone-100/50">
                    {/* TAB 1: INDIVIDUAL PIECES */}
                    {activeTab === 'components' && (
                        <div>
                            {filteredComponents.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 text-center">
                                    <div className="w-16 h-16 rounded-2xl bg-stone-100 flex items-center justify-center text-stone-400 mb-3 border border-stone-200">
                                        <Search className="w-7 h-7" />
                                    </div>
                                    <h4 className="text-base font-serif font-bold text-stone-800">Nenhum componente encontrado</h4>
                                    <p className="text-xs text-stone-500 max-w-sm mt-1">
                                        Tente alterar o filtro de família visual ou limpar a busca.
                                    </p>
                                    <button
                                        onClick={() => { 
                                            setSearchQuery(''); 
                                            setSelectedCategory('all'); 
                                            setSelectedFamily('all'); 
                                        }}
                                        className="mt-4 px-4 py-2 text-xs font-bold text-stone-800 bg-white border border-stone-200 hover:bg-stone-50 rounded-xl transition-colors shadow-xs cursor-pointer"
                                    >
                                        Ver todos ({allAvailableComponents.length} peças)
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
                                    {filteredComponents.map(item => {
                                        const isCurrent = currentShapeId === item.id;
                                        const previewFill = activeColor ? activeColor.fill : (item.defaultFill || 'transparent');
                                        const previewStroke = activeColor ? activeColor.stroke : (item.defaultStroke || '#18181b');
                                        const transformScaleX = previewFlipX ? -1 : 1;
                                        const transformScaleY = previewFlipY ? -1 : 1;

                                        return (
                                            <div
                                                key={item.id}
                                                onClick={() => handleSelectComponent(item)}
                                                className={`group relative bg-white rounded-2xl p-3 border transition-all cursor-pointer flex flex-col items-center justify-between text-center select-none hover:shadow-lg hover:-translate-y-0.5 ${
                                                    isCurrent 
                                                        ? 'border-amber-600 ring-2 ring-amber-300 bg-amber-50/20' 
                                                        : 'border-stone-200 hover:border-amber-400'
                                                }`}
                                            >
                                                {/* Top Badges */}
                                                <div className="w-full flex items-center justify-between gap-1 mb-1.5">
                                                    <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-stone-100 text-stone-600 group-hover:bg-amber-100 group-hover:text-amber-900 transition-colors">
                                                        {item.family}
                                                    </span>
                                                    {item.repeatable && (
                                                        <span className="text-[8px] uppercase font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200" title="Elemento repetível em padrão de borda contínua">
                                                            Repetível
                                                        </span>
                                                    )}
                                                    {isCurrent && (
                                                        <span className="w-2 h-2 rounded-full bg-amber-600 animate-pulse" />
                                                    )}
                                                </div>

                                                {/* SVG Preview Frame */}
                                                <div className="w-full aspect-square bg-stone-50/80 rounded-xl border border-stone-100 flex items-center justify-center p-3 mb-2 group-hover:bg-white group-hover:border-stone-200 transition-colors overflow-hidden">
                                                    <svg 
                                                        viewBox={item.viewBox || "0 0 100 100"} 
                                                        className="w-full h-full max-h-24 max-w-24 transition-transform group-hover:scale-105"
                                                        style={{ 
                                                            transform: `scaleX(${transformScaleX}) scaleY(${transformScaleY})` 
                                                        }}
                                                    >
                                                        <path 
                                                            d={item.path} 
                                                            fill={previewFill} 
                                                            fillRule={item.fillRule || 'nonzero'}
                                                            stroke={previewStroke} 
                                                            strokeWidth={item.defaultBorderWidth || 1.2}
                                                            strokeLinecap="round" 
                                                            strokeLinejoin="round" 
                                                        />
                                                    </svg>
                                                </div>

                                                {/* Title & Category Info */}
                                                <div className="w-full">
                                                    <h3 className="text-xs font-serif font-bold text-stone-800 truncate leading-snug group-hover:text-amber-900" title={item.name}>
                                                        {item.name}
                                                    </h3>
                                                    <p className="text-[10px] text-stone-400 capitalize mt-0.5">
                                                        {item.category}
                                                    </p>
                                                </div>

                                                {/* Action Overlay */}
                                                <div className="mt-2.5 w-full pt-2 border-t border-stone-100 flex items-center justify-center text-[10px] font-bold text-amber-800 opacity-80 group-hover:opacity-100">
                                                    <span>{isCurrent ? 'Selecionado' : 'Inserir na Página →'}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB 2: MODULAR FRAME PRESETS */}
                    {activeTab === 'modular_frames' && (
                        <div className="space-y-4">
                            <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3 text-xs text-amber-950 flex items-start gap-2.5">
                                <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                                <div>
                                    <span className="font-bold">Composições 100% Modulares & Editáveis: </span>
                                    Ao inserir qualquer moldura pronta, ela NÃO entra como imagem achatada. Cada canto, borda e ornamento central é adicionado como um elemento vetorial independente na página (agrupados para facilitar a movimentação), permitindo mover, trocar, recolorir ou remover qualquer parte livremente!
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {filteredPresets.map(preset => {
                                    const cornerTL = getOrnamentById(preset.components.find(c => c.role === 'corner-tl')?.shapeId || '');
                                    const centerpiece = getOrnamentById(preset.components.find(c => c.role === 'center-top' || c.role === 'center-bottom')?.shapeId || '');
                                    const stroke = activeColor ? activeColor.stroke : '#18181b';

                                    return (
                                        <div 
                                            key={preset.id}
                                            className="bg-white rounded-2xl border border-stone-200 p-4 flex flex-col justify-between hover:shadow-lg hover:border-amber-400 transition-all select-none"
                                        >
                                            <div>
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-900">
                                                        {preset.family}
                                                    </span>
                                                    <span className="text-[10px] font-semibold text-stone-500 bg-stone-100 px-2 py-0.5 rounded-full">
                                                        {preset.badge || `${preset.components.length} peças`}
                                                    </span>
                                                </div>

                                                <h3 className="text-base font-serif font-bold text-stone-900">
                                                    {preset.title}
                                                </h3>
                                                <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                                                    {preset.description}
                                                </p>

                                                {/* Simulated Modular Frame Miniature Preview */}
                                                <div className="my-3 aspect-4/3 bg-stone-50 rounded-xl border border-stone-200 relative p-3 flex flex-col justify-between overflow-hidden">
                                                    {/* Top row */}
                                                    <div className="flex items-start justify-between relative">
                                                        {cornerTL && (
                                                            <svg viewBox={cornerTL.viewBox || "0 0 100 100"} className="w-8 h-8">
                                                                <path d={cornerTL.path} stroke={stroke} strokeWidth="1.5" fill="none" />
                                                            </svg>
                                                        )}
                                                        {centerpiece && (
                                                            <svg viewBox={centerpiece.viewBox || "0 0 100 100"} className="w-8 h-8">
                                                                <path d={centerpiece.path} stroke={stroke} strokeWidth="1.5" fill="none" />
                                                            </svg>
                                                        )}
                                                        {cornerTL && (
                                                            <svg viewBox={cornerTL.viewBox || "0 0 100 100"} className="w-8 h-8" style={{ transform: 'scaleX(-1)' }}>
                                                                <path d={cornerTL.path} stroke={stroke} strokeWidth="1.5" fill="none" />
                                                            </svg>
                                                        )}
                                                    </div>

                                                    {/* Center dashed placeholder */}
                                                    <div className="self-center border border-dashed border-stone-300 rounded px-3 py-1 text-[9px] text-stone-400 font-serif">
                                                        Área do Miolo / Texto
                                                    </div>

                                                    {/* Bottom row */}
                                                    <div className="flex items-end justify-between relative">
                                                        {cornerTL && (
                                                            <svg viewBox={cornerTL.viewBox || "0 0 100 100"} className="w-8 h-8" style={{ transform: 'scaleY(-1)' }}>
                                                                <path d={cornerTL.path} stroke={stroke} strokeWidth="1.5" fill="none" />
                                                            </svg>
                                                        )}
                                                        <div className="h-0.5 flex-1 mx-2 bg-stone-300 self-center" />
                                                        {cornerTL && (
                                                            <svg viewBox={cornerTL.viewBox || "0 0 100 100"} className="w-8 h-8" style={{ transform: 'scaleX(-1) scaleY(-1)' }}>
                                                                <path d={cornerTL.path} stroke={stroke} strokeWidth="1.5" fill="none" />
                                                            </svg>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Component List Pills */}
                                                <div className="space-y-1 text-[10px] text-stone-600">
                                                    <div className="font-bold text-stone-400 uppercase text-[9px]">Componentes inclusos:</div>
                                                    <div className="flex flex-wrap gap-1">
                                                        {preset.components.map((comp, idx) => (
                                                            <span key={idx} className="bg-stone-100 text-stone-700 px-1.5 py-0.5 rounded text-[9px]">
                                                                {comp.name}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => handleSelectPreset(preset)}
                                                className="mt-4 w-full py-2.5 px-3 bg-stone-900 hover:bg-amber-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
                                            >
                                                <Plus className="w-3.5 h-3.5" />
                                                <span>Inserir Moldura Modular na Página</span>
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* TAB 3: INTERACTIVE FRAME BUILDER */}
                    {activeTab === 'frame_builder' && (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                            {/* Left Config Panel */}
                            <div className="lg:col-span-6 space-y-4 bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
                                <div>
                                    <h3 className="text-base font-serif font-bold text-stone-900">
                                        Montador Modular de Moldura
                                    </h3>
                                    <p className="text-xs text-stone-500 mt-0.5">
                                        Escolha uma cantoneira, um filete de borda e um ornamento central para gerar uma moldura inteira parametrizada.
                                    </p>
                                </div>

                                {/* Step 1: Select Visual Family */}
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-stone-500 uppercase block">1. Família Visual</label>
                                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
                                        {ORNAMENT_VISUAL_FAMILIES.filter(f => f.id !== 'all').map(fam => (
                                            <button
                                                key={fam.id}
                                                type="button"
                                                onClick={() => {
                                                    setBuilderFamily(fam.id as OrnamentVisualFamily);
                                                    const matchingCorner = ORNAMENT_ITEMS.find(o => o.category === 'corners' && o.family === fam.id) || ORNAMENT_ITEMS.find(o => o.category === 'corners');
                                                    if (matchingCorner) setBuilderCornerId(matchingCorner.id);
                                                    const matchingBorder = ORNAMENT_ITEMS.find(o => o.category === 'borders' && o.family === fam.id) || ORNAMENT_ITEMS.find(o => o.category === 'borders');
                                                    if (matchingBorder) setBuilderBorderId(matchingBorder.id);
                                                    const matchingCenter = ORNAMENT_ITEMS.find(o => (o.category === 'centerpieces' || o.category === 'medallions') && o.family === fam.id) || ORNAMENT_ITEMS.find(o => o.category === 'centerpieces');
                                                    if (matchingCenter) setBuilderCenterTopId(matchingCenter.id);
                                                }}
                                                className={`py-1.5 px-2 rounded-xl text-xs font-semibold border text-center transition-all cursor-pointer ${
                                                    builderFamily === fam.id
                                                        ? 'bg-amber-100 border-amber-500 text-amber-900 font-bold shadow-2xs'
                                                        : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                                                }`}
                                            >
                                                {fam.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Step 2: Choose Corner */}
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-stone-500 uppercase block">2. Cantoneira (Vértices 4 Cantos)</label>
                                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                        {familyCorners.map(corner => {
                                            const isSelected = builderCornerId === corner.id;
                                            return (
                                                <button
                                                    key={corner.id}
                                                    type="button"
                                                    onClick={() => setBuilderCornerId(corner.id)}
                                                    className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                                                        isSelected
                                                            ? 'bg-amber-50 border-amber-600 ring-2 ring-amber-300'
                                                            : 'bg-stone-50 border-stone-200 hover:bg-white'
                                                    }`}
                                                >
                                                    <svg viewBox={corner.viewBox || "0 0 100 100"} className="w-8 h-8">
                                                        <path d={corner.path} stroke="#18181b" strokeWidth="1.5" fill="none" />
                                                    </svg>
                                                    <span className="text-[9px] font-medium text-stone-700 truncate w-full text-center">
                                                        {corner.name.replace('Cantoneira ', '')}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Step 3: Choose Border Line */}
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-stone-500 uppercase block">3. Filete / Borda Superior & Inferior</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setBuilderBorderId('none')}
                                            className={`py-2 px-3 rounded-xl border text-xs text-center transition-all cursor-pointer ${
                                                builderBorderId === 'none'
                                                    ? 'bg-amber-50 border-amber-600 text-amber-900 font-bold'
                                                    : 'bg-stone-50 border-stone-200 text-stone-600'
                                            }`}
                                        >
                                            Sem bordas de ligação
                                        </button>
                                        {familyBorders.slice(0, 3).map(border => {
                                            const isSelected = builderBorderId === border.id;
                                            return (
                                                <button
                                                    key={border.id}
                                                    type="button"
                                                    onClick={() => setBuilderBorderId(border.id)}
                                                    className={`py-2 px-3 rounded-xl border text-xs text-center truncate transition-all cursor-pointer ${
                                                        isSelected
                                                            ? 'bg-amber-50 border-amber-600 text-amber-900 font-bold'
                                                            : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-white'
                                                    }`}
                                                    title={border.name}
                                                >
                                                    {border.name}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Step 4: Choose Centerpiece */}
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-stone-500 uppercase block">4. Ornamento Central de Topo</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setBuilderCenterTopId('none')}
                                            className={`p-2 rounded-xl border text-xs text-center flex items-center justify-center transition-all cursor-pointer ${
                                                builderCenterTopId === 'none'
                                                    ? 'bg-amber-50 border-amber-600 text-amber-900 font-bold'
                                                    : 'bg-stone-50 border-stone-200 text-stone-600'
                                            }`}
                                        >
                                            Sem ornamento
                                        </button>
                                        {familyCenterpieces.slice(0, 2).map(center => {
                                            const isSelected = builderCenterTopId === center.id;
                                            return (
                                                <button
                                                    key={center.id}
                                                    type="button"
                                                    onClick={() => setBuilderCenterTopId(center.id)}
                                                    className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                                                        isSelected
                                                            ? 'bg-amber-50 border-amber-600 ring-2 ring-amber-300'
                                                            : 'bg-stone-50 border-stone-200 hover:bg-white'
                                                    }`}
                                                >
                                                    <svg viewBox={center.viewBox || "0 0 100 100"} className="w-7 h-7">
                                                        <path d={center.path} stroke="#18181b" strokeWidth="1.5" fill="none" />
                                                    </svg>
                                                    <span className="text-[9px] font-medium text-stone-700 truncate w-full text-center">
                                                        {center.name}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Step 5: Toggles */}
                                <div className="pt-2 border-t border-stone-100">
                                    <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-stone-700">
                                        <input
                                            type="checkbox"
                                            checked={builderIncludeInnerLine}
                                            onChange={e => setBuilderIncludeInnerLine(e.target.checked)}
                                            className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                                        />
                                        <span>Incluir linha interna fina (quadro secundário)</span>
                                    </label>
                                </div>

                                {/* Action Button */}
                                <button
                                    type="button"
                                    onClick={handleExecuteCustomBuilder}
                                    className="w-full py-3 px-4 bg-stone-900 hover:bg-amber-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
                                >
                                    <Sparkles className="w-4 h-4 text-amber-400" />
                                    <span>Inserir Moldura Personalizada na Página</span>
                                </button>
                            </div>

                            {/* Right Live Interactive Preview */}
                            <div className="lg:col-span-6 bg-stone-50 border border-stone-200 rounded-2xl p-6 flex flex-col items-center justify-center">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-3">
                                    Pré-visualização da Composição Modular
                                </span>

                                <div className="w-full max-w-sm aspect-3/4 bg-white rounded-xl border border-stone-300 shadow-lg relative p-5 flex flex-col justify-between">
                                    {/* Optional Inner line */}
                                    {builderIncludeInnerLine && (
                                        <div className="absolute inset-4 border border-stone-200 rounded pointer-events-none" />
                                    )}

                                    {/* Top Corner Row */}
                                    <div className="flex items-start justify-between relative z-10">
                                        {selectedCornerObj && (
                                            <svg viewBox={selectedCornerObj.viewBox || "0 0 100 100"} className="w-12 h-12">
                                                <path d={selectedCornerObj.path} stroke={activeColor?.stroke || '#18181b'} strokeWidth="1.5" fill="none" />
                                            </svg>
                                        )}

                                        {selectedCenterObj && builderCenterTopId !== 'none' && (
                                            <svg viewBox={selectedCenterObj.viewBox || "0 0 100 100"} className="w-12 h-12 -mt-2">
                                                <path d={selectedCenterObj.path} stroke={activeColor?.stroke || '#18181b'} strokeWidth="1.5" fill="none" />
                                            </svg>
                                        )}

                                        {selectedCornerObj && (
                                            <svg viewBox={selectedCornerObj.viewBox || "0 0 100 100"} className="w-12 h-12" style={{ transform: 'scaleX(-1)' }}>
                                                <path d={selectedCornerObj.path} stroke={activeColor?.stroke || '#18181b'} strokeWidth="1.5" fill="none" />
                                            </svg>
                                        )}
                                    </div>

                                    {/* Middle border preview */}
                                    {selectedBorderObj && builderBorderId !== 'none' && (
                                        <div className="absolute top-7 left-18 right-18 h-3 overflow-hidden flex items-center justify-center">
                                            <svg viewBox={selectedBorderObj.viewBox || "0 0 100 100"} className="w-full h-full" preserveAspectRatio="none">
                                                <path d={selectedBorderObj.path} stroke={activeColor?.stroke || '#18181b'} strokeWidth="1.5" fill="none" />
                                            </svg>
                                        </div>
                                    )}

                                    {/* Center Content Placeholder */}
                                    <div className="self-center text-center p-4 border border-dashed border-stone-300 rounded-lg bg-stone-50/50">
                                        <div className="font-serif text-sm font-bold text-stone-700">Título do Miolo</div>
                                        <div className="text-[10px] text-stone-400 mt-1 font-sans">
                                            Todos os 4 cantos e bordas inseridos serão independentes e poderão ser movidos, redimensionados ou trocados.
                                        </div>
                                    </div>

                                    {/* Bottom Border preview */}
                                    {selectedBorderObj && builderBorderId !== 'none' && (
                                        <div className="absolute bottom-7 left-18 right-18 h-3 overflow-hidden flex items-center justify-center">
                                            <svg viewBox={selectedBorderObj.viewBox || "0 0 100 100"} className="w-full h-full" preserveAspectRatio="none" style={{ transform: 'scaleY(-1)' }}>
                                                <path d={selectedBorderObj.path} stroke={activeColor?.stroke || '#18181b'} strokeWidth="1.5" fill="none" />
                                            </svg>
                                        </div>
                                    )}

                                    {/* Bottom Corner Row */}
                                    <div className="flex items-end justify-between relative z-10">
                                        {selectedCornerObj && (
                                            <svg viewBox={selectedCornerObj.viewBox || "0 0 100 100"} className="w-12 h-12" style={{ transform: 'scaleY(-1)' }}>
                                                <path d={selectedCornerObj.path} stroke={activeColor?.stroke || '#18181b'} strokeWidth="1.5" fill="none" />
                                            </svg>
                                        )}

                                        {selectedCornerObj && (
                                            <svg viewBox={selectedCornerObj.viewBox || "0 0 100 100"} className="w-12 h-12" style={{ transform: 'scaleX(-1) scaleY(-1)' }}>
                                                <path d={selectedCornerObj.path} stroke={activeColor?.stroke || '#18181b'} strokeWidth="1.5" fill="none" />
                                            </svg>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-4 text-center">
                                    <span className="text-[11px] font-semibold text-stone-500">
                                        Família Selecionada: <strong className="text-stone-800 uppercase">{builderFamily}</strong>
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
