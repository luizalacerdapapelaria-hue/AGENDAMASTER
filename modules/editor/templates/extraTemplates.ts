
import { LayoutElement } from '../../../types';

export const NOTEBOOK_TEMPLATES = [
    {
        id: 'nb-pautado',
        name: 'Caderno Pautado Clássico',
        elements: [
            // Cabeçalho editorial delicado
            { id: 'nb-p-box', type: 'box' as const, x: 8, y: 5, w: 84, h: 8, zIndex: 0, style: { backgroundColor: '#faf6f4', borderColor: '#f5ded9', borderWidth: 1, borderRadius: 8 } },
            { id: 'nb-p-title', type: 'text' as const, content: 'Assunto / Tema: ________________________________', x: 10, y: 7.2, w: 52, h: 4, zIndex: 1, style: { fontSize: 8.5, fontWeight: 'bold', fontFamily: 'Montserrat', color: '#881337', letterSpacing: 0.5 } },
            { id: 'nb-p-date', type: 'text' as const, content: 'Data: ___/___/______', x: 63, y: 7.2, w: 18, h: 4, zIndex: 1, style: { fontSize: 8, fontWeight: 'normal', fontFamily: 'Montserrat', color: '#9d174d', textAlign: 'right' } },
            { id: 'nb-p-pag', type: 'text' as const, content: 'Pág: ____', x: 82, y: 7.2, w: 8, h: 4, zIndex: 1, style: { fontSize: 8, fontWeight: 'bold', fontFamily: 'Montserrat', color: '#be185d', textAlign: 'right' } },
            // Linha guia de margem vertical (estilo encadernação clássica de caderno)
            { id: 'nb-p-margin', type: 'lines' as const, x: 18, y: 15, w: 0.5, h: 79, zIndex: 1, style: { color: '#fbcfe8', borderWidth: 0.8 } },
            // Pauta principal de escrita espaçosa e confortável (lineSpacing: 24)
            { 
                id: 'nb-p-lines', 
                type: 'lines' as const, 
                x: 8, y: 15, w: 84, h: 79, zIndex: 1, 
                style: { 
                    lineSpacing: 24, 
                    color: '#e2e8f0', 
                    borderColor: '#e2e8f0',
                    borderWidth: 0.7 
                } 
            }
        ]
    },
    {
        id: 'nb-pontilhado',
        name: 'Caderno Pontilhado • Bullet Journal',
        elements: [
            // Cabeçalho Bullet Journal
            { id: 'nb-dot-hdr', type: 'box' as const, x: 8, y: 5, w: 84, h: 7, zIndex: 0, style: { backgroundColor: '#f8fafc', borderColor: '#e2e8f0', borderWidth: 1, borderRadius: 8 } },
            { id: 'nb-dot-title', type: 'text' as const, content: 'Tópico / Projeto: ______________________________', x: 10, y: 6.8, w: 55, h: 3.5, zIndex: 1, style: { fontSize: 8.5, fontWeight: 'bold', fontFamily: 'Montserrat', color: '#334155', letterSpacing: 0.5 } },
            { id: 'nb-dot-date', type: 'text' as const, content: 'Data: ___/___/______', x: 67, y: 6.8, w: 23, h: 3.5, zIndex: 1, style: { fontSize: 8, fontWeight: 'medium', fontFamily: 'Montserrat', color: '#64748b', textAlign: 'right' } },
            // Grid de Pontos Nítido de 5mm (Bullet Journal autêntico)
            { 
                id: 'nb-dot-grid', 
                type: 'note_grid' as const, 
                x: 8, y: 14, w: 84, h: 76, zIndex: 1, 
                style: { 
                    variant: 'dots', 
                    gridSize: 18, 
                    color: '#94a3b8', 
                    opacity: 0.85, 
                    borderWidth: 1 
                } 
            },
            // Legenda de Bullet Journal no rodapé
            { id: 'nb-dot-key-box', type: 'box' as const, x: 8, y: 91.5, w: 84, h: 4.5, zIndex: 0, style: { backgroundColor: '#f1f5f9', borderColor: '#e2e8f0', borderWidth: 1, borderRadius: 6 } },
            { id: 'nb-dot-key', type: 'text' as const, content: '• Tarefa   |   > Migrado   |   ✓ Concluído   |   - Nota / Ideia   |   ★ Prioridade', x: 10, y: 92.5, w: 80, h: 2.8, zIndex: 1, style: { fontSize: 7, fontWeight: 'bold', fontFamily: 'Montserrat', color: '#475569', textAlign: 'center', letterSpacing: 0.5 } }
        ]
    },
    {
        id: 'nb-quadriculado',
        name: 'Caderno Quadriculado (Grid 5mm)',
        elements: [
            // Cabeçalho Quadriculado
            { id: 'nb-grid-hdr', type: 'box' as const, x: 8, y: 5, w: 84, h: 7, zIndex: 0, style: { backgroundColor: '#f8fafc', borderColor: '#cbd5e1', borderWidth: 1, borderRadius: 8 } },
            { id: 'nb-grid-title', type: 'text' as const, content: 'Título / Projeto: ______________________________', x: 10, y: 6.8, w: 55, h: 3.5, zIndex: 1, style: { fontSize: 8.5, fontWeight: 'bold', fontFamily: 'Montserrat', color: '#1e293b', letterSpacing: 0.5 } },
            { id: 'nb-grid-date', type: 'text' as const, content: 'Data: ___/___/______', x: 67, y: 6.8, w: 23, h: 3.5, zIndex: 1, style: { fontSize: 8, fontWeight: 'medium', fontFamily: 'Montserrat', color: '#64748b', textAlign: 'right' } },
            // Grid Quadriculado de 5mm
            { 
                id: 'nb-grid-mesh', 
                type: 'note_grid' as const, 
                x: 8, y: 14, w: 84, h: 81, zIndex: 1, 
                style: { 
                    variant: 'squared', 
                    gridSize: 18, 
                    color: '#cbd5e1', 
                    opacity: 0.85, 
                    borderWidth: 0.75 
                } 
            }
        ]
    },
    {
        id: 'nb-cornell',
        name: 'Método Cornell (Estudos & Anotações)',
        elements: [
            // Cabeçalho
            { id: 'cor-hdr', type: 'box' as const, x: 8, y: 5, w: 84, h: 7, zIndex: 0, style: { backgroundColor: '#fdf2f8', borderColor: '#fbcfe8', borderWidth: 1, borderRadius: 8 } },
            { id: 'cor-t-topic', type: 'text' as const, content: 'Matéria / Tópico: ______________________________', x: 10, y: 6.8, w: 55, h: 3.5, zIndex: 1, style: { fontSize: 8.5, fontWeight: 'bold', fontFamily: 'Montserrat', color: '#9d174d' } },
            { id: 'cor-t-date', type: 'text' as const, content: 'Data: ___/___/______', x: 67, y: 6.8, w: 23, h: 3.5, zIndex: 1, style: { fontSize: 8, fontWeight: 'medium', fontFamily: 'Montserrat', color: '#be185d', textAlign: 'right' } },
            // Coluna Esquerda: Palavras-chave & Perguntas
            { id: 'cor-left-box', type: 'box' as const, x: 8, y: 14, w: 25, h: 63, zIndex: 0, style: { backgroundColor: '#fff1f2', borderColor: '#fecdd3', borderWidth: 1, borderRadius: 8 } },
            { id: 'cor-left-title', type: 'text' as const, content: 'TÓPICOS / PERGUNTAS', x: 9.5, y: 15.5, w: 22, h: 3, zIndex: 1, style: { fontSize: 6.5, fontWeight: 'bold', color: '#9d174d', fontFamily: 'Montserrat', letterSpacing: 0.5 } },
            { id: 'cor-left-lines', type: 'lines' as const, x: 9.5, y: 19.5, w: 22, h: 56, zIndex: 1, style: { lineSpacing: 24, color: '#fecdd3', borderWidth: 0.6 } },
            // Coluna Direita: Anotações de Aula
            { id: 'cor-right-box', type: 'box' as const, x: 35, y: 14, w: 57, h: 63, zIndex: 0, style: { backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderWidth: 1, borderRadius: 8 } },
            { id: 'cor-right-title', type: 'text' as const, content: 'ANOTAÇÕES DE AULA / CONCEITOS', x: 37, y: 15.5, w: 53, h: 3, zIndex: 1, style: { fontSize: 6.5, fontWeight: 'bold', color: '#475569', fontFamily: 'Montserrat', letterSpacing: 0.5 } },
            { id: 'cor-right-lines', type: 'lines' as const, x: 37, y: 19.5, w: 53, h: 56, zIndex: 1, style: { lineSpacing: 24, color: '#e2e8f0', borderWidth: 0.6 } },
            // Caixa Inferior: Resumo / Conclusões
            { id: 'cor-sum-box', type: 'box' as const, x: 8, y: 79, w: 84, h: 16, zIndex: 0, style: { borderWidth: 1, borderColor: '#bbf7d0', borderRadius: 8, backgroundColor: '#f0fdf4' } },
            { id: 'cor-summary-tt', type: 'text' as const, content: 'RESUMO / SÍNTESE DO APRENDIZADO:', x: 10, y: 80.5, w: 80, h: 3, zIndex: 1, style: { fontSize: 7, fontWeight: 'bold', color: '#166534', fontFamily: 'Montserrat', letterSpacing: 0.8 } },
            { id: 'cor-summary-lines', type: 'lines' as const, x: 10, y: 84, w: 80, h: 9.5, zIndex: 1, style: { lineSpacing: 22, color: '#bbf7d0', borderWidth: 0.6 } }
        ]
    },
    {
        id: 'nb-horarios',
        name: 'Cronograma Diário de Estudos & Rotina',
        elements: [
            { id: 'nb-h-t', type: 'text' as const, content: 'CRONOGRAMA DO DIA', x: 8, y: 5.5, w: 84, h: 4, zIndex: 1, style: { fontSize: 11, fontWeight: 'bold', textAlign: 'center', color: '#6b21a8', fontFamily: 'Montserrat', letterSpacing: 1 } },
            { 
                id: 'nb-h-lines', 
                type: 'lines' as const, 
                x: 8, y: 12, w: 84, h: 82, zIndex: 1, 
                style: { 
                    lineSpacing: 22, 
                    color: '#e9d5ff', 
                    borderWidth: 0.6,
                    showTimes: true,
                    startHour: 7,
                    endHour: 21,
                    timeInterval: 60,
                    timeFontSize: 7.5,
                    timeColor: '#6b21a8',
                    timeColumnWidth: 28
                } 
            }
        ]
    },
    {
        id: 'nb-liso',
        name: 'Caderno Liso (Folha em Branco)',
        elements: []
    }
];

