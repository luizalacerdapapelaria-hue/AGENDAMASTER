import React, { useRef, useLayoutEffect, useEffect, memo } from 'react';
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

const TableCell = memo(({ r, c, content, isEditor, isHeaderCell, style, elementId, onTableCellChange, onTableCellFocus, isActive }: any) => {
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const textTransform = style.textTransform;
    const isSentenceOrCapitalize = textTransform === 'sentence' || textTransform === 'capitalize';
    const cssTransform = isSentenceOrCapitalize ? 'none' : textTransform;
    const transformedContent = isSentenceOrCapitalize ? applyTextTransform(content, textTransform) : content;

    const textWrap = style.textWrap || 'wrap'; // 'wrap' | 'nowrap' | 'clip' | 'ellipsis'
    const va = style.verticalAlign || 'top';

    // Word Wrap / Overflow Formatting Rules (Word Style)
    let wrapClasses = 'whitespace-pre-wrap break-words overflow-hidden';
    let wrapInlineStyles: React.CSSProperties = {
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        overflowWrap: 'break-word',
        textOverflow: 'clip',
        overflow: 'hidden'
    };

    if (textWrap === 'nowrap' || textWrap === 'clip') {
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

    // Auto-adjust textarea height to ensure multi-line wrapped text is always completely visible
    const adjustTextareaHeight = () => {
        const textarea = inputRef.current;
        if (!textarea) return;
        if (textWrap === 'nowrap' || textWrap === 'clip' || textWrap === 'ellipsis') {
            textarea.style.height = '100%';
            return;
        }
        if (va === 'top') {
            // For top aligned cells, height 100% fills all available cell height so multiple lines show smoothly
            textarea.style.height = '100%';
        } else {
            // For middle/bottom aligned cells, adjust to scrollHeight so parent flexbox centers or bottom-aligns cleanly
            textarea.style.height = 'auto';
            textarea.style.height = `${textarea.scrollHeight}px`;
        }
    };

    useLayoutEffect(() => {
        adjustTextareaHeight();
    }, [content, style.fontSize, style.lineHeight, style.width, style.padding, textWrap, va]);

    useEffect(() => {
        const textarea = inputRef.current;
        if (!textarea) return;

        // ResizeObserver adjusts textarea whenever the column width is dragged/resized
        const observer = new ResizeObserver(() => {
            adjustTextareaHeight();
        });
        observer.observe(textarea);
        if (containerRef.current) {
            observer.observe(containerRef.current);
        }
        return () => observer.disconnect();
    }, [va, textWrap]);

    return (
        <div 
            ref={containerRef}
            className={`relative flex-shrink-0 transition-all ${isActive && isEditor ? 'ring-1 ring-inset ring-indigo-500 bg-indigo-50/20' : ''}`} 
            style={{ 
                ...style, 
                textTransform: cssTransform,
                boxSizing: 'border-box'
            }} 
            onClick={() => {
                if (isEditor) {
                    onTableCellFocus && onTableCellFocus(elementId, r, c);
                    inputRef.current?.focus();
                }
            }}
        >
            {isEditor ? (
                <textarea 
                    ref={inputRef} 
                    value={content} 
                    onChange={(e) => {
                        onTableCellChange && onTableCellChange(elementId, r, c, e.target.value);
                        adjustTextareaHeight();
                    }} 
                    onFocus={() => onTableCellFocus && onTableCellFocus(elementId, r, c)} 
                    className={`w-full bg-transparent border-none resize-none focus:ring-1 focus:ring-indigo-300 focus:bg-white/50 block outline-none ${wrapClasses}`} 
                    style={{ 
                        fontFamily: 'inherit', 
                        fontSize: 'inherit', 
                        fontWeight: 'inherit', 
                        fontStyle: style.fontStyle || 'normal',
                        lineHeight: style.lineHeight || 1.25,
                        color: 'inherit', 
                        textAlign: style.textAlign || 'inherit', 
                        width: '100%',
                        height: '100%',
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
                    className={`w-full ${wrapClasses}`} 
                    style={{ 
                        fontFamily: 'inherit',
                        fontSize: 'inherit',
                        fontWeight: 'inherit',
                        fontStyle: style.fontStyle || 'normal',
                        lineHeight: style.lineHeight || 1.25,
                        color: 'inherit',
                        textAlign: style.textAlign || 'inherit',
                        padding: 0,
                        margin: 0,
                        boxSizing: 'border-box',
                        ...wrapInlineStyles
                    }}
                >
                    {transformedContent}
                </div>
            )}
        </div>
    );
});

export const TableElement: React.FC<TableElementProps> = ({ element, isEditor, style, onTableResizeStart, onTableRowResizeStart, onTableCellChange, onTableCellFocus, activeTableCell }) => {
    const rows = style.table?.rows || 10;
    const columns = style.table?.cols || 2;
    const hasHeader = style.table?.headerRow;
    const columnWidths = style.table?.columnWidths || Array(columns).fill(100 / columns);
    const rowHeights = style.table?.rowHeights || Array(rows).fill(100 / rows);
    
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
                            vectorEffect="non-scaling-stroke"
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
                                vectorEffect="non-scaling-stroke"
                            />
                        );
                    })}
                </svg>
            )}

            {/* Table Content Grid */}
            {Array(rows).fill(0).map((_, r) => {
                const rowHPercent = (rowHeights && rowHeights[r] !== undefined) ? rowHeights[r] : (100 / rows);
                const rowHeightStyle = `${rowHPercent}%`;
                
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
                            const cellCustomStyle = cellStyles[cellKey] || cellStyles[cellKeyAlt] || {};
                            const tStyle = { ...globalTextStyle, ...(rowStyles[r] || {}), ...(colStyles[c] || {}), ...cellCustomStyle };
                            const va = (tStyle.verticalAlign as string) || 'top';
                            
                            let justifyContent = 'flex-start';
                            if (va === 'middle' || va === 'center') justifyContent = 'center';
                            if (va === 'bottom') justifyContent = 'flex-end';
                            
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

                            const cellPadding = tStyle.cellPadding !== undefined ? tStyle.cellPadding : 4;

                            const cellStyle: React.CSSProperties = { 
                                width: `${columnWidths[c]}%`, 
                                height: '100%', 
                                backgroundColor: cellBg, 
                                display: 'flex', 
                                flexDirection: 'column', 
                                justifyContent: justifyContent, 
                                alignItems: 'stretch', 
                                fontFamily: tStyle.fontFamily, 
                                fontSize: tStyle.fontSize, 
                                fontWeight: tStyle.fontWeight, 
                                fontStyle: tStyle.fontStyle || 'normal',
                                lineHeight: tStyle.lineHeight || 1.25,
                                color: tStyle.color, 
                                textAlign: tStyle.textAlign as any, 
                                verticalAlign: va as any, 
                                textTransform: tStyle.textTransform as any, 
                                letterSpacing: `${tStyle.letterSpacing}px`,
                                textWrap: tStyle.textWrap as any,
                                padding: `${cellPadding}px`,
                                boxSizing: 'border-box',
                                overflow: 'hidden'
                            };

                            const isActive = activeTableCell?.elementId === element.id && activeTableCell?.r === r && activeTableCell?.c === c;

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
