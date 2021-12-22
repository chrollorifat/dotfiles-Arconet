"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FairTableIndentationDetector = exports.TableIndentationDetector = void 0;
class TableIndentationDetector {
    getLeftPad(lines) {
        const leftPadsPerLine = lines.map(l => l.match(/^\s*/)[0]);
        return this.hasIndentation(leftPadsPerLine)
            ? this.getIndentationChars(leftPadsPerLine)
            : "";
    }
}
exports.TableIndentationDetector = TableIndentationDetector;
/**
 * If more than half of the lines have indentation, assume indentation was intended.
 * Use the indentation characters used by the majority of the lines.
 */
class FairTableIndentationDetector extends TableIndentationDetector {
    hasIndentation(leftPadsPerLine) {
        const totalLines = leftPadsPerLine.length;
        const linesWithActualLeftPadding = leftPadsPerLine.filter(p => p.length > 0).length;
        return linesWithActualLeftPadding >= totalLines / 2;
    }
    getIndentationChars(leftPadsPerLine) {
        const nonEmptyLeftPads = leftPadsPerLine.filter(l => l.length > 0);
        let indentCounters = new Map();
        for (const leftPad of nonEmptyLeftPads) {
            let count = 1;
            if (indentCounters.has(leftPad)) {
                count += indentCounters.get(leftPad);
            }
            indentCounters.set(leftPad, ++count);
        }
        // if there is an indentation used for at least 2 distinct lines, then use that, otherwise use the first line's indentation
        const indentWithMostRepeats = [...indentCounters.entries()].reduce((prev, curr) => curr[1] > prev[1] ? curr : prev);
        return indentWithMostRepeats[1] > 1
            ? indentWithMostRepeats[0]
            : indentCounters[0];
    }
}
exports.FairTableIndentationDetector = FairTableIndentationDetector;
//# sourceMappingURL=tableIndentationDetector.js.map