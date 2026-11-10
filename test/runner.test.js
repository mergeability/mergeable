const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { runPolicyCheck } = require('../src/runner');

test('runPolicyCheck handles missing config gracefully', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'agentowners-'));
  const results = runPolicyCheck(['src/index.js'], 'mergeable', tmpDir);
  assert.strictEqual(results.length, 1);
  assert.strictEqual(results[0].decision, 'allow');
});
