const nsSvg = 'http://www.w3.org/2000/svg';
const nsHtml = 'http://www.w3.org/1999/xhtml';

export default class Table {
    constructor(name, columns = []) {
        this._columns = columns;
        this._name = name;
    }

    _moveEvents() {
        let mouseDownInitialElemX, mouseDownInitialElemY;

        function mouseMove(event) {
            event.stopPropagation();
            const deltaX = (event.clientX / this._designer.getZoom()) - mouseDownInitialElemX;
            const deltaY = (event.clientY / this._designer.getZoom()) - mouseDownInitialElemY;
            this._elem.setAttributeNS(null, 'transform', `translate(${deltaX},${deltaY})`);
        }

        mouseMove = mouseMove.bind(this);
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
        this._columns.push(column);
    }

    getPosition() {
        const boundingRect = this._elem.getBoundingClientRect();
        const centerX = boundingRect.left + boundingRect.width / 2;
        const centerY = boundingRect.top + boundingRect.height / 2;
        return {
            centerX,
            centerY
        };
    }

    // getRightSide() {
    //     const boundingRect = this._elem.getBoundingClientRect();
    //     return {boundingRect.left};
    // }

    isIntersecting(l1p1, l1p2, l2p1, l2p2) {
        const deltaXL1 = l1p1.x - l1p2.x;
        const deltaXL2 = l2p1.x - l2p2.x;

        if (deltaXL1 === 0 && deltaXL2 === 0) {
            // Parallel both horizontal
            return null;
        }

        if (deltaXL1 === 0) {
            const deltaYL2 = l2p1.y - l2p2.y;
            const m2 = deltaYL2 / deltaXL2;
            const b2 = m1 * l2p1.x - l2p1.y;

            const intersectY = m2 * l1p1.x + b2;

            return {
                y: intersectY,
                x: l1p1.x
            };
        }
        const deltaYL1 = l1p1.y - l1p2.y;
        const m1 = deltaYL1 / deltaXL1;
        const b1 = m1 * l1p1.x - l1p1.y;

        if (deltaXL2 === 0) {
            const intersectY = m1 * l2p1.x + b1;
            return {
                y: intersectY,
                x: l2p1.x
            };
        }
        const deltaYL2 = l2p1.y - l2p2.y;
        const m2 = deltaYL2 / deltaXL2;

        // Parallel
        if (m1 === m2) return null;

        const b2 = m1 * l2p1.x - l2p1.y;
        const intersectY = m1 * l2p1.x + b1;

    }

    drawRelations() {
        this._columns.forEach(column => {
            if (column.ref) {
                column.ref.table.getPosition();
                this.getPosition();
            }
        })
        const boundingRect = this._elem.getBoundingClientRect();
        boundingRect.left;
        boundingRect.top;
    }

    postDraw() {

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

        this._columns.forEach(column => {
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
}