export const DEVOTIONAL_TEMPLATES = [
    {
        id: 'dev-diario',
        name: 'Estudo Bíblico Diário & Devocional',
        elements: [
            { id: 'dev-h', type: 'text' as const, content: 'Meu Tempo com Deus', x: 10, y: 4.5, w: 80, h: 5.5, zIndex: 1, style: { fontSize: 16, fontWeight: 'bold', fontFamily: 'Playfair Display', color: '#4338ca', textAlign: 'center' } },
            
            { id: 'dev-box1', type: 'box' as const, x: 8, y: 12, w: 84, h: 14, zIndex: 0, style: { borderWidth: 1, borderColor: '#fbcfe8', borderRadius: 8, backgroundColor: '#fdf2f8' } },
            { id: 'dev-t1', type: 'text' as const, content: 'LEITURA BÍBLICA DO DIA:', x: 10.5, y: 13.5, w: 79, h: 3, zIndex: 1, style: { fontSize: 7.5, fontWeight: 'bold', color: '#be185d', fontFamily: 'Montserrat', letterSpacing: 0.8 } },
            { id: 'dev-lines-leitura', type: 'lines' as const, x: 10.5, y: 17.5, w: 79, h: 7, zIndex: 1, style: { lineSpacing: 22, color: '#fbcfe8', borderWidth: 0.6 } },

            { id: 'dev-box2', type: 'box' as const, x: 8, y: 28, w: 84, h: 31, zIndex: 0, style: { borderWidth: 1, borderColor: '#c7d2fe', borderRadius: 8, backgroundColor: '#f8fafc' } },
            { id: 'dev-t2', type: 'text' as const, content: 'O QUE O SENHOR ME FALOU HOJE? (ENSINAMENTOS & APLICAÇÃO)', x: 10.5, y: 29.5, w: 79, h: 3, zIndex: 1, style: { fontSize: 7.5, fontWeight: 'bold', color: '#4338ca', fontFamily: 'Montserrat', letterSpacing: 0.8 } },
            { id: 'dev-lines-notas', type: 'lines' as const, x: 10.5, y: 34, w: 79, h: 23, zIndex: 1, style: { lineSpacing: 22, color: '#e0e7ff', borderWidth: 0.6 } },

            { id: 'dev-box3', type: 'box' as const, x: 8, y: 61, w: 84, h: 22, zIndex: 0, style: { borderWidth: 1, borderColor: '#bae6fd', borderRadius: 8, backgroundColor: '#f0f9ff' } },
            { id: 'dev-t3', type: 'text' as const, content: 'MINHA ORAÇÃO, INTERCESSÃO & GRATIDÃO:', x: 10.5, y: 62.5, w: 79, h: 3, zIndex: 1, style: { fontSize: 7.5, fontWeight: 'bold', color: '#0369a1', fontFamily: 'Montserrat', letterSpacing: 0.8 } },
            { id: 'dev-lines-oracao', type: 'lines' as const, x: 10.5, y: 67, w: 79, h: 14, zIndex: 1, style: { lineSpacing: 22, color: '#bae6fd', borderWidth: 0.6 } },

            { id: 'dev-t-footer', type: 'text' as const, content: 'VERSÍCULO PARA MEMORIZAR: __________________________________________________', x: 8, y: 86, w: 84, h: 4, zIndex: 1, style: { fontSize: 7.5, fontStyle: 'italic', color: '#4b5563', fontFamily: 'Playfair Display' } }
        ]
    }
];

