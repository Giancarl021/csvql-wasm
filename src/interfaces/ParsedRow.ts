import { SqlValue } from 'sql.js';

interface ParsedRow {
    [key: string]: SqlValue;
}

export default ParsedRow;
