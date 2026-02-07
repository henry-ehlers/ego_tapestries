"use strict";
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import customRadialForce from './customradialforce.js';
import customYforce from "./customYforce.js";

export class NodeLinkRenderer {

    constructor(nodelink, canvasWidth, canvasHeight) {
        this.nodelink = nodelink;
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;

        this.nodes = this.nodelink.graph.nodes;
        this.edges = this.nodelink.graph.edges;

        // AHHH I LOVE IT. Took me hours to figure out.
        // Default values are infinity for x and y in node and edge classes.
        // If left unchanged, d3 will try to do math with infinity and result in NaN positions.
        this.nodes.forEach(n => {
            n.x = this.canvasWidth / 2 + Math.random() * 10;
            n.y = this.canvasHeight / 2 - Math.random() * 100;
        });
    }

    render(svg) {
        const edgeWidth = 0.1;
        const nodeRadius = 0.3;
        let mainG = svg.append("g");

        // force layout
        let simulation = this.initializeForceSimulation(mainG);
        // attach ticked function to update positions on each tick of the simulation
        simulation.on("tick", ticked);

        const link = mainG.append("g")
            .attr("stroke", "#9c9c9c")
            .attr("stroke-opacity", 0.6)
            .attr("stroke-width", edgeWidth)
            .selectAll("line")
            .data(this.edges)
            .join("line");

        const arc = mainG.append("g")
            .attr("fill", "none")
            .attr("stroke", "none")
            .attr("stroke-opacity", 0.6)
            .attr("stroke-width", edgeWidth)
            .selectAll("path")
            .data(this.edges)
            .join("path");

        const node = mainG.append("g")
            .attr("fill", "#15ff00")
            .selectAll("circle")
            .data(this.nodes)
            .join("circle")
            .attr("r", nodeRadius)
            .call(drag(simulation));

        // adjust colors based on depth
        node.attr("fill", ({ index: i }) => ((this.nodes[i].get_depth() % 1) == 0.5) ? "#333" : d3.schemeObservable10[this.nodes[i].get_depth()]);
        // links between different depths are gray lines. arcs are in color within same depth.
        link.attr("stroke", ({ index: i }) => (this.edges[i].get_depth() % 1) === 0.5 ? "#9c9c9c" : "none");
        arc.attr("stroke", ({ index: i }) => d3.schemeObservable10[this.edges[i].get_depth()]);

        function ticked() {
            link
                .attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);

            arc.attr("d", d => {
                const dx = d.target.x - d.source.x;
                const dy = d.target.y - d.source.y;
                const dr = Math.sqrt(dx * dx + dy * dy) * 0.8;
                return `M${d.source.x},${d.source.y} A${dr},${dr} 0 0,1 ${d.target.x},${d.target.y}`;
            });

            node
                .attr("cx", d => d.x)
                .attr("cy", d => d.y);
        }

