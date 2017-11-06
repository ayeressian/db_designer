import Designer from './Designer.js';
import Table from './Table.js';

const table = new Table('AAA', [{name: "id", type: "string"}]);
const table2 = new Table('BBB', [{name: "id", type: "INT"}, {name: "name", type: "VARCHAR(255)", fk: {table, column: table.columns[0]}}]);
const designer = new Designer([table, table2]);