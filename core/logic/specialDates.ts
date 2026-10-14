import { DayData, SpecialDateItem, SpecialDateType } from '../../types';

export const formatToIsoDate = (d: Date): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const parseIsoDateToLocalDate = (isoStr: string): Date => {
  const parts = isoStr.split('-');
  if (parts.length === 3) {
    return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
  }
  return new Date(isoStr);
};

export const getDaysDifference = (targetIsoDate: string, currentDate: Date): number => {
  const target = parseIsoDateToLocalDate(targetIsoDate);
  const current = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
  const diffTime = target.getTime() - current.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
};

export interface DaySpecialInfoResult {
  events: SpecialDateItem[];
  countdowns: { item: SpecialDateItem; daysRemaining: number; text: string }[];
  consolidatedText: string;
  primaryItem?: SpecialDateItem;
}

export const getSpecialInfoForDay = (
  date: Date | undefined | null,
  specialDates: SpecialDateItem[] = []
): DaySpecialInfoResult => {
  if (!date || !(date instanceof Date) || isNaN(date.getTime()) || !specialDates || specialDates.length === 0) {
    return { events: [], countdowns: [], consolidatedText: '' };
  }

  const isoToday = formatToIsoDate(date);
  const matchingEvents: SpecialDateItem[] = [];
  const activeCountdowns: { item: SpecialDateItem; daysRemaining: number; text: string }[] = [];
  const textParts: string[] = [];

  specialDates.forEach(item => {
    if (!item.date) return;

    const isCountdownItem = item.isCountdown || item.type === 'wedding_countdown' || item.type === 'countdown';

    // 1. Processar Contagem Regressiva
    if (isCountdownItem) {
      const diffDays = getDaysDifference(item.date, date);

      if (diffDays === 0) {
        // Dia do evento!
        const defaultFinal = item.type === 'wedding_countdown'
          ? 'Hoje é o grande dia: Nosso Casamento! 💍❤️'
          : `Hoje: ${item.title}! 🎉`;
        const text = item.countdownFinalMessage || defaultFinal;
        activeCountdowns.push({ item, daysRemaining: 0, text });
        textParts.push(text);
      } else if (diffDays === 1) {
        // Véspera!
        const defaultEve = item.type === 'wedding_countdown'
          ? 'Falta 1 dia! É amanhã o casamento! 💍✨'
          : `Falta 1 dia para ${item.title}! ⏳`;
        const text = item.countdownOneDayMessage || defaultEve;
        activeCountdowns.push({ item, daysRemaining: 1, text });
        textParts.push(text);
      } else if (diffDays > 1) {
        const maxDays = item.countdownDaysBefore ?? 100;
        if (diffDays <= maxDays) {
          const freq = item.countdownFrequency || 'daily';
          let shouldShow = false;

          if (freq === 'daily') {
            shouldShow = true;
          } else if (freq === 'every_5') {
            shouldShow = (diffDays % 5 === 0) || (diffDays <= 7);
          } else if (freq === 'every_10') {
            shouldShow = (diffDays % 10 === 0) || (diffDays <= 7);
          } else if (freq === 'last_30_daily') {
            shouldShow = (diffDays <= 30) || (diffDays % 10 === 0);
          } else {
            shouldShow = true;
          }

          if (shouldShow) {
            const template = item.countdownMessage || (
              item.type === 'wedding_countdown'
                ? 'Faltam {dias} dias para o casamento 💍'
                : 'Faltam {dias} dias para {titulo}'
            );
            const text = template
              .replace(/\{dias\}/gi, String(diffDays))
              .replace(/\{days\}/gi, String(diffDays))
              .replace(/\{titulo\}/gi, item.title);
            activeCountdowns.push({ item, daysRemaining: diffDays, text });
            textParts.push(text);
          }
        }
      }
    }

    // 2. Processar Evento / Férias / Aniversário / Lembrete
    let isDayMatch = false;
    let eventLabel = item.title;

    if (item.endDate && item.endDate !== item.date) {
      // Período (ex: Férias de 20/02 a 28/02)
      if (isoToday >= item.date && isoToday <= item.endDate) {
        isDayMatch = true;
        const iconPrefix = item.icon ? `${item.icon} ` : '';
        if (isoToday === item.date) {
          eventLabel = `${iconPrefix}Início das ${item.title}`;
        } else if (isoToday === item.endDate) {
          eventLabel = `${iconPrefix}Último dia de ${item.title}`;
        } else {
          eventLabel = `${iconPrefix}${item.title}`;
        }
      }
    } else {
      // Data única (ex: 20 de Fevereiro)
      if (isoToday === item.date) {
        isDayMatch = true;
        const iconPrefix = item.icon ? `${item.icon} ` : '';
        eventLabel = `${iconPrefix}${item.title}`;
      }
    }

    if (isDayMatch && !isCountdownItem) {
      matchingEvents.push(item);
      textParts.push(eventLabel);
    }
  });

  const consolidatedText = textParts.join(' • ');
  const primaryItem = matchingEvents[0] || (activeCountdowns[0] ? activeCountdowns[0].item : undefined);

  return {
    events: matchingEvents,
    countdowns: activeCountdowns,
    consolidatedText,
    primaryItem
  };
};

