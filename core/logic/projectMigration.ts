import {
  AgendaConfig,
  BackgroundConfig,
  BackgroundRulesConfig,
  CategoryBackgroundConfig,
  CoverPage,
  CoverProjectConfig,
  CustomTemplateItem,
  IntroPage,
  LayoutElement,
  MonthlyDividerStyle,
  PageLayoutType,
  PageMargins,
  PageOrientation,
  PageSize,
  ProjectStylesConfig,
  ProjectType,
} from '../../types';
import { createDefaultCoverConfig } from '../../modules/editor/components/cover/coverGabaritoData';
import { cleanFontFamilyName } from './fontDetector';

export const CURRENT_PROJECT_SCHEMA_VERSION = 2;

const VALID_LAYOUT_TYPES: PageLayoutType[] = [
  '1_per_page',
  '2_per_page',
  '1_per_page_weekend_shared',
  'weekly_vertical',
  'weekly_horizontal',
  'weekly_one_page_vertical',
  'weekly_one_page_horizontal',
  'notebook',
  'devotional',
];

const VALID_PROJECT_TYPES: ProjectType[] = [
  'agenda',
  'planner',
  'notebook',
  'devotional',
  'cover',
];

const genId = (prefix: string = 'el_'): string =>
  `${prefix}${Math.random().toString(36).substring(2, 11)}`;

const toFiniteNumber = (val: unknown, fallback: number): number => {
  if (val === undefined || val === null || val === '') return fallback;
  const n = Number(val);
  return Number.isFinite(n) ? n : fallback;
};

const isMarginsZero = (m?: Partial<PageMargins>): boolean => {
  if (!m) return false;
  return (
    toFiniteNumber(m.top, 0) === 0 &&
    toFiniteNumber(m.bottom, 0) === 0 &&
    toFiniteNumber(m.inside, 0) === 0 &&
    toFiniteNumber(m.outside, 0) === 0
  );
};

const hasNonZeroHorizontalMargins = (m?: Partial<PageMargins>): boolean => {
  if (!m) return false;
  return toFiniteNumber(m.inside, 0) > 0 || toFiniteNumber(m.outside, 0) > 0;
};

export const normalizeMargins = (
  raw: any,
  fallback: PageMargins = { top: 15, bottom: 15, inside: 20, outside: 10 }
): PageMargins => {
  if (!raw || typeof raw !== 'object') {
    return { ...fallback };
  }
  return {
    top: toFiniteNumber(raw.top, fallback.top),
    bottom: toFiniteNumber(raw.bottom, fallback.bottom),
    inside: toFiniteNumber(raw.inside, fallback.inside),
    outside: toFiniteNumber(raw.outside, fallback.outside),
  };
};

export const normalizePageSize = (rawSize: any): PageSize => {
  if (typeof rawSize !== 'string') return 'A5';
  const lower = rawSize.trim().toLowerCase();
  if (lower === 'a4') return 'A4';
  if (lower === 'a5') return 'A5';
  if (lower === 'letter' || lower === 'carta') return 'Letter';
  if (lower === 'custom' || lower === 'personalizado') return 'Custom';
  return 'A5';
};

export const normalizeOrientation = (rawOrientation: any): PageOrientation => {
  if (rawOrientation === 'landscape' || rawOrientation === 'paisagem') return 'landscape';
  return 'portrait';
};

export const normalizeBackgroundConfig = (bg: any): BackgroundConfig | undefined => {
  if (!bg || typeof bg !== 'object') return undefined;

  const hasLegacyFlatImage = typeof bg.imageUrl === 'string' && bg.imageUrl.trim().length > 0;
  const resolvedType: BackgroundConfig['type'] =
    bg.type === 'none' || bg.type === 'solid' || bg.type === 'gradient' || bg.type === 'image'
      ? bg.type
      : (hasLegacyFlatImage || bg.image?.url)
      ? 'image'
      : bg.gradient
      ? 'gradient'
      : bg.color
      ? 'solid'
      : 'none';

  const normalized: BackgroundConfig = {
    ...bg,
    type: resolvedType,
  };

  if (resolvedType === 'image' || bg.image || hasLegacyFlatImage) {
    const rawImg = bg.image && typeof bg.image === 'object' ? bg.image : {};
    const url = rawImg.url || bg.imageUrl || '';
    if (url) {
      normalized.image = {
        url,
        opacity: toFiniteNumber(rawImg.opacity ?? bg.opacity, 1),
        fit: rawImg.fit || bg.fit || 'fill',
        flipHorizontal: rawImg.flipHorizontal ?? bg.flipHorizontal,
        flipVertical: rawImg.flipVertical ?? bg.flipVertical,
        flipOnEvenPages: rawImg.flipOnEvenPages ?? bg.flipOnEvenPages,
        rotation: rawImg.rotation !== undefined ? toFiniteNumber(rawImg.rotation, 0) : bg.rotation,
      };
    }
  }

  if (resolvedType === 'gradient' && bg.gradient && typeof bg.gradient === 'object') {
    const colors = Array.isArray(bg.gradient.colors) && bg.gradient.colors.length >= 2
      ? [String(bg.gradient.colors[0] || '#ffffff'), String(bg.gradient.colors[1] || '#f3f4f6')] as [string, string]
      : ['#ffffff', '#f3f4f6'] as [string, string];
    normalized.gradient = {
      type: bg.gradient.type === 'radial' ? 'radial' : 'linear',
      colors,
      direction: toFiniteNumber(bg.gradient.direction, 180),
    };
  }

  return normalized;
};

