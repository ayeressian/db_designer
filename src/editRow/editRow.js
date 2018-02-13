'use strict';

const electron = require('electron');
const constants = require('../const');

const typeElem = document.getElementById('type');

constants.TYPES.forEach(type => {
  const optionElem = document.createElement('option');
  optionElem.innerHTML = type;
  optionElem.setAttribute('value', type);
  typeElem.appendChild(optionElem);
});

electron.ipcRenderer.on('row-data', (sender, rowData) => {
  console.log(rowData);
});