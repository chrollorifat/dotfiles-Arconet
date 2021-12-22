"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const dated_notes_1 = require("./dated-notes");
const uri_1 = require("./core/model/uri");
const utils_1 = require("./utils");
const test_utils_vscode_1 = require("./test/test-utils-vscode");
const vsc_utils_1 = require("./utils/vsc-utils");
describe('getDailyNotePath', () => {
    const date = new Date('2021-02-07T00:00:00Z');
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const isoDate = `${year}-0${month}-0${day}`;
    test('Adds the root directory to relative directories', async () => {
        const config = 'journal';
        const expectedPath = uri_1.URI.joinPath(vsc_utils_1.fromVsCodeUri(vscode_1.workspace.workspaceFolders[0].uri), config, `${isoDate}.md`);
        const oldValue = await vscode_1.workspace
            .getConfiguration('foam')
            .get('openDailyNote.directory');
        await vscode_1.workspace
            .getConfiguration('foam')
            .update('openDailyNote.directory', config);
        const foamConfiguration = vscode_1.workspace.getConfiguration('foam');
        expect(uri_1.URI.toFsPath(dated_notes_1.getDailyNotePath(foamConfiguration, date))).toEqual(uri_1.URI.toFsPath(expectedPath));
        await vscode_1.workspace
            .getConfiguration('foam')
            .update('openDailyNote.directory', oldValue);
    });
    test('Uses absolute directories without modification', async () => {
        const config = utils_1.isWindows
            ? 'C:\\absolute_path\\journal'
            : '/absolute_path/journal';
        const expectedPath = utils_1.isWindows
            ? `${config}\\${isoDate}.md`
            : `${config}/${isoDate}.md`;
        const oldValue = await vscode_1.workspace
            .getConfiguration('foam')
            .get('openDailyNote.directory');
        await vscode_1.workspace
            .getConfiguration('foam')
            .update('openDailyNote.directory', config);
        const foamConfiguration = vscode_1.workspace.getConfiguration('foam');
        expect(uri_1.URI.toFsPath(dated_notes_1.getDailyNotePath(foamConfiguration, date))).toMatch(expectedPath);
        await vscode_1.workspace
            .getConfiguration('foam')
            .update('openDailyNote.directory', oldValue);
    });
});
describe('Daily note template', () => {
    it('Uses the daily note variables in the template', async () => {
        const targetDate = new Date(2021, 8, 12);
        // eslint-disable-next-line no-template-curly-in-string
        await test_utils_vscode_1.createFile('hello ${FOAM_DATE_MONTH_NAME} ${FOAM_DATE_DATE} hello', [
            '.foam',
            'templates',
            'daily-note.md',
        ]);
        const config = vscode_1.workspace.getConfiguration('foam');
        const uri = dated_notes_1.getDailyNotePath(config, targetDate);
        await dated_notes_1.createDailyNoteIfNotExists(config, uri, targetDate);
        const doc = await test_utils_vscode_1.showInEditor(uri);
        const content = doc.editor.document.getText();
        expect(content).toEqual('hello September 12 hello');
    });
    afterAll(async () => {
        await test_utils_vscode_1.cleanWorkspace();
        await test_utils_vscode_1.closeEditors();
    });
});
//# sourceMappingURL=dated-notes.spec.js.map