// colorPickerUtils/colorPickerEffects.ts
import iro from '@jaames/iro';

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

export function updateGamutCanvas(
    canvasRef: React.MutableRefObject<HTMLCanvasElement | null>,
    iroPickerRef: React.MutableRefObject<iro.ColorPicker | null>,
    hasValueSlider: boolean,
    colorLightGamut: string | undefined,
    colorLightWidth: number | undefined,
    fillColor: string,
    drawGamutTriangleOnCanvas: (
        canvas: HTMLCanvasElement,
        gamutType: 'A' | 'B' | 'C',
        size: number,
        fillColor: string,
    ) => void,
): void {
    // Entferne ggf. altes Canvas
    if (canvasRef.current && canvasRef.current.parentElement) {
        canvasRef.current.parentElement.removeChild(canvasRef.current);
        canvasRef.current = null;
    }

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
        canvas.style.pointerEvents = 'none';
        canvas.style.zIndex = '10';
        drawGamutTriangleOnCanvas(canvas, colorLightGamut as 'A' | 'B' | 'C', size, fillColor);
        wheelElem.style.position = 'relative';
        wheelElem.appendChild(canvas);
        canvasRef.current = canvas;
    }
}

export function cleanupGamutCanvas(canvasRef: React.MutableRefObject<HTMLCanvasElement | null>): void {
    if (canvasRef.current && canvasRef.current.parentElement) {
        canvasRef.current.parentElement.removeChild(canvasRef.current);
        canvasRef.current = null;
    }
}
