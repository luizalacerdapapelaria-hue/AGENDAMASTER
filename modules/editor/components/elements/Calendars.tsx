
import React from 'react';
import { CalendarElementProps } from './types';
import { getMonthName, generateMonthGrid, checkIsHoliday } from '../../../../core/backend/calendar';
import { TextStyleConfig } from '../../../../types';

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

export const CalendarElement: React.FC<CalendarElementProps> = ({ element, dayData, style, globalCalendarStyle, municipalHolidays, pageHeight, pageWidth, calendarIndex }) => {
    const d = dayData;
    const highlightCurrentDay = style.highlightCurrentDay !== false;
    const currentDayHighlightColor = style.currentDayHighlightColor || '#4f46e5';
    const currentDayHighlightTextColor = style.currentDayHighlightTextColor || '#ffffff';

    const renderSingleMonth = (monthIndex: number, year: number) => {
        // LOGIC FOR STYLE INHERITANCE
        const getEffectiveStyle = () => {
            if (element.type === 'mini_calendar' && style.useGlobalStyle && globalCalendarStyle) {
                // Merge global style with local overrides
                return {
                    ...globalCalendarStyle,
                    ...style.fullCalendar,
                    // Deep merge sub-objects
                    title: { ...globalCalendarStyle.title, ...style.fullCalendar?.title },
                    weekDays: { ...globalCalendarStyle.weekDays, ...style.fullCalendar?.weekDays },
                    days: { ...globalCalendarStyle.days, ...style.fullCalendar?.days },
                    grid: { ...globalCalendarStyle.grid, ...style.fullCalendar?.grid, 
                        borders: { ...globalCalendarStyle.grid?.borders, ...style.fullCalendar?.grid?.borders } 
                    },
                    specialDays: { ...globalCalendarStyle.specialDays, ...style.fullCalendar?.specialDays,
                        style: { ...globalCalendarStyle.specialDays?.style, ...style.fullCalendar?.specialDays?.style }
                    }
                };
            }
            return style.fullCalendar;
        };

        const effectiveStyle = getEffectiveStyle();
        
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
        let gridColsClass = "grid-cols-7";
        if (hasSplitWeekend) {
            if (splitMode === 'left') {
                colsToShow = [0, 1, 2]; // Cols 1..3
                gridColsClass = "grid-cols-3";
            } else if (splitMode === 'right') {
                colsToShow = [3, 4, 'weekend']; // Cols 4..5, and combined 6/7
                gridColsClass = "grid-cols-3";
            } else {
                colsToShow = [0, 1, 2, 3, 4, 'weekend'];
                gridColsClass = "grid-cols-6";
            }
        } else {
            if (splitMode === 'left') {
                colsToShow = [0, 1, 2];
                gridColsClass = "grid-cols-3";
            } else if (splitMode === 'right') {
                colsToShow = [3, 4, 5, 6];
                gridColsClass = "grid-cols-4";
            }
        }

        const titleStyle = { 
            fontSize: 12, fontFamily: 'Inter', fontWeight: 'bold', color: '#000', 
            textAlign: 'center', textTransform: 'uppercase', letterSpacing: 0, 
            backgroundColor: 'transparent',
            ...effectiveStyle?.title 
        } as TextStyleConfig;

        const weekStyle = { 
            fontSize: 8, fontFamily: 'Inter', fontWeight: 'bold', color: '#666', 
            textAlign: 'center', textTransform: 'none', letterSpacing: 0, 
            backgroundColor: 'transparent',
            ...effectiveStyle?.weekDays 
        } as TextStyleConfig;

        const dayStyle = { 
            fontSize: 10, fontFamily: 'Inter', fontWeight: 'normal', color: '#333', 
            textAlign: 'center', textTransform: 'none', letterSpacing: 0, 
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
        
        const baseBorderStyle = `${gridConfig.borderWidth}px ${gridConfig.borderStyle || 'solid'} ${gridConfig.borderColor}`;
        const dividerThickness = gridConfig.dividerWidth !== undefined ? gridConfig.dividerWidth : gridConfig.borderWidth;
        const dividerBorderStyle = `${dividerThickness}px ${gridConfig.borderStyle || 'solid'} ${gridConfig.borderColor}`;
        const noBorder = 'none';
        
        // Filter cols of each week
        const filteredWeeks = grid.map(week => {
            return colsToShow.map(col => {
                if (col === 'weekend') {
                    return { sat: week[5] || null, sun: week[6] || null };
                }
                return week[col as number];
            });
        });
        const flatGridFiltered = filteredWeeks.flat();
        const totalRows = filteredWeeks.length + 1; 
        
        const showYear = effectiveStyle?.showYearInTitle ?? (element.type === 'full_calendar'); 
        const monthFormat = element.style.nameFormat || (effectiveStyle as any)?.monthFormat;
        const monthName = getMonthName(monthIndex, monthFormat);
        const titleText = showYear ? `${monthName} ${year}` : monthName;
  
        const titleTransform = titleStyle.textTransform;
        const isTitleSentenceOrCapitalize = titleTransform === 'sentence' || titleTransform === 'capitalize';
        const cssTitleTransform = isTitleSentenceOrCapitalize ? 'none' : titleTransform;
        const transformedTitle = isTitleSentenceOrCapitalize ? applyTextTransform(titleText, titleTransform) : titleText;

        const weekTransform = weekStyle.textTransform;
        const isWeekSentenceOrCapitalize = weekTransform === 'sentence' || weekTransform === 'capitalize';
        const cssWeekTransform = isWeekSentenceOrCapitalize ? 'none' : weekTransform;

        const baseStandardHeaders = ['D','S','T','Q','Q','S','S'];
        const baseShortHeaders = ['DOM','SEG','TER','QUA','QUI','SEX','SÁB'];
        const baseMediumHeaders = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];

        const rotateArray = <T,>(arr: T[], n: number): T[] => {
            const shift = ((n % arr.length) + arr.length) % arr.length;
            return [...arr.slice(shift), ...arr.slice(0, shift)];
        };

        const standardHeaders = rotateArray(baseStandardHeaders, startOfWeekDay);
        const shortHeaders = rotateArray(baseShortHeaders, startOfWeekDay);
        const mediumHeaders = rotateArray(baseMediumHeaders, startOfWeekDay);

        let activeHeaders: string[] = [];
        if (hasSplitWeekend) {
            const getHeaderName = (col: number | string) => {
                if (col === 'weekend') {
                    const h5 = shortHeaders[5];
                    const h6 = shortHeaders[6];
                    if (effectiveStyle?.weekdayFormat === 'short') return `${h5}/${h6}`;
                    if (effectiveStyle?.weekdayFormat === 'medium') return `${mediumHeaders[5]}/${mediumHeaders[6]}`;
                    return `${standardHeaders[5]}/${standardHeaders[6]}`;
                }
                const headers = effectiveStyle?.weekdayFormat === 'short' 
                    ? shortHeaders 
                    : (effectiveStyle?.weekdayFormat === 'medium' ? mediumHeaders : standardHeaders);
                return headers[col as number];
            };
            activeHeaders = colsToShow.map(getHeaderName);
        } else {
            const activeHeadersAll = effectiveStyle?.weekdayFormat === 'short' 
                ? shortHeaders 
                : (effectiveStyle?.weekdayFormat === 'medium' ? mediumHeaders : standardHeaders);
            activeHeaders = colsToShow.map(colIndex => activeHeadersAll[colIndex as number]);
        }

        return (
            <div key={monthIndex} className="flex flex-col w-full h-full">
                <div className="mb-1 pb-0.5" style={{ fontSize: titleStyle.fontSize, fontFamily: titleStyle.fontFamily, fontWeight: titleStyle.fontWeight, color: titleStyle.color, textAlign: titleStyle.textAlign, textTransform: cssTitleTransform as any, letterSpacing: `${titleStyle.letterSpacing}px`, backgroundColor: titleStyle.backgroundColor }}>{transformedTitle}</div>
                <div className={`grid ${gridColsClass} gap-0 flex-1`}>
                    {activeHeaders.map((wd, colIndex) => {
                        const transformedWd = isWeekSentenceOrCapitalize ? applyTextTransform(wd, weekTransform) : wd;
                        return (<div key={`h-${colIndex}`} className="flex items-center justify-center" style={{ fontSize: weekStyle.fontSize, fontFamily: weekStyle.fontFamily, fontWeight: weekStyle.fontWeight, color: weekStyle.color, textTransform: cssWeekTransform as any, letterSpacing: `${weekStyle.letterSpacing}px`, backgroundColor: weekStyle.backgroundColor || gridConfig.headerBackgroundColor, borderTop: gridConfig.borders?.top ? baseBorderStyle : noBorder, borderBottom: gridConfig.borders?.headerSeparator ? dividerBorderStyle : (gridConfig.borders?.insideHorizontal ? dividerBorderStyle : noBorder), borderLeft: (colIndex === 0 && gridConfig.borders?.left) ? baseBorderStyle : (colIndex > 0 && gridConfig.borders?.insideVertical ? dividerBorderStyle : noBorder), borderRight: (colIndex === colsToShow.length - 1 && gridConfig.borders?.right) ? baseBorderStyle : noBorder }}>{transformedWd}</div>);
                    })}
                    {flatGridFiltered.map((dayNumOrObj, i) => {
                        const colIndex = i % colsToShow.length;
                        const rowIndex = Math.floor(i / colsToShow.length) + 1; 
                        const isLastRow = rowIndex === totalRows - 1;

                        const isWeekendCell = dayNumOrObj && typeof dayNumOrObj === 'object' && ('sat' in dayNumOrObj || 'sun' in dayNumOrObj);

                        if (isWeekendCell) {
                            const weekendData = dayNumOrObj as { sat: number | null, sun: number | null };
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
                                    textAlign: dayStyle.textAlign || 'center',
                                    verticalAlign: dayStyle.verticalAlign || 'middle'
                                  } 
                                : dayStyle;

                            const isVertical = splitWeekend === 'vertical';

                            return (
                                <div 
                                    key={`d-${i}`} 
                                    style={{ 
                                        display: 'flex',
                                        flexDirection: isVertical ? 'row' : 'column',
                                        backgroundColor: gridConfig.cellBackgroundColor,
                                        borderBottom: isLastRow ? (gridConfig.borders?.bottom ? baseBorderStyle : noBorder) : (gridConfig.borders?.insideHorizontal ? dividerBorderStyle : noBorder), 
                                        borderLeft: (colIndex === 0 && gridConfig.borders?.left) ? baseBorderStyle : (colIndex > 0 && gridConfig.borders?.insideVertical ? dividerBorderStyle : noBorder), 
                                        borderRight: (colIndex === colsToShow.length - 1 && gridConfig.borders?.right) ? baseBorderStyle : noBorder 
                                    }}
                                    className="w-full h-full overflow-hidden"
                                >
                                    {/* Saturday Half */}
                                    <div 
                                        className={`flex-1 flex overflow-hidden ${isCurrentSat ? 'font-bold' : ''}`}
                                        style={{
                                            justifyContent: satActiveStyle.textAlign === 'left' ? 'flex-start' : (satActiveStyle.textAlign === 'right' ? 'flex-end' : 'center'),
                                            alignItems: satActiveStyle.verticalAlign === 'top' ? 'flex-start' : (satActiveStyle.verticalAlign === 'bottom' ? 'flex-end' : 'center'),
                                            padding: (satActiveStyle.verticalAlign && satActiveStyle.verticalAlign !== 'middle') || (satActiveStyle.textAlign && satActiveStyle.textAlign !== 'center') ? '2px 4px' : '0px',
                                            fontSize: satActiveStyle.fontSize,
                                            fontFamily: satActiveStyle.fontFamily,
                                            fontWeight: isCurrentSat ? 'bold' : satActiveStyle.fontWeight,
                                            color: isCurrentSat ? currentDayHighlightTextColor : satActiveStyle.color,
                                            letterSpacing: `${satActiveStyle.letterSpacing}px`,
                                            backgroundColor: isCurrentSat ? currentDayHighlightColor : (satActiveStyle.backgroundColor && satActiveStyle.backgroundColor !== 'transparent' ? satActiveStyle.backgroundColor : 'transparent')
                                        }}
                                    >
                                        {satNum ? String(satNum).padStart(2, '0') : ''}
                                    </div>

                                    {/* Divider Line */}
                                    {(satNum || sunNum) && (
                                        <div 
                                            style={isVertical 
                                                ? { borderLeft: dividerBorderStyle, width: 0, height: '100%' }
                                                : { borderTop: dividerBorderStyle, height: 0, width: '100%' }
                                            } 
                                        />
                                    )}

                                    {/* Sunday Half */}
                                    <div 
                                        className={`flex-1 flex overflow-hidden ${isCurrentSun ? 'font-bold' : ''}`}
                                        style={{
                                            justifyContent: sunActiveStyle.textAlign === 'left' ? 'flex-start' : (sunActiveStyle.textAlign === 'right' ? 'flex-end' : 'center'),
                                            alignItems: sunActiveStyle.verticalAlign === 'top' ? 'flex-start' : (sunActiveStyle.verticalAlign === 'bottom' ? 'flex-end' : 'center'),
                                            padding: (sunActiveStyle.verticalAlign && sunActiveStyle.verticalAlign !== 'middle') || (sunActiveStyle.textAlign && sunActiveStyle.textAlign !== 'center') ? '2px 4px' : '0px',
                                            fontSize: sunActiveStyle.fontSize,
                                            fontFamily: sunActiveStyle.fontFamily,
                                            fontWeight: isCurrentSun ? 'bold' : sunActiveStyle.fontWeight,
                                            color: isCurrentSun ? currentDayHighlightTextColor : sunActiveStyle.color,
                                            letterSpacing: `${sunActiveStyle.letterSpacing}px`,
                                            backgroundColor: isCurrentSun ? currentDayHighlightColor : (sunActiveStyle.backgroundColor && sunActiveStyle.backgroundColor !== 'transparent' ? sunActiveStyle.backgroundColor : 'transparent')
                                        }}
                                    >
                                        {sunNum ? String(sunNum).padStart(2, '0') : ''}
                                    </div>
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
                                textAlign: dayStyle.textAlign || 'center',
                                verticalAlign: dayStyle.verticalAlign || 'middle'
                              } 
                            : dayStyle;

                        // Parse alignment values mapping TextStyleConfig to css flex
                        const justifyValue = activeStyle.verticalAlign === 'top' ? 'flex-start' : (activeStyle.verticalAlign === 'bottom' ? 'flex-end' : 'center');
                        const alignValue = activeStyle.textAlign === 'left' ? 'flex-start' : (activeStyle.textAlign === 'right' ? 'flex-end' : 'center');
                        const hasAlign = (activeStyle.verticalAlign && activeStyle.verticalAlign !== 'middle') || (activeStyle.textAlign && activeStyle.textAlign !== 'center');
                        const cellPadding = hasAlign ? '4px 6px' : '0px';

                        return (
                            <div 
                                key={`d-${i}`} 
                                className={`${isCurrentDayPage ? 'rounded-sm font-bold' : ''}`} 
                                style={{ 
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: justifyValue,
                                    alignItems: alignValue,
                                    padding: cellPadding,
                                    fontSize: activeStyle.fontSize, 
                                    fontFamily: activeStyle.fontFamily, 
                                    fontWeight: isCurrentDayPage ? 'bold' : activeStyle.fontWeight, 
                                    color: isCurrentDayPage ? currentDayHighlightTextColor : activeStyle.color, 
                                    letterSpacing: `${activeStyle.letterSpacing}px`, 
                                    backgroundColor: isCurrentDayPage ? currentDayHighlightColor : (activeStyle.backgroundColor && activeStyle.backgroundColor !== 'transparent' ? activeStyle.backgroundColor : (dayNum ? gridConfig.cellBackgroundColor : 'transparent')), 
                                    borderBottom: isLastRow ? (gridConfig.borders?.bottom ? baseBorderStyle : noBorder) : (gridConfig.borders?.insideHorizontal ? dividerBorderStyle : noBorder), 
                                    borderLeft: (colIndex === 0 && gridConfig.borders?.left) ? baseBorderStyle : (colIndex > 0 && gridConfig.borders?.insideVertical ? dividerBorderStyle : noBorder), 
                                    borderRight: (colIndex === colsToShow.length - 1 && gridConfig.borders?.right) ? baseBorderStyle : noBorder 
                                }}
                            >
                                {dayNum ? String(dayNum).padStart(2, '0') : ''}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

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

        return <div className="w-full h-full flex flex-col" style={containerStyle}>{renderSingleMonth(targetMonth, targetYear)}</div>;
    }

    if (element.type === 'full_calendar') {
        const months = Array.from({ length: 12 }, (_, i) => i);
        const cols = style.monthsPerRow || 3;
        const gap = style.gap !== undefined ? style.gap : 10;
        const targetYear = d.year + (style.yearOffset || 0);
        
        const containerStyle: React.CSSProperties = {
            display: 'grid', 
            gridTemplateColumns: `repeat(${cols}, 1fr)`, 
            gap: `${gap}px`, 
            backgroundColor: style.backgroundColor || 'transparent', 
            padding: style.padding ? `${style.padding}px` : '4px',
            border: style.borderWidth ? `${style.borderWidth}px ${style.borderStyle || 'solid'} ${style.borderColor || '#000'}` : 'none',
            borderRadius: style.borderRadius ? `${style.borderRadius}px` : '0',
            boxShadow: style.boxShadow || 'none',
            opacity: style.opacity !== undefined ? style.opacity : 1,
        };

        return <div className="w-full h-full" style={containerStyle}>{months.map(m => (<div key={m} className="overflow-hidden">{renderSingleMonth(m, targetYear)}</div>))}</div>;
    }

    return null;
};
