"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./index");
const log_1 = require("./log");
log_1.Logger.setLevel('error');
describe('hashtag extraction', () => {
    it('returns empty list if no tags are present', () => {
        expect(index_1.extractHashtags('hello world')).toEqual([]);
    });
    it('works with simple strings', () => {
        expect(index_1.extractHashtags('hello #world on #this planet').map(t => t.label)).toEqual(['world', 'this']);
    });
    it('detects the offset of the tag', () => {
        expect(index_1.extractHashtags('#hello')).toEqual([{ label: 'hello', offset: 0 }]);
        expect(index_1.extractHashtags(' #hello')).toEqual([{ label: 'hello', offset: 1 }]);
        expect(index_1.extractHashtags('to #hello')).toEqual([
            { label: 'hello', offset: 3 },
        ]);
    });
    it('works with tags at beginning or end of text', () => {
        expect(index_1.extractHashtags('#hello world on this #planet').map(t => t.label)).toEqual(['hello', 'planet']);
    });
    it('supports _ and -', () => {
        expect(index_1.extractHashtags('#hello-world on #this_planet').map(t => t.label)).toEqual(['hello-world', 'this_planet']);
    });
    it('supports nested tags', () => {
        expect(index_1.extractHashtags('#parent/child on #planet').map(t => t.label)).toEqual(['parent/child', 'planet']);
    });
    it('ignores tags that only have numbers in text', () => {
        expect(index_1.extractHashtags('this #123 tag should be ignore, but not #123four').map(t => t.label)).toEqual(['123four']);
    });
    it('supports unicode letters like Chinese charaters', () => {
        expect(index_1.extractHashtags(`
        this #tag_with_unicode_letters_汉字, pure Chinese tag like #纯中文标签 and 
        other mixed tags like #标签1 #123四 should work
      `).map(t => t.label)).toEqual([
            'tag_with_unicode_letters_汉字',
            '纯中文标签',
            '标签1',
            '123四',
        ]);
    });
    it('ignores hashes in plain text urls and links', () => {
        expect(index_1.extractHashtags(`
        test text with url https://site.com/#section1 https://site.com/home#section2 and
        https://site.com/home/#section3a
        [link](https://site.com/#section4) with [link2](https://site.com/home#section5) #control
        hello world
      `).map(t => t.label)).toEqual(['control']);
    });
    it('ignores hashes in links to sections', () => {
        expect(index_1.extractHashtags(`
      this is a wikilink to [[#section1]] in the file and a [[link#section2]] in another
      this is a [link](#section3) to a section
      `)).toEqual([]);
    });
});
//# sourceMappingURL=utils.test.js.map