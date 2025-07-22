class BioFabric {

    readonly graph: Graph;

    constructor (graph: Graph) {
        this.graph = graph;
    }

    // Get the Index of Node on the bottom of an Edge in the Drawing
    get_bottom_node_index (edge: Edge): number {
        let source_index = this.graph.nodes.indexOf(this.graph.get_node_from_id(edge.get_source()))
        let target_index = this.graph.nodes.indexOf(this.graph.get_node_from_id(edge.get_target()))
        return Math.max(source_index, target_index)
    }

    // Get the Index of Node on the top of an Edge in the Drawing
    get_top_node_index (edge: Edge): number {
        let source_index = this.graph.nodes.indexOf(this.graph.get_node_from_id(edge.get_source()))
        let target_index = this.graph.nodes.indexOf(this.graph.get_node_from_id(edge.get_target()))
        return Math.min(source_index, target_index)
    }

    // Get the Length of an Edge in the Drawing
    get_edge_length (edge: Edge): number {
        let source_index = this.graph.nodes.indexOf(this.graph.get_node_from_id(edge.get_source()))
        let target_index = this.graph.nodes.indexOf(this.graph.get_node_from_id(edge.get_target()))
        return Math.abs(source_index - target_index)
    }

}