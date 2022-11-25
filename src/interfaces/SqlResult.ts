import { SqlValue } from 'sql.js';

type SqlResult = Record<string, SqlValue>;

export default SqlResult;

export type SqlResults = SqlResult[];
export type SqlMultiResults = SqlResults[];