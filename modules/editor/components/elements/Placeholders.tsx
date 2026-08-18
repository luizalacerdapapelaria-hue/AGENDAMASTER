
import React from 'react';
import { BaseElementProps } from './types';
import { getMonthName, getDayName } from '../../../../core/backend/calendar';

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
    
    if (style?.simulateMaxSpace) {
        d.dayOfMonth = 30;
        d.dayOfWeek = 1; // Segunda-feira (Monday)
        d.month = 10; // Novembro (November)
    }
    
    if (d.dayOfMonth === 0) return null;

    const alignmentStyles = getAlignmentStyles(style);
    const textTransform = style.textTransform;
    const isSentenceOrCapitalize = textTransform === 'sentence' || textTransform === 'capitalize';
    const cssTransform = isSentenceOrCapitalize ? 'none' : textTransform;

    const renderContent = (content: string | number) => {
        const transformedContent = isSentenceOrCapitalize ? applyTextTransform(content, textTransform) : content;
        return (
            <div 
                style={{
                    ...style, 
                    ...alignmentStyles, 
                    display: 'flex', 
                    width: '100%', 
                    height: '100%', 
                    whiteSpace: 'nowrap',
                    textTransform: cssTransform as any
                }}
            >
                {transformedContent}
            </div>
        );
    };

    switch (element.type) {
        case 'day_number': return renderContent(String(d.dayOfMonth).padStart(2, '0'));
        case 'month_name': return renderContent(getMonthName(d.month, style.nameFormat));
        case 'month_number': {
            const mVal = d.month >= 0 ? d.month + 1 : 1;
            return renderContent(String(mVal).padStart(2, '0'));
        }
        case 'day_name': return renderContent(getDayName(d.dayOfWeek, style.nameFormat));
        case 'year': return renderContent(d.year);
        case 'date_placeholder': {
            const variant = style.variant || 'day_number';
            switch (variant) {
                case 'day_number': return renderContent(String(d.dayOfMonth).padStart(2, '0'));
                case 'day_name': return renderContent(getDayName(d.dayOfWeek, style.nameFormat));
                case 'month_name': return renderContent(getMonthName(d.month, style.nameFormat));
                case 'month_number': {
                    const mVal = d.month >= 0 ? d.month + 1 : 1;
                    return renderContent(String(mVal).padStart(2, '0'));
                }
                case 'year': return renderContent(d.year);
                default: return renderContent(String(d.dayOfMonth).padStart(2, '0'));
            }
        }
        default: return null;
    }
};
