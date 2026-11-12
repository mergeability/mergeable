const test = require('node:test');
const assert = require('node:assert');
const { runAction } = require('../src/runner');

test('runner executes policy evaluation', () => {
  const res = runAction('README.md', 'mergeable');
  assert.strictEqual(res.decision, 'allow');
});
