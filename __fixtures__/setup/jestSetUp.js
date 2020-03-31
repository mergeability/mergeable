// mock Logger
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
    logTypes: {
      EVENT_RECEIVED: 'event_received',
      CONFIG_INVALID_YML: 'config_invalid_yml',
      UNKNOWN_ERROR_VALIDATOR: 'unknown_error_validator',
      UNKNOWN_ERROR_ACTION: 'unknown_error_action',
      VALIDATOR_PROCESS: 'validator_process',
      ACTION_BEFORE_VALIDATE_EXECUTE: 'action_before_validate_execute',
      ACTION_AFTER_VALIDATE_EXECUTE: 'action_after_validate_execute',
      CONFIG: 'config'
    }
  }
})
