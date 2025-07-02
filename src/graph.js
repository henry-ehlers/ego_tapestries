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
        this.maxDepth = 4;
        this.nodes.map(n => n.depth = undefined);
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

   draw_biofabric (svg) {

        //
        let filteredNodes = this.nodes.filter(n => (n.depth <= this.maxDepth));
        let filteredNodesIDs = filteredNodes.map(n => n.id)
        let filteredEdges = this.sort_edges(this.edges.filter(e => filteredNodesIDs.includes([...e.endpoints][0]) && filteredNodesIDs.includes([...e.endpoints][1])))

        let depths = [... new Set(filteredEdges.map(e => e.depth))]
        let nDepths = depths.length;
        let depthPadding = 5;

        let nEdges = filteredEdges.filter(e => !e.collapsed).length;

        let verticalspace = (dimensions.height - (depthlabelpadding + whitepadding.top + whitepadding.bottom + labelpadding.top + labelpadding.bottom)) / filteredNodes.length;
        let horizontalspace =  (dimensions.width - (whitepadding.left + whitepadding.right + labelpadding.left + labelpadding.right + nodelabelpadding + nodecirclepadding + depthPadding * (nDepths-1))) / (nEdges);
        

        //
        for (let n in filteredNodes) {

            //
            svg
                .append("line")
                .attr("id", "nodeline-" + filteredNodes[n].id)
                .attr("class", "nodeline")
                .attr("x1", whitepadding.left + labelpadding.left + nodelabelpadding + nodecirclepadding)
                .attr("x2", dimensions.width - whitepadding.right - labelpadding.right)
                .attr("y1", depthlabelpadding + whitepadding.top + labelpadding.top + n * verticalspace)
                .attr("y2", depthlabelpadding + whitepadding.top + labelpadding.top + n * verticalspace)
                .attr("stroke", "lightgrey")
                .attr("stroke-width", 0.5)
                .attr("stroke-linecap", "round")

            
            //
            svg
                .append("text")
                .attr("id", "nodetext-" + filteredNodes[n].id)
                .attr("class", "nodetext")
                .attr("x", whitepadding.left + labelpadding.left)
                .attr("y", depthlabelpadding + whitepadding.top + labelpadding.top + n * verticalspace)
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

            const radius = d3.scaleLinear([0, Math.max.apply(0, filteredNodes.map(n => n.neighbors.length))], [0, 1])

            //
            svg
                .append("circle")
                .attr("id", "nodeglyph-" + filteredNodes[n].id)
                .attr("class", "nodeglyph")
                .attr("cx", whitepadding.left + labelpadding.left + nodelabelpadding)
                .attr("cy", depthlabelpadding + whitepadding.top + labelpadding.top + n * verticalspace)
                .attr("r", radius(filteredNodes[n].neighbors.length))
                .attr("fill", d3.schemeObservable10[filteredNodes[n].depth])

            //
            filteredNodes[n].y =  n * verticalspace;

        }
        
        this.compute_edge_x_coordinates(filteredEdges, depthPadding);

        for (let e in filteredEdges){

            let endpoints = [...filteredEdges[e].endpoints];
            let source = filteredNodes.find(n => n.id == parseInt(endpoints[0]));
            let target = filteredNodes.find(n => n.id == parseInt(endpoints[1]));

            svg
                .append("line")
                .attr("id", "edgeline-" + filteredEdges[e].id)
                .attr("class", "edgeline")
                .attr("x1", filteredEdges[e].xcoordinate)
                .attr("x2", filteredEdges[e].xcoordinate)
                .attr("y1", depthlabelpadding + whitepadding.top + labelpadding.top + source.y)
                .attr("y2", depthlabelpadding + whitepadding.top + labelpadding.top + target.y)
                .attr("stroke", ((filteredEdges[e].depth % 1) == 0.5) ? "#333" : d3.schemeObservable10[filteredEdges[e].depth])
                .attr("stroke-linecap", "round")

            filteredEdges[e].htmlID = "edgeline-" + filteredEdges[e].id

        }

        for (let g of depths) {
            
            let depthEdges = filteredEdges.filter(e => e.depth == g);
            let xcenter = depthEdges.map(e => e.xcoordinate).reduce((a,b) => a + b, 0)/depthEdges.length
            
            svg
                .append("circle")
                .attr("id", "depthcircle-" + g.toString().replace(".", "-"))
                .attr("class", "depthcircle")
                .attr("cx", xcenter)
                .attr("cy", depthlabelpadding)
                .attr("r", 4)
                .attr("fill", ((g % 1) == 0.5) ? "#333" : d3.schemeObservable10[g])
                .attr("stroke", ((g % 1) == 0.5) ? "#333" : d3.schemeObservable10[g])
                .on("click", () => {
                    for (let f of filteredEdges.filter(e => e.depth == g)) {
                        f.collapsed = !f.collapsed;
                    }
                    this.compute_edge_x_coordinates(filteredEdges, depthPadding);
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

                        svg
                            .select("#" + "depthcircle-" + d.toString().replace(".", "-"))
                            .transition()
                            .duration(100)
                            .attr("cx", newxcenter)
                    }
                })
        }

   }

   compute_edge_x_coordinates (filteredEdges, depthPadding) {
        
        let nEdges = filteredEdges.filter(e => !e.collapsed).length
        let depths = [... new Set(filteredEdges.map(e => e.depth))]
        let nDepths = depths.length;
        let horizontalspace =  (dimensions.width - (whitepadding.left + whitepadding.right + labelpadding.left + labelpadding.right + nodelabelpadding + nodecirclepadding + depthPadding * (nDepths-1))) / (nEdges);

        for (let e in filteredEdges){
            let xcoordinate = 0;
            if (e == 0) {
                xcoordinate = whitepadding.left + labelpadding.left + nodelabelpadding + nodecirclepadding;
            } else {
                if (filteredEdges[e].collapsed) {
                    xcoordinate = filteredEdges[e - 1].xcoordinate;
                } else {
                    xcoordinate = filteredEdges[e - 1].xcoordinate + horizontalspace;
                }
                if (filteredEdges[e - 1].depth != filteredEdges[e].depth) {
                    xcoordinate += depthPadding;
                }
            }
            filteredEdges[e].xcoordinate = xcoordinate;
        }
   }

}