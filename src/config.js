const fs = require('fs');

function loadConfig(configPath = '.github/mergeable.yml') {
  if (!fs.existsSync(configPath)) {
    return {};
  }
  // Basic stub for configuration loader
  return { enabled: true };
}

module.exports = { loadConfig };
