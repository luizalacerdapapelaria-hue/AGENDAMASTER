
import { LayoutElement } from '../../../types';

export const WEEKLY_VERTICAL_LEFT: LayoutElement[] = [
    // Segunda
    {
        id: 'pv-l-1',
        type: 'planner_day_box',
        x: 0, y: 0, w: 32, h: 100, zIndex: 1,
        style: {
            plannerDayBox: {
                dayIndex: 1,
                contentStyle: 'lines',
                lineSpacing: 20,
                showDayNumber: false,
                showDayName: false,
                headerHeight: 10,
                headerBackgroundColor: '#f3f4f6'
            }
        }
    },
    {
        id: 'pv-l-1-num',
        type: 'day_number',
        x: 1, y: 1, w: 10, h: 8, zIndex: 2,
        style: { dayIndex: 1, fontSize: 18, fontWeight: 'bold', textAlign: 'left', color: '#374151' }
    },
    {
        id: 'pv-l-1-name',
        type: 'day_name',
        x: 9, y: 2, w: 18, h: 6, zIndex: 2,
        style: { dayIndex: 1, fontSize: 10, textAlign: 'left', textTransform: 'capitalize', color: '#6b7280' }
    },
    // Terça
    {
        id: 'pv-l-2',
        type: 'planner_day_box',
        x: 34, y: 0, w: 32, h: 100, zIndex: 1,
        style: {
            plannerDayBox: {
                dayIndex: 2,
                contentStyle: 'lines',
                lineSpacing: 20,
                showDayNumber: false,
                showDayName: false,
                headerHeight: 10,
                headerBackgroundColor: '#f3f4f6'
            }
        }
    },
    {
        id: 'pv-l-2-num',
        type: 'day_number',
        x: 35, y: 1, w: 10, h: 8, zIndex: 2,
        style: { dayIndex: 2, fontSize: 18, fontWeight: 'bold', textAlign: 'left', color: '#374151' }
    },
    {
        id: 'pv-l-2-name',
        type: 'day_name',
        x: 43, y: 2, w: 18, h: 6, zIndex: 2,
        style: { dayIndex: 2, fontSize: 10, textAlign: 'left', textTransform: 'capitalize', color: '#6b7280' }
    },
    // Quarta
    {
        id: 'pv-l-3',
        type: 'planner_day_box',
        x: 68, y: 0, w: 32, h: 100, zIndex: 1,
        style: {
            plannerDayBox: {
                dayIndex: 3,
                contentStyle: 'lines',
                lineSpacing: 20,
                showDayNumber: false,
                showDayName: false,
                headerHeight: 10,
                headerBackgroundColor: '#f3f4f6'
            }
        }
    },
    {
        id: 'pv-l-3-num',
        type: 'day_number',
        x: 69, y: 1, w: 10, h: 8, zIndex: 2,
        style: { dayIndex: 3, fontSize: 18, fontWeight: 'bold', textAlign: 'left', color: '#374151' }
    },
    {
        id: 'pv-l-3-name',
        type: 'day_name',
        x: 77, y: 2, w: 18, h: 6, zIndex: 2,
        style: { dayIndex: 3, fontSize: 10, textAlign: 'left', textTransform: 'capitalize', color: '#6b7280' }
    }
];

