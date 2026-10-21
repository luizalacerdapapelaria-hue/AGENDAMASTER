import { AgendaConfig } from '../../../types';
import {
  WEEKLY_VERTICAL_LEFT,
  WEEKLY_VERTICAL_RIGHT,
  WEEKLY_HORIZONTAL_LEFT,
  WEEKLY_HORIZONTAL_RIGHT,
  WEEKLY_ONE_PAGE_VERTICAL,
  WEEKLY_ONE_PAGE_HORIZONTAL
} from './plannerTemplates';
import {
  DAILY_CLASSIC,
  DAILY_APPOINTMENT_PRO,
  DAILY_APPOINTMENT_30MIN,
  DAILY_PLANNER_COMMON,
  DAILY_PLANNER_TIMEBLOCK,
  DAILY_FINANCIAL,
  DAILY_FINANCIAL_PERSONAL,
  DAILY_STUDY,
  DAILY_HEALTH,
  APPOINTMENT_2DPP_TOP,
  APPOINTMENT_2DPP_BOTTOM
} from './dailyTemplates';
import {
  buildPastelModelConfig,
  PastelModelOptions
} from './standardAgendaTemplate';

export interface LayoutLibraryItem {
  id: string;
  name: string;
  description: string;
  projectGroup: 'agenda' | 'planner';
  category: 'agenda' | 'planner' | 'financeiro' | 'estudos' | 'saude';
  subCategory?: 'classica' | 'agendamento' | 'financeira' | 'semanal' | 'diario' | 'estudos_saude';
  badge?: string;
  accentColor?: 'rose' | 'peach' | 'sage' | 'lavender' | 'amber';
  highlights?: string[];
  thumbnail?: string;
  modelOptions: PastelModelOptions;
  config: Partial<AgendaConfig>;
}

const createLibraryItem = (
  item: Omit<LayoutLibraryItem, 'config'>
): LayoutLibraryItem => ({
  ...item,
  config: buildPastelModelConfig(item.modelOptions)
});

