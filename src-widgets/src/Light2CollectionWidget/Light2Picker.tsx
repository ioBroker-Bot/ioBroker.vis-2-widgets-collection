import { useCallback, useContext, useEffect, useMemo, useRef } from 'react';
import type iro from '@jaames/iro';
import { Box } from '@mui/material';
import { type ElementDimensions } from '../hooks/useElementDimensions';
import { type Light2FieldsRxData } from '../lib/light2Fields';
import { getColorLightLayout, getColorLightWidth } from './colorPickerUtils/colorPickerMemos';
import { CollectionContext } from '../components/CollectionProvider';
// import { useIroEventBlocker } from './colorPickerUtils/useIroEventBlocker';

import {
    initializeColorPicker,
    cleanupColorPicker,
    resizeColorPicker,
    setColorPickerOptions,
} from './colorPickerUtils/colorPickerEffects';

interface LightPickerProps {
    dimensions: ElementDimensions;
    marginBetweenPickers: number;
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
    color?: iro.Color['hsv']; // <--- NEU: hex-String oder iro.Color
}

const Light2Picker: React.FC<LightPickerProps> = ({
    dimensions,
    marginBetweenPickers,
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
    color,
}) => {
    // console.log('COLOR:', color);
    const { theme } = useContext(CollectionContext);
    const colorPickerRef = useRef<HTMLDivElement>(null);
    const iroPickerRef = useRef<iro.ColorPicker | null>(null);

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
    // onInputChangeRef.current = handleInputChange;

    const colorLightLayout = useMemo(
        () =>
            getColorLightLayout(
                cctComponentNumber,
                colorLightUIComponent,
                colorLightType,
                colorLightCtMin,
                colorLightCtMax,
                colorLightGamut,
            ),
        [cctComponentNumber, colorLightUIComponent, colorLightType, colorLightCtMin, colorLightCtMax, colorLightGamut],
    );

    const colorLightWidth = useMemo(
        () => getColorLightWidth(dimensions, colorLightUIComponent, colorLightType),
        [dimensions, colorLightUIComponent, colorLightType],
    );

    // Color Picker initialisieren
    useEffect(() => {
        initializeColorPicker(
            colorPickerRef,
            iroPickerRef,
            {
                // color: '#ffffff',
                gamut: colorLightGamut,
                // wheelDirection: 'clockwise',
                wheelAngle: 34,
                // matrixProfile: 'srgb_d65', // Matrix profile selection for RGB↔XYZ color space transformations
                //
                // IMPORTANT: Choose the appropriate matrix profile based on your use case:
                //
                // Option 1: 'srgb_d65' (Native sRGB D65 - Recommended for web/display applications)
                //   - Uses standard D65 white point (0.3127, 0.3290) - daylight illuminant
                //   - Matches CSS color specifications and browser rendering
                //   - Best for typical web applications WITHOUT smart lighting integration
                //   - Ensures color accuracy with standard sRGB workflows
                //   - Use when: Building standard ioBroker visualizations for displays
                //
                // Option 2: 'nodehue_d50_typo' (DEFAULT - Philips Hue Compatible)
                //   - Uses D50 white point (0.3457, 0.3585) - ICC Profile Connection Space
                //   - Matches node-hue-api library and Philips Hue ecosystem
                //   - Includes historical typo for backward compatibility with Hue systems
                //   - Best for Philips Hue smart bulb integration
                //   - Use when: Controlling Hue lights or need compatibility with existing Hue installations
                //
                // Option 3: 'icc_d50_corrected' (Corrected D50 - Professional color management)
                //   - Uses D50 white point with mathematically correct ICC matrices
                //   - Best for professional color management workflows
                //   - Use when: Accuracy matters more than Hue compatibility
                //
                // The matrix profile affects:
                //   - xy chromaticity coordinates (used by smart lighting APIs)
                //   - Gamut clamping behavior (white point used as radial projection anchor)
                //   - Does NOT affect RGB, HSV, or HSL color operations
                //
                // For ioBroker visualization widgets displaying colors on screens:
                //   → Uncomment and use 'srgb_d65' for best web/display color accuracy
                //
                // For ioBroker widgets controlling Philips Hue lights:
                //   → Keep default (omit matrixProfile) or explicitly set 'nodehue_d50_typo'
                //
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Color Picker Optionen setzen
    useEffect(() => {
        if (iroPickerRef.current) {
            console.log('colorLightLayout:', colorLightLayout);
        }
        setColorPickerOptions(iroPickerRef.current, {
            layout: colorLightLayout,
            gamut: colorLightGamut,
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
        colorLightGamut,
        colorLightBorderColor,
        colorWheelLightness,
    ]);

    // Color Picker Größe anpassen
    useEffect(() => {
        resizeColorPicker(iroPickerRef.current, colorLightWidth);
    }, [colorLightWidth]);

    // NEU: Picker-Farbe aktualisieren, wenn Prop 'color' sich ändert
    useEffect(() => {
        if (color && iroPickerRef.current) {
            // iroPickerRef.current.color.hue = color.h!;
            // iroPickerRef.current.color.saturation = color.s!;
            // console.log('SET COLOR:', color);
            // iroPickerRef.current.color.rgb = color;
        }
    }, [color]);

    console.log('iroPickerRef:', iroPickerRef.current);

    return <Box ref={colorPickerRef} />;
};

export default Light2Picker;
