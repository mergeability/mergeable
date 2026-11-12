const fs = require('fs');
const path = require('path');

function parseAgentOwners(content) {
  const rules = [];
  const lines = content.split('\n');
  let currentRule = null;

  for (let line of lines) {
    line = line.trim();
    if (!line || line.startsWith('#')) continue;

    if (line.startsWith('- pattern:')) {
      if (currentRule) rules.push(currentRule);
      currentRule = { pattern: line.replace('- pattern:', '').trim().replace(/['"]/g, '') };
    } else if (currentRule) {
      if (line.startsWith('agent:')) {
        currentRule.agent = line.replace('agent:', '').trim().replace(/['"]/g, '');
      } else if (line.startsWith('decision:')) {
        currentRule.decision = line.replace('decision:', '').trim().replace(/['"]/g, '');
      } else if (line.startsWith('reason:')) {
        currentRule.reason = line.replace('reason:', '').trim().replace(/['"]/g, '');
      }
    }
  }
  if (currentRule) rules.push(currentRule);
  return { rules };
}

function evaluatePolicy(filePath, agentName, configPath = '.agentowners') {
  if (!fs.existsSync(configPath)) {
    return { decision: 'allow', reason: 'No AGENTOWNERS policy found' };
  }

  const content = fs.readFileSync(configPath, 'utf8');
  const policy = parseAgentOwners(content);

  for (const rule of policy.rules) {
    if (rule.agent && rule.agent !== agentName && rule.agent !== '*') continue;
    
    // Simple glob matching support (e.g. src/core/** or docs/**)
    const regexPattern = rule.pattern
      .replace(/\*\*/g, '.*')
      .replace(/\*/g, '[^/]*');
    const regex = new RegExp(`^${regexPattern}$`);

    if (regex.test(filePath)) {
      return { decision: rule.decision || 'allow', reason: rule.reason || 'Matched rule' };
    }
  }

  return { decision: 'allow', reason: 'Default allow' };
}

module.exports = { parseAgentOwners, evaluatePolicy };
