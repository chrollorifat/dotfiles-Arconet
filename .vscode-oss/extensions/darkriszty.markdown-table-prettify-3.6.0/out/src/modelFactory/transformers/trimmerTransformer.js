"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrimmerTransformer = void 0;
const transformer_1 = require("./transformer");
const cell_1 = require("../../models/cell");
const row_1 = require("../../models/row");
const table_1 = require("../../models/table");
class TrimmerTransformer extends transformer_1.Transformer {
    transform(input) {
        return new table_1.Table(this.trimColumnValues(input.rows), input.separatorEOL, input.alignments, input.leftPad);
    }
    trimColumnValues(rows) {
        let result = [];
        if (rows == null)
            return result;
        for (let i = 0; i < rows.length; i++)
            result.push(new row_1.Row(rows[i].cells.map(cell => new cell_1.Cell(cell.getValue().trim())), rows[i].EOL));
        return result;
    }
}
exports.TrimmerTransformer = TrimmerTransformer;
//# sourceMappingURL=trimmerTransformer.js.map