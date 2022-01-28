const Job = require('./Job')
const fs = require('fs')
const utils = require('../../Utils')

// const debug = true

class RemoveJob extends Job {
  name = 'RemoveJob'
  path

  constructor ({ path }) {
    super()
    this.path = path
  }

  async handle () {
    const absolute = utils.toFullPath(this.path)
    console.log('[RemoveJob] (' + this.path + ') Removing', absolute)
    await fs.promises.rm(absolute, { recursive: true, force: true })
  }
}

module.exports = RemoveJob