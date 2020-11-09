import getClient from './client'
import { AddNodeRequest, AddLinkRequest, RemoveLinkRequest, RemoveNodeRequest } from '../libs/protobuf/proto_gen/graph_pb'

type Params =
  { op: 'addNode', args: { id: string } } |
  { op: 'removeNode', args: { id: string } } |
  { op: 'addLink', args: { from: string, to: string } } |
  { op: 'removeLink', args: { from: string, to: string } }

export default async (params: Params) => {
  const client = getClient()
  return new Promise((resolve, reject) => {
    if (params.op === 'addNode') {
      const anRequest = new AddNodeRequest()
      anRequest.setId(params.args.id)
      client.addNode(anRequest, (err, response) => {
        if (err) return reject(err)
        resolve(response)
      })
    } else if (params.op === 'removeNode') {
      const rnRequest = new RemoveNodeRequest()
      rnRequest.setId(params.args.id)
      client.removeNode(rnRequest, (err, response) => {
        if (err) return reject(err)
        resolve(response)
      })
    } else if (params.op === 'addLink') {
      const alRequest = new AddLinkRequest()
      alRequest.setFromNodeId(params.args.from)
      alRequest.setToNodeId(params.args.to)
      client.addLink(alRequest, (err, response) => {
        if (err) return reject(err)
        resolve(response)
      })
    } else if (params.op === 'removeLink') {
      const rlRequest = new RemoveLinkRequest()
      rlRequest.setFromNodeId(params.args.from)
      rlRequest.setToNodeId(params.args.to)
      client.removeLink(rlRequest, (err, response) => {
        if (err) return reject(err)
        resolve(response)
      })
    }
  })
}
