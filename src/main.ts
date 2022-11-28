import 'bulma';
import 'bulmaswatch/slate/bulmaswatch.min.css';
import './scss/main.scss';
import 'setimmediate';

import Sql from './services/sql';
import Csv from './services/csv';
import View from './services/view';
import Editor from './services/editor';

async function main() {
    const view = View();
    const sql = await Sql();
    const csv = Csv(sql);
    const editor = Editor(view.elements.editor);

    editor.restoreContent();

    await csv.parse('Col1,Col2,Col3\n1,2,3\n4,5,6', {
        tableName: 'test'
    });

    view.setResults(sql.query('SELECT * FROM test; SELECT 1; SELECT 2; SELECT 4; SELECT 3; SELECT 6;'));
}

main().catch(console.error);
