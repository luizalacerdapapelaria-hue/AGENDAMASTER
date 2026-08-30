
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
    direction: string,
    rotation: number = 0,
    lockHeight: boolean = false
) => {
    // 1. Convert initial percentage coordinates to pixels
    const initialX_px = (initialX / 100) * containerWidth;
    const initialY_px = (initialY / 100) * containerHeight;
    const initialW_px = (initialW / 100) * containerWidth;
    const initialH_px = (initialH / 100) * containerHeight;

    // 2. Convert screen mouse delta in pixels (deltaX, deltaY) to local element pixel displacement
    const rad = (rotation * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);

    // Screen -> Local rotation matrix: R(-rad)
    const dX_local_px = deltaX * cos + deltaY * sin;
    const dY_local_px = -deltaX * sin + deltaY * cos;

    let newW_px = initialW_px;
    let newH_px = initialH_px;

    let deltaC_local_x_px = 0;
    let deltaC_local_y_px = 0;

    const minW_px = 2; // minimum 2 pixels
    const minH_px = 2; // minimum 2 pixels

    let effectiveDirection = direction;
    if (lockHeight) {
        if (direction === 'w' || direction.includes('w') || direction.includes('n')) {
            effectiveDirection = 'w';
        } else if (direction === 'e' || direction.includes('e') || direction.includes('s')) {
            effectiveDirection = 'e';
        }
    }

    // Horizontal in local coordinates
    if (effectiveDirection.includes('e')) {
        newW_px = Math.max(minW_px, initialW_px + dX_local_px);
        const deltaW_px = newW_px - initialW_px;
        deltaC_local_x_px += deltaW_px / 2;
    }
    if (effectiveDirection.includes('w')) {
        newW_px = Math.max(minW_px, initialW_px - dX_local_px);
        const deltaW_px = newW_px - initialW_px;
        deltaC_local_x_px -= deltaW_px / 2;
    }

    // Vertical in local coordinates (disabled if lockHeight is true)
    if (!lockHeight) {
        if (effectiveDirection.includes('s')) {
            newH_px = Math.max(minH_px, initialH_px + dY_local_px);
            const deltaH_px = newH_px - initialH_px;
            deltaC_local_y_px += deltaH_px / 2;
        }
        if (effectiveDirection.includes('n')) {
            newH_px = Math.max(minH_px, initialH_px - dY_local_px);
            const deltaH_px = newH_px - initialH_px;
            deltaC_local_y_px -= deltaH_px / 2;
        }
    }

    // 3. Convert local center shift to screen center shift in pixels: R(rad)
    const deltaC_screen_x_px = deltaC_local_x_px * cos - deltaC_local_y_px * sin;
    const deltaC_screen_y_px = deltaC_local_x_px * sin + deltaC_local_y_px * cos;

    // 4. Calculate new pixel center and top-left corner in pixels
    const initialCenterX_px = initialX_px + initialW_px / 2;
    const initialCenterY_px = initialY_px + initialH_px / 2;

    const newCenterX_px = initialCenterX_px + deltaC_screen_x_px;
    const newCenterY_px = initialCenterY_px + deltaC_screen_y_px;

    const newX_px = newCenterX_px - newW_px / 2;
    const newY_px = newCenterY_px - newH_px / 2;

    // 5. Convert everything back to percentages of container width and height
    const newX = (newX_px / containerWidth) * 100;
    const newY = (newY_px / containerHeight) * 100;
    const newW = (newW_px / containerWidth) * 100;
    const newH = (newH_px / containerHeight) * 100;

    return { 
        x: Number(newX.toFixed(2)), 
        y: Number(newY.toFixed(2)), 
        w: Number(newW.toFixed(2)), 
        h: Number(newH.toFixed(2)) 
    };
};
