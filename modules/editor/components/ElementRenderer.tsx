
import React, { memo } from 'react';
import { LayoutElement, DayData, Holiday } from '../../../types';
import { checkIsHoliday } from '../../../core/backend/calendar';
import { TableElement } from './elements/Tables';
import { CalendarElement } from './elements/Calendars';
import { ShapeElement } from './elements/Shapes';
import { TextElement } from './elements/Texts';
import { PlaceholderElement } from './elements/Placeholders';
import { GraphicsElement } from './elements/Graphics';
import { ImageElement } from './elements/Images';
import { IconElement } from './elements/Icons';
import { PermanentDayHeader } from './elements/PermanentDayHeader';
import { PlannerDayBox } from './elements/PlannerDayBox';

interface ElementRendererProps {
  element: LayoutElement;
  dayData: DayData;
  weekDays?: DayData[]; // Novo: Contexto da semana para planners
  quote?: string;
  verse?: string;
  isEditor: boolean;
  isSelected?: boolean;
  onContentChange?: (id: string, content: string) => void;
  onTableResizeStart?: (e: React.MouseEvent, elementId: string, colIndex: number) => void;
  onTableRowResizeStart?: (e: React.MouseEvent, elementId: string, rowIndex: number) => void;
  onTableCellChange?: (elementId: string, row: number, col: number, text: string) => void;
  onTableCellFocus?: (elementId: string, row: number, col: number) => void;
  activeTableCell?: { elementId: string; r: number; c: number } | null;
  globalCalendarStyle?: LayoutElement['style']['fullCalendar'];
  municipalHolidays?: Holiday[];
  calendarIndex?: number;
}

const getShiftedDayData = (baseDay: DayData, offset: number, municipalHolidays: Holiday[] = []): DayData => {
    if (!offset || offset === 0 || !baseDay) return baseDay;
    if (!baseDay.date) {
        return {
            ...baseDay,
            dayOfMonth: baseDay.dayOfMonth ? baseDay.dayOfMonth + offset : offset
        };
    }
    const targetDate = new Date(baseDay.date);
    targetDate.setDate(targetDate.getDate() + offset);
    const year = targetDate.getFullYear();
    const month = targetDate.getMonth();
    const day = targetDate.getDate();
    const holidayName = checkIsHoliday(year, month, day, municipalHolidays);

    return {
        ...baseDay,
        dayOfMonth: day,
        month: month,
        year: year,
        dayOfWeek: targetDate.getDay(),
        date: targetDate,
        holiday: holidayName
    };
};

