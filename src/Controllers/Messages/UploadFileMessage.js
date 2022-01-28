const Message = require('./Message')
const fs = require('fs')
const utils = require('../../Utils')
const UploadFileJob = require('../Jobs/UploadFileJob')

const debug = false

class UploadFileMessage extends Message {
  name = 'UploadFileMessage'
  path

  constructor ({ path } = {}) {
    super()
    this.path = path
  }

  async streaming (transport, { except, only }) {
    const absolute = utils.toFullPath(this.path)
    const stats = await fs.promises.stat(absolute)

    process.stdout.write('[UploadFileMessage] (' + this.path + ') Sending file ' + utils.humanFileSize(stats.size) + ' ')

    const stream = fs.createReadStream(absolute)
      .on('data', () => process.stdout.write('.'))
      .on('close', () => console.log(' [OK]'))

    await transport.pipeStream(stream, { except, only })
  }

  async handle ({ stream }) {
    await (new UploadFileJob(this.toObject())).handle(stream)
  }
}

module.exports = UploadFileMessage