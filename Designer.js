const ns = 'http://www.w3.org/2000/svg';

export default class Designer {
    constructor(tables = []) {
        this._elem = document.getElementById('designer');
        this.tables = tables;
        this.draw();
    }

    addTable(table) {
        this.tables.push(table);
        drawTable();
    }

    draw() {
        this.tables.forEach(table => {
            const tableElm = table.render();
            this._elem.appendChild(tableElm);
        });

        //After draw happened
        setTimeout(() => {
            this.tables.forEach(table => table.postDraw());
        });
    }
}