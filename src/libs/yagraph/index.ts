import { EventEmitter } from 'events'
const CHANGE_EVENT_NAME = 'change'

export class Node<NPayload = null> {
  constructor (
    public id: string,
    public payload?: NPayload
  ) {}
}

export class Link<LPayload = null> {
  constructor (
    public from: string,
    public to: string,
    public payload?: LPayload
  ) {}
}

export interface SerializedGraph<NPayload, LPayload> {
  nodes: Node<NPayload>[]
  links: Link<LPayload>[]
}

export interface NodeUpdateEvent<NodeData> {
  op: 'add' | 'remove'
  node: Node<NodeData>
}

export interface LinkUpdateEvent<LinkData> {
  op: 'add' | 'remove'
  link: Link<LinkData>
}

export type UpdateEvents<NodeData, LinkData> = NodeUpdateEvent<NodeData> | LinkUpdateEvent<LinkData>

export class Graph<NodePayload = null, LinkPayload = null> extends EventEmitter {
  private nodes: Map<string, Set<string>>
  private payloads: Map<string, NodePayload | LinkPayload | undefined>

  constructor () {
    super()
    this.nodes = new Map()
    this.payloads = new Map()
  }

  private buildLinkId (from: string, to: string): string {
    if (from > to) return `${from}-${to}`
    if (from < to) return `${to}-${from}`
    return `${from}-${to}`
  }

  private addPayload (id: string, payload?: NodePayload | LinkPayload) {
    return this.payloads.set(id, payload)
  }

  private getPayload (id: string): NodePayload | LinkPayload | undefined {
    return this.payloads.get(id)
  }

  private removePayload (id: string) {
    return this.payloads.delete(id)
  }

  public addNode (node: Node<NodePayload>): this {
    const { id, payload } = node
    if (this.nodes.has(id)) throw new Error('Node already exists')

    this.nodes.set(id, new Set())
    this.addPayload(id, payload)
    this.emit(CHANGE_EVENT_NAME, { op: 'add', node })
    return this
  }

  public removeNode (node: Node<NodePayload>): this {
    const { id } = node
    const adjacents = this.nodes.get(id)
    if (adjacents === undefined) {
      throw new Error(`There is no node ${id}`)
    }

    adjacents.forEach((adjacent) => {
      this.removeLink(new Link(id, adjacent))
    })

    this.nodes.delete(id)
    this.removePayload(id)
    this.emit(CHANGE_EVENT_NAME, { op: 'remove', node })
    return this
  }

  public addLink (link: Link<LinkPayload>): this {
    const { from, to, payload } = link
    const fromAdjacents = this.nodes.get(from)

    if (fromAdjacents === undefined) {
      throw new Error(`There is no node ${from}`)
    }

    const toAdjacents = this.nodes.get(to)
    if (toAdjacents === undefined) {
      throw new Error(`There is no node ${to}`)
    }

    fromAdjacents.add(to)
    toAdjacents.add(from)

    this.addPayload(this.buildLinkId(from, to), payload)
    this.emit(CHANGE_EVENT_NAME, { op: 'add', link })
    return this
  }

  public removeLink (link: Link<LinkPayload>): this {
    const { from, to } = link
    const fromAdjacents = this.nodes.get(from)
    if (fromAdjacents === undefined) {
      throw new Error(`There is no node ${from}`)
    }

    const toAdjacents = this.nodes.get(to)
    if (toAdjacents === undefined) {
      throw new Error(`There is no node ${to}`)
    }

    if (!fromAdjacents.has(to)) return this

    fromAdjacents.delete(to)
    toAdjacents.delete(from)

    this.removePayload(this.buildLinkId(from, to))
    this.emit(CHANGE_EVENT_NAME, { op: 'remove', link })
    return this
  }

  serialize (): SerializedGraph<NodePayload, LinkPayload> {
    const result: SerializedGraph<NodePayload, LinkPayload> = { links: [], nodes: [] }
    const links = new Set()
    this.nodes.forEach((adjacent, id) => {
      result.nodes.push({ id, payload: this.getPayload(id) as NodePayload })
      adjacent.forEach((to) => {
        const LinkId = this.buildLinkId(id, to)
        if (links.has(LinkId)) return
        links.add(LinkId)
        result.links.push({ from: id, to, payload: this.getPayload(to) as LinkPayload })
      })
    })
    return result
  }

  deserialize (serializedGraph: SerializedGraph<NodePayload, LinkPayload>) {
    serializedGraph.nodes.forEach(node => {
      this.addNode(new Node(node.id, node.payload))
    })

    serializedGraph.links.forEach(link => {
      this.addLink(new Link(link.from, link.to, link.payload))
    })
  }

  on (event: 'change', cb: (data: UpdateEvents<NodePayload, LinkPayload>) => void): this
  on (event: string, cb: (data: any) => void): this {
    super.on(event, cb)
    return this
  }

  emit (event: 'change', payload: UpdateEvents<NodePayload, LinkPayload>): boolean
  emit (event: string | symbol, payload: any): boolean {
    return super.emit(event, payload)
  }
}
