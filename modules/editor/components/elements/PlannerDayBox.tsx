
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Moon, Circle } from 'lucide-react';
import { LayoutElement, DayData } from '../../../../types';
import { getDayName } from '../../../../core/backend/calendar';
import { getTextStrokeCss } from '../../../../core/logic/textStroke';
import { ensureFontLoaded, getSafeFontFamily } from '../../../../core/logic/fontDetector';
import { getDashArray } from '../../../../core/logic/strokeScale';

interface PlannerDayBoxProps {
    element: LayoutElement;
    dayData: DayData; // This will be the specific day for this box
    isEditor: boolean;
    pageWidth: number;
    pageHeight: number;
}

export const PlannerDayBox: React.FC<PlannerDayBoxProps> = ({ element, dayData, isEditor, pageWidth, pageHeight }) => {
    const scaleFactor = (pageWidth || 400) / 400;
    const { plannerDayBox } = element.style;
    const boxRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const [boxSize, setBoxSize] = useState<{ w: number; h: number }>({ w: 0, h: 0 });
    const [contentSize, setContentSize] = useState<{ w: number; h: number }>({ w: 0, h: 0 });

    useLayoutEffect(() => {
        const b = boxRef.current;
        const c = contentRef.current;
        if (!b && !c) return;
        const measure = () => {
            if (b) {
                const w = b.clientWidth;
                const h = b.clientHeight;
                if (w > 0 && h > 0) {
                    setBoxSize(prev => (prev.w === w && prev.h === h ? prev : { w, h }));
                }
            }
            if (c) {
                const w = c.clientWidth;
                const h = c.clientHeight;
                if (w > 0 && h > 0) {
                    setContentSize(prev => (prev.w === w && prev.h === h ? prev : { w, h }));
                }
            }
        };
        measure();
        const obs = new ResizeObserver(measure);
        if (b) obs.observe(b);
        if (c) obs.observe(c);
        return () => obs.disconnect();
    }, [element.w, element.h, pageWidth, pageHeight, plannerDayBox?.showHeader, plannerDayBox?.headerHeight]);

    useEffect(() => {
        if (plannerDayBox?.fontFamily) ensureFontLoaded(plannerDayBox.fontFamily);
        if (plannerDayBox?.headerFontFamily) ensureFontLoaded(plannerDayBox.headerFontFamily);
        if (plannerDayBox?.holidayFontFamily) ensureFontLoaded(plannerDayBox.holidayFontFamily);
    }, [plannerDayBox?.fontFamily, plannerDayBox?.headerFontFamily, plannerDayBox?.holidayFontFamily]);

    if (!plannerDayBox) return null;

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

    const currentYear = new Date().getFullYear();
    const d = (dayData || { dayOfMonth: 1, month: 0, dayOfWeek: new Date(currentYear, 0, 1).getDay(), year: currentYear }) as DayData;

    const { 
        contentStyle, 
        showHeader = true,
        showDayNumber = true, 
        showDayName = true,
        dayNameCase = 'capitalize',
        headerHeight = 15,
        headerBackgroundColor = '#f9fafb',
        headerTextColor = '#374151',
        showHeaderBorder = true,
        headerBorderColor = '#e5e7eb',
        headerBorderStyle = 'solid',
        strokeColor = '#e5e7eb',
        strokeStyle = 'solid'
    } = plannerDayBox;

    const lineSpacing = plannerDayBox.lineSpacing !== undefined ? Number(plannerDayBox.lineSpacing) : (20 * scaleFactor);
    const gridSpacing = plannerDayBox.gridSpacing !== undefined ? Number(plannerDayBox.gridSpacing) : (20 * scaleFactor);
    const outerBorderWidth = element.style.borderWidth !== undefined ? Math.max(0, Number(element.style.borderWidth)) : (1 * scaleFactor);
    const outerBorderColor = element.style.borderColor || '#e5e7eb';
    const outerBorderStyle = element.style.borderStyle || 'solid';
    const outerBorderRadius = element.style.borderRadius || 0;
    const headerBorderWidth = plannerDayBox.headerBorderWidth !== undefined ? Math.max(0, Number(plannerDayBox.headerBorderWidth)) : (1 * scaleFactor);
    const strokeWidth = plannerDayBox.strokeWidth !== undefined ? Math.max(0, Number(plannerDayBox.strokeWidth)) : (0.5 * scaleFactor);

    const dashArray = getDashArray(strokeStyle, strokeWidth, scaleFactor);
    const outerDashArray = getDashArray(outerBorderStyle, outerBorderWidth, scaleFactor);
    const headerDashArray = getDashArray(headerBorderStyle, headerBorderWidth, scaleFactor);

    const nameFormat = (plannerDayBox as any).nameFormat || element.style.nameFormat || 'full';
    let dayName = getDayName(d.dayOfWeek, nameFormat);
    
    if (dayNameCase === 'uppercase') dayName = dayName.toUpperCase();
    if (dayNameCase === 'lowercase') dayName = dayName.toLowerCase();

    const fallbackBoxW = Math.max(1, pageWidth * (element.w / 100));
    const fallbackBoxH = Math.max(1, pageHeight * (element.h / 100));
    const measuredBoxW = boxSize.w > 0 ? boxSize.w : fallbackBoxW;
    const measuredBoxH = boxSize.h > 0 ? boxSize.h : fallbackBoxH;
    const estHeaderH = showHeader ? (headerHeight / 100) * measuredBoxH : 0;
    const contentW = contentSize.w > 0 ? contentSize.w : Math.max(1, measuredBoxW - outerBorderWidth * 2);
    const contentH = contentSize.h > 0 ? contentSize.h : Math.max(1, measuredBoxH - estHeaderH - outerBorderWidth * 2);

    const renderBackground = () => {
        if (contentStyle === 'lines') {
            const lines = [];
            const spacing = Math.max(4 * scaleFactor, lineSpacing);
            const rows = Math.max(1, Math.round(contentH / spacing));
            const actualSpacing = contentH / rows;

            for (let i = 0; i <= rows; i++) {
                const y = i * actualSpacing;
                lines.push(
                    <line
                        key={i}
                        x1={0}
                        y1={y}
                        x2={contentW}
                        y2={y}
                        stroke={plannerDayBox.hideLines || strokeWidth <= 0 ? 'transparent' : strokeColor}
                        strokeWidth={strokeWidth}
                        strokeDasharray={dashArray}
                    />
                );
            }
            return (
                <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox={`0 0 ${contentW} ${contentH}`}>
                    {lines}
                </svg>
            );
        }

        if (contentStyle === 'dots') {
            const dots = [];
            const spacing = Math.max(4 * scaleFactor, gridSpacing);
            const cols = Math.max(1, Math.round(contentW / spacing));
            const rows = Math.max(1, Math.round(contentH / spacing));
            
            const actualSpacingX = contentW / cols;
            const actualSpacingY = contentH / rows;
            const dotRadius = strokeWidth <= 0 ? 0 : Math.max(0.15 * scaleFactor, strokeWidth / 2);

            if (dotRadius > 0) {
                for (let ix = 0; ix <= cols; ix++) {
                    for (let iy = 0; iy <= rows; iy++) {
                        const x = ix * actualSpacingX;
                        const y = iy * actualSpacingY;
                        dots.push(<circle key={`${ix}-${iy}`} cx={x} cy={y} r={dotRadius} fill={strokeColor} />);
                    }
                }
            }
            return (
                <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox={`0 0 ${contentW} ${contentH}`}>
                    {dots}
                </svg>
            );
        }

        if (contentStyle === 'grid') {
            const lines = [];
            const spacing = Math.max(4 * scaleFactor, gridSpacing);
            const cols = Math.max(1, Math.round(contentW / spacing));
            const rows = Math.max(1, Math.round(contentH / spacing));
            
            const actualSpacingX = contentW / cols;
            const actualSpacingY = contentH / rows;

            if (strokeWidth > 0) {
                for (let i = 0; i <= cols; i++) {
                    const x = i * actualSpacingX;
                    lines.push(<line key={`v-${i}`} x1={x} y1={0} x2={x} y2={contentH} stroke={strokeColor} strokeWidth={strokeWidth} strokeDasharray={dashArray} />);
                }
                for (let i = 0; i <= rows; i++) {
                    const y = i * actualSpacingY;
                    lines.push(<line key={`h-${i}`} x1={0} y1={y} x2={contentW} y2={y} stroke={strokeColor} strokeWidth={strokeWidth} strokeDasharray={dashArray} />);
                }
            }
            return (
                <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox={`0 0 ${contentW} ${contentH}`}>
                    {lines}
                </svg>
            );
        }

        if (contentStyle === 'timetable') {
            const startH = plannerDayBox.startHour !== undefined ? plannerDayBox.startHour : 7;
            const endH = plannerDayBox.endHour !== undefined ? plannerDayBox.endHour : 18;
            const intervalM = plannerDayBox.timeInterval || 60;
            const skipLine = plannerDayBox.skipBlankLine || false;

            const startMin = startH * 60;
            const endMin = endH * 60;
            const timesList: string[] = [];

            for (let min = startMin; min <= endMin; min += intervalM) {
                const hourPart = Math.floor(min / 60) % 24;
                const minPart = min % 60;
                timesList.push(`${String(hourPart).padStart(2, '0')}:${String(minPart).padStart(2, '0')}`);
                if (skipLine && min < endMin) {
                    timesList.push('');
                }
            }

            const heightPercent = plannerDayBox.timetableHeightPercent !== undefined ? plannerDayBox.timetableHeightPercent : 100;
            const delimitedHeight = Math.max(10 * scaleFactor, (contentH * heightPercent) / 100);

            const isDistribute = plannerDayBox.timetableFit === 'distribute';
            let rowSpacing = Math.max(8 * scaleFactor, lineSpacing);
            let lineCount = timesList.length;

            if (isDistribute && timesList.length > 0) {
                rowSpacing = delimitedHeight / timesList.length;
            } else {
                const maxFitting = Math.floor((delimitedHeight + 0.5) / rowSpacing);
                lineCount = Math.min(timesList.length, Math.max(1, maxFitting));
            }

            const fontSz = plannerDayBox.fontSize !== undefined 
                ? plannerDayBox.fontSize * scaleFactor 
                : Math.max(4 * scaleFactor, 8 * scaleFactor);

            return (
                <div 
                    className="absolute top-0 left-0 w-full overflow-hidden flex flex-col pointer-events-none"
                    style={{ height: `${delimitedHeight}px` }}
                >
                    {Array(lineCount).fill(0).map((_, i) => (
                        <div 
                            key={i} 
                            className="w-full flex items-end relative shrink-0" 
                            style={{ height: `${rowSpacing}px` }}
                        >
                            <span 
                                className="shrink-0 pl-1 pr-1.5 select-none font-mono" 
                                style={{ 
                                    fontFamily: plannerDayBox.fontFamily ? getSafeFontFamily(plannerDayBox.fontFamily) : 'monospace',
                                    fontSize: `${fontSz}px`,
                                    fontWeight: plannerDayBox.fontWeight || 'normal',
                                    color: plannerDayBox.color || '#6b7280',
                                    lineHeight: 1,
                                    marginBottom: `${2 * scaleFactor}px`,
                                    visibility: timesList[i] ? 'visible' : 'hidden',
                                    ...getTextStrokeCss(
                                        {
                                            textStrokeWidth: plannerDayBox.textStrokeWidth ?? element.style.textStrokeWidth,
                                            textStrokeColor: plannerDayBox.textStrokeColor || element.style.textStrokeColor,
                                            textFillTransparent: plannerDayBox.textFillTransparent ?? element.style.textFillTransparent,
                                            textStrokeJoin: plannerDayBox.textStrokeJoin || element.style.textStrokeJoin,
                                            color: plannerDayBox.color || '#6b7280',
                                        },
                                        plannerDayBox.color || '#6b7280'
                                    ),
                                }}
                            >
                                {timesList[i] || '\u00A0'}
                            </span>
                            {!plannerDayBox.hideLines && strokeWidth > 0 && (
                                <svg className="flex-1 overflow-visible" style={{ height: Math.max(1, strokeWidth) }}>
                                    <line
                                        x1="0"
                                        y1="50%"
                                        x2="100%"
                                        y2="50%"
                                        stroke={strokeColor}
                                        strokeWidth={strokeWidth}
                                        strokeDasharray={dashArray}
                                    />
                                </svg>
                            )}
                        </div>
                    ))}
                </div>
            );
        }

        return null;
    };

    const isOuterDouble = outerBorderStyle === 'double' && outerBorderWidth > 0;

    return (
        <div 
            ref={boxRef}
            className="w-full h-full flex flex-col relative overflow-hidden" 
            style={{ 
                borderRadius: outerBorderRadius > 0 ? `${outerBorderRadius}px` : undefined,
                backgroundColor: element.style.backgroundColor || 'white',
                padding: outerBorderWidth > 0 ? `${outerBorderWidth}px` : undefined,
                boxSizing: 'border-box',
            }}
        >
            {/* Header */}
            {showHeader && (
                <div 
                    className="flex items-center px-2 gap-2 shrink-0 relative" 
                    style={{ 
                        height: `${headerHeight}%`, 
                        backgroundColor: headerBackgroundColor,
                        paddingBottom: (showHeaderBorder && headerBorderWidth > 0) ? `${headerBorderWidth}px` : undefined
                    }}
                >
                    {showDayNumber && (d.dayOfMonth > 0 || (isEditor && !d.isPaddingDay)) && (
                        <span
                            className="font-bold text-lg"
                            style={{
                                color: headerTextColor,
                                opacity: d.isPaddingDay ? 0.45 : 1,
                                fontSize: `${Math.max(6, 18 * scaleFactor)}px`,
                                fontFamily: (plannerDayBox.headerFontFamily || plannerDayBox.fontFamily) ? getSafeFontFamily(plannerDayBox.headerFontFamily || plannerDayBox.fontFamily) : 'inherit',
                                ...getTextStrokeCss(
                                    {
                                        textStrokeWidth: plannerDayBox.headerTextStrokeWidth ?? element.style.textStrokeWidth,
                                        textStrokeColor: plannerDayBox.headerTextStrokeColor || element.style.textStrokeColor,
                                        textFillTransparent: plannerDayBox.headerTextFillTransparent ?? element.style.textFillTransparent,
                                        textStrokeJoin: plannerDayBox.headerTextStrokeJoin || element.style.textStrokeJoin,
                                        color: headerTextColor,
                                    },
                                    headerTextColor
                                ),
                            }}
                        >
                            {d.dayOfMonth > 0 ? String(d.dayOfMonth).padStart(2, '0') : ''}
                        </span>
                    )}
                    {showDayName && (d.dayOfWeek !== undefined) && (
                        <span
                            className="font-medium"
                            style={{
                                color: headerTextColor,
                                opacity: d.isPaddingDay ? 0.45 : 0.7,
                                fontSize: `${Math.max(5, 10 * scaleFactor)}px`,
                                fontFamily: (plannerDayBox.headerFontFamily || plannerDayBox.fontFamily) ? getSafeFontFamily(plannerDayBox.headerFontFamily || plannerDayBox.fontFamily) : 'inherit',
                                ...getTextStrokeCss(
                                    {
                                        textStrokeWidth: plannerDayBox.headerTextStrokeWidth ?? element.style.textStrokeWidth,
                                        textStrokeColor: plannerDayBox.headerTextStrokeColor || element.style.textStrokeColor,
                                        textFillTransparent: plannerDayBox.headerTextFillTransparent ?? element.style.textFillTransparent,
                                        textStrokeJoin: plannerDayBox.headerTextStrokeJoin || element.style.textStrokeJoin,
                                        color: headerTextColor,
                                    },
                                    headerTextColor
                                ),
                            }}
                        >
                            {dayName}
                        </span>
                    )}
                    {plannerDayBox.showHoliday !== false && (showDayNumber || showDayName || plannerDayBox.showHoliday === true) && d.holiday && d.dayOfMonth > 0 && (
                        <div 
                            className="ml-auto font-semibold truncate max-w-[50%]" 
                            style={{ 
                                fontSize: plannerDayBox.holidayFontSize ? `${plannerDayBox.holidayFontSize * scaleFactor}px` : `${Math.max(4, 8 * scaleFactor)}px`,
                                color: plannerDayBox.holidayColor || '#ef4444',
                                fontFamily: (plannerDayBox.holidayFontFamily || plannerDayBox.headerFontFamily || plannerDayBox.fontFamily) ? getSafeFontFamily(plannerDayBox.holidayFontFamily || plannerDayBox.headerFontFamily || plannerDayBox.fontFamily) : 'inherit',
                                ...getTextStrokeCss(
                                    {
                                        textStrokeWidth: plannerDayBox.holidayTextStrokeWidth,
                                        textStrokeColor: plannerDayBox.holidayTextStrokeColor,
                                        textFillTransparent: plannerDayBox.holidayTextFillTransparent,
                                        textStrokeJoin: plannerDayBox.holidayTextStrokeJoin,
                                        color: plannerDayBox.holidayColor || '#ef4444',
                                    },
                                    plannerDayBox.holidayColor || '#ef4444'
                                )
                            }} 
                            title={d.holiday}
                        >
                            {d.holiday}
                        </div>
                    )}
                    {plannerDayBox.showMoonPhase && d.moonPhase && d.dayOfMonth > 0 && (
                        <div className={`flex items-center gap-1 ${d.holiday ? 'ml-2' : 'ml-auto'}`}>
                            <div className="w-3.5 h-3.5 shrink-0 flex items-center justify-center">
                                {renderMoonIcon(d.moonPhase, headerTextColor)}
                            </div>
                            <span className="opacity-60 truncate" style={{ color: headerTextColor, fontSize: `${Math.max(4, 8 * scaleFactor)}px` }}>{d.moonPhase}</span>
                        </div>
                    )}

                    {showHeaderBorder && headerBorderWidth > 0 && (
                        <svg
                            className="absolute bottom-0 left-0 w-full pointer-events-none overflow-visible"
                            style={{ height: Math.max(1, headerBorderWidth) }}
                        >
                            <line
                                x1="0"
                                y1="50%"
                                x2="100%"
                                y2="50%"
                                stroke={headerBorderColor}
                                strokeWidth={headerBorderWidth}
                                strokeDasharray={headerDashArray}
                            />
                        </svg>
                    )}
                </div>
            )}

            {/* Content Area */}
            <div ref={contentRef} className="flex-1 relative min-h-0">
                {renderBackground()}
            </div>

            {/* Outer Vector Box Border Overlay */}
            {outerBorderWidth > 0 && measuredBoxW > 0 && measuredBoxH > 0 && (
                <svg
                    width={measuredBoxW}
                    height={measuredBoxH}
                    viewBox={`0 0 ${measuredBoxW} ${measuredBoxH}`}
                    className="absolute inset-0 w-full h-full pointer-events-none z-20"
                >
                    {isOuterDouble ? (
                        <>
                            <rect
                                x={outerBorderWidth / 6}
                                y={outerBorderWidth / 6}
                                width={Math.max(0, measuredBoxW - outerBorderWidth / 3)}
                                height={Math.max(0, measuredBoxH - outerBorderWidth / 3)}
                                rx={Math.max(0, outerBorderRadius)}
                                ry={Math.max(0, outerBorderRadius)}
                                fill="none"
                                stroke={outerBorderColor}
                                strokeWidth={outerBorderWidth / 3}
                            />
                            <rect
                                x={(5 * outerBorderWidth) / 6}
                                y={(5 * outerBorderWidth) / 6}
                                width={Math.max(0, measuredBoxW - (5 * outerBorderWidth) / 3)}
                                height={Math.max(0, measuredBoxH - (5 * outerBorderWidth) / 3)}
                                rx={Math.max(0, outerBorderRadius - (2 * outerBorderWidth) / 3)}
                                ry={Math.max(0, outerBorderRadius - (2 * outerBorderWidth) / 3)}
                                fill="none"
                                stroke={outerBorderColor}
                                strokeWidth={outerBorderWidth / 3}
                            />
                        </>
                    ) : (
                        <rect
                            x={outerBorderWidth / 2}
                            y={outerBorderWidth / 2}
                            width={Math.max(0, measuredBoxW - outerBorderWidth)}
                            height={Math.max(0, measuredBoxH - outerBorderWidth)}
                            rx={Math.max(0, outerBorderRadius - outerBorderWidth / 2)}
                            ry={Math.max(0, outerBorderRadius - outerBorderWidth / 2)}
                            fill="none"
                            stroke={outerBorderColor}
                            strokeWidth={outerBorderWidth}
                            strokeDasharray={outerDashArray}
                        />
                    )}
                </svg>
            )}
        </div>
    );
};
