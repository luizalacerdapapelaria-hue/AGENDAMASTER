import React from 'react';
import { BaseElementProps } from './types';
import { getSpecialDateDisplaySample } from '../../../../core/logic/specialDates';

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
    flexDirection: 'row',
    alignItems: 'center',
  };

  if (style.verticalAlign === 'middle') {
    // vertical centering handled in wrapper
  } else if (style.verticalAlign === 'bottom') {
    styles.alignSelf = 'flex-end';
  } else {
    styles.alignSelf = 'flex-start';
  }

  if (style.textAlign === 'center') {
    styles.justifyContent = 'center';
  } else if (style.textAlign === 'right') {
    styles.justifyContent = 'flex-end';
  } else {
    styles.justifyContent = 'flex-start';
  }

  return styles;
};

export const SpecialEventElement: React.FC<BaseElementProps> = ({
  element,
  dayData,
  style,
  isEditor
}) => {
  const specialText = dayData?.specialEventText || '';
  const hasEventOnThisDay = !!specialText.trim();

  // Se não houver evento neste dia:
  // - No editor: Mostra um exemplo demonstrativo para posicionar e estilizar
  // - Na impressão / visualização real: Fica oculto (retorna null)
  if (!hasEventOnThisDay) {
    if (!isEditor) return null;
  }

  const sampleInfo = (!hasEventOnThisDay && dayData?.specialDatesList && dayData.specialDatesList.length > 0)
    ? getSpecialDateDisplaySample(undefined, dayData.specialDatesList)
    : undefined;

  const sampleEditorText = (() => {
    if (sampleInfo) {
      return sampleInfo.text;
    }
    if (element.content && !element.content.includes('🏖️ 20/Fev: Férias da Cliente | 💍')) {
      return element.content;
    }
    return '💍 Faltam 50 dias para o Casamento';
  })();

  const rawText = hasEventOnThisDay ? specialText : sampleEditorText;

  const textTransform = style.textTransform;
  const isSentenceOrCapitalize = textTransform === 'sentence' || textTransform === 'capitalize';
  const displayText = isSentenceOrCapitalize ? applyTextTransform(rawText, textTransform) : rawText;

  const alignmentStyles = getAlignmentStyles(style);
  const variant = style.variant || 'pill'; // 'pill' | 'tag' | 'minimal' | 'underline'

  const effectiveBgColor = style.backgroundColor || (sampleInfo?.bgColor) || (hasEventOnThisDay ? '#fdf2f8' : 'rgba(244, 114, 182, 0.1)');
  const effectiveBorderColor = style.borderColor || (sampleInfo?.borderColor) || '#f472b6';
  const effectiveTextColor = style.color || (sampleInfo?.color) || '#db2777';

  let containerExtraStyles: React.CSSProperties = {};
  if (variant === 'pill') {
    containerExtraStyles = {
      borderRadius: typeof style.borderRadius === 'number' ? `${style.borderRadius}px` : '9999px',
      padding: '2px 8px',
      backgroundColor: effectiveBgColor,
      border: `${style.borderWidth !== undefined ? style.borderWidth : 1}px ${style.borderStyle || 'solid'} ${effectiveBorderColor}`
    };
  } else if (variant === 'tag') {
    containerExtraStyles = {
      borderRadius: typeof style.borderRadius === 'number' ? `${style.borderRadius}px` : '4px',
      padding: '2px 6px',
      backgroundColor: style.backgroundColor || 'transparent',
      border: `${style.borderWidth !== undefined ? style.borderWidth : 1}px ${style.borderStyle || 'dashed'} ${style.borderColor || '#db2777'}`
    };
  } else if (variant === 'underline') {
    containerExtraStyles = {
      borderBottom: `${style.borderWidth || 1.5}px ${style.borderStyle || 'solid'} ${style.borderColor || '#db2777'}`,
      paddingBottom: '2px'
    };
  } else {
    // minimal
    containerExtraStyles = {
      backgroundColor: style.backgroundColor || 'transparent',
      border: 'none'
    };
  }

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: style.verticalAlign === 'middle' ? 'center' : (style.verticalAlign === 'bottom' ? 'flex-end' : 'flex-start'),
        alignItems: style.textAlign === 'center' ? 'center' : (style.textAlign === 'right' ? 'flex-end' : 'flex-start'),
        overflow: 'hidden',
        boxSizing: 'border-box'
      }}
    >
      <div
        style={{
          ...alignmentStyles,
          ...containerExtraStyles,
          fontFamily: style.fontFamily || 'Inter',
          fontSize: typeof style.fontSize === 'number' ? `${style.fontSize}px` : (style.fontSize || '11px'),
          fontWeight: style.fontWeight || '600',
          fontStyle: style.fontStyle || 'normal',
          color: effectiveTextColor,
          letterSpacing: style.letterSpacing ? `${style.letterSpacing}px` : undefined,
          lineHeight: style.lineHeight || 1.2,
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis',
          maxWidth: '100%',
          opacity: !hasEventOnThisDay && isEditor ? 0.75 : (style.opacity ?? 1)
        }}
        title={hasEventOnThisDay ? displayText : 'Prévia no Editor: Informações Importantes / Contagem Regressiva'}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {displayText}
        </span>
      </div>
    </div>
  );
};
