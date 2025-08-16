class Linear {

    graph: Graph;
    edgeDepths: Array<DepthIcon> = [];
    nodeDepths: Array<DepthIcon> = [];

    constructor (graph: Graph) {

        // Initialize Biofabric
        this.graph = graph;
        this.populate_node_depths();

        // Sort Edges, Depths
        this.sort_node_depth_icons();

        // Calculcate Y Coordinates
        this.calculate_node_x_coordinates();

        // Calculcate X Coordiantes
        this.calculate_edge_y_coordinates();
        //this.calculcate_depth_y_coordinates();

    }

    populate_node_depths () : void {
        this.nodeDepths = [];
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

        //
        this.edgeDepths = [];

        // Get ALL possible depths from current graph
        let nodeDepths: Set<number> = new Set(this.graph.nodes.filter(node => node.get_depth() <= this.graph.get_depth()).map(node => node.get_depth()));
        let edgeDepths: Set<number> = new Set(this.graph.edges.filter(edge => edge.get_depth() <= this.graph.get_depth()).map(edge => edge.get_depth()));
        let depths: Array<number> = [...new Set([...nodeDepths, ...edgeDepths])];
        console.log(depths)

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

    sort_edge_depth_icons () : void {
        this.edgeDepths.sort(
            (depthA, depthB) =>
                {
                    if (depthA.get_depth() > depthB.get_depth()) {
                        return 1
                    } else if (depthA.get_depth() < depthB.get_depth()) {
                        return -1    
                    } else {
                        return 0
                    }
                }
            )
    }

    sort_node_depth_icons () : void {
        this.nodeDepths.sort(
            (depthA, depthB) =>
                {
                    if (depthA.get_depth() > depthB.get_depth()) {
                        return 1
                    } else if (depthA.get_depth() < depthB.get_depth()) {
                        return -1    
                    } else {
                        return 0
                    }
                }
            )
    }

    calculate_node_x_coordinates() : void {

         // Calculcate the Spacing of Node's Y coordinate in percentage of available space
        let horizontalSpace: number = 1;
        let depthSpace: number = 2;
        
        // Calculate Nodes' Y Positions depending on Previous Node
        for (let nodeIndex = 0; nodeIndex < this.graph.nodes.filter(node => node.get_depth() <= this.graph.get_depth()).length; nodeIndex++) {
            let x: number = Infinity;
            if (nodeIndex == 0) {
                x = 0
            } else {
                if (this.graph.nodes[nodeIndex - 1].get_depth() == this.graph.nodes[nodeIndex].get_depth()) {
                    if (this.graph.nodes[nodeIndex].get_state() == State["Fully Compressed"]) {
                        x = this.graph.nodes[nodeIndex - 1].get_x();
                    } else {
                        x = this.graph.nodes[nodeIndex - 1].get_x() + horizontalSpace;
                    }
                } else {
                    x = this.graph.nodes[nodeIndex - 1].get_x() + depthSpace;
                }
            }

            // Set Y Coordinate
            this.graph.nodes[nodeIndex].set_x(x);
        }

        // Scale X Coordinates to Percentage
        let totalLength: number = Math.max.apply(0, this.graph.nodes.filter(node => node.get_depth() <= this.graph.get_depth()).map(node => node.get_x()));
        for (let node of this.graph.nodes) {
            node.set_x(0.95 * (node.get_x() /totalLength));
        }
    }

    calculate_edge_y_coordinates () : void {
        // TODO: just take node coordinates for base of semi-circle
    }

    calculcate_depth_y_coordinates () : void {
        for (let nodeDepthCircle of this.nodeDepths) {
            let depth: number = nodeDepthCircle.get_depth()
            let depthNodes = this.graph.nodes.filter(node => node.get_depth() == depth);
            nodeDepthCircle.set_min_y(Math.min.apply(0, depthNodes.map(node => node.get_y())));
            nodeDepthCircle.set_max_y(Math.max.apply(0, depthNodes.map(node => node.get_y())));
            nodeDepthCircle.set_y((nodeDepthCircle.get_min_y() + nodeDepthCircle.get_max_y()) / 2);
        }
    }
}