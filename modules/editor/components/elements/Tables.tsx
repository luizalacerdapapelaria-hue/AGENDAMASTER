import React, { useRef, useLayoutEffect, useEffect, useState, useCallback, memo } from 'react';
import { TableElementProps } from './types';

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

const filterDefined = (obj: any) => {
    if (!obj || typeof obj !== 'object') return {};
    const res: any = {};
    Object.keys(obj).forEach(k => {
        if (obj[k] !== undefined && obj[k] !== null && obj[k] !== '') {
            res[k] = obj[k];
        }
    });
    return res;
};

const TableCell = memo(({ r, c, content, isEditor, isHeaderCell, style, elementId, onTableCellChange, onTableCellFocus, isActive, isCompactSingleLine }: any) => {
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [textareaHeight, setTextareaHeight] = useState<number | undefined>(undefined);
    const isEditing = Boolean(isEditor && isActive);

    const textTransform = style.textTransform;
    const isSentenceOrCapitalize = textTransform === 'sentence' || textTransform === 'capitalize';
    const cssTransform = isSentenceOrCapitalize ? 'none' : textTransform;
    const transformedContent = isSentenceOrCapitalize ? applyTextTransform(content, textTransform) : content;

    const textWrap = style.textWrap || 'wrap'; // 'wrap' | 'nowrap' | 'clip' | 'ellipsis'
    const va = style.verticalAlign || 'top';

    // Word Wrap / Overflow Formatting Rules (Word Style)
    let wrapClasses = 'whitespace-pre-wrap break-words overflow-hidden';
    let wrapInlineStyles: React.CSSProperties = {
        whiteSpace: isCompactSingleLine ? 'nowrap' : 'pre-wrap',
        wordBreak: isCompactSingleLine ? 'normal' : 'break-word',
        overflowWrap: isCompactSingleLine ? 'normal' : 'break-word',
        textOverflow: 'clip',
        overflow: 'hidden'
    };

    if (textWrap === 'nowrap' || textWrap === 'clip' || isCompactSingleLine) {
        wrapClasses = 'whitespace-nowrap overflow-hidden text-clip';
        wrapInlineStyles = {
            whiteSpace: 'nowrap',
            wordBreak: 'normal',
            overflowWrap: 'normal',
            textOverflow: 'clip',
            overflow: 'hidden'
        };
    } else if (textWrap === 'ellipsis') {
        wrapClasses = 'whitespace-nowrap overflow-hidden truncate';
        wrapInlineStyles = {
            whiteSpace: 'nowrap',
            wordBreak: 'normal',
            overflowWrap: 'normal',
            textOverflow: 'ellipsis',
            overflow: 'hidden'
        };
    }

    const adjustTextareaHeight = useCallback(() => {
        const textarea = inputRef.current;
        if (!textarea) return;
        if (va === 'top') {
            setTextareaHeight(undefined);
        } else {
            textarea.style.height = 'auto';
            const sh = textarea.scrollHeight;
            setTextareaHeight(sh > 0 ? sh : undefined);
        }
    }, [va]);

    useLayoutEffect(() => {
        if (isEditing) {
            adjustTextareaHeight();
            if (inputRef.current) {
                inputRef.current.focus();
                const len = inputRef.current.value.length;
                inputRef.current.setSelectionRange(len, len);
            }
        }
    }, [isEditing]);

    useLayoutEffect(() => {
        if (isEditing) {
            adjustTextareaHeight();
        }
    }, [isEditing, content, adjustTextareaHeight]);

    useEffect(() => {
        if (!isEditing) return;
        const textarea = inputRef.current;
        if (!textarea) return;

        const observer = new ResizeObserver(() => {
            adjustTextareaHeight();
        });
        observer.observe(textarea);
        if (containerRef.current) {
            observer.observe(containerRef.current);
        }
        return () => observer.disconnect();
    }, [isEditing, adjustTextareaHeight]);

    return (
        <div 
            ref={containerRef}
            className={`relative flex-shrink-0 transition-all ${isEditor ? 'cursor-pointer' : ''} ${isActive && isEditor ? 'ring-1 ring-inset ring-indigo-500 bg-indigo-50/20' : ''}`} 
            style={{ 
                ...style, 
                textTransform: cssTransform,
                boxSizing: 'border-box'
            }} 
            onClick={() => {
                if (isEditor) {
                    onTableCellFocus && onTableCellFocus(elementId, r, c);
                }
            }}
        >
            {isEditing ? (
                <textarea 
                    ref={inputRef} 
                    value={content} 
                    onChange={(e) => {
                        onTableCellChange && onTableCellChange(elementId, r, c, e.target.value);
                    }} 
                    onFocus={() => onTableCellFocus && onTableCellFocus(elementId, r, c)} 
                    className={`w-full bg-transparent border-none resize-none focus:ring-1 focus:ring-indigo-300 focus:bg-white/50 block outline-none ${wrapClasses}`} 
                    style={{ 
                        fontFamily: 'inherit', 
                        fontSize: 'inherit', 
                        fontWeight: 'inherit', 
                        fontStyle: style.fontStyle || 'normal',
                        lineHeight: style.lineHeight || 1.2,
                        color: 'inherit', 
                        textAlign: style.textAlign || 'inherit', 
                        width: '100%',
                        height: (va === 'middle' || va === 'center' || va === 'bottom') 
                            ? (textareaHeight ? `${textareaHeight}px` : 'auto') 
                            : '100%',
                        minHeight: 0,
                        maxHeight: '100%',
                        padding: 0,
                        margin: 0,
                        boxSizing: 'border-box',
                        ...wrapInlineStyles
                    }} 
                />
            ) : (
                <div 
                    className={`w-full select-none ${wrapClasses}`} 
                    style={{ 
                        fontFamily: 'inherit',
                        fontSize: 'inherit',
                        fontWeight: 'inherit',
                        fontStyle: style.fontStyle || 'normal',
                        lineHeight: style.lineHeight || 1.2,
                        color: 'inherit',
                        textAlign: style.textAlign || 'inherit',
                        padding: 0,
                        margin: 0,
                        boxSizing: 'border-box',
                        ...wrapInlineStyles
                    }}
                >
                    {transformedContent || '\u00A0'}
                </div>
            )}
        </div>
    );
});

