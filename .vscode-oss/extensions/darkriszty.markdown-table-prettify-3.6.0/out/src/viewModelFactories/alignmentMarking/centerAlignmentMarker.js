"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CenterAlignmentMarker = void 0;
class CenterAlignmentMarker {
    constructor(_markerChar) {
        this._markerChar = _markerChar;
    }
    mark(padding) {
        if (padding == null || padding.length < 2)
            return padding;
        return this._markerChar + padding.substring(1, padding.length - 1) + this._markerChar;
    }
}
exports.CenterAlignmentMarker = CenterAlignmentMarker;
//# sourceMappingURL=centerAlignmentMarker.js.map