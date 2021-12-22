"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isDirectory = void 0;
exports.isDirectory = (path) => {
    return path.lastIndexOf('.') < path.lastIndexOf('/');
};
//# sourceMappingURL=path.js.map