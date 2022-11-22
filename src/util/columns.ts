import ParsedRow from '../interfaces/ParsedRow';
import ColumnSet from '../interfaces/ColumnSet';

const DEFAULT_TYPE = 'text';

interface ColumnMap {
    [key: string]: {
        type: string | null;
        isConcrete: boolean;
    };
}

export default function (
    columns: string[],
    rows: ParsedRow[],
    depth: number = rows.length
) {
    const map: ColumnMap = {};

    for (const column of columns) {
        map[column] = {
            type: null,
            isConcrete: false
        };
    }

    let i = 0,
        row = rows[i];

    while (i < depth) {
        for (const key in row) {
            if (map[key].isConcrete) continue;

            const data = row[key];
            if (!data) continue;

            switch (typeof data) {
                case 'number':
                    if (Number.isInteger(data)) {
                        map[key].type = 'int';
                    } else {
                        map[key].type = 'float';
                        map[key].isConcrete = true;
                    }
                    break;
                case 'boolean':
                    map[key].type = 'int';
                    map[key].isConcrete = true;
                    break;
                default:
                    map[key].type = 'text';
                    map[key].isConcrete = true;
            }
        }

        row = rows[++i];
    }

    const result: ColumnSet[] = [];

    for (const key in map) {
        result.push({
            name: key,
            type: map[key].type ?? DEFAULT_TYPE
        });
    }

    return result;
}
