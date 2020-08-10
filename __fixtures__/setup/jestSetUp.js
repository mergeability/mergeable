// mock Logger
const mockLogTypes = require('../../lib/utils/logTypes')

jest.mock('../../lib/logger.js', () => {
  return {
    init: jest.fn(),
    create: () => {
      return {
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
        debug: jest.fn(),
        fatal: jest.fn()
      }
    },
    logTypes: mockLogTypes
  }
})
