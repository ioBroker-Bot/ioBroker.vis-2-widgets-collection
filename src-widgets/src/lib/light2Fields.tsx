import CollectionDivider from '../components/CollectionDivider';
import { oidChangeHandlerAsync } from './commonObjectFields';

import type { LegacyConnection } from '@iobroker/adapter-react-v5';
import type { RxWidgetInfoAttributesField, WidgetData } from '@iobroker/types-vis-2';

const PowerSettingsNewIcon =
    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBmaWxsPSJjdXJyZW50Q29sb3IiIGQ9Ik0xMyAzaC0ydjEwaDJWM3ptNC44MyAyLjE3bC0xLjQyIDEuNDJBNi45MiA2LjkyIDAgMCAxIDE5IDEyYzAgMy44Ny0zLjEzIDctNyA3QTYuOTk1IDYuOTk1IDAgMCAxIDcuNTggNi41OEw2LjE3IDUuMTdBOC45MzIgOC45MzIgMCAwIDAgMyAxMmE5IDkgMCAwIDAgMTggMGMwLTIuNzQtMS4yMy01LjE4LTMuMTctNi44M3oiLz48L3N2Zz4=';

export interface Light2FieldsRxData {
    colorLightButton?: boolean;
    colorLightDelayLongPress?: number;
    colorLightModalWidth?: number;
    colorLightModalHeight?: number;
    colorLightSliderWidth?: number;
    colorLightBorderWidth?: number;
    colorLightBorderColor?: string;
    colorLightPadding?: number;
    colorLightSwitchOid?: string;
    colorLightUIComponent?: 'wheel' | 'gamutWheel' | 'box' | 'slider';
    colorWheelLightness?: boolean;
    colorLightType?: 'none' | 'cct' | 'rgb' | 'rgbcct' | 'r/g/b' | 'r/g/b/cct' | 'h/s/v' | 'h/s/v/cct';
    colorLightTemperatureOid?: string;
    colorLightCtMin?: number;
    colorLightCtMax?: number;
    colorLightRgbHexOid?: string;
    colorLightRedOid?: string;
    colorLightGreenOid?: string;
    colorLightBlueOid?: string;
    colorLightHueOid?: string;
    colorLightSaturationOid?: string;
    colorLightBrightnessOid?: string;
    colorLightGamut?: 'none' | 'A' | 'B' | 'C';
}

// Extended WidgetData interface to include icon properties and value configurations
interface ExtendedWidgetData extends WidgetData, Light2FieldsRxData {
    values_count?: number;
    value1?: boolean;
    alias1?: string;
    value2?: boolean;
    alias2?: string;
    iconSize?: number;
    iconSmall1?: string;
    iconColor1?: string;
    iconSize1?: number;
    iconSmall2?: string;
    iconColor2?: string;
    iconSize2?: number;
}

// RGB role mappings based on ioBroker object roles
const RGB_ROLES: Record<string, keyof Light2FieldsRxData> = {
    'switch.light': 'colorLightSwitchOid',
    'level.color.rgb': 'colorLightRgbHexOid',
    'level.color.red': 'colorLightRedOid',
    'level.color.green': 'colorLightGreenOid',
    'level.color.blue': 'colorLightBlueOid',
    'level.color.hue': 'colorLightHueOid',
    'level.color.saturation': 'colorLightSaturationOid',
    'level.brightness': 'colorLightBrightnessOid',
    'level.dimmer': 'colorLightBrightnessOid',
    'level.color.temperature': 'colorLightTemperatureOid',
    // Note: These might need adjustment based on actual field names
    'level.color.luminance': 'colorLightBrightnessOid',
    'level.color.white': 'colorLightBrightnessOid',
};

const loadStatesAsync = async (
    field: RxWidgetInfoAttributesField,
    data: WidgetData,
    changeData: (newData: WidgetData) => void,
    socket: LegacyConnection,
): Promise<void> => {
    console.log('loadStatesAsync -> field', field);

    const fieldName = field.name;
    if (fieldName && data[fieldName]) {
        const object = await socket.getObject(data[fieldName] as string);

        if (object && object.common) {
            const id = (data[fieldName] as string).split('.');
            id.pop();
            const states = await socket.getObjectView(`${id.join('.')}.`, `${id.join('.')}.\u9999`, 'state');

            if (states) {
                const extendedData = data as ExtendedWidgetData;

                await Promise.all(
                    Object.values(states).map(async state => {
                        const role = state.common.role;

                        if (
                            role &&
                            RGB_ROLES[role] &&
                            (!data[role as keyof WidgetData] ||
                                data[role as keyof WidgetData] === 'nothing_selected') &&
                            fieldName !== role
                        ) {
                            const targetField = RGB_ROLES[role];
                            // Type-safe assignment using index signature
                            (extendedData as Record<string, any>)[targetField] = state._id;

                            await oidChangeHandlerAsync(
                                ['boolean', 'number', 'string', 'mixed'],
                                targetField as string,
                            )(field, data, changeData, socket);

                            if (targetField === 'colorLightTemperatureOid') {
                                if (!extendedData.colorLightCtMin && state.common.min) {
                                    extendedData.colorLightCtMin = state.common.min;
                                }
                                if (!extendedData.colorLightCtMax && state.common.max) {
                                    extendedData.colorLightCtMax = state.common.max;
                                }
                            }

                            if (targetField === 'colorLightSwitchOid') {
                                extendedData.values_count = 2;
                                extendedData.value1 = true;
                                extendedData.alias1 = 'TRUE';
                                extendedData.value2 = false;
                                extendedData.alias2 = 'FALSE';

                                extendedData.iconSize = 0;
                                extendedData.iconSmall1 = PowerSettingsNewIcon;
                                extendedData.iconColor1 = 'red';
                                extendedData.iconSize1 = 100;
                                extendedData.iconSmall2 = PowerSettingsNewIcon;
                                extendedData.iconColor2 = 'green';
                                extendedData.iconSize2 = 100;
                            }
                        }
                    }),
                );
                changeData(data);
            }
        }
    }
};

