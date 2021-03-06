'use strict';

const constant = require('../const');
const { to3FixedNumber } = require('./util.js');

module.exports = class Table {
  constructor({ name, columns = [], pos = { x: 0, y: 0 } }) {
    this.columns = columns;
    this._name = name;
    this._pos = pos;
  }

  _moveEvents() {
    let mouseDownInitialElemX, mouseDownInitialElemY;

    const mouseMove = event => {
      event.stopPropagation();
      const normalizedClientX = event.clientX / this._designer.getZoom() + this._designer.getPan().x;
      const normalizedClientY = event.clientY / this._designer.getZoom() + this._designer.getPan().y;
      const deltaX = normalizedClientX - mouseDownInitialElemX;
      const deltaY = normalizedClientY - mouseDownInitialElemY;
      this._elem.setAttributeNS(null, 'transform', `translate(${deltaX},${deltaY})`);
      this._onMove && this._onMove(this, deltaX, deltaY);
    };

    this._table.addEventListener('mousedown', event => {
      event.stopPropagation();
      const boundingRect = this._table.getBoundingClientRect();
      mouseDownInitialElemX = (event.clientX - boundingRect.left) / this._designer.getZoom();
      mouseDownInitialElemY = (event.clientY - boundingRect.top) / this._designer.getZoom();
      document.addEventListener('mousemove', mouseMove);
    }, false);
    document.addEventListener('mouseup', () => {
      document.removeEventListener('mousemove', mouseMove);
    }, false);
  }

  setName(name) {
    this._name = name;
  }

  getName() {
    return this._name;
  }

  addColumn(column) {
    this.columns.push(column);
  }

  setMoveListener(onMove) {
    this._onMove = onMove;
  }

  _normalizeX(num) {
    return to3FixedNumber(num / this._designer.getZoom() + this._designer.getPan().x);
  }

  _normalizeY(num) {
    return to3FixedNumber(num / this._designer.getZoom() + this._designer.getPan().y);
  }

  getCenter() {
    const designerCords = this._designer.getCords();
    const boundingRect = this._table.getBoundingClientRect();    
    
    const x = this._normalizeX(boundingRect.left - designerCords.x)  + to3FixedNumber(boundingRect.width / this._designer.getZoom()) / 2;    
    const y = this._normalizeY(boundingRect.top - designerCords.y) + to3FixedNumber(boundingRect.height / this._designer.getZoom()) / 2;
    return {
      x,
      y
    };
  }

  getSides() {
    const designerCords = this._designer.getCords();
    const boundingRect = this._table.getBoundingClientRect();
    return {
      right: {
        p1: {
          x: this._normalizeX(boundingRect.right - designerCords.x),
          y: this._normalizeY(boundingRect.top - designerCords.y)
        },
        p2: {
          x: this._normalizeX(boundingRect.right - designerCords.x),
          y: this._normalizeY(boundingRect.bottom - designerCords.y)
        }
      },
      left: {
        p1: {
          x: this._normalizeX(boundingRect.left - designerCords.x),
          y: this._normalizeY(boundingRect.top - designerCords.y)
        },
        p2: {
          x: this._normalizeX(boundingRect.left - designerCords.x),
          y: this._normalizeY(boundingRect.bottom - designerCords.y)
        }
      },
      top: {
        p1: {
          x: this._normalizeX(boundingRect.left - designerCords.x),
          y: this._normalizeY(boundingRect.top - designerCords.y)
        },
        p2: {
          x: this._normalizeX(boundingRect.right - designerCords.x),
          y: this._normalizeY(boundingRect.top - designerCords.y)
        }
      },
      bottom: {
        p1: {
          x: this._normalizeX(boundingRect.left - designerCords.x),
          y: this._normalizeY(boundingRect.bottom - designerCords.y)
        },
        p2: {
          x: this._normalizeX(boundingRect.right - designerCords.x),
          y: this._normalizeY(boundingRect.bottom - designerCords.y)
        }
      }
    };
  }

  render() {
    this._elem = document.createElementNS(constant.NS_SVG, 'foreignObject');
    this._elem.setAttributeNS(null, 'transform', `translate(${this._pos.x},${this._pos.y})`);

    this._table = document.createElementNS(constant.NS_HTML, 'table');
    this._table.className = 'table';
    const headingTr = document.createElementNS(constant.NS_HTML, 'tr');
    this._table.appendChild(headingTr);
    const headingTh = document.createElementNS(constant.NS_HTML, 'th');
    headingTh.setAttributeNS(null, 'colspan', 2);
    headingTh.innerHTML = this._name;
    headingTr.appendChild(headingTh);

    this._elem.appendChild(this._table);

    this.columns.forEach(column => {
      const columnTr = document.createElementNS(constant.NS_HTML, 'tr');
      column.elem = columnTr;
      this._table.appendChild(columnTr);

      const columnNameTd = document.createElementNS(constant.NS_HTML, 'td');
      columnNameTd.innerHTML = column.name;
      columnTr.appendChild(columnNameTd);

      const columnTypeTd = document.createElementNS(constant.NS_HTML, 'td');
      if (column.fk) {
        columnTypeTd.innerHTML = column.fk.column.type;
      } else {
        columnTypeTd.innerHTML = column.type;
      }
      columnTr.appendChild(columnTypeTd);
    });
    this._moveEvents();
    return this._elem;
  }

  setDesigner(designer) {
    this._designer = designer;
  }

  getElement() {
    return this._elem;
  }

  highlightFrom(column) {
    column.elem.classList.add('fromRelation');
  }

  removeHighlightFrom(column) {
    column.elem.classList.remove('fromRelation');
  }

  highlightTo(column) {
    column.elem.classList.add('toRelation');
  }

  removeHighlightTo(column) {
    column.elem.classList.remove('toRelation');
  }
}