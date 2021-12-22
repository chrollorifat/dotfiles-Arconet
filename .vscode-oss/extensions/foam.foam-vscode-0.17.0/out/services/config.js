"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.monitorFoamVsCodeConfig = exports.updateFoamVsCodeConfig = exports.getFoamVsCodeConfig = void 0;
const vscode_1 = require("vscode");
exports.getFoamVsCodeConfig = (key) => vscode_1.workspace.getConfiguration('foam').get(key);
exports.updateFoamVsCodeConfig = (key, value) => vscode_1.workspace.getConfiguration().update('foam.' + key, value);
exports.monitorFoamVsCodeConfig = (key) => {
    let value = exports.getFoamVsCodeConfig(key);
    const listener = vscode_1.workspace.onDidChangeConfiguration(e => {
        if (e.affectsConfiguration('foam.' + key)) {
            value = exports.getFoamVsCodeConfig(key);
        }
    });
    const ret = () => {
        return value;
    };
    ret.dispose = () => listener.dispose();
    return ret;
};
//# sourceMappingURL=config.js.map