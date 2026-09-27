import {
  AgendaConfig,
  CharacterStylePreset,
  ColorStylePreset,
  LayoutElement,
  ParagraphStylePreset,
  ProjectStylesConfig,
} from '../../types';

export const DEFAULT_PROJECT_STYLES: ProjectStylesConfig = {
  colorStyles: [
    { id: 'c_primary', name: 'Cor Principal', color: '#4f46e5' },
    { id: 'c_accent', name: 'Destaque / Acento', color: '#db2777' },
    { id: 'c_text_dark', name: 'Texto Principal', color: '#1f2937' },
    { id: 'c_text_muted', name: 'Texto Secundário', color: '#6b7280' },
    { id: 'c_lines_border', name: 'Linhas e Bordas', color: '#d1d5db' },
    { id: 'c_soft_fill', name: 'Fundo Suave', color: '#eef2ff' },
  ],
  characterStyles: [
    {
      id: 'ch_heading',
      name: 'Título Principal',
      fontFamily: 'Playfair Display',
      fontSize: 22,
      fontWeight: 'bold',
      fontStyle: 'normal',
      letterSpacing: 0.5,
      textTransform: 'uppercase',
      colorStyleId: 'c_primary',
    },
    {
      id: 'ch_subheading',
      name: 'Subtítulo / Cabeçalho',
      fontFamily: 'Inter',
      fontSize: 12,
      fontWeight: 'bold',
      fontStyle: 'normal',
      letterSpacing: 1.5,
      textTransform: 'uppercase',
      colorStyleId: 'c_text_dark',
    },
    {
      id: 'ch_day_num',
      name: 'Número do Dia',
      fontFamily: 'Cinzel',
      fontSize: 32,
      fontWeight: 'bold',
      fontStyle: 'normal',
      letterSpacing: 0,
      textTransform: 'none',
      colorStyleId: 'c_primary',
    },
    {
      id: 'ch_body',
      name: 'Corpo de Texto',
      fontFamily: 'Inter',
      fontSize: 10,
      fontWeight: 'normal',
      fontStyle: 'normal',
      letterSpacing: 0,
      textTransform: 'none',
      colorStyleId: 'c_text_dark',
    },
    {
      id: 'ch_schedule',
      name: 'Horários e Rótulos',
      fontFamily: 'Fira Code',
      fontSize: 8.5,
      fontWeight: 'normal',
      fontStyle: 'normal',
      letterSpacing: 0,
      textTransform: 'none',
      colorStyleId: 'c_text_muted',
    },
  ],
  paragraphStyles: [
    {
      id: 'p_standard',
      name: 'Parágrafo Padrão',
      textAlign: 'left',
      verticalAlign: 'top',
      lineHeight: 1.4,
      textWrap: 'wrap',
      cellPadding: 4,
      columnCount: 1,
      columnGap: 24,
    },
    {
      id: 'p_centered_title',
      name: 'Título Centralizado',
      textAlign: 'center',
      verticalAlign: 'middle',
      lineHeight: 1.2,
      textWrap: 'wrap',
      cellPadding: 4,
      columnCount: 1,
      columnGap: 24,
      characterStyleId: 'ch_heading',
    },
    {
      id: 'p_justified',
      name: 'Bloco Justificado',
      textAlign: 'justify',
      verticalAlign: 'top',
      lineHeight: 1.5,
      textWrap: 'wrap',
      cellPadding: 6,
      columnCount: 1,
      columnGap: 24,
      characterStyleId: 'ch_body',
    },
    {
      id: 'p_two_cols',
      name: 'Lista em 2 Colunas',
      textAlign: 'left',
      verticalAlign: 'top',
      lineHeight: 1.35,
      textWrap: 'wrap',
      cellPadding: 4,
      columnCount: 2,
      columnGap: 24,
    },
  ],
};

export function getProjectStyles(config: AgendaConfig): ProjectStylesConfig {
  if (!config.styles) {
    return DEFAULT_PROJECT_STYLES;
  }
  return {
    colorStyles: config.styles.colorStyles || DEFAULT_PROJECT_STYLES.colorStyles,
    characterStyles: config.styles.characterStyles || DEFAULT_PROJECT_STYLES.characterStyles,
    paragraphStyles: config.styles.paragraphStyles || DEFAULT_PROJECT_STYLES.paragraphStyles,
  };
}

