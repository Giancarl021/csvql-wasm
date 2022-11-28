import { SqlMultiResults } from './interfaces/SqlResult';
import 'bulma';
import 'bulmaswatch/slate/bulmaswatch.min.css';
import './scss/main.scss';
import 'setimmediate';
import download from 'downloadjs';

import Sql from './services/sql';
import Csv from './services/csv';
import View from './services/view';
import Editor from './services/editor';

enum QueryType {
    AllContent,
    SelectionContent
};

async function main() {
    const sql = await Sql();
    const view = View();
    const csv = Csv(sql);
    const editor = Editor(view.elements.editor);

    editor.restoreContent();

    await csv.parse('Col1,Col2,Col3\n1.10,2,3\n4,5,xalabaias', {
        tableName: 'test'
    });

    await csv.parse('Col1,Col2,Col3\n1.10,2,3\n4,5,xalabaias', {
        tableName: 'test2'
    });

    view.onExecAll(runQuery(QueryType.AllContent));
    view.onExecSelection(runQuery(QueryType.SelectionContent));

    view.setSchema(sql.tables.all());

    view.onDownload(() => {
        download(sql.toBinary(), `csvql-${Date.now()}.sqlite`, 'application/octet-stream');
    });

    view.setResults(sql.query('SELECT * FROM test; SELECT 1; SELECT 2; SELECT 4; SELECT 3; SELECT 6;'));

    function runQuery(type: QueryType): () => void {
        let contentCallback: () => string;
        switch (type) {
            case QueryType.AllContent:
                contentCallback = editor.getAllContent;
                break;
            case QueryType.SelectionContent:
                contentCallback = editor.getSelectionContent;
                break;
            default:
                throw new Error('Invalid QueryType provided');
        }

        return () => {
            const content = contentCallback();

            if (!content) return;

            let results: SqlMultiResults;

            try {
                results = sql.query(content);
                view.setResults(results);
            } catch (err) {
                view.setError((err as Error).message);
            }
        }
    }
}

main().catch(console.error);
