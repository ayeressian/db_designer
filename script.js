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
    x: 400,
    y: 50
  }
});

// const table3 = new Table({
//   name: 'CCC',
//   columns: [
//     { name: "id", type: "INT" },
//     { name: "AAA_id", type: "INT", fk: { table, column: table.columns[0] } }
//   ],
//   pos: {
//     x: 400,
//     y: 200
//   }
// });

// const table4 = new Table({
//   name: 'EEE',
//   columns: [
//     { name: "id", type: "INT" },
//     { name: "CCC_id", type: "INT", fk: { table, column: table3.columns[0] } }
//   ],
//   pos: {
//     x: 250,
//     y: 350
//   }
// });

const designer = new Designer([table, table2]);

window.designer = designer;