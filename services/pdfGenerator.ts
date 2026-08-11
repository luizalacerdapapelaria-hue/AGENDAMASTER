
import { jsPDF } from "jspdf";
import { AgendaConfig, DayData, LayoutElement } from "../types";
import { getMonthName, getDayName } from "../core/backend/calendar";
import { getVerseForDay } from "../core/constants/verses";
import { ImageManager } from "../modules/editor/utils/imageManager";

const hexToRgb = (hex: string): { r: number, g: number, b: number } | null => {
  if (!hex || hex === 'transparent') return null;
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } : null;
};

const getFont = (fontName: string | undefined, weight: string | number | undefined) => {
    let style = 'normal';
    if (weight === 'bold' || (typeof weight === 'number' && weight > 600)) style = 'bold';
    if (fontName?.includes('Playfair') || fontName?.includes('Merriweather')) return { font: 'times', style };
    if (fontName?.includes('Courier') || fontName?.includes('Mono')) return { font: 'courier', style };
    return { font: 'helvetica', style };
};

const renderElementToPDF = (doc: jsPDF, el: LayoutElement, day: DayData | null, quote: string | undefined, verse: string | undefined, safeAreaW: number, safeAreaH: number, offsetX: number, offsetY: number) => {
    const { x, y, w, h, style } = el;
    const absX = (x / 100) * safeAreaW + offsetX;
    const absY = (y / 100) * safeAreaH + offsetY;
    const absW = (w / 100) * safeAreaW;
    const absH = (h / 100) * safeAreaH;

    const rgb = hexToRgb(style.color || '#000000') || { r: 0, g: 0, b: 0 };
    
    // Gradient Handling: Fallback to the first color for PDF stability
    let bgRgb = style.backgroundColor ? hexToRgb(style.backgroundColor) : null;
    if (el.type === 'box' && style.backgroundType === 'gradient' && style.gradientColors && style.gradientColors[0]) {
        bgRgb = hexToRgb(style.gradientColors[0]);
    }

    const fontConfig = getFont(style.fontFamily, style.fontWeight);
    doc.setTextColor(rgb.r, rgb.g, rgb.b);
    doc.setFont(fontConfig.font, fontConfig.style);
    doc.setFontSize(style.fontSize || 12); 

    let text = '';
    if (el.type === 'text') text = el.content || 'Texto';
    if (el.type === 'day_number' && day) text = day.dayOfMonth.toString();
    if (el.type === 'day_name' && day) text = getDayName(day.dayOfWeek);
    if (el.type === 'month_name' && day) text = getMonthName(day.month);
    if (el.type === 'year' && day) text = day.year.toString();
    if (el.type === 'quote') text = quote || '';
    if (el.type === 'verse') text = verse || '';
    if (el.type === 'holiday' && day) text = day.holiday || '';
    if (el.type === 'holiday_list') text = el.content || '';

    // --- RENDER LOGIC ---

    // Box/Circle Special Rendering (Shadows & Fills)
    if (el.type === 'box' || el.type === 'circle') {
        
        // 1. Draw Shadow (Simulated)
        if (style.boxShadow && style.boxShadow !== 'none') {
            const shadowOffset = style.boxShadow === 'sm' ? 0.5 : style.boxShadow === 'md' ? 1.0 : 2.0; // mm
            const shadowColor = { r: 200, g: 200, b: 200 };
            doc.setFillColor(shadowColor.r, shadowColor.g, shadowColor.b);
            
            // Draw shadow rect/circle offset
            if (el.type === 'circle') {
                const r = Math.min(absW, absH) / 2;
                doc.circle(absX + absW/2 + shadowOffset, absY + absH/2 + shadowOffset, r, 'F');
            } else {
                if (style.borderRadius && style.borderRadius > 0) {
                    const r = style.borderRadius * 0.264583; // px to mm approx
                    doc.roundedRect(absX + shadowOffset, absY + shadowOffset, absW, absH, r, r, 'F');
                } else {
                    doc.rect(absX + shadowOffset, absY + shadowOffset, absW, absH, 'F');
                }
            }
        }

        // 2. Draw Background Fill
        let paintOp = '';
        if (bgRgb) {
            doc.setFillColor(bgRgb.r, bgRgb.g, bgRgb.b);
            paintOp += 'F';
        }

        // 3. Draw Borders
        if (style.borderWidth && style.borderWidth > 0) {
            const borderColor = style.borderColor ? hexToRgb(style.borderColor) : rgb;
            if (borderColor) doc.setDrawColor(borderColor.r, borderColor.g, borderColor.b);
            doc.setLineWidth(style.borderWidth * 0.2); // Scale px to mm roughly
            
            if (style.borderStyle === 'dashed') (doc as any).setLineDash([3, 3], 0);
            else if (style.borderStyle === 'dotted') (doc as any).setLineDash([1, 1], 0);
            else (doc as any).setLineDash([], 0);
            
            paintOp += 'D';
        }

        if (paintOp) {
            if (el.type === 'circle') {
                const r = Math.min(absW, absH) / 2;
                doc.circle(absX + absW/2, absY + absH/2, r, paintOp);
            } else {
                if (style.borderRadius && style.borderRadius > 0) {
                    const r = style.borderRadius * 0.264583; 
                    doc.roundedRect(absX, absY, absW, absH, r, r, paintOp);
                } else {
                    doc.rect(absX, absY, absW, absH, paintOp);
                }
            }
            // Reset dash
            (doc as any).setLineDash([], 0);
        }
    }

    // Other element line drawing (lines, etc)
    else if ((style.borderWidth && style.borderWidth > 0) || el.type === 'lines') {
        const borderColor = (style.borderColor ? hexToRgb(style.borderColor) : null) || rgb;
        doc.setDrawColor(borderColor.r, borderColor.g, borderColor.b);
        doc.setLineWidth(style.borderWidth ? style.borderWidth * 0.2 : 0.1);

        if (el.type === 'lines') {
            const lineSpacingMm = style.lineSpacing ? (style.lineSpacing / 3.78) : 6;
            const numLines = Math.floor(absH / lineSpacingMm);
            for(let i=1; i<=numLines; i++) {
                const ly = absY + (i * lineSpacingMm);
                doc.line(absX, ly, absX + absW, ly);
                if (style.showTimes) {
                    doc.setFontSize(8);
                    const hour = (style.startHour || 7) + (i - 1);
                    doc.text(`${hour}:00`, absX - 2, ly - 1, { align: 'right' });
                }
            }
        }
    }

    // Text Rendering
    if (text) {
        const fontSize = style.fontSize || 12;
        let ty = absY;
        if (style.verticalAlign === 'middle') {
             ty = absY + (absH / 2) - (fontSize * 0.352 / 2); 
        } else if (style.verticalAlign === 'bottom') {
             ty = absY + absH - (fontSize * 0.352);
        }

        if (style.textTransform === 'uppercase') text = text.toUpperCase();
        if (style.textTransform === 'lowercase') text = text.toLowerCase();

        // Specific rendering for holiday_list with columns
        if (el.type === 'holiday_list' && style.columnCount && style.columnCount > 1) {
            const cols = style.columnCount;
            const colGap = 5; // mm
            const colWidth = (absW - ((cols - 1) * colGap)) / cols;
            const rawLines = text.split('\n');
            const linesPerCol = Math.ceil(rawLines.length / cols);

            for(let c = 0; c < cols; c++) {
                const chunk = rawLines.slice(c * linesPerCol, (c + 1) * linesPerCol);
                if (chunk.length > 0) {
                    const colText = chunk.join('\n');
                    const colX = absX + (c * (colWidth + colGap));
                    
                    let align: 'left' | 'center' | 'right' = 'left';
                    let tx = colX;
                    if (style.textAlign === 'center') { tx = colX + (colWidth / 2); align = 'center'; }
                    else if (style.textAlign === 'right') { tx = colX + colWidth; align = 'right'; }

                    const splitText = doc.splitTextToSize(colText, colWidth);
                    doc.text(splitText, tx, ty, { align, baseline: 'top' });
                }
            }
        } 
        else if (el.type === 'text' || el.type === 'quote' || el.type === 'holiday_list' || el.type === 'verse') {
            // Standard Single Column Text
            let tx = absX;
            let align: 'left' | 'center' | 'right' = 'left';
            if (style.textAlign === 'center') { tx = absX + (absW / 2); align = 'center'; } 
            else if (style.textAlign === 'right') { tx = absX + absW; align = 'right'; }

            const splitText = doc.splitTextToSize(text, absW);
            doc.text(splitText, tx, ty, { align, baseline: 'top' });
        } else {
            // Short labels (day numbers, etc)
            let tx = absX;
            let align: 'left' | 'center' | 'right' = 'left';
            if (style.textAlign === 'center') { tx = absX + (absW / 2); align = 'center'; } 
            else if (style.textAlign === 'right') { tx = absX + absW; align = 'right'; }
            
            doc.text(text, tx, ty + (fontSize * 0.352), { align });
        }
    }

    // Special: Image
    if (el.type === 'image' && style.imageUrl) {
        try {
            const imgX = style.flipX ? absX + absW : absX;
            const imgY = style.flipY ? absY + absH : absY;
            const imgW = style.flipX ? -absW : absW;
            const imgH = style.flipY ? -absH : absH;

            let resolvedUrl = style.imageUrl;
            if (style.imageUrl.startsWith('image-id:')) {
                const id = style.imageUrl.substring('image-id:'.length);
                resolvedUrl = ImageManager.getCachedBase64(id) || '';
            }

            if (resolvedUrl) {
                doc.addImage(
                    resolvedUrl,
                    'JPEG',
                    imgX,
                    imgY,
                    imgW,
                    imgH
                );
            }
        } catch (e) {
            console.error("Error adding image to PDF:", e);
        }
    }

    // Special: Full Calendar
    if (el.type === 'full_calendar' && day) {
        const cols = style.monthsPerRow || 3;
        const cellW = absW / cols;
        const cellH = absH / Math.ceil(12/cols);
        
        for(let m=0; m<12; m++) {
            const c = m % cols;
            const r = Math.floor(m / cols);
            const mx = absX + (c * cellW);
            const my = absY + (r * cellH);
            
            doc.setFontSize(8);
            doc.setFont(fontConfig.font, 'bold');
            
            const showYear = el.style.fullCalendar?.showYearInTitle ?? true;
            const titleText = showYear ? `${getMonthName(m)} ${day.year}` : getMonthName(m);
            
            doc.text(titleText, mx + cellW/2, my + 4, { align: 'center' });
            
            doc.setDrawColor(200, 200, 200);
            doc.rect(mx + 2, my + 6, cellW - 4, cellH - 8);
        }
    }
    
    // Special: Table
    if (el.type === 'table') {
        const rows = style.table?.rows || 10;
        const cols = style.table?.cols || 2;
        const userRowHeight = style.table?.rowHeight;
        const rowH = userRowHeight ? (userRowHeight * 0.264583) : (absH / rows);
        const colWs = style.table?.columnWidths || Array(cols).fill(100/cols);
        
        let curY = absY;
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.1);

        for (let r=0; r<rows; r++) {
            let curX = absX;
            for (let c=0; c<cols; c++) {
                const cellW = (colWs[c] / 100) * absW;
                doc.rect(curX, curY, cellW, rowH);
                const content = style.table?.cellContent?.[`${r}-${c}`];
                if (content) {
                    doc.setFontSize(8);
                    doc.text(content, curX + 2, curY + rowH/2 + 2);
                }
                curX += cellW;
            }
            curY += rowH;
        }
    }
};