const scaleStyle = (style: any, scaleFactor: number) => {
    if (!style) return style;
    const scaled = { ...style };
    
    if (typeof style.fontSize === 'number') {
        scaled.fontSize = Math.max(1, style.fontSize * scaleFactor);
    }
    if (typeof style.letterSpacing === 'number') {
        scaled.letterSpacing = style.letterSpacing * scaleFactor;
    }
    if (typeof style.borderWidth === 'number') {
        scaled.borderWidth = style.borderWidth * scaleFactor;
    }
    if (typeof style.borderRadius === 'number') {
        scaled.borderRadius = style.borderRadius * scaleFactor;
    }
    if (typeof style.lineSpacing === 'number') {
        scaled.lineSpacing = style.lineSpacing * scaleFactor;
    }
    if (typeof style.habitMarkerSize === 'number') {
        scaled.habitMarkerSize = style.habitMarkerSize * scaleFactor;
    }
    if (typeof style.habitSpacing === 'number') {
        scaled.habitSpacing = style.habitSpacing * scaleFactor;
    }
    if (typeof style.gridSize === 'number') {
        scaled.gridSize = style.gridSize * scaleFactor;
    }
    
    // Scale plannerDayBox configurations
    if (style.plannerDayBox) {
        scaled.plannerDayBox = {
            ...style.plannerDayBox,
            headerBorderWidth: typeof style.plannerDayBox.headerBorderWidth === 'number' ? style.plannerDayBox.headerBorderWidth * scaleFactor : style.plannerDayBox.headerBorderWidth,
            strokeWidth: typeof style.plannerDayBox.strokeWidth === 'number' ? style.plannerDayBox.strokeWidth * scaleFactor : style.plannerDayBox.strokeWidth,
        };
    }
    
    // Scale table configs
    if (style.table) {
        scaled.table = {
            ...style.table,
            rowHeight: typeof style.table.rowHeight === 'number' ? style.table.rowHeight * scaleFactor : style.table.rowHeight,
            borderWidth: typeof style.table.borderWidth === 'number' ? style.table.borderWidth * scaleFactor : style.table.borderWidth,
            outerBorderWidth: typeof style.table.outerBorderWidth === 'number' ? style.table.outerBorderWidth * scaleFactor : style.table.outerBorderWidth,
            insideBorderWidth: typeof style.table.insideBorderWidth === 'number' ? style.table.insideBorderWidth * scaleFactor : style.table.insideBorderWidth,
            borderRadius: typeof style.table.borderRadius === 'number' ? style.table.borderRadius * scaleFactor : style.table.borderRadius,
        };
        if (style.table.textStyle) {
            scaled.table.textStyle = {
                ...style.table.textStyle,
                fontSize: typeof style.table.textStyle.fontSize === 'number' ? Math.max(1, style.table.textStyle.fontSize * scaleFactor) : style.table.textStyle.fontSize,
                letterSpacing: typeof style.table.textStyle.letterSpacing === 'number' ? style.table.textStyle.letterSpacing * scaleFactor : style.table.textStyle.letterSpacing,
                cellPadding: typeof style.table.textStyle.cellPadding === 'number' ? style.table.textStyle.cellPadding * scaleFactor : style.table.textStyle.cellPadding,
            };
        }
        if (style.table.cellStyles) {
            const scaledCellStyles: Record<string, any> = {};
            Object.entries(style.table.cellStyles).forEach(([key, val]: [string, any]) => {
                if (val && typeof val === 'object') {
                    scaledCellStyles[key] = {
                        ...val,
                        fontSize: typeof val.fontSize === 'number' ? Math.max(1, val.fontSize * scaleFactor) : val.fontSize,
                        letterSpacing: typeof val.letterSpacing === 'number' ? val.letterSpacing * scaleFactor : val.letterSpacing,
                        cellPadding: typeof val.cellPadding === 'number' ? val.cellPadding * scaleFactor : val.cellPadding,
                    };
                } else {
                    scaledCellStyles[key] = val;
                }
            });
            scaled.table.cellStyles = scaledCellStyles;
        }
        if (style.table.rowStyles) {
            const scaledRowStyles: Record<string, any> = {};
            Object.entries(style.table.rowStyles).forEach(([key, val]: [string, any]) => {
                if (val && typeof val === 'object') {
                    scaledRowStyles[key] = {
                        ...val,
                        fontSize: typeof val.fontSize === 'number' ? Math.max(1, val.fontSize * scaleFactor) : val.fontSize,
                        letterSpacing: typeof val.letterSpacing === 'number' ? val.letterSpacing * scaleFactor : val.letterSpacing,
                        cellPadding: typeof val.cellPadding === 'number' ? val.cellPadding * scaleFactor : val.cellPadding,
                    };
                } else {
                    scaledRowStyles[key] = val;
                }
            });
            scaled.table.rowStyles = scaledRowStyles;
        }
        if (style.table.colStyles) {
            const scaledColStyles: Record<string, any> = {};
            Object.entries(style.table.colStyles).forEach(([key, val]: [string, any]) => {
                if (val && typeof val === 'object') {
                    scaledColStyles[key] = {
                        ...val,
                        fontSize: typeof val.fontSize === 'number' ? Math.max(1, val.fontSize * scaleFactor) : val.fontSize,
                        letterSpacing: typeof val.letterSpacing === 'number' ? val.letterSpacing * scaleFactor : val.letterSpacing,
                        cellPadding: typeof val.cellPadding === 'number' ? val.cellPadding * scaleFactor : val.cellPadding,
                    };
                } else {
                    scaledColStyles[key] = val;
                }
            });
            scaled.table.colStyles = scaledColStyles;
        }
    }
    
    // Scale calendar configs
    if (style.fullCalendar) {
        scaled.fullCalendar = { ...style.fullCalendar };
        if (typeof style.fullCalendar.weekdayHeight === 'number') {
            scaled.fullCalendar.weekdayHeight = style.fullCalendar.weekdayHeight * scaleFactor;
        }
        if (typeof style.fullCalendar.weekdayPadding === 'number') {
            scaled.fullCalendar.weekdayPadding = style.fullCalendar.weekdayPadding * scaleFactor;
        }
        if (style.fullCalendar.title) {
            scaled.fullCalendar.title = {
                ...style.fullCalendar.title,
                fontSize: typeof style.fullCalendar.title.fontSize === 'number' ? Math.max(1, style.fullCalendar.title.fontSize * scaleFactor) : style.fullCalendar.title.fontSize,
                letterSpacing: typeof style.fullCalendar.title.letterSpacing === 'number' ? style.fullCalendar.title.letterSpacing * scaleFactor : style.fullCalendar.title.letterSpacing,
            };
        }
        if (style.fullCalendar.weekDays) {
            scaled.fullCalendar.weekDays = {
                ...style.fullCalendar.weekDays,
                fontSize: typeof style.fullCalendar.weekDays.fontSize === 'number' ? Math.max(1, style.fullCalendar.weekDays.fontSize * scaleFactor) : style.fullCalendar.weekDays.fontSize,
                letterSpacing: typeof style.fullCalendar.weekDays.letterSpacing === 'number' ? style.fullCalendar.weekDays.letterSpacing * scaleFactor : style.fullCalendar.weekDays.letterSpacing,
                cellPadding: typeof style.fullCalendar.weekDays.cellPadding === 'number' ? style.fullCalendar.weekDays.cellPadding * scaleFactor : style.fullCalendar.weekDays.cellPadding,
            };
        }
        if (style.fullCalendar.days) {
            scaled.fullCalendar.days = {
                ...style.fullCalendar.days,
                fontSize: typeof style.fullCalendar.days.fontSize === 'number' ? Math.max(1, style.fullCalendar.days.fontSize * scaleFactor) : style.fullCalendar.days.fontSize,
                letterSpacing: typeof style.fullCalendar.days.letterSpacing === 'number' ? style.fullCalendar.days.letterSpacing * scaleFactor : style.fullCalendar.days.letterSpacing,
            };
        }
        if (style.fullCalendar.specialDays?.style) {
            scaled.fullCalendar.specialDays = {
                ...style.fullCalendar.specialDays,
                style: {
                    ...style.fullCalendar.specialDays.style,
                    fontSize: typeof style.fullCalendar.specialDays.style.fontSize === 'number' ? Math.max(1, style.fullCalendar.specialDays.style.fontSize * scaleFactor) : style.fullCalendar.specialDays.style.fontSize,
                    letterSpacing: typeof style.fullCalendar.specialDays.style.letterSpacing === 'number' ? style.fullCalendar.specialDays.style.letterSpacing * scaleFactor : style.fullCalendar.specialDays.style.letterSpacing,
                }
            };
        }
    }
    
    return scaled;
};

