import { AgendaConfig, IntroPage, LayoutElement, MonthlyDividerStyle } from '../../../types';
import { INTRO_TEMPLATES } from './introTemplates';
import { DAILY_PERMANENT, PERMANENT_2DPP_TOP, PERMANENT_2DPP_BOTTOM } from './dailyTemplates';
import { generateHolidayListFullText } from '../../../core/backend/calendar';

export const STANDARD_DAILY_MIOLO_ELEMENTS: LayoutElement[] = [
    // Aquarelas Orgânicas de Fundo (Tons Pastéis Suaves)
    {
        id: 'std-d-wc-1',
        name: 'Aquarela Rosé Topo',
        type: 'circle',
        x: -4, y: -3, w: 32, h: 20,
        zIndex: 0,
        style: {
            backgroundColor: '#fdf2f8',
            borderWidth: 0,
            opacity: 0.75
        }
    },
    {
        id: 'std-d-wc-2',
        name: 'Aquarela Sálvia Rodapé',
        type: 'circle',
        x: 72, y: 82, w: 32, h: 20,
        zIndex: 0,
        style: {
            backgroundColor: '#f0fdf4',
            borderWidth: 0,
            opacity: 0.65
        }
    },
    {
        id: 'std-d-botanical-top',
        name: 'Ramo Botânico Cabeçalho',
        type: 'vector_shape',
        x: 51, y: 3.5, w: 12, h: 11,
        zIndex: 1,
        style: {
            shapeType: 'shape-72',
            fillColor: '#f43f5e',
            borderColor: '#be185d',
            borderWidth: 0.5,
            opacity: 0.16
        }
    },

    // Cabeçalho Esquerdo: Badge Pastel do Dia + Tipografia Editorial
    {
        id: 'std-d-num-box',
        name: 'Moldura Pastel do Dia',
        type: 'box',
        x: 6, y: 4, w: 15.5, h: 10.5,
        zIndex: 1,
        style: {
            backgroundColor: '#fff1f2',
            borderColor: '#fbcfe8',
            borderWidth: 1,
            borderRadius: 12
        }
    },
    {
        id: 'std-d-num',
        name: 'Número do Dia',
        type: 'day_number',
        x: 6, y: 4.2, w: 15.5, h: 10,
        zIndex: 2,
        style: {
            fontSize: 22,
            fontWeight: 'bold',
            fontFamily: 'Playfair Display',
            color: '#881337',
            textAlign: 'center',
            verticalAlign: 'middle'
        }
    },
    {
        id: 'std-d-name',
        name: 'Dia da Semana',
        type: 'day_name',
        x: 23.5, y: 4.5, w: 38, h: 4.2,
        zIndex: 2,
        style: {
            fontSize: 8.5,
            fontWeight: 'bold',
            fontFamily: 'Montserrat',
            color: '#9d174d',
            textAlign: 'left',
            textTransform: 'uppercase',
            letterSpacing: 0.8
        }
    },
    {
        id: 'std-d-month',
        name: 'Mês Atual (Caligrafia)',
        type: 'month_name',
        x: 23.5, y: 8.5, w: 23, h: 4.5,
        zIndex: 2,
        style: {
            fontSize: 12,
            fontWeight: 'normal',
            fontFamily: 'Dancing Script',
            color: '#be185d',
            textAlign: 'left',
            textTransform: 'capitalize'
        }
    },
    {
        id: 'std-d-year',
        name: 'Ano',
        type: 'year',
        x: 47, y: 9.2, w: 12, h: 3.5,
        zIndex: 2,
        style: {
            fontSize: 8,
            fontWeight: 'bold',
            fontFamily: 'Playfair Display',
            color: '#a1a1aa',
            textAlign: 'left',
            letterSpacing: 0.8
        }
    },
    {
        id: 'std-d-holiday',
        name: 'Feriado do Dia',
        type: 'holiday',
        x: 6, y: 15.2, w: 56, h: 3,
        zIndex: 2,
        style: {
            fontSize: 6.8,
            fontWeight: 'bold',
            fontFamily: 'Montserrat',
            color: '#be123c',
            textAlign: 'left'
        }
    },

    // Cabeçalho Direito: Card Mini Calendário do Mês
    {
        id: 'std-d-minical-bg',
        name: 'Card Mini Calendário',
        type: 'box',
        x: 63.5, y: 3.5, w: 30.5, h: 14.8,
        zIndex: 1,
        style: {
            backgroundColor: '#fffbfc',
            borderColor: '#fce7f3',
            borderWidth: 1,
            borderRadius: 10
        }
    },
    {
        id: 'std-d-minical',
        name: 'Mini Calendário',
        type: 'mini_calendar',
        x: 64.5, y: 4, w: 28.5, h: 13.8,
        zIndex: 2,
        style: {
            useGlobalStyle: false,
            calendarOffset: 0,
            fullCalendar: {
                showYearInTitle: true,
                title: { fontSize: 6.5, fontWeight: 'bold', textAlign: 'center', color: '#881337', fontFamily: 'Playfair Display', textTransform: 'uppercase', letterSpacing: 0.8 },
                weekDays: { fontSize: 5, fontWeight: 'bold', textAlign: 'center', color: '#db2777', fontFamily: 'Montserrat' },
                days: { fontSize: 5.5, fontWeight: 'normal', textAlign: 'center', color: '#52525b', fontFamily: 'Montserrat' },
                grid: {
                    borderColor: '#fbcfe8',
                    borderWidth: 0.5,
                    borderStyle: 'solid',
                    cellBackgroundColor: 'transparent',
                    headerBackgroundColor: '#fdf2f8',
                    borders: { top: false, bottom: false, left: false, right: false, insideHorizontal: false, insideVertical: false, headerSeparator: true }
                }
            }
        }
    },

    // Box de Prioridades do Dia (Lavanda & Rosé Pastel)
    {
        id: 'std-d-prio-box',
        name: 'Box Prioridades Pastel',
        type: 'box',
        x: 6, y: 19.2, w: 88, h: 13.5,
        zIndex: 1,
        style: {
            backgroundColor: '#faf5ff',
            borderColor: '#e9d5ff',
            borderWidth: 1,
            borderRadius: 10
        }
    },
    {
        id: 'std-d-prio-title',
        name: 'Título Prioridades',
        type: 'text',
        content: '✦ PRIORIDADES DO DIA',
        x: 8.5, y: 20.2, w: 52, h: 3,
        zIndex: 2,
        style: {
            fontSize: 7,
            fontWeight: 'bold',
            fontFamily: 'Montserrat',
            color: '#6b21a8',
            textAlign: 'left',
            letterSpacing: 0.8
        }
    },
    {
        id: 'std-d-prio-sub',
        name: 'Subtítulo Caligráfico Prioridades',
        type: 'text',
        content: 'foco essencial',
        x: 65, y: 19.8, w: 26, h: 3.5,
        zIndex: 2,
        style: {
            fontSize: 9.5,
            fontWeight: 'normal',
            fontFamily: 'Dancing Script',
            color: '#9333ea',
            textAlign: 'right'
        }
    },
    {
        id: 'std-d-prio-lines',
        name: 'Check-list de Prioridades',
        type: 'lines',
        x: 8.5, y: 23.5, w: 83, h: 8.2,
        zIndex: 2,
        style: {
            lineSpacing: 13,
            color: '#e9d5ff',
            borderWidth: 0.6,
            borderStyle: 'solid',
            showCheckboxes: true,
            checkboxStyle: 'circle'
        }
    },

    // Pauta Principal de Horários (07:00 às 20:00) em Moldura Delicada
    {
        id: 'std-d-sched-bg',
        name: 'Moldura da Pauta',
        type: 'box',
        x: 6, y: 34, w: 88, h: 44.5,
        zIndex: 1,
        style: {
            backgroundColor: '#ffffff',
            borderColor: '#fce7f3',
            borderWidth: 1,
            borderRadius: 10
        }
    },
    {
        id: 'std-d-sched-title',
        name: 'Título Pauta Diária',
        type: 'text',
        content: 'AGENDA & COMPROMISSOS',
        x: 8, y: 35, w: 50, h: 3,
        zIndex: 2,
        style: {
            fontSize: 7,
            fontWeight: 'bold',
            fontFamily: 'Montserrat',
            color: '#9d174d',
            textAlign: 'left',
            letterSpacing: 0.8
        }
    },
    {
        id: 'std-d-sched-lines',
        name: 'Linhas com Horários',
        type: 'lines',
        x: 8, y: 38.5, w: 84, h: 38.5,
        zIndex: 2,
        style: {
            lineSpacing: 14,
            color: '#fbcfe8',
            borderWidth: 0.5,
            borderStyle: 'solid',
            showTimes: true,
            startHour: 7,
            stepHour: 1,
            timeFontSize: 7,
            timeColor: '#be185d',
            timeFontWeight: 'bold',
            timeColumnWidth: 26
        }
    },

    // Rodapé Duplo Pastel: Lembretes (Sálvia) + Autocuidado & Gratidão (Pêssego/Rosé)
    {
        id: 'std-d-notes-box',
        name: 'Box Lembretes Sálvia',
        type: 'box',
        x: 6, y: 80, w: 54, h: 13.5,
        zIndex: 1,
        style: {
            backgroundColor: '#f0fdf4',
            borderColor: '#bbf7d0',
            borderWidth: 1,
            borderRadius: 10
        }
    },
    {
        id: 'std-d-notes-title',
        name: 'Título Lembretes',
        type: 'text',
        content: '✿ LEMBRETES & GRATIDÃO',
        x: 8, y: 81, w: 48, h: 3,
        zIndex: 2,
        style: {
            fontSize: 6.8,
            fontWeight: 'bold',
            fontFamily: 'Montserrat',
            color: '#166534',
            textAlign: 'left',
            letterSpacing: 0.8
        }
    },
    {
        id: 'std-d-notes-lines',
        name: 'Linhas de Lembretes',
        type: 'lines',
        x: 8, y: 84.2, w: 50, h: 8,
        zIndex: 2,
        style: {
            lineSpacing: 13,
            color: '#bbf7d0',
            borderWidth: 0.5,
            borderStyle: 'dashed'
        }
    },

    // Card Autocuidado (Hidratação & Humor)
    {
        id: 'std-d-care-box',
        name: 'Box Autocuidado Pastel',
        type: 'box',
        x: 62, y: 80, w: 32, h: 13.5,
        zIndex: 1,
        style: {
            backgroundColor: '#fff1f2',
            borderColor: '#fecdd3',
            borderWidth: 1,
            borderRadius: 10
        }
    },
    {
        id: 'std-d-water',
        name: 'Hidratação Diária',
        type: 'footer_tracker',
        x: 63.5, y: 81.2, w: 29, h: 5.5,
        zIndex: 2,
        style: {
            variant: 'water',
            title: 'HIDRATAÇÃO',
            color: '#9d174d'
        }
    },
    {
        id: 'std-d-mood',
        name: 'Humor do Dia',
        type: 'footer_tracker',
        x: 63.5, y: 87.2, w: 29, h: 5.5,
        zIndex: 2,
        style: {
            variant: 'mood',
            title: 'MEU HUMOR',
            color: '#9d174d'
        }
    },

    // Frase do Dia no Rodapé com Caligrafia Artística
    {
        id: 'std-d-quote',
        name: 'Frase Inspiradora do Dia',
        type: 'quote',
        x: 6, y: 94.2, w: 88, h: 3.8,
        zIndex: 2,
        style: {
            fontSize: 8.5,
            fontStyle: 'normal',
            fontFamily: 'Dancing Script',
            color: '#be185d',
            textAlign: 'center'
        }
    }
];

