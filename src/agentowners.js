const fs = require('fs');
const path = require('path');

function parseAgentOwners(content) {
  const rules = [];
  const lines = content.split('\n');
  let currentRule = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    if (trimmed.startsWith('- pattern:')) {
      if (currentRule) rules.push(currentRule);
      currentRule = { pattern: trimmed.replace('- pattern:', '').trim().replace(/['"]+/g, '') };
    } else if (currentRule) {
      if (trimmed.startsWith('agent:')) {
        currentRule.agent = trimmed.replace('agent:', '').trim().replace(/['"]+/g, '');
      } else if (trimmed.startsWith('decision:')) {
        currentRule.decision = trimmed.replace('decision:', '').trim().replace(/['"]+/g, '');
      } else if (trimmed.startsWith('reason:')) {
        currentRule.reason = trimmed.replace('reason:', '').trim().replace(/['"]+/g, '');
      }
    }
  }
  if (currentRule) rules.push(currentRule);
  return { rules };
}

function matchPattern(filePath, pattern) {
  const regexPattern = pattern
    .replace(/\./g, '\\.')
    .replace(/\*\*\//g, '(?:.*\/)?')
    .replace(/\*\*/g, '.*')
    .replace(/\*/g, '[^\/]*');
  const regex = new RegExp(`^${regexPattern}$`);
  return regex.test(filePath);
}

function evaluatePolicy(configContent, files, agentName) {
  const policy = parseAgentOwners(configContent);
  const results = [];

  for (const file of files) {
    let matched = false;
    for (const rule of policy.rules) {
      if (rule.agent && rule.agent !== agentName) continue;
      if (matchPattern(file, rule.pattern)) {
        results.push({ file, decision: rule.decision, reason: rule.reason, rule });
        matched = true;
        break;
      }
    }
    if (!matched) {
      results.push({ file, decision: 'allow', reason: 'Default allow' });
    }
  }
  return results;
}

module.exports = {
  parseAgentOwners,
  matchPattern,
  evaluatePolicy
};