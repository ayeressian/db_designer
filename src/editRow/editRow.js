'use strict';

const electron = require('electron');

electron.ipcRenderer.on('row-data', (sender, rowData) => {
  console.log(rowData);
});