"use strict";
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import { State } from './state.js';
import { CompressionMsg } from "./CompressionMsg.js";

const cellSize = 1.0;

export class MatrixRenderer {

    constructor(matrix, canvasWidth, canvasHeight, globalDispatcher = d3.dispatch("highlight", "hover-in", "hover-out", "compression")) { // default dispatcher if not provided, but can be shared across renderers for coordinated interactions
        this.matrix = matrix;
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.globalDispatcher = globalDispatcher;

        this.nodes = this.matrix.graph.nodes;
        this.edges = this.matrix.graph.edges;
    }

    calculate_node_x_coordinate(node) {
        const canvasXcenter = this.canvasWidth / 2;

        const n = this.matrix.effective_node_count();
        const gridSize = cellSize * n;
        const gridX = canvasXcenter - gridSize / 2;

        const virtual_x = node.get_x();
        const x = gridX + virtual_x * cellSize + cellSize / 2;
        return x;
    }

    calculate_gridX() {
        const canvasXcenter = this.canvasWidth / 2;
        const gridX = canvasXcenter - this.calculate_gridsize() / 2;
        return gridX
    }

    calculate_gridsize() {
        const n = this.matrix.effective_node_count();
        const gridSize = cellSize * n;
        return gridSize;
    }

    render(svg) {
        const canvasXcenter = this.canvasWidth / 2;
        const canvasYcenter = this.canvasHeight / 2;

        const n = this.matrix.effective_node_count();
        const gridSize = cellSize * n;
        const gridX = canvasXcenter - gridSize / 2;
        const gridY = canvasYcenter - gridSize / 2;
        const radius = cellSize / 4 * 1.1;

        const mainG = svg.append("g");

        // horizontal lines
        const gridG = mainG.append("g").attr("id", "horizontal-grid-lines-g");
        for (let i = 0; i <= n; i++) {
            gridG.append("line")
                .attr("class", "horizontal-grid-line")
                .attr("x1", gridX)
                .attr("y1", gridY + i * cellSize)
                .attr("x2", gridX + gridSize)
                .attr("y2", gridY + i * cellSize)
                .attr("stroke", "lightgray")
                .attr("stroke-width", 0.05);
        }

        // One group for each column. All nodes and edges are placed into their corresponding group.
        // This allows us to perform transformations on the columns including their children.
        const columnGroups = mainG.append("g")
            .selectAll(".node-group") // Use a class to identify the groups
            .data(this.nodes)
            .join("g")
            .attr("class", "node-group")
            .attr("id", d => `node-group-${d.get_id()}`)
            .attr("transform", d => `translate(${this.calculate_node_x_coordinate(d)}, ${gridY})`);

        const columnNodes = columnGroups.append("circle")
            .attr("id", d => `node-${d.get_id()}`)
            .attr("class", d => `node-depth-${d.get_depth()}`)
            .attr("cx", 0)
            .attr("cy", - cellSize / 2)
            .attr("r", radius)
            .attr("fill", "transparent")
            .attr("stroke", d => d3.schemeObservable10[d.get_depth()])
            .attr("stroke-width", 0.1)
            .style("cursor", "pointer")
            .on("click", (_event, d) => {
                this.globalDispatcher.call("highlight", this, d.get_id());
            })
            .on("contextmenu", (event, d) => {
                event.preventDefault();
                this.matrix.change_ego(d);
                svg.selectAll("*").remove();
                this.render(svg);
            })
            .on("dblclick", (_event, d) => {
                this.globalDispatcher.call("compression", this, new CompressionMsg(d.get_id(), true));
            })
            .on("mouseover", (_event, d) => {
                this.globalDispatcher.call("hover-in", this, d.get_id());
            })
            .on("mouseout", () => {
                this.globalDispatcher.call("hover-out");
            });

        // Dispatcher callbacks for all interactions

        this.globalDispatcher.on("highlight.matrix", (id) => {
            const n = this.nodes.find(n => n.get_id() === id);
            this.matrix.highlight_unh_nodes(n);
            columnNodes.classed("highlight-matrix", d => d.get_highlighted());
        });

        this.globalDispatcher.on("compression.matrix", (msg) => {
            let id;
            
            // extract id from message
            if (!msg.fullcompression) {
                return;
            } else if (msg.type === "string") {
                id = msg.msg;
            } else {
                const depth = msg.msg.get_depth();
                const any_node_of_depth = this.nodes.find(n => n.get_depth() === depth);
                id = any_node_of_depth.get_id();
            }

            const n = this.nodes.find(n => n.get_id() === id);
            // compress and uncompress
            this.matrix.compress_unc_nodes_by_depth(n);
            this.matrix.set_virtual_x_coordinates();
            columnGroups.transition().duration(300)
                .attr("transform", d => `translate(${this.calculate_node_x_coordinate(d)}, ${gridY})`);

            columnNodes.transition().duration(300)
                .attr("fill", d => d.get_state() == State["Fully Compressed"] ? d3.schemeObservable10[d.get_depth()] : "transparent");
            columnNodes.classed("highlight-matrix", d => d.get_highlighted());

            // adjust horizonal lines
            mainG.selectAll(".horizontal-grid-line").transition().duration(300)
                .attr("x1", this.calculate_gridX())
                .attr("x2", this.calculate_gridX() + this.calculate_gridsize());
        });

        this.globalDispatcher.on("hover-in.matrix", (id) => {
            // fade all nodes and edges that are not on the path to ego
            const n = this.nodes.find(n => n.get_id() === id);
            const path_to_ego = this.matrix.graph.find_path_to_ego(n);
            columnNodes.classed("fade-matrix", node => !path_to_ego.includes(node));
            mainG.selectAll(".node-left").classed("fade-matrix", node => !path_to_ego.includes(node));
            mainG.selectAll(".edge-rect").classed("fade-matrix", edge => !(path_to_ego.includes(edge.get_source_vertex()) && path_to_ego.includes(edge.get_target_vertex())));

        });

        this.globalDispatcher.on("hover-out.matrix", () => {
            columnNodes.classed("fade-matrix", false);
            mainG.selectAll(".node-left").classed("fade-matrix", false);
            mainG.selectAll(".edge-rect").classed("fade-matrix", false);
        });

        columnNodes.append("title").text(d => `${d.label}`);

        const columnVertLinesLeft = columnGroups.append("line")
            .attr("class", "vertical-grid-line-left")
            .attr("x1", -1 / 2 * cellSize)
            .attr("y1", 0)
            .attr("x2", -1 / 2 * cellSize)
            .attr("y2", gridSize)
            .attr("stroke", "lightgray")
            .attr("stroke-width", 0.05);

        const columnVertLinesRight = columnGroups.append("line")
            .attr("class", "vertical-grid-line-right")
            .attr("x1", 1 / 2 * cellSize)
            .attr("y1", 0)
            .attr("x2", 1 / 2 * cellSize)
            .attr("y2", gridSize)
            .attr("stroke", "lightgray")
            .attr("stroke-width", 0.05);

        // attach nodes and labels to the left most group
        this.nodes.forEach(node => {
            const firstNodeGroup = mainG.select(`#node-group-${this.nodes[0].get_id()}`)
            firstNodeGroup.append("circle")
                .datum(node)
                .attr("class", "node-left")
                .attr("cx", - cellSize)
                .attr("cy", this.nodes.indexOf(node) * cellSize + cellSize / 2)
                .attr("r", radius)
                .attr("fill", "transparent")
                .attr("stroke", d3.schemeObservable10[node.get_depth()])
                .attr("stroke-width", 0.1);

            firstNodeGroup.append("text")
                .attr("x", -2 * cellSize)
                .attr("y", this.nodes.indexOf(node) * cellSize + cellSize / 2 + radius / 2)
                .attr("text-anchor", "end")
                .attr("font-family", "Arial")
                .attr("font-size", 0.3)
                .text(node.label);
        });

        // append edge rectangles into their corresponding node group,
        // so compression is handled by one single transformation on said node group.
        this.edges.forEach(edge => {
            const sourceIndex = this.nodes.indexOf(edge.endpoints[0]);
            const targetIndex = this.nodes.indexOf(edge.endpoints[1]);
            const sourceId = edge.get_endpoint_ids()[0];
            const targetId = edge.get_endpoint_ids()[1];
            const color = edge.get_depth() % 1 == 0.5 ? "#333" : d3.schemeObservable10[edge.get_depth()];

            mainG.select(`#node-group-${sourceId}`).append("rect")
                .datum(edge)
                .attr("class", "edge-rect")
                .attr("x", -1 / 3 * cellSize)
                .attr("y", targetIndex * cellSize + 1 / 6 * cellSize)
                .attr("width", cellSize * 2 / 3)
                .attr("height", cellSize * 2 / 3)
                .attr("rx", cellSize / 6)
                .attr("ry", cellSize / 6)
                .attr("fill", color);

            mainG.select(`#node-group-${targetId}`).append("rect")
                .datum(edge)
                .attr("class", "edge-rect")
                .attr("x", -1 / 3 * cellSize)
                .attr("y", sourceIndex * cellSize + 1 / 6 * cellSize)
                .attr("width", cellSize * 2 / 3)
                .attr("height", cellSize * 2 / 3)
                .attr("rx", cellSize / 6)
                .attr("ry", cellSize / 6)
                .attr("fill", color);
        });
    }
}
