class BioFabric {

    graph: Graph;

    constructor (graph: Graph) {

        this.graph = graph;
        this.sort_edges_degreescending();
        this.calculate_node_y_coordinates();

    }

    get_edge_length (edge: Edge) : number {
        let source_index = this.graph.nodes.indexOf(edge.get_source())
        let target_index = this.graph.nodes.indexOf(edge.get_target())
        return Math.abs(source_index - target_index)
    }

    get_topmost_node_index (edge: Edge) : number {
        let source_index = this.graph.nodes.indexOf(edge.get_source())
        let target_index = this.graph.nodes.indexOf(edge.get_target())
        return Math.min(source_index, target_index)
    }

    get_bottommost_node_index (edge: Edge) : number {
        let source_index = this.graph.nodes.indexOf(edge.get_source())
        let target_index = this.graph.nodes.indexOf(edge.get_target())
        return Math.max(source_index, target_index)
    }

    sort_edges_degreescending () : void {
        this.graph.edges.sort(
            (edgeA, edgeB) => {
                if (edgeA.get_depth() > edgeB.get_depth()) {
                    return 1
                } else if (edgeA.get_depth() < edgeB.get_depth()) {
                    return -1
                } else {
                    let aIndex: number = this.get_topmost_node_index(edgeA);
                    let bIndex: number = this.get_topmost_node_index(edgeB);
                    if (aIndex < bIndex) {
                        return -1
                    } else if (aIndex > bIndex) {
                        return 1
                    } else {
                        let edgeALength: number = this.get_edge_length(edgeA);
                        let edgeBLength: number = this.get_edge_length(edgeB);
                        if (edgeALength > edgeBLength) {
                            return 1
                        } else if (edgeALength < edgeBLength) {
                            return -1
                        } else {
                            return 0
                        }
                    } 
                }
            }
        )
    }

    calculate_node_y_coordinates() : void {

        // 
        let verticalspace = 5;
        let depthspace = 10;
        
        //
        for (let nodeIndex = 0; nodeIndex < this.graph.nodes.length; nodeIndex++) {
            let y = undefined;
            if (nodeIndex == 0) {
                y = 0
            } else {
                if (this.graph.nodes[nodeIndex].state != State.Uncompressed) {
                    y = this.graph.nodes[nodeIndex - 1].y;
                } else {
                    y = this.graph.nodes[nodeIndex - 1].y + verticalspace;
                }
                if (this.graph.nodes[nodeIndex - 1].depth != this.graph.nodes[nodeIndex].depth) {
                    y += depthspace;
                }
            }

            //
            this.graph.nodes[nodeIndex].set_y(y);
        }
    }
}