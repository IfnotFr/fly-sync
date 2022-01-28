const ws = require('ws')
const Transport = require('./Transport')

const debug = false

class Server extends Transport {
  options = {}
  server
  clients = {}
  lastClientId = 1

  constructor (options) {
    super()
    this.options = options
    this.handleClientDisconnections()
  }

  setup () {
    return new Promise(resolve => {
      console.log('[Transport] Starting web socket server using port', this.options.port)
      this.server = new ws.WebSocketServer(this.options)
      this.server.on('connection', socket => {
        const stream = ws.createWebSocketStream(socket)
        const id = this.createClient(socket, stream)

        console.log('[Transport] (' + socket.id + ') New client connected from', socket._socket.remoteAddress)

        stream.on('data', data => {
          if (this.isSerialized(data)) {
            const received = this.unserialize(data)
            if (debug) console.log('[Transport] (' + socket.id + ') Received', received)
            this.emit(received.name, { owner: socket.id, payload: received.payload })
          } else {
            if (debug) console.log('[Transport] (' + socket.id + ') Received stream chunk of', data.length, 'bytes')
            this.emit('chunk', data)
          }
        })
      })

      this.server.on('listening', socket => {
        resolve()
      })
    })
  }

  handleClientDisconnections () {
    /*
    setInterval(() => {
      for (const [id, client] of Object.entries(this.clients)) {
        if (client.timeout - new Date() < 0) {
          if (debug) console.log('[Transport] (' + id + ') Client timeout, disconnecting')
          client.socket.close()
          delete this.clients[id]
        }
      }

      for (const [id, client] of Object.entries(this.clients)) {
        if (debug) console.log('[Transport] (' + id + ') Sending ping')
        client.socket.send('ping')
      }
    }, 5000)
    */
  }

  createClient (socket, stream) {
    socket.id = this.lastClientId++
    this.clients[socket.id] = { socket, stream }
    this.resetSocketTimeout(socket)
    return socket.id
  }

  resetSocketTimeout (socket) {
    const timeout = new Date()
    timeout.setSeconds(timeout.getSeconds() + 15)
    this.clients[socket.id].timeout = timeout
  }

  hasTarget ({ except = null, only = null } = {}) {
    if (only) {
      return only in this.clients[only]
    } else {
      let count = 0
      for (const [id, client] of Object.entries(this.clients)) {
        if (except !== parseInt(id)) {
          count++
        }
      }
      return count > 0
    }
  }

  send (name, payload, { except = null, only = null } = {}) {
    const data = this.serialize({ name, payload })

    if (only) {
      if (debug) console.log('[Transport] (' + only + ') Sending', name, payload)
      this.clients[only].socket.send(data)
    } else {
      for (const [id, client] of Object.entries(this.clients)) {
        if (except !== parseInt(id)) {
          if (debug) console.log('[Transport] (' + id + ') Sending', name, payload)
          client.socket.send(data)
        } else {
          if (debug) console.log('[Transport] (' + id + ') Skipping sending', name, payload)
        }
      }
    }
  }

  pipeStream (stream, { except = null, only = null } = {}) {
    return new Promise((resolve, reject) => {
      let pipeCount = 0

      if (only) {
        if (debug) console.log('[Transport] (' + only + ') Piping stream')
        stream.pipe(this.clients[only].stream, { end: false })
        pipeCount++
      } else {
        for (const [id, client] of Object.entries(this.clients)) {
          if (except !== parseInt(id) || only === parseInt(id)) {
            if (debug) console.log('[Transport] (' + id + ') Piping stream')
            stream.pipe(client.stream, { end: false })
            pipeCount++
          } else {
            if (debug) console.log('[Transport] (' + id + ') Skipping piping stream')
          }
        }
      }

      stream.on('error', error => reject(error))
      stream.on('end', () => {
        if (debug) console.log('[Transport] Stream ended')
        resolve()
      })

      // If not stream was piped, close the input stream
      if (pipeCount === 0) {
        if (debug) console.log('[Transport] No target for stream, closing it ...')
        stream.destroy()
      }
    })
  }
}

module.exports = Server