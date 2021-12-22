"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MiddleColumnPadCalculator = void 0;
const basePadCalculator_1 = require("../basePadCalculator");
class MiddleColumnPadCalculator extends basePadCalculator_1.BasePadCalculator {
    getLeftPadding(paddingChar, table, row, column) {
        return paddingChar;
    }
    getRightPadding(paddingChar, table, row, column) {
        return super.baseGetRightPadding(paddingChar, table, row, column);
    }
}
exports.MiddleColumnPadCalculator = MiddleColumnPadCalculator;
//# sourceMappingURL=middleColumnPadCalculator.js.map