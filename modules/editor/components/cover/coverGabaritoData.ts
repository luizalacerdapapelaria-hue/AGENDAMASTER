import { CoverProjectConfig, CoverCardboardSize, CoverPage, LayoutElement } from '../../../../types';

export interface CardboardPresetItem {
  id: string;
  shortLabel: string;
  name: string;
  size: CoverCardboardSize;
  description: string;
  recommendedMiolo: string;
  standardWrapMm: number;
}

export const CARDBOARD_PRESETS: CardboardPresetItem[] = [
  {
    id: 'A5',
    shortLabel: 'A5 Padrão',
    name: 'A5 Padrão (15,5 × 21,5 cm)',
    size: { width: 155, height: 215 },
    description: 'Tamanho clássico mais utilizado para agendas e planners A5.',
    recommendedMiolo: 'Miolo A5 (14,8 × 21,0 cm)',
    standardWrapMm: 15
  },
  {
    id: 'A5_PLUS',
    shortLabel: 'A5 c/ Abas',
    name: 'A5 com Abas Divisórias (16 × 22 cm)',
    size: { width: 160, height: 220 },
    description: 'Largura e altura estendidas para proteger as abas das divisórias mensais.',
    recommendedMiolo: 'Miolo A5 com abas plásticas ou adesivas',
    standardWrapMm: 15
  },
  {
    id: 'COLEGIAL',
    shortLabel: 'Colegial',
    name: 'Colegial / Médio (18 × 25 cm)',
    size: { width: 180, height: 250 },
    description: 'Formato intermediário adorado para estudos, resumos e cadernos leves.',
    recommendedMiolo: 'Miolo Colegial (17 × 24 cm)',
    standardWrapMm: 15
  },
  {
    id: 'A6',
    shortLabel: 'A6 Bolso',
    name: 'A6 Caderneta / Bolso (11 × 15,5 cm)',
    size: { width: 110, height: 155 },
    description: 'Compacto para carregar na bolsa, bloco de notas e diários pocket.',
    recommendedMiolo: 'Miolo A6 (10,5 × 14,8 cm)',
    standardWrapMm: 15
  },
  {
    id: 'SLIM',
    shortLabel: 'Planner Slim',
    name: 'Planner Slim / Bolsa (13,5 × 21,5 cm)',
    size: { width: 135, height: 215 },
    description: 'Formato alongado elegante para planners de bolsa e listas.',
    recommendedMiolo: 'Miolo Slim (12,8 × 21,0 cm)',
    standardWrapMm: 15
  },
  {
    id: 'A4',
    shortLabel: 'A4 Univ.',
    name: 'A4 Universitário (21,5 × 30,5 cm)',
    size: { width: 215, height: 305 },
    description: 'Para cadernos escolares universitários, apostilas e fichários grandes.',
    recommendedMiolo: 'Miolo A4 (21,0 × 29,7 cm)',
    standardWrapMm: 18
  },
  {
    id: 'SQUARE_15',
    shortLabel: 'Quadrado 16×16',
    name: 'Quadrado Mini (16 × 16 cm)',
    size: { width: 160, height: 160 },
    description: 'Moderno e delicado para álbuns de fotos, livros de receitas e diários.',
    recommendedMiolo: 'Miolo Quadrado 15 × 15 cm',
    standardWrapMm: 15
  },
  {
    id: 'SQUARE_20',
    shortLabel: 'Quadrado 21×21',
    name: 'Quadrado Grande (21 × 21 cm)',
    size: { width: 210, height: 210 },
    description: 'Formato nobre para scrapbook, portfólios, livro do bebê e memórias.',
    recommendedMiolo: 'Miolo Quadrado 20 × 20 cm',
    standardWrapMm: 18
  }
];

export function findMatchingCardboardPreset(widthMm: number, heightMm: number): CardboardPresetItem | undefined {
  return CARDBOARD_PRESETS.find(
    p => Math.abs(p.size.width - widthMm) < 0.05 && Math.abs(p.size.height - heightMm) < 0.05
  );
}

