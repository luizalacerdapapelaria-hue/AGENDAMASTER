
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { BaseElementProps } from './types';
import { getDayName } from '../../../../core/backend/calendar';
import { getSafeFontFamily, ensureFontLoaded } from '../../../../core/logic/fontDetector';
import { getTextStrokeCss } from '../../../../core/logic/textStroke';

const DayBadgeOutlineSvg: React.FC<{
    isSquare: boolean;
    isFilled: boolean;
    isMinimal: boolean;
    borderWidth: number;
    borderColor: string;
    fillColor: string;
    cornerRadius: number;
}> = ({ isSquare, isFilled, isMinimal, borderWidth, borderColor, fillColor, cornerRadius }) => {
    const ref = useRef<SVGSVGElement>(null);
    const [size, setSize] = useState<{ w: number; h: number }>({ w: 0, h: 0 });

    useLayoutEffect(() => {
        const el = ref.current;
        if (!el) return;
        const measure = () => {
            const w = el.clientWidth;
            const h = el.clientHeight;
            if (w > 0 && h > 0) {
                setSize(prev => (prev.w === w && prev.h === h ? prev : { w, h }));
            }
        };
        measure();
        const obs = new ResizeObserver(measure);
        obs.observe(el);
        return () => obs.disconnect();
    }, []);

    if (isMinimal && !isFilled) return null;
    const sw = isMinimal ? 0 : Math.max(0, borderWidth);
    const half = sw / 2;
    const w = size.w;
    const h = size.h;

    if (w <= 0 || h <= 0) {
        return <svg ref={ref} className="absolute inset-0 w-full h-full pointer-events-none" />;
    }

    if (isSquare) {
        const rx = Math.min(cornerRadius, Math.max(0, Math.min(w, h) / 2 - half));
        return (
            <svg ref={ref} className="absolute inset-0 w-full h-full pointer-events-none">
                <rect
                    x={half}
                    y={half}
                    width={Math.max(0, w - sw)}
                    height={Math.max(0, h - sw)}
                    rx={rx}
                    ry={rx}
                    fill={isFilled ? fillColor : 'none'}
                    stroke={sw > 0 ? borderColor : 'none'}
                    strokeWidth={sw}
                />
            </svg>
        );
    }

    const r = Math.max(0.5, Math.min(w, h) / 2 - half);
    return (
        <svg ref={ref} className="absolute inset-0 w-full h-full pointer-events-none">
            <circle
                cx={w / 2}
                cy={h / 2}
                r={r}
                fill={isFilled ? fillColor : 'none'}
                stroke={sw > 0 ? borderColor : 'none'}
                strokeWidth={sw}
            />
        </svg>
    );
};

export const PermanentDayHeader: React.FC<BaseElementProps> = ({ element, style, pageHeight, pageWidth }) => {
    const scaleFactor = (pageWidth || 400) / 400;
    const variant = style.variant || 'circles_outline';
    const color = style.color || '#f472b6'; 
    const fontSize = style.fontSize || (10 * scaleFactor);
    const fontFamily = getSafeFontFamily(style.fontFamily);

    useEffect(() => {
        if (style?.fontFamily) {
            ensureFontLoaded(style.fontFamily);
        }
    }, [style?.fontFamily]);
    
    // Order: Seg, Ter, Qua, Qui, Sex, Sáb, Dom
    const dayIndices = [1, 2, 3, 4, 5, 6, 0];
    const nameFormat = style.nameFormat || 'initial';
    const days = dayIndices.map(dIdx => getDayName(dIdx, nameFormat));
    
    const renderDays = () => {
        const dayContainerStyle: React.CSSProperties = {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
            height: '100%',
        };

        const isFilled = variant.includes('filled');
        const isSquare = variant.includes('square');
        const isMinimal = variant.includes('minimal');
        const isTextBelow = variant.includes('text_below');
        const shapeScale = style.shapeScale || 1; // 0.5 to 1.5
        const borderWidth = style.borderWidth !== undefined ? Math.max(0, Number(style.borderWidth)) : (1 * scaleFactor);
        const borderColor = style.borderColor || color;

        const dayWrapperStyle: React.CSSProperties = {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '13%',
            height: '100%',
            justifyContent: isTextBelow ? 'space-between' : 'center',
        };

        const dayCircleStyle: React.CSSProperties = {
            position: 'relative',
            width: `${100 * shapeScale}%`,
            height: 'auto',
            maxHeight: isTextBelow ? `${70 * shapeScale}%` : `${100 * shapeScale}%`,
            aspectRatio: '1/1',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: isTextBelow ? 0 : fontSize,
            color: isFilled ? '#ffffff' : color,
            fontWeight: '600',
            fontFamily: fontFamily,
            boxSizing: 'border-box',
        };

        const circleFillTextColor = isFilled ? '#ffffff' : color;
        const circleLetterStroke = getTextStrokeCss(
            { ...style, color: circleFillTextColor },
            circleFillTextColor
        );
        const belowLetterStroke = getTextStrokeCss(
            { ...style, color },
            color
        );

        const textStyle: React.CSSProperties = {
            fontSize: fontSize,
            color: color,
            fontWeight: '600',
            fontFamily: fontFamily,
            marginTop: `${2 * scaleFactor}px`,
            ...belowLetterStroke,
        };

        return (
            <div style={dayContainerStyle}>
                {days.map((day, i) => (
                    <div key={i} style={dayWrapperStyle}>
                        <div style={dayCircleStyle}>
                            <DayBadgeOutlineSvg
                                isSquare={isSquare}
                                isFilled={isFilled}
                                isMinimal={isMinimal}
                                borderWidth={borderWidth}
                                borderColor={borderColor}
                                fillColor={color}
                                cornerRadius={4 * scaleFactor}
                            />
                            {!isTextBelow && (
                                <span style={{ ...circleLetterStroke, position: 'relative', zIndex: 1 }}>
                                    {day}
                                </span>
                            )}
                        </div>
                        {isTextBelow && <span style={textStyle}>{day}</span>}
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="w-full h-full flex items-center justify-center p-1">
            {renderDays()}
        </div>
    );
};
