"use strict";
// `URI` is mostly compatible with VSCode's `Uri`.
// Having a Foam-specific URI object allows for easier maintenance of the API.
// See https://github.com/foambubble/foam/pull/537 for more context.
// Some code in this file comes from https://github.com/microsoft/vscode/main/src/vs/base/common/uri.ts
// See LICENSE for details
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.URI = void 0;
const paths = __importStar(require("path"));
const path_1 = require("path");
const { posix } = paths;
const _empty = '';
const _slash = '/';
const _regexp = /^(([^:/?#]{2,}?):)?(\/\/([^/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?/;
class URI {
    static create(from) {
        var _a, _b, _c, _d, _e;
        // When using this method we assume the path is already posix
        // so we don't check whether it's a Windows path, nor we do any
        // conversion
        return {
            scheme: (_a = from.scheme) !== null && _a !== void 0 ? _a : _empty,
            authority: (_b = from.authority) !== null && _b !== void 0 ? _b : _empty,
            path: (_c = from.path) !== null && _c !== void 0 ? _c : _empty,
            query: (_d = from.query) !== null && _d !== void 0 ? _d : _empty,
            fragment: (_e = from.fragment) !== null && _e !== void 0 ? _e : _empty,
        };
    }
    static parse(value) {
        var _a, _b, _c, _d;
        const match = _regexp.exec(value);
        if (!match) {
            return URI.create({});
        }
        let path = percentDecode((_a = match[5]) !== null && _a !== void 0 ? _a : _empty);
        if (URI.isWindowsPath(path)) {
            path = windowsPathToUriPath(path);
        }
        return URI.create({
            scheme: match[2] || 'file',
            authority: percentDecode((_b = match[4]) !== null && _b !== void 0 ? _b : _empty),
            path: path,
            query: percentDecode((_c = match[7]) !== null && _c !== void 0 ? _c : _empty),
            fragment: percentDecode((_d = match[9]) !== null && _d !== void 0 ? _d : _empty),
        });
    }
    /**
     * Parses a URI from value, taking into consideration possible relative paths.
     *
     * @param reference the URI to use as reference in case value is a relative path
     * @param value the value to parse for a URI
     * @returns the URI from the given value. In case of a relative path, the URI will take into account
     * the reference from which it is computed
     */
    static resolve(value, reference) {
        let uri = URI.parse(value);
        if (uri.scheme === 'file' && !value.startsWith('/')) {
            const [path, fragment] = value.split('#');
            uri =
                path.length > 0 ? URI.computeRelativeURI(reference, path) : reference;
            if (fragment) {
                uri = URI.create({
                    ...uri,
                    fragment: fragment,
                });
            }
        }
        return uri;
    }
    static computeRelativeURI(reference, relativeSlug) {
        // if no extension is provided, use the same extension as the source file
        const slug = posix.extname(relativeSlug) !== ''
            ? relativeSlug
            : `${relativeSlug}${posix.extname(reference.path)}`;
        return URI.create({
            ...reference,
            path: posix.join(posix.dirname(reference.path), slug),
        });
    }
    static file(path) {
        let authority = _empty;
        // normalize to fwd-slashes on windows,
        // on other systems bwd-slashes are valid
        // filename character, eg /f\oo/ba\r.txt
        if (URI.isWindowsPath(path)) {
            path = windowsPathToUriPath(path);
        }
        // check for authority as used in UNC shares
        // or use the path as given
        if (path[0] === _slash && path[1] === _slash) {
            const idx = path.indexOf(_slash, 2);
            if (idx === -1) {
                authority = path.substring(2);
                path = _slash;
            }
            else {
                authority = path.substring(2, idx);
                path = path.substring(idx) || _slash;
            }
        }
        return URI.create({ scheme: 'file', authority, path });
    }
    static placeholder(key) {
        return URI.create({
            scheme: 'placeholder',
            path: key,
        });
    }
    static withFragment(uri, fragment) {
        return URI.create({
            ...uri,
            fragment,
        });
    }
    static relativePath(source, target) {
        const relativePath = posix.relative(posix.dirname(source.path), target.path);
        return relativePath;
    }
    static getBasename(uri) {
        return posix.parse(uri.path).name;
    }
    static getDir(uri) {
        return URI.file(posix.dirname(uri.path));
    }
    static getFileNameWithoutExtension(uri) {
        return URI.getBasename(uri).replace(/\.[^.]+$/, '');
    }
    /**
     * Uses a placeholder URI, and a reference directory, to generate
     * the URI of the corresponding resource
     *
     * @param placeholderUri the placeholder URI
     * @param basedir the dir to be used as reference
     * @returns the target resource URI
     */
    static createResourceUriFromPlaceholder(basedir, placeholderUri) {
        if (path_1.isAbsolute(placeholderUri.path)) {
            return URI.file(placeholderUri.path);
        }
        const tokens = placeholderUri.path.split('/');
        const path = tokens.slice(0, -1);
        const filename = tokens.slice(-1);
        return URI.joinPath(basedir, ...path, `${filename}.md`);
    }
    /**
     * Join a URI path with path fragments and normalizes the resulting path.
     *
     * @param uri The input URI.
     * @param pathFragment The path fragment to add to the URI path.
     * @returns The resulting URI.
     */
    static joinPath(uri, ...pathFragment) {
        if (!uri.path) {
            throw new Error(`[UriError]: cannot call joinPath on URI without path`);
        }
        let newPath;
        if (URI.isWindowsPath(uri.path) && uri.scheme === 'file') {
            newPath = URI.file(paths.win32.join(URI.toFsPath(uri), ...pathFragment))
                .path;
        }
        else {
            newPath = paths.posix.join(uri.path, ...pathFragment);
        }
        return URI.create({ ...uri, path: newPath });
    }
    static toFsPath(uri) {
        let value;
        if (uri.authority && uri.path.length > 1 && uri.scheme === 'file') {
            // unc path: file://shares/c$/far/boo
            value = `//${uri.authority}${uri.path}`;
        }
        else if (uri.path.charCodeAt(0) === 47 /* Slash */ &&
            ((uri.path.charCodeAt(1) >= 65 /* A */ &&
                uri.path.charCodeAt(1) <= 90 /* Z */) ||
                (uri.path.charCodeAt(1) >= 97 /* a */ &&
                    uri.path.charCodeAt(1) <= 122 /* z */)) &&
            uri.path.charCodeAt(2) === 58 /* Colon */) {
            // windows drive letter: file:///C:/far/boo
            value = uri.path[1].toUpperCase() + uri.path.substr(2);
        }
        else {
            // other path
            value = uri.path;
        }
        if (URI.isWindowsPath(value)) {
            value = value.replace(/\//g, '\\');
        }
        return value;
    }
    static toString(uri) {
        return encode(uri, false);
    }
    // --- utility
    static isWindowsPath(path) {
        return ((path.length >= 2 && path.charCodeAt(1) === 58 /* Colon */) ||
            (path.length >= 3 &&
                path.charCodeAt(0) === 47 /* Slash */ &&
                path.charCodeAt(2) === 58 /* Colon */));
    }
    static isUri(thing) {
        if (!thing) {
            return false;
        }
        return (typeof thing.authority === 'string' &&
            typeof thing.fragment === 'string' &&
            typeof thing.path === 'string' &&
            typeof thing.query === 'string' &&
            typeof thing.scheme === 'string');
    }
    static isPlaceholder(uri) {
        return uri.scheme === 'placeholder';
    }
    static isEqual(a, b) {
        return (a.authority === b.authority &&
            a.scheme === b.scheme &&
            a.path === b.path &&
            a.fragment === b.fragment &&
            a.query === b.query);
    }
    static isMarkdownFile(uri) {
        return uri.path.endsWith('.md');
    }
}
exports.URI = URI;
// --- encode / decode
function decodeURIComponentGraceful(str) {
    try {
        return decodeURIComponent(str);
    }
    catch {
        if (str.length > 3) {
            return str.substr(0, 3) + decodeURIComponentGraceful(str.substr(3));
        }
        else {
            return str;
        }
    }
}
const _rEncodedAsHex = /(%[0-9A-Za-z][0-9A-Za-z])+/g;
function percentDecode(str) {
    if (!str.match(_rEncodedAsHex)) {
        return str;
    }
    return str.replace(_rEncodedAsHex, match => decodeURIComponentGraceful(match));
}
/**
 * Converts a windows-like path to standard URI path
 * - Normalize the Windows drive letter to upper case
 * - replace \ with /
 * - always start with /
 *
 * see https://github.com/foambubble/foam/issues/813
 * see https://github.com/microsoft/vscode/issues/43959
 * see https://github.com/microsoft/vscode/issues/116298
 *
 * @param path the path to convert
 * @returns the URI compatible path
 */
function windowsPathToUriPath(path) {
    path = path.charCodeAt(0) === 47 /* Slash */ ? path : `/${path}`;
    path = path.replace(/\\/g, _slash);
    const code = path.charCodeAt(1);
    if (path.charCodeAt(2) === 58 /* Colon */ &&
        code >= 97 /* a */ &&
        code <= 122 /* z */) {
        path = `/${String.fromCharCode(code - 32)}:${path.substr(3)}`; // "/C:".length === 3
    }
    return path;
}
/**
 * Create the external version of a uri
 */
function encode(uri, skipEncoding) {
    const encoder = !skipEncoding
        ? encodeURIComponentFast
        : encodeURIComponentMinimal;
    let res = '';
    let { scheme, authority, path, query, fragment } = uri;
    if (scheme) {
        res += scheme;
        res += ':';
    }
    if (authority || scheme === 'file') {
        res += _slash;
        res += _slash;
    }
    if (authority) {
        let idx = authority.indexOf('@');
        if (idx !== -1) {
            // <user>@<auth>
            const userinfo = authority.substr(0, idx);
            authority = authority.substr(idx + 1);
            idx = userinfo.indexOf(':');
            if (idx === -1) {
                res += encoder(userinfo, false);
            }
            else {
                // <user>:<pass>@<auth>
                res += encoder(userinfo.substr(0, idx), false);
                res += ':';
                res += encoder(userinfo.substr(idx + 1), false);
            }
            res += '@';
        }
        authority = authority.toLowerCase();
        idx = authority.indexOf(':');
        if (idx === -1) {
            res += encoder(authority, false);
        }
        else {
            // <auth>:<port>
            res += encoder(authority.substr(0, idx), false);
            res += authority.substr(idx);
        }
    }
    if (path) {
        // upper-case windows drive letters in /c:/fff or c:/fff
        if (path.length >= 3 &&
            path.charCodeAt(0) === 47 /* Slash */ &&
            path.charCodeAt(2) === 58 /* Colon */) {
            const code = path.charCodeAt(1);
            if (code >= 97 /* a */ && code <= 122 /* z */) {
                path = `/${String.fromCharCode(code - 32)}:${path.substr(3)}`; // "/C:".length === 3
            }
        }
        else if (path.length >= 2 && path.charCodeAt(1) === 58 /* Colon */) {
            const code = path.charCodeAt(0);
            if (code >= 97 /* a */ && code <= 122 /* z */) {
                path = `${String.fromCharCode(code - 32)}:${path.substr(2)}`; // "/C:".length === 3
            }
        }
        // encode the rest of the path
        res += encoder(path, true);
    }
    if (query) {
        res += '?';
        res += encoder(query, false);
    }
    if (fragment) {
        res += '#';
        res += !skipEncoding ? encodeURIComponentFast(fragment, false) : fragment;
    }
    return res;
}
// reserved characters: https://tools.ietf.org/html/rfc3986#section-2.2
const encodeTable = {
    [58 /* Colon */]: '%3A',
    [47 /* Slash */]: '%2F',
    [63 /* QuestionMark */]: '%3F',
    [35 /* Hash */]: '%23',
    [91 /* OpenSquareBracket */]: '%5B',
    [93 /* CloseSquareBracket */]: '%5D',
    [64 /* AtSign */]: '%40',
    [33 /* ExclamationMark */]: '%21',
    [36 /* DollarSign */]: '%24',
    [38 /* Ampersand */]: '%26',
    [39 /* SingleQuote */]: '%27',
    [40 /* OpenParen */]: '%28',
    [41 /* CloseParen */]: '%29',
    [42 /* Asterisk */]: '%2A',
    [43 /* Plus */]: '%2B',
    [44 /* Comma */]: '%2C',
    [59 /* Semicolon */]: '%3B',
    [61 /* Equals */]: '%3D',
    [32 /* Space */]: '%20',
};
function encodeURIComponentFast(uriComponent, allowSlash) {
    let res = undefined;
    let nativeEncodePos = -1;
    for (let pos = 0; pos < uriComponent.length; pos++) {
        const code = uriComponent.charCodeAt(pos);
        // unreserved characters: https://tools.ietf.org/html/rfc3986#section-2.3
        if ((code >= 97 /* a */ && code <= 122 /* z */) ||
            (code >= 65 /* A */ && code <= 90 /* Z */) ||
            (code >= 48 /* Digit0 */ && code <= 57 /* Digit9 */) ||
            code === 45 /* Dash */ ||
            code === 46 /* Period */ ||
            code === 95 /* Underline */ ||
            code === 126 /* Tilde */ ||
            (allowSlash && code === 47 /* Slash */)) {
            // check if we are delaying native encode
            if (nativeEncodePos !== -1) {
                res += encodeURIComponent(uriComponent.substring(nativeEncodePos, pos));
                nativeEncodePos = -1;
            }
            // check if we write into a new string (by default we try to return the param)
            if (res !== undefined) {
                res += uriComponent.charAt(pos);
            }
        }
        else {
            // encoding needed, we need to allocate a new string
            if (res === undefined) {
                res = uriComponent.substr(0, pos);
            }
            // check with default table first
            const escaped = encodeTable[code];
            if (escaped !== undefined) {
                // check if we are delaying native encode
                if (nativeEncodePos !== -1) {
                    res += encodeURIComponent(uriComponent.substring(nativeEncodePos, pos));
                    nativeEncodePos = -1;
                }
                // append escaped variant to result
                res += escaped;
            }
            else if (nativeEncodePos === -1) {
                // use native encode only when needed
                nativeEncodePos = pos;
            }
        }
    }
    if (nativeEncodePos !== -1) {
        res += encodeURIComponent(uriComponent.substring(nativeEncodePos));
    }
    return res !== undefined ? res : uriComponent;
}
function encodeURIComponentMinimal(path) {
    let res = undefined;
    for (let pos = 0; pos < path.length; pos++) {
        const code = path.charCodeAt(pos);
        if (code === 35 /* Hash */ || code === 63 /* QuestionMark */) {
            if (res === undefined) {
                res = path.substr(0, pos);
            }
            res += encodeTable[code];
        }
        else {
            if (res !== undefined) {
                res += path[pos];
            }
        }
    }
    return res !== undefined ? res : path;
}
//# sourceMappingURL=uri.js.map