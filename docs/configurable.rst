.. _configurable-variables-page:
List of Configurable variables inside mergeable
===============================================

APP_NAME : when checks are created, the app name will be utilized. Default : 'Mergeable'
MERGEABLE_VERSION : Specify the version of mergeable to be used. Default (also latest) : 'flex'
MERGEABLE_SCHEDULER : When enabled, the bot create "schedule.repository" events to be triggered on a specified interval. Default: false
MERGEABLE_SCHEDULER_INTERVAL : The interval (in seconds) in which the "schedule.repository" will be triggered for each repo. Default : 3600 (one hour)
CONFIG_PATH : The file path of the configuration for the bot, root path is '.github/'. Default : 'mergeable.yml'
USE_CONFIG_CACHE : store repo's configuration (if exists) in memory instead of fetching new config everytime. Default: false
