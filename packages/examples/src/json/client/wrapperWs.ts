/* --------------------------------------------------------------------------------------------
 * Copyright (c) 2024 TypeFox and others.
 * Licensed under the MIT License. See LICENSE in the package root for license information.
 * ------------------------------------------------------------------------------------------ */

import getKeybindingsServiceOverride from '@codingame/monaco-vscode-keybindings-service-override';
// this is required syntax highlighting
import '@codingame/monaco-vscode-json-default-extension';
import { disposeEditor, startEditor, swapEditors } from '../../common/example-apps-common.js';
import { UserConfig } from 'monaco-editor-wrapper';
import { useWorkerFactory } from 'monaco-editor-wrapper/workerFactory';

export const configureMonacoWorkers = () => {
    // override the worker factory with your own direct definition
    useWorkerFactory({
        ignoreMapping: true,
        workerLoaders: {
            editorWorkerService: () => new Worker(new URL('monaco-editor/esm/vs/editor/editor.worker.js', import.meta.url), { type: 'module' })
        }
    });
};

let code = `{
    "$schema": "http://json.schemastore.org/coffeelint",
    "line_endings": {"value": "windows"}
}`;
const codeOriginal = `{
    "$schema": "http://json.schemastore.org/coffeelint",
    "line_endings": {"value": "unix"}
}`;

export const jsonClientUserConfig: UserConfig = {
    wrapperConfig: {
        serviceConfig: {
            userServices: {
                ...getKeybindingsServiceOverride(),
            },
            debugLogging: true
        },
        editorAppConfig: {
            $type: 'extended',
            codeResources: {
                main: {
                    text: code,
                    fileExt: 'json'
                },
                original: {
                    text: codeOriginal,
                    fileExt: 'json'
                }
            },
            useDiffEditor: false,

            userConfiguration: {
                json: JSON.stringify({
                    'workbench.colorTheme': 'Default Dark Modern',
                    'editor.guides.bracketPairsHorizontal': 'active',
                    'editor.lightbulb.enabled': 'On'
                })
            }
        }
    },
    languageClientConfig: {
        languageId: 'json',
        options: {
            $type: 'WebSocketUrl',
            url: 'ws://localhost:30000/sampleServer',
            startOptions: {
                onCall: () => {
                    console.log('Connected to socket.');
                },
                reportStatus: true
            },
            stopOptions: {
                onCall: () => {
                    console.log('Disconnected from socket.');
                },
                reportStatus: true
            }
        }
    }
};

export const runJsonWrapper = () => {
    try {
        const htmlElement = document.getElementById('monaco-editor-root');
        document.querySelector('#button-start')?.addEventListener('click', () => {
            startEditor(jsonClientUserConfig, htmlElement, code, codeOriginal);
        });
        document.querySelector('#button-swap')?.addEventListener('click', () => {
            swapEditors(jsonClientUserConfig, htmlElement, code, codeOriginal);
        });
        document.querySelector('#button-dispose')?.addEventListener('click', async () => {
            code = await disposeEditor(jsonClientUserConfig.wrapperConfig.editorAppConfig.useDiffEditor);
        });
    } catch (e) {
        console.error(e);
    }
};
