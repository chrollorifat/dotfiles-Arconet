"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = void 0;
const vscode_1 = require("vscode");
const markdown_provider_1 = require("./core/markdown-provider");
const foam_1 = require("./core/model/foam");
const datastore_1 = require("./core/services/datastore");
const log_1 = require("./core/utils/log");
const features_1 = require("./features");
const logging_1 = require("./services/logging");
const settings_1 = require("./settings");
const vsc_utils_1 = require("./utils/vsc-utils");
async function activate(context) {
    const logger = new logging_1.VsCodeOutputLogger();
    log_1.Logger.setDefaultLogger(logger);
    logging_1.exposeLogger(context, logger);
    try {
        log_1.Logger.info('Starting Foam');
        // Prepare Foam
        const dataStore = new datastore_1.FileDataStore();
        const matcher = new datastore_1.Matcher(vscode_1.workspace.workspaceFolders.map(dir => vsc_utils_1.fromVsCodeUri(dir.uri)), ['**/*'], settings_1.getIgnoredFilesSetting().map(g => g.toString()));
        const markdownProvider = new markdown_provider_1.MarkdownResourceProvider(matcher, triggers => {
            const watcher = vscode_1.workspace.createFileSystemWatcher('**/*');
            return [
                watcher.onDidChange(uri => triggers.onDidChange(vsc_utils_1.fromVsCodeUri(uri))),
                watcher.onDidCreate(uri => triggers.onDidCreate(vsc_utils_1.fromVsCodeUri(uri))),
                watcher.onDidDelete(uri => triggers.onDidDelete(vsc_utils_1.fromVsCodeUri(uri))),
                watcher,
            ];
        });
        const foamPromise = foam_1.bootstrap(matcher, dataStore, [markdownProvider]);
        // Load the features
        const resPromises = features_1.features.map(f => f.activate(context, foamPromise));
        const foam = await foamPromise;
        log_1.Logger.info(`Loaded ${foam.workspace.list().length} notes`);
        context.subscriptions.push(foam, markdownProvider);
        const res = (await Promise.all(resPromises)).filter(r => r != null);
        return {
            extendMarkdownIt: (md) => {
                return res.reduce((acc, r) => {
                    return r.extendMarkdownIt ? r.extendMarkdownIt(acc) : acc;
                }, md);
            },
        };
    }
    catch (e) {
        log_1.Logger.error('An error occurred while bootstrapping Foam', e);
        vscode_1.window.showErrorMessage(`An error occurred while bootstrapping Foam. ${e.stack}`);
    }
}
exports.activate = activate;
//# sourceMappingURL=extension.js.map