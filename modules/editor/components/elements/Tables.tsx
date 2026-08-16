import React, { useRef, memo } from 'react';
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

const TableCell = memo(({ r, c, content, isEditor, isHeaderCell, isLastCol, style, elementId, onTableCellChange, onTableCellFocus, onTableResizeStart, isActive }: any) => {
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const textTransform = style.textTransform;
    const isSentenceOrCapitalize = textTransform === 'sentence' || textTransform === 'capitalize';
    const cssTransform = isSentenceOrCapitalize ? 'none' : textTransform;
    const transformedContent = isSentenceOrCapitalize ? applyTextTransform(content, textTransform) : content;

    const lineCount = Math.max(1, (content || '').split('\n').length);

    const va = style.verticalAlign || 'top';
    let verticalPadding: React.CSSProperties = { paddingTop: '2px', paddingBottom: '2px' };
    if (va === 'top') {
        verticalPadding = { paddingTop: '1px', paddingBottom: '3px' };
    } else if (va === 'bottom') {
        verticalPadding = { paddingTop: '3px', paddingBottom: '1px' };
    } else if (va === 'middle' || va === 'center') {
        verticalPadding = { paddingTop: '2px', paddingBottom: '2px' };
    }

    return (
        <div 
            className={`relative flex-shrink-0 transition-all ${isActive && isEditor ? 'ring-1 ring-inset ring-indigo-500 bg-indigo-50/20' : ''}`} 
            style={{...style, textTransform: cssTransform}} 
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
                    rows={lineCount}
                    onChange={(e) => onTableCellChange && onTableCellChange(elementId, r, c, e.target.value)} 
                    onFocus={() => onTableCellFocus && onTableCellFocus(elementId, r, c)} 
                    className="w-full bg-transparent border-none resize-none focus:ring-1 focus:ring-indigo-300 focus:bg-white/50 leading-tight block outline-none" 
                    style={{ 
                        fontFamily: 'inherit', 
                        fontSize: 'inherit', 
                        fontWeight: 'inherit', 
                        color: 'inherit', 
                        textAlign: style.textAlign || 'inherit', 
                        maxHeight: '100%', 
                        overflow: 'hidden',
                        paddingLeft: '6px',
                        paddingRight: '6px',
                        ...verticalPadding
                    }} 
                />
            ) : (
                <div 
                    className="w-full whitespace-pre-wrap leading-tight" 
                    style={{ 
                        textAlign: style.textAlign || 'inherit',
                        paddingLeft: '6px',
                        paddingRight: '6px',
                        ...verticalPadding
                    }}
                >
                    {transformedContent}
                </div>
            )}
            {isEditor && !isLastCol && (
                <div 
                    className="absolute top-0 right-[-3px] h-full w-[6px] cursor-col-resize hover:bg-indigo-400 opacity-0 hover:opacity-50 z-20 transition-opacity" 
                    onMouseDown={(e) => onTableResizeStart && onTableResizeStart(e, elementId, c)} 
                />
            )}
        </div>
    );
});

