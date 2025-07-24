class BioFabricRenderer {

    // Constructor
    constructor(biofabric, canvasWidth, canvasHeight) {
        this.biofabric = biofabric;
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;

        // InnerG (x,y)
        this.innerX = 0.5
        this.innerY = 0.2

        // NodeDepthG (x,y)
        this.nodeDepthX = 0.025
        this.nodeDepthY = 0.2
    }

    // Renderer
    render(svg) {

        // G for the Depth Circles of the Nodes
        let nodeDepthG = svg
            .append("g")
            .attr("transform", "translate(" + (this.canvasWidth * this.nodeDepthX) + "," + (this.canvasHeight * this.nodeDepthY) + ")")
        
        
        // G that contains the Graph Drawing
        let innerG = svg
            .append("g")
            .attr("transform", "translate(" + (this.canvasWidth * this.innerX) + "," + (this.canvasHeight * this.innerY) + ")")

        // Iterate over all Nodes in Depth Limit
        for (let nodeIndex in this.biofabric.graph.nodes.filter(node => (node.get_depth() <= this.biofabric.graph.get_depth()))) {

            // Append a Node Line
            innerG
                .append("line")
                .attr("id", "nodeline-" + this.biofabric.graph.nodes[nodeIndex].get_id())
                .attr("class", "nodeline")
                .attr("x1", 0)
                .attr("x2", this.canvasWidth * (0.99 * (1 - this.innerX)))
                .attr("y1", this.biofabric.graph.nodes[nodeIndex].get_y() * (this.canvasHeight * (1 - this.innerY)))
                .attr("y2", this.biofabric.graph.nodes[nodeIndex].get_y() * (this.canvasHeight * (1 - this.innerY)))
                .attr("stroke", "black")
                .attr("stroke-width", 0.25)
                .attr("stroke-linecap", "round")
        }

        // Get Unique Node Depths
        let nodeDepths = [...new Set(this.biofabric.graph.nodes.filter(node => node.get_depth() <= this.biofabric.graph.get_depth()).map(node => node.get_depth()))];

        // Iterate over unique node Depths
        for (let nodeDepth in nodeDepths) {

            // Calculcate Y Position of Depth Circles
            let depthNodes = this.biofabric.graph.nodes.filter(node => node.get_depth() == nodeDepth);
            let depthY = depthNodes.map(node => node.get_y()).reduce((a, b) => a + b, 0)/depthNodes.length
            
            // Append a Node Depth Line
            nodeDepthG
                .append("line")
                .attr("id", "nodeDepthLine-" + nodeDepth.toString().replace(".", "-"))
                .attr("class", "nodeDepthLine")
                .attr("x1", 0)
                .attr("x2", 0)
                .attr("y1", Math.min.apply(0, depthNodes.map(node => node.get_y() * (this.canvasHeight * (1 - this.innerY)))))
                .attr("y2", Math.max.apply(0, depthNodes.map(node => node.get_y() * (this.canvasHeight * (1 - this.innerY)))))
                .attr("stroke", "black")
                .attr("stroke-width", 0.2)
                .attr("stroke-linecap", "round")

            // Append a Node Depth Cirlce
            nodeDepthG
                .append("circle")
                .attr("id", "nodeDepthCircle-" + nodeDepth.toString().replace(".", "-"))
                .attr("class", "nodeDepthCircle")
                .attr("cx", 0)
                .attr("cy", depthY * (this.canvasHeight * (1 - this.innerY)))
                .attr("r", 0.8)
                .attr("fill", "black")
                .attr("stroke", "white")
                .attr("stroke-width", 0.5)
                .on("click", () => {

                    // Iterate over all nodes in the current depth and update their state
                    for (let depthNode of this.biofabric.graph.nodes.filter(node => node.get_depth() == nodeDepth)) {
                        switch (depthNode.get_state()) {
                            case (State["Uncompressed"]):
                                depthNode.set_state(State["Fully Compressed"])
                                break;
                            case (State["Fully Compressed"]):
                                depthNode.set_state(State["Uncompressed"])
                                break;
                        }
                    }

                    // Recalculcate the Y Coordinates of the now (un)compressed states
                    this.biofabric.calculate_node_y_coordinates();

                    // Iterate over nodes and update the node lines
                    for (let node of this.biofabric.graph.nodes.filter(node => node.get_depth() <= this.biofabric.graph.get_depth())) {
                        
                        // Update Node Lines
                        innerG
                            .select("#" + "nodeline-" + node.get_id())
                            .transition()
                            .duration(100)
                            .attr("y1", node.get_y() * (this.canvasHeight * (1 - this.innerY)))
                            .attr("y2", node.get_y() * (this.canvasHeight * (1 - this.innerY)))

                        }

                    // Iterate over depths and update their positions
                    for (let nodeDepth of nodeDepths) {

                        let newDepthNodes = this.biofabric.graph.nodes.filter(node => node.get_depth() == nodeDepth);
                        let newYCoordinate = newDepthNodes.map(node => node.get_y()).reduce((a,b) => a + b, 0)/newDepthNodes.length
                        let minY = Math.min.apply(0, newDepthNodes.map(node => node.get_y()))
                        let maxY = Math.max.apply(0, newDepthNodes.map(node => node.get_y()))

                        nodeDepthG
                            .select("#" + "nodeDepthCircle-" + nodeDepth.toString().replace(".", "-"))
                            .transition()
                            .duration(100)
                            .attr("cy", newYCoordinate * (this.canvasHeight * (1 - this.innerY)))

                        nodeDepthG
                            .select("#nodeDepthLine-" + nodeDepth.toString().replace(".", "-"))
                            .transition()
                            .duration(100)
                            .attr("y1", minY * (this.canvasHeight * (1 - this.innerY)))
                            .attr("y2", maxY * (this.canvasHeight * (1 - this.innerY)))
                        }
                    }
                )
                        

        }

        // // Iterate over all Edges in Depth Limit
        // for (let edgeIndex in this.biofabric.graph.edges.filter(edge => (edge.get_depth() <= this.biofabric.graph.get_depth()))) {

        //     // Get Indicies of Curent Edge's Termini Nodes
        //     let topNodeIndex = this.biofabric.get_topmost_node_index(this.biofabric.graph.edges[edgeIndex]);
        //     let lowNodeIndex = this.biofabric.get_bottommost_node_index(this.biofabric.graph.edges[edgeIndex]);

        //     // Append an Edge Line
        //     innerG
        //         .append("line")
        //         .attr("id", "edgeline-" + this.biofabric.graph.edges[edgeIndex].get_id())
        //         .attr("class", "edgeline")
        //         .attr("y1", this.biofabric.graph.nodes[topNodeIndex].get_y() * (this.canvasHeight * (1 - this.get_y())))
        //         .attr("y2", this.biofabric.graph.nodes[lowNodeIndex].get_y() * (this.canvasHeight * (1 - this.get_y())))
        //         .attr("x1", this.biofabric.graph.edges[edgeIndex].get_x() * (this.canvasWidth * (1 - this.get_x())))
        //         .attr("x2", this.biofabric.graph.edges[edgeIndex].get_x() * (this.canvasWidth * (1 - this.get_x())))
        //         .attr("stroke", "red")
        //         .attr("stroke-width", 0.25)
        //         .attr("stroke-linecap", "round")
        // }
    }

    // Update
    update() {

    }
}