        function drag(simulation) {
            function dragstarted(event) {
                if (!event.active) simulation.alphaTarget(0.3).restart();
                event.subject.fx = event.subject.x;
                event.subject.fy = event.subject.y;
            }

            function dragged(event) {
                event.subject.fx = event.x;
                event.subject.fy = event.y;
            }

            function dragended(event) {
                if (!event.active) simulation.alphaTarget(0);
                event.subject.fx = null;
                event.subject.fy = null;
            }

            return d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended);
        }

        const zoom = d3.zoom()
            .scaleExtent([0.5, 5])
            .on("zoom", (event) => {
                mainG.attr("transform", event.transform);
            });

        svg.call(zoom);
    }

    initializeForceSimulation(mainG) {
        switch (this.nodelink.layoutType) {
            case "force":
                return this.initializeDefaultForceLink();
            case "radial":
                return this.initializeRadialLayout(mainG);
            case "layered":
                return this.initializeLayeredLayout(mainG);
            default:
                console.warn("Unknown layout type. Defaulting to force-directed.");
                return this.initializeDefaultForceLink();
        }
    }

    initializeLayeredLayout(mainG) {
        const layerHeight = this.canvasHeight / (d3.max(this.nodes, d => d.get_depth()) + 1) * 0.9;

        // draw dashed lines for layers
        const depth_lines = mainG.append("g");
        for (let depth = 0; depth <= d3.max(this.nodes, d => d.get_depth()); depth++) {
            const y = layerHeight * (depth + 0.5);
            depth_lines.append("line")
                .attr("x1", 0 + this.canvasWidth * 0.1)
                .attr("y1", y)
                .attr("x2", this.canvasWidth - this.canvasWidth * 0.1)
                .attr("y2", y)
                .attr("stroke", "#c5c5c5")
                .attr("stroke-width", 0.05)
                .attr("stroke-dasharray", "0.5,0.5")
                .attr("stroke-linecap", "round");
        }

        const simulation = d3.forceSimulation(this.nodes)
            .force("link", d3.forceLink(this.edges).id(d => d.get_id()).strength(0.05).distance(2))
            .force("charge", d3.forceManyBody().strength(-0.5))
            .force("x", d3.forceX(this.canvasWidth / 2).strength(0.05))

            // Use custom Y force to pull nodes into horizontal layers based on depth
            .force("yLayer0", customYforce(layerHeight * 0.5, 0).strength(1.5))
            .force("yLayer1", customYforce(layerHeight * 1.5, 1).strength(1.5))
            .force("yLayer2", customYforce(layerHeight * 2.5, 2).strength(1.5))
            .force("yLayer3", customYforce(layerHeight * 3.5, 3).strength(1.5))
            .force("yLayer4", customYforce(layerHeight * 4.5, 4).strength(1.5))
            .force("yLayer5", customYforce(layerHeight * 5.5, 5).strength(1.5));

        simulation.alphaTarget(0.5).restart();
        return simulation;
    }

    initializeRadialLayout(mainG) {
        const canvasXcenter = this.canvasWidth / 2;
        const canvasYcenter = this.canvasHeight / 2;

        const maxDepth = d3.max(this.nodes, d => d.get_depth());
        const radiusBase = Math.min(this.canvasWidth, this.canvasHeight / 2) * 1.2;
        const radiusPerDepth = radiusBase / (maxDepth + 1);

        // draw concentric circles for depth levels
        const depth_circles = mainG.append("g");
        for (let depth = 1; depth <= maxDepth; depth++) {
            depth_circles.append("circle")
                .attr("cx", canvasXcenter)
                .attr("cy", canvasYcenter)
                .attr("r", radiusPerDepth * (depth))
                .attr("stroke", "#c5c5c5")
                .attr("stroke-width", 0.05)
                .attr("stroke-dasharray", "0.5,0.5")
                .attr("fill", "none");
        }

        const simulation = d3.forceSimulation(this.nodes)
            .force("link", d3.forceLink(this.edges).id(d => d.get_id()).strength(0.05).distance(2))
            .force("charge", d3.forceManyBody().strength(-0.5))

            // Use custom radial force to pull nodes into concentric circles based on depth
            .force("radius0", customRadialForce(radiusPerDepth * 0, canvasXcenter, canvasYcenter, 0).strength(1.5))
            .force("radius1", customRadialForce(radiusPerDepth * 1, canvasXcenter, canvasYcenter, 1).strength(1.5))
            .force("radius2", customRadialForce(radiusPerDepth * 2, canvasXcenter, canvasYcenter, 2).strength(1.5))
            .force("radius3", customRadialForce(radiusPerDepth * 3, canvasXcenter, canvasYcenter, 3).strength(1.5))
            .force("radius4", customRadialForce(radiusPerDepth * 4, canvasXcenter, canvasYcenter, 4).strength(1.5))
            .force("radius5", customRadialForce(radiusPerDepth * 5, canvasXcenter, canvasYcenter, 5).strength(1.5));

        simulation.alphaTarget(0.5).restart();
        // promise to set it back to 0 after 3 seconds to allow it to stabilize
        setTimeout(() => {
            simulation.alphaTarget(0);
        }, 4000);
        return simulation;
    }

    initializeDefaultForceLink() {
        return d3.forceSimulation(this.nodes)
            .force("link", d3.forceLink(this.edges).id(d => d.get_id()).strength(1).distance(2.5))
            .force("charge", d3.forceManyBody().strength(-1.5))
            .force("center", d3.forceCenter(this.canvasWidth / 2, this.canvasHeight / 2));
    }
}