const normalizeCategoryBg = (cat: any): CategoryBackgroundConfig | undefined => {
  if (!cat || typeof cat !== 'object') return undefined;
  const res: CategoryBackgroundConfig = {};
  if (cat.default) res.default = normalizeBackgroundConfig(cat.default);
  if (cat.even) res.even = normalizeBackgroundConfig(cat.even);
  if (cat.odd) res.odd = normalizeBackgroundConfig(cat.odd);
  return Object.keys(res).length > 0 ? res : undefined;
};

export const normalizeBackgroundRules = (rules: any): BackgroundRulesConfig | undefined => {
  if (!rules || typeof rules !== 'object') return undefined;
  const out: BackgroundRulesConfig = {};

  if (rules.global) out.global = normalizeBackgroundConfig(rules.global);
  if (rules.miolo) out.miolo = normalizeCategoryBg(rules.miolo);
  if (rules.mensais) out.mensais = normalizeCategoryBg(rules.mensais);
  if (rules.divisorias) out.divisorias = normalizeCategoryBg(rules.divisorias);
  if (rules.iniciais) out.iniciais = normalizeCategoryBg(rules.iniciais);

  if (rules.specificPages && typeof rules.specificPages === 'object') {
    const spec: Record<number, BackgroundConfig> = {};
    for (const key of Object.keys(rules.specificPages)) {
      const pageNum = parseInt(key, 10);
      if (!isNaN(pageNum)) {
        const bg = normalizeBackgroundConfig(rules.specificPages[key]);
        if (bg) spec[pageNum] = bg;
      }
    }
    if (Object.keys(spec).length > 0) {
      out.specificPages = spec;
    }
  }

  return out;
};

