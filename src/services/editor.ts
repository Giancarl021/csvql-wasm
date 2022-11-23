import * as monaco from 'monaco-editor';

const STORAGE_KEY = 'editor::content';

export default function (element: HTMLElement) {
    const editor = monaco.editor.create(element, {
        language: 'sql',
        theme: 'vs-dark',
    });

    function restoreContent() {
        const content = localStorage.getItem(STORAGE_KEY);
        if (content) {
            editor.setValue(content);
        }
    }

    return {
        restoreContent
    };
}