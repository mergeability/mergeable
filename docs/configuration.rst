.. _configuration-page:

Configuration
=====================================

**Mergeable** is **highly** configurable.

First, you'll need to start by creating a ``.github/mergeable.yml`` file in your repository.

.. hint::
  Check out our :ref:`recipes-page` page for examples and most commonly used settings

Next, we'll go into how the configuration is structured.

Basics
------------------

Mergeable configuration consists of an array of independent recipes where each recipe needs to have the following properties:

when:
    specify webhook event(s) in which to process the validation
name:
    a friendly name which appears on the PR for the associated check
filter:
    specify a series of optional filters to be checked and only runs validators if they are passing
validate:
    specify a series of validator to be checked
pass:
    specify a series of action to execute if the validation suite returned a `pass`
fail:
    specify a series of action to execute if the validation suite returned a `fail`
error:
    specify a series of action to execute if the validation suite returned a `error`

Each recipe appears as a separate check in the pull request.

Here is a full example of how a recipe looks -

.. code-block:: yml

    version: 2
    mergeable:
      - when: {{event}}, {{event}} # can be one or more
        name: check name A
        filter:
          # list of filters (optional). Specify one or more.
          - do: {{filter}}
            {{option}}: # name of an option supported by the validator.
              {{sub-option}}: {{value}} # an option will have one or more sub-options.
        validate:
          # list of validators. Specify one or more.
          - do: {{validator}}
            {{option}}: # name of an option supported by the validator.
              {{sub-option}}: {{value}} # an option will have one or more sub-options.
        pass: # list of actions to be executed if all validation passes. Specify one or more. Omit this tag if no actions are needed.
          - do: {{action}}
        fail: # list of actions to be executed when at least one validation fails. Specify one or more. Omit this tag if no actions are needed.
          - do: {{action}}
        error: # list of actions to be executed when at least one validator throws an error. Specify one or more. Omit this tag if no actions are needed.
          - do: {{action}}

      - when: {{event}}, {{event}} # example for second recipe
        name: check name B
        filter:
          # list of filters (optional). Specify one or more.
          - do: {{filter}}
            {{option}}: # name of an option supported by the validator.
              {{sub-option}}: {{value}} # an option will have one or more sub-options.
        validate:
          # list of validators. Specify one or more.
          - do: {{validator}}
            {{option}}: # name of an option supported by the validator.
              {{sub-option}}: {{value}} # an option will have one or more sub-options.
        pass: # list of actions to be executed if all validation passes. Specify one or more. Omit this tag if no actions are needed.
          - do: {{action}}
        fail: # list of actions to be executed when at least one validation fails. Specify one or more. Omit this tag if no actions are needed.
          - do: {{action}}
        error: # list of actions to be executed when at least one validator throws an error. Specify one or more. Omit this tag if no actions are needed.
          - do: {{action}}

.. note::
    There are some default actions that'll be automatically applied based on the events specified

Filters
------------

Filters are checks that mergeable will process in order to determine if validator will be executed.

.. note::
    Each filter have certain events that it can support, so keep an eye out for them.

.. hint::
    Don't see an filter that should be on here? Let us know by creating an `issue <https://github.com/mergeability/mergeable/issues/new>`_ on github

Filter List

.. toctree::
    filters/author.rst
    filters/repository.rst
    filters/payload.rst

Validators
------------

Validators are checks that mergeable will process in order to determine whether an action should be executed.

.. note::
    Each validator have certain events that it can support, so keep an eye out for them.

.. hint::
    Don't see an validator that should be on here? Let us know by creating an `issue <https://github.com/mergeability/mergeable/issues/new>`_ on github

Validator List

.. toctree::
    validators/age.rst
    validators/approval.rst
    validators/assignee.rst
    validators/author.rst
    validators/baseRef.rst
    validators/changeset.rst
    validators/commit.rst
    validators/contents.rst
    validators/dependent.rst
    validators/description.rst
    validators/headRef.rst
    validators/label.rst
    validators/milestone.rst
    validators/project.rst
    validators/size.rst
    validators/stale.rst
    validators/title.rst

Options
------------

These Options are used with validators.

Options List

.. toctree::
    options/boolean.rst
    options/begins_with.rst
    options/ends_with.rst
    options/jira.rst
    options/max.rst
    options/min.rst
    options/must_include.rst
    options/must_exclude.rst
    options/no_empty.rst
    options/required.rst

Operators
------------

These operators can help create more complex logic of validations

Operator List

.. toctree::
    operators/and.rst
    operators/or.rst
    operators/not.rst


Actions
------------

Actions that mergeable is currently able to perform.

.. hint::
    Don't see an action that should be on here? Let us know by creating an `issue <https://github.com/mergeability/mergeable/issues/new>`_ on github

.. toctree::
    actions/assign.rst
    actions/check.rst
    actions/close.rst
    actions/comment.rst
    actions/merge.rst
    actions/labels.rst
    actions/request_review.rst

.. _config-reuse-page:

Reusable Configuration
--------------------------

YML has a feature called `Anchor<https://blog.daemonl.com/2016/02/yaml.html>`_ that allows you to create reusable parts in the config

.. code-block:: yml
    on_fail_comment: &default_fail_comment
      - do: comment
        payload:
          body: >
            This issue fails to meet the guidelines, please check the contribution guideline and make sure all the necessary items are in place.

    version: 2
    mergeable:
      - when: pull_request.*
        validate:
          - do: approvals
            min:
              count: 1
          - do: labels
        fail:
          - <<: *default_fail_comment
          - do: assign
            assignees: ['@author']
      - when: issues.*
        validate:
          - do: description
            no_empty:
              enabled: true
        fail: *default_fail_comment

.. _organisation-wide-defaults:

Organisation-wide defaults
---------------------------

You can specify a default configuration to be applied across your GitHub organisation.
This can help reduce how many configuration files you need to maintain and make it easier
to get started with Mergeable.

To add a default configuration:

1. Create a repository called ``.github`` in your organisation.
2. Create a file with the path ``.github/mergeable.yml`` in this repository.

The final path of the file (including the repo name) should be ``<YOUR_ORG>/.github/.github/mergeable.yml``

Mergeable will now use this file as the default when it cannot find one in a given
repository or PR. It determines the file to use in the following order:

1. A ``mergeable.yml`` inside the PR if the PR originates from the same repository. If it originates from a fork it is not loaded for security reasons. See `#406 <https://github.com/mergeability/mergeable/issues/406>`_ for more details.
2. A ``mergeable.yml`` inside the repository the PR is for.
3. A ``mergeable.yml`` at ``<YOUR_ORG>/.github/.github/mergeable.yml``.

.. note::
    If config file is changed in base branch, all the PR against the base branch will be re ran using the changed config file
    Warning! this feature require mergeable have ``read`` access to contents and needs to be listening for ``push`` event

Why the weird default file path?
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

The Probots library that Mergeable uses automatically searches for config files
in a repo named ``.github`` within the organisation.

The double nesting of the ``<YOUR_ORG>/.github/.github/mergeable.yml`` default
file is unfortunately necessary. The GitHub app permissions model only lets you
specify a single path for your probot to access, so it must be the same as in
regular repositories.
