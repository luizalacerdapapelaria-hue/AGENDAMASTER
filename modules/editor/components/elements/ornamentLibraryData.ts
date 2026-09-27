export type OrnamentCategory = 
    | 'frames'        // Molduras & Enquadramentos
    | 'corners'       // Cantoneiras
    | 'arabesques'    // Arabescos
    | 'borders'       // Bordas e Filetes
    | 'medallions'    // Medalhões
    | 'dividers'      // Divisores
    | 'flourishes'    // Floreios
    | 'centerpieces'  // Selos e Ornamentos Centrais
    | 'fillers';      // Elementos de Preenchimento

export type OrnamentVisualFamily = 
    | 'classic'       // Clássico
    | 'neoclassic'    // Neoclássico
    | 'scandinavian'  // Escandinavo
    | 'modern'        // Clean/Moderno
    | 'botanical'     // Botânico
    | 'art_deco'      // Art Déco
    | 'minimalist';   // Minimalista

export interface OrnamentItemDefinition {
    id: string;
    name: string;
    category: OrnamentCategory;
    family: OrnamentVisualFamily;
    description: string;
    path: string;
    viewBox?: string;
    fillRule?: 'nonzero' | 'evenodd';
    defaultRatio?: number; // width / height
    defaultW_MM?: number;
    defaultH_MM?: number;
    defaultFill?: string;
    defaultStroke?: string;
    defaultBorderWidth?: number;
    repeatable?: boolean; // Se pode ser repetido automaticamente em padrão de borda
    defaultRepeatCount?: number;
    cornerRole?: 'top-left' | 'symmetric'; // Se for cantoneira
    tags: string[];
    compatibleWith?: string[]; // IDs de peças da mesma família recomendadas
}

export interface ModularFrameComponentConfig {
    role: 'corner-tl' | 'corner-tr' | 'corner-bl' | 'corner-br' | 'border-top' | 'border-bottom' | 'border-left' | 'border-right' | 'center-top' | 'center-bottom' | 'inner-line';
    name: string;
    shapeId: string;
    relX: number; // % dentro da área da moldura (0 a 100)
    relY: number;
    relW: number;
    relH: number;
    rotation?: number;
    flipX?: boolean;
    flipY?: boolean;
    repeatMode?: 'none' | 'repeat-x' | 'repeat-y';
    repeatCount?: number;
    repeatSpacing?: number;
}

export interface ModularFramePreset {
    id: string;
    title: string;
    family: OrnamentVisualFamily;
    description: string;
    badge?: string;
    defaultWidthPct: number;
    defaultHeightPct: number;
    components: ModularFrameComponentConfig[];
}

export const ORNAMENT_CATEGORIES: { id: 'all' | OrnamentCategory; label: string; icon: string; description: string }[] = [
    { id: 'all', label: 'Todas as Peças', icon: 'Sparkles', description: 'Visão unificada de toda a biblioteca de ornamentos' },
    { id: 'frames', label: 'Molduras', icon: 'Square', description: 'Bordas finas, arcos, molduras modulares e enquadramentos' },
    { id: 'corners', label: 'Cantoneiras', icon: 'Maximize2', description: 'Cantos angulares, volutas e arabescos de vértice espelháveis' },
    { id: 'arabesques', label: 'Arabescos', icon: 'Sparkles', description: 'Volutas barrocas, espirais nobres e curvas decorativas' },
    { id: 'borders', label: 'Bordas e Filetes', icon: 'Minus', description: 'Linhas horizontais, filetes duplos e padrões repetíveis' },
    { id: 'medallions', label: 'Medalhões', icon: 'Shield', description: 'Brasões, camafeus, emblemas e cartelas para monogramas e títulos' },
    { id: 'dividers', label: 'Divisores', icon: 'Split', description: 'Separadores de seção, vinhetas horizontais e quebras de página' },
    { id: 'flourishes', label: 'Floreios', icon: 'Feather', description: 'Traços caligráficos, penas, laços e acentos expressivos' },
    { id: 'centerpieces', label: 'Selos & Centrais', icon: 'Crown', description: 'Ornamentos de ápice, coroas, rosetas e selos de cabeçalho' },
    { id: 'fillers', label: 'Preenchimento', icon: 'Flower2', description: 'Pequenas folhas, estrelas, losangos e acentos diminutos' },
];

