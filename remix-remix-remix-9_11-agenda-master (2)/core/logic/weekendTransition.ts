import { AgendaConfig, LayoutElement, WeekendTransitionConfig } from '../../types';

export type WeekendTransitionPresetType = 'notes' | 'checklist' | 'habits' | 'quote' | 'grid' | 'blank' | 'custom';

export const DEFAULT_WEEKEND_TRANSITION_CONFIG: WeekendTransitionConfig = {
  type: 'notes',
  title: 'Anotações do Fim de Semana',
  titleColor: '#4b5563',
  linesCount: 6,
  lineStyle: 'dashed',
  lineColor: '#d1d5db',
  backgroundColor: 'transparent',
};

export const WEEKEND_TRANSITION_PRESETS: { id: WeekendTransitionPresetType; name: string; desc: string }[] = [
  {
    id: 'notes',
    name: 'Linhas de Anotações (Padrão)',
    desc: 'Título e pauta de linhas para anotações do fim de semana ou fechamento do mês.',
  },
  {
    id: 'checklist',
    name: 'Checklist / Metas da Semana',
    desc: 'Caixas de seleção com pauta para tarefas, pendências e prioridades.',
  },
  {
    id: 'habits',
    name: 'Controle de Hábitos (Habit Tracker)',
    desc: 'Mini rastreador semanal de hábitos e rotina de autocuidado.',
  },
  {
    id: 'quote',
    name: 'Frase Motivacional / Reflexão',
    desc: 'Citação inspiradora para a transição e virada do mês.',
  },
  {
    id: 'grid',
    name: 'Grade Pontilhada (Dot Grid)',
    desc: 'Estilo bullet journal pontilhado para esboços, ideias e notas livres.',
  },
  {
    id: 'blank',
    name: 'Espaço em Branco',
    desc: 'Meia página totalmente limpa e livre.',
  },
];

export function getPresetLabel(presetId?: string): string {
  const found = WEEKEND_TRANSITION_PRESETS.find(p => p.id === presetId);
  return found ? found.name : 'Personalizado';
}

/**
 * Gera elementos nativos do próprio sistema para o Espaço Entre Meses
 * exatamente como o sistema de Divisórias gera elementos para o verso.
 */
