'use strict';

const agGrid = require('ag-grid');
const path = require('path');
const url = require('url');
const electron = require('electron');
const constant = require('../const');
const BrowserWindow = electron.remote.BrowserWindow;

const types = ["INT", "STRING"];

const datalistId = 'data-types';
const datalist = document.createElement('datalist');
datalist.setAttribute('id', datalistId);
types.forEach(type => {
  const option = document.createElement('option');
  option.setAttribute('value', type);
  datalist.appendChild(option);
});
document.getElementsByTagName('body')[0].appendChild(datalist);

document.getElementById('cancel').addEventListener('click', () => {
  electron.remote.getCurrentWindow().close();
});

class CellCheckBox {
  init(params) {
    const val = params.getValue && params.getValue();

    this.elem = document.createElement('input');
    this.elem.setAttribute('type', 'checkbox');
    
    //make it readonly
    this.elem.addEventListener('click', function() {
      this.checked == true ? this.checked = false : this.checked = true;
    });
    this.elem.classList.add('column-checkbox');

    if (val) {
      this.elem.checked = true;
    }
  }
  getGui() {
    return this.elem;
  }
  afterGuiAttached() {
    this.elem.focus();
  }
  getValue() {
    this.elem.value;
  }
  destroy() {}
  isPopup() {
    return false;
  }
}

class CellDelete {
  init() {
    this.elem = document.createElement('img');
    this.elem.setAttribute('');
  }
}

const gridOptions = {
  components:{
    cellCheckBox: CellCheckBox
  },
  rowSelection: 'single',
  onSelectionChanged(api) {
    const selectedRow = api.api.getSelectedRows()[0];
    if (selectedRow) {
      let createTableWindow = BrowserWindow.getFocusedWindow();
      let editColumnWindow = new BrowserWindow({
        width: constant.EDIT_COLUMN_WINDOW_WIDTH,
        height: constant.EDIT_COLUMN_WINDOW_HEIGHT,
        parent: createTableWindow,
        resizable: false
      });

      editColumnWindow.webContents.openDevTools();

      editColumnWindow.setMenu(null);      

      editColumnWindow.on('closed', function () {
        editColumnWindow = null;
        api.api.deselectAll();        
      });

      editColumnWindow.webContents.on('did-finish-load', function () {
        editColumnWindow.webContents.send('row-data', selectedRow);
      });

      editColumnWindow.loadURL(url.format({
        pathname: path.join(__dirname, '../editColumn/editColumn.html'),
        protocol: 'file:',
        slashes: true
      }));
    }    
  },
  columnDefs: [
    {
      headerName: '',      
      width: 50
    },
    {
      headerName: 'Name',
      field: 'name',
      width: 150
    },
    {
      headerName: 'Type',
      field: 'type',
      width: 100
    },
    {
      headerName: 'Primary key',
      field: 'primaryKey',
      width: 120,
      cellRenderer: CellCheckBox
    },
    {
      headerName: 'Not Null',
      field: 'notNull',      
      width: 100,
      cellRenderer: CellCheckBox
    },
    {
      headerName: 'Unique',
      field: 'unique',
      width: 100,
      cellRenderer: CellCheckBox
    },
    {
      headerName: 'Auto Increment',
      field: 'autoIncrement',
      width: 140,
      cellRenderer: CellCheckBox
    }
  ],
  rowData: [
    {      
      newRowPlaceholder: true,
      name: 'click to edit',
      primaryKey: true
    }
  ]
}

const grid = document.getElementById('column-des-grid');

new agGrid.Grid(grid, gridOptions);