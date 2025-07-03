class Graph {

    constructor (data) {

        this.edges = [];
        this.nodes = [];

        let nodeCounter = 0;
        let edgeCounter = 0;

        for (let entry of data) {

            if (!this.nodes.find(n => n.label == entry.source)) {
                this.nodes.push({
                    label: entry.source,
                    id: nodeCounter++
                })
            }
            
            if (!this.nodes.find(n => n.label == entry.target)) {
                this.nodes.push({
                    label: entry.target,
                    id: nodeCounter++
                })
            }
            
            let sourceID = this.nodes.find(n => n.label == entry.source).id;
            let targetID = this.nodes.find(n => n.label == entry.target).id;

            if (!this.edges.find(e => e.endpoints.has(sourceID) && e.endpoints.has(targetID))) {
                let newEdge = {
                    endpoints: new Set([sourceID, targetID]),
                    weight: entry.weight,
                    id: edgeCounter++
                }

                newEdge.get_source = () => [...newEdge.endpoints][0]
                newEdge.get_target = () => [...newEdge.endpoints][1]

                newEdge.get_topmost_index = () => {
                    let source_index = this.nodes.indexOf(this.get_node_from_id(newEdge.get_source()))
                    let target_index = this.nodes.indexOf(this.get_node_from_id(newEdge.get_target()))
                    return Math.min(source_index, target_index)
                }

                newEdge.get_length = () => {
                    let source_index = this.nodes.indexOf(this.get_node_from_id(newEdge.get_source()))
                    let target_index = this.nodes.indexOf(this.get_node_from_id(newEdge.get_target()))
                    return Math.abs(source_index - target_index)
                }
                
                this.edges.push(newEdge)


            }
        }

        this.root = this.nodes[1];
        this.maxDepth = 3;
        this.nodes.map(n => {n.depth = undefined; n.collapsed = false});
        this.edges.map(e => {e.depth = undefined; e.collapsed = false});
        this.construct_ego_network();
        this.sort_nodes();

   }

   sort_nodes () {
        this.nodes.sort((a,b) => {
            if (a.depth == undefined) return 1
            if (b.depth == undefined) return -1
            if (a.depth > b.depth) {
                return 1
            } else if (a.depth < b.depth) {
                return -1
            } else {
                if (a.distance > b.distance) {
                    return -1
                } else if (a.distance < b.distance) {
                    return 1
                } else {
                    return 0
                }
            }
        })
    }

    sort_edges (edges) {
        edges.sort((a,b) => {
            if (a.depth == undefined) return 1
            if (b.depth == undefined) return -1
            if (a.depth > b.depth) {
                return 1
            } else if (a.depth < b.depth) {
                return -1
            } else {
                let aIndex = a.get_topmost_index();
                let bIndex = b.get_topmost_index();
                if (aIndex < bIndex) {
                    return -1
                } else if (aIndex > bIndex) {
                    return 1
                } else {
                    if (a.get_length() > b.get_length()) {
                        return 1
                    } else if (a.get_length() < b.get_length()) {
                        return -1
                    } else {
                        return 0
                    }
                }
                
            }
        })
        return edges
    }

   construct_ego_network () {

        this.nodes.map(n => {n.depth = undefined; n.collapsed = false});
        this.edges.map(e => {e.depth = undefined; e.collapsed = false});
        this.root.depth = 0;

        let bfs = (root) => {

            let queue = [root];
            let visited = new Set();
            let result = [];
            let shortestPaths = {};
            shortestPaths[root.id] = 0;

            while (queue.length) {
                let vertex = queue.shift();
                
                if (!visited.has(vertex)) {
                    visited.add(vertex);
                    result.push(vertex);
                    
                    let incidence = this.edges.filter(e => e.endpoints.has(vertex.id))
                    vertex.incidence = incidence;
                    let adjacency = incidence.map(e => [...e.endpoints]).flat().filter(n => vertex.id != n);
                    let neighbors = adjacency.map(n => this.nodes.find(b => b.id == n));
                    vertex.neighbors = neighbors;

                    for (let neighbor of neighbors) {
                    
                        neighbor.depth = neighbor.depth < vertex.depth + 1 ? neighbor.depth : vertex.depth + 1
                        
                        let neighborWeight = this.edges.find(e => e.endpoints.has(neighbor.id) && e.endpoints.has(vertex.id)).weight
                        if (neighbor.depth == vertex.depth - 1) {
                            if (shortestPaths[vertex.id] == undefined) {
                                shortestPaths[vertex.id] = shortestPaths[neighbor.id] + neighborWeight
                            }
                            if (shortestPaths[vertex.id] < shortestPaths[neighbor.id] + neighborWeight)
                                shortestPaths[vertex.id] = shortestPaths[neighbor.id] + neighborWeight
                            
                        }
                        
                        queue.push(neighbor);
                    }
                }
            }

            // FIX THIS LATER
            for (let n of this.nodes) {
                n.distance = shortestPaths[n.id];
            }
        }

        bfs(this.root)

        for (let e of this.edges) {
            let source = this.nodes.find(n => n.id == [...e.endpoints][0])
            let target = this.nodes.find(n => n.id == [...e.endpoints][1])
            e.depth = (source.depth == target.depth) ? source.depth : ((source.depth + target.depth) / 2 )
        }

   }

   get_node_from_id (id) {
        return this.nodes.find(n => n.id == id);
   }

   calculate_node_y_coordinates(nodes) {
    
    // 
    let nNodes = nodes.filter(n => !n.collapsed).length
    let depths = [... new Set(nodes.map(n => n.depth))]
    let nDepth = depths.length
    let verticalspace = (dimensions.height - (depthlabelpadding.top + whitepadding.top + whitepadding.bottom + labelpadding.top + labelpadding.bottom - depthPadding * (nDepth-1))) / nNodes;

    for (let n in nodes) {
        let y = undefined;
        if (n == 0) {
            y = 0
        } else {
            if (nodes[n].collapsed) {
                y = nodes[n - 1].y;
            } else {
                y = nodes[n - 1].y + verticalspace;
            }
            if (nodes[n - 1].depth != nodes[n].depth) {
                y += depthPadding;
            }
        }
        nodes[n].y = y;
    }
   }

    calculate_edge_x_coordinates (edges) {
        
        let nEdges = edges.filter(e => !e.collapsed).length
        let depths = [... new Set(edges.map(e => e.depth))]
        let nDepths = depths.length;
        let horizontalspace = (dimensions.width - (whitepadding.left + whitepadding.right + labelpadding.left + labelpadding.right + nodelabelpadding + nodecirclepadding + depthPadding * (nDepths-1))) / (nEdges);

        //
        for (let e in edges){
            let xcoordinate = undefined;
            if (e == 0) {
                xcoordinate = 0;
            } else {
                if (edges[e].collapsed) {
                    xcoordinate = edges[e - 1].xcoordinate;
                } else {
                    xcoordinate = edges[e - 1].xcoordinate + horizontalspace;
                }
                if (edges[e - 1].depth != edges[e].depth) {
                    xcoordinate += depthPadding;
                }
            }
            edges[e].xcoordinate = xcoordinate;
        }

    }

   draw_biofabric (svg) {

        //
        let filteredNodes = this.nodes.filter(n => (n.depth <= this.maxDepth));
        let filteredNodesIDs = filteredNodes.map(n => n.id)
        let filteredEdges = this.sort_edges(this.edges.filter(e => filteredNodesIDs.includes([...e.endpoints][0]) && filteredNodesIDs.includes([...e.endpoints][1])))
        
        // TODO: CLEAN THIS MESS UP
        let depths = [... new Set(filteredEdges.map(e => e.depth))];
        let nDepth = depths.length
        let nEdges = filteredEdges.length
        let horizontalspace = (dimensions.width - (whitepadding.left + whitepadding.right + labelpadding.left + labelpadding.right + nodelabelpadding + nodecirclepadding + depthPadding * (nDepth-1))) / (nEdges);
        
        let innerG = svg
            .append("g")
            .attr("transform", "translate(" + (whitepadding.left + labelpadding.left + nodelabelpadding + nodecirclepadding) + "," + (depthlabelpadding.top + whitepadding.top + labelpadding.top) + ")")

        let nodeG = svg
            .append("g")
            .attr("transform", "translate(" + (whitepadding.left + depthlabelpadding.left - nodelabelpadding) + "," + (depthlabelpadding.top + whitepadding.top) + ")")
        
        let edgeDepthG = svg
            .append("g")
            .attr("transform", "translate(" + (whitepadding.left + labelpadding.left + nodelabelpadding + nodecirclepadding) + "," + (whitepadding.top) + ")")

        let nodeDepthG = svg
            .append("g")
            .attr("transform", "translate(" + (whitepadding.left) + "," + (depthlabelpadding.top + whitepadding.top) + ")")

        // Calculate X and Y positions of edges and nodes
        this.calculate_node_y_coordinates(filteredNodes)
        this.calculate_edge_x_coordinates(filteredEdges)

        //
        for (let n in filteredNodes) {
            
            // 
            innerG
                .append("line")
                .attr("id", "nodeline-" + filteredNodes[n].id)
                .attr("class", "nodeline")
                .attr("x1", 0)
                .attr("x2", horizontalspace * nEdges + depthPadding * nDepth)
                .attr("y1", filteredNodes[n].y)
                .attr("y2", filteredNodes[n].y)
                .attr("stroke", "#eee")
                .attr("stroke-width", 0.5)
                .attr("stroke-linecap", "round")
            
            //
            nodeG
                .append("text")
                .attr("id", "nodetext-" + filteredNodes[n].id)
                .attr("class", "nodetext")
                .attr("x", labelpadding.left)
                .attr("y", filteredNodes[n].y)
                .attr("text-anchor", "end")
                .attr("dominant-baseline", "middle")
                .text(filteredNodes[n].label)
                .attr("fill", d3.schemeObservable10[filteredNodes[n].depth])
                .on("mouseover", () => {
                    d3
                        .select("#nodeline-" + filteredNodes[n].id)
                        .attr("stroke-width", 1)
                    
                    for (let e of filteredNodes[n].incidence) {
                        d3
                            .select("#edgeline-" + e.id)
                            .attr("stroke-width", 2)
                    }

                    for (let v of filteredNodes[n].neighbors) {
                        d3
                            .select("#nodetext-" + v.id)
                            .attr("fill", "red")
                    }

                })
                .on("mouseout", () => {

                    d3
                        .selectAll(".nodeline")
                        .attr("stroke-width", 0.5)

                    d3
                        .selectAll(".edgeline")
                        .attr("stroke-width", 1)

                    for (let v in filteredNodes) {
                        d3
                            .select("#nodetext-" + filteredNodes[v].id)
                            .attr("fill", d3.schemeObservable10[filteredNodes[v].depth])
                    }

                })
                .on("dblclick", () => {
                    
                    // clear canvas
                    svg.selectAll("*").remove();
                    
                    // recalculate ego network with new ego
                    this.root = filteredNodes[n]                    
                    this.construct_ego_network()
                    this.sort_nodes();

                    // TODO: do not just redraw but animate the transition
                    this.draw_biofabric(svg)

                })

            const radius = d3.scaleLinear([0, Math.max.apply(0, filteredNodes.map(n => n.neighbors.length))], [0, 1.5])

            //
            nodeG
                .append("circle")
                .attr("id", "nodeglyph-" + filteredNodes[n].id)
                .attr("class", "nodeglyph")
                .attr("cx", labelpadding.left + nodelabelpadding)
                .attr("cy", filteredNodes[n].y)
                .attr("r", radius(filteredNodes[n].neighbors.length))
                .attr("fill", d3.schemeObservable10[filteredNodes[n].depth])

        }
        
        for (let e in filteredEdges){

            let endpoints = [...filteredEdges[e].endpoints];
            let source = filteredNodes.find(n => n.id == parseInt(endpoints[0]));
            let target = filteredNodes.find(n => n.id == parseInt(endpoints[1]));

            // TODO: make stroke-width a function of available screen space
            innerG
                .append("line")
                .attr("id", "edgeline-" + filteredEdges[e].id)
                .attr("class", "edgeline")
                .attr("x1", filteredEdges[e].xcoordinate)
                .attr("x2", filteredEdges[e].xcoordinate)
                .attr("y1", source.y)
                .attr("y2", target.y)
                .attr("stroke", ((filteredEdges[e].depth % 1) == 0.5) ? "#333" : d3.schemeObservable10[filteredEdges[e].depth])
                .attr("stroke-linecap", "round")
                .attr("stroke-width", 1)

            filteredEdges[e].htmlID = "edgeline-" + filteredEdges[e].id

        }

        for (let g of depths) {
            
            let depthEdges = filteredEdges.filter(e => e.depth == g);
            let xcenter = depthEdges.map(e => e.xcoordinate).reduce((a,b) => a + b, 0)/depthEdges.length
            let depthNodes = filteredNodes.filter(n => n.depth == g)
            let ycenter = depthNodes.map(n => n.y).reduce((a,b) => a + b, 0)/depthNodes.length

            edgeDepthG
                .append("line")
                .attr("id", "depthline-" + g.toString().replace(".", "-"))
                .attr("class", "depthline")
                .attr("x1", Math.min.apply(0, depthEdges.map(e => e.xcoordinate)))
                .attr("x2", Math.max.apply(0, depthEdges.map(e => e.xcoordinate)))
                .attr("y1", 0)
                .attr("y2", 0)
                .attr("stroke", ((g % 1) == 0.5) ? "#333" : d3.schemeObservable10[g])
                .attr("stroke-linecap", "round")

            edgeDepthG
                .append("circle")
                .attr("id", "depthcircle-" + g.toString().replace(".", "-"))
                .attr("class", "depthcircle")
                .attr("cx", xcenter)
                .attr("cy", 0)
                .attr("r", 3)
                .attr("fill", ((g % 1) == 0.5) ? "#333" : d3.schemeObservable10[g])
                .attr("stroke", "white")
                .on("click", () => {
                    for (let f of filteredEdges.filter(e => e.depth == g)) {
                        f.collapsed = !f.collapsed;
                    }
                    this.calculate_edge_x_coordinates(filteredEdges);
                    for (let f of filteredEdges) {
                        svg
                            .select("#" + f.htmlID)
                            .transition()
                            .duration(100)
                            .attr("x1", f.xcoordinate)
                            .attr("x2", f.xcoordinate)
                    }

                    for (let d of depths) {

                        let newDepthEdges = filteredEdges.filter(e => e.depth == d);
                        let newxcenter = newDepthEdges.map(e => e.xcoordinate).reduce((a,b) => a + b, 0)/newDepthEdges.length
                        let minX = Math.min.apply(0, newDepthEdges.map(e => e.xcoordinate))
                        let maxX = Math.max.apply(0, newDepthEdges.map(e => e.xcoordinate))

                        svg
                            .select("#" + "depthcircle-" + d.toString().replace(".", "-"))
                            .transition()
                            .duration(100)
                            .attr("cx", newxcenter)

                        svg
                            .select("#depthline-" + d.toString().replace(".", "-"))
                            .transition()
                            .duration(100)
                            .attr("x1", minX)
                            .attr("x2", maxX)
                    }
                }
            )

            if (g % 1 != 0.5) {

                nodeDepthG
                    .append("line")
                    .attr("id", "nodeDepthLine-" + g.toString().replace(".", "-"))
                    .attr("class", "nodeDepthLine")
                    .attr("x1", 0)
                    .attr("x2", 0)
                    .attr("y1", Math.min.apply(0, depthNodes.map(n => n.y)))
                    .attr("y2", Math.max.apply(0, depthNodes.map(n => n.y)))
                    .attr("stroke", ((g % 1) == 0.5) ? "#333" : d3.schemeObservable10[g])
                    .attr("stroke-linecap", "round")

                nodeDepthG
                    .append("circle")
                    .attr("id", "nodeDepthCircle-" + g.toString().replace(".", "-"))
                    .attr("class", "nodeDepthCircle")
                    .attr("cx", 0)
                    .attr("cy", ycenter)
                    .attr("r", 3)
                    .attr("fill", ((g % 1) == 0.5) ? "#333" : d3.schemeObservable10[g])
                    .attr("stroke", "white")
                    .on("click", () => {

                        for (let v of filteredNodes.filter(n => n.depth == g)) {
                            v.collapsed = !v.collapsed;
                        }

                        this.calculate_node_y_coordinates(filteredNodes);

                        for (let v in filteredNodes) {

                            // Collapse Node Glyphs
                            nodeG
                                .select("#" + "nodeglyph-" + filteredNodes[v].id)
                                .transition()
                                .duration(100)
                                .attr("cy", filteredNodes[v].y)

                            // Collapse Node Text
                            nodeG
                                .select("#" + "nodetext-" + filteredNodes[v].id)
                                .transition()
                                .duration(100)
                                .attr("y", filteredNodes[v].y)
                                .text(filteredNodes[v].collapsed ? "" : filteredNodes[v].label)
                            
                            // Update Node Lines
                            innerG
                                .select("#" + "nodeline-" + filteredNodes[v].id)
                                .transition()
                                .duration(100)
                                .attr("y1", filteredNodes[v].y)
                                .attr("y2", filteredNodes[v].y)

                        }

                        for (let e in filteredEdges) {
                            
                            let endpoints = [...filteredEdges[e].endpoints];
                            let source = filteredNodes.find(n => n.id == parseInt(endpoints[0]));
                            let target = filteredNodes.find(n => n.id == parseInt(endpoints[1]));

                            innerG
                                .select("#" + "edgeline-" + filteredEdges[e].id)
                                .transition()
                                .duration(100)
                                .attr("y1", source.y)
                                .attr("y2", target.y)
                                
                        }

                        for (let d of depths) {

                            let newDepthNodes = filteredNodes.filter(n => n.depth == d);
                            let newYCoordinate = newDepthNodes.map(n => n.y).reduce((a,b) => a + b, 0)/newDepthNodes.length
                            let minY = Math.min.apply(0, newDepthNodes.map(n => n.y))
                            let maxY = Math.max.apply(0, newDepthNodes.map(n => n.y))

                            nodeDepthG
                                .select("#" + "nodeDepthCircle-" + d.toString().replace(".", "-"))
                                .transition()
                                .duration(100)
                                .attr("cy", newYCoordinate)

                            nodeDepthG
                                .select("#nodeDepthLine-" + d.toString().replace(".", "-"))
                                .transition()
                                .duration(100)
                                .attr("y1", minY)
                                .attr("y2", maxY)
                            }

                        })

            }
            
        }

   }

}