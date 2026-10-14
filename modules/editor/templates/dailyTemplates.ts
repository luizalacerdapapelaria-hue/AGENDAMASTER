import { LayoutElement } from '../../../types';

interface HeaderPalette {
    wcTop: string;
    wcBottom: string;
    badgeBg: string;
    badgeBorder: string;
    numColor: string;
    dayColor: string;
    monthColor: string;
    calBg: string;
    calBorder: string;
    calHeaderBg: string;
    botanicalShape: string;
    botanicalFill: string;
    botanicalBorder: string;
}

const buildPastelDailyHeader = (prefix: string, p: HeaderPalette): LayoutElement[] => [
    {
        id: `${prefix}-wc-top`,
        name: 'Aquarela Topo',
        type: 'circle',
        x: -4, y: -3, w: 32, h: 19,
        zIndex: 0,
        style: { backgroundColor: p.wcTop, borderWidth: 0, opacity: 0.75 }
    },
    {
        id: `${prefix}-wc-bot`,
        name: 'Aquarela Base',
        type: 'circle',
        x: 72, y: 83, w: 32, h: 19,
        zIndex: 0,
        style: { backgroundColor: p.wcBottom, borderWidth: 0, opacity: 0.65 }
    },
    {
        id: `${prefix}-botanical`,
        name: 'Ilustração Botânica Cabeçalho',
        type: 'vector_shape',
        x: 51, y: 3.5, w: 11.5, h: 10.5,
        zIndex: 1,
        style: {
            shapeType: p.botanicalShape,
            fillColor: p.botanicalFill,
            borderColor: p.botanicalBorder,
            borderWidth: 0.5,
            opacity: 0.16
        }
    },
    {
        id: `${prefix}-num-box`,
        name: 'Badge Pastel do Dia',
        type: 'box',
        x: 6, y: 3.8, w: 15, h: 10.2,
        zIndex: 1,
        style: {
            backgroundColor: p.badgeBg,
            borderColor: p.badgeBorder,
            borderWidth: 1,
            borderRadius: 12
        }
    },
    {
        id: `${prefix}-num`,
        name: 'Número do Dia',
        type: 'day_number',
        x: 6, y: 4, w: 15, h: 9.8,
        zIndex: 2,
        style: {
            fontSize: 22,
            fontWeight: 'bold',
            fontFamily: 'Playfair Display',
            color: p.numColor,
            textAlign: 'center',
            verticalAlign: 'middle'
        }
    },
    {
        id: `${prefix}-name`,
        name: 'Dia da Semana',
        type: 'day_name',
        x: 23, y: 4.2, w: 38, h: 4,
        zIndex: 2,
        style: {
            fontSize: 8.5,
            fontWeight: 'bold',
            fontFamily: 'Montserrat',
            color: p.dayColor,
            textAlign: 'left',
            textTransform: 'uppercase',
            letterSpacing: 0.8
        }
    },
    {
        id: `${prefix}-month`,
        name: 'Mês Caligráfico',
        type: 'month_name',
        x: 23, y: 8.2, w: 23, h: 4.5,
        zIndex: 2,
        style: {
            fontSize: 12,
            fontWeight: 'normal',
            fontFamily: 'Dancing Script',
            color: p.monthColor,
            textAlign: 'left',
            textTransform: 'capitalize'
        }
    },
    {
        id: `${prefix}-year`,
        name: 'Ano',
        type: 'year',
        x: 47, y: 8.8, w: 12, h: 3.5,
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
        id: `${prefix}-holiday`,
        name: 'Feriado do Dia',
        type: 'holiday',
        x: 6, y: 14.8, w: 56, h: 3,
        zIndex: 2,
        style: {
            fontSize: 6.8,
            fontWeight: 'bold',
            fontFamily: 'Montserrat',
            color: '#be123c',
            textAlign: 'left'
        }
    },
    {
        id: `${prefix}-minical-bg`,
        name: 'Card Mini Calendário',
        type: 'box',
        x: 63.5, y: 3.5, w: 30.5, h: 14.2,
        zIndex: 1,
        style: {
            backgroundColor: p.calBg,
            borderColor: p.calBorder,
            borderWidth: 1,
            borderRadius: 10
        }
    },
    {
        id: `${prefix}-minical`,
        name: 'Mini Calendário',
        type: 'mini_calendar',
        x: 64.5, y: 4, w: 28.5, h: 13.2,
        zIndex: 2,
        style: {
            useGlobalStyle: false,
            calendarOffset: 0,
            fullCalendar: {
                showYearInTitle: true,
                title: { fontSize: 6.2, fontWeight: 'bold', textAlign: 'center', color: p.numColor, fontFamily: 'Playfair Display', textTransform: 'uppercase', letterSpacing: 0.8 },
                weekDays: { fontSize: 4.8, fontWeight: 'bold', textAlign: 'center', color: p.monthColor, fontFamily: 'Montserrat' },
                days: { fontSize: 5.2, fontWeight: 'normal', textAlign: 'center', color: '#52525b', fontFamily: 'Montserrat' },
                grid: {
                    borderColor: p.calBorder,
                    borderWidth: 0.5,
                    borderStyle: 'solid',
                    cellBackgroundColor: 'transparent',
                    headerBackgroundColor: p.calHeaderBg,
                    borders: { top: false, bottom: false, left: false, right: false, insideHorizontal: false, insideVertical: false, headerSeparator: true }
                }
            }
        }
    }
];

const ROSE_PALETTE: HeaderPalette = {
    wcTop: '#fdf2f8',
    wcBottom: '#f0fdf4',
    badgeBg: '#fff1f2',
    badgeBorder: '#fbcfe8',
    numColor: '#881337',
    dayColor: '#9d174d',
    monthColor: '#be185d',
    calBg: '#fffbfc',
    calBorder: '#fce7f3',
    calHeaderBg: '#fdf2f8',
    botanicalShape: 'shape-72',
    botanicalFill: '#f43f5e',
    botanicalBorder: '#be185d'
};

const SAGE_PALETTE: HeaderPalette = {
    wcTop: '#ecfdf5',
    wcBottom: '#fff1f2',
    badgeBg: '#f0fdf4',
    badgeBorder: '#bbf7d0',
    numColor: '#14532d',
    dayColor: '#166534',
    monthColor: '#15803d',
    calBg: '#f8fafc',
    calBorder: '#bbf7d0',
    calHeaderBg: '#dcfce7',
    botanicalShape: 'shape-75',
    botanicalFill: '#10b981',
    botanicalBorder: '#047857'
};

const LAVENDER_PALETTE: HeaderPalette = {
    wcTop: '#faf5ff',
    wcBottom: '#fff1f2',
    badgeBg: '#f3e8ff',
    badgeBorder: '#e9d5ff',
    numColor: '#4c1d95',
    dayColor: '#6b21a8',
    monthColor: '#7e22ce',
    calBg: '#fdfaff',
    calBorder: '#e9d5ff',
    calHeaderBg: '#f3e8ff',
    botanicalShape: 'shape-73',
    botanicalFill: '#a855f7',
    botanicalBorder: '#6b21a8'
};

const PEACH_PALETTE: HeaderPalette = {
    wcTop: '#fffbeb',
    wcBottom: '#fdf2f8',
    badgeBg: '#fef3c7',
    badgeBorder: '#fde68a',
    numColor: '#78350f',
    dayColor: '#92400e',
    monthColor: '#b45309',
    calBg: '#fffdf7',
    calBorder: '#fde68a',
    calHeaderBg: '#fef3c7',
    botanicalShape: 'shape-72',
    botanicalFill: '#f59e0b',
    botanicalBorder: '#b45309'
};

