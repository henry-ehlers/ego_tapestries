"use strict";
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

export class NodeLink {
    constructor(graph) {
        this.graph = graph;
        this.simulation = null;
        this.layoutType = "force"; // "force", "radial", or "hierarchical"

        // Initialize positions based on layout type
        this.initializeLayout();
    }

    initializeLayout() {
        switch (this.layoutType) {
            case "force":
                this.initializeForceLayout();
                break;
            case "radial":
                this.initializeRadialLayout();
                break;
            default:
                this.initializeForceLayout();
        }
    }

    initializeForceLayout() {
        const nodes = this.graph.nodes;
        const edges = this.graph.edges;

        // Create simulation with forces
        this.simulation = d3.forceSimulation(nodes)
            .force("link", d3.forceLink(edges).id(d => d.get_id()))
            //.force("charge", d3.forceManyBody())
            .force("center", d3.forceCenter())
            .on("tick", ticked);



        function ticked() {
            for (let edge of edges) {
                d3.select("#edge-" + edge.get_id())
                    .attr("x1", edge.get_source_vertex().x)
                    .attr("y1", edge.get_source_vertex().y)
                    .attr("x2", edge.get_target_vertex().x)
                    .attr("y2", edge.get_target_vertex().y);
            }
            for (let node of nodes) {
                d3.select("#node-" + node.get_id())
                    .attr("cx", node.x)
                    .attr("cy", node.y);
            }
        }
    }

    initializeRadialLayout() {
        // Radial layout: ego at center, nodes arranged in concentric circles by depth
        const centerX = 50;
        const centerY = 25;
        const nodes = this.graph.nodes.filter(node => node.get_depth() <= this.graph.get_depth());
        const maxDepth = Math.max(...nodes.map(n => n.get_depth()));

        // Group nodes by depth
        const depthGroups = {};
        for (let node of nodes) {
            const depth = node.get_depth();
            if (!depthGroups[depth]) depthGroups[depth] = [];
            depthGroups[depth].push(node);
        }

        // Position nodes
        for (let depth in depthGroups) {
            const nodes = depthGroups[depth];
            const radius = (parseFloat(depth) / maxDepth) * 20;
            const angleStep = (2 * Math.PI) / nodes.length;

            nodes.forEach((node, i) => {
                const angle = i * angleStep;
                node.x = centerX + radius * Math.cos(angle);
                node.y = centerY + radius * Math.sin(angle);
                node.vx = 0;
                node.vy = 0;
            });
        }
    }

    setLayoutType(type) {
        this.layoutType = type;
        this.initializeLayout();
    }

    getSimulation() {
        return this.simulation;
    }
}
