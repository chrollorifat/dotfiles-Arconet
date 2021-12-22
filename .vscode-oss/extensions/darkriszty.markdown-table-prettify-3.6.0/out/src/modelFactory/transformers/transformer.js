"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Transformer = void 0;
class Transformer {
    constructor(_next) {
        this._next = _next;
    }
    process(input) {
        //Note: consider dropping the transformers and moving all table related logic inside the factory.
        if (input == null || input.isEmpty())
            return input;
        let table = this.transform(input);
        if (this._next != null)
            table = this._next.process(table);
        return table;
    }
}
exports.Transformer = Transformer;
//# sourceMappingURL=transformer.js.map