const areEqual = (prevProps: any, nextProps: any) => {
  if (prevProps.isEditor !== nextProps.isEditor) return false;
  if (prevProps.isSelected !== nextProps.isSelected) return false;
  if (prevProps.pageWidth !== nextProps.pageWidth) return false;
  if (prevProps.pageHeight !== nextProps.pageHeight) return false;
  if (prevProps.quote !== nextProps.quote) return false;
  if (prevProps.verse !== nextProps.verse) return false;
  if (prevProps.dayData?.dayOfMonth !== nextProps.dayData?.dayOfMonth) return false;
  if (prevProps.dayData?.month !== nextProps.dayData?.month) return false;
  
  if (prevProps.weekDays !== nextProps.weekDays) {
    if (!prevProps.weekDays || !nextProps.weekDays) return false;
    if (prevProps.weekDays.length !== nextProps.weekDays.length) return false;
    for (let i = 0; i < prevProps.weekDays.length; i++) {
      if (prevProps.weekDays[i]?.dayOfMonth !== nextProps.weekDays[i]?.dayOfMonth) return false;
      if (prevProps.weekDays[i]?.month !== nextProps.weekDays[i]?.month) return false;
    }
  }

  if (prevProps.activeTableCell?.elementId !== nextProps.activeTableCell?.elementId) return false;
  if (prevProps.activeTableCell?.r !== nextProps.activeTableCell?.r) return false;
  if (prevProps.activeTableCell?.c !== nextProps.activeTableCell?.c) return false;

  const el1 = prevProps.element;
  const el2 = nextProps.element;

  if (!el1 || !el2) return el1 === el2;
  if (el1.id !== el2.id) return false;
  if (el1.type !== el2.type) return false;
  if (el1.x !== el2.x) return false;
  if (el1.y !== el2.y) return false;
  if (el1.w !== el2.w) return false;
  if (el1.h !== el2.h) return false;
  if (el1.zIndex !== el2.zIndex) return false;
  if (el1.content !== el2.content) return false;

  // Compare styles using standard deep stringification
  if (el1.style !== el2.style) {
    if (JSON.stringify(el1.style) !== JSON.stringify(el2.style)) return false;
  }
  
  if (prevProps.globalCalendarStyle !== nextProps.globalCalendarStyle) {
    if (JSON.stringify(prevProps.globalCalendarStyle) !== JSON.stringify(nextProps.globalCalendarStyle)) return false;
  }

  return true;
};

