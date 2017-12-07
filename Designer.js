import Relation from './Relation.js';
import constant from './const.js';

export default class Designer {
    constructor(tables = []) {
        this._container = document.getElementById('designer-container');
        this._svgElem = document.getElementById('designer');
        this._btnZoomIn = document.getElementById('btn-zoom-in');
        this._btnZoomOut = document.getElementById('btn-zoom-out');
        this.tables = tables;

        tables.forEach(table => table.setDesigner(this));

        this._viewBoxVals = {
            minX: 0,
            minY: 0,
            width: parseInt(window.getComputedStyle(this._svgElem).width, 10),
            height: parseInt(window.getComputedStyle(this._svgElem).height, 10)
        };

        this._setUpEvents();

        this._relationInfos = [];

        this._zoom = 1;

        this.draw();
    }

    addTable(table) {
        this.tables.push(table);
        drawTable();
    }

    _drawRelations() {
        this.tables.forEach(table => {
            const tableRelations = this._getTableRelations(table);

            tableRelations.forEach(relation => relation.update());

            const leftRelations = tableRelations.filter(
                r => r.toTable === table && r.toTablePathSide === constant.PATH_LEFT || r.fromTable === table && r.fromTablePathSide === constant.PATH_LEFT);
            const rightRelations = tableRelations.filter(
                r => r.toTable === table && r.toTablePathSide === constant.PATH_RIGHT || r.fromTable === table && r.fromTablePathSide === constant.PATH_RIGHT);
            const topRelations = tableRelations.filter(
                r => r.toTable === table && r.toTablePathSide === constant.PATH_TOP || r.fromTable === table && r.fromTablePathSide === constant.PATH_TOP);
            const bottomRelations = tableRelations.filter(
                r => r.toTable === table && r.toTablePathSide === constant.PATH_BOTTOM || r.fromTable === table && r.fromTablePathSide === constant.PATH_BOTTOM);

            leftRelations.forEach((relation, i) => {
                if (relation.fromTable === table) {
                    relation.fromPathIndex = i;
                    relation.fromPathCount = leftRelations.length;
                } else {
                    relation.toPathIndex = i;
                    relation.toPathCount = leftRelations.length;
                }
            });

            rightRelations.forEach((relation, i) => {
                if (relation.fromTable === table) {
                    relation.fromPathIndex = i;
                    relation.fromPathCount = rightRelations.length;
                } else {
                    relation.toPathIndex = i;
                    relation.toPathCount = rightRelations.length;
                }
            });

            topRelations.forEach((relation, i) => {
                if (relation.fromTable === table) {
                    relation.fromPathIndex = i;
                    relation.fromPathCount = topRelations.length;
                } else {
                    relation.toPathIndex = i;
                    relation.toPathCount = topRelations.length;
                }
            });

            bottomRelations.forEach((relation, i) => {
                if (relation.fromTable === table) {
                    relation.fromPathIndex = i;
                    relation.fromPathCount = bottomRelations.length;
                } else {
                    relation.toPathIndex = i;
                    relation.toPathCount = bottomRelations.length;
                }
            });
        });

        this._relationInfos.forEach(relation => {
            relation.getElems().forEach(elem => this._svgElem.removeChild(elem));
            const elems = relation.render();
            elems.forEach(elem => this._svgElem.prepend(elem));
        });
    }

    draw() {
        this.tables.forEach((table, i) => {
            const tableElm = table.render();
            tableElm.setAttribute('id', i + 'table');
            this._svgElem.appendChild(tableElm);

            table.columns.forEach(column => {
                if (column.fk) {
                    let relationInfo = { fromTable: table, toTable: column.fk.table, fromColumn: column, toColumn: column.fk.column };
                    relationInfo = new Relation(relationInfo);
                    this._relationInfos.push(relationInfo);
                }
            });
        });

        this._drawRelations();

        //After draw happened
        setTimeout(() => {
            this.tables.forEach(table => table.postDraw && table.postDraw());
        });
    }

    _getTableRelations(table) {
        return this._relationInfos.filter(relations => {
            return relations.fromTable === table || relations.toTable === table;
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

        this.tables.forEach(table => {
            table.setMoveListener(this._drawRelations.bind(this));
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