export function applyColorStyleToElement(
  el: LayoutElement,
  colorStyle: ColorStylePreset,
  role: 'color' | 'fill' | 'border'
): LayoutElement {
  const hex = colorStyle.color;
  const newStyle: LayoutElement['style'] = { ...el.style };

  if (role === 'color') {
    newStyle.colorStyleId = colorStyle.id;
    newStyle.color = hex;

    if (el.type === 'lines' || el.type === 'note_grid') {
      newStyle.borderColor = hex;
    }
    if (el.type === 'habit_tracker') {
      newStyle.habitColor = hex;
    }
    if (el.type === 'table' && newStyle.table) {
      newStyle.table = {
        ...newStyle.table,
        textStyle: {
          ...(newStyle.table.textStyle || {}),
          color: hex,
          colorStyleId: colorStyle.id,
        },
      };
    }
    if ((el.type === 'mini_calendar' || el.type === 'full_calendar') && newStyle.fullCalendar) {
      newStyle.fullCalendar = {
        ...newStyle.fullCalendar,
        title: { ...(newStyle.fullCalendar.title || {}), color: hex },
        weekDays: { ...(newStyle.fullCalendar.weekDays || {}), color: hex },
        days: { ...(newStyle.fullCalendar.days || {}), color: hex },
      };
    }
    if (el.type === 'planner_day_box' && newStyle.plannerDayBox) {
      newStyle.plannerDayBox = {
        ...newStyle.plannerDayBox,
        color: hex,
        headerTextColor: hex,
      };
    }
    if (el.type === 'footer_tracker' && newStyle.footerTracker) {
      newStyle.footerTracker = {
        ...newStyle.footerTracker,
        strokeColor: hex,
      };
    }
  } else if (role === 'fill') {
    newStyle.fillColorStyleId = colorStyle.id;
    newStyle.backgroundColor = hex;
    if (newStyle.backgroundType === 'gradient' && newStyle.gradientColors) {
      newStyle.gradientColors = [hex, newStyle.gradientColors[1] || hex];
    }
    if (el.type === 'habit_tracker') {
      newStyle.habitFillColor = hex;
    }
    if (el.type === 'table' && newStyle.table) {
      newStyle.table = {
        ...newStyle.table,
        zebraColor: hex,
        textStyle: {
          ...(newStyle.table.textStyle || {}),
          backgroundColor: hex,
          fillColorStyleId: colorStyle.id,
        },
      };
    }
    if ((el.type === 'mini_calendar' || el.type === 'full_calendar') && newStyle.fullCalendar) {
      newStyle.fullCalendar = {
        ...newStyle.fullCalendar,
        grid: {
          ...(newStyle.fullCalendar.grid || {
            borderColor: '#e5e7eb',
            borderWidth: 1,
            cellBackgroundColor: 'transparent',
            headerBackgroundColor: hex,
            borders: {
              top: true,
              bottom: true,
              left: true,
              right: true,
              insideHorizontal: true,
              insideVertical: true,
              headerSeparator: true,
            },
          }),
          headerBackgroundColor: hex,
        },
      };
    }
    if (el.type === 'planner_day_box' && newStyle.plannerDayBox) {
      newStyle.plannerDayBox = {
        ...newStyle.plannerDayBox,
        headerBackgroundColor: hex,
      };
    }
    if (el.type === 'footer_tracker' && newStyle.footerTracker) {
      newStyle.footerTracker = {
        ...newStyle.footerTracker,
        fillColor: hex,
        boxBackgroundColor: hex,
      };
    }
  } else if (role === 'border') {
    newStyle.borderColorStyleId = colorStyle.id;
    newStyle.borderColor = hex;
    if (el.type === 'lines' || el.type === 'note_grid') {
      newStyle.color = hex;
    }
    if (el.type === 'table' && newStyle.table) {
      newStyle.table = {
        ...newStyle.table,
        borderColor: hex,
      };
    }
    if ((el.type === 'mini_calendar' || el.type === 'full_calendar') && newStyle.fullCalendar?.grid) {
      newStyle.fullCalendar = {
        ...newStyle.fullCalendar,
        grid: {
          ...newStyle.fullCalendar.grid,
          borderColor: hex,
        },
      };
    }
    if (el.type === 'planner_day_box' && newStyle.plannerDayBox) {
      newStyle.plannerDayBox = {
        ...newStyle.plannerDayBox,
        strokeColor: hex,
        headerBorderColor: hex,
      };
    }
    if (el.type === 'footer_tracker' && newStyle.footerTracker) {
      newStyle.footerTracker = {
        ...newStyle.footerTracker,
        boxBorderColor: hex,
        topDividerColor: hex,
        sectionDividerColor: hex,
      };
    }
  }

  return { ...el, style: newStyle };
}

