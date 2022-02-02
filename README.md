# Fly Sync (daemon) `WIP`

Realtime and cross-platform (Windows, Linux, OSX) files and folders synchronisation using NodeJs. 
Ideal for developers who want source code synchronization between two machines.

*In short, it's like linux `rsync` but bilateral, cross-platform, real-time and websocket-based.*

> **WIP Warning** not fully battle-tested, this package may contain bugs, please do not use in production and backup your files regullary.

## Main features

- :v: **Easy** - NodeJs cli app for client and server with simple config.
- :zap: **Fast** - Good transfer speed with websocket stream :
  - Multiples small files (npm packages, long nested folders ...)
  - Big files (with file streaming)
- :bulb: **Flexible** - Multiple named folders to sync with regex exclusion

## Quick start

Install the package globally with npm or yarn:
- `npm global install @ifnot/fly-sync`
- (or) `yarn add -g @ifnot/fly-sync`

### Server

Copy and configure `config.server.json` and start your server :

    node index.js --config=/path/to/config.server.json

### Client

Copy and configure `config.client.json` and start your client :

    node index.js --config=/path/to/config.client.json

## Configuration

- **server** `boolean`: Tells the app to act as a server (`port` became required)
- **port** `numeric`: The port to use for the server
- **client** `boolean`: Tells the app to act as a client (`remote` became required)
- **remote** `string`: The complete WebSocket URL where the client should attempt to connect (example: `ws://127.0.0.1:6666`)
- **temp_path** `string`: The temporary folder to use for receiving file streams
- **paths** `array` : list of all paths to sync
  - **id** `string`: The id of the folder to sync (ids should match between server and client)
  - **path** `string`: The **absolute** path of the folder to sync
  - **only** `string`: The whitelist regex for filtering relative files paths
  - **except** `string`: The blacklist regex for filtering relative files paths

## Tech stack

- File change detection using a native C++ Node module for querying and subscribing to filesystem events. The same as [Parcel 2](https://parceljs.org/) with the [@parcel/watcher](https://www.npmjs.com/package/@parcel/watcher) package.
- Fast transfer with WebSocket client and server implementation [ws](https://www.npmjs.com/package/ws)

## Todo List :

- [ ] Add ping-pong strategy for :
  - [ ] Detecting lost clients from server
  - [ ] Reconnecting clients when connection is lost
- [ ] Improve the event ownership system for a hash based ?
- [ ] Add hashing and time based verification before doing disk actions
- [ ] Add an initial full folder sync on connection (what strategy ?)
- [ ] Add reading buffer for accepting multiple clients & servers (using a reading cache)
- [ ] Improve receiving message stream using real Stream