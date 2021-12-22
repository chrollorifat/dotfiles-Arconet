"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BorderTransformer = void 0;
const transformer_1 = require("./transformer");
const table_1 = require("../../models/table");
class BorderTransformer extends transformer_1.Transformer {
    transform(input) {
        if (input == null || input.isEmpty())
            return input;
        const hasLeftBorder = this.isColumnEmpty(input.rows, 0);
        const hasRightBorder = this.isColumnEmpty(input.rows, input.columnCount - 1);
        const rows = this.rowsWithoutEmptyFirstAndLastColumn(input.rows, hasLeftBorder, hasRightBorder);
        const alignments = this.alignmentsWithoutEmptyFirstAndLastColumn(input.alignments, hasLeftBorder, hasRightBorder);
        const leftPad = hasLeftBorder
            ? input.leftPad
            : "";
        let result = new table_1.Table(rows, input.separatorEOL, alignments, leftPad);
        result.hasLeftBorder = hasLeftBorder;
        result.hasRightBorder = this.hasRightBorder(hasLeftBorder, hasRightBorder);
        return result;
    }
    isColumnEmpty(rows, column) {
        for (let row = 0; row < rows.length; row++) {
            const value = rows[row].cells[column];
            if (value != null && value.getValue().trim() != "")
                return false;
        }
        return true;
    }
    rowsWithoutEmptyFirstAndLastColumn(rows, hasLeftBorder, hasRightBorder) {
        let newRows = rows;
        if (hasLeftBorder)
            this.removeColumn(newRows, 0);
        if (hasRightBorder)
            this.removeColumn(newRows, newRows[0].cells.length - 1);
        return newRows;
    }
    removeColumn(rows, column) {
        for (let row = 0; row < rows.length; row++)
            rows[row].cells.splice(column, 1);
    }
    alignmentsWithoutEmptyFirstAndLastColumn(alignments, hasLeftBorder, hasRightBorder) {
        let newAlignments = alignments;
        if (hasLeftBorder)
            newAlignments.shift();
        if (hasRightBorder)
            newAlignments.pop();
        return newAlignments;
    }
    hasRightBorder(hadLeftBorder, hadRightBorder) {
        let result = hadRightBorder;
        if (hadLeftBorder && !hadRightBorder)
            result = true;
        if (!hadLeftBorder && hadRightBorder)
            result = false;
        return result;
    }
}
exports.BorderTransformer = BorderTransformer;
//# sourceMappingURL=borderTransformer.js.map