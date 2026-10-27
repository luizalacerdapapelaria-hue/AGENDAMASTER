import React from 'react';
import { CoverProjectConfig, CoverPage } from '../../../../types';
import { formatMmLabel, formatCmLabel } from './coverGabaritoData';

interface CoverCanvasOverlayProps {
  coverConfig: CoverProjectConfig;
  activePage: CoverPage;
  canvasWidthPx: number;
  canvasHeightPx: number;
}

export const CoverCanvasOverlay: React.FC<CoverCanvasOverlayProps> = ({
  coverConfig,
  activePage,
  canvasWidthPx,
  canvasHeightPx
}) => {
  const { cardboardSize, bleedMm, guides, wireO, elastic, spine } = coverConfig;

  const isEndsheet = activePage.type === 'endsheet_front' || activePage.type === 'endsheet_back' || (activePage as any).type === 'guard' || activePage.id?.includes('guard') || activePage.id?.includes('endsheet');
  const isSpread = !isEndsheet && (activePage.type === 'spread' || spine?.enabled);
  const isFront = activePage.type === 'front';
  const isBack = activePage.type === 'back';

  // Guardas são exatamente do tamanho do papelão definido, sem vira
  const effectiveBleedMm = isEndsheet ? 0 : bleedMm;
  
  const totalWidthMm = isSpread
    ? (cardboardSize.width * 2) + spine.calculatedSpineWidthMm + (spine.hingeGapMm * 2) + (effectiveBleedMm * 2)
    : cardboardSize.width + (effectiveBleedMm * 2);

  const totalHeightMm = cardboardSize.height + (effectiveBleedMm * 2);

  // Conversões em porcentagem para o canvas responsivo
  const bleedLeftPct = (effectiveBleedMm / totalWidthMm) * 100;
  const bleedTopPct = (effectiveBleedMm / totalHeightMm) * 100;
  const cardboardWidthPct = (cardboardSize.width / totalWidthMm) * 100;
  const cardboardHeightPct = (cardboardSize.height / totalHeightMm) * 100;

  // Furação do Wire-o centralizada no 1º cm (10mm -> centro em 5mm) a partir da BORDA DO PAPELÃO CINZA
  const wirePitchMm = wireO.pitch === '3:1' ? 8.47 : 12.7; // Passo 3:1 = 8.47mm, 2:1 = 12.7mm
  const holeWidthMm = wireO.pitch === '3:1' ? 4.0 : 5.0;
  const holeHeightMm = wireO.pitch === '3:1' ? 4.0 : 5.5;
  const holeCount = Math.max(3, Math.floor((Math.max(30, cardboardSize.height - 20)) / wirePitchMm) + 1);
  const totalHolesSpanMm = (holeCount - 1) * wirePitchMm;
  const firstHoleOffsetMm = Math.max(5, (cardboardSize.height - totalHolesSpanMm) / 2);

  const effectiveWireMarginMm = wireO.marginMm ?? 5;
  const firstCmFromCardboardPct = (10 / totalWidthMm) * 100;
  const wireCenterFromCardboardPct = (effectiveWireMarginMm / totalWidthMm) * 100;
  const isWireOnRight = isBack; // Na contracapa, o wire-o fica na borda direita do papelão
  const wireAxisLeftPct = isWireOnRight
    ? 100 - bleedLeftPct - wireCenterFromCardboardPct
    : bleedLeftPct + wireCenterFromCardboardPct;

  // Elástico e Ilhós a partir da BORDA DO PAPELÃO CINZA (não da sangria/vira)
  const elasticPosFromCardboardPct = (elastic.positionMm / totalWidthMm) * 100;
  const elasticWidthPct = (elastic.widthMm / totalWidthMm) * 100;

  return (
    <div 
      className="absolute inset-0 pointer-events-none select-none z-30 overflow-hidden font-sans cover-canvas-overlay"
      data-cover-guides="true"
      data-html2canvas-ignore="true"
    >
      {/* 1. ÁREA DA VIRA (DOBRA DO PAPELÃO) - Hachurado suave */}
      {guides.showBleedLine && effectiveBleedMm > 0 && (
        <>
          {/* Top Bleed */}
          <div 
            className="absolute top-0 left-0 right-0 bg-amber-500/10 border-b border-dashed border-amber-600/60"
            style={{ height: `${bleedTopPct}%` }}
          />
          {/* Bottom Bleed */}
          <div 
            className="absolute bottom-0 left-0 right-0 bg-amber-500/10 border-t border-dashed border-amber-600/60"
            style={{ height: `${bleedTopPct}%` }}
          />
          {/* Left Bleed */}
          <div 
            className="absolute top-0 bottom-0 left-0 bg-amber-500/10 border-r border-dashed border-amber-600/60"
            style={{ width: `${bleedLeftPct}%` }}
          />
          {/* Right Bleed */}
          <div 
            className="absolute top-0 bottom-0 right-0 bg-amber-500/10 border-l border-dashed border-amber-600/60"
            style={{ width: `${bleedLeftPct}%` }}
          />

          {/* Badge de identificação da Vira */}
          <div 
            className="absolute top-1 left-2 text-[8px] font-bold tracking-wider uppercase text-amber-700 bg-amber-100/90 px-1.5 py-0.5 rounded shadow-2xs"
          >
            Vira da Capa Dura: {bleedMm}mm
          </div>
        </>
      )}

      {/* 2. LINHA DO PAPELÃO CINZA (HOLLER / PARANÁ) */}
      {guides.showCardboardLine && (
        <div
          className="absolute border-2 border-indigo-600/80 rounded-xs"
          style={{
            top: `${bleedTopPct}%`,
            left: `${bleedLeftPct}%`,
            width: `${cardboardWidthPct}%`,
            height: `${cardboardHeightPct}%`
          }}
        >
          {/* Tag de Medida do Papelão */}
          <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[8px] font-bold px-2 py-0.5 rounded-full shadow-xs whitespace-nowrap">
            Papelão: {formatMmLabel(cardboardSize.width)} × {formatMmLabel(cardboardSize.height)} mm ({formatCmLabel(cardboardSize.width)} × {formatCmLabel(cardboardSize.height)} cm)
          </div>

          {/* 3. MARCAS DE CANTO (FIO DE CABELO A 45 GRAUS) */}
          {guides.showCornerMarks && effectiveBleedMm > 0 && (
            <>
              {/* Canto Superior Esquerdo */}
              <svg className="absolute -top-3 -left-3 w-6 h-6 text-amber-600" viewBox="0 0 24 24">
                <line x1="0" y1="24" x2="24" y2="0" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2" />
              </svg>
              {/* Canto Superior Direito */}
              <svg className="absolute -top-3 -right-3 w-6 h-6 text-amber-600" viewBox="0 0 24 24">
                <line x1="0" y1="0" x2="24" y2="24" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2" />
              </svg>
              {/* Canto Inferior Esquerdo */}
              <svg className="absolute -bottom-3 -left-3 w-6 h-6 text-amber-600" viewBox="0 0 24 24">
                <line x1="0" y1="0" x2="24" y2="24" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2" />
              </svg>
              {/* Canto Inferior Direito */}
              <svg className="absolute -bottom-3 -right-3 w-6 h-6 text-amber-600" viewBox="0 0 24 24">
                <line x1="0" y1="24" x2="24" y2="0" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2" />
              </svg>
            </>
          )}

        </div>
      )}

      {/* 4. FURAÇÃO VIRTUAL DO WIRE-O / ESPIRAL (Centralizada no 1º cm a partir da Borda do Papelão) */}
      {guides.showWireOGuide && wireO.showWireO && !isEndsheet && !(isSpread && spine.enabled) && (
        <>
          {/* Faixa de referência do 1º cm (10mm) a partir da borda do papelão */}
          <div
            className={`absolute pointer-events-none bg-slate-500/[0.06] ${
              isWireOnRight
                ? 'border-l border-dashed border-slate-400/60'
                : 'border-r border-dashed border-slate-400/60'
            }`}
            style={{
              top: `${bleedTopPct}%`,
              height: `${cardboardHeightPct}%`,
              width: `${firstCmFromCardboardPct}%`,
              ...(isWireOnRight
                ? { right: `${bleedLeftPct}%` }
                : { left: `${bleedLeftPct}%` })
            }}
          />

          {/* Eixo Central Exato dos Furos (5mm por padrão = centro do 1º cm do papelão) */}
          <div
            className="absolute pointer-events-none"
            style={{
              top: `${bleedTopPct}%`,
              height: `${cardboardHeightPct}%`,
              left: `${wireAxisLeftPct}%`,
              width: 0
            }}
          >
            {/* Linha Guia do Centro dos Furos */}
            <div className="absolute top-0 bottom-0 left-0 w-px -translate-x-1/2 border-r border-dashed border-slate-600/65" />

            {/* Indicador de Cota/Medida a partir da Borda do Papelão */}
            <div
              className={`absolute top-1 ${
                isWireOnRight ? 'right-2' : 'left-2'
              } flex items-center gap-1 bg-slate-900/90 text-white text-[7px] font-black uppercase px-1.5 py-0.5 rounded shadow z-40 whitespace-nowrap tabular-nums`}
            >
              <span>Wire-o {wireO.pitch}</span>
              <span className="text-amber-300">•</span>
              <span>
                {effectiveWireMarginMm === 5
                  ? 'Centro do 1º cm (5mm do papelão)'
                  : `${effectiveWireMarginMm}mm da borda do papelão`}
              </span>
            </div>

            {/* Furos do Wire-o centralizados com precisão milimétrica */}
            {Array.from({ length: holeCount }).map((_, i) => {
              const holeCenterYMm = firstHoleOffsetMm + i * wirePitchMm;
              const holeTopPct = (holeCenterYMm / cardboardSize.height) * 100;
              const holeW = Math.max(4, (holeWidthMm / totalWidthMm) * canvasWidthPx);
              const holeH = Math.max(4, (holeHeightMm / totalHeightMm) * canvasHeightPx);

              return (
                <div
                  key={i}
                  className={`absolute left-0 border border-slate-700 shadow-2xs ${
                    wireO.shape === 'round' ? 'rounded-full' : 'rounded-[1px]'
                  }`}
                  style={{
                    top: `${holeTopPct}%`,
                    width: `${holeW}px`,
                    height: `${holeH}px`,
                    transform: 'translate(-50%, -50%)',
                    borderColor: '#334155',
                    backgroundColor: 'rgba(203, 213, 225, 0.88)'
                  }}
                  title={`Furo do Wire-o centralizado a ${effectiveWireMarginMm}mm da borda do papelão`}
                />
              );
            })}
          </div>
        </>
      )}

      {/* 6. GUIA DO ELÁSTICO & ILHÓS (Parte RIGOROSAMENTE da Borda do Papelão) */}
      {guides.showElasticGuide && elastic.showElastic && !isEndsheet && (
        <>
          {isFront && (
            /* Elástico na Frente: medido a partir da borda direita do papelão */
            <div
              className="absolute shadow-md opacity-90 transition-all flex items-center justify-center pointer-events-none"
              style={{
                top: `${bleedTopPct}%`,
                height: `${cardboardHeightPct}%`,
                right: `${bleedLeftPct + elasticPosFromCardboardPct}%`,
                transform: 'translateX(50%)',
                width: `${elasticWidthPct}%`,
                backgroundColor: elastic.color
              }}
            >
              {/* Linha de costura central do elástico */}
              <div className="w-px h-full border-r border-dashed border-black/25" />
              
              {/* Passador decorativo opcional */}
              {elastic.showClasp && (
                <div 
                  className="absolute top-1/2 -translate-y-1/2 w-6 h-6 rounded-full border-2 border-amber-300 bg-gradient-to-tr from-amber-400 to-amber-200 shadow-md flex items-center justify-center text-[10px] font-black text-amber-900"
                >
                  {elastic.claspText || '★'}
                </div>
              )}

              {/* Tag com distância a partir da borda do papelão */}
              <span className="absolute -top-4 -translate-x-1/2 left-1/2 text-[7px] font-bold text-slate-800 bg-white/95 border border-slate-300 px-1.5 py-0.5 rounded shadow-2xs whitespace-nowrap">
                Elástico {elastic.widthMm}mm • {elastic.positionMm}mm da borda do papelão
              </span>
            </div>
          )}

          {isBack && (
            /* Furação do Ilhós na Contracapa: medido a partir da borda esquerda do papelão */
            <div
              className="absolute pointer-events-none"
              style={{
                top: `${bleedTopPct}%`,
                height: `${cardboardHeightPct}%`,
                left: `${bleedLeftPct + elasticPosFromCardboardPct}%`,
                transform: 'translateX(-50%)'
              }}
            >
              {/* Linha guia vertical do ilhós */}
              <div className="absolute top-0 bottom-0 w-px border-r border-dashed border-amber-600/50 -translate-x-1/2" />

              {/* Ilhós Superior (18mm da borda do papelão) */}
              <div
                className="absolute -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-slate-800 bg-amber-400 shadow-sm flex items-center justify-center"
                style={{ top: `${Math.min(25, (18 / Math.max(60, cardboardSize.height)) * 100)}%` }}
                title={`Furo do Ilhós Superior a ${elastic.positionMm}mm da borda do papelão`}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-slate-900" />
              </div>

              {/* Ilhós Inferior (18mm da borda do papelão) */}
              <div
                className="absolute -translate-x-1/2 translate-y-1/2 w-4 h-4 rounded-full border-2 border-slate-800 bg-amber-400 shadow-sm flex items-center justify-center"
                style={{ bottom: `${Math.min(25, (18 / Math.max(60, cardboardSize.height)) * 100)}%` }}
                title={`Furo do Ilhós Inferior a ${elastic.positionMm}mm da borda do papelão`}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-slate-900" />
              </div>

              <span 
                className="absolute top-11 -translate-x-1/2 text-[7px] font-bold text-amber-900 bg-amber-100/95 border border-amber-300 px-1.5 py-0.5 rounded shadow-2xs whitespace-nowrap"
              >
                Ilhós: {elastic.positionMm}mm da borda do papelão
              </span>
            </div>
          )}
        </>
      )}

      {/* 7. LOMBADA E COIFAS (QUANDO CAPA INTEIRA / BROCHURA) */}
      {isSpread && spine.enabled && (
        <div 
          className="absolute top-0 bottom-0 border-x-2 border-dashed border-rose-500 bg-rose-500/10 flex flex-col items-center justify-center"
          style={{
            left: '50%',
            transform: 'translateX(-50%)',
            width: `${(spine.calculatedSpineWidthMm / totalWidthMm) * 100}%`
          }}
        >
          <div className="bg-rose-600 text-white text-[7px] font-bold px-1.5 py-0.5 rounded shadow">
            Lombada: {spine.calculatedSpineWidthMm}mm
          </div>
        </div>
      )}

      {/* Rodapé Informativo Rápido das Dimensões */}
      <div className="absolute bottom-1 right-2 bg-slate-900/85 backdrop-blur-xs text-white text-[9px] font-mono font-medium px-2.5 py-1 rounded-md shadow-md flex items-center gap-2 border border-slate-700/60 tabular-nums">
        <span className="inline-block w-2 h-2 rounded-full bg-emerald-400" />
        <span>Papelão: <strong>{formatMmLabel(cardboardSize.width)} × {formatMmLabel(cardboardSize.height)} mm</strong></span>
        <span className="text-slate-400">|</span>
        <span>Impressão c/ Vira {formatMmLabel(effectiveBleedMm)}mm: <strong>{formatMmLabel(totalWidthMm)} × {formatMmLabel(totalHeightMm)} mm</strong></span>
      </div>
    </div>
  );
};
