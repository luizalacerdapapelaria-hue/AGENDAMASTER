import React, { useState } from 'react';
import { 
    X, 
    Sparkles, 
    Droplets, 
    Smile, 
    Sun, 
    Utensils, 
    Moon, 
    Pill, 
    Heart, 
    Activity, 
    Check, 
    Palette,
    Layers,
    AlignHorizontalJustifyCenter,
    AlignHorizontalJustifyStart,
    AlignHorizontalJustifyEnd
} from 'lucide-react';
import { FooterTrackerConfig, FooterTrackerType } from '../../../types';
import { FooterTrackerElement } from './elements/FooterTrackers';

export interface FooterTrackerPreset {
    id: string;
    title: string;
    description: string;
    category: 'water' | 'weather' | 'mood' | 'meals' | 'sleep' | 'wellness';
    config: FooterTrackerConfig;
    defaultW: number;
    defaultH: number;
    badge?: string;
}

export const FOOTER_TRACKER_PRESETS: FooterTrackerPreset[] = [
    // --- 1. ÁGUA & HIDRATAÇÃO ---
    {
        id: 'water_glasses_8',
        title: '8 Copos de Água (Clássico)',
        description: 'Meta tradicional de 2 litros de água dividida em 8 copos para colorir.',
        category: 'water',
        defaultW: 46,
        defaultH: 6.5,
        badge: 'Mais Popular',
        config: {
            trackerType: 'water',
            iconVariant: 'glass',
            itemCount: 8,
            itemSize: 20,
            spacing: 5,
            strokeColor: '#2563eb',
            fillColor: 'transparent',
            strokeWidth: 1.2,
            showLabel: true,
            label: 'Água',
            labelPosition: 'left'
        }
    },
    {
        id: 'water_bottles_6',
        title: '6 Garrafinhas de Hidratação',
        description: 'Garrafinhas reutilizáveis esportivas com marcador de nível.',
        category: 'water',
        defaultW: 42,
        defaultH: 6.5,
        config: {
            trackerType: 'water',
            iconVariant: 'bottle',
            itemCount: 6,
            itemSize: 20,
            spacing: 5,
            strokeColor: '#0ea5e9',
            fillColor: 'transparent',
            strokeWidth: 1.2,
            showLabel: true,
            label: 'Hidratação',
            labelPosition: 'left'
        }
    },
    {
        id: 'water_drops_8',
        title: '8 Gotas d’Água Minimalistas',
        description: 'Gotas de água estilizadas com brilho e traço editorial fino.',
        category: 'water',
        defaultW: 40,
        defaultH: 6.0,
        config: {
            trackerType: 'water',
            iconVariant: 'drop',
            itemCount: 8,
            itemSize: 18,
            spacing: 5,
            strokeColor: '#1d4ed8',
            fillColor: 'transparent',
            strokeWidth: 1.2,
            showLabel: true,
            label: '2 Litros',
            labelPosition: 'left'
        }
    },
    {
        id: 'water_mugs_5',
        title: '5 Canecas de Chá & Café',
        description: 'Canecas quentinhas com vapor para registrar ingestão líquida.',
        category: 'water',
        defaultW: 42,
        defaultH: 6.5,
        config: {
            trackerType: 'water',
            iconVariant: 'mug',
            itemCount: 5,
            itemSize: 19,
            spacing: 5,
            strokeColor: '#b45309',
            fillColor: 'transparent',
            strokeWidth: 1.2,
            showLabel: true,
            label: 'Líquidos',
            labelPosition: 'left'
        }
    },

    // --- 2. HUMOR & EMOÇÕES ---
    {
        id: 'mood_faces_5',
        title: 'Humor do Dia (5 Carinhas Limpas)',
        description: 'Expressões: Radiante, Feliz, Neutro, Triste e Cansado.',
        category: 'mood',
        defaultW: 45,
        defaultH: 6.5,
        badge: 'Favorito',
        config: {
            trackerType: 'mood',
            iconVariant: 'faces_clean',
            itemCount: 5,
            itemSize: 21,
            spacing: 6,
            strokeColor: '#374151',
            fillColor: 'transparent',
            strokeWidth: 1.2,
            showLabel: true,
            label: 'Humor',
            labelPosition: 'left'
        }
    },
    {
        id: 'mood_kawaii_5',
        title: 'Carinhas Kawaii (Fofas)',
        description: 'Carinhas delicadas com bochechas expressivas.',
        category: 'mood',
        defaultW: 48,
        defaultH: 6.5,
        config: {
            trackerType: 'mood',
            iconVariant: 'faces_cute',
            itemCount: 5,
            itemSize: 21,
            spacing: 6,
            strokeColor: '#e11d48',
            fillColor: 'transparent',
            strokeWidth: 1.2,
            showLabel: true,
            label: 'Hoje me sinto',
            labelPosition: 'left'
        }
    },
    {
        id: 'mood_stars_5',
        title: 'Avaliação em Estrelas (1 a 5)',
        description: 'Classificação de 1 a 5 estrelas para nota geral do dia.',
        category: 'mood',
        defaultW: 40,
        defaultH: 6.5,
        config: {
            trackerType: 'mood',
            iconVariant: 'stars',
            itemCount: 5,
            itemSize: 20,
            spacing: 5,
            strokeColor: '#d97706',
            fillColor: 'transparent',
            strokeWidth: 1.2,
            showLabel: true,
            label: 'Meu Dia',
            labelPosition: 'left'
        }
    },
    {
        id: 'mood_hearts_5',
        title: 'Corações de Vitalidade (1 a 5)',
        description: '5 corações para medir sua energia ou ânimo no dia.',
        category: 'mood',
        defaultW: 40,
        defaultH: 6.5,
        config: {
            trackerType: 'mood',
            iconVariant: 'hearts',
            itemCount: 5,
            itemSize: 20,
            spacing: 5,
            strokeColor: '#e11d48',
            fillColor: 'transparent',
            strokeWidth: 1.2,
            showLabel: true,
            label: 'Energia',
            labelPosition: 'left'
        }
    },

    // --- 3. CLIMA & PREVISÃO ---
    {
        id: 'weather_5',
        title: 'Clima do Dia (5 Ícones de Tempo)',
        description: 'Sol, Parcialmente Nublado, Nublado, Chuva e Tempestade.',
        category: 'weather',
        defaultW: 44,
        defaultH: 6.5,
        badge: 'Essencial',
        config: {
            trackerType: 'weather',
            iconVariant: 'weather_5',
            itemCount: 5,
            itemSize: 20,
            spacing: 6,
            strokeColor: '#f59e0b',
            fillColor: 'transparent',
            strokeWidth: 1.2,
            showLabel: true,
            label: 'Clima',
            labelPosition: 'left'
        }
    },
    {
        id: 'weather_simple',
        title: 'Previsão do Tempo (Sol & Chuva)',
        description: 'Ícones essenciais de clima do dia para marcar o tempo.',
        category: 'weather',
        defaultW: 38,
        defaultH: 6.5,
        config: {
            trackerType: 'weather',
            iconVariant: 'weather_5',
            itemCount: 3,
            itemSize: 20,
            spacing: 6,
            strokeColor: '#f59e0b',
            fillColor: 'transparent',
            strokeWidth: 1.2,
            showLabel: true,
            label: 'Tempo',
            labelPosition: 'left'
        }
    },

    // --- 4. REFEIÇÕES ---
    {
        id: 'meals_4',
        title: 'Controle de Refeições (Café, Almoço, Jantar, Lanches)',
        description: 'Ícones de xícara, talheres, jantar noturno e fruta com letras C, A, J, L.',
        category: 'meals',
        defaultW: 46,
        defaultH: 7.2,
        config: {
            trackerType: 'meals',
            iconVariant: 'meals_4',
            itemCount: 4,
            itemSize: 19,
            spacing: 6,
            strokeColor: '#059669',
            fillColor: 'transparent',
            strokeWidth: 1.2,
            showLabel: true,
            label: 'Refeições',
            labelPosition: 'left',
            showItemLabels: true
        }
    },

    // --- 5. SONO & DISPOSIÇÃO ---
    {
        id: 'sleep_hours_5',
        title: 'Horas de Sono com Lua (5h a 9h+)',
        description: 'Lua e círculos vazados com marcações de horas para pintar.',
        category: 'sleep',
        defaultW: 44,
        defaultH: 6.5,
        config: {
            trackerType: 'sleep',
            iconVariant: 'sleep_hours',
            itemCount: 5,
            itemSize: 19,
            spacing: 4,
            strokeColor: '#4f46e5',
            fillColor: 'transparent',
            strokeWidth: 1.2,
            showLabel: true,
            label: 'Sono',
            labelPosition: 'left'
        }
    },
    {
        id: 'sleep_battery_5',
        title: 'Bateria de Disposição (20% a 100%)',
        description: 'Baterias horizontais com porcentagens de nível de energia.',
        category: 'sleep',
        defaultW: 48,
        defaultH: 6.5,
        config: {
            trackerType: 'sleep',
            iconVariant: 'battery',
            itemCount: 5,
            itemSize: 18,
            spacing: 5,
            strokeColor: '#0d9488',
            fillColor: 'transparent',
            strokeWidth: 1.2,
            showLabel: true,
            label: 'Disposição',
            labelPosition: 'left'
        }
    },

    // --- 6. SAÚDE, GRATIDÃO & TREINO ---
    {
        id: 'meds_pills_4',
        title: 'Medicamentos & Vitaminas (4 Doses)',
        description: 'Pílulas e comprimidos vazados para controle de suplementação.',
        category: 'wellness',
        defaultW: 40,
        defaultH: 6.5,
        config: {
            trackerType: 'meds',
            iconVariant: 'pills',
            itemCount: 4,
            itemSize: 20,
            spacing: 6,
            strokeColor: '#7c3aed',
            fillColor: 'transparent',
            strokeWidth: 1.2,
            showLabel: true,
            label: 'Vitaminas',
            labelPosition: 'left'
        }
    },
    {
        id: 'gratitude_line',
        title: 'Linha de Gratidão do Dia',
        description: 'Coração e linha pontilhada elegante: "Hoje sou grata(o) por: _________".',
        category: 'wellness',
        defaultW: 75,
        defaultH: 6.0,
        config: {
            trackerType: 'gratitude',
            iconVariant: 'gratitude_line',
            itemCount: 1,
            itemSize: 18,
            spacing: 6,
            strokeColor: '#6b7280',
            fillColor: 'transparent',
            strokeWidth: 1.2,
            showLabel: true,
            label: 'Hoje sou grata por:',
            labelPosition: 'left',
            lineStyle: 'dashed'
        }
    },
    {
        id: 'fitness_4',
        title: 'Atividade Física & Treino',
        description: 'Ícones de passos/caminhada, musculação, queima e cardio.',
        category: 'wellness',
        defaultW: 44,
        defaultH: 6.5,
        config: {
            trackerType: 'fitness',
            iconVariant: 'fitness_4',
            itemCount: 4,
            itemSize: 20,
            spacing: 6,
            strokeColor: '#ea580c',
            fillColor: 'transparent',
            strokeWidth: 1.2,
            showLabel: true,
            label: 'Treino',
            labelPosition: 'left'
        }
    }
];

