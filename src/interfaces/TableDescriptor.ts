import ColumnSet from './ColumnSet';

interface TableDescriptor {
    [tableName: string]: ColumnSet[];
}

export default TableDescriptor;
