import { parseString } from '@fast-csv/parse';
import fillObject from 'fill-object';
import stripBom from 'strip-bom';
import { detect as detectDelimiter } from 'csv-string';
import Rows from '../util/rows';

import CsvParserOptions from '../interfaces/CsvParserOptions';
import Columns from '../util/columns';

const LINE_REGEX = /\r?\n/g;
const SEP_REGEX = /^sep=./i;

const defaultOptions: CsvParserOptions = {
    skipFirstLine: false,
    delimiter: ',',
    escape: '"'
};

export default function (
    tableName: string,
    data: string,
    options: Partial<CsvParserOptions>
): unknown[] {
    const props: CsvParserOptions = fillObject(
        options,
        defaultOptions,
        true
    ) as CsvParserOptions;

    const rows = Rows(props);

    const lines = stripBom(data).replace(/\r?\n/g, '\n').split(LINE_REGEX);

    let headers: string[];

    if (lines.length === 0) return [];

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
        (props.skipFirstLine ? lines.slice(1) : lines).map(row =>
            rowCaster(rows.split(row))
        ),
        Math.min(lines.length, 100)
    );

    parseString(data, {
        headers: true,
        escape: props.escape,
        trim: true,
        delimiter: props.delimiter,
        skipLines: props.skipFirstLine ? 1 : 0,
        ignoreEmpty: true
    });

    const tableQuery = `CREATE TABLE "${tableName}" (${columns
        .map(column => `"${column.name}" ${column.type}`)
        .join(',')})`;

    const insertQuery = `INSERT INTO "${tableName}" (${headers
        .map(header => `"${header}"`)
        .join(',')}) VALUES (${new Array(headers.length).fill('?').join(',')})`;

    return [];
}
