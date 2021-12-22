"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TableViewModelFactory = void 0;
const tableViewModel_1 = require("../viewModels/tableViewModel");
class TableViewModelFactory {
    constructor(_rowViewModelFactory) {
        this._rowViewModelFactory = _rowViewModelFactory;
    }
    build(tableWithoutSeparator) {
        let result = new tableViewModel_1.TableViewModel();
        result.leftPad = tableWithoutSeparator.leftPad;
        result.hasLeftBorder = tableWithoutSeparator.hasLeftBorder;
        result.hasRightBorder = tableWithoutSeparator.hasRightBorder;
        result.header = this._rowViewModelFactory.buildRow(0, tableWithoutSeparator);
        result.rows = this.buildRows(tableWithoutSeparator);
        result.separator = this.buildSeparator(result, tableWithoutSeparator);
        return result;
    }
    buildRows(table) {
        let result = new Array(table.rowCount - 1);
        for (let row = 1; row < table.rowCount; row++)
            result[row - 1] = this._rowViewModelFactory.buildRow(row, table);
        return result;
    }
    buildSeparator(tableVm, table) {
        let rowsForSeparatorCalculation = new Array();
        rowsForSeparatorCalculation.push(tableVm.header);
        for (let r of tableVm.rows) {
            rowsForSeparatorCalculation.push(r);
        }
        return this._rowViewModelFactory.buildSeparator(rowsForSeparatorCalculation, table);
    }
}
exports.TableViewModelFactory = TableViewModelFactory;
//# sourceMappingURL=tableViewModelFactory.js.map