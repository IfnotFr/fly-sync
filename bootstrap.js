const path = require('path')
const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')
const argv = yargs(hideBin(process.argv)).argv

const config = require('./src/Config')

config.load(argv)
config.loadFile(argv.config ? process.cwd() + path.sep + argv.config : '../.config.json')
config.sanitize()

module.exports = {
  config
}