export function applyCharacterStyleToElement(
  el: LayoutElement,
  charStyle: CharacterStylePreset,
  colorStyles: ColorStylePreset[]
): LayoutElement {
  const newStyle: LayoutElement['style'] = {
    ...el.style,
    characterStyleId: charStyle.id,
  };

  if (charStyle.fontFamily !== undefined) newStyle.fontFamily = charStyle.fontFamily;
  if (charStyle.fontSize !== undefined) newStyle.fontSize = charStyle.fontSize;
  if (charStyle.fontWeight !== undefined) newStyle.fontWeight = charStyle.fontWeight;
  if (charStyle.fontStyle !== undefined) newStyle.fontStyle = charStyle.fontStyle;
  if (charStyle.letterSpacing !== undefined) newStyle.letterSpacing = charStyle.letterSpacing;
  if (charStyle.textTransform !== undefined) newStyle.textTransform = charStyle.textTransform;

  // Resolve color if linked or direct
  let resolvedColor: string | undefined = charStyle.color;
  if (charStyle.colorStyleId) {
    const linkedColor = colorStyles.find(c => c.id === charStyle.colorStyleId);
    if (linkedColor) {
      resolvedColor = linkedColor.color;
      newStyle.colorStyleId = linkedColor.id;
    }
  }
  if (resolvedColor) {
    newStyle.color = resolvedColor;
  }

  if (el.type === 'table' && newStyle.table) {
    const updatedTextStyle = {
      ...(newStyle.table.textStyle || {}),
      characterStyleId: charStyle.id,
      ...(charStyle.fontFamily !== undefined ? { fontFamily: charStyle.fontFamily } : {}),
      ...(charStyle.fontSize !== undefined ? { fontSize: charStyle.fontSize } : {}),
      ...(charStyle.fontWeight !== undefined ? { fontWeight: charStyle.fontWeight } : {}),
      ...(charStyle.fontStyle !== undefined ? { fontStyle: charStyle.fontStyle } : {}),
      ...(charStyle.letterSpacing !== undefined ? { letterSpacing: charStyle.letterSpacing } : {}),
      ...(charStyle.textTransform !== undefined ? { textTransform: charStyle.textTransform } : {}),
      ...(resolvedColor ? { color: resolvedColor } : {}),
    };
    newStyle.table = {
      ...newStyle.table,
      textStyle: updatedTextStyle,
    };
  }

  if ((el.type === 'mini_calendar' || el.type === 'full_calendar') && newStyle.fullCalendar) {
    newStyle.fullCalendar = {
      ...newStyle.fullCalendar,
      title: {
        ...(newStyle.fullCalendar.title || {}),
        ...(charStyle.fontFamily ? { fontFamily: charStyle.fontFamily } : {}),
        ...(charStyle.fontWeight ? { fontWeight: charStyle.fontWeight } : {}),
        ...(charStyle.textTransform ? { textTransform: charStyle.textTransform } : {}),
        ...(resolvedColor ? { color: resolvedColor } : {}),
      },
      weekDays: {
        ...(newStyle.fullCalendar.weekDays || {}),
        ...(charStyle.fontFamily ? { fontFamily: charStyle.fontFamily } : {}),
      },
      days: {
        ...(newStyle.fullCalendar.days || {}),
        ...(charStyle.fontFamily ? { fontFamily: charStyle.fontFamily } : {}),
      },
    };
  }

  if (el.type === 'planner_day_box' && newStyle.plannerDayBox) {
    newStyle.plannerDayBox = {
      ...newStyle.plannerDayBox,
      ...(charStyle.fontFamily ? { fontFamily: charStyle.fontFamily, headerFontFamily: charStyle.fontFamily } : {}),
      ...(charStyle.fontSize ? { fontSize: charStyle.fontSize } : {}),
      ...(charStyle.fontWeight ? { fontWeight: charStyle.fontWeight } : {}),
      ...(resolvedColor ? { color: resolvedColor, headerTextColor: resolvedColor } : {}),
    };
  }

  return { ...el, style: newStyle };
}

