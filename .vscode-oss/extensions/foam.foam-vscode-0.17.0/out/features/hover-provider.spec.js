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
const graph_1 = require("../core/model/graph");
const workspace_1 = require("../core/model/workspace");
const datastore_1 = require("../core/services/datastore");
const test_utils_vscode_1 = require("../test/test-utils-vscode");
const vsc_utils_1 = require("../utils/vsc-utils");
const hover_provider_1 = require("./hover-provider");
// We can't use createTestWorkspace from /packages/foam-vscode/src/test/test-utils.ts
// because we need a MarkdownResourceProvider with a real instance of FileDataStore.
const createWorkspace = () => {
    const matcher = new datastore_1.Matcher(vscode.workspace.workspaceFolders.map(f => vsc_utils_1.fromVsCodeUri(f.uri)));
    const resourceProvider = new markdown_provider_1.MarkdownResourceProvider(matcher);
    const workspace = new workspace_1.FoamWorkspace();
    workspace.registerProvider(resourceProvider);
    return workspace;
};
const getValue = (value) => value instanceof vscode.MarkdownString ? value.value : value;
describe('Hover provider', () => {
    const noCancelToken = {
        isCancellationRequested: false,
        onCancellationRequested: null,
    };
    const parser = markdown_provider_1.createMarkdownParser([]);
    const hoverEnabled = () => true;
    beforeAll(async () => {
        await test_utils_vscode_1.cleanWorkspace();
    });
    afterAll(async () => {
        await test_utils_vscode_1.cleanWorkspace();
    });
    beforeEach(async () => {
        await test_utils_vscode_1.closeEditors();
    });
    describe('not returning hovers', () => {
        it('should not return hover content for empty documents', async () => {
            const { uri, content } = await test_utils_vscode_1.createFile('');
            const ws = createWorkspace().set(parser.parse(uri, content));
            const graph = graph_1.FoamGraph.fromWorkspace(ws);
            const provider = new hover_provider_1.HoverProvider(hoverEnabled, ws, graph, parser);
            const doc = await vscode.workspace.openTextDocument(vsc_utils_1.toVsCodeUri(uri));
            const pos = new vscode.Position(0, 0);
            const result = await provider.provideHover(doc, pos, noCancelToken);
            expect(result).toBeUndefined();
            ws.dispose();
            graph.dispose();
        });
        it('should not return hover content for documents without links', async () => {
            const { uri, content } = await test_utils_vscode_1.createFile('This is some content without links');
            const ws = createWorkspace().set(parser.parse(uri, content));
            const graph = graph_1.FoamGraph.fromWorkspace(ws);
            const provider = new hover_provider_1.HoverProvider(hoverEnabled, ws, graph, parser);
            const doc = await vscode.workspace.openTextDocument(vsc_utils_1.toVsCodeUri(uri));
            const pos = new vscode.Position(0, 0);
            const result = await provider.provideHover(doc, pos, noCancelToken);
            expect(result).toBeUndefined();
            ws.dispose();
            graph.dispose();
        });
        it('should not return hover content when the cursor is not placed on a wikilink', async () => {
            const fileB = await test_utils_vscode_1.createFile('# File B\nThe content of file B');
            const fileA = await test_utils_vscode_1.createFile(`this is a link to [[${fileB.name}]] end of the line.`);
            const noteA = parser.parse(fileA.uri, fileA.content);
            const noteB = parser.parse(fileB.uri, fileB.content);
            const ws = createWorkspace()
                .set(noteA)
                .set(noteB);
            const graph = graph_1.FoamGraph.fromWorkspace(ws);
            const provider = new hover_provider_1.HoverProvider(hoverEnabled, ws, graph, parser);
            const { doc } = await test_utils_vscode_1.showInEditor(noteA.uri);
            const pos = new vscode.Position(0, 11); // Set cursor position beside the wikilink.
            const result = await provider.provideHover(doc, pos, noCancelToken);
            expect(result).toBeUndefined();
            ws.dispose();
            graph.dispose();
        });
        it('should not return hover content for a placeholder', async () => {
            const fileA = await test_utils_vscode_1.createFile(`this is a link to [[a placeholder]] end of the line.`);
            const noteA = parser.parse(fileA.uri, fileA.content);
            const ws = createWorkspace().set(noteA);
            const graph = graph_1.FoamGraph.fromWorkspace(ws);
            const provider = new hover_provider_1.HoverProvider(hoverEnabled, ws, graph, parser);
            const { doc } = await test_utils_vscode_1.showInEditor(noteA.uri);
            const pos = new vscode.Position(0, 22); // Set cursor position on the placeholder.
            const result = await provider.provideHover(doc, pos, noCancelToken);
            expect(result.contents[0]).toBeNull();
            ws.dispose();
            graph.dispose();
        });
        it('should not return hover when provider is disabled', async () => {
            const fileB = await test_utils_vscode_1.createFile(`this is my file content`);
            const fileA = await test_utils_vscode_1.createFile(`this is a link to [[${fileB.name}]] end of the line.`);
            const noteA = parser.parse(fileA.uri, fileA.content);
            const noteB = parser.parse(fileB.uri, fileB.content);
            const ws = createWorkspace()
                .set(noteA)
                .set(noteB);
            const graph = graph_1.FoamGraph.fromWorkspace(ws);
            const { doc } = await test_utils_vscode_1.showInEditor(noteA.uri);
            const pos = new vscode.Position(0, 22); // Set cursor position on the wikilink.
            const disabledProvider = new hover_provider_1.HoverProvider(() => false, ws, graph, parser);
            expect(await disabledProvider.provideHover(doc, pos, noCancelToken)).toBeUndefined();
            ws.dispose();
            graph.dispose();
        });
    });
    describe('wikilink content preview', () => {
        it('should return hover content for a wikilink', async () => {
            const fileB = await test_utils_vscode_1.createFile(`This is some content from file B`);
            const fileA = await test_utils_vscode_1.createFile(`this is a link to [[${fileB.name}]] end of the line.`);
            const noteA = parser.parse(fileA.uri, fileA.content);
            const noteB = parser.parse(fileB.uri, fileB.content);
            const ws = createWorkspace()
                .set(noteA)
                .set(noteB);
            const graph = graph_1.FoamGraph.fromWorkspace(ws);
            const { doc } = await test_utils_vscode_1.showInEditor(noteA.uri);
            const pos = new vscode.Position(0, 22); // Set cursor position on the wikilink.
            const provider = new hover_provider_1.HoverProvider(hoverEnabled, ws, graph, parser);
            const result = await provider.provideHover(doc, pos, noCancelToken);
            expect(result.contents).toHaveLength(2);
            expect(getValue(result.contents[0])).toEqual(`This is some content from file B`);
            ws.dispose();
            graph.dispose();
        });
        it('should return hover content for a regular link', async () => {
            const fileB = await test_utils_vscode_1.createFile(`This is some content from file B`);
            const fileA = await test_utils_vscode_1.createFile(`this is a link to [a file](./${fileB.base}).`);
            const noteA = parser.parse(fileA.uri, fileA.content);
            const noteB = parser.parse(fileB.uri, fileB.content);
            const ws = createWorkspace()
                .set(noteA)
                .set(noteB);
            const graph = graph_1.FoamGraph.fromWorkspace(ws);
            const { doc } = await test_utils_vscode_1.showInEditor(noteA.uri);
            const pos = new vscode.Position(0, 22); // Set cursor position on the link.
            const provider = new hover_provider_1.HoverProvider(hoverEnabled, ws, graph, parser);
            const result = await provider.provideHover(doc, pos, noCancelToken);
            expect(result.contents).toHaveLength(2);
            expect(getValue(result.contents[0])).toEqual(`This is some content from file B`);
            ws.dispose();
            graph.dispose();
        });
        it('should remove YAML properties from preview', async () => {
            const fileB = await test_utils_vscode_1.createFile(`---
tags: my-tag1 my-tag2
---      
    
The content of file B`);
            const fileA = await test_utils_vscode_1.createFile(`this is a link to [a file](./${fileB.base}).`);
            const noteA = parser.parse(fileA.uri, fileA.content);
            const noteB = parser.parse(fileB.uri, fileB.content);
            const ws = createWorkspace()
                .set(noteA)
                .set(noteB);
            const graph = graph_1.FoamGraph.fromWorkspace(ws);
            const { doc } = await test_utils_vscode_1.showInEditor(noteA.uri);
            const pos = new vscode.Position(0, 22); // Set cursor position on the link.
            const provider = new hover_provider_1.HoverProvider(hoverEnabled, ws, graph, parser);
            const result = await provider.provideHover(doc, pos, noCancelToken);
            expect(result.contents).toHaveLength(2);
            expect(getValue(result.contents[0])).toEqual(`The content of file B`);
            ws.dispose();
            graph.dispose();
        });
    });
    describe('backlink inclusion in hover', () => {
        it('should not include references if there are none', async () => {
            const fileA = await test_utils_vscode_1.createFile(`This is some [[wikilink]]`);
            const ws = createWorkspace().set(parser.parse(fileA.uri, fileA.content));
            const graph = graph_1.FoamGraph.fromWorkspace(ws);
            const { doc } = await test_utils_vscode_1.showInEditor(fileA.uri);
            const pos = new vscode.Position(0, 20); // Set cursor position on the link.
            const provider = new hover_provider_1.HoverProvider(hoverEnabled, ws, graph, parser);
            const result = await provider.provideHover(doc, pos, noCancelToken);
            expect(result.contents).toHaveLength(2);
            expect(result.contents[0]).toEqual(null);
            expect(result.contents[1]).toEqual(null);
            ws.dispose();
            graph.dispose();
        });
        it('should include other backlinks (but not self) to target wikilink', async () => {
            const fileA = await test_utils_vscode_1.createFile(`This is some content`);
            const fileB = await test_utils_vscode_1.createFile(`This is a direct link to [a file](./${fileA.base}).`);
            const fileC = await test_utils_vscode_1.createFile(`Here is a wikilink to [[${fileA.name}]]`);
            const ws = createWorkspace()
                .set(parser.parse(fileA.uri, fileA.content))
                .set(parser.parse(fileB.uri, fileB.content))
                .set(parser.parse(fileC.uri, fileC.content));
            const graph = graph_1.FoamGraph.fromWorkspace(ws);
            const { doc } = await test_utils_vscode_1.showInEditor(fileB.uri);
            const pos = new vscode.Position(0, 29); // Set cursor position on the link.
            const provider = new hover_provider_1.HoverProvider(hoverEnabled, ws, graph, parser);
            const result = await provider.provideHover(doc, pos, noCancelToken);
            expect(result.contents).toHaveLength(2);
            expect(getValue(result.contents[0])).toEqual(`This is some content`);
            expect(getValue(result.contents[1])).toMatch(/^Also referenced in 1 note:/);
            ws.dispose();
            graph.dispose();
        });
        it('should only add a note only once no matter how many links it has to the target', async () => {
            const fileA = await test_utils_vscode_1.createFile(`This is some content`);
            const fileB = await test_utils_vscode_1.createFile(`This is a link to [[${fileA.name}]].`);
            const fileC = await test_utils_vscode_1.createFile(`This note is linked to [[${fileA.name}]] twice, here is the second: [[${fileA.name}]]`);
            const ws = createWorkspace()
                .set(parser.parse(fileA.uri, fileA.content))
                .set(parser.parse(fileB.uri, fileB.content))
                .set(parser.parse(fileC.uri, fileC.content));
            const graph = graph_1.FoamGraph.fromWorkspace(ws);
            const { doc } = await test_utils_vscode_1.showInEditor(fileB.uri);
            const pos = new vscode.Position(0, 22); // Set cursor position on the link.
            const provider = new hover_provider_1.HoverProvider(hoverEnabled, ws, graph, parser);
            const result = await provider.provideHover(doc, pos, noCancelToken);
            expect(result.contents).toHaveLength(2);
            expect(getValue(result.contents[1])).toMatch(/^Also referenced in 1 note:/);
            ws.dispose();
            graph.dispose();
        });
        it('should work for placeholders', async () => {
            const fileA = await test_utils_vscode_1.createFile(`Some content and a [[placeholder]]`);
            const fileB = await test_utils_vscode_1.createFile(`More content to a [[placeholder]]`);
            const fileC = await test_utils_vscode_1.createFile(`Yet more content to a [[placeholder]]`);
            const ws = createWorkspace()
                .set(parser.parse(fileA.uri, fileA.content))
                .set(parser.parse(fileB.uri, fileB.content))
                .set(parser.parse(fileC.uri, fileC.content));
            const graph = graph_1.FoamGraph.fromWorkspace(ws);
            const { doc } = await test_utils_vscode_1.showInEditor(fileB.uri);
            const pos = new vscode.Position(0, 24); // Set cursor position on the link.
            const provider = new hover_provider_1.HoverProvider(hoverEnabled, ws, graph, parser);
            const result = await provider.provideHover(doc, pos, noCancelToken);
            expect(result.contents).toHaveLength(2);
            expect(result.contents[0]).toEqual(null);
            expect(getValue(result.contents[1])).toMatch(/^Also referenced in 2 notes:/);
            ws.dispose();
            graph.dispose();
        });
    });
});
//# sourceMappingURL=hover-provider.spec.js.map