export const ORNAMENT_VISUAL_FAMILIES: { 
    id: 'all' | OrnamentVisualFamily; 
    label: string; 
    subtitle: string; 
    accentColor: string; 
    description: string;
}[] = [
    { 
        id: 'all', 
        label: 'Todos os Estilos', 
        subtitle: 'Linguagem Global', 
        accentColor: '#18181b', 
        description: 'Exibir todos os elementos e composições disponíveis' 
    },
    { 
        id: 'classic', 
        label: 'Clássico', 
        subtitle: 'Barroco & Rococó Europeu', 
        accentColor: '#92400e', 
        description: 'Volutas florais, folhas de acanto, arabescos tradicionais e elegância solene inspirada na nobreza.' 
    },
    { 
        id: 'neoclassic', 
        label: 'Neoclássico', 
        subtitle: 'Grego-Romano & Império', 
        accentColor: '#b45309', 
        description: 'Simetria arquitetônica, proporções áureas, folhas de louro e meandros aristocráticos.' 
    },
    { 
        id: 'scandinavian', 
        label: 'Escandinavo', 
        subtitle: 'Nórdico & Arejado', 
        accentColor: '#0f766e', 
        description: 'Ramos botânicos estilizados, linhas despretensiosas, curvas suaves e respiro visual nórdico.' 
    },
    { 
        id: 'modern', 
        label: 'Clean / Moderno', 
        subtitle: 'Contemporâneo & Arquitetônico', 
        accentColor: '#374151', 
        description: 'Geometria pura, arcos elegantes, filetes duplos esguios e ausência de ornamentos pesados.' 
    },
    { 
        id: 'botanical', 
        label: 'Botânico', 
        subtitle: 'Herbal & Silvestre', 
        accentColor: '#15803d', 
        description: 'Ramos de oliveira, eucalipto, folhas vivas e folhagens delicadas para convites e planners.' 
    },
    { 
        id: 'art_deco', 
        label: 'Art Déco', 
        subtitle: 'Anos 20 & Geometria Radiante', 
        accentColor: '#854d0e', 
        description: 'Linhas em leque escalonadas, chevron, vértices facetados e glamour suntuoso dos anos dourados.' 
    },
    { 
        id: 'minimalist', 
        label: 'Minimalista', 
        subtitle: 'Essencial & Atemporal', 
        accentColor: '#4b5563', 
        description: 'Linhas ultrafinas, pontos focais milimétricos e beleza gráfica fundamentada na pureza.' 
    },
];

