import { SqlMultiResults, SqlResults } from './../interfaces/SqlResult';
import initSqlJs, { Database, QueryExecResult } from 'sql.js';

import ColumnSet from '../interfaces/ColumnSet';
import SqlResult from '../interfaces/SqlResult';
import Schema from '../interfaces/Schema';

const STATIC_ASSET = (file: string) => `/sql/${file}`;

export default async function SQL() {
    const builder = await initSqlJs({
        locateFile: STATIC_ASSET
    });

    let db: Database = new builder.Database();

    function getSchema(): Schema {
        const schema: Schema = [];
        const tables = query('SELECT name FROM sqlite_master WHERE type=\'table\'')
            [0]?.map(t => t.name);

        if (!tables) return schema;

        for (const table of tables) {
            const columns =
                query(`SELECT name, type FROM PRAGMA_TABLE_INFO('${table}')`)
                [0]?.map(c => ({
                    name: c.name,
                    type: String(c.type).toLowerCase()
                }) as ColumnSet);

            schema.push({
                tableName: String(table),
                columns: columns ?? []
            });
        }

        return schema;
    }

    function query(statement: string): SqlMultiResults {
        const results = db.exec(statement);

        return parseResult(results);
    }

    function parseResult(queryResults: QueryExecResult[]): SqlMultiResults {
        const results: SqlMultiResults = [];

        for (const queryResult of queryResults) {
            const result: SqlResults = [];
            const headers = queryResult.columns;

            for (const item of queryResult.values) {
                const row = {} as SqlResult;

                for (let i = 0; i < headers.length; i++) {
                    row[headers[i]] = item[i];
                }

                result.push(row);
            }

            results.push(result);
        }

        return results;
    }

    function fromBinary(binary: Uint8Array) {
        db = new builder.Database(binary);
    }

    function reset() {
        db = new builder.Database();
    }

    function toBinary(): Uint8Array {
        return db.export();
    }

    return {
        database: db,
        query,
        fromBinary,
        toBinary,
        reset,
        getSchema
    };
}