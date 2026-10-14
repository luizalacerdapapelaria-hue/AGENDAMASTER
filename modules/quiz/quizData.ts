export interface QuizOption {
  id: string;
  label: string;
  sublabel?: string;
  iconName?: string;
  category: 'artesanal' | 'iniciante' | 'grafica' | 'designer';
  timeLostHours: number; // estimated hours lost per month
  moneyLostEstimate: number; // estimated revenue missed per month in R$
  painLevel: 'high' | 'medium' | 'critical';
}

export interface QuizQuestion {
  id: number;
  badge: string;
  title: string;
  subtitle: string;
  options: QuizOption[];
}

export interface QuizResultProfile {
  id: string;
  category: 'artesanal' | 'iniciante' | 'grafica' | 'designer';
  title: string;
  subtitle: string;
  badge: string;
  description: string;
  hoursWastedPerMonth: number;
  revenuePotentialBoost: string;
  compatibilityScore: number;
  topStrengths: string[];
  mainBottleneck: string;
  recommendedMioloTypes: string[];
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    badge: 'Nível de Consciência 1/6 • Realidade do Mercado',
    title: 'Qual é o seu momento atual na encadernação e papelaria personalizada?',
    subtitle: 'Selecione a opção que melhor reflete sua rotina hoje para que possamos traçar seu diagnóstico.',
    options: [
      {
        id: 'q1_a',
        label: 'Já vendo agendas e planners, mas passo sufoco com o tempo',
        sublabel: 'Faço vendas todos os meses ou no final de ano, mas fico atolada produzindo e ajustando arquivos.',
        category: 'artesanal',
        timeLostHours: 35,
        moneyLostEstimate: 1800,
        painLevel: 'critical',
        iconName: 'Clock'
      },
      {
        id: 'q1_b',
        label: 'Quero começar a vender agora e aproveitar o final de ano',
        sublabel: 'Sei que agendas e planners dão muito lucro, mas acho a diagramação técnica muito intimidadora.',
        category: 'iniciante',
        timeLostHours: 25,
        moneyLostEstimate: 2200,
        painLevel: 'high',
        iconName: 'Sparkles'
      },
      {
        id: 'q1_c',
        label: 'Tenho gráfica rápida / ateliê com alta demanda de pedidos',
        sublabel: 'Preciso entregar rápido para clientes corporativos e no atacado sem atrasar pedidos.',
        category: 'grafica',
        timeLostHours: 45,
        moneyLostEstimate: 3500,
        painLevel: 'critical',
        iconName: 'Printer'
      },
      {
        id: 'q1_d',
        label: 'Trabalho com design e quero oferecer produtos físicos premium',
        sublabel: 'Quero modelos com visual fino (estilo pastel, tipografia elegante), mas sem sofrer no Corel/Canva.',
        category: 'designer',
        timeLostHours: 30,
        moneyLostEstimate: 2000,
        painLevel: 'medium',
        iconName: 'Palette'
      }
    ]
  },
  {
    id: 2,
    badge: 'Nível de Consciência 2/6 • O Gargalo das Ferramentas',
    title: 'Qual ferramenta você costuma usar para montar seus miolos e layouts?',
    subtitle: 'A maioria dos profissionais gasta horas em ferramentas que nunca foram feitas para gerar 400 páginas automáticas.',
    options: [
      {
        id: 'q2_a',
        label: 'Canva (trava, não pagina automático e limita o visual)',
        sublabel: 'Demora para exportar, limites de páginas e dá trabalho dobrado para alinhar datas.',
        category: 'artesanal',
        timeLostHours: 30,
        moneyLostEstimate: 1500,
        painLevel: 'high',
        iconName: 'Layers'
      },
      {
        id: 'q2_b',
        label: 'CorelDraw ou InDesign com mesclagem de dados (pesado e estressante)',
        sublabel: 'Planilhas de Excel que travam, campos de mesclagem que pulam ou desalinham centenas de páginas.',
        category: 'designer',
        timeLostHours: 40,
        moneyLostEstimate: 2400,
        painLevel: 'critical',
        iconName: 'Sliders'
      },
      {
        id: 'q2_c',
        label: 'Compro miolos prontos em PDF na internet',
        sublabel: 'Fico refém dos modelos dos outros, não consigo mudar as cores pastéis nem o logotipo da cliente.',
        category: 'iniciante',
        timeLostHours: 20,
        moneyLostEstimate: 1200,
        painLevel: 'medium',
        iconName: 'FileText'
      },
      {
        id: 'q2_d',
        label: 'Ainda não domino nenhum programa e me sinto travada',
        sublabel: 'Tenho vontade de produzir, mas sinto que preciso de meses de curso antes de fazer o primeiro PDF.',
        category: 'iniciante',
        timeLostHours: 25,
        moneyLostEstimate: 1900,
        painLevel: 'critical',
        iconName: 'AlertCircle'
      }
    ]
  },
  {
    id: 3,
    badge: 'Nível de Consciência 3/6 • O Custo Oculto do Tempo',
    title: 'Quanto tempo você leva para montar, revisar e preparar UMA agenda completa de 365 a 400 páginas?',
    subtitle: 'Conte o tempo de conferir feriados, alinhar margens para furo de wire-o e exportar o PDF.',
    options: [
      {
        id: 'q3_a',
        label: 'De 2 a 4 dias inteiros (ou várias madrugadas seguidas)',
        sublabel: 'Um processo exaustivo que tira todo o prazer de criar e cansa antes mesmo de imprimir.',
        category: 'artesanal',
        timeLostHours: 42,
        moneyLostEstimate: 2800,
        painLevel: 'critical',
        iconName: 'Moon'
      },
      {
        id: 'q3_b',
        label: 'De 6 a 12 horas de trabalho contínuo e cansativo',
        sublabel: 'Conferindo data por data na tabela do calendário com medo de pular um domingo ou feriado.',
        category: 'designer',
        timeLostHours: 28,
        moneyLostEstimate: 1600,
        painLevel: 'high',
        iconName: 'Clock'
      },
      {
        id: 'q3_c',
        label: '1 a 2 horas (mas uso sempre o mesmo miolo sem poder inovar)',
        sublabel: 'Gostaria de oferecer variações com horários de 30 em 30 min, planner financeiro e devocional.',
        category: 'grafica',
        timeLostHours: 18,
        moneyLostEstimate: 1400,
        painLevel: 'medium',
        iconName: 'RefreshCw'
      },
      {
        id: 'q3_d',
        label: 'Não consigo terminar, sempre me perco ou desisto no caminho',
        sublabel: 'Começo a montar no computador e fico com dor de cabeça pela complexidade.',
        category: 'iniciante',
        timeLostHours: 35,
        moneyLostEstimate: 2100,
        painLevel: 'critical',
        iconName: 'HelpCircle'
      }
    ]
  },
  {
    id: 4,
    badge: 'Nível de Consciência 4/6 • O Pior Pesadelo na Impressão',
    title: 'Qual é o maior prejuízo ou frustração que você já teve (ou mais teme ter)?',
    subtitle: 'Um único erro na encadernação pode custar 400 folhas de papel offset, tinta e a reputação com a cliente.',
    options: [
      {
        id: 'q4_a',
        label: 'Errar um dia de semana ou feriado e perder a impressão toda',
        sublabel: 'Imprimir 200 folhas frente e verso e descobrir que a terça-feira caiu na quarta.',
        category: 'artesanal',
        timeLostHours: 30,
        moneyLostEstimate: 1900,
        painLevel: 'critical',
        iconName: 'AlertTriangle'
      },
      {
        id: 'q4_b',
        label: 'Margem cortada pelo furo do wire-o ou espiral',
        sublabel: 'O texto ou as caixas de horário ficarem furados porque a margem interna não foi calculada.',
        category: 'designer',
        timeLostHours: 20,
        moneyLostEstimate: 1300,
        painLevel: 'high',
        iconName: 'Scissors'
      },
      {
        id: 'q4_c',
        label: 'Ter que recusar encomendas na alta temporada por falta de braço',
        sublabel: 'Clientes procurando agendas em novembro/dezembro e você sem conseguir atender por lentidão.',
        category: 'grafica',
        timeLostHours: 45,
        moneyLostEstimate: 4200,
        painLevel: 'critical',
        iconName: 'TrendingDown'
      },
      {
        id: 'q4_d',
        label: 'Cliente pedindo alteração de cores, horários ou páginas extras',
        sublabel: 'Ter que refazer dezenas de páginas do zero porque a cliente queria tons pastéis ou tabela diferente.',
        category: 'artesanal',
        timeLostHours: 26,
        moneyLostEstimate: 1500,
        painLevel: 'high',
        iconName: 'RefreshCcw'
      }
    ]
  },
  {
    id: 5,
    badge: 'Nível de Consciência 5/6 • O Poder da Automação Inteligente',
    title: 'Se um software inteligente gerasse sua agenda completa de 400 páginas em menos de 30 segundos, o que mudaria para você?',
    subtitle: 'Com cálculo automático de calendários, 14 miolos pastéis prontos e exportação instantânea para PDF.',
    options: [
      {
        id: 'q5_a',
        label: 'Multiplicaria minhas vendas de agendas em 3x a 5x',
        sublabel: 'Poderia aceitar dezenas de encomendas a mais sem medo de atrasar nenhuma entrega.',
        category: 'grafica',
        timeLostHours: 40,
        moneyLostEstimate: 3600,
        painLevel: 'critical',
        iconName: 'TrendingUp'
      },
      {
        id: 'q5_b',
        label: 'Teria finais de semana e noites livres com a minha família',
        sublabel: 'Chega de passar a madrugada na frente do computador ajustando data por data.',
        category: 'artesanal',
        timeLostHours: 35,
        moneyLostEstimate: 2000,
        painLevel: 'high',
        iconName: 'Heart'
      },
      {
        id: 'q5_c',
        label: 'Começaria meu negócio lucrativo de papelaria agora mesmo',
        sublabel: 'Sem precisar de meses de curso técnico de CorelDraw ou InDesign.',
        category: 'iniciante',
        timeLostHours: 28,
        moneyLostEstimate: 2500,
        painLevel: 'high',
        iconName: 'Zap'
      },
      {
        id: 'q5_d',
        label: 'Ofereceria modelos exclusivos de alto padrão (pastéis, horários, planners)',
        sublabel: 'Cobrando muito mais caro por agendas personalizadas de verdade que encantam clientes.',
        category: 'designer',
        timeLostHours: 32,
        moneyLostEstimate: 2700,
        painLevel: 'medium',
        iconName: 'Star'
      }
    ]
  },
  {
    id: 6,
    badge: 'Nível de Consciência 6/6 • Decisão & Qualificação',
    title: 'Qual é o seu nível de compromisso para profissionalizar sua produção hoje?',
    subtitle: 'Estamos avaliando se o Agenda Master realmente facilitaria a sua rotina e se você está pronta para automatizar.',
    options: [
      {
        id: 'q6_a',
        label: '100% decidida: quero automatizar tudo e lucrar alto neste ano',
        sublabel: 'Quero ter acesso imediato à tecnologia e economizar centenas de horas no computador.',
        category: 'artesanal',
        timeLostHours: 35,
        moneyLostEstimate: 3000,
        painLevel: 'critical',
        iconName: 'CheckCircle'
      },
      {
        id: 'q6_b',
        label: 'Quero ver funcionando na prática para comprovar a rapidez',
        sublabel: 'Se tiver comprovação real de velocidade e facilidade, quero adotar no meu ateliê imediatamente.',
        category: 'iniciante',
        timeLostHours: 30,
        moneyLostEstimate: 2200,
        painLevel: 'high',
        iconName: 'Video'
      },
      {
        id: 'q6_c',
        label: 'Quero para uso profissional contínuo (Windows/Web/PDF pronto)',
        sublabel: 'Preciso de garantia de 7 dias e suporte para tirar qualquer dúvida.',
        category: 'grafica',
        timeLostHours: 40,
        moneyLostEstimate: 3800,
        painLevel: 'critical',
        iconName: 'ShieldCheck'
      }
    ]
  }
];