// ============================================================================
// 1. AGENDA CLÁSSICA PASTEL (Prioridades + Horários + Gratidão)
// ============================================================================
export const DAILY_CLASSIC: LayoutElement[] = [
    ...buildPastelDailyHeader('dc', ROSE_PALETTE),
    {
        id: 'd-prio-box',
        name: 'Box Prioridades Pastel',
        type: 'box',
        x: 6, y: 19, w: 88, h: 14, zIndex: 1,
        style: { backgroundColor: '#fff1f2', borderColor: '#fecdd3', borderWidth: 1, borderRadius: 10 }
    },
    {
        id: 'd-1',
        name: 'Título Prioridades',
        type: 'text',
        content: '✦ PRIORIDADES DO DIA',
        x: 8.5, y: 20.2, w: 50, h: 3, zIndex: 2,
        style: { fontSize: 7, fontWeight: 'bold', fontFamily: 'Montserrat', color: '#9d174d', textAlign: 'left', letterSpacing: 0.8 }
    },
    {
        id: 'd-1-sub',
        name: 'Subtítulo Caligráfico',
        type: 'text',
        content: 'foco & intenção',
        x: 63, y: 19.8, w: 28, h: 3.5, zIndex: 2,
        style: { fontSize: 9.5, fontFamily: 'Dancing Script', color: '#db2777', textAlign: 'right' }
    },
    {
        id: 'd-2',
        name: 'Linhas Prioridades',
        type: 'lines',
        x: 8.5, y: 23.8, w: 83, h: 7.8, zIndex: 2,
        style: { lineSpacing: 13, color: '#fbcfe8', borderColor: '#fbcfe8', showCheckboxes: true, checkboxStyle: 'circle' }
    },
    {
        id: 'd-sched-box',
        name: 'Moldura de Horários',
        type: 'box',
        x: 6, y: 34.5, w: 88, h: 46, zIndex: 1,
        style: { backgroundColor: '#ffffff', borderColor: '#fce7f3', borderWidth: 1, borderRadius: 10 }
    },
    {
        id: 'd-3',
        name: 'Título Pauta',
        type: 'text',
        content: 'NOTAS & AGENDAMENTOS',
        x: 8.5, y: 35.8, w: 78, h: 3, zIndex: 2,
        style: { fontSize: 7, fontWeight: 'bold', fontFamily: 'Montserrat', color: '#881337', textAlign: 'left', letterSpacing: 0.8 }
    },
    {
        id: 'd-4',
        name: 'Linhas com Horários',
        type: 'lines',
        x: 8.5, y: 39.5, w: 83, h: 39.5, zIndex: 2,
        style: { lineSpacing: 14, color: '#be185d', borderColor: '#fce7f3', showTimes: true, startHour: 8, endHour: 20, timeInterval: 60, timeFontSize: 7, timeColor: '#be185d' }
    },
    {
        id: 'd-5',
        name: 'Card Gratidão Sálvia',
        type: 'box',
        x: 6, y: 82, w: 88, h: 11.5, zIndex: 1,
        style: { backgroundColor: '#f0fdf4', borderColor: '#bbf7d0', borderRadius: 10, borderWidth: 1 }
    },
    {
        id: 'd-6',
        name: 'Título Gratidão',
        type: 'text',
        content: '✿ GRATIDÃO & MEMÓRIAS DO DIA:',
        x: 8.5, y: 83.2, w: 55, h: 3, zIndex: 2,
        style: { fontSize: 6.8, fontWeight: 'bold', fontFamily: 'Montserrat', color: '#166534', letterSpacing: 0.8 }
    },
    {
        id: 'd-7',
        name: 'Linhas Gratidão',
        type: 'lines',
        x: 8.5, y: 86.5, w: 83, h: 5.5, zIndex: 2,
        style: { lineSpacing: 13, color: '#bbf7d0', borderColor: '#bbf7d0', borderStyle: 'dashed' }
    },
    {
        id: 'd-quote',
        name: 'Frase do Dia',
        type: 'quote',
        x: 6, y: 94.2, w: 88, h: 3.5, zIndex: 2,
        style: { fontSize: 8.5, fontFamily: 'Dancing Script', color: '#be185d', textAlign: 'center' }
    }
];

// ============================================================================
// 2. AGENDA DE AGENDAMENTO PROFISSIONAL / CLÍNICA & SALÃO (Tabela de Clientes)
// ============================================================================
export const DAILY_APPOINTMENT_PRO: LayoutElement[] = [
    ...buildPastelDailyHeader('ap-pro', ROSE_PALETTE),
    {
        id: 'ap-pro-title-bar',
        name: 'Faixa Título Agendamentos',
        type: 'box',
        x: 6, y: 18.8, w: 88, h: 4.2, zIndex: 1,
        style: { backgroundColor: '#fdf2f8', borderColor: '#fbcfe8', borderWidth: 0.8, borderRadius: 6 }
    },
    {
        id: 'ap-pro-title-txt',
        name: 'Título Grade de Atendimentos',
        type: 'text',
        content: '✦ AGENDAMENTOS DO DIA',
        x: 8, y: 19.6, w: 58, h: 2.8, zIndex: 2,
        style: { fontSize: 6.8, fontWeight: 'bold', fontFamily: 'Montserrat', color: '#881337', letterSpacing: 0.8 }
    },
    {
        id: 'ap-pro-sub-txt',
        name: 'Subtítulo Caligráfico Atendimentos',
        type: 'text',
        content: 'clientes & horários',
        x: 68, y: 19.1, w: 24, h: 3.2, zIndex: 2,
        style: { fontSize: 9, fontFamily: 'Dancing Script', color: '#be185d', textAlign: 'right' }
    },
    {
        id: 'ap-pro-table',
        name: 'Tabela de Agendamento de Clientes',
        type: 'table',
        x: 6, y: 23.5, w: 88, h: 54.5, zIndex: 2,
        style: {
            table: {
                rows: 15,
                cols: 4,
                headerRow: true,
                headerBackgroundColor: '#fce7f3',
                headerTextColor: '#881337',
                alternateRowColor: '#fffbfc',
                borderColor: '#fbcfe8',
                borderWidth: 0.7,
                columnWidths: [14, 40, 28, 18],
                textStyle: { fontSize: 6.8, fontFamily: 'Montserrat', color: '#3f3f46', verticalAlign: 'middle' },
                colStyles: {
                    0: { textAlign: 'center', fontWeight: 'bold', color: '#9d174d', backgroundColor: '#fff1f2' },
                    3: { textAlign: 'right', color: '#166534' }
                },
                cellContent: {
                    '0-0': 'HORA',
                    '0-1': 'CLIENTE / PACIENTE • CONTATO',
                    '0-2': 'SERVIÇO / PROCEDIMENTO',
                    '0-3': 'VALOR / PGTO',
                    '1-0': '07:00',
                    '2-0': '08:00',
                    '3-0': '09:00',
                    '4-0': '10:00',
                    '5-0': '11:00',
                    '6-0': '12:00',
                    '7-0': '13:00',
                    '8-0': '14:00',
                    '9-0': '15:00',
                    '10-0': '16:00',
                    '11-0': '17:00',
                    '12-0': '18:00',
                    '13-0': '19:00',
                    '14-0': '20:00'
                }
            }
        }
    },
    // Rodapé Esquerdo: Fechamento de Caixa do Dia (Verde Sálvia)
    {
        id: 'ap-pro-cash-box',
        name: 'Card Fechamento de Caixa',
        type: 'box',
        x: 6, y: 79.2, w: 54, h: 14.5, zIndex: 1,
        style: { backgroundColor: '#f0fdf4', borderColor: '#bbf7d0', borderWidth: 1, borderRadius: 10 }
    },
    {
        id: 'ap-pro-cash-title',
        name: 'Título Fechamento de Caixa',
        type: 'text',
        content: '✿ FECHAMENTO DE CAIXA DO DIA',
        x: 8, y: 80.2, w: 50, h: 2.8, zIndex: 2,
        style: { fontSize: 6.8, fontWeight: 'bold', fontFamily: 'Montserrat', color: '#166534', letterSpacing: 0.8 }
    },
    {
        id: 'ap-pro-cash-table',
        name: 'Tabela Resumo Caixa',
        type: 'table',
        x: 8, y: 83.2, w: 50, h: 9.2, zIndex: 2,
        style: {
            table: {
                rows: 2,
                cols: 2,
                headerRow: false,
                borderColor: '#bbf7d0',
                borderWidth: 0.6,
                columnWidths: [50, 50],
                textStyle: { fontSize: 6.5, fontWeight: 'bold', fontFamily: 'Montserrat', color: '#14532d', verticalAlign: 'middle' },
                cellContent: {
                    '0-0': 'PIX / Cartão: R$',
                    '0-1': 'Dinheiro: R$',
                    '1-0': 'Saídas: R$',
                    '1-1': 'TOTAL DIA: R$'
                }
            }
        }
    },
    // Rodapé Direito: Lista de Espera / Retornos (Lavanda)
    {
        id: 'ap-pro-wait-box',
        name: 'Card Lista de Espera & Lembretes',
        type: 'box',
        x: 62, y: 79.2, w: 32, h: 14.5, zIndex: 1,
        style: { backgroundColor: '#faf5ff', borderColor: '#e9d5ff', borderWidth: 1, borderRadius: 10 }
    },
    {
        id: 'ap-pro-wait-title',
        name: 'Título Encaixes & Retornos',
        type: 'text',
        content: '✦ ENCAIXES & LEMBRETES',
        x: 64, y: 80.2, w: 28, h: 2.8, zIndex: 2,
        style: { fontSize: 6.5, fontWeight: 'bold', fontFamily: 'Montserrat', color: '#6b21a8', letterSpacing: 0.6 }
    },
    {
        id: 'ap-pro-wait-lines',
        name: 'Linhas Encaixes',
        type: 'lines',
        x: 64, y: 83.5, w: 28, h: 8.8, zIndex: 2,
        style: { lineSpacing: 12, color: '#e9d5ff', borderColor: '#e9d5ff', showCheckboxes: true, checkboxStyle: 'circle' }
    },
    {
        id: 'ap-pro-quote',
        name: 'Frase Rodapé',
        type: 'quote',
        x: 6, y: 94.5, w: 88, h: 3.2, zIndex: 2,
        style: { fontSize: 8.5, fontFamily: 'Dancing Script', color: '#be185d', textAlign: 'center' }
    }
];

