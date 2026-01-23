"use strict";
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

export class NodeLinkRenderer {

    constructor(nodelink, canvasWidth, canvasHeight) {
        this.nodelink = nodelink;
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
    }

    render(svg) {
        // Create main group for the visualization
        let mainG = svg.append("g")
            .attr("class", "nodelink-container");

        const nodes = this.nodelink.graph.nodes;
        const edges = this.nodelink.graph.edges;

        const edgeWidth = Math.max(0.05, Math.min(0.3, 30 / edges.length));
        const nodeRadius = Math.max(0.3, Math.min(1.0, 50 / nodes.length));

        // Render edges first (so they appear behind nodes)
        const edgeGroup = mainG.append("g")
            .attr("class", "edges");

        edges.forEach(edge => {
            edgeGroup.append("line")
                .attr("id", "edge-" + edge.get_id())
                .attr("class", "edge")
                .attr("x1", edge.get_source_vertex().x)
                .attr("y1", edge.get_source_vertex().y)
                .attr("x2", edge.get_target_vertex().x)
                .attr("y2", edge.get_target_vertex().y)
                .attr("stroke", "#999")
                .attr("stroke-width", edgeWidth)
                .attr("stroke-linecap", "round")
                .attr("opacity", 0.6);
        });

        // Render nodes
        const nodeGroup = mainG.append("g")
            .attr("class", "nodes");

        nodes.forEach(node => {
            // Node circle
            nodeGroup.append("circle")
                .attr("id", "node-" + node.get_id())
                .attr("class", "node")
                .attr("cx", node.x)
                .attr("cy", node.y)
                .attr("r", nodeRadius)
                .attr("fill", d3.schemeObservable10[node.get_depth()])
                .attr("stroke", "white")
                .attr("stroke-width", 0.15)
                .style("cursor", "pointer")
                .on("dblclick", () => {
                    // Double-click to make this node the new ego
                    console.log("Setting new ego:", node.get_label());
                    this.nodelink.graph.set_ego(node);
                    this.nodelink.graph.construct_ego_network();
                    this.nodelink.graph.sort_nodes();

                    // Reinitialize layout with new ego network
                    this.nodelink.initializeLayout();

                    // Clear and re-render
                    svg.selectAll("*").remove();
                    this.render(svg);
                });
        });


        // Optional: Add zoom/pan behavior
        const zoom = d3.zoom()
            .scaleExtent([0.5, 5])
            .on("zoom", (event) => {
                mainG.attr("transform", event.transform);
            });

        svg.call(zoom);
    }

    update() {
        // Placeholder for future updates
    }
}
