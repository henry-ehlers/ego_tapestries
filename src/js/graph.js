"use strict";
class Graph {
    constructor(data) {
        this.edges = [];
        this.nodes = [];
        this.load_data(data);
    }
    // Populate Edges and Nodes from Dataset
    load_data(data) {
        var _a, _b;
        // Initialize IDs of edges and nodes
        let nodeCounter = 0;
        let edgeCounter = 0;
        // Iterate over Entries in Dataset
        for (let entry of data) {
            // If Edge Source Node Doesn't Exist -> Add
            if (!this.nodes.find(n => n.label == entry.source)) {
                let nodeID = nodeCounter++;
                this.nodes.push(new Vertex(nodeID.toString(), entry.source));
            }
            // If Edge Target Node Doesn't Exist -> Add
            if (!this.nodes.find(n => n.label == entry.target)) {
                let nodeID = nodeCounter++;
                this.nodes.push(new Vertex(nodeID.toString(), entry.target));
            }
            // Get Source and Target ID's from Node List
            let sourceID = (_a = this.nodes.find(n => n.label == entry.source)) === null || _a === void 0 ? void 0 : _a.get_id();
            let targetID = (_b = this.nodes.find(n => n.label == entry.target)) === null || _b === void 0 ? void 0 : _b.get_id();
            // Check that Source and Target ID's exist in node list
            if (sourceID == undefined || targetID == undefined) {
                throw new Error("SourceID or TargetID not found in node list!");
            }
            // Check if Edge already exists in Edge list
            if (!this.edges.find(e => e.has_node_id(sourceID) && e.has_node_id(targetID))) {
                // Create new Edge and Add to Edge list
                let edgeID = edgeCounter++;
                let newEdge = new Edge(edgeID.toString(), sourceID, targetID, entry.weight);
                this.edges.push(newEdge);
            }
        }
    }
}
