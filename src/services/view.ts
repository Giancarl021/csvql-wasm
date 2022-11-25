import { SqlMultiResults, SqlResults } from './../interfaces/SqlResult';
import ViewElements from '../interfaces/ViewElements';

interface ResultElements {
    tabs: HTMLElement;
    content: HTMLElement;
    contents: HTMLTableElement[];
}

export default function () {
    const elements: ViewElements = {
        editor: document.querySelector('#editor')!,
        tables: document.querySelector('#tables')!,
        results: document.querySelector('#results')!
    };

    const resultElements = {
        tabs: elements.results.querySelector('.tabs')!,
        content: elements.results.querySelector('.content')!,
        contents: []
    } as ResultElements;

    function setResults(results: SqlMultiResults) {
        clearResults();

        for (const result of results) addTab(result);

        if (resultElements.contents.length > 0) setActiveTab(0);

        elements.results.style.display = 'block';
    }

    function clearResults() {
        elements.results.style.display = 'none';
        resultElements.tabs.innerHTML = '';
        resultElements.content.innerHTML = '';
        resultElements.contents.length = 0;
    }

    // function removeTab(index: number) {
    //     const tab = elements.tables.children[index];
    //     tab.remove();
    // }

    function addTab(result: SqlResults) {
        const tab = document.createElement('div');

        tab.classList.add('tab');

        const tabIndex = resultElements.tabs.children.length;

        tab.innerHTML = `<span>#${tabIndex + 1}</span>`;

        tab.onclick = () => setActiveTab(tabIndex);

        tab.setAttribute('data-index', String(tabIndex));

        const table = document.createElement('table');
        table.classList.add(
            'table',
            'is-bordered',
            'is-hoverable',
            'is-fullwidth'
        );

        const tbody = document.createElement('tbody');

        const headers = Object.keys(result[0]);

        const headerRow = document.createElement('tr');

        for (const header of headers) {
            const headerCell = document.createElement('th');
            headerCell.innerText = header;
            headerRow.appendChild(headerCell);
        }

        tbody.appendChild(headerRow);

        for (const row of result) {
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
        resultElements.tabs.querySelector(`div.tab.is-active`)?.classList.remove('is-active');

        const tab = resultElements.tabs.children[index];

        if (!tab) throw new Error(`Tab ${index} not exist`);

        tab.classList.add('is-active');

        const content = resultElements.contents[index];
        resultElements.content.innerHTML = '';
        resultElements.content.appendChild(content);
    }

    return {
        elements,
        setResults
    };
}
