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
const vscode = __importStar(require("vscode"));
const uri_1 = require("../core/model/uri");
const vsc_utils_1 = require("../utils/vsc-utils");
const feature = {
    activate: async (context, foamPromise) => {
        const foam = await foamPromise;
        context.subscriptions.push(vscode.workspace.onWillRenameFiles(async (e) => {
            const originatingFileEdit = new vscode.WorkspaceEdit();
            e.files.forEach(({ oldUri, newUri }) => {
                const identifier = foam.workspace.getIdentifier(vsc_utils_1.fromVsCodeUri(newUri));
                const connections = foam.graph.getBacklinks(vsc_utils_1.fromVsCodeUri(oldUri));
                connections.forEach(async (connection) => {
                    const range = vsc_utils_1.toVsCodeRange(connection.link.range);
                    switch (connection.link.type) {
                        case 'wikilink':
                            originatingFileEdit.replace(vsc_utils_1.toVsCodeUri(connection.source), new vscode.Selection(range.start.line, range.start.character + 2, range.end.line, range.end.character - 2), identifier);
                            break;
                        case 'link':
                            const path = connection.link.target.startsWith('/') // TODO replace with isAbsolute after path refactoring
                                ? '/' + vscode.workspace.asRelativePath(newUri)
                                : uri_1.URI.relativePath(connection.source, vsc_utils_1.fromVsCodeUri(newUri));
                            originatingFileEdit.replace(vsc_utils_1.toVsCodeUri(connection.source), new vscode.Selection(range.start.line, range.start.character + 2 + connection.link.label.length, range.end.line, range.end.character), '(' + path + ')');
                            break;
                    }
                });
            });
            return await vscode.workspace.applyEdit(originatingFileEdit);
        }));
    },
};
exports.default = feature;
//# sourceMappingURL=refactor.js.map