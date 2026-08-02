import { DayData, Holiday } from '../../types';

// --- BACKEND SIMULATION ---
// Esta lógica deve residir no servidor em produção para proteção da propriedade intelectual.

const getFixedHolidays = (year: number): Holiday[] => [
  { date: `${year}-01-01`, name: 'Confraternização Universal', type: 'national' },
  { date: `${year}-04-21`, name: 'Tiradentes', type: 'national' },
  { date: `${year}-05-01`, name: 'Dia do Trabalho', type: 'national' },
  { date: `${year}-09-07`, name: 'Independência do Brasil', type: 'national' },
  { date: `${year}-10-12`, name: 'Nossa Senhora Aparecida', type: 'national' },
  { date: `${year}-11-02`, name: 'Finados', type: 'national' },
  { date: `${year}-11-15`, name: 'Proclamação da República', type: 'national' },
  { date: `${year}-12-25`, name: 'Natal', type: 'national' },
];

const getMobileHolidays = (year: number): Holiday[] => {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;

  const easterDate = new Date(year, month - 1, day);
  const carnivalDate = new Date(easterDate); carnivalDate.setDate(easterDate.getDate() - 47);
  const corpusDate = new Date(easterDate); corpusDate.setDate(easterDate.getDate() + 60);
  const goodFridayDate = new Date(easterDate); goodFridayDate.setDate(easterDate.getDate() - 2);

  const formatDate = (d: Date) => d.toISOString().split('T')[0];

  return [
    { date: formatDate(carnivalDate), name: 'Carnaval', type: 'optional' },
    { date: formatDate(goodFridayDate), name: 'Paixão de Cristo', type: 'national' },
    { date: formatDate(corpusDate), name: 'Corpus Christi', type: 'optional' },
  ];
};

// Helper function exported for UI rendering
// Moon Math Constants
const knownNewMoon = new Date('2000-01-06').getTime();
const cycle = 29.53058867;

export const checkIsHoliday = (year: number, month: number, day: number, municipalHolidays: Holiday[] = []): string | undefined => {
    const holidays = [...getFixedHolidays(year), ...getMobileHolidays(year), ...municipalHolidays];
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return holidays.find(h => h.date === dateStr)?.name;
};

export const generateCalendarYear = (
  year: number,
  includeHolidays: boolean,
  municipalHolidays: Holiday[] = [],
  startMonth: number = 0,
  durationMonths: number = 12
): DayData[] => {
  const days: DayData[] = [];
  const start = new Date(year, startMonth, 1);
  const end = new Date(year, startMonth + durationMonths, 0);
  
  const startYear = start.getFullYear();
  const endYear = end.getFullYear();
  let holidays: Holiday[] = [];
  if (includeHolidays) {
    for (let y = startYear; y <= endYear; y++) {
      holidays.push(...getFixedHolidays(y), ...getMobileHolidays(y));
    }
    holidays.push(...municipalHolidays);
  }
  const holidayMap = new Map(holidays.map(h => [h.date, h.name]));

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dYear = d.getFullYear();
    const dMonth = String(d.getMonth() + 1).padStart(2, '0');
    const dDay = String(d.getDate()).padStart(2, '0');
    const isoDate = `${dYear}-${dMonth}-${dDay}`;
    
    // Moon Math
    const current = d.getTime();
    const diffDays = (current - knownNewMoon) / (1000 * 60 * 60 * 24);
    const phasePos = ((diffDays % cycle) + cycle) % cycle / cycle;
    let moonPhase = '';
    // Continuous assignment to ensure it appears on all pages
    if (phasePos < 0.06 || phasePos > 0.94) moonPhase = 'Nova';
    else if (phasePos < 0.44) moonPhase = 'Crescente';
    else if (phasePos < 0.56) moonPhase = 'Lua cheia';
    else moonPhase = 'Minguante';

    days.push({
      date: new Date(d),
      dayOfWeek: d.getDay(),
      dayOfMonth: d.getDate(),
      month: d.getMonth(),
      year: d.getFullYear(),
      holiday: holidayMap.get(isoDate),
      moonPhase: moonPhase
    });
  }

  return days;
};

