import { segmentIntersection } from './util.js';

const ns = 'http://www.w3.org/2000/svg';

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
        getSides
        this._setUpEvents();

        this._relationInfos = [];

        this._zoom = 1;

        this.draw();
    }

    addTable(table) {
        this.tables.push(table);
        drawTable();
    }

    _getTableRelationSide({ fromTable, toTable, fromColum, toColumn }) {
        const fromTableCenter = fromTable.getCenter();
        const toTableCenter = toTable.getCenter();

        const fromTableSides = fromTable.getSides();

        let fromTablePathSide;

        const intersectFromTableRightSide = segmentIntersection(fromTableCenter, toTableCenter, fromTableSides.right.p1, fromTableSides.right.p2);
        if (intersectFromTableRightSide) {
            fromTablePathSide = 'right';
        }
        const intersectFromTableLeftSide = segmentIntersection(fromTableCenter, toTableCenter, fromTableSides.left.p1, fromTableSides.left.p2);
        if (intersectFromTableRightSide) {
            fromTablePathSide = 'left';
        }
        const intersectFromTableTopSide = segmentIntersection(fromTableCenter, toTableCenter, fromTableSides.top.p1, fromTableSides.top.p2);
        if (intersectFromTableTopSide) {
            fromTablePathSide = 'top';
        }
        const intersectFromTableBottomSide = segmentIntersection(fromTableCenter, toTableCenter, fromTableSides.bottom.p1, fromTableSides.bottom.p2);
        if (intersectFromTableBottomSide) {
            fromTablePathSide = 'bottom';
        }

        let toTablePathSide;

        const intersectToTableRightSide = segmentIntersection(fromTableCenter, toTableCenter, fromTableSides.right.p1, fromTableSides.right.p2);
        if (intersectToTableRightSide) {
            toTablePathSide = 'right';
        }
        const intersectToTableLeftSide = segmentIntersection(fromTableCenter, toTableCenter, fromTableSides.left.p1, fromTableSides.left.p2);
        if (intersectToTableRightSide) {
            toTablePathSide = 'left';
        }
        const intersectToTableTopSide = segmentIntersection(fromTableCenter, toTableCenter, fromTableSides.top.p1, fromTableSides.top.p2);
        if (intersectToTableTopSide) {
            toTablePathSide = 'top';
        }
        const intersectToTableBottomSide = segmentIntersection(fromTableCenter, toTableCenter, fromTableSides.bottom.p1, fromTableSides.bottom.p2);
        if (intersectToTableBottomSide) {
            toTablePathSide = 'bottom';
        }

        return { fromTablePathSide, toTablePathSide };
    }

    draw() {
        this.tables.forEach((table, i) => {
            const tableElm = table.render();
            tableElm.setAttribute('id', i + 'table');
            this._svgElem.appendChild(tableElm);

            table.columns.forEach(column => {
                if (column.fk) {
                    let relationInfo = { fromTable: table, toTable: column.fk.table, fromColum: column, toColumn: column.fk.column };
                    const sidePathStart = this._getTableRelationSide({ fromTable: table, toTable: column.fk.table, fromColum: column, toColumn: column.fk.column });
                    relationInfo = {...relationInfo, ...sidePathStart};
                    this._relationInfos.push(relationInfo);                    
                }
            });
        });

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
            table.setMoveListener(() => {
                const relations = this._getTableRelations(table);
                const leftSideRelations = [], rightSideRelations = [], topSideRelations = [], bottomSideRelations = [];
                
                relations.forEach(relation => {
                    const r = this._getTableRelationSide(relation);                    
                    relation.fromTablePathSide = r.fromTablePathSide;
                    relation.toTablePathSide = r.toTablePathSide;
                    console.log(relation);
                    if (relation.fromTable === table) {
                        if (relation.fromTablePathSide === 'left') {
                            leftSideRelations.push(relation);
                        } else if (relation.fromTablePathSide === 'right') {
                            rightSideRelations.push(relation);
                        } else if (relation.fromTablePathSide === 'top') {
                            topSideRelations.push(relation);
                        //relation.fromTablePathSide === 'bottom'
                        } else {
                            bottomSideRelations.push(relation);
                        }
                    //relation.toTable === table
                    } else {
                        if (relation.toTablePathSide === 'left') {
                            leftSideRelations.push(relation);
                        } else if (relation.toTablePathSide === 'right') {
                            rightSideRelations.push(relation);
                        } else if (relation.toTablePathSide === 'top') {
                            topSideRelations.push(relation);
                        //relation.toTablePathSide === 'bottom'
                        } else {
                            bottomSideRelations.push(relation);
                        }
                    }
                });

            });
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