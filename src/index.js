const WebSocket = require('isomorphic-ws')
const fetch = require('isomorphic-unfetch')

/**
 * The Octyne API client.
 * @property {Object} info An object containing the URL, username, password and token to Octyne.
 * @property {string} info.url The URL to the Octyne instance.
 * @property {string} [info.username] The username of the Octyne user.
 * @property {string} [info.password] The password of the Octyne user.
 * @property {string} [info.token] The token of the Octyne user.
 */
class Client {
  /**
   * The constructor for the Octyne API client.
   * Requires either a username/password pair or a token.
   * @param {string} url The URL to the Octyne instance.
   * @param {Object} info An object containing either a username/password pair or an Octyne token.
   * @param {string} [info.username] A string containing the username to log into Octyne with.
   * @param {string} [info.password] A string containing the password to log into Octyne with.
   * @param {string} [info.token] A string containing the token to authenticate to Octyne with.
   */
  constructor (url, info) {
    this.info = { url: url, username: info.username || undefined }
    if (!info.token && (!info.username || !info.password)) {
      throw new Error('No username/password pair or token was provided!')
    }
    if (info.password) {
      Object.defineProperty(this.info, 'password', {
        value: info.password,
        enumerable: false,
        configurable: true,
        writable: true
      })
    }
    if (info.token) {
      Object.defineProperty(this.info, 'token', {
        value: info.token,
        enumerable: false,
        configurable: true,
        writable: true
      })
    }
  }

  /**
   * Get all the servers running on this Octyne instance.
   * The object returned has server names as keys, and numbers as the status for the server.
   * 0 indicates offline, 1 indicates online, 2 indicated crashed.
   * @returns {Object} Returns an object containing server names as keys, and a number as value.
   */
  async getServers () {
    return await this.request(this.info.url + '/servers', { method: 'GET' })
  }

  /**
   * Logs into Octyne using the username/password pair provided and retrieves the token and saves it.
   * @returns {Promise<void>} A Promise which resolves when login succeeds, and rejects if failed.
   */
  async login () {
    const res = await (await fetch(this.info.url + '/login', {
      method: 'POST',
      headers: { Username: this.info.username, Password: this.info.password }
    })).json()
    if (res.token) {
      Object.defineProperty(this.info, 'token', {
        value: res.token,
        enumerable: false,
        configurable: true
      })
    } else {
      throw new Error(res.error)
    }
  }

  /**
   * Invalidates the stored token by logging out of Octyne.
   * @returns {Promise<void>} A Promise which resolves after logout, and rejects if failed.
   */
  async logout () {
    const res = await this.request(this.info.url + '/logout', { method: 'POST' })
    if (res.success) {
      delete this.info.token
    } else {
      throw new Error(res.error)
    }
  }

  /**
   * Returns an Octyne one-time ticket which is used for console/file downloads on browser.
   * They expire within 120 seconds and can only be used by the IP address that requested it.
   * @returns {Promise<string>} A Promise which resolves with a string containing the ticket.
   */
  async getTicket () {
    const res = await this.request(this.info.url + '/ott')
    if (res.ticket) {
      return res.ticket
    } else {
      throw new Error(res.error)
    }
  }

