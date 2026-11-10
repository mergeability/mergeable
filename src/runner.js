const { evaluatePolicy } = require('./agentowners');
const { loadAgentOwnersConfig } = require('./config');

function runPolicyCheck(files, agentName = 'mergeable', baseDir = process.cwd()) {
  const configContent = loadAgentOwnersConfig(baseDir);
  if (!configContent) {
    return files.map(file => ({ file, decision: 'allow', reason: 'No AGENTOWNERS policy found' }));
  }
  return evaluatePolicy(configContent, files, agentName);
}

module.exports = {
  runPolicyCheck
};