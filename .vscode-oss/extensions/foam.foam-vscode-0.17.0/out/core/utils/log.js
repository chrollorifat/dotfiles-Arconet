"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = exports.NoOpLogger = exports.ConsoleLogger = exports.BaseLogger = void 0;
class BaseLogger {
    constructor(level = 'info') {
        this.level = level;
    }
    doLog(msgLevel, message, ...params) {
        if (this.level === 'off') {
            return;
        }
        if (BaseLogger.severity[msgLevel] >= BaseLogger.severity[this.level]) {
            this.log(msgLevel, message, ...params);
        }
    }
    debug(message, ...params) {
        this.doLog('debug', message, ...params);
    }
    info(message, ...params) {
        this.doLog('info', message, ...params);
    }
    warn(message, ...params) {
        this.doLog('warn', message, ...params);
    }
    error(message, ...params) {
        this.doLog('error', message, ...params);
    }
    getLevel() {
        return this.level;
    }
    setLevel(level) {
        this.level = level;
    }
}
exports.BaseLogger = BaseLogger;
BaseLogger.severity = {
    debug: 1,
    info: 2,
    warn: 3,
    error: 4,
};
class ConsoleLogger extends BaseLogger {
    log(level, msg, ...params) {
        console[level](`[${level}] ${msg}`, ...params);
    }
}
exports.ConsoleLogger = ConsoleLogger;
class NoOpLogger extends BaseLogger {
    log(_l, _m, ..._p) { }
}
exports.NoOpLogger = NoOpLogger;
class Logger {
    static debug(message, ...params) {
        Logger.defaultLogger.debug(message, ...params);
    }
    static info(message, ...params) {
        Logger.defaultLogger.info(message, ...params);
    }
    static warn(message, ...params) {
        Logger.defaultLogger.warn(message, ...params);
    }
    static error(message, ...params) {
        Logger.defaultLogger.error(message, ...params);
    }
    static getLevel() {
        return Logger.defaultLogger.getLevel();
    }
    static setLevel(level) {
        Logger.defaultLogger.setLevel(level);
    }
    static setDefaultLogger(logger) {
        Logger.defaultLogger = logger;
    }
}
exports.Logger = Logger;
Logger.defaultLogger = new ConsoleLogger();
//# sourceMappingURL=log.js.map