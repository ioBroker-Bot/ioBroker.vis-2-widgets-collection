import { Box, Divider, IconButton, SvgIcon } from '@mui/material';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import { useContext, useMemo, useRef, useState } from 'react';
import CollectionBase from '../components/CollectionBase';
import { CollectionContext } from '../components/CollectionProvider';
import useData from '../hooks/useData';
import useOidValue from '../hooks/useOidValue';
import useElementDimensions from '../hooks/useElementDimensions';
import LightPicker from './Light2Picker';
import type iro from '@jaames/iro';
import ColorWheelSvg from '../img/colorWheel.svg?react';
import { getMarginBetweenPickers } from './colorPickerUtils/colorPickerMemos';
import useValueState from '../hooks/useValueState';

const ColorWheelIcon: React.FC<React.ComponentProps<typeof SvgIcon>> = props => (
    <SvgIcon
        component={ColorWheelSvg}
        viewBox="0 0 128 128"
        {...props}
    />
);

const CctWhiteIcon: React.FC<React.ComponentProps<typeof SvgIcon>> = props => (
    <SvgIcon
        viewBox="0 0 512 512"
        {...props}
    >
        <defs>
            <linearGradient
                id="cctGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
            >
                <stop
                    offset="0%"
                    stopColor="#1E90FF"
                />
                <stop
                    offset="100%"
                    stopColor="#FF8C00"
                />
            </linearGradient>

            {/* Optionaler Schlagschatten-Filter für Tiefe */}
            <filter
                id="insetShadow"
                x="-50%"
                y="-50%"
                width="200%"
                height="200%"
            >
                <feOffset
                    dx="0"
                    dy="2"
                />
                <feGaussianBlur
                    stdDeviation="4"
                    result="offset-blur"
                />
                <feComposite
                    operator="out"
                    in="SourceGraphic"
                    in2="offset-blur"
                    result="inverse"
                />
                <feFlood
                    floodColor="#FFF176"
                    floodOpacity="0.4"
                />
                <feComposite
                    in2="inverse"
                    operator="in"
                    result="shadow"
                />
                <feComposite
                    in="shadow"
                    in2="SourceGraphic"
                    operator="over"
                />
            </filter>
        </defs>

        {/* Dicker, kräftiger Außenrand */}
        <circle
            cx="256"
            cy="256"
            r="252"
            fill="#FFF176"
        />

        {/* Deutlich kleinerer innerer Kreis mit Verlauf & Schatteneffekt */}
        <circle
            cx="256"
            cy="256"
            r="240"
            fill="url(#cctGradient)"
            filter="url(#insetShadow)"
        />

        {/* Vergrößertes Lampensymbol */}
        <g transform="translate(256 280) scale(1.2) translate(-256 -256)">
            <path
                d="M192 200c0-35 29-64 64-64s64 29 64 64c0 23.1-12.2 43.5-30.6 55.3V288c0 8.8-7.2 16-16 16h-35c-8.8 0-16-7.2-16-16v-32.7C204.2 243.5 192 223.1 192 200zm56 136h16c4.4 0 8 3.6 8 8v16h-32v-16c0-4.4 3.6-8 8-8z"
                fill="#FFF176"
                stroke="#000000"
                strokeWidth="4"
            />
        </g>
    </SvgIcon>
);

