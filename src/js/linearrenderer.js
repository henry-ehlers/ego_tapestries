class LinearRenderer {

    // Constructor
    constructor(linear, canvasWidth, canvasHeight) {

        //
        this.LINEAR = linear;
        this.CANVASWIDTH = canvasWidth;
        this.CANVASHEIGHT = canvasHeight;

        // InnerG (x,y)
        this.INNERX = 0.05
        this.INNERY = 0.5

        // NodeDepthG (x,y)
        this.nodeDepthX = 0.025
        this.nodeDepthY = 0.2

        // Node G (x,y)
        this.nodeGX = 0.05
        this.nodeGY = 0.2

        // EdgeDepthG (x,y)
        this.edgeDepthX = 0.2
        this.edgeDepthY = 0.05
    }

    // Renderer
    render(svg) {

         // G that contains the Graph Drawing
        let innerG = svg.append("g")
            .attr("transform", "translate(" + (this.CANVASWIDTH * this.INNERX) + "," + (this.CANVASHEIGHT * this.INNERY) + ")")
        

        // Draw Edge Arcs
        for (let edge of this.LINEAR.graph.edges.filter(edge => edge.get_depth() <= this.LINEAR.graph.get_depth())) {

            console.log("edge", edge)

            let sourceX = edge.endpoints[0].get_x() * (this.CANVASWIDTH * (1 - this.INNERX))
            let targetX = edge.endpoints[1].get_x() * (this.CANVASWIDTH * (1 - this.INNERX))
            let radiusX = Math.abs(targetX - sourceX) / 2
            let offsetX = Math.min(sourceX, targetX)

            let arc = (edge.get_depth() % 1) == 0.5 ? this.arc_generator(radiusX, radiusX, false) : this.arc_generator(radiusX, radiusX, true)

            innerG.append("path")
                .attr("d", arc) 
                .attr("transform", "translate(" + (offsetX + radiusX) + "," + 0 + ")")
                .attr("stroke-width", 0.25)
                .attr("stroke", ((edge.get_depth() % 1) == 0.5) ? "#333" : d3.schemeObservable10[edge.get_depth()])

        }

        // Draw Node Circles
        for (let node of this.LINEAR.graph.nodes.filter(node => (node.get_depth() <= this.LINEAR.graph.get_depth()))) {
            
            innerG.append("circle")
                .attr("cx", node.get_x() * (this.CANVASWIDTH * (1 - this.INNERX)))
                .attr("cy", 0)
                .attr("r", 0.5)
                .attr("fill", d3.schemeObservable10[node.get_depth()])
                .attr("stroke", "white")
                .attr("stroke-width", 0.25)
        }
    }

    arc_generator(outerRadius, innerRadius, top = true) {
        let arcGenerator = undefined;
        if (top) {
            arcGenerator = d3.arc()
                .outerRadius(outerRadius)
                .innerRadius(innerRadius)
                .startAngle(-Math.PI / 2)
                .endAngle(Math.PI / 2);
        } else {
            arcGenerator = d3.arc()
                .outerRadius(outerRadius)
                .innerRadius(innerRadius)
                .startAngle(3 * Math.PI / 2)
                .endAngle(Math.PI/2);
        }
        return arcGenerator
    }
}