export const WEEKLY_VERTICAL_RIGHT: LayoutElement[] = [
    // Quinta
    {
        id: 'pv-r-1',
        type: 'planner_day_box',
        x: 0, y: 0, w: 32, h: 100, zIndex: 1,
        style: {
            plannerDayBox: {
                dayIndex: 4,
                contentStyle: 'lines',
                lineSpacing: 20,
                showDayNumber: false,
                showDayName: false,
                headerHeight: 10,
                headerBackgroundColor: '#f3f4f6'
            }
        }
    },
    {
        id: 'pv-r-1-num',
        type: 'day_number',
        x: 1, y: 1, w: 10, h: 8, zIndex: 2,
        style: { dayIndex: 4, fontSize: 18, fontWeight: 'bold', textAlign: 'left', color: '#374151' }
    },
    {
        id: 'pv-r-1-name',
        type: 'day_name',
        x: 9, y: 2, w: 18, h: 6, zIndex: 2,
        style: { dayIndex: 4, fontSize: 10, textAlign: 'left', textTransform: 'capitalize', color: '#6b7280' }
    },
    // Sexta
    {
        id: 'pv-r-2',
        type: 'planner_day_box',
        x: 34, y: 0, w: 32, h: 100, zIndex: 1,
        style: {
            plannerDayBox: {
                dayIndex: 5,
                contentStyle: 'lines',
                lineSpacing: 20,
                showDayNumber: false,
                showDayName: false,
                headerHeight: 10,
                headerBackgroundColor: '#f3f4f6'
            }
        }
    },
    {
        id: 'pv-r-2-num',
        type: 'day_number',
        x: 35, y: 1, w: 10, h: 8, zIndex: 2,
        style: { dayIndex: 5, fontSize: 18, fontWeight: 'bold', textAlign: 'left', color: '#374151' }
    },
    {
        id: 'pv-r-2-name',
        type: 'day_name',
        x: 43, y: 2, w: 18, h: 6, zIndex: 2,
        style: { dayIndex: 5, fontSize: 10, textAlign: 'left', textTransform: 'capitalize', color: '#6b7280' }
    },
    // Sábado
    {
        id: 'pv-r-3',
        type: 'planner_day_box',
        x: 68, y: 0, w: 32, h: 49, zIndex: 1,
        style: {
            plannerDayBox: {
                dayIndex: 6,
                contentStyle: 'lines',
                lineSpacing: 20,
                showDayNumber: false,
                showDayName: false,
                headerHeight: 20,
                headerBackgroundColor: '#fef3c7'
            }
        }
    },
    {
        id: 'pv-r-3-num',
        type: 'day_number',
        x: 69, y: 2, w: 10, h: 8, zIndex: 2,
        style: { dayIndex: 6, fontSize: 18, fontWeight: 'bold', textAlign: 'left', color: '#374151' }
    },
    {
        id: 'pv-r-3-name',
        type: 'day_name',
        x: 77, y: 3, w: 18, h: 6, zIndex: 2,
        style: { dayIndex: 6, fontSize: 10, textAlign: 'left', textTransform: 'capitalize', color: '#6b7280' }
    },
    // Domingo
    {
        id: 'pv-r-4',
        type: 'planner_day_box',
        x: 68, y: 51, w: 32, h: 49, zIndex: 1,
        style: {
            plannerDayBox: {
                dayIndex: 0,
                contentStyle: 'lines',
                lineSpacing: 20,
                showDayNumber: false,
                showDayName: false,
                headerHeight: 20,
                headerBackgroundColor: '#fee2e2'
            }
        }
    },
    {
        id: 'pv-r-4-num',
        type: 'day_number',
        x: 69, y: 53, w: 10, h: 8, zIndex: 2,
        style: { dayIndex: 0, fontSize: 18, fontWeight: 'bold', textAlign: 'left', color: '#374151' }
    },
    {
        id: 'pv-r-4-name',
        type: 'day_name',
        x: 77, y: 54, w: 18, h: 6, zIndex: 2,
        style: { dayIndex: 0, fontSize: 10, textAlign: 'left', textTransform: 'capitalize', color: '#6b7280' }
    }
];

