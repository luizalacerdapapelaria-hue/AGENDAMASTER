
import React from 'react';
import { BaseElementProps } from './types';
import * as Icons from 'lucide-react';

export const StickerElement: React.FC<BaseElementProps> = ({ element, style }) => {
    const iconName = style.variant || 'Star';
    const IconComponent = (Icons as any)[iconName];

    if (!IconComponent) {
        return <Icons.HelpCircle className="w-full h-full" color={style.color || '#000'} />;
    }

    return (
        <div className="w-full h-full flex items-center justify-center" style={{ opacity: style.opacity }}>
            <IconComponent 
                className="w-full h-full" 
                color={style.color || '#000'} 
                fill={style.backgroundColor || 'transparent'}
                strokeWidth={style.borderWidth || 1.5}
                style={{
                    transform: `scaleX(${style.flipX ? -1 : 1}) scaleY(${style.flipY ? -1 : 1})`,
                }}
            />
        </div>
    );
};
