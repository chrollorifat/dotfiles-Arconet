"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uriToSlug = void 0;
const github_slugger_1 = __importDefault(require("github-slugger"));
const uri_1 = require("../model/uri");
exports.uriToSlug = (uri) => github_slugger_1.default.slug(uri_1.URI.getBasename(uri));
//# sourceMappingURL=slug.js.map