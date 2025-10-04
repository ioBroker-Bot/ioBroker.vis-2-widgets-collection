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
            ),
        [cctComponentNumber, colorLightUIComponent, colorLightType, colorLightCtMin, colorLightCtMax],
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
                wheelDirection: 'clockwise',
                wheelAngle: 35,
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

    return <Box ref={colorPickerRef} />;
};

export default Light2Picker;
