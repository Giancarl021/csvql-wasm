import ColumnSet from './ColumnSet';

export interface TableDescriptor {
    tableName: string;
    columns: ColumnSet[];
}

type Schema = TableDescriptor[];

export default Schema;
