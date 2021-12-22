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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.markdownItWithRemoveLinkReferences = exports.markdownItWithFoamTags = exports.markdownItWithFoamLinks = exports.markdownItWithNoteInclusion = void 0;
const markdown_it_regex_1 = __importDefault(require("markdown-it-regex"));
const vscode = __importStar(require("vscode"));
const utils_1 = require("../utils");
const log_1 = require("../core/utils/log");
const vsc_utils_1 = require("../utils/vsc-utils");
const note_1 = require("../core/model/note");
const ALIAS_DIVIDER_CHAR = '|';
const refsStack = [];
const feature = {
    activate: async (_context, foamPromise) => {
        const foam = await foamPromise;
        return {
            extendMarkdownIt: (md) => {
                return [
                    exports.markdownItWithFoamTags,
                    exports.markdownItWithNoteInclusion,
                    exports.markdownItWithFoamLinks,
                    exports.markdownItWithRemoveLinkReferences,
                ].reduce((acc, extension) => extension(acc, foam.workspace), md);
            },
        };
    },
};
exports.markdownItWithNoteInclusion = (md, workspace) => {
    return md.use(markdown_it_regex_1.default, {
        name: 'include-notes',
        regex: /!\[\[([^[\]]+?)\]\]/,
        replace: (wikilink) => {
            try {
                const includedNote = workspace.find(wikilink);
                if (!includedNote) {
                    return `![[${wikilink}]]`;
                }
                const cyclicLinkDetected = refsStack.includes(includedNote.uri.path.toLocaleLowerCase());
                if (!cyclicLinkDetected) {
                    refsStack.push(includedNote.uri.path.toLocaleLowerCase());
                }
                if (cyclicLinkDetected) {
                    return `<div class="foam-cyclic-link-warning">Cyclic link detected for wikilink: ${wikilink}</div>`;
                }
                else {
                    let content = includedNote.source.text;
                    const section = note_1.Resource.findSection(includedNote, includedNote.uri.fragment);
                    if (utils_1.isSome(section)) {
                        const rows = content.split('\n');
                        content = rows
                            .slice(section.range.start.line, section.range.end.line)
                            .join('\n');
                    }
                    const html = md.render(content);
                    refsStack.pop();
                    return html;
                }
            }
            catch (e) {
                log_1.Logger.error(`Error while including [[${wikilink}]] into the current document of the Preview panel`, e);
                return '';
            }
        },
    });
};
exports.markdownItWithFoamLinks = (md, workspace) => {
    return md.use(markdown_it_regex_1.default, {
        name: 'connect-wikilinks',
        regex: /\[\[([^[\]]+?)\]\]/,
        replace: (wikilink) => {
            try {
                const linkHasAlias = wikilink.includes(ALIAS_DIVIDER_CHAR);
                const resourceLink = linkHasAlias
                    ? wikilink.substring(0, wikilink.indexOf('|'))
                    : wikilink;
                const resource = workspace.find(resourceLink);
                if (utils_1.isNone(resource)) {
                    return getPlaceholderLink(resourceLink);
                }
                const linkLabel = linkHasAlias
                    ? wikilink.substr(wikilink.indexOf('|') + 1)
                    : wikilink;
                const link = vscode.workspace.asRelativePath(vsc_utils_1.toVsCodeUri(resource.uri));
                return `<a class='foam-note-link' title='${resource.title}' href='/${link}' data-href='/${link}'>${linkLabel}</a>`;
            }
            catch (e) {
                log_1.Logger.error(`Error while creating link for [[${wikilink}]] in Preview panel`, e);
                return getPlaceholderLink(wikilink);
            }
        },
    });
};
const getPlaceholderLink = (content) => `<a class='foam-placeholder-link' title="Link to non-existing resource" href="javascript:void(0);">${content}</a>`;
exports.markdownItWithFoamTags = (md, workspace) => {
    return md.use(markdown_it_regex_1.default, {
        name: 'foam-tags',
        regex: /(?<=^|\s)(#[0-9]*[\p{L}/_-][\p{L}\p{N}/_-]*)/u,
        replace: (tag) => {
            try {
                const resource = workspace.find(tag);
                if (utils_1.isNone(resource)) {
                    return getFoamTag(tag);
                }
            }
            catch (e) {
                log_1.Logger.error(`Error while creating link for ${tag} in Preview panel`, e);
                return getFoamTag(tag);
            }
        },
    });
};
const getFoamTag = (content) => `<span class='foam-tag'>${content}</span>`;
exports.markdownItWithRemoveLinkReferences = (md, workspace) => {
    md.inline.ruler.before('link', 'clear-references', state => {
        if (state.env.references) {
            Object.keys(state.env.references).forEach(refKey => {
                // Forget about reference links that contain an alias divider
                // Aliased reference links will lead the MarkdownParser to include wrong link references
                if (refKey.includes(ALIAS_DIVIDER_CHAR)) {
                    delete state.env.references[refKey];
                }
                // When the reference is present due to an inclusion of that note, we
                // need to remove that reference. This ensures the MarkdownIt parser
                // will not replace the wikilink syntax with an <a href> link and as a result
                // break our inclusion logic.
                if (state.src.toLowerCase().includes(`![[${refKey.toLowerCase()}]]`)) {
                    delete state.env.references[refKey];
                }
            });
        }
        return false;
    });
    return md;
};
exports.default = feature;
//# sourceMappingURL=preview-navigation.js.map