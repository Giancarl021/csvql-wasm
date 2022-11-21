import CsvParserOptions from '../interfaces/CsvParserOptions';

const LINE_REGEX = /\r?\n/g;
const SEP_REGEX = /^sep=./i;

export default function(data: string, options: Partial<CsvParserOptions>): unknown[] {
    const props: CsvParserOptions = {
        skipFirstLine: false,
        separator: ','
    };

    const lines = data.split(LINE_REGEX);

    if (lines.length === 0) return [];

    if (SEP_REGEX.test(lines[0])) {
        props.skipFirstLine = true;
        props.separator = lines[0]
            .substring(
                lines[0].indexOf('=')
            );

        // props.headers = [];
    }

    return [];
}

function parseRow(row: string, separator: string) {
    return row
        .split(separator)
        .map(cell => cell.replace(/"/g, ''));
}