export const LAYOUT_LIBRARY: LayoutLibraryItem[] = [
  // ============================================================================
  // GRUPO 1: MODELOS EXCLUSIVOS DE AGENDA (projectGroup: 'agenda')
  // ============================================================================
  createLibraryItem({
    id: 'layout-em-branco',
    name: 'Layout em Branco • Começar do Zero (1 DPP)',
    description: 'Página 100% limpa em branco com margens prontas para você desenhar sua própria diagramação, pautas, tabelas e horários do zero.',
    projectGroup: 'agenda',
    category: 'agenda',
    subCategory: 'classica',
    badge: '100% EM BRANCO • FOLHA LIMPA',
    accentColor: 'amber',
    highlights: [
      'Página sem elementos pré-definidos',
      'Margens e sangrias de encadernação preservadas',
      'Total liberdade para criar sua própria diagramação'
    ],
    modelOptions: {
      projectType: 'agenda',
      layoutType: '1_per_page',
      pageSize: 'A5',
      dailyElements: [],
      topElements: [],
      bottomElements: [],
      weeklyLeftElements: [],
      weeklyRightElements: []
    }
  }),

  createLibraryItem({
    id: 'agenda-padrao-completa',
    name: 'Agenda Padrão Clássica • Edição Pastel (1 DPP)',
    description: 'Layout clássico e delicado em tons pastéis com cabeçalho editorial, mini calendário, box lavanda de prioridades, pauta de horários (07h às 20h), lembretes em verde sálvia e autocuidado.',
    projectGroup: 'agenda',
    category: 'agenda',
    subCategory: 'classica',
    badge: 'AGENDA CLÁSSICA • 1 DPP',
    accentColor: 'rose',
    highlights: [
      'Pauta de horários 07h às 20h (1 em 1h)',
      'Box Lavanda de Prioridades do Dia',
      'Lembretes, Hidratação & Humor',
      'Páginas Iniciais + Divisórias + Mensais'
    ],
    modelOptions: {
      projectType: 'agenda',
      layoutType: '1_per_page',
      pageSize: 'A5',
      dailyElements: DAILY_CLASSIC
    }
  }),

  createLibraryItem({
    id: 'agenda-agendamento-profissional',
    name: 'Agenda de Agendamento de Horários & Clientes (1 DPP)',
    description: 'Ideal para clínicas, estúdios de estética, salões, consultórios e autônomos. Tabela de horários (08h às 19h) com Cliente/Procedimento, Valor e Status de Pagamento + Balanço Diário de Caixa.',
    projectGroup: 'agenda',
    category: 'agenda',
    subCategory: 'agendamento',
    badge: 'AGENDAMENTO • CLIENTES & CAIXA',
    accentColor: 'peach',
    highlights: [
      'Tabela: Hora, Cliente/Serviço, R$ e Pago',
      'Balanço Diário (Entradas, Saídas, Saldo)',
      'Lista de Espera, Retornos & Confirmações',
      'Páginas Iniciais + Divisórias + Mensais'
    ],
    modelOptions: {
      projectType: 'agenda',
      layoutType: '1_per_page',
      pageSize: 'A5',
      dailyElements: DAILY_APPOINTMENT_PRO,
      extraIntroTemplateIds: ['tpl-financeiro-anual', 'tpl-contatos']
    }
  }),

  createLibraryItem({
    id: 'agenda-agendamento-30min',
    name: 'Agenda de Horários 30 em 30 min • Duas Colunas (1 DPP)',
    description: 'Para rotinas intensas de atendimento: horários fracionados de 30 em 30 minutos divididos em coluna Manhã (07:00 às 13:30) e Tarde/Noite (14:00 às 20:30), mais Resumo do Dia e Pendências.',
    projectGroup: 'agenda',
    category: 'agenda',
    subCategory: 'agendamento',
    badge: 'HORÁRIOS 30 MIN • INTENSIVA',
    accentColor: 'sage',
    highlights: [
      'Coluna Manhã: 07:00 às 13:30 (30 min)',
      'Coluna Tarde/Noite: 14:00 às 20:30 (30 min)',
      'Resumo de Atendimentos & Urgências',
      'Páginas Iniciais + Divisórias + Mensais'
    ],
    modelOptions: {
      projectType: 'agenda',
      layoutType: '1_per_page',
      pageSize: 'A5',
      dailyElements: DAILY_APPOINTMENT_30MIN
    }
  }),

  createLibraryItem({
    id: 'agenda-executiva-horizontal',
    name: 'Agenda Executiva de Horários • 2 Dias por Página (2 DPP)',
    description: 'Dois dias por página em cards pastéis (Rosé Quartzo no topo e Verde Sálvia na base), cada um com Foco do Dia, Pauta de Horários (08h às 19h) e coluna de Tarefas & Retornos.',
    projectGroup: 'agenda',
    category: 'agenda',
    subCategory: 'agendamento',
    badge: 'AGENDA COMPACTA • 2 DPP',
    accentColor: 'rose',
    highlights: [
      '2 Dias por Página com Horários (08h–19h)',
      'Coluna Lateral de Tarefas & Retornos',
      'Barra de Prioridade/Foco em cada dia',
      'Páginas Iniciais + Divisórias + Mensais'
    ],
    modelOptions: {
      projectType: 'agenda',
      layoutType: '2_per_page',
      pageSize: 'A5',
      dailyElements: DAILY_CLASSIC,
      topElements: APPOINTMENT_2DPP_TOP,
      bottomElements: APPOINTMENT_2DPP_BOTTOM
    }
  }),

  createLibraryItem({
    id: 'planner-financeiro',
    name: 'Agenda Financeira Diária • Movimento de Caixa (1 DPP)',
    description: 'Agenda comercial e financeira diária: Resumo de Contas a Pagar e Valores a Receber no topo, Tabela de Entradas e Saídas do Dia com Forma de Pagamento, e Balanço Diário de Caixa.',
    projectGroup: 'agenda',
    category: 'financeiro',
    subCategory: 'financeira',
    badge: 'AGENDA FINANCEIRA • CAIXA',
    accentColor: 'sage',
    highlights: [
      'Cards de Contas a Pagar & Valores a Receber',
      'Tabela de Movimentações (Descrição, Pgto, Entrada, Saída)',
      'Fechamento Diário: Entradas, Saídas & Saldo',
      'Inclui Controle Financeiro Mensal e Anual'
    ],
    modelOptions: {
      projectType: 'agenda',
      layoutType: '1_per_page',
      pageSize: 'A5',
      dailyElements: DAILY_FINANCIAL,
      extraIntroTemplateIds: ['tpl-financeiro-anual', 'tpl-metas']
    }
  }),

  // ============================================================================
  // GRUPO 2: MODELOS EXCLUSIVOS DE PLANNER (projectGroup: 'planner')
  // ============================================================================
  createLibraryItem({
    id: 'planner-em-branco',
    name: 'Planner em Branco • Começar do Zero',
    description: 'Páginas em branco sem grades ou caixas pré-definidas para você desenhar e estruturar sua própria visão semanal ou diária com liberdade total.',
    projectGroup: 'planner',
    category: 'planner',
    subCategory: 'semanal',
    badge: '100% EM BRANCO • FOLHA LIMPA',
    accentColor: 'amber',
    highlights: [
      'Páginas sem elementos pré-definidos',
      'Margens de encadernação preservadas',
      'Total liberdade para criar sua própria diagramação'
    ],
    modelOptions: {
      projectType: 'planner',
      layoutType: 'weekly_vertical',
      pageSize: 'A5',
      dailyElements: [],
      topElements: [],
      bottomElements: [],
      weeklyLeftElements: [],
      weeklyRightElements: []
    }
  }),

  createLibraryItem({
    id: 'planner-semanal-vertical',
    name: 'Planner Semanal Vertical Pastel (Visão em 2 Páginas)',
    description: 'Semana inteira aberta em duas páginas com colunas verticais em tons pastéis alternados (Rosé, Pêssego, Sálvia e Lavanda), Prioridades da Semana, Rastreador de Hábitos e Notas.',
    projectGroup: 'planner',
    category: 'planner',
    subCategory: 'semanal',
    badge: 'SEMANAL • COLUNAS VERTICAIS',
    accentColor: 'rose',
    highlights: [
      'Visão Semanal em 2 Páginas (Colunas)',
      'Cards dos Dias em Paleta Pastel',
      'Rastreador de Hábitos & Hidratação Semanal',
      'Páginas Iniciais + Divisórias + Mensais'
    ],
    modelOptions: {
      projectType: 'planner',
      layoutType: 'weekly_vertical',
      pageSize: 'A5',
      weeklyLeftElements: WEEKLY_VERTICAL_LEFT,
      weeklyRightElements: WEEKLY_VERTICAL_RIGHT,
      extraIntroTemplateIds: ['tpl-roda-vida', 'tpl-habitos']
    }
  }),

  createLibraryItem({
    id: 'planner-semanal-horizontal',
    name: 'Planner Semanal Horizontal Pastel (Visão em 2 Páginas)',
    description: 'Semana aberta em duas páginas com amplos blocos horizontais pautados em tons pastéis, Checklist da Semana, Rastreador de Hábitos, Gratidão e Balanço Rápido.',
    projectGroup: 'planner',
    category: 'planner',
    subCategory: 'semanal',
    badge: 'SEMANAL • BLOCOS HORIZONTAIS',
    accentColor: 'sage',
    highlights: [
      'Visão Semanal em 2 Páginas (Horizontal)',
      'Amplo Espaço Pautado para Escrita Livre',
      'Checklist da Semana, Hábitos & Gratidão',
      'Páginas Iniciais + Divisórias + Mensais'
    ],
    modelOptions: {
      projectType: 'planner',
      layoutType: 'weekly_horizontal',
      pageSize: 'A5',
      weeklyLeftElements: WEEKLY_HORIZONTAL_LEFT,
      weeklyRightElements: WEEKLY_HORIZONTAL_RIGHT,
      extraIntroTemplateIds: ['tpl-roda-vida', 'tpl-habitos']
    }
  }),

  createLibraryItem({
    id: 'planner-semanal-1p-vertical',
    name: 'Planner Semanal Compacto em 1 Página (Colunas Pastéis)',
    description: 'Todos os 7 dias da semana organizados em uma única página com colunas pastéis, mini calendário, foco da semana e notas.',
    projectGroup: 'planner',
    category: 'planner',
    subCategory: 'semanal',
    badge: 'SEMANAL • 1 PÁGINA',
    accentColor: 'lavender',
    highlights: [
      'Semana Completa em 1 Única Página',
      'Colunas Pastéis + Foco da Semana',
      'Mini Calendário no Cabeçalho',
      'Páginas Iniciais + Divisórias + Mensais'
    ],
    modelOptions: {
      projectType: 'planner',
      layoutType: 'weekly_one_page_vertical',
      pageSize: 'A5',
      dailyElements: WEEKLY_ONE_PAGE_VERTICAL
    }
  }),

  createLibraryItem({
    id: 'planner-semanal-1p-horizontal',
    name: 'Planner Semanal Compacto em 1 Página (Faixas Pastéis)',
    description: 'Os 7 dias da semana em faixas horizontais suaves em uma única página, com espaço para prioridades e notas no topo.',
    projectGroup: 'planner',
    category: 'planner',
    subCategory: 'semanal',
    badge: 'SEMANAL FAIXAS • 1 PÁGINA',
    accentColor: 'peach',
    highlights: [
      '7 Dias em Faixas Horizontais na Mesma Página',
      'Foco da Semana & Notas no Cabeçalho',
      'Mini Calendário Mensal',
      'Páginas Iniciais + Divisórias + Mensais'
    ],
    modelOptions: {
      projectType: 'planner',
      layoutType: 'weekly_one_page_horizontal',
      pageSize: 'A5',
      dailyElements: WEEKLY_ONE_PAGE_HORIZONTAL
    }
  }),

  createLibraryItem({
    id: 'planner-diario-comum',
    name: 'Planner Diário Comum Completo • Rotina & Vida (1 DPP)',
    description: 'O planner diário mais completo em paleta pastel: Top 3 Prioridades numeradas, Agenda de Compromissos + Checklist To-Do lado a lado, Cardápio de Refeições, Autocuidado e Gratidão.',
    projectGroup: 'planner',
    category: 'planner',
    subCategory: 'diario',
    badge: 'PLANNER COMUM • COMPLETO',
    accentColor: 'lavender',
    highlights: [
      'Top 3 Foco do Dia (Cards 01, 02, 03)',
      'Horários (07h–20h) + To-Do List com Check',
      'Cardápio do Dia (Café, Almoço, Lanche, Jantar)',
      'Hidratação, Humor & Gratidão'
    ],
    modelOptions: {
      projectType: 'planner',
      layoutType: '1_per_page',
      pageSize: 'A5',
      dailyElements: DAILY_PLANNER_COMMON,
      extraIntroTemplateIds: ['tpl-roda-vida', 'tpl-habitos', 'tpl-viagem']
    }
  }),

  createLibraryItem({
    id: 'planner-produtividade',
    name: 'Planner de Produtividade & Time Blocking (1 DPP)',
    description: 'Planejamento estratégico diário com Objetivo Principal, Blocos de Tempo (06h às 21h), Tarefas de Execução Rápida, espaço pontilhado para Brain Dump/Ideias e controle de Energia.',
    projectGroup: 'planner',
    category: 'planner',
    subCategory: 'diario',
    badge: 'TIME BLOCKING • FOCO',
    accentColor: 'peach',
    highlights: [
      'Blocos de Tempo das 06:00 às 21:00',
      'Checklist de Tarefas de Execução Rápida',
      'Quadro Pontilhado para Ideias & Insights',
      'Roda da Vida & Metas nas Páginas Iniciais'
    ],
    modelOptions: {
      projectType: 'planner',
      layoutType: '1_per_page',
      pageSize: 'A5',
      dailyElements: DAILY_PLANNER_TIMEBLOCK,
      extraIntroTemplateIds: ['tpl-roda-vida', 'tpl-metas']
    }
  }),

  createLibraryItem({
    id: 'planner-financeiro-pessoal',
    name: 'Planner Financeiro Pessoal & Controle de Gastos (1 DPP)',
    description: 'Focado em educação financeira e economia pessoal: Meta do Dia, Tabela de Gastos com coluna "Essencial?", Boletos Vencendo Hoje, Cofrinho/Reserva e Check-in de Consumo Consciente.',
    projectGroup: 'planner',
    category: 'financeiro',
    subCategory: 'financeira',
    badge: 'PLANNER FINANCEIRO • ECONOMIA',
    accentColor: 'amber',
    highlights: [
      'Tabela de Despesas com filtro "Essencial?"',
      'Boletos Vencendo Hoje & Cofrinho/Reserva',
      'Check-in Diário de Consumo Consciente',
      'Páginas Iniciais + Financeiro Mensal e Anual'
    ],
    modelOptions: {
      projectType: 'planner',
      layoutType: '1_per_page',
      pageSize: 'A5',
      dailyElements: DAILY_FINANCIAL_PERSONAL,
      extraIntroTemplateIds: ['tpl-financeiro-anual', 'tpl-metas', 'tpl-roda-vida']
    }
  }),

  createLibraryItem({
    id: 'planner-estudos',
    name: 'Planner de Estudos, Provas & Leituras Pastel (1 DPP)',
    description: 'Desenvolvido para estudantes, universitários e concurseiros: Disciplinas & Tópicos do Dia, Cronograma de Sessões/Pomodoro, Revisões & Questões, Resumo/Flashcards e Hidratação.',
    projectGroup: 'planner',
    category: 'estudos',
    subCategory: 'estudos_saude',
    badge: 'PLANNER DE ESTUDOS',
    accentColor: 'lavender',
    highlights: [
      'Disciplinas & Tópicos Prioritários do Dia',
      'Cronograma de Estudo & Blocos Pomodoro',
      'Checklist de Revisões, Exercícios & Leituras',
      'Inclui Páginas de Estudos e Livros no Início'
    ],
    modelOptions: {
      projectType: 'planner',
      layoutType: '1_per_page',
      pageSize: 'A5',
      dailyElements: DAILY_STUDY,
      extraIntroTemplateIds: ['tpl-estudos', 'tpl-livros', 'tpl-metas']
    }
  }),

  createLibraryItem({
    id: 'planner-saude',
    name: 'Planner de Saúde, Bem-Estar & Autocuidado Pastel (1 DPP)',
    description: 'Cuidado integral com o corpo e a mente: Intenção de Autocuidado, Diário Alimentar (Café, Almoço, Lanche, Jantar, Suplementos), Treino & Movimento, Rotina, Gratidão e Trackers.',
    projectGroup: 'planner',
    category: 'saude',
    subCategory: 'estudos_saude',
    badge: 'PLANNER SAÚDE & BEM-ESTAR',
    accentColor: 'sage',
    highlights: [
      'Diário Alimentar Completo & Suplementação',
      'Registro de Treino, Movimento & Energia',
      'Espaço Terapêutico de Gratidão & Reflexão',
      'Inclui Roda da Vida & Rastreador de Hábitos'
    ],
    modelOptions: {
      projectType: 'planner',
      layoutType: '1_per_page',
      pageSize: 'A5',
      dailyElements: DAILY_HEALTH,
      extraIntroTemplateIds: ['tpl-roda-vida', 'tpl-habitos', 'tpl-metas']
    }
  })
];

export const resolveLayoutLibraryConfig = (
  itemId: string,
  year: number = new Date().getFullYear() + 1
): Partial<AgendaConfig> | undefined => {
  const item = LAYOUT_LIBRARY.find(
    i => i.id === itemId || 
         (itemId === 'planner-estudos' && i.id === 'planner-estudante') || 
         (itemId === 'planner-estudante' && i.id === 'planner-estudos')
  );
  if (!item) return undefined;
  return buildPastelModelConfig(item.modelOptions, year);
};
