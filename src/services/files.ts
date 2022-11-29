export type CsvCallback = (data: string, filename: string) => void;
export type SqliteCallback = (data: Uint8Array) => void;
export type ErrorCallback = (err: Error) => void;
export type DragCallback = () => void;
export type CancelCallback = DragCallback;

export default function (inputElement: HTMLInputElement) {
    const csvCallbacks: CsvCallback[] = [];
    const sqliteCallbacks: SqliteCallback[] = [];
    const errorCallbacks: ErrorCallback[] = [];
    const cancelCallbacks: CancelCallback[] = [];
    const dragCallbacks: DragCallback[] = [];

    let dragCounter = 0;

    inputElement.onchange = async () => {
        const files = Array.from(inputElement.files ?? []);
        await parseFiles(files);
    };

    inputElement.onclick = () => {
        inputElement.setAttribute('data-fired', 'true');
    };

    document.body.onfocus = () => {
        if (inputElement.getAttribute('data-fired') !== 'true') return;

        inputElement.removeAttribute('data-fired');
        cancelCallbacks.forEach(cb => cb());
    };

    document.body.ondragenter = (event) => {
        event.preventDefault();
        event.stopPropagation();
        dragCounter++;
        dragCallbacks.forEach(cb => cb());
    };

    document.body.ondragleave = () => {
        dragCounter--;
        if (dragCounter === 0) {
            cancelCallbacks.forEach(cb => cb());
        }
    }

    document.body.ondragover = (event) => {
        event.preventDefault();
        event.stopPropagation();
    };

    document.body.ondrop = async event => {
        event.preventDefault();
        event.stopPropagation();

        const files = Array.from(event.dataTransfer?.files ?? []);

        if (files) await parseFiles(files);
    }
    async function parseFiles(files: File[]) {
        if (files.length === 0) return;

        for (const file of files) {
            if (file.size >= 1e+9) {
                errorCallbacks.forEach(cb => cb(new Error(`File ${file.name} exceeds 1GB`)));
                return;
            }

            if (file.name.endsWith('.csv')) {
                const content = await file.text();

                if (!content) continue;
                
                csvCallbacks.forEach(cb => cb(content, file.name));
            } else {
                const bin = await file.stream().getReader().read();

                if (!bin.value) continue;

                sqliteCallbacks.forEach(cb => cb(bin.value));
            }
        }
    }

    function fireUpload(...extensions: string[]) {
        inputElement.accept = extensions.join(',');
        inputElement.click();
    }

    function onSqliteUploaded(callback: SqliteCallback) {
        sqliteCallbacks.push(callback);
    }

    function onCsvUploaded(callback: CsvCallback) {
        csvCallbacks.push(callback);
    }

    function onError(callback: (err: Error) => void) {
        errorCallbacks.push(callback);
    }

    function onCancel(callback: CancelCallback) {
        cancelCallbacks.push(callback);
    }

    function onDrag(callback: DragCallback) {
        dragCallbacks.push(callback);
    }

    return {
        onSqliteUploaded,
        onCsvUploaded,
        onError,
        onCancel,
        onDrag,
        fireUpload
    };
}