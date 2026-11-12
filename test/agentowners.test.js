const test = require('node:test');
const assert = require('node:assert');
const { parseAgentOwners, evaluatePolicy } = require('../src/agentowners');
const fs = require('fs');

test('parseAgentOwners parses rules correctly', () => {
  const sample = `
rules:
  - pattern: "src/core/**"
    agent: "mergeable"
    decision: require_approval
    reason: "Core changes"
`;
  const parsed = parseAgentOwners(sample);
  assert.strictEqual(parsed.rules.length, 1);
  assert.strictEqual(parsed.rules[0].pattern, 'src/core/**');
  assert.strictEqual(parsed.rules[0].decision, 'require_approval');
});

test('evaluatePolicy enforces rule correctly', () => {
  const policyContent = `
rules:
  - pattern: "src/core/**"
    agent: "mergeable"
    decision: require_approval
    reason: "Core changes"
`;
  fs.writeFileSync('.agentowners_test', policyContent);
  const res = evaluatePolicy('src/core/index.js', 'mergeable', '.agentowners_test');
  assert.strictEqual(res.decision, 'require_approval');
  fs.unlinkSync('.agentowners_test');
});