export function generatePresetElementsForWeekendTransition(type: string = 'notes'): LayoutElement[] {
  switch (type) {
    case 'checklist': {
      return [
        {
          id: 'wt-title',
          type: 'text',
          name: 'Título',
          x: 6,
          y: 6,
          w: 88,
          h: 8,
          content: 'Metas da Semana',
          zIndex: 1,
          style: {
            fontSize: 12,
            fontWeight: 'bold',
            color: '#4b5563',
            textAlign: 'left',
            textTransform: 'uppercase',
            letterSpacing: 1.2,
            fontFamily: 'Inter',
          },
        },
        {
          id: 'wt-lines',
          type: 'lines',
          name: 'Checklist',
          x: 6,
          y: 18,
          w: 88,
          h: 76,
          zIndex: 1,
          style: {
            showCheckboxes: true,
            checkboxStyle: 'square',
            lineSpacing: 26,
            color: '#d1d5db',
            borderStyle: 'dashed',
            rowCount: 6,
          },
        },
      ];
    }

    case 'habits': {
      return [
        {
          id: 'wt-title',
          type: 'text',
          name: 'Título',
          x: 6,
          y: 6,
          w: 88,
          h: 8,
          content: 'Controle de Hábitos',
          zIndex: 1,
          style: {
            fontSize: 12,
            fontWeight: 'bold',
            color: '#4b5563',
            textAlign: 'left',
            textTransform: 'uppercase',
            letterSpacing: 1.2,
            fontFamily: 'Inter',
          },
        },
        {
          id: 'wt-habits',
          type: 'habit_tracker',
          name: 'Habit Tracker',
          x: 6,
          y: 18,
          w: 88,
          h: 76,
          zIndex: 1,
          style: {
            habitLabel: 'Hábitos do Fim de Semana',
            habitMarkerType: 'square',
            habitColor: '#4b5563',
            habitSpacing: 8,
          },
        },
      ];
    }

    case 'quote': {
      return [
        {
          id: 'wt-quote-title',
          type: 'text',
          name: 'Cabeçalho',
          x: 10,
          y: 8,
          w: 80,
          h: 8,
          content: 'Mensagem Especial',
          zIndex: 1,
          style: {
            fontSize: 11,
            fontWeight: 'bold',
            color: '#9ca3af',
            textAlign: 'center',
            textTransform: 'uppercase',
            letterSpacing: 2,
            fontFamily: 'Inter',
          },
        },
        {
          id: 'wt-quote',
          type: 'quote',
          name: 'Frase Motivacional',
          x: 10,
          y: 20,
          w: 80,
          h: 70,
          content: 'Cada novo mês traz a oportunidade de florescer e recomeçar com mais sabedoria.',
          zIndex: 1,
          style: {
            fontSize: 14,
            fontStyle: 'italic',
            color: '#374151',
            textAlign: 'center',
            verticalAlign: 'middle',
            fontFamily: 'Playfair Display',
            lineHeight: 1.45,
            quoteStylePreset: 'divider_card',
            quoteFixedText: 'Cada novo mês traz a oportunidade de florescer e recomeçar com mais sabedoria.',
            quoteDisplayMode: 'fixed',
            showQuoteMarks: true,
          },
        },
      ];
    }

    case 'grid': {
      return [
        {
          id: 'wt-title',
          type: 'text',
          name: 'Título',
          x: 6,
          y: 6,
          w: 88,
          h: 8,
          content: 'Ideias & Rascunhos',
          zIndex: 1,
          style: {
            fontSize: 12,
            fontWeight: 'bold',
            color: '#4b5563',
            textAlign: 'left',
            textTransform: 'uppercase',
            letterSpacing: 1.2,
            fontFamily: 'Inter',
          },
        },
        {
          id: 'wt-grid',
          type: 'note_grid',
          name: 'Grade Pontilhada',
          x: 6,
          y: 18,
          w: 88,
          h: 76,
          zIndex: 1,
          style: {
            gridSpacing: 18,
            color: '#d1d5db',
          },
        },
      ];
    }

    case 'blank': {
      return [];
    }

    case 'notes':
    default: {
      return [
        {
          id: 'wt-title',
          type: 'text',
          name: 'Título',
          x: 6,
          y: 6,
          w: 88,
          h: 8,
          content: 'Anotações do Fim de Semana',
          zIndex: 1,
          style: {
            fontSize: 12,
            fontWeight: 'bold',
            color: '#4b5563',
            textAlign: 'left',
            textTransform: 'uppercase',
            letterSpacing: 1.2,
            fontFamily: 'Inter',
          },
        },
        {
          id: 'wt-lines',
          type: 'lines',
          name: 'Pauta',
          x: 6,
          y: 18,
          w: 88,
          h: 76,
          zIndex: 1,
          style: {
            lineSpacing: 26,
            color: '#d1d5db',
            borderStyle: 'dashed',
            rowCount: 6,
          },
        },
      ];
    }
  }
}

/**
 * Retorna os elementos do próprio sistema configurados para o Espaço Entre Meses.
 * Se o usuário já customizou ou adicionou elementos livres no canvas, retorna esses elementos.
 * Caso contrário, retorna os elementos do modelo predefinido.
 */
export function getWeekendTransitionElements(
  config?: Partial<AgendaConfig> | null,
  fallbackTitle?: string
): LayoutElement[] {
  if (config?.elementsWeekendTransition !== undefined) {
    return config.elementsWeekendTransition;
  }
  if (config?.weekendTransitionConfig?.elements !== undefined) {
    return config.weekendTransitionConfig.elements;
  }

  const contentType = config?.weekendTransitionContentType || config?.weekendTransitionConfig?.type || 'notes';
  const elements = generatePresetElementsForWeekendTransition(contentType);

  if (fallbackTitle && elements.length > 0 && elements[0].type === 'text' && !config?.weekendTransitionContentType) {
    return elements.map((el, i) => i === 0 ? { ...el, content: fallbackTitle } : el);
  }

  return elements;
}
