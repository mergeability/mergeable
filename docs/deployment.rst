.. _deploying:

Deploying
---------------------
If you would like to run your own instance of this plugin, you can do so by forking this repo and deploying it to your own servers or run it locally

The `Probot deployment guide <https://probot.github.io/docs/deployment/>`_ describes this as well.

`Create a GitHub App <https://github.com/settings/apps/new>`_ and configure the permissions & events with the following:

**Settings:**

* GitHub app name - **Your app name**
* Webhook URL - **Your webhook url for listening to events** (for local deployments you can use `smee.io <https://smee.io/>`_)
* Webhook secret - **Your generated webhook seceret** (GitHub app page has instructions on how to create this)

**Repository Permissions:**

* Checks - **Read & Write**
* Issues - **Read & Write**
* Metadata - **Read Only**
* Pull requests - **Read & Write**
* Commit statuses - **Read & Write**
* Single file - **Read-only**
  * Path: ``.github/mergeable.yml``
* Contents - **Read-Only** (Note: the ``merge`` action requires Read & Write)
* Projects - **Read-Only**

**Organization Permissions:**

* Members - **Read Only**

**And subscription to the following events:**

* [x] Issue comment
* [x] Issues
* [x] Pull request
* [x] Pull request review
* [x] Status

Make sure to create a private key for the app after it's been registered.

Running Locally
------------------

1. Clone the forked repository on to your machine.
2. Globally install smee-client from with npm ``npm install -g smee-client``
3. Go to `smee.io <https://smee.io>`_ and create a new webhook OR use the cli by
   running the ``smee`` command.
4. Copy ``.env.template`` to a new file called ``.env``, and fill it out.
5. Run ``npm run dev`` in your local repository.
6. Add a repository for your Github app by going to `application settings <https://github.com/settings/installations>`_
7. Do a test pull request to check if everything is working.

.. note::
    If you wish to use a different config file name besides ``mergeable.yml``, use the ``CONFIG_PATH`` environment variable. Config files use ``.github`` as base path, see `here <https://github.com/probot/probot/blob/master/src/context.ts#L230>`_.


Possible Issues
-----------------

``400 bad request`` / ``Error: No X-Hub-Signature found on request``

This happens when you haven't configured the webhook secret correctly in your
locally running instance. Make sure to set the ``SECRET_TOKEN`` environment variable
in ``.env`` before running ``npm run dev``.

``ERROR probot: Integration not found``

This may occur when running Mergeable using a GitHub Enterpise instance.

To fix, try making sure you've set the `GHE_HOST` variable in `.env` to the
hostname of your Enterprise instance. E.g. `GHE_HOST=github.your_company.com`.

.. note::
    For a list of possible configurable variables within mergeable, check :ref:`configurable-variables-page`

