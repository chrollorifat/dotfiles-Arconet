"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const log_1 = require("../utils/log");
const slug_1 = require("../utils/slug");
const uri_1 = require("./uri");
log_1.Logger.setLevel('error');
describe('Foam URI', () => {
    describe('URI parsing', () => {
        const base = uri_1.URI.file('/path/to/file.md');
        test.each([
            ['https://www.google.com', uri_1.URI.parse('https://www.google.com')],
            ['/path/to/a/file.md', uri_1.URI.file('/path/to/a/file.md')],
            ['../relative/file.md', uri_1.URI.file('/path/relative/file.md')],
            ['#section', uri_1.URI.withFragment(base, 'section')],
            [
                '../relative/file.md#section',
                uri_1.URI.parse('file:/path/relative/file.md#section'),
            ],
        ])('URI Parsing (%s)', (input, exp) => {
            const result = uri_1.URI.resolve(input, base);
            expect(result.scheme).toEqual(exp.scheme);
            expect(result.authority).toEqual(exp.authority);
            expect(result.path).toEqual(exp.path);
            expect(result.query).toEqual(exp.query);
            expect(result.fragment).toEqual(exp.fragment);
        });
        it('normalizes the Windows drive letter to upper case', () => {
            const upperCase = uri_1.URI.parse('file:///C:/this/is/a/Path');
            const lowerCase = uri_1.URI.parse('file:///c:/this/is/a/Path');
            expect(upperCase.path).toEqual('/C:/this/is/a/Path');
            expect(lowerCase.path).toEqual('/C:/this/is/a/Path');
            expect(uri_1.URI.toFsPath(upperCase)).toEqual('C:\\this\\is\\a\\Path');
            expect(uri_1.URI.toFsPath(lowerCase)).toEqual('C:\\this\\is\\a\\Path');
        });
        it('consistently parses file paths', () => {
            const win1 = uri_1.URI.file('c:\\this\\is\\a\\path');
            const win2 = uri_1.URI.parse('c:\\this\\is\\a\\path');
            expect(win1).toEqual(win2);
            const unix1 = uri_1.URI.file('/this/is/a/path');
            const unix2 = uri_1.URI.parse('/this/is/a/path');
            expect(unix1).toEqual(unix2);
        });
        it('correctly parses file paths', () => {
            const winUri = uri_1.URI.file('c:\\this\\is\\a\\path');
            const unixUri = uri_1.URI.file('/this/is/a/path');
            expect(winUri).toEqual(uri_1.URI.create({
                scheme: 'file',
                path: '/C:/this/is/a/path',
            }));
            expect(unixUri).toEqual(uri_1.URI.create({
                scheme: 'file',
                path: '/this/is/a/path',
            }));
        });
    });
    it('supports computing relative paths', () => {
        expect(uri_1.URI.computeRelativeURI(uri_1.URI.file('/my/file.md'), '../hello.md')).toEqual(uri_1.URI.file('/hello.md'));
        expect(uri_1.URI.computeRelativeURI(uri_1.URI.file('/my/file.md'), '../hello')).toEqual(uri_1.URI.file('/hello.md'));
        expect(uri_1.URI.computeRelativeURI(uri_1.URI.file('/my/file.markdown'), '../hello')).toEqual(uri_1.URI.file('/hello.markdown'));
    });
    it('can be slugified', () => {
        expect(slug_1.uriToSlug(uri_1.URI.file('/this/is/a/path.md'))).toEqual('path');
        expect(slug_1.uriToSlug(uri_1.URI.file('../a/relative/path.md'))).toEqual('path');
        expect(slug_1.uriToSlug(uri_1.URI.file('another/relative/path.md'))).toEqual('path');
        expect(slug_1.uriToSlug(uri_1.URI.file('no-directory.markdown'))).toEqual('no-directory');
        expect(slug_1.uriToSlug(uri_1.URI.file('many.dots.name.markdown'))).toEqual('manydotsname');
    });
});
//# sourceMappingURL=uri.test.js.map