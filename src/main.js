'use strict';

const electron = require('electron');
const path = require('path');
const constant = require('./const');
const url = require('url');

const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({ width: constant.MAIN_WINDOW_WIDTH, height: constant.MAIN_WINDOW_HEIGHT });

  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }));

  mainWindow.webContents.openDevTools();

  mainWindow.on('closed', function () {
    mainWindow = null;
  });

  const { Menu, dialog } = electron;

  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Open',
          click() {
            dialog.showOpenDialog(mainWindow, {
              properties: ['openFile'],
              filters: [{ name: 'json', extensions: ['json'] }]
            }, filePaths => {
              if (filePaths && filePaths.length > 0) {
                mainWindow.webContents.send('file-to-load', filePaths[0]);
              }
            });
          }
        },
        {
          label: 'Exit',
          click() {
            mainWindow.close();
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

app.on('ready', createWindow);

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow();
  }
});