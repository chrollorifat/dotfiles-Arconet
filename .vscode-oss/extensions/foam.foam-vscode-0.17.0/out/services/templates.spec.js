"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const path_1 = __importDefault(require("path"));
const utils_1 = require("../utils");
const uri_1 = require("../core/model/uri");
const vsc_utils_1 = require("../utils/vsc-utils");
const templates_1 = require("../services/templates");
const test_utils_vscode_1 = require("../test/test-utils-vscode");
const variable_resolver_1 = require("./variable-resolver");
describe('Create note from template', () => {
    beforeEach(async () => {
        await test_utils_vscode_1.closeEditors();
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });
    describe('User flow', () => {
        it('should ask a user to confirm the path if note already exists', async () => {
            const templateA = await test_utils_vscode_1.createFile('Template A', [
                '.foam',
                'templates',
                'template-a.md',
            ]);
            const spy = jest
                .spyOn(vscode_1.window, 'showInputBox')
                .mockImplementationOnce(jest.fn(() => Promise.resolve(undefined)));
            const fileA = await test_utils_vscode_1.createFile('Content of file A');
            await templates_1.NoteFactory.createFromTemplate(templateA.uri, new variable_resolver_1.Resolver(new Map(), new Date()), fileA.uri);
            expect(spy).toBeCalledWith(expect.objectContaining({
                prompt: `Enter the filename for the new note`,
            }));
            await test_utils_vscode_1.deleteFile(fileA);
            await test_utils_vscode_1.deleteFile(templateA);
        });
        it('should not ask a user for path if defined in template', async () => {
            const uri = test_utils_vscode_1.getUriInWorkspace();
            const templateA = await test_utils_vscode_1.createFile(`---
foam_template: # foam template metadata
  filepath: "${uri_1.URI.toFsPath(uri)}"
---
`, ['.foam', 'templates', 'template-with-path.md']);
            const spy = jest
                .spyOn(vscode_1.window, 'showInputBox')
                .mockImplementationOnce(jest.fn(() => Promise.resolve(undefined)));
            await templates_1.NoteFactory.createFromTemplate(templateA.uri, new variable_resolver_1.Resolver(new Map(), new Date()));
            expect(spy).toHaveBeenCalledTimes(0);
            await test_utils_vscode_1.deleteFile(uri);
            await test_utils_vscode_1.deleteFile(templateA);
        });
        it('should focus the editor on the newly created note', async () => {
            const templateA = await test_utils_vscode_1.createFile('Template A', [
                '.foam',
                'templates',
                'template-a.md',
            ]);
            const target = test_utils_vscode_1.getUriInWorkspace();
            await templates_1.NoteFactory.createFromTemplate(templateA.uri, new variable_resolver_1.Resolver(new Map(), new Date()), target);
            expect(vsc_utils_1.fromVsCodeUri(vscode_1.window.activeTextEditor.document.uri)).toEqual(target);
            await test_utils_vscode_1.deleteFile(target);
            await test_utils_vscode_1.deleteFile(templateA);
        });
    });
    it('should expand variables when using a template', async () => {
        // eslint-disable-next-line no-template-curly-in-string
        const template = await test_utils_vscode_1.createFile('${FOAM_DATE_YEAR}', [
            '.foam',
            'templates',
            'template-with-variables.md',
        ]);
        const target = test_utils_vscode_1.getUriInWorkspace();
        await templates_1.NoteFactory.createFromTemplate(template.uri, new variable_resolver_1.Resolver(new Map(), new Date()), target);
        expect(vscode_1.window.activeTextEditor.document.getText()).toEqual(`${new Date().getFullYear()}`);
        await test_utils_vscode_1.deleteFile(target);
        await test_utils_vscode_1.deleteFile(template);
    });
    describe('Creation with active text selection', () => {
        it('should populate FOAM_SELECTED_TEXT with the current selection', async () => {
            const templateA = await test_utils_vscode_1.createFile('Template A', [
                '.foam',
                'templates',
                'template-a.md',
            ]);
            const file = await test_utils_vscode_1.createFile('Content of first file');
            const { editor } = await test_utils_vscode_1.showInEditor(file.uri);
            editor.selection = new vscode_1.Selection(0, 11, 1, 0);
            const target = test_utils_vscode_1.getUriInWorkspace();
            const resolver = new variable_resolver_1.Resolver(new Map(), new Date());
            await templates_1.NoteFactory.createFromTemplate(templateA.uri, resolver, target);
            expect(await resolver.resolve('FOAM_SELECTED_TEXT')).toEqual('first file');
            await test_utils_vscode_1.deleteFile(templateA);
            await test_utils_vscode_1.deleteFile(target);
            await test_utils_vscode_1.deleteFile(file);
        });
        it('should open created note in a new column if there was a selection', async () => {
            const templateA = await test_utils_vscode_1.createFile('Template A', [
                '.foam',
                'templates',
                'template-a.md',
            ]);
            const file = await test_utils_vscode_1.createFile('This is my first file: for new file');
            const { editor } = await test_utils_vscode_1.showInEditor(file.uri);
            editor.selection = new vscode_1.Selection(0, 23, 0, 35);
            const target = test_utils_vscode_1.getUriInWorkspace();
            await templates_1.NoteFactory.createFromTemplate(templateA.uri, new variable_resolver_1.Resolver(new Map(), new Date()), target);
            expect(vscode_1.window.activeTextEditor.viewColumn).toEqual(vscode_1.ViewColumn.Two);
            expect(vsc_utils_1.fromVsCodeUri(vscode_1.window.visibleTextEditors[0].document.uri)).toEqual(file.uri);
            expect(vsc_utils_1.fromVsCodeUri(vscode_1.window.visibleTextEditors[1].document.uri)).toEqual(target);
            await test_utils_vscode_1.deleteFile(target);
            await test_utils_vscode_1.deleteFile(templateA);
            await test_utils_vscode_1.closeEditors();
        });
        it('should replace selection with a link to the newly created note', async () => {
            const template = await test_utils_vscode_1.createFile(
            // eslint-disable-next-line no-template-curly-in-string
            'Hello ${FOAM_SELECTED_TEXT} ${FOAM_SELECTED_TEXT}', ['.foam', 'templates', 'template-with-selection.md']);
            const file = await test_utils_vscode_1.createFile('This is my first file: World');
            const { editor } = await test_utils_vscode_1.showInEditor(file.uri);
            editor.selection = new vscode_1.Selection(0, 23, 0, 28);
            const target = test_utils_vscode_1.getUriInWorkspace();
            await templates_1.NoteFactory.createFromTemplate(template.uri, new variable_resolver_1.Resolver(new Map(), new Date()), target);
            expect(vscode_1.window.activeTextEditor.document.getText()).toEqual('Hello World World');
            expect(vscode_1.window.visibleTextEditors[0].document.getText()).toEqual(`This is my first file: [[${uri_1.URI.getBasename(target)}]]`);
        });
    });
});
describe('determineNewNoteFilepath', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });
    it('should use the template path if absolute', async () => {
        const winAbsolutePath = 'C:\\absolute_path\\journal\\My Note Title.md';
        const linuxAbsolutePath = '/absolute_path/journal/My Note Title.md';
        const winResult = await templates_1.determineNewNoteFilepath(winAbsolutePath, undefined, new variable_resolver_1.Resolver(new Map(), new Date()));
        expect(uri_1.URI.toFsPath(winResult)).toMatch(winAbsolutePath);
        const linuxResult = await templates_1.determineNewNoteFilepath(linuxAbsolutePath, undefined, new variable_resolver_1.Resolver(new Map(), new Date()));
        expect(uri_1.URI.toFsPath(linuxResult)).toMatch(linuxAbsolutePath);
    });
    it('should compute the relative template filepath from the current directory', async () => {
        const relativePath = utils_1.isWindows
            ? 'journal\\My Note Title.md'
            : 'journal/My Note Title.md';
        const resultFilepath = await templates_1.determineNewNoteFilepath(relativePath, undefined, new variable_resolver_1.Resolver(new Map(), new Date()));
        const expectedPath = path_1.default.join(uri_1.URI.toFsPath(vsc_utils_1.fromVsCodeUri(vscode_1.workspace.workspaceFolders[0].uri)), relativePath);
        expect(uri_1.URI.toFsPath(resultFilepath)).toMatch(expectedPath);
    });
    it('should use the note title if nothing else is available', async () => {
        const noteTitle = 'My new note';
        const resultFilepath = await templates_1.determineNewNoteFilepath(undefined, undefined, new variable_resolver_1.Resolver(new Map().set('FOAM_TITLE', noteTitle), new Date()));
        const expectedPath = path_1.default.join(uri_1.URI.toFsPath(vsc_utils_1.fromVsCodeUri(vscode_1.workspace.workspaceFolders[0].uri)), `${noteTitle}.md`);
        expect(uri_1.URI.toFsPath(resultFilepath)).toMatch(expectedPath);
    });
    it('should ask the user for a note title if nothing else is available', async () => {
        const noteTitle = 'My new note';
        const spy = jest
            .spyOn(vscode_1.window, 'showInputBox')
            .mockImplementationOnce(jest.fn(() => Promise.resolve(noteTitle)));
        const resultFilepath = await templates_1.determineNewNoteFilepath(undefined, undefined, new variable_resolver_1.Resolver(new Map(), new Date()));
        const expectedPath = path_1.default.join(uri_1.URI.toFsPath(vsc_utils_1.fromVsCodeUri(vscode_1.workspace.workspaceFolders[0].uri)), `${noteTitle}.md`);
        expect(spy).toHaveBeenCalled();
        expect(uri_1.URI.toFsPath(resultFilepath)).toMatch(expectedPath);
    });
});
//# sourceMappingURL=templates.spec.js.map