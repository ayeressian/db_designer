'use strict';

const Designer = require('./Designer');
const schemaParser = require('./schemaParser');

const designer = new Designer();

var ipcRenderer = require('electron').ipcRenderer;
ipcRenderer.on('file-to-load', (sender, filePath) => {
    const tables = schemaParser(require(filePath));
    designer.load(tables);
});

let schema = require('../schema/benchmark.json');