module.exports = {
  /**
   *
   * @param input the string run regex against
   * @param filters string | object , if string we check if that regex is excluded from input
   * @returns object { mergeable: bool, description: string | [string]}
   */
  processFilters: function (input, filters) {
    // for backward compatibility, check if the filters is a string

    if (typeof filters === 'string') {
      return this.mustExclude(input, filters)
    }

    let output = []
    for (let key in filters) {
      switch (key) {
        case 'must-include':
          output.push(this.mustInclude(input, filters[key]))
          break
        case 'must-exclude':
          output.push(this.mustExclude(input, filters[key]))
          break
      }
    }

    return this.mergeResults(output)
  },
  mergeResults: function (result) {
    let mergeable = true
    let errorMessages = []

    result.forEach(res => {
      if (!res.mergeable) {
        mergeable = false
      }

      if (res.description) {
        errorMessages.push(res.description)
      }
    })

    return {mergeable, description: errorMessages}
  },
  mustInclude: function (input, match) {
    const regex = new RegExp(match, 'i')
    const isMergeable = regex.test(input)
    return { mergeable: isMergeable,
      description: isMergeable ? null : `Title does not contain "${match}"`
    }
  },
  mustExclude: function (input, match) {
    const regex = new RegExp(match, 'i')
    const isMergeable = !regex.test(input)

    return { mergeable: isMergeable,
      description: isMergeable ? null : `Title contains "${match}"`
    }
  }
}
