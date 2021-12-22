"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TableDocumentPrettyfier = void 0;
const vscode = require("vscode");
class TableDocumentPrettyfier {
    constructor(_multiTablePrettyfier) {
        this._multiTablePrettyfier = _multiTablePrettyfier;
    }
    provideDocumentFormattingEdits(document, options, token) {
        const formattedDocument = this._multiTablePrettyfier.formatTables(document.getText());
        return [
            new vscode.TextEdit(new vscode.Range(new vscode.Position(0, 0), new vscode.Position(document.lineCount - 1, Number.MAX_SAFE_INTEGER)), formattedDocument)
        ];
    }
}
exports.TableDocumentPrettyfier = TableDocumentPrettyfier;
//# sourceMappingURL=tableDocumentPrettyfier.js.map