// ============================================================================
// 3. AGENDA DE HORÁRIOS 30 EM 30 MIN (2 Colunas Manhã & Tarde + Financeiro)
// ============================================================================
export const DAILY_APPOINTMENT_30MIN: LayoutElement[] = [
    ...buildPastelDailyHeader('ap-30', LAVENDER_PALETTE),
    // Coluna Esquerda: Manhã (07:00 às 13:00 - 30 em 30 min)
    {
        id: 'ap-30-col1-box',
        name: 'Card Horários Manhã',
        type: 'box',
        x: 6, y: 19, w: 43, h: 58.5, zIndex: 1,
        style: { backgroundColor: '#fffbfc', borderColor: '#fbcfe8', borderWidth: 1, borderRadius: 10 }
    },
    {
        id: 'ap-30-col1-title',
        name: 'Título Manhã (30 min)',
        type: 'text',
        content: '☀ MANHÃ (07h ÀS 13h)',
        x: 8, y: 20.2, w: 39, h: 2.8, zIndex: 2,
        style: { fontSize: 6.5, fontWeight: 'bold', fontFamily: 'Montserrat', color: '#9d174d', letterSpacing: 0.6 }
    },
    {
        id: 'ap-30-col1-lines',
        name: 'Horários 30 min Manhã',
        type: 'lines',
        x: 8, y: 23.5, w: 39, h: 52.5, zIndex: 2,
        style: {
            showTimes: true,
            startHour: 7,
            endHour: 13,
            timeInterval: 30,
            timeFontSize: 6.5,
            timeColor: '#9d174d',
            timeColumnWidth: 24,
            color: '#9d174d',
            borderColor: '#fce7f3',
            borderWidth: 0.5
        }
    },
    // Coluna Direita: Tarde & Noite (13:30 às 19:30 - 30 em 30 min)
    {
        id: 'ap-30-col2-box',
        name: 'Card Horários Tarde & Noite',
        type: 'box',
        x: 51, y: 19, w: 43, h: 58.5, zIndex: 1,
        style: { backgroundColor: '#fdfaff', borderColor: '#e9d5ff', borderWidth: 1, borderRadius: 10 }
    },
    {
        id: 'ap-30-col2-title',
        name: 'Título Tarde & Noite (30 min)',
        type: 'text',
        content: '⛅ TARDE & NOITE (14h ÀS 20h)',
        x: 53, y: 20.2, w: 39, h: 2.8, zIndex: 2,
        style: { fontSize: 6.5, fontWeight: 'bold', fontFamily: 'Montserrat', color: '#6b21a8', letterSpacing: 0.6 }
    },
    {
        id: 'ap-30-col2-lines',
        name: 'Horários 30 min Tarde',
        type: 'lines',
        x: 53, y: 23.5, w: 39, h: 52.5, zIndex: 2,
        style: {
            showTimes: true,
            startHour: 14,
            endHour: 20,
            timeInterval: 30,
            timeFontSize: 6.5,
            timeColor: '#6b21a8',
            timeColumnWidth: 24,
            color: '#6b21a8',
            borderColor: '#f3e8ff',
            borderWidth: 0.5
        }
    },
    // Rodapé Esquerdo: Confirmações WhatsApp & Tarefas (Creme Pastel)
    {
        id: 'ap-30-conf-box',
        name: 'Card Confirmações & Retornos',
        type: 'box',
        x: 6, y: 79, w: 43, h: 14.5, zIndex: 1,
        style: { backgroundColor: '#fffbeb', borderColor: '#fde68a', borderWidth: 1, borderRadius: 10 }
    },
    {
        id: 'ap-30-conf-title',
        name: 'Título Confirmações',
        type: 'text',
        content: '✦ CONFIRMAÇÕES & CONTATOS',
        x: 8, y: 80.2, w: 39, h: 2.8, zIndex: 2,
        style: { fontSize: 6.5, fontWeight: 'bold', fontFamily: 'Montserrat', color: '#92400e', letterSpacing: 0.6 }
    },
    {
        id: 'ap-30-conf-lines',
        name: 'Checklist Confirmações',
        type: 'lines',
        x: 8, y: 83.5, w: 39, h: 8.8, zIndex: 2,
        style: { lineSpacing: 12, color: '#fde68a', borderColor: '#fde68a', showCheckboxes: true, checkboxStyle: 'circle' }
    },
    // Rodapé Direito: Fechamento Rápido do Dia (Sálvia)
    {
        id: 'ap-30-fin-box',
        name: 'Card Resumo Financeiro',
        type: 'box',
        x: 51, y: 79, w: 43, h: 14.5, zIndex: 1,
        style: { backgroundColor: '#f0fdf4', borderColor: '#bbf7d0', borderWidth: 1, borderRadius: 10 }
    },
    {
        id: 'ap-30-fin-title',
        name: 'Título Resumo Financeiro',
        type: 'text',
        content: '✿ RESUMO FINANCEIRO DO DIA',
        x: 53, y: 80.2, w: 39, h: 2.8, zIndex: 2,
        style: { fontSize: 6.5, fontWeight: 'bold', fontFamily: 'Montserrat', color: '#166534', letterSpacing: 0.6 }
    },
    {
        id: 'ap-30-fin-table',
        name: 'Tabela Caixa 30min',
        type: 'table',
        x: 53, y: 83.5, w: 39, h: 8.8, zIndex: 2,
        style: {
            table: {
                rows: 3,
                cols: 2,
                headerRow: false,
                borderColor: '#bbf7d0',
                borderWidth: 0.6,
                columnWidths: [55, 45],
                textStyle: { fontSize: 6.3, fontWeight: 'bold', fontFamily: 'Montserrat', color: '#14532d', verticalAlign: 'middle' },
                cellContent: {
                    '0-0': 'Entradas (+):',
                    '0-1': 'R$ ',
                    '1-0': 'Saídas (-):',
                    '1-1': 'R$ ',
                    '2-0': 'SALDO LÍQUIDO:',
                    '2-1': 'R$ '
                }
            }
        }
    },
    {
        id: 'ap-30-quote',
        name: 'Frase do Dia',
        type: 'quote',
        x: 6, y: 94.5, w: 88, h: 3.2, zIndex: 2,
        style: { fontSize: 8.5, fontFamily: 'Dancing Script', color: '#7e22ce', textAlign: 'center' }
    }
];

