import iro from '@jaames/iro';
import { type ElementDimensions } from '../../hooks/useElementDimensions';
import { type Light2FieldsRxData } from '../../lib/light2Fields';

type IroLayout = Array<{
    component:
        | typeof iro.ui.Wheel
        | typeof iro.ui.GamutWheel // eslint-disable-line @typescript-eslint/no-redundant-type-constituents
        | typeof iro.ui.Box
        | typeof iro.ui.Slider;
    options?: Record<string, unknown>;
}>;

// Gibt das Layout für den ColorPicker zurück
export function getColorLightLayout(
    cctComponentNumber: number,
    colorLightUIComponent: Light2FieldsRxData['colorLightUIComponent'],
    colorLightType: Light2FieldsRxData['colorLightType'],
    colorLightCtMin: Light2FieldsRxData['colorLightCtMin'],
    colorLightCtMax: Light2FieldsRxData['colorLightCtMax'],
    colorLightGamut: Light2FieldsRxData['colorLightGamut'],
): IroLayout {
    // Runtime guard: fallback gamutWheel to wheel if gamut is 'none'
    if (colorLightUIComponent === 'gamutWheel' && (!colorLightGamut || colorLightGamut === 'none')) {
        colorLightUIComponent = 'wheel';
    }

    if (colorLightType === 'cct') {
        const cctLayout = [
            {
                component: iro.ui.Slider,
                options: {
                    sliderType: 'kelvin',
                    sliderShape: 'circle',
                    minTemperature: colorLightCtMin,
                    maxTemperature: colorLightCtMax,
                },
            },
            {
                component: iro.ui.Slider,
                options: { sliderType: 'value' },
            },
        ];
        // CCT spezifische Optionen
        return [cctLayout[cctComponentNumber - 1]];
    }
    switch (colorLightUIComponent) {
        case 'wheel':
            return [
                {
                    component: iro.ui.Wheel,
                    options: {},
                },
                {
                    component: iro.ui.Slider,
                    options: { sliderType: 'value' },
                },
            ];
        case 'gamutWheel':
            return [
                {
                    component: iro.ui.GamutWheel,
                    options: {},
                },
                {
                    component: iro.ui.Slider,
                    options: { sliderType: 'value' },
                },
            ];
        case 'box':
            return [
                {
                    component: iro.ui.Box,
                    options: { boxLightness: false },
                },
                {
                    component: iro.ui.Slider,
                    options: { sliderType: 'hue' },
                },
            ];
        case 'slider':
            return [
                { component: iro.ui.Slider, options: { sliderType: 'red' } },
                { component: iro.ui.Slider, options: { sliderType: 'green' } },
                { component: iro.ui.Slider, options: { sliderType: 'blue' } },
            ];
        default:
            return [];
    }
}

// Gibt die Breite für den ColorPicker zurück
export function getColorLightWidth(
    dimensions: ElementDimensions,
    colorLightUIComponent: Light2FieldsRxData['colorLightUIComponent'],
    colorLightType: Light2FieldsRxData['colorLightType'],
): number | undefined {
    if (colorLightType === 'cct') {
        return dimensions.height;
    }

    switch (colorLightUIComponent) {
        case 'wheel':
        case 'gamutWheel':
        case 'box':
            return dimensions.maxWidth;
        case 'slider':
            return dimensions.height;
        default:
            return 0;
    }
}

// Gibt den Abstand zwischen Pickern zurück
export function getMarginBetweenPickers(
    dimensions: ElementDimensions,
    colorLightUIComponent: Light2FieldsRxData['colorLightUIComponent'],
    colorLightSliderWidth: Light2FieldsRxData['colorLightSliderWidth'],
    colorLightType: Light2FieldsRxData['colorLightType'],
): number {
    if (['wheel', 'gamutWheel', 'box'].includes(colorLightUIComponent || '') || colorLightType === 'cct') {
        return dimensions.width! - dimensions.maxWidth! - ((colorLightSliderWidth || 1) * 28 + 2);
    }

    return (dimensions.width! - 3 * (colorLightSliderWidth || 1) * 28 - 2) / 2;
}
