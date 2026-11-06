const assert = require('assert');
const Runner = require('../src/runner');
const { loadConfig } = require('../src/config');

describe('Runner Policy Integration', () => {
  it('should execute successfully when policy allows', async () => {
    const config = loadConfig({
      agentowners: [
        { pattern: 'docs/**', action: 'allow', agents: ['*'] }
      ]
    });
    const runner = new Runner(config);
    const result = await runner.run({ files: ['docs/readme.md'], agent: 'doc-bot' });
    assert.strictEqual(result.status, 'success');
    assert.strictEqual(result.executed, true);
  });

  it('should block execution when policy denies', async () => {
    const config = loadConfig({
      agentowners: [
        { pattern: 'src/security/**', action: 'deny', agents: ['*'], reason: 'Protected area' }
      ]
    });
    const runner = new Runner(config);
    const result = await runner.run({ files: ['src/security/auth.js'], agent: 'bot' });
    assert.strictEqual(result.status, 'denied');
    assert.strictEqual(result.executed, false);
    assert.strictEqual(result.reason, 'Protected area');
  });

  it('should request approval when policy demands require_approval', async () => {
    const config = loadConfig({
      agentowners: [
        { pattern: 'package.json', action: 'require_approval', agents: ['*'], reason: 'Dependency changes require review' }
      ]
    });
    const runner = new Runner(config);
    const result = await runner.run({ files: ['package.json'], agent: 'dep-bot' });
    assert.strictEqual(result.status, 'require_approval');
    assert.strictEqual(result.executed, false);
    assert.strictEqual(result.reason, 'Dependency changes require review');
  });
});
