import { useCallback, useContext, useEffect, useMemo, useRef } from 'react';
import type iro from '@jaames/iro';
import { Box } from '@mui/material';
import { type ElementDimensions } from '../hooks/useElementDimensions';
import { type Light2FieldsRxData } from '../lib/light2Fields';
import { getColorLightLayout, getColorLightWidth, getMarginBetweenPickers } from './colorPickerUtils/colorPickerMemos';
import { CollectionContext } from '../components/CollectionProvider';

import {
    initializeColorPicker,
    cleanupColorPicker,
    resizeColorPicker,
    setColorPickerOptions,
} from './colorPickerUtils/colorPickerEffects';

// Philips Hue Gamut Definitionen
const gamutTriangles = {
    A: [
        [0.704, 0.296],
        [0.2151, 0.7106],
        [0.138, 0.08],
    ],
    B: [
        [0.675, 0.322],
        [0.409, 0.518],
        [0.167, 0.04],
    ],
    C: [
        [0.692, 0.308],
        [0.17, 0.7],
        [0.153, 0.048],
    ],
};

// xy -> RGB Umrechnung (Philips Hue Standard)
function xyToRgb(x: number, y: number): { r: number; g: number; b: number } {
    const z = 1.0 - x - y;
    const Y = 1.0;
    const X = (Y / y) * x;
    const Z = (Y / y) * z;

    // Wide RGB D65 conversion
    let r = X * 1.656492 - Y * 0.354851 - Z * 0.255038;
    let g = -X * 0.707196 + Y * 1.655397 + Z * 0.036152;
    let b = X * 0.051713 - Y * 0.121364 + Z * 1.01153;

    // Clamp and gamma correct
    r = r <= 0.0031308 ? 12.92 * r : (1.0 + 0.055) * Math.pow(r, 1.0 / 2.4) - 0.055;
    g = g <= 0.0031308 ? 12.92 * g : (1.0 + 0.055) * Math.pow(g, 1.0 / 2.4) - 0.055;
    b = b <= 0.0031308 ? 12.92 * b : (1.0 + 0.055) * Math.pow(b, 1.0 / 2.4) - 0.055;

    // Normalize
    const max = Math.max(r, g, b);
    if (max > 1) {
        r /= max;
        g /= max;
        b /= max;
    }
    return {
        r: Math.max(0, Math.min(1, r)),
        g: Math.max(0, Math.min(1, g)),
        b: Math.max(0, Math.min(1, b)),
    };
}

// RGB -> HSV Umrechnung
function rgbToHsv(r: number, g: number, b: number): { h: number; s: number; v: number } {
    const max = Math.max(r, g, b),
        min = Math.min(r, g, b);
    let h = 0,
        s,
        // eslint-disable-next-line prefer-const
        v = max;
    const d = max - min;
    // eslint-disable-next-line prefer-const
    s = max === 0 ? 0 : d / max;
    if (max === min) {
        h = 0;
    } else {
        switch (max) {
            case r:
                h = (g - b) / d + (g < b ? 6 : 0);
                break;
            case g:
                h = (b - r) / d + 2;
                break;
            case b:
                h = (r - g) / d + 4;
                break;
        }
        h /= 6;
    }
    return { h: h * 360, s, v };
}

// Dreieck korrekt im HS-Kreis des Wheels zeichnen
function drawGamutTriangleOnCanvas(
    canvas: HTMLCanvasElement,
    gamutType: 'A' | 'B' | 'C',
    size: number,
    fillColor: string,
): void {
    const ctx = canvas.getContext('2d');
    if (!ctx || !gamutTriangles[gamutType]) {
        return;
    }
    ctx.clearRect(0, 0, size, size);
    const triangle = gamutTriangles[gamutType];
    const center = size / 2;
    const radius = size / 2;

    // xy → RGB → HSV → Wheel-Koordinaten
    const points = triangle.map(([x, y]) => {
        const { r, g, b } = xyToRgb(x, y);
        const { h, s } = rgbToHsv(r, g, b);
        const angle = (h - 90) * (Math.PI / 180); // iro.js: 0° = oben
        return [center + Math.cos(angle) * s * radius, center + Math.sin(angle) * s * radius];
    });

    ctx.save();
    ctx.globalAlpha = 0.3;
    ctx.beginPath();
    ctx.moveTo(points[0][0], points[0][1]);
    ctx.lineTo(points[1][0], points[1][1]);
    ctx.lineTo(points[2][0], points[2][1]);
    ctx.closePath();
    ctx.fillStyle = fillColor;
    ctx.fill();
    ctx.restore();
}

