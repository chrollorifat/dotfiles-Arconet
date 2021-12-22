"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FoamWorkspace = exports.getReferenceType = void 0;
const uri_1 = require("./uri");
const utils_1 = require("../utils");
const event_1 = require("../common/event");
function getReferenceType(reference) {
    if (uri_1.URI.isUri(reference)) {
        return 'uri';
    }
    if (reference.startsWith('/')) {
        return 'absolute-path';
    }
    if (reference.startsWith('./') || reference.startsWith('../')) {
        return 'relative-path';
    }
    return 'key';
}
exports.getReferenceType = getReferenceType;
function hasExtension(path) {
    const dotIdx = path.lastIndexOf('.');
    return dotIdx > 0 && path.length - dotIdx <= 4;
}
class FoamWorkspace {
    constructor() {
        this.onDidAddEmitter = new event_1.Emitter();
        this.onDidUpdateEmitter = new event_1.Emitter();
        this.onDidDeleteEmitter = new event_1.Emitter();
        this.onDidAdd = this.onDidAddEmitter.event;
        this.onDidUpdate = this.onDidUpdateEmitter.event;
        this.onDidDelete = this.onDidDeleteEmitter.event;
        this.providers = [];
        /**
         * Resources by path
         */
        this.resources = new Map();
    }
    registerProvider(provider) {
        this.providers.push(provider);
        return provider.init(this);
    }
    set(resource) {
        const old = this.find(resource.uri);
        this.resources.set(normalize(resource.uri.path), resource);
        utils_1.isSome(old)
            ? this.onDidUpdateEmitter.fire({ old: old, new: resource })
            : this.onDidAddEmitter.fire(resource);
        return this;
    }
    delete(uri) {
        const deleted = this.resources.get(normalize(uri.path));
        this.resources.delete(normalize(uri.path));
        utils_1.isSome(deleted) && this.onDidDeleteEmitter.fire(deleted);
        return deleted !== null && deleted !== void 0 ? deleted : null;
    }
    exists(uri) {
        return utils_1.isSome(this.find(uri));
    }
    list() {
        return Array.from(this.resources.values());
    }
    get(uri) {
        const note = this.find(uri);
        if (utils_1.isSome(note)) {
            return note;
        }
        else {
            throw new Error('Resource not found: ' + uri.path);
        }
    }
    listById(resourceId) {
        let needle = '/' + resourceId;
        if (!hasExtension(needle)) {
            needle = needle + '.md';
        }
        needle = normalize(needle);
        let resources = [];
        for (const key of this.resources.keys()) {
            if (key.endsWith(needle)) {
                resources.push(this.resources.get(normalize(key)));
            }
        }
        return resources;
    }
    /**
     * Returns the minimal identifier for the given resource
     *
     * @param forResource the resource to compute the identifier for
     */
    getIdentifier(forResource) {
        const amongst = [];
        const base = forResource.path.split('/').pop();
        for (const res of this.resources.values()) {
            // Just a quick optimization to only add the elements that might match
            if (res.uri.path.endsWith(base)) {
                if (!uri_1.URI.isEqual(res.uri, forResource)) {
                    amongst.push(res.uri);
                }
            }
        }
        let identifier = utils_1.getShortestIdentifier(forResource.path, amongst.map(uri => uri.path));
        identifier = identifier.endsWith('.md')
            ? identifier.slice(0, -3)
            : identifier;
        if (forResource.fragment) {
            identifier += `#${forResource.fragment}`;
        }
        return identifier;
    }
    find(resourceId, reference) {
        var _a;
        const refType = getReferenceType(resourceId);
        if (refType === 'uri') {
            const uri = resourceId;
            return uri_1.URI.isPlaceholder(uri)
                ? null
                : (_a = this.resources.get(normalize(uri.path))) !== null && _a !== void 0 ? _a : null;
        }
        const [target, fragment] = resourceId.split('#');
        let resource = null;
        switch (refType) {
            case 'key':
                const resources = this.listById(target);
                const sorted = resources.sort((a, b) => a.uri.path.localeCompare(b.uri.path));
                resource = sorted[0];
                break;
            case 'absolute-path':
                if (!hasExtension(resourceId)) {
                    resourceId = resourceId + '.md';
                }
                const resourceUri = uri_1.URI.file(resourceId);
                resource = this.resources.get(normalize(resourceUri.path));
                break;
            case 'relative-path':
                if (utils_1.isNone(reference)) {
                    return null;
                }
                if (!hasExtension(resourceId)) {
                    resourceId = resourceId + '.md';
                }
                const relativePath = resourceId;
                const targetUri = uri_1.URI.computeRelativeURI(reference, relativePath);
                resource = this.resources.get(normalize(targetUri.path));
                break;
            default:
                throw new Error('Unexpected reference type: ' + refType);
        }
        if (!resource) {
            return null;
        }
        if (!fragment) {
            return resource;
        }
        return {
            ...resource,
            uri: uri_1.URI.withFragment(resource.uri, fragment),
        };
    }
    resolveLink(resource, link) {
        var _a;
        // TODO add tests
        const provider = this.providers.find(p => p.supports(resource.uri));
        return ((_a = provider === null || provider === void 0 ? void 0 : provider.resolveLink(this, resource, link)) !== null && _a !== void 0 ? _a : uri_1.URI.placeholder(link.target));
    }
    read(uri) {
        var _a;
        const provider = this.providers.find(p => p.supports(uri));
        return (_a = provider === null || provider === void 0 ? void 0 : provider.read(uri)) !== null && _a !== void 0 ? _a : Promise.resolve(null);
    }
    readAsMarkdown(uri) {
        var _a;
        const provider = this.providers.find(p => p.supports(uri));
        return (_a = provider === null || provider === void 0 ? void 0 : provider.readAsMarkdown(uri)) !== null && _a !== void 0 ? _a : Promise.resolve(null);
    }
    dispose() {
        this.onDidAddEmitter.dispose();
        this.onDidDeleteEmitter.dispose();
        this.onDidUpdateEmitter.dispose();
    }
}
exports.FoamWorkspace = FoamWorkspace;
const normalize = (v) => v.toLocaleLowerCase();
//# sourceMappingURL=workspace.js.map