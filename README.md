# octyne-api

[![requires node.js: >=10](https://img.shields.io/badge/requires%20node.js-%3E%3D10-brightgreen.png?style=flat-square&logo=node.js&logoColor=76D04B)](https://nodejs.org/en/download) [![browsers: not yet supported](https://img.shields.io/badge/browsers-not%20*yet*%20supported-aqua?style=flat-square&logo=javascript&logoColor=aqua)](https://shields.io/)

A Node.js API wrapper for retrixe/octyne.

## Installation

octyne-api makes use of Promises and ES2015 classes and requires Node.js 8+.

```bash
npm install octyne-api
# or
yarn add octyne-api
```

## Usage

octyne-api is built around a Client class which performs all requests.

```js
// Short program to get the uptime of a process running on an Octyne instance.
const OctyneClient = require('octyne-api') // You can name it anything e.g. Client.
const ms = require('ms')

const client = new OctyneClient('http://localhost:42069', {
  username: 'user', password: 'pass' // You can also pass a token for direct usage.
})

client.login().then(async () => {
  const server = await client.getServer('servername')
  console.log(ms(server.uptime, { long: true }))
  await client.logout()
}).catch(err => console.error(err))

```

[For a full list of methods and properties available, look at the typings file.](https://github.com/Sanguineous1/octyne-api/blob/master/index.d.ts)

## License

```
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

