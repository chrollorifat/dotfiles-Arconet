"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RightAlignmentMarker = void 0;
class RightAlignmentMarker {
    constructor(_markerChar) {
        this._markerChar = _markerChar;
    }
    mark(padding) {
        if (padding == null || padding.length < 2)
            return padding;
        return padding.substring(0, padding.length - 1) + this._markerChar;
    }
}
exports.RightAlignmentMarker = RightAlignmentMarker;
//# sourceMappingURL=rightAlignmentMarker.js.map