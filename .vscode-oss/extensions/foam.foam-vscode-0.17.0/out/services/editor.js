"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentEditorDirectory = exports.replaceSelection = exports.createDocAndFocus = exports.findSelectionContent = void 0;
const uri_1 = require("../core/model/uri");
const util_1 = require("util");
const vscode_1 = require("vscode");
const utils_1 = require("../utils");
const vsc_utils_1 = require("../utils/vsc-utils");
const utils_2 = require("../core/utils");
function findSelectionContent() {
    const editor = vscode_1.window.activeTextEditor;
    if (editor === undefined) {
        return undefined;
    }
    const document = editor.document;
    const selection = editor.selection;
    if (!document || selection.isEmpty) {
        return undefined;
    }
    return {
        document,
        selection,
        content: document.getText(selection),
    };
}
exports.findSelectionContent = findSelectionContent;
async function createDocAndFocus(text, filepath, viewColumn = vscode_1.ViewColumn.Active) {
    await vscode_1.workspace.fs.writeFile(vsc_utils_1.toVsCodeUri(filepath), new util_1.TextEncoder().encode(''));
    await utils_1.focusNote(filepath, true, viewColumn);
    await vscode_1.window.activeTextEditor.insertSnippet(text);
}
exports.createDocAndFocus = createDocAndFocus;
async function replaceSelection(document, selection, content) {
    const originatingFileEdit = new vscode_1.WorkspaceEdit();
    originatingFileEdit.replace(document.uri, selection, content);
    await vscode_1.workspace.applyEdit(originatingFileEdit);
}
exports.replaceSelection = replaceSelection;
/**
 * Returns the directory of the file currently open in the editor.
 * If no file is open in the editor it will return the first folder
 * in the workspace.
 * If both aren't available it will throw.
 *
 * @returns URI
 * @throws Error if no file is open in editor AND no workspace folder defined
 */
function getCurrentEditorDirectory() {
    var _a, _b;
    const uri = (_b = (_a = vscode_1.window.activeTextEditor) === null || _a === void 0 ? void 0 : _a.document) === null || _b === void 0 ? void 0 : _b.uri;
    if (utils_2.isSome(uri)) {
        return uri_1.URI.getDir(vsc_utils_1.fromVsCodeUri(uri));
    }
    if (vscode_1.workspace.workspaceFolders.length > 0) {
        return vsc_utils_1.fromVsCodeUri(vscode_1.workspace.workspaceFolders[0].uri);
    }
    throw new Error('A file must be open in editor, or workspace folder needed');
}
exports.getCurrentEditorDirectory = getCurrentEditorDirectory;
//# sourceMappingURL=editor.js.map