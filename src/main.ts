import 'bulma';
import 'bulmaswatch/superhero/bulmaswatch.min.css';
import './scss/main.scss';
import 'setimmediate';

import SQL from './services/sql';
import Parser from './services/csvParser';

async function main() {
    const sql = await SQL();
    const parser = Parser(sql);

    await parser.parse('Col1,Col2,Col3\n1,2,3\n4,5,6', {
        tableName: 'test'
    });

    console.log(sql.query('SELECT * FROM test; SELECT 1'));
}

main().catch(console.error);