export const STANDARD_HALF_PAGE_TOP_ELEMENTS: LayoutElement[] = [
    {
        id: 'std-top-card',
        name: 'Card Superior Pastel',
        type: 'box',
        x: 5, y: 2.5, w: 90, h: 44.5,
        zIndex: 0,
        style: {
            backgroundColor: '#fffbfc',
            borderColor: '#fbcfe8',
            borderWidth: 1,
            borderRadius: 12
        }
    },
    {
        id: 'std-top-badge',
        name: 'Badge Dia Superior',
        type: 'box',
        x: 7, y: 4, w: 12, h: 7.5,
        zIndex: 1,
        style: {
            backgroundColor: '#fff1f2',
            borderColor: '#fecdd3',
            borderWidth: 1,
            borderRadius: 8
        }
    },
    {
        id: 'std-top-num',
        name: 'Número do Dia (Topo)',
        type: 'day_number',
        x: 7, y: 4.2, w: 12, h: 7,
        zIndex: 2,
        style: { fontSize: 19, fontWeight: 'bold', fontFamily: 'Playfair Display', color: '#881337', textAlign: 'center' }
    },
    {
        id: 'std-top-name',
        name: 'Dia da Semana (Topo)',
        type: 'day_name',
        x: 20.5, y: 4.2, w: 28, h: 3.5,
        zIndex: 2,
        style: { fontSize: 8, fontWeight: 'bold', fontFamily: 'Montserrat', color: '#9d174d', textAlign: 'left', textTransform: 'uppercase', letterSpacing: 0.6 }
    },
    {
        id: 'std-top-month',
        name: 'Mês (Topo)',
        type: 'month_name',
        x: 20.5, y: 7.6, w: 26, h: 3.5,
        zIndex: 2,
        style: { fontSize: 10.5, fontWeight: 'normal', fontFamily: 'Dancing Script', color: '#be185d', textAlign: 'left', textTransform: 'capitalize' }
    },
    {
        id: 'std-top-holiday',
        name: 'Feriado (Topo)',
        type: 'holiday',
        x: 50, y: 4.2, w: 43, h: 3,
        zIndex: 2,
        style: { fontSize: 6, fontWeight: 'bold', fontFamily: 'Montserrat', color: '#be123c', textAlign: 'right', letterSpacing: 0.4 }
    },
    {
        id: 'std-top-prio-box',
        name: 'Prioridades Topo',
        type: 'box',
        x: 7, y: 12.5, w: 86, h: 6.5,
        zIndex: 1,
        style: { backgroundColor: '#faf5ff', borderColor: '#e9d5ff', borderWidth: 0.8, borderRadius: 6 }
    },
    {
        id: 'std-top-prio-lbl',
        name: 'Label Foco Topo',
        type: 'text',
        content: '✦ FOCO:',
        x: 8.5, y: 14.2, w: 14, h: 3,
        zIndex: 2,
        style: { fontSize: 6, fontWeight: 'bold', fontFamily: 'Montserrat', color: '#6b21a8', letterSpacing: 0.8 }
    },
    {
        id: 'std-top-lines',
        name: 'Linhas (Topo)',
        type: 'lines',
        x: 7, y: 20, w: 86, h: 25,
        zIndex: 2,
        style: { lineSpacing: 14, color: '#fce7f3', borderWidth: 0.5, showCheckboxes: true, checkboxStyle: 'circle' }
    }
];

