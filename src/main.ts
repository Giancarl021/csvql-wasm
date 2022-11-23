import 'bulma';
import 'bulmaswatch/superhero/bulmaswatch.min.css';
import './scss/main.scss';
import 'setimmediate';

import Sql from './services/sql';
import Csv from './services/csv';
import Editor from './services/editor';

async function main() {
    const sql = await Sql();
    const csv = Csv(sql);
    const editor = Editor(document.querySelector('#editor')!);

    editor.restoreContent();

    await csv.parse('Col1,Col2,Col3\n1,2,3\n4,5,6', {
        tableName: 'test'
    });

    console.log(sql.query('SELECT * FROM test; SELECT 1'));
    
}

main().catch(console.error);
