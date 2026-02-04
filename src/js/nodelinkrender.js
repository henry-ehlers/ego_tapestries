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
        this.nodes.forEach(node => {
            node.x = 0;
            node.y = 0;
        });
    }

    render(svg) {
        let mainG = svg.append("g");

        const edgeWidth = 0.1;
        const nodeRadius = 0.3;

        // node-link simulation
        let simulation = d3.forceSimulation(this.nodes)
            .force("link", d3.forceLink(this.edges).id(d => d.get_id()).strength(1.5).distance(1.5))
            .force("charge", d3.forceManyBody().strength(-2))
            .force("center", d3.forceCenter(this.canvasWidth / 2, this.canvasHeight / 2))
            .on("tick", ticked);

        // different forces for radial layout
        if (this.nodelink.layoutType === "radial") {
            const radiusBase = Math.min(this.canvasWidth, this.canvasHeight);
            const canvasXcenter = this.canvasWidth / 2;
            const canvasYcenter = this.canvasHeight / 2;

            simulation = d3.forceSimulation(this.nodes)
                .force("link", d3.forceLink(this.edges).id(d => d.get_id()).strength(0.6).distance(1.5))
                .force("charge", d3.forceManyBody().strength(-1))

                // Use custom radial force to pull nodes into concentric circles based on depth
                .force("radius0", customRadialForce(radiusBase / 32, canvasXcenter, canvasYcenter, 0).strength(5))
                .force("radius1", customRadialForce(radiusBase / 20, canvasXcenter, canvasYcenter, 1).strength(5))
                .force("radius2", customRadialForce(radiusBase / 14, canvasXcenter, canvasYcenter, 2).strength(7))
                .force("radius3", customRadialForce(radiusBase / 5, canvasXcenter, canvasYcenter, 3).strength(6))
                .force("radius4", customRadialForce(radiusBase / 3, canvasXcenter, canvasYcenter, 4).strength(6))
                .force("radius5", customRadialForce(radiusBase / 2.5, canvasXcenter, canvasYcenter, 5).strength(6))

                .on("tick", ticked);
        }

        if (this.nodelink.layoutType === "layered") {
            const layerHeight = this.canvasHeight / (d3.max(this.nodes, d => d.get_depth()) + 1) * 0.9;

            // draw dashed lines for layers
            for (let depth = 0; depth <= d3.max(this.nodes, d => d.get_depth()); depth++) {
                mainG.append("line")
                    .attr("x1", 0 + this.canvasWidth * 0.1)
                    .attr("y1", layerHeight * (depth + 0.5))
                    .attr("x2", this.canvasWidth - this.canvasWidth * 0.1)
                    .attr("y2", layerHeight * (depth + 0.5))
                    .attr("stroke", "#c5c5c5")
                    .attr("stroke-width", 0.05)
                    .attr("stroke-dasharray", "2,3")
                    .attr("stroke-linecap", "round");
            }

            simulation = d3.forceSimulation(this.nodes)
                .force("link", d3.forceLink(this.edges).id(d => d.get_id()).strength(1).distance(0.5))
                .force("charge", d3.forceManyBody().strength(-3))
                .force("x", d3.forceX(this.canvasWidth / 2).strength(0.2))


                // Use custom Y force to pull nodes into horizontal layers based on depth
                .force("yLayer0", customYforce(layerHeight * 0.5, 0).strength(6))
                .force("yLayer1", customYforce(layerHeight * 1.5, 1).strength(6))
                .force("yLayer2", customYforce(layerHeight * 2.5, 2).strength(8))
                .force("yLayer3", customYforce(layerHeight * 3.5, 3).strength(7))
                .force("yLayer4", customYforce(layerHeight * 4.5, 4).strength(7))
                .force("yLayer5", customYforce(layerHeight * 5.5, 5).strength(6))

                .on("tick", ticked);
        }

        const link = mainG.append("g")
            .attr("stroke", "#c5c5c5")
            .attr("stroke-opacity", 0.6)
            .attr("stroke-width", edgeWidth)
            .selectAll("line")
            .data(this.edges)
            .join("line");

        const node = mainG.append("g")
            .attr("fill", "#15ff00")
            .selectAll("circle")
            .data(this.nodes)
            .join("circle")
            .attr("r", nodeRadius)
            .call(drag(simulation));

        // adjust colors based on depth
        node.attr("fill", ({ index: i }) => ((this.nodes[i].get_depth() % 1) == 0.5) ? "#333" : d3.schemeObservable10[this.nodes[i].get_depth()]);
        link.attr("stroke", ({ index: i }) => d3.schemeObservable10[this.edges[i].get_depth()]);

        function ticked() {
            link
                .attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);

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
}
