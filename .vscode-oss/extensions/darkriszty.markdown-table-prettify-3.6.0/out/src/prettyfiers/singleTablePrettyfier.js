"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SingleTablePrettyfier = void 0;
class SingleTablePrettyfier {
    constructor(_tableFactory, _tableValidator, _viewModelFactory, _writer, _loggers, _sizeLimitChecker) {
        this._tableFactory = _tableFactory;
        this._tableValidator = _tableValidator;
        this._viewModelFactory = _viewModelFactory;
        this._writer = _writer;
        this._loggers = _loggers;
        this._sizeLimitChecker = _sizeLimitChecker;
    }
    prettifyTable(document, range) {
        let result = null;
        let message = "";
        const selection = document.getText(range);
        try {
            if (!this._sizeLimitChecker.isWithinAllowedSizeLimit(selection)) {
                return selection;
            }
            else if (this._tableValidator.isValid(selection)) {
                const table = this._tableFactory.getModel(document, range);
                const tableVm = this._viewModelFactory.build(table);
                result = this._writer.writeTable(tableVm);
            }
            else {
                message = "Can't parse table from invalid text.";
                result = selection;
            }
        }
        catch (ex) {
            this._loggers.forEach(_ => _.logError(ex));
        }
        if (!!message)
            this._loggers.forEach(_ => _.logInfo(message));
        return result;
    }
}
exports.SingleTablePrettyfier = SingleTablePrettyfier;
//# sourceMappingURL=singleTablePrettyfier.js.map