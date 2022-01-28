const Job = require('./Job')
const fs = require('fs')
const utils = require('../../Utils')

// const debug = false

class CreateFolderJob extends Job {
  name = 'CreateFolderJob'
  path

  constructor ({ path }) {
    super()
    this.path = path
  }

  async handle () {
    const absolute = utils.toFullPath(this.path)
    console.log('[CreateFolderJob] (' + this.path + ') Creating folder', absolute)

    await fs.promises.mkdir(absolute, { recursive: true })
  }
}

module.exports = CreateFolderJob