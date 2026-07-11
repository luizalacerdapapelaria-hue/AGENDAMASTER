import React from 'react';
import { LayoutElement } from '../../../../types';

import { BaseElementProps } from './types';

export const ImageElement: React.FC<BaseElementProps> = ({ element, isEditor, pageHeight, pageWidth }) => {
  const { style } = element;
  
  if (!style.imageUrl) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg text-gray-400">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span className="text-[10px] font-bold uppercase">Sem Imagem</span>
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-visible flex items-center justify-center" style={{ opacity: style.opacity ?? 1 }}>
      <img 
        src={style.imageUrl} 
        alt={element.name}
        referrerPolicy="no-referrer"
        className="max-w-full max-h-full object-contain"
      />
    </div>
  );
};