export function applyParagraphStyleToElement(
  el: LayoutElement,
  paraStyle: ParagraphStylePreset,
  characterStyles: CharacterStylePreset[],
  colorStyles: ColorStylePreset[]
): LayoutElement {
  let updatedEl: LayoutElement = {
    ...el,
    style: {
      ...el.style,
      paragraphStyleId: paraStyle.id,
      ...(paraStyle.textAlign !== undefined ? { textAlign: paraStyle.textAlign } : {}),
      ...(paraStyle.verticalAlign !== undefined ? { verticalAlign: paraStyle.verticalAlign } : {}),
      ...(paraStyle.lineHeight !== undefined ? { lineHeight: paraStyle.lineHeight } : {}),
      ...(paraStyle.cellPadding !== undefined ? { cellPadding: paraStyle.cellPadding } : {}),
      ...(paraStyle.columnCount !== undefined ? { columnCount: paraStyle.columnCount } : {}),
      ...(paraStyle.columnGap !== undefined ? { columnGap: paraStyle.columnGap } : {}),
    },
  };

  if (updatedEl.type === 'table' && updatedEl.style.table) {
    updatedEl.style.table = {
      ...updatedEl.style.table,
      textStyle: {
        ...(updatedEl.style.table.textStyle || {}),
        paragraphStyleId: paraStyle.id,
        ...(paraStyle.textAlign !== undefined ? { textAlign: paraStyle.textAlign } : {}),
        ...(paraStyle.verticalAlign !== undefined ? { verticalAlign: paraStyle.verticalAlign } : {}),
        ...(paraStyle.lineHeight !== undefined ? { lineHeight: paraStyle.lineHeight } : {}),
        ...(paraStyle.textWrap !== undefined ? { textWrap: paraStyle.textWrap } : {}),
        ...(paraStyle.cellPadding !== undefined ? { cellPadding: paraStyle.cellPadding } : {}),
      },
    };
  }

  if (paraStyle.characterStyleId) {
    const linkedChar = characterStyles.find(c => c.id === paraStyle.characterStyleId);
    if (linkedChar) {
      updatedEl = applyCharacterStyleToElement(updatedEl, linkedChar, colorStyles);
    }
  }

  return updatedEl;
}

export function refreshElementWithStyles(
  el: LayoutElement,
  styles: ProjectStylesConfig
): LayoutElement {
  let current = el;

  // 1. Paragraph style (which may also trigger its linked character style)
  if (current.style.paragraphStyleId) {
    const pStyle = styles.paragraphStyles.find(p => p.id === current.style.paragraphStyleId);
    if (pStyle) {
      current = applyParagraphStyleToElement(current, pStyle, styles.characterStyles, styles.colorStyles);
    }
  }

  // 2. Character style (explicit on element overrides paragraph's default character style)
  if (current.style.characterStyleId) {
    const cStyle = styles.characterStyles.find(c => c.id === current.style.characterStyleId);
    if (cStyle) {
      current = applyCharacterStyleToElement(current, cStyle, styles.colorStyles);
    }
  }

  // 3. Color styles (color, fill, border)
  if (current.style.colorStyleId) {
    const colStyle = styles.colorStyles.find(c => c.id === current.style.colorStyleId);
    if (colStyle) {
      current = applyColorStyleToElement(current, colStyle, 'color');
    }
  }
  if (current.style.fillColorStyleId) {
    const fillStyle = styles.colorStyles.find(c => c.id === current.style.fillColorStyleId);
    if (fillStyle) {
      current = applyColorStyleToElement(current, fillStyle, 'fill');
    }
  }
  if (current.style.borderColorStyleId) {
    const borderStyle = styles.colorStyles.find(c => c.id === current.style.borderColorStyleId);
    if (borderStyle) {
      current = applyColorStyleToElement(current, borderStyle, 'border');
    }
  }

  return current;
}

export function mapAllElementsInConfig(
  config: AgendaConfig,
  mapper: (el: LayoutElement) => LayoutElement
): AgendaConfig {
  const mapList = (list?: LayoutElement[]) => (list ? list.map(mapper) : undefined);

  return {
    ...config,
    elements: config.elements.map(mapper),
    elementsVerso: mapList(config.elementsVerso),
    elementsSaturday: mapList(config.elementsSaturday),
    elementsSunday: mapList(config.elementsSunday),
    elementsTop: mapList(config.elementsTop),
    elementsBottom: mapList(config.elementsBottom),
    elementsWeeklyLeft: mapList(config.elementsWeeklyLeft),
    elementsWeeklyRight: mapList(config.elementsWeeklyRight),
    introPages: config.introPages.map(p => ({
      ...p,
      elements: p.elements.map(mapper),
    })),
    monthlyIntroPages: config.monthlyIntroPages
      ? config.monthlyIntroPages.map(p => ({
          ...p,
          elements: p.elements.map(mapper),
        }))
      : undefined,
    monthlyDividerStyle: config.monthlyDividerStyle
      ? {
          ...config.monthlyDividerStyle,
          elements: mapList(config.monthlyDividerStyle.elements),
          versoElements: mapList(config.monthlyDividerStyle.versoElements),
        }
      : undefined,
  };
}

