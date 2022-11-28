import 'bulma';
import 'bulmaswatch/slate/bulmaswatch.min.css';
import './scss/main.scss';
import 'setimmediate';

import equals from 'deep-equal';
import download from 'downloadjs';

import Sql from './services/sql';
import Csv from './services/csv';
import View from './services/view';
import Files from './services/files';
import Editor from './services/editor';

import { SqlMultiResults } from './interfaces/SqlResult';
import Schema from './interfaces/Schema';

enum QueryType {
    AllContent,
    SelectionContent
};

async function main() {
    let lastSchema: Schema = [];

    const sql = await Sql();
    const view = View();
    const csv = Csv(sql);
    const editor = Editor(view.elements.editor);
    const files = Files(view.elements.hiddenFileInput);

    editor.restoreContent();

    view.onExecAll(runQuery(QueryType.AllContent));
    view.onExecSelection(runQuery(QueryType.SelectionContent));

    view.onDownload(() => {
        download(sql.toBinary(), `csvql-${Date.now()}.sqlite`, 'application/octet-stream');
    });

    files.onCsvUploaded(async (content, filename) => {
        await csv.parse(content, {
            tableName: filename.replace(/\.[^/.]+$/, '')
        });
        updateSchema();
    });

    files.onSqliteUploaded(content => {
        sql.fromBinary(content);
        updateSchema();
    });

    view.onUploadCsv(() => {
        files.fireUpload('.csv');
    });

    view.onUploadSqlite(() => {
        files.fireUpload('.sqlite', '.db', '.sqlite3');
    });

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

            updateSchema();
        }
    }

    function updateSchema() {
        const schema = sql.getSchema();

        if (equals(schema, lastSchema)) return;

        view.setSchema(sql.getSchema());
        lastSchema = schema;
    }
}

main().catch(console.error);
