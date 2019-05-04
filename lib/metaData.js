
const DATA_START = '<!-- #mergeable-data'
const DATA_END = '#mergeable-data -->'

/**
 * Utility class to serialize/deserialuze a json/string to be appended to any text element in a
 * GH check_run, issue body, pull body, comments, etc.
 * i.e. <!-- #mergeable-data { "id": "123", "event": "pull_request", "action": "unlabeled" } #mergeable-data -->
 *
 * This is primarily used to store meta-data to be retrieved later in a payload/webhook.
 * Since all of these elements in GH is markdown the text is in a HTML comment that will be hidden to the user.
 *
 */
class MetaData {
  /**
   * @return a string representation of the meta-data
   */
  static serialize (json) {
    return `${DATA_START} ${JSON.stringify(json)} ${DATA_END}`
  }

  /**
   * @return true if meta data exists in a string.
   */
  static exists (text) {
    return (text !== undefined && text.indexOf(DATA_START) !== -1 && text.indexOf(DATA_END) !== -1)
  }

  /**
   * @return the jsob object in a string that contains the serialized meta-data.
   */
  static deserialize (text) {
    let begin = text.indexOf(DATA_START) + DATA_START.length
    let end = text.indexOf(DATA_END)
    let jsonString = text.substring(begin, end)
    return JSON.parse(jsonString.trim())
  }
}

module.exports = MetaData
