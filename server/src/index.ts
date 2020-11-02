import grpc from 'grpc'
import proto_grpc from './proto_gen/graph_grpc_pb'
import proto from './proto_gen/graph_pb'
import GraphModel, { UpdateEvents } from './graph'
import yallist from 'yallist';
import { Empty } from 'google-protobuf/google/protobuf/empty_pb';

const SERVER_HOST = process.env.SERVER_HOST || '0.0.0.0'
const SERVER_PORT = process.env.SERVER_PORT || '5679'

const graph = new GraphModel()
const server = new grpc.Server()
const connections = new yallist<grpc.ServerWritableStream<Empty>>()

server.addService<proto_grpc.IGraphServiceServer>(proto_grpc.GraphServiceService, {
  addLink: (call, cb) => {
    graph.addLink(call.request.getFromNodeId(), call.request.getToNodeId())
    cb(null, new Empty)
  },
  removeLink: (call, cb) => {
    graph.removeLink(call.request.getFromNodeId(), call.request.getToNodeId())
    cb(null, new Empty)
  },
  addNode: (call, cb) => {
    graph.addNode(call.request.getId())
    cb(null, new Empty)
  },
  removeNode: (call, cb) => {
    graph.removeNode(call.request.getId())
    cb(null, new Empty)
  },
  getGraphOpLog: (call) => {
    const connectionItem = new yallist.Node(call)
    connections.pushNode(connectionItem)
    call.once('close', () => connections.removeNode(connectionItem))
    const op = new proto.GraphOpLog()
    const g = transformGraphToProtoGraph()
    op.setOp(proto.Op.ADD)
    op.setGraph(g)
    call.write(op)
  }
})

const OP_MAP: { [key in UpdateEvents<any, any>['op']]: proto.Op} = {
  add: proto.Op.ADD,
  remove: proto.Op.REMOVE
}

graph.on('change', (update) => {
  connections.forEach((connection) => {
    if (!connection.writable) return
    const graphOpLog = new proto.GraphOpLog()
    graphOpLog.setOp(OP_MAP[update.op])
    if('link' in update) {
      const link = new proto.Link()
      link.setFromNodeId(update.link.fromId as string)
      link.setToNodeId(update.link.toId as string)
      graphOpLog.setLink(link)
    } else {
      const node = new proto.Node()
      node.setId(update.node.id as string)
      graphOpLog.setNode(node)
    }
    connection.write(graphOpLog)
  })
})
server.bind(`${SERVER_HOST}:${SERVER_PORT}`, grpc.ServerCredentials.createInsecure())
server.start()

function transformGraphToProtoGraph() {
  const g = new proto.Graph()
  const gO = graph.serialize()
  const links = gO.links.map((l) => {
    const link = new proto.Link()
    link.setFromNodeId(l.fromId as string)
    link.setToNodeId(l.toId as string)
    return link
  })
  const nodes = gO.nodes.map((n) => {
    const node = new proto.Node()
    node.setId(n.id as string)
    return node
  })
  g.setLinksList(links)
  g.setNodesList(nodes)
  return g
}