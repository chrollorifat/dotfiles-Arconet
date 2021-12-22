"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlignmentMarkerStrategy = void 0;
const alignment_1 = require("../../models/alignment");
const _1 = require(".");
class AlignmentMarkerStrategy {
    constructor(_markerChar) {
        this._markerChar = _markerChar;
    }
    markerFor(alignment) {
        switch (alignment) {
            case alignment_1.Alignment.Left: return new _1.LeftAlignmentMarker(this._markerChar);
            case alignment_1.Alignment.Right: return new _1.RightAlignmentMarker(this._markerChar);
            case alignment_1.Alignment.Center: return new _1.CenterAlignmentMarker(this._markerChar);
            default: return new _1.NotSetAlignmentMarker();
        }
    }
}
exports.AlignmentMarkerStrategy = AlignmentMarkerStrategy;
//# sourceMappingURL=alignmentMarkerStrategy.js.map