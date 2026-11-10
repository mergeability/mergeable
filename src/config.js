const fs = require('fs');
const path = require('path');

function loadAgentOwnersConfig(baseDir = process.cwd()) {
  const configPath = path.join(baseDir, 'AGENTOWNERS');
  if (fs.existsSync(configPath)) {
    return fs.readFileSync(configPath, 'utf8');
  }
  return null;
}

module.exports = {
  loadAgentOwnersConfig
};