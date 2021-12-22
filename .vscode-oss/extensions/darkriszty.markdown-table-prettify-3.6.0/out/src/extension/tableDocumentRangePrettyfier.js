"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TableDocumentRangePrettyfier = void 0;
const vscode = require("vscode");
class TableDocumentRangePrettyfier {
    constructor(_multiTablePrettyfier) {
        this._multiTablePrettyfier = _multiTablePrettyfier;
    }
    provideDocumentRangeFormattingEdits(document, range, options, token) {
        const formattedSelection = this._multiTablePrettyfier.formatTables(document.getText(range));
        return formattedSelection != null
            ? [new vscode.TextEdit(range, formattedSelection)]
            : [];
    }
}
exports.TableDocumentRangePrettyfier = TableDocumentRangePrettyfier;
//# sourceMappingURL=tableDocumentRangePrettyfier.js.map