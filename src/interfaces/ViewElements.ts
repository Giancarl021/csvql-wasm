interface ViewElements {
    editor: HTMLElement;
    tables: HTMLElement;
    results: HTMLElement;
    commands: {
        execAll: HTMLButtonElement;
        execSelection: HTMLButtonElement;
        clearResults: HTMLButtonElement;
        downloadFile: HTMLButtonElement;
        uploadSqlite: HTMLButtonElement;
        uploadCsv: HTMLButtonElement;
    };
    hiddenFileInput: HTMLInputElement;
    modals: {
        loading: HTMLDivElement;
        error: HTMLDivElement;
        dropArea: HTMLDivElement;
    };
}

export default ViewElements;
