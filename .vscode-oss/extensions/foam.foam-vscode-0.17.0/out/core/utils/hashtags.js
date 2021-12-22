"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractTagsFromProp = exports.extractHashtags = void 0;
const core_1 = require("./core");
const HASHTAG_REGEX = /(?<=^|\s)#([0-9]*[\p{L}/_-][\p{L}\p{N}/_-]*)/gmu;
const WORD_REGEX = /(?<=^|\s)([0-9]*[\p{L}/_-][\p{L}\p{N}/_-]*)/gmu;
exports.extractHashtags = (text) => {
    return core_1.isSome(text)
        ? Array.from(text.matchAll(HASHTAG_REGEX)).map(m => ({
            label: m[1],
            offset: m.index,
        }))
        : [];
};
exports.extractTagsFromProp = (prop) => {
    const text = Array.isArray(prop) ? prop.join(' ') : prop;
    return core_1.isSome(text)
        ? Array.from(text.matchAll(WORD_REGEX)).map(m => m[1])
        : [];
};
//# sourceMappingURL=hashtags.js.map