export const normalizeLayoutElement = (el: any, fallbackIndex: number = 0): LayoutElement => {
  if (!el || typeof el !== 'object') {
    return {
      id: genId(),
      type: 'text',
      content: '',
      x: 10,
      y: 10,
      w: 80,
      h: 10,
      zIndex: fallbackIndex + 1,
      style: {},
    };
  }

  const rawStyle = el.style && typeof el.style === 'object' ? { ...el.style } : {};

  if (typeof rawStyle.fontFamily === 'string' && rawStyle.fontFamily.trim()) {
    rawStyle.fontFamily = cleanFontFamilyName(rawStyle.fontFamily) || rawStyle.fontFamily;
  }

  // Compatibilidade com preenchimento legado via fillColor sem backgroundColor
  if (
    rawStyle.backgroundColor === undefined &&
    typeof rawStyle.fillColor === 'string' &&
    rawStyle.fillColor.trim() !== '' &&
    el.type !== 'habit_tracker' &&
    el.type !== 'footer_tracker'
  ) {
    rawStyle.backgroundColor = rawStyle.fillColor;
  }

  // Compatibilidade para pautas antigas com stepHour / timeColumnWidth
  if (el.type === 'lines') {
    if (rawStyle.timeInterval === undefined && rawStyle.stepHour !== undefined) {
      const stepH = Number(rawStyle.stepHour);
      if (Number.isFinite(stepH) && stepH > 0) {
        rawStyle.timeInterval = Math.round(stepH * 60);
      }
    }
    if (rawStyle.timeWidth === undefined && rawStyle.timeColumnWidth !== undefined) {
      const colW = Number(rawStyle.timeColumnWidth);
      if (Number.isFinite(colW) && colW > 0) {
        rawStyle.timeWidth = colW;
      }
    }
  }

  // Compatibilidade para tabelas antigas (alternateRowColor -> zebraRows/zebraColor, cellContent garantido)
  if (el.type === 'table' && rawStyle.table && typeof rawStyle.table === 'object') {
    const tbl = { ...rawStyle.table };
    if (
      tbl.zebraRows === undefined &&
      typeof tbl.alternateRowColor === 'string' &&
      tbl.alternateRowColor.trim() !== '' &&
      tbl.alternateRowColor !== 'transparent'
    ) {
      tbl.zebraRows = true;
      tbl.zebraColor = tbl.zebraColor || tbl.alternateRowColor;
    }
    if (!tbl.cellContent || typeof tbl.cellContent !== 'object') {
      tbl.cellContent = {};
    }
    if (tbl.textStyle?.fontFamily) {
      tbl.textStyle = { ...tbl.textStyle, fontFamily: cleanFontFamilyName(tbl.textStyle.fontFamily) || tbl.textStyle.fontFamily };
    }
    rawStyle.table = tbl;
  }

  // Compatibilidade para plannerDayBox
  if (rawStyle.plannerDayBox && typeof rawStyle.plannerDayBox === 'object') {
    const pdb = { ...rawStyle.plannerDayBox };
    if (pdb.fontFamily) pdb.fontFamily = cleanFontFamilyName(pdb.fontFamily) || pdb.fontFamily;
    if (pdb.headerFontFamily) pdb.headerFontFamily = cleanFontFamilyName(pdb.headerFontFamily) || pdb.headerFontFamily;
    if (pdb.holidayFontFamily) pdb.holidayFontFamily = cleanFontFamilyName(pdb.holidayFontFamily) || pdb.holidayFontFamily;
    rawStyle.plannerDayBox = pdb;
  }

  // Compatibilidade para calendários antigos usando startOfWeekOnMonday
  if ((el.type === 'full_calendar' || el.type === 'mini_calendar') && rawStyle.fullCalendar && typeof rawStyle.fullCalendar === 'object') {
    const fc = { ...rawStyle.fullCalendar };
    if (fc.startOfWeekDay === undefined && fc.startOfWeekOnMonday === true) {
      fc.startOfWeekDay = 1;
    }
    if (fc.title?.fontFamily) fc.title = { ...fc.title, fontFamily: cleanFontFamilyName(fc.title.fontFamily) || fc.title.fontFamily };
    if (fc.weekDays?.fontFamily) fc.weekDays = { ...fc.weekDays, fontFamily: cleanFontFamilyName(fc.weekDays.fontFamily) || fc.weekDays.fontFamily };
    if (fc.days?.fontFamily) fc.days = { ...fc.days, fontFamily: cleanFontFamilyName(fc.days.fontFamily) || fc.days.fontFamily };
    rawStyle.fullCalendar = fc;
  }

  return {
    ...el,
    id: typeof el.id === 'string' && el.id.trim() ? el.id : genId(),
    x: toFiniteNumber(el.x, 10),
    y: toFiniteNumber(el.y, 10),
    w: toFiniteNumber(el.w, 80),
    h: toFiniteNumber(el.h, 10),
    zIndex: toFiniteNumber(el.zIndex, fallbackIndex + 1),
    style: rawStyle,
  };
};

const normalizeElementList = (arr: any): LayoutElement[] | undefined => {
  if (!Array.isArray(arr)) return undefined;
  return arr.map((el, idx) => normalizeLayoutElement(el, idx));
};

export const normalizeIntroPage = (page: any, idx: number = 0): IntroPage => {
  if (!page || typeof page !== 'object') {
    return {
      id: genId('intro_'),
      name: `Página ${idx + 1}`,
      elements: [],
    };
  }
  return {
    ...page,
    id: typeof page.id === 'string' && page.id.trim() ? page.id : genId('intro_'),
    name: typeof page.name === 'string' && page.name.trim() ? page.name : `Página ${idx + 1}`,
    elements: Array.isArray(page.elements)
      ? page.elements.map((el: any, i: number) => normalizeLayoutElement(el, i))
      : [],
    background: page.background ? normalizeBackgroundConfig(page.background) : undefined,
  };
};

