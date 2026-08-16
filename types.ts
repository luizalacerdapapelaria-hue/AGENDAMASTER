
export interface User {
  email: string;
  name: string;
  plan: string;
}

export interface Holiday {
  date: string; // ISO format YYYY-MM-DD
  name: string;
  type: 'national' | 'optional';
}

export interface DayData {
  date: Date;
  dayOfWeek: number; // 0-6
  dayOfMonth: number;
  month: number; // 0-11
  year: number;
  holiday?: string;
  moonPhase?: string;
  quote?: string;
  verse?: string;
}

// Tipos de elementos que podem ser arrastados para a página
export type ElementType = 
  | 'text'
  | 'day_number' 
  | 'day_name' 
  | 'month_name' 
  | 'month_number'
  | 'year' 
  | 'date_placeholder' // Novo componente consolidado
  | 'lines' 
  | 'box' 
  | 'circle' 
  | 'quote' 
  | 'moon' 
  | 'holiday' 
  | 'habit_tracker' 
  | 'note_grid'
  | 'mini_calendar'
  | 'full_calendar' // Calendário Anual
  | 'holiday_list' // Lista de Feriados Editável
  | 'table' // Nova Tabela
  | 'image' // Imagem personalizada
  | 'icon' // Ícone Lucide
  | 'vector_shape' // Novo: Formas vetoriais moldáveis
  | 'permanent_day_header' // Cabeçalho para agenda permanente
  | 'planner_day_box' // Novo: Box de dia para Planner Semanal
  | 'verse'; 

export interface TextStyleConfig {
    fontFamily?: string;
    fontSize?: number;
    fontWeight?: string;
    color?: string;
    textAlign?: 'left' | 'center' | 'right' | 'justify'; // Adicionado justify
    verticalAlign?: 'top' | 'middle' | 'bottom'; 
    textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize' | 'sentence';
    letterSpacing?: number; // Tracking
    backgroundColor?: string; // Usado para destaques
    fontStyle?: 'normal' | 'italic'; // Novo
    lineHeight?: number; // Novo
}

