import React, { useRef, useLayoutEffect, useEffect, useState, useCallback, memo } from 'react';
import { TableElementProps } from './types';
import { getTextStrokeCss } from '../../../../core/logic/textStroke';

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

const TableCell = memo(({ r, c, content, isEditor, isHeaderCell, style, textStrokeStyle, elementId, onTableCellChange, onTableCellFocus, isActive, isCompactSingleLine }: any) => {
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
                        ...wrapInlineStyles,
                        ...(textStrokeStyle || {}),
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
                        ...wrapInlineStyles,
                        ...(textStrokeStyle || {}),
                    }}
                >
                    {transformedContent || '\u00A0'}
                </div>
            )}
        </div>
    );
});

export const TableElement: React.FC<TableElementProps> = ({ element, isEditor, style, pageHeight, pageWidth, onTableResizeStart, onTableRowResizeStart, onTableCellChange, onTableCellFocus, activeTableCell }) => {
    const tableContainerRef = useRef<HTMLDivElement>(null);
    const [measuredSize, setMeasuredSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

    useLayoutEffect(() => {
        const el = tableContainerRef.current;
        if (!el) return;
        const updateSize = () => {
            const w = el.clientWidth;
            const h = el.clientHeight;
            if (w > 0 && h > 0) {
                setMeasuredSize(prev => (prev.width === w && prev.height === h ? prev : { width: w, height: h }));
            }
        };
        updateSize();
        const observer = new ResizeObserver(updateSize);
        observer.observe(el);
        return () => observer.disconnect();
    }, [element.w, element.h, pageWidth, pageHeight, style.table?.rows, style.table?.cols]);

    const rows = style.table?.rows || 10;
    const columns = style.table?.cols || 2;
    const hasHeader = style.table?.headerRow;
    const columnWidths = style.table?.columnWidths || Array(columns).fill(100 / columns);
    const rowHeights = style.table?.rowHeights || Array(rows).fill(100 / rows);
    const estimatedTableHeightPx = Math.round(((element.h || 50) / 100) * (pageHeight || 567));
    const estimatedTableWidthPx = Math.round(((element.w || 50) / 100) * (pageWidth || 400));
    const effectiveTableHeightPx = measuredSize.height > 0 ? measuredSize.height : estimatedTableHeightPx;
    const effectiveTableWidthPx = measuredSize.width > 0 ? measuredSize.width : estimatedTableWidthPx;
    
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
        cellPadding: style.table?.textStyle?.cellPadding !== undefined ? style.table?.textStyle?.cellPadding : 4,
        textStrokeWidth: style.table?.textStyle?.textStrokeWidth !== undefined ? style.table.textStyle.textStrokeWidth : (style.textStrokeWidth || 0),
        textStrokeColor: style.table?.textStyle?.textStrokeColor || style.textStrokeColor || '#000000',
        textFillTransparent: style.table?.textStyle?.textFillTransparent !== undefined ? style.table.textStyle.textFillTransparent : Boolean(style.textFillTransparent),
        textStrokeJoin: style.table?.textStyle?.textStrokeJoin || style.textStrokeJoin || 'miter',
    };

    const rowStyles = style.table?.rowStyles || {};
    const colStyles = style.table?.colStyles || {};
    const cellStyles = style.table?.cellStyles || {};

    const zebraRows = style.table?.zebraRows ?? Boolean((style.table as any)?.alternateRowColor);
    const zebraColor = style.table?.zebraColor || (style.table as any)?.alternateRowColor || '#f9fafb';
    const headerBgColor = (style.table as any)?.headerBackgroundColor || '#f3f4f6';
    const headerTxtColor = (style.table as any)?.headerTextColor;
    const borderColor = style.table?.borderColor || '#e5e7eb';
    const rawBorderWidth = Number(style.table?.borderWidth !== undefined ? style.table.borderWidth : (style.borderWidth !== undefined ? style.borderWidth : 1)) || 1;
    const rawOuterWidth = style.table?.outerBorderWidth !== undefined ? Number(style.table.outerBorderWidth) : rawBorderWidth;
    const rawInsideWidth = style.table?.insideBorderWidth !== undefined ? Number(style.table.insideBorderWidth) : rawBorderWidth;

    // Preserves exact user decimal strokes (e.g. 1.4px, 0.75px, 1.5px) without forced integer truncation
    const outerBorderWidth = Math.max(0, rawOuterWidth <= 0 ? 0 : Math.round(rawOuterWidth * 100) / 100);
    const insideBorderWidth = Math.max(0, rawInsideWidth <= 0 ? 0 : Math.round(rawInsideWidth * 100) / 100);
    const borderStyle = style.table?.borderStyle || 'solid';
    const borderRadius = style.table?.borderRadius || 0;
    const useContainerBorder = borderRadius > 0 || borderStyle !== 'solid';

    const borders = style.table?.borders || {
        top: true,
        bottom: true,
        left: true,
        right: true,
        insideHorizontal: true,
        insideVertical: true,
        headerSeparator: true
    };

    // Calculate cumulative positions for resizer handles
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

    const borderCssTop = borders.top && outerBorderWidth > 0 ? `${outerBorderWidth}px ${borderStyle} ${borderColor}` : undefined;
    const borderCssBottom = borders.bottom && outerBorderWidth > 0 ? `${outerBorderWidth}px ${borderStyle} ${borderColor}` : undefined;
    const borderCssLeft = borders.left && outerBorderWidth > 0 ? `${outerBorderWidth}px ${borderStyle} ${borderColor}` : undefined;
    const borderCssRight = borders.right && outerBorderWidth > 0 ? `${outerBorderWidth}px ${borderStyle} ${borderColor}` : undefined;

    // Pre-calculate exact integer pixel heights for each row honoring custom rowHeights
    const totalRowPct = Array.from({ length: rows }).reduce<number>((sum, _, r) => {
        const val = (rowHeights && rowHeights[r] !== undefined) ? Number(rowHeights[r]) : (100 / rows);
        return sum + (val > 0 ? val : 100 / rows);
    }, 0) || 100;
    let accRowPct = 0;
    let accumulatedRowPx = 0;
    const rowPixelHeights: number[] = Array(rows).fill(0).map((_, r) => {
        const pct = (rowHeights && rowHeights[r] !== undefined) ? Number(rowHeights[r]) : (100 / rows);
        accRowPct += (pct > 0 ? pct : 100 / rows);
        const targetCumulative = (r === rows - 1)
            ? Math.round(effectiveTableHeightPx)
            : Math.round((accRowPct / totalRowPct) * effectiveTableHeightPx);
        const h = Math.max(2, targetCumulative - accumulatedRowPx);
        accumulatedRowPx += h;
        return h;
    });

    // Pre-calculate exact integer pixel widths for each column honoring columnWidths
    const totalColPct = Array.from({ length: columns }).reduce<number>((sum, _, c) => {
        const val = (columnWidths && columnWidths[c] !== undefined) ? Number(columnWidths[c]) : (100 / columns);
        return sum + (val > 0 ? val : 100 / columns);
    }, 0) || 100;
    let accColPct = 0;
    let accumulatedColPx = 0;
    const colPixelWidths: number[] = Array(columns).fill(0).map((_, c) => {
        const pct = (columnWidths && columnWidths[c] !== undefined) ? Number(columnWidths[c]) : (100 / columns);
        accColPct += (pct > 0 ? pct : 100 / columns);
        const targetCumulative = (c === columns - 1)
            ? Math.round(effectiveTableWidthPx)
            : Math.round((accColPct / totalColPct) * effectiveTableWidthPx);
        const w = Math.max(2, targetCumulative - accumulatedColPx);
        accumulatedColPx += w;
        return w;
    });

    // Compute exact integer Y coordinates for horizontal dividers
    const horizontalDividers: { y: number; key: string }[] = [];
    let cumY = 0;
    for (let r = 0; r < rows - 1; r++) {
        cumY += rowPixelHeights[r];
        const isHeaderRow = hasHeader && r === 0;
        const shouldDraw = isHeaderRow ? Boolean(borders.headerSeparator) : Boolean(borders.insideHorizontal);
        if (shouldDraw && insideBorderWidth > 0) {
            horizontalDividers.push({ y: cumY, key: `h-${r}` });
        }
    }

    // Compute exact integer X coordinates for vertical dividers
    const verticalDividers: { x: number; key: string }[] = [];
    let cumX = 0;
    for (let c = 0; c < columns - 1; c++) {
        cumX += colPixelWidths[c];
        if (borders.insideVertical && insideBorderWidth > 0) {
            verticalDividers.push({ x: cumX, key: `v-${c}` });
        }
    }

    const isSolidBorder = borderStyle === 'solid';
    const outerSnapOffset = Math.ceil(outerBorderWidth);

    return (
        <div 
            ref={tableContainerRef}
            className="w-full h-full relative select-none"
            style={{
                borderRadius: borderRadius > 0 ? `${borderRadius}px` : undefined,
                borderTop: useContainerBorder ? borderCssTop : undefined,
                borderBottom: useContainerBorder ? borderCssBottom : undefined,
                borderLeft: useContainerBorder ? borderCssLeft : undefined,
                borderRight: useContainerBorder ? borderCssRight : undefined,
                boxSizing: 'border-box',
                overflow: 'hidden',
            }}
        >
            {/* Table Cells (Backgrounds + Content only; borders drawn uniformly in overlay) */}
            {Array(rows).fill(0).map((_, r) => {
                const rowHeightPx = rowPixelHeights[r];
                const useMeasuredCols = measuredSize.width > 0;
                
                return (
                    <div 
                        key={r} 
                        className="flex w-full relative shrink-0" 
                        style={{ height: `${rowHeightPx}px`, minHeight: 0, overflow: 'hidden' }}
                    >
                    {Array(columns).fill(0).map((_, c) => {
                        const cellKey = `${r}-${c}`;
                        const cellKeyAlt = `${r}_${c}`;
                        const content = style.table?.cellContent?.[cellKey] ?? style.table?.cellContent?.[cellKeyAlt] ?? (style.table as any)?.data?.[r]?.[c] ?? '';
                        const isHeaderCell = hasHeader && r === 0;
                        const headerFallbackStyle = isHeaderCell
                            ? {
                                fontWeight: 'bold',
                                verticalAlign: 'middle',
                                ...(headerTxtColor ? { color: headerTxtColor } : {})
                            }
                            : {};
                        const cellCustomStyle = filterDefined(cellStyles[cellKey] || cellStyles[cellKeyAlt] || {});
                        const tStyle = { ...globalTextStyle, ...headerFallbackStyle, ...filterDefined(rowStyles[r]), ...filterDefined(colStyles[c]), ...cellCustomStyle };
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
                        const effectiveFontSize = Math.min(rawFontSize, maxFittingFont);

                        const singleLineTextH = effectiveFontSize * effectiveLineHeight;
                        const availVertSpace = Math.max(0, rowHeightPx - singleLineTextH - 0.5);
                        const padY = Math.max(0, Math.min(rawPadding, Math.floor(availVertSpace / 2)));
                        const padX = isCompactRow && rowHeightPx < 14 ? Math.min(rawPadding, 2) : rawPadding;

                        const effectiveVa = (isCompactRow && va === 'top') ? 'middle' : va;
                        let justifyContent = 'flex-start';
                        if (effectiveVa === 'middle' || effectiveVa === 'center') justifyContent = 'center';
                        if (effectiveVa === 'bottom') justifyContent = 'flex-end';
                        
                        const customBg = tStyle.backgroundColor;
                        let defaultBg = 'transparent';
                        if (isHeaderCell) {
                            defaultBg = headerBgColor;
                        } else if (zebraRows) {
                            const dataRowIdx = hasHeader ? r - 1 : r;
                            if (dataRowIdx % 2 === 1) {
                                defaultBg = zebraColor;
                            }
                        }
                        const cellBg = (customBg && customBg !== 'transparent') ? customBg : defaultBg;

                        const cellStyle: React.CSSProperties = { 
                            width: useMeasuredCols ? `${colPixelWidths[c]}px` : `${columnWidths[c]}%`, 
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
                            overflow: 'hidden',
                            flexShrink: 0,
                        };

                        const cellTextStrokeCss = getTextStrokeCss(tStyle, tStyle.color || '#666666');
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
                                textStrokeStyle={cellTextStrokeCss}
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

            {/* Unified Pixel-Locked Borders Overlay — guarantees identical thickness across header & data rows */}
            <div className="absolute inset-0 pointer-events-none z-20">
                {!useContainerBorder && outerBorderWidth > 0 && (
                    <>
                        {borders.top && (
                            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: `${outerBorderWidth}px`, backgroundColor: borderColor }} />
                        )}
                        {borders.bottom && (
                            <div style={{ position: 'absolute', top: `${Math.max(0, Math.round(effectiveTableHeightPx) - outerSnapOffset)}px`, left: 0, right: 0, height: `${outerBorderWidth}px`, backgroundColor: borderColor }} />
                        )}
                        {borders.left && (
                            <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: `${outerBorderWidth}px`, backgroundColor: borderColor }} />
                        )}
                        {borders.right && (
                            <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${Math.max(0, Math.round(effectiveTableWidthPx) - outerSnapOffset)}px`, width: `${outerBorderWidth}px`, backgroundColor: borderColor }} />
                        )}
                    </>
                )}

                {horizontalDividers.map(d => (
                    <div
                        key={d.key}
                        style={isSolidBorder ? {
                            position: 'absolute',
                            top: `${d.y}px`,
                            left: 0,
                            right: 0,
                            height: `${insideBorderWidth}px`,
                            backgroundColor: borderColor,
                        } : {
                            position: 'absolute',
                            top: `${d.y}px`,
                            left: 0,
                            right: 0,
                            height: 0,
                            borderTop: `${insideBorderWidth}px ${borderStyle} ${borderColor}`,
                        }}
                    />
                ))}

                {verticalDividers.map(d => (
                    <div
                        key={d.key}
                        style={isSolidBorder ? {
                            position: 'absolute',
                            left: `${d.x}px`,
                            top: 0,
                            bottom: 0,
                            width: `${insideBorderWidth}px`,
                            backgroundColor: borderColor,
                        } : {
                            position: 'absolute',
                            left: `${d.x}px`,
                            top: 0,
                            bottom: 0,
                            width: 0,
                            borderLeft: `${insideBorderWidth}px ${borderStyle} ${borderColor}`,
                        }}
                    />
                ))}
            </div>

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
