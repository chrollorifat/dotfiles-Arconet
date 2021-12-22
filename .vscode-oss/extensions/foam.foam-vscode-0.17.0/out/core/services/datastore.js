"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.folderPlusGlob = exports.FileDataStore = exports.Matcher = exports.toFsPath = exports.toMatcherPathFormat = void 0;
const micromatch_1 = __importDefault(require("micromatch"));
const fs_1 = __importDefault(require("fs"));
const uri_1 = require("../model/uri");
const log_1 = require("../utils/log");
const glob_1 = __importDefault(require("glob"));
const util_1 = require("util");
const platform_1 = require("../common/platform");
const findAllFiles = util_1.promisify(glob_1.default);
/**
 * The matcher requires the path to be in unix format, so if we are in windows
 * we convert the fs path on the way in and out
 */
exports.toMatcherPathFormat = platform_1.isWindows
    ? (uri) => uri_1.URI.toFsPath(uri).replace(/\\/g, '/')
    : (uri) => uri_1.URI.toFsPath(uri);
exports.toFsPath = platform_1.isWindows
    ? (path) => path.replace(/\//g, '\\')
    : (path) => path;
class Matcher {
    constructor(baseFolders, include = ['**/*'], exclude = []) {
        this.include = [];
        this.exclude = [];
        this.folders = baseFolders.map(exports.toMatcherPathFormat);
        log_1.Logger.info('Workspace folders: ', this.folders);
        this.folders.forEach(folder => {
            const withFolder = exports.folderPlusGlob(folder);
            this.include.push(...include.map(glob => {
                return withFolder(glob);
            }));
            this.exclude.push(...exclude.map(withFolder));
        });
        log_1.Logger.info('Glob patterns', {
            includeGlobs: this.include,
            ignoreGlobs: this.exclude,
        });
    }
    match(files) {
        const matches = micromatch_1.default(files.map(f => uri_1.URI.toFsPath(f)), this.include, {
            ignore: this.exclude,
            nocase: true,
            format: exports.toFsPath,
        });
        return matches.map(uri_1.URI.file);
    }
    isMatch(uri) {
        return this.match([uri]).length > 0;
    }
}
exports.Matcher = Matcher;
/**
 * File system based data store
 */
class FileDataStore {
    async list(glob, ignoreGlob) {
        const res = await findAllFiles(glob, {
            ignore: ignoreGlob,
        });
        return res.map(uri_1.URI.file);
    }
    async read(uri) {
        try {
            return (await fs_1.default.promises.readFile(uri_1.URI.toFsPath(uri))).toString();
        }
        catch (e) {
            log_1.Logger.error(`FileDataStore: error while reading uri: ${uri.path} - ${e}`);
            return null;
        }
    }
}
exports.FileDataStore = FileDataStore;
exports.folderPlusGlob = (folder) => (glob) => {
    if (folder.substr(-1) === '/') {
        folder = folder.slice(0, -1);
    }
    if (glob.startsWith('/')) {
        glob = glob.slice(1);
    }
    return folder.length > 0 ? `${folder}/${glob}` : glob;
};
//# sourceMappingURL=datastore.js.map