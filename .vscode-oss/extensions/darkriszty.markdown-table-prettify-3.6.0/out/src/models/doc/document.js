"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Document = void 0;
const line_1 = require("./line");
const range_1 = require("./range");
class Document {
    constructor(text) {
        this._lines = this.buildLines(text);
    }
    get lines() {
        return this._lines;
    }
    get fullRange() {
        return new range_1.Range(0, this._lines.length);
    }
    getLines(range) {
        return range == null
            ? this.lines
            : this.lines.slice(range.startLine, range.endLine + 1);
    }
    getText(range = null) {
        const lines = this.getLines(range);
        return lines.reduce((acc, curr, index) => {
            // avoid adding the line break for the last line for range selections
            const eol = range != null && index == lines.length - 1
                ? ""
                : curr.EOL;
            return acc += curr.value + eol;
        }, "");
    }
    replaceTextInRange(range, newText) {
        const newLines = this.buildLines(newText);
        if (range.endLine - range.startLine + 1 !== newLines.length) {
            throw new Error("Unexpected range length of text to replace.");
        }
        // preserve the EOL of the last line, as the newText does not have it
        newLines[newLines.length - 1].EOL = this.lines[range.endLine].EOL;
        for (let i = range.startLine; i <= range.endLine; i++) {
            this.lines[i] = newLines[i - range.startLine];
        }
    }
    buildLines(text) {
        return (text.match(/[^\n]*\n|[^\n]+/g) || [""]).map(row => new line_1.Line(row));
    }
}
exports.Document = Document;
//# sourceMappingURL=document.js.map