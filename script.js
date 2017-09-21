import Designer from './Designer.js';
import Table from './Table.js';
import TableColumn from './TableColumn.js';

const tableColumn = new TableColumn('name', 'string');
const table = new Table('AAA', [tableColumn]);
const table2 = new Table('BBB', [tableColumn]);
const designer = new Designer([table, table2]);