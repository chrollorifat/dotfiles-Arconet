"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bootstrap = void 0;
const workspace_1 = require("./workspace");
const graph_1 = require("./graph");
const markdown_provider_1 = require("../markdown-provider");
const tags_1 = require("./tags");
exports.bootstrap = async (matcher, dataStore, initialProviders) => {
    const parser = markdown_provider_1.createMarkdownParser([]);
    const workspace = new workspace_1.FoamWorkspace();
    await Promise.all(initialProviders.map(p => workspace.registerProvider(p)));
    const graph = graph_1.FoamGraph.fromWorkspace(workspace, true);
    const tags = tags_1.FoamTags.fromWorkspace(workspace, true);
    const foam = {
        workspace,
        graph,
        tags,
        services: {
            dataStore,
            parser,
            matcher,
        },
        dispose: () => {
            workspace.dispose();
            graph.dispose();
        },
    };
    return foam;
};
//# sourceMappingURL=foam.js.map