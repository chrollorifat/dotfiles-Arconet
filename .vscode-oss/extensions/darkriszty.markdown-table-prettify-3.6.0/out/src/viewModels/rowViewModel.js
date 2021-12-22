"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RowViewModel = void 0;
class RowViewModel {
    constructor(_values, _eol) {
        this._values = _values;
        this._eol = _eol;
    }
    get columnCount() { return this._values.length; }
    get EOL() { return this._eol; }
    getValueAt(index) {
        const maxIndex = this._values.length - 1;
        if (index < 0 || index > maxIndex)
            throw new Error(`Argument out of range; should be between 0 and ${maxIndex}, but was ${index}.`);
        return this._values[index];
    }
}
exports.RowViewModel = RowViewModel;
//# sourceMappingURL=rowViewModel.js.map