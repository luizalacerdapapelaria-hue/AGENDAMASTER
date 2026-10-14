import { LayoutElement } from '../../../types';

export const WEEKLY_VERTICAL_LEFT: LayoutElement[] = [
    // Cabeçalho Artístico da Semana (Página Esquerda)
    {
        id: 'pv-l-wc',
        name: 'Aquarela Topo Esquerda',
        type: 'circle',
        x: -3, y: -3, w: 30, h: 16, zIndex: 0,
        style: { backgroundColor: '#fdf2f8', borderWidth: 0, opacity: 0.75 }
    },
    {
        id: 'pv-l-sub',
        name: 'Subtítulo Caligráfico Semana',
        type: 'text',
        content: 'planejamento semanal •',
        x: 2, y: 2.5, w: 42, h: 4.5, zIndex: 2,
        style: { fontSize: 13, fontFamily: 'Dancing Script', color: '#be185d', textAlign: 'left' }
    },
    {
        id: 'pv-l-month',
        name: 'Mês da Semana',
        type: 'month_name',
        x: 38, y: 2, w: 42, h: 5.5, zIndex: 2,
        style: { fontSize: 15, fontWeight: 'bold', fontFamily: 'Playfair Display', color: '#4c0519', textAlign: 'left', textTransform: 'uppercase', letterSpacing: 2 }
    },
    {
        id: 'pv-l-year',
        name: 'Ano da Semana',
        type: 'year',
        x: 82, y: 2.8, w: 16, h: 4, zIndex: 2,
        style: { fontSize: 9.5, fontWeight: 'bold', fontFamily: 'Montserrat', color: '#9d174d', textAlign: 'right', letterSpacing: 1.5 }
    },

    // Segunda-feira (Card Rosé Pastel)
    {
        id: 'pv-l-1',
        name: 'Coluna Segunda-feira',
        type: 'planner_day_box',
        x: 0, y: 9, w: 32, h: 71, zIndex: 1,
        style: {
            borderRadius: 10,
            borderColor: '#fbcfe8',
            borderWidth: 1,
            backgroundColor: '#ffffff',
            plannerDayBox: {
                dayIndex: 1,
                contentStyle: 'lines',
                lineSpacing: 16,
                showDayNumber: false,
                showDayName: false,
                headerHeight: 12,
                headerBackgroundColor: '#fff1f2',
                headerBorderColor: '#fbcfe8',
                strokeColor: '#fce7f3',
                strokeWidth: 0.6,
                startHour: 7,
                endHour: 20,
                timeInterval: 60,
                fontFamily: 'Montserrat',
                color: '#9d174d'
            }
        }
    },
    {
        id: 'pv-l-1-num',
        name: 'Dia Segunda',
        type: 'day_number',
        x: 1.5, y: 10, w: 9, h: 6.5, zIndex: 2,
        style: { dayIndex: 1, fontSize: 17, fontWeight: 'bold', fontFamily: 'Playfair Display', textAlign: 'center', color: '#881337' }
    },
    {
        id: 'pv-l-1-name',
        name: 'Nome Segunda',
        type: 'day_name',
        x: 11, y: 11.2, w: 19, h: 4.5, zIndex: 2,
        style: { dayIndex: 1, fontSize: 8, fontWeight: 'bold', fontFamily: 'Montserrat', textAlign: 'left', textTransform: 'uppercase', color: '#9d174d', letterSpacing: 0.8 }
    },

    // Terça-feira (Card Lavanda Pastel)
    {
        id: 'pv-l-2',
        name: 'Coluna Terça-feira',
        type: 'planner_day_box',
        x: 34, y: 9, w: 32, h: 71, zIndex: 1,
        style: {
            borderRadius: 10,
            borderColor: '#e9d5ff',
            borderWidth: 1,
            backgroundColor: '#ffffff',
            plannerDayBox: {
                dayIndex: 2,
                contentStyle: 'lines',
                lineSpacing: 16,
                showDayNumber: false,
                showDayName: false,
                headerHeight: 12,
                headerBackgroundColor: '#faf5ff',
                headerBorderColor: '#e9d5ff',
                strokeColor: '#f3e8ff',
                strokeWidth: 0.6,
                startHour: 7,
                endHour: 20,
                timeInterval: 60,
                fontFamily: 'Montserrat',
                color: '#6b21a8'
            }
        }
    },
    {
        id: 'pv-l-2-num',
        name: 'Dia Terça',
        type: 'day_number',
        x: 35.5, y: 10, w: 9, h: 6.5, zIndex: 2,
        style: { dayIndex: 2, fontSize: 17, fontWeight: 'bold', fontFamily: 'Playfair Display', textAlign: 'center', color: '#4c1d95' }
    },
    {
        id: 'pv-l-2-name',
        name: 'Nome Terça',
        type: 'day_name',
        x: 45, y: 11.2, w: 19, h: 4.5, zIndex: 2,
        style: { dayIndex: 2, fontSize: 8, fontWeight: 'bold', fontFamily: 'Montserrat', textAlign: 'left', textTransform: 'uppercase', color: '#6b21a8', letterSpacing: 0.8 }
    },

    // Quarta-feira (Card Sálvia Pastel)
    {
        id: 'pv-l-3',
        name: 'Coluna Quarta-feira',
        type: 'planner_day_box',
        x: 68, y: 9, w: 32, h: 71, zIndex: 1,
        style: {
            borderRadius: 10,
            borderColor: '#bbf7d0',
            borderWidth: 1,
            backgroundColor: '#ffffff',
            plannerDayBox: {
                dayIndex: 3,
                contentStyle: 'lines',
                lineSpacing: 16,
                showDayNumber: false,
                showDayName: false,
                headerHeight: 12,
                headerBackgroundColor: '#f0fdf4',
                headerBorderColor: '#bbf7d0',
                strokeColor: '#dcfce7',
                strokeWidth: 0.6,
                startHour: 7,
                endHour: 20,
                timeInterval: 60,
                fontFamily: 'Montserrat',
                color: '#166534'
            }
        }
    },
    {
        id: 'pv-l-3-num',
        name: 'Dia Quarta',
        type: 'day_number',
        x: 69.5, y: 10, w: 9, h: 6.5, zIndex: 2,
        style: { dayIndex: 3, fontSize: 17, fontWeight: 'bold', fontFamily: 'Playfair Display', textAlign: 'center', color: '#14532d' }
    },
    {
        id: 'pv-l-3-name',
        name: 'Nome Quarta',
        type: 'day_name',
        x: 79, y: 11.2, w: 19, h: 4.5, zIndex: 2,
        style: { dayIndex: 3, fontSize: 8, fontWeight: 'bold', fontFamily: 'Montserrat', textAlign: 'left', textTransform: 'uppercase', color: '#166534', letterSpacing: 0.8 }
    },

    // Rodapé da Semana (Página Esquerda): Prioridades da Semana & Rastreador de Hábitos
    {
        id: 'pv-l-prio-box',
        name: 'Card Prioridades da Semana',
        type: 'box',
        x: 0, y: 82, w: 48.5, h: 16, zIndex: 1,
        style: { backgroundColor: '#fff1f2', borderColor: '#fecdd3', borderWidth: 1, borderRadius: 10 }
    },
    {
        id: 'pv-l-prio-title',
        name: 'Título Prioridades da Semana',
        type: 'text',
        content: '✦ PRIORIDADES DA SEMANA',
        x: 2.5, y: 83.2, w: 43, h: 3, zIndex: 2,
        style: { fontSize: 7, fontWeight: 'bold', fontFamily: 'Montserrat', color: '#9d174d', letterSpacing: 1 }
    },
    {
        id: 'pv-l-prio-lines',
        name: 'Checklist Prioridades da Semana',
        type: 'lines',
        x: 2.5, y: 86.8, w: 43.5, h: 9.5, zIndex: 2,
        style: { rowCount: 3, color: '#fbcfe8', borderColor: '#fbcfe8', showCheckboxes: true, checkboxStyle: 'circle' }
    },
    {
        id: 'pv-l-hab-box',
        name: 'Card Hábitos da Semana',
        type: 'box',
        x: 51.5, y: 82, w: 48.5, h: 16, zIndex: 1,
        style: { backgroundColor: '#f0fdf4', borderColor: '#bbf7d0', borderWidth: 1, borderRadius: 10 }
    },
    {
        id: 'pv-l-hab-title',
        name: 'Título Hábitos da Semana',
        type: 'text',
        content: '✿ HÁBITOS & RITUAIS',
        x: 54, y: 83.2, w: 43, h: 3, zIndex: 2,
        style: { fontSize: 7, fontWeight: 'bold', fontFamily: 'Montserrat', color: '#166534', letterSpacing: 1 }
    },
    {
        id: 'pv-l-hab-tracker',
        name: 'Habit Tracker Semanal',
        type: 'habit_tracker',
        x: 54, y: 86.8, w: 43.5, h: 9.5, zIndex: 2,
        style: { habitShowLabel: false, habitMarkerType: 'dot', habitMarkerSize: 10, habitSpacing: 4, habitColor: '#15803d', borderColor: '#bbf7d0' }
    }
];

