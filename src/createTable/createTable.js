'use strict';

const agGrid = require('ag-grid');

console.log('test');

const gridOptions = {
  editType: 'fullRow',
  columnDefs: [{
      headerName: 'Name',
      field: 'name',
      editable: true,
      width: 150
    },
    {
      headerName: 'Type',
      field: 'type',
      editable: true,
      width: 100
    },
    {
      headerName: 'Primary key',
      field: 'primaryKey',
      editable: true,
      width: 120
    },
    {
      headerName: 'Not Null',
      field: 'notNull',
      editable: true,
      width: 100
    },
    {
      headerName: 'Unique',
      field: 'unique',
      editable: true,
      width: 100
    },
    {
      headerName: 'Auto Increment',
      field: 'autoIncrement',
      editable: true,
      width: 140
    }
  ],
  rowData: [
  ]
}

const grid = document.getElementById('column-des-grid');

new agGrid.Grid(grid, gridOptions);