export const STANDARD_HALF_PAGE_BOTTOM_ELEMENTS: LayoutElement[] = [
    {
        id: 'std-bot-card',
        name: 'Card Inferior Pastel',
        type: 'box',
        x: 5, y: 51.5, w: 90, h: 44.5,
        zIndex: 0,
        style: {
            backgroundColor: '#f0fdf4',
            borderColor: '#bbf7d0',
            borderWidth: 1,
            borderRadius: 12,
            opacity: 0.45
        }
    },
    {
        id: 'std-bot-badge',
        name: 'Badge Dia Inferior',
        type: 'box',
        x: 7, y: 53, w: 12, h: 7.5,
        zIndex: 1,
        style: {
            backgroundColor: '#ecfdf5',
            borderColor: '#a7f3d0',
            borderWidth: 1,
            borderRadius: 8
        }
    },
    {
        id: 'std-bot-num',
        name: 'Número do Dia (Base)',
        type: 'day_number',
        x: 7, y: 53.2, w: 12, h: 7,
        zIndex: 2,
        style: { fontSize: 19, fontWeight: 'bold', fontFamily: 'Playfair Display', color: '#14532d', textAlign: 'center' }
    },
    {
        id: 'std-bot-name',
        name: 'Dia da Semana (Base)',
        type: 'day_name',
        x: 20.5, y: 53.2, w: 28, h: 3.5,
        zIndex: 2,
        style: { fontSize: 8, fontWeight: 'bold', fontFamily: 'Montserrat', color: '#166534', textAlign: 'left', textTransform: 'uppercase', letterSpacing: 0.6 }
    },
    {
        id: 'std-bot-month',
        name: 'Mês (Base)',
        type: 'month_name',
        x: 20.5, y: 56.6, w: 26, h: 3.5,
        zIndex: 2,
        style: { fontSize: 10.5, fontWeight: 'normal', fontFamily: 'Dancing Script', color: '#15803d', textAlign: 'left', textTransform: 'capitalize' }
    },
    {
        id: 'std-bot-holiday',
        name: 'Feriado (Base)',
        type: 'holiday',
        x: 50, y: 53.2, w: 43, h: 3,
        zIndex: 2,
        style: { fontSize: 6, fontWeight: 'bold', fontFamily: 'Montserrat', color: '#be123c', textAlign: 'right', letterSpacing: 0.4 }
    },
    {
        id: 'std-bot-lines',
        name: 'Linhas (Base)',
        type: 'lines',
        x: 7, y: 62, w: 86, h: 32,
        zIndex: 2,
        style: { lineSpacing: 14, color: '#bbf7d0', borderWidth: 0.6, showCheckboxes: true, checkboxStyle: 'circle' }
    }
];

