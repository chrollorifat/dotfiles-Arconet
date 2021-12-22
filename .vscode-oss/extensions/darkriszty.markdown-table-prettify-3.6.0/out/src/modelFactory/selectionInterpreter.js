"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SelectionInterpreter = void 0;
class SelectionInterpreter {
    constructor(_strict) {
        this._strict = _strict;
    }
    allRows(selection) {
        let split = selection.split(/\r\n|\r|\n/).map(this.splitLine, this);
        return this._strict
            ? split
            : split.filter(arr => arr.length > 0 && !(arr.length == 1 && /^\s*$/.test(arr[0])));
    }
    separator(selection) {
        return this.allRows(selection).filter((v, i) => i == 1)[0];
    }
    splitLine(line) {
        if (line == null || line.length == 0)
            return [];
        let result = [], index = -1, previousSplitIndex = -1;
        while ((index = line.indexOf("|", index + 1)) > -1) {
            if (line[index - 1] != "\\" && !this.codeBlockOpenTill(line.substr(0, index))) {
                result.push(line.substring(previousSplitIndex + 1, index));
                previousSplitIndex = index;
            }
        }
        result.push(line.substring(previousSplitIndex + 1));
        return result;
    }
    codeBlockOpenTill(text) {
        return (text.match(/`/g) || []).length % 2 != 0;
    }
}
exports.SelectionInterpreter = SelectionInterpreter;
//# sourceMappingURL=selectionInterpreter.js.map