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

        let mainG = svg.append("g");

        // draw matrix cells grid centered on canvas
        const n = this.nodes.length;
        const gridSize = cellSize * n;
        const gridX = canvasXcenter - gridSize / 2;
        const gridY = canvasYcenter - gridSize / 2;

        for (let i = 0; i <= n; i++) {
            // draw vertical lines
            mainG.append("line")
                .attr("x1", gridX + i * cellSize)
                .attr("y1", gridY)
                .attr("x2", gridX + i * cellSize)
                .attr("y2", gridY + gridSize)
                .attr("stroke", "lightgray")
                .attr("stroke-width", 0.05);
            // draw horizontal lines
            mainG.append("line")
                .attr("x1", gridX)
                .attr("y1", gridY + i * cellSize)
                .attr("x2", gridX + gridSize)
                .attr("y2", gridY + i * cellSize)
                .attr("stroke", "lightgray")
                .attr("stroke-width", 0.05);
        }

        // draw colored circles just outside adjacency matrix to indicate nodes and their depth
        const nodeG = mainG.append("g")
        for (let i = 0; i < n; i++) {
            const node = this.nodes[i];
            const depth = node.get_depth();
            const color = d3.schemeObservable10[depth];
            const radius = cellSize / 4 * 1.1;

            // draw circle to the left of the matrix
            nodeG.append("circle")
                .attr("cx", gridX - cellSize / 2)
                .attr("cy", gridY + i * cellSize + cellSize / 2)
                .attr("r", radius)
                .attr("fill", color)
                .style("cursor", "pointer")
                // change ego
                .on("click", () => {
                    this.matrix.change_ego(node);
                    svg.selectAll("*").remove();
                    this.render(svg);
                })
                .append("title")
                .text(node.label);
            // draw circle above the matrix
            nodeG.append("circle")
                .attr("cx", gridX + i * cellSize + cellSize / 2)
                .attr("cy", gridY - cellSize / 2)
                .attr("r", radius)
                .attr("fill", color)
                .style("cursor", "pointer")
                .on("click", () => {
                    this.matrix.change_ego(node);
                    svg.selectAll("*").remove();
                    this.render(svg);
                })
                .append("title")
                .text(node.label);
        }

        // draw squares in cells for edges
        for (let i = 0; i < this.edges.length; i++) {
            const edge = this.edges[i];
            const sourceIndex = this.nodes.indexOf(edge.endpoints[0]);
            const targetIndex = this.nodes.indexOf(edge.endpoints[1]);
            const depth = edge.get_depth();
            const color = depth % 1 == 0.5 ? "#333" : d3.schemeObservable10[depth];

            const length = cellSize * 0.666;

            mainG.append("rect")
                .attr("x", gridX + targetIndex * cellSize + cellSize / 6)
                .attr("y", gridY + sourceIndex * cellSize + cellSize / 6)
                .attr("width", length)
                .attr("height", length)
                .attr("rx", cellSize / 6)
                .attr("ry", cellSize / 6)
                .attr("fill", color);

            // also draw square in transposed position to make matrix symmetric
            mainG.append("rect")
                .attr("x", gridX + sourceIndex * cellSize + cellSize / 6)
                .attr("y", gridY + targetIndex * cellSize + cellSize / 6)
                .attr("width", length)
                .attr("height", length)
                .attr("rx", cellSize / 6)
                .attr("ry", cellSize / 6)
                .attr("fill", color);
        }
    }
}