  /**
   * Connects to the console of a process running on Octyne, and returns a WebSocket connection in a Promise.
   * @param {string} server The name of the Octyne server, which console is to be connected to.
   * @param {string|boolean} [ticket] If an Octyne ticket should be used. If a string is passed, it is used as ticket.
   * Default: window !== 'undefined'
   * @returns {Promise<WebSocket>} A Promise which resolves with a WebSocket when the connection succeeds.
   */
  async openConsole (server, ticket) {
    const url = this.info.url
    let ticketStr = ''
    if (typeof ticket === 'string') {
      ticketStr = ticket
    } else if (typeof ticket === 'boolean' ? ticket : typeof window !== 'undefined') {
      ticketStr = await this.getTicket()
    }
    const query = ticketStr && '?ticket=' + ticketStr
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(url + '/server/' + server + '/console' + query, undefined, {
        headers: { authorization: this.info.token } // This is ignored on browser.
      })
      let open = false
      ws.onopen = () => {
        open = true
        resolve(ws)
      }
      ws.onerror = (err) => {
        if (!open) reject(err)
      }
    })
  }

  /**
   * Starts a process on Octyne, given the name of the process.
   * @param {string} server The name of the Octyne process to start.
   * @returns {Promise<void>} A Promise which resolves after the request, and rejects on error.
   */
  async startServer (server) {
    const res = await this.request(this.info.url + '/server/' + server, { method: 'POST', body: 'start' })
    if (res.error) {
      throw new Error(res.error)
    }
  }

  /**
   * Stops a process on Octyne, given the name of the process.
   * @param {string} server The name of the Octyne process to stop.
   * @returns {Promise<void>} A Promise which resolves after the request, and rejects on error.
   */
  async stopServer (server) {
    const res = await this.request(this.info.url + '/server/' + server, { method: 'POST', body: 'stop' })
    if (res.error) {
      throw new Error(res.error)
    }
  }

  /**
   * Get a file from an Octyne server process directory.
   * @param {string} server The name of the Octyne server from which to get the file.
   * @param {string} file The path to the file to download.
   * @param {boolean} stream Whether or not to return a ReadableStream (performant for large files.)
   * @returns {Promise<Buffer>|ReadableStream} A ReadableStream if stream is true, else a Promise with a Buffer, with the file data.
   */
  async getFile (server, file, stream) {
    const path = encodeURIComponent(file)
    if (this.info.token) {
      const req = await fetch(this.info.url + '/server/' + server + '/file?path=' + path, {
        method: 'GET',
        headers: { authorization: this.info.token }
      })
      if (stream) {
        return req.body
      }
      const buffer = await req.buffer()
      if (req.ok) return buffer
      const json = JSON.parse(buffer.toString('utf8'))
      if (json && json.error) {
        throw new Error(json.error)
      }
      return buffer
    } else {
      throw new Error('No token is present in the client. Have you logged in with client.login()?')
    }
  }

  /**
   * Gets the contents of the provided folder in an Octyne server process directory.
   * Each file in the array returned is in the following format:
   * { name: string, size: number, lastModified: number, folder: boolean, mimeType: string }
   * @param {string} server The name of the Octyne server from which to get the folder contents.
   * @param {string} directory Path to the folder in the Octyne server process directory.
   * @returns {Promise<Object[]>} A Promise containing an array of objects, in the format given in the description.
   */
  async getFiles (server, directory) {
    const dir = encodeURIComponent(directory)
    const res = await this.request(this.info.url + '/server/' + server + '/files?path=' + dir, { method: 'GET' })
    if (res.contents) {
      return res
    } else {
      throw new Error(res.error)
    }
  }

  /**
   * Creates a folder in an Octyne server process directory.
   * @param {string} server The name of the Octyne server where the folder needs to be created.
   * @param {string} directory Path to the directory which needs to be created.
   * @returns {Promise<void>} A Promise which resolves on success and rejects on failure.
   */
  async createFolder (server, directory) {
    const dir = encodeURIComponent(directory)
    const res = await this.request(this.info.url + '/server/' + server + '/folder?path=' + dir, { method: 'POST' })
    if (res.error) {
      throw new Error(res.error)
    }
  }

  /**
   * Moves a file/folder within an Octyne server process directory.
   * @param {string} server The name of the Octyne server wherein which the file/folder needs to be moved.
   * @param {string} oldpath The path where the current file/folder is located.
   * @param {string} newpath The new path where the file/folder needs to be moved.
   * @returns {Promise<void>} A Promise which resolves on success and rejects on failure.
   */
  async moveFile (server, oldpath, newpath) {
    const res = await this.request(this.info.url + '/server/' + server + '/file', { method: 'PATCH', body: `mv\n${oldpath}\n${newpath}` })
    if (res.error) {
      throw new Error(res.error)
    }
  }

  /**
   * Copies a file/folder within an Octyne server process directory.
   * @param {string} server The name of the Octyne server wherein which the file/folder needs to be moved.
   * @param {string} oldpath The path where the current file/folder is located.
   * @param {string} newpath The new path where the file/folder needs to be copied to.
   * @returns {Promise<void>} A Promise which resolves on success and rejects on failure.
   */
  async copyFile (server, oldpath, newpath) {
    const res = await this.request(this.info.url + '/server/' + server + '/file', { method: 'PATCH', body: `cp\n${oldpath}\n${newpath}` })
    if (res.error) {
      throw new Error(res.error)
    }
  }

  /**
   * Renames a file/folder in an Octyne server process directory.
   * @param {string} server The name of the Octyne server where the file/folder needs to be renamed.
   * @param {string} oldpath The path where the current file/folder is located.
   * @param {string} newname The new name of the file/folder.
   * @returns {Promise<void>} A Promise which resolves on success and rejects on failure.
   */
  renameFile (server, oldpath, newname) {
    const newpath = oldpath.substring(0, oldpath.lastIndexOf('/') + 1) + newname
    return this.moveFile(server, oldpath, newpath)
  }

  /**
   * Deletes a file/folder in an Octyne server process directory.
   * @param {string} server The name of the Octyne server where the file/folder needs to be deleted.
   * @param {string} path Path to the file/folder which needs to be created.
   * @returns {Promise<void>} A Promise which resolves on success and rejects on failure.
   */
  async deleteFile (server, path) {
    const dir = encodeURIComponent(path)
    const res = await this.request(this.info.url + '/server/' + server + '/file?path=' + dir, { method: 'DELETE' })
    if (res.error) {
      throw new Error(res.error)
    }
  }

  /**
   * Gets info on an Octyne server process.
   * The Object returned is: { status, cpuUsage, memoryUsage, totalMemory, uptime, serverVersion } where only serverVersion is a string.
   * @param {string} server The name of the Octyne server process.
   * @returns {Promise<Object>} A Promise containing an Octyne server process object.
   */
  async getServer (server) {
    const res = await this.request(this.info.url + '/server/' + server, { method: 'GET' })
    if (res.status) {
      return res
    } else {
      throw new Error(res.error)
    }
  }

  /**
   * Make a manual request to an Octyne endpoint.
   * @param {string} endpoint The Octyne endpoint to make a request to.
   * @param {Object} options The options to pass to the fetch function.
   * @returns {Promise<Object>} A Promise containing the JSON response.
   */
  async request (endpoint, options) {
    if (this.info.token) {
      return fetch(endpoint, {
        ...(options || {}),
        headers: Object.assign({ Authorization: this.info.token }, options && options.headers)
      }).then(res => res.json())
    } else {
      throw new Error('No token is present in the client. Have you logged in with client.login()?')
    }
  }
}

/**
 * A function to initialise an Octyne API {Client}.
 * Requires either a username/password pair or a token.
 * @param {String} url The URL to the Octyne instance.
 * @param {Object} info An object containing either a username/password pair or an Octyne token.
 * @param {String} [info.username] A string containing the username to log into Octyne with.
 * @param {String} [info.password] A string containing the password to log into Octyne with.
 * @param {String} [info.token] A string containing the token to authenticate to Octyne with.
 * @returns {Client} Returns an Octyne API {Client}.
 */
function OctyneApi (url, info) { // Avoid setting these properties on Client.
  return new Client(url, info)
}
OctyneApi.Client = Client

module.exports = OctyneApi