export const WEEKLY_VERTICAL_RIGHT: LayoutElement[] = [
    // Cabeçalho Artístico da Semana (Página Direita)
    {
        id: 'pv-r-wc',
        name: 'Aquarela Topo Direita',
        type: 'circle',
        x: 72, y: -3, w: 30, h: 16, zIndex: 0,
        style: { backgroundColor: '#faf5ff', borderWidth: 0, opacity: 0.75 }
    },
    {
        id: 'pv-r-quote',
        name: 'Frase Inspiradora da Semana',
        type: 'quote',
        x: 2, y: 2.5, w: 96, h: 4.5, zIndex: 2,
        style: { fontSize: 11, fontFamily: 'Dancing Script', color: '#9d174d', textAlign: 'right' }
    },

    // Quinta-feira (Card Pêssego/Creme Pastel)
    {
        id: 'pv-r-1',
        name: 'Coluna Quinta-feira',
        type: 'planner_day_box',
        x: 0, y: 9, w: 32, h: 71, zIndex: 1,
        style: {
            borderRadius: 10,
            borderColor: '#fde68a',
            borderWidth: 1,
            backgroundColor: '#ffffff',
            plannerDayBox: {
                dayIndex: 4,
                contentStyle: 'lines',
                lineSpacing: 16,
                showDayNumber: false,
                showDayName: false,
                headerHeight: 12,
                headerBackgroundColor: '#fffbeb',
                headerBorderColor: '#fde68a',
                strokeColor: '#fef3c7',
                strokeWidth: 0.6,
                startHour: 7,
                endHour: 20,
                timeInterval: 60,
                fontFamily: 'Montserrat',
                color: '#92400e'
            }
        }
    },
    {
        id: 'pv-r-1-num',
        name: 'Dia Quinta',
        type: 'day_number',
        x: 1.5, y: 10, w: 9, h: 6.5, zIndex: 2,
        style: { dayIndex: 4, fontSize: 17, fontWeight: 'bold', fontFamily: 'Playfair Display', textAlign: 'center', color: '#78350f' }
    },
    {
        id: 'pv-r-1-name',
        name: 'Nome Quinta',
        type: 'day_name',
        x: 11, y: 11.2, w: 19, h: 4.5, zIndex: 2,
        style: { dayIndex: 4, fontSize: 8, fontWeight: 'bold', fontFamily: 'Montserrat', textAlign: 'left', textTransform: 'uppercase', color: '#92400e', letterSpacing: 0.8 }
    },

    // Sexta-feira (Card Rosé Pastel)
    {
        id: 'pv-r-2',
        name: 'Coluna Sexta-feira',
        type: 'planner_day_box',
        x: 34, y: 9, w: 32, h: 71, zIndex: 1,
        style: {
            borderRadius: 10,
            borderColor: '#fbcfe8',
            borderWidth: 1,
            backgroundColor: '#ffffff',
            plannerDayBox: {
                dayIndex: 5,
                contentStyle: 'lines',
                lineSpacing: 16,
                showDayNumber: false,
                showDayName: false,
                headerHeight: 12,
                headerBackgroundColor: '#fff1f2',
                headerBorderColor: '#fbcfe8',
                strokeColor: '#fce7f3',
                strokeWidth: 0.6,
                startHour: 7,
                endHour: 20,
                timeInterval: 60,
                fontFamily: 'Montserrat',
                color: '#9d174d'
            }
        }
    },
    {
        id: 'pv-r-2-num',
        name: 'Dia Sexta',
        type: 'day_number',
        x: 35.5, y: 10, w: 9, h: 6.5, zIndex: 2,
        style: { dayIndex: 5, fontSize: 17, fontWeight: 'bold', fontFamily: 'Playfair Display', textAlign: 'center', color: '#881337' }
    },
    {
        id: 'pv-r-2-name',
        name: 'Nome Sexta',
        type: 'day_name',
        x: 45, y: 11.2, w: 19, h: 4.5, zIndex: 2,
        style: { dayIndex: 5, fontSize: 8, fontWeight: 'bold', fontFamily: 'Montserrat', textAlign: 'left', textTransform: 'uppercase', color: '#9d174d', letterSpacing: 0.8 }
    },

    // Sábado (Card Lavanda Pastel)
    {
        id: 'pv-r-3',
        name: 'Bloco Sábado',
        type: 'planner_day_box',
        x: 68, y: 9, w: 32, h: 34.5, zIndex: 1,
        style: {
            borderRadius: 10,
            borderColor: '#e9d5ff',
            borderWidth: 1,
            backgroundColor: '#ffffff',
            plannerDayBox: {
                dayIndex: 6,
                contentStyle: 'lines',
                lineSpacing: 16,
                showDayNumber: false,
                showDayName: false,
                headerHeight: 22,
                headerBackgroundColor: '#faf5ff',
                headerBorderColor: '#e9d5ff',
                strokeColor: '#f3e8ff',
                strokeWidth: 0.6
            }
        }
    },
    {
        id: 'pv-r-3-num',
        name: 'Dia Sábado',
        type: 'day_number',
        x: 69.5, y: 10, w: 9, h: 6, zIndex: 2,
        style: { dayIndex: 6, fontSize: 16, fontWeight: 'bold', fontFamily: 'Playfair Display', textAlign: 'center', color: '#4c1d95' }
    },
    {
        id: 'pv-r-3-name',
        name: 'Nome Sábado',
        type: 'day_name',
        x: 79, y: 11, w: 19, h: 4.5, zIndex: 2,
        style: { dayIndex: 6, fontSize: 8, fontWeight: 'bold', fontFamily: 'Montserrat', textAlign: 'left', textTransform: 'uppercase', color: '#6b21a8', letterSpacing: 0.8 }
    },

    // Domingo (Card Sálvia Pastel)
    {
        id: 'pv-r-4',
        name: 'Bloco Domingo',
        type: 'planner_day_box',
        x: 68, y: 45.5, w: 32, h: 34.5, zIndex: 1,
        style: {
            borderRadius: 10,
            borderColor: '#bbf7d0',
            borderWidth: 1,
            backgroundColor: '#ffffff',
            plannerDayBox: {
                dayIndex: 0,
                contentStyle: 'lines',
                lineSpacing: 16,
                showDayNumber: false,
                showDayName: false,
                headerHeight: 22,
                headerBackgroundColor: '#f0fdf4',
                headerBorderColor: '#bbf7d0',
                strokeColor: '#dcfce7',
                strokeWidth: 0.6
            }
        }
    },
    {
        id: 'pv-r-4-num',
        name: 'Dia Domingo',
        type: 'day_number',
        x: 69.5, y: 46.5, w: 9, h: 6, zIndex: 2,
        style: { dayIndex: 0, fontSize: 16, fontWeight: 'bold', fontFamily: 'Playfair Display', textAlign: 'center', color: '#14532d' }
    },
    {
        id: 'pv-r-4-name',
        name: 'Nome Domingo',
        type: 'day_name',
        x: 79, y: 47.5, w: 19, h: 4.5, zIndex: 2,
        style: { dayIndex: 0, fontSize: 8, fontWeight: 'bold', fontFamily: 'Montserrat', textAlign: 'left', textTransform: 'uppercase', color: '#166534', letterSpacing: 0.8 }
    },

    // Rodapé da Semana (Página Direita): Notas & Gratidão da Semana
    {
        id: 'pv-r-notes-box',
        name: 'Card Notas & Lembretes da Semana',
        type: 'box',
        x: 0, y: 82, w: 66, h: 16, zIndex: 1,
        style: { backgroundColor: '#faf5ff', borderColor: '#e9d5ff', borderWidth: 1, borderRadius: 10 }
    },
    {
        id: 'pv-r-notes-title',
        name: 'Título Notas da Semana',
        type: 'text',
        content: '✦ NOTAS, LEMBRETES & PARA PRÓXIMA SEMANA',
        x: 2.5, y: 83.2, w: 61, h: 3, zIndex: 2,
        style: { fontSize: 7, fontWeight: 'bold', fontFamily: 'Montserrat', color: '#6b21a8', letterSpacing: 1 }
    },
    {
        id: 'pv-r-notes-lines',
        name: 'Linhas Notas da Semana',
        type: 'lines',
        x: 2.5, y: 86.8, w: 61, h: 9.5, zIndex: 2,
        style: { rowCount: 3, color: '#e9d5ff', borderColor: '#e9d5ff' }
    },
    {
        id: 'pv-r-care-box',
        name: 'Card Gratidão Semanal',
        type: 'box',
        x: 68, y: 82, w: 32, h: 16, zIndex: 1,
        style: { backgroundColor: '#fffbeb', borderColor: '#fde68a', borderWidth: 1, borderRadius: 10 }
    },
    {
        id: 'pv-r-care-title',
        name: 'Título Gratidão Semanal',
        type: 'text',
        content: '✿ GRATIDÃO',
        x: 70, y: 83.2, w: 28, h: 3, zIndex: 2,
        style: { fontSize: 7, fontWeight: 'bold', fontFamily: 'Montserrat', color: '#92400e', letterSpacing: 1 }
    },
    {
        id: 'pv-r-care-lines',
        name: 'Linhas Gratidão Semanal',
        type: 'lines',
        x: 70, y: 86.8, w: 28, h: 9.5, zIndex: 2,
        style: { rowCount: 3, color: '#fde68a', borderColor: '#fde68a', borderStyle: 'dashed' }
    }
];

