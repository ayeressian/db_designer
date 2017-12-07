import constant from './const.js';

export default class Table {
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
            this._onMove && this._onMove();
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

    addColumn(column) {
        this.columns.push(column);
    }

    setMoveListener(onMove) {
        this._onMove = onMove;
    }

    getCenter() {
        const boundingRect = this._table.getBoundingClientRect();
        const x = boundingRect.left + boundingRect.width / 2;
        const y = boundingRect.top + boundingRect.height / 2;
        return {
            x,
            y
        };
    }

    getSides() {
        const boundingRect = this._table.getBoundingClientRect();
        return {
            right: {
                p1: {
                    x: boundingRect.right / this._designer.getZoom() + this._designer.getPan().x,
                    y: boundingRect.top / this._designer.getZoom() + this._designer.getPan().y
                },
                p2: {
                    x: boundingRect.right / this._designer.getZoom() + this._designer.getPan().x,
                    y: boundingRect.bottom / this._designer.getZoom() + this._designer.getPan().y
                }
            },
            left: {
                p1: {
                    x: boundingRect.left / this._designer.getZoom() + this._designer.getPan().x,
                    y: boundingRect.top / this._designer.getZoom() + this._designer.getPan().y
                },
                p2: {
                    x: boundingRect.left / this._designer.getZoom() + this._designer.getPan().x,
                    y: boundingRect.bottom / this._designer.getZoom() + this._designer.getPan().y
                }
            },
            top: {
                p1: {
                    x: boundingRect.left / this._designer.getZoom() + this._designer.getPan().x,
                    y: boundingRect.top / this._designer.getZoom() + this._designer.getPan().y
                },
                p2: {
                    x: boundingRect.right / this._designer.getZoom() + this._designer.getPan().x,
                    y: boundingRect.top / this._designer.getZoom() + this._designer.getPan().y
                }
            },
            bottom: {
                p1: {
                    x: boundingRect.left / this._designer.getZoom() + this._designer.getPan().x,
                    y: boundingRect.bottom / this._designer.getZoom() + this._designer.getPan().y
                },
                p2: {
                    x: boundingRect.right / this._designer.getZoom() + this._designer.getPan().x,
                    y: boundingRect.bottom / this._designer.getZoom() + this._designer.getPan().y
                }
            }
        };
    }

    render() {
        this._elem = document.createElementNS(constant.nsSvg, 'foreignObject');
        this._elem.setAttributeNS(null, 'transform', `translate(${this._pos.x},${this._pos.y})`);

        this._table = document.createElementNS(constant.nsHtml, 'table');
        this._table.className = 'table';
        const headingTr = document.createElementNS(constant.nsHtml, 'tr');
        this._table.appendChild(headingTr);
        const headingTh = document.createElementNS(constant.nsHtml, 'th');
        headingTh.setAttributeNS(null, 'colspan', 2);
        headingTh.innerHTML = this._name;
        headingTr.appendChild(headingTh);

        this._elem.appendChild(this._table);

        this.columns.forEach(column => {
            const columnTr = document.createElementNS(constant.nsHtml, 'tr');
            this._table.appendChild(columnTr);

            const columnNameTd = document.createElementNS(constant.nsHtml, 'td');
            columnNameTd.innerHTML = column.name;
            columnTr.appendChild(columnNameTd);

            const columnTypeTd = document.createElementNS(constant.nsHtml, 'td');
            columnTypeTd.innerHTML = column.type;
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
}