module.exports = (probot) => {
  return async (req, res) => {
    let octokit

    if (req.params.installationId === '') {
      res.json('missing parameter `installationId`')
      return
    }

    try {
      octokit = await probot.auth(req.params.installationId)
    } catch (err) {
      res.json('invalid parameter `installationId`')
      return
    }

    octokit.rateLimit.get().then(result => {
      res.json(result.data.resources.core)
    }).catch(err => {
      res.json(`installation error: ${err.message}`)
    })
  }
}
