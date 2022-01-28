const Message = require('./Message')
const RemoveJob = require('../Jobs/RemoveJob')

class RemoveMessage extends Message {
  name = 'RemoveMessage'
  path

  constructor ({ path }) {
    super()
    this.path = path
  }

  async handle () {
    await (new RemoveJob(this.toObject())).handle()
  }
}

module.exports = RemoveMessage