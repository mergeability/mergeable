const test = require('node:test');
const assert = require('node:assert');
const { parseAgentOwners, matchPattern, evaluatePolicy } = require('../src/agentowners');

test('parseAgentOwners parses rules correctly', () => {
  const content = `
    rules:
      - pattern: "src/core/**"
        agent: "mergeable"
        decision: require_approval
        reason: "Core changes need review"
  `;
  const parsed = parseAgentOwners(content);
  assert.strictEqual(parsed.rules.length, 1);
  assert.strictEqual(parsed.rules[0].pattern, 'src/core/**');
  assert.strictEqual(parsed.rules[0].decision, 'require_approval');
});

test('matchPattern matches glob patterns accurately', () => {
  assert.strictEqual(matchPattern('src/core/index.js', 'src/core/**'), true);
  assert.strictEqual(matchPattern('docs/readme.md', 'src/core/**'), false);
});

test('evaluatePolicy enforces decisions correctly', () => {
  const content = `
    rules:
      - pattern: "src/core/**"
        agent: "mergeable"
        decision: deny
        reason: "Forbidden"
  `;
  const results = evaluatePolicy(content, ['src/core/index.js', 'docs/index.md'], 'mergeable');
  assert.strictEqual(results[0].decision, 'deny');
  assert.strictEqual(results[1].decision, 'allow');
});