import { IntroPage } from '../../../types';

export const INTRO_TEMPLATES: IntroPage[] = [
    {
        id: 'tpl-dados-pessoais',
        name: 'Dados Pessoais (Pastel Botânico)',
        elements: [
            // Aquarelas Orgânicas e Moldura de Fundo em Tons Pastéis
            { id: 'dp-blob-top', type: 'vector_shape', name: 'Mancha Aquarela Rosé', x: 2, y: 1, w: 42, h: 22, zIndex: 0, style: { shapeType: 'organic_blob_editorial', backgroundColor: '#fce7ec', borderColor: 'transparent', borderWidth: 0, fillOpacity: 0.65 } },
            { id: 'dp-blob-bot', type: 'vector_shape', name: 'Mancha Aquarela Sálvia', x: 56, y: 76, w: 42, h: 22, zIndex: 0, style: { shapeType: 'organic_blob_elongated', backgroundColor: '#e6f2eb', borderColor: 'transparent', borderWidth: 0, fillOpacity: 0.65 } },
            { id: 'dp-corner-tl', type: 'vector_shape', name: 'Ramo Botânico Superior', x: 6, y: 3, w: 16, h: 10, zIndex: 2, style: { shapeType: 'botanical_olive_branch', backgroundColor: 'transparent', borderColor: '#c97a8e', borderWidth: 1.2 } },
            { id: 'dp-corner-tr', type: 'vector_shape', name: 'Ramo Lavanda Superior', x: 78, y: 3, w: 16, h: 10, zIndex: 2, style: { shapeType: 'botanical_lavender_sprig', backgroundColor: 'transparent', borderColor: '#7c9a87', borderWidth: 1.2 } },

            // Cabeçalho Artístico (Script + Serif Editorial + Divisor Floral)
            { id: 'dp-sub-script', type: 'text', name: 'Subtítulo Caligráfico', content: 'Esta agenda pertence a', x: 15, y: 3.5, w: 70, h: 4.5, zIndex: 2, style: { fontSize: 15, fontWeight: 'normal', textAlign: 'center', verticalAlign: 'middle', color: '#b56576', fontFamily: 'Dancing Script' } },
            { id: 'dp-title', type: 'text', name: 'Título Dados Pessoais', content: 'DADOS PESSOAIS', x: 10, y: 7.5, w: 80, h: 5.5, zIndex: 2, style: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', verticalAlign: 'middle', color: '#6d4352', fontFamily: 'Playfair Display', textTransform: 'uppercase', letterSpacing: 2.5 } },
            { id: 'dp-div-top', type: 'vector_shape', name: 'Divisor Botânico', x: 32, y: 13, w: 36, h: 3, zIndex: 2, style: { shapeType: 'divider_botanical_sprig', backgroundColor: 'transparent', borderColor: '#d48c9e', borderWidth: 1 } },

            // Bloco 1: Identificação Pessoal (Card Rosa Quartzo Pastel)
            { id: 'dp-box1', type: 'box', name: 'Card Rosa Pastel', x: 7, y: 17, w: 86, h: 31, zIndex: 0, style: { borderWidth: 1, borderColor: '#f3c6d1', borderRadius: 12, backgroundColor: '#fdf2f4' } },
            { id: 'dp-star1', type: 'vector_shape', name: 'Detalhe Estrela', x: 87, y: 18.5, w: 4, h: 3, zIndex: 2, style: { shapeType: 'ornament_editorial_starburst', backgroundColor: '#eab3c1', borderColor: '#b56576', borderWidth: 0.8 } },
            { id: 'dp-lbl-nome', type: 'text', name: 'Label Nome', content: 'NOME:', x: 10, y: 19.5, w: 18, h: 4, zIndex: 1, style: { fontSize: 8, fontWeight: 'bold', fontFamily: 'Montserrat', color: '#8c4f60', textAlign: 'left', letterSpacing: 0.5 } },
            { id: 'dp-ln-nome', type: 'lines', name: 'Linha Nome', x: 24, y: 19.5, w: 65, h: 4, zIndex: 1, style: { color: '#eabcc8', borderWidth: 0.6, lineSpacing: 16 } },

            { id: 'dp-lbl-end', type: 'text', name: 'Label Endereço', content: 'ENDEREÇO:', x: 10, y: 25, w: 22, h: 4, zIndex: 1, style: { fontSize: 8, fontWeight: 'bold', fontFamily: 'Montserrat', color: '#8c4f60', textAlign: 'left', letterSpacing: 0.5 } },
            { id: 'dp-ln-end', type: 'lines', name: 'Linha Endereço', x: 30, y: 25, w: 59, h: 4, zIndex: 1, style: { color: '#eabcc8', borderWidth: 0.6, lineSpacing: 16 } },

            { id: 'dp-lbl-cid', type: 'text', name: 'Label Cidade/UF', content: 'CIDADE / UF:', x: 10, y: 30.5, w: 22, h: 4, zIndex: 1, style: { fontSize: 8, fontWeight: 'bold', fontFamily: 'Montserrat', color: '#8c4f60', textAlign: 'left', letterSpacing: 0.5 } },
            { id: 'dp-ln-cid', type: 'lines', name: 'Linha Cidade', x: 31, y: 30.5, w: 32, h: 4, zIndex: 1, style: { color: '#eabcc8', borderWidth: 0.6, lineSpacing: 16 } },
            { id: 'dp-lbl-cep', type: 'text', name: 'Label CEP', content: 'CEP:', x: 65, y: 30.5, w: 9, h: 4, zIndex: 1, style: { fontSize: 8, fontWeight: 'bold', fontFamily: 'Montserrat', color: '#8c4f60', textAlign: 'left', letterSpacing: 0.5 } },
            { id: 'dp-ln-cep', type: 'lines', name: 'Linha CEP', x: 74, y: 30.5, w: 15, h: 4, zIndex: 1, style: { color: '#eabcc8', borderWidth: 0.6, lineSpacing: 16 } },

            { id: 'dp-lbl-tel', type: 'text', name: 'Label Telefone', content: 'TELEFONE / WHATSAPP:', x: 10, y: 36, w: 36, h: 4, zIndex: 1, style: { fontSize: 8, fontWeight: 'bold', fontFamily: 'Montserrat', color: '#8c4f60', textAlign: 'left', letterSpacing: 0.5 } },
            { id: 'dp-ln-tel', type: 'lines', name: 'Linha Telefone', x: 45, y: 36, w: 44, h: 4, zIndex: 1, style: { color: '#eabcc8', borderWidth: 0.6, lineSpacing: 16 } },

            { id: 'dp-lbl-email', type: 'text', name: 'Label E-mail', content: 'E-MAIL / INSTAGRAM:', x: 10, y: 41.5, w: 33, h: 4, zIndex: 1, style: { fontSize: 8, fontWeight: 'bold', fontFamily: 'Montserrat', color: '#8c4f60', textAlign: 'left', letterSpacing: 0.5 } },
            { id: 'dp-ln-email', type: 'lines', name: 'Linha E-mail', x: 42, y: 41.5, w: 47, h: 4, zIndex: 1, style: { color: '#eabcc8', borderWidth: 0.6, lineSpacing: 16 } },

            // Bloco 2: Dados Profissionais (Card Pêssego / Champanhe Pastel)
            { id: 'dp-box2', type: 'box', name: 'Card Champanhe Pastel', x: 7, y: 50.5, w: 86, h: 19.5, zIndex: 0, style: { borderWidth: 1, borderColor: '#ebd4bc', borderRadius: 12, backgroundColor: '#fdf8f3' } },
            { id: 'dp-hdr2', type: 'text', name: 'Subtítulo Comercial', content: 'DADOS PROFISSIONAIS', x: 10, y: 52.5, w: 78, h: 3.5, zIndex: 1, style: { fontSize: 8.5, fontWeight: 'bold', fontFamily: 'Playfair Display', color: '#9c6644', textAlign: 'left', letterSpacing: 1.5 } },
            { id: 'dp-lbl-emp', type: 'text', name: 'Label Empresa', content: 'EMPRESA / PROFISSÃO:', x: 10, y: 57.5, w: 36, h: 4, zIndex: 1, style: { fontSize: 8, fontWeight: 'bold', fontFamily: 'Montserrat', color: '#7f5539', textAlign: 'left', letterSpacing: 0.5 } },
            { id: 'dp-ln-emp', type: 'lines', name: 'Linha Empresa', x: 45, y: 57.5, w: 44, h: 4, zIndex: 1, style: { color: '#e6ccb2', borderWidth: 0.6, lineSpacing: 16 } },
            { id: 'dp-lbl-telc', type: 'text', name: 'Label Tel Comercial', content: 'TEL. COMERCIAL / ENDEREÇO:', x: 10, y: 63, w: 42, h: 4, zIndex: 1, style: { fontSize: 8, fontWeight: 'bold', fontFamily: 'Montserrat', color: '#7f5539', textAlign: 'left', letterSpacing: 0.5 } },
            { id: 'dp-ln-telc', type: 'lines', name: 'Linha Tel Comercial', x: 51, y: 63, w: 38, h: 4, zIndex: 1, style: { color: '#e6ccb2', borderWidth: 0.6, lineSpacing: 16 } },

            // Bloco 3: Saúde e Emergência (Card Verde Sálvia Pastel)
            { id: 'dp-box3', type: 'box', name: 'Card Sálvia Pastel', x: 7, y: 72.5, w: 86, h: 21.5, zIndex: 0, style: { borderWidth: 1, borderColor: '#c3d9cc', borderRadius: 12, backgroundColor: '#f2f7f4' } },
            { id: 'dp-hdr3', type: 'text', name: 'Subtítulo Emergência', content: 'SAÚDE & CONTATO DE EMERGÊNCIA', x: 10, y: 74.5, w: 78, h: 3.5, zIndex: 1, style: { fontSize: 8.5, fontWeight: 'bold', fontFamily: 'Playfair Display', color: '#4a705a', textAlign: 'left', letterSpacing: 1.5 } },
            { id: 'dp-lbl-sang', type: 'text', name: 'Label Tipo Sanguíneo', content: 'TIPO SANGUÍNEO:', x: 10, y: 79.5, w: 28, h: 4, zIndex: 1, style: { fontSize: 8, fontWeight: 'bold', fontFamily: 'Montserrat', color: '#3b5947', textAlign: 'left' } },
            { id: 'dp-ln-sang', type: 'lines', name: 'Linha Tipo Sanguíneo', x: 37, y: 79.5, w: 14, h: 4, zIndex: 1, style: { color: '#b7d1c2', borderWidth: 0.6, lineSpacing: 16 } },
            { id: 'dp-lbl-aler', type: 'text', name: 'Label Alergias', content: 'ALERGIAS:', x: 53, y: 79.5, w: 17, h: 4, zIndex: 1, style: { fontSize: 8, fontWeight: 'bold', fontFamily: 'Montserrat', color: '#3b5947', textAlign: 'left' } },
            { id: 'dp-ln-aler', type: 'lines', name: 'Linha Alergias', x: 70, y: 79.5, w: 19, h: 4, zIndex: 1, style: { color: '#b7d1c2', borderWidth: 0.6, lineSpacing: 16 } },
            { id: 'dp-lbl-emerg', type: 'text', name: 'Label Emergência', content: 'EM CASO DE EMERGÊNCIA AVISAR:', x: 10, y: 85.5, w: 50, h: 4, zIndex: 1, style: { fontSize: 8, fontWeight: 'bold', fontFamily: 'Montserrat', color: '#3b5947', textAlign: 'left' } },
            { id: 'dp-ln-emerg', type: 'lines', name: 'Linha Emergência', x: 59, y: 85.5, w: 30, h: 4, zIndex: 1, style: { color: '#b7d1c2', borderWidth: 0.6, lineSpacing: 16 } }
        ]
    },
    {
        id: 'tpl-calendario-anual',
        name: 'Calendário Anual (Pastel)',
        elements: [
            { id: 'ca-blob', type: 'vector_shape', name: 'Aquarela Topo', x: 20, y: 1, w: 60, h: 12, zIndex: 0, style: { shapeType: 'organic_blob_elongated', backgroundColor: '#fce7ec', borderColor: 'transparent', borderWidth: 0, fillOpacity: 0.7 } },
            { id: 't2', type: 'text', name: 'Título Calendário', content: 'CALENDÁRIO 2026', x: 10, y: 3.5, w: 80, h: 5.5, zIndex: 2, style: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', verticalAlign: 'middle', fontFamily: 'Playfair Display', color: '#6d4352', textTransform: 'uppercase', letterSpacing: 2, lineHeight: 1.2 } },
            { id: 'ca-div', type: 'vector_shape', name: 'Divisor Floral', x: 34, y: 9.2, w: 32, h: 2.5, zIndex: 2, style: { shapeType: 'divider_botanical_sprig', backgroundColor: 'transparent', borderColor: '#c97a8e', borderWidth: 1 } },
            { id: 'c1', type: 'full_calendar', name: 'Calendário Anual', x: 5, y: 13, w: 90, h: 80, zIndex: 1, style: { 
                monthsPerRow: 3,
                gap: 8,
                yearOffset: 0,
                fullCalendar: {
                    title: { fontSize: 8, fontWeight: 'bold', textAlign: 'center', color: '#8c4f60', fontFamily: 'Playfair Display', textTransform: 'uppercase', letterSpacing: 1 },
                    weekDays: { fontSize: 6, fontWeight: 'bold', textAlign: 'center', color: '#b56576', fontFamily: 'Montserrat', textTransform: 'none', letterSpacing: 0 },
                    days: { fontSize: 7, fontWeight: 'normal', textAlign: 'center', color: '#4a3f44', fontFamily: 'Inter', textTransform: 'none', letterSpacing: 0 },
                    grid: { borderColor: '#f3c6d1', borderWidth: 0.5, cellBackgroundColor: 'transparent', headerBackgroundColor: '#fdf2f4', borders: { top: false, bottom: false, left: false, right: false, insideHorizontal: false, insideVertical: false, headerSeparator: true }, borderStyle: 'solid' }
                }
            } }
        ]
    },
    {
        id: 'tpl-calendario-anual-feriados',
        name: 'Calendário Anual + Feriados',
        elements: [
            { id: 'caf-blob', type: 'vector_shape', name: 'Aquarela Rosé', x: 18, y: 0.5, w: 64, h: 10, zIndex: 0, style: { shapeType: 'organic_blob_elongated', backgroundColor: '#fce7ec', borderColor: 'transparent', borderWidth: 0, fillOpacity: 0.65 } },
            { id: 'caf-sprig-l', type: 'vector_shape', name: 'Ramo Esquerdo', x: 10, y: 3, w: 12, h: 5.5, zIndex: 2, style: { shapeType: 'botanical_olive_branch', backgroundColor: 'transparent', borderColor: '#c97a8e', borderWidth: 1 } },
            { id: 'caf-sprig-r', type: 'vector_shape', name: 'Ramo Direito', x: 78, y: 3, w: 12, h: 5.5, zIndex: 2, style: { shapeType: 'botanical_lavender_sprig', backgroundColor: 'transparent', borderColor: '#c97a8e', borderWidth: 1 } },
            { id: 't2-f', type: 'text', name: 'Título Calendário', content: 'CALENDÁRIO 2026', x: 15, y: 3, w: 70, h: 5.5, zIndex: 2, style: { fontSize: 17, fontWeight: 'bold', textAlign: 'center', verticalAlign: 'middle', fontFamily: 'Playfair Display', color: '#6d4352', textTransform: 'uppercase', letterSpacing: 2, lineHeight: 1.2 } },
            { id: 'c1-f', type: 'full_calendar', name: 'Calendário Anual', x: 5, y: 10, w: 90, h: 58, zIndex: 1, style: { 
                monthsPerRow: 3,
                gap: 8,
                yearOffset: 0,
                fullCalendar: {
                    title: { fontSize: 7.5, fontWeight: 'bold', textAlign: 'center', color: '#8c4f60', fontFamily: 'Playfair Display', textTransform: 'uppercase', letterSpacing: 0.8 },
                    weekDays: { fontSize: 5.5, fontWeight: 'bold', textAlign: 'center', color: '#b56576', fontFamily: 'Montserrat', textTransform: 'none', letterSpacing: 0 },
                    days: { fontSize: 6.5, fontWeight: 'normal', textAlign: 'center', color: '#4a3f44', fontFamily: 'Inter', textTransform: 'none', letterSpacing: 0 },
                    grid: { borderColor: '#f3c6d1', borderWidth: 0.5, cellBackgroundColor: 'transparent', headerBackgroundColor: '#fdf2f4', borders: { top: false, bottom: false, left: false, right: false, insideHorizontal: false, insideVertical: false, headerSeparator: true }, borderStyle: 'solid' }
                }
            } },
            // Card Pastel para Feriados Nacionais
            { id: 'caf-fbox', type: 'box', name: 'Card Feriados Pastel', x: 5, y: 70, w: 90, h: 25.5, zIndex: 0, style: { borderWidth: 1, borderColor: '#f3c6d1', borderRadius: 10, backgroundColor: '#fdf2f4' } },
            { id: 'caf-ftitle', type: 'text', name: 'Subtítulo Feriados', content: 'FERIADOS NACIONAIS & DATAS COMEMORATIVAS', x: 8, y: 71.2, w: 84, h: 3, zIndex: 2, style: { fontSize: 7.5, fontWeight: 'bold', fontFamily: 'Montserrat', color: '#9d4e64', textAlign: 'center', letterSpacing: 1.5 } },
            { id: 'h1-f', type: 'holiday_list', name: 'Lista de Feriados', content: '01 de Janeiro - Confraternização Universal\n17 de Fevereiro - Carnaval\n03 de Abril - Paixão de Cristo\n05 de Abril - Páscoa\n21 de Abril - Tiradentes\n01 de Maio - Dia do Trabalho\n04 de Junho - Corpus Christi\n07 de Setembro - Independência do Brasil\n12 de Outubro - Nossa Senhora Aparecida\n02 de Novembro - Finados\n15 de Novembro - Proclamação da República\n20 de Novembro - Dia Nacional de Zumbi e da Consciência Negra\n25 de Dezembro - Natal', x: 8, y: 75, w: 84, h: 19.5, zIndex: 1, style: {
                fontSize: 7,
                fontWeight: 'normal',
                fontFamily: 'Inter',
                color: '#594149',
                textAlign: 'left',
                lineHeight: 1.35,
                columnCount: 2,
                columnGap: 20,
                yearOffset: 0
            } }
        ]
    },
    {
        id: 'tpl-calendario-proximo-ano',
        name: 'Calendário do Próximo Ano',
        elements: [
            { id: 'cpn-blob', type: 'vector_shape', name: 'Aquarela Sálvia', x: 18, y: 0.5, w: 64, h: 10, zIndex: 0, style: { shapeType: 'organic_blob_elongated', backgroundColor: '#e6f2eb', borderColor: 'transparent', borderWidth: 0, fillOpacity: 0.7 } },
            { id: 'cpn-sprig-l', type: 'vector_shape', name: 'Eucalipto Esquerdo', x: 10, y: 3, w: 12, h: 5.5, zIndex: 2, style: { shapeType: 'botanical_eucalyptus_stem', backgroundColor: 'transparent', borderColor: '#5c836d', borderWidth: 1 } },
            { id: 'cpn-sprig-r', type: 'vector_shape', name: 'Oliveira Direita', x: 78, y: 3, w: 12, h: 5.5, zIndex: 2, style: { shapeType: 'botanical_olive_branch', backgroundColor: 'transparent', borderColor: '#5c836d', borderWidth: 1 } },
            { id: 't2-next', type: 'text', name: 'Título Próximo Ano', content: 'CALENDÁRIO 2027', x: 15, y: 3, w: 70, h: 5.5, zIndex: 2, style: { fontSize: 17, fontWeight: 'bold', textAlign: 'center', verticalAlign: 'middle', fontFamily: 'Playfair Display', color: '#3b5947', textTransform: 'uppercase', letterSpacing: 2, lineHeight: 1.2, yearOffset: 1 } },
            { id: 'c1-next', type: 'full_calendar', name: 'Calendário Próximo Ano', x: 5, y: 10, w: 90, h: 58, zIndex: 1, style: { 
                monthsPerRow: 3,
                gap: 8,
                yearOffset: 1,
                fullCalendar: {
                    title: { fontSize: 7.5, fontWeight: 'bold', textAlign: 'center', color: '#4a705a', fontFamily: 'Playfair Display', textTransform: 'uppercase', letterSpacing: 0.8 },
                    weekDays: { fontSize: 5.5, fontWeight: 'bold', textAlign: 'center', color: '#5c836d', fontFamily: 'Montserrat', textTransform: 'none', letterSpacing: 0 },
                    days: { fontSize: 6.5, fontWeight: 'normal', textAlign: 'center', color: '#3d4a41', fontFamily: 'Inter', textTransform: 'none', letterSpacing: 0 },
                    grid: { borderColor: '#c3d9cc', borderWidth: 0.5, cellBackgroundColor: 'transparent', headerBackgroundColor: '#f2f7f4', borders: { top: false, bottom: false, left: false, right: false, insideHorizontal: false, insideVertical: false, headerSeparator: true }, borderStyle: 'solid' }
                }
            } },
            // Card Pastel Verde Sálvia para Feriados do Próximo Ano
            { id: 'cpn-fbox', type: 'box', name: 'Card Feriados Sálvia', x: 5, y: 70, w: 90, h: 25.5, zIndex: 0, style: { borderWidth: 1, borderColor: '#c3d9cc', borderRadius: 10, backgroundColor: '#f2f7f4' } },
            { id: 'cpn-ftitle', type: 'text', name: 'Subtítulo Feriados Próximo Ano', content: 'FERIADOS NACIONAIS & PLANEJAMENTO FUTURO', x: 8, y: 71.2, w: 84, h: 3, zIndex: 2, style: { fontSize: 7.5, fontWeight: 'bold', fontFamily: 'Montserrat', color: '#4a705a', textAlign: 'center', letterSpacing: 1.5 } },
            { id: 'h1-next', type: 'holiday_list', name: 'Feriados Próximo Ano', content: '01 de Janeiro - Confraternização Universal\n09 de Fevereiro - Carnaval\n26 de Março - Paixão de Cristo\n28 de Março - Páscoa\n21 de Abril - Tiradentes\n01 de Maio - Dia do Trabalho\n27 de Maio - Corpus Christi\n07 de Setembro - Independência do Brasil\n12 de Outubro - Nossa Senhora Aparecida\n02 de Novembro - Finados\n15 de Novembro - Proclamação da República\n20 de Novembro - Dia Nacional de Zumbi e da Consciência Negra\n25 de Dezembro - Natal', x: 8, y: 75, w: 84, h: 19.5, zIndex: 1, style: {
                fontSize: 7,
                fontWeight: 'normal',
                fontFamily: 'Inter',
                color: '#3b5947',
                textAlign: 'left',
                lineHeight: 1.35,
                columnCount: 2,
                columnGap: 20,
                yearOffset: 1
            } }
        ]
    },
    {
        id: 'tpl-datas-importantes',
        name: 'Datas Importantes / Aniversários',
        elements: [
            { id: 'di-sub', type: 'text', name: 'Subtítulo Caligráfico', content: 'Memórias, celebrações & aniversários', x: 15, y: 2, w: 70, h: 3.5, zIndex: 2, style: { fontSize: 13, fontFamily: 'Dancing Script', color: '#b56576', textAlign: 'center' } },
            { id: 'di-title', type: 'text', name: 'Título Datas Importantes', content: 'DATAS IMPORTANTES', x: 8, y: 5, w: 84, h: 4.5, zIndex: 2, style: { fontSize: 16, fontWeight: 'bold', textAlign: 'center', verticalAlign: 'middle', fontFamily: 'Playfair Display', color: '#6d4352', textTransform: 'uppercase', letterSpacing: 2 } },

            // Linha 1: Jan (Rosé), Fev (Pêssego), Mar (Sálvia)
            { id: 'di-b1', type: 'box', name: 'Janeiro', x: 5, y: 11, w: 28, h: 19.5, zIndex: 0, style: { borderWidth: 1, borderColor: '#f3c6d1', borderRadius: 10, backgroundColor: '#fdf2f4' } },
            { id: 'di-t1', type: 'text', content: 'JANEIRO', x: 7, y: 12.2, w: 24, h: 3, zIndex: 1, style: { fontSize: 8, fontWeight: 'bold', color: '#9d4e64', textAlign: 'center', fontFamily: 'Playfair Display', letterSpacing: 1 } },
            { id: 'di-l1', type: 'lines', x: 7, y: 16, w: 24, h: 13, zIndex: 1, style: { color: '#eabcc8', lineSpacing: 15, borderStyle: 'dotted' } },

            { id: 'di-b2', type: 'box', name: 'Fevereiro', x: 36, y: 11, w: 28, h: 19.5, zIndex: 0, style: { borderWidth: 1, borderColor: '#ebd4bc', borderRadius: 10, backgroundColor: '#fdf8f3' } },
            { id: 'di-t2', type: 'text', content: 'FEVEREIRO', x: 38, y: 12.2, w: 24, h: 3, zIndex: 1, style: { fontSize: 8, fontWeight: 'bold', color: '#9c6644', textAlign: 'center', fontFamily: 'Playfair Display', letterSpacing: 1 } },
            { id: 'di-l2', type: 'lines', x: 38, y: 16, w: 24, h: 13, zIndex: 1, style: { color: '#e6ccb2', lineSpacing: 15, borderStyle: 'dotted' } },

            { id: 'di-b3', type: 'box', name: 'Março', x: 67, y: 11, w: 28, h: 19.5, zIndex: 0, style: { borderWidth: 1, borderColor: '#c3d9cc', borderRadius: 10, backgroundColor: '#f2f7f4' } },
            { id: 'di-t3', type: 'text', content: 'MARÇO', x: 69, y: 12.2, w: 24, h: 3, zIndex: 1, style: { fontSize: 8, fontWeight: 'bold', color: '#4a705a', textAlign: 'center', fontFamily: 'Playfair Display', letterSpacing: 1 } },
            { id: 'di-l3', type: 'lines', x: 69, y: 16, w: 24, h: 13, zIndex: 1, style: { color: '#b7d1c2', lineSpacing: 15, borderStyle: 'dotted' } },

            // Linha 2: Abr (Lavanda), Mai (Rosé), Jun (Pêssego)
            { id: 'di-b4', type: 'box', name: 'Abril', x: 5, y: 32, w: 28, h: 19.5, zIndex: 0, style: { borderWidth: 1, borderColor: '#d4ccf7', borderRadius: 10, backgroundColor: '#f5f3ff' } },
            { id: 'di-t4', type: 'text', content: 'ABRIL', x: 7, y: 33.2, w: 24, h: 3, zIndex: 1, style: { fontSize: 8, fontWeight: 'bold', color: '#6d599a', textAlign: 'center', fontFamily: 'Playfair Display', letterSpacing: 1 } },
            { id: 'di-l4', type: 'lines', x: 7, y: 37, w: 24, h: 13, zIndex: 1, style: { color: '#ccc2f2', lineSpacing: 15, borderStyle: 'dotted' } },

            { id: 'di-b5', type: 'box', name: 'Maio', x: 36, y: 32, w: 28, h: 19.5, zIndex: 0, style: { borderWidth: 1, borderColor: '#f3c6d1', borderRadius: 10, backgroundColor: '#fdf2f4' } },
            { id: 'di-t5', type: 'text', content: 'MAIO', x: 38, y: 33.2, w: 24, h: 3, zIndex: 1, style: { fontSize: 8, fontWeight: 'bold', color: '#9d4e64', textAlign: 'center', fontFamily: 'Playfair Display', letterSpacing: 1 } },
            { id: 'di-l5', type: 'lines', x: 38, y: 37, w: 24, h: 13, zIndex: 1, style: { color: '#eabcc8', lineSpacing: 15, borderStyle: 'dotted' } },

            { id: 'di-b6', type: 'box', name: 'Junho', x: 67, y: 32, w: 28, h: 19.5, zIndex: 0, style: { borderWidth: 1, borderColor: '#ebd4bc', borderRadius: 10, backgroundColor: '#fdf8f3' } },
            { id: 'di-t6', type: 'text', content: 'JUNHO', x: 69, y: 33.2, w: 24, h: 3, zIndex: 1, style: { fontSize: 8, fontWeight: 'bold', color: '#9c6644', textAlign: 'center', fontFamily: 'Playfair Display', letterSpacing: 1 } },
            { id: 'di-l6', type: 'lines', x: 69, y: 37, w: 24, h: 13, zIndex: 1, style: { color: '#e6ccb2', lineSpacing: 15, borderStyle: 'dotted' } },

            // Linha 3: Jul (Sálvia), Ago (Lavanda), Set (Rosé)
            { id: 'di-b7', type: 'box', name: 'Julho', x: 5, y: 53, w: 28, h: 19.5, zIndex: 0, style: { borderWidth: 1, borderColor: '#c3d9cc', borderRadius: 10, backgroundColor: '#f2f7f4' } },
            { id: 'di-t7', type: 'text', content: 'JULHO', x: 7, y: 54.2, w: 24, h: 3, zIndex: 1, style: { fontSize: 8, fontWeight: 'bold', color: '#4a705a', textAlign: 'center', fontFamily: 'Playfair Display', letterSpacing: 1 } },
            { id: 'di-l7', type: 'lines', x: 7, y: 58, w: 24, h: 13, zIndex: 1, style: { color: '#b7d1c2', lineSpacing: 15, borderStyle: 'dotted' } },

            { id: 'di-b8', type: 'box', name: 'Agosto', x: 36, y: 53, w: 28, h: 19.5, zIndex: 0, style: { borderWidth: 1, borderColor: '#d4ccf7', borderRadius: 10, backgroundColor: '#f5f3ff' } },
            { id: 'di-t8', type: 'text', content: 'AGOSTO', x: 38, y: 54.2, w: 24, h: 3, zIndex: 1, style: { fontSize: 8, fontWeight: 'bold', color: '#6d599a', textAlign: 'center', fontFamily: 'Playfair Display', letterSpacing: 1 } },
            { id: 'di-l8', type: 'lines', x: 38, y: 58, w: 24, h: 13, zIndex: 1, style: { color: '#ccc2f2', lineSpacing: 15, borderStyle: 'dotted' } },

            { id: 'di-b9', type: 'box', name: 'Setembro', x: 67, y: 53, w: 28, h: 19.5, zIndex: 0, style: { borderWidth: 1, borderColor: '#f3c6d1', borderRadius: 10, backgroundColor: '#fdf2f4' } },
            { id: 'di-t9', type: 'text', content: 'SETEMBRO', x: 69, y: 54.2, w: 24, h: 3, zIndex: 1, style: { fontSize: 8, fontWeight: 'bold', color: '#9d4e64', textAlign: 'center', fontFamily: 'Playfair Display', letterSpacing: 1 } },
            { id: 'di-l9', type: 'lines', x: 69, y: 58, w: 24, h: 13, zIndex: 1, style: { color: '#eabcc8', lineSpacing: 15, borderStyle: 'dotted' } },

            // Linha 4: Out (Pêssego), Nov (Sálvia), Dez (Lavanda)
            { id: 'di-b10', type: 'box', name: 'Outubro', x: 5, y: 74, w: 28, h: 19.5, zIndex: 0, style: { borderWidth: 1, borderColor: '#ebd4bc', borderRadius: 10, backgroundColor: '#fdf8f3' } },
            { id: 'di-t10', type: 'text', content: 'OUTUBRO', x: 7, y: 75.2, w: 24, h: 3, zIndex: 1, style: { fontSize: 8, fontWeight: 'bold', color: '#9c6644', textAlign: 'center', fontFamily: 'Playfair Display', letterSpacing: 1 } },
            { id: 'di-l10', type: 'lines', x: 7, y: 79, w: 24, h: 13, zIndex: 1, style: { color: '#e6ccb2', lineSpacing: 15, borderStyle: 'dotted' } },

            { id: 'di-b11', type: 'box', name: 'Novembro', x: 36, y: 74, w: 28, h: 19.5, zIndex: 0, style: { borderWidth: 1, borderColor: '#c3d9cc', borderRadius: 10, backgroundColor: '#f2f7f4' } },
            { id: 'di-t11', type: 'text', content: 'NOVEMBRO', x: 38, y: 75.2, w: 24, h: 3, zIndex: 1, style: { fontSize: 8, fontWeight: 'bold', color: '#4a705a', textAlign: 'center', fontFamily: 'Playfair Display', letterSpacing: 1 } },
            { id: 'di-l11', type: 'lines', x: 38, y: 79, w: 24, h: 13, zIndex: 1, style: { color: '#b7d1c2', lineSpacing: 15, borderStyle: 'dotted' } },

            { id: 'di-b12', type: 'box', name: 'Dezembro', x: 67, y: 74, w: 28, h: 19.5, zIndex: 0, style: { borderWidth: 1, borderColor: '#d4ccf7', borderRadius: 10, backgroundColor: '#f5f3ff' } },
            { id: 'di-t12', type: 'text', content: 'DEZEMBRO', x: 69, y: 75.2, w: 24, h: 3, zIndex: 1, style: { fontSize: 8, fontWeight: 'bold', color: '#6d599a', textAlign: 'center', fontFamily: 'Playfair Display', letterSpacing: 1 } },
            { id: 'di-l12', type: 'lines', x: 69, y: 79, w: 24, h: 13, zIndex: 1, style: { color: '#ccc2f2', lineSpacing: 15, borderStyle: 'dotted' } },
        ]
    },
    {
        id: 'tpl-planejamento-anual',
        name: 'Planejamento Anual',
        elements: [
            { id: 'pa-sub', type: 'text', name: 'Subtítulo Caligráfico', content: 'Visão geral dos meus projetos', x: 15, y: 2, w: 70, h: 3.5, zIndex: 2, style: { fontSize: 13, fontFamily: 'Dancing Script', color: '#5c836d', textAlign: 'center' } },
            { id: 'pa-title', type: 'text', name: 'Título Planejamento Anual', content: 'PLANEJAMENTO ANUAL', x: 8, y: 5, w: 84, h: 4.5, zIndex: 2, style: { fontSize: 16, fontWeight: 'bold', textAlign: 'center', verticalAlign: 'middle', fontFamily: 'Playfair Display', color: '#3b5947', textTransform: 'uppercase', letterSpacing: 2 } },

            // Coluna Esquerda (Jan a Jun) e Direita (Jul a Dez) em Tons Pastéis Suaves
            { id: 'pa-b1', type: 'box', name: 'Jan', x: 5, y: 11, w: 43, h: 13, zIndex: 0, style: { borderWidth: 1, borderColor: '#f3c6d1', borderRadius: 8, backgroundColor: '#fdf2f4' } },
            { id: 'pa-t1', type: 'text', content: '01 • JANEIRO', x: 7, y: 12, w: 39, h: 3, zIndex: 1, style: { fontSize: 7.5, fontWeight: 'bold', color: '#9d4e64', fontFamily: 'Montserrat', letterSpacing: 0.8 } },
            { id: 'pa-l1', type: 'lines', x: 7, y: 15, w: 39, h: 8, zIndex: 1, style: { color: '#eabcc8', lineSpacing: 14 } },

            { id: 'pa-b2', type: 'box', name: 'Fev', x: 52, y: 11, w: 43, h: 13, zIndex: 0, style: { borderWidth: 1, borderColor: '#ebd4bc', borderRadius: 8, backgroundColor: '#fdf8f3' } },
            { id: 'pa-t2', type: 'text', content: '02 • FEVEREIRO', x: 54, y: 12, w: 39, h: 3, zIndex: 1, style: { fontSize: 7.5, fontWeight: 'bold', color: '#9c6644', fontFamily: 'Montserrat', letterSpacing: 0.8 } },
            { id: 'pa-l2', type: 'lines', x: 54, y: 15, w: 39, h: 8, zIndex: 1, style: { color: '#e6ccb2', lineSpacing: 14 } },

            { id: 'pa-b3', type: 'box', name: 'Mar', x: 5, y: 25.5, w: 43, h: 13, zIndex: 0, style: { borderWidth: 1, borderColor: '#c3d9cc', borderRadius: 8, backgroundColor: '#f2f7f4' } },
            { id: 'pa-t3', type: 'text', content: '03 • MARÇO', x: 7, y: 26.5, w: 39, h: 3, zIndex: 1, style: { fontSize: 7.5, fontWeight: 'bold', color: '#4a705a', fontFamily: 'Montserrat', letterSpacing: 0.8 } },
            { id: 'pa-l3', type: 'lines', x: 7, y: 29.5, w: 39, h: 8, zIndex: 1, style: { color: '#b7d1c2', lineSpacing: 14 } },

            { id: 'pa-b4', type: 'box', name: 'Abr', x: 52, y: 25.5, w: 43, h: 13, zIndex: 0, style: { borderWidth: 1, borderColor: '#d4ccf7', borderRadius: 8, backgroundColor: '#f5f3ff' } },
            { id: 'pa-t4', type: 'text', content: '04 • ABRIL', x: 54, y: 26.5, w: 39, h: 3, zIndex: 1, style: { fontSize: 7.5, fontWeight: 'bold', color: '#6d599a', fontFamily: 'Montserrat', letterSpacing: 0.8 } },
            { id: 'pa-l4', type: 'lines', x: 54, y: 29.5, w: 39, h: 8, zIndex: 1, style: { color: '#ccc2f2', lineSpacing: 14 } },

            { id: 'pa-b5', type: 'box', name: 'Mai', x: 5, y: 40, w: 43, h: 13, zIndex: 0, style: { borderWidth: 1, borderColor: '#f3c6d1', borderRadius: 8, backgroundColor: '#fdf2f4' } },
            { id: 'pa-t5', type: 'text', content: '05 • MAIO', x: 7, y: 41, w: 39, h: 3, zIndex: 1, style: { fontSize: 7.5, fontWeight: 'bold', color: '#9d4e64', fontFamily: 'Montserrat', letterSpacing: 0.8 } },
            { id: 'pa-l5', type: 'lines', x: 7, y: 44, w: 39, h: 8, zIndex: 1, style: { color: '#eabcc8', lineSpacing: 14 } },

            { id: 'pa-b6', type: 'box', name: 'Jun', x: 52, y: 40, w: 43, h: 13, zIndex: 0, style: { borderWidth: 1, borderColor: '#ebd4bc', borderRadius: 8, backgroundColor: '#fdf8f3' } },
            { id: 'pa-t6', type: 'text', content: '06 • JUNHO', x: 54, y: 41, w: 39, h: 3, zIndex: 1, style: { fontSize: 7.5, fontWeight: 'bold', color: '#9c6644', fontFamily: 'Montserrat', letterSpacing: 0.8 } },
            { id: 'pa-l6', type: 'lines', x: 54, y: 44, w: 39, h: 8, zIndex: 1, style: { color: '#e6ccb2', lineSpacing: 14 } },

            { id: 'pa-b7', type: 'box', name: 'Jul', x: 5, y: 54.5, w: 43, h: 13, zIndex: 0, style: { borderWidth: 1, borderColor: '#c3d9cc', borderRadius: 8, backgroundColor: '#f2f7f4' } },
            { id: 'pa-t7', type: 'text', content: '07 • JULHO', x: 7, y: 55.5, w: 39, h: 3, zIndex: 1, style: { fontSize: 7.5, fontWeight: 'bold', color: '#4a705a', fontFamily: 'Montserrat', letterSpacing: 0.8 } },
            { id: 'pa-l7', type: 'lines', x: 7, y: 58.5, w: 39, h: 8, zIndex: 1, style: { color: '#b7d1c2', lineSpacing: 14 } },

            { id: 'pa-b8', type: 'box', name: 'Ago', x: 52, y: 54.5, w: 43, h: 13, zIndex: 0, style: { borderWidth: 1, borderColor: '#d4ccf7', borderRadius: 8, backgroundColor: '#f5f3ff' } },
            { id: 'pa-t8', type: 'text', content: '08 • AGOSTO', x: 54, y: 55.5, w: 39, h: 3, zIndex: 1, style: { fontSize: 7.5, fontWeight: 'bold', color: '#6d599a', fontFamily: 'Montserrat', letterSpacing: 0.8 } },
            { id: 'pa-l8', type: 'lines', x: 54, y: 58.5, w: 39, h: 8, zIndex: 1, style: { color: '#ccc2f2', lineSpacing: 14 } },

            { id: 'pa-b9', type: 'box', name: 'Set', x: 5, y: 69, w: 43, h: 13, zIndex: 0, style: { borderWidth: 1, borderColor: '#f3c6d1', borderRadius: 8, backgroundColor: '#fdf2f4' } },
            { id: 'pa-t9', type: 'text', content: '09 • SETEMBRO', x: 7, y: 70, w: 39, h: 3, zIndex: 1, style: { fontSize: 7.5, fontWeight: 'bold', color: '#9d4e64', fontFamily: 'Montserrat', letterSpacing: 0.8 } },
            { id: 'pa-l9', type: 'lines', x: 7, y: 73, w: 39, h: 8, zIndex: 1, style: { color: '#eabcc8', lineSpacing: 14 } },

            { id: 'pa-b10', type: 'box', name: 'Out', x: 52, y: 69, w: 43, h: 13, zIndex: 0, style: { borderWidth: 1, borderColor: '#ebd4bc', borderRadius: 8, backgroundColor: '#fdf8f3' } },
            { id: 'pa-t10', type: 'text', content: '10 • OUTUBRO', x: 54, y: 70, w: 39, h: 3, zIndex: 1, style: { fontSize: 7.5, fontWeight: 'bold', color: '#9c6644', fontFamily: 'Montserrat', letterSpacing: 0.8 } },
            { id: 'pa-l10', type: 'lines', x: 54, y: 73, w: 39, h: 8, zIndex: 1, style: { color: '#e6ccb2', lineSpacing: 14 } },

            { id: 'pa-b11', type: 'box', name: 'Nov', x: 5, y: 83.5, w: 43, h: 13, zIndex: 0, style: { borderWidth: 1, borderColor: '#c3d9cc', borderRadius: 8, backgroundColor: '#f2f7f4' } },
            { id: 'pa-t11', type: 'text', content: '11 • NOVEMBRO', x: 7, y: 84.5, w: 39, h: 3, zIndex: 1, style: { fontSize: 7.5, fontWeight: 'bold', color: '#4a705a', fontFamily: 'Montserrat', letterSpacing: 0.8 } },
            { id: 'pa-l11', type: 'lines', x: 7, y: 87.5, w: 39, h: 8, zIndex: 1, style: { color: '#b7d1c2', lineSpacing: 14 } },

            { id: 'pa-b12', type: 'box', name: 'Dez', x: 52, y: 83.5, w: 43, h: 13, zIndex: 0, style: { borderWidth: 1, borderColor: '#d4ccf7', borderRadius: 8, backgroundColor: '#f5f3ff' } },
            { id: 'pa-t12', type: 'text', content: '12 • DEZEMBRO', x: 54, y: 84.5, w: 39, h: 3, zIndex: 1, style: { fontSize: 7.5, fontWeight: 'bold', color: '#6d599a', fontFamily: 'Montserrat', letterSpacing: 0.8 } },
            { id: 'pa-l12', type: 'lines', x: 54, y: 87.5, w: 39, h: 8, zIndex: 1, style: { color: '#ccc2f2', lineSpacing: 14 } },
        ]
    },
    {
        id: 'tpl-metas',
        name: 'Metas do Ano (Pastel)',
        elements: [
            { id: 'mt-blob', type: 'vector_shape', name: 'Aquarela Topo', x: 22, y: 1, w: 56, h: 12, zIndex: 0, style: { shapeType: 'organic_blob_elongated', backgroundColor: '#f5f3ff', borderColor: 'transparent', borderWidth: 0, fillOpacity: 0.8 } },
            { id: 'mt-sub', type: 'text', content: 'Propósitos, desejos & conquistas', x: 15, y: 3, w: 70, h: 4, zIndex: 2, style: { fontSize: 14, fontFamily: 'Dancing Script', color: '#7c68a6', textAlign: 'center' } },
            { id: 't3', type: 'text', content: 'MINHAS METAS PARA O ANO', x: 10, y: 7, w: 80, h: 5, zIndex: 2, style: { fontSize: 17, fontWeight: 'bold', textAlign: 'center', fontFamily: 'Playfair Display', color: '#5b4b7a', textTransform: 'uppercase', letterSpacing: 2 } },
            { id: 'mt-div', type: 'vector_shape', name: 'Divisor Floral', x: 34, y: 12.2, w: 32, h: 2.5, zIndex: 2, style: { shapeType: 'divider_botanical_sprig', backgroundColor: 'transparent', borderColor: '#9d8ec4', borderWidth: 1 } },

            // Quadrante 1: Pessoal & Família (Rosa Quartzo Pastel)
            { id: 'g1', type: 'box', x: 7, y: 16.5, w: 41, h: 37, zIndex: 0, style: { borderWidth: 1, borderColor: '#f3c6d1', borderRadius: 12, backgroundColor: '#fdf2f4' } },
            { id: 'gt1', type: 'text', content: 'PESSOAL & FAMÍLIA', x: 9, y: 18.5, w: 37, h: 4, zIndex: 1, style: { fontSize: 9.5, fontWeight: 'bold', textAlign: 'center', fontFamily: 'Playfair Display', color: '#9d4e64', textTransform: 'uppercase', letterSpacing: 1 } },
            { id: 'gl1', type: 'lines', x: 9.5, y: 24, w: 36, h: 27, zIndex: 1, style: { color: '#eabcc8', lineSpacing: 18 } },
            
            // Quadrante 2: Profissional & Estudos (Lavanda Pastel)
            { id: 'g2', type: 'box', x: 52, y: 16.5, w: 41, h: 37, zIndex: 0, style: { borderWidth: 1, borderColor: '#d4ccf7', borderRadius: 12, backgroundColor: '#f5f3ff' } },
            { id: 'gt2', type: 'text', content: 'CARREIRA & ESTUDOS', x: 54, y: 18.5, w: 37, h: 4, zIndex: 1, style: { fontSize: 9.5, fontWeight: 'bold', textAlign: 'center', fontFamily: 'Playfair Display', color: '#6d599a', textTransform: 'uppercase', letterSpacing: 1 } },
            { id: 'gl2', type: 'lines', x: 54.5, y: 24, w: 36, h: 27, zIndex: 1, style: { color: '#ccc2f2', lineSpacing: 18 } },
            
            // Quadrante 3: Saúde & Autocuidado (Verde Sálvia Pastel)
            { id: 'g3', type: 'box', x: 7, y: 56.5, w: 41, h: 37, zIndex: 0, style: { borderWidth: 1, borderColor: '#c3d9cc', borderRadius: 12, backgroundColor: '#f2f7f4' } },
            { id: 'gt3', type: 'text', content: 'SAÚDE & BEM-ESTAR', x: 9, y: 58.5, w: 37, h: 4, zIndex: 1, style: { fontSize: 9.5, fontWeight: 'bold', textAlign: 'center', fontFamily: 'Playfair Display', color: '#4a705a', textTransform: 'uppercase', letterSpacing: 1 } },
            { id: 'gl3', type: 'lines', x: 9.5, y: 64, w: 36, h: 27, zIndex: 1, style: { color: '#b7d1c2', lineSpacing: 18 } },
            
            // Quadrante 4: Financeiro & Sonhos (Pêssego / Champanhe Pastel)
            { id: 'g4', type: 'box', x: 52, y: 56.5, w: 41, h: 37, zIndex: 0, style: { borderWidth: 1, borderColor: '#ebd4bc', borderRadius: 12, backgroundColor: '#fdf8f3' } },
            { id: 'gt4', type: 'text', content: 'FINANCEIRO & SONHOS', x: 54, y: 58.5, w: 37, h: 4, zIndex: 1, style: { fontSize: 9.5, fontWeight: 'bold', textAlign: 'center', fontFamily: 'Playfair Display', color: '#9c6644', textTransform: 'uppercase', letterSpacing: 1 } },
            { id: 'gl4', type: 'lines', x: 54.5, y: 64, w: 36, h: 27, zIndex: 1, style: { color: '#e6ccb2', lineSpacing: 18 } },
        ]
    },
    {
        id: 'tpl-contatos',
        name: 'Contatos Importantes',
        elements: [
            { id: 'ct-blob', type: 'vector_shape', name: 'Aquarela Topo', x: 22, y: 1, w: 56, h: 11, zIndex: 0, style: { shapeType: 'organic_blob_elongated', backgroundColor: '#fce7ec', borderColor: 'transparent', borderWidth: 0, fillOpacity: 0.65 } },
            { id: 'ct-sub', type: 'text', content: 'Pessoas & lugares especiais', x: 15, y: 3, w: 70, h: 3.5, zIndex: 2, style: { fontSize: 13, fontFamily: 'Dancing Script', color: '#b56576', textAlign: 'center' } },
            { id: 't4', type: 'text', content: 'CONTATOS IMPORTANTES', x: 10, y: 6.5, w: 80, h: 5, zIndex: 2, style: { fontSize: 17, fontWeight: 'bold', textAlign: 'center', fontFamily: 'Playfair Display', color: '#6d4352', textTransform: 'uppercase', letterSpacing: 2 } },
            { id: 'tbl1', type: 'table', x: 6, y: 14, w: 88, h: 79, zIndex: 1, style: { 
                table: {
                    rows: 16,
                    cols: 3,
                    columnWidths: [40, 30, 30],
                    borderColor: '#f3c6d1',
                    borderWidth: 0.6,
                    borderStyle: 'solid',
                    headerRow: true,
                    zebraRows: true,
                    zebraColor: '#fdf2f4',
                    borders: { top: true, bottom: true, left: true, right: true, insideHorizontal: true, insideVertical: true, headerSeparator: true },
                    textStyle: { fontSize: 8.5, fontFamily: 'Inter', color: '#594149', fontWeight: 'normal', textAlign: 'left', textTransform: 'none', letterSpacing: 0 },
                    rowStyles: { 
                        0: { fontSize: 8, fontFamily: 'Montserrat', color: '#8c4f60', fontWeight: 'bold', textAlign: 'center', textTransform: 'uppercase', letterSpacing: 0.8 }
                    },
                    cellContent: {
                        '0-0': 'NOME / CONTATO',
                        '0-1': 'TELEFONE / WHATSAPP',
                        '0-2': 'E-MAIL / NOTAS'
                    }
                }
            } }
        ]
    },
    {
        id: 'tpl-senhas',
        name: 'Senhas e Logins',
        elements: [
            { id: 'sn-blob', type: 'vector_shape', name: 'Aquarela Lavanda', x: 22, y: 1, w: 56, h: 11, zIndex: 0, style: { shapeType: 'organic_blob_elongated', backgroundColor: '#ede9fe', borderColor: 'transparent', borderWidth: 0, fillOpacity: 0.7 } },
            { id: 'sn-sub', type: 'text', content: 'Meus acessos digitais favoritos', x: 15, y: 3, w: 70, h: 3.5, zIndex: 2, style: { fontSize: 13, fontFamily: 'Dancing Script', color: '#7c68a6', textAlign: 'center' } },
            { id: 't5', type: 'text', content: 'SENHAS E LOGINS', x: 10, y: 6.5, w: 80, h: 5, zIndex: 2, style: { fontSize: 17, fontWeight: 'bold', textAlign: 'center', fontFamily: 'Playfair Display', color: '#5b4b7a', textTransform: 'uppercase', letterSpacing: 2 } },
            { id: 'tbl2', type: 'table', x: 6, y: 14, w: 88, h: 79, zIndex: 1, style: { 
                table: {
                    rows: 16,
                    cols: 3,
                    columnWidths: [34, 36, 30],
                    borderColor: '#d4ccf7',
                    borderWidth: 0.6,
                    borderStyle: 'solid',
                    headerRow: true,
                    zebraRows: true,
                    zebraColor: '#f5f3ff',
                    borders: { top: true, bottom: true, left: true, right: true, insideHorizontal: true, insideVertical: true, headerSeparator: true },
                    textStyle: { fontSize: 8.5, fontFamily: 'Inter', color: '#4c3f66', fontWeight: 'normal', textAlign: 'left', textTransform: 'none', letterSpacing: 0 },
                    rowStyles: { 
                        0: { fontSize: 8, fontFamily: 'Montserrat', color: '#5b4b7a', fontWeight: 'bold', textAlign: 'center', textTransform: 'uppercase', letterSpacing: 0.8 }
                    },
                    cellContent: {
                        '0-0': 'SITE / APLICATIVO',
                        '0-1': 'USUÁRIO / E-MAIL',
                        '0-2': 'SENHA / DICA'
                    }
                }
            } }
        ]
    },
    {
        id: 'tpl-financeiro-anual',
        name: 'Controle Financeiro Anual',
        elements: [
            { id: 'fa-blob', type: 'vector_shape', name: 'Aquarela Sálvia', x: 20, y: 0.5, w: 60, h: 10, zIndex: 0, style: { shapeType: 'organic_blob_elongated', backgroundColor: '#e6f2eb', borderColor: 'transparent', borderWidth: 0, fillOpacity: 0.7 } },
            { id: 'fa-sub', type: 'text', content: 'Organização, equilíbrio & prosperidade', x: 15, y: 2.2, w: 70, h: 3.5, zIndex: 2, style: { fontSize: 13, fontFamily: 'Dancing Script', color: '#5c836d', textAlign: 'center' } },
            { id: 'fa-title', type: 'text', content: 'BALANÇO FINANCEIRO ANUAL', x: 8, y: 5.5, w: 84, h: 5, zIndex: 2, style: { fontSize: 16, fontWeight: 'bold', textAlign: 'center', fontFamily: 'Playfair Display', color: '#3b5947', textTransform: 'uppercase', letterSpacing: 1.8 } },
            { id: 'fa-tbl', type: 'table', x: 6, y: 12.5, w: 88, h: 67, zIndex: 1, style: { 
                table: {
                    rows: 14,
                    cols: 4,
                    columnWidths: [28, 24, 24, 24],
                    borderColor: '#c3d9cc',
                    borderWidth: 0.6,
                    borderStyle: 'solid',
                    headerRow: true,
                    zebraRows: true,
                    zebraColor: '#f2f7f4',
                    borders: { top: true, bottom: true, left: true, right: true, insideHorizontal: true, insideVertical: true, headerSeparator: true },
                    textStyle: { fontSize: 8.5, fontFamily: 'Inter', color: '#3b5947', fontWeight: 'normal', textAlign: 'left', textTransform: 'none', letterSpacing: 0 },
                    rowStyles: { 
                        0: { fontSize: 8, fontFamily: 'Montserrat', color: '#3b5947', fontWeight: 'bold', textAlign: 'center', textTransform: 'uppercase', letterSpacing: 0.6 },
                        13: { fontSize: 8, fontFamily: 'Montserrat', color: '#9d4e64', fontWeight: 'bold', textAlign: 'left', textTransform: 'uppercase', letterSpacing: 0.6 }
                    },
                    cellContent: {
                        '0-0': 'MÊS',
                        '0-1': 'ENTRADAS (R$)',
                        '0-2': 'SAÍDAS (R$)',
                        '0-3': 'SALDO / RESERVA',
                        '1-0': 'Janeiro',
                        '2-0': 'Fevereiro',
                        '3-0': 'Março',
                        '4-0': 'Abril',
                        '5-0': 'Maio',
                        '6-0': 'Junho',
                        '7-0': 'Julho',
                        '8-0': 'Agosto',
                        '9-0': 'Setembro',
                        '10-0': 'Outubro',
                        '11-0': 'Novembro',
                        '12-0': 'Dezembro',
                        '13-0': 'TOTAL ANUAL'
                    }
                }
            } },
            { id: 'fa-box', type: 'box', x: 6, y: 82, w: 88, h: 13, zIndex: 0, style: { borderWidth: 1, borderColor: '#f3c6d1', borderRadius: 10, backgroundColor: '#fdf2f4' } },
            { id: 'fa-nt', type: 'text', content: 'METAS DE ECONOMIA, POUPANÇA & INVESTIMENTOS:', x: 8, y: 83.5, w: 84, h: 3, zIndex: 1, style: { fontSize: 8, fontWeight: 'bold', color: '#9d4e64', fontFamily: 'Playfair Display', letterSpacing: 1 } },
            { id: 'fa-nl', type: 'lines', x: 8, y: 87.5, w: 84, h: 6, zIndex: 1, style: { color: '#eabcc8', lineSpacing: 14 } }
        ]
    },
    {
        id: 'tpl-anotacoes-gerais',
        name: 'Anotações Gerais (Pastel)',
        elements: [
            { id: 'ag-frame', type: 'box', name: 'Moldura Suave', x: 5, y: 4, w: 90, h: 92, zIndex: 0, style: { borderWidth: 1, borderColor: '#f3c6d1', borderRadius: 14, backgroundColor: '#fffbfc' } },
            { id: 'ag-washi', type: 'vector_shape', name: 'Washi Tape Pastel', x: 36, y: 2, w: 28, h: 4, zIndex: 3, style: { shapeType: 'washi_tape', backgroundColor: '#fce7ec', borderColor: '#f3c6d1', borderWidth: 0.6, fillOpacity: 0.85 } },
            { id: 'ag-sub', type: 'text', content: 'Pensamentos, ideias & inspirações', x: 15, y: 6.5, w: 70, h: 3.5, zIndex: 2, style: { fontSize: 13, fontFamily: 'Dancing Script', color: '#b56576', textAlign: 'center' } },
            { id: 'ag-title', type: 'text', content: 'ANOTAÇÕES IMPORTANTES', x: 8, y: 10, w: 84, h: 4.5, zIndex: 2, style: { fontSize: 15, fontWeight: 'bold', textAlign: 'center', fontFamily: 'Playfair Display', color: '#6d4352', textTransform: 'uppercase', letterSpacing: 2 } },
            { id: 'ag-lines', type: 'lines', x: 9, y: 16, w: 82, h: 74, zIndex: 1, style: { color: '#f3c6d1', lineSpacing: 22, borderWidth: 0.6 } },
            { id: 'ag-bot', type: 'vector_shape', name: 'Ramo Botânico Rodapé', x: 42, y: 91, w: 16, h: 4, zIndex: 2, style: { shapeType: 'divider_botanical_sprig', backgroundColor: 'transparent', borderColor: '#d48c9e', borderWidth: 1 } }
        ]
    },
    {
        id: 'tpl-financeiro',
        name: 'Controle Financeiro Mensal',
        elements: [
            { id: 'fin-sub', type: 'text', content: 'Planejamento & equilíbrio do mês', x: 15, y: 2.5, w: 70, h: 3.5, zIndex: 2, style: { fontSize: 13, fontFamily: 'Dancing Script', color: '#5c836d', textAlign: 'center' } },
            { id: 'fin-t1', type: 'text', content: 'CONTROLE FINANCEIRO MENSAL', x: 10, y: 6, w: 80, h: 5, zIndex: 2, style: { fontSize: 16, fontWeight: 'bold', textAlign: 'center', color: '#3b5947', fontFamily: 'Playfair Display', letterSpacing: 1.5 } },
            
            // Card Entradas (Verde Sálvia Pastel)
            { id: 'fin-b1', type: 'box', x: 5, y: 13, w: 43, h: 36, zIndex: 0, style: { borderWidth: 1, borderColor: '#c3d9cc', borderRadius: 10, backgroundColor: '#f2f7f4' } },
            { id: 'fin-t2', type: 'text', content: 'ENTRADAS DO MÊS', x: 7, y: 15, w: 39, h: 4, zIndex: 1, style: { fontSize: 9.5, fontWeight: 'bold', textAlign: 'center', color: '#4a705a', fontFamily: 'Playfair Display', letterSpacing: 1 } },
            { id: 'fin-tbl1', type: 'table', x: 7, y: 20, w: 39, h: 27, zIndex: 1, style: { table: { rows: 7, cols: 2, columnWidths: [65, 35], headerRow: true, borderColor: '#c3d9cc', borderWidth: 0.5, textStyle: { fontSize: 7.5, fontFamily: 'Inter', color: '#3b5947' }, cellContent: { '0-0': 'DESCRIÇÃO', '0-1': 'VALOR' } } } },
            
            // Card Saídas Fixas (Rosa Quartzo Pastel)
            { id: 'fin-b2', type: 'box', x: 52, y: 13, w: 43, h: 36, zIndex: 0, style: { borderWidth: 1, borderColor: '#f3c6d1', borderRadius: 10, backgroundColor: '#fdf2f4' } },
            { id: 'fin-t3', type: 'text', content: 'DESPESAS FIXAS', x: 54, y: 15, w: 39, h: 4, zIndex: 1, style: { fontSize: 9.5, fontWeight: 'bold', textAlign: 'center', color: '#9d4e64', fontFamily: 'Playfair Display', letterSpacing: 1 } },
            { id: 'fin-tbl2', type: 'table', x: 54, y: 20, w: 39, h: 27, zIndex: 1, style: { table: { rows: 7, cols: 2, columnWidths: [65, 35], headerRow: true, borderColor: '#f3c6d1', borderWidth: 0.5, textStyle: { fontSize: 7.5, fontFamily: 'Inter', color: '#6d4352' }, cellContent: { '0-0': 'DESCRIÇÃO', '0-1': 'VALOR' } } } },
            
            // Card Gastos Variáveis (Champanhe Pastel)
            { id: 'fin-b3', type: 'box', x: 5, y: 51.5, w: 90, h: 42.5, zIndex: 0, style: { borderWidth: 1, borderColor: '#ebd4bc', borderRadius: 10, backgroundColor: '#fdf8f3' } },
            { id: 'fin-t4', type: 'text', content: 'GASTOS VARIÁVEIS & EXTRAS DO MÊS', x: 7, y: 53.5, w: 86, h: 4, zIndex: 1, style: { fontSize: 9.5, fontWeight: 'bold', textAlign: 'center', color: '#9c6644', fontFamily: 'Playfair Display', letterSpacing: 1 } },
            { id: 'fin-tbl3', type: 'table', x: 7, y: 58.5, w: 86, h: 33, zIndex: 1, style: { table: { rows: 9, cols: 3, columnWidths: [20, 55, 25], headerRow: true, borderColor: '#ebd4bc', borderWidth: 0.5, textStyle: { fontSize: 7.5, fontFamily: 'Inter', color: '#7f5539' }, cellContent: { '0-0': 'DATA', '0-1': 'DESCRIÇÃO', '0-2': 'VALOR (R$)' } } } },
        ]
    },
    {
        id: 'tpl-estudos',
        name: 'Cronograma de Estudos',
        elements: [
            { id: 'est-t1', type: 'text', content: 'CRONOGRAMA DE ESTUDOS', x: 10, y: 5, w: 80, h: 6, zIndex: 1, style: { fontSize: 17, fontWeight: 'bold', textAlign: 'center', color: '#5b4b7a', fontFamily: 'Playfair Display', letterSpacing: 1.5 } },
            { id: 'est-tbl1', type: 'table', x: 5, y: 14, w: 90, h: 50, zIndex: 1, style: { table: { rows: 10, cols: 6, headerRow: true, zebraRows: true, zebraColor: '#f5f3ff', borderColor: '#d4ccf7', textStyle: { fontSize: 8, color: '#4c3f66' } } } },
            { id: 'est-b1', type: 'box', x: 5, y: 68, w: 43, h: 26, zIndex: 0, style: { borderWidth: 1, borderColor: '#f3c6d1', borderRadius: 10, backgroundColor: '#fdf2f4' } },
            { id: 'est-t2', type: 'text', content: 'MATÉRIAS IMPORTANTES', x: 7, y: 70, w: 39, h: 4, zIndex: 1, style: { fontSize: 9.5, fontWeight: 'bold', textAlign: 'center', color: '#9d4e64', fontFamily: 'Playfair Display' } },
            { id: 'est-l1', type: 'lines', x: 7, y: 75, w: 39, h: 16, zIndex: 1, style: { lineSpacing: 18, color: '#eabcc8' } },
            
            { id: 'est-b2', type: 'box', x: 52, y: 68, w: 43, h: 26, zIndex: 0, style: { borderWidth: 1, borderColor: '#c3d9cc', borderRadius: 10, backgroundColor: '#f2f7f4' } },
            { id: 'est-t3', type: 'text', content: 'NOTAS / LEMBRETES', x: 54, y: 70, w: 39, h: 4, zIndex: 1, style: { fontSize: 9.5, fontWeight: 'bold', textAlign: 'center', color: '#4a705a', fontFamily: 'Playfair Display' } },
            { id: 'est-l2', type: 'note_grid', x: 54, y: 75, w: 39, h: 16, zIndex: 1, style: { gridSpacing: 15, color: '#b7d1c2' } },
        ]
    },
    {
        id: 'tpl-saude',
        name: 'Diário de Saúde',
        elements: [
            { id: 'sau-t1', type: 'text', content: 'ACOMPANHAMENTO DE SAÚDE', x: 10, y: 5, w: 80, h: 6, zIndex: 1, style: { fontSize: 17, fontWeight: 'bold', textAlign: 'center', color: '#4a705a', fontFamily: 'Playfair Display', letterSpacing: 1.5 } },
            { id: 'sau-b1', type: 'box', x: 5, y: 14, w: 90, h: 26, zIndex: 0, style: { borderWidth: 1, borderColor: '#c3d9cc', borderRadius: 10, backgroundColor: '#f2f7f4' } },
            { id: 'sau-t2', type: 'text', content: 'CONTROLE DE MEDICAMENTOS & VITAMINAS', x: 7, y: 16, w: 86, h: 4, zIndex: 1, style: { fontSize: 10, fontWeight: 'bold', color: '#4a705a', fontFamily: 'Playfair Display' } },
            { id: 'sau-tbl1', type: 'table', x: 7, y: 21, w: 86, h: 16, zIndex: 1, style: { table: { rows: 4, cols: 4, headerRow: true, borderColor: '#c3d9cc', textStyle: { fontSize: 8 } } } },
            
            { id: 'sau-b2', type: 'box', x: 5, y: 44, w: 43, h: 48, zIndex: 0, style: { borderWidth: 1, borderColor: '#f3c6d1', borderRadius: 10, backgroundColor: '#fdf2f4' } },
            { id: 'sau-t3', type: 'text', content: 'HÁBITOS SAUDÁVEIS', x: 7, y: 46, w: 39, h: 4, zIndex: 1, style: { fontSize: 10, fontWeight: 'bold', textAlign: 'center', color: '#9d4e64', fontFamily: 'Playfair Display' } },
            { id: 'sau-ht1', type: 'habit_tracker', x: 7, y: 52, w: 39, h: 36, zIndex: 1, style: { habitLabel: 'Autocuidado', habitColor: '#d48c9e', color: '#9d4e64' } },
            
            { id: 'sau-b3', type: 'box', x: 52, y: 44, w: 43, h: 48, zIndex: 0, style: { borderWidth: 1, borderColor: '#d4ccf7', borderRadius: 10, backgroundColor: '#f5f3ff' } },
            { id: 'sau-t4', type: 'text', content: 'QUALIDADE DO SONO & BEM-ESTAR', x: 54, y: 46, w: 39, h: 4, zIndex: 1, style: { fontSize: 10, fontWeight: 'bold', textAlign: 'center', color: '#6d599a', fontFamily: 'Playfair Display' } },
            { id: 'sau-l1', type: 'lines', x: 54, y: 52, w: 39, h: 36, zIndex: 1, style: { lineSpacing: 22, color: '#ccc2f2' } },
        ]
    },
    {
        id: 'tpl-roda-vida',
        name: 'Roda da Vida',
        elements: [
            { id: 'rv-t1', type: 'text', content: 'RODA DA VIDA', x: 10, y: 5, w: 80, h: 6, zIndex: 1, style: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', color: '#6d4352', fontFamily: 'Playfair Display', letterSpacing: 2 } },
            { id: 'rv-c1', type: 'circle', x: 20, y: 15, w: 60, h: 60, zIndex: 0, style: { borderWidth: 1.2, borderColor: '#f3c6d1', backgroundColor: '#fdf2f4' } },
            { id: 'rv-c2', type: 'circle', x: 30, y: 25, w: 40, h: 40, zIndex: 0, style: { borderWidth: 0.8, borderColor: '#eabcc8', backgroundColor: '#fffbfc' } },
            { id: 'rv-c3', type: 'circle', x: 40, y: 35, w: 20, h: 20, zIndex: 0, style: { borderWidth: 0.8, borderColor: '#eabcc8', backgroundColor: '#fdf2f4' } },
            { id: 'rv-l1', type: 'lines', x: 50, y: 15, w: 0.1, h: 60, zIndex: 0, style: { color: '#d48c9e' } },
            { id: 'rv-l2', type: 'lines', x: 20, y: 45, w: 60, h: 0.1, zIndex: 0, style: { color: '#d48c9e' } },
            { id: 'rv-t2', type: 'text', content: 'Saúde', x: 40, y: 10, w: 20, h: 4, zIndex: 1, style: { fontSize: 9, textAlign: 'center', fontFamily: 'Playfair Display', color: '#4a705a', fontWeight: 'bold' } },
            { id: 'rv-t3', type: 'text', content: 'Carreira', x: 82, y: 43, w: 15, h: 4, zIndex: 1, style: { fontSize: 9, textAlign: 'left', fontFamily: 'Playfair Display', color: '#6d599a', fontWeight: 'bold' } },
            { id: 'rv-t4', type: 'text', content: 'Família', x: 40, y: 77, w: 20, h: 4, zIndex: 1, style: { fontSize: 9, textAlign: 'center', fontFamily: 'Playfair Display', color: '#9d4e64', fontWeight: 'bold' } },
            { id: 'rv-t5', type: 'text', content: 'Finanças', x: 3, y: 43, w: 15, h: 4, zIndex: 1, style: { fontSize: 9, textAlign: 'right', fontFamily: 'Playfair Display', color: '#9c6644', fontWeight: 'bold' } },
            { id: 'rv-b1', type: 'box', x: 10, y: 82, w: 80, h: 14, zIndex: 0, style: { borderWidth: 1, borderColor: '#c3d9cc', borderRadius: 10, backgroundColor: '#f2f7f4' } },
            { id: 'rv-t6', type: 'text', content: 'PLANO DE AÇÃO & EQUILÍBRIO:', x: 12, y: 83.5, w: 76, h: 3, zIndex: 1, style: { fontSize: 8, fontWeight: 'bold', color: '#4a705a', fontFamily: 'Montserrat' } },
            { id: 'rv-l3', type: 'lines', x: 12, y: 87.5, w: 76, h: 7, zIndex: 1, style: { lineSpacing: 15, color: '#b7d1c2' } },
        ]
    },
    {
        id: 'tpl-viagem',
        name: 'Planejamento de Viagem',
        elements: [
            { id: 'via-t1', type: 'text', content: 'PLANEJAMENTO DE VIAGEM', x: 10, y: 5, w: 80, h: 6, zIndex: 1, style: { fontSize: 17, fontWeight: 'bold', textAlign: 'center', color: '#6d4352', fontFamily: 'Playfair Display', letterSpacing: 1.5 } },
            { id: 'via-b1', type: 'box', x: 5, y: 14, w: 90, h: 20, zIndex: 0, style: { borderWidth: 1, borderColor: '#ebd4bc', borderRadius: 10, backgroundColor: '#fdf8f3' } },
            { id: 'via-t2', type: 'text', content: 'DESTINO:', x: 7, y: 16.5, w: 15, h: 4, zIndex: 1, style: { fontSize: 9, fontWeight: 'bold', color: '#9c6644', fontFamily: 'Montserrat' } },
            { id: 'via-l1', type: 'lines', x: 22, y: 16.5, w: 71, h: 4, zIndex: 1, style: { color: '#e6ccb2' } },
            { id: 'via-t3', type: 'text', content: 'DATA:', x: 7, y: 24.5, w: 10, h: 4, zIndex: 1, style: { fontSize: 9, fontWeight: 'bold', color: '#9c6644', fontFamily: 'Montserrat' } },
            { id: 'via-l2', type: 'lines', x: 17, y: 24.5, w: 76, h: 4, zIndex: 1, style: { color: '#e6ccb2' } },
            
            { id: 'via-b2', type: 'box', x: 5, y: 38, w: 43, h: 56, zIndex: 0, style: { borderWidth: 1, borderColor: '#f3c6d1', borderRadius: 10, backgroundColor: '#fdf2f4' } },
            { id: 'via-t4', type: 'text', content: 'CHECKLIST DE MALAS', x: 7, y: 40, w: 39, h: 4, zIndex: 1, style: { fontSize: 10, fontWeight: 'bold', textAlign: 'center', color: '#9d4e64', fontFamily: 'Playfair Display' } },
            { id: 'via-l3', type: 'lines', x: 7, y: 46, w: 39, h: 45, zIndex: 1, style: { lineSpacing: 20, color: '#eabcc8' } },
            
            { id: 'via-b3', type: 'box', x: 52, y: 38, w: 43, h: 56, zIndex: 0, style: { borderWidth: 1, borderColor: '#c3d9cc', borderRadius: 10, backgroundColor: '#f2f7f4' } },
            { id: 'via-t5', type: 'text', content: 'ROTEIRO & LUGARES', x: 54, y: 40, w: 39, h: 4, zIndex: 1, style: { fontSize: 10, fontWeight: 'bold', textAlign: 'center', color: '#4a705a', fontFamily: 'Playfair Display' } },
            { id: 'via-l4', type: 'lines', x: 54, y: 46, w: 39, h: 45, zIndex: 1, style: { lineSpacing: 20, color: '#b7d1c2' } },
        ]
    },
    {
        id: 'tpl-mensal-completo',
        name: 'Calendário Mensal Completo (Pastel)',
        elements: [
            // Fundo Aquarela Topo + Ornamento Floral
            { id: 'mc-blob', type: 'vector_shape', name: 'Aquarela Topo Mensal', x: 6, y: 3, w: 38, h: 12, zIndex: 0, style: { shapeType: 'organic_blob_elongated', backgroundColor: '#fce7ec', borderColor: 'transparent', borderWidth: 0, fillOpacity: 0.7 } },
            { id: 'mc-mno', type: 'month_number', x: 8, y: 5.5, w: 13, h: 8, zIndex: 2, style: { fontSize: 30, fontWeight: 'bold', fontFamily: 'Playfair Display', color: '#b56576', textAlign: 'right' } },
            { id: 'mc-sep', type: 'lines', x: 23, y: 6, w: 0.5, h: 7.5, zIndex: 2, style: { color: '#f3c6d1', borderWidth: 1.2 } },
            { id: 'mc-mna', type: 'month_name', x: 25.5, y: 6, w: 44, h: 7.5, zIndex: 2, style: { fontSize: 21, fontWeight: 'bold', fontFamily: 'Playfair Display', color: '#6d4352', textTransform: 'uppercase', letterSpacing: 1.5 } },
            { id: 'mc-yr', type: 'year', x: 72, y: 6, w: 20, h: 7.5, zIndex: 2, style: { fontSize: 20, fontWeight: 'normal', fontFamily: 'Dancing Script', color: '#a47148', textAlign: 'right' } },
            { 
                id: 'mc-cal', 
                type: 'mini_calendar', 
                x: 8, y: 16.5, w: 84, h: 61, 
                zIndex: 1, 
                style: { 
                    useGlobalStyle: false, 
                    calendarOffset: 0, 
                    fullCalendar: { 
                        showYearInTitle: false, 
                        weekdayFormat: 'short', 
                        title: { fontSize: 0, color: 'transparent' }, 
                        weekDays: { fontSize: 8, fontWeight: 'bold', color: '#9d4e64', textAlign: 'center', fontFamily: 'Montserrat' }, 
                        days: { fontSize: 9.5, color: '#594149', textAlign: 'center', fontFamily: 'Inter' }, 
                        grid: { 
                            borderColor: '#f3c6d1', 
                            borderWidth: 0.8, 
                            borderStyle: 'solid', 
                            cellBackgroundColor: '#fffbfc', 
                            headerBackgroundColor: '#fdf2f4', 
                            borders: { top: true, bottom: true, left: true, right: true, insideHorizontal: true, insideVertical: true, headerSeparator: true } 
                        } 
                    } 
                } 
            },
            { id: 'mc-nbx', type: 'box', x: 8, y: 80, w: 84, h: 15, zIndex: 0, style: { borderWidth: 1, borderColor: '#c3d9cc', borderRadius: 10, backgroundColor: '#f2f7f4' } },
            { id: 'mc-ntt', type: 'text', content: 'PRIORIDADES & NOTAS DO MÊS', x: 11, y: 81.5, w: 50, h: 3, zIndex: 1, style: { fontSize: 8, fontWeight: 'bold', color: '#4a705a', fontFamily: 'Playfair Display', letterSpacing: 1 } },
            { id: 'mc-nls', type: 'lines', x: 11, y: 85.5, w: 78, h: 8, zIndex: 1, style: { color: '#b7d1c2', lineSpacing: 16, borderWidth: 0.5 } }
        ]
    },
    {
        id: 'tpl-mensal-spread-le',
        name: 'Planner Mensal - Foco (Esquerda)',
        elements: [
            { id: 'msl-mno', type: 'month_number', x: 10, y: 10, w: 15, h: 10, zIndex: 1, style: { fontSize: 36, fontWeight: 'bold', color: '#b56576', fontFamily: 'Playfair Display' } },
            { id: 'msl-mna', type: 'month_name', x: 26, y: 10, w: 64, h: 10, zIndex: 1, style: { fontSize: 26, fontWeight: 'bold', color: '#6d4352', fontFamily: 'Playfair Display', textTransform: 'uppercase' } },
            { id: 'msl-bx', type: 'box', x: 10, y: 24, w: 80, h: 66, zIndex: 0, style: { borderWidth: 1, borderColor: '#f3c6d1', borderRadius: 12, backgroundColor: '#fdf2f4' } },
            { id: 'msl-tt', type: 'text', content: 'CONQUISTAS E FOCO DO MÊS', x: 14, y: 27, w: 72, h: 4, zIndex: 1, style: { fontSize: 11, fontWeight: 'bold', color: '#9d4e64', fontFamily: 'Playfair Display', letterSpacing: 1 } },
            { id: 'msl-ls', type: 'lines', x: 14, y: 35, w: 72, h: 50, zIndex: 1, style: { color: '#eabcc8', lineSpacing: 24, borderWidth: 0.5 } }
        ]
    },
    {
        id: 'tpl-mensal-spread-ri',
        name: 'Planner Mensal - Calendário (Direita)',
        elements: [
            { id: 'msr-mna', type: 'month_name', x: 10, y: 10, w: 50, h: 10, zIndex: 1, style: { fontSize: 16, fontWeight: 'bold', color: '#9d4e64', fontFamily: 'Playfair Display', textTransform: 'uppercase' } },
            { id: 'msr-yr', type: 'year', x: 60, y: 10, w: 30, h: 10, zIndex: 1, style: { fontSize: 18, fontWeight: 'normal', color: '#a47148', fontFamily: 'Dancing Script', textAlign: 'right' } },
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
                        weekDays: { fontSize: 8, fontWeight: 'bold', color: '#9d4e64', textAlign: 'center', fontFamily: 'Montserrat' }, 
                        days: { fontSize: 10, color: '#594149', textAlign: 'center', fontFamily: 'Inter' }, 
                        grid: { 
                            borderColor: '#f3c6d1', 
                            borderWidth: 0.8, 
                            borderStyle: 'solid', 
                            cellBackgroundColor: '#fffbfc', 
                            headerBackgroundColor: '#fdf2f4', 
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
            { id: 'spl-mno', type: 'month_number', x: 10, y: 7, w: 12, h: 8, zIndex: 1, style: { fontSize: 32, fontWeight: 'bold', fontFamily: 'Playfair Display', color: '#b56576', textAlign: 'right' } },
            { id: 'spl-sep', type: 'lines', x: 24, y: 7, w: 0.5, h: 8, zIndex: 1, style: { color: '#f3c6d1', borderWidth: 1 } },
            { id: 'spl-mna', type: 'month_name', x: 27, y: 7, w: 60, h: 8, zIndex: 1, style: { fontSize: 22, fontWeight: 'bold', fontFamily: 'Playfair Display', color: '#6d4352', textTransform: 'uppercase', letterSpacing: 1.5 } },
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
                        weekDays: { fontSize: 8, fontWeight: 'bold', color: '#9d4e64', textAlign: 'center', fontFamily: 'Montserrat' }, 
                        days: { fontSize: 10, color: '#594149', textAlign: 'center', fontFamily: 'Inter' }, 
                        grid: { 
                            borderColor: '#f3c6d1', 
                            borderWidth: 0.8, 
                            borderStyle: 'solid', 
                            cellBackgroundColor: '#fffbfc', 
                            headerBackgroundColor: '#fdf2f4', 
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
            { id: 'spr-mna', type: 'month_name', x: 10, y: 7, w: 50, h: 8, zIndex: 1, style: { fontSize: 16, fontWeight: 'bold', color: '#9d4e64', fontFamily: 'Playfair Display', textTransform: 'uppercase' } },
            { id: 'spr-yr', type: 'year', x: 60, y: 7, w: 30, h: 8, zIndex: 1, style: { fontSize: 18, fontWeight: 'normal', color: '#a47148', fontFamily: 'Dancing Script', textAlign: 'right' } },
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
                        weekDays: { fontSize: 8, fontWeight: 'bold', color: '#9d4e64', textAlign: 'center', fontFamily: 'Montserrat' }, 
                        days: { fontSize: 10, color: '#594149', textAlign: 'center', fontFamily: 'Inter' }, 
                        grid: { 
                            borderColor: '#f3c6d1', 
                            borderWidth: 0.8, 
                            borderStyle: 'solid', 
                            cellBackgroundColor: '#fffbfc', 
                            headerBackgroundColor: '#fdf2f4', 
                            borders: { top: true, bottom: true, left: true, right: true, insideHorizontal: true, insideVertical: true, headerSeparator: true } 
                        } 
                    } 
                } 
            }
        ]
    }
];
