/**
 * pdfExtractor.ts
 * Motor de alta precisão para extração e conversão de PDF para elementos 100% editáveis no Agenda Master.
 * 
 * Princípios de Engenharia:
 * 1. Precisão geométrica de subpixel via viewport.convertToViewportPoint do PDF.js, respeitando MediaBox, CropBox e rotações.
 * 2. Unificação inteligente de textos sem duplicação de espaços ou quebra de palavras/sílabas (elimina o erro "S  e  m  b  r  o").
 * 3. Detecção precisa de formas vetoriais: retângulos preenchidos, tarjas de cabeçalho, molduras, linhas de pauta e divisores.
 * 4. Captura real de cores de preenchimento (RGB/CMYK) e contorno para que o usuário possa editar livremente cores no Agenda Master.
 * 5. Sem duplicação de fundo: os elementos do layout são importados diretamente como objetos nativos, sem uma imagem de fundo estática com texto por baixo que embole as informações.
 */

import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.js?url';
import { LayoutElement, ElementType } from '../../types';

let blobWorkerUrl: string | null = null;

// Inicialização segura do Worker do PDF.js
export const setupPdfWorker = () => {
  if (typeof window === 'undefined') return;
  if (blobWorkerUrl) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = blobWorkerUrl;
    return;
  }

  try {
    if (pdfWorkerUrl) {
      const targetUrl = pdfWorkerUrl.startsWith('http')
        ? pdfWorkerUrl
        : (pdfWorkerUrl.startsWith('/')
            ? `${window.location.origin}${pdfWorkerUrl}`
            : `${window.location.origin}/${pdfWorkerUrl.replace(/^\.\//, '')}`);

      try {
        const blob = new Blob([`importScripts(${JSON.stringify(targetUrl)});`], { type: 'application/javascript' });
        blobWorkerUrl = URL.createObjectURL(blob);
        pdfjsLib.GlobalWorkerOptions.workerSrc = blobWorkerUrl;
      } catch {
        pdfjsLib.GlobalWorkerOptions.workerSrc = targetUrl;
      }
    } else {
      pdfjsLib.GlobalWorkerOptions.workerSrc = `${window.location.origin}/pdf.worker.min.js`;
    }
  } catch (err) {
    console.warn('[setupPdfWorker] Erro ao inicializar worker do PDF:', err);
    pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl || '/pdf.worker.min.js';
  }
};

setupPdfWorker();

export interface ExtractedTextItem {
  id: string;
  type: 'text';
  text: string;
  x: number; // pixels na tela web (0 a viewport.width)
  y: number; // pixels na tela web (0 a viewport.height)
  width: number;
  height: number;
  fontSize: number; // tamanho real em pontos (pt)
  fontFamily: string;
  fontWeight?: string;
  fontStyle?: 'normal' | 'italic';
  color: string;
  textAlign?: 'left' | 'center' | 'right';
}

