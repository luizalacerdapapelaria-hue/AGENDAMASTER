
import { LayoutElement } from '../../../types';

export const DAILY_CLASSIC: LayoutElement[] = [
    {
        id: 'd-1',
        type: 'text',
        content: 'PRIORIDADES DO DIA',
        x: 10, y: 10, w: 80, h: 5, zIndex: 1,
        style: { fontSize: 12, fontWeight: 'bold', color: '#4f46e5', textAlign: 'left' }
    },
    {
        id: 'd-2',
        type: 'lines',
        x: 10, y: 16, w: 80, h: 15, zIndex: 1,
        style: { lineSpacing: 25, color: '#e5e7eb' }
    },
    {
        id: 'd-3',
        type: 'text',
        content: 'NOTAS E AGENDAMENTOS',
        x: 10, y: 35, w: 80, h: 5, zIndex: 1,
        style: { fontSize: 12, fontWeight: 'bold', color: '#4f46e5', textAlign: 'left' }
    },
    {
        id: 'd-4',
        type: 'lines',
        x: 10, y: 41, w: 80, h: 45, zIndex: 1,
        style: { lineSpacing: 25, color: '#e5e7eb' }
    },
    {
        id: 'd-5',
        type: 'box',
        x: 10, y: 88, w: 80, h: 8, zIndex: 0,
        style: { backgroundColor: '#f9fafb', borderRadius: 5, borderWidth: 0 }
    },
    {
        id: 'd-6',
        type: 'text',
        content: 'GRATIDÃO DO DIA:',
        x: 12, y: 90, w: 76, h: 4, zIndex: 1,
        style: { fontSize: 9, fontStyle: 'italic', color: '#9ca3af' }
    }
];

export const DAILY_FINANCIAL: LayoutElement[] = [
    {
        id: 'df-1',
        type: 'text',
        content: 'CONTROLE DIÁRIO DE GASTOS',
        x: 10, y: 10, w: 80, h: 6, zIndex: 1,
        style: { fontSize: 14, fontWeight: 'bold', color: '#059669', textAlign: 'center' }
    },
    {
        id: 'df-2',
        type: 'table',
        x: 10, y: 20, w: 80, h: 50, zIndex: 1,
        style: { 
            table: { 
                rows: 10, cols: 2, headerRow: true, 
                textStyle: { fontSize: 9 }
            } 
        }
    },
    {
        id: 'df-3',
        type: 'text',
        content: 'TOTAL DO DIA:',
        x: 10, y: 72, w: 40, h: 5, zIndex: 1,
        style: { fontSize: 10, fontWeight: 'bold' }
    },
    {
        id: 'df-4',
        type: 'lines',
        x: 50, y: 72, w: 40, h: 5, zIndex: 1,
        style: { color: '#ccc' }
    },
    {
        id: 'df-5',
        type: 'box',
        x: 10, y: 80, w: 80, h: 15, zIndex: 0,
        style: { borderWidth: 1, borderColor: '#d1fae5', borderRadius: 8 }
    },
    {
        id: 'df-6',
        type: 'text',
        content: 'OBSERVAÇÕES FINANCEIRAS:',
        x: 12, y: 82, w: 76, h: 4, zIndex: 1,
        style: { fontSize: 9, fontWeight: 'bold', color: '#059669' }
    }
];

export const DAILY_STUDY: LayoutElement[] = [
    {
        id: 'ds-1',
        type: 'text',
        content: 'CRONOGRAMA DO DIA',
        x: 10, y: 10, w: 80, h: 6, zIndex: 1,
        style: { fontSize: 14, fontWeight: 'bold', color: '#2563eb', textAlign: 'center' }
    },
    {
        id: 'ds-2',
        type: 'table',
        x: 10, y: 20, w: 80, h: 40, zIndex: 1,
        style: { 
            table: { 
                rows: 8, cols: 3, headerRow: true, 
                textStyle: { fontSize: 8 }
            } 
        }
    },
    {
        id: 'ds-3',
        type: 'text',
        content: 'MATÉRIAS PARA REVISAR:',
        x: 10, y: 62, w: 80, h: 5, zIndex: 1,
        style: { fontSize: 10, fontWeight: 'bold' }
    },
    {
        id: 'ds-4',
        type: 'lines',
        x: 10, y: 68, w: 80, h: 10, zIndex: 1,
        style: { lineSpacing: 25, color: '#e5e7eb' }
    },
    {
        id: 'ds-5',
        type: 'box',
        x: 10, y: 80, w: 80, h: 15, zIndex: 0,
        style: { borderWidth: 1, borderColor: '#dbeafe', borderRadius: 8 }
    },
    {
        id: 'ds-6',
        type: 'text',
        content: 'NOTAS DE ESTUDO:',
        x: 12, y: 82, w: 76, h: 4, zIndex: 1,
        style: { fontSize: 9, fontWeight: 'bold', color: '#2563eb' }
    }
];

export const DAILY_HEALTH: LayoutElement[] = [
    {
        id: 'dh-1',
        type: 'text',
        content: 'MEU BEM-ESTAR HOJE',
        x: 10, y: 10, w: 80, h: 6, zIndex: 1,
        style: { fontSize: 14, fontWeight: 'bold', color: '#e11d48', textAlign: 'center' }
    },
    {
        id: 'dh-2',
        type: 'text',
        content: 'HIDRATAÇÃO (COPOS):',
        x: 10, y: 20, w: 40, h: 5, zIndex: 1,
        style: { fontSize: 10, fontWeight: 'bold' }
    },
    {
        id: 'dh-3',
        type: 'circle',
        x: 50, y: 20, w: 5, h: 5, zIndex: 1,
        style: { borderWidth: 1, borderColor: '#fda4af' }
    },
    {
        id: 'dh-4',
        type: 'circle',
        x: 57, y: 20, w: 5, h: 5, zIndex: 1,
        style: { borderWidth: 1, borderColor: '#fda4af' }
    },
    {
        id: 'dh-5',
        type: 'circle',
        x: 64, y: 20, w: 5, h: 5, zIndex: 1,
        style: { borderWidth: 1, borderColor: '#fda4af' }
    },
    {
        id: 'dh-6',
        type: 'circle',
        x: 71, y: 20, w: 5, h: 5, zIndex: 1,
        style: { borderWidth: 1, borderColor: '#fda4af' }
    },
    {
        id: 'dh-7',
        type: 'text',
        content: 'REFEIÇÕES:',
        x: 10, y: 30, w: 80, h: 5, zIndex: 1,
        style: { fontSize: 10, fontWeight: 'bold' }
    },
    {
        id: 'dh-8',
        type: 'table',
        x: 10, y: 36, w: 80, h: 30, zIndex: 1,
        style: { table: { rows: 4, cols: 2, headerRow: false, textStyle: { fontSize: 9 } } }
    },
    {
        id: 'dh-9',
        type: 'text',
        content: 'HUMOR:',
        x: 10, y: 70, w: 20, h: 5, zIndex: 1,
        style: { fontSize: 10, fontWeight: 'bold' }
    },
    {
        id: 'dh-10',
        type: 'icon',
        x: 30, y: 70, w: 8, h: 8, zIndex: 1,
        style: { iconName: 'Smile', color: '#fb7185' }
    },
    {
        id: 'dh-11',
        type: 'lines',
        x: 10, y: 80, w: 80, h: 15, zIndex: 1,
        style: { lineSpacing: 25, color: '#fecdd3' }
    }
];
