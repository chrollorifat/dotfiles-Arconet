"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const uri_1 = require("../core/model/uri");
const vsc_utils_1 = require("../utils/vsc-utils");
const test_utils_vscode_1 = require("../test/test-utils-vscode");
const editor_1 = require("./editor");
describe('Editor utils', () => {
    beforeAll(test_utils_vscode_1.closeEditors);
    beforeAll(test_utils_vscode_1.closeEditors);
    describe('getCurrentEditorDirectory', () => {
        it('should return the directory of the active text editor', async () => {
            const file = await test_utils_vscode_1.createFile('this is the file content.');
            await test_utils_vscode_1.showInEditor(file.uri);
            expect(editor_1.getCurrentEditorDirectory()).toEqual(uri_1.URI.getDir(file.uri));
        });
        it('should return the directory of the workspace folder if no editor is open', async () => {
            await test_utils_vscode_1.closeEditors();
            expect(editor_1.getCurrentEditorDirectory()).toEqual(vsc_utils_1.fromVsCodeUri(vscode_1.workspace.workspaceFolders[0].uri));
        });
    });
    describe('replaceSelection', () => {
        it('should replace the selection in the active editor', async () => {
            const fileA = await test_utils_vscode_1.createFile('This is the file A');
            const doc = await test_utils_vscode_1.showInEditor(fileA.uri);
            const selection = new vscode_1.Selection(0, 5, 0, 7); // 'is'
            await editor_1.replaceSelection(doc.doc, selection, 'was');
            expect(doc.doc.getText()).toEqual('This was the file A');
        });
    });
});
//# sourceMappingURL=editor.spec.js.map