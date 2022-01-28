const fs = require('fs')
const process = require('process')
const EventEmitter = require('eventemitter2')

class TestTransport extends EventEmitter {
  kill () {
    this.child.kill()
  }

  _killPreviousPid () {
    let pid = null
    try {
      pid = (fs.readFileSync('./e2e/' + this.name + '.pid')).toString()
      process.kill(pid)
      // console.log('Previous process killed at pid', pid)
    } catch (e) {
      // console.log('No previous process to kill at pid', pid, e.message)
    }
  }

  _rememberPid (pid) {
    fs.writeFileSync('./e2e/' + this.name + '.pid', pid.toString())
  }

  handleData (data) {
    // process.stdout.write(this.name + ' ' + data)
    data.toString().split(/\r?\n/).forEach(line => {
      if (line.startsWith('TESTING;')) {
        const [testing, name, payload] = line.split(';')
        this.emit(name, JSON.parse(payload))
      }
    })
  }

  waitEvent (name, timeout = 5000) {
    return new Promise((resolve, reject) => {
      const clear = setTimeout(() => {
        reject()
      }, timeout)
      this.once(name, payload => {
        clearTimeout(clear)
        setTimeout(() => {
          resolve(payload)
        }, 100)
      })
    })
  }
}

module.exports = TestTransport