export const normalizeMonthlyDividerStyle = (rawStyle: any): MonthlyDividerStyle | undefined => {
  if (!rawStyle || typeof rawStyle !== 'object') return undefined;
  return {
    ...rawStyle,
    elements: normalizeElementList(rawStyle.elements),
    versoElements: normalizeElementList(rawStyle.versoElements),
    background: rawStyle.background ? normalizeBackgroundConfig(rawStyle.background) : undefined,
    versoBackground: rawStyle.versoBackground ? normalizeBackgroundConfig(rawStyle.versoBackground) : undefined,
  };
};

export const normalizeCoverConfig = (
  rawCover: any,
  isLegacyProject: boolean
): CoverProjectConfig | undefined => {
  if (!rawCover || typeof rawCover !== 'object') return undefined;

  const base = createDefaultCoverConfig();
  const rawPages = Array.isArray(rawCover.pages) && rawCover.pages.length > 0 ? rawCover.pages : base.pages;
  const pages: CoverPage[] = rawPages.map((p: any, idx: number) => ({
    ...p,
    id: typeof p?.id === 'string' && p.id.trim() ? p.id : `cover_page_${idx + 1}`,
    name: typeof p?.name === 'string' && p.name.trim() ? p.name : `Capa ${idx + 1}`,
    type: p?.type || 'front',
    elements: Array.isArray(p?.elements)
      ? p.elements.map((el: any, i: number) => normalizeLayoutElement(el, i))
      : [],
    background: p?.background ? normalizeBackgroundConfig(p.background) : undefined,
  }));

  const mergedGuides = {
    ...base.guides,
    ...(rawCover.guides || {}),
  };
  const mergedWireO = {
    ...base.wireO,
    ...(rawCover.wireO || {}),
  };

  // Migração única de gabarito antigo (antes de schemaVersion): furação antiga 8.5mm com linha de área segura
  if (isLegacyProject && mergedGuides.showSafeZoneLine === true && mergedWireO.marginMm === 8.5) {
    mergedGuides.showSafeZoneLine = false;
    mergedWireO.marginMm = 5;
  }

  return {
    ...base,
    ...rawCover,
    cardboardSize: {
      width: toFiniteNumber(rawCover.cardboardSize?.width, base.cardboardSize.width),
      height: toFiniteNumber(rawCover.cardboardSize?.height, base.cardboardSize.height),
    },
    bleedMm: toFiniteNumber(rawCover.bleedMm, base.bleedMm),
    safeMarginMm: toFiniteNumber(rawCover.safeMarginMm, base.safeMarginMm),
    guides: mergedGuides,
    wireO: mergedWireO,
    elastic: {
      ...base.elastic,
      ...(rawCover.elastic || {}),
    },
    spine: {
      ...base.spine,
      ...(rawCover.spine || {}),
    },
    pages,
    activeCoverPageId:
      typeof rawCover.activeCoverPageId === 'string' && pages.some(p => p.id === rawCover.activeCoverPageId)
        ? rawCover.activeCoverPageId
        : (pages[0]?.id || 'cover_front'),
  };
};

export const normalizeProjectStyles = (rawStyles: any): ProjectStylesConfig | undefined => {
  if (!rawStyles || typeof rawStyles !== 'object') return undefined;
  return {
    objectStyles: Array.isArray(rawStyles.objectStyles) ? rawStyles.objectStyles : undefined,
    colorStyles: Array.isArray(rawStyles.colorStyles) ? rawStyles.colorStyles : [],
    characterStyles: Array.isArray(rawStyles.characterStyles)
      ? rawStyles.characterStyles.map((cs: any) =>
          cs && typeof cs === 'object' && typeof cs.fontFamily === 'string'
            ? { ...cs, fontFamily: cleanFontFamilyName(cs.fontFamily) || cs.fontFamily }
            : cs
        )
      : [],
    paragraphStyles: Array.isArray(rawStyles.paragraphStyles) ? rawStyles.paragraphStyles : [],
  };
};

const collectAllProjectElements = (cfg: Partial<AgendaConfig>): LayoutElement[] => {
  const all: LayoutElement[] = [];
  const push = (list?: LayoutElement[]) => {
    if (Array.isArray(list)) all.push(...list);
  };
  push(cfg.elements);
  push(cfg.elementsVerso);
  push(cfg.elementsSaturday);
  push(cfg.elementsSunday);
  push(cfg.elementsWeekendTransition);
  push(cfg.fillerPageElements);
  push(cfg.elementsTop);
  push(cfg.elementsBottom);
  push(cfg.elementsWeeklyLeft);
  push(cfg.elementsWeeklyRight);
  push(cfg.elementsWeeklyVersoLeft);
  push(cfg.elementsWeeklyVersoRight);
  cfg.introPages?.forEach(p => push(p.elements));
  cfg.monthlyIntroPages?.forEach(p => push(p.elements));
  push(cfg.monthlyDividerStyle?.elements);
  push(cfg.monthlyDividerStyle?.versoElements);
  return all;
};