export const STANDARD_DIVIDER_FRONT_ELEMENTS: LayoutElement[] = [
    // Fundo Pastel Artístico com Aquarelas e Moldura Editorial Dupla
    {
        id: 'div-f-bg-card',
        name: 'Fundo Pastel da Divisória',
        type: 'box',
        x: 5, y: 4, w: 90, h: 92,
        zIndex: 0,
        style: {
            backgroundType: 'gradient',
            gradientType: 'linear',
            gradientDirection: 135,
            gradientColors: ['#fff1f2', '#fdfbf7'],
            borderColor: '#fbcfe8',
            borderWidth: 1.5,
            borderRadius: 16
        }
    },
    {
        id: 'div-f-wc-top',
        name: 'Mancha Aquarela Rosé',
        type: 'circle',
        x: 12, y: 8, w: 52, h: 32,
        zIndex: 0,
        style: {
            backgroundColor: '#fce7f3',
            borderWidth: 0,
            opacity: 0.55
        }
    },
    {
        id: 'div-f-wc-bot',
        name: 'Mancha Aquarela Sálvia',
        type: 'circle',
        x: 38, y: 56, w: 48, h: 30,
        zIndex: 0,
        style: {
            backgroundColor: '#dcfce7',
            borderWidth: 0,
            opacity: 0.45
        }
    },
    {
        id: 'div-f-inner-frame',
        name: 'Moldura Interna Fina Dourado Rosé',
        type: 'box',
        x: 8, y: 6.5, w: 84, h: 87,
        zIndex: 1,
        style: {
            backgroundColor: 'transparent',
            borderColor: '#f43f5e',
            borderWidth: 0.6,
            borderRadius: 12,
            opacity: 0.35
        }
    },
    // Ilustrações Botânicas Vetoriais nos Cantos
    {
        id: 'div-f-botanical-1',
        name: 'Ramo de Oliveira Superior',
        type: 'vector_shape',
        x: 10, y: 8, w: 24, h: 18,
        zIndex: 1,
        style: {
            shapeType: 'shape-72',
            fillColor: '#be185d',
            borderColor: '#881337',
            borderWidth: 0.5,
            opacity: 0.18
        }
    },
    {
        id: 'div-f-botanical-2',
        name: 'Flor Botânica Inferior',
        type: 'vector_shape',
        x: 66, y: 74, w: 22, h: 16,
        zIndex: 1,
        style: {
            shapeType: 'shape-75',
            fillColor: '#15803d',
            borderColor: '#166534',
            borderWidth: 0.5,
            opacity: 0.16
        }
    },
    // Badge Circular do Mês + Nome do Mês Editorial
    {
        id: 'div-f-badge-circle',
        name: 'Medalhão Pastel do Mês',
        type: 'circle',
        x: 41, y: 12, w: 18, h: 11,
        zIndex: 1,
        style: {
            backgroundColor: '#ffffff',
            borderColor: '#f9a8d4',
            borderWidth: 1.2
        }
    },
    {
        id: 'div-f-num',
        name: 'Número do Mês',
        type: 'date_placeholder',
        x: 41, y: 13.5, w: 18, h: 8,
        zIndex: 2,
        style: {
            variant: 'month_number',
            fontSize: 22,
            fontWeight: 'bold',
            fontFamily: 'Playfair Display',
            color: '#9d174d',
            textAlign: 'center'
        }
    },
    {
        id: 'div-f-welcome',
        name: 'Saudação Caligráfica',
        type: 'text',
        content: 'bem-vindo,',
        x: 20, y: 24.5, w: 60, h: 5,
        zIndex: 2,
        style: {
            fontSize: 18,
            fontWeight: 'normal',
            fontFamily: 'Dancing Script',
            color: '#be185d',
            textAlign: 'center'
        }
    },
    {
        id: 'div-f-month',
        name: 'Nome do Mês',
        type: 'month_name',
        x: 12, y: 29.5, w: 76, h: 10,
        zIndex: 2,
        style: {
            fontSize: 30,
            fontWeight: 'bold',
            fontFamily: 'Playfair Display',
            color: '#4c0519',
            textAlign: 'center',
            textTransform: 'uppercase',
            letterSpacing: 4
        }
    },
    {
        id: 'div-f-year',
        name: 'Ano da Divisória',
        type: 'year',
        x: 35, y: 39.5, w: 30, h: 4,
        zIndex: 2,
        style: {
            fontSize: 10.5,
            fontWeight: 'bold',
            fontFamily: 'Montserrat',
            color: '#9d174d',
            textAlign: 'center',
            letterSpacing: 3
        }
    },
    {
        id: 'div-f-ornament',
        name: 'Ornamento Floral Divisor',
        type: 'vector_shape',
        x: 32, y: 44, w: 36, h: 4,
        zIndex: 2,
        style: {
            shapeType: 'ornament-1',
            fillColor: '#f43f5e',
            borderColor: '#be185d',
            borderWidth: 0.8,
            opacity: 0.45
        }
    },
    // Card Branco Puríssimo para o Mini Calendário
    {
        id: 'div-f-cal-card',
        name: 'Card do Calendário Mensal',
        type: 'box',
        x: 20, y: 50, w: 60, h: 29,
        zIndex: 1,
        style: {
            backgroundColor: '#ffffff',
            borderColor: '#fbcfe8',
            borderWidth: 1,
            borderRadius: 12
        }
    },
    {
        id: 'div-f-minical',
        name: 'Mini Calendário da Divisória',
        type: 'mini_calendar',
        x: 23, y: 52, w: 54, h: 25,
        zIndex: 2,
        style: {
            useGlobalStyle: false,
            calendarOffset: 0,
            fullCalendar: {
                showYearInTitle: false,
                title: { fontSize: 8.5, fontWeight: 'bold', textAlign: 'center', color: '#881337', fontFamily: 'Playfair Display', textTransform: 'uppercase', letterSpacing: 1.5 },
                weekDays: { fontSize: 6.5, fontWeight: 'bold', textAlign: 'center', color: '#db2777', fontFamily: 'Montserrat' },
                days: { fontSize: 7, fontWeight: 'normal', textAlign: 'center', color: '#3f3f46', fontFamily: 'Montserrat' },
                grid: {
                    borderColor: '#fce7f3',
                    borderWidth: 0.5,
                    borderStyle: 'solid',
                    cellBackgroundColor: 'transparent',
                    headerBackgroundColor: '#fdf2f8',
                    borders: { top: false, bottom: false, left: false, right: false, insideHorizontal: false, insideVertical: false, headerSeparator: true }
                }
            }
        }
    },
    {
        id: 'div-f-quote',
        name: 'Citação Inspiradora do Mês',
        type: 'quote',
        x: 15, y: 82.5, w: 70, h: 7,
        zIndex: 2,
        style: {
            fontSize: 13,
            fontStyle: 'normal',
            fontFamily: 'Dancing Script',
            color: '#881337',
            textAlign: 'center'
        }
    }
];

