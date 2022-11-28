interface ViewElements {
    editor: HTMLElement;
    tables: HTMLElement;
    results: HTMLElement;
    commands: {
        execAll: HTMLButtonElement;
        execSelection: HTMLButtonElement;
        clearResults: HTMLButtonElement;
    }
};

export default ViewElements;