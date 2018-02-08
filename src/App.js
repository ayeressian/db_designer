'use strict';

const Designer = require('./Designer');
const schemaParser = require('./schemaParser');
const electron = require('electron');
const path = require('path');
const url = require('url');

const BrowserWindow = electron.remote.BrowserWindow;

class App {
  constructor() {
    const designer = new Designer();
    this._initEvents();
  }

  _initEvents() {
    electron.ipcRenderer.on('file-to-load', (sender, filePath) => {
      const tables = schemaParser(require(filePath));
      designer.load(tables);
    });

    document.getElementsByClassName('create-table')[0].addEventListener('click', event => {
      let mainWindow = BrowserWindow.getFocusedWindow();
      const createTableWindow = new BrowserWindow({
        width: 1300,
        height: 800,
        parent: mainWindow
      });

      createTableWindow.webContents.openDevTools();

      createTableWindow.setMenu(null);

      createTableWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'createTable/createTable.html'),
        protocol: 'file:',
        slashes: true
      }));
    });
    document.getElementsByClassName('create-view')[0].addEventListener('click', event => {});
    document.getElementsByClassName('create-relation')[0].addEventListener('click', event => {});
  }

}

new App();