CHANGELOG
=====================================
| April 29, 2024: fix: Always allow assigning author  `#744 <https://github.com/mergeability/mergeable/pull/744>`_
| Mar 11, 2024: fix: bump dependencies probot, jest and nock to latest versions and update ci workflow to use node 20 `#738 <https://github.com/mergeability/mergeable/pull/738>`_ 
| Feb 27, 2024: fix: search and replace of special annotations `#735 <https://github.com/mergeability/mergeable/pull/735>`_
| May 12, 2023: fix: Loading teams for team option of author filter/validator `#713 <https://github.com/mergeability/mergeable/pull/713>`_
| May 11, 2023: fix: Send correct payload for changing labels `#715 <https://github.com/mergeability/mergeable/pull/715>`_
| April 25, 2023: feat: Add author validator `#710 <https://github.com/mergeability/mergeable/pull/710>`_
| March 13, 2023: fix: Replace delete with remove in changeset validator `#705 <https://github.com/mergeability/mergeable/pull/705>`_
| March 7, 2023: fix: Extend checks supported events `#700 <https://github.com/mergeability/mergeable/pull/700>`_
| March 1, 2023: feat:Added user information for commit validator `#682 <https://github.com/mergeability/mergeable/pull/682>`_
| February 3, 2023: feat: Add team option to author filter `#696 <https://github.com/mergeability/mergeable/pull/696>`_
| February 3, 2023: chore: Update node version for release workflow `#699 <https://github.com/mergeability/mergeable/pull/699>`_
| February 3, 2023: feat: Add Not operator `#695 <https://github.com/mergeability/mergeable/pull/695>`_
| September 28, 2022: feat: Add last comment validator `#668 <https://github.com/mergeability/mergeable/pull/668>`_
| August 26, 2022: set fallback for `no_empty` options processor `#657 <https://github.com/mergeability/mergeable/pull/657>`_
| August 25, 2022: fix: set fallback value for `description` payload `#655 <https://github.com/mergeability/mergeable/pull/655>`_
| August 20, 2022: fix: supported events for `request_review` action `#651 <https://github.com/mergeability/mergeable/pull/651>`_
| August 2, 2022: feat: Add newest_only commit validation setting `#649 <https://github.com/mergeability/mergeable/pull/649>`_
| April 7, 2022: feat: Support adding deployment labels from values `#631 <https://github.com/mergeability/mergeable/pull/631>`_
| March 22, 2022: fix: pass comment instance to removeErrorComments `#626 <https://github.com/mergeability/mergeable/pull/626>`_
| February 24, 2022: fix: correct indentation on documentation `#623 <https://github.com/mergeability/mergeable/pull/623>`_
| February 8, 2022: feat: Allow all option on must_include and must_include inside changeset validator `#611 <https://github.com/mergeability/mergeable/pull/611>`_
| February 6, 2022: feat: Add commit_title and commit_message options to merge action so the merge commit can be customized based on PR content `#612 <https://github.com/mergeability/mergeable/pull/612>`_
| December 12, 2021: feat: Add support for status events to baseRef validator `#395 <https://github.com/mergeability/mergeable/issues/395#issuecomment-991904249>`_
| November 25, 2021: feat: Add more supported events to baseRef validator `#395 <https://github.com/mergeability/mergeable/issues/395#issuecomment-975763927>`_
| November 12, 2021 : feat: Add baseRef filter `#596 <https://github.com/mergeability/mergeable/pull/596>`_
| October 19, 2021 : feat: Add validator approval option to exclude users `#594 <https://github.com/mergeability/mergeable/pull/594>`_
| October 12, 2021 : feat: Add boolean option for payload filter `#583 <https://github.com/mergeability/mergeable/pull/583>`_
| September 27, 2021 : fix: use node version 14.17.6 for the release action `#591 <https://github.com/mergeability/mergeable/pull/591>`_
| September 25, 2021 : feat: Support for objects in arrays in the payload filter `#589 <https://github.com/mergeability/mergeable/pull/589>`_
| September 20, 2021 : fix: Check that getRouter is defined before attempting to access it `#587 <https://github.com/mergeability/mergeable/pull/587>`_
| August 26, 2021 : fix: Await GithubAPI topics response `#585 <https://github.com/mergeability/mergeable/pull/585>`_
| August 10, 2021 : feat: New labels API `#577 <https://github.com/mergeability/mergeable/pull/577>`_
| August 6, 2021 : feat: Add team assignment to request_review action `#574 <https://github.com/mergeability/mergeable/pull/574>`_
| August 6, 2021 : feat: Support must_include and must_exclude regex as an array `#575 <https://github.com/mergeability/mergeable/pull/575>`_
| July 19, 2021 : feat: Add ignore_drafts option to ignore drafts in stale validator `#565 <https://github.com/mergeability/mergeable/issues/565>`_
| July 12, 2021 : feat: Filter specific status of files in changeset `#550 <https://github.com/mergeability/mergeable/issues/550>`_
| June 26, 2021 : feat: Add `payload` filter `#398 <https://github.com/mergeability/mergeable/issues/398>`_
| March 31, 2021 : feat: add chart support to prometheus servicemonitor `#535 <https://github.com/mergeability/mergeable/pull/535>`_
| March 30, 2021 : fix: codeowners team
| March 25, 2021 : feat: Add rate limit related metrics/endpoint `#526 <https://github.com/mergeability/mergeable/pull/526>`_
| February 25, 2021 : feat: add feature to limit approval to a list of users `#509 <https://github.com/mergeability/mergeable/issues/509>`_
| February 25, 2021 : fix: minor bugs `#508 <https://github.com/mergeability/mergeable/pull/508>`_
| February 25, 2021 : fix: Correct use of cache env
| February 22, 2021 : feat: add `age` validator `#367 <https://github.com/mergeability/mergeable/issues/367>`_
| February 22, 2021 : feat: add a info panel for 'limit' option in `approval` validator `#509 <https://github.com/mergeability/mergeable/issues/509#issuecomment-783346365>`_
| February 21, 2021 : feat: `name` sub-option for `repository` filter
| February 18, 2021 : fix: Scheduler support `#499 <https://github.com/mergeability/mergeable/issues/499>`_
| February 12, 2021 : feat: Implemented redis as a dependency to the helm-chart
| February 10, 2021 : feat: global cache manager `#502 <https://github.com/mergeability/mergeable/pull/502>`_
| February 10, 2021 : feat: Implement and/or filters support `#496 <https://github.com/mergeability/mergeable/pull/504>`_
| February 10, 2021 : feat: New Author filter `#496 <https://github.com/mergeability/mergeable/pull/505>`_
| January 28, 2021 : feat: global settings feature
| January 28, 2021 : feat: Filters validators `#496 <https://github.com/mergeability/mergeable/pull/496>`_
| January 21, 2021 : fix: request_review action failing when the reviewer is PR author `#486 <https://github.com/mergeability/mergeable/issues/486>`_
| January 20, 2021 : fix: deep validation bug that is causing HttpError `#488 <https://github.com/mergeability/mergeable/issues/488>`_
| January 19, 2021 : feat: Async Options `#480 <https://github.com/mergeability/mergeable/issues/480>`_
| January 19, 2021 : feat: Support use organization-wide configuration as default `#470 <https://github.com/mergeability/mergeable/issues/470>`_
| January 19, 2021 : feat: Jira Validator Option `#482 <https://github.com/mergeability/mergeable/issues/482>`_
| January 17, 2021 : fix: `required-status-check` bug in merge action
| January 15, 2021 : feat: add prometheus templates for easy alerting setup
| January 14, 2021 : fix: validators not running in certain pull_request events `#431 <https://github.com/mergeability/mergeable/issues/431>`_
| January 14, 2021 : fix: remove unsupported settings from title, description and milestone validator
| January 14, 2021 : feat: Allow to have pending checks `#454 <https://github.com/mergeability/mergeable/issues/454>`_
| January 13, 2021 : fix: GH Action workflows for pushing to dockerhub.
| January 12, 2021 : feat: upgrade probot to v11.0.1
| January 8, 2021 : fix: Prevent add comma on last list element
| January 5, 2021 : fix: Shift fix in team slug pagination
| January 4, 2021 : feat: GitHub actions `#450 <https://github.com/mergeability/mergeable/issues/450>`_
| December 18, 2020 : feat: Better logs for failures in PR home page without going to details `#446 <https://github.com/mergeability/mergeable/issues/446>`_
| December 17, 2020 : fix: Members in Org listing pagination bug `#442 <https://github.com/mergeability/mergeable/issues/442>`_
| December 17, 2020 : feat: Add docker image build and push `#427 <https://github.com/mergeability/mergeable/issues/427>`_
| December 14, 2020 : feat: Add branch validator `#438 <https://github.com/mergeability/mergeable/issues/438>`_
| December 11, 2020 : feat: Helm Chart implemantation for kubernetes `#435 <https://github.com/mergeability/mergeable/issues/435>`_
| December 11, 2020 : feat: Add env to control which configuration file to use `#429 <https://github.com/mergeability/mergeable/issues/429>`_
| October 20, 2020 : feat: Add a config cache which can be enabled via MERGEABLE_ENABLE_CONFIG_CACHE env var `#407 <https://github.com/mergeability/mergeable/issues/407>`_
| October 15, 2020 : feat: Add the ability to auto-merge pull requests `#395 <https://github.com/mergeability/mergeable/issues/395>`_
| October 8, 2020 : feat: added BaseRef-validator to enforce stricter rules on certain branches `#343 <https://github.com/mergeability/mergeable/issues/343>`_
| October 8, 2020 : feat: Do not load modified unsafe config files from forks `#406 <https://github.com/mergeability/mergeable/issues/406>`_
| October 6, 2020 : fix: Size validator - do not ignore hidden files by default `#401 <https://github.com/mergeability/mergeable/issues/401>`_
| October 6, 2020 : Do not attempt to merge a pull request if the status is blocked `#389 <https://github.com/mergeability/mergeable/issues/389>`_
| October 6, 2020 : fix: Fix undefined error with blank validators `#402 <https://github.com/mergeability/mergeable/issues/402>`_
| October 5, 2020 : fix Typo in header of labels action docs and corresponding rst file
| October 4, 2020 : fix Typo in header of title validator docs
| October 2, 2020 : Don't throw merge error if required status are are the cause of the error `#389 <https://github.com/mergeability/mergeable/issues/389>`_
| September 24, 2020 : Add ability to delete or replace the labels on an issue `#380 <https://github.com/mergeability/mergeable/issues/380>`_
| September 22, 2020 : Allow support for customizing the scheduler interval via an enviroment variable `MERGEABLE_SCHEDULER_INTERVAL` `#383 <https://github.com/mergeability/mergeable/issues/383>`_
| September 17, 2020 : Add support for `schedule.repository` event for`labels` and `close` actions `#377 <https://github.com/mergeability/mergeable/issues/377>`_
| September 17, 2020 : Fix the comment action to work correctly with the scheduler `#376 <https://github.com/mergeability/mergeable/issues/376>`_
| September 16, 2020 : Allow specifying files to `match` for the `size` validator `#371 <https://github.com/mergeability/mergeable/issues/371>`_
| September 16, 2020 : `stale` validator now supports optionally skipping items associated with a `project` or a `milestone` `#375 <https://github.com/mergeability/mergeable/issues/375>`_
| September 16, 2020 : `stale` validator now supports labels for `match` or `ignore` `#372 <https://github.com/mergeability/mergeable/issues/372>`_
| August 24, 2020: display files processed in `size` validator `#366 <https://github.com/mergeability/mergeable/issues/366>`_
| August 17, 2020: fix Error string in `merge failed` error
| July 28, 2020 : owners file now support teams and limit.owners option added in `approvals` validator `#331 <https://github.com/mergeability/mergeable/issues/331>`_
| July 12, 2020 : Allow usage of special annotation `@author` in comments and checks `#328 <https://github.com/mergeability/mergeable/issues/328>`_
| July 1, 2020 : When config file is added/modified in base branch, mergeable will trigger for all PR against the base branch `#153 <https://github.com/mergeability/mergeable/issues/153>`_
| June 30, 2020 : Add `ignore_comment` option to `size` validator `#245 <https://github.com/mergeability/mergeable/issues/245>`_
| June 17, 2020 : Added new validator `contents` `#207 <https://github.com/mergeability/mergeable/issues/207>`_
| June 16, 2020 : Create an error comment if errors have occurred during execution of actions `#312 <https://github.com/mergeability/mergeable/issues/312>`_
| June 5, 2020 : For missing fields in 'checks', default values will be used `#233 <https://github.com/mergeability/mergeable/issues/233#issuecomment-632211789>`_
| May 30, 2020 : New Action `merge` added `#201 <https://github.com/mergeability/mergeable/issues/201>`_
| May 29, 2020 : throw `UnSupportedSettingError` if provided setting is not valid `#228 <https://github.com/mergeability/mergeable/issues/228>`_
| May 29, 2020 : Ability to Limit `stale` validator to certain days and time `#221 <https://github.com/mergeability/mergeable/issues/221>`_
| May 23, 2020 : Allow PRs/Issues to be assigned to their author by using `@author` in the `assign` action
| May 14, 2020 : Delete obsolete comments by default `#157 <https://github.com/mergeability/mergeable/issues/157>`_
| May 12, 2020 : Limit so that only approval from team members will count, `#236 <https://github.com/mergeability/mergeable/issues/236>`_
| May 6, 2020 : Ability to create multiple checks with ``named`` recipe, `#225 <https://github.com/mergeability/mergeable/issues/225>`_
| May 5, 2020 : Added ability to configure config file name using ``CONFIG_PATH`` env variable, `#223 <https://github.com/mergeability/mergeable/issues/223>`_
| April 22, 2020 : readthedoc documentation added, start of CHANGELOG
