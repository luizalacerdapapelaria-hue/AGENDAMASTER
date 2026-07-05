import { DayData, Holiday } from '../types';

// Simple fixed holidays for Brazil (simplified logic for demo)
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
  // Easter calculation (Meeus/Jones/Butcher's algorithm)
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
  const month = Math.floor((h + l - 7 * m + 114) / 31); // 3 = March, 4 = April
  const day = ((h + l - 7 * m + 114) % 31) + 1;

  const easterDate = new Date(year, month - 1, day);
  
  // Carnival: 47 days before Easter
  const carnivalDate = new Date(easterDate);
  carnivalDate.setDate(easterDate.getDate() - 47);

  // Corpus Christi: 60 days after Easter
  const corpusDate = new Date(easterDate);
  corpusDate.setDate(easterDate.getDate() + 60);

  // Good Friday: 2 days before Easter
  const goodFridayDate = new Date(easterDate);
  goodFridayDate.setDate(easterDate.getDate() - 2);

  const formatDate = (d: Date) => d.toISOString().split('T')[0];

  return [
    { date: formatDate(carnivalDate), name: 'Carnaval', type: 'optional' },
    { date: formatDate(goodFridayDate), name: 'Paixão de Cristo', type: 'national' },
    { date: formatDate(corpusDate), name: 'Corpus Christi', type: 'optional' },
  ];
};

export const generateCalendarYear = (year: number, includeHolidays: boolean): DayData[] => {
  const days: DayData[] = [];
  const start = new Date(year, 0, 1);
  const end = new Date(year, 11, 31);
  
  const holidays = includeHolidays 
    ? [...getFixedHolidays(year), ...getMobileHolidays(year)]
    : [];

  const holidayMap = new Map(holidays.map(h => [h.date, h.name]));

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const isoDate = d.toISOString().split('T')[0];
    const holidayName = holidayMap.get(isoDate);

    // Simple moon phase simulation (approximate 29.53 days cycle)
    // Reference: Jan 6, 2000 was a New Moon.
    const knownNewMoon = new Date('2000-01-06').getTime();
    const current = d.getTime();
    const diffDays = (current - knownNewMoon) / (1000 * 60 * 60 * 24);
    const cycle = 29.53058867;
    const phasePos = (diffDays % cycle) / cycle;
    
    // Returning just the name, SVG rendering will be handled in frontend
    let moonPhase = '';
    if (phasePos < 0.05 || phasePos > 0.95) moonPhase = 'Nova';
    else if (phasePos < 0.30 && phasePos > 0.20) moonPhase = 'Crescente';
    else if (phasePos < 0.55 && phasePos > 0.45) moonPhase = 'Lua cheia';
    else if (phasePos < 0.80 && phasePos > 0.70) moonPhase = 'Minguante';

    days.push({
      date: new Date(d),
      dayOfWeek: d.getDay(),
      dayOfMonth: d.getDate(),
      month: d.getMonth(),
      year: d.getFullYear(),
      holiday: holidayName,
      moonPhase: moonPhase || undefined
    });
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

// Generates a grid for a specific month (used for mini calendars)
// Returns array of 6 weeks, each week array of 7 days (or null)
export const generateMonthGrid = (year: number, month: number): (number | null)[][] => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay(); // 0 = Sunday

    const grid: (number | null)[][] = [];
    let currentWeek: (number | null)[] = Array(7).fill(null);
    let currentDay = 1;

    // First week padding
    for (let i = startDayOfWeek; i < 7; i++) {
        currentWeek[i] = currentDay++;
    }
    grid.push(currentWeek);

    // Rest of weeks
    while (currentDay <= daysInMonth) {
        const week: (number | null)[] = Array(7).fill(null);
        for (let i = 0; i < 7 && currentDay <= daysInMonth; i++) {
            week[i] = currentDay++;
        }
        grid.push(week);
    }
    
    return grid;
};

export const getMonthName = (monthIndex: number): string => {
  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  return months[monthIndex];
};

export const getDayName = (dayIndex: number): string => {
  const days = [
    'Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira',
    'Quinta-feira', 'Sexta-feira', 'Sábado'
  ];
  return days[dayIndex];
};