"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Range = void 0;
class Range {
    constructor(_startLine, _endLine) {
        this._startLine = _startLine;
        this._endLine = _endLine;
    }
    get startLine() {
        return this._startLine;
    }
    get endLine() {
        return this._endLine;
    }
}
exports.Range = Range;
//# sourceMappingURL=range.js.map