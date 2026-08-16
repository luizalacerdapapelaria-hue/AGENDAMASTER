
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
        const content = isSentenceOrCapitalize ? applyTextTransform(element.content || "Feriados Nacionais (Editável)", textTransform) : (element.content || "Feriados Nacionais (Editável)");
        if (isEditor && isSelected && isEditing) { 
            return (
                <div style={{...alignmentStyles, width: '100%', height: '100%'}}>
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
                            color: style.color, 
                            textAlign: style.textAlign, 
                            lineHeight: style.lineHeight || 1.5, 
                            width: '100%', 
                            height: 'auto', 
                            minHeight: '1.5em',
                            resize: 'none', 
                            background: 'rgba(255,255,255,0.5)', 
                            border: '1px dashed #ccc', 
                            outline: 'none', 
                            whiteSpace: 'pre-wrap', 
                            textTransform: cssTransform as any,
                            overflow: 'hidden'
                        }} 
                        autoFocus 
                        onMouseDown={(e) => e.stopPropagation()} 
                    />
                </div>
            );
        }
        return (
            <div 
                className="w-full h-full whitespace-pre-wrap" 
                onDoubleClick={() => isEditor && isSelected && setIsEditing(true)}
                style={{ 
                    ...alignmentStyles, 
                    fontSize: style.fontSize, 
                    fontFamily: style.fontFamily, 
                    color: style.color, 
                    textAlign: style.textAlign, 
                    lineHeight: style.lineHeight || 1.5, 
                    columnCount: style.columnCount || 1, 
                    columnGap: '1em', 
                    textTransform: cssTransform as any 
                }}
            >
                {content}
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
        const content = isSentenceOrCapitalize ? applyTextTransform(quote || (isEditor ? '"Frase Inspiradora"' : ''), textTransform) : (quote || (isEditor ? '"Frase Inspiradora"' : ''));
        return <div style={{...style, ...alignmentStyles, lineHeight: style.lineHeight || 1.5, display: 'flex', width: '100%', height: '100%', textTransform: cssTransform as any}}>{content}</div>;
    }

    if (element.type === 'verse') {
        const content = isSentenceOrCapitalize ? applyTextTransform(verse || (isEditor ? '"Versículo Bíblico"' : ''), textTransform) : (verse || (isEditor ? '"Versículo Bíblico"' : ''));
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