// ============================================================================
// 4. PLANNER DIÁRIO COMUM / PRODUTIVIDADE & ESTILO DE VIDA (Turnos + To-Do)
// ============================================================================
export const DAILY_PLANNER_COMMON: LayoutElement[] = [
    ...buildPastelDailyHeader('pl-com', PEACH_PALETTE),
    // Topo: Top 3 Prioridades (Lavanda) + Intenção do Dia (Rosé)
    {
        id: 'plc-prio-box',
        name: 'Card Top 3 Prioridades',
        type: 'box',
        x: 6, y: 19, w: 54, h: 15, zIndex: 1,
        style: { backgroundColor: '#faf5ff', borderColor: '#e9d5ff', borderWidth: 1, borderRadius: 10 }
    },
    {
        id: 'plc-prio-title',
        name: 'Título Top 3 Prioridades',
        type: 'text',
        content: '✦ TOP 3 PRIORIDADES DE HOJE',
        x: 8, y: 20.2, w: 50, h: 2.8, zIndex: 2,
        style: { fontSize: 7.2, fontWeight: 'bold', fontFamily: 'Montserrat', color: '#6b21a8', letterSpacing: 1 }
    },
    {
        id: 'plc-prio-lines',
        name: 'Linhas Top 3',
        type: 'lines',
        x: 8, y: 23.5, w: 50, h: 9.2, zIndex: 2,
        style: { rowCount: 3, color: '#d8b4fe', borderColor: '#e9d5ff', showCheckboxes: true, checkboxStyle: 'circle' }
    },
    {
        id: 'plc-focus-box',
        name: 'Card Afirmação & Foco',
        type: 'box',
        x: 62, y: 19, w: 32, h: 15, zIndex: 1,
        style: { backgroundColor: '#fff1f2', borderColor: '#fecdd3', borderWidth: 1, borderRadius: 10 }
    },
    {
        id: 'plc-focus-title',
        name: 'Título Intenção do Dia',
        type: 'text',
        content: '✿ INTENÇÃO DO DIA',
        x: 64, y: 20.2, w: 28, h: 2.8, zIndex: 2,
        style: { fontSize: 7, fontWeight: 'bold', fontFamily: 'Montserrat', color: '#9d174d', letterSpacing: 1 }
    },
    {
        id: 'plc-focus-sub',
        name: 'Subtítulo Caligráfico Intenção',
        type: 'text',
        content: 'energia & presença',
        x: 64, y: 23, w: 28, h: 3, zIndex: 2,
        style: { fontSize: 9.5, fontFamily: 'Dancing Script', color: '#db2777', textAlign: 'left' }
    },
    {
        id: 'plc-focus-lines',
        name: 'Linhas Intenção',
        type: 'lines',
        x: 64, y: 26.5, w: 28, h: 6, zIndex: 2,
        style: { rowCount: 2, color: '#fecdd3', borderColor: '#fecdd3', borderStyle: 'dashed' }
    },

    // Meio Esquerdo: Turnos do Dia (Manhã, Tarde, Noite)
    {
        id: 'plc-morn-box',
        name: 'Card Manhã Pastel',
        type: 'box',
        x: 6, y: 35.5, w: 43, h: 13.2, zIndex: 1,
        style: { backgroundColor: '#fffbeb', borderColor: '#fde68a', borderWidth: 1, borderRadius: 10 }
    },
    {
        id: 'plc-morn-title',
        name: 'Título Manhã',
        type: 'text',
        content: '☀ MANHÃ',
        x: 8, y: 36.5, w: 39, h: 2.5, zIndex: 2,
        style: { fontSize: 7, fontWeight: 'bold', fontFamily: 'Montserrat', color: '#92400e', letterSpacing: 1 }
    },
    {
        id: 'plc-morn-lines',
        name: 'Linhas Manhã',
        type: 'lines',
        x: 8, y: 39.2, w: 39, h: 8.2, zIndex: 2,
        style: { rowCount: 3, color: '#fde68a', borderColor: '#fde68a' }
    },
    {
        id: 'plc-aft-box',
        name: 'Card Tarde Pastel',
        type: 'box',
        x: 6, y: 50, w: 43, h: 13.2, zIndex: 1,
        style: { backgroundColor: '#fff1f2', borderColor: '#fecdd3', borderWidth: 1, borderRadius: 10 }
    },
    {
        id: 'plc-aft-title',
        name: 'Título Tarde',
        type: 'text',
        content: '⛅ TARDE',
        x: 8, y: 51, w: 39, h: 2.5, zIndex: 2,
        style: { fontSize: 7, fontWeight: 'bold', fontFamily: 'Montserrat', color: '#9d174d', letterSpacing: 1 }
    },
    {
        id: 'plc-aft-lines',
        name: 'Linhas Tarde',
        type: 'lines',
        x: 8, y: 53.7, w: 39, h: 8.2, zIndex: 2,
        style: { rowCount: 3, color: '#fecdd3', borderColor: '#fecdd3' }
    },
    {
        id: 'plc-nig-box',
        name: 'Card Noite Pastel',
        type: 'box',
        x: 6, y: 64.5, w: 43, h: 13.2, zIndex: 1,
        style: { backgroundColor: '#faf5ff', borderColor: '#e9d5ff', borderWidth: 1, borderRadius: 10 }
    },
    {
        id: 'plc-nig-title',
        name: 'Título Noite',
        type: 'text',
        content: '🌙 NOITE',
        x: 8, y: 65.5, w: 39, h: 2.5, zIndex: 2,
        style: { fontSize: 7, fontWeight: 'bold', fontFamily: 'Montserrat', color: '#6b21a8', letterSpacing: 1 }
    },
    {
        id: 'plc-nig-lines',
        name: 'Linhas Noite',
        type: 'lines',
        x: 8, y: 68.2, w: 39, h: 8.2, zIndex: 2,
        style: { rowCount: 3, color: '#e9d5ff', borderColor: '#e9d5ff' }
    },

    // Meio Direito: Checklist de Tarefas (To-Do List)
    {
        id: 'plc-todo-box',
        name: 'Card Checklist To-Do',
        type: 'box',
        x: 51, y: 35.5, w: 43, h: 42.2, zIndex: 1,
        style: { backgroundColor: '#ffffff', borderColor: '#fbcfe8', borderWidth: 1, borderRadius: 10 }
    },
    {
        id: 'plc-todo-title',
        name: 'Título Checklist de Tarefas',
        type: 'text',
        content: '✦ CHECKLIST DE TAREFAS (TO-DO)',
        x: 53, y: 36.8, w: 39, h: 2.8, zIndex: 2,
        style: { fontSize: 7, fontWeight: 'bold', fontFamily: 'Montserrat', color: '#881337', letterSpacing: 1 }
    },
    {
        id: 'plc-todo-lines',
        name: 'Linhas Checklist To-Do',
        type: 'lines',
        x: 53, y: 40.5, w: 39, h: 35.5, zIndex: 2,
        style: { rowCount: 11, color: '#f9a8d4', borderColor: '#fce7f3', showCheckboxes: true, checkboxStyle: 'circle' }
    },

    // Rodapé Esquerdo: Cardápio & Gratidão (Sálvia)
    {
        id: 'plc-meals-box',
        name: 'Card Refeições & Gratidão',
        type: 'box',
        x: 6, y: 79.2, w: 54, h: 14.5, zIndex: 1,
        style: { backgroundColor: '#f0fdf4', borderColor: '#bbf7d0', borderWidth: 1, borderRadius: 10 }
    },
    {
        id: 'plc-meals-title',
        name: 'Título Refeições & Gratidão',
        type: 'text',
        content: '✿ REFEIÇÕES DO DIA & GRATIDÃO',
        x: 8, y: 80.2, w: 50, h: 2.8, zIndex: 2,
        style: { fontSize: 7, fontWeight: 'bold', fontFamily: 'Montserrat', color: '#166534', letterSpacing: 1 }
    },
    {
        id: 'plc-meals-table',
        name: 'Tabela Refeições Rápidas',
        type: 'table',
        x: 8, y: 83.2, w: 50, h: 9.2, zIndex: 2,
        style: {
            table: {
                rows: 3,
                cols: 2,
                headerRow: false,
                borderColor: '#bbf7d0',
                borderWidth: 0.5,
                columnWidths: [28, 72],
                textStyle: { fontSize: 6.2, fontFamily: 'Montserrat', color: '#14532d', verticalAlign: 'middle' },
                colStyles: { 0: { fontWeight: 'bold', color: '#166534' } },
                cellContent: {
                    '0-0': 'Café / Manhã:',
                    '1-0': 'Almoço / Tarde:',
                    '2-0': 'Jantar / Gratidão:'
                }
            }
        }
    },

    // Rodapé Direito: Hidratação & Humor
    {
        id: 'plc-care-box',
        name: 'Card Autocuidado',
        type: 'box',
        x: 62, y: 79.2, w: 32, h: 14.5, zIndex: 1,
        style: { backgroundColor: '#fff1f2', borderColor: '#fecdd3', borderWidth: 1, borderRadius: 10 }
    },
    {
        id: 'plc-water',
        name: 'Rastreador de Água',
        type: 'footer_tracker',
        x: 63.5, y: 80.2, w: 29, h: 6, zIndex: 2,
        style: { variant: 'water', title: 'HIDRATAÇÃO', color: '#9d174d' }
    },
    {
        id: 'plc-mood',
        name: 'Rastreador de Humor',
        type: 'footer_tracker',
        x: 63.5, y: 86.8, w: 29, h: 6, zIndex: 2,
        style: { variant: 'mood', title: 'MEU HUMOR', color: '#9d174d' }
    },
    {
        id: 'plc-quote',
        name: 'Frase do Dia',
        type: 'quote',
        x: 6, y: 94.5, w: 88, h: 3.2, zIndex: 2,
        style: { fontSize: 9, fontFamily: 'Dancing Script', color: '#b45309', textAlign: 'center' }
    }
];

