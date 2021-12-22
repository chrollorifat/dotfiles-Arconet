"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TableViewModel = void 0;
class TableViewModel {
    constructor() {
        this.leftPad = "";
        this.rows = [];
    }
    get columnCount() { return this.header.columnCount; }
    get rowCount() { return this.rows.length; }
}
exports.TableViewModel = TableViewModel;
//# sourceMappingURL=tableViewModel.js.map