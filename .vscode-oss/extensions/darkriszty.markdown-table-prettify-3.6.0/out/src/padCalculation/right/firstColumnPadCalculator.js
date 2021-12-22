"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FirstColumnPadCalculator = void 0;
const rightPadCalculator_1 = require("./rightPadCalculator");
class FirstColumnPadCalculator extends rightPadCalculator_1.RightPadCalculator {
    extraPadCount(table) {
        return table.hasLeftBorder ? 1 : 0;
    }
}
exports.FirstColumnPadCalculator = FirstColumnPadCalculator;
//# sourceMappingURL=firstColumnPadCalculator.js.map