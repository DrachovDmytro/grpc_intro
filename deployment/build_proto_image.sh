PROJECT_ROOT=$(git rev-parse --show-toplevel)

docker build \
  -t protobuf-base:1.0.0 \
  --file "${PROJECT_ROOT}/deployment/Dockerfile.proto" \
  "${PROJECT_ROOT}/proto"

docker build \
  -t server:1.0.0 \
  --file "${PROJECT_ROOT}/deployment/Dockerfile.service" \
  "${PROJECT_ROOT}/server"

docker build \
  -t client:1.0.0 \
  --file "${PROJECT_ROOT}/deployment/Dockerfile.service" \
  "${PROJECT_ROOT}/client"