export const WEEKLY_HORIZONTAL_LEFT: LayoutElement[] = [
    // Segunda
    {
        id: 'ph-l-1',
        type: 'planner_day_box',
        x: 0, y: 0, w: 100, h: 32, zIndex: 1,
        style: {
            plannerDayBox: {
                dayIndex: 1,
                contentStyle: 'lines',
                lineSpacing: 20,
                showDayNumber: false,
                showDayName: false,
                headerHeight: 20,
                headerBackgroundColor: '#f3f4f6'
            }
        }
    },
    {
        id: 'ph-l-1-num',
        type: 'day_number',
        x: 2, y: 2, w: 10, h: 8, zIndex: 2,
        style: { dayIndex: 1, fontSize: 18, fontWeight: 'bold', textAlign: 'left', color: '#374151' }
    },
    {
        id: 'ph-l-1-name',
        type: 'day_name',
        x: 10, y: 3, w: 18, h: 6, zIndex: 2,
        style: { dayIndex: 1, fontSize: 10, textAlign: 'left', textTransform: 'capitalize', color: '#6b7280' }
    },
    // Terça
    {
        id: 'ph-l-2',
        type: 'planner_day_box',
        x: 0, y: 34, w: 100, h: 32, zIndex: 1,
        style: {
            plannerDayBox: {
                dayIndex: 2,
                contentStyle: 'lines',
                lineSpacing: 20,
                showDayNumber: false,
                showDayName: false,
                headerHeight: 20,
                headerBackgroundColor: '#f3f4f6'
            }
        }
    },
    {
        id: 'ph-l-2-num',
        type: 'day_number',
        x: 2, y: 36, w: 10, h: 8, zIndex: 2,
        style: { dayIndex: 2, fontSize: 18, fontWeight: 'bold', textAlign: 'left', color: '#374151' }
    },
    {
        id: 'ph-l-2-name',
        type: 'day_name',
        x: 10, y: 37, w: 18, h: 6, zIndex: 2,
        style: { dayIndex: 2, fontSize: 10, textAlign: 'left', textTransform: 'capitalize', color: '#6b7280' }
    },
    // Quarta
    {
        id: 'ph-l-3',
        type: 'planner_day_box',
        x: 0, y: 68, w: 100, h: 32, zIndex: 1,
        style: {
            plannerDayBox: {
                dayIndex: 3,
                contentStyle: 'lines',
                lineSpacing: 20,
                showDayNumber: false,
                showDayName: false,
                headerHeight: 20,
                headerBackgroundColor: '#f3f4f6'
            }
        }
    },
    {
        id: 'ph-l-3-num',
        type: 'day_number',
        x: 2, y: 70, w: 10, h: 8, zIndex: 2,
        style: { dayIndex: 3, fontSize: 18, fontWeight: 'bold', textAlign: 'left', color: '#374151' }
    },
    {
        id: 'ph-l-3-name',
        type: 'day_name',
        x: 10, y: 71, w: 18, h: 6, zIndex: 2,
        style: { dayIndex: 3, fontSize: 10, textAlign: 'left', textTransform: 'capitalize', color: '#6b7280' }
    }
];

export const WEEKLY_HORIZONTAL_RIGHT: LayoutElement[] = [
    // Quinta
    {
        id: 'ph-r-4',
        type: 'planner_day_box',
        x: 0, y: 0, w: 100, h: 24, zIndex: 1,
        style: {
            plannerDayBox: {
                dayIndex: 4,
                contentStyle: 'lines',
                lineSpacing: 20,
                showDayNumber: false,
                showDayName: false,
                headerHeight: 20,
                headerBackgroundColor: '#f3f4f6'
            }
        }
    },
    {
        id: 'ph-r-4-num',
        type: 'day_number',
        x: 2, y: 2, w: 10, h: 8, zIndex: 2,
        style: { dayIndex: 4, fontSize: 18, fontWeight: 'bold', textAlign: 'left', color: '#374151' }
    },
    {
        id: 'ph-r-4-name',
        type: 'day_name',
        x: 10, y: 3, w: 18, h: 6, zIndex: 2,
        style: { dayIndex: 4, fontSize: 10, textAlign: 'left', textTransform: 'capitalize', color: '#6b7280' }
    },
    // Sexta
    {
        id: 'ph-r-5',
        type: 'planner_day_box',
        x: 0, y: 26, w: 100, h: 24, zIndex: 1,
        style: {
            plannerDayBox: {
                dayIndex: 5,
                contentStyle: 'lines',
                lineSpacing: 20,
                showDayNumber: false,
                showDayName: false,
                headerHeight: 20,
                headerBackgroundColor: '#f3f4f6'
            }
        }
    },
    {
        id: 'ph-r-5-num',
        type: 'day_number',
        x: 2, y: 28, w: 10, h: 8, zIndex: 2,
        style: { dayIndex: 5, fontSize: 18, fontWeight: 'bold', textAlign: 'left', color: '#374151' }
    },
    {
        id: 'ph-r-5-name',
        type: 'day_name',
        x: 10, y: 29, w: 18, h: 6, zIndex: 2,
        style: { dayIndex: 5, fontSize: 10, textAlign: 'left', textTransform: 'capitalize', color: '#6b7280' }
    },
    // Sábado
    {
        id: 'ph-r-6',
        type: 'planner_day_box',
        x: 0, y: 52, w: 100, h: 23, zIndex: 1,
        style: {
            plannerDayBox: {
                dayIndex: 6,
                contentStyle: 'lines',
                lineSpacing: 20,
                showDayNumber: false,
                showDayName: false,
                headerHeight: 20,
                headerBackgroundColor: '#fee2e2'
            }
        }
    },
    {
        id: 'ph-r-6-num',
        type: 'day_number',
        x: 2, y: 54, w: 10, h: 8, zIndex: 2,
        style: { dayIndex: 6, fontSize: 18, fontWeight: 'bold', textAlign: 'left', color: '#374151' }
    },
    {
        id: 'ph-r-6-name',
        type: 'day_name',
        x: 10, y: 55, w: 18, h: 6, zIndex: 2,
        style: { dayIndex: 6, fontSize: 10, textAlign: 'left', textTransform: 'capitalize', color: '#6b7280' }
    },
    // Domingo
    {
        id: 'ph-r-7',
        type: 'planner_day_box',
        x: 0, y: 77, w: 100, h: 23, zIndex: 1,
        style: {
            plannerDayBox: {
                dayIndex: 0,
                contentStyle: 'lines',
                lineSpacing: 20,
                showDayNumber: false,
                showDayName: false,
                headerHeight: 20,
                headerBackgroundColor: '#fee2e2'
            }
        }
    },
    {
        id: 'ph-r-7-num',
        type: 'day_number',
        x: 2, y: 79, w: 10, h: 8, zIndex: 2,
        style: { dayIndex: 0, fontSize: 18, fontWeight: 'bold', textAlign: 'left', color: '#374151' }
    },
    {
        id: 'ph-r-7-name',
        type: 'day_name',
        x: 10, y: 80, w: 18, h: 6, zIndex: 2,
        style: { dayIndex: 0, fontSize: 10, textAlign: 'left', textTransform: 'capitalize', color: '#6b7280' }
    }
];

