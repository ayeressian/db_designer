'use strict';

const ns = 'http://www.w3.org/2000/svg';

class TableColumn {
    constructor(name, type) {
        this.name = name;
        this.type = type;
    }

    setName(name) {
        this.name = name;
    }

    setType(type) {
        this.type = type;
    }

    render() {
        this.elem = document.createElementNS(ns, 'g');
        this.elem.setAttributeNS(null, 'class', 'columnGroup');
        
        this._topLine = document.createElementNS(ns, 'line');
        this.elem.appendChild(this._topLine);

        this._bottomLine = document.createElementNS(ns, 'line');
        this.elem.appendChild(this._bottomLine);

        this.columnName = document.createElementNS(ns, 'text');
        this.elem.appendChild(this._bottomLine);

        this.columnType = document.createElementNS(ns, 'text');
        this.elem.appendChild(this._bottomLine);


    }
}

class Table {
    constructor(name, columns = []) {
        this.columns = columns;
        this.name = name;
    }

    _moveEvents() {
        let mouseDownInitialElemX, mouseDownInitialElemY;

        function mouseMove(event) {
            const deltaX = event.clientX - mouseDownInitialElemX;
            const deltaY = event.clientY - mouseDownInitialElemY;
            this.elem.setAttributeNS(null, 'transform', `translate(${deltaX},${deltaY})`);
        }

        mouseMove = mouseMove.bind(this);
        this.elem.addEventListener('mousedown', event => {
            const boundingRect = this.elem.getBoundingClientRect();
            mouseDownInitialElemX = event.clientX - boundingRect.left;
            mouseDownInitialElemY = event.clientY - boundingRect.top;

            document.addEventListener('mousemove', mouseMove);
        }, false);
        document.addEventListener('mouseup', () => {
            document.removeEventListener('mousemove', mouseMove);
        }, false);
    }

    setName(name) {
        this.name = name;
    }

    addColumn(column) {
        this.columns.push(column);
    }

    render() {
        const x = 0,
            y = 0;

        this.elem = document.createElementNS(ns, 'g');
        this.elem.setAttributeNS(null, 'class', 'tableGroup');
        this.elem.setAttributeNS(null, 'transform', `translate(${x},${y})`);

        this._table = document.createElementNS(ns, 'rect');
        this._table.setAttributeNS(null, 'class', 'table');
        this.elem.appendChild(this._table);

        const titleLine = document.createElementNS(ns, 'line');
        titleLine.setAttributeNS(null, 'x1', 0);

        const nameElem = document.createElementNS(ns, 'text');
        nameElem.innerHTML = name;
        nameElem.setAttributeNS(null, 'class', 'tableName');
        this.elem.appendChild(nameElem);

        setTimeout(() => {
            const textOffsetTopBottom = 10;
            const bBox = nameElem.getBBox();
            const textHeight = bBox.height;
            const textWidth = bBox.width;
            nameElem.setAttributeNS(null, 'y', textOffsetTopBottom + textHeight / 1.5);

            const titleHeight = textHeight + textOffsetTopBottom * 2;
            titleLine.setAttributeNS(null, 'y1', titleHeight);
            titleLine.setAttributeNS(null, 'y2', titleHeight);

            const tableOffsetLeftRight = 20;
            let width = nameElem.getComputedTextLength() + tableOffsetLeftRight * 2;
            const MIN_WIDTH_SIZE = 100;
            if (width < MIN_WIDTH_SIZE) {
                width = MIN_WIDTH_SIZE;
                nameElem.setAttributeNS(null, 'x', (MIN_WIDTH_SIZE - textWidth) / 2);
            } else {
                nameElem.setAttributeNS(null, 'x', tableOffsetLeftRight);
            }
            this._table.setAttributeNS(null, 'width', width);
            titleLine.setAttributeNS(null, 'x2', width);

            this.elem.appendChild(titleLine);

            let columnHeight = 0;
            for (const column of this.columns) {

            }

            this._table.setAttributeNS(null, 'height', titleHeight + columnHeight * column.length);



            this._moveEvents();
        });
        return this.elem;
    }
}

class Designer {
    constructor(tables = []) {
        this.elem = document.getElementById('designer');
        this.tables = tables;
        this.draw();
    }

    addTable(table) {
        this.tables.push(table);
        drawTable();
    }

    draw() {
        this.tables.forEach(table => {
            const tableElm = table.render();
            this.elem.appendChild(tableElm);
        });
    }
}

const tableColumn = new TableColumn('name', 'string');
const table = new Table('AAA', [tableColumn]);
const table2 = new Table('BBB', [tableColumn]);
const designer = new Designer([table, table2]);