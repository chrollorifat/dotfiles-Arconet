"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RightPadCalculator = void 0;
const basePadCalculator_1 = require("../basePadCalculator");
class RightPadCalculator extends basePadCalculator_1.BasePadCalculator {
    getLeftPadding(paddingChar, table, row, column) {
        return paddingChar.repeat(this.getLeftPaddingCount(table, row, column));
    }
    getRightPadding(paddingChar, table, row, column) {
        return paddingChar;
    }
    getLeftPaddingCount(table, row, column) {
        let longestColumnLength = table.getLongestColumnLengths()[column];
        let leftPadCount = longestColumnLength > 0
            ? longestColumnLength - table.rows[row].cells[column].getLength()
            : 1;
        leftPadCount += this.extraPadCount(table);
        return leftPadCount;
    }
    extraPadCount(table) {
        return 1;
    }
    ;
}
exports.RightPadCalculator = RightPadCalculator;
//# sourceMappingURL=rightPadCalculator.js.map