export const ElementRenderer: React.FC<ElementRendererProps & { pageHeight: number; pageWidth: number }> = memo((props) => {
  const { element, pageHeight, pageWidth } = props;
  const scaleFactor = pageWidth / 400;

  const scaledElement = {
      ...element,
      style: scaleStyle(element.style, scaleFactor)
  };

  const scaledGlobalCalendarStyle = props.globalCalendarStyle 
      ? scaleStyle({ fullCalendar: props.globalCalendarStyle }, scaleFactor).fullCalendar 
      : undefined;

  const scaledProps = {
      ...props,
      element: scaledElement,
      style: scaledElement.style,
      globalCalendarStyle: scaledGlobalCalendarStyle
  };

  // Simple dispatch logic based on element type
  if (['table'].includes(element.type)) {
      return <TableElement {...scaledProps} activeTableCell={props.activeTableCell} style={scaledElement.style} pageHeight={pageHeight} pageWidth={pageWidth} />;
  }

  if (['mini_calendar', 'full_calendar'].includes(element.type)) {
      return <CalendarElement {...scaledProps} week={props.weekDays} style={scaledElement.style} pageHeight={pageHeight} pageWidth={pageWidth} calendarIndex={props.calendarIndex} />;
  }

  if (['box', 'circle', 'lines', 'vector_shape'].includes(element.type)) {
      return <ShapeElement {...scaledProps} week={props.weekDays} style={scaledElement.style} pageHeight={pageHeight} pageWidth={pageWidth} />;
  }

  if (['text', 'quote', 'holiday_list', 'verse'].includes(element.type)) {
      return <TextElement {...scaledProps} week={props.weekDays} style={scaledElement.style} pageHeight={pageHeight} pageWidth={pageWidth} />;
  }

  if (['day_number', 'month_name', 'month_number', 'day_name', 'year', 'date_placeholder', 'holiday', 'moon'].includes(element.type)) {
      const dayIndex = scaledElement.style.dayIndex;
      let targetDay: DayData | undefined;
      
      if (dayIndex !== undefined && props.weekDays && props.weekDays.length > 0) {
          // Se for layout semanal (7 dias), buscar pelo dia da semana (0-6)
          // Se for outros layouts, usar como índice direto no array de dias da página
          const isWeekly = props.weekDays.length === 7 && props.weekDays.some(d => d.dayOfWeek !== 0); 
          
          if (isWeekly && dayIndex >= 0 && dayIndex <= 6) {
              targetDay = props.weekDays.find(d => d.dayOfWeek === dayIndex);
          } else {
              targetDay = props.weekDays[dayIndex];
          }

          if (!targetDay && props.dayData && dayIndex > 0) {
              targetDay = getShiftedDayData(props.dayData, dayIndex, props.municipalHolidays);
          } else if (!targetDay) {
              targetDay = { dayOfMonth: 0, month: -1, dayOfWeek: dayIndex, year: 0, date: new Date(0) };
          }
      } else if (dayIndex !== undefined && dayIndex > 0 && props.dayData) {
          targetDay = getShiftedDayData(props.dayData, dayIndex, props.municipalHolidays);
      } else {
          targetDay = props.dayData;
      }
      
      if (element.type === 'holiday') {
          return <TextElement {...scaledProps} dayData={targetDay || props.dayData} week={props.weekDays} style={scaledElement.style} pageHeight={pageHeight} pageWidth={pageWidth} />;
      }
      
      if (element.type === 'moon') {
          return <GraphicsElement {...scaledProps} dayData={targetDay || props.dayData} week={props.weekDays} style={scaledElement.style} pageHeight={pageHeight} pageWidth={pageWidth} />;
      }
      
      return <PlaceholderElement {...scaledProps} dayData={targetDay || props.dayData} week={props.weekDays} style={scaledElement.style} pageHeight={pageHeight} pageWidth={pageWidth} />;
  }

  if (['habit_tracker', 'note_grid'].includes(element.type)) {
      return <GraphicsElement {...scaledProps} week={props.weekDays} style={scaledElement.style} pageHeight={pageHeight} pageWidth={pageWidth} />;
  }

  if (element.type === 'image') {
      return <ImageElement {...scaledProps} style={scaledElement.style} element={scaledElement} pageHeight={pageHeight} pageWidth={pageWidth} />;
  }

  if (element.type === 'icon') {
      return <IconElement {...scaledProps} style={scaledElement.style} pageHeight={pageHeight} pageWidth={pageWidth} />;
  }

  if (element.type === 'permanent_day_header') {
      return <PermanentDayHeader {...scaledProps} week={props.weekDays} style={scaledElement.style} pageHeight={pageHeight} pageWidth={pageWidth} />;
  }

  if (element.type === 'planner_day_box') {
      const dayIndex = scaledElement.style.plannerDayBox?.dayIndex ?? 0;
      let targetDay: DayData | undefined;

      if (props.weekDays) {
          targetDay = props.weekDays.find(d => d.dayOfWeek === dayIndex);
          if (!targetDay) {
              // Day not in this week
              targetDay = { dayOfMonth: 0, month: -1, dayOfWeek: dayIndex, year: 0, date: new Date(0) };
          }
      } else {
          targetDay = props.dayData;
      }
      return <PlannerDayBox element={scaledElement} dayData={targetDay || props.dayData} isEditor={props.isEditor} pageHeight={pageHeight} pageWidth={pageWidth} />;
  }

  return null;
}, areEqual);
