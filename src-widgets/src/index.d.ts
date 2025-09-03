declare module '@iobroker/types-vis-2' {
    interface VisRxWidgetStateValues {
        [key: `${string}.ack`]: boolean;
    }
}
import type { ThemeType } from '@iobroker/adapter-react-v5';
import type { type Theme, LegacyConnection, VisRxData } from '@iobroker/types-vis-2';

import type { StateFieldsRxData } from './lib/stateFields';
import type { CommonObjectFieldsRxData } from './lib/commonObjectFields';
import type { CommonFieldsRxData } from './lib/commonFields';
import type { DelayFieldsRxData } from './lib/delayFields';
import type { CheckboxFieldsRxData } from './lib/checkboxFields';
import type { SwitchFieldsRxData } from './lib/switchFields';
import type { SliderFieldsRxData } from './lib/sliderFields';
import type { RadioGroupFieldsRxData } from './lib/radioGroupFields';
import type { ButtonGroupFieldsRxData } from './lib/buttonGroupFields';
import type { SelectFieldsRxData } from './lib/selectFields';
import type { GaugeFieldsRxData } from './lib/gaugeFields';
import type { DialogFieldsRxData } from './lib/dialogFields';
import type { LightFieldsRxData } from './lib/lightFields';
import type { Light2FieldsRxData } from './lib/light2Fields';
import type { CSSProperties } from 'react';

export interface CollectionContextProps<T> {
    id: string;
    refService: React.RefObject<HTMLElement>;
    style: React.CSSProperties;
    widget: {
        data: VisRxData & T;
        style: CSSProperties;
    };
    setValue: (id: string, value: string | number | boolean | ioBroker.SettableState | null, ack?: boolean) => void;
    setState: React.Component['setState'];
    values: VisRxWidgetStateValues;
    isSignalVisible: (index: number) => boolean;
    getPropertyValue: (stateName: string) => ioBroker.StateValue;
    hasPropertyValueChanged: (stateName: string) => boolean;
    mode: ThemeType;
    socket: LegacyConnection;
    theme: Theme;
    wrappedContent: boolean;
    getWidgetView: (viewName: string, options?: { style?: React.CSSProperties }) => React.ReactElement;
    editMode?: boolean;
}

export type AllCollectionContextProps = CollectionContextProps<
    DialogFieldsRxData &
        StateFieldsRxData &
        CheckboxFieldsRxData &
        SwitchFieldsRxData &
        SliderFieldsRxData &
        RadioGroupFieldsRxData &
        ButtonGroupFieldsRxData &
        SelectFieldsRxData &
        GaugeFieldsRxData &
        LightFieldsRxData &
        Light2FieldsRxData &
        CommonObjectFieldsRxData &
        CommonFieldsRxData &
        DelayFieldsRxData
>;

// Spezifische Context-Types für einzelne Widgets
export type DialogCollectionContextProps = CollectionContextProps<
    DialogFieldsRxData & CommonObjectFieldsRxData & CommonFieldsRxData
>;

export type StateCollectionContextProps = CollectionContextProps<
    StateFieldsRxData & CommonObjectFieldsRxData & CommonFieldsRxData & DelayFieldsRxData
>;
export type CheckboxCollectionContextProps = CollectionContextProps<
    CheckboxFieldsRxData & CommonObjectFieldsRxData & CommonFieldsRxData & DelayFieldsRxData
>;
export type SwitchCollectionContextProps = CollectionContextProps<
    SwitchFieldsRxData & CommonObjectFieldsRxData & CommonFieldsRxData & DelayFieldsRxData
>;
export type SliderCollectionContextProps = CollectionContextProps<
    SliderFieldsRxData & CommonObjectFieldsRxData & CommonFieldsRxData & DelayFieldsRxData
>;
export type RadioGroupCollectionContextProps = CollectionContextProps<
    RadioGroupFieldsRxData & CommonObjectFieldsRxData & CommonFieldsRxData & DelayFieldsRxData
>;
export type ButtonGroupCollectionContextProps = CollectionContextProps<
    ButtonGroupFieldsRxData & CommonObjectFieldsRxData & CommonFieldsRxData & DelayFieldsRxData
>;
export type SelectCollectionContextProps = CollectionContextProps<
    SelectFieldsRxData & CommonObjectFieldsRxData & CommonFieldsRxData & DelayFieldsRxData
>;
export type GaugeCollectionContextProps = CollectionContextProps<
    GaugeFieldsRxData & CommonObjectFieldsRxData & CommonFieldsRxData
>;
export type LightCollectionContextProps = CollectionContextProps<
    LightFieldsRxData & CommonObjectFieldsRxData & CommonFieldsRxData & DelayFieldsRxData
>;

export type Light2CollectionContextProps = CollectionContextProps<
    Light2FieldsRxData & CommonObjectFieldsRxData & CommonFieldsRxData & DelayFieldsRxData
>;

export type TemplateCollectionContextProps = CollectionContextProps<CommonObjectFieldsRxData & CommonFieldsRxData>;