export const ORNAMENT_ITEMS: OrnamentItemDefinition[] = [
    // ==========================================
    // 1. CANTONEIRAS (CORNERS)
    // ==========================================
    {
        id: 'corner_botanical_olive',
        name: 'Cantoneira Ramo de Oliveira',
        category: 'corners',
        family: 'botanical',
        description: 'Ramo curvo de oliveira com azeitonas e folhagens detalhadas para cantos delicados.',
        path: 'M 6,6 C 18,12 30,22 38,36 C 30,32 24,34 20,42 C 14,48 12,58 10,68 C 8,52 6,36 6,6 Z M 16,14 C 20,10 26,10 30,14 C 28,20 22,22 18,18 Z M 28,24 C 34,22 38,24 40,30 C 36,34 30,32 28,26 Z M 12,32 C 14,28 20,28 22,34 C 18,38 14,38 12,32 Z',
        defaultRatio: 1,
        defaultW_MM: 25,
        defaultH_MM: 25,
        cornerRole: 'top-left',
        tags: ['botânico', 'oliveira', 'folhas', 'azeitona', 'natureza'],
        compatibleWith: ['divider_botanical_wreath']
    },
    {
        id: 'corner_botanical_eucalyptus',
        name: 'Cantoneira Folhas de Eucalipto',
        category: 'corners',
        family: 'botanical',
        description: 'Folhas redondas e suaves de eucalipto dispostas em arco ao redor do vértice.',
        path: 'M 8,8 C 24,14 36,28 42,46 M 16,12 A 6,6 0 1,0 24,20 A 6,6 0 1,0 16,12 M 24,22 A 7,7 0 1,0 34,32 A 7,7 0 1,0 24,22 M 12,28 A 6,6 0 1,0 18,38 A 6,6 0 1,0 12,28',
        defaultRatio: 1,
        defaultW_MM: 24,
        defaultH_MM: 24,
        cornerRole: 'top-left',
        tags: ['botânico', 'eucalipto', 'folhas redondas', 'delicado'],
        compatibleWith: ['divider_botanical_wreath']
    },
    {
        id: 'corner_minimalist_fine',
        name: 'Cantoneira Minimalista Fina',
        category: 'corners',
        family: 'minimalist',
        description: 'Dois filetes de alta precisão que formam um canto puro com pequeno ponto de acento.',
        path: 'M 6,40 L 6,6 L 40,6 M 14,32 L 14,14 L 32,14 M 20,20 A 2,2 0 1,0 20,16 A 2,2 0 1,0 20,20',
        defaultRatio: 1,
        defaultW_MM: 20,
        defaultH_MM: 20,
        cornerRole: 'top-left',
        tags: ['minimalista', 'fino', 'ponto', 'precisão', 'linha'],
        compatibleWith: ['divider_minimalist_dot']
    },
    {
        id: 'corner_minimalist_cross',
        name: 'Cantoneira com Cruz de Ponto',
        category: 'corners',
        family: 'minimalist',
        description: 'Vértice livre com pequena cruz gráfica e linhas flutuantes desacopladas.',
        path: 'M 10,10 L 36,10 M 10,10 L 10,36 M 6,6 L 14,6 M 6,6 L 6,14',
        defaultRatio: 1,
        defaultW_MM: 18,
        defaultH_MM: 18,
        cornerRole: 'top-left',
        tags: ['minimalista', 'cruz', 'flutuante', 'linha'],
        compatibleWith: ['divider_minimalist_dot']
    },

    // ==========================================
    // 2. BORDAS E FILETES (BORDERS & FILLETS)
    // ==========================================
    {
        id: 'border_classic_double',
        name: 'Filete Clássico Duplo com Acabamento',
        category: 'borders',
        family: 'classic',
        description: 'Linha dupla refinada (uma grossa e uma fina) com pequenos nós de finalização.',
        path: 'M 4,44 L 96,44 M 4,52 L 96,52 M 4,40 L 4,56 M 96,40 L 96,56 M 50,40 L 50,56',
        defaultRatio: 10,
        defaultW_MM: 70,
        defaultH_MM: 6,
        repeatable: true,
        tags: ['borda', 'filete', 'duplo', 'clássico', 'linha'],
        compatibleWith: ['divider_classic_royal']
    },
    {
        id: 'border_classic_scroll',
        name: 'Padrão de Borda em Voluta Repetível',
        category: 'borders',
        family: 'classic',
        description: 'Módulo de ondas clássicas que se repete horizontalmente formando uma barra decorativa contínua.',
        path: 'M 0,50 C 10,30 20,30 30,50 C 40,70 50,70 60,50 C 70,30 80,30 90,50 C 95,60 100,55 100,50 M 0,20 L 100,20 M 0,80 L 100,80',
        defaultRatio: 5,
        defaultW_MM: 60,
        defaultH_MM: 12,
        repeatable: true,
        defaultRepeatCount: 4,
        tags: ['borda', 'onda', 'voluta', 'repetível', 'padrão'],
        compatibleWith: ['centerpiece_classic_crown']
    },
    {
        id: 'border_neoclassic_meander',
        name: 'Borda Neoclássica Meandro Grego',
        category: 'borders',
        family: 'neoclassic',
        description: 'Módulo do lendário labirinto grego perfeitamente contínuo para cabeçalhos e molduras.',
        path: 'M 0,20 L 100,20 M 0,80 L 100,80 M 0,35 L 25,35 L 25,65 L 12,65 L 12,50 L 18,50 M 25,35 L 50,35 L 50,65 L 37,65 L 37,50 L 43,50 M 50,35 L 75,35 L 75,65 L 62,65 L 62,50 L 68,50 M 75,35 L 100,35 L 100,65 L 87,65 L 87,50 L 93,50',
        defaultRatio: 5,
        defaultW_MM: 65,
        defaultH_MM: 13,
        repeatable: true,
        defaultRepeatCount: 3,
        tags: ['meandro', 'grego', 'neoclássico', 'repetível', 'borda'],
        compatibleWith: ['border_neoclassic_fillet']
    },
    {
        id: 'border_neoclassic_fillet',
        name: 'Filete Nobre com Roseta Central',
        category: 'borders',
        family: 'neoclassic',
        description: 'Dois traços lineares finos unidos por uma roseta geométrica no centro.',
        path: 'M 4,50 L 44,50 M 56,50 L 96,50 M 50,42 L 54,46 L 58,50 L 54,54 L 50,58 L 46,54 L 42,50 L 46,46 Z M 50,46 A 4,4 0 1,0 50,54 A 4,4 0 1,0 50,46',
        defaultRatio: 12,
        defaultW_MM: 75,
        defaultH_MM: 6,
        repeatable: false,
        tags: ['filete', 'roseta', 'neoclássico', 'linha', 'centro'],
        compatibleWith: ['border_neoclassic_meander']
    },
    {
        id: 'border_scandinavian_thin',
        name: 'Filete Nórdico com Folhas Espaçadas',
        category: 'borders',
        family: 'scandinavian',
        description: 'Linha fina pontuada por pequenas folhas estilizadas a cada intervalo regular.',
        path: 'M 0,50 L 100,50 M 25,50 C 25,40 32,38 35,50 M 50,50 C 50,60 57,62 60,50 M 75,50 C 75,40 82,38 85,50',
        defaultRatio: 8,
        defaultW_MM: 60,
        defaultH_MM: 8,
        repeatable: true,
        defaultRepeatCount: 3,
        tags: ['escandinavo', 'folhas', 'borda', 'repetível', 'clean'],
        compatibleWith: ['divider_scandinavian_dots']
    },

    // ==========================================
    // 3. DIVISORES (DIVIDERS & SEPARATORS)
    // ==========================================
    {
        id: 'divider_classic_royal',
        name: 'Divisor Real com Diamante Central',
        category: 'dividers',
        family: 'classic',
        description: 'Linha dupla que se afunila nas extremidades com losango e volutas no centro.',
        path: 'M 4,50 L 40,50 M 60,50 L 96,50 M 50,38 L 56,46 L 56,54 L 50,62 L 44,54 L 44,46 Z M 40,50 C 42,42 46,44 48,46 M 60,50 C 58,42 54,44 52,46 M 4,46 L 4,54 M 96,46 L 96,54',
        defaultRatio: 8,
        defaultW_MM: 70,
        defaultH_MM: 9,
        tags: ['divisor', 'real', 'losango', 'clássico', 'separador'],
        compatibleWith: ['border_classic_double']
    },
    {
        id: 'divider_neoclassic_urn',
        name: 'Divisor Neoclássico com Urna / Vaso',
        category: 'dividers',
        family: 'neoclassic',
        description: 'Separador horizontal com silhueta clássica de ânfora no centro e filetes retos.',
        path: 'M 4,50 L 44,50 M 56,50 L 96,50 M 48,36 L 52,36 L 54,44 L 52,56 L 55,62 L 45,62 L 48,56 L 46,44 Z M 4,45 L 4,55 M 96,45 L 96,55',
        defaultRatio: 10,
        defaultW_MM: 75,
        defaultH_MM: 7.5,
        tags: ['neoclássico', 'ânfora', 'divisor', 'simetria'],
        compatibleWith: ['border_neoclassic_fillet']
    },
    {
        id: 'divider_scandinavian_dots',
        name: 'Divisor Escandinavo com 3 Pontos',
        category: 'dividers',
        family: 'scandinavian',
        description: 'Traço fino e limpo interrompido por três pontos redondos delicados no centro.',
        path: 'M 6,50 L 42,50 M 58,50 L 94,50 M 47,50 A 1.5,1.5 0 1,0 47,47 A 1.5,1.5 0 1,0 47,50 M 50,50 A 2,2 0 1,0 50,46 A 2,2 0 1,0 50,50 M 53,50 A 1.5,1.5 0 1,0 53,47 A 1.5,1.5 0 1,0 53,50',
        defaultRatio: 12,
        defaultW_MM: 60,
        defaultH_MM: 5,
        tags: ['escandinavo', 'pontos', 'clean', 'divisor', 'linha'],
        compatibleWith: ['border_scandinavian_thin']
    },
    {
        id: 'divider_modern_bar',
        name: 'Divisor Moderno de Precisão',
        category: 'dividers',
        family: 'modern',
        description: 'Linha elegante com corte angular de 45 graus no ponto central.',
        path: 'M 4,50 L 46,50 L 50,42 L 54,58 L 58,50 L 96,50',
        defaultRatio: 14,
        defaultW_MM: 70,
        defaultH_MM: 5,
        tags: ['moderno', 'angular', 'precisão', 'divisor', 'clean'],
        compatibleWith: ['centerpiece_modern_arch']
    },
    {
        id: 'divider_art_deco_fan',
        name: 'Divisor Art Déco com Leque Central',
        category: 'dividers',
        family: 'art_deco',
        description: 'Barras laterais escalonadas convergindo para um motivo em leque radiante.',
        path: 'M 4,50 L 40,50 M 60,50 L 96,50 M 42,60 L 50,30 L 58,60 M 45,60 L 50,38 L 55,60 M 40,62 L 60,62 M 4,44 L 4,56 M 96,44 L 96,56',
        defaultRatio: 8,
        defaultW_MM: 65,
        defaultH_MM: 8,
        tags: ['art déco', 'leque', 'divisor', 'anos 20'],
        compatibleWith: ['centerpiece_art_deco_shield']
    },
    {
        id: 'divider_botanical_wreath',
        name: 'Divisor Botânico de Raminhos Opostos',
        category: 'dividers',
        family: 'botanical',
        description: 'Dois ramos de folhas brotando em direções opostas a partir de uma florzinha central.',
        path: 'M 50,50 A 3,3 0 1,0 50,44 A 3,3 0 1,0 50,50 M 47,47 C 32,45 20,52 6,50 M 53,47 C 68,45 80,52 94,50 M 35,46 C 32,40 38,40 38,45 M 65,46 C 68,40 62,40 62,45 M 22,48 C 18,44 24,42 24,47 M 78,48 C 82,44 76,42 76,47',
        defaultRatio: 7,
        defaultW_MM: 65,
        defaultH_MM: 9,
        tags: ['botânico', 'ramos', 'folhas', 'divisor', 'delicado'],
        compatibleWith: ['corner_botanical_olive']
    },
    {
        id: 'divider_minimalist_dot',
        name: 'Divisor Minimalista Hairline com Ponto',
        category: 'dividers',
        family: 'minimalist',
        description: 'Extrema simplicidade: uma linha capilar com um único ponto milimétrico central.',
        path: 'M 4,50 L 46,50 M 54,50 L 96,50 M 50,50 A 2,2 0 1,0 50,46 A 2,2 0 1,0 50,50',
        defaultRatio: 18,
        defaultW_MM: 70,
        defaultH_MM: 4,
        tags: ['minimalista', 'ponto', 'linha', 'hairline', 'separador'],
        compatibleWith: ['corner_minimalist_fine']
    },

    // ==========================================
    // 4. FLOREIOS (FLOURISHES & VIGNETTES)
    // ==========================================
    {
        id: 'flourish_classic_quill',
        name: 'Floreio de Pena & Traço Pen-Stroke',
        category: 'flourishes',
        family: 'classic',
        description: 'Traço com pressão variável de bico de pena imitando a caligrafia inglesa (Copperplate).',
        path: 'M 8,65 C 20,40 45,20 70,25 C 85,28 92,40 85,55 C 75,70 50,75 35,60 C 25,50 30,35 45,35 C 55,35 60,45 50,50 C 45,52 42,48 45,44',
        defaultRatio: 1.5,
        defaultW_MM: 32,
        defaultH_MM: 21,
        tags: ['pena', 'caligrafia', 'copperplate', 'floreio', 'inglês'],
        compatibleWith: ['centerpiece_classic_crown']
    },

    // ==========================================
    // 5. SELOS E ORNAMENTOS CENTRAIS (CENTERPIECES)
    // ==========================================
    {
        id: 'centerpiece_classic_crown',
        name: 'Coroa Imperial de Ápice',
        category: 'centerpieces',
        family: 'classic',
        description: 'Ornamento de topo para cabeçalhos solenes e coroamento de monogramas.',
        path: 'M 14,75 L 86,75 L 82,38 L 62,54 L 50,22 L 38,54 L 18,38 Z M 14,82 L 86,82 M 50,22 A 3,3 0 1,0 50,16 A 3,3 0 1,0 50,22 M 18,38 A 3,3 0 1,0 18,32 A 3,3 0 1,0 18,38 M 82,38 A 3,3 0 1,0 82,32 A 3,3 0 1,0 82,38',
        defaultRatio: 1.3,
        defaultW_MM: 28,
        defaultH_MM: 21,
        tags: ['coroa', 'imperial', 'monograma', 'topo', 'ápice', 'clássico'],
        compatibleWith: ['border_classic_double']
    },
    {
        id: 'centerpiece_modern_arch',
        name: 'Arco & Linhas Concêntricas',
        category: 'centerpieces',
        family: 'modern',
        description: 'Composição de arcos contemporâneos perfeitos para cabeçalhos editoriais.',
        path: 'M 20,80 L 20,45 C 20,28 34,14 50,14 C 66,14 80,28 80,45 L 80,80 M 32,80 L 32,48 C 32,38 40,30 50,30 C 60,30 68,38 68,48 L 68,80 M 44,80 L 44,52 C 44,48 47,44 50,44 C 53,44 56,48 56,52 L 56,80',
        defaultRatio: 1,
        defaultW_MM: 26,
        defaultH_MM: 26,
        tags: ['moderno', 'arco', 'arquitetura', 'editorial', 'linhas'],
        compatibleWith: ['divider_modern_bar']
    },
    {
        id: 'centerpiece_art_deco_shield',
        name: 'Brasão Art Déco Escalonado',
        category: 'centerpieces',
        family: 'art_deco',
        description: 'Escudo geométrico facetado para cabeçalhos imponentes de cartões e convites.',
        path: 'M 50,10 L 80,25 L 80,55 L 50,88 L 20,55 L 20,25 Z M 50,22 L 72,34 L 72,52 L 50,76 L 28,52 L 28,34 Z M 50,34 L 64,42 L 64,50 L 50,66 L 36,50 L 36,42 Z',
        defaultRatio: 0.9,
        defaultW_MM: 24,
        defaultH_MM: 27,
        tags: ['art déco', 'brasão', 'escudo', 'anos 20'],
        compatibleWith: ['divider_art_deco_fan']
    },

    // ==========================================
    // 6. ELEMENTOS DE PREENCHIMENTO (FILLERS)
    // ==========================================
    {
        id: 'filler_scandinavian_leaf',
        name: 'Folha Nórdica Estilizada',
        category: 'fillers',
        family: 'scandinavian',
        description: 'Pequena folha ovalada com nervura central e desenho suave.',
        path: 'M 50,15 C 68,32 68,68 50,85 C 32,68 32,32 50,15 Z M 50,15 L 50,85',
        defaultRatio: 0.6,
        defaultW_MM: 10,
        defaultH_MM: 16,
        tags: ['folha', 'escandinavo', 'preenchimento', 'natureza'],
        compatibleWith: ['border_scandinavian_thin']
    },
    {
        id: 'filler_art_deco_diamond',
        name: 'Losango Art Déco com Cruz',
        category: 'fillers',
        family: 'art_deco',
        description: 'Pequeno acento geométrico com linhas concêntricas e diamante central.',
        path: 'M 50,10 L 86,50 L 50,90 L 14,50 Z M 50,26 L 72,50 L 50,74 L 28,50 Z M 50,10 L 50,90 M 14,50 L 86,50',
        defaultRatio: 1,
        defaultW_MM: 14,
        defaultH_MM: 14,
        tags: ['losango', 'art déco', 'acento', 'geométrico'],
        compatibleWith: ['centerpiece_art_deco_shield']
    },
    {
        id: 'filler_minimalist_star_4',
        name: 'Estrela Minimalista de 4 Pontas',
        category: 'fillers',
        family: 'minimalist',
        description: 'Estrela de quatro pontas pontiaguda com visual de brilho sutil.',
        path: 'M 50,10 C 50,38 62,50 90,50 C 62,50 50,62 50,90 C 50,62 38,50 10,50 C 38,50 50,38 50,10 Z',
        defaultRatio: 1,
        defaultW_MM: 12,
        defaultH_MM: 12,
        tags: ['estrela', 'brilho', 'minimalista', '4 pontas', 'acento'],
        compatibleWith: ['corner_minimalist_fine', 'divider_minimalist_dot']
    }
];

