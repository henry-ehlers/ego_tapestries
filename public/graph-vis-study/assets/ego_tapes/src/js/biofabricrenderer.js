
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import { State } from './state.js';
import { CompressionMsg } from "./CompressionMsg.js";

const transitionDuration = 300;

export class BioFabricRenderer {

    // Constructor
    constructor(biofabric, canvasWidth, canvasHeight, globalDispatcher = d3.dispatch("highlight", "hover-in", "hover-out", "compression")) {

        //
        this.biofabric = biofabric;
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.globalDispatcher = globalDispatcher;

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
                .datum(node) // node data
                .attr("x1", 0)
                .attr("x2", this.canvasWidth * (0.95 * (1 - this.innerX)))
                .attr("y1", node.get_y() * (this.canvasHeight * (1 - this.innerY)))
                .attr("y2", node.get_y() * (this.canvasHeight * (1 - this.innerY)))
                .attr("stroke", "#eee")
                .attr("stroke-width", 0.25)
                .attr("stroke-linecap", "round")
                .on("click", (_event, d) => {
                    this.globalDispatcher.call("highlight", this, d.get_id());
                })

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
                .on("dblclick", () => {

                    // clear canvas
                    svg.selectAll("*").remove();

                    // recalculate ego network with new ego
                    this.biofabric.graph.set_ego(node);
                    this.biofabric.graph.construct_ego_network();
                    console.log("Constructed Ego Network")

                    // Sort Nodes Based on Hop + Weighted Distanced to Ego
                    this.biofabric.graph.identify_singleton_nodes();
                    this.biofabric.graph.identify_singleton_edges();
                    this.biofabric.graph.sort_nodes();
                    console.log("Sorted Nodes")

                    // Repopulate depth icons
                    this.biofabric.populate_node_depths();
                    this.biofabric.populate_edge_depths();
                    console.log("Populated Edge/Node Depths")

                    // Sort Edges, Depths
                    this.biofabric.sort_edges_degreescending();
                    this.biofabric.sort_edge_depth_icons();
                    this.biofabric.sort_node_depth_icons();
                    console.log("Sort Edges and Edge/Node Depths")

                    // Calculcate Y Coordinates
                    this.biofabric.calculate_node_y_coordinates();
                    this.biofabric.calculcate_depth_y_coordinates();
                    console.log("Calculated Y Coordinates")

                    // Calculcate X Coordiantes
                    this.biofabric.calculate_edge_x_coordinates();
                    this.biofabric.calculcate_depth_x_coordinates();
                    console.log("Calculated X Coordinates")

                    // TODO: do not just redraw but animate the transition
                    this.render(svg)

                })
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
                .attr('opacity', () => {
                    if (nodeDepthIcon.get_state() != State["Uncompressed"]) {
                        return "1"
                    } else {
                        return "0"
                    }
                }
                )
                .attr("d", () => {
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
                .on("dblclick", () => {
                    // Check if Depth is not Singleton/Empty -> update drawing if not so
                    if ((nodeDepthIcon.get_state() != State["Singleton"]) && (nodeDepthIcon.get_state() != State["Empty"])) {
                        // we only fully compress if the edge is already fully compressed and we are compressing the node, or if we are already fully compressed and are decompressing the node.
                        const edgePendant = this.biofabric.edgeDepths.find(edgeDepth => edgeDepth.get_depth() == nodeDepthIcon.get_depth());
                        const isFullCompression = (nodeDepthIcon.get_state() == State["Uncompressed"] && edgePendant.get_state() == State["Fully Compressed"]) || (nodeDepthIcon.get_state() == State["Fully Compressed"] && edgePendant.get_state() == State["Fully Compressed"]);
                        this.globalDispatcher.call("compression", this, new CompressionMsg(nodeDepthIcon, isFullCompression, "node"));
                    }
                })
                .style("cursor", () => {
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
                .datum(edge) // edge data
                .attr("y1", this.biofabric.graph.nodes[topNodeIndex].get_y() * (this.canvasHeight * (1 - this.innerY)))
                .attr("y2", this.biofabric.graph.nodes[lowNodeIndex].get_y() * (this.canvasHeight * (1 - this.innerY)))
                .attr("x1", edge.get_x() * (this.canvasWidth * (1 - this.innerX)))
                .attr("x2", edge.get_x() * (this.canvasWidth * (1 - this.innerX)))
                .attr("stroke", ((edge.get_depth() % 1) == 0.5) ? "#333" : d3.schemeObservable10[edge.get_depth()])
                .attr("stroke-width", 30 / this.biofabric.graph.edges.filter(e => e.get_depth() <= this.biofabric.graph.get_depth()).length)
                .attr("stroke-linecap", "round")

            innerG
                .append("circle")
                .attr("id", "edgeCircleSource-" + edge.get_id())
                .attr('class', "edgecircle")
                .datum(edge.endpoints[0]) // source vertex data
                .attr("cy", edge.get_source_vertex().get_y() * (this.canvasHeight * (1 - this.innerY)))
                .attr("cx", edge.get_x() * (this.canvasWidth * (1 - this.innerX)))
                .attr("r", 30 / this.biofabric.graph.edges.filter(e => e.get_depth() <= this.biofabric.graph.get_depth()).length)
                .attr("stroke-width", "0")
                .attr("fill", ((edge.get_depth() % 1) == 0.5) ? "#333" : d3.schemeObservable10[edge.get_depth()])
                .on("click", (_event, d) => {
                    this.globalDispatcher.call("highlight", this, d.get_id());
                })
                .on("mouseover", (_event, d) => {
                    this.globalDispatcher.call("hover-in", this, d.get_id());
                })
                .on("mouseout", () => {
                    this.globalDispatcher.call("hover-out");
                });

            innerG
                .append("circle")
                .attr("id", "edgeCircleTarget-" + edge.get_id())
                .attr('class', "edgecircle")
                .datum(edge.endpoints[1]) // target vertex data
                .attr("cy", edge.get_target_vertex().get_y() * (this.canvasHeight * (1 - this.innerY)))
                .attr("cx", edge.get_x() * (this.canvasWidth * (1 - this.innerX)))
                .attr("r", 30 / this.biofabric.graph.edges.filter(e => e.get_depth() <= this.biofabric.graph.get_depth()).length)
                .attr("stroke-width", "0")
                .attr("fill", ((edge.get_depth() % 1) == 0.5) ? "#333" : d3.schemeObservable10[edge.get_depth()])
                .on("click", (_event, d) => {
                    this.globalDispatcher.call("highlight", this, d.get_id());
                })
                .on("mouseover", (_event, d) => {
                    this.globalDispatcher.call("hover-in", this, d.get_id());
                })
                .on("mouseout", () => {
                    this.globalDispatcher.call("hover-out");
                });
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
                .attr('opacity', () => {
                    if (edgeDepth.get_state() != State["Uncompressed"]) {
                        return "1"
                    } else {
                        return "0"
                    }
                }
                )
                .attr("d", () => {
                    if (edgeDepth.get_state() == State["Empty"]) {
                        let curve = d3.line();
                        return curve([[-0.3, -0.3], [0, 0], [0.3, 0.3], [0, 0], [-0.3, 0.3], [0, 0], [0.3, -0.3]])
                    } else if (edgeDepth.get_state() == State["Singleton"]) {
                        let curve = d3.line().curve(d3.curveBasisClosed)
                        return curve([[0, 0.2], [-0.2, 0], [0, -0.2], [0.2, 0]])
                    } else {
                        let curve = d3.line().curve(d3.curveBasisClosed)
                        return curve([[0, 0.7], [0, 0.7], [0, 0.7], [0, 0.7]])
                    }
                }
                )
                .attr("id", "edgeDepthCircleIcon-" + edgeDepth.get_depth().toString().replace(".", "-"))
                .attr("stroke", ((edgeDepth.get_depth() % 1) == 0.5) ? "#333" : d3.schemeObservable10[edgeDepth.get_depth()])
                .attr("stroke-width", () => {
                    if (edgeDepth.get_state() == State["Empty"]) {
                        return 0.2
                    } else {
                        return 0
                    }
                })
                .attr('fill', () => {
                    if (edgeDepth.get_state() == State["Empty"]) {
                        return "none"
                    } else {
                        return ((edgeDepth.get_depth() % 1) == 0.5) ? "#333" : d3.schemeObservable10[edgeDepth.get_depth()]
                    }
                })

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
                .style("cursor", () => {
                    if (edgeDepth.get_state() == State["Singleton"] || edgeDepth.get_state() == State["Empty"]) {
                        return "default"
                    } else {
                        return "pointer"
                    }
                }
                )
                .on("dblclick", () => {
                    // Ensure Current Depth's EdgeSet is not Singleton or Empty
                    if ((edgeDepth.get_state() != State["Singleton"]) && (edgeDepth.get_state() != State["Empty"])) {
                        let isFullCompression = false;
                        // we only fully compress if the node is already fully compressed and we are compressing the edge fully, or if we are already fully compressed and are decompressing the node.
                        if (edgeDepth.get_depth() % 1 == 0) { // only fully compress if its a full depth, not a half depth
                            const nodePendant = this.biofabric.nodeDepths.find(nodeDepth => nodeDepth.get_depth() == edgeDepth.get_depth());
                            isFullCompression = (edgeDepth.get_state() == State["Partially Compressed"] && nodePendant.get_state() == State["Fully Compressed"]) || (edgeDepth.get_state() == State["Fully Compressed"] && nodePendant.get_state() == State["Fully Compressed"]);
                        }
                        this.globalDispatcher.call("compression", this, new CompressionMsg(edgeDepth, isFullCompression, "edge"));
                    }
                });
        }

        this.globalDispatcher.on("compression.biofabric", (msg) => {
            let foundNodeDepthIcon = null;
            let foundEdgeDepth = null;
            const isByNonBioFabric = msg.type === "string";

            // Decompose the message based on its type
            // the message cam from the other visualizations anc contains only the ID of the compressed node.
            if (isByNonBioFabric) {
                const nodeID = msg.msg;
                const node = this.biofabric.graph.nodes.find(node => node.get_id() == nodeID);
                foundNodeDepthIcon = nodeDepthIcons.find(nodeDepthIcon => nodeDepthIcon.get_depth() == node.get_depth());
                foundEdgeDepth = this.biofabric.edgeDepths.find(edgeDepth => edgeDepth.get_depth() == node.get_depth());
            } else if (msg.type === "object" && msg.nodeOrEdge == "node") {
                foundNodeDepthIcon = msg.msg;
            } else if (msg.type === "object" && msg.nodeOrEdge == "edge") {
                foundEdgeDepth = msg.msg;
            } else {
                console.error("Unknown message type received in BioFabric Renderer: " + msg);
                return;
            }

            // this comes into play if either one is already fully compressed, but the other is not, and we are doing a full compression. In this case, we keep the state fully compressed to stay synced.
            const nodeStateBeforeTransition = foundNodeDepthIcon ? foundNodeDepthIcon.get_state() : null;
            const edgeStateBeforeTransition = foundEdgeDepth ? foundEdgeDepth.get_state() : null;
            const foundBoth = foundNodeDepthIcon && foundEdgeDepth;
            const nodeShouldStayFullyCompressed = foundBoth && msg.fullcompression && ((nodeStateBeforeTransition == State["Fully Compressed"]) && (edgeStateBeforeTransition != State["Fully Compressed"]));
            const edgeShouldStayFullyCompressed = foundBoth && msg.fullcompression && ((edgeStateBeforeTransition == State["Fully Compressed"]) && (nodeStateBeforeTransition != State["Fully Compressed"]));

            if (msg.nodeOrEdge == "node" || isByNonBioFabric) {
                const nodeDepthIcon = foundNodeDepthIcon;
                console.log("Toggling Node Depth Icon with depth " + nodeDepthIcon.get_depth() + " and state " + State[nodeDepthIcon.get_state()])
                let depthNodes = this.biofabric.graph.nodes.filter(node => node.get_depth() == nodeDepthIcon.get_depth());



                // Switch the State of the DepthIcon
                switch (nodeDepthIcon.get_state()) {
                    case State["Uncompressed"]:
                        nodeDepthIcon.set_state(State["Fully Compressed"])
                        break;
                    case State["Fully Compressed"]:
                        nodeDepthIcon.set_state(State["Uncompressed"]);
                        if (nodeShouldStayFullyCompressed) {
                            nodeDepthIcon.set_state(State["Fully Compressed"]);
                        }
                        break;
                }

                // Iterate over all nodes in the current depth and update their state
                for (let depthNode of depthNodes) {
                    switch (depthNode.get_state()) {
                        case State["Uncompressed"]:
                            depthNode.set_state(State["Fully Compressed"])
                            break;
                        case State["Fully Compressed"]:
                            depthNode.set_state(State["Uncompressed"]);
                            if (nodeShouldStayFullyCompressed) {
                                depthNode.set_state(State["Fully Compressed"]);
                            }
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
                        .duration(transitionDuration)
                        .attr("y1", node.get_y() * (this.canvasHeight * (1 - this.innerY)))
                        .attr("y2", node.get_y() * (this.canvasHeight * (1 - this.innerY)))

                    // (Un)collapse Node Text
                    nodeG.select("#" + "nodeText-" + node.get_id())
                        .transition()
                        .duration(transitionDuration)
                        .attr("y", node.get_y() * (this.canvasHeight * (1 - this.nodeGY)))
                        .attr("opacity", () => {
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
                        .duration(transitionDuration)
                        .attr("y1", nodeDepthIconB.get_min_y() * (this.canvasHeight * (1 - this.innerY)))
                        .attr("y2", nodeDepthIconB.get_max_y() * (this.canvasHeight * (1 - this.innerY)))

                    // Update the Positions of the Depth Circle G's which contain the Depth Circles and their Icons
                    nodeDepthG.select("#nodeDepthCircle-" + nodeDepthIconB.get_depth().toString().replace(".", "-") + "G")
                        .transition()
                        .duration(transitionDuration)
                        .attr("transform", "translate(0," + nodeDepthIconB.get_y() * (this.canvasHeight * (1 - this.innerY)) + ")")

                }

                // Update the Opacity and Shape of the Node Depth Circle Icon
                d3.select("#nodeDepthCircleIcon-" + nodeDepthIcon.get_depth().toString().replace(".", "-"))
                    .transition()
                    .duration(transitionDuration)
                    .attr("opacity", () => {
                        if (nodeDepthIcon.get_state() == State["Uncompressed"]) {
                            return "0"
                        } else {
                            return "1"
                        }
                    })
                    .attr("d", () => {
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
                        .transition("edgeLineYTransition") // named transition to avoid conflicts with the edge line X transition triggered by edge compression
                        .duration(transitionDuration)
                        .attr("y1", edge.get_source_vertex().get_y() * (this.canvasHeight * (1 - this.innerY)))
                        .attr("y2", edge.get_target_vertex().get_y() * (this.canvasHeight * (1 - this.innerY)));

                    innerG
                        .select("#" + "edgeCircleTarget-" + edge.get_id())
                        .transition("edgeCircleTargetYTransition") // named transition to avoid conflicts with the edge circle target X transition triggered by edge compression
                        .duration(transitionDuration)
                        .attr("cy", edge.get_target_vertex().get_y() * (this.canvasHeight * (1 - this.innerY)));

                    innerG
                        .select("#" + "edgeCircleSource-" + edge.get_id())
                        .transition("edgeCircleSourceYTransition") // ditto
                        .duration(transitionDuration)
                        .attr("cy", edge.get_source_vertex().get_y() * (this.canvasHeight * (1 - this.innerY)));

                }
            }

            // -----------------------------------------------------------------------------------------------------------------------------------------------------
            // Continuing with Edge Depth Icon Toggle. Unfortunaltely, this has to be in the same function, as calls from other visualizations do not differentiate.
            // -----------------------------------------------------------------------------------------------------------------------------------------------------

            if (msg.nodeOrEdge == "edge" || isByNonBioFabric) {
                const edgeDepth = foundEdgeDepth;

                // Switch the State of the DepthIcon
                switch (edgeDepth.get_state()) {
                    case State["Uncompressed"]:
                        edgeDepth.set_state(State["Partially Compressed"])
                        // skip to fully compressed if the message came from a non-biofabric visualization
                        if (msg.fullcompression) {
                            edgeDepth.set_state(State["Fully Compressed"])
                        }
                        break;
                    case State["Partially Compressed"]:
                        edgeDepth.set_state(State["Fully Compressed"])
                        break;
                    case State["Fully Compressed"]:
                        edgeDepth.set_state(State["Uncompressed"]);
                        if (edgeShouldStayFullyCompressed) {
                            edgeDepth.set_state(State["Fully Compressed"]);
                        }
                        break;
                }


                // Set the New States (Un/Fully/Partially Compressed) for all edges in clicked Depth
                for (let edge of this.biofabric.graph.edges.filter(edge => edge.get_depth() == edgeDepth.get_depth())) {
                    switch (edge.get_state()) {
                        case (State["Uncompressed"]):
                            edge.set_state(State["Partially Compressed"]);
                            // skip to fully compressed if the message came from a non-biofabric visualization
                            if (msg.fullcompression) {
                                edge.set_state(State["Fully Compressed"]);
                            }
                            break;
                        case (State["Partially Compressed"]):
                            edge.set_state(State["Fully Compressed"]);
                            break;
                        case (State["Fully Compressed"]):
                            edge.set_state(State["Uncompressed"]);
                            if (edgeShouldStayFullyCompressed) {
                                edge.set_state(State["Fully Compressed"]);
                            }
                            break;
                    }
                }

                // Recalculate the X coordinates of the now partially/un/fully compressed edges
                this.biofabric.calculate_edge_x_coordinates();
                this.biofabric.calculcate_depth_x_coordinates();

                // Iterate over all edges (and their circle termini) and update their x coordinates
                for (let edge of this.biofabric.graph.edges.filter(edge => edge.get_depth() <= this.biofabric.graph.get_depth())) {

                    innerG.select("#edgeLine-" + edge.get_id())
                        .transition("edgeLineXTransition")
                        .duration(transitionDuration)
                        .attr("x1", edge.get_x() * (this.canvasWidth * (1 - this.innerX)))
                        .attr("x2", edge.get_x() * (this.canvasWidth * (1 - this.innerX)))

                    innerG.select("#edgeCircleSource-" + edge.get_id())
                        .transition("edgeCircleSourceXTransition")
                        .duration(transitionDuration)
                        .attr("cx", edge.get_x() * (this.canvasWidth * (1 - this.innerX)))

                    innerG.select("#edgeCircleTarget-" + edge.get_id())
                        .transition("edgeCircleTargetXTransition")
                        .duration(transitionDuration)
                        .attr("cx", edge.get_x() * (this.canvasWidth * (1 - this.innerX)))

                }

                // Iterate over all depth circles and lines and update their positions
                for (let edgeDepthB of this.biofabric.edgeDepths) {

                    if ((edgeDepthB.get_state() == State["Empty"]) || (edgeDepthB.get_state() == State["Singleton"])) {
                        continue;
                    }

                    edgeDepthG.select("#edgeDepthLine-" + edgeDepthB.get_depth().toString().replace(".", "-"))
                        .transition()
                        .duration(transitionDuration)
                        .attr("x1", edgeDepthB.get_min_x() * this.canvasWidth * (1 - this.edgeDepthX))
                        .attr("x2", edgeDepthB.get_max_x() * this.canvasWidth * (1 - this.edgeDepthX))

                    edgeDepthG.select("#edgeDepthCircle-" + edgeDepthB.get_depth().toString().replace(".", "-") + "G")
                        .transition()
                        .duration(transitionDuration)
                        .attr("transform", "translate(" + (edgeDepthB.get_x() * this.canvasWidth * (1 - this.edgeDepthX)) + ",0)")

                }

                d3.select("#edgeDepthCircleIcon-" + edgeDepth.get_depth().toString().replace(".", "-"))
                    .transition()
                    .duration(transitionDuration)
                    .attr("opacity", () => {
                        if (edgeDepth.get_state() != State["Uncompressed"]) {
                            return "1"
                        } else {
                            return "0"
                        }
                    })
                    .attr("d", () => {
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
                    });
            }
        });

        this.globalDispatcher.on("hover-in.biofabric", (id) => {
            const n = this.biofabric.graph.nodes.find(n => n.get_id() === id);
            const path_to_ego = this.biofabric.graph.find_path_to_ego(n);

            d3.selectAll(".edgeLine").classed("fade-biofabric", edge => !(path_to_ego.includes(edge.get_source_vertex()) && path_to_ego.includes(edge.get_target_vertex())));
            d3.selectAll(".edgecircle").classed("fade-biofabric", node => !path_to_ego.includes(node));

        });

        this.globalDispatcher.on("hover-out.biofabric", () => {
            d3.selectAll(".edgeLine").classed("fade-biofabric", false);
            d3.selectAll(".edgecircle").classed("fade-biofabric", false);
        });

        this.globalDispatcher.on("highlight.biofabric", (id) => {
            // equivalent to matrix highlighting.
            const n = this.biofabric.graph.nodes.find(n => n.get_id() === id);
            this.biofabric.highlight_unh_nodes(n);
            d3.selectAll(".edgecircle").classed("highlight-biofabric", d => d.get_highlighted());

            console.log("Highlighted Node " + id);


            // Revisit may be defined globally, if the user is running this in a Revisit environment.
            if (Revisit) {
                let highlightedNodes = this.biofabric.graph.nodes.filter(n => n.get_highlighted()).map(n => n.label);
                Revisit.postAnswers({
                    // 'graphVis' must match id defined in config.json baseComponent response 
                    ['graphVis']: highlightedNodes,
                });
            }
        });
    }

    // Update
    update() {

    }
}
