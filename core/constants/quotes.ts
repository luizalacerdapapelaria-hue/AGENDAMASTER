import { QUOTES_FEMININE_STRENGTH } from './quotesData/feminineStrength';
import { QUOTES_FAITH } from './quotesData/faith';
import { QUOTES_MOTIVATIONAL } from './quotesData/motivational';
import { QUOTES_SELF_LOVE } from './quotesData/selfLove';
import { QUOTES_SELF_CARE } from './quotesData/selfCare';
import { QUOTES_GRATITUDE_MINDFULNESS } from './quotesData/gratitudeMindfulness';
import { QUOTES_ENTREPRENEURSHIP_CREATIVITY } from './quotesData/entrepreneurshipCreativity';
import { QUOTES_SUCCESS_HABITS } from './quotesData/successHabits';

export {
  QUOTES_FEMININE_STRENGTH,
  QUOTES_FAITH,
  QUOTES_MOTIVATIONAL,
  QUOTES_SELF_LOVE,
  QUOTES_SELF_CARE,
  QUOTES_GRATITUDE_MINDFULNESS,
  QUOTES_ENTREPRENEURSHIP_CREATIVITY,
  QUOTES_SUCCESS_HABITS
};

export type QuoteCategory = 
  | 'all'
  | 'feminine_strength'
  | 'faith'
  | 'motivational'
  | 'self_love'
  | 'self_care'
  | 'gratitude_mindfulness'
  | 'entrepreneurship_creativity'
  | 'success_habits'
  | 'custom';

export interface QuoteCategoryMeta {
  id: QuoteCategory;
  name: string;
  shortName: string;
  icon: string;
  tag: string;
  description: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  themeColor: string;
  examples: string[];
}

