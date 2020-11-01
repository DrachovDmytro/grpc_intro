import grpc from 'grpc'
import proto_grpc from 'proto/proto_gen/graph_grpc_pb'
import proto from 'proto/proto_gen/graph_pb'
import up from './server'

up()

const client = new proto_grpc.TestServiceClient('127.0.0.1:5678', grpc.credentials.createInsecure())
const r = new proto.GetRequest()
r.setName('test_name')
// client.unary(r, (err, res) => {
//   console.log(err, res.getData(), res.getJsPbMessageId())
// })

const sBi = client.streamBi()
sBi.write(r)
sBi.on('data', (chunk: proto.TestResponse) => {
  console.log('client', chunk.getData())
})