// ==========================================
// 7. MOLDURAS PRÉ-MONTADAS (COMPOSIÇÕES MODULARES)
// ==========================================
export const MODULAR_FRAME_PRESETS: ModularFramePreset[] = [
    {
        id: 'preset_frame_classic_imperial',
        title: 'Moldura Clássica Imperial',
        family: 'classic',
        description: 'Composição solene com cantoneiras, filetes duplos laterais e coroa imperial no topo.',
        badge: '7 Componentes Editáveis',
        defaultWidthPct: 86,
        defaultHeightPct: 88,
        components: [
            { role: 'corner-tl', name: 'Cantoneira Sup. Esquerda', shapeId: 'corner_minimalist_fine', relX: 0, relY: 0, relW: 12, relH: 12, flipX: false, flipY: false },
            { role: 'corner-tr', name: 'Cantoneira Sup. Direita', shapeId: 'corner_minimalist_fine', relX: 88, relY: 0, relW: 12, relH: 12, flipX: true, flipY: false },
            { role: 'corner-bl', name: 'Cantoneira Inf. Esquerda', shapeId: 'corner_minimalist_fine', relX: 0, relY: 88, relW: 12, relH: 12, flipX: false, flipY: true },
            { role: 'corner-br', name: 'Cantoneira Inf. Direita', shapeId: 'corner_minimalist_fine', relX: 88, relY: 88, relW: 12, relH: 12, flipX: true, flipY: true },
            { role: 'border-top', name: 'Filete Superior', shapeId: 'border_classic_double', relX: 18, relY: 2, relW: 64, relH: 2.2 },
            { role: 'border-bottom', name: 'Filete Inferior', shapeId: 'border_classic_double', relX: 18, relY: 96, relW: 64, relH: 2.2, flipY: true },
            { role: 'center-top', name: 'Coroa Imperial Superior', shapeId: 'centerpiece_classic_crown', relX: 42, relY: -3, relW: 16, relH: 8 }
        ]
    },
    {
        id: 'preset_frame_neoclassic_meander',
        title: 'Moldura Neoclássica com Meandro & Filetes',
        family: 'neoclassic',
        description: 'Estrutura grego-romana com cantoneiras geométricas e filetes nobres com roseta.',
        badge: '6 Componentes Editáveis',
        defaultWidthPct: 84,
        defaultHeightPct: 86,
        components: [
            { role: 'corner-tl', name: 'Canto Sup. Esq.', shapeId: 'corner_minimalist_cross', relX: 0, relY: 0, relW: 12, relH: 12 },
            { role: 'corner-tr', name: 'Canto Sup. Dir.', shapeId: 'corner_minimalist_cross', relX: 88, relY: 0, relW: 12, relH: 12, flipX: true },
            { role: 'corner-bl', name: 'Canto Inf. Esq.', shapeId: 'corner_minimalist_cross', relX: 0, relY: 88, relW: 12, relH: 12, flipY: true },
            { role: 'corner-br', name: 'Canto Inf. Dir.', shapeId: 'corner_minimalist_cross', relX: 88, relY: 88, relW: 12, relH: 12, flipX: true, flipY: true },
            { role: 'border-top', name: 'Filete Grego Topo', shapeId: 'border_neoclassic_fillet', relX: 14, relY: 2.5, relW: 72, relH: 2 },
            { role: 'border-bottom', name: 'Filete Grego Base', shapeId: 'border_neoclassic_fillet', relX: 14, relY: 95.5, relW: 72, relH: 2 }
        ]
    },
    {
        id: 'preset_frame_scandinavian_botanical',
        title: 'Moldura Escandinava com Brotos Nórdicos',
        family: 'scandinavian',
        description: 'Linguagem arejada e orgânica com cantoneiras florais delicadas e divisor de pontos.',
        badge: '5 Componentes Editáveis',
        defaultWidthPct: 82,
        defaultHeightPct: 84,
        components: [
            { role: 'corner-tl', name: 'Canto Nórdico Sup. Esq.', shapeId: 'corner_botanical_eucalyptus', relX: 0, relY: 0, relW: 14, relH: 14 },
            { role: 'corner-tr', name: 'Canto Nórdico Sup. Dir.', shapeId: 'corner_botanical_eucalyptus', relX: 86, relY: 0, relW: 14, relH: 14, flipX: true },
            { role: 'corner-bl', name: 'Canto Nórdico Inf. Esq.', shapeId: 'corner_botanical_eucalyptus', relX: 0, relY: 86, relW: 14, relH: 14, flipY: true },
            { role: 'corner-br', name: 'Canto Nórdico Inf. Dir.', shapeId: 'corner_botanical_eucalyptus', relX: 86, relY: 86, relW: 14, relH: 14, flipX: true, flipY: true },
            { role: 'center-bottom', name: 'Divisor de Pontos Base', shapeId: 'divider_scandinavian_dots', relX: 30, relY: 96, relW: 40, relH: 2.5 }
        ]
    },
    {
        id: 'preset_frame_art_deco_glamour',
        title: 'Moldura Art Déco Radiante Anos 20',
        family: 'art_deco',
        description: 'Geometria marcante com cantos precisos e brasão déco no topo.',
        badge: '6 Componentes Editáveis',
        defaultWidthPct: 85,
        defaultHeightPct: 86,
        components: [
            { role: 'corner-tl', name: 'Canto Déco Sup. Esq.', shapeId: 'corner_minimalist_cross', relX: 0, relY: 0, relW: 14, relH: 14 },
            { role: 'corner-tr', name: 'Canto Déco Sup. Dir.', shapeId: 'corner_minimalist_cross', relX: 86, relY: 0, relW: 14, relH: 14, flipX: true },
            { role: 'corner-bl', name: 'Canto Déco Inf. Esq.', shapeId: 'corner_minimalist_cross', relX: 0, relY: 86, relW: 14, relH: 14, flipY: true },
            { role: 'corner-br', name: 'Canto Déco Inf. Dir.', shapeId: 'corner_minimalist_cross', relX: 86, relY: 86, relW: 14, relH: 14, flipX: true, flipY: true },
            { role: 'border-top', name: 'Borda Voluta Topo', shapeId: 'border_classic_scroll', relX: 18, relY: 3, relW: 64, relH: 3 },
            { role: 'center-top', name: 'Brasão Déco Central', shapeId: 'centerpiece_art_deco_shield', relX: 43, relY: -3, relW: 14, relH: 10 }
        ]
    },
    {
        id: 'preset_frame_botanical_olive',
        title: 'Moldura Botânica de Oliveira & Folhagens',
        family: 'botanical',
        description: 'Folhas de oliveira nas quatro quinas e filete duplo harmonioso.',
        badge: '5 Componentes Editáveis',
        defaultWidthPct: 82,
        defaultHeightPct: 85,
        components: [
            { role: 'corner-tl', name: 'Ramo Oliveira Sup. Esq.', shapeId: 'corner_botanical_olive', relX: 0, relY: 0, relW: 16, relH: 16 },
            { role: 'corner-tr', name: 'Ramo Oliveira Sup. Dir.', shapeId: 'corner_botanical_olive', relX: 84, relY: 0, relW: 16, relH: 16, flipX: true },
            { role: 'corner-bl', name: 'Ramo Oliveira Inf. Esq.', shapeId: 'corner_botanical_olive', relX: 0, relY: 84, relW: 16, relH: 16, flipY: true },
            { role: 'corner-br', name: 'Ramo Oliveira Inf. Dir.', shapeId: 'corner_botanical_olive', relX: 84, relY: 84, relW: 16, relH: 16, flipX: true, flipY: true },
            { role: 'border-top', name: 'Filete Topo', shapeId: 'border_classic_double', relX: 18, relY: 2, relW: 64, relH: 2.2 }
        ]
    },
    {
        id: 'preset_frame_minimalist_fine',
        title: 'Moldura Minimalista Fina com Ponto',
        family: 'minimalist',
        description: 'Vértices ultrafinos e filetes sutis com estética de alta pureza e ausência de ruído.',
        badge: '6 Componentes Editáveis',
        defaultWidthPct: 86,
        defaultHeightPct: 88,
        components: [
            { role: 'corner-tl', name: 'Canto Fino Sup. Esq.', shapeId: 'corner_minimalist_fine', relX: 0, relY: 0, relW: 10, relH: 10 },
            { role: 'corner-tr', name: 'Canto Fino Sup. Dir.', shapeId: 'corner_minimalist_fine', relX: 90, relY: 0, relW: 10, relH: 10, flipX: true },
            { role: 'corner-bl', name: 'Canto Fino Inf. Esq.', shapeId: 'corner_minimalist_fine', relX: 0, relY: 90, relW: 10, relH: 10, flipY: true },
            { role: 'corner-br', name: 'Canto Fino Inf. Dir.', shapeId: 'corner_minimalist_fine', relX: 90, relY: 90, relW: 10, relH: 10, flipX: true, flipY: true },
            { role: 'border-top', name: 'Filete Nobre Topo', shapeId: 'border_neoclassic_fillet', relX: 12, relY: 2.2, relW: 76, relH: 2 },
            { role: 'border-bottom', name: 'Filete Nobre Base', shapeId: 'border_neoclassic_fillet', relX: 12, relY: 96.3, relW: 76, relH: 2 }
        ]
    }
];

export const getOrnamentById = (id: string): OrnamentItemDefinition | undefined => {
    return ORNAMENT_ITEMS.find(item => item.id === id);
};

export const getOrnamentsByCategory = (category: OrnamentCategory): OrnamentItemDefinition[] => {
    return ORNAMENT_ITEMS.filter(item => item.category === category);
};

export const getOrnamentsByFamily = (family: OrnamentVisualFamily): OrnamentItemDefinition[] => {
    return ORNAMENT_ITEMS.filter(item => item.family === family);
};

export const getCompatibleOrnaments = (item: OrnamentItemDefinition): OrnamentItemDefinition[] => {
    if (item.compatibleWith && item.compatibleWith.length > 0) {
        const direct = ORNAMENT_ITEMS.filter(o => item.compatibleWith!.includes(o.id));
        if (direct.length > 0) return direct;
    }
    // Fallback para mesma família excluindo o próprio item
    return ORNAMENT_ITEMS.filter(o => o.family === item.family && o.id !== item.id).slice(0, 6);
};
