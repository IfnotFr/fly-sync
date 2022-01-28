const ws = require('ws')
const Transport = require('./Transport')

const debug = false

class Client extends Transport {
  options = {}
  socket
  stream
  watchdog

  constructor (options) {
    super()
    this.options = options
  }

  setup () {
    return new Promise(resolve => {
      console.log('[Transport] Connecting to', this.options.remote)

      this.socket = new ws.WebSocket(this.options.remote, { timeout: 5000 })
      this.stream = ws.createWebSocketStream(this.socket)

      this.socket.on('open', () => {
        console.log('[Transport] Connected to', this.options.remote)
        resolve()
      })

      this.socket.on('error', e => {
        console.log(e)
      })

      this.socket.on('close', e => {
        console.log('Connection lost, socket is closed.', e)
        process.exit()
      })

      this.stream.on('data', data => {
        if (this.isSerialized(data)) {
          const received = this.unserialize(data)
          if (debug) console.log('[Transport] Received', received)
          this.emit(received.name, { owner: 1, payload: received.payload })
        } else {
          if (debug) console.log('[Transport] Received stream chunk of', data.length, 'bytes')
          this.emit('chunk', data)
        }
      })
    })
  }

  hasTarget ({ except = null, only = null } = {}) {
    return !(except === 1 || (only !== null && only !== 1))
  }

  send (name, payload, { except = null, only = null } = {}) {
    if (except === 1 || (only !== null && only !== 1)) return

    const data = this.serialize({ name, payload })
    if (debug) console.log('[Transport] Sending', name, payload)
    this.socket.send(data)
  }

  pipeStream (stream, { except = null, only = null } = {}) {
    return new Promise((resolve, reject) => {
      if (except === 1 || (only !== null && only !== 1)) return

      if (debug) console.log('[Transport] Piping stream')
      stream.pipe(this.stream, { end: false })
      stream.on('error', error => reject(error))
      stream.on('end', () => {
        if (debug) console.log('[Transport] Stream ended')
        resolve()
      })
    })
  }
}

module.exports = Client