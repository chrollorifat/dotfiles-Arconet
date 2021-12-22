"use strict";
// Some code in this file coming from https://github.com/microsoft/vscode/
// See LICENSE for details
Object.defineProperty(exports, "__esModule", { value: true });
exports.Position = void 0;
class Position {
    static create(line, character) {
        return { line, character };
    }
    static Min(...positions) {
        if (positions.length === 0) {
            throw new TypeError();
        }
        let result = positions[0];
        for (let i = 1; i < positions.length; i++) {
            const p = positions[i];
            if (Position.isBefore(p, result)) {
                result = p;
            }
        }
        return result;
    }
    static Max(...positions) {
        if (positions.length === 0) {
            throw new TypeError();
        }
        let result = positions[0];
        for (let i = 1; i < positions.length; i++) {
            const p = positions[i];
            if (Position.isAfter(p, result)) {
                result = p;
            }
        }
        return result;
    }
    static isBefore(p1, p2) {
        if (p1.line < p2.line) {
            return true;
        }
        if (p2.line < p1.line) {
            return false;
        }
        return p1.character < p2.character;
    }
    static isBeforeOrEqual(p1, p2) {
        if (p1.line < p2.line) {
            return true;
        }
        if (p2.line < p1.line) {
            return false;
        }
        return p1.character <= p2.character;
    }
    static isAfter(p1, p2) {
        return !Position.isBeforeOrEqual(p1, p2);
    }
    static isAfterOrEqual(p1, p2) {
        return !Position.isBefore(p1, p2);
    }
    static isEqual(p1, p2) {
        return p1.line === p2.line && p1.character === p2.character;
    }
    static compareTo(p1, p2) {
        if (p1.line < p2.line) {
            return -1;
        }
        else if (p1.line > p2.line) {
            return 1;
        }
        else {
            // equal line
            if (p1.character < p2.character) {
                return -1;
            }
            else if (p1.character > p2.character) {
                return 1;
            }
            else {
                // equal line and character
                return 0;
            }
        }
    }
}
exports.Position = Position;
//# sourceMappingURL=position.js.map