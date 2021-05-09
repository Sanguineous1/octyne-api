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
    super(message + ' (HTTP ' + code + ')')
    this.code = code
    this.name = 'OctyneError'
  }
}

export default OctyneError
