"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConsoleLogger = void 0;
const baseLogger_1 = require("./baseLogger");
class ConsoleLogger extends baseLogger_1.BaseLogger {
    logInfo(message) {
        super.logIfEnabled(console.log, message);
    }
    logError(error) {
        super.logIfEnabled(console.error, error);
    }
}
exports.ConsoleLogger = ConsoleLogger;
//# sourceMappingURL=consoleLogger.js.map