export const WEEKLY_ONE_PAGE_VERTICAL: LayoutElement[] = [
    // Segunda
    {
        id: 'p1v-1',
        type: 'planner_day_box',
        x: 0, y: 0, w: 15.6, h: 100, zIndex: 1,
        style: {
            plannerDayBox: {
                dayIndex: 1,
                contentStyle: 'lines',
                lineSpacing: 18,
                showDayNumber: false,
                showDayName: false,
                headerHeight: 12,
                headerBackgroundColor: '#f3f4f6'
            }
        }
    },
    {
        id: 'p1v-1-num',
        type: 'day_number',
        x: 0.5, y: 1, w: 14.6, h: 6, zIndex: 2,
        style: { dayIndex: 1, fontSize: 16, fontWeight: 'bold', textAlign: 'center', color: '#374151' }
    },
    {
        id: 'p1v-1-name',
        type: 'day_name',
        x: 0.5, y: 6.5, w: 14.6, h: 5, zIndex: 2,
        style: { dayIndex: 1, fontSize: 9, fontWeight: 'bold', textAlign: 'center', textTransform: 'capitalize', color: '#6b7280' }
    },
    // Terça
    {
        id: 'p1v-2',
        type: 'planner_day_box',
        x: 16.8, y: 0, w: 15.6, h: 100, zIndex: 1,
        style: {
            plannerDayBox: {
                dayIndex: 2,
                contentStyle: 'lines',
                lineSpacing: 18,
                showDayNumber: false,
                showDayName: false,
                headerHeight: 12,
                headerBackgroundColor: '#f3f4f6'
            }
        }
    },
    {
        id: 'p1v-2-num',
        type: 'day_number',
        x: 17.3, y: 1, w: 14.6, h: 6, zIndex: 2,
        style: { dayIndex: 2, fontSize: 16, fontWeight: 'bold', textAlign: 'center', color: '#374151' }
    },
    {
        id: 'p1v-2-name',
        type: 'day_name',
        x: 17.3, y: 6.5, w: 14.6, h: 5, zIndex: 2,
        style: { dayIndex: 2, fontSize: 9, fontWeight: 'bold', textAlign: 'center', textTransform: 'capitalize', color: '#6b7280' }
    },
    // Quarta
    {
        id: 'p1v-3',
        type: 'planner_day_box',
        x: 33.6, y: 0, w: 15.6, h: 100, zIndex: 1,
        style: {
            plannerDayBox: {
                dayIndex: 3,
                contentStyle: 'lines',
                lineSpacing: 18,
                showDayNumber: false,
                showDayName: false,
                headerHeight: 12,
                headerBackgroundColor: '#f3f4f6'
            }
        }
    },
    {
        id: 'p1v-3-num',
        type: 'day_number',
        x: 34.1, y: 1, w: 14.6, h: 6, zIndex: 2,
        style: { dayIndex: 3, fontSize: 16, fontWeight: 'bold', textAlign: 'center', color: '#374151' }
    },
    {
        id: 'p1v-3-name',
        type: 'day_name',
        x: 34.1, y: 6.5, w: 14.6, h: 5, zIndex: 2,
        style: { dayIndex: 3, fontSize: 9, fontWeight: 'bold', textAlign: 'center', textTransform: 'capitalize', color: '#6b7280' }
    },
    // Quinta
    {
        id: 'p1v-4',
        type: 'planner_day_box',
        x: 50.4, y: 0, w: 15.6, h: 100, zIndex: 1,
        style: {
            plannerDayBox: {
                dayIndex: 4,
                contentStyle: 'lines',
                lineSpacing: 18,
                showDayNumber: false,
                showDayName: false,
                headerHeight: 12,
                headerBackgroundColor: '#f3f4f6'
            }
        }
    },
    {
        id: 'p1v-4-num',
        type: 'day_number',
        x: 50.9, y: 1, w: 14.6, h: 6, zIndex: 2,
        style: { dayIndex: 4, fontSize: 16, fontWeight: 'bold', textAlign: 'center', color: '#374151' }
    },
    {
        id: 'p1v-4-name',
        type: 'day_name',
        x: 50.9, y: 6.5, w: 14.6, h: 5, zIndex: 2,
        style: { dayIndex: 4, fontSize: 9, fontWeight: 'bold', textAlign: 'center', textTransform: 'capitalize', color: '#6b7280' }
    },
    // Sexta
    {
        id: 'p1v-5',
        type: 'planner_day_box',
        x: 67.2, y: 0, w: 15.6, h: 100, zIndex: 1,
        style: {
            plannerDayBox: {
                dayIndex: 5,
                contentStyle: 'lines',
                lineSpacing: 18,
                showDayNumber: false,
                showDayName: false,
                headerHeight: 12,
                headerBackgroundColor: '#f3f4f6'
            }
        }
    },
    {
        id: 'p1v-5-num',
        type: 'day_number',
        x: 67.7, y: 1, w: 14.6, h: 6, zIndex: 2,
        style: { dayIndex: 5, fontSize: 16, fontWeight: 'bold', textAlign: 'center', color: '#374151' }
    },
    {
        id: 'p1v-5-name',
        type: 'day_name',
        x: 67.7, y: 6.5, w: 14.6, h: 5, zIndex: 2,
        style: { dayIndex: 5, fontSize: 9, fontWeight: 'bold', textAlign: 'center', textTransform: 'capitalize', color: '#6b7280' }
    },
    // Sábado (Metade superior da 6ª coluna)
    {
        id: 'p1v-6',
        type: 'planner_day_box',
        x: 84.0, y: 0, w: 16.0, h: 49.2, zIndex: 1,
        style: {
            plannerDayBox: {
                dayIndex: 6,
                contentStyle: 'lines',
                lineSpacing: 18,
                showDayNumber: false,
                showDayName: false,
                headerHeight: 12,
                headerBackgroundColor: '#fef3c7'
            }
        }
    },
    {
        id: 'p1v-6-num',
        type: 'day_number',
        x: 84.5, y: 1, w: 15.0, h: 6, zIndex: 2,
        style: { dayIndex: 6, fontSize: 16, fontWeight: 'bold', textAlign: 'center', color: '#374151' }
    },
    {
        id: 'p1v-6-name',
        type: 'day_name',
        x: 84.5, y: 6.5, w: 15.0, h: 5, zIndex: 2,
        style: { dayIndex: 6, fontSize: 9, fontWeight: 'bold', textAlign: 'center', textTransform: 'capitalize', color: '#6b7280' }
    },
    // Domingo (Metade inferior da 6ª coluna)
    {
        id: 'p1v-7',
        type: 'planner_day_box',
        x: 84.0, y: 50.8, w: 16.0, h: 49.2, zIndex: 1,
        style: {
            plannerDayBox: {
                dayIndex: 0,
                contentStyle: 'lines',
                lineSpacing: 18,
                showDayNumber: false,
                showDayName: false,
                headerHeight: 12,
                headerBackgroundColor: '#fee2e2'
            }
        }
    },
    {
        id: 'p1v-7-num',
        type: 'day_number',
        x: 84.5, y: 51.8, w: 15.0, h: 6, zIndex: 2,
        style: { dayIndex: 0, fontSize: 16, fontWeight: 'bold', textAlign: 'center', color: '#374151' }
    },
    {
        id: 'p1v-7-name',
        type: 'day_name',
        x: 84.5, y: 57.3, w: 15.0, h: 5, zIndex: 2,
        style: { dayIndex: 0, fontSize: 9, fontWeight: 'bold', textAlign: 'center', textTransform: 'capitalize', color: '#6b7280' }
    }
];

