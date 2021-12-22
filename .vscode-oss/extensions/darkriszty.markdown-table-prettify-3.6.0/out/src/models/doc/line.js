"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Line = void 0;
class Line {
    constructor(value) {
        this._value = value.replace(/\r?\n|\r/g, "");
        this._eol = value.substr(this._value.length);
    }
    get value() {
        return this._value;
    }
    get EOL() {
        return this._eol;
    }
    set EOL(value) {
        this._eol = value;
    }
}
exports.Line = Line;
//# sourceMappingURL=line.js.map