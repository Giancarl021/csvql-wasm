import CsvParserOptions from '../interfaces/CsvParserOptions';
import infer from '@giancarl021/type-inference';
import ParsedRow from '../interfaces/ParsedRow';

export default function (options: CsvParserOptions) {
    function split(rows: string): string[] {
        return rows.split(options.delimiter);
    }

    function Caster(headers: string[]) {
        const headersSize = headers.length;

        return (row: string[]): ParsedRow => {
            const result = {} as ParsedRow;
            for (let i = 0; i < headersSize; i++) {
                const item = row[i],
                    header = headers[i];

                result[header] = infer(item);
            }

            return result;
        };
    }

    return {
        split,
        Caster
    };
}
