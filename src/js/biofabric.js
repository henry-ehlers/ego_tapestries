"use strict";
class BioFabric {
    constructor(graph) {
        //
        this.graph = graph;
        //
        this.sort_edges_degreescending();
        //
        this.calculate_node_y_coordinates();
        this.calculate_edge_x_coordinates();
    }
    get_edge_length(edge) {
        let source_index = this.graph.nodes.indexOf(edge.get_source());
        let target_index = this.graph.nodes.indexOf(edge.get_target());
        return Math.abs(source_index - target_index);
    }
    get_topmost_node_index(edge) {
        let source_index = this.graph.nodes.indexOf(edge.get_source());
        let target_index = this.graph.nodes.indexOf(edge.get_target());
        return Math.min(source_index, target_index);
    }
    get_bottommost_node_index(edge) {
        let source_index = this.graph.nodes.indexOf(edge.get_source());
        let target_index = this.graph.nodes.indexOf(edge.get_target());
        return Math.max(source_index, target_index);
    }
    sort_edges_degreescending() {
        this.graph.edges.sort((edgeA, edgeB) => {
            if (edgeA.get_depth() > edgeB.get_depth()) {
                return 1;
            }
            else if (edgeA.get_depth() < edgeB.get_depth()) {
                return -1;
            }
            else {
                let aIndex = this.get_topmost_node_index(edgeA);
                let bIndex = this.get_topmost_node_index(edgeB);
                if (aIndex < bIndex) {
                    return -1;
                }
                else if (aIndex > bIndex) {
                    return 1;
                }
                else {
                    let edgeALength = this.get_edge_length(edgeA);
                    let edgeBLength = this.get_edge_length(edgeB);
                    if (edgeALength > edgeBLength) {
                        return 1;
                    }
                    else if (edgeALength < edgeBLength) {
                        return -1;
                    }
                    else {
                        return 0;
                    }
                }
            }
        });
    }
    calculate_node_y_coordinates() {
        // Determine the Depths Nodes in the Drawing
        let nodeDepths = [...new Set(this.graph.nodes.filter(node => node.get_depth() <= this.graph.get_depth()).map(node => node.get_depth()))];
        let uncompressedNodes = this.graph.nodes.filter(node => node.get_depth() <= this.graph.get_depth()).filter(node => node.get_state() == State.Uncompressed);
        // Calculcate the Spacing of Node's Y coordinate in percentage of available space
        let verticalSpacingRatio = 1;
        let depthSpaceRatio = 2;
        let spacing = 0.95 / ((verticalSpacingRatio * (uncompressedNodes.length)) + (depthSpaceRatio * (nodeDepths.length) - 1));
        let verticalspace = verticalSpacingRatio * spacing;
        let depthspace = depthSpaceRatio * spacing;
        // Calculate Nodes' Y Positions depending on Previous Node
        for (let nodeIndex = 0; nodeIndex < this.graph.nodes.filter(node => node.get_depth() <= this.graph.get_depth()).length; nodeIndex++) {
            let y = Infinity;
            if (nodeIndex == 0) {
                y = 0;
            }
            else {
                if (this.graph.nodes[nodeIndex - 1].get_depth() == this.graph.nodes[nodeIndex].get_depth()) {
                    if (this.graph.nodes[nodeIndex].get_state() == State["Fully Compressed"]) {
                        y = this.graph.nodes[nodeIndex - 1].get_y();
                    }
                    else {
                        y = this.graph.nodes[nodeIndex - 1].get_y() + verticalspace;
                    }
                }
                else {
                    y = this.graph.nodes[nodeIndex - 1].get_y() + depthspace;
                }
            }
            // Set Y Coordinate
            this.graph.nodes[nodeIndex].set_y(y);
        }
    }
    calculate_edge_x_coordinates() {
        // Determine Unique Compressed and Uncompressed Edges
        let uncompressedEdges = this.graph.edges.filter(edge => edge.get_state() == State.Uncompressed && edge.get_depth() <= this.graph.get_depth());
        let fullyCompressedEdges = this.graph.edges.filter(edge => edge.get_state() == State["Fully Compressed"] && edge.get_depth() <= this.graph.get_depth());
        // Get Unique Partially Compressed Edges' Origin Nodes
        let partiallyCompressedEdges = this.graph.edges.filter(edge => edge.get_state() == State["Partially Compressed"] && edge.get_depth() <= this.graph.get_depth());
        let partialEdgeNodeTops = new Set();
        for (let edge of partiallyCompressedEdges) {
            let topMostNodeIndex = this.get_topmost_node_index(edge);
            partialEdgeNodeTops.add(topMostNodeIndex);
        }
        // Calculate Spacing
        let nUncompressedEdges = uncompressedEdges.length;
        let nFullyCompressedEdges = fullyCompressedEdges.length;
        let nPartiallyCompressedEdges = [...partialEdgeNodeTops].length;
        let spacing = 0.99 / ((nUncompressedEdges - 1));
        let horizontalspace = 1 * spacing;
        let depthpadding = 1 * spacing;
        // Iterate over all Edges and Set x coordinate as function of previous edge's x coodinat
        for (let edgeIndex = 0; edgeIndex < this.graph.edges.filter(edge => edge.get_depth() <= this.graph.get_depth()).length; edgeIndex++) {
            let x = undefined;
            if (edgeIndex == 0) {
                x = 0;
            }
            else {
                if (this.graph.edges[edgeIndex].get_state() == State["Fully Compressed"]) {
                    x = this.graph.edges[edgeIndex - 1].get_x();
                }
                else if (this.graph.edges[edgeIndex].get_state() == State.Uncompressed) {
                    x = this.graph.edges[edgeIndex - 1].get_x() + horizontalspace;
                }
                else {
                    if (this.graph.edges[edgeIndex].get_depth() != this.graph.edges[edgeIndex - 1].get_depth()) {
                        x = this.graph.edges[edgeIndex - 1].get_x() + horizontalspace;
                    }
                    else {
                        let currtopMostNode = this.get_topmost_node_index(this.graph.edges[edgeIndex]);
                        let prevtopMostNode = this.get_topmost_node_index(this.graph.edges[edgeIndex - 1]);
                        if (currtopMostNode == prevtopMostNode) {
                            x = this.graph.edges[edgeIndex - 1].get_x();
                        }
                        else {
                            x = this.graph.edges[edgeIndex - 1].get_x() + horizontalspace;
                        }
                    }
                }
                if (this.graph.edges[edgeIndex - 1].get_depth() != this.graph.edges[edgeIndex].get_depth()) {
                    x += depthpadding;
                }
            }
            this.graph.edges[edgeIndex].set_x(x);
        }
    }
}
