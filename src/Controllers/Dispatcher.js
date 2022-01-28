const EventEmitter = require('eventemitter2')
const UploadFileMessage = require('./Messages/UploadFileMessage')
const CreateFolderMessage = require('./Messages/CreateFolderMessage')
const RemoveMessage = require('./Messages/RemoveMessage')

const utils = require('../Utils')

const debug = false

class Dispatcher extends EventEmitter {
  watcher
  transport
  queue = []
  immediate = false
  working = false

  constructor ({ watcher, transport }) {
    super()

    this.watcher = watcher
    this.transport = transport

    setInterval(async () => {
      await this.dispatchQueue()
    }, 100)
  }

  listen () {
    if (debug) console.log('[Dispatcher] Listening for watcher events ...')

    this.watcher
      .on('file_add', ({ relative, owner }) => {
        this.enqueue(
          new UploadFileMessage({ path: relative }),
          { except: owner }
        )
      })
      .on('file_change', ({ relative, owner }) => {
        this.enqueue(
          new UploadFileMessage({ path: relative }),
          { except: owner }
        )
      })
      .on('dir_add', ({ relative, owner }) => {
        this.enqueue(
          new CreateFolderMessage({ path: relative }),
          { except: owner }
        )
      })
      .on('unlink', ({ relative, owner }) => {
        this.enqueue(
          new RemoveMessage({ path: relative }),
          { except: owner }
        )
      })
  }

  enqueue (message, { except = null, only = null } = {}) {
    // if (debug) console.log('[Dispatcher] Queuing message (e:' + except + ', o:' + only + '): ', message.toObject())
    this.queue.push({ message, except, only })
    this.dispatchQueue()
  }

  async dispatchQueue () {
    if (this.working) return
    this.working = true

    while (this.queue.length > 0) {
      const { message, except, only } = this.queue.shift()
      if (!this.transport.hasTarget({ except, only })) {
        if (debug) console.log('[Dispatcher] Skipping dispatch message', message.name, '(e:' + except + ', o:' + only + '), transport target available.')
      } else {
        if (debug) console.log('[Dispatcher] Dispatch Message (e:' + except + ', o:' + only + '): ', message.toObject())
        if (typeof message.streaming === 'function') {
          this.transport.send('message_begin', message.toObject(), { except, only })
          try {
            await message.streaming(this.transport, { except, only })
          } catch (e) {
            console.warn('[Dispatcher] (' + message.name + ') Message streaming error:', e.message)
          }
          this.transport.send('message_end', message.toObject(), { except, only })
          utils.testing('MessageSent:' + message.name)
        } else {
          this.transport.send('message', message.toObject(), { except, only })
          utils.testing('MessageSent:' + message.name)
        }
      }
    }

    this.working = false
  }
}

module.exports = Dispatcher