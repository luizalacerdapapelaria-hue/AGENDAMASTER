import { LayoutElement, ElementType } from '../../types';

export const AVAILABLE_FONTS = [
  'Inter', 'Arial', 'Helvetica', 'Times New Roman', 'Courier New', 
  'Georgia', 'Verdana', 'Playfair Display', 'Merriweather', 'Dancing Script', 'Lato',
  'Montserrat', 'Roboto', 'Open Sans', 'Oswald', 'Raleway', 'Pacifico', 'Caveat', 'Lobster', 'Comfortaa', 'Bebas Neue'
];

export const SYSTEM_FONTS = [
  'Century Gothic', 'Calibri', 'Cooper Black', 'Comic Sans MS', 'Garamond', 'Georgia', 
  'Verdana', 'Trebuchet MS', 'Arial Black', 'Impact', 'Segoe UI', 'Tahoma', 'Franklin Gothic Medium',
  'Palatino Linotype', 'Bookman Old Style', 'Century Schoolbook', 'Lucida Bright', 'Lucida Sans',
  'Lucida Console', 'Copperplate Gothic Bold', 'Baskerville', 'Gill Sans', 'Futura', 'Optima',
  'Lucida Handwriting', 'Monotype Corsiva', 'Segoe Script', 'Papyrus', 'Chalkboard SE', 'Brush Script MT'
];

export interface ElementVariant {
    name: string;
    description: string;
    styleOverride: Partial<LayoutElement['style']>;
    defaultSize?: { w: number, h: number };
}

