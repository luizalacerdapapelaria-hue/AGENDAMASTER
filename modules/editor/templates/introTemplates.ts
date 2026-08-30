
import { IntroPage } from '../../../types';

export const INTRO_TEMPLATES: IntroPage[] = [
    {
        id: 'tpl-dados-pessoais',
        name: 'Dados Pessoais',
        elements: [
            { id: 't1', type: 'text', content: 'DADOS PESSOAIS', x: 10, y: 10, w: 80, h: 8, zIndex: 1, style: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', color: '#333', fontFamily: 'Inter', textTransform: 'none', letterSpacing: 0 } },
            { id: 'b1', type: 'box', x: 10, y: 25, w: 80, h: 60, zIndex: 0, style: { borderWidth: 1, borderColor: '#eee', borderRadius: 8 } },
            { id: 'l1', type: 'text', content: 'NOME:', x: 15, y: 30, w: 20, h: 5, zIndex: 1, style: { fontSize: 10, fontWeight: 'bold', fontFamily: 'Inter', color: '#000', textAlign: 'left', textTransform: 'none', letterSpacing: 0 } },
            { id: 'ln1', type: 'lines', x: 35, y: 30, w: 50, h: 5, zIndex: 1, style: { color: '#ccc', borderWidth: 0.5 } },
            { id: 'l2', type: 'text', content: 'ENDEREÇO:', x: 15, y: 40, w: 20, h: 5, zIndex: 1, style: { fontSize: 10, fontWeight: 'bold', fontFamily: 'Inter', color: '#000', textAlign: 'left', textTransform: 'none', letterSpacing: 0 } },
            { id: 'ln2', type: 'lines', x: 35, y: 40, w: 50, h: 5, zIndex: 1, style: { color: '#ccc', borderWidth: 0.5 } },
            { id: 'l3', type: 'text', content: 'TELEFONE:', x: 15, y: 50, w: 20, h: 5, zIndex: 1, style: { fontSize: 10, fontWeight: 'bold', fontFamily: 'Inter', color: '#000', textAlign: 'left', textTransform: 'none', letterSpacing: 0 } },
            { id: 'ln3', type: 'lines', x: 35, y: 50, w: 50, h: 5, zIndex: 1, style: { color: '#ccc', borderWidth: 0.5 } },
            { id: 'l4', type: 'text', content: 'E-MAIL:', x: 15, y: 60, w: 20, h: 5, zIndex: 1, style: { fontSize: 10, fontWeight: 'bold', fontFamily: 'Inter', color: '#000', textAlign: 'left', textTransform: 'none', letterSpacing: 0 } },
            { id: 'ln4', type: 'lines', x: 35, y: 60, w: 50, h: 5, zIndex: 1, style: { color: '#ccc', borderWidth: 0.5 } },
            { id: 'l5', type: 'text', content: 'EM CASO DE EMERGÊNCIA AVISAR:', x: 15, y: 75, w: 70, h: 5, zIndex: 1, style: { fontSize: 10, fontWeight: 'bold', fontFamily: 'Inter', color: '#000', textAlign: 'left', textTransform: 'none', letterSpacing: 0 } },
            { id: 'ln5', type: 'lines', x: 15, y: 80, w: 70, h: 5, zIndex: 1, style: { color: '#ccc', borderWidth: 0.5 } },
        ]
    },
    {
        id: 'tpl-calendario-anual',
        name: 'Calendário Anual',
        elements: [
            { id: 't2', type: 'text', content: 'CALENDÁRIO 2026', x: 10, y: 5, w: 80, h: 8, zIndex: 1, style: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', fontFamily: 'Inter', color: '#000', textTransform: 'none', letterSpacing: 0 } },
            { id: 'c1', type: 'full_calendar', x: 5, y: 15, w: 90, h: 80, zIndex: 1, style: { 
                fullCalendar: {
                    title: { fontSize: 8, fontWeight: 'bold', textAlign: 'center', color: '#333', fontFamily: 'Inter', textTransform: 'none', letterSpacing: 0 },
                    weekDays: { fontSize: 6, fontWeight: 'bold', textAlign: 'center', color: '#666', fontFamily: 'Inter', textTransform: 'none', letterSpacing: 0 },
                    days: { fontSize: 7, fontWeight: 'normal', textAlign: 'center', color: '#333', fontFamily: 'Inter', textTransform: 'none', letterSpacing: 0 },
                    grid: { borderColor: '#eee', borderWidth: 0.5, cellBackgroundColor: 'transparent', headerBackgroundColor: 'transparent', borders: { top: false, bottom: false, left: false, right: false, insideHorizontal: false, insideVertical: false, headerSeparator: true }, borderStyle: 'solid' }
                }
            } }
        ]
    },
    {
        id: 'tpl-metas',
        name: 'Metas do Ano',
        elements: [
            { id: 't3', type: 'text', content: 'MINHAS METAS PARA O ANO', x: 10, y: 10, w: 80, h: 8, zIndex: 1, style: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', fontFamily: 'Inter', color: '#000', textTransform: 'none', letterSpacing: 0 } },
            { id: 'g1', type: 'box', x: 10, y: 25, w: 38, h: 30, zIndex: 0, style: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10 } },
            { id: 'gt1', type: 'text', content: 'PESSOAL', x: 12, y: 27, w: 34, h: 5, zIndex: 1, style: { fontSize: 12, fontWeight: 'bold', textAlign: 'center', fontFamily: 'Inter', color: '#000', textTransform: 'none', letterSpacing: 0 } },
            { id: 'gl1', type: 'lines', x: 12, y: 35, w: 34, h: 15, zIndex: 1, style: { color: '#eee', lineSpacing: 20 } },
            
            { id: 'g2', type: 'box', x: 52, y: 25, w: 38, h: 30, zIndex: 0, style: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10 } },
            { id: 'gt2', type: 'text', content: 'PROFISSIONAL', x: 54, y: 27, w: 34, h: 5, zIndex: 1, style: { fontSize: 12, fontWeight: 'bold', textAlign: 'center', fontFamily: 'Inter', color: '#000', textTransform: 'none', letterSpacing: 0 } },
            { id: 'gl2', type: 'lines', x: 54, y: 35, w: 34, h: 15, zIndex: 1, style: { color: '#eee', lineSpacing: 20 } },
            
            { id: 'g3', type: 'box', x: 10, y: 60, w: 38, h: 30, zIndex: 0, style: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10 } },
            { id: 'gt3', type: 'text', content: 'SAÚDE', x: 12, y: 62, w: 34, h: 5, zIndex: 1, style: { fontSize: 12, fontWeight: 'bold', textAlign: 'center', fontFamily: 'Inter', color: '#000', textTransform: 'none', letterSpacing: 0 } },
            { id: 'gl3', type: 'lines', x: 12, y: 70, w: 34, h: 15, zIndex: 1, style: { color: '#eee', lineSpacing: 20 } },
            
            { id: 'g4', type: 'box', x: 52, y: 60, w: 38, h: 30, zIndex: 0, style: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10 } },
            { id: 'gt4', type: 'text', content: 'FINANCEIRO', x: 54, y: 62, w: 34, h: 5, zIndex: 1, style: { fontSize: 12, fontWeight: 'bold', textAlign: 'center', fontFamily: 'Inter', color: '#000', textTransform: 'none', letterSpacing: 0 } },
            { id: 'gl4', type: 'lines', x: 54, y: 70, w: 34, h: 15, zIndex: 1, style: { color: '#eee', lineSpacing: 20 } },
        ]
    },
    {
        id: 'tpl-contatos',
        name: 'Contatos Importantes',
        elements: [
            { id: 't4', type: 'text', content: 'CONTATOS IMPORTANTES', x: 10, y: 10, w: 80, h: 8, zIndex: 1, style: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', fontFamily: 'Inter', color: '#000', textTransform: 'none', letterSpacing: 0 } },
            { id: 'tbl1', type: 'table', x: 5, y: 25, w: 90, h: 65, zIndex: 1, style: { 
                table: {
                    rows: 15,
                    cols: 2,
                    borderColor: '#ccc',
                    borderWidth: 0.5,
                    borderStyle: 'solid',
                    headerRow: true,
                    borders: { top: true, bottom: true, left: true, right: true, insideHorizontal: true, insideVertical: true, headerSeparator: true },
                    textStyle: { fontSize: 9, fontFamily: 'Inter', color: '#333', fontWeight: 'normal', textAlign: 'left', textTransform: 'none', letterSpacing: 0 },
                    rowStyles: { 
                        0: { fontSize: 9, fontFamily: 'Inter', color: '#333', fontWeight: 'bold', textAlign: 'left', textTransform: 'none', letterSpacing: 0 }
                    }
                }
            } }
        ]
    },
    {
        id: 'tpl-senhas',
        name: 'Senhas e Logins',
        elements: [
            { id: 't5', type: 'text', content: 'SENHAS E LOGINS', x: 10, y: 10, w: 80, h: 8, zIndex: 1, style: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', fontFamily: 'Inter', color: '#000', textTransform: 'none', letterSpacing: 0 } },
            { id: 'tbl2', type: 'table', x: 5, y: 25, w: 90, h: 65, zIndex: 1, style: { 
                table: {
                    rows: 15,
                    cols: 3,
                    borderColor: '#ccc',
                    borderWidth: 0.5,
                    borderStyle: 'solid',
                    headerRow: true,
                    borders: { top: true, bottom: true, left: true, right: true, insideHorizontal: true, insideVertical: true, headerSeparator: true },
                    textStyle: { fontSize: 9, fontFamily: 'Inter', color: '#333', fontWeight: 'normal', textAlign: 'left', textTransform: 'none', letterSpacing: 0 },
                    rowStyles: { 
                        0: { fontSize: 9, fontFamily: 'Inter', color: '#333', fontWeight: 'bold', textAlign: 'left', textTransform: 'none', letterSpacing: 0 }
                    }
                }
            } }
        ]
    },
    {
        id: 'tpl-financeiro',
        name: 'Controle Financeiro',
        elements: [
            { id: 'fin-t1', type: 'text', content: 'CONTROLE FINANCEIRO MENSAL', x: 10, y: 5, w: 80, h: 6, zIndex: 1, style: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', color: '#333' } },
            { id: 'fin-b1', type: 'box', x: 5, y: 15, w: 43, h: 35, zIndex: 0, style: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8 } },
            { id: 'fin-t2', type: 'text', content: 'ENTRADAS', x: 7, y: 17, w: 39, h: 4, zIndex: 1, style: { fontSize: 12, fontWeight: 'bold', textAlign: 'center', color: '#22c55e' } },
            { id: 'fin-tbl1', type: 'table', x: 7, y: 22, w: 39, h: 25, zIndex: 1, style: { table: { rows: 6, cols: 2, headerRow: true, textStyle: { fontSize: 8 } } } },
            
            { id: 'fin-b2', type: 'box', x: 52, y: 15, w: 43, h: 35, zIndex: 0, style: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8 } },
            { id: 'fin-t3', type: 'text', content: 'SAÍDAS FIXAS', x: 54, y: 17, w: 39, h: 4, zIndex: 1, style: { fontSize: 12, fontWeight: 'bold', textAlign: 'center', color: '#ef4444' } },
            { id: 'fin-tbl2', type: 'table', x: 54, y: 22, w: 39, h: 25, zIndex: 1, style: { table: { rows: 6, cols: 2, headerRow: true, textStyle: { fontSize: 8 } } } },
            
            { id: 'fin-b3', type: 'box', x: 5, y: 55, w: 90, h: 35, zIndex: 0, style: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8 } },
            { id: 'fin-t4', type: 'text', content: 'SAÍDAS VARIÁVEIS', x: 7, y: 57, w: 86, h: 4, zIndex: 1, style: { fontSize: 12, fontWeight: 'bold', textAlign: 'center', color: '#f59e0b' } },
            { id: 'fin-tbl3', type: 'table', x: 7, y: 62, w: 86, h: 25, zIndex: 1, style: { table: { rows: 8, cols: 3, headerRow: true, textStyle: { fontSize: 8 } } } },
        ]
    },
    {
        id: 'tpl-estudos',
        name: 'Cronograma de Estudos',
        elements: [
            { id: 'est-t1', type: 'text', content: 'CRONOGRAMA DE ESTUDOS', x: 10, y: 5, w: 80, h: 6, zIndex: 1, style: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', color: '#333' } },
            { id: 'est-tbl1', type: 'table', x: 5, y: 15, w: 90, h: 50, zIndex: 1, style: { table: { rows: 10, cols: 6, headerRow: true, textStyle: { fontSize: 8 } } } },
            { id: 'est-b1', type: 'box', x: 5, y: 70, w: 43, h: 25, zIndex: 0, style: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8 } },
            { id: 'est-t2', type: 'text', content: 'MATÉRIAS IMPORTANTES', x: 7, y: 72, w: 39, h: 4, zIndex: 1, style: { fontSize: 10, fontWeight: 'bold', textAlign: 'center' } },
            { id: 'est-l1', type: 'lines', x: 7, y: 77, w: 39, h: 15, zIndex: 1, style: { lineSpacing: 20 } },
            
            { id: 'est-b2', type: 'box', x: 52, y: 70, w: 43, h: 25, zIndex: 0, style: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8 } },
            { id: 'est-t3', type: 'text', content: 'NOTAS / LEMBRETES', x: 54, y: 72, w: 39, h: 4, zIndex: 1, style: { fontSize: 10, fontWeight: 'bold', textAlign: 'center' } },
            { id: 'est-l2', type: 'note_grid', x: 54, y: 77, w: 39, h: 15, zIndex: 1, style: { gridSpacing: 15 } },
        ]
    },
    {
        id: 'tpl-saude',
        name: 'Diário de Saúde',
        elements: [
            { id: 'sau-t1', type: 'text', content: 'ACOMPANHAMENTO DE SAÚDE', x: 10, y: 5, w: 80, h: 6, zIndex: 1, style: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', color: '#333' } },
            { id: 'sau-b1', type: 'box', x: 5, y: 15, w: 90, h: 25, zIndex: 0, style: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8 } },
            { id: 'sau-t2', type: 'text', content: 'CONTROLE DE MEDICAMENTOS', x: 7, y: 17, w: 86, h: 4, zIndex: 1, style: { fontSize: 11, fontWeight: 'bold' } },
            { id: 'sau-tbl1', type: 'table', x: 7, y: 22, w: 86, h: 15, zIndex: 1, style: { table: { rows: 4, cols: 4, headerRow: true, textStyle: { fontSize: 8 } } } },
            
            { id: 'sau-b2', type: 'box', x: 5, y: 45, w: 43, h: 45, zIndex: 0, style: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8 } },
            { id: 'sau-t3', type: 'text', content: 'HÁBITOS SAUDÁVEIS', x: 7, y: 47, w: 39, h: 4, zIndex: 1, style: { fontSize: 11, fontWeight: 'bold', textAlign: 'center' } },
            { id: 'sau-ht1', type: 'habit_tracker', x: 7, y: 52, w: 39, h: 35, zIndex: 1, style: { habitLabel: 'Atividade Física' } },
            
            { id: 'sau-b3', type: 'box', x: 52, y: 45, w: 43, h: 45, zIndex: 0, style: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8 } },
            { id: 'sau-t4', type: 'text', content: 'QUALIDADE DO SONO', x: 54, y: 47, w: 39, h: 4, zIndex: 1, style: { fontSize: 11, fontWeight: 'bold', textAlign: 'center' } },
            { id: 'sau-l1', type: 'lines', x: 54, y: 52, w: 39, h: 35, zIndex: 1, style: { lineSpacing: 25 } },
        ]
    },
    {
        id: 'tpl-roda-vida',
        name: 'Roda da Vida',
        elements: [
            { id: 'rv-t1', type: 'text', content: 'RODA DA VIDA', x: 10, y: 5, w: 80, h: 6, zIndex: 1, style: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', color: '#333' } },
            { id: 'rv-c1', type: 'circle', x: 20, y: 15, w: 60, h: 60, zIndex: 0, style: { borderWidth: 1, borderColor: '#ccc', backgroundColor: 'transparent' } },
            { id: 'rv-c2', type: 'circle', x: 30, y: 25, w: 40, h: 40, zIndex: 0, style: { borderWidth: 0.5, borderColor: '#eee', backgroundColor: 'transparent' } },
            { id: 'rv-c3', type: 'circle', x: 40, y: 35, w: 20, h: 20, zIndex: 0, style: { borderWidth: 0.5, borderColor: '#eee', backgroundColor: 'transparent' } },
            { id: 'rv-l1', type: 'lines', x: 50, y: 15, w: 0.1, h: 60, zIndex: 0, style: { color: '#ccc' } },
            { id: 'rv-l2', type: 'lines', x: 20, y: 45, w: 60, h: 0.1, zIndex: 0, style: { color: '#ccc' } },
            { id: 'rv-t2', type: 'text', content: 'Saúde', x: 40, y: 10, w: 20, h: 4, zIndex: 1, style: { fontSize: 9, textAlign: 'center' } },
            { id: 'rv-t3', type: 'text', content: 'Trabalho', x: 82, y: 43, w: 15, h: 4, zIndex: 1, style: { fontSize: 9, textAlign: 'left' } },
            { id: 'rv-t4', type: 'text', content: 'Família', x: 40, y: 77, w: 20, h: 4, zIndex: 1, style: { fontSize: 9, textAlign: 'center' } },
            { id: 'rv-t5', type: 'text', content: 'Finanças', x: 3, y: 43, w: 15, h: 4, zIndex: 1, style: { fontSize: 9, textAlign: 'right' } },
            { id: 'rv-b1', type: 'box', x: 10, y: 82, w: 80, h: 15, zIndex: 0, style: { borderWidth: 1, borderColor: '#eee', borderRadius: 5 } },
            { id: 'rv-t6', type: 'text', content: 'PLANO DE AÇÃO:', x: 12, y: 84, w: 76, h: 3, zIndex: 1, style: { fontSize: 8, fontWeight: 'bold' } },
            { id: 'rv-l3', type: 'lines', x: 12, y: 88, w: 76, h: 7, zIndex: 1, style: { lineSpacing: 15 } },
        ]
    },
    {
        id: 'tpl-viagem',
        name: 'Planejamento de Viagem',
        elements: [
            { id: 'via-t1', type: 'text', content: 'PLANEJAMENTO DE VIAGEM', x: 10, y: 5, w: 80, h: 6, zIndex: 1, style: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', color: '#333' } },
            { id: 'via-b1', type: 'box', x: 5, y: 15, w: 90, h: 20, zIndex: 0, style: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8 } },
            { id: 'via-t2', type: 'text', content: 'DESTINO:', x: 7, y: 17, w: 15, h: 4, zIndex: 1, style: { fontSize: 10, fontWeight: 'bold' } },
            { id: 'via-l1', type: 'lines', x: 22, y: 17, w: 71, h: 4, zIndex: 1, style: { color: '#eee' } },
            { id: 'via-t3', type: 'text', content: 'DATA:', x: 7, y: 25, w: 10, h: 4, zIndex: 1, style: { fontSize: 10, fontWeight: 'bold' } },
            { id: 'via-l2', type: 'lines', x: 17, y: 25, w: 30, h: 4, zIndex: 1, style: { color: '#eee' } },
            
            { id: 'via-b2', type: 'box', x: 5, y: 40, w: 43, h: 55, zIndex: 0, style: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8 } },
            { id: 'via-t4', type: 'text', content: 'CHECKLIST DE MALAS', x: 7, y: 42, w: 39, h: 4, zIndex: 1, style: { fontSize: 11, fontWeight: 'bold', textAlign: 'center' } },
            { id: 'via-l3', type: 'lines', x: 7, y: 47, w: 39, h: 45, zIndex: 1, style: { lineSpacing: 20 } },
            
            { id: 'via-b3', type: 'box', x: 52, y: 40, w: 43, h: 55, zIndex: 0, style: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8 } },
            { id: 'via-t5', type: 'text', content: 'ROTEIRO / LUGARES', x: 54, y: 42, w: 39, h: 4, zIndex: 1, style: { fontSize: 11, fontWeight: 'bold', textAlign: 'center' } },
            { id: 'via-l4', type: 'lines', x: 54, y: 47, w: 39, h: 45, zIndex: 1, style: { lineSpacing: 20 } },
        ]
    },
    {
        id: 'tpl-mensal-completo',
        name: 'Calendário Mensal Completo',
        elements: [
            { id: 'mc-mno', type: 'month_number', x: 10, y: 7, w: 12, h: 8, zIndex: 1, style: { fontSize: 32, fontWeight: 'bold', fontFamily: 'Inter', color: '#f43f5e', textAlign: 'right' } },
            { id: 'mc-sep', type: 'lines', x: 24, y: 7, w: 0.5, h: 8, zIndex: 1, style: { color: '#e5e7eb', borderWidth: 1 } },
            { id: 'mc-mna', type: 'month_name', x: 27, y: 7, w: 40, h: 8, zIndex: 1, style: { fontSize: 24, fontWeight: 'bold', fontFamily: 'Inter', color: '#1e1b4b', textTransform: 'uppercase', letterSpacing: 1 } },
            { id: 'mc-yr', type: 'year', x: 74, y: 7, w: 16, h: 8, zIndex: 1, style: { fontSize: 24, fontWeight: '300', fontFamily: 'Inter', color: '#9ca3af', textAlign: 'right' } },
            { 
                id: 'mc-cal', 
                type: 'mini_calendar', 
                x: 10, y: 18, w: 80, h: 60, 
                zIndex: 1, 
                style: { 
                    useGlobalStyle: false, 
                    calendarOffset: 0, 
                    fullCalendar: { 
                        showYearInTitle: false, 
                        weekdayFormat: 'short', 
                        title: { fontSize: 0, color: 'transparent' }, 
                        weekDays: { fontSize: 8, fontWeight: 'bold', color: '#4f46e5', textAlign: 'center', fontFamily: 'Inter' }, 
                        days: { fontSize: 10, color: '#374151', textAlign: 'center', fontFamily: 'Inter' }, 
                        grid: { 
                            borderColor: '#e5e7eb', 
                            borderWidth: 1, 
                            borderStyle: 'solid', 
                            cellBackgroundColor: 'transparent', 
                            headerBackgroundColor: '#f9fafb', 
                            borders: { top: true, bottom: true, left: true, right: true, insideHorizontal: true, insideVertical: true, headerSeparator: true } 
                        } 
                    } 
                } 
            },
            { id: 'mc-nbx', type: 'box', x: 10, y: 81, w: 80, h: 14, zIndex: 0, style: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8 } },
            { id: 'mc-ntt', type: 'text', content: 'NOTAS', x: 12, y: 82.5, w: 10, h: 3, zIndex: 1, style: { fontSize: 8, fontWeight: 'bold', color: '#4f46e5', fontFamily: 'Inter' } },
            { id: 'mc-nls', type: 'lines', x: 24, y: 82.5, w: 64, h: 11, zIndex: 1, style: { color: '#f3f4f6', lineSpacing: 18, borderWidth: 0.5 } }
        ]
    },
    {
        id: 'tpl-mensal-spread-le',
        name: 'Planner Mensal - Foco (Esquerda)',
        elements: [
            { id: 'msl-mno', type: 'month_number', x: 10, y: 10, w: 15, h: 10, zIndex: 1, style: { fontSize: 36, fontWeight: 'bold', color: '#4f46e5', fontFamily: 'Inter' } },
            { id: 'msl-mna', type: 'month_name', x: 26, y: 10, w: 64, h: 10, zIndex: 1, style: { fontSize: 28, fontWeight: 'medium', color: '#1f2937', fontFamily: 'Inter', textTransform: 'uppercase' } },
            { id: 'msl-bx', type: 'box', x: 10, y: 25, w: 80, h: 65, zIndex: 0, style: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8 } },
            { id: 'msl-tt', type: 'text', content: 'CONQUISTAS E FOCO DO MÊS', x: 14, y: 28, w: 72, h: 4, zIndex: 1, style: { fontSize: 12, fontWeight: 'bold', color: '#4f46e5', fontFamily: 'Inter' } },
            { id: 'msl-ls', type: 'lines', x: 14, y: 36, w: 72, h: 50, zIndex: 1, style: { color: '#f3f4f6', lineSpacing: 25, borderWidth: 0.5 } }
        ]
    },
    {
        id: 'tpl-mensal-spread-ri',
        name: 'Planner Mensal - Calendário (Direita)',
        elements: [
            { id: 'msr-mna', type: 'month_name', x: 10, y: 10, w: 50, h: 10, zIndex: 1, style: { fontSize: 16, fontWeight: 'bold', color: '#9ca3af', fontFamily: 'Inter', textTransform: 'uppercase' } },
            { id: 'msr-yr', type: 'year', x: 60, y: 10, w: 30, h: 10, zIndex: 1, style: { fontSize: 16, fontWeight: 'bold', color: '#9ca3af', fontFamily: 'Inter', textAlign: 'right' } },
            { 
                id: 'msr-cal', 
                type: 'mini_calendar', 
                x: 10, y: 20, w: 80, h: 70, 
                zIndex: 1, 
                style: { 
                    useGlobalStyle: false, 
                    calendarOffset: 0, 
                    fullCalendar: { 
                        showYearInTitle: false, 
                        weekdayFormat: 'short', 
                        title: { fontSize: 0, color: 'transparent' }, 
                        weekDays: { fontSize: 8, fontWeight: 'bold', color: '#4f46e5', textAlign: 'center', fontFamily: 'Inter' }, 
                        days: { fontSize: 10, color: '#374151', textAlign: 'center', fontFamily: 'Inter' }, 
                        grid: { 
                            borderColor: '#e5e7eb', 
                            borderWidth: 1, 
                            borderStyle: 'solid', 
                            cellBackgroundColor: 'transparent', 
                            headerBackgroundColor: '#f9fafb', 
                            borders: { top: true, bottom: true, left: true, right: true, insideHorizontal: true, insideVertical: true, headerSeparator: true } 
                        } 
                    } 
                } 
            }
        ]
    },
    {
        id: 'tpl-mensal-split-esquerda',
        name: 'Calendário Mensal - Esquerda (Seg-Qua)',
        elements: [
            { id: 'spl-mno', type: 'month_number', x: 10, y: 7, w: 12, h: 8, zIndex: 1, style: { fontSize: 32, fontWeight: 'bold', fontFamily: 'Inter', color: '#4f46e5', textAlign: 'right' } },
            { id: 'spl-sep', type: 'lines', x: 24, y: 7, w: 0.5, h: 8, zIndex: 1, style: { color: '#e5e7eb', borderWidth: 1 } },
            { id: 'spl-mna', type: 'month_name', x: 27, y: 7, w: 60, h: 8, zIndex: 1, style: { fontSize: 24, fontWeight: 'bold', fontFamily: 'Inter', color: '#1e1b4b', textTransform: 'uppercase', letterSpacing: 1 } },
            { 
                id: 'spl-cal-lh', 
                type: 'mini_calendar', 
                x: 10, y: 18, w: 80, h: 74, 
                zIndex: 1, 
                style: { 
                    useGlobalStyle: false, 
                    calendarOffset: 0, 
                    fullCalendar: { 
                        showYearInTitle: false, 
                        weekdayFormat: 'short', 
                        splitMode: 'left',
                        startOfWeekOnMonday: true,
                        title: { fontSize: 0, color: 'transparent' }, 
                        weekDays: { fontSize: 8, fontWeight: 'bold', color: '#4f46e5', textAlign: 'center', fontFamily: 'Inter' }, 
                        days: { fontSize: 10, color: '#374151', textAlign: 'center', fontFamily: 'Inter' }, 
                        grid: { 
                            borderColor: '#e5e7eb', 
                            borderWidth: 1, 
                            borderStyle: 'solid', 
                            cellBackgroundColor: 'transparent', 
                            headerBackgroundColor: '#f9fafb', 
                            borders: { top: true, bottom: true, left: true, right: true, insideHorizontal: true, insideVertical: true, headerSeparator: true } 
                        } 
                    } 
                } 
            }
        ]
    },
    {
        id: 'tpl-mensal-split-direita',
        name: 'Calendário Mensal - Direita (Qui-Dom)',
        elements: [
            { id: 'spr-mna', type: 'month_name', x: 10, y: 7, w: 50, h: 8, zIndex: 1, style: { fontSize: 16, fontWeight: 'bold', color: '#9ca3af', fontFamily: 'Inter', textTransform: 'uppercase' } },
            { id: 'spr-yr', type: 'year', x: 60, y: 7, w: 30, h: 8, zIndex: 1, style: { fontSize: 16, fontWeight: 'bold', color: '#9ca3af', fontFamily: 'Inter', textAlign: 'right' } },
            { 
                id: 'spr-cal-rh', 
                type: 'mini_calendar', 
                x: 10, y: 18, w: 80, h: 74, 
                zIndex: 1, 
                style: { 
                    useGlobalStyle: false, 
                    calendarOffset: 0, 
                    fullCalendar: { 
                        showYearInTitle: false, 
                        weekdayFormat: 'short', 
                        splitMode: 'right',
                        startOfWeekOnMonday: true,
                        title: { fontSize: 0, color: 'transparent' }, 
                        weekDays: { fontSize: 8, fontWeight: 'bold', color: '#4f46e5', textAlign: 'center', fontFamily: 'Inter' }, 
                        days: { fontSize: 10, color: '#374151', textAlign: 'center', fontFamily: 'Inter' }, 
                        grid: { 
                            borderColor: '#e5e7eb', 
                            borderWidth: 1, 
                            borderStyle: 'solid', 
                            cellBackgroundColor: 'transparent', 
                            headerBackgroundColor: '#f9fafb', 
                            borders: { top: true, bottom: true, left: true, right: true, insideHorizontal: true, insideVertical: true, headerSeparator: true } 
                        } 
                    } 
                } 
            }
        ]
    }
];
