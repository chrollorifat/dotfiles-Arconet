"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TableFactory = void 0;
const table_1 = require("../models/table");
const cell_1 = require("../models/cell");
const row_1 = require("../models/row");
class TableFactory {
    constructor(_alignmentFactory, _selectionInterpreter, _transformer, _tableIndentationDetector) {
        this._alignmentFactory = _alignmentFactory;
        this._selectionInterpreter = _selectionInterpreter;
        this._transformer = _transformer;
        this._tableIndentationDetector = _tableIndentationDetector;
    }
    getModel(document, range) {
        const lines = document.getLines(range);
        if (lines == null || lines.length == 0)
            throw new Error("Can't create table model from no lines.");
        const rowsWithoutSeparator = lines
            .filter((_, i) => i != 1)
            .map(line => new row_1.Row(this._selectionInterpreter
            .splitLine(line.value)
            .map(c => new cell_1.Cell(c)), line.EOL));
        const separatorLine = lines[1];
        const separator = this._selectionInterpreter.splitLine(separatorLine.value);
        const alignments = separator != null && separator.length > 0
            ? this._alignmentFactory.createAlignments(separator)
            : [];
        const leftPad = this._tableIndentationDetector.getLeftPad(lines.map(l => l.value));
        return this._transformer.process(new table_1.Table(rowsWithoutSeparator, separatorLine.EOL, alignments, leftPad));
    }
}
exports.TableFactory = TableFactory;
//# sourceMappingURL=tableFactory.js.map