export const TableElement: React.FC<TableElementProps> = ({ element, isEditor, style, onTableResizeStart, onTableRowResizeStart, onTableCellChange, onTableCellFocus, activeTableCell, pageHeight, pageWidth }) => {
    const rows = style.table?.rows || 10;
    const columns = style.table?.cols || 2;
    const hasHeader = style.table?.headerRow;
    const columnWidths = style.table?.columnWidths || Array(columns).fill(100 / columns);
    const rowHeights = style.table?.rowHeights || Array(rows).fill(100 / rows);
    
    const globalTextStyle = {
        fontFamily: style.table?.textStyle?.fontFamily || style.fontFamily || 'Inter',
        fontSize: style.table?.textStyle?.fontSize || style.fontSize || 10,
        fontWeight: style.table?.textStyle?.fontWeight || style.fontWeight || 'normal',
        color: style.table?.textStyle?.color || style.color || '#666',
        textAlign: style.table?.textStyle?.textAlign || style.textAlign || 'left',
        verticalAlign: style.table?.textStyle?.verticalAlign || style.verticalAlign || 'top',
        textTransform: style.table?.textStyle?.textTransform || style.textTransform || 'none',
        letterSpacing: style.table?.textStyle?.letterSpacing !== undefined ? style.table?.textStyle?.letterSpacing : (style.letterSpacing || 0),
        backgroundColor: style.table?.textStyle?.backgroundColor || style.backgroundColor || 'transparent'
    };

    const rowStyles = style.table?.rowStyles || {};
    const colStyles = style.table?.colStyles || {};
    const cellStyles = style.table?.cellStyles || {};
    const borders = style.table?.borders || { top: true, bottom: true, left: true, right: true, insideHorizontal: true, insideVertical: true, headerSeparator: true };
    const borderColor = style.table?.borderColor || '#000';
    const borderWidth = style.table?.borderWidth ?? 1;
    const bStyle = style.table?.borderStyle || 'solid';
    const borderStyle = `${borderWidth}px ${bStyle} ${borderColor}`;
    const noBorder2 = 'none';
    
    const borderRadius = style.table?.borderRadius || 0;
    const zebraRows = style.table?.zebraRows;
    const zebraColor = style.table?.zebraColor || '#f9fafb';
    const dashArray = bStyle === 'dashed' ? '4,4' : (bStyle === 'dotted' ? `${Math.max(1, borderWidth)},${Math.max(2, borderWidth * 2)}` : 'none');

    // Calculate cumulative row positions for horizontal grid lines
    const horizontalDividers: { y: number; isHeaderSep: boolean }[] = [];
    let cumY = 0;
    for (let r = 0; r < rows - 1; r++) {
        const rH = (rowHeights && rowHeights[r] !== undefined) ? rowHeights[r] : (100 / rows);
        cumY += rH;
        const isHeaderSep = hasHeader && r === 0;
        const shouldShow = isHeaderSep ? (borders.headerSeparator || borders.insideHorizontal) : borders.insideHorizontal;
        if (shouldShow) {
            horizontalDividers.push({ y: cumY, isHeaderSep });
        }
    }

    // Calculate cumulative col positions for vertical grid lines
    const verticalDividers: number[] = [];
    let cumX = 0;
    for (let c = 0; c < columns - 1; c++) {
        cumX += columnWidths[c];
        if (borders.insideVertical) {
            verticalDividers.push(cumX);
        }
    }

    const allOuterBorders = borders.top && borders.bottom && borders.left && borders.right;
    
    return (
        <div className="w-full h-full flex flex-col relative" style={{ overflow: 'hidden', borderRadius: `${borderRadius}px` }}>
            {/* High-precision SVG Grid Overlay for true subpixel border width sensitivity */}
            {borderWidth > 0 && (
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible">
                    {/* Horizontal Dividers */}
                    {horizontalDividers.map((div, idx) => (
                        <line 
                            key={`h-div-${idx}`} 
                            x1="0%" 
                            y1={`${div.y}%`} 
                            x2="100%" 
                            y2={`${div.y}%`} 
                            stroke={borderColor} 
                            strokeWidth={borderWidth} 
                            strokeDasharray={dashArray} 
                            vectorEffect="non-scaling-stroke" 
                        />
                    ))}

                    {/* Vertical Dividers */}
                    {verticalDividers.map((x, idx) => (
                        <line 
                            key={`v-div-${idx}`} 
                            x1={`${x}%`} 
                            y1="0%" 
                            x2={`${x}%`} 
                            y2="100%" 
                            stroke={borderColor} 
                            strokeWidth={borderWidth} 
                            strokeDasharray={dashArray} 
                            vectorEffect="non-scaling-stroke" 
                        />
                    ))}

                    {/* Outer Borders */}
                    {borderRadius > 0 && allOuterBorders ? (
                        <rect 
                            x="0" 
                            y="0" 
                            width="100%" 
                            height="100%" 
                            rx={borderRadius} 
                            ry={borderRadius} 
                            fill="none" 
                            stroke={borderColor} 
                            strokeWidth={borderWidth} 
                            strokeDasharray={dashArray} 
                            vectorEffect="non-scaling-stroke" 
                        />
                    ) : (
                        <>
                            {borders.top && (
                                <line x1="0%" y1="0%" x2="100%" y2="0%" stroke={borderColor} strokeWidth={borderWidth} strokeDasharray={dashArray} vectorEffect="non-scaling-stroke" />
                            )}
                            {borders.bottom && (
                                <line x1="0%" y1="100%" x2="100%" y2="100%" stroke={borderColor} strokeWidth={borderWidth} strokeDasharray={dashArray} vectorEffect="non-scaling-stroke" />
                            )}
                            {borders.left && (
                                <line x1="0%" y1="0%" x2="0%" y2="100%" stroke={borderColor} strokeWidth={borderWidth} strokeDasharray={dashArray} vectorEffect="non-scaling-stroke" />
                            )}
                            {borders.right && (
                                <line x1="100%" y1="0%" x2="100%" y2="100%" stroke={borderColor} strokeWidth={borderWidth} strokeDasharray={dashArray} vectorEffect="non-scaling-stroke" />
                            )}
                        </>
                    )}
                </svg>
            )}

            {Array(rows).fill(0).map((_, r) => {
                const isLastRow = r === rows - 1;
                const rowHPercent = (rowHeights && rowHeights[r] !== undefined) ? rowHeights[r] : (100 / rows);
                const rowHeightStyle = `${rowHPercent}%`;
                
                return (
                    <div 
                        key={r} 
                        className="flex w-full relative shrink-0" 
                        style={{ height: rowHeightStyle, minHeight: 0, overflow: 'hidden' }}
                    >
                        {Array(columns).fill(0).map((_, c) => {
                            const isLastCol = c === columns - 1;
                            const cellKey = `${r}-${c}`;
                            const content = style.table?.cellContent?.[cellKey] || '';
                            const isHeaderCell = hasHeader && r === 0;
                            const tStyle = { ...globalTextStyle, ...(rowStyles[r] || {}), ...(colStyles[c] || {}), ...(cellStyles[cellKey] || {}) };
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
                                color: tStyle.color, 
                                textAlign: tStyle.textAlign as any, 
                                verticalAlign: va as any,
                                textTransform: tStyle.textTransform as any, 
                                letterSpacing: `${tStyle.letterSpacing}px`,
                                overflow: 'hidden'
                            };
                            const isActive = activeTableCell?.elementId === element.id && activeTableCell?.r === r && activeTableCell?.c === c;
                            return <TableCell key={c} r={r} c={c} elementId={element.id} content={content} isEditor={isEditor} isHeaderCell={isHeaderCell} isLastCol={isLastCol} style={cellStyle} isActive={isActive} onTableCellChange={onTableCellChange} onTableCellFocus={onTableCellFocus} onTableResizeStart={onTableResizeStart} />;
                        })}
                        {isEditor && !isLastRow && (
                            <div 
                                className="absolute bottom-[-3px] left-0 w-full h-[6px] cursor-row-resize hover:bg-indigo-400 opacity-0 hover:opacity-100 z-20 transition-opacity" 
                                onMouseDown={(e) => onTableRowResizeStart && onTableRowResizeStart(e, element.id, r)} 
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
};
