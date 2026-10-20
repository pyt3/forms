const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');

const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'QualityLabHub.html'), 'utf8');
const backend = fs.readFileSync(path.join(root, 'รหัส.js'), 'utf8');
const ink = [{ type: 'typed', text: 'Monthly signer' }];

function frontendFunction(name) {
    const start = html.search(new RegExp(`^        (?:async )?function ${name}\\(`, 'm'));
    assert.ok(start >= 0, `Missing function ${name}`);
    const rest = html.slice(start);
    for (const match of rest.matchAll(/^        }\r?$/gm)) {
        const candidate = rest.slice(0, match.index + match[0].length);
        try {
            new vm.Script(candidate);
            return candidate;
        } catch (error) {
            if (!(error instanceof SyntaxError)) throw error;
        }
    }
    throw new Error(`Incomplete function ${name}`);
}

function backendContext() {
    const context = vm.createContext({
        BetterLog: { useSpreadsheet: () => ({}) },
        Utilities: { formatDate: (date) => date.toISOString().slice(0, 10) },
        Session: { getScriptTimeZone: () => 'Asia/Bangkok' }
    });
    vm.runInContext(backend, context);
    return context;
}

function frontendContext(extra = {}) {
    const context = vm.createContext({
        getRecordDataSource: (record) => record.data || {},
        getRecordSummaryType: (record) => record.type || '',
        ...extra
    });
    vm.runInContext(frontendFunction('getIqcMonthlySummarySignaturePack'), context);
    return context;
}

function summary(operator = [], supervisor = []) {
    return {
        type: 'IQC_SUMMARY', recordDate: '2026-10-01',
        data: { summaryMonth: '2026-10', summarySignatureData: { operator, supervisor } },
        operatorSignatureData: operator, supervisorSignatureData: supervisor
    };
}

test('monthly summary accepts either signer first and both signers', () => {
    const context = backendContext();
    for (const record of [summary(ink), summary([], ink), summary(ink, ink)]) {
        assert.doesNotThrow(() => context.validateRecordPayload_(record));
    }
});

test('monthly summary rejects unsigned, invalid month and mismatched date', () => {
    const context = backendContext();
    assert.throws(() => context.validateRecordPayload_(summary()));
    for (const month of ['2026-13', '2026-00', '2026-9', '2026-09']) {
        const record = summary(ink);
        record.data.summaryMonth = month;
        assert.throws(() => context.validateRecordPayload_(record));
    }
    assert.throws(() => context.validateRecordPayload_({ type: 'UNKNOWN' }));
    assert.throws(() => context.validateRecordPayload_({ type: 'IQC', operatorSignatureData: ink, data: {} }));
    assert.throws(() => context.validateRecordPayload_({ type: 'EQA', operatorSignatureData: ink, data: {} }));
});

test('monthly signatures survive spreadsheet save, reload and second signer update', () => {
    const context = backendContext();
    const rows = [];
    let unlocked = 0;
    context.LockService = { getScriptLock: () => ({ tryLock: () => true, releaseLock: () => unlocked++ }) };
    context.generateNewId_ = () => 'IQC-summary-test';
    context.findRowById_ = (id) => {
        const index = rows.findIndex((row) => row[0] === id);
        return index < 0 ? 0 : index + 2;
    };
    context.getSheet_ = () => ({
        appendRow: (row) => rows.push(row),
        getRange: (row, column) => ({
            getValue: () => rows[row - 2][column - 1],
            setValues: ([values]) => { rows[row - 2] = values; }
        })
    });
    const first = context.upsertRecord_(summary([], ink));
    assert.equal(first.type, 'IQC_SUMMARY');
    assert.equal(first.operatorSignatureData.length, 0);
    assert.equal(first.supervisorSignatureData.length, 1);
    const next = summary(ink, first.supervisorSignatureData);
    next.id = first.id;
    const saved = context.upsertRecord_(next);
    assert.equal(rows.length, 1);
    assert.equal(unlocked, 2);
    const frontend = frontendContext();
    const pack = frontend.getIqcMonthlySummarySignaturePack(saved);
    assert.equal(pack.operator.length, 1);
    assert.equal(pack.supervisor.length, 1);
});

test('signature pack never treats daily signatures as monthly approval', () => {
    const context = frontendContext();
    const pack = context.getIqcMonthlySummarySignaturePack({
        type: 'IQC', operatorSignatureData: ink, supervisorSignatureData: ink
    });
    assert.equal(pack.operator.length, 0);
    assert.equal(pack.supervisor.length, 0);
    assert.equal(context.getIqcMonthlySummarySignaturePack(summary(ink)).supervisor.length, 0);
});

test('export uses only the selected monthly summary, including an unsigned role', async () => {
    for (const monthly of [null, summary(ink), summary([], ink), summary(ink, ink)]) {
        let captured;
        const stop = new Error('Captured export cover');
        const month = {
            isValid: () => true, clone() { return this; }, startOf() { return this; }, endOf() { return this; },
            format: (format) => format === 'YYYY-MM' ? '2026-10' : '2026-10-01',
            toDate: () => new Date('2026-10-01'), month: () => 9
        };
        const context = frontendContext({
            document: { fonts: { ready: Promise.resolve() }, title: 'QualityLabHub' },
            moment: () => month,
            Swal: { fire() {} },
            getRecordsApi: async ({ type }) => type === 'IQC' ? [{
                type: 'IQC', data: {}, operatorSignatureData: ink, supervisorSignatureData: ink
            }] : monthly ? [monthly] : [],
            getMonthlySummarySourceRecord: (records, key) => {
                assert.equal(key, '2026-10');
                return records[0] || null;
            },
            formatGregorianMonthYear: () => ({ monthName: 'October', year: '2026' }),
            sanitizePdfFileNamePart: (value) => value || '',
            getIqcMonthlyRecordMap: () => new Map(), getIqcCoverControlSets: () => [],
            getDesignToken: () => '#000',
            buildIqcCoverPage: (_current, _month, _year, signatures) => { captured = signatures; throw stop; }
        });
        vm.runInContext(frontendFunction('exportIQC'), context);
        await assert.rejects(context.exportIQC('2026-10'), (error) => error === stop);
        assert.equal(captured.operator.length, monthly?.operatorSignatureData.length || 0);
        assert.equal(captured.supervisor.length, monthly?.supervisorSignatureData.length || 0);
    }
});

test('all inline JavaScript and backend JavaScript parse', () => {
    new vm.Script(backend);
    for (const [, script] of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)) {
        new vm.Script(script);
    }
});
