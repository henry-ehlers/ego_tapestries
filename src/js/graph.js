"use strict";
class Graph {
    // Constructor
    constructor(data) {
        this.edges = [];
        this.nodes = [];
        this.depth = 2;
        this.load_data(data);
        this.ego = this.nodes[0];
        this.construct_ego_network();
    }
    // Populate Edges and Nodes from Dataset
    load_data(data) {
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
            let source = this.nodes.find(n => n.label == entry.source);
            let target = this.nodes.find(n => n.label == entry.target);
            // Check that Source and Target ID's exist in node list
            if (source == undefined || target == undefined) {
                throw new Error("Source or Target not found in node list!");
            }
            // Check if Edge already exists in Edge list
            if (!this.edges.find(e => e.has_node_id(source.get_id()) && e.has_node_id(target.get_id()))) {
                // Create new Edge and Add to Edge list
                let edgeID = edgeCounter++;
                let newEdge = new Edge(edgeID.toString(), source, target, entry.weight);
                this.edges.push(newEdge);
            }
        }
    }
    // Breadth First Search
    breadth_first_search() {
        var _a;
        // Initialize Queue, Visited, Results, and Shortest Paths
        let queue = [this.ego];
        let visited = new Set();
        let result = [];
        let shortestPaths = {};
        // Initialize the shortest path for the ego
        shortestPaths[this.ego.get_id()] = 0;
        // While vertices exist in the Queue
        while (queue.length) {
            // Get Next Vertex in Queue
            let vertex = queue.shift();
            if (vertex == undefined) {
                throw new Error("BFS: vertex in queue is undefined!");
            }
            // If the Vertex Has not Yet been visited
            if (!visited.has(vertex)) {
                // Add Current Node to visited and results
                visited.add(vertex);
                result.push(vertex);
                // Get Vertex Incidence and Neighbors
                vertex.set_incidence(this.edges.filter(edge => edge.has_node_id(vertex.id)));
                let neighborIDs = vertex.incidence.map(edge => edge.get_endpoint_ids()).flat(1).filter(nodeID => vertex.get_id() != nodeID);
                let adjacency = neighborIDs.map(nodeID => this.nodes.find(node => node.id == nodeID)).filter(node => { if (!node) {
                    throw new Error("Node is Undefined!");
                } ; return node != undefined; });
                vertex.set_adjacency(adjacency);
                // Iterate over node in Adjacency
                for (let neighbor of adjacency) {
                    // Set Depth of Neighbor
                    neighbor.set_depth(neighbor.depth < vertex.depth + 1 ? neighbor.depth : vertex.depth + 1);
                    // Get weight of neighbor node
                    let neighborWeight = (_a = this.edges.find(edge => edge.has_node_id(neighbor.get_id()) && edge.has_node_id(vertex.get_id()))) === null || _a === void 0 ? void 0 : _a.weight;
                    if (!neighborWeight) {
                        throw new Error("Weight is undefined!");
                    }
                    // Calculcate Shortest Paths
                    if (neighbor.depth == vertex.depth - 1) {
                        if (shortestPaths[vertex.get_id()] == undefined) {
                            shortestPaths[vertex.get_id()] = shortestPaths[neighbor.get_id()] + neighborWeight;
                        }
                        if (shortestPaths[vertex.get_id()] < shortestPaths[neighbor.get_id()] + neighborWeight)
                            shortestPaths[vertex.get_id()] = shortestPaths[neighbor.get_id()] + neighborWeight;
                    }
                    // Add neighbor to Queue
                    queue.push(neighbor);
                }
            }
        }
        // FIX THIS LATER
        for (let node of this.nodes) {
            node.set_distance(shortestPaths[node.get_id()]);
        }
    }
    // Construct the Ego Network for the Given Selected Root Node
    construct_ego_network() {
        // Reset the Ego Network
        this.nodes.map(node => node.reset());
        this.edges.map(edge => edge.reset());
        this.ego.depth = 0;
        // Traverse the Network for newly selected ego
        this.breadth_first_search();
        // Iterate over Edges and Set Edge Depth
        for (let edge of this.edges) {
            // Get Source and Target from Node List
            let source = edge.get_source();
            let target = edge.get_target();
            // Set Edge Depth as Function of its Incident Nodes' Depths
            edge.depth = (source.depth == target.depth) ? source.depth : ((source.depth + target.depth) / 2);
        }
    }
    // Get a Node from the Node list using its unique ID
    get_node_from_id(nodeID) {
        let node = this.nodes.find(n => n.id == nodeID);
        if (node == undefined) {
            throw new Error("Node ID not found");
        }
        else {
            return node;
        }
    }
    sort_nodes() {
        this.nodes.sort((nodeA, nodeB) => {
            if (nodeA.get_depth() > nodeB.get_depth()) {
                return 1;
            }
            else if (nodeA.get_depth() < nodeB.get_depth()) {
                return -1;
            }
            else {
                if (nodeA.get_distance() > nodeB.get_distance()) {
                    return -1;
                }
                else if (nodeA.get_distance() < nodeB.get_distance()) {
                    return 1;
                }
                else {
                    return 0;
                }
            }
        });
    }
    get_depth() {
        return this.depth;
    }
}
