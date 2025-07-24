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

        // Determine the number of lines that must be drawn
        let nNodeDepths: number = [...new Set(this.graph.nodes.filter(node => node.get_depth() <= this.graph.get_depth()).map(node => node.get_depth()))].length;
        let nUncompressedNodes: number = this.graph.nodes.filter(node => node.get_depth() <= this.graph.get_depth()).filter(node => node.get_state() == State.Uncompressed).length;

        // Calculcate the Spacing of Node's Y coordinate in percentage of available space
        let spacing: number = 0.99 / ((nUncompressedNodes - 1) + (nNodeDepths - 1));
        let verticalspace: number = 1 * spacing;
        let depthspace: number = 2 * spacing;
        
        // Calculate Nodes' Y Positions depending on Previous Node
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

            // Set Y Coordinate
            this.graph.nodes[nodeIndex].set_y(y);
        }
    }

    calculate_edge_x_coordinates () : void {
        
        // Determine Unique Depths
        let nodeDepths: Array<number> = [...new Set(this.graph.nodes.filter(node => node.get_depth() <= this.graph.get_depth()).map(node => node.get_depth()))];
        let edgeDepths: Array<number> = [...new Set(this.graph.edges.filter(edge => edge.get_depth() <= this.graph.get_depth()).map(edge => edge.get_depth()))];
        let depths: Array<number> = nodeDepths.concat(edgeDepths);

        // Determine Unique Compressed and Uncompressed Edges
        let uncompressedEdges: Array<Edge> = this.graph.edges.filter(edge => edge.get_state() == State.Uncompressed && edge.get_depth() <= this.graph.get_depth());
        let fullyCompressedEdges: Array<Edge> = this.graph.edges.filter(edge => edge.get_state() == State["Fully Compressed"] && edge.get_depth() <= this.graph.get_depth());

        // Get Unique Partially Compressed Edges
        let partiallyCompressedEdges: Array<Edge> = this.graph.edges.filter(edge => edge.get_state() == State["Partially Compressed"] && edge.get_depth() <= this.graph.get_depth());
        let partialEdgeNodeTops: Set<number> = new Set();
        for (let edge of partiallyCompressedEdges) {
            let topMostNodeIndex: number = this.get_topmost_node_index(edge)
            partialEdgeNodeTops.add(topMostNodeIndex)
        }

        // Calculate Spacing
        let nUncompressedEdges: number = uncompressedEdges.length
        let nFullyCompressedEdges: number = fullyCompressedEdges.length
        let nPartiallyCompressedEdges: number = [...partialEdgeNodeTops].length
        let spacing: number = 0.99 / ((nUncompressedEdges - 1) + (nFullyCompressedEdges - 1) + (nPartiallyCompressedEdges - 1));
        let horizontalspace: number = 1 * spacing;
        let depthpadding: number = 2 * spacing;

        // Iterate over all Edges and Set x coordinate as function of previous edge's x coodinat
        for (let edgeIndex = 0; edgeIndex < this.graph.edges.length; edgeIndex++) {
            let x = undefined;
            if (edgeIndex == 0) {
                x = 0;
            } else {
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
                if (this.graph.edges[edgeIndex - 1].get_depth() != this.graph.edges[edgeIndex].get_depth()) {
                    x += depthpadding;
                }
            }
            this.graph.edges[edgeIndex].set_x(x);
        }
    }

}