// ============================================================================
// 5. PLANNER DIÁRIO TIME BLOCKING & BRAIN DUMP (Horários + Tarefas + Pontilhado)
// ============================================================================
export const DAILY_PLANNER_TIMEBLOCK: LayoutElement[] = [
    ...buildPastelDailyHeader('pl-tb', ROSE_PALETTE),
    // Coluna Esquerda: Time Blocking (07:00 às 20:00)
    {
        id: 'tb-left-box',
        name: 'Card Time Blocking',
        type: 'box',
        x: 6, y: 19, w: 43, h: 74.5, zIndex: 1,
        style: { backgroundColor: '#ffffff', borderColor: '#fbcfe8', borderWidth: 1, borderRadius: 10 }
    },
    {
        id: 'tb-left-title',
        name: 'Título Time Blocking',
        type: 'text',
        content: '✦ TIME BLOCKING (HORÁRIOS)',
        x: 8, y: 20.2, w: 39, h: 3, zIndex: 2,
        style: { fontSize: 7, fontWeight: 'bold', fontFamily: 'Montserrat', color: '#881337', letterSpacing: 1 }
    },
    {
        id: 'tb-left-lines',
        name: 'Horários Time Blocking',
        type: 'lines',
        x: 8, y: 24, w: 39, h: 67.5, zIndex: 2,
        style: {
            showTimes: true,
            startHour: 7,
            endHour: 20,
            timeInterval: 60,
            timeFontSize: 6.8,
            timeColor: '#be185d',
            timeColumnWidth: 24,
            color: '#be185d',
            borderColor: '#fce7f3',
            borderWidth: 0.5
        }
    },
    // Coluna Direita Topo: Top Prioridades (Lavanda)
    {
        id: 'tb-prio-box',
        name: 'Card Prioridades Timeblock',
        type: 'box',
        x: 51, y: 19, w: 43, h: 17, zIndex: 1,
        style: { backgroundColor: '#faf5ff', borderColor: '#e9d5ff', borderWidth: 1, borderRadius: 10 }
    },
    {
        id: 'tb-prio-title',
        name: 'Título Prioridades',
        type: 'text',
        content: '✦ FOCO ESSENCIAL DO DIA',
        x: 53, y: 20.2, w: 39, h: 2.8, zIndex: 2,
        style: { fontSize: 7, fontWeight: 'bold', fontFamily: 'Montserrat', color: '#6b21a8', letterSpacing: 1 }
    },
    {
        id: 'tb-prio-lines',
        name: 'Linhas Foco Essencial',
        type: 'lines',
        x: 53, y: 23.8, w: 39, h: 10.5, zIndex: 2,
        style: { rowCount: 3, color: '#d8b4fe', borderColor: '#e9d5ff', showCheckboxes: true, checkboxStyle: 'circle' }
    },
    // Coluna Direita Meio: Checklist de Tarefas (Sálvia)
    {
        id: 'tb-todo-box',
        name: 'Card Tarefas Sálvia',
        type: 'box',
        x: 51, y: 37.5, w: 43, h: 25, zIndex: 1,
        style: { backgroundColor: '#f0fdf4', borderColor: '#bbf7d0', borderWidth: 1, borderRadius: 10 }
    },
    {
        id: 'tb-todo-title',
        name: 'Título Tarefas & Pendências',
        type: 'text',
        content: '✿ TAREFAS & PENDÊNCIAS',
        x: 53, y: 38.8, w: 39, h: 2.8, zIndex: 2,
        style: { fontSize: 7, fontWeight: 'bold', fontFamily: 'Montserrat', color: '#166534', letterSpacing: 1 }
    },
    {
        id: 'tb-todo-lines',
        name: 'Checklist Pendências',
        type: 'lines',
        x: 53, y: 42.2, w: 39, h: 18.8, zIndex: 2,
        style: { rowCount: 6, color: '#86efac', borderColor: '#bbf7d0', showCheckboxes: true, checkboxStyle: 'circle' }
    },
    // Coluna Direita Base: Brain Dump Pontilhado (Rosé)
    {
        id: 'tb-dump-box',
        name: 'Card Brain Dump Pontilhado',
        type: 'box',
        x: 51, y: 64, w: 43, h: 29.5, zIndex: 1,
        style: { backgroundColor: '#fff1f2', borderColor: '#fecdd3', borderWidth: 1, borderRadius: 10 }
    },
    {
        id: 'tb-dump-title',
        name: 'Título Brain Dump',
        type: 'text',
        content: '✦ BRAIN DUMP & NOTAS LIVRES',
        x: 53, y: 65.2, w: 39, h: 2.8, zIndex: 2,
        style: { fontSize: 7, fontWeight: 'bold', fontFamily: 'Montserrat', color: '#9d174d', letterSpacing: 1 }
    },
    {
        id: 'tb-dump-grid',
        name: 'Malha Pontilhada',
        type: 'note_grid',
        x: 53, y: 68.8, w: 39, h: 23, zIndex: 2,
        style: { variant: 'dots', gridSize: 12, color: '#f43f5e', borderWidth: 0.8, opacity: 0.45 }
    },
    {
        id: 'tb-quote',
        name: 'Frase do Dia',
        type: 'quote',
        x: 6, y: 94.5, w: 88, h: 3.2, zIndex: 2,
        style: { fontSize: 9, fontFamily: 'Dancing Script', color: '#be185d', textAlign: 'center' }
    }
];

