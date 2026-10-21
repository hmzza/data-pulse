import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import test from 'node:test';
import { analyzeInvestigation } from '../server/analysis.mjs';
const require = createRequire(import.meta.url);
const { extractSqlColumns } = require('../node_modules/.tmp/test-utils/sqlColumns.js');
const { withinDateRange, buildDashboardTrend, localDateKey } = require('../node_modules/.tmp/test-utils/dashboardDates.js');

test('SQL output columns handle CTEs, nested functions, aliases and comments', () => {
  assert.deepEqual(extractSqlColumns(`WITH cte AS (SELECT internal_id, flag FROM source)
    SELECT c.internal_id AS customer_id, COALESCE(c.flag, 'FROM, SELECT') status,
    CAST(amount AS DECIMAL(10,2)) AS total, c.[Account Name], c."quoted", c.\`code\`
    FROM cte c -- SELECT bad
    WHERE c.flag = 'active'`), ['Account Name', 'code', 'customer_id', 'quoted', 'status', 'total']);
});

test('SQL output columns handle union, distinct, top and unknown wildcards', () => {
  assert.deepEqual(extractSqlColumns('SELECT DISTINCT TOP (10) a.id, SUM(a.amount) AS total FROM a GROUP BY a.id UNION SELECT id, amount FROM b'), ['id', 'total']);
  assert.deepEqual(extractSqlColumns('SELECT *, a.*, a.x + a.y, COUNT(*) FROM a'), []);
  assert.deepEqual(extractSqlColumns('SELECT id, id FROM a'), ['id']);
  assert.deepEqual(extractSqlColumns('UPDATE a SET x = 1'), []);
});

test('date filter includes the entire end date, open bounds, and rejects invalid ranges', () => {
  assert.equal(withinDateRange('2026-10-21T23:59:59', '2026-10-21', '2026-10-21'), true);
  assert.equal(withinDateRange('2026-10-22T00:00:00', '', '2026-10-21'), false);
  assert.equal(withinDateRange('2026-10-20T23:59:59', '2026-10-21', ''), false);
  assert.equal(withinDateRange('2026-10-21T12:00:00', '', ''), true);
  assert.equal(withinDateRange('2026-10-21', '2026-10-22', '2026-10-20'), false);
  assert.equal(withinDateRange('bad date', '', ''), false);
  const instant = new Date('2026-10-21T23:30:00Z');
  assert.equal(withinDateRange(instant.toISOString(), localDateKey(instant), localDateKey(instant)), true);
});

test('historical chart ranges retain all matching investigations and empty days', () => {
  const items = [{ createdAt: '2024-01-02T12:00:00', priority: 'High' }, { createdAt: '2024-01-03T12:00:00', priority: 'Low' }];
  const rows = buildDashboardTrend(items, '2024-01-01', '2024-01-03');
  assert.equal(rows.length, 3);
  assert.deepEqual(rows.map(({ investigations, highPriority }) => [investigations, highPriority]), [[0, 0], [1, 1], [1, 0]]);
  const months = buildDashboardTrend(items, '2023-12-01', '2024-02-29', true);
  assert.equal(months.length, 3);
  assert.equal(months[1].investigations, 2);
  assert.equal(buildDashboardTrend(items, '', '').reduce((sum, row) => sum + row.investigations, 0), 2);
  assert.deepEqual(buildDashboardTrend([], '2026-10-22', '2026-10-20'), []);
});

test('AI requests use Luna by default and validate structured recommendations without network', async () => {
  const originalFetch = globalThis.fetch;
  const originalKey = process.env.OPENAI_API_KEY;
  const originalModel = process.env.OPENAI_MODEL;
  process.env.OPENAI_API_KEY = 'test-key';
  delete process.env.OPENAI_MODEL;
  const analysis = {
    analysisBasis: 'SQL only', issueInterpretation: 'Missing customers', summary: 'Review join', confidence: 'Low',
    possibleRootCauses: ['Inner join'], suspiciousSqlSnippets: [], missingCustomerHypotheses: [], mismatchHypotheses: [],
    limitations: ['No database access'], recommendedChecks: ['Compare counts'], recommendations: ['Validate a left join in staging'],
  };
  let requestBody;
  globalThis.fetch = async (_url, init) => {
    requestBody = JSON.parse(init.body);
    return new Response(JSON.stringify({ id: 'resp_test', object: 'response', status: 'completed', output: [{ type: 'message', role: 'assistant', content: [{ type: 'output_text', text: JSON.stringify(analysis), annotations: [] }] }] }), { headers: { 'Content-Type': 'application/json' } });
  };
  try {
    const result = await analyzeInvestigation({ issue: { fieldComparisons: [], issueDescription: 'Customers are missing' }, reports: [{ name: 'Report', filename: 'report.sql', sqlCode: 'SELECT id FROM customers' }] });
    assert.equal(requestBody.model, 'gpt-6-luna');
    assert.ok(requestBody.text.format.schema.required.includes('recommendations'));
    assert.deepEqual(result.recommendations, analysis.recommendations);
    assert.equal(result.model, 'gpt-6-luna');
  } finally {
    globalThis.fetch = originalFetch;
    if (originalKey === undefined) delete process.env.OPENAI_API_KEY; else process.env.OPENAI_API_KEY = originalKey;
    if (originalModel === undefined) delete process.env.OPENAI_MODEL; else process.env.OPENAI_MODEL = originalModel;
  }
});
