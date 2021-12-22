"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TableStringWriter = void 0;
class TableStringWriter {
    constructor(_valuePaddingProvider) {
        this._valuePaddingProvider = _valuePaddingProvider;
    }
    writeTable(table) {
        if (table == null)
            throw new Error("Table can't be null.");
        if (table.header == null)
            throw new Error("Table must have a header.");
        if (table.separator == null)
            throw new Error("Table must have a separator.");
        if (table.rows == null || table.rowCount == 0)
            throw new Error("Table must have rows.");
        let buffer = "";
        buffer += this.writeRowViewModel(table.header, table, true);
        buffer += this.writeRowViewModel(table.separator, table, true);
        buffer += this.writeRows(table);
        return buffer;
    }
    writeRows(table) {
        let buffer = "";
        for (let row = 0; row < table.rowCount; row++) {
            buffer += this.writeRowViewModel(table.rows[row], table, row != table.rowCount - 1);
        }
        return buffer;
    }
    writeRowViewModel(row, table, addEndOfLine) {
        let buffer = "";
        buffer += table.leftPad;
        buffer += this.getLeftBorderIfNeeded(table);
        for (let col = 0; col < table.columnCount; col++) {
            buffer += this._valuePaddingProvider.getLeftPadding();
            buffer += row.getValueAt(col);
            buffer += this._valuePaddingProvider.getRightPadding(table, col);
            buffer += this.getSeparatorIfNeeded(table, col);
        }
        buffer += this.getRightBorderIfNeeded(table);
        if (addEndOfLine)
            buffer += row.EOL;
        return buffer;
    }
    getSeparatorIfNeeded(table, currentColumn) {
        return currentColumn != table.columnCount - 1 ? "|" : "";
    }
    getLeftBorderIfNeeded(table) {
        return table.hasLeftBorder ? "|" : "";
    }
    getRightBorderIfNeeded(table) {
        return table.hasRightBorder ? "|" : "";
    }
}
exports.TableStringWriter = TableStringWriter;
//# sourceMappingURL=tableStringWriter.js.map