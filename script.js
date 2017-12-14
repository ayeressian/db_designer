import Designer from './Designer.js';
import schemaParser from './schemaParser.js';

fetch('school_schema.json').then(schema => {
  return schema.json();
}).then(schema => {
  const tables = schemaParser(schema);
  const designer = new Designer(tables);
});