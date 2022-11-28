import { SqlMultiResults, SqlResults } from './../interfaces/SqlResult';
import initSqlJs, { Database, QueryExecResult } from 'sql.js';

import ColumnSet from '../interfaces/ColumnSet';
import SqlResult from '../interfaces/SqlResult';
import TableDescriptor from '../interfaces/TableDescriptor';

const STATIC_ASSET = (file: string) => `/sql/${file}`;

export default async function SQL() {
    const tables: TableDescriptor = {};

    const builder = await initSqlJs({
        locateFile: STATIC_ASSET
    });

    let db: Database = new builder.Database();

    function getTable(tableName: string) {
        if (!tables[tableName])
            throw new Error(`Table ${tableName} not exist`);

        return {
            tableName,
            columns: tables[tableName]
        };
    }

    function getTables() {
        return Object.entries(tables).map(([key, value]) => ({
            tableName: key,
            columns: value
        }))
    }

    function setTable(tableName: string, columns: ColumnSet[]) {
        tables[tableName] = columns;
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

    function toBinary(): Uint8Array {
        return db.export();
    }

    return {
        database: db,
        query,
        fromBinary,
        toBinary,
        tables: {
            get: getTable,
            set: setTable,
            all: getTables
        }
    };
}