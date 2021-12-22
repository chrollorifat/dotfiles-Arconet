"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FirstColumnPadCalculator = void 0;
const basePadCalculator_1 = require("../basePadCalculator");
class FirstColumnPadCalculator extends basePadCalculator_1.BasePadCalculator {
    getLeftPadding(paddingChar, table, row, column) {
        return table.hasLeftBorder ? paddingChar : "";
    }
    getRightPadding(paddingChar, table, row, column) {
        return super.baseGetRightPadding(paddingChar, table, row, column);
    }
}
exports.FirstColumnPadCalculator = FirstColumnPadCalculator;
//# sourceMappingURL=firstColumnPadCalculator.js.map