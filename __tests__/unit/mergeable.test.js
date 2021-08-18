const { Mergeable } = require('../../lib/mergeable')

describe('Mergeable', () => {
  test('starting in dev mode and flexed correctly', async () => {
    const mergeable = startMergeable('development')
    expect(mergeable.schedule).toBeCalledWith(mockRobot, { interval: 2000 })
    expect(mergeable.flex).toHaveBeenCalledTimes(1)
  })

  test('starting in production mode and flexed correctly', async () => {
    const mergeable = startMergeable('production')
    expect(mergeable.schedule).toBeCalledWith(mockRobot, { interval: 60 * 60 * 1000 })
    expect(mergeable.flex).toBeCalledWith(mockRobot)
  })
})

const startMergeable = (mode, version) => {
  process.env.MERGEABLE_SCHEDULER = true
  const mergeable = new Mergeable(mode, version)
  mergeable.schedule = jest.fn()
  mergeable.flex = jest.fn()
  mergeable.start(mockRobot)
  return mergeable
}

const mockRobot = {
  on: jest.fn(),
  log: {
    child: () => {
      return {
        debug: jest.fn(),
        info: jest.fn()
      }
    }
  }
}
