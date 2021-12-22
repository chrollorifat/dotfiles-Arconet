"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Resource = void 0;
const uri_1 = require("./uri");
class Resource {
    static sortByTitle(a, b) {
        return a.title.localeCompare(b.title);
    }
    static isResource(thing) {
        if (!thing) {
            return false;
        }
        return (uri_1.URI.isUri(thing.uri) &&
            typeof thing.title === 'string' &&
            typeof thing.type === 'string' &&
            typeof thing.properties === 'object' &&
            typeof thing.tags === 'object' &&
            typeof thing.links === 'object');
    }
    static findSection(resource, label) {
        var _a;
        if (label) {
            return (_a = resource.sections.find(s => s.label === label)) !== null && _a !== void 0 ? _a : null;
        }
        return null;
    }
}
exports.Resource = Resource;
//# sourceMappingURL=note.js.map