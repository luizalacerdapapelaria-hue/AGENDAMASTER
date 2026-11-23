
import React, { useRef, useLayoutEffect, useEffect, useState } from 'react';
import { CalendarElementProps } from './types';
import { getMonthName, getDayName, generateMonthGrid, checkIsHoliday } from '../../../../core/backend/calendar';
import { TextStyleConfig, Holiday, DayData, LayoutElement } from '../../../../types';
import { getTextStrokeCss } from '../../../../core/logic/textStroke';
import { getSafeFontFamily, ensureFontLoaded } from '../../../../core/logic/fontDetector';
import { getDashArray } from '../../../../core/logic/strokeScale';

const CalendarWrapperBorderSvg: React.FC<{
    containerRef: React.RefObject<HTMLDivElement | null>;
    borderWidth: number;
    borderColor: string;
    borderStyle: string;
    borderRadius: number;
    scaleFactor: number;
}> = ({ containerRef, borderWidth, borderColor, borderStyle, borderRadius, scaleFactor }) => {
    const [box, setBox] = useState<{ w: number; h: number }>({ w: 0, h: 0 });

    useLayoutEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const measure = () => {
            const w = el.clientWidth;
            const h = el.clientHeight;
            if (w > 0 && h > 0) {
                setBox(prev => (prev.w === w && prev.h === h ? prev : { w, h }));
            }
        };
        measure();
        const obs = new ResizeObserver(measure);
        obs.observe(el);
        return () => obs.disconnect();
    }, [containerRef, borderWidth, borderRadius]);

    if (borderWidth <= 0 || box.w <= 0 || box.h <= 0) return null;

    const sw = borderWidth;
    const half = sw / 2;
    const w = Math.max(0.5, box.w - sw);
    const h = Math.max(0.5, box.h - sw);
    const rx = Math.max(0, Math.min(borderRadius, w / 2, h / 2));
    const dashArray = getDashArray(borderStyle, sw, scaleFactor);

    return (
        <svg
            width={box.w}
            height={box.h}
            viewBox={`0 0 ${box.w} ${box.h}`}
            className="absolute inset-0 pointer-events-none z-30 overflow-visible"
            xmlns="http://www.w3.org/2000/svg"
        >
            <rect
                x={half}
                y={half}
                width={w}
                height={h}
                rx={rx}
                ry={rx}
                fill="none"
                stroke={borderColor}
                strokeWidth={sw}
                strokeDasharray={dashArray}
                strokeLinecap={borderStyle === 'dotted' ? 'round' : 'butt'}
            />
        </svg>
    );
};

const applyTextTransform = (text: string, transform?: string) => {
    if (!text) return text;
    if (transform === 'uppercase') return text.toUpperCase();
    if (transform === 'lowercase') return text.toLowerCase();
    if (transform === 'capitalize') {
        return text.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
    }
    if (transform === 'sentence') {
        return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    }
    return text;
};

interface SingleMonthProps {
    monthIndex: number;
    year: number;
    element: LayoutElement;
    d: DayData;
    style: LayoutElement['style'];
    effectiveStyle: LayoutElement['style']['fullCalendar'];
    municipalHolidays?: Holiday[];
    pageWidth?: number;
}

