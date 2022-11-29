import * as monaco from 'monaco-editor';
import debounce, { seconds } from '../util/debounce';

const STORAGE_KEY = 'editor::content';

export default function (element: HTMLElement) {
    const editor = monaco.editor.create(element, {
        language: 'sql',
        theme: 'vs-dark',
        automaticLayout: true
    });

    const model = editor.getModel()!;

    editor.onDidChangeModelContent(
        debounce(() => {
            localStorage.setItem(STORAGE_KEY, editor.getValue());
        }, seconds(3))
    );

    function onExec(callback: () => Promise<void> | void) {
        editor.addCommand(
            monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter,
            callback
        );
    }

    function setContent(content: string) {
        editor.setValue(content);
    }

    function restoreContent() {
        const content = localStorage.getItem(STORAGE_KEY);
        if (content) {
            setContent(content);
        }
    }

    function getSelectionContent() {
        const selections = editor.getSelections();
        const queries: string[] = [];

        if (!selections || !selections.length) return '';

        for (const selection of selections) {
            if (selection.isEmpty()) continue;

            const query = model.getValueInRange(selection);

            if (!query) continue;

            queries.push(
                query.endsWith(';')
                    ? query.substring(0, query.length - 1)
                    : query
            );
        }

        return queries.join(';');
    }

    function getAllContent() {
        return editor.getValue();
    }

    return {
        setContent,
        restoreContent,
        getAllContent,
        getSelectionContent,
        onExec
    };
}
