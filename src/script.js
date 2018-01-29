'use strict';

const Designer = require('./Designer');
const schemaParser = require('./schemaParser');


let schema = require('../schema/benchmark.json');

const tables = schemaParser(schema);
const designer = new Designer(tables);