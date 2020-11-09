import { Graph, Node, Link } from '..'

describe('yagraph', () => {
  let graph: Graph
  beforeEach(() => {
    graph = new Graph()
  })

  describe('addNode', () => {
    it('should add node', () => {
      graph.addNode(new Node('id_1'))
      expect(graph.serialize()).toEqual({
        nodes: [{ id: 'id_1' }],
        links: []
      })
    })
    it('should throw error if node already exists', () => {
      graph.addNode(new Node('id_1'))
      expect(() => {
        graph.addNode(new Node('id_1'))
      }).toThrow('Node already exists')
    })
    it('should emit event', (done) => {
      graph.on('change', (data) => {
        expect(data).toEqual({ op: 'add', node: { id: 'id_1' } })
        done()
      })
      graph.addNode(new Node('id_1'))
    })
  })

  describe('removeNode', () => {
    it('should remove node', () => {
      graph.addNode(new Node('id_1'))
      graph.removeNode(new Node('id_1'))
      expect(graph.serialize()).toEqual({ nodes: [], links: [] })
    })
    it('should throw error if node does not exist', () => {
      expect(() => {
        graph.removeNode(new Node('id_1'))
      }).toThrow('There is no node id_1')
    })
    it('should emit event', (done) => {
      graph.addNode(new Node('id_1'))
      graph.on('change', (data) => {
        expect(data).toEqual({ op: 'remove', node: { id: 'id_1' } })
        done()
      })
      graph.removeNode(new Node('id_1'))
    })
  })

  describe('addLink', () => {
    it('should add link', () => {
      graph.addNode(new Node('id_1'))
      graph.addNode(new Node('id_2'))
      graph.addLink(new Link('id_1', 'id_2'))

      expect(graph.serialize()).toEqual({
        nodes: [
          { id: 'id_1' },
          { id: 'id_2' }
        ],
        links: [
          { from: 'id_1', to: 'id_2' }
        ]
      })
    })
    it('should throw error if node does not exist', () => {
      graph.addNode(new Node('id_2'))
      expect(() => {
        graph.addLink(new Link('id_1', 'id_2'))
      }).toThrow('There is no node id_1')

      expect(() => {
        graph.addLink(new Link('id_2', 'id_1'))
      }).toThrow('There is no node id_1')
    })
  })

  describe('removeLink', () => {
    it('should remove link', () => {
      graph.addNode(new Node('id_1'))
      graph.addNode(new Node('id_2'))
      graph.addLink(new Link('id_1', 'id_2'))
      graph.removeLink(new Link('id_1', 'id_2'))

      expect(graph.serialize()).toEqual({
        nodes: [
          { id: 'id_1' },
          { id: 'id_2' }
        ],
        links: []
      })
    })

    it('should remove links if node deleted', () => {
      graph.addNode(new Node('id_1'))
      graph.addNode(new Node('id_2'))
      graph.addNode(new Node('id_3'))
      graph.addLink(new Link('id_1', 'id_2'))
      graph.addLink(new Link('id_1', 'id_3'))
      graph.removeNode(new Node('id_1'))

      expect(graph.serialize()).toEqual({
        nodes: [
          { id: 'id_2' },
          { id: 'id_3' }
        ],
        links: []
      })
    })

    it('should throw error if node does not exist', () => {
      graph.addNode(new Node('id_2'))
      expect(() => {
        graph.removeLink(new Link('id_1', 'id_2'))
      }).toThrow('There is no node id_1')

      expect(() => {
        graph.addLink(new Link('id_2', 'id_1'))
      }).toThrow('There is no node id_1')
    })
    // to be continue
  })
})