export interface ExtractedImageItem {
  id: string;
  type: 'image';
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ExtractedShapeItem {
  id: string;
  type: 'box' | 'circle' | 'lines';
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  backgroundColor: string;
  borderColor: string;
  borderWidth: number;
  borderStyle?: 'solid' | 'dashed' | 'dotted';
  borderRadius: number;
  opacity?: number;
  isLine?: boolean;
}

export interface PdfPageExtractionResult {
  pageNumber: number;
  totalPages: number;
  viewport: {
    width: number;
    height: number;
    widthMm: number;
    heightMm: number;
  };
  texts: ExtractedTextItem[];
  images: ExtractedImageItem[];
  shapes: ExtractedShapeItem[];
  elements: LayoutElement[];
  backgroundDataUrl?: string; // Opcional de apoio se o usuário solicitar explicitamente arte de fundo
}

export interface PdfExtractionOptions {
  pageNumber?: number;
  groupTextLines?: boolean;
  extractImages?: boolean;
  extractShapes?: boolean;
  renderBackgroundCanvas?: boolean;
  textColorDefault?: string;
  applyTextWhiteout?: boolean; // Máscara automática de cobertura para eliminar duplicidade de texto sobre fundos
  autoDetectDynamicVariables?: boolean; // Converte automaticamente dias, meses, anos e datas do PDF em variáveis dinâmicas da agenda
}

export interface DetectedDynamicClassification {
  type: ElementType;
  name: string;
  variant?: string;
  nameFormat?: 'full' | 'no_feira' | 'short' | 'two_letters' | 'initial' | 'ordinal_full' | 'ordinal_short' | string;
  dateTemplate?: string;
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize' | 'sentence';
  dayIndex?: number;
  weekdayValue?: number;
  monthValue?: number;
}

const detectStringCaseTransform = (raw: string): 'none' | 'uppercase' | 'lowercase' => {
  const letters = (raw.match(/[a-zA-ZÀ-ÿ]/g) || []).join('');
  if (letters.length >= 2) {
    if (letters === letters.toUpperCase()) return 'uppercase';
    if (letters === letters.toLowerCase()) return 'lowercase';
  }
  return 'none';
};

const matchIsolatedWeekday = (raw: string): { matched: boolean; nameFormat: string; weekdayIndex: number } | null => {
  const clean = raw.trim().replace(/^[•·\-–—|(\[]+|[•·\-–—|)\].:;]+$/g, '').trim();
  if (!clean) return null;

  const lower = clean.toLowerCase();

  // Completo com -feira
  const fullMap: Record<string, number> = {
    'domingo': 0,
    'segunda-feira': 1, 'segunda feira': 1,
    'terça-feira': 2, 'terca-feira': 2, 'terça feira': 2, 'terca feira': 2,
    'quarta-feira': 3, 'quarta feira': 3,
    'quinta-feira': 4, 'quinta feira': 4,
    'sexta-feira': 5, 'sexta feira': 5,
    'sábado': 6, 'sabado': 6,
  };
  if (lower in fullMap) {
    return { matched: true, nameFormat: 'full', weekdayIndex: fullMap[lower] };
  }

  // Sem -feira
  const noFeiraMap: Record<string, number> = {
    'segunda': 1,
    'terça': 2, 'terca': 2,
    'quarta': 3,
    'quinta': 4,
    'sexta': 5,
  };
  if (lower in noFeiraMap) {
    return { matched: true, nameFormat: 'no_feira', weekdayIndex: noFeiraMap[lower] };
  }

  // 3 letras (Dom, Seg, Ter, Qua, Qui, Sex, Sáb)
  const shortMap: Record<string, number> = {
    'dom': 0,
    'seg': 1,
    'ter': 2,
    'qua': 3,
    'qui': 4,
    'sex': 5,
    'sáb': 6, 'sab': 6,
  };
  if (lower in shortMap) {
    return { matched: true, nameFormat: 'short', weekdayIndex: shortMap[lower] };
  }

  // Ordinal completo (2ª-feira, 3ª feira...)
  const ordFullMatch = lower.match(/^([2-6])[ªa°º](-|\s)?feira$/);
  if (ordFullMatch) {
    return { matched: true, nameFormat: 'ordinal_full', weekdayIndex: parseInt(ordFullMatch[1], 10) - 1 };
  }

  // Ordinal curto (2ª, 3ª...)
  const ordShortMatch = lower.match(/^([2-6])[ªa°º]$/);
  if (ordShortMatch) {
    return { matched: true, nameFormat: 'ordinal_short', weekdayIndex: parseInt(ordShortMatch[1], 10) - 1 };
  }

  return null;
};

const matchIsolatedMonth = (raw: string): { matched: boolean; nameFormat: 'full' | 'short'; monthIndex: number } | null => {
  const clean = raw.trim().replace(/^[•·\-–—|(\[]+|[•·\-–—|)\].:;]+$/g, '').trim();
  if (!clean) return null;

  const lower = clean.toLowerCase();

  const fullMonths: Record<string, number> = {
    'janeiro': 0,
    'fevereiro': 1,
    'março': 2, 'marco': 2,
    'abril': 3,
    'maio': 4,
    'junho': 5,
    'julho': 6,
    'agosto': 7,
    'setembro': 8,
    'outubro': 9,
    'novembro': 10,
    'dezembro': 11,
  };
  if (lower in fullMonths) {
    return { matched: true, nameFormat: 'full', monthIndex: fullMonths[lower] };
  }

  const shortMonths: Record<string, number> = {
    'jan': 0,
    'fev': 1,
    'mar': 2,
    'abr': 3,
    'mai': 4,
    'jun': 5,
    'jul': 6,
    'ago': 7,
    'set': 8,
    'out': 9,
    'nov': 10,
    'dez': 11,
  };
  if (lower in shortMonths) {
    return { matched: true, nameFormat: 'short', monthIndex: shortMonths[lower] };
  }

  return null;
};

/**
 * Detecta se uma string isolada representa um padrão de variável dinâmica (Dia da Semana, Mês, Ano ou Data Composta).
 * Números puros (01..31) são validados em nível de página para evitar falsos positivos com horários ou mini-calendários.
 */
export const detectSingleTextDynamicPattern = (rawText: string): DetectedDynamicClassification | null => {
  const trimmed = (rawText || '').trim();
  if (!trimmed || trimmed.length > 48) return null;

  const textTransform = detectStringCaseTransform(trimmed);

  // 1. Placeholders explícitos ex: {{DD}}, {{MES}}, {{DATA}}
  if (/\{\{.*?\}\}/.test(trimmed)) {
    return {
      type: 'date_placeholder',
      name: `Data Dinâmica (${trimmed})`,
      variant: 'custom_template',
      dateTemplate: trimmed,
      textTransform,
    };
  }

  // 2. Dia da Semana isolado (ex: "SEGUNDA-FEIRA", "Quarta", "DOM")
  const wk = matchIsolatedWeekday(trimmed);
  if (wk) {
    return {
      type: 'day_name',
      name: `Dia da Semana (${trimmed})`,
      nameFormat: wk.nameFormat,
      textTransform,
      weekdayValue: wk.weekdayIndex,
    };
  }

  // 3. Mês isolado (ex: "JANEIRO", "Fevereiro", "OUT")
  const mo = matchIsolatedMonth(trimmed);
  if (mo) {
    return {
      type: 'month_name',
      name: `Mês (${trimmed})`,
      nameFormat: mo.nameFormat,
      textTransform,
      monthValue: mo.monthIndex,
    };
  }

  // 4. Ano isolado (ex: "2025", "2026", "2027")
  if (/^(202[4-9]|203[0-6])$/.test(trimmed)) {
    return {
      type: 'year',
      name: `Ano (${trimmed})`,
      textTransform: 'none',
    };
  }

  // 5. Datas Compostas: Dia da Semana + Dia + Mês (+ Ano opcional)
  // Ex: "Segunda-feira, 01 de Janeiro" ou "DOMINGO | 15 DE MARÇO DE 2026"
  const wkDayMonthMatch = trimmed.match(
    /^([a-zA-ZÀ-ÿ2-6ªº-]+)\.?(\s*[,|•·/-]\s*|\s+)(0?[1-9]|[12]\d|3[01])(\s+de\s+|\s*[/|•·-]\s*|\s+)([a-zA-ZÀ-ÿ]+)\.?(?:(\s+de\s+|\s*[/|•·-]\s*|\s+)(202\d|203\d))?$/i
  );
  if (wkDayMonthMatch) {
    const [, wkPart, sep1, , sep2, moPart, sep3, yrPart] = wkDayMonthMatch;
    const wkInfo = matchIsolatedWeekday(wkPart);
    const moInfo = matchIsolatedMonth(moPart);
    if (wkInfo && moInfo) {
      const wkTag = wkInfo.nameFormat === 'short'
        ? '{{DIA_SEMANA_CURTO}}'
        : wkInfo.nameFormat === 'no_feira'
          ? '{{DIA_SEMANA_SEM_FEIRA}}'
          : '{{DIA_SEMANA}}';
      const moTag = moInfo.nameFormat === 'short' ? '{{MMM}}' : '{{MMMM}}';
      const normSep2 = /de/i.test(sep2) ? ' de ' : sep2;
      const normSep3 = yrPart ? (/de/i.test(sep3 || '') ? ' de ' : (sep3 || ' ')) : '';
      const tpl = `${wkTag}${sep1}{{DD}}${normSep2}${moTag}${yrPart ? `${normSep3}{{YYYY}}` : ''}`;
      return {
        type: 'date_placeholder',
        name: `Data Completa (${trimmed.substring(0, 22)})`,
        variant: 'custom_template',
        dateTemplate: tpl,
        textTransform,
        weekdayValue: wkInfo.weekdayIndex,
        monthValue: moInfo.monthIndex,
      };
    }
  }

  // 6. Datas Compostas: Dia + Mês (+ Ano opcional)
  // Ex: "01 de Janeiro", "15 DE OUTUBRO", "01 / JANEIRO", "01 de Janeiro de 2026"
  const dayMonthMatch = trimmed.match(
    /^(0?[1-9]|[12]\d|3[01])(\s+de\s+|\s*[/|•·-]\s*|\s+)([a-zA-ZÀ-ÿ]+)\.?(?:(\s+de\s+|\s*[/|•·-]\s*|\s+)(202\d|203\d))?$/i
  );
  if (dayMonthMatch) {
    const [, , sep1, moPart, sep2, yrPart] = dayMonthMatch;
    const moInfo = matchIsolatedMonth(moPart);
    if (moInfo) {
      const moTag = moInfo.nameFormat === 'short' ? '{{MMM}}' : '{{MMMM}}';
      const normSep1 = /de/i.test(sep1) ? ' de ' : sep1;
      const normSep2 = yrPart ? (/de/i.test(sep2 || '') ? ' de ' : (sep2 || ' ')) : '';
      const tpl = `{{DD}}${normSep1}${moTag}${yrPart ? `${normSep2}{{YYYY}}` : ''}`;
      return {
        type: 'date_placeholder',
        name: `Data: Dia + Mês (${trimmed})`,
        variant: 'custom_template',
        dateTemplate: tpl,
        textTransform,
        monthValue: moInfo.monthIndex,
      };
    }
  }

  // 7. Datas Compostas: Mês + Ano
  // Ex: "JANEIRO 2026", "JANEIRO / 2026", "Janeiro de 2026", "JAN | 2026"
  const monthYearMatch = trimmed.match(
    /^([a-zA-ZÀ-ÿ]+)\.?(\s+de\s+|\s*[/|•·-]\s*|\s+)(202[4-9]|203[0-6])$/i
  );
  if (monthYearMatch) {
    const [, moPart, sep1] = monthYearMatch;
    const moInfo = matchIsolatedMonth(moPart);
    if (moInfo) {
      const moTag = moInfo.nameFormat === 'short' ? '{{MMM}}' : '{{MMMM}}';
      const normSep = /de/i.test(sep1) ? ' de ' : sep1;
      const tpl = `${moTag}${normSep}{{YYYY}}`;
      return {
        type: 'date_placeholder',
        name: `Mês e Ano (${trimmed})`,
        variant: 'custom_template',
        dateTemplate: tpl,
        textTransform,
        monthValue: moInfo.monthIndex,
      };
    }
  }

  // 8. Datas Compostas: Dia + Dia da Semana (ou Dia da Semana + Dia)
  // Ex: "01 | SEGUNDA-FEIRA", "01 • DOMINGO", "SEGUNDA | 01"
  const dayWkMatch = trimmed.match(/^(0?[1-9]|[12]\d|3[01])(\s*[,|•·/-]\s*|\s+)([a-zA-ZÀ-ÿ2-6ªº-]+)\.?$/i);
  if (dayWkMatch) {
    const [, , sep, wkPart] = dayWkMatch;
    const wkInfo = matchIsolatedWeekday(wkPart);
    if (wkInfo) {
      const wkTag = wkInfo.nameFormat === 'short'
        ? '{{DIA_SEMANA_CURTO}}'
        : wkInfo.nameFormat === 'no_feira'
          ? '{{DIA_SEMANA_SEM_FEIRA}}'
          : '{{DIA_SEMANA}}';
      return {
        type: 'date_placeholder',
        name: `Dia + Semana (${trimmed})`,
        variant: 'custom_template',
        dateTemplate: `{{DD}}${sep}${wkTag}`,
        textTransform,
        weekdayValue: wkInfo.weekdayIndex,
      };
    }
  }

  const wkDayMatch = trimmed.match(/^([a-zA-ZÀ-ÿ2-6ªº-]+)\.?(\s*[,|•·/-]\s*|\s+)(0?[1-9]|[12]\d|3[01])$/i);
  if (wkDayMatch) {
    const [, wkPart, sep] = wkDayMatch;
    const wkInfo = matchIsolatedWeekday(wkPart);
    if (wkInfo) {
      const wkTag = wkInfo.nameFormat === 'short'
        ? '{{DIA_SEMANA_CURTO}}'
        : wkInfo.nameFormat === 'no_feira'
          ? '{{DIA_SEMANA_SEM_FEIRA}}'
          : '{{DIA_SEMANA}}';
      return {
        type: 'date_placeholder',
        name: `Semana + Dia (${trimmed})`,
        variant: 'custom_template',
        dateTemplate: `${wkTag}${sep}{{DD}}`,
        textTransform,
        weekdayValue: wkInfo.weekdayIndex,
      };
    }
  }

  // 9. Data Numérica Completa: DD/MM/YYYY ou DD.MM.YYYY
  const numericFullMatch = trimmed.match(/^(0?[1-9]|[12]\d|3[01])([/.-])(0?[1-9]|1[0-2])\2(202[4-9]|203[0-6])$/);
  if (numericFullMatch) {
    const sep = numericFullMatch[2];
    return {
      type: 'date_placeholder',
      name: `Data Numérica (${trimmed})`,
      variant: sep === '/' ? 'numeric_full' : 'custom_template',
      dateTemplate: `{{DD}}${sep}{{MM}}${sep}{{YYYY}}`,
      textTransform: 'none',
    };
  }

  return null;
};

/**
 * Classifica todos os textos de uma página de PDF em elementos dinâmicos da agenda ou textos estáticos,
 * considerando o contexto da página inteira (evitando falsos positivos em horários de pauta, mini-calendários e calendários anuais)
 * e comparação opcional com uma segunda página do PDF.
 */
export const classifyExtractedTextsAsDynamic = (
  texts: ExtractedTextItem[],
  viewport: { width: number; height: number },
  otherPageTexts?: ExtractedTextItem[]
): Map<string, DetectedDynamicClassification> => {
  const result = new Map<string, DetectedDynamicClassification>();
  if (!texts || texts.length === 0) return result;

  // Calcula tamanho médio/mediano de fonte da página
  const sortedFontSizes = texts.map(t => t.fontSize).sort((a, b) => a - b);
  const medianFontSize = sortedFontSizes[Math.floor(sortedFontSizes.length / 2)] || 10;

  // Passo 1: Classificação preliminar de padrões textuais (Dias da Semana, Meses, Anos, Datas Compostas)
  for (const txt of texts) {
    const detected = detectSingleTextDynamicPattern(txt.text);
    if (detected) {
      result.set(txt.id, detected);
    }
  }

  // Passo 2: Proteção contra Calendário Anual (se houver >= 3 meses distintos na mesma página, não converter meses individuais em variável dinâmica única)
  const detectedMonths = new Set<number>();
  for (const [, cls] of result.entries()) {
    if (cls.type === 'month_name' && cls.monthValue !== undefined) {
      detectedMonths.add(cls.monthValue);
    }
  }
  if (detectedMonths.size >= 3) {
    for (const [id, cls] of Array.from(result.entries())) {
      if (cls.type === 'month_name') {
        result.delete(id);
      }
    }
  }

  // Passo 3: Proteção contra cabeçalho de Mini-Calendário (ex: Dom Seg Ter Qua Qui Sex Sab pequenos na mesma linha)
  const dayNameItems = texts.filter(t => result.get(t.id)?.type === 'day_name');
  for (const item of dayNameItems) {
    const sameRowWeekdays = dayNameItems.filter(other => Math.abs(other.y - item.y) <= 5);
    if (sameRowWeekdays.length >= 5 && item.fontSize <= 10.5) {
      const minX = Math.min(...sameRowWeekdays.map(o => o.x));
      const maxX = Math.max(...sameRowWeekdays.map(o => o.x + o.width));
      // Se 5+ dias cabem em menos de 48% da largura da página, é cabeçalho de mini-calendário
      if (maxX - minX < viewport.width * 0.48) {
        result.delete(item.id);
      }
    }
  }

  // Passo 4: Detecção inteligente de Número do Dia (day_number: 01 a 31)
  // Filtra apenas textos numéricos puros de 1 a 31
  const candidateNumbers = texts.filter(t => {
    if (result.has(t.id)) return false;
    const clean = t.text.trim();
    return /^(0?[1-9]|[12]\d|3[01])$/.test(clean);
  });

  // Textos que parecem horários na página (para identificar colunas de pauta de horários)
  const hourLikeTexts = texts.filter(t => /^(\d{1,2})([:h]\d{0,2})?$/i.test(t.text.trim()));

  for (const numItem of candidateNumbers) {
    // Regra A: Ignorar se faz parte de uma coluna vertical de horários/números (>= 3 números alinhados no mesmo X)
    const verticallyAligned = hourLikeTexts.filter(
      other => other.id !== numItem.id && Math.abs(other.x - numItem.x) <= 15 && Math.abs(other.fontSize - numItem.fontSize) <= 2.5
    );
    if (verticallyAligned.length >= 3) continue;

    // Regra B: Ignorar se há sufixo de hora ("h", ":00", "00", "30") imediatamente à direita na mesma linha
    const hasHourSuffix = texts.some(
      other =>
        other.id !== numItem.id &&
        Math.abs(other.y - numItem.y) <= 6 &&
        other.x >= numItem.x &&
        other.x - (numItem.x + numItem.width) <= 18 &&
        /^(h|hs|hr|hrs|:00|:30|00|30|am|pm)$/i.test(other.text.trim())
    );
    if (hasHourSuffix) continue;

    // Regra C: Ignorar se faz parte da grade de números de um Mini-Calendário (>= 5 números pequenos próximos)
    const nearbySmallNumbers = candidateNumbers.filter(
      other =>
        other.id !== numItem.id &&
        Math.abs(other.fontSize - numItem.fontSize) <= 2.5 &&
        Math.hypot(other.x - numItem.x, other.y - numItem.y) <= 115
    );
    if (nearbySmallNumbers.length >= 5) continue;

    // Regra D: Sinais positivos para confirmar que é um Número do Dia (day_number):
    // Sinal 1: Comparação com outra página do mesmo PDF na mesma faixa Y mostra que o número mudou!
    let confirmedByMultiPageDiff = false;
    if (otherPageTexts && otherPageTexts.length > 0) {
      const matchingOtherPageNumber = otherPageTexts.find(
        other =>
          /^(0?[1-9]|[12]\d|3[01])$/.test(other.text.trim()) &&
          Math.abs(other.y - numItem.y) <= 8 &&
          Math.abs(other.fontSize - numItem.fontSize) <= 2.5 &&
          other.text.trim() !== numItem.text.trim()
      );
      if (matchingOtherPageNumber) {
        confirmedByMultiPageDiff = true;
      }
    }

    // Sinal 2: Está próximo a um Dia da Semana (day_name), Mês (month_name) ou Ano (year) já detectado
    const nearDetectedDateHeader = texts.some(other => {
      const otherCls = result.get(other.id);
      if (!otherCls || !['day_name', 'month_name', 'year', 'date_placeholder'].includes(otherCls.type)) return false;
      const dy = Math.abs(other.y - numItem.y);
      const dx = Math.abs(other.x - numItem.x);
      return dy <= 85 && dx <= viewport.width * 0.65;
    });

    // Sinal 3: Está no cabeçalho superior da página (top 30%) com fonte de destaque
    const isProminentHeaderNumber =
      numItem.y <= viewport.height * 0.30 &&
      (numItem.fontSize >= 14 || numItem.fontSize >= medianFontSize * 1.25);

    if (confirmedByMultiPageDiff || nearDetectedDateHeader || isProminentHeaderNumber) {
      result.set(numItem.id, {
        type: 'day_number',
        name: `Nº do Dia (${numItem.text.trim()})`,
        textTransform: 'none',
      });
    }
  }

  // Passo 5: Atribuição automática de sequência (dayIndex) quando há múltiplos dias na mesma página
  // (Ex: Layout 2 dias por página ou Planner Semanal)
  const sortByReadingOrder = (a: ExtractedTextItem, b: ExtractedTextItem) => {
    if (Math.abs(a.y - b.y) > 18) return a.y - b.y;
    return a.x - b.x;
  };

  const detectedDayNumbers = texts.filter(t => result.get(t.id)?.type === 'day_number').sort(sortByReadingOrder);
  if (detectedDayNumbers.length >= 2 && detectedDayNumbers.length <= 7) {
    detectedDayNumbers.forEach((item, idx) => {
      const cls = result.get(item.id);
      if (cls) {
        cls.dayIndex = idx;
        cls.name = `Nº do Dia ${idx + 1} (${item.text.trim()})`;
      }
    });
  }

  const detectedDayNames = texts.filter(t => result.get(t.id)?.type === 'day_name').sort(sortByReadingOrder);
  if (detectedDayNames.length >= 2 && detectedDayNames.length <= 7) {
    detectedDayNames.forEach((item, idx) => {
      const cls = result.get(item.id);
      if (cls) {
        cls.dayIndex = idx;
        cls.name = `Dia da Semana ${idx + 1} (${item.text.trim()})`;
      }
    });
  }

  const detectedDatePlaceholders = texts
    .filter(t => {
      const cls = result.get(t.id);
      return cls?.type === 'date_placeholder' && (cls.dateTemplate?.includes('{{DD}}') || cls.dateTemplate?.includes('{{DIA'));
    })
    .sort(sortByReadingOrder);

  if (detectedDatePlaceholders.length >= 2 && detectedDatePlaceholders.length <= 7) {
    detectedDatePlaceholders.forEach((item, idx) => {
      const cls = result.get(item.id);
      if (cls) {
        cls.dayIndex = idx;
      }
    });
  }

  return result;
};

/**
 * Converte um LayoutElement entre texto estático ('text') e qualquer tipo variável dinâmico da agenda,
 * preservando fonte, tamanho, cor, posição e o texto original do PDF.
 */
export const convertElementBetweenStaticAndDynamic = (
  el: LayoutElement,
  targetType: ElementType,
  options?: {
    variant?: string;
    nameFormat?: string;
    dateTemplate?: string;
  }
): LayoutElement => {
  const originalText = el.style?.originalPdfText || el.content || '';
  const detected = detectSingleTextDynamicPattern(originalText);
  const autoTransform = detectStringCaseTransform(originalText);

  if (targetType === 'text') {
    return {
      ...el,
      type: 'text',
      name: `Texto: ${(originalText || 'Texto').substring(0, 20).trim()}`,
      content: originalText || el.content || 'Texto',
      style: {
        ...el.style,
        originalPdfText: originalText || undefined,
      },
    };
  }

  const nextStyle = {
    ...el.style,
    originalPdfText: originalText || undefined,
    textTransform: el.style?.textTransform && el.style.textTransform !== 'none'
      ? el.style.textTransform
      : (autoTransform !== 'none' ? autoTransform : el.style?.textTransform),
  };

  if (targetType === 'day_number') {
    return {
      ...el,
      type: 'day_number',
      name: `Nº do Dia (${originalText || '01'})`,
      content: originalText || '01',
      style: nextStyle,
    };
  }

  if (targetType === 'day_name') {
    const fmt = options?.nameFormat || detected?.nameFormat || nextStyle.nameFormat || 'full';
    return {
      ...el,
      type: 'day_name',
      name: `Dia da Semana (${originalText || 'Segunda-feira'})`,
      content: originalText || 'Segunda-feira',
      style: {
        ...nextStyle,
        nameFormat: fmt,
      },
    };
  }

  if (targetType === 'month_name') {
    const fmt = options?.nameFormat || detected?.nameFormat || nextStyle.nameFormat || 'full';
    return {
      ...el,
      type: 'month_name',
      name: `Mês (${originalText || 'Janeiro'})`,
      content: originalText || 'Janeiro',
      style: {
        ...nextStyle,
        nameFormat: fmt,
      },
    };
  }

  if (targetType === 'month_number') {
    return {
      ...el,
      type: 'month_number',
      name: `Nº do Mês (${originalText || '01'})`,
      content: originalText || '01',
      style: nextStyle,
    };
  }

  if (targetType === 'year') {
    return {
      ...el,
      type: 'year',
      name: `Ano (${originalText || '2026'})`,
      content: originalText || '2026',
      style: nextStyle,
    };
  }

  if (targetType === 'date_placeholder') {
    const variant = options?.variant || detected?.variant || nextStyle.variant || 'custom_template';
    const tpl = options?.dateTemplate || detected?.dateTemplate || nextStyle.dateTemplate || '{{DD}} de {{MMMM}}';
    return {
      ...el,
      type: 'date_placeholder',
      name: `Data Dinâmica (${originalText || tpl})`,
      content: originalText || tpl,
      style: {
        ...nextStyle,
        variant,
        dateTemplate: tpl,
      },
    };
  }

  if (targetType === 'quote') {
    return {
      ...el,
      type: 'quote',
      name: 'Frase Motivacional do Dia',
      content: originalText || '"Frase Inspiradora"',
      style: nextStyle,
    };
  }

  if (targetType === 'verse') {
    return {
      ...el,
      type: 'verse',
      name: 'Versículo do Dia',
      content: originalText || '"Versículo Bíblico"',
      style: nextStyle,
    };
  }

  if (targetType === 'holiday') {
    return {
      ...el,
      type: 'holiday',
      name: 'Feriado do Dia',
      content: originalText || 'Feriado Nacional',
      style: nextStyle,
    };
  }

  return {
    ...el,
    type: targetType,
    style: nextStyle,
  };
};

/**
 * Reaplica (ou reverte para texto fixo) a detecção automática de variáveis dinâmicas
 * em uma lista de LayoutElements já extraídos na tela de pré-visualização.
 */
export const reapplyDynamicDetectionToElements = (
  elements: LayoutElement[],
  enableDynamic: boolean
): LayoutElement[] => {
  if (!enableDynamic) {
    return elements.map(el => {
      if (['day_number', 'day_name', 'month_name', 'month_number', 'year', 'date_placeholder'].includes(el.type)) {
        return convertElementBetweenStaticAndDynamic(el, 'text');
      }
      return el;
    });
  }

  const textCandidates: ExtractedTextItem[] = elements
    .filter(el => ['text', 'day_number', 'day_name', 'month_name', 'month_number', 'year', 'date_placeholder'].includes(el.type))
    .map(el => ({
      id: el.id,
      type: 'text' as const,
      text: el.style?.originalPdfText || el.content || '',
      x: (el.x / 100) * 595,
      y: (el.y / 100) * 842,
      width: (el.w / 100) * 595,
      height: (el.h / 100) * 842,
      fontSize: el.style?.fontSize || 12,
      fontFamily: el.style?.fontFamily || 'Inter',
      color: el.style?.color || '#1f2937',
    }));

  const classifications = classifyExtractedTextsAsDynamic(textCandidates, { width: 595, height: 842 });

  return elements.map(el => {
    const cls = classifications.get(el.id);
    if (!cls) return el;
    const converted = convertElementBetweenStaticAndDynamic(el, cls.type, {
      variant: cls.variant,
      nameFormat: cls.nameFormat,
      dateTemplate: cls.dateTemplate,
    });
    return {
      ...converted,
      name: cls.name,
      style: {
        ...converted.style,
        dayIndex: cls.dayIndex ?? converted.style.dayIndex,
      },
    };
  });
};

/**
 * Converte argumentos de cor do PDF.js para string hexadecimal #RRGGBB.
 */
export const parsePdfColor = (args: any): string | null => {
  if (!args) return null;
  if (Array.isArray(args) || args instanceof Uint8Array || (typeof Uint8ClampedArray !== 'undefined' && args instanceof Uint8ClampedArray)) {
    if (args.length >= 3) {
      const isNormalized = args[0] <= 1 && args[1] <= 1 && args[2] <= 1 && (args[0] > 0 || args[1] > 0 || args[2] > 0);
      const r = Math.max(0, Math.min(255, Math.round(isNormalized && args[0] < 1 ? args[0] * 255 : args[0])));
      const g = Math.max(0, Math.min(255, Math.round(isNormalized && args[1] < 1 ? args[1] * 255 : args[1])));
      const b = Math.max(0, Math.min(255, Math.round(isNormalized && args[2] < 1 ? args[2] * 255 : args[2])));
      return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    } else if (args.length === 1) {
      const v = args[0] <= 1 && args[0] >= 0 ? Math.round(args[0] * 255) : Math.round(args[0]);
      const hex = Math.max(0, Math.min(255, v)).toString(16).padStart(2, '0');
      return `#${hex}${hex}${hex}`;
    } else if (args.length === 4) {
      // CMYK -> RGB
      const c = args[0] <= 1 ? args[0] : args[0] / 100;
      const m = args[1] <= 1 ? args[1] : args[1] / 100;
      const y = args[2] <= 1 ? args[2] : args[2] / 100;
      const k = args[3] <= 1 ? args[3] : args[3] / 100;
      const r = Math.max(0, Math.min(255, Math.round(255 * (1 - c) * (1 - k))));
      const g = Math.max(0, Math.min(255, Math.round(255 * (1 - m) * (1 - k))));
      const b = Math.max(0, Math.min(255, Math.round(255 * (1 - y) * (1 - k))));
      return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }
  }
  if (typeof args === 'string') {
    if (args.startsWith('#')) return args;
    if (args.startsWith('rgb')) return args;
  }
  return null;
};

/**
 * Higieniza nomes de fontes de PDFs (CorelDraw, Canva, Illustrator).
 */
export const sanitizeFontName = (rawFont: string): { fontFamily: string; fontWeight?: string; fontStyle?: 'normal' | 'italic' } => {
  if (!rawFont) return { fontFamily: 'Inter', fontWeight: 'normal', fontStyle: 'normal' };
  
  let cleaned = rawFont.replace(/^[A-Z]{6}\+/, '').trim();
  
  const isBold = /bold|black|heavy|semibold|bld/i.test(cleaned);
  const isItalic = /italic|oblique|it/i.test(cleaned);
  
  cleaned = cleaned.replace(/-(Bold|Italic|Regular|Medium|Light|SemiBold|Black|Oblique|MT|PS)/gi, '').trim();

  const lower = cleaned.toLowerCase();
  let fontFamily = cleaned;
  if (lower.includes('arial')) fontFamily = 'Arial';
  else if (lower.includes('times')) fontFamily = 'Times New Roman';
  else if (lower.includes('courier')) fontFamily = 'Courier New';
  else if (lower.includes('helvetica')) fontFamily = 'Helvetica';
  else if (lower.includes('montserrat')) fontFamily = 'Montserrat';
  else if (lower.includes('inter')) fontFamily = 'Inter';
  else if (lower.includes('roboto')) fontFamily = 'Roboto';
  else if (lower.includes('playfair')) fontFamily = 'Playfair Display';
  else if (lower.includes('georgia')) fontFamily = 'Georgia';
  else if (lower.includes('poppins')) fontFamily = 'Poppins';
  else if (lower.includes('lato')) fontFamily = 'Lato';
  else if (lower.includes('bebas')) fontFamily = 'Bebas Neue';

  return {
    fontFamily,
    fontWeight: isBold ? 'bold' : 'normal',
    fontStyle: isItalic ? 'italic' : 'normal',
  };
};

/**
 * Multiplicação de matrizes afins 2D [a, b, c, d, e, f]
 */
function multiplyAffineMatrices(m1: number[], m2: number[]): number[] {
  return [
    m1[0] * m2[0] + m1[1] * m2[2],
    m1[0] * m2[1] + m1[1] * m2[3],
    m1[2] * m2[0] + m1[3] * m2[2],
    m1[2] * m2[1] + m1[3] * m2[3],
    m1[4] * m2[0] + m1[5] * m2[2] + m2[4],
    m1[4] * m2[1] + m1[5] * m2[3] + m2[5],
  ];
}

/**
 * Agrupa fragmentos de texto do PDF com precisão cirúrgica.
 * Evita o bug de espaçamento entre letras de títulos ("S  e  m  b  r  o")
 * e preserva a união de palavras que pertencem à mesma linha.
 */
function groupLineFragments(items: ExtractedTextItem[]): ExtractedTextItem[] {
  if (items.length <= 1) return items;

  // Ordena por posição Y (topo para base) e depois por posição X (esquerda para direita)
  const sorted = [...items].sort((a, b) => {
    const yDiff = a.y - b.y;
    // Se a diferença vertical for maior que 25% da altura da fonte, considera linhas diferentes
    if (Math.abs(yDiff) > Math.min(a.fontSize, b.fontSize) * 0.28) {
      return yDiff;
    }
    return a.x - b.x;
  });

  const grouped: ExtractedTextItem[] = [];
  let current: ExtractedTextItem | null = null;

  for (let i = 0; i < sorted.length; i++) {
    const item = sorted[i];

    if (!current) {
      current = { ...item };
      continue;
    }

    const avgFont = (current.fontSize + item.fontSize) / 2;
    const yDiff = Math.abs(current.y - item.y);
    const isSameLine = yDiff <= Math.max(2.5, avgFont * 0.26);

    const currentEnd = current.x + current.width;
    const xGap = item.x - currentEnd;

    // Regra de Adjacência:
    // - xGap < 0: sobreposição leve (kerning negativo) -> unir sem espaço
    // - xGap <= avgFont * 0.22: espaçamento intra-palavra (tracking de título) -> unir SEM espaço (elimina "S e m b r o")
    // - xGap > avgFont * 0.22 e <= avgFont * 1.8: espaço normal entre palavras -> unir com 1 espaço
    // - xGap > avgFont * 1.8: colunas ou blocos separados de texto -> não agrupar!
    if (isSameLine && xGap >= -3 && xGap <= avgFont * 1.8) {
      const needsSpace = xGap > avgFont * 0.22 && !current.text.endsWith(' ') && !item.text.startsWith(' ');
      current.text = current.text + (needsSpace ? ' ' : '') + item.text;
      
      const newEnd = Math.max(currentEnd, item.x + item.width);
      current.width = newEnd - current.x;
      current.height = Math.max(current.height, item.height);
      current.fontSize = Math.max(current.fontSize, item.fontSize);
    } else {
      grouped.push(current);
      current = { ...item };
    }
  }

  if (current) {
    grouped.push(current);
  }

  return grouped;
}

function getOptimizedCanvasDataUrl(canvas: HTMLCanvasElement, width: number, height: number): string {
  // Para imagens menores (ícones, logos), PNG mantém nitidez perfeita com tamanho diminuto
  if (width <= 250 && height <= 250) {
    return canvas.toDataURL('image/png');
  }
  // Para imagens médias ou grandes, WebP ou JPEG reduz em até 90% o consumo de memória RAM
  try {
    const webp = canvas.toDataURL('image/webp', 0.88);
    if (webp && webp.startsWith('data:image/webp')) return webp;
  } catch (e) {}
  try {
    const jpeg = canvas.toDataURL('image/jpeg', 0.88);
    if (jpeg && jpeg.startsWith('data:image/jpeg')) return jpeg;
  } catch (e) {}
  return canvas.toDataURL('image/png');
}

/**
 * Converte dados de imagem brutos do PDF para DataURL otimizada (WebP/JPEG/PNG)
 */
async function convertPdfImageToDataUrl(imageObj: any): Promise<string | null> {
  if (!imageObj) return null;

  try {
    const width = imageObj.width;
    const height = imageObj.height;
    if (!width || !height) return null;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    if (imageObj.bitmap || imageObj instanceof ImageBitmap || (typeof Image !== 'undefined' && imageObj instanceof Image)) {
      ctx.drawImage(imageObj.bitmap || imageObj, 0, 0);
      return getOptimizedCanvasDataUrl(canvas, width, height);
    }

    const data = imageObj.data;
    if (data && data.length > 0) {
      const imgData = ctx.createImageData(width, height);
      const totalPixels = width * height;

      if (data.length === totalPixels * 4) {
        imgData.data.set(data);
      } else if (data.length === totalPixels * 3) {
        let s = 0;
        let d = 0;
        const out = imgData.data;
        while (s < data.length) {
          out[d] = data[s];
          out[d + 1] = data[s + 1];
          out[d + 2] = data[s + 2];
          out[d + 3] = 255;
          s += 3;
          d += 4;
        }
      } else if (data.length === totalPixels) {
        let s = 0;
        let d = 0;
        const out = imgData.data;
        while (s < data.length) {
          const val = data[s];
          out[d] = val;
          out[d + 1] = val;
          out[d + 2] = val;
          out[d + 3] = 255;
          s += 1;
          d += 4;
        }
      }
      ctx.putImageData(imgData, 0, 0);
      return getOptimizedCanvasDataUrl(canvas, width, height);
    }
  } catch (err) {
    console.warn('[pdfExtractor] Erro ao extrair imagem bitmap de PDF:', err);
  }

  return null;
}

/**
 * Deduplica linhas que possuem as mesmas coordenadas dentro de tolerâncias mínimas
 */
function deduplicateLines(lines: ExtractedShapeItem[], isHorizontal: boolean): ExtractedShapeItem[] {
  const result: ExtractedShapeItem[] = [];
  for (const line of lines) {
    const duplicate = result.find(r => {
      if (isHorizontal) {
        return (
          Math.abs(r.y - line.y) <= 1.5 &&
          Math.abs(r.x - line.x) <= 2.5 &&
          Math.abs(r.width - line.width) <= 3.0
        );
      } else {
        return (
          Math.abs(r.x - line.x) <= 1.5 &&
          Math.abs(r.y - line.y) <= 2.5 &&
          Math.abs(r.height - line.height) <= 3.0
        );
      }
    });
    if (!duplicate) {
      result.push(line);
    }
  }
  return result;
}

/**
 * Unifica segmentos colineares de linhas (de tabelas e pautas) e remove ruídos invisíveis.
 * Converte centenas de fragmentos individuais de células em linhas contínuas únicas e eficientes.
 */
export function mergeAndOptimizeShapes(
  rawShapes: ExtractedShapeItem[],
  widthPt: number,
  heightPt: number
): ExtractedShapeItem[] {
  if (rawShapes.length <= 1) return rawShapes;

  // 1. Filtrar retângulos brancos sem borda e artefatos sub-pixel que sobrecarregam o DOM
  const nonFiltered = rawShapes.filter(s => {
    if (s.width < 0.4 && s.height < 0.4) return false;
    if (s.type === 'lines' || s.isLine) return true;
    const isWhite =
      s.backgroundColor.toLowerCase() === '#ffffff' ||
      s.backgroundColor.toLowerCase() === '#fff' ||
      s.backgroundColor === 'rgb(255, 255, 255)' ||
      s.backgroundColor === 'rgba(255, 255, 255, 1)';
    const hasNoBorder = !s.borderColor || s.borderColor === 'transparent' || !s.borderWidth || s.borderWidth <= 0;

    // Se for um bloco branco sem borda que é apenas preenchimento de célula de tabela
    if (isWhite && hasNoBorder && (s.width < widthPt * 0.45 || s.height < heightPt * 0.2)) {
      return false;
    }
    return true;
  });

  // 2. Separar em caixas, linhas horizontais e linhas verticais
  const boxes: ExtractedShapeItem[] = [];
  const rawHLines: ExtractedShapeItem[] = [];
  const rawVLines: ExtractedShapeItem[] = [];

  for (const s of nonFiltered) {
    if (s.type === 'lines' || s.isLine) {
      if (s.width >= s.height) {
        rawHLines.push({ ...s });
      } else {
        rawVLines.push({ ...s });
      }
    } else {
      boxes.push(s);
    }
  }

  // 3. Mesclagem Colinear de Linhas Horizontais (ex: linhas de tabelas particionadas por coluna)
  const mergedHLines: ExtractedShapeItem[] = [];
  // Agrupar por coordenada Y central (tolerância de até 2.0 pt para o mesmo nível de linha)
  const hLevelGroups: Array<{ y: number; lines: ExtractedShapeItem[] }> = [];
  for (const line of rawHLines) {
    let group = hLevelGroups.find(g => Math.abs(g.y - line.y) <= 2.0);
    if (!group) {
      group = { y: line.y, lines: [] };
      hLevelGroups.push(group);
    }
    group.lines.push(line);
  }

  for (const group of hLevelGroups) {
    // Subagrupar por compatibilidade de estilo e cor
    const styleGroups: ExtractedShapeItem[][] = [];
    for (const line of group.lines) {
      const match = styleGroups.find(sg => {
        const ref = sg[0];
        const sameStyle = (ref.borderStyle || 'solid') === (line.borderStyle || 'solid');
        const sameWidth = Math.abs((ref.borderWidth || 1) - (line.borderWidth || 1)) <= 1.0;
        const colorA = (ref.borderColor || '#374151').toLowerCase();
        const colorB = (line.borderColor || '#374151').toLowerCase();
        return sameStyle && sameWidth && colorA === colorB;
      });
      if (match) {
        match.push(line);
      } else {
        styleGroups.push([line]);
      }
    }

    for (const sg of styleGroups) {
      // Ordenar por X crescente
      sg.sort((a, b) => a.x - b.x);

      let current = { ...sg[0] };
      let curStart = current.x;
      let curEnd = current.x + current.width;

      for (let i = 1; i < sg.length; i++) {
        const next = sg[i];
        const nextStart = next.x;
        const nextEnd = next.x + next.width;

        // Se sobrepõe, encosta ou tem intervalo de até 4.0pt (espaço entre células)
        if (nextStart <= curEnd + 4.0) {
          curEnd = Math.max(curEnd, nextEnd);
          curStart = Math.min(curStart, nextStart);
          current.x = curStart;
          current.width = curEnd - curStart;
          current.y = (current.y + next.y) / 2;
          current.borderWidth = Math.max(current.borderWidth || 0.75, next.borderWidth || 0.75);
        } else {
          mergedHLines.push(current);
          current = { ...next };
          curStart = current.x;
          curEnd = current.x + current.width;
        }
      }
      mergedHLines.push(current);
    }
  }

  // 4. Mesclagem Colinear de Linhas Verticais (ex: divisórias de colunas de tabelas particionadas por linha)
  const mergedVLines: ExtractedShapeItem[] = [];
  // Agrupar por coordenada X central (tolerância de até 2.0 pt para a mesma coluna)
  const vLevelGroups: Array<{ x: number; lines: ExtractedShapeItem[] }> = [];
  for (const line of rawVLines) {
    let group = vLevelGroups.find(g => Math.abs(g.x - line.x) <= 2.0);
    if (!group) {
      group = { x: line.x, lines: [] };
      vLevelGroups.push(group);
    }
    group.lines.push(line);
  }

  for (const group of vLevelGroups) {
    const styleGroups: ExtractedShapeItem[][] = [];
    for (const line of group.lines) {
      const match = styleGroups.find(sg => {
        const ref = sg[0];
        const sameStyle = (ref.borderStyle || 'solid') === (line.borderStyle || 'solid');
        const sameWidth = Math.abs((ref.borderWidth || 1) - (line.borderWidth || 1)) <= 1.0;
        const colorA = (ref.borderColor || '#374151').toLowerCase();
        const colorB = (line.borderColor || '#374151').toLowerCase();
        return sameStyle && sameWidth && colorA === colorB;
      });
      if (match) {
        match.push(line);
      } else {
        styleGroups.push([line]);
      }
    }

    for (const sg of styleGroups) {
      // Ordenar por Y crescente
      sg.sort((a, b) => a.y - b.y);

      let current = { ...sg[0] };
      let curStart = current.y;
      let curEnd = current.y + current.height;

      for (let i = 1; i < sg.length; i++) {
        const next = sg[i];
        const nextStart = next.y;
        const nextEnd = next.y + next.height;

        // Se sobrepõe, encosta ou tem intervalo de até 4.0pt (espaço entre células)
        if (nextStart <= curEnd + 4.0) {
          curEnd = Math.max(curEnd, nextEnd);
          curStart = Math.min(curStart, nextStart);
          current.y = curStart;
          current.height = curEnd - curStart;
          current.x = (current.x + next.x) / 2;
          current.borderWidth = Math.max(current.borderWidth || 0.75, next.borderWidth || 0.75);
        } else {
          mergedVLines.push(current);
          current = { ...next };
          curStart = current.y;
          curEnd = current.y + current.height;
        }
      }
      mergedVLines.push(current);
    }
  }

  // 5. Alinhamento milimétrico inteligente para linhas pautadas ou grades de tabela
  if (mergedHLines.length >= 2) {
    const clusters: ExtractedShapeItem[][] = [];
    mergedHLines.forEach(line => {
      const matched = clusters.find(c => {
        const ref = c[0];
        return Math.abs(ref.x - line.x) <= 5 && Math.abs(ref.width - line.width) <= 8;
      });
      if (matched) {
        matched.push(line);
      } else {
        clusters.push([line]);
      }
    });

    clusters.forEach(cluster => {
      if (cluster.length >= 2) {
        const avgX = cluster.reduce((sum, l) => sum + l.x, 0) / cluster.length;
        const avgW = cluster.reduce((sum, l) => sum + l.width, 0) / cluster.length;
        cluster.forEach(l => {
          l.x = avgX;
          l.width = avgW;
        });
      }
    });
  }

  if (mergedVLines.length >= 2) {
    const clusters: ExtractedShapeItem[][] = [];
    mergedVLines.forEach(line => {
      const matched = clusters.find(c => {
        const ref = c[0];
        return Math.abs(ref.y - line.y) <= 5 && Math.abs(ref.height - line.height) <= 8;
      });
      if (matched) {
        matched.push(line);
      } else {
        clusters.push([line]);
      }
    });

    clusters.forEach(cluster => {
      if (cluster.length >= 2) {
        const avgY = cluster.reduce((sum, l) => sum + l.y, 0) / cluster.length;
        const avgH = cluster.reduce((sum, l) => sum + l.height, 0) / cluster.length;
        cluster.forEach(l => {
          l.y = avgY;
          l.height = avgH;
        });
      }
    });
  }

  // Deduplicação final por sobreposição idêntica de linhas
  const finalHLines = deduplicateLines(mergedHLines, true);
  const finalVLines = deduplicateLines(mergedVLines, false);

  // Deduplicação e mesclagem inteligente de caixas/blocos
  // Elimina caixas sobrepostas idênticas (ex: preenchimento e borda geradas como 2 objetos separados)
  const mergedBoxes: ExtractedShapeItem[] = [];
  for (const b of boxes) {
    const isBgTransparent = !b.backgroundColor || b.backgroundColor === 'transparent';
    const isBorderTransparent = !b.borderColor || b.borderColor === 'transparent' || !b.borderWidth || b.borderWidth <= 0;
    
    // Ignorar elementos 100% invisíveis
    if (isBgTransparent && isBorderTransparent) continue;

    const existing = mergedBoxes.find(m => 
      Math.abs(m.x - b.x) <= 2.0 &&
      Math.abs(m.y - b.y) <= 2.0 &&
      Math.abs(m.width - b.width) <= 3.0 &&
      Math.abs(m.height - b.height) <= 3.0
    );

    if (existing) {
      // Se existing não tinha borda válida mas b tem, transfere
      if ((!existing.borderColor || existing.borderColor === 'transparent' || !existing.borderWidth) && !isBorderTransparent) {
        existing.borderColor = b.borderColor;
        existing.borderWidth = b.borderWidth;
        existing.borderStyle = b.borderStyle || existing.borderStyle;
      }
      // Se existing não tinha fundo mas b tem, transfere
      if ((!existing.backgroundColor || existing.backgroundColor === 'transparent') && !isBgTransparent) {
        existing.backgroundColor = b.backgroundColor;
      }
    } else {
      mergedBoxes.push({ ...b });
    }
  }

  return [...mergedBoxes, ...finalHLines, ...finalVLines];
}

/**
 * Função principal: Extrai elementos reais e editáveis do PDF com coordenadas exatas.
 */
export async function extractPdfObjects(
  fileOrBuffer: File | ArrayBuffer | string,
  options: PdfExtractionOptions = {}
): Promise<PdfPageExtractionResult> {
  setupPdfWorker();

  const {
    pageNumber = 1,
    groupTextLines = true,
    extractImages = true,
    extractShapes = true,
    renderBackgroundCanvas = false,
    textColorDefault = '#1f2937',
    applyTextWhiteout = false,
    autoDetectDynamicVariables = true,
  } = options;

  let data: ArrayBuffer | string;
  if (fileOrBuffer instanceof File) {
    data = await fileOrBuffer.arrayBuffer();
  } else {
    data = fileOrBuffer;
  }

  const loadingTask = pdfjsLib.getDocument({
    data,
    cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/cmaps/',
    cMapPacked: true,
    standardFontDataUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/standard_fonts/',
  });

  const pdf = await loadingTask.promise;
  const totalPages = pdf.numPages;
  const validPageNum = Math.max(1, Math.min(pageNumber, totalPages));
  const page = await pdf.getPage(validPageNum);

  // 1. Viewport oficial do PDF.js (escala 1.0 = coordenadas padrão do documento em pt)
  const viewport = page.getViewport({ scale: 1.0 });
  const widthPt = viewport.width;
  const heightPt = viewport.height;
  const widthMm = (widthPt * 25.4) / 72;
  const heightMm = (heightPt * 25.4) / 72;

  // 2. Extração de Textos com Mapeamento Exato de Coordenadas
  const textContent = await page.getTextContent();
  const rawTexts: ExtractedTextItem[] = [];

  for (let idx = 0; idx < textContent.items.length; idx++) {
    const item = textContent.items[idx] as any;
    if (!item.str || item.str.trim() === '') continue;

    const transform = item.transform; // [a, b, c, d, tx, ty]
    const a = transform[0];
    const b = transform[1];
    const c = transform[2];
    const d = transform[3];
    const tx = transform[4];
    const ty = transform[5];

    // O tamanho da fonte no PDF é a magnitude do vetor vertical ou horizontal
    const fontSizePt = Math.max(7, Math.round(Math.abs(d) > 0.1 ? Math.abs(d) : Math.hypot(a, b) || item.height || 12));

    // Conversão matemática exata de coordenadas via viewport do PDF.js:
    // (tx, ty) é a baseline do texto no espaço do PDF
    const [screenX, screenBaselineY] = viewport.convertToViewportPoint(tx, ty);

    // O topo da caixa de texto no espaço web fica aproximadamente 80% do fontSize acima da linha de base
    const screenY = screenBaselineY - (fontSizePt * 0.82);

    // Largura em pixels web
    const screenW = Math.max(item.width || 8, fontSizePt * 0.55 * item.str.length);
    const screenH = fontSizePt * 1.22;

    const fontInfo = sanitizeFontName(item.fontName || '');

    rawTexts.push({
      id: `pdf-txt-${validPageNum}-${idx}`,
      type: 'text',
      text: item.str,
      x: screenX,
      y: screenY,
      width: screenW,
      height: screenH,
      fontSize: fontSizePt,
      fontFamily: fontInfo.fontFamily,
      fontWeight: fontInfo.fontWeight,
      fontStyle: fontInfo.fontStyle,
      color: textColorDefault,
    });
  }

  // Agrupamento inteligente para formar palavras e frases contínuas
  const texts = groupTextLines ? groupLineFragments(rawTexts) : rawTexts;

  // 3. Extração de Formas Vetoriais (Caixas, Retângulos, Molduras, Linhas de Pauta) e Imagens
  const images: ExtractedImageItem[] = [];
  let shapes: ExtractedShapeItem[] = [];

  if (extractImages || extractShapes) {
    try {
      const operatorList = await page.getOperatorList();
      const fnArray = operatorList.fnArray;
      const argsArray = operatorList.argsArray;

      let currentMatrix = [1, 0, 0, 1, 0, 0];
      const matrixStack: number[][] = [];

      interface GraphicsState {
        fillColor: string;
        strokeColor: string;
        lineWidth: number;
        opacity: number;
        borderStyle: 'solid' | 'dashed' | 'dotted';
      }

      let currentState: GraphicsState = {
        fillColor: '#000000',
        strokeColor: '#000000',
        lineWidth: 1,
        opacity: 1,
        borderStyle: 'solid',
      };
      const stateStack: GraphicsState[] = [];

      interface PendingSubPath {
        type: 'rect' | 'line' | 'roundedRect';
        pts: Array<{ x: number; y: number }>;
        matrix: number[];
        borderRadius?: number;
        lineWidth?: number;
        borderStyle?: 'solid' | 'dashed' | 'dotted';
      }
      let pendingSubPaths: PendingSubPath[] = [];
      let currentPathPts: Array<{ x: number; y: number }> = [];

      // Função auxiliar para transformar ponto (x,y) pelo CTM e pelo Viewport
      const transformPoint = (px: number, py: number, matrix: number[]) => {
        const pdfX = matrix[0] * px + matrix[2] * py + matrix[4];
        const pdfY = matrix[1] * px + matrix[3] * py + matrix[5];
        const [webX, webY] = viewport.convertToViewportPoint(pdfX, pdfY);
        return { x: webX, y: webY };
      };

      for (let i = 0; i < fnArray.length; i++) {
        const fn = fnArray[i];
        const args = argsArray[i];

        if (fn === pdfjsLib.OPS.save) {
          matrixStack.push([...currentMatrix]);
          stateStack.push({ ...currentState });
        } else if (fn === pdfjsLib.OPS.restore) {
          if (matrixStack.length > 0) currentMatrix = matrixStack.pop()!;
          if (stateStack.length > 0) currentState = stateStack.pop()!;
        } else if (fn === pdfjsLib.OPS.transform) {
          currentMatrix = multiplyAffineMatrices(currentMatrix, args);
        } else if (fn === pdfjsLib.OPS.setLineWidth) {
          currentState.lineWidth = Math.max(0.3, Number(args[0]) || 1);
        } else if (fn === pdfjsLib.OPS.setDash) {
          const dashArray = args[0];
          if (Array.isArray(dashArray) && dashArray.length > 0) {
            const dashLen = Number(dashArray[0]) || 0;
            currentState.borderStyle = dashLen <= 2 ? 'dotted' : 'dashed';
          } else {
            currentState.borderStyle = 'solid';
          }
        } else if (
          fn === pdfjsLib.OPS.setFillRGBColor ||
          fn === pdfjsLib.OPS.setFillGray ||
          fn === pdfjsLib.OPS.setFillCMYKColor ||
          fn === pdfjsLib.OPS.setFillColor ||
          fn === pdfjsLib.OPS.setFillColorN
        ) {
          const c = parsePdfColor(args);
          if (c) currentState.fillColor = c;
        } else if (
          fn === pdfjsLib.OPS.setStrokeRGBColor ||
          fn === pdfjsLib.OPS.setStrokeGray ||
          fn === pdfjsLib.OPS.setStrokeCMYKColor ||
          fn === pdfjsLib.OPS.setStrokeColor ||
          fn === pdfjsLib.OPS.setStrokeColorN
        ) {
          const c = parsePdfColor(args);
          if (c) currentState.strokeColor = c;
        } else if (fn === pdfjsLib.OPS.setGState) {
          if (Array.isArray(args[0])) {
            for (const item of args[0]) {
              if (Array.isArray(item)) {
                const [k, v] = item;
                if ((k === 'ca' || k === 'CA') && typeof v === 'number') {
                  currentState.opacity = v;
                }
                if (k === 'LW' && typeof v === 'number') {
                  currentState.lineWidth = Math.max(0.3, v);
                }
              }
            }
          }
        } else if (extractShapes && fn === pdfjsLib.OPS.moveTo) {
          if (currentPathPts.length >= 2) {
            pendingSubPaths.push({
              type: currentPathPts.length === 2 ? 'line' : 'rect',
              pts: [...currentPathPts],
              matrix: [...currentMatrix],
              lineWidth: currentState.lineWidth,
              borderStyle: currentState.borderStyle,
            });
          }
          currentPathPts = [{ x: args[0], y: args[1] }];
        } else if (extractShapes && fn === pdfjsLib.OPS.lineTo) {
          currentPathPts.push({ x: args[0], y: args[1] });
        } else if (extractShapes && fn === pdfjsLib.OPS.curveTo) {
          currentPathPts.push({ x: args[4], y: args[5] });
        } else if (extractShapes && (fn === pdfjsLib.OPS.curveTo2 || fn === pdfjsLib.OPS.curveTo3)) {
          currentPathPts.push({ x: args[2], y: args[3] });
        } else if (extractShapes && fn === pdfjsLib.OPS.closePath) {
          if (currentPathPts.length >= 2) {
            pendingSubPaths.push({
              type: currentPathPts.length === 2 ? 'line' : 'rect',
              pts: [...currentPathPts],
              matrix: [...currentMatrix],
              lineWidth: currentState.lineWidth,
              borderStyle: currentState.borderStyle,
            });
          }
          currentPathPts = [];
        } else if (extractShapes && fn === pdfjsLib.OPS.rectangle) {
          const [rx, ry, rw, rh] = args;
          pendingSubPaths.push({
            type: 'rect',
            pts: [
              { x: rx, y: ry },
              { x: rx + rw, y: ry },
              { x: rx + rw, y: ry + rh },
              { x: rx, y: ry + rh },
            ],
            matrix: [...currentMatrix],
            lineWidth: currentState.lineWidth,
            borderStyle: currentState.borderStyle,
          });
        } else if (extractShapes && fn === pdfjsLib.OPS.constructPath) {
          const [subOps, subArgs] = args;
          let j = 0;

          if (Array.isArray(subOps) && Array.isArray(subArgs)) {
            let cpPts: Array<{ x: number; y: number }> = [];

            for (let s = 0; s < subOps.length; s++) {
              const sop = subOps[s];
              if (sop === pdfjsLib.OPS.rectangle) {
                const rx = subArgs[j++];
                const ry = subArgs[j++];
                const rw = subArgs[j++];
                const rh = subArgs[j++];
                pendingSubPaths.push({
                  type: 'rect',
                  pts: [
                    { x: rx, y: ry },
                    { x: rx + rw, y: ry },
                    { x: rx + rw, y: ry + rh },
                    { x: rx, y: ry + rh },
                  ],
                  matrix: [...currentMatrix],
                  lineWidth: currentState.lineWidth,
                  borderStyle: currentState.borderStyle,
                });
              } else if (sop === pdfjsLib.OPS.moveTo) {
                if (cpPts.length >= 2) {
                  pendingSubPaths.push({
                    type: cpPts.length === 2 ? 'line' : 'rect',
                    pts: [...cpPts],
                    matrix: [...currentMatrix],
                    lineWidth: currentState.lineWidth,
                    borderStyle: currentState.borderStyle,
                  });
                }
                cpPts = [{ x: subArgs[j++], y: subArgs[j++] }];
              } else if (sop === pdfjsLib.OPS.lineTo) {
                cpPts.push({ x: subArgs[j++], y: subArgs[j++] });
              } else if (sop === pdfjsLib.OPS.curveTo) {
                j += 4;
                cpPts.push({ x: subArgs[j++], y: subArgs[j++] });
              } else if (sop === pdfjsLib.OPS.curveTo2 || sop === pdfjsLib.OPS.curveTo3) {
                j += 2;
                cpPts.push({ x: subArgs[j++], y: subArgs[j++] });
              } else if (sop === pdfjsLib.OPS.closePath) {
                if (cpPts.length >= 2) {
                  pendingSubPaths.push({
                    type: cpPts.length === 2 ? 'line' : 'rect',
                    pts: [...cpPts],
                    matrix: [...currentMatrix],
                    lineWidth: currentState.lineWidth,
                    borderStyle: currentState.borderStyle,
                  });
                }
                cpPts = [];
              }
            }

            if (cpPts.length >= 2) {
              pendingSubPaths.push({
                type: cpPts.length === 2 ? 'line' : 'rect',
                pts: [...cpPts],
                matrix: [...currentMatrix],
                lineWidth: currentState.lineWidth,
                borderStyle: currentState.borderStyle,
              });
            }
          }
        } else if (
          extractShapes &&
          (fn === pdfjsLib.OPS.fill ||
            fn === pdfjsLib.OPS.eoFill ||
            fn === pdfjsLib.OPS.stroke ||
            fn === pdfjsLib.OPS.closeStroke ||
            fn === pdfjsLib.OPS.fillStroke ||
            fn === pdfjsLib.OPS.eoFillStroke ||
            fn === pdfjsLib.OPS.closeFillStroke ||
            fn === pdfjsLib.OPS.closeEOFillStroke)
        ) {
          if (currentPathPts.length >= 2) {
            pendingSubPaths.push({
              type: currentPathPts.length === 2 ? 'line' : 'rect',
              pts: [...currentPathPts],
              matrix: [...currentMatrix],
              lineWidth: currentState.lineWidth,
              borderStyle: currentState.borderStyle,
            });
          }
          currentPathPts = [];

          const isFill =
            fn === pdfjsLib.OPS.fill ||
            fn === pdfjsLib.OPS.eoFill ||
            fn === pdfjsLib.OPS.fillStroke ||
            fn === pdfjsLib.OPS.eoFillStroke ||
            fn === pdfjsLib.OPS.closeFillStroke ||
            fn === pdfjsLib.OPS.closeEOFillStroke;

          const isStroke =
            fn === pdfjsLib.OPS.stroke ||
            fn === pdfjsLib.OPS.closeStroke ||
            fn === pdfjsLib.OPS.fillStroke ||
            fn === pdfjsLib.OPS.eoFillStroke ||
            fn === pdfjsLib.OPS.closeFillStroke ||
            fn === pdfjsLib.OPS.closeEOFillStroke;

          if (pendingSubPaths.length > 0) {
            for (const sp of pendingSubPaths) {
              if (sp.pts.length < 2) continue;

              const webPts = sp.pts.map(p => transformPoint(p.x, p.y, sp.matrix));
              const minX = Math.min(...webPts.map(p => p.x));
              const maxX = Math.max(...webPts.map(p => p.x));
              const minY = Math.min(...webPts.map(p => p.y));
              const maxY = Math.max(...webPts.map(p => p.y));

              const rawW = maxX - minX;
              const rawH = maxY - minY;

              const strokeWidth = isStroke ? Math.max(0.5, sp.lineWidth || currentState.lineWidth || 1) : 0;

              let isHorizontalLine = false;
              let isVerticalLine = false;

              if (sp.type === 'line' || sp.pts.length === 2) {
                if (rawW >= rawH) {
                  isHorizontalLine = true;
                } else {
                  isVerticalLine = true;
                }
              } else if (rawH <= 3 && rawW >= 4) {
                isHorizontalLine = true;
              } else if (rawW <= 3 && rawH >= 4) {
                isVerticalLine = true;
              }

              let shapeW = rawW;
              let shapeH = rawH;

              if (isHorizontalLine) {
                shapeH = Math.max(1, strokeWidth || 1);
              } else if (isVerticalLine) {
                shapeW = Math.max(1, strokeWidth || 1);
              }

              // Ignora ruídos microscópicos (< 1.5 pt)
              if (!isHorizontalLine && !isVerticalLine && shapeW < 1.5 && shapeH < 1.5) continue;
              if (isHorizontalLine && shapeW < 4) continue;
              if (isVerticalLine && shapeH < 4) continue;

              // Ignora retângulo 100% branco que cobre toda a página (o canvas já é branco)
              const isFullPage = shapeW >= widthPt * 0.96 && shapeH >= heightPt * 0.96;
              const isPureWhite =
                currentState.fillColor.toLowerCase() === '#ffffff' ||
                currentState.fillColor.toLowerCase() === '#fff';
              if (isFullPage && isFill && isPureWhite && !isStroke) {
                continue;
              }

              const fillColor = isFill ? currentState.fillColor : 'transparent';
              const strokeColor = isStroke ? currentState.strokeColor : 'transparent';
              const activeLineColor = strokeColor !== 'transparent' ? strokeColor : (fillColor !== 'transparent' ? fillColor : currentState.strokeColor || '#374151');

              const newShape: ExtractedShapeItem = {
                id: `pdf-shape-${validPageNum}-${shapes.length}`,
                type: (isHorizontalLine || isVerticalLine) ? 'lines' : 'box',
                name: isFullPage
                  ? 'Fundo da Página'
                  : isHorizontalLine
                  ? `Linha ${shapes.length + 1}`
                  : isVerticalLine
                  ? `Linha Vertical ${shapes.length + 1}`
                  : sp.borderRadius && sp.borderRadius > 1
                  ? `Bloco Arredondado ${shapes.length + 1}`
                  : isFill && isStroke
                  ? `Caixa / Bloco ${shapes.length + 1}`
                  : isFill
                  ? `Retângulo Preenchido ${shapes.length + 1}`
                  : `Moldura ${shapes.length + 1}`,
                x: isVerticalLine ? (minX + maxX) / 2 : minX,
                y: isHorizontalLine ? (minY + maxY) / 2 : minY,
                width: shapeW,
                height: shapeH,
                backgroundColor: (isHorizontalLine || isVerticalLine) ? 'transparent' : fillColor,
                borderColor: (isHorizontalLine || isVerticalLine) ? activeLineColor : strokeColor,
                borderWidth: (isHorizontalLine || isVerticalLine) ? Math.max(0.5, strokeWidth || 1) : strokeWidth,
                borderStyle: sp.borderStyle || currentState.borderStyle || 'solid',
                borderRadius: sp.borderRadius ? Math.round(sp.borderRadius) : 0,
                opacity: currentState.opacity < 1 ? currentState.opacity : undefined,
                isLine: isHorizontalLine || isVerticalLine,
              };

              // Mescla formas imediatamente consecutivas sobrepostas (preenchimento + contorno)
              const lastShape = shapes.length > 0 ? shapes[shapes.length - 1] : null;
              if (
                lastShape &&
                Math.abs(lastShape.x - newShape.x) < 1.5 &&
                Math.abs(lastShape.y - newShape.y) < 1.5 &&
                Math.abs(lastShape.width - newShape.width) < 2 &&
                Math.abs(lastShape.height - newShape.height) < 2
              ) {
                if (lastShape.backgroundColor === 'transparent' && newShape.backgroundColor !== 'transparent') {
                  lastShape.backgroundColor = newShape.backgroundColor;
                }
                if ((lastShape.borderColor === 'transparent' || !lastShape.borderWidth) && newShape.borderColor !== 'transparent') {
                  lastShape.borderColor = newShape.borderColor;
                  lastShape.borderWidth = newShape.borderWidth;
                }
              } else {
                shapes.push(newShape);
              }
            }
          }
          pendingSubPaths = [];
        } else if (fn === pdfjsLib.OPS.endPath) {
          currentPathPts = [];
          pendingSubPaths = [];
        } else if (
          extractImages &&
          (fn === pdfjsLib.OPS.paintImageXObject ||
            fn === pdfjsLib.OPS.paintInlineImageXObject ||
            fn === pdfjsLib.OPS.paintImageMaskXObject)
        ) {
          const imgKey = args[0];
          let imageObj: any = null;

          if (typeof imgKey === 'string') {
            imageObj = await new Promise((resolve) => {
              try {
                if (page.objs.has(imgKey)) {
                  resolve(page.objs.get(imgKey));
                } else {
                  page.objs.get(imgKey, (obj: any) => resolve(obj));
                }
              } catch {
                resolve(null);
              }
            });
          } else if (typeof imgKey === 'object') {
            imageObj = imgKey;
          }

          if (imageObj) {
            const dataUrl = await convertPdfImageToDataUrl(imageObj);
            if (dataUrl) {
              const p0 = transformPoint(0, 0, currentMatrix);
              const p1 = transformPoint(1, 0, currentMatrix);
              const p2 = transformPoint(0, 1, currentMatrix);
              const p3 = transformPoint(1, 1, currentMatrix);

              const minX = Math.min(p0.x, p1.x, p2.x, p3.x);
              const maxX = Math.max(p0.x, p1.x, p2.x, p3.x);
              const minY = Math.min(p0.y, p1.y, p2.y, p3.y);
              const maxY = Math.max(p0.y, p1.y, p2.y, p3.y);

              const imgX = minX;
              const imgY = minY;
              const imgW = Math.max(4, maxX - minX);
              const imgH = Math.max(4, maxY - minY);

              images.push({
                id: `pdf-img-${validPageNum}-${images.length}`,
                type: 'image',
                src: dataUrl,
                x: imgX,
                y: imgY,
                width: imgW,
                height: imgH,
              });
            }
          }
        }
      }
    } catch (err) {
      console.warn('[pdfExtractor] Aviso ao processar operatorList:', err);
    }
  }

  // 4. Renderização do fundo apenas se explicitamente solicitado
  let backgroundDataUrl: string | undefined = undefined;
  if (renderBackgroundCanvas) {
    try {
      const renderScale = 2.0; // 200 DPI de alta fidelidade e excelente desempenho
      const bgViewport = page.getViewport({ scale: renderScale });
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(bgViewport.width);
      canvas.height = Math.round(bgViewport.height);

      const ctx = canvas.getContext('2d', { alpha: false });
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        await page.render({
          canvasContext: ctx,
          viewport: bgViewport,
        }).promise;

        backgroundDataUrl = getOptimizedCanvasDataUrl(canvas, canvas.width, canvas.height);
      }
    } catch (err) {
      console.warn('[pdfExtractor] Falha na renderização de fundo canvas:', err);
    }
  }