export const WEEKLY_HORIZONTAL_LEFT: LayoutElement[] = [
    // Cabeçalho Artístico Horizontal (Página Esquerda)
    {
        id: 'ph-l-sub',
        name: 'Subtítulo Caligráfico',
        type: 'text',
        content: 'minha semana em',
        x: 1, y: 1.5, w: 35, h: 4, zIndex: 2,
        style: { fontSize: 13, fontFamily: 'Dancing Script', color: '#be185d', textAlign: 'left' }
    },
    {
        id: 'ph-l-month',
        name: 'Mês da Semana',
        type: 'month_name',
        x: 33, y: 1.2, w: 48, h: 5, zIndex: 2,
        style: { fontSize: 15, fontWeight: 'bold', fontFamily: 'Playfair Display', color: '#4c0519', textAlign: 'left', textTransform: 'uppercase', letterSpacing: 2 }
    },
    {
        id: 'ph-l-year',
        name: 'Ano da Semana',
        type: 'year',
        x: 82, y: 2, w: 17, h: 4, zIndex: 2,
        style: { fontSize: 9.5, fontWeight: 'bold', fontFamily: 'Montserrat', color: '#9d174d', textAlign: 'right', letterSpacing: 1.5 }
    },

    // Segunda-feira (Rosé Pastel)
    {
        id: 'ph-l-1',
        name: 'Bloco Segunda-feira',
        type: 'planner_day_box',
        x: 0, y: 8, w: 100, h: 28.5, zIndex: 1,
        style: {
            borderRadius: 10,
            borderColor: '#fbcfe8',
            borderWidth: 1,
            backgroundColor: '#ffffff',
            plannerDayBox: {
                dayIndex: 1,
                contentStyle: 'lines',
                lineSpacing: 16,
                showDayNumber: false,
                showDayName: false,
                headerHeight: 22,
                headerBackgroundColor: '#fff1f2',
                headerBorderColor: '#fbcfe8',
                strokeColor: '#fce7f3',
                strokeWidth: 0.6
            }
        }
    },
    {
        id: 'ph-l-1-num',
        name: 'Dia Segunda',
        type: 'day_number',
        x: 2, y: 9, w: 8, h: 5.5, zIndex: 2,
        style: { dayIndex: 1, fontSize: 16, fontWeight: 'bold', fontFamily: 'Playfair Display', textAlign: 'left', color: '#881337' }
    },
    {
        id: 'ph-l-1-name',
        name: 'Nome Segunda',
        type: 'day_name',
        x: 10, y: 9.8, w: 30, h: 4.5, zIndex: 2,
        style: { dayIndex: 1, fontSize: 8.5, fontWeight: 'bold', fontFamily: 'Montserrat', textAlign: 'left', textTransform: 'uppercase', color: '#9d174d', letterSpacing: 1 }
    },

    // Terça-feira (Lavanda Pastel)
    {
        id: 'ph-l-2',
        name: 'Bloco Terça-feira',
        type: 'planner_day_box',
        x: 0, y: 38.5, w: 100, h: 28.5, zIndex: 1,
        style: {
            borderRadius: 10,
            borderColor: '#e9d5ff',
            borderWidth: 1,
            backgroundColor: '#ffffff',
            plannerDayBox: {
                dayIndex: 2,
                contentStyle: 'lines',
                lineSpacing: 16,
                showDayNumber: false,
                showDayName: false,
                headerHeight: 22,
                headerBackgroundColor: '#faf5ff',
                headerBorderColor: '#e9d5ff',
                strokeColor: '#f3e8ff',
                strokeWidth: 0.6
            }
        }
    },
    {
        id: 'ph-l-2-num',
        name: 'Dia Terça',
        type: 'day_number',
        x: 2, y: 39.5, w: 8, h: 5.5, zIndex: 2,
        style: { dayIndex: 2, fontSize: 16, fontWeight: 'bold', fontFamily: 'Playfair Display', textAlign: 'left', color: '#4c1d95' }
    },
    {
        id: 'ph-l-2-name',
        name: 'Nome Terça',
        type: 'day_name',
        x: 10, y: 40.3, w: 30, h: 4.5, zIndex: 2,
        style: { dayIndex: 2, fontSize: 8.5, fontWeight: 'bold', fontFamily: 'Montserrat', textAlign: 'left', textTransform: 'uppercase', color: '#6b21a8', letterSpacing: 1 }
    },

    // Quarta-feira (Sálvia Pastel)
    {
        id: 'ph-l-3',
        name: 'Bloco Quarta-feira',
        type: 'planner_day_box',
        x: 0, y: 69, w: 100, h: 29, zIndex: 1,
        style: {
            borderRadius: 10,
            borderColor: '#bbf7d0',
            borderWidth: 1,
            backgroundColor: '#ffffff',
            plannerDayBox: {
                dayIndex: 3,
                contentStyle: 'lines',
                lineSpacing: 16,
                showDayNumber: false,
                showDayName: false,
                headerHeight: 22,
                headerBackgroundColor: '#f0fdf4',
                headerBorderColor: '#bbf7d0',
                strokeColor: '#dcfce7',
                strokeWidth: 0.6
            }
        }
    },
    {
        id: 'ph-l-3-num',
        name: 'Dia Quarta',
        type: 'day_number',
        x: 2, y: 70, w: 8, h: 5.5, zIndex: 2,
        style: { dayIndex: 3, fontSize: 16, fontWeight: 'bold', fontFamily: 'Playfair Display', textAlign: 'left', color: '#14532d' }
    },
    {
        id: 'ph-l-3-name',
        name: 'Nome Quarta',
        type: 'day_name',
        x: 10, y: 70.8, w: 30, h: 4.5, zIndex: 2,
        style: { dayIndex: 3, fontSize: 8.5, fontWeight: 'bold', fontFamily: 'Montserrat', textAlign: 'left', textTransform: 'uppercase', color: '#166534', letterSpacing: 1 }
    }
];

