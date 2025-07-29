const { Validator } = require('./validator')
const moment = require('moment-timezone')
const constructOutput = require('./options_processor/options/lib/constructOutput')

const dayOfTheWeek = [
  'Sun',
  'Mon',
  'Tue',
  'Wed',
  'Thu',
  'Fri',
  'Sat'
]

const isCurrentTimeInFreezeWindow = (freezeWindow, timezone = 'UTC') => {
  const now = moment().tz(timezone)
  const currentDay = dayOfTheWeek[now.day()]
  const currentHour = now.hour()

  // Handle single day freeze (e.g., Friday 2pm to Friday 5pm)
  if (freezeWindow.start_day === freezeWindow.end_day) {
    return (
      currentDay === freezeWindow.start_day &&
      currentHour >= freezeWindow.start_hour &&
      currentHour < freezeWindow.end_hour
    )
  }

  // Handle multi-day freeze (e.g., Friday 2pm to Monday 2pm)
  const startDayIndex = dayOfTheWeek.indexOf(freezeWindow.start_day)
  const endDayIndex = dayOfTheWeek.indexOf(freezeWindow.end_day)
  const currentDayIndex = now.day()

  // Case 1: Start day - check if after start hour
  if (currentDayIndex === startDayIndex) {
    return currentHour >= freezeWindow.start_hour
  }

  // Case 2: End day - check if before end hour
  if (currentDayIndex === endDayIndex) {
    return currentHour < freezeWindow.end_hour
  }

  // Case 3: Days between start and end
  if (startDayIndex < endDayIndex) {
    // Normal week span (e.g., Tue to Thu)
    return currentDayIndex > startDayIndex && currentDayIndex < endDayIndex
  } else {
    // Week wrap-around (e.g., Fri to Mon)
    return currentDayIndex > startDayIndex || currentDayIndex < endDayIndex
  }
}

class TimeWindow extends Validator {
  constructor () {
    super('timeWindow')
    this.supportedEvents = [
      'pull_request.*',
      'pull_request_review.*'
    ]
    this.supportedSettings = {
      freeze_periods: 'array',
      time_zone: 'string'
    }
  }

  async validate (context, validationSettings) {
    const freezePeriods = validationSettings.freeze_periods || []
    const timezone = validationSettings.time_zone || 'UTC'

    // If freeze_periods is a single object instead of array, convert it
    const periodsArray = Array.isArray(freezePeriods) ? freezePeriods : [freezePeriods]

    for (const period of periodsArray) {
      // Skip empty periods
      if (!period || !period.start_day) continue

      // Use timezone from period if specified, otherwise use global timezone
      const periodTimezone = period.time_zone || timezone

      if (isCurrentTimeInFreezeWindow(period, periodTimezone)) {
        const validatorContext = { name: 'timeWindow' }
        const currentTime = moment().tz(periodTimezone).format()
        const result = {
          status: 'fail',
          description: period.message || `Pull requests cannot be merged during freeze window: ${period.start_day} ${period.start_hour}:00 to ${period.end_day} ${period.end_hour}:00 (${periodTimezone})`
        }

        return {
          status: 'fail',
          name: 'timeWindow',
          validations: [constructOutput(validatorContext, currentTime, validationSettings, result)]
        }
      }
    }

    const validatorContext = { name: 'timeWindow' }
    const currentTime = moment().tz(timezone).format()
    const result = {
      status: 'pass',
      description: 'Current time is outside of any configured freeze windows'
    }

    return {
      status: 'pass',
      name: 'timeWindow',
      validations: [constructOutput(validatorContext, currentTime, validationSettings, result)]
    }
  }
}

module.exports = TimeWindow
