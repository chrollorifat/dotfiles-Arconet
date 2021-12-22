"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const uri_1 = require("../core/model/uri");
const path_1 = __importDefault(require("path"));
const vsc_utils_1 = require("../utils/vsc-utils");
const vscode_1 = require("vscode");
const test_utils_vscode_1 = require("../test/test-utils-vscode");
const editor = __importStar(require("../services/editor"));
describe('Create from template commands', () => {
    describe('create-note-from-template', () => {
        afterEach(() => {
            jest.clearAllMocks();
        });
        it('offers to create template when none are available', async () => {
            const spy = jest
                .spyOn(vscode_1.window, 'showQuickPick')
                .mockImplementationOnce(jest.fn(() => Promise.resolve(undefined)));
            await vscode_1.commands.executeCommand('foam-vscode.create-note-from-template');
            expect(spy).toBeCalledWith(['Yes', 'No'], {
                placeHolder: 'No templates available. Would you like to create one instead?',
            });
        });
        it('offers to pick which template to use', async () => {
            const templateA = await test_utils_vscode_1.createFile('Template A', [
                '.foam',
                'templates',
                'template-a.md',
            ]);
            const templateB = await test_utils_vscode_1.createFile('Template A', [
                '.foam',
                'templates',
                'template-b.md',
            ]);
            const spy = jest
                .spyOn(vscode_1.window, 'showQuickPick')
                .mockImplementationOnce(jest.fn(() => Promise.resolve(undefined)));
            await vscode_1.commands.executeCommand('foam-vscode.create-note-from-template');
            expect(spy).toBeCalledWith([
                expect.objectContaining({ label: 'template-a.md' }),
                expect.objectContaining({ label: 'template-b.md' }),
            ], {
                placeHolder: 'Select a template to use.',
            });
            await vscode_1.workspace.fs.delete(vsc_utils_1.toVsCodeUri(templateA.uri));
            await vscode_1.workspace.fs.delete(vsc_utils_1.toVsCodeUri(templateB.uri));
        });
        it('Uses template metadata to improve dialog box', async () => {
            const templateA = await test_utils_vscode_1.createFile(`---
foam_template:
  name: My Template
  description: My Template description
---

Template A
      `, ['.foam', 'templates', 'template-a.md']);
            const spy = jest
                .spyOn(vscode_1.window, 'showQuickPick')
                .mockImplementationOnce(jest.fn(() => Promise.resolve(undefined)));
            await vscode_1.commands.executeCommand('foam-vscode.create-note-from-template');
            expect(spy).toBeCalledWith([
                expect.objectContaining({
                    label: 'My Template',
                    description: 'template-a.md',
                    detail: 'My Template description',
                }),
            ], expect.anything());
            await vscode_1.workspace.fs.delete(vsc_utils_1.toVsCodeUri(templateA.uri));
        });
    });
    describe('create-note-from-default-template', () => {
        afterEach(() => {
            jest.clearAllMocks();
        });
        it('can be cancelled while resolving FOAM_TITLE', async () => {
            const spy = jest
                .spyOn(vscode_1.window, 'showInputBox')
                .mockImplementation(jest.fn(() => Promise.resolve(undefined)));
            const docCreatorSpy = jest.spyOn(editor, 'createDocAndFocus');
            await vscode_1.commands.executeCommand('foam-vscode.create-note-from-default-template');
            expect(spy).toBeCalledWith({
                prompt: `Enter a title for the new note`,
                value: 'Title of my New Note',
                validateInput: expect.anything(),
            });
            expect(docCreatorSpy).toHaveBeenCalledTimes(0);
        });
    });
    describe('create-new-template', () => {
        afterEach(() => {
            jest.clearAllMocks();
        });
        it('should create a new template', async () => {
            const template = path_1.default.join(vscode_1.workspace.workspaceFolders[0].uri.fsPath, '.foam', 'templates', 'hello-world.md');
            vscode_1.window.showInputBox = jest.fn(() => {
                return Promise.resolve(template);
            });
            await vscode_1.commands.executeCommand('foam-vscode.create-new-template');
            const file = await vscode_1.workspace.fs.readFile(vsc_utils_1.toVsCodeUri(uri_1.URI.file(template)));
            expect(vscode_1.window.showInputBox).toHaveBeenCalled();
            expect(file).toBeDefined();
        });
        it('can be cancelled', async () => {
            // This is the default template which would be created.
            const template = path_1.default.join(vscode_1.workspace.workspaceFolders[0].uri.fsPath, '.foam', 'templates', 'new-template.md');
            vscode_1.window.showInputBox = jest.fn(() => {
                return Promise.resolve(undefined);
            });
            await vscode_1.commands.executeCommand('foam-vscode.create-new-template');
            expect(vscode_1.window.showInputBox).toHaveBeenCalled();
            await expect(vscode_1.workspace.fs.readFile(vsc_utils_1.toVsCodeUri(uri_1.URI.file(template)))).rejects.toThrow();
        });
    });
});
//# sourceMappingURL=create-from-template.spec.js.map