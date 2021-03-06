# octyne-api

[![requires node.js: >=10](https://img.shields.io/badge/requires%20node.js-%3E%3D10-brightgreen?style=flat-square&logo=node.js&logoColor=76D04B)](https://nodejs.org/en/download) [![requires browsers: >= Edge 15, Firefox 52, Chrome 55 or Safari 11](https://img.shields.io/badge/requires%20browsers-%3E%3D%20Edge%2015%2C%20Firefox%2052%2C%20Chrome%2055%20or%20Safari%2011-aqua?style=flat-square&logo=javascript&logoColor=aqua)](https://shields.io/) [![octyne-api/ie9 requires: at least Internet Explorer 9](https://img.shields.io/badge/octyne--api%2Fie9%20requires-at%20least%20Internet%20Explorer%209-aqua?style=flat-square&logo=internet-explorer&logoColor=aqua)](https://shields.io/)

A JavaScript API wrapper for retrixe/octyne.

## Installation

octyne-api makes use of `Promise`s, async functions and ES2015 classes, and thus requires Node.js 8+ (only 10+ is officially supported) or a modern evergreen browser. However, you can import `octyne-api/ie9` to use the library on older browsers like Internet Explorer 9 (requires a polyfill like `core-js`).

```bash
npm install octyne-api
# or
yarn add octyne-api
```

## Usage

octyne-api is built around a Client class which performs all requests.

[View the docs for the latest release here.](https://github.com/Sanguineous1/octyne-api/wiki/Docs)

```js
// Short program to get the uptime of a process running on an Octyne instance.
const OctyneApi = require('octyne-api') // You can name it anything e.g. Client.
const ms = require('ms')

const client = OctyneApi('http://localhost:42069', {
  username: 'user', password: 'pass' // You can also pass a token for direct usage.
})

client.login().then(async () => {
  const server = await client.getServer('servername')
  console.log(ms(server.uptime, { long: true }))
  await client.logout()
}).catch(err => console.error(err))

```

For a full list of methods and properties available on the `master` branch, you can also look at the typings file [here.](https://github.com/Sanguineous1/octyne-api/blob/master/index.d.ts)

## License

```text
MIT License

Copyright (c) 2020 Sanguineous1

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
