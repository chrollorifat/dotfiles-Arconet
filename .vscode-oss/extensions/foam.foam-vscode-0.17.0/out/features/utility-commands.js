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
exports.OPEN_COMMAND = void 0;
const vscode = __importStar(require("vscode"));
const uri_1 = require("../core/model/uri");
const vsc_utils_1 = require("../utils/vsc-utils");
const templates_1 = require("../services/templates");
const note_1 = require("../core/model/note");
exports.OPEN_COMMAND = {
    command: 'foam-vscode.open-resource',
    title: 'Foam: Open Resource',
    asURI: (uri) => vscode.Uri.parse(`command:${exports.OPEN_COMMAND.command}`).with({
        query: encodeURIComponent(JSON.stringify({ uri: uri_1.URI.create(uri) })),
    }),
};
const feature = {
    activate: (context, foamPromise) => {
        context.subscriptions.push(vscode.commands.registerCommand(exports.OPEN_COMMAND.command, async (params) => {
            var _a, _b, _c;
            const { uri } = params;
            switch (uri.scheme) {
                case 'file':
                    let selection = new vscode.Range(1, 0, 1, 0);
                    if (uri.fragment) {
                        const foam = await foamPromise;
                        const resource = foam.workspace.get(uri);
                        const section = note_1.Resource.findSection(resource, uri.fragment);
                        if (section) {
                            selection = vsc_utils_1.toVsCodeRange(section.range);
                        }
                    }
                    const targetUri = uri.path === ((_a = vscode.window.activeTextEditor) === null || _a === void 0 ? void 0 : _a.document.uri.path)
                        ? (_b = vscode.window.activeTextEditor) === null || _b === void 0 ? void 0 : _b.document.uri : vsc_utils_1.toVsCodeUri(uri);
                    return vscode.commands.executeCommand('vscode.open', targetUri, {
                        selection: selection,
                    });
                case 'placeholder':
                    const title = uri.path.split('/').slice(-1)[0];
                    const basedir = vscode.workspace.workspaceFolders.length > 0
                        ? vsc_utils_1.fromVsCodeUri(vscode.workspace.workspaceFolders[0].uri)
                        : vsc_utils_1.fromVsCodeUri((_c = vscode.window.activeTextEditor) === null || _c === void 0 ? void 0 : _c.document.uri)
                            ? uri_1.URI.getDir(vsc_utils_1.fromVsCodeUri(vscode.window.activeTextEditor.document.uri))
                            : undefined;
                    if (basedir === undefined) {
                        return;
                    }
                    const target = uri_1.URI.createResourceUriFromPlaceholder(basedir, uri);
                    await templates_1.NoteFactory.createForPlaceholderWikilink(title, target);
                    return;
            }
        }));
    },
};
exports.default = feature;
//# sourceMappingURL=utility-commands.js.map