"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LastColumnPadCalculator = void 0;
const centerPadCalculator_1 = require("./centerPadCalculator");
class LastColumnPadCalculator extends centerPadCalculator_1.CenterPadCalculator {
    getRightPadding(paddingChar, table, row, column) {
        if (!table.hasRightBorder)
            return "";
        return super.getRightPadding(paddingChar, table, row, column);
    }
}
exports.LastColumnPadCalculator = LastColumnPadCalculator;
//# sourceMappingURL=lastColumnPadCalculator.js.map