export const WEEKLY_ONE_PAGE_HORIZONTAL: LayoutElement[] = [
    // Segunda
    {
        id: 'p1h-1',
        type: 'planner_day_box',
        x: 0, y: 0, w: 100, h: 15, zIndex: 1,
        style: {
            plannerDayBox: {
                dayIndex: 1,
                contentStyle: 'lines',
                lineSpacing: 18,
                showDayNumber: false,
                showDayName: false,
                headerHeight: 25,
                headerBackgroundColor: '#f3f4f6'
            }
        }
    },
    {
        id: 'p1h-1-num',
        type: 'day_number',
        x: 2, y: 1, w: 10, h: 8, zIndex: 2,
        style: { dayIndex: 1, fontSize: 16, fontWeight: 'bold', textAlign: 'left', color: '#374151' }
    },
    {
        id: 'p1h-1-name',
        type: 'day_name',
        x: 10, y: 2, w: 25, h: 6, zIndex: 2,
        style: { dayIndex: 1, fontSize: 10, fontWeight: 'bold', textAlign: 'left', textTransform: 'capitalize', color: '#6b7280' }
    },
    // Terça
    {
        id: 'p1h-2',
        type: 'planner_day_box',
        x: 0, y: 17, w: 100, h: 15, zIndex: 1,
        style: {
            plannerDayBox: {
                dayIndex: 2,
                contentStyle: 'lines',
                lineSpacing: 18,
                showDayNumber: false,
                showDayName: false,
                headerHeight: 25,
                headerBackgroundColor: '#f3f4f6'
            }
        }
    },
    {
        id: 'p1h-2-num',
        type: 'day_number',
        x: 2, y: 18, w: 10, h: 8, zIndex: 2,
        style: { dayIndex: 2, fontSize: 16, fontWeight: 'bold', textAlign: 'left', color: '#374151' }
    },
    {
        id: 'p1h-2-name',
        type: 'day_name',
        x: 10, y: 19, w: 25, h: 6, zIndex: 2,
        style: { dayIndex: 2, fontSize: 10, fontWeight: 'bold', textAlign: 'left', textTransform: 'capitalize', color: '#6b7280' }
    },
    // Quarta
    {
        id: 'p1h-3',
        type: 'planner_day_box',
        x: 0, y: 34, w: 100, h: 15, zIndex: 1,
        style: {
            plannerDayBox: {
                dayIndex: 3,
                contentStyle: 'lines',
                lineSpacing: 18,
                showDayNumber: false,
                showDayName: false,
                headerHeight: 25,
                headerBackgroundColor: '#f3f4f6'
            }
        }
    },
    {
        id: 'p1h-3-num',
        type: 'day_number',
        x: 2, y: 35, w: 10, h: 8, zIndex: 2,
        style: { dayIndex: 3, fontSize: 16, fontWeight: 'bold', textAlign: 'left', color: '#374151' }
    },
    {
        id: 'p1h-3-name',
        type: 'day_name',
        x: 10, y: 36, w: 25, h: 6, zIndex: 2,
        style: { dayIndex: 3, fontSize: 10, fontWeight: 'bold', textAlign: 'left', textTransform: 'capitalize', color: '#6b7280' }
    },
    // Quinta
    {
        id: 'p1h-4',
        type: 'planner_day_box',
        x: 0, y: 51, w: 100, h: 15, zIndex: 1,
        style: {
            plannerDayBox: {
                dayIndex: 4,
                contentStyle: 'lines',
                lineSpacing: 18,
                showDayNumber: false,
                showDayName: false,
                headerHeight: 25,
                headerBackgroundColor: '#f3f4f6'
            }
        }
    },
    {
        id: 'p1h-4-num',
        type: 'day_number',
        x: 2, y: 52, w: 10, h: 8, zIndex: 2,
        style: { dayIndex: 4, fontSize: 16, fontWeight: 'bold', textAlign: 'left', color: '#374151' }
    },
    {
        id: 'p1h-4-name',
        type: 'day_name',
        x: 10, y: 53, w: 25, h: 6, zIndex: 2,
        style: { dayIndex: 4, fontSize: 10, fontWeight: 'bold', textAlign: 'left', textTransform: 'capitalize', color: '#6b7280' }
    },
    // Sexta
    {
        id: 'p1h-5',
        type: 'planner_day_box',
        x: 0, y: 68, w: 100, h: 15, zIndex: 1,
        style: {
            plannerDayBox: {
                dayIndex: 5,
                contentStyle: 'lines',
                lineSpacing: 18,
                showDayNumber: false,
                showDayName: false,
                headerHeight: 25,
                headerBackgroundColor: '#f3f4f6'
            }
        }
    },
    {
        id: 'p1h-5-num',
        type: 'day_number',
        x: 2, y: 69, w: 10, h: 8, zIndex: 2,
        style: { dayIndex: 5, fontSize: 16, fontWeight: 'bold', textAlign: 'left', color: '#374151' }
    },
    {
        id: 'p1h-5-name',
        type: 'day_name',
        x: 10, y: 70, w: 25, h: 6, zIndex: 2,
        style: { dayIndex: 5, fontSize: 10, fontWeight: 'bold', textAlign: 'left', textTransform: 'capitalize', color: '#6b7280' }
    },
    // Sábado
    {
        id: 'p1h-6',
        type: 'planner_day_box',
        x: 0, y: 85, w: 49, h: 15, zIndex: 1,
        style: {
            plannerDayBox: {
                dayIndex: 6,
                contentStyle: 'lines',
                lineSpacing: 18,
                showDayNumber: false,
                showDayName: false,
                headerHeight: 25,
                headerBackgroundColor: '#fef3c7'
            }
        }
    },
    {
        id: 'p1h-6-num',
        type: 'day_number',
        x: 2, y: 86, w: 10, h: 8, zIndex: 2,
        style: { dayIndex: 6, fontSize: 16, fontWeight: 'bold', textAlign: 'left', color: '#374151' }
    },
    {
        id: 'p1h-6-name',
        type: 'day_name',
        x: 10, y: 87, w: 25, h: 6, zIndex: 2,
        style: { dayIndex: 6, fontSize: 10, fontWeight: 'bold', textAlign: 'left', textTransform: 'capitalize', color: '#6b7280' }
    },
    // Domingo
    {
        id: 'p1h-7',
        type: 'planner_day_box',
        x: 51, y: 85, w: 49, h: 15, zIndex: 1,
        style: {
            plannerDayBox: {
                dayIndex: 0,
                contentStyle: 'lines',
                lineSpacing: 18,
                showDayNumber: false,
                showDayName: false,
                headerHeight: 25,
                headerBackgroundColor: '#fee2e2'
            }
        }
    },
    {
        id: 'p1h-7-num',
        type: 'day_number',
        x: 52, y: 86, w: 10, h: 8, zIndex: 2,
        style: { dayIndex: 0, fontSize: 16, fontWeight: 'bold', textAlign: 'left', color: '#374151' }
    },
    {
        id: 'p1h-7-name',
        type: 'day_name',
        x: 60, y: 87, w: 25, h: 6, zIndex: 2,
        style: { dayIndex: 0, fontSize: 10, fontWeight: 'bold', textAlign: 'left', textTransform: 'capitalize', color: '#6b7280' }
    }
];