export const TableElement: React.FC<TableElementProps> = ({ element, isEditor, style, pageHeight, onTableResizeStart, onTableRowResizeStart, onTableCellChange, onTableCellFocus, activeTableCell }) => {
    const tableContainerRef = useRef<HTMLDivElement>(null);
    const [measuredTableHeight, setMeasuredTableHeight] = useState<number>(0);

    useLayoutEffect(() => {
        const el = tableContainerRef.current;
        if (!el) return;
        const updateHeight = () => {
            const h = el.clientHeight;
            if (h > 0) setMeasuredTableHeight(h);
        };
        updateHeight();
        const observer = new ResizeObserver(updateHeight);
        observer.observe(el);
        return () => observer.disconnect();
    }, [element.h, pageHeight, style.table?.rows]);

    const rows = style.table?.rows || 10;
    const columns = style.table?.cols || 2;
    const hasHeader = style.table?.headerRow;
    const columnWidths = style.table?.columnWidths || Array(columns).fill(100 / columns);
    const rowHeights = style.table?.rowHeights || Array(rows).fill(100 / rows);
    const estimatedTableHeightPx = ((element.h || 50) / 100) * ((pageHeight || 567) * 0.85);
    const effectiveTableHeightPx = measuredTableHeight > 0 ? measuredTableHeight : estimatedTableHeightPx;
    
    const globalTextStyle = {
        fontFamily: style.table?.textStyle?.fontFamily || style.fontFamily || 'Inter',
        fontSize: style.table?.textStyle?.fontSize || style.fontSize || 10,
        fontWeight: style.table?.textStyle?.fontWeight || style.fontWeight || 'normal',
        fontStyle: style.table?.textStyle?.fontStyle || style.fontStyle || 'normal',
        lineHeight: style.table?.textStyle?.lineHeight || style.lineHeight || 1.2,
        color: style.table?.textStyle?.color || style.color || '#666',
        textAlign: style.table?.textStyle?.textAlign || style.textAlign || 'left',
        verticalAlign: style.table?.textStyle?.verticalAlign || style.verticalAlign || 'top',
        textTransform: style.table?.textStyle?.textTransform || style.textTransform || 'none',
        letterSpacing: style.table?.textStyle?.letterSpacing !== undefined ? style.table?.textStyle?.letterSpacing : (style.letterSpacing || 0),
        backgroundColor: style.table?.textStyle?.backgroundColor || style.backgroundColor || 'transparent',
        textWrap: style.table?.textStyle?.textWrap || 'wrap',
        textOrientation: style.table?.textStyle?.textOrientation || 'horizontal',
        cellPadding: style.table?.textStyle?.cellPadding !== undefined ? style.table?.textStyle?.cellPadding : 4
    };

    const rowStyles = style.table?.rowStyles || {};
    const colStyles = style.table?.colStyles || {};
    const cellStyles = style.table?.cellStyles || {};

    const zebraRows = style.table?.zebraRows;
    const zebraColor = style.table?.zebraColor || '#f9fafb';
    const borderColor = style.table?.borderColor || '#e5e7eb';
    const borderWidth = style.table?.borderWidth !== undefined ? style.table.borderWidth : (style.borderWidth !== undefined ? style.borderWidth : 1);
    const outerBorderWidth = style.table?.outerBorderWidth !== undefined ? style.table.outerBorderWidth : borderWidth;
    const insideBorderWidth = style.table?.insideBorderWidth !== undefined ? style.table.insideBorderWidth : borderWidth;
    const borderStyle = style.table?.borderStyle || 'solid';
    const borderRadius = style.table?.borderRadius || 0;

    const borders = style.table?.borders || {
        top: true,
        bottom: true,
        left: true,
        right: true,
        insideHorizontal: true,
        insideVertical: true,
        headerSeparator: true
    };

    const dashArray = borderStyle === 'dashed' ? '4 4' : borderStyle === 'dotted' ? '2 2' : 'none';

    // Calculate cumulative positions for dividers
    const colDividerPositions: number[] = [];
    let accX = 0;
    for (let c = 0; c < columns - 1; c++) {
        accX += (columnWidths[c] || (100 / columns));
        colDividerPositions.push(accX);
    }

    const rowDividerPositions: number[] = [];
    let accY = 0;
    for (let r = 0; r < rows - 1; r++) {
        accY += (rowHeights[r] !== undefined ? rowHeights[r] : (100 / rows));
        rowDividerPositions.push(accY);
    }

    const borderCssTop = borders.top && outerBorderWidth > 0 ? `${outerBorderWidth}px ${borderStyle} ${borderColor}` : 'none';
    const borderCssBottom = borders.bottom && outerBorderWidth > 0 ? `${outerBorderWidth}px ${borderStyle} ${borderColor}` : 'none';
    const borderCssLeft = borders.left && outerBorderWidth > 0 ? `${outerBorderWidth}px ${borderStyle} ${borderColor}` : 'none';
    const borderCssRight = borders.right && outerBorderWidth > 0 ? `${outerBorderWidth}px ${borderStyle} ${borderColor}` : 'none';

    return (
        <div 
            ref={tableContainerRef}
            className="w-full h-full relative select-none"
            style={{
                borderRadius: borderRadius > 0 ? `${borderRadius}px` : undefined,
                borderTop: borderCssTop,
                borderBottom: borderCssBottom,
                borderLeft: borderCssLeft,
                borderRight: borderCssRight,
                boxSizing: 'border-box',
                overflow: 'hidden',
            }}
        >
            {/* SVG Grid Borders Rendering (Internal Lines) */}
            {insideBorderWidth > 0 && (
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible">
                    {/* Internal Vertical Lines */}
                    {borders.insideVertical && colDividerPositions.map((posX, idx) => (
                        <line
                            key={`v-${idx}`}
                            x1={`${posX}%`}
                            y1="0%"
                            x2={`${posX}%`}
                            y2="100%"
                            stroke={borderColor}
                            strokeWidth={insideBorderWidth}
                            strokeDasharray={dashArray}
                        />
                    ))}

                    {/* Internal Horizontal Lines */}
                    {borders.insideHorizontal && rowDividerPositions.map((posY, idx) => {
                        const isHeaderSep = hasHeader && idx === 0;
                        if (isHeaderSep && !borders.headerSeparator) return null;
                        return (
                            <line
                                key={`h-${idx}`}
                                x1="0%"
                                y1={`${posY}%`}
                                x2="100%"
                                y2={`${posY}%`}
                                stroke={borderColor}
                                strokeWidth={insideBorderWidth}
                                strokeDasharray={dashArray}
                            />
                        );
                    })}
                </svg>
            )}

            {/* Table Content Grid */}
            {Array(rows).fill(0).map((_, r) => {
                const rowHPercent = (rowHeights && rowHeights[r] !== undefined) ? rowHeights[r] : (100 / rows);
                const rowHeightStyle = `${rowHPercent}%`;
                const rowHeightPx = Math.max(2, (rowHPercent / 100) * effectiveTableHeightPx);
                
                return (
                    <div 
                        key={r} 
                        className="flex w-full relative shrink-0" 
                        style={{ height: rowHeightStyle, minHeight: 0, overflow: 'hidden' }}
                    >
                        {Array(columns).fill(0).map((_, c) => {
                            const cellKey = `${r}-${c}`;
                            const cellKeyAlt = `${r}_${c}`;
                            const content = style.table?.cellContent?.[cellKey] ?? style.table?.cellContent?.[cellKeyAlt] ?? '';
                            const isHeaderCell = hasHeader && r === 0;
                            const cellCustomStyle = filterDefined(cellStyles[cellKey] || cellStyles[cellKeyAlt] || {});
                            const tStyle = { ...globalTextStyle, ...filterDefined(rowStyles[r]), ...filterDefined(colStyles[c]), ...cellCustomStyle };
                            const va = (tStyle.verticalAlign as string) || 'top';
                            
                            const rawFontSize = typeof tStyle.fontSize === 'number' ? tStyle.fontSize : (parseFloat(String(tStyle.fontSize)) || 10);
                            const rawPadding = tStyle.cellPadding !== undefined ? Number(tStyle.cellPadding) : 4;
                            const rawLineHeight = Number(tStyle.lineHeight) || 1.2;

                            // Detect compact rows (e.g. 30-min schedule with skipped lines = 45-46 rows)
                            const neededSingleLineH = (rawFontSize * rawLineHeight) + (rawPadding * 2);
                            const isCompactRow = rowHeightPx < neededSingleLineH + 2;

                            const effectiveLineHeight = isCompactRow
                                ? (rowHeightPx < rawFontSize * 1.25 ? 1.0 : Math.min(rawLineHeight, 1.1))
                                : rawLineHeight;
                            const maxFittingFont = Math.max(4.5, Math.floor((rowHeightPx - 1) * 0.82 * 2) / 2);
                            const effectiveFontSize = isCompactRow ? Math.min(rawFontSize, maxFittingFont) : rawFontSize;

                            const singleLineTextH = effectiveFontSize * effectiveLineHeight;
                            const availVertSpace = Math.max(0, rowHeightPx - singleLineTextH - 0.5);
                            const padY = isCompactRow ? Math.max(0, Math.min(rawPadding, Math.floor(availVertSpace / 2))) : rawPadding;
                            const padX = isCompactRow && rowHeightPx < 14 ? Math.min(rawPadding, 2) : rawPadding;

                            const effectiveVa = (isCompactRow && va === 'top') ? 'middle' : va;
                            let justifyContent = 'flex-start';
                            if (effectiveVa === 'middle' || effectiveVa === 'center') justifyContent = 'center';
                            if (effectiveVa === 'bottom') justifyContent = 'flex-end';
                            
                            const customBg = tStyle.backgroundColor;
                            let defaultBg = 'transparent';
                            if (isHeaderCell) {
                                defaultBg = '#f3f4f6';
                            } else if (zebraRows) {
                                const dataRowIdx = hasHeader ? r - 1 : r;
                                if (dataRowIdx % 2 === 1) {
                                    defaultBg = zebraColor;
                                }
                            }
                            const cellBg = (customBg && customBg !== 'transparent') ? customBg : defaultBg;

                            const cellStyle: React.CSSProperties = { 
                                width: `${columnWidths[c]}%`, 
                                height: '100%', 
                                backgroundColor: cellBg, 
                                display: 'flex', 
                                flexDirection: 'column', 
                                justifyContent: justifyContent, 
                                alignItems: 'stretch', 
                                fontFamily: tStyle.fontFamily, 
                                fontSize: `${effectiveFontSize}px`, 
                                fontWeight: tStyle.fontWeight, 
                                fontStyle: tStyle.fontStyle || 'normal',
                                lineHeight: effectiveLineHeight,
                                color: tStyle.color, 
                                textAlign: tStyle.textAlign as any, 
                                verticalAlign: effectiveVa as any, 
                                textTransform: tStyle.textTransform as any, 
                                letterSpacing: `${tStyle.letterSpacing}px`,
                                textWrap: tStyle.textWrap as any,
                                padding: `${padY}px ${padX}px`,
                                boxSizing: 'border-box',
                                overflow: 'hidden'
                            };

                            const isActive = activeTableCell?.elementId === element.id && activeTableCell?.r === r && activeTableCell?.c === c;
                            const isCompactSingleLine = isCompactRow && rowHeightPx < effectiveFontSize * 2.1 && !String(content).includes('\n');

                            return (
                                <TableCell 
                                    key={c} 
                                    r={r} 
                                    c={c} 
                                    elementId={element.id} 
                                    content={content} 
                                    isEditor={isEditor} 
                                    isHeaderCell={isHeaderCell} 
                                    style={cellStyle} 
                                    isActive={isActive} 
                                    isCompactSingleLine={isCompactSingleLine}
                                    onTableCellChange={onTableCellChange} 
                                    onTableCellFocus={onTableCellFocus} 
                                />
                            );
                        })}
                    </div>
                );
            })}

            {/* Interactive Grid Resizers Overlay (Draggable Borders for Columns and Rows) */}
            {isEditor && (
                <div className="absolute inset-0 pointer-events-none z-30 overflow-visible">
                    {/* Vertical Column Resizer Handles */}
                    {colDividerPositions.map((posX, c) => (
                        <div
                            key={`col-handle-${c}`}
                            className="group/col-handle absolute top-0 bottom-0 pointer-events-auto cursor-col-resize flex items-center justify-center -translate-x-1/2 select-none"
                            style={{
                                left: `${posX}%`,
                                width: '14px',
                                touchAction: 'none'
                            }}
                            onMouseDown={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                onTableResizeStart && onTableResizeStart(e, element.id, c);
                            }}
                            title={`Arraste para ajustar a largura das colunas`}
                        >
                            <div className="w-[3px] h-full bg-indigo-500 opacity-0 group-hover/col-handle:opacity-100 transition-opacity rounded-full shadow-sm" />
                        </div>
                    ))}

                    {/* Horizontal Row Resizer Handles */}
                    {rowDividerPositions.map((posY, r) => (
                        <div
                            key={`row-handle-${r}`}
                            className="group/row-handle absolute left-0 right-0 pointer-events-auto cursor-row-resize flex items-center justify-center -translate-y-1/2 select-none"
                            style={{
                                top: `${posY}%`,
                                height: '14px',
                                touchAction: 'none'
                            }}
                            onMouseDown={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                onTableRowResizeStart && onTableRowResizeStart(e, element.id, r);
                            }}
                            title={`Arraste para ajustar a altura da linha ${r + 1} e redistribuir proporcionalmente`}
                        >
                            <div className="h-[3px] w-full bg-indigo-500 opacity-0 group-hover/row-handle:opacity-100 transition-opacity rounded-full shadow-sm" />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
