"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MultiTablePrettyfier = void 0;
const document_1 = require("../models/doc/document");
class MultiTablePrettyfier {
    constructor(_tableFinder, _singleTablePrettyfier, _sizeLimitChecker) {
        this._tableFinder = _tableFinder;
        this._singleTablePrettyfier = _singleTablePrettyfier;
        this._sizeLimitChecker = _sizeLimitChecker;
    }
    formatTables(input) {
        if (!this._sizeLimitChecker.isWithinAllowedSizeLimit(input)) {
            return input;
        }
        let document = new document_1.Document(input);
        let tableRange = null;
        let tableSearchStartLine = 0;
        while ((tableRange = this._tableFinder.getNextRange(document, tableSearchStartLine)) != null) {
            const formattedTable = this._singleTablePrettyfier.prettifyTable(document, tableRange);
            document.replaceTextInRange(tableRange, formattedTable);
            tableSearchStartLine = tableRange.endLine + 1;
        }
        return document.getText();
    }
}
exports.MultiTablePrettyfier = MultiTablePrettyfier;
//# sourceMappingURL=multiTablePrettyfier.js.map