const hasPdfImportBackgroundSignature = (raw: any): boolean => {
  const checkBgName = (bg?: any) =>
    Boolean(bg && typeof bg.name === 'string' && bg.name.toLowerCase().includes('fundo pdf'));
  if (checkBgName(raw.background)) return true;
  if (Array.isArray(raw.backgrounds) && raw.backgrounds.some(checkBgName)) return true;
  if (raw.backgroundRules?.global && checkBgName(raw.backgroundRules.global)) return true;
  if (raw.backgroundRules?.miolo?.default && checkBgName(raw.backgroundRules.miolo.default)) return true;
  if (raw.backgroundRules?.miolo?.even && checkBgName(raw.backgroundRules.miolo.even)) return true;
  if (raw.backgroundRules?.miolo?.odd && checkBgName(raw.backgroundRules.miolo.odd)) return true;
  return false;
};

/**
 * Desembrulha payloads que tenham sido salvos no formato `{ name, config }` (ex: autosave)
 * ou `{ project }`.
 */
export const unwrapRawProjectData = (rawInput: any): any => {
  if (!rawInput || typeof rawInput !== 'object' || Array.isArray(rawInput)) {
    return rawInput;
  }
  if (rawInput.config && typeof rawInput.config === 'object' && !Array.isArray(rawInput.config)) {
    return {
      ...rawInput.config,
      name: rawInput.config.name || rawInput.name,
    };
  }
  if (rawInput.project && typeof rawInput.project === 'object' && !Array.isArray(rawInput.project)) {
    return {
      ...rawInput.project,
      name: rawInput.project.name || rawInput.name,
    };
  }
  return rawInput;
};

const inferLayoutType = (raw: any, explicitProjectType?: ProjectType): PageLayoutType => {
  const lt = raw.layoutType;
  if (typeof lt === 'string' && (VALID_LAYOUT_TYPES as string[]).includes(lt)) {
    return lt as PageLayoutType;
  }
  if (lt === 'weekly' || Array.isArray(raw.elementsWeeklyLeft) && raw.elementsWeeklyLeft.length > 0) {
    return 'weekly_vertical';
  }
  if (explicitProjectType === 'notebook') return 'notebook';
  if (explicitProjectType === 'devotional') return 'devotional';
  return '1_per_page';
};

const inferProjectType = (raw: any, layoutType: PageLayoutType): ProjectType => {
  if (typeof raw.projectType === 'string' && (VALID_PROJECT_TYPES as string[]).includes(raw.projectType)) {
    return raw.projectType as ProjectType;
  }
  if (
    layoutType.startsWith('weekly') ||
    (Array.isArray(raw.elementsWeeklyLeft) && raw.elementsWeeklyLeft.length > 0) ||
    (Array.isArray(raw.elementsWeeklyRight) && raw.elementsWeeklyRight.length > 0)
  ) {
    return 'planner';
  }
  if (layoutType === 'notebook') return 'notebook';
  if (layoutType === 'devotional') return 'devotional';
  if (
    raw.cover &&
    (!Array.isArray(raw.elements) || raw.elements.length === 0) &&
    (!Array.isArray(raw.elementsWeeklyLeft) || raw.elementsWeeklyLeft.length === 0) &&
    (!Array.isArray(raw.introPages) || raw.introPages.length === 0)
  ) {
    return 'cover';
  }
  return 'agenda';
};

/**
 * Detecta se o arquivo/objeto pertence a uma versão anterior e normaliza/migra
 * todos os campos preservando 100% da estrutura, visual, margens, espelhamento e configurações originais.
 */
