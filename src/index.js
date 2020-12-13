const WebSocket = require('ws')
const fetch = require('node-fetch')
const path = require('path')

class Client {
  constructor (url, info) {
    this.info = { url: url, username: info.username || undefined }
    if (this.info.password) {
      Object.defineProperty(this.info, '_password', {
        value: info.password,
        enumerable: false
      })
    }
    if (this.info.token) {
      Object.defineProperty(this.info, '_token', {
        value: info.token,
        enumerable: false,
        configurable: true
      })
    }
  }

  async getServers () {
    return await this.request(this.info.url + '/servers', { method: 'GET' })
  }

  async login () {
    const res = await (await fetch(this.info.url + '/login', {
      method: 'POST',
      headers: { Username: this.info.username, Password: this.info._password }
    })).json()
    if (res.token) {
      Object.defineProperty(this.info, '_token', {
        value: res.token,
        enumerable: false,
        configurable: true
      })
    } else {
      throw new Error(res.error)
    }
  }

  async logout () {
    const res = await this.request(this.info.url + '/logout', { method: 'POST' })
    if (res.success) {
      delete this.info._token
    } else {
      throw new Error(res.error)
    }
  }

  async openConsole (server) {
    const url = this.info.url
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(url + '/server/' + server + '/console', {
        headers: { authorization: this.info._token }
      })
      let open = false
      ws.on('open', () => {
        open = true
        resolve(ws)
      })
      ws.on('error', (err) => {
        if (!open) reject(err)
      })
    })
  }

  async startServer (server) {
    const res = await this.request(this.info.url + '/server/' + server, { method: 'POST', body: 'start' })
    if (res.error) {
      throw new Error(res.error)
    }
  }

  async stopServer (server) {
    const res = await this.request(this.info.url + '/server/' + server, { method: 'POST', body: 'stop' })
    if (res.error) {
      throw new Error(res.error)
    }
  }

  async getFile (server, file, stream) {
    const path = encodeURIComponent(file)
    if (this.info._token) {
      const req = await fetch(this.info.url + '/server/' + server + '/file?path=' + path, {
        method: 'GET',
        headers: { authorization: this.info._token }
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

  async getFiles (server, directory) {
    const dir = encodeURIComponent(directory)
    const res = await this.request(this.info.url + '/server/' + server + '/files?path=' + dir, { method: 'GET' })
    if (res.contents) {
      return res
    } else {
      throw new Error(res.error)
    }
  }

  async createFolder (server, directory) {
    const dir = encodeURIComponent(directory)
    const res = await this.request(this.info.url + '/server/' + server + '/folder?path=' + dir, { method: 'POST' })
    if (res.error) {
      throw new Error(res.error)
    }
  }

  async moveFile (server, oldpath, newpath) {
    const res = await this.request(this.info.url + '/server/' + server + '/file', { method: 'PATCH', body: `mv\n${oldpath}\n${newpath}` })
    if (res.error) {
      throw new Error(res.error)
    }
  }

  async copyFile (server, oldpath, newpath) {
    const res = await this.request(this.info.url + '/server/' + server + '/file', { method: 'PATCH', body: `copy\n${oldpath}\n${newpath}` })
    if (res.error) {
      throw new Error(res.error)
    }
  }

  renameFile (server, oldpath, newname) {
    const newName = path.join(oldpath, '..', newname)
    return this.moveFile(server, oldpath, newName)
  }

  async deleteFile (server, directory) {
    const dir = encodeURIComponent(directory)
    const res = await this.request(this.info.url + '/server/' + server + '/file?path=' + dir, { method: 'DELETE' })
    if (res.error) {
      throw new Error(res.error)
    }
  }

  async getServer (server) {
    const res = await this.request(this.info.url + '/server/' + server, { method: 'GET' })
    if (res.status) {
      return res
    } else {
      throw new Error(res.error)
    }
  }

  async request (endpoint, opts) {
    if (this.info._token) {
      return fetch(endpoint, {
        ...(opts || {}),
        headers: Object.assign({ Authorization: this.info._token }, opts && opts.headers)
      }).then(res => res.json())
    } else {
      throw new Error('No token is present in the client. Have you logged in with client.login()?')
    }
  }
}

function OctyneApi (url, info) { // Avoid setting these properties on Client.
  return new Client(url, info)
}
OctyneApi.Client = Client

module.exports = OctyneApi
