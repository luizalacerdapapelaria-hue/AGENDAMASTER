
import React from 'react';
import { BaseElementProps } from './types';

export const ShapeElement: React.FC<BaseElementProps> = ({ element, isEditor, style, pageHeight, pageWidth }) => {
    
    const getBackgroundStyle = () => {
        if (style.backgroundType === 'gradient' && style.gradientColors) {
            const stop0 = style.gradientColors[0] || 'transparent';
            const stop1 = style.gradientColors[1] || 'transparent';
            if (style.gradientType === 'radial') {
                return `radial-gradient(circle, ${stop0}, ${stop1})`;
            } else {
                const deg = style.gradientDirection !== undefined ? style.gradientDirection : 180;
                return `linear-gradient(${deg}deg, ${stop0}, ${stop1})`;
            }
        }
        return style.backgroundColor || 'transparent';
    };
  
    const getBoxShadow = () => {
        if (!style.boxShadow || style.boxShadow === 'none') return 'none';
        if (style.boxShadow === 'sm') return '0 2px 4px -1px rgba(0, 0, 0, 0.15), 0 1px 2px -1px rgba(0, 0, 0, 0.1)';
        if (style.boxShadow === 'md') return '0 6px 12px -2px rgba(0, 0, 0, 0.2), 0 3px 6px -2px rgba(0, 0, 0, 0.15)';
        if (style.boxShadow === 'lg') return '0 12px 24px -4px rgba(0, 0, 0, 0.25), 0 6px 10px -4px rgba(0, 0, 0, 0.2)';
        return style.boxShadow;
    };

    if (element.type === 'lines') {
        const borderWidthVal = style.borderWidth !== undefined ? style.borderWidth : 0.5;
        const borderStyleVal = style.borderStyle || 'solid';
        const isSingleLine = !style.showTimes && (element.h < 3 || (style.lineSpacing && element.h / 100 * pageHeight <= style.lineSpacing));
        const dashArray = borderStyleVal === 'dashed' ? '5,5' : (borderStyleVal === 'dotted' ? `${Math.max(1, borderWidthVal)},${Math.max(2, borderWidthVal * 2)}` : 'none');
        const strokeColor = style.hideLines ? 'transparent' : (style.borderColor || style.color || '#d1d5db');
        
        if (isSingleLine) {
            return (
                <div className="w-full h-full flex items-center justify-center">
                    <svg className="w-full h-full overflow-visible">
                        <line 
                            x1="0" 
                            y1="50%" 
                            x2="100%" 
                            y2="50%" 
                            stroke={strokeColor} 
                            strokeWidth={borderWidthVal} 
                            strokeDasharray={dashArray} 
                            vectorEffect="non-scaling-stroke" 
                        />
                    </svg>
                </div>
            );
        }
        
        const heightPx = (element.h / 100 * pageHeight);
        let lineCount = 0;
        let finalLineSpacing = style.lineSpacing || 24;
        const timesList: string[] = [];

        if (style.showTimes) {
            const startH = style.startHour !== undefined ? style.startHour : 7;
            const endH = style.endHour !== undefined ? style.endHour : 18;
            const intervalM = style.timeInterval || 60;
            
            const startMin = startH * 60;
            const endMin = endH * 60;
            
            for (let min = startMin; min <= endMin; min += intervalM) {
                const hourPart = Math.floor(min / 60) % 24;
                const minPart = min % 60;
                timesList.push(`${String(hourPart).padStart(2, '0')}:${String(minPart).padStart(2, '0')}`);
            }
            lineCount = timesList.length;
        } else if (style.rowCount && style.rowCount > 0) {
            lineCount = style.rowCount;
            finalLineSpacing = heightPx / lineCount;
        } else {
            // Use a small negative buffer to ensure we don't render a line that barely fits but might be cut by sub-pixel rendering
            lineCount = Math.floor((heightPx - 1) / finalLineSpacing);
        }

        const textAlign = style.textAlign || 'left';
        const verticalAlign = style.verticalAlign || 'middle';
        const timePosition = style.timePosition || 'left';
        const timeWidthPx = style.timeWidth || 36;

        let flexVerticalAlign = 'items-center';
        let selfVerticalAlign = 'self-center';
        let verticalOffset = '0px';

        if (verticalAlign === 'top') {
            flexVerticalAlign = 'items-start';
            selfVerticalAlign = 'self-start';
            verticalOffset = '2px';
        } else if (verticalAlign === 'bottom') {
            flexVerticalAlign = 'items-end';
            selfVerticalAlign = 'self-end';
            verticalOffset = `-${borderWidthVal / 2}px`;
        }

        let flexHorizontalAlign = 'justify-start';
        if (textAlign === 'center') {
            flexHorizontalAlign = 'justify-center';
        } else if (textAlign === 'right') {
            flexHorizontalAlign = 'justify-end';
        }

        return (
            <>
                {Array(lineCount).fill(0).map((_, i) => {
                    const timeText = style.showTimes && timesList[i];
                    
                    const timeNode = timeText ? (
                        <div 
                            className={`shrink-0 select-none flex ${flexHorizontalAlign} ${selfVerticalAlign}`}
                            style={{ 
                                width: style.timeWidth ? `${style.timeWidth}px` : undefined,
                                minWidth: `${timeWidthPx}px`,
                                paddingRight: timePosition === 'left' ? '8px' : '0px',
                                paddingLeft: timePosition === 'right' ? '8px' : '0px',
                                marginBottom: verticalAlign === 'bottom' ? verticalOffset : undefined,
                                marginTop: verticalAlign === 'top' ? verticalOffset : undefined,
                                justifyContent: textAlign === 'center' ? 'center' : (textAlign === 'right' ? 'flex-end' : 'flex-start'),
                                alignItems: verticalAlign === 'top' ? 'flex-start' : (verticalAlign === 'bottom' ? 'flex-end' : 'center')
                            }}
                        >
                            <span 
                                style={{ 
                                    fontFamily: style.fontFamily || 'monospace',
                                    fontSize: style.fontSize || 10,
                                    fontWeight: style.fontWeight || 'normal',
                                    color: style.color || '#6b7280',
                                    letterSpacing: style.letterSpacing ? `${style.letterSpacing}px` : undefined,
                                    textTransform: (style.textTransform as any) || 'none',
                                    backgroundColor: style.backgroundColor || 'transparent',
                                    textAlign: textAlign as any,
                                    lineHeight: 1,
                                    display: 'block',
                                    width: '100%'
                                }}
                            >
                                {timeText}
                            </span>
                        </div>
                    ) : null;

                    return (
                        <div 
                            key={i} 
                            className={`w-full flex relative`} 
                            style={{ 
                                height: finalLineSpacing,
                                alignItems: verticalAlign === 'top' ? 'flex-start' : (verticalAlign === 'bottom' ? 'flex-end' : 'center')
                            }}
                        >
                            {timeNode && timePosition === 'left' && timeNode}
                            <div className="flex-1 self-end relative w-full h-[1px] flex items-center">
                                <svg className="w-full h-full overflow-visible">
                                    <line 
                                        x1="0" 
                                        y1="0" 
                                        x2="100%" 
                                        y2="0" 
                                        stroke={strokeColor} 
                                        strokeWidth={borderWidthVal} 
                                        strokeDasharray={dashArray} 
                                        vectorEffect="non-scaling-stroke" 
                                    />
                                </svg>
                            </div>
                            {timeNode && timePosition === 'right' && timeNode}
                        </div>
                    );
                })}
            </>
        );
    }

    if (element.type === 'box') {
        const strokeWidth = style.borderWidth !== undefined ? style.borderWidth : 0;
        const strokeColor = style.borderColor || '#000000';
        const borderRadius = style.borderRadius || 0;
        const borderStyle = style.borderStyle || 'solid';
        const dashArray = borderStyle === 'dashed' ? '5,5' : (borderStyle === 'dotted' ? `${Math.max(1, strokeWidth)},${Math.max(2, strokeWidth * 2)}` : 'none');

        return (
            <div className="w-full h-full relative" style={{ 
                background: getBackgroundStyle(),
                borderRadius: `${borderRadius}px`,
                boxShadow: getBoxShadow(),
                opacity: style.opacity ?? 1
            }}>
                {strokeWidth > 0 && (
                    <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
                        <rect 
                            x="0" 
                            y="0" 
                            width="100%" 
                            height="100%" 
                            rx={borderRadius} 
                            ry={borderRadius} 
                            fill="none" 
                            stroke={strokeColor} 
                            strokeWidth={strokeWidth} 
                            strokeDasharray={dashArray} 
                            vectorEffect="non-scaling-stroke" 
                        />
                    </svg>
                )}
            </div>
        );
    }

    if (element.type === 'circle') {
        const strokeWidth = style.borderWidth !== undefined ? style.borderWidth : 0;
        const strokeColor = style.borderColor || '#000000';
        const borderStyle = style.borderStyle || 'solid';
        const dashArray = borderStyle === 'dashed' ? '5,5' : (borderStyle === 'dotted' ? `${Math.max(1, strokeWidth)},${Math.max(2, strokeWidth * 2)}` : 'none');

        return (
            <div className="w-full h-full rounded-full relative" style={{ 
                background: getBackgroundStyle(),
                boxShadow: getBoxShadow(),
                opacity: style.opacity ?? 1
            }}>
                {strokeWidth > 0 && (
                    <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
                        <ellipse 
                            cx="50%" 
                            cy="50%" 
                            rx="50%" 
                            ry="50%" 
                            fill="none" 
                            stroke={strokeColor} 
                            strokeWidth={strokeWidth} 
                            strokeDasharray={dashArray} 
                            vectorEffect="non-scaling-stroke" 
                        />
                    </svg>
                )}
            </div>
        );
    }

    if (element.type === 'vector_shape') {
        const shapeType = style.shapeType || 'rectangle';
        const strokeColor = style.borderColor || '#000000';
        const strokeWidth = style.borderWidth !== undefined ? style.borderWidth : 1;
        const opacity = style.opacity ?? 1;
        const borderRadius = style.borderRadius || 0;

        const isGradient = style.backgroundType === 'gradient';
        const gradientId = `grad-${element.id}`;
        const fillColor = isGradient ? `url(#${gradientId})` : (style.backgroundColor || 'transparent');
        const fillOpacity = style.fillOpacity ?? 1;
        const strokeOpacity = style.strokeOpacity ?? 1;

        const getShapePath = () => {
            switch (shapeType) {
                case 'rectangle': return 'M 5,5 H 95 V 95 H 5 Z';
                case 'circle': return 'M 50,5 A 45,45 0 1,1 50,95 A 45,45 0 1,1 50,5 Z';
                case 'triangle': return 'M 50,5 L 95,95 L 5,95 Z';
                case 'star': return 'M 50,5 L 61,35 L 95,35 L 68,55 L 78,85 L 50,65 L 22,85 L 32,55 L 5,35 L 39,35 Z';
                case 'heart': return 'M 50,30 C 50,15 70,10 80,25 C 90,40 75,60 50,85 C 25,60 10,40 20,25 C 30,10 50,15 50,30 Z';
                case 'arrow': return 'M 5,40 H 60 V 15 L 95,50 L 60,85 V 60 H 5 Z';
                case 'diamond': return 'M 50,5 L 95,50 L 50,95 L 5,50 Z';
                case 'hexagon': return 'M 50,5 L 95,25 V 75 L 50,95 L 5,75 V 25 Z';
                case 'octagon': return 'M 30,5 H 70 L 95,30 V 70 L 70,95 H 30 L 5,70 V 30 Z';
                case 'pentagon': return 'M 50,5 L 95,38 L 78,92 H 22 L 5,38 Z';
                case 'parallelogram': return 'M 20,5 H 95 L 80,95 H 5 Z';
                case 'trapezoid': return 'M 30,5 H 70 L 95,95 H 5 Z';
                case 'cloud': return 'M 25,75 C 5,75 5,45 25,45 C 25,25 55,25 55,45 C 75,45 75,75 55,75 Z';
                case 'shield': return 'M 5,10 H 95 V 50 C 95,75 50,95 50,95 C 50,95 5,75 5,50 Z';
                default: return 'M 5,5 H 95 V 95 H 5 Z';
            }
        };

        const renderGradient = () => {
            if (!isGradient || !style.gradientColors) return null;
            const stop0 = style.gradientColors[0] || '#ffffff';
            const stop1 = style.gradientColors[1] || '#000000';
            
            if (style.gradientType === 'radial') {
                return (
                    <radialGradient id={gradientId} cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                        <stop offset="0%" stopColor={stop0} />
                        <stop offset="100%" stopColor={stop1} />
                    </radialGradient>
                );
            } else {
                const angle = style.gradientDirection || 0;
                const r = (angle * Math.PI) / 180;
                const x1 = Math.round(50 + Math.sin(r) * 50) + '%';
                const y1 = Math.round(50 + Math.cos(r + Math.PI) * 50) + '%';
                const x2 = Math.round(50 + Math.sin(r + Math.PI) * 50) + '%';
                const y2 = Math.round(50 + Math.cos(r) * 50) + '%';
                
                return (
                    <linearGradient id={gradientId} x1={x1} y1={y1} x2={x2} y2={y2}>
                        <stop offset="0%" stopColor={stop0} />
                        <stop offset="100%" stopColor={stop1} />
                    </linearGradient>
                );
            }
        };

        const shadowStyle = getBoxShadow();
        const dropShadowFilter = shadowStyle && shadowStyle !== 'none'
            ? (style.boxShadow === 'sm' ? 'drop-shadow(0px 2px 4px rgba(0,0,0,0.18))' : style.boxShadow === 'md' ? 'drop-shadow(0px 5px 8px rgba(0,0,0,0.22))' : style.boxShadow === 'lg' ? 'drop-shadow(0px 10px 15px rgba(0,0,0,0.28))' : 'none')
            : 'none';

        return (
            <div className="w-full h-full" style={{ opacity, filter: dropShadowFilter !== 'none' ? dropShadowFilter : undefined }}>
                <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                    <defs>
                        {renderGradient()}
                    </defs>
                    {shapeType === 'rectangle' ? (
                        <rect 
                            x="5" y="5" width="90" height="90"
                            rx={borderRadius / 2} ry={borderRadius / 2}
                            fill={fillColor} 
                            fillOpacity={fillOpacity}
                            stroke={strokeColor} 
                            strokeOpacity={strokeOpacity}
                            strokeWidth={strokeWidth} 
                            strokeDasharray={style.borderStyle === 'dashed' ? '5,5' : style.borderStyle === 'dotted' ? '2,2' : 'none'}
                            vectorEffect="non-scaling-stroke"
                        />
                    ) : (
                        <path 
                            d={getShapePath()} 
                            fill={fillColor} 
                            fillOpacity={fillOpacity}
                            stroke={strokeColor} 
                            strokeOpacity={strokeOpacity}
                            strokeWidth={strokeWidth} 
                            strokeDasharray={style.borderStyle === 'dashed' ? '5,5' : style.borderStyle === 'dotted' ? '2,2' : 'none'}
                            vectorEffect="non-scaling-stroke"
                        />
                    )}
                </svg>
            </div>
        );
    }

    return null;
};
