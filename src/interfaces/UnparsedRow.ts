import UnparsedRowType from './UnparsedRowType';

interface UnparsedRow {
    [columnName: string]: UnparsedRowType;
}

export default UnparsedRow;