export const WEEKLY_HORIZONTAL_RIGHT: LayoutElement[] = [
    // Quinta-feira (Creme/Pêssego Pastel)
    {
        id: 'ph-r-4',
        name: 'Bloco Quinta-feira',
        type: 'planner_day_box',
        x: 0, y: 2, w: 100, h: 22.5, zIndex: 1,
        style: {
            borderRadius: 10,
            borderColor: '#fde68a',
            borderWidth: 1,
            backgroundColor: '#ffffff',
            plannerDayBox: {
                dayIndex: 4,
                contentStyle: 'lines',
                lineSpacing: 16,
                showDayNumber: false,
                showDayName: false,
                headerHeight: 24,
                headerBackgroundColor: '#fffbeb',
                headerBorderColor: '#fde68a',
                strokeColor: '#fef3c7',
                strokeWidth: 0.6
            }
        }
    },
    {
        id: 'ph-r-4-num',
        name: 'Dia Quinta',
        type: 'day_number',
        x: 2, y: 2.8, w: 8, h: 5, zIndex: 2,
        style: { dayIndex: 4, fontSize: 15, fontWeight: 'bold', fontFamily: 'Playfair Display', textAlign: 'left', color: '#78350f' }
    },
    {
        id: 'ph-r-4-name',
        name: 'Nome Quinta',
        type: 'day_name',
        x: 10, y: 3.5, w: 30, h: 4, zIndex: 2,
        style: { dayIndex: 4, fontSize: 8, fontWeight: 'bold', fontFamily: 'Montserrat', textAlign: 'left', textTransform: 'uppercase', color: '#92400e', letterSpacing: 1 }
    },

    // Sexta-feira (Rosé Pastel)
    {
        id: 'ph-r-5',
        name: 'Bloco Sexta-feira',
        type: 'planner_day_box',
        x: 0, y: 26, w: 100, h: 22.5, zIndex: 1,
        style: {
            borderRadius: 10,
            borderColor: '#fbcfe8',
            borderWidth: 1,
            backgroundColor: '#ffffff',
            plannerDayBox: {
                dayIndex: 5,
                contentStyle: 'lines',
                lineSpacing: 16,
                showDayNumber: false,
                showDayName: false,
                headerHeight: 24,
                headerBackgroundColor: '#fff1f2',
                headerBorderColor: '#fbcfe8',
                strokeColor: '#fce7f3',
                strokeWidth: 0.6
            }
        }
    },
    {
        id: 'ph-r-5-num',
        name: 'Dia Sexta',
        type: 'day_number',
        x: 2, y: 26.8, w: 8, h: 5, zIndex: 2,
        style: { dayIndex: 5, fontSize: 15, fontWeight: 'bold', fontFamily: 'Playfair Display', textAlign: 'left', color: '#881337' }
    },
    {
        id: 'ph-r-5-name',
        name: 'Nome Sexta',
        type: 'day_name',
        x: 10, y: 27.5, w: 30, h: 4, zIndex: 2,
        style: { dayIndex: 5, fontSize: 8, fontWeight: 'bold', fontFamily: 'Montserrat', textAlign: 'left', textTransform: 'uppercase', color: '#9d174d', letterSpacing: 1 }
    },

    // Sábado e Domingo Lado a Lado
    {
        id: 'ph-r-6',
        name: 'Bloco Sábado',
        type: 'planner_day_box',
        x: 0, y: 50, w: 48.5, h: 23, zIndex: 1,
        style: {
            borderRadius: 10,
            borderColor: '#e9d5ff',
            borderWidth: 1,
            backgroundColor: '#ffffff',
            plannerDayBox: {
                dayIndex: 6,
                contentStyle: 'lines',
                lineSpacing: 16,
                showDayNumber: false,
                showDayName: false,
                headerHeight: 24,
                headerBackgroundColor: '#faf5ff',
                headerBorderColor: '#e9d5ff',
                strokeColor: '#f3e8ff',
                strokeWidth: 0.6
            }
        }
    },
    {
        id: 'ph-r-6-num',
        name: 'Dia Sábado',
        type: 'day_number',
        x: 2, y: 50.8, w: 8, h: 5, zIndex: 2,
        style: { dayIndex: 6, fontSize: 15, fontWeight: 'bold', fontFamily: 'Playfair Display', textAlign: 'left', color: '#4c1d95' }
    },
    {
        id: 'ph-r-6-name',
        name: 'Nome Sábado',
        type: 'day_name',
        x: 10, y: 51.5, w: 25, h: 4, zIndex: 2,
        style: { dayIndex: 6, fontSize: 8, fontWeight: 'bold', fontFamily: 'Montserrat', textAlign: 'left', textTransform: 'uppercase', color: '#6b21a8', letterSpacing: 0.8 }
    },

    {
        id: 'ph-r-7',
        name: 'Bloco Domingo',
        type: 'planner_day_box',
        x: 51.5, y: 50, w: 48.5, h: 23, zIndex: 1,
        style: {
            borderRadius: 10,
            borderColor: '#bbf7d0',
            borderWidth: 1,
            backgroundColor: '#ffffff',
            plannerDayBox: {
                dayIndex: 0,
                contentStyle: 'lines',
                lineSpacing: 16,
                showDayNumber: false,
                showDayName: false,
                headerHeight: 24,
                headerBackgroundColor: '#f0fdf4',
                headerBorderColor: '#bbf7d0',
                strokeColor: '#dcfce7',
                strokeWidth: 0.6
            }
        }
    },
    {
        id: 'ph-r-7-num',
        name: 'Dia Domingo',
        type: 'day_number',
        x: 53.5, y: 50.8, w: 8, h: 5, zIndex: 2,
        style: { dayIndex: 0, fontSize: 15, fontWeight: 'bold', fontFamily: 'Playfair Display', textAlign: 'left', color: '#14532d' }
    },
    {
        id: 'ph-r-7-name',
        name: 'Nome Domingo',
        type: 'day_name',
        x: 61.5, y: 51.5, w: 25, h: 4, zIndex: 2,
        style: { dayIndex: 0, fontSize: 8, fontWeight: 'bold', fontFamily: 'Montserrat', textAlign: 'left', textTransform: 'uppercase', color: '#166534', letterSpacing: 0.8 }
    },

    // Rodapé da Semana Horizontal: Prioridades & Hábitos (y: 75 a 98)
    {
        id: 'ph-r-prio-box',
        name: 'Card Prioridades da Semana',
        type: 'box',
        x: 0, y: 75, w: 48.5, h: 23, zIndex: 1,
        style: { backgroundColor: '#fff1f2', borderColor: '#fecdd3', borderWidth: 1, borderRadius: 10 }
    },
    {
        id: 'ph-r-prio-title',
        name: 'Título Prioridades Semana',
        type: 'text',
        content: '✦ FOCO & TAREFAS DA SEMANA',
        x: 2.5, y: 76.5, w: 43, h: 3, zIndex: 2,
        style: { fontSize: 7, fontWeight: 'bold', fontFamily: 'Montserrat', color: '#9d174d', letterSpacing: 0.8 }
    },
    {
        id: 'ph-r-prio-lines',
        name: 'Checklist Semana Horizontal',
        type: 'lines',
        x: 2.5, y: 80.5, w: 43.5, h: 15, zIndex: 2,
        style: { rowCount: 4, color: '#fbcfe8', borderColor: '#fbcfe8', showCheckboxes: true, checkboxStyle: 'circle' }
    },

    {
        id: 'ph-r-hab-box',
        name: 'Card Hábitos & Notas da Semana',
        type: 'box',
        x: 51.5, y: 75, w: 48.5, h: 23, zIndex: 1,
        style: { backgroundColor: '#f0fdf4', borderColor: '#bbf7d0', borderWidth: 1, borderRadius: 10 }
    },
    {
        id: 'ph-r-hab-title',
        name: 'Título Hábitos Semana',
        type: 'text',
        content: '✿ HÁBITOS & GRATIDÃO',
        x: 54, y: 76.5, w: 43, h: 3, zIndex: 2,
        style: { fontSize: 7, fontWeight: 'bold', fontFamily: 'Montserrat', color: '#166534', letterSpacing: 0.8 }
    },
    {
        id: 'ph-r-hab-tracker',
        name: 'Habit Tracker Horizontal',
        type: 'habit_tracker',
        x: 54, y: 80.5, w: 43.5, h: 15, zIndex: 2,
        style: { habitShowLabel: false, habitMarkerType: 'dot', habitMarkerSize: 10, habitSpacing: 4, habitColor: '#15803d', borderColor: '#bbf7d0' }
    }
];

