"use strict";
class Edge {
    constructor(id, sourceID, targetID, weight) {
        this.id = id;
        this.endpoints = [sourceID, targetID];
        this.weight = weight;
    }
    // Get the Edge's Unique ID
    get_id() {
        return this.id;
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
}