export interface LayoutElement {
  id: string;
  groupId?: string; // ID opcional para agrupar elementos
  name?: string; // Nome legível para a camada
  type: ElementType;
  content?: string; // Conteúdo de texto editável (para holiday_list e text)
  x: number; // Posição X em % (0-100) relativo à área útil da página
  y: number; // Posição Y em % (0-100)
  w: number; // Largura em %
  h: number; // Altura em %
  zIndex: number;
  style: {
    fontFamily?: string;
    fontSize?: number;
    fontWeight?: string;
    color?: string; // Cor do texto ou contorno (Stroke para vetores)
    backgroundColor?: string; // Preenchimento (Fill para vetores)
    fontStyle?: 'normal' | 'italic'; // Novo
    lineHeight?: number; // Novo
    
    // Configurações Avançadas de Caixa
    backgroundType?: 'solid' | 'gradient';
    gradientType?: 'linear' | 'radial'; // Novo: Tipo de gradiente
    gradientColors?: [string, string]; // [Cor Inicial, Cor Final]
    gradientDirection?: number; // Ângulo em graus para linear ou foco para radial
    boxShadow?: 'none' | 'sm' | 'md' | 'lg'; // Presets de sombra
    
    borderColor?: string;
    borderWidth?: number;
    borderStyle?: 'solid' | 'dashed' | 'dotted' | 'double' | 'groove' | 'ridge'; // Novo: Estilo de linha
    borderRadius?: number;
    textAlign?: 'left' | 'center' | 'right' | 'justify';
    verticalAlign?: 'top' | 'middle' | 'bottom'; // Novo
    textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize' | 'sentence';
    letterSpacing?: number;
    padding?: number;
    opacity?: number;
    lineSpacing?: number; // Para pautas
    gridSpacing?: number; // Para grids de notas
    rowCount?: number; // Novo: Número de linhas fixo para pautas
    showTimes?: boolean; // Para pautas com horário
    hideLines?: boolean; // Ocultar linhas da pauta / tabela de horários
    startHour?: number; // Hora inicial para pautas
    endHour?: number; // Hora final para pautas
    timeInterval?: number; // Intervalo em minutos para pautas
    timePosition?: 'left' | 'right'; // Posição dos horários (esquerda ou direita)
    timeWidth?: number; // Largura do bloco/coluna de horários em px
    rotation?: number; // Em graus
    displayOn?: 'all' | 'even' | 'odd' | 'weekdays' | 'weekends' | 'custom';
    dayIndex?: number;
    customPages?: string; // Novo: Intervalo de páginas manual (ex: "1, 3, 5-10")
    yearOffset?: number; // Novo: Offset de ano para calendários (ex: 1 para próximo ano)
    imageUrl?: string; // Para elementos do tipo image
    iconName?: string; // Nome do ícone Lucide
    flipX?: boolean; // Espelhar horizontalmente
    flipY?: boolean; // Espelhar verticalmente
    autoMirrorImage?: boolean; // Novo: Espelhar automaticamente em páginas espelhadas (pares)
    simulateMaxSpace?: boolean; // Novo: Simular maior ocupação de espaço para testes de layout
    variant?: string;
    nameFormat?: 'full' | 'short' | 'initial' | string; // Formato de nome/abreviação (Completo, 3 letras, 1 letra)
    fillOpacity?: number; // Transparência do preenchimento (0 a 1)
    strokeOpacity?: number; // Transparência da borda (0 a 1)
    shapeType?: 'rectangle' | 'circle' | 'triangle' | 'star' | 'heart' | 'arrow' | 'diamond' | 'hexagon' | 'octagon' | 'pentagon' | 'parallelogram' | 'trapezoid' | 'cloud' | 'shield'; // Tipos de formas vetoriais
    calendarOffset?: number; // -1 (mês anterior), 0 (atual), 1 (próximo)
    calendarMonthMode?: 'relative' | 'sequence' | 'fixed'; // Modo do mês exibido
    calendarFixedMonth?: number; // 0 (Janeiro) a 11 (Dezembro) para Mês Fixo
    shapeScale?: number; // Escala para formas (Agenda Permanente)
    monthsPerRow?: number; // Para full_calendar: quantos meses por linha
    gap?: number; // Espaçamento entre meses
    columnCount?: number; // Novo: Número de colunas para texto (holiday_list)
    useGlobalStyle?: boolean; // Se true, herda estilo do full_calendar encontrado nas introPages
    gridSize?: number; // Tamanho da grade para formas e gráficos
  highlightCurrentDay?: boolean;
  currentDayHighlightColor?: string;
  currentDayHighlightTextColor?: string;
    
    // Configurações para Habit Tracker
    habitMarkerType?: 'dot' | 'square' | 'check';
    habitMarkerSize?: number;
    habitMarkerStroke?: number;
    habitSpacing?: number;
    habitLineWidth?: number;
    habitColor?: string;
    habitFillColor?: string;
    habitShowLabel?: boolean;
    habitLabel?: string;
    
    // Configurações para Tabela
    table?: {
        rows: number;
        cols: number;
        borderColor?: string;
        borderWidth?: number;
        borderStyle?: 'solid' | 'dashed' | 'dotted';
        headerRow: boolean;
        rowHeight?: number; // Altura mínima da linha em px (no editor)
        borderRadius?: number; // Arredondamento das bordas
        zebraRows?: boolean; // Opção de linhas intercaladas
        zebraColor?: string; // Cor das linhas intercaladas
        columnWidths?: number[]; // Array de porcentagens para largura das colunas
        rowHeights?: number[]; // Novo: Array de porcentagens para altura das linhas
        cellContent?: Record<string, string>; // Mapa "row-col" -> "texto"
        textStyle?: TextStyleConfig; // Estilo de texto global da tabela
        rowStyles?: Record<number, TextStyleConfig>; // Estilos específicos por índice de linha
        colStyles?: Record<number, TextStyleConfig>; // Estilos específicos por índice de coluna
        cellStyles?: Record<string, TextStyleConfig>; // Estilos específicos por chave de célula "r-c"
        borders?: {
            top: boolean;
            bottom: boolean;
            left: boolean;
            right: boolean;
            insideHorizontal: boolean;
            insideVertical: boolean;
            headerSeparator: boolean;
        };
    };

    // Configurações granulares para o Calendário Completo
    fullCalendar?: {
        title: TextStyleConfig;
        weekDays: TextStyleConfig;
        days: TextStyleConfig;
        showYearInTitle?: boolean; // Nova propriedade: Mostrar ano no título do mês
        weekdayFormat?: 'initial' | 'short' | 'medium'; // Formato dos cabeçalhos dos dias da semana
        startOfWeekOnMonday?: boolean;
        startOfWeekDay?: number; // Dia de início da semana (0 = Domingo, 1 = Segunda, 2 = Terça, 3 = Quarta, 4 = Quinta, 5 = Sexta, 6 = Sábado)
        splitMode?: 'all' | 'left' | 'right';
        splitWeekend?: 'none' | 'horizontal' | 'vertical'; // Configuração para sabado/domingo dividirem coluna
        // Estilo de Tabela (Grid)
        grid?: {
            borderColor: string;
            borderWidth: number;
            dividerWidth?: number;
            borderStyle?: 'solid' | 'dashed' | 'dotted';
            cellBackgroundColor: string; // Fundo do dia
            headerBackgroundColor: string; // Fundo da barra de dias da semana
            borders: {
                top: boolean;
                bottom: boolean;
                left: boolean;
                right: boolean;
                insideHorizontal: boolean;
                insideVertical: boolean;
                headerSeparator: boolean; // Nova propriedade
            }
        };
        specialDays?: {
            highlightSundays: boolean;
            highlightHolidays: boolean;
            style: TextStyleConfig; // Estilo para dias destacados
        }
    };
    // Configurações para Planner Day Box
    plannerDayBox?: {
        dayIndex: number; // 0-6 (Segunda a Domingo)
        contentStyle: 'blank' | 'lines' | 'dots' | 'grid' | 'timetable';
        lineSpacing?: number;
        gridSpacing?: number;
        showHeader?: boolean;
        showDayNumber?: boolean;
        showDayName?: boolean;
        dayNameCase?: 'uppercase' | 'lowercase' | 'capitalize';
        headerHeight?: number; // % da altura do box
        headerBackgroundColor?: string;
        headerTextColor?: string;
        showHeaderBorder?: boolean;
        headerBorderColor?: string;
        headerBorderWidth?: number;
        headerBorderStyle?: 'solid' | 'dashed' | 'dotted';
        // Stroke controls
        strokeColor?: string;
        strokeWidth?: number;
        strokeStyle?: 'solid' | 'dashed' | 'dotted';
        showMoonPhase?: boolean;
        startHour?: number;
        endHour?: number;
        timeInterval?: number;
        timetableHeightPercent?: number;
        timetableFit?: 'fixed' | 'distribute';
        hideLines?: boolean;
        fontFamily?: string;
        headerFontFamily?: string;
        fontSize?: number;
        fontWeight?: string;
        color?: string;
    };
  };
}

