const EventEmitter = require('eventemitter2')
const messages = require('./Messages')
const utils = require('../Utils')

const debug = false

class Worker {
  transport
  watcher
  dispatcher
  session
  running

  constructor ({ transport, watcher, dispatcher }) {
    this.transport = transport
    this.watcher = watcher
    this.dispatcher = dispatcher
    this.session = new EventEmitter()
  }

  listen () {
    this.transport.on('message_begin', async ({ owner, payload }) => {
      if (debug) console.log('[Worker] Got message_begin', payload)
      this.running = messages.get(payload)
      try {
        if ('path' in this.running) this.watcher.setOwner(this.running.path, owner)
        await this.running.handle({ dispatcher: this.dispatcher, stream: this.session })
      } catch (e) {
        console.warn('[Worker] (' + this.running.name + ') Message handle error:', e.message)
        this.session.emit('end')
        this.session.removeAllListeners()
        this.running = null
      }
    })

    this.transport.on('message_end', async ({ owner, payload }) => {
      if (debug) console.log('[Worker] Got message_end', payload)
      this.session.emit('end')
      this.session.removeAllListeners()
      this.running = null
      utils.testing('MessageHandled:' + payload.name)
    })

    this.transport.on('message', async ({ owner, payload }) => {
      if (debug) console.log('[Worker] Got message', payload)
      this.running = messages.get(payload)
      try {
        if ('path' in this.running) this.watcher.setOwner(this.running.path, owner)
        await this.running.handle({ dispatcher: this.dispatcher })
      } catch (e) {
        console.warn('[Worker] (' + this.running.name + ') Message handle error:', e.message)
      }

      this.running = null
      utils.testing('MessageHandled:' + payload.name)
    })

    this.transport.on('chunk', data => {
      if (debug) console.log('[Worker] Got chunk of', data.length, 'bytes')
      this.session.emit('data', data)
    })
  }
}

module.exports = Worker