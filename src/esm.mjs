import OctyneApi from './index.js'

export const { Client } = OctyneApi

export default function (url, info) {
  return new Client(url, info)
}
