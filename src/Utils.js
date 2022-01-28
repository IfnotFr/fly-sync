const crypto = require('crypto')
const config = require('./Config')
const fs = require('fs')

module.exports = {
  sanitizeSeparators (absolute) {
    return absolute.replaceAll('\\', '/')
  },

  toFullPath (relative) {
    const [id, partialPath] = relative.split(':')
    const found = config.get('paths').find(aPath => aPath.id === id)

    if (!found) throw 'Could not find any path for ' + relative

    return found.path + partialPath
  },

  toRelativePath (absolute) {
    for (const paths of config.get('paths')) {
      if (absolute.startsWith(paths.path)) {
        return absolute.replace(paths.path, paths.id + ':')
      }
    }

    throw 'Could not find any path for ' + absolute
  },

  humanFileSize (size) {
    const i = Math.floor(Math.log(size) / Math.log(1024))
    return (size / Math.pow(1024, i)).toFixed(2) * 1 + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][i]
  },

  async fileExists (absolute) {
    try {
      await fs.promises.access(absolute)
      return true
    } catch (e) {
      return false
    }
  },

  testing (name, payload = null) {
    if (config.get('testing')) console.log('TESTING;' + name + ';' + JSON.stringify(payload))
  },

  md5 (string) {
    return crypto.createHash('md5').update(string).digest('hex')
  }
}