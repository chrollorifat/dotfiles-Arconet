"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LastColumnPadCalculator = void 0;
const rightPadCalculator_1 = require("./rightPadCalculator");
class LastColumnPadCalculator extends rightPadCalculator_1.RightPadCalculator {
    getRightPadding(paddingChar, table, row, column) {
        return table.hasLeftBorder ? super.getRightPadding(paddingChar, table, row, column) : "";
    }
}
exports.LastColumnPadCalculator = LastColumnPadCalculator;
//# sourceMappingURL=lastColumnPadCalculator.js.map