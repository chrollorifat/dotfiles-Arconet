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
exports.HoverProvider = exports.CONFIG_KEY = void 0;
const lodash_1 = require("lodash");
const vscode = __importStar(require("vscode"));
const uri_1 = require("../core/model/uri");
const utils_1 = require("../utils");
const vsc_utils_1 = require("../utils/vsc-utils");
const config_1 = require("../services/config");
const range_1 = require("../core/model/range");
const utility_commands_1 = require("./utility-commands");
exports.CONFIG_KEY = 'links.hover.enable';
const feature = {
    activate: async (context, foamPromise) => {
        const isHoverEnabled = config_1.monitorFoamVsCodeConfig(exports.CONFIG_KEY);
        const foam = await foamPromise;
        context.subscriptions.push(isHoverEnabled, vscode.languages.registerHoverProvider(utils_1.mdDocSelector, new HoverProvider(isHoverEnabled, foam.workspace, foam.graph, foam.services.parser)));
    },
};
class HoverProvider {
    constructor(isHoverEnabled, workspace, graph, parser) {
        this.isHoverEnabled = isHoverEnabled;
        this.workspace = workspace;
        this.graph = graph;
        this.parser = parser;
    }
    async provideHover(document, position, token) {
        if (!this.isHoverEnabled()) {
            return;
        }
        const startResource = this.parser.parse(vsc_utils_1.fromVsCodeUri(document.uri), document.getText());
        const targetLink = startResource.links.find(link => range_1.Range.containsPosition(link.range, {
            line: position.line,
            character: position.character,
        }));
        if (!targetLink) {
            return;
        }
        const documentUri = vsc_utils_1.fromVsCodeUri(document.uri);
        const targetUri = this.workspace.resolveLink(startResource, targetLink);
        const sources = lodash_1.uniqWith(this.graph
            .getBacklinks(targetUri)
            .filter(link => !uri_1.URI.isEqual(link.source, documentUri))
            .map(link => link.source), uri_1.URI.isEqual);
        const links = sources.slice(0, 10).map(ref => {
            const command = utility_commands_1.OPEN_COMMAND.asURI(ref);
            return `- [${this.workspace.get(ref).title}](${command.toString()})`;
        });
        const notes = `note${sources.length > 1 ? 's' : ''}`;
        const references = utils_1.getNoteTooltip([
            `Also referenced in ${sources.length} ${notes}:`,
            ...links,
            links.length === sources.length ? '' : '- ...',
        ].join('\n'));
        let mdContent = null;
        if (!uri_1.URI.isPlaceholder(targetUri)) {
            const content = await this.workspace.readAsMarkdown(targetUri);
            mdContent = utils_1.isSome(content)
                ? utils_1.getNoteTooltip(content)
                : this.workspace.get(targetUri).title;
        }
        const hover = {
            contents: [mdContent, sources.length > 0 ? references : null],
            range: vsc_utils_1.toVsCodeRange(targetLink.range),
        };
        return hover;
    }
}
exports.HoverProvider = HoverProvider;
exports.default = feature;
//# sourceMappingURL=hover-provider.js.map