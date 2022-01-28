require('./bootstrap')
const utils = require('./src/Utils')

const config = require('./src/Config')

const Server = require('./src/Services/Transports/Server')
const Client = require('./src/Services/Transports/Client')
const Watcher = require('./src/Services/Watcher')
const Dispatcher = require('./src/Controllers/Dispatcher')
const Worker = require('./src/Controllers/Worker')

;(async () => {
  // Start watching the directories for modifications
  const watcher = new Watcher(config.get('paths').map(aPath => aPath.path))
  await watcher.start()

  // Get the transport based on configuration
  let transport = null
  if (config.get('server')) {
    transport = new Server({ port: config.get('port') })
  } else if (config.get('client')) {
    transport = new Client({ remote: config.get('remote') })
  }
  await transport.setup()

  // Prepare a dispatcher for sending all the events into jobs through the transport
  const dispatcher = new Dispatcher({ transport, watcher })
  dispatcher.listen()

  // Prepare a worker for computing received jobs (send the dispatcher as messages can dispatch responses)
  const worker = new Worker({ transport, watcher, dispatcher })
  worker.listen()

  const readline = require('readline')
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
  })

  utils.testing('ready')
})()