export const ELEMENT_VARIANTS: Record<string, ElementVariant[]> = {
    'date_placeholder': [
        { name: 'Número Padrão', description: 'Número do dia em negrito', styleOverride: { variant: 'day_number', fontSize: 32, fontWeight: 'bold' }, defaultSize: { w: 18, h: 10 } },
        { name: 'Dia da Semana', description: 'Nome do dia por extenso', styleOverride: { variant: 'day_name', fontSize: 18, fontWeight: '600' }, defaultSize: { w: 45, h: 10 } },
        { name: 'Mês', description: 'Nome do mês', styleOverride: { variant: 'month_name', fontSize: 22, fontWeight: 'bold' }, defaultSize: { w: 42, h: 10 } },
        { name: 'Ano', description: 'Ano do planner', styleOverride: { variant: 'year', fontSize: 20, fontWeight: 'normal' }, defaultSize: { w: 24, h: 10 } },
        { name: 'Data Minimalista', description: 'Número + Nome do Mês', styleOverride: { variant: 'day_number', fontSize: 18, color: '#9ca3af' }, defaultSize: { w: 20, h: 10 } },
    ],
    'moon': [
        { name: 'Completo', description: 'Ícone + Texto', styleOverride: { variant: 'full_info', fontSize: 12, color: '#6b7280' }, defaultSize: { w: 20, h: 5 } },
        { name: 'Ícone', description: 'Apenas desenho', styleOverride: { variant: 'icon_only', fontSize: 24, color: '#6b7280' }, defaultSize: { w: 8, h: 5 } },
        { name: 'Minimalista', description: 'Traço fino', styleOverride: { variant: 'minimal', fontSize: 12, color: '#000000' }, defaultSize: { w: 20, h: 5 } },
    ],
    'vector_flower': [
        { name: 'Flor', description: 'Pétalas arredondadas', styleOverride: { variant: 'flower_1', color: '#1f2937', backgroundColor: '#e5e7eb' } },
        { name: 'Estrela', description: '5 pontas', styleOverride: { variant: 'star', color: '#1f2937', backgroundColor: '#e5e7eb' } },
        { name: 'Coração', description: 'Formato coração', styleOverride: { variant: 'heart', color: '#ef4444', backgroundColor: '#fee2e2' } },
        { name: 'Folha', description: 'Orgânico', styleOverride: { variant: 'leaf', color: '#059669', backgroundColor: '#d1fae5' } },
    ],
    'lines': [
        { name: 'Padrão', description: 'Linhas cinzas', styleOverride: { color: '#e5e7eb', lineSpacing: 24 } },
        { name: 'Com Horário', description: 'Marcação de hora', styleOverride: { color: '#e5e7eb', lineSpacing: 30, showTimes: true, startHour: 8 } },
        { name: 'Pontilhado', description: 'Linhas discretas', styleOverride: { color: '#d1d5db', lineSpacing: 24 } }, 
    ],
    'mini_calendar': [
        { name: 'Mês Atual', description: 'Calendário do mês da página', styleOverride: { calendarOffset: 0, fontSize: 8, color: '#374151', backgroundColor: 'transparent' }, defaultSize: { w: 25, h: 18 } },
        { name: 'Mês Anterior', description: 'Mês passado', styleOverride: { calendarOffset: -1, fontSize: 8, color: '#9ca3af', backgroundColor: 'transparent' }, defaultSize: { w: 25, h: 18 } },
        { name: 'Mês Seguinte', description: 'Próximo mês', styleOverride: { calendarOffset: 1, fontSize: 8, color: '#9ca3af', backgroundColor: 'transparent' }, defaultSize: { w: 25, h: 18 } },
    ],
    'permanent_day_header': [
        { name: 'Círculos (Contorno)', description: 'Dias em círculos vazados', styleOverride: { variant: 'circles_outline', color: '#f472b6', fontSize: 10 }, defaultSize: { w: 30, h: 5 } },
        { name: 'Círculos (Preenchido)', description: 'Dias em círculos coloridos', styleOverride: { variant: 'circles_filled', color: '#f472b6', fontSize: 10 }, defaultSize: { w: 30, h: 5 } },
        { name: 'Quadrados (Contorno)', description: 'Dias em quadrados vazados', styleOverride: { variant: 'square_outline', color: '#f472b6', fontSize: 10 }, defaultSize: { w: 30, h: 5 } },
        { name: 'Quadrados (Preenchido)', description: 'Dias em quadrados coloridos', styleOverride: { variant: 'square_filled', color: '#f472b6', fontSize: 10 }, defaultSize: { w: 30, h: 5 } },
        { name: 'Círculos + Letra Abaixo', description: 'Círculo vazio com letra embaixo', styleOverride: { variant: 'circles_outline_text_below', color: '#f472b6', fontSize: 10, shapeScale: 1 }, defaultSize: { w: 30, h: 8 } },
        { name: 'Círculos Preenchidos + Letra Abaixo', description: 'Círculo preenchido com letra embaixo', styleOverride: { variant: 'circles_filled_text_below', color: '#f472b6', fontSize: 10, shapeScale: 1 }, defaultSize: { w: 30, h: 8 } },
        { name: 'Quadrados + Letra Abaixo', description: 'Quadrado vazio com letra embaixo', styleOverride: { variant: 'square_outline_text_below', color: '#f472b6', fontSize: 10, shapeScale: 1 }, defaultSize: { w: 30, h: 8 } },
        { name: 'Quadrados Preenchidos + Letra Abaixo', description: 'Quadrado preenchido com letra embaixo', styleOverride: { variant: 'square_filled_text_below', color: '#f472b6', fontSize: 10, shapeScale: 1 }, defaultSize: { w: 30, h: 8 } },
        { name: 'Minimalista', description: 'Apenas as letras', styleOverride: { variant: 'minimal', color: '#f472b6', fontSize: 10 }, defaultSize: { w: 30, h: 5 } },
    ],
    'note_grid': [
        { name: 'Pontilhado', description: 'Pontos discretos', styleOverride: { variant: 'dots', color: '#ccc', opacity: 0.5 } },
        { name: 'Quadriculado', description: 'Grade de quadrados', styleOverride: { variant: 'squared', color: '#ccc', opacity: 0.5 } },
    ],
    'footer_tracker': [
        { 
            name: 'Copos de Água (8 Copos)', 
            description: 'Meta de 2L de água para colorir', 
            styleOverride: { 
                footerTracker: { trackerType: 'water', iconVariant: 'glass', itemCount: 8, itemSize: 20, spacing: 5, strokeColor: '#2563eb', fillColor: 'transparent', strokeWidth: 1.2, showLabel: true, label: 'Água', labelPosition: 'left' } 
            }, 
            defaultSize: { w: 46, h: 6.5 } 
        },
        { 
            name: 'Garrafinhas de Hidratação', 
            description: 'Garrafas esportivas reutilizáveis', 
            styleOverride: { 
                footerTracker: { trackerType: 'water', iconVariant: 'bottle', itemCount: 6, itemSize: 20, spacing: 5, strokeColor: '#0ea5e9', fillColor: 'transparent', strokeWidth: 1.2, showLabel: true, label: 'Hidratação', labelPosition: 'left' } 
            }, 
            defaultSize: { w: 42, h: 6.5 } 
        },
        { 
            name: 'Gotas de Água', 
            description: 'Gotas estilizadas minimalistas', 
            styleOverride: { 
                footerTracker: { trackerType: 'water', iconVariant: 'drop', itemCount: 8, itemSize: 18, spacing: 5, strokeColor: '#1d4ed8', fillColor: 'transparent', strokeWidth: 1.2, showLabel: true, label: '2 Litros', labelPosition: 'left' } 
            }, 
            defaultSize: { w: 40, h: 6.0 } 
        },
        { 
            name: 'Humor do Dia (5 Carinhas)', 
            description: 'Expressões: Radiante, Feliz, Neutro, Triste e Estressado', 
            styleOverride: { 
                footerTracker: { trackerType: 'mood', iconVariant: 'faces_clean', itemCount: 5, itemSize: 21, spacing: 6, strokeColor: '#374151', fillColor: 'transparent', strokeWidth: 1.2, showLabel: true, label: 'Humor', labelPosition: 'left' } 
            }, 
            defaultSize: { w: 45, h: 6.5 } 
        },
        { 
            name: 'Carinhas Kawaii (Fofas)', 
            description: 'Carinhas com bochechinhas delicadas', 
            styleOverride: { 
                footerTracker: { trackerType: 'mood', iconVariant: 'faces_cute', itemCount: 5, itemSize: 21, spacing: 6, strokeColor: '#e11d48', fillColor: 'transparent', strokeWidth: 1.2, showLabel: true, label: 'Hoje me sinto', labelPosition: 'left' } 
            }, 
            defaultSize: { w: 50, h: 6.5 } 
        },
        { 
            name: 'Avaliação em Estrelas', 
            description: 'De 1 a 5 estrelas para nota do dia', 
            styleOverride: { 
                footerTracker: { trackerType: 'mood', iconVariant: 'stars', itemCount: 5, itemSize: 20, spacing: 5, strokeColor: '#d97706', fillColor: 'transparent', strokeWidth: 1.2, showLabel: true, label: 'Meu Dia', labelPosition: 'left' } 
            }, 
            defaultSize: { w: 40, h: 6.5 } 
        },
        { 
            name: 'Corações de Energia', 
            description: '5 corações para nível de vitalidade', 
            styleOverride: { 
                footerTracker: { trackerType: 'mood', iconVariant: 'hearts', itemCount: 5, itemSize: 20, spacing: 5, strokeColor: '#e11d48', fillColor: 'transparent', strokeWidth: 1.2, showLabel: true, label: 'Energia', labelPosition: 'left' } 
            }, 
            defaultSize: { w: 40, h: 6.5 } 
        },
        { 
            name: 'Clima do Dia (5 Ícones)', 
            description: 'Sol, Parcialmente Nublado, Nuvem, Chuva e Tempestade', 
            styleOverride: { 
                footerTracker: { trackerType: 'weather', iconVariant: 'weather_5', itemCount: 5, itemSize: 20, spacing: 6, strokeColor: '#f59e0b', fillColor: 'transparent', strokeWidth: 1.2, showLabel: true, label: 'Clima', labelPosition: 'left' } 
            }, 
            defaultSize: { w: 44, h: 6.5 } 
        },
        { 
            name: 'Refeições (C, A, J, L)', 
            description: 'Café, Almoço, Jantar e Lanches', 
            styleOverride: { 
                footerTracker: { trackerType: 'meals', iconVariant: 'meals_4', itemCount: 4, itemSize: 19, spacing: 6, strokeColor: '#059669', fillColor: 'transparent', strokeWidth: 1.2, showLabel: true, label: 'Refeições', labelPosition: 'left', showItemLabels: true } 
            }, 
            defaultSize: { w: 46, h: 7.2 } 
        },
        { 
            name: 'Horas de Sono (5h a 9h+)', 
            description: 'Lua com marcação de horas dormidas', 
            styleOverride: { 
                footerTracker: { trackerType: 'sleep', iconVariant: 'sleep_hours', itemCount: 5, itemSize: 19, spacing: 4, strokeColor: '#4f46e5', fillColor: 'transparent', strokeWidth: 1.2, showLabel: true, label: 'Sono', labelPosition: 'left' } 
            }, 
            defaultSize: { w: 44, h: 6.5 } 
        },
        { 
            name: 'Bateria de Disposição', 
            description: 'Níveis de energia de 20% a 100%', 
            styleOverride: { 
                footerTracker: { trackerType: 'sleep', iconVariant: 'battery', itemCount: 5, itemSize: 18, spacing: 5, strokeColor: '#0d9488', fillColor: 'transparent', strokeWidth: 1.2, showLabel: true, label: 'Disposição', labelPosition: 'left' } 
            }, 
            defaultSize: { w: 48, h: 6.5 } 
        },
        { 
            name: 'Vitaminas & Remédios', 
            description: 'Pílulas e comprimidos vazados', 
            styleOverride: { 
                footerTracker: { trackerType: 'meds', iconVariant: 'pills', itemCount: 4, itemSize: 20, spacing: 6, strokeColor: '#7c3aed', fillColor: 'transparent', strokeWidth: 1.2, showLabel: true, label: 'Vitaminas', labelPosition: 'left' } 
            }, 
            defaultSize: { w: 40, h: 6.5 } 
        },
        { 
            name: 'Linha de Gratidão', 
            description: 'Coração e linha para escrever a gratidão', 
            styleOverride: { 
                footerTracker: { trackerType: 'gratitude', iconVariant: 'gratitude_line', itemCount: 1, itemSize: 18, spacing: 6, strokeColor: '#6b7280', fillColor: 'transparent', strokeWidth: 1.2, showLabel: true, label: 'Hoje sou grata por:', labelPosition: 'left', lineStyle: 'dashed' } 
            }, 
            defaultSize: { w: 75, h: 6.0 } 
        },
        { 
            name: 'Treino & Atividade Física', 
            description: 'Passos, musculação, calorias e cardio', 
            styleOverride: { 
                footerTracker: { trackerType: 'fitness', iconVariant: 'fitness_4', itemCount: 4, itemSize: 20, spacing: 6, strokeColor: '#ea580c', fillColor: 'transparent', strokeWidth: 1.2, showLabel: true, label: 'Treino', labelPosition: 'left' } 
            }, 
            defaultSize: { w: 44, h: 6.5 } 
        }
    ]
};
