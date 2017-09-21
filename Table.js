const ns = 'http://www.w3.org/2000/svg';

export default class Table {
    constructor(name, columns = []) {
        this._columns = columns;
        this._name = name;
    }

    _moveEvents() {
        let mouseDownInitialElemX, mouseDownInitialElemY;

        function mouseMove(event) {
            const deltaX = event.clientX - mouseDownInitialElemX;
            const deltaY = event.clientY - mouseDownInitialElemY;
            this._elem.setAttributeNS(null, 'transform', `translate(${deltaX},${deltaY})`);
        }

        mouseMove = mouseMove.bind(this);
        this._elem.addEventListener('mousedown', event => {
            const boundingRect = this._elem.getBoundingClientRect();
            mouseDownInitialElemX = event.clientX - boundingRect.left;
            mouseDownInitialElemY = event.clientY - boundingRect.top;

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

    postDraw() {
        const textOffsetTopBottom = 10;
        const bBox = this._nameElem.getBBox();
        const textHeight = bBox.height;
        const textWidth = bBox.width;
        this._nameElem.setAttributeNS(null, 'y', textOffsetTopBottom + textHeight / 1.5);

        const titleHeight = textHeight + textOffsetTopBottom * 2;
        this._titleLine.setAttributeNS(null, 'y1', titleHeight);
        this._titleLine.setAttributeNS(null, 'y2', titleHeight);

        const tableOffsetLeftRight = 20;
        let width = this._nameElem.getComputedTextLength() + tableOffsetLeftRight * 2;
        const MIN_WIDTH_SIZE = 100;
        if (width < MIN_WIDTH_SIZE) {
            width = MIN_WIDTH_SIZE;
            this._nameElem.setAttributeNS(null, 'x', (MIN_WIDTH_SIZE - textWidth) / 2);
        } else {
            this._nameElem.setAttributeNS(null, 'x', tableOffsetLeftRight);
        }
        this._table.setAttributeNS(null, 'width', width);
        this._titleLine.setAttributeNS(null, 'x2', width);

        this._elem.appendChild(this._titleLine);

        let columnHeight = 0;

        this._columns.forEach(column => column.postDraw());        

        this._table.setAttributeNS(null, 'height', titleHeight + columnHeight * this._columns.length);
    }

    render() {
        const x = 0,
            y = 0;

        this._elem = document.createElementNS(ns, 'g');
        this._elem.setAttributeNS(null, 'class', 'tableGroup');
        this._elem.setAttributeNS(null, 'transform', `translate(${x},${y})`);

        this._table = document.createElementNS(ns, 'rect');
        this._table.setAttributeNS(null, 'class', 'table');
        this._elem.appendChild(this._table);

        this._titleLine = document.createElementNS(ns, 'line');
        this._titleLine.setAttributeNS(null, 'x1', 0);

        this._nameElem = document.createElementNS(ns, 'text');
        this._nameElem.innerHTML = this._name;
        this._nameElem.setAttributeNS(null, 'class', 'tableName');
        this._elem.appendChild(this._nameElem);

        
        this._moveEvents();

        for (const column of this._columns) {
            this._table.appendChild(column.render());
        }    
        return this._elem;
    }
}