export interface VectorShapeBounds {
    x: number;
    y: number;
    width: number;
    height: number;
}

const boundsCache = new Map<string, VectorShapeBounds>();

export function getSvgPathBounds(d: string): VectorShapeBounds {
    if (!d) return { x: 0, y: 0, width: 100, height: 100 };
    const cached = boundsCache.get(d);
    if (cached) return cached;

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    const tokens = d.match(/([a-df-z])|([-+]?[0-9]*\.?[0-9]+(?:e[-+]?[0-9]+)?)/gi) || [];
    let curX = 0, curY = 0;
    let i = 0;
    let cmd = "";

    const update = (x: number, y: number) => {
        if (!isNaN(x) && isFinite(x)) {
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
        }
        if (!isNaN(y) && isFinite(y)) {
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
        }
    };

    while (i < tokens.length) {
        const token = tokens[i];
        if (/^[a-df-z]$/i.test(token)) {
            cmd = token;
            i++;
            continue;
        }
        const upper = cmd.toUpperCase();

        if (upper === "M" || upper === "L" || upper === "T") {
            const x = parseFloat(tokens[i++]);
            const y = parseFloat(tokens[i++]);
            curX = x; curY = y;
            update(curX, curY);
        } else if (upper === "H") {
            curX = parseFloat(tokens[i++]);
            update(curX, curY);
        } else if (upper === "V") {
            curY = parseFloat(tokens[i++]);
            update(curX, curY);
        } else if (upper === "C") {
            const x1 = parseFloat(tokens[i++]), y1 = parseFloat(tokens[i++]);
            const x2 = parseFloat(tokens[i++]), y2 = parseFloat(tokens[i++]);
            const x = parseFloat(tokens[i++]), y = parseFloat(tokens[i++]);
            update(x1, y1); update(x2, y2);
            curX = x; curY = y;
            update(curX, curY);
        } else if (upper === "S" || upper === "Q") {
            const x1 = parseFloat(tokens[i++]), y1 = parseFloat(tokens[i++]);
            const x = parseFloat(tokens[i++]), y = parseFloat(tokens[i++]);
            update(x1, y1);
            curX = x; curY = y;
            update(curX, curY);
        } else if (upper === "A") {
            tokens[i++]; // rx
            tokens[i++]; // ry
            tokens[i++]; // rot
            tokens[i++]; // large
            tokens[i++]; // sweep
            const x = parseFloat(tokens[i++]);
            const y = parseFloat(tokens[i++]);
            curX = x; curY = y;
            update(curX, curY);
        } else {
            i++;
        }
    }

    if (minX === Infinity || maxX === -Infinity || minY === Infinity || maxY === -Infinity) {
        const fallback = { x: 0, y: 0, width: 100, height: 100 };
        boundsCache.set(d, fallback);
        return fallback;
    }

    const width = maxX - minX;
    const height = maxY - minY;
    const res = { 
        x: minX, 
        y: minY, 
        width: width > 0.01 ? width : 1, 
        height: height > 0.01 ? height : 1 
    };
    boundsCache.set(d, res);
    return res;
}

export type VectorShapeCategory = 
    | 'geometric'
    | 'frames'
    | 'ornaments'
    | 'corners'
    | 'dividers'
    | 'labels'
    | 'ribbons'
    | 'botanicals'
    | 'organic'
    | 'composition';

export type VectorShapeAesthetic = 
    | 'minimalist'
    | 'elegant'
    | 'organic'
    | 'vintage'
    | 'editorial'
    | 'romantic'
    | 'handcrafted'
    | 'luxury';

export interface VectorShapeDefinition {
    id: string;
    name: string;
    category: VectorShapeCategory;
    aesthetic: VectorShapeAesthetic;
    description: string;
    path: string;
    viewBox?: string; // Defaults to "0 0 100 100"
    fillRule?: 'nonzero' | 'evenodd';
    defaultRatio?: number; // width / height
    defaultW_MM?: number;
    defaultH_MM?: number;
    defaultFill?: string;
    defaultStroke?: string;
    defaultBorderWidth?: number;
    tags: string[];
}

export const VECTOR_SHAPES_CATEGORIES: { id: 'all' | VectorShapeCategory; label: string; icon: string; description: string }[] = [
    { id: 'all', label: 'Todos os Elementos', icon: 'Sparkles', description: 'Visão geral da coleção de papelaria' },
    { id: 'geometric', label: 'Formas Geométricas', icon: 'Shapes', description: 'Retângulos, círculos, triângulos, estrelas, hexágonos e silhuetas clássicas' },
    { id: 'frames', label: 'Molduras', icon: 'Square', description: 'Bordas finas, duplas, arqueadas e sofisticadas' },
    { id: 'ornaments', label: 'Ornamentos', icon: 'Flower2', description: 'Arabescos, volutas, floreios e acentos' },
    { id: 'corners', label: 'Cantos', icon: 'Maximize2', description: 'Cantoneiras, ramos angulares e acabamentos espelháveis' },
    { id: 'dividers', label: 'Divisores', icon: 'Minus', description: 'Separadores de texto, filetes duplos e linhas ornamentais' },
    { id: 'botanicals', label: 'Botânicos', icon: 'Leaf', description: 'Folhagens, ramos de oliveira, guirlandas e brotos' },
    { id: 'labels', label: 'Selos & Etiquetas', icon: 'Bookmark', description: 'Medalhões, emblemas, carimbos e tags com recortes' },
    { id: 'ribbons', label: 'Fitas & Banners', icon: 'BookmarkCheck', description: 'Faixas dobradas, ribbons curvos e cartelas de título' },
    { id: 'organic', label: 'Formas Orgânicas', icon: 'Shapes', description: 'Blobs fluidos, silhuetas assimétricas e papel recortado' },
    { id: 'composition', label: 'Peças de Composição', icon: 'Layout', description: 'Conjuntos para títulos, monogramas, cabeçalhos e fotos' },
];

export const VECTOR_SHAPE_AESTHETICS: { id: 'all' | VectorShapeAesthetic; label: string; description: string }[] = [
    { id: 'all', label: 'Todos os Estilos', description: 'Visualizar todas as linguagens visuais' },
    { id: 'minimalist', label: 'Minimalista', description: 'Linhas puras, sem excessos, precisão geométrica' },
    { id: 'elegant', label: 'Elegante', description: 'Harmonia clássica, curvas suaves e nobreza' },
    { id: 'editorial', label: 'Editorial', description: 'Estética de livros de arte, revistas e alta tipografia' },
    { id: 'vintage', label: 'Vintage', description: 'Reinterpretação contemporânea de camafeus, tipografia antiga e ornatos' },
    { id: 'luxury', label: 'Luxo', description: 'Filetes nobres, lapidações e inspiração em douramento' },
    { id: 'romantic', label: 'Romântico', description: 'Volutas florais, caligrafia lírica e fluidez' },
    { id: 'organic', label: 'Orgânico', description: 'Formas biomórficas inspiradas na natureza e folhas vivas' },
    { id: 'handcrafted', label: 'Artesanal', description: 'Visual de papel artesanal, bordas rasgadas e toque manual' },
];

export const STATIONERY_COLOR_PRESETS = [
    { id: 'noir', name: 'Preto Editorial', fill: 'transparent', stroke: '#18181b', strokeWidth: 1.2 },
    { id: 'antique_gold', name: 'Ouro Real', fill: '#fffbeb', stroke: '#b45309', strokeWidth: 1.2 },
    { id: 'champagne', name: 'Champanhe Nobre', fill: '#faf5ff', stroke: '#9333ea', strokeWidth: 1.2 },
    { id: 'dusty_rose', name: 'Rosa Poudré', fill: '#fff1f2', stroke: '#e11d48', strokeWidth: 1.2 },
    { id: 'sage_green', name: 'Verde Sálvia', fill: '#f0fdf4', stroke: '#15803d', strokeWidth: 1.2 },
    { id: 'french_blue', name: 'Azul Provençal', fill: '#eff6ff', stroke: '#1d4ed8', strokeWidth: 1.2 },
    { id: 'terracotta', name: 'Terracota Quente', fill: '#fff7ed', stroke: '#c2410c', strokeWidth: 1.2 },
    { id: 'monochrome', name: 'Grafite Fino', fill: '#ffffff', stroke: '#4b5563', strokeWidth: 1.0 },
    { id: 'burgundy', name: 'Borgonha Profundo', fill: '#fff1f2', stroke: '#881337', strokeWidth: 1.2 },
    { id: 'emerald', name: 'Esmeralda Nobre', fill: '#ecfdf5', stroke: '#065f46', strokeWidth: 1.2 },
];