export const STANDARD_DIVIDER_VERSO_ELEMENTS: LayoutElement[] = [
    // Aquarela Decorativa de Topo
    {
        id: 'div-v-wc',
        name: 'Aquarela Topo Verso',
        type: 'circle',
        x: 68, y: -4, w: 36, h: 22,
        zIndex: 0,
        style: { backgroundColor: '#faf5ff', borderWidth: 0, opacity: 0.8 }
    },
    // Cabeçalho Editorial do Verso da Divisória
    {
        id: 'div-v-sub-script',
        name: 'Subtítulo Caligráfico Verso',
        type: 'text',
        content: 'intenções, metas & rituais de',
        x: 8, y: 4.5, w: 84, h: 4.5,
        zIndex: 2,
        style: {
            fontSize: 15,
            fontWeight: 'normal',
            fontFamily: 'Dancing Script',
            color: '#be185d',
            textAlign: 'center'
        }
    },
    {
        id: 'div-v-month',
        name: 'Mês do Resumo',
        type: 'month_name',
        x: 8, y: 8.5, w: 84, h: 6,
        zIndex: 2,
        style: {
            fontSize: 18,
            fontWeight: 'bold',
            fontFamily: 'Playfair Display',
            color: '#4c0519',
            textAlign: 'center',
            textTransform: 'uppercase',
            letterSpacing: 3
        }
    },
    {
        id: 'div-v-sep',
        name: 'Linha Decorativa Verso',
        type: 'lines',
        x: 25, y: 15.5, w: 50, h: 1,
        zIndex: 1,
        style: { color: '#fbcfe8', borderWidth: 1, lineSpacing: 15 }
    },

    // Box 1: Prioridades do Mês (Rosé Quartzo Pastel)
    {
        id: 'div-v-b1',
        name: 'Card Prioridades do Mês',
        type: 'box',
        x: 7, y: 18, w: 41.5, h: 32,
        zIndex: 1,
        style: { backgroundColor: '#fff1f2', borderWidth: 1, borderColor: '#fecdd3', borderRadius: 12 }
    },
    {
        id: 'div-v-t1',
        name: 'Subtítulo Prioridades',
        type: 'text',
        content: '✦ PRIORIDADES DO MÊS',
        x: 9.5, y: 19.8, w: 36.5, h: 3.5,
        zIndex: 2,
        style: { fontSize: 8, fontWeight: 'bold', fontFamily: 'Montserrat', color: '#9d174d', textAlign: 'left', letterSpacing: 1 }
    },
    {
        id: 'div-v-l1',
        name: 'Linhas Prioridades',
        type: 'lines',
        x: 9.5, y: 24, w: 36.5, h: 24,
        zIndex: 2,
        style: { lineSpacing: 16, color: '#fecdd3', borderWidth: 0.6, showCheckboxes: true, checkboxStyle: 'circle' }
    },

    // Box 2: Metas & Projetos (Creme Pêssego Pastel)
    {
        id: 'div-v-b2',
        name: 'Card Metas do Mês',
        type: 'box',
        x: 51.5, y: 18, w: 41.5, h: 32,
        zIndex: 1,
        style: { backgroundColor: '#fffbeb', borderWidth: 1, borderColor: '#fde68a', borderRadius: 12 }
    },
    {
        id: 'div-v-t2',
        name: 'Subtítulo Metas',
        type: 'text',
        content: '✦ METAS & PROJETOS',
        x: 54, y: 19.8, w: 36.5, h: 3.5,
        zIndex: 2,
        style: { fontSize: 8, fontWeight: 'bold', fontFamily: 'Montserrat', color: '#92400e', textAlign: 'left', letterSpacing: 1 }
    },
    {
        id: 'div-v-l2',
        name: 'Linhas Metas',
        type: 'lines',
        x: 54, y: 24, w: 36.5, h: 24,
        zIndex: 2,
        style: { lineSpacing: 16, color: '#fde68a', borderWidth: 0.6, showCheckboxes: true, checkboxStyle: 'circle' }
    },

    // Box 3: Habit Tracker Mensal (Verde Sálvia Botânico)
    {
        id: 'div-v-b3',
        name: 'Card Hábitos Sálvia',
        type: 'box',
        x: 7, y: 52.5, w: 86, h: 20.5,
        zIndex: 1,
        style: { backgroundColor: '#f0fdf4', borderWidth: 1, borderColor: '#bbf7d0', borderRadius: 12 }
    },
    {
        id: 'div-v-t3',
        name: 'Subtítulo Hábitos',
        type: 'text',
        content: '✿ RITUAIS, HÁBITOS & AUTOCUIDADO',
        x: 9.5, y: 54, w: 60, h: 3.5,
        zIndex: 2,
        style: { fontSize: 8, fontWeight: 'bold', fontFamily: 'Montserrat', color: '#166534', textAlign: 'left', letterSpacing: 1 }
    },
    {
        id: 'div-v-ht',
        name: 'Habit Tracker Mensal',
        type: 'habit_tracker',
        x: 9.5, y: 58.5, w: 81, h: 12.5,
        zIndex: 2,
        style: { habitLabel: 'Meu Hábito Essencial' }
    },

    // Box 4: Anotações & Gratidão do Mês (Lavanda Suave)
    {
        id: 'div-v-b4',
        name: 'Card Notas Lavanda',
        type: 'box',
        x: 7, y: 75.5, w: 86, h: 19,
        zIndex: 1,
        style: { backgroundColor: '#faf5ff', borderWidth: 1, borderColor: '#e9d5ff', borderRadius: 12 }
    },
    {
        id: 'div-v-t4',
        name: 'Subtítulo Notas',
        type: 'text',
        content: '✦ DATAS ESPECIAIS, INSIGHTS & LEMBRETES DO MÊS',
        x: 9.5, y: 77, w: 75, h: 3.5,
        zIndex: 2,
        style: { fontSize: 8, fontWeight: 'bold', fontFamily: 'Montserrat', color: '#6b21a8', textAlign: 'left', letterSpacing: 1 }
    },
    {
        id: 'div-v-l4',
        name: 'Linhas Notas do Mês',
        type: 'lines',
        x: 9.5, y: 81, w: 81, h: 11.5,
        zIndex: 2,
        style: { lineSpacing: 15, color: '#e9d5ff', borderWidth: 0.6 }
    }
];

