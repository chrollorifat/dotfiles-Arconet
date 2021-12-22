"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseArguments = void 0;
function parseArguments(processArgs) {
    return {
        check: Boolean(hasArgument(ArgumentNames.CHECK_ARG) || false),
        columnPadding: Number(getArgumentValue(ArgumentNames.PADDING_ARG) || 0)
    };
    function hasArgument(key) {
        return processArgs.length > 2 && processArgs.find(arg => arg.startsWith("--" + key)) !== undefined;
    }
    function getArgumentValue(key) {
        const hasArguments = processArgs.length > 2;
        const split = (hasArguments
            ? processArgs.find(arg => arg.startsWith("--" + key)) || ""
            : "")
            .split("=");
        return split.length == 2
            ? split[1]
            : null;
    }
}
exports.parseArguments = parseArguments;
class ArgumentNames {
}
ArgumentNames.CHECK_ARG = "check";
ArgumentNames.PADDING_ARG = "columnPadding";
//# sourceMappingURL=argumentsParser.js.map