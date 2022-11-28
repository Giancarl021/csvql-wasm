export type CsvCallback = (data: string, filename: string) => void;
export type SqliteCallback = (data: Uint8Array) => void;

export default function (inputElement: HTMLInputElement) {
    const csvCallbacks: CsvCallback[] = [];
    const sqliteCallbacks: SqliteCallback[] = [];

    inputElement.onchange = async () => {
        const files = Array.from(inputElement.files ?? []);
        await parseFiles(files);
    };

    async function parseFiles(files: File[]) {
        if (files.length === 0) return;

        for (const file of files) {
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

    return {
        onSqliteUploaded,
        onCsvUploaded,
        fireUpload
    };
}