"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const test_utils_1 = require("../../test/test-utils");
const tags_1 = require("./tags");
describe('FoamTags', () => {
    it('Collects tags from a list of resources', () => {
        const ws = test_utils_1.createTestWorkspace();
        const pageA = test_utils_1.createTestNote({
            uri: '/page-a.md',
            title: 'Page A',
            links: [{ slug: 'placeholder-link' }],
            tags: ['primary', 'secondary'],
        });
        const pageB = test_utils_1.createTestNote({
            uri: '/page-b.md',
            title: 'Page B',
            links: [{ slug: 'placeholder-link' }],
            tags: ['primary', 'third'],
        });
        ws.set(pageA);
        ws.set(pageB);
        const tags = tags_1.FoamTags.fromWorkspace(ws);
        expect(tags.tags).toEqual(new Map([
            ['primary', [pageA.uri, pageB.uri]],
            ['secondary', [pageA.uri]],
            ['third', [pageB.uri]],
        ]));
    });
    it('Updates an existing tag when a note is tagged with an existing tag', () => {
        const ws = test_utils_1.createTestWorkspace();
        const page = test_utils_1.createTestNote({
            uri: '/page-a.md',
            title: 'Page A',
            links: [{ slug: 'placeholder-link' }],
            tags: ['primary'],
        });
        const taglessPage = test_utils_1.createTestNote({
            uri: '/page-b.md',
            title: 'Page B',
        });
        ws.set(page);
        ws.set(taglessPage);
        const tags = tags_1.FoamTags.fromWorkspace(ws);
        expect(tags.tags).toEqual(new Map([['primary', [page.uri]]]));
        const newPage = test_utils_1.createTestNote({
            uri: '/page-b.md',
            title: 'Page B',
            tags: ['primary'],
        });
        tags.updateResourceWithinTagIndex(taglessPage, newPage);
        expect(tags.tags).toEqual(new Map([['primary', [page.uri, newPage.uri]]]));
    });
    it('Replaces the tag when a note is updated with an altered tag', () => {
        const ws = test_utils_1.createTestWorkspace();
        const page = test_utils_1.createTestNote({
            uri: '/page-a.md',
            title: 'Page A',
            links: [{ slug: 'placeholder-link' }],
            tags: ['primary'],
        });
        ws.set(page);
        const tags = tags_1.FoamTags.fromWorkspace(ws);
        expect(tags.tags).toEqual(new Map([['primary', [page.uri]]]));
        const pageEdited = test_utils_1.createTestNote({
            uri: '/page-a.md',
            title: 'Page A',
            links: [{ slug: 'placeholder-link' }],
            tags: ['new'],
        });
        tags.updateResourceWithinTagIndex(page, pageEdited);
        expect(tags.tags).toEqual(new Map([['new', [page.uri]]]));
    });
    it('Updates the metadata of a tag when the note is moved', () => {
        const ws = test_utils_1.createTestWorkspace();
        const page = test_utils_1.createTestNote({
            uri: '/page-a.md',
            title: 'Page A',
            links: [{ slug: 'placeholder-link' }],
            tags: ['primary'],
        });
        ws.set(page);
        const tags = tags_1.FoamTags.fromWorkspace(ws);
        expect(tags.tags).toEqual(new Map([['primary', [page.uri]]]));
        const pageEdited = test_utils_1.createTestNote({
            uri: '/new-place/page-a.md',
            title: 'Page A',
            links: [{ slug: 'placeholder-link' }],
            tags: ['primary'],
        });
        tags.updateResourceWithinTagIndex(page, pageEdited);
        expect(tags.tags).toEqual(new Map([['primary', [pageEdited.uri]]]));
    });
    it('Updates the metadata of a tag when a note is delete', () => {
        const ws = test_utils_1.createTestWorkspace();
        const page = test_utils_1.createTestNote({
            uri: '/page-a.md',
            title: 'Page A',
            links: [{ slug: 'placeholder-link' }],
            tags: ['primary'],
        });
        ws.set(page);
        const tags = tags_1.FoamTags.fromWorkspace(ws);
        expect(tags.tags).toEqual(new Map([['primary', [page.uri]]]));
        tags.removeResourceFromTagIndex(page);
        expect(tags.tags).toEqual(new Map());
    });
});
//# sourceMappingURL=tags.test.js.map