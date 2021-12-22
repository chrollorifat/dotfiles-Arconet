"use strict";
// Some code in this file coming from https://github.com/microsoft/vscode/
// See LICENSE for details
Object.defineProperty(exports, "__esModule", { value: true });
exports.Range = void 0;
const position_1 = require("./position");
class Range {
    static create(startLine, startChar, endLine, endChar) {
        const start = {
            line: startLine,
            character: startChar,
        };
        const end = {
            line: endLine !== null && endLine !== void 0 ? endLine : startLine,
            character: endChar !== null && endChar !== void 0 ? endChar : startChar,
        };
        return Range.createFromPosition(start, end);
    }
    static createFromPosition(start, end) {
        end = end !== null && end !== void 0 ? end : start;
        let first = start;
        let second = end;
        if (position_1.Position.isAfter(start, end)) {
            first = end;
            second = start;
        }
        return {
            start: {
                line: first.line,
                character: first.character,
            },
            end: {
                line: second.line,
                character: second.character,
            },
        };
    }
    static containsRange(range, contained) {
        return (Range.containsPosition(range, contained.start) &&
            Range.containsPosition(range, contained.end));
    }
    static containsPosition(range, position) {
        return (position_1.Position.isAfterOrEqual(position, range.start) &&
            position_1.Position.isBeforeOrEqual(position, range.end));
    }
    static isEqual(r1, r2) {
        return (position_1.Position.isEqual(r1.start, r2.start) && position_1.Position.isEqual(r1.end, r2.end));
    }
    static isBefore(a, b) {
        return a.start.line - b.start.line || a.start.character - b.start.character;
    }
}
exports.Range = Range;
//# sourceMappingURL=range.js.map