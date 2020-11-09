import grpc from 'grpc'
import { GraphServiceService, IGraphServiceServer } from '../libs/protobuf/proto_gen/graph_grpc_pb'
import { Graph, GraphOpLog, Link, Node, Op } from '../libs/protobuf/proto_gen/graph_pb'
import * as yagraph from '../libs/yagraph'

import Yallist from 'yallist'
import { Empty } from 'google-protobuf/google/protobuf/empty_pb'

const SERVER_HOST = process.env.SERVER_HOST || '0.0.0.0'
const SERVER_PORT = process.env.SERVER_PORT || '5679'

const graph = new yagraph.Graph<null, null>()
const server = new grpc.Server()
const connections = new Yallist<grpc.ServerWritableStream<Empty>>()

server.addService<IGraphServiceServer>(GraphServiceService, {
  addLink: (call, cb) => {
    graph.addLink(new yagraph.Link(call.request.getFromNodeId(), call.request.getToNodeId()))
    cb(null, new Empty())
  },
  removeLink: (call, cb) => {
    graph.removeLink(new yagraph.Link(call.request.getFromNodeId(), call.request.getToNodeId()))
    cb(null, new Empty())
  },
  addNode: (call, cb) => {
    graph.addNode(new yagraph.Node(call.request.getId()))
    cb(null, new Empty())
  },
  removeNode: (call, cb) => {
    graph.removeNode(new yagraph.Node(call.request.getId()))
    cb(null, new Empty())
  },
  getGraphOpLog: (call) => {
    const connectionItem = new Yallist.Node(call)
    connections.pushNode(connectionItem)
    call.once('close', () => connections.removeNode(connectionItem))
    const op = new GraphOpLog()
    const g = transformGraphToProtoGraph()
    op.setOp(Op.ADD)
    op.setGraph(g)
    call.write(op)
  }
})

const OP_MAP: { [key in yagraph.UpdateEvents<any, any>['op']]: Op} = {
  add: Op.ADD,
  remove: Op.REMOVE
}

graph.on('change', (update) => {
  connections.forEach((connection) => {
    if (!connection.writable) return
    const graphOpLog = new GraphOpLog()
    graphOpLog.setOp(OP_MAP[update.op])
    if ('link' in update) {
      const link = new Link()
      link.setFromNodeId(update.link.from as string)
      link.setToNodeId(update.link.to as string)
      graphOpLog.setLink(link)
    } else {
      const node = new Node()
      node.setId(update.node.id as string)
      graphOpLog.setNode(node)
    }
    connection.write(graphOpLog)
  })
})

server.bind(`${SERVER_HOST}:${SERVER_PORT}`, grpc.ServerCredentials.createInsecure())
server.start()
console.log(`Server started ${SERVER_HOST}:${SERVER_PORT}`)

function transformGraphToProtoGraph () {
  const g = new Graph()
  const gO = graph.serialize()
  const links = gO.links.map((l) => {
    const link = new Link()
    link.setFromNodeId(l.from as string)
    link.setToNodeId(l.to as string)
    return link
  })
  const nodes = gO.nodes.map((n) => {
    const node = new Node()
    node.setId(n.id as string)
    return node
  })
  g.setLinksList(links)
  g.setNodesList(nodes)
  return g
}
