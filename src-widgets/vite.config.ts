import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import commonjs from 'vite-plugin-commonjs';
import vitetsConfigPaths from 'vite-tsconfig-paths';
import { federation } from '@module-federation/vite';
import { moduleFederationShared } from '@iobroker/types-vis-2/modulefederation.vis.config';
import { readFileSync } from 'node:fs';

const pack = JSON.parse(readFileSync('./package.json').toString());

export default defineConfig({
    plugins: [
        federation({
            manifest: true,
            name: 'vis2CollectionWidget',
            filename: 'customWidgets.js',
            exposes: {
                './StateCollectionWidget': './src/StateCollectionWidget/StateCollectionWidget',
                './SliderCollectionWidget': './src/SliderCollectionWidget/SliderCollectionWidget',
                './ButtonGroupCollectionWidget': './src/ButtonGroupCollectionWidget/ButtonGroupCollectionWidget',
                './SwitchCollectionWidget': './src/SwitchCollectionWidget/SwitchCollectionWidget',
                './CheckboxCollectionWidget': './src/CheckboxCollectionWidget/CheckboxCollectionWidget',
                './DialogCollectionWidget': './src/DialogCollectionWidget/DialogCollectionWidget',
                './SelectCollectionWidget': './src/SelectCollectionWidget/SelectCollectionWidget',
                './RadioGroupCollectionWidget': './src/RadioGroupCollectionWidget/RadioGroupCollectionWidget',
                './GaugeCollectionWidget': './src/GaugeCollectionWidget/GaugeCollectionWidget',
                './LightCollectionWidget': './src/LightCollectionWidget/LightCollectionWidget',
                './Light2CollectionWidget': './src/Light2CollectionWidget/Light2CollectionWidget',
                './translations': './src/translations',
            },
            remotes: {},
            shared: moduleFederationShared(pack),
        }),
        react(),
        svgr({
            include: ['**/*.svg?react'],
        }),
        vitetsConfigPaths(),
        commonjs(),
    ],
    server: {
        port: 3000,
        proxy: {
            '/_socket': 'http://localhost:8082',
            '/vis.0': 'http://localhost:8082',
            '/adapter': 'http://localhost:8082',
            '/habpanel': 'http://localhost:8082',
            '/vis': 'http://localhost:8082',
            '/widgets': 'http://localhost:8082/vis',
            '/widgets.html': 'http://localhost:8082/vis',
            '/web': 'http://localhost:8082',
            '/state': 'http://localhost:8082',
        },
    },
    base: './',
    build: {
        target: 'chrome89',
        outDir: './build',
        rollupOptions: {
            onwarn(warning, warn) {
                if (warning.code === 'MODULE_LEVEL_DIRECTIVE') {
                    return;
                }
                warn(warning);
            },
        },
    },
});