interface LightPickerProps {
    dimensions: ElementDimensions;
    colorLightUIComponent: Light2FieldsRxData['colorLightUIComponent'];
    colorLightSliderWidth: Light2FieldsRxData['colorLightSliderWidth'];
    colorLightBorderWidth: Light2FieldsRxData['colorLightBorderWidth'];
    colorLightBorderColor: Light2FieldsRxData['colorLightBorderColor'];
    colorWheelLightness: Light2FieldsRxData['colorWheelLightness'];
    colorLightType: Light2FieldsRxData['colorLightType'];
    colorLightCtMin: Light2FieldsRxData['colorLightCtMin'];
    colorLightCtMax: Light2FieldsRxData['colorLightCtMax'];
    colorLightGamut: Light2FieldsRxData['colorLightGamut'];
    cctComponentNumber: number;
    onInputChange?: (color: iro.Color) => void;
    onColorInit?: (color: iro.Color) => void;
}

const Light2Picker: React.FC<LightPickerProps> = ({
    dimensions,
    colorLightUIComponent,
    colorLightSliderWidth,
    colorLightBorderWidth,
    colorLightBorderColor,
    colorWheelLightness,
    colorLightType,
    colorLightCtMin,
    colorLightCtMax,
    colorLightGamut,
    cctComponentNumber,
    onInputChange,
    onColorInit,
}) => {
    const { theme } = useContext(CollectionContext);
    const colorPickerRef = useRef<HTMLDivElement>(null);
    const iroPickerRef = useRef<iro.ColorPicker | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    const handleColorInit = useCallback(
        (color: iro.Color) => {
            onColorInit?.(color);
        },
        [onColorInit],
    );
    const onColorInitRef = useRef(handleColorInit);
    onColorInitRef.current = handleColorInit;

    const handleInputChange = useCallback(
        (color: iro.Color) => {
            onInputChange?.(color);
        },
        [onInputChange],
    );
    const onInputChangeRef = useRef(handleInputChange);
    onInputChangeRef.current = handleInputChange;

    const colorLightLayout = useMemo(
        () =>
            getColorLightLayout(
                cctComponentNumber,
                colorLightUIComponent,
                colorLightType,
                colorLightCtMin,
                colorLightCtMax,
            ),
        [cctComponentNumber, colorLightUIComponent, colorLightType, colorLightCtMin, colorLightCtMax],
    );

    const colorLightWidth = useMemo(
        () => getColorLightWidth(dimensions, colorLightUIComponent, colorLightType),
        [dimensions, colorLightUIComponent, colorLightType],
    );

    const marginBetweenPickers = useMemo(
        () => getMarginBetweenPickers(dimensions, colorLightUIComponent, colorLightSliderWidth, colorLightType),
        [dimensions, colorLightUIComponent, colorLightSliderWidth, colorLightType],
    );

    const hasValueSlider = useMemo(
        () => colorLightLayout.some(item => item.options?.sliderType === 'value'),
        [colorLightLayout],
    );

    useEffect(() => {
        initializeColorPicker(
            colorPickerRef,
            iroPickerRef,
            {
                // color: '#ffffff',
                width: 0,
                margin: 12,
                sliderSize: 28,
                display: 'flex',
                padding: 6,
                handleRadius: 8,
                layoutDirection: 'horizontal',
            },
            color => onInputChangeRef.current(color),
            color => onColorInitRef.current(color),
        );
        return () => cleanupColorPicker(iroPickerRef);
    }, []);

    useEffect(() => {
        resizeColorPicker(iroPickerRef.current, colorLightWidth);
    }, [colorLightWidth]);

    useEffect(() => {
        setColorPickerOptions(iroPickerRef.current, {
            layout: colorLightLayout,
            margin: marginBetweenPickers,
            wheelLightness: colorWheelLightness,
            sliderSize: (colorLightSliderWidth || 1) * 28,
            borderWidth: colorLightBorderWidth || 0,
            borderColor:
                !colorLightBorderColor ||
                (typeof colorLightBorderColor === 'string' && colorLightBorderColor.trim() === '')
                    ? theme.palette.primary.main
                    : colorLightBorderColor,
        });
    }, [
        theme.palette.primary.main,
        colorLightLayout,
        marginBetweenPickers,
        colorLightSliderWidth,
        colorLightBorderWidth,
        colorLightBorderColor,
        colorWheelLightness,
    ]);

    // Canvas direkt in das Wheel-Element einfügen/entfernen
    useEffect(() => {
        setTimeout(() => {
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
                console.log('zeichne Canvas');

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
                drawGamutTriangleOnCanvas(canvas, colorLightGamut, size, theme.palette.primary.main);
                wheelElem.style.position = 'relative';
                wheelElem.appendChild(canvas);
                canvasRef.current = canvas;
            }
        }, 0);

        // Cleanup bei Unmount oder Änderung
        return () => {
            if (canvasRef.current && canvasRef.current.parentElement) {
                canvasRef.current.parentElement.removeChild(canvasRef.current);
                canvasRef.current = null;
            }
        };
    }, [
        hasValueSlider,
        colorLightGamut,
        colorLightLayout,
        iroPickerRef.current?.base,
        colorLightWidth,
        theme.palette.primary.main,
    ]);

    return <Box ref={colorPickerRef} />;
};

export default Light2Picker;
