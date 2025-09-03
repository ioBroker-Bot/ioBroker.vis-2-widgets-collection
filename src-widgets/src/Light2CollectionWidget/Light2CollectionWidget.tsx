import React from 'react';
import { type Light2CollectionContextProps } from 'src';
import Generic from '../Generic';
import withCollectionProvider from '../components/withCollectionProvider';
import commonFields, { type CommonFieldsRxData } from '../lib/commonFields';
import { type CommonObjectFieldsRxData } from '../lib/commonObjectFields';
import delayFields from '../lib/delayFields';
import light2Fields from '../lib/light2Fields';

import Light2Collection from './Light2Collection';

import type { RxWidgetInfo, RxRenderWidgetProps, RxWidgetInfoAttributesField, WidgetData } from '@iobroker/types-vis-2';

class Light2CollectionWidget extends Generic<CommonObjectFieldsRxData & CommonFieldsRxData> {
    static getWidgetInfo(): RxWidgetInfo {
        return {
            id: 'tplLight2CollectionWidget',
            visSet: 'vis-2-widgets-collection', // Widget set name in which this widget is located
            visSetLabel: 'widgets_collection', // Widget set translated label (should be defined only in one widget of a set)
            visName: 'Light2CollectionWidget', // Name of widget
            visWidgetLabel: 'light_collection_widget', // Label for widget
            visOrder: 11,
            visAttrs: [
                {
                    name: 'common', // group name
                    fields: [...commonFields({ groupName: '', allFields: true })],
                },
                {
                    name: 'light', // group name
                    label: 'group_light',
                    fields: [
                        // ...commonObjectFields(["boolean"]),
                        ...delayFields(),
                        ...light2Fields(),
                    ] as RxWidgetInfoAttributesField[], // muss optimiert werden
                },
                {
                    name: 'values',
                    label: 'values',
                    indexFrom: 1,
                    indexTo: 'values_count',
                    fields: [...commonFields({ groupName: '', allFields: false })],
                    hidden: (data: WidgetData) => !data.colorLightButton,
                },
                // check here all possible types https://github.com/ioBroker/ioBroker.vis/blob/react/src/src/Attributes/Widget/SCHEMA.md
            ],
            visDefaultStyle: {
                width: '100%',
                height: '100px',
                position: 'relative',
            },
            visPrev: 'widgets/vis-2-widgets-collection/img/prev-collection-light.png',
        };
    }

    // Do not delete this method. It is used by vis to read the widget configuration.
    // eslint-disable-next-line class-methods-use-this
    getWidgetInfo(): RxWidgetInfo {
        return Light2CollectionWidget.getWidgetInfo();
    }

    // eslint-disable-next-line class-methods-use-this
    propertiesUpdate(): void {
        // The widget has 3 important states
        // 1. this.state.values - contains all state values, that are used in widget (automatically collected from widget info).
        //                        So you can use `this.state.values[this.state.rxData.oid + '.val']` to get the value of state with id this.state.rxData.oid
        // 2. this.state.rxData - contains all widget data with replaced bindings. E.g. if this.state.data.type is `{system.adapter.admin.0.alive}`,
        //                        then this.state.rxData.type will have state value of `system.adapter.admin.0.alive`
        // 3. this.state.rxStyle - contains all widget styles with replaced bindings. E.g. if this.state.styles.width is `{javascript.0.width}px`,
        //                        then this.state.rxData.type will have state value of `javascript.0.width` + 'px
        // console.log("inside propertiesUpdate", this.state.values);
        /* const actualRxData = JSON.stringify(this.state.rxData);
        if (this.lastRxData === actualRxData) {
            return;
        }
        this.lastRxData = actualRxData;

        await this.createStateObjectAsync('oid'); */
    }

    // This function is called every time when rxData is changed
    onRxDataChanged(): void {
        this.propertiesUpdate();
    }

    // This function is called every time when rxStyle is changed
    // eslint-disable-next-line class-methods-use-this
    onRxStyleChanged(): void {}

    // This function is called every time when some Object State updated, but all changes lands into this.state.values too
    // eslint-disable-next-line class-methods-use-this
    onStateUpdated(_id: string, _state: ioBroker.State): void {}

    componentDidMount(): void {
        super.componentDidMount();
        // Update data
        this.propertiesUpdate();
    }

    renderWidgetBody(props: RxRenderWidgetProps): React.JSX.Element | React.JSX.Element[] | null {
        super.renderWidgetBody(props);

        const collectionContext = {
            id: props.id,
            refService: props.refService,
            style: props.style,
            widget: {
                // ...props.widget,
                data: this.state.rxData,
                style: this.state.rxStyle,
            },
            setValue: this.setValue,
            setState: this.setState.bind(this),
            // oidObject: this.state.oidObject,
            values: this.state.values,
            isSignalVisible: this.isSignalVisible.bind(this),
            getPropertyValue: this.getPropertyValue.bind(this),
            hasPropertyValueChanged: this.hasPropertyValueChanged.bind(this),
            mode: this.props.context.themeType,
            socket: this.props.context.socket,
            theme: this.props.context.theme,

            wrappedContent: this.wrappedCollectionContent,
            editMode: this.state.editMode,
        } as Light2CollectionContextProps;

        if (props.widget.data.noCard || props.widget.usedInWidget) {
            this.wrappedCollectionContent = false;
        } else {
            this.wrappedCollectionContent = true;
        }

        return withCollectionProvider(this.wrapContent(<Light2Collection />), collectionContext);
    }
}

export default Light2CollectionWidget;
