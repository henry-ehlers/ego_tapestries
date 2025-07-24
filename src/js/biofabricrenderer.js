class BioFabricRenderer {

    // Constructor
    constructor(biofabric, canvasWidth, canvasHeight) {
        this.biofabric = biofabric;
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;

        // InnerG (x,y)
        this.innerX = 0.2
        this.innerY = 0.2

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

        // G for the Depth Circles of the Nodes
        let nodeDepthG = svg.append("g")
            .attr("transform", "translate(" + (this.canvasWidth * this.nodeDepthX) + "," + (this.canvasHeight * this.nodeDepthY) + ")")
        
        let edgeDepthG = svg
            .append("g")
            .attr("transform", "translate(" + (this.canvasWidth * this.edgeDepthX) + "," + (this.canvasHeight * this.edgeDepthY) + ")")
        
        // G that contains the Graph Drawing
        let innerG = svg.append("g")
            .attr("transform", "translate(" + (this.canvasWidth * this.innerX) + "," + (this.canvasHeight * this.innerY) + ")")
        
        // G that contains the Node Information
        let nodeG = svg.append("g")
            .attr("transform", "translate(" + (this.canvasWidth * this.nodeGX) + "," + (this.canvasHeight * this.nodeGY) + ")")

        // Iterate over all Nodes in Depth Limit
        for (let node of this.biofabric.graph.nodes.filter(node => (node.get_depth() <= this.biofabric.graph.get_depth()))) {

            // Append a Node Line
            innerG.append("line")
                .attr("id", "nodeLine-" + node.get_id())
                .attr("class", "nodeline")
                .attr("x1", 0)
                .attr("x2", this.canvasWidth * (0.95 * (1 - this.innerX)))
                .attr("y1", node.get_y() * (this.canvasHeight * (1 - this.innerY)))
                .attr("y2", node.get_y() * (this.canvasHeight * (1 - this.innerY)))
                .attr("stroke", "#eee")
                .attr("stroke-width", 0.25)
                .attr("stroke-linecap", "round")

            // Add Node Text
            nodeG.append("text")
                .attr("id", "nodeText-" + node.get_id())
                .attr("class", "nodetext")
                .style("font-size", "0.5pt")
                .attr("x", 0.95 * this.canvasWidth * (this.innerX - this.nodeGX))
                .attr("y", node.get_y() * (this.canvasHeight * (1 - this.nodeGY)))
                .attr("text-anchor", "end")
                .attr("dominant-baseline", "middle")
                .text(node.get_label())
                .attr("fill", d3.schemeObservable10[node.get_depth()])
        }

        // Iterate over unique node Depths        
        let nodeDepths = [...new Set(this.biofabric.graph.nodes.filter(node => node.get_depth() <= this.biofabric.graph.get_depth()).map(node => node.get_depth()))];
        for (let nodeDepth of nodeDepths) {

            // Calculcate Y Position of Depth Circles
            let depthNodes = this.biofabric.graph.nodes.filter(node => node.get_depth() == nodeDepth);
            let depthY = depthNodes.map(node => node.get_y()).reduce((a, b) => a + b, 0)/depthNodes.length
            
            // Append a Node Depth Line
            nodeDepthG.append("line")
                .attr("id", "nodeDepthLine-" + nodeDepth.toString().replace(".", "-"))
                .attr("class", "nodeDepthLine")
                .attr("x1", 0)
                .attr("x2", 0)
                .attr("y1", Math.min.apply(0, depthNodes.map(node => node.get_y() * (this.canvasHeight * (1 - this.innerY)))))
                .attr("y2", Math.max.apply(0, depthNodes.map(node => node.get_y() * (this.canvasHeight * (1 - this.innerY)))))
                .attr("stroke", ((nodeDepth % 1) == 0.5) ? "#333" : d3.schemeObservable10[nodeDepth])
                .attr("stroke-width", 0.2)
                .attr("stroke-linecap", "round")

            // Append a Node Depth Cirlce
            let nodeDepthCircleG = nodeDepthG
                .append("g")
                .attr("id", "nodeDepthCircle-" + nodeDepth.toString().replace(".", "-") + "G")
                .attr("transform", "translate(" + (0) + "," + (depthY * (this.canvasHeight * (1 - this.innerY))) + ")")
            
            // Node Depth Circle Background Color
            nodeDepthCircleG.append("circle")
                .attr("cx", 0)
                .attr("cy", 0)
                .attr("fill", "white")
                .attr("r", 0.8)

            // Node Depth Circles Icon Paths
            nodeDepthCircleG.append("path")
                    .attr('opacity', () => 
                            {
                                if (depthNodes[0].get_state() != State["Uncmpressed"]) {
                                    return "1"
                                } else {
                                    return "0"
                                }
                            }
                        )
                    .attr("d", () => 
                        {
                            let curve = d3.line().curve(d3.curveBasisClosed)
                            if (depthNodes[0].get_state() == State["Singleton"]) {
                                return curve([[0, 0.2], [-0.2, 0], [0, -0.2], [0.2, 0]])
                            } else {
                                return curve([[0, 0.7], [0, 0.7], [0, 0.7], [0, 0.7]])
                            }
                        }
                    )
                    .attr("id", "nodeDepthCircleIcon-" + nodeDepth.toString().replace(".", "-"))
                    .attr('fill', ((nodeDepth % 1) == 0.5) ? "#333" : d3.schemeObservable10[nodeDepth])

            // Node Depth Circles
            nodeDepthCircleG.append("circle")
                .attr("id", "nodeDepthCircle-" + nodeDepth.toString().replace(".", "-"))
                .attr("class", "nodeDepthCircle")
                .attr("cx", 0)
                .attr("cy", 0)
                .attr("r", 0.5)
                .attr("fill", "white")
                .attr("fill-opacity", "0")
                .attr("stroke", ((nodeDepth % 1) == 0.5) ? "#333" : d3.schemeObservable10[nodeDepth])
                .attr("stroke-width", 0.2)
                .on("click", () => 
                    {

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
                            innerG.select("#" + "nodeLine-" + node.get_id())
                                .transition()
                                .duration(100)
                                .attr("y1", node.get_y() * (this.canvasHeight * (1 - this.innerY)))
                                .attr("y2", node.get_y() * (this.canvasHeight * (1 - this.innerY)))

                            // Collapse Node Text
                            nodeG.select("#" + "nodeText-" + node.get_id())
                                .transition()
                                .duration(100)
                                .attr("y", node.get_y() * (this.canvasHeight * (1 - this.nodeGY)))
                                .attr("opacity", () => 
                                    {
                                        if (node.get_state() == State["Fully Compressed"]) {
                                            return "0"
                                        } else {
                                            return "1"
                                        }
                                    }
                                )
                        }

                        // Iterate over depths and update their positions
                        for (let nodeDepth of nodeDepths) {

                            let newDepthNodes = this.biofabric.graph.nodes.filter(node => node.get_depth() == nodeDepth);
                            let newYCoordinate = newDepthNodes.map(node => node.get_y()).reduce((a,b) => a + b, 0)/newDepthNodes.length
                            let minY = Math.min.apply(0, newDepthNodes.map(node => node.get_y()))
                            let maxY = Math.max.apply(0, newDepthNodes.map(node => node.get_y()))

                            nodeDepthG.select("#" + "nodeDepthCircle-" + nodeDepth.toString().replace(".", "-") + "G")
                                .transition()
                                .duration(100)
                                .attr("transform", "translate(0," + newYCoordinate * (this.canvasHeight * (1 - this.innerY)) + ")")

                            nodeDepthG.select("#nodeDepthLine-" + nodeDepth.toString().replace(".", "-"))
                                .transition()
                                .duration(100)
                                .attr("y1", minY * (this.canvasHeight * (1 - this.innerY)))
                                .attr("y2", maxY * (this.canvasHeight * (1 - this.innerY)))
                        }
                        
                        d3.select("#" + "nodeDepthCircleIcon-" + nodeDepth.toString().replace(".", "-"))
                            .transition()
                            .duration(100)
                            .attr("opacity", () => 
                                {
                                    if (depthNodes[0].get_state() != State["Uncmpressed"]) {
                                        return "1"
                                    } else {
                                        return "0"
                                    }
                                })
                            .attr("d", () => 
                            {
                                let curve = d3.line().curve(d3.curveBasisClosed)
                                if (depthNodes[0].get_state() == State["Singleton"]) {
                                    return curve([[0, 0.2], [-0.2, 0], [0, -0.2], [0.2, 0]])
                                }
                                if (depthNodes[0].get_state() == State["Partially Compressed"]) {
                                    return curve([[0, 0.7], [-0.7, 0], [0, 0], [0.7, 0]])
                                } else if (depthNodes[0].get_state() == State["Fully Compressed"]) {
                                    return curve([[0, 0.7], [-0.7, 0], [0, -0.7], [0.7, 0]])
                                } else if (depthNodes[0].get_state() == State["Uncompressed"]) {
                                    return curve([[0, 0.7], [0, 0.7], [0, 0.7], [0, 0.7]])
                                }
                            }
                        )

                        for (let edge of this.biofabric.graph.edges.filter(edge => edge.get_depth() <= this.biofabric.graph.get_depth())) {

                            innerG
                                .select("#" + "edgeLine-" + edge.get_id())
                                .transition()
                                .duration(100)
                                .attr("y1", edge.get_source().get_y() * (this.canvasHeight * (1 - this.innerY)))
                                .attr("y2", edge.get_target().get_y() * (this.canvasHeight * (1 - this.innerY)))

                            innerG
                                .select("#" + "edgeCircleTarget-" + edge.get_id())
                                .transition()
                                .duration(100)
                                .attr("cy", edge.get_target().get_y() * (this.canvasHeight * (1 - this.innerY)))

                            innerG
                                .select("#" + "edgeCircleSource-" + edge.get_id())
                                .transition()
                                .duration(100)
                                .attr("cy", edge.get_source().get_y() * (this.canvasHeight * (1 - this.innerY)))
                                
                        }
                    }
                )
                .style("cursor", () => 
                    {
                        if (depthNodes[0].get_state() == State["Singleton"]) {
                            return "default";
                        } else {
                            return "pointer";
                        }
                    }
                )                
        }

        // Iterate over all Edges in Depth Limit
        for (let edge of this.biofabric.graph.edges.filter(edge => (edge.get_depth() <= this.biofabric.graph.get_depth()))) {

            // Get Indicies of Curent Edge's Termini Nodes
            let topNodeIndex = this.biofabric.get_topmost_node_index(edge);
            let lowNodeIndex = this.biofabric.get_bottommost_node_index(edge);

            // Append an Edge Line
            innerG
                .append("line")
                .attr("id", "edgeLine-" + edge.get_id())
                .attr("class", "edgeLine")
                .attr("y1", this.biofabric.graph.nodes[topNodeIndex].get_y() * (this.canvasHeight * (1 - this.innerY)))
                .attr("y2", this.biofabric.graph.nodes[lowNodeIndex].get_y() * (this.canvasHeight * (1 - this.innerY)))
                .attr("x1", edge.get_x() * (this.canvasWidth * (1 - this.innerX)))
                .attr("x2", edge.get_x() * (this.canvasWidth * (1 - this.innerX)))
                .attr("stroke", ((edge.get_depth() % 1) == 0.5) ? "#333" : d3.schemeObservable10[edge.get_depth()])
                .attr("stroke-width", 0.25)
                .attr("stroke-linecap", "round")

            innerG
                .append("circle")
                .attr("id", "edgeCircleSource-" + edge.get_id())
                .attr('class', "edgecircle")
                .attr("cy", edge.get_source().get_y() * (this.canvasHeight * (1 - this.innerY)))
                .attr("cx", edge.get_x() * (this.canvasWidth * (1 - this.innerX)))
                .attr("r", "0.2")
                .attr("stroke-width", "0")
                .attr("fill",  ((edge.get_depth() % 1) == 0.5) ? "#333" : d3.schemeObservable10[edge.get_depth()])

            innerG
                .append("circle")
                .attr("id", "edgeCircleTarget-" + edge.get_id())
                .attr('class', "edgecircle")
                .attr("cy", edge.get_target().get_y() * (this.canvasHeight * (1 - this.innerY)))
                .attr("cx", edge.get_x() * (this.canvasWidth * (1 - this.innerX)))
                .attr("r", "0.2")
                .attr("stroke-width", "0")
                .attr("fill",  ((edge.get_depth() % 1) == 0.5) ? "#333" : d3.schemeObservable10[edge.get_depth()])
        }

        let edgeDepths = [...new Set(this.biofabric.graph.edges.filter(edge => (edge.get_depth() <= this.biofabric.graph.get_depth())).map(edge => edge.get_depth()))]
        for (let depth of edgeDepths) {

            let depthEdges = this.biofabric.graph.edges.filter(edge => edge.get_depth() == depth);
            let xcenter = depthEdges.map(edge => edge.get_x()).reduce((a,b) => a + b, 0)/depthEdges.length

            edgeDepthG.append("line")
                .attr("id", "edgeDepthLine-" + depth.toString().replace(".", "-"))
                .attr("class", "edgeDepthLine")
                .attr("x1", Math.min.apply(0, depthEdges.map(edge => edge.get_x())) * this.canvasWidth * (1 - this.edgeDepthX))
                .attr("x2", Math.max.apply(0, depthEdges.map(edge => edge.get_x())) * this.canvasWidth * (1 - this.edgeDepthX))
                .attr("y1", 0)
                .attr("y2", 0)
                .attr("stroke", ((depth % 1) == 0.5) ? "#333" : d3.schemeObservable10[depth])
                .attr("stroke-linecap", "round")
                .attr("stroke-width", 0.2)

            let edgeDepthCircleG = edgeDepthG
                .append("g")
                .attr("id", "edgeDepthCircle-" + depth.toString().replace(".", "-") + "G")
                .attr("transform", "translate(" + (xcenter * this.canvasWidth * (1 - this.edgeDepthX)) + "," + (0) + ")")

            edgeDepthCircleG.append("circle")
                .attr("cx", 0)
                .attr("cy", 0)
                .attr("fill", "white")
                .attr("r", 0.8)
            
            // Edge Depth Circles Icon Paths
            edgeDepthCircleG.append("path")
                    .attr('opacity', () => 
                            {
                                if (depthEdges[0].get_state() != State["Uncmpressed"]) {
                                    return "1"
                                } else {
                                    return "0"
                                }
                            }
                        )
                    .attr("d", () => 
                        {
                            let curve = d3.line().curve(d3.curveBasisClosed)
                            if (depthEdges[0].get_state() == State["Singleton"]) {
                                return curve([[0, 0.2], [-0.2, 0], [0, -0.2], [0.2, 0]])
                            } else {
                                return curve([[0, 0.7], [0, 0.7], [0, 0.7], [0, 0.7]])
                            }
                        }
                    )
                    .attr("id", "nodeDepthCircleIcon-" + depth.toString().replace(".", "-"))
                    .attr('fill', ((depth % 1) == 0.5) ? "#333" : d3.schemeObservable10[depth])

            edgeDepthCircleG.append("circle")
                .attr("id", "edgeDepthCircle-" + depth.toString().replace(".", "-"))
                .attr("class", "depthCircle")
                .attr("cx", 0)
                .attr("cy", 0)
                .attr("stroke-width", 0.2)
                .attr("r", 0.5)
                .attr("fill", "white")
                .attr('fill-opacity', 0)
                .attr("stroke", ((depth % 1) == 0.5) ? "#333" : d3.schemeObservable10[depth])
                .style("cursor", () => 
                    {
                        if (depthEdges[0].get_state() == State["Singleton"]) {
                            return "default"
                        } else {
                            return "pointer"
                        }
                    }
                )      
                .on("click", () => 
                    {
                        // Set the New States (Un/Fully/Partially Compressed) for all edges in clicked Depth
                        for (let edge of this.biofabric.graph.edges.filter(edge => edge.get_depth() == depth)) {
                            switch (edge.get_state()) {
                                case (State["Uncompressed"]):
                                    edge.set_state(State["Partially Compressed"]);
                                    break;
                                case (State["Partially Compressed"]):
                                    edge.set_state(State["Fully Compressed"]);
                                    break;
                                case (State["Fully Compressed"]):
                                    edge.set_state(State["Uncompressed"]);
                                    break;
                            }
                        }

                        // Recalculate the X coordinates of the now partially/un/fully compressed edges
                        this.biofabric.calculate_edge_x_coordinates();

                        // Iterate over all edges (and their circle termini) and update their x coordinates
                        for (let edge of this.biofabric.graph.edges.filter(edge => edge.get_depth() <= this.biofabric.graph.get_depth())) {

                            innerG.select("#edgeLine-" + edge.get_id())
                                .transition()
                                .duration(100)
                                .attr("x1", edge.get_x() * (this.canvasWidth * (1 - this.innerX)))
                                .attr("x2", edge.get_x() * (this.canvasWidth * (1 - this.innerX)))

                            innerG.select("#edgeCircleSource-" + edge.get_id())
                                .transition()
                                .duration(100)
                                .attr("cx", edge.get_x() * (this.canvasWidth * (1 - this.innerX)))

                            innerG.select("#edgeCircleTarget-" + edge.get_id())
                                .transition()
                                .duration(100)
                                .attr("cx", edge.get_x() * (this.canvasWidth * (1 - this.innerX)))

                        }

                        // Iterate over all depth circles and lines and update their positions
                        for (let edgeDepth of edgeDepths) {

                            let newDepthEdges = this.biofabric.graph.edges.filter(edge => edge.get_depth() == edgeDepth);
                            let minX = Math.min.apply(0, newDepthEdges.map(edge => edge.get_x()));
                            let maxX = Math.max.apply(0, newDepthEdges.map(edge => edge.get_x()));
                            let centerX = (minX + maxX) / 2;

                            svg
                                .select("#" + "edgeDepthCircle-" + edgeDepth.toString().replace(".", "-") + "G")
                                .transition()
                                .duration(100)
                                .attr("transform", "translate(" + (centerX * this.canvasWidth * (1 - this.edgeDepthX)) + ",0)")

                            svg
                                .select("#edgeDepthLine-" + edgeDepth.toString().replace(".", "-"))
                                .transition()
                                .duration(100)
                                .attr("x1", minX * this.canvasWidth * (1 - this.edgeDepthX))
                                .attr("x2", maxX * this.canvasWidth * (1 - this.edgeDepthX))

                        }
                    }
                )
        }
    }

    // Update
    update() {

    }
}
