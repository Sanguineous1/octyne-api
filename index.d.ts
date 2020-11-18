import WebSocket from 'ws'
import { RequestInit } from 'node-fetch'

export type ServerStatus = 0 | 1 | 2
export type ClientInfo = { username: string, password: string } | { token: string }
export interface Server {
  status: number,
  uptime: number,
  cpuUsage: number,
  memoryUsage: number,
  totalMemory: number,
  serverVersion: string
}
export interface File {
  name: string,
  size: number,
  folder: boolean,
  mimeType: string,
  lastModified: number
}

export class Client {
  constructor(url: string, info: ClientInfo);
  login(): Promise<void>;
  logout(): Promise<void>;
  request(endpoint: string, opts?: RequestInit): Promise<object>;
  getServer(server: string): Promise<Server>;
  getServers(): Promise<Array<{ [name: string]: ServerStatus }>;

  startServer(server: string): Promise<void>;
  stopServer(server: string): Promise<void>;
  openConsole(server: string): Promise<WebSocket>;

  getFile(server: string, file: string, stream?: boolean): Promise<Buffer>;
  getFiles(server: string, directory: string): Promise<File[]>;
  createFolder(server: string, directory: string): Promise<void>;
  moveFile(server: string, oldpath: string, newpath: string): Promise<void>;
  copyFile(server: string, oldpath: string, newpath: string): Promise<void>;
  renameFile(server: string, oldpath: string, newpath: string): Promise<void>;
  deleteFile(server: string, directory: string): Promise<void>;  
}

export = Client

