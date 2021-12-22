"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Row = void 0;
class Row {
    constructor(_cells, _eol) {
        this._cells = _cells;
        this._eol = _eol;
    }
    get cells() { return this._cells; }
    get EOL() { return this._eol; }
}
exports.Row = Row;
//# sourceMappingURL=row.js.map