export interface CategoryBackgroundConfig {
    default?: BackgroundConfig; // Fundo padrão da categoria
    even?: BackgroundConfig;    // Fundo das páginas pares da categoria (Esquerda)
    odd?: BackgroundConfig;     // Fundo das páginas ímpares da categoria (Direita)
}

export interface BackgroundRulesConfig {
    global?: BackgroundConfig;                             // 1. Fundo de toda a agenda
    miolo?: CategoryBackgroundConfig;                      // 2. Fundo do Miolo
    mensais?: CategoryBackgroundConfig;                    // 3. Fundo das Páginas Mensais
    divisorias?: CategoryBackgroundConfig;                 // 4. Fundo das Divisórias Mensais
    iniciais?: CategoryBackgroundConfig;                   // 5. Fundo das Páginas Iniciais
    specificPages?: Record<number, BackgroundConfig>;      // 6. Fundo de Páginas Específicas (ex: página 37)
}

export interface BackgroundConfig {
    id?: string;
    name?: string;
    type: 'none' | 'solid' | 'gradient' | 'image';
    color?: string;
    gradient?: {
        type: 'linear' | 'radial';
        colors: [string, string];
        direction: number; // Ângulo para linear ou foco para radial
    };
    image?: {
        url: string; // Base64 ou URL externa
        opacity: number;
        fit: 'cover' | 'contain' | 'fill';
        flipHorizontal?: boolean;
        flipVertical?: boolean;
        flipOnEvenPages?: boolean;
        rotation?: number;
    };
    opacity?: number; // Opacidade global do fundo
    showOnIntroPages?: boolean;
    showOnDailyPages?: boolean;
    pageFilter?: 'all' | 'even' | 'odd' | 'custom'; // Filtro de exibição por paridade: 'all' (todas), 'even' (pares), 'odd' (ímpares), 'custom' (específica)
    targetType?: 'all' | 'universal' | 'intro' | 'daily' | 'monthly' | 'monthly_intro' | 'divider' | 'divider_verso' | 'even' | 'odd' | 'custom'; // Alvo específico de exibição
    customPages?: string; // Intervalo de páginas manual (ex: "1, 3, 5-10")
}

export interface IntroPage {
    id: string;
    name: string;
    elements: LayoutElement[];
    background?: BackgroundConfig; // Permite sobrescrever o fundo global nesta página
}

