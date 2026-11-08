import React, { useState, useEffect } from 'react';
import { Palette, Plus, Check } from 'lucide-react';
import {
  FavoriteColor,
  getFavoriteColors,
  addFavoriteColor,
  EVENT_FAVORITE_COLORS_UPDATED,
} from '../../../core/logic/colorPaletteStorage';

interface FavoriteColorSwatchesProps {
  currentColor?: string;
  onSelectColor: (hex: string) => void;
  onOpenFullModal?: () => void;
  label?: string;
  className?: string;
  compact?: boolean;
}

export const FavoriteColorSwatches: React.FC<FavoriteColorSwatchesProps> = ({
  currentColor,
  onSelectColor,
  onOpenFullModal,
  label = 'Cores Preferidas',
  className = '',
  compact = false,
}) => {
  const [colors, setColors] = useState<FavoriteColor[]>([]);

  useEffect(() => {
    setColors(getFavoriteColors());

    const handleUpdated = (e: any) => {
      if (e.detail) {
        setColors(e.detail);
      } else {
        setColors(getFavoriteColors());
      }
    };

    window.addEventListener(EVENT_FAVORITE_COLORS_UPDATED, handleUpdated);
    return () => {
      window.removeEventListener(EVENT_FAVORITE_COLORS_UPDATED, handleUpdated);
    };
  }, []);

  const handleAddCurrentColor = () => {
    if (!currentColor || currentColor === 'transparent' || currentColor === 'none') return;
    const updated = addFavoriteColor(currentColor);
    setColors(updated);
  };

  const isCurrentInFavorites = currentColor
    ? colors.some(c => c.hex.toLowerCase() === currentColor.toLowerCase())
    : false;

  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-1">
          <Palette className="w-3 h-3 text-[#b84a56]" />
          <span>{label}</span>
        </label>
        <div className="flex items-center gap-1.5">
          {currentColor && !isCurrentInFavorites && currentColor !== 'transparent' && (
            <button
              type="button"
              onClick={handleAddCurrentColor}
              className="text-[9px] font-bold text-[#b84a56] hover:text-[#9f3d4a] hover:bg-rose-50 px-1.5 py-0.5 rounded transition-colors flex items-center gap-0.5 cursor-pointer"
              title={`Salvar a cor atual (${currentColor}) no computador como preferida`}
            >
              <Plus className="w-2.5 h-2.5" />
              <span>Salvar esta cor</span>
            </button>
          )}
          {onOpenFullModal && (
            <button
              type="button"
              onClick={onOpenFullModal}
              className="text-[9px] font-bold text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer"
              title="Gerenciar, exportar ou importar paleta completa do computador"
            >
              Gerenciar
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 flex-wrap">
        {colors.slice(0, compact ? 10 : 16).map(c => {
          const isSelected = currentColor && currentColor.toLowerCase() === c.hex.toLowerCase();
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => onSelectColor(c.hex)}
              className={`relative rounded-md transition-all cursor-pointer border shadow-2xs hover:scale-110 ${
                compact ? 'w-5 h-5' : 'w-6 h-6'
              } ${
                isSelected
                  ? 'border-indigo-600 ring-2 ring-indigo-400 scale-105 z-10'
                  : 'border-black/10 hover:border-gray-400'
              }`}
              style={{ backgroundColor: c.hex }}
              title={`${c.name} (${c.hex.toUpperCase()})`}
            >
              {isSelected && (
                <span className="absolute inset-0 flex items-center justify-center">
                  <Check
                    className={`w-3 h-3 ${
                      c.hex.toLowerCase() === '#ffffff' || c.hex.toLowerCase() === '#fff'
                        ? 'text-gray-900'
                        : 'text-white drop-shadow-xs'
                    }`}
                  />
                </span>
              )}
            </button>
          );
        })}

        {onOpenFullModal && (
          <button
            type="button"
            onClick={onOpenFullModal}
            className={`flex items-center justify-center rounded-md border border-dashed border-gray-300 text-gray-400 hover:text-[#b84a56] hover:border-[#b84a56] hover:bg-rose-50/50 transition-colors cursor-pointer ${
              compact ? 'w-5 h-5' : 'w-6 h-6'
            }`}
            title="Abrir gerenciador de cores preferidas"
          >
            <Plus className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
};
