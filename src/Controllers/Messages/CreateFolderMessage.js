const Message = require('./Message')
const CreateFolderJob = require('../Jobs/CreateFolderJob')

class CreateFolderMessage extends Message {
  name = 'CreateFolderMessage'
  path

  constructor ({ path }) {
    super()
    this.path = path
  }

  async handle () {
    await (new CreateFolderJob(this.toObject())).handle()
  }
}

module.exports = CreateFolderMessage