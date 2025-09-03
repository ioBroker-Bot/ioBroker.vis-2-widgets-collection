import { useCallback, useContext, useEffect, useMemo, useRef } from 'react';
import type iro from '@jaames/iro';
import { Box } from '@mui/material';
import { type ElementDimensions } from '../hooks/useElementDimensions';
import { type Light2FieldsRxData } from '../lib/light2Fields';
import { getColorLightLayout, getColorLightWidth, getMarginBetweenPickers } from './colorPickerUtils/colorPickerMemos';
import { CollectionContext } from '../components/CollectionProvider';
import { drawGamutTriangleOnCanvas } from './colorPickerUtils/gamutMath';
// import { useIroEventBlocker } from './colorPickerUtils/useIroEventBlocker';

import {
    initializeColorPicker,
    cleanupColorPicker,
    resizeColorPicker,
    setColorPickerOptions,
    updateGamutCanvas,
    cleanupGamutCanvas,
} from './colorPickerUtils/colorPickerEffects';

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
    onGamutMouseUse?: (event: MouseEvent, inside: boolean) => void; // <--- NEU
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
    onGamutMouseUse, // <--- NEU
}) => {
    const { theme, editMode } = useContext(CollectionContext);
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

    const hasWheel = useMemo(
        () => colorLightUIComponent === 'wheel' && colorLightType !== 'cct',
        [colorLightUIComponent, colorLightType],
    );

    // Event-Blocker für Iro Color Picker aktivieren
    /* useIroEventBlocker({
        targetRef: boxRef,
        events: ['mousedown', 'mouseup', 'mousemove'],
        allowRef: lastInsideRef,
        isWheel: hasValueSlider,
    }); */

    // Color Picker initialisieren
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

    // Color Picker Größe anpassen
    useEffect(() => {
        resizeColorPicker(iroPickerRef.current, colorLightWidth);
    }, [colorLightWidth]);

    // Color Picker Optionen setzen
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
            updateGamutCanvas(
                editMode,
                canvasRef,
                iroPickerRef,
                hasWheel,
                colorLightGamut,
                colorLightWidth,
                theme.palette.primary.main,
                drawGamutTriangleOnCanvas,
                onGamutMouseUse, // <--- NEU
            );
        }, 0);

        return () => cleanupGamutCanvas(canvasRef);
    }, [hasWheel, colorLightGamut, colorLightWidth, theme.palette.primary.main, onGamutMouseUse, editMode]);

    return <Box ref={colorPickerRef} />;
};

export default Light2Picker;
