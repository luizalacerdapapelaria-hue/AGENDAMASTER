
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
                    onChange={(e) => onTableCellChange && onTableCellChange(elementId, r, c, e.target.value)} 
                    onFocus={() => onTableCellFocus && onTableCellFocus(elementId, r, c)} 
                    className="w-full bg-transparent border-none resize-none p-1 focus:ring-1 focus:ring-indigo-300 focus:bg-white/50 leading-tight block" 
                    style={{ fontFamily: 'inherit', fontSize: 'inherit', fontWeight: 'inherit', color: 'inherit', textAlign: 'inherit', height: '100%', overflow: 'hidden' }} 
                />
            ) : (<div className="w-full p-1 whitespace-pre-wrap leading-tight h-full">{transformedContent}</div>)}
            {isEditor && !isLastCol && (<div className="absolute top-0 right-[-3px] h-full w-[6px] cursor-col-resize hover:bg-indigo-400 opacity-0 hover:opacity-50 z-20 transition-opacity" onMouseDown={(e) => onTableResizeStart && onTableResizeStart(e, elementId, c)} />)}
        </div>
    );
});

export const TableElement: React.FC<TableElementProps> = ({ element, isEditor, style, onTableResizeStart, onTableRowResizeStart, onTableCellChange, onTableCellFocus, activeTableCell, pageHeight, pageWidth }) => {
    const rows = style.table?.rows || 10;
    const columns = style.table?.cols || 2;
    const hasHeader = style.table?.headerRow;
    const columnWidths = style.table?.columnWidths || Array(columns).fill(100 / columns);
    const rowHeights = style.table?.rowHeights || Array(rows).fill(100 / rows);
    const globalTextStyle = style.table?.textStyle || { fontFamily: 'Inter', fontSize: 10, fontWeight: 'normal', color: '#666', textAlign: 'left', verticalAlign: 'top', textTransform: 'none', letterSpacing: 0, backgroundColor: 'transparent' };
    const rowStyles = style.table?.rowStyles || {};
    const colStyles = style.table?.colStyles || {};
    const borders = style.table?.borders || { top: true, bottom: true, left: true, right: true, insideHorizontal: true, insideVertical: true, headerSeparator: true };
    const borderColor = style.table?.borderColor || '#000';
    const borderWidth = style.table?.borderWidth ?? 1;
    const bStyle = style.table?.borderStyle || 'solid';
    const borderStyle = `${borderWidth}px ${bStyle} ${borderColor}`;
    const noBorder2 = 'none';
    const rowHeightPx = style.table?.rowHeight;
    
    const borderRadius = style.table?.borderRadius || 0;
    
    return (
        <div className="w-full h-full flex flex-col" style={{ overflow: 'hidden', borderRadius: `${borderRadius}px` }}>
            {Array(rows).fill(0).map((_, r) => {
                const isLastRow = r === rows - 1;
                const rowHeightStyle = rowHeightPx ? `${rowHeightPx}px` : `${rowHeights[r]}%`;
                
                return (
                    <div key={r} className="flex w-full relative" style={{ height: rowHeightStyle, minHeight: rowHeightPx ? rowHeightStyle : '0' }}>
                        {Array(columns).fill(0).map((_, c) => {
                            const isLastCol = c === columns - 1;
                            const cellKey = `${r}-${c}`;
                            const content = style.table?.cellContent?.[cellKey] || '';
                            const isHeaderCell = hasHeader && r === 0;
                            const tStyle = { ...globalTextStyle, ...(rowStyles[r] || {}), ...(colStyles[c] || {}) };
                            let justifyContent = 'flex-start';
                            if (tStyle.verticalAlign === 'middle') justifyContent = 'center';
                            if (tStyle.verticalAlign === 'bottom') justifyContent = 'flex-end';
                            const cellStyle: React.CSSProperties = { width: `${columnWidths[c]}%`, height: '100%', borderTop: (r === 0 && borders.top) ? borderStyle : noBorder2, borderBottom: isLastRow ? (borders.bottom ? borderStyle : noBorder2) : (isHeaderCell && borders.headerSeparator ? borderStyle : (borders.insideHorizontal ? borderStyle : noBorder2)), borderLeft: (c === 0 && borders.left) ? borderStyle : noBorder2, borderRight: isLastCol ? (borders.right ? borderStyle : noBorder2) : (borders.insideVertical ? borderStyle : noBorder2), backgroundColor: isHeaderCell ? '#f3f4f6' : (tStyle.backgroundColor || 'transparent'), display: 'flex', flexDirection: 'column', justifyContent: justifyContent, alignItems: 'stretch', fontFamily: tStyle.fontFamily, fontSize: tStyle.fontSize, fontWeight: tStyle.fontWeight, color: tStyle.color, textAlign: tStyle.textAlign as any, textTransform: tStyle.textTransform as any, letterSpacing: `${tStyle.letterSpacing}px` };
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
