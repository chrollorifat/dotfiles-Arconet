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
const uri_1 = require("../core/model/uri");
const test_utils_1 = require("../test/test-utils");
const test_utils_vscode_1 = require("../test/test-utils-vscode");
const navigation_provider_1 = require("./navigation-provider");
const utility_commands_1 = require("./utility-commands");
const vsc_utils_1 = require("../utils/vsc-utils");
const markdown_provider_1 = require("../core/markdown-provider");
const workspace_1 = require("../core/model/workspace");
const graph_1 = require("../core/model/graph");
describe('Document navigation', () => {
    const parser = markdown_provider_1.createMarkdownParser([]);
    beforeAll(async () => {
        await test_utils_vscode_1.cleanWorkspace();
    });
    afterAll(async () => {
        await test_utils_vscode_1.cleanWorkspace();
    });
    beforeEach(async () => {
        await test_utils_vscode_1.closeEditors();
    });
    describe('Document links provider', () => {
        it('should not return any link for empty documents', async () => {
            const { uri, content } = await test_utils_vscode_1.createFile('');
            const ws = new workspace_1.FoamWorkspace().set(parser.parse(uri, content));
            const graph = graph_1.FoamGraph.fromWorkspace(ws);
            const doc = await vscode.workspace.openTextDocument(vsc_utils_1.toVsCodeUri(uri));
            const provider = new navigation_provider_1.NavigationProvider(ws, graph, parser);
            const links = provider.provideDocumentLinks(doc);
            expect(links.length).toEqual(0);
        });
        it('should not return any link for documents without links', async () => {
            const { uri, content } = await test_utils_vscode_1.createFile('This is some content without links');
            const ws = new workspace_1.FoamWorkspace().set(parser.parse(uri, content));
            const graph = graph_1.FoamGraph.fromWorkspace(ws);
            const doc = await vscode.workspace.openTextDocument(vsc_utils_1.toVsCodeUri(uri));
            const provider = new navigation_provider_1.NavigationProvider(ws, graph, parser);
            const links = provider.provideDocumentLinks(doc);
            expect(links.length).toEqual(0);
        });
        it('should create links for wikilinks', async () => {
            const fileA = await test_utils_vscode_1.createFile('# File A', ['file-a.md']);
            const fileB = await test_utils_vscode_1.createFile(`this is a link to [[${fileA.name}]].`);
            const ws = test_utils_1.createTestWorkspace()
                .set(parser.parse(fileA.uri, fileA.content))
                .set(parser.parse(fileA.uri, fileB.content));
            const graph = graph_1.FoamGraph.fromWorkspace(ws);
            const { doc } = await test_utils_vscode_1.showInEditor(fileB.uri);
            const provider = new navigation_provider_1.NavigationProvider(ws, graph, parser);
            const links = provider.provideDocumentLinks(doc);
            expect(links.length).toEqual(1);
            expect(links[0].target).toEqual(utility_commands_1.OPEN_COMMAND.asURI(fileA.uri));
            expect(links[0].range).toEqual(new vscode.Range(0, 18, 0, 28));
        });
        it('should create links for placeholders', async () => {
            const fileA = await test_utils_vscode_1.createFile(`this is a link to [[a placeholder]].`);
            const ws = new workspace_1.FoamWorkspace().set(parser.parse(fileA.uri, fileA.content));
            const graph = graph_1.FoamGraph.fromWorkspace(ws);
            const { doc } = await test_utils_vscode_1.showInEditor(fileA.uri);
            const provider = new navigation_provider_1.NavigationProvider(ws, graph, parser);
            const links = provider.provideDocumentLinks(doc);
            expect(links.length).toEqual(1);
            expect(links[0].target).toEqual(utility_commands_1.OPEN_COMMAND.asURI(uri_1.URI.placeholder('a placeholder')));
            expect(links[0].range).toEqual(new vscode.Range(0, 18, 0, 35));
        });
    });
    describe('definition provider', () => {
        it('should not create a definition for a placeholder', async () => {
            const fileA = await test_utils_vscode_1.createFile(`this is a link to [[placeholder]].`);
            const ws = test_utils_1.createTestWorkspace().set(parser.parse(fileA.uri, fileA.content));
            const graph = graph_1.FoamGraph.fromWorkspace(ws);
            const { doc } = await test_utils_vscode_1.showInEditor(fileA.uri);
            const provider = new navigation_provider_1.NavigationProvider(ws, graph, parser);
            const definitions = await provider.provideDefinition(doc, new vscode.Position(0, 22));
            expect(definitions).toBeUndefined();
        });
        it('should create a definition for a wikilink', async () => {
            const fileA = await test_utils_vscode_1.createFile('# File A');
            const fileB = await test_utils_vscode_1.createFile(`this is a link to [[${fileA.name}]].`);
            const ws = test_utils_1.createTestWorkspace()
                .set(parser.parse(fileA.uri, fileA.content))
                .set(parser.parse(fileB.uri, fileB.content));
            const graph = graph_1.FoamGraph.fromWorkspace(ws);
            const { doc } = await test_utils_vscode_1.showInEditor(fileB.uri);
            const provider = new navigation_provider_1.NavigationProvider(ws, graph, parser);
            const definitions = await provider.provideDefinition(doc, new vscode.Position(0, 22));
            expect(definitions.length).toEqual(1);
            expect(definitions[0].targetUri).toEqual(vsc_utils_1.toVsCodeUri(fileA.uri));
            // target the whole file
            expect(definitions[0].targetRange).toEqual(new vscode.Range(0, 0, 0, 8));
            // select nothing
            expect(definitions[0].targetSelectionRange).toEqual(new vscode.Range(0, 0, 0, 0));
        });
        it('should create a definition for a regular link', async () => {
            const fileA = await test_utils_vscode_1.createFile('# File A');
            const fileB = await test_utils_vscode_1.createFile(`this is a link to [a file](./${fileA.base}).`);
            const ws = test_utils_1.createTestWorkspace()
                .set(parser.parse(fileA.uri, fileA.content))
                .set(parser.parse(fileB.uri, fileB.content));
            const graph = graph_1.FoamGraph.fromWorkspace(ws);
            const { doc } = await test_utils_vscode_1.showInEditor(fileB.uri);
            const provider = new navigation_provider_1.NavigationProvider(ws, graph, parser);
            const definitions = await provider.provideDefinition(doc, new vscode.Position(0, 22));
            expect(definitions.length).toEqual(1);
            expect(definitions[0].targetUri).toEqual(vsc_utils_1.toVsCodeUri(fileA.uri));
        });
        it('should support wikilinks that have an alias', async () => {
            const fileA = await test_utils_vscode_1.createFile("# File A that's aliased");
            const fileB = await test_utils_vscode_1.createFile(`this is a link to [[${fileA.name}|alias]].`);
            const ws = test_utils_1.createTestWorkspace()
                .set(parser.parse(fileA.uri, fileA.content))
                .set(parser.parse(fileB.uri, fileB.content));
            const graph = graph_1.FoamGraph.fromWorkspace(ws);
            const { doc } = await test_utils_vscode_1.showInEditor(fileB.uri);
            const provider = new navigation_provider_1.NavigationProvider(ws, graph, parser);
            const definitions = await provider.provideDefinition(doc, new vscode.Position(0, 22));
            expect(definitions.length).toEqual(1);
            expect(definitions[0].targetUri).toEqual(vsc_utils_1.toVsCodeUri(fileA.uri));
        });
        it('should support wikilink aliases in tables using escape character', async () => {
            const fileA = await test_utils_vscode_1.createFile('# File that has to be aliased');
            const fileB = await test_utils_vscode_1.createFile(`
  | Col A | ColB |
  | --- | --- |
  | [[${fileA.name}\\|alias]] | test |
    `);
            const ws = test_utils_1.createTestWorkspace()
                .set(parser.parse(fileA.uri, fileA.content))
                .set(parser.parse(fileB.uri, fileB.content));
            const graph = graph_1.FoamGraph.fromWorkspace(ws);
            const { doc } = await test_utils_vscode_1.showInEditor(fileB.uri);
            const provider = new navigation_provider_1.NavigationProvider(ws, graph, parser);
            const definitions = await provider.provideDefinition(doc, new vscode.Position(3, 10));
            expect(definitions.length).toEqual(1);
            expect(definitions[0].targetUri).toEqual(vsc_utils_1.toVsCodeUri(fileA.uri));
        });
    });
    describe('reference provider', () => {
        it('should provide references for wikilinks', async () => {
            const fileA = await test_utils_vscode_1.createFile('The content of File A');
            const fileB = await test_utils_vscode_1.createFile(`File B is connected to [[${fileA.name}]] and has a [[placeholder]].`);
            const fileC = await test_utils_vscode_1.createFile(`File C is also connected to [[${fileA.name}]].`);
            const fileD = await test_utils_vscode_1.createFile(`File C has a [[placeholder]].`);
            const ws = test_utils_1.createTestWorkspace()
                .set(parser.parse(fileA.uri, fileA.content))
                .set(parser.parse(fileB.uri, fileB.content))
                .set(parser.parse(fileC.uri, fileC.content))
                .set(parser.parse(fileD.uri, fileD.content));
            const graph = graph_1.FoamGraph.fromWorkspace(ws);
            const { doc } = await test_utils_vscode_1.showInEditor(fileB.uri);
            const provider = new navigation_provider_1.NavigationProvider(ws, graph, parser);
            const refs = await provider.provideReferences(doc, new vscode.Position(0, 26));
            expect(refs.length).toEqual(2);
            expect(refs[0]).toEqual({
                uri: vsc_utils_1.toVsCodeUri(fileB.uri),
                range: new vscode.Range(0, 23, 0, 23 + 9),
            });
        });
        it('should provide references for placeholders', async () => { });
    });
});
//# sourceMappingURL=navigation-provider.spec.js.map