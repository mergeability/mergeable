const AgentOwners = require('./agentowners');

class Runner {
  constructor(config = {}) {
    this.config = config;
    if (config.agentownersPolicy instanceof AgentOwners) {
      this.agentowners = config.agentownersPolicy;
    } else if (config.agentowners || config.AGENTOWNERS) {
      this.agentowners = new AgentOwners(config.agentowners || config.AGENTOWNERS);
    } else {
      this.agentowners = new AgentOwners([]);
    }
  }

  evaluatePolicy(context = {}) {
    const { files = [], agent = context.agent || 'bot', action = context.action || 'run' } = context;
    return this.agentowners.evaluate({ files, agent, action });
  }

  async run(context = {}) {
    const policyResult = this.evaluatePolicy(context);

    if (policyResult.denied) {
      return {
        status: 'denied',
        executed: false,
        reason: policyResult.reasons.length > 0
          ? policyResult.reasons.join('; ')
          : 'Action denied by AGENTOWNERS policy',
        policyResult
      };
    }

    if (policyResult.requiresApproval) {
      return {
        status: 'require_approval',
        executed: false,
        reason: policyResult.reasons.length > 0
          ? policyResult.reasons.join('; ')
          : 'Action requires manual approval by AGENTOWNERS policy',
        policyResult
      };
    }

    return {
      status: 'success',
      executed: true,
      policyResult
    };
  }
}

module.exports = Runner;
