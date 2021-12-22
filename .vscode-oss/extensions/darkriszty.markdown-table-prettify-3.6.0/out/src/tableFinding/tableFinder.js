"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TableFinder = void 0;
const range_1 = require("../models/doc/range");
class TableFinder {
    constructor(_tableValidator) {
        this._tableValidator = _tableValidator;
        this._ignoreStart = "<!-- markdown-table-prettify-ignore-start -->";
        this._ignoreEnd = "<!-- markdown-table-prettify-ignore-end -->";
    }
    getNextRange(document, startLine) {
        // look for the separator row, assume table starts 1 row before & ends when invalid
        let rowIndex = startLine;
        let isInIgnoreBlock = false;
        while (rowIndex < document.lines.length) {
            if (document.lines[rowIndex].value.trim() == this._ignoreStart) {
                isInIgnoreBlock = true;
            }
            else if (document.lines[rowIndex].value.trim() == this._ignoreEnd) {
                isInIgnoreBlock = false;
            }
            if (!isInIgnoreBlock) {
                const isValidSeparatorRow = this._tableValidator.lineIsValidSeparator(document.lines[rowIndex].value);
                const nextRangeResult = isValidSeparatorRow
                    ? this.getNextValidTableRange(document, rowIndex)
                    : { range: null, ignoreBlockStarted: isInIgnoreBlock };
                isInIgnoreBlock = nextRangeResult.ignoreBlockStarted;
                if (nextRangeResult.range != null) {
                    return nextRangeResult.range;
                }
            }
            rowIndex++;
        }
        return null;
    }
    getNextValidTableRange(document, separatorRowIndex) {
        let firstTableFileRow = separatorRowIndex - 1;
        let lastTableFileRow = separatorRowIndex + 1;
        let selection = null;
        let ignoreBlockedStarted = false;
        while (lastTableFileRow < document.lines.length) {
            // when the ignore-start is in the middle of a possible table don't go further
            if (document.lines[lastTableFileRow].value.trim() == this._ignoreStart) {
                ignoreBlockedStarted = true;
                break;
            }
            const newSelection = document.getText(new range_1.Range(firstTableFileRow, lastTableFileRow));
            const tableValid = this._tableValidator.isValid(newSelection);
            if (tableValid) {
                selection = newSelection;
                lastTableFileRow++;
            }
            else {
                break;
            }
        }
        // return the row to the last valid try
        return {
            range: selection != null ? new range_1.Range(firstTableFileRow, lastTableFileRow - 1) : null,
            ignoreBlockStarted: ignoreBlockedStarted
        };
    }
}
exports.TableFinder = TableFinder;
//# sourceMappingURL=tableFinder.js.map