class BioFabricRenderer {

    // Constructor
    constructor(biofabric, width, height) {
        this.biofabric = biofabric;
        this.width = width;
        this.height = height;
    }

    // Redner
    render(svg) {

        let innerG = svg
            .append("g")
            .attr("transform", "translate(" + (this.width * 0.5) + "," + (this.height * 0.2) + ")")
        console.log(this.biofabric.graph.nodes)

        for (let nodeIndex in this.biofabric.graph.nodes) {
            console.log(nodeIndex)

            // 
            innerG
                .append("line")
                .attr("id", "nodeline-" + this.biofabric.graph.nodes[nodeIndex].get_id())
                .attr("class", "nodeline")
                .attr("x1", 0)
                .attr("x2", this.width * 0.5)
                .attr("y1", this.biofabric.graph.nodes[nodeIndex].get_y())
                .attr("y2", this.biofabric.graph.nodes[nodeIndex].get_y())
                .attr("stroke", "black")
                .attr("stroke-width", 0.5)
                .attr("stroke-linecap", "round")
        }
    }

    // Update
    update() {

    }
}
