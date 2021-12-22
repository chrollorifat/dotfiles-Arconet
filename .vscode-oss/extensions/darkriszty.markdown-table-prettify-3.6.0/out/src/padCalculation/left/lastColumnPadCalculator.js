"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LastColumnPadCalculator = void 0;
const basePadCalculator_1 = require("../basePadCalculator");
class LastColumnPadCalculator extends basePadCalculator_1.BasePadCalculator {
    getLeftPadding(paddingChar, table, row, column) {
        return (table.rows[row].cells[column].getValue() == "" && !table.hasRightBorder) ? "" : paddingChar;
    }
    getRightPadding(paddingChar, table, row, column) {
        if (!table.hasRightBorder)
            return "";
        return super.baseGetRightPadding(paddingChar, table, row, column);
    }
}
exports.LastColumnPadCalculator = LastColumnPadCalculator;
//# sourceMappingURL=lastColumnPadCalculator.js.map