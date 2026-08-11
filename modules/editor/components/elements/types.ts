
import React from 'react';
import { LayoutElement, DayData, Holiday } from '../../../../types';

export interface BaseElementProps {
  element: LayoutElement;
  dayData: DayData;
  isEditor: boolean;
  isSelected?: boolean;
  style: LayoutElement['style'];
  municipalHolidays?: Holiday[];
  pageHeight: number;
  pageWidth: number;
  week?: DayData[];
}

export interface EditableElementProps extends BaseElementProps {
    onContentChange?: (id: string, content: string) => void;
}

export interface TableElementProps extends BaseElementProps {
    onTableResizeStart?: (e: React.MouseEvent, elementId: string, colIndex: number) => void;
    onTableRowResizeStart?: (e: React.MouseEvent, elementId: string, rowIndex: number) => void;
    onTableCellChange?: (elementId: string, row: number, col: number, text: string) => void;
    onTableCellFocus?: (elementId: string, row: number, col: number) => void;
    activeTableCell?: { elementId: string; r: number; c: number } | null;
}

export interface CalendarElementProps extends BaseElementProps {
    globalCalendarStyle?: LayoutElement['style']['fullCalendar'];
    calendarIndex?: number;
}

export interface TextElementProps extends EditableElementProps {
    quote?: string;
    verse?: string;
}