const light2Fields = (): RxWidgetInfoAttributesField[] => [
    {
        type: 'custom',
        component: () => <CollectionDivider />,
    },
    {
        name: 'colorLightGamut',
        type: 'select',
        label: 'color_light_gamut',
        options: [
            { value: 'none', label: 'default' },
            { value: 'A', label: 'A' },
            { value: 'B', label: 'B' },
            { value: 'C', label: 'C' },
        ],
        default: 'none',
        noTranslation: true,
        onChange: (_field, data, changeData) => {
            const rxData = data as Partial<Light2FieldsRxData>;

            // If gamut changed to 'none' and gamutWheel is selected, reset to wheel
            if (rxData.colorLightGamut === 'none' && rxData.colorLightUIComponent === 'gamutWheel') {
                changeData({
                    ...data,
                    colorLightUIComponent: 'wheel',
                });
            }
            return Promise.resolve();
        },
    },
    {
        type: 'custom',
        component: () => <CollectionDivider />,
    },
    {
        name: 'colorLightButton',
        label: 'color_light_button',
        type: 'checkbox',
        default: false,
    },
    {
        name: 'colorLightDelayLongPress',
        label: 'color_light_delay_long_press',
        type: 'number',
        default: 500,
        min: 0,
        max: 10000,
        step: 1,
        hidden: '!data.colorLightButton',
    },
    {
        name: 'colorLightModalWidth',
        label: 'color_light_modal_width',
        type: 'number',
        min: 0,
        max: 5000,
        step: 1,
        hidden: '!data.colorLightButton',
        tooltip: 'color_light_modal_width_tooltip',
    },
    {
        name: 'colorLightModalHeight',
        label: 'color_light_modal_height',
        type: 'number',
        default: 300,
        min: 0,
        max: 5000,
        step: 1,
        hidden: '!data.colorLightButton',
    },
    {
        type: 'custom',
        component: () => <CollectionDivider />,
    },
    {
        name: 'colorLightSliderWidth',
        label: 'color_light_slider_width',
        type: 'slider',
        min: 0,
        max: 10,
        default: 1,
        step: 0.1,
    },
    {
        name: 'colorLightBorderWidth',
        label: 'color_light_border_width',
        type: 'slider',
        min: 0,
        max: 100,
        default: 3,
        step: 1,
    },
    {
        name: 'colorLightBorderColor',
        label: 'color_light_border_color',
        type: 'color',
    },
    {
        name: 'colorLightPadding',
        type: 'number',
        label: 'color_light_padding',
        default: 1,
        step: 0.5,
        min: 0,
    },
    {
        type: 'custom',
        component: () => <CollectionDivider />,
    },
    {
        name: 'colorLightSwitchOid',
        type: 'id',
        label: 'color_light_switch_oid',
        onChange: loadStatesAsync,
    },
    {
        type: 'custom',
        component: () => <CollectionDivider />,
    },
    {
        name: 'colorLightUIComponent',
        type: 'select',
        label: 'color_light_ui_component',
        options: [
            { value: 'wheel', label: 'Wheel (HSV)' },
            { value: 'gamutWheel', label: 'Gamut Wheel (Perceptual)' },
            { value: 'box', label: 'Box' },
            { value: 'slider', label: 'Slider' },
        ],
        default: 'wheel',
        noTranslation: true,
        hidden: (data: WidgetData) =>
            (data as Partial<Light2FieldsRxData>).colorLightType === 'cct' ||
            (data as Partial<Light2FieldsRxData>).colorLightType === 'none',
        onChange: (_field, data, changeData) => {
            const rxData = data as Partial<Light2FieldsRxData>;

            // If gamutWheel selected but no valid gamut, reset to wheel
            if (
                rxData.colorLightUIComponent === 'gamutWheel' &&
                (!rxData.colorLightGamut || rxData.colorLightGamut === 'none')
            ) {
                changeData({
                    ...data,
                    colorLightUIComponent: 'wheel',
                });
            }
            return Promise.resolve();
        },
    },
    {
        name: 'colorWheelLightness',
        label: 'color_wheel_lightness',
        type: 'checkbox',
        default: false,
        hidden: (data: WidgetData) => {
            const rxData = data as Partial<Light2FieldsRxData>;
            return (
                rxData.colorLightType === 'none' ||
                rxData.colorLightType === 'cct' ||
                !['wheel', 'gamutWheel'].includes(rxData.colorLightUIComponent || '')
            );
        },
    },
    {
        type: 'custom',
        component: () => <CollectionDivider />,
        hidden: (data: WidgetData) =>
            (data as Partial<Light2FieldsRxData>).colorLightType === 'cct' ||
            (data as Partial<Light2FieldsRxData>).colorLightType === 'none',
    },
    {
        name: 'colorLightType',
        type: 'select',
        label: 'color_light_type',
        options: [
            { value: 'none', label: 'nothing_selected' },
            { value: 'cct', label: 'cct' },
            { value: 'rgb', label: 'rgb' },
            { value: 'rgbcct', label: 'rgb & cct' },
            { value: 'r/g/b', label: 'r/g/b' },
            { value: 'r/g/b/cct', label: 'r/g/b & cct' },
            { value: 'h/s/v', label: 'h/s/v' },
            { value: 'h/s/v/cct', label: 'h/s/v & cct' },
        ],
        default: 'none',
        noTranslation: true,
    },
    {
        type: 'custom',
        component: () => <CollectionDivider />,
        hidden: (data: WidgetData) => (data as Partial<Light2FieldsRxData>).colorLightType === 'none',
    },
    {
        name: 'colorLightTemperatureOid',
        type: 'id',
        label: 'color_light_temperature_oid',
        hidden: (data: WidgetData) =>
            !['cct', 'rgbcct', 'r/g/b/cct', 'h/s/v/cct'].includes(
                (data as Partial<Light2FieldsRxData>).colorLightType || '',
            ),
    },
    {
        name: 'colorLightCtMin',
        type: 'number',
        min: 500,
        max: 10000,
        default: 2000,
        label: 'color_light_ct_min',
        hidden: (data: WidgetData) =>
            !['cct', 'rgbcct', 'r/g/b/cct', 'h/s/v/cct'].includes(
                (data as Partial<Light2FieldsRxData>).colorLightType || '',
            ) || !(data as Partial<Light2FieldsRxData>).colorLightTemperatureOid,
    },
    {
        name: 'colorLightCtMax',
        type: 'number',
        min: 500,
        max: 10000,
        default: 6500,
        label: 'color_light_ct_max',
        hidden: (data: WidgetData) =>
            !['cct', 'rgbcct', 'r/g/b/cct', 'h/s/v/cct'].includes(
                (data as Partial<Light2FieldsRxData>).colorLightType || '',
            ) || !(data as Partial<Light2FieldsRxData>).colorLightTemperatureOid,
    },
    {
        type: 'custom',
        component: () => <CollectionDivider />,
        hidden: (data: WidgetData) =>
            !['cct', 'rgbcct', 'r/g/b/cct', 'h/s/v/cct'].includes(
                (data as Partial<Light2FieldsRxData>).colorLightType || '',
            ) || (data as Partial<Light2FieldsRxData>).colorLightType === 'none',
    },
    {
        name: 'colorLightRgbHexOid',
        type: 'id',
        label: 'color_light_rgb_hex_oid',
        hidden: (data: WidgetData) =>
            !['rgb', 'rgbcct'].includes((data as Partial<Light2FieldsRxData>).colorLightType || ''),
    },
    {
        name: 'colorLightRedOid',
        type: 'id',
        label: 'color_light_red_oid',
        hidden: (data: WidgetData) =>
            !['r/g/b', 'r/g/b/cct'].includes((data as Partial<Light2FieldsRxData>).colorLightType || ''),
    },
    {
        name: 'colorLightGreenOid',
        type: 'id',
        label: 'color_light_green_oid',
        hidden: (data: WidgetData) =>
            !['r/g/b', 'r/g/b/cct'].includes((data as Partial<Light2FieldsRxData>).colorLightType || ''),
    },
    {
        name: 'colorLightBlueOid',
        type: 'id',
        label: 'color_light_blue_oid',
        hidden: (data: WidgetData) =>
            !['r/g/b', 'r/g/b/cct'].includes((data as Partial<Light2FieldsRxData>).colorLightType || ''),
    },
    {
        name: 'colorLightHueOid',
        type: 'id',
        label: 'color_light_hue_oid',
        hidden: (data: WidgetData) =>
            !['h/s/v', 'h/s/v/cct'].includes((data as Partial<Light2FieldsRxData>).colorLightType || ''),
    },
    {
        name: 'colorLightSaturationOid',
        type: 'id',
        label: 'color_light_saturation_oid',
        hidden: (data: WidgetData) =>
            !['h/s/v', 'h/s/v/cct'].includes((data as Partial<Light2FieldsRxData>).colorLightType || ''),
    },
    {
        name: 'colorLightBrightnessOid',
        type: 'id',
        label: 'color_light_brightness_oid',
        hidden: (data: WidgetData) =>
            !['cct', 'h/s/v', 'h/s/v/cct'].includes((data as Partial<Light2FieldsRxData>).colorLightType || ''),
    },
];

export default light2Fields;
