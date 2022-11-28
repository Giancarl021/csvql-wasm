interface ViewElements {
    editor: HTMLElement;
    tables: HTMLElement;
    results: HTMLElement;
    commands: {
        execAll: HTMLButtonElement;
        execSelection: HTMLButtonElement;
        clearResults: HTMLButtonElement;
        downloadFile: HTMLButtonElement;
        uploadFile: HTMLButtonElement;
        uploadCsv: HTMLButtonElement;
    }
};

export default ViewElements;