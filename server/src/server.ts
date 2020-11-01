import grpc from 'grpc'
import proto_grpc from 'proto/proto_gen/graph_grpc_pb'
import proto from 'proto/proto_gen/graph_pb'

export default () => {
  const server = new grpc.Server()
  const response = new proto.TestResponse()
  response.setData('testData')
  server.addService<proto_grpc.ITestServiceServer>(proto_grpc.TestServiceService, {
    unary: (call, cb) => {
      const name = call.request.getName()
      console.log('server:streamBi', call)
      cb(null, response)
    },
    streamBi: (call) => {
      call.on('data', (chunk: proto.GetRequest) => {
        console.log('server:streamBi', chunk)
      })
    },
    streamClient: (call, cb) => {
      call.on('error', (err) => {
        console.log(err)
      })
      call.on('data', (chunk) => {
        console.log(chunk)
      })
    },
    streamServer: (call) => {
      call.write(response)
    }
  })
  server.bind('127.0.0.1:5678', grpc.ServerCredentials.createInsecure())
  server.start()
}
