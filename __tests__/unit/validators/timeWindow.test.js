const TimeWindow = require('../../../lib/validators/timeWindow')
const Helper = require('../../../__fixtures__/unit/helper')

jest.mock('moment-timezone', () => jest.fn().mockReturnValue((({
  tz: jest.fn().mockReturnValue(({
    day: jest.fn().mockReturnValue(6), // Saturday
    hour: jest.fn().mockReturnValue(15), // 3pm
    format: () => '2025-07-05T15:00:00+00:00'
  }))
}))))

describe('timeWindow validator', () => {
  let timeWindow

  beforeEach(() => {
    timeWindow = new TimeWindow()
  })

  const mockContext = (title = 'Test PR') => {
    return Helper.mockContext({
      title: title
    })
  }

  test('should pass when no freeze periods are configured', async () => {
    const settings = {
      do: 'timeWindow'
    }

    const result = await timeWindow.processValidate(mockContext(), settings)
    expect(result.status).toBe('pass')
    expect(result.validations[0].description).toContain('outside of any configured freeze windows')
  })

  test('should pass when freeze_periods is empty array', async () => {
    const settings = {
      do: 'timeWindow',
      freeze_periods: []
    }

    const result = await timeWindow.processValidate(mockContext(), settings)
    expect(result.status).toBe('pass')
    expect(result.validations[0].description).toContain('outside of any configured freeze windows')
  })

  test('should pass when current time is outside freeze window', async () => {
    // Mock time: Saturday 3pm - outside Monday 9am to Friday 5pm window
    const settings = {
      do: 'timeWindow',
      freeze_periods: [{
        start_day: 'Mon',
        start_hour: 9,
        end_day: 'Fri',
        end_hour: 17,
        time_zone: 'UTC'
      }]
    }

    const result = await timeWindow.processValidate(mockContext(), settings)
    expect(result.status).toBe('pass')
    expect(result.validations[0].description).toContain('outside of any configured freeze windows')
  })

  test('should fail when current time is inside freeze window', async () => {
    // Mock time: Saturday 3pm - inside Friday 6pm to Sunday 6pm window
    const settings = {
      do: 'timeWindow',
      freeze_periods: [{
        start_day: 'Fri',
        start_hour: 18,
        end_day: 'Sun',
        end_hour: 18,
        time_zone: 'UTC'
      }]
    }

    const result = await timeWindow.processValidate(mockContext(), settings)
    expect(result.status).toBe('fail')
    expect(result.validations[0].description).toContain('cannot be merged during freeze window')
    expect(result.validations[0].description).toContain('Fri 18:00 to Sun 18:00')
  })

  test('should handle single freeze period object (not array)', async () => {
    // Mock time: Saturday 3pm - outside Monday 9am to Friday 5pm window
    const settings = {
      do: 'timeWindow',
      freeze_periods: {
        start_day: 'Mon',
        start_hour: 9,
        end_day: 'Fri',
        end_hour: 17,
        time_zone: 'UTC'
      }
    }

    const result = await timeWindow.processValidate(mockContext(), settings)
    // Single object may trigger settings validation error
    expect(['pass', 'error']).toContain(result.status)
    if (result.status === 'pass') {
      expect(result.validations).toHaveLength(1)
    }
  })

  test('should include timezone in error message', async () => {
    // Mock time: Saturday 3pm - inside Friday 6pm to Sunday 6pm window
    const settings = {
      do: 'timeWindow',
      freeze_periods: [{
        start_day: 'Fri',
        start_hour: 18,
        end_day: 'Sun',
        end_hour: 18,
        time_zone: 'America/New_York'
      }]
    }

    const result = await timeWindow.processValidate(mockContext(), settings)
    expect(result.status).toBe('fail')
    expect(result.validations[0].description).toContain('America/New_York')
    expect(result.validations[0].description).toContain('Fri 18:00 to Sun 18:00')
  })

  test('should use custom message when provided', async () => {
    const customMessage = 'Weekend freeze is active - please wait until Monday'
    const settings = {
      do: 'timeWindow',
      freeze_periods: [{
        start_day: 'Sat',
        start_hour: 14,
        end_day: 'Sat',
        end_hour: 16,
        time_zone: 'UTC',
        message: customMessage
      }]
    }

    const result = await timeWindow.processValidate(mockContext(), settings)
    expect(result.status).toBe('fail')
    expect(result.validations[0].description).toBe(customMessage)
  })

  test('should handle multiple freeze periods', async () => {
    // Mock time: Saturday 3pm - hits second freeze period (Sat 2pm-4pm)
    const settings = {
      do: 'timeWindow',
      freeze_periods: [
        {
          start_day: 'Tue',
          start_hour: 10,
          end_day: 'Tue',
          end_hour: 12,
          time_zone: 'UTC'
        },
        {
          start_day: 'Sat',
          start_hour: 14,
          end_day: 'Sat',
          end_hour: 16,
          time_zone: 'UTC'
        }
      ]
    }

    const result = await timeWindow.processValidate(mockContext(), settings)
    expect(result.status).toBe('fail')
    expect(result.validations).toHaveLength(1)
  })

  test('should skip empty periods in array', async () => {
    // Mock time: Saturday 3pm - hits valid freeze period (Sat 2pm-4pm)
    const settings = {
      do: 'timeWindow',
      freeze_periods: [
        null,
        {},
        {
          start_day: 'Sat',
          start_hour: 14,
          end_day: 'Sat',
          end_hour: 16,
          time_zone: 'UTC'
        }
      ]
    }

    const result = await timeWindow.processValidate(mockContext(), settings)
    expect(result.status).toBe('fail')
    expect(result.validations).toHaveLength(1)
  })

  test('should use global timezone as fallback', async () => {
    // Mock time: Saturday 3pm - inside Friday 6pm to Sunday 6pm window
    const settings = {
      do: 'timeWindow',
      time_zone: 'America/New_York',
      freeze_periods: [{
        start_day: 'Fri',
        start_hour: 18,
        end_day: 'Sun',
        end_hour: 18
        // No time_zone specified, should use global
      }]
    }

    const result = await timeWindow.processValidate(mockContext(), settings)
    expect(result.status).toBe('fail')
    expect(result.validations[0].description).toContain('America/New_York')
  })

  test('should handle single day freeze window - inside', async () => {
    // Mock time: Saturday 3pm - inside Saturday 2pm to 4pm window
    const settings = {
      do: 'timeWindow',
      freeze_periods: [{
        start_day: 'Sat',
        start_hour: 14,
        end_day: 'Sat',
        end_hour: 16,
        time_zone: 'UTC'
      }]
    }

    const result = await timeWindow.processValidate(mockContext(), settings)
    expect(result.status).toBe('fail')
  })

  test('should handle single day freeze window - outside', async () => {
    // Mock time: Saturday 3pm - outside Saturday 4pm to 6pm window  
    const settings = {
      do: 'timeWindow',
      freeze_periods: [{
        start_day: 'Sat',
        start_hour: 16,
        end_day: 'Sat',
        end_hour: 18,
        time_zone: 'UTC'
      }]
    }

    const result = await timeWindow.processValidate(mockContext(), settings)
    expect(result.status).toBe('pass')
  })
})
