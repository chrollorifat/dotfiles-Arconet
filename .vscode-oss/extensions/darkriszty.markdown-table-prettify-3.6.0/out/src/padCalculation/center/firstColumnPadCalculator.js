"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FirstColumnPadCalculator = void 0;
const centerPadCalculator_1 = require("./centerPadCalculator");
class FirstColumnPadCalculator extends centerPadCalculator_1.CenterPadCalculator {
    extraPadCount(table) {
        return table.hasLeftBorder ? 2 : 1;
    }
}
exports.FirstColumnPadCalculator = FirstColumnPadCalculator;
//# sourceMappingURL=firstColumnPadCalculator.js.map