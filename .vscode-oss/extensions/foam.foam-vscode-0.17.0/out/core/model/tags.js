"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FoamTags = void 0;
const uri_1 = require("./uri");
class FoamTags {
    constructor() {
        this.tags = new Map();
        /**
         * List of disposables to destroy with the tags
         */
        this.disposables = [];
    }
    /**
     * Computes all tags in the workspace and keep them up-to-date
     *
     * @param workspace the target workspace
     * @param keepMonitoring whether to recompute the links when the workspace changes
     * @returns the FoamTags
     */
    static fromWorkspace(workspace, keepMonitoring = false) {
        let tags = new FoamTags();
        workspace
            .list()
            .forEach(resource => tags.addResourceFromTagIndex(resource));
        if (keepMonitoring) {
            tags.disposables.push(workspace.onDidAdd(resource => {
                tags.addResourceFromTagIndex(resource);
            }), workspace.onDidUpdate(change => {
                tags.updateResourceWithinTagIndex(change.old, change.new);
            }), workspace.onDidDelete(resource => {
                tags.removeResourceFromTagIndex(resource);
            }));
        }
        return tags;
    }
    dispose() {
        this.disposables.forEach(d => d.dispose());
        this.disposables = [];
    }
    updateResourceWithinTagIndex(oldResource, newResource) {
        this.removeResourceFromTagIndex(oldResource);
        this.addResourceFromTagIndex(newResource);
    }
    addResourceFromTagIndex(resource) {
        new Set(resource.tags.map(t => t.label)).forEach(tag => {
            var _a;
            const tagMeta = (_a = this.tags.get(tag)) !== null && _a !== void 0 ? _a : [];
            tagMeta.push(resource.uri);
            this.tags.set(tag, tagMeta);
        });
    }
    removeResourceFromTagIndex(resource) {
        resource.tags.forEach(t => {
            var _a;
            const tag = t.label;
            if (this.tags.has(tag)) {
                const remainingLocations = (_a = this.tags
                    .get(tag)) === null || _a === void 0 ? void 0 : _a.filter(uri => !uri_1.URI.isEqual(uri, resource.uri));
                if (remainingLocations && remainingLocations.length > 0) {
                    this.tags.set(tag, remainingLocations);
                }
                else {
                    this.tags.delete(tag);
                }
            }
        });
    }
}
exports.FoamTags = FoamTags;
//# sourceMappingURL=tags.js.map