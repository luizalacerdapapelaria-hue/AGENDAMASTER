
import React, { useRef, useLayoutEffect, useEffect, useState } from 'react';
import { CalendarElementProps } from './types';
import { getMonthName, getDayName, generateMonthGrid, checkIsHoliday } from '../../../../core/backend/calendar';
import { TextStyleConfig, Holiday, DayData, LayoutElement } from '../../../../types';
import { getTextStrokeCss } from '../../../../core/logic/textStroke';
import { getSafeFontFamily, ensureFontLoaded } from '../../../../core/logic/fontDetector';

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
        borderColor: '#ddd', borderWidth: 1, dividerWidth: undefined as number | undefined, borderStyle: 'solid',
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
    const isSolidBorder = borderStyleName === 'solid';

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
                                    fontFamily: weekStyle.fontFamily,
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
                                                                fontFamily: satActiveStyle.fontFamily,
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
                                                        style={isSolidBorder
                                                            ? (isVertical
                                                                ? { width: `${dividerThickness}px`, height: '100%', backgroundColor: gridConfig.borderColor, flexShrink: 0 }
                                                                : { height: `${dividerThickness}px`, width: '100%', backgroundColor: gridConfig.borderColor, flexShrink: 0 })
                                                            : (isVertical
                                                                ? { borderLeft: `${dividerThickness}px ${borderStyleName} ${gridConfig.borderColor}`, width: 0, height: '100%', flexShrink: 0 }
                                                                : { borderTop: `${dividerThickness}px ${borderStyleName} ${gridConfig.borderColor}`, height: 0, width: '100%', flexShrink: 0 })
                                                        }
                                                    />
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
                                                                fontFamily: sunActiveStyle.fontFamily,
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
                                                fontFamily: activeStyle.fontFamily,
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

                {/* Unified Pixel-Locked Grid Border Overlay — prevents subpixel variation & protruding edges in PDF */}
                {(hasMeasuredWidth || hasMeasuredHeight) && (
                    <div
                        className="absolute top-0 left-0 right-0 pointer-events-none z-20 overflow-hidden"
                        style={{ height: totalRenderHeightPx > 0 ? `${totalRenderHeightPx}px` : '100%' }}
                    >
                        {outerWidth > 0 && (
                            <>
                                {gridConfig.borders?.top && (
                                    <div
                                        style={isSolidBorder
                                            ? { position: 'absolute', top: 0, left: 0, right: 0, height: `${outerWidth}px`, backgroundColor: gridConfig.borderColor }
                                            : { position: 'absolute', top: 0, left: 0, right: 0, height: 0, borderTop: `${outerWidth}px ${borderStyleName} ${gridConfig.borderColor}` }
                                        }
                                    />
                                )}
                                {gridConfig.borders?.bottom && totalRenderHeightPx > 0 && (
                                    <div
                                        style={isSolidBorder
                                            ? { position: 'absolute', bottom: 0, left: 0, right: 0, height: `${outerWidth}px`, backgroundColor: gridConfig.borderColor }
                                            : { position: 'absolute', bottom: 0, left: 0, right: 0, height: 0, borderBottom: `${outerWidth}px ${borderStyleName} ${gridConfig.borderColor}` }
                                        }
                                    />
                                )}
                                {gridConfig.borders?.left && (
                                    <div
                                        style={isSolidBorder
                                            ? { position: 'absolute', top: `${calTopInset}px`, bottom: `${calBottomInset}px`, left: 0, width: `${outerWidth}px`, backgroundColor: gridConfig.borderColor }
                                            : { position: 'absolute', top: `${calTopInset}px`, bottom: `${calBottomInset}px`, left: 0, width: 0, borderLeft: `${outerWidth}px ${borderStyleName} ${gridConfig.borderColor}` }
                                        }
                                    />
                                )}
                                {gridConfig.borders?.right && measuredGrid.width > 0 && (
                                    <div
                                        style={isSolidBorder
                                            ? { position: 'absolute', top: `${calTopInset}px`, bottom: `${calBottomInset}px`, right: 0, width: `${outerWidth}px`, backgroundColor: gridConfig.borderColor }
                                            : { position: 'absolute', top: `${calTopInset}px`, bottom: `${calBottomInset}px`, right: 0, width: 0, borderRight: `${outerWidth}px ${borderStyleName} ${gridConfig.borderColor}` }
                                        }
                                    />
                                )}
                            </>
                        )}

                        {horizontalDividersY.map((y, idx) => (
                            <div
                                key={`cal-h-${idx}`}
                                style={isSolidBorder
                                    ? { position: 'absolute', top: `${y}px`, left: `${calLeftInset}px`, right: `${calRightInset}px`, height: `${dividerThickness}px`, backgroundColor: gridConfig.borderColor }
                                    : { position: 'absolute', top: `${y}px`, left: `${calLeftInset}px`, right: `${calRightInset}px`, height: 0, borderTop: `${dividerThickness}px ${borderStyleName} ${gridConfig.borderColor}` }
                                }
                            />
                        ))}

                        {verticalDividersX.map((x, idx) => (
                            <div
                                key={`cal-v-${idx}`}
                                style={isSolidBorder
                                    ? { position: 'absolute', left: `${x}px`, top: `${calTopInset}px`, bottom: `${calBottomInset}px`, width: `${dividerThickness}px`, backgroundColor: gridConfig.borderColor }
                                    : { position: 'absolute', left: `${x}px`, top: `${calTopInset}px`, bottom: `${calBottomInset}px`, width: 0, borderLeft: `${dividerThickness}px ${borderStyleName} ${gridConfig.borderColor}` }
                                }
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export const CalendarElement: React.FC<CalendarElementProps> = ({ element, dayData, style, globalCalendarStyle, municipalHolidays, calendarIndex, pageWidth }) => {
    const d = dayData;

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
            border: style.borderWidth ? `${style.borderWidth}px ${style.borderStyle || 'solid'} ${style.borderColor || '#000'}` : 'none',
            borderRadius: style.borderRadius ? `${style.borderRadius}px` : '0',
            padding: style.padding ? `${style.padding}px` : '4px',
            boxShadow: style.boxShadow || 'none',
            opacity: style.opacity !== undefined ? style.opacity : 1,
        };

        return (
            <div className="w-full h-full flex flex-col" style={containerStyle}>
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
            </div>
        );
    }

    if (element.type === 'full_calendar') {
        const months = Array.from({ length: 12 }, (_, i) => i);
        const cols = style.monthsPerRow || 3;
        const rows = Math.ceil(12 / cols);
        const gap = style.gap !== undefined ? style.gap : 10;
        const targetYear = d.year + (style.yearOffset || 0);

        const containerStyle: React.CSSProperties = {
            display: 'grid',
            gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
            gap: `${gap}px`,
            backgroundColor: style.backgroundColor || 'transparent',
            padding: style.padding ? `${style.padding}px` : '4px',
            border: style.borderWidth ? `${style.borderWidth}px ${style.borderStyle || 'solid'} ${style.borderColor || '#000'}` : 'none',
            borderRadius: style.borderRadius ? `${style.borderRadius}px` : '0',
            boxShadow: style.boxShadow || 'none',
            opacity: style.opacity !== undefined ? style.opacity : 1,
        };

        return (
            <div className="w-full h-full" style={containerStyle}>
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
            </div>
        );
    }

    return null;
};
