// colorPickerUtils/colorPickerEffects.ts
import iro from '@jaames/iro';
import { getGamutTrianglePoints, isPointInTriangle, type drawGamutTriangleOnCanvas } from './gamutMath';

export function initializeColorPicker(
    ref: React.RefObject<HTMLDivElement>,
    pickerRef: React.MutableRefObject<iro.ColorPicker | null>,
    options: Record<string, any>,
    onInputChange?: (color: iro.Color) => void, // <-- zusätzlicher Parameter
    onInit?: (color: iro.Color) => void, // <-- zusätzlicher Parameter
): void {
    if (!ref.current) {
        return;
    }
    pickerRef.current = iro.ColorPicker(ref.current, options);

    // Event-Listener für Farbinitialisierung hinzufügen
    pickerRef.current.on('color:init', (color: iro.Color) => {
        if (onInit) {
            onInit(color);
        }
    });

    // Event-Listener für Farbänderung hinzufügen
    pickerRef.current.on('input:change', (color: iro.Color) => {
        if (onInputChange) {
            onInputChange(color);
        }
    });
}

export function cleanupColorPicker(pickerRef: React.MutableRefObject<iro.ColorPicker | null>): void {
    pickerRef.current = null;
}

export function resizeColorPicker(picker: iro.ColorPicker | null, width: number | undefined): void {
    if (!picker || !width) {
        return;
    }
    picker.resize(width);
}

export function setColorPickerOptions(picker: iro.ColorPicker | null, options: Record<string, any>): void {
    if (!picker) {
        return;
    }
    picker.setOptions(options);
}

function handlePointerEvent(
    e: MouseEvent,
    trianglePoints: [number, number][],
    editMode: boolean | undefined,
    mouseHandler?: (event: MouseEvent, inside: boolean) => void,
): void {
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const inside = isPointInTriangle([x, y], trianglePoints);

    if (!inside && !editMode) {
        e.stopPropagation();
        e.stopImmediatePropagation();
        e.preventDefault();
    }

    if (mouseHandler) {
        mouseHandler(e, inside);
    }
}

export function updateGamutCanvas(
    editMode: boolean | undefined,
    canvasRef: React.MutableRefObject<HTMLCanvasElement | null>,
    iroPickerRef: React.MutableRefObject<iro.ColorPicker | null>,
    hasValueSlider: boolean,
    colorLightGamut: string | undefined,
    colorLightWidth: number | undefined,
    fillColor: string,
    drawTriangle: typeof drawGamutTriangleOnCanvas,
    mouseHandler?: (event: MouseEvent, inside: boolean) => void,
): void {
    // Entferne ggf. altes Canvas
    // cleanupGamutCanvas(canvasRef);

    if (
        hasValueSlider &&
        colorLightGamut &&
        colorLightGamut !== 'default' &&
        iroPickerRef.current &&
        iroPickerRef.current.base &&
        (iroPickerRef.current.base as HTMLElement).children[0] &&
        colorLightWidth
    ) {
        const wheelElem = (iroPickerRef.current.base as HTMLElement).children[0] as HTMLElement;
        const size = colorLightWidth;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        canvas.style.position = 'absolute';
        canvas.style.left = '0';
        canvas.style.top = '0';
        // canvas.style.pointerEvents = mouseHandler ? 'auto' : 'none';
        canvas.style.pointerEvents = 'auto';
        canvas.style.zIndex = '1000';
        drawTriangle(canvas, colorLightGamut as 'A' | 'B' | 'C', size, fillColor);
        wheelElem.style.position = 'relative';
        wheelElem.appendChild(canvas);
        canvasRef.current = canvas;

        const trianglePoints = getGamutTrianglePoints(colorLightGamut as 'A' | 'B' | 'C', size);

        canvas.onmousedown = (e: MouseEvent) => handlePointerEvent(e, trianglePoints, editMode, mouseHandler);
        canvas.onmouseup = (e: MouseEvent) => handlePointerEvent(e, trianglePoints, editMode, mouseHandler);
        canvas.onmousemove = (e: MouseEvent) => handlePointerEvent(e, trianglePoints, editMode, mouseHandler);
    }
}

export function cleanupGamutCanvas(canvasRef: React.MutableRefObject<HTMLCanvasElement | null>): void {
    if (canvasRef.current && canvasRef.current.parentElement) {
        canvasRef.current.parentElement.removeChild(canvasRef.current);
        canvasRef.current = null;
    }
}
