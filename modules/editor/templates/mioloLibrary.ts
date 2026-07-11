
import { LayoutElement } from '../../../types';

export interface MioloTemplate {
    id: string;
    name: string;
    description: string;
    category: 'minimalista' | 'floral' | 'executivo' | 'criativo' | 'infantil';
    elements: LayoutElement[];
    thumbnail?: string;
}

export const MIOLO_LIBRARY: MioloTemplate[] = [
    {
        id: 'miolo-minimalista-clean',
        name: 'Minimalista Clean',
        description: 'Traços finos, muito espaço em branco e tipografia moderna.',
        category: 'minimalista',
        elements: [
            {
                id: 'm-1', type: 'text', content: 'FOCO DO DIA',
                x: 10, y: 10, w: 80, h: 5, zIndex: 1,
                style: { fontSize: 10, fontWeight: 'bold', color: '#9ca3af', letterSpacing: 2 }
            },
            {
                id: 'm-2', type: 'box', x: 10, y: 16, w: 80, h: 10, zIndex: 0,
                style: { borderWidth: 1, borderColor: '#f3f4f6', borderRadius: 0 }
            },
            {
                id: 'm-3', type: 'lines', x: 10, y: 30, w: 80, h: 60, zIndex: 1,
                style: { lineSpacing: 30, color: '#f3f4f6' }
            }
        ]
    },
    {
        id: 'miolo-executivo-navy',
        name: 'Executivo Navy',
        description: 'Design sóbrio com tons de azul marinho e estrutura organizada.',
        category: 'executivo',
        elements: [
            {
                id: 'e-1', type: 'box', x: 0, y: 0, w: 100, h: 15, zIndex: 0,
                style: { backgroundColor: '#1e3a8a', borderWidth: 0 }
            },
            {
                id: 'e-2', type: 'text', content: 'PLANEJAMENTO DIÁRIO',
                x: 10, y: 5, w: 80, h: 5, zIndex: 1,
                style: { fontSize: 14, fontWeight: 'bold', color: '#ffffff', textAlign: 'center' }
            },
            {
                id: 'e-3', type: 'table', x: 10, y: 20, w: 80, h: 70, zIndex: 1,
                style: { table: { rows: 12, cols: 2, headerRow: true, textStyle: { fontSize: 9 } } }
            }
        ]
    },
    {
        id: 'miolo-floral-delicado',
        name: 'Floral Delicado',
        description: 'Cores pastéis, bordas arredondadas e fontes cursivas.',
        category: 'floral',
        elements: [
            {
                id: 'f-1', type: 'text', content: 'Um dia maravilhoso...',
                x: 10, y: 10, w: 80, h: 8, zIndex: 1,
                style: { fontSize: 18, fontFamily: 'Georgia', fontStyle: 'italic', color: '#db2777', textAlign: 'center' }
            },
            {
                id: 'f-2', type: 'box', x: 10, y: 20, w: 80, h: 60, zIndex: 0,
                style: { borderWidth: 2, borderColor: '#fbcfe8', borderRadius: 20, backgroundColor: '#fff1f2' }
            },
            {
                id: 'f-3', type: 'lines', x: 15, y: 25, w: 70, h: 50, zIndex: 1,
                style: { lineSpacing: 30, color: '#fbcfe8' }
            }
        ]
    },
    {
        id: 'miolo-criativo-pop',
        name: 'Criativo Pop',
        description: 'Cores vibrantes, formas geométricas e design dinâmico.',
        category: 'criativo',
        elements: [
            {
                id: 'c-1', type: 'box', x: 5, y: 5, w: 40, h: 40, zIndex: 0,
                style: { backgroundColor: '#fef08a', borderWidth: 0, borderRadius: 10 }
            },
            {
                id: 'c-2', type: 'box', x: 55, y: 5, w: 40, h: 40, zIndex: 0,
                style: { backgroundColor: '#bae6fd', borderWidth: 0, borderRadius: 10 }
            },
            {
                id: 'c-3', type: 'text', content: 'IDEIAS', x: 10, y: 10, w: 30, h: 5, zIndex: 1,
                style: { fontSize: 12, fontWeight: '900', color: '#854d0e' }
            },
            {
                id: 'c-4', type: 'text', content: 'TAREFAS', x: 60, y: 10, w: 30, h: 5, zIndex: 1,
                style: { fontSize: 12, fontWeight: '900', color: '#075985' }
            }
        ]
    }
];