export interface PageMargins {
  top: number;    // mm
  bottom: number; // mm
  inside: number; // mm (Encadernação/Espinha) - Substitui Left em páginas ímpares
  outside: number;// mm (Corte) - Substitui Right em páginas ímpares
}

export type PageLayoutType = '1_per_page' | '2_per_page' | '1_per_page_weekend_shared' | 'weekly_vertical' | 'weekly_horizontal' | 'weekly_one_page_vertical' | 'weekly_one_page_horizontal' | 'notebook' | 'devotional';
export type PageSize = 'A4' | 'A5' | 'Letter' | 'Custom';
export type PageOrientation = 'portrait' | 'landscape';
export type ProjectType = 'agenda' | 'planner' | 'notebook' | 'devotional';

export interface AgendaConfig {
  name?: string; // Nome do projeto
  projectType?: ProjectType; // Novo: Tipo de projeto
  year: number;
  pageCount?: number; // Novo: Quantidade de páginas para cadernos/devocionais
  layoutType: PageLayoutType;
  pageSize: PageSize;
  customPageSize?: { width: number; height: number }; // In mm
  orientation: PageOrientation;
  includeHolidays: boolean;
  municipalHolidays?: Holiday[];
  includeMoonPhases: boolean;
  includeQuotes: boolean;
  includeVerses: boolean;
  mirrorEvenPages: boolean; // Nova flag para ativar espelhamento automático
  startMonthOnRightPage?: boolean; // Forçar início do mês na página direita
  includeMonthlyDividers?: boolean; // Nova: incluir divisórias mensais
  includeMonthlyIntroPages?: boolean; // Nova: incluir páginas mensais
  fillerPageContent?: 'notes' | 'habit_tracker' | 'quote' | 'blank' | string; // Conteúdo da página de transição (ou ID de introPage)
  monthlyDividerVersoContent?: 'blank' | 'notes' | 'habit_tracker' | 'quote' | 'monthly_intro_first' | string; // Verso das divisórias de meses
  monthlyDividerStyle?: {
    layout?: 'classic' | 'modern' | 'minimalist' | 'geometric' | 'custom';
    borderStyle?: 'none' | 'double' | 'solid' | 'dashed';
    borderColor?: string;
    backgroundColor?: string;
    textColor?: string;
    accentColor?: string;
    showYear?: boolean;
    showDividerLines?: boolean;
    titleText?: string;
    elements?: LayoutElement[];
    background?: BackgroundConfig;
    versoBackground?: BackgroundConfig;
  };
  margins: PageMargins;
  startMonth?: number; // Mês inicial (0-11)
  durationMonths?: number; // Duração em meses
  startOfWeekDay?: number; // Dia de início da semana para calendários (0-6)
  background?: BackgroundConfig; // Fundo global padrão (legado)
  backgrounds?: BackgroundConfig[]; // Lista de múltiplos planos de fundo globais
  backgroundRules?: BackgroundRulesConfig; // Sistema de regras hierárquicas de plano de fundo
  customVerso?: boolean; // Se true, permite personalizar o verso com um layout diferente da frente
  versoAdvancesSequence?: boolean; // Se false, mantém a mesma data da frente no verso (não pula a sequência de dias)
  disableSequenceSkip?: boolean; // Se true, não insere páginas em branco/preenchimento para alinhar sequência
  elements: LayoutElement[]; // Lista de elementos que compõem o template do dia / frente (MIOLO)
  elementsVerso?: LayoutElement[]; // Template específico para o Verso / Página Par (opcional)
  elementsSaturday?: LayoutElement[]; // Template específico para Sábado (opcional)
  elementsSunday?: LayoutElement[]; // Template específico para Domingo (opcional)
  elementsTop?: LayoutElement[]; // Template específico para a parte superior (2 dias por página)
  elementsBottom?: LayoutElement[]; // Template específico para a parte inferior (2 dias por página)
  elementsWeeklyLeft?: LayoutElement[]; // Template para página esquerda do planner semanal
  elementsWeeklyRight?: LayoutElement[]; // Template para página direita do planner semanal
  introPages: IntroPage[]; // Lista de páginas iniciais (DADOS, CALENDARIOS, ETC)
  monthlyIntroPages?: IntroPage[]; // Páginas introdutórias que começam toda mês (após o divisor de cada mês)
}

export enum AppState {
  WELCOME,
  LOGIN,
  INITIAL_SETUP,
  DASHBOARD,
  PREVIEW,
  LANDING
}