export const migrateProjectConfig = (rawInput: any): AgendaConfig => {
  const raw = unwrapRawProjectData(rawInput);
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    throw new Error('Formato de arquivo inválido.');
  }

  const hasRecognizableProjectField = Boolean(
    raw.year !== undefined ||
    raw.elements ||
    raw.elementsWeeklyLeft ||
    raw.elementsWeeklyRight ||
    raw.introPages ||
    raw.monthlyIntroPages ||
    raw.cover ||
    raw.projectType ||
    raw.layoutType ||
    raw.pageSize ||
    raw.margins ||
    raw.background ||
    raw.backgrounds ||
    raw.backgroundRules
  );

  if (!hasRecognizableProjectField) {
    throw new Error('Este arquivo JSON não parece ser um projeto do Agenda Master.');
  }

  const isLegacyProject =
    typeof raw.schemaVersion !== 'number' || raw.schemaVersion < CURRENT_PROJECT_SCHEMA_VERSION;

  const explicitProjectType =
    typeof raw.projectType === 'string' && (VALID_PROJECT_TYPES as string[]).includes(raw.projectType)
      ? (raw.projectType as ProjectType)
      : undefined;

  const layoutType = inferLayoutType(raw, explicitProjectType);
  const projectType = inferProjectType(raw, layoutType);
  const isPermanent = Boolean(raw.isPermanent);
  const isNonDatedMode =
    isPermanent ||
    projectType === 'notebook' ||
    projectType === 'devotional' ||
    projectType === 'cover';

  const pageSize = normalizePageSize(raw.pageSize);
  const orientation = normalizeOrientation(raw.orientation);

  let customPageSize: AgendaConfig['customPageSize'];
  if (pageSize === 'Custom' || (raw.customPageSize && typeof raw.customPageSize === 'object')) {
    const cp = raw.customPageSize || {};
    customPageSize = {
      width: Math.max(20, toFiniteNumber(cp.width ?? cp.w, 148)),
      height: Math.max(20, toFiniteNumber(cp.height ?? cp.h, 210)),
    };
  }

  const defaultMargins: PageMargins = { top: 15, bottom: 15, inside: 20, outside: 10 };
  const margins = normalizeMargins(raw.margins, defaultMargins);
  const initialMargins = raw.initialMargins
    ? normalizeMargins(raw.initialMargins, hasNonZeroHorizontalMargins(margins) ? margins : defaultMargins)
    : { ...margins };
  const bindingMargins = raw.bindingMargins
    ? normalizeMargins(raw.bindingMargins, hasNonZeroHorizontalMargins(initialMargins) ? initialMargins : defaultMargins)
    : hasNonZeroHorizontalMargins(initialMargins)
    ? { ...initialMargins }
    : { ...margins };

  const elements = normalizeElementList(raw.elements) || [];
  const elementsVerso = normalizeElementList(raw.elementsVerso);
  const elementsSaturday = normalizeElementList(raw.elementsSaturday);
  const elementsSunday = normalizeElementList(raw.elementsSunday);
  const elementsWeekendTransition = normalizeElementList(raw.elementsWeekendTransition);
  const fillerPageElements = normalizeElementList(raw.fillerPageElements);
  const elementsTop = normalizeElementList(raw.elementsTop);
  const elementsBottom = normalizeElementList(raw.elementsBottom);
  const elementsWeeklyLeft = normalizeElementList(raw.elementsWeeklyLeft);
  const elementsWeeklyRight = normalizeElementList(raw.elementsWeeklyRight);
  const elementsWeeklyVersoLeft = normalizeElementList(raw.elementsWeeklyVersoLeft);
  const elementsWeeklyVersoRight = normalizeElementList(raw.elementsWeeklyVersoRight);

  const introPages: IntroPage[] = Array.isArray(raw.introPages)
    ? raw.introPages.map((p: any, idx: number) => normalizeIntroPage(p, idx))
    : [];
  const monthlyIntroPages: IntroPage[] = Array.isArray(raw.monthlyIntroPages)
    ? raw.monthlyIntroPages.map((p: any, idx: number) => normalizeIntroPage(p, idx))
    : [];

  const monthlyDividerStyle = normalizeMonthlyDividerStyle(raw.monthlyDividerStyle);
  const background = raw.background ? normalizeBackgroundConfig(raw.background) : undefined;
  const backgrounds = Array.isArray(raw.backgrounds)
    ? (raw.backgrounds.map(normalizeBackgroundConfig).filter(Boolean) as BackgroundConfig[])
    : undefined;
  const backgroundRules = normalizeBackgroundRules(raw.backgroundRules);
  const fillerPageBackground = raw.fillerPageBackground
    ? normalizeBackgroundConfig(raw.fillerPageBackground)
    : undefined;
  const cover = normalizeCoverConfig(raw.cover, isLegacyProject);
  const styles = normalizeProjectStyles(raw.styles);

  const mirrorEvenPages = raw.mirrorEvenPages !== undefined ? Boolean(raw.mirrorEvenPages) : true;

  // Regra inteligente de espelhamento no verso:
  // 1) Se já estava salvo explicitamente (true ou false), mantém fielmente.
  // 2) Se é projeto antigo sem esse campo:
  //    - Se for importação PDF 1:1 legada (margens zero + fundo PDF importado), mantém false para não inverter a arte pronta.
  //    - Caso contrário, versões antigas com mirrorEvenPages=true sempre espelhavam também o conteúdo (true).
  let mirrorContentOnVerso: boolean;
  if (raw.mirrorContentOnVerso !== undefined) {
    mirrorContentOnVerso = Boolean(raw.mirrorContentOnVerso);
  } else if (isLegacyProject && mirrorEvenPages) {
    const looksLikeLegacyPdf1to1 = isMarginsZero(margins) && hasPdfImportBackgroundSignature(raw);
    mirrorContentOnVerso = !looksLikeLegacyPdf1to1;
  } else {
    mirrorContentOnVerso = false;
  }

  const customVerso =
    raw.customVerso !== undefined
      ? Boolean(raw.customVerso)
      : Boolean(
          (elementsVerso && elementsVerso.length > 0) ||
          (elementsWeeklyVersoLeft && elementsWeeklyVersoLeft.length > 0) ||
          (elementsWeeklyVersoRight && elementsWeeklyVersoRight.length > 0)
        );

  const versoAdvancesSequence =
    raw.versoAdvancesSequence !== undefined ? Boolean(raw.versoAdvancesSequence) : true;

  // Preservação fiel de divisórias mensais, páginas mensais e alinhamento de página direita:
  // Nunca força "true" às cegas em projetos antigos que não possuíam essas estruturas!
  const includeMonthlyDividers =
    raw.includeMonthlyDividers !== undefined
      ? Boolean(raw.includeMonthlyDividers)
      : isNonDatedMode
      ? false
      : true;

  const includeMonthlyIntroPages =
    raw.includeMonthlyIntroPages !== undefined
      ? Boolean(raw.includeMonthlyIntroPages)
      : (!isNonDatedMode && monthlyIntroPages.length > 0);

  const startMonthOnRightPage =
    raw.startMonthOnRightPage !== undefined
      ? Boolean(raw.startMonthOnRightPage)
      : isNonDatedMode
      ? false
      : true;

  const partialCfg: Partial<AgendaConfig> = {
    elements,
    elementsVerso,
    elementsSaturday,
    elementsSunday,
    elementsWeekendTransition,
    fillerPageElements,
    elementsTop,
    elementsBottom,
    elementsWeeklyLeft,
    elementsWeeklyRight,
    elementsWeeklyVersoLeft,
    elementsWeeklyVersoRight,
    introPages,
    monthlyIntroPages,
    monthlyDividerStyle,
  };
  const allElements = collectAllProjectElements(partialCfg);
  const hasType = (t: string) => allElements.some(el => el.type === t);

  const includeHolidays =
    raw.includeHolidays !== undefined
      ? Boolean(raw.includeHolidays)
      : isPermanent
      ? false
      : true;

  const includeMoonPhases =
    raw.includeMoonPhases !== undefined
      ? Boolean(raw.includeMoonPhases)
      : hasType('moon');

  const includeQuotes =
    raw.includeQuotes !== undefined
      ? Boolean(raw.includeQuotes)
      : hasType('quote');

  const includeVerses =
    raw.includeVerses !== undefined
      ? Boolean(raw.includeVerses)
      : (hasType('verse') || projectType === 'devotional' || true);

  const parsedYear = toFiniteNumber(raw.year, new Date().getFullYear() + 1);
  const startMonth = toFiniteNumber(raw.startMonth, 0);
  const durationMonths = toFiniteNumber(raw.durationMonths, 12);
  const pageCount =
    raw.pageCount !== undefined && raw.pageCount !== null && raw.pageCount !== ''
      ? Math.max(1, toFiniteNumber(raw.pageCount, 365))
      : undefined;

  const normalized: AgendaConfig = {
    ...raw,
    schemaVersion: CURRENT_PROJECT_SCHEMA_VERSION,
    name: typeof raw.name === 'string' && raw.name.trim() ? raw.name : 'Projeto Importado',
    projectType,
    isPermanent,
    year: parsedYear,
    pageCount,
    startMonth,
    durationMonths,
    layoutType,
    pageSize,
    customPageSize,
    orientation,
    includeHolidays,
    municipalHolidays: Array.isArray(raw.municipalHolidays) ? raw.municipalHolidays : [],
    includeMoonPhases,
    includeQuotes,
    includeVerses,
    mirrorEvenPages,
    mirrorContentOnVerso,
    customVerso,
    versoAdvancesSequence,
    startMonthOnRightPage,
    includeMonthlyDividers,
    includeMonthlyIntroPages,
    fillerPageContent: raw.fillerPageContent || 'blank',
    fillerPageElements,
    fillerPageBackground,
    monthlyDividerVersoContent: raw.monthlyDividerVersoContent || 'blank',
    monthlyDividerStyle,
    disableSequenceSkip: Boolean(raw.disableSequenceSkip),
    splitWeekendAcrossMonths:
      raw.splitWeekendAcrossMonths !== undefined ? Boolean(raw.splitWeekendAcrossMonths) : true,
    margins,
    initialMargins,
    bindingMargins,
    background,
    backgrounds,
    backgroundRules,
    styles,
    specialDates: Array.isArray(raw.specialDates) ? raw.specialDates : [],
    showSpecialDateBadges:
      raw.showSpecialDateBadges !== undefined ? Boolean(raw.showSpecialDateBadges) : true,
    specialDateBadgePosition: raw.specialDateBadgePosition || 'top',
    elements,
    elementsVerso,
    elementsSaturday,
    elementsSunday,
    elementsWeekendTransition,
    elementsTop,
    elementsBottom,
    elementsWeeklyLeft,
    elementsWeeklyRight,
    elementsWeeklyVersoLeft,
    elementsWeeklyVersoRight,
    introPages,
    monthlyIntroPages,
    cover,
  };

  return normalized;
};

