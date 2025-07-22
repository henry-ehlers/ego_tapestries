"use strict";
class Edge {
    constructor(id, sourceID, targetID, weight) {
        this.depth = Infinity;
        this.state = State.Uncompressed;
        this.id = id;
        this.endpoints = [sourceID, targetID];
        this.weight = weight;
    }
    // Get the Edge's Unique ID
    get_id() {
        return this.id;
    }
    get_endpoints() {
        return this.endpoints;
    }
    // Check if Given Node ID maps to Edge's Endpoints
    has_node_id(nodeID) {
        return this.endpoints.includes(nodeID);
    }
    // Get SourceID
    get_source() {
        return this.endpoints[0];
    }
    // Get TargetID
    get_target() {
        return this.endpoints[1];
    }
    // Reset the Edge (to before the construction of an ego network)
    reset() {
        this.depth = Infinity;
        this.state = State.Uncompressed;
    }
}