export const STANDARD_MONTHLY_INTRO_PAGES: IntroPage[] = [
    {
        id: 'monthly-tpl-calendario',
        name: 'Visão Mensal (Pastel Editorial)',
        elements: INTRO_TEMPLATES.find(t => t.id === 'tpl-mensal-completo')!.elements
    },
    {
        id: 'monthly-tpl-financeiro',
        name: 'Financeiro do Mês (Pastel)',
        elements: INTRO_TEMPLATES.find(t => t.id === 'tpl-financeiro')!.elements
    }
];

const STANDARD_INTRO_TEMPLATE_IDS = [
    'tpl-dados-pessoais',
    'tpl-calendario-anual-feriados',
    'tpl-calendario-proximo-ano',
    'tpl-datas-importantes',
    'tpl-planejamento-anual',
    'tpl-metas',
    'tpl-contatos',
    'tpl-senhas',
    'tpl-financeiro-anual',
    'tpl-anotacoes-gerais'
];

const PERMANENT_INTRO_TEMPLATE_IDS = [
    'tpl-dados-pessoais',
    'tpl-datas-importantes',
    'tpl-planejamento-anual',
    'tpl-metas',
    'tpl-roda-vida',
    'tpl-contatos',
    'tpl-senhas',
    'tpl-financeiro-anual',
    'tpl-anotacoes-gerais'
];

export const PERMANENT_DIVIDER_FRONT_ELEMENTS: LayoutElement[] = [
    {
        id: 'pdiv-f-bg',
        name: 'Fundo Pastel da Divisória Permanente',
        type: 'box',
        x: 5, y: 4, w: 90, h: 92,
        zIndex: 0,
        style: {
            backgroundType: 'gradient',
            gradientType: 'linear',
            gradientDirection: 135,
            gradientColors: ['#fff1f2', '#fdfbf7'],
            borderColor: '#fbcfe8',
            borderWidth: 1.5,
            borderRadius: 16
        }
    },
    {
        id: 'pdiv-f-wc-top',
        name: 'Mancha Aquarela Rosé',
        type: 'circle',
        x: 14, y: 10, w: 50, h: 30,
        zIndex: 0,
        style: { backgroundColor: '#fce7f3', borderWidth: 0, opacity: 0.5 }
    },
    {
        id: 'pdiv-f-inner-frame',
        name: 'Moldura Interna Dourado Rosé',
        type: 'box',
        x: 8, y: 6.5, w: 84, h: 87,
        zIndex: 1,
        style: { backgroundColor: 'transparent', borderColor: '#f43f5e', borderWidth: 0.6, borderRadius: 12, opacity: 0.35 }
    },
    {
        id: 'pdiv-f-welcome',
        name: 'Saudação Caligráfica',
        type: 'text',
        content: 'novo ciclo, novas conquistas',
        x: 15, y: 24, w: 70, h: 5.5,
        zIndex: 2,
        style: { fontSize: 18, fontFamily: 'Dancing Script', color: '#be185d', textAlign: 'center' }
    },
    {
        id: 'pdiv-f-title',
        name: 'Título Ciclo / Mês',
        type: 'text',
        content: 'MÊS / PERÍODO',
        x: 12, y: 31, w: 76, h: 8,
        zIndex: 2,
        style: { fontSize: 22, fontWeight: 'bold', fontFamily: 'Playfair Display', color: '#4c0519', textAlign: 'center', letterSpacing: 3 }
    },
    {
        id: 'pdiv-f-fill-box',
        name: 'Campo Mês Livre',
        type: 'box',
        x: 20, y: 42, w: 60, h: 12,
        zIndex: 1,
        style: { backgroundColor: '#ffffff', borderColor: '#fbcfe8', borderWidth: 1, borderRadius: 12 }
    },
    {
        id: 'pdiv-f-fill-line',
        name: 'Linha Mês Livre',
        type: 'text',
        content: '_________________________',
        x: 22, y: 45.5, w: 56, h: 6,
        zIndex: 2,
        style: { fontSize: 12, fontFamily: 'Playfair Display', color: '#9d174d', textAlign: 'center' }
    },
    {
        id: 'pdiv-f-quote',
        name: 'Citação Inspiradora',
        type: 'quote',
        x: 15, y: 68, w: 70, h: 10,
        zIndex: 2,
        style: { fontSize: 13, fontFamily: 'Dancing Script', color: '#881337', textAlign: 'center' }
    }
];

