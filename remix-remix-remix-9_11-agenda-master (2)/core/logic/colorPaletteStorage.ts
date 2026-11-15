import { localStorage } from '../../services/safeStorage';
import { AgendaConfig, LayoutElement } from '../../types';

export interface FavoriteColor {
  id: string;
  hex: string;
  name: string;
  createdAt?: number;
}

export const STORAGE_KEY_FAVORITE_COLORS = 'agendamaster_favorite_colors_palette';
export const EVENT_FAVORITE_COLORS_UPDATED = 'agenda_favorite_colors_updated';

export const DEFAULT_FAVORITE_COLORS: FavoriteColor[] = [
  { id: 'fav_marsala', hex: '#b84a56', name: 'Marsala Elegante' },
  { id: 'fav_rose_pastel', hex: '#f472b6', name: 'Rosa Pastel' },
  { id: 'fav_dourado', hex: '#b38728', name: 'Dourado Clássico' },
  { id: 'fav_terracota', hex: '#c25e4a', name: 'Terracota Quente' },
  { id: 'fav_salvia', hex: '#5a7d68', name: 'Verde Sálvia' },
  { id: 'fav_azul', hex: '#3b5a7a', name: 'Azul Sereno' },
  { id: 'fav_lavanda', hex: '#8a6b9c', name: 'Lavanda Nobre' },
  { id: 'fav_chumbo', hex: '#1f2937', name: 'Grafite Escuro' },
  { id: 'fav_cinza_medio', hex: '#6b7280', name: 'Cinza Neutro' },
  { id: 'fav_nude', hex: '#e8ded4', name: 'Bege Nude' },
  { id: 'fav_preto', hex: '#000000', name: 'Preto Puro' },
  { id: 'fav_branco', hex: '#ffffff', name: 'Branco Puro' },
];

/**
 * Normaliza uma string hexadecimal para o formato padrão #rrggbb minúsculo
 */
export function normalizeHexColor(raw: string): string {
  if (!raw) return '#000000';
  let hex = raw.trim();
  if (!hex.startsWith('#')) {
    hex = '#' + hex;
  }
  // Se for #rgb de 3 dígitos, expande para #rrggbb
  if (/^#[0-9a-fA-F]{3}$/.test(hex)) {
    hex = '#' + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
  }
  if (!/^#[0-9a-fA-F]{6}$/i.test(hex)) {
    // Retorna fallback se inválido
    return raw;
  }
  return hex.toLowerCase();
}

/**
 * Carrega a lista de cores preferidas salvas no computador (localStorage)
 */
export function getFavoriteColors(): FavoriteColor[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_FAVORITE_COLORS);
    if (!raw) {
      // Inicializa com as cores padrão elegantes
      saveFavoriteColors(DEFAULT_FAVORITE_COLORS, false);
      return DEFAULT_FAVORITE_COLORS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.map((item: any, idx: number) => ({
        id: item.id || `fav_${Date.now()}_${idx}`,
        hex: normalizeHexColor(item.hex || '#000000'),
        name: (item.name && typeof item.name === 'string') ? item.name.trim() : `Cor ${normalizeHexColor(item.hex || '#000000').toUpperCase()}`,
        createdAt: item.createdAt || Date.now(),
      }));
    }
    return DEFAULT_FAVORITE_COLORS;
  } catch (err) {
    console.warn('[colorPaletteStorage] Erro ao carregar cores do localStorage:', err);
    return DEFAULT_FAVORITE_COLORS;
  }
}

/**
 * Salva a lista de cores no computador (localStorage) e dispara evento de sincronização
 */
export function saveFavoriteColors(colors: FavoriteColor[], emitEvent: boolean = true): void {
  try {
    localStorage.setItem(STORAGE_KEY_FAVORITE_COLORS, JSON.stringify(colors));
    if (emitEvent && typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(EVENT_FAVORITE_COLORS_UPDATED, { detail: colors }));
    }
  } catch (err) {
    console.error('[colorPaletteStorage] Erro ao salvar cores no localStorage:', err);
  }
}

