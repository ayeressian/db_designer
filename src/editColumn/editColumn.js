'use strict';

const electron = require('electron');
const constants = require('../const');

const typeElem = document.getElementById('type');
const nameElem = document.getElementById('name');
const pkElem = document.getElementById('pk');
const nnElem = document.getElementById('nn');
const uniqueElem = document.getElementById('unique');
const aiElem = document.getElementById('ai');
const defaultElem = document.getElementById('default');

document.getElementById('save').addEventListener('click', () => {
  //TODO more elaborate name value check is necessary
  if (nameElem.value == null || nameElem.value.trim().length == 0) {
    
  } else {

  }
});

document.getElementById('cancel').addEventListener('click', () => {
  electron.remote.getCurrentWindow().close();
});

constants.TYPES.forEach(type => {
  const optionElem = document.createElement('option');
  optionElem.innerHTML = type;
  optionElem.setAttribute('value', type);
  typeElem.appendChild(optionElem);
});

electron.ipcRenderer.on('row-data', (sender, rowData) => {
  console.log(rowData);
  nameElem.value = rowData.name;
  pkElem.checked = rowData.pk;
  nnElem.checked = rowData.nn;
  uniqueElem.checked = rowData.unique;
  aiElem.checked = rowData.ai;
  if (rowData.default) {
    defaultElem.value = rowData.default;
  }  
});