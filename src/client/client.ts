/* eslint-disable */
import grpc from 'grpc'
import { GraphServiceClient } from '../libs/protobuf/proto_gen/graph_grpc_pb'

const SERVER_HOST = process.env.SERVER_HOST || '127.0.0.1'
const SERVER_PORT = process.env.SERVER_PORT || '5679'
new GraphServiceClient(`${SERVER_HOST}:${SERVER_PORT}`, grpc.credentials.createInsecure())
export default () => {
  const SERVER_HOST = process.env.SERVER_HOST || '127.0.0.1'
  const SERVER_PORT = process.env.SERVER_PORT || '5679'

  return new GraphServiceClient(`${SERVER_HOST}:${SERVER_PORT}`, grpc.credentials.createInsecure())
}
