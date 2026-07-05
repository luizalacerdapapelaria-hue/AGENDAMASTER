
import { LayoutElement } from '../../types';

// --- INTERACTION MATH ---

// Limiar de atração (em %) - Reduzido de 0.8 para 0.5 para maior fluidez
const SNAP_THRESHOLD = 0.5;

export const snap = (val: number) => Math.round(val * 100) / 100; // Aumentado precisão para 0.01

export interface SnapGuide {
    axis: 'x' | 'y';
    pos: number;
}

interface SnapResult {
    value: number;
    snapped: boolean;
    guide?: SnapGuide;
}

const getSmartSnap = (
    currentVal: number, 
    widthOrHeight: number, 
    otherElements: LayoutElement[], 
    axis: 'x' | 'y'
): SnapResult => {
    let bestSnap = currentVal;
    let minDiff = SNAP_THRESHOLD;
    let found = false;
    let matchedGuidePos: number | undefined;

    const currentCenter = currentVal + (widthOrHeight / 2);
    const currentEnd = currentVal + widthOrHeight;

    // Alvos globais da página (Bordas e Centro)
    const pageTargets = [0, 50, 100];
    pageTargets.forEach(target => {
        if (Math.abs(currentVal - target) < minDiff) {
            bestSnap = target;
            minDiff = Math.abs(currentVal - target);
            found = true; matchedGuidePos = target;
        }
        if (Math.abs(currentEnd - target) < minDiff) {
            bestSnap = target - widthOrHeight;
            minDiff = Math.abs(currentEnd - target);
            found = true; matchedGuidePos = target;
        }
        if (Math.abs(currentCenter - target) < minDiff) {
            bestSnap = target - (widthOrHeight / 2);
            minDiff = Math.abs(currentCenter - target);
            found = true; matchedGuidePos = target;
        }
    });

    otherElements.forEach(el => {
        const otherStart = axis === 'x' ? el.x : el.y;
        const otherSize = axis === 'x' ? el.w : el.h;
        const otherEnd = otherStart + otherSize;
        const otherCenter = otherStart + (otherSize / 2);

        // Pontos de interesse para alinhar (Início, Meio, Fim)
        const targets = [otherStart, otherCenter, otherEnd];

        // 1. Alinhar Início com Alvos
        targets.forEach(target => {
            if (Math.abs(currentVal - target) < minDiff) {
                bestSnap = target;
                minDiff = Math.abs(currentVal - target);
                found = true;
                matchedGuidePos = target;
            }
        });

        // 2. Alinhar Final com Alvos
        targets.forEach(target => {
            if (Math.abs(currentEnd - target) < minDiff) {
                bestSnap = target - widthOrHeight;
                minDiff = Math.abs(currentEnd - target);
                found = true;
                matchedGuidePos = target;
            }
        });

        // 3. Alinhar Centro com Centro
        if (Math.abs(currentCenter - otherCenter) < minDiff) {
            bestSnap = otherCenter - (widthOrHeight / 2);
            minDiff = Math.abs(currentCenter - otherCenter);
            found = true;
            matchedGuidePos = otherCenter;
        }
    });

    return { 
        value: found ? bestSnap : currentVal, 
        snapped: found, 
        guide: found ? { axis, pos: matchedGuidePos! } : undefined 
    };
};

export const calculateDragPosition = (
    deltaX: number, 
    deltaY: number, 
    initialX: number, 
    initialY: number, 
    initialW: number,
    initialH: number,
    containerWidth: number, 
    containerHeight: number,
    otherElements: LayoutElement[] = [],
    enableSmartSnap: boolean = true // Agora True por padrão
) => {
    const dX = (deltaX / containerWidth) * 100;
    const dY = (deltaY / containerHeight) * 100;
    
    let rawX = initialX + dX;
    let rawY = initialY + dY;

    // Limites da página (ajustado para permitir sangria)
    rawX = Math.max(-100, Math.min(200 - initialW, rawX));
    rawY = Math.max(-100, Math.min(200 - initialH, rawY));

    if (!enableSmartSnap) {
        return { x: Number(rawX.toFixed(2)), y: Number(rawY.toFixed(2)), guides: [] };
    }

    const snapX = getSmartSnap(rawX, initialW, otherElements, 'x');
    const snapY = getSmartSnap(rawY, initialH, otherElements, 'y');

    const guides: SnapGuide[] = [];
    if (snapX.guide) guides.push(snapX.guide);
    if (snapY.guide) guides.push(snapY.guide);

    return {
        x: Number(snapX.value.toFixed(2)),
        y: Number(snapY.value.toFixed(2)),
        guides
    };
};

export const calculateResize = (
    deltaX: number,
    deltaY: number,
    initialX: number,
    initialY: number,
    initialW: number,
    initialH: number,
    containerWidth: number,
    containerHeight: number,
    direction: string
) => {
    const dX = (deltaX / containerWidth) * 100;
    const dY = (deltaY / containerHeight) * 100;

    let newX = initialX;
    let newY = initialY;
    let newW = initialW;
    let newH = initialH;

    // Horizontal
    if (direction.includes('e')) {
        newW = Math.max(2, initialW + dX);
    }
    if (direction.includes('w')) {
        const desiredW = Math.max(2, initialW - dX);
        const deltaW = desiredW - initialW;
        if (desiredW !== initialW) {
            newX = initialX - deltaW;
            newW = desiredW;
        }
    }

    // Vertical
    if (direction.includes('s')) {
        newH = Math.max(2, initialH + dY);
    }
    if (direction.includes('n')) {
         const desiredH = Math.max(2, initialH - dY);
         const deltaH = desiredH - initialH;
         if (desiredH !== initialH) {
             newY = initialY - deltaH;
             newH = desiredH;
         }
    }

    return { x: Number(newX.toFixed(2)), y: Number(newY.toFixed(2)), w: Number(newW.toFixed(2)), h: Number(newH.toFixed(2)) };
};
