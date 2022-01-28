const fs = require('fs')
const path = require('path')

class Config {
  attributes = {}

  load (obj) {
    this.attributes = { ...this.attributes, ...obj }
  }

  loadFile (file) {
    this.attributes = { ...this.attributes, ...require(file) }
  }

  sanitize () {
    this.attributes.temp_path = (fs.realpathSync(this.attributes.temp_path) + path.sep).replaceAll('\\', '/')
    this.attributes.paths = this.attributes.paths.map(aPath => {
      const newPath = (fs.realpathSync(aPath.path) + path.sep).replaceAll('\\', '/')
      if (!newPath) throw 'Invalid path ' + aPath.path

      return {
        ...aPath,
        path: newPath
      }
    })
  }

  get (name, missing) {
    if (!name) return this.attributes
    return this.attributes[name] || missing
  }
}

module.exports = new Config()