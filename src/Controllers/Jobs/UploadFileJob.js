const Job = require('./Job')
const fs = require('fs')
const path = require('path')
const utils = require('../../Utils')
const config = require('../../Config')

const debug = false

class UploadFileJob extends Job {
  name = 'UploadFileJob'
  path

  constructor ({ path } = {}) {
    super()
    this.path = path
  }

  async handle (stream) {
    process.stdout.write('[UploadFileJob] (' + this.path + ') Receiving file ')
    if (debug) console.log('[UploadFileJob] (' + this.path + ') Receiving file stream ...')

    let bytes = 0
    const absolute = utils.toFullPath(this.path)
    const tempFile = utils.md5(this.path)
    const tempPath = config.get('temp_path') + tempFile

    if (debug) console.log('[UploadFileJob] (' + this.path + ') Create temporary write stream to', tempFile)
    const file = fs.createWriteStream(tempPath)

    stream.on('data', chunk => {
      process.stdout.write('.')
      if (debug) console.log('[UploadFileJob] (' + this.path + ') Writing', chunk.length, 'bytes into', tempFile)
      bytes += chunk.length
      file.write(chunk)
    })

    stream.on('end', async () => {
      console.log(' [OK ' + utils.humanFileSize(bytes) + ']')
      if (debug) console.log('[UploadFileJob] (' + this.path + ') Close temporary file', tempFile)
      file.close()

      if (debug) console.log('[UploadFileJob] (' + this.path + ') Moving from', tempPath, 'to', absolute)
      try {
        await fs.promises.mkdir(path.dirname(absolute), { recursive: true })
      } catch (e) { }

      await fs.promises.rename(tempPath, absolute)
    })
  }
}

module.exports = UploadFileJob