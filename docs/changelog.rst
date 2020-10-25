CHANGELOG
=====================================


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
