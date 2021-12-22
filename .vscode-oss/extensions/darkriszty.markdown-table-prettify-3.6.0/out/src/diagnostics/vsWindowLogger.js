"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VsWindowLogger = void 0;
const vscode = require("vscode");
const baseLogger_1 = require("./baseLogger");
class VsWindowLogger extends baseLogger_1.BaseLogger {
    logInfo(message) {
        super.logIfEnabled(vscode.window.showInformationMessage, message);
    }
    logError(error) {
        const message = error instanceof Error
            ? error.message
            : error;
        super.logIfEnabled(vscode.window.showErrorMessage, message);
    }
}
exports.VsWindowLogger = VsWindowLogger;
//# sourceMappingURL=vsWindowLogger.js.map