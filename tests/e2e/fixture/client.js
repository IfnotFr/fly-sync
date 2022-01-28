module.exports = {
  "client": true,
  "remote": "ws://127.0.0.1:6666",
  "testing": true,
  "temp_path": process.cwd() + '/e2e/fixture/temp',
  "paths": [
    {
      "id": "sync",
      "path": process.cwd() + '/e2e/fixture/sync/client'
    }
  ]
}