export const VECTOR_SHAPES: VectorShapeDefinition[] = [
    {
    "id": "geo_rectangle",
    "name": "Retângulo Clássico",
    "category": "geometric",
    "aesthetic": "minimalist",
    "description": "Retângulo com cantos vivos para caixas, enquadramentos e blocos de texto",
    "path": "M 6,10 L 94,10 L 94,90 L 6,90 Z",
    "defaultRatio": 1.4,
    "defaultW_MM": 42,
    "defaultH_MM": 30,
    "defaultFill": "transparent",
    "defaultStroke": "#18181b",
    "defaultBorderWidth": 1.2,
    "tags": [
        "retângulo",
        "caixa",
        "quadro",
        "geométrico",
        "bloco",
        "básico",
        "forma clássica"
    ]
},
    {
    "id": "geo_rounded_rect",
    "name": "Retângulo Arredondado",
    "category": "geometric",
    "aesthetic": "minimalist",
    "description": "Retângulo com cantos suaves para botões, etiquetas e cartões",
    "path": "M 18,10 L 82,10 C 88,10 94,16 94,22 L 94,78 C 94,84 88,90 82,90 L 18,90 C 12,90 6,84 6,78 L 6,22 C 6,16 12,10 18,10 Z",
    "defaultRatio": 1.4,
    "defaultW_MM": 42,
    "defaultH_MM": 30,
    "defaultFill": "transparent",
    "defaultStroke": "#18181b",
    "defaultBorderWidth": 1.2,
    "tags": [
        "retângulo arredondado",
        "cantos arredondados",
        "card",
        "suave",
        "geométrico",
        "forma clássica"
    ]
},
    {
    "id": "geo_square",
    "name": "Quadrado",
    "category": "geometric",
    "aesthetic": "minimalist",
    "description": "Quadrado geométrico com cantos retos e proporção perfeita 1:1",
    "path": "M 8,8 L 92,8 L 92,92 L 8,92 Z",
    "defaultRatio": 1,
    "defaultW_MM": 30,
    "defaultH_MM": 30,
    "defaultFill": "transparent",
    "defaultStroke": "#18181b",
    "defaultBorderWidth": 1.2,
    "tags": [
        "quadrado",
        "caixa",
        "geométrico",
        "1:1",
        "forma clássica"
    ]
},
    {
    "id": "geo_square_rounded",
    "name": "Quadrado Arredondado (Squircle)",
    "category": "geometric",
    "aesthetic": "minimalist",
    "description": "Quadrado com cantos arredondados estilo contemporâneo",
    "path": "M 25,8 L 75,8 C 87,8 92,13 92,25 L 92,75 C 92,87 87,92 75,92 L 25,92 C 13,92 8,87 8,75 L 8,25 C 8,13 13,8 25,8 Z",
    "defaultRatio": 1,
    "defaultW_MM": 30,
    "defaultH_MM": 30,
    "defaultFill": "transparent",
    "defaultStroke": "#18181b",
    "defaultBorderWidth": 1.2,
    "tags": [
        "quadrado arredondado",
        "squircle",
        "ícone",
        "geométrico",
        "forma clássica"
    ]
},
    {
    "id": "geo_circle",
    "name": "Círculo Perfeito",
    "category": "geometric",
    "aesthetic": "minimalist",
    "description": "Círculo clássico suave para selos, fotos e monogramas",
    "path": "M 50,6 A 44,44 0 1,0 50,94 A 44,44 0 1,0 50,6 Z",
    "defaultRatio": 1,
    "defaultW_MM": 30,
    "defaultH_MM": 30,
    "defaultFill": "transparent",
    "defaultStroke": "#18181b",
    "defaultBorderWidth": 1.2,
    "tags": [
        "círculo",
        "redondo",
        "disco",
        "anel",
        "geométrico",
        "forma clássica"
    ]
},
    {
    "id": "geo_oval",
    "name": "Oval / Elipse",
    "category": "geometric",
    "aesthetic": "elegant",
    "description": "Elipse harmoniosa para camafeus, medalhões e fotos ovais",
    "path": "M 50,12 C 75,12 94,29 94,50 C 94,71 75,88 50,88 C 25,88 6,71 6,50 C 6,29 25,12 50,12 Z",
    "defaultRatio": 1.4,
    "defaultW_MM": 42,
    "defaultH_MM": 30,
    "defaultFill": "transparent",
    "defaultStroke": "#18181b",
    "defaultBorderWidth": 1.2,
    "tags": [
        "oval",
        "elipse",
        "medalhão",
        "redondo",
        "geométrico",
        "forma clássica"
    ]
},
    {
    "id": "geo_triangle",
    "name": "Triângulo Equilátero",
    "category": "geometric",
    "aesthetic": "minimalist",
    "description": "Triângulo clássico equilibrado com base plana",
    "path": "M 50,8 L 92,86 L 8,86 Z",
    "defaultRatio": 1.15,
    "defaultW_MM": 32,
    "defaultH_MM": 28,
    "defaultFill": "transparent",
    "defaultStroke": "#18181b",
    "defaultBorderWidth": 1.2,
    "tags": [
        "triângulo",
        "equilátero",
        "pirâmide",
        "geométrico",
        "forma clássica"
    ]
},
    {
    "id": "geo_triangle_inverted",
    "name": "Triângulo Invertido",
    "category": "geometric",
    "aesthetic": "minimalist",
    "description": "Triângulo com ponta inferior para marcadores e detalhes visuais",
    "path": "M 8,14 L 92,14 L 50,92 Z",
    "defaultRatio": 1.15,
    "defaultW_MM": 32,
    "defaultH_MM": 28,
    "defaultFill": "transparent",
    "defaultStroke": "#18181b",
    "defaultBorderWidth": 1.2,
    "tags": [
        "triângulo invertido",
        "marcador",
        "seta",
        "geométrico",
        "forma clássica"
    ]
},
    {
    "id": "geo_triangle_right",
    "name": "Triângulo Retângulo",
    "category": "geometric",
    "aesthetic": "minimalist",
    "description": "Triângulo em ângulo reto de 90° para cantoneiras e diagonais",
    "path": "M 10,10 L 90,90 L 10,90 Z",
    "defaultRatio": 1,
    "defaultW_MM": 30,
    "defaultH_MM": 30,
    "defaultFill": "transparent",
    "defaultStroke": "#18181b",
    "defaultBorderWidth": 1.2,
    "tags": [
        "triângulo retângulo",
        "canto",
        "diagonal",
        "esquadro",
        "geométrico"
    ]
},
    {
    "id": "geo_star_5",
    "name": "Estrela Clássica (5 Pontas)",
    "category": "geometric",
    "aesthetic": "minimalist",
    "description": "Estrela tradicional de cinco pontas para avaliações, destaques e favoritos",
    "path": "M 50,6 L 62.4,32.8 L 92,36.8 L 70.3,57.1 L 75.8,86.2 L 50,72.2 L 24.2,86.2 L 29.7,57.1 L 8,36.8 L 37.6,32.8 Z",
    "defaultRatio": 1,
    "defaultW_MM": 30,
    "defaultH_MM": 30,
    "defaultFill": "transparent",
    "defaultStroke": "#18181b",
    "defaultBorderWidth": 1.2,
    "tags": [
        "estrela",
        "5 pontas",
        "favorito",
        "destaque",
        "geométrico",
        "forma clássica"
    ]
},
    {
    "id": "geo_star_4",
    "name": "Estrela de 4 Pontas (Brilho)",
    "category": "geometric",
    "aesthetic": "elegant",
    "description": "Estrela cintilante de quatro pontas para toques mágicos e convites",
    "path": "M 50,6 Q 50,44 94,50 Q 50,56 50,94 Q 50,56 6,50 Q 50,44 50,6 Z",
    "defaultRatio": 1,
    "defaultW_MM": 28,
    "defaultH_MM": 28,
    "defaultFill": "transparent",
    "defaultStroke": "#18181b",
    "defaultBorderWidth": 1.2,
    "tags": [
        "estrela 4 pontas",
        "brilho",
        "cintilante",
        "diamante",
        "sparkle",
        "geométrico"
    ]
},
    {
    "id": "geo_star_8",
    "name": "Estrela de 8 Pontas (Rosa dos Ventos)",
    "category": "geometric",
    "aesthetic": "luxury",
    "description": "Estrela octogonal clássica de inspiração cartográfica e nobre",
    "path": "M 50,6 L 59,34 L 86,24 L 69,45 L 94,50 L 69,55 L 86,76 L 59,66 L 50,94 L 41,66 L 14,76 L 31,55 L 6,50 L 31,45 L 14,24 L 41,34 Z",
    "defaultRatio": 1,
    "defaultW_MM": 32,
    "defaultH_MM": 32,
    "defaultFill": "transparent",
    "defaultStroke": "#18181b",
    "defaultBorderWidth": 1.2,
    "tags": [
        "estrela 8 pontas",
        "rosa dos ventos",
        "brasão",
        "medalha",
        "geométrico"
    ]
},
    {
    "id": "geo_heart",
    "name": "Coração Clássico",
    "category": "geometric",
    "aesthetic": "romantic",
    "description": "Coração delicado e harmonioso para cartões de amor e casamento",
    "path": "M 50,88 C 46,84 10,58 10,32 C 10,18 21,8 35,8 C 43,8 47,12 50,17 C 53,12 57,8 65,8 C 79,8 90,18 90,32 C 90,58 54,84 50,88 Z",
    "defaultRatio": 1,
    "defaultW_MM": 30,
    "defaultH_MM": 30,
    "defaultFill": "transparent",
    "defaultStroke": "#18181b",
    "defaultBorderWidth": 1.2,
    "tags": [
        "coração",
        "amor",
        "romântico",
        "casamento",
        "geométrico",
        "forma clássica"
    ]
},
    {
    "id": "geo_diamond",
    "name": "Losango / Diamante",
    "category": "geometric",
    "aesthetic": "minimalist",
    "description": "Losango clássico perfeitamente simétrico para cartões e estampas",
    "path": "M 50,6 L 94,50 L 50,94 L 6,50 Z",
    "defaultRatio": 1,
    "defaultW_MM": 30,
    "defaultH_MM": 30,
    "defaultFill": "transparent",
    "defaultStroke": "#18181b",
    "defaultBorderWidth": 1.2,
    "tags": [
        "losango",
        "diamante",
        "rombo",
        "simétrico",
        "geométrico",
        "forma clássica"
    ]
},
    {
    "id": "geo_hexagon",
    "name": "Hexágono Regular",
    "category": "geometric",
    "aesthetic": "minimalist",
    "description": "Hexágono simétrico de 6 lados inspirado em favo de mel",
    "path": "M 50,6 L 90,28 L 90,72 L 50,94 L 10,72 L 10,28 Z",
    "defaultRatio": 1,
    "defaultW_MM": 30,
    "defaultH_MM": 30,
    "defaultFill": "transparent",
    "defaultStroke": "#18181b",
    "defaultBorderWidth": 1.2,
    "tags": [
        "hexágono",
        "6 lados",
        "colmeia",
        "polígono",
        "geométrico",
        "forma clássica"
    ]
},
    {
    "id": "geo_octagon",
    "name": "Octógono Regular",
    "category": "geometric",
    "aesthetic": "minimalist",
    "description": "Polígono de 8 lados para molduras, sinalização e tags de presente",
    "path": "M 32,8 L 68,8 L 92,32 L 92,68 L 68,92 L 32,92 L 8,68 L 8,32 Z",
    "defaultRatio": 1,
    "defaultW_MM": 30,
    "defaultH_MM": 30,
    "defaultFill": "transparent",
    "defaultStroke": "#18181b",
    "defaultBorderWidth": 1.2,
    "tags": [
        "octógono",
        "8 lados",
        "polígono",
        "geométrico",
        "forma clássica"
    ]
},
    {
    "id": "geo_pentagon",
    "name": "Pentágono Regular",
    "category": "geometric",
    "aesthetic": "minimalist",
    "description": "Polígono de 5 lados com ponta superior",
    "path": "M 50,6 L 94,38 L 77,88 L 23,88 L 6,38 Z",
    "defaultRatio": 1,
    "defaultW_MM": 30,
    "defaultH_MM": 30,
    "defaultFill": "transparent",
    "defaultStroke": "#18181b",
    "defaultBorderWidth": 1.2,
    "tags": [
        "pentágono",
        "5 lados",
        "polígono",
        "geométrico",
        "forma clássica"
    ]
},
    {
    "id": "geo_trapezoid",
    "name": "Trapézio Isósceles",
    "category": "geometric",
    "aesthetic": "minimalist",
    "description": "Trapézio simétrico com base larga para elementos arquitetônicos",
    "path": "M 25,12 L 75,12 L 94,88 L 6,88 Z",
    "defaultRatio": 1.4,
    "defaultW_MM": 42,
    "defaultH_MM": 30,
    "defaultFill": "transparent",
    "defaultStroke": "#18181b",
    "defaultBorderWidth": 1.2,
    "tags": [
        "trapézio",
        "isósceles",
        "angular",
        "geométrico"
    ]
},
    {
    "id": "geo_parallelogram",
    "name": "Paralelogramo",
    "category": "geometric",
    "aesthetic": "editorial",
    "description": "Forma inclinada dinâmica para faixas e cartelas com dinamismo",
    "path": "M 28,15 L 94,15 L 72,85 L 6,85 Z",
    "defaultRatio": 1.5,
    "defaultW_MM": 45,
    "defaultH_MM": 30,
    "defaultFill": "transparent",
    "defaultStroke": "#18181b",
    "defaultBorderWidth": 1.2,
    "tags": [
        "paralelogramo",
        "inclinado",
        "itálico",
        "dinâmico",
        "geométrico"
    ]
},
    {
    "id": "geo_cross",
    "name": "Cruz / Sinal de Mais",
    "category": "geometric",
    "aesthetic": "minimalist",
    "description": "Cruz geométrica com braços proporcionais e cantos vivos",
    "path": "M 36,8 L 64,8 L 64,36 L 92,36 L 92,64 L 64,64 L 64,92 L 36,92 L 36,64 L 8,64 L 8,36 L 36,36 Z",
    "defaultRatio": 1,
    "defaultW_MM": 28,
    "defaultH_MM": 28,
    "defaultFill": "transparent",
    "defaultStroke": "#18181b",
    "defaultBorderWidth": 1.2,
    "tags": [
        "cruz",
        "mais",
        "adição",
        "positivo",
        "geométrico",
        "forma clássica"
    ]
},
    {
    "id": "geo_semicircle",
    "name": "Semicírculo / Meio Círculo",
    "category": "geometric",
    "aesthetic": "minimalist",
    "description": "Meio círculo geométrico perfeito para cabeçalhos e decorações",
    "path": "M 8,82 A 42,42 0 0,1 92,82 Z",
    "defaultRatio": 1.7,
    "defaultW_MM": 40,
    "defaultH_MM": 24,
    "defaultFill": "transparent",
    "defaultStroke": "#18181b",
    "defaultBorderWidth": 1.2,
    "tags": [
        "semicírculo",
        "meio círculo",
        "arco",
        "cúpula",
        "geométrico"
    ]
},
    {
    "id": "geo_arch",
    "name": "Arco Romano / Portal",
    "category": "geometric",
    "aesthetic": "editorial",
    "description": "Portal arquitetônico com topo arqueado e laterais retas",
    "path": "M 10,92 L 10,48 C 10,24 28,6 50,6 C 72,6 90,24 90,48 L 90,92 Z",
    "defaultRatio": 0.8,
    "defaultW_MM": 28,
    "defaultH_MM": 36,
    "defaultFill": "transparent",
    "defaultStroke": "#18181b",
    "defaultBorderWidth": 1.2,
    "tags": [
        "arco",
        "portal",
        "arquitetura",
        "moldura",
        "geométrico",
        "editorial"
    ]
},
    {
    "id": "geo_teardrop",
    "name": "Gota d'Água / Lágrima",
    "category": "geometric",
    "aesthetic": "organic",
    "description": "Forma fluida de gota com ponta superior e base redonda",
    "path": "M 50,6 C 50,6 12,48 12,68 C 12,86 28,94 50,94 C 72,94 88,86 88,68 C 88,48 50,6 50,6 Z",
    "defaultRatio": 0.9,
    "defaultW_MM": 28,
    "defaultH_MM": 32,
    "defaultFill": "transparent",
    "defaultStroke": "#18181b",
    "defaultBorderWidth": 1.2,
    "tags": [
        "gota",
        "lágrima",
        "água",
        "fluido",
        "geométrico"
    ]
},
    {
    "id": "geo_pill",
    "name": "Pílula / Cápsula Longa",
    "category": "geometric",
    "aesthetic": "minimalist",
    "description": "Forma alongada com pontas arredondadas para tags e cartelas",
    "path": "M 28,16 L 72,16 C 88,16 88,84 72,84 L 28,84 C 12,84 12,16 28,16 Z",
    "defaultRatio": 2,
    "defaultW_MM": 50,
    "defaultH_MM": 25,
    "defaultFill": "transparent",
    "defaultStroke": "#18181b",
    "defaultBorderWidth": 1.2,
    "tags": [
        "pílula",
        "cápsula",
        "tag",
        "botão",
        "geométrico"
    ]
},
    {
    "id": "geo_arrow_right",
    "name": "Seta Direita",
    "category": "geometric",
    "aesthetic": "minimalist",
    "description": "Seta direcional clássica e limpa",
    "path": "M 8,36 L 55,36 L 55,16 L 94,50 L 55,84 L 55,64 L 8,64 Z",
    "defaultRatio": 1.4,
    "defaultW_MM": 35,
    "defaultH_MM": 25,
    "defaultFill": "transparent",
    "defaultStroke": "#18181b",
    "defaultBorderWidth": 1.2,
    "tags": [
        "seta",
        "direção",
        "indicador",
        "geométrico"
    ]
},
    {
    "id": "geo_speech_bubble",
    "name": "Balão de Diálogo",
    "category": "geometric",
    "aesthetic": "minimalist",
    "description": "Balão de fala para mensagens, citações e diálogos",
    "path": "M 18,10 L 82,10 C 90,10 94,15 94,22 L 94,62 C 94,69 90,74 82,74 L 38,74 L 20,92 L 24,74 L 18,74 C 10,74 6,69 6,62 L 6,22 C 6,15 10,10 18,10 Z",
    "defaultRatio": 1.3,
    "defaultW_MM": 38,
    "defaultH_MM": 30,
    "defaultFill": "transparent",
    "defaultStroke": "#18181b",
    "defaultBorderWidth": 1.2,
    "tags": [
        "balão de fala",
        "balão de diálogo",
        "conversa",
        "texto",
        "geométrico"
    ]
},
    {
    "id": "geo_shield",
    "name": "Escudo / Brasão Geométrico",
    "category": "geometric",
    "aesthetic": "vintage",
    "description": "Silhueta de escudo nobre com ponta inferior clássica",
    "path": "M 10,10 L 90,10 L 90,52 C 90,74 50,92 50,92 C 50,92 10,74 10,52 Z",
    "defaultRatio": 0.9,
    "defaultW_MM": 28,
    "defaultH_MM": 32,
    "defaultFill": "transparent",
    "defaultStroke": "#18181b",
    "defaultBorderWidth": 1.2,
    "tags": [
        "escudo",
        "brasão",
        "emblema",
        "nobre",
        "geométrico"
    ]
},
    {
        "id": "frame_minimal_hairline_gaps",
        "name": "Moldura Minimal com Respiros Laterais",
        "category": "frames",
        "aesthetic": "minimalist",
        "description": "Linhas finas que se interrompem no centro de cada lado criando leveza editorial",
        "path": "M 10,24 L 10,10 L 24,10 M 76,10 L 90,10 L 90,24 M 90,76 L 90,90 L 76,90 M 24,90 L 10,90 L 10,76 M 10,38 L 10,62 M 90,38 L 90,62 M 38,10 L 62,10 M 38,90 L 62,90",
        "defaultRatio": 0.8,
        "defaultW_MM": 50,
        "defaultH_MM": 62,
        "defaultFill": "transparent",
        "defaultStroke": "#0f172a",
        "defaultBorderWidth": 1,
        "tags": [
            "minimalista",
            "respiro",
            "editorial",
            "hairline",
            "galeria",
            "moderno"
        ]
    },
    {
        "id": "frame_organic_blob_large",
        "name": "Moldura Orgânica Silhueta Biomórfica",
        "category": "frames",
        "aesthetic": "organic",
        "description": "Borda fluida assimétrica inspirada em argila e formas da natureza para convites modernos",
        "path": "M 50,6 C 78,4 94,18 92,44 C 90,72 82,92 52,94 C 24,96 8,82 8,52 C 8,22 22,8 50,6 Z",
        "defaultRatio": 0.85,
        "defaultW_MM": 52,
        "defaultH_MM": 62,
        "defaultFill": "#fef3c7",
        "defaultStroke": "#b45309",
        "defaultBorderWidth": 1.2,
        "tags": [
            "organico",
            "argila",
            "biomorfico",
            "fluido",
            "papelaria",
            "convite"
        ]
    },
    {
        "id": "frame_vintage_border_beaded",
        "name": "Moldura Vintage com Filete Perolado",
        "category": "frames",
        "aesthetic": "vintage",
        "description": "Moldura dupla com pequenas esferas ornamentais nos quatro vértices internos",
        "path": "M 8,8 L 92,8 L 92,92 L 8,92 Z M 14,14 L 86,14 L 86,86 L 14,86 Z M 20,20 C 20,17 17,17 17,20 C 17,23 20,23 20,20 Z M 80,20 C 80,17 83,17 83,20 C 83,23 80,23 80,20 Z M 80,80 C 80,77 83,77 83,80 C 83,83 80,83 80,80 Z M 20,80 C 20,77 17,77 17,80 C 17,83 20,83 20,80 Z",
        "fillRule": "evenodd",
        "defaultRatio": 0.8,
        "defaultW_MM": 50,
        "defaultH_MM": 62,
        "defaultFill": "transparent",
        "defaultStroke": "#78350f",
        "defaultBorderWidth": 1.2,
        "tags": [
            "perolado",
            "vintage",
            "beaded",
            "ouro",
            "moldura",
            "certificado"
        ]
    },
    {
        "id": "frame_luxury_fillet_scallop",
        "name": "Moldura Nobre com Filete e Festonê Interno",
        "category": "frames",
        "aesthetic": "luxury",
        "description": "Retângulo externo nítido com rendilhado em ondas finas no contorno interior",
        "path": "M 6,6 L 94,6 L 94,94 L 6,94 Z M 14,14 L 86,14 L 86,86 L 14,86 Z",
        "fillRule": "evenodd",
        "defaultRatio": 0.75,
        "defaultW_MM": 55,
        "defaultH_MM": 70,
        "defaultFill": "#fffbeb",
        "defaultStroke": "#b45309",
        "defaultBorderWidth": 1.2,
        "tags": [
            "luxo",
            "filete",
            "festonê",
            "ouro",
            "diploma",
            "moldura"
        ]
    },
    {
        "id": "frame_handcrafted_torn_card",
        "name": "Moldura Cartão Rasgado Artesanal",
        "category": "frames",
        "aesthetic": "handcrafted",
        "description": "Bordas desgastadas e desfiadas simulando folha de papel artesanal de algodão",
        "path": "M 10,12 Q 22,9 38,13 Q 54,10 70,13 Q 84,11 90,16 Q 87,32 91,52 Q 86,72 89,86 Q 72,89 54,85 Q 36,89 20,85 Q 11,87 11,68 Q 13,48 10,32 Z",
        "defaultRatio": 0.78,
        "defaultW_MM": 50,
        "defaultH_MM": 64,
        "defaultFill": "#fafaf9",
        "defaultStroke": "#78716c",
        "defaultBorderWidth": 1.2,
        "tags": [
            "algodao",
            "rasgado",
            "deckle",
            "artesanal",
            "convite",
            "casamento"
        ]
    },
    {
        "id": "ornament_scroll_finial",
        "name": "Frontão Clássico em Voluta Arquitetônica",
        "category": "ornaments",
        "aesthetic": "luxury",
        "description": "Ornamento de coroamento clássico greco-romano para topo de certidões e convites",
        "path": "M 14,58 C 22,42 36,36 50,44 C 64,36 78,42 86,58 C 76,54 66,48 50,56 C 34,48 24,54 14,58 Z M 50,22 L 50,40 M 46,24 L 54,24",
        "defaultRatio": 2.2,
        "defaultW_MM": 55,
        "defaultH_MM": 25,
        "defaultFill": "transparent",
        "defaultStroke": "#b45309",
        "defaultBorderWidth": 1.2,
        "tags": [
            "frontao",
            "voluta",
            "grego",
            "arquitetura",
            "luxo",
            "coroamento"
        ]
    },
    {
        "id": "ornament_quill_monogram_nest",
        "name": "Ninho Caligráfico para Monograma",
        "category": "ornaments",
        "aesthetic": "romantic",
        "description": "Espiral contínua de bico de pena que envolve suavemente iniciais e monogramas",
        "path": "M 50,20 C 32,20 20,34 20,50 C 20,66 34,80 50,80 C 64,80 78,68 76,52 C 74,38 60,34 50,38 C 42,42 40,52 46,56",
        "defaultRatio": 1,
        "defaultW_MM": 40,
        "defaultH_MM": 40,
        "defaultFill": "transparent",
        "defaultStroke": "#be123c",
        "defaultBorderWidth": 1.2,
        "tags": [
            "monograma",
            "caligrafia",
            "espiral",
            "ninho",
            "romantico",
            "iniciais"
        ]
    },
    {
        "id": "ornament_laurel_branch_horizontal",
        "name": "Ramo de Louro Horizontal com Folhas Nobres",
        "category": "ornaments",
        "aesthetic": "luxury",
        "description": "Haste floral deitada com folíolos estilizados para posicionar sobre títulos",
        "path": "M 8,50 L 92,50 M 24,50 C 20,42 26,38 32,46 M 40,50 C 36,42 42,38 48,46 M 56,50 C 52,42 58,38 64,46 M 72,50 C 68,42 74,38 80,46 M 24,50 C 20,58 26,62 32,54 M 40,50 C 36,58 42,62 48,54 M 56,50 C 52,58 58,62 64,54 M 72,50 C 68,58 74,62 80,54",
        "defaultRatio": 4,
        "defaultW_MM": 60,
        "defaultH_MM": 15,
        "defaultFill": "#fffbeb",
        "defaultStroke": "#b45309",
        "defaultBorderWidth": 1.1,
        "tags": [
            "louro",
            "horizontal",
            "folhas",
            "luxo",
            "titulo",
            "medalha"
        ]
    },
    {
        "id": "corner_laurel_sprig",
        "name": "Cantoneira Ramo de Louro em Ângulo",
        "category": "corners",
        "aesthetic": "luxury",
        "description": "Dupla haste de louros nobres que abraça o vértice do layout em 90 graus",
        "path": "M 14,84 L 14,30 C 14,20 20,14 30,14 L 84,14 M 14,60 C 24,56 26,46 20,44 M 14,44 C 24,40 26,30 20,28 M 44,14 C 40,24 30,26 28,20 M 60,14 C 56,24 46,26 44,20",
        "defaultRatio": 1,
        "defaultW_MM": 36,
        "defaultH_MM": 36,
        "defaultFill": "#fffbeb",
        "defaultStroke": "#b45309",
        "defaultBorderWidth": 1.1,
        "tags": [
            "louro",
            "canto",
            "cantoneira",
            "luxo",
            "diploma",
            "brasao"
        ]
    },
    {
        "id": "corner_editorial_cross",
        "name": "Canto Editorial em Cruz Hairline",
        "category": "corners",
        "aesthetic": "editorial",
        "description": "Linhas finas perpendiculares com cruzamento que se estende além do vértice",
        "path": "M 4,20 L 80,20 M 20,4 L 20,80",
        "defaultRatio": 1,
        "defaultW_MM": 30,
        "defaultH_MM": 30,
        "defaultFill": "transparent",
        "defaultStroke": "#0f172a",
        "defaultBorderWidth": 1,
        "tags": [
            "canto",
            "cruz",
            "hairline",
            "editorial",
            "moderno",
            "simples"
        ]
    },
    {
        "id": "corner_floral_chamomile",
        "name": "Cantoneira com Florzinha Silvestre no Vértice",
        "category": "corners",
        "aesthetic": "romantic",
        "description": "Pequena margarida de pétalas delicadas com ramos que se estendem em ângulo reto",
        "path": "M 24,24 C 24,18 28,14 34,14 L 80,14 M 24,24 C 18,24 14,28 14,34 L 14,80 M 24,24 C 24,20 20,20 20,24 C 20,28 24,28 24,24 Z M 20,16 C 22,14 26,16 24,20 M 28,24 C 32,22 32,26 28,28 M 24,32 C 22,34 18,32 20,28 M 16,24 C 12,26 12,22 16,20",
        "defaultRatio": 1,
        "defaultW_MM": 35,
        "defaultH_MM": 35,
        "defaultFill": "#fff1f2",
        "defaultStroke": "#e11d48",
        "defaultBorderWidth": 1.1,
        "tags": [
            "flor",
            "margarida",
            "canto",
            "romantico",
            "delicado",
            "festa"
        ]
    },
    {
        "id": "divider_flourish_swirl_duo",
        "name": "Divisor com Volutas Caligráficas Espelhadas",
        "category": "dividers",
        "aesthetic": "romantic",
        "description": "Dois floreios caligráficos fluidos que se tocam no centro com pontas estendidas",
        "path": "M 8,50 C 24,34 38,66 50,50 C 62,34 76,66 92,50",
        "defaultRatio": 5,
        "defaultW_MM": 60,
        "defaultH_MM": 12,
        "defaultFill": "transparent",
        "defaultStroke": "#be123c",
        "defaultBorderWidth": 1.2,
        "tags": [
            "divisor",
            "voluta",
            "caligrafia",
            "romantico",
            "casamento",
            "separador"
        ]
    },
    {
        "id": "divider_editorial_dashes",
        "name": "Divisor Editorial com Cadência Geométrica",
        "category": "dividers",
        "aesthetic": "editorial",
        "description": "Linhas alternadas com ritmo formal contemporâneo para quebra de seções em revistas",
        "path": "M 6,50 L 32,50 M 38,50 L 46,50 M 50,47 L 50,53 M 54,50 L 62,50 M 68,50 L 94,50",
        "defaultRatio": 6,
        "defaultW_MM": 60,
        "defaultH_MM": 10,
        "defaultFill": "transparent",
        "defaultStroke": "#0f172a",
        "defaultBorderWidth": 1,
        "tags": [
            "cadencia",
            "ritmo",
            "editorial",
            "linhas",
            "secao",
            "minimalista"
        ]
    },
    {
        "id": "botanical_wildflower_duo",
        "name": "Duo de Flores Silvestres com Hastes Finas",
        "category": "botanicals",
        "aesthetic": "romantic",
        "description": "Duas flores campestres em elevação delicada com pequenas folhas laterais",
        "path": "M 40,88 C 40,60 44,40 42,28 M 42,28 C 36,24 38,18 42,18 C 46,18 48,24 42,28 Z M 60,88 C 60,65 56,50 62,38 M 62,38 C 56,34 58,28 62,28 C 66,28 68,34 62,38 Z M 41,54 C 32,50 30,58 38,62 M 59,58 C 68,54 70,62 62,66",
        "defaultRatio": 0.65,
        "defaultW_MM": 30,
        "defaultH_MM": 46,
        "defaultFill": "#fff1f2",
        "defaultStroke": "#e11d48",
        "defaultBorderWidth": 1.1,
        "tags": [
            "flores",
            "silvestre",
            "campo",
            "primavera",
            "romantico",
            "delicado"
        ]
    },
    {
        "id": "botanical_monstera_leaf",
        "name": "Folha de Costela-de-Adão Linear",
        "category": "botanicals",
        "aesthetic": "editorial",
        "description": "Costela-de-Adão moderna estilizada com recortes limpos para papelaria botânica chique",
        "path": "M 50,92 L 50,14 C 50,14 74,18 80,36 C 74,38 66,36 60,40 C 76,46 76,58 64,60 C 70,68 64,74 50,80 C 36,74 30,68 36,60 C 24,58 24,46 40,40 C 34,36 26,38 20,36 C 26,18 50,14 50,14 Z",
        "defaultRatio": 0.85,
        "defaultW_MM": 38,
        "defaultH_MM": 45,
        "defaultFill": "#ecfdf5",
        "defaultStroke": "#047857",
        "defaultBorderWidth": 1.1,
        "tags": [
            "costeladeadao",
            "monstera",
            "tropical",
            "editorial",
            "moderno",
            "verde"
        ]
    },
    {
        "id": "botanical_wheat_ear",
        "name": "Espiga de Trigo / Trigo Dourado",
        "category": "botanicals",
        "aesthetic": "handcrafted",
        "description": "Grãos de trigo estilizados simbolizando colheita, fartura e celebração artesanal",
        "path": "M 50,92 L 50,16 M 50,24 C 44,20 44,14 50,10 C 56,14 56,20 50,24 Z M 50,38 C 42,34 40,26 48,24 C 52,30 50,38 50,38 Z M 50,38 C 58,34 60,26 52,24 C 48,30 50,38 50,38 Z M 50,54 C 42,50 40,42 48,40 C 52,46 50,54 50,54 Z M 50,54 C 58,50 60,42 52,40 C 48,46 50,54 50,54 Z M 50,70 C 42,66 40,58 48,56 C 52,62 50,70 50,70 Z M 50,70 C 58,66 60,58 52,56 C 48,62 50,70 50,70 Z",
        "defaultRatio": 0.55,
        "defaultW_MM": 25,
        "defaultH_MM": 45,
        "defaultFill": "#fef3c7",
        "defaultStroke": "#b45309",
        "defaultBorderWidth": 1.1,
        "tags": [
            "trigo",
            "espiga",
            "fartura",
            "colheita",
            "artesanal",
            "dourado"
        ]
    },
    {
        "id": "label_capsule_modern",
        "name": "Selo Cápsula Alongada Minimalista",
        "category": "labels",
        "aesthetic": "minimalist",
        "description": "Formato ovalado em pílula com traço fino para datas, valores ou categorias",
        "path": "M 28,26 L 72,26 C 84,26 92,36 92,50 C 92,64 84,74 72,74 L 28,74 C 16,74 8,64 8,50 C 8,36 16,26 28,26 Z",
        "defaultRatio": 2.2,
        "defaultW_MM": 55,
        "defaultH_MM": 25,
        "defaultFill": "#f8fafc",
        "defaultStroke": "#0f172a",
        "defaultBorderWidth": 1.1,
        "tags": [
            "capsula",
            "pilula",
            "minimalista",
            "moderno",
            "data",
            "etiqueta"
        ]
    },
    {
        "id": "label_florentine_shield",
        "name": "Escudo Heráldico Florentino Nobre",
        "category": "labels",
        "aesthetic": "luxury",
        "description": "Escudo com ombros côncavos e ponta clássica para brasões de casamento e família",
        "path": "M 14,16 L 86,16 C 86,46 76,74 50,88 C 24,74 14,46 14,16 Z M 20,22 L 80,22 C 80,48 72,70 50,82 C 28,70 20,48 20,22 Z",
        "fillRule": "evenodd",
        "defaultRatio": 0.8,
        "defaultW_MM": 42,
        "defaultH_MM": 52,
        "defaultFill": "#fffbeb",
        "defaultStroke": "#b45309",
        "defaultBorderWidth": 1.2,
        "tags": [
            "escudo",
            "heraldica",
            "florentino",
            "brasao",
            "familia",
            "luxo"
        ]
    },
    {
        "id": "composition_photo_companion_branch",
        "name": "Ramo Acompanhador de Foto ou Texto",
        "category": "composition",
        "aesthetic": "organic",
        "description": "Ramo vertical curvo desenhado especificamente para acompanhar a lateral de fotos e caixas",
        "path": "M 18,92 C 26,68 34,44 26,10 M 24,76 C 36,72 40,62 34,58 M 28,52 C 40,48 42,38 36,34 M 30,30 C 42,26 44,16 38,12",
        "defaultRatio": 0.5,
        "defaultW_MM": 22,
        "defaultH_MM": 44,
        "defaultFill": "#dcfce7",
        "defaultStroke": "#15803d",
        "defaultBorderWidth": 1.1,
        "tags": [
            "foto",
            "acompanhador",
            "lateral",
            "ramo",
            "organico",
            "composicao"
        ]
    },
    {
        "id": "composition_bottom_grounding_bar",
        "name": "Barra Decorativa de Fechamento com Micro-Roseta",
        "category": "composition",
        "aesthetic": "editorial",
        "description": "Linha de base de página com nó central de equilíbrio para ancorar o layout visual",
        "path": "M 10,50 L 44,50 M 56,50 L 90,50 M 50,44 L 54,50 L 50,56 L 46,50 Z M 10,44 L 10,56 M 90,44 L 90,56",
        "defaultRatio": 5,
        "defaultW_MM": 65,
        "defaultH_MM": 13,
        "defaultFill": "#f8fafc",
        "defaultStroke": "#1e293b",
        "defaultBorderWidth": 1.1,
        "tags": [
            "ancoragem",
            "fechamento",
            "base",
            "editorial",
            "rodape",
            "composicao"
        ]
    },
    {
        "id": "frame_thin_notched",
        "name": "Moldura Fina com Cantos Chanfrados",
        "category": "frames",
        "aesthetic": "editorial",
        "description": "Moldura retangular editorial com chanfros de 45° de precisão nos quatro cantos",
        "path": "M 14,8 L 86,8 L 92,14 L 92,86 L 86,92 L 14,92 L 8,86 L 8,14 Z",
        "defaultRatio": 0.75,
        "defaultW_MM": 50,
        "defaultH_MM": 65,
        "defaultFill": "transparent",
        "defaultStroke": "#1f2937",
        "defaultBorderWidth": 1,
        "tags": [
            "moldura",
            "quadro",
            "chanfrado",
            "borda",
            "editorial",
            "cartão",
            "convite"
        ]
    },
    {
        "id": "frame_double_fillet",
        "name": "Moldura Dupla com Filete Real",
        "category": "frames",
        "aesthetic": "luxury",
        "description": "Borda externa contínua combinada com filete interno de acabamento clássico",
        "path": "M 6,6 L 94,6 L 94,94 L 6,94 Z M 11,11 L 11,89 L 89,89 L 89,11 Z",
        "fillRule": "evenodd",
        "defaultRatio": 0.75,
        "defaultW_MM": 55,
        "defaultH_MM": 70,
        "defaultFill": "transparent",
        "defaultStroke": "#92400e",
        "defaultBorderWidth": 1.2,
        "tags": [
            "moldura",
            "dupla",
            "filete",
            "luxo",
            "certificado",
            "diploma",
            "ouro"
        ]
    },
    {
        "id": "frame_cathedral_arch",
        "name": "Moldura Arco Catedral / Pórtico",
        "category": "frames",
        "aesthetic": "elegant",
        "description": "Silhueta em arco arquitetônico superior com base reta, perfeita para convites e menus",
        "path": "M 12,92 L 12,48 C 12,24 28,8 50,8 C 72,8 88,24 88,48 L 88,92 Z",
        "defaultRatio": 0.7,
        "defaultW_MM": 50,
        "defaultH_MM": 72,
        "defaultFill": "transparent",
        "defaultStroke": "#374151",
        "defaultBorderWidth": 1.2,
        "tags": [
            "arco",
            "catedral",
            "portico",
            "casamento",
            "convite",
            "elegante",
            "menu"
        ]
    },
    {
        "id": "frame_double_arch",
        "name": "Moldura Duplo Arco Concêntrico",
        "category": "frames",
        "aesthetic": "luxury",
        "description": "Arco duplo com espaçamento calibrado para convites de casamento e save the date",
        "path": "M 10,92 L 10,48 C 10,22 28,6 50,6 C 72,6 90,22 90,48 L 90,92 Z M 16,92 L 16,48 C 16,26 31,12 50,12 C 69,12 84,26 84,48 L 84,92 Z",
        "fillRule": "evenodd",
        "defaultRatio": 0.7,
        "defaultW_MM": 52,
        "defaultH_MM": 74,
        "defaultFill": "transparent",
        "defaultStroke": "#b45309",
        "defaultBorderWidth": 1.1,
        "tags": [
            "arco",
            "duplo",
            "casamento",
            "savethedate",
            "luxo",
            "convite"
        ]
    },
    {
        "id": "frame_organic_pebble",
        "name": "Moldura Orgânica Seixo Fluido",
        "category": "frames",
        "aesthetic": "organic",
        "description": "Contorno curvo e assimétrico suave inspirado em pedras de rio polidas",
        "path": "M 48,6 C 74,4 94,22 93,46 C 92,72 78,94 48,93 C 20,92 6,76 7,50 C 8,24 22,8 48,6 Z",
        "defaultRatio": 1,
        "defaultW_MM": 50,
        "defaultH_MM": 50,
        "defaultFill": "#fef3c7",
        "defaultStroke": "#b45309",
        "defaultBorderWidth": 1.2,
        "tags": [
            "organico",
            "seixo",
            "pebble",
            "fluido",
            "assimetrico",
            "artesanal"
        ]
    },
    {
        "id": "frame_scallop_vintage",
        "name": "Moldura Oval com Borda Festonada",
        "category": "frames",
        "aesthetic": "vintage",
        "description": "Borda oval clássica com pequenos arcos decorativos estilo camafeu vitoriano",
        "path": "M 50,6 C 60,6 68,10 74,16 C 80,22 86,32 86,50 C 86,68 80,78 74,84 C 68,90 60,94 50,94 C 40,94 32,90 26,84 C 20,78 14,68 14,50 C 14,32 20,22 26,16 C 32,10 40,6 50,6 Z M 50,14 C 42,14 22,28 22,50 C 22,72 42,86 50,86 C 58,86 78,72 78,50 C 78,28 58,14 50,14 Z",
        "fillRule": "evenodd",
        "defaultRatio": 0.8,
        "defaultW_MM": 45,
        "defaultH_MM": 55,
        "defaultFill": "transparent",
        "defaultStroke": "#78350f",
        "defaultBorderWidth": 1,
        "tags": [
            "oval",
            "camafeu",
            "vintage",
            "festonado",
            "retro",
            "medalhao"
        ]
    },
    {
        "id": "frame_art_deco_stepped",
        "name": "Moldura Art Déco Escalonada",
        "category": "frames",
        "aesthetic": "luxury",
        "description": "Cantos geométricos escalonados anos 20 com elegância editorial contemporânea",
        "path": "M 18,8 L 82,8 L 82,14 L 88,14 L 88,20 L 92,20 L 92,80 L 88,80 L 88,86 L 82,86 L 82,92 L 18,92 L 18,86 L 12,86 L 12,80 L 8,80 L 8,20 L 12,20 L 12,14 L 18,14 Z",
        "defaultRatio": 0.8,
        "defaultW_MM": 50,
        "defaultH_MM": 62,
        "defaultFill": "transparent",
        "defaultStroke": "#1e293b",
        "defaultBorderWidth": 1.2,
        "tags": [
            "artdeco",
            "escalonada",
            "geometria",
            "luxo",
            "anos20",
            "gatsby"
        ]
    },
    {
        "id": "frame_minimal_crossing",
        "name": "Moldura Minimal com Linhas Cruzadas",
        "category": "frames",
        "aesthetic": "minimalist",
        "description": "Quadro fino com extremidades que se cruzam delicadamente nos quatro vértices",
        "path": "M 4,14 L 96,14 M 86,4 L 86,96 M 96,86 L 4,86 M 14,96 L 14,4",
        "defaultRatio": 1,
        "defaultW_MM": 50,
        "defaultH_MM": 50,
        "defaultFill": "transparent",
        "defaultStroke": "#111827",
        "defaultBorderWidth": 1,
        "tags": [
            "cruzada",
            "minimalista",
            "fina",
            "linha",
            "quadro",
            "galeria"
        ]
    },
    {
        "id": "frame_wavy_editorial",
        "name": "Moldura Ondulada Squiggle",
        "category": "frames",
        "aesthetic": "handcrafted",
        "description": "Perímetro ondulado moderno estilo papel recortado à mão e cerâmica artesanal",
        "path": "M 14,14 Q 24,8 36,14 Q 48,20 60,14 Q 72,8 84,14 Q 92,26 86,38 Q 80,50 86,62 Q 92,74 86,86 Q 74,92 62,86 Q 50,80 38,86 Q 26,92 14,86 Q 8,74 14,62 Q 20,50 14,38 Q 8,26 14,14 Z",
        "defaultRatio": 1,
        "defaultW_MM": 50,
        "defaultH_MM": 50,
        "defaultFill": "#fdf2f8",
        "defaultStroke": "#db2777",
        "defaultBorderWidth": 1.2,
        "tags": [
            "ondulada",
            "squiggle",
            "wavy",
            "funky",
            "papelaria",
            "artesanal"
        ]
    },
    {
        "id": "frame_botanical_wreath",
        "name": "Moldura Ramo Botânico Quadrangular",
        "category": "frames",
        "aesthetic": "romantic",
        "description": "Moldura envolvida em delicados folhetos orgânicos entrelaçados nos cantos",
        "path": "M 16,16 L 84,16 L 84,84 L 16,84 Z M 16,16 C 10,8 6,18 16,24 M 84,16 C 90,8 94,18 84,24 M 84,84 C 90,92 94,82 84,76 M 16,84 C 10,92 6,82 16,76",
        "defaultRatio": 1,
        "defaultW_MM": 50,
        "defaultH_MM": 50,
        "defaultFill": "transparent",
        "defaultStroke": "#15803d",
        "defaultBorderWidth": 1.1,
        "tags": [
            "botanico",
            "ramos",
            "folhas",
            "casamento",
            "romantico",
            "delicado"
        ]
    },
    {
        "id": "frame_octagonal_emerald",
        "name": "Moldura Octogonal Corte Esmeralda",
        "category": "frames",
        "aesthetic": "luxury",
        "description": "Octógono facetado alongado inspirado na lapidação de gemas nobres com filete fino",
        "path": "M 24,6 L 76,6 L 94,24 L 94,76 L 76,94 L 24,94 L 6,76 L 6,24 Z M 28,12 L 72,12 L 88,28 L 88,72 L 72,88 L 28,88 L 12,72 L 12,28 Z",
        "fillRule": "evenodd",
        "defaultRatio": 0.85,
        "defaultW_MM": 52,
        "defaultH_MM": 62,
        "defaultFill": "transparent",
        "defaultStroke": "#047857",
        "defaultBorderWidth": 1.2,
        "tags": [
            "octogonal",
            "esmeralda",
            "lapidado",
            "luxo",
            "joia",
            "certificado"
        ]
    },
    {
        "id": "frame_concave_corners",
        "name": "Moldura com Cantos Côncavos de Cartuche",
        "category": "frames",
        "aesthetic": "editorial",
        "description": "Retângulo refinado com arcos côncavos elegantes voltados para dentro em cada vértice",
        "path": "M 22,8 L 78,8 C 78,16 84,22 92,22 L 92,78 C 84,78 78,84 78,92 L 22,92 C 22,84 16,78 8,78 L 8,22 C 16,22 22,16 22,8 Z",
        "defaultRatio": 0.78,
        "defaultW_MM": 50,
        "defaultH_MM": 64,
        "defaultFill": "transparent",
        "defaultStroke": "#1e293b",
        "defaultBorderWidth": 1.1,
        "tags": [
            "concavo",
            "cartuche",
            "cantos",
            "editorial",
            "cartao",
            "menu"
        ]
    },
    {
        "id": "frame_florentine_corners",
        "name": "Moldura Florentina com Nós Ornamentais",
        "category": "frames",
        "aesthetic": "vintage",
        "description": "Moldura nobre renascentista com pequenos laços e volutas embutidos nos 4 vértices",
        "path": "M 24,10 L 76,10 C 82,10 86,6 90,10 C 94,14 90,18 90,24 L 90,76 C 90,82 94,86 90,90 C 86,94 82,90 76,90 L 24,90 C 18,90 14,94 10,90 C 6,86 10,82 10,76 L 10,24 C 10,18 6,14 10,10 C 14,6 18,10 24,10 Z",
        "defaultRatio": 0.8,
        "defaultW_MM": 50,
        "defaultH_MM": 62,
        "defaultFill": "transparent",
        "defaultStroke": "#713f12",
        "defaultBorderWidth": 1.2,
        "tags": [
            "florentina",
            "voluta",
            "renascenca",
            "vintage",
            "elegante",
            "diploma"
        ]
    },
    {
        "id": "frame_polaroid_minimal",
        "name": "Moldura Tipo Fotográfica / Passe-Partout",
        "category": "frames",
        "aesthetic": "minimalist",
        "description": "Proporção clássica de passe-partout com margem inferior ampla para legendas e notas",
        "path": "M 8,6 L 92,6 L 92,94 L 8,94 Z M 16,14 L 16,70 L 84,70 L 84,14 Z",
        "fillRule": "evenodd",
        "defaultRatio": 0.8,
        "defaultW_MM": 48,
        "defaultH_MM": 60,
        "defaultFill": "#f8fafc",
        "defaultStroke": "#64748b",
        "defaultBorderWidth": 1,
        "tags": [
            "polaroid",
            "passepartout",
            "foto",
            "memoria",
            "minimalista",
            "quadro"
        ]
    },
    {
        "id": "frame_trefoil_arch",
        "name": "Moldura Ogival Trilobada",
        "category": "frames",
        "aesthetic": "vintage",
        "description": "Arco ogival gótico reinterpretado com três lóbulos superiores sutis e limpos",
        "path": "M 14,92 L 14,48 C 14,34 26,24 38,24 C 42,16 58,16 62,24 C 74,24 86,34 86,48 L 86,92 Z",
        "defaultRatio": 0.72,
        "defaultW_MM": 48,
        "defaultH_MM": 66,
        "defaultFill": "transparent",
        "defaultStroke": "#334155",
        "defaultBorderWidth": 1.2,
        "tags": [
            "ogival",
            "trilobada",
            "gotico",
            "arco",
            "vintage",
            "convite"
        ]
    },
    {
        "id": "frame_oval_editorial",
        "name": "Moldura Oval com Linha Dupla Fina",
        "category": "frames",
        "aesthetic": "editorial",
        "description": "Oval esbelta com duplo contorno hairline para retratos, datas e monogramas centrais",
        "path": "M 50,6 C 72,6 88,26 88,50 C 88,74 72,94 50,94 C 28,94 12,74 12,50 C 12,26 28,6 50,6 Z M 50,11 C 69,11 83,28 83,50 C 83,72 69,89 50,89 C 31,89 17,72 17,50 C 17,28 31,11 50,11 Z",
        "fillRule": "evenodd",
        "defaultRatio": 0.78,
        "defaultW_MM": 48,
        "defaultH_MM": 62,
        "defaultFill": "transparent",
        "defaultStroke": "#0f172a",
        "defaultBorderWidth": 1,
        "tags": [
            "oval",
            "editorial",
            "dupla",
            "monograma",
            "foto",
            "camada"
        ]
    },
    {
        "id": "frame_bracket_ornate",
        "name": "Moldura Cartouche com Cúspides Centrais",
        "category": "frames",
        "aesthetic": "elegant",
        "description": "Bordas curvas com pequenas cúspides ornamentais no centro superior e inferior",
        "path": "M 12,20 C 12,12 20,12 36,12 C 44,12 47,6 50,6 C 53,6 56,12 64,12 C 80,12 88,12 88,20 C 88,36 94,44 94,50 C 94,56 88,64 88,80 C 88,88 80,88 64,88 C 56,88 53,94 50,94 C 47,94 44,88 36,88 C 20,88 12,88 12,80 C 12,64 6,56 6,50 C 6,44 12,36 12,20 Z",
        "defaultRatio": 0.85,
        "defaultW_MM": 50,
        "defaultH_MM": 60,
        "defaultFill": "transparent",
        "defaultStroke": "#4338ca",
        "defaultBorderWidth": 1.2,
        "tags": [
            "cartouche",
            "cuspide",
            "elegante",
            "brasao",
            "convite",
            "romantico"
        ]
    },
    {
        "id": "frame_ticket_stub",
        "name": "Moldura Bilhete Retrô com Recortes Laterais",
        "category": "frames",
        "aesthetic": "handcrafted",
        "description": "Silhueta de ticket vintage com entalhes semicirculares nas laterais para vales e cartões",
        "path": "M 10,12 L 90,12 L 90,44 C 84,44 80,47 80,50 C 80,53 84,56 90,56 L 90,88 L 10,88 L 10,56 C 16,56 20,53 20,50 C 20,47 16,44 10,44 Z",
        "defaultRatio": 1.4,
        "defaultW_MM": 56,
        "defaultH_MM": 40,
        "defaultFill": "#fffbeb",
        "defaultStroke": "#b45309",
        "defaultBorderWidth": 1.1,
        "tags": [
            "ticket",
            "bilhete",
            "retro",
            "vale",
            "cupom",
            "artesanal"
        ]
    },
    {
        "id": "frame_corner_squares",
        "name": "Moldura Minimal com Micro-Losangos nos Vértices",
        "category": "frames",
        "aesthetic": "minimalist",
        "description": "Linhas finas precisas com pequenos losangos vazados aplicados nos cantos",
        "path": "M 18,10 L 82,10 M 90,18 L 90,82 M 82,90 L 18,90 M 10,82 L 10,18 M 10,10 L 14,6 L 18,10 L 14,14 Z M 82,10 L 86,6 L 90,10 L 86,14 Z M 82,90 L 86,86 L 90,90 L 86,94 Z M 10,90 L 14,86 L 18,90 L 14,94 Z",
        "defaultRatio": 1,
        "defaultW_MM": 50,
        "defaultH_MM": 50,
        "defaultFill": "transparent",
        "defaultStroke": "#1e293b",
        "defaultBorderWidth": 1,
        "tags": [
            "losango",
            "minimalista",
            "detalhe",
            "vertice",
            "fino",
            "editorial"
        ]
    },
    {
        "id": "ornament_symmetric_volute",
        "name": "Arabesco Voluta Dupla Espelhada",
        "category": "ornaments",
        "aesthetic": "elegant",
        "description": "Ornamento clássico refinado com duas espirais concêntricas e nó central",
        "path": "M 50,42 C 44,28 32,24 20,28 C 8,32 10,48 20,52 C 30,56 42,48 50,56 C 58,48 70,56 80,52 C 90,48 92,32 80,28 C 68,24 56,28 50,42 Z M 50,56 L 50,72 M 46,72 L 54,72",
        "defaultRatio": 2.2,
        "defaultW_MM": 55,
        "defaultH_MM": 25,
        "defaultFill": "transparent",
        "defaultStroke": "#1f2937",
        "defaultBorderWidth": 1.2,
        "tags": [
            "arabesco",
            "voluta",
            "flourish",
            "elegante",
            "brasao",
            "convite"
        ]
    },
    {
        "id": "ornament_calligraphic_crest",
        "name": "Flourish Caligráfico de Título",
        "category": "ornaments",
        "aesthetic": "romantic",
        "description": "Ornamento caligráfico fluído ideal para posicionar sobre nomes ou cabeçalhos",
        "path": "M 10,50 C 26,30 38,70 50,44 C 62,18 74,70 90,50 C 76,54 66,34 50,56 C 36,36 24,54 10,50 Z",
        "defaultRatio": 2.5,
        "defaultW_MM": 60,
        "defaultH_MM": 24,
        "defaultFill": "#fef3c7",
        "defaultStroke": "#b45309",
        "defaultBorderWidth": 1,
        "tags": [
            "caligrafia",
            "flourish",
            "penmanship",
            "romantico",
            "elegante",
            "titulo"
        ]
    },
    {
        "id": "ornament_editorial_crest",
        "name": "Ornamento Linear Editorial com Losangos",
        "category": "ornaments",
        "aesthetic": "editorial",
        "description": "Composição linear geométrica pura com três losangos verticais e traços finos",
        "path": "M 15,50 L 40,50 M 50,32 L 56,42 L 50,52 L 44,42 Z M 50,56 L 54,62 L 50,68 L 46,62 Z M 60,50 L 85,50 M 35,46 L 35,54 M 65,46 L 65,54",
        "defaultRatio": 3,
        "defaultW_MM": 60,
        "defaultH_MM": 20,
        "defaultFill": "transparent",
        "defaultStroke": "#0f172a",
        "defaultBorderWidth": 1.1,
        "tags": [
            "editorial",
            "losango",
            "minimal",
            "moderno",
            "titulo",
            "divisao"
        ]
    },
    {
        "id": "ornament_acanthus_leaf",
        "name": "Folha de Acanto Simplificada",
        "category": "ornaments",
        "aesthetic": "vintage",
        "description": "Motivo botânico clássico da arquitetura greco-romana estilizado em traço fino",
        "path": "M 50,82 C 46,66 30,56 24,42 C 20,32 26,26 34,30 C 40,34 44,44 50,54 C 56,44 60,34 66,30 C 74,26 80,32 76,42 C 70,56 54,66 50,82 Z M 50,54 L 50,18",
        "defaultRatio": 1.2,
        "defaultW_MM": 35,
        "defaultH_MM": 42,
        "defaultFill": "#fef9c3",
        "defaultStroke": "#854d0e",
        "defaultBorderWidth": 1.2,
        "tags": [
            "acanto",
            "classico",
            "arquitetura",
            "vintage",
            "grego",
            "ornamento"
        ]
    },
    {
        "id": "ornament_fleur_de_lis_modern",
        "name": "Flor de Lis Minimalista",
        "category": "ornaments",
        "aesthetic": "luxury",
        "description": "Símbolo heráldico tradicional francês redesenhado com linhas geométricas modernas",
        "path": "M 50,14 C 44,28 44,42 50,54 C 56,42 56,28 50,14 Z M 44,48 C 30,42 16,48 20,62 C 24,72 38,68 44,56 M 56,48 C 70,42 84,48 80,62 C 76,72 62,68 56,56 M 26,58 L 74,58 M 50,58 L 50,82 M 42,82 L 58,82",
        "defaultRatio": 1.1,
        "defaultW_MM": 38,
        "defaultH_MM": 42,
        "defaultFill": "transparent",
        "defaultStroke": "#1e1b4b",
        "defaultBorderWidth": 1.2,
        "tags": [
            "flordelis",
            "heraldica",
            "realeza",
            "monarquia",
            "frances",
            "luxo"
        ]
    },
    {
        "id": "ornament_continuous_botanical",
        "name": "Floral em Traço Contínuo (One-Line Art)",
        "category": "ornaments",
        "aesthetic": "handcrafted",
        "description": "Haste com folhas e pétalas traçadas em uma linha única e poética",
        "path": "M 50,88 C 50,70 42,60 36,46 C 30,32 38,20 48,22 C 58,24 64,36 54,48 C 46,58 56,66 64,54 C 70,44 76,46 74,56 C 72,66 58,74 50,88 Z",
        "defaultRatio": 0.9,
        "defaultW_MM": 36,
        "defaultH_MM": 40,
        "defaultFill": "transparent",
        "defaultStroke": "#475569",
        "defaultBorderWidth": 1.2,
        "tags": [
            "oneline",
            "tracocontinuo",
            "arte",
            "moderno",
            "botanico",
            "delicado"
        ]
    },
    {
        "id": "ornament_editorial_starburst",
        "name": "Estrela Guia Editorial de 4 Pontas",
        "category": "ornaments",
        "aesthetic": "editorial",
        "description": "Estrela editorial esbelta com raios côncavos elegantes e detalhes laterais",
        "path": "M 50,10 Q 50,44 84,50 Q 50,56 50,90 Q 50,56 16,50 Q 50,44 50,10 Z M 32,32 L 68,68 M 68,32 L 32,68",
        "defaultRatio": 1,
        "defaultW_MM": 35,
        "defaultH_MM": 35,
        "defaultFill": "#f8fafc",
        "defaultStroke": "#0f172a",
        "defaultBorderWidth": 1,
        "tags": [
            "estrela",
            "guia",
            "editorial",
            "starburst",
            "quatro_pontas",
            "luxo"
        ]
    },
    {
        "id": "ornament_palmette_linear",
        "name": "Palmeta Neoclássica Linear",
        "category": "ornaments",
        "aesthetic": "vintage",
        "description": "Leque floral de inspiração neoclássica para cabeçalhos e títulos nobres",
        "path": "M 50,16 C 46,28 44,48 50,70 C 56,48 54,28 50,16 Z M 46,42 C 34,26 22,32 20,44 C 28,52 40,58 48,68 M 54,42 C 66,26 78,32 80,44 C 72,52 60,58 52,68 M 16,74 L 84,74 M 24,80 L 76,80",
        "defaultRatio": 1.4,
        "defaultW_MM": 50,
        "defaultH_MM": 35,
        "defaultFill": "transparent",
        "defaultStroke": "#854d0e",
        "defaultBorderWidth": 1.2,
        "tags": [
            "palmeta",
            "leque",
            "neoclassico",
            "antigo",
            "diploma",
            "vitoriano"
        ]
    },
    {
        "id": "ornament_rococo_curl",
        "name": "Floreio Rococó com Gota Terminal",
        "category": "ornaments",
        "aesthetic": "romantic",
        "description": "Curvatura assimétrica inspirada na ourivesaria francesa com acabamento em gota",
        "path": "M 14,70 C 14,40 34,20 54,24 C 74,28 86,48 76,64 C 68,76 48,76 46,62 C 44,48 56,40 64,44 C 70,48 70,54 66,56",
        "defaultRatio": 1.3,
        "defaultW_MM": 45,
        "defaultH_MM": 35,
        "defaultFill": "transparent",
        "defaultStroke": "#be123c",
        "defaultBorderWidth": 1.2,
        "tags": [
            "rococo",
            "floreio",
            "espiral",
            "gota",
            "frances",
            "romantico"
        ]
    },
    {
        "id": "ornament_sunburst_minimal",
        "name": "Meio Sol Radiante com Raios Finos",
        "category": "ornaments",
        "aesthetic": "luxury",
        "description": "Semicírculo solar com feixes alternados em espessuras finas para cartões e convites",
        "path": "M 20,68 C 20,51 33,38 50,38 C 67,38 80,51 80,68 Z M 50,12 L 50,28 M 28,22 L 38,34 M 72,22 L 62,34 M 14,44 L 28,48 M 86,44 L 72,48 M 10,68 L 90,68",
        "defaultRatio": 1.6,
        "defaultW_MM": 50,
        "defaultH_MM": 32,
        "defaultFill": "#fffbeb",
        "defaultStroke": "#b45309",
        "defaultBorderWidth": 1.2,
        "tags": [
            "sol",
            "sunburst",
            "aurora",
            "luxo",
            "raios",
            "nascer"
        ]
    },
    {
        "id": "corner_scroll_flourish",
        "name": "Cantoneira com Arabesco em L",
        "category": "corners",
        "aesthetic": "elegant",
        "description": "Ornamento angular simétrico em 90° com duas espirais clássicas e folíolo interno",
        "path": "M 10,70 L 10,24 C 10,16 16,10 24,10 L 70,10 M 10,24 C 18,24 24,18 24,10 M 18,36 C 24,30 30,24 36,18",
        "defaultRatio": 1,
        "defaultW_MM": 35,
        "defaultH_MM": 35,
        "defaultFill": "transparent",
        "defaultStroke": "#1f2937",
        "defaultBorderWidth": 1.2,
        "tags": [
            "canto",
            "cantoneira",
            "arabesco",
            "angulo",
            "espelhavel",
            "elegante"
        ]
    },
    {
        "id": "corner_botanical_spray",
        "name": "Ramo de Canto Curvo e Folhas",
        "category": "corners",
        "aesthetic": "romantic",
        "description": "Ramo orgânico que acompanha o vértice com cinco folhinhas delicadas",
        "path": "M 12,80 C 12,42 22,22 42,16 C 58,12 80,12 80,12 M 16,56 C 24,52 28,44 26,38 M 28,38 C 36,36 40,28 36,22 M 46,24 C 54,26 60,20 58,14",
        "defaultRatio": 1,
        "defaultW_MM": 35,
        "defaultH_MM": 35,
        "defaultFill": "transparent",
        "defaultStroke": "#15803d",
        "defaultBorderWidth": 1.1,
        "tags": [
            "canto",
            "ramo",
            "folhas",
            "botanico",
            "casamento",
            "romantico"
        ]
    },
    {
        "id": "corner_art_deco_chevron",
        "name": "Cantoneira Déco em Filetes Duplos",
        "category": "corners",
        "aesthetic": "luxury",
        "description": "Linhas angulares escalonadas estilo anos 20 para certificados e convites de luxo",
        "path": "M 10,80 L 10,10 L 80,10 M 18,70 L 18,18 L 70,18 M 26,60 L 26,26 L 60,26",
        "defaultRatio": 1,
        "defaultW_MM": 35,
        "defaultH_MM": 35,
        "defaultFill": "transparent",
        "defaultStroke": "#b45309",
        "defaultBorderWidth": 1.2,
        "tags": [
            "artdeco",
            "canto",
            "chevron",
            "filete",
            "luxo",
            "anos20",
            "ouro"
        ]
    },
    {
        "id": "corner_minimal_cross",
        "name": "Canto Minimalista com Gota Perolada",
        "category": "corners",
        "aesthetic": "minimalist",
        "description": "Linhas ortogonais limpas que se prolongam com uma micro-esfera de arremate no vértice",
        "path": "M 6,18 L 84,18 M 18,6 L 18,84 M 18,18 C 18,14 14,14 14,18 C 14,22 18,22 18,18 Z",
        "defaultRatio": 1,
        "defaultW_MM": 30,
        "defaultH_MM": 30,
        "defaultFill": "#1e293b",
        "defaultStroke": "#1e293b",
        "defaultBorderWidth": 1,
        "tags": [
            "minimalista",
            "canto",
            "gota",
            "linha",
            "moderno",
            "simples"
        ]
    },
    {
        "id": "corner_vintage_triad",
        "name": "Cantoneira Vintage Três Pétalas",
        "category": "corners",
        "aesthetic": "vintage",
        "description": "Ornamento de ferro fundido vitoriano com trevo em relevo e filetes curvos",
        "path": "M 12,75 L 12,25 C 12,18 18,12 25,12 L 75,12 M 25,25 C 32,18 42,22 38,32 C 34,42 22,38 25,25 Z M 16,42 C 22,42 26,36 22,30 M 42,16 C 42,22 36,26 30,22",
        "defaultRatio": 1,
        "defaultW_MM": 35,
        "defaultH_MM": 35,
        "defaultFill": "#fef3c7",
        "defaultStroke": "#78350f",
        "defaultBorderWidth": 1.2,
        "tags": [
            "vintage",
            "cantoneira",
            "petalas",
            "ferro",
            "vitoriano",
            "entalhe"
        ]
    },
    {
        "id": "corner_olive_branch",
        "name": "Canto de Ramo de Oliveira com Frutos",
        "category": "corners",
        "aesthetic": "organic",
        "description": "Arco vegetal em 90° com folhas alongadas e pequenas azeitonas lineares",
        "path": "M 14,84 C 14,50 24,24 50,14 C 62,10 82,10 82,10 M 20,60 C 28,58 32,48 26,44 M 32,40 C 40,38 42,28 36,24 M 48,22 C 58,24 60,16 54,12 M 26,52 C 28,52 30,54 28,56 C 26,58 24,56 26,52 Z",
        "defaultRatio": 1,
        "defaultW_MM": 36,
        "defaultH_MM": 36,
        "defaultFill": "#f0fdf4",
        "defaultStroke": "#166534",
        "defaultBorderWidth": 1.1,
        "tags": [
            "oliveira",
            "canto",
            "organico",
            "azeitona",
            "casamento",
            "mediterraneo"
        ]
    },
    {
        "id": "corner_concave_quarter",
        "name": "Cantoneira com Arco Côncavo e Traço Duplo",
        "category": "corners",
        "aesthetic": "editorial",
        "description": "Canto em reentrância curva elegante com filete interno de acompanhamento",
        "path": "M 10,74 L 10,38 C 10,38 38,38 38,10 L 74,10 M 16,66 L 16,44 C 16,44 44,44 44,16 L 66,16",
        "defaultRatio": 1,
        "defaultW_MM": 32,
        "defaultH_MM": 32,
        "defaultFill": "transparent",
        "defaultStroke": "#0f172a",
        "defaultBorderWidth": 1.1,
        "tags": [
            "concavo",
            "reentrancia",
            "editorial",
            "canto",
            "duplo",
            "moldura"
        ]
    },
    {
        "id": "corner_knot_flourish",
        "name": "Cantoneira Laço Escandinavo",
        "category": "corners",
        "aesthetic": "handcrafted",
        "description": "Laço ornamental de traço contínuo com dobras suaves nos extremos dos eixos",
        "path": "M 10,65 C 10,40 18,30 25,25 C 30,18 40,10 65,10 M 14,45 C 22,45 28,35 25,25 M 45,14 C 45,22 35,28 25,25",
        "defaultRatio": 1,
        "defaultW_MM": 34,
        "defaultH_MM": 34,
        "defaultFill": "transparent",
        "defaultStroke": "#6366f1",
        "defaultBorderWidth": 1.2,
        "tags": [
            "laco",
            "escandinavo",
            "artesanal",
            "canto",
            "continuo",
            "folhas"
        ]
    },
    {
        "id": "divider_diamond_line",
        "name": "Divisor com Losango Central",
        "category": "dividers",
        "aesthetic": "minimalist",
        "description": "Filete horizontal fino interrompido por um delicado losango e pontos laterais",
        "path": "M 6,50 L 42,50 M 50,42 L 56,50 L 50,58 L 44,50 Z M 58,50 L 94,50 M 36,50 C 36,48 38,48 38,50 C 38,52 36,52 36,50 Z M 64,50 C 64,48 62,48 62,50 C 62,52 64,52 64,50 Z",
        "defaultRatio": 5,
        "defaultW_MM": 60,
        "defaultH_MM": 12,
        "defaultFill": "#1f2937",
        "defaultStroke": "#1f2937",
        "defaultBorderWidth": 1,
        "tags": [
            "divisor",
            "linha",
            "losango",
            "minimalista",
            "separador",
            "elegante"
        ]
    },
    {
        "id": "divider_botanical_sprig",
        "name": "Divisor com Folhas Duplas Espelhadas",
        "category": "dividers",
        "aesthetic": "romantic",
        "description": "Linha sutil com ramo central de quatro folhas entrelaçadas em simetria",
        "path": "M 8,50 L 38,50 C 44,42 46,38 50,46 C 54,38 56,42 62,50 L 92,50 M 50,46 C 46,58 44,62 38,50 M 50,46 C 54,58 56,62 62,50",
        "defaultRatio": 4.5,
        "defaultW_MM": 65,
        "defaultH_MM": 14,
        "defaultFill": "#dcfce7",
        "defaultStroke": "#15803d",
        "defaultBorderWidth": 1.1,
        "tags": [
            "divisor",
            "botanico",
            "folhas",
            "romantico",
            "casamento",
            "separador"
        ]
    },
    {
        "id": "divider_double_tapered",
        "name": "Filete Duplo com Pontas Esfumadas",
        "category": "dividers",
        "aesthetic": "editorial",
        "description": "Duas linhas paralelas com afunilamento elegante nas extremidades para revistas e menus",
        "path": "M 10,47 L 90,47 M 18,53 L 82,53",
        "defaultRatio": 6,
        "defaultW_MM": 60,
        "defaultH_MM": 10,
        "defaultFill": "transparent",
        "defaultStroke": "#0f172a",
        "defaultBorderWidth": 1,
        "tags": [
            "filete",
            "duplo",
            "editorial",
            "linhas",
            "título",
            "elegante"
        ]
    },
    {
        "id": "divider_ornate_curl",
        "name": "Divisor com Arabesco Caligráfico Central",
        "category": "dividers",
        "aesthetic": "luxury",
        "description": "Separador nobre com voluta barroca ao centro e linhas estendidas em degradê",
        "path": "M 8,50 L 36,50 C 42,50 46,40 50,46 C 54,52 46,60 50,60 C 54,60 58,40 64,50 L 92,50",
        "defaultRatio": 4,
        "defaultW_MM": 60,
        "defaultH_MM": 15,
        "defaultFill": "transparent",
        "defaultStroke": "#b45309",
        "defaultBorderWidth": 1.2,
        "tags": [
            "divisor",
            "arabesco",
            "caligrafia",
            "luxo",
            "ouro",
            "diploma"
        ]
    },
    {
        "id": "divider_wave_handdrawn",
        "name": "Linha Ondulada Orgânica Suave",
        "category": "dividers",
        "aesthetic": "handcrafted",
        "description": "Ondulação suave de caneta bico de pena para divisões poéticas e descontraídas",
        "path": "M 8,50 Q 20,42 32,50 T 56,50 T 80,50 T 92,50",
        "defaultRatio": 5,
        "defaultW_MM": 60,
        "defaultH_MM": 12,
        "defaultFill": "transparent",
        "defaultStroke": "#475569",
        "defaultBorderWidth": 1.2,
        "tags": [
            "ondulado",
            "onda",
            "artesanal",
            "organico",
            "descontraido",
            "poetico"
        ]
    },
    {
        "id": "divider_dotted_beads",
        "name": "Separador Perolado com Esferas Calibradas",
        "category": "dividers",
        "aesthetic": "vintage",
        "description": "Régua com três pérolas centrais escalonadas e filetes com terminação em gota",
        "path": "M 10,50 L 38,50 M 62,50 L 90,50 M 44,50 C 44,48 42,48 42,50 C 42,52 44,52 44,50 Z M 50,50 C 50,46 46,46 46,50 C 46,54 50,54 50,50 Z M 56,50 C 56,48 58,48 58,50 C 58,52 56,52 56,50 Z",
        "defaultRatio": 5,
        "defaultW_MM": 55,
        "defaultH_MM": 11,
        "defaultFill": "#78350f",
        "defaultStroke": "#78350f",
        "defaultBorderWidth": 1.1,
        "tags": [
            "perolado",
            "vintage",
            "esferas",
            "contas",
            "delicado",
            "separador"
        ]
    },
    {
        "id": "divider_minimal_asterisk",
        "name": "Separador com Asterisco Fino",
        "category": "dividers",
        "aesthetic": "minimalist",
        "description": "Linha horizontal pura interrompida por uma estrela asterisco editorial de seis pontas",
        "path": "M 8,50 L 44,50 M 56,50 L 92,50 M 50,44 L 50,56 M 45,47 L 55,53 M 45,53 L 55,47",
        "defaultRatio": 6,
        "defaultW_MM": 60,
        "defaultH_MM": 10,
        "defaultFill": "transparent",
        "defaultStroke": "#0f172a",
        "defaultBorderWidth": 1,
        "tags": [
            "asterisco",
            "estrela",
            "minimal",
            "editorial",
            "livro",
            "capitulo"
        ]
    },
    {
        "id": "divider_laurel_center",
        "name": "Separador com Coroa de Louros Central",
        "category": "dividers",
        "aesthetic": "luxury",
        "description": "Micro guirlanda de folhas centrais ladeada por filetes finos de acabamento",
        "path": "M 6,50 L 36,50 M 64,50 L 94,50 M 42,50 C 42,44 46,40 50,44 C 54,40 58,44 58,50 C 58,56 54,60 50,56 C 46,60 42,56 42,50 Z",
        "defaultRatio": 4.5,
        "defaultW_MM": 62,
        "defaultH_MM": 14,
        "defaultFill": "#fef3c7",
        "defaultStroke": "#b45309",
        "defaultBorderWidth": 1.1,
        "tags": [
            "louros",
            "guirlanda",
            "luxo",
            "separador",
            "monograma",
            "certificado"
        ]
    },
    {
        "id": "botanical_olive_branch",
        "name": "Ramo de Oliveira Suave",
        "category": "botanicals",
        "aesthetic": "romantic",
        "description": "Ramo delicado com folhas ovais opostas dispostas harmoniosamente ao longo da haste",
        "path": "M 50,90 C 48,65 42,40 38,10 M 44,70 C 36,66 30,56 38,52 C 44,58 44,68 44,70 Z M 46,65 C 54,60 62,64 56,70 C 48,72 46,65 46,65 Z M 41,45 C 32,42 28,32 36,28 C 42,32 42,42 41,45 Z M 43,40 C 52,36 58,42 54,48 C 46,48 43,40 43,40 Z",
        "defaultRatio": 0.65,
        "defaultW_MM": 30,
        "defaultH_MM": 46,
        "defaultFill": "#dcfce7",
        "defaultStroke": "#15803d",
        "defaultBorderWidth": 1.1,
        "tags": [
            "botanico",
            "oliveira",
            "ramo",
            "folhas",
            "casamento",
            "delicado"
        ]
    },
    {
        "id": "botanical_eucalyptus_stem",
        "name": "Haste de Eucalipto Redondo",
        "category": "botanicals",
        "aesthetic": "editorial",
        "description": "Eucalipto cinéreo com folhas arredondadas e haste central vertical estilizada",
        "path": "M 50,92 L 50,8 M 50,78 C 36,78 36,64 50,64 C 64,64 64,78 50,78 Z M 50,56 C 38,56 38,44 50,44 C 62,44 62,56 50,56 Z M 50,34 C 40,34 40,24 50,24 C 60,24 60,34 50,34 Z",
        "defaultRatio": 0.5,
        "defaultW_MM": 25,
        "defaultH_MM": 50,
        "defaultFill": "#f1f5f9",
        "defaultStroke": "#475569",
        "defaultBorderWidth": 1.1,
        "tags": [
            "eucalipto",
            "haste",
            "folhas",
            "redondas",
            "editorial",
            "moderno"
        ]
    },
    {
        "id": "botanical_circular_wreath",
        "name": "Guirlanda Circular Floral Delicada",
        "category": "botanicals",
        "aesthetic": "luxury",
        "description": "Círculo aberto no topo com folhagens entrelaçadas ideal para acomodar iniciais",
        "path": "M 50,14 C 30,14 16,28 16,50 C 16,72 30,86 50,86 C 70,86 84,72 84,50 C 84,28 70,14 50,14 Z M 20,38 C 12,32 14,24 22,26 M 80,38 C 88,32 86,24 78,26 M 20,62 C 12,68 14,76 22,74 M 80,62 C 88,68 86,76 78,74",
        "defaultRatio": 1,
        "defaultW_MM": 45,
        "defaultH_MM": 45,
        "defaultFill": "transparent",
        "defaultStroke": "#b45309",
        "defaultBorderWidth": 1.2,
        "tags": [
            "guirlanda",
            "wreath",
            "circulo",
            "monograma",
            "casamento",
            "ouro"
        ]
    },
    {
        "id": "botanical_ginkgo_leaf",
        "name": "Folha de Ginkgo Biloba Minimalista",
        "category": "botanicals",
        "aesthetic": "minimalist",
        "description": "Silhueta em leque com nervuras lineares que simboliza longevidade e elegância",
        "path": "M 50,92 C 50,75 48,60 48,50 C 30,48 12,42 16,24 C 24,14 42,22 48,34 C 50,22 52,14 62,18 C 76,24 86,40 52,50 C 52,60 50,75 50,92 Z",
        "defaultRatio": 0.9,
        "defaultW_MM": 38,
        "defaultH_MM": 42,
        "defaultFill": "#fef08a",
        "defaultStroke": "#854d0e",
        "defaultBorderWidth": 1.2,
        "tags": [
            "ginkgo",
            "leque",
            "folha",
            "japones",
            "longevidade",
            "minimalista"
        ]
    },
    {
        "id": "botanical_lavender_sprig",
        "name": "Ramo de Lavanda Silvestre",
        "category": "botanicals",
        "aesthetic": "handcrafted",
        "description": "Inflorescência em espiga com pequenas flores ovais e folhas lineares basais",
        "path": "M 50,90 L 50,20 M 50,20 C 44,18 44,14 50,12 C 56,14 56,18 50,20 Z M 48,30 C 40,28 42,24 48,26 M 52,30 C 60,28 58,24 52,26 M 48,42 C 38,40 40,36 48,38 M 52,42 C 62,40 60,36 52,38 M 50,68 C 38,72 32,80 34,88 M 50,62 C 62,66 68,74 66,82",
        "defaultRatio": 0.6,
        "defaultW_MM": 26,
        "defaultH_MM": 44,
        "defaultFill": "#ede9fe",
        "defaultStroke": "#7c3aed",
        "defaultBorderWidth": 1.1,
        "tags": [
            "lavanda",
            "ramo",
            "provençal",
            "flores",
            "aroma",
            "campo"
        ]
    },
    {
        "id": "botanical_rose_bud",
        "name": "Botão de Rosa em Traço Fino",
        "category": "botanicals",
        "aesthetic": "romantic",
        "description": "Pétalas espiraladas delicadas com sépalas pontiagudas e haste fina",
        "path": "M 50,88 L 50,56 M 50,56 C 44,58 38,50 42,44 C 44,38 56,38 58,44 C 62,50 56,58 50,56 Z M 46,42 C 46,32 50,26 54,30 C 58,34 52,42 46,42 Z M 50,56 C 42,64 36,66 38,72 M 50,64 C 58,70 64,68 62,74",
        "defaultRatio": 0.6,
        "defaultW_MM": 28,
        "defaultH_MM": 46,
        "defaultFill": "#ffe4e6",
        "defaultStroke": "#e11d48",
        "defaultBorderWidth": 1.1,
        "tags": [
            "rosa",
            "botao",
            "amor",
            "romantico",
            "flor",
            "casamento"
        ]
    },
    {
        "id": "botanical_fern_frond",
        "name": "Fronde de Samambaia Silvestre",
        "category": "botanicals",
        "aesthetic": "organic",
        "description": "Haste curvada com folíolos serrados alternados para fundos e cantos naturais",
        "path": "M 20,88 C 24,60 38,36 78,16 M 34,70 C 26,66 22,72 26,76 M 42,56 C 32,52 30,58 34,62 M 52,44 C 44,40 42,46 46,50 M 62,32 C 54,28 52,34 56,38 M 38,66 C 46,62 48,68 44,72 M 46,52 C 54,48 56,54 52,58 M 56,38 C 64,34 66,40 62,44",
        "defaultRatio": 0.8,
        "defaultW_MM": 36,
        "defaultH_MM": 45,
        "defaultFill": "transparent",
        "defaultStroke": "#166534",
        "defaultBorderWidth": 1.1,
        "tags": [
            "samambaia",
            "fronde",
            "floresta",
            "verde",
            "folhagem",
            "natural"
        ]
    },
    {
        "id": "botanical_semi_wreath",
        "name": "Meia Guirlanda Crescente de Louros",
        "category": "botanicals",
        "aesthetic": "luxury",
        "description": "Arco vegetal em crescente lunar para emoldurar títulos à esquerda ou direita",
        "path": "M 24,18 C 12,36 12,64 24,82 C 18,72 16,50 24,18 Z M 20,30 C 14,26 16,18 22,22 M 16,50 C 8,48 8,40 16,42 M 20,70 C 14,74 16,82 22,78",
        "defaultRatio": 0.5,
        "defaultW_MM": 24,
        "defaultH_MM": 48,
        "defaultFill": "#fef3c7",
        "defaultStroke": "#b45309",
        "defaultBorderWidth": 1.2,
        "tags": [
            "meia_guirlanda",
            "crescente",
            "louros",
            "luxo",
            "monograma",
            "moldura"
        ]
    },
    {
        "id": "seal_scalloped_rosette",
        "name": "Medalhão Floral Canelado / Roseta",
        "category": "labels",
        "aesthetic": "luxury",
        "description": "Selo nobre com bordas frisadas e círculo concêntrico para monogramas e cera",
        "path": "M 50,8 C 55,8 57,12 62,13 C 67,14 71,11 75,14 C 79,17 79,22 83,26 C 87,30 91,32 92,37 C 93,42 89,46 89,50 C 89,54 93,58 92,63 C 91,68 87,70 83,74 C 79,78 79,83 75,86 C 71,89 67,86 62,87 C 57,88 55,92 50,92 C 45,92 43,88 38,87 C 33,86 29,89 25,86 C 21,83 21,78 17,74 C 13,70 9,68 8,63 C 7,58 11,54 11,50 C 11,46 7,42 8,37 C 9,32 13,30 17,26 C 21,22 21,17 25,14 C 29,11 33,14 38,13 C 43,12 45,8 50,8 Z M 50,18 C 32,18 18,32 18,50 C 18,68 32,82 50,82 C 68,82 82,68 82,50 C 82,32 68,18 50,18 Z",
        "fillRule": "evenodd",
        "defaultRatio": 1,
        "defaultW_MM": 45,
        "defaultH_MM": 45,
        "defaultFill": "#fffbeb",
        "defaultStroke": "#b45309",
        "defaultBorderWidth": 1.2,
        "tags": [
            "selo",
            "roseta",
            "medalhao",
            "luxo",
            "premio",
            "cera",
            "autentico"
        ]
    },
    {
        "id": "seal_organic_wax",
        "name": "Selo de Cera Artesanal (Wax Seal)",
        "category": "labels",
        "aesthetic": "romantic",
        "description": "Bordas derretidas orgânicas com textura de lacre tradicional para envelopes",
        "path": "M 48,10 C 64,8 80,18 86,32 C 92,46 92,64 82,78 C 72,92 54,94 38,90 C 22,86 10,74 8,58 C 6,42 16,26 30,16 C 36,12 42,10 48,10 Z M 50,22 C 34,22 22,34 22,50 C 22,66 34,78 50,78 C 66,78 78,66 78,50 C 78,34 66,22 50,22 Z",
        "fillRule": "evenodd",
        "defaultRatio": 1,
        "defaultW_MM": 45,
        "defaultH_MM": 45,
        "defaultFill": "#ffe4e6",
        "defaultStroke": "#e11d48",
        "defaultBorderWidth": 1.3,
        "tags": [
            "lacre",
            "cera",
            "waxseal",
            "envelope",
            "casamento",
            "artesanal"
        ]
    },
    {
        "id": "label_apothecary_notched",
        "name": "Etiqueta Botânica de Farmácia Antiga",
        "category": "labels",
        "aesthetic": "vintage",
        "description": "Formato clássico retangular com 4 cantos entalhados para produtos e embalagens",
        "path": "M 16,12 L 84,12 L 92,20 L 92,80 L 84,88 L 16,88 L 8,80 L 8,20 Z M 20,18 L 80,18 L 86,24 L 86,76 L 80,82 L 20,82 L 14,76 L 14,24 Z",
        "fillRule": "evenodd",
        "defaultRatio": 1.35,
        "defaultW_MM": 54,
        "defaultH_MM": 40,
        "defaultFill": "#fffbeb",
        "defaultStroke": "#78350f",
        "defaultBorderWidth": 1.1,
        "tags": [
            "etiqueta",
            "apothecary",
            "farmacia",
            "vintage",
            "embalagem",
            "tag"
        ]
    },
    {
        "id": "label_arch_hanging_tag",
        "name": "Tag Suspensa com Arco Superior e Furo",
        "category": "labels",
        "aesthetic": "editorial",
        "description": "Etiqueta com topo em cúpula redonda, furo para cordão e base reta",
        "path": "M 20,90 L 20,44 C 20,26 34,10 50,10 C 66,10 80,26 80,44 L 80,90 Z M 50,22 C 46,22 44,24 44,28 C 44,32 46,34 50,34 C 54,34 56,32 56,28 C 56,24 54,22 50,22 Z",
        "fillRule": "evenodd",
        "defaultRatio": 0.65,
        "defaultW_MM": 32,
        "defaultH_MM": 50,
        "defaultFill": "#f8fafc",
        "defaultStroke": "#334155",
        "defaultBorderWidth": 1.2,
        "tags": [
            "tag",
            "suspensa",
            "furo",
            "arco",
            "editorial",
            "lembrancinha"
        ]
    },
    {
        "id": "badge_geometric_octagonal",
        "name": "Emblema Octogonal Nobre com Filete",
        "category": "labels",
        "aesthetic": "minimalist",
        "description": "Selo octogonal simétrico com corte limpo e moldura interna espaçada",
        "path": "M 30,10 L 70,10 L 90,30 L 90,70 L 70,90 L 30,90 L 10,70 L 10,30 Z M 34,16 L 66,16 L 84,34 L 84,66 L 66,84 L 34,84 L 16,66 L 16,34 Z",
        "fillRule": "evenodd",
        "defaultRatio": 1,
        "defaultW_MM": 44,
        "defaultH_MM": 44,
        "defaultFill": "#f8fafc",
        "defaultStroke": "#0f172a",
        "defaultBorderWidth": 1.1,
        "tags": [
            "emblema",
            "octogonal",
            "geometria",
            "minimalista",
            "distintivo",
            "selo"
        ]
    },
    {
        "id": "label_scalloped_tag_hanging",
        "name": "Etiqueta Ondulada com Ilhós",
        "category": "labels",
        "aesthetic": "handcrafted",
        "description": "Bordas recortadas onduladas estilo festonê com furo superior para fita de cetim",
        "path": "M 24,18 C 30,12 38,10 50,10 C 62,10 70,12 76,18 C 82,24 82,34 82,44 L 82,80 C 82,86 76,90 70,90 L 30,90 C 24,90 18,86 18,80 L 18,44 C 18,34 18,24 24,18 Z M 50,22 C 46,22 44,24 44,27 C 44,30 46,32 50,32 C 54,32 56,30 56,27 C 56,24 54,22 50,22 Z",
        "fillRule": "evenodd",
        "defaultRatio": 0.7,
        "defaultW_MM": 35,
        "defaultH_MM": 50,
        "defaultFill": "#fdf2f8",
        "defaultStroke": "#db2777",
        "defaultBorderWidth": 1.1,
        "tags": [
            "tag",
            "ondulada",
            "ilhos",
            "artesanal",
            "presente",
            "papelaria"
        ]
    },
    {
        "id": "label_postage_stamp",
        "name": "Selo Postal Serrilhado Clássico",
        "category": "labels",
        "aesthetic": "vintage",
        "description": "Perímetro perfurado tradicional de selo postal antigo com borda interna",
        "path": "M 14,14 L 86,14 L 86,86 L 14,86 Z M 20,20 L 20,80 L 80,80 L 80,20 Z",
        "fillRule": "evenodd",
        "defaultRatio": 0.85,
        "defaultW_MM": 40,
        "defaultH_MM": 48,
        "defaultFill": "#fef3c7",
        "defaultStroke": "#b45309",
        "defaultBorderWidth": 1.2,
        "tags": [
            "selo",
            "postal",
            "correio",
            "vintage",
            "carta",
            "envelope"
        ]
    },
    {
        "id": "label_cameo_oval",
        "name": "Cartela Camafeu Oval com Suporte",
        "category": "labels",
        "aesthetic": "vintage",
        "description": "Medalhão vertical com pequenos laços nos polos norte e sul para títulos e preços",
        "path": "M 50,8 C 72,8 86,26 86,50 C 86,74 72,92 50,92 C 28,92 14,74 14,50 C 14,26 28,8 50,8 Z M 50,14 C 42,14 46,6 50,6 C 54,6 58,14 50,14 Z M 50,86 C 42,86 46,94 50,94 C 54,94 58,86 50,86 Z",
        "defaultRatio": 0.75,
        "defaultW_MM": 42,
        "defaultH_MM": 56,
        "defaultFill": "#fafaf9",
        "defaultStroke": "#57534e",
        "defaultBorderWidth": 1.1,
        "tags": [
            "camafeu",
            "oval",
            "cartela",
            "vintage",
            "joia",
            "etiqueta"
        ]
    },
    {
        "id": "ribbon_folded_classic",
        "name": "Faixa com Dobras Laterais em 3D",
        "category": "ribbons",
        "aesthetic": "vintage",
        "description": "Faixa clássica central com extremidades chanfradas e dobras sombreadas",
        "path": "M 18,34 L 82,34 L 82,66 L 18,66 Z M 18,42 L 6,34 L 18,58 Z M 82,42 L 94,34 L 82,58 Z M 18,58 L 18,66 L 6,58 Z M 82,58 L 82,66 L 94,58 Z",
        "defaultRatio": 2.8,
        "defaultW_MM": 65,
        "defaultH_MM": 24,
        "defaultFill": "#fef3c7",
        "defaultStroke": "#b45309",
        "defaultBorderWidth": 1.2,
        "tags": [
            "faixa",
            "banner",
            "dobrada",
            "3d",
            "vintage",
            "titulo"
        ]
    },
    {
        "id": "ribbon_curved_wave",
        "name": "Ribbon Curvo Elegante",
        "category": "ribbons",
        "aesthetic": "elegant",
        "description": "Faixa curva em arco suave perfeita para destacar nomes de noivos ou datas",
        "path": "M 14,46 Q 50,30 86,46 L 86,64 Q 50,48 14,64 Z M 14,46 L 6,40 L 14,56 Z M 86,46 L 94,40 L 86,56 Z",
        "defaultRatio": 3.2,
        "defaultW_MM": 64,
        "defaultH_MM": 20,
        "defaultFill": "#f0fdf4",
        "defaultStroke": "#166534",
        "defaultBorderWidth": 1.1,
        "tags": [
            "ribbon",
            "curvo",
            "arco",
            "elegante",
            "casamento",
            "nome"
        ]
    },
    {
        "id": "banner_swallowtail_minimal",
        "name": "Flâmula Horizontal Cauda de Andorinha",
        "category": "ribbons",
        "aesthetic": "editorial",
        "description": "Faixa retangular com pontas recortadas em V invertido para títulos modernos",
        "path": "M 10,34 L 90,34 L 82,50 L 90,66 L 10,66 L 18,50 Z",
        "defaultRatio": 3,
        "defaultW_MM": 60,
        "defaultH_MM": 20,
        "defaultFill": "#f1f5f9",
        "defaultStroke": "#0f172a",
        "defaultBorderWidth": 1.2,
        "tags": [
            "flamula",
            "andorinha",
            "swallowtail",
            "banner",
            "editorial",
            "moderno"
        ]
    },
    {
        "id": "ribbon_scroll_parchment",
        "name": "Pergaminho Rolado Tradicional",
        "category": "ribbons",
        "aesthetic": "handcrafted",
        "description": "Papiro com rolos laterais que conferem aspecto de manuscrito histórico",
        "path": "M 16,30 C 12,30 8,36 8,44 C 8,52 14,56 20,56 L 80,56 C 86,56 92,52 92,44 C 92,36 88,30 84,30 L 16,30 Z M 16,30 C 20,30 24,36 24,44 C 24,52 20,56 16,56 M 84,30 C 80,30 76,36 76,44 C 76,52 80,56 84,56",
        "defaultRatio": 2.6,
        "defaultW_MM": 60,
        "defaultH_MM": 23,
        "defaultFill": "#fef9c3",
        "defaultStroke": "#854d0e",
        "defaultBorderWidth": 1.2,
        "tags": [
            "pergaminho",
            "scroll",
            "rolo",
            "manuscrito",
            "historico",
            "artesanal"
        ]
    },
    {
        "id": "banner_floating_badge",
        "name": "Cartela Flutuante de Título com Borda Dupla",
        "category": "ribbons",
        "aesthetic": "minimalist",
        "description": "Retângulo arredondado com filete de destaque e sombra sutil para títulos",
        "path": "M 12,32 L 88,32 C 92,32 94,36 94,40 L 94,60 C 94,64 92,68 88,68 L 12,68 C 8,68 6,64 6,60 L 6,40 C 6,36 8,32 12,32 Z M 16,38 L 84,38 C 86,38 88,40 88,42 L 88,58 C 88,60 86,62 84,62 L 16,62 C 14,62 12,60 12,58 L 12,42 C 12,40 14,38 16,38 Z",
        "fillRule": "evenodd",
        "defaultRatio": 2.8,
        "defaultW_MM": 58,
        "defaultH_MM": 21,
        "defaultFill": "#ffffff",
        "defaultStroke": "#1e293b",
        "defaultBorderWidth": 1,
        "tags": [
            "cartela",
            "flutuante",
            "badge",
            "minimalista",
            "titulo",
            "caixa"
        ]
    },
    {
        "id": "washi_tape",
        "name": "Fita Washi Tape com Extremidades Rasgadas",
        "category": "ribbons",
        "aesthetic": "handcrafted",
        "description": "Faixa adesiva fosca de papel arroz japonês com cortes dentados naturais",
        "path": "M 8,32 L 92,32 L 88,40 L 92,48 L 88,56 L 92,64 L 88,72 L 8,72 L 12,64 L 8,56 L 12,48 L 8,40 Z",
        "defaultRatio": 3,
        "defaultW_MM": 55,
        "defaultH_MM": 18,
        "defaultFill": "#fed7aa",
        "defaultStroke": "#f97316",
        "defaultBorderWidth": 1,
        "tags": [
            "washi",
            "fita",
            "tape",
            "adesivo",
            "rasgado",
            "artesanal"
        ]
    },
    {
        "id": "banner_pennant_hanging",
        "name": "Flâmula Suspensa Triangular",
        "category": "ribbons",
        "aesthetic": "romantic",
        "description": "Bandeirola vertical com ponta inferior triangular para monogramas e iniciais",
        "path": "M 22,14 L 78,14 L 78,64 L 50,86 L 22,64 Z M 28,20 L 72,20 L 72,60 L 50,78 L 28,60 Z",
        "fillRule": "evenodd",
        "defaultRatio": 0.75,
        "defaultW_MM": 36,
        "defaultH_MM": 48,
        "defaultFill": "#ede9fe",
        "defaultStroke": "#6366f1",
        "defaultBorderWidth": 1.1,
        "tags": [
            "flamula",
            "bandeirola",
            "suspensa",
            "triangular",
            "iniciais",
            "festa"
        ]
    },
    {
        "id": "organic_blob_editorial",
        "name": "Blob Fluido Editorial Suave",
        "category": "organic",
        "aesthetic": "organic",
        "description": "Forma fluida assimétrica equilibrada para fundos coloridos e caixas de texto",
        "path": "M 48,10 C 72,8 90,26 90,48 C 90,70 74,90 48,90 C 22,90 10,74 10,48 C 10,22 24,12 48,10 Z",
        "defaultRatio": 1,
        "defaultW_MM": 50,
        "defaultH_MM": 50,
        "defaultFill": "#fed7aa",
        "defaultStroke": "#ea580c",
        "defaultBorderWidth": 1.2,
        "tags": [
            "blob",
            "fluido",
            "organico",
            "fundo",
            "editorial",
            "moderno"
        ]
    },
    {
        "id": "organic_blob_elongated",
        "name": "Blob Alongado Tipo Aquarela",
        "category": "organic",
        "aesthetic": "minimalist",
        "description": "Silhueta elíptica irregular com curvas biomórficas inspiradas em pedras de rio",
        "path": "M 20,48 C 18,28 34,14 54,16 C 74,18 88,32 86,52 C 84,72 68,86 46,84 C 26,82 22,68 20,48 Z",
        "defaultRatio": 1.3,
        "defaultW_MM": 52,
        "defaultH_MM": 40,
        "defaultFill": "#e0e7ff",
        "defaultStroke": "#4f46e5",
        "defaultBorderWidth": 1.2,
        "tags": [
            "blob",
            "alongado",
            "aquarela",
            "biomorfico",
            "fundo",
            "pedra"
        ]
    },
    {
        "id": "organic_torn_paper_deckle",
        "name": "Borda Rasgada Papel Artesanal (Deckle Edge)",
        "category": "organic",
        "aesthetic": "handcrafted",
        "description": "Placa retangular com bordas irregulares naturais de papel artesanal feito à mão",
        "path": "M 14,14 Q 22,12 34,15 Q 52,11 68,14 Q 82,12 88,18 Q 85,34 88,52 Q 84,70 87,84 Q 72,86 54,83 Q 36,87 22,83 Q 12,85 13,68 Q 15,50 12,34 Q 16,20 14,14 Z",
        "defaultRatio": 1.2,
        "defaultW_MM": 54,
        "defaultH_MM": 45,
        "defaultFill": "#fefce8",
        "defaultStroke": "#a16207",
        "defaultBorderWidth": 1.2,
        "tags": [
            "papel",
            "rasgado",
            "deckle",
            "artesanal",
            "algodao",
            "textura"
        ]
    },
    {
        "id": "organic_cloud_poetic",
        "name": "Nuvem Abstrata Poética",
        "category": "organic",
        "aesthetic": "romantic",
        "description": "Contorno lobulado suave estilo sonho e poesia para títulos e notas de acolhimento",
        "path": "M 26,72 L 74,72 C 84,72 90,64 88,54 C 86,44 76,40 72,42 C 68,28 54,24 44,30 C 38,24 26,28 26,38 C 16,40 10,50 14,60 C 18,70 20,72 26,72 Z",
        "defaultRatio": 1.6,
        "defaultW_MM": 48,
        "defaultH_MM": 30,
        "defaultFill": "#ede9fe",
        "defaultStroke": "#7c3aed",
        "defaultBorderWidth": 1.1,
        "tags": [
            "nuvem",
            "poetico",
            "ceu",
            "sonho",
            "suave",
            "infantil_chic"
        ]
    },
    {
        "id": "organic_arch_offset",
        "name": "Arco Orgânico Assimétrico",
        "category": "organic",
        "aesthetic": "editorial",
        "description": "Arco contemporâneo com curva superior descentralizada e base fluida",
        "path": "M 18,90 L 18,52 C 18,24 38,10 60,14 C 78,18 84,36 84,58 L 84,90 Z",
        "defaultRatio": 0.75,
        "defaultW_MM": 45,
        "defaultH_MM": 60,
        "defaultFill": "#fdf2f8",
        "defaultStroke": "#db2777",
        "defaultBorderWidth": 1.2,
        "tags": [
            "arco",
            "assimetrico",
            "offset",
            "editorial",
            "moderno",
            "fundo"
        ]
    },
    {
        "id": "organic_pebble_smooth",
        "name": "Seixo Oval Polido",
        "category": "organic",
        "aesthetic": "minimalist",
        "description": "Forma de seixo de rio suavemente inclinada para composições orgânicas de texto",
        "path": "M 32,16 C 56,10 82,24 86,46 C 90,68 76,88 52,90 C 28,92 12,78 14,54 C 16,30 20,18 32,16 Z",
        "defaultRatio": 1.1,
        "defaultW_MM": 48,
        "defaultH_MM": 44,
        "defaultFill": "#f1f5f9",
        "defaultStroke": "#334155",
        "defaultBorderWidth": 1.2,
        "tags": [
            "seixo",
            "pedra",
            "polido",
            "zen",
            "mineral",
            "minimalista"
        ]
    },
    {
        "id": "composition_monogram_header",
        "name": "Cabeçalho Monograma com Ramos e Divisores",
        "category": "composition",
        "aesthetic": "luxury",
        "description": "Composição pronta com círculo central, folhas laterais e linhas para nomes e datas",
        "path": "M 50,24 C 64,24 76,36 76,50 C 76,64 64,76 50,76 C 36,76 24,64 24,50 C 24,36 36,24 50,24 Z M 6,50 L 22,50 M 78,50 L 94,50 M 50,14 L 50,22 M 50,78 L 50,86",
        "defaultRatio": 2.2,
        "defaultW_MM": 60,
        "defaultH_MM": 28,
        "defaultFill": "#fffbeb",
        "defaultStroke": "#b45309",
        "defaultBorderWidth": 1.2,
        "tags": [
            "monograma",
            "cabecalho",
            "titulo",
            "brasao",
            "casamento",
            "luxo",
            "composicao"
        ]
    },
    {
        "id": "composition_title_accent_triad",
        "name": "Acento Ornamental para Acima de Título",
        "category": "composition",
        "aesthetic": "editorial",
        "description": "Pequena peça decorativa de coroamento com flor-de-lis estilizada e volutas simétricas",
        "path": "M 50,18 C 46,30 46,44 50,56 C 54,44 54,30 50,18 Z M 50,46 C 36,36 22,44 26,56 C 30,68 44,62 48,50 M 50,46 C 64,36 78,44 74,56 C 70,68 56,62 52,50 M 16,56 L 84,56",
        "defaultRatio": 2.4,
        "defaultW_MM": 55,
        "defaultH_MM": 24,
        "defaultFill": "transparent",
        "defaultStroke": "#1e293b",
        "defaultBorderWidth": 1.2,
        "tags": [
            "acento",
            "titulo",
            "coroamento",
            "editorial",
            "elegante",
            "composicao"
        ]
    },
    {
        "id": "composition_footer_scrollwork",
        "name": "Rodapé Decorativo com Voluta Central",
        "category": "composition",
        "aesthetic": "vintage",
        "description": "Ornamento de base de página para fechamento elegante de cartas, menus e páginas",
        "path": "M 10,40 L 40,40 C 44,52 50,56 50,56 C 50,56 56,52 60,40 L 90,40 M 50,30 L 50,54 M 46,32 L 54,32",
        "defaultRatio": 3.5,
        "defaultW_MM": 60,
        "defaultH_MM": 18,
        "defaultFill": "transparent",
        "defaultStroke": "#4b5563",
        "defaultBorderWidth": 1.1,
        "tags": [
            "rodape",
            "fechamento",
            "base",
            "vintage",
            "menu",
            "carta",
            "composicao"
        ]
    },
    {
        "id": "composition_photo_bracket_l",
        "name": "Quadro Cantoneira Duplo para Foto",
        "category": "composition",
        "aesthetic": "handcrafted",
        "description": "Par de cantoneiras opostas para acompanhar e emoldurar fotos ou caixas de anotação",
        "path": "M 12,44 L 12,12 L 44,12 M 88,56 L 88,88 L 56,88",
        "defaultRatio": 1,
        "defaultW_MM": 45,
        "defaultH_MM": 45,
        "defaultFill": "transparent",
        "defaultStroke": "#6366f1",
        "defaultBorderWidth": 1.5,
        "tags": [
            "foto",
            "quadro",
            "bracket",
            "cantos",
            "acompanhador",
            "artesanal",
            "composicao"
        ]
    },
    {
        "id": "composition_divider_flourish_center",
        "name": "Separador de Conteúdo com Coração Botânico",
        "category": "composition",
        "aesthetic": "romantic",
        "description": "Filete longo com sutil silhueta floral de coração no ponto central",
        "path": "M 8,50 L 40,50 C 42,42 46,38 50,42 C 54,38 58,42 60,50 L 92,50 M 50,42 L 50,58",
        "defaultRatio": 4.5,
        "defaultW_MM": 65,
        "defaultH_MM": 14,
        "defaultFill": "#ffe4e6",
        "defaultStroke": "#f43f5e",
        "defaultBorderWidth": 1.1,
        "tags": [
            "coracao",
            "divisor",
            "separador",
            "romantico",
            "delicado",
            "composicao"
        ]
    },
    {
        "id": "composition_name_flourish_wings",
        "name": "Asas Caligráficas para Acima/Abaixo de Nome",
        "category": "composition",
        "aesthetic": "editorial",
        "description": "Par de floreios horizontais espelhados para envolver nomes de noivos ou homenageados",
        "path": "M 8,50 C 22,38 34,62 46,48 C 50,44 50,56 46,52 M 92,50 C 78,38 66,62 54,48 C 50,44 50,56 54,52",
        "defaultRatio": 3.5,
        "defaultW_MM": 60,
        "defaultH_MM": 18,
        "defaultFill": "transparent",
        "defaultStroke": "#1f2937",
        "defaultBorderWidth": 1.2,
        "tags": [
            "asas",
            "caligrafia",
            "nome",
            "noivos",
            "titulo",
            "editorial",
            "composicao"
        ]
    },
    {
        "id": "composition_card_crest_arch",
        "name": "Crest Nobre de Cartão com Louros e Arco",
        "category": "composition",
        "aesthetic": "luxury",
        "description": "Composição de topo de convite com arco aberto, ramos de vitória e fita de ano",
        "path": "M 20,44 C 20,28 34,14 50,14 C 66,14 80,28 80,44 M 30,50 L 70,50 L 64,62 L 36,62 Z M 22,34 C 14,28 16,20 24,22 M 78,34 C 86,28 84,20 76,22",
        "defaultRatio": 1.6,
        "defaultW_MM": 52,
        "defaultH_MM": 32,
        "defaultFill": "#fffbeb",
        "defaultStroke": "#b45309",
        "defaultBorderWidth": 1.2,
        "tags": [
            "crest",
            "arco",
            "louros",
            "topo",
            "brasao",
            "luxo",
            "composicao"
        ]
    },
    {
        "id": "composition_quote_brackets",
        "name": "Colchetes Editoriais para Citações e Versículos",
        "category": "composition",
        "aesthetic": "minimalist",
        "description": "Par de aspas/colchetes geométricos finos para destacar frases inspiradoras e citações",
        "path": "M 14,24 L 28,24 M 14,24 L 14,44 M 86,76 L 72,76 M 86,76 L 86,56",
        "defaultRatio": 1.2,
        "defaultW_MM": 45,
        "defaultH_MM": 38,
        "defaultFill": "transparent",
        "defaultStroke": "#475569",
        "defaultBorderWidth": 1.5,
        "tags": [
            "citacao",
            "aspas",
            "versiculo",
            "frase",
            "colchetes",
            "editorial",
            "composicao"
        ]
    },
    {
        "id": "composition_signature_rule",
        "name": "Linha de Assinatura com Floreio Terminal",
        "category": "composition",
        "aesthetic": "vintage",
        "description": "Traço horizontal com laço caligráfico de fechamento para certificados e diplomas",
        "path": "M 8,60 L 68,60 C 76,60 84,52 80,42 C 76,32 64,40 70,50 C 76,60 92,54 88,44",
        "defaultRatio": 4.5,
        "defaultW_MM": 65,
        "defaultH_MM": 15,
        "defaultFill": "transparent",
        "defaultStroke": "#1e293b",
        "defaultBorderWidth": 1.2,
        "tags": [
            "assinatura",
            "linha",
            "certificado",
            "diploma",
            "floreio",
            "vintage",
            "composicao"
        ]
    }
];

