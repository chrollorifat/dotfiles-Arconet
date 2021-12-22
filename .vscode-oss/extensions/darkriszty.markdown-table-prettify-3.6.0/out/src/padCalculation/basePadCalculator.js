"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BasePadCalculator = void 0;
class BasePadCalculator {
    baseGetRightPadding(paddingChar, table, row, column) {
        return paddingChar.repeat(this.getRightPadCount(table.getLongestColumnLengths()[column], table.rows[row].cells[column].getLength()));
    }
    getRightPadCount(longestColumnLength, cellTextLength) {
        let rightPadCount = longestColumnLength > 0
            ? longestColumnLength - cellTextLength
            : 1;
        if ((cellTextLength == 0) || (longestColumnLength > 0 && cellTextLength > 0))
            rightPadCount++;
        return rightPadCount;
    }
}
exports.BasePadCalculator = BasePadCalculator;
//# sourceMappingURL=basePadCalculator.js.map