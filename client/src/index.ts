import grpc from 'grpc'
import empty_pb from 'google-protobuf/google/protobuf/empty_pb'
import proto_grpc from './proto_gen/graph_grpc_pb'
import proto from './proto_gen/graph_pb'

const SERVER_HOST = process.env.SERVER_HOST || '127.0.0.1'
const SERVER_PORT = process.env.SERVER_PORT || '5679'

const client = new proto_grpc.GraphServiceClient(`${SERVER_HOST}:${SERVER_PORT}`, grpc.credentials.createInsecure())
const stream = client.getGraphOpLog(new empty_pb.Empty)
stream.on('data', (d: proto.GraphOpLog) => {
  let v, msg;
  switch (d.getDataCase()) {
    case proto.GraphOpLog.DataCase.GRAPH:
      v = d.getGraph()
      msg = 'Graph'
      break;
    case proto.GraphOpLog.DataCase.LINK:
      v = d.getLink()
      msg = 'Link'
      break;
    case proto.GraphOpLog.DataCase.NODE:
      v = d.getNode()
      msg = 'Node'
      break;
    default:
      break;
  }
  if (v) {
    console.log(`Receive ${msg} update`, v.toObject())
  }
})

let prevId: string = ''
setInterval(() => {
  console.log('SEND')
  const curId = `t_${Math.random()}`
  client.addNode(new proto.AddNodeRequest().setId(curId), (err, r) => {})
  if (prevId) {
    client.addLink(new proto.AddLinkRequest().setFromNodeId(prevId).setToNodeId(curId), (err, r) => { })
  }
  prevId = curId
}, 2000)
