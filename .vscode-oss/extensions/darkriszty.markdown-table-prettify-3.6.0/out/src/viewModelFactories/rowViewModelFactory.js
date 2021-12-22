"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RowViewModelFactory = void 0;
const rowViewModel_1 = require("../viewModels/rowViewModel");
class RowViewModelFactory {
    constructor(_contentPadCalculator, _alignmentMarkerStrategy) {
        this._contentPadCalculator = _contentPadCalculator;
        this._alignmentMarkerStrategy = _alignmentMarkerStrategy;
        this.separatorChar = "-";
    }
    buildRow(row, table) {
        if (table == null)
            throw new Error("Paramter can't be null");
        let resultRow = new Array(table.columnCount);
        for (let col = 0; col < table.columnCount; col++) {
            resultRow[col] =
                this._contentPadCalculator.getLeftPadding(table, row, col) +
                    table.rows[row].cells[col].getValue() +
                    this._contentPadCalculator.getRightPadding(table, row, col);
        }
        return new rowViewModel_1.RowViewModel(resultRow, table.rows[row].EOL);
    }
    buildSeparator(rows, table) {
        const columnCount = rows[0].columnCount;
        let lengths = Array(columnCount).fill(0);
        for (const row of rows) {
            for (let i = 0; i < columnCount; i++) {
                lengths[i] = Math.max(lengths[i], (row.getValueAt(i).length));
            }
        }
        const values = lengths
            .map(l => this.separatorChar.repeat(l))
            .map((val, col) => this._alignmentMarkerStrategy.markerFor(table.alignments[col]).mark(val));
        return new rowViewModel_1.RowViewModel(values, table.separatorEOL);
    }
}
exports.RowViewModelFactory = RowViewModelFactory;
//# sourceMappingURL=rowViewModelFactory.js.map