export const migrateCustomTemplatesArray = (items: any[]): CustomTemplateItem[] => {
  if (!Array.isArray(items)) return [];
  const valid: CustomTemplateItem[] = [];

  for (const item of items) {
    if (!item || typeof item !== 'object') continue;
    const hasElements =
      Array.isArray(item.elements) ||
      Array.isArray(item.elementsWeeklyLeft) ||
      Array.isArray(item.elementsWeeklyRight) ||
      Array.isArray(item.elementsVerso) ||
      Array.isArray(item.elementsTop);

    if (!item.name && !hasElements) continue;

    const isMiolo =
      item.templateType === 'miolo' ||
      (item.id && String(item.id).startsWith('miolo-')) ||
      Array.isArray(item.elementsWeeklyLeft) ||
      Array.isArray(item.elementsWeeklyRight) ||
      Boolean(item.layoutType);

    const clonedNormalized = (arr?: any[]) =>
      Array.isArray(arr) ? arr.map((el, i) => normalizeLayoutElement(el, i)) : undefined;

    valid.push({
      id:
        typeof item.id === 'string' && item.id.trim()
          ? item.id
          : (isMiolo ? 'miolo-' : 'custom-') + Math.random().toString(36).substring(2, 11),
      name: typeof item.name === 'string' && item.name.trim() ? item.name.trim() : 'Modelo Importado',
      templateType: item.templateType || (isMiolo ? 'miolo' : 'page'),
      layoutType: item.layoutType,
      projectType: item.projectType,
      isPermanent: Boolean(item.isPermanent),
      elements: clonedNormalized(item.elements) || [],
      elementsVerso: clonedNormalized(item.elementsVerso),
      elementsWeeklyLeft: clonedNormalized(item.elementsWeeklyLeft),
      elementsWeeklyRight: clonedNormalized(item.elementsWeeklyRight),
      elementsWeeklyVersoLeft: clonedNormalized(item.elementsWeeklyVersoLeft),
      elementsWeeklyVersoRight: clonedNormalized(item.elementsWeeklyVersoRight),
      elementsTop: clonedNormalized(item.elementsTop),
      elementsBottom: clonedNormalized(item.elementsBottom),
      elementsSaturday: clonedNormalized(item.elementsSaturday),
      elementsSunday: clonedNormalized(item.elementsSunday),
      elementsWeekendTransition: clonedNormalized(item.elementsWeekendTransition),
      weekendTransitionContentType: item.weekendTransitionContentType,
      customVerso: typeof item.customVerso === 'boolean' ? item.customVerso : undefined,
      background: item.background ? normalizeBackgroundConfig(item.background) : undefined,
      fillerPageContent: item.fillerPageContent,
      fillerPageElements: clonedNormalized(item.fillerPageElements),
      fillerPageBackground: item.fillerPageBackground ? normalizeBackgroundConfig(item.fillerPageBackground) : undefined,
      createdAt: item.createdAt || new Date().toISOString(),
    });
  }

  return valid;
};
