'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = require("vscode");
const prettyfierFactory_1 = require("./prettyfierFactory");
// This method is called when the extension is activated.
// The extension is activated the very first time the command is executed.
function activate(context) {
    const supportedLanguageIds = prettyfierFactory_1.getSupportLanguageIds();
    for (let language of supportedLanguageIds) {
        context.subscriptions.push(vscode.languages.registerDocumentRangeFormattingEditProvider({ language }, prettyfierFactory_1.getDocumentRangePrettyfier()), vscode.languages.registerDocumentFormattingEditProvider({ language }, prettyfierFactory_1.getDocumentPrettyfier()));
    }
    const command = "markdownTablePrettify.prettifyTables";
    context.subscriptions.push(vscode.commands.registerTextEditorCommand(command, textEditor => {
        if (supportedLanguageIds.indexOf(textEditor.document.languageId) >= 0)
            prettyfierFactory_1.getDocumentPrettyfierCommand().prettifyDocument(textEditor);
    }));
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map