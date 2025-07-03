class Edges {

    constructor (edges = []) {
        this.edges = edges;
    }

    add_edge (edge) {
        this.edges.push(edge)
    }

    has_edge (sourceID, targetID) {
        return this.edges.find(e => e.has_id(sourceID) && e.has_id(targetID))
    }

    get_edges_with_id (id) {
        return this.edges.filter(e => e.has_id(id))
    }

}