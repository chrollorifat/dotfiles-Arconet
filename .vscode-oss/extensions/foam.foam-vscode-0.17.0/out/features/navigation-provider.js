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
exports.NavigationProvider = void 0;
const vscode = __importStar(require("vscode"));
const utils_1 = require("../utils");
const vsc_utils_1 = require("../utils/vsc-utils");
const utility_commands_1 = require("./utility-commands");
const note_1 = require("../core/model/note");
const uri_1 = require("../core/model/uri");
const range_1 = require("../core/model/range");
const feature = {
    activate: async (context, foamPromise) => {
        const foam = await foamPromise;
        const navigationProvider = new NavigationProvider(foam.workspace, foam.graph, foam.services.parser);
        context.subscriptions.push(vscode.languages.registerDefinitionProvider(utils_1.mdDocSelector, navigationProvider), vscode.languages.registerDocumentLinkProvider(utils_1.mdDocSelector, navigationProvider), vscode.languages.registerReferenceProvider(utils_1.mdDocSelector, navigationProvider));
    },
};
/**
 * Provides navigation and references for Foam links.
 * - We create definintions for existing wikilinks but not placeholders
 * - We create links for both
 * - We create references for both
 *
 * Placeholders are created as links so that when clicking on them a new note will be created.
 * Definitions are automatically invoked by VS Code on hover, whereas links require
 * the user to explicitly clicking - and we want the note creation to be explicit.
 *
 * Also see https://github.com/foambubble/foam/pull/724
 */
class NavigationProvider {
    constructor(workspace, graph, parser) {
        this.workspace = workspace;
        this.graph = graph;
        this.parser = parser;
    }
    /**
     * Provide references for links and placholders
     */
    provideReferences(document, position) {
        const resource = this.parser.parse(document.uri, document.getText());
        const targetLink = resource.links.find(link => range_1.Range.containsPosition(link.range, position));
        if (!targetLink) {
            return;
        }
        const uri = this.workspace.resolveLink(resource, targetLink);
        return this.graph.getBacklinks(uri).map(connection => {
            return new vscode.Location(vsc_utils_1.toVsCodeUri(connection.source), vsc_utils_1.toVsCodeRange(connection.link.range));
        });
    }
    /**
     * Create definitions for resolved links
     */
    provideDefinition(document, position) {
        const resource = this.parser.parse(document.uri, document.getText());
        const targetLink = resource.links.find(link => range_1.Range.containsPosition(link.range, position));
        if (!targetLink) {
            return;
        }
        const uri = this.workspace.resolveLink(resource, targetLink);
        if (uri_1.URI.isPlaceholder(uri)) {
            return;
        }
        const targetResource = this.workspace.get(uri);
        let targetRange = range_1.Range.createFromPosition(targetResource.source.contentStart, targetResource.source.end);
        const section = note_1.Resource.findSection(targetResource, uri.fragment);
        if (section) {
            targetRange = section.range;
        }
        const result = {
            originSelectionRange: vsc_utils_1.toVsCodeRange(targetLink.range),
            targetUri: vsc_utils_1.toVsCodeUri(uri),
            targetRange: vsc_utils_1.toVsCodeRange(targetRange),
            targetSelectionRange: vsc_utils_1.toVsCodeRange(range_1.Range.createFromPosition(targetRange.start, targetRange.start)),
        };
        return [result];
    }
    /**
     * Create links for wikilinks and placeholders
     */
    provideDocumentLinks(document) {
        const resource = this.parser.parse(document.uri, document.getText());
        const targets = resource.links.map(link => ({
            link,
            target: this.workspace.resolveLink(resource, link),
        }));
        return targets.map(o => {
            const command = utility_commands_1.OPEN_COMMAND.asURI(vsc_utils_1.toVsCodeUri(o.target));
            const documentLink = new vscode.DocumentLink(vsc_utils_1.toVsCodeRange(o.link.range), command);
            documentLink.tooltip = uri_1.URI.isPlaceholder(o.target)
                ? `Create note for '${o.target.path}'`
                : `Go to ${uri_1.URI.toFsPath(o.target)}`;
            return documentLink;
        });
    }
}
exports.NavigationProvider = NavigationProvider;
exports.default = feature;
//# sourceMappingURL=navigation-provider.js.map