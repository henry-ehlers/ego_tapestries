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
        let nodeDepthIcons = [...new Set(this.biofabric.nodeDepths.filter(nodeDepth => nodeDepth.get_depth() <= this.biofabric.graph.get_depth()))]
        for (let nodeDepthIcon of nodeDepthIcons) {
            
            // Extract Current Depth and its Nodes
            let depthNodes = this.biofabric.graph.nodes.filter(node => node.get_depth() == nodeDepthIcon.get_depth());
            console.log("Node Depth: " + nodeDepthIcon.get_depth() + " - state: " + nodeDepthIcon.get_state() + " - length: " + depthNodes.length)

            // Append a Node Depth Line
            nodeDepthG.append("line")
                .attr("id", "nodeDepthLine-" + nodeDepthIcon.get_depth().toString().replace(".", "-"))
                .attr("class", "nodeDepthLine")
                .attr("x1", 0)
                .attr("x2", 0)
                .attr("y1", Math.min.apply(0, depthNodes.map(node => node.get_y() * (this.canvasHeight * (1 - this.innerY)))))
                .attr("y2", Math.max.apply(0, depthNodes.map(node => node.get_y() * (this.canvasHeight * (1 - this.innerY)))))
                .attr("stroke", ((nodeDepthIcon.get_depth() % 1) == 0.5) ? "#333" : d3.schemeObservable10[nodeDepthIcon.get_depth()])
                .attr("stroke-width", 0.2)
                .attr("stroke-linecap", "round")

            // Append a Node Depth Cirlce
            let nodeDepthCircleG = nodeDepthG.append("g")
                .attr("id", "nodeDepthCircle-" + nodeDepthIcon.get_depth().toString().replace(".", "-") + "G")
                .attr("transform", "translate(" + (0) + "," + (nodeDepthIcon.get_y() * (this.canvasHeight * (1 - this.innerY))) + ")")
            
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
                                if (nodeDepthIcon.get_state() != State["Uncmpressed"]) {
                                    return "1"
                                } else {
                                    return "0"
                                }
                            }
                        )
                    .attr("d", () => 
                        {
                            let curve = d3.line().curve(d3.curveBasisClosed)
                            if (nodeDepthIcon.get_state() == State["Singleton"]) {
                                return curve([[0, 0.2], [-0.2, 0], [0, -0.2], [0.2, 0]])
                            } else {
                                return curve([[0, 0.7], [0, 0.7], [0, 0.7], [0, 0.7]])
                            }
                        }
                    )
                    .attr("id", "nodeDepthCircleIcon-" + nodeDepthIcon.get_depth().toString().replace(".", "-"))
                    .attr('fill', ((nodeDepthIcon.get_depth() % 1) == 0.5) ? "#333" : d3.schemeObservable10[nodeDepthIcon.get_depth()])

            // Node Depth Circles
            nodeDepthCircleG.append("circle")
                .attr("id", "nodeDepthCircle-" + nodeDepthIcon.get_depth().toString().replace(".", "-"))
                .attr("class", "nodeDepthCircle")
                .attr("cx", 0)
                .attr("cy", 0)
                .attr("r", 0.5)
                .attr("fill", "white")
                .attr("fill-opacity", "0")
                .attr("stroke", ((nodeDepthIcon.get_depth() % 1) == 0.5) ? "#333" : d3.schemeObservable10[nodeDepthIcon.get_depth()])
                .attr("stroke-width", 0.2)
                .on("click", () => 
                    {
                        // Check if Depth is not Singleton/Empty -> update drawing if not so
                        if ((nodeDepthIcon.get_state() != State["Singleton"]) && (nodeDepthIcon.get_state() != State["Empty"])) {

                            // Switch the State of the DepthIcon
                             switch (nodeDepthIcon.get_state()) {
                                case State["Uncompressed"]:
                                    nodeDepthIcon.set_state(State["Fully Compressed"])
                                    break;
                                case State["Fully Compressed"]:
                                    nodeDepthIcon.set_state(State["Uncompressed"])
                                    break;
                             }

                            // Iterate over all nodes in the current depth and update their state
                            for (let depthNode of depthNodes) {
                                switch (depthNode.get_state()) {
                                    case State["Uncompressed"]:
                                        depthNode.set_state(State["Fully Compressed"])
                                        break;
                                    case State["Fully Compressed"]:
                                        depthNode.set_state(State["Uncompressed"])
                                        break;
                                }
                            }

                            // Recalculcate the Y Coordinates of the now (un)compressed states
                            this.biofabric.calculate_node_y_coordinates();
                            this.biofabric.calculcate_depth_y_coordinates();

                            // Iterate over nodes and update the node lines
                            for (let node of this.biofabric.graph.nodes.filter(node => node.get_depth() <= this.biofabric.graph.get_depth())) {
                                
                                // Update Node Lines
                                innerG.select("#" + "nodeLine-" + node.get_id())
                                    .transition()
                                    .duration(100)
                                    .attr("y1", node.get_y() * (this.canvasHeight * (1 - this.innerY)))
                                    .attr("y2", node.get_y() * (this.canvasHeight * (1 - this.innerY)))

                                // (Un)collapse Node Text
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
                            for (let nodeDepthIconB of nodeDepthIcons) {

                                // Get all Nodes for Given Depth -> Skip if Singleton or Empty
                                if ((nodeDepthIconB.get_state() == State["Empty"]) || (nodeDepthIconB.get_state() == State["Singleton"])) {
                                    continue;
                                }

                                // update the Endpoints of the Depth lines
                                nodeDepthG.select("#nodeDepthLine-" + nodeDepthIconB.get_depth().toString().replace(".", "-"))
                                    .transition()
                                    .duration(100)
                                    .attr("y1", nodeDepthIconB.get_min_y() * (this.canvasHeight * (1 - this.innerY)))
                                    .attr("y2", nodeDepthIconB.get_max_y() * (this.canvasHeight * (1 - this.innerY)))

                                // Update the Positions of the Depth Circle G's which contain the Depth Circles and their Icons
                                nodeDepthG.select("#nodeDepthCircle-" + nodeDepthIconB.get_depth().toString().replace(".", "-") + "G")
                                    .transition()
                                    .duration(100)
                                    .attr("transform", "translate(0," + nodeDepthIconB.get_y() * (this.canvasHeight * (1 - this.innerY)) + ")")

                            }
                            
                            // Update the Opacity and Shape of the Node Depth Circle Icon
                            d3.select("#nodeDepthCircleIcon-" + nodeDepthIcon.get_depth().toString().replace(".", "-"))
                                .transition()
                                .duration(100)
                                .attr("opacity", () => 
                                    {
                                        if (nodeDepthIcon.get_state() == State["Uncompressed"]) {
                                            console.log("State Uncompressed")
                                            return "0"
                                        } else {
                                            console.log("State Uncompressed")
                                            return "1"
                                        }
                                    })
                                .attr("d", () => 
                                {
                                    let curve = d3.line().curve(d3.curveBasisClosed)
                                    switch (nodeDepthIcon.get_state()) {
                                        case State["Singleton"]:
                                            return curve([[0, 0.2], [-0.2, 0], [0, -0.2], [0.2, 0]]);
                                        case State["Partially Compressed"]:
                                            return curve([[0, 0.7], [-0.7, 0], [0, 0], [0.7, 0]]);
                                        case State["Fully Compressed"]:
                                            return curve([[0, 0.7], [-0.7, 0], [0, -0.7], [0.7, 0]]);
                                        case State["Uncompressed"]:
                                            return curve([[0, 0.7], [0, 0.7], [0, 0.7], [0, 0.7]]);

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
                    }
                )
                .style("cursor", () => 
                    {
                        // Change Cursor on hover over non-singleton circles
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

        for (let edgeDepth of this.biofabric.edgeDepths) {
            console.log(edgeDepth)

            edgeDepthG.append("line")
                .attr("id", "edgeDepthLine-" + edgeDepth.get_depth().toString().replace(".", "-"))
                .attr("class", "edgeDepthLine")
                .attr("x1", edgeDepth.get_min_x() * this.canvasWidth * (1 - this.edgeDepthX))
                .attr("x2", edgeDepth.get_max_x() * this.canvasWidth * (1 - this.edgeDepthX))
                .attr("y1", 0)
                .attr("y2", 0)
                .attr("stroke", ((edgeDepth.get_depth() % 1) == 0.5) ? "#333" : d3.schemeObservable10[edgeDepth.get_depth()])
                .attr("stroke-linecap", "round")
                .attr("stroke-width", 0.2)

            let edgeDepthCircleG = edgeDepthG.append("g")
                .attr("id", "edgeDepthCircle-" + edgeDepth.get_depth().toString().replace(".", "-") + "G")
                .attr("transform", "translate(" + (edgeDepth.get_x() * this.canvasWidth * (1 - this.edgeDepthX)) + "," + (0) + ")")

            edgeDepthCircleG.append("circle")
                .attr("cx", 0)
                .attr("cy", 0)
                .attr("fill", "white")
                .attr("r", 0.8)
            
            // Edge Depth Circles Icon Paths
            edgeDepthCircleG.append("path")
                    .attr('opacity', () => 
                            {
                                if (edgeDepth.get_state() != State["Uncmpressed"]) {
                                    return "1"
                                } else {
                                    return "0"
                                }
                            }
                        )
                    .attr("d", () => 
                        {
                            let curve = d3.line().curve(d3.curveBasisClosed)
                            if (edgeDepth.get_state() == State["Singleton"]) {
                                return curve([[0, 0.2], [-0.2, 0], [0, -0.2], [0.2, 0]])
                            } else {
                                return curve([[0, 0.7], [0, 0.7], [0, 0.7], [0, 0.7]])
                            }
                        }
                    )
                    .attr("id", "edgeDepthCircleIcon-" + edgeDepth.get_depth().toString().replace(".", "-"))
                    .attr('fill', ((edgeDepth.get_depth() % 1) == 0.5) ? "#333" : d3.schemeObservable10[edgeDepth.get_depth()])
                
            edgeDepthCircleG.append("circle")
                .attr("id", "edgeDepthCircle-" + edgeDepth.get_depth().toString().replace(".", "-"))
                .attr("class", "depthCircle")
                .attr("cx", 0)
                .attr("cy", 0)
                .attr("stroke-width", 0.2)
                .attr("r", 0.5)
                .attr("fill", "white")
                .attr('fill-opacity', 0)
                .attr("stroke", ((edgeDepth.get_depth() % 1) == 0.5) ? "#333" : d3.schemeObservable10[edgeDepth.get_depth()])
                .style("cursor", () => 
                    {
                        if (edgeDepth.get_state() == State["Singleton"] || edgeDepth.get_state() == State["Empty"]) {
                            return "default"
                        } else {
                            return "pointer"
                        }
                    }
                )      
                .on("click", () => 
                    {

                        // Ensure Current Depth's EdgeSet is not Singleton or Empty
                        if (edgeDepth.get_state() != State["Singleton"] && edgeDepth.get_state() != State["Empty"]) {
                            
                            // Switch the State of the DepthIcon
                            switch (edgeDepth.get_state()) {
                                case State["Uncompressed"]:
                                    edgeDepth.set_state(State["Partially Compressed"])
                                    break;
                                case State["Partially Compressed"]:
                                    edgeDepth.set_state(State["Fully Compressed"])
                                    break;
                                case State["Fully Compressed"]:
                                    edgeDepth.set_state(State["Uncompressed"])
                                    break;
                                }


                            // Set the New States (Un/Fully/Partially Compressed) for all edges in clicked Depth
                            for (let edge of this.biofabric.graph.edges.filter(edge => edge.get_depth() == edgeDepth.get_depth())) {
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
                            this.biofabric.calculcate_depth_x_coordinates();

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
                            for (let edgeDepthB of this.biofabric.edgeDepths) {

                                if ((edgeDepthB.get_state() == State["Empty"]) || (edgeDepthB.get_state() == State["Singleton"])) {
                                    continue;
                                }

                                edgeDepthG.select("#edgeDepthLine-" + edgeDepthB.get_depth().toString().replace(".", "-"))
                                    .transition()
                                    .duration(100)
                                    .attr("x1", edgeDepthB.get_min_x() * this.canvasWidth * (1 - this.edgeDepthX))
                                    .attr("x2", edgeDepthB.get_max_x() * this.canvasWidth * (1 - this.edgeDepthX))

                                edgeDepthG.select("#edgeDepthCircle-" + edgeDepthB.get_depth().toString().replace(".", "-") + "G")
                                    .transition()
                                    .duration(100)
                                    .attr("transform", "translate(" + (edgeDepthB.get_x() * this.canvasWidth * (1 - this.edgeDepthX)) + ",0)")

                            }

                            d3.select("#edgeDepthCircleIcon-" + edgeDepth.get_depth().toString().replace(".", "-"))
                                .transition()
                                .duration(100)
                                .attr("opacity", () => 
                                    {
                                        if (edgeDepth.get_state() != State["Uncmpressed"]) {
                                            return "1"
                                        } else {
                                            return "0"
                                        }
                                    })
                                .attr("d", () => 
                                {
                                    let curve = d3.line().curve(d3.curveBasisClosed)
                                    if (edgeDepth.get_state() == State["Singleton"]) {
                                        return curve([[0, 0.2], [-0.2, 0], [0, -0.2], [0.2, 0]])
                                    }
                                    if (edgeDepth.get_state() == State["Partially Compressed"]) {
                                        return curve([[0, 0.7], [-0.7, 0], [0, 0], [0.7, 0]])
                                    } else if (edgeDepth.get_state() == State["Fully Compressed"]) {
                                        return curve([[0, 0.7], [-0.7, 0], [0, -0.7], [0.7, 0]])
                                    } else if (edgeDepth.get_state() == State["Uncompressed"]) {
                                        return curve([[0, 0.7], [0, 0.7], [0, 0.7], [0, 0.7]])
                                    }
                                }
                            )    
                        }
                    }   
                )
        }
    }

    // Update
    update() {

    }
}