export function formatMmLabel(valMm: number): string {
  const rounded = Math.round(valMm * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : String(rounded).replace('.', ',');
}

export function formatCmLabel(valMm: number): string {
  const cm = Math.round((valMm / 10) * 100) / 100;
  return String(cm).replace('.', ',');
}

export const PAPER_WEIGHT_THICKNESS: Record<number, number> = {
  75: 0.098,  // Sulfite 75g (aprox. 0.098mm por folha)
  90: 0.115,  // Offset 90g (aprox. 0.115mm por folha)
  120: 0.155, // Offset 120g (aprox. 0.155mm por folha)
  150: 0.190, // Offset 150g (aprox. 0.190mm por folha)
  180: 0.225  // Offset 180g (aprox. 0.225mm por folha)
};

/**
 * Calcula a largura da lombada em mm baseada nas folhas e gramatura
 */
export function calculateSpineWidthMm(
  pageCount: number,
  paperWeightGsm: number = 90,
  cardboardThicknessMm: number = 1.9,
  extraHingeGapMm: number = 6
): { spineWidth: number; coreThickness: number; totalSpreadWidth: number } {
  const sheetThickness = PAPER_WEIGHT_THICKNESS[paperWeightGsm] || 0.115;
  const sheetCount = Math.max(1, Math.ceil(pageCount / 2));
  const coreThickness = sheetCount * sheetThickness;
  
  // Largura da lombada = miolo + espessura dos 2 papelões + folga de cola/tecido (1.5mm)
  const spineWidth = Math.max(8, Number((coreThickness + (cardboardThicknessMm * 2) + 1.5).toFixed(1)));
  
  // Largura total de uma capa inteiriça panorâmica = frente + lombada + verso + 2 coifas
  const totalSpreadWidth = spineWidth + (extraHingeGapMm * 2);

  return {
    spineWidth,
    coreThickness: Number(coreThickness.toFixed(1)),
    totalSpreadWidth
  };
}

export interface MonogramPreset {
  id: string;
  name: string;
  category: 'floral' | 'classic' | 'geometric' | 'minimalist';
  svgPath: string;
  defaultTitle: string;
  defaultSubtitle: string;
  defaultYear: string;
  foilEffect?: 'gold' | 'rosegold' | 'silver' | 'holographic' | 'none';
}

export const COVER_MONOGRAM_PRESETS: MonogramPreset[] = [
  {
    id: 'floral_crest',
    name: 'Brasão Floral Delicado',
    category: 'floral',
    defaultTitle: 'Minha Agenda',
    defaultSubtitle: 'SEU NOME AQUI',
    defaultYear: '2026',
    foilEffect: 'gold',
    svgPath: 'M50,15 C60,15 70,22 75,32 C80,42 78,55 70,64 C62,73 50,78 38,75 C26,72 17,61 16,49 C15,37 22,25 32,18 C38,14 44,15 50,15 Z'
  },
  {
    id: 'classic_laurel',
    name: 'Coroa de Louros Clássica',
    category: 'classic',
    defaultTitle: 'PLANNER',
    defaultSubtitle: 'SEU NOME COMPLETO',
    defaultYear: '2026',
    foilEffect: 'gold',
    svgPath: 'M50,10 A40,40 0 1,0 50,90 A40,40 0 1,0 50,10 Z'
  },
  {
    id: 'geometric_hexagon',
    name: 'Moldura Hexagonal Moderna',
    category: 'geometric',
    defaultTitle: 'Anotações',
    defaultSubtitle: 'SEU NOME',
    defaultYear: '2026',
    foilEffect: 'rosegold',
    svgPath: 'M50,10 L85,30 L85,70 L50,90 L15,70 L15,30 Z'
  },
  {
    id: 'minimal_double_circle',
    name: 'Círculo Duplo Minimalista',
    category: 'minimalist',
    defaultTitle: 'CADERNO',
    defaultSubtitle: 'PERSONALIZADO',
    defaultYear: '2026',
    foilEffect: 'silver',
    svgPath: 'M50,12 A38,38 0 1,0 50,88 A38,38 0 1,0 50,12 M50,16 A34,34 0 1,0 50,84 A34,34 0 1,0 50,16'
  }
];

export const FOIL_GRADIENTS = {
  gold: 'linear-gradient(135deg, #bf953f 0%, #fcf6ba 25%, #b38728 50%, #fbf5b7 75%, #aa771c 100%)',
  rosegold: 'linear-gradient(135deg, #b76e79 0%, #f9d6db 30%, #e098a2 55%, #fbe3e6 80%, #994d58 100%)',
  silver: 'linear-gradient(135deg, #9ca3af 0%, #f3f4f6 30%, #6b7280 50%, #e5e7eb 75%, #4b5563 100%)',
  holographic: 'linear-gradient(135deg, #f472b6 0%, #60a5fa 30%, #34d399 55%, #fbbf24 80%, #a855f7 100%)',
  copper: 'linear-gradient(135deg, #cb6d51 0%, #ffd1c2 30%, #b25338 55%, #ffe6de 80%, #873620 100%)'
};

/**
 * Cria a configuração inicial de Capa e Cartonagem
 */
export function createDefaultCoverConfig(mioloWidthMm?: number, mioloHeightMm?: number): CoverProjectConfig {
  let defaultSize: CoverCardboardSize = { width: 155, height: 215 };
  let defaultPreset: CoverProjectConfig['formatPreset'] = 'A5';
  let defaultBleed = 15;

  if (mioloWidthMm && mioloHeightMm && mioloWidthMm > 20 && mioloHeightMm > 20) {
    if (Math.abs(mioloWidthMm - 148) <= 2 && Math.abs(mioloHeightMm - 210) <= 2) {
      defaultSize = { width: 155, height: 215 };
      defaultPreset = 'A5';
      defaultBleed = 15;
    } else if (Math.abs(mioloWidthMm - 210) <= 2 && Math.abs(mioloHeightMm - 297) <= 2) {
      defaultSize = { width: 215, height: 305 };
      defaultPreset = 'A4';
      defaultBleed = 18;
    } else if (Math.abs(mioloWidthMm - 105) <= 2 && Math.abs(mioloHeightMm - 148) <= 2) {
      defaultSize = { width: 110, height: 155 };
      defaultPreset = 'A6';
      defaultBleed = 15;
    } else {
      const targetW = Math.round((mioloWidthMm + 7) * 10) / 10;
      const targetH = Math.round((mioloHeightMm + 5) * 10) / 10;
      const matched = findMatchingCardboardPreset(targetW, targetH);
      defaultSize = { width: targetW, height: targetH };
      defaultPreset = matched ? matched.id : 'custom';
      defaultBleed = matched ? matched.standardWrapMm : (Math.max(targetW, targetH) >= 260 ? 18 : 15);
    }
  }

  const frontElements: LayoutElement[] = [
    {
      id: 'cover_title_sample',
      type: 'text',
      name: 'Título da Capa',
      content: 'Minha Agenda',
      x: 10,
      y: 35,
      w: 80,
      h: 8,
      zIndex: 10,
      style: {
        fontSize: 28,
        fontFamily: 'Playfair Display',
        fontWeight: 'bold',
        color: '#1e293b',
        textAlign: 'center',
        letterSpacing: 2
      }
    },
    {
      id: 'cover_name_sample',
      type: 'text',
      name: 'Nome do Cliente / Assinatura',
      content: 'Seu Nome Aqui',
      x: 15,
      y: 47,
      w: 70,
      h: 6,
      zIndex: 11,
      style: {
        fontSize: 16,
        fontFamily: 'Inter',
        fontWeight: 'normal',
        color: '#64748b',
        textAlign: 'center',
        textTransform: 'uppercase',
        letterSpacing: 3
      }
    },
    {
      id: 'cover_year_sample',
      type: 'text',
      name: 'Ano',
      content: '2026',
      x: 35,
      y: 57,
      w: 30,
      h: 5,
      zIndex: 12,
      style: {
        fontSize: 14,
        fontFamily: 'Inter',
        fontWeight: 'bold',
        color: '#b84a56',
        textAlign: 'center',
        letterSpacing: 4
      }
    }
  ];

  const backElements: LayoutElement[] = [
    {
      id: 'cover_back_logo',
      type: 'text',
      name: 'Marca da Papelaria / Contato',
      content: 'Papelaria Personalizada & Design',
      x: 20,
      y: 86,
      w: 60,
      h: 4,
      zIndex: 10,
      style: {
        fontSize: 9,
        fontFamily: 'Inter',
        fontWeight: 'normal',
        color: '#94a3b8',
        textAlign: 'center',
        letterSpacing: 1.5,
        textTransform: 'uppercase'
      }
    }
  ];

  const defaultPages: CoverPage[] = [
    {
      id: 'cover_front',
      name: 'Capa Frente',
      type: 'front',
      elements: frontElements,
      background: {
        type: 'solid',
        color: '#ffffff'
      }
    },
    {
      id: 'cover_back',
      name: 'Contracapa (Verso)',
      type: 'back',
      elements: backElements,
      background: {
        type: 'solid',
        color: '#ffffff'
      }
    },
    {
      id: 'endsheet_front',
      name: 'Guarda Dianteira',
      type: 'endsheet_front',
      elements: [],
      background: {
        type: 'solid',
        color: '#fafafa'
      }
    },
    {
      id: 'endsheet_back',
      name: 'Guarda Traseira',
      type: 'endsheet_back',
      elements: [],
      background: {
        type: 'solid',
        color: '#fafafa'
      }
    }
  ];

  return {
    cardboardSize: defaultSize,
    bleedMm: defaultBleed,
    safeMarginMm: 10,
    formatPreset: defaultPreset,
    bindingType: 'wire_o',
    guides: {
      showBleedLine: true,
      showCardboardLine: true,
      showSafeZoneLine: false,
      showWireOGuide: true,
      showElasticGuide: true,
      showSpineGuides: false,
      showCornerMarks: true
    },
    wireO: {
      showWireO: true,
      pitch: '2:1',
      shape: 'square',
      position: 'left',
      marginMm: 5,
      wireColor: 'gold'
    },
    elastic: {
      showElastic: true,
      positionMm: 16,
      widthMm: 7,
      color: '#b84a56',
      showEyelet: true,
      eyeletColor: '#d4af37',
      showClasp: false,
      claspText: 'A'
    },
    spine: {
      enabled: false,
      pageCount: 200,
      paperWeightGsm: 90,
      cardboardThicknessMm: 1.9,
      calculatedSpineWidthMm: 15,
      hingeGapMm: 6
    },
    pages: defaultPages,
    activeCoverPageId: 'cover_front'
  };
}