export const PERMANENT_DIVIDER_VERSO_ELEMENTS: LayoutElement[] = STANDARD_DIVIDER_VERSO_ELEMENTS
    .filter(el => el.type !== 'month_name')
    .map(el => el.id === 'div-v-sub-script'
        ? { ...el, content: 'intenções, metas & rituais deste ciclo' }
        : el
    );

export const PERMANENT_MONTHLY_PLANNER_PAGE: IntroPage = {
    id: 'monthly-tpl-permanente',
    name: 'Visão Mensal Permanente (Não Datada)',
    elements: [
        { id: 'pmp-sub', type: 'text', name: 'Subtítulo Caligráfico', content: 'Visão geral & compromissos', x: 15, y: 2.5, w: 70, h: 3.5, zIndex: 2, style: { fontSize: 13, fontFamily: 'Dancing Script', color: '#b56576', textAlign: 'center' } },
        { id: 'pmp-title', type: 'text', name: 'Título Planejamento Mensal', content: 'PLANEJAMENTO MENSAL', x: 8, y: 5.8, w: 84, h: 4.5, zIndex: 2, style: { fontSize: 15, fontWeight: 'bold', fontFamily: 'Playfair Display', color: '#6d4352', textAlign: 'center', letterSpacing: 2 } },
        { id: 'pmp-fill', type: 'text', name: 'Campo Mês e Ano Livre', content: 'MÊS: ___________________________     ANO: ___________', x: 8, y: 11.2, w: 84, h: 3.5, zIndex: 2, style: { fontSize: 8, fontWeight: 'bold', fontFamily: 'Montserrat', color: '#8c4f60', textAlign: 'center', letterSpacing: 0.6 } },
        {
            id: 'pmp-grid',
            type: 'table',
            name: 'Grade Mensal Livre (7 Colunas)',
            x: 6, y: 16, w: 88, h: 61,
            zIndex: 1,
            style: {
                table: {
                    rows: 6,
                    cols: 7,
                    headerRow: true,
                    headerBackgroundColor: '#fdf2f4',
                    headerTextColor: '#9d4e64',
                    borderColor: '#f3c6d1',
                    borderWidth: 0.7,
                    columnWidths: [14.28, 14.28, 14.28, 14.28, 14.28, 14.28, 14.32],
                    rowHeights: [8, 18.4, 18.4, 18.4, 18.4, 18.4],
                    textStyle: { fontSize: 7, fontFamily: 'Montserrat', color: '#6d4352', textAlign: 'center', verticalAlign: 'middle' },
                    cellContent: {
                        '0-0': 'SEG',
                        '0-1': 'TER',
                        '0-2': 'QUA',
                        '0-3': 'QUI',
                        '0-4': 'SEX',
                        '0-5': 'SÁB',
                        '0-6': 'DOM'
                    }
                }
            }
        },
        { id: 'pmp-nbx', type: 'box', name: 'Card Notas do Mês', x: 6, y: 79.5, w: 88, h: 15, zIndex: 0, style: { borderWidth: 1, borderColor: '#c3d9cc', borderRadius: 10, backgroundColor: '#f2f7f4' } },
        { id: 'pmp-ntt', type: 'text', name: 'Título Notas do Mês', content: 'PRIORIDADES & NOTAS DO MÊS', x: 9, y: 81, w: 60, h: 3, zIndex: 1, style: { fontSize: 8, fontWeight: 'bold', color: '#4a705a', fontFamily: 'Playfair Display', letterSpacing: 1 } },
        { id: 'pmp-nls', type: 'lines', name: 'Linhas Notas do Mês', x: 9, y: 85, w: 82, h: 8, zIndex: 1, style: { color: '#b7d1c2', lineSpacing: 20, borderWidth: 0.5 } }
    ]
};

export const PERMANENT_MONTHLY_INTRO_PAGES: IntroPage[] = [
    PERMANENT_MONTHLY_PLANNER_PAGE,
    {
        id: 'monthly-tpl-financeiro-perm',
        name: 'Financeiro do Mês (Pastel)',
        elements: INTRO_TEMPLATES.find(t => t.id === 'tpl-financeiro')!.elements
    }
];

const cloneElementWithNewId = (el: LayoutElement, baseYear: number): LayoutElement => {
    const cloned: LayoutElement = JSON.parse(JSON.stringify(el));
    cloned.id = Math.random().toString(36).substring(2, 11);
    const offset = cloned.style?.yearOffset || 0;
    const targetYear = baseYear + offset;

    if (cloned.type === 'holiday_list') {
        cloned.content = generateHolidayListFullText(targetYear, {
            format: 'full_written',
            includeOptional: true,
            includeEaster: true
        });
    } else if (cloned.type === 'text' && typeof cloned.content === 'string' && /CALENDÁRIO\s*\d{4}/i.test(cloned.content)) {
        cloned.content = `CALENDÁRIO ${targetYear}`;
    }
    return cloned;
};

/**
 * Constrói a configuração completa da Agenda Padrão (Edição Pastel Artística) ou Permanente (Não Datada).
 */
export interface PastelModelOptions {
    isPermanent?: boolean;
    pageCount?: number;
    projectType?: 'agenda' | 'planner';
    layoutType?: '1_per_page' | '2_per_page' | '1_per_page_weekend_shared' | 'weekly_vertical' | 'weekly_horizontal' | 'weekly_one_page_vertical' | 'weekly_one_page_horizontal';
    pageSize?: 'A5' | 'A4' | 'Letter' | 'Custom';
    dailyElements?: LayoutElement[];
    topElements?: LayoutElement[];
    bottomElements?: LayoutElement[];
    weeklyLeftElements?: LayoutElement[];
    weeklyRightElements?: LayoutElement[];
    extraIntroTemplateIds?: string[];
}

