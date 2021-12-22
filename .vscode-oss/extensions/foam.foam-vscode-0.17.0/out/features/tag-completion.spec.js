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
const tags_1 = require("../core/model/tags");
const workspace_1 = require("../core/model/workspace");
const test_utils_1 = require("../test/test-utils");
const test_utils_vscode_1 = require("../test/test-utils-vscode");
const vsc_utils_1 = require("../utils/vsc-utils");
const tag_completion_1 = require("./tag-completion");
describe('Tag Completion', () => {
    const root = vsc_utils_1.fromVsCodeUri(vscode.workspace.workspaceFolders[0].uri);
    const ws = new workspace_1.FoamWorkspace();
    ws.set(test_utils_1.createTestNote({
        root,
        uri: 'file-name.md',
        tags: ['primary'],
    }))
        .set(test_utils_1.createTestNote({
        root,
        uri: 'File name with spaces.md',
        tags: ['secondary'],
    }))
        .set(test_utils_1.createTestNote({
        root,
        uri: 'path/to/file.md',
        links: [{ slug: 'placeholder text' }],
        tags: ['primary', 'third'],
    }));
    const foamTags = tags_1.FoamTags.fromWorkspace(ws);
    beforeAll(async () => {
        await test_utils_vscode_1.cleanWorkspace();
    });
    afterAll(async () => {
        ws.dispose();
        foamTags.dispose();
        await test_utils_vscode_1.cleanWorkspace();
    });
    beforeEach(async () => {
        await test_utils_vscode_1.closeEditors();
    });
    it('should not return any tags for empty documents', async () => {
        const { uri } = await test_utils_vscode_1.createFile('');
        const { doc } = await test_utils_vscode_1.showInEditor(uri);
        const provider = new tag_completion_1.TagCompletionProvider(foamTags);
        const tags = await provider.provideCompletionItems(doc, new vscode.Position(0, 0));
        expect(foamTags.tags.get('primary')).toBeTruthy();
        expect(tags).toBeNull();
    });
    it('should provide a suggestion when typing #prim', async () => {
        const { uri } = await test_utils_vscode_1.createFile('#prim');
        const { doc } = await test_utils_vscode_1.showInEditor(uri);
        const provider = new tag_completion_1.TagCompletionProvider(foamTags);
        const tags = await provider.provideCompletionItems(doc, new vscode.Position(0, 5));
        expect(foamTags.tags.get('primary')).toBeTruthy();
        expect(tags.items.length).toEqual(3);
    });
    it('should not provide suggestions when inside a wikilink', async () => {
        const { uri } = await test_utils_vscode_1.createFile('[[#prim');
        const { doc } = await test_utils_vscode_1.showInEditor(uri);
        const provider = new tag_completion_1.TagCompletionProvider(foamTags);
        const tags = await provider.provideCompletionItems(doc, new vscode.Position(0, 7));
        expect(foamTags.tags.get('primary')).toBeTruthy();
        expect(tags).toBeNull();
    });
});
//# sourceMappingURL=tag-completion.spec.js.map