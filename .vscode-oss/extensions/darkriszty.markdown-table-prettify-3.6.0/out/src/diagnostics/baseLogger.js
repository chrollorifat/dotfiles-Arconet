"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseLogger = void 0;
class BaseLogger {
    constructor() {
        this._enabled = true;
    }
    setEnabled(enabled) {
        this._enabled = enabled;
    }
    logIfEnabled(logFunc, param) {
        if (!this._enabled)
            return;
        logFunc(param);
    }
}
exports.BaseLogger = BaseLogger;
//# sourceMappingURL=baseLogger.js.map