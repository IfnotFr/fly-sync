const EventEmitter = require('eventemitter2')

class Transport extends EventEmitter {
  serialize (obj) {
    return 'j:' + JSON.stringify(obj)
  }

  unserialize (data) {
    return JSON.parse(data.slice(2))
  }

  isSerialized (data) {
    return data.toString('utf8', 0, 2) === 'j:'
  }
}

module.exports = Transport