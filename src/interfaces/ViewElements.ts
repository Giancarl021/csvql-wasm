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
};

export default ViewElements;