
import React from 'react';
import { Moon, Circle } from 'lucide-react';
import { BaseElementProps } from './types';

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
                    <span className="whitespace-nowrap truncate" style={{ fontSize: style.fontSize, fontFamily: style.fontFamily, color: style.color }}>
                        {phase}
                    </span>
                </div>
            );
        }
        return null;
    }

    if (element.type === 'habit_tracker') {
        const markerType = style.habitMarkerType || 'square';
        const markerSize = style.habitMarkerSize || 16;
        const markerStroke = style.habitMarkerStroke || 1.5;
        const spacing = style.habitSpacing || 4;
        const lineWidth = style.habitLineWidth || 1;
        const color = style.habitColor || style.color || '#d1d5db';
        const fillColor = style.habitFillColor || style.backgroundColor || 'transparent';
        const showLabel = style.habitShowLabel !== false;
        const label = style.habitLabel || 'Hábitos';
        
        // Calculate how many rows fit
        const rowHeight = Math.max(markerSize, 12) + spacing;
        const estimatedLabelHeight = showLabel ? (style.fontSize ? style.fontSize * 1.3 + 4 : 20) : 0;
        const availableHeight = (element.h / 100 * pageHeight) - estimatedLabelHeight;
        
        // Use a small negative buffer to ensure we don't render a row that barely fits but might be cut by sub-pixel rendering
        const habitCount = Math.max(0, Math.floor((availableHeight - 1) / rowHeight));

        const renderMarker = () => {
            if (markerType === 'dot') {
                return (
                    <svg viewBox="0 0 24 24" style={{ width: markerSize, height: markerSize }} className="mr-2 shrink-0">
                        <circle cx="12" cy="12" r="10" stroke={color} strokeWidth={markerStroke} fill={fillColor} />
                    </svg>
                );
            }
            if (markerType === 'check') {
                return (
                    <svg viewBox="0 0 24 24" style={{ width: markerSize, height: markerSize }} className="mr-2 shrink-0">
                        <rect x="2" y="2" width="20" height="20" rx="4" stroke={color} strokeWidth={markerStroke} fill={fillColor} />
                        <path d="M7 12l3 3 7-7" stroke={color} strokeWidth={markerStroke} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                );
            }
            // Default square
            return (
                <div 
                    style={{ 
                        width: markerSize, 
                        height: markerSize, 
                        borderColor: color, 
                        borderWidth: markerStroke, 
                        borderStyle: 'solid',
                        backgroundColor: fillColor,
                        borderRadius: 2
                    }} 
                    className="mr-2 shrink-0"
                />
            );
        };

        return (
            <div className="w-full h-full flex flex-col" style={{ opacity: style.opacity }}>
                {showLabel && (
                    <div 
                        style={{ 
                            fontSize: style.fontSize || 10, 
                            fontFamily: style.fontFamily,
                            fontWeight: style.fontWeight || 'bold',
                            color: style.color || '#6b7280',
                            textAlign: (style.textAlign as any) || 'left',
                            textTransform: (style.textTransform as any) || 'uppercase',
                            letterSpacing: `${style.letterSpacing || 0}px`
                        }} 
                        className="mb-1"
                    >
                        {label}
                    </div>
                )}
                <div className="flex-1 flex flex-col overflow-hidden" style={{ gap: spacing }}>
                    {Array(habitCount).fill(0).map((_, i) => (
                        <div key={i} className="flex items-center shrink-0" style={{ height: markerSize }}>
                            {renderMarker()}
                            <div 
                                className="w-full rounded" 
                                style={{ 
                                    height: lineWidth,
                                    backgroundColor: style.borderColor || '#f3f4f6'
                                }} 
                            />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (element.type === 'note_grid') {
        const isSquared = style.variant === 'squared';
        const gridSize = style.gridSize || 15;
        const color = style.borderColor || style.color || '#ccc';
        const borderStyle = style.borderStyle || 'solid';
        const borderWidth = style.borderWidth || 1;

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
            gridStyle = { 
                backgroundImage: `radial-gradient(${color} ${borderWidth}px, transparent ${borderWidth}px)`, 
                backgroundSize: `${gridSize}px ${gridSize}px` 
            };
        }
        return <div className="w-full h-full" style={{ ...gridStyle, opacity: style.opacity }}></div>;
    }

    return null;
};