// ============================================================================
// 6. AGENDA & PLANNER FINANCEIRO DIÁRIO (Fluxo de Caixa, Entradas, Saídas)
// ============================================================================
export const DAILY_FINANCIAL: LayoutElement[] = [
    ...buildPastelDailyHeader('df', SAGE_PALETTE),
    // Box Topo: Vencimentos, Boletos & Contas a Pagar/Receber Hoje (Lavanda Pastel)
    {
        id: 'df-bills-box',
        name: 'Card Vencimentos & Boletos Hoje',
        type: 'box',
        x: 6, y: 19, w: 88, h: 13.5, zIndex: 1,
        style: { backgroundColor: '#faf5ff', borderColor: '#e9d5ff', borderWidth: 1, borderRadius: 10 }
    },
    {
        id: 'df-bills-title',
        name: 'Título Vencimentos do Dia',
        type: 'text',
        content: '✦ CONTAS & VENCIMENTOS DO DIA',
        x: 8.5, y: 20.2, w: 56, h: 2.8, zIndex: 2,
        style: { fontSize: 6.8, fontWeight: 'bold', fontFamily: 'Montserrat', color: '#6b21a8', letterSpacing: 0.8 }
    },
    {
        id: 'df-bills-sub',
        name: 'Subtítulo Caligráfico Finanças',
        type: 'text',
        content: 'equilíbrio & prosperidade',
        x: 66, y: 19.6, w: 26, h: 3.5, zIndex: 2,
        style: { fontSize: 9.5, fontFamily: 'Dancing Script', color: '#059669', textAlign: 'right' }
    },
    {
        id: 'df-bills-lines',
        name: 'Checklist Contas do Dia',
        type: 'lines',
        x: 8.5, y: 23.5, w: 83, h: 7.8, zIndex: 2,
        style: { rowCount: 3, color: '#d8b4fe', borderColor: '#e9d5ff', showCheckboxes: true, checkboxStyle: 'circle' }
    },

    // Tabela Central de Movimentações Financeiras do Dia
    {
        id: 'df-2',
        name: 'Tabela de Movimentação Diária',
        type: 'table',
        x: 6, y: 34, w: 88, h: 43.5, zIndex: 2,
        style: {
            table: {
                rows: 11,
                cols: 4,
                headerRow: true,
                headerBackgroundColor: '#d1fae5',
                headerTextColor: '#065f46',
                alternateRowColor: '#f0fdf4',
                borderColor: '#a7f3d0',
                borderWidth: 0.7,
                columnWidths: [42, 20, 18, 20],
                textStyle: { fontSize: 7, fontFamily: 'Montserrat', color: '#374151', verticalAlign: 'middle' },
                colStyles: {
                    2: { textAlign: 'center' },
                    3: { textAlign: 'right', fontWeight: 'bold' }
                },
                cellContent: {
                    '0-0': 'DESCRIÇÃO DO LANÇAMENTO',
                    '0-1': 'CATEGORIA',
                    '0-2': 'ENTRADA / SAÍDA',
                    '0-3': 'VALOR (R$)'
                }
            }
        }
    },

    // Rodapé Triplo: Total Entradas (+) | Total Saídas (-) | Saldo Final (=)
    {
        id: 'df-in-box',
        name: 'Card Entradas do Dia',
        type: 'box',
        x: 6, y: 79, w: 28, h: 14, zIndex: 1,
        style: { backgroundColor: '#ecfdf5', borderColor: '#a7f3d0', borderWidth: 1, borderRadius: 10 }
    },
    {
        id: 'df-in-title',
        name: 'Label Entradas',
        type: 'text',
        content: '✿ ENTRADAS (+)',
        x: 7.5, y: 80.2, w: 25, h: 2.8, zIndex: 2,
        style: { fontSize: 6.5, fontWeight: 'bold', fontFamily: 'Montserrat', color: '#065f46', letterSpacing: 0.6 }
    },
    {
        id: 'df-in-val',
        name: 'Valor Entradas',
        type: 'text',
        content: 'R$ ______________',
        x: 7.5, y: 86, w: 25, h: 4, zIndex: 2,
        style: { fontSize: 8, fontWeight: 'bold', fontFamily: 'Montserrat', color: '#047857' }
    },

    {
        id: 'df-out-box',
        name: 'Card Saídas do Dia',
        type: 'box',
        x: 36, y: 79, w: 28, h: 14, zIndex: 1,
        style: { backgroundColor: '#fff1f2', borderColor: '#fecdd3', borderWidth: 1, borderRadius: 10 }
    },
    {
        id: 'df-out-title',
        name: 'Label Saídas',
        type: 'text',
        content: '✦ SAÍDAS (-)',
        x: 37.5, y: 80.2, w: 25, h: 2.8, zIndex: 2,
        style: { fontSize: 6.5, fontWeight: 'bold', fontFamily: 'Montserrat', color: '#9d174d', letterSpacing: 0.6 }
    },
    {
        id: 'df-out-val',
        name: 'Valor Saídas',
        type: 'text',
        content: 'R$ ______________',
        x: 37.5, y: 86, w: 25, h: 4, zIndex: 2,
        style: { fontSize: 8, fontWeight: 'bold', fontFamily: 'Montserrat', color: '#be185d' }
    },

    {
        id: 'df-bal-box',
        name: 'Card Saldo do Dia',
        type: 'box',
        x: 66, y: 79, w: 28, h: 14, zIndex: 1,
        style: { backgroundColor: '#fffbeb', borderColor: '#fde68a', borderWidth: 1, borderRadius: 10 }
    },
    {
        id: 'df-bal-title',
        name: 'Label Saldo do Dia',
        type: 'text',
        content: '★ SALDO DO DIA',
        x: 67.5, y: 80.2, w: 25, h: 2.8, zIndex: 2,
        style: { fontSize: 6.5, fontWeight: 'bold', fontFamily: 'Montserrat', color: '#92400e', letterSpacing: 0.6 }
    },
    {
        id: 'df-bal-val',
        name: 'Valor Saldo',
        type: 'text',
        content: 'R$ ______________',
        x: 67.5, y: 86, w: 25, h: 4, zIndex: 2,
        style: { fontSize: 8, fontWeight: 'bold', fontFamily: 'Montserrat', color: '#b45309' }
    },

    {
        id: 'df-quote',
        name: 'Frase do Dia',
        type: 'quote',
        x: 6, y: 94.5, w: 88, h: 3.2, zIndex: 2,
        style: { fontSize: 8.5, fontFamily: 'Dancing Script', color: '#047857', textAlign: 'center' }
    }
];

// ============================================================================
// 7. PLANNER FINANCEIRO PESSOAL & ECONOMIA DIÁRIA (Essenciais vs. Variáveis)
// ============================================================================
export const DAILY_FINANCIAL_PERSONAL: LayoutElement[] = [
    ...buildPastelDailyHeader('dfp', PEACH_PALETTE),
    {
        id: 'dfp-top-box',
        name: 'Card Meta & Consciência Financeira',
        type: 'box',
        x: 6, y: 19, w: 88, h: 12.5, zIndex: 1,
        style: { backgroundColor: '#fffbeb', borderColor: '#fde68a', borderWidth: 1, borderRadius: 10 }
    },
    {
        id: 'dfp-top-title',
        name: 'Título Foco Financeiro',
        type: 'text',
        content: '✦ FOCO FINANCEIRO & PAGAMENTOS DE HOJE',
        x: 8.5, y: 20.2, w: 83, h: 2.8, zIndex: 2,
        style: { fontSize: 6.8, fontWeight: 'bold', fontFamily: 'Montserrat', color: '#92400e', letterSpacing: 0.8 }
    },
    {
        id: 'dfp-top-lines',
        name: 'Checklist Pagamentos',
        type: 'lines',
        x: 8.5, y: 23.5, w: 83, h: 6.8, zIndex: 2,
        style: { rowCount: 2, color: '#fcd34d', borderColor: '#fde68a', showCheckboxes: true, checkboxStyle: 'circle' }
    },
    // Duas Colunas: Gastos Essenciais (Sálvia) vs Gastos Variáveis/Lazer (Rosé)
    {
        id: 'dfp-ess-box',
        name: 'Card Gastos Essenciais',
        type: 'box',
        x: 6, y: 33, w: 43, h: 44, zIndex: 1,
        style: { backgroundColor: '#f0fdf4', borderColor: '#bbf7d0', borderWidth: 1, borderRadius: 10 }
    },
    {
        id: 'dfp-ess-title',
        name: 'Título Gastos Essenciais',
        type: 'text',
        content: '✿ GASTOS ESSENCIAIS / FIXOS',
        x: 8, y: 34.2, w: 39, h: 2.8, zIndex: 2,
        style: { fontSize: 6.8, fontWeight: 'bold', fontFamily: 'Montserrat', color: '#166534', letterSpacing: 0.8 }
    },
    {
        id: 'dfp-ess-table',
        name: 'Tabela Gastos Essenciais',
        type: 'table',
        x: 8, y: 37.5, w: 39, h: 37.5, zIndex: 2,
        style: {
            table: {
                rows: 9,
                cols: 2,
                headerRow: true,
                headerBackgroundColor: '#dcfce7',
                headerTextColor: '#14532d',
                alternateRowColor: '#ffffff',
                borderColor: '#bbf7d0',
                borderWidth: 0.6,
                columnWidths: [68, 32],
                textStyle: { fontSize: 6.5, fontFamily: 'Montserrat', color: '#374151', verticalAlign: 'middle' },
                cellContent: {
                    '0-0': 'ITEM / DESCRIÇÃO',
                    '0-1': 'R$'
                }
            }
        }
    },
    {
        id: 'dfp-var-box',
        name: 'Card Gastos Variáveis & Cartão',
        type: 'box',
        x: 51, y: 33, w: 43, h: 44, zIndex: 1,
        style: { backgroundColor: '#fff1f2', borderColor: '#fecdd3', borderWidth: 1, borderRadius: 10 }
    },
    {
        id: 'dfp-var-title',
        name: 'Título Gastos Variáveis',
        type: 'text',
        content: '✦ VARIÁVEIS, LAZER & CARTÃO',
        x: 53, y: 34.2, w: 39, h: 2.8, zIndex: 2,
        style: { fontSize: 6.8, fontWeight: 'bold', fontFamily: 'Montserrat', color: '#9d174d', letterSpacing: 0.8 }
    },
    {
        id: 'dfp-var-table',
        name: 'Tabela Gastos Variáveis',
        type: 'table',
        x: 53, y: 37.5, w: 39, h: 37.5, zIndex: 2,
        style: {
            table: {
                rows: 9,
                cols: 2,
                headerRow: true,
                headerBackgroundColor: '#fce7f3',
                headerTextColor: '#881337',
                alternateRowColor: '#ffffff',
                borderColor: '#fbcfe8',
                borderWidth: 0.6,
                columnWidths: [68, 32],
                textStyle: { fontSize: 6.5, fontFamily: 'Montserrat', color: '#374151', verticalAlign: 'middle' },
                cellContent: {
                    '0-0': 'ITEM / DESCRIÇÃO',
                    '0-1': 'R$'
                }
            }
        }
    },
    // Rodapé: Balanço & Caixinha de Economia
    {
        id: 'dfp-foot-box',
        name: 'Card Resumo & Economia do Dia',
        type: 'box',
        x: 6, y: 78.5, w: 88, h: 15, zIndex: 1,
        style: { backgroundColor: '#faf5ff', borderColor: '#e9d5ff', borderWidth: 1, borderRadius: 10 }
    },
    {
        id: 'dfp-foot-title',
        name: 'Título Economia do Dia',
        type: 'text',
        content: '✦ BALANÇO & META DE ECONOMIA DO DIA',
        x: 8.5, y: 79.8, w: 83, h: 2.8, zIndex: 2,
        style: { fontSize: 6.8, fontWeight: 'bold', fontFamily: 'Montserrat', color: '#6b21a8', letterSpacing: 0.8 }
    },
    {
        id: 'dfp-foot-table',
        name: 'Tabela Economia do Dia',
        type: 'table',
        x: 8.5, y: 83, w: 83, h: 9, zIndex: 2,
        style: {
            table: {
                rows: 2,
                cols: 3,
                headerRow: false,
                borderColor: '#e9d5ff',
                borderWidth: 0.6,
                columnWidths: [34, 33, 33],
                textStyle: { fontSize: 6.5, fontWeight: 'bold', fontFamily: 'Montserrat', color: '#581c87', verticalAlign: 'middle' },
                cellContent: {
                    '0-0': 'Total Essencial: R$',
                    '0-1': 'Total Variável: R$',
                    '0-2': 'Guardado Hoje: R$',
                    '1-0': 'Pago no PIX/Débito: R$',
                    '1-1': 'Pago no Crédito: R$',
                    '1-2': '[  ] Dia Zero Gastos Extras!'
                }
            }
        }
    },
    {
        id: 'dfp-quote',
        name: 'Frase do Dia',
        type: 'quote',
        x: 6, y: 94.5, w: 88, h: 3.2, zIndex: 2,
        style: { fontSize: 9, fontFamily: 'Dancing Script', color: '#92400e', textAlign: 'center' }
    }
];

