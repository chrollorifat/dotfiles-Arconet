"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const vsc_utils_1 = require("./vsc-utils");
describe('URI conversion', () => {
    it('converts between Foam and VS Code URI', () => {
        const vsUnixUri = vscode_1.Uri.file('/this/is/a/path');
        const fUnixUri = vsc_utils_1.fromVsCodeUri(vsUnixUri);
        expect(vsc_utils_1.toVsCodeUri(fUnixUri)).toEqual(expect.objectContaining(fUnixUri));
        const vsWinUpperDriveUri = vscode_1.Uri.file('C:\\this\\is\\a\\path');
        const fWinUpperUri = vsc_utils_1.fromVsCodeUri(vsWinUpperDriveUri);
        expect(vsc_utils_1.toVsCodeUri(fWinUpperUri)).toEqual(expect.objectContaining(fWinUpperUri));
        const vsWinLowerUri = vscode_1.Uri.file('c:\\this\\is\\a\\path');
        const fWinLowerUri = vsc_utils_1.fromVsCodeUri(vsWinLowerUri);
        expect(vsc_utils_1.toVsCodeUri(fWinLowerUri)).toEqual(expect.objectContaining({
            ...fWinLowerUri,
            path: fWinUpperUri.path,
        }));
    });
});
//# sourceMappingURL=vsc-utils.spec.js.map