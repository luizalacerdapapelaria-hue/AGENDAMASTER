
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
        id: 'ph-r-1',
        type: 'planner_day_box',
        x: 0, y: 0, w: 100, h: 32, zIndex: 1,
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
        id: 'ph-r-1-num',
        type: 'day_number',
        x: 2, y: 2, w: 10, h: 8, zIndex: 2,
        style: { dayIndex: 4, fontSize: 18, fontWeight: 'bold', textAlign: 'left', color: '#374151' }
    },
    {
        id: 'ph-r-1-name',
        type: 'day_name',
        x: 10, y: 3, w: 18, h: 6, zIndex: 2,
        style: { dayIndex: 4, fontSize: 10, textAlign: 'left', textTransform: 'capitalize', color: '#6b7280' }
    },
    // Sexta
    {
        id: 'ph-r-2',
        type: 'planner_day_box',
        x: 0, y: 34, w: 100, h: 32, zIndex: 1,
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
        id: 'ph-r-2-num',
        type: 'day_number',
        x: 2, y: 36, w: 10, h: 8, zIndex: 2,
        style: { dayIndex: 5, fontSize: 18, fontWeight: 'bold', textAlign: 'left', color: '#374151' }
    },
    {
        id: 'ph-r-2-name',
        type: 'day_name',
        x: 10, y: 37, w: 18, h: 6, zIndex: 2,
        style: { dayIndex: 5, fontSize: 10, textAlign: 'left', textTransform: 'capitalize', color: '#6b7280' }
    },
    // Sábado
    {
        id: 'ph-r-3',
        type: 'planner_day_box',
        x: 0, y: 68, w: 49, h: 32, zIndex: 1,
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
        id: 'ph-r-3-num',
        type: 'day_number',
        x: 2, y: 70, w: 10, h: 8, zIndex: 2,
        style: { dayIndex: 6, fontSize: 18, fontWeight: 'bold', textAlign: 'left', color: '#374151' }
    },
    {
        id: 'ph-r-3-name',
        type: 'day_name',
        x: 10, y: 71, w: 18, h: 6, zIndex: 2,
        style: { dayIndex: 6, fontSize: 10, textAlign: 'left', textTransform: 'capitalize', color: '#6b7280' }
    },
    // Domingo
    {
        id: 'ph-r-4',
        type: 'planner_day_box',
        x: 51, y: 68, w: 49, h: 32, zIndex: 1,
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
        id: 'ph-r-4-num',
        type: 'day_number',
        x: 53, y: 70, w: 10, h: 8, zIndex: 2,
        style: { dayIndex: 0, fontSize: 18, fontWeight: 'bold', textAlign: 'left', color: '#374151' }
    },
    {
        id: 'ph-r-4-name',
        type: 'day_name',
        x: 61, y: 71, w: 18, h: 6, zIndex: 2,
        style: { dayIndex: 0, fontSize: 10, textAlign: 'left', textTransform: 'capitalize', color: '#6b7280' }
    }
];
