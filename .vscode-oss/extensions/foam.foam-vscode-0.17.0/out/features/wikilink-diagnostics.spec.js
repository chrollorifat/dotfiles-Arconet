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
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = __importStar(require("vscode"));
const markdown_provider_1 = require("../core/markdown-provider");
const workspace_1 = require("../core/model/workspace");
const test_utils_vscode_1 = require("../test/test-utils-vscode");
const vsc_utils_1 = require("../utils/vsc-utils");
const wikilink_diagnostics_1 = require("./wikilink-diagnostics");
describe('Wikilink diagnostics', () => {
    beforeEach(async () => {
        await test_utils_vscode_1.cleanWorkspace();
        await test_utils_vscode_1.closeEditors();
    });
    it('should show no warnings when there are no conflicts', async () => {
        const fileA = await test_utils_vscode_1.createFile('This is the todo file');
        const fileB = await test_utils_vscode_1.createFile(`This is linked to [[${fileA.name}]]`);
        const parser = markdown_provider_1.createMarkdownParser([]);
        const ws = new workspace_1.FoamWorkspace()
            .set(parser.parse(fileA.uri, fileA.content))
            .set(parser.parse(fileB.uri, fileB.content));
        await test_utils_vscode_1.showInEditor(fileB.uri);
        const collection = vscode.languages.createDiagnosticCollection('foam-test');
        wikilink_diagnostics_1.updateDiagnostics(ws, parser, vscode.window.activeTextEditor.document, collection);
        expect(countEntries(collection)).toEqual(0);
    });
    it('should show no warnings in non-md files', async () => {
        const fileA = await test_utils_vscode_1.createFile('This is the todo file', [
            'project',
            'car',
            'todo.md',
        ]);
        const fileB = await test_utils_vscode_1.createFile('This is the todo file', [
            'another',
            'todo.md',
        ]);
        const fileC = await test_utils_vscode_1.createFile('Link in JS file to [[todo]]', [
            'path',
            'file.js',
        ]);
        const parser = markdown_provider_1.createMarkdownParser([]);
        const ws = new workspace_1.FoamWorkspace()
            .set(parser.parse(fileA.uri, fileA.content))
            .set(parser.parse(fileB.uri, fileB.content))
            .set(parser.parse(fileC.uri, fileC.content));
        await test_utils_vscode_1.showInEditor(fileC.uri);
        const collection = vscode.languages.createDiagnosticCollection('foam-test');
        wikilink_diagnostics_1.updateDiagnostics(ws, parser, vscode.window.activeTextEditor.document, collection);
        expect(countEntries(collection)).toEqual(0);
    });
    it('should show a warning when a link cannot be resolved', async () => {
        const fileA = await test_utils_vscode_1.createFile('This is the todo file', [
            'project',
            'car',
            'todo.md',
        ]);
        const fileB = await test_utils_vscode_1.createFile('This is the todo file', [
            'another',
            'todo.md',
        ]);
        const fileC = await test_utils_vscode_1.createFile('Link to [[todo]]');
        const parser = markdown_provider_1.createMarkdownParser([]);
        const ws = new workspace_1.FoamWorkspace()
            .set(parser.parse(fileA.uri, fileA.content))
            .set(parser.parse(fileB.uri, fileB.content))
            .set(parser.parse(fileC.uri, fileC.content));
        await test_utils_vscode_1.showInEditor(fileC.uri);
        const collection = vscode.languages.createDiagnosticCollection('foam-test');
        wikilink_diagnostics_1.updateDiagnostics(ws, parser, vscode.window.activeTextEditor.document, collection);
        expect(countEntries(collection)).toEqual(1);
        const items = collection.get(vscode.window.activeTextEditor.document.uri);
        expect(items.length).toEqual(1);
        expect(items[0].range).toEqual(new vscode.Range(0, 8, 0, 16));
        expect(items[0].severity).toEqual(vscode.DiagnosticSeverity.Warning);
        expect(items[0].relatedInformation.map(info => info.location.uri.path)).toEqual([fileA.uri.path, fileB.uri.path]);
    });
});
describe('Section diagnostics', () => {
    it('should show nothing on placeholders', async () => {
        const file = await test_utils_vscode_1.createFile('Link to [[placeholder]]');
        const parser = markdown_provider_1.createMarkdownParser([]);
        const ws = new workspace_1.FoamWorkspace().set(parser.parse(file.uri, file.content));
        await test_utils_vscode_1.showInEditor(file.uri);
        const collection = vscode.languages.createDiagnosticCollection('foam-test');
        wikilink_diagnostics_1.updateDiagnostics(ws, parser, vscode.window.activeTextEditor.document, collection);
        expect(countEntries(collection)).toEqual(0);
    });
    it('should show nothing when the section is correct', async () => {
        const fileA = await test_utils_vscode_1.createFile(`
# Section 1
Content of section 1

# Section 2
Content of section 2
`, ['my-file.md']);
        const fileB = await test_utils_vscode_1.createFile('Link to [[my-file#Section 1]]');
        const parser = markdown_provider_1.createMarkdownParser([]);
        const ws = new workspace_1.FoamWorkspace()
            .set(parser.parse(fileA.uri, fileA.content))
            .set(parser.parse(fileB.uri, fileB.content));
        await test_utils_vscode_1.showInEditor(fileB.uri);
        const collection = vscode.languages.createDiagnosticCollection('foam-test');
        wikilink_diagnostics_1.updateDiagnostics(ws, parser, vscode.window.activeTextEditor.document, collection);
        expect(countEntries(collection)).toEqual(0);
    });
    it('should show a warning when the section name is incorrect', async () => {
        const fileA = await test_utils_vscode_1.createFile(`
# Section 1
Content of section 1

# Section 2
Content of section 2
`);
        const fileB = await test_utils_vscode_1.createFile(`Link to [[${fileA.name}#Section 10]]`);
        const parser = markdown_provider_1.createMarkdownParser([]);
        const ws = new workspace_1.FoamWorkspace()
            .set(parser.parse(fileA.uri, fileA.content))
            .set(parser.parse(fileB.uri, fileB.content));
        await test_utils_vscode_1.showInEditor(fileB.uri);
        const collection = vscode.languages.createDiagnosticCollection('foam-test');
        wikilink_diagnostics_1.updateDiagnostics(ws, parser, vscode.window.activeTextEditor.document, collection);
        expect(countEntries(collection)).toEqual(1);
        const items = collection.get(vsc_utils_1.toVsCodeUri(fileB.uri));
        expect(items[0].range).toEqual(new vscode.Range(0, 15, 0, 28));
        expect(items[0].severity).toEqual(vscode.DiagnosticSeverity.Warning);
        expect(items[0].relatedInformation.map(info => info.message)).toEqual([
            'Section 1',
            'Section 2',
        ]);
    });
});
const countEntries = (collection) => {
    let count = 0;
    collection.forEach((i, diagnostics) => {
        count += diagnostics.length;
    });
    return count;
};
//# sourceMappingURL=wikilink-diagnostics.spec.js.map