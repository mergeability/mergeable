## Deploying

If you would like to run your own instance of this plugin, you can do so by forking this repo and deploying it to your own servers or run it locally.

[Create a GitHub App](https://github.com/settings/apps/new) and configure the permissions & events with the following:

**Settings:**
- GitHub app name - **Your app name**
- Webhook URL - **Your webhook url for listening to events** (local deployments you can use [smee.io](smee.io))
- Webhook secret - **Your generated webhook seceret**

**Permissions:**
- Checks - **Read & Write**
- Issues - **Read & Write**
- Repository metadata - **Read Only**
- Pull requests - **Read Only**
- Commit Statuses - **Read & Write**
- Single File - **Read-only**
  - Path: `.github/mergeable.yml`

**And subscription to the following events:**
- [x] Pull request
- [x] Pull request review comment
- [x] Pull request review
- [x] Issues

## Running Locally
1. Clone the forked repository on to your machine
2. Globally install smee-client from with npm ```npm install -g smee-client```
3. Export all the variables required based on the ProBot deployment guide above
4. Run smee in your terminal by using the ```smee``` command
5. Run npm start in your local repository
6. Add a repository for your Github app by going to [application settings](https://github.com/settings/installations)
7. Do a test pull request to check if everything is working