export const QUOTE_CATEGORIES_METADATA: QuoteCategoryMeta[] = [
  {
    id: 'feminine_strength',
    name: 'Força Feminina & Empoderamento',
    shortName: 'Força Feminina',
    icon: '👑',
    tag: 'Mais Pedido',
    description: 'Frases que celebram a determinação, autonomia, coragem e o protagonismo da mulher (370 frases para todos os dias).',
    badgeBg: '#fdf2f8',
    badgeText: '#be185d',
    badgeBorder: '#fbcfe8',
    themeColor: '#db2777',
    examples: [
      'Mulheres determinadas não seguem caminhos prontos, constroem suas próprias pontes.',
      'Sua força é do tamanho dos seus sonhos e da sua perseverança diária.',
      'Lugar de mulher é onde ela sonhar, criar e fizer florescer o seu talento.'
    ]
  },
  {
    id: 'faith',
    name: 'Fé & Espiritualidade',
    shortName: 'Fé & Oração',
    icon: '🙏',
    tag: 'Paz & Esperança',
    description: 'Palavras de confiança em Deus, promessas bíblicas, serenidade e propósitos divinos (370 frases para todos os dias).',
    badgeBg: '#f0fdf4',
    badgeText: '#15803d',
    badgeBorder: '#bbf7d0',
    themeColor: '#16a34a',
    examples: [
      'A fé não torna as coisas mais fáceis, torna tudo possível.',
      'Entregue o seu dia nas mãos de Deus e descanse o coração na certeza do cuidado d’Ele.',
      'Tudo posso naquele que me fortalece. (Filipenses 4:13)'
    ]
  },
  {
    id: 'motivational',
    name: 'Motivação & Disciplina',
    shortName: 'Motivacional',
    icon: '⚡',
    tag: 'Foco & Constância',
    description: 'Impulso diário para superar a procrastinação, manter a constância e bater metas (370 frases para todos os dias).',
    badgeBg: '#fffbeb',
    badgeText: '#b45309',
    badgeBorder: '#fde68a',
    themeColor: '#d97706',
    examples: [
      'Pequenas disciplinas diárias geram conquistas extraordinárias com o tempo.',
      'Foque no progresso constante, nunca na perfeição inalcançável.',
      'A constância supera qualquer obstáculo quando você mantém a direção.'
    ]
  },
  {
    id: 'self_love',
    name: 'Amor-Próprio & Autoestima',
    shortName: 'Amor-Próprio',
    icon: '💖',
    tag: 'Em Alta',
    description: 'Celebre sua autenticidade, confiança interior, pertencimento e o seu valor singular (370 frases para todos os dias).',
    badgeBg: '#fff1f2',
    badgeText: '#9f1239',
    badgeBorder: '#fecdd3',
    themeColor: '#be123c',
    examples: [
      'Você não precisa da aprovação do mundo para honrar a preciosidade que você é.',
      'Abrace a sua autenticidade: o seu brilho não precisa pedir licença para existir.',
      'Seja a sua maior admiradora e celebre com orgulho cada capítulo da sua história.'
    ]
  },
  {
    id: 'self_care',
    name: 'Autocuidado & Saúde Mental',
    shortName: 'Autocuidado',
    icon: '🌸',
    tag: 'Pausa & Equilíbrio',
    description: 'Lembretes carinhosos de pausa, acolhimento pessoal, gentileza e respeito ao ritmo (370 frases para todos os dias).',
    badgeBg: '#fdf4ff',
    badgeText: '#86198f',
    badgeBorder: '#f5d0fe',
    themeColor: '#a21caf',
    examples: [
      'Cuide de você com o mesmo carinho que dedica a tudo o que você cria.',
      'Respeite o seu próprio ritmo: florescer no seu tempo também é crescer.',
      'Descansar a mente e o corpo faz parte do processo de criar com alma.'
    ]
  },
  {
    id: 'gratitude_mindfulness',
    name: 'Gratidão, Calma & Bem-Estar',
    shortName: 'Gratidão & Calma',
    icon: '🌿',
    tag: 'Leveza Diária',
    description: 'Pensamentos para desacelerar a mente, saborear o presente e viver com leveza e serenidade (370 frases para todos os dias).',
    badgeBg: '#ecfdf5',
    badgeText: '#047857',
    badgeBorder: '#a7f3d0',
    themeColor: '#059669',
    examples: [
      'A gratidão transforma o que temos no suficiente para sermos plenas.',
      'Desacelere a mente, respire fundo e aprecie a beleza dos pequenos instantes.',
      'A vida acontece no presente: viva este dia com leveza e serenidade.'
    ]
  },
  {
    id: 'entrepreneurship_creativity',
    name: 'Empreendedorismo & Criação',
    shortName: 'Ateliê & Negócios',
    icon: '💡',
    tag: 'Artesãs & Criadoras',
    description: 'Dedicação ao ateliê, paixão pelo trabalho manual, valorização do tempo e inovação (370 frases para todos os dias).',
    badgeBg: '#f5f3ff',
    badgeText: '#6d28d9',
    badgeBorder: '#ddd6fe',
    themeColor: '#7c3aed',
    examples: [
      'A criatividade é a inteligência se divertindo e transformando afeto em arte.',
      'O capricho que você coloca em cada detalhe é a sua assinatura mais valiosa.',
      'Trabalhe pelo seu sonho com orgulho: o feito à mão tem alma e valor inestimável.'
    ]
  },
  {
    id: 'success_habits',
    name: 'Hábitos, Sucesso & Propósito',
    shortName: 'Hábitos & Sucesso',
    icon: '🎯',
    tag: 'Produtividade',
    description: 'Intencionalidade diária, foco em metas, hábitos vencedores e construção de futuro (370 frases para todos os dias).',
    badgeBg: '#eff6ff',
    badgeText: '#1e40af',
    badgeBorder: '#bfdbfe',
    themeColor: '#2563eb',
    examples: [
      'A disciplina diária constrói em silêncio o futuro que a sua mente planeja.',
      'Seus hábitos definem o seu amanhã: cuide com carinho de cada escolha de hoje.',
      'Quem tem clareza de propósito não se perde em distrações temporárias.'
    ]
  },
  {
    id: 'all',
    name: 'Misto / Todas as Categorias',
    shortName: 'Misto Completo',
    icon: '✨',
    tag: '365+ Dias',
    description: 'Uma rotação balanceada e variada passando por todos os temas ao longo de todo o ano (2.900+ frases).',
    badgeBg: '#fef2f2',
    badgeText: '#9f1239',
    badgeBorder: '#fecdd3',
    themeColor: '#b84a56',
    examples: [
      'Combinação harmônica de força feminina, fé, motivação, gratidão, autocuidado e ateliê durante os 366 dias.'
    ]
  }
];

