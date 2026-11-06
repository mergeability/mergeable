const AgentOwners = require('./agentowners');

function loadConfig(configObj = {}) {
  const config = { ...configObj };
  
  if (config.agentowners || config.AGENTOWNERS) {
    config.agentownersPolicy = new AgentOwners(config.agentowners || config.AGENTOWNERS);
  } else {
    config.agentownersPolicy = new AgentOwners([]);
  }

  return config;
}

function parseAgentOwners(content) {
  return AgentOwners.parse(content);
}

module.exports = {
  loadConfig,
  parseAgentOwners,
  AgentOwners
};
