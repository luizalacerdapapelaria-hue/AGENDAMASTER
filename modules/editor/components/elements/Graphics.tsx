
import React from 'react';
import { Moon, Circle } from 'lucide-react';
import { BaseElementProps } from './types';
import { getTextStrokeCss } from '../../../../core/logic/textStroke';

export const GraphicsElement: React.FC<BaseElementProps> = ({ element, dayData, style, isEditor, pageHeight, pageWidth, week }) => {
    
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
                            fontFamily: style.fontFamily,
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
            if (markerType === 'dot') {
                return (
                    <svg viewBox="0 0 24 24" style={{ width: markerSize, height: markerSize, marginRight: markerMarginRight }} className="shrink-0 overflow-visible">
                        <circle cx="12" cy="12" r="10" stroke={color} strokeWidth={markerStroke} fill={fillColor} vectorEffect="non-scaling-stroke" />
                    </svg>
                );
            }
            if (markerType === 'check') {
                return (
                    <svg viewBox="0 0 24 24" style={{ width: markerSize, height: markerSize, marginRight: markerMarginRight }} className="shrink-0 overflow-visible">
                        <rect x="2" y="2" width="20" height="20" rx="4" stroke={color} strokeWidth={markerStroke} fill={fillColor} vectorEffect="non-scaling-stroke" />
                        <path d="M7 12l3 3 7-7" stroke={color} strokeWidth={markerStroke} fill="none" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
                    </svg>
                );
            }
            // Default square
            return (
                <div
                    style={{
                        width: markerSize,
                        height: markerSize,
                        marginRight: markerMarginRight,
                        borderColor: color,
                        borderWidth: markerStroke > 0 ? `${markerStroke}px` : 0,
                        borderStyle: markerStroke > 0 ? 'solid' : 'none',
                        backgroundColor: fillColor,
                        borderRadius: 2,
                        boxSizing: 'border-box',
                    }}
                    className="shrink-0"
                />
            );
        };

        return (
            <div className="w-full h-full flex flex-col" style={{ opacity: style.opacity }}>
                {showLabel && (
                    <div
                        style={{
                            fontSize: labelFontSize,
                            lineHeight: `${labelLineHeightPx}px`,
                            marginBottom: `${labelMarginBottomPx}px`,
                            fontFamily: style.fontFamily,
                            fontWeight: style.fontWeight || 'bold',
                            fontStyle: style.fontStyle || 'normal',
                            color: style.color || '#6b7280',
                            textAlign: (style.textAlign as any) || 'left',
                            textTransform: (style.textTransform as any) || 'uppercase',
                            letterSpacing: `${style.letterSpacing || 0}px`,
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
                                <div
                                    className="flex-1 min-w-0"
                                    style={{
                                        height: `${lineWidth}px`,
                                        borderRadius: 0,
                                        backgroundColor: lineColor,
                                    }}
                                />
                            )}
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (element.type === 'note_grid') {
        const isSquared = style.variant === 'squared' || style.variant === 'grid';
        const gridSize = style.gridSize || style.gridSpacing || 18;
        const color = style.color || style.borderColor || '#cbd5e1';
        const borderStyle = style.borderStyle || 'solid';
        const borderWidth = style.borderWidth !== undefined && style.borderWidth > 0 ? style.borderWidth : 0.75;

        let gridStyle: React.CSSProperties = {};

        if (isSquared) {
            if (borderStyle === 'solid') {
                gridStyle = { 
                    backgroundImage: `linear-gradient(${color} ${borderWidth}px, transparent ${borderWidth}px), linear-gradient(90deg, ${color} ${borderWidth}px, transparent ${borderWidth}px)`,
                    backgroundSize: `${gridSize}px ${gridSize}px`
                };
            } else {
                // For dashed/dotted, use SVG
                const dashArray = borderStyle === 'dashed' ? '4,2' : (borderStyle === 'dotted' ? '1,2' : 'none');
                const svg = `<svg width="${gridSize}" height="${gridSize}" xmlns="http://www.w3.org/2000/svg">
                    <path d="M ${gridSize} 0 L 0 0 0 ${gridSize}" fill="none" stroke="${color}" stroke-width="${borderWidth}" stroke-dasharray="${dashArray}"/>
                </svg>`;
                gridStyle = {
                    backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(svg)}")`,
                    backgroundSize: `${gridSize}px ${gridSize}px`
                };
            }
        } else {
            // Dotted pattern using SVG data URI for crisp dot rendering and reliable color support across all scales
            const dotRadius = Math.max(0.5, borderWidth);
            const svg = `<svg width="${gridSize}" height="${gridSize}" xmlns="http://www.w3.org/2000/svg"><circle cx="${gridSize / 2}" cy="${gridSize / 2}" r="${dotRadius}" fill="${color}"/></svg>`;
            gridStyle = { 
                backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(svg)}")`, 
                backgroundSize: `${gridSize}px ${gridSize}px` 
            };
        }
        return <div className="w-full h-full" style={{ ...gridStyle, opacity: style.opacity !== undefined ? style.opacity : 0.7 }}></div>;
    }

    return null;
};
