const { evaluatePolicy } = require('./agentowners');

function runAction(filePath, agentName) {
  const evaluation = evaluatePolicy(filePath, agentName);
  return evaluation;
}

module.exports = { runAction };
