import { segmentIntersection } from './util.js';

const nsSvg = 'http://www.w3.org/2000/svg';
const nsHtml = 'http://www.w3.org/1999/xhtml';

const PATH_LEFT = 'left', PATH_RIGHT = 'right', PATH_TOP = 'top', PATH_BOTTOM = 'bottom';

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

    _getTableRelationSide({ fromTable, toTable, fromColumn, toColumn }) {
        const fromTableCenter = fromTable.getCenter();
        const toTableCenter = toTable.getCenter();

        const fromTableSides = fromTable.getSides();

        let fromTablePathSide;

        const intersectFromTableRightSide = segmentIntersection(fromTableCenter, toTableCenter, fromTableSides.right.p1, fromTableSides.right.p2);
        if (intersectFromTableRightSide) {
            fromTablePathSide = PATH_RIGHT;
        }
        const intersectFromTableLeftSide = segmentIntersection(fromTableCenter, toTableCenter, fromTableSides.left.p1, fromTableSides.left.p2);
        if (intersectFromTableLeftSide) {
            fromTablePathSide = PATH_LEFT;
        }
        const intersectFromTableTopSide = segmentIntersection(fromTableCenter, toTableCenter, fromTableSides.top.p1, fromTableSides.top.p2);
        if (intersectFromTableTopSide) {
            fromTablePathSide = PATH_TOP;
        }
        const intersectFromTableBottomSide = segmentIntersection(fromTableCenter, toTableCenter, fromTableSides.bottom.p1, fromTableSides.bottom.p2);
        if (intersectFromTableBottomSide) {
            fromTablePathSide = PATH_BOTTOM;
        }

        const toTableSides = toTable.getSides();

        let toTablePathSide;

        const intersectToTableRightSide = segmentIntersection(fromTableCenter, toTableCenter, toTableSides.right.p1, toTableSides.right.p2);
        if (intersectToTableRightSide) {
            toTablePathSide = PATH_RIGHT;
        }
        const intersectToTableLeftSide = segmentIntersection(fromTableCenter, toTableCenter, toTableSides.left.p1, toTableSides.left.p2);
        if (intersectToTableLeftSide) {
            toTablePathSide = PATH_LEFT;
        }
        const intersectToTableTopSide = segmentIntersection(fromTableCenter, toTableCenter, toTableSides.top.p1, toTableSides.top.p2);
        if (intersectToTableTopSide) {
            toTablePathSide = PATH_TOP;
        }
        const intersectToTableBottomSide = segmentIntersection(fromTableCenter, toTableCenter, toTableSides.bottom.p1, toTableSides.bottom.p2);
        if (intersectToTableBottomSide) {
            toTablePathSide = PATH_BOTTOM;
        }

        return { fromTablePathSide, toTablePathSide };
    }

    _drawRelation({
        fromColumn,
        fromPathCount,
        fromPathIndex,
        fromTable,
        fromTablePathSide,
        toColumn,
        toPathCount,
        toPathIndex,
        toTable,
        toTablePathSide
    }) {
        const fromTableSides = fromTable.getSides();
        const toTableSides = toTable.getSides();

        switch (fromTablePathSide) {
            case PATH_LEFT:
                {
                    const leftSideLength = fromTableSides.left.p2.y - fromTableSides.left.p1.y;
                    const posOnLine = (fromPathIndex + 1) * (leftSideLength / (fromPathCount + 1));
                    const start = { y: fromTableSides.left.p1.y + posOnLine, x: fromTableSides.left.p1.x };
                    switch (toTablePathSide) {
                        case PATH_LEFT:
                            //relation form self to self
                            break;
                        case PATH_RIGHT:
                            {
                                const rightSideLength = toTableSides.right.p2.y - toTableSides.right.p1.y;
                                const posOnLine = (toPathIndex + 1) * (rightSideLength / (toPathCount + 1));
                                const end = { y: toTableSides.right.p1.y + posOnLine, x: toTableSides.right.p1.x };

                                // if (start.y === end.y) {
                                //     //draw streight line
                                //     const line = document.createElementNS(nsSvg, 'line');
                                //     line.setAttributeNS(null, 'x1', start.x);
                                //     line.setAttributeNS(null, 'y1', start.y);
                                //     line.setAttributeNS(null, 'x2', end.x);
                                //     line.setAttributeNS(null, 'y2', end.y);
                                //     this._svgElem.prependChild(line);
                                //     return;
                                // }

                                const p2X = start.x - (fromTableSides.left.p1.x - toTableSides.right.p1.x) / 2;

                                const line1 = document.createElementNS(nsSvg, 'line');
                                line1.setAttributeNS(null, 'x1', start.x);
                                line1.setAttributeNS(null, 'y1', start.y);
                                line1.setAttributeNS(null, 'x2', p2X);
                                line1.setAttributeNS(null, 'y2', start.y);
                                this._svgElem.prepend(line1);

                                const line2 = document.createElementNS(nsSvg, 'line');
                                line2.setAttributeNS(null, 'x1', p2X);
                                line2.setAttributeNS(null, 'y1', start.y);
                                line2.setAttributeNS(null, 'x2', p2X);
                                line2.setAttributeNS(null, 'y2', end.y);
                                this._svgElem.prepend(line2);

                                const line3 = document.createElementNS(nsSvg, 'line');
                                line3.setAttributeNS(null, 'x1', p2X);
                                line3.setAttributeNS(null, 'y1', end.y);
                                line3.setAttributeNS(null, 'x2', end.x);
                                line3.setAttributeNS(null, 'y2', end.y);
                                this._svgElem.prepend(line3);
                            }
                            break;
                        case PATH_TOP:
                            {
                                const topSideLength = toTableSides.top.p2.x - toTableSides.top.p1.x;
                                const posOnLine = (toPathIndex + 1) * (topSideLength / (toPathCount + 1));
                                const end = { y: toTableSides.top.p1.y, x: toTableSides.top.p1.x + posOnLine };

                                const line1 = document.createElementNS(nsSvg, 'line');
                                line1.setAttributeNS(null, 'x1', start.x);
                                line1.setAttributeNS(null, 'y1', start.y);
                                line1.setAttributeNS(null, 'x2', end.x);
                                line1.setAttributeNS(null, 'y2', start.y);
                                this._svgElem.prepend(line1);

                                const line2 = document.createElementNS(nsSvg, 'line');
                                line2.setAttributeNS(null, 'x1', end.x);
                                line2.setAttributeNS(null, 'y1', start.y);
                                line2.setAttributeNS(null, 'x2', end.x);
                                line2.setAttributeNS(null, 'y2', end.y);
                                this._svgElem.prepend(line2);
                            }
                            break;
                        case PATH_BOTTOM:
                            {
                                const bottomSideLength = toTableSides.bottom.p2.x - toTableSides.bottom.p1.x;
                                const posOnLine = (toPathIndex + 1) * (bottomSideLength / (toPathCount + 1));
                                const end = { y: toTableSides.bottom.p1.y, x: toTableSides.bottom.p1.x + posOnLine };

                                const line1 = document.createElementNS(nsSvg, 'line');
                                line1.setAttributeNS(null, 'x1', start.x);
                                line1.setAttributeNS(null, 'y1', start.y);
                                line1.setAttributeNS(null, 'x2', end.x);
                                line1.setAttributeNS(null, 'y2', start.y);
                                this._svgElem.prepend(line1);

                                const line2 = document.createElementNS(nsSvg, 'line');
                                line2.setAttributeNS(null, 'x1', end.x);
                                line2.setAttributeNS(null, 'y1', start.y);
                                line2.setAttributeNS(null, 'x2', end.x);
                                line2.setAttributeNS(null, 'y2', end.y);
                                this._svgElem.prepend(line2);
                            }
                            break;
                    }
                }
                break;
            case PATH_RIGHT:
                {
                    const rightSideLength = fromTableSides.right.p2.y - fromTableSides.right.p1.y;
                    const posOnLine = (fromPathIndex + 1) * (rightSideLength / (fromPathCount + 1));
                    const start = { y: fromTableSides.right.p1.y + posOnLine, x: fromTableSides.right.p1.x };
                    switch (toTablePathSide) {
                        case PATH_LEFT:
                            {
                                const leftSideLength = toTableSides.left.p2.y - toTableSides.left.p1.y;
                                const posOnLine = (toPathIndex + 1) * (leftSideLength / (toPathCount + 1));
                                const end = { y: toTableSides.left.p1.y + posOnLine, x: toTableSides.left.p1.x };

                                // if (start.y === end.y) {
                                //     //draw streight line
                                //     const line = document.createElementNS(nsSvg, 'line');
                                //     line.setAttributeNS(null, 'x1', start.x);
                                //     line.setAttributeNS(null, 'y1', start.y);
                                //     line.setAttributeNS(null, 'x2', end.x);
                                //     line.setAttributeNS(null, 'y2', end.y);
                                //     this._svgElem.prependChild(line);
                                //     return;
                                // }

                                const p2X = start.x + (fromTableSides.left.p1.x - toTableSides.right.p1.x) / 2;

                                const line1 = document.createElementNS(nsSvg, 'line');
                                line1.setAttributeNS(null, 'x1', start.x);
                                line1.setAttributeNS(null, 'y1', start.y);
                                line1.setAttributeNS(null, 'x2', p2X);
                                line1.setAttributeNS(null, 'y2', start.y);
                                this._svgElem.prepend(line1);

                                const line2 = document.createElementNS(nsSvg, 'line');
                                line2.setAttributeNS(null, 'x1', p2X);
                                line2.setAttributeNS(null, 'y1', start.y);
                                line2.setAttributeNS(null, 'x2', p2X);
                                line2.setAttributeNS(null, 'y2', end.y);
                                this._svgElem.prepend(line2);

                                const line3 = document.createElementNS(nsSvg, 'line');
                                line3.setAttributeNS(null, 'x1', p2X);
                                line3.setAttributeNS(null, 'y1', end.y);
                                line3.setAttributeNS(null, 'x2', end.x);
                                line3.setAttributeNS(null, 'y2', end.y);
                                this._svgElem.prepend(line3);
                            }
                            break;
                        case PATH_RIGHT:
                            //relation form self to self
                            break;
                        case PATH_TOP:
                            //TODO identical to left-top
                            {
                                const topSideLength = toTableSides.top.p2.x - toTableSides.top.p1.x;
                                const posOnLine = (toPathIndex + 1) * (topSideLength / (toPathCount + 1));
                                const end = { y: toTableSides.top.p1.y, x: toTableSides.top.p1.x + posOnLine };

                                const line1 = document.createElementNS(nsSvg, 'line');
                                line1.setAttributeNS(null, 'x1', start.x);
                                line1.setAttributeNS(null, 'y1', start.y);
                                line1.setAttributeNS(null, 'x2', end.x);
                                line1.setAttributeNS(null, 'y2', start.y);
                                this._svgElem.prepend(line1);

                                const line2 = document.createElementNS(nsSvg, 'line');
                                line2.setAttributeNS(null, 'x1', end.x);
                                line2.setAttributeNS(null, 'y1', start.y);
                                line2.setAttributeNS(null, 'x2', end.x);
                                line2.setAttributeNS(null, 'y2', end.y);
                                this._svgElem.prepend(line2);
                            }
                            break;
                        case PATH_BOTTOM:
                            //TODO identical to left-bottom
                            {
                                const bottomSideLength = toTableSides.bottom.p2.x - toTableSides.bottom.p1.x;
                                const posOnLine = (toPathIndex + 1) * (bottomSideLength / (toPathCount + 1));
                                const end = { y: toTableSides.bottom.p1.y, x: toTableSides.bottom.p1.x + posOnLine };

                                const line1 = document.createElementNS(nsSvg, 'line');
                                line1.setAttributeNS(null, 'x1', start.x);
                                line1.setAttributeNS(null, 'y1', start.y);
                                line1.setAttributeNS(null, 'x2', end.x);
                                line1.setAttributeNS(null, 'y2', start.y);
                                this._svgElem.prepend(line1);

                                const line2 = document.createElementNS(nsSvg, 'line');
                                line2.setAttributeNS(null, 'x1', end.x);
                                line2.setAttributeNS(null, 'y1', start.y);
                                line2.setAttributeNS(null, 'x2', end.x);
                                line2.setAttributeNS(null, 'y2', end.y);
                                this._svgElem.prepend(line2);
                            }
                            break;
                    }
                }
                break;
            case PATH_TOP:
                {
                    const topSideLength = toTableSides.top.p2.x - toTableSides.top.p1.x;
                    const posOnLine = (toPathIndex + 1) * (topSideLength / (toPathCount + 1));
                    const start = { y: toTableSides.top.p1.y, x: toTableSides.top.p1.x + posOnLine };
                    switch (toTablePathSide) {
                        case PATH_LEFT:
                            {
                                const leftSideLength = toTableSides.left.p2.y - toTableSides.left.p1.y;
                                const posOnLine = (toPathIndex + 1) * (leftSideLength / (toPathCount + 1));
                                const end = { y: toTableSides.left.p1.y + posOnLine, x: toTableSides.left.p1.x };

                                const line1 = document.createElementNS(nsSvg, 'line');
                                line1.setAttributeNS(null, 'x1', start.x);
                                line1.setAttributeNS(null, 'y1', start.y);
                                line1.setAttributeNS(null, 'x2', end.x);
                                line1.setAttributeNS(null, 'y2', start.y);
                                this._svgElem.prepend(line1);

                                const line2 = document.createElementNS(nsSvg, 'line');
                                line2.setAttributeNS(null, 'x1', end.x);
                                line2.setAttributeNS(null, 'y1', start.y);
                                line2.setAttributeNS(null, 'x2', end.x);
                                line2.setAttributeNS(null, 'y2', end.y);
                                this._svgElem.prepend(line2);
                            }
                            break;
                        case PATH_RIGHT:

                        case PATH_TOP:

                        case PATH_BOTTOM:

                    }
                }
                break;
            case PATH_BOTTOM:
                {
                    switch (toTablePathSide) {
                        case PATH_LEFT:

                        case PATH_RIGHT:

                        case PATH_TOP:

                        case PATH_BOTTOM:

                    }
                }
                break;
        }

    }

    draw() {
        this.tables.forEach((table, i) => {
            const tableElm = table.render();
            tableElm.setAttribute('id', i + 'table');
            this._svgElem.appendChild(tableElm);

            table.columns.forEach(column => {
                if (column.fk) {
                    let relationInfo = { fromTable: table, toTable: column.fk.table, fromColumn: column, toColumn: column.fk.column };
                    const sidePathStart = this._getTableRelationSide(relationInfo);
                    relationInfo = { ...relationInfo, ...sidePathStart };
                    this._relationInfos.push(relationInfo);
                }
            });
        });

        this.tables.forEach(table => {
            const tableRelations = this._getTableRelations(table);

            const leftRelations = tableRelations.filter(
                r => r.toTable === table && r.toTablePathSide === PATH_LEFT || r.fromTable === table && r.fromTablePathSide === PATH_LEFT);
            const rightRelations = tableRelations.filter(
                r => r.toTable === table && r.toTablePathSide === PATH_RIGHT || r.fromTable === table && r.fromTablePathSide === PATH_RIGHT);
            const topRelations = tableRelations.filter(
                r => r.toTable === table && r.toTablePathSide === PATH_TOP || r.fromTable === table && r.fromTablePathSide === PATH_TOP);
            const bottomRelations = tableRelations.filter(
                r => r.toTable === table && r.toTablePathSide === PATH_BOTTOM || r.fromTable === table && r.fromTablePathSide === PATH_BOTTOM);

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
            this._drawRelation(relation);
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
                    if (relation.fromTable === table) {
                        if (relation.fromTablePathSide === PATH_LEFT) {
                            leftSideRelations.push(relation);
                        } else if (relation.fromTablePathSide === PATH_RIGHT) {
                            rightSideRelations.push(relation);
                        } else if (relation.fromTablePathSide === PATH_TOP) {
                            topSideRelations.push(relation);
                            //relation.fromTablePathSide === PATH_BOTTOM
                        } else {
                            bottomSideRelations.push(relation);
                        }
                        //relation.toTable === table
                    } else {
                        if (relation.toTablePathSide === PATH_LEFT) {
                            leftSideRelations.push(relation);
                        } else if (relation.toTablePathSide === PATH_RIGHT) {
                            rightSideRelations.push(relation);
                        } else if (relation.toTablePathSide === PATH_TOP) {
                            topSideRelations.push(relation);
                            //relation.toTablePathSide === PATH_BOTTOM
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