  // 5. Otimização inteligente de formas e conversão em LayoutElement nativo do Agenda Master (coordenadas percentuais de 0 a 100%)
  // Unifica dezenas ou centenas de pequenos pedacinhos de linhas de tabelas em linhas únicas contínuas
  shapes = mergeAndOptimizeShapes(shapes, widthPt, heightPt);

  const elements: LayoutElement[] = [];
  let currentZIndex = 1;

  // A. Formas Vetoriais (Camada inferior: Z-Index 1..99)
  // O usuário pode clicar, mudar a cor de preenchimento, contorno, tamanho e posição
  shapes.forEach((shp, idx) => {
    const xPct = Math.max(0, Math.min(100, (shp.x / widthPt) * 100));
    const yPct = Math.max(0, Math.min(100, (shp.y / heightPt) * 100));
    const wPct = Math.max(0.1, Math.min(100, (shp.width / widthPt) * 100));
    const hPct = Math.max(0.1, Math.min(100, (shp.height / heightPt) * 100));

    if (shp.type === 'lines' || shp.isLine) {
      const isVertical = shp.width < shp.height || shp.name?.toLowerCase().includes('vertical');

      if (isVertical) {
        // Linha vertical centrada no X da coordenada
        const lineW = 0.5; // ~1mm de largura para permitir seleção e manipulação fácil
        const centeredX = Math.max(0, xPct - (lineW / 2));
        elements.push({
          id: `imported-line-${Date.now()}-${idx}`,
          name: shp.name || `Linha Vertical ${idx + 1}`,
          type: 'lines',
          x: Number(centeredX.toFixed(3)),
          y: Number(yPct.toFixed(3)),
          w: Number(lineW.toFixed(3)),
          h: Number(Math.max(0.5, hPct).toFixed(3)),
          zIndex: currentZIndex++,
          style: {
            color: shp.borderColor || '#374151',
            borderColor: shp.borderColor || '#374151',
            borderWidth: shp.borderWidth || 0.75,
            borderStyle: shp.borderStyle || 'solid',
          },
        });
      } else {
        // Linha horizontal centrada no Y da coordenada para alinhamento 100% com o traçado original do PDF
        const lineH = 0.8; // ~1.7mm em A5 para permitir clique e seleção confortáveis
        const centeredY = Math.max(0, yPct - (lineH / 2));
        elements.push({
          id: `imported-line-${Date.now()}-${idx}`,
          name: shp.name || `Linha ${idx + 1}`,
          type: 'lines',
          x: Number(xPct.toFixed(3)),
          y: Number(centeredY.toFixed(3)),
          w: Number(Math.max(0.5, wPct).toFixed(3)),
          h: Number(lineH.toFixed(3)),
          zIndex: currentZIndex++,
          style: {
            color: shp.borderColor || '#374151',
            borderColor: shp.borderColor || '#374151',
            borderWidth: shp.borderWidth || 0.75,
            borderStyle: shp.borderStyle || 'solid',
          },
        });
      }
    } else {
      elements.push({
        id: `imported-box-${Date.now()}-${idx}`,
        name: shp.name || `Retângulo ${idx + 1}`,
        type: shp.type,
        x: Number(xPct.toFixed(3)),
        y: Number(yPct.toFixed(3)),
        w: Number(wPct.toFixed(3)),
        h: Number(hPct.toFixed(3)),
        zIndex: currentZIndex++,
        style: {
          backgroundColor: shp.backgroundColor || 'transparent',
          borderColor: shp.borderColor || 'transparent',
          borderWidth: shp.borderWidth || 0,
          borderStyle: shp.borderStyle || 'solid',
          borderRadius: shp.borderRadius || 0,
          opacity: shp.opacity ?? 1,
        },
      });
    }
  });

