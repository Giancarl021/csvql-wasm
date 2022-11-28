import { parseString } from '@fast-csv/parse';
import fillObject from 'fill-object';
import stripBom from 'strip-bom';
import { detect as detectDelimiter } from 'csv-string';

import Rows from '../util/rows';
import Columns from '../util/columns';

import CsvParserOptions from '../interfaces/CsvParserOptions';
import SQL from './sql';

const LINE_REGEX = /\r?\n/g;
const SEP_REGEX = /^sep=./i;

const defaultOptions: CsvParserOptions = {
    skipFirstLine: false,
    delimiter: ',',
    escape: '"',
    tableName: 'csv'
};

export default function (
    sql: Awaited<ReturnType<typeof SQL>>
) {
    async function parse(
        data: string,
        options: Partial<CsvParserOptions>
    ) {
        const props: CsvParserOptions = fillObject(
            options,
            defaultOptions,
            true
        ) as CsvParserOptions;
    
        const rows = Rows(props);

        const lines = stripBom(data).replace(/\r?\n/g, '\n').split(LINE_REGEX);

        let headers: string[];

        if (lines.length === 0) return;

        if (SEP_REGEX.test(lines[0])) {
            props.skipFirstLine = true;
            props.delimiter = lines[0].substring(lines[0].indexOf('='));

            headers = rows.split(lines[1]);
        } else {
            props.delimiter = detectDelimiter(lines.slice(0, 4).join('\n'));
            headers = rows.split(lines[0]);
        }

        const rowCaster = rows.Caster(headers);

        const columns = Columns(
            headers,
            (props.skipFirstLine ? lines.slice(2) : lines.slice(1)).map(row =>
                rowCaster(rows.split(row))
            ),
            Math.min(lines.length, 100)
        );

        const tableQuery = `CREATE TABLE "${props.tableName}" (${columns
            .map(column => `"${column.name}" ${column.type}`)
            .join(',')})`;

        const insertQuery = `INSERT INTO "${props.tableName}" (${headers
            .map(header => `"${header}"`)
            .join(',')}) VALUES (${headers
            .map((_, i) => `:val${i}`)
            .join(',')})`;

        sql.database.run(tableQuery);

        const insertStatement = sql.database.prepare(insertQuery);
        const rowFormatter = rows.Formatter(headers);

        await new Promise((resolve, reject) => {
            parseString(data, {
                headers: true,
                escape: props.escape,
                trim: true,
                delimiter: props.delimiter,
                skipLines: props.skipFirstLine ? 1 : 0,
                ignoreEmpty: true
            })
                .on('data', data => {
                    const row = rowFormatter(data);
                    insertStatement.run(row);
                })
                .on('error', reject)
                .on('end', resolve);
        });

        sql.tables.set(props.tableName, columns);
    }

    return {
        parse
    };
}
