"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getShortestIdentifier = exports.hash = exports.isNumeric = exports.isNone = exports.isSome = exports.isNotNull = void 0;
const crypto_1 = __importDefault(require("crypto"));
function isNotNull(value) {
    return value != null; // eslint-disable-line
}
exports.isNotNull = isNotNull;
function isSome(value) {
    return value != null; // eslint-disable-line
}
exports.isSome = isSome;
function isNone(value) {
    return value == null; // eslint-disable-line
}
exports.isNone = isNone;
function isNumeric(value) {
    return /-?\d+$/.test(value);
}
exports.isNumeric = isNumeric;
exports.hash = (text) => crypto_1.default
    .createHash('sha1')
    .update(text)
    .digest('hex');
/**
 * Returns the minimal identifier for the given string amongst others
 *
 * @param forValue the value to compute the identifier for
 * @param amongst the set of strings within which to find the identifier
 */
exports.getShortestIdentifier = (forValue, amongst) => {
    const needleTokens = forValue.split('/').reverse();
    const haystack = amongst
        .filter(value => value !== forValue)
        .map(value => value.split('/').reverse());
    let tokenIndex = 0;
    let res = needleTokens;
    while (tokenIndex < needleTokens.length) {
        for (let j = haystack.length - 1; j >= 0; j--) {
            if (haystack[j].length < tokenIndex ||
                needleTokens[tokenIndex] !== haystack[j][tokenIndex]) {
                haystack.splice(j, 1);
            }
        }
        if (haystack.length === 0) {
            res = needleTokens.splice(0, tokenIndex + 1);
            break;
        }
        tokenIndex++;
    }
    const identifier = res
        .filter(token => token.trim() !== '')
        .reverse()
        .join('/');
    return identifier;
};
//# sourceMappingURL=core.js.map