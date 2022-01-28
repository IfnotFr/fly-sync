const Watcher = require('../../../../src/Services/Watcher')
const { EventEmitter2 } = require('eventemitter2')
const fmd5 = require('md5-file')
const path = require('path')

const config = require('../../../../src/Config')
config.load({
  temp_path: path.resolve('./tests/fixture/temp'),
  paths: [{
    'id': 'test',
    'path': path.resolve('./tests/fixture/shared')
  }]
})
config.sanitize()

const watcher = new Watcher()
watcher.chokidar = new EventEmitter2()
watcher.start()

const wait = (duration) => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve()
    }, duration)
  })
}

beforeEach(() => {
  watcher.reset()
})

it('can add, update, and retrieve an entry', async () => {
  const relativePath = 'test:' + Math.random().toString(36).substr(2, 5)
  const entry = {
    type: 'file',
    hash: 'abc'
  }

  watcher.setEntry(relativePath, entry)
  expect(watcher.getEntry(relativePath)).toStrictEqual(entry)
  watcher.setEntry(relativePath, { ...entry, owner: 2 })
  expect(watcher.getEntry(relativePath)).toStrictEqual({ ...entry, owner: 2 })
})

it('creates an entry and emit file_add when chokidar.add is emitted', async () => {
  const file = {
    absolute: path.resolve('./tests/fixture/shared/test_file.txt'),
    relative: 'test:test_file.txt',
  }
  const hash = await fmd5(file.absolute)

  const fnMock = jest.fn()
  watcher.on('file_add', fnMock)
  watcher.chokidar.emit('add', file.absolute)

  await wait(100)

  expect(fnMock).toHaveBeenLastCalledWith({ ...file, newHash: hash, owner: null })
  expect(watcher.getEntry(file.relative)).toStrictEqual({ type: 'file', hash })
})

it('creates an entry and emit file_change when chokidar.change is emitted', async () => {
  const file = {
    absolute: path.resolve('./tests/fixture/shared/test_file.txt'),
    relative: 'test:test_file.txt',
  }
  const hash = await fmd5(file.absolute)

  const fnMock = jest.fn()
  watcher.on('file_change', fnMock)

  // Checking first change
  watcher.setOwner(file.relative, 10)
  watcher.chokidar.emit('change', file.absolute)
  await wait(100)
  expect(fnMock).toHaveBeenLastCalledWith({ ...file, oldHash: null, newHash: hash, owner: 10 })
  expect(watcher.getEntry(file.relative)).toStrictEqual({ type: 'file', hash })

  // Checking second change
  watcher.chokidar.emit('change', file.absolute)
  await wait(100)
  expect(fnMock).toHaveBeenLastCalledWith({ ...file, oldHash: hash, newHash: hash, owner: null })
})