export function propagateStylesAcrossConfig(
  config: AgendaConfig,
  nextStyles: ProjectStylesConfig
): AgendaConfig {
  const updated = mapAllElementsInConfig(config, el => refreshElementWithStyles(el, nextStyles));
  return {
    ...updated,
    styles: nextStyles,
  };
}

export function getAllElementsFromConfig(config: AgendaConfig): LayoutElement[] {
  const all: LayoutElement[] = [];
  const pushList = (list?: LayoutElement[]) => {
    if (list) all.push(...list);
  };

  pushList(config.elements);
  pushList(config.elementsVerso);
  pushList(config.elementsSaturday);
  pushList(config.elementsSunday);
  pushList(config.elementsTop);
  pushList(config.elementsBottom);
  pushList(config.elementsWeeklyLeft);
  pushList(config.elementsWeeklyRight);
  config.introPages?.forEach(p => pushList(p.elements));
  config.monthlyIntroPages?.forEach(p => pushList(p.elements));
  pushList(config.monthlyDividerStyle?.elements);
  pushList(config.monthlyDividerStyle?.versoElements);

  return all;
}

export function countStyleUsageInConfig(config: AgendaConfig): {
  colorCounts: Record<string, number>;
  characterCounts: Record<string, number>;
  paragraphCounts: Record<string, number>;
} {
  const colorCounts: Record<string, number> = {};
  const characterCounts: Record<string, number> = {};
  const paragraphCounts: Record<string, number> = {};

  const all = getAllElementsFromConfig(config);
  for (const el of all) {
    const s = el.style;
    if (!s) continue;
    const usedColorIds = new Set<string>();
    if (s.colorStyleId) usedColorIds.add(s.colorStyleId);
    if (s.fillColorStyleId) usedColorIds.add(s.fillColorStyleId);
    if (s.borderColorStyleId) usedColorIds.add(s.borderColorStyleId);
    usedColorIds.forEach(cid => {
      colorCounts[cid] = (colorCounts[cid] || 0) + 1;
    });

    if (s.characterStyleId) {
      characterCounts[s.characterStyleId] = (characterCounts[s.characterStyleId] || 0) + 1;
    }
    if (s.paragraphStyleId) {
      paragraphCounts[s.paragraphStyleId] = (paragraphCounts[s.paragraphStyleId] || 0) + 1;
    }
  }

  return { colorCounts, characterCounts, paragraphCounts };
}

export function linkElementsByMatchingHexInConfig(
  config: AgendaConfig,
  targetHex: string,
  colorStyle: ColorStylePreset
): { updatedConfig: AgendaConfig; linkedCount: number } {
  const normalized = targetHex.trim().toLowerCase();
  let linkedCount = 0;

  const updatedConfig = mapAllElementsInConfig(config, el => {
    let nextEl = el;
    let matched = false;
    const s = el.style;

    if (s.color && s.color.trim().toLowerCase() === normalized) {
      nextEl = applyColorStyleToElement(nextEl, colorStyle, 'color');
      matched = true;
    }
    if (s.backgroundColor && s.backgroundColor.trim().toLowerCase() === normalized) {
      nextEl = applyColorStyleToElement(nextEl, colorStyle, 'fill');
      matched = true;
    }
    if (s.borderColor && s.borderColor.trim().toLowerCase() === normalized) {
      nextEl = applyColorStyleToElement(nextEl, colorStyle, 'border');
      matched = true;
    }
    if (s.table?.borderColor && s.table.borderColor.trim().toLowerCase() === normalized) {
      nextEl = applyColorStyleToElement(nextEl, colorStyle, 'border');
      matched = true;
    }
    if (s.table?.textStyle?.color && s.table.textStyle.color.trim().toLowerCase() === normalized) {
      nextEl = applyColorStyleToElement(nextEl, colorStyle, 'color');
      matched = true;
    }

    if (matched) linkedCount++;
    return nextEl;
  });

  return { updatedConfig, linkedCount };
}
