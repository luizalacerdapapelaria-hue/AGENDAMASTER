
import React, { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { BaseElementProps } from './types';
import { getVectorShapeById, getSvgPathBounds } from './vectorShapesData';
import { getTextStrokeCss } from '../../../../core/logic/textStroke';
import { ensureFontLoaded, getSafeFontFamily } from '../../../../core/logic/fontDetector';
import { getDashArray, transformSvgPathToBox } from '../../../../core/logic/strokeScale';

export const ShapeElement: React.FC<BaseElementProps> = ({ element, isEditor, style, pageHeight, pageWidth }) => {
    const reactId = useId();
    const containerRef = useRef<HTMLDivElement>(null);
    const [measuredSize, setMeasuredSize] = useState<{ w: number; h: number }>({ w: 0, h: 0 });

    useLayoutEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const measure = () => {
            const w = el.clientWidth;
            const h = el.clientHeight;
            if (w > 0 && h > 0) {
                setMeasuredSize(prev => (prev.w === w && prev.h === h ? prev : { w, h }));
            }
        };
        measure();
        const obs = new ResizeObserver(measure);
        obs.observe(el);
        return () => obs.disconnect();
    }, [element.w, element.h, pageWidth, pageHeight, element.type]);

    useEffect(() => {
        if (style?.fontFamily) {
            ensureFontLoaded(style.fontFamily);
        }
    }, [style?.fontFamily]);

    const scaleFactor = (pageWidth || 400) / 400;
    const fallbackW = Math.max(1, ((element.w || 10) / 100) * (pageWidth || 400));
    const fallbackH = Math.max(1, ((element.h || 10) / 100) * (pageHeight || 567));
    const boxW = measuredSize.w > 0 ? measuredSize.w : fallbackW;
    const boxH = measuredSize.h > 0 ? measuredSize.h : fallbackH;
    
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
        const rawBorderW = style.borderWidth !== undefined ? Number(style.borderWidth) : (1 * scaleFactor);
        const borderWidthVal = Number.isFinite(rawBorderW) && rawBorderW >= 0 ? (rawBorderW <= 0 ? 0 : Math.round(rawBorderW * 1000) / 1000) : (1 * scaleFactor);
        const borderStyleVal = style.borderStyle || 'solid';
        const isVertical = element.w < element.h && element.w < 2;
        const isSingleLine = !style.showTimes && (isVertical || element.h < 3 || (style.lineSpacing && (element.h / 100) * pageHeight <= style.lineSpacing));
        const dashArray = getDashArray(borderStyleVal, borderWidthVal, scaleFactor);
        const strokeColor = style.hideLines ? 'transparent' : (style.borderColor || style.color || '#d1d5db');
        
        if (isSingleLine) {
            if (borderWidthVal <= 0) {
                return <div ref={containerRef} className="w-full h-full" />;
            }
            return (
                <div ref={containerRef} className="w-full h-full flex items-center justify-center">
                    <svg className="w-full h-full overflow-visible">
                        <line 
                            x1={isVertical ? '50%' : '0'} 
                            y1={isVertical ? '0' : '50%'} 
                            x2={isVertical ? '50%' : '100%'} 
                            y2={isVertical ? '100%' : '50%'} 
                            stroke={strokeColor} 
                            strokeWidth={borderWidthVal} 
                            strokeDasharray={dashArray} 
                        />
                    </svg>
                </div>
            );
        }
        
        const heightPx = measuredSize.h > 0 ? measuredSize.h : ((element.h / 100) * pageHeight);
        let lineCount = 0;
        let finalLineSpacing = style.lineSpacing || (24 * scaleFactor);
        const timesList: string[] = [];

        if (style.showTimes) {
            const startH = style.startHour !== undefined ? style.startHour : 7;
            const endH = style.endHour !== undefined ? style.endHour : 20;
            const intervalM = style.timeInterval || ((style as any).stepHour ? (style as any).stepHour * 60 : 60);
            const skipLine = style.skipBlankLine || false;
            
            const startMin = startH * 60;
            const endMin = endH * 60;
            
            for (let min = startMin; min <= endMin; min += intervalM) {
                const hourPart = Math.floor(min / 60) % 24;
                const minPart = min % 60;
                timesList.push(`${String(hourPart).padStart(2, '0')}:${String(minPart).padStart(2, '0')}`);
                if (skipLine && min < endMin) {
                    timesList.push('');
                }
            }
            lineCount = timesList.length;
            if (lineCount > 0 && heightPx > 0) {
                finalLineSpacing = Math.max(8 * scaleFactor, heightPx / lineCount);
            }
        } else if (style.rowCount && style.rowCount > 0) {
            lineCount = style.rowCount;
            finalLineSpacing = Math.max(8 * scaleFactor, heightPx / lineCount);
        } else {
            finalLineSpacing = Math.max(8 * scaleFactor, finalLineSpacing);
            lineCount = Math.floor((heightPx - 0.5) / finalLineSpacing);
        }

        const textAlign = style.textAlign || 'left';
        const verticalAlign = style.verticalAlign || 'middle';
        const timePosition = style.timePosition || 'left';
        const rawTimeW = (style as any).timeColumnWidth || style.timeWidth;
        const timeWidthPx = rawTimeW !== undefined ? Number(rawTimeW) * scaleFactor : (30 * scaleFactor);
        const rawTimeFontSize = (style as any).timeFontSize ? Number((style as any).timeFontSize) * scaleFactor : (style.fontSize || (7.5 * scaleFactor));
        const timeFontSizeVal = Math.min(rawTimeFontSize, Math.max(4.5 * scaleFactor, finalLineSpacing * 0.58));
        const timeColorVal = (style as any).timeColor || style.color || '#6b7280';
        const timeFontWeightVal = (style as any).timeFontWeight || style.fontWeight || 'bold';
        const showCheckboxes = Boolean((style as any).showCheckboxes);
        const checkboxStyle = (style as any).checkboxStyle || 'circle';

        let selfVerticalAlign = 'self-center';
        let verticalOffset = '0px';

        if (verticalAlign === 'top') {
            selfVerticalAlign = 'self-start';
            verticalOffset = `${2 * scaleFactor}px`;
        } else if (verticalAlign === 'bottom') {
            selfVerticalAlign = 'self-end';
            verticalOffset = `-${borderWidthVal / 2}px`;
        }

        let flexHorizontalAlign = 'justify-start';
        if (textAlign === 'center') {
            flexHorizontalAlign = 'justify-center';
        } else if (textAlign === 'right') {
            flexHorizontalAlign = 'justify-end';
        }

        const cbSize = Math.max(5 * scaleFactor, Math.min(11 * scaleFactor, finalLineSpacing * 0.55));
        const cbStrokeW = borderWidthVal;

        return (
            <div ref={containerRef} className="w-full h-full">
                {Array(lineCount).fill(0).map((_, i) => {
                    const rawTimeText = style.showTimes ? (timesList[i] ?? '') : '';
                    const displayTime = rawTimeText || '\u00A0';
                    
                    const timeNode = style.showTimes ? (
                        <div 
                            className={`shrink-0 select-none flex ${flexHorizontalAlign} ${selfVerticalAlign}`}
                            style={{ 
                                width: `${timeWidthPx}px`,
                                minWidth: `${timeWidthPx}px`,
                                paddingRight: timePosition === 'left' ? `${6 * scaleFactor}px` : '0px',
                                paddingLeft: timePosition === 'right' ? `${6 * scaleFactor}px` : '0px',
                                marginBottom: verticalAlign === 'bottom' ? verticalOffset : undefined,
                                marginTop: verticalAlign === 'top' ? verticalOffset : undefined,
                                justifyContent: textAlign === 'center' ? 'center' : (textAlign === 'right' ? 'flex-end' : 'flex-start'),
                                alignItems: verticalAlign === 'top' ? 'flex-start' : (verticalAlign === 'bottom' ? 'flex-end' : 'center')
                            }}
                        >
                            <span 
                                style={{ 
                                    fontFamily: style.fontFamily ? getSafeFontFamily(style.fontFamily) : 'Montserrat, monospace',
                                    fontSize: timeFontSizeVal,
                                    fontWeight: timeFontWeightVal,
                                    fontStyle: style.fontStyle || 'normal',
                                    color: timeColorVal,
                                    letterSpacing: style.letterSpacing ? `${style.letterSpacing}px` : undefined,
                                    textTransform: (style.textTransform as any) || 'none',
                                    backgroundColor: style.backgroundColor || 'transparent',
                                    textAlign: textAlign as any,
                                    lineHeight: 1,
                                    display: 'block',
                                    width: '100%',
                                    visibility: rawTimeText ? 'visible' : 'hidden',
                                    ...getTextStrokeCss({ ...style, color: timeColorVal }, timeColorVal),
                                }}
                            >
                                {displayTime}
                            </span>
                        </div>
                    ) : null;

                    const checkboxNode = (!style.showTimes && showCheckboxes) ? (
                        <svg
                            width={cbSize}
                            height={cbSize}
                            viewBox={`0 0 ${cbSize} ${cbSize}`}
                            className="shrink-0 select-none self-center"
                            style={{ marginRight: `${8 * scaleFactor}px` }}
                        >
                            {checkboxStyle === 'circle' ? (
                                <circle
                                    cx={cbSize / 2}
                                    cy={cbSize / 2}
                                    r={Math.max(0.5, (cbSize - cbStrokeW) / 2)}
                                    fill="#ffffff"
                                    stroke={cbStrokeW > 0 ? strokeColor : 'none'}
                                    strokeWidth={cbStrokeW}
                                />
                            ) : (
                                <rect
                                    x={cbStrokeW / 2}
                                    y={cbStrokeW / 2}
                                    width={Math.max(0.5, cbSize - cbStrokeW)}
                                    height={Math.max(0.5, cbSize - cbStrokeW)}
                                    rx={2.2 * scaleFactor}
                                    ry={2.2 * scaleFactor}
                                    fill="#ffffff"
                                    stroke={cbStrokeW > 0 ? strokeColor : 'none'}
                                    strokeWidth={cbStrokeW}
                                />
                            )}
                        </svg>
                    ) : null;

                    return (
                        <div 
                            key={i} 
                            className="w-full flex relative" 
                            style={{ 
                                height: finalLineSpacing,
                                alignItems: verticalAlign === 'top' ? 'flex-start' : (verticalAlign === 'bottom' ? 'flex-end' : 'center')
                            }}
                        >
                            {timeNode && timePosition === 'left' && timeNode}
                            {checkboxNode}
                            <div className="flex-1 self-end relative w-full flex items-center" style={{ height: `${Math.max(1, borderWidthVal)}px` }}>
                                {borderWidthVal > 0 && (
                                    <svg className="w-full h-full overflow-visible">
                                        <line 
                                            x1="0" 
                                            y1="50%" 
                                            x2="100%" 
                                            y2="50%" 
                                            stroke={strokeColor} 
                                            strokeWidth={borderWidthVal} 
                                            strokeDasharray={dashArray} 
                                        />
                                    </svg>
                                )}
                            </div>
                            {timeNode && timePosition === 'right' && timeNode}
                        </div>
                    );
                })}
            </div>
        );
    }

    if (element.type === 'box') {
        const strokeWidth = style.borderWidth !== undefined ? Math.max(0, Number(style.borderWidth)) : 0;
        const strokeColor = style.borderColor || '#000000';
        const borderRadius = style.borderRadius || 0;
        const borderStyle = style.borderStyle || 'solid';
        const dashArray = getDashArray(borderStyle, strokeWidth, scaleFactor);
        const isDouble = borderStyle === 'double' && strokeWidth > 0;

        return (
            <div ref={containerRef} className="w-full h-full relative" style={{ 
                background: getBackgroundStyle(),
                borderRadius: `${borderRadius}px`,
                boxShadow: getBoxShadow(),
                opacity: style.opacity ?? 1
            }}>
                {strokeWidth > 0 && (
                    <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible" viewBox={`0 0 ${boxW} ${boxH}`}>
                        {isDouble ? (
                            <>
                                <rect
                                    x={strokeWidth / 6}
                                    y={strokeWidth / 6}
                                    width={Math.max(0, boxW - strokeWidth / 3)}
                                    height={Math.max(0, boxH - strokeWidth / 3)}
                                    rx={Math.max(0, borderRadius)}
                                    ry={Math.max(0, borderRadius)}
                                    fill="none"
                                    stroke={strokeColor}
                                    strokeWidth={strokeWidth / 3}
                                />
                                <rect
                                    x={(5 * strokeWidth) / 6}
                                    y={(5 * strokeWidth) / 6}
                                    width={Math.max(0, boxW - (5 * strokeWidth) / 3)}
                                    height={Math.max(0, boxH - (5 * strokeWidth) / 3)}
                                    rx={Math.max(0, borderRadius - (2 * strokeWidth) / 3)}
                                    ry={Math.max(0, borderRadius - (2 * strokeWidth) / 3)}
                                    fill="none"
                                    stroke={strokeColor}
                                    strokeWidth={strokeWidth / 3}
                                />
                            </>
                        ) : (
                            <rect 
                                x="0" 
                                y="0" 
                                width={boxW} 
                                height={boxH} 
                                rx={borderRadius} 
                                ry={borderRadius} 
                                fill="none" 
                                stroke={strokeColor} 
                                strokeWidth={strokeWidth} 
                                strokeDasharray={dashArray} 
                            />
                        )}
                    </svg>
                )}
            </div>
        );
    }

    if (element.type === 'circle') {
        const strokeWidth = style.borderWidth !== undefined ? Math.max(0, Number(style.borderWidth)) : 0;
        const strokeColor = style.borderColor || '#000000';
        const borderStyle = style.borderStyle || 'solid';
        const dashArray = getDashArray(borderStyle, strokeWidth, scaleFactor);
        const isDouble = borderStyle === 'double' && strokeWidth > 0;

        return (
            <div ref={containerRef} className="w-full h-full rounded-full relative" style={{ 
                background: getBackgroundStyle(),
                boxShadow: getBoxShadow(),
                opacity: style.opacity ?? 1
            }}>
                {strokeWidth > 0 && (
                    <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible" viewBox={`0 0 ${boxW} ${boxH}`}>
                        {isDouble ? (
                            <>
                                <ellipse 
                                    cx={boxW / 2} 
                                    cy={boxH / 2} 
                                    rx={Math.max(0.5, boxW / 2 - strokeWidth / 6)} 
                                    ry={Math.max(0.5, boxH / 2 - strokeWidth / 6)} 
                                    fill="none" 
                                    stroke={strokeColor} 
                                    strokeWidth={strokeWidth / 3} 
                                />
                                <ellipse 
                                    cx={boxW / 2} 
                                    cy={boxH / 2} 
                                    rx={Math.max(0.5, boxW / 2 - (5 * strokeWidth) / 6)} 
                                    ry={Math.max(0.5, boxH / 2 - (5 * strokeWidth) / 6)} 
                                    fill="none" 
                                    stroke={strokeColor} 
                                    strokeWidth={strokeWidth / 3} 
                                />
                            </>
                        ) : (
                            <ellipse 
                                cx={boxW / 2} 
                                cy={boxH / 2} 
                                rx={boxW / 2} 
                                ry={boxH / 2} 
                                fill="none" 
                                stroke={strokeColor} 
                                strokeWidth={strokeWidth} 
                                strokeDasharray={dashArray} 
                            />
                        )}
                    </svg>
                )}
            </div>
        );
    }

    if (element.type === 'vector_shape') {
        const shapeType = style.shapeType || 'frame_thin_notched';
        const shapeDef = getVectorShapeById(shapeType);
        const strokeColor = style.borderColor || shapeDef.defaultStroke || '#000000';
        const strokeWidth = style.borderWidth !== undefined
            ? Math.max(0, Number(style.borderWidth))
            : ((shapeDef.defaultBorderWidth ?? 1.2) * scaleFactor);
        const opacity = style.opacity ?? 1;
        const borderRadius = style.borderRadius || 0;
        const dashArray = getDashArray(style.borderStyle || 'solid', strokeWidth, scaleFactor);
        
        const bounds = getSvgPathBounds(shapeDef.path);

        const isGradient = style.backgroundType === 'gradient';
        const gradientId = `grad-${reactId.replace(/:/g, '')}`;
        const fillColor = isGradient ? `url(#${gradientId})` : (style.backgroundColor || shapeDef.defaultFill || 'transparent');
        const fillOpacity = style.fillOpacity ?? 1;
        const strokeOpacity = style.strokeOpacity ?? 1;

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

        const s = style as any;
        const isRepeated = s.repeatMode && s.repeatMode !== 'none' && (s.repeatCount ?? 1) > 1;
        const repeatCount = Math.max(1, Math.min(30, s.repeatCount || 1));
        const isRepeatY = s.repeatMode === 'repeat-y';
        const repeatSpacing = s.repeatSpacing !== undefined ? Number(s.repeatSpacing) * scaleFactor : (2 * scaleFactor);

        if (isRepeated) {
            const items = Array.from({ length: repeatCount });
            const itemW = isRepeatY ? boxW : Math.max(1, (boxW - repeatSpacing * (repeatCount - 1)) / repeatCount);
            const itemH = isRepeatY ? Math.max(1, (boxH - repeatSpacing * (repeatCount - 1)) / repeatCount) : boxH;
            const mappedItemPath = transformSvgPathToBox(shapeDef.path, bounds, itemW, itemH, 0);

            return (
                <div 
                    ref={containerRef}
                    className={`w-full h-full flex ${isRepeatY ? 'flex-col' : 'flex-row'} items-center justify-between overflow-visible`} 
                    style={{ 
                        opacity, 
                        filter: dropShadowFilter !== 'none' ? dropShadowFilter : undefined,
                        gap: `${repeatSpacing}px`
                    }}
                >
                    {items.map((_, idx) => (
                        <div key={idx} className="flex-1 w-full h-full flex items-center justify-center min-w-0 min-h-0 overflow-visible">
                            <svg 
                                viewBox={`0 0 ${itemW} ${itemH}`}
                                className="w-full h-full overflow-visible"
                            >
                                {idx === 0 && <defs>{renderGradient()}</defs>}
                                <path 
                                    d={mappedItemPath} 
                                    fillRule={shapeDef.fillRule || 'nonzero'}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    fill={fillColor} 
                                    fillOpacity={fillOpacity}
                                    stroke={strokeWidth > 0 ? strokeColor : 'none'} 
                                    strokeOpacity={strokeOpacity}
                                    strokeWidth={strokeWidth} 
                                    strokeDasharray={dashArray}
                                />
                            </svg>
                        </div>
                    ))}
                </div>
            );
        }

        const mappedPath = shapeType === 'rectangle' ? '' : transformSvgPathToBox(shapeDef.path, bounds, boxW, boxH, 0);

        return (
            <div ref={containerRef} className="w-full h-full" style={{ opacity, filter: dropShadowFilter !== 'none' ? dropShadowFilter : undefined }}>
                <svg 
                    viewBox={`0 0 ${boxW} ${boxH}`}
                    className="w-full h-full overflow-visible"
                >
                    <defs>
                        {renderGradient()}
                    </defs>
                    {shapeType === 'rectangle' ? (
                        <rect 
                            x="0" y="0" width={boxW} height={boxH}
                            rx={borderRadius} ry={borderRadius}
                            fill={fillColor} 
                            fillOpacity={fillOpacity}
                            stroke={strokeWidth > 0 ? strokeColor : 'none'} 
                            strokeOpacity={strokeOpacity}
                            strokeWidth={strokeWidth} 
                            strokeDasharray={dashArray}
                        />
                    ) : (
                        <path 
                            d={mappedPath} 
                            fillRule={shapeDef.fillRule || 'nonzero'}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            fill={fillColor} 
                            fillOpacity={fillOpacity}
                            stroke={strokeWidth > 0 ? strokeColor : 'none'} 
                            strokeOpacity={strokeOpacity}
                            strokeWidth={strokeWidth} 
                            strokeDasharray={dashArray}
                        />
                    )}
                </svg>
            </div>
        );
    }

    return null;
};
