"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserCancelledOperation = void 0;
class UserCancelledOperation extends Error {
    constructor(message) {
        super('UserCancelledOperation');
        if (message) {
            this.message = message;
        }
    }
}
exports.UserCancelledOperation = UserCancelledOperation;
//# sourceMappingURL=errors.js.map