export const buildPastelModelConfig = (
    options: PastelModelOptions = {},
    year: number = new Date().getFullYear() + 1
): Partial<AgendaConfig> => {
    const {
        isPermanent = false,
        pageCount,
        projectType = 'agenda',
        layoutType = '1_per_page',
        pageSize = 'A5',
        dailyElements = isPermanent ? DAILY_PERMANENT : STANDARD_DAILY_MIOLO_ELEMENTS,
        topElements = isPermanent ? PERMANENT_2DPP_TOP : STANDARD_HALF_PAGE_TOP_ELEMENTS,
        bottomElements = isPermanent ? PERMANENT_2DPP_BOTTOM : STANDARD_HALF_PAGE_BOTTOM_ELEMENTS,
        weeklyLeftElements,
        weeklyRightElements,
        extraIntroTemplateIds = []
    } = options;

    const baseIntroIds = isPermanent ? PERMANENT_INTRO_TEMPLATE_IDS : STANDARD_INTRO_TEMPLATE_IDS;
    const allIntroIds = Array.from(new Set([...baseIntroIds, ...extraIntroTemplateIds]));

    const introPages: IntroPage[] = allIntroIds
        .map(id => INTRO_TEMPLATES.find(t => t.id === id))
        .filter((t): t is IntroPage => Boolean(t))
        .map(tpl => ({
            id: `intro-${tpl.id}-${Math.random().toString(36).substring(2, 7)}`,
            name: isPermanent && tpl.id === 'tpl-metas' ? 'Minhas Metas & Sonhos (Pastel)' : tpl.name,
            elements: tpl.elements.map(el => {
                const cloned = cloneElementWithNewId(el, year);
                if (isPermanent && cloned.type === 'text' && cloned.content === 'MINHAS METAS PARA O ANO') {
                    cloned.content = 'MINHAS METAS & SONHOS';
                }
                return cloned;
            })
        }));

    const sourceMonthlyIntros = isPermanent ? PERMANENT_MONTHLY_INTRO_PAGES : STANDARD_MONTHLY_INTRO_PAGES;
    const monthlyIntroPages: IntroPage[] = sourceMonthlyIntros.map(tpl => ({
        id: `m-intro-${tpl.id}-${Math.random().toString(36).substring(2, 7)}`,
        name: tpl.name,
        elements: tpl.elements.map(el => cloneElementWithNewId(el, year))
    }));

    const dividerFrontSource = isPermanent ? PERMANENT_DIVIDER_FRONT_ELEMENTS : STANDARD_DIVIDER_FRONT_ELEMENTS;
    const dividerVersoSource = isPermanent ? PERMANENT_DIVIDER_VERSO_ELEMENTS : STANDARD_DIVIDER_VERSO_ELEMENTS;

    const monthlyDividerStyle: MonthlyDividerStyle = {
        layout: 'custom',
        titleFont: 'Playfair Display',
        titleColor: '#4c0519',
        accentColor: '#be185d',
        includeMiniCalendar: !isPermanent,
        showYear: !isPermanent,
        borderStyle: 'none',
        elements: dividerFrontSource.map(el => cloneElementWithNewId(el, year)),
        versoElements: dividerVersoSource.map(el => cloneElementWithNewId(el, year))
    };

    const effectiveDailySource = (isPermanent && layoutType === '2_per_page') ? topElements : dailyElements;
    const clonedDaily = effectiveDailySource.map(el => cloneElementWithNewId(el, year));
    const clonedSaturday = effectiveDailySource.map(el => cloneElementWithNewId(el, year));
    const clonedSunday = effectiveDailySource.map(el => cloneElementWithNewId(el, year));
    const clonedTop = topElements.map(el => cloneElementWithNewId(el, year));
    const clonedBottom = bottomElements.map(el => cloneElementWithNewId(el, year));

    if (isPermanent) {
        return {
            projectType,
            isPermanent: true,
            pageCount: pageCount || (layoutType === '2_per_page' ? 366 : 365),
            layoutType,
            pageSize,
            includeHolidays: false,
            includeMoonPhases: false,
            includeQuotes: true,
            includeVerses: true,
            includeMonthlyDividers: false,
            includeMonthlyIntroPages: false,
            startMonthOnRightPage: false,
            introPages,
            monthlyIntroPages,
            monthlyDividerStyle,
            elements: clonedDaily,
            elementsSaturday: clonedSaturday,
            elementsSunday: clonedSunday,
            elementsTop: clonedTop,
            elementsBottom: clonedBottom,
            elementsWeeklyLeft: undefined,
            elementsWeeklyRight: undefined
        };
    }

    return {
        projectType,
        isPermanent: false,
        pageCount: undefined,
        layoutType,
        pageSize,
        includeHolidays: true,
        includeQuotes: true,
        includeVerses: true,
        includeMonthlyDividers: true,
        includeMonthlyIntroPages: true,
        startMonthOnRightPage: true,
        introPages,
        monthlyIntroPages,
        monthlyDividerStyle,
        elements: clonedDaily,
        elementsSaturday: clonedSaturday,
        elementsSunday: clonedSunday,
        elementsTop: clonedTop,
        elementsBottom: clonedBottom,
        elementsWeeklyLeft: weeklyLeftElements ? weeklyLeftElements.map(el => cloneElementWithNewId(el, year)) : undefined,
        elementsWeeklyRight: weeklyRightElements ? weeklyRightElements.map(el => cloneElementWithNewId(el, year)) : undefined
    };
};

export const buildStandardAgendaConfig = (year: number = new Date().getFullYear() + 1): Partial<AgendaConfig> => {
    return buildPastelModelConfig({}, year);
};

export const buildPermanentAgendaConfig = (
    layoutType: '1_per_page' | '2_per_page' = '1_per_page',
    pageCount?: number
): Partial<AgendaConfig> => {
    return buildPastelModelConfig({
        isPermanent: true,
        projectType: 'agenda',
        layoutType,
        pageCount,
        dailyElements: DAILY_PERMANENT,
        topElements: PERMANENT_2DPP_TOP,
        bottomElements: PERMANENT_2DPP_BOTTOM
    });
};
