const nsSvg = 'http://www.w3.org/2000/svg';
const nsHtml = 'http://www.w3.org/1999/xhtml';

export default class Table {
    constructor(name, columns = []) {
        this.columns = columns;
        this._name = name;
    }

    _moveEvents() {
        let mouseDownInitialElemX, mouseDownInitialElemY;

        const mouseMove = event => {
            event.stopPropagation();
            const deltaX = event.clientX / this._designer.getZoom() + this._designer.getPan().x - mouseDownInitialElemX;
            const deltaY = event.clientY / this._designer.getZoom() + this._designer.getPan().y - mouseDownInitialElemY;
            this._elem.setAttributeNS(null, 'transform', `translate(${deltaX},${deltaY})`);
        };

        this._table.addEventListener('mousedown', event => {
            event.stopPropagation();
            const boundingRect = this._elem.getBoundingClientRect();
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

    getCenter() {
        const boundingRect = this._elem.getBoundingClientRect();
        const x = boundingRect.left + boundingRect.width / 2;
        const y = boundingRect.top + boundingRect.height / 2;
        return {
            x,
            y
        };
    }

    getSides() {
        const boundingRect = this._elem.getBoundingClientRect();
        return {
            right: {
                p1: { x: boundingRect.right, y: boundingRect.top },
                p2: { x: boundingRect.right, y: boundingRect.bottom }
            },
            left: {
                p1: { x: boundingRect.left, y: boundingRect.top },
                p2: { x: boundingRect.left, y: boundingRect.bottom }
            },
            top: {
                p1: { x: boundingRect.left, y: boundingRect.top },
                p2: { x: boundingRect.right, y: boundingRect.top }
            },
            bottom: {
                p1: { x: boundingRect.left, y: boundingRect.bottom },
                p2: { x: boundingRect.right, y: boundingRect.bottom }
            }
        };
    }

    getRightSide() {
        const boundingRect = this._elem.getBoundingClientRect();
        return { p1x: boundingRect.right, p1y: boundingRect.top, p2x: boundingRect.right, p2y: boundingRect.bottom };
    }

    getLeftSide() {
        const boundingRect = this._elem.getBoundingClientRect();
        return { p1x: boundingRect.left, p1y: boundingRect.top, p2x: boundingRect.left, p2y: boundingRect.bottom };
    }

    getTopSide() {
        const boundingRect = this._elem.getBoundingClientRect();
        return { p1x: boundingRect.left, p1y: boundingRect.top, p2x: boundingRect.right, p2y: boundingRect.top };
    }

    getBottomSide() {
        const boundingRect = this._elem.getBoundingClientRect();
        return { p1x: boundingRect.left, p1y: boundingRect.bottom, p2x: boundingRect.right, p2y: boundingRect.bottom };
    }

    render() {
        const x = 0,
            y = 0;
        this._elem = document.createElementNS(nsSvg, 'foreignObject');
        this._elem.setAttributeNS(null, 'x', x);
        this._elem.setAttributeNS(null, 'y', y);

        this._table = document.createElementNS(nsHtml, 'table');
        this._table.className = 'table';
        const headingTr = document.createElementNS(nsHtml, 'tr');
        this._table.appendChild(headingTr);
        const headingTh = document.createElementNS(nsHtml, 'th');
        headingTh.setAttributeNS(null, 'colspan', 2);
        headingTh.innerHTML = this._name;
        headingTr.appendChild(headingTh);

        this._elem.appendChild(this._table);

        this.columns.forEach(column => {
            const columnTr = document.createElementNS(nsHtml, 'tr');
            this._table.appendChild(columnTr);

            const columnNameTd = document.createElementNS(nsHtml, 'td');
            columnNameTd.innerHTML = column.name;
            columnTr.appendChild(columnNameTd);

            const columnTypeTd = document.createElementNS(nsHtml, 'td');
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