class Edge {

    constructor (id, source, target, weight = null, depth = undefined, collapsed = undefined, y = null) {
        this.endpoints = new Set([source, target]);
        this.weight    = weight;
        this.id        = id;
        this.depth     = depth;
        this.collapsed = collapsed;
        this.y         = y
    }

    get_topmost_index (nodes) {
        console.log(nodes)
        let source_index = nodes.indexOf(nodes.get_node_from_id(this.get_source()))
        let target_index = nodes.indexOf(nodes.get_node_from_id(this.get_target()))
        return Math.min(source_index, target_index)
    }

    get_length (nodes) {
        let source_index = nodes.nodes.indexOf(nodes.get_node_from_id(this.get_source()))
        let target_index = nodes.nodes.indexOf(nodes.get_node_from_id(this.get_target()))
        return Math.abs(source_index - target_index)
    }

    has_id (id) {
        return this.endpoints.has(id)
    }

    get_source () {
        return [...this.endpoints][0]
    }

    get_target () {
        return [...this.endpoints][1]
    }

    get_weight () {
        return this.weight
    }

    get_id () {
        return this.id
    }

}