// ============================================================================
// 8. PLANNER DIÁRIO DE ESTUDOS & CONCURSOS PASTEL
// ============================================================================
export const DAILY_STUDY: LayoutElement[] = [
    ...buildPastelDailyHeader('ds', LAVENDER_PALETTE),
    {
        id: 'ds-2',
        name: 'Tabela Cronograma de Estudos',
        type: 'table',
        x: 6, y: 19, w: 88, h: 38, zIndex: 2,
        style: {
            table: {
                rows: 8, cols: 3, headerRow: true,
                headerBackgroundColor: '#f3e8ff',
                headerTextColor: '#581c87',
                alternateRowColor: '#faf5ff',
                borderColor: '#e9d5ff',
                borderWidth: 0.8,
                columnWidths: [20, 52, 28],
                textStyle: { fontSize: 7.5, fontFamily: 'Montserrat', color: '#374151', verticalAlign: 'middle' },
                cellContent: {
                    '0-0': 'HORÁRIO / TEMPO',
                    '0-1': 'DISCIPLINA • CONTEÚDO / AULA',
                    '0-2': 'EXERCÍCIOS / % ACERTO'
                }
            }
        }
    },
    {
        id: 'ds-rev-box',
        name: 'Card Revisões',
        type: 'box',
        x: 6, y: 58.5, w: 88, h: 17, zIndex: 1,
        style: { backgroundColor: '#fff1f2', borderColor: '#fecdd3', borderWidth: 1, borderRadius: 10 }
    },
    {
        id: 'ds-3',
        name: 'Título Revisões',
        type: 'text',
        content: '✦ MATÉRIAS PARA REVISAR & SIMULADOS:',
        x: 8.5, y: 60, w: 83, h: 3, zIndex: 2,
        style: { fontSize: 7.5, fontWeight: 'bold', fontFamily: 'Montserrat', color: '#9d174d', letterSpacing: 1 }
    },
    {
        id: 'ds-4',
        name: 'Checklist Revisões',
        type: 'lines',
        x: 8.5, y: 63.8, w: 83, h: 10, zIndex: 2,
        style: { rowCount: 3, color: '#fbcfe8', borderColor: '#fbcfe8', showCheckboxes: true, checkboxStyle: 'circle' }
    },
    {
        id: 'ds-5',
        name: 'Card Resumo & Insights',
        type: 'box',
        x: 6, y: 77, w: 88, h: 16.5, zIndex: 1,
        style: { backgroundColor: '#f0fdf4', borderWidth: 1, borderColor: '#bbf7d0', borderRadius: 10 }
    },
    {
        id: 'ds-6',
        name: 'Título Resumo de Estudo',
        type: 'text',
        content: '✿ RESUMO, FÓRMULAS & INSIGHTS DO DIA:',
        x: 8.5, y: 78.5, w: 83, h: 3, zIndex: 2,
        style: { fontSize: 7.5, fontWeight: 'bold', fontFamily: 'Montserrat', color: '#166534', letterSpacing: 1 }
    },
    {
        id: 'ds-7',
        name: 'Linhas Resumo',
        type: 'lines',
        x: 8.5, y: 82.2, w: 83, h: 9.5, zIndex: 2,
        style: { rowCount: 3, color: '#bbf7d0', borderColor: '#bbf7d0' }
    },
    {
        id: 'ds-quote',
        name: 'Frase do Dia',
        type: 'quote',
        x: 6, y: 94.5, w: 88, h: 3.2, zIndex: 2,
        style: { fontSize: 9, fontFamily: 'Dancing Script', color: '#7e22ce', textAlign: 'center' }
    }
];

// ============================================================================
// 9. PLANNER DIÁRIO DE SAÚDE, BEM-ESTAR & NUTRIÇÃO PASTEL
// ============================================================================
export const DAILY_HEALTH: LayoutElement[] = [
    ...buildPastelDailyHeader('dh', ROSE_PALETTE),
    {
        id: 'dh-care-card',
        name: 'Card Hidratação & Humor',
        type: 'box',
        x: 6, y: 19, w: 88, h: 12.5, zIndex: 1,
        style: { backgroundColor: '#fff1f2', borderColor: '#fecdd3', borderWidth: 1, borderRadius: 10 }
    },
    {
        id: 'dh-water',
        name: 'Hidratação do Dia',
        type: 'footer_tracker',
        x: 8.5, y: 21, w: 40, h: 8, zIndex: 2,
        style: { variant: 'water', title: 'HIDRATAÇÃO DO DIA', color: '#be185d' }
    },
    {
        id: 'dh-mood',
        name: 'Energia & Humor',
        type: 'footer_tracker',
        x: 52, y: 21, w: 39, h: 8, zIndex: 2,
        style: { variant: 'mood', title: 'ENERGIA & HUMOR', color: '#be185d' }
    },
    {
        id: 'dh-7',
        name: 'Título Refeições',
        type: 'text',
        content: '✿ PLANEJAMENTO DE REFEIÇÕES NUTRITIVAS',
        x: 6, y: 33, w: 88, h: 3.5, zIndex: 2,
        style: { fontSize: 8, fontWeight: 'bold', fontFamily: 'Montserrat', color: '#166534', letterSpacing: 1 }
    },
    {
        id: 'dh-8',
        name: 'Tabela Cardápio Diário',
        type: 'table',
        x: 6, y: 37, w: 88, h: 35, zIndex: 2,
        style: {
            table: {
                rows: 5, cols: 2, headerRow: true,
                headerBackgroundColor: '#dcfce7',
                headerTextColor: '#14532d',
                alternateRowColor: '#f0fdf4',
                borderColor: '#bbf7d0',
                borderWidth: 0.8,
                columnWidths: [30, 70],
                textStyle: { fontSize: 7.5, fontFamily: 'Montserrat', color: '#374151', verticalAlign: 'middle' },
                cellContent: {
                    '0-0': 'REFEIÇÃO',
                    '0-1': 'CARDÁPIO & ESCOLHAS SAUDÁVEIS',
                    '1-0': 'Café da Manhã',
                    '2-0': 'Almoço',
                    '3-0': 'Lanche da Tarde',
                    '4-0': 'Jantar / Ceia'
                }
            }
        }
    },
    {
        id: 'dh-act-box',
        name: 'Card Movimento & Autocuidado',
        type: 'box',
        x: 6, y: 74, w: 88, h: 19.5, zIndex: 1,
        style: { backgroundColor: '#faf5ff', borderColor: '#e9d5ff', borderWidth: 1, borderRadius: 10 }
    },
    {
        id: 'dh-9',
        name: 'Título Movimento & Treino',
        type: 'text',
        content: '✦ MOVIMENTO, TREINO, SONO & AUTOCUIDADO:',
        x: 8.5, y: 75.5, w: 83, h: 3, zIndex: 2,
        style: { fontSize: 7.5, fontWeight: 'bold', fontFamily: 'Montserrat', color: '#6b21a8', letterSpacing: 1 }
    },
    {
        id: 'dh-11',
        name: 'Checklist Autocuidado',
        type: 'lines',
        x: 8.5, y: 79.5, w: 83, h: 12, zIndex: 2,
        style: { rowCount: 4, color: '#e9d5ff', borderColor: '#e9d5ff', showCheckboxes: true, checkboxStyle: 'circle' }
    },
    {
        id: 'dh-quote',
        name: 'Frase do Dia',
        type: 'quote',
        x: 6, y: 94.5, w: 88, h: 3.2, zIndex: 2,
        style: { fontSize: 9, fontFamily: 'Dancing Script', color: '#be185d', textAlign: 'center' }
    }
];

