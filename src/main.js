const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

const path = require('path');
const url = require('url');

let mainWindow;

function createWindow() {  
  mainWindow = new BrowserWindow({ width: 1024, height: 800 });

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
            dialog.showOpenDialog(mainWindow, {properties: ['openFile', 'openDirectory', 'multiSelections']});
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

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
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