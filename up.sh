npm install
npm run build

node dist/server/index.js &
SERVER_PID=$!

node dist/client/index.js listenUpdates &
LISTEN_CLIENT_PID=$!

function execute () {
  sleep 1; node dist/client/index.js $1 $2 $3
}


execute addNode 1
execute addNode 2
execute addNode 3

execute addNode 4
execute addNode 5
execute addNode 6

execute addNode 7
execute addNode 8
execute addNode 9

execute addLink 1 2
execute addLink 2 3
execute addLink 1 3

execute addLink 4 5
execute addLink 5 6
execute addLink 4 6

execute addLink 7 8
execute addLink 8 9
execute addLink 7 9

execute addLink 3 4
execute addLink 6 7

execute removeNode 2
execute removeNode 5
execute removeNode 8

execute removeNode 3
execute removeNode 6
execute removeNode 9

execute addLink 1 4
execute addLink 4 7
execute addLink 1 7
execute removeLink 7 4

execute removeNode 1
execute removeNode 7
execute removeNode 4

kill $LISTEN_CLIENT_PID
kill $SERVER_PID