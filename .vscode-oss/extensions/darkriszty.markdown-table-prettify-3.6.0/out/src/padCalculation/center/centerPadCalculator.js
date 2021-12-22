"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CenterPadCalculator = void 0;
const basePadCalculator_1 = require("../basePadCalculator");
class CenterPadCalculator extends basePadCalculator_1.BasePadCalculator {
    getLeftPadding(paddingChar, table, row, column) {
        return paddingChar.repeat(Math.floor(this.totalPadCount(table, column, row)));
    }
    getRightPadding(paddingChar, table, row, column) {
        return paddingChar.repeat(Math.ceil(this.totalPadCount(table, column, row)));
    }
    totalPadCount(table, column, row) {
        const longestColumnLength = table.getLongestColumnLengths()[column];
        let padCount = longestColumnLength > 0
            ? longestColumnLength - table.rows[row].cells[column].getLength()
            : 1;
        padCount += this.extraPadCount(table);
        return padCount / 2;
    }
    extraPadCount(table) {
        return 2;
    }
}
exports.CenterPadCalculator = CenterPadCalculator;
//# sourceMappingURL=centerPadCalculator.js.map