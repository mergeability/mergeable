const minimatch = require('minimatch');

function globToRegExp(glob) {
  const reStr = glob
    .replace(/\./g, '\\.')
    .replace(/\*\*/g, '.*')
    .replace(/(?<!\.)\*/g, '[^/]*')
    .replace(/\?/g, '.');
  return new RegExp(`^${reStr}$`);
}

function matchFilePattern(pattern, filePath) {
  if (pattern === '*' || pattern === '**') return true;
  if (pattern === filePath) return true;

  try {
    if (typeof minimatch === 'function') {
      return minimatch(filePath, pattern, { dot: true, matchBase: !pattern.includes('/') });
    }
  } catch (err) {
    // Fallback if minimatch fails or is not available
  }

  try {
    const re = globToRegExp(pattern);
    return re.test(filePath);
  } catch (err) {
    return false;
  }
}

class AgentOwners {
  constructor(config = []) {
    if (typeof config === 'string') {
      this.rules = AgentOwners.parse(config);
    } else if (Array.isArray(config)) {
      this.rules = config;
    } else if (config && Array.isArray(config.rules)) {
      this.rules = config.rules;
    } else {
      this.rules = [];
    }
  }

  static parse(content) {
    if (!content || typeof content !== 'string') return [];
    const rules = [];
    const lines = content.split('\n');

    for (let line of lines) {
      line = line.trim();
      if (!line || line.startsWith('#')) continue;

      if (line.startsWith('{') && line.endsWith('}')) {
        try {
          rules.push(JSON.parse(line));
          continue;
        } catch (e) {
          // Fallback to text parsing
        }
      }

      const parts = line.split(/\s+/);
      if (parts.length >= 2) {
        const pattern = parts[0];
        const agents = parts[1] === '*' ? '*' : parts[1].split(',').map(a => a.trim());
        const action = parts[2] || 'require_approval';
        const reason = parts.slice(3).join(' ') || undefined;
        rules.push({
          pattern,
          agents,
          action,
          reason
        });
      }
    }
    return rules;
  }

  matchAgent(ruleAgents, agentName) {
    if (!ruleAgents || ruleAgents === '*' || (Array.isArray(ruleAgents) && ruleAgents.includes('*'))) {
      return true;
    }
    if (typeof ruleAgents === 'string') {
      return ruleAgents === agentName;
    }
    if (Array.isArray(ruleAgents)) {
      return ruleAgents.includes(agentName);
    }
    return false;
  }

  evaluate({ files = [], agent = 'default', action = '' } = {}) {
    let finalDecision = 'allow';
    const matchedRules = [];
    const reasons = [];

    const fileList = Array.isArray(files) ? files : [files];

    for (const file of fileList) {
      for (const rule of this.rules) {
        const pattern = rule.pattern || rule.path;
        if (!pattern) continue;

        if (matchFilePattern(pattern, file)) {
          const ruleAgents = rule.agents || rule.agent || '*';
          if (this.matchAgent(ruleAgents, agent)) {
            const decision = rule.action || rule.decision || 'require_approval';
            matchedRules.push({ file, rule, decision });

            if (decision === 'deny') {
              finalDecision = 'deny';
              if (rule.reason) reasons.push(rule.reason);
              break;
            } else if (decision === 'require_approval' && finalDecision !== 'deny') {
              finalDecision = 'require_approval';
              if (rule.reason) reasons.push(rule.reason);
            }
          }
        }
      }
      if (finalDecision === 'deny') break;
    }

    return {
      decision: finalDecision,
      allowed: finalDecision === 'allow',
      requiresApproval: finalDecision === 'require_approval',
      denied: finalDecision === 'deny',
      matchedRules,
      reasons
    };
  }
}

module.exports = AgentOwners;
