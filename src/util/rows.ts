import CsvParserOptions from '../interfaces/CsvParserOptions';
import infer from '@giancarl021/type-inference';
import ParsedRow from '../interfaces/ParsedRow';
import UnparsedRow from '../interfaces/UnparsedRow';
import UnparsedRowType from '../interfaces/UnparsedRowType';
import { ParamsObject } from 'sql.js';

export default function (options: CsvParserOptions) {
    function split(rows: string): string[] {
        return rows.split(options.delimiter);
    }

    function Formatter(headers: string[]) {
        return (row: UnparsedRow): ParamsObject => {
            const result = {} as ParamsObject;

            const l = headers.length;

            for (let i = 0; i < l; i++) {
                const header = headers[i];
                const cell = row[header];

                result[`:val${i}`] = parse(cell);
            }

            return result;
        };

        function parse(cell: UnparsedRowType) {
            if (!cell && typeof cell !== 'number') return null;

            if (cell === 'true' || cell === 'false') {
                return cell === 'true' ? 1 : 0;
            }

            return cell;
        }
    }

    function Caster(headers: string[]) {
        const headersSize = headers.length;

        return (row: string[]): ParsedRow => {
            const result = {} as ParsedRow;
            for (let i = 0; i < headersSize; i++) {
                const item = row[i],
                    header = headers[i];

                let parsedItem = infer(String(item));

                if (typeof parsedItem === 'undefined') parsedItem = null;
                else if (typeof parsedItem === 'boolean')
                    parsedItem = parsedItem ? 1 : 0;

                result[header] = parsedItem;
            }

            return result;
        };
    }

    return {
        split,
        Formatter,
        Caster
    };
}
