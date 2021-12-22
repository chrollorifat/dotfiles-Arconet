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
const test_utils_1 = require("../test/test-utils");
const test_utils_vscode_1 = require("../test/test-utils-vscode");
const vsc_utils_1 = require("../utils/vsc-utils");
const link_completion_1 = require("./link-completion");
describe('Link Completion', () => {
    const parser = markdown_provider_1.createMarkdownParser([]);
    const root = vsc_utils_1.fromVsCodeUri(vscode.workspace.workspaceFolders[0].uri);
    const ws = new workspace_1.FoamWorkspace();
    ws.set(test_utils_1.createTestNote({
        root,
        uri: 'file-name.md',
        sections: ['Section One', 'Section Two'],
    }))
        .set(test_utils_1.createTestNote({
        root,
        uri: 'File name with spaces.md',
    }))
        .set(test_utils_1.createTestNote({
        root,
        uri: 'path/to/file.md',
        links: [{ slug: 'placeholder text' }],
    }))
        .set(test_utils_1.createTestNote({
        root,
        uri: 'another/file.md',
    }));
    const graph = graph_1.FoamGraph.fromWorkspace(ws);
    beforeAll(async () => {
        await test_utils_vscode_1.cleanWorkspace();
    });
    afterAll(async () => {
        ws.dispose();
        graph.dispose();
        await test_utils_vscode_1.cleanWorkspace();
    });
    beforeEach(async () => {
        await test_utils_vscode_1.closeEditors();
    });
    it('should not return any link for empty documents', async () => {
        const { uri } = await test_utils_vscode_1.createFile('');
        const { doc } = await test_utils_vscode_1.showInEditor(uri);
        const provider = new link_completion_1.CompletionProvider(ws, graph);
        const links = await provider.provideCompletionItems(doc, new vscode.Position(0, 0));
        expect(links).toBeNull();
    });
    it('should not return link outside the wikilink brackets', async () => {
        const { uri } = await test_utils_vscode_1.createFile('[[file]] then');
        const { doc } = await test_utils_vscode_1.showInEditor(uri);
        const provider = new link_completion_1.CompletionProvider(ws, graph);
        const links = await provider.provideCompletionItems(doc, new vscode.Position(0, 12));
        expect(links).toBeNull();
    });
    it('should return notes with unique identifiers, and placeholders', async () => {
        const { uri } = await test_utils_vscode_1.createFile('[[file]] [[');
        const { doc } = await test_utils_vscode_1.showInEditor(uri);
        const provider = new link_completion_1.CompletionProvider(ws, graph);
        const links = await provider.provideCompletionItems(doc, new vscode.Position(0, 11));
        expect(links.items.length).toEqual(5);
        expect(new Set(links.items.map(i => i.insertText))).toEqual(new Set([
            'to/file',
            'another/file',
            'File name with spaces',
            'file-name',
            'placeholder text',
        ]));
    });
    it('should return sections for other notes', async () => {
        const { uri } = await test_utils_vscode_1.createFile('[[file-name#');
        const { doc } = await test_utils_vscode_1.showInEditor(uri);
        const provider = new link_completion_1.SectionCompletionProvider(ws);
        const links = await provider.provideCompletionItems(doc, new vscode.Position(0, 12));
        expect(new Set(links.items.map(i => i.label))).toEqual(new Set(['Section One', 'Section Two']));
    });
    it('should return sections within the note', async () => {
        const { uri, content } = await test_utils_vscode_1.createFile(`
# Section 1

Content of section 1

# Section 2

Content of section 2

[[#
`);
        ws.set(parser.parse(uri, content));
        const { doc } = await test_utils_vscode_1.showInEditor(uri);
        const provider = new link_completion_1.SectionCompletionProvider(ws);
        const links = await provider.provideCompletionItems(doc, new vscode.Position(9, 3));
        expect(new Set(links.items.map(i => i.label))).toEqual(new Set(['Section 1', 'Section 2']));
    });
});
//# sourceMappingURL=link-completion.spec.js.map