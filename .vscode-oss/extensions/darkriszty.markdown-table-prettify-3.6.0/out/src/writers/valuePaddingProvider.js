"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValuePaddingProvider = void 0;
class ValuePaddingProvider {
    constructor(columnPadding) {
        if (columnPadding < 0)
            throw new Error("Column padding must be greater than or equal to 0!");
        this._columnPad = " ".repeat(columnPadding);
    }
    getLeftPadding() {
        return this._columnPad;
    }
    getRightPadding(table, currentColumn) {
        return currentColumn != table.columnCount - 1
            ? this._columnPad
            : table.hasRightBorder
                ? this._columnPad
                : "";
    }
}
exports.ValuePaddingProvider = ValuePaddingProvider;
//# sourceMappingURL=valuePaddingProvider.js.map