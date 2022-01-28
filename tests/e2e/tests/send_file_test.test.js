const fs = require('fs')
const TestServer = require('../src/TestServer')
const TestClient = require('../src/TestClient')

const folders = {
  client (relative) {
    return './e2e/fixture/sync/client/' + relative
  },
  server (relative) {
    return './e2e/fixture/sync/server/' + relative
  }
}

let server = null
let client = null

beforeEach(() => {
  // Purge folders
  fs.rmSync('./e2e/fixture/sync/client', { recursive: true, force: true })
  fs.rmSync('./e2e/fixture/sync/server', { recursive: true, force: true })
  fs.mkdirSync('./e2e/fixture/sync/client')
  fs.mkdirSync('./e2e/fixture/sync/server')

  // Create client and server
  return new Promise(resolve => {
    server = new TestServer()
    server.on('ready', () => {
      client = new TestClient()
      client.on('ready', () => {
        resolve({ server, client })
      })
    })
  })
})

afterEach(() => {
  server.kill()
  client.kill()
})

test('client can send a file to server', async () => {
  const fileName = 'foo.txt'
  const fileContent = 'bar'

  await fs.promises.writeFile(folders.client(fileName), fileContent)
  await server.waitEvent('MessageHandled:UploadFileMessage')
  const result = (await fs.promises.readFile(folders.server(fileName))).toString()
  expect(result).toBe(fileContent)
})

test('server can send a file to client', async () => {
  const fileName = 'foo.txt'
  const fileContent = 'bar'

  await fs.promises.writeFile(folders.server(fileName), fileContent)
  await client.waitEvent('MessageHandled:UploadFileMessage')
  const result = (await fs.promises.readFile(folders.client(fileName))).toString()
  expect(result).toBe(fileContent)
})