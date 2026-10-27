
import React from 'react';
import { BaseElementProps } from './types';
import { getMonthName, getDayName } from '../../../../core/backend/calendar';
import { getTextStrokeCss } from '../../../../core/logic/textStroke';

const applyTextTransform = (text: string | number, transform?: string) => {
    const str = String(text);
    if (!str) return str;
    if (transform === 'uppercase') return str.toUpperCase();
    if (transform === 'lowercase') return str.toLowerCase();
    if (transform === 'capitalize') {
        return str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
    }
    if (transform === 'sentence') {
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }
    return str;
};

const getAlignmentStyles = (style: any): React.CSSProperties => {
    const styles: React.CSSProperties = {
        display: 'flex',
        flexDirection: 'column',
        whiteSpace: 'nowrap',
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

export const PlaceholderElement: React.FC<BaseElementProps> = ({ element, dayData, style, isEditor, pageHeight, pageWidth }) => {
    const currentYear = new Date().getFullYear();
    let d = { ...(dayData || { dayOfMonth: 1, month: 0, dayOfWeek: new Date(currentYear, 0, 1).getDay(), year: currentYear }) };
    
    // Simular maior espaço apenas no editor durante o ajuste de layout, nunca na visualização ou impressão
    if (isEditor && style?.simulateMaxSpace) {
        d.dayOfMonth = 30;
        d.dayOfWeek = 1; // Segunda-feira (Monday)
        d.month = 10; // Novembro (November)
    }
    
    const validVariants = ['day_number', 'day_name', 'month_name', 'month_number', 'year'];
    let effectiveType: string = element.type;
    if (element.type === 'date_placeholder') {
        effectiveType = (style?.variant && validVariants.includes(style.variant)) ? style.variant : 'day_number';
    } else if (!validVariants.includes(effectiveType)) {
        effectiveType = 'day_number';
    }

    // No editor, nunca deixe elementos em branco para permitir ao usuário posicionar, arrastar e estilizar
    if (isEditor && (!d.dayOfMonth || d.dayOfMonth === 0)) {
        const fallbackDay = (element.style?.dayIndex !== undefined && element.style.dayIndex >= 0 && element.style.dayIndex <= 6)
            ? (element.style.dayIndex === 0 ? 7 : element.style.dayIndex)
            : ((d.dayOfWeek !== undefined && d.dayOfWeek >= 0 && d.dayOfWeek <= 6)
                ? (d.dayOfWeek === 0 ? 7 : d.dayOfWeek)
                : ((d as any).date ? (d as any).date.getDate() : 1));
        d.dayOfMonth = fallbackDay;
    }

    if (!isEditor && d.dayOfMonth === 0) {
        if (effectiveType === 'day_number' || (effectiveType === 'date_placeholder' && (!style?.variant || style?.variant === 'day_number'))) {
            return null;
        }
        if (d.month === -1 && d.year === 0 && d.dayOfWeek === undefined) {
            return null;
        }
    }

    const alignmentStyles = getAlignmentStyles(style);
    const textTransform = style.textTransform;
    const isSentenceOrCapitalize = textTransform === 'sentence' || textTransform === 'capitalize';
    const cssTransform = isSentenceOrCapitalize ? 'none' : textTransform;

    const renderContent = (content: string | number) => {
        const transformedContent = isSentenceOrCapitalize ? applyTextTransform(content, textTransform) : content;
        const strokeCss = getTextStrokeCss(style, style?.color || '#111827');
        const hasStroke = Boolean(style?.textStrokeWidth && style.textStrokeWidth > 0);
        return (
            <div 
                style={{
                    color: '#111827',
                    ...style, 
                    ...alignmentStyles, 
                    display: 'flex', 
                    width: '100%', 
                    height: '100%', 
                    whiteSpace: 'nowrap',
                    overflow: hasStroke ? 'visible' : 'hidden',
                    textOverflow: 'ellipsis',
                    textTransform: cssTransform as any,
                    ...strokeCss
                }}
            >
                {transformedContent}
            </div>
        );
    };

    switch (effectiveType) {
        case 'day_number': return renderContent(String(d.dayOfMonth).padStart(2, '0'));
        case 'month_name': return renderContent(getMonthName(d.month, style?.nameFormat));
        case 'month_number': {
            const mVal = d.month >= 0 ? d.month + 1 : 1;
            return renderContent(String(mVal).padStart(2, '0'));
        }
        case 'day_name': return renderContent(getDayName(d.dayOfWeek, style?.nameFormat));
        case 'year': return renderContent((d.year || currentYear) + (style?.yearOffset || 0));
        case 'date_placeholder': {
            const variant = style?.variant || 'day_number';
            switch (variant) {
                case 'day_number': return renderContent(String(d.dayOfMonth).padStart(2, '0'));
                case 'day_name': return renderContent(getDayName(d.dayOfWeek, style?.nameFormat));
                case 'month_name': return renderContent(getMonthName(d.month, style?.nameFormat));
                case 'month_number': {
                    const mVal = d.month >= 0 ? d.month + 1 : 1;
                    return renderContent(String(mVal).padStart(2, '0'));
                }
                case 'year': return renderContent((d.year || currentYear) + (style?.yearOffset || 0));
                default: return renderContent(String(d.dayOfMonth).padStart(2, '0'));
            }
        }
        default: return null;
    }
};
