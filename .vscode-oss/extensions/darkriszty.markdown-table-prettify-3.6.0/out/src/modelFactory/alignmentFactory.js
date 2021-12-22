"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlignmentFactory = void 0;
const alignment_1 = require("../models/alignment");
class AlignmentFactory {
    createAlignments(cells) {
        return cells.map(cell => this.alignmentOf(cell.trim()));
    }
    alignmentOf(cell) {
        const left = cell[0] == ":";
        const right = cell[cell.length - 1] == ":";
        if (left && right)
            return alignment_1.Alignment.Center;
        if (right)
            return alignment_1.Alignment.Right;
        if (left)
            return alignment_1.Alignment.Left;
        return alignment_1.Alignment.NotSet;
    }
}
exports.AlignmentFactory = AlignmentFactory;
//# sourceMappingURL=alignmentFactory.js.map