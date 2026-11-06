const assert = require('assert');
const AgentOwners = require('../src/agentowners');

describe('AgentOwners Policy Engine', () => {
  it('should default to allow when no rules exist', () => {
    const policy = new AgentOwners([]);
    const res = policy.evaluate({ files: ['src/index.js'], agent: 'test-bot' });
    assert.strictEqual(res.decision, 'allow');
    assert.strictEqual(res.allowed, true);
    assert.strictEqual(res.denied, false);
  });

  it('should parse AGENTOWNERS string rules correctly', () => {
    const content = `
      # Security policy
      src/security/** * deny Security files restricted
      docs/** doc-bot allow
    `;
    const policy = new AgentOwners(content);
    assert.strictEqual(policy.rules.length, 2);
    assert.strictEqual(policy.rules[0].pattern, 'src/security/**');
    assert.strictEqual(policy.rules[0].action, 'deny');
  });

  it('should enforce deny policy over require_approval and allow', () => {
    const policy = new AgentOwners([
      { pattern: 'src/**', action: 'require_approval', agents: ['*'] },
      { pattern: 'src/secret/**', action: 'deny', agents: ['*'], reason: 'Top secret' }
    ]);

    const res = policy.evaluate({ files: ['src/secret/key.pem'], agent: 'bot' });
    assert.strictEqual(res.decision, 'deny');
    assert.strictEqual(res.denied, true);
    assert.deepStrictEqual(res.reasons, ['Top secret']);
  });

  it('should enforce require_approval policy when matched', () => {
    const policy = new AgentOwners([
      { pattern: 'src/**', action: 'require_approval', agents: ['*'] }
    ]);

    const res = policy.evaluate({ files: ['src/app.js'], agent: 'bot' });
    assert.strictEqual(res.decision, 'require_approval');
    assert.strictEqual(res.requiresApproval, true);
  });

  it('should allow if agent does not match restricted rule', () => {
    const policy = new AgentOwners([
      { pattern: 'src/**', action: 'deny', agents: ['untrusted-bot'] }
    ]);

    const res = policy.evaluate({ files: ['src/app.js'], agent: 'trusted-bot' });
    assert.strictEqual(res.decision, 'allow');
    assert.strictEqual(res.allowed, true);
  });
});