export const getSpecialDateDisplaySample = (item?: SpecialDateItem, specialDates?: SpecialDateItem[]): {
  text: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon?: string;
} => {
  const targetItem = item || (specialDates && specialDates.length > 0
    ? (specialDates.slice().reverse().find(d => d.type === 'wedding_countdown' || d.isCountdown) || specialDates[specialDates.length - 1])
    : undefined);

  if (!targetItem) {
    return {
      text: '💍 Faltam 50 dias para o Casamento',
      color: '#db2777',
      bgColor: '#fdf2f8',
      borderColor: '#f472b6',
      icon: '💍'
    };
  }

  const isCd = targetItem.isCountdown || targetItem.type === 'wedding_countdown' || targetItem.type === 'countdown';
  let text = '';
  if (isCd) {
    const template = targetItem.countdownMessage || (
      targetItem.type === 'wedding_countdown'
        ? 'Faltam {dias} dias para o casamento 💍'
        : 'Faltam {dias} dias para {titulo} ⏳'
    );
    text = template
      .replace(/\{dias\}/gi, '50')
      .replace(/\{days\}/gi, '50')
      .replace(/\{titulo\}/gi, targetItem.title || 'o casamento');
    if (targetItem.icon && !text.includes(targetItem.icon)) {
      text = `${targetItem.icon} ${text}`;
    }
  } else {
    text = `${targetItem.icon ? `${targetItem.icon} ` : ''}${targetItem.title}`;
  }

  return {
    text,
    color: targetItem.color || (isCd ? '#db2777' : '#0284c7'),
    bgColor: targetItem.bgColor || (isCd ? '#fdf2f8' : '#f0f9ff'),
    borderColor: targetItem.color || (isCd ? '#f472b6' : '#38bdf8'),
    icon: targetItem.icon
  };
};

export const enrichDayDataWithSpecialDates = (
  dayData: DayData,
  specialDates: SpecialDateItem[] = []
): DayData => {
  if (!dayData || !dayData.date || !specialDates || specialDates.length === 0) {
    return dayData;
  }

  const info = getSpecialInfoForDay(dayData.date, specialDates);

  return {
    ...dayData,
    specialEvents: info.events.length > 0 ? info.events : undefined,
    countdowns: info.countdowns.length > 0 ? info.countdowns : undefined,
    specialEventText: info.consolidatedText || undefined,
    specialDatesList: specialDates
  };
};

export const SPECIAL_DATE_PRESETS: {
  id: string;
  name: string;
  description: string;
  type: SpecialDateType;
  icon: string;
  color: string;
  bgColor: string;
  defaultTitle: string;
  isCountdown?: boolean;
  countdownDaysBefore?: number;
  countdownFrequency?: 'daily' | 'every_5' | 'every_10' | 'last_30_daily';
  countdownMessage?: string;
  countdownFinalMessage?: string;
  countdownOneDayMessage?: string;
}[] = [
  {
    id: 'vacation',
    name: 'Férias da Cliente',
    description: 'Destaque para o início, período e término das férias da sua cliente no miolo.',
    type: 'vacation',
    icon: '🏖️',
    color: '#0284c7',
    bgColor: '#f0f9ff',
    defaultTitle: 'Férias da Cliente 🏖️'
  },
  {
    id: 'wedding_countdown',
    name: 'Contagem Regressiva para Casamento',
    description: 'Contagem automática dos dias que faltam para o casamento ("Faltam 50 dias para o casamento 💍").',
    type: 'wedding_countdown',
    icon: '💍',
    color: '#db2777',
    bgColor: '#fdf2f8',
    defaultTitle: 'Casamento 💍',
    isCountdown: true,
    countdownDaysBefore: 100,
    countdownFrequency: 'last_30_daily',
    countdownMessage: 'Faltam {dias} dias para o casamento 💍',
    countdownOneDayMessage: 'Falta 1 dia! É amanhã o casamento! 💍✨',
    countdownFinalMessage: 'Hoje é o grande dia: Nosso Casamento! 💍❤️'
  },
  {
    id: 'birthday',
    name: 'Aniversário Especial',
    description: 'Marcação especial para o aniversário da dona da agenda ou de pessoas amadas.',
    type: 'birthday',
    icon: '🎂',
    color: '#d97706',
    bgColor: '#fffbeb',
    defaultTitle: 'Aniversário Especial 🎂'
  },
  {
    id: 'travel',
    name: 'Viagem dos Sonhos',
    description: 'Destaque para viagem, embarque ou período especial de descanso.',
    type: 'custom_event',
    icon: '✈️',
    color: '#059669',
    bgColor: '#ecfdf5',
    defaultTitle: 'Viagem ✈️'
  },
  {
    id: 'generic_countdown',
    name: 'Contagem Regressiva Personalizada',
    description: 'Contagem regressiva para formatura, concurso, viagem, nascimento do bebê ou meta.',
    type: 'countdown',
    icon: '⏳',
    color: '#7c3aed',
    bgColor: '#f5f3ff',
    defaultTitle: 'Grande Conquista 🎓',
    isCountdown: true,
    countdownDaysBefore: 60,
    countdownFrequency: 'daily',
    countdownMessage: 'Faltam {dias} dias para {titulo} ⏳',
    countdownOneDayMessage: 'Falta apenas 1 dia para {titulo}! 🌟',
    countdownFinalMessage: 'Hoje é o dia de {titulo}! Parabéns! 🎉'
  },
  {
    id: 'reminder',
    name: 'Lembrete / Data Importante',
    description: 'Aviso importante impresso no miolo em uma data específica da cliente.',
    type: 'reminder',
    icon: '📌',
    color: '#4f46e5',
    bgColor: '#eef2ff',
    defaultTitle: 'Lembrete Importante 📌'
  }
];
