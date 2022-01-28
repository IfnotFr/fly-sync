# Fly Sync (daemon) `WIP`

Realtime and cross-platform (Windows, Linux, OSX) file and folders synchronisation using NodeJs.

> Ideal for developers who want source code synchronization between two machines.

**WIP Warning** not fully battle-tested, this package may contain bugs, please do not use in production and backup your files regullary.

## Main features :

- NodeJs cli app for client and server with simple config.
- Good transfer speed with websocket stream :
  - Multiples small files (npm packages, long nested folders ...)
  - Big files (with file streaming)
- Multiple named folders to sync with regex exclusion

## Tech stack

- Efficient file change detection using a native C++ Node module for querying and subscribing to filesystem events. The same as [Parcel 2](https://parceljs.org/) with the [@parcel/watcher](https://www.npmjs.com/package/@parcel/watcher) package.
- Blazing fast transfer with WebSocket client and server implementation [ws](https://www.npmjs.com/package/ws)

## Todo List :

- [ ] Add ping-pong strategy for :
  - [ ] Detecting lost clients from server
  - [ ] Reconnecting clients when connection is lost
- [ ] Improve the event ownership system for a hash based ?
- [ ] Add hashing and time based verification before doing disk actions
- [ ] Add an initial full folder sync on connection (what strategy ?)
- [ ] Add reading buffer for accepting multiple clients & servers (using a reading cache)
- [ ] Improve receiving message stream using real Stream