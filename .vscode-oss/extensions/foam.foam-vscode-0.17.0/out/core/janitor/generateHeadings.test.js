"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require(".");
const test_utils_1 = require("../../test/test-utils");
const markdown_provider_1 = require("../markdown-provider");
const foam_1 = require("../model/foam");
const range_1 = require("../model/range");
const uri_1 = require("../model/uri");
const datastore_1 = require("../services/datastore");
const log_1 = require("../utils/log");
log_1.Logger.setLevel('error');
describe('generateHeadings', () => {
    let _workspace;
    const findBySlug = (slug) => {
        return _workspace
            .list()
            .find(res => uri_1.URI.getBasename(res.uri) === slug);
    };
    beforeAll(async () => {
        const matcher = new datastore_1.Matcher([uri_1.URI.joinPath(test_utils_1.TEST_DATA_DIR, '__scaffold__')]);
        const mdProvider = new markdown_provider_1.MarkdownResourceProvider(matcher);
        const foam = await foam_1.bootstrap(matcher, new datastore_1.FileDataStore(), [mdProvider]);
        _workspace = foam.workspace;
    });
    it.skip('should add heading to a file that does not have them', () => {
        const note = findBySlug('file-without-title');
        const expected = {
            newText: `# File without Title

`,
            range: range_1.Range.create(0, 0, 0, 0),
        };
        const actual = _1.generateHeading(note);
        expect(actual.range.start).toEqual(expected.range.start);
        expect(actual.range.end).toEqual(expected.range.end);
        expect(actual.newText).toEqual(expected.newText);
    });
    it('should not cause any changes to a file that has a heading', () => {
        const note = findBySlug('index');
        expect(_1.generateHeading(note)).toBeNull();
    });
    it.skip('should generate heading when the file only contains frontmatter', () => {
        const note = findBySlug('file-with-only-frontmatter');
        const expected = {
            newText: '\n# File with only Frontmatter\n\n',
            range: range_1.Range.create(3, 0, 3, 0),
        };
        const actual = _1.generateHeading(note);
        expect(actual.range.start).toEqual(expected.range.start);
        expect(actual.range.end).toEqual(expected.range.end);
        expect(actual.newText).toEqual(expected.newText);
    });
});
//# sourceMappingURL=generateHeadings.test.js.map