/**
 * Adiciona uma nova cor às cores preferidas
 */
export function addFavoriteColor(hex: string, name?: string): FavoriteColor[] {
  const normHex = normalizeHexColor(hex);
  const current = getFavoriteColors();
  
  // Se a cor já existe, apenas atualiza o nome se fornecido
  const existingIdx = current.findIndex(c => c.hex.toLowerCase() === normHex.toLowerCase());
  if (existingIdx >= 0) {
    if (name && name.trim()) {
      current[existingIdx].name = name.trim();
      saveFavoriteColors(current);
    }
    return current;
  }

  const newColor: FavoriteColor = {
    id: `fav_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    hex: normHex,
    name: name && name.trim() ? name.trim() : `Cor ${normHex.toUpperCase()}`,
    createdAt: Date.now(),
  };

  const updated = [newColor, ...current];
  saveFavoriteColors(updated);
  return updated;
}

/**
 * Remove uma cor da lista de cores preferidas
 */
export function removeFavoriteColor(id: string): FavoriteColor[] {
  const current = getFavoriteColors();
  const updated = current.filter(c => c.id !== id);
  saveFavoriteColors(updated);
  return updated;
}

/**
 * Atualiza propriedades de uma cor (ex: nome ou hex)
 */
export function updateFavoriteColor(id: string, updates: Partial<FavoriteColor>): FavoriteColor[] {
  const current = getFavoriteColors();
  const updated = current.map(c => {
    if (c.id === id) {
      return {
        ...c,
        ...updates,
        hex: updates.hex ? normalizeHexColor(updates.hex) : c.hex,
        name: updates.name ? updates.name.trim() : c.name,
      };
    }
    return c;
  });
  saveFavoriteColors(updated);
  return updated;
}

/**
 * Restaura as cores padrão
 */
export function resetFavoriteColorsToDefault(): FavoriteColor[] {
  saveFavoriteColors(DEFAULT_FAVORITE_COLORS);
  return DEFAULT_FAVORITE_COLORS;
}

/**
 * Exporta a paleta de cores para um arquivo físico .json baixado no computador
 */
export function exportFavoriteColorsToFile(colors?: FavoriteColor[], filename?: string): void {
  const list = colors || getFavoriteColors();
  const payload = {
    app: 'AgendaMaster',
    type: 'agendamaster_favorite_colors_palette',
    version: '1.0',
    exportedAt: new Date().toISOString(),
    totalColors: list.length,
    colors: list,
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const safeFilename = filename || `minha_paleta_cores_agendamaster_${new Date().toISOString().slice(0, 10)}.json`;
  a.href = url;
  a.download = safeFilename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

/**
 * Lê e importa um arquivo .json salvo no computador contendo uma paleta de cores
 */
export async function importFavoriteColorsFromFile(
  file: File,
  mode: 'merge' | 'replace' = 'merge'
): Promise<{ success: boolean; colors: FavoriteColor[]; count: number; error?: string }> {
  try {
    const text = await file.text();
    const json = JSON.parse(text);

    let rawList: any[] = [];
    if (Array.isArray(json)) {
      rawList = json;
    } else if (json && Array.isArray(json.colors)) {
      rawList = json.colors;
    } else {
      return {
        success: false,
        colors: getFavoriteColors(),
        count: 0,
        error: 'Formato de arquivo inválido. O arquivo .json deve conter uma lista de cores.',
      };
    }

    const imported: FavoriteColor[] = [];
    for (const item of rawList) {
      let hex = '';
      let name = '';
      if (typeof item === 'string') {
        hex = normalizeHexColor(item);
        name = `Cor ${hex.toUpperCase()}`;
      } else if (item && typeof item === 'object') {
        hex = normalizeHexColor(item.hex || item.color || item.value || '');
        name = item.name ? String(item.name).trim() : `Cor ${hex.toUpperCase()}`;
      }

      if (/^#[0-9a-fA-F]{6}$/i.test(hex)) {
        imported.push({
          id: `fav_imp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          hex,
          name,
          createdAt: Date.now(),
        });
      }
    }

    if (imported.length === 0) {
      return {
        success: false,
        colors: getFavoriteColors(),
        count: 0,
        error: 'Nenhuma cor válida (#RRGGBB) foi encontrada no arquivo importado.',
      };
    }

    let resultList: FavoriteColor[] = [];
    if (mode === 'replace') {
      resultList = imported;
    } else {
      // Merge evitando duplicatas pelo código hexadecimal
      const current = getFavoriteColors();
      const existingHexes = new Set(current.map(c => c.hex.toLowerCase()));
      const filteredNew = imported.filter(c => !existingHexes.has(c.hex.toLowerCase()));
      resultList = [...filteredNew, ...current];
    }

    saveFavoriteColors(resultList);
    return {
      success: true,
      colors: resultList,
      count: imported.length,
    };
  } catch (err: any) {
    return {
      success: false,
      colors: getFavoriteColors(),
      count: 0,
      error: `Falha ao processar arquivo: ${err.message || 'Erro de formatação JSON'}`,
    };
  }
}

