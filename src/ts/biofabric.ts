class BioFabric {

    graph: Graph;

    constructor (graph: Graph) {

        //
        this.graph = graph;

        //
        this.sort_edges_degreescending();
        
        //
        this.calculate_node_y_coordinates();
        this.calculate_edge_x_coordinates();

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

        // Determine the Depths Nodes in the Drawing
        let nodeDepths: Array<number> = [...new Set(this.graph.nodes.filter(node => node.get_depth() <= this.graph.get_depth()).map(node => node.get_depth()))];
        let uncompressedNodes: Array<Vertex> = this.graph.nodes.filter(node => node.get_depth() <= this.graph.get_depth()).filter(node => node.get_state() == State.Uncompressed );

        // Calculcate the Spacing of Node's Y coordinate in percentage of available space
        let verticalSpacingRatio: number = 1;
        let depthSpaceRatio: number = 2;
        let spacing: number = 0.95 / ( (verticalSpacingRatio * (uncompressedNodes.length)) + (depthSpaceRatio * (nodeDepths.length ) - 1) );
        let verticalspace: number = verticalSpacingRatio * spacing;
        let depthspace: number = depthSpaceRatio * spacing;
        
        // Calculate Nodes' Y Positions depending on Previous Node
        for (let nodeIndex = 0; nodeIndex < this.graph.nodes.filter(node => node.get_depth() <= this.graph.get_depth()).length; nodeIndex++) {
            let y: number = Infinity;
            if (nodeIndex == 0) {
                y = 0
            } else {
                if (this.graph.nodes[nodeIndex - 1].get_depth() == this.graph.nodes[nodeIndex].get_depth()) {
                    if (this.graph.nodes[nodeIndex].get_state() == State["Fully Compressed"]) {
                        y = this.graph.nodes[nodeIndex - 1].get_y();
                    } else {
                        y = this.graph.nodes[nodeIndex - 1].get_y() + verticalspace;
                    }
                } else {
                    y = this.graph.nodes[nodeIndex - 1].get_y() + depthspace;
                }
            }

            // Set Y Coordinate
            this.graph.nodes[nodeIndex].set_y(y);
        }
    }

    calculate_edge_x_coordinates () : void {

        // Get Depths
        // TOTO: for now only account for EDGE DEPTHS THAT ARE PRESENT -> future should also space for missing edge depths
        let edgeDepths: Array<number> = [...new Set(this.graph.edges.filter(edge => edge.get_depth() <= this.graph.get_depth()).map(edge => edge.get_depth()))];
        // let nodeDepths: Array<number> = [...new Set(this.graph.nodes.filter(node => node.get_depth() <= this.graph.get_depth()).map(node => node.get_depth()))];
        // let depths: Array<number> = edgeDepths.concat(nodeDepths);

        // Determine Unique Compressed and Uncompressed Edges
        let singletonEdges: Array<Edge> = this.graph.edges.filter(edge => edge.get_state() == State.Singleton && edge.get_depth() <= this.graph.get_depth());
        let uncompressedEdges: Array<Edge> = this.graph.edges.filter(edge => edge.get_state() == State.Uncompressed && edge.get_depth() <= this.graph.get_depth());
        
        // Get Unique fully compressed edges
        let fullyCompressedEdges: Array<Edge> = this.graph.edges.filter(edge => edge.get_state() == State["Fully Compressed"] && edge.get_depth() <= this.graph.get_depth());
        let fulllyCompressedEdgeDepths: Set<number> = new Set(fullyCompressedEdges.map(edge => edge.get_depth()));

        // Get Unique Partially Compressed Edges' Origin Nodes
        let partiallyCompressedEdges: Array<Edge> = this.graph.edges.filter(edge => edge.get_state() == State["Partially Compressed"] && edge.get_depth() <= this.graph.get_depth());
        let partialEdgeNodeTops: Set<number> = new Set();
        for (let edge of partiallyCompressedEdges) {
            let topMostNodeIndex: number = this.get_topmost_node_index(edge)
            partialEdgeNodeTops.add(topMostNodeIndex)
        }

        // Prints
        console.log("Singleton Edges: " + singletonEdges.length);
        console.log("Uncompressed Edges: " + uncompressedEdges.length);
        console.log("Partially Compressed Edges: " + partialEdgeNodeTops.size)
        console.log("Fully Compressed Edges: " + fulllyCompressedEdgeDepths.size)

        // Calculate Spacing
        let horizontalSpacingRatio: number = 1;
        let depthSpaceRatio: number = 3;
        if (horizontalSpacingRatio > depthSpaceRatio) {
            throw new Error("Horizontal Spacing May Not Exceed Depth Spacing!");
        }
        let spacingUnit: number = 0.95 / (horizontalSpacingRatio*(singletonEdges.length + uncompressedEdges.length + partialEdgeNodeTops.size + fulllyCompressedEdgeDepths.size - edgeDepths.length - (depthSpaceRatio - horizontalSpacingRatio)) + depthSpaceRatio*edgeDepths.length - 1);
        let horizontalspace: number = horizontalSpacingRatio * spacingUnit;
        let depthspace: number = depthSpaceRatio * spacingUnit;

        // Iterate over all Edges and Set x coordinate as function of previous edge's x coodinat
        for (let edgeIndex = 0; edgeIndex < this.graph.edges.filter(edge => edge.get_depth() <= this.graph.get_depth()).length; edgeIndex++) {
            let x: number = Infinity;
            if (edgeIndex == 0) {
                x = 0;
            } else {
                if (this.graph.edges[edgeIndex - 1].get_depth() == this.graph.edges[edgeIndex].get_depth()) {
                    if (this.graph.edges[edgeIndex].get_state() == State["Fully Compressed"]) {
                        x = this.graph.edges[edgeIndex - 1].get_x();
                    } else if (this.graph.edges[edgeIndex].get_state() == State.Uncompressed) {
                        x = this.graph.edges[edgeIndex - 1].get_x() + horizontalspace;
                    } else {
                        if (this.graph.edges[edgeIndex].get_depth() != this.graph.edges[edgeIndex - 1].get_depth()) {
                            x = this.graph.edges[edgeIndex - 1].get_x() + horizontalspace;
                        } else {
                            let currtopMostNode = this.get_topmost_node_index(this.graph.edges[edgeIndex]);
                            let prevtopMostNode = this.get_topmost_node_index(this.graph.edges[edgeIndex - 1]);
                            if (currtopMostNode == prevtopMostNode) {
                                x = this.graph.edges[edgeIndex - 1].get_x();
                            } else {
                                x = this.graph.edges[edgeIndex - 1].get_x() + horizontalspace;
                            }
                        }
                    }
                } else {
                    x = this.graph.edges[edgeIndex - 1].get_x() + depthspace;
                }
            }
            console.log(x);
            this.graph.edges[edgeIndex].set_x(x);
        }
    }

}