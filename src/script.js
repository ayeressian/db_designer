'use strict';

const Designer = require('./Designer');
const schemaParser = require('./schemaParser');

//fetch('school.json').then(schema => {
let schema = require('../schema/benchmark.json');

console.log(schema);
const tables = schemaParser(schema);
console.log(tables);
const designer = new Designer(tables);