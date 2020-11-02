import { EventEmitter } from 'events'
import createGraph, { Graph, Node, Link } from 'ngraph.graph'

interface SerializedGraph<NodeData = {}, LinkData = {}> {
  nodes: Pick<Node<NodeData>, 'id' | 'data'>[]
  links: Pick<Link<LinkData>, 'fromId' | 'toId' | 'data'>[]
}

interface NodeUpdateEvent<NodeData> {
  op: 'add' | 'remove'
  node: Node<NodeData>
}

interface LinkUpdateEvent<LinkData> {
  op: 'add' | 'remove'
  link: Link<LinkData>
}

export type UpdateEvents<NodeData, LinkData> = NodeUpdateEvent<NodeData> | LinkUpdateEvent<LinkData>

class GraphContainer<NodeData = {}, LinkData = {}> extends EventEmitter {
  private graph: Graph<NodeData, LinkData>
  constructor() {
    super()
    this.graph = createGraph<NodeData, LinkData>()
  }

  addNode(id: string): Node<NodeData> {
    const node = this.graph.addNode(id)
    this.emit('change', { op: 'add', node })
    return node
  }

  removeNode(id: string): Node<NodeData> {
    const node = this.graph.getNode(id)
    if (!node) throw new Error('Not found')
    this.graph.removeNode(id)
    this.emit('change', { op: 'remove', node })
    return node
  }

  addLink(fromNodeId: string, toNodeId: string): Link<LinkData> {
    const link = this.graph.addLink(fromNodeId, toNodeId)
    this.emit('change', { op: 'add', link })
    return link
  }

  removeLink(fromNodeId: string, toNodeId: string) {
    const link = this.graph.getLink(fromNodeId, toNodeId)
    if (!link) throw new Error('Not found')
    this.graph.removeLink(link)
    this.emit('change', { op: 'remove', link })
    return link
  }

  serialize(): SerializedGraph {
    const serilizedGraph: SerializedGraph = { nodes: [], links: [] }

    this.graph.forEachNode(({ id, data }) => {
      serilizedGraph.nodes.push({ id, data })
    })

    this.graph.forEachLink(({ fromId, toId, data }) => {
      serilizedGraph.links.push({ data, fromId, toId })
    })

    return serilizedGraph
  }

  on(event: 'change', cb: (data: UpdateEvents<NodeData, LinkData>) => void): this
  on(event: string, cb: (data: any) => void): this {
    super.on(event, cb)
    return this
  }
}

export default GraphContainer