function Light2Collection(): React.ReactElement {
    console.log('Light2Collection rendered');
    function getInitialColor({
        rgbHexValue,
        redValue,
        greenValue,
        blueValue,
        hueValue,
        saturationValue,
        brightnessValue,
    }: {
        rgbHexValue?: string;
        redValue?: number;
        greenValue?: number;
        blueValue?: number;
        hueValue?: number;
        saturationValue?: number;
        brightnessValue?: number;
    }): string | iro.Color['hsv'] | iro.Color['rgb'] | undefined {
        if (rgbHexValue) {
            return rgbHexValue;
        }
        if (typeof redValue === 'number' && typeof greenValue === 'number' && typeof blueValue === 'number') {
            // iro.js akzeptiert {r,g,b}
            return { r: redValue, g: greenValue, b: blueValue };
        }
        if (
            typeof hueValue === 'number' &&
            typeof saturationValue === 'number' &&
            typeof brightnessValue === 'number'
        ) {
            // iro.js akzeptiert {h,s,v}
            return { h: hueValue, s: saturationValue, v: brightnessValue };
        }
        return undefined;
    }

    // State für die Kelvin-Farbe
    const [kelvinColor, setKelvinColor] = useState<iro.Color['hsv'] | null>(null);

    const context = useContext(CollectionContext);
    const {
        widget,
        widget: { data: rxData },
    } = context;

    const { data } = useData('oid');
    const oidValue = useOidValue('oid');

    const boxRef = useRef<HTMLDivElement>(null);
    const dimensions = useElementDimensions(boxRef.current);

    // Type-safe Zugriff auf das OID Object
    const colorLightSwitchOidObject = widget.data.colorLightSwitchOidObject;
    const oidType = colorLightSwitchOidObject?.type;
    const isValidType = oidType === 'boolean';

    // ON/OFF
    const { value: onOffValue, updateValue: setOnOffValueState } = useValueState('colorLightSwitchOid');

    // Temperature
    /* const {
        value: temperatureValue,
        hasValueChanged: temperatureChanged,
        updateValue: setTemperatureValueState,
    } = useValueState('colorLightTemperatureOid'); */

    // RGB
    /* const {
        value: rgbHexValue,
        hasValueChanged: rgbHexChanged,
        updateValue: setRgbHexValueState,
    } = useValueState('colorLightRgbHexOid'); */

    // R/G/B
    /* const {
        value: redValue,
        hasValueChanged: redChanged,
        updateValue: setRedValueState,
    } = useValueState('colorLightRedOid');
    const {
        value: greenValue,
        hasValueChanged: greenChanged,
        updateValue: setGreenValueState,
    } = useValueState('colorLightGreenOid');
    const {
        value: blueValue,
        hasValueChanged: blueChanged,
        updateValue: setBlueValueState,
    } = useValueState('colorLightBlueOid'); */

    // H/S/V
    /* const {
        value: hueValue,
        hasValueChanged: hueChanged,
        updateValue: setHueValueState,
    } = useValueState('colorLightHueOid');
    const {
        value: saturationValue,
        hasValueChanged: saturationChanged,
        updateValue: setSaturationValueState,
    } = useValueState('colorLightSaturationOid');
    const {
        value: brightnessValue,
        hasValueChanged: brightnessChanged,
        updateValue: setBrightnessValueState,
    } = useValueState('colorLightBrightnessOid'); */

    const marginBetweenPickers = useMemo(
        () =>
            getMarginBetweenPickers(
                dimensions,
                rxData.colorLightUIComponent,
                rxData.colorLightSliderWidth,
                rxData.colorLightType,
            ),
        [dimensions, rxData.colorLightUIComponent, rxData.colorLightSliderWidth, rxData.colorLightType],
    );

    const initHandler = (color: iro.Color): void => {
        console.log('init - color:', color);
    };

    const cctInputChangeHandler = (color: iro.Color): void => {
        console.log('cctInputChange - color:', color);
        console.log('gamut', color.gamutType);
    };

    // Handler für Kelvin-Slider
    const kelvinInputChangeHandler = (color: iro.Color): void => {
        console.log('kelvinInputChange - color:', color);
        setKelvinColor(color.hsv);
        // Optional: weitere Logik
    };

    return (
        <CollectionBase
            isValidType={isValidType}
            data={data}
            oidValue={oidValue}
        >
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignSelf: 'stretch',
                    mt: 0.5,
                }}
            >
                <IconButton
                    onClick={() => {
                        if (onOffValue) {
                            setOnOffValueState(false);
                        } else {
                            setOnOffValueState(true);
                        }
                    }}
                >
                    <PowerSettingsNewIcon
                        sx={{
                            color: onOffValue ? 'red' : 'green',
                            width: '1.1em',
                            height: '1.1em',
                        }}
                    />
                </IconButton>
                <Divider
                    flexItem
                    variant="fullWidth"
                    sx={{
                        mx: 0.5,
                        my: 1,
                    }}
                />
                <IconButton>
                    <ColorWheelIcon
                        sx={{
                            width: '1.1em',
                            height: '1.1em',
                        }}
                    />
                </IconButton>
                <IconButton>
                    <CctWhiteIcon
                        sx={{
                            width: '1.1em',
                            height: '1.1em',
                        }}
                    />
                </IconButton>
            </Box>
            <Divider
                orientation="vertical"
                flexItem
                variant="middle"
            />

            <Box
                ref={boxRef}
                sx={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    p: Number(rxData.colorLightPadding) || 0,
                }}
            >
                <LightPicker
                    cctComponentNumber={1} // kelvin
                    dimensions={dimensions}
                    marginBetweenPickers={marginBetweenPickers}
                    onInputChange={cctInputChangeHandler}
                    onColorInit={initHandler}
                    colorLightGamut={rxData.colorLightGamut}
                    colorWheelLightness={rxData.colorWheelLightness}
                    colorLightUIComponent={rxData.colorLightUIComponent}
                    colorLightSliderWidth={rxData.colorLightSliderWidth}
                    colorLightBorderWidth={rxData.colorLightBorderWidth}
                    colorLightBorderColor={rxData.colorLightBorderColor}
                    colorLightType={rxData.colorLightType}
                    colorLightCtMin={rxData.colorLightCtMin}
                    colorLightCtMax={rxData.colorLightCtMax}
                    /* color={getInitialColor({
                        rgbHexValue,
                        redValue,
                        greenValue,
                        blueValue,
                        hueValue,
                        saturationValue,
                        brightnessValue,
                    })} */
                />

                {rxData.colorLightType === 'cct' ? (
                    <Box sx={{ ml: `${marginBetweenPickers}px` }}>
                        <LightPicker
                            cctComponentNumber={2} // brightness
                            onColorInit={initHandler}
                            onInputChange={cctInputChangeHandler}
                            dimensions={dimensions}
                            marginBetweenPickers={marginBetweenPickers}
                            colorLightGamut={rxData.colorLightGamut}
                            colorWheelLightness={rxData.colorWheelLightness}
                            colorLightUIComponent={rxData.colorLightUIComponent}
                            colorLightSliderWidth={rxData.colorLightSliderWidth}
                            colorLightBorderWidth={rxData.colorLightBorderWidth}
                            colorLightBorderColor={rxData.colorLightBorderColor}
                            colorLightType={rxData.colorLightType}
                            colorLightCtMin={rxData.colorLightCtMin}
                            colorLightCtMax={rxData.colorLightCtMax}
                            // NEU: Kelvin-Farbe als Prop übergeben
                            color={kelvinColor ? kelvinColor : undefined}
                        />
                    </Box>
                ) : null}
            </Box>
        </CollectionBase>
    );
}

export default Light2Collection;