  // B. Imagens (Camada intermediária)
  images.forEach((img, idx) => {
    const xPct = Math.max(0, Math.min(100, (img.x / widthPt) * 100));
    const yPct = Math.max(0, Math.min(100, (img.y / heightPt) * 100));
    const wPct = Math.max(0.5, Math.min(100, (img.width / widthPt) * 100));
    const hPct = Math.max(0.5, Math.min(100, (img.height / heightPt) * 100));

    elements.push({
      id: `imported-img-${Date.now()}-${idx}`,
      name: `Imagem ${idx + 1}`,
      type: 'image',
      x: Number(xPct.toFixed(2)),
      y: Number(yPct.toFixed(2)),
      w: Number(wPct.toFixed(2)),
      h: Number(hPct.toFixed(2)),
      zIndex: currentZIndex++,
      style: {
        imageUrl: img.src,
        fit: 'contain',
        opacity: 1,
        backgroundColor: 'transparent',
      },
    });
  });

  // C. Textos e Variáveis Dinâmicas da Agenda (Camada superior: Z-Index 100+ para seleção e edição direta)
  // Se o PDF tiver mais de 1 página e autoDetectDynamicVariables estiver ativo, compara coordenadas com página adjacente
  let otherPageTexts: ExtractedTextItem[] | undefined = undefined;
  if (autoDetectDynamicVariables && totalPages > 1) {
    try {
      const comparePageNum = validPageNum < totalPages ? validPageNum + 1 : Math.max(1, validPageNum - 1);
      if (comparePageNum !== validPageNum) {
        const comparePage = await pdf.getPage(comparePageNum);
        const compareViewport = comparePage.getViewport({ scale: 1.0 });
        const compareTextContent = await comparePage.getTextContent();
        const rawCompare: ExtractedTextItem[] = [];
        for (let cIdx = 0; cIdx < compareTextContent.items.length; cIdx++) {
          const cItem = compareTextContent.items[cIdx] as any;
          if (!cItem.str || cItem.str.trim() === '') continue;
          const tr = cItem.transform;
          const fSize = Math.max(7, Math.round(Math.abs(tr[3]) > 0.1 ? Math.abs(tr[3]) : Math.hypot(tr[0], tr[1]) || cItem.height || 12));
          const [sx, sBaseY] = compareViewport.convertToViewportPoint(tr[4], tr[5]);
          const sy = sBaseY - fSize * 0.82;
          const sw = Math.max(cItem.width || 8, fSize * 0.55 * cItem.str.length);
          const fInfo = sanitizeFontName(cItem.fontName || '');
          rawCompare.push({
            id: `cmp-${comparePageNum}-${cIdx}`,
            type: 'text',
            text: cItem.str,
            x: sx,
            y: sy,
            width: sw,
            height: fSize * 1.22,
            fontSize: fSize,
            fontFamily: fInfo.fontFamily,
            fontWeight: fInfo.fontWeight,
            fontStyle: fInfo.fontStyle,
            color: textColorDefault,
          });
        }
        otherPageTexts = groupTextLines ? groupLineFragments(rawCompare) : rawCompare;
      }
    } catch {
      // Ignora silenciosamente se a página adjacente falhar
    }
  }

