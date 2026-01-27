"use strict";
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

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

        const simulation = d3.forceSimulation(this.nodes)
            .force("link", d3.forceLink(this.edges).id(d => d.get_id()).strength(1).distance(2.5))
            .force("charge", d3.forceManyBody().strength(-1))
            .force("center", d3.forceCenter(this.canvasWidth / 2, this.canvasHeight / 2))
            .on("tick", ticked);

        const link = mainG.append("g")
            .attr("stroke", "#999")
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
        node.attr("fill", ({index: i}) => ((this.nodes[i].get_depth() % 1) == 0.5) ? "#333" : d3.schemeObservable10[this.nodes[i].get_depth()]);
        link.attr("stroke", ({index: i}) => d3.schemeObservable10[this.edges[i].get_depth()]);

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

    update() {
        // Placeholder for future updates
    }
}
