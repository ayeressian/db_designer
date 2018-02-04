'use strict';

const agGrid = require('ag-grid');

console.log('test');

const gridOptions = {
  columnDefs: [{
      headerName: "Make",
      field: "make"
    },
    {
      headerName: "Model",
      field: "model"
    },
    {
      headerName: "Price",
      field: "price"
    }
  ],
  rowData: [{
      make: "Toyota",
      model: "Celica",
      price: 35000
    },
    {
      make: "Ford",
      model: "Mondeo",
      price: 32000
    },
    {
      make: "Porsche",
      model: "Boxter",
      price: 72000
    }
  ]
}

const grid = document.getElementById('column-des-grid');

new agGrid.Grid(grid, gridOptions);