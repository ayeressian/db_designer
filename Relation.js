import { segmentIntersection } from './util.js';
import constant from './const.js';

export class MissingCountIndex extends Error {
  constructor() {
    super('toPathIndex and fromPathCount must be defined before calling render');
  }
}

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

    this._getTableRelationSide();

    this.lineElems = [];
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
    const line1 = document.createElementNS(constant.nsSvg, 'line');
    line1.setAttributeNS(null, 'x1', start.x);
    line1.setAttributeNS(null, 'y1', start.y);
    line1.setAttributeNS(null, 'x2', end.x);
    line1.setAttributeNS(null, 'y2', start.y);

    const line2 = document.createElementNS(constant.nsSvg, 'line');
    line2.setAttributeNS(null, 'x1', end.x);
    line2.setAttributeNS(null, 'y1', start.y);
    line2.setAttributeNS(null, 'x2', end.x);
    line2.setAttributeNS(null, 'y2', end.y);

    return [line1, line2];
  }

  _get3LinePathHoriz(start, end) {
    if (start.x > end.x) {
      const tmp = start;
      start = end;
      end = tmp;
    }     

    const p2X = start.x + (end.x - start.x) / 2;

    const line1 = document.createElementNS(constant.nsSvg, 'line');
    line1.setAttributeNS(null, 'x1', start.x);
    line1.setAttributeNS(null, 'y1', start.y);
    line1.setAttributeNS(null, 'x2', p2X);
    line1.setAttributeNS(null, 'y2', start.y);

    const line2 = document.createElementNS(constant.nsSvg, 'line');
    line2.setAttributeNS(null, 'x1', p2X);
    line2.setAttributeNS(null, 'y1', start.y);
    line2.setAttributeNS(null, 'x2', p2X);
    line2.setAttributeNS(null, 'y2', end.y);

    const line3 = document.createElementNS(constant.nsSvg, 'line');
    line3.setAttributeNS(null, 'x1', p2X);
    line3.setAttributeNS(null, 'y1', end.y);
    line3.setAttributeNS(null, 'x2', end.x);
    line3.setAttributeNS(null, 'y2', end.y);

    return [line1, line2, line3];
  }

  render() {
    if (this.toPathIndex == null || this.fromPathCount == null) throw new MissingCountIndex();

    const fromTableSides = this.fromTable.getSides();
    const toTableSides = this.toTable.getSides();

    switch (this.fromTablePathSide) {
      case constant.PATH_LEFT:
        {
          const start = this._getLeftSidePathCord(fromTableSides, this.fromPathIndex, this.fromPathCount);
          switch (this.toTablePathSide) {
            case constant.PATH_LEFT:
              //relation form self to self
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

                this.lineElems = this._get2LinePathFlatTop(start, end);
              }
              break;
          }
        }
        break;
      case constant.PATH_RIGHT:
        {
          const start = this._getRightSidePathCord(fromTableSides, this.toPathIndex, this.toPathCount);

          switch (this.toTablePathSide) {
            case constant.PATH_LEFT:
              {
                const end = this._getLeftSidePathCord(toTableSides, this.toPathIndex, this.toPathCount);                

                this.lineElems = this._get3LinePathHoriz(start, end);
              }
              break;
            case constant.PATH_RIGHT:
              //relation form self to self
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

                this.lineElems = this._get2LinePathFlatTop(start, end);
              }
              break;
          }
        }
        break;
      case constant.PATH_TOP:
        {
          const start = this._getTopSidePathCord(fromTableSides, this.toPathIndex, this.toPathCount);

          switch (this.toTablePathSide) {
            case constant.PATH_LEFT:
              {
                const end = this._getLeftSidePathCord(toTableSides, this.toPathIndex, this.toPathCount);

                const { line1, line2 } = this._get2LinePathFlatTop(start, end);
                this.lineElems = [line1, line2];
              }
              break;
            case constant.PATH_RIGHT:

            case constant.PATH_TOP:

            case constant.PATH_BOTTOM:

          }
        }
        break;
      case constant.PATH_BOTTOM:
        {
          switch (this.toTablePathSide) {
            case constant.PATH_LEFT:

            case constant.PATH_RIGHT:

            case constant.PATH_TOP:

            case constant.PATH_BOTTOM:

          }
        }
        break;
    }
    return this.lineElems;
  }

  _getTableRelationSide() {
    const fromTableCenter = this.fromTable.getCenter();
    const toTableCenter = this.toTable.getCenter();

    const fromTableSides = this.fromTable.getSides();

    let fromTablePathSide;

    const intersectFromTableRightSide = segmentIntersection(fromTableCenter, toTableCenter, fromTableSides.right.p1, fromTableSides.right.p2);
    if (intersectFromTableRightSide) {
      fromTablePathSide = constant.PATH_RIGHT;
    }
    const intersectFromTableLeftSide = segmentIntersection(fromTableCenter, toTableCenter, fromTableSides.left.p1, fromTableSides.left.p2);
    if (intersectFromTableLeftSide) {
      fromTablePathSide = constant.PATH_LEFT;
    }
    const intersectFromTableTopSide = segmentIntersection(fromTableCenter, toTableCenter, fromTableSides.top.p1, fromTableSides.top.p2);
    if (intersectFromTableTopSide) {
      fromTablePathSide = constant.PATH_TOP;
    }
    const intersectFromTableBottomSide = segmentIntersection(fromTableCenter, toTableCenter, fromTableSides.bottom.p1, fromTableSides.bottom.p2);
    if (intersectFromTableBottomSide) {
      fromTablePathSide = constant.PATH_BOTTOM;
    }

    const toTableSides = this.toTable.getSides();

    let toTablePathSide;

    const intersectToTableRightSide = segmentIntersection(fromTableCenter, toTableCenter, toTableSides.right.p1, toTableSides.right.p2);
    if (intersectToTableRightSide) {
      toTablePathSide = constant.PATH_RIGHT;
    }
    const intersectToTableLeftSide = segmentIntersection(fromTableCenter, toTableCenter, toTableSides.left.p1, toTableSides.left.p2);
    if (intersectToTableLeftSide) {
      toTablePathSide = constant.PATH_LEFT;
    }
    const intersectToTableTopSide = segmentIntersection(fromTableCenter, toTableCenter, toTableSides.top.p1, toTableSides.top.p2);
    if (intersectToTableTopSide) {
      toTablePathSide = constant.PATH_TOP;
    }
    const intersectToTableBottomSide = segmentIntersection(fromTableCenter, toTableCenter, toTableSides.bottom.p1, toTableSides.bottom.p2);
    if (intersectToTableBottomSide) {
      toTablePathSide = constant.PATH_BOTTOM;
    }

    this.fromTablePathSide = fromTablePathSide;
    this.toTablePathSide = toTablePathSide;
  }

  getElems() {
    return this.lineElems;
  }
}