import listenUpdates from './clientForUpdates'
import sendCommand from './clientForOps'
/* eslint-disable no-unused-expressions */

const args = process.argv.slice(2)
const command = args[0]

if (command === 'listenUpdates') {
  const stream = listenUpdates()
  process.on('SIGINT', () => {
    stream.cancel()
    process.exit()
  })
  process.on('SIGTERM', () => {
    stream.cancel()
    process.exit()
  })
} else if (command === 'addNode') {
  sendCommand({ op: 'addNode', args: { id: args[1] } })
} else if (command === 'removeNode') {
  sendCommand({ op: 'removeNode', args: { id: args[1] } })
} else if (command === 'removeLink') {
  sendCommand({ op: 'removeLink', args: { from: args[1], to: args[2] } })
} else if (command === 'addLink') {
  sendCommand({ op: 'addLink', args: { from: args[1], to: args[2] } })
} else {
  throw Error('Unknown Command')
}
