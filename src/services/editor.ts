import * as monaco from 'monaco-editor';

const STORAGE_KEY = 'editor::content';

export default function (element: HTMLElement) {
    const editor = monaco.editor.create(element, {
        language: 'sql',
        theme: 'vs-dark',
        automaticLayout: true
    });

    function setContent(content: string) {
        editor.setValue(content);
    }

    function restoreContent() {
        const content = localStorage.getItem(STORAGE_KEY);
        if (content) {
            setContent(content);
        }
    }

    return {
        setContent,
        restoreContent
    };
}