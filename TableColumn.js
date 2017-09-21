const ns = 'http://www.w3.org/2000/svg';

export default class TableColumn {
    constructor(name, type) {
        this._name = name;
        this._type = type;
    }

    setName(name) {
        this._name = name;
    }

    setType(type) {
        this._type = type;
    }

    postDraw() {
        
    }

    render() {
        this._elem = document.createElementNS(ns, 'g');
        this._elem.setAttributeNS(null, 'class', 'columnGroup');
        
        this._topLine = document.createElementNS(ns, 'line');
        this._topLine.setAttributeNS(null, 'x1', 0);
        this._elem.appendChild(this._topLine);

        this._bottomLine = document.createElementNS(ns, 'line');
        this._bottomLine.setAttributeNS(null, 'x1', 0);
        this._elem.appendChild(this._bottomLine);

        this._nameElem = document.createElementNS(ns, 'text');
        this._nameElem.innerHTML = this._name;
        this._elem.appendChild(this._nameElem);

        this._typeElem = document.createElementNS(ns, 'text');
        this._typeElem.innerHTML = this._type;
        this._elem.appendChild(this._typeElem);

        return this._elem;
    }
}