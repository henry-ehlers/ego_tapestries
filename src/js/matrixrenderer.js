"use strict";
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import { State } from './state.js';

export class MatrixRenderer {

    constructor(matrix, canvasWidth, canvasHeight) {
        this.matrix = matrix;
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;

        this.nodes = this.matrix.graph.nodes;
        this.edges = this.matrix.graph.edges;
    }

    render(svg) {
        const canvasXcenter = this.canvasWidth / 2;
        const canvasYcenter = this.canvasHeight / 2;
        const cellSize = 0.5;

        const mainG = svg.append("g");

        // draw matrix cells grid centered on canvas
        const n = this.nodes.length;
        const gridSize = cellSize * n;
        const gridX = canvasXcenter - gridSize / 2;
        const gridY = canvasYcenter - gridSize / 2;


        const gridG = mainG.append("g").attr("id", "grid-g");
        for (let i = 0; i <= n; i++) {
            // draw vertical lines
            gridG.append("line")
                .attr("x1", gridX + i * cellSize)
                .attr("y1", gridY)
                .attr("x2", gridX + i * cellSize)
                .attr("y2", gridY + gridSize)
                .attr("stroke", "lightgray")
                .attr("stroke-width", 0.05);
            // draw horizontal lines
            gridG.append("line")
                .attr("x1", gridX)
                .attr("y1", gridY + i * cellSize)
                .attr("x2", gridX + gridSize)
                .attr("y2", gridY + i * cellSize)
                .attr("stroke", "lightgray")
                .attr("stroke-width", 0.05);
        }

        const radius = cellSize / 4 * 1.1;

        // draw circle to the left of the matrix
        const leftNodeG = mainG.append("g").attr("id", "left-node-g");
        let i = 0;

        leftNodeG.selectAll("circle")
            .data(this.nodes)
            .join("circle")
            .attr("cx", gridX - cellSize / 2)
            .attr("cy", () => gridY + i++ * cellSize + cellSize / 2) // closure to keep track of i
            .attr("r", radius)
            .attr("fill", d => d3.schemeObservable10[d.get_depth()])
            .style("cursor", "pointer")
            // change ego
            .on("contextmenu", (event, node) => {
                event.preventDefault();
                this.matrix.change_ego(node);
                svg.selectAll("*").remove();
                this.render(svg);
            })
            .append("title")
            .text(d => d.label);


        const topNodeG = mainG.append("g").attr("id", "top-node-g");
        let j = 0;

        topNodeG.selectAll("circle")
            .data(this.nodes)
            .join("circle")
            .attr("id", d => `node-${d.get_depth()}-${d.get_id()}`)
            .attr("class", d => `node-depth-${d.get_depth()}`)
            .attr("cx", d => {
                // closure can update j
                const x = gridX + j++ * cellSize + cellSize / 2;
                d.set_x(x);
                return x;
            })
            .attr("cy", d => {
                const y = gridY - cellSize / 2;
                d.set_y(y);
                return y;
            })
            .attr("r", radius)
            .attr("fill", d => d3.schemeObservable10[d.get_depth()])
            .style("cursor", "pointer")
            .on("click", (event, d) => {
                const isHighlighted = d.get_highlighted();
                const state = d.get_state();
                if (state === State.Compressed) {
                    // if compressed, highlight all nodes of the same depth
                    const nodes = this.nodes.filter(node => node.get_depth() === d.get_depth());
                    nodes.forEach(node => {
                        node.set_highlighted(!isHighlighted);
                    });
                    topNodeG.selectAll(`.node-depth-${d.get_depth()}`).classed("highlight", !isHighlighted);
                } else {
                    d.get_highlighted() ? d.set_highlighted(false) : d.set_highlighted(true);
                    d3.select(event.currentTarget).classed("highlight", d.get_highlighted());
                }
            })
            .on("contextmenu", (event, d) => {
                event.preventDefault();
                this.matrix.change_ego(d);
                svg.selectAll("*").remove();
                this.render(svg);
            })
            .on("dblclick", (_event, d) => {
                const state = d.get_state();
                const depth = d.get_depth();

                if (state === State.Uncompressed) {
                    // compress nodes and edges of the same depth
                    const nodes = this.nodes.filter(node => node.get_depth() === depth);
                    nodes.forEach(node => {
                        node.set_state(State.Compressed);
                    });
                    svg.selectAll(`.node-depth-${depth}`)
                        .transition()
                        .duration(300)
                        .attr("cx", nodes[0].x)
                        .attr("cy", nodes[0].y);

                    // move edge squares
                    svg.selectAll(".edge-depth-" + depth)
                        .each(d => {
                            d.set_state(State.Compressed);
                        })
                        .transition()
                        .duration(300)
                        .attr("x", nodes[0].x - cellSize / 2 + cellSize / 6);

                } else if (state === State.Compressed) {
                    // uncompress nodes and edges of the same depth
                    const nodes = this.nodes.filter(node => node.get_depth() === depth);
                    nodes.forEach(node => {
                        node.set_state(State.Uncompressed);
                    });
                    topNodeG.selectAll(`.node-depth-${depth}`)
                        .transition()
                        .duration(300)
                        .attr("cx", d => d.x)
                        .attr("cy", d => d.y);

                    // move edge squares back to original position
                    svg.selectAll(`.edge-depth-${depth}`)
                        .each(d => {
                            d.set_state(State.Uncompressed);
                        }
                        ).transition()
                        .duration(300)
                        .attr("x", d => d.get_x());
                }
            })
            .append("title")
            .text(d => d.label);

        const edgeG = mainG.append("g").attr("id", "edge-g");
        const lowerEdgeG = edgeG.append("g").attr("id", "lower-edge-g");
        const upperEdgeG = edgeG.append("g").attr("id", "upper-edge-g");

        lowerEdgeG.selectAll("rect")
            .data(this.edges.map(edge => edge.clone())) // clone edges to avoid modifying original edges when setting x and y
            .join("rect")
            .attr("class", d => `edge-depth-${d.endpoints[1].get_depth()}`)
            .attr("x", d => {
                const targetIndex = this.nodes.indexOf(d.endpoints[1]);
                const x = gridX + targetIndex * cellSize + cellSize / 6;
                d.set_x(x);
                return x;
            })
            .attr("y", d => {
                const sourceIndex = this.nodes.indexOf(d.endpoints[0]);
                const y = gridY + sourceIndex * cellSize + cellSize / 6;
                d.set_y(y);
                return y;
            })
            .attr("width", cellSize * 2 / 3)
            .attr("height", cellSize * 2 / 3)
            .attr("rx", cellSize / 6)
            .attr("ry", cellSize / 6)
            .attr("fill", d => d.get_depth() % 1 == 0.5 ? "#333" : d3.schemeObservable10[d.get_depth()]);

        upperEdgeG.selectAll("rect")
            .data(this.edges.map(edge => edge.clone())) // clone edges to avoid modifying original edges when setting x and y
            .join("rect")
            .attr("class", d => `edge-depth-${d.endpoints[0].get_depth()}`)
            .attr("x", d => {
                const sourceIndex = this.nodes.indexOf(d.endpoints[0]);
                const x = gridX + sourceIndex * cellSize + cellSize / 6;
                d.set_x(x);
                return x;
            })
            .attr("y", d => {
                const targetIndex = this.nodes.indexOf(d.endpoints[1]);
                const y = gridY + targetIndex * cellSize + cellSize / 6;
                d.set_y(y);
                return y;
            })
            .attr("width", cellSize * 2 / 3)
            .attr("height", cellSize * 2 / 3)
            .attr("rx", cellSize / 6)
            .attr("ry", cellSize / 6)
            .attr("fill", d => d.get_depth() % 1 == 0.5 ? "#333" : d3.schemeObservable10[d.get_depth()]);
    }
}
