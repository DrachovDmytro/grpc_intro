import getClient from './client'
import { Empty } from 'google-protobuf/google/protobuf/empty_pb'
import { GraphOpLog } from '../libs/protobuf/proto_gen/graph_pb'

export default () => {
  const client = getClient()
  const stream = client.getGraphOpLog(new Empty())
  stream.on('data', (d: GraphOpLog) => {
    let v, msg
    switch (d.getDataCase()) {
      case GraphOpLog.DataCase.GRAPH:
        v = d.getGraph()
        msg = 'Graph'
        break
      case GraphOpLog.DataCase.LINK:
        v = d.getLink()
        msg = 'Link'
        break
      case GraphOpLog.DataCase.NODE:
        v = d.getNode()
        msg = 'Node'
        break
      default:
        break
    }
    if (v) {
      console.log(`Receive ${msg} update: ${d.getOp()}`, v.toObject())
    }
  })
  return stream
}