const SingleMonthCalendar: React.FC<SingleMonthProps> = ({
    monthIndex,
    year,
    element,
    d,
    style,
    effectiveStyle,
    municipalHolidays,
    pageWidth,
}) => {
    const gridBoxRef = useRef<HTMLDivElement>(null);
    const headerRowRef = useRef<HTMLDivElement>(null);
    const [measuredGrid, setMeasuredGrid] = useState<{ width: number; height: number; headerHeight: number }>({
        width: 0,
        height: 0,
        headerHeight: 0,
    });

    const highlightCurrentDay = style.highlightCurrentDay !== false;
    const currentDayHighlightColor = style.currentDayHighlightColor || '#4f46e5';
    const currentDayHighlightTextColor = style.currentDayHighlightTextColor || '#ffffff';

    const splitMode = effectiveStyle?.splitMode || 'all';
    const splitWeekend = effectiveStyle?.splitWeekend || 'none';
    const hasSplitWeekend = splitWeekend !== 'none';

    // Determine startOfWeekDay (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
    let startOfWeekDay = 0;
    if (effectiveStyle?.startOfWeekDay !== undefined) {
        startOfWeekDay = effectiveStyle.startOfWeekDay;
    } else if (hasSplitWeekend || splitMode === 'left' || splitMode === 'right' || effectiveStyle?.startOfWeekOnMonday) {
        startOfWeekDay = 1;
    }

    const grid = generateMonthGrid(year, monthIndex, startOfWeekDay);

    let colsToShow: (number | string)[] = [0, 1, 2, 3, 4, 5, 6];
    if (hasSplitWeekend) {
        if (splitMode === 'left') {
            colsToShow = [0, 1, 2]; // Cols 1..3
        } else if (splitMode === 'right') {
            colsToShow = [3, 4, 'weekend']; // Cols 4..5, and combined 6/7
        } else {
            colsToShow = [0, 1, 2, 3, 4, 'weekend'];
        }
    } else {
        if (splitMode === 'left') {
            colsToShow = [0, 1, 2];
        } else if (splitMode === 'right') {
            colsToShow = [3, 4, 5, 6];
        }
    }

    const isMini = element.type === 'mini_calendar';
    const defaultTitleFontSize = isMini ? 9 : 12;
    const defaultWeekFontSize = isMini ? 6.5 : 8;
    const defaultDayFontSize = isMini ? 7.5 : 10;

    const titleStyle = {
        fontSize: defaultTitleFontSize, fontFamily: 'Inter', fontWeight: 'bold', color: '#000',
        textAlign: 'center', textTransform: 'uppercase', letterSpacing: 0,
        backgroundColor: 'transparent',
        ...effectiveStyle?.title
    } as TextStyleConfig;

    const weekStyle = {
        fontSize: defaultWeekFontSize, fontFamily: 'Inter', fontWeight: 'bold', color: '#666',
        textAlign: 'center', verticalAlign: 'middle', textTransform: 'none', letterSpacing: 0,
        backgroundColor: 'transparent',
        ...effectiveStyle?.weekDays
    } as TextStyleConfig;

    const dayStyle = {
        fontSize: defaultDayFontSize, fontFamily: 'Inter', fontWeight: 'normal', color: '#333',
        textAlign: 'center', verticalAlign: 'middle', textTransform: 'none', letterSpacing: 0,
        backgroundColor: 'transparent',
        ...effectiveStyle?.days
    } as TextStyleConfig;

    const gridConfig = {
        borderColor: '#ddd', borderWidth: undefined as number | undefined, dividerWidth: undefined as number | undefined, borderStyle: 'solid',
        cellBackgroundColor: 'transparent', headerBackgroundColor: 'transparent',
        borders: { top: false, bottom: false, left: false, right: false, insideHorizontal: false, insideVertical: false, headerSeparator: false },
        ...effectiveStyle?.grid
    };

    const specialDaysConfig = {
        highlightSundays: true,
        highlightHolidays: false,
        ...effectiveStyle?.specialDays,
        style: {
            color: '#dc2626',
            fontWeight: 'bold',
            ...effectiveStyle?.specialDays?.style
        }
    };

    const specialDaysFontSize = (element.type === 'full_calendar')
        ? (specialDaysConfig.style?.fontSize && specialDaysConfig.style.fontSize <= dayStyle.fontSize
            ? specialDaysConfig.style.fontSize
            : dayStyle.fontSize)
        : (specialDaysConfig.style?.fontSize && specialDaysConfig.style.fontSize <= dayStyle.fontSize * 1.05
            ? specialDaysConfig.style.fontSize
            : dayStyle.fontSize);

    const scaleFactor = (pageWidth || 400) / 400;
    const rawOuterW = Number(gridConfig.borderWidth !== undefined ? gridConfig.borderWidth : (1 * scaleFactor));
    const rawDividerW = gridConfig.dividerWidth !== undefined ? Number(gridConfig.dividerWidth) : rawOuterW;
    const outerWidth = Math.max(0, !Number.isFinite(rawOuterW) || rawOuterW <= 0 ? 0 : Math.round(rawOuterW * 100) / 100);
    const dividerThickness = Math.max(0, !Number.isFinite(rawDividerW) || rawDividerW <= 0 ? 0 : Math.round(rawDividerW * 100) / 100);
    const borderStyleName = gridConfig.borderStyle || 'solid';

    // Filter cols of each week
    const filteredWeeks = grid.map(week => {
        return colsToShow.map(col => {
            if (col === 'weekend') {
                return { sat: week[5] || null, sun: week[6] || null };
            }
            return week[col as number];
        });
    });

    const showYear = effectiveStyle?.showYearInTitle ?? (element.type === 'full_calendar');
    const monthFormat = (effectiveStyle as any)?.monthFormat || element.style.nameFormat || 'full';
    const monthName = getMonthName(monthIndex, monthFormat);
    const titleText = showYear ? `${monthName} ${year}` : monthName;

    const titleTransform = titleStyle.textTransform;
    const isTitleSentenceOrCapitalize = titleTransform === 'sentence' || titleTransform === 'capitalize';
    const cssTitleTransform = isTitleSentenceOrCapitalize ? 'none' : titleTransform;
    const transformedTitle = isTitleSentenceOrCapitalize ? applyTextTransform(titleText, titleTransform) : titleText;

    const weekTransform = weekStyle.textTransform;
    const isWeekSentenceOrCapitalize = weekTransform === 'sentence' || weekTransform === 'capitalize';
    const cssWeekTransform = isWeekSentenceOrCapitalize ? 'none' : weekTransform;

    const getWeekdayLabel = (dayOfWeek: number): string => {
        const fmt = effectiveStyle?.weekdayFormat || 'initial';
        if (fmt === 'custom') {
            const customText = effectiveStyle?.customWeekdayText;
            if (customText && typeof customText === 'string') {
                const parts = customText.split(',').map(s => s.trim());
                if (parts[dayOfWeek] !== undefined && parts[dayOfWeek] !== '') {
                    return parts[dayOfWeek];
                }
            }
            if (Array.isArray(effectiveStyle?.customWeekdayNames) && effectiveStyle?.customWeekdayNames[dayOfWeek]) {
                return effectiveStyle.customWeekdayNames[dayOfWeek];
            }
        }
        return getDayName(dayOfWeek, fmt);
    };

    let activeHeaders: string[] = [];
    if (hasSplitWeekend) {
        activeHeaders = colsToShow.map(col => {
            if (col === 'weekend') {
                const satDay = (startOfWeekDay + 5) % 7;
                const sunDay = (startOfWeekDay + 6) % 7;
                return `${getWeekdayLabel(satDay)}/${getWeekdayLabel(sunDay)}`;
            }
            const dayOfWeek = (startOfWeekDay + Number(col)) % 7;
            return getWeekdayLabel(dayOfWeek);
        });
    } else {
        activeHeaders = colsToShow.map(colIndex => {
            const dayOfWeek = (startOfWeekDay + Number(colIndex)) % 7;
            return getWeekdayLabel(dayOfWeek);
        });
    }

    // Custom weekday row height and alignment
    const rawWeekdayHeight = effectiveStyle?.weekdayHeight;
    const parsedWeekdayHeight = (rawWeekdayHeight !== undefined && rawWeekdayHeight !== null && (rawWeekdayHeight as any) !== '')
        ? Number(rawWeekdayHeight)
        : undefined;
    const isCustomWeekdayHeight = typeof parsedWeekdayHeight === 'number' && !isNaN(parsedWeekdayHeight) && parsedWeekdayHeight > 0;
    const weekdayRowHeightPx = isCustomWeekdayHeight ? Math.max(1, Math.round(parsedWeekdayHeight)) : undefined;

    // Custom day row height (line spacing between day numbers)
    const rawDayRowHeight = effectiveStyle?.dayRowHeight;
    const parsedDayRowHeight = (rawDayRowHeight !== undefined && rawDayRowHeight !== null && (rawDayRowHeight as any) !== '')
        ? Number(rawDayRowHeight)
        : undefined;
    const isCustomDayRowHeight = typeof parsedDayRowHeight === 'number' && !isNaN(parsedDayRowHeight) && parsedDayRowHeight > 0;
    const customDayRowHeightPx = isCustomDayRowHeight ? Math.max(1, Math.round(parsedDayRowHeight)) : undefined;

    const weekJustify = weekStyle.verticalAlign === 'top' ? 'flex-start' : (weekStyle.verticalAlign === 'bottom' ? 'flex-end' : 'center');
    const weekAlign = weekStyle.textAlign === 'left' ? 'flex-start' : (weekStyle.textAlign === 'right' ? 'flex-end' : (weekStyle.textAlign === 'justify' ? 'space-between' : 'center'));
    const hasWeekAlign = (weekStyle.verticalAlign && weekStyle.verticalAlign !== 'middle') || (weekStyle.textAlign && weekStyle.textAlign !== 'center');
    const weekCellPadding = weekStyle.cellPadding !== undefined
        ? `${weekStyle.cellPadding}px`
        : (effectiveStyle?.weekdayPadding !== undefined
            ? `${effectiveStyle.weekdayPadding}px`
            : (hasWeekAlign ? '2px 4px' : (isCustomWeekdayHeight ? '0px 2px' : '1px 2px')));

    useEffect(() => {
        if (titleStyle.fontFamily) ensureFontLoaded(titleStyle.fontFamily);
        if (weekStyle.fontFamily) ensureFontLoaded(weekStyle.fontFamily);
        if (dayStyle.fontFamily) ensureFontLoaded(dayStyle.fontFamily);
    }, [titleStyle.fontFamily, weekStyle.fontFamily, dayStyle.fontFamily]);

    useLayoutEffect(() => {
        const box = gridBoxRef.current;
        if (!box) return;
        const measure = () => {
            const w = box.clientWidth;
            const h = box.clientHeight;
            const hh = headerRowRef.current ? headerRowRef.current.offsetHeight : 0;
            if (w > 0 && h > 0) {
                setMeasuredGrid(prev =>
                    prev.width === w && prev.height === h && prev.headerHeight === hh
                        ? prev
                        : { width: w, height: h, headerHeight: hh }
                );
            }
        };
        measure();
        const observer = new ResizeObserver(measure);
        observer.observe(box);
        if (headerRowRef.current) observer.observe(headerRowRef.current);
        return () => observer.disconnect();
    }, [element.w, element.h, colsToShow.length, filteredWeeks.length, weekdayRowHeightPx, customDayRowHeightPx, weekStyle.fontSize]);

    // Compute exact integer pixel column widths & dividers
    const numCols = colsToShow.length;
    const hasMeasuredWidth = measuredGrid.width > 0;
    let accColPx = 0;
    const colPixelWidths: number[] | null = hasMeasuredWidth
        ? Array.from({ length: numCols }).map((_, c) => {
            const target = Math.round(((c + 1) / numCols) * measuredGrid.width);
            const w = Math.max(1, target - accColPx);
            accColPx += w;
            return w;
        })
        : null;

    // Compute exact integer pixel header height & day row heights
    const fallbackHeaderH = weekdayRowHeightPx || (weekStyle.fontSize ? Math.max(12, Math.round(weekStyle.fontSize * (weekStyle.lineHeight || 1.25)) + 4) : 14);
    const effectiveHeaderH = weekdayRowHeightPx || (measuredGrid.headerHeight > 0 ? measuredGrid.headerHeight : fallbackHeaderH);
    const hasMeasuredHeight = measuredGrid.height > 0;

    let dayRowPixelHeights: number[] | null = null;
    if (customDayRowHeightPx) {
        dayRowPixelHeights = Array(filteredWeeks.length).fill(customDayRowHeightPx);
    } else if (hasMeasuredHeight) {
        const availDaysH = Math.max(filteredWeeks.length, measuredGrid.height - effectiveHeaderH);
        let accRowPx = 0;
        dayRowPixelHeights = Array.from({ length: filteredWeeks.length }).map((_, r) => {
            const target = Math.round(((r + 1) / filteredWeeks.length) * availDaysH);
            const h = Math.max(1, target - accRowPx);
            accRowPx += h;
            return h;
        });
    }

    const totalRenderHeightPx = dayRowPixelHeights
        ? effectiveHeaderH + dayRowPixelHeights.reduce((a, b) => a + b, 0)
        : measuredGrid.height;

    // Divider coordinate arrays (exact integers)
    const verticalDividersX: number[] = [];
    if (colPixelWidths && gridConfig.borders?.insideVertical && dividerThickness > 0) {
        let cumX = 0;
        for (let c = 0; c < numCols - 1; c++) {
            cumX += colPixelWidths[c];
            verticalDividersX.push(cumX);
        }
    }

    const horizontalDividersY: number[] = [];
    if (hasMeasuredHeight || customDayRowHeightPx) {
        if ((gridConfig.borders?.headerSeparator || gridConfig.borders?.insideHorizontal) && dividerThickness > 0) {
            horizontalDividersY.push(effectiveHeaderH);
        }
        if (dayRowPixelHeights && gridConfig.borders?.insideHorizontal && dividerThickness > 0) {
            let cumY = effectiveHeaderH;
            for (let r = 0; r < filteredWeeks.length - 1; r++) {
                cumY += dayRowPixelHeights[r];
                horizontalDividersY.push(cumY);
            }
        }
    }

    const hasOuterBorders = outerWidth > 0;
    const calTopInset = hasOuterBorders && gridConfig.borders?.top ? outerWidth : 0;
    const calBottomInset = hasOuterBorders && gridConfig.borders?.bottom ? outerWidth : 0;
    const calLeftInset = hasOuterBorders && gridConfig.borders?.left ? outerWidth : 0;
    const calRightInset = hasOuterBorders && gridConfig.borders?.right ? outerWidth : 0;

    return (
        <div className="flex flex-col w-full h-full min-h-0 overflow-visible">
            <div
                data-cal-part="title"
                className="mb-1 shrink-0"
                style={{
                    fontSize: titleStyle.fontSize,
                    fontFamily: getSafeFontFamily(titleStyle.fontFamily),
                    fontWeight: titleStyle.fontWeight,
                    fontStyle: titleStyle.fontStyle || 'normal',
                    color: titleStyle.color,
                    textAlign: titleStyle.textAlign,
                    textTransform: cssTitleTransform as any,
                    letterSpacing: `${titleStyle.letterSpacing}px`,
                    lineHeight: titleStyle.lineHeight || 1.35,
                    padding: '2px 2px 3px 2px',
                    whiteSpace: 'nowrap',
                    overflow: 'visible',
                    textOverflow: 'clip',
                    backgroundColor: titleStyle.backgroundColor,
                    ...getTextStrokeCss(titleStyle, titleStyle.color || '#000000'),
                }}
            >
                {transformedTitle}
            </div>

            <div
                ref={gridBoxRef}
                className={`flex flex-col w-full relative overflow-hidden ${isCustomDayRowHeight ? 'shrink-0' : 'flex-1 min-h-0'}`}
            >
                {/* Weekday Header Row */}
                <div
                    ref={headerRowRef}
                    className="flex w-full shrink-0"
                    style={{
                        height: weekdayRowHeightPx ? `${weekdayRowHeightPx}px` : undefined,
                        minHeight: weekdayRowHeightPx ? `${weekdayRowHeightPx}px` : `${fallbackHeaderH}px`,
                        maxHeight: weekdayRowHeightPx ? `${weekdayRowHeightPx}px` : undefined,
                    }}
                >
                    {activeHeaders.map((wd, colIndex) => {
                        const transformedWd = isWeekSentenceOrCapitalize ? applyTextTransform(wd, weekTransform) : wd;
                        return (
                            <div
                                key={`h-${colIndex}`}
                                data-cal-part="week"
                                style={{
                                    width: colPixelWidths ? `${colPixelWidths[colIndex]}px` : `${100 / numCols}%`,
                                    flexShrink: 0,
                                    display: 'flex',
                                    alignItems: weekJustify,
                                    justifyContent: weekAlign,
                                    padding: weekCellPadding,
                                    fontSize: weekStyle.fontSize,
                                    fontFamily: getSafeFontFamily(weekStyle.fontFamily),
                                    fontWeight: weekStyle.fontWeight,
                                    fontStyle: weekStyle.fontStyle || 'normal',
                                    lineHeight: weekStyle.lineHeight || 1.2,
                                    color: weekStyle.color,
                                    textTransform: cssWeekTransform as any,
                                    letterSpacing: `${weekStyle.letterSpacing}px`,
                                    backgroundColor: weekStyle.backgroundColor || gridConfig.headerBackgroundColor,
                                    overflow: 'hidden',
                                    height: '100%',
                                    boxSizing: 'border-box',
                                }}
                            >
                                <span
                                    className="truncate max-w-full inline-block"
                                    style={{
                                        lineHeight: '1.1',
                                        overflow: weekStyle.textStrokeWidth ? 'visible' : undefined,
                                        ...getTextStrokeCss(weekStyle, weekStyle.color || '#666666'),
                                    }}
                                >
                                    {transformedWd}
                                </span>
                            </div>
                        );
                    })}
                </div>

                {/* Day Rows */}
                <div className={`flex flex-col w-full ${isCustomDayRowHeight ? 'shrink-0' : 'flex-1 min-h-0'}`}>
                    {filteredWeeks.map((weekRow, rowIdx) => {
                        const rowH = dayRowPixelHeights ? `${dayRowPixelHeights[rowIdx]}px` : `${100 / filteredWeeks.length}%`;
                        return (
                            <div
                                key={`r-${rowIdx}`}
                                className="flex w-full shrink-0"
                                style={{ height: rowH, minHeight: 0, overflow: 'hidden' }}
                            >
                                {weekRow.map((dayNumOrObj, colIndex) => {
                                    const colW = colPixelWidths ? `${colPixelWidths[colIndex]}px` : `${100 / numCols}%`;
                                    const isWeekendCell = dayNumOrObj && typeof dayNumOrObj === 'object' && ('sat' in dayNumOrObj || 'sun' in dayNumOrObj);

                                    if (isWeekendCell) {
                                        const weekendData = dayNumOrObj as { sat: number | null; sun: number | null };
                                        const satNum = weekendData.sat;
                                        const sunNum = weekendData.sun;

                                        const isSatHoliday = satNum ? !!checkIsHoliday(year, monthIndex, satNum, municipalHolidays) : false;
                                        const isSatSpecial = isSatHoliday && specialDaysConfig.highlightHolidays;
                                        const isCurrentSat = highlightCurrentDay && (
                                            (element.type === 'mini_calendar' && (style.calendarOffset || 0) === 0 && satNum === d.dayOfMonth) ||
                                            (element.type === 'full_calendar' && monthIndex === d.month && year === d.year && satNum === d.dayOfMonth)
                                        );
                                        const satActiveStyle = isSatSpecial
                                            ? {
                                                ...dayStyle,
                                                ...specialDaysConfig.style,
                                                fontSize: specialDaysFontSize,
                                                textAlign: dayStyle.textAlign || 'center',
                                                verticalAlign: dayStyle.verticalAlign || 'middle'
                                            }
                                            : dayStyle;

                                        const isSunSunday = sunNum ? true : false;
                                        const isSunHoliday = sunNum ? !!checkIsHoliday(year, monthIndex, sunNum, municipalHolidays) : false;
                                        const isSunSpecial = (isSunSunday && specialDaysConfig.highlightSundays) || (isSunHoliday && specialDaysConfig.highlightHolidays);
                                        const isCurrentSun = highlightCurrentDay && (
                                            (element.type === 'mini_calendar' && (style.calendarOffset || 0) === 0 && sunNum === d.dayOfMonth) ||
                                            (element.type === 'full_calendar' && monthIndex === d.month && year === d.year && sunNum === d.dayOfMonth)
                                        );
                                        const sunActiveStyle = isSunSpecial
                                            ? {
                                                ...dayStyle,
                                                ...specialDaysConfig.style,
                                                fontSize: specialDaysFontSize,
                                                textAlign: dayStyle.textAlign || 'center',
                                                verticalAlign: dayStyle.verticalAlign || 'middle'
                                            }
                                            : dayStyle;

                                        const isVertical = splitWeekend === 'vertical';

                                        return (
                                            <div
                                                key={`d-${rowIdx}-${colIndex}`}
                                                style={{
                                                    width: colW,
                                                    height: '100%',
                                                    flexShrink: 0,
                                                    display: 'flex',
                                                    flexDirection: isVertical ? 'row' : 'column',
                                                    backgroundColor: gridConfig.cellBackgroundColor,
                                                    boxSizing: 'border-box',
                                                    overflow: 'hidden',
                                                }}
                                            >
                                                {/* Saturday Half */}
                                                {(() => {
                                                    const satPadTop = satActiveStyle.verticalAlign === 'top' ? '1.5px' : '0px';
                                                    const satPadBottom = satActiveStyle.verticalAlign === 'bottom' ? '1.5px' : '0px';
                                                    const satPadLeft = satActiveStyle.textAlign === 'left' ? '2px' : '0px';
                                                    const satPadRight = satActiveStyle.textAlign === 'right' ? '2px' : '0px';

                                                    return (
                                                        <div
                                                            data-cal-part="day"
                                                            className={`flex-1 flex overflow-hidden ${isCurrentSat ? 'font-bold' : ''}`}
                                                            style={{
                                                                justifyContent: satActiveStyle.textAlign === 'left' ? 'flex-start' : (satActiveStyle.textAlign === 'right' ? 'flex-end' : 'center'),
                                                                alignItems: satActiveStyle.verticalAlign === 'top' ? 'flex-start' : (satActiveStyle.verticalAlign === 'bottom' ? 'flex-end' : 'center'),
                                                                paddingTop: satPadTop,
                                                                paddingBottom: satPadBottom,
                                                                paddingLeft: satPadLeft,
                                                                paddingRight: satPadRight,
                                                                boxSizing: 'border-box',
                                                                fontSize: satActiveStyle.fontSize,
                                                                fontFamily: getSafeFontFamily(satActiveStyle.fontFamily),
                                                                fontWeight: isCurrentSat ? 'bold' : satActiveStyle.fontWeight,
                                                                color: isCurrentSat ? currentDayHighlightTextColor : satActiveStyle.color,
                                                                letterSpacing: `${satActiveStyle.letterSpacing}px`,
                                                                backgroundColor: isCurrentSat ? currentDayHighlightColor : (satActiveStyle.backgroundColor && satActiveStyle.backgroundColor !== 'transparent' ? satActiveStyle.backgroundColor : 'transparent')
                                                            }}
                                                        >
                                                            {satNum ? (
                                                                <span
                                                                    className="inline-block leading-none select-none max-w-full text-center"
                                                                    style={{
                                                                        lineHeight: 1,
                                                                        fontSize: 'inherit',
                                                                        ...getTextStrokeCss(
                                                                            {
                                                                                ...satActiveStyle,
                                                                                color: isCurrentSat ? currentDayHighlightTextColor : satActiveStyle.color,
                                                                            },
                                                                            isCurrentSat ? currentDayHighlightTextColor : (satActiveStyle.color || '#333333')
                                                                        ),
                                                                    }}
                                                                >
                                                                    {String(satNum).padStart(2, '0')}
                                                                </span>
                                                            ) : ''}
                                                        </div>
                                                    );
                                                })()}

                                                {/* Divider Line */}
                                                {(satNum || sunNum) && dividerThickness > 0 && (
                                                    <div
                                                        className="shrink-0 relative overflow-visible"
                                                        style={isVertical
                                                            ? { width: `${dividerThickness}px`, height: '100%' }
                                                            : { height: `${dividerThickness}px`, width: '100%' }
                                                        }
                                                    >
                                                        <svg
                                                            width="100%"
                                                            height="100%"
                                                            className="block overflow-visible"
                                                            xmlns="http://www.w3.org/2000/svg"
                                                        >
                                                            {isVertical ? (
                                                                <line
                                                                    x1={dividerThickness / 2}
                                                                    y1="0"
                                                                    x2={dividerThickness / 2}
                                                                    y2="100%"
                                                                    stroke={gridConfig.borderColor}
                                                                    strokeWidth={dividerThickness}
                                                                    strokeDasharray={getDashArray(borderStyleName, dividerThickness, scaleFactor)}
                                                                    strokeLinecap={borderStyleName === 'dotted' ? 'round' : 'butt'}
                                                                />
                                                            ) : (
                                                                <line
                                                                    x1="0"
                                                                    y1={dividerThickness / 2}
                                                                    x2="100%"
                                                                    y2={dividerThickness / 2}
                                                                    stroke={gridConfig.borderColor}
                                                                    strokeWidth={dividerThickness}
                                                                    strokeDasharray={getDashArray(borderStyleName, dividerThickness, scaleFactor)}
                                                                    strokeLinecap={borderStyleName === 'dotted' ? 'round' : 'butt'}
                                                                />
                                                            )}
                                                        </svg>
                                                    </div>
                                                )}

                                                {/* Sunday Half */}
                                                {(() => {
                                                    const sunPadTop = sunActiveStyle.verticalAlign === 'top' ? '1.5px' : '0px';
                                                    const sunPadBottom = sunActiveStyle.verticalAlign === 'bottom' ? '1.5px' : '0px';
                                                    const sunPadLeft = sunActiveStyle.textAlign === 'left' ? '2px' : '0px';
                                                    const sunPadRight = sunActiveStyle.textAlign === 'right' ? '2px' : '0px';

                                                    return (
                                                        <div
                                                            data-cal-part="day"
                                                            className={`flex-1 flex overflow-hidden ${isCurrentSun ? 'font-bold' : ''}`}
                                                            style={{
                                                                justifyContent: sunActiveStyle.textAlign === 'left' ? 'flex-start' : (sunActiveStyle.textAlign === 'right' ? 'flex-end' : 'center'),
                                                                alignItems: sunActiveStyle.verticalAlign === 'top' ? 'flex-start' : (sunActiveStyle.verticalAlign === 'bottom' ? 'flex-end' : 'center'),
                                                                paddingTop: sunPadTop,
                                                                paddingBottom: sunPadBottom,
                                                                paddingLeft: sunPadLeft,
                                                                paddingRight: sunPadRight,
                                                                boxSizing: 'border-box',
                                                                fontSize: sunActiveStyle.fontSize,
                                                                fontFamily: getSafeFontFamily(sunActiveStyle.fontFamily),
                                                                fontWeight: isCurrentSun ? 'bold' : sunActiveStyle.fontWeight,
                                                                color: isCurrentSun ? currentDayHighlightTextColor : sunActiveStyle.color,
                                                                letterSpacing: `${sunActiveStyle.letterSpacing}px`,
                                                                backgroundColor: isCurrentSun ? currentDayHighlightColor : (sunActiveStyle.backgroundColor && sunActiveStyle.backgroundColor !== 'transparent' ? sunActiveStyle.backgroundColor : 'transparent')
                                                            }}
                                                        >
                                                            {sunNum ? (
                                                                <span
                                                                    className="inline-block leading-none select-none max-w-full text-center"
                                                                    style={{
                                                                        lineHeight: 1,
                                                                        fontSize: 'inherit',
                                                                        ...getTextStrokeCss(
                                                                            {
                                                                                ...sunActiveStyle,
                                                                                color: isCurrentSun ? currentDayHighlightTextColor : sunActiveStyle.color,
                                                                            },
                                                                            isCurrentSun ? currentDayHighlightTextColor : (sunActiveStyle.color || '#333333')
                                                                        ),
                                                                    }}
                                                                >
                                                                    {String(sunNum).padStart(2, '0')}
                                                                </span>
                                                            ) : ''}
                                                        </div>
                                                    );
                                                })()}
                                            </div>
                                        );
                                    }

                                    const dayNum = dayNumOrObj as number | null;
                                    const isSunday = dayNum ? (new Date(year, monthIndex, dayNum).getDay() === 0) : false;
                                    const isHoliday = dayNum ? !!checkIsHoliday(year, monthIndex, dayNum, municipalHolidays) : false;
                                    const isSpecial = (isSunday && specialDaysConfig.highlightSundays) || (isHoliday && specialDaysConfig.highlightHolidays);
                                    const isCurrentDayPage = highlightCurrentDay && (
                                        (element.type === 'mini_calendar' && (style.calendarOffset || 0) === 0 && dayNum === d.dayOfMonth) ||
                                        (element.type === 'full_calendar' && monthIndex === d.month && year === d.year && dayNum === d.dayOfMonth)
                                    );
                                    const activeStyle = isSpecial
                                        ? {
                                            ...dayStyle,
                                            ...specialDaysConfig.style,
                                            fontSize: specialDaysFontSize,
                                            textAlign: dayStyle.textAlign || 'center',
                                            verticalAlign: dayStyle.verticalAlign || 'middle'
                                        }
                                        : dayStyle;

                                    // Compact directional padding so dates align cleanly to edges without overflowing or inverting
                                    const padTop = activeStyle.verticalAlign === 'top' ? '2px' : '0px';
                                    const padBottom = activeStyle.verticalAlign === 'bottom' ? '2px' : '0px';
                                    const padLeft = activeStyle.textAlign === 'left' ? '3px' : '0px';
                                    const padRight = activeStyle.textAlign === 'right' ? '3px' : '0px';

                                    // Parse alignment values mapping TextStyleConfig to css flex
                                    const justifyValue = activeStyle.verticalAlign === 'top' ? 'flex-start' : (activeStyle.verticalAlign === 'bottom' ? 'flex-end' : 'center');
                                    const alignValue = activeStyle.textAlign === 'left' ? 'flex-start' : (activeStyle.textAlign === 'right' ? 'flex-end' : 'center');

                                    return (
                                        <div
                                            key={`d-${rowIdx}-${colIndex}`}
                                            data-cal-part="day"
                                            className={`${isCurrentDayPage ? 'rounded-sm font-bold' : ''}`}
                                            style={{
                                                width: colW,
                                                height: '100%',
                                                flexShrink: 0,
                                                display: 'flex',
                                                flexDirection: 'column',
                                                justifyContent: justifyValue,
                                                alignItems: alignValue,
                                                paddingTop: padTop,
                                                paddingBottom: padBottom,
                                                paddingLeft: padLeft,
                                                paddingRight: padRight,
                                                boxSizing: 'border-box',
                                                overflow: 'hidden',
                                                fontSize: activeStyle.fontSize,
                                                fontFamily: getSafeFontFamily(activeStyle.fontFamily),
                                                fontWeight: isCurrentDayPage ? 'bold' : activeStyle.fontWeight,
                                                color: isCurrentDayPage ? currentDayHighlightTextColor : activeStyle.color,
                                                letterSpacing: `${activeStyle.letterSpacing}px`,
                                                backgroundColor: isCurrentDayPage ? currentDayHighlightColor : (activeStyle.backgroundColor && activeStyle.backgroundColor !== 'transparent' ? activeStyle.backgroundColor : (dayNum ? gridConfig.cellBackgroundColor : 'transparent')),
                                            }}
                                        >
                                            {dayNum ? (
                                                <span
                                                    className="inline-block leading-none select-none max-w-full text-center"
                                                    style={{
                                                        lineHeight: 1,
                                                        fontSize: 'inherit',
                                                        ...getTextStrokeCss(
                                                            {
                                                                ...activeStyle,
                                                                color: isCurrentDayPage ? currentDayHighlightTextColor : activeStyle.color,
                                                            },
                                                            isCurrentDayPage ? currentDayHighlightTextColor : (activeStyle.color || '#333333')
                                                        ),
                                                    }}
                                                >
                                                    {String(dayNum).padStart(2, '0')}
                                                </span>
                                            ) : ''}
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    })}
                </div>

                {/* Unified Vector SVG Grid Border Overlay — exact thickness & zero Chromium CSS border snapping */}
                {(hasMeasuredWidth || hasMeasuredHeight) && measuredGrid.width > 0 && (outerWidth > 0 || dividerThickness > 0) && (() => {
                    const svgH = totalRenderHeightPx > 0 ? totalRenderHeightPx : measuredGrid.height;
                    if (svgH <= 0) return null;
                    const outerDash = getDashArray(borderStyleName, outerWidth, scaleFactor);
                    const dividerDash = getDashArray(borderStyleName, dividerThickness, scaleFactor);
                    const lineCap = borderStyleName === 'dotted' ? 'round' : 'butt';

                    return (
                        <svg
                            width={measuredGrid.width}
                            height={svgH}
                            viewBox={`0 0 ${measuredGrid.width} ${svgH}`}
                            className="absolute top-0 left-0 pointer-events-none z-20 overflow-visible"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            {outerWidth > 0 && (
                                <>
                                    {gridConfig.borders?.top && (
                                        <line
                                            x1={0}
                                            y1={outerWidth / 2}
                                            x2={measuredGrid.width}
                                            y2={outerWidth / 2}
                                            stroke={gridConfig.borderColor}
                                            strokeWidth={outerWidth}
                                            strokeDasharray={outerDash}
                                            strokeLinecap={lineCap}
                                        />
                                    )}
                                    {gridConfig.borders?.bottom && (
                                        <line
                                            x1={0}
                                            y1={svgH - outerWidth / 2}
                                            x2={measuredGrid.width}
                                            y2={svgH - outerWidth / 2}
                                            stroke={gridConfig.borderColor}
                                            strokeWidth={outerWidth}
                                            strokeDasharray={outerDash}
                                            strokeLinecap={lineCap}
                                        />
                                    )}
                                    {gridConfig.borders?.left && (
                                        <line
                                            x1={outerWidth / 2}
                                            y1={calTopInset}
                                            x2={outerWidth / 2}
                                            y2={svgH - calBottomInset}
                                            stroke={gridConfig.borderColor}
                                            strokeWidth={outerWidth}
                                            strokeDasharray={outerDash}
                                            strokeLinecap={lineCap}
                                        />
                                    )}
                                    {gridConfig.borders?.right && (
                                        <line
                                            x1={measuredGrid.width - outerWidth / 2}
                                            y1={calTopInset}
                                            x2={measuredGrid.width - outerWidth / 2}
                                            y2={svgH - calBottomInset}
                                            stroke={gridConfig.borderColor}
                                            strokeWidth={outerWidth}
                                            strokeDasharray={outerDash}
                                            strokeLinecap={lineCap}
                                        />
                                    )}
                                </>
                            )}

                            {dividerThickness > 0 && horizontalDividersY.map((y, idx) => (
                                <line
                                    key={`cal-h-${idx}`}
                                    x1={calLeftInset}
                                    y1={y}
                                    x2={measuredGrid.width - calRightInset}
                                    y2={y}
                                    stroke={gridConfig.borderColor}
                                    strokeWidth={dividerThickness}
                                    strokeDasharray={dividerDash}
                                    strokeLinecap={lineCap}
                                />
                            ))}

                            {dividerThickness > 0 && verticalDividersX.map((x, idx) => (
                                <line
                                    key={`cal-v-${idx}`}
                                    x1={x}
                                    y1={calTopInset}
                                    x2={x}
                                    y2={svgH - calBottomInset}
                                    stroke={gridConfig.borderColor}
                                    strokeWidth={dividerThickness}
                                    strokeDasharray={dividerDash}
                                    strokeLinecap={lineCap}
                                />
                            ))}
                        </svg>
                    );
                })()}
            </div>
        </div>
    );
};

export const CalendarElement: React.FC<CalendarElementProps> = ({ element, dayData, style, globalCalendarStyle, municipalHolidays, calendarIndex, pageWidth }) => {
    const miniWrapperRef = useRef<HTMLDivElement>(null);
    const fullWrapperRef = useRef<HTMLDivElement>(null);
    const d = dayData;
    const scaleFactor = (pageWidth || 400) / 400;
    const wrapperBorderWidth = style.borderWidth !== undefined ? Math.max(0, Number(style.borderWidth)) : 0;
    const wrapperBorderColor = style.borderColor || '#000';
    const wrapperBorderStyle = style.borderStyle || 'solid';
    const wrapperBorderRadius = style.borderRadius ? Number(style.borderRadius) : 0;

    const getEffectiveStyle = () => {
        if (element.type === 'mini_calendar' && style.useGlobalStyle && globalCalendarStyle) {
            return {
                ...globalCalendarStyle,
                ...style.fullCalendar,
                title: { ...globalCalendarStyle.title, ...style.fullCalendar?.title },
                weekDays: { ...globalCalendarStyle.weekDays, ...style.fullCalendar?.weekDays },
                days: { ...globalCalendarStyle.days, ...style.fullCalendar?.days },
                grid: {
                    ...globalCalendarStyle.grid,
                    ...style.fullCalendar?.grid,
                    borders: { ...globalCalendarStyle.grid?.borders, ...style.fullCalendar?.grid?.borders }
                },
                specialDays: {
                    ...globalCalendarStyle.specialDays,
                    ...style.fullCalendar?.specialDays,
                    style: { ...globalCalendarStyle.specialDays?.style, ...style.fullCalendar?.specialDays?.style }
                }
            };
        }
        return style.fullCalendar;
    };

    const effectiveStyle = getEffectiveStyle();

    if (element.type === 'mini_calendar') {
        const baseMonth = d ? d.month : 0;
        let targetMonth = baseMonth;
        let targetYear = d ? d.year : new Date().getFullYear();

        const monthMode = style.calendarMonthMode || 'sequence';

        if (monthMode === 'fixed') {
            targetMonth = style.calendarFixedMonth !== undefined ? style.calendarFixedMonth : 0;
            targetYear = (d ? d.year : new Date().getFullYear()) + (style.yearOffset || 0);
        } else if (monthMode === 'sequence') {
            const seqOffset = calendarIndex || 0;
            targetMonth = baseMonth + seqOffset + (style.calendarOffset || 0);
        } else {
            // 'relative'
            targetMonth = baseMonth + (style.calendarOffset || 0);
        }

        while (targetMonth < 0) {
            targetMonth += 12;
            targetYear -= 1;
        }
        while (targetMonth > 11) {
            targetMonth -= 12;
            targetYear += 1;
        }

        const containerStyle: React.CSSProperties = {
            backgroundColor: style.backgroundColor || 'transparent',
            borderRadius: wrapperBorderRadius ? `${wrapperBorderRadius}px` : '0',
            padding: style.padding ? `${style.padding}px` : `${4 * scaleFactor}px`,
            boxShadow: style.boxShadow || 'none',
            opacity: style.opacity !== undefined ? style.opacity : 1,
        };

        return (
            <div ref={miniWrapperRef} className="w-full h-full flex flex-col relative" style={containerStyle}>
                <SingleMonthCalendar
                    monthIndex={targetMonth}
                    year={targetYear}
                    element={element}
                    d={d}
                    style={style}
                    effectiveStyle={effectiveStyle}
                    municipalHolidays={municipalHolidays}
                    pageWidth={pageWidth}
                />
                <CalendarWrapperBorderSvg
                    containerRef={miniWrapperRef}
                    borderWidth={wrapperBorderWidth}
                    borderColor={wrapperBorderColor}
                    borderStyle={wrapperBorderStyle}
                    borderRadius={wrapperBorderRadius}
                    scaleFactor={scaleFactor}
                />
            </div>
        );
    }

    if (element.type === 'full_calendar') {
        const months = Array.from({ length: 12 }, (_, i) => i);
        const cols = style.monthsPerRow || 3;
        const rows = Math.ceil(12 / cols);
        const gap = style.gap !== undefined ? style.gap : (10 * scaleFactor);
        const targetYear = d.year + (style.yearOffset || 0);

        const containerStyle: React.CSSProperties = {
            display: 'grid',
            gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
            gap: `${gap}px`,
            backgroundColor: style.backgroundColor || 'transparent',
            padding: style.padding ? `${style.padding}px` : `${4 * scaleFactor}px`,
            borderRadius: wrapperBorderRadius ? `${wrapperBorderRadius}px` : '0',
            boxShadow: style.boxShadow || 'none',
            opacity: style.opacity !== undefined ? style.opacity : 1,
        };

        return (
            <div ref={fullWrapperRef} className="w-full h-full relative" style={containerStyle}>
                {months.map(m => (
                    <div key={m} className="overflow-visible min-h-0">
                        <SingleMonthCalendar
                            monthIndex={m}
                            year={targetYear}
                            element={element}
                            d={d}
                            style={style}
                            effectiveStyle={effectiveStyle}
                            municipalHolidays={municipalHolidays}
                            pageWidth={pageWidth}
                        />
                    </div>
                ))}
                <CalendarWrapperBorderSvg
                    containerRef={fullWrapperRef}
                    borderWidth={wrapperBorderWidth}
                    borderColor={wrapperBorderColor}
                    borderStyle={wrapperBorderStyle}
                    borderRadius={wrapperBorderRadius}
                    scaleFactor={scaleFactor}
                />
            </div>
        );
    }

    return null;
};
