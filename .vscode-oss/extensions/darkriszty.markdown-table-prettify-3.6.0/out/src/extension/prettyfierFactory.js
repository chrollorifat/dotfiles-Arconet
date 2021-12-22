"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDocumentPrettyfierCommand = exports.getDocumentPrettyfier = exports.getDocumentRangePrettyfier = exports.getSupportLanguageIds = void 0;
const vscode = require("vscode");
const configSizeLimitCheker_1 = require("../prettyfiers/sizeLimit/configSizeLimitCheker");
const tableDocumentPrettyfier_1 = require("./tableDocumentPrettyfier");
const tableDocumentPrettyfierCommand_1 = require("./tableDocumentPrettyfierCommand");
const tableFinder_1 = require("../tableFinding/tableFinder");
const tableDocumentRangePrettyfier_1 = require("./tableDocumentRangePrettyfier");
const consoleLogger_1 = require("../diagnostics/consoleLogger");
const vsWindowLogger_1 = require("../diagnostics/vsWindowLogger");
const tableFactory_1 = require("../modelFactory/tableFactory");
const alignmentFactory_1 = require("../modelFactory/alignmentFactory");
const tableValidator_1 = require("../modelFactory/tableValidator");
const contentPadCalculator_1 = require("../padCalculation/contentPadCalculator");
const tableViewModelFactory_1 = require("../viewModelFactories/tableViewModelFactory");
const rowViewModelFactory_1 = require("../viewModelFactories/rowViewModelFactory");
const borderTransformer_1 = require("../modelFactory/transformers/borderTransformer");
const trimmerTransformer_1 = require("../modelFactory/transformers/trimmerTransformer");
const tableIndentationDetector_1 = require("../modelFactory/tableIndentationDetector");
const selectionInterpreter_1 = require("../modelFactory/selectionInterpreter");
const padCalculatorSelector_1 = require("../padCalculation/padCalculatorSelector");
const alignmentMarking_1 = require("../viewModelFactories/alignmentMarking");
const multiTablePrettyfier_1 = require("../prettyfiers/multiTablePrettyfier");
const singleTablePrettyfier_1 = require("../prettyfiers/singleTablePrettyfier");
const tableStringWriter_1 = require("../writers/tableStringWriter");
const valuePaddingProvider_1 = require("../writers/valuePaddingProvider");
function getSupportLanguageIds() {
    return ["markdown", ...getConfigurationValue("extendedLanguages", [])];
}
exports.getSupportLanguageIds = getSupportLanguageIds;
function getDocumentRangePrettyfier() {
    return new tableDocumentRangePrettyfier_1.TableDocumentRangePrettyfier(getMultiTablePrettyfier());
}
exports.getDocumentRangePrettyfier = getDocumentRangePrettyfier;
function getDocumentPrettyfier() {
    return new tableDocumentPrettyfier_1.TableDocumentPrettyfier(getMultiTablePrettyfier());
}
exports.getDocumentPrettyfier = getDocumentPrettyfier;
function getDocumentPrettyfierCommand() {
    return new tableDocumentPrettyfierCommand_1.TableDocumentPrettyfierCommand(getMultiTablePrettyfier());
}
exports.getDocumentPrettyfierCommand = getDocumentPrettyfierCommand;
function getMultiTablePrettyfier() {
    const loggers = getLoggers();
    const sizeLimitCheker = getSizeLimitChecker(loggers);
    const columnPadding = getConfigurationValue("columnPadding", 0);
    return new multiTablePrettyfier_1.MultiTablePrettyfier(new tableFinder_1.TableFinder(new tableValidator_1.TableValidator(new selectionInterpreter_1.SelectionInterpreter(true))), getSingleTablePrettyfier(loggers, sizeLimitCheker, columnPadding), sizeLimitCheker);
}
function getSingleTablePrettyfier(loggers, sizeLimitCheker, columnPadding) {
    return new singleTablePrettyfier_1.SingleTablePrettyfier(new tableFactory_1.TableFactory(new alignmentFactory_1.AlignmentFactory(), new selectionInterpreter_1.SelectionInterpreter(false), new trimmerTransformer_1.TrimmerTransformer(new borderTransformer_1.BorderTransformer(null)), new tableIndentationDetector_1.FairTableIndentationDetector()), new tableValidator_1.TableValidator(new selectionInterpreter_1.SelectionInterpreter(false)), new tableViewModelFactory_1.TableViewModelFactory(new rowViewModelFactory_1.RowViewModelFactory(new contentPadCalculator_1.ContentPadCalculator(new padCalculatorSelector_1.PadCalculatorSelector(), " "), new alignmentMarking_1.AlignmentMarkerStrategy(":"))), new tableStringWriter_1.TableStringWriter(new valuePaddingProvider_1.ValuePaddingProvider(columnPadding)), loggers, sizeLimitCheker);
}
function getLoggers() {
    const canShowWindowMessages = getConfigurationValue("showWindowMessages", true);
    return [
        ...(canShowWindowMessages ? [new vsWindowLogger_1.VsWindowLogger()] : []),
        new consoleLogger_1.ConsoleLogger()
    ];
}
function getSizeLimitChecker(loggers) {
    const maxTextLength = getConfigurationValue("maxTextLength", 1000000);
    return new configSizeLimitCheker_1.ConfigSizeLimitChecker(loggers, maxTextLength);
}
function getConfigurationValue(key, defaultValue) {
    return vscode.workspace.getConfiguration("markdownTablePrettify").get(key, defaultValue);
}
//# sourceMappingURL=prettyfierFactory.js.map