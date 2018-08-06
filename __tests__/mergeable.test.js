const Mergeable = require('../lib/mergeable')

test('starting in dev mode and genesised correctly', async () => {
  let mergeable = startMergeable('development')
  expect(mergeable.schedule).toBeCalledWith(mockRobot, { interval: 60 * 60 * 2 })
  expect(mergeable.genesis).toBeCalledWith(mockRobot)
  expect(mergeable.flex).toHaveBeenCalledTimes(0)
})

test('starting in dev mode and flexed correctly', async () => {
  let mergeable = startMergeable('development', 'flex')
  expect(mergeable.schedule).toBeCalledWith(mockRobot, { interval: 60 * 60 * 2 })
  expect(mergeable.flex).toBeCalledWith(mockRobot)
  expect(mergeable.genesis).toHaveBeenCalledTimes(0)
})

test('starting in production mode and genesised correctly', async () => {
  let mergeable = startMergeable('production')
  expect(mergeable.schedule).toBeCalledWith(mockRobot, { interval: 60 * 60 * 1000 })
  expect(mergeable.genesis).toBeCalledWith(mockRobot)
  expect(mergeable.flex).toHaveBeenCalledTimes(0)
})

test('starting in production mode and flexed correctly', async () => {
  let mergeable = startMergeable('production', 'flex')
  expect(mergeable.schedule).toBeCalledWith(mockRobot, { interval: 60 * 60 * 1000 })
  expect(mergeable.flex).toBeCalledWith(mockRobot)
  expect(mergeable.genesis).toHaveBeenCalledTimes(0)
})


const startMergeable = (mode, version) => {
  let mergeable = new Mergeable(mode, version)
  mergeable.schedule = jest.fn()
  mergeable.flex = jest.fn()
  mergeable.genesis = jest.fn()
  mergeable.start(mockRobot)
  return mergeable
}

const mockRobot = {
  on: jest.fn(),
  log: {
    warn: jest.fn(),
    info: jest.fn()
  }
}
