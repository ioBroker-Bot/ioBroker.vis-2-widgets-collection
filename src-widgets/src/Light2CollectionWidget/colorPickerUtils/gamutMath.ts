// Philips Hue Gamut Definitionen
export const gamutTriangles = {
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
export function xyToRgb(x: number, y: number): { r: number; g: number; b: number } {
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
export function rgbToHsv(r: number, g: number, b: number): { h: number; s: number; v: number } {
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
export function drawGamutTriangleOnCanvas(
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
