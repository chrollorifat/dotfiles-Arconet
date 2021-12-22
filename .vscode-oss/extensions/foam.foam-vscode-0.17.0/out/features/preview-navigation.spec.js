"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const markdown_it_1 = __importDefault(require("markdown-it"));
const markdown_provider_1 = require("../core/markdown-provider");
const workspace_1 = require("../core/model/workspace");
const test_utils_1 = require("../test/test-utils");
const test_utils_vscode_1 = require("../test/test-utils-vscode");
const preview_navigation_1 = require("./preview-navigation");
describe('Link generation in preview', () => {
    const noteA = test_utils_1.createTestNote({
        uri: './path/to/note-a.md',
        // TODO: this should really just be the workspace folder, use that once #806 is fixed
        root: test_utils_vscode_1.getUriInWorkspace('just-a-ref.md'),
        title: 'My note title',
        links: [{ slug: 'placeholder' }],
    });
    const ws = new workspace_1.FoamWorkspace().set(noteA);
    const md = preview_navigation_1.markdownItWithFoamLinks(markdown_it_1.default(), ws);
    it('generates a link to a note', () => {
        expect(md.render(`[[note-a]]`)).toEqual(`<p><a class='foam-note-link' title='${noteA.title}' href='/path/to/note-a.md' data-href='/path/to/note-a.md'>note-a</a></p>\n`);
    });
    it('generates a link to a placeholder resource', () => {
        expect(md.render(`[[placeholder]]`)).toEqual(`<p><a class='foam-placeholder-link' title="Link to non-existing resource" href="javascript:void(0);">placeholder</a></p>\n`);
    });
    it('generates a placeholder link to an unknown slug', () => {
        expect(md.render(`[[random-text]]`)).toEqual(`<p><a class='foam-placeholder-link' title="Link to non-existing resource" href="javascript:void(0);">random-text</a></p>\n`);
    });
});
describe('Stylable tag generation in preview', () => {
    const md = preview_navigation_1.markdownItWithFoamTags(markdown_it_1.default(), new workspace_1.FoamWorkspace());
    it('transforms a string containing multiple tags to a stylable html element', () => {
        expect(md.render(`Lorem #ipsum dolor #sit`)).toMatch(`<p>Lorem <span class='foam-tag'>#ipsum</span> dolor <span class='foam-tag'>#sit</span></p>`);
    });
    it('transforms a string containing a tag with dash', () => {
        expect(md.render(`Lorem ipsum dolor #si-t`)).toMatch(`<p>Lorem ipsum dolor <span class='foam-tag'>#si-t</span></p>`);
    });
});
describe('Displaying included notes in preview', () => {
    it('should render an included note', () => {
        const note = test_utils_1.createTestNote({
            uri: 'note-a.md',
            text: 'This is the text of note A',
        });
        const ws = new workspace_1.FoamWorkspace().set(note);
        const md = preview_navigation_1.markdownItWithNoteInclusion(markdown_it_1.default(), ws);
        expect(md.render(`This is the root node. 

 ![[note-a]]`)).toMatch(`<p>This is the root node.</p>
<p><p>This is the text of note A</p>
</p>`);
    });
    it('should render an included section', async () => {
        // here we use createFile as the test note doesn't fill in
        // all the metadata we need
        const note = await test_utils_vscode_1.createFile(`
# Section 1
This is the first section of note D

# Section 2 
This is the second section of note D

# Section 3
This is the third section of note D
    `, ['note-e.md']);
        const parser = markdown_provider_1.createMarkdownParser([]);
        const ws = new workspace_1.FoamWorkspace().set(parser.parse(note.uri, note.content));
        const md = preview_navigation_1.markdownItWithNoteInclusion(markdown_it_1.default(), ws);
        expect(md.render(`This is the root node. 

 ![[note-e#Section 2]]`)).toMatch(`<p>This is the root node.</p>
<p><h1>Section 2</h1>
<p>This is the second section of note D</p>
</p>`);
        await test_utils_vscode_1.deleteFile(note);
    });
    it('should fallback to the bare text when the note is not found', () => {
        const md = preview_navigation_1.markdownItWithNoteInclusion(markdown_it_1.default(), new workspace_1.FoamWorkspace());
        expect(md.render(`This is the root node. ![[non-existing-note]]`)).toMatch(`<p>This is the root node. ![[non-existing-note]]</p>`);
    });
    it('should display a warning in case of cyclical inclusions', () => {
        const noteA = test_utils_1.createTestNote({
            uri: 'note-a.md',
            text: 'This is the text of note A which includes ![[note-b]]',
        });
        const noteB = test_utils_1.createTestNote({
            uri: 'note-b.md',
            text: 'This is the text of note B which includes ![[note-a]]',
        });
        const ws = new workspace_1.FoamWorkspace().set(noteA).set(noteB);
        const md = preview_navigation_1.markdownItWithNoteInclusion(markdown_it_1.default(), ws);
        expect(md.render(noteB.source.text)).toMatch(`<p>This is the text of note B which includes <p>This is the text of note A which includes <p>This is the text of note B which includes <div class="foam-cyclic-link-warning">Cyclic link detected for wikilink: note-a</div></p>
</p>
</p>
`);
    });
});
//# sourceMappingURL=preview-navigation.spec.js.map