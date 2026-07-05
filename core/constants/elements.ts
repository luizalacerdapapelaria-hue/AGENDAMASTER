import { LayoutElement, ElementType } from '../../types';

export const AVAILABLE_FONTS = [
  'Inter', 'Arial', 'Helvetica', 'Times New Roman', 'Courier New', 
  'Georgia', 'Verdana', 'Playfair Display', 'Merriweather', 'Dancing Script', 'Lato',
  'Montserrat', 'Roboto', 'Open Sans', 'Oswald', 'Raleway', 'Pacifico', 'Caveat', 'Lobster', 'Comfortaa', 'Bebas Neue'
];

export interface ElementVariant {
    name: string;
    description: string;
    styleOverride: Partial<LayoutElement['style']>;
    defaultSize?: { w: number, h: number };
}

export const ELEMENT_VARIANTS: Record<string, ElementVariant[]> = {
    'date_placeholder': [
        { name: 'Número Padrão', description: 'Número do dia em negrito', styleOverride: { variant: 'day_number', fontSize: 42, fontWeight: 'bold' } },
        { name: 'Dia da Semana', description: 'Nome do dia por extenso', styleOverride: { variant: 'day_name', fontSize: 14, fontWeight: '600' } },
        { name: 'Mês', description: 'Nome do mês', styleOverride: { variant: 'month_name', fontSize: 12, fontWeight: 'normal' } },
        { name: 'Ano', description: 'Ano do planner', styleOverride: { variant: 'year', fontSize: 12, fontWeight: 'normal' } },
        { name: 'Data Minimalista', description: 'Número + Nome do Mês', styleOverride: { variant: 'day_number', fontSize: 18, color: '#9ca3af' } },
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
    ]
};
