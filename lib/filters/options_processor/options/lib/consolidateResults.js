module.exports = (result, filter) => {
  let status = 'pass'
  let tests = []

  result.forEach(res => {
    if (res.status === 'fail' && status !== 'error') {
      status = 'fail'
    }
    if (res.status === 'error') {
      status = 'error'
    }

    tests.push(res)
  })

  return {status: status, name: filter.name, filters: tests}
}
