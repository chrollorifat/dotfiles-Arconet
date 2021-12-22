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
exports.IdentifierResolver = exports.updateDiagnostics = void 0;
const lodash_1 = require("lodash");
const vscode = __importStar(require("vscode"));
const note_1 = require("../core/model/note");
const range_1 = require("../core/model/range");
const utils_1 = require("../core/utils");
const utils_2 = require("../utils");
const vsc_utils_1 = require("../utils/vsc-utils");
const AMBIGUOUS_IDENTIFIER_CODE = 'ambiguous-identifier';
const UNKNOWN_SECTION_CODE = 'unknown-section';
const FIND_IDENTIFER_COMMAND = {
    name: 'foam:compute-identifier',
    execute: async ({ target, amongst, range }) => {
        if (vscode.window.activeTextEditor) {
            let identifier = utils_1.getShortestIdentifier(target.path, amongst.map(uri => uri.path));
            identifier = identifier.endsWith('.md')
                ? identifier.slice(0, -3)
                : identifier;
            await vscode.window.activeTextEditor.edit(builder => {
                builder.replace(range, identifier);
            });
        }
    },
};
const REPLACE_TEXT_COMMAND = {
    name: 'foam:replace-text',
    execute: async ({ range, value }) => {
        await vscode.window.activeTextEditor.edit(builder => {
            builder.replace(range, value);
        });
    },
};
const feature = {
    activate: async (context, foamPromise) => {
        const collection = vscode.languages.createDiagnosticCollection('foam');
        const debouncedUpdateDiagnostics = lodash_1.debounce(updateDiagnostics, 500);
        const foam = await foamPromise;
        if (vscode.window.activeTextEditor) {
            updateDiagnostics(foam.workspace, foam.services.parser, vscode.window.activeTextEditor.document, collection);
        }
        context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(editor => {
            if (editor) {
                updateDiagnostics(foam.workspace, foam.services.parser, editor.document, collection);
            }
        }), vscode.workspace.onDidChangeTextDocument(event => {
            debouncedUpdateDiagnostics(foam.workspace, foam.services.parser, event.document, collection);
        }), vscode.languages.registerCodeActionsProvider('markdown', new IdentifierResolver(), {
            providedCodeActionKinds: IdentifierResolver.providedCodeActionKinds,
        }), vscode.commands.registerCommand(FIND_IDENTIFER_COMMAND.name, FIND_IDENTIFER_COMMAND.execute), vscode.commands.registerCommand(REPLACE_TEXT_COMMAND.name, REPLACE_TEXT_COMMAND.execute));
    },
};
function updateDiagnostics(workspace, parser, document, collection) {
    collection.clear();
    const result = [];
    if (document && document.languageId === 'markdown') {
        const resource = parser.parse(vsc_utils_1.fromVsCodeUri(document.uri), document.getText());
        for (const link of resource.links) {
            if (link.type === 'wikilink') {
                const [target, section] = link.target.split('#');
                const targets = workspace.listById(target);
                if (targets.length > 1) {
                    result.push({
                        code: AMBIGUOUS_IDENTIFIER_CODE,
                        message: 'Resource identifier is ambiguous',
                        range: vsc_utils_1.toVsCodeRange(link.range),
                        severity: vscode.DiagnosticSeverity.Warning,
                        source: 'Foam',
                        relatedInformation: targets.map(t => new vscode.DiagnosticRelatedInformation(new vscode.Location(vsc_utils_1.toVsCodeUri(t.uri), new vscode.Position(0, 0)), `Possible target: ${vscode.workspace.asRelativePath(vsc_utils_1.toVsCodeUri(t.uri))}`)),
                    });
                }
                if (section && targets.length === 1) {
                    const resource = targets[0];
                    if (utils_2.isNone(note_1.Resource.findSection(resource, section))) {
                        const range = range_1.Range.create(link.range.start.line, link.range.start.character + target.length + 2, link.range.end.line, link.range.end.character);
                        result.push({
                            code: UNKNOWN_SECTION_CODE,
                            message: `Cannot find section "${section}" in document, available sections are:`,
                            range: vsc_utils_1.toVsCodeRange(range),
                            severity: vscode.DiagnosticSeverity.Warning,
                            source: 'Foam',
                            relatedInformation: resource.sections.map(b => new vscode.DiagnosticRelatedInformation(new vscode.Location(vsc_utils_1.toVsCodeUri(resource.uri), vsc_utils_1.toVsCodePosition(b.range.start)), b.label)),
                        });
                    }
                }
            }
        }
        if (result.length > 0) {
            collection.set(document.uri, result);
        }
    }
}
exports.updateDiagnostics = updateDiagnostics;
class IdentifierResolver {
    provideCodeActions(document, range, context, token) {
        return context.diagnostics.reduce((acc, diagnostic) => {
            if (diagnostic.code === AMBIGUOUS_IDENTIFIER_CODE) {
                const res = [];
                const uris = diagnostic.relatedInformation.map(info => info.location.uri);
                for (const item of diagnostic.relatedInformation) {
                    res.push(createFindIdentifierCommand(diagnostic, item.location.uri, uris));
                }
                return [...acc, ...res];
            }
            if (diagnostic.code === UNKNOWN_SECTION_CODE) {
                const res = [];
                const sections = diagnostic.relatedInformation.map(info => info.message);
                for (const section of sections) {
                    res.push(createReplaceSectionCommand(diagnostic, section));
                }
                return [...acc, ...res];
            }
            return acc;
        }, []);
    }
}
exports.IdentifierResolver = IdentifierResolver;
IdentifierResolver.providedCodeActionKinds = [
    vscode.CodeActionKind.QuickFix,
];
const createReplaceSectionCommand = (diagnostic, section) => {
    const action = new vscode.CodeAction(`Use ${section}`, vscode.CodeActionKind.QuickFix);
    action.command = {
        command: REPLACE_TEXT_COMMAND.name,
        title: `Use section ${section}`,
        arguments: [
            {
                value: section,
                range: new vscode.Range(diagnostic.range.start.line, diagnostic.range.start.character + 1, diagnostic.range.end.line, diagnostic.range.end.character - 2),
            },
        ],
    };
    action.diagnostics = [diagnostic];
    return action;
};
const createFindIdentifierCommand = (diagnostic, target, possibleTargets) => {
    const action = new vscode.CodeAction(`Use ${vscode.workspace.asRelativePath(target)}`, vscode.CodeActionKind.QuickFix);
    action.command = {
        command: FIND_IDENTIFER_COMMAND.name,
        title: 'Link to this resource',
        arguments: [
            {
                target: target,
                amongst: possibleTargets,
                range: new vscode.Range(diagnostic.range.start.line, diagnostic.range.start.character + 2, diagnostic.range.end.line, diagnostic.range.end.character - 2),
            },
        ],
    };
    action.diagnostics = [diagnostic];
    return action;
};
exports.default = feature;
//# sourceMappingURL=wikilink-diagnostics.js.map