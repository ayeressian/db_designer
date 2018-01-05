import { segmentIntersection } from './util.js';
import constant from './const.js';

export class MissingCountIndex extends Error {
  constructor() {
    super('toPathIndex and fromPathCount must be defined before calling render');
  }
}

const PATH_ARROW_LENGTH = 9,
  PATH_ARROW_HEIGHT = 4,
  PATH_START_PADDING = 7,
  PATH_START_LENGTH = 5,
  PATH_SELF_RELATION_LENGTH = 40;

export default class Relation {
  constructor({
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
    this.fromColumn = fromColumn;
    this.fromPathCount = fromPathCount;
    this.fromPathIndex = fromPathIndex;
    this.fromTable = fromTable;
    this.toColumn = toColumn;
    this.toPathCount = toPathCount;
    this.toPathIndex = toPathIndex;
    this.toTable = toTable;

    this.lineElems = [];
  }

  update() {
    this._getTableRelationSide();
  }

  static _createLine(x1, y1, x2, y2) {
    const line = document.createElementNS(constant.nsSvg, 'line');
    line.setAttributeNS(null, 'x1', x1);
    line.setAttributeNS(null, 'y1', y1);
    line.setAttributeNS(null, 'x2', x2);
    line.setAttributeNS(null, 'y2', y2);

    return line;
  }

  _getPosOnLine(pathIndex, pathCount, sideLength) {
    return (pathIndex + 1) * (sideLength / (pathCount + 1));
  }

  _getLeftSidePathCord(tableSides, pathIndex, pathCount) {
    const sideLength = tableSides.left.p2.y - tableSides.left.p1.y;
    const posOnLine = this._getPosOnLine(pathIndex, pathCount, sideLength);
    return { y: tableSides.left.p1.y + posOnLine, x: tableSides.left.p1.x };
  }

  _getRightSidePathCord(tableSides, pathIndex, pathCount) {
    const sideLength = tableSides.right.p2.y - tableSides.right.p1.y;
    const posOnLine = this._getPosOnLine(pathIndex, pathCount, sideLength);
    return { y: tableSides.right.p1.y + posOnLine, x: tableSides.right.p1.x };
  }

  _getTopSidePathCord(tableSides, pathIndex, pathCount) {
    const sideLength = tableSides.top.p2.x - tableSides.top.p1.x;
    const posOnLine = this._getPosOnLine(pathIndex, pathCount, sideLength);
    return { y: tableSides.top.p1.y, x: tableSides.top.p1.x + posOnLine };
  }

  _getBottomSidePathCord(tableSides, pathIndex, pathCount) {
    const sideLength = tableSides.bottom.p2.x - tableSides.bottom.p1.x;
    const posOnLine = this._getPosOnLine(pathIndex, pathCount, sideLength);
    return { y: tableSides.bottom.p1.y, x: tableSides.bottom.p1.x + posOnLine };
  }

  _get2LinePathFlatTop(start, end) {
    const arrowline1 = document.createElementNS(constant.nsSvg, 'line');
    arrowline1.setAttributeNS(null, 'x1', end.x);
    arrowline1.setAttributeNS(null, 'y1', end.y);

    const arrowline2 = document.createElementNS(constant.nsSvg, 'line');
    arrowline2.setAttributeNS(null, 'x1', end.x);
    arrowline2.setAttributeNS(null, 'y1', end.y);

    const startLine = document.createElementNS(constant.nsSvg, 'line');

    if (start.y > end.y) {
      arrowline1.setAttributeNS(null, 'y2', end.y + PATH_ARROW_HEIGHT);
      arrowline2.setAttributeNS(null, 'y2', end.y - PATH_ARROW_HEIGHT);

      startLine.setAttributeNS(null, 'x1', start.x - PATH_START_LENGTH);
      startLine.setAttributeNS(null, 'x2', start.x + PATH_START_LENGTH);
      startLine.setAttributeNS(null, 'y1', start.y - PATH_START_PADDING);
      startLine.setAttributeNS(null, 'y2', start.y - PATH_START_PADDING);

      if (start.x > end.x) {
        arrowline1.setAttributeNS(null, 'x2', end.x + PATH_ARROW_LENGTH);
        arrowline2.setAttributeNS(null, 'x2', end.x + PATH_ARROW_LENGTH);
      } else {
        arrowline1.setAttributeNS(null, 'x2', end.x - PATH_ARROW_LENGTH);
        arrowline2.setAttributeNS(null, 'x2', end.x - PATH_ARROW_LENGTH);
      }

      const tmp = start;
      start = end;
      end = tmp;
    } else {
      arrowline1.setAttributeNS(null, 'x2', end.x + PATH_ARROW_HEIGHT);
      arrowline1.setAttributeNS(null, 'y2', end.y - PATH_ARROW_LENGTH);
      arrowline2.setAttributeNS(null, 'x2', end.x - PATH_ARROW_HEIGHT);
      arrowline2.setAttributeNS(null, 'y2', end.y - PATH_ARROW_LENGTH);

      startLine.setAttributeNS(null, 'y1', start.y - PATH_START_LENGTH);
      startLine.setAttributeNS(null, 'y2', start.y + PATH_START_LENGTH);

      if (start.x > end.x) {
        startLine.setAttributeNS(null, 'x1', start.x - PATH_START_PADDING);
        startLine.setAttributeNS(null, 'x2', start.x - PATH_START_PADDING);
      } else {
        startLine.setAttributeNS(null, 'x1', start.x + PATH_START_PADDING);
        startLine.setAttributeNS(null, 'x2', start.x + PATH_START_PADDING);
      }
    }

    const line1 = Relation._createLine(start.x, start.y, end.x, start.y);

    const line2 = Relation._createLine(end.x, start.y, end.x, end.y);

    return [arrowline1, arrowline2, line1, line2, startLine];
  }

  _get2LinePathFlatBottom(start, end) {
    const arrowline1 = document.createElementNS(constant.nsSvg, 'line');
    arrowline1.setAttributeNS(null, 'x1', end.x);
    arrowline1.setAttributeNS(null, 'y1', end.y);
    const arrowline2 = document.createElementNS(constant.nsSvg, 'line');
    arrowline2.setAttributeNS(null, 'x1', end.x);
    arrowline2.setAttributeNS(null, 'y1', end.y);

    const startLine = document.createElementNS(constant.nsSvg, 'line');

    if (start.y > end.y) {
      arrowline1.setAttributeNS(null, 'x2', end.x + PATH_ARROW_HEIGHT);
      arrowline1.setAttributeNS(null, 'y2', end.y + PATH_ARROW_LENGTH);
      arrowline2.setAttributeNS(null, 'x2', end.x - PATH_ARROW_HEIGHT);
      arrowline2.setAttributeNS(null, 'y2', end.y + PATH_ARROW_LENGTH);

      startLine.setAttributeNS(null, 'y1', start.y - PATH_START_LENGTH);
      startLine.setAttributeNS(null, 'y2', start.y + PATH_START_LENGTH);

      if (start.x > end.x) {
        startLine.setAttributeNS(null, 'x1', start.x - PATH_START_PADDING);
        startLine.setAttributeNS(null, 'x2', start.x - PATH_START_PADDING);
      } else {
        startLine.setAttributeNS(null, 'x1', start.x + PATH_START_PADDING);
        startLine.setAttributeNS(null, 'x2', start.x + PATH_START_PADDING);
      }

      const tmp = start;
      start = end;
      end = tmp;
    } else {
      arrowline1.setAttributeNS(null, 'y2', end.y + PATH_ARROW_HEIGHT);
      arrowline2.setAttributeNS(null, 'y2', end.y - PATH_ARROW_HEIGHT);

      startLine.setAttributeNS(null, 'x1', start.x - PATH_START_LENGTH);
      startLine.setAttributeNS(null, 'x2', start.x + PATH_START_LENGTH);
      startLine.setAttributeNS(null, 'y1', start.y + PATH_START_PADDING);
      startLine.setAttributeNS(null, 'y2', start.y + PATH_START_PADDING);

      if (start.x > end.x) {
        arrowline1.setAttributeNS(null, 'x2', end.x + PATH_ARROW_LENGTH);
        arrowline2.setAttributeNS(null, 'x2', end.x + PATH_ARROW_LENGTH);
      } else {
        arrowline1.setAttributeNS(null, 'x2', end.x - PATH_ARROW_LENGTH);
        arrowline2.setAttributeNS(null, 'x2', end.x - PATH_ARROW_LENGTH);
      }
    }

    const line1 = Relation._createLine(start.x, start.y, start.x, end.y);

    const line2 = Relation._createLine(start.x, end.y, end.x, end.y);

    return [arrowline1, arrowline2, line1, line2, startLine];
  }

  _get3LinePathHoriz(start, end) {
    const arrowline1 = document.createElementNS(constant.nsSvg, 'line');
    arrowline1.setAttributeNS(null, 'x1', end.x);
    arrowline1.setAttributeNS(null, 'y1', end.y);
    arrowline1.setAttributeNS(null, 'y2', end.y + PATH_ARROW_HEIGHT);

    const arrowline2 = document.createElementNS(constant.nsSvg, 'line');
    arrowline2.setAttributeNS(null, 'x1', end.x);
    arrowline2.setAttributeNS(null, 'y1', end.y);
    arrowline2.setAttributeNS(null, 'y2', end.y - PATH_ARROW_HEIGHT);

    const startLine = document.createElementNS(constant.nsSvg, 'line');
    startLine.setAttributeNS(null, 'y1', start.y - PATH_START_LENGTH);
    startLine.setAttributeNS(null, 'y2', start.y + PATH_START_LENGTH);

    if (start.x > end.x) {
      arrowline1.setAttributeNS(null, 'x2', end.x + PATH_ARROW_LENGTH);
      arrowline2.setAttributeNS(null, 'x2', end.x + PATH_ARROW_LENGTH);

      startLine.setAttributeNS(null, 'x1', start.x - PATH_START_PADDING);
      startLine.setAttributeNS(null, 'x2', start.x - PATH_START_PADDING);

      const tmp = start;
      start = end;
      end = tmp;
    } else {
      arrowline1.setAttributeNS(null, 'x2', end.x - PATH_ARROW_LENGTH);
      arrowline2.setAttributeNS(null, 'x2', end.x - PATH_ARROW_LENGTH);

      startLine.setAttributeNS(null, 'x1', start.x + PATH_START_PADDING);
      startLine.setAttributeNS(null, 'x2', start.x + PATH_START_PADDING);
    }

    const p2X = start.x + (end.x - start.x) / 2;

    const line1 = Relation._createLine(start.x, start.y, p2X, start.y);

    const line2 = Relation._createLine(p2X, start.y, p2X, end.y);

    const line3 = Relation._createLine(p2X, end.y, end.x, end.y);

    return [arrowline1, arrowline2, line1, line2, line3, startLine];
  }

  _get3LinePathVert(start, end) {
    const arrowline1 = document.createElementNS(constant.nsSvg, 'line');
    arrowline1.setAttributeNS(null, 'x1', end.x);
    arrowline1.setAttributeNS(null, 'y1', end.y);
    arrowline1.setAttributeNS(null, 'x2', end.x + PATH_ARROW_HEIGHT);

    const arrowline2 = document.createElementNS(constant.nsSvg, 'line');
    arrowline2.setAttributeNS(null, 'x1', end.x);
    arrowline2.setAttributeNS(null, 'y1', end.y);
    arrowline2.setAttributeNS(null, 'x2', end.x - PATH_ARROW_HEIGHT);

    const startLine = document.createElementNS(constant.nsSvg, 'line');
    startLine.setAttributeNS(null, 'x1', start.x - PATH_START_LENGTH);
    startLine.setAttributeNS(null, 'x2', start.x + PATH_START_LENGTH);

    if (start.y > end.y) {
      arrowline1.setAttributeNS(null, 'y2', end.y + PATH_ARROW_LENGTH);
      arrowline2.setAttributeNS(null, 'y2', end.y + PATH_ARROW_LENGTH);

      startLine.setAttributeNS(null, 'y1', start.y - PATH_START_PADDING);
      startLine.setAttributeNS(null, 'y2', start.y - PATH_START_PADDING);
    } else {
      arrowline1.setAttributeNS(null, 'y2', end.y - PATH_ARROW_LENGTH);
      arrowline2.setAttributeNS(null, 'y2', end.y - PATH_ARROW_LENGTH);

      startLine.setAttributeNS(null, 'y1', start.y + PATH_START_PADDING);
      startLine.setAttributeNS(null, 'y2', start.y + PATH_START_PADDING);
    }

    if (start.x > end.x) {
      const tmp = start;
      start = end;
      end = tmp;
    }

    const p2Y = start.y + (end.y - start.y) / 2;

    const line1 = Relation._createLine(start.x, start.y, start.x, p2Y);

    const line2 = Relation._createLine(start.x, p2Y, end.x, p2Y);

    const line3 = Relation._createLine(end.x, p2Y, end.x, end.y);

    return [arrowline1, arrowline2, line1, line2, line3, startLine];
  }

  render() {
    //if (this.toPathIndex == null || this.fromPathCount == null) throw new MissingCountIndex();

    const fromTableSides = this.fromTable.getSides();
    const toTableSides = this.toTable.getSides();

    switch (this.fromTablePathSide) {
      case constant.PATH_LEFT:
        {
          const start = this._getLeftSidePathCord(fromTableSides, this.fromPathIndex, this.fromPathCount);
          switch (this.toTablePathSide) {
            case constant.PATH_LEFT:
              {
                const end = this._getLeftSidePathCord(toTableSides, this.toPathIndex, this.toPathCount);
                const line1 = Relation._createLine(start.x, start.y, start.x - PATH_SELF_RELATION_LENGTH, start.y);

                const line2 = Relation._createLine(start.x - PATH_SELF_RELATION_LENGTH, start.y, start.x - PATH_SELF_RELATION_LENGTH, end.y);

                const line3 = Relation._createLine(start.x - PATH_SELF_RELATION_LENGTH, end.y, end.x, end.y);

                const arrowline1 = Relation._createLine(end.x, end.y, end.x - PATH_ARROW_LENGTH, end.y + PATH_ARROW_HEIGHT);

                const arrowline2 = Relation._createLine(end.x, end.y, end.x - PATH_ARROW_LENGTH, end.y - PATH_ARROW_HEIGHT);

                const startLine = Relation._createLine(start.x - PATH_START_PADDING, start.y + PATH_START_LENGTH, start.x - PATH_START_PADDING, start.y - PATH_START_LENGTH);

                this.lineElems = [line1, line2, line3, arrowline1, arrowline2, startLine];
              }
              break;
            case constant.PATH_RIGHT:
              {
                const end = this._getRightSidePathCord(toTableSides, this.toPathIndex, this.toPathCount);

                this.lineElems = this._get3LinePathHoriz(start, end);
              }
              break;
            case constant.PATH_TOP:
              {
                const end = this._getTopSidePathCord(toTableSides, this.toPathIndex, this.toPathCount);

                this.lineElems = this._get2LinePathFlatTop(start, end);
              }
              break;
            case constant.PATH_BOTTOM:
              {
                const end = this._getBottomSidePathCord(toTableSides, this.toPathIndex, this.toPathCount);

                this.lineElems = this._get2LinePathFlatBottom(start, end);
              }
              break;
          }
        }
        break;
      case constant.PATH_RIGHT:
        {
          const start = this._getRightSidePathCord(fromTableSides, this.fromPathIndex, this.fromPathCount);

          switch (this.toTablePathSide) {
            case constant.PATH_LEFT:
              {
                const end = this._getLeftSidePathCord(toTableSides, this.toPathIndex, this.toPathCount);

                this.lineElems = this._get3LinePathHoriz(start, end);
              }
              break;
            case constant.PATH_RIGHT:
              {
                const end = this._getRightSidePathCord(toTableSides, this.toPathIndex, this.toPathCount);

                const line1 = Relation._createLine(start.x, start.y, start.x + PATH_SELF_RELATION_LENGTH, start.y);

                const line2 = Relation._createLine(start.x + PATH_SELF_RELATION_LENGTH, start.y, start.x + PATH_SELF_RELATION_LENGTH, end.y);

                const line3 = Relation._createLine(start.x + PATH_SELF_RELATION_LENGTH, end.y, end.x, end.y);

                const arrowline1 = Relation._createLine(end.x, end.y, end.x + PATH_ARROW_LENGTH, end.y + PATH_ARROW_HEIGHT);

                const arrowline2 = Relation._createLine(end.x, end.y, end.x + PATH_ARROW_LENGTH, end.y - PATH_ARROW_HEIGHT);

                const startLine = Relation._createLine(start.x + PATH_START_PADDING, start.y + PATH_START_LENGTH, start.x + PATH_START_PADDING, start.y - PATH_START_LENGTH);

                this.lineElems = [line1, line2, line3, arrowline1, arrowline2, startLine];
              }
              break;
            case constant.PATH_TOP:
              {
                const end = this._getTopSidePathCord(toTableSides, this.toPathIndex, this.toPathCount);

                this.lineElems = this._get2LinePathFlatTop(start, end);
              }
              break;
            case constant.PATH_BOTTOM:
              {
                const end = this._getBottomSidePathCord(toTableSides, this.toPathIndex, this.toPathCount);

                this.lineElems = this._get2LinePathFlatBottom(start, end);
              }
              break;
          }
        }
        break;
      case constant.PATH_TOP:
        {
          const start = this._getTopSidePathCord(fromTableSides, this.fromPathIndex, this.fromPathCount);

          switch (this.toTablePathSide) {
            case constant.PATH_LEFT:
              {
                const end = this._getLeftSidePathCord(toTableSides, this.toPathIndex, this.toPathCount);

                this.lineElems = this._get2LinePathFlatTop(start, end);
              }
              break;
            case constant.PATH_RIGHT:
              {
                const end = this._getRightSidePathCord(toTableSides, this.toPathIndex, this.toPathCount);

                this.lineElems = this._get2LinePathFlatTop(start, end);
              }
              break;
            case constant.PATH_TOP:
              {
                const end = this._getTopSidePathCord(toTableSides, this.toPathIndex, this.toPathCount);

                const line1 = Relation._createLine(start.x, start.y, start.x, start.y - PATH_SELF_RELATION_LENGTH);

                const line2 = Relation._createLine(start.x, start.y  - PATH_SELF_RELATION_LENGTH, end.x, start.y - PATH_SELF_RELATION_LENGTH);

                const line3 = Relation._createLine(end.x, start.y - PATH_SELF_RELATION_LENGTH, end.x, end.y);

                const arrowline1 = Relation._createLine(end.x, end.y, end.x + PATH_ARROW_HEIGHT, end.y - PATH_ARROW_LENGTH);

                const arrowline2 = Relation._createLine(end.x, end.y, end.x - PATH_ARROW_HEIGHT, end.y - PATH_ARROW_LENGTH);

                const startLine = Relation._createLine(start.x + PATH_START_LENGTH, start.y - PATH_START_PADDING, start.x - PATH_START_LENGTH, start.y - PATH_START_PADDING);

                this.lineElems = [line1, line2, line3, arrowline1, arrowline2, startLine];
              }
              break;
            case constant.PATH_BOTTOM:
              {
                const end = this._getBottomSidePathCord(toTableSides, this.toPathIndex, this.toPathCount);

                this.lineElems = this._get3LinePathVert(start, end);
              }
              break;
          }
        }
        break;
      case constant.PATH_BOTTOM:
        {
          const start = this._getBottomSidePathCord(fromTableSides, this.fromPathIndex, this.fromPathCount);

          switch (this.toTablePathSide) {
            case constant.PATH_LEFT:
              {
                const end = this._getLeftSidePathCord(toTableSides, this.toPathIndex, this.toPathCount);

                this.lineElems = this._get2LinePathFlatBottom(start, end);
              }
              break;
            case constant.PATH_RIGHT:
              {
                const end = this._getRightSidePathCord(toTableSides, this.toPathIndex, this.toPathCount);

                this.lineElems = this._get2LinePathFlatBottom(start, end);
              }
              break;
            case constant.PATH_TOP:
              {
                const end = this._getTopSidePathCord(toTableSides, this.toPathIndex, this.toPathCount);

                this.lineElems = this._get3LinePathVert(start, end);
              }
              break;
            case constant.PATH_BOTTOM:
              {
                const end = this._getBottomSidePathCord(toTableSides, this.toPathIndex, this.toPathCount);

                const line1 = Relation._createLine(start.x, start.y, start.x, start.y + PATH_SELF_RELATION_LENGTH);

                const line2 = Relation._createLine(start.x, start.y + PATH_SELF_RELATION_LENGTH, end.x, start.y + PATH_SELF_RELATION_LENGTH);

                const line3 = Relation._createLine(end.x, start.y  + PATH_SELF_RELATION_LENGTH, end.x, end.y);

                const arrowline1 = Relation._createLine(end.x, end.y, end.x - PATH_ARROW_HEIGHT, end.y + PATH_ARROW_LENGTH);

                const arrowline2 = Relation._createLine(end.x, end.y, end.x + PATH_ARROW_HEIGHT, end.y + PATH_ARROW_LENGTH);

                const startLine = Relation._createLine(start.x + PATH_START_LENGTH, start.y + PATH_START_PADDING, start.x - PATH_START_LENGTH, start.y + PATH_START_PADDING);

                this.lineElems = [line1, line2, line3, arrowline1, arrowline2, startLine];
              }
              break;
          }
        }
        break;
    }
    return this.lineElems;
  }

  sameTableRelation() {
    return this.fromTable === this.toTable;
  }

  calcPathTableSides() {
    if (this.fromTable === this.toTable) {
      return this;
    }
    const fromTableCenter = this.fromTable.getCenter();
    const toTableCenter = this.toTable.getCenter();

    const fromTableSides = this.fromTable.getSides();
    // console.log('from left: ', fromTableSides.left);

    const intersectFromTableRightSide = segmentIntersection(fromTableCenter, toTableCenter, fromTableSides.right.p1, fromTableSides.right.p2);
    if (intersectFromTableRightSide) {
      this.fromIntersectPoint = intersectFromTableRightSide;
      this.fromTablePathSide = constant.PATH_RIGHT;
    }
    const intersectFromTableLeftSide = segmentIntersection(fromTableCenter, toTableCenter, fromTableSides.left.p1, fromTableSides.left.p2);
    if (intersectFromTableLeftSide) {
      this.fromIntersectPoint = intersectFromTableLeftSide;
      this.fromTablePathSide = constant.PATH_LEFT;
    }
    const intersectFromTableTopSide = segmentIntersection(fromTableCenter, toTableCenter, fromTableSides.top.p1, fromTableSides.top.p2);
    if (intersectFromTableTopSide) {
      this.fromIntersectPoint = intersectFromTableTopSide;
      this.fromTablePathSide = constant.PATH_TOP;
    }
    const intersectFromTableBottomSide = segmentIntersection(fromTableCenter, toTableCenter, fromTableSides.bottom.p1, fromTableSides.bottom.p2);
    if (intersectFromTableBottomSide) {
      this.fromIntersectPoint = intersectFromTableBottomSide;
      this.fromTablePathSide = constant.PATH_BOTTOM;
    }

    const toTableSides = this.toTable.getSides();
    // console.log('to right: ', toTableSides.right);

    const intersectToTableRightSide = segmentIntersection(fromTableCenter, toTableCenter, toTableSides.right.p1, toTableSides.right.p2);
    if (intersectToTableRightSide) {
      this.toIntersectPoint = intersectToTableRightSide;
      this.toTablePathSide = constant.PATH_RIGHT;
    }
    const intersectToTableLeftSide = segmentIntersection(fromTableCenter, toTableCenter, toTableSides.left.p1, toTableSides.left.p2);
    if (intersectToTableLeftSide) {
      this.toIntersectPoint = intersectToTableLeftSide;
      this.toTablePathSide = constant.PATH_LEFT;
    }
    const intersectToTableTopSide = segmentIntersection(fromTableCenter, toTableCenter, toTableSides.top.p1, toTableSides.top.p2);
    if (intersectToTableTopSide) {
      this.toIntersectPoint = intersectToTableTopSide;
      this.toTablePathSide = constant.PATH_TOP;
    }
    const intersectToTableBottomSide = segmentIntersection(fromTableCenter, toTableCenter, toTableSides.bottom.p1, toTableSides.bottom.p2);
    if (intersectToTableBottomSide) {
      this.toIntersectPoint = intersectToTableBottomSide;
      this.toTablePathSide = constant.PATH_BOTTOM;
    }
  }

  getElems() {
    return this.lineElems;
  }

  static _ySort(arr, table) {
    arr.sort((r1, r2) => {
      if (r1.fromIntersectPoint == null || r2.fromIntersectPoint == null) {
        return -1;
      }
      if (r1.fromTable === table) {
        if (r2.fromTable === table) {
          return r1.fromIntersectPoint.y - r2.fromIntersectPoint.y;
        }
        return r1.fromIntersectPoint.y - r2.toIntersectPoint.y;
      } else {
        if (r2.fromTable === table) {
          return r1.toIntersectPoint.y - r2.fromIntersectPoint.y;
        }
        return r1.toIntersectPoint.y - r2.toIntersectPoint.y;
      }
    });
  }

  static _xSort(arr, table) {
    arr.sort((r1, r2) => {
      if (r1.fromIntersectPoint == null || r2.fromIntersectPoint == null) {
        return -1;
      }
      if (r1.fromTable === table) {
        if (r2.fromTable === table) {
          return r1.fromIntersectPoint.x - r2.fromIntersectPoint.x;
        }
        return r1.fromIntersectPoint.x - r2.toIntersectPoint.x;
      } else {
        if (r2.fromTable === table) {
          return r1.toIntersectPoint.x - r2.fromIntersectPoint.x;
        }
        return r1.toIntersectPoint.x - r2.toIntersectPoint.x;
      }
    });
  }
}