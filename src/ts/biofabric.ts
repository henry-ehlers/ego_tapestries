class BioFabric {

    graph: Graph;
    edgeDepths: Array<DepthIcon> = [];
    nodeDepths: Array<DepthIcon> = [];

    constructor (graph: Graph) {

        // Initialize Biofabric
        this.graph = graph;
        this.populate_node_depths();
        this.populate_edge_depths();


        // Sort Edges
        this.sort_edges_degreescending();

        // Calculcate Y Coordinates
        this.calculate_node_y_coordinates();
        this.calculcate_depth_y_coordinates();

        // Calculcate X Coordiantes
        this.calculate_edge_x_coordinates();

    }

    populate_node_depths () : void {
        let nodeDepths: Array<number> = [...new Set(this.graph.nodes.filter(node => node.get_depth() <= this.graph.get_depth()).map(node => node.get_depth()))];
        for (let depth of nodeDepths) {
            let nNodes: number = this.graph.nodes.filter(node => node.get_depth() == depth).length
            let nodeDepth: DepthIcon = new DepthIcon();
            nodeDepth.set_depth(depth)
            switch (nNodes) {
                case (0):
                    nodeDepth.set_state(State.Empty)
                    break;
                case (1):
                    nodeDepth.set_state(State.Singleton)
                    break;
                default:
                    nodeDepth.set_state(State.Uncompressed)
                    break;
            }

            // Append depth to list of depths
            this.nodeDepths.push(nodeDepth)
        }

    }

    populate_edge_depths () : void {

        // Get ALL possible depths from current graph
        let nodeDepths: Array<number> = [...new Set(this.graph.nodes.filter(node => node.get_depth() <= this.graph.get_depth()).map(node => node.get_depth()))];
        let edgeDepths: Array<number> = [...new Set(this.graph.edges.filter(edge => edge.get_depth() <= this.graph.get_depth()).map(edge => edge.get_depth()))];
        let depths: Array<number> = edgeDepths.concat(nodeDepths);

        // Iterate over depths and create new depths
        for (let depth of depths) {
            let nEdges: number = this.graph.edges.filter(edge => edge.get_depth() == depth).length
            let edgeDepth: DepthIcon = new DepthIcon();
            edgeDepth.set_depth(depth)
            switch (nEdges) {
                case (0):
                    edgeDepth.set_state(State.Empty)
                    break;
                case (1):
                    edgeDepth.set_state(State.Singleton)
                    break;
                default:
                    edgeDepth.set_state(State.Uncompressed)
                    break;
            }

            // Append depth to list of depths
            this.edgeDepths.push(edgeDepth)
        }
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

        // Calculcate the Spacing of Node's Y coordinate in percentage of available space
        let verticalSpace: number = 1;
        let depthSpace: number = 2;
        
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
                        y = this.graph.nodes[nodeIndex - 1].get_y() + verticalSpace;
                    }
                } else {
                    y = this.graph.nodes[nodeIndex - 1].get_y() + depthSpace;
                }
            }

            // Set Y Coordinate
            this.graph.nodes[nodeIndex].set_y(y);
        }

        // Scale X Coordinates to Percentage
        let totalLength: number = Math.max.apply(0, this.graph.nodes.filter(node => node.get_depth() <= this.graph.get_depth()).map(node => node.get_y()));
        for (let node of this.graph.nodes) {
            node.set_y(0.95 * (node.get_y() /totalLength));
        }
    }

    calculcate_depth_y_coordinates () : void {
        for (let nodeDepthCircle of this.nodeDepths) {
            let depth: number = nodeDepthCircle.get_depth()
            let depthNodes = this.graph.nodes.filter(node => node.get_depth() == depth);
            nodeDepthCircle.set_min_y(Math.min.apply(0, depthNodes.map(node => node.get_y())));
            nodeDepthCircle.set_max_y(Math.max.apply(0, depthNodes.map(node => node.get_y())));
            let centerY = (nodeDepthCircle.get_min_y() + nodeDepthCircle.get_max_y()) / 2;
            nodeDepthCircle.set_y(centerY);
        }
    }

    calculate_edge_x_coordinates () : void {

        // Set Spacing Ratios
        let emptyDepthSpace: number = 10;
        let horizontalspace: number = 1;
        let depthspace: number = 3;
        
        // Iterate over all Edges and Set x coordinate as function of previous edge's x coodinate
        for (let edgeIndex = 0; edgeIndex < this.graph.edges.filter(edge => edge.get_depth() <= this.graph.get_depth()).length; edgeIndex++) {
            let x: number = 0;
            if (edgeIndex == 0) {
                x = emptyDepthSpace;
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
                    let depthDifference: number = this.graph.edges[edgeIndex].get_depth() - (this.graph.edges[edgeIndex-1].get_depth())
                    console.log("Depth Difference of " + edgeIndex + ": " + depthDifference);
                    if (depthDifference == 0.5) {
                        x = this.graph.edges[edgeIndex - 1].get_x() + depthspace;
                    } else if (depthDifference > 0.5) {
                        x = this.graph.edges[edgeIndex - 1].get_x() + (emptyDepthSpace * 2);
                    } else {
                        throw new Error ("Edge Sorting is broken!")
                    }
                    
                }
            }
            this.graph.edges[edgeIndex].set_x(x);
        }

        // Scale X Coordinates to Percentage
        let totalLength: number = Math.max.apply(0, this.graph.edges.filter(edge => edge.get_depth() <= this.graph.get_depth()).map(edge => edge.get_x()));
        for (let edge of this.graph.edges) {
            console.log("Edge " + edge.get_id() + " -> " + edge.get_x());
            edge.set_x(0.95 * (edge.get_x() /totalLength));
        }
    }

}