"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PadCalculatorSelector = void 0;
const LeftAlignment = require("./left");
const RightAlignment = require("./right");
const CenterAlignment = require("./center");
const alignment_1 = require("../models/alignment");
class PadCalculatorSelector {
    select(table, column) {
        switch (table.alignments[column]) {
            case alignment_1.Alignment.Center: return this.centerAlignmentPadCalculator(table, column);
            case alignment_1.Alignment.Right: return this.rightAlignmentPadCalculator(table, column);
            default: return this.leftAlignmentPadCalculator(table, column);
        }
    }
    leftAlignmentPadCalculator(table, column) {
        if (column == 0)
            return new LeftAlignment.FirstColumnPadCalculator();
        if (column == table.columnCount - 1)
            return new LeftAlignment.LastColumnPadCalculator();
        return new LeftAlignment.MiddleColumnPadCalculator();
    }
    centerAlignmentPadCalculator(table, column) {
        if (column == 0)
            return new CenterAlignment.FirstColumnPadCalculator();
        if (column == table.columnCount - 1)
            return new CenterAlignment.LastColumnPadCalculator();
        return new CenterAlignment.MiddleColumnPadCalculator();
    }
    rightAlignmentPadCalculator(table, column) {
        if (column == 0)
            return new RightAlignment.FirstColumnPadCalculator();
        if (column == table.columnCount - 1)
            return new RightAlignment.LastColumnPadCalculator();
        return new RightAlignment.MiddleColumnPadCalculator();
    }
}
exports.PadCalculatorSelector = PadCalculatorSelector;
//# sourceMappingURL=padCalculatorSelector.js.map