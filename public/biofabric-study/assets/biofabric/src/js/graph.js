"use strict";
import { Vertex } from './vertex.js';
import { State } from './state.js';
import { Edge } from './edge.js';

export class Graph {
    // Constructor
    constructor(data) {
        this.edges = [];
        this.nodes = [];
        this.depth = 10;
        // Load Data
        this.load_data(data);
        // Construct the Ego Network
        this.ego = this.nodes[0];
        this.construct_grouped_network();
        // Sort Nodes Based on Hop + Weighted Distanced to Ego
        this.identify_singleton_nodes();
        this.identify_singleton_edges();
        this.sort_nodes();
    }

    set_ego(node) {
        this.ego = node;
    }

    change_ego_and_reconstruct(node) {
        this.set_ego(node);
        this.construct_grouped_network();
        //this.identify_singleton_nodes();
        //this.identify_singleton_edges();
        this.sort_nodes();
    }

    // Populate Edges and Nodes from Dataset
    // load from json object with nodes and links
    load_data(data) {
        const nodes = data.nodes;
        for (let node of nodes) {
            this.nodes.push(new Vertex(node.id, node.label, { "group": node.group, "level": node.level }));
        }

        const links = data.links;
        let edgeCounter = 0;
        for (let link of links) {
            let sourceVertex = this.nodes.find(n => n.id == link.source);
            let targetVertex = this.nodes.find(n => n.id == link.target);
            if (sourceVertex == undefined || targetVertex == undefined) {
                throw new Error("Source or Target not found in node list!");
            }
            edgeCounter++;
            let newEdge = new Edge(edgeCounter.toString(), sourceVertex, targetVertex, { "group": link.group, "weight": link.weight, "label": link.label });
            this.edges.push(newEdge);
        }
    }

    find_path_to_ego(node) {
        let path = [];
        let currentNode = node;
        while (currentNode.get_id() != this.ego.get_id()) {
            path.push(currentNode);
            let nextNode = currentNode.get_adjacency().find(neighbor => neighbor.get_depth() < currentNode.get_depth());
            if (!nextNode) {
                throw new Error("No path to ego found!");
            }
            currentNode = nextNode;
        }
        path.push(this.ego);
        return path.reverse();
    }

    get_incident_edges(node) {
        return this.edges.filter(edge => edge.has_node_id(node.get_id()));
    }

    identify_singleton_nodes() {
        let depths = [...new Set(this.nodes.map(node => node.get_depth()))];
        for (let depth of depths) {
            let depthNodes = this.nodes.filter(node => node.get_depth() == depth);
            if (depthNodes.length != 1) {
                continue;
            }
            depthNodes[0].set_state(State.Singleton);
        }
    }
    identify_singleton_edges() {
        let depths = [...new Set(this.edges.map(edge => edge.get_depth()))];
        for (let depth of depths) {
            let depthEdges = this.edges.filter(edge => edge.get_depth() == depth);
            if (depthEdges.length != 1) {
                continue;
            }
            depthEdges[0].set_state(State.Singleton);
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
                let adjacency = neighborIDs.map(nodeID => this.nodes.find(node => node.id == nodeID)).filter(node => {
                    if (!node) {
                        throw new Error("Node is Undefined!");
                    }; return node != undefined;
                });
                vertex.set_adjacency(adjacency);
                // Iterate over node in Adjacency
                for (let neighbor of adjacency) {
                    // Set Depth of Neighbor
                    neighbor.set_depth(neighbor.depth < vertex.depth + 1 ? neighbor.depth : vertex.depth + 1);
                    // Get weight of neighbor node
                    let neighborWeight = (_a = this.edges.find(edge => edge.has_node_id(neighbor.get_id()) && edge.has_node_id(vertex.get_id()))) === null || _a === void 0 ? void 0 : _a.attrs.weight;
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

    construct_grouped_network() {
        this.nodes.map(node => node.reset());
        this.edges.map(edge => edge.reset());

        let nodeGroupMap = new Map();
        for (let node of this.nodes) {
            let group = node.attrs.group;
            if (!nodeGroupMap.has(group)) {
                nodeGroupMap.set(group, []);
            }
            nodeGroupMap.get(group).push(node);
        }

        let depthCounter = 0;
        for (let [group, nodes] of nodeGroupMap.entries()) {
            for (let node of nodes) {
                node.set_depth(depthCounter);
                // I'm unsure for what these values are used, but they are set in the construct_ego_network code, so I will keep them here.
                node.set_incidence(this.edges.filter(edge => edge.has_node_id(node.id)));
                let neighborIDs = node.incidence.map(edge => edge.get_endpoint_ids()).flat(1).filter(nodeID => node.get_id() != nodeID);
                let adjacency = neighborIDs.map(nodeID => this.nodes.find(node => node.id == nodeID)).filter(node => node != undefined && node.attrs.group === group);
                node.set_adjacency(adjacency);
            }

            depthCounter++;
        }

        let edgeGroupMap = new Map();
        for (let edge of this.edges) {
            let group = edge.attrs.group;
            if (!edgeGroupMap.has(group)) {
                edgeGroupMap.set(group, []);
            }
            edgeGroupMap.get(group).push(edge);
        }

        // sort keys in case they indicate a ego network depth
        let keys = Array.from(edgeGroupMap.keys());
        keys.sort((a, b) => {
            return a-b;
        });

        let depthCounterEdges = 0;
        for (let key of keys) {
            let edges = edgeGroupMap.get(key);
            for (let edge of edges) {
                edge.set_depth(depthCounterEdges);
            }
            depthCounterEdges++;
        }
    }

    // Construct the Ego Network for the Given Selected Root Node
    construct_ego_network() {
        // Reset the Ego Network
        this.nodes.map(node => node.reset());
        this.edges.map(edge => edge.reset());
        this.ego.set_depth(0);
        // Traverse the Network for newly selected ego
        this.breadth_first_search();
        // Iterate over Edges and Set Edge Depth
        for (let edge of this.edges) {
            // Get Source and Target from Node List
            let source = edge.get_source_vertex();
            let target = edge.get_target_vertex();
            // Set Edge Depth as Function of its Incident Nodes' Depths
            edge.set_depth((source.depth == target.depth) ? source.depth : ((source.depth + target.depth) / 2));
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
