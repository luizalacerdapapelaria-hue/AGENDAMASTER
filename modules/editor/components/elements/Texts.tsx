
import React from 'react';
import { TextElementProps } from './types';

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

const getAlignmentStyles = (style: any): React.CSSProperties => {
    const styles: React.CSSProperties = {
        display: 'flex',
        flexDirection: 'column',
    };

    if (style.verticalAlign === 'middle') styles.justifyContent = 'center';
    else if (style.verticalAlign === 'bottom') styles.justifyContent = 'flex-end';
    else styles.justifyContent = 'flex-start';

    if (style.textAlign === 'center') styles.alignItems = 'center';
    else if (style.textAlign === 'right') styles.alignItems = 'flex-end';
    else if (style.textAlign === 'justify') {
        styles.alignItems = 'stretch';
        styles.textAlign = 'justify';
    } else styles.alignItems = 'flex-start';

    return styles;
};

export const TextElement: React.FC<TextElementProps> = ({ element, dayData, quote, verse, isEditor, isSelected, style, onContentChange, pageHeight, pageWidth }) => {
    const [isEditing, setIsEditing] = React.useState(false);

    React.useEffect(() => {
        if (!isSelected) {
            setIsEditing(false);
        }
    }, [isSelected]);
    
    const alignmentStyles = getAlignmentStyles(style);
    const textTransform = style.textTransform;
    const isSentenceOrCapitalize = textTransform === 'sentence' || textTransform === 'capitalize';
    
    // For sentence and capitalize, we apply it via JS. For others, CSS is fine.
    const cssTransform = isSentenceOrCapitalize ? 'none' : textTransform;

    if (element.type === 'holiday_list') {
        const rawContent = element.content || "Feriados Nacionais (Editável)";
        const content = isSentenceOrCapitalize ? applyTextTransform(rawContent, textTransform) : rawContent;
        if (isEditor && isSelected && isEditing) { 
            return (
                <div style={{ width: '100%', height: '100%' }}>
                    <textarea 
                        value={element.content || "Feriados Nacionais (Editável)"} 
                        onChange={(e) => onContentChange && onContentChange(element.id, e.target.value)} 
                        onBlur={() => setIsEditing(false)}
                        onKeyDown={(e) => {
                            if (e.key === 'Escape') {
                                setIsEditing(false);
                            }
                        }}
                        style={{ 
                            fontSize: style.fontSize, 
                            fontFamily: style.fontFamily, 
                            fontWeight: style.fontWeight || 'normal',
                            fontStyle: style.fontStyle,
                            color: style.color, 
                            textAlign: style.textAlign || 'left', 
                            lineHeight: style.lineHeight || 1.4, 
                            width: '100%', 
                            height: '100%', 
                            minHeight: '1.5em',
                            resize: 'none', 
                            background: 'rgba(255,255,255,0.92)', 
                            border: '1.5px dashed #6366f1', 
                            outline: 'none', 
                            whiteSpace: 'pre-wrap', 
                            textTransform: cssTransform as any,
                            overflow: 'auto',
                            padding: '4px',
                            boxSizing: 'border-box'
                        }} 
                        autoFocus 
                        onMouseDown={(e) => e.stopPropagation()} 
                    />
                </div>
            );
        }

        const cols = Math.max(1, Math.min(6, style.columnCount || 1));
        const colGap = typeof style.columnGap === 'number' ? style.columnGap : 20;
        const lines = (content || '').split('\n');
        const parsedFontSize = typeof style.fontSize === 'number' 
            ? style.fontSize 
            : (parseFloat(String(style.fontSize || 12)) || 12);
        const cssFontSize = `${parsedFontSize}px`;

        if (cols > 1) {
            // Divide as linhas proporcionalmente entre as N colunas para alinhamento uniforme
            const linesPerCol = Math.ceil(lines.length / cols);
            const columnsData: string[][] = [];
            for (let c = 0; c < cols; c++) {
                columnsData.push(lines.slice(c * linesPerCol, (c + 1) * linesPerCol));
            }

            return (
                <div 
                    className="w-full h-full" 
                    onDoubleClick={() => isEditor && isSelected && setIsEditing(true)}
                    title={isEditor ? "Clique duplo para editar a lista de feriados" : undefined}
                    style={{ 
                        display: 'grid',
                        gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
                        columnGap: `${colGap}px`,
                        rowGap: '2px',
                        fontSize: cssFontSize, 
                        fontFamily: style.fontFamily, 
                        fontWeight: style.fontWeight || 'normal',
                        fontStyle: style.fontStyle,
                        letterSpacing: style.letterSpacing ? `${style.letterSpacing}px` : undefined,
                        color: style.color, 
                        lineHeight: style.lineHeight || 1.4, 
                        textTransform: cssTransform as any,
                        width: '100%',
                        height: '100%',
                        overflow: 'visible',
                        boxSizing: 'border-box'
                    }}
                >
                    {columnsData.map((colLines, colIdx) => (
                        <div 
                            key={colIdx} 
                            style={{ 
                                display: 'flex', 
                                flexDirection: 'column', 
                                justifyContent: style.verticalAlign === 'middle' ? 'center' : style.verticalAlign === 'bottom' ? 'flex-end' : 'flex-start',
                                textAlign: style.textAlign || 'left',
                                minWidth: 0,
                                width: '100%',
                                fontSize: cssFontSize,
                                boxSizing: 'border-box'
                            }}
                        >
                            {colLines.map((line, lineIdx) => (
                                <div 
                                    key={lineIdx} 
                                    style={{ 
                                        minHeight: line.trim() ? undefined : '1em',
                                        whiteSpace: 'normal',
                                        wordBreak: 'normal',
                                        overflowWrap: 'break-word',
                                        fontSize: cssFontSize,
                                        paddingBottom: '1px'
                                    }}
                                >
                                    {line || '\u00A0'}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            );
        }

        // 1 Coluna (Lista Única Vertical)
        return (
            <div 
                className="w-full h-full" 
                onDoubleClick={() => isEditor && isSelected && setIsEditing(true)}
                title={isEditor ? "Clique duplo para editar a lista de feriados" : undefined}
                style={{ 
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: style.verticalAlign === 'middle' ? 'center' : style.verticalAlign === 'bottom' ? 'flex-end' : 'flex-start',
                    textAlign: style.textAlign || 'left',
                    fontSize: cssFontSize, 
                    fontFamily: style.fontFamily, 
                    fontWeight: style.fontWeight || 'normal',
                    fontStyle: style.fontStyle,
                    letterSpacing: style.letterSpacing ? `${style.letterSpacing}px` : undefined,
                    color: style.color, 
                    lineHeight: style.lineHeight || 1.4, 
                    textTransform: cssTransform as any,
                    width: '100%',
                    height: '100%',
                    overflow: 'visible',
                    boxSizing: 'border-box'
                }}
            >
                {lines.map((line, idx) => (
                    <div 
                        key={idx} 
                        style={{ 
                            minHeight: line.trim() ? undefined : '1em',
                            whiteSpace: 'normal',
                            wordBreak: 'normal',
                            overflowWrap: 'break-word',
                            fontSize: cssFontSize,
                            paddingBottom: '1px'
                        }}
                    >
                        {line || '\u00A0'}
                    </div>
                ))}
            </div>
        );
    }

    if (element.type === 'text') {
        const content = isSentenceOrCapitalize ? applyTextTransform(element.content || '', textTransform) : (element.content || (isEditor ? 'Texto Livre' : ''));
        if (isEditor && isSelected && isEditing) {
            return (
                <div style={{...alignmentStyles, width: '100%', height: '100%'}}>
                    <textarea 
                        value={element.content || ''} 
                        onChange={(e) => onContentChange && onContentChange(element.id, e.target.value)} 
                        onBlur={() => setIsEditing(false)}
                        onKeyDown={(e) => {
                            if (e.key === 'Escape') {
                                setIsEditing(false);
                            }
                        }}
                        style={{
                            ...style, 
                            lineHeight: style.lineHeight || 1.5,
                            width: '100%', 
                            height: 'auto', 
                            minHeight: '1.5em',
                            resize: 'none', 
                            background: 'rgba(255,255,255,0.5)', 
                            border: '1px dashed #ccc', 
                            outline: 'none', 
                            display: 'block', 
                            whiteSpace: 'pre-wrap', 
                            overflow: 'hidden'
                        }} 
                        autoFocus 
                        onMouseDown={(e) => e.stopPropagation()} 
                    />
                </div>
            );
        }

        const cols = style.columnCount && style.columnCount > 1 ? Math.min(6, style.columnCount) : 1;
        if (cols > 1) {
            const colGap = typeof style.columnGap === 'number' ? style.columnGap : 20;
            const lines = (content || '').split('\n');
            const linesPerCol = Math.ceil(lines.length / cols);
            const columnsData: string[][] = [];
            for (let c = 0; c < cols; c++) {
                columnsData.push(lines.slice(c * linesPerCol, (c + 1) * linesPerCol));
            }

            return (
                <div 
                    onDoubleClick={() => isEditor && isSelected && setIsEditing(true)}
                    style={{
                        ...style, 
                        display: 'grid',
                        gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
                        columnGap: `${colGap}px`,
                        rowGap: 0,
                        lineHeight: style.lineHeight || 1.5,
                        width: '100%', 
                        height: '100%', 
                        textTransform: cssTransform as any,
                        overflow: 'hidden'
                    }}
                >
                    {columnsData.map((colLines, colIdx) => (
                        <div 
                            key={colIdx} 
                            style={{ 
                                display: 'flex', 
                                flexDirection: 'column', 
                                justifyContent: style.verticalAlign === 'middle' ? 'center' : style.verticalAlign === 'bottom' ? 'flex-end' : 'flex-start',
                                textAlign: style.textAlign || 'left',
                                minWidth: 0,
                                width: '100%'
                            }}
                        >
                            {colLines.map((line, lineIdx) => (
                                <div 
                                    key={lineIdx} 
                                    style={{ 
                                        minHeight: line.trim() ? undefined : '1em',
                                        wordBreak: 'break-word',
                                        overflowWrap: 'break-word'
                                    }}
                                >
                                    {line || '\u00A0'}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            );
        }

        return (
            <div 
                onDoubleClick={() => isEditor && isSelected && setIsEditing(true)}
                style={{
                    ...style, 
                    ...alignmentStyles, 
                    lineHeight: style.lineHeight || 1.5,
                    display: 'flex', 
                    width: '100%', 
                    height: '100%', 
                    whiteSpace: 'pre-wrap', 
                    textTransform: cssTransform as any
                }}
            >
                {content}
            </div>
        );
    }

    if (element.type === 'quote') {
        const quoteText = quote || element.content || (isEditor ? '"Frase Inspiradora"' : '');
        const content = isSentenceOrCapitalize ? applyTextTransform(quoteText, textTransform) : quoteText;
        return <div style={{...style, ...alignmentStyles, lineHeight: style.lineHeight || 1.5, display: 'flex', width: '100%', height: '100%', textTransform: cssTransform as any}}>{content}</div>;
    }

    if (element.type === 'verse') {
        const verseText = verse || element.content || (isEditor ? '"Versículo Bíblico"' : '');
        const content = isSentenceOrCapitalize ? applyTextTransform(verseText, textTransform) : verseText;
        return <div style={{...style, ...alignmentStyles, lineHeight: style.lineHeight || 1.5, display: 'flex', width: '100%', height: '100%', textTransform: cssTransform as any}}>{content}</div>;
    }

    if (element.type === 'holiday') {
        if (!dayData || dayData.dayOfMonth === 0) return null;
        const holidayText = dayData.holiday || (isEditor ? 'Confraternização Universal' : '');
        if (!holidayText && !isEditor) return null;
        const content = isSentenceOrCapitalize ? applyTextTransform(holidayText, textTransform) : holidayText;
        return <div style={{...style, ...alignmentStyles, lineHeight: style.lineHeight || 1.5, display: 'flex', width: '100%', height: '100%', textTransform: cssTransform as any}}>{content}</div>;
    }

    return null;
};
