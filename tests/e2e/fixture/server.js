module.exports = {
  "server": true,
  "port": 6666,
  "testing": true,
  "temp_path": process.cwd() + '/e2e/fixture/temp',
  "paths": [
    {
      "id": "sync",
      "path": process.cwd() + '/e2e/fixture/sync/server'
    }
  ]
}