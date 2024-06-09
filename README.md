<h1 align="center">
  <br>
  <img src="mergeable-flex.png" alt="Mergeable" width="197">
  <br>
  <p>Mergeable</p>
</h1>

<p align="center">
  <a href="https://github.com/apps/mergeable">
    <img src="https://img.shields.io/badge/FREE-INSTALL-orange.svg" alt="Free Install">
  </a>
  <a href="https://gitter.im/mergeable-bot/Lobby?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge">
    <img src="https://badges.gitter.im/mergeable-bot/Lobby.svg">
  </a>  
  <img src="https://github.com/mergeability/mergeable/workflows/CI/badge.svg">
  <a href="https://codecov.io/gh/mergeability/mergeable">
    <img src="https://codecov.io/gh/mergeability/mergeable/branch/master/graph/badge.svg">
  </a>
</p>

> 🤖 **Mergeable** helps automate your team's GitHub workflow without a single line of code.

Some examples of what you can do:

- Ensure pull requests follow conventions and [prevent merging][comment-if-guidelines-not-met] when it is not followed.
- [Notify author of failed guidelines][comment] when opening an issue.
- Schedule [detection for obsolete (stale) issues and pull requests][staleness] and notify author and collaborators.
- [Auto-merge][automerge] pull requests once all checks pass.
- And [more][configuration]

---


# Documentation
Check it out over at https://mergeable.readthedocs.io/en/latest/index.html

# Support
Found a bug? Have a question? Or just want to chat?

- Find us on [Gitter](https://gitter.im/mergeable-bot/Lobby).
- Create an [Issue](https://github.com/mergeability/mergeable/issues/new).

# Contributions
We need your help:

- Have an **💡idea** for a **new feature**? Please [create a new issue](https://github.com/mergeability/mergeable/issues) and tell us!
- **Fix a bug**, implement a new **validator** or **action** and [open a pull request](CONTRIBUTING.md)!

> ☝️ **NOTE:** For development and testing. You'll want to [read about how to run it locally][run-locally].


# Authors
  - Originally created by [@jusx](https://twitter.com/jusx) 👉 follow him on [Twitter](https://twitter.com/jusx).
  - Co-authored by [@shine2lay](https://github.com/shine2lay)
  - Logo by [@minap0lis](https://www.instagram.com/minap0lis/)  👉  follow her on [Instagram](https://www.instagram.com/minap0lis/).
---
AGPL, Copyright (c) 2019 [Justin Law](https://github.com/jusx) & [Shine Lee](https://github.com/shine2lay)

[comment-if-guidelines-not-met]: https://mergeable.readthedocs.io/en/latest/recipes.html#comment-if-guidelines-not-met
[comment]: https://mergeable.readthedocs.io/en/latest/actions/comment.html
[staleness]: https://mergeable.readthedocs.io/en/latest/recipes.html#check-stale-pr-and-issues
[automerge]: https://mergeable.readthedocs.io/en/latest/recipes.html#auto-merge-pull-requests-once-all-checks-pass
[configuration]: https://mergeable.readthedocs.io/en/latest/configuration.html
[run-locally]: https://mergeable.readthedocs.io/en/latest/deployment.html#running-locally
