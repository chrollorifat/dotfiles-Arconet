"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FoamGraph = void 0;
const fast_array_diff_1 = require("fast-array-diff");
const lodash_1 = require("lodash");
const uri_1 = require("./uri");
const range_1 = require("./range");
const pathToPlaceholderId = (value) => value;
const uriToPlaceholderId = (uri) => pathToPlaceholderId(uri.path);
class FoamGraph {
    constructor(workspace) {
        this.workspace = workspace;
        /**
         * Placehoders by key / slug / value
         */
        this.placeholders = new Map();
        /**
         * Maps the connections starting from a URI
         */
        this.links = new Map();
        /**
         * Maps the connections arriving to a URI
         */
        this.backlinks = new Map();
        /**
         * List of disposables to destroy with the workspace
         */
        this.disposables = [];
    }
    contains(uri) {
        return this.getConnections(uri).length > 0;
    }
    getAllNodes() {
        return [
            ...Array.from(this.placeholders.values()),
            ...this.workspace.list().map(r => r.uri),
        ];
    }
    getAllConnections() {
        return Array.from(this.links.values()).flat();
    }
    getConnections(uri) {
        return [
            ...(this.links.get(uri.path) || []),
            ...(this.backlinks.get(uri.path) || []),
        ];
    }
    getLinks(uri) {
        var _a;
        return (_a = this.links.get(uri.path)) !== null && _a !== void 0 ? _a : [];
    }
    getBacklinks(uri) {
        var _a;
        return (_a = this.backlinks.get(uri.path)) !== null && _a !== void 0 ? _a : [];
    }
    /**
     * Computes all the links in the workspace, connecting notes and
     * creating placeholders.
     *
     * @param workspace the target workspace
     * @param keepMonitoring whether to recompute the links when the workspace changes
     * @returns the FoamGraph
     */
    static fromWorkspace(workspace, keepMonitoring = false) {
        let graph = new FoamGraph(workspace);
        workspace.list().forEach(resource => graph.resolveResource(resource));
        if (keepMonitoring) {
            graph.disposables.push(workspace.onDidAdd(resource => {
                graph.updateLinksRelatedToAddedResource(resource);
            }), workspace.onDidUpdate(change => {
                graph.updateLinksForResource(change.old, change.new);
            }), workspace.onDidDelete(resource => {
                graph.updateLinksRelatedToDeletedResource(resource);
            }));
        }
        return graph;
    }
    updateLinksRelatedToAddedResource(resource) {
        // check if any existing connection can be filled by new resource
        let resourcesToUpdate = [];
        for (const placeholderId of this.placeholders.keys()) {
            // quick and dirty check for affected resources
            if (resource.uri.path.endsWith(placeholderId + '.md')) {
                resourcesToUpdate.push(...this.backlinks.get(placeholderId).map(c => c.source));
                // resourcesToUpdate.push(resource);
            }
        }
        resourcesToUpdate.forEach(res => this.resolveResource(this.workspace.get(res)));
        // resolve the resource
        this.resolveResource(resource);
    }
    updateLinksForResource(oldResource, newResource) {
        if (oldResource.uri.path !== newResource.uri.path) {
            throw new Error('Unexpected State: update should only be called on same resource ' +
                {
                    old: oldResource,
                    new: newResource,
                });
        }
        if (oldResource.type === 'note' && newResource.type === 'note') {
            const patch = fast_array_diff_1.diff(oldResource.links, newResource.links, lodash_1.isEqual);
            patch.removed.forEach(link => {
                const target = this.workspace.resolveLink(oldResource, link);
                return this.disconnect(oldResource.uri, target, link);
            }, this);
            patch.added.forEach(link => {
                const target = this.workspace.resolveLink(newResource, link);
                return this.connect(newResource.uri, target, link);
            }, this);
        }
        return this;
    }
    updateLinksRelatedToDeletedResource(resource) {
        var _a, _b;
        const uri = resource.uri;
        // remove forward links from old resource
        const resourcesPointedByDeletedNote = (_a = this.links.get(uri.path)) !== null && _a !== void 0 ? _a : [];
        this.links.delete(uri.path);
        resourcesPointedByDeletedNote.forEach(connection => this.disconnect(uri, connection.target, connection.link));
        // recompute previous links to old resource
        const notesPointingToDeletedResource = (_b = this.backlinks.get(uri.path)) !== null && _b !== void 0 ? _b : [];
        this.backlinks.delete(uri.path);
        notesPointingToDeletedResource.forEach(link => this.resolveResource(this.workspace.get(link.source)));
        return this;
    }
    connect(source, target, link) {
        var _a, _b;
        const connection = { source, target, link };
        if (!this.links.has(source.path)) {
            this.links.set(source.path, []);
        }
        (_a = this.links.get(source.path)) === null || _a === void 0 ? void 0 : _a.push(connection);
        if (!this.backlinks.get(target.path)) {
            this.backlinks.set(target.path, []);
        }
        (_b = this.backlinks.get(target.path)) === null || _b === void 0 ? void 0 : _b.push(connection);
        if (uri_1.URI.isPlaceholder(target)) {
            this.placeholders.set(uriToPlaceholderId(target), target);
        }
        return this;
    }
    /**
     * Removes a connection, or all connections, between the source and
     * target resources
     *
     * @param workspace the Foam workspace
     * @param source the source resource
     * @param target the target resource
     * @param link the link reference, or `true` to remove all links
     * @returns the updated Foam workspace
     */
    disconnect(source, target, link) {
        var _a, _b, _c, _d, _e, _f;
        const connectionsToKeep = link === true
            ? (c) => !uri_1.URI.isEqual(source, c.source) || !uri_1.URI.isEqual(target, c.target)
            : (c) => !isSameConnection({ source, target, link }, c);
        this.links.set(source.path, (_b = (_a = this.links.get(source.path)) === null || _a === void 0 ? void 0 : _a.filter(connectionsToKeep)) !== null && _b !== void 0 ? _b : []);
        if (((_c = this.links.get(source.path)) === null || _c === void 0 ? void 0 : _c.length) === 0) {
            this.links.delete(source.path);
        }
        this.backlinks.set(target.path, (_e = (_d = this.backlinks.get(target.path)) === null || _d === void 0 ? void 0 : _d.filter(connectionsToKeep)) !== null && _e !== void 0 ? _e : []);
        if (((_f = this.backlinks.get(target.path)) === null || _f === void 0 ? void 0 : _f.length) === 0) {
            this.backlinks.delete(target.path);
            if (uri_1.URI.isPlaceholder(target)) {
                this.placeholders.delete(uriToPlaceholderId(target));
            }
        }
        return this;
    }
    resolveResource(resource) {
        this.links.delete(resource.uri.path);
        // prettier-ignore
        resource.links.forEach(link => {
            const targetUri = this.workspace.resolveLink(resource, link);
            this.connect(resource.uri, targetUri, link);
        });
        return this;
    }
    dispose() {
        this.disposables.forEach(d => d.dispose());
        this.disposables = [];
    }
}
exports.FoamGraph = FoamGraph;
// TODO move these utility fns to appropriate places
const isSameConnection = (a, b) => uri_1.URI.isEqual(a.source, b.source) &&
    uri_1.URI.isEqual(a.target, b.target) &&
    isSameLink(a.link, b.link);
const isSameLink = (a, b) => a.type === b.type && range_1.Range.isEqual(a.range, b.range);
//# sourceMappingURL=graph.js.map