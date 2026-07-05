import React, { useRef, useState } from 'react';
import { BackgroundConfig } from '../../../types';
import { Palmtree, Trash2, Upload, Minus, Palette, Layers, Eye, EyeOff, AlertTriangle, X } from 'lucide-react';
import { compressImage } from '../utils/imageCompressor';

interface BackgroundSettingsProps {
    config: BackgroundConfig | undefined;
    onChange: (updates: Partial<BackgroundConfig>) => void;
}

export const BackgroundSettings: React.FC<BackgroundSettingsProps> = ({ config, onChange }) => {
    const defaultBg: BackgroundConfig = {
        type: 'none',
        opacity: 1,
        showOnIntroPages: true,
        showOnDailyPages: true
    };

    const current = config || defaultBg;
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [showWarning, setShowWarning] = useState(false);
    const [dontShowAgain, setDontShowAgain] = useState(false);

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

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const dataUrl = await compressImage(file);
            if (!dataUrl) return;
            
            onChange({ 
                type: 'image', 
                image: { 
                    url: dataUrl, 
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
            <div className="space-y-3">
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Tipo de Fundo</label>
                <div className="grid grid-cols-2 gap-2">
                    <button 
                        onClick={() => onChange({ type: 'none' })}
                        className={`flex flex-col items-center justify-center p-2 rounded-lg border text-[10px] font-medium transition-all ${current.type === 'none' ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-sm' : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'}`}
                    >
                        <Minus className="w-4 h-4 mb-1" />
                        Nenhum
                    </button>
                    <button 
                        onClick={() => onChange({ type: 'solid', color: current.color || '#ffffff' })}
                        className={`flex flex-col items-center justify-center p-2 rounded-lg border text-[10px] font-medium transition-all ${current.type === 'solid' ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-sm' : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'}`}
                    >
                        <Palette className="w-4 h-4 mb-1" />
                        Cor Sólida
                    </button>
                    <button 
                        onClick={() => onChange({ 
                            type: 'gradient', 
                            gradient: current.gradient || { type: 'linear', colors: ['#ffffff', '#f3f4f6'], direction: 180 } 
                        })}
                        className={`flex flex-col items-center justify-center p-2 rounded-lg border text-[10px] font-medium transition-all ${current.type === 'gradient' ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-sm' : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'}`}
                    >
                        <Layers className="w-4 h-4 mb-1" />
                        Gradiente
                    </button>
                    <button 
                        onClick={triggerImageUpload}
                        className={`flex flex-col items-center justify-center p-2 rounded-lg border text-[10px] font-medium transition-all ${current.type === 'image' ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-sm' : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'}`}
                    >
                        <Upload className="w-4 h-4 mb-1" />
                        Imagem
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
                            onChange={(e) => onChange({ color: e.target.value })} 
                            className="w-12 h-full p-0 border-0 cursor-pointer" 
                        />
                        <input 
                            type="text" 
                            value={current.color || '#ffffff'} 
                            onChange={(e) => onChange({ color: e.target.value })} 
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
                                onChange={(e) => onChange({ gradient: { ...current.gradient!, type: e.target.value as any } })}
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
                                    onChange={(e) => onChange({ gradient: { ...current.gradient!, direction: parseInt(e.target.value) || 0 } })}
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
                                    onChange={(e) => onChange({ gradient: { ...current.gradient!, colors: [e.target.value, current.gradient!.colors[1]] } })} 
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
                                    onChange={(e) => onChange({ gradient: { ...current.gradient!, colors: [current.gradient!.colors[0], e.target.value] } })} 
                                    className="w-full h-full p-0 border-0 cursor-pointer" 
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {current.type === 'image' && current.image && (
                <div className="space-y-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="relative group aspect-[3/4] max-h-48 overflow-hidden rounded-md border border-gray-200 bg-gray-100">
                        <img 
                            src={current.image.url} 
                            alt="Background" 
                            className="w-full h-full object-contain"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <button 
                                onClick={triggerImageUpload}
                                className="p-2 bg-white rounded-full hover:bg-gray-100 text-gray-700 shadow-lg"
                                title="Alterar Imagem"
                            >
                                <Upload className="w-5 h-5" />
                            </button>
                            <button 
                                onClick={() => onChange({ type: 'none' })}
                                className="p-2 bg-red-500 rounded-full hover:bg-red-600 text-white shadow-lg"
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
                            onChange={(e) => onChange({ image: { ...current.image!, fit: e.target.value as any } })}
                            className="w-full text-xs p-2 border border-gray-200 rounded-md bg-white"
                        >
                            <option value="cover">Cobrir Totalmente (Crop)</option>
                            <option value="contain">Conter Inteira (Bordas)</option>
                            <option value="fill">Esticar para Preencher</option>
                        </select>
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
                    onChange={(e) => onChange({ opacity: parseFloat(e.target.value) })} 
                    className="w-full" 
                />
            </div>

            <div className="space-y-3 pt-3 border-t border-gray-100">
                <label className="block text-[10px] font-bold text-gray-500 uppercase">Visibilidade</label>
                <div className="space-y-2">
                    <button 
                        onClick={() => onChange({ showOnIntroPages: !current.showOnIntroPages })}
                        className={`w-full flex items-center justify-between p-2 rounded-md border text-[10px] font-medium transition-all ${current.showOnIntroPages ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-gray-100 text-gray-400'}`}
                    >
                        <span className="flex items-center">
                            {current.showOnIntroPages ? <Eye className="w-3.5 h-3.5 mr-2" /> : <EyeOff className="w-3.5 h-3.5 mr-2" />}
                            Exibir em Páginas Iniciais
                        </span>
                        <div className={`w-2 h-2 rounded-full ${current.showOnIntroPages ? 'bg-indigo-500' : 'bg-gray-300'}`} />
                    </button>
                    <button 
                        onClick={() => onChange({ showOnDailyPages: !current.showOnDailyPages })}
                        className={`w-full flex items-center justify-between p-2 rounded-md border text-[10px] font-medium transition-all ${current.showOnDailyPages ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-gray-100 text-gray-400'}`}
                    >
                        <span className="flex items-center">
                            {current.showOnDailyPages ? <Eye className="w-3.5 h-3.5 mr-2" /> : <EyeOff className="w-3.5 h-3.5 mr-2" />}
                            Exibir em Páginas Diárias/Miolo
                        </span>
                        <div className={`w-2 h-2 rounded-full ${current.showOnDailyPages ? 'bg-indigo-500' : 'bg-gray-300'}`} />
                    </button>
                </div>
            </div>

            <div className="space-y-3 pt-3 border-t border-gray-100">
                <label className="block text-[10px] font-bold text-gray-500 uppercase">Páginas Específicas (Opcional)</label>
                <div className="space-y-1">
                    <input 
                        type="text"
                        placeholder="Ex: 1, 3, 5-10"
                        value={current.customPages || ''}
                        onChange={(e) => onChange({ customPages: e.target.value })}
                        className="w-full text-xs p-2.5 border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
                    />
                    <p className="text-[9px] text-gray-400 italic px-1">Se preenchido, ignora as opções acima e exibe apenas nestas páginas.</p>
                </div>
            </div>

            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageUpload} 
                accept="image/*" 
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
                                Para garantir que o sistema funcione com rapidez e para evitar erros de salvamento, siga as recomendações abaixo:
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
        </div>
    );
};
