import { intersection } from './util';

const ns = 'http://www.w3.org/2000/svg';

export default class Designer {
    constructor(tables = []) {
        this._container = document.getElementById('designer-container');
        this._svgElem = document.getElementById('designer');
        this._btnZoomIn = document.getElementById('btn-zoom-in');
        this._btnZoomOut = document.getElementById('btn-zoom-out');
        this.tables = tables;
        this.draw();

        tables.forEach(table => table.setDesigner(this));

        this._viewBoxVals = {
            minX: 0,
            minY: 0,
            width: parseInt(window.getComputedStyle(this._svgElem).width, 10),
            height: parseInt(window.getComputedStyle(this._svgElem).height, 10)
        };

        this._setUpEvents();

        this._zoom = 1;
    }

    addTable(table) {
        this.tables.push(table);
        drawTable();
    }

    drawTableRelation({ fromTable, toTable, fromColum, toColumn }) {
        const fromTableCenter = fromTable.getCenter();
        const toTableCenter = toTable.getCenter();

        const fromTableSides = fromTable.getSides();

        

        const intersectFromTableRightSide = intersection(fromTableCenter, toTableCenter, fromTableSides.right.p1, fromTableSides.right.p2);
        if (intersectFromTableRightSide) {

        }
        intersection(fromTableCenter, toTableCenter, fromTableSides.left.p1, fromTableSides.left.p2);
        intersection(fromTableCenter, toTableCenter, fromTableSides.top.p1, fromTableSides.top.p2);
        intersection(fromTableCenter, toTableCenter, fromTableSides.bottom.p1, fromTableSides.bottom.p2);
    }

    draw() {
        const relations = [];

        this.tables.forEach((table, i) => {
            const tableElm = table.render();
            tableElm.setAttribute('id', i + 'table');
            this._svgElem.appendChild(tableElm);

            table.columns.forEach(column => {
                if (column.fk) {
                    drawTableRelation({ fromTable: table, toTable: column.fk.table, fromColum: column, toColumn: column.fk.column });
                }
            });
        });

        //After draw happened
        setTimeout(() => {
            this.tables.forEach(table => table.postDraw && table.postDraw());
        });
    }

    _setUpEvents() {
        const ZOOM = 1.2;

        const setViewBox = () => {
            this._svgElem.setAttribute('viewBox', `${this._viewBoxVals.minX} ${this._viewBoxVals.minY} ${this._viewBoxVals.width} ${this._viewBoxVals.height}`);
        };

        let prevMouseCordX, prevMouseCordY;

        const mouseMove = () => {
            const deltaX = (event.clientX - prevMouseCordX) / this._zoom;
            const deltaY = (event.clientY - prevMouseCordY) / this._zoom;
            this._viewBoxVals.minX -= deltaX;
            this._viewBoxVals.minY -= deltaY;
            setViewBox();

            prevMouseCordX = event.clientX;
            prevMouseCordY = event.clientY;
        };

        this._container.addEventListener('mousedown', event => {
            prevMouseCordX = event.clientX;
            prevMouseCordY = event.clientY;
            document.addEventListener('mousemove', mouseMove);
        });

        document.addEventListener('mouseup', () => {
            document.removeEventListener('mousemove', mouseMove);
        }, false);

        this._btnZoomIn.addEventListener('click', () => {
            this._viewBoxVals.width = this._viewBoxVals.width / ZOOM;
            this._viewBoxVals.height = this._viewBoxVals.height / ZOOM;
            setViewBox();
            this._zoom *= ZOOM;
        });

        this._btnZoomOut.addEventListener('click', () => {
            this._viewBoxVals.width = this._viewBoxVals.width * ZOOM;
            this._viewBoxVals.height = this._viewBoxVals.height * ZOOM;
            setViewBox();
            this._zoom /= ZOOM;
        });
    }

    getZoom() {
        return this._zoom;
    }

    getPan() {
        return {
            x: this._viewBoxVals.minX,
            y: this._viewBoxVals.minY
        };
    }
}