export const generatePlannerDays = (
  year: number,
  includeHolidays: boolean,
  municipalHolidays: Holiday[] = [],
  startMonth: number = 0,
  durationMonths: number = 12
): DayData[] => {
  const days = generateCalendarYear(year, includeHolidays, municipalHolidays, startMonth, durationMonths);
  
  // Pad beginning to start on Monday (1)
  const firstDay = days[0];
  const firstDayOfWeek = firstDay.dayOfWeek; // 0 is Sunday, 1 is Monday
  
  if (firstDayOfWeek !== 1) {
    const diff = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
    const padding = [];
    for (let i = diff; i > 0; i--) {
        const d = new Date(firstDay.date);
        d.setDate(d.getDate() - i);
        
        // Moon Math for padding days
        const current = d.getTime();
        const diffDays = (current - knownNewMoon) / (1000 * 60 * 60 * 24);
        const phasePos = ((diffDays % cycle) + cycle) % cycle / cycle;
        let moonPhase = '';
        if (phasePos < 0.06 || phasePos > 0.94) moonPhase = 'Nova';
        else if (phasePos < 0.44) moonPhase = 'Crescente';
        else if (phasePos < 0.56) moonPhase = 'Lua cheia';
        else moonPhase = 'Minguante';

        padding.push({
            date: new Date(d),
            dayOfWeek: d.getDay(),
            dayOfMonth: 0, 
            month: d.getMonth(),
            year: d.getFullYear(),
            holiday: undefined,
            moonPhase: moonPhase
        });
    }
    days.unshift(...padding);
  }

  // Pad end to end on Sunday (0)
  const lastDay = days[days.length - 1];
  const lastDayOfWeek = lastDay.dayOfWeek;
  if (lastDayOfWeek !== 0) {
      const diff = 7 - lastDayOfWeek;
      for (let i = 1; i <= diff; i++) {
          const d = new Date(lastDay.date);
          d.setDate(d.getDate() + i);
          
          // Moon Math for padding days
          const current = d.getTime();
          const diffDays = (current - knownNewMoon) / (1000 * 60 * 60 * 24);
          const phasePos = ((diffDays % cycle) + cycle) % cycle / cycle;
          let moonPhase = '';
          if (phasePos < 0.06 || phasePos > 0.94) moonPhase = 'Nova';
          else if (phasePos < 0.44) moonPhase = 'Crescente';
          else if (phasePos < 0.56) moonPhase = 'Lua cheia';
          else moonPhase = 'Minguante';

          days.push({
              date: new Date(d),
              dayOfWeek: d.getDay(),
              dayOfMonth: 0, 
              month: d.getMonth(),
              year: d.getFullYear(),
              holiday: undefined,
              moonPhase: moonPhase
          });
      }
  }

  return days;
};

export const generateGenericPages = (count: number): DayData[] => {
    const pages: DayData[] = [];
    const dummyDate = new Date();
    for (let i = 0; i < count; i++) {
        pages.push({
            date: dummyDate,
            dayOfWeek: 0,
            dayOfMonth: 0,
            month: 0,
            year: 0
        });
    }
    return pages;
};

export const generateMonthGrid = (year: number, month: number, startOfWeekDay: number | boolean = 0): (number | null)[][] => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    let startDayNumber = 0;
    if (typeof startOfWeekDay === 'boolean') {
        startDayNumber = startOfWeekDay ? 1 : 0;
    } else {
        startDayNumber = (typeof startOfWeekDay === 'number' && startOfWeekDay >= 0 && startOfWeekDay <= 6) ? startOfWeekDay : 0;
    }

    const jsDay = firstDay.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const startOffset = (jsDay - startDayNumber + 7) % 7;

    const grid: (number | null)[][] = [];
    let currentWeek: (number | null)[] = Array(7).fill(null);
    let currentDay = 1;

    for (let i = startOffset; i < 7; i++) currentWeek[i] = currentDay++;
    grid.push(currentWeek);

    while (currentDay <= daysInMonth) {
        const week: (number | null)[] = Array(7).fill(null);
        for (let i = 0; i < 7 && currentDay <= daysInMonth; i++) week[i] = currentDay++;
        grid.push(week);
    }
    
    return grid;
};

export const getMonthName = (i: number) => ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'][i];
export const getDayName = (i: number) => ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'][i];