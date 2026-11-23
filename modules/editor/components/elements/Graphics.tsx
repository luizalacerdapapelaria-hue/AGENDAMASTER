
import React, { useEffect, useId } from 'react';
import { Moon, Circle } from 'lucide-react';
import { BaseElementProps } from './types';
import { getTextStrokeCss } from '../../../../core/logic/textStroke';
import { ensureFontLoaded, getSafeFontFamily } from '../../../../core/logic/fontDetector';
import { getDashArray } from '../../../../core/logic/strokeScale';

export const GraphicsElement: React.FC<BaseElementProps> = ({ element, dayData, style, isEditor, pageHeight, pageWidth, week }) => {
    const patternId = useId();
    useEffect(() => {
        if (style?.fontFamily) {
            ensureFontLoaded(style.fontFamily);
        }
    }, [style?.fontFamily]);
    
    const renderMoonIcon = (phase: string, color: string) => {
        const p = phase.toLowerCase();
        if (p.includes('nova')) return <Circle color={color} className="w-full h-full" strokeWidth={1.5} />;
        if (p.includes('cheia')) return <Circle color={color} fill={color} className="w-full h-full" />;
        
        // Crescente (Waxing - Southern Hemisphere looks like '(')
        // Lucide Moon by default looks like ')' which is Waning in Southern Hemisphere.
        if (p.includes('crescente')) return <Moon color={color} fill={color} className="w-full h-full -scale-x-100" />;
        
        // Minguante (Waning - Southern Hemisphere looks like ')')
        if (p.includes('minguante')) return <Moon color={color} fill={color} className="w-full h-full" />;
        
        return <Circle color={color} className="w-full h-full" strokeWidth={1.5} />;
    };
  
    if (element.type === 'moon') {
        const getPhaseFromWeek = () => {
            if (week && week.length > 0) {
                // Return phase of the first valid day in the week
                const validDay = week.find(d => d.dayOfMonth > 0) || week[0];
                return validDay.moonPhase;
            }
            return null;
        };

        const phase = dayData?.moonPhase || getPhaseFromWeek() || (isEditor ? 'Lua cheia' : '');
        
        if (dayData && dayData.dayOfMonth === 0 && !isEditor) {
            // For padding days, we might want to hide it if it's the Mini Calendar, 
            // but for a day box or standalone element it should probably stay.
            // Let's allow it if the phase name exists.
        }

        if (phase) {
            const variant = style.variant || 'full_info';
            const color = style.color || '#000';
            
            if (variant === 'icon_only') {
                return (
                    <div className="w-full h-full flex items-center justify-center">
                        <div className="w-[80%] h-[80%] flex items-center justify-center">
                            {renderMoonIcon(phase, color)}
                        </div>
                    </div>
                );
            }
            
            return (
                <div className="flex items-center gap-1.5 h-full overflow-visible">
                    <div className="shrink-0 aspect-square" style={{ width: style.fontSize, height: style.fontSize }}>
                        {renderMoonIcon(phase, color)}
                    </div>
                    <span
                        className="whitespace-nowrap truncate"
                        style={{
                            fontSize: style.fontSize,
                            fontFamily: getSafeFontFamily(style.fontFamily),
                            color: style.color,
                            ...getTextStrokeCss(style, style.color || '#000000'),
                        }}
                    >
                        {phase}
                    </span>
                </div>
            );
        }
        return null;
    }

    if (element.type === 'habit_tracker') {
        const scaleFactor = (pageWidth || 400) / 400;
        const markerType = style.habitMarkerType || 'square';
        const rawMarkerSize = style.habitMarkerSize !== undefined ? Number(style.habitMarkerSize) : (16 * scaleFactor);
        const markerSize = Math.max(4, Math.round(Number.isFinite(rawMarkerSize) ? rawMarkerSize : 16 * scaleFactor));
        const rawMarkerStroke = style.habitMarkerStroke !== undefined ? Number(style.habitMarkerStroke) : (1.5 * scaleFactor);
        const markerStroke = Number.isFinite(rawMarkerStroke) && rawMarkerStroke >= 0 ? Math.round(rawMarkerStroke * 100) / 100 : (1.5 * scaleFactor);
        const rawSpacing = style.habitSpacing !== undefined ? Number(style.habitSpacing) : (4 * scaleFactor);
        const spacing = Math.max(0, Math.round(Number.isFinite(rawSpacing) ? rawSpacing : 4 * scaleFactor));
        const rawHabitLineW = style.habitLineWidth !== undefined ? Number(style.habitLineWidth) : (1 * scaleFactor);
        const lineWidth = Number.isFinite(rawHabitLineW) && rawHabitLineW >= 0 ? Math.round(rawHabitLineW * 100) / 100 : (1 * scaleFactor);
        const color = style.habitColor || style.color || '#d1d5db';
        const fillColor = style.habitFillColor || style.backgroundColor || 'transparent';
        const showLabel = style.habitShowLabel !== false;
        const label = style.habitLabel || 'Hábitos';
        const lineColor = style.borderColor || '#f3f4f6';

        // Calculate integer-aligned row count & header height so guide lines never drift across subpixel phases
        const labelFontSize = style.fontSize || (10 * scaleFactor);
        const labelLineHeightPx = Math.round(labelFontSize * 1.25);
        const labelMarginBottomPx = Math.max(2, Math.round(4 * scaleFactor));
        const estimatedLabelHeight = showLabel ? (labelLineHeightPx + labelMarginBottomPx) : 0;
        const rowHeight = Math.max(markerSize, Math.round(12 * scaleFactor)) + spacing;
        const availableHeight = (element.h / 100 * pageHeight) - estimatedLabelHeight;

        // Use a small negative buffer to ensure we don't render a row that barely fits but might be cut by sub-pixel rendering
        const habitCount = Math.max(0, Math.floor((availableHeight - 1) / Math.max(1, rowHeight)));
        const markerMarginRight = Math.max(4, Math.round(8 * scaleFactor));

        const renderMarker = () => {
            const halfS = markerStroke / 2;
            const boxSize = Math.max(0.5, markerSize - markerStroke);
            const hasFill = fillColor && fillColor !== 'transparent';

            if (markerType === 'dot') {
                const r = Math.max(0.5, (markerSize / 2) - halfS);
                return (
                    <svg
                        width={markerSize}
                        height={markerSize}
                        viewBox={`0 0 ${markerSize} ${markerSize}`}
                        style={{ width: markerSize, height: markerSize, marginRight: markerMarginRight }}
                        className="shrink-0 overflow-visible block"
                    >
                        {hasFill && <circle cx={markerSize / 2} cy={markerSize / 2} r={r} fill={fillColor} />}
                        {markerStroke > 0 && (
                            <circle
                                cx={markerSize / 2}
                                cy={markerSize / 2}
                                r={r}
                                fill="none"
                                stroke={color}
                                strokeWidth={markerStroke}
                            />
                        )}
                    </svg>
                );
            }
            if (markerType === 'check') {
                const k = markerSize / 24;
                const rx = Math.max(1, 4 * k);
                const checkPath = `M ${(7 * k).toFixed(2)} ${(12 * k).toFixed(2)} L ${(10 * k).toFixed(2)} ${(15 * k).toFixed(2)} L ${(17 * k).toFixed(2)} ${(8 * k).toFixed(2)}`;
                return (
                    <svg
                        width={markerSize}
                        height={markerSize}
                        viewBox={`0 0 ${markerSize} ${markerSize}`}
                        style={{ width: markerSize, height: markerSize, marginRight: markerMarginRight }}
                        className="shrink-0 overflow-visible block"
                    >
                        {hasFill && (
                            <rect
                                x={halfS}
                                y={halfS}
                                width={boxSize}
                                height={boxSize}
                                rx={rx}
                                ry={rx}
                                fill={fillColor}
                            />
                        )}
                        {markerStroke > 0 && (
                            <>
                                <rect
                                    x={halfS}
                                    y={halfS}
                                    width={boxSize}
                                    height={boxSize}
                                    rx={rx}
                                    ry={rx}
                                    fill="none"
                                    stroke={color}
                                    strokeWidth={markerStroke}
                                />
                                <path
                                    d={checkPath}
                                    stroke={color}
                                    strokeWidth={markerStroke}
                                    fill="none"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </>
                        )}
                    </svg>
                );
            }
            // Default square
            const rx = Math.min(2 * scaleFactor, boxSize / 4);
            return (
                <svg
                    width={markerSize}
                    height={markerSize}
                    viewBox={`0 0 ${markerSize} ${markerSize}`}
                    style={{ width: markerSize, height: markerSize, marginRight: markerMarginRight }}
                    className="shrink-0 overflow-visible block"
                >
                    {hasFill && (
                        <rect
                            x={halfS}
                            y={halfS}
                            width={boxSize}
                            height={boxSize}
                            rx={rx}
                            ry={rx}
                            fill={fillColor}
                        />
                    )}
                    {markerStroke > 0 && (
                        <rect
                            x={halfS}
                            y={halfS}
                            width={boxSize}
                            height={boxSize}
                            rx={rx}
                            ry={rx}
                            fill="none"
                            stroke={color}
                            strokeWidth={markerStroke}
                        />
                    )}
                </svg>
            );
        };

        return (
            <div className="w-full h-full flex flex-col" style={{ opacity: style.opacity }}>
                {showLabel && (
                    <div
                        style={{
                            height: `${labelLineHeightPx}px`,
                            fontSize: labelFontSize,
                            lineHeight: `${labelLineHeightPx}px`,
                            marginBottom: `${labelMarginBottomPx}px`,
                            fontFamily: getSafeFontFamily(style.fontFamily),
                            fontWeight: style.fontWeight || 'bold',
                            fontStyle: style.fontStyle || 'normal',
                            color: style.color || '#6b7280',
                            textAlign: (style.textAlign as any) || 'left',
                            textTransform: (style.textTransform as any) || 'uppercase',
                            letterSpacing: `${style.letterSpacing || 0}px`,
                            overflow: 'visible',
                            ...getTextStrokeCss(style, style.color || '#6b7280'),
                        }}
                    >
                        {label}
                    </div>
                )}
                <div className="flex-1 flex flex-col overflow-hidden" style={{ gap: `${spacing}px` }}>
                    {Array(habitCount).fill(0).map((_, i) => (
                        <div key={i} className="flex items-center shrink-0" style={{ height: `${markerSize}px` }}>
                            {renderMarker()}
                            {lineWidth > 0 && (
                                <div className="flex-1 min-w-0 relative" style={{ height: `${markerSize}px` }}>
                                    <svg
                                        width="100%"
                                        height={Math.max(1, lineWidth)}
                                        className="w-full overflow-visible block"
                                        style={{
                                            position: 'absolute',
                                            left: 0,
                                            right: 0,
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                        }}
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <line
                                            x1="0"
                                            y1="50%"
                                            x2="100%"
                                            y2="50%"
                                            stroke={lineColor}
                                            strokeWidth={lineWidth}
                                        />
                                    </svg>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (element.type === 'note_grid') {
        const scaleFactor = (pageWidth || 400) / 400;
        const isSquared = style.variant === 'squared' || style.variant === 'grid';
        const gridSize = style.gridSize || style.gridSpacing || (18 * scaleFactor);
        const color = style.color || style.borderColor || '#cbd5e1';
        const borderStyle = style.borderStyle || 'solid';
        const rawBorderWidth = style.borderWidth !== undefined ? Number(style.borderWidth) : (0.75 * scaleFactor);
        const borderWidth = Number.isFinite(rawBorderWidth) ? Math.max(0, rawBorderWidth) : (0.75 * scaleFactor);

        if (borderWidth <= 0) {
            return <div className="w-full h-full" />;
        }

        const dashArray = getDashArray(borderStyle, borderWidth, scaleFactor);
        const half = borderWidth / 2;
        const dotRadius = Math.max(0.1 * scaleFactor, borderWidth / 2);

        return (
            <svg
                width="100%"
                height="100%"
                className="w-full h-full block"
                style={{ opacity: style.opacity !== undefined ? style.opacity : 0.7 }}
                xmlns="http://www.w3.org/2000/svg"
            >
                <defs>
                    <pattern id={patternId} width={gridSize} height={gridSize} patternUnits="userSpaceOnUse">
                        {isSquared ? (
                            <>
                                <line
                                    x1={0}
                                    y1={half}
                                    x2={gridSize}
                                    y2={half}
                                    stroke={color}
                                    strokeWidth={borderWidth}
                                    strokeDasharray={dashArray}
                                    strokeLinecap={borderStyle === 'dotted' ? 'round' : 'butt'}
                                />
                                <line
                                    x1={half}
                                    y1={0}
                                    x2={half}
                                    y2={gridSize}
                                    stroke={color}
                                    strokeWidth={borderWidth}
                                    strokeDasharray={dashArray}
                                    strokeLinecap={borderStyle === 'dotted' ? 'round' : 'butt'}
                                />
                            </>
                        ) : (
                            <circle cx={gridSize / 2} cy={gridSize / 2} r={dotRadius} fill={color} />
                        )}
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill={`url(#${patternId})`} />
            </svg>
        );
    }

    return null;
};
