"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CliPrettify = void 0;
const multiTablePrettyfier_1 = require("../src/prettyfiers/multiTablePrettyfier");
const tableFinder_1 = require("../src/tableFinding/tableFinder");
const tableValidator_1 = require("../src/modelFactory/tableValidator");
const selectionInterpreter_1 = require("../src/modelFactory/selectionInterpreter");
const tableFactory_1 = require("../src/modelFactory/tableFactory");
const alignmentFactory_1 = require("../src/modelFactory/alignmentFactory");
const borderTransformer_1 = require("../src/modelFactory/transformers/borderTransformer");
const trimmerTransformer_1 = require("../src/modelFactory/transformers/trimmerTransformer");
const tableIndentationDetector_1 = require("../src/modelFactory/tableIndentationDetector");
const consoleLogger_1 = require("../src/diagnostics/consoleLogger");
const singleTablePrettyfier_1 = require("../src/prettyfiers/singleTablePrettyfier");
const noSizeLimitChecker_1 = require("../src/prettyfiers/sizeLimit/noSizeLimitChecker");
const tableViewModelFactory_1 = require("../src/viewModelFactories/tableViewModelFactory");
const rowViewModelFactory_1 = require("../src/viewModelFactories/rowViewModelFactory");
const contentPadCalculator_1 = require("../src/padCalculation/contentPadCalculator");
const padCalculatorSelector_1 = require("../src/padCalculation/padCalculatorSelector");
const alignmentMarking_1 = require("../src/viewModelFactories/alignmentMarking");
const tableStringWriter_1 = require("../src/writers/tableStringWriter");
const valuePaddingProvider_1 = require("../src/writers/valuePaddingProvider");
class CliPrettify {
    static prettify(text, options) {
        const prettyfier = this.createPrettyfier(options);
        return prettyfier.formatTables(text);
    }
    static check(text, options) {
        if (this.prettify(text, options) !== text) {
            throw new Error("The input file is not prettyfied!");
        }
    }
    static createPrettyfier(options) {
        var _a;
        const logger = new consoleLogger_1.ConsoleLogger();
        return new multiTablePrettyfier_1.MultiTablePrettyfier(new tableFinder_1.TableFinder(new tableValidator_1.TableValidator(new selectionInterpreter_1.SelectionInterpreter(true))), new singleTablePrettyfier_1.SingleTablePrettyfier(new tableFactory_1.TableFactory(new alignmentFactory_1.AlignmentFactory(), new selectionInterpreter_1.SelectionInterpreter(false), new trimmerTransformer_1.TrimmerTransformer(new borderTransformer_1.BorderTransformer(null)), new tableIndentationDetector_1.FairTableIndentationDetector()), new tableValidator_1.TableValidator(new selectionInterpreter_1.SelectionInterpreter(false)), new tableViewModelFactory_1.TableViewModelFactory(new rowViewModelFactory_1.RowViewModelFactory(new contentPadCalculator_1.ContentPadCalculator(new padCalculatorSelector_1.PadCalculatorSelector(), " "), new alignmentMarking_1.AlignmentMarkerStrategy(":"))), new tableStringWriter_1.TableStringWriter(new valuePaddingProvider_1.ValuePaddingProvider((_a = options === null || options === void 0 ? void 0 : options.columnPadding) !== null && _a !== void 0 ? _a : 0)), [logger], new noSizeLimitChecker_1.NoSizeLimitChecker()), new noSizeLimitChecker_1.NoSizeLimitChecker());
    }
}
exports.CliPrettify = CliPrettify;
//# sourceMappingURL=cliPrettify.js.map