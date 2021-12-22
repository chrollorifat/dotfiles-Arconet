"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SelectionBasedLogToogler = void 0;
const vscode = require("vscode");
class SelectionBasedLogToogler {
    constructor(_document, _range) {
        this._document = _document;
        this._range = _range;
    }
    toogleLoggers(loggers) {
        const logEnabled = !this._isWholeDocumentFormatting();
        for (const logger of loggers) {
            logger.setEnabled(logEnabled);
        }
    }
    _isWholeDocumentFormatting() {
        if (this._document.lineCount < 1)
            return true;
        const zeroPosition = new vscode.Position(0, 0);
        const documentEndPosition = this._document.lineAt(this._document.lineCount - 1).range.end;
        if (this._range.start.isEqual(zeroPosition) && this._range.end.isEqual(documentEndPosition))
            return true;
        return false;
    }
}
exports.SelectionBasedLogToogler = SelectionBasedLogToogler;
//# sourceMappingURL=selectionBasedLogToogler.js.map