## Deploying

If you would like to run your own instance of this plugin, you can do so by forking this repo and deploying it to your own servers or run it locally.

The [Probot deployment guide](https://probot.github.io/docs/deployment/) describes this as well.

[Create a GitHub App](https://github.com/settings/apps/new) and configure the permissions & events with the following:

**Settings:**
- GitHub app name - **Your app name**
- Webhook URL - **Your webhook url for listening to events** (local deployments you can use [smee.io](smee.io))
- Webhook secret - **Your generated webhook seceret** (GitHub app page has instructions on how to create this)

**Permissions:**
- Checks - **Read & Write**
- Issues - **Read & Write**
- Repository metadata - **Read Only**
- Pull requests - **Read Only**
- Commit Statuses - **Read & Write**
- Single File - **Read-only**
  - Path: `.github/mergeable.yml`
- Repository Contents - **Read-Only**

**And subscription to the following events:**
- [x] Pull request
- [x] Pull request review comment
- [x] Pull request review
- [x] Issues

Make sure to create a private key for the app after it's been registered.

## Running Locally
1. Clone the forked repository on to your machine
2. Globally install smee-client from with npm ```npm install -g smee-client```
3. Go to [smee.io](https://smee.io) and create a new webhook OR use the cli by
   running the `smee` command.
4. Export all the variables required based on the ProBot deployment guide above:
    - `APP_ID`: This is shown on the GitHub app page after creating your app above.
    - `PRIVATE_KEY` or `PRIVATE_KEY_PATH`: Provide the key or path to key file
      (You should have downloaded it after creating the key above).
    - `WEBHOOK_PROXY_URL`: Set this to the webhook URL created with `smee` above.
    - `SECRET_TOKEN`: Set this to the GitHub webhook secret configured above.
5. Run `npm start` in your local repository
6. Add a repository for your Github app by going to [application settings](https://github.com/settings/installations)
7. Do a test pull request to check if everything is working

### Possible issues

####  `400 bad request` / `Error: No X-Hub-Signature found on request`

This happens when you haven't configured the webhook secret correctly in your
locally running instance. Make sure to set the `SECRET_TOKEN` environment variable
before running `npm start`.
