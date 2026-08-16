
import React from 'react';
import { BaseElementProps } from './types';
import { getDayName } from '../../../../core/backend/calendar';

export const PermanentDayHeader: React.FC<BaseElementProps> = ({ element, style, pageHeight, pageWidth }) => {
    const variant = style.variant || 'circles_outline';
    const color = style.color || '#f472b6'; 
    const bgColor = style.backgroundColor || '#fdf2f8';
    const fontSize = style.fontSize || 10;
    const fontFamily = style.fontFamily || 'Inter';
    
    // Order: Seg, Ter, Qua, Qui, Sex, Sáb, Dom
    const dayIndices = [1, 2, 3, 4, 5, 6, 0];
    const nameFormat = style.nameFormat || 'initial';
    const days = dayIndices.map(dIdx => getDayName(dIdx, nameFormat));
    
    const renderDays = () => {
        const dayContainerStyle: React.CSSProperties = {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
            height: '100%',
        };

        const isFilled = variant.includes('filled');
        const isSquare = variant.includes('square');
        const isMinimal = variant.includes('minimal');
        const isTextBelow = variant.includes('text_below');
        const shapeScale = style.shapeScale || 1; // 0.5 to 1.5

        const dayWrapperStyle: React.CSSProperties = {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '13%',
            height: '100%',
            justifyContent: isTextBelow ? 'space-between' : 'center',
        };

        const dayCircleStyle: React.CSSProperties = {
            width: `${100 * shapeScale}%`,
            height: 'auto',
            maxHeight: isTextBelow ? `${70 * shapeScale}%` : `${100 * shapeScale}%`,
            aspectRatio: '1/1',
            flexShrink: 0,
            borderRadius: isSquare ? '4px' : isMinimal ? '0' : '50%',
            border: isMinimal ? 'none' : `${style.borderWidth ?? 1}px solid ${style.borderColor || color}`,
            backgroundColor: isFilled ? color : 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: isTextBelow ? 0 : fontSize,
            color: isFilled ? '#ffffff' : color,
            fontWeight: '600',
            fontFamily: fontFamily,
            boxSizing: 'border-box',
        };

        const textStyle: React.CSSProperties = {
            fontSize: fontSize,
            color: color,
            fontWeight: '600',
            fontFamily: fontFamily,
            marginTop: '2px',
        };

        return (
            <div style={dayContainerStyle}>
                {days.map((day, i) => (
                    <div key={i} style={dayWrapperStyle}>
                        <div style={dayCircleStyle}>
                            {!isTextBelow && day}
                        </div>
                        {isTextBelow && <span style={textStyle}>{day}</span>}
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="w-full h-full flex items-center justify-center p-1">
            {renderDays()}
        </div>
    );
};
