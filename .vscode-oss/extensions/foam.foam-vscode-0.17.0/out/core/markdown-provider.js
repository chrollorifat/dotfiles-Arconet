"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMarkdownReferences = exports.stringifyMarkdownLinkReferenceDefinition = exports.createMarkdownParser = exports.MarkdownResourceProvider = void 0;
const unified_1 = __importDefault(require("unified"));
const remark_parse_1 = __importDefault(require("remark-parse"));
const remark_wiki_link_1 = __importDefault(require("remark-wiki-link"));
const remark_frontmatter_1 = __importDefault(require("remark-frontmatter"));
const yaml_1 = require("yaml");
const unist_util_visit_1 = __importDefault(require("unist-util-visit"));
const detect_newline_1 = __importDefault(require("detect-newline"));
const os_1 = __importDefault(require("os"));
const note_1 = require("./model/note");
const position_1 = require("./model/position");
const range_1 = require("./model/range");
const utils_1 = require("./utils");
const log_1 = require("./utils/log");
const uri_1 = require("./model/uri");
const datastore_1 = require("./services/datastore");
const ALIAS_DIVIDER_CHAR = '|';
class MarkdownResourceProvider {
    constructor(matcher, watcherInit, parser = createMarkdownParser([]), dataStore = new datastore_1.FileDataStore()) {
        this.matcher = matcher;
        this.watcherInit = watcherInit;
        this.parser = parser;
        this.dataStore = dataStore;
        this.disposables = [];
    }
    async init(workspace) {
        var _a, _b;
        const filesByFolder = await Promise.all(this.matcher.include.map(glob => this.dataStore.list(glob, this.matcher.exclude)));
        const files = this.matcher
            .match(filesByFolder.flat())
            .filter(this.supports);
        await Promise.all(files.map(async (uri) => {
            log_1.Logger.info('Found: ' + uri_1.URI.toString(uri));
            const content = await this.dataStore.read(uri);
            if (utils_1.isSome(content)) {
                workspace.set(this.parser.parse(uri, content));
            }
        }));
        this.disposables = (_b = (_a = this.watcherInit) === null || _a === void 0 ? void 0 : _a.call(this, {
            onDidChange: async (uri) => {
                if (this.matcher.isMatch(uri) && this.supports(uri)) {
                    const content = await this.dataStore.read(uri);
                    utils_1.isSome(content) &&
                        workspace.set(await this.parser.parse(uri, content));
                }
            },
            onDidCreate: async (uri) => {
                if (this.matcher.isMatch(uri) && this.supports(uri)) {
                    const content = await this.dataStore.read(uri);
                    utils_1.isSome(content) &&
                        workspace.set(await this.parser.parse(uri, content));
                }
            },
            onDidDelete: uri => {
                this.supports(uri) && workspace.delete(uri);
            },
        })) !== null && _b !== void 0 ? _b : [];
    }
    supports(uri) {
        return uri_1.URI.isMarkdownFile(uri);
    }
    read(uri) {
        return this.dataStore.read(uri);
    }
    async readAsMarkdown(uri) {
        let content = await this.dataStore.read(uri);
        if (utils_1.isSome(content) && uri.fragment) {
            const resource = this.parser.parse(uri, content);
            const section = note_1.Resource.findSection(resource, uri.fragment);
            if (utils_1.isSome(section)) {
                const rows = content.split('\n');
                content = rows
                    .slice(section.range.start.line, section.range.end.line)
                    .join('\n');
            }
        }
        return content;
    }
    async fetch(uri) {
        const content = await this.read(uri);
        return utils_1.isSome(content) ? this.parser.parse(uri, content) : null;
    }
    resolveLink(workspace, resource, link) {
        var _a, _b, _c, _d, _e, _f, _g;
        let targetUri;
        switch (link.type) {
            case 'wikilink':
                const definitionUri = (_a = resource.definitions.find(def => def.label === link.target)) === null || _a === void 0 ? void 0 : _a.url;
                if (utils_1.isSome(definitionUri)) {
                    const definedUri = uri_1.URI.resolve(definitionUri, resource.uri);
                    targetUri = (_c = (_b = workspace.find(definedUri, resource.uri)) === null || _b === void 0 ? void 0 : _b.uri) !== null && _c !== void 0 ? _c : uri_1.URI.placeholder(definedUri.path);
                }
                else {
                    const [target, section] = link.target.split('#');
                    targetUri =
                        target === ''
                            ? resource.uri
                            : (_e = (_d = workspace.find(target, resource.uri)) === null || _d === void 0 ? void 0 : _d.uri) !== null && _e !== void 0 ? _e : uri_1.URI.placeholder(link.target);
                    if (section) {
                        targetUri = uri_1.URI.withFragment(targetUri, section);
                    }
                }
                break;
            case 'link':
                const [target, section] = link.target.split('#');
                targetUri = (_g = (_f = workspace.find(target, resource.uri)) === null || _f === void 0 ? void 0 : _f.uri) !== null && _g !== void 0 ? _g : uri_1.URI.placeholder(uri_1.URI.resolve(link.target, resource.uri).path);
                if (section && !uri_1.URI.isPlaceholder(targetUri)) {
                    targetUri = uri_1.URI.withFragment(targetUri, section);
                }
                break;
        }
        return targetUri;
    }
    dispose() {
        this.disposables.forEach(d => d.dispose());
    }
}
exports.MarkdownResourceProvider = MarkdownResourceProvider;
/**
 * Traverses all the children of the given node, extracts
 * the text from them, and returns it concatenated.
 *
 * @param root the node from which to start collecting text
 */
