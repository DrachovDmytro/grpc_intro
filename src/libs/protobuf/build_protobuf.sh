MY_PATH="`dirname \"$0\"`"
MY_PATH="`( cd \"$MY_PATH\" && pwd )`"
echo "$MY_PATH"
PROTO_DEST="${MY_PATH}/proto_gen"
PROTO_SRC_DIR="${MY_PATH}/"

mkdir -p ${PROTO_DEST}

npx grpc_tools_node_protoc \
    --js_out=import_style=commonjs,binary:${PROTO_DEST} \
    --grpc_out="${PROTO_DEST}" \
    --plugin=protoc-gen-grpc=./node_modules/.bin/grpc_tools_node_protoc_plugin \
    -I ${PROTO_SRC_DIR} \
    ${PROTO_SRC_DIR}/*.proto

npx grpc_tools_node_protoc \
    --plugin=protoc-gen-ts=./node_modules/.bin/protoc-gen-ts \
    --ts_out=${PROTO_DEST} \
    -I ${PROTO_SRC_DIR} \
    ${PROTO_SRC_DIR}/*.proto