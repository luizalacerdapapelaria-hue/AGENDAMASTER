
import { AgendaConfig } from '../../../types';
import { WEEKLY_VERTICAL_LEFT, WEEKLY_VERTICAL_RIGHT, WEEKLY_HORIZONTAL_LEFT, WEEKLY_HORIZONTAL_RIGHT } from './plannerTemplates';
import { INTRO_TEMPLATES } from './introTemplates';
import { DAILY_CLASSIC, DAILY_FINANCIAL, DAILY_HEALTH, DAILY_STUDY } from './dailyTemplates';

export interface LayoutLibraryItem {
  id: string;
  name: string;
  description: string;
  category: 'agenda' | 'planner' | 'financeiro' | 'estudos' | 'saude';
  thumbnail?: string;
  config: Partial<AgendaConfig>;
}

export const LAYOUT_LIBRARY: LayoutLibraryItem[] = [
  {
    id: 'agenda-classica',
    name: 'Agenda Clássica 1 Dia/Pág',
    description: 'Layout tradicional com um dia por página, ideal para anotações detalhadas.',
    category: 'agenda',
    config: {
      layoutType: '1_per_page',
      pageSize: 'A5',
      elements: [
        {
          id: 'classic-1', type: 'lines', x: 10, y: 10, w: 80, h: 40, zIndex: 1,
          style: { lineSpacing: 25, color: '#e5e7eb' }
        },
        {
          id: 'classic-2', type: 'text', content: 'NOTAS E PONTILHADO', x: 10, y: 55, w: 80, h: 5, zIndex: 1,
          style: { fontSize: 10, fontWeight: 'bold', color: '#6366f1' }
        },
        {
          id: 'classic-3', type: 'box', x: 10, y: 62, w: 80, h: 28, zIndex: 0,
          style: { borderWidth: 1, borderColor: '#e5e7eb', borderStyle: 'dotted', borderRadius: 8 }
        }
      ],
      introPages: [
        INTRO_TEMPLATES.find(t => t.id === 'tpl-dados-pessoais')!,
        INTRO_TEMPLATES.find(t => t.id === 'tpl-calendario-anual')!,
        INTRO_TEMPLATES.find(t => t.id === 'tpl-metas')!,
        INTRO_TEMPLATES.find(t => t.id === 'tpl-contatos')!
      ]
    }
  },
  {
    id: 'agenda-foco-notas',
    name: 'Agenda Foco & Notas (1 DPP)',
    description: 'Design com pautas na metade superior e um box pontilhado para notas na metade inferior.',
    category: 'agenda',
    config: {
      layoutType: '1_per_page',
      pageSize: 'A5',
      elements: [
        {
          id: 'fn-1', type: 'text', content: 'PRIORIDADES', x: 10, y: 8, w: 80, h: 4, zIndex: 1,
          style: { fontSize: 9, fontWeight: 'bold', color: '#4b5563', letterSpacing: 1 }
        },
        {
          id: 'fn-2', type: 'lines', x: 10, y: 12, w: 80, h: 35, zIndex: 1,
          style: { lineSpacing: 25, color: '#e5e7eb' }
        },
        {
          id: 'fn-3', type: 'text', content: 'NOTAS E INSIGHTS', x: 10, y: 52, w: 80, h: 4, zIndex: 1,
          style: { fontSize: 9, fontWeight: 'bold', color: '#4b5563', letterSpacing: 1 }
        },
        {
          id: 'fn-4', type: 'box', x: 10, y: 58, w: 80, h: 32, zIndex: 0,
          style: { borderWidth: 1, borderColor: '#e5e7eb', borderStyle: 'dotted', borderRadius: 10, backgroundColor: '#f9fafb' }
        }
      ],
      introPages: [
        INTRO_TEMPLATES.find(t => t.id === 'tpl-dados-pessoais')!,
        INTRO_TEMPLATES.find(t => t.id === 'tpl-calendario-anual')!
      ]
    }
  },
  {
    id: 'agenda-executiva-horizontal',
    name: 'Agenda Executiva (2 DPP)',
    description: 'Dois dias por página com horários e espaço para compromissos.',
    category: 'agenda',
    config: {
      layoutType: '2_per_page',
      pageSize: 'A5',
      elementsTop: [
        { id: 'et-1', type: 'day_number', x: 10, y: 8, w: 10, h: 10, zIndex: 1, style: { fontSize: 20, fontWeight: 'bold', color: '#1e3a8a' } },
        { id: 'et-2', type: 'day_name', x: 22, y: 10, w: 30, h: 5, zIndex: 1, style: { fontSize: 10, fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' } },
        { id: 'et-3', type: 'lines', x: 10, y: 25, w: 80, h: 65, zIndex: 1, style: { lineSpacing: 20, color: '#f1f5f9', showTimes: true, startHour: 8 } }
      ],
      elementsBottom: [
        { id: 'eb-1', type: 'day_number', x: 10, y: 8, w: 10, h: 10, zIndex: 1, style: { fontSize: 20, fontWeight: 'bold', color: '#1e3a8a' } },
        { id: 'eb-2', type: 'day_name', x: 22, y: 10, w: 30, h: 5, zIndex: 1, style: { fontSize: 10, fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' } },
        { id: 'eb-3', type: 'lines', x: 10, y: 25, w: 80, h: 65, zIndex: 1, style: { lineSpacing: 20, color: '#f1f5f9', showTimes: true, startHour: 8 } }
      ]
    }
  },
  {
    id: 'planner-semanal-vertical',
    name: 'Planner Semanal Vertical',
    description: 'Visualização da semana inteira em duas páginas com colunas verticais.',
    category: 'planner',
    config: {
      layoutType: 'weekly_vertical',
      pageSize: 'A5',
      introPages: [
        INTRO_TEMPLATES.find(t => t.id === 'tpl-dados-pessoais')!,
        INTRO_TEMPLATES.find(t => t.id === 'tpl-calendario-anual')!,
        INTRO_TEMPLATES.find(t => t.id === 'tpl-metas')!,
        INTRO_TEMPLATES.find(t => t.id === 'tpl-roda-vida')!
      ]
    }
  },
  {
    id: 'planner-semanal-horizontal',
    name: 'Planner Semanal Horizontal',
    description: 'Semana em duas páginas com blocos horizontais, muito espaço para escrita.',
    category: 'planner',
    config: {
      layoutType: 'weekly_horizontal',
      pageSize: 'A5',
      introPages: [
        INTRO_TEMPLATES.find(t => t.id === 'tpl-dados-pessoais')!,
        INTRO_TEMPLATES.find(t => t.id === 'tpl-calendario-anual')!,
        INTRO_TEMPLATES.find(t => t.id === 'tpl-metas')!,
        INTRO_TEMPLATES.find(t => t.id === 'tpl-senhas')!
      ]
    }
  },
  {
    id: 'planner-financeiro',
    name: 'Planner Financeiro Completo',
    description: 'Focado em controle de gastos, entradas e planejamento de metas financeiras.',
    category: 'financeiro',
    config: {
      layoutType: '1_per_page',
      pageSize: 'A5',
      elements: DAILY_FINANCIAL,
      introPages: [
        INTRO_TEMPLATES.find(t => t.id === 'tpl-dados-pessoais')!,
        INTRO_TEMPLATES.find(t => t.id === 'tpl-metas')!,
        INTRO_TEMPLATES.find(t => t.id === 'tpl-senhas')!
      ]
    }
  },
  {
    id: 'planner-estudante',
    name: 'Planner do Estudante',
    description: 'Com cronograma de estudos, controle de notas e planejamento de provas.',
    category: 'estudos',
    config: {
      layoutType: 'weekly_vertical',
      pageSize: 'A4',
      elements: DAILY_STUDY,
      introPages: [
        INTRO_TEMPLATES.find(t => t.id === 'tpl-dados-pessoais')!,
        INTRO_TEMPLATES.find(t => t.id === 'tpl-estudos')!,
        INTRO_TEMPLATES.find(t => t.id === 'tpl-calendario-anual')!,
        INTRO_TEMPLATES.find(t => t.id === 'tpl-metas')!
      ]
    }
  },
  {
    id: 'planner-saude',
    name: 'Planner de Saúde e Bem-estar',
    description: 'Acompanhamento de hábitos, sono, medicamentos e roda da vida.',
    category: 'saude',
    config: {
      layoutType: '1_per_page',
      pageSize: 'A5',
      elements: DAILY_HEALTH,
      introPages: [
        INTRO_TEMPLATES.find(t => t.id === 'tpl-dados-pessoais')!,
        INTRO_TEMPLATES.find(t => t.id === 'tpl-roda-vida')!,
        INTRO_TEMPLATES.find(t => t.id === 'tpl-metas')!
      ]
    }
  },
  {
    id: 'planner-viagem',
    name: 'Planner de Viagem',
    description: 'Organize seu roteiro, checklist de malas e destinos favoritos.',
    category: 'planner',
    config: {
      layoutType: '1_per_page',
      pageSize: 'A5',
      elements: DAILY_CLASSIC,
      introPages: [
        INTRO_TEMPLATES.find(t => t.id === 'tpl-dados-pessoais')!,
        INTRO_TEMPLATES.find(t => t.id === 'tpl-viagem')!,
        INTRO_TEMPLATES.find(t => t.id === 'tpl-contatos')!
      ]
    }
  },
  {
    id: 'planner-produtividade',
    name: 'Planner de Produtividade',
    description: 'Focado em metas, roda da vida e planejamento estratégico anual.',
    category: 'planner',
    config: {
      layoutType: 'weekly_vertical',
      pageSize: 'A5',
      elements: DAILY_CLASSIC,
      introPages: [
        INTRO_TEMPLATES.find(t => t.id === 'tpl-dados-pessoais')!,
        INTRO_TEMPLATES.find(t => t.id === 'tpl-metas')!,
        INTRO_TEMPLATES.find(t => t.id === 'tpl-roda-vida')!,
        INTRO_TEMPLATES.find(t => t.id === 'tpl-calendario-anual')!
      ]
    }
  }
];
