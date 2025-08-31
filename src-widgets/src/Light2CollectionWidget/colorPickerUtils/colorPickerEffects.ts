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

export function updateGamutCanvas(
    canvasRef: React.MutableRefObject<HTMLCanvasElement | null>,
    iroPickerRef: React.MutableRefObject<any>,
    lastInsideRef: React.MutableRefObject<boolean>, // <--- NEU
    hasValueSlider: boolean,
    colorLightGamut: string | undefined,
    colorLightWidth: number | undefined,
    fillColor: string,
    drawTriangle: typeof drawGamutTriangleOnCanvas,
    pointerHandler?: (event: PointerEvent, inside: boolean) => void,
): void {
    // Entferne ggf. altes Canvas
    // cleanupGamutCanvas(canvasRef);

    if (
        hasValueSlider &&
        colorLightGamut &&
        colorLightGamut !== 'default' &&
        iroPickerRef.current &&
        iroPickerRef.current.base &&
        iroPickerRef.current.base.children[0] &&
        colorLightWidth
    ) {
        const wheelElem = iroPickerRef.current.base.children[0] as HTMLElement;
        const size = colorLightWidth;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        canvas.style.position = 'absolute';
        canvas.style.left = '0';
        canvas.style.top = '0';
        // canvas.style.pointerEvents = pointerHandler ? 'auto' : 'none';
        canvas.style.pointerEvents = 'auto';
        canvas.style.zIndex = '100';
        drawTriangle(canvas, colorLightGamut as 'A' | 'B' | 'C', size, fillColor);
        wheelElem.style.position = 'relative';
        wheelElem.appendChild(canvas);
        canvasRef.current = canvas;

        const trianglePoints = getGamutTrianglePoints(colorLightGamut as 'A' | 'B' | 'C', size);

        //let lastInside = true;
        if (lastInsideRef) {
            lastInsideRef.current = true;
        }

        wheelElem.addEventListener(
            'mousemove',
            e => {
                if (!lastInsideRef.current) {
                    // ❌ blockiere iro.js
                    e.stopImmediatePropagation();
                    console.log('👉 Original-Handler blockiert, eigener läuft');
                } else {
                    // ✅ Original darf laufen
                    console.log('👉 Original-Handler darf laufen');
                }
            },
            true, // Capture-Phase
        );

        canvas.onpointerdown = (e: PointerEvent) => {
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const inside = isPointInTriangle([x, y], trianglePoints);

            if (lastInsideRef && inside !== lastInsideRef.current) {
                lastInsideRef.current = inside;
            }

            if (pointerHandler) {
                pointerHandler(e, inside);
            }
        };

        canvas.onpointerup = (e: PointerEvent) => {
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const inside = isPointInTriangle([x, y], trianglePoints);

            if (lastInsideRef && inside !== lastInsideRef.current) {
                lastInsideRef.current = inside;
            }

            if (pointerHandler) {
                pointerHandler(e, inside);
            }
        };

        canvas.onpointermove = (e: PointerEvent) => {
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const inside = isPointInTriangle([x, y], trianglePoints);

            if (lastInsideRef && inside !== lastInsideRef.current) {
                lastInsideRef.current = inside;

                console.log('Pointer moved', inside);
            }

            if (pointerHandler) {
                pointerHandler(e, inside);
            }
        };
    }
}

export function cleanupGamutCanvas(canvasRef: React.MutableRefObject<HTMLCanvasElement | null>): void {
    if (canvasRef.current && canvasRef.current.parentElement) {
        canvasRef.current.parentElement.removeChild(canvasRef.current);
        canvasRef.current = null;

        console.log('Gamut-Canvas entfernt');
    }
}