import { getOrnamentById } from './ornamentLibraryData';

export const getVectorShapeById = (id: string): VectorShapeDefinition => {
    const found = VECTOR_SHAPES.find(s => s.id === id);
    if (found) return found;

    const ornament = getOrnamentById(id);
    if (ornament) {
        return {
            id: ornament.id,
            name: ornament.name,
            category: ornament.category as any,
            aesthetic: ornament.family as any,
            description: ornament.description,
            path: ornament.path,
            viewBox: ornament.viewBox || "0 0 100 100",
            fillRule: ornament.fillRule || 'nonzero',
            defaultRatio: ornament.defaultRatio || 1,
            defaultW_MM: ornament.defaultW_MM || 30,
            defaultH_MM: ornament.defaultH_MM || 30,
            defaultFill: ornament.defaultFill || 'transparent',
            defaultStroke: ornament.defaultStroke || '#18181b',
            defaultBorderWidth: ornament.defaultBorderWidth || 1.2,
            tags: ornament.tags
        };
    }

    // Backward-compatibility aliases for legacy shapes & geometry
    if (id === 'rectangle') return VECTOR_SHAPES.find(s => s.id === 'geo_rectangle') || VECTOR_SHAPES[0];
    if (id === 'rounded_rect') return VECTOR_SHAPES.find(s => s.id === 'geo_rounded_rect') || VECTOR_SHAPES[0];
    if (id === 'square') return VECTOR_SHAPES.find(s => s.id === 'geo_square') || VECTOR_SHAPES[0];
    if (id === 'circle') return VECTOR_SHAPES.find(s => s.id === 'geo_circle') || VECTOR_SHAPES[0];
    if (id === 'oval' || id === 'ellipse') return VECTOR_SHAPES.find(s => s.id === 'geo_oval') || VECTOR_SHAPES[0];
    if (id === 'triangle') return VECTOR_SHAPES.find(s => s.id === 'geo_triangle') || VECTOR_SHAPES[0];
    if (id === 'star') return VECTOR_SHAPES.find(s => s.id === 'geo_star_5') || VECTOR_SHAPES[0];
    if (id === 'heart') return VECTOR_SHAPES.find(s => s.id === 'geo_heart') || VECTOR_SHAPES[0];
    if (id === 'diamond' || id === 'rhombus') return VECTOR_SHAPES.find(s => s.id === 'geo_diamond') || VECTOR_SHAPES[0];
    if (id === 'hexagon') return VECTOR_SHAPES.find(s => s.id === 'geo_hexagon') || VECTOR_SHAPES[0];
    if (id === 'octagon') return VECTOR_SHAPES.find(s => s.id === 'geo_octagon') || VECTOR_SHAPES[0];
    if (id === 'pentagon') return VECTOR_SHAPES.find(s => s.id === 'geo_pentagon') || VECTOR_SHAPES[0];
    if (id === 'trapezoid') return VECTOR_SHAPES.find(s => s.id === 'geo_trapezoid') || VECTOR_SHAPES[0];
    if (id === 'cross' || id === 'plus') return VECTOR_SHAPES.find(s => s.id === 'geo_cross') || VECTOR_SHAPES[0];
    if (id === 'semicircle') return VECTOR_SHAPES.find(s => s.id === 'geo_semicircle') || VECTOR_SHAPES[0];
    if (id === 'arch') return VECTOR_SHAPES.find(s => s.id === 'geo_arch') || VECTOR_SHAPES[0];
    if (id === 'shield') return VECTOR_SHAPES.find(s => s.id === 'geo_shield') || VECTOR_SHAPES[0];

    if (id === 'washi_tape') {
        const wt = VECTOR_SHAPES.find(s => s.id === 'washi_tape');
        if (wt) return wt;
    }

    if (id === 'ribbon_banner') {
        return VECTOR_SHAPES.find(s => s.id === 'banner_swallowtail_minimal') || VECTOR_SHAPES[0];
    }

    if (id === 'postage_stamp' || id === 'bookmark_tag') {
        return VECTOR_SHAPES.find(s => s.id === 'label_apothecary_notched') || VECTOR_SHAPES[0];
    }

    // Default safe fallback
    return VECTOR_SHAPES[0];
};