export const WEEKLY_ONE_PAGE_VERTICAL: LayoutElement[] = [
    // Segunda
    {
        id: 'p1v-1',
        type: 'planner_day_box',
        x: 0, y: 0, w: 15.6, h: 100, zIndex: 1,
        style: {
            borderRadius: 8,
            borderColor: '#fbcfe8',
            plannerDayBox: {
                dayIndex: 1,
                contentStyle: 'lines',
                lineSpacing: 16,
                showDayNumber: false,
                showDayName: false,
                headerHeight: 12,
                headerBackgroundColor: '#fff1f2',
                headerBorderColor: '#fbcfe8',
                strokeColor: '#fce7f3'
            }
        }
    },
    {
        id: 'p1v-1-num',
        type: 'day_number',
        x: 0.5, y: 1, w: 14.6, h: 6, zIndex: 2,
        style: { dayIndex: 1, fontSize: 15, fontWeight: 'bold', fontFamily: 'Playfair Display', textAlign: 'center', color: '#881337' }
    },
    {
        id: 'p1v-1-name',
        type: 'day_name',
        x: 0.5, y: 6.5, w: 14.6, h: 5, zIndex: 2,
        style: { dayIndex: 1, fontSize: 7.5, fontWeight: 'bold', fontFamily: 'Montserrat', textAlign: 'center', textTransform: 'uppercase', color: '#9d174d' }
    },
    // Terça
    {
        id: 'p1v-2',
        type: 'planner_day_box',
        x: 16.8, y: 0, w: 15.6, h: 100, zIndex: 1,
        style: {
            borderRadius: 8,
            borderColor: '#e9d5ff',
            plannerDayBox: {
                dayIndex: 2,
                contentStyle: 'lines',
                lineSpacing: 16,
                showDayNumber: false,
                showDayName: false,
                headerHeight: 12,
                headerBackgroundColor: '#faf5ff',
                headerBorderColor: '#e9d5ff',
                strokeColor: '#f3e8ff'
            }
        }
    },
    {
        id: 'p1v-2-num',
        type: 'day_number',
        x: 17.3, y: 1, w: 14.6, h: 6, zIndex: 2,
        style: { dayIndex: 2, fontSize: 15, fontWeight: 'bold', fontFamily: 'Playfair Display', textAlign: 'center', color: '#4c1d95' }
    },
    {
        id: 'p1v-2-name',
        type: 'day_name',
        x: 17.3, y: 6.5, w: 14.6, h: 5, zIndex: 2,
        style: { dayIndex: 2, fontSize: 7.5, fontWeight: 'bold', fontFamily: 'Montserrat', textAlign: 'center', textTransform: 'uppercase', color: '#6b21a8' }
    },
    // Quarta
    {
        id: 'p1v-3',
        type: 'planner_day_box',
        x: 33.6, y: 0, w: 15.6, h: 100, zIndex: 1,
        style: {
            borderRadius: 8,
            borderColor: '#bbf7d0',
            plannerDayBox: {
                dayIndex: 3,
                contentStyle: 'lines',
                lineSpacing: 16,
                showDayNumber: false,
                showDayName: false,
                headerHeight: 12,
                headerBackgroundColor: '#f0fdf4',
                headerBorderColor: '#bbf7d0',
                strokeColor: '#dcfce7'
            }
        }
    },
    {
        id: 'p1v-3-num',
        type: 'day_number',
        x: 34.1, y: 1, w: 14.6, h: 6, zIndex: 2,
        style: { dayIndex: 3, fontSize: 15, fontWeight: 'bold', fontFamily: 'Playfair Display', textAlign: 'center', color: '#14532d' }
    },
    {
        id: 'p1v-3-name',
        type: 'day_name',
        x: 34.1, y: 6.5, w: 14.6, h: 5, zIndex: 2,
        style: { dayIndex: 3, fontSize: 7.5, fontWeight: 'bold', fontFamily: 'Montserrat', textAlign: 'center', textTransform: 'uppercase', color: '#166534' }
    },
    // Quinta
    {
        id: 'p1v-4',
        type: 'planner_day_box',
        x: 50.4, y: 0, w: 15.6, h: 100, zIndex: 1,
        style: {
            borderRadius: 8,
            borderColor: '#fde68a',
            plannerDayBox: {
                dayIndex: 4,
                contentStyle: 'lines',
                lineSpacing: 16,
                showDayNumber: false,
                showDayName: false,
                headerHeight: 12,
                headerBackgroundColor: '#fffbeb',
                headerBorderColor: '#fde68a',
                strokeColor: '#fef3c7'
            }
        }
    },
    {
        id: 'p1v-4-num',
        type: 'day_number',
        x: 50.9, y: 1, w: 14.6, h: 6, zIndex: 2,
        style: { dayIndex: 4, fontSize: 15, fontWeight: 'bold', fontFamily: 'Playfair Display', textAlign: 'center', color: '#78350f' }
    },
    {
        id: 'p1v-4-name',
        type: 'day_name',
        x: 50.9, y: 6.5, w: 14.6, h: 5, zIndex: 2,
        style: { dayIndex: 4, fontSize: 7.5, fontWeight: 'bold', fontFamily: 'Montserrat', textAlign: 'center', textTransform: 'uppercase', color: '#92400e' }
    },
    // Sexta
    {
        id: 'p1v-5',
        type: 'planner_day_box',
        x: 67.2, y: 0, w: 15.6, h: 100, zIndex: 1,
        style: {
            borderRadius: 8,
            borderColor: '#fbcfe8',
            plannerDayBox: {
                dayIndex: 5,
                contentStyle: 'lines',
                lineSpacing: 16,
                showDayNumber: false,
                showDayName: false,
                headerHeight: 12,
                headerBackgroundColor: '#fff1f2',
                headerBorderColor: '#fbcfe8',
                strokeColor: '#fce7f3'
            }
        }
    },
    {
        id: 'p1v-5-num',
        type: 'day_number',
        x: 67.7, y: 1, w: 14.6, h: 6, zIndex: 2,
        style: { dayIndex: 5, fontSize: 15, fontWeight: 'bold', fontFamily: 'Playfair Display', textAlign: 'center', color: '#881337' }
    },
    {
        id: 'p1v-5-name',
        type: 'day_name',
        x: 67.7, y: 6.5, w: 14.6, h: 5, zIndex: 2,
        style: { dayIndex: 5, fontSize: 7.5, fontWeight: 'bold', fontFamily: 'Montserrat', textAlign: 'center', textTransform: 'uppercase', color: '#9d174d' }
    },
    // Sábado
    {
        id: 'p1v-6',
        type: 'planner_day_box',
        x: 84.0, y: 0, w: 16.0, h: 49.2, zIndex: 1,
        style: {
            borderRadius: 8,
            borderColor: '#e9d5ff',
            plannerDayBox: {
                dayIndex: 6,
                contentStyle: 'lines',
                lineSpacing: 16,
                showDayNumber: false,
                showDayName: false,
                headerHeight: 22,
                headerBackgroundColor: '#faf5ff',
                headerBorderColor: '#e9d5ff',
                strokeColor: '#f3e8ff'
            }
        }
    },
    {
        id: 'p1v-6-num',
        type: 'day_number',
        x: 84.5, y: 1, w: 15.0, h: 5.5, zIndex: 2,
        style: { dayIndex: 6, fontSize: 14, fontWeight: 'bold', fontFamily: 'Playfair Display', textAlign: 'center', color: '#4c1d95' }
    },
    {
        id: 'p1v-6-name',
        type: 'day_name',
        x: 84.5, y: 6, w: 15.0, h: 4.5, zIndex: 2,
        style: { dayIndex: 6, fontSize: 7, fontWeight: 'bold', fontFamily: 'Montserrat', textAlign: 'center', textTransform: 'uppercase', color: '#6b21a8' }
    },
    // Domingo
    {
        id: 'p1v-7',
        type: 'planner_day_box',
        x: 84.0, y: 50.8, w: 16.0, h: 49.2, zIndex: 1,
        style: {
            borderRadius: 8,
            borderColor: '#bbf7d0',
            plannerDayBox: {
                dayIndex: 0,
                contentStyle: 'lines',
                lineSpacing: 16,
                showDayNumber: false,
                showDayName: false,
                headerHeight: 22,
                headerBackgroundColor: '#f0fdf4',
                headerBorderColor: '#bbf7d0',
                strokeColor: '#dcfce7'
            }
        }
    },
    {
        id: 'p1v-7-num',
        type: 'day_number',
        x: 84.5, y: 51.8, w: 15.0, h: 5.5, zIndex: 2,
        style: { dayIndex: 0, fontSize: 14, fontWeight: 'bold', fontFamily: 'Playfair Display', textAlign: 'center', color: '#14532d' }
    },
    {
        id: 'p1v-7-name',
        type: 'day_name',
        x: 84.5, y: 56.8, w: 15.0, h: 4.5, zIndex: 2,
        style: { dayIndex: 0, fontSize: 7, fontWeight: 'bold', fontFamily: 'Montserrat', textAlign: 'center', textTransform: 'uppercase', color: '#166534' }
    }
];

