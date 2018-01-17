import Relation from './Relation.js';
import constant from './const.js';

const DESIGNER_PAN_HEIGHT = 1200;
const DESIGNER_PAN_WIDTH = 1600;

export default class Designer {
    constructor(tables = []) {
        this._container = document.getElementById('designer-container');
        this._svgElem = document.getElementById('designer');
        this._minimap = document.getElementById('minimap');
        this._viewpoint = document.getElementById('viewpoint');
        this._btnZoomIn = document.getElementById('btn-zoom-in');
        this._btnZoomOut = document.getElementById('btn-zoom-out');

        this._designerWidth = this._svgElem.scrollWidth;
        this._designerHeight = this._svgElem.scrollHeight;

        this.tables = tables;

        tables.forEach(table => table.setDesigner(this));

        this._viewBoxVals = {
            minX: 0,
            minY: 0,
            width: this._designerWidth,
            height: this._designerHeight
        };

        this._minimap.setAttribute('viewBox', `0 0 ${DESIGNER_PAN_WIDTH} ${DESIGNER_PAN_HEIGHT}`);

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

            const pendingSelfRelations = tableRelations.filter(relation => relation.calcPathTableSides());

            const leftRelations = tableRelations.filter(r =>
                ((r.toTable === table && r.toTablePathSide === constant.PATH_LEFT) ||
                    (r.fromTable === table && r.fromTablePathSide === constant.PATH_LEFT)) &&
                !r.sameTableRelation());
            const rightRelations = tableRelations.filter(r =>
                ((r.toTable === table && r.toTablePathSide === constant.PATH_RIGHT) ||
                    (r.fromTable === table && r.fromTablePathSide === constant.PATH_RIGHT)) &&
                !r.sameTableRelation());
            const topRelations = tableRelations.filter(r =>
                ((r.toTable === table && r.toTablePathSide === constant.PATH_TOP) ||
                    (r.fromTable === table && r.fromTablePathSide === constant.PATH_TOP)) &&
                !r.sameTableRelation());
            const bottomRelations = tableRelations.filter(r =>
                ((r.toTable === table && r.toTablePathSide === constant.PATH_BOTTOM) ||
                    (r.fromTable === table && r.fromTablePathSide === constant.PATH_BOTTOM)) &&
                !r.sameTableRelation());

            Relation.ySort(leftRelations, table);
            Relation.ySort(rightRelations, table);
            Relation.xSort(topRelations, table);
            Relation.xSort(bottomRelations, table);

            const sidesAndCount = [{
                side: 'left',
                order: 1,
                count: leftRelations.length
            },
            {
                side: 'right',
                order: 2,
                count: rightRelations.length
            },
            {
                side: 'top',
                order: 3,
                count: topRelations.length
            },
            {
                side: 'bottom',
                order: 4,
                count: bottomRelations.length
            }
            ];

            pendingSelfRelations.forEach(pendingSelfRelation => {
                const minPathSideCount = sidesAndCount.sort((item1, item2) => {
                    const result = item1.count - item2.count;
                    if (result === 0) {
                        return item1.order - item2.order
                    }
                    return result;
                })[0];

                switch (minPathSideCount.side) {
                    case 'left':
                        leftRelations.push(pendingSelfRelation);
                        pendingSelfRelation.fromTablePathSide = constant.PATH_LEFT;
                        pendingSelfRelation.toTablePathSide = constant.PATH_LEFT;
                        break;
                    case 'right':
                        rightRelations.push(pendingSelfRelation);
                        pendingSelfRelation.fromTablePathSide = constant.PATH_RIGHT;
                        pendingSelfRelation.toTablePathSide = constant.PATH_RIGHT;
                        break;
                    case 'top':
                        topRelations.push(pendingSelfRelation);
                        pendingSelfRelation.fromTablePathSide = constant.PATH_TOP;
                        pendingSelfRelation.toTablePathSide = constant.PATH_TOP;
                        break;
                    case 'bottom':
                        bottomRelations.push(pendingSelfRelation);
                        pendingSelfRelation.fromTablePathSide = constant.PATH_BOTTOM;
                        pendingSelfRelation.toTablePathSide = constant.PATH_BOTTOM;
                        break;
                }
                minPathSideCount.count += 2;
            });

            let pathIndex = 0;
            leftRelations.forEach(relation => {
                const count = sidesAndCount.find(item => item.side === 'left').count;
                if (relation.fromTable !== relation.toTable) {
                    if (relation.fromTable === table) {
                        relation.fromPathIndex = pathIndex;
                        relation.fromPathCount = count;
                    } else {
                        relation.toPathIndex = pathIndex;
                        relation.toPathCount = count;
                    }
                    pathIndex++;
                } else {
                    relation.fromPathCount = count;
                    relation.toPathCount = count;
                    relation.fromPathIndex = pathIndex;
                    relation.toPathIndex = pathIndex + 1;
                    pathIndex += 2;
                }
            });

            pathIndex = 0;
            rightRelations.forEach(relation => {
                const count = sidesAndCount.find(item => item.side === 'right').count;
                if (relation.fromTable !== relation.toTable) {
                    if (relation.fromTable === table) {
                        relation.fromPathIndex = pathIndex;
                        relation.fromPathCount = count;
                    } else {
                        relation.toPathIndex = pathIndex;
                        relation.toPathCount = count;
                    }
                    pathIndex++;
                } else {
                    relation.fromPathCount = count;
                    relation.toPathCount = count;
                    relation.fromPathIndex = pathIndex;
                    relation.toPathIndex = pathIndex + 1;
                    pathIndex += 2;
                }
            });

            pathIndex = 0;
            topRelations.forEach(relation => {
                const count = sidesAndCount.find(item => item.side === 'top').count;
                if (relation.fromTable !== relation.toTable) {
                    if (relation.fromTable === table) {
                        relation.fromPathIndex = pathIndex;
                        relation.fromPathCount = count;
                    } else {
                        relation.toPathIndex = pathIndex;
                        relation.toPathCount = count;
                    }
                    pathIndex++;
                } else {
                    relation.fromPathCount = count;
                    relation.toPathCount = count;
                    relation.fromPathIndex = pathIndex;
                    relation.toPathIndex = pathIndex + 1;
                    pathIndex += 2;
                }
            });

            pathIndex = 0;
            bottomRelations.forEach(relation => {
                const count = sidesAndCount.find(item => item.side === 'bottom').count;
                if (relation.fromTable !== relation.toTable) {
                    if (relation.fromTable === table) {
                        relation.fromPathIndex = pathIndex;
                        relation.fromPathCount = count;
                    } else {
                        relation.toPathIndex = pathIndex;
                        relation.toPathCount = count;
                    }
                    pathIndex++;
                } else {
                    relation.fromPathCount = count;
                    relation.toPathCount = count;
                    relation.fromPathIndex = pathIndex;
                    relation.toPathIndex = pathIndex + 1;
                    pathIndex += 2;
                }
            });
        });

        this._relationInfos.forEach(relation => {
            relation.removeHoverEffect();
            relation.getElems().forEach(elem => this._svgElem.removeChild(elem));
            const elems = relation.render();
            elems.forEach(elem => this._svgElem.prepend(elem));
        });
    }

    _drawMinimap() {
        this.tables
    }

    draw() {
        let minX = Number.MAX_SAFE_INTEGER;
        let maxX = Number.MIN_SAFE_INTEGER;
        let minY = Number.MAX_SAFE_INTEGER;
        let maxY = Number.MIN_SAFE_INTEGER;

        this.tables.forEach((table, i) => {
            const tableElm = table.render();
            tableElm.setAttribute('id', i + 'table');
            this._svgElem.appendChild(tableElm);

            const sides = table.getSides();

            const tableMini = document.createElementNS(constant.nsSvg, 'rect');
            tableMini.setAttributeNS(null, 'class', 'mini_table');
            tableMini.setAttributeNS(null, 'x', sides.left.p1.x);
            tableMini.setAttributeNS(null, 'y', sides.left.p1.y);
            tableMini.setAttributeNS(null, 'width', sides.top.p2.x - sides.top.p1.x);
            tableMini.setAttributeNS(null, 'height', sides.left.p2.y - sides.left.p1.y);
            this._minimap.appendChild(tableMini);

            table.columns.forEach(column => {
                if (column.fk) {
                    let relationInfo = {
                        fromTable: table,
                        toTable: column.fk.table,
                        fromColumn: column,
                        toColumn: column.fk.column
                    };
                    relationInfo = new Relation(relationInfo);
                    this._relationInfos.push(relationInfo);
                }
            });

            const rightX = table.getSides().right.p1.x;
            if (rightX > maxX) {
                maxX = rightX;
            }

            const leftX = table.getSides().left.p1.x;
            if (leftX < minX) {
                minX = leftX;
            }

            const topY = table.getSides().top.p1.y;
            if (topY < minY) {
                minY = topY;
            }

            const bottomY = table.getSides().bottom.p1.y;
            if (bottomY > maxY) {
                maxY = bottomY;
            }
        });

        this._designerOverallWidth = maxX - minX;
        this._designerOverallHeight = maxY - minY;

        // this._viewBoxVals.minY = (minY + maxY) / 2 - this._designerHeight / 2;
        // this._viewBoxVals.minX = (minX + maxX) / 2 - this._designerWidth / 2;

        this._viewBoxVals.minY = 0;
        this._viewBoxVals.minX = 0;
        this._setViewBox();

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

    _setViewBox() {
        this._svgElem.setAttribute('viewBox', `${this._viewBoxVals.minX} ${this._viewBoxVals.minY} ${this._viewBoxVals.width} ${this._viewBoxVals.height}`);
        this._viewpoint.setAttributeNS(null, 'x', this._viewBoxVals.minX);
        this._viewpoint.setAttributeNS(null, 'y', this._viewBoxVals.minY);
        this._viewpoint.setAttributeNS(null, 'width', this._viewBoxVals.width);
        this._viewpoint.setAttributeNS(null, 'height', this._viewBoxVals.height);
    }

    _setUpEvents() {
        const ZOOM = 1.2;

        let prevMouseCordX, prevMouseCordY;

        const mouseMove = () => {
            const deltaX = (event.clientX - prevMouseCordX) / this._zoom;
            const deltaY = (event.clientY - prevMouseCordY) / this._zoom;

            prevMouseCordY = event.clientY;
            prevMouseCordX = event.clientX;
            console.log(this._viewBoxVals.minX - deltaX, this._viewBoxVals.minY - deltaY)

            if (this._viewBoxVals.minX - deltaX + this._designerWidth < DESIGNER_PAN_WIDTH &&
                this._viewBoxVals.minX - deltaX >= 0) {
                this._viewBoxVals.minX -= deltaX;
                
            }
            if (this._viewBoxVals.minY - deltaY + this._designerHeight < DESIGNER_PAN_HEIGHT &&
                this._viewBoxVals.minY - deltaY >= 0) {
                this._viewBoxVals.minY -= deltaY;
                
            }
            this._setViewBox();
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
            this._setViewBox();
            this._zoom *= ZOOM;
        });

        this._btnZoomOut.addEventListener('click', () => {
            this._viewBoxVals.width = this._viewBoxVals.width * ZOOM;
            this._viewBoxVals.height = this._viewBoxVals.height * ZOOM;
            this._setViewBox();
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