export const generateAndDownloadPDF = async (config: AgendaConfig, generatedDays: DayData[], quotes: string[], onProgress: (progress: number) => void) => {
    // Ensure all referenced images are loaded before generating PDF
    await ImageManager.preloadConfigImages(config);
    
    const format = config.pageSize.toLowerCase();
    const orientation = config.orientation === 'portrait' ? 'p' : 'l';
    const doc = new jsPDF({ orientation, unit: "mm", format, compress: true });
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();

    const getSafeGeometry = (pageNum: number) => {
        const isEven = pageNum % 2 === 0;
        let marginLeft, marginRight;
        if (config.mirrorEvenPages && isEven) { marginLeft = config.margins.outside; marginRight = config.margins.inside; } 
        else { marginLeft = config.margins.inside; marginRight = config.margins.outside; }
        const marginTop = config.margins.top;
        const marginBottom = config.margins.bottom;
        return { marginLeft, marginTop, safeW: pageW - marginLeft - marginRight, safeH: pageH - marginTop - marginBottom };
    };

    const getElementsForPage = (elements: LayoutElement[], pageNum: number, isDaily: boolean = false): LayoutElement[] => {
        const isEven = pageNum % 2 === 0;
        if (isEven && config.customVerso && config.elementsVerso && config.elementsVerso.length > 0) {
            return config.elementsVerso;
        }
        if (config.mirrorEvenPages && isEven) {
            return elements.map(el => {
                const newX = 100 - el.x - el.w;
                let newTextAlign = el.style.textAlign;
                if (newTextAlign === 'left') newTextAlign = 'right'; else if (newTextAlign === 'right') newTextAlign = 'left';
                
                let newFlipX = el.style.flipX;
                if (el.style.autoMirrorImage && (el.type === 'image' || el.type === 'icon')) {
                    newFlipX = !newFlipX;
                }

                return { ...el, x: newX, style: { ...el.style, textAlign: newTextAlign, flipX: newFlipX } };
            });
        }
        return elements;
    };

    const getDayOfYear = (date: Date) => {
        const start = new Date(date.getFullYear(), 0, 0);
        const diff = date.getTime() - start.getTime();
        const oneDay = 1000 * 60 * 60 * 24;
        return Math.floor(diff / oneDay);
    };

    let globalPageCount = 0;
    const isSinglePageType = config.layoutType === '1_per_page' || config.layoutType === 'notebook' || config.projectType === 'notebook' || config.projectType === 'devotional';
    const totalPages = config.introPages.length + (isSinglePageType ? generatedDays.length : config.layoutType === '2_per_page' ? Math.ceil(generatedDays.length / 2) : Math.ceil(generatedDays.length));

    for (const page of config.introPages) {
        if (globalPageCount > 0) doc.addPage(format, orientation);
        globalPageCount++;
        const geo = getSafeGeometry(globalPageCount);
        const elements = getElementsForPage(page.elements, globalPageCount);
        elements.forEach(el => renderElementToPDF(doc, el, null, undefined, undefined, geo.safeW, geo.safeH, geo.marginLeft, geo.marginTop));
        onProgress(Math.round((globalPageCount / totalPages) * 100));
        await new Promise(r => setTimeout(r, 0)); 
    }

    if (isSinglePageType) {
        if (config.customVerso && config.versoAdvancesSequence === false) {
            for (const day of generatedDays) {
                // Frente Page (Odd)
                doc.addPage(format, orientation);
                globalPageCount++;
                let geo = getSafeGeometry(globalPageCount);
                let elements = getElementsForPage(config.elements, globalPageCount, true);
                let verse = day.date ? getVerseForDay(getDayOfYear(new Date(day.date))) : undefined;
                let quote = day.month !== undefined && quotes ? quotes[day.month] : undefined;
                elements.forEach(el => renderElementToPDF(doc, el, day, quote, verse, geo.safeW, geo.safeH, geo.marginLeft, geo.marginTop));

                // Verso Page (Even) with same date
                doc.addPage(format, orientation);
                globalPageCount++;
                geo = getSafeGeometry(globalPageCount);
                elements = getElementsForPage(config.elements, globalPageCount, true);
                elements.forEach(el => renderElementToPDF(doc, el, day, quote, verse, geo.safeW, geo.safeH, geo.marginLeft, geo.marginTop));

                if (globalPageCount % 10 === 0) { onProgress(Math.round((globalPageCount / totalPages) * 100)); await new Promise(r => setTimeout(r, 0)); }
            }
        } else {
            for (const day of generatedDays) {
                doc.addPage(format, orientation);
                globalPageCount++;
                const geo = getSafeGeometry(globalPageCount);
                const elements = getElementsForPage(config.elements, globalPageCount, true);
                const verse = day.date ? getVerseForDay(getDayOfYear(new Date(day.date))) : undefined;
                const quote = day.month !== undefined && quotes ? quotes[day.month] : undefined;
                elements.forEach(el => renderElementToPDF(doc, el, day, quote, verse, geo.safeW, geo.safeH, geo.marginLeft, geo.marginTop));
                if (globalPageCount % 10 === 0) { onProgress(Math.round((globalPageCount / totalPages) * 100)); await new Promise(r => setTimeout(r, 0)); }
            }
        }
    } 
    else if (config.layoutType === '2_per_page') {
        for (let i = 0; i < generatedDays.length; i += 2) {
            doc.addPage(format, orientation);
            globalPageCount++;
            const geo = getSafeGeometry(globalPageCount);
            const day1 = generatedDays[i];
            const day2 = generatedDays[i+1];
            const elements = getElementsForPage(config.elements, globalPageCount);
            
            const verse1 = getVerseForDay(getDayOfYear(new Date(day1.date)));
            elements.forEach(el => { const halfH_El = { ...el, h: el.h / 2, y: el.y / 2 }; renderElementToPDF(doc, halfH_El, day1, quotes[day1.month], verse1, geo.safeW, geo.safeH, geo.marginLeft, geo.marginTop); });
            
            if (day2) { 
                const verse2 = getVerseForDay(getDayOfYear(new Date(day2.date)));
                elements.forEach(el => { const halfH_El = { ...el, h: el.h / 2, y: (el.y / 2) + 50 }; renderElementToPDF(doc, halfH_El, day2, quotes[day2.month], verse2, geo.safeW, geo.safeH, geo.marginLeft, geo.marginTop); }); 
                const midY = geo.marginTop + (geo.safeH / 2); 
                doc.setDrawColor(200, 200, 200); 
                (doc as any).setLineDash([2, 2], 0); 
                doc.line(0, midY, pageW, midY); 
                (doc as any).setLineDash([], 0); 
            }
            if (globalPageCount % 10 === 0) { onProgress(Math.round((globalPageCount / totalPages) * 100)); await new Promise(r => setTimeout(r, 0)); }
        }
    }
    else if (config.layoutType === '1_per_page_weekend_shared') {
        let i = 0;
        while (i < generatedDays.length) {
            const day = generatedDays[i];
            const isSaturday = day.dayOfWeek === 6;
            doc.addPage(format, orientation);
            globalPageCount++;
            const geo = getSafeGeometry(globalPageCount);
            const elements = getElementsForPage(config.elements, globalPageCount);
            const verse = getVerseForDay(getDayOfYear(new Date(day.date)));
            
            if (isSaturday) {
                elements.forEach(el => { const halfH_El = { ...el, h: el.h / 2, y: el.y / 2 }; renderElementToPDF(doc, halfH_El, day, quotes[day.month], verse, geo.safeW, geo.safeH, geo.marginLeft, geo.marginTop); });
                const nextDay = generatedDays[i+1];
                if (nextDay) { 
                    const nextVerse = getVerseForDay(getDayOfYear(new Date(nextDay.date)));
                    elements.forEach(el => { const halfH_El = { ...el, h: el.h / 2, y: (el.y / 2) + 50 }; renderElementToPDF(doc, halfH_El, nextDay, quotes[nextDay.month], nextVerse, geo.safeW, geo.safeH, geo.marginLeft, geo.marginTop); }); 
                    const midY = geo.marginTop + (geo.safeH / 2); 
                    doc.setDrawColor(200, 200, 200); 
                    (doc as any).setLineDash([2, 2], 0); 
                    doc.line(0, midY, pageW, midY); 
                    (doc as any).setLineDash([], 0); 
                }
                i += 2; 
            } else {
                elements.forEach(el => renderElementToPDF(doc, el, day, quotes[day.month], verse, geo.safeW, geo.safeH, geo.marginLeft, geo.marginTop));
                i += 1;
            }
            if (globalPageCount % 10 === 0) { onProgress(Math.round((globalPageCount / totalPages) * 100)); await new Promise(r => setTimeout(r, 0)); }
        }
    }
    else if (config.layoutType === 'weekly_one_page_vertical' || config.layoutType === 'weekly_one_page_horizontal') {
        const weeks: DayData[][] = [];
        let currentWeek: DayData[] = [];
        generatedDays.forEach((day, index) => {
            currentWeek.push(day);
            if (day.dayOfWeek === 0 || index === generatedDays.length - 1) {
                weeks.push(currentWeek);
                currentWeek = [];
            }
        });

        for (const week of weeks) {
            if (config.customVerso && config.versoAdvancesSequence === false) {
                // Frente Page (Odd) for current week
                doc.addPage(format, orientation);
                globalPageCount++;
                let geo = getSafeGeometry(globalPageCount);
                let elements = getElementsForPage(config.elements, globalPageCount, true);
                elements.forEach(el => renderElementToPDF(doc, el, null, undefined, undefined, geo.safeW, geo.safeH, geo.marginLeft, geo.marginTop, week));

                // Verso Page (Even) for SAME week
                doc.addPage(format, orientation);
                globalPageCount++;
                geo = getSafeGeometry(globalPageCount);
                elements = getElementsForPage(config.elements, globalPageCount, true);
                elements.forEach(el => renderElementToPDF(doc, el, null, undefined, undefined, geo.safeW, geo.safeH, geo.marginLeft, geo.marginTop, week));
            } else {
                doc.addPage(format, orientation);
                globalPageCount++;
                let geo = getSafeGeometry(globalPageCount);
                let elements = getElementsForPage(config.elements, globalPageCount, true);
                elements.forEach(el => renderElementToPDF(doc, el, null, undefined, undefined, geo.safeW, geo.safeH, geo.marginLeft, geo.marginTop, week));
            }
            if (globalPageCount % 10 === 0) { onProgress(Math.round((globalPageCount / totalPages) * 100)); await new Promise(r => setTimeout(r, 0)); }
        }
    }
    else if (config.layoutType === 'weekly_vertical' || config.layoutType === 'weekly_horizontal') {
        const weeks: DayData[][] = [];
        let currentWeek: DayData[] = [];
        generatedDays.forEach((day, index) => {
            currentWeek.push(day);
            if (day.dayOfWeek === 0 || index === generatedDays.length - 1) {
                weeks.push(currentWeek);
                currentWeek = [];
            }
        });

        for (const week of weeks) {
            if (globalPageCount % 2 === 0 && !config.disableSequenceSkip) {
                // Ensure Left page is on EVEN page
                doc.addPage(format, orientation);
                globalPageCount++;
            }

            // Left Page (Even / Verso)
            doc.addPage(format, orientation);
            globalPageCount++;
            let geo = getSafeGeometry(globalPageCount);
            let elementsL = config.elementsWeeklyLeft || config.elements;
            elementsL.forEach(el => renderElementToPDF(doc, el, null, undefined, undefined, geo.safeW, geo.safeH, geo.marginLeft, geo.marginTop, week));

            // Right Page (Odd / Frente)
            doc.addPage(format, orientation);
            globalPageCount++;
            geo = getSafeGeometry(globalPageCount);
            let elementsR = config.elementsWeeklyRight || config.elements;
            elementsR.forEach(el => renderElementToPDF(doc, el, null, undefined, undefined, geo.safeW, geo.safeH, geo.marginLeft, geo.marginTop, week));

            if (globalPageCount % 10 === 0) { onProgress(Math.round((globalPageCount / totalPages) * 100)); await new Promise(r => setTimeout(r, 0)); }
        }
    }

    onProgress(100);
    doc.save(`Agenda_${config.year}.pdf`);
};
