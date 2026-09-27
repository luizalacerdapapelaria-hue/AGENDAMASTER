
export interface User {
  email: string;
  name: string;
  plan: string;
}

export interface Holiday {
  date: string; // ISO format YYYY-MM-DD
  name: string;
  type: 'national' | 'optional' | 'religious' | 'municipal' | string;
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
  | 'footer_tracker' // Elementos de rodapé: copos de água, carinhas de humor, clima, refeições, etc.
  | 'verse'; 

export type FooterTrackerType = 
  | 'water'       // Copos de Água / Hidratação
  | 'mood'        // Humor do Dia / Carinhas
  | 'weather'     // Clima / Tempo
  | 'meals'       // Refeições (Café, Almoço, Jantar, Lanches)
  | 'sleep'       // Horas de Sono / Disposição
  | 'meds'        // Remédios / Vitaminas
  | 'gratitude'   // Linha de Gratidão do Dia
  | 'fitness';    // Atividade Física / Treino

export interface FooterTrackerSection {
    id: string;
    type: FooterTrackerType;
    enabled: boolean;
    label?: string;
    showLabel?: boolean;
    iconVariant?: string;
    itemCount?: number;
    customItemLabels?: string[];
}

export interface FooterTrackerConfig {
    mode?: 'single' | 'composite'; // 'composite' agrupa múltiplos itens (água, carinhas, clima) em um único rodapé
    sections?: FooterTrackerSection[];
    layoutDistribution?: 'auto' | 'space-between' | 'center' | 'start' | 'end';
    showTopDivider?: boolean;
    topDividerColor?: string;
    topDividerWidth?: number;
    topDividerStyle?: 'solid' | 'dashed' | 'dotted';
    showSectionDividers?: boolean;
    sectionDividerColor?: string;

    trackerType: FooterTrackerType;
    iconVariant?: string; // ex: 'glass' | 'bottle' | 'drop' | 'mug' | 'faces_clean' | 'faces_cute' | 'stars' | 'hearts' | 'weather_5' | 'meals_4' | 'sleep_hours' | 'battery' | 'pills' | 'gratitude_line' | 'fitness_4'
    itemCount?: number;
    itemSize?: number;
    spacing?: number;
    strokeColor?: string;
    fillColor?: string;
    strokeWidth?: number;
    showLabel?: boolean;
    label?: string;
    labelPosition?: 'top' | 'left';
    showBox?: boolean;
    boxBackgroundColor?: string;
    boxBorderColor?: string;
    boxBorderWidth?: number;
    boxBorderRadius?: number;
    boxPadding?: number;
    showItemLabels?: boolean;
    customItemLabels?: string[];
    lineStyle?: 'solid' | 'dashed' | 'dotted';
} 

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
    textWrap?: 'wrap' | 'nowrap' | 'clip' | 'ellipsis'; // Novo: Quebra/Corte de texto estilo Word
    textOrientation?: 'horizontal' | 'vertical-up' | 'vertical-down'; // Novo: Orientação do texto
    cellPadding?: number; // Novo: Margem interna da célula (px)
    colorStyleId?: string;
    fillColorStyleId?: string;
    characterStyleId?: string;
    paragraphStyleId?: string;
}

export interface ColorStylePreset {
    id: string;
    name: string;
    color: string;
}

export interface CharacterStylePreset {
    id: string;
    name: string;
    fontFamily?: string;
    fontSize?: number;
    fontWeight?: string;
    fontStyle?: 'normal' | 'italic';
    letterSpacing?: number;
    textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize' | 'sentence';
    color?: string;
    colorStyleId?: string;
}

export interface ParagraphStylePreset {
    id: string;
    name: string;
    textAlign?: 'left' | 'center' | 'right' | 'justify';
    verticalAlign?: 'top' | 'middle' | 'bottom';
    lineHeight?: number;
    textWrap?: 'wrap' | 'nowrap' | 'clip' | 'ellipsis';
    cellPadding?: number;
    columnCount?: number;
    columnGap?: number;
    characterStyleId?: string;
}