export const RESULT_PROFILES: Record<string, QuizResultProfile> = {
  artesanal: {
    id: 'artesanal',
    category: 'artesanal',
    title: 'Papeleira Criativa & Artesã Sobrecarregada',
    subtitle: 'Excelente bom gosto artesanal, mas presa ao gargalo manual de horas no computador',
    badge: 'Perfil Classificado: Alto Potencial de Escala Imediata',
    description: 'Suas respostas revelam que o maior inimigo do seu faturamento não é a falta de clientes, mas sim o TEMPO absurdo gasto diagramando calendários, ajustando datas e conferindo feriados folha por folha. O Agenda Master AI vai automatizar 98% da sua rotina no computador, devolvendo suas noites de sono e permitindo produzir o dobro de agendas no mesmo dia.',
    hoursWastedPerMonth: 38,
    revenuePotentialBoost: 'R$ 2.400 a R$ 4.800/mês',
    compatibilityScore: 98,
    topStrengths: [
      'Capacidade de encadernação e acabamento impecável',
      'Clientes fiéis que valorizam produtos personalizados',
      'Excelente olhar para paletas de cores e harmonia visual'
    ],
    mainBottleneck: 'Processo manual de diagramação: até 4 dias para fechar 1 único arquivo de 400 páginas.',
    recommendedMioloTypes: [
      'Agenda Padrão Clássica • Edição Pastel (1 DPP)',
      'Agenda de Agendamento com Tabela de Clientes & Horários',
      'Planner Diário Comum Pastel (1 DPP) com Top 3 Prioridades'
    ]
  },
  iniciante: {
    id: 'iniciante',
    category: 'iniciante',
    title: 'Nova Empreendedora de Papelaria Lucrativa',
    subtitle: 'Pronta para faturar alto com agendas e planners sem a barreira técnica dos programas difíceis',
    badge: 'Perfil Classificado: Liberação de Entrada Acelerada',
    description: 'Você está no momento mais lucrativo do ano para a papelaria personalizada! Enquanto a maioria das pessoas desiste achando que precisa fazer faculdade de design ou dominar o CorelDraw/InDesign, o Agenda Master AI entrega tudo pronto em 3 cliques: você só escolhe o ano, o estilo e aperta um botão para ter um PDF de 400 páginas perfeito para impressão.',
    hoursWastedPerMonth: 28,
    revenuePotentialBoost: 'R$ 1.800 a R$ 3.600/mês',
    compatibilityScore: 96,
    topStrengths: [
      'Fome de crescer e construir uma renda extra sólida',
      'Visão clara do mercado de final de ano e volta às aulas',
      'Disposição para aprender rápido com ferramentas intuitivas'
    ],
    mainBottleneck: 'Medo da complexidade técnica de montar calendários, feriados e margens de furo.',
    recommendedMioloTypes: [
      'Agenda 1 Dia por Página Clássica',
      'Agenda 2 Dias por Página Econômica (Ideal para iniciantes)',
      'Planner Semanal em 2 Páginas Compacto'
    ]
  },
  grafica: {
    id: 'grafica',
    category: 'grafica',
    title: 'Estúdio de Produção & Gráfica Rápida em Escala',
    subtitle: 'Foco total em velocidade de entrega, margem líquida e fechamento de grandes lotes',
    badge: 'Perfil Classificado: Prontidão Máxima de Automação',
    description: 'Para o seu negócio, tempo é dinheiro vivo. Cada hora que um colaborador passa ajustando arquivos de agenda no InDesign ou no CorelDraw é custo direto que corrói sua margem. Com o Agenda Master AI, o tempo de fechamento de arquivo cai de horas para 30 segundos, permitindo aceitar pedidos corporativos com entrega no mesmo dia.',
    hoursWastedPerMonth: 46,
    revenuePotentialBoost: 'R$ 4.500 a R$ 9.000/mês',
    compatibilityScore: 99,
    topStrengths: [
      'Equipamentos de impressão e encadernação de alto rendimento',
      'Carteira de clientes corporativos e encomendas de lotes',
      'Capacidade de entrega em grandes volumes'
    ],
    mainBottleneck: 'Gargalo no pré-impressão: lentidão para gerar variações comerciais e horários sob medida.',
    recommendedMioloTypes: [
      'Agenda de Horários 30 em 30 min em Duas Colunas (07h às 21h)',
      'Agenda Comercial Diária com Balanço de Caixa & Meio de Pagamento',
      'Planner Corporativo de Produtividade & Time Blocking'
    ]
  },
  designer: {
    id: 'designer',
    category: 'designer',
    title: 'Designer Editorial & Criadora de Papelaria Fina',
    subtitle: 'Busca excelência estética, tipografias combinadas e paletas pastéis sofisticadas',
    badge: 'Perfil Classificado: Alinhamento Estético Editorial',
    description: 'Você sabe que miolos genéricos e feios da internet não vendem por valores altos. Suas clientes querem sofisticação: Playfair Display, Montserrat, Dancing Script, tons pastéis de Rosé Quartzo, Sálvia e Creme. O Agenda Master AI foi construído exatamente com essa curadoria tipográfica e artística, combinando elegância máxima com automação instantânea.',
    hoursWastedPerMonth: 34,
    revenuePotentialBoost: 'R$ 2.800 a R$ 5.500/mês',
    compatibilityScore: 97,
    topStrengths: [
      'Alto rigor estético e senso refinado de diagramação',
      'Poder de precificação acima da média do mercado',
      'Capacidade de criar produtos que viralizam no Instagram'
    ],
    mainBottleneck: 'Perda de tempo ajustando centenas de tabelas idênticas em vez de focar na estratégia e nas capas.',
    recommendedMioloTypes: [
      'Coleção Pastel Artística Completa (14 Variações Exclusivas)',
      'Planner de Saúde, Bem-Estar & Autocuidado Pastel',
      'Planner Financeiro Pessoal & Controle de Gastos'
    ]
  }
};
