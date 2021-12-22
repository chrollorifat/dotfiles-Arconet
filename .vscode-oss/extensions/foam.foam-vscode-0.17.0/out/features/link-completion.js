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
exports.CompletionProvider = exports.SectionCompletionProvider = exports.SECTION_REGEX = exports.WIKILINK_REGEX = void 0;
const vscode = __importStar(require("vscode"));
const uri_1 = require("../core/model/uri");
const utils_1 = require("../utils");
const vsc_utils_1 = require("../utils/vsc-utils");
exports.WIKILINK_REGEX = /\[\[[^\[\]]*(?!.*\]\])/;
exports.SECTION_REGEX = /\[\[([^\[\]]*#(?!.*\]\]))/;
const feature = {
    activate: async (context, foamPromise) => {
        const foam = await foamPromise;
        context.subscriptions.push(vscode.languages.registerCompletionItemProvider(utils_1.mdDocSelector, new CompletionProvider(foam.workspace, foam.graph), '['), vscode.languages.registerCompletionItemProvider(utils_1.mdDocSelector, new SectionCompletionProvider(foam.workspace), '#'));
    },
};
class SectionCompletionProvider {
    constructor(ws) {
        this.ws = ws;
    }
    provideCompletionItems(document, position) {
        const cursorPrefix = document
            .lineAt(position)
            .text.substr(0, position.character);
        // Requires autocomplete only if cursorPrefix matches `[[` that NOT ended by `]]`.
        // See https://github.com/foambubble/foam/pull/596#issuecomment-825748205 for details.
        // eslint-disable-next-line no-useless-escape
        const match = cursorPrefix.match(exports.SECTION_REGEX);
        if (!match) {
            return null;
        }
        const resourceId = match[1] === '#' ? vsc_utils_1.fromVsCodeUri(document.uri) : match[1].slice(0, -1);
        const resource = this.ws.find(resourceId);
        if (resource) {
            const items = resource.sections.map(b => {
                return new ResourceCompletionItem(b.label, vscode.CompletionItemKind.Text, uri_1.URI.withFragment(resource.uri, b.label));
            });
            return new vscode.CompletionList(items);
        }
    }
    resolveCompletionItem(item) {
        if (item instanceof ResourceCompletionItem) {
            return this.ws.readAsMarkdown(item.resourceUri).then(text => {
                item.documentation = utils_1.getNoteTooltip(text);
                return item;
            });
        }
        return item;
    }
}
exports.SectionCompletionProvider = SectionCompletionProvider;
class CompletionProvider {
    constructor(ws, graph) {
        this.ws = ws;
        this.graph = graph;
    }
    provideCompletionItems(document, position) {
        const cursorPrefix = document
            .lineAt(position)
            .text.substr(0, position.character);
        // Requires autocomplete only if cursorPrefix matches `[[` that NOT ended by `]]`.
        // See https://github.com/foambubble/foam/pull/596#issuecomment-825748205 for details.
        // eslint-disable-next-line no-useless-escape
        const requiresAutocomplete = cursorPrefix.match(exports.WIKILINK_REGEX);
        if (!requiresAutocomplete) {
            return null;
        }
        const resources = this.ws.list().map(resource => {
            const label = vscode.workspace.asRelativePath(vsc_utils_1.toVsCodeUri(resource.uri));
            const item = new ResourceCompletionItem(label, vscode.CompletionItemKind.File, resource.uri);
            item.filterText = uri_1.URI.getBasename(resource.uri);
            item.insertText = this.ws.getIdentifier(resource.uri);
            item.commitCharacters = ['#'];
            return item;
        });
        const placeholders = Array.from(this.graph.placeholders.values()).map(uri => {
            const item = new vscode.CompletionItem(uri.path, vscode.CompletionItemKind.Interface);
            item.insertText = uri.path;
            return item;
        });
        return new vscode.CompletionList([...resources, ...placeholders]);
    }
    resolveCompletionItem(item) {
        if (item instanceof ResourceCompletionItem) {
            return this.ws.readAsMarkdown(item.resourceUri).then(text => {
                item.documentation = utils_1.getNoteTooltip(text);
                return item;
            });
        }
        return item;
    }
}
exports.CompletionProvider = CompletionProvider;
/**
 * A CompletionItem related to a Resource
 */
class ResourceCompletionItem extends vscode.CompletionItem {
    constructor(label, type, resourceUri) {
        super(label, type);
        this.resourceUri = resourceUri;
    }
}
exports.default = feature;
//# sourceMappingURL=link-completion.js.map