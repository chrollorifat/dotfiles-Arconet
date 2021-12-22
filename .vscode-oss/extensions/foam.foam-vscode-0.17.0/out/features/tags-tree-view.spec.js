"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const test_utils_1 = require("../test/test-utils");
const test_utils_vscode_1 = require("../test/test-utils-vscode");
const tags_tree_view_1 = require("./tags-tree-view");
const foam_1 = require("../core/model/foam");
const markdown_provider_1 = require("../core/markdown-provider");
const datastore_1 = require("../core/services/datastore");
describe('Tags tree panel', () => {
    let _foam;
    let provider;
    const matcher = new datastore_1.Matcher([]);
    const mdProvider = new markdown_provider_1.MarkdownResourceProvider(matcher);
    beforeAll(async () => {
        await test_utils_vscode_1.cleanWorkspace();
    });
    afterAll(async () => {
        _foam.dispose();
        await test_utils_vscode_1.cleanWorkspace();
    });
    beforeEach(async () => {
        _foam = await foam_1.bootstrap(matcher, new datastore_1.FileDataStore(), [mdProvider]);
        provider = new tags_tree_view_1.TagsProvider(_foam, _foam.workspace);
        await test_utils_vscode_1.closeEditors();
    });
    afterEach(() => {
        _foam.dispose();
    });
    it('correctly provides a tag from a set of notes', async () => {
        const noteA = test_utils_1.createTestNote({
            tags: ['test'],
            uri: './note-a.md',
        });
        _foam.workspace.set(noteA);
        provider.refresh();
        const treeItems = (await provider.getChildren());
        treeItems.forEach(item => expect(item.tag).toContain('test'));
    });
    it('correctly handles a parent and child tag', async () => {
        const noteA = test_utils_1.createTestNote({
            tags: ['parent/child'],
            uri: './note-a.md',
        });
        _foam.workspace.set(noteA);
        provider.refresh();
        const parentTreeItems = (await provider.getChildren());
        const parentTagItem = parentTreeItems.pop();
        expect(parentTagItem.title).toEqual('parent');
        const childTreeItems = (await provider.getChildren(parentTagItem));
        childTreeItems.forEach(child => {
            if (child instanceof tags_tree_view_1.TagItem) {
                expect(child.title).toEqual('child');
            }
        });
    });
    it('correctly handles a single parent and multiple child tag', async () => {
        const noteA = test_utils_1.createTestNote({
            tags: ['parent/child'],
            uri: './note-a.md',
        });
        _foam.workspace.set(noteA);
        const noteB = test_utils_1.createTestNote({
            tags: ['parent/subchild'],
            uri: './note-b.md',
        });
        _foam.workspace.set(noteB);
        provider.refresh();
        const parentTreeItems = (await provider.getChildren());
        const parentTagItem = parentTreeItems.filter(item => item instanceof tags_tree_view_1.TagItem)[0];
        expect(parentTagItem.title).toEqual('parent');
        expect(parentTreeItems).toHaveLength(1);
        const childTreeItems = (await provider.getChildren(parentTagItem));
        childTreeItems.forEach(child => {
            if (child instanceof tags_tree_view_1.TagItem) {
                expect(['child', 'subchild']).toContain(child.title);
                expect(child.title).not.toEqual('parent');
            }
        });
        expect(childTreeItems).toHaveLength(3);
    });
    it('correctly handles a single parent and child tag in the same note', async () => {
        const noteC = test_utils_1.createTestNote({
            tags: ['main', 'main/subtopic'],
            title: 'Test note',
            uri: './note-c.md',
        });
        _foam.workspace.set(noteC);
        provider.refresh();
        const parentTreeItems = (await provider.getChildren());
        const parentTagItem = parentTreeItems.filter(item => item instanceof tags_tree_view_1.TagItem)[0];
        expect(parentTagItem.title).toEqual('main');
        const childTreeItems = (await provider.getChildren(parentTagItem));
        childTreeItems
            .filter(item => item instanceof tags_tree_view_1.TagReference)
            .forEach(item => {
            expect(item.title).toEqual('Test note');
        });
        childTreeItems
            .filter(item => item instanceof tags_tree_view_1.TagItem)
            .forEach(item => {
            expect(['main/subtopic']).toContain(item.tag);
            expect(item.title).toEqual('subtopic');
        });
        expect(childTreeItems).toHaveLength(3);
    });
});
//# sourceMappingURL=tags-tree-view.spec.js.map