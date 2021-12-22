"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyTextEdit = void 0;
const os_1 = __importDefault(require("os"));
const detect_newline_1 = __importDefault(require("detect-newline"));
/**
 *
 * @param text text on which the textEdit will be applied
 * @param textEdit
 * @returns {string} text with the applied textEdit
 */
exports.applyTextEdit = (text, textEdit) => {
    const eol = detect_newline_1.default(text) || os_1.default.EOL;
    const lines = text.split(eol);
    const characters = text.split('');
    let startOffset = getOffset(lines, textEdit.range.start, eol);
    let endOffset = getOffset(lines, textEdit.range.end, eol);
    const deleteCount = endOffset - startOffset;
    const textToAppend = `${textEdit.newText}`;
    characters.splice(startOffset, deleteCount, textToAppend);
    return characters.join('');
};
const getOffset = (lines, position, eol) => {
    const eolLen = eol.length;
    let offset = 0;
    let i = 0;
    while (i < position.line && i < lines.length) {
        offset = offset + lines[i].length + eolLen;
        i++;
    }
    return offset + Math.min(position.character, lines[i].length);
};
//# sourceMappingURL=apply-text-edit.js.map