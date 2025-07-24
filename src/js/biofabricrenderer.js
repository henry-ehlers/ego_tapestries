class BioFabricRenderer {

    // Constructor
    constructor(biofabric, canvasWidth, canvasHeight) {
        this.biofabric = biofabric;
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.x = 0.5
        this.y = 0.2
    }

    // Renderer
    render(svg) {

        let innerG = svg
            .append("g")
            .attr("transform", "translate(" + (this.canvasWidth * this.x) + "," + (this.canvasHeight * this.y) + ")")

        // Iterate over all Nodes in Depth Limit
        for (let nodeIndex in this.biofabric.graph.nodes.filter(node => (node.get_depth() <= this.biofabric.graph.get_depth()))) {

            // 
            innerG
                .append("line")
                .attr("id", "nodeline-" + this.biofabric.graph.nodes[nodeIndex].get_id())
                .attr("class", "nodeline")
                .attr("x1", 0)
                .attr("x2", this.canvasWidth * (1 - this.x))
                .attr("y1", this.biofabric.graph.nodes[nodeIndex].get_y() * (this.canvasHeight * (1 - this.y)))
                .attr("y2", this.biofabric.graph.nodes[nodeIndex].get_y() * (this.canvasHeight * (1 - this.y)))
                .attr("stroke", "black")
                .attr("stroke-width", 0.25)
                .attr("stroke-linecap", "round")
        }

        // Iterate over all Edges in Depth Limit
        for (let edgeIndex in this.biofabric.graph.edges.filter(edge => (edge.get_depth() <= this.biofabric.graph.get_depth()))) {

            let topNodeIndex = this.biofabric.get_topmost_node_index(this.biofabric.graph.edges[edgeIndex]);
            let lowNodeIndex = this.biofabric.get_bottommost_node_index(this.biofabric.graph.edges[edgeIndex]);

            // 
            innerG
                .append("line")
                .attr("id", "edgeline-" + this.biofabric.graph.edges[edgeIndex].get_id())
                .attr("class", "edgeline")
                .attr("y1", this.biofabric.graph.nodes[topNodeIndex].get_y() * (this.canvasHeight * (1 - this.y)))
                .attr("y2", this.biofabric.graph.nodes[lowNodeIndex].get_y() * (this.canvasHeight * (1 - this.y)))
                .attr("x1", this.biofabric.graph.edges[edgeIndex].get_x() * (this.canvasWidth * (1 - this.x)))
                .attr("x2", this.biofabric.graph.edges[edgeIndex].get_x() * (this.canvasWidth * (1 - this.x)))
                .attr("stroke", "red")
                .attr("stroke-width", 0.25)
                .attr("stroke-linecap", "round")
        }
    }

    // Update
    update() {

    }
}
