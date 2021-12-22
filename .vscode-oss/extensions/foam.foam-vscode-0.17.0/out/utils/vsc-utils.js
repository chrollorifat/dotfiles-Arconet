"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fromVsCodeUri = exports.toVsCodeUri = exports.toVsCodeRange = exports.toVsCodePosition = void 0;
const vscode_1 = require("vscode");
const uri_1 = require("../core/model/uri");
exports.toVsCodePosition = (p) => new vscode_1.Position(p.line, p.character);
exports.toVsCodeRange = (r) => new vscode_1.Range(r.start.line, r.start.character, r.end.line, r.end.character);
exports.toVsCodeUri = (u) => vscode_1.Uri.parse(uri_1.URI.toString(u));
exports.fromVsCodeUri = (u) => uri_1.URI.parse(u.toString());
//# sourceMappingURL=vsc-utils.js.map