export const WEEKLY_ONE_PAGE_HORIZONTAL: LayoutElement[] = [
    // Segunda
    {
        id: 'p1h-1',
        type: 'planner_day_box',
        x: 0, y: 0, w: 100, h: 15, zIndex: 1,
        style: {
            borderRadius: 8,
            borderColor: '#fbcfe8',
            plannerDayBox: {
                dayIndex: 1,
                contentStyle: 'lines',
                lineSpacing: 16,
                showDayNumber: false,
                showDayName: false,
                headerHeight: 26,
                headerBackgroundColor: '#fff1f2',
                headerBorderColor: '#fbcfe8',
                strokeColor: '#fce7f3'
            }
        }
    },
    {
        id: 'p1h-1-num',
        type: 'day_number',
        x: 2, y: 0.5, w: 8, h: 4, zIndex: 2,
        style: { dayIndex: 1, fontSize: 13, fontWeight: 'bold', fontFamily: 'Playfair Display', textAlign: 'left', color: '#881337' }
    },
    {
        id: 'p1h-1-name',
        type: 'day_name',
        x: 10, y: 1, w: 28, h: 3.5, zIndex: 2,
        style: { dayIndex: 1, fontSize: 8, fontWeight: 'bold', fontFamily: 'Montserrat', textAlign: 'left', textTransform: 'uppercase', color: '#9d174d' }
    },
    // Terça
    {
        id: 'p1h-2',
        type: 'planner_day_box',
        x: 0, y: 17, w: 100, h: 15, zIndex: 1,
        style: {
            borderRadius: 8,
            borderColor: '#e9d5ff',
            plannerDayBox: {
                dayIndex: 2,
                contentStyle: 'lines',
                lineSpacing: 16,
                showDayNumber: false,
                showDayName: false,
                headerHeight: 26,
                headerBackgroundColor: '#faf5ff',
                headerBorderColor: '#e9d5ff',
                strokeColor: '#f3e8ff'
            }
        }
    },
    {
        id: 'p1h-2-num',
        type: 'day_number',
        x: 2, y: 17.5, w: 8, h: 4, zIndex: 2,
        style: { dayIndex: 2, fontSize: 13, fontWeight: 'bold', fontFamily: 'Playfair Display', textAlign: 'left', color: '#4c1d95' }
    },
    {
        id: 'p1h-2-name',
        type: 'day_name',
        x: 10, y: 18, w: 28, h: 3.5, zIndex: 2,
        style: { dayIndex: 2, fontSize: 8, fontWeight: 'bold', fontFamily: 'Montserrat', textAlign: 'left', textTransform: 'uppercase', color: '#6b21a8' }
    },
    // Quarta
    {
        id: 'p1h-3',
        type: 'planner_day_box',
        x: 0, y: 34, w: 100, h: 15, zIndex: 1,
        style: {
            borderRadius: 8,
            borderColor: '#bbf7d0',
            plannerDayBox: {
                dayIndex: 3,
                contentStyle: 'lines',
                lineSpacing: 16,
                showDayNumber: false,
                showDayName: false,
                headerHeight: 26,
                headerBackgroundColor: '#f0fdf4',
                headerBorderColor: '#bbf7d0',
                strokeColor: '#dcfce7'
            }
        }
    },
    {
        id: 'p1h-3-num',
        type: 'day_number',
        x: 2, y: 34.5, w: 8, h: 4, zIndex: 2,
        style: { dayIndex: 3, fontSize: 13, fontWeight: 'bold', fontFamily: 'Playfair Display', textAlign: 'left', color: '#14532d' }
    },
    {
        id: 'p1h-3-name',
        type: 'day_name',
        x: 10, y: 35, w: 28, h: 3.5, zIndex: 2,
        style: { dayIndex: 3, fontSize: 8, fontWeight: 'bold', fontFamily: 'Montserrat', textAlign: 'left', textTransform: 'uppercase', color: '#166534' }
    },
    // Quinta
    {
        id: 'p1h-4',
        type: 'planner_day_box',
        x: 0, y: 51, w: 100, h: 15, zIndex: 1,
        style: {
            borderRadius: 8,
            borderColor: '#fde68a',
            plannerDayBox: {
                dayIndex: 4,
                contentStyle: 'lines',
                lineSpacing: 16,
                showDayNumber: false,
                showDayName: false,
                headerHeight: 26,
                headerBackgroundColor: '#fffbeb',
                headerBorderColor: '#fde68a',
                strokeColor: '#fef3c7'
            }
        }
    },
    {
        id: 'p1h-4-num',
        type: 'day_number',
        x: 2, y: 51.5, w: 8, h: 4, zIndex: 2,
        style: { dayIndex: 4, fontSize: 13, fontWeight: 'bold', fontFamily: 'Playfair Display', textAlign: 'left', color: '#78350f' }
    },
    {
        id: 'p1h-4-name',
        type: 'day_name',
        x: 10, y: 52, w: 28, h: 3.5, zIndex: 2,
        style: { dayIndex: 4, fontSize: 8, fontWeight: 'bold', fontFamily: 'Montserrat', textAlign: 'left', textTransform: 'uppercase', color: '#92400e' }
    },
    // Sexta
    {
        id: 'p1h-5',
        type: 'planner_day_box',
        x: 0, y: 68, w: 100, h: 15, zIndex: 1,
        style: {
            borderRadius: 8,
            borderColor: '#fbcfe8',
            plannerDayBox: {
                dayIndex: 5,
                contentStyle: 'lines',
                lineSpacing: 16,
                showDayNumber: false,
                showDayName: false,
                headerHeight: 26,
                headerBackgroundColor: '#fff1f2',
                headerBorderColor: '#fbcfe8',
                strokeColor: '#fce7f3'
            }
        }
    },
    {
        id: 'p1h-5-num',
        type: 'day_number',
        x: 2, y: 68.5, w: 8, h: 4, zIndex: 2,
        style: { dayIndex: 5, fontSize: 13, fontWeight: 'bold', fontFamily: 'Playfair Display', textAlign: 'left', color: '#881337' }
    },
    {
        id: 'p1h-5-name',
        type: 'day_name',
        x: 10, y: 69, w: 28, h: 3.5, zIndex: 2,
        style: { dayIndex: 5, fontSize: 8, fontWeight: 'bold', fontFamily: 'Montserrat', textAlign: 'left', textTransform: 'uppercase', color: '#9d174d' }
    },
    // Sábado
    {
        id: 'p1h-6',
        type: 'planner_day_box',
        x: 0, y: 85, w: 49, h: 15, zIndex: 1,
        style: {
            borderRadius: 8,
            borderColor: '#e9d5ff',
            plannerDayBox: {
                dayIndex: 6,
                contentStyle: 'lines',
                lineSpacing: 16,
                showDayNumber: false,
                showDayName: false,
                headerHeight: 26,
                headerBackgroundColor: '#faf5ff',
                headerBorderColor: '#e9d5ff',
                strokeColor: '#f3e8ff'
            }
        }
    },
    {
        id: 'p1h-6-num',
        type: 'day_number',
        x: 2, y: 85.5, w: 8, h: 4, zIndex: 2,
        style: { dayIndex: 6, fontSize: 13, fontWeight: 'bold', fontFamily: 'Playfair Display', textAlign: 'left', color: '#4c1d95' }
    },
    {
        id: 'p1h-6-name',
        type: 'day_name',
        x: 10, y: 86, w: 25, h: 3.5, zIndex: 2,
        style: { dayIndex: 6, fontSize: 8, fontWeight: 'bold', fontFamily: 'Montserrat', textAlign: 'left', textTransform: 'uppercase', color: '#6b21a8' }
    },
    // Domingo
    {
        id: 'p1h-7',
        type: 'planner_day_box',
        x: 51, y: 85, w: 49, h: 15, zIndex: 1,
        style: {
            borderRadius: 8,
            borderColor: '#bbf7d0',
            plannerDayBox: {
                dayIndex: 0,
                contentStyle: 'lines',
                lineSpacing: 16,
                showDayNumber: false,
                showDayName: false,
                headerHeight: 26,
                headerBackgroundColor: '#f0fdf4',
                headerBorderColor: '#bbf7d0',
                strokeColor: '#dcfce7'
            }
        }
    },
    {
        id: 'p1h-7-num',
        type: 'day_number',
        x: 53, y: 85.5, w: 8, h: 4, zIndex: 2,
        style: { dayIndex: 0, fontSize: 13, fontWeight: 'bold', fontFamily: 'Playfair Display', textAlign: 'left', color: '#14532d' }
    },
    {
        id: 'p1h-7-name',
        type: 'day_name',
        x: 61, y: 86, w: 25, h: 3.5, zIndex: 2,
        style: { dayIndex: 0, fontSize: 8, fontWeight: 'bold', fontFamily: 'Montserrat', textAlign: 'left', textTransform: 'uppercase', color: '#166534' }
    }
];
