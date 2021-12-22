"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeftAlignmentMarker = void 0;
class LeftAlignmentMarker {
    constructor(_markerChar) {
        this._markerChar = _markerChar;
    }
    mark(padding) {
        if (padding == null || padding.length < 2)
            return padding;
        return this._markerChar + padding.substr(1);
    }
}
exports.LeftAlignmentMarker = LeftAlignmentMarker;
//# sourceMappingURL=leftAlignmentMarker.js.map