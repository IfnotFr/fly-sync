const { spawn } = require('child_process')
const TestTransport = require('./TestTransport')

class TestClient extends TestTransport {
  name = 'client'
  child

  constructor () {
    super()

    this._killPreviousPid()

    this.child = spawn('node', ['index.js', '--config=./e2e/fixture/client.js'], {
      cwd: __dirname + '/../../'
    })

    this.child.stdout.on('data', data => this.handleData(data))
    this.child.stderr.on('data', data => this.handleData(data))

    this._rememberPid(this.child.pid)
  }
}

module.exports = TestClient