// ============================================================================
// 10. VARIAÇÕES 2 DIAS POR PÁGINA (2 DPP) — AGENDAMENTO DE HORÁRIOS & FINANCEIRO
// ============================================================================
export const APPOINTMENT_2DPP_TOP: LayoutElement[] = [
    {
        id: 'ap2-t-card',
        name: 'Card Superior Agendamento',
        type: 'box',
        x: 5, y: 2.5, w: 90, h: 44.5, zIndex: 0,
        style: { backgroundColor: '#fffbfc', borderColor: '#fbcfe8', borderWidth: 1, borderRadius: 12 }
    },
    {
        id: 'ap2-t-badge',
        name: 'Badge Dia Superior',
        type: 'box',
        x: 7, y: 4, w: 12, h: 7.5, zIndex: 1,
        style: { backgroundColor: '#fff1f2', borderColor: '#fecdd3', borderWidth: 1, borderRadius: 8 }
    },
    {
        id: 'ap2-t-num',
        name: 'Número do Dia (Topo)',
        type: 'day_number',
        x: 7, y: 4.2, w: 12, h: 7, zIndex: 2,
        style: { fontSize: 19, fontWeight: 'bold', fontFamily: 'Playfair Display', color: '#881337', textAlign: 'center' }
    },
    {
        id: 'ap2-t-name',
        name: 'Dia da Semana (Topo)',
        type: 'day_name',
        x: 20.5, y: 4.2, w: 28, h: 3.5, zIndex: 2,
        style: { fontSize: 8, fontWeight: 'bold', fontFamily: 'Montserrat', color: '#9d174d', textAlign: 'left', textTransform: 'uppercase', letterSpacing: 0.6 }
    },
    {
        id: 'ap2-t-month',
        name: 'Mês (Topo)',
        type: 'month_name',
        x: 20.5, y: 7.6, w: 26, h: 3.5, zIndex: 2,
        style: { fontSize: 10.5, fontFamily: 'Dancing Script', color: '#be185d', textAlign: 'left', textTransform: 'capitalize' }
    },
    {
        id: 'ap2-t-holiday',
        name: 'Feriado (Topo)',
        type: 'holiday',
        x: 50, y: 4.2, w: 43, h: 3, zIndex: 2,
        style: { fontSize: 6, fontWeight: 'bold', fontFamily: 'Montserrat', color: '#be123c', textAlign: 'right', letterSpacing: 0.4 }
    },
    {
        id: 'ap2-t-lines',
        name: 'Horários (Topo)',
        type: 'lines',
        x: 7, y: 12.5, w: 56, h: 32.5, zIndex: 2,
        style: {
            showTimes: true,
            startHour: 8,
            endHour: 19,
            timeInterval: 60,
            timeFontSize: 6,
            timeColor: '#9d174d',
            timeColumnWidth: 22,
            color: '#9d174d',
            borderColor: '#fce7f3',
            borderWidth: 0.5
        }
    },
    {
        id: 'ap2-t-side-box',
        name: 'Box Foco & Caixa Topo',
        type: 'box',
        x: 65, y: 12.5, w: 28, h: 32.5, zIndex: 1,
        style: { backgroundColor: '#faf5ff', borderColor: '#e9d5ff', borderWidth: 0.8, borderRadius: 8 }
    },
    {
        id: 'ap2-t-side-title',
        name: 'Título Notas Topo',
        type: 'text',
        content: '✦ FOCO & CAIXA',
        x: 66.5, y: 13.8, w: 25, h: 2.5, zIndex: 2,
        style: { fontSize: 5.6, fontWeight: 'bold', fontFamily: 'Montserrat', color: '#6b21a8', letterSpacing: 0.5 }
    },
    {
        id: 'ap2-t-side-lines',
        name: 'Linhas Laterais Topo',
        type: 'lines',
        x: 66.5, y: 17, w: 25, h: 26, zIndex: 2,
        style: { rowCount: 7, color: '#d8b4fe', borderColor: '#e9d5ff', showCheckboxes: true, checkboxStyle: 'circle' }
    }
];

export const APPOINTMENT_2DPP_BOTTOM: LayoutElement[] = [
    {
        id: 'ap2-b-card',
        name: 'Card Inferior Agendamento',
        type: 'box',
        x: 5, y: 51.5, w: 90, h: 44.5, zIndex: 0,
        style: { backgroundColor: '#f0fdf4', borderColor: '#bbf7d0', borderWidth: 1, borderRadius: 12, opacity: 0.65 }
    },
    {
        id: 'ap2-b-badge',
        name: 'Badge Dia Inferior',
        type: 'box',
        x: 7, y: 53, w: 12, h: 7.5, zIndex: 1,
        style: { backgroundColor: '#ecfdf5', borderColor: '#a7f3d0', borderWidth: 1, borderRadius: 8 }
    },
    {
        id: 'ap2-b-num',
        name: 'Número do Dia (Base)',
        type: 'day_number',
        x: 7, y: 53.2, w: 12, h: 7, zIndex: 2,
        style: { fontSize: 19, fontWeight: 'bold', fontFamily: 'Playfair Display', color: '#14532d', textAlign: 'center' }
    },
    {
        id: 'ap2-b-name',
        name: 'Dia da Semana (Base)',
        type: 'day_name',
        x: 20.5, y: 53.2, w: 28, h: 3.5, zIndex: 2,
        style: { fontSize: 8, fontWeight: 'bold', fontFamily: 'Montserrat', color: '#166534', textAlign: 'left', textTransform: 'uppercase', letterSpacing: 0.6 }
    },
    {
        id: 'ap2-b-month',
        name: 'Mês (Base)',
        type: 'month_name',
        x: 20.5, y: 56.6, w: 26, h: 3.5, zIndex: 2,
        style: { fontSize: 10.5, fontFamily: 'Dancing Script', color: '#15803d', textAlign: 'left', textTransform: 'capitalize' }
    },
    {
        id: 'ap2-b-holiday',
        name: 'Feriado (Base)',
        type: 'holiday',
        x: 50, y: 53.2, w: 43, h: 3, zIndex: 2,
        style: { fontSize: 6, fontWeight: 'bold', fontFamily: 'Montserrat', color: '#be123c', textAlign: 'right', letterSpacing: 0.4 }
    },
    {
        id: 'ap2-b-lines',
        name: 'Horários (Base)',
        type: 'lines',
        x: 7, y: 61.5, w: 56, h: 32.5, zIndex: 2,
        style: {
            showTimes: true,
            startHour: 8,
            endHour: 19,
            timeInterval: 60,
            timeFontSize: 6,
            timeColor: '#166534',
            timeColumnWidth: 22,
            color: '#166534',
            borderColor: '#bbf7d0',
            borderWidth: 0.5
        }
    },
    {
        id: 'ap2-b-side-box',
        name: 'Box Foco & Caixa Base',
        type: 'box',
        x: 65, y: 61.5, w: 28, h: 32.5, zIndex: 1,
        style: { backgroundColor: '#ffffff', borderColor: '#bbf7d0', borderWidth: 0.8, borderRadius: 8 }
    },
    {
        id: 'ap2-b-side-title',
        name: 'Título Notas Base',
        type: 'text',
        content: '✿ FOCO & CAIXA',
        x: 66.5, y: 62.8, w: 25, h: 2.5, zIndex: 2,
        style: { fontSize: 5.6, fontWeight: 'bold', fontFamily: 'Montserrat', color: '#166534', letterSpacing: 0.5 }
    },
    {
        id: 'ap2-b-side-lines',
        name: 'Linhas Laterais Base',
        type: 'lines',
        x: 66.5, y: 66, w: 25, h: 26, zIndex: 2,
        style: { rowCount: 7, color: '#86efac', borderColor: '#bbf7d0', showCheckboxes: true, checkboxStyle: 'circle' }
    }
];