const COLOR_PALETTES = [
    { id: 'original', name: 'Original', stroke: null },
    { id: 'noir', name: 'Grafite Editorial', stroke: '#1f2937' },
    { id: 'blue', name: 'Azul Sereno', stroke: '#2563eb' },
    { id: 'rose', name: 'Rosa Delicado', stroke: '#e11d48' },
    { id: 'lavender', name: 'Lavanda Nobre', stroke: '#7c3aed' },
    { id: 'sage', name: 'Verde Sálvia', stroke: '#059669' },
    { id: 'terracotta', name: 'Terracota Quente', stroke: '#c2410c' },
    { id: 'gold', name: 'Ouro Real', stroke: '#b45309' }
];

interface FooterTrackerGalleryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectPreset: (
        preset: FooterTrackerPreset,
        options: {
            colorOverride?: string;
            alignment: 'center' | 'left' | 'right';
            showBox: boolean;
            showLabel: boolean;
        }
    ) => void;
}

export const FooterTrackerGalleryModal: React.FC<FooterTrackerGalleryModalProps> = ({
    isOpen,
    onClose,
    onSelectPreset
}) => {
    const [selectedCategory, setSelectedCategory] = useState<'all' | 'water' | 'weather' | 'mood' | 'meals' | 'sleep' | 'wellness' | 'composite'>('all');
    const [selectedPalette, setSelectedPalette] = useState<string>('original');
    const [alignment, setAlignment] = useState<'center' | 'left' | 'right'>('center');
    const [showBox, setShowBox] = useState<boolean>(false);
    const [showLabel, setShowLabel] = useState<boolean>(true);
    const [hoveredPresetId, setHoveredPresetId] = useState<string | null>(null);

    if (!isOpen) return null;

    const filteredPresets = FOOTER_TRACKER_PRESETS.filter(p => {
        if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
        return true;
    });

    const activeColor = COLOR_PALETTES.find(c => c.id === selectedPalette)?.stroke;

    const handleApply = (preset: FooterTrackerPreset) => {
        onSelectPreset(preset, {
            colorOverride: activeColor || undefined,
            alignment,
            showBox,
            showLabel
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 select-none">
            <div 
                className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-indigo-50/50 via-white to-pink-50/50 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-100">
                            <Layers className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-base font-bold text-gray-900">Elemento Rodapé da Agenda</h3>
                                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                                    Modelos & Opções
                                </span>
                            </div>
                            <p className="text-xs text-gray-500">
                                Escolha o modelo de rodapé desejado: Copos de Água, Clima, Humor do Dia, Refeições, Sono e Hábitos.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                        title="Fechar"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Subheader Toolbar: Categories, Color Palette & Settings */}
                <div className="px-6 py-3 border-b border-gray-100 bg-gray-50/60 flex flex-wrap items-center justify-between gap-3 shrink-0">
                    {/* Category tabs */}
                    <div className="flex items-center gap-1 overflow-x-auto py-0.5">
                        <button
                            onClick={() => setSelectedCategory('all')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                selectedCategory === 'all'
                                    ? 'bg-indigo-600 text-white shadow-xs'
                                    : 'text-gray-600 hover:bg-gray-200/70'
                            }`}
                        >
                            Todos ({FOOTER_TRACKER_PRESETS.length})
                        </button>
                        <button
                            onClick={() => setSelectedCategory('water')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                                selectedCategory === 'water'
                                    ? 'bg-indigo-600 text-white shadow-xs'
                                    : 'text-gray-600 hover:bg-gray-200/70'
                            }`}
                        >
                            <Droplets className="w-3.5 h-3.5 text-blue-500" />
                            Água
                        </button>
                        <button
                            onClick={() => setSelectedCategory('weather')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                                selectedCategory === 'weather'
                                    ? 'bg-indigo-600 text-white shadow-xs'
                                    : 'text-gray-600 hover:bg-gray-200/70'
                            }`}
                        >
                            <Sun className="w-3.5 h-3.5 text-amber-500" />
                            Clima
                        </button>
                        <button
                            onClick={() => setSelectedCategory('mood')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                                selectedCategory === 'mood'
                                    ? 'bg-indigo-600 text-white shadow-xs'
                                    : 'text-gray-600 hover:bg-gray-200/70'
                            }`}
                        >
                            <Smile className="w-3.5 h-3.5 text-pink-500" />
                            Humor
                        </button>
                        <button
                            onClick={() => setSelectedCategory('meals')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                                selectedCategory === 'meals'
                                    ? 'bg-indigo-600 text-white shadow-xs'
                                    : 'text-gray-600 hover:bg-gray-200/70'
                            }`}
                        >
                            <Utensils className="w-3.5 h-3.5 text-emerald-500" />
                            Refeições
                        </button>
                        <button
                            onClick={() => setSelectedCategory('sleep')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                                selectedCategory === 'sleep'
                                    ? 'bg-indigo-600 text-white shadow-xs'
                                    : 'text-gray-600 hover:bg-gray-200/70'
                            }`}
                        >
                            <Moon className="w-3.5 h-3.5 text-indigo-400" />
                            Sono
                        </button>
                        <button
                            onClick={() => setSelectedCategory('wellness')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                                selectedCategory === 'wellness'
                                    ? 'bg-indigo-600 text-white shadow-xs'
                                    : 'text-gray-600 hover:bg-gray-200/70'
                            }`}
                        >
                            <Heart className="w-3.5 h-3.5 text-rose-500" />
                            Bem-Estar
                        </button>
                    </div>

                    {/* Quick alignment & box toggles */}
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 text-xs text-gray-500 font-medium">
                            <span className="text-[11px] text-gray-400">Posição:</span>
                            <div className="flex border border-gray-200 rounded-lg p-0.5 bg-white shadow-2xs">
                                <button
                                    onClick={() => setAlignment('left')}
                                    className={`p-1 rounded ${alignment === 'left' ? 'bg-indigo-50 text-indigo-600 font-bold' : 'text-gray-400 hover:text-gray-600'}`}
                                    title="Rodapé à Esquerda"
                                >
                                    <AlignHorizontalJustifyStart className="w-3.5 h-3.5" />
                                </button>
                                <button
                                    onClick={() => setAlignment('center')}
                                    className={`p-1 rounded ${alignment === 'center' ? 'bg-indigo-50 text-indigo-600 font-bold' : 'text-gray-400 hover:text-gray-600'}`}
                                    title="Rodapé Centralizado"
                                >
                                    <AlignHorizontalJustifyCenter className="w-3.5 h-3.5" />
                                </button>
                                <button
                                    onClick={() => setAlignment('right')}
                                    className={`p-1 rounded ${alignment === 'right' ? 'bg-indigo-50 text-indigo-600 font-bold' : 'text-gray-400 hover:text-gray-600'}`}
                                    title="Rodapé à Direita"
                                >
                                    <AlignHorizontalJustifyEnd className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>

                        {/* Box toggle */}
                        <button
                            onClick={() => setShowBox(!showBox)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-colors ${
                                showBox
                                    ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                            <Layers className="w-3.5 h-3.5" />
                            Caixinha de Fundo
                        </button>

                        {/* Label toggle */}
                        <button
                            onClick={() => setShowLabel(!showLabel)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-colors ${
                                showLabel
                                    ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                            Texto do Título
                        </button>
                    </div>
                </div>

                {/* Color Palette Selector Bar */}
                <div className="px-6 py-2 border-b border-gray-100 bg-white flex items-center gap-3 overflow-x-auto shrink-0">
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1 shrink-0">
                        <Palette className="w-3.5 h-3.5" />
                        Paleta de Cores:
                    </span>
                    <div className="flex items-center gap-1.5">
                        {COLOR_PALETTES.map(palette => {
                            const isSelected = selectedPalette === palette.id;
                            return (
                                <button
                                    key={palette.id}
                                    onClick={() => setSelectedPalette(palette.id)}
                                    className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all border ${
                                        isSelected
                                            ? 'border-indigo-600 bg-indigo-50 text-indigo-900 font-bold shadow-2xs'
                                            : 'border-gray-200 bg-gray-50/50 text-gray-600 hover:bg-gray-100'
                                    }`}
                                >
                                    {palette.stroke && (
                                        <span
                                            className="w-2.5 h-2.5 rounded-full shrink-0"
                                            style={{ backgroundColor: palette.stroke }}
                                        />
                                    )}
                                    <span>{palette.name}</span>
                                    {isSelected && <Check className="w-3 h-3 text-indigo-600 ml-0.5" />}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Presets Grid */}
                <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredPresets.map(preset => {
                            const isHovered = hoveredPresetId === preset.id;
                            const effectiveStroke = activeColor || preset.config.strokeColor || '#374151';

                            // Dummy element for live rendering preview
                            const previewElement: any = {
                                id: `preview_${preset.id}`,
                                type: 'footer_tracker',
                                x: 0,
                                y: 0,
                                w: 100,
                                h: 100,
                                zIndex: 1,
                                style: {
                                    fontFamily: 'Inter',
                                    fontSize: 10,
                                    fontWeight: '600',
                                    color: effectiveStroke,
                                    footerTracker: {
                                        ...preset.config,
                                        strokeColor: effectiveStroke,
                                        showBox,
                                        boxBackgroundColor: showBox ? '#ffffff' : 'transparent',
                                        boxBorderColor: showBox ? '#e2e8f0' : 'transparent',
                                        boxBorderWidth: 1,
                                        boxBorderRadius: 6,
                                        boxPadding: 4,
                                        showLabel
                                    }
                                }
                            };

                            return (
                                <div
                                    key={preset.id}
                                    onMouseEnter={() => setHoveredPresetId(preset.id)}
                                    onMouseLeave={() => setHoveredPresetId(null)}
                                    onClick={() => handleApply(preset)}
                                    className={`group relative rounded-xl border p-4 bg-white transition-all cursor-pointer flex flex-col justify-between hover:shadow-md hover:border-indigo-300 hover:-translate-y-0.5 ${
                                        isHovered ? 'border-indigo-400 ring-2 ring-indigo-500/10' : 'border-gray-200'
                                    }`}
                                >
                                    {/* Top Bar: Title & Badge */}
                                    <div className="flex items-start justify-between gap-2 mb-2">
                                        <div>
                                            <h4 className="text-xs font-bold text-gray-800 group-hover:text-indigo-600 transition-colors">
                                                {preset.title}
                                            </h4>
                                            <p className="text-[11px] text-gray-500 line-clamp-1 mt-0.5">
                                                {preset.description}
                                            </p>
                                        </div>
                                        {preset.badge && (
                                            <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 shrink-0">
                                                {preset.badge}
                                            </span>
                                        )}
                                    </div>

                                    {/* Live SVG Preview Box */}
                                    <div className="h-16 w-full rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center p-2 mb-3 overflow-hidden group-hover:bg-indigo-50/20 group-hover:border-indigo-100 transition-colors">
                                        <div className="w-full flex items-center justify-center pointer-events-none">
                                            <FooterTrackerElement
                                                element={previewElement}
                                                style={previewElement.style}
                                                dayData={{} as any}
                                                isEditor={false}
                                                pageHeight={400}
                                                pageWidth={400}
                                            />
                                        </div>
                                    </div>

                                    {/* Footer Info & Action Button */}
                                    <div className="flex items-center justify-between text-[11px] text-gray-400 pt-2 border-t border-gray-100">
                                        <span className="flex items-center gap-1 font-mono text-[10px]">
                                            <Sparkles className="w-3 h-3 text-indigo-500" />
                                            {preset.config.itemCount} {preset.config.trackerType === 'water' ? 'copos' : preset.config.trackerType === 'mood' ? 'carinhas' : 'itens'}
                                        </span>
                                        <span className="text-indigo-600 font-bold text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                                            + Inserir no Rodapé
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Footer action notes */}
                <div className="px-6 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between text-xs text-gray-500 shrink-0">
                    <span>
                        💡 <strong>Dica:</strong> Ao adicionar, o elemento é posicionado automaticamente no rodapé da página atual e pode ser editado livremente nas propriedades.
                    </span>
                    <button
                        onClick={onClose}
                        className="px-4 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-100 font-medium text-gray-700 transition-colors"
                    >
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );
};
