/**
 * An error sent back by Octyne after making a request.
 * @property {number} code The HTTP response code sent by Octyne.
 * @property {string} name Constant set to the value OctyneError.
 */
class OctyneError extends Error {
  /**
   * The constructor for an OctyneError.
   * @param {string} message The error message sent by Octyne.
   * @param {number} code The HTTP response code sent by Octyne.
   */
  constructor (message, code) {
    super(message)
    this.code = code
    this.name = 'OctyneError'
  }

  /**
   * @returns {string} The error in string format.
   */
  format () {
    return `${this.message} (${this.code})`
  }
}

export default OctyneError