export interface ProjectStylesConfig {
    colorStyles: ColorStylePreset[];
    characterStyles: CharacterStylePreset[];
    paragraphStyles: ParagraphStylePreset[];
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
    // Vínculos com Estilos Globais (Cor, Caractere e Parágrafo)
    colorStyleId?: string; // Estilo de cor vinculado à cor principal / texto / linhas
    fillColorStyleId?: string; // Estilo de cor vinculado ao fundo / preenchimento
    borderColorStyleId?: string; // Estilo de cor vinculado à borda / grade
    characterStyleId?: string; // Estilo de caractere vinculado
    paragraphStyleId?: string; // Estilo de parágrafo vinculado

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
    cellPadding?: number; // Margem interna do texto/célula
    opacity?: number;
    lineSpacing?: number; // Para pautas
    gridSpacing?: number; // Para grids de notas
    rowCount?: number; // Novo: Número de linhas fixo para pautas
    showTimes?: boolean; // Para pautas com horário
    hideLines?: boolean; // Ocultar linhas da pauta / tabela de horários
    startHour?: number; // Hora inicial para pautas
    endHour?: number; // Hora final para pautas
    timeInterval?: number; // Intervalo em minutos para pautas
    skipBlankLine?: boolean; // Pular uma linha sem horário entre os horários
    timePosition?: 'left' | 'right'; // Posição dos horários (esquerda ou direita)
    timeWidth?: number; // Largura do bloco/coluna de horários em px
    rotation?: number; // Em graus
    displayOn?: 'all' | 'even' | 'odd' | 'weekdays' | 'weekends' | 'custom';
    dayIndex?: number;
    customPages?: string; // Novo: Intervalo de páginas manual (ex: "1, 3, 5-10")
    yearOffset?: number; // Novo: Offset de ano para calendários (ex: 1 para próximo ano)
    imageUrl?: string; // Para elementos do tipo image
    fit?: 'cover' | 'contain' | 'fill'; // Modo de ajuste da imagem
    iconName?: string; // Nome do ícone Lucide
    flipX?: boolean; // Espelhar horizontalmente
    flipY?: boolean; // Espelhar verticalmente
    autoMirrorImage?: boolean; // Novo: Espelhar automaticamente em páginas espelhadas (pares)
    simulateMaxSpace?: boolean; // Novo: Simular maior ocupação de espaço para testes de layout
    variant?: string;
    nameFormat?: 'full' | 'short' | 'initial' | string; // Formato de nome/abreviação (Completo, 3 letras, 1 letra)
    fillOpacity?: number; // Transparência do preenchimento (0 a 1)
    strokeOpacity?: number; // Transparência da borda (0 a 1)
    preserveAspectRatio?: boolean; // Manter proporção no SVG (false = dinâmico como Caixa, true = proporcional como Círculo)
    isCircular?: boolean; // Comportamento dinâmico simétrico/circular (como Círculo)
    dynamicStretch?: boolean; // Ajuste elástico dinâmico preenchendo 100% da área (como Caixa)
    shapeType?: 
      | 'rectangle' | 'circle' | 'triangle' | 'star' | 'heart' | 'arrow' | 'diamond' | 'hexagon' | 'octagon' | 'pentagon' | 'parallelogram' | 'trapezoid' | 'cloud' | 'shield'
      | 'rounded_rect' | 'washi_tape' | 'ribbon_banner' | 'banner_flag' | 'bookmark_tag' | 'postage_stamp' | 'sticky_note' | 'speech_bubble' | 'thought_cloud' | 'paperclip' | 'pushpin' | 'scalloped_tag'
      | 'bow' | 'cat_paw' | 'bear_silhouette' | 'cute_cup' | 'pencil_cute' | 'cookie_scallop' | 'sparkle_magic' | 'sparkle_stars' | 'butterfly' | 'cute_mushroom'
      | 'flower_daisy' | 'flower_tulip' | 'clover_four' | 'cute_leaf' | 'rainbow_cute' | 'cute_sun' | 'crescent_moon' | 'cute_cloud' | 'water_drop'
      | (string & {}); // Tipos de formas vetoriais e papelaria fofa
    calendarOffset?: number; // -1 (mês anterior), 0 (atual), 1 (próximo)
    calendarMonthMode?: 'relative' | 'sequence' | 'fixed'; // Modo do mês exibido
    calendarFixedMonth?: number; // 0 (Janeiro) a 11 (Dezembro) para Mês Fixo
    shapeScale?: number; // Escala para formas (Agenda Permanente)
    monthsPerRow?: number; // Para full_calendar: quantos meses por linha
    gap?: number; // Espaçamento entre meses
    columnCount?: number; // Novo: Número de colunas para texto (holiday_list)
    columnGap?: number | string; // Espaçamento entre colunas
    holidayFormat?: 'full_written' | 'full_with_weekday' | 'short_written' | 'numeric' | 'day_month_name' | string; // Formato das datas dos feriados
    includeOptional?: boolean; // Incluir feriados facultativos na lista
    includeEaster?: boolean; // Incluir domingo de Páscoa
    includeMunicipal?: boolean; // Incluir feriados municipais
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
        outerBorderWidth?: number; // Espessura da borda externa
        insideBorderWidth?: number; // Espessura das linhas internas
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
        scheduleConfig?: {
            startHour?: number;
            endHour?: number;
            intervalMinutes?: number;
            skipLine?: boolean;
        };
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
        monthFormat?: 'full' | 'short' | 'two_letters' | 'initial' | string; // Formato do nome do mês (Completo, 3 letras, 2 letras, 1 letra)
        weekdayFormat?: 'initial' | 'two_letters' | 'short' | 'medium' | 'full' | 'ordinal_short' | 'ordinal_full' | 'custom' | string; // Formato dos cabeçalhos dos dias da semana
        customWeekdayNames?: string[]; // Nomes customizados para os 7 dias
        customWeekdayText?: string; // String separada por vírgula para edição rápida: "D, S, T, Q, Q, S, S"
        weekdayHeight?: number; // Altura customizada da linha dos dias da semana em px
        weekdayPadding?: number; // Padding interno das células dos dias da semana
        dayRowHeight?: number; // Altura customizada das linhas dos dias do mês em px (espaçamento entre linhas)
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
        skipBlankLine?: boolean;
        timetableHeightPercent?: number;
        timetableFit?: 'fixed' | 'distribute';
        hideLines?: boolean;
        fontFamily?: string;
        headerFontFamily?: string;
        fontSize?: number;
        fontWeight?: string;
        color?: string;
    };
    footerTracker?: FooterTrackerConfig;
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
  mirrorContentOnVerso?: boolean; // Se false, apenas as margens são espelhadas no verso; o conteúdo mantém a mesma posição da frente
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
    versoQuoteStyle?: TextStyleConfig;
    versoQuotePosition?: { x: number; y: number; w: number; h: number };
    versoElements?: LayoutElement[];
  };
  margins: PageMargins;
  initialMargins?: PageMargins; // Margens originais definidas no setup inicial (para manter espelhamento inteligente mesmo após importar PDF 1:1)
  bindingMargins?: PageMargins; // Margens de encadernação (interna/externa) usadas para cálculo de espelhamento e recuo de espiral
  startMonth?: number; // Mês inicial (0-11)
  durationMonths?: number; // Duração em meses
  startOfWeekDay?: number; // Dia de início da semana para calendários (0-6)
  customCalendarStyle?: LayoutElement['style']['fullCalendar']; // Estilo global sincronizado entre mini calendário e calendário anual
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
  styles?: ProjectStylesConfig; // Sistema de estilos vinculados (Cor, Caractere e Parágrafo)
}

export type PdfImportDestination = 
  | 'miolo_default'      // Layout de Miolo Principal (Páginas Diárias)
  | 'miolo_left'         // Layout de Miolo - Verso / Página Esquerda (Pares)
  | 'miolo_right'        // Layout de Miolo - Frente / Página Direita (Ímpares)
  | 'new_intro'          // Nova Página Inicial (Apresentação / Dados / etc.)
  | 'new_monthly_intro'  // Nova Página de Abertura Mensal
  | 'divider'            // Layout de Divisória Mensal (Frente / Capa)
  | 'divider_verso'      // Verso da Divisória Mensal
  | 'replace'            // Substituir Página Atual
  | 'append'             // Adicionar à Página Atual
  | 'save_template';     // Salvar na Biblioteca de Modelos (Meus Modelos)

export interface PdfImportBatchItem {
  pageNumber: number;
  pageName: string;
  elements: LayoutElement[];
  backgroundImage?: string;
  destination: PdfImportDestination;
  isDividerVerso?: boolean;
}

export enum AppState {
  WELCOME,
  LOGIN,
  INITIAL_SETUP,
  DASHBOARD,
  PREVIEW,
  LANDING
}