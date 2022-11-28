import { SqlMultiResults, SqlResults } from './../interfaces/SqlResult';
import ViewElements from '../interfaces/ViewElements';
import Schema from '../interfaces/Schema';

interface ResultElements {
    tabs: HTMLElement;
    content: HTMLElement;
    contents: (HTMLTableElement | HTMLDivElement)[];
    tableContent: HTMLUListElement;
}

export default function () {
    const elements: ViewElements = {
        editor: document.querySelector('#editor')!,
        tables: document.querySelector('#tables')!,
        results: document.querySelector('#results')!,
        commands: {
            execAll: document.querySelector(
                'section#commands button#btn-exec-all'
            ) as HTMLButtonElement,
            execSelection: document.querySelector(
                'section#commands button#btn-exec-selection'
            ) as HTMLButtonElement,
            clearResults: document.querySelector(
                'section#commands button#btn-clear'
            ) as HTMLButtonElement,
            downloadFile: document.querySelector(
                'section#commands button#btn-download'
            ) as HTMLButtonElement,
            uploadFile: document.querySelector(
                'section#commands button#btn-upload'
            ) as HTMLButtonElement,
            uploadCsv: document.querySelector(
                'section#commands button#btn-upload-csv'
            ) as HTMLButtonElement
        }
    };

    const resultElements = {
        tabs: elements.results.querySelector('.tabs')!,
        content: elements.results.querySelector('.content')!,
        contents: [],
        tableContent: elements.tables.querySelector('ul#content') as HTMLUListElement
    } as ResultElements;

    elements.commands.clearResults.onclick = () => clearResults();

    function setSchema(descriptor: Schema) {
        resultElements.tableContent.innerHTML = '';

        for (const table of descriptor) {
            const element = document.createElement('li');

            const tableName = document.createElement('h1');
            tableName.classList.add('table-title');
            tableName.textContent = table.tableName;

            const columns = document.createElement('ul');
            columns.classList.add('table-columns');

            tableName.onclick = () => {
                const wasActive = tableName.classList.contains('is-active'); 

                resultElements
                    .tableContent
                    .querySelectorAll('.is-active')
                    .forEach(el => el.classList.remove('is-active'));

                if (!wasActive) {
                    tableName.classList.add('is-active');
                    columns.classList.add('is-active');
                }
            };

            for (const column of table.columns) {
                const columnElement = document.createElement('li');
                columnElement.innerHTML = `${column.name} <span class="type-${column.type}">${column.type}</span>`;

                columns.appendChild(columnElement);
            }

            element.appendChild(tableName);
            element.appendChild(columns);

            resultElements.tableContent.appendChild(element);
        }
    }

    function setResults(results: SqlMultiResults) {
        clearResults();

        if (!results.length) {
            addTab('No return', false);
        }

        for (const result of results) addTab(result);

        if (resultElements.contents.length > 0) setActiveTab(0);

        document.body.classList.remove('no-results');
    }

    function setError(message: string) {
        clearResults();

        addTab(message, true);

        setActiveTab(0);

        document.body.classList.remove('no-results');
    }

    function clearResults() {
        const hasPinned = Boolean(
            resultElements.tabs.querySelector('div.tab.pinned')
        );

        if (hasPinned) {
            const nonPinnedTabs = Array.from(
                resultElements.tabs.querySelectorAll('div.tab:not(.pinned)')
            ) as HTMLElement[];

            for (const tab of nonPinnedTabs) {
                const index = Number(tab.getAttribute('data-index')!);
                removeTab(index);
            }
        } else {
            document.body.classList.add('no-results');
            resultElements.tabs.innerHTML = '';
            resultElements.content.innerHTML = '';
            resultElements.contents.length = 0;
        }
    }

    function changeTabIndex(index: number, newIndex: number) {
        const tab = resultElements.tabs.querySelector(
            `div.tab[data-index="${index}"]`
        );

        if (!tab) throw new Error(`Tab with index ${index} not found`);

        tab.setAttribute('data-index', newIndex.toString());
    }

    function renameTab(tab: HTMLElement, newName: string) {
        const title = tab.querySelector('span.tab-title')!;

        title.textContent = newName;
    }

    function removeTab(index: number) {
        const tab = resultElements.tabs.querySelector(
            `div.tab[data-index="${index}"]`
        );

        if (!tab) throw new Error(`Tab with index ${index} not found`);

        const isActive = tab.classList.contains('is-active');

        for (let i = index + 1; i < resultElements.contents.length; i++) {
            const ni = i - 1;
            changeTabIndex(i, ni);
        }

        const tabs = Array.from(
            resultElements.tabs.querySelectorAll('div.tab')
        ).slice(index) as HTMLElement[];

        for (const tab of tabs) {
            const prefix = tab.classList.contains('pinned') ? '^' : '#';
            const index = Number(tab.getAttribute('data-index')) + 1;

            renameTab(tab, `${prefix}${index}`);
        }

        resultElements.tabs.removeChild(tab);
        resultElements.contents.splice(index, 1);

        if (resultElements.contents.length) {
            if (isActive) setActiveTab(index - 1 > 0 ? index - 1 : 0);
        } else {
            clearResults();
        }
    }

    function pinTab(index: number) {
        const tab = resultElements.tabs.querySelector(
            `div.tab[data-index="${index}"]`
        ) as HTMLElement;

        if (!tab) throw new Error(`Tab with index ${index} not found`);

        tab.classList.add('pinned');

        const pinButton = tab.querySelector('span.tag.btn-pin') as HTMLElement;

        pinButton.textContent = '>';
        pinButton.onclick = () =>
            unpinTab(Number(tab.getAttribute('data-index')!));

        renameTab(tab, `^${index + 1}`);
    }

    function unpinTab(index: number) {
        const tab = resultElements.tabs.querySelector(
            `div.tab[data-index="${index}"]`
        ) as HTMLElement;

        if (!tab) throw new Error(`Tab with index ${index} not found`);

        tab.classList.remove('pinned');

        const pinButton = tab.querySelector('span.tag.btn-pin') as HTMLElement;

        pinButton.textContent = 'V';
        pinButton.onclick = () =>
            pinTab(Number(tab.getAttribute('data-index')!));

        renameTab(tab, `#${index + 1}`);
    }

    function addTab(result: SqlResults | string, isError: boolean = false) {
        const isSingleValue = typeof result === 'string';
        const tab = document.createElement('div');

        tab.classList.add('tab');

        const tabIndex = resultElements.tabs.children.length;

        const tabTitle = document.createElement('span');

        tabTitle.classList.add('tab-title');
        tabTitle.textContent = `#${tabIndex + 1}${isSingleValue ? (isError ? '(!)' : '(*)') : ''}`;
        tabTitle.onclick = () =>
            setActiveTab(Number(tab.getAttribute('data-index')!));

        const deleteButton = document.createElement('span');

        deleteButton.classList.add('tag', 'btn-delete');
        deleteButton.textContent = 'X';
        deleteButton.onclick = () =>
            removeTab(Number(tab.getAttribute('data-index')!));

        tab.appendChild(tabTitle);

        if (!isSingleValue) {
            const pinButton = document.createElement('span');
            pinButton.classList.add('tag', 'btn-pin');
            pinButton.textContent = 'V';
            pinButton.onclick = () =>
                pinTab(Number(tab.getAttribute('data-index')!));

            tab.appendChild(pinButton);
        }

        tab.appendChild(deleteButton);

        tab.setAttribute('data-index', String(tabIndex));

        const results: SqlResults = isSingleValue ? [{ [isError ? 'Error' : 'Message']: result }] : result;

        if (isSingleValue)
            tab.classList.add(isError ? 'error' : 'message');

        const table = document.createElement('table');
        table.classList.add(
            'table',
            'is-bordered',
            'is-hoverable',
            'is-fullwidth'
        );

        if (isSingleValue) {
            table.classList.add(isError ? 'error' : 'message');
        }

        const tbody = document.createElement('tbody');

        const headers = Object.keys(results[0]);

        const headerRow = document.createElement('tr');

        for (const header of headers) {
            const headerCell = document.createElement('th');
            headerCell.innerText = header;
            headerRow.appendChild(headerCell);
        }

        tbody.appendChild(headerRow);

        for (const row of results) {
            const rowElement = document.createElement('tr');
            for (const header of headers) {
                const cell = document.createElement('td');
                cell.innerText = row[header] as string;
                rowElement.appendChild(cell);
            }
            tbody.appendChild(rowElement);
        }

        table.appendChild(tbody);

        resultElements.tabs.appendChild(tab);

        resultElements.contents.push(table);
    }

    function setActiveTab(index: number) {
        resultElements.tabs
            .querySelector(`div.tab.is-active`)
            ?.classList.remove('is-active');

        const tab = resultElements.tabs.querySelector(
            `div.tab[data-index="${index}"]`
        );

        if (!tab) throw new Error(`Tab with index ${index} not found`);

        tab.classList.add('is-active');

        const content = resultElements.contents[index];
        resultElements.content.innerHTML = '';
        resultElements.content.appendChild(content);
    }

    function onExecAll(callback: () => void) {
        elements.commands.execAll.onclick = () => {
            elements.commands.execAll.classList.add('disabled');
            callback();
            elements.commands.execAll.classList.remove('disabled');
        };
    }

    function onExecSelection(callback: () => void) {
        elements.commands.execSelection.onclick = () => {
            elements.commands.execSelection.classList.add('disabled');
            callback();
            elements.commands.execSelection.classList.remove('disabled');
        };
    }

    function onDownload(callback: () => void) {
        elements.commands.downloadFile.onclick = () => {
            elements.commands.downloadFile.classList.add('disabled');
            callback();
            elements.commands.downloadFile.classList.remove('disabled');
        };
    }

    return {
        elements,
        setResults,
        setError,
        onExecAll,
        onDownload,
        onExecSelection,
        setSchema,
        clearResults
    };
}
