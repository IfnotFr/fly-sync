const utils = require('../Utils')
const EventEmitter = require('eventemitter2')
const fs = require('fs')
const watcher = require('@parcel/watcher')

class Watcher extends EventEmitter {
  debug = false
  paths = []
  subscriptions = []
  options = {}
  owners = {}

  constructor (paths, options = {}) {
    super()

    this.paths = paths
    this.options = { ...this.options, ...options }
  }

  async start () {
    for (const dir of this.paths) {
      if (this.debug) console.log('[Watcher] Subscribe to', dir, 'modifications ...')
      this.subscriptions.push(await watcher.subscribe(dir, async (err, events) => {
        if (this.debug) console.log('[Watcher] Got events', events)
        for (const event of events) {
          try {
            if (event.type === 'create') {
              const stat = await fs.promises.lstat(event.path)
              if (stat.isFile()) {
                await this.fileAdded(event.path)
              } else {
                await this.dirAdded(event.path)
              }
            } else if (event.type === 'update') {
              await this.fileChanged(event.path)
            } else if (event.type === 'delete') {
              await this.unlink(event.path)
            }
          } catch (e) {
            console.warn('[Watcher] Could not dispath event', event, e)
          }
        }
      }))
    }
  }

  isValid (name) {
    return !name.startsWith('.sav.')
  }

  async fileAdded (absolute) {
    absolute = utils.sanitizeSeparators(absolute)
    const relative = utils.toRelativePath(absolute)
    if (this.debug) console.log('[Watcher] File', relative, 'has been added')

    const owner = this.getOwner(relative)
    this.emit('file_add', { relative, absolute, owner })
  }

  async fileChanged (absolute) {
    absolute = utils.sanitizeSeparators(absolute)
    const relative = utils.toRelativePath(absolute)
    if (this.debug) console.log('[Watcher] File', relative, 'has been changed')

    const owner = this.getOwner(relative)
    this.emit('file_change', { relative, absolute, owner })
  }

  async dirAdded (absolute) {
    absolute = utils.sanitizeSeparators(absolute)
    const relative = utils.toRelativePath(absolute)
    if (relative.endsWith(':')) return // Do not add the root directory
    if (this.debug) console.log('[Watcher] Directory', relative, 'has been added')

    const owner = this.getOwner(relative)
    this.emit('dir_add', { absolute, relative, owner })
  }

  async unlink (absolute) {
    absolute = utils.sanitizeSeparators(absolute)
    const relative = utils.toRelativePath(absolute)
    if (relative.endsWith(':')) return // Do not remove the root directory
    if (this.debug) console.log('[Watcher] Target', relative, 'has been removed')

    const owner = this.getOwner(relative)
    this.emit('unlink', { absolute, relative, owner })
  }

  setOwner (relative, owner) {
    if (owner) {
      this.owners[relative] = owner
    } else {
      delete this.owners[relative]
    }
  }

  getOwner (relative, once = true) {
    const owner = this.owners[relative] || null
    if(once) delete this.owners[relative]
    return owner
  }
}

module.exports = Watcher