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

        document.body.classList.remove('no-results');
    }

    function clearResults() {
        document.body.classList.add('no-results');
        resultElements.tabs.innerHTML = '';
        resultElements.content.innerHTML = '';
        resultElements.contents.length = 0;
    }

    function changeTabIndex(index: number, newIndex: number) {
        const tab = resultElements.tabs.querySelector(`div.tab[data-index="${index}"]`);

        if (!tab) throw new Error(`Tab with index ${index} not found`);

        tab.setAttribute('data-index', newIndex.toString());
    }

    function renameTab(tab: HTMLElement, newName: string) {
        const title = tab.querySelector('span.tab-title')!;

        title.textContent = newName;
    }

    function removeTab(index: number) {
        const tab = resultElements.tabs.querySelector(`div.tab[data-index="${index}"]`);

        if (!tab) throw new Error(`Tab with index ${index} not found`);

        const isActive = tab.classList.contains('is-active');

        for (let i = index + 1; i < resultElements.contents.length; i++) {
            const ni = i - 1;
            changeTabIndex(i, ni);
        }

        const tabs = Array.from(resultElements.tabs.querySelectorAll('.tab:not(.pinned)')).slice(index) as HTMLElement[];

        for (const tab of tabs) {
            renameTab(
                tab,
                `#${Number(tab.getAttribute('data-index')) + 1}`
            );
        }

        resultElements.tabs.removeChild(tab);
        resultElements.contents.splice(index, 1);

        if (resultElements.contents.length) {
            if (isActive) setActiveTab(index - 1 > 0 ? index - 1 : 0);
        } else {
            clearResults();
        }
    }

    // function pinTab(index: number) {
    //     const tab = elements.tables.children[index];
    //     tab.classList.add('pinned');
    // }

    function addTab(result: SqlResults) {
        const tab = document.createElement('div');

        tab.classList.add('tab');

        const tabIndex = resultElements.tabs.children.length;

        const tabTitle = document.createElement('span');

        tabTitle.classList.add('tab-title');
        tabTitle.textContent = `#${tabIndex + 1}`; 
        tabTitle.onclick = () => setActiveTab(Number(tab.getAttribute('data-index')!));

        const deleteButton = document.createElement('span');

        deleteButton.classList.add('tag', 'is-delete');
        deleteButton.onclick = () => removeTab(Number(tab.getAttribute('data-index')!));

        tab.appendChild(tabTitle);
        tab.appendChild(deleteButton);

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

        const tab = resultElements.tabs.querySelector(`div.tab[data-index="${index}"]`);

        if (!tab) throw new Error(`Tab with index ${index} not found`);

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
