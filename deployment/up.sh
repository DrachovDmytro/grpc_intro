PROJECT_ROOT=$(git rev-parse --show-toplevel)

pushd "$PROJECT_ROOT/deployment"
  ./build_proto_image.sh
  docker-compose up -d
  docker-compose images
  docker-compose ps
popd