export const QUOTES_BY_CATEGORY: Record<QuoteCategory, string[]> = {
  feminine_strength: QUOTES_FEMININE_STRENGTH,
  faith: QUOTES_FAITH,
  motivational: QUOTES_MOTIVATIONAL,
  self_love: QUOTES_SELF_LOVE,
  self_care: QUOTES_SELF_CARE,
  gratitude_mindfulness: QUOTES_GRATITUDE_MINDFULNESS,
  entrepreneurship_creativity: QUOTES_ENTREPRENEURSHIP_CREATIVITY,
  success_habits: QUOTES_SUCCESS_HABITS,
  custom: [],
  all: [
    ...QUOTES_FEMININE_STRENGTH,
    ...QUOTES_FAITH,
    ...QUOTES_MOTIVATIONAL,
    ...QUOTES_SELF_LOVE,
    ...QUOTES_SELF_CARE,
    ...QUOTES_GRATITUDE_MINDFULNESS,
    ...QUOTES_ENTREPRENEURSHIP_CREATIVITY,
    ...QUOTES_SUCCESS_HABITS
  ]
};

// Retrocompatibilidade para importações legadas
export const MOTIVATIONAL_QUOTES = QUOTES_BY_CATEGORY.all;

/**
 * Obtém a lista de frases para uma categoria específica
 */
export function getQuotesByCategory(category?: QuoteCategory | string): string[] {
  const catKey = (category || 'all') as QuoteCategory;
  return QUOTES_BY_CATEGORY[catKey] || QUOTES_BY_CATEGORY.all;
}

/**
 * Obtém a frase correspondente ao dia do ano, considerando a categoria selecionada
 * ou lista personalizada do usuário.
 */
export function getQuoteForDay(
  dayOfYear: number,
  month?: number,
  category?: QuoteCategory | string,
  customQuotesList?: string[]
): string {
  const isCustom = category === 'custom';

  // 1. Se houver frases customizadas enviadas diretamente
  if (customQuotesList && Array.isArray(customQuotesList) && customQuotesList.length > 0) {
    if (isCustom || category === 'all' || !category) {
      if (month !== undefined && month >= 0 && month < 12 && dayOfYear === 0) {
        return customQuotesList[month % customQuotesList.length];
      }
      return customQuotesList[Math.abs(dayOfYear) % customQuotesList.length];
    }
  }

  // 2. Se a categoria for custom ou se for all/padrão, verificar frases salvas no localStorage
  if (isCustom || category === 'all' || !category) {
    try {
      if (typeof window !== 'undefined') {
        const custom = window.localStorage.getItem('agendamaster_custom_quotes');
        if (custom) {
          const parsed = JSON.parse(custom);
          if (Array.isArray(parsed) && parsed.length > 0) {
            if (month !== undefined && month >= 0 && month < 12 && dayOfYear === 0) {
              return parsed[month % parsed.length];
            }
            return parsed[Math.abs(dayOfYear) % parsed.length];
          }
        }
      }
    } catch (e) {
      console.error('Error loading custom quotes from localStorage', e);
    }
  }

  // 3. Obter a lista correspondente à categoria solicitada
  const catKey = (category && category !== 'custom' ? category : 'all') as QuoteCategory;
  const list = QUOTES_BY_CATEGORY[catKey] || QUOTES_BY_CATEGORY.all;

  if (!list || list.length === 0) {
    return "A persistência é o caminho do êxito.";
  }

  if (month !== undefined && month >= 0 && month < 12 && dayOfYear === 0) {
    return list[month % list.length];
  }

  return list[Math.abs(dayOfYear) % list.length];
}

/**
 * Obtém uma frase aleatória da categoria
 */
export function getRandomQuote(category?: QuoteCategory | string, customQuotesList?: string[]): string {
  if (category === 'custom') {
    if (customQuotesList && customQuotesList.length > 0) {
      return customQuotesList[Math.floor(Math.random() * customQuotesList.length)];
    }
    try {
      if (typeof window !== 'undefined') {
        const custom = window.localStorage.getItem('agendamaster_custom_quotes');
        if (custom) {
          const parsed = JSON.parse(custom);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed[Math.floor(Math.random() * parsed.length)];
          }
        }
      }
    } catch (e) {}
  }
  const catKey = (category && category !== 'custom' ? category : 'all') as QuoteCategory;
  const list = getQuotesByCategory(catKey);
  const idx = Math.floor(Math.random() * list.length);
  return list[idx] || "A persistência é o caminho do êxito.";
}

/**
 * Busca frases por texto em uma categoria ou em todas
 */
export function searchQuotes(query: string, category?: QuoteCategory | string): string[] {
  const list = getQuotesByCategory(category);
  if (!query || !query.trim()) return list;
  const clean = query.trim().toLowerCase();
  return list.filter(q => q.toLowerCase().includes(clean));
}
