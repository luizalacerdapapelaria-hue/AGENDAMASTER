
import React from 'react';
import { Moon, Circle } from 'lucide-react';
import { LayoutElement, DayData } from '../../../../types';
import { getMonthName } from '../../../../core/backend/calendar';

interface PlannerDayBoxProps {
    element: LayoutElement;
    dayData: DayData; // This will be the specific day for this box
    isEditor: boolean;
    pageWidth: number;
    pageHeight: number;
}

export const PlannerDayBox: React.FC<PlannerDayBoxProps> = ({ element, dayData, isEditor, pageWidth, pageHeight }) => {
    const scaleFactor = pageWidth / 400;
    const { plannerDayBox } = element.style;
    if (!plannerDayBox) return null;

    const renderMoonIcon = (phase: string, color: string) => {
        const p = phase.toLowerCase();
        if (p.includes('nova')) return <Circle color={color} className="w-full h-full" strokeWidth={1.5} />;
        if (p.includes('cheia')) return <Circle color={color} fill={color} className="w-full h-full" />;
        
        // Crescente (Waxing - Southern Hemisphere looks like '(')
        // Lucide Moon by default looks like ')' which is Waning in Southern Hemisphere.
        if (p.includes('crescente')) return <Moon color={color} fill={color} className="w-full h-full -scale-x-100" />;
        
        // Minguante (Waning - Southern Hemisphere looks like ')')
        if (p.includes('minguante')) return <Moon color={color} fill={color} className="w-full h-full" />;
        
        return <Circle color={color} className="w-full h-full" strokeWidth={1.5} />;
    };

    const d = (dayData || { dayOfMonth: 20, month: 0, dayOfWeek: 1, year: 2025 }) as DayData;

    const { 
        contentStyle, 
        lineSpacing = 20, 
        gridSpacing = 20, 
        showDayNumber = true, 
        showDayName = true,
        dayNameCase = 'capitalize',
        headerHeight = 15,
        headerBackgroundColor = '#f9fafb',
        headerTextColor = '#374151',
        showHeaderBorder = true,
        headerBorderColor = '#e5e7eb',
        headerBorderWidth = 1,
        headerBorderStyle = 'solid',
        strokeColor = '#e5e7eb',
        strokeWidth = 0.5,
        strokeStyle = 'solid'
    } = plannerDayBox;

    const dashArray = strokeStyle === 'dashed' ? '2,2' : (strokeStyle === 'dotted' ? '0.5,1.5' : 'none');

    const dayNames = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    let dayName = dayNames[d.dayOfWeek];
    
    if (dayNameCase === 'uppercase') dayName = dayName.toUpperCase();
    if (dayNameCase === 'lowercase') dayName = dayName.toLowerCase();

    const renderBackground = () => {
        // Subtract border width (1px on each side = 2px total)
        const boxWidth = Math.max(1, (pageWidth * (element.w / 100)) - 2);
        const boxHeight = Math.max(1, (pageHeight * (element.h / 100)) - 2);
        const headerH = (headerHeight / 100) * boxHeight;
        const contentHeight = Math.max(1, boxHeight - headerH);

        // Note: The SVG is rendered inside a flex-1 div, so y=0 is already at the bottom of the header.
        // We don't need to add startY to our coordinates.

        if (contentStyle === 'lines') {
            const lines = [];
            const spacing = Math.max(5, (lineSpacing / 100) * 100); // Guard against too small spacing
            const rows = Math.max(1, Math.round(contentHeight / spacing));
            const actualSpacing = contentHeight / rows;

            for (let i = 0; i <= rows; i++) {
                const y = i * actualSpacing;
                lines.push(<line key={i} x1="0" y1={y} x2="100%" y2={y} stroke={strokeColor} strokeWidth={strokeWidth} strokeDasharray={dashArray} style={{ vectorEffect: 'non-scaling-stroke' }} />);
            }
            return <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox={`0 0 ${boxWidth} ${contentHeight}`} preserveAspectRatio="none">{lines}</svg>;
        }

        if (contentStyle === 'dots') {
            const dots = [];
            const spacing = Math.max(5, (gridSpacing / 100) * 100);
            const cols = Math.max(1, Math.round(boxWidth / spacing));
            const rows = Math.max(1, Math.round(contentHeight / spacing));
            
            const actualSpacingX = boxWidth / cols;
            const actualSpacingY = contentHeight / rows;

            // Increased radius for visibility, especially on high-dpi screens or pixel-based viewBox
            const dotRadius = Math.max(0.6, strokeWidth);

            for (let ix = 0; ix <= cols; ix++) {
                for (let iy = 0; iy <= rows; iy++) {
                    const x = ix * actualSpacingX;
                    const y = iy * actualSpacingY;
                    dots.push(<circle key={`${ix}-${iy}`} cx={x} cy={y} r={dotRadius} fill={strokeColor} />);
                }
            }
            return <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox={`0 0 ${boxWidth} ${contentHeight}`} preserveAspectRatio="none">{dots}</svg>;
        }

        if (contentStyle === 'grid') {
            const lines = [];
            const spacing = Math.max(5, (gridSpacing / 100) * 100);
            const cols = Math.max(1, Math.round(boxWidth / spacing));
            const rows = Math.max(1, Math.round(contentHeight / spacing));
            
            const actualSpacingX = boxWidth / cols;
            const actualSpacingY = contentHeight / rows;

            // Vertical lines
            for (let i = 0; i <= cols; i++) {
                const x = i * actualSpacingX;
                lines.push(<line key={`v-${i}`} x1={x} y1="0" x2={x} y2="100%" stroke={strokeColor} strokeWidth={strokeWidth} strokeDasharray={dashArray} style={{ vectorEffect: 'non-scaling-stroke' }} />);
            }
            // Horizontal lines
            for (let i = 0; i <= rows; i++) {
                const y = i * actualSpacingY;
                lines.push(<line key={`h-${i}`} x1="0" y1={y} x2="100%" y2={y} stroke={strokeColor} strokeWidth={strokeWidth} strokeDasharray={dashArray} style={{ vectorEffect: 'non-scaling-stroke' }} />);
            }
            return <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox={`0 0 ${boxWidth} ${contentHeight}`} preserveAspectRatio="none">{lines}</svg>;
        }

        if (contentStyle === 'timetable') {
            const lines = [];
            const labels = [];
            const startH = plannerDayBox.startHour ?? 7;
            const spacing = Math.max(5, (lineSpacing / 100) * 100);
            const rows = Math.max(1, Math.round(contentHeight / spacing));
            const actualSpacing = contentHeight / rows;

            for (let i = 0; i <= rows; i++) {
                const y = i * actualSpacing;
                lines.push(<line key={`l-${i}`} x1="0" y1={y} x2="100%" y2={y} stroke={strokeColor} strokeWidth={strokeWidth} strokeDasharray={dashArray} style={{ vectorEffect: 'non-scaling-stroke' }} />);
                if (i < rows) {
                    labels.push(
                        <div 
                            key={`t-${i}`} 
                            className="absolute left-0.5 select-none pointer-events-none"
                            style={{ 
                                top: `${y + 1}px`, 
                                transform: 'translateY(0%)', 
                                fontFamily: plannerDayBox.fontFamily || 'monospace',
                                fontSize: plannerDayBox.fontSize !== undefined ? `${plannerDayBox.fontSize * scaleFactor}px` : `${Math.max(4, 8 * scaleFactor)}px`,
                                fontWeight: plannerDayBox.fontWeight || 'normal',
                                color: plannerDayBox.color || '#9ca3af'
                            }}
                        >
                            {String(startH + i).padStart(2, '0')}:00
                        </div>
                    );
                }
            }
            return (
                <div className="absolute inset-0 w-full h-full">
                    <svg className="w-full h-full pointer-events-none" viewBox={`0 0 ${boxWidth} ${contentHeight}`} preserveAspectRatio="none">{lines}</svg>
                    {labels}
                </div>
            );
        }

        return null;
    };

    return (
        <div 
            className="w-full h-full flex flex-col overflow-visible" 
            style={{ 
                borderRadius: element.style.borderRadius,
                backgroundColor: element.style.backgroundColor || 'white',
                borderWidth: element.style.borderWidth ?? 1,
                borderColor: element.style.borderColor || '#e5e7eb',
                borderStyle: element.style.borderStyle || 'solid'
            }}
        >
            {/* Header */}
            <div 
                className="flex items-center px-2 gap-2 shrink-0" 
                style={{ 
                    height: `${headerHeight}%`, 
                    backgroundColor: headerBackgroundColor,
                    borderBottom: showHeaderBorder ? `${headerBorderWidth}px ${headerBorderStyle} ${headerBorderColor}` : 'none'
                }}
            >
                {showDayNumber && d.dayOfMonth > 0 && (
                    <span className="font-bold text-lg" style={{ color: headerTextColor, fontSize: `${Math.max(6, 18 * scaleFactor)}px` }}>
                        {String(d.dayOfMonth).padStart(2, '0')}
                    </span>
                )}
                {showDayName && d.dayOfMonth > 0 && (
                    <span className="font-medium opacity-70" style={{ color: headerTextColor, fontSize: `${Math.max(5, 10 * scaleFactor)}px` }}>
                        {dayName}
                    </span>
                )}
                {d.holiday && d.dayOfMonth > 0 && (
                    <div className="ml-auto text-red-400 font-medium truncate max-w-[50%]" style={{ fontSize: `${Math.max(4, 8 * scaleFactor)}px` }}>
                        {d.holiday}
                    </div>
                )}
                {plannerDayBox.showMoonPhase && d.moonPhase && (
                    <div className={`flex items-center gap-1 ${d.holiday ? 'ml-2' : 'ml-auto'}`}>
                        <div className="w-3.5 h-3.5 shrink-0 flex items-center justify-center">
                            {renderMoonIcon(d.moonPhase, headerTextColor)}
                        </div>
                        <span className="opacity-60 truncate" style={{ color: headerTextColor, fontSize: `${Math.max(4, 8 * scaleFactor)}px` }}>{d.moonPhase}</span>
                    </div>
                )}
            </div>

            {/* Content Area */}
            <div className="flex-1 relative">
                {renderBackground()}
            </div>
        </div>
    );
};
