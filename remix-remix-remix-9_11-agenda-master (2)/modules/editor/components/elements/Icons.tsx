
import React from 'react';
import * as icons from 'lucide-react';
import { BaseElementProps } from './types';

export const IconElement: React.FC<BaseElementProps> = ({ element, style, pageHeight, pageWidth }) => {
    const iconName = style.iconName || 'Star';
    // @ts-ignore - Dynamic access to Lucide icons
    const IconComponent = icons[iconName] || icons.HelpCircle;

    const rotation = style.rotation || 0;
    const flipX = style.flipX ? -1 : 1;
    const flipY = style.flipY ? -1 : 1;

    return (
        <div 
            style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: style.color || '#000000',
                opacity: style.opacity ?? 1,
                transition: 'all 0.2s ease'
            }}
        >
            <IconComponent 
                size="100%" 
                strokeWidth={style.borderWidth || 2}
                style={{
                    fill: style.backgroundColor || 'transparent'
                }}
            />
        </div>
    );
};