/**
 * Extrai todas as cores hexadecimais únicas presentes no projeto atual
 */
export function extractUniqueColorsFromProject(config: AgendaConfig): { hex: string; count: number }[] {
  const counts: Record<string, number> = {};

  const recordHex = (val?: string) => {
    if (!val || typeof val !== 'string') return;
    if (val === 'transparent' || val === 'none') return;
    const norm = normalizeHexColor(val);
    if (/^#[0-9a-fA-F]{6}$/i.test(norm)) {
      counts[norm] = (counts[norm] || 0) + 1;
    }
  };

  const scanElement = (el: LayoutElement) => {
    if (!el || !el.style) return;
    const s = el.style as any;
    recordHex(s.color);
    recordHex(s.backgroundColor);
    recordHex(s.borderColor);
    recordHex(s.fillColor);
    recordHex(s.strokeColor);
    recordHex(s.textStrokeColor);

    if (s.gradientColors && Array.isArray(s.gradientColors)) {
      s.gradientColors.forEach((c: string) => recordHex(c));
    }

    if (s.table) {
      recordHex(s.table.borderColor);
      recordHex(s.table.headerBg);
      recordHex(s.table.headerColor);
      recordHex(s.table.gridColor);
    }
    if (s.fullCalendar) {
      recordHex(s.fullCalendar.title?.color);
      recordHex(s.fullCalendar.days?.color);
      recordHex(s.fullCalendar.weekDays?.color);
      recordHex(s.fullCalendar.primaryColor);
      recordHex(s.fullCalendar.borderColor);
    }
    if (s.footerTracker) {
      recordHex(s.footerTracker.boxBorderColor);
      recordHex(s.footerTracker.color);
      recordHex(s.footerTracker.fillColor);
    }
  };

  const scanList = (list?: LayoutElement[]) => {
    if (!list) return;
    list.forEach(scanElement);
  };

  scanList(config.elements);
  scanList(config.elementsVerso);
  scanList(config.elementsSaturday);
  scanList(config.elementsSunday);
  scanList(config.elementsTop);
  scanList(config.elementsBottom);
  scanList(config.elementsWeeklyLeft);
  scanList(config.elementsWeeklyRight);
  scanList(config.elementsWeeklyVersoLeft);
  scanList(config.elementsWeeklyVersoRight);

  config.introPages?.forEach(p => scanList(p.elements));
  config.monthlyIntroPages?.forEach(p => scanList(p.elements));

  if (config.background?.color) recordHex(config.background.color);
  if (config.background?.gradient?.colors) {
    config.background.gradient.colors.forEach(recordHex);
  }
  if (config.backgrounds) {
    config.backgrounds.forEach(bg => {
      if (bg.color) recordHex(bg.color);
      if (bg.gradient?.colors) {
        bg.gradient.colors.forEach(recordHex);
      }
    });
  }

  return Object.entries(counts)
    .map(([hex, count]) => ({ hex, count }))
    .sort((a, b) => b.count - a.count);
}
