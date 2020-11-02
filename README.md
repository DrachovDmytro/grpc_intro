# Protobuf First Steps

# Prerequisites
- Docker
- docker-compose

# Run
```
./deployment/up.sh
```

# Structure
## client
Client code, receives update about graph and update

## server
Server code, handle requests to update graph, send streams to clients about graph updates.

## proto
Sharable proto files

## deployment
Docker files, docker-compose, scripts 