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

    }

    initializeRadialLayout() {
        // Radial layout: ego at center, nodes arranged in concentric circles by depth
        const centerX = 50;
        const centerY = 25;
        const nodes = this.graph.nodes;
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
            //if (depth > 2) break;
            const nodes = depthGroups[depth];
            const radius = (parseFloat(depth) / maxDepth) * 20;
            const angleStep = (2 * Math.PI) / nodes.length;

            nodes.forEach((node, i) => {
                const angle = i * angleStep;
                //node.fx = centerX + radius * Math.cos(angle);
                // node.fy = centerY + radius * Math.sin(angle);
                node.vx = 0;
                node.vy = 0;
            });
        }
    }

    setLayoutType(type) {
        this.layoutType = type;
        this.initializeLayout();
    }
}
