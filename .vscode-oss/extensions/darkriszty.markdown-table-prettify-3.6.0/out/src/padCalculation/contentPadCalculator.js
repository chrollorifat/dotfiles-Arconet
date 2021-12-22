"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentPadCalculator = void 0;
class ContentPadCalculator {
    constructor(_padCalculatorSelector, _paddingChar) {
        this._padCalculatorSelector = _padCalculatorSelector;
        this._paddingChar = _paddingChar;
    }
    getLeftPadding(table, row, column) {
        return this._padCalculatorSelector.select(table, column).getLeftPadding(this._paddingChar, table, row, column);
    }
    getRightPadding(table, row, column) {
        return this._padCalculatorSelector.select(table, column).getRightPadding(this._paddingChar, table, row, column);
    }
    getPadChar() {
        return this._paddingChar;
    }
}
exports.ContentPadCalculator = ContentPadCalculator;
//# sourceMappingURL=contentPadCalculator.js.map