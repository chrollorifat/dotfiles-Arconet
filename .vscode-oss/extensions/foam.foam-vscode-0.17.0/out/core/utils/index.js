"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHeadingFromFileName = exports.dropExtension = void 0;
const title_case_1 = require("title-case");
var hashtags_1 = require("./hashtags");
Object.defineProperty(exports, "extractHashtags", { enumerable: true, get: function () { return hashtags_1.extractHashtags; } });
Object.defineProperty(exports, "extractTagsFromProp", { enumerable: true, get: function () { return hashtags_1.extractTagsFromProp; } });
__exportStar(require("./core"), exports);
function dropExtension(path) {
    const parts = path.split('.');
    parts.pop();
    return parts.join('.');
}
exports.dropExtension = dropExtension;
/**
 *
 * @param filename
 * @returns title cased heading after removing special characters
 */
exports.getHeadingFromFileName = (filename) => {
    return title_case_1.titleCase(filename.replace(/[^\w\s]/gi, ' '));
};
//# sourceMappingURL=index.js.map