  const dynamicClassifications = autoDetectDynamicVariables
    ? classifyExtractedTextsAsDynamic(texts, { width: widthPt, height: heightPt }, otherPageTexts)
    : new Map<string, DetectedDynamicClassification>();

  texts.forEach((txt, idx) => {
    let xPct = Math.max(0, Math.min(100, (txt.x / widthPt) * 100));
    const yPct = Math.max(0, Math.min(100, (txt.y / heightPt) * 100));
    // Margem de segurança de 6% na largura para evitar quebras involuntárias com fontes do sistema
    let wPct = Math.max(1, Math.min(100, ((txt.width * 1.06) / widthPt) * 100));
    const hPct = Math.max(0.8, Math.min(100, (txt.height / heightPt) * 100));

    const dynamicInfo = dynamicClassifications.get(txt.id);
    let resolvedTextAlign: 'left' | 'center' | 'right' = 'left';

    if (dynamicInfo) {
      // Verifica se a variável dinâmica está centralizada dentro de uma caixa/moldura/círculo de cabeçalho
      const enclosingBox = shapes.find(
        shp =>
          !shp.isLine &&
          shp.type !== 'lines' &&
          shp.width < widthPt * 0.55 &&
          shp.height < heightPt * 0.25 &&
          txt.x >= shp.x - 6 &&
          txt.x + txt.width <= shp.x + shp.width + 6 &&
          txt.y >= shp.y - 6 &&
          txt.y + txt.height <= shp.y + shp.height + 6
      );

      if (enclosingBox) {
        const txtCenterX = txt.x + txt.width / 2;
        const boxCenterX = enclosingBox.x + enclosingBox.width / 2;
        if (Math.abs(txtCenterX - boxCenterX) <= Math.max(8, enclosingBox.width * 0.16)) {
          xPct = Math.max(0, Math.min(100, (enclosingBox.x / widthPt) * 100));
          wPct = Math.max(wPct, Math.min(100 - xPct, (enclosingBox.width / widthPt) * 100));
          resolvedTextAlign = 'center';
        }
      }

      // Garante largura mínima segura para que meses longos ("Novembro") ou dias ("Segunda-feira", "30") não quebrem
      if (resolvedTextAlign === 'left') {
        const charWidthPt = txt.fontSize * 0.62;
        let minExpectedChars = txt.text.length;
        if (dynamicInfo.type === 'day_number') minExpectedChars = Math.max(minExpectedChars, 2.5);
        else if (dynamicInfo.type === 'month_name') {
          minExpectedChars = dynamicInfo.nameFormat === 'short' ? 4 : 9.5;
        } else if (dynamicInfo.type === 'day_name') {
          minExpectedChars = dynamicInfo.nameFormat === 'short' ? 4 : dynamicInfo.nameFormat === 'no_feira' ? 8.5 : 14;
        } else if (dynamicInfo.type === 'date_placeholder') {
          minExpectedChars = Math.max(minExpectedChars + 4, 16);
        }
        const safeMinWPct = ((minExpectedChars * charWidthPt) / widthPt) * 100;
        wPct = Math.min(100 - xPct, Math.max(wPct, safeMinWPct));
      }
    }

    elements.push({
      id: `imported-txt-${Date.now()}-${idx}`,
      name: dynamicInfo ? dynamicInfo.name : `Texto: ${txt.text.substring(0, 20).trim() || 'Texto'}`,
      type: dynamicInfo ? dynamicInfo.type : 'text',
      content: txt.text,
      x: Number(xPct.toFixed(2)),
      y: Number(yPct.toFixed(2)),
      w: Number(wPct.toFixed(2)),
      h: Number(hPct.toFixed(2)),
      zIndex: 100 + currentZIndex++,
      style: {
        fontFamily: txt.fontFamily || 'Inter',
        fontSize: txt.fontSize, // tamanho real em pontos nativos do PDF
        fontWeight: txt.fontWeight || 'normal',
        fontStyle: txt.fontStyle || 'normal',
        color: txt.color || '#1f2937',
        textAlign: resolvedTextAlign,
        textTransform: dynamicInfo?.textTransform && dynamicInfo.textTransform !== 'none' ? dynamicInfo.textTransform : undefined,
        variant: dynamicInfo?.variant,
        nameFormat: dynamicInfo?.nameFormat,
        dateTemplate: dynamicInfo?.dateTemplate,
        dayIndex: dynamicInfo?.dayIndex,
        originalPdfText: txt.text,
        backgroundColor: applyTextWhiteout ? '#ffffff' : 'transparent', // Máscara de cobertura contra duplicação de texto no fundo
        cellPadding: applyTextWhiteout ? 1 : 0,
        borderRadius: applyTextWhiteout ? 2 : 0,
        lineHeight: 1.22,
      },
    });
  });

  return {
    pageNumber: validPageNum,
    totalPages,
    viewport: {
      width: widthPt,
      height: heightPt,
      widthMm: Math.round(widthMm),
      heightMm: Math.round(heightMm),
    },
    texts,
    images,
    shapes,
    elements,
    backgroundDataUrl,
  };
}

/**
 * Lê o número total de páginas de um arquivo PDF
 */
export async function getPdfPageCount(fileOrBuffer: File | ArrayBuffer | string): Promise<number> {
  setupPdfWorker();
  let data: ArrayBuffer | string;
  if (fileOrBuffer instanceof File) {
    data = await fileOrBuffer.arrayBuffer();
  } else {
    data = fileOrBuffer;
  }

  const loadingTask = pdfjsLib.getDocument({
    data,
    cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/cmaps/',
    cMapPacked: true,
    standardFontDataUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/standard_fonts/',
  });

  const pdf = await loadingTask.promise;
  return pdf.numPages || 1;
}
