PROJECT_ROOT=$(git rev-parse --show-toplevel)

pushd "$PROJECT_ROOT/deployment"
  ./build_proto_image.sh
  docker-compose down
  docker-compose up -d
  docker-compose ps
  docker-compose up -d --scale client=1
  docker-compose logs -f &
  LOGS_PID=$!
  sleep 5
  docker-compose up -d --scale client=2
  sleep 5
  docker-compose up -d --scale client=3
  sleep 5
  kill $LOGS_PID
popd