const getTextFromChildren = (root) => {
    let text = '';
    unist_util_visit_1.default(root, 'text', node => {
        if (node.type === 'text') {
            text = text + node.value;
        }
    });
    return text;
};
const tagsPlugin = {
    name: 'tags',
    onDidFindProperties: (props, note, node) => {
        if (utils_1.isSome(props.tags)) {
            const yamlTags = utils_1.extractTagsFromProp(props.tags);
            yamlTags.forEach(t => {
                note.tags.push({
                    label: t,
                    range: astPositionToFoamRange(node.position),
                });
            });
        }
    },
    visit: (node, note) => {
        if (node.type === 'text') {
            const tags = utils_1.extractHashtags(node.value);
            tags.forEach(tag => {
                let start = astPointToFoamPosition(node.position.start);
                start.character = start.character + tag.offset;
                const end = {
                    line: start.line,
                    character: start.character + tag.label.length + 1,
                };
                note.tags.push({
                    label: tag.label,
                    range: range_1.Range.createFromPosition(start, end),
                });
            });
        }
    },
};
let sectionStack = [];
const sectionsPlugin = {
    name: 'section',
    onWillVisitTree: () => {
        sectionStack = [];
    },
    visit: (node, note) => {
        var _a, _b;
        if (node.type === 'heading') {
            const level = node.depth;
            const label = (_b = (_a = node.children) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.value;
            if (!label || !level) {
                return;
            }
            const start = astPositionToFoamRange(node.position).start;
            // Close all the sections that are not parents of the current section
            while (sectionStack.length > 0 &&
                sectionStack[sectionStack.length - 1].level >= level) {
                const section = sectionStack.pop();
                note.sections.push({
                    label: section.label,
                    range: range_1.Range.createFromPosition(section.start, start),
                });
            }
            // Add the new section to the stack
            sectionStack.push({ label, level, start });
        }
    },
    onDidVisitTree: (tree, note) => {
        const end = position_1.Position.create(note.source.end.line + 1, 0);
        // Close all the remainig sections
        while (sectionStack.length > 0) {
            const section = sectionStack.pop();
            note.sections.push({
                label: section.label,
                range: { start: section.start, end },
            });
        }
        note.sections.sort((a, b) => position_1.Position.compareTo(a.range.start, b.range.start));
    },
};
const titlePlugin = {
    name: 'title',
    visit: (node, note) => {
        var _a, _b;
        if (note.title === '' &&
            node.type === 'heading' &&
            node.depth === 1) {
            note.title =
                ((_b = (_a = node.children) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.value) || note.title;
        }
    },
    onDidFindProperties: (props, note) => {
        var _a, _b;
        // Give precendence to the title from the frontmatter if it exists
        note.title = (_b = (_a = props.title) === null || _a === void 0 ? void 0 : _a.toString()) !== null && _b !== void 0 ? _b : note.title;
    },
    onDidVisitTree: (tree, note) => {
        if (note.title === '') {
            note.title = uri_1.URI.getBasename(note.uri);
        }
    },
};
const wikilinkPlugin = {
    name: 'wikilink',
    visit: (node, note, noteSource) => {
        var _a;
        if (node.type === 'wikiLink') {
            const text = node.value;
            const alias = (_a = node.data) === null || _a === void 0 ? void 0 : _a.alias;
            const literalContent = noteSource.substring(node.position.start.offset, node.position.end.offset);
            const hasAlias = literalContent !== text && literalContent.includes(ALIAS_DIVIDER_CHAR);
            note.links.push({
                type: 'wikilink',
                rawText: literalContent,
                label: hasAlias
                    ? alias.trim()
                    : literalContent.substring(2, literalContent.length - 2),
                target: hasAlias
                    ? literalContent
                        .substring(2, literalContent.indexOf(ALIAS_DIVIDER_CHAR))
                        .replace(/\\/g, '')
                        .trim()
                    : text.trim(),
                range: astPositionToFoamRange(node.position),
            });
        }
        if (node.type === 'link') {
            const targetUri = node.url;
            const uri = uri_1.URI.resolve(targetUri, note.uri);
            if (uri.scheme !== 'file' || uri.path === note.uri.path) {
                return;
            }
            const label = getTextFromChildren(node);
            note.links.push({
                type: 'link',
                target: targetUri,
                label: label,
                range: astPositionToFoamRange(node.position),
            });
        }
    },
};
const definitionsPlugin = {
    name: 'definitions',
    visit: (node, note) => {
        if (node.type === 'definition') {
            note.definitions.push({
                label: node.label,
                url: node.url,
                title: node.title,
                range: astPositionToFoamRange(node.position),
            });
        }
    },
    onDidVisitTree: (tree, note) => {
        note.definitions = getFoamDefinitions(note.definitions, note.source.end);
    },
};
const handleError = (plugin, fnName, uri, e) => {
    const name = plugin.name || '';
    log_1.Logger.warn(`Error while executing [${fnName}] in plugin [${name}]. ${uri ? 'for file [' + uri_1.URI.toString(uri) : ']'}.`, e);
};
function createMarkdownParser(extraPlugins) {
    const parser = unified_1.default()
        .use(remark_parse_1.default, { gfm: true })
        .use(remark_frontmatter_1.default, ['yaml'])
        .use(remark_wiki_link_1.default, { aliasDivider: ALIAS_DIVIDER_CHAR });
    const plugins = [
        titlePlugin,
        wikilinkPlugin,
        definitionsPlugin,
        tagsPlugin,
        sectionsPlugin,
        ...extraPlugins,
    ];
    plugins.forEach(plugin => {
        var _a;
        try {
            (_a = plugin.onDidInitializeParser) === null || _a === void 0 ? void 0 : _a.call(plugin, parser);
        }
        catch (e) {
            handleError(plugin, 'onDidInitializeParser', undefined, e);
        }
    });
    const foamParser = {
        parse: (uri, markdown) => {
            log_1.Logger.debug('Parsing:', uri_1.URI.toString(uri));
            markdown = plugins.reduce((acc, plugin) => {
                var _a;
                try {
                    return ((_a = plugin.onWillParseMarkdown) === null || _a === void 0 ? void 0 : _a.call(plugin, acc)) || acc;
                }
                catch (e) {
                    handleError(plugin, 'onWillParseMarkdown', uri, e);
                    return acc;
                }
            }, markdown);
            const tree = parser.parse(markdown);
            const eol = detect_newline_1.default(markdown) || os_1.default.EOL;
            var note = {
                uri: uri,
                type: 'note',
                properties: {},
                title: '',
                sections: [],
                tags: [],
                links: [],
                definitions: [],
                source: {
                    text: markdown,
                    contentStart: astPointToFoamPosition(tree.position.start),
                    end: astPointToFoamPosition(tree.position.end),
                    eol: eol,
                },
            };
            plugins.forEach(plugin => {
                var _a;
                try {
                    (_a = plugin.onWillVisitTree) === null || _a === void 0 ? void 0 : _a.call(plugin, tree, note);
                }
                catch (e) {
                    handleError(plugin, 'onWillVisitTree', uri, e);
                }
            });
            unist_util_visit_1.default(tree, node => {
                var _a, _b, _c, _d, _e;
                if (node.type === 'yaml') {
                    try {
                        const yamlProperties = (_a = yaml_1.parse(node.value)) !== null && _a !== void 0 ? _a : {};
                        note.properties = {
                            ...note.properties,
                            ...yamlProperties,
                        };
                        // Update the start position of the note by exluding the metadata
                        note.source.contentStart = position_1.Position.create(node.position.end.line + 2, 0);
                        for (let i = 0, len = plugins.length; i < len; i++) {
                            try {
                                (_c = (_b = plugins[i]).onDidFindProperties) === null || _c === void 0 ? void 0 : _c.call(_b, yamlProperties, note, node);
                            }
                            catch (e) {
                                handleError(plugins[i], 'onDidFindProperties', uri, e);
                            }
                        }
                    }
                    catch (e) {
                        log_1.Logger.warn(`Error while parsing YAML for [${uri_1.URI.toString(uri)}]`, e);
                    }
                }
                for (let i = 0, len = plugins.length; i < len; i++) {
                    try {
                        (_e = (_d = plugins[i]).visit) === null || _e === void 0 ? void 0 : _e.call(_d, node, note, markdown);
                    }
                    catch (e) {
                        handleError(plugins[i], 'visit', uri, e);
                    }
                }
            });
            plugins.forEach(plugin => {
                var _a;
                try {
                    (_a = plugin.onDidVisitTree) === null || _a === void 0 ? void 0 : _a.call(plugin, tree, note);
                }
                catch (e) {
                    handleError(plugin, 'onDidVisitTree', uri, e);
                }
            });
            log_1.Logger.debug('Result:', note);
            return note;
        },
    };
    return foamParser;
}
exports.createMarkdownParser = createMarkdownParser;
function getFoamDefinitions(defs, fileEndPoint) {
    let previousLine = fileEndPoint.line;
    let foamDefinitions = [];
    // walk through each definition in reverse order
    // (last one first)
    for (const def of defs.reverse()) {
        // if this definition is more than 2 lines above the
        // previous one below it (or file end), that means we
        // have exited the trailing definition block, and should bail
        const start = def.range.start.line;
        if (start < previousLine - 2) {
            break;
        }
        foamDefinitions.unshift(def);
        previousLine = def.range.end.line;
    }
    return foamDefinitions;
}
function stringifyMarkdownLinkReferenceDefinition(definition) {
    let url = definition.url.indexOf(' ') > 0 ? `<${definition.url}>` : definition.url;
    let text = `[${definition.label}]: ${url}`;
    if (definition.title) {
        text = `${text} "${definition.title}"`;
    }
    return text;
}
exports.stringifyMarkdownLinkReferenceDefinition = stringifyMarkdownLinkReferenceDefinition;
function createMarkdownReferences(workspace, noteUri, includeExtension) {
    const source = workspace.find(noteUri);
    // Should never occur since we're already in a file,
    if ((source === null || source === void 0 ? void 0 : source.type) !== 'note') {
        console.warn(`Note ${uri_1.URI.toString(noteUri)} note found in workspace when attempting to generate markdown reference list`);
        return [];
    }
    return source.links
        .filter(isWikilink)
        .map(link => {
        const targetUri = workspace.resolveLink(source, link);
        const target = workspace.find(targetUri);
        if (utils_1.isNone(target)) {
            log_1.Logger.warn(`Link ${uri_1.URI.toString(targetUri)} in ${uri_1.URI.toString(noteUri)} is not valid.`);
            return null;
        }
        if (target.type === 'placeholder') {
            // no need to create definitions for placeholders
            return null;
        }
        const relativePath = uri_1.URI.relativePath(noteUri, target.uri);
        const pathToNote = includeExtension
            ? relativePath
            : utils_1.dropExtension(relativePath);
        // [wikilink-text]: path/to/file.md "Page title"
        return {
            label: link.rawText.indexOf('[[') > -1
                ? link.rawText.substring(2, link.rawText.length - 2)
                : link.rawText || link.label,
            url: pathToNote,
            title: target.title,
        };
    })
        .filter(utils_1.isSome)
        .sort();
}
exports.createMarkdownReferences = createMarkdownReferences;
/**
 * Converts the 1-index Point object into the VS Code 0-index Position object
 * @param point ast Point (1-indexed)
 * @returns Foam Position  (0-indexed)
 */
const astPointToFoamPosition = (point) => {
    return position_1.Position.create(point.line - 1, point.column - 1);
};
/**
 * Converts the 1-index Position object into the VS Code 0-index Range object
 * @param position an ast Position object (1-indexed)
 * @returns Foam Range  (0-indexed)
 */
const astPositionToFoamRange = (pos) => range_1.Range.create(pos.start.line - 1, pos.start.column - 1, pos.end.line - 1, pos.end.column - 1);
const isWikilink = (link) => {
    return link.type === 'wikilink';
};
//# sourceMappingURL=markdown-provider.js.map