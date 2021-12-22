"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Resolver = exports.findFoamVariables = exports.substituteVariables = void 0;
const editor_1 = require("./editor");
const vscode_1 = require("vscode");
const errors_1 = require("./errors");
const knownFoamVariables = new Set([
    'FOAM_TITLE',
    'FOAM_SELECTED_TEXT',
    'FOAM_DATE_YEAR',
    'FOAM_DATE_YEAR_SHORT',
    'FOAM_DATE_MONTH',
    'FOAM_DATE_MONTH_NAME',
    'FOAM_DATE_MONTH_NAME_SHORT',
    'FOAM_DATE_DATE',
    'FOAM_DATE_DAY_NAME',
    'FOAM_DATE_DAY_NAME_SHORT',
    'FOAM_DATE_HOUR',
    'FOAM_DATE_MINUTE',
    'FOAM_DATE_SECOND',
    'FOAM_DATE_SECONDS_UNIX',
]);
function substituteVariables(text, variables) {
    variables.forEach((value, variable) => {
        const regex = new RegExp(
        // Matches a limited subset of the the TextMate variable syntax:
        //  ${VARIABLE}  OR   $VARIABLE
        `\\\${${variable}}|\\$${variable}(\\W|$)`, 
        // The latter is more complicated, since it needs to avoid replacing
        // longer variable names with the values of variables that are
        // substrings of the longer ones (e.g. `$FOO` and `$FOOBAR`. If you
        // replace $FOO first, and aren't careful, you replace the first
        // characters of `$FOOBAR`)
        'g' // 'g' => Global replacement (i.e. not just the first instance)
        );
        text = text.replace(regex, `${value}$1`);
    });
    return text;
}
exports.substituteVariables = substituteVariables;
function findFoamVariables(templateText) {
    const regex = /\$(FOAM_[_a-zA-Z0-9]*)|\${(FOAM_[[_a-zA-Z0-9]*)}/g;
    var matches = [];
    const output = [];
    while ((matches = regex.exec(templateText))) {
        output.push(matches[1] || matches[2]);
    }
    const uniqVariables = [...new Set(output)];
    const knownVariables = uniqVariables.filter(x => knownFoamVariables.has(x));
    return knownVariables;
}
exports.findFoamVariables = findFoamVariables;
class Resolver {
    /**
     * Create a resolver
     *
     * @param givenValues the map of variable name to value
     * @param foamDate the date used to fill FOAM_DATE_* variables
     * @param extraVariablesToResolve other variables to always resolve, even if not present in text
     */
    constructor(givenValues, foamDate, extraVariablesToResolve = new Set()) {
        this.givenValues = givenValues;
        this.foamDate = foamDate;
        this.extraVariablesToResolve = extraVariablesToResolve;
        this.promises = new Map();
    }
    /**
     * Adds a variable definition in the resolver
     *
     * @param name the name of the variable
     * @param value the value of the variable
     */
    define(name, value) {
        this.givenValues.set(name, value);
    }
    /**
     * Process a string, replacing the variables with their values
     *
     * @param text the text to resolve
     * @returns an array, where the first element is the resolution map,
     *          and the second is the processed text
     */
    async resolveText(text) {
        const variablesInTemplate = findFoamVariables(text.toString());
        const variables = variablesInTemplate.concat(...this.extraVariablesToResolve);
        const uniqVariables = [...new Set(variables)];
        const resolvedValues = await this.resolveAll(uniqVariables);
        if (resolvedValues.get('FOAM_SELECTED_TEXT') &&
            !variablesInTemplate.includes('FOAM_SELECTED_TEXT')) {
            text = text.endsWith('\n')
                ? `${text}\${FOAM_SELECTED_TEXT}\n`
                : `${text}\n\${FOAM_SELECTED_TEXT}`;
            variablesInTemplate.push('FOAM_SELECTED_TEXT');
            variables.push('FOAM_SELECTED_TEXT');
            uniqVariables.push('FOAM_SELECTED_TEXT');
        }
        const subbedText = substituteVariables(text.toString(), resolvedValues);
        return [resolvedValues, subbedText];
    }
    /**
     * Resolves a list of variables
     *
     * @param variables a list of variables to resolve
     * @returns a Map of variable name to its value
     */
    async resolveAll(variables) {
        const promises = variables.map(async (variable) => Promise.resolve([variable, await this.resolve(variable)]));
        const results = await Promise.all(promises);
        const valueByName = new Map();
        results.forEach(([variable, value]) => {
            valueByName.set(variable, value);
        });
        return valueByName;
    }
    /**
     * Resolve a variable
     *
     * @param name the variable name
     * @returns the resolved value, or the name of the variable if nothing is found
     */
    resolve(name) {
        if (this.givenValues.has(name)) {
            this.promises.set(name, Promise.resolve(this.givenValues.get(name)));
        }
        else if (!this.promises.has(name)) {
            switch (name) {
                case 'FOAM_TITLE':
                    this.promises.set(name, resolveFoamTitle());
                    break;
                case 'FOAM_SELECTED_TEXT':
                    this.promises.set(name, Promise.resolve(resolveFoamSelectedText()));
                    break;
                case 'FOAM_DATE_YEAR':
                    this.promises.set(name, Promise.resolve(this.foamDate.toLocaleString('default', { year: 'numeric' })));
                    break;
                case 'FOAM_DATE_YEAR_SHORT':
                    this.promises.set(name, Promise.resolve(this.foamDate.toLocaleString('default', { year: '2-digit' })));
                    break;
                case 'FOAM_DATE_MONTH':
                    this.promises.set(name, Promise.resolve(this.foamDate.toLocaleString('default', { month: '2-digit' })));
                    break;
                case 'FOAM_DATE_MONTH_NAME':
                    this.promises.set(name, Promise.resolve(this.foamDate.toLocaleString('default', { month: 'long' })));
                    break;
                case 'FOAM_DATE_MONTH_NAME_SHORT':
                    this.promises.set(name, Promise.resolve(this.foamDate.toLocaleString('default', { month: 'short' })));
                    break;
                case 'FOAM_DATE_DATE':
                    this.promises.set(name, Promise.resolve(this.foamDate.toLocaleString('default', { day: '2-digit' })));
                    break;
                case 'FOAM_DATE_DAY_NAME':
                    this.promises.set(name, Promise.resolve(this.foamDate.toLocaleString('default', { weekday: 'long' })));
                    break;
                case 'FOAM_DATE_DAY_NAME_SHORT':
                    this.promises.set(name, Promise.resolve(this.foamDate.toLocaleString('default', { weekday: 'short' })));
                    break;
                case 'FOAM_DATE_HOUR':
                    this.promises.set(name, Promise.resolve(this.foamDate
                        .toLocaleString('default', {
                        hour: '2-digit',
                        hour12: false,
                    })
                        .padStart(2, '0')));
                    break;
                case 'FOAM_DATE_MINUTE':
                    this.promises.set(name, Promise.resolve(this.foamDate
                        .toLocaleString('default', {
                        minute: '2-digit',
                        hour12: false,
                    })
                        .padStart(2, '0')));
                    break;
                case 'FOAM_DATE_SECOND':
                    this.promises.set(name, Promise.resolve(this.foamDate
                        .toLocaleString('default', {
                        second: '2-digit',
                        hour12: false,
                    })
                        .padStart(2, '0')));
                    break;
                case 'FOAM_DATE_SECONDS_UNIX':
                    this.promises.set(name, Promise.resolve((this.foamDate.getTime() / 1000).toString().padStart(2, '0')));
                    break;
                default:
                    this.promises.set(name, Promise.resolve(name));
                    break;
            }
        }
        const result = this.promises.get(name);
        return result;
    }
}
exports.Resolver = Resolver;
async function resolveFoamTitle() {
    const title = await vscode_1.window.showInputBox({
        prompt: `Enter a title for the new note`,
        value: 'Title of my New Note',
        validateInput: value => value.trim().length === 0 ? 'Please enter a title' : undefined,
    });
    if (title === undefined) {
        throw new errors_1.UserCancelledOperation();
    }
    return title;
}
function resolveFoamSelectedText() {
    var _a, _b;
    return (_b = (_a = editor_1.findSelectionContent()) === null || _a === void 0 ? void 0 : _a.content) !== null && _b !== void 0 ? _b : '';
}
//# sourceMappingURL=variable-resolver.js.map