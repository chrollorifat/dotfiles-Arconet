"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TableDocumentPrettyfierCommand = void 0;
const vscode = require("vscode");
class TableDocumentPrettyfierCommand {
    constructor(_multiTablePrettyfier) {
        this._multiTablePrettyfier = _multiTablePrettyfier;
    }
    prettifyDocument(editor) {
        const formattedDocument = this._multiTablePrettyfier.formatTables(editor.document.getText());
        editor.edit(textEditorEdit => {
            textEditorEdit.replace(new vscode.Range(new vscode.Position(0, 0), new vscode.Position(editor.document.lineCount - 1, Number.MAX_SAFE_INTEGER)), formattedDocument);
        });
    }
}
exports.TableDocumentPrettyfierCommand = TableDocumentPrettyfierCommand;
//# sourceMappingURL=tableDocumentPrettyfierCommand.js.map