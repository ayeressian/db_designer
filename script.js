import Designer from './Designer.js';
import Table from './Table.js';

const table = new Table({
  name: 'AAA',
  columns: [{ name: "id", type: "INT" }],
  pos: {
    x: 200,
    y: 100
  }
});

const table2 = new Table({
  name: 'BBB',
  columns: [
    { name: "id", type: "INT" },
    { name: "name", type: "VARCHAR(255)" },
    { name: "AAA_id", type: "INT", fk: { table, column: table.columns[0] } }
  ],
  pos: {
    x: 200,
    y: 300
  }
});

const designer = new Designer([table, table2]);

window.designer = designer;