
import { LayoutElement } from '../../../types';

export const NOTEBOOK_TEMPLATES = [
    {
        id: 'nb-pautado',
        name: 'Pautado Padrão',
        elements: [
            { id: 'nb-text1', type: 'text' as const, content: 'Assunto:', x: 10, y: 8, w: 50, h: 5, zIndex: 1, style: { fontSize: 12, fontWeight: 'bold', fontFamily: 'Inter', color: '#374151' } },
            { id: 'nb-text2', type: 'text' as const, content: 'Data: ___/___/___', x: 70, y: 8, w: 20, h: 5, zIndex: 1, style: { fontSize: 10, fontWeight: 'normal', fontFamily: 'Inter', color: '#9ca3af', textAlign: 'right' } },
            { 
                id: 'nb-table-lines', 
                type: 'table' as const, 
                x: 10, y: 15, w: 80, h: 75, zIndex: 1, 
                style: { 
                    table: { 
                        rows: 25, 
                        cols: 1, 
                        headerRow: false, 
                        borders: { top: false, bottom: true, left: false, right: false, insideHorizontal: true, insideVertical: false },
                        columnWidths: [100],
                        data: Array(25).fill(['']),
                        textStyle: { fontSize: 10, color: '#e5e7eb', textAlign: 'left', verticalAlign: 'bottom' }
                    } 
                } 
            }
        ]
    },
    {
        id: 'nb-horarios',
        name: 'Cronograma Diário',
        elements: [
            { id: 'nb-h-t', type: 'text' as const, content: 'Planejamento do Dia', x: 10, y: 6, w: 80, h: 6, zIndex: 1, style: { fontSize: 16, fontWeight: 'bold', textAlign: 'center', color: '#4f46e5' } },
            { 
                id: 'nb-h-table', 
                type: 'table' as const, 
                x: 10, y: 15, w: 80, h: 75, zIndex: 1, 
                style: { 
                    table: { 
                        rows: 15, 
                        cols: 2, 
                        headerRow: true, 
                        borders: { top: true, bottom: true, left: true, right: true, insideHorizontal: true, insideVertical: true, headerSeparator: true },
                        columnWidths: [20, 80],
                        data: [
                            ['Hora', 'Compromisso / Atividade'],
                            ['07:00', ''], ['08:00', ''], ['09:00', ''], ['10:00', ''], ['11:00', ''],
                            ['12:00', ''], ['13:00', ''], ['14:00', ''], ['15:00', ''], ['16:00', ''],
                            ['17:00', ''], ['18:00', ''], ['19:00', ''], ['20:00', '']
                        ],
                        textStyle: { fontSize: 9, color: '#4b5563', textAlign: 'left', verticalAlign: 'middle' },
                        colStyles: {
                            0: { textAlign: 'center', fontWeight: 'bold', color: '#6366f1', backgroundColor: '#f8fafc' }
                        }
                    } 
                } 
            }
        ]
    },
    {
        id: 'nb-cornell',
        name: 'Método Cornell',
        elements: [
            { id: 'cor-t1', type: 'text' as const, content: 'Tópicos / Perguntas', x: 10, y: 10, w: 25, h: 5, zIndex: 1, style: { fontSize: 9, fontWeight: 'bold', color: '#6366f1', textTransform: 'uppercase' } },
            { id: 'cor-t2', type: 'text' as const, content: 'Notas de Aula', x: 40, y: 10, w: 50, h: 5, zIndex: 1, style: { fontSize: 9, fontWeight: 'bold', color: '#4b5563', textTransform: 'uppercase' } },
            { 
                id: 'cor-main-table', 
                type: 'table' as const, 
                x: 10, y: 15, w: 80, h: 65, zIndex: 1, 
                style: { 
                    table: { 
                        rows: 1, cols: 2, headerRow: false,
                        borders: { top: true, bottom: true, left: true, right: true, insideHorizontal: false, insideVertical: true },
                        columnWidths: [30, 70],
                        data: [['', '']],
                        textStyle: { verticalAlign: 'top' }
                    } 
                } 
            },
            { id: 'cor-sum-box', type: 'box' as const, x: 10, y: 82, w: 80, h: 12, zIndex: 0, style: { borderWidth: 1, borderColor: '#e5e7eb', backgroundColor: '#f9fafb' } },
            { id: 'cor-summary', type: 'text' as const, content: 'RESUMO:', x: 12, y: 84, w: 76, h: 4, zIndex: 1, style: { fontSize: 9, fontWeight: 'bold', color: '#4b5563' } }
        ]
    },
    {
        id: 'nb-pontilhado',
        name: 'Bullet Journal',
        elements: [
            { id: 'nb3', type: 'note_grid' as const, x: 10, y: 10, w: 80, h: 80, zIndex: 1, style: { variant: 'dots', color: '#d1d5db', opacity: 0.5 } }
        ]
    }
];

export const DEVOTIONAL_TEMPLATES = [
    {
        id: 'dev-diario',
        name: 'Estudo Bíblico Diário',
        elements: [
            { id: 'dev-h', type: 'text' as const, content: 'Meu Tempo com Deus', x: 10, y: 5, w: 80, h: 8, zIndex: 1, style: { fontSize: 24, fontWeight: 'bold', fontFamily: 'Inter', color: '#4338ca', textAlign: 'center' } },
            
            { id: 'dev-box1', type: 'box' as const, x: 10, y: 15, w: 80, h: 15, zIndex: 0, style: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, backgroundColor: '#fdf2f8' } },
            { id: 'dev-t1', type: 'text' as const, content: 'Leitura do Dia:', x: 13, y: 18, w: 74, h: 4, zIndex: 1, style: { fontSize: 10, fontWeight: 'bold', color: '#be185d' } },
            { 
                id: 'dev-table-leitura', 
                type: 'table' as const, 
                x: 13, y: 22, w: 74, h: 6, zIndex: 1, 
                style: { 
                    table: { 
                        rows: 1, cols: 1, headerRow: false,
                        borders: { bottom: true },
                        columnWidths: [100],
                        data: [['']],
                        textStyle: { fontSize: 10, color: '#fbcfe8', verticalAlign: 'bottom' }
                    } 
                } 
            },

            { id: 'dev-box2', type: 'box' as const, x: 10, y: 32, w: 80, h: 25, zIndex: 0, style: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8 } },
            { id: 'dev-t2', type: 'text' as const, content: 'O que o Senhor me falou hoje?', x: 13, y: 35, w: 74, h: 4, zIndex: 1, style: { fontSize: 10, fontWeight: 'bold', color: '#4338ca' } },
            { 
                id: 'dev-table-notas', 
                type: 'table' as const, 
                x: 13, y: 40, w: 74, h: 15, zIndex: 1, 
                style: { 
                    table: { 
                        rows: 5, cols: 1, headerRow: false,
                        borders: { bottom: true, insideHorizontal: true },
                        columnWidths: [100],
                        data: [[''], [''], [''], [''], ['']],
                        textStyle: { fontSize: 10, color: '#e5e7eb', verticalAlign: 'bottom' }
                    } 
                } 
            },

            { id: 'dev-box3', type: 'box' as const, x: 10, y: 60, w: 80, h: 18, zIndex: 0, style: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, backgroundColor: '#f0f9ff' } },
            { id: 'dev-t3', type: 'text' as const, content: 'Minha Oração / Gratidão:', x: 13, y: 63, w: 74, h: 4, zIndex: 1, style: { fontSize: 10, fontWeight: 'bold', color: '#0369a1' } },
            { 
                id: 'dev-table-oracao', 
                type: 'table' as const, 
                x: 13, y: 67, w: 74, h: 9, zIndex: 1, 
                style: { 
                    table: { 
                        rows: 3, cols: 1, headerRow: false,
                        borders: { bottom: true, insideHorizontal: true },
                        columnWidths: [100],
                        data: [[''], [''], ['']],
                        textStyle: { fontSize: 10, color: '#bae6fd', verticalAlign: 'bottom' }
                    } 
                } 
            },

            { id: 'dev-t-footer', type: 'text' as const, content: 'Memorizar: __________________________________________________', x: 10, y: 85, w: 80, h: 5, zIndex: 1, style: { fontSize: 9, italic: true, color: '#6b7280' } }
        ]
    }
];

