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
    SelectionContent,
    Auto
}

async function main() {
    let lastSchema: Schema = [];

    const sql = await Sql();
    const view = View();
    const csv = Csv(sql);
    const editor = Editor(view.elements.editor);
    const files = Files(view.elements.hiddenFileInput);

    editor.restoreContent();

    editor.onExec(runQuery(QueryType.Auto));

    view.onExecAll(runQuery(QueryType.AllContent));
    view.onExecSelection(runQuery(QueryType.SelectionContent));

    view.onDownload(() => {
        view.showModal('loading');
        download(
            sql.toBinary(),
            `csvql-${Date.now()}.sqlite`,
            'application/octet-stream'
        );
        view.hideModal('loading');
    });

    files.onError(err => {
        view.hideModal('loading');
        view.showModal('error', err);
    });

    files.onWillParse(() => {
        view.hideModal('dropArea');
        view.showModal('loading');
    });

    files.onCsvUploaded(async (content, filename) => {
        try {
            await csv.parse(content, {
                tableName: filename.replace(/\.[^/.]+$/, '')
            });
        } catch (err) {
            view.showModal('error', err as Error);
        }

        updateSchema();

        view.hideModal('loading');
    });

    files.onSqliteUploaded(content => {
        try {
            sql.fromBinary(content);
            updateSchema();
        } catch (err) {
            view.showModal('error', err as Error);
            sql.reset();
        }
        view.hideModal('loading');
    });

    files.onCancel(() => {
        view.hideModal('dropArea');
        view.hideModal('loading');
    });

    files.onDrag(() => {
        view.showModal('dropArea');
    });

    view.onUploadCsv(() => {
        view.showModal('loading');
        files.fireUpload('.csv');
    });

    view.onUploadSqlite(() => {
        view.showModal('loading');
        files.fireUpload('.sqlite', '.db', '.sqlite3');
    });

    document.onkeydown = event => {
        if (event.ctrlKey && event.key === 'o') {
            event.preventDefault();
            view.showModal('loading');
            files.fireUpload('.csv', '.sqlite', '.db', '.sqlite3');
        }
    };

    document.onkeydown = event => {
        if (event.ctrlKey && event.key === 's') {
            event.preventDefault();
            view.showModal('loading');
            download(
                sql.toBinary(),
                `csvql-${Date.now()}.sqlite`,
                'application/octet-stream'
            );
            view.hideModal('loading');
        }
    };

    function runQuery(type: QueryType): () => void {
        let contentCallback: () => string;
        switch (type) {
            case QueryType.AllContent:
                contentCallback = editor.getAllContent;
                break;
            case QueryType.SelectionContent:
                contentCallback = editor.getSelectionContent;
                break;
            case QueryType.Auto:
                contentCallback = () =>
                    editor.getSelectionContent() || editor.getAllContent();
                break;
            default:
                throw new Error('Invalid QueryType provided');
        }

        return async () => {
            view.showModal('loading');
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
            view.hideModal('loading');
        };
    }

    function updateSchema() {
        const schema = sql.getSchema();

        if (equals(schema, lastSchema)) return;

        view.setSchema(sql